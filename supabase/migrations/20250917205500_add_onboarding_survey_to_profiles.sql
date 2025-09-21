-- Add onboarding_survey JSONB to store rich onboarding questionnaire answers
alter table profiles add column if not exists onboarding_survey jsonb;
