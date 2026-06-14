ALTER TABLE public.founder_leads ADD COLUMN IF NOT EXISTS coupon_sent BOOLEAN NOT NULL DEFAULT false;
