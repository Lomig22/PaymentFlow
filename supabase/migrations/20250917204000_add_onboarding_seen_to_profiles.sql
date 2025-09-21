-- Add onboarding_seen flag on user profiles to persist tutorial completion
alter table profiles add column if not exists onboarding_seen boolean default false;
