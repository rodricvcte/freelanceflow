'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase-browser'
import PasswordInput from '@/components/PasswordInput'

export default function RedefinirSenhaPage() {
  const [pronto,   setPronto]   = useState(false)
  const [expirado, setExpirado] = useState(false)
  const [password, setPassword] = useState('')
  const [confirm,  setConfirm]  = useState('')
  const [error,    setError]    = useState<string | null>(null)
  const [loading,  setLoading]  = useState(false)
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient()

    async function processSession() {
      // Caso 1: sessão já existe (ex: refresh de página após setSession)
      const { data: { session } } = await supabase.auth.getSession()
      if (session) { setPronto(true); return }

      // Caso 2: @supabase/ssr não processa o hash automaticamente —
      // lê os tokens diretamente da URL e chama setSession explicitamente
      const params = new URLSearchParams(window.location.hash.slice(1))
      const accessToken  = params.get('access_token')
      const refreshToken = params.get('refresh_token') ?? ''
      const type         = params.get('type')

      if (accessToken && type === 'recovery') {
        const { data, error } = await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken })
        if (data.session && !error) { setPronto(true); return }
      }

      // Sem hash válido e sem sessão → link expirado ou inválido
      setExpirado(true)
    }

    processSession()
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
      const msg = updateError.message.toLowerCase()
      if (msg.includes('same password') || msg.includes('different from') || msg.includes('should be different')) {
        setError('A nova senha não pode ser igual à senha atual.')
      } else {
        setError('Não foi possível redefinir a senha. Tente solicitar um novo link.')
      }
      return
    }

    router.push('/login?reset=1')
  }

  /* Aguardando processamento do hash */
  if (!pronto && !expirado) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <svg className="animate-spin h-6 w-6 text-[#1D9E75]" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    )
  }

  /* Link expirado ou inválido */
  if (expirado) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <span className="text-2xl font-bold text-[#1D9E75]">FreelanceFlow</span>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
              <svg className="h-6 w-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-gray-900 mb-2">Link expirado ou inválido</h1>
            <p className="text-sm text-gray-500 mb-6">
              Este link de recuperação não é mais válido.<br />
              Solicite um novo link para redefinir sua senha.
            </p>
            <Link
              href="/esqueci-senha"
              className="inline-flex items-center px-4 py-2.5 bg-[#1D9E75] text-white text-sm font-medium rounded-lg hover:bg-[#188f68] transition-colors"
            >
              Solicitar novo link
            </Link>
          </div>
        </div>
      </div>
    )
  }

  /* Formulário de nova senha */
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
