'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'

type Proposal = {
  id: string
  title: string
  service_description: string | null
  value: number | null
  payment_terms: string | null
  deadline_days: number | null
  valid_until: string | null
  status: string
  pdf_url: string | null
  token: string
  created_at: string
  clients: { id: string; name: string; email: string | null; phone: string | null } | null
}

const STATUS_CONFIG = {
  draft:    { label: 'Rascunho', className: 'bg-gray-100 text-gray-500' },
  sent:     { label: 'Enviada',  className: 'bg-gray-200 text-gray-700' },
  viewed:   { label: 'Vista',    className: 'bg-yellow-100 text-yellow-700' },
  accepted: { label: 'Aceita',   className: 'bg-[#1D9E75]/10 text-[#1D9E75]' },
  rejected: { label: 'Recusada', className: 'bg-red-100 text-red-700' },
  expired:  { label: 'Expirada', className: 'bg-orange-100 text-orange-700' },
} as const

function fmtBRL(v: number | null) {
  if (v === null) return '—'
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)
}

function fmtDate(iso: string | null) {
  if (!iso) return '—'
  const [y, m, d] = iso.split('T')[0].split('-').map(Number)
  return new Intl.DateTimeFormat('pt-BR').format(new Date(y, m - 1, d))
}

export default function ProposalDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [proposal, setProposal] = useState<Proposal | null>(null)
  const [loading, setLoading]   = useState(true)
  const [pdfLoading, setPdfLoading] = useState(false)
  const [pdfError, setPdfError] = useState<string | null>(null)

  useEffect(() => {
    fetch(`/api/proposals/${id}`)
      .then(r => r.json())
      .then(data => { setProposal(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [id])

  async function handleGeneratePDF() {
    setPdfLoading(true)
    setPdfError(null)
    try {
      const res = await fetch(`/api/proposals/${id}/pdf`, { method: 'POST' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Erro ao gerar PDF')
      setProposal(prev => prev ? { ...prev, pdf_url: data.pdf_url } : prev)
    } catch (e) {
      setPdfError(e instanceof Error ? e.message : 'Erro ao gerar PDF')
    } finally {
      setPdfLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-[#1D9E75] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!proposal) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-500">Proposta não encontrada.</p>
        <Link href="/propostas" className="mt-4 inline-block text-sm text-[#1D9E75] hover:underline">
          Voltar para propostas
        </Link>
      </div>
    )
  }

  const statusCfg = STATUS_CONFIG[proposal.status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.draft
  const ref = '#' + proposal.token.substring(0, 8).toUpperCase()

  return (
    <div className="p-6 md:p-8 max-w-3xl">
      {/* Header */}
      <div className="flex items-start gap-3 mb-8">
        <Link href="/propostas" className="mt-1 p-1.5 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-100 shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold text-gray-900 truncate">{proposal.title}</h1>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium shrink-0 ${statusCfg.className}`}>
              {statusCfg.label}
            </span>
          </div>
          <p className="text-sm text-gray-400 mt-1">{ref} · Criada em {fmtDate(proposal.created_at)}</p>
        </div>
      </div>

      <div className="space-y-4">
        {/* PDF card */}
        <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-900 mb-3">PDF da proposta</h2>
          {proposal.pdf_url ? (
            <div className="flex items-center gap-3">
              <a
                href={proposal.pdf_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-[#1D9E75] text-white text-sm font-medium rounded-lg hover:bg-[#188f68] transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Baixar PDF
              </a>
              <button
                onClick={handleGeneratePDF}
                disabled={pdfLoading}
                className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                {pdfLoading ? 'Gerando...' : 'Regenerar PDF'}
              </button>
            </div>
          ) : (
            <div>
              <button
                onClick={handleGeneratePDF}
                disabled={pdfLoading}
                className="flex items-center gap-2 px-4 py-2 bg-[#1D9E75] text-white text-sm font-medium rounded-lg hover:bg-[#188f68] transition-colors disabled:opacity-50"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                {pdfLoading ? 'Gerando PDF...' : 'Gerar PDF'}
              </button>
              {pdfError && (
                <p className="mt-2 text-sm text-red-600">{pdfError}</p>
              )}
            </div>
          )}
        </div>

        {/* Client */}
        {proposal.clients && (
          <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Cliente</h2>
            <p className="font-semibold text-gray-900">{proposal.clients.name}</p>
            {proposal.clients.email && <p className="text-sm text-gray-500 mt-0.5">{proposal.clients.email}</p>}
            {proposal.clients.phone && <p className="text-sm text-gray-500 mt-0.5">{proposal.clients.phone}</p>}
          </div>
        )}

        {/* Service */}
        {proposal.service_description && (
          <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Escopo do Serviço</h2>
            <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{proposal.service_description}</p>
          </div>
        )}

        {/* Value + terms */}
        <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4">Valores e prazos</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-gray-400 mb-1">Valor total</p>
              <p className="font-semibold text-gray-900">{fmtBRL(proposal.value)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">Prazo</p>
              <p className="text-sm text-gray-700">
                {proposal.deadline_days !== null ? `${proposal.deadline_days} dias` : '—'}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">Válida até</p>
              <p className="text-sm text-gray-700">{fmtDate(proposal.valid_until)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">Pagamento</p>
              <p className="text-sm text-gray-700">{proposal.payment_terms ?? '—'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
