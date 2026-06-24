import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { createServiceClient } from '@/lib/supabase-service'
import { stripe, stripeTimestampToISO } from '@/lib/stripe'

export const dynamic = 'force-dynamic'

export async function POST() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const service = createServiceClient()

  // Busca customer_id salvo
  const { data: sub } = await service
    .from('subscriptions')
    .select('stripe_customer_id')
    .eq('user_id', user.id)
    .maybeSingle()

  const customerId = sub?.stripe_customer_id as string | undefined
  if (!customerId) {
    return NextResponse.json({ plan: 'free', status: 'active', synced: false })
  }

  // Consulta o Stripe diretamente
  const subscriptions = await stripe.subscriptions.list({
    customer: customerId,
    status: 'all',
    limit: 5,
  })

  const active = subscriptions.data.find(s =>
    s.status === 'active' || s.status === 'trialing'
  )

  if (!active) {
    await service.from('subscriptions').update({
      plan: 'free',
      status: 'active',
      stripe_subscription_id: null,
      stripe_price_id: null,
      current_period_end: null,
    }).eq('user_id', user.id)
    return NextResponse.json({ plan: 'free', status: 'active', synced: true })
  }

  const priceId   = active.items.data[0]?.price.id ?? null
  const periodEnd = stripeTimestampToISO((active as unknown as { current_period_end?: number }).current_period_end ?? null)

  const { error: upsertError } = await service.from('subscriptions').upsert({
    user_id: user.id,
    plan: 'pro',
    status: active.status,
    stripe_customer_id: customerId,
    stripe_subscription_id: active.id,
    stripe_price_id: priceId,
    current_period_end: periodEnd,
  }, { onConflict: 'user_id' })

  if (upsertError) {
    console.error('Sync upsert error:', upsertError.message)
    return NextResponse.json({ plan: 'free', status: 'active', synced: false })
  }

  return NextResponse.json({ plan: 'pro', status: active.status, synced: true })
}
