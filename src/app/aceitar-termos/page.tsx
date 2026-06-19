'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase-browser'

export default function AceitarTermosPage() {
  const router = useRouter()
  const [accepted, setAccepted] = useState(false)
  const [showError, setShowError] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    async function checkAlreadyAccepted() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.replace('/login'); return }

      const { data: profile } = await supabase
        .from('profiles')
        .select('terms_accepted_at')
        .eq('id', user.id)
        .maybeSingle()

      if (profile?.terms_accepted_at) router.replace('/dashboard')
    }
    checkAlreadyAccepted()
  }, [router])

  async function handleAccept() {
    if (!accepted) { setShowError(true); return }
    setShowError(false)
    setLoading(true)

    const res = await fetch('/api/auth/accept-terms', { method: 'POST' })
    if (res.ok) {
      router.push('/dashboard')
    } else {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <span className="text-2xl font-bold text-[#1D9E75]">FreelanceFlow</span>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <div className="mb-6">
            <h1 className="text-xl font-bold text-gray-900">Antes de continuar</h1>
            <p className="text-sm text-gray-500 mt-1">
              Para usar o FreelanceFlow, você precisa aceitar nossa Política de Privacidade.
            </p>
          </div>

          <div className="mb-6 p-4 bg-gray-50 rounded-lg text-sm text-gray-600 leading-relaxed">
            <p>
              Coletamos seus dados para criar e gerenciar propostas, enviar notificações e processar
              pagamentos. Seus dados são protegidos conforme a{' '}
              <strong>Lei Geral de Proteção de Dados (LGPD)</strong>.
            </p>
            <Link
              href="/privacidade"
              target="_blank"
              className="inline-block mt-2 text-[#1D9E75] hover:underline font-medium"
            >
              Ler a Política de Privacidade completa →
            </Link>
          </div>

          <label className="flex items-start gap-2 cursor-pointer mb-1">
            <input
              type="checkbox"
              checked={accepted}
              onChange={(e) => { setAccepted(e.target.checked); setShowError(false) }}
              className="mt-0.5 h-3 w-3 rounded border-gray-300 accent-[#1D9E75] shrink-0 cursor-pointer"
            />
            <span className="text-xs text-gray-500 leading-snug">
              Li e aceito a{' '}
              <Link href="/privacidade" target="_blank" className="text-[#1D9E75] hover:underline">
                Política de Privacidade
              </Link>
              {' '}e concordo com o tratamento dos meus dados conforme a LGPD.
            </span>
          </label>

          {showError && (
            <p className="text-[10px] text-red-500 mb-3">
              Leia e aceite a Política de Privacidade para continuar.
            </p>
          )}

          <button
            onClick={handleAccept}
            disabled={loading}
            className="w-full mt-4 py-2.5 px-4 bg-[#1D9E75] text-white rounded-lg text-sm font-medium hover:bg-[#188f68] active:bg-[#147a59] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading && (
              <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            )}
            {loading ? 'Salvando...' : 'Aceitar e continuar'}
          </button>
        </div>
      </div>
    </div>
  )
}
