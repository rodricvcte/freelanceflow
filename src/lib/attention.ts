import { daysSince } from './formatters'

export type ProposalStub = {
  id: string
  title: string
  status: string
  sent_at: string | null
  created_at: string
  value?: number | null
}

export type FollowUpStub = {
  id: string
  type: 'email' | 'whatsapp'
  trigger_rule: string | null
  scheduled_for: string | null
  proposals: { id: string; title: string } | null
}

export type AttentionItem =
  | { kind: 'sent_no_view';     proposal: ProposalStub; daysAgo: number }
  | { kind: 'viewed_no_response'; proposal: ProposalStub; daysAgo: number }
  | { kind: 'stale_draft';       proposal: ProposalStub; daysAgo: number }
  | { kind: 'followup';          followUp: FollowUpStub; overdue: boolean }

export function getAttentionItems(
  proposals: ProposalStub[],
  followUps: FollowUpStub[],
  now = new Date(),
): AttentionItem[] {
  const items: AttentionItem[] = []
  const coveredIds = new Set<string>()

  for (const p of proposals) {
    const d = daysSince(p.sent_at ?? p.created_at)
    if (p.status === 'enviada' && d >= 5) {
      items.push({ kind: 'sent_no_view', proposal: p, daysAgo: d })
      coveredIds.add(p.id)
    } else if (p.status === 'visualizada' && d >= 2) {
      items.push({ kind: 'viewed_no_response', proposal: p, daysAgo: d })
      coveredIds.add(p.id)
    } else if (p.status === 'rascunho' && daysSince(p.created_at) >= 5) {
      items.push({ kind: 'stale_draft', proposal: p, daysAgo: daysSince(p.created_at) })
      coveredIds.add(p.id)
    }
  }

  for (const f of followUps) {
    if (!f.proposals || coveredIds.has(f.proposals.id)) continue
    const overdue = !!f.scheduled_for && new Date(f.scheduled_for) < now
    items.push({ kind: 'followup', followUp: f, overdue })
  }

  return items
}
