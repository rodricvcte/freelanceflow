-- Add signature style preference to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS signature_style TEXT DEFAULT 'double'
    CHECK (signature_style IN ('none', 'simple', 'double'));
