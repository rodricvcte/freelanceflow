'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

type Props = {
  open: boolean
  onClose: () => void
  proposalId: string
  proposalTitle: string
  clientEmail: string | null
  clientName: string | null
  freelancerName: string
}

const DEFAULT_MESSAGE = 'Olá! Segue em anexo a proposta comercial conforme conversamos. Fico à disposição para qualquer dúvida.'

export default function SendProposalModal({
  open, onClose,
  proposalId, proposalTitle, clientEmail, clientName, freelancerName,
}: Props) {
  const router = useRouter()
  const [sending, setSending] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError]     = useState<string | null>(null)
  const [form, setForm]       = useState({
    recipient_email: clientEmail ?? '',
    recipient_name:  clientName  ?? '',
    custom_message:  DEFAULT_MESSAGE,
  })

  const wasOpen = useRef(false)
  useEffect(() => {
    if (open && !wasOpen.current) {
      setSuccess(false)
      setError(null)
      setForm({
        recipient_email: clientEmail ?? '',
        recipient_name:  clientName  ?? '',
        custom_message:  DEFAULT_MESSAGE,
      })
    }
    wasOpen.current = open
  // Reset only when modal transitions from closed → open, not on prop changes while open
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  function setField(k: keyof typeof form, v: string) {
    setForm(p => ({ ...p, [k]: v }))
  }

  async function handleSend() {
    if (!form.recipient_email.trim()) { setError('Informe o e-mail do destinatário'); return }
    setError(null)
    setSending(true)
    try {
      const res  = await fetch(`/api/proposals/${proposalId}/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail ?? data.error ?? 'Erro ao enviar')
      setSuccess(true)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao enviar')
    } finally {
      setSending(false)
    }
  }

  if (!open) return null

  const subject   = `Proposta Comercial — ${proposalTitle} — ${freelancerName}`
  const inputCls  = 'w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#1D9E75] focus:border-transparent'

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">

        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-bold text-gray-900">Enviar proposta por e-mail</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {success ? (
          <div className="px-6 py-10 text-center">
            <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-base font-semibold text-gray-900">Proposta enviada!</p>
            <p className="text-sm text-gray-500 mt-1">O cliente receberá o e-mail em instantes.</p>
            <button
              onClick={() => { onClose(); router.refresh() }}
              className="mt-5 px-6 py-2.5 bg-[#1D9E75] text-white rounded-xl text-sm font-semibold hover:bg-[#188f68] transition-colors"
            >
              OK
            </button>
          </div>
        ) : (
          <div className="px-6 py-5 space-y-4">
            <div className="bg-gray-50 border border-gray-100 rounded-lg px-4 py-2.5">
              <p className="text-xs text-gray-400 mb-0.5">Assunto</p>
              <p className="text-sm text-gray-700 font-medium truncate">{subject}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                E-mail do destinatário <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={form.recipient_email}
                onChange={e => setField('recipient_email', e.target.value)}
                placeholder="cliente@empresa.com"
                className={inputCls}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome do destinatário</label>
              <input
                type="text"
                value={form.recipient_name}
                onChange={e => setField('recipient_name', e.target.value)}
                placeholder="Nome do cliente"
                className={inputCls}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mensagem personalizada</label>
              <textarea
                rows={3}
                value={form.custom_message}
                onChange={e => setField('custom_message', e.target.value)}
                className={inputCls + ' resize-none'}
              />
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>
            )}

            <div className="flex gap-3 pt-1 pb-2">
              <button
                onClick={onClose}
                disabled={sending}
                className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleSend}
                disabled={sending || !form.recipient_email.trim()}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-[#1D9E75] text-white rounded-xl text-sm font-semibold hover:bg-[#188f68] transition-colors disabled:opacity-50"
              >
                {sending && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                {sending ? 'Enviando...' : 'Enviar'}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
