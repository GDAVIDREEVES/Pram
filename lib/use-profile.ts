import { useState, useEffect, useCallback } from 'react';
import { getSupabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import type { Mom } from '@/lib/types';

/** Shape of a row in the Supabase `profiles` table. */
export interface Profile {
  id: string;
  name: string;
  age: number | null;
  neighborhood: string;
  bio: string;
  interests: string[];
  kids: Mom['kids'];
  avatar: string;
  photos: string[];
  verified: boolean;
  hang_now: boolean;
  last_active: string;
  prompts: Mom['prompts'];
  vibe_tags: string[];
  coffee_meetup_preferences: Mom['coffeeMeetupPreferences'] | null;
  comfort_signals: Mom['comfortSignals'] | null;
  safety: Mom['safety'];
  social_proof: Mom['socialProof'];
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

/** Convert a Supabase profile row into the app's Mom interface. */
export function profileToMom(p: Profile): Mom {
  return {
    id: p.id,
    name: p.name,
    age: p.age ?? 0,
    neighborhood: p.neighborhood,
    bio: p.bio,
    interests: p.interests ?? [],
    kids: p.kids ?? [],
    avatar: p.avatar,
    photos: p.photos ?? [],
    verified: p.verified,
    hangNow: p.hang_now,
    lastActive: p.last_active,
    prompts: p.prompts ?? [],
    vibeTags: p.vibe_tags ?? [],
    coffeeMeetupPreferences: p.coffee_meetup_preferences ?? undefined,
    comfortSignals: p.comfort_signals ?? undefined,
    safety: p.safety ?? { phoneVerified: false, referredByMember: false, neighborhoodHost: false },
    socialProof: p.social_proof ?? { mutualConnectionsCount: 0, successfulMeetupsCount: 0 },
  };
}

/** Convert a partial Mom update into Supabase column names. */
function momToProfileUpdate(updates: Partial<Mom>): Record<string, unknown> {
  const mapped: Record<string, unknown> = {};
  if (updates.name !== undefined) mapped.name = updates.name;
  if (updates.age !== undefined) mapped.age = updates.age;
  if (updates.neighborhood !== undefined) mapped.neighborhood = updates.neighborhood;
  if (updates.bio !== undefined) mapped.bio = updates.bio;
  if (updates.interests !== undefined) mapped.interests = updates.interests;
  if (updates.kids !== undefined) mapped.kids = updates.kids;
  if (updates.avatar !== undefined) mapped.avatar = updates.avatar;
  if (updates.photos !== undefined) mapped.photos = updates.photos;
  if (updates.verified !== undefined) mapped.verified = updates.verified;
  if (updates.hangNow !== undefined) mapped.hang_now = updates.hangNow;
  if (updates.prompts !== undefined) mapped.prompts = updates.prompts;
  if (updates.vibeTags !== undefined) mapped.vibe_tags = updates.vibeTags;
  if (updates.coffeeMeetupPreferences !== undefined) mapped.coffee_meetup_preferences = updates.coffeeMeetupPreferences;
  if (updates.comfortSignals !== undefined) mapped.comfort_signals = updates.comfortSignals;
  if (updates.safety !== undefined) mapped.safety = updates.safety;
  if (updates.socialProof !== undefined) mapped.social_proof = updates.socialProof;
  return mapped;
}

/**
 * Hook: fetch the current user's profile from Supabase.
 * Returns the profile, loading state, and an update function.
 */
export function useMyProfile() {
  const { user: authUser } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!authUser) { setIsLoading(false); return; }
    const client = getSupabase();
    if (!client) { setIsLoading(false); return; }

    client
      .from('profiles')
      .select('*')
      .eq('id', authUser.id)
      .single()
      .then(({ data, error }) => {
        if (data) setProfile(data as Profile);
        if (error) console.warn('[useMyProfile] fetch error:', error.message);
        setIsLoading(false);
      });
  }, [authUser]);

  const updateProfile = useCallback(async (updates: Partial<Mom> & { is_public?: boolean }) => {
    if (!authUser) return;
    const client = getSupabase();
    if (!client) return;

    // Separate is_public from Mom fields
    const { is_public, ...momUpdates } = updates;
    const mapped = momToProfileUpdate(momUpdates);
    if (is_public !== undefined) mapped.is_public = is_public;

    const { data, error } = await client
      .from('profiles')
      .update(mapped)
      .eq('id', authUser.id)
      .select()
      .single();

    if (error) {
      console.error('[useMyProfile] update error:', error.message);
    } else if (data) {
      setProfile(data as Profile);
    }
  }, [authUser]);

  return { profile, isLoading, updateProfile };
}

/**
 * Hook: fetch public profiles for the Discover queue.
 * Excludes the current user and any already-liked/skipped IDs.
 */
export function useDiscoverProfiles(excludeIds: string[] = []) {
  const { user: authUser } = useAuth();
  const [profiles, setProfiles] = useState<Mom[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  // null = not yet queried, false = Supabase not configured (use mock), true = query ran
  const [supabaseQueried, setSupabaseQueried] = useState<boolean | null>(null);

  useEffect(() => {
    if (!authUser) { setIsLoading(false); setSupabaseQueried(false); return; }
    const client = getSupabase();
    if (!client) { setIsLoading(false); setSupabaseQueried(false); return; }

    const allExcluded = [authUser.id, ...excludeIds];

    client
      .from('profiles')
      .select('*')
      .eq('is_public', true)
      .not('id', 'in', `(${allExcluded.join(',')})`)
      .order('updated_at', { ascending: false })
      .limit(50)
      .then(({ data, error }) => {
        if (error) {
          console.warn('[useDiscoverProfiles] error:', error.message);
        }
        if (data) {
          setProfiles((data as Profile[]).map(profileToMom));
        }
        setSupabaseQueried(true);
        setIsLoading(false);
      });
  }, [authUser, excludeIds.join(',')]);

  return { profiles, isLoading, supabaseQueried };
}

export interface Friend {
  friendshipId: string;
  profile: Mom;
  since: string;
  isPending: boolean; // true = they friended you but you haven't friended them back
}

/**
 * Hook: fetch the current user's friends from the `friends` table,
 * joining their profiles. Returns null when Supabase is not configured.
 */
export function useFriends() {
  const { user: authUser } = useAuth();
  const [friends, setFriends] = useState<Friend[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchTick, setFetchTick] = useState(0);

  const refetch = useCallback(() => setFetchTick(t => t + 1), []);

  useEffect(() => {
    if (!authUser) { setIsLoading(false); return; }
    const client = getSupabase();
    if (!client) { setIsLoading(false); return; }

    const userId = authUser.id;
    setIsLoading(true);

    const loadFriends = async () => {
      // Fetch all friendship rows where the current user is either side
      const { data: rows, error } = await client
        .from('friends')
        .select('id, user_id, friend_id, created_at')
        .or(`user_id.eq.${userId},friend_id.eq.${userId}`)
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('[useFriends] fetch error:', error.message);
        setIsLoading(false);
        return;
      }

      if (!rows || rows.length === 0) {
        setFriends([]);
        setIsLoading(false);
        return;
      }

      // Rows where I initiated (user_id = me) vs they initiated (friend_id = me)
      const myInitiated = rows.filter((r: any) => r.user_id === userId);
      const theyInitiated = rows.filter((r: any) => r.friend_id === userId);

      // IDs I have already friended
      const myFriendedIds = new Set<string>(myInitiated.map((r: any) => r.friend_id));

      // Pending = they friended me, I haven't friended them back
      const pendingRows = theyInitiated.filter((r: any) => !myFriendedIds.has(r.user_id));

      // Collect all relevant other-person IDs for a single profile fetch
      const friendIds = [
        ...myInitiated.map((r: any) => r.friend_id),
        ...pendingRows.map((r: any) => r.user_id),
      ];

      if (friendIds.length === 0) {
        setFriends([]);
        setIsLoading(false);
        return;
      }

      // Fetch their profiles in one query
      const { data: profileRows, error: profileError } = await client
        .from('profiles')
        .select('*')
        .in('id', friendIds);

      if (profileError) {
        console.warn('[useFriends] profile fetch error:', profileError.message);
        setIsLoading(false);
        return;
      }

      const profileMap = new Map<string, Profile>(
        (profileRows ?? []).map((p: any) => [p.id, p as Profile])
      );

      const result: Friend[] = [
        // Connections I initiated (not pending)
        ...myInitiated.map((r: any) => {
          const profile = profileMap.get(r.friend_id);
          if (!profile) return null;
          return { friendshipId: r.id, profile: profileToMom(profile), since: r.created_at, isPending: false };
        }),
        // Incoming requests I haven't accepted yet
        ...pendingRows.map((r: any) => {
          const profile = profileMap.get(r.user_id);
          if (!profile) return null;
          return { friendshipId: r.id, profile: profileToMom(profile), since: r.created_at, isPending: true };
        }),
      ].filter(Boolean) as Friend[];

      setFriends(result);
      setIsLoading(false);
    };

    loadFriends().catch(err => {
      console.error('[useFriends] unexpected error:', err);
      setIsLoading(false);
    });
  }, [authUser?.id, fetchTick]);

  return { friends, isLoading, refetch };
}

/**
 * Insert a row into the `friends` table when the current user likes someone.
 * Returns the new friendship id, or null on error.
 */
/**
 * Hook: fetch a single profile by ID from Supabase.
 * Falls back to null if not found or not configured.
 */
export function useProfileById(id: string | undefined) {
  const [profile, setProfile] = useState<Mom | null>(null);

  useEffect(() => {
    if (!id) return;
    const client = getSupabase();
    if (!client) return;

    client
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single()
      .then(({ data }) => {
        if (data) setProfile(profileToMom(data as Profile));
      });
  }, [id]);

  return profile;
}

export async function addFriend(friendId: string): Promise<string | null> {
  const client = getSupabase();
  if (!client) return null;

  const { data: { user } } = await client.auth.getUser();
  if (!user) return null;

  // Avoid duplicate friendships
  const { data: existing } = await client
    .from('friends')
    .select('id')
    .or(`and(user_id.eq.${user.id},friend_id.eq.${friendId}),and(user_id.eq.${friendId},friend_id.eq.${user.id})`)
    .maybeSingle();

  if (existing) return existing.id;

  const { data, error } = await client
    .from('friends')
    .insert({ user_id: user.id, friend_id: friendId })
    .select('id')
    .single();

  if (error) {
    console.error('[addFriend] error:', error.message);
    return null;
  }
  return data?.id ?? null;
}
