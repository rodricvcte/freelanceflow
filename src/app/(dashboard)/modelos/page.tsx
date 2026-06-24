'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import TemplateCard from '@/components/templates/TemplateCard'
import { useTemplates } from '@/hooks/useTemplates'
import { TEMPLATES } from '@/lib/templates-seed'

export default function ModelosPage() {
  const router = useRouter()
  const [using, setUsing] = useState<string | null>(null)
  const { templates, loading: templatesLoading } = useTemplates()

  async function handleUseTemplate(nicho: string) {
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

  if (templatesLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-[#1D9E75] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="p-4 md:p-8 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-xl md:text-2xl font-bold text-gray-900">Modelos</h1>
        <p className="text-sm text-gray-500 mt-0.5">Crie propostas com agilidade a partir de estruturas prontas</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {TEMPLATES.map(tmpl => (
          <div key={tmpl.template_nicho} className="hover:shadow-md transition-shadow">
            <TemplateCard
              icon={tmpl.template_icon}
              nicho={tmpl.template_nicho}
              previewBullets={tmpl.preview_bullets}
              loading={using === tmpl.template_nicho}
              onUse={() => handleUseTemplate(tmpl.template_nicho)}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
