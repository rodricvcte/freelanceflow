'use client'

import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import UpgradeModal from '@/components/UpgradeModal'

// ─── Types ───────────────────────────────────────────────────────────────────

type FollowUp = {
  id: string
  type: 'whatsapp' | 'email'
  trigger_rule: string | null
  scheduled_for: string | null
  sent_at: string | null
  created_at: string
  proposals: {
    id: string
    title: string
    value: number | null
    status: string
    token: string
    clients: { id: string; name: string } | null
  } | null
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const MOTIVO: Record<string, string> = {
  R1: 'Enviada há 5+ dias sem resposta',
  R2: 'Visualizada sem resposta',
  manual: 'Lembrete manual',
}

function getMotivo(rule: string | null) {
  if (!rule) return 'Lembrete manual'
  return MOTIVO[rule] ?? rule
}

function fmtBRL(v: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)
}

function fmtDateTime(s: string) {
  const d = new Date(s)
  return d.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function dayStart(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()
}

// ─── Grouping ─────────────────────────────────────────────────────────────────

type Groups = {
  overdue: FollowUp[]
  today: FollowUp[]
  tomorrow: FollowUp[]
  upcoming: FollowUp[]
  noDate: FollowUp[]
}

function groupPending(items: FollowUp[]): Groups {
  const now = dayStart(new Date())
  const tomorrow = now + 86_400_000
  const groups: Groups = { overdue: [], today: [], tomorrow: [], upcoming: [], noDate: [] }

  for (const f of items) {
    if (!f.scheduled_for) { groups.noDate.push(f); continue }
    const d = dayStart(new Date(f.scheduled_for))
    if (d < now)           groups.overdue.push(f)
    else if (d === now)    groups.today.push(f)
    else if (d === tomorrow) groups.tomorrow.push(f)
    else                   groups.upcoming.push(f)
  }
  return groups
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function FollowUpCard({
  item,
  onDone,
  completing,
}: {
  item: FollowUp
  onDone: (id: string) => void
  completing: string | null
}) {
  const p = item.proposals
  const clientName = Array.isArray(p?.clients) ? p?.clients[0]?.name : p?.clients?.name
  const busy = completing === item.id

  return (
    <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm flex flex-col gap-3">
      {/* Title + badge */}
      <div className="flex items-start justify-between gap-2">
        <p className="font-semibold text-gray-900 text-sm leading-snug line-clamp-2">
          {p?.title ?? '—'}
        </p>
        <span className={`shrink-0 px-2 py-0.5 rounded-full text-xs font-medium ${
          item.type === 'whatsapp'
            ? 'bg-green-100 text-green-700'
            : 'bg-blue-100 text-blue-700'
        }`}>
          {item.type === 'whatsapp' ? 'WhatsApp' : 'Email'}
        </span>
      </div>

      {/* Meta row */}
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
        <span className="flex items-center gap-1">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M12 20a8 8 0 100-16 8 8 0 000 16z" />
          </svg>
          {getMotivo(item.trigger_rule)}
        </span>
        {clientName && (
          <span className="flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            {clientName}
          </span>
        )}
        {p?.value != null && (
          <span className="font-medium text-gray-700">{fmtBRL(p.value)}</span>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-1">
        {p && (
          <Link
            href={`/propostas/${p.id}`}
            className="flex-1 text-center py-1.5 text-xs font-medium text-[#1D9E75] border border-[#1D9E75]/30 rounded-lg hover:bg-[#1D9E75]/5 transition-colors"
          >
            Ver Proposta
          </Link>
        )}
        <button
          onClick={() => onDone(item.id)}
          disabled={busy}
          className="flex-1 py-1.5 text-xs font-medium text-white bg-[#1D9E75] rounded-lg hover:bg-[#188f68] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {busy ? 'Salvando...' : 'Marcar como feito'}
        </button>
      </div>
    </div>
  )
}

function DoneCard({ item }: { item: FollowUp }) {
  const p = item.proposals
  const clientName = Array.isArray(p?.clients) ? p?.clients[0]?.name : p?.clients?.name

  return (
    <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm opacity-70 flex items-center justify-between gap-3">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-700 truncate">{p?.title ?? '—'}</p>
        <div className="flex gap-3 text-xs text-gray-400 mt-0.5">
          <span>{getMotivo(item.trigger_rule)}</span>
          {clientName && <span>· {clientName}</span>}
          {item.sent_at && <span>· Feito em {fmtDateTime(item.sent_at)}</span>}
        </div>
      </div>
      {p && (
        <Link href={`/propostas/${p.id}`} className="shrink-0 text-xs text-[#1D9E75] hover:underline">
          Ver
        </Link>
      )}
    </div>
  )
}

function GroupSection({
  label,
  accent,
  items,
  onDone,
  completing,
}: {
  label: string
  accent?: string
  items: FollowUp[]
  onDone: (id: string) => void
  completing: string | null
}) {
  if (!items.length) return null
  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-3">
        <span className={`text-xs font-semibold uppercase tracking-wider ${accent ?? 'text-gray-500'}`}>
          {label}
        </span>
        <span className={`px-1.5 py-0.5 rounded text-xs font-bold ${accent ? 'bg-[#1D9E75]/10 text-[#1D9E75]' : 'bg-gray-100 text-gray-500'}`}>
          {items.length}
        </span>
      </div>
      <div className="space-y-3">
        {items.map(f => (
          <FollowUpCard key={f.id} item={f} onDone={onDone} completing={completing} />
        ))}
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function FollowUpsPage() {
  const [items, setItems]         = useState<FollowUp[]>([])
  const [loading, setLoading]     = useState(true)
  const [tab, setTab]             = useState<'pending' | 'done'>('pending')
  const [completing, setComp]     = useState<string | null>(null)
  const [isPro, setIsPro]         = useState(true)
  const [showUpgrade, setUpgrade] = useState(false)

  useEffect(() => {
    Promise.all([
      fetch('/api/follow-ups').then(r => r.json()).catch(() => []),
      fetch('/api/subscriptions').then(r => r.json()).catch(() => ({})),
    ]).then(([fups, sub]) => {
      setItems(Array.isArray(fups) ? fups : [])
      setIsPro(sub.plan === 'pro' && (sub.status === 'active' || sub.status === 'trialing'))
      setLoading(false)
    })
  }, [])

  async function markDone(id: string) {
    setComp(id)
    try {
      const res = await fetch(`/api/follow-ups/${id}`, { method: 'PATCH' })
      if (res.ok) {
        const now = new Date().toISOString()
        setItems(prev => prev.map(f => f.id === id ? { ...f, sent_at: now } : f))
      }
    } finally {
      setComp(null)
    }
  }

  const pending = useMemo(() => items.filter(f => !f.sent_at), [items])
  const done    = useMemo(
    () => [...items.filter(f => !!f.sent_at)].sort(
      (a, b) => new Date(b.sent_at!).getTime() - new Date(a.sent_at!).getTime()
    ),
    [items]
  )

  const groups = useMemo(() => groupPending(pending), [pending])

  const pendingCount = pending.length

  if (!loading && !isPro) {
    return (
      <div className="p-6 md:p-8 max-w-2xl">
        <UpgradeModal open={showUpgrade} onClose={() => setUpgrade(false)} feature="Gerencie todos os seus follow-ups em um só lugar" />
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Follow-ups</h1>
        </div>
        <div className="bg-white border border-gray-100 rounded-2xl p-10 shadow-sm text-center">
          <div className="w-14 h-14 bg-[#1D9E75]/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-[#1D9E75]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Follow-ups disponíveis no Pro</h2>
          <p className="text-sm text-gray-500 mb-6 max-w-sm mx-auto">
            Agende lembretes por email ou WhatsApp, rastreie quais propostas precisam de atenção e nunca perca uma oportunidade.
          </p>
          <button
            onClick={() => setUpgrade(true)}
            className="px-6 py-3 bg-[#1D9E75] text-white text-sm font-semibold rounded-xl hover:bg-[#188f68] transition-colors"
          >
            Fazer upgrade para Pro
          </button>
          <p className="text-xs text-gray-400 mt-4">
            <Link href="/configuracoes?tab=plano" className="hover:underline">Ver todos os planos →</Link>
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 md:p-8 max-w-2xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Follow-ups</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          {pendingCount} {pendingCount === 1 ? 'lembrete pendente' : 'lembretes pendentes'}
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-gray-100 rounded-lg mb-6 w-fit">
        <button
          onClick={() => setTab('pending')}
          className={`flex items-center gap-1.5 px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
            tab === 'pending' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Pendentes
          {pendingCount > 0 && (
            <span className="bg-[#1D9E75] text-white text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center leading-none">
              {pendingCount > 9 ? '9+' : pendingCount}
            </span>
          )}
        </button>
        <button
          onClick={() => setTab('done')}
          className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
            tab === 'done' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Concluídos
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-6 h-6 border-2 border-[#1D9E75] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : tab === 'pending' ? (
        <>
          {pendingCount === 0 ? (
            <EmptyPending />
          ) : (
            <>
              <GroupSection label="Atrasados" accent="text-red-500" items={groups.overdue} onDone={markDone} completing={completing} />
              <GroupSection label="Hoje" accent="text-[#1D9E75]" items={groups.today} onDone={markDone} completing={completing} />
              <GroupSection label="Amanhã" items={groups.tomorrow} onDone={markDone} completing={completing} />
              <GroupSection label="Próximos dias" items={groups.upcoming} onDone={markDone} completing={completing} />
              <GroupSection label="Sem data" items={groups.noDate} onDone={markDone} completing={completing} />
            </>
          )}
        </>
      ) : (
        <>
          {done.length === 0 ? (
            <div className="text-center py-20 text-sm text-gray-400">Nenhum follow-up concluído ainda.</div>
          ) : (
            <div className="space-y-2">
              {done.map(f => <DoneCard key={f.id} item={f} />)}
            </div>
          )}
        </>
      )}
    </div>
  )
}

function EmptyPending() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <p className="text-sm font-medium text-gray-900 mb-1">Tudo em dia!</p>
      <p className="text-sm text-gray-500">Nenhum follow-up pendente no momento.</p>
    </div>
  )
}
