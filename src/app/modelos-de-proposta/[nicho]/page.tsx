import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import NavHeader from '@/components/NavHeader'

const BASE = 'https://freelanceflow.com.br'

type ModelPage = {
  nicho: string
  title: string
  description: string
  h1: string
  intro: string
  sections: { heading: string; body: React.ReactNode }[]
}

const models: ModelPage[] = [
  {
    nicho: 'criador-de-sites',
    title: 'Modelo de Proposta para Criador de Sites | FreelanceFlow',
    description:
      'Modelo de proposta pronto para criador de sites. Com escopo de páginas, funcionalidades, prazo por etapas e aceite com validade legal. Use grátis.',
    h1: 'Modelo de proposta para criador de sites',
    intro:
      'Use este modelo de proposta para criador de sites para apresentar projetos de forma profissional, definir o escopo com clareza e receber o aceite do cliente com validade jurídica — tudo pelo FreelanceFlow.',
    sections: [
      {
        heading: 'O que este modelo de proposta inclui',
        body: (
          <ul className="space-y-2 text-gray-600 text-sm leading-relaxed list-disc pl-5">
            <li>Apresentação do freelancer e portfólio</li>
            <li>Entendimento do projeto e objetivos do cliente</li>
            <li>Escopo detalhado: número de páginas, funcionalidades e tecnologias</li>
            <li>O que está fora do escopo (limite de revisões, conteúdo, hospedagem)</li>
            <li>Cronograma com marcos: wireframe, design, desenvolvimento, revisão, publicação</li>
            <li>Investimento total com condições de pagamento</li>
            <li>Validade da proposta e próximos passos</li>
          </ul>
        ),
      },
      {
        heading: 'Para quais projetos usar',
        body: (
          <ul className="space-y-2 text-gray-600 text-sm leading-relaxed list-disc pl-5">
            <li>Sites institucionais (1 a 10 páginas)</li>
            <li>Landing pages de alta conversão</li>
            <li>Lojas virtuais e e-commerces</li>
            <li>Blogs e portais de conteúdo</li>
            <li>Sistemas com área de membros ou login</li>
            <li>Reformulação e redesign de sites existentes</li>
          </ul>
        ),
      },
      {
        heading: 'Como usar este modelo no FreelanceFlow',
        body: (
          <p className="text-gray-600 text-sm leading-relaxed">
            Crie sua conta grátis, escolha o modelo de proposta para criador de sites na biblioteca de
            templates, preencha as informações do cliente e do projeto e envie por link ou WhatsApp.
            O cliente aprova com um clique e você recebe um Certificado de Aceite em PDF com data,
            hora e IP registrados — válido juridicamente com base no Marco Civil da Internet.
          </p>
        ),
      },
    ],
  },
  {
    nicho: 'designer-grafico',
    title: 'Modelo de Proposta para Designer Gráfico | FreelanceFlow',
    description:
      'Modelo de proposta pronto para designer gráfico. Com entregáveis criativos, revisões, formatos de arquivo e aceite com validade legal. Use grátis.',
    h1: 'Modelo de proposta para designer gráfico',
    intro:
      'Use este modelo de proposta para designer gráfico para apresentar projetos criativos com profissionalismo, definir entregas e revisões com clareza e receber o aceite do cliente registrado — pelo FreelanceFlow.',
    sections: [
      {
        heading: 'O que este modelo de proposta inclui',
        body: (
          <ul className="space-y-2 text-gray-600 text-sm leading-relaxed list-disc pl-5">
            <li>Apresentação do designer e portfólio de projetos similares</li>
            <li>Briefing resumido: objetivo, público-alvo e referências do cliente</li>
            <li>Entregáveis detalhados: quais peças, formatos e tamanhos</li>
            <li>Número de opções de conceito apresentadas e rodadas de revisão inclusas</li>
            <li>Formatos de entrega (AI, PDF, PNG, SVG, etc.)</li>
            <li>Prazo de entrega do conceito, revisões e arquivos finais</li>
            <li>Investimento e condições de pagamento</li>
            <li>Política de uso e cessão de direitos</li>
          </ul>
        ),
      },
      {
        heading: 'Para quais projetos usar',
        body: (
          <ul className="space-y-2 text-gray-600 text-sm leading-relaxed list-disc pl-5">
            <li>Identidade visual completa (logo, manual de marca)</li>
            <li>Papelaria corporativa (cartão, envelope, pasta)</li>
            <li>Materiais de marketing (flyers, banners, apresentações)</li>
            <li>Embalagem e rótulos de produtos</li>
            <li>Peças para redes sociais (posts, stories, capas)</li>
            <li>Infográficos e materiais editoriais</li>
          </ul>
        ),
      },
      {
        heading: 'Como usar este modelo no FreelanceFlow',
        body: (
          <p className="text-gray-600 text-sm leading-relaxed">
            Crie sua conta grátis, escolha o modelo de proposta para designer gráfico, preencha os dados
            do cliente e do projeto criativo e envie por link ou WhatsApp. O cliente aprova com um clique
            e você recebe o Certificado de Aceite em PDF — sem precisar de contrato separado.
          </p>
        ),
      },
    ],
  },
  {
    nicho: 'social-media',
    title: 'Modelo de Proposta para Social Media | FreelanceFlow',
    description:
      'Modelo de proposta para social media com pacotes mensais, entregáveis, plataformas e relatório. Envie por link e receba o aceite com validade legal.',
    h1: 'Modelo de proposta para social media',
    intro:
      'Use este modelo de proposta para social media para apresentar pacotes mensais de forma clara, definir o que está incluso e receber o aceite do cliente com validade jurídica — pelo FreelanceFlow.',
    sections: [
      {
        heading: 'O que este modelo de proposta inclui',
        body: (
          <ul className="space-y-2 text-gray-600 text-sm leading-relaxed list-disc pl-5">
            <li>Apresentação do profissional e cases de resultado</li>
            <li>Diagnóstico rápido: situação atual das redes do cliente</li>
            <li>Plataformas cobertas (Instagram, LinkedIn, TikTok, Facebook, etc.)</li>
            <li>Volume de publicações por semana e por plataforma</li>
            <li>O que está incluso: criação de legenda, design, agendamento, stories</li>
            <li>O que não está incluso: tráfego pago, atendimento de DMs, fotografia</li>
            <li>Relatório mensal de métricas</li>
            <li>Valor mensal, prazo mínimo de contrato e condições de renovação</li>
          </ul>
        ),
      },
      {
        heading: 'Para quais serviços usar',
        body: (
          <ul className="space-y-2 text-gray-600 text-sm leading-relaxed list-disc pl-5">
            <li>Gestão mensal de redes sociais (pacote completo)</li>
            <li>Criação de conteúdo sem gestão de perfil</li>
            <li>Consultoria de posicionamento e estratégia de conteúdo</li>
            <li>Produção de reels e vídeos curtos</li>
            <li>Gestão de tráfego pago (Meta Ads, Google Ads)</li>
          </ul>
        ),
      },
      {
        heading: 'Como usar este modelo no FreelanceFlow',
        body: (
          <p className="text-gray-600 text-sm leading-relaxed">
            Crie sua conta grátis, escolha o modelo de proposta para social media, preencha o pacote do
            cliente e envie por link ou WhatsApp. O cliente aprova com um clique e você recebe o
            Certificado de Aceite em PDF com registro de data, hora e IP — válido juridicamente.
          </p>
        ),
      },
    ],
  },
]

const modelMap = Object.fromEntries(models.map(m => [m.nicho, m]))

export async function generateStaticParams() {
  return models.map(m => ({ nicho: m.nicho }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ nicho: string }>
}): Promise<Metadata> {
  const { nicho } = await params
  const model = modelMap[nicho]
  if (!model) return {}
  return {
    title: model.title,
    description: model.description,
    alternates: { canonical: `${BASE}/modelos-de-proposta/${nicho}` },
    openGraph: {
      title: model.title,
      description: model.description,
      url: `${BASE}/modelos-de-proposta/${nicho}`,
      images: [{ url: '/og-image.png', width: 1200, height: 630 }],
    },
  }
}

export default async function ModeloPage({
  params,
}: {
  params: Promise<{ nicho: string }>
}) {
  const { nicho } = await params
  const model = modelMap[nicho]
  if (!model) notFound()

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <NavHeader />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 pt-28 pb-20">
        <div className="mb-8">
          <Link href="/modelos-de-proposta" className="text-sm text-[#1D9E75] hover:underline">
            ← Ver todos os modelos
          </Link>
        </div>

        <span className="text-xs font-semibold uppercase tracking-widest text-[#1D9E75] mb-3 block">
          Modelo de proposta
        </span>

        <h1 className="text-3xl font-bold text-gray-900 mb-4 leading-tight">{model.h1}</h1>
        <p className="text-gray-500 text-base leading-relaxed mb-12">{model.intro}</p>

        <div className="space-y-10">
          {model.sections.map(s => (
            <section key={s.heading}>
              <h2 className="text-lg font-bold text-gray-900 mb-4">{s.heading}</h2>
              {s.body}
            </section>
          ))}
        </div>

        <div className="mt-16 rounded-2xl bg-[#1D9E75]/8 border border-[#1D9E75]/20 p-8 text-center">
          <p className="text-gray-800 font-semibold text-lg mb-2">
            Use este modelo grátis agora
          </p>
          <p className="text-gray-500 text-sm mb-6">
            Crie sua conta, preencha os dados e envie sua primeira proposta profissional hoje.
            Sem cartão de crédito.
          </p>
          <Link
            href="/cadastro"
            className="inline-flex items-center px-6 py-3 bg-[#1D9E75] text-white font-medium rounded-lg hover:bg-[#188f68] transition-colors text-sm"
          >
            Criar conta grátis e usar o modelo
          </Link>
        </div>
      </main>

      <footer className="py-8 px-4 sm:px-6 bg-white border-t border-gray-100">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <Link href="/" className="text-base font-bold text-[#1D9E75]">FreelanceFlow</Link>
          <span className="text-sm text-gray-400">© 2026 FreelanceFlow · Para freelancers brasileiros</span>
          <Link href="/privacidade" className="text-sm text-gray-400 hover:text-gray-600 transition-colors">Política de Privacidade</Link>
        </div>
      </footer>
    </div>
  )
}
