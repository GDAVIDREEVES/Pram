import { useState, useEffect, useCallback } from 'react';
import { getSupabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import type { Message, MeetupAttachment } from '@/lib/types';

/** Map a Supabase messages row to the app's Message type. */
function rowToMessage(row: any): Message {
  return {
    id: row.id,
    matchId: row.friendship_id,
    senderId: row.sender_id,
    content: row.content,
    timestamp: row.created_at,
    read: true,
    meetup: row.meetup ?? undefined,
    gifUrl: row.gif_url ?? undefined,
    stickerId: row.sticker_id ?? undefined,
  };
}

/**
 * Real-time Supabase messages hook.
 * Loads existing messages for a friendship and subscribes to new ones.
 * Returns null for both arrays when Supabase is not configured.
 */
export function useMessages(friendshipId: string | undefined) {
  const { user: authUser } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!friendshipId || !authUser) {
      setIsLoading(false);
      return;
    }
    const client = getSupabase();
    if (!client) {
      setIsLoading(false);
      return;
    }

    // Load existing messages
    client
      .from('messages')
      .select('*')
      .eq('friendship_id', friendshipId)
      .order('created_at', { ascending: true })
      .then(({ data, error }) => {
        if (error) console.warn('[useMessages] fetch error:', error.message);
        if (data) setMessages(data.map(rowToMessage));
        setIsLoading(false);
      });

    // Subscribe to new messages
    const channel = client
      .channel(`messages:${friendshipId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `friendship_id=eq.${friendshipId}`,
        },
        (payload) => {
          const newMsg = rowToMessage(payload.new);
          setMessages(prev => {
            // Deduplicate in case of optimistic update
            if (prev.some(m => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });
        }
      )
      .subscribe();

    return () => {
      client.removeChannel(channel);
    };
  }, [friendshipId, authUser]);

  return { messages, isLoading };
}

/**
 * Send a message to a friendship thread via Supabase.
 * Returns the inserted message row, or null on error.
 */
export async function sendSupabaseMessage(
  friendshipId: string,
  senderId: string,
  payload: {
    content: string;
    meetup?: MeetupAttachment;
    gifUrl?: string;
    stickerId?: string;
  }
): Promise<Message | null> {
  const client = getSupabase();
  if (!client) return null;

  const insert: Record<string, unknown> = {
    friendship_id: friendshipId,
    sender_id: senderId,
    content: payload.content,
  };
  if (payload.meetup !== undefined) insert.meetup = payload.meetup;
  if (payload.gifUrl !== undefined) insert.gif_url = payload.gifUrl;
  if (payload.stickerId !== undefined) insert.sticker_id = payload.stickerId;

  const { data, error } = await client
    .from('messages')
    .insert(insert)
    .select()
    .single();

  if (error) {
    console.error('[sendSupabaseMessage] error:', error.message);
    return null;
  }
  return data ? rowToMessage(data) : null;
}

/**
 * Fetch the most recent message for each friendship in one query.
 * Returns a map of friendshipId → Message (or undefined if no messages).
 */
export async function fetchLastMessages(
  friendshipIds: string[]
): Promise<Record<string, Message>> {
  if (!friendshipIds.length) return {};
  const client = getSupabase();
  if (!client) return {};

  // For each friendship get the latest message via a max(created_at) subquery approach:
  // We fetch all messages for these friendships ordered desc then pick the first per friendship.
  const { data, error } = await client
    .from('messages')
    .select('*')
    .in('friendship_id', friendshipIds)
    .order('created_at', { ascending: false });

  if (error) {
    console.warn('[fetchLastMessages] error:', error.message);
    return {};
  }

  const result: Record<string, Message> = {};
  for (const row of data ?? []) {
    if (!result[row.friendship_id]) {
      result[row.friendship_id] = rowToMessage(row);
    }
  }
  return result;
}
