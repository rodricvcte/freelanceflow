'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import SendProposalModal from './SendProposalModal'
import SendWhatsAppModal from './SendWhatsAppModal'

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

type SendProps = {
  proposalTitle: string
  clientEmail: string | null
  clientName: string | null
  freelancerName: string
  proposalToken: string
  proposalValidUntil: string | null
}

type Props = {
  proposalId: string
  status: string
  version: number
  newerVersion: number | null
  initialPdfUrl: string | null
  duplicate: DuplicateData
  sendProps?: SendProps
}

// Which statuses show "Nova versão" and whether they need a confirm dialog
// expirada is intentionally excluded — it shows only "Clonar"
const NEW_VERSION_CONFIG: Record<string, { confirm: string } | { confirm: null }> = {
  enviada:     { confirm: 'O cliente ainda tem uma versão em análise. Deseja criar uma nova versão mesmo assim?' },
  visualizada: { confirm: 'O cliente ainda tem uma versão em análise. Deseja criar uma nova versão mesmo assim?' },
  aceita:    { confirm: 'Esta proposta já foi aceita. Deseja criar uma nova versão?' },
  recusada:  { confirm: null },
}

export default function ProposalActions({ proposalId, status, version, newerVersion, initialPdfUrl, duplicate, sendProps }: Props) {
  const router = useRouter()

  const [duplicating,         setDuplicating]         = useState(false)
  const [showSend,            setShowSend]             = useState(false)
  const [showWhatsApp,        setShowWhatsApp]         = useState(false)
  const [showSendDropdown,    setShowSendDropdown]     = useState(false)
  const [showResendConfirm,   setShowResendConfirm]    = useState(false)
  const [resendChannel,       setResendChannel]        = useState<'email' | 'whatsapp' | null>(null)
  const [showCancel,          setShowCancel]           = useState(false)

  const dropdownRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!showSendDropdown) return
    function handleOutside(e: MouseEvent | TouchEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowSendDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleOutside)
    document.addEventListener('touchstart', handleOutside, { passive: true })
    return () => {
      document.removeEventListener('mousedown', handleOutside)
      document.removeEventListener('touchstart', handleOutside)
    }
  }, [showSendDropdown])
  const [cancelling,        setCancelling]         = useState(false)
  const [cancelError,       setCancelError]        = useState<string | null>(null)
  const [showNewVersion,  setShowNewVersion]   = useState(false)
  const [newVersionError, setNewVersionError] = useState<string | null>(null)

  const isDraft      = status === 'rascunho'
  const isResend     = status === 'enviada' || status === 'visualizada'
  const isExpired    = status === 'expirada'
  const isCancelled  = status === 'cancelada'
  const canCancel    = status !== 'aceita' && status !== 'cancelada' && status !== 'recusada'
  const versionCfg   = NEW_VERSION_CONFIG[status]

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

  function handleNewVersion() {
    try {
      sessionStorage.setItem('ff_new_version_draft', JSON.stringify({
        sourceProposalId:    proposalId,
        title:               duplicate.title,
        service_description: duplicate.service_description,
        value:               duplicate.value,
        payment_terms:       duplicate.payment_terms,
        deadline_days:       duplicate.deadline_days,
        valid_until:         duplicate.valid_until,
        client_id:           duplicate.client_id,
        sections:            duplicate.sections,
      }))
      router.push('/propostas/new?mode=new-version')
    } catch (e) {
      setNewVersionError(e instanceof Error ? e.message : 'Erro ao abrir editor')
    }
  }

  function handleNewVersionClick() {
    if (!versionCfg) return
    if (versionCfg.confirm === null) {
      // recusada — direct, no dialog
      handleNewVersion()
    } else {
      setShowNewVersion(true)
    }
  }

  async function handleConfirmCancel() {
    setCancelling(true)
    setCancelError(null)
    try {
      const res  = await fetch(`/api/proposals/${proposalId}`, {
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

  const sep = <span className="w-px h-5 bg-gray-200 self-center shrink-0" />

  const secondaryCls =
    'inline-flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50'

  const newVersionLabel = `Nova versão (v${version + 1})`

  return (
    <>
      {/* ── Barra de ações ── */}
      <div className="flex items-center gap-2 flex-wrap">

        {/* Editar — rascunho */}
        {isDraft && (
          <Link href={`/propostas/${proposalId}/editar`} className={secondaryCls}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 20h4l10.5 -10.5a2.828 2.828 0 1 0 -4 -4l-10.5 10.5v4" />
              <path d="M13.5 6.5l4 4" />
            </svg>
            Editar
          </Link>
        )}

        {/* Nova versão — enviada / visualizada / aceita / recusada */}
        {versionCfg && (
          newerVersion ? (
            <div className="relative group">
              <button disabled className={secondaryCls}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 5v14" />
                  <path d="M5 12l7 -7l7 7" />
                  <path d="M5 19h14" />
                </svg>
                {newVersionLabel}
              </button>
              <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-20">
                <div className="bg-gray-800 text-white text-xs rounded-md px-2.5 py-1.5 whitespace-nowrap shadow-lg">
                  v{newerVersion} já existe
                </div>
                <div className="w-2 h-2 bg-gray-800 rotate-45 mx-auto -mt-1" />
              </div>
            </div>
          ) : (
            <button
              onClick={handleNewVersionClick}
              className={secondaryCls}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 5v14" />
                <path d="M5 12l7 -7l7 7" />
                <path d="M5 19h14" />
              </svg>
              {newVersionLabel}
            </button>
          )
        )}

        {/* Duplicar / Clonar */}
        {!isCancelled && (
          <button onClick={handleDuplicate} disabled={duplicating} className={secondaryCls}>
            {duplicating ? (
              <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <rect x="8" y="8" width="12" height="12" rx="2" />
                <path d="M16 8v-2a2 2 0 0 0 -2 -2h-8a2 2 0 0 0 -2 2v8a2 2 0 0 0 2 2h2" />
              </svg>
            )}
            {duplicating ? 'Clonando…' : (isExpired ? 'Clonar' : 'Duplicar')}
          </button>
        )}

        {/* PDF */}
        {initialPdfUrl && (
          <a href={initialPdfUrl} target="_blank" rel="noopener noreferrer" className={secondaryCls}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 3v4a1 1 0 0 0 1 1h4" />
              <path d="M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2z" />
              <path d="M9 17h1a1 1 0 0 0 1 -1v-2a1 1 0 0 0 -1 -1h-1v4" />
              <path d="M14 13h1.5a1.5 1.5 0 0 1 0 3h-1.5v-3" />
              <path d="M17 17v-4" />
            </svg>
            PDF
          </a>
        )}

        {/* Separador antes de Enviar / Reenviar */}
        {(isDraft || isResend) && sendProps && sep}

        {/* Enviar / Reenviar — dropdown com canal */}
        {(isDraft || isResend) && sendProps && (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowSendDropdown(p => !p)}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-white bg-[#1D9E75] rounded-lg hover:bg-[#188f68] transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="5" width="18" height="14" rx="2" />
                <polyline points="3 7 12 13 21 7" />
              </svg>
              {isResend ? 'Reenviar' : 'Enviar'}
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 opacity-80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 9l6 6 6-6" />
              </svg>
            </button>

            {showSendDropdown && (
              <div className="absolute left-0 top-full mt-1.5 w-48 bg-white border border-gray-200 rounded-xl shadow-lg z-50 py-1">
                <button
                  onClick={() => {
                    setShowSendDropdown(false)
                    if (isResend) { setResendChannel('email'); setShowResendConfirm(true) }
                    else setShowSend(true)
                  }}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors text-left"
                >
                  <span className="text-base leading-none">📧</span>
                  Por e-mail
                </button>
                <button
                  onClick={() => {
                    setShowSendDropdown(false)
                    if (isResend) { setResendChannel('whatsapp'); setShowResendConfirm(true) }
                    else setShowWhatsApp(true)
                  }}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors text-left"
                >
                  <span className="text-base leading-none">💬</span>
                  Pelo WhatsApp
                </button>
              </div>
            )}
          </div>
        )}

        {/* Separador antes de Cancelar */}
        {canCancel && sep}

        {/* Cancelar */}
        {canCancel && (
          <button
            onClick={() => setShowCancel(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-red-400 hover:text-red-600 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="9" />
              <path d="M5.7 5.7l12.6 12.6" />
            </svg>
            Cancelar
          </button>
        )}
      </div>

      {/* ── Modal enviar / reenviar ── */}
      {sendProps && (
        <SendProposalModal
          open={showSend}
          onClose={() => setShowSend(false)}
          proposalId={proposalId}
          proposalTitle={sendProps.proposalTitle}
          clientEmail={sendProps.clientEmail}
          clientName={sendProps.clientName}
          freelancerName={sendProps.freelancerName}
          resend={isResend}
        />
      )}

      {/* ── Modal WhatsApp ── */}
      {sendProps && (
        <SendWhatsAppModal
          open={showWhatsApp}
          onClose={() => setShowWhatsApp(false)}
          proposalId={proposalId}
          proposalToken={sendProps.proposalToken}
          proposalValidUntil={sendProps.proposalValidUntil}
          clientName={sendProps.clientName}
          resend={isResend}
        />
      )}

      {/* ── Modal confirmação de reenvio ── */}
      {showResendConfirm && resendChannel && sendProps && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <h3 className="text-lg font-bold text-gray-900 text-center mb-3">Reenviar proposta?</h3>
            <p className="text-sm text-gray-500 text-center mb-6">
              Esta proposta já foi enviada. Deseja reenviar?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => { setShowResendConfirm(false); setResendChannel(null) }}
                className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  setShowResendConfirm(false)
                  if (resendChannel === 'email') setShowSend(true)
                  else setShowWhatsApp(true)
                }}
                className="flex-1 py-2.5 bg-[#1D9E75] text-white rounded-xl text-sm font-medium hover:bg-[#188f68] transition-colors"
              >
                Sim, reenviar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal nova versão ── */}
      {showNewVersion && versionCfg && versionCfg.confirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-amber-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 9v4" />
                <path d="M10.363 3.591l-8.106 13.534a1.914 1.914 0 0 0 1.636 2.871h16.214a1.914 1.914 0 0 0 1.636 -2.87l-8.106 -13.536a1.914 1.914 0 0 0 -3.274 0z" />
                <path d="M12 16h.01" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-900 text-center mb-2">
              Criar {newVersionLabel}?
            </h3>
            <p className="text-sm text-gray-500 text-center mb-6">
              {versionCfg.confirm}
            </p>
            {newVersionError && (
              <p className="mb-4 text-xs text-red-600 text-center">{newVersionError}</p>
            )}
            <div className="flex gap-3">
              <button
                onClick={() => { setShowNewVersion(false); setNewVersionError(null) }}
                className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Voltar
              </button>
              <button
                onClick={handleNewVersion}
                className="flex-1 py-2.5 bg-[#1D9E75] text-white rounded-xl text-sm font-medium hover:bg-[#188f68] transition-colors"
              >
                Criar versão
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal cancelar ── */}
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
