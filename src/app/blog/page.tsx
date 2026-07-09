import type { Metadata } from 'next'
import Link from 'next/link'
import NavHeader from '@/components/NavHeader'

const BASE = 'https://freelanceflow.com.br'

export const metadata: Metadata = {
  title: 'Blog FreelanceFlow — Propostas Comerciais para Freelancers',
  description:
    'Dicas, modelos e guias sobre proposta comercial para freelancers brasileiros. Aprenda a criar, enviar e fechar mais projetos.',
  alternates: { canonical: `${BASE}/blog` },
  openGraph: {
    title: 'Blog FreelanceFlow — Propostas Comerciais para Freelancers',
    description:
      'Dicas, modelos e guias sobre proposta comercial para freelancers brasileiros.',
    url: `${BASE}/blog`,
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
}

const articles = [
  {
    slug: 'como-fazer-proposta-comercial-freelancer',
    title: 'Como fazer uma proposta comercial para freelancer que o cliente aceita',
    description:
      'Estrutura completa, exemplos e erros a evitar na hora de montar sua proposta comercial como freelancer.',
    date: '28 de junho de 2026',
  },
  {
    slug: 'follow-up-proposta-comercial',
    title: 'Follow-up de proposta comercial: o guia para freelancers',
    description:
      'Quando cobrar resposta, como escrever a mensagem e como automatizar o follow-up sem parecer chato.',
    date: '28 de junho de 2026',
  },
  {
    slug: 'modelo-proposta-comercial-criador-de-sites',
    title: 'Modelo de proposta comercial para criador de sites: estrutura completa',
    description:
      'Modelo pronto de proposta para quem cria sites — com escopo, precificação e cláusulas essenciais.',
    date: '28 de junho de 2026',
  },
  {
    slug: 'como-cobrar-cliente-inadimplente',
    title: 'Como cobrar de cliente inadimplente sendo freelancer',
    description:
      'Mensagens prontas, multa, juros e quando escalar a cobrança quando o cliente some sem pagar.',
    date: '9 de julho de 2026',
  },
]

export default function BlogIndex() {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      <NavHeader />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 pt-28 pb-20">
        <header className="mb-12">
          <span className="text-xs font-semibold uppercase tracking-widest text-[#1D9E75] mb-3 block">
            Blog
          </span>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Proposta comercial para freelancers
          </h1>
          <p className="text-gray-500 text-lg leading-relaxed">
            Guias práticos para criar propostas que convencem, acompanhar clientes e fechar mais projetos.
          </p>
        </header>
        <ul className="divide-y divide-gray-100">
          {articles.map(a => (
            <li key={a.slug} className="py-8">
              <time className="text-xs text-gray-400 font-medium">{a.date}</time>
              <h2 className="mt-2 text-xl font-bold text-gray-900 hover:text-[#1D9E75] transition-colors">
                <Link href={`/blog/${a.slug}`}>{a.title}</Link>
              </h2>
              <p className="mt-2 text-gray-500 text-sm leading-relaxed">{a.description}</p>
              <Link
                href={`/blog/${a.slug}`}
                className="mt-4 inline-flex text-sm font-medium text-[#1D9E75] hover:underline"
              >
                Ler artigo →
              </Link>
            </li>
          ))}
        </ul>

        <div className="mt-16 rounded-2xl bg-[#1D9E75]/8 border border-[#1D9E75]/20 p-8 text-center">
          <p className="text-gray-700 font-medium mb-4">
            Crie e envie propostas profissionais em minutos — grátis para começar.
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
