-- Add email_id column on reminders to link with email opens
alter table reminders add column if not exists email_id text;
create index if not exists idx_reminders_email_id on reminders(email_id);
