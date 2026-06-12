-- Profile completeness fields used by the banner.
-- address  was added in migration 002 — no-op.
-- document completeness maps to the existing cpf_cnpj column (no new column needed).
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS address TEXT;
