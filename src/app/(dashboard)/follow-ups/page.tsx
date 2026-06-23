'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

// ── Types ─────────────────────────────────────────────────────────────────────

type ScheduledItem = {
  proposal_id:     string
  proposal_number: string | null
  title:           string
  client_name:     string | null
  rule:            'R1' | 'R2' | 'expires_tomorrow'
  scheduled_date:  string
}

type SentItem = {
  id:              string
  proposal_id:     string | null
  proposal_number: string | null
  title:           string
  client_name:     string | null
  rule:            string
  sent_at:         string
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const RULE_CFG: Record<string, { label: string; cls: string }> = {
  R1:               { label: 'Lembrete de visualização', cls: 'bg-blue-50 text-blue-700 border border-blue-100' },
  R2:               { label: 'Lembrete de resposta',     cls: 'bg-amber-50 text-amber-700 border border-amber-100' },
  expires_tomorrow: { label: 'Expiração iminente',       cls: 'bg-red-50 text-red-700 border border-red-100' },
}

function ruleLabel(rule: string) { return RULE_CFG[rule]?.label ?? rule }
function ruleCls(rule: string)   { return RULE_CFG[rule]?.cls   ?? 'bg-gray-100 text-gray-600' }

function fmtScheduledDate(ymd: string): string {
  const today    = new Date().toLocaleDateString('sv', { timeZone: 'America/Sao_Paulo' })
  const tomorrowDt = new Date(Date.now() + 86_400_000)
  const tomorrow = tomorrowDt.toLocaleDateString('sv', { timeZone: 'America/Sao_Paulo' })

  if (ymd === today)    return 'Hoje'
  if (ymd === tomorrow) return 'Amanhã'

  const [y, m, d] = ymd.split('-').map(Number)
  return new Intl.DateTimeFormat('pt-BR', { day: 'numeric', month: 'short' }).format(new Date(y, m - 1, d))
}

function fmtSentDate(iso: string): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
    timeZone: 'America/Sao_Paulo',
  }).format(new Date(iso))
}

// ── Sub-components ────────────────────────────────────────────────────────────

function RuleBadge({ rule }: { rule: string }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${ruleCls(rule)}`}>
      {ruleLabel(rule)}
    </span>
  )
}

function ScheduledCard({ item }: { item: ScheduledItem }) {
  const isToday   = item.scheduled_date === new Date().toLocaleDateString('sv', { timeZone: 'America/Sao_Paulo' })
  const isExpiry  = item.rule === 'expires_tomorrow'

  return (
    <Link
      href={`/propostas/${item.proposal_id}`}
      className="group block bg-white border border-gray-100 rounded-xl p-4 shadow-sm hover:border-gray-200 hover:shadow-md transition-all"
    >
      <div className="flex items-start justify-between gap-3 mb-2.5">
        <p className="text-sm font-semibold text-gray-900 leading-snug line-clamp-2 group-hover:text-[#1D9E75] transition-colors">
          {item.title}
        </p>
        <RuleBadge rule={item.rule} />
      </div>

      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
        {item.client_name && (
          <span className="flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            {item.client_name}
          </span>
        )}
        {item.proposal_number && (
          <span className="text-gray-400 font-mono text-[11px]">{item.proposal_number}</span>
        )}
      </div>

      <div className={`mt-3 flex items-center gap-1.5 text-xs font-medium ${
        isExpiry ? 'text-red-600' : isToday ? 'text-[#1D9E75]' : 'text-gray-600'
      }`}>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        Previsto para {fmtScheduledDate(item.scheduled_date)}
      </div>
    </Link>
  )
}

function SentCard({ item }: { item: SentItem }) {
  const inner = (
    <div className="flex items-center gap-3 bg-white border border-gray-100 rounded-xl px-4 py-3 shadow-sm hover:border-gray-200 transition-colors">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-1">
          <p className="text-sm font-medium text-gray-800 truncate">{item.title}</p>
          <RuleBadge rule={item.rule} />
        </div>
        <div className="flex items-center gap-x-3 gap-y-0.5 flex-wrap text-xs text-gray-400">
          {item.client_name && <span>{item.client_name}</span>}
          {item.proposal_number && <span className="font-mono">{item.proposal_number}</span>}
          <span>Enviado em {fmtSentDate(item.sent_at)}</span>
        </div>
      </div>
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-300 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
      </svg>
    </div>
  )

  if (item.proposal_id) {
    return <Link href={`/propostas/${item.proposal_id}`} className="block group">{inner}</Link>
  }
  return <div>{inner}</div>
}

// ── Page ──────────────────────────────────────────────────────────────────────

const SENT_LIMIT = 10

export default function FollowUpsPage() {
  const [scheduled, setScheduled] = useState<ScheduledItem[]>([])
  const [sent,      setSent]      = useState<SentItem[]>([])
  const [loading,   setLoading]   = useState(true)
  const [showAll,   setShowAll]   = useState(false)

  useEffect(() => {
    fetch('/api/follow-ups/central')
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(({ scheduled: s, sent: v }) => {
        setScheduled(s ?? [])
        setSent(v ?? [])
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const visibleSent = showAll ? sent : sent.slice(0, SENT_LIMIT)
  const hiddenCount = sent.length - SENT_LIMIT

  return (
    <div className="p-6 md:p-8 max-w-2xl">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Follow-ups</h1>
        <p className="text-sm text-gray-500 mt-0.5">Central de acompanhamento automático de propostas</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <div className="w-6 h-6 border-2 border-[#1D9E75] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-10">

          {/* ── Seção 1: Agendados ───────────────────────────────────────── */}
          <section>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-7 h-7 rounded-lg bg-[#1D9E75]/10 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#1D9E75]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-base font-semibold text-gray-900">
                Agendados
              </h2>
              <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                scheduled.length > 0
                  ? 'bg-[#1D9E75] text-white'
                  : 'bg-gray-100 text-gray-400'
              }`}>
                {scheduled.length}
              </span>
            </div>

            <p className="text-xs text-gray-400 mb-4">
              Propostas que receberão follow-up automático nos próximos 7 dias.
            </p>

            {scheduled.length === 0 ? (
              <div className="bg-white border border-gray-100 rounded-xl px-6 py-10 text-center shadow-sm">
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-sm font-medium text-gray-700">Nenhum follow-up agendado</p>
                <p className="text-xs text-gray-400 mt-1">Sem disparos previstos para os próximos 7 dias.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {scheduled.map(item => (
                  <ScheduledCard key={`${item.proposal_id}-${item.rule}`} item={item} />
                ))}
              </div>
            )}

            <div className="mt-3 flex justify-end">
              <Link
                href="/configuracoes?tab=followups"
                className="text-xs text-gray-400 hover:text-[#1D9E75] transition-colors"
              >
                Configurar follow-ups →
              </Link>
            </div>
          </section>

          {/* ── Seção 2: Enviados ────────────────────────────────────────── */}
          <section>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <h2 className="text-base font-semibold text-gray-900">
                Enviados
              </h2>
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-gray-100 text-gray-500">
                {sent.length}
              </span>
            </div>

            {sent.length === 0 ? (
              <div className="bg-white border border-gray-100 rounded-xl px-6 py-10 text-center shadow-sm">
                <p className="text-sm text-gray-400">Nenhum follow-up enviado ainda.</p>
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  {visibleSent.map(item => (
                    <SentCard key={item.id} item={item} />
                  ))}
                </div>

                {!showAll && hiddenCount > 0 && (
                  <button
                    type="button"
                    onClick={() => setShowAll(true)}
                    className="mt-3 w-full py-2.5 text-xs text-gray-500 hover:text-gray-700 border border-dashed border-gray-200 rounded-xl hover:border-gray-300 transition-colors"
                  >
                    Ver mais {hiddenCount} enviado{hiddenCount !== 1 ? 's' : ''} ↓
                  </button>
                )}

                {showAll && hiddenCount > 0 && (
                  <button
                    type="button"
                    onClick={() => setShowAll(false)}
                    className="mt-3 w-full py-2.5 text-xs text-gray-500 hover:text-gray-700 border border-dashed border-gray-200 rounded-xl hover:border-gray-300 transition-colors"
                  >
                    Ocultar ↑
                  </button>
                )}
              </>
            )}
          </section>

        </div>
      )}
    </div>
  )
}
