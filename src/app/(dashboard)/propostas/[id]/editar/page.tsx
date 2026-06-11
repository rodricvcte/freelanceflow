'use client'

import { useEffect, useRef, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'

// ── Section types ─────────────────────────────────────────────────────────────

type SectionType = 'text' | 'scope' | 'items' | 'hours' | 'installments' | 'clauses'

type TextSection         = { id: string; type: 'text';         title: string; content: string }
type ScopeSection        = { id: string; type: 'scope';        title: string; items: string[] }
type ItemsSection        = { id: string; type: 'items';        title: string; rows: Array<{ description: string; quantity: string; unit_price: string }> }
type HoursSection        = { id: string; type: 'hours';        title: string; rows: Array<{ profile: string; hours: string; rate: string }> }
type InstallmentsSection = { id: string; type: 'installments'; title: string; rows: Array<{ description: string; percentage: string; condition: string }> }
type ClausesSection      = { id: string; type: 'clauses';      title: string; items: string[] }
type Section = TextSection | ScopeSection | ItemsSection | HoursSection | InstallmentsSection | ClausesSection

type Client = { id: string; name: string; email: string | null; phone: string | null }

// ── Constants ─────────────────────────────────────────────────────────────────

const SECTION_META: Record<SectionType, { label: string; description: string }> = {
  text:         { label: 'Texto livre',      description: 'Título e parágrafo de texto' },
  scope:        { label: 'Escopo',           description: 'Lista de bullets hierárquicos' },
  items:        { label: 'Tabela de itens',  description: 'Descrição, quantidade e valor unitário' },
  hours:        { label: 'Tabela de horas',  description: 'Perfil, horas e valor/hora' },
  installments: { label: 'Parcelas',         description: 'Descrição, percentual e condição' },
  clauses:      { label: 'Cláusulas',        description: 'Lista numerada de cláusulas' },
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
  }
}

// ── Shared styles ─────────────────────────────────────────────────────────────

const inputCls = 'w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#1D9E75] focus:border-transparent'
const labelCls = 'block text-sm font-medium text-gray-700 mb-1'

// ── SectionShell ──────────────────────────────────────────────────────────────

function SectionShell({
  section, index, total,
  onTitleChange, onMoveUp, onMoveDown, onRemove, children,
}: {
  section: Section; index: number; total: number
  onTitleChange: (v: string) => void
  onMoveUp: () => void; onMoveDown: () => void; onRemove: () => void
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
      <div className="px-4 pb-4 pt-3">{children}</div>
    </div>
  )
}

// ── Per-type editors ──────────────────────────────────────────────────────────

function TextEditor({ sec, onUpdate }: { sec: TextSection; onUpdate: (p: Partial<TextSection>) => void }) {
  return (
    <textarea rows={4} value={sec.content} onChange={e => onUpdate({ content: e.target.value })}
      placeholder="Digite o conteúdo desta seção..." className={inputCls + ' resize-none'} />
  )
}

function ListEditor({ items, onChange, placeholder }: { items: string[]; onChange: (items: string[]) => void; placeholder: string }) {
  const set   = (i: number, v: string) => { const n = [...items]; n[i] = v; onChange(n) }
  const add   = () => onChange([...items, ''])
  const remove = (i: number) => onChange(items.filter((_, idx) => idx !== i))
  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="text-gray-400 text-sm select-none w-5 text-right shrink-0">•</span>
          <input type="text" value={item} onChange={e => set(i, e.target.value)} placeholder={placeholder} className={inputCls + ' flex-1'} />
          <button type="button" onClick={() => remove(i)} disabled={items.length === 1}
            className="text-gray-300 hover:text-red-400 disabled:opacity-20 transition-colors shrink-0">
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
          <textarea rows={2} value={item} onChange={e => set(i, e.target.value)}
            placeholder="Texto da cláusula..." className={inputCls + ' flex-1 resize-none'} />
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

function SectionEditor({ section, index, total, onUpdate, onRemove, onMoveUp, onMoveDown }: {
  section: Section; index: number; total: number
  onUpdate: (patch: Partial<Section>) => void
  onRemove: () => void; onMoveUp: () => void; onMoveDown: () => void
}) {
  return (
    <SectionShell section={section} index={index} total={total}
      onTitleChange={v => onUpdate({ title: v })}
      onMoveUp={onMoveUp} onMoveDown={onMoveDown} onRemove={onRemove}>
      {section.type === 'text' && <TextEditor sec={section} onUpdate={p => onUpdate(p)} />}
      {section.type === 'scope' && (
        <ListEditor items={section.items} onChange={items => onUpdate({ items })} placeholder="Item do escopo..." />
      )}
      {section.type === 'items' && (
        <TableEditor rows={section.rows} onChange={rows => onUpdate({ rows })}
          columns={[
            { key: 'description', label: 'Descrição',   placeholder: 'Item...',  flex: 3 },
            { key: 'quantity',    label: 'Qtd',          placeholder: '1',        flex: 1 },
            { key: 'unit_price',  label: 'Vlr unitário', placeholder: 'R$ 0,00', flex: 1.5 },
          ]} />
      )}
      {section.type === 'hours' && (
        <TableEditor rows={section.rows} onChange={rows => onUpdate({ rows })}
          columns={[
            { key: 'profile', label: 'Perfil',   placeholder: 'Ex: Dev Senior', flex: 2 },
            { key: 'hours',   label: 'Horas',    placeholder: '40',              flex: 1 },
            { key: 'rate',    label: 'Vlr/hora', placeholder: 'R$ 100',         flex: 1.5 },
          ]} />
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

export default function EditarPropostaPage() {
  const { id } = useParams<{ id: string }>()
  const router  = useRouter()

  const [form, setForm]       = useState(EMPTY_FORM)
  const [sections, setSections] = useState<Section[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSub]  = useState(false)
  const [error, setError]     = useState<string | null>(null)

  useEffect(() => {
    Promise.all([
      fetch(`/api/proposals/${id}`).then(r => r.json()),
      fetch('/api/clients').then(r => r.json()),
    ]).then(([proposal, clientList]) => {
      if (proposal.error) { setError(proposal.error); setLoading(false); return }
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
      setLoading(false)
    }).catch(() => { setError('Erro ao carregar proposta'); setLoading(false) })
  }, [id])

  function setField(k: keyof typeof EMPTY_FORM, v: string) {
    setForm(p => ({ ...p, [k]: v }))
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
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
          <p className="text-sm text-gray-500 mt-0.5">Salvar incrementa a versão e regenera o PDF automaticamente</p>
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
            <input type="text" required value={form.title} onChange={e => setField('title', e.target.value)} className={inputCls} />
          </div>

          <div>
            <label className={labelCls}>Cliente</label>
            <select value={form.client_id} onChange={e => setField('client_id', e.target.value)} className={inputCls}>
              <option value="">Sem cliente</option>
              {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Valor <span className="text-red-500">*</span></label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500 font-medium">R$</span>
                <input type="number" min="0" step="0.01" required value={form.value}
                  onChange={e => setField('value', e.target.value)} className={inputCls + ' pl-9'} />
              </div>
            </div>
            <div>
              <label className={labelCls}>Prazo de entrega (dias)</label>
              <input type="number" min="1" value={form.deadline_days}
                onChange={e => setField('deadline_days', e.target.value)} className={inputCls} />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Válida até</label>
              <input type="date" value={form.valid_until}
                onChange={e => setField('valid_until', e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Condições de pagamento</label>
              <input type="text" value={form.payment_terms}
                onChange={e => setField('payment_terms', e.target.value)}
                placeholder="Ex: 50% antecipado" className={inputCls} />
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
            {submitting ? 'Salvando...' : 'Salvar nova versão'}
          </button>
        </div>
      </form>
    </div>
  )
}
