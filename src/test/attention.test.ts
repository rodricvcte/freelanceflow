import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { getAttentionItems, type ProposalStub, type FollowUpStub } from '@/lib/attention'

const NOW = new Date('2025-06-15T12:00:00Z')

function daysAgo(n: number): string {
  return new Date(NOW.getTime() - n * 86_400_000).toISOString()
}

const base: ProposalStub = {
  id: '1', title: 'Proposta teste', status: 'rascunho',
  sent_at: null, created_at: NOW.toISOString(),
}

describe('getAttentionItems — regras de tempo', () => {
  beforeEach(() => { vi.useFakeTimers(); vi.setSystemTime(NOW) })
  afterEach(() => { vi.useRealTimers() })

  it('ignora proposta enviada há menos de 5 dias', () => {
    const p = { ...base, status: 'enviada', sent_at: daysAgo(3) }
    expect(getAttentionItems([p], [], NOW)).toHaveLength(0)
  })

  it('inclui proposta enviada há 5+ dias sem visualização', () => {
    const p = { ...base, status: 'enviada', sent_at: daysAgo(5) }
    const result = getAttentionItems([p], [], NOW)
    expect(result).toHaveLength(1)
    expect(result[0].kind).toBe('sent_no_view')
  })

  it('ignora proposta visualizada há menos de 2 dias', () => {
    const p = { ...base, status: 'visualizada', sent_at: daysAgo(1) }
    expect(getAttentionItems([p], [], NOW)).toHaveLength(0)
  })

  it('inclui proposta visualizada há 2+ dias sem resposta', () => {
    const p = { ...base, status: 'visualizada', sent_at: daysAgo(2) }
    const result = getAttentionItems([p], [], NOW)
    expect(result).toHaveLength(1)
    expect(result[0].kind).toBe('viewed_no_response')
  })

  it('ignora rascunho com menos de 5 dias', () => {
    const p = { ...base, status: 'rascunho', created_at: daysAgo(3) }
    expect(getAttentionItems([p], [], NOW)).toHaveLength(0)
  })

  it('inclui rascunho há 5+ dias sem envio', () => {
    const p = { ...base, status: 'rascunho', created_at: daysAgo(6) }
    const result = getAttentionItems([p], [], NOW)
    expect(result).toHaveLength(1)
    expect(result[0].kind).toBe('stale_draft')
  })

  it('ignora proposta aceita', () => {
    const p = { ...base, status: 'aceita', sent_at: daysAgo(10) }
    expect(getAttentionItems([p], [], NOW)).toHaveLength(0)
  })
})

describe('getAttentionItems — follow-ups', () => {
  const fup: FollowUpStub = {
    id: 'f1', type: 'email', trigger_rule: 'manual',
    scheduled_for: null,
    proposals: { id: '99', title: 'Outra proposta' },
  }

  it('inclui follow-up pendente sem data', () => {
    const result = getAttentionItems([], [fup], NOW)
    expect(result).toHaveLength(1)
    expect(result[0].kind).toBe('followup')
  })

  it('marca follow-up como atrasado se scheduled_for < now', () => {
    const atrasado = { ...fup, scheduled_for: daysAgo(2) }
    const result = getAttentionItems([], [atrasado], NOW)
    expect(result[0].kind).toBe('followup')
    if (result[0].kind === 'followup') {
      expect(result[0].overdue).toBe(true)
    }
  })

  it('marca follow-up como não atrasado se scheduled_for > now', () => {
    const futuro = { ...fup, scheduled_for: new Date(NOW.getTime() + 86_400_000).toISOString() }
    const result = getAttentionItems([], [futuro], NOW)
    if (result[0].kind === 'followup') {
      expect(result[0].overdue).toBe(false)
    }
  })

  it('não duplica follow-up de proposta já coberta pela regra de tempo', () => {
    const p = { ...base, id: '99', status: 'enviada', sent_at: daysAgo(6) }
    const result = getAttentionItems([p], [fup], NOW)
    // Proposta 99 já aparece como sent_no_view, então o follow-up dela é ignorado
    expect(result).toHaveLength(1)
    expect(result[0].kind).toBe('sent_no_view')
  })

  it('ignora follow-up sem proposta associada', () => {
    const semProposta = { ...fup, proposals: null }
    expect(getAttentionItems([], [semProposta], NOW)).toHaveLength(0)
  })
})

describe('getAttentionItems — múltiplos itens', () => {
  it('retorna todos os tipos combinados', () => {
    const p1 = { ...base, id: '1', status: 'enviada',   sent_at: daysAgo(7) }
    const p2 = { ...base, id: '2', status: 'visualizada', sent_at: daysAgo(3) }
    const p3 = { ...base, id: '3', status: 'rascunho',  created_at: daysAgo(10) }
    const fup: FollowUpStub = { id: 'f1', type: 'whatsapp', trigger_rule: null, scheduled_for: null, proposals: { id: '4', title: 'X' } }

    const result = getAttentionItems([p1, p2, p3], [fup], NOW)
    expect(result).toHaveLength(4)
    const kinds = result.map(r => r.kind)
    expect(kinds).toContain('sent_no_view')
    expect(kinds).toContain('viewed_no_response')
    expect(kinds).toContain('stale_draft')
    expect(kinds).toContain('followup')
  })
})
