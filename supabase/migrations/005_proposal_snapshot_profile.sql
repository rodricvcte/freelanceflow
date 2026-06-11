ALTER TABLE public.proposals
  ADD COLUMN IF NOT EXISTS snapshot_profile JSONB;
