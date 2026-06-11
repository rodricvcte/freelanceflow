import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase-server'

// ─── Types ────────────────────────────────────────────────────────────────────

type ProposalRow = {
  id: string
  title: string
  value: number | null
  status: string
  created_at: string
  sent_at: string | null
  clients: { name: string } | { name: string }[] | null
}

type FollowUpRow = {
  id: string
  type: 'email' | 'whatsapp'
  proposals: { id: string; title: string } | { id: string; title: string }[] | null
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const STATUS_CONFIG = {
  rascunho:    { label: 'Rascunho',    textCls: 'text-gray-600',    bgCls: 'bg-gray-100',    dotCls: 'bg-gray-400'    },
  enviada:     { label: 'Enviada',     textCls: 'text-blue-700',    bgCls: 'bg-blue-100',    dotCls: 'bg-blue-500'    },
  visualizada: { label: 'Visualizada', textCls: 'text-yellow-700',  bgCls: 'bg-yellow-100',  dotCls: 'bg-yellow-500'  },
  aprovada:    { label: 'Aprovada',    textCls: 'text-emerald-700', bgCls: 'bg-emerald-100', dotCls: 'bg-emerald-500' },
  reprovada:   { label: 'Reprovada',   textCls: 'text-red-700',     bgCls: 'bg-red-100',     dotCls: 'bg-red-500'     },
  expirada:    { label: 'Expirada',    textCls: 'text-orange-700',  bgCls: 'bg-orange-100',  dotCls: 'bg-orange-500'  },
  cancelada:   { label: 'Cancelada',   textCls: 'text-red-900',     bgCls: 'bg-red-200',     dotCls: 'bg-red-800'     },
} as const

type StatusKey = keyof typeof STATUS_CONFIG

function fmtBRL(v: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)
}

function fmtDate(iso: string) {
  const [y, m, d] = iso.split('T')[0].split('-').map(Number)
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short' }).format(new Date(y, m - 1, d))
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
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const endOfToday = new Date()
  endOfToday.setHours(23, 59, 59, 999)

  // Parallel fetches
  const [profileRes, proposalsRes, followUpsRes] = await Promise.all([
    supabase
      .from('profiles')
      .select('full_name, business_name')
      .eq('id', user.id)
      .single(),

    supabase
      .from('proposals')
      .select('id, title, value, status, created_at, sent_at, clients(name)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false }),

    supabase
      .from('follow_ups')
      .select('id, type, proposals(id, title)')
      .eq('user_id', user.id)
      .is('sent_at', null)
      .lte('scheduled_for', endOfToday.toISOString())
      .order('scheduled_for', { ascending: true }),
  ])

  const profile   = profileRes.data
  const proposals = (proposalsRes.data ?? []) as ProposalRow[]
  const followUps = (followUpsRes.data ?? []) as FollowUpRow[]

  const firstName = profile?.business_name?.split(' ')[0]
    ?? profile?.full_name?.split(' ')[0]
    ?? 'Freelancer'

  // ── Derived counts ──────────────────────────────────────────────────────────
  const counts = proposals.reduce<Record<string, number>>((acc, p) => {
    acc[p.status] = (acc[p.status] ?? 0) + 1
    return acc
  }, {})

  const totalApproved = proposals
    .filter(p => p.status === 'aprovada')
    .reduce((sum, p) => sum + (p.value ?? 0), 0)

  const recentProposals = proposals.slice(0, 5)

  // ── Attention items ─────────────────────────────────────────────────────────
  const sentNoView = proposals.filter(p =>
    p.status === 'enviada' && daysSince(p.sent_at ?? p.created_at) >= 5
  )
  const viewedNoResponse = proposals.filter(p =>
    p.status === 'visualizada' && daysSince(p.created_at) >= 2
  )
  const totalAttention = sentNoView.length + viewedNoResponse.length + followUps.length

  // ── Status card rows ────────────────────────────────────────────────────────
  const statusCards: StatusKey[] = ['rascunho', 'enviada', 'visualizada', 'aprovada', 'reprovada', 'expirada', 'cancelada']

  return (
    <div className="p-6 md:p-8 max-w-6xl">

      {/* ── Greeting ── */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Olá, {firstName}!</h1>
        <p className="text-sm text-gray-500 mt-1">Aqui está o resumo das suas propostas.</p>
      </div>

      {/* ── Featured stat: Valor aprovado ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
        <div className="bg-[#1D9E75] rounded-2xl p-6 text-white shadow-sm sm:col-span-1">
          <p className="text-xs font-semibold uppercase tracking-widest text-emerald-100 mb-2">Valor aprovado</p>
          <p className="text-3xl font-extrabold leading-none">{fmtBRL(totalApproved)}</p>
          <p className="text-xs text-emerald-200 mt-2">
            {counts['aprovada'] ?? 0} proposta{(counts['aprovada'] ?? 0) !== 1 ? 's' : ''} aprovada{(counts['aprovada'] ?? 0) !== 1 ? 's' : ''}
          </p>
        </div>

        <div className="sm:col-span-2 grid grid-cols-2 gap-3">
          {(['enviada', 'visualizada', 'reprovada', 'expirada'] as StatusKey[]).map(key => {
            const cfg = STATUS_CONFIG[key]
            const count = counts[key] ?? 0
            return (
              <Link
                key={key}
                href={`/propostas?status=${key}`}
                className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow"
              >
                <p className="text-xs text-gray-400 mb-1">{cfg.label}</p>
                <div className="flex items-end gap-2">
                  <span className={`text-2xl font-bold ${cfg.textCls}`}>{count}</span>
                  <span className={`text-xs font-medium px-1.5 py-0.5 rounded-full mb-0.5 ${cfg.bgCls} ${cfg.textCls}`}>
                    {count === 1 ? 'proposta' : 'propostas'}
                  </span>
                </div>
              </Link>
            )
          })}
        </div>
      </div>

      {/* ── Remaining status counts ── */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        {(['rascunho', 'cancelada'] as StatusKey[]).map(key => {
          const cfg = STATUS_CONFIG[key]
          const count = counts[key] ?? 0
          return (
            <Link
              key={key}
              href={`/propostas?status=${key}`}
              className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow"
            >
              <p className="text-xs text-gray-400 mb-1">{cfg.label}</p>
              <span className={`text-2xl font-bold ${cfg.textCls}`}>{count}</span>
            </Link>
          )
        })}
        {/* Total geral */}
        <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
          <p className="text-xs text-gray-400 mb-1">Total</p>
          <span className="text-2xl font-bold text-gray-900">{proposals.length}</span>
        </div>
      </div>

      {/* ── Two-column bottom ── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

        {/* Atenção necessária */}
        <div className="lg:col-span-3 bg-white rounded-xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
            <div>
              <h2 className="text-sm font-semibold text-gray-900">Atenção necessária</h2>
              <p className="text-xs text-gray-400 mt-0.5">Propostas que precisam de acompanhamento</p>
            </div>
            {totalAttention > 0 && (
              <span className="w-5 h-5 rounded-full bg-amber-400 text-white text-xs font-bold flex items-center justify-center shrink-0">
                {totalAttention}
              </span>
            )}
          </div>

          {totalAttention === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center px-5">
              <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-sm text-gray-500">Tudo em dia!</p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-50">
              {sentNoView.map(p => (
                <li key={p.id}>
                  <Link href={`/propostas/${p.id}`} className="flex items-start gap-3 px-5 py-3.5 hover:bg-amber-50 transition-colors">
                    <div className="w-2 h-2 rounded-full bg-blue-400 shrink-0 mt-1.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{p.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Enviada há {daysSince(p.sent_at ?? p.created_at)} dias sem visualização
                        {clientName(p) ? ` · ${clientName(p)}` : ''}
                      </p>
                    </div>
                    <span className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full shrink-0 font-medium">Enviada</span>
                  </Link>
                </li>
              ))}
              {viewedNoResponse.map(p => (
                <li key={p.id}>
                  <Link href={`/propostas/${p.id}`} className="flex items-start gap-3 px-5 py-3.5 hover:bg-amber-50 transition-colors">
                    <div className="w-2 h-2 rounded-full bg-yellow-400 shrink-0 mt-1.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{p.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Visualizada há {daysSince(p.created_at)} dias sem resposta
                        {clientName(p) ? ` · ${clientName(p)}` : ''}
                      </p>
                    </div>
                    <span className="text-xs text-yellow-700 bg-yellow-100 px-2 py-0.5 rounded-full shrink-0 font-medium">Visualizada</span>
                  </Link>
                </li>
              ))}
              {followUps.map(fu => {
                const prop = Array.isArray(fu.proposals) ? fu.proposals[0] : fu.proposals
                return (
                  <li key={fu.id}>
                    <Link href={prop ? `/propostas/${prop.id}` : '/propostas'} className="flex items-start gap-3 px-5 py-3.5 hover:bg-amber-50 transition-colors">
                      <div className="w-2 h-2 rounded-full bg-orange-400 shrink-0 mt-1.5" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {prop?.title ?? 'Follow-up pendente'}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          Follow-up via {fu.type === 'whatsapp' ? 'WhatsApp' : 'e-mail'} para hoje
                        </p>
                      </div>
                      <span className="text-xs text-orange-700 bg-orange-100 px-2 py-0.5 rounded-full shrink-0 font-medium">Hoje</span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          )}
        </div>

        {/* Propostas recentes */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
            <div>
              <h2 className="text-sm font-semibold text-gray-900">Propostas recentes</h2>
              <p className="text-xs text-gray-400 mt-0.5">Últimas criadas</p>
            </div>
            <Link href="/propostas" className="text-xs text-[#1D9E75] font-medium hover:underline shrink-0">
              Ver todas →
            </Link>
          </div>

          {recentProposals.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center px-5">
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-sm text-gray-500">Nenhuma proposta ainda</p>
              <Link href="/propostas/new" className="mt-3 text-xs font-medium text-[#1D9E75] hover:underline">
                Criar primeira proposta →
              </Link>
            </div>
          ) : (
            <ul className="divide-y divide-gray-50">
              {recentProposals.map(p => {
                const cfg = STATUS_CONFIG[p.status as StatusKey] ?? STATUS_CONFIG.rascunho
                const name = clientName(p)
                return (
                  <li key={p.id}>
                    <Link href={`/propostas/${p.id}`} className="flex items-start gap-3 px-5 py-3.5 hover:bg-gray-50 transition-colors">
                      <div className={`w-2 h-2 rounded-full ${cfg.dotCls} shrink-0 mt-1.5`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{p.title}</p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {name ? `${name} · ` : ''}{fmtDate(p.created_at)}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        {p.value !== null && (
                          <span className="text-xs font-semibold text-gray-700 tabular-nums">
                            {fmtBRL(p.value)}
                          </span>
                        )}
                        <span className={`text-xs font-medium px-1.5 py-0.5 rounded-full ${cfg.bgCls} ${cfg.textCls}`}>
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
    </div>
  )
}
