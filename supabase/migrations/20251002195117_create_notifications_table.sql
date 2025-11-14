create table if not exists public.notifications (
  id bigint primary key generated always as identity,
  owner_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  type varchar,
  message text,
  is_read boolean default false,
  details text,
  need_mail_notification boolean default false
);