'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-browser'
import type { RealtimeChannel } from '@supabase/supabase-js'

export type TimelineEvent = {
  id: string
  event_type: string
  metadata: Record<string, unknown>
  created_at: string
}

const EVENT_CONFIG: Record<string, { label: string; dot: string; line: string; icon?: 'bell' }> = {
  created:         { label: 'Proposta criada',                              dot: 'bg-gray-500',   line: 'bg-gray-100'   },
  sent:            { label: 'Proposta enviada',                             dot: 'bg-blue-700',   line: 'bg-blue-100'   },
  viewed:          { label: 'Visualizada pelo cliente',                     dot: 'bg-yellow-500', line: 'bg-yellow-100' },
  accepted:        { label: 'Proposta aceita',                              dot: 'bg-[#1D9E75]',  line: 'bg-emerald-50' },
  declined:        { label: 'Proposta recusada',                            dot: 'bg-red-700',    line: 'bg-red-100'    },
  cancelled:       { label: 'Proposta cancelada',                           dot: 'bg-red-900',    line: 'bg-red-200'    },
  expired:         { label: 'Proposta expirada',                            dot: 'bg-orange-700', line: 'bg-orange-100' },
  follow_up_sent:  { label: 'Follow-up enviado ao cliente',                 dot: 'bg-gray-400',   line: 'bg-gray-100',  icon: 'bell' },
}

const WAITING_STATUSES = new Set(['enviada', 'visualizada'])
const VISIBLE = 3

// ── Display list ──────────────────────────────────────────────────────────────

type SingleItem    = { kind: 'single'; ev: TimelineEvent }
type ViewGroupItem = { kind: 'view_group'; dayKey: string; dayLabel: string; events: TimelineEvent[] }
type DisplayItem   = SingleItem | ViewGroupItem

function dayKey(iso: string) { return iso.slice(0, 10) }

function fmtDay(key: string) {
  const [y, m, d] = key.split('-').map(Number)
  return new Intl.DateTimeFormat('pt-BR', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(y, m - 1, d))
}

function fmtTime(iso: string) {
  return new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' }).format(new Date(iso))
}

function fmtDateTime(iso: string) {
  const date = new Intl.DateTimeFormat('pt-BR', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(iso))
  const time = fmtTime(iso)
  return `${date}, ${time}`
}

function buildDisplayList(events: TimelineEvent[]): DisplayItem[] {
  // Group viewed events by calendar day (desc order preserved — first seen = most recent)
  const viewsByDay = new Map<string, TimelineEvent[]>()
  for (const ev of events) {
    if (ev.event_type === 'viewed') {
      const k = dayKey(ev.created_at)
      const arr = viewsByDay.get(k) ?? []
      arr.push(ev)
      viewsByDay.set(k, arr)
    }
  }

  const emitted = new Set<string>()
  const items: DisplayItem[] = []

  for (const ev of events) {
    if (ev.event_type !== 'viewed') {
      items.push({ kind: 'single', ev })
    } else {
      const k = dayKey(ev.created_at)
      if (!emitted.has(k)) {
        emitted.add(k)
        items.push({
          kind: 'view_group',
          dayKey: k,
          dayLabel: fmtDay(k),
          events: viewsByDay.get(k)!,
        })
      }
    }
  }

  return items
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function ProposalTimeline({
  proposalId,
  initialEvents,
  initialStatus,
}: {
  proposalId: string
  initialEvents: TimelineEvent[]
  initialStatus: string
}) {
  const router = useRouter()
  const [events, setEvents]         = useState<TimelineEvent[]>(initialEvents)
  const [status, setStatus]         = useState(initialStatus)
  const [showAll, setShowAll] = useState(false)
  const latestStatus = useRef(initialStatus)
  const channelRef   = useRef<RealtimeChannel | null>(null)

  useEffect(() => {
    setStatus(initialStatus)
    latestStatus.current = initialStatus
  }, [initialStatus])

  // Merge server events with any Realtime-received events not yet in the server list.
  useEffect(() => {
    setEvents(prev => {
      const serverIds = new Set(initialEvents.map(e => e.id))
      const realtimeOnly = prev.filter(e => !serverIds.has(e.id))
      return [...realtimeOnly, ...initialEvents]
    })
  }, [initialEvents])

  useEffect(() => {
    const supabase = createClient()

    const channel = supabase
      .channel(`timeline-${proposalId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'proposal_events', filter: `proposal_id=eq.${proposalId}` },
        (payload) => {
          const ev = payload.new as TimelineEvent
          setEvents(prev => prev.some(e => e.id === ev.id) ? prev : [ev, ...prev])
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'proposals', filter: `id=eq.${proposalId}` },
        (payload) => {
          const newStatus = (payload.new as { status: string }).status
          if (newStatus !== latestStatus.current) {
            latestStatus.current = newStatus
            setStatus(newStatus)
          }
          // Always refresh — picks up new viewed events even when status didn't change
          router.refresh()
        }
      )
      .subscribe((s) => {
        if (s === 'SUBSCRIBED') console.log('[ProposalTimeline] Realtime conectado —', proposalId)
        if (s === 'CHANNEL_ERROR') console.warn('[ProposalTimeline] Realtime erro — tabelas na publicação supabase_realtime?')
      })

    channelRef.current = channel
    return () => { supabase.removeChannel(channel) }
  }, [proposalId, router])

  const displayList = buildDisplayList(events)
  const showWaiting = WAITING_STATUSES.has(status)
  const hiddenItems   = Math.max(0, displayList.length - VISIBLE)
  const visibleItems  = showAll ? displayList : displayList.slice(0, VISIBLE)

  function ViewGroupNode({ item, isLast }: { item: ViewGroupItem; isLast: boolean }) {
    const count = item.events.length
    // events sorted desc — events[0] is the most recent
    const lastTime = fmtTime(item.events[0].created_at)
    const subtitle = count === 1
      ? `${item.dayLabel}, ${lastTime}`
      : `${item.dayLabel}, ${count} vezes, última ${lastTime}`

    return (
      <li className="flex gap-3">
        <div className="flex flex-col items-center">
          <span className="w-2.5 h-2.5 rounded-full shrink-0 mt-1 bg-yellow-500" />
          {!isLast && <span className="w-px flex-1 my-1 bg-yellow-100" />}
        </div>
        <div className={`flex-1 min-w-0 ${isLast ? 'pb-0' : 'pb-3'}`}>
          <p className="text-[13px] font-medium text-gray-800">Visualizada pelo cliente</p>
          <p className="text-[11px] text-gray-400 mt-0.5">{subtitle}</p>
        </div>
      </li>
    )
  }

  function SingleNode({ item, isLast }: { item: SingleItem; isLast: boolean }) {
    const cfg = EVENT_CONFIG[item.ev.event_type] ?? { label: item.ev.event_type, dot: 'bg-gray-300', line: 'bg-gray-100' }

    let label = cfg.label
    if (item.ev.event_type === 'sent') {
      const channel = item.ev.metadata?.channel as string | undefined
      if (channel === 'whatsapp') {
        label = '💬 Enviada pelo WhatsApp'
      } else if (channel === 'email' || item.ev.metadata?.recipient_email) {
        label = '📧 Enviada por e-mail'
      }
      // else: label stays 'Proposta enviada' (fallback for old events)
    }
    if (item.ev.event_type === 'follow_up_sent') {
      const rule = item.ev.metadata?.rule as string | undefined
      label = rule === 'R1'
        ? 'Follow-up enviado — lembrete de visualização'
        : rule === 'R2'
        ? 'Follow-up enviado — lembrete de resposta'
        : rule === 'expires_tomorrow'
        ? 'Follow-up enviado — aviso de expiração iminente'
        : 'Follow-up enviado'
    }

    return (
      <li className="flex gap-3">
        <div className="flex flex-col items-center">
          {cfg.icon === 'bell' ? (
            <span className="w-2.5 h-2.5 shrink-0 mt-1 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-2.5 h-2.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </span>
          ) : (
            <span className={`w-2.5 h-2.5 rounded-full shrink-0 mt-1 ${cfg.dot}`} />
          )}
          {!isLast && <span className={`w-px flex-1 my-1 ${cfg.line}`} />}
        </div>
        <div className={`flex-1 min-w-0 ${isLast ? 'pb-0' : 'pb-3'}`}>
          <p className="text-[13px] font-medium text-gray-800">{label}</p>
          <p className="text-[11px] text-gray-400 mt-0.5">{fmtDateTime(item.ev.created_at)}</p>
        </div>
      </li>
    )
  }

  return (
    <div className="px-4 py-4">
      {displayList.length === 0 && !showWaiting ? (
        <p className="text-sm text-gray-400 text-center py-2">Nenhum evento registrado</p>
      ) : (
        <ol>
          {/* Aguardando — só para status pendentes */}
          {showWaiting && (
            <li className="flex gap-3">
              <div className="flex flex-col items-center">
                <span className="w-2.5 h-2.5 rounded-full border-2 border-gray-300 bg-white shrink-0 mt-1" />
                {displayList.length > 0 && <span className="w-px flex-1 my-1 bg-gray-100" />}
              </div>
              <div className="pb-3 flex-1 min-w-0">
                <p className="text-[13px] text-gray-400">Aguardando…</p>
              </div>
            </li>
          )}

          {visibleItems.map((item, i) => {
            const isLast = i === visibleItems.length - 1 && (showAll || hiddenItems === 0)
            return item.kind === 'view_group'
              ? <ViewGroupNode key={item.dayKey} item={item} isLast={isLast} />
              : <SingleNode key={item.ev.id} item={item} isLast={isLast} />
          })}

          {!showAll && hiddenItems > 0 && (
            <li className="flex gap-3">
              <div className="w-2.5 shrink-0 mt-1" />
              <div className="flex-1 min-w-0">
                <button
                  type="button"
                  onClick={() => setShowAll(true)}
                  className="text-[11px] text-gray-400 hover:text-gray-600 transition-colors"
                >
                  Ver {hiddenItems} evento{hiddenItems !== 1 ? 's' : ''} anterior{hiddenItems !== 1 ? 'es' : ''} ↓
                </button>
              </div>
            </li>
          )}

          {showAll && hiddenItems > 0 && (
            <li className="flex gap-3 mt-1">
              <div className="w-2.5 shrink-0 mt-1" />
              <div className="flex-1 min-w-0">
                <button
                  type="button"
                  onClick={() => setShowAll(false)}
                  className="text-[11px] text-gray-400 hover:text-gray-600 transition-colors"
                >
                  Ocultar anteriores ↑
                </button>
              </div>
            </li>
          )}
        </ol>
      )}
    </div>
  )
}
