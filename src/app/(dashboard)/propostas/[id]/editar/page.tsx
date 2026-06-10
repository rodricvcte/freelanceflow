'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'

type Client = { id: string; name: string; email: string | null; phone: string | null }

const EMPTY = {
  title: '',
  service_description: '',
  value: '',
  payment_terms: '',
  deadline_days: '',
  valid_until: '',
  client_id: '',
}

export default function EditarPropostaPage() {
  const { id } = useParams<{ id: string }>()
  const router  = useRouter()

  const [form, setForm]       = useState(EMPTY)
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSub]  = useState(false)
  const [error, setError]     = useState<string | null>(null)

  useEffect(() => {
    Promise.all([
      fetch(`/api/proposals/${id}`).then(r => r.json()),
      fetch('/api/clients').then(r => r.json()),
    ]).then(([proposal, clientList]) => {
      if (proposal.error) { setError(proposal.error); setLoading(false); return }
      setForm({
        title:               proposal.title ?? '',
        service_description: proposal.service_description ?? '',
        value:               proposal.value?.toString() ?? '',
        payment_terms:       proposal.payment_terms ?? '',
        deadline_days:       proposal.deadline_days?.toString() ?? '',
        valid_until:         proposal.valid_until ?? '',
        client_id:           proposal.client_id ?? '',
      })
      setClients(Array.isArray(clientList) ? clientList : [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [id])

  function set(k: keyof typeof EMPTY, v: string) {
    setForm(p => ({ ...p, [k]: v }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSub(true)
    try {
      const res = await fetch(`/api/proposals/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          client_id: form.client_id || null,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      router.push(`/propostas/${id}`)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Erro ao salvar proposta')
      setSub(false)
    }
  }

  const inputCls = 'w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#1D9E75] focus:border-transparent'
  const labelCls = 'block text-sm font-medium text-gray-700 mb-1'

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-[#1D9E75] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="p-6 md:p-8 max-w-2xl">
      <div className="flex items-center gap-3 mb-8">
        <Link href={`/propostas/${id}`} className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-100">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Editar Proposta</h1>
          <p className="text-sm text-gray-500 mt-0.5">Salvar incrementa a versão e regenera o PDF automaticamente</p>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm space-y-4">
          <h2 className="text-sm font-semibold text-gray-900">Informações da proposta</h2>

          <div>
            <label className={labelCls}>Título <span className="text-red-500">*</span></label>
            <input type="text" required value={form.title} onChange={e => set('title', e.target.value)}
              className={inputCls} />
          </div>

          <div>
            <label className={labelCls}>Descrição do serviço <span className="text-red-500">*</span></label>
            <textarea required value={form.service_description}
              onChange={e => set('service_description', e.target.value)}
              rows={4} className={inputCls + ' resize-none'} />
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm space-y-4">
          <h2 className="text-sm font-semibold text-gray-900">Valores e prazos</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Valor <span className="text-red-500">*</span></label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500 font-medium">R$</span>
                <input type="number" min="0" step="0.01" required value={form.value}
                  onChange={e => set('value', e.target.value)} className={inputCls + ' pl-9'} />
              </div>
            </div>
            <div>
              <label className={labelCls}>Prazo de entrega (dias)</label>
              <input type="number" min="1" value={form.deadline_days}
                onChange={e => set('deadline_days', e.target.value)} className={inputCls} />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Condições de pagamento</label>
              <input type="text" value={form.payment_terms}
                onChange={e => set('payment_terms', e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Válida até</label>
              <input type="date" value={form.valid_until}
                onChange={e => set('valid_until', e.target.value)} className={inputCls} />
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Cliente</h2>
          <select value={form.client_id} onChange={e => set('client_id', e.target.value)} className={inputCls}>
            <option value="">Sem cliente</option>
            {clients.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center justify-end gap-3 pb-8">
          <Link href={`/propostas/${id}`}
            className="px-4 py-2.5 text-sm font-medium text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            Cancelar
          </Link>
          <button type="submit" disabled={submitting}
            className="px-6 py-2.5 bg-[#1D9E75] text-white text-sm font-medium rounded-lg hover:bg-[#188f68] transition-colors disabled:opacity-50">
            {submitting ? 'Salvando...' : 'Salvar nova versão'}
          </button>
        </div>
      </form>
    </div>
  )
}
