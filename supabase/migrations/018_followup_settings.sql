-- Add follow-up configuration to user profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS followup_enabled boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS followup_days    integer NOT NULL DEFAULT 2;
