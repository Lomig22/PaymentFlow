create table if not exists public.invited_users (
  id bigint primary key generated always as identity,
  invited_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  invited_email text not null
);