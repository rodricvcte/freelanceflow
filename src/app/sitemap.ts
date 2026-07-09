import type { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: 'https://www.freelanceflow.com.br', lastModified: new Date() },
    { url: 'https://www.freelanceflow.com.br/cadastro', lastModified: new Date() },
    { url: 'https://www.freelanceflow.com.br/blog', lastModified: new Date() },
    { url: 'https://www.freelanceflow.com.br/blog/como-fazer-proposta-comercial-freelancer', lastModified: new Date() },
    { url: 'https://www.freelanceflow.com.br/blog/follow-up-proposta-comercial', lastModified: new Date() },
    { url: 'https://www.freelanceflow.com.br/blog/modelo-proposta-comercial-criador-de-sites', lastModified: new Date() },
    { url: 'https://www.freelanceflow.com.br/blog/como-cobrar-cliente-inadimplente', lastModified: new Date() },
    { url: 'https://www.freelanceflow.com.br/modelos-de-proposta', lastModified: new Date() },
    { url: 'https://www.freelanceflow.com.br/modelos-de-proposta/criador-de-sites', lastModified: new Date() },
    { url: 'https://www.freelanceflow.com.br/modelos-de-proposta/designer-grafico', lastModified: new Date() },
    { url: 'https://www.freelanceflow.com.br/modelos-de-proposta/copywriter', lastModified: new Date() },
    { url: 'https://www.freelanceflow.com.br/modelos-de-proposta/social-media', lastModified: new Date() },
    { url: 'https://www.freelanceflow.com.br/privacidade', lastModified: new Date() },
  ]
}
