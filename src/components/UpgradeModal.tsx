'use client'

import { useState } from 'react'

const BENEFITS = [
  'Propostas ilimitadas',
  'Clientes ilimitados',
  'PDF sem marca d\'água',
]

type Props = {
  open: boolean
  onClose: () => void
  feature?: string
}

export default function UpgradeModal({ open, onClose }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState<string | null>(null)

  if (!open) return null

  async function handleCheckout() {
    setLoading(true)
    setError(null)
    try {
      const res  = await fetch('/api/subscriptions/checkout', { method: 'POST' })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) { setError((data as {error?: string}).error ?? `Erro ${res.status}`); return }
      if ((data as {url?: string}).url) window.location.href = (data as {url: string}).url
    } catch {
      setError('Erro de conexão. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 px-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-7"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-full bg-[#1D9E75]/10 flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#1D9E75]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h2 className="text-lg font-bold text-gray-900">Assine o plano Pro</h2>
          <p className="text-sm text-gray-500 mt-1">Desbloqueie todo o potencial do FreelanceFlow</p>
        </div>

        {/* Benefits */}
        <ul className="space-y-2.5 mb-6">
          {BENEFITS.map(b => (
            <li key={b} className="flex items-center gap-2.5 text-sm text-gray-700">
              <span className="w-5 h-5 rounded-full bg-[#1D9E75]/10 flex items-center justify-center shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-[#1D9E75]" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </span>
              {b}
            </li>
          ))}
        </ul>

        {/* Price */}
        <div className="text-center mb-5">
          <span className="text-3xl font-bold text-gray-900">R$19</span>
          <span className="text-sm text-gray-400">/mês</span>
        </div>

        {/* Error */}
        {error && (
          <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2 mb-3 text-center">
            {error}
          </p>
        )}

        {/* Buttons */}
        <button
          onClick={handleCheckout}
          disabled={loading}
          className="w-full py-3 bg-[#1D9E75] text-white text-sm font-semibold rounded-xl hover:bg-[#188f68] active:bg-[#147a59] transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {loading && (
            <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          )}
          {loading ? 'Aguarde...' : 'Assinar por R$19/mês'}
        </button>

        <p className="text-xs text-gray-400 text-center mt-2 mb-4">Cancele quando quiser</p>

        <button
          onClick={onClose}
          className="w-full py-2 text-sm text-gray-400 hover:text-gray-600 transition-colors"
        >
          Agora não
        </button>
      </div>
    </div>
  )
}
