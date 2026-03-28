-- Wriggle / Pram — Supabase Database Setup
-- Run this in the Supabase SQL Editor (https://supabase.com/dashboard → SQL Editor)
--
-- Creates:
--   1. profiles table (linked to auth.users)
--   2. RLS policies for discover + profile management
--   3. Trigger to auto-create a profile on signup
--   4. Backfill for any existing auth users
--   5. friends table with RLS policies

-- ============================================================
-- 1. PROFILES TABLE
-- ============================================================

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null default '',
  age integer,
  neighborhood text not null default '',
  bio text not null default '',
  interests text[] not null default '{}',
  kids jsonb not null default '[]',
  avatar text not null default '',
  photos text[] not null default '{}',
  verified boolean not null default false,
  hang_now boolean not null default false,
  last_active timestamptz not null default now(),
  prompts jsonb not null default '[]',
  vibe_tags text[] not null default '{}',
  coffee_meetup_preferences jsonb,
  comfort_signals jsonb,
  safety jsonb not null default '{"phoneVerified": false, "referredByMember": false, "neighborhoodHost": false}',
  social_proof jsonb not null default '{"mutualConnectionsCount": 0, "successfulMeetupsCount": 0}',
  is_public boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Index for discover queries (public profiles, ordered by activity)
create index if not exists idx_profiles_discover
  on public.profiles (is_public, last_active desc)
  where is_public = true;

-- ============================================================
-- 2. ROW LEVEL SECURITY
-- ============================================================

alter table public.profiles enable row level security;

-- Authenticated users can read any public profile
create policy "Public profiles are visible to authenticated users"
  on public.profiles for select
  to authenticated
  using (is_public = true or id = auth.uid());

-- Users can insert their own profile
create policy "Users can create their own profile"
  on public.profiles for insert
  to authenticated
  with check (id = auth.uid());

-- Users can update their own profile
create policy "Users can update their own profile"
  on public.profiles for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

-- ============================================================
-- 3. AUTO-CREATE PROFILE ON SIGNUP (trigger)
-- ============================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'name', '')
  );
  return new;
end;
$$;

-- Drop if exists to avoid duplicate trigger errors on re-run
drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- 4. AUTO-UPDATE updated_at TIMESTAMP
-- ============================================================

create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists on_profile_updated on public.profiles;

create trigger on_profile_updated
  before update on public.profiles
  for each row execute function public.handle_updated_at();

-- ============================================================
-- 5. BACKFILL: create profiles for existing auth users
-- ============================================================

insert into public.profiles (id, name)
select
  id,
  coalesce(raw_user_meta_data ->> 'name', '')
from auth.users
where id not in (select id from public.profiles)
on conflict (id) do nothing;

-- ============================================================
-- 6. FRIENDS TABLE
-- ============================================================

create table if not exists public.friends (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  friend_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique(user_id, friend_id)
);

create index if not exists idx_friends_user_id on public.friends(user_id);
create index if not exists idx_friends_friend_id on public.friends(friend_id);

alter table public.friends enable row level security;

-- Users can see friendships they are part of
create policy "Users can view their own friendships"
  on public.friends for select
  to authenticated
  using (user_id = auth.uid() or friend_id = auth.uid());

-- Users can create friendships where they are the initiator
create policy "Users can create friendships"
  on public.friends for insert
  to authenticated
  with check (user_id = auth.uid());

-- Users can delete their own friendships
create policy "Users can delete their own friendships"
  on public.friends for delete
  to authenticated
  using (user_id = auth.uid() or friend_id = auth.uid());

-- ============================================================
-- 7. MESSAGES TABLE
-- ============================================================

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  friendship_id uuid not null references public.friends(id) on delete cascade,
  sender_id uuid not null references auth.users(id) on delete cascade,
  content text not null default '',
  -- optional rich content stored as jsonb
  meetup jsonb,
  gif_url text,
  sticker_id text,
  created_at timestamptz not null default now()
);

create index if not exists idx_messages_friendship_id
  on public.messages (friendship_id, created_at desc);

alter table public.messages enable row level security;

-- Users can read messages in friendships they belong to
create policy "Users can view messages in their friendships"
  on public.messages for select
  to authenticated
  using (
    exists (
      select 1 from public.friends f
      where f.id = friendship_id
        and (f.user_id = auth.uid() or f.friend_id = auth.uid())
    )
  );

-- Users can insert messages only as themselves in their friendships
create policy "Users can send messages in their friendships"
  on public.messages for insert
  to authenticated
  with check (
    sender_id = auth.uid()
    and exists (
      select 1 from public.friends f
      where f.id = friendship_id
        and (f.user_id = auth.uid() or f.friend_id = auth.uid())
    )
  );
