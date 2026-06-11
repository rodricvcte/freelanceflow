import { NextResponse } from 'next/server'
import type Stripe from 'stripe'
import { stripe } from '@/lib/stripe'
import { createServiceClient } from '@/lib/supabase-service'
import { Resend } from 'resend'

export const runtime = 'nodejs'

async function findUserIdByCustomer(customerId: string): Promise<string | null> {
  const service = createServiceClient()
  const { data } = await service
    .from('subscriptions')
    .select('user_id')
    .eq('stripe_customer_id', customerId)
    .maybeSingle()
  return data?.user_id ?? null
}

export async function POST(request: Request) {
  const rawBody = await request.text()
  const sig = request.headers.get('stripe-signature') ?? ''
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  let event: Stripe.Event

  if (webhookSecret) {
    try {
      event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret)
    } catch {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }
  } else {
    // No secret configured — parse without verification (dev only)
    try {
      event = JSON.parse(rawBody) as Stripe.Event
    } catch {
      return NextResponse.json({ error: 'Invalid body' }, { status: 400 })
    }
  }

  const service = createServiceClient()

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      if (session.mode !== 'subscription') break

      const customerId = session.customer as string
      const subscriptionId = session.subscription as string
      const userId = session.metadata?.supabase_user_id
        ?? await findUserIdByCustomer(customerId)

      if (!userId) break

      // Fetch subscription to get price and period
      const stripeSub = await stripe.subscriptions.retrieve(subscriptionId)
      const priceId = stripeSub.items.data[0]?.price.id ?? null
      const periodEnd = new Date(stripeSub.current_period_end * 1000).toISOString()

      await service.from('subscriptions').upsert({
        user_id: userId,
        plan: 'pro',
        status: 'active',
        stripe_customer_id: customerId,
        stripe_subscription_id: subscriptionId,
        stripe_price_id: priceId,
        current_period_end: periodEnd,
      }, { onConflict: 'user_id' })
      break
    }

    case 'customer.subscription.updated': {
      const sub = event.data.object as Stripe.Subscription
      const customerId = sub.customer as string
      const userId = await findUserIdByCustomer(customerId)
      if (!userId) break

      const priceId = sub.items.data[0]?.price.id ?? null
      const periodEnd = new Date(sub.current_period_end * 1000).toISOString()
      const status = sub.status === 'active' ? 'active'
        : sub.status === 'trialing' ? 'trialing'
        : sub.status === 'past_due' ? 'past_due'
        : sub.status === 'canceled' ? 'canceled'
        : 'active'

      await service.from('subscriptions').update({
        status,
        stripe_subscription_id: sub.id,
        stripe_price_id: priceId,
        current_period_end: periodEnd,
      }).eq('user_id', userId)
      break
    }

    case 'customer.subscription.deleted': {
      const sub = event.data.object as Stripe.Subscription
      const customerId = sub.customer as string
      const userId = await findUserIdByCustomer(customerId)
      if (!userId) break

      const periodEnd = new Date(sub.current_period_end * 1000).toISOString()

      await service.from('subscriptions').update({
        plan: 'pro',  // mantém pro até expirar
        status: 'canceled',
        current_period_end: periodEnd,
      }).eq('user_id', userId)
      break
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice
      const customerId = invoice.customer as string
      const userId = await findUserIdByCustomer(customerId)
      if (!userId) break

      await service.from('subscriptions').update({ status: 'past_due' }).eq('user_id', userId)

      // Notify via email
      const resendKey = process.env.RESEND_API_KEY
      if (resendKey && invoice.customer_email) {
        const resend = new Resend(resendKey)
        await resend.emails.send({
          from: 'FreelanceFlow <onboarding@resend.dev>',
          to: invoice.customer_email,
          subject: 'Falha no pagamento da sua assinatura FreelanceFlow',
          html: `<p>Olá,</p><p>Houve uma falha ao processar o pagamento da sua assinatura Pro. Por favor, atualize seu método de pagamento para continuar com acesso ilimitado.</p><p><a href="${process.env.NEXT_PUBLIC_APP_URL}/configuracoes?tab=plano">Gerenciar assinatura →</a></p>`,
        }).catch(() => {})
      }
      break
    }
  }

  return NextResponse.json({ received: true })
}
