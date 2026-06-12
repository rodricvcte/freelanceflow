export function fmtBRL(v: number | null): string {
  if (v === null) return '—'
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)
}

export function fmtDate(iso: string | null): string {
  if (!iso) return '—'
  const [y, m, d] = iso.split('T')[0].split('-').map(Number)
  return new Intl.DateTimeFormat('pt-BR').format(new Date(y, m - 1, d))
}

export function fmtDateTime(iso: string): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  }).format(new Date(iso))
}

export function trunc(s: string, n: number): string {
  return s.length > n ? s.slice(0, n) + '…' : s
}

export function daysSince(iso: string | null): number {
  if (!iso) return 0
  return Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000)
}
