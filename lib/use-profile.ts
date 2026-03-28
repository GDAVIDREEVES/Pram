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
      .order('last_active', { ascending: false })
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
}

/**
 * Hook: fetch the current user's friends from the `friends` table,
 * joining their profiles. Returns null when Supabase is not configured.
 */
export function useFriends() {
  const { user: authUser } = useAuth();
  const [friends, setFriends] = useState<Friend[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!authUser) { setIsLoading(false); return; }
    const client = getSupabase();
    if (!client) { setIsLoading(false); return; }

    // Fetch all friendship rows where the current user is either side
    client
      .from('friends')
      .select('id, user_id, friend_id, created_at')
      .or(`user_id.eq.${authUser.id},friend_id.eq.${authUser.id}`)
      .order('created_at', { ascending: false })
      .then(async ({ data: rows, error }) => {
        if (error) {
          console.warn('[useFriends] error:', error.message);
          setIsLoading(false);
          return;
        }
        if (!rows || rows.length === 0) {
          setFriends([]);
          setIsLoading(false);
          return;
        }

        // Collect the other person's ID for each friendship
        const friendIds = rows.map((r: any) =>
          r.user_id === authUser.id ? r.friend_id : r.user_id
        );

        // Fetch their profiles in one query
        const { data: profileRows } = await client
          .from('profiles')
          .select('*')
          .in('id', friendIds);

        const profileMap = new Map<string, Profile>(
          (profileRows ?? []).map((p: any) => [p.id, p as Profile])
        );

        const result: Friend[] = rows
          .map((r: any) => {
            const otherId = r.user_id === authUser.id ? r.friend_id : r.user_id;
            const profile = profileMap.get(otherId);
            if (!profile) return null;
            return {
              friendshipId: r.id,
              profile: profileToMom(profile),
              since: r.created_at,
            };
          })
          .filter(Boolean) as Friend[];

        setFriends(result);
        setIsLoading(false);
      });
  }, [authUser]);

  return { friends, isLoading };
}
