-- Allow authenticated users to insert their own profile row.
-- Needed because upsert (INSERT ... ON CONFLICT) checks INSERT policy first,
-- even when the row already exists and the operation resolves to UPDATE.
DROP POLICY IF EXISTS "profiles: owner insert" ON public.profiles;
CREATE POLICY "profiles: owner insert"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);
