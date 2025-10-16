-- Extra notifications: payment detected, due soon, system errors
create extension if not exists pgcrypto;

-- 1) Payment detected on receivables update
create or replace function public.notify_payment_detected()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if TG_OP = 'UPDATE' then
    if (NEW.paid_amount is not null and NEW.paid_amount > coalesce(OLD.paid_amount, 0))
       or (OLD.status is distinct from NEW.status and NEW.status = 'paid') then
      insert into public.notifications (owner_id, type, category, severity, title, message, metadata)
      values (
        NEW.owner_id,
        'payment_detected',
        'payments',
        'success',
        'Paiement détecté',
        coalesce('Un paiement a été enregistré sur la facture ' || coalesce(NEW.invoice_number, ''), 'Paiement détecté'),
        jsonb_build_object(
          'receivable_id', NEW.id,
          'invoice_number', NEW.invoice_number,
          'old_paid_amount', coalesce(OLD.paid_amount, 0),
          'new_paid_amount', NEW.paid_amount,
          'status', NEW.status
        )
      );
    end if;
  end if;
  return NEW;
end;
$$;

drop trigger if exists trg_payment_detected on public.receivables;
create trigger trg_payment_detected
  after update of paid_amount, status on public.receivables
  for each row execute function public.notify_payment_detected();

-- 2) Due soon scan function (3 days window) and change trigger
create or replace function public.scan_due_soon_notifications()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  r record;
begin
  for r in
    select rec.id, rec.owner_id, rec.invoice_number, rec.due_date
    from public.receivables rec
    where rec.due_date is not null
      and (rec.status is distinct from 'paid')
      and rec.due_date::date between (now()::date) and (now()::date + 3)
  loop
    if not exists (
      select 1 from public.notifications n
      where n.owner_id = r.owner_id
        and n.type = 'due_soon'
        and (n.metadata->>'receivable_id')::uuid = r.id
        and n.created_at > now() - interval '1 day'
    ) then
      insert into public.notifications (owner_id, type, category, severity, title, message, metadata)
      values (
        r.owner_id,
        'due_soon',
        'due',
        'warn',
        'Échéance proche',
        'La facture ' || coalesce(r.invoice_number, '') || ' arrive à échéance le ' || to_char(r.due_date, 'DD/MM/YYYY') || '.',
        jsonb_build_object('receivable_id', r.id, 'due_date', r.due_date)
      );
    end if;
  end loop;
end;
$$;

create or replace function public.notify_due_soon_on_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if NEW.due_date is not null and (NEW.status is distinct from 'paid') then
    if NEW.due_date::date between (now()::date) and (now()::date + 3) then
      if not exists (
        select 1 from public.notifications n
        where n.owner_id = NEW.owner_id
          and n.type = 'due_soon'
          and (n.metadata->>'receivable_id')::uuid = NEW.id
          and n.created_at > now() - interval '1 day'
      ) then
        insert into public.notifications (owner_id, type, category, severity, title, message, metadata)
        values (
          NEW.owner_id,
          'due_soon',
          'due',
          'warn',
          'Échéance proche',
          'La facture ' || coalesce(NEW.invoice_number, '') || ' arrive à échéance le ' || to_char(NEW.due_date, 'DD/MM/YYYY') || '.',
          jsonb_build_object('receivable_id', NEW.id, 'due_date', NEW.due_date)
        );
      end if;
    end if;
  end if;
  return NEW;
end;
$$;

drop trigger if exists trg_due_soon_change on public.receivables;
create trigger trg_due_soon_change
  after insert or update of due_date, status on public.receivables
  for each row execute function public.notify_due_soon_on_change();

create extension pg_cron with schema pg_catalog; 

-- Optional: schedule daily scan via pg_cron if available
do $$
begin
  if exists (select 1 from pg_extension where extname = 'pg_cron') then
    if not exists (select 1 from cron.job where jobname = 'notif_due_soon_daily') then
      perform cron.schedule('notif_due_soon_daily', '0 6 * * *', $inner$select public.scan_due_soon_notifications()$inner$);
    end if;
  end if;
end $$;

-- 3) System errors pipeline -> notifications
create table if not exists public.system_errors (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  code text,
  message text not null,
  details jsonb default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.system_errors enable row level security;

drop policy if exists "System errors Select own" on public.system_errors;
create policy "System errors Select own" on public.system_errors
  for select using (owner_id = auth.uid());

drop policy if exists "System errors Insert own" on public.system_errors;
create policy "System errors Insert own" on public.system_errors
  for insert with check (owner_id = auth.uid());

create or replace function public.notify_system_error()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.notifications (owner_id, type, category, severity, title, message, metadata)
  values (
    NEW.owner_id,
    'system_error',
    'system',
    'error',
    'Erreur système',
    NEW.message,
    jsonb_build_object('code', NEW.code, 'details', NEW.details)
  );
  return NEW;
end;
$$;

drop trigger if exists trg_system_error_notify on public.system_errors;
create trigger trg_system_error_notify
  after insert on public.system_errors
  for each row execute function public.notify_system_error();

-- Ensure publication for realtime includes notifications (already handled in previous migration; keep safe)
do $$
begin
  if not exists (
    select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'notifications'
  ) then
    execute 'alter publication supabase_realtime add table public.notifications';
  end if;
end $$;
