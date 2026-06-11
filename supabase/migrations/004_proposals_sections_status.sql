-- ── 1. Drop old status CHECK first (before any UPDATEs) ─────────────────────
DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN
    SELECT conname FROM pg_constraint
    WHERE conrelid = 'public.proposals'::regclass
      AND contype = 'c'
      AND pg_get_constraintdef(oid) LIKE '%draft%'
  LOOP
    EXECUTE format('ALTER TABLE public.proposals DROP CONSTRAINT %I', r.conname);
  END LOOP;
END $$;

-- ── 2. Add sections and installments columns ──────────────────────────────────
ALTER TABLE public.proposals
  ADD COLUMN IF NOT EXISTS sections     JSONB NOT NULL DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS installments JSONB NOT NULL DEFAULT '[]';

-- ── 3. Migrate existing English status values to Portuguese ───────────────────
UPDATE public.proposals SET status = 'rascunho'    WHERE status = 'draft';
UPDATE public.proposals SET status = 'enviada'     WHERE status = 'sent';
UPDATE public.proposals SET status = 'visualizada' WHERE status = 'viewed';
UPDATE public.proposals SET status = 'aprovada'    WHERE status = 'accepted';
UPDATE public.proposals SET status = 'reprovada'   WHERE status = 'rejected';
UPDATE public.proposals SET status = 'expirada'    WHERE status = 'expired';

-- ── 4. Add new CHECK constraint with Portuguese values ────────────────────────
ALTER TABLE public.proposals
  ADD CONSTRAINT proposals_status_check
  CHECK (status IN ('rascunho','enviada','visualizada','aprovada','reprovada','expirada'));

ALTER TABLE public.proposals ALTER COLUMN status SET DEFAULT 'rascunho';
