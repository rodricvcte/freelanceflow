-- =============================================================================
-- Migration 002 — profile & proposal enhancements
-- =============================================================================

-- ── profiles: new columns ────────────────────────────────────────────────────

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS address         TEXT,
  ADD COLUMN IF NOT EXISTS document_type   TEXT,
  ADD COLUMN IF NOT EXISTS cpf_cnpj        TEXT,
  ADD COLUMN IF NOT EXISTS email_business  TEXT,
  ADD COLUMN IF NOT EXISTS website         TEXT,
  ADD COLUMN IF NOT EXISTS freelancer_code TEXT;

DO $$ BEGIN
  ALTER TABLE public.profiles
    ADD CONSTRAINT profiles_document_type_check
    CHECK (document_type IN ('cpf', 'cnpj'));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE public.profiles
    ADD CONSTRAINT profiles_freelancer_code_key
    UNIQUE (freelancer_code);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ── proposals: new columns ───────────────────────────────────────────────────

ALTER TABLE public.proposals
  ADD COLUMN IF NOT EXISTS version         INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS proposal_number TEXT;

DO $$ BEGIN
  ALTER TABLE public.proposals
    ADD CONSTRAINT proposals_proposal_number_key
    UNIQUE (proposal_number);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ── function: generate_freelancer_code ───────────────────────────────────────
-- Returns a unique code like RC001, RC002, ...
-- First letter of first name + first letter of last name, then 3-digit sequence.

CREATE OR REPLACE FUNCTION public.generate_freelancer_code(p_full_name TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_parts  TEXT[];
  v_prefix TEXT;
  v_first  CHAR;
  v_last   CHAR;
  v_count  INT := 0;
  v_code   TEXT;
BEGIN
  v_parts := regexp_split_to_array(trim(p_full_name), '\s+');
  v_first  := upper(substring(v_parts[1] FROM 1 FOR 1));

  IF array_length(v_parts, 1) >= 2 THEN
    v_last := upper(substring(v_parts[array_length(v_parts, 1)] FROM 1 FOR 1));
  ELSE
    v_last := upper(substring(v_parts[1] FROM 2 FOR 1));
    IF v_last IS NULL OR v_last = '' THEN
      v_last := v_first;
    END IF;
  END IF;

  v_prefix := v_first || v_last;

  SELECT COUNT(*) INTO v_count
  FROM public.profiles
  WHERE freelancer_code LIKE v_prefix || '%';

  LOOP
    v_code := v_prefix || lpad((v_count + 1)::TEXT, 3, '0');
    EXIT WHEN NOT EXISTS (
      SELECT 1 FROM public.profiles WHERE freelancer_code = v_code
    );
    v_count := v_count + 1;
  END LOOP;

  RETURN v_code;
END;
$$;

-- Allow authenticated users to call this RPC
GRANT EXECUTE ON FUNCTION public.generate_freelancer_code(TEXT) TO authenticated;
