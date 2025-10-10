-- Harden receivables history: add archived_at to reminders and deleted_at to receivables (soft-delete)
create extension if not exists pgcrypto;

-- 1) Archive flag on reminders
alter table if exists public.reminders
  add column if not exists archived_at timestamptz;

create index if not exists reminders_receivable_archived_idx
  on public.reminders (receivable_id, archived_at);

-- 2) Soft-delete on receivables
alter table if exists public.receivables
  add column if not exists deleted_at timestamptz;

create index if not exists receivables_owner_deleted_idx
  on public.receivables (owner_id, deleted_at);
