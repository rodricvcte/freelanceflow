import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import ProposalActions from '@/components/proposals/ProposalActions'

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
  created_at: string
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

// ─── Helpers ─────────────────────────────────────────────────────────────────

const STATUS_CONFIG = {
  rascunho:    { label: 'Rascunho',    cls: 'bg-gray-100 text-gray-500' },
  enviada:     { label: 'Enviada',     cls: 'bg-blue-100 text-blue-700' },
  visualizada: { label: 'Visualizada', cls: 'bg-yellow-100 text-yellow-700' },
  aprovada:    { label: 'Aprovada',    cls: 'bg-[#1D9E75]/10 text-[#1D9E75]' },
  reprovada:   { label: 'Reprovada',   cls: 'bg-red-100 text-red-700' },
  expirada:    { label: 'Expirada',    cls: 'bg-orange-100 text-orange-700' },
} as const

const EVENT_CONFIG: Record<string, { label: string; dot: string; ring: string }> = {
  viewed:   { label: 'Visualizada pelo cliente', dot: 'bg-blue-500',   ring: 'ring-blue-100'  },
  accepted: { label: 'Proposta aceita',          dot: 'bg-green-500',  ring: 'ring-green-100' },
  declined: { label: 'Proposta recusada',        dot: 'bg-red-500',    ring: 'ring-red-100'   },
  sent:     { label: 'Proposta enviada',         dot: 'bg-gray-400',   ring: 'ring-gray-100'  },
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

function fmtDateTime(iso: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  }).format(new Date(iso))
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

  const [proposalRes, eventsRes, followUpsRes] = await Promise.all([
    supabase
      .from('proposals')
      .select('id, title, service_description, value, payment_terms, deadline_days, valid_until, status, pdf_url, token, created_at, clients(id, name, email, phone)')
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
  ])

  if (!proposalRes.data) notFound()

  const proposal = proposalRes.data as unknown as ProposalRow
  const events   = (eventsRes.data  ?? []) as EventRow[]
  const followUps = (followUpsRes.data ?? []) as FollowUpRow[]

  const statusCfg = STATUS_CONFIG[proposal.status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.rascunho
  const ref       = '#' + proposal.token.substring(0, 8).toUpperCase()

  const clientsRaw = (proposalRes.data as Record<string, unknown>).clients
  const client = Array.isArray(clientsRaw)
    ? (clientsRaw[0] as ProposalRow['clients']) ?? null
    : clientsRaw as ProposalRow['clients']

  return (
    <div className="p-6 md:p-8 max-w-5xl">

      {/* ── Back + Header ── */}
      <div className="flex items-start gap-3 mb-6">
        <Link
          href="/propostas"
          className="mt-1 p-1.5 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-100 shrink-0"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2.5 mb-1">
            <h1 className="text-2xl font-bold text-gray-900 truncate">{proposal.title}</h1>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium shrink-0 ${statusCfg.cls}`}>
              {statusCfg.label}
            </span>
          </div>
          <p className="text-sm text-gray-400">{ref} · Criada em {fmtDate(proposal.created_at)}{proposal.valid_until ? ` · Válida até ${fmtDate(proposal.valid_until)}` : ''}</p>
        </div>
      </div>

      {/* ── Stats row ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
        <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
          <p className="text-xs text-gray-400 mb-1">Valor total</p>
          <p className="text-xl font-bold text-gray-900">{fmtBRL(proposal.value)}</p>
        </div>
        <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
          <p className="text-xs text-gray-400 mb-1">Cliente</p>
          <p className="text-sm font-semibold text-gray-900 truncate">{client?.name ?? '—'}</p>
          {client?.email && <p className="text-xs text-gray-500 truncate mt-0.5">{client.email}</p>}
        </div>
        <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm col-span-2 sm:col-span-1">
          <p className="text-xs text-gray-400 mb-1">Prazo / Pagamento</p>
          <p className="text-sm font-semibold text-gray-900">
            {proposal.deadline_days !== null ? `${proposal.deadline_days} dias` : '—'}
          </p>
          {proposal.payment_terms && (
            <p className="text-xs text-gray-500 truncate mt-0.5">{proposal.payment_terms}</p>
          )}
        </div>
      </div>

      {/* ── Actions + PDF (client component) ── */}
      <div className="mb-6">
        <ProposalActions
          proposalId={proposal.id}
          token={proposal.token}
          initialPdfUrl={proposal.pdf_url}
          duplicate={{
            title:               proposal.title,
            service_description: proposal.service_description,
            value:               proposal.value,
            payment_terms:       proposal.payment_terms,
            deadline_days:       proposal.deadline_days,
            valid_until:         proposal.valid_until,
          }}
        />
      </div>

      {/* ── Two-column layout ── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

        {/* Left: service + timeline */}
        <div className="lg:col-span-3 space-y-6">

          {/* Service description */}
          {proposal.service_description && (
            <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Escopo do Serviço</p>
              <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{proposal.service_description}</p>
            </div>
          )}

          {/* Timeline */}
          <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4">Linha do tempo</p>

            {events.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">Nenhum evento registrado ainda.</p>
            ) : (
              <ol className="relative">
                {events.map((ev, i) => {
                  const cfg = EVENT_CONFIG[ev.event_type] ?? {
                    label: ev.event_type,
                    dot: 'bg-gray-300',
                    ring: 'ring-gray-100',
                  }
                  const isLast = i === events.length - 1
                  return (
                    <li key={ev.id} className="flex gap-3">
                      {/* Connector */}
                      <div className="flex flex-col items-center">
                        <div className={`w-3 h-3 rounded-full ring-4 shrink-0 mt-0.5 ${cfg.dot} ${cfg.ring}`} />
                        {!isLast && <div className="w-px flex-1 bg-gray-100 my-1" />}
                      </div>
                      {/* Content */}
                      <div className={`pb-4 flex-1 min-w-0 ${isLast ? '' : ''}`}>
                        <p className="text-sm font-medium text-gray-900">{cfg.label}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{fmtDateTime(ev.created_at)}</p>
                      </div>
                    </li>
                  )
                })}
              </ol>
            )}
          </div>
        </div>

        {/* Right: follow-ups */}
        <div className="lg:col-span-2">
          <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4">Follow-ups pendentes</p>

            {followUps.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-sm text-gray-400">Nenhum follow-up pendente.</p>
              </div>
            ) : (
              <ul className="space-y-3">
                {followUps.map(fu => (
                  <li key={fu.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    {/* Type icon */}
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${fu.type === 'whatsapp' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
                      {fu.type === 'whatsapp' ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                          <path d="M12 0C5.373 0 0 5.373 0 12c0 2.126.556 4.12 1.524 5.856L0 24l6.29-1.498A11.952 11.952 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.6a9.573 9.573 0 01-4.892-1.344l-.35-.21-3.633.866.929-3.517-.23-.364A9.558 9.558 0 012.4 12c0-5.292 4.308-9.6 9.6-9.6 5.292 0 9.6 4.308 9.6 9.6 0 5.292-4.308 9.6-9.6 9.6z"/>
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 capitalize">{fu.type}</p>
                      {fu.scheduled_for && (
                        <p className="text-xs text-gray-500 mt-0.5">
                          Agendado para {fmtDateTime(fu.scheduled_for)}
                        </p>
                      )}
                      {fu.trigger_rule && (
                        <p className="text-xs text-gray-400 mt-0.5">{fu.trigger_rule}</p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
