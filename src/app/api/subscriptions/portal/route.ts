import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { createServiceClient } from '@/lib/supabase-service'
import { stripe } from '@/lib/stripe'
import { APP_URL } from '@/lib/app-url'

export async function POST() {
  try {
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
    if (!customerId) {
      return NextResponse.json({ error: 'Nenhuma assinatura encontrada' }, { status: 404 })
    }

    // Validate customer still exists in current Stripe mode (test vs live)
    try {
      await stripe.customers.retrieve(customerId)
    } catch (err: unknown) {
      const stripeErr = err as { code?: string }
      if (stripeErr.code === 'resource_missing') {
        customerId = undefined
      } else {
        throw err
      }
    }

    if (!customerId) {
      return NextResponse.json({ error: 'Assinatura de teste detectada. Assine novamente pelo plano.' }, { status: 404 })
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${APP_URL}/configuracoes?tab=plano`,
    })

    return NextResponse.json({ url: session.url })
  } catch (err) {
    console.error('[portal]', err)
    const message = err instanceof Error ? err.message : 'Erro interno'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
