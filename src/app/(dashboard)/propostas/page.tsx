'use client'

import { useEffect, useState, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

// ─── Types ────────────────────────────────────────────────────────────────────

type Proposal = {
  id: string
  title: string
  value: number | null
  status: string
  created_at: string
  version: number
  proposal_number: string | null
  pdf_url: string | null
  clients: { id: string; name: string } | null
}

type Client = { id: string; name: string }

// ─── Config ───────────────────────────────────────────────────────────────────

const STATUS_CONFIG = {
  rascunho:    { label: 'Rascunho',    className: 'bg-gray-100 text-gray-500' },
  enviada:     { label: 'Enviada',     className: 'bg-blue-100 text-blue-700' },
  visualizada: { label: 'Visualizada', className: 'bg-yellow-100 text-yellow-700' },
  aprovada:    { label: 'Aprovada',    className: 'bg-[#1D9E75]/10 text-[#1D9E75]' },
  reprovada:   { label: 'Reprovada',   className: 'bg-red-100 text-red-700' },
  expirada:    { label: 'Expirada',    className: 'bg-orange-100 text-orange-700' },
  cancelada:   { label: 'Cancelada',   className: 'bg-red-200 text-red-900' },
} as const

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

function getPeriodCutoff(period: string): number {
  const now = new Date()
  switch (period) {
    case 'today': {
      const d = new Date(now); d.setHours(0, 0, 0, 0); return d.getTime()
    }
    case 'week':   return now.getTime() - 7 * 86_400_000
    case 'month': {
      const d = new Date(now.getFullYear(), now.getMonth(), 1); return d.getTime()
    }
    case '3months': return now.getTime() - 90 * 86_400_000
    default: return 0
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
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${cfg.className}`}>
      {cfg.label}
    </span>
  )
}

const selectCls = 'px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#1D9E75] focus:border-transparent'

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ProposalsPage() {
  const router       = useRouter()
  const searchParams = useSearchParams()

  const [proposals, setProposals] = useState<Proposal[]>([])
  const [clients, setClients]     = useState<Client[]>([])
  const [loading, setLoading]     = useState(true)

  // Filters
  const [search,       setSearch]       = useState('')
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') ?? 'all')
  const [period,       setPeriod]       = useState('all')
  const [clientFilter, setClientFilter] = useState('all')
  const [valueRange,   setValueRange]   = useState('all')

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

  const hasActiveFilters = search !== '' || statusFilter !== 'all' || period !== 'all' || clientFilter !== 'all' || valueRange !== 'all'

  function clearFilters() {
    setSearch(''); setStatusFilter('all'); setPeriod('all'); setClientFilter('all'); setValueRange('all')
  }

  const filtered = useMemo(() => {
    const cutoff = getPeriodCutoff(period)
    return proposals.filter(p => {
      if (statusFilter !== 'all' && p.status !== statusFilter) return false
      if (cutoff && new Date(p.created_at).getTime() < cutoff) return false
      if (clientFilter !== 'all') {
        const cid = p.clients?.id ?? ''
        if (cid !== clientFilter) return false
      }
      if (!matchesValueRange(p.value, valueRange)) return false
      const q = search.toLowerCase()
      if (q && !p.title.toLowerCase().includes(q) && !(p.proposal_number?.toLowerCase().includes(q))) return false
      return true
    })
  }, [proposals, search, statusFilter, period, clientFilter, valueRange])

  return (
    <div className="p-6 md:p-8 max-w-7xl">

      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Propostas</h1>
          <p className="text-sm text-gray-500 mt-0.5">{proposals.length} no total</p>
        </div>
        <Link
          href="/propostas/new"
          className="flex items-center gap-2 px-4 py-2 bg-[#1D9E75] text-white text-sm font-medium rounded-lg hover:bg-[#188f68] transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Nova Proposta
        </Link>
      </div>

      {/* ── Filters ── */}
      <div className="space-y-3 mb-4">
        <div className="flex flex-wrap gap-3">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 111 11a6 6 0 0116 0z" />
            </svg>
            <input
              type="text"
              placeholder="Buscar por título ou número..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#1D9E75] focus:border-transparent"
            />
          </div>

          {/* Status */}
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className={selectCls}>
            <option value="all">Todos os status</option>
            {Object.entries(STATUS_CONFIG).map(([value, { label }]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>

          {/* Period */}
          <select value={period} onChange={e => setPeriod(e.target.value)} className={selectCls}>
            {PERIOD_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>

          {/* Client */}
          <select value={clientFilter} onChange={e => setClientFilter(e.target.value)} className={selectCls}>
            <option value="all">Todos os clientes</option>
            {clients.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          {/* Value range */}
          <select value={valueRange} onChange={e => setValueRange(e.target.value)} className={selectCls}>
            {VALUE_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        {/* Counter + Clear */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Mostrando <span className="font-medium text-gray-900">{filtered.length}</span> de <span className="font-medium text-gray-900">{proposals.length}</span> propostas
          </p>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-sm text-[#1D9E75] font-medium hover:underline flex items-center gap-1.5"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
              Limpar filtros
            </button>
          )}
        </div>
      </div>

      {/* ── Table ── */}
      <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-6 h-6 border-2 border-[#1D9E75] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState hasFilters={hasActiveFilters} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wide px-5 py-3 whitespace-nowrap">ID / Título</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wide px-4 py-3 whitespace-nowrap">Versão</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wide px-4 py-3 whitespace-nowrap">Data de criação</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wide px-4 py-3 whitespace-nowrap">Cliente</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wide px-4 py-3 whitespace-nowrap">Valor total</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wide px-4 py-3 whitespace-nowrap">Status</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wide px-4 py-3 whitespace-nowrap">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filtered.map((p, i) => (
                  <tr key={p.id} className={`transition-colors hover:bg-gray-50 ${i % 2 !== 0 ? 'bg-gray-50/70' : 'bg-white'}`}>
                    <td className="px-5 py-3.5 max-w-[220px]">
                      {p.proposal_number && (
                        <span className="font-mono text-xs text-[#1D9E75] font-semibold block mb-0.5">{p.proposal_number}</span>
                      )}
                      <span className="font-medium text-gray-900 text-sm line-clamp-1">{p.title}</span>
                    </td>
                    <td className="px-4 py-3.5 text-gray-500 whitespace-nowrap">
                      v{p.version ?? 1}
                    </td>
                    <td className="px-4 py-3.5 text-gray-500 whitespace-nowrap">
                      {fmtDate(p.created_at)}
                    </td>
                    <td className="px-4 py-3.5 text-gray-500 max-w-[140px]">
                      <span className="line-clamp-1">{p.clients?.name ?? '—'}</span>
                    </td>
                    <td className="px-4 py-3.5 text-gray-700 font-medium whitespace-nowrap tabular-nums">
                      {fmtBRL(p.value)}
                    </td>
                    <td className="px-4 py-3.5">
                      <StatusBadge status={p.status} />
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1.5">
                        {p.pdf_url && (
                          <a
                            href={`/api/proposals/${p.id}/pdf`}
                            onClick={e => e.stopPropagation()}
                            className="px-2.5 py-1.5 text-xs font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors whitespace-nowrap"
                          >
                            Ver PDF
                          </a>
                        )}
                        <button
                          onClick={() => router.push(`/propostas/${p.id}`)}
                          className="px-2.5 py-1.5 text-xs font-medium text-[#1D9E75] border border-[#1D9E75]/30 rounded-lg hover:bg-[#1D9E75]/5 transition-colors whitespace-nowrap"
                        >
                          Ver Detalhes
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

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
          <Link href="/propostas/new" className="px-4 py-2 bg-[#1D9E75] text-white text-sm font-medium rounded-lg hover:bg-[#188f68] transition-colors">
            + Nova Proposta
          </Link>
        </>
      )}
    </div>
  )
}
