import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import ProposalActions from '@/components/proposals/ProposalActions'
import ProposalNotes from '@/components/proposals/ProposalNotes'
import VersionGroup from '@/components/proposals/VersionGroup'
import ProposalTimeline from '@/components/proposals/ProposalTimeline'
import type { TimelineEvent } from '@/components/proposals/ProposalTimeline'
import type {
  Section,
  TextSection,
  ScopeSection,
  ItemsSection,
  HoursSection,
  InstallmentsSection,
  ClausesSection,
  ImageSection,
  ContemplasSection,
  TimelineSection,
  CustomTableSection,
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
  code: string | null
  proposal_number: string | null
  version: number
  created_at: string
  sections: Section[]
  client_id: string | null
  clients: { id: string; name: string; email: string | null; phone: string | null } | null
}

type EventRow = TimelineEvent

type NoteRow = { id: string; content: string; created_at: string }

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_CONFIG = {
  rascunho:    { label: 'Rascunho',    cls: 'bg-gray-100 text-gray-500'          },
  enviada:     { label: 'Enviada',     cls: 'bg-blue-100 text-blue-700'           },
  visualizada: { label: 'Visualizada', cls: 'bg-yellow-100 text-yellow-700'       },
  aceita:    { label: 'Aceita',    cls: 'bg-[#1D9E75]/10 text-[#1D9E75]'     },
  recusada:   { label: 'Recusada',   cls: 'bg-red-100 text-red-700'             },
  expirada:    { label: 'Expirada',    cls: 'bg-orange-100 text-orange-700'       },
  cancelada:   { label: 'Cancelada',   cls: 'bg-red-200 text-red-900'             },
} as const

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmtBRL(v: number | null) {
  if (v === null) return '—'
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)
}

function fmtDate(iso: string | null) {
  if (!iso) return '—'
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    timeZone: 'America/Sao_Paulo',
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
  const header = (title: string) => {
    if (!title?.trim()) return null
    return (
      <div className="flex items-center gap-3 px-4 pt-3.5 pb-3 border-b border-gray-50">
        <span className="w-[3px] h-[18px] bg-[#1D9E75] rounded-sm shrink-0" />
        <h3 className="text-[13px] font-medium text-gray-900">{title}</h3>
      </div>
    )
  }
  const note = (text: string | undefined | null) =>
    text?.trim() ? <p className="px-4 py-2 text-xs text-gray-400 italic">{text}</p> : null

  const body = 'px-4 py-[14px] text-[13px] leading-[1.65] text-gray-700 break-words [word-break:break-word] min-w-0'
  const wrap = 'bg-white rounded-[10px] border border-gray-100 min-w-0'

  if (section.type === 'text') {
    const s = section as TextSection
    if (!s.title?.trim() && !s.content?.trim()) return null
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
    const hasContent = s.items.some(i => i.trim())
    if (!s.title?.trim() && !hasContent) return null
    return (
      <div className={wrap}>
        {header(s.title)}
        <div className={body}>
          <ul className="space-y-1.5">
            {s.items.filter(i => i.trim()).map((item, i) => (
              <li key={i} className="flex gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#1D9E75] shrink-0 mt-[7px]" />
                <span className="break-words [word-break:break-word] min-w-0">{item}</span>
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
        {note(s.note_before)}
        <div className={body + ' p-0'}>
          <table className="w-full text-[13px] min-w-[560px]" style={{ tableLayout: 'fixed' }}>
            <colgroup>
              <col style={{ width: '45%' }} />
              <col style={{ width: '10%' }} />
              <col style={{ width: '20%' }} />
              <col style={{ width: '25%' }} />
            </colgroup>
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-400 uppercase tracking-wide whitespace-nowrap">Descrição</th>
                <th className="text-center px-4 py-2.5 text-xs font-semibold text-gray-400 uppercase tracking-wide whitespace-nowrap">Qtd</th>
                <th className="text-right px-4 py-2.5 text-xs font-semibold text-gray-400 uppercase tracking-wide whitespace-nowrap">Valor unit.</th>
                <th className="text-right px-4 py-2.5 text-xs font-semibold text-gray-400 uppercase tracking-wide whitespace-nowrap">Total</th>
              </tr>
            </thead>
            <tbody>
              {s.rows.map((row, i) => (
                <tr key={i} className={i % 2 !== 0 ? 'bg-gray-50/60' : ''}>
                  <td className="px-4 py-2.5 text-gray-700 whitespace-nowrap overflow-hidden">{row.description}</td>
                  <td className="px-4 py-2.5 text-center text-gray-600 whitespace-nowrap">{row.quantity}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums whitespace-nowrap">{fmtRowBRL(row.unit_price)}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums font-medium whitespace-nowrap">{fmtBRL(rowTotals[i])}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t border-gray-200 bg-gray-50">
                <td colSpan={3} className="px-4 py-2.5 text-xs font-bold text-gray-500 uppercase tracking-wide whitespace-nowrap">Total geral</td>
                <td className="px-4 py-2.5 text-right text-sm font-bold text-gray-900 tabular-nums whitespace-nowrap">{fmtBRL(grandTotal)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
        {note(s.note_after)}
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
        {note(s.note_before)}
        <div className={body + ' p-0'}>
          <table className="w-full text-[13px] min-w-[480px]" style={{ tableLayout: 'fixed' }}>
            <colgroup>
              <col style={{ width: '35%' }} />
              <col style={{ width: '15%' }} />
              <col style={{ width: '25%' }} />
              <col style={{ width: '25%' }} />
            </colgroup>
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-400 uppercase tracking-wide whitespace-nowrap">Perfil</th>
                <th className="text-center px-4 py-2.5 text-xs font-semibold text-gray-400 uppercase tracking-wide whitespace-nowrap">Horas</th>
                <th className="text-right px-4 py-2.5 text-xs font-semibold text-gray-400 uppercase tracking-wide whitespace-nowrap">Valor/hora</th>
                <th className="text-right px-4 py-2.5 text-xs font-semibold text-gray-400 uppercase tracking-wide whitespace-nowrap">Total</th>
              </tr>
            </thead>
            <tbody>
              {s.rows.map((row, i) => (
                <tr key={i} className={i % 2 !== 0 ? 'bg-gray-50/60' : ''}>
                  <td className="px-4 py-2.5 text-gray-700 whitespace-nowrap overflow-hidden">{row.profile}</td>
                  <td className="px-4 py-2.5 text-center text-gray-600 whitespace-nowrap">{row.hours}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums whitespace-nowrap">{fmtRowBRL(row.rate)}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums font-medium whitespace-nowrap">{fmtBRL(rowTotals[i])}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t border-gray-200 bg-gray-50">
                <td colSpan={3} className="px-4 py-2.5 text-xs font-bold text-gray-500 uppercase tracking-wide whitespace-nowrap">Total geral</td>
                <td className="px-4 py-2.5 text-right text-sm font-bold text-gray-900 tabular-nums whitespace-nowrap">{fmtBRL(grandTotal)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
        {note(s.note_after)}
      </div>
    )
  }

  if (section.type === 'installments') {
    const s = section as InstallmentsSection
    return (
      <div className={`${wrap} overflow-x-auto`}>
        {header(s.title)}
        {note(s.note_before)}
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
        {note(s.note_after)}
      </div>
    )
  }

  if (section.type === 'clauses') {
    const s = section as ClausesSection
    const hasContent = s.items.some(i => i.trim())
    if (!s.title?.trim() && !hasContent) return null
    return (
      <div className={wrap}>
        {header(s.title)}
        <div className={body}>
          <ol className="space-y-2">
            {s.items.filter(i => i.trim()).map((item, i) => (
              <li key={i} className="flex gap-2.5">
                <span className="shrink-0 font-semibold text-gray-400 tabular-nums w-5 text-right mt-0.5">{i + 1}.</span>
                <span className="break-words [word-break:break-word] min-w-0">{item}</span>
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
        {note(s.note_before)}
        <div className={body}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={s.url} alt={s.title || 'Imagem'} className="w-full max-h-96 object-contain rounded-lg" />
        </div>
        {note(s.note_after)}
      </div>
    )
  }

  if (section.type === 'contempla') {
    const s = section as ContemplasSection
    const filtered = s.items.filter(i => i.trim())
    if (!s.title?.trim() && !filtered.length) return null
    return (
      <div className={wrap}>
        {header(s.title)}
        {note(s.note_before)}
        <div className={body}>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
            {filtered.map((item, i) => (
              <div key={i} className="flex items-start gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#1D9E75] shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <span className="break-words [word-break:break-word] min-w-0">{item}</span>
              </div>
            ))}
          </div>
        </div>
        {note(s.note_after)}
      </div>
    )
  }

  if (section.type === 'timeline') {
    const s = section as TimelineSection
    const filtered = s.items.filter(i => i.title || i.description)
    if (!filtered.length) return null
    return (
      <div className={wrap}>
        {header(s.title)}
        {note(s.note_before)}
        <div className={body}>
          <ol>
            {filtered.map((item, i) => {
              const isLast = i === filtered.length - 1
              return (
                <li key={i} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#1D9E75] shrink-0 mt-1.5" />
                    {!isLast && <span className="w-0.5 flex-1 bg-[#1D9E75]/20 my-1" />}
                  </div>
                  <div className={`${isLast ? 'pb-0' : 'pb-4'} flex-1 min-w-0`}>
                    <p className="text-[13px] font-semibold text-[#1D9E75]">{item.title}</p>
                    {item.description && (
                      <p className="text-[12px] text-gray-500 mt-0.5">{item.description}</p>
                    )}
                  </div>
                </li>
              )
            })}
          </ol>
        </div>
        {note(s.note_after)}
      </div>
    )
  }

  if (section.type === 'custom_table') {
    const s = section as CustomTableSection
    if (!s.columns.length) return null
    return (
      <div className={`${wrap} overflow-x-auto`}>
        {header(s.title)}
        {note(s.note_before)}
        <div className={body + ' p-0'}>
          <table className="w-full text-[13px]">
            <thead>
              <tr>
                {s.columns.map((col, ci) => (
                  <th key={ci} className="px-4 py-2.5 text-xs font-semibold text-white uppercase tracking-wide text-center whitespace-nowrap border-l border-white/20 first:border-l-0"
                    style={{ backgroundColor: '#1D9E75' }}>
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {s.rows.map((row, ri) => (
                <tr key={ri} className={ri % 2 !== 0 ? 'bg-gray-50/60' : ''}>
                  {s.columns.map((_, ci) => (
                    <td key={ci} className="px-4 py-2.5 text-gray-700 border-l border-gray-100 first:border-l-0">
                      {row[ci] ?? ''}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {note(s.note_after)}
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

  const [proposalRes, eventsRes, notesRes, profileRes] = await Promise.all([
    supabase
      .from('proposals')
      .select('id, title, service_description, value, payment_terms, deadline_days, valid_until, status, pdf_url, token, proposal_number, code, version, client_id, created_at, sections, recipient_email, recipient_name, clients(id, name, email, phone)')
      .eq('id', id)
      .eq('user_id', user.id)
      .single(),
    supabase
      .from('proposal_events')
      .select('id, event_type, metadata, created_at')
      .eq('proposal_id', id)
      .order('created_at', { ascending: false }),
    supabase
      .from('proposal_notes')
      .select('id, content, created_at')
      .eq('proposal_id', id)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false }),
    supabase
      .from('profiles')
      .select('full_name, business_name')
      .eq('id', user.id)
      .single(),
  ])

  if (!proposalRes.data) notFound()

  const proposal      = proposalRes.data as unknown as ProposalRow
  const events        = (eventsRes.data  ?? []) as EventRow[]
  const notes         = (notesRes.data   ?? []) as NoteRow[]
  const sections      = Array.isArray(proposal.sections) ? proposal.sections : []
  const profile       = profileRes.data
  const freelancerName = profile?.business_name ?? profile?.full_name ?? 'Freelancer'
  const proposalAny   = proposalRes.data as Record<string, unknown>

  const statusCfg = STATUS_CONFIG[proposal.status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.rascunho

  const version    = proposal.version ?? 1
  const displayCode  = proposal.code ?? proposal.proposal_number
  const baseNumber   = displayCode?.replace(/-v\d+$/, '') ?? null
  const ref = displayCode ?? ('#' + proposal.token.substring(0, 8).toUpperCase())

  const clientsRaw = (proposalRes.data as Record<string, unknown>).clients
  const client = Array.isArray(clientsRaw)
    ? (clientsRaw[0] as ProposalRow['clients']) ?? null
    : clientsRaw as ProposalRow['clients']

  const card = 'bg-white rounded-[10px] border border-gray-100'
  const viewCount = events.filter(e => e.event_type === 'viewed').length

  // Other versions of the same proposal (same base code, excluding current)
  // Prefer querying by `code`; fall back to `proposal_number` for older proposals
  const codeBase = proposal.code?.replace(/-v\d+$/, '') ?? null
  const numBase  = proposal.proposal_number?.replace(/-v\d+$/, '') ?? null
  const otherVersions = (codeBase ?? numBase)
    ? ((await (codeBase
        ? supabase
            .from('proposals')
            .select('id, code, proposal_number, version, status, created_at')
            .eq('user_id', user.id)
            .like('code', `${codeBase}-v%`)
            .neq('id', id)
            .order('version', { ascending: false })
        : supabase
            .from('proposals')
            .select('id, code, proposal_number, version, status, created_at')
            .eq('user_id', user.id)
            .like('proposal_number', `${numBase}-v%`)
            .neq('id', id)
            .order('version', { ascending: false })
      )).data ?? [])
    : []

  const newerVersions = otherVersions.filter(v => (v.version ?? 1) > version)
  const olderVersions = otherVersions.filter(v => (v.version ?? 1) < version)

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
          {viewCount > 0 && (
            <span className="text-xs text-gray-400">
              · Vista <span className="font-medium text-gray-500">{viewCount}</span> {viewCount === 1 ? 'vez' : 'vezes'}
            </span>
          )}
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
      <div className="flex items-center justify-start mb-6">
        <ProposalActions
          proposalId={proposal.id}
          status={proposal.status}
          version={proposal.version ?? 1}
          newerVersion={otherVersions[0]?.version && otherVersions[0].version > version ? otherVersions[0].version : null}
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
            proposalTitle:      proposal.title,
            clientEmail:        (proposalAny.recipient_email as string | null) ?? client?.email ?? null,
            clientName:         (proposalAny.recipient_name  as string | null) ?? client?.name  ?? null,
            freelancerName,
            proposalToken:      proposal.token,
            proposalValidUntil: proposal.valid_until,
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
            <>
              <p className="text-xs font-medium text-gray-400 mt-2 mb-0.5">Condições de pgto</p>
              <p className="text-xs text-gray-700 break-words [word-break:break-word]">{proposal.payment_terms}</p>
            </>
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
              <div className="px-4 py-[14px] text-[13px] leading-[1.65] text-gray-700 break-words [word-break:break-word] min-w-0">
                <p className="whitespace-pre-wrap">{proposal.service_description}</p>
              </div>
            </div>
          )}

          {/* Seções dinâmicas */}
          {sections.map(section => (
            <SectionCard key={section.id} section={section} />
          ))}

          {/* Condições de pagamento */}
          {proposal.payment_terms && (
            <div className={card}>
              <div className="flex items-center gap-3 px-4 pt-3.5 pb-3 border-b border-gray-50">
                <span className="w-[3px] h-[18px] bg-[#1D9E75] rounded-sm shrink-0" />
                <h3 className="text-[13px] font-medium text-gray-900">Condições de pagamento</h3>
              </div>
              <div className="px-4 py-[14px] text-[13px] leading-[1.65] text-gray-700 break-words [word-break:break-word] min-w-0">
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
            <div className="px-4 py-3.5 border-b border-gray-50 flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-600">Linha do tempo</h3>
              <span className="text-[11px] font-medium text-gray-400 bg-gray-100 rounded px-1.5 py-0.5">v{version}</span>
            </div>
            <ProposalTimeline
              proposalId={proposal.id}
              initialEvents={events}
              initialStatus={proposal.status}
            />
          </div>

          {/* Versões */}
          {otherVersions.length > 0 && (
            <details className={`${card} group`} open>
              <summary className="px-4 py-3.5 flex items-center justify-between cursor-pointer list-none">
                <h3 className="text-sm font-medium text-gray-600">
                  Versões
                  <span className="ml-1.5 text-xs font-normal text-gray-400">({otherVersions.length})</span>
                </h3>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400 transition-transform group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              <div className="border-t border-gray-50 divide-y divide-gray-50">
                {newerVersions.length > 0 && (
                  <VersionGroup label="Posteriores" versions={newerVersions} statusMap={STATUS_CONFIG} />
                )}
                {olderVersions.length > 0 && (
                  <VersionGroup label="Anteriores" versions={olderVersions} statusMap={STATUS_CONFIG} />
                )}
              </div>
            </details>
          )}

          {/* Notas */}
          <ProposalNotes proposalId={proposal.id} initialNotes={notes} />

        </div>
      </div>

    </div>
  )
}
