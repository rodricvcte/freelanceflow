'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import UpgradeModal from '@/components/UpgradeModal'
import { TEMPLATES } from '@/lib/templates-seed'

type ApiTemplate = {
  id: string
  title: string
  template_nicho: string
  template_icon: string
  sections: unknown[]
  service_description: string | null
  value: number | null
  payment_terms: string | null
  deadline_days: number | null
  valid_until: string | null
}

export default function ModelosPage() {
  const router = useRouter()

  const [isPro,        setIsPro]        = useState(true)
  const [loading,      setLoading]      = useState(true)
  const [showUpgrade,  setShowUpgrade]  = useState(false)
  const [using,        setUsing]        = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/subscriptions')
      .then(r => r.json())
      .then(sub => {
        setIsPro(sub.plan === 'pro' && (sub.status === 'active' || sub.status === 'trialing'))
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  async function handleUseTemplate(nicho: string) {
    if (!isPro) { setShowUpgrade(true); return }
    setUsing(nicho)
    try {
      const res = await fetch('/api/templates')
      const templates: ApiTemplate[] = await res.json()
      const tmpl = templates.find(t => t.template_nicho === nicho)
      if (!tmpl) return

      sessionStorage.setItem('ff_duplicate_draft', JSON.stringify({
        title:               tmpl.title,
        service_description: tmpl.service_description,
        value:               tmpl.value,
        payment_terms:       tmpl.payment_terms,
        deadline_days:       tmpl.deadline_days,
        valid_until:         tmpl.valid_until,
        client_id:           null,
        sections:            tmpl.sections,
      }))
      router.push('/propostas/new?mode=duplicate')
    } catch {
      setUsing(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-[#1D9E75] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="p-6 md:p-8 max-w-4xl">
      <UpgradeModal
        open={showUpgrade}
        onClose={() => setShowUpgrade(false)}
        feature="Os modelos prontos são exclusivos do plano Pro."
      />

      <div className="mb-6 flex items-center gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Modelos</h1>
          <p className="text-sm text-gray-500 mt-0.5">Crie propostas com agilidade a partir de estruturas prontas</p>
        </div>
        {!isPro && (
          <span className="ml-auto px-2.5 py-1 text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 rounded-full">
            Apenas Pro
          </span>
        )}
      </div>

      {!isPro && (
        <div className="mb-6 flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
          <span className="text-amber-500 text-lg">🔒</span>
          <p className="text-sm text-amber-800 flex-1">
            Faça upgrade para o plano Pro e use qualquer modelo abaixo para criar propostas em segundos.
          </p>
          <button
            onClick={() => setShowUpgrade(true)}
            className="shrink-0 px-4 py-1.5 bg-[#1D9E75] text-white text-sm font-semibold rounded-lg hover:bg-[#188f68] transition-colors"
          >
            Fazer upgrade
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {TEMPLATES.map(tmpl => (
          <div
            key={tmpl.template_nicho}
            className={`relative bg-white border border-gray-100 rounded-2xl p-6 shadow-sm flex flex-col gap-4 transition-shadow ${isPro ? 'hover:shadow-md' : ''}`}
          >
            {/* Card header */}
            <div className="flex items-center gap-3">
              <span className="text-3xl leading-none">{tmpl.template_icon}</span>
              <h2 className="text-sm font-bold text-gray-900 leading-snug">{tmpl.template_nicho}</h2>
            </div>

            {/* Preview bullets */}
            <ul className="space-y-1.5 flex-1">
              {tmpl.preview_bullets.map(bullet => (
                <li key={bullet} className="flex items-start gap-2 text-xs text-gray-600">
                  <span className="mt-0.5 text-[#1D9E75] shrink-0">✓</span>
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>

            {/* Action button */}
            <button
              onClick={() => handleUseTemplate(tmpl.template_nicho)}
              disabled={using === tmpl.template_nicho}
              className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                isPro
                  ? 'bg-[#1D9E75] text-white hover:bg-[#188f68] disabled:opacity-60'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              {using === tmpl.template_nicho
                ? 'Carregando...'
                : isPro
                  ? 'Usar este modelo'
                  : '🔒 Apenas Pro'}
            </button>

            {/* Lock overlay for free users */}
            {!isPro && (
              <div
                className="absolute inset-0 rounded-2xl bg-white/60 backdrop-blur-[1px] cursor-pointer"
                onClick={() => setShowUpgrade(true)}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
