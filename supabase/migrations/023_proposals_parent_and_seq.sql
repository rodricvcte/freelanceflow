-- parent_proposal_id: links every version back to the root (v1) proposal
ALTER TABLE public.proposals
  ADD COLUMN IF NOT EXISTS parent_proposal_id UUID REFERENCES public.proposals(id);

-- prop_seq: lifetime sequential for this user (1st proposal = 1, 2nd = 2...)
-- Stored so the proposal number is self-contained without re-counting
ALTER TABLE public.proposals
  ADD COLUMN IF NOT EXISTS prop_seq INTEGER;

-- Index for version history lookups via parent
CREATE INDEX IF NOT EXISTS idx_proposals_parent_id
  ON public.proposals(parent_proposal_id);
