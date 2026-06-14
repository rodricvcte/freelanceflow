-- Idempotent: safe to run even if 020/021 were already applied.
CREATE TABLE IF NOT EXISTS public.founder_leads (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT        NOT NULL,
  email       TEXT        NOT NULL UNIQUE,
  coupon_sent BOOLEAN     NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add coupon_sent if the table existed before migration 021.
ALTER TABLE public.founder_leads
  ADD COLUMN IF NOT EXISTS coupon_sent BOOLEAN NOT NULL DEFAULT false;

-- RLS
ALTER TABLE public.founder_leads ENABLE ROW LEVEL SECURITY;

-- Drop old policy name from migration 020 if present.
DROP POLICY IF EXISTS "founder_leads_insert" ON public.founder_leads;

-- Public INSERT (anon captures from the /fundador landing page).
DROP POLICY IF EXISTS "insert_public" ON public.founder_leads;
CREATE POLICY "insert_public"
  ON public.founder_leads
  FOR INSERT TO anon
  WITH CHECK (true);

-- SELECT only for authenticated users (admin panel reads this table).
DROP POLICY IF EXISTS "read_authenticated" ON public.founder_leads;
CREATE POLICY "read_authenticated"
  ON public.founder_leads
  FOR SELECT TO authenticated
  USING (true);

-- UPDATE only for authenticated users (admin marks coupon_sent = true).
DROP POLICY IF EXISTS "update_authenticated" ON public.founder_leads;
CREATE POLICY "update_authenticated"
  ON public.founder_leads
  FOR UPDATE TO authenticated
  USING (true)
  WITH CHECK (true);
