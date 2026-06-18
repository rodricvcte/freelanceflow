-- Template support on the proposals table
ALTER TABLE proposals ADD COLUMN IF NOT EXISTS is_template    BOOLEAN DEFAULT false;
ALTER TABLE proposals ADD COLUMN IF NOT EXISTS template_nicho TEXT;
ALTER TABLE proposals ADD COLUMN IF NOT EXISTS template_icon  TEXT;

-- Index for fast template lookups
CREATE INDEX IF NOT EXISTS idx_proposals_templates
  ON proposals(is_template, user_id)
  WHERE is_template = true;

-- RLS: qualquer usuário autenticado pode ler templates do sistema
CREATE POLICY "Templates do sistema são públicos para usuários autenticados"
  ON proposals FOR SELECT
  TO authenticated
  USING (is_template = true AND user_id IS NULL);
