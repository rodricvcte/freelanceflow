'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase-browser'
import PasswordInput from '@/components/PasswordInput'

export default function RedefinirSenhaPage() {
  const [password,     setPassword]     = useState('')
  const [confirm,      setConfirm]      = useState('')
  const [error,        setError]        = useState<string | null>(null)
  const [loading,      setLoading]      = useState(false)
  const [sessionReady, setSessionReady] = useState<boolean | null>(null)
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient()
    let done = false

    function resolve(value: boolean) {
      if (!done) { done = true; setSessionReady(value) }
    }

    // Escuta eventos de auth — cobre PKCE (SIGNED_IN) e hash-based (PASSWORD_RECOVERY)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') resolve(true)
      if (event === 'SIGNED_IN' && session) resolve(true)
      if (event === 'SIGNED_OUT') resolve(false)
    })

    // Verifica sessão já existente (ex: refresh de página após troca)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) resolve(true)
    })

    // Timeout: se o código não foi trocado em 8s, o link é inválido
    const timer = setTimeout(() => resolve(false), 8000)

    return () => { subscription.unsubscribe(); clearTimeout(timer) }
  }, [])

  const passwordMismatch = confirm.length > 0 && password !== confirm
  const canSubmit = !loading && !passwordMismatch && password.length >= 8 && confirm === password

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password !== confirm) { setError('As senhas não coincidem.'); return }
    if (password.length < 8)  { setError('A senha deve ter no mínimo 8 caracteres.'); return }
    setError(null)
    setLoading(true)

    const supabase = createClient()
    const { error: updateError } = await supabase.auth.updateUser({ password })
    setLoading(false)

    if (updateError) {
      setError('Não foi possível redefinir a senha. O link pode ter expirado.')
      return
    }

    router.push('/login?reset=1')
  }

  /* Loading state while waiting for session detection */
  if (sessionReady === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <svg className="animate-spin h-6 w-6 text-[#1D9E75]" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    )
  }

  /* Invalid or expired link */
  if (!sessionReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <span className="text-2xl font-bold text-[#1D9E75]">FreelanceFlow</span>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <svg className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-gray-900 mb-2">Link inválido ou expirado</h1>
            <p className="text-sm text-gray-500 mb-6">
              Solicite um novo link de recuperação de senha.
            </p>
            <Link href="/esqueci-senha" className="text-sm text-[#1D9E75] font-medium hover:underline">
              Solicitar novo link
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <span className="text-2xl font-bold text-[#1D9E75]">FreelanceFlow</span>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <div className="mb-6">
            <h1 className="text-xl font-bold text-gray-900">Redefinir senha</h1>
            <p className="text-sm text-gray-500 mt-1">Escolha uma nova senha para sua conta.</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Nova senha
              </label>
              <PasswordInput
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                autoComplete="new-password"
                placeholder="Mínimo 8 caracteres"
              />
            </div>

            <div>
              <label htmlFor="confirm" className="block text-sm font-medium text-gray-700 mb-1">
                Confirmar nova senha
              </label>
              <PasswordInput
                id="confirm"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                autoComplete="new-password"
                placeholder="Repita a nova senha"
                className={passwordMismatch ? 'border-red-400 focus:ring-red-400' : ''}
              />
              {passwordMismatch && (
                <p className="mt-1 text-xs text-red-600">As senhas não coincidem.</p>
              )}
            </div>

            <button
              type="submit"
              disabled={!canSubmit}
              className="w-full py-2.5 px-4 bg-[#1D9E75] text-white rounded-lg text-sm font-medium hover:bg-[#188f68] active:bg-[#147a59] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading && (
                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              )}
              {loading ? 'Redefinindo...' : 'Redefinir senha'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
