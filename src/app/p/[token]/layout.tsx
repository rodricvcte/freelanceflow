import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Proposta Comercial',
  description: 'Você recebeu uma proposta. Clique para visualizar.',
  openGraph: {
    title: 'Proposta Comercial',
    description: 'Você recebeu uma proposta. Clique para visualizar.',
    images: [],
  },
}

export default function PublicProposalLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
