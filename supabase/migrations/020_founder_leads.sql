CREATE TABLE IF NOT EXISTS public.founder_leads (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT        NOT NULL,
  email      TEXT        NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.founder_leads ENABLE ROW LEVEL SECURITY;

-- Apenas INSERT público — sem leitura pública
CREATE POLICY "founder_leads_insert"
  ON public.founder_leads
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);
