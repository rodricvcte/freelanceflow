'use client'

import React, { useEffect, useState, useMemo, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase-browser'

// ─── Types ────────────────────────────────────────────────────────────────────

type Proposal = {
  id: string
  title: string
  value: number | null
  status: string
  created_at: string
  version: number
  code: string | null
  proposal_number: string | null
  pdf_url: string | null
  clients: { id: string; name: string } | null
}

type Client = { id: string; name: string }

type TimelineEvent = {
  id: string
  event_type: string
  metadata: Record<string, unknown>
  created_at: string
}

// ─── Config ───────────────────────────────────────────────────────────────────

const STATUS_CONFIG = {
  rascunho:    { label: 'Rascunho',    className: 'bg-gray-100 text-gray-500' },
  enviada:     { label: 'Enviada',     className: 'bg-blue-100 text-blue-700' },
  visualizada: { label: 'Visualizada', className: 'bg-yellow-100 text-yellow-700' },
  aceita:      { label: 'Aceita',      className: 'bg-[#1D9E75]/10 text-[#1D9E75]' },
  recusada:    { label: 'Recusada',    className: 'bg-red-100 text-red-700' },
  expirada:    { label: 'Expirada',    className: 'bg-orange-100 text-orange-700' },
  cancelada:   { label: 'Cancelada',   className: 'bg-red-200 text-red-900' },
} as const

const STATUS_ORDER = ['all', 'rascunho', 'enviada', 'visualizada', 'aceita', 'recusada', 'expirada', 'cancelada'] as const

const PERIOD_OPTIONS = [
  { label: 'Todos os períodos', value: 'all' },
  { label: 'Hoje',              value: 'today' },
  { label: 'Esta semana',       value: 'week' },
  { label: 'Este mês',          value: 'month' },
  { label: 'Últimos 3 meses',   value: '3months' },
]

const VALUE_OPTIONS = [
  { label: 'Todos os valores', value: 'all' },
  { label: 'Até R$ 1.000',    value: 'lt1k' },
  { label: 'R$ 1k – R$ 10k',  value: '1k-10k' },
  { label: 'R$ 10k – R$ 50k', value: '10k-50k' },
  { label: 'Acima de R$ 50k', value: 'gt50k' },
]

const EVENT_CONFIG: Record<string, { label: string; dot: string }> = {
  created:        { label: 'Criada',       dot: 'bg-gray-400' },
  sent:           { label: 'Enviada',      dot: 'bg-blue-500' },
  resent:         { label: 'Reenviada',    dot: 'bg-blue-400' },
  viewed:         { label: 'Visualizada',  dot: 'bg-yellow-500' },
  accepted:       { label: 'Aceita',       dot: 'bg-[#1D9E75]' },
  declined:       { label: 'Recusada',     dot: 'bg-red-500' },
  cancelled:      { label: 'Cancelada',    dot: 'bg-red-700' },
  expired:        { label: 'Expirada',     dot: 'bg-orange-500' },
  follow_up_sent: { label: 'Follow-up',    dot: 'bg-purple-500' },
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmtBRL(value: number | null) {
  if (value === null) return '—'
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

function fmtDate(iso: string | null) {
  if (!iso) return '—'
  const [y, m, d] = iso.split('T')[0].split('-').map(Number)
  return new Intl.DateTimeFormat('pt-BR').format(new Date(y, m - 1, d))
}

function fmtDateTime(iso: string) {
  const d = new Date(iso)
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }).format(d)
}

function getPeriodCutoff(period: string): number {
  const now = new Date()
  switch (period) {
    case 'today': { const d = new Date(now); d.setHours(0, 0, 0, 0); return d.getTime() }
    case 'week':    return now.getTime() - 7 * 86_400_000
    case 'month':  { const d = new Date(now.getFullYear(), now.getMonth(), 1); return d.getTime() }
    case '3months': return now.getTime() - 90 * 86_400_000
    default:        return 0
  }
}

function matchesValueRange(value: number | null, range: string): boolean {
  if (range === 'all') return true
  const v = value ?? 0
  switch (range) {
    case 'lt1k':    return v <= 1000
    case '1k-10k':  return v > 1000 && v <= 10000
    case '10k-50k': return v > 10000 && v <= 50000
    case 'gt50k':   return v > 50000
    default:        return true
  }
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.rascunho
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium whitespace-nowrap ${cfg.className}`}>
      {cfg.label}
    </span>
  )
}

function IconBtn({
  onClick,
  href,
  tooltip,
  children,
}: {
  onClick?: () => void
  href?: string
  tooltip: string
  children: React.ReactNode
}) {
  const cls = 'flex items-center justify-center p-1.5 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors'
  return (
    <div className="relative group">
      {href ? (
        <a href={href} target="_blank" rel="noopener noreferrer"
          onClick={e => e.stopPropagation()} className={cls}>
          {children}
        </a>
      ) : (
        <button onClick={e => { e.stopPropagation(); onClick?.() }} className={cls}>
          {children}
        </button>
      )}
      <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2 py-1 text-[11px] text-white bg-gray-800 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-20">
        {tooltip}
      </span>
    </div>
  )
}

const selectCls = 'px-2.5 py-1.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#1D9E75] focus:border-transparent text-gray-700'

// ─── SVG Icons ────────────────────────────────────────────────────────────────

const PdfIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 3v4a1 1 0 0 0 1 1h4" />
    <path d="M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2z" />
    <path d="M9 17h1a1 1 0 0 0 1 -1v-2a1 1 0 0 0 -1 -1h-1v4" />
    <path d="M14 13h1.5a1.5 1.5 0 0 1 0 3h-1.5v-3" />
    <path d="M17 17v-4" />
  </svg>
)

const EyeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none"
    viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round"
      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
)

function ChevronIcon({ expanded }: { expanded: boolean }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={`h-3.5 w-3.5 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
      fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  )
}

// ─── Inline Timeline ─────────────────────────────────────────────────────────

function InlineTimeline({ events, loading }: { events: TimelineEvent[] | undefined; loading: boolean }) {
  if (loading) {
    return (
      <div className="flex items-center gap-2 py-3 px-1">
        <div className="w-4 h-4 border-2 border-[#1D9E75] border-t-transparent rounded-full animate-spin" />
        <span className="text-xs text-gray-400">Carregando timeline…</span>
      </div>
    )
  }

  if (!events || events.length === 0) {
    return <p className="text-xs text-gray-400 py-3 px-1">Nenhum evento registrado.</p>
  }

  return (
    <div className="overflow-x-auto scrollbar-none">
      <div className="flex items-start gap-0 min-w-max py-3">
        {events.map((ev, i) => {
          const cfg = EVENT_CONFIG[ev.event_type] ?? { label: ev.event_type, dot: 'bg-gray-400' }
          return (
            <div key={ev.id} className="flex items-center">
              {/* Event node */}
              <div className="flex flex-col items-center gap-1">
                <div className={`w-2 h-2 rounded-full shrink-0 ${cfg.dot}`} />
                <span className="text-[11px] font-medium text-gray-700 whitespace-nowrap">{cfg.label}</span>
                <span className="text-[10px] text-gray-400 whitespace-nowrap">{fmtDateTime(ev.created_at)}</span>
              </div>
              {/* Connector line */}
              {i < events.length - 1 && (
                <div className="w-8 h-px bg-gray-200 shrink-0 -mt-8" />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ProposalsPage() {
  return <Suspense><ProposalsPageInner /></Suspense>
}

function ProposalsPageInner() {
  const router       = useRouter()
  const searchParams = useSearchParams()

  const [proposals, setProposals] = useState<Proposal[]>([])
  const [clients, setClients]     = useState<Client[]>([])
  const [loading, setLoading]     = useState(true)

  const [search,       setSearch]       = useState('')
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') ?? 'all')
  const [period,       setPeriod]       = useState('all')
  const [clientFilter, setClientFilter] = useState('all')
  const [valueRange,   setValueRange]   = useState('all')

  // Timeline state
  const [expandedIds,   setExpandedIds]   = useState<Set<string>>(new Set())
  const [eventsCache,   setEventsCache]   = useState<Record<string, TimelineEvent[]>>({})
  const [loadingEvents, setLoadingEvents] = useState<Set<string>>(new Set())

  useEffect(() => {
    Promise.all([
      fetch('/api/proposals').then(r => r.json()),
      fetch('/api/clients').then(r => r.json()).catch(() => []),
    ]).then(([data, clientData]) => {
      setProposals(Array.isArray(data) ? data : [])
      setClients(Array.isArray(clientData) ? clientData : [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  async function toggleTimeline(id: string, e: React.MouseEvent) {
    e.stopPropagation()
    if (expandedIds.has(id)) {
      setExpandedIds(prev => { const n = new Set(prev); n.delete(id); return n })
      return
    }
    setExpandedIds(prev => new Set([...prev, id]))
    if (eventsCache[id] !== undefined) return
    setLoadingEvents(prev => new Set([...prev, id]))
    try {
      const supabase = createClient()
      const { data } = await supabase
        .from('proposal_events')
        .select('id, event_type, metadata, created_at')
        .eq('proposal_id', id)
        .order('created_at', { ascending: true })
      setEventsCache(prev => ({ ...prev, [id]: data ?? [] }))
    } finally {
      setLoadingEvents(prev => { const n = new Set(prev); n.delete(id); return n })
    }
  }

  const hasActiveFilters = search !== '' || statusFilter !== 'all' || period !== 'all' || clientFilter !== 'all' || valueRange !== 'all'

  function clearFilters() {
    setSearch(''); setStatusFilter('all'); setPeriod('all'); setClientFilter('all'); setValueRange('all')
  }

  const filtered = useMemo(() => {
    const cutoff = getPeriodCutoff(period)
    return proposals.filter(p => {
      if (statusFilter !== 'all' && p.status !== statusFilter) return false
      if (cutoff && new Date(p.created_at).getTime() < cutoff) return false
      if (clientFilter !== 'all' && (p.clients?.id ?? '') !== clientFilter) return false
      if (!matchesValueRange(p.value, valueRange)) return false
      const q = search.toLowerCase()
      const code = p.code ?? p.proposal_number
      if (q && !p.title.toLowerCase().includes(q) && !code?.toLowerCase().includes(q)) return false
      return true
    })
  }, [proposals, search, statusFilter, period, clientFilter, valueRange])

  // Total columns for colSpan (chevron + código + nome + cliente + data + valor + status + ações = 8)
  const COL_SPAN = 8

  return (
    <div className="p-4 md:p-8 max-w-7xl">

      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-5 md:mb-6">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">Propostas</h1>
          <p className="text-sm text-gray-400 mt-0.5">{proposals.length} no total</p>
        </div>
        <Link
          href="/propostas/new"
          className="flex items-center gap-1.5 px-3 py-2 md:px-4 bg-[#1D9E75] text-white text-sm font-medium rounded-lg hover:bg-[#188f68] transition-colors shrink-0"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          <span className="hidden sm:inline">Nova Proposta</span>
          <span className="sm:hidden">Nova</span>
        </Link>
      </div>

      {/* ── Desktop filters ── */}
      <div className="hidden md:flex flex-wrap gap-2.5 mb-4">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 111 11a6 6 0 0116 0z" />
          </svg>
          <input type="text" placeholder="Buscar por título ou código..."
            value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#1D9E75] focus:border-transparent"
          />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className={selectCls}>
          <option value="all">Todos os status</option>
          {Object.entries(STATUS_CONFIG).map(([v, { label }]) => <option key={v} value={v}>{label}</option>)}
        </select>
        <select value={period} onChange={e => setPeriod(e.target.value)} className={selectCls}>
          {PERIOD_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <select value={clientFilter} onChange={e => setClientFilter(e.target.value)} className={selectCls}>
          <option value="all">Todos os clientes</option>
          {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select value={valueRange} onChange={e => setValueRange(e.target.value)} className={selectCls}>
          {VALUE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      {/* ── Mobile filters ── */}
      <div className="md:hidden space-y-2.5 mb-4">
        <div className="relative">
          <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 111 11a6 6 0 0116 0z" />
          </svg>
          <input type="text" placeholder="Buscar por título ou código..."
            value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#1D9E75] focus:border-transparent"
          />
        </div>

        <div className="overflow-x-auto -mx-4 px-4 scrollbar-none">
          <div className="flex gap-2 min-w-max pb-0.5">
            {STATUS_ORDER.map(v => {
              const label = v === 'all' ? 'Todos' : STATUS_CONFIG[v as keyof typeof STATUS_CONFIG].label
              const cfg   = v !== 'all' ? STATUS_CONFIG[v as keyof typeof STATUS_CONFIG] : null
              const active = statusFilter === v
              return (
                <button
                  key={v}
                  onClick={() => setStatusFilter(v)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors whitespace-nowrap ${
                    active
                      ? v === 'all'
                        ? 'bg-gray-800 text-white border-gray-800'
                        : `${cfg!.className} border-current`
                      : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400'
                  }`}
                >
                  {label}
                </button>
              )
            })}
          </div>
        </div>

        <div className="overflow-x-auto -mx-4 px-4 scrollbar-none">
          <div className="flex gap-2 min-w-max">
            <select value={period} onChange={e => setPeriod(e.target.value)} className={selectCls}>
              {PERIOD_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            {clients.length > 0 && (
              <select value={clientFilter} onChange={e => setClientFilter(e.target.value)} className={selectCls}>
                <option value="all">Todos os clientes</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            )}
            <select value={valueRange} onChange={e => setValueRange(e.target.value)} className={selectCls}>
              {VALUE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* ── Contador + limpar ── */}
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm text-gray-500">
          <span className="font-medium text-gray-800">{filtered.length}</span>
          {filtered.length !== proposals.length && (
            <> de <span className="font-medium text-gray-800">{proposals.length}</span></>
          )}
          {' '}{filtered.length === 1 ? 'proposta' : 'propostas'}
        </p>
        {hasActiveFilters && (
          <button onClick={clearFilters}
            className="text-sm text-[#1D9E75] font-medium hover:underline flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
            Limpar
          </button>
        )}
      </div>

      {/* ── Conteúdo ── */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-6 h-6 border-2 border-[#1D9E75] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-xl shadow-sm">
          <EmptyState hasFilters={hasActiveFilters} />
        </div>
      ) : (
        <>
          {/* ── Desktop: tabela ── */}
          <div className="hidden md:block bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50/80 border-b border-gray-100">
                    {/* Chevron col */}
                    <th className="w-8 px-2 py-2.5" />
                    <th className="text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider px-3 py-2.5 whitespace-nowrap">
                      Código
                    </th>
                    <th className="text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider px-3 py-2.5 whitespace-nowrap">
                      Nome
                    </th>
                    <th className="text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider px-3 py-2.5 whitespace-nowrap">
                      Cliente
                    </th>
                    <th className="text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider px-3 py-2.5 whitespace-nowrap">
                      Data
                    </th>
                    <th className="text-right text-[11px] font-semibold text-gray-400 uppercase tracking-wider px-3 py-2.5 whitespace-nowrap">
                      Valor
                    </th>
                    <th className="text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider px-3 py-2.5 whitespace-nowrap">
                      Status
                    </th>
                    <th className="text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider px-3 py-2.5 whitespace-nowrap">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.map((p, i) => {
                    const expanded = expandedIds.has(p.id)
                    const isLoading = loadingEvents.has(p.id)
                    const rowBase = `cursor-pointer transition-colors hover:bg-[#1D9E75]/[0.04] ${i % 2 !== 0 ? 'bg-gray-50/50' : 'bg-white'}`
                    return (
                      <React.Fragment key={p.id}>
                        <tr
                          onClick={() => router.push(`/propostas/${p.id}`)}
                          className={rowBase}
                        >
                          {/* Chevron */}
                          <td className="w-8 px-2 py-2">
                            <button
                              onClick={e => toggleTimeline(p.id, e)}
                              className="flex items-center justify-center w-6 h-6 rounded text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                              aria-label={expanded ? 'Ocultar timeline' : 'Ver timeline'}
                            >
                              <ChevronIcon expanded={expanded} />
                            </button>
                          </td>

                          {/* Código */}
                          <td className="px-3 py-2 whitespace-nowrap">
                            <span className="text-[11px] text-gray-400 font-mono">
                              {p.code ?? p.proposal_number ?? '—'}
                            </span>
                          </td>

                          {/* Nome */}
                          <td className="px-3 py-2 max-w-[240px]">
                            <span className="block text-sm font-medium text-gray-900 leading-snug truncate">
                              {p.title}
                            </span>
                          </td>

                          {/* Cliente */}
                          <td className="px-3 py-2 max-w-[140px]">
                            <span className="text-sm text-gray-500 truncate block">{p.clients?.name ?? '—'}</span>
                          </td>

                          {/* Data */}
                          <td className="px-3 py-2 whitespace-nowrap">
                            <span className="text-sm text-gray-500">{fmtDate(p.created_at)}</span>
                          </td>

                          {/* Valor */}
                          <td className="px-3 py-2 text-right whitespace-nowrap tabular-nums">
                            <span className="text-sm font-medium text-gray-700">{fmtBRL(p.value)}</span>
                          </td>

                          {/* Status */}
                          <td className="px-3 py-2">
                            <StatusBadge status={p.status} />
                          </td>

                          {/* Ações */}
                          <td className="px-3 py-2">
                            <div className="flex items-center gap-0.5">
                              {p.pdf_url && (
                                <IconBtn href={p.pdf_url} tooltip="Ver PDF">
                                  <PdfIcon />
                                </IconBtn>
                              )}
                              <IconBtn onClick={() => router.push(`/propostas/${p.id}`)} tooltip="Ver detalhes">
                                <EyeIcon />
                              </IconBtn>
                            </div>
                          </td>
                        </tr>

                        {/* Timeline sub-row */}
                        {expanded && (
                          <tr className={i % 2 !== 0 ? 'bg-gray-50/50' : 'bg-white'}>
                            <td colSpan={COL_SPAN} className="px-8 pb-3 pt-0 border-b border-gray-100">
                              <InlineTimeline
                                events={eventsCache[p.id]}
                                loading={isLoading}
                              />
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* ── Mobile: cards ── */}
          <div className="md:hidden space-y-3">
            {filtered.map(p => (
              <div
                key={p.id}
                onClick={() => router.push(`/propostas/${p.id}`)}
                className="bg-white border border-gray-100 rounded-xl shadow-sm p-4 cursor-pointer active:bg-gray-50 transition-colors"
              >
                {/* Status + Valor */}
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <StatusBadge status={p.status} />
                  <span className={`text-sm font-bold tabular-nums shrink-0 ${p.value !== null ? 'text-[#1D9E75]' : 'text-gray-400'}`}>
                    {fmtBRL(p.value)}
                  </span>
                </div>

                {/* Título */}
                <p className="text-sm font-medium text-gray-900 leading-snug line-clamp-2 mb-2">
                  {p.title}
                </p>

                {/* Código · Data */}
                <p className="text-xs text-gray-400 mb-3">
                  {p.code ?? p.proposal_number ?? '—'}
                  {' · '}
                  {fmtDate(p.created_at)}
                </p>

                {/* Cliente + Detalhes */}
                <div className="flex items-center justify-between gap-2">
                  {p.clients?.name ? (
                    <span className="text-xs text-gray-400 truncate">{p.clients.name}</span>
                  ) : (
                    <span />
                  )}
                  <span className="text-xs font-medium text-[#1D9E75] shrink-0">Detalhes →</span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState({ hasFilters }: { hasFilters: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </div>
      {hasFilters ? (
        <>
          <p className="text-sm font-medium text-gray-900 mb-1">Nenhum resultado</p>
          <p className="text-sm text-gray-500">Tente ajustar os filtros ou a busca.</p>
        </>
      ) : (
        <>
          <p className="text-sm font-medium text-gray-900 mb-1">Nenhuma proposta ainda</p>
          <p className="text-sm text-gray-500 mb-4">Crie sua primeira proposta e envie para um cliente.</p>
          <Link href="/propostas/new"
            className="px-4 py-2 bg-[#1D9E75] text-white text-sm font-medium rounded-lg hover:bg-[#188f68] transition-colors">
            + Nova Proposta
          </Link>
        </>
      )}
    </div>
  )
}
