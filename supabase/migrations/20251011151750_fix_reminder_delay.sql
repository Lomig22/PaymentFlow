ALTER TABLE clients DROP CONSTRAINT IF EXISTS reminder_delay_1_positive;
ALTER TABLE clients DROP CONSTRAINT IF EXISTS reminder_delay_2_positive;
ALTER TABLE clients DROP CONSTRAINT IF EXISTS reminder_delay_3_positive;
ALTER TABLE clients DROP CONSTRAINT IF EXISTS reminder_delay_final_positive; 


ALTER TABLE clients DROP COLUMN reminder_delay_1;
ALTER TABLE clients DROP COLUMN reminder_delay_2;
ALTER TABLE clients DROP COLUMN reminder_delay_3;
ALTER TABLE clients DROP COLUMN reminder_delay_final;

ALTER TABLE clients ADD COLUMN reminder_delay_1 jsonb;
ALTER TABLE clients ADD COLUMN reminder_delay_2 jsonb;
ALTER TABLE clients ADD COLUMN reminder_delay_3 jsonb;
ALTER TABLE clients ADD COLUMN reminder_delay_final jsonb;

alter table clients add column pre_reminder_date timestamptz;

comment on column clients.pre_reminder_date is 'date de la première relance';


alter table clients add column if not exists reminder_date_1 timestamptz;
alter table clients add column if not exists reminder_date_2 timestamptz;
alter table clients add column if not exists reminder_date_3 timestamptz;
alter table clients add column if not exists reminder_date_final timestamptz;

alter table clients add column if not exists pre_reminder_delay jsonb;

alter table clients add column if not exists pre_reminder_enable boolean not null default false;