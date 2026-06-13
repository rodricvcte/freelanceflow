-- Rename status 'reprovada' → 'recusada' for consistency with PT-BR terminology

-- 1. Drop existing CHECK constraint
ALTER TABLE public.proposals DROP CONSTRAINT IF EXISTS proposals_status_check;

-- 2. Rename existing rows
UPDATE public.proposals SET status = 'recusada' WHERE status = 'reprovada';

-- 3. Re-add constraint with new value
ALTER TABLE public.proposals
  ADD CONSTRAINT proposals_status_check
  CHECK (status IN ('rascunho','enviada','visualizada','aprovada','recusada','expirada','cancelada'));
