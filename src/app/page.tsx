'use client'

import { useState } from 'react'
import Link from 'next/link'

/* ─── Icons ─── */
function IconFileText() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  )
}
function IconMail() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  )
}
function IconEye() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}
function IconBell() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  )
}
function IconUsers() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  )
}
function IconGrid() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
    </svg>
  )
}
function IconMenu() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  )
}
function IconClose() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}
function Check({ ok }: { ok: boolean }) {
  return ok ? (
    <svg className="w-5 h-5 text-[#1D9E75] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  ) : (
    <svg className="w-5 h-5 text-gray-300 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  )
}

/* ─── Page ─── */
export default function LandingPage() {
  const [mobileOpen, setMobileOpen] = useState(false)

  function scrollTo(id: string) {
    setMobileOpen(false)
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen bg-white text-gray-900">

      {/* ━━━ NAVBAR ━━━ */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <span className="text-xl font-bold text-[#1D9E75] select-none">FreelanceFlow</span>

          {/* Desktop links */}
          <nav className="hidden md:flex items-center gap-8">
            {[
              { label: 'Como funciona', id: 'como-funciona' },
              { label: 'Funcionalidades', id: 'funcionalidades' },
              { label: 'Planos', id: 'planos' },
            ].map(({ label, id }) => (
              <button
                key={id}
                onClick={() => scrollTo(id)}
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
              >
                {label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="hidden sm:inline-flex items-center px-4 py-2 text-gray-600 text-sm font-medium hover:text-gray-900 transition-colors"
            >
              Já tenho conta
            </Link>
            <Link
              href="/cadastro"
              className="hidden sm:inline-flex items-center px-4 py-2 bg-[#1D9E75] text-white text-sm font-medium rounded-lg hover:bg-[#188f68] transition-colors"
            >
              Começar grátis
            </Link>
            <button
              onClick={() => setMobileOpen(o => !o)}
              className="md:hidden p-2 text-gray-600 hover:text-gray-900"
              aria-label="Abrir menu"
            >
              {mobileOpen ? <IconClose /> : <IconMenu />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-gray-100 bg-white px-4 py-4 flex flex-col gap-1">
            {[
              { label: 'Como funciona', id: 'como-funciona' },
              { label: 'Funcionalidades', id: 'funcionalidades' },
              { label: 'Planos', id: 'planos' },
            ].map(({ label, id }) => (
              <button
                key={id}
                onClick={() => scrollTo(id)}
                className="text-sm text-gray-700 text-left px-2 py-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {label}
              </button>
            ))}
            <Link
              href="/login"
              onClick={() => setMobileOpen(false)}
              className="inline-flex justify-center items-center px-4 py-2.5 border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              Já tenho conta
            </Link>
            <Link
              href="/cadastro"
              onClick={() => setMobileOpen(false)}
              className="inline-flex justify-center items-center px-4 py-2.5 bg-[#1D9E75] text-white text-sm font-medium rounded-lg hover:bg-[#188f68] transition-colors"
            >
              Começar grátis
            </Link>
          </div>
        )}
      </header>

      {/* ━━━ HERO ━━━ */}
      <section className="pt-32 pb-24 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto text-center">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-[#1D9E75]/10 text-[#1D9E75] mb-6">
            Para freelancers brasileiros
          </span>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 leading-tight tracking-tight mb-6">
            Feche mais trabalhos com{' '}
            <span className="text-[#1D9E75]">propostas profissionais</span>
          </h1>
          <p className="text-lg text-gray-500 leading-relaxed mb-8 max-w-2xl mx-auto">
            Crie, envie e acompanhe suas propostas em minutos. Saiba quando o cliente abriu, receba aprovações por e-mail e nunca perca um follow-up.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/cadastro"
              className="w-full sm:w-auto inline-flex justify-center items-center px-6 py-3 bg-[#1D9E75] text-white font-medium rounded-lg hover:bg-[#188f68] active:bg-[#147a59] transition-colors text-sm"
            >
              Começar grátis — sem cartão
            </Link>
            <button
              onClick={() => scrollTo('funcionalidades')}
              className="w-full sm:w-auto inline-flex justify-center items-center px-6 py-3 border border-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors text-sm cursor-pointer"
            >
              Ver demonstração
            </button>
          </div>
          <p className="mt-5 text-sm text-gray-400">
            Grátis para sempre · 5 propostas/mês no plano Free
          </p>
        </div>
      </section>

      {/* ━━━ COMO FUNCIONA ━━━ */}
      <section id="como-funciona" className="py-20 px-4 sm:px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <span className="text-xs font-semibold uppercase tracking-widest text-[#1D9E75] mb-3 block">
              Como funciona
            </span>
            <h2 className="text-3xl font-bold text-gray-900">
              Do orçamento ao fechamento em 3 passos
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                num: '1',
                title: 'Crie sua proposta',
                desc: 'Monte propostas profissionais com editor por seções, PDF gerado automaticamente e sua identidade visual.',
              },
              {
                num: '2',
                title: 'Envie por e-mail',
                desc: 'O cliente recebe um e-mail com a proposta em anexo e botões para aprovar ou recusar com um clique.',
              },
              {
                num: '3',
                title: 'Acompanhe em tempo real',
                desc: 'Saiba quando o cliente abriu, quando respondeu e receba alertas automáticos para nunca perder o timing.',
              },
            ].map(step => (
              <div
                key={step.num}
                className="flex flex-col items-center text-center bg-[#F4F5F7] rounded-2xl p-8 border border-gray-100"
              >
                <div className="w-10 h-10 rounded-full bg-[#1D9E75] text-white text-sm font-bold flex items-center justify-center mb-5 shrink-0">
                  {step.num}
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-3">{step.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ━━━ FUNCIONALIDADES ━━━ */}
      <section id="funcionalidades" className="py-20 px-4 sm:px-6 bg-[#F4F5F7]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <span className="text-xs font-semibold uppercase tracking-widest text-[#1D9E75] mb-3 block">
              Funcionalidades
            </span>
            <h2 className="text-3xl font-bold text-gray-900">
              Tudo que você precisa para vender mais
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              {
                icon: <IconFileText />,
                title: 'Propostas profissionais',
                desc: 'Editor por seções, PDF automático com sua logo, cor e dados da empresa.',
              },
              {
                icon: <IconMail />,
                title: 'Envio por e-mail',
                desc: 'Cliente aprova ou recusa direto pelo e-mail, sem precisar criar conta.',
              },
              {
                icon: <IconEye />,
                title: 'Rastreamento',
                desc: 'Saiba exatamente quando o cliente abriu a proposta e quantas vezes.',
              },
              {
                icon: <IconBell />,
                title: 'Follow-ups automáticos',
                desc: 'Alertas automáticos quando uma proposta fica sem resposta por muito tempo.',
              },
              {
                icon: <IconUsers />,
                title: 'CRM de clientes',
                desc: 'Histórico completo de propostas, valor total e contatos de cada cliente.',
              },
              {
                icon: <IconGrid />,
                title: 'Modelos prontos',
                desc: 'Templates profissionais por tipo de serviço para criar propostas mais rápido.',
              },
            ].map(feat => (
              <div
                key={feat.title}
                className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="w-10 h-10 rounded-lg bg-[#1D9E75]/10 flex items-center justify-center text-[#1D9E75] mb-4">
                  {feat.icon}
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-2">{feat.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ━━━ PLANOS ━━━ */}
      <section id="planos" className="py-20 px-4 sm:px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <span className="text-xs font-semibold uppercase tracking-widest text-[#1D9E75] mb-3 block">
              Planos
            </span>
            <h2 className="text-3xl font-bold text-gray-900">
              Comece grátis, cresça quando precisar
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {/* FREE */}
            <div className="rounded-2xl border border-gray-200 p-8">
              <h3 className="text-lg font-bold text-gray-900">Free</h3>
              <p className="text-sm text-gray-500 mt-1">Para começar a testar</p>
              <div className="mt-4 flex items-baseline gap-1 mb-6">
                <span className="text-3xl font-bold text-gray-900">R$0</span>
                <span className="text-sm text-gray-400">/mês</span>
              </div>
              <Link
                href="/cadastro"
                className="block w-full text-center py-2.5 px-4 border border-[#1D9E75] text-[#1D9E75] rounded-lg text-sm font-medium hover:bg-[#1D9E75]/5 transition-colors mb-6"
              >
                Criar conta grátis
              </Link>
              <ul className="space-y-3">
                {[
                  { t: '5 propostas por mês', ok: true },
                  { t: 'PDF com marca FreelanceFlow', ok: true },
                  { t: 'Envio por e-mail', ok: true },
                  { t: '5 clientes', ok: true },
                  { t: 'Rastreamento de visualização', ok: false },
                  { t: 'Follow-ups automáticos', ok: false },
                  { t: 'Modelos de proposta', ok: false },
                ].map(item => (
                  <li key={item.t} className="flex items-center gap-3">
                    <Check ok={item.ok} />
                    <span className={`text-sm ${item.ok ? 'text-gray-700' : 'text-gray-400'}`}>{item.t}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* PRO */}
            <div className="rounded-2xl border-2 border-[#1D9E75] p-8 relative">
              <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 inline-flex px-3 py-1 bg-[#1D9E75] text-white text-xs font-semibold rounded-full whitespace-nowrap">
                Mais popular
              </span>
              <h3 className="text-lg font-bold text-gray-900">Pro</h3>
              <p className="text-sm text-gray-500 mt-1">Para fechar mais trabalhos</p>
              <div className="mt-4 flex items-baseline gap-1 mb-6">
                <span className="text-3xl font-bold text-gray-900">R$39</span>
                <span className="text-sm text-gray-400">/mês</span>
              </div>
              <Link
                href="/cadastro"
                className="block w-full text-center py-2.5 px-4 bg-[#1D9E75] text-white rounded-lg text-sm font-medium hover:bg-[#188f68] transition-colors mb-6"
              >
                Assinar Pro
              </Link>
              <ul className="space-y-3">
                {[
                  { t: 'Propostas ilimitadas', ok: true },
                  { t: 'PDF sem marca', ok: true },
                  { t: 'Envio por e-mail', ok: true },
                  { t: 'Clientes ilimitados', ok: true },
                  { t: 'Rastreamento de visualização', ok: true },
                  { t: 'Follow-ups automáticos', ok: true },
                  { t: 'Modelos de proposta', ok: true },
                ].map(item => (
                  <li key={item.t} className="flex items-center gap-3">
                    <Check ok={item.ok} />
                    <span className="text-sm text-gray-700">{item.t}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ━━━ CTA FINAL ━━━ */}
      <section className="py-24 px-4 sm:px-6 bg-[#1D9E75]">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Comece a fechar mais trabalhos hoje
          </h2>
          <p className="text-white/80 text-base mb-8">
            Crie sua conta grátis em menos de 2 minutos. Sem cartão de crédito.
          </p>
          <Link
            href="/cadastro"
            className="inline-flex items-center px-8 py-3.5 bg-white text-[#1D9E75] font-semibold rounded-lg hover:bg-gray-50 transition-colors text-sm"
          >
            Criar conta grátis
          </Link>
        </div>
      </section>

      {/* ━━━ FOOTER ━━━ */}
      <footer className="py-8 px-4 sm:px-6 bg-white border-t border-gray-100">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="text-base font-bold text-[#1D9E75]">FreelanceFlow</span>
          <span className="text-sm text-gray-400">© 2026 FreelanceFlow · Para freelancers brasileiros</span>
        </div>
      </footer>

    </div>
  )
}
