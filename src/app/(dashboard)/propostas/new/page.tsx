'use client'

import { Suspense, useEffect, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

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

type Client  = { id: string; name: string; email: string | null; phone: string | null }
type PlanInfo = { plan: string; used: number; limit: number }

// ── Constants ─────────────────────────────────────────────────────────────────

const SECTION_META: Record<SectionType, { label: string; description: string }> = {
  text:         { label: 'Texto livre',      description: 'Título e parágrafo de texto' },
  scope:        { label: 'Escopo',           description: 'Lista de bullets hierárquicos' },
  items:        { label: 'Tabela de itens',  description: 'Descrição, quantidade e valor unitário' },
  hours:        { label: 'Tabela de horas',  description: 'Perfil, horas e valor/hora' },
  installments: { label: 'Parcelas',         description: 'Descrição, percentual e condição' },
  clauses:      { label: 'Cláusulas',        description: 'Lista numerada de cláusulas' },
  image:        { label: 'Imagem',           description: 'Imagem com título opcional' },
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

function parseNum(v: string | undefined | null): number {
  if (!v) return 0
  const n = parseFloat(String(v).replace(',', '.'))
  return isNaN(n) ? 0 : n
}

function fmtBRL(v: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)
}

// ── Shared input styles ───────────────────────────────────────────────────────

const inputCls = 'w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#1D9E75] focus:border-transparent'
const labelCls = 'block text-sm font-medium text-gray-700 mb-1'

// ── Section shell (header + title input + up/down/remove) ─────────────────────

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
  const meta = SECTION_META[section.type]
  return (
    <div className="border border-gray-200 rounded-xl bg-white shadow-sm overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 border-b border-gray-100">
        <span className="text-xs font-semibold text-[#1D9E75] uppercase tracking-wide flex-1">
          {meta.label}
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
          className="w-full text-sm font-semibold text-gray-800 bg-transparent border-0 border-b border-gray-100 focus:outline-none focus:border-[#1D9E75] pb-1.5 placeholder:font-normal placeholder:text-gray-400"
        />
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

// ── Per-type section editors ──────────────────────────────────────────────────

function TextEditor({ sec, onUpdate }: { sec: TextSection; onUpdate: (patch: Partial<TextSection>) => void }) {
  return (
    <div>
      <textarea rows={4} value={sec.content} onChange={e => onUpdate({ content: e.target.value })}
        placeholder="Digite o conteúdo desta seção..." className={inputCls + ' resize-none w-full'} />
      <CharCount value={sec.content} limit={800} />
    </div>
  )
}

function ListEditor({ items, onChange, placeholder, charLimit }: { items: string[]; onChange: (items: string[]) => void; placeholder: string; charLimit?: number }) {
  function setItem(i: number, v: string) { const n = [...items]; n[i] = v; onChange(n) }
  function addItem() { onChange([...items, '']) }
  function removeItem(i: number) { onChange(items.filter((_, idx) => idx !== i)) }
  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={i} className="flex items-start gap-2">
          <span className="text-gray-400 text-sm select-none w-5 text-right shrink-0 mt-2">•</span>
          <div className="flex-1">
            <input type="text" value={item} onChange={e => setItem(i, e.target.value)} placeholder={placeholder} className={inputCls + ' w-full'} />
            {charLimit !== undefined && <CharCount value={item} limit={charLimit} />}
          </div>
          <button type="button" onClick={() => removeItem(i)} disabled={items.length === 1}
            className="text-gray-300 hover:text-red-400 disabled:opacity-20 transition-colors shrink-0 mt-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      ))}
      <button type="button" onClick={addItem} className="text-xs text-[#1D9E75] font-medium hover:underline mt-1">+ Adicionar item</button>
    </div>
  )
}

function NumberedListEditor({ items, onChange }: { items: string[]; onChange: (items: string[]) => void }) {
  function setItem(i: number, v: string) { const n = [...items]; n[i] = v; onChange(n) }
  function addItem() { onChange([...items, '']) }
  function removeItem(i: number) { onChange(items.filter((_, idx) => idx !== i)) }
  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={i} className="flex items-start gap-2">
          <span className="text-gray-500 text-sm font-semibold shrink-0 w-5 mt-2">{i + 1}.</span>
          <div className="flex-1">
            <textarea rows={2} value={item} onChange={e => setItem(i, e.target.value)} placeholder="Texto da cláusula..." className={inputCls + ' resize-none w-full'} />
            <CharCount value={item} limit={600} />
          </div>
          <button type="button" onClick={() => removeItem(i)} disabled={items.length === 1}
            className="text-gray-300 hover:text-red-400 disabled:opacity-20 transition-colors shrink-0 mt-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      ))}
      <button type="button" onClick={addItem} className="text-xs text-[#1D9E75] font-medium hover:underline mt-1">+ Adicionar cláusula</button>
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
            <input key={String(c.key)} type="text" value={row[c.key]} onChange={e => setCell(ri, c.key, e.target.value)}
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

function ItemsTableEditor({ sec, onUpdate }: { sec: ItemsSection; onUpdate: (p: Partial<ItemsSection>) => void }) {
  const rowTotals  = sec.rows.map(r => parseNum(r.quantity) * parseNum(r.unit_price))
  const grandTotal = rowTotals.reduce((a, b) => a + b, 0)
  const colCls = 'text-xs font-semibold text-gray-400 uppercase tracking-wide'
  const cellCls = 'px-2 py-1.5 text-xs text-gray-500 text-right'
  return (
    <div className="space-y-2">
      <div className="flex gap-2 px-1">
        <span style={{ flex: 3 }} className={colCls}>Descrição</span>
        <span style={{ flex: 1 }} className={colCls}>Qtd</span>
        <span style={{ flex: 1.5 }} className={colCls + ' text-right'}>Vlr unit.</span>
        <span style={{ flex: 1.5 }} className={colCls + ' text-right'}>Total</span>
        <span className="w-6" />
      </div>
      {sec.rows.map((row, ri) => {
        const total = parseNum(row.quantity) * parseNum(row.unit_price)
        return (
          <div key={ri} className="flex gap-2 items-center">
            <input type="text" value={row.description} onChange={e => onUpdate({ rows: sec.rows.map((r, i) => i === ri ? { ...r, description: e.target.value } : r) })} placeholder="Item..." style={{ flex: 3 }} className={inputCls} />
            <input type="text" value={row.quantity} onChange={e => onUpdate({ rows: sec.rows.map((r, i) => i === ri ? { ...r, quantity: e.target.value } : r) })} placeholder="1" style={{ flex: 1 }} className={inputCls} />
            <input type="text" value={row.unit_price} onChange={e => onUpdate({ rows: sec.rows.map((r, i) => i === ri ? { ...r, unit_price: e.target.value } : r) })} placeholder="R$ 0,00" style={{ flex: 1.5 }} className={inputCls + ' text-right'} />
            <div style={{ flex: 1.5 }} className="text-sm text-gray-500 text-right px-1 tabular-nums">{total > 0 ? fmtBRL(total) : '—'}</div>
            <button type="button" onClick={() => onUpdate({ rows: sec.rows.filter((_, i) => i !== ri) })} disabled={sec.rows.length === 1}
              className="text-gray-300 hover:text-red-400 disabled:opacity-20 transition-colors w-6 shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )
      })}
      {grandTotal > 0 && (
        <div className="flex border-t border-gray-100 pt-1">
          <span style={{ flex: 5.5 }} className="text-xs font-semibold text-gray-500 px-1">Total geral</span>
          <span style={{ flex: 1.5 }} className={cellCls + ' font-semibold text-gray-700 tabular-nums'}>{fmtBRL(grandTotal)}</span>
          <span className="w-6" />
        </div>
      )}
      <button type="button" onClick={() => onUpdate({ rows: [...sec.rows, { description: '', quantity: '', unit_price: '' }] })}
        className="text-xs text-[#1D9E75] font-medium hover:underline">+ Adicionar linha</button>
    </div>
  )
}

function HoursTableEditor({ sec, onUpdate }: { sec: HoursSection; onUpdate: (p: Partial<HoursSection>) => void }) {
  const rowTotals  = sec.rows.map(r => parseNum(r.hours) * parseNum(r.rate))
  const grandTotal = rowTotals.reduce((a, b) => a + b, 0)
  const colCls = 'text-xs font-semibold text-gray-400 uppercase tracking-wide'
  const cellCls = 'px-2 py-1.5 text-xs text-gray-500 text-right'
  return (
    <div className="space-y-2">
      <div className="flex gap-2 px-1">
        <span style={{ flex: 2 }} className={colCls}>Perfil</span>
        <span style={{ flex: 1 }} className={colCls}>Horas</span>
        <span style={{ flex: 1.5 }} className={colCls + ' text-right'}>Vlr/hora</span>
        <span style={{ flex: 1.5 }} className={colCls + ' text-right'}>Total</span>
        <span className="w-6" />
      </div>
      {sec.rows.map((row, ri) => {
        const total = parseNum(row.hours) * parseNum(row.rate)
        return (
          <div key={ri} className="flex gap-2 items-center">
            <input type="text" value={row.profile} onChange={e => onUpdate({ rows: sec.rows.map((r, i) => i === ri ? { ...r, profile: e.target.value } : r) })} placeholder="Ex: Dev Senior" style={{ flex: 2 }} className={inputCls} />
            <input type="text" value={row.hours} onChange={e => onUpdate({ rows: sec.rows.map((r, i) => i === ri ? { ...r, hours: e.target.value } : r) })} placeholder="40" style={{ flex: 1 }} className={inputCls} />
            <input type="text" value={row.rate} onChange={e => onUpdate({ rows: sec.rows.map((r, i) => i === ri ? { ...r, rate: e.target.value } : r) })} placeholder="R$ 100" style={{ flex: 1.5 }} className={inputCls + ' text-right'} />
            <div style={{ flex: 1.5 }} className="text-sm text-gray-500 text-right px-1 tabular-nums">{total > 0 ? fmtBRL(total) : '—'}</div>
            <button type="button" onClick={() => onUpdate({ rows: sec.rows.filter((_, i) => i !== ri) })} disabled={sec.rows.length === 1}
              className="text-gray-300 hover:text-red-400 disabled:opacity-20 transition-colors w-6 shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )
      })}
      {grandTotal > 0 && (
        <div className="flex border-t border-gray-100 pt-1">
          <span style={{ flex: 4.5 }} className="text-xs font-semibold text-gray-500 px-1">Total geral</span>
          <span style={{ flex: 1.5 }} className={cellCls + ' font-semibold text-gray-700 tabular-nums'}>{fmtBRL(grandTotal)}</span>
          <span className="w-6" />
        </div>
      )}
      <button type="button" onClick={() => onUpdate({ rows: [...sec.rows, { profile: '', hours: '', rate: '' }] })}
        className="text-xs text-[#1D9E75] font-medium hover:underline">+ Adicionar linha</button>
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
              <span className="text-sm text-gray-400">Clique para enviar imagem</span>
              <span className="text-xs text-gray-300 mt-1">JPG, PNG ou WebP · Máx. 5 MB</span>
            </>
          )}
          <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleFile} />
        </label>
      )}
      {err && <p className="text-xs text-red-500">{err}</p>}
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

function SectionEditor({
  section, index, total, onUpdate, onRemove, onMoveUp, onMoveDown,
}: {
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
      {section.type === 'text' && (
        <TextEditor sec={section} onUpdate={p => onUpdate(p)} />
      )}
      {section.type === 'scope' && (
        <ListEditor items={section.items} onChange={items => onUpdate({ items })} placeholder="Item do escopo..." />
      )}
      {section.type === 'items' && (
        <ItemsTableEditor sec={section} onUpdate={p => onUpdate(p)} />
      )}
      {section.type === 'hours' && (
        <HoursTableEditor sec={section} onUpdate={p => onUpdate(p)} />
      )}
      {section.type === 'installments' && (
        <TableEditor
          rows={section.rows}
          onChange={rows => onUpdate({ rows })}
          columns={[
            { key: 'description', label: 'Parcela',  placeholder: 'Ex: Entrada', flex: 2.5 },
            { key: 'percentage',  label: '%',          placeholder: '50%',          flex: 1 },
            { key: 'condition',   label: 'Condição', placeholder: 'No início',    flex: 2 },
          ]}
        />
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
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
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

// ── Upgrade modal ─────────────────────────────────────────────────────────────

function UpgradeModal({ used, limit }: { used: number; limit: number }) {
  return (
    <div className="p-6 md:p-8 max-w-lg">
      <div className="bg-white border border-gray-100 rounded-2xl p-8 shadow-sm text-center">
        <div className="w-14 h-14 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Limite atingido</h2>
        <p className="text-sm text-gray-500 mb-6">
          Você criou <span className="font-semibold text-gray-900">{used} de {limit} propostas</span> disponíveis no plano Free este mês.
        </p>
        <Link href="/configuracoes?tab=plano" className="block w-full py-3 bg-[#1D9E75] text-white text-sm font-semibold rounded-xl hover:bg-[#188f68] transition-colors text-center mb-3">
          Fazer upgrade para Pro
        </Link>
        <Link href="/propostas" className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
          Voltar para propostas
        </Link>
      </div>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

const EMPTY_FORM = {
  title: '', value: '', deadline_days: '', valid_until: '', payment_terms: '', client_id: '',
}
const EMPTY_NEW_CLIENT = { name: '', email: '', phone: '' }

export default function NewProposalPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-[#1D9E75] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <NewProposalInner />
    </Suspense>
  )
}

function NewProposalInner() {
  const router       = useRouter()
  const searchParams = useSearchParams()

  const [form, setForm]                 = useState(EMPTY_FORM)
  const [sections, setSections]         = useState<Section[]>([])
  const [clients, setClients]           = useState<Client[]>([])
  const [newClient, setNewClient]       = useState(EMPTY_NEW_CLIENT)
  const [showNewClient, setShowNew]     = useState(false)
  const [savingClient, setSavingClient] = useState(false)
  const [submitting, setSubmitting]     = useState<'draft' | 'pdf' | null>(null)
  const [error, setError]               = useState<string | null>(null)
  const [plan, setPlan]                 = useState<PlanInfo | null>(null)
  const [planLoading, setPlanLoading]   = useState(true)
  const [isDuplicate, setIsDuplicate]         = useState(false)
  const [isNewVersion, setIsNewVersion]       = useState(false)
  const [sourceProposalId, setSourceProposalId] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([
      fetch('/api/clients').then(r => r.json()).catch(() => []),
      fetch('/api/subscriptions').then(r => r.json()).catch(() => ({})),
    ]).then(([clientData, subData]) => {
      setClients(Array.isArray(clientData) ? clientData : [])
      setPlan(subData)
      setPlanLoading(false)
    })
  }, [])

  // Pre-fill from URL params or sessionStorage duplicate
  useEffect(() => {
    const mode     = searchParams.get('mode')
    const clientId = searchParams.get('client_id')

    if (mode === 'duplicate') {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsDuplicate(true)
      try {
        const raw = sessionStorage.getItem('ff_duplicate_draft')
        if (raw) {
          sessionStorage.removeItem('ff_duplicate_draft')
          const d = JSON.parse(raw) as {
            title?: string
            value?: number | null
            deadline_days?: number | null
            valid_until?: string | null
            payment_terms?: string | null
            client_id?: string | null
            sections?: Section[]
          }
          setForm({
            title:         d.title         ?? '',
            value:         d.value         != null ? String(d.value) : '',
            deadline_days: d.deadline_days != null ? String(d.deadline_days) : '',
            valid_until:   d.valid_until   ?? '',
            payment_terms: d.payment_terms ?? '',
            client_id:     d.client_id     ?? '',
          })
          if (Array.isArray(d.sections)) setSections(d.sections)
        }
      } catch { /* ignore */ }
    } else if (mode === 'new-version') {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsNewVersion(true)
      try {
        const raw = sessionStorage.getItem('ff_new_version_draft')
        if (raw) {
          sessionStorage.removeItem('ff_new_version_draft')
          const d = JSON.parse(raw) as {
            sourceProposalId?: string
            title?: string
            value?: number | null
            deadline_days?: number | null
            valid_until?: string | null
            payment_terms?: string | null
            client_id?: string | null
            sections?: Section[]
          }
          // eslint-disable-next-line react-hooks/set-state-in-effect
          if (d.sourceProposalId) setSourceProposalId(d.sourceProposalId)
          setForm({
            title:         d.title         ?? '',
            value:         d.value         != null ? String(d.value) : '',
            deadline_days: d.deadline_days != null ? String(d.deadline_days) : '',
            valid_until:   d.valid_until   ?? '',
            payment_terms: d.payment_terms ?? '',
            client_id:     d.client_id     ?? '',
          })
          if (Array.isArray(d.sections)) setSections(d.sections)
        }
      } catch { /* ignore */ }
    } else if (clientId) {
      setField('client_id', clientId)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

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

  function addSection(type: SectionType) { setSections(prev => [...prev, createSection(type)]) }
  function removeSection(id: string)     { setSections(prev => prev.filter(s => s.id !== id)) }
  function moveSection(id: string, dir: 'up' | 'down') {
    setSections(prev => {
      const idx = prev.findIndex(s => s.id === id)
      if (idx < 0) return prev
      const next = [...prev]
      const swap = dir === 'up' ? idx - 1 : idx + 1
      if (swap < 0 || swap >= next.length) return prev
      ;[next[idx], next[swap]] = [next[swap], next[idx]]
      return next
    })
  }
  function updateSection(id: string, patch: Partial<Section>) {
    setSections(prev => prev.map(s => s.id === id ? { ...s, ...patch } as Section : s))
  }

  async function handleSubmit(mode: 'draft' | 'pdf') {
    setError(null)
    setSubmitting(mode)
    try {
      let res: Response
      if (isNewVersion && sourceProposalId) {
        res = await fetch(`/api/proposals/${sourceProposalId}/new-version`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title:         form.title,
            value:         form.value,
            deadline_days: form.deadline_days || null,
            valid_until:   form.valid_until   || null,
            payment_terms: form.payment_terms || null,
            client_id:     form.client_id === '__new__' ? null : form.client_id || null,
            sections,
          }),
        })
      } else {
        res = await fetch('/api/proposals', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title:         form.title,
            value:         form.value,
            deadline_days: form.deadline_days || null,
            valid_until:   form.valid_until   || null,
            payment_terms: form.payment_terms || null,
            client_id:     form.client_id === '__new__' ? null : form.client_id || null,
            sections,
          }),
        })
      }

      const data = await res.json()
      if (!res.ok) {
        if (data.code === 'PLAN_LIMIT_REACHED') {
          setPlan({ plan: 'free', used: data.used, limit: data.limit })
          setSubmitting(null)
          return
        }
        throw new Error(data.error)
      }

      if (mode === 'pdf') {
        await fetch(`/api/proposals/${data.id}/pdf`, { method: 'POST' }).catch(() => {})
      }

      router.push(`/propostas/${data.id}`)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Erro ao criar proposta')
      setSubmitting(null)
    }
  }

  if (!planLoading && plan && plan.plan === 'free' && plan.used >= plan.limit) {
    return <UpgradeModal used={plan.used} limit={plan.limit} />
  }

  return (
    <div className="p-6 md:p-8 max-w-2xl">
      {/* Plan usage banner */}
      {plan && plan.plan === 'free' && (
        <div className="mb-6 flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M12 20a8 8 0 100-16 8 8 0 000 16z" />
          </svg>
          Plano Free: {plan.used}/{plan.limit} propostas criadas este mês.{' '}
          <Link href="/configuracoes?tab=plano" className="underline font-medium">Fazer upgrade</Link>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <Link href="/propostas" className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-100">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isNewVersion ? 'Nova Versão' : isDuplicate ? 'Duplicar Proposta' : 'Nova Proposta'}
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {isNewVersion ? 'Edite e salve para criar a nova versão' : isDuplicate ? 'Revise os dados antes de salvar' : 'Preencha os dados e monte as seções'}
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{error}</div>
      )}

      <div className="space-y-6">
        {/* ── Campos fixos ─────────────────────────────────── */}
        <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm space-y-4">
          <h2 className="text-sm font-semibold text-gray-900">Informações gerais</h2>

          <div>
            <label className={labelCls}>Título <span className="text-red-500">*</span></label>
            {isNewVersion ? (
              <p className={`${inputCls} bg-gray-50 text-gray-500 cursor-not-allowed`}>{form.title}</p>
            ) : (
              <input type="text" required value={form.title} onChange={e => setField('title', e.target.value)}
                placeholder="Ex: Desenvolvimento de landing page" className={inputCls} />
            )}
          </div>

          {/* Cliente */}
          <div>
            <label className={labelCls}>Cliente <span className="text-gray-400 font-normal">(opcional)</span></label>
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
                  <input type="tel" value={newClient.phone} onChange={e => setNewClient(p => ({ ...p, phone: e.target.value }))} placeholder="(11) 9 9999-9999" className={inputCls} />
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

          {/* Value + deadline */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Valor total <span className="text-red-500">*</span></label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500 font-medium">R$</span>
                <input type="number" min="0" step="0.01" required value={form.value}
                  onChange={e => setField('value', e.target.value)} placeholder="0,00" className={inputCls + ' pl-9'} />
              </div>
            </div>
            <div>
              <label className={labelCls}>Prazo de entrega (dias)</label>
              <input type="number" min="1" value={form.deadline_days} onChange={e => setField('deadline_days', e.target.value)} placeholder="Ex: 30" className={inputCls} />
            </div>
          </div>

          {/* Valid until + payment terms */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Válida até</label>
              <input type="date" value={form.valid_until} onChange={e => setField('valid_until', e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Condições de pagamento</label>
              <input type="text" value={form.payment_terms} onChange={e => setField('payment_terms', e.target.value)} placeholder="Ex: 50% antecipado" className={inputCls} />
            </div>
          </div>
        </div>

        {/* ── Editor de seções ──────────────────────────────── */}
        {sections.length > 0 && (
          <div className="space-y-3">
            {sections.map((sec, i) => (
              <SectionEditor key={sec.id} section={sec} index={i} total={sections.length}
                onUpdate={patch => updateSection(sec.id, patch)}
                onRemove={() => removeSection(sec.id)}
                onMoveUp={() => moveSection(sec.id, 'up')}
                onMoveDown={() => moveSection(sec.id, 'down')}
              />
            ))}
          </div>
        )}

        <AddSectionButton onAdd={addSection} />

        {/* ── Ações ─────────────────────────────────────────── */}
        <div className="flex items-center justify-end gap-3 pb-8">
          <Link href="/propostas" className="px-4 py-2.5 text-sm font-medium text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            Cancelar
          </Link>
          <button type="button" onClick={() => handleSubmit('pdf')}
            disabled={!form.title.trim() || !form.value || submitting !== null}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#1D9E75] text-white text-sm font-medium rounded-lg hover:bg-[#188f68] transition-colors disabled:opacity-50">
            {submitting ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : null}
            {submitting ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </div>
    </div>
  )
}
