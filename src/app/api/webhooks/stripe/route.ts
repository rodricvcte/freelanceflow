import { NextResponse } from 'next/server'
import type Stripe from 'stripe'
import { stripe, stripeTimestampToISO } from '@/lib/stripe'
import { createServiceClient } from '@/lib/supabase-service'
import { Resend } from 'resend'
import { APP_URL } from '@/lib/app-url'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

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
  console.log('[stripe-webhook] POST received at', new Date().toISOString())

  const rawBody = await request.text()
  const sig = request.headers.get('stripe-signature') ?? ''
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  console.log('[stripe-webhook] has signature:', !!sig, '| has secret:', !!webhookSecret)

  let event: Stripe.Event

  if (webhookSecret) {
    try {
      event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret)
      console.log('[stripe-webhook] signature OK, event:', event.type)
    } catch (err) {
      console.error('[stripe-webhook] signature FAILED:', err instanceof Error ? err.message : err)
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }
  } else {
    // No secret configured — parse without verification (dev only)
    try {
      event = JSON.parse(rawBody) as Stripe.Event
      console.log('[stripe-webhook] no-secret mode, event:', event.type)
    } catch {
      console.error('[stripe-webhook] invalid JSON body')
      return NextResponse.json({ error: 'Invalid body' }, { status: 400 })
    }
  }

  const service = createServiceClient()

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      console.log('[stripe-webhook] checkout.session.completed — mode:', session.mode, 'customer:', session.customer)
      if (session.mode !== 'subscription') break

      const customerId = session.customer as string
      const subscriptionId = session.subscription as string
      const userId = session.metadata?.supabase_user_id
        ?? await findUserIdByCustomer(customerId)

      console.log('[stripe-webhook] userId:', userId, '| subscriptionId:', subscriptionId)

      if (!userId) {
        console.error('[stripe-webhook] user not found for customer:', customerId)
        break
      }

      // Fetch subscription to get price and period
      const stripeSub = await stripe.subscriptions.retrieve(subscriptionId)
      const priceId = stripeSub.items.data[0]?.price.id ?? null
      const periodEnd = stripeTimestampToISO((stripeSub as unknown as { current_period_end?: number }).current_period_end ?? null)

      const { error: upsertError } = await service.from('subscriptions').upsert({
        user_id: userId,
        plan: 'pro',
        status: 'active',
        stripe_customer_id: customerId,
        stripe_subscription_id: subscriptionId,
        stripe_price_id: priceId,
        current_period_end: periodEnd,
      }, { onConflict: 'user_id' })

      if (upsertError) {
        console.error('[stripe-webhook] upsert error:', upsertError)
      } else {
        console.log('[stripe-webhook] subscription activated for user:', userId)
      }
      break
    }

    case 'customer.subscription.updated': {
      const sub = event.data.object as Stripe.Subscription
      const customerId = sub.customer as string
      const userId = await findUserIdByCustomer(customerId)
      if (!userId) break

      const priceId = sub.items.data[0]?.price.id ?? null
      const periodEnd = stripeTimestampToISO((sub as unknown as { current_period_end?: number }).current_period_end ?? null)
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

      const periodEnd = stripeTimestampToISO((sub as unknown as { current_period_end?: number }).current_period_end ?? null)

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
          from:    'FreelanceFlow <contato@freelanceflow.com.br>',
          to:      invoice.customer_email,
          replyTo: 'rodrigosc19@gmail.com',
          subject: 'Falha no pagamento da sua assinatura FreelanceFlow',
          html: `<p>Olá,</p><p>Houve uma falha ao processar o pagamento da sua assinatura Pro. Por favor, atualize seu método de pagamento para continuar com acesso ilimitado.</p><p><a href="${APP_URL}/configuracoes?tab=plano">Gerenciar assinatura →</a></p>`,
        }).catch(() => {})
      }
      break
    }
  }

  return NextResponse.json({ received: true })
}
