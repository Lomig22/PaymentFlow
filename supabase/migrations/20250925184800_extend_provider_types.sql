-- Extend allowed provider_type values to support platform and infomaniak
-- and set the default provider to 'platform' to align with the app's UX.

-- Safe-guard: drop and recreate the check constraint
ALTER TABLE email_settings
  DROP CONSTRAINT IF EXISTS valid_provider_type;

ALTER TABLE email_settings
  ADD CONSTRAINT valid_provider_type
  CHECK (provider_type IN ('platform', 'custom', 'ovh', 'gmail', 'infomaniak'));

-- Set default provider to 'platform'
ALTER TABLE email_settings
  ALTER COLUMN provider_type SET DEFAULT 'platform';
