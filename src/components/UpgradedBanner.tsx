'use client'

import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'next/navigation'

export default function UpgradedBanner() {
  const searchParams = useSearchParams()
  const [show, setShow]       = useState(false)
  const [confirmed, setConf]  = useState(false)
  const pollRef               = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (searchParams.get('upgraded') !== 'true') return

    setShow(true)

    // Aguarda o webhook do Stripe atualizar o banco e faz reload quando confirmar
    let attempts = 0
    const MAX = 20 // 40 s máximo

    pollRef.current = setInterval(async () => {
      attempts++
      try {
        const res  = await fetch('/api/subscriptions', { cache: 'no-store' })
        const data = await res.json()

        if (data.plan === 'pro' && (data.status === 'active' || data.status === 'trialing')) {
          clearInterval(pollRef.current!)
          setConf(true)
          // Reload completo para sidebar e aba Plano refletirem o novo estado
          setTimeout(() => {
            window.location.replace('/dashboard')
          }, 1500)
          return
        }
      } catch { /* ignora erros de rede */ }

      if (attempts >= MAX) clearInterval(pollRef.current!)
    }, 2000)

    return () => { if (pollRef.current) clearInterval(pollRef.current) }
  }, [searchParams])

  if (!show) return null

  return (
    <div className="mb-6 flex items-center justify-between gap-4 px-5 py-4 bg-emerald-50 border border-emerald-200 rounded-xl">
      <div className="flex items-center gap-3">
        {confirmed ? (
          <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        ) : (
          <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 shrink-0">
            <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        <div>
          <p className="text-sm font-semibold text-emerald-900">
            {confirmed ? 'Plano Pro ativado com sucesso!' : 'Pagamento confirmado — ativando plano Pro…'}
          </p>
          <p className="text-xs text-emerald-700 mt-0.5">
            {confirmed
              ? 'Recarregando a página com seu novo plano…'
              : 'Aguarde, isso leva alguns segundos.'}
          </p>
        </div>
      </div>
    </div>
  )
}
