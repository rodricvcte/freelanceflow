'use client'

import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'

type Proposal = {
  id: string
  title: string
  value: number | null
  status: 'draft' | 'sent' | 'viewed' | 'accepted' | 'rejected' | 'expired'
  created_at: string
  clients: { id: string; name: string } | null
}

const STATUS_CONFIG = {
  draft:    { label: 'Rascunho', className: 'bg-gray-100 text-gray-500' },
  sent:     { label: 'Enviada',  className: 'bg-gray-200 text-gray-700' },
  viewed:   { label: 'Vista',    className: 'bg-yellow-100 text-yellow-700' },
  accepted: { label: 'Aceita',   className: 'bg-[#1D9E75]/10 text-[#1D9E75]' },
  rejected: { label: 'Recusada', className: 'bg-red-100 text-red-700' },
  expired:  { label: 'Expirada', className: 'bg-orange-100 text-orange-700' },
} as const

const PERIOD_OPTIONS = [
  { label: 'Todos',    days: 0 },
  { label: '7 dias',  days: 7 },
  { label: '30 dias', days: 30 },
  { label: '90 dias', days: 90 },
]

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.draft
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${cfg.className}`}>
      {cfg.label}
    </span>
  )
}

function formatBRL(value: number | null) {
  if (value === null) return '—'
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

function formatDate(iso: string) {
  return new Intl.DateTimeFormat('pt-BR').format(new Date(iso))
}

export default function ProposalsPage() {
  const [proposals, setProposals] = useState<Proposal[]>([])
  const [loading, setLoading]     = useState(true)
  const [search, setSearch]       = useState('')
  const [statusFilter, setStatus] = useState('all')
  const [periodDays, setPeriod]   = useState(0)

  useEffect(() => {
    fetch('/api/proposals')
      .then(r => r.json())
      .then(data => { setProposals(Array.isArray(data) ? data : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => {
    const cutoff = periodDays > 0 ? Date.now() - periodDays * 86_400_000 : 0
    return proposals.filter(p => {
      if (statusFilter !== 'all' && p.status !== statusFilter) return false
      if (cutoff && new Date(p.created_at).getTime() < cutoff) return false
      if (search && !p.title.toLowerCase().includes(search.toLowerCase())) return false
      return true
    })
  }, [proposals, statusFilter, periodDays, search])

  return (
    <div className="p-6 md:p-8 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Propostas</h1>
          <p className="text-sm text-gray-500 mt-0.5">{proposals.length} no total</p>
        </div>
        <Link
          href="/proposals/new"
          className="flex items-center gap-2 px-4 py-2 bg-[#1D9E75] text-white text-sm font-medium rounded-lg hover:bg-[#188f68] transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Nova Proposta
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        {/* Search */}
        <div className="relative flex-1 max-w-xs">
          <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 111 11a6 6 0 0116 0z" />
          </svg>
          <input
            type="text"
            placeholder="Buscar por título..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#1D9E75] focus:border-transparent"
          />
        </div>

        {/* Status filter */}
        <select
          value={statusFilter}
          onChange={e => setStatus(e.target.value)}
          className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#1D9E75] focus:border-transparent"
        >
          <option value="all">Todos os status</option>
          {Object.entries(STATUS_CONFIG).map(([value, { label }]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>

        {/* Period filter */}
        <select
          value={periodDays}
          onChange={e => setPeriod(Number(e.target.value))}
          className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#1D9E75] focus:border-transparent"
        >
          {PERIOD_OPTIONS.map(o => (
            <option key={o.days} value={o.days}>{o.label}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-6 h-6 border-2 border-[#1D9E75] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState hasFilters={search !== '' || statusFilter !== 'all' || periodDays > 0} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wide px-5 py-3">Título</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wide px-5 py-3">Cliente</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wide px-5 py-3">Valor</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wide px-5 py-3">Status</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wide px-5 py-3">Data</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(p => (
                  <tr key={p.id} className="hover:bg-gray-50 transition-colors cursor-pointer">
                    <td className="px-5 py-4 font-medium text-gray-900">{p.title}</td>
                    <td className="px-5 py-4 text-gray-500">{p.clients?.name ?? '—'}</td>
                    <td className="px-5 py-4 text-gray-700 font-medium">{formatBRL(p.value)}</td>
                    <td className="px-5 py-4"><StatusBadge status={p.status} /></td>
                    <td className="px-5 py-4 text-gray-500">{formatDate(p.created_at)}</td>
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
          <Link
            href="/proposals/new"
            className="px-4 py-2 bg-[#1D9E75] text-white text-sm font-medium rounded-lg hover:bg-[#188f68] transition-colors"
          >
            + Nova Proposta
          </Link>
        </>
      )}
    </div>
  )
}
