import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import ProposalActions from '@/components/proposals/ProposalActions'
import type {
  Section,
  TextSection,
  ScopeSection,
  ItemsSection,
  HoursSection,
  InstallmentsSection,
  ClausesSection,
  ImageSection,
} from '@/components/proposals/ProposalPDF'

export const dynamic = 'force-dynamic'

// ─── Types ──────────────────────────────────────────────────────────────────

type ProposalRow = {
  id: string
  title: string
  service_description: string | null
  value: number | null
  payment_terms: string | null
  deadline_days: number | null
  valid_until: string | null
  status: string
  pdf_url: string | null
  token: string
  proposal_number: string | null
  version: number
  created_at: string
  sections: Section[]
  client_id: string | null
  clients: { id: string; name: string; email: string | null; phone: string | null } | null
}

type EventRow = {
  id: string
  event_type: string
  metadata: Record<string, unknown>
  created_at: string
}

type FollowUpRow = {
  id: string
  type: 'whatsapp' | 'email'
  trigger_rule: string | null
  scheduled_for: string | null
  created_at: string
}

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_CONFIG = {
  rascunho:    { label: 'Rascunho',    cls: 'bg-gray-100 text-gray-500'          },
  enviada:     { label: 'Enviada',     cls: 'bg-blue-100 text-blue-700'           },
  visualizada: { label: 'Visualizada', cls: 'bg-yellow-100 text-yellow-700'       },
  aprovada:    { label: 'Aprovada',    cls: 'bg-[#1D9E75]/10 text-[#1D9E75]'     },
  reprovada:   { label: 'Reprovada',   cls: 'bg-red-100 text-red-700'             },
  expirada:    { label: 'Expirada',    cls: 'bg-orange-100 text-orange-700'       },
  cancelada:   { label: 'Cancelada',   cls: 'bg-red-200 text-red-900'             },
} as const

const EVENT_CONFIG: Record<string, { label: string; dot: string; line: string }> = {
  created:  { label: 'Proposta criada',          dot: 'bg-gray-400',   line: 'bg-gray-100' },
  sent:     { label: 'Proposta enviada',         dot: 'bg-blue-400',   line: 'bg-blue-100' },
  viewed:   { label: 'Visualizada pelo cliente', dot: 'bg-yellow-400', line: 'bg-yellow-100' },
  accepted: { label: 'Proposta aceita',          dot: 'bg-[#1D9E75]',  line: 'bg-emerald-100' },
  declined: { label: 'Proposta recusada',        dot: 'bg-red-400',    line: 'bg-red-100'  },
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmtBRL(v: number | null) {
  if (v === null) return '—'
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)
}

function fmtDate(iso: string | null) {
  if (!iso) return '—'
  const [y, m, d] = iso.split('T')[0].split('-').map(Number)
  return new Intl.DateTimeFormat('pt-BR').format(new Date(y, m - 1, d))
}

function fmtDateTime(iso: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  }).format(new Date(iso))
}

function fmtRowBRL(v: string | number | null | undefined) {
  const n = v === null || v === undefined ? null : typeof v === 'string' ? parseFloat(v) : v
  return fmtBRL(n !== null && !isNaN(n) ? n : null)
}

function parseNum(v: string | undefined | null): number {
  if (!v) return 0
  const n = parseFloat(String(v).replace(',', '.'))
  return isNaN(n) ? 0 : n
}

// ─── Section card ─────────────────────────────────────────────────────────────

function SectionCard({ section }: { section: Section }) {
  const header = (title: string) => (
    <div className="flex items-center gap-3 px-4 pt-3.5 pb-3 border-b border-gray-50">
      <span className="w-[3px] h-[18px] bg-[#1D9E75] rounded-sm shrink-0" />
      <h3 className="text-[13px] font-medium text-gray-900">{title}</h3>
    </div>
  )

  const body = 'px-4 py-[14px] text-[13px] leading-[1.65] text-gray-700'
  const wrap = 'bg-white rounded-[10px] border border-gray-100'

  if (section.type === 'text') {
    const s = section as TextSection
    return (
      <div className={wrap}>
        {header(s.title)}
        <div className={body}>
          <p className="whitespace-pre-wrap">{s.content}</p>
        </div>
      </div>
    )
  }

  if (section.type === 'scope') {
    const s = section as ScopeSection
    return (
      <div className={wrap}>
        {header(s.title)}
        <div className={body}>
          <ul className="space-y-1.5">
            {s.items.map((item, i) => (
              <li key={i} className="flex gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#1D9E75] shrink-0 mt-[7px]" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    )
  }

  if (section.type === 'items') {
    const s = section as ItemsSection
    const rowTotals  = s.rows.map(r => parseNum(r.quantity) * parseNum(r.unit_price))
    const grandTotal = rowTotals.reduce((a, b) => a + b, 0)
    return (
      <div className={`${wrap} overflow-x-auto`}>
        {header(s.title)}
        <div className={body + ' p-0'}>
          <table className="w-full text-[13px] min-w-[480px]">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-400 uppercase tracking-wide">Descrição</th>
                <th className="text-center px-4 py-2.5 text-xs font-semibold text-gray-400 uppercase tracking-wide w-16">Qtd</th>
                <th className="text-right px-4 py-2.5 text-xs font-semibold text-gray-400 uppercase tracking-wide">Valor unit.</th>
                <th className="text-right px-4 py-2.5 text-xs font-semibold text-gray-400 uppercase tracking-wide">Total</th>
              </tr>
            </thead>
            <tbody>
              {s.rows.map((row, i) => (
                <tr key={i} className={i % 2 !== 0 ? 'bg-gray-50/60' : ''}>
                  <td className="px-4 py-2.5 text-gray-700">{row.description}</td>
                  <td className="px-4 py-2.5 text-center text-gray-600">{row.quantity}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums">{fmtRowBRL(row.unit_price)}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums font-medium">{fmtBRL(rowTotals[i])}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t border-gray-200 bg-gray-50">
                <td colSpan={3} className="px-4 py-2.5 text-xs font-bold text-gray-500 uppercase tracking-wide">Total geral</td>
                <td className="px-4 py-2.5 text-right text-sm font-bold text-gray-900 tabular-nums">{fmtBRL(grandTotal)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    )
  }

  if (section.type === 'hours') {
    const s = section as HoursSection
    const rowTotals  = s.rows.map(r => parseNum(r.hours) * parseNum(r.rate))
    const grandTotal = rowTotals.reduce((a, b) => a + b, 0)
    return (
      <div className={`${wrap} overflow-x-auto`}>
        {header(s.title)}
        <div className={body + ' p-0'}>
          <table className="w-full text-[13px] min-w-[480px]">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-400 uppercase tracking-wide">Perfil</th>
                <th className="text-center px-4 py-2.5 text-xs font-semibold text-gray-400 uppercase tracking-wide w-20">Horas</th>
                <th className="text-right px-4 py-2.5 text-xs font-semibold text-gray-400 uppercase tracking-wide">Valor/hora</th>
                <th className="text-right px-4 py-2.5 text-xs font-semibold text-gray-400 uppercase tracking-wide">Total</th>
              </tr>
            </thead>
            <tbody>
              {s.rows.map((row, i) => (
                <tr key={i} className={i % 2 !== 0 ? 'bg-gray-50/60' : ''}>
                  <td className="px-4 py-2.5 text-gray-700">{row.profile}</td>
                  <td className="px-4 py-2.5 text-center text-gray-600">{row.hours}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums">{fmtRowBRL(row.rate)}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums font-medium">{fmtBRL(rowTotals[i])}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t border-gray-200 bg-gray-50">
                <td colSpan={3} className="px-4 py-2.5 text-xs font-bold text-gray-500 uppercase tracking-wide">Total geral</td>
                <td className="px-4 py-2.5 text-right text-sm font-bold text-gray-900 tabular-nums">{fmtBRL(grandTotal)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    )
  }

  if (section.type === 'installments') {
    const s = section as InstallmentsSection
    return (
      <div className={`${wrap} overflow-x-auto`}>
        {header(s.title)}
        <div className={body + ' p-0'}>
          <table className="w-full text-[13px] min-w-[400px]">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-400 uppercase tracking-wide">Descrição</th>
                <th className="text-center px-4 py-2.5 text-xs font-semibold text-gray-400 uppercase tracking-wide w-20">%</th>
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-400 uppercase tracking-wide">Condição</th>
              </tr>
            </thead>
            <tbody>
              {s.rows.map((row, i) => (
                <tr key={i} className={i % 2 !== 0 ? 'bg-gray-50/60' : ''}>
                  <td className="px-4 py-2.5 text-gray-700">{row.description}</td>
                  <td className="px-4 py-2.5 text-center text-gray-600">{row.percentage}%</td>
                  <td className="px-4 py-2.5 text-gray-600">{row.condition}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  if (section.type === 'clauses') {
    const s = section as ClausesSection
    return (
      <div className={wrap}>
        {header(s.title)}
        <div className={body}>
          <ol className="space-y-2">
            {s.items.map((item, i) => (
              <li key={i} className="flex gap-2.5">
                <span className="shrink-0 font-semibold text-gray-400 tabular-nums w-5 text-right mt-0.5">{i + 1}.</span>
                <span>{item}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    )
  }

  if (section.type === 'image') {
    const s = section as ImageSection
    if (!s.url) return null
    return (
      <div className={wrap}>
        {s.title && header(s.title)}
        <div className={body}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={s.url} alt={s.title || 'Imagem'} className="w-full max-h-96 object-contain rounded-lg" />
        </div>
      </div>
    )
  }

  return null
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function ProposalDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) notFound()

  const [proposalRes, eventsRes, followUpsRes, profileRes] = await Promise.all([
    supabase
      .from('proposals')
      .select('id, title, service_description, value, payment_terms, deadline_days, valid_until, status, pdf_url, token, proposal_number, version, client_id, created_at, sections, recipient_email, recipient_name, clients(id, name, email, phone)')
      .eq('id', id)
      .eq('user_id', user.id)
      .single(),
    supabase
      .from('proposal_events')
      .select('id, event_type, metadata, created_at')
      .eq('proposal_id', id)
      .order('created_at', { ascending: true }),
    supabase
      .from('follow_ups')
      .select('id, type, trigger_rule, scheduled_for, created_at')
      .eq('proposal_id', id)
      .eq('user_id', user.id)
      .is('sent_at', null)
      .order('scheduled_for', { ascending: true }),
    supabase
      .from('profiles')
      .select('full_name, business_name')
      .eq('id', user.id)
      .single(),
  ])

  if (!proposalRes.data) notFound()

  const proposal      = proposalRes.data as unknown as ProposalRow
  const events        = (eventsRes.data   ?? []) as EventRow[]
  const followUps     = (followUpsRes.data ?? []) as FollowUpRow[]
  const sections      = Array.isArray(proposal.sections) ? proposal.sections : []
  const profile       = profileRes.data
  const freelancerName = profile?.business_name ?? profile?.full_name ?? 'Freelancer'
  const proposalAny   = proposalRes.data as Record<string, unknown>

  const statusCfg = STATUS_CONFIG[proposal.status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.rascunho

  const version    = proposal.version ?? 1
  const baseNumber = proposal.proposal_number?.replace(/-v\d+$/, '') ?? null
  const ref = baseNumber
    ? `${baseNumber}-v${version}`
    : '#' + proposal.token.substring(0, 8).toUpperCase()

  const clientsRaw = (proposalRes.data as Record<string, unknown>).clients
  const client = Array.isArray(clientsRaw)
    ? (clientsRaw[0] as ProposalRow['clients']) ?? null
    : clientsRaw as ProposalRow['clients']

  const card = 'bg-white rounded-[10px] border border-gray-100'

  return (
    <div className="p-6 md:p-8 max-w-5xl">

      {/* ── Breadcrumb ── */}
      <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-5">
        <Link href="/propostas" className="hover:text-gray-600 transition-colors flex items-center gap-1">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Propostas
        </Link>
        <span className="text-gray-300">›</span>
        <span className="text-gray-500 truncate max-w-[280px]">{proposal.title}</span>
      </div>

      {/* ── Header ── */}
      <div className="mb-5">
        <h1 className="text-[20px] font-medium text-gray-900 leading-snug mb-2">
          {proposal.title}
        </h1>
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusCfg.cls}`}>
            {statusCfg.label}
          </span>
          <span className="text-xs text-gray-400">{ref}</span>
          <span className="text-gray-300 text-xs">·</span>
          <span className="text-xs text-gray-400">Criada em {fmtDate(proposal.created_at)}</span>
          {proposal.valid_until && (
            <>
              <span className="text-gray-300 text-xs">·</span>
              <span className="text-xs text-gray-400">Válida até {fmtDate(proposal.valid_until)}</span>
            </>
          )}
        </div>
      </div>

      {/* ── Botões de ação ── */}
      <div className="flex items-center justify-end mb-6">
        <ProposalActions
          proposalId={proposal.id}
          status={proposal.status}
          initialPdfUrl={proposal.pdf_url}
          duplicate={{
            title:               proposal.title,
            service_description: proposal.service_description,
            value:               proposal.value,
            payment_terms:       proposal.payment_terms,
            deadline_days:       proposal.deadline_days,
            valid_until:         proposal.valid_until,
            client_id:           proposal.client_id ?? client?.id ?? null,
            sections:            proposal.sections ?? [],
          }}
          sendProps={{
            proposalTitle: proposal.title,
            clientEmail:   (proposalAny.recipient_email as string | null) ?? client?.email ?? null,
            clientName:    (proposalAny.recipient_name  as string | null) ?? client?.name  ?? null,
            freelancerName,
          }}
        />
      </div>

      {/* ── Banner cancelada ── */}
      {proposal.status === 'cancelada' && (
        <div className="mb-5 flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-[10px]">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
          </svg>
          <div>
            <p className="text-sm font-semibold text-red-900">Proposta cancelada</p>
            <p className="text-xs text-red-700 mt-0.5">Esta proposta foi cancelada e não pode ser enviada ao cliente.</p>
          </div>
        </div>
      )}

      {/* ── 3 info cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">

        {/* Valor total */}
        <div className="bg-gray-50 rounded-[8px] border border-gray-100 px-[14px] py-3">
          <p className="text-xs font-medium text-gray-400 mb-1.5">Valor total</p>
          <p className="text-xl font-bold text-[#1D9E75] leading-tight tabular-nums">
            {fmtBRL(proposal.value)}
          </p>
        </div>

        {/* Cliente */}
        <div className="bg-gray-50 rounded-[8px] border border-gray-100 px-[14px] py-3">
          <p className="text-xs font-medium text-gray-400 mb-1.5">Cliente</p>
          {client ? (
            <>
              <p className="text-sm font-semibold text-gray-900 truncate leading-tight">{client.name}</p>
              {client.email && <p className="text-xs text-gray-400 mt-0.5 truncate">{client.email}</p>}
            </>
          ) : (
            <p className="text-sm font-semibold text-gray-400">—</p>
          )}
        </div>

        {/* Prazo / Pagamento */}
        <div className="bg-gray-50 rounded-[8px] border border-gray-100 px-[14px] py-3">
          <p className="text-xs font-medium text-gray-400 mb-1.5">Prazo de entrega</p>
          <p className="text-sm font-semibold text-gray-900 leading-tight">
            {proposal.deadline_days !== null ? `${proposal.deadline_days} dias` : '—'}
          </p>
          {proposal.payment_terms && (
            <p className="text-xs text-gray-400 mt-0.5 truncate">{proposal.payment_terms}</p>
          )}
        </div>

      </div>

      {/* ── Layout principal: 2 colunas ── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-5 items-start">

        {/* Coluna esquerda — seções de conteúdo */}
        <div className="space-y-4">

          {/* Descrição do serviço */}
          {proposal.service_description && (
            <div className={card}>
              <div className="flex items-center gap-3 px-4 pt-3.5 pb-3 border-b border-gray-50">
                <span className="w-[3px] h-[18px] bg-[#1D9E75] rounded-sm shrink-0" />
                <h3 className="text-[13px] font-medium text-gray-900">Descrição do serviço</h3>
              </div>
              <div className="px-4 py-[14px] text-[13px] leading-[1.65] text-gray-700">
                <p className="whitespace-pre-wrap">{proposal.service_description}</p>
              </div>
            </div>
          )}

          {/* Seções dinâmicas */}
          {sections.map(section => (
            <SectionCard key={section.id} section={section} />
          ))}

          {/* Condições de pagamento */}
          {proposal.payment_terms && sections.length > 0 && (
            <div className={card}>
              <div className="flex items-center gap-3 px-4 pt-3.5 pb-3 border-b border-gray-50">
                <span className="w-[3px] h-[18px] bg-[#1D9E75] rounded-sm shrink-0" />
                <h3 className="text-[13px] font-medium text-gray-900">Condições de pagamento</h3>
              </div>
              <div className="px-4 py-[14px] text-[13px] leading-[1.65] text-gray-700">
                <p className="whitespace-pre-wrap">{proposal.payment_terms}</p>
              </div>
            </div>
          )}

          {/* Placeholder quando não há conteúdo */}
          {!proposal.service_description && sections.length === 0 && !proposal.payment_terms && (
            <div className={`${card} px-5 py-10 text-center`}>
              <p className="text-sm text-gray-400">Nenhuma seção de conteúdo</p>
              {proposal.status === 'rascunho' && (
                <Link href={`/propostas/${proposal.id}/editar`} className="mt-2 inline-block text-xs text-[#1D9E75] hover:underline font-medium">
                  Editar proposta →
                </Link>
              )}
            </div>
          )}
        </div>

        {/* Coluna direita — sidebar cards */}
        <div className="flex flex-col gap-4">

          {/* Linha do tempo */}
          <div className={card}>
            <div className="px-4 py-3.5 border-b border-gray-50">
              <h3 className="text-sm font-medium text-gray-600">Linha do tempo</h3>
            </div>
            <div className="px-4 py-4">
              {events.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-2">Nenhum evento registrado</p>
              ) : (
                <ol>
                  {events.map((ev, i) => {
                    const cfg    = EVENT_CONFIG[ev.event_type] ?? { label: ev.event_type, dot: 'bg-gray-300', line: 'bg-gray-100' }
                    const isLast = i === events.length - 1
                    return (
                      <li key={ev.id} className="flex gap-3">
                        <div className="flex flex-col items-center">
                          <span className={`w-2.5 h-2.5 rounded-full shrink-0 mt-1 ${cfg.dot}`} />
                          {!isLast && <span className={`w-px flex-1 my-1 ${cfg.line}`} />}
                        </div>
                        <div className="pb-3 flex-1 min-w-0">
                          <p className="text-[13px] font-medium text-gray-800">{cfg.label}</p>
                          <p className="text-[11px] text-gray-400 mt-0.5">{fmtDateTime(ev.created_at)}</p>
                        </div>
                      </li>
                    )
                  })}
                  {/* Aguardando — último item */}
                  <li className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <span className="w-2.5 h-2.5 rounded-full border-2 border-gray-300 bg-white shrink-0 mt-1" />
                    </div>
                    <div className="pb-1 flex-1 min-w-0">
                      <p className="text-[13px] text-gray-400">Aguardando…</p>
                    </div>
                  </li>
                </ol>
              )}
            </div>
          </div>

          {/* Follow-ups */}
          <div className={card}>
            <div className="flex items-center justify-between px-4 py-3.5 border-b border-gray-50">
              <h3 className="text-sm font-medium text-gray-600">Follow-ups</h3>
            </div>
            <div className="px-4 py-4">
              {followUps.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-1">Nenhum follow-up pendente</p>
              ) : (
                <ul className="space-y-2.5">
                  {followUps.map(fu => (
                    <li key={fu.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${fu.type === 'whatsapp' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
                        {fu.type === 'whatsapp' ? (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                            <path d="M12 0C5.373 0 0 5.373 0 12c0 2.126.556 4.12 1.524 5.856L0 24l6.29-1.498A11.952 11.952 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.6a9.573 9.573 0 01-4.892-1.344l-.35-.21-3.633.866.929-3.517-.23-.364A9.558 9.558 0 012.4 12c0-5.292 4.308-9.6 9.6-9.6 5.292 0 9.6 4.308 9.6 9.6 0 5.292-4.308 9.6-9.6 9.6z"/>
                          </svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <rect x="3" y="5" width="18" height="14" rx="2" />
                            <polyline points="3 7 12 13 21 7" />
                          </svg>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-900 capitalize">{fu.type}</p>
                        {fu.scheduled_for && (
                          <p className="text-xs text-gray-500 mt-0.5">{fmtDateTime(fu.scheduled_for)}</p>
                        )}
                        {fu.trigger_rule && (
                          <p className="text-xs text-gray-400 mt-0.5">{fu.trigger_rule}</p>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
              <button className="mt-3 flex items-center gap-1.5 text-xs font-medium text-[#1D9E75] hover:text-[#188f68] transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                Adicionar lembrete
              </button>
            </div>
          </div>

        </div>
      </div>

    </div>
  )
}
