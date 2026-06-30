import type { Metadata } from 'next'
import Link from 'next/link'
import NavHeader from '@/components/NavHeader'

const BASE = 'https://freelanceflow.com.br'

export const metadata: Metadata = {
  title: 'Modelos de Proposta Comercial por Nicho | FreelanceFlow',
  description:
    'Modelos de proposta comercial prontos para freelancers: criador de sites, designer gráfico, social media e mais. Use grátis no FreelanceFlow.',
  alternates: { canonical: `${BASE}/modelos-de-proposta` },
  openGraph: {
    title: 'Modelos de Proposta Comercial por Nicho | FreelanceFlow',
    description:
      'Modelos de proposta comercial prontos para freelancers: criador de sites, designer gráfico, social media e mais.',
    url: `${BASE}/modelos-de-proposta`,
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
}

const niches = [
  {
    slug: 'copywriter',
    title: 'Copywriter',
    description:
      'Proposta com escopo de textos, quantidade de peças, rodadas de revisão, prazo de entrega e condições de pagamento.',
    tags: ['Landing page', 'E-mail marketing', 'Anúncios'],
  },
  {
    slug: 'criador-de-sites',
    title: 'Criador de Sites',
    description:
      'Proposta com escopo de páginas, funcionalidades, prazo por etapas e política de revisões.',
    tags: ['WordPress', 'Landing page', 'E-commerce'],
  },
  {
    slug: 'designer-grafico',
    title: 'Designer Gráfico',
    description:
      'Proposta com entregáveis criativos, número de revisões, formatos de arquivo e prazo de aprovação.',
    tags: ['Identidade visual', 'Materiais gráficos', 'Social media'],
  },
  {
    slug: 'social-media',
    title: 'Social Media',
    description:
      'Proposta com pacote mensal, volume de posts, plataformas, criação de conteúdo e relatório.',
    tags: ['Instagram', 'LinkedIn', 'TikTok'],
  },
]

export default function ModelosIndex() {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      <NavHeader />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-28 pb-20">
        <header className="mb-14 text-center">
          <span className="text-xs font-semibold uppercase tracking-widest text-[#1D9E75] mb-3 block">
            Modelos de proposta
          </span>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Modelos de proposta comercial prontos por nicho
          </h1>
          <p className="text-gray-500 text-lg leading-relaxed max-w-2xl mx-auto">
            Escolha o modelo do seu nicho, adapte em minutos e envie com link profissional.
            Seu cliente aprova com um clique — sem criar conta.
          </p>
        </header>

        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {niches.map(n => (
            <li key={n.slug}>
              <Link
                href={`/modelos-de-proposta/${n.slug}`}
                className="group flex flex-col h-full rounded-2xl border border-gray-200 p-6 hover:border-[#1D9E75]/40 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
              >
                <h2 className="text-lg font-bold text-gray-900 group-hover:text-[#1D9E75] transition-colors mb-2">
                  {n.title}
                </h2>
                <p className="text-sm text-gray-500 leading-relaxed mb-4 flex-1">{n.description}</p>
                <div className="flex flex-wrap gap-2">
                  {n.tags.map(tag => (
                    <span
                      key={tag}
                      className="text-xs font-medium px-2 py-1 rounded-full bg-[#1D9E75]/10 text-[#1D9E75]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <span className="mt-4 text-sm font-medium text-[#1D9E75]">Ver modelo →</span>
              </Link>
            </li>
          ))}
        </ul>

        <div className="mt-16 rounded-2xl bg-[#1D9E75]/8 border border-[#1D9E75]/20 p-8 text-center">
          <p className="text-gray-700 font-medium mb-2">
            Use todos os modelos grátis no FreelanceFlow.
          </p>
          <p className="text-gray-500 text-sm mb-6">
            Crie sua conta e comece a enviar propostas profissionais hoje.
          </p>
          <Link
            href="/cadastro"
            className="inline-flex items-center px-6 py-3 bg-[#1D9E75] text-white font-medium rounded-lg hover:bg-[#188f68] transition-colors text-sm"
          >
            Criar conta grátis
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
