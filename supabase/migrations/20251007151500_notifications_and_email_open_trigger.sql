-- Notifications core table + Trigger on email_opens to generate notifications (DB Trigger option)
create extension if not exists pgcrypto;

-- 1) Notifications table
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  type text not null,
  message text not null,
  created_at timestamptz not null default now()
);

-- Colonnes additionnelles si absentes (migration progressive)
alter table public.notifications add column if not exists category text;
alter table public.notifications add column if not exists severity text default 'info';
alter table public.notifications add column if not exists title text;
alter table public.notifications add column if not exists metadata jsonb default '{}'::jsonb;
alter table public.notifications add column if not exists is_read boolean not null default false;

create index if not exists notifications_owner_unread_idx on public.notifications (owner_id, is_read);
create index if not exists notifications_owner_created_idx on public.notifications (owner_id, created_at desc);
create index if not exists notifications_category_idx on public.notifications (category);

alter table public.notifications enable row level security;

-- RLS policies
drop policy if exists "Notifications Select own" on public.notifications;
create policy "Notifications Select own" on public.notifications
  for select using (owner_id = auth.uid());

drop policy if exists "Notifications Insert own" on public.notifications;
create policy "Notifications Insert own" on public.notifications
  for insert with check (owner_id = auth.uid());

drop policy if exists "Notifications Update own" on public.notifications;
create policy "Notifications Update own" on public.notifications
  for update using (owner_id = auth.uid()) with check (owner_id = auth.uid());

drop policy if exists "Notifications Delete own" on public.notifications;
create policy "Notifications Delete own" on public.notifications
  for delete using (owner_id = auth.uid());

-- 2) Trigger: on email_opens insert -> notifications
-- Assumptions: existing tables public.email_opens, public.reminders (with email_id and receivable_id), public.receivables, public.clients
-- Function runs as SECURITY DEFINER to ensure it can insert regardless of caller; RLS bypass depends on caller role (service_role from Edge tracker).
create or replace function public.notify_email_open()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_receivable_id uuid;
  v_owner_id uuid;
  v_invoice text;
  v_client text;
begin
  -- Match the most recent reminder for this email_id
  select r.receivable_id into v_receivable_id
  from public.reminders r
  where r.email_id = NEW.email_id
  order by r.reminder_date desc
  limit 1;

  if v_receivable_id is null then
    return NEW;
  end if;

  select rec.owner_id, rec.invoice_number, c.company_name
    into v_owner_id, v_invoice, v_client
  from public.receivables rec
  left join public.clients c on c.id = rec.client_id
  where rec.id = v_receivable_id
  limit 1;

  if v_owner_id is null then
    return NEW;
  end if;

  insert into public.notifications (
    owner_id, type, category, severity, title, message, metadata
  ) values (
    v_owner_id,
    'email_open',
    'email',
    'info',
    'Relance ouverte',
    coalesce(v_client, 'Un client') || ' a ouvert votre relance pour la facture ' || coalesce(v_invoice, '') || '.',
    jsonb_build_object(
      'email_id', NEW.email_id,
      'receivable_id', v_receivable_id,
      'opened_at', NEW.opened_at,
      'user_agent', NEW.user_agent,
      'ip_address', NEW.ip_address
    )
  );

  return NEW;
end;
$$;

-- Create trigger on email_opens
create trigger trg_email_open_notify
  after insert on public.email_opens
  for each row execute function public.notify_email_open();

-- 3) Ensure Realtime publication includes notifications
do $$
begin
  if not exists (
    select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'notifications'
  ) then
    execute 'alter publication supabase_realtime add table public.notifications';
  end if;
end $$;
