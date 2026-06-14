'use client'

import { useState, type FormEvent } from 'react'

type Status = 'idle' | 'loading' | 'success' | 'duplicate' | 'error'

const benefits = [
  'Propostas ilimitadas',
  'Rastreamento de abertura em tempo real',
  'Follow-up automático para o cliente',
  'Sem marca d\'água nas propostas',
  'Grátis para sempre',
]

function CheckIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4 flex-shrink-0 mt-0.5">
      <circle cx="10" cy="10" r="10" fill="rgba(255,255,255,0.2)" />
      <path d="M6 10l3 3 5-5" stroke="#ffffff" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

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
    <div className="flex flex-col md:flex-row md:h-screen md:overflow-hidden">

      {/* ════════════════════════════════
          COLUNA ESQUERDA — verde
      ════════════════════════════════ */}
      <div
        className="flex flex-col px-8 py-10 md:w-[480px] md:flex-shrink-0 md:h-full md:overflow-auto"
        style={{ backgroundColor: '#1D9E75' }}
      >
        {/* Logo */}
        <div className="flex items-center gap-2.5 mb-12">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/favicon.svg" width={28} height={28} alt="FreelanceFlow" />
          <span className="font-semibold text-white text-base">FreelanceFlow</span>
        </div>

        {/* Conteúdo principal da coluna esquerda */}
        <div className="flex-1 flex flex-col justify-center">
          {/* Badge */}
          <span
            className="self-start text-xs font-semibold px-3 py-1 rounded-full mb-6 tracking-wide"
            style={{ backgroundColor: '#F59E0B', color: '#1a0a00' }}
          >
            Oferta exclusiva de fundador
          </span>

          {/* Título */}
          <h1 className="text-3xl sm:text-4xl font-bold text-white leading-tight mb-4">
            Plano Pro<br />grátis para<br />sempre
          </h1>

          {/* Subtítulo */}
          <p className="text-base mb-10 leading-relaxed" style={{ color: 'rgba(255,255,255,0.8)' }}>
            Apenas 10 vagas para os<br className="hidden sm:block" />
            primeiros freelancers
          </p>

          {/* Benefícios */}
          <ul className="flex flex-col gap-3.5">
            {benefits.map((b) => (
              <li key={b} className="flex items-start gap-3">
                <CheckIcon />
                <span className="text-sm text-white leading-snug">{b}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Rodapé da coluna */}
        <p className="mt-10 text-xs" style={{ color: 'rgba(255,255,255,0.45)' }}>
          FreelanceFlow · freelanceflow.com.br
        </p>
      </div>

      {/* ════════════════════════════════
          COLUNA DIREITA — branca
      ════════════════════════════════ */}
      <div className="flex-1 bg-white flex items-center justify-center px-8 py-12 md:h-full">
        <div className="w-full max-w-sm">

          {status === 'success' ? (
            /* ── Confirmação ── */
            <div className="text-center">
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-5"
                style={{ backgroundColor: '#dcfce7' }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="#1D9E75" strokeWidth={2.5} className="w-7 h-7">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Recebemos seu contato!</h2>
              <p className="text-sm text-gray-500 leading-relaxed">
                Em breve você receberá seu cupom de fundador no email cadastrado.
              </p>
            </div>

          ) : status === 'duplicate' ? (
            /* ── Já cadastrado ── */
            <div className="text-center">
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-5"
                style={{ backgroundColor: '#fef9c3' }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth={2.5} className="w-7 h-7">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M12 3a9 9 0 100 18A9 9 0 0012 3z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Você já está na lista!</h2>
              <p className="text-sm text-gray-500">Fique atento ao seu email com os próximos passos.</p>
            </div>

          ) : (
            /* ── Formulário ── */
            <>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Garanta sua vaga</h2>
              <p className="text-sm text-gray-500 mb-8 leading-relaxed">
                Preencha abaixo e entraremos em contato com seu cupom de fundador.
              </p>

              <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                <input
                  type="text"
                  placeholder="Nome completo"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  disabled={loading}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50"
                />
                <input
                  type="email"
                  placeholder="Seu melhor email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50"
                />

                {status === 'error' && (
                  <p className="text-red-600 text-xs text-center">{errMsg}</p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 rounded-xl text-white font-semibold text-sm transition-opacity disabled:opacity-60 mt-1"
                  style={{ backgroundColor: '#1D9E75' }}
                >
                  {loading ? 'Enviando...' : 'Quero minha vaga'}
                </button>

                <p className="text-center text-xs text-gray-400 mt-1">
                  Apenas 10 vagas · Sem spam
                </p>
              </form>
            </>
          )}

        </div>
      </div>

    </div>
  )
}
