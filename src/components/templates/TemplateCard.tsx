'use client'

type Props = {
  icon: string
  nicho: string
  previewBullets: string[]
  onUse: () => void
  loading?: boolean
}

export default function TemplateCard({ icon, nicho, previewBullets, onUse, loading }: Props) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm flex flex-col gap-3 h-full">
      <div className="flex items-center gap-2.5">
        <span className="text-2xl leading-none">{icon}</span>
        <h3 className="text-sm font-bold text-gray-900 leading-snug">{nicho}</h3>
      </div>

      <ul className="space-y-1.5 flex-1">
        {previewBullets.map(bullet => (
          <li key={bullet} className="flex items-start gap-2 text-xs text-gray-600">
            <span className="text-[#1D9E75] shrink-0 mt-0.5">✓</span>
            <span>{bullet}</span>
          </li>
        ))}
      </ul>

      <button
        onClick={onUse}
        disabled={!!loading}
        className="w-full py-2.5 rounded-xl text-sm font-semibold transition-colors bg-[#1D9E75] text-white hover:bg-[#188f68] disabled:opacity-60"
      >
        {loading ? 'Carregando...' : 'Usar este modelo'}
      </button>
    </div>
  )
}
