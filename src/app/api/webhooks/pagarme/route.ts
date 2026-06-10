import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { createServiceClient } from '@/lib/supabase-service'

export const runtime = 'nodejs'

function verifySignature(rawBody: string, signature: string, secret: string): boolean {
  const computed = crypto
    .createHmac('sha256', secret)
    .update(rawBody)
    .digest('hex')
  try {
    return crypto.timingSafeEqual(
      Buffer.from(computed, 'hex'),
      Buffer.from(signature.replace(/^sha256=/, ''), 'hex')
    )
  } catch {
    return false
  }
}

export async function POST(request: Request) {
  const webhookSecret = process.env.PAGARME_WEBHOOK_SECRET
  if (!webhookSecret) {
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 })
  }

  const rawBody = await request.text()
  const signature = request.headers.get('x-pagarme-signature') ?? ''

  if (!verifySignature(rawBody, signature, webhookSecret)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  let event: { type: string; data: Record<string, unknown> }
  try {
    event = JSON.parse(rawBody)
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const supabase = createServiceClient()
  const sub = event.data as Record<string, unknown>
  const customer = sub.customer as Record<string, unknown> | undefined

  // user_id is stored in customer.code when creating the subscription
  const userId: string | undefined =
    (customer?.code as string | undefined) ??
    ((sub.metadata as Record<string, string> | undefined)?.user_id)

  if (!userId) {
    return NextResponse.json({ error: 'user_id not found in payload' }, { status: 422 })
  }

  const pagarmeSubId = sub.id as string | undefined
  const currentCycle = sub.current_cycle as Record<string, string> | undefined
  const periodEnd = currentCycle?.end_date ?? null

  switch (event.type) {
    case 'subscription.created': {
      await supabase.from('subscriptions').upsert(
        {
          user_id: userId,
          plan: 'pro',
          status: 'active',
          pagarme_subscription_id: pagarmeSubId,
          current_period_end: periodEnd,
        },
        { onConflict: 'user_id' }
      )
      break
    }

    case 'subscription.canceled': {
      await supabase
        .from('subscriptions')
        .update({ status: 'canceled' })
        .eq('user_id', userId)
      break
    }

    case 'subscription.payment_failed': {
      await supabase
        .from('subscriptions')
        .update({ status: 'past_due' })
        .eq('user_id', userId)
      break
    }

    case 'subscription.renewed': {
      await supabase
        .from('subscriptions')
        .update({
          status: 'active',
          current_period_end: periodEnd,
        })
        .eq('user_id', userId)
      break
    }

    default:
      // Unhandled event type — acknowledge receipt
      break
  }

  return NextResponse.json({ received: true })
}
