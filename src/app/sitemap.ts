import type { MetadataRoute } from 'next'

const BASE = 'https://freelanceflow.com.br'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: BASE,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${BASE}/cadastro`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${BASE}/blog`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${BASE}/blog/como-fazer-proposta-comercial-freelancer`,
      lastModified: new Date('2026-06-28'),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${BASE}/blog/follow-up-proposta-comercial`,
      lastModified: new Date('2026-06-28'),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${BASE}/blog/modelo-proposta-comercial-criador-de-sites`,
      lastModified: new Date('2026-06-28'),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${BASE}/modelos-de-proposta`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${BASE}/modelos-de-proposta/criador-de-sites`,
      lastModified: new Date('2026-06-28'),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${BASE}/modelos-de-proposta/designer-grafico`,
      lastModified: new Date('2026-06-28'),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${BASE}/modelos-de-proposta/social-media`,
      lastModified: new Date('2026-06-28'),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${BASE}/login`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.4,
    },
    {
      url: `${BASE}/privacidade`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ]
}
