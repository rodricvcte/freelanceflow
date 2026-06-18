'use client'

import { TEMPLATES } from '@/lib/templates-seed'
import TemplateCard from './TemplateCard'
import type { ApiTemplate } from '@/hooks/useTemplates'

type Props = {
  open: boolean
  isPro: boolean
  templates: ApiTemplate[]
  loading: boolean
  loadingNicho: string | null
  onSelect: (template: ApiTemplate) => void
  onSkip: () => void
}

export default function TemplatePickerModal({
  open, isPro, templates, loading, loadingNicho, onSelect, onSkip,
}: Props) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-gray-100 shrink-0">
          <h2 className="text-lg font-bold text-gray-900">Começar com um modelo?</h2>
          <p className="text-sm text-gray-500 mt-0.5">Escolha uma estrutura pronta e personalize</p>
        </div>

        {/* Cards */}
        <div className="p-6 overflow-y-auto flex-1">
          {loading ? (
            <div className="flex justify-center py-10">
              <div className="w-6 h-6 border-2 border-[#1D9E75] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {TEMPLATES.map(tmpl => {
                const apiTmpl = templates.find(t => t.template_nicho === tmpl.template_nicho)
                const isLocked = !isPro

                return (
                  <div key={tmpl.template_nicho} className={isLocked ? 'relative' : ''}>
                    <TemplateCard
                      icon={tmpl.template_icon}
                      nicho={tmpl.template_nicho}
                      previewBullets={tmpl.preview_bullets}
                      locked={isLocked}
                      loading={loadingNicho === tmpl.template_nicho}
                      onUse={() => { if (apiTmpl && isPro) onSelect(apiTmpl) }}
                    />
                    {isLocked && (
                      <div
                        className="absolute inset-0 rounded-2xl bg-white/50 backdrop-blur-[1px] cursor-not-allowed"
                        title="Disponível no plano Pro"
                      />
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 shrink-0 flex items-center justify-between">
          {!isPro && (
            <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-1.5">
              Modelos disponíveis no plano Pro
            </p>
          )}
          <button
            onClick={onSkip}
            className="ml-auto text-sm text-gray-500 hover:text-gray-800 font-medium transition-colors"
          >
            Começar do zero →
          </button>
        </div>
      </div>
    </div>
  )
}
