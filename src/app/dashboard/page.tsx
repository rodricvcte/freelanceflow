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

const STATUS_CONFIG: Record<StatusKey, { label: string; textCls: string; bgCls: string; dotCls: string }> = {
  rascunho:    { label: 'Rascunho',    textCls: 'text-gray-600',    bgCls: 'bg-gray-100',    dotCls: 'bg-gray-400'    },
  enviada:     { label: 'Enviada',     textCls: 'text-blue-700',    bgCls: 'bg-blue-100',    dotCls: 'bg-blue-500'    },
  visualizada: { label: 'Visualizada', textCls: 'text-yellow-700',  bgCls: 'bg-yellow-100',  dotCls: 'bg-yellow-500'  },
  aprovada:    { label: 'Aprovada',    textCls: 'text-emerald-700', bgCls: 'bg-emerald-100', dotCls: 'bg-emerald-500' },
  reprovada:   { label: 'Reprovada',   textCls: 'text-red-700',     bgCls: 'bg-red-100',     dotCls: 'bg-red-500'     },
  expirada:    { label: 'Expirada',    textCls: 'text-orange-700',  bgCls: 'bg-orange-100',  dotCls: 'bg-orange-500'  },
  cancelada:   { label: 'Cancelada',   textCls: 'text-red-900',     bgCls: 'bg-red-200',     dotCls: 'bg-red-800'     },
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmtBRL(v: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)
}

function fmtFullDate(date: Date): string {
  const raw = new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
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

  const now         = new Date()
  const monthStart  = new Date(now.getFullYear(), now.getMonth(), 1)
  const ago30       = new Date(now.getTime() - 30 * 86_400_000)

  // ── Derived metrics ──────────────────────────────────────────────────────────
  const counts = proposals.reduce<Record<string, number>>((acc, p) => {
    acc[p.status] = (acc[p.status] ?? 0) + 1
    return acc
  }, {})

  const approvedCount      = counts['aprovada'] ?? 0
  const totalApprovedValue = proposals
    .filter(p => p.status === 'aprovada')
    .reduce((sum, p) => sum + (p.value ?? 0), 0)

  const openCount = (counts['enviada'] ?? 0) + (counts['visualizada'] ?? 0)

  const recentClosed  = proposals.filter(p => new Date(p.created_at) >= ago30 && (p.status === 'aprovada' || p.status === 'reprovada'))
  const approvalRate  = recentClosed.length > 0
    ? Math.round((recentClosed.filter(p => p.status === 'aprovada').length / recentClosed.length) * 100)
    : null

  const usedThisMonth    = proposals.filter(p => new Date(p.created_at) >= monthStart).length
  const showUpgradeBanner = !isPro && usedThisMonth >= 4

  // ── Attention items ─────────────────────────────────────────────────────────
  const sentNoView = proposals.filter(p =>
    p.status === 'enviada' && daysSince(p.sent_at ?? p.created_at) >= 5
  )
  const viewedNoResponse = proposals.filter(p =>
    p.status === 'visualizada' && daysSince(p.sent_at ?? p.created_at) >= 2
  )
  const totalAttention = sentNoView.length + viewedNoResponse.length

  // ── Recent proposals ────────────────────────────────────────────────────────
  const recentProposals = proposals.slice(0, 5)

  return (
    <div className="p-6 md:p-8 max-w-6xl">

      {/* Upgraded banner — client, lê URL param */}
      <Suspense fallback={null}>
        <UpgradedBanner />
      </Suspense>

      {/* ── 1. Header ──────────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Olá, {firstName}!</h1>
          <p className="text-sm text-gray-500 mt-1">{fmtFullDate(now)}</p>
        </div>
        <Link
          href="/propostas/new"
          className="shrink-0 flex items-center gap-2 px-4 py-2 bg-[#1D9E75] text-white text-sm font-medium rounded-lg hover:bg-[#188f68] transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Nova Proposta
        </Link>
      </div>

      {/* Upgrade banner */}
      {showUpgradeBanner && (
        <div className="mb-6 flex items-center justify-between gap-4 px-5 py-4 bg-amber-50 border border-amber-200 rounded-xl">
          <div className="flex items-start gap-3 min-w-0">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 100 20A10 10 0 0012 2z" />
            </svg>
            <p className="text-sm text-amber-800">
              Você usou <strong>{usedThisMonth} de 5</strong> propostas este mês.
              Faça upgrade para Pro e envie propostas ilimitadas.
            </p>
          </div>
          <Link
            href="/configuracoes?tab=plano"
            className="shrink-0 px-4 py-2 bg-[#1D9E75] text-white text-xs font-semibold rounded-lg hover:bg-[#188f68] transition-colors whitespace-nowrap"
          >
            Upgrade Pro →
          </Link>
        </div>
      )}

      {/* ── 2. Métricas ────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">

        {/* Valor aprovado */}
        <div className="bg-[#1D9E75] rounded-xl p-5 text-white shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-emerald-100 mb-2">Valor aprovado</p>
          <p className="text-xl font-extrabold leading-tight tabular-nums">{fmtBRL(totalApprovedValue)}</p>
          <p className="text-xs text-emerald-200 mt-2">
            {approvedCount} proposta{approvedCount !== 1 ? 's' : ''} aprovada{approvedCount !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Propostas abertas */}
        <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-2">Propostas abertas</p>
          <p className="text-2xl font-extrabold text-gray-900 leading-tight">{openCount}</p>
          <p className="text-xs text-gray-400 mt-2">enviadas + visualizadas</p>
        </div>

        {/* Taxa de aprovação */}
        <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-2">Taxa de aprovação</p>
          <p className="text-2xl font-extrabold text-gray-900 leading-tight">
            {approvalRate !== null ? `${approvalRate}%` : '—'}
          </p>
          <p className="text-xs text-gray-400 mt-2">últimos 30 dias</p>
        </div>

        {/* Criadas este mês */}
        <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-2">Criadas este mês</p>
          <p className="text-2xl font-extrabold text-gray-900 leading-tight">{usedThisMonth}</p>
          <p className="text-xs text-gray-400 mt-2">
            {isPro ? 'plano pro: ilimitado' : `plano free: ${usedThisMonth} / 5`}
          </p>
        </div>

      </div>

      {/* ── 3. Duas colunas ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

        {/* Atenção necessária */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
            <h2 className="text-sm font-semibold text-gray-900">Atenção necessária</h2>
            {totalAttention > 0 && (
              <span className="min-w-[20px] h-5 px-1.5 rounded-full bg-amber-400 text-white text-xs font-bold flex items-center justify-center">
                {totalAttention}
              </span>
            )}
          </div>

          {totalAttention === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center px-5">
              <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-sm font-medium text-gray-700">Tudo em dia!</p>
              <p className="text-xs text-gray-400 mt-1">Nenhuma proposta precisa de atenção</p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-50">
              {sentNoView.map(p => (
                <li key={p.id}>
                  <Link href={`/propostas/${p.id}`} className="flex items-start gap-3 px-5 py-3.5 hover:bg-amber-50/70 transition-colors">
                    <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center shrink-0 mt-0.5">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{p.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Enviada há {daysSince(p.sent_at ?? p.created_at)} dias sem visualização
                        {clientName(p) ? ` · ${clientName(p)}` : ''}
                      </p>
                    </div>
                  </Link>
                </li>
              ))}
              {viewedNoResponse.map(p => (
                <li key={p.id}>
                  <Link href={`/propostas/${p.id}`} className="flex items-start gap-3 px-5 py-3.5 hover:bg-blue-50/70 transition-colors">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center shrink-0 mt-0.5">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{p.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
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

        {/* Por status */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
          <div className="px-5 py-4 border-b border-gray-50">
            <h2 className="text-sm font-semibold text-gray-900">Por status</h2>
          </div>
          <ul className="divide-y divide-gray-50">
            {STATUS_ORDER.map(key => {
              const cfg   = STATUS_CONFIG[key]
              const count = counts[key] ?? 0
              return (
                <li key={key}>
                  <Link
                    href={`/propostas?status=${key}`}
                    className="flex items-center justify-between px-5 py-3.5 hover:bg-gray-50 transition-colors"
                  >
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${cfg.bgCls} ${cfg.textCls}`}>
                      {cfg.label}
                    </span>
                    <span className={`text-sm font-bold tabular-nums ${count > 0 ? 'text-gray-900' : 'text-gray-300'}`}>
                      {count}
                    </span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>

      </div>

      {/* ── 4. Propostas recentes ───────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
          <h2 className="text-sm font-semibold text-gray-900">Propostas recentes</h2>
          <Link href="/propostas" className="text-xs text-[#1D9E75] font-medium hover:underline shrink-0">
            Ver todas →
          </Link>
        </div>

        {recentProposals.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center px-5">
            <p className="text-sm text-gray-500">Nenhuma proposta ainda</p>
            <Link href="/propostas/new" className="mt-3 text-xs font-medium text-[#1D9E75] hover:underline">
              Criar primeira proposta →
            </Link>
          </div>
        ) : (
          <ul className="divide-y divide-gray-50">
            {recentProposals.map(p => {
              const cfg  = STATUS_CONFIG[p.status as StatusKey] ?? STATUS_CONFIG.rascunho
              const name = clientName(p)
              return (
                <li key={p.id}>
                  <Link href={`/propostas/${p.id}`} className="flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50 transition-colors">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{p.title}</p>
                      <div className="flex items-center gap-2 mt-0.5 min-w-0">
                        {name && (
                          <span className="text-xs text-gray-400 truncate">{name}</span>
                        )}
                        {p.proposal_number && (
                          <>
                            {name && <span className="text-gray-300 text-xs shrink-0">·</span>}
                            <span className="font-mono text-[11px] text-[#1D9E75] font-semibold shrink-0">
                              {p.proposal_number}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      {p.value !== null && (
                        <span className="text-sm font-semibold text-gray-700 tabular-nums">
                          {fmtBRL(p.value)}
                        </span>
                      )}
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${cfg.bgCls} ${cfg.textCls}`}>
                        {cfg.label}
                      </span>
                    </div>
                  </Link>
                </li>
              )
            })}
          </ul>
        )}
      </div>

    </div>
  )
}
