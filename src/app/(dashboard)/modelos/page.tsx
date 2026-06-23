'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import UpgradeModal from '@/components/UpgradeModal'
import TemplateCard from '@/components/templates/TemplateCard'
import { useTemplates } from '@/hooks/useTemplates'
import { TEMPLATES } from '@/lib/templates-seed'

export default function ModelosPage() {
  const router = useRouter()

  const [isPro,       setIsPro]       = useState(true)
  const [planLoading, setPlanLoading] = useState(true)
  const [showUpgrade, setShowUpgrade] = useState(false)
  const [using,       setUsing]       = useState<string | null>(null)

  const { templates, loading: templatesLoading } = useTemplates()

  useEffect(() => {
    fetch('/api/subscriptions')
      .then(r => r.json())
      .then(sub => {
        setIsPro(sub.plan === 'pro' && (sub.status === 'active' || sub.status === 'trialing'))
        setPlanLoading(false)
      })
      .catch(() => setPlanLoading(false))
  }, [])

  async function handleUseTemplate(nicho: string) {
    if (!isPro) { setShowUpgrade(true); return }
    const tmpl = templates.find(t => t.template_nicho === nicho)
    if (!tmpl) return

    setUsing(nicho)
    try {
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
      router.push(`/propostas/new?template=${tmpl.id}`)
    } catch {
      setUsing(null)
    }
  }

  if (planLoading || templatesLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-[#1D9E75] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="p-4 md:p-8 max-w-4xl">
      <UpgradeModal
        open={showUpgrade}
        onClose={() => setShowUpgrade(false)}
        feature="Os modelos prontos são exclusivos do plano Pro."
      />

      <div className="mb-6 flex items-center gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">Modelos</h1>
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
            className={`relative transition-shadow ${isPro ? 'hover:shadow-md' : ''}`}
          >
            <TemplateCard
              icon={tmpl.template_icon}
              nicho={tmpl.template_nicho}
              previewBullets={tmpl.preview_bullets}
              locked={!isPro}
              loading={using === tmpl.template_nicho}
              onUse={() => handleUseTemplate(tmpl.template_nicho)}
            />
            {!isPro && (
              <div
                className="absolute inset-0 rounded-2xl bg-white/60 backdrop-blur-[1px] cursor-pointer"
                onClick={() => setShowUpgrade(true)}
              />
            )}
          </div>
        ))}
      </div>

      {!isPro && (
        <p className="text-xs text-gray-400 mt-6 text-center">
          <Link href="/configuracoes?tab=plano" className="hover:underline">Ver todos os planos →</Link>
        </p>
      )}
    </div>
  )
}
