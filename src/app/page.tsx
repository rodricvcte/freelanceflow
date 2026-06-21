import Link from 'next/link'
import NavHeader from '@/components/NavHeader'
import RevealSection from '@/components/RevealSection'

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

/* ─── App mockup — Dashboard view ─── */
function AppMockup() {
  const f = 'ui-sans-serif,system-ui,sans-serif'

  const C = 364.4
  const donutCx = 798, donutCy = 320, donutR = 58, donutW = 24

  const segments: [string, number][] = [
    ['#1D9E75', 0.80],
    ['#ef4444', 0.12],
    ['#d1d5db', 0.05],
    ['#3b82f6', 0.03],
  ]
  let cumulative = 0
  const donutSegments = segments.map(([color, pct]) => {
    const len = C * pct
    const offset = C * 0.25 - C * cumulative
    cumulative += pct
    return { color, len, offset }
  })

  const barMonths = ['jan','fev','mar','abr','mai','jun']
  const barValues = [4, 7, 11, 16, 22, 37]
  const barMaxH = 100, barMaxV = 40
  const barX0 = 282, barY0 = 412, barW = 26, barGap = 30

  const statuses: [string, string, number][] = [
    ['#6b7280', 'bg-gray-100', 5],
    ['#2563eb', '#dbeafe',    2],
    ['#d97706', '#fef3c7',    3],
    ['#1D9E75', '#dcfce7',    9],
    ['#ef4444', '#fee2e2',    1],
    ['#ea580c', '#ffedd5',   11],
    ['#991b1b', '#fecaca',    6],
  ]
  const statusLabels = ['Rascunho','Enviada','Visualizada','Aceita','Recusada','Expirada','Cancelada']

  return (
    <div className="relative mt-14 max-w-5xl mx-auto">
      <div className="rounded-xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.13)] border border-gray-200">
        <svg viewBox="0 0 1200 700" xmlns="http://www.w3.org/2000/svg" className="w-full block" aria-hidden="true">
          <rect width="1200" height="700" fill="white" />

          <rect width="1200" height="36" fill="#f3f4f6" />
          <circle cx="16" cy="18" r="5.5" fill="#fc5c65" />
          <circle cx="33" cy="18" r="5.5" fill="#ffce54" />
          <circle cx="50" cy="18" r="5.5" fill="#26de81" />
          <rect x="76" y="10" width="680" height="16" rx="8" fill="#e5e7eb" />
          <text x="416" y="22" textAnchor="middle" fontSize="9" fill="#9ca3af" fontFamily={f}>app.freelanceflow.com.br/dashboard</text>

          <rect x="0" y="36" width="200" height="664" fill="white" />
          <rect x="199" y="36" width="1" height="664" fill="#f3f4f6" />

          <text x="20" y="72" fontSize="14" fontWeight="700" fill="#1D9E75" fontFamily={f}>FreelanceFlow</text>

          <rect x="8" y="84" width="184" height="34" rx="6" fill="#f0fdf4" />
          <text x="36" y="106" fontSize="12" fontWeight="600" fill="#1D9E75" fontFamily={f}>Dashboard</text>

          {['Propostas','Clientes','Follow-ups','Modelos','Configurações'].map((label, i) => (
            <text key={label} x="36" y={144 + i * 34} fontSize="12" fill="#6b7280" fontFamily={f}>{label}</text>
          ))}

          <rect x="8" y="634" width="184" height="54" rx="8" fill="#f9fafb" />
          <circle cx="30" cy="661" r="14" fill="#1D9E75" />
          <text x="30" y="665" textAnchor="middle" fontSize="11" fontWeight="700" fill="white" fontFamily={f}>A</text>
          <text x="52" y="655" fontSize="11" fontWeight="600" fill="#111827" fontFamily={f}>Agência Wip</text>
          <rect x="52" y="660" width="94" height="16" rx="8" fill="#1D9E75" />
          <text x="99" y="672" textAnchor="middle" fontSize="8" fontWeight="700" fill="white" fontFamily={f}>FreelanceFlow Pro</text>

          <rect x="200" y="36" width="1000" height="664" fill="#f9fafb" />

          <rect x="200" y="36" width="1000" height="70" fill="white" />
          <line x1="200" y1="106" x2="1200" y2="106" stroke="#f3f4f6" strokeWidth="1" />
          <text x="228" y="62" fontSize="18" fontWeight="700" fill="#111827" fontFamily={f}>Olá, Carlos Alberto!</text>
          <text x="228" y="82" fontSize="10" fill="#9ca3af" fontFamily={f}>Sexta-feira, 19 de junho de 2026</text>
          <rect x="1044" y="48" width="140" height="36" rx="8" fill="#1D9E75" />
          <text x="1114" y="71" textAnchor="middle" fontSize="11" fontWeight="600" fill="white" fontFamily={f}>+ Nova Proposta</text>

          <rect x="220" y="118" width="224" height="80" rx="8" fill="white" stroke="#f3f4f6" strokeWidth="1" />
          <text x="240" y="139" fontSize="10" fill="#6b7280" fontFamily={f}>Valor aprovado</text>
          <text x="240" y="167" fontSize="26" fontWeight="700" fill="#1D9E75" fontFamily={f}>R$ 9.250</text>
          <text x="240" y="185" fontSize="9" fill="#9ca3af" fontFamily={f}>9 aceitas</text>

          <rect x="456" y="118" width="196" height="80" rx="8" fill="white" stroke="#f3f4f6" strokeWidth="1" />
          <text x="476" y="139" fontSize="10" fill="#6b7280" fontFamily={f}>Em aberto</text>
          <text x="476" y="167" fontSize="26" fontWeight="700" fill="#111827" fontFamily={f}>5</text>
          <text x="476" y="185" fontSize="9" fill="#9ca3af" fontFamily={f}>enviadas + visualizadas</text>

          <rect x="664" y="118" width="216" height="80" rx="8" fill="white" stroke="#f3f4f6" strokeWidth="1" />
          <text x="684" y="139" fontSize="10" fill="#6b7280" fontFamily={f}>Taxa de resposta</text>
          <text x="684" y="167" fontSize="26" fontWeight="700" fill="#111827" fontFamily={f}>67%</text>
          <text x="684" y="185" fontSize="9" fill="#9ca3af" fontFamily={f}>propostas respondidas / 30 dias</text>

          <rect x="892" y="118" width="288" height="80" rx="8" fill="white" stroke="#f3f4f6" strokeWidth="1" />
          <text x="912" y="139" fontSize="10" fill="#6b7280" fontFamily={f}>Este mês</text>
          <text x="912" y="167" fontSize="26" fontWeight="700" fill="#111827" fontFamily={f}>37</text>
          <text x="912" y="185" fontSize="9" fill="#9ca3af" fontFamily={f}>plano pro: ilimitado</text>

          <rect x="220" y="212" width="420" height="220" rx="10" fill="white" />
          <text x="240" y="236" fontSize="12" fontWeight="600" fill="#111827" fontFamily={f}>Propostas por mês</text>
          <line x1="272" y1="252" x2="272" y2={barY0} stroke="#f3f4f6" strokeWidth="1" />
          <line x1="272" y1={barY0} x2="618" y2={barY0} stroke="#f3f4f6" strokeWidth="1" />
          {[0,9,18,27,36].map((v,i) => {
            const gy = barY0 - i * (barMaxH / barMaxV) * 10
            return (
              <g key={v}>
                {i > 0 && <line x1="272" y1={gy} x2="618" y2={gy} stroke="#f3f4f6" strokeWidth="1" />}
                <text x="266" y={gy + 3} fontSize="8" textAnchor="end" fill="#9ca3af" fontFamily={f}>{v}</text>
              </g>
            )
          })}
          {barMonths.map((m, i) => {
            const bx = barX0 + i * (barW + barGap)
            const bh = (barValues[i] / barMaxV) * barMaxH
            const by = barY0 - bh
            return (
              <g key={m}>
                {bh > 0 && <rect x={bx} y={by} width={barW} height={bh} rx="3" fill="#1D9E75" />}
                <text x={bx + barW / 2} y={barY0 + 12} fontSize="8" textAnchor="middle" fill="#9ca3af" fontFamily={f}>{m}</text>
              </g>
            )
          })}

          <rect x="652" y="212" width="292" height="220" rx="10" fill="white" />
          <text x="672" y="236" fontSize="12" fontWeight="600" fill="#111827" fontFamily={f}>Valor em negociação</text>
          <circle cx={donutCx} cy={donutCy} r={donutR} fill="none" stroke="#f3f4f6" strokeWidth={donutW} />
          {donutSegments.map((s, i) => (
            <circle
              key={i}
              cx={donutCx} cy={donutCy} r={donutR}
              fill="none"
              stroke={s.color}
              strokeWidth={donutW}
              strokeDasharray={`${s.len} ${C - s.len}`}
              strokeDashoffset={s.offset}
            />
          ))}
          <circle cx={donutCx} cy={donutCy} r={donutR - donutW / 2 - 2} fill="white" />
          {[['#1D9E75','Aceita'],['#3b82f6','Enviada'],['#d1d5db','Rascunho'],['#ef4444','Recusada']].map(([c,l],i) => (
            <g key={l}>
              <circle cx="666" cy={392 + i * 10} r="4" fill={c} />
              <text x="674" y={396 + i * 10} fontSize="9" fill="#6b7280" fontFamily={f}>{l}</text>
            </g>
          ))}

          <rect x="956" y="212" width="224" height="220" rx="10" fill="white" />
          <text x="976" y="236" fontSize="12" fontWeight="600" fill="#111827" fontFamily={f}>Por status</text>
          {statuses.map(([color, bg, count], i) => (
            <g key={statusLabels[i]}>
              <rect x="976" y={248 + i * 26} width="70" height="18" rx="9" fill={bg as string} />
              <text x="1011" y={261 + i * 26} textAnchor="middle" fontSize="9" fontWeight="600" fill={color} fontFamily={f}>{statusLabels[i]}</text>
              <text x="1160" y={261 + i * 26} textAnchor="end" fontSize="11" fontWeight="600" fill="#374151" fontFamily={f}>{count}</text>
            </g>
          ))}

          <rect x="220" y="446" width="516" height="218" rx="10" fill="white" />
          <text x="240" y="470" fontSize="12" fontWeight="600" fill="#111827" fontFamily={f}>Propostas recentes</text>
          <text x="706" y="470" fontSize="11" fill="#1D9E75" textAnchor="end" fontFamily={f}>Ver todas →</text>
          {[
            ['Tráfego Pago — Clínica Estética Bella', 'RC002-20260618-006-v1', 'R$ 2.800,00', 'Visualizada', '#fef3c7', '#d97706'],
            ['Social Media — Restaurante Sabor & Arte', 'RC003-20260618-005-v1', 'R$ 1.500,00', 'Visualizada', '#fef3c7', '#d97706'],
            ['Website Institucional — Studio Arquitetura', 'RC001-20260618-004-v1', 'R$ 8.500,00', 'Aceita', '#dcfce7', '#16a34a'],
          ].map(([title, code, val, status, bg, tc], i) => (
            <g key={i}>
              <line x1="220" y1={488 + i * 58} x2="736" y2={488 + i * 58} stroke="#f9fafb" strokeWidth="1" />
              <text x="240" y={510 + i * 58} fontSize="11" fontWeight="500" fill="#111827" fontFamily={f}>{title}</text>
              <text x="240" y={526 + i * 58} fontSize="9" fill="#9ca3af" fontFamily={f}>{code}</text>
              <text x="620" y={518 + i * 58} fontSize="11" fontWeight="600" fill="#111827" textAnchor="end" fontFamily={f}>{val}</text>
              <rect x="630" y={506 + i * 58} width="76" height="20" rx="10" fill={bg as string} />
              <text x="668" y={520 + i * 58} textAnchor="middle" fontSize="9" fontWeight="600" fill={tc} fontFamily={f}>{status}</text>
            </g>
          ))}

          <rect x="748" y="446" width="432" height="218" rx="10" fill="white" />
          <text x="768" y="470" fontSize="12" fontWeight="600" fill="#111827" fontFamily={f}>Atenção necessária</text>
          <circle cx="1150" cy="465" r="10" fill="#f59e0b" />
          <text x="1150" y="469" textAnchor="middle" fontSize="9" fontWeight="700" fill="white" fontFamily={f}>4</text>
          {[
            ['Landing Page — Suplementos Max', 'Enviada há 5d sem visualização'],
            ['App Mobile — Fintech Pagar Fácil', 'Enviada há 5d sem visualização'],
            ['E-commerce — Moda Feminina Lis', 'Enviada há 4d sem visualização'],
            ['Identidade Visual — EduTech Start', 'Enviada há 3d sem visualização'],
          ].map(([name, desc], i) => (
            <g key={i}>
              <circle cx="775" cy={497 + i * 44} r="4" fill="#f59e0b" />
              <text x="787" y={494 + i * 44} fontSize="11" fontWeight="500" fill="#111827" fontFamily={f}>{name}</text>
              <text x="787" y={509 + i * 44} fontSize="9" fill="#9ca3af" fontFamily={f}>{desc}</text>
            </g>
          ))}
        </svg>
      </div>
      <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-white to-transparent pointer-events-none" />
    </div>
  )
}

/* ─── Structured data (JSON-LD) ─── */
function JsonLd() {
  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'SoftwareApplication',
        '@id': 'https://freelanceflow.com.br/#app',
        name: 'FreelanceFlow',
        url: 'https://freelanceflow.com.br',
        applicationCategory: 'BusinessApplication',
        operatingSystem: 'Web',
        inLanguage: 'pt-BR',
        description: 'Ferramenta para freelancers brasileiros criarem, enviarem e acompanharem propostas comerciais profissionais com rastreamento de abertura e follow-up automático.',
        screenshot: 'https://freelanceflow.com.br/og-image.png',
        featureList: [
          'Criação de propostas comerciais profissionais',
          'PDF automático com identidade visual',
          'Envio por e-mail com botões de aprovação',
          'Envio por WhatsApp com link direto',
          'Rastreamento de abertura da proposta',
          'Follow-up automático',
          'CRM de clientes',
          'Modelos prontos de proposta',
        ],
        audience: {
          '@type': 'Audience',
          audienceType: 'Freelancers',
          geographicArea: { '@type': 'Country', name: 'Brazil' },
        },
        offers: [
          {
            '@type': 'Offer',
            name: 'Free',
            price: '0',
            priceCurrency: 'BRL',
            description: '5 propostas por mês, rastreamento de abertura, follow-up automático e envio por e-mail e WhatsApp.',
          },
          {
            '@type': 'Offer',
            name: 'Pro',
            price: '19',
            priceCurrency: 'BRL',
            description: "Propostas ilimitadas, clientes ilimitados, PDF sem marca d'água, modelos prontos e todos os recursos do plano Free.",
          },
        ],
      },
      {
        '@type': 'Organization',
        '@id': 'https://freelanceflow.com.br/#org',
        name: 'FreelanceFlow',
        url: 'https://freelanceflow.com.br',
        logo: {
          '@type': 'ImageObject',
          url: 'https://freelanceflow.com.br/favicon.svg',
        },
        contactPoint: {
          '@type': 'ContactPoint',
          email: 'contato@freelanceflow.com.br',
          contactType: 'customer support',
          availableLanguage: 'Portuguese',
        },
      },
      {
        '@type': 'WebSite',
        '@id': 'https://freelanceflow.com.br/#website',
        name: 'FreelanceFlow',
        url: 'https://freelanceflow.com.br',
        inLanguage: 'pt-BR',
        publisher: { '@id': 'https://freelanceflow.com.br/#org' },
      },
      {
        '@type': 'FAQPage',
        mainEntity: [
          {
            '@type': 'Question',
            name: 'O FreelanceFlow é gratuito?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Sim. O plano Free é gratuito para sempre e inclui 5 propostas por mês, rastreamento de abertura, follow-up automático e envio por e-mail e WhatsApp.',
            },
          },
          {
            '@type': 'Question',
            name: 'Como o cliente recebe a proposta?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'O cliente pode receber por e-mail com botões para aprovar ou recusar, ou pelo WhatsApp com um link direto para a proposta. Não precisa criar conta.',
            },
          },
          {
            '@type': 'Question',
            name: 'Posso saber se o cliente abriu a proposta?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Sim. O FreelanceFlow rastreia a abertura e mostra exatamente quando e quantas vezes o cliente visualizou a proposta.',
            },
          },
          {
            '@type': 'Question',
            name: 'O que está incluído no plano Pro?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: "O plano Pro custa R$19/mês e inclui propostas ilimitadas, clientes ilimitados, PDF sem marca d'água, modelos prontos de proposta, rastreamento e follow-up automático.",
            },
          },
          {
            '@type': 'Question',
            name: 'Precisa de cartão de crédito para criar conta?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Não. Você cria sua conta gratuitamente e começa a usar sem precisar de cartão de crédito.',
            },
          },
          {
            '@type': 'Question',
            name: 'O FreelanceFlow gera PDF da proposta automaticamente?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: "Sim. O PDF é gerado automaticamente com sua logo, cor e dados da empresa. No plano Free aparece com marca do FreelanceFlow; no plano Pro o PDF é sem marca d'água.",
            },
          },
        ],
      },
    ],
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

/* ─── Page ─── */
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      <JsonLd />

      {/* ━━━ NAVBAR ━━━ */}
      <NavHeader />

      {/* ━━━ HERO ━━━ */}
      <section className="pt-32 pb-0 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto text-center">
          <span style={{ animationDelay: '0ms' }} className="anim-fade-in inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-[#1D9E75]/10 text-[#1D9E75] mb-6">
            Para freelancers e agências brasileiras
          </span>
          <h1 style={{ animationDelay: '80ms' }} className="anim-fade-up text-4xl sm:text-5xl font-bold text-gray-900 leading-tight tracking-tight mb-6">
            Você manda o orçamento. O cliente some.{' '}
            <span className="text-[#1D9E75]">E você fica sem saber o que aconteceu.</span>
          </h1>
          <p style={{ animationDelay: '180ms' }} className="anim-fade-up text-lg text-gray-500 leading-relaxed mb-8 max-w-2xl mx-auto">
            Envie propostas comerciais com layout profissional, saiba quando o cliente abriu e nunca perca um negócio por falta de retorno.
          </p>
          <div style={{ animationDelay: '280ms' }} className="anim-fade-up flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/cadastro"
              className="w-full sm:w-auto inline-flex justify-center items-center px-6 py-3 bg-[#1D9E75] text-white font-medium rounded-lg hover:bg-[#188f68] hover:scale-[1.02] active:bg-[#147a59] transition-all text-sm"
            >
              Começar grátis — sem cartão
            </Link>
            <a
              href="#funcionalidades"
              className="w-full sm:w-auto inline-flex justify-center items-center px-6 py-3 border border-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-50 hover:scale-[1.02] transition-all text-sm"
            >
              Ver demonstração
            </a>
          </div>
          <p style={{ animationDelay: '360ms' }} className="anim-fade-in mt-5 text-sm text-gray-400">
            Grátis para sempre · 5 propostas/mês no plano Free
          </p>
        </div>
        <div style={{ animationDelay: '440ms' }} className="anim-scale-in">
          <AppMockup />
        </div>
      </section>

      {/* ━━━ COMO FUNCIONA ━━━ */}
      <section id="como-funciona" className="py-20 px-4 sm:px-6 bg-white">
        <RevealSection className="max-w-5xl mx-auto">
          <div className="text-center mb-14 reveal">
            <span className="text-xs font-semibold uppercase tracking-widest text-[#1D9E75] mb-3 block">
              Como funciona
            </span>
            <h2 className="text-3xl font-bold text-gray-900">
              Do rascunho ao aceite em 3 passos
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
                title: 'Envie por e-mail ou WhatsApp',
                desc: 'Escolha o canal: e-mail com botões de aprovação ou link direto pelo WhatsApp. O cliente aprova com um clique, sem criar conta.',
              },
              {
                num: '3',
                title: 'Acompanhe em tempo real',
                desc: 'Saiba quando o cliente abriu, quantas vezes visualizou e quando respondeu.',
              },
            ].map((step, i) => (
              <div
                key={step.num}
                className={`reveal reveal-delay-${i + 1} flex flex-col items-center text-center bg-[#F4F5F7] rounded-2xl p-8 border border-gray-100 hover:shadow-md hover:-translate-y-1 transition-all duration-300`}
              >
                <div className="w-10 h-10 rounded-full bg-[#1D9E75] text-white text-sm font-bold flex items-center justify-center mb-5 shrink-0">
                  {step.num}
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-3">{step.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </RevealSection>
      </section>

      {/* ━━━ FUNCIONALIDADES ━━━ */}
      <section id="funcionalidades" className="py-20 px-4 sm:px-6 bg-[#F4F5F7]">
        <RevealSection className="max-w-5xl mx-auto">
          <div className="text-center mb-14 reveal">
            <span className="text-xs font-semibold uppercase tracking-widest text-[#1D9E75] mb-3 block">
              Funcionalidades
            </span>
            <h2 className="text-3xl font-bold text-gray-900">
              Tudo que você precisa para criar, enviar e fechar propostas
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              {
                icon: <IconFileText />,
                title: 'Propostas profissionais',
                desc: 'Editor por seções e PDF gerado na hora com sua logo e identidade visual. Parece de agência, você fez em minutos.',
              },
              {
                icon: <IconMail />,
                title: 'Envio por e-mail e WhatsApp',
                desc: 'Envie por e-mail com botões de aprovação ou gere um link direto para o WhatsApp. O cliente responde sem criar conta.',
              },
              {
                icon: <IconEye />,
                title: 'Rastreamento de abertura',
                desc: 'Chega de mandar proposta e ficar no escuro. Veja quando o cliente abriu, quantas vezes releu — e saiba quem ainda está sem resposta.',
              },
              {
                icon: <IconBell />,
                title: 'Follow-ups automáticos',
                desc: 'Enviou a proposta e o cliente sumiu? O sistema avisa automaticamente — enquanto você foca em conquistar novos clientes.',
              },
              {
                icon: <IconUsers />,
                title: 'CRM de clientes',
                desc: 'Histórico completo de propostas, valor total e contatos de cada cliente.',
              },
              {
                icon: <IconGrid />,
                title: 'Modelos prontos',
                desc: 'Templates profissionais por tipo de serviço. Escolha um modelo ao criar a proposta e comece com tudo preenchido.',
              },
            ].map((feat, i) => (
              <div
                key={feat.title}
                className={`reveal reveal-delay-${(i % 6) + 1} bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 hover:border-[#1D9E75]/20 transition-all duration-300`}
              >
                <div className="w-10 h-10 rounded-lg bg-[#1D9E75]/10 flex items-center justify-center text-[#1D9E75] mb-4">
                  {feat.icon}
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-2">{feat.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{feat.desc}</p>
              </div>
            ))}
          </div>
        </RevealSection>
      </section>

      {/* ━━━ PLANOS ━━━ */}
      <section id="planos" className="py-20 px-4 sm:px-6 bg-white">
        <RevealSection className="max-w-4xl mx-auto">
          <div className="text-center mb-14 reveal">
            <span className="text-xs font-semibold uppercase tracking-widest text-[#1D9E75] mb-3 block">
              Planos
            </span>
            <h2 className="text-3xl font-bold text-gray-900">
              Comece grátis, cresça quando precisar
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
            {/* FREE */}
            <div className="reveal reveal-delay-1 rounded-2xl border border-gray-200 p-8 hover:shadow-md hover:-translate-y-1 transition-all duration-300">
              <h3 className="text-lg font-bold text-gray-900">Free</h3>
              <p className="text-sm text-gray-500 mt-1">Para começar sem compromisso</p>
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
                  { t: '5 clientes', ok: true },
                  { t: 'Envio por e-mail e WhatsApp', ok: true },
                  { t: 'Rastreamento de abertura', ok: true },
                  { t: 'Follow-up automático', ok: true },
                  { t: 'PDF com marca FreelanceFlow', ok: true },
                  { t: 'Modelos de proposta', ok: false },
                  { t: "PDF sem marca d'água", ok: false },
                ].map(item => (
                  <li key={item.t} className="flex items-center gap-3">
                    <Check ok={item.ok} />
                    <span className={`text-sm ${item.ok ? 'text-gray-700' : 'text-gray-400'}`}>{item.t}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* PRO */}
            <div className="reveal reveal-delay-2 rounded-2xl border-2 border-[#1D9E75] p-8 relative h-full hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 inline-flex px-3 py-1 bg-[#1D9E75] text-white text-xs font-semibold rounded-full whitespace-nowrap">
                Mais popular
              </span>
              <h3 className="text-lg font-bold text-gray-900">Pro</h3>
              <p className="text-sm text-gray-500 mt-1">Para quem quer crescer de verdade</p>
              <div className="mt-4 mb-6 flex items-center gap-3 flex-wrap">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-gray-900">R$19</span>
                  <span className="text-sm text-gray-400">/mês</span>
                </div>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: '#FEF3C7', color: '#92400E' }}>
                  <svg viewBox="0 0 12 12" className="w-2.5 h-2.5 fill-current"><path d="M6 0l1.5 4H12L8.5 6.5 10 11 6 8.5 2 11l1.5-4.5L0 4h4.5z"/></svg>
                  Preço de lançamento
                </span>
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
                  { t: 'Clientes ilimitados', ok: true },
                  { t: 'Envio por e-mail e WhatsApp', ok: true },
                  { t: "PDF sem marca d'água", ok: true },
                  { t: 'Modelos prontos de proposta', ok: true },
                  { t: 'Rastreamento de abertura', ok: true },
                  { t: 'Follow-up automático', ok: true },
                ].map(item => (
                  <li key={item.t} className="flex items-center gap-3">
                    <Check ok={item.ok} />
                    <span className="text-sm text-gray-700">{item.t}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </RevealSection>
      </section>

      {/* ━━━ CTA FINAL ━━━ */}
      <section className="py-24 px-4 sm:px-6 bg-[#1D9E75]">
        <RevealSection className="max-w-2xl mx-auto text-center">
          <h2 className="reveal text-3xl font-bold text-white mb-4">
            Troque o simples orçamento por uma proposta comercial profissional.
          </h2>
          <p className="reveal reveal-delay-1 text-white/80 text-base mb-8">
            Crie sua conta em menos de 2 minutos e mande a primeira proposta ainda hoje. Sem cartão de crédito.
          </p>
          <Link
            href="/cadastro"
            className="reveal reveal-delay-2 inline-flex items-center px-8 py-3.5 bg-white text-[#1D9E75] font-semibold rounded-lg hover:bg-gray-50 hover:scale-105 transition-all text-sm"
          >
            Criar conta grátis
          </Link>
        </RevealSection>
      </section>

      {/* ━━━ FOOTER ━━━ */}
      <footer className="py-8 px-4 sm:px-6 bg-white border-t border-gray-100">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="text-base font-bold text-[#1D9E75]">FreelanceFlow</span>
          <span className="text-sm text-gray-400">© 2026 FreelanceFlow · Para freelancers brasileiros</span>
          <a href="/privacidade" className="text-sm text-gray-400 hover:text-gray-600 transition-colors">Política de Privacidade</a>
        </div>
      </footer>

    </div>
  )
}
