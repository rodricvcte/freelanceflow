import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'FreelanceFlow',
  description: 'Propostas comerciais em minutos.',
  openGraph: {
    title: 'FreelanceFlow',
    description: 'Propostas comerciais em minutos.',
    images: [],
  },
}

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
