'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

type Fields = {
  full_name:      string | null
  business_name:  string | null
  phone:          string | null
  address:        string | null
  cpf_cnpj:       string | null
  email_business: string | null
}

function pct(f: Fields): number {
  const vals = [f.full_name, f.business_name, f.phone, f.address, f.cpf_cnpj, f.email_business]
  const filled = vals.filter(v => typeof v === 'string' && v.trim() !== '').length
  return Math.round((filled / 6) * 100)
}

export default function ProfileCompleteBanner({ initialPercent }: { initialPercent: number | null }) {
  const [dismissed, setDismissed] = useState(false)
  const [percent, setPercent]     = useState<number | null>(initialPercent)

  // Atualiza apenas quando o usuário salva o perfil na mesma sessão.
  // Não re-busca em cada navegação — o valor inicial vem do servidor via prop.
  useEffect(() => {
    function refresh() {
      fetch('/api/profile', { cache: 'no-store' })
        .then(r => r.json())
        .then((data: Fields) => setPercent(pct(data)))
        .catch(() => {})
    }
    window.addEventListener('ff:profile-updated', refresh)
    return () => window.removeEventListener('ff:profile-updated', refresh)
  }, [])

  if (dismissed || percent === null || percent >= 100) return null

  return (
    <div
      className="flex items-center gap-2.5 px-4 py-1.5"
      style={{ backgroundColor: '#E8F5F0', borderBottom: '0.5px solid #9FE1CB' }}
    >
      {/* icon */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-4 w-4 shrink-0 text-[#1D9E75]"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.75}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>

      {/* message */}
      <p className="text-[11px] text-gray-500 shrink-0 hidden sm:block">
        Complete seu perfil para criar propostas mais profissionais.
      </p>

      {/* progress bar */}
      <div className="flex items-center gap-1.5 shrink-0">
        <div
          className="w-20 h-1 rounded-full overflow-hidden"
          style={{ backgroundColor: '#D0F0E6' }}
        >
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ backgroundColor: '#1D9E75', width: `${percent}%` }}
          />
        </div>
        <span className="text-[11px] font-medium text-[#1D9E75] tabular-nums">
          {percent}%
        </span>
      </div>

      {/* CTA */}
      <Link
        href="/configuracoes"
        className="text-[11px] font-medium text-[#1D9E75] hover:underline shrink-0"
      >
        Completar →
      </Link>

      {/* dismiss */}
      <button
        onClick={() => setDismissed(true)}
        aria-label="Fechar"
        className="ml-auto shrink-0 p-0.5 rounded text-[#1D9E75] hover:bg-[#9FE1CB]/40 transition-colors"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-3.5 w-3.5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  )
}
