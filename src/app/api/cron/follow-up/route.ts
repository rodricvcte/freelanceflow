import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase-service'

export async function GET(request: Request) {
  const authHeader = request.headers.get('Authorization')
  const cronSecret = process.env.CRON_SECRET

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createServiceClient()
  const now = new Date()
  const results = { r1_created: 0, r2_created: 0, r3_expired: 0 }

  // Build Pro user ID filter (skip if limits disabled)
  let proUserIds: string[] | null = null
  if (process.env.DISABLE_PLAN_LIMITS !== 'true') {
    const { data: proSubs } = await supabase
      .from('subscriptions')
      .select('user_id')
      .neq('plan', 'free')
      .in('status', ['active', 'trialing'])
    proUserIds = (proSubs ?? []).map(s => s.user_id as string)
    if (!proUserIds.length) {
      // No Pro users — skip R1/R2 follow-up creation but still expire proposals
      proUserIds = []
    }
  }

  // ── R1: sent > 5 days ago, no pending R1 follow-up (Pro users only) ──────────
  if (proUserIds === null || proUserIds.length > 0) {
    const r1Cutoff = new Date(now)
    r1Cutoff.setDate(r1Cutoff.getDate() - 5)

    let r1Query = supabase
      .from('proposals')
      .select('id, user_id')
      .eq('status', 'enviada')
      .lt('sent_at', r1Cutoff.toISOString())

    if (proUserIds !== null) r1Query = r1Query.in('user_id', proUserIds)

    const { data: r1Proposals } = await r1Query

    if (r1Proposals?.length) {
      const ids = r1Proposals.map(p => p.id)

      const { data: existingR1 } = await supabase
        .from('follow_ups')
        .select('proposal_id')
        .eq('trigger_rule', 'R1')
        .is('sent_at', null)
        .in('proposal_id', ids)

      const coveredIds = new Set(existingR1?.map(f => f.proposal_id) ?? [])
      const toCreate = r1Proposals.filter(p => !coveredIds.has(p.id))

      if (toCreate.length) {
        const { error } = await supabase.from('follow_ups').insert(
          toCreate.map(p => ({
            proposal_id: p.id,
            user_id: p.user_id,
            type: 'email',
            trigger_rule: 'R1',
            scheduled_for: now.toISOString(),
          }))
        )
        if (!error) results.r1_created = toCreate.length
      }
    }
  }

  // ── R2: viewed > 2 days ago, no response, no pending R2 follow-up ─────────────
  if (proUserIds === null || proUserIds.length > 0) {
    const r2Cutoff = new Date(now)
    r2Cutoff.setDate(r2Cutoff.getDate() - 2)

    let r2Query = supabase
      .from('proposals')
      .select('id, user_id')
      .eq('status', 'visualizada')
      .lt('viewed_at', r2Cutoff.toISOString())
      .is('responded_at', null)

    if (proUserIds !== null) r2Query = r2Query.in('user_id', proUserIds)

    const { data: r2Proposals } = await r2Query

    if (r2Proposals?.length) {
      const ids = r2Proposals.map(p => p.id)

      const { data: existingR2 } = await supabase
        .from('follow_ups')
        .select('proposal_id')
        .eq('trigger_rule', 'R2')
        .is('sent_at', null)
        .in('proposal_id', ids)

      const coveredIds = new Set(existingR2?.map(f => f.proposal_id) ?? [])
      const toCreate = r2Proposals.filter(p => !coveredIds.has(p.id))

      if (toCreate.length) {
        const { error } = await supabase.from('follow_ups').insert(
          toCreate.map(p => ({
            proposal_id: p.id,
            user_id: p.user_id,
            type: 'email',
            trigger_rule: 'R2',
            scheduled_for: now.toISOString(),
          }))
        )
        if (!error) results.r2_created = toCreate.length
      }
    }
  }

  // ── R3: valid_until < today → mark as expired (all users) ────────────────────
  const todayStr = now.toISOString().split('T')[0]

  const { data: expired, error: r3Err } = await supabase
    .from('proposals')
    .update({ status: 'expired' })
    .lt('valid_until', todayStr)
    .in('status', ['rascunho', 'enviada', 'visualizada'])
    .select('id')

  if (!r3Err) results.r3_expired = expired?.length ?? 0

  return NextResponse.json({ ok: true, ...results })
}
