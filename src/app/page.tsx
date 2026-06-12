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

/* ─── App mockup (SVG dashboard screenshot) ─── */
function AppMockup() {
  const font = 'ui-sans-serif,system-ui,sans-serif'
  return (
    <div className="relative mt-14 max-w-5xl mx-auto">
      <div className="rounded-xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.13)] border border-gray-200">
        <svg viewBox="0 0 1200 700" xmlns="http://www.w3.org/2000/svg" className="w-full block" aria-hidden="true">
          {/* bg */}
          <rect width="1200" height="700" fill="white" />

          {/* ── browser chrome ── */}
          <rect width="1200" height="36" fill="#f3f4f6" />
          <circle cx="16" cy="18" r="5.5" fill="#fc5c65" />
          <circle cx="33" cy="18" r="5.5" fill="#ffce54" />
          <circle cx="50" cy="18" r="5.5" fill="#26de81" />
          <rect x="76" y="10" width="680" height="16" rx="8" fill="#e5e7eb" />
          <text x="416" y="22" textAnchor="middle" fontSize="9" fill="#9ca3af" fontFamily={font}>app.freelanceflow.com.br/propostas</text>

          {/* ── sidebar ── */}
          <rect x="0" y="36" width="200" height="664" fill="#146249" />
          <text x="20" y="72" fontSize="13" fontWeight="700" fill="white" fontFamily={font}>FreelanceFlow</text>
          <rect x="10" y="90"  width="180" height="32" rx="6" fill="white" fillOpacity="0.1" />
          <text x="30" y="111" fontSize="12" fill="white" fillOpacity="0.65" fontFamily={font}>Dashboard</text>
          <rect x="10" y="130" width="180" height="32" rx="6" fill="white" fillOpacity="0.18" />
          <text x="30" y="151" fontSize="12" fontWeight="600" fill="white" fontFamily={font}>Propostas</text>
          <text x="30" y="189" fontSize="12" fill="white" fillOpacity="0.6" fontFamily={font}>Clientes</text>
          <text x="30" y="224" fontSize="12" fill="white" fillOpacity="0.6" fontFamily={font}>Follow-ups</text>

          {/* ── main area ── */}
          <rect x="200" y="36" width="1000" height="664" fill="#f9fafb" />

          {/* top bar */}
          <rect x="200" y="36" width="1000" height="56" fill="white" />
          <line x1="200" y1="92" x2="1200" y2="92" stroke="#f3f4f6" strokeWidth="1" />
          <text x="228" y="71" fontSize="18" fontWeight="700" fill="#111827" fontFamily={font}>Propostas</text>
          <rect x="1054" y="47" width="128" height="32" rx="7" fill="#1D9E75" />
          <text x="1118" y="68" textAnchor="middle" fontSize="11" fontWeight="600" fill="white" fontFamily={font}>+ Nova proposta</text>

          {/* ── metric cards ── */}
          <rect x="228" y="108" width="220" height="76" rx="8" fill="white" stroke="#f3f4f6" strokeWidth="1" />
          <text x="248" y="132" fontSize="11" fill="#6b7280" fontFamily={font}>Total enviadas</text>
          <text x="248" y="163" fontSize="26" fontWeight="700" fill="#111827" fontFamily={font}>12</text>

          <rect x="464" y="108" width="220" height="76" rx="8" fill="white" stroke="#f3f4f6" strokeWidth="1" />
          <text x="484" y="132" fontSize="11" fill="#6b7280" fontFamily={font}>Aprovadas</text>
          <text x="484" y="163" fontSize="26" fontWeight="700" fill="#1D9E75" fontFamily={font}>7</text>

          <rect x="700" y="108" width="220" height="76" rx="8" fill="white" stroke="#f3f4f6" strokeWidth="1" />
          <text x="720" y="132" fontSize="11" fill="#6b7280" fontFamily={font}>Aguardando</text>
          <text x="720" y="163" fontSize="26" fontWeight="700" fill="#d97706" fontFamily={font}>3</text>

          <rect x="936" y="108" width="236" height="76" rx="8" fill="white" stroke="#f3f4f6" strokeWidth="1" />
          <text x="956" y="132" fontSize="11" fill="#6b7280" fontFamily={font}>Receita aprovada</text>
          <text x="956" y="163" fontSize="22" fontWeight="700" fill="#111827" fontFamily={font}>R$ 48.700</text>

          {/* ── proposals table ── */}
          <rect x="228" y="200" width="944" height="464" rx="10" fill="white" />
          <rect x="228" y="200" width="944" height="40" rx="10" fill="#f9fafb" />
          <rect x="228" y="224" width="944" height="16" fill="#f9fafb" />
          <text x="252" y="226" fontSize="10" fontWeight="600" fill="#9ca3af" fontFamily={font}>PROPOSTA</text>
          <text x="640" y="226" fontSize="10" fontWeight="600" fill="#9ca3af" fontFamily={font}>CLIENTE</text>
          <text x="824" y="226" fontSize="10" fontWeight="600" fill="#9ca3af" fontFamily={font}>VALOR</text>
          <text x="984" y="226" fontSize="10" fontWeight="600" fill="#9ca3af" fontFamily={font}>STATUS</text>

          {/* row 1 */}
          <line x1="228" y1="240" x2="1172" y2="240" stroke="#f3f4f6" strokeWidth="1" />
          <text x="252" y="267" fontSize="13" fontWeight="500" fill="#111827" fontFamily={font}>Website Corporativo — Agência XYZ</text>
          <text x="252" y="285" fontSize="11" fill="#9ca3af" fontFamily={font}>#001 · Visualizada 3x · Aprovada ontem</text>
          <text x="640" y="273" fontSize="13" fill="#374151" fontFamily={font}>Agência XYZ</text>
          <text x="824" y="273" fontSize="13" fontWeight="600" fill="#111827" fontFamily={font}>R$ 8.500</text>
          <rect x="972" y="261" width="72" height="22" rx="11" fill="#dcfce7" />
          <text x="1008" y="276" textAnchor="middle" fontSize="11" fontWeight="600" fill="#16a34a" fontFamily={font}>Aprovado</text>

          {/* row 2 */}
          <line x1="228" y1="304" x2="1172" y2="304" stroke="#f3f4f6" strokeWidth="1" />
          <text x="252" y="331" fontSize="13" fontWeight="500" fill="#111827" fontFamily={font}>App Mobile — Plataforma Fintech</text>
          <text x="252" y="349" fontSize="11" fill="#9ca3af" fontFamily={font}>#002 · Visualizada 1x · Enviada há 2 dias</text>
          <text x="640" y="337" fontSize="13" fill="#374151" fontFamily={font}>Fintech Capital</text>
          <text x="824" y="337" fontSize="13" fontWeight="600" fill="#111827" fontFamily={font}>R$ 15.000</text>
          <rect x="960" y="325" width="88" height="22" rx="11" fill="#fef3c7" />
          <text x="1004" y="340" textAnchor="middle" fontSize="11" fontWeight="600" fill="#d97706" fontFamily={font}>Aguardando</text>

          {/* row 3 */}
          <line x1="228" y1="368" x2="1172" y2="368" stroke="#f3f4f6" strokeWidth="1" />
          <text x="252" y="395" fontSize="13" fontWeight="500" fill="#111827" fontFamily={font}>Sistema ERP — Módulo Financeiro</text>
          <text x="252" y="413" fontSize="11" fill="#9ca3af" fontFamily={font}>#003 · Não visualizada ainda · Enviada hoje</text>
          <text x="640" y="401" fontSize="13" fill="#374151" fontFamily={font}>Indústria ABC</text>
          <text x="824" y="401" fontSize="13" fontWeight="600" fill="#111827" fontFamily={font}>R$ 22.000</text>
          <rect x="975" y="389" width="62" height="22" rx="11" fill="#dbeafe" />
          <text x="1006" y="404" textAnchor="middle" fontSize="11" fontWeight="600" fill="#2563eb" fontFamily={font}>Enviada</text>

          {/* row 4 */}
          <line x1="228" y1="432" x2="1172" y2="432" stroke="#f3f4f6" strokeWidth="1" />
          <text x="252" y="459" fontSize="13" fontWeight="500" fill="#111827" fontFamily={font}>Identidade Visual + Brand Guidelines</text>
          <text x="252" y="477" fontSize="11" fill="#9ca3af" fontFamily={font}>#004 · Rascunho</text>
          <text x="640" y="465" fontSize="13" fill="#374151" fontFamily={font}>Startup Verde</text>
          <text x="824" y="465" fontSize="13" fontWeight="600" fill="#111827" fontFamily={font}>R$ 3.200</text>
          <rect x="974" y="453" width="66" height="22" rx="11" fill="#f3f4f6" />
          <text x="1007" y="468" textAnchor="middle" fontSize="11" fontWeight="600" fill="#6b7280" fontFamily={font}>Rascunho</text>
        </svg>
      </div>
      {/* bottom fade into next section */}
      <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-white to-transparent pointer-events-none" />
    </div>
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
      <section className="pt-32 pb-0 px-4 sm:px-6">
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
        <AppMockup />
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
                <span className="text-3xl font-bold text-gray-900">R$19</span>
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
