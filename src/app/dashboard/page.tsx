import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import { unstable_noStore as noStore } from 'next/cache'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import UpgradedBanner from '@/components/UpgradedBanner'
import BarChartCard  from '@/components/dashboard/BarChartCard'
import DoughnutCard  from '@/components/dashboard/DoughnutCard'

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
  rascunho:    { label: 'Rascunho',    textCls: 'text-gray-500',    bgCls: 'bg-gray-100'    },
  enviada:     { label: 'Enviada',     textCls: 'text-blue-700',    bgCls: 'bg-blue-100'    },
  visualizada: { label: 'Visualizada', textCls: 'text-yellow-700',  bgCls: 'bg-yellow-100'  },
  aprovada:    { label: 'Aprovada',    textCls: 'text-emerald-700', bgCls: 'bg-emerald-100' },
  reprovada:   { label: 'Reprovada',   textCls: 'text-red-700',     bgCls: 'bg-red-100'     },
  expirada:    { label: 'Expirada',    textCls: 'text-orange-700',  bgCls: 'bg-orange-100'  },
  cancelada:   { label: 'Cancelada',   textCls: 'text-red-900',     bgCls: 'bg-red-200'     },
}

const DOUGHNUT_STATUSES = ['aprovada', 'enviada', 'rascunho', 'reprovada'] as const
const DOUGHNUT_LABELS   = ['Aprovada', 'Enviada', 'Rascunho', 'Reprovada']
const DOUGHNUT_COLORS   = ['#1D9E75', '#378ADD', '#B4B2A9', '#E24B4A']

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

function trunc(s: string, n: number) {
  return s.length > n ? s.slice(0, n) + '…' : s
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function DashboardPage() {
  noStore()
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [profileRes, proposalsRes, subRes, followUpsRes] = await Promise.all([
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
    supabase
      .from('follow_ups')
      .select('id, type, trigger_rule, scheduled_for, proposals(id, title)')
      .eq('user_id', user.id)
      .is('sent_at', null)
      .order('scheduled_for', { ascending: true, nullsFirst: false }),
  ])

  const profile   = profileRes.data
  const proposals = (proposalsRes.data ?? []) as ProposalRow[]
  const sub       = subRes.data
  type FupRow = {
    id: string
    type: 'email' | 'whatsapp'
    trigger_rule: string | null
    scheduled_for: string | null
    proposals: { id: string; title: string } | { id: string; title: string }[] | null
  }
  const followUpsRaw = (followUpsRes.data ?? []) as unknown as FupRow[]
  const followUps = followUpsRaw.map(f => ({
    ...f,
    proposals: Array.isArray(f.proposals) ? (f.proposals[0] ?? null) : f.proposals,
  })) as { id: string; type: 'email' | 'whatsapp'; trigger_rule: string | null; scheduled_for: string | null; proposals: { id: string; title: string } | null }[]

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
    new Date(p.created_at) >= ago30 &&
    (p.status === 'aprovada' || p.status === 'reprovada')
  )
  const approvalRate = recentClosed.length > 0
    ? Math.round(recentClosed.filter(p => p.status === 'aprovada').length / recentClosed.length * 100)
    : null

  const usedThisMonth     = proposals.filter(p => new Date(p.created_at) >= monthStart).length
  const showUpgradeBanner = !isPro && usedThisMonth >= 4

  // ── Chart data ───────────────────────────────────────────────────────────────
  const barLabels: string[] = []
  const barData: number[]   = []
  for (let i = 5; i >= 0; i--) {
    const d   = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    barLabels.push(d.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', ''))
    barData.push(proposals.filter(p => p.created_at.startsWith(key)).length)
  }

  const doughnutData = DOUGHNUT_STATUSES.map(s =>
    proposals.filter(p => p.status === s).reduce((sum, p) => sum + (p.value ?? 0), 0)
  )

  // ── Attention items ──────────────────────────────────────────────────────────
  const sentNoView = proposals.filter(p =>
    p.status === 'enviada' && daysSince(p.sent_at ?? p.created_at) >= 5
  )
  const viewedNoResponse = proposals.filter(p =>
    p.status === 'visualizada' && daysSince(p.sent_at ?? p.created_at) >= 2
  )

  // IDs já cobertos pelas regras de tempo para não duplicar
  const attentionIds = new Set([...sentNoView, ...viewedNoResponse].map(p => p.id))

  // Follow-ups pendentes de propostas que ainda não aparecem pelas regras acima
  const pendingFups = followUps.filter(f => f.proposals && !attentionIds.has(f.proposals.id))

  const totalAttention = sentNoView.length + viewedNoResponse.length + pendingFups.length

  // ── Recent proposals ─────────────────────────────────────────────────────────
  const recentProposals = proposals.slice(0, 5)

  // ── Shared card class ────────────────────────────────────────────────────────
  const card = 'bg-white rounded-[10px] border border-gray-100'

  return (
    <div className="p-6 md:p-8 max-w-[1200px]">

      <Suspense fallback={null}>
        <UpgradedBanner />
      </Suspense>

      {/* ── Header ────────────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4 mb-7">
        <div>
          <h1 className="text-[18px] font-medium text-gray-900 leading-snug">
            Olá, {firstName}!
          </h1>
          <p className="text-[12px] text-gray-400 mt-0.5">{fmtFullDate(now)}</p>
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

      {/* Upgrade alert */}
      {showUpgradeBanner && (
        <div className="mb-6 flex items-center justify-between gap-4 px-4 py-3 bg-amber-50 border border-amber-200 rounded-[10px]">
          <p className="text-sm text-amber-800">
            Você usou <strong>{usedThisMonth} de 5</strong> propostas este mês.
            Faça upgrade para Pro e envie propostas ilimitadas.
          </p>
          <Link
            href="/configuracoes?tab=plano"
            className="shrink-0 px-4 py-1.5 bg-[#1D9E75] text-white text-xs font-semibold rounded-lg hover:bg-[#188f68] transition-colors whitespace-nowrap"
          >
            Upgrade Pro →
          </Link>
        </div>
      )}

      {/* ── Métricas (4 cards) ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-[10px] mb-5">

        {/* Valor aprovado */}
        <div className="rounded-[8px] px-[14px] py-3" style={{ background: 'var(--color-background-secondary)' }}>
          <p className="text-xs font-medium text-gray-400 mb-1.5">Valor aprovado</p>
          <p className="text-2xl font-bold leading-tight tabular-nums text-[#1D9E75]">
            {fmtBRL(totalApprovedValue)}
          </p>
          <p className="text-xs text-gray-400 mt-1.5">
            {approvedCount} aprovada{approvedCount !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Em aberto */}
        <div className="rounded-[8px] px-[14px] py-3" style={{ background: 'var(--color-background-secondary)' }}>
          <p className="text-xs font-medium text-gray-400 mb-1.5">Em aberto</p>
          <p className="text-2xl font-bold text-gray-900 leading-tight">{openCount}</p>
          <p className="text-xs text-gray-400 mt-1.5">enviadas + visualizadas</p>
        </div>

        {/* Taxa de aprovação */}
        <div className="rounded-[8px] px-[14px] py-3" style={{ background: 'var(--color-background-secondary)' }}>
          <p className="text-xs font-medium text-gray-400 mb-1.5">Taxa de aprovação</p>
          <p className="text-2xl font-bold text-gray-900 leading-tight">
            {approvalRate !== null ? `${approvalRate}%` : '—'}
          </p>
          <p className="text-xs text-gray-400 mt-1.5">últimos 30 dias</p>
        </div>

        {/* Este mês */}
        <div className="rounded-[8px] px-[14px] py-3" style={{ background: 'var(--color-background-secondary)' }}>
          <p className="text-xs font-medium text-gray-400 mb-1.5">Este mês</p>
          <p className="text-2xl font-bold text-gray-900 leading-tight">{usedThisMonth}</p>
          <p className="text-xs text-gray-400 mt-1.5">
            {isPro ? 'plano pro: ilimitado' : `free: ${usedThisMonth}/5`}
          </p>
        </div>

      </div>

      {/* ── Linha 3: Gráfico barras | Valor em negociação | Por status ─────── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr_180px] gap-[10px] mb-[10px]">

        {/* Propostas por mês */}
        <BarChartCard labels={barLabels} data={barData} />

        {/* Valor em negociação */}
        <DoughnutCard
          labels={DOUGHNUT_LABELS}
          data={doughnutData}
          colors={DOUGHNUT_COLORS}
        />

        {/* Por status */}
        <div className={card}>
          <div className="px-3 py-3.5 border-b border-gray-50">
            <h2 className="text-sm font-medium text-gray-600">Por status</h2>
          </div>
          <ul className="divide-y divide-gray-50">
            {STATUS_ORDER.map(key => {
              const cfg   = STATUS_CONFIG[key]
              const count = counts[key] ?? 0
              return (
                <li key={key}>
                  <Link
                    href={`/propostas?status=${key}`}
                    className="flex items-center justify-between px-3 py-2 hover:bg-gray-50 transition-colors"
                  >
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${cfg.bgCls} ${cfg.textCls}`}>
                      {cfg.label}
                    </span>
                    <span className={`text-[13px] font-semibold tabular-nums ${count > 0 ? 'text-gray-900' : 'text-gray-300'}`}>
                      {count}
                    </span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>

      </div>

      {/* ── Linha 4: Propostas recentes | Atenção necessária ────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_320px] gap-[10px] items-start">

        {/* Propostas recentes */}
        <div className={card}>
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-50">
            <h2 className="text-sm font-medium text-gray-600">Propostas recentes</h2>
            <Link href="/propostas" className="text-xs text-[#1D9E75] font-medium hover:underline shrink-0">
              Ver todas →
            </Link>
          </div>

          {recentProposals.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center px-4">
              <p className="text-sm text-gray-400">Nenhuma proposta ainda</p>
              <Link href="/propostas/new" className="mt-2 text-xs font-medium text-[#1D9E75] hover:underline">
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
                    <Link
                      href={`/propostas/${p.id}`}
                      className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-medium text-gray-900 truncate leading-snug">
                          {trunc(p.title, 40)}
                        </p>
                        <div className="flex items-center gap-1 mt-0.5 min-w-0">
                          {p.proposal_number && (
                            <span className="font-mono text-[11px] text-gray-400 shrink-0">
                              {p.proposal_number}
                            </span>
                          )}
                          {name && (
                            <>
                              {p.proposal_number && <span className="text-gray-300 text-[11px] shrink-0">·</span>}
                              <span className="text-[11px] text-gray-400 truncate">{name}</span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {p.value !== null && (
                          <span className="text-[13px] font-semibold text-gray-700 tabular-nums">
                            {fmtBRL(p.value)}
                          </span>
                        )}
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${cfg.bgCls} ${cfg.textCls}`}>
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

        {/* Atenção necessária */}
        <div className={card}>
          <div className="flex items-center justify-between px-4 py-3.5 border-b border-gray-50">
            <h2 className="text-sm font-medium text-gray-600">Atenção necessária</h2>
            {totalAttention > 0 && (
              <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-amber-400 text-white text-[10px] font-bold flex items-center justify-center">
                {totalAttention}
              </span>
            )}
          </div>

          {totalAttention === 0 ? (
            <div className="px-4 py-5 text-center">
              <p className="text-[11px] text-gray-400">Tudo em dia</p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-50">
              {sentNoView.map(p => (
                <li key={p.id}>
                  <Link href={`/propostas/${p.id}`} className="flex items-start gap-2.5 px-4 py-3 hover:bg-amber-50/60 transition-colors">
                    <span className="mt-1.5 w-[6px] h-[6px] rounded-full bg-amber-400 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] font-medium text-gray-800 truncate leading-snug">{trunc(p.title, 32)}</p>
                      <p className="text-[11px] text-gray-400 mt-0.5 leading-snug">
                        Enviada há {daysSince(p.sent_at ?? p.created_at)}d sem visualização
                      </p>
                    </div>
                  </Link>
                </li>
              ))}
              {viewedNoResponse.map(p => (
                <li key={p.id}>
                  <Link href={`/propostas/${p.id}`} className="flex items-start gap-2.5 px-4 py-3 hover:bg-blue-50/60 transition-colors">
                    <span className="mt-1.5 w-[6px] h-[6px] rounded-full bg-blue-400 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] font-medium text-gray-800 truncate leading-snug">{trunc(p.title, 32)}</p>
                      <p className="text-[11px] text-gray-400 mt-0.5 leading-snug">
                        Visualizada há {daysSince(p.sent_at ?? p.created_at)}d sem resposta
                      </p>
                    </div>
                  </Link>
                </li>
              ))}
              {pendingFups.map(f => {
                const p = f.proposals!
                const label = f.type === 'whatsapp' ? 'WhatsApp' : 'Email'
                const overdue = f.scheduled_for && new Date(f.scheduled_for) < now
                return (
                  <li key={f.id}>
                    <Link href={`/propostas/${p.id}`} className="flex items-start gap-2.5 px-4 py-3 hover:bg-gray-50 transition-colors">
                      <span className={`mt-1.5 w-[6px] h-[6px] rounded-full shrink-0 ${overdue ? 'bg-red-400' : 'bg-[#1D9E75]'}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] font-medium text-gray-800 truncate leading-snug">{trunc(p.title, 32)}</p>
                        <p className="text-[11px] text-gray-400 mt-0.5 leading-snug">
                          Follow-up ({label}) pendente{overdue ? ' · atrasado' : ''}
                        </p>
                      </div>
                    </Link>
                  </li>
                )
              })}
            </ul>
          )}
        </div>

      </div>

    </div>
  )
}
