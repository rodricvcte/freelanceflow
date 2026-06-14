import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'

// ── HTML helpers ──────────────────────────────────────────────────────────────

function getAttr(tag: string, name: string): string | null {
  const m = tag.match(new RegExp(`\\s${name}=["']([^"']*)["']`, 'i'))
  return m ? m[1].trim() : null
}

function allTags(html: string, tagName: string): string[] {
  return html.match(new RegExp(`<${tagName}[^>]*/?>`, 'gi')) ?? []
}

function resolveUrl(base: string, path: string): string {
  try { return new URL(path, base).href } catch { return path }
}

// ── Color helpers ─────────────────────────────────────────────────────────────

function normalizeHex(hex: string): string {
  const h = hex.trim()
  if (h.length === 4) return '#' + h[1]+h[1] + h[2]+h[2] + h[3]+h[3]
  return h.slice(0, 7).toLowerCase()
}

function toHex(val: string): string | null {
  const v = val.trim()
  if (/^#[0-9a-fA-F]{3,8}$/.test(v)) return normalizeHex(v)
  const rgb = v.match(/rgb\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/)
  if (rgb) {
    return '#' + [rgb[1], rgb[2], rgb[3]]
      .map(n => parseInt(n).toString(16).padStart(2, '0'))
      .join('')
  }
  return null
}

function isUsableColor(hex: string): boolean {
  if (!/^#[0-9a-fA-F]{6}$/.test(hex)) return false
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  // Filter near-white and near-black — not useful as brand color
  const l = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return l > 0.07 && l < 0.93
}

// ── Extraction ────────────────────────────────────────────────────────────────

function extractColor(html: string): string | null {
  // 1. meta theme-color
  for (const tag of allTags(html, 'meta')) {
    const name = (getAttr(tag, 'name') || '').toLowerCase()
    if (name === 'theme-color') {
      const val = getAttr(tag, 'content')
      if (val) { const h = toHex(val); if (h && isUsableColor(h)) return h }
    }
    if (name === 'msapplication-tilecolor') {
      const val = getAttr(tag, 'content')
      if (val) { const h = toHex(val); if (h && isUsableColor(h)) return h }
    }
  }

  // 2. CSS variables in <style> blocks
  const styleBlocks = html.match(/<style[^>]*>[\s\S]*?<\/style>/gi) ?? []
  for (const block of styleBlocks) {
    const css = block.replace(/<\/?style[^>]*>/gi, '')
    const m = css.match(
      /--(?:primary|brand|accent|main|theme|color-primary)(?:-color)?:\s*(#[0-9a-fA-F]{3,8})/i
    )
    if (m) { const h = normalizeHex(m[1]); if (isUsableColor(h)) return h }
  }

  return null
}

function extractLogo(html: string, baseUrl: string): string | null {
  // 1. apple-touch-icon — square, high quality, ideal for logos
  for (const tag of allTags(html, 'link')) {
    const rel = (getAttr(tag, 'rel') || '').toLowerCase()
    if (rel.includes('apple-touch-icon')) {
      const href = getAttr(tag, 'href')
      if (href) return resolveUrl(baseUrl, href)
    }
  }

  // 2. <img> with "logo" in class / id / alt / src
  for (const tag of allTags(html, 'img')) {
    const attrs = [
      getAttr(tag, 'class') || '',
      getAttr(tag, 'id')    || '',
      getAttr(tag, 'alt')   || '',
      getAttr(tag, 'src')   || '',
    ].join(' ').toLowerCase()
    const src = getAttr(tag, 'src') || ''
    if (attrs.includes('logo') && src && !src.startsWith('data:')) {
      return resolveUrl(baseUrl, src)
    }
  }

  // 3. og:image as fallback
  for (const tag of allTags(html, 'meta')) {
    const prop = (getAttr(tag, 'property') || '').toLowerCase()
    if (prop === 'og:image') {
      const content = getAttr(tag, 'content')
      if (content) return resolveUrl(baseUrl, content)
    }
  }

  return null
}

function normalizeWebUrl(raw: string): string {
  const s = raw.trim()
  if (/^https?:\/\//i.test(s)) return s
  if (s.startsWith('//')) return 'https:' + s
  return 'https://' + s
}

// ── Route ─────────────────────────────────────────────────────────────────────

export async function POST(req: Request) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const body = await req.json().catch(() => ({}))
  const rawUrl: string = body.url ?? ''
  if (!rawUrl.trim()) return NextResponse.json({ error: 'URL é obrigatória' }, { status: 400 })

  const url = normalizeWebUrl(rawUrl)

  try {
    const ctrl  = new AbortController()
    const timer = setTimeout(() => ctrl.abort(), 12_000)

    const res = await fetch(url, {
      signal: ctrl.signal,
      headers: {
        'User-Agent':      'Mozilla/5.0 (compatible; FreelanceFlow/1.0)',
        'Accept':          'text/html,application/xhtml+xml',
        'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8',
      },
    })
    clearTimeout(timer)

    if (!res.ok) throw new Error(`O site retornou ${res.status}`)

    const ct = res.headers.get('content-type') || ''
    if (!ct.includes('html')) throw new Error('URL não retornou uma página HTML')

    const html = await res.text()

    const accent_color = extractColor(html)
    const logo_url     = extractLogo(html, url)

    return NextResponse.json({ accent_color, logo_url })
  } catch (err: unknown) {
    const raw   = err instanceof Error ? err.message : ''
    const cause = err instanceof Error && (err as NodeJS.ErrnoException).cause instanceof Error
      ? ((err as NodeJS.ErrnoException).cause as Error).message
      : ''

    console.error('[fetch-brand] erro ao buscar', url, '|', raw, cause ? `| causa: ${cause}` : '')

    let friendly = 'Não foi possível acessar o site. Verifique a URL e tente novamente.'

    if (raw.includes('abort') || raw.includes('time') || cause.includes('time')) {
      friendly = 'O site demorou muito para responder (timeout).'
    } else if (
      cause.includes('ENOTFOUND') ||
      cause.includes('EAI_AGAIN') ||
      cause.includes('getaddrinfo')
    ) {
      friendly = 'Domínio não encontrado. Verifique se a URL está correta.'
    } else if (
      cause.includes('ECONNREFUSED') ||
      cause.includes('ECONNRESET') ||
      cause.includes('EHOSTUNREACH')
    ) {
      friendly = 'O servidor do site recusou a conexão.'
    } else if (raw.includes('SSL') || raw.includes('certificate') || cause.includes('SSL')) {
      friendly = 'Erro de certificado SSL no site informado.'
    } else if (raw !== 'fetch failed' && raw !== '') {
      friendly = raw
    }

    return NextResponse.json({ error: friendly }, { status: 422 })
  }
}
