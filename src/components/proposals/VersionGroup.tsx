'use client'

import { useState } from 'react'
import Link from 'next/link'

const LIMIT = 2

type VersionRow = {
  id: string
  proposal_number: string | null
  version: number | null
  status: string
  created_at: string
}

type StatusCfg = { label: string; cls: string }
type StatusMap = Record<string, StatusCfg>

function fmtDate(iso: string) {
  const [y, m, d] = iso.split('T')[0].split('-').map(Number)
  return new Intl.DateTimeFormat('pt-BR').format(new Date(y, m - 1, d))
}

function VersionRow({ v, statusMap }: { v: VersionRow; statusMap: StatusMap }) {
  const cfg = statusMap[v.status] ?? statusMap['rascunho']
  return (
    <Link
      href={`/propostas/${v.id}`}
      className="flex items-center gap-2 py-1.5 hover:bg-gray-50 rounded px-2 -mx-2 transition-colors group/row"
    >
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-medium text-gray-700 truncate">
          {v.proposal_number ?? `v${v.version ?? 1}`}
        </p>
        <p className="text-[10px] text-gray-400 mt-0.5">{fmtDate(v.created_at)}</p>
      </div>
      <span className={`shrink-0 inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium ${cfg.cls}`}>
        {cfg.label}
      </span>
      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-gray-300 shrink-0 opacity-0 group-hover/row:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
      </svg>
    </Link>
  )
}

export default function VersionGroup({
  label,
  versions,
  statusMap,
}: {
  label: string
  versions: VersionRow[]
  statusMap: StatusMap
}) {
  const [expanded, setExpanded] = useState(false)

  const visible  = expanded ? versions : versions.slice(0, LIMIT)
  const overflow = versions.length - LIMIT

  return (
    <div className="px-4 py-3">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1">{label}</p>
      <div className="space-y-0.5">
        {visible.map(v => <VersionRow key={v.id} v={v} statusMap={statusMap} />)}
      </div>
      {overflow > 0 && (
        <button
          type="button"
          onClick={() => setExpanded(e => !e)}
          className="mt-1.5 text-[10px] text-gray-400 hover:text-gray-600 transition-colors"
        >
          {expanded ? 'Ocultar ↑' : `Ver mais ${overflow} ${overflow === 1 ? 'versão' : 'versões'} ↓`}
        </button>
      )}
    </div>
  )
}
