'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams } from 'next/navigation'

// ── Section types ─────────────────────────────────────────────────────────────

type TextSection         = { id: string; type: 'text';         title: string; content: string }
type ScopeSection        = { id: string; type: 'scope';        title: string; items: string[] }
type ItemsSection        = { id: string; type: 'items';        title: string; note_before?: string; note_after?: string; rows: Array<{ description: string; quantity: string; unit_price: string }> }
type HoursSection        = { id: string; type: 'hours';        title: string; note_before?: string; note_after?: string; rows: Array<{ profile: string; hours: string; rate: string }> }
type InstallmentsSection = { id: string; type: 'installments'; title: string; note_before?: string; note_after?: string; rows: Array<{ description: string; percentage: string; condition: string }> }
type ClausesSection      = { id: string; type: 'clauses';      title: string; items: string[] }
type ImageSection        = { id: string; type: 'image';        title: string; note_before?: string; note_after?: string; url: string }
type ContemplasSection   = { id: string; type: 'contempla';    title: string; note_before?: string; note_after?: string; items: string[] }
type TimelineItem        = { title: string; description: string }
type TimelineSection     = { id: string; type: 'timeline';     title: string; note_before?: string; note_after?: string; items: TimelineItem[] }
type CustomTableSection  = { id: string; type: 'custom_table'; title: string; note_before?: string; note_after?: string; columns: string[]; rows: string[][] }
type Section = TextSection | ScopeSection | ItemsSection | HoursSection | InstallmentsSection | ClausesSection | ImageSection | ContemplasSection | TimelineSection | CustomTableSection

type Client = { name: string; email: string | null }

type Proposal = {
  id: string
  title: string
  proposal_number: string | null
  service_description: string | null
  sections: Section[]
  value: number | null
  payment_terms: string | null
  deadline_days: number | null
  valid_until: string | null
  status: string
  token: string
  created_at: string
  pdf_url: string | null
  clients: Client | null
}

type Profile = {
  full_name: string | null
  business_name: string | null
  logo_url: string | null
  accent_color: string | null
  email_business: string | null
  phone: string | null
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function parseNum(v: string | undefined | null): number {
  if (!v) return 0
  const n = parseFloat(String(v).replace(',', '.'))
  return isNaN(n) ? 0 : n
}

function fmtBRL(v: number | null) {
  if (v === null) return '—'
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)
}

function fmtDate(iso: string | null) {
  if (!iso) return '—'
  const [y, m, d] = iso.split('T')[0].split('-').map(Number)
  return new Intl.DateTimeFormat('pt-BR').format(new Date(y, m - 1, d))
}

const FINAL_STATUSES    = ['aceita', 'recusada']
const INACTIVE_STATUSES = ['expirada', 'cancelada']

// ── Section renderers ─────────────────────────────────────────────────────────

function SecTitle({ title, accent }: { title: string; accent: string }) {
  if (!title) return null
  return (
    <h2 className="text-sm font-bold text-gray-700 mb-3 pl-2.5 leading-snug"
      style={{ borderLeft: `2.5px solid ${accent}` }}>
      {title}
    </h2>
  )
}

function SecNote({ text }: { text?: string }) {
  if (!text?.trim()) return null
  return <p className="text-xs text-gray-400 italic mb-3 leading-relaxed">{text}</p>
}

function SecNoteAfter({ text }: { text?: string }) {
  if (!text?.trim()) return null
  return <p className="text-xs text-gray-400 italic mt-3 leading-relaxed">{text}</p>
}

function RenderText({ sec, accent }: { sec: TextSection; accent: string }) {
  return (
    <div>
      <SecTitle title={sec.title} accent={accent} />
      <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{sec.content}</p>
    </div>
  )
}

function RenderScope({ sec, accent }: { sec: ScopeSection; accent: string }) {
  return (
    <div>
      <SecTitle title={sec.title} accent={accent} />
      <ul className="space-y-2">
        {sec.items.filter(Boolean).map((item, i) => (
          <li key={i} className="flex items-start gap-2.5 text-sm text-gray-700">
            <span className="mt-2 w-1.5 h-1.5 rounded-full bg-gray-400 shrink-0" />
            <span className="leading-relaxed">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function RenderItems({ sec, accent }: { sec: ItemsSection; accent: string }) {
  const rowTotals = sec.rows.map(r => parseNum(r.quantity) * parseNum(r.unit_price))
  const grandTotal = rowTotals.reduce((a, b) => a + b, 0)
  return (
    <div>
      <SecTitle title={sec.title} accent={accent} />
      <SecNote text={sec.note_before} />
      <div className="overflow-x-auto -mx-4 px-4">
        <table className="w-full min-w-[380px] text-sm border-collapse">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide py-2 pr-3">Descrição</th>
              <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide py-2 pr-3 w-14">Qtd</th>
              <th className="text-right text-xs font-semibold text-gray-400 uppercase tracking-wide py-2 pr-3 w-28">Vlr Unit.</th>
              <th className="text-right text-xs font-semibold text-gray-400 uppercase tracking-wide py-2 w-28">Total</th>
            </tr>
          </thead>
          <tbody>
            {sec.rows.map((row, i) => (
              <tr key={i} className="border-b border-gray-50">
                <td className="py-2.5 pr-3 text-gray-800">{row.description}</td>
                <td className="py-2.5 pr-3 text-gray-600">{row.quantity}</td>
                <td className="py-2.5 pr-3 text-right text-gray-600">{row.unit_price}</td>
                <td className="py-2.5 text-right text-gray-800">{rowTotals[i] > 0 ? fmtBRL(rowTotals[i]) : '—'}</td>
              </tr>
            ))}
          </tbody>
          {grandTotal > 0 && (
            <tfoot>
              <tr className="bg-gray-50 border-t border-gray-200">
                <td colSpan={3} className="py-2.5 pr-3 text-xs font-semibold text-gray-500 uppercase">Total geral</td>
                <td className="py-2.5 text-right font-bold text-gray-900">{fmtBRL(grandTotal)}</td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
      <SecNoteAfter text={sec.note_after} />
    </div>
  )
}

function RenderHours({ sec, accent }: { sec: HoursSection; accent: string }) {
  const rowTotals = sec.rows.map(r => parseNum(r.hours) * parseNum(r.rate))
  const grandTotal = rowTotals.reduce((a, b) => a + b, 0)
  return (
    <div>
      <SecTitle title={sec.title} accent={accent} />
      <SecNote text={sec.note_before} />
      <div className="overflow-x-auto -mx-4 px-4">
        <table className="w-full min-w-[340px] text-sm border-collapse">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide py-2 pr-3">Perfil</th>
              <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide py-2 pr-3 w-16">Horas</th>
              <th className="text-right text-xs font-semibold text-gray-400 uppercase tracking-wide py-2 pr-3 w-28">Vlr/Hora</th>
              <th className="text-right text-xs font-semibold text-gray-400 uppercase tracking-wide py-2 w-28">Total</th>
            </tr>
          </thead>
          <tbody>
            {sec.rows.map((row, i) => (
              <tr key={i} className="border-b border-gray-50">
                <td className="py-2.5 pr-3 text-gray-800">{row.profile}</td>
                <td className="py-2.5 pr-3 text-gray-600">{row.hours}</td>
                <td className="py-2.5 pr-3 text-right text-gray-600">{row.rate}</td>
                <td className="py-2.5 text-right text-gray-800">{rowTotals[i] > 0 ? fmtBRL(rowTotals[i]) : '—'}</td>
              </tr>
            ))}
          </tbody>
          {grandTotal > 0 && (
            <tfoot>
              <tr className="bg-gray-50 border-t border-gray-200">
                <td colSpan={3} className="py-2.5 pr-3 text-xs font-semibold text-gray-500 uppercase">Total geral</td>
                <td className="py-2.5 text-right font-bold text-gray-900">{fmtBRL(grandTotal)}</td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
      <SecNoteAfter text={sec.note_after} />
    </div>
  )
}

function RenderInstallments({ sec, accent }: { sec: InstallmentsSection; accent: string }) {
  return (
    <div>
      <SecTitle title={sec.title} accent={accent} />
      <SecNote text={sec.note_before} />
      <div className="overflow-x-auto -mx-4 px-4">
        <table className="w-full min-w-[280px] text-sm border-collapse">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide py-2 pr-3">Parcela</th>
              <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide py-2 pr-3 w-16">%</th>
              <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide py-2">Condição</th>
            </tr>
          </thead>
          <tbody>
            {sec.rows.map((row, i) => (
              <tr key={i} className={i < sec.rows.length - 1 ? 'border-b border-gray-50' : ''}>
                <td className="py-2.5 pr-3 text-gray-800">{row.description}</td>
                <td className="py-2.5 pr-3 text-gray-600">{row.percentage}</td>
                <td className="py-2.5 text-gray-800">{row.condition}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <SecNoteAfter text={sec.note_after} />
    </div>
  )
}

function RenderClauses({ sec, accent }: { sec: ClausesSection; accent: string }) {
  return (
    <div>
      <SecTitle title={sec.title} accent={accent} />
      <ol className="space-y-3">
        {sec.items.filter(Boolean).map((item, i) => (
          <li key={i} className="flex gap-3 text-sm text-gray-700">
            <span className="font-semibold text-gray-400 shrink-0 w-5 pt-0.5">{i + 1}.</span>
            <span className="leading-relaxed">{item}</span>
          </li>
        ))}
      </ol>
    </div>
  )
}

function RenderImage({ sec, accent, onOpen }: { sec: ImageSection; accent: string; onOpen: (url: string) => void }) {
  if (!sec.url) return null
  return (
    <div>
      <SecTitle title={sec.title} accent={accent} />
      <SecNote text={sec.note_before} />
      <div className="flex justify-center">
        <button
          type="button"
          onClick={() => onOpen(sec.url)}
          className="relative group block rounded-xl overflow-hidden border border-gray-100 focus:outline-none"
          aria-label="Ampliar imagem"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={sec.url} alt={sec.title || 'Imagem'}
            className="max-w-full object-contain max-h-72 w-full" />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 group-active:bg-black/20 transition-colors flex items-center justify-center">
            <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 rounded-full p-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0zM11 8v6M8 11h6" />
              </svg>
            </div>
          </div>
        </button>
      </div>
      <SecNoteAfter text={sec.note_after} />
    </div>
  )
}

function RenderContempla({ sec, accent }: { sec: ContemplasSection; accent: string }) {
  const filtered = sec.items.filter(Boolean)
  return (
    <div>
      <SecTitle title={sec.title} accent={accent} />
      <SecNote text={sec.note_before} />
      <div className="grid grid-cols-2 gap-x-4 gap-y-2.5">
        {filtered.map((item, i) => (
          <div key={i} className="flex items-start gap-2">
            <svg className="shrink-0 mt-0.5" width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="8" r="8" fill={accent} fillOpacity="0.12" />
              <path d="M4.5 8.5L6.5 10.5L11.5 5.5" stroke={accent} strokeWidth="1.6"
                strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="text-sm text-gray-700 leading-snug">{item}</span>
          </div>
        ))}
      </div>
      <SecNoteAfter text={sec.note_after} />
    </div>
  )
}

function RenderTimeline({ sec, accent }: { sec: TimelineSection; accent: string }) {
  const filtered = sec.items.filter(item => item.title || item.description)
  if (!filtered.length) return null
  return (
    <div>
      <SecTitle title={sec.title} accent={accent} />
      <SecNote text={sec.note_before} />
      <div>
        {filtered.map((item, i) => {
          const isLast = i === filtered.length - 1
          return (
            <div key={i} className="flex gap-3">
              <div className="flex flex-col items-center shrink-0 w-5">
                <div className="w-2.5 h-2.5 rounded-full mt-1 shrink-0" style={{ backgroundColor: accent }} />
                {!isLast && (
                  <div className="w-px flex-1 mt-1" style={{ backgroundColor: accent, opacity: 0.2 }} />
                )}
              </div>
              <div className={`flex-1 ${isLast ? 'pb-0' : 'pb-4'}`}>
                <p className="text-sm font-semibold leading-snug" style={{ color: accent }}>{item.title}</p>
                {item.description && (
                  <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{item.description}</p>
                )}
              </div>
            </div>
          )
        })}
      </div>
      <SecNoteAfter text={sec.note_after} />
    </div>
  )
}

function RenderCustomTable({ sec, accent }: { sec: CustomTableSection; accent: string }) {
  if (!sec.columns.length) return null
  return (
    <div>
      <SecTitle title={sec.title} accent={accent} />
      <SecNote text={sec.note_before} />
      <div className="overflow-x-auto -mx-4 px-4">
        <table className="w-full text-sm border-collapse rounded-xl overflow-hidden">
          <thead>
            <tr style={{ backgroundColor: accent }}>
              {sec.columns.map((col, ci) => (
                <th key={ci} className="px-3 py-2.5 text-left text-xs font-bold text-white uppercase tracking-wide">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sec.rows.map((row, ri) => (
              <tr key={ri} className={ri % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                {sec.columns.map((_, ci) => (
                  <td key={ci} className="px-3 py-2.5 text-gray-700 border-t border-gray-100">
                    {row[ci] ?? ''}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <SecNoteAfter text={sec.note_after} />
    </div>
  )
}

function renderSection(sec: Section, accent: string, onImageOpen: (url: string) => void): React.ReactNode {
  switch (sec.type) {
    case 'text':         return <RenderText sec={sec} accent={accent} />
    case 'scope':        return <RenderScope sec={sec} accent={accent} />
    case 'items':        return <RenderItems sec={sec} accent={accent} />
    case 'hours':        return <RenderHours sec={sec} accent={accent} />
    case 'installments': return <RenderInstallments sec={sec} accent={accent} />
    case 'clauses':      return <RenderClauses sec={sec} accent={accent} />
    case 'image':        return <RenderImage sec={sec} accent={accent} onOpen={onImageOpen} />
    case 'contempla':    return <RenderContempla sec={sec} accent={accent} />
    case 'timeline':     return <RenderTimeline sec={sec} accent={accent} />
    case 'custom_table': return <RenderCustomTable sec={sec} accent={accent} />
  }
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function PublicProposalPage() {
  const { token } = useParams<{ token: string }>()
  const [proposal, setProposal] = useState<Proposal | null>(null)
  const [profile, setProfile]   = useState<Profile | null>(null)
  const [loading, setLoading]   = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [acting, setActing]     = useState<'accept' | 'decline' | null>(null)
  const [confirm, setConfirm]   = useState<'accept' | 'decline' | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null)
  const tracked = useRef(false)

  useEffect(() => {
    fetch(`/api/p/${token}`)
      .then(r => r.ok ? r.json() : Promise.reject(r.status))
      .then(({ proposal: p, profile: pr }) => {
        setProposal(p)
        setProfile(pr)
        setLoading(false)
      })
      .catch(() => { setNotFound(true); setLoading(false) })
  }, [token])

  // Track direct URL access. Skip when ?_t=1 is present — the /api/track/view redirect
  // already recorded the event, so we must not call it again.
  useEffect(() => {
    if (!token || tracked.current) return
    if (new URLSearchParams(window.location.search).get('_t') === '1') return
    tracked.current = true
    fetch(`/api/track/view/${token}`, { redirect: 'manual' }).catch(() => {})
  }, [token])

  async function handleAction(action: 'accept' | 'decline') {
    setActing(action)
    setActionError(null)
    try {
      const res  = await fetch(`/p/${token}/${action === 'accept' ? 'accept' : 'decline'}`, { method: 'POST' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setProposal(prev => prev ? { ...prev, status: action === 'accept' ? 'aceita' : 'recusada' } : prev)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (e) {
      setActionError(e instanceof Error ? e.message : 'Erro ao processar resposta')
    } finally {
      setActing(null)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#1D9E75] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (notFound || !proposal || !profile) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h1 className="text-lg font-semibold text-gray-900 mb-1">Proposta não encontrada</h1>
        <p className="text-sm text-gray-500">Este link pode ter expirado ou é inválido.</p>
      </div>
    )
  }

  const accent      = profile.accent_color ?? '#1D9E75'
  const displayName = profile.business_name ?? profile.full_name ?? 'Freelancer'
  const isFinal     = FINAL_STATUSES.includes(proposal.status)
  const isInactive  = INACTIVE_STATUSES.includes(proposal.status)
  const sections    = proposal.sections ?? []

  return (
    <div className="min-h-screen bg-white">

      {/* ── Header ─────────────────────────────────────────── */}
      <header style={{ backgroundColor: accent }}>
        <div className="max-w-2xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            {profile.logo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={profile.logo_url} alt={displayName}
                className="w-11 h-11 rounded-full object-cover shrink-0" style={{ background: 'rgba(255,255,255,0.2)' }} />
            ) : (
              <div className="w-11 h-11 rounded-full flex items-center justify-center text-white font-bold text-lg shrink-0"
                style={{ background: 'rgba(255,255,255,0.2)' }}>
                {displayName.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <p className="text-white font-semibold text-base leading-tight">{displayName}</p>
              <p className="text-[11px] uppercase tracking-widest mt-0.5" style={{ color: 'rgba(255,255,255,0.6)' }}>
                Proposta Comercial
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* ── Main content ───────────────────────────────────── */}
      <main className={`max-w-2xl mx-auto px-4 py-7 space-y-8 ${!isFinal && !isInactive ? 'pb-32' : 'pb-12'}`}>

        {/* Title + meta */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 leading-snug mb-2">{proposal.title}</h1>
          <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-400">
            {proposal.proposal_number && <span className="font-medium text-gray-500">{proposal.proposal_number}</span>}
            <span>Emitida em {fmtDate(proposal.created_at)}</span>
            {proposal.valid_until && <span>Válida até {fmtDate(proposal.valid_until)}</span>}
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-2 gap-8">
            {/* Fornecedor — always left */}
            <div>
              <p className="text-[11px] text-gray-400 uppercase tracking-wide font-semibold mb-1">Fornecedor</p>
              <p className="text-sm font-semibold text-gray-900">{displayName}</p>
              {profile.email_business && (
                <p className="text-xs text-gray-500 mt-0.5">{profile.email_business}</p>
              )}
              {profile.phone && (
                <p className="text-xs text-gray-500 mt-0.5">{profile.phone}</p>
              )}
            </div>
            {/* Cliente — right, empty column when absent keeps layout stable */}
            {proposal.clients ? (
              <div>
                <p className="text-[11px] text-gray-400 uppercase tracking-wide font-semibold mb-1">Para</p>
                <p className="text-sm font-semibold text-gray-900">{proposal.clients.name}</p>
                {proposal.clients.email && <p className="text-xs text-gray-500 mt-0.5">{proposal.clients.email}</p>}
              </div>
            ) : (
              <div />
            )}
          </div>
        </div>

        {/* Status banner */}
        {(isFinal || isInactive) && (
          <div className={`flex items-start gap-2.5 px-4 py-3.5 rounded-xl text-sm font-medium ${
            proposal.status === 'aceita'   ? 'bg-green-50 text-green-700 border border-green-100'
            : proposal.status === 'recusada' ? 'bg-gray-100 text-gray-600'
            : 'bg-amber-50 text-amber-800 border border-amber-100'
          }`}>
            {proposal.status === 'aceita' && (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Proposta aceita — obrigado! Entraremos em contato em breve.</span>
              </>
            )}
            {proposal.status === 'recusada' && (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Esta proposta foi recusada.</span>
              </>
            )}
            {proposal.status === 'expirada' && (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                </svg>
                <span>
                  Esta proposta expirou em {fmtDate(proposal.valid_until)}. Entre em contato com{' '}
                  <strong>{displayName}</strong> para solicitar uma nova versão.
                </span>
              </>
            )}
            {proposal.status === 'cancelada' && (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                </svg>
                <span>
                  Esta proposta foi cancelada. Entre em contato com{' '}
                  <strong>{displayName}</strong> para mais informações.
                </span>
              </>
            )}
          </div>
        )}

        {/* Legacy service_description (proposals without sections) */}
        {proposal.service_description && sections.length === 0 && (
          <div>
            <h2 className="text-sm font-bold text-gray-700 mb-3 pl-2.5 leading-snug"
              style={{ borderLeft: `2.5px solid ${accent}` }}>
              Escopo do Serviço
            </h2>
            <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
              {proposal.service_description}
            </p>
          </div>
        )}

        {/* Sections */}
        {sections.map(sec => (
          <div key={sec.id}>
            {renderSection(sec, accent, setLightboxUrl)}
          </div>
        ))}

        {/* Terms */}
        {(proposal.deadline_days !== null || proposal.payment_terms) && (
          <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-100">
            {proposal.deadline_days !== null && (
              <div>
                <p className="text-[11px] text-gray-400 uppercase tracking-wide font-semibold mb-1">Prazo de entrega</p>
                <p className="text-sm font-semibold text-gray-900">
                  {proposal.deadline_days} {proposal.deadline_days === 1 ? 'dia' : 'dias'}
                </p>
              </div>
            )}
            {proposal.payment_terms && (
              <div>
                <p className="text-[11px] text-gray-400 uppercase tracking-wide font-semibold mb-1">Forma de pagamento</p>
                <p className="text-sm font-semibold text-gray-900">{proposal.payment_terms}</p>
              </div>
            )}
          </div>
        )}

        {/* Value block */}
        <div className="rounded-2xl px-6 py-8 text-center" style={{ backgroundColor: accent }}>
          <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: 'rgba(255,255,255,0.7)' }}>
            Valor Total
          </p>
          <p className="font-bold text-white" style={{ fontSize: '2.25rem', lineHeight: 1.1 }}>
            {fmtBRL(proposal.value)}
          </p>
        </div>

        {/* Baixar PDF */}
        {proposal.pdf_url && (
          <div className="flex justify-center">
            <a
              href={proposal.pdf_url}
              download={proposal.proposal_number ? `${proposal.proposal_number}.pdf` : 'proposta.pdf'}
              className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors border border-gray-200 rounded-lg px-3 py-1.5"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Baixar PDF
            </a>
          </div>
        )}

      </main>

      {/* ── Sticky action bar ──────────────────────────────── */}
      {!isFinal && !isInactive && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100 shadow-2xl px-4 py-3"
          style={{ paddingBottom: 'max(12px, env(safe-area-inset-bottom))' }}>
          <div className="max-w-2xl mx-auto">
            {actionError && (
              <p className="text-xs text-red-500 text-center mb-2">{actionError}</p>
            )}
            <div className="flex gap-2.5">
              <button
                onClick={() => setConfirm('decline')}
                disabled={acting !== null}
                className="flex-none flex items-center justify-center gap-1.5 py-3 px-5 rounded-xl text-gray-600 font-semibold text-sm border border-gray-200 bg-white hover:bg-gray-50 transition-colors disabled:opacity-60"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
                Recusar
              </button>
              <button
                onClick={() => setConfirm('accept')}
                disabled={acting !== null}
                style={{ backgroundColor: accent }}
                className="flex-1 flex items-center justify-center gap-2 py-3 px-5 rounded-xl text-white font-bold text-sm transition-opacity disabled:opacity-60"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                Aceitar esta proposta
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Footer ─────────────────────────────────────────── */}
      <footer className="text-center py-6">
        <p className="text-xs text-gray-300">Enviado via FreelanceFlow</p>
      </footer>

      {/* ── Confirmation modal ─────────────────────────────── */}
      {confirm && (
        <div
          className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/40 px-4"
          onClick={() => { if (acting === null) setConfirm(null) }}
        >
          <div
            className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 mb-4 sm:mb-0"
            onClick={e => e.stopPropagation()}
          >
            {confirm === 'accept' ? (
              <>
                <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: `${accent}20` }}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke={accent} strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-base font-bold text-gray-900 text-center mb-1">Aceitar proposta?</h2>
                <p className="text-sm text-gray-500 text-center mb-6">Ao confirmar, o fornecedor será notificado do aceite.</p>
                <button
                  onClick={async () => { await handleAction('accept'); setConfirm(null) }}
                  disabled={acting !== null}
                  style={{ backgroundColor: accent }}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-white font-bold text-sm mb-2 disabled:opacity-60"
                >
                  {acting === 'accept' && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                  Sim, aceitar
                </button>
              </>
            ) : (
              <>
                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <h2 className="text-base font-bold text-gray-900 text-center mb-1">Recusar proposta?</h2>
                <p className="text-sm text-gray-500 text-center mb-6">Esta ação não pode ser desfeita.</p>
                <button
                  onClick={async () => { await handleAction('decline'); setConfirm(null) }}
                  disabled={acting !== null}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gray-800 text-white font-bold text-sm mb-2 disabled:opacity-60"
                >
                  {acting === 'decline' && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                  Sim, recusar
                </button>
              </>
            )}
            <button
              onClick={() => setConfirm(null)}
              disabled={acting !== null}
              className="w-full py-2.5 text-sm text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* ── Lightbox ───────────────────────────────────────── */}
      {lightboxUrl && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90"
          onClick={() => setLightboxUrl(null)}
        >
          <button
            type="button"
            onClick={() => setLightboxUrl(null)}
            className="absolute top-4 right-4 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-2 transition-colors"
            aria-label="Fechar"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={lightboxUrl}
            alt="Imagem ampliada"
            className="max-w-[95vw] max-h-[90vh] object-contain rounded-lg"
            onClick={e => e.stopPropagation()}
          />
        </div>
      )}

    </div>
  )
}
