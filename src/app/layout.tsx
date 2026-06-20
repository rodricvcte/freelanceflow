import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import MetaPixel from "@/components/MetaPixel";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const APP_URL = "https://freelanceflow.com.br";

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: "FreelanceFlow — Propostas comerciais para freelancers brasileiros",
    template: "%s | FreelanceFlow",
  },
  description:
    "Crie propostas comerciais profissionais em minutos, envie por e-mail ou WhatsApp e saiba quando o cliente abriu. Follow-up automático e PDF sem marca d'água no plano Pro. Para freelancers brasileiros.",
  keywords: [
    "proposta comercial freelancer",
    "criar proposta freelancer",
    "software proposta comercial",
    "ferramenta para freelancer",
    "proposta profissional PDF",
    "enviar proposta por email",
    "enviar proposta por whatsapp",
    "rastreamento proposta",
    "follow-up automático proposta",
    "fechar clientes freelancer",
    "gestão de propostas freelancer",
    "proposta comercial brasil",
    "freelancer brasil",
    "sistema de propostas",
  ],
  authors: [{ name: "FreelanceFlow", url: APP_URL }],
  creator: "FreelanceFlow",
  publisher: "FreelanceFlow",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: APP_URL,
    siteName: "FreelanceFlow",
    title: "FreelanceFlow — Propostas comerciais para freelancers brasileiros",
    description:
      "Crie propostas profissionais em minutos, envie por e-mail ou WhatsApp e saiba quando o cliente abriu. Follow-up automático incluso.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "FreelanceFlow — Propostas comerciais para freelancers brasileiros",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "FreelanceFlow — Propostas comerciais para freelancers",
    description:
      "Crie propostas profissionais em minutos, envie por e-mail ou WhatsApp e saiba quando o cliente abriu.",
    images: ["/og-image.png"],
  },
  alternates: {
    canonical: APP_URL,
  },
  category: "technology",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <GoogleAnalytics />
        <MetaPixel />
        {children}
      </body>
    </html>
  );
}
