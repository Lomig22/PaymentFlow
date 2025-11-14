-- Create table to store email open events
create table if not exists email_opens (
  id uuid primary key default gen_random_uuid(),
  email_id text not null,
  user_agent text,
  ip_address text,
  opened_at timestamptz default now()
);

create index if not exists email_opens_email_id_idx on email_opens (email_id);

alter table email_opens enable row level security;

-- Only allow reading email_open rows linked to the authenticated user's data
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'email_opens'
      AND policyname = 'Users can view their email opens'
  ) THEN
    create policy "Users can view their email opens"
      on email_opens for select
      to authenticated
      using (
        exists (
          select 1 from reminders r
          join receivables re on r.receivable_id = re.id
          join clients c on re.client_id = c.id
          where r.email_id = email_opens.email_id
            and c.owner_id = auth.uid()
        )
      );
  END IF;
END $$;
