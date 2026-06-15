'use client'

import { useState } from 'react'

type FollowUpRow = {
  id: string
  type: 'whatsapp' | 'email'
  trigger_rule: string | null
  scheduled_for: string | null
  created_at: string
}

const MOTIVO: Record<string, string> = {
  R1: 'Enviada há 5+ dias sem resposta',
  R2: 'Visualizada sem resposta',
  manual: 'Lembrete manual',
}

function fmtDateTime(iso: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  }).format(new Date(iso))
}

function IconEmail() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <polyline points="3 7 12 13 21 7" />
    </svg>
  )
}

function IconWhatsApp() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
      <path d="M12 0C5.373 0 0 5.373 0 12c0 2.126.556 4.12 1.524 5.856L0 24l6.29-1.498A11.952 11.952 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.6a9.573 9.573 0 01-4.892-1.344l-.35-.21-3.633.866.929-3.517-.23-.364A9.558 9.558 0 012.4 12c0-5.292 4.308-9.6 9.6-9.6 5.292 0 9.6 4.308 9.6 9.6 0 5.292-4.308 9.6-9.6 9.6z" />
    </svg>
  )
}

export default function FollowUpSidebar({
  proposalId,
  initialFollowUps,
}: {
  proposalId: string
  initialFollowUps: FollowUpRow[]
}) {
  const [followUps, setFollowUps]   = useState<FollowUpRow[]>(initialFollowUps)
  const [showModal, setShowModal]   = useState(false)
  const [type, setType]             = useState<'email' | 'whatsapp'>('email')
  const [scheduledFor, setScheduled] = useState('')
  const [adding, setAdding]         = useState(false)
  const [addError, setAddError]     = useState<string | null>(null)
  const [completing, setCompleting] = useState<string | null>(null)

  function openModal() {
    setType('email')
    setScheduled('')
    setAddError(null)
    setShowModal(true)
  }

  function closeModal() {
    setShowModal(false)
  }

  async function handleAdd() {
    setAdding(true)
    setAddError(null)
    try {
      const res = await fetch('/api/follow-ups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          proposal_id: proposalId,
          type,
          scheduled_for: scheduledFor || null,
        }),
      })
      if (res.ok) {
        const data = await res.json()
        setFollowUps(prev => [...prev, data])
        closeModal()
      } else {
        const err = await res.json().catch(() => ({}))
        setAddError(err.error ?? 'Erro ao salvar lembrete')
      }
    } catch {
      setAddError('Erro de conexão')
    } finally {
      setAdding(false)
    }
  }

  async function markDone(id: string) {
    setCompleting(id)
    try {
      const res = await fetch(`/api/follow-ups/${id}`, { method: 'PATCH' })
      if (res.ok) {
        setFollowUps(prev => prev.filter(f => f.id !== id))
      }
    } finally {
      setCompleting(null)
    }
  }

  return (
    <>
      <div className="bg-white rounded-[10px] border border-gray-100">
        <div className="px-4 py-3.5 border-b border-gray-50">
          <h3 className="text-sm font-medium text-gray-600">Follow-ups</h3>
        </div>
        <div className="px-4 py-4">
          {followUps.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-1">Nenhum follow-up pendente</p>
          ) : (
            <ul className="space-y-2.5 mb-1">
              {followUps.map(fu => (
                <li key={fu.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                    fu.type === 'whatsapp' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'
                  }`}>
                    {fu.type === 'whatsapp' ? <IconWhatsApp /> : <IconEmail />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-900 capitalize">{fu.type}</p>
                    {fu.scheduled_for && (
                      <p className="text-xs text-gray-500 mt-0.5">{fmtDateTime(fu.scheduled_for)}</p>
                    )}
                    {fu.trigger_rule && (
                      <p className="text-xs text-gray-400 mt-0.5">{MOTIVO[fu.trigger_rule] ?? fu.trigger_rule}</p>
                    )}
                  </div>
                  <button
                    onClick={() => markDone(fu.id)}
                    disabled={completing === fu.id}
                    className="shrink-0 text-[11px] font-medium text-[#1D9E75] hover:text-[#188f68] disabled:opacity-40 transition-colors pt-0.5"
                  >
                    {completing === fu.id ? '...' : 'Feito'}
                  </button>
                </li>
              ))}
            </ul>
          )}

          <button
            onClick={openModal}
            className="mt-3 flex items-center gap-1.5 text-xs font-medium text-[#1D9E75] hover:text-[#188f68] transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Adicionar lembrete
          </button>
        </div>
      </div>

      {/* ── Modal ── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" onClick={closeModal}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6" onClick={e => e.stopPropagation()}>
            <h2 className="text-base font-semibold text-gray-900 mb-5">Novo follow-up</h2>

            {/* Canal */}
            <div className="mb-4">
              <label className="block text-xs font-medium text-gray-600 mb-2">Canal</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setType('email')}
                  className={`flex-1 py-2 text-sm rounded-lg border transition-colors font-medium ${
                    type === 'email'
                      ? 'border-[#1D9E75] bg-[#1D9E75]/5 text-[#1D9E75]'
                      : 'border-gray-200 text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  Email
                </button>
                <button
                  onClick={() => setType('whatsapp')}
                  className={`flex-1 py-2 text-sm rounded-lg border transition-colors font-medium ${
                    type === 'whatsapp'
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-gray-200 text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  WhatsApp
                </button>
              </div>
            </div>

            {/* Data */}
            <div className="mb-5">
              <label className="block text-xs font-medium text-gray-600 mb-2">
                Data do lembrete <span className="text-gray-400 font-normal">(opcional)</span>
              </label>
              <input
                type="datetime-local"
                value={scheduledFor}
                onChange={e => setScheduled(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1D9E75] focus:border-transparent"
              />
            </div>

            {addError && (
              <p className="text-xs text-red-600 mb-3">{addError}</p>
            )}

            <div className="flex gap-2">
              <button
                onClick={closeModal}
                className="flex-1 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleAdd}
                disabled={adding}
                className="flex-1 py-2 text-sm font-medium text-white bg-[#1D9E75] rounded-lg hover:bg-[#188f68] transition-colors disabled:opacity-50"
              >
                {adding ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
