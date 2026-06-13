import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { createServiceClient } from '@/lib/supabase-service'
import { getViewAs } from '@/lib/view-as'

// ── Same helpers as cron ───────────────────────────────────────────────────────

function extractBase(pn: string | null): string | null {
  if (!pn) return null
  return pn.replace(/-v\d+$/, '')
}

function buildLatestVersionIds(
  all: Array<{ id: string; proposal_number: string | null; version: number | null; status: string }>
): Set<string> {
  const byBase = new Map<string, { id: string; version: number }>()
  for (const p of all) {
    if (p.status === 'rascunho') continue
    const base = extractBase(p.proposal_number)
    if (!base) continue
    const v = p.version ?? 1
    const cur = byBase.get(base)
    if (!cur || v > cur.version) byBase.set(base, { id: p.id, version: v })
  }
  const ids = new Set<string>()
  for (const { id } of byBase.values()) ids.add(id)
  for (const p of all) {
    if (!p.proposal_number && p.status !== 'rascunho') ids.add(p.id)
  }
  return ids
}

function dateStr(iso: string): string { return iso.split('T')[0] }

function addDays(ymd: string, n: number): string {
  const [y, m, d] = ymd.split('-').map(Number)
  const dt = new Date(y, m - 1, d)
  dt.setDate(dt.getDate() + n)
  return dt.toISOString().split('T')[0]
}

export type ScheduledItem = {
  proposal_id:     string
  proposal_number: string | null
  title:           string
  client_name:     string | null
  rule:            'R1' | 'R2' | 'expires_tomorrow'
  scheduled_date:  string
}

export type SentItem = {
  id:              string
  proposal_id:     string | null
  proposal_number: string | null
  title:           string
  client_name:     string | null
  rule:            string
  sent_at:         string
}

export async function GET() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const viewAs = await getViewAs(user)
  const qc     = viewAs ? createServiceClient() : supabase
  const uid    = viewAs?.id ?? user.id

  // ── Profile ────────────────────────────────────────────────────────────────
  const { data: profile } = await qc
    .from('profiles')
    .select('followup_days, followup_enabled, followup_expiry_enabled')
    .eq('id', uid)
    .single()

  const fupDays    = (profile?.followup_days    as number  | null) ?? 2
  const fupEnabled = (profile?.followup_enabled as boolean | null) ?? true
  const expEnabled = (profile?.followup_expiry_enabled as boolean | null) ?? true

  const today   = new Date().toISOString().split('T')[0]
  const in7Days = addDays(today, 7)

  // ── Latest version IDs ─────────────────────────────────────────────────────
  const { data: allProposals } = await qc
    .from('proposals')
    .select('id, proposal_number, version, status')
    .eq('user_id', uid)

  const latestIds = buildLatestVersionIds(
    (allProposals ?? []) as Array<{ id: string; proposal_number: string | null; version: number | null; status: string }>
  )

  // ── All sent follow_ups for this user (dedup + history) ────────────────────
  const { data: allSentRaw } = await qc
    .from('follow_ups')
    .select('id, proposal_id, trigger_rule, sent_at, proposals(id, title, proposal_number, recipient_name)')
    .eq('user_id', uid)
    .not('sent_at', 'is', null)
    .order('sent_at', { ascending: false })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const allSent = (allSentRaw ?? []) as unknown as Array<{
    id: string
    proposal_id: string
    trigger_rule: string
    sent_at: string
    proposals: { id: string; title: string; proposal_number: string | null; recipient_name: string | null } | null
  }>

  const sentR1Set         = new Set(allSent.filter(f => f.trigger_rule === 'R1').map(f => f.proposal_id))
  const sentR2Set         = new Set(allSent.filter(f => f.trigger_rule === 'R2').map(f => f.proposal_id))
  const sentExpirySet     = new Set(allSent.filter(f => f.trigger_rule === 'expires_tomorrow').map(f => f.proposal_id))

  // ── Build scheduled list ───────────────────────────────────────────────────
  const scheduled: ScheduledItem[] = []

  if (fupEnabled) {
    // R1 — enviada, not yet viewed
    const { data: r1 } = await qc
      .from('proposals')
      .select('id, title, proposal_number, recipient_name, sent_at')
      .eq('user_id', uid)
      .eq('status', 'enviada')
      .not('sent_at', 'is', null)
      .not('recipient_email', 'is', null)

    for (const p of r1 ?? []) {
      if (sentR1Set.has(p.id as string)) continue
      if (!latestIds.has(p.id as string)) continue
      const trigDate = addDays(dateStr(p.sent_at as string), fupDays)
      if (trigDate >= today && trigDate <= in7Days) {
        scheduled.push({
          proposal_id:     p.id as string,
          proposal_number: p.proposal_number as string | null,
          title:           (p.title as string) ?? '—',
          client_name:     (p.recipient_name as string | null) ?? null,
          rule:            'R1',
          scheduled_date:  trigDate,
        })
      }
    }

    // R2 — visualizada, no response
    const { data: r2 } = await qc
      .from('proposals')
      .select('id, title, proposal_number, recipient_name, viewed_at')
      .eq('user_id', uid)
      .eq('status', 'visualizada')
      .not('viewed_at', 'is', null)
      .is('responded_at', null)
      .not('recipient_email', 'is', null)

    for (const p of r2 ?? []) {
      if (sentR2Set.has(p.id as string)) continue
      if (!latestIds.has(p.id as string)) continue
      const trigDate = addDays(dateStr(p.viewed_at as string), fupDays)
      if (trigDate >= today && trigDate <= in7Days) {
        scheduled.push({
          proposal_id:     p.id as string,
          proposal_number: p.proposal_number as string | null,
          title:           (p.title as string) ?? '—',
          client_name:     (p.recipient_name as string | null) ?? null,
          rule:            'R2',
          scheduled_date:  trigDate,
        })
      }
    }
  }

  if (expEnabled) {
    // expires_tomorrow — valid_until within next 7 days
    const tomorrow = addDays(today, 1)
    const { data: expiry } = await qc
      .from('proposals')
      .select('id, title, proposal_number, recipient_name, valid_until')
      .eq('user_id', uid)
      .in('status', ['enviada', 'visualizada'])
      .gte('valid_until', tomorrow)
      .lte('valid_until', in7Days)
      .not('recipient_email', 'is', null)

    for (const p of expiry ?? []) {
      if (sentExpirySet.has(p.id as string)) continue
      if (!latestIds.has(p.id as string)) continue
      scheduled.push({
        proposal_id:     p.id as string,
        proposal_number: p.proposal_number as string | null,
        title:           (p.title as string) ?? '—',
        client_name:     (p.recipient_name as string | null) ?? null,
        rule:            'expires_tomorrow',
        scheduled_date:  dateStr(p.valid_until as string),
      })
    }
  }

  scheduled.sort((a, b) => a.scheduled_date.localeCompare(b.scheduled_date))

  // ── Sent history ───────────────────────────────────────────────────────────
  const sent: SentItem[] = allSent.map(f => ({
    id:              f.id,
    proposal_id:     f.proposals?.id ?? null,
    proposal_number: f.proposals?.proposal_number ?? null,
    title:           f.proposals?.title ?? '—',
    client_name:     f.proposals?.recipient_name ?? null,
    rule:            f.trigger_rule,
    sent_at:         f.sent_at,
  }))

  return NextResponse.json({ scheduled, sent })
}
