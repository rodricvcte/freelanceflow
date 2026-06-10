-- =============================================================================
-- FreelanceFlow – initial schema
-- =============================================================================
-- Idempotent: safe to re-run if a previous attempt failed midway.
-- Token generation uses gen_random_uuid() (built-in, no extension needed)
-- instead of gen_random_bytes(), which requires pgcrypto in search_path.
-- =============================================================================

-- =============================================================================
-- TABLES
-- =============================================================================

-- profiles ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id              uuid        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name       text,
  business_name   text,
  phone           text,
  logo_url        text,
  accent_color    text        NOT NULL DEFAULT '#1D9E75',
  updated_at      timestamptz NOT NULL DEFAULT now()
);

-- clients ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.clients (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name       text        NOT NULL,
  email      text,
  phone      text,
  notes      text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- proposals --------------------------------------------------------------
-- Token: two UUID4s stripped of hyphens → 64 hex chars, ~244 bits of entropy.
CREATE TABLE IF NOT EXISTS public.proposals (
  id                  uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id           uuid        REFERENCES public.clients(id) ON DELETE SET NULL,
  token               text        NOT NULL UNIQUE
                        DEFAULT replace(gen_random_uuid()::text || gen_random_uuid()::text, '-', ''),
  title               text        NOT NULL,
  service_description text,
  value               numeric(14, 2),
  payment_terms       text,
  deadline_days       integer,
  valid_until         date,
  status              text        NOT NULL DEFAULT 'draft'
                        CHECK (status IN ('draft','sent','viewed','accepted','rejected','expired')),
  pdf_url             text,
  sent_at             timestamptz,
  viewed_at           timestamptz,
  responded_at        timestamptz,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now()
);

-- proposal_events --------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.proposal_events (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id uuid        NOT NULL REFERENCES public.proposals(id) ON DELETE CASCADE,
  event_type  text        NOT NULL,
  metadata    jsonb       NOT NULL DEFAULT '{}',
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- follow_ups -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.follow_ups (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id   uuid        NOT NULL REFERENCES public.proposals(id) ON DELETE CASCADE,
  user_id       uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type          text        NOT NULL CHECK (type IN ('whatsapp','email')),
  trigger_rule  text,
  scheduled_for timestamptz,
  sent_at       timestamptz,
  created_at    timestamptz NOT NULL DEFAULT now()
);

-- subscriptions ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id                      uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                 uuid        NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  plan                    text        NOT NULL DEFAULT 'free'
                            CHECK (plan IN ('free','pro','premium')),
  status                  text        NOT NULL DEFAULT 'active'
                            CHECK (status IN ('active','canceled','past_due','trialing')),
  pagarme_subscription_id text,
  current_period_end      timestamptz,
  created_at              timestamptz NOT NULL DEFAULT now(),
  updated_at              timestamptz NOT NULL DEFAULT now()
);

-- =============================================================================
-- INDEXES
-- =============================================================================

CREATE INDEX IF NOT EXISTS clients_user_id_idx          ON public.clients(user_id);
CREATE INDEX IF NOT EXISTS proposals_user_id_idx        ON public.proposals(user_id);
CREATE INDEX IF NOT EXISTS proposals_client_id_idx      ON public.proposals(client_id);
CREATE INDEX IF NOT EXISTS proposals_token_idx          ON public.proposals(token);
CREATE INDEX IF NOT EXISTS proposal_events_proposal_idx ON public.proposal_events(proposal_id);
CREATE INDEX IF NOT EXISTS follow_ups_proposal_idx      ON public.follow_ups(proposal_id);
CREATE INDEX IF NOT EXISTS follow_ups_user_id_idx       ON public.follow_ups(user_id);
CREATE INDEX IF NOT EXISTS follow_ups_pending_idx
  ON public.follow_ups(scheduled_for) WHERE sent_at IS NULL;

-- =============================================================================
-- FUNCTIONS & TRIGGERS
-- =============================================================================

-- Reusable updated_at bumper ---------------------------------------------
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_updated_at_profiles      ON public.profiles;
DROP TRIGGER IF EXISTS set_updated_at_clients       ON public.clients;
DROP TRIGGER IF EXISTS set_updated_at_proposals     ON public.proposals;
DROP TRIGGER IF EXISTS set_updated_at_subscriptions ON public.subscriptions;

CREATE TRIGGER set_updated_at_profiles
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_updated_at_clients
  BEFORE UPDATE ON public.clients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_updated_at_proposals
  BEFORE UPDATE ON public.proposals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_updated_at_subscriptions
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Auto-create profile on signup ------------------------------------------
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- =============================================================================
-- ROW LEVEL SECURITY
-- =============================================================================

ALTER TABLE public.profiles        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proposals       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proposal_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follow_ups      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions   ENABLE ROW LEVEL SECURITY;

-- profiles ---------------------------------------------------------------
DROP POLICY IF EXISTS "profiles: owner select" ON public.profiles;
DROP POLICY IF EXISTS "profiles: owner update" ON public.profiles;

CREATE POLICY "profiles: owner select"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "profiles: owner update"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- clients ----------------------------------------------------------------
DROP POLICY IF EXISTS "clients: owner all" ON public.clients;

CREATE POLICY "clients: owner all"
  ON public.clients FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- proposals --------------------------------------------------------------
DROP POLICY IF EXISTS "proposals: owner all"              ON public.proposals;
DROP POLICY IF EXISTS "proposals: public select by token" ON public.proposals;

CREATE POLICY "proposals: owner all"
  ON public.proposals FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "proposals: public select by token"
  ON public.proposals FOR SELECT
  USING (token IS NOT NULL);

-- proposal_events --------------------------------------------------------
DROP POLICY IF EXISTS "proposal_events: owner select"                    ON public.proposal_events;
DROP POLICY IF EXISTS "proposal_events: owner insert"                    ON public.proposal_events;
DROP POLICY IF EXISTS "proposal_events: anonymous insert on shared proposals" ON public.proposal_events;

CREATE POLICY "proposal_events: owner select"
  ON public.proposal_events FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.proposals p
      WHERE p.id = proposal_id AND p.user_id = auth.uid()
    )
  );

CREATE POLICY "proposal_events: owner insert"
  ON public.proposal_events FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.proposals p
      WHERE p.id = proposal_id AND p.user_id = auth.uid()
    )
  );

CREATE POLICY "proposal_events: anonymous insert on shared proposals"
  ON public.proposal_events FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.proposals p
      WHERE p.id = proposal_id AND p.token IS NOT NULL
    )
  );

-- follow_ups -------------------------------------------------------------
DROP POLICY IF EXISTS "follow_ups: owner all" ON public.follow_ups;

CREATE POLICY "follow_ups: owner all"
  ON public.follow_ups FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- subscriptions ----------------------------------------------------------
DROP POLICY IF EXISTS "subscriptions: owner select" ON public.subscriptions;

CREATE POLICY "subscriptions: owner select"
  ON public.subscriptions FOR SELECT
  USING (auth.uid() = user_id);
