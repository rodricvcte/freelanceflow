import type { SupabaseClient } from '@supabase/supabase-js'

export const FREE_MONTHLY_PROPOSAL_LIMIT = 5
export const FREE_CLIENT_LIMIT = 5
export const FREE_MONTHLY_LIMIT = FREE_MONTHLY_PROPOSAL_LIMIT // backwards compat

const DISABLED = process.env.DISABLE_PLAN_LIMITS === 'true'

async function getSubscription(userId: string, supabase: SupabaseClient) {
  const { data } = await supabase
    .from('subscriptions')
    .select('plan, status')
    .eq('user_id', userId)
    .maybeSingle()
  return data
}

function isProSub(sub: { plan: string; status: string } | null): boolean {
  return !!sub && sub.plan !== 'free' && (sub.status === 'active' || sub.status === 'trialing')
}

export async function isPro(userId: string, supabase: SupabaseClient): Promise<boolean> {
  if (DISABLED) return true
  return isProSub(await getSubscription(userId, supabase))
}

export async function canCreateProposal(
  userId: string,
  supabase: SupabaseClient
): Promise<{ allowed: boolean; used: number; limit: number }> {
  if (DISABLED) return { allowed: true, used: 0, limit: FREE_MONTHLY_PROPOSAL_LIMIT }

  const sub = await getSubscription(userId, supabase)
  if (isProSub(sub)) return { allowed: true, used: 0, limit: FREE_MONTHLY_PROPOSAL_LIMIT }

  const monthStart = new Date()
  monthStart.setDate(1)
  monthStart.setHours(0, 0, 0, 0)

  const { count, error } = await supabase
    .from('proposals')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('created_at', monthStart.toISOString())

  if (error) return { allowed: true, used: 0, limit: FREE_MONTHLY_PROPOSAL_LIMIT }

  const used = count ?? 0
  return { allowed: used < FREE_MONTHLY_PROPOSAL_LIMIT, used, limit: FREE_MONTHLY_PROPOSAL_LIMIT }
}

export async function canCreateClient(
  userId: string,
  supabase: SupabaseClient
): Promise<{ allowed: boolean; used: number; limit: number }> {
  if (DISABLED) return { allowed: true, used: 0, limit: FREE_CLIENT_LIMIT }

  const sub = await getSubscription(userId, supabase)
  if (isProSub(sub)) return { allowed: true, used: 0, limit: FREE_CLIENT_LIMIT }

  const { count, error } = await supabase
    .from('clients')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)

  if (error) return { allowed: true, used: 0, limit: FREE_CLIENT_LIMIT }

  const used = count ?? 0
  return { allowed: used < FREE_CLIENT_LIMIT, used, limit: FREE_CLIENT_LIMIT }
}

// Tracking and follow-ups are available on all plans
export async function canUseTracking(_userId: string, _supabase: SupabaseClient): Promise<boolean> {
  return true
}

export async function canUseFollowUps(_userId: string, _supabase: SupabaseClient): Promise<boolean> {
  return true
}

export async function canUseTemplates(userId: string, supabase: SupabaseClient): Promise<boolean> {
  return isPro(userId, supabase)
}

export async function canUseIdentityExtractor(userId: string, supabase: SupabaseClient): Promise<boolean> {
  return isPro(userId, supabase)
}

export async function canUseCustomColor(userId: string, supabase: SupabaseClient): Promise<boolean> {
  return isPro(userId, supabase)
}

export async function canRemoveBranding(userId: string, supabase: SupabaseClient): Promise<boolean> {
  return isPro(userId, supabase)
}
