import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/dashboard',
          '/admin',
          '/onboarding',
          '/impersonate-callback',
          '/api/',
          '/p/',
        ],
      },
    ],
    sitemap: 'https://freelanceflow.com.br/sitemap.xml',
    host: 'https://freelanceflow.com.br',
  }
}
