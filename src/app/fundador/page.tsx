'use client'

import { useState, type FormEvent } from 'react'

type Status = 'idle' | 'loading' | 'success' | 'duplicate' | 'error'

const benefits: { icon: React.ReactNode; label: string }[] = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5 flex-shrink-0">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    label: 'Propostas ilimitadas',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5 flex-shrink-0">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      </svg>
    ),
    label: 'Rastreamento de abertura',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5 flex-shrink-0">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
    ),
    label: 'Follow-up automático para o cliente',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5 flex-shrink-0">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    label: 'Sem marca d\'água',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5 flex-shrink-0">
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
      </svg>
    ),
    label: 'Grátis para sempre',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5 flex-shrink-0">
        <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
      </svg>
    ),
    label: 'Sem cartão de crédito',
  },
]

export default function FundadorPage() {
  const [name,   setName]   = useState('')
  const [email,  setEmail]  = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [errMsg, setErrMsg] = useState('')

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setStatus('loading')
    setErrMsg('')

    try {
      const res  = await fetch('/api/founder', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ name: name.trim(), email: email.trim() }),
      })
      const data = await res.json()

      if (data.duplicate) { setStatus('duplicate'); return }
      if (data.ok)        { setStatus('success');   return }
      setErrMsg(data.error ?? 'Erro ao salvar. Tente novamente.')
      setStatus('error')
    } catch {
      setErrMsg('Erro de conexão. Tente novamente.')
      setStatus('error')
    }
  }

  const loading = status === 'loading'

  return (
    <div className="min-h-screen flex flex-col bg-white">

      {/* ── Header ── */}
      <header className="px-5 py-5 flex items-center gap-2.5">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm"
          style={{ backgroundColor: '#1D9E75' }}
        >
          FF
        </div>
        <span className="font-semibold text-gray-900 text-base">FreelanceFlow</span>
      </header>

      {/* ── Main ── */}
      <main className="flex-1 flex flex-col items-center px-5 py-10">
        <div className="w-full max-w-lg">

          {/* ── Hero ── */}
          <div className="text-center mb-10">
            <span
              className="inline-block text-xs font-semibold px-3 py-1 rounded-full mb-5 tracking-wide"
              style={{ backgroundColor: '#dcfce7', color: '#15803d' }}
            >
              Oferta exclusiva de fundador
            </span>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 leading-tight mb-4">
              Plano Pro grátis<br />para sempre
            </h1>
            <p className="text-gray-500 text-base leading-relaxed">
              Apenas 10 vagas · Para os primeiros freelancers<br className="hidden sm:block" />
              que embarcarem no FreelanceFlow
            </p>
          </div>

          {/* ── Benefícios ── */}
          <div className="grid grid-cols-2 gap-3 mb-10">
            {benefits.map((b) => (
              <div
                key={b.label}
                className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3"
              >
                <span style={{ color: '#1D9E75' }}>{b.icon}</span>
                <span className="text-sm text-gray-700 font-medium">{b.label}</span>
              </div>
            ))}
          </div>

          {/* ── Formulário ou mensagem de confirmação ── */}
          {status === 'success' ? (
            <div
              className="rounded-2xl p-8 text-center"
              style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0' }}
            >
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ backgroundColor: '#dcfce7' }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="#1D9E75" strokeWidth={2.5} className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="font-semibold text-gray-900 text-lg mb-2">
                Recebemos seu contato!
              </p>
              <p className="text-gray-600 text-sm leading-relaxed">
                Em breve você receberá um email com os próximos passos.
              </p>
            </div>
          ) : status === 'duplicate' ? (
            <div
              className="rounded-2xl p-8 text-center"
              style={{ backgroundColor: '#fffbeb', border: '1px solid #fde68a' }}
            >
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ backgroundColor: '#fef9c3' }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth={2.5} className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M12 3a9 9 0 100 18A9 9 0 0012 3z" />
                </svg>
              </div>
              <p className="font-semibold text-gray-900 text-lg mb-2">
                Voce ja esta na lista!
              </p>
              <p className="text-gray-600 text-sm">
                Fique atento ao seu email com os proximos passos.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <input
                type="text"
                placeholder="Nome completo"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={loading}
                className="w-full border border-gray-200 rounded-xl px-4 py-3.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 disabled:opacity-50"
                style={{ '--tw-ring-color': '#1D9E75' } as React.CSSProperties}
              />
              <input
                type="email"
                placeholder="Seu melhor email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                className="w-full border border-gray-200 rounded-xl px-4 py-3.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 disabled:opacity-50"
                style={{ '--tw-ring-color': '#1D9E75' } as React.CSSProperties}
              />

              {status === 'error' && (
                <p className="text-red-600 text-sm text-center">{errMsg}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-xl text-white font-semibold text-sm transition-opacity disabled:opacity-60 mt-1"
                style={{ backgroundColor: '#1D9E75' }}
              >
                {loading ? 'Enviando...' : 'Quero minha vaga de fundador'}
              </button>

              <p className="text-center text-xs text-gray-400 mt-1">
                Vaga confirmada por email · Sem spam
              </p>
            </form>
          )}

        </div>
      </main>

      {/* ── Footer ── */}
      <footer className="px-5 py-6 text-center text-xs text-gray-400">
        FreelanceFlow · freelanceflow.com.br
      </footer>

    </div>
  )
}
