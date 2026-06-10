'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

type Client = { id: string; name: string; email: string | null; phone: string | null }
type PlanInfo = { plan: string; used: number; limit: number }

const EMPTY_FORM = {
  title: '',
  service_description: '',
  value: '',
  payment_terms: '',
  deadline_days: '',
  valid_until: '',
  client_id: '',
}

const EMPTY_NEW_CLIENT = { name: '', email: '', phone: '' }

export default function NewProposalPage() {
  const router = useRouter()
  const [form, setForm]                 = useState(EMPTY_FORM)
  const [clients, setClients]           = useState<Client[]>([])
  const [newClient, setNewClient]       = useState(EMPTY_NEW_CLIENT)
  const [showNewClient, setShowNew]     = useState(false)
  const [savingClient, setSavingClient] = useState(false)
  const [submitting, setSubmitting]     = useState(false)
  const [error, setError]               = useState<string | null>(null)
  const [plan, setPlan]                 = useState<PlanInfo | null>(null)
  const [planLoading, setPlanLoading]   = useState(true)

  useEffect(() => {
    fetch('/api/clients')
      .then(r => r.json())
      .then(data => setClients(Array.isArray(data) ? data : []))

    fetch('/api/subscriptions')
      .then(r => r.json())
      .then(d => { setPlan(d); setPlanLoading(false) })
      .catch(() => setPlanLoading(false))
  }, [])

  function set(field: keyof typeof EMPTY_FORM, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  function handleClientSelect(value: string) {
    if (value === '__new__') {
      setShowNew(true)
      set('client_id', '__new__')
    } else {
      setShowNew(false)
      set('client_id', value)
    }
  }

  async function handleSaveClient() {
    if (!newClient.name.trim()) return
    setSavingClient(true)
    try {
      const res = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newClient),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setClients(prev => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)))
      set('client_id', data.id)
      setShowNew(false)
      setNewClient(EMPTY_NEW_CLIENT)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Erro ao criar cliente')
    } finally {
      setSavingClient(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      const res = await fetch('/api/proposals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          client_id: form.client_id === '__new__' ? null : form.client_id || null,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      router.push('/propostas')
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Erro ao criar proposta')
      setSubmitting(false)
    }
  }

  const inputCls = 'w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#1D9E75] focus:border-transparent'
  const labelCls = 'block text-sm font-medium text-gray-700 mb-1'

  const limitReached = !planLoading && !!plan && plan.plan === 'free' && plan.used >= plan.limit

  if (!planLoading && limitReached) {
    return <UpgradeModal used={plan!.used} limit={plan!.limit} />
  }

  return (
    <div className="p-6 md:p-8 max-w-2xl">
      {/* Plano Free — uso */}
      {plan && plan.plan === 'free' && (
        <div className="mb-6 flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M12 20a8 8 0 100-16 8 8 0 000 16z" />
          </svg>
          Plano Free: {plan.used}/{plan.limit} propostas criadas este mês.{' '}
          <Link href="/configuracoes" className="underline font-medium">Fazer upgrade</Link>
        </div>
      )}
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <Link href="/propostas" className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-100">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Nova Proposta</h1>
          <p className="text-sm text-gray-500 mt-0.5">Preencha os dados e envie para o cliente</p>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Informações da proposta */}
        <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm space-y-4">
          <h2 className="text-sm font-semibold text-gray-900">Informações da proposta</h2>

          <div>
            <label className={labelCls}>Título <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={form.title}
              onChange={e => set('title', e.target.value)}
              required
              placeholder="Ex: Desenvolvimento de landing page"
              className={inputCls}
            />
          </div>

          <div>
            <label className={labelCls}>Descrição do serviço <span className="text-red-500">*</span></label>
            <textarea
              value={form.service_description}
              onChange={e => set('service_description', e.target.value)}
              required
              rows={4}
              placeholder="Descreva o escopo do serviço, entregas e etapas..."
              className={inputCls + ' resize-none'}
            />
          </div>
        </div>

        {/* Valores e prazos */}
        <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm space-y-4">
          <h2 className="text-sm font-semibold text-gray-900">Valores e prazos</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Valor <span className="text-red-500">*</span></label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500 font-medium">R$</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.value}
                  onChange={e => set('value', e.target.value)}
                  required
                  placeholder="0,00"
                  className={inputCls + ' pl-9'}
                />
              </div>
            </div>

            <div>
              <label className={labelCls}>Prazo de entrega (dias)</label>
              <input
                type="number"
                min="1"
                value={form.deadline_days}
                onChange={e => set('deadline_days', e.target.value)}
                placeholder="Ex: 30"
                className={inputCls}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Condições de pagamento</label>
              <input
                type="text"
                value={form.payment_terms}
                onChange={e => set('payment_terms', e.target.value)}
                placeholder="Ex: 50% antecipado, 50% na entrega"
                className={inputCls}
              />
            </div>

            <div>
              <label className={labelCls}>Válida até</label>
              <input
                type="date"
                value={form.valid_until}
                onChange={e => set('valid_until', e.target.value)}
                className={inputCls}
              />
            </div>
          </div>
        </div>

        {/* Cliente */}
        <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm space-y-4">
          <h2 className="text-sm font-semibold text-gray-900">Cliente <span className="text-gray-400 font-normal">(opcional)</span></h2>

          <div>
            <label className={labelCls}>Selecionar cliente</label>
            <select
              value={form.client_id}
              onChange={e => handleClientSelect(e.target.value)}
              className={inputCls}
            >
              <option value="">Sem cliente</option>
              {clients.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
              <option value="__new__">+ Novo cliente</option>
            </select>
          </div>

          {/* Inline new client form */}
          {showNewClient && (
            <div className="border border-dashed border-[#1D9E75]/40 rounded-lg p-4 bg-[#1D9E75]/5 space-y-3">
              <p className="text-xs font-semibold text-[#1D9E75] uppercase tracking-wide">Novo cliente</p>
              <div>
                <label className={labelCls}>Nome <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={newClient.name}
                  onChange={e => setNewClient(p => ({ ...p, name: e.target.value }))}
                  placeholder="Nome do cliente"
                  className={inputCls}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Email</label>
                  <input
                    type="email"
                    value={newClient.email}
                    onChange={e => setNewClient(p => ({ ...p, email: e.target.value }))}
                    placeholder="email@cliente.com"
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>Telefone</label>
                  <input
                    type="tel"
                    value={newClient.phone}
                    onChange={e => setNewClient(p => ({ ...p, phone: e.target.value }))}
                    placeholder="(11) 99999-9999"
                    className={inputCls}
                  />
                </div>
              </div>
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleSaveClient}
                  disabled={savingClient || !newClient.name.trim()}
                  className="px-4 py-2 bg-[#1D9E75] text-white text-sm font-medium rounded-lg hover:bg-[#188f68] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {savingClient ? 'Salvando...' : 'Salvar cliente'}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowNew(false); set('client_id', '') }}
                  className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pb-8">
          <Link
            href="/propostas"
            className="px-4 py-2.5 text-sm font-medium text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2.5 bg-[#1D9E75] text-white text-sm font-medium rounded-lg hover:bg-[#188f68] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Criando...' : 'Criar proposta'}
          </button>
        </div>
      </form>
    </div>
  )
}

function UpgradeModal({ used, limit }: { used: number; limit: number }) {
  return (
    <div className="p-6 md:p-8 max-w-lg">
      <div className="bg-white border border-gray-100 rounded-2xl p-8 shadow-sm text-center">
        {/* Icon */}
        <div className="w-14 h-14 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>

        <h2 className="text-xl font-bold text-gray-900 mb-2">Limite atingido</h2>
        <p className="text-sm text-gray-500 mb-1">
          Você criou <span className="font-semibold text-gray-900">{used} de {limit} propostas</span> disponíveis no plano Free este mês.
        </p>
        <p className="text-sm text-gray-500 mb-6">
          Faça upgrade para o Pro e crie propostas ilimitadas.
        </p>

        {/* Plan card */}
        <div className="border-2 border-[#1D9E75] rounded-xl p-5 mb-6 text-left">
          <div className="flex items-center justify-between mb-3">
            <span className="font-bold text-gray-900 text-base">Plano Pro</span>
            <span className="bg-[#1D9E75]/10 text-[#1D9E75] text-xs font-semibold px-2 py-0.5 rounded-full">Recomendado</span>
          </div>
          <div className="flex items-baseline gap-1 mb-4">
            <span className="text-3xl font-bold text-gray-900">R$39</span>
            <span className="text-sm text-gray-500">/mês</span>
          </div>
          <ul className="space-y-2 text-sm text-gray-600">
            {[
              'Propostas ilimitadas',
              'PDF com sua identidade visual',
              'Follow-ups automáticos',
              'Link público rastreável',
            ].map(f => (
              <li key={f} className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#1D9E75] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                {f}
              </li>
            ))}
          </ul>
        </div>

        <Link
          href="/configuracoes?tab=plano"
          className="block w-full py-3 bg-[#1D9E75] text-white text-sm font-semibold rounded-xl hover:bg-[#188f68] transition-colors text-center mb-3"
        >
          Fazer upgrade para Pro
        </Link>
        <Link href="/propostas" className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
          Voltar para propostas
        </Link>
      </div>
    </div>
  )
}
