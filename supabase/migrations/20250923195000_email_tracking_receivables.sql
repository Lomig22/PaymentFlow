-- Add email_id on receivables for email open tracking at receivable level
alter table receivables add column if not exists email_id text;
create index if not exists idx_receivables_email_id on receivables(email_id);

-- Complementary RLS policy on email_opens to allow owners to read opens via receivables linkage
-- Keep the existing reminders-based policy; add a new policy for receivables-based linkage
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'email_opens'
      AND policyname = 'Users can view their email opens via receivables'
  ) THEN
    EXECUTE $$
      create policy "Users can view their email opens via receivables"
        on email_opens for select
        to authenticated
        using (
          exists (
            select 1 from receivables re
            join clients c on re.client_id = c.id
            where re.email_id = email_opens.email_id
              and c.owner_id = auth.uid()
          )
        );
    $$;
  END IF;
END
$$;
