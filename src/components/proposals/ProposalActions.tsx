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
}

type Props = {
  proposalId: string
  token: string
  status: string
  initialPdfUrl: string | null
  duplicate: DuplicateData
}

export default function ProposalActions({ proposalId, token, status, initialPdfUrl, duplicate }: Props) {
  const router = useRouter()
  const [copied, setCopied]           = useState(false)
  const [duplicating, setDuplicating] = useState(false)
  const [pdfUrl, setPdfUrl]           = useState(initialPdfUrl)
  const [pdfLoading, setPdfLoading]   = useState(false)
  const [pdfError, setPdfError]       = useState<string | null>(null)
  const [showCancel, setShowCancel]   = useState(false)
  const [cancelling, setCancelling]   = useState(false)
  const [cancelError, setCancelError] = useState<string | null>(null)

  const canCancel = status !== 'aprovada' && status !== 'cancelada'

  async function handleCopyLink() {
    const url = `${window.location.origin}/p/${token}`
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      window.prompt('Copie o link da proposta:', url)
    }
  }

  async function handleDuplicate() {
    setDuplicating(true)
    try {
      const res = await fetch('/api/proposals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `Cópia de ${duplicate.title}`,
          service_description: duplicate.service_description,
          value: duplicate.value,
          payment_terms: duplicate.payment_terms,
          deadline_days: duplicate.deadline_days,
          valid_until: duplicate.valid_until,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      router.push(`/propostas/${data.id}`)
    } catch {
      setDuplicating(false)
    }
  }

  async function handleGeneratePDF() {
    setPdfLoading(true)
    setPdfError(null)
    try {
      const res = await fetch(`/api/proposals/${proposalId}/pdf`, { method: 'POST' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Erro ao gerar PDF')
      setPdfUrl(data.pdf_url)
    } catch (e) {
      setPdfError(e instanceof Error ? e.message : 'Erro ao gerar PDF')
    } finally {
      setPdfLoading(false)
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

  const btn = 'flex items-center gap-2 px-3.5 py-2 text-sm font-medium rounded-lg border transition-colors'

  return (
    <>
      <div className="space-y-4">
        {/* Action buttons */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleCopyLink}
            className={`${btn} ${copied ? 'bg-[#1D9E75]/10 text-[#1D9E75] border-[#1D9E75]/30' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'}`}
          >
            {copied ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            )}
            {copied ? 'Copiado!' : 'Copiar link'}
          </button>

          <Link
            href={`/propostas/${proposalId}/editar`}
            className={`${btn} bg-white text-gray-700 border-gray-200 hover:bg-gray-50`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Editar
          </Link>

          <button
            onClick={handleDuplicate}
            disabled={duplicating}
            className={`${btn} bg-white text-gray-700 border-gray-200 hover:bg-gray-50 disabled:opacity-50`}
          >
            {duplicating ? (
              <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            )}
            {duplicating ? 'Duplicando...' : 'Duplicar'}
          </button>

          {canCancel && (
            <button
              onClick={() => setShowCancel(true)}
              className={`${btn} bg-white text-red-600 border-red-200 hover:bg-red-50`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
              Cancelar proposta
            </button>
          )}
        </div>

        {/* PDF section */}
        <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">PDF da proposta</p>
          {pdfUrl ? (
            <div className="flex flex-wrap gap-2">
              <a
                href={pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3.5 py-2 bg-[#1D9E75] text-white text-sm font-medium rounded-lg hover:bg-[#188f68] transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Baixar PDF
              </a>
              <button
                onClick={handleGeneratePDF}
                disabled={pdfLoading}
                className="px-3.5 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                {pdfLoading ? 'Gerando...' : 'Regenerar'}
              </button>
            </div>
          ) : (
            <div>
              <button
                onClick={handleGeneratePDF}
                disabled={pdfLoading}
                className="flex items-center gap-2 px-3.5 py-2 bg-[#1D9E75] text-white text-sm font-medium rounded-lg hover:bg-[#188f68] transition-colors disabled:opacity-50"
              >
                {pdfLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                )}
                {pdfLoading ? 'Gerando PDF...' : 'Gerar PDF'}
              </button>
              {pdfError && <p className="mt-2 text-xs text-red-600">{pdfError}</p>}
            </div>
          )}
        </div>
      </div>

      {/* Cancel confirmation modal */}
      {showCancel && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
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
                {cancelling ? 'Cancelando...' : 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
