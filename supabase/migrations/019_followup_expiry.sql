ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS followup_expiry_enabled boolean NOT NULL DEFAULT true;
