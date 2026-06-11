import { NextResponse } from 'next/server'
import { unstable_noStore as noStore } from 'next/cache'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { canCreateProposal } from '@/lib/plan'

export const dynamic = 'force-dynamic'

export async function GET() {
  noStore()
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: sub } = await supabase
    .from('subscriptions')
    .select('plan, status, current_period_end, stripe_customer_id, stripe_subscription_id, stripe_price_id')
    .eq('user_id', user.id)
    .maybeSingle()

  const { used, limit } = await canCreateProposal(user.id, supabase)

  return NextResponse.json({
    plan:                   sub?.plan                   ?? 'free',
    status:                 sub?.status                 ?? 'active',
    current_period_end:     sub?.current_period_end     ?? null,
    stripe_customer_id:     sub?.stripe_customer_id     ?? null,
    stripe_subscription_id: sub?.stripe_subscription_id ?? null,
    stripe_price_id:        sub?.stripe_price_id        ?? null,
    used,
    limit,
  }, { headers: { 'Cache-Control': 'no-store' } })
}
