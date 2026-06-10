'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams } from 'next/navigation'

type Client = { name: string; email: string | null }

type Proposal = {
  id: string
  title: string
  service_description: string | null
  value: number | null
  payment_terms: string | null
  deadline_days: number | null
  valid_until: string | null
  status: string
  token: string
  created_at: string
  clients: Client | null
}

type Profile = {
  full_name: string | null
  business_name: string | null
  logo_url: string | null
  accent_color: string | null
}

function fmtBRL(v: number | null) {
  if (v === null) return '—'
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)
}

function fmtDate(iso: string | null) {
  if (!iso) return '—'
  const [y, m, d] = iso.split('T')[0].split('-').map(Number)
  return new Intl.DateTimeFormat('pt-BR').format(new Date(y, m - 1, d))
}

const FINAL_STATUSES = ['accepted', 'rejected']

export default function PublicProposalPage() {
  const { token } = useParams<{ token: string }>()
  const [proposal, setProposal] = useState<Proposal | null>(null)
  const [profile, setProfile]   = useState<Profile | null>(null)
  const [loading, setLoading]   = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [acting, setActing]     = useState<'accept' | 'decline' | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const tracked = useRef(false)

  useEffect(() => {
    fetch(`/api/p/${token}`)
      .then(r => r.ok ? r.json() : Promise.reject(r.status))
      .then(({ proposal: p, profile: pr }) => {
        setProposal(p)
        setProfile(pr)
        setLoading(false)
      })
      .catch(() => { setNotFound(true); setLoading(false) })
  }, [token])

  // Fire-and-forget view tracking
  useEffect(() => {
    if (!token || tracked.current) return
    tracked.current = true
    fetch(`/api/track/view/${token}`, { redirect: 'manual' }).catch(() => {})
  }, [token])

  async function handleAction(action: 'accept' | 'decline') {
    setActing(action)
    setActionError(null)
    try {
      const res = await fetch(`/p/${token}/${action === 'accept' ? 'accept' : 'decline'}`, {
        method: 'POST',
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setProposal(prev => prev ? {
        ...prev,
        status: action === 'accept' ? 'accepted' : 'rejected',
      } : prev)
    } catch (e) {
      setActionError(e instanceof Error ? e.message : 'Erro ao processar resposta')
    } finally {
      setActing(null)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#1D9E75] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (notFound || !proposal || !profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h1 className="text-lg font-semibold text-gray-900 mb-1">Proposta não encontrada</h1>
        <p className="text-sm text-gray-500">Este link pode ter expirado ou é inválido.</p>
      </div>
    )
  }

  const accent = profile.accent_color ?? '#1D9E75'
  const displayName = profile.business_name ?? profile.full_name ?? 'Freelancer'
  const ref = '#' + proposal.token.substring(0, 8).toUpperCase()
  const isFinal = FINAL_STATUSES.includes(proposal.status)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header band */}
      <header style={{ backgroundColor: accent }} className="px-6 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Logo / avatar */}
          <div className="flex items-center gap-3 mb-3">
            {profile.logo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={profile.logo_url} alt={displayName} className="w-10 h-10 rounded-full object-cover bg-white/20" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-lg">
                {displayName.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <p className="text-white font-semibold text-base leading-tight">{displayName}</p>
              <p className="text-white/70 text-xs tracking-widest mt-0.5">PROPOSTA COMERCIAL</p>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-2xl mx-auto px-4 py-6 space-y-4 pb-16">
        {/* Title card */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-start justify-between gap-4">
            <h1 className="text-xl font-bold text-gray-900 leading-snug">{proposal.title}</h1>
            <span className="shrink-0 text-xs font-mono text-gray-400 mt-1">{ref}</span>
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
            <p className="text-sm text-gray-500">Emitida em {fmtDate(proposal.created_at)}</p>
            {proposal.valid_until && (
              <p className="text-sm text-gray-500">Válida até {fmtDate(proposal.valid_until)}</p>
            )}
          </div>

          {/* Status banner if final */}
          {isFinal && (
            <div className={`mt-4 flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium ${
              proposal.status === 'accepted'
                ? 'bg-green-50 text-green-700 border border-green-100'
                : 'bg-gray-100 text-gray-600 border border-gray-200'
            }`}>
              {proposal.status === 'accepted' ? (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Proposta aceita — obrigado! Entraremos em contato em breve.
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Esta proposta foi recusada.
                </>
              )}
            </div>
          )}
        </div>

        {/* Client */}
        {proposal.clients && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Para</p>
            <p className="font-semibold text-gray-900">{proposal.clients.name}</p>
            {proposal.clients.email && (
              <p className="text-sm text-gray-500 mt-0.5">{proposal.clients.email}</p>
            )}
          </div>
        )}

        {/* Service */}
        {proposal.service_description && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Escopo do Serviço</p>
            <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{proposal.service_description}</p>
          </div>
        )}

        {/* Terms */}
        {(proposal.deadline_days !== null || proposal.payment_terms) && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <div className="grid grid-cols-2 gap-4">
              {proposal.deadline_days !== null && (
                <div>
                  <p className="text-xs text-gray-400 mb-1">Prazo de entrega</p>
                  <p className="text-sm font-medium text-gray-900">
                    {proposal.deadline_days} {proposal.deadline_days === 1 ? 'dia' : 'dias'}
                  </p>
                </div>
              )}
              {proposal.payment_terms && (
                <div>
                  <p className="text-xs text-gray-400 mb-1">Forma de pagamento</p>
                  <p className="text-sm font-medium text-gray-900">{proposal.payment_terms}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Value */}
        <div style={{ backgroundColor: accent }} className="rounded-xl p-6 text-center shadow-sm">
          <p className="text-white/70 text-xs font-semibold uppercase tracking-widest mb-2">Valor Total</p>
          <p className="text-white text-4xl font-bold">{fmtBRL(proposal.value)}</p>
        </div>

        {/* Action buttons */}
        {!isFinal && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <p className="text-sm text-gray-500 mb-4 text-center">
              Revise os detalhes acima e responda esta proposta:
            </p>
            {actionError && (
              <p className="text-sm text-red-600 text-center mb-3">{actionError}</p>
            )}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => handleAction('accept')}
                disabled={acting !== null}
                style={{ backgroundColor: acting === null ? accent : undefined }}
                className="flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-lg text-white font-semibold text-sm transition-opacity disabled:opacity-60"
              >
                {acting === 'accept' ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
                Aceitar esta proposta
              </button>
              <button
                onClick={() => handleAction('decline')}
                disabled={acting !== null}
                className="flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-lg text-gray-600 font-semibold text-sm border border-gray-200 hover:bg-gray-50 transition-colors disabled:opacity-60"
              >
                {acting === 'decline' ? (
                  <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
                Recusar
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="text-center py-6">
        <p className="text-xs text-gray-400">Gerado com FreelanceFlow</p>
      </footer>
    </div>
  )
}
