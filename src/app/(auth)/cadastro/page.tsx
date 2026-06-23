'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase-browser'
import PasswordInput from '@/components/PasswordInput'

export default function CadastroPage() {
  const router = useRouter()
  const [email,         setEmail]         = useState('')
  const [password,      setPassword]      = useState('')
  const [error,         setError]         = useState<string | null>(null)
  const [loading,       setLoading]       = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  const canSubmit = !loading

  async function handleGoogle() {
    document.cookie = 'ff_terms_accepted=1; max-age=300; path=/; SameSite=Lax'
    setGoogleLoading(true)
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? window.location.origin}/auth/callback` },
    })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const res = await fetch('/api/auth/register', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ email, password, privacyAccepted: true }),
    })
    const json = await res.json()
    if (!res.ok) { setError(json.error ?? 'Erro ao criar conta.'); setLoading(false); return }

    const supabase = createClient()
    const { error: loginError } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)

    if (loginError) { setError(loginError.message); return }
    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <span className="text-2xl font-bold text-[#1D9E75]">FreelanceFlow</span>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">

          {/* 1. Headline */}
          <div className="mb-7 text-center">
            <h1 className="text-lg md:text-2xl font-bold text-gray-900 whitespace-nowrap">Comece grátis, sem cartão</h1>
            <p className="text-sm text-gray-500 mt-2 leading-snug">
              Crie propostas profissionais e saiba quando o cliente abriu.
            </p>
          </div>

          {/* 2. Botão Google em destaque */}
          <button
            type="button"
            onClick={handleGoogle}
            disabled={googleLoading || loading}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-white border-2 border-gray-300 rounded-xl text-sm font-bold text-gray-700 shadow-sm hover:bg-gray-50 hover:border-gray-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mb-5"
          >
            {googleLoading ? (
              <svg className="animate-spin h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="h-5 w-5 shrink-0">
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v8.51h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.14z"/>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
              </svg>
            )}
            {googleLoading ? 'Redirecionando...' : 'Continuar com Google'}
          </button>

          {/* 3. Divisor */}
          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400">ou</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* 4. Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1D9E75] focus:border-transparent transition-shadow"
                placeholder="seu@email.com"
              />
            </div>

            {/* 5. Senha (sem confirmar) */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Senha
              </label>
              <PasswordInput
                id="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                minLength={8}
                autoComplete="new-password"
                placeholder="Mínimo 8 caracteres"
              />
            </div>

            {/* 6. Botão criar conta */}
            <button
              type="submit"
              disabled={!canSubmit}
              className="w-full py-3 px-4 bg-[#1D9E75] text-white rounded-xl text-sm font-bold hover:bg-[#188f68] active:bg-[#147a59] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading && (
                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              )}
              {loading ? 'Criando conta...' : 'Criar conta grátis'}
            </button>
          </form>

          {/* 7. LGPD sem checkbox */}
          <p className="mt-3 text-xs text-gray-400 text-center leading-snug">
            Ao criar sua conta você concorda com nossa{' '}
            <Link href="/privacidade" className="underline hover:text-gray-600 transition-colors">
              Política de Privacidade
            </Link>
            .
          </p>

          {/* 8. Link login */}
          <p className="mt-5 text-center text-sm text-gray-500">
            Já tem conta?{' '}
            <Link href="/login" className="text-[#1D9E75] font-medium hover:underline">
              Entrar
            </Link>
          </p>

        </div>
      </div>
    </div>
  )
}
