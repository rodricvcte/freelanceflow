'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export default function UpgradedBanner() {
  const searchParams = useSearchParams()
  const router       = useRouter()
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (searchParams.get('upgraded') === 'true') {
      setShow(true)
      // Limpa o param da URL sem reload
      const t = setTimeout(() => {
        router.replace('/dashboard', { scroll: false })
      }, 5000)
      return () => clearTimeout(t)
    }
  }, [searchParams, router])

  function dismiss() {
    setShow(false)
    router.replace('/dashboard', { scroll: false })
  }

  if (!show) return null

  return (
    <div className="mb-6 flex items-center justify-between gap-4 px-5 py-4 bg-emerald-50 border border-emerald-200 rounded-xl animate-in fade-in slide-in-from-top-2 duration-300">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div>
          <p className="text-sm font-semibold text-emerald-900">Plano Pro ativado com sucesso!</p>
          <p className="text-xs text-emerald-700 mt-0.5">Você agora tem acesso a propostas ilimitadas e todos os recursos Pro.</p>
        </div>
      </div>
      <button onClick={dismiss} className="text-emerald-400 hover:text-emerald-600 transition-colors shrink-0 p-1">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  )
}
