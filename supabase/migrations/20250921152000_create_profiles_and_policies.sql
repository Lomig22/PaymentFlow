-- Ensure pgcrypto extension for gen_random_uuid
create extension if not exists pgcrypto with schema public;

-- =========================
-- Table: public.profiles
-- =========================
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique,
  name text,
  phone text,
  company text,
  subscribe boolean not null default false,
  onboarding_seen boolean not null default false,
  onboarding_survey jsonb,
  receivables_mapping jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Trigger to maintain updated_at
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

-- RLS and policies for profiles
alter table public.profiles enable row level security;

create policy profiles_select_own
on public.profiles for select
using (auth.uid() = id);

create policy profiles_insert_own
on public.profiles for insert
with check (auth.uid() = id);

create policy profiles_update_own
on public.profiles for update
using (auth.uid() = id)
with check (auth.uid() = id);

-- Helpful indexes
create index if not exists idx_profiles_email on public.profiles (email);

-- =========================
-- Table: public.subscriptions (optional, used by app)
-- =========================
create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  status text not null default 'active' check (status in ('active','canceled','past_due','trialing')),
  plan text not null default 'free'
);

alter table public.subscriptions enable row level security;

create policy subscriptions_select_own
on public.subscriptions for select
using (auth.uid() = user_id);

create policy subscriptions_insert_own
on public.subscriptions for insert
with check (auth.uid() = user_id);

create index if not exists idx_subscriptions_user on public.subscriptions (user_id);

-- =========================
-- Table: public.pending_profiles (optional, pre-signup info)
-- =========================
create table if not exists public.pending_profiles (
  id bigserial primary key,
  email text unique not null,
  name text,
  phone text,
  company text,
  created_at timestamptz not null default now()
);

alter table public.pending_profiles enable row level security;

create policy pending_profiles_select_by_email
on public.pending_profiles for select
using ((auth.jwt() ->> 'email') = email);

create index if not exists idx_pending_profiles_email on public.pending_profiles (email);
