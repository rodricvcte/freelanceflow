-- Add freelancer signature image (base64 PNG) to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS signature_data TEXT;
