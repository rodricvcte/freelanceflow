import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { canCreateProposal } from '@/lib/plan'

export async function GET() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: sub } = await supabase
    .from('subscriptions')
    .select('plan, status, current_period_end, pagarme_subscription_id')
    .eq('user_id', user.id)
    .maybeSingle()

  const { used, limit } = await canCreateProposal(user.id, supabase)

  return NextResponse.json({
    plan: sub?.plan ?? 'free',
    status: sub?.status ?? 'active',
    current_period_end: sub?.current_period_end ?? null,
    pagarme_subscription_id: sub?.pagarme_subscription_id ?? null,
    used,
    limit,
  })
}
