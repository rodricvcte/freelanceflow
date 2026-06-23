'use client'

import { useEffect, useRef, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { maskPhone } from '@/lib/masks'

// ── Section types ─────────────────────────────────────────────────────────────

type SectionType = 'text' | 'scope' | 'items' | 'hours' | 'installments' | 'clauses' | 'image' | 'contempla' | 'timeline' | 'custom_table'

type TextSection         = { id: string; type: 'text';         title: string; content: string }
type ScopeSection        = { id: string; type: 'scope';        title: string; items: string[] }
type ItemsSection        = { id: string; type: 'items';        title: string; note_before?: string; note_after?: string; rows: Array<{ description: string; quantity: string; unit_price: string }> }
type HoursSection        = { id: string; type: 'hours';        title: string; note_before?: string; note_after?: string; rows: Array<{ profile: string; hours: string; rate: string }> }
type InstallmentsSection = { id: string; type: 'installments'; title: string; note_before?: string; note_after?: string; rows: Array<{ description: string; percentage: string; condition: string }> }
type ClausesSection      = { id: string; type: 'clauses';      title: string; items: string[] }
type ImageSection        = { id: string; type: 'image';        title: string; note_before?: string; note_after?: string; url: string }
type ContemplasSection   = { id: string; type: 'contempla';    title: string; note_before?: string; note_after?: string; items: string[] }
type TimelineSection     = { id: string; type: 'timeline';     title: string; note_before?: string; note_after?: string; items: Array<{ title: string; description: string }> }
type CustomTableSection  = { id: string; type: 'custom_table'; title: string; note_before?: string; note_after?: string; columns: string[]; rows: string[][] }
type Section = TextSection | ScopeSection | ItemsSection | HoursSection | InstallmentsSection | ClausesSection | ImageSection | ContemplasSection | TimelineSection | CustomTableSection

type Client = { id: string; name: string; email: string | null; phone: string | null }

// ── Constants ─────────────────────────────────────────────────────────────────

const SECTION_META: Record<SectionType, { label: string; description: string }> = {
  text:         { label: 'Texto livre',      description: 'Título e parágrafo de texto' },
  scope:        { label: 'Escopo',           description: 'Lista de bullets hierárquicos' },
  items:        { label: 'Tabela de itens',  description: 'Descrição, quantidade e valor unitário' },
  hours:        { label: 'Tabela de horas',  description: 'Perfil, horas e valor/hora' },
  installments: { label: 'Parcelas',         description: 'Descrição, percentual e condição' },
  clauses:      { label: 'Cláusulas',        description: 'Lista numerada de cláusulas' },
  image:        { label: 'Imagem',           description: 'Foto ou imagem do projeto' },
  contempla:    { label: 'Contempla',        description: 'Grid 2 colunas com itens inclusos (✓)' },
  timeline:     { label: 'Timeline',         description: 'Etapas com título, descrição e linha do tempo' },
  custom_table: { label: 'Tabela personalizada', description: 'Colunas e linhas definidas livremente' },
}

function createSection(type: SectionType): Section {
  const id = crypto.randomUUID()
  switch (type) {
    case 'text':         return { id, type, title: '', content: '' }
    case 'scope':        return { id, type, title: '', items: [''] }
    case 'items':        return { id, type, title: '', rows: [{ description: '', quantity: '', unit_price: '' }] }
    case 'hours':        return { id, type, title: '', rows: [{ profile: '', hours: '', rate: '' }] }
    case 'installments': return { id, type, title: '', rows: [{ description: '', percentage: '', condition: '' }] }
    case 'clauses':      return { id, type, title: '', items: [''] }
    case 'image':        return { id, type, title: '', url: '' }
    case 'contempla':    return { id, type, title: 'O que está incluso', items: [''] }
    case 'timeline':     return { id, type, title: 'Cronograma', items: [{ title: '', description: '' }] }
    case 'custom_table': return { id, type, title: '', columns: ['Coluna 1', 'Coluna 2'], rows: [['', '']] }
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function parseNum(v: string | undefined | null): number {
  if (!v) return 0
  const n = parseFloat(String(v).replace(',', '.'))
  return isNaN(n) ? 0 : n
}

function fmtBRL(v: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)
}

// ── Shared styles ─────────────────────────────────────────────────────────────

const inputCls = 'w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#1D9E75] focus:border-transparent'
const labelCls = 'block text-sm font-medium text-gray-700 mb-1'
const noteCls = 'w-full text-xs text-gray-500 bg-gray-50 border border-dashed border-gray-200 rounded-lg px-2.5 py-1.5 resize-none focus:outline-none focus:border-[#1D9E75] placeholder:text-gray-300'
const noteLabelCls = 'block text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-1'

function CharCount({ value, limit }: { value: string; limit: number }) {
  const len  = value.length
  const over = len > limit
  return (
    <div className="mt-1">
      <p className={`text-right text-[10px] tabular-nums ${over ? 'text-amber-500 font-medium' : 'text-gray-300'}`}>
        {len} / {limit} caracteres
      </p>
      {over && (
        <p className="mt-0.5 text-[10px] text-amber-700 bg-amber-50 border border-amber-200 rounded px-2 py-1 leading-snug">
          Textos muito longos podem afetar a formatação do PDF
        </p>
      )}
    </div>
  )
}

// ── SectionShell ──────────────────────────────────────────────────────────────

function SectionShell({
  section, index, total,
  onTitleChange, onMoveUp, onMoveDown, onRemove,
  noteBefore, noteAfter, onNoteBeforeChange, onNoteAfterChange,
  children,
}: {
  section: Section; index: number; total: number
  onTitleChange: (v: string) => void
  onMoveUp: () => void; onMoveDown: () => void; onRemove: () => void
  noteBefore?: string; noteAfter?: string
  onNoteBeforeChange?: (v: string) => void; onNoteAfterChange?: (v: string) => void
  children: React.ReactNode
}) {
  return (
    <div className="border border-gray-200 rounded-xl bg-white shadow-sm overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 border-b border-gray-100">
        <span className="text-xs font-semibold text-[#1D9E75] uppercase tracking-wide flex-1">
          {SECTION_META[section.type].label}
        </span>
        <button type="button" onClick={onMoveUp} disabled={index === 0} title="Mover para cima"
          className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
          </svg>
        </button>
        <button type="button" onClick={onMoveDown} disabled={index === total - 1} title="Mover para baixo"
          className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        <button type="button" onClick={onRemove} title="Remover seção"
          className="p-1 text-gray-400 hover:text-red-500 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div className="px-4 pt-3 pb-1">
        <input type="text" placeholder="Título da seção" value={section.title}
          onChange={e => onTitleChange(e.target.value)}
          className="w-full text-sm font-semibold text-gray-800 bg-transparent border-0 border-b border-gray-100 focus:outline-none focus:border-[#1D9E75] pb-1.5 placeholder:font-normal placeholder:text-gray-400" />
      </div>
      {noteBefore !== undefined && (
        <div className="px-4 pb-2 border-b border-gray-50">
          <label className={noteLabelCls}>Texto introdutório</label>
          <textarea rows={2} value={noteBefore} onChange={e => onNoteBeforeChange?.(e.target.value)}
            placeholder="Aparece antes do conteúdo (opcional)..." className={noteCls} />
        </div>
      )}
      <div className="px-4 pb-4 pt-3">{children}</div>
      {noteAfter !== undefined && (
        <div className="px-4 pt-2 pb-3 border-t border-gray-50">
          <label className={noteLabelCls}>Nota final</label>
          <textarea rows={2} value={noteAfter} onChange={e => onNoteAfterChange?.(e.target.value)}
            placeholder="Aparece após o conteúdo (opcional)..." className={noteCls} />
        </div>
      )}
    </div>
  )
}

// ── Per-type editors ──────────────────────────────────────────────────────────

function TextEditor({ sec, onUpdate }: { sec: TextSection; onUpdate: (p: Partial<TextSection>) => void }) {
  return (
    <div>
      <textarea rows={4} value={sec.content} onChange={e => onUpdate({ content: e.target.value })}
        placeholder="Digite o conteúdo desta seção..." className={inputCls + ' resize-none w-full'} />
      <CharCount value={sec.content} limit={800} />
    </div>
  )
}

function ListEditor({ items, onChange, placeholder, charLimit }: { items: string[]; onChange: (items: string[]) => void; placeholder: string; charLimit?: number }) {
  const set   = (i: number, v: string) => { const n = [...items]; n[i] = v; onChange(n) }
  const add   = () => onChange([...items, ''])
  const remove = (i: number) => onChange(items.filter((_, idx) => idx !== i))
  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={i} className="flex items-start gap-2">
          <span className="text-gray-400 text-sm select-none w-5 text-right shrink-0 mt-2">•</span>
          <div className="flex-1">
            <input type="text" value={item} onChange={e => set(i, e.target.value)} placeholder={placeholder} className={inputCls + ' w-full'} />
            {charLimit !== undefined && <CharCount value={item} limit={charLimit} />}
          </div>
          <button type="button" onClick={() => remove(i)} disabled={items.length === 1}
            className="text-gray-300 hover:text-red-400 disabled:opacity-20 transition-colors shrink-0 mt-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      ))}
      <button type="button" onClick={add} className="text-xs text-[#1D9E75] font-medium hover:underline mt-1">+ Adicionar item</button>
    </div>
  )
}

function NumberedListEditor({ items, onChange }: { items: string[]; onChange: (items: string[]) => void }) {
  const set    = (i: number, v: string) => { const n = [...items]; n[i] = v; onChange(n) }
  const add    = () => onChange([...items, ''])
  const remove = (i: number) => onChange(items.filter((_, idx) => idx !== i))
  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={i} className="flex items-start gap-2">
          <span className="text-gray-500 text-sm font-semibold shrink-0 w-5 mt-2">{i + 1}.</span>
          <div className="flex-1">
            <textarea rows={2} value={item} onChange={e => set(i, e.target.value)}
              placeholder="Texto da cláusula..." className={inputCls + ' resize-none w-full'} />
            <CharCount value={item} limit={600} />
          </div>
          <button type="button" onClick={() => remove(i)} disabled={items.length === 1}
            className="text-gray-300 hover:text-red-400 disabled:opacity-20 transition-colors shrink-0 mt-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      ))}
      <button type="button" onClick={add} className="text-xs text-[#1D9E75] font-medium hover:underline mt-1">+ Adicionar cláusula</button>
    </div>
  )
}

type RowKey<T> = keyof T & string

function TableEditor<T extends Record<string, string>>({
  rows, onChange, columns,
}: {
  rows: T[]
  onChange: (rows: T[]) => void
  columns: Array<{ key: RowKey<T>; label: string; placeholder: string; flex?: number }>
}) {
  const setCell  = (ri: number, key: RowKey<T>, v: string) => onChange(rows.map((r, i) => i === ri ? { ...r, [key]: v } : r))
  const addRow   = () => onChange([...rows, Object.fromEntries(columns.map(c => [c.key, ''])) as T])
  const removeRow = (i: number) => onChange(rows.filter((_, idx) => idx !== i))
  return (
    <div className="space-y-2">
      <div className="flex gap-2 px-1">
        {columns.map(c => (
          <span key={String(c.key)} style={{ flex: c.flex ?? 1 }} className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{c.label}</span>
        ))}
        <span className="w-6" />
      </div>
      {rows.map((row, ri) => (
        <div key={ri} className="flex gap-2 items-center">
          {columns.map(c => (
            <input key={String(c.key)} type="text" value={row[c.key]}
              onChange={e => setCell(ri, c.key, e.target.value)}
              placeholder={c.placeholder} style={{ flex: c.flex ?? 1 }} className={inputCls} />
          ))}
          <button type="button" onClick={() => removeRow(ri)} disabled={rows.length === 1}
            className="text-gray-300 hover:text-red-400 disabled:opacity-20 transition-colors w-6 shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      ))}
      <button type="button" onClick={addRow} className="text-xs text-[#1D9E75] font-medium hover:underline">+ Adicionar linha</button>
    </div>
  )
}

function TimelineEditor({ sec, onUpdate }: { sec: TimelineSection; onUpdate: (p: Partial<TimelineSection>) => void }) {
  const items = sec.items
  function set(i: number, key: 'title' | 'description', v: string) {
    onUpdate({ items: items.map((item, idx) => idx === i ? { ...item, [key]: v } : item) })
  }
  function add() { onUpdate({ items: [...items, { title: '', description: '' }] }) }
  function remove(i: number) { onUpdate({ items: items.filter((_, idx) => idx !== i) }) }
  function move(i: number, dir: 'up' | 'down') {
    const next = [...items]
    const swap = dir === 'up' ? i - 1 : i + 1
    if (swap < 0 || swap >= next.length) return
    ;[next[i], next[swap]] = [next[swap], next[i]]
    onUpdate({ items: next })
  }
  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <div key={i} className="flex gap-2 items-start">
          <div className="flex flex-col gap-0.5 pt-1 shrink-0">
            <button type="button" onClick={() => move(i, 'up')} disabled={i === 0}
              className="p-0.5 text-gray-300 hover:text-gray-500 disabled:opacity-20 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" /></svg>
            </button>
            <button type="button" onClick={() => move(i, 'down')} disabled={i === items.length - 1}
              className="p-0.5 text-gray-300 hover:text-gray-500 disabled:opacity-20 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
            </button>
          </div>
          <div className="flex items-center gap-2 shrink-0 pt-2">
            <div className="w-2.5 h-2.5 rounded-full bg-[#1D9E75] shrink-0" />
          </div>
          <div className="flex-1 space-y-1.5">
            <input type="text" value={item.title} onChange={e => set(i, 'title', e.target.value)}
              placeholder="Título da etapa (ex: Semana 1 — Onboarding)" className={inputCls} />
            <div>
              <input type="text" value={item.description} onChange={e => set(i, 'description', e.target.value)}
                placeholder="Descrição curta (opcional)" className={inputCls + ' w-full'} />
              <CharCount value={item.description} limit={300} />
            </div>
          </div>
          <button type="button" onClick={() => remove(i)} disabled={items.length === 1}
            className="text-gray-300 hover:text-red-400 disabled:opacity-20 transition-colors shrink-0 mt-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
      ))}
      <button type="button" onClick={add} className="text-xs text-[#1D9E75] font-medium hover:underline mt-1">+ Adicionar etapa</button>
    </div>
  )
}

function ImageEditor({ sec, onUpdate }: { sec: ImageSection; onUpdate: (p: Partial<ImageSection>) => void }) {
  const [uploading, setUploading] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setErr(null)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/proposals/upload-image', { method: 'POST', body: fd })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      onUpdate({ url: data.url })
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Erro ao enviar imagem')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  return (
    <div className="space-y-3">
      {sec.url ? (
        <div className="relative">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={sec.url} alt="Preview" className="w-full max-h-64 object-contain rounded-lg border border-gray-100" />
          <button type="button" onClick={() => onUpdate({ url: '' })}
            className="absolute top-2 right-2 p-1.5 bg-white border border-gray-200 rounded-lg text-gray-400 hover:text-red-500 transition-colors shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl p-8 cursor-pointer hover:border-[#1D9E75] hover:bg-[#1D9E75]/5 transition-colors">
          {uploading ? (
            <div className="w-6 h-6 border-2 border-[#1D9E75] border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-300 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-sm text-gray-500">Clique para enviar imagem</p>
              <p className="text-xs text-gray-400 mt-1">JPG, PNG ou WebP · máx. 5 MB</p>
            </>
          )}
          <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleFile} className="hidden" disabled={uploading} />
        </label>
      )}
      {err && <p className="text-xs text-red-600">{err}</p>}
    </div>
  )
}

function ItemsTableEditor({ rows, onChange }: {
  rows: Array<{ description: string; quantity: string; unit_price: string }>
  onChange: (rows: Array<{ description: string; quantity: string; unit_price: string }>) => void
}) {
  const setCell  = (ri: number, key: string, v: string) => onChange(rows.map((r, i) => i === ri ? { ...r, [key]: v } : r))
  const addRow   = () => onChange([...rows, { description: '', quantity: '', unit_price: '' }])
  const removeRow = (i: number) => onChange(rows.filter((_, idx) => idx !== i))
  const rowTotals = rows.map(r => parseNum(r.quantity) * parseNum(r.unit_price))
  const grandTotal = rowTotals.reduce((a, b) => a + b, 0)
  return (
    <div className="space-y-2">
      <div className="flex gap-2 px-1">
        <span style={{ flex: 3 }} className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Descrição</span>
        <span style={{ flex: 1 }} className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Qtd</span>
        <span style={{ flex: 1.5 }} className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Vlr unitário</span>
        <span style={{ flex: 1.5 }} className="text-xs font-semibold text-gray-400 uppercase tracking-wide text-right">Total</span>
        <span className="w-6" />
      </div>
      {rows.map((row, ri) => (
        <div key={ri} className="flex gap-2 items-center">
          <input type="text" value={row.description} onChange={e => setCell(ri, 'description', e.target.value)} placeholder="Item..." style={{ flex: 3 }} className={inputCls} />
          <input type="text" value={row.quantity} onChange={e => setCell(ri, 'quantity', e.target.value)} placeholder="1" style={{ flex: 1 }} className={inputCls} />
          <input type="text" value={row.unit_price} onChange={e => setCell(ri, 'unit_price', e.target.value)} placeholder="R$ 0,00" style={{ flex: 1.5 }} className={inputCls} />
          <span style={{ flex: 1.5 }} className="text-sm text-right text-gray-600 tabular-nums px-1 shrink-0">{fmtBRL(rowTotals[ri])}</span>
          <button type="button" onClick={() => removeRow(ri)} disabled={rows.length === 1}
            className="text-gray-300 hover:text-red-400 disabled:opacity-20 transition-colors w-6 shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      ))}
      <div className="flex items-center gap-2 px-1 pt-2 border-t border-gray-100">
        <button type="button" onClick={addRow} className="text-xs text-[#1D9E75] font-medium hover:underline flex-1 text-left">+ Adicionar linha</button>
        <span className="text-xs font-semibold text-gray-700 tabular-nums">Total: {fmtBRL(grandTotal)}</span>
        <span className="w-6" />
      </div>
    </div>
  )
}

function HoursTableEditor({ rows, onChange }: {
  rows: Array<{ profile: string; hours: string; rate: string }>
  onChange: (rows: Array<{ profile: string; hours: string; rate: string }>) => void
}) {
  const setCell  = (ri: number, key: string, v: string) => onChange(rows.map((r, i) => i === ri ? { ...r, [key]: v } : r))
  const addRow   = () => onChange([...rows, { profile: '', hours: '', rate: '' }])
  const removeRow = (i: number) => onChange(rows.filter((_, idx) => idx !== i))
  const rowTotals = rows.map(r => parseNum(r.hours) * parseNum(r.rate))
  const grandTotal = rowTotals.reduce((a, b) => a + b, 0)
  return (
    <div className="space-y-2">
      <div className="flex gap-2 px-1">
        <span style={{ flex: 2 }} className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Perfil</span>
        <span style={{ flex: 1 }} className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Horas</span>
        <span style={{ flex: 1.5 }} className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Vlr/hora</span>
        <span style={{ flex: 1.5 }} className="text-xs font-semibold text-gray-400 uppercase tracking-wide text-right">Total</span>
        <span className="w-6" />
      </div>
      {rows.map((row, ri) => (
        <div key={ri} className="flex gap-2 items-center">
          <input type="text" value={row.profile} onChange={e => setCell(ri, 'profile', e.target.value)} placeholder="Ex: Dev Senior" style={{ flex: 2 }} className={inputCls} />
          <input type="text" value={row.hours} onChange={e => setCell(ri, 'hours', e.target.value)} placeholder="40" style={{ flex: 1 }} className={inputCls} />
          <input type="text" value={row.rate} onChange={e => setCell(ri, 'rate', e.target.value)} placeholder="R$ 100" style={{ flex: 1.5 }} className={inputCls} />
          <span style={{ flex: 1.5 }} className="text-sm text-right text-gray-600 tabular-nums px-1 shrink-0">{fmtBRL(rowTotals[ri])}</span>
          <button type="button" onClick={() => removeRow(ri)} disabled={rows.length === 1}
            className="text-gray-300 hover:text-red-400 disabled:opacity-20 transition-colors w-6 shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      ))}
      <div className="flex items-center gap-2 px-1 pt-2 border-t border-gray-100">
        <button type="button" onClick={addRow} className="text-xs text-[#1D9E75] font-medium hover:underline flex-1 text-left">+ Adicionar linha</button>
        <span className="text-xs font-semibold text-gray-700 tabular-nums">Total: {fmtBRL(grandTotal)}</span>
        <span className="w-6" />
      </div>
    </div>
  )
}

function CustomTableEditor({ sec, onUpdate }: {
  sec: CustomTableSection; onUpdate: (p: Partial<CustomTableSection>) => void
}) {
  function setColTitle(ci: number, v: string) {
    const columns = [...sec.columns]; columns[ci] = v; onUpdate({ columns })
  }
  function addColumn() {
    if (sec.columns.length >= 6) return
    onUpdate({
      columns: [...sec.columns, `Coluna ${sec.columns.length + 1}`],
      rows: sec.rows.map(r => [...r, '']),
    })
  }
  function removeColumn(ci: number) {
    if (sec.columns.length <= 2) return
    onUpdate({
      columns: sec.columns.filter((_, i) => i !== ci),
      rows: sec.rows.map(r => r.filter((_, i) => i !== ci)),
    })
  }
  function setCell(ri: number, ci: number, v: string) {
    onUpdate({ rows: sec.rows.map((r, i) => i === ri ? r.map((c, j) => j === ci ? v : c) : r) })
  }
  function addRow() { onUpdate({ rows: [...sec.rows, sec.columns.map(() => '')] }) }
  function removeRow(ri: number) { onUpdate({ rows: sec.rows.filter((_, i) => i !== ri) }) }

  return (
    <div className="space-y-3">
      {/* Column header editors */}
      <div>
        <div className="flex items-center gap-1.5 mb-1.5">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Colunas</span>
          <span className="text-xs text-gray-300">({sec.columns.length}/6)</span>
        </div>
        <div className="flex gap-1.5 items-center flex-wrap">
          {sec.columns.map((col, ci) => (
            <div key={ci} className="flex items-center gap-1 flex-1 min-w-[80px]">
              <input type="text" value={col} onChange={e => setColTitle(ci, e.target.value)}
                placeholder={`Coluna ${ci + 1}`}
                className="w-full px-2.5 py-1.5 text-xs font-semibold text-gray-700 bg-[#1D9E75]/10 border border-[#1D9E75]/30 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#1D9E75] min-w-0" />
              <button type="button" onClick={() => removeColumn(ci)} disabled={sec.columns.length <= 2}
                className="shrink-0 text-gray-300 hover:text-red-400 disabled:opacity-20 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
          {sec.columns.length < 6 && (
            <button type="button" onClick={addColumn}
              className="shrink-0 flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-[#1D9E75] border border-dashed border-[#1D9E75]/40 rounded-lg hover:bg-[#1D9E75]/5 transition-colors whitespace-nowrap">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              + Coluna
            </button>
          )}
        </div>
      </div>
      {/* Data rows */}
      <div className="space-y-1.5">
        {sec.rows.map((row, ri) => (
          <div key={ri} className="flex gap-1.5 items-center">
            <span className="text-xs text-gray-300 tabular-nums w-4 text-right shrink-0">{ri + 1}</span>
            {row.map((cell, ci) => (
              <input key={ci} type="text" value={cell} onChange={e => setCell(ri, ci, e.target.value)}
                placeholder="—" className={inputCls + ' flex-1 min-w-0'} />
            ))}
            <button type="button" onClick={() => removeRow(ri)} disabled={sec.rows.length === 1}
              className="text-gray-300 hover:text-red-400 disabled:opacity-20 transition-colors shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}
        <button type="button" onClick={addRow} className="text-xs text-[#1D9E75] font-medium hover:underline">+ Adicionar linha</button>
      </div>
    </div>
  )
}

const NOTES_TYPES: SectionType[] = ['items', 'hours', 'installments', 'image', 'contempla', 'timeline', 'custom_table']

function SectionEditor({ section, index, total, onUpdate, onRemove, onMoveUp, onMoveDown }: {
  section: Section; index: number; total: number
  onUpdate: (patch: Partial<Section>) => void
  onRemove: () => void; onMoveUp: () => void; onMoveDown: () => void
}) {
  const supportsNotes = NOTES_TYPES.includes(section.type)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sec = section as any
  return (
    <SectionShell section={section} index={index} total={total}
      onTitleChange={v => onUpdate({ title: v })}
      onMoveUp={onMoveUp} onMoveDown={onMoveDown} onRemove={onRemove}
      noteBefore={supportsNotes ? (sec.note_before ?? '') : undefined}
      noteAfter={supportsNotes ? (sec.note_after ?? '') : undefined}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      onNoteBeforeChange={supportsNotes ? (v: string) => onUpdate({ note_before: v } as any) : undefined}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      onNoteAfterChange={supportsNotes ? (v: string) => onUpdate({ note_after: v } as any) : undefined}
    >
      {section.type === 'text' && <TextEditor sec={section} onUpdate={p => onUpdate(p)} />}
      {section.type === 'scope' && (
        <ListEditor items={section.items} onChange={items => onUpdate({ items })} placeholder="Item do escopo..." />
      )}
      {section.type === 'items' && (
        <ItemsTableEditor rows={section.rows} onChange={rows => onUpdate({ rows })} />
      )}
      {section.type === 'hours' && (
        <HoursTableEditor rows={section.rows} onChange={rows => onUpdate({ rows })} />
      )}
      {section.type === 'installments' && (
        <TableEditor rows={section.rows} onChange={rows => onUpdate({ rows })}
          columns={[
            { key: 'description', label: 'Parcela',  placeholder: 'Ex: Entrada', flex: 2.5 },
            { key: 'percentage',  label: '%',          placeholder: '50%',         flex: 1 },
            { key: 'condition',   label: 'Condição',  placeholder: 'No início',   flex: 2 },
          ]} />
      )}
      {section.type === 'clauses' && (
        <NumberedListEditor items={section.items} onChange={items => onUpdate({ items })} />
      )}
      {section.type === 'image' && (
        <ImageEditor sec={section} onUpdate={p => onUpdate(p)} />
      )}
      {section.type === 'contempla' && (
        <ListEditor items={section.items} onChange={items => onUpdate({ items })} placeholder="Ex: 2 revisões incluídas" charLimit={60} />
      )}
      {section.type === 'timeline' && (
        <TimelineEditor sec={section} onUpdate={p => onUpdate(p)} />
      )}
      {section.type === 'custom_table' && (
        <CustomTableEditor sec={section} onUpdate={p => onUpdate(p)} />
      )}
    </SectionShell>
  )
}

// ── Add-section dropdown ──────────────────────────────────────────────────────

function AddSectionButton({ onAdd }: { onAdd: (type: SectionType) => void }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button type="button" onClick={() => setOpen(v => !v)}
        className="flex items-center gap-2 px-4 py-2.5 border-2 border-dashed border-gray-300 rounded-xl text-sm font-medium text-gray-500 hover:border-[#1D9E75] hover:text-[#1D9E75] transition-colors w-full justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
        Adicionar seção
      </button>
      {open && (
        <div className="absolute left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-10 py-1 overflow-hidden">
          {(Object.keys(SECTION_META) as SectionType[]).map(type => (
            <button key={type} type="button" onClick={() => { onAdd(type); setOpen(false) }}
              className="w-full flex items-start gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors text-left">
              <div>
                <p className="text-sm font-medium text-gray-900">{SECTION_META[type].label}</p>
                <p className="text-xs text-gray-400">{SECTION_META[type].description}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

const EMPTY_FORM = {
  title: '', service_description: '', value: '',
  payment_terms: '', deadline_days: '', valid_until: '', client_id: '',
}
const EMPTY_NEW_CLIENT = { name: '', email: '', phone: '' }

export default function EditarPropostaPage() {
  const { id } = useParams<{ id: string }>()
  const router  = useRouter()

  const [form, setForm]                 = useState(EMPTY_FORM)
  const [sections, setSections]         = useState<Section[]>([])
  const [clients, setClients]           = useState<Client[]>([])
  const [newClient, setNewClient]       = useState(EMPTY_NEW_CLIENT)
  const [showNewClient, setShowNew]     = useState(false)
  const [savingClient, setSavingClient] = useState(false)
  const [loading, setLoading]           = useState(true)
  const [blocked, setBlocked]           = useState(false)
  const [submitting, setSub]            = useState(false)
  const [error, setError]               = useState<string | null>(null)
  const [proposalRef, setProposalRef]   = useState<{ number: string | null; version: number }>({ number: null, version: 1 })

  useEffect(() => {
    Promise.all([
      fetch(`/api/proposals/${id}`).then(r => r.json()),
      fetch('/api/clients').then(r => r.json()),
    ]).then(([proposal, clientList]) => {
      if (proposal.error) { setError(proposal.error); setLoading(false); return }

      if (proposal.status !== 'rascunho') {
        setBlocked(true)
        setLoading(false)
        setTimeout(() => router.replace(`/propostas/${id}`), 2000)
        return
      }

      setForm({
        title:               proposal.title ?? '',
        service_description: proposal.service_description ?? '',
        value:               proposal.value?.toString() ?? '',
        payment_terms:       proposal.payment_terms ?? '',
        deadline_days:       proposal.deadline_days?.toString() ?? '',
        valid_until:         proposal.valid_until ?? '',
        client_id:           proposal.client_id ?? '',
      })
      setSections(Array.isArray(proposal.sections) ? proposal.sections : [])
      setClients(Array.isArray(clientList) ? clientList : [])
      setProposalRef({ number: proposal.proposal_number ?? null, version: proposal.version ?? 1 })
      setLoading(false)
    }).catch(() => { setError('Erro ao carregar proposta'); setLoading(false) })
  }, [id, router])

  function setField(k: keyof typeof EMPTY_FORM, v: string) {
    setForm(p => ({ ...p, [k]: v }))
  }

  function handleClientSelect(v: string) {
    if (v === '__new__') { setShowNew(true); setField('client_id', '__new__') }
    else { setShowNew(false); setField('client_id', v) }
  }

  async function handleSaveClient() {
    if (!newClient.name.trim()) return
    setSavingClient(true)
    try {
      const res = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newClient),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setClients(prev => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)))
      setField('client_id', data.id)
      setShowNew(false)
      setNewClient(EMPTY_NEW_CLIENT)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Erro ao criar cliente')
    } finally {
      setSavingClient(false)
    }
  }

  function addSection(type: SectionType) {
    setSections(prev => [...prev, createSection(type)])
  }

  function removeSection(sid: string) {
    setSections(prev => prev.filter(s => s.id !== sid))
  }

  function moveSection(sid: string, dir: 'up' | 'down') {
    setSections(prev => {
      const idx = prev.findIndex(s => s.id === sid)
      if (idx < 0) return prev
      const next = [...prev]
      const swap = dir === 'up' ? idx - 1 : idx + 1
      if (swap < 0 || swap >= next.length) return prev
      ;[next[idx], next[swap]] = [next[swap], next[idx]]
      return next
    })
  }

  function updateSection(sid: string, patch: Partial<Section>) {
    setSections(prev => prev.map(s => s.id === sid ? { ...s, ...patch } as Section : s))
  }

  const todayMin = (() => {
    const d = new Date()
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  })()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (form.valid_until && form.valid_until < todayMin) {
      setError('A data de validade não pode ser anterior a hoje')
      return
    }
    setError(null)
    setSub(true)
    try {
      const res = await fetch(`/api/proposals/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          sections,
          client_id: form.client_id || null,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      router.push(`/propostas/${id}`)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Erro ao salvar proposta')
      setSub(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-[#1D9E75] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (blocked) {
    return (
      <div className="p-6 md:p-8 max-w-2xl">
        <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          </svg>
          <div>
            <p className="text-sm font-semibold text-amber-900">Edição não permitida</p>
            <p className="text-xs text-amber-700 mt-0.5">Apenas rascunhos podem ser editados. Redirecionando…</p>
          </div>
        </div>
        <Link href={`/propostas/${id}`} className="text-sm text-[#1D9E75] font-medium hover:underline">
          ← Voltar para a proposta
        </Link>
      </div>
    )
  }

  return (
    <div className="p-6 md:p-8 max-w-2xl">
      <div className="flex items-center gap-3 mb-8">
        <Link href={`/propostas/${id}`} className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-100">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Editar Proposta</h1>
          {proposalRef.number && (
            <p className="text-sm text-gray-500 mt-0.5">
              <span className="font-mono text-[#1D9E75] font-semibold">
                {proposalRef.number.replace(/-v\d+$/, '')}-v{proposalRef.version}
              </span>
            </p>
          )}
        </div>
      </div>

      {error && (
        <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* ── Informações gerais ── */}
        <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm space-y-4">
          <h2 className="text-sm font-semibold text-gray-900">Informações gerais</h2>

          <div>
            <label className={labelCls}>Título <span className="text-red-500">*</span></label>
            {proposalRef.version > 1 ? (
              <p className={`${inputCls} bg-gray-50 text-gray-500 cursor-not-allowed`}>{form.title}</p>
            ) : (
              <input type="text" required value={form.title} onChange={e => setField('title', e.target.value)} className={inputCls} />
            )}
          </div>

          <div>
            <label className={labelCls}>Cliente</label>
            <select value={form.client_id} onChange={e => handleClientSelect(e.target.value)} className={inputCls}>
              <option value="">Sem cliente</option>
              {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              <option value="__new__">+ Novo cliente</option>
            </select>
          </div>

          {showNewClient && (
            <div className="border border-dashed border-[#1D9E75]/40 rounded-lg p-4 bg-[#1D9E75]/5 space-y-3">
              <p className="text-xs font-semibold text-[#1D9E75] uppercase tracking-wide">Novo cliente</p>
              <div>
                <label className={labelCls}>Nome <span className="text-red-500">*</span></label>
                <input type="text" value={newClient.name} onChange={e => setNewClient(p => ({ ...p, name: e.target.value }))} placeholder="Nome do cliente" className={inputCls} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Email</label>
                  <input type="email" value={newClient.email} onChange={e => setNewClient(p => ({ ...p, email: e.target.value }))} placeholder="email@cliente.com" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Telefone</label>
                  <input type="tel" value={newClient.phone} onChange={e => setNewClient(p => ({ ...p, phone: maskPhone(e.target.value) }))} placeholder="(11) 99999-9999" className={inputCls} />
                </div>
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={handleSaveClient} disabled={savingClient || !newClient.name.trim()}
                  className="px-4 py-2 bg-[#1D9E75] text-white text-sm font-medium rounded-lg hover:bg-[#188f68] transition-colors disabled:opacity-50">
                  {savingClient ? 'Salvando...' : 'Salvar cliente'}
                </button>
                <button type="button" onClick={() => { setShowNew(false); setField('client_id', '') }}
                  className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  Cancelar
                </button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col">
              <label className={labelCls}>Valor <span className="text-red-500">*</span></label>
              <div className="relative mt-auto">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500 font-medium">R$</span>
                <input type="number" min="0" step="0.01" required value={form.value}
                  onChange={e => setField('value', e.target.value)} className={inputCls + ' pl-9'} />
              </div>
            </div>
            <div className="flex flex-col">
              <label className={labelCls}>Prazo de entrega</label>
              <input type="number" min="1" value={form.deadline_days}
                onChange={e => setField('deadline_days', e.target.value)}
                placeholder="Ex: 30 dias" className={inputCls + ' mt-auto'} />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col">
              <label className={labelCls}>Válida até</label>
              <input type="date" value={form.valid_until}
                onChange={e => setField('valid_until', e.target.value)}
                min={todayMin} placeholder="dd/mm/aaaa" className={inputCls + ' mt-auto'} />
            </div>
            <div className="flex flex-col">
              <label className={labelCls}>Condições de pagamento</label>
              <input type="text" value={form.payment_terms}
                onChange={e => setField('payment_terms', e.target.value)}
                placeholder="Ex: 50% antecipado" className={inputCls + ' mt-auto'} />
            </div>
          </div>

          {/* service_description — kept for backwards compat with old proposals */}
          {form.service_description && (
            <div>
              <label className={labelCls}>Descrição do serviço</label>
              <textarea value={form.service_description}
                onChange={e => setField('service_description', e.target.value)}
                rows={4} className={inputCls + ' resize-none'} />
            </div>
          )}
        </div>

        {/* ── Editor de seções ── */}
        {sections.length > 0 && (
          <div className="space-y-3">
            {sections.map((sec, i) => (
              <SectionEditor
                key={sec.id}
                section={sec}
                index={i}
                total={sections.length}
                onUpdate={patch => updateSection(sec.id, patch)}
                onRemove={() => removeSection(sec.id)}
                onMoveUp={() => moveSection(sec.id, 'up')}
                onMoveDown={() => moveSection(sec.id, 'down')}
              />
            ))}
          </div>
        )}

        <AddSectionButton onAdd={addSection} />

        {/* ── Ações ── */}
        <div className="flex items-center justify-end gap-3 pb-8">
          <Link href={`/propostas/${id}`}
            className="px-4 py-2.5 text-sm font-medium text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            Cancelar
          </Link>
          <button type="submit" disabled={submitting}
            className="flex items-center gap-2 px-6 py-2.5 bg-[#1D9E75] text-white text-sm font-medium rounded-lg hover:bg-[#188f68] transition-colors disabled:opacity-50">
            {submitting && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
            {submitting ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </form>
    </div>
  )
}
