import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/dashboard/',
          '/admin/',
          '/api/',
          '/onboarding/',
          '/impersonate-callback/',
          '/p/',
        ],
      },
    ],
    sitemap: 'https://freelanceflow.com.br/sitemap.xml',
    host: 'https://freelanceflow.com.br',
  }
}
