import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { createServiceClient } from '@/lib/supabase-service'
import { buildFollowUpNotViewedHtml, buildFollowUpNotRespondedHtml, buildFollowUpExpiringTomorrowHtml } from '@/lib/email-templates/followup'

export const runtime = 'nodejs'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

// Extracts the base proposal number, stripping any trailing -vN suffix.
// "RC002-20260612-006-v2" → "RC002-20260612-006"
// "RC002-20260612-006"    → "RC002-20260612-006"
function extractBase(proposalNumber: string | null): string | null {
  if (!proposalNumber) return null
  return proposalNumber.replace(/-v\d+$/, '')
}

// Builds a set of proposal IDs that are the latest SENT version in their family.
// Drafts (rascunho) are excluded from "latest" — a draft is not visible to the client
// so the previous sent version should still receive follow-ups.
function buildLatestVersionIds(
  allProposals: Array<{ id: string; proposal_number: string | null; version: number | null; status: string }>
): Set<string> {
  const latestByBase = new Map<string, { id: string; version: number }>()

  for (const p of allProposals) {
    if (p.status === 'rascunho') continue
    const base = extractBase(p.proposal_number)
    if (!base) continue
    const v = p.version ?? 1
    const current = latestByBase.get(base)
    if (!current || v > current.version) {
      latestByBase.set(base, { id: p.id, version: v })
    }
  }

  const latestIds = new Set<string>()
  for (const { id } of latestByBase.values()) latestIds.add(id)

  // Proposals with no proposal_number and not drafts are always included
  for (const p of allProposals) {
    if (!p.proposal_number && p.status !== 'rascunho') latestIds.add(p.id)
  }

  return latestIds
}

export async function GET(request: Request) {
  const authHeader = request.headers.get('Authorization')
  const cronSecret = process.env.CRON_SECRET

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createServiceClient()
  const resend   = new Resend(process.env.RESEND_API_KEY)
  const now      = new Date()
  const results  = { r1_sent: 0, r2_sent: 0, r3_expired: 0, r_expiry_sent: 0 }

  // ── R3: expire proposals ────────────────────────────────────────────────────
  const todayStr = now.toISOString().split('T')[0]
  const { data: expired, error: r3Err } = await supabase
    .from('proposals')
    .update({ status: 'expirada' })
    .lt('valid_until', todayStr)
    .in('status', ['rascunho', 'enviada', 'visualizada'])
    .select('id')

  if (!r3Err && expired?.length) {
    results.r3_expired = expired.length
    await supabase.from('proposal_events').insert(
      expired.map(p => ({ proposal_id: p.id, event_type: 'expired', metadata: {} }))
    )
  }

  // ── Follow-up email sending ─────────────────────────────────────────────────
  let proUserIds: string[] | null = null
  if (process.env.DISABLE_PLAN_LIMITS !== 'true') {
    const { data: proSubs } = await supabase
      .from('subscriptions')
      .select('user_id')
      .neq('plan', 'free')
      .in('status', ['active', 'trialing'])
    proUserIds = (proSubs ?? []).map(s => s.user_id as string)
    if (!proUserIds.length) return NextResponse.json({ ok: true, ...results })
  }

  let profileQuery = supabase
    .from('profiles')
    .select('id, followup_days, followup_enabled, followup_expiry_enabled, full_name, business_name, logo_url, accent_color')
    .eq('followup_enabled', true)

  if (proUserIds !== null) profileQuery = profileQuery.in('id', proUserIds)

  const { data: profiles } = await profileQuery
  if (!profiles?.length) return NextResponse.json({ ok: true, ...results })

  for (const profile of profiles) {
    const days   = (profile.followup_days as number) ?? 2
    const cutoff = new Date(now)
    cutoff.setDate(cutoff.getDate() - days)

    const freelancerName = (profile.business_name ?? profile.full_name ?? 'Freelancer') as string
    const accentColor    = (profile.accent_color ?? '#1D9E75') as string
    const logoUrl        = (profile.logo_url ?? null) as string | null

    // Fetch all user proposals to determine which are the latest version per family
    const { data: allUserProposals } = await supabase
      .from('proposals')
      .select('id, proposal_number, version, status')
      .eq('user_id', profile.id)

    const latestVersionIds = buildLatestVersionIds(
      (allUserProposals ?? []) as Array<{ id: string; proposal_number: string | null; version: number | null; status: string }>
    )

    // ── R1: enviada, not yet viewed ─────────────────────────────────────────
    const { data: r1Proposals } = await supabase
      .from('proposals')
      .select('id, title, token, value, valid_until, proposal_number, version, recipient_email, recipient_name')
      .eq('user_id', profile.id)
      .eq('status', 'enviada')
      .lt('sent_at', cutoff.toISOString())
      .not('recipient_email', 'is', null)

    if (r1Proposals?.length) {
      const ids = r1Proposals.map(p => p.id as string)
      const { data: sentR1 } = await supabase
        .from('follow_ups')
        .select('proposal_id')
        .eq('trigger_rule', 'R1')
        .not('sent_at', 'is', null)
        .in('proposal_id', ids)

      const alreadySent = new Set(sentR1?.map(f => f.proposal_id as string) ?? [])
      const toSend = r1Proposals.filter(p =>
        !alreadySent.has(p.id as string) && latestVersionIds.has(p.id as string)
      )

      for (const p of toSend) {
        const clientName = (p.recipient_name as string | null) || 'Cliente'
        const html = buildFollowUpNotViewedHtml({
          clientName,
          freelancerName,
          freelancerLogoUrl: logoUrl,
          accentColor,
          proposalTitle:      (p.title as string) ?? '',
          proposalNumber:     (p.proposal_number as string | null) ?? null,
          proposalValue:      (p.value as number | null) ?? null,
          proposalValidUntil: (p.valid_until as string | null) ?? null,
          viewUrl: `${APP_URL}/api/track/view/${p.token}`,
        })

        const { error } = await resend.emails.send({
          from:    `${freelancerName} via FreelanceFlow <onboarding@resend.dev>`,
          to:      p.recipient_email as string,
          subject: `Sua proposta está aguardando — ${p.title}`,
          html,
        })

        if (!error) {
          await Promise.all([
            supabase.from('follow_ups').insert({
              proposal_id:   p.id,
              user_id:       profile.id,
              type:          'email',
              trigger_rule:  'R1',
              scheduled_for: now.toISOString(),
              sent_at:       now.toISOString(),
            }),
            supabase.from('proposal_events').insert({
              proposal_id: p.id,
              event_type:  'follow_up_sent',
              metadata:    { rule: 'R1', recipient_email: p.recipient_email },
            }),
          ])
          results.r1_sent++
        }
      }
    }

    // ── R2: visualizada, no response ────────────────────────────────────────
    const { data: r2Proposals } = await supabase
      .from('proposals')
      .select('id, title, token, value, valid_until, proposal_number, version, recipient_email, recipient_name')
      .eq('user_id', profile.id)
      .eq('status', 'visualizada')
      .lt('viewed_at', cutoff.toISOString())
      .is('responded_at', null)
      .not('recipient_email', 'is', null)

    if (r2Proposals?.length) {
      const ids = r2Proposals.map(p => p.id as string)
      const { data: sentR2 } = await supabase
        .from('follow_ups')
        .select('proposal_id')
        .eq('trigger_rule', 'R2')
        .not('sent_at', 'is', null)
        .in('proposal_id', ids)

      const alreadySent = new Set(sentR2?.map(f => f.proposal_id as string) ?? [])
      const toSend = r2Proposals.filter(p =>
        !alreadySent.has(p.id as string) && latestVersionIds.has(p.id as string)
      )

      for (const p of toSend) {
        const clientName = (p.recipient_name as string | null) || 'Cliente'
        const html = buildFollowUpNotRespondedHtml({
          clientName,
          freelancerName,
          freelancerLogoUrl: logoUrl,
          accentColor,
          proposalTitle:      (p.title as string) ?? '',
          proposalNumber:     (p.proposal_number as string | null) ?? null,
          proposalValue:      (p.value as number | null) ?? null,
          proposalValidUntil: (p.valid_until as string | null) ?? null,
          viewUrl: `${APP_URL}/api/track/view/${p.token}`,
        })

        const { error } = await resend.emails.send({
          from:    `${freelancerName} via FreelanceFlow <onboarding@resend.dev>`,
          to:      p.recipient_email as string,
          subject: `Ficou com alguma dúvida? — ${p.title}`,
          html,
        })

        if (!error) {
          await Promise.all([
            supabase.from('follow_ups').insert({
              proposal_id:   p.id,
              user_id:       profile.id,
              type:          'email',
              trigger_rule:  'R2',
              scheduled_for: now.toISOString(),
              sent_at:       now.toISOString(),
            }),
            supabase.from('proposal_events').insert({
              proposal_id: p.id,
              event_type:  'follow_up_sent',
              metadata:    { rule: 'R2', recipient_email: p.recipient_email },
            }),
          ])
          results.r2_sent++
        }
      }
    }

    // ── expires_tomorrow: expira amanhã ─────────────────────────────────────
    if (profile.followup_expiry_enabled) {
      const tomorrow = new Date(now)
      tomorrow.setDate(tomorrow.getDate() + 1)
      const tomorrowStr = tomorrow.toISOString().split('T')[0]

      const { data: expiringProposals } = await supabase
        .from('proposals')
        .select('id, title, token, value, valid_until, proposal_number, version, recipient_email, recipient_name')
        .eq('user_id', profile.id)
        .eq('valid_until', tomorrowStr)
        .in('status', ['enviada', 'visualizada'])
        .not('recipient_email', 'is', null)

      if (expiringProposals?.length) {
        const ids = expiringProposals.map(p => p.id as string)
        const { data: sentExpiry } = await supabase
          .from('follow_ups')
          .select('proposal_id')
          .eq('trigger_rule', 'expires_tomorrow')
          .not('sent_at', 'is', null)
          .in('proposal_id', ids)

        const alreadySent = new Set(sentExpiry?.map(f => f.proposal_id as string) ?? [])
        const toSend = expiringProposals.filter(p =>
          !alreadySent.has(p.id as string) && latestVersionIds.has(p.id as string)
        )

        for (const p of toSend) {
          const clientName = (p.recipient_name as string | null) || 'Cliente'
          const html = buildFollowUpExpiringTomorrowHtml({
            clientName,
            freelancerName,
            freelancerLogoUrl: logoUrl,
            accentColor,
            proposalTitle:      (p.title as string) ?? '',
            proposalNumber:     (p.proposal_number as string | null) ?? null,
            proposalValue:      (p.value as number | null) ?? null,
            proposalValidUntil: (p.valid_until as string | null) ?? null,
            viewUrl: `${APP_URL}/api/track/view/${p.token}`,
          })

          const { error } = await resend.emails.send({
            from:    `${freelancerName} via FreelanceFlow <onboarding@resend.dev>`,
            to:      p.recipient_email as string,
            subject: `Sua proposta expira amanhã — ${p.title}`,
            html,
          })

          if (!error) {
            await Promise.all([
              supabase.from('follow_ups').insert({
                proposal_id:   p.id,
                user_id:       profile.id,
                type:          'email',
                trigger_rule:  'expires_tomorrow',
                scheduled_for: now.toISOString(),
                sent_at:       now.toISOString(),
              }),
              supabase.from('proposal_events').insert({
                proposal_id: p.id,
                event_type:  'follow_up_sent',
                metadata:    { rule: 'expires_tomorrow', recipient_email: p.recipient_email },
              }),
            ])
            results.r_expiry_sent++
          }
        }
      }
    }
  }

  return NextResponse.json({ ok: true, ...results })
}
