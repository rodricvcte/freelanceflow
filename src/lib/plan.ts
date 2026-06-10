import type { SupabaseClient } from '@supabase/supabase-js'

export const FREE_MONTHLY_LIMIT = 5

export async function canCreateProposal(
  userId: string,
  supabase: SupabaseClient
): Promise<{ allowed: boolean; used: number; limit: number }> {
  const { data: sub } = await supabase
    .from('subscriptions')
    .select('plan, status')
    .eq('user_id', userId)
    .maybeSingle()

  const isPro =
    !!sub &&
    sub.plan !== 'free' &&
    (sub.status === 'active' || sub.status === 'trialing')

  if (isPro) return { allowed: true, used: 0, limit: Infinity }

  const monthStart = new Date()
  monthStart.setDate(1)
  monthStart.setHours(0, 0, 0, 0)

  const { count } = await supabase
    .from('proposals')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('created_at', monthStart.toISOString())

  const used = count ?? 0
  return { allowed: used < FREE_MONTHLY_LIMIT, used, limit: FREE_MONTHLY_LIMIT }
}
