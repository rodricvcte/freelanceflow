CREATE TABLE proposal_notes (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id UUID        NOT NULL REFERENCES proposals(id) ON DELETE CASCADE,
  user_id     UUID        NOT NULL REFERENCES auth.users(id),
  content     TEXT        NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE proposal_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuário acessa apenas suas notas"
  ON proposal_notes FOR ALL
  USING (user_id = auth.uid());

CREATE INDEX ON proposal_notes(proposal_id);
