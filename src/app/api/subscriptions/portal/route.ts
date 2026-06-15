import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { createServiceClient } from '@/lib/supabase-service'
import { stripe } from '@/lib/stripe'
import { APP_URL } from '@/lib/app-url'

export async function POST() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const service = createServiceClient()
  const { data: sub } = await service
    .from('subscriptions')
    .select('stripe_customer_id')
    .eq('user_id', user.id)
    .maybeSingle()

  const customerId = sub?.stripe_customer_id as string | undefined
  if (!customerId) {
    return NextResponse.json({ error: 'Nenhuma assinatura encontrada' }, { status: 404 })
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${APP_URL}/configuracoes?tab=plano`,
  })

  return NextResponse.json({ url: session.url })
}
