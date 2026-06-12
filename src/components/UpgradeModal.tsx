'use client'

import Link from 'next/link'
import { useState } from 'react'

const ROWS = [
  { label: 'Propostas',        free: '5/mês',     pro: 'Ilimitadas' },
  { label: 'Clientes',         free: '5',          pro: 'Ilimitados' },
  { label: 'PDF sem marca',    free: '✗',          pro: '✓' },
  { label: 'Rastreamento',     free: '✗',          pro: '✓' },
  { label: 'Follow-ups',       free: '✗',          pro: '✓' },
  { label: 'Modelos',          free: '✗',          pro: '✓' },
  { label: 'Cor personalizada',free: '✗',          pro: '✓' },
]

type Props = {
  open: boolean
  onClose: () => void
  feature?: string
}

export default function UpgradeModal({ open, onClose, feature }: Props) {
  const [loading, setLoading] = useState(false)

  if (!open) return null

  async function handleCheckout() {
    setLoading(true)
    try {
      const priceId = process.env.NEXT_PUBLIC_STRIPE_PRICE_MONTHLY ?? ''
      const res = await fetch('/api/subscriptions/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ price_id: priceId }),
      })
      const data = await res.json()
      if (res.ok && data.url) window.location.href = data.url
    } catch { /* ignore */ } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 px-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#1D9E75]/10 flex items-center justify-center shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#1D9E75]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">Recurso exclusivo do plano Pro</h2>
              {feature && <p className="text-xs text-gray-500 mt-0.5">{feature}</p>}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-100"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Comparison table */}
        <div className="rounded-xl overflow-hidden border border-gray-100 mb-5">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500">Recurso</th>
                <th className="px-4 py-2.5 text-center text-xs font-semibold text-gray-400 w-20">Free</th>
                <th className="px-4 py-2.5 text-center text-xs font-semibold text-[#1D9E75] w-20">Pro</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {ROWS.map(row => (
                <tr key={row.label}>
                  <td className="px-4 py-2 text-gray-700 text-xs">{row.label}</td>
                  <td className="px-4 py-2 text-center text-xs text-gray-400">{row.free}</td>
                  <td className="px-4 py-2 text-center text-xs font-medium text-[#1D9E75]">{row.pro}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* CTA */}
        <button
          onClick={handleCheckout}
          disabled={loading}
          className="w-full py-3 bg-[#1D9E75] text-white text-sm font-semibold rounded-xl hover:bg-[#188f68] transition-colors disabled:opacity-60 mb-2"
        >
          {loading ? 'Aguarde...' : 'Assinar Pro — R$39/mês'}
        </button>

        <div className="flex gap-3 justify-center">
          <Link
            href="/configuracoes?tab=plano"
            className="text-xs text-[#1D9E75] font-medium hover:underline"
            onClick={onClose}
          >
            Ver planos
          </Link>
          <span className="text-gray-200 text-xs">·</span>
          <button onClick={onClose} className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
            Agora não
          </button>
        </div>
      </div>
    </div>
  )
}
