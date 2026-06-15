import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { createServiceClient } from '@/lib/supabase-service'
import { stripe } from '@/lib/stripe'
import { APP_URL } from '@/lib/app-url'

export async function POST(_request: Request) {
  try {
    const priceId = process.env.STRIPE_PRICE_MONTHLY
    if (!priceId) return NextResponse.json({ error: 'STRIPE_PRICE_MONTHLY não configurado' }, { status: 500 })

    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const service = createServiceClient()

    const { data: sub } = await service
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .maybeSingle()

    let customerId = sub?.stripe_customer_id as string | undefined

    if (customerId) {
      // Validate the saved customer still exists in the current Stripe mode (test vs live)
      try {
        await stripe.customers.retrieve(customerId)
      } catch (err: unknown) {
        const stripeErr = err as { code?: string }
        if (stripeErr.code === 'resource_missing') {
          customerId = undefined // stale test-mode ID — will create a new one below
        } else {
          throw err
        }
      }
    }

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email!,
        metadata: { supabase_user_id: user.id },
      })
      customerId = customer.id

      await service.from('subscriptions').upsert({
        user_id: user.id,
        stripe_customer_id: customerId,
        plan: 'free',
        status: 'active',
      }, { onConflict: 'user_id' })
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${APP_URL}/dashboard?upgraded=true`,
      cancel_url:  `${APP_URL}/configuracoes?tab=plano`,
      allow_promotion_codes: true,
      metadata: { supabase_user_id: user.id },
      subscription_data: { metadata: { supabase_user_id: user.id } },
    })

    return NextResponse.json({ url: session.url })
  } catch (err) {
    console.error('[checkout]', err)
    const message = err instanceof Error ? err.message : 'Erro interno'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
