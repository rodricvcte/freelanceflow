'use client'

import { useState } from 'react'

export type Lead = {
  id:          string
  name:        string
  email:       string
  created_at:  string
  coupon_sent: boolean
}

function fmtDateTime(iso: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
    timeZone: 'America/Sao_Paulo',
  }).format(new Date(iso))
}

export default function FoundersTab({ leads }: { leads: Lead[] }) {
  const [sentIds,   setSentIds]   = useState<Set<string>>(
    new Set(leads.filter(l => l.coupon_sent).map(l => l.id))
  )
  const [modalLead, setModalLead] = useState<Lead | null>(null)
  const [code,      setCode]      = useState('')
  const [sending,   setSending]   = useState(false)
  const [toast,     setToast]     = useState<{ text: string; ok: boolean } | null>(null)

  function showToast(text: string, ok = true) {
    setToast({ text, ok })
    setTimeout(() => setToast(null), 4000)
  }

  function openModal(lead: Lead) {
    setModalLead(lead)
    setCode('')
  }

  function closeModal() {
    if (sending) return
    setModalLead(null)
    setCode('')
  }

  async function handleSend() {
    if (!modalLead || !code.trim()) return
    setSending(true)
    try {
      const res  = await fetch('/api/admin/send-coupon', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          leadId: modalLead.id,
          email:  modalLead.email,
          name:   modalLead.name,
          code:   code.trim(),
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Erro ao enviar')
      setSentIds(prev => new Set([...prev, modalLead.id]))
      showToast(`Cupom enviado para ${modalLead.email}`)
      setModalLead(null)
      setCode('')
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Erro ao enviar cupom', false)
    } finally {
      setSending(false)
    }
  }

  const pendingCount = leads.filter(l => !sentIds.has(l.id)).length
  const sentCount    = sentIds.size

  return (
    <>
      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl shadow-lg text-sm font-medium ${toast.ok ? 'bg-[#1D9E75] text-white' : 'bg-red-500 text-white'}`}>
          {toast.text}
        </div>
      )}

      {/* Modal */}
      {modalLead && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          onClick={closeModal}
        >
          <div
            className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm mx-4"
            onClick={e => e.stopPropagation()}
          >
            <h2 className="text-base font-bold text-gray-900 mb-0.5">Enviar cupom de fundador</h2>
            <p className="text-sm text-gray-500 mb-5">{modalLead.name} · {modalLead.email}</p>

            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Código do cupom
            </label>
            <input
              type="text"
              value={code}
              onChange={e => setCode(e.target.value.toUpperCase())}
              placeholder="Ex: FUNDADOR2024"
              disabled={sending}
              autoFocus
              onKeyDown={e => e.key === 'Enter' && !sending && code.trim() && handleSend()}
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1D9E75] focus:border-transparent font-mono tracking-widest uppercase disabled:opacity-50"
            />

            <div className="flex gap-3 mt-5">
              <button
                onClick={closeModal}
                disabled={sending}
                className="flex-1 py-2.5 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleSend}
                disabled={sending || !code.trim()}
                className="flex-1 py-2.5 text-sm font-semibold text-white bg-[#1D9E75] hover:bg-[#188f68] rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {sending && (
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                )}
                {sending ? 'Enviando...' : 'Enviar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: 'Total de leads', value: leads.length },
          { label: 'Cupom enviado', value: sentCount },
          { label: 'Pendentes',     value: pendingCount },
        ].map(stat => (
          <div key={stat.label} className="bg-white rounded-[10px] border border-gray-100 px-4 py-3">
            <p className="text-xs text-gray-400 mb-1">{stat.label}</p>
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wide px-4 py-3">Nome</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wide px-4 py-3">Email</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wide px-4 py-3 whitespace-nowrap">Data de cadastro</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wide px-4 py-3">Status</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wide px-4 py-3">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {leads.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-sm text-gray-400">
                    Nenhum lead cadastrado ainda.
                  </td>
                </tr>
              ) : (
                leads.map((lead, i) => {
                  const hasSent = sentIds.has(lead.id)
                  return (
                    <tr key={lead.id} className={i % 2 !== 0 ? 'bg-gray-50/50' : 'bg-white'}>
                      <td className="px-4 py-3 font-medium text-gray-800">{lead.name}</td>
                      <td className="px-4 py-3 text-gray-600">{lead.email}</td>
                      <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{fmtDateTime(lead.created_at)}</td>
                      <td className="px-4 py-3">
                        {hasSent ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                            Cupom enviado
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500">
                            Pendente
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {!hasSent && (
                          <button
                            onClick={() => openModal(lead)}
                            className="px-3 py-1.5 text-xs font-semibold text-white bg-[#1D9E75] hover:bg-[#188f68] rounded-lg transition-colors"
                          >
                            Enviar cupom
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
