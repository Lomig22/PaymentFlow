-- Ensure pgcrypto for gen_random_uuid()
create extension if not exists pgcrypto;

-- Function: when a reminder is inserted with an email_id, mirror it on the related receivable
create or replace function public.set_receivable_email_id_on_reminder()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Mirror email_id on receivables if provided
  if new.email_id is not null then
    update receivables
      set email_id = new.email_id,
          updated_at = now()
    where id = new.receivable_id;
  end if;
  return new;
end;
$$;

-- Trigger (create if not exists pattern)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'tr_set_receivable_email_id_on_reminder'
  ) THEN
    CREATE TRIGGER tr_set_receivable_email_id_on_reminder
    AFTER INSERT ON reminders
    FOR EACH ROW
    EXECUTE FUNCTION public.set_receivable_email_id_on_reminder();
  END IF;
END $$;
