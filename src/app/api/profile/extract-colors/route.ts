import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'

// ── HTML helpers ──────────────────────────────────────────────────────────────

function getAttr(tag: string, attr: string): string | null {
  const m = tag.match(new RegExp(`\\s${attr}=["']([^"']*)["']`, 'i'))
  return m ? m[1].trim() : null
}

function allTags(html: string, tagName: string): string[] {
  return html.match(new RegExp(`<${tagName}[^>]*/?>`, 'gi')) ?? []
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
  const l = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return l > 0.07 && l < 0.93
}

// ── Extraction ────────────────────────────────────────────────────────────────

function extractColor(html: string): string | null {
  // 1. <meta name="theme-color" content="...">
  for (const tag of allTags(html, 'meta')) {
    const name = (getAttr(tag, 'name') || '').toLowerCase()
    if (name === 'theme-color') {
      const val = getAttr(tag, 'content')
      if (val) { const h = toHex(val); if (h && isUsableColor(h)) return h }
    }
  }

  // 2. CSS variables --primary or --brand-color in <style> blocks
  const styleBlocks = html.match(/<style[^>]*>[\s\S]*?<\/style>/gi) ?? []
  for (const block of styleBlocks) {
    const css = block.replace(/<\/?style[^>]*>/gi, '')
    const m = css.match(/--(?:primary|brand-color|brand|accent)(?:-color)?:\s*(#[0-9a-fA-F]{3,8})/i)
    if (m) { const h = normalizeHex(m[1]); if (isUsableColor(h)) return h }
  }

  // 3. background-color of the first <header> element (inline style)
  for (const tag of allTags(html, 'header')) {
    const style = getAttr(tag, 'style') || ''
    const hexMatch = style.match(/#[0-9a-fA-F]{3,8}/)
    if (hexMatch) { const h = normalizeHex(hexMatch[0]); if (isUsableColor(h)) return h }
    const rgbMatch = style.match(/rgb\s*\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)/)
    if (rgbMatch) { const h = toHex(rgbMatch[0]); if (h && isUsableColor(h)) return h }
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
    const timer = setTimeout(() => ctrl.abort(), 5_000)

    const res = await fetch(url, {
      signal: ctrl.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; FreelanceFlow/1.0)',
        'Accept':     'text/html,application/xhtml+xml',
      },
    })
    clearTimeout(timer)

    if (!res.ok) throw new Error(`O site retornou ${res.status}`)

    const ct = (res.headers.get('content-type') || '').toLowerCase()
    if (!ct.includes('html')) throw new Error('URL não retornou uma página HTML')

    const html = await res.text()
    const color = extractColor(html)

    if (!color) {
      return NextResponse.json({ error: 'Não foi possível extrair a cor do site' }, { status: 422 })
    }

    return NextResponse.json({ color })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : ''
    const isTimeout = msg.includes('abort') || msg.includes('time')
    return NextResponse.json(
      { error: isTimeout ? 'Não foi possível extrair a cor do site' : (msg || 'Não foi possível extrair a cor do site') },
      { status: 422 }
    )
  }
}
