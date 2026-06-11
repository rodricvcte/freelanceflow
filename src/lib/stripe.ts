import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-05-27.dahlia',
})

/** Converte Unix timestamp (segundos) ou string ISO para ISO string segura */
export function stripeTimestampToISO(val: number | string | null | undefined): string | null {
  if (val === null || val === undefined) return null
  if (typeof val === 'string') return val
  if (typeof val === 'number' && isFinite(val) && val > 0) {
    return new Date(val * 1000).toISOString()
  }
  return null
}
