'use client'

import { useState, useRef } from 'react'

type Note = { id: string; content: string; created_at: string }

function fmtRelative(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins  = Math.floor(diff / 60_000)
  const hours = Math.floor(diff / 3_600_000)
  const days  = Math.floor(diff / 86_400_000)
  if (mins  < 1)   return 'agora'
  if (mins  < 60)  return `há ${mins} min`
  if (hours < 24)  return `há ${hours}h`
  if (days  < 7)   return `há ${days}d`
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit', timeZone: 'America/Sao_Paulo' }).format(new Date(iso))
}

export default function ProposalNotes({
  proposalId,
  initialNotes,
}: {
  proposalId: string
  initialNotes: Note[]
}) {
  const [notes,    setNotes]   = useState<Note[]>(initialNotes)
  const [expanded, setExpanded] = useState(false)
  const [draft,    setDraft]   = useState('')
  const [saving,   setSaving]  = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [error,    setError]   = useState<string | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const VISIBLE = 1
  const visibleNotes = expanded ? notes : notes.slice(0, VISIBLE)
  const hiddenCount  = notes.length - VISIBLE

  async function handleAdd() {
    const content = draft.trim()
    if (!content || saving) return
    setSaving(true)
    setError(null)
    try {
      const res = await fetch(`/api/proposals/${proposalId}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Erro ao salvar nota'); return }
      setNotes(prev => [data, ...prev])
      setDraft('')
      textareaRef.current?.focus()
    } catch {
      setError('Erro de conexão')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(noteId: string) {
    setDeleting(noteId)
    try {
      await fetch(`/api/proposals/${proposalId}/notes/${noteId}`, { method: 'DELETE' })
      setNotes(prev => prev.filter(n => n.id !== noteId))
    } finally {
      setDeleting(null)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      handleAdd()
    }
  }

  const remaining = 500 - draft.length

  return (
    <div className="bg-white rounded-[10px] border border-gray-100">
      <div className="px-4 py-3.5 border-b border-gray-50">
        <h3 className="text-sm font-medium text-gray-600">Notas</h3>
      </div>

      <div className="px-4 py-3">
        {/* Lista de notas existentes */}
        {notes.length > 0 && (
          <>
            <ul className="space-y-2 mb-2">
              {visibleNotes.map(note => (
                <li key={note.id} className="group flex gap-2.5 p-2.5 rounded-lg bg-gray-50">
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] text-gray-800 leading-snug whitespace-pre-wrap break-words">{note.content}</p>
                    <p className="text-[11px] text-gray-400 mt-1">{fmtRelative(note.created_at)}</p>
                  </div>
                  <button
                    onClick={() => handleDelete(note.id)}
                    disabled={deleting === note.id}
                    className="shrink-0 mt-0.5 p-1 rounded text-gray-300 hover:text-red-400 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100 disabled:opacity-30"
                    aria-label="Excluir nota"
                  >
                    {deleting === note.id ? (
                      <div className="w-3.5 h-3.5 border border-gray-400 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    )}
                  </button>
                </li>
              ))}
            </ul>

            {hiddenCount > 0 && !expanded && (
              <button
                onClick={() => setExpanded(true)}
                className="text-[11px] text-gray-400 hover:text-gray-600 transition-colors mb-2"
              >
                Ver mais {hiddenCount} {hiddenCount === 1 ? 'nota' : 'notas'}
              </button>
            )}
            {expanded && notes.length > VISIBLE && (
              <button
                onClick={() => setExpanded(false)}
                className="text-[11px] text-gray-400 hover:text-gray-600 transition-colors mb-2"
              >
                Ver menos
              </button>
            )}

            <div className="border-t border-gray-100 mb-3" />
          </>
        )}

        {/* Input */}
        <textarea
          ref={textareaRef}
          value={draft}
          onChange={e => setDraft(e.target.value.slice(0, 500))}
          onKeyDown={handleKeyDown}
          rows={3}
          placeholder="Adicionar uma nota..."
          className="w-full resize-none text-[13px] text-gray-700 placeholder-gray-400 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1D9E75] focus:border-transparent"
        />

        <div className="flex items-center justify-between mt-1.5">
          <span className={`text-[11px] ${remaining < 50 ? 'text-amber-500' : 'text-gray-300'}`}>
            {remaining < 500 ? `${remaining} restantes` : ''}
          </span>
          <button
            onClick={handleAdd}
            disabled={!draft.trim() || saving}
            className="flex items-center gap-1 px-2.5 py-1 text-[12px] font-medium text-white bg-[#1D9E75] rounded-md hover:bg-[#188f68] transition-colors disabled:opacity-40"
          >
            {saving ? (
              <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
            )}
            Adicionar
          </button>
        </div>

        {error && <p className="text-[11px] text-red-500 mt-1.5">{error}</p>}
      </div>
    </div>
  )
}
