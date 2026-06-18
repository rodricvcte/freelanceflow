-- Allow user_id to be NULL for system templates (is_template = true)
ALTER TABLE proposals ALTER COLUMN user_id DROP NOT NULL;
