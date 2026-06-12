import { describe, it, expect } from 'vitest'
import { groupPending, dayStart, type FollowUpItem } from '@/lib/follow-up-groups'

const NOW = new Date('2025-06-15T14:00:00Z') // 2025-06-15, domingo

function makeItem(id: string, scheduled_for: string | null): FollowUpItem {
  return {
    id, type: 'email', trigger_rule: null, scheduled_for,
    sent_at: null, created_at: '2025-06-10T00:00:00Z',
    proposals: { id: 'p1', title: 'Proposta', value: 100, status: 'enviada', token: 'tok', clients: null },
  }
}

describe('dayStart', () => {
  it('retorna início do dia em ms', () => {
    const d = new Date('2025-06-15T14:30:00')
    const start = dayStart(d)
    expect(new Date(start).getHours()).toBe(0)
    expect(new Date(start).getMinutes()).toBe(0)
    expect(new Date(start).getSeconds()).toBe(0)
  })

  it('dois timestamps no mesmo dia retornam o mesmo valor', () => {
    const a = dayStart(new Date('2025-06-15T08:00:00'))
    const b = dayStart(new Date('2025-06-15T22:59:59'))
    expect(a).toBe(b)
  })

  it('dias diferentes retornam valores diferentes', () => {
    const a = dayStart(new Date('2025-06-15T00:00:00'))
    const b = dayStart(new Date('2025-06-16T00:00:00'))
    expect(a).not.toBe(b)
  })
})

describe('groupPending — sem data', () => {
  it('item sem scheduled_for vai para noDate', () => {
    const groups = groupPending([makeItem('1', null)], NOW)
    expect(groups.noDate).toHaveLength(1)
    expect(groups.noDate[0].id).toBe('1')
    expect(groups.overdue).toHaveLength(0)
    expect(groups.today).toHaveLength(0)
    expect(groups.tomorrow).toHaveLength(0)
    expect(groups.upcoming).toHaveLength(0)
  })
})

describe('groupPending — hoje', () => {
  it('item agendado para hoje vai para today', () => {
    const item = makeItem('1', '2025-06-15T09:00:00Z')
    const groups = groupPending([item], NOW)
    expect(groups.today).toHaveLength(1)
  })

  it('item agendado para hoje (final do dia) vai para today', () => {
    const item = makeItem('1', '2025-06-15T23:59:00Z')
    const groups = groupPending([item], NOW)
    expect(groups.today).toHaveLength(1)
  })
})

describe('groupPending — amanhã', () => {
  it('item agendado para amanhã vai para tomorrow', () => {
    const item = makeItem('1', '2025-06-16T10:00:00Z')
    const groups = groupPending([item], NOW)
    expect(groups.tomorrow).toHaveLength(1)
    expect(groups.tomorrow[0].id).toBe('1')
  })
})

describe('groupPending — atrasado', () => {
  it('item agendado para ontem vai para overdue', () => {
    const item = makeItem('1', '2025-06-14T10:00:00Z')
    const groups = groupPending([item], NOW)
    expect(groups.overdue).toHaveLength(1)
  })

  it('item agendado para 7 dias atrás vai para overdue', () => {
    const item = makeItem('1', '2025-06-08T00:00:00Z')
    const groups = groupPending([item], NOW)
    expect(groups.overdue).toHaveLength(1)
  })
})

describe('groupPending — próximos dias', () => {
  it('item agendado para depois de amanhã vai para upcoming', () => {
    const item = makeItem('1', '2025-06-20T10:00:00Z')
    const groups = groupPending([item], NOW)
    expect(groups.upcoming).toHaveLength(1)
  })
})

describe('groupPending — múltiplos itens', () => {
  it('distribui corretamente entre os grupos', () => {
    const items: FollowUpItem[] = [
      makeItem('atrasado', '2025-06-13T00:00:00Z'),
      makeItem('hoje',     '2025-06-15T08:00:00Z'),
      makeItem('amanhã',   '2025-06-16T08:00:00Z'),
      makeItem('próximo',  '2025-06-20T08:00:00Z'),
      makeItem('sem-data', null),
    ]
    const groups = groupPending(items, NOW)
    expect(groups.overdue).toHaveLength(1)
    expect(groups.today).toHaveLength(1)
    expect(groups.tomorrow).toHaveLength(1)
    expect(groups.upcoming).toHaveLength(1)
    expect(groups.noDate).toHaveLength(1)
  })

  it('lista vazia retorna todos os grupos vazios', () => {
    const groups = groupPending([], NOW)
    expect(groups.overdue).toHaveLength(0)
    expect(groups.today).toHaveLength(0)
    expect(groups.tomorrow).toHaveLength(0)
    expect(groups.upcoming).toHaveLength(0)
    expect(groups.noDate).toHaveLength(0)
  })
})
