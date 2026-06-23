'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { maskPhone } from '@/lib/masks'
import UpgradeModal from '@/components/UpgradeModal'

const EMPTY = { name: '', email: '', phone: '', notes: '' }

export default function NovoClientePage() {
  const router = useRouter()
  const [form, setForm]         = useState(EMPTY)
  const [submitting, setSub]    = useState(false)
  const [error, setError]       = useState<string | null>(null)
  const [planLoading, setPL]    = useState(true)
  const [atLimit, setAtLimit]   = useState(false)
  const [showUpgrade, setShow]  = useState(false)

  useEffect(() => {
    Promise.all([
      fetch('/api/subscriptions').then(r => r.json()).catch(() => ({})),
      fetch('/api/clients').then(r => r.json()).catch(() => []),
    ]).then(([sub, clients]) => {
      const pro = sub.plan === 'pro' && (sub.status === 'active' || sub.status === 'trialing')
      const count = Array.isArray(clients) ? clients.length : 0
      if (!pro && count >= 5) setAtLimit(true)
      setPL(false)
    })
  }, [])

  function set(k: keyof typeof EMPTY, v: string) {
    setForm(p => ({ ...p, [k]: v }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSub(true)
    try {
      const res = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) {
        if (data.code === 'PLAN_LIMIT_REACHED') { setAtLimit(true); setSub(false); return }
        throw new Error(data.error)
      }
      router.push(`/clientes/${data.id}`)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Erro ao criar cliente')
      setSub(false)
    }
  }

  const inputCls = 'w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#1D9E75] focus:border-transparent'
  const labelCls = 'block text-sm font-medium text-gray-700 mb-1'

  if (planLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-[#1D9E75] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (atLimit) {
    return (
      <div className="p-6 md:p-8 max-w-xl">
        <UpgradeModal open={showUpgrade} onClose={() => setShow(false)} feature="Adicione clientes ilimitados no plano Pro" />
        <div className="bg-white border border-gray-100 rounded-2xl p-8 shadow-sm text-center">
          <div className="w-14 h-14 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Limite de clientes atingido</h2>
          <p className="text-sm text-gray-500 mb-6">
            O plano Free permite até <strong>5 clientes</strong>. Faça upgrade para adicionar ilimitados.
          </p>
          <button
            onClick={() => setShow(true)}
            className="block w-full py-3 bg-[#1D9E75] text-white text-sm font-semibold rounded-xl hover:bg-[#188f68] transition-colors text-center mb-3"
          >
            Fazer upgrade para Pro
          </button>
          <Link href="/clientes" className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
            Voltar para clientes
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 md:p-8 max-w-xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <Link href="/clientes" className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-100">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Novo Cliente</h1>
          <p className="text-sm text-gray-500 mt-0.5">Preencha os dados de contato</p>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{error}</div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm space-y-4 mb-6">
          <div>
            <label className={labelCls}>Nome <span className="text-red-500">*</span></label>
            <input
              type="text"
              required
              value={form.name}
              onChange={e => set('name', e.target.value)}
              placeholder="Nome completo ou razão social"
              className={inputCls}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Email</label>
              <input
                type="email"
                value={form.email}
                onChange={e => set('email', e.target.value)}
                placeholder="email@cliente.com"
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Telefone</label>
              <input
                type="tel"
                value={form.phone}
                onChange={e => set('phone', maskPhone(e.target.value))}
                placeholder="(11) 99999-9999"
                className={inputCls}
              />
            </div>
          </div>

          <div>
            <label className={labelCls}>Notas</label>
            <textarea
              value={form.notes}
              onChange={e => set('notes', e.target.value)}
              rows={3}
              placeholder="Observações sobre o cliente, preferências, contexto..."
              className={inputCls + ' resize-none'}
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3">
          <Link href="/clientes" className="px-4 py-2.5 text-sm font-medium text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2.5 bg-[#1D9E75] text-white text-sm font-medium rounded-lg hover:bg-[#188f68] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Criando...' : 'Criar Cliente'}
          </button>
        </div>
      </form>
    </div>
  )
}
