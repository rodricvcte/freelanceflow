-- Adiciona colunas do Stripe e remove Pagar.me
ALTER TABLE public.subscriptions
  ADD COLUMN IF NOT EXISTS stripe_customer_id     TEXT,
  ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT,
  ADD COLUMN IF NOT EXISTS stripe_price_id        TEXT;

ALTER TABLE public.subscriptions
  DROP COLUMN IF EXISTS pagarme_subscription_id;
