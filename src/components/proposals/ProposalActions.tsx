'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

type DuplicateData = {
  title: string
  service_description: string | null
  value: number | null
  payment_terms: string | null
  deadline_days: number | null
  valid_until: string | null
  client_id: string | null
  sections: unknown[]
}

type Props = {
  proposalId: string
  status: string
  initialPdfUrl: string | null
  duplicate: DuplicateData
}

export default function ProposalActions({ proposalId, status, initialPdfUrl, duplicate }: Props) {
  const router = useRouter()
  const [duplicating, setDuplicating] = useState(false) // brief flash before navigation
  const [showCancel, setShowCancel]   = useState(false)
  const [cancelling, setCancelling]   = useState(false)
  const [cancelError, setCancelError] = useState<string | null>(null)

  const canCancel = status !== 'aprovada' && status !== 'cancelada'

  function handleDuplicate() {
    setDuplicating(true)
    try {
      sessionStorage.setItem('ff_duplicate_draft', JSON.stringify({
        title:               `Cópia de ${duplicate.title}`,
        service_description: duplicate.service_description,
        value:               duplicate.value,
        payment_terms:       duplicate.payment_terms,
        deadline_days:       duplicate.deadline_days,
        valid_until:         duplicate.valid_until,
        client_id:           duplicate.client_id,
        sections:            duplicate.sections,
      }))
      router.push('/propostas/new?mode=duplicate')
    } catch {
      setDuplicating(false)
    }
  }

  async function handleConfirmCancel() {
    setCancelling(true)
    setCancelError(null)
    try {
      const res = await fetch(`/api/proposals/${proposalId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'cancelada' }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      router.refresh()
      setShowCancel(false)
    } catch (e) {
      setCancelError(e instanceof Error ? e.message : 'Erro ao cancelar proposta')
      setCancelling(false)
    }
  }

  return (
    <>
      <div className="flex flex-col gap-4">

        {/* ── Ações principais ── */}
        <div className="flex flex-wrap items-center gap-2">

          {status === 'rascunho' && (
            <Link
              href={`/propostas/${proposalId}/editar`}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#1D9E75] text-white text-sm font-medium rounded-lg hover:bg-[#188f68] transition-colors"
            >
              {/* Tabler: pencil */}
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 20h4l10.5 -10.5a2.828 2.828 0 1 0 -4 -4l-10.5 10.5v4" />
                <path d="M13.5 6.5l4 4" />
              </svg>
              Editar
            </Link>
          )}

          <button
            onClick={handleDuplicate}
            disabled={duplicating}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            {duplicating ? (
              <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
            ) : (
              /* Tabler: copy */
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <rect x="8" y="8" width="12" height="12" rx="2" />
                <path d="M16 8v-2a2 2 0 0 0 -2 -2h-8a2 2 0 0 0 -2 2v8a2 2 0 0 0 2 2h2" />
              </svg>
            )}
            {duplicating ? 'Duplicando…' : 'Duplicar'}
          </button>

          {initialPdfUrl && (
            <a
              href={initialPdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {/* Tabler: download */}
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2 -2v-2" />
                <path d="M7 11l5 5l5 -5" />
                <path d="M12 4l0 12" />
              </svg>
              Baixar PDF
            </a>
          )}
        </div>

        {/* ── Ação destrutiva ── */}
        {canCancel && (
          <div>
            <button
              onClick={() => setShowCancel(true)}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-red-400 hover:text-red-600 transition-colors"
            >
              {/* Tabler: ban */}
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="9" />
                <path d="M5.7 5.7l12.6 12.6" />
              </svg>
              Cancelar proposta
            </button>
          </div>
        )}
      </div>

      {/* ── Modal de confirmação ── */}
      {showCancel && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 9v4" />
                <path d="M10.363 3.591l-8.106 13.534a1.914 1.914 0 0 0 1.636 2.871h16.214a1.914 1.914 0 0 0 1.636 -2.87l-8.106 -13.536a1.914 1.914 0 0 0 -3.274 0z" />
                <path d="M12 16h.01" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-900 text-center mb-2">Cancelar proposta?</h3>
            <p className="text-sm text-gray-500 text-center mb-6">
              Tem certeza que deseja cancelar esta proposta? Esta ação não pode ser desfeita.
            </p>
            {cancelError && (
              <p className="mb-4 text-xs text-red-600 text-center">{cancelError}</p>
            )}
            <div className="flex gap-3">
              <button
                onClick={() => { setShowCancel(false); setCancelError(null) }}
                disabled={cancelling}
                className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Voltar
              </button>
              <button
                onClick={handleConfirmCancel}
                disabled={cancelling}
                className="flex-1 py-2.5 bg-red-600 text-white rounded-xl text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {cancelling ? 'Cancelando…' : 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
