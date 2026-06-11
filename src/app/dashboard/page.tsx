import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import { unstable_noStore as noStore } from 'next/cache'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import UpgradedBanner from '@/components/UpgradedBanner'

export const dynamic = 'force-dynamic'

// ─── Types ────────────────────────────────────────────────────────────────────

type ProposalRow = {
  id: string
  title: string
  value: number | null
  status: string
  created_at: string
  sent_at: string | null
  proposal_number: string | null
  clients: { name: string } | { name: string }[] | null
}

const STATUS_ORDER = [
  'rascunho', 'enviada', 'visualizada', 'aprovada', 'reprovada', 'expirada', 'cancelada',
] as const
type StatusKey = (typeof STATUS_ORDER)[number]

const STATUS_CONFIG: Record<StatusKey, { label: string; textCls: string; bgCls: string }> = {
  rascunho:    { label: 'Rascunho',    textCls: 'text-gray-600',    bgCls: 'bg-gray-100'    },
  enviada:     { label: 'Enviada',     textCls: 'text-blue-700',    bgCls: 'bg-blue-100'    },
  visualizada: { label: 'Visualizada', textCls: 'text-yellow-700',  bgCls: 'bg-yellow-100'  },
  aprovada:    { label: 'Aprovada',    textCls: 'text-emerald-700', bgCls: 'bg-emerald-100' },
  reprovada:   { label: 'Reprovada',   textCls: 'text-red-700',     bgCls: 'bg-red-100'     },
  expirada:    { label: 'Expirada',    textCls: 'text-orange-700',  bgCls: 'bg-orange-100'  },
  cancelada:   { label: 'Cancelada',   textCls: 'text-red-900',     bgCls: 'bg-red-200'     },
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmtBRL(v: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)
}

function fmtFullDate(date: Date): string {
  const raw = new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  }).format(date)
  return raw.charAt(0).toUpperCase() + raw.slice(1)
}

function daysSince(iso: string | null): number {
  if (!iso) return 0
  return Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000)
}

function clientName(p: ProposalRow): string | null {
  if (!p.clients) return null
  const c = Array.isArray(p.clients) ? p.clients[0] : p.clients
  return c?.name ?? null
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function DashboardPage() {
  noStore()
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [profileRes, proposalsRes, subRes] = await Promise.all([
    supabase
      .from('profiles')
      .select('full_name, business_name')
      .eq('id', user.id)
      .single(),
    supabase
      .from('proposals')
      .select('id, title, value, status, created_at, sent_at, proposal_number, clients(name)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false }),
    supabase
      .from('subscriptions')
      .select('plan, status')
      .eq('user_id', user.id)
      .maybeSingle(),
  ])

  const profile   = profileRes.data
  const proposals = (proposalsRes.data ?? []) as ProposalRow[]
  const sub       = subRes.data

  const firstName = profile?.business_name?.split(' ')[0]
    ?? profile?.full_name?.split(' ')[0]
    ?? 'Freelancer'

  const isPro = !!sub && sub.plan === 'pro' && (sub.status === 'active' || sub.status === 'trialing')

  const now        = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const ago30      = new Date(now.getTime() - 30 * 86_400_000)

  // ── Metrics ──────────────────────────────────────────────────────────────────
  const counts = proposals.reduce<Record<string, number>>((acc, p) => {
    acc[p.status] = (acc[p.status] ?? 0) + 1
    return acc
  }, {})

  const approvedCount      = counts['aprovada'] ?? 0
  const totalApprovedValue = proposals
    .filter(p => p.status === 'aprovada')
    .reduce((sum, p) => sum + (p.value ?? 0), 0)

  const openCount = (counts['enviada'] ?? 0) + (counts['visualizada'] ?? 0)

  const recentClosed = proposals.filter(p =>
    new Date(p.created_at) >= ago30 && (p.status === 'aprovada' || p.status === 'reprovada')
  )
  const approvalRate = recentClosed.length > 0
    ? Math.round((recentClosed.filter(p => p.status === 'aprovada').length / recentClosed.length) * 100)
    : null

  const usedThisMonth     = proposals.filter(p => new Date(p.created_at) >= monthStart).length
  const showUpgradeBanner = !isPro && usedThisMonth >= 4

  // ── Attention items ──────────────────────────────────────────────────────────
  const sentNoView = proposals.filter(p =>
    p.status === 'enviada' && daysSince(p.sent_at ?? p.created_at) >= 5
  )
  const viewedNoResponse = proposals.filter(p =>
    p.status === 'visualizada' && daysSince(p.sent_at ?? p.created_at) >= 2
  )
  const totalAttention = sentNoView.length + viewedNoResponse.length

  // ── Recent proposals ─────────────────────────────────────────────────────────
  const recentProposals = proposals.slice(0, 5)

  const cardCls = 'bg-white border border-gray-100 rounded-xl shadow-[0_1px_2px_0_rgba(0,0,0,0.04)]'

  return (
    <div className="p-4 md:p-6 max-w-6xl space-y-3">

      <Suspense fallback={null}>
        <UpgradedBanner />
      </Suspense>

      {/* ── Header ── */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-base font-semibold text-gray-900">Olá, {firstName}!</p>
          <p className="text-[11px] text-gray-400 mt-0.5">{fmtFullDate(now)}</p>
        </div>
        <Link
          href="/propostas/new"
          className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-[#1D9E75] text-white text-xs font-semibold rounded-lg hover:bg-[#188f68] transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Nova Proposta
        </Link>
      </div>

      {/* Upgrade banner */}
      {showUpgradeBanner && (
        <div className="flex items-center justify-between gap-3 px-4 py-3 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-xs text-amber-800">
            <strong>{usedThisMonth} de 5</strong> propostas usadas este mês.{' '}
            Faça upgrade para enviar ilimitadas.
          </p>
          <Link href="/configuracoes?tab=plano"
            className="shrink-0 px-3 py-1 bg-[#1D9E75] text-white text-xs font-semibold rounded-lg hover:bg-[#188f68] transition-colors">
            Upgrade →
          </Link>
        </div>
      )}

      {/* ── 4 Metric cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">

        {/* Valor aprovado */}
        <div className="bg-[#1D9E75] rounded-xl p-3 text-white shadow-[0_1px_2px_0_rgba(0,0,0,0.06)]">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-emerald-100 mb-1.5">Valor aprovado</p>
          <p className="text-xl font-bold leading-tight tabular-nums">{fmtBRL(totalApprovedValue)}</p>
          <p className="text-[11px] text-emerald-200 mt-1">
            {approvedCount} proposta{approvedCount !== 1 ? 's' : ''} aprovada{approvedCount !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Propostas abertas */}
        <div className={cardCls + ' p-3'}>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-1.5">Abertas</p>
          <p className="text-xl font-bold text-gray-900 leading-tight">{openCount}</p>
          <p className="text-[11px] text-gray-400 mt-1">enviadas + visualizadas</p>
        </div>

        {/* Taxa de aprovação */}
        <div className={cardCls + ' p-3'}>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-1.5">Taxa de aprovação</p>
          <p className="text-xl font-bold text-gray-900 leading-tight">
            {approvalRate !== null ? `${approvalRate}%` : '—'}
          </p>
          <p className="text-[11px] text-gray-400 mt-1">últimos 30 dias</p>
        </div>

        {/* Criadas este mês */}
        <div className={cardCls + ' p-3'}>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-1.5">Este mês</p>
          <p className="text-xl font-bold text-gray-900 leading-tight">{usedThisMonth}</p>
          <p className="text-[11px] text-gray-400 mt-1">
            {isPro ? 'ilimitado (Pro)' : `free: ${usedThisMonth} / 5`}
          </p>
        </div>

      </div>

      {/* ── 3-column row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-3 items-start">

        {/* ── Col 1 (2fr): Atenção necessária ── */}
        <div className={cardCls + ' lg:col-span-2'}>
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-50">
            <h2 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Atenção necessária</h2>
            {totalAttention > 0 && (
              <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-amber-400 text-white text-[10px] font-bold flex items-center justify-center">
                {totalAttention}
              </span>
            )}
          </div>

          {totalAttention === 0 ? (
            <div className="px-4 py-3">
              <p className="text-xs text-gray-400">Tudo em dia — nenhuma proposta precisa de atenção.</p>
            </div>
          ) : (
            <ul>
              {sentNoView.map(p => (
                <li key={p.id} className="border-b border-gray-50 last:border-0">
                  <Link href={`/propostas/${p.id}`} className="flex items-center gap-2.5 px-4 py-2.5 hover:bg-amber-50/60 transition-colors">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-900 truncate">{p.title}</p>
                      <p className="text-[11px] text-gray-400 mt-0.5">
                        Enviada há {daysSince(p.sent_at ?? p.created_at)} dias sem visualização
                        {clientName(p) ? ` · ${clientName(p)}` : ''}
                      </p>
                    </div>
                  </Link>
                </li>
              ))}
              {viewedNoResponse.map(p => (
                <li key={p.id} className="border-b border-gray-50 last:border-0">
                  <Link href={`/propostas/${p.id}`} className="flex items-center gap-2.5 px-4 py-2.5 hover:bg-blue-50/60 transition-colors">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-900 truncate">{p.title}</p>
                      <p className="text-[11px] text-gray-400 mt-0.5">
                        Visualizada há {daysSince(p.sent_at ?? p.created_at)} dias sem resposta
                        {clientName(p) ? ` · ${clientName(p)}` : ''}
                      </p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* ── Col 2 (2fr): Propostas recentes ── */}
        <div className={cardCls + ' lg:col-span-2'}>
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-50">
            <h2 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Propostas recentes</h2>
            <Link href="/propostas" className="text-[11px] text-[#1D9E75] font-medium hover:underline shrink-0">
              Ver todas →
            </Link>
          </div>

          {recentProposals.length === 0 ? (
            <div className="px-4 py-3">
              <p className="text-xs text-gray-400">Nenhuma proposta ainda.{' '}
                <Link href="/propostas/new" className="text-[#1D9E75] hover:underline">Criar →</Link>
              </p>
            </div>
          ) : (
            <ul>
              {recentProposals.map(p => {
                const cfg  = STATUS_CONFIG[p.status as StatusKey] ?? STATUS_CONFIG.rascunho
                const name = clientName(p)
                return (
                  <li key={p.id} className="border-b border-gray-50 last:border-0">
                    <Link href={`/propostas/${p.id}`} className="flex items-center justify-between gap-3 px-4 py-2.5 hover:bg-gray-50/60 transition-colors">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-900 truncate">{p.title}</p>
                        <p className="text-[11px] text-gray-400 mt-0.5 truncate">
                          {p.value !== null ? fmtBRL(p.value) : '—'}
                          {name ? ` · ${name}` : ''}
                        </p>
                      </div>
                      <span className={`shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${cfg.bgCls} ${cfg.textCls}`}>
                        {cfg.label}
                      </span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          )}
        </div>

        {/* ── Col 3 (1fr): Por status ── */}
        <div className={cardCls + ' lg:col-span-1'}>
          <div className="px-4 py-2.5 border-b border-gray-50">
            <h2 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Por status</h2>
          </div>
          <ul>
            {STATUS_ORDER.map(key => {
              const cfg   = STATUS_CONFIG[key]
              const count = counts[key] ?? 0
              return (
                <li key={key} className="border-b border-gray-50 last:border-0">
                  <Link href={`/propostas?status=${key}`}
                    className="flex items-center justify-between px-4 py-2 hover:bg-gray-50/60 transition-colors">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${cfg.bgCls} ${cfg.textCls}`}>
                      {cfg.label}
                    </span>
                    <span className={`text-xs font-bold tabular-nums ${count > 0 ? 'text-gray-800' : 'text-gray-300'}`}>
                      {count}
                    </span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>

      </div>

    </div>
  )
}
