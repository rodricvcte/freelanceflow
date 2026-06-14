-- Global sequential number per user (RC001 = user seq 1, RC002 = seq 2, etc.)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS user_seq INTEGER;

-- Display code for proposals in format RC001-YYYYMMDD-001-v1
ALTER TABLE public.proposals
  ADD COLUMN IF NOT EXISTS code TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS idx_proposals_code
  ON public.proposals(code) WHERE code IS NOT NULL;
