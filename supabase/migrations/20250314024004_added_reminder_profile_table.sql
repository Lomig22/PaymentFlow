CREATE TABLE IF NOT EXISTS reminder_profile (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id uuid REFERENCES auth.users(id),
    name text NOT NULL,
    public boolean DEFAULT false, 
    delay1 jsonb,
    delay2 jsonb,
    delay3 jsonb,
    delay4 jsonb,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

ALTER TABLE clients ADD COLUMN IF NOT EXISTS reminder_profile uuid;
ALTER TABLE clients ADD CONSTRAINT fk_reminder_profile FOREIGN KEY (reminder_profile) REFERENCES reminder_profile(id);
