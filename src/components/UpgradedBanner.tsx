'use client'

import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'next/navigation'

type State = 'syncing' | 'confirmed' | 'timeout'

export default function UpgradedBanner() {
  const searchParams        = useSearchParams()
  const [show, setShow]     = useState(false)
  const [state, setState]   = useState<State>('syncing')
  const attemptRef          = useRef(0)
  const timerRef            = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (searchParams.get('upgraded') !== 'true') return

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setShow(true)

    async function trySync() {
      attemptRef.current += 1
      try {
        const res  = await fetch('/api/subscriptions/sync', { method: 'POST', cache: 'no-store' })
        const data = await res.json()
        if (data.plan === 'pro') {
          setState('confirmed')
          timerRef.current = setTimeout(() => { window.location.replace('/dashboard') }, 2000)
          return
        }
      } catch { /* rede — tenta de novo */ }
      if (attemptRef.current < 10) {
        timerRef.current = setTimeout(trySync, 3000)
      } else {
        setState('timeout')
      }
    }

    trySync()
  }, [searchParams])

  useEffect(() => {
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [])

  if (!show) return null

  return (
    <div className={`mb-6 flex items-center justify-between gap-4 px-5 py-4 rounded-xl border ${
      state === 'confirmed' ? 'bg-emerald-50 border-emerald-200'
      : state === 'timeout' ? 'bg-amber-50 border-amber-200'
      : 'bg-blue-50 border-blue-200'
    }`}>
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0">
          {state === 'confirmed' ? (
            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          ) : state === 'timeout' ? (
            <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M12 2a10 10 0 100 20A10 10 0 0012 2z" />
              </svg>
            </div>
          ) : (
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
              <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>
        <div>
          <p className={`text-sm font-semibold ${
            state === 'confirmed' ? 'text-emerald-900'
            : state === 'timeout' ? 'text-amber-900'
            : 'text-blue-900'
          }`}>
            {state === 'confirmed' ? 'Plano Pro ativado com sucesso!'
            : state === 'timeout' ? 'Pagamento recebido — ativação em processamento'
            : 'Confirmando pagamento…'}
          </p>
          <p className={`text-xs mt-0.5 ${
            state === 'confirmed' ? 'text-emerald-700'
            : state === 'timeout' ? 'text-amber-700'
            : 'text-blue-700'
          }`}>
            {state === 'confirmed' ? 'Recarregando com seu novo plano…'
            : state === 'timeout' ? 'Acesse Configurações → Plano e clique em "Verificar plano".'
            : 'Consultando o Stripe, aguarde…'}
          </p>
        </div>
      </div>
    </div>
  )
}
