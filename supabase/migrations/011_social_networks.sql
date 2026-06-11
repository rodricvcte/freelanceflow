-- Add social network fields to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS instagram TEXT,
  ADD COLUMN IF NOT EXISTS linkedin  TEXT,
  ADD COLUMN IF NOT EXISTS facebook  TEXT,
  ADD COLUMN IF NOT EXISTS youtube   TEXT,
  ADD COLUMN IF NOT EXISTS tiktok    TEXT;
