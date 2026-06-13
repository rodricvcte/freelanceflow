-- Rename status 'aprovada' → 'aceita' for consistency

ALTER TABLE public.proposals DROP CONSTRAINT IF EXISTS proposals_status_check;

UPDATE public.proposals SET status = 'aceita' WHERE status = 'aprovada';

ALTER TABLE public.proposals
  ADD CONSTRAINT proposals_status_check
  CHECK (status IN ('rascunho','enviada','visualizada','aceita','recusada','expirada','cancelada'));
