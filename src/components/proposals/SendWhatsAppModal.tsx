'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

type Props = {
  open: boolean
  onClose: () => void
  proposalId: string
  proposalToken: string
  proposalValidUntil: string | null
  clientName: string | null
  resend?: boolean
}

function fmtDate(iso: string): string {
  const [y, m, d] = iso.split('-')
  return `${d}/${m}/${y}`
}

function buildMessage(name: string, url: string, validUntil: string | null): string {
  const valid = validUntil ? `\n\nVálida até ${fmtDate(validUntil)}. Qualquer dúvida é só falar!` : '\n\nQualquer dúvida é só falar!'
  return `Olá ${name}!\n\nPreparei uma proposta comercial para você.\nAcesse pelo link abaixo:\n\n${url}${valid}`
}

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://freelanceflow.com.br'

const inputCls  = 'w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#1D9E75] focus:border-transparent'

export default function SendWhatsAppModal({
  open, onClose, proposalId, proposalToken, proposalValidUntil, clientName, resend,
}: Props) {
  const router = useRouter()

  const [sending,       setSending]       = useState(false)
  const [error,         setError]         = useState<string | null>(null)
  const [recipientName, setRecipientName] = useState(clientName ?? '')
  const [message,       setMessage]       = useState('')

  const wasOpen = useRef(false)

  // Reset on open
  useEffect(() => {
    if (open && !wasOpen.current) {
      const name = (clientName ?? '').trim() || 'cliente'
      const url  = `${BASE_URL}/p/${proposalToken}`
      setRecipientName(clientName ?? '')
      setMessage(buildMessage(name, url, proposalValidUntil))
      setError(null)
      setSending(false)
    }
    wasOpen.current = open
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  // Rebuild message when recipient name changes
  useEffect(() => {
    if (!open) return
    const name = recipientName.trim() || 'cliente'
    const url  = `${BASE_URL}/p/${proposalToken}`
    setMessage(buildMessage(name, url, proposalValidUntil))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recipientName])

  async function handleSend() {
    setError(null)
    setSending(true)
    try {
      const res  = await fetch(`/api/proposals/${proposalId}/send-whatsapp`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ recipient_name: recipientName.trim() || null, resend: resend ?? false }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Erro ao registrar envio')

      const waUrl = `https://wa.me/?text=${encodeURIComponent(message)}`
      window.open(waUrl, '_blank', 'noopener,noreferrer')
      onClose()
      router.refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao enviar')
    } finally {
      setSending(false)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">

        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-bold text-gray-900">{resend ? 'Reenviar pelo WhatsApp' : 'Enviar pelo WhatsApp'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nome do destinatário <span className="text-gray-400 font-normal">(opcional)</span>
            </label>
            <input
              type="text"
              value={recipientName}
              onChange={e => setRecipientName(e.target.value)}
              placeholder="Nome do cliente"
              className={inputCls}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mensagem</label>
            <textarea
              rows={8}
              value={message}
              onChange={e => setMessage(e.target.value)}
              className={inputCls + ' resize-none font-mono text-xs leading-relaxed'}
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
              disabled={sending}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-[#25D366] text-white rounded-xl text-sm font-semibold hover:bg-[#1ebe5a] transition-colors disabled:opacity-50"
            >
              {sending && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
              {sending ? 'Abrindo...' : 'Abrir WhatsApp'}
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}
