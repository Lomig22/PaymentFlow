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
