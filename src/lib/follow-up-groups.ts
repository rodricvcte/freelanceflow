export type FollowUpItem = {
  id: string
  type: 'email' | 'whatsapp'
  trigger_rule: string | null
  scheduled_for: string | null
  sent_at: string | null
  created_at: string
  proposals: { id: string; title: string; value: number | null; status: string; token: string; clients: { id: string; name: string } | null } | null
}

export type Groups = {
  overdue:  FollowUpItem[]
  today:    FollowUpItem[]
  tomorrow: FollowUpItem[]
  upcoming: FollowUpItem[]
  noDate:   FollowUpItem[]
}

export function dayStart(d: Date): number {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()
}

export function groupPending(items: FollowUpItem[], now = new Date()): Groups {
  const todayMs    = dayStart(now)
  const tomorrowMs = todayMs + 86_400_000
  const groups: Groups = { overdue: [], today: [], tomorrow: [], upcoming: [], noDate: [] }

  for (const f of items) {
    if (!f.scheduled_for) { groups.noDate.push(f); continue }
    const d = dayStart(new Date(f.scheduled_for))
    if      (d < todayMs)    groups.overdue.push(f)
    else if (d === todayMs)  groups.today.push(f)
    else if (d === tomorrowMs) groups.tomorrow.push(f)
    else                     groups.upcoming.push(f)
  }

  return groups
}
