'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import UpgradeModal from '@/components/UpgradeModal'

export default function ModelosPage() {
  const [isPro, setIsPro]         = useState(true)
  const [loading, setLoading]     = useState(true)
  const [showUpgrade, setUpgrade] = useState(false)

  useEffect(() => {
    fetch('/api/subscriptions').then(r => r.json()).then(sub => {
      setIsPro(sub.plan === 'pro' && (sub.status === 'active' || sub.status === 'trialing'))
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-[#1D9E75] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!isPro) {
    return (
      <div className="p-6 md:p-8 max-w-2xl">
        <UpgradeModal open={showUpgrade} onClose={() => setUpgrade(false)} feature="Crie propostas mais rápido com modelos prontos" />
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Modelos</h1>
          <p className="text-sm text-gray-500 mt-0.5">Crie propostas com agilidade</p>
        </div>
        <div className="bg-white border border-gray-100 rounded-2xl p-10 shadow-sm text-center">
          <div className="w-14 h-14 bg-[#1D9E75]/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-[#1D9E75]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Modelos disponíveis no Pro</h2>
          <p className="text-sm text-gray-500 mb-6 max-w-sm mx-auto">
            Salve suas propostas como modelos reutilizáveis e crie novas propostas em segundos com estrutura pré-definida.
          </p>
          <button
            onClick={() => setUpgrade(true)}
            className="px-6 py-3 bg-[#1D9E75] text-white text-sm font-semibold rounded-xl hover:bg-[#188f68] transition-colors"
          >
            Fazer upgrade para Pro
          </button>
          <p className="text-xs text-gray-400 mt-4">
            <Link href="/configuracoes?tab=plano" className="hover:underline">Ver todos os planos →</Link>
          </p>
        </div>
      </div>
    )
  }

  // Pro users: placeholder for future feature
  return (
    <div className="p-6 md:p-8 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Modelos</h1>
        <p className="text-sm text-gray-500 mt-0.5">Em breve: crie propostas a partir de modelos</p>
      </div>
      <div className="bg-white border border-gray-100 rounded-2xl p-10 shadow-sm text-center">
        <p className="text-sm text-gray-500">Funcionalidade em desenvolvimento. Em breve disponível para usuários Pro.</p>
      </div>
    </div>
  )
}
