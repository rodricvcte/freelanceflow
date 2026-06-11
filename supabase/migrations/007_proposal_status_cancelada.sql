-- Drop existing check constraint and recreate with 'cancelada'
ALTER TABLE public.proposals DROP CONSTRAINT IF EXISTS proposals_status_check;

ALTER TABLE public.proposals
  ADD CONSTRAINT proposals_status_check
  CHECK (status IN ('rascunho','enviada','visualizada','aprovada','reprovada','expirada','cancelada'));
