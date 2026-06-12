import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { fmtBRL, fmtDate, trunc, daysSince } from '@/lib/formatters'

describe('fmtBRL', () => {
  it('formata zero', () => {
    expect(fmtBRL(0)).toBe('R$ 0,00')
  })

  it('formata valor positivo', () => {
    expect(fmtBRL(1500)).toBe('R$ 1.500,00')
  })

  it('formata valor com centavos', () => {
    expect(fmtBRL(99.9)).toBe('R$ 99,90')
  })

  it('retorna — para null', () => {
    expect(fmtBRL(null)).toBe('—')
  })

  it('formata valor grande', () => {
    expect(fmtBRL(1_000_000)).toBe('R$ 1.000.000,00')
  })
})

describe('fmtDate', () => {
  it('retorna — para null', () => {
    expect(fmtDate(null)).toBe('—')
  })

  it('retorna — para string vazia', () => {
    expect(fmtDate('')).toBe('—')
  })

  it('formata data ISO corretamente', () => {
    const result = fmtDate('2025-06-15T00:00:00Z')
    expect(result).toBe('15/06/2025')
  })

  it('ignora a parte de hora', () => {
    expect(fmtDate('2025-01-01T23:59:59Z')).toBe('01/01/2025')
  })
})

describe('trunc', () => {
  it('não trunca string dentro do limite', () => {
    expect(trunc('hello', 10)).toBe('hello')
  })

  it('trunca string que ultrapassa o limite', () => {
    expect(trunc('hello world', 5)).toBe('hello…')
  })

  it('não trunca string exatamente no limite', () => {
    expect(trunc('hello', 5)).toBe('hello')
  })

  it('funciona com string vazia', () => {
    expect(trunc('', 5)).toBe('')
  })
})

describe('daysSince', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2025-06-15T12:00:00Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('retorna 0 para null', () => {
    expect(daysSince(null)).toBe(0)
  })

  it('retorna 0 para hoje', () => {
    expect(daysSince('2025-06-15T00:00:00Z')).toBe(0)
  })

  it('retorna 1 para ontem', () => {
    expect(daysSince('2025-06-14T00:00:00Z')).toBe(1)
  })

  it('retorna 5 para 5 dias atrás', () => {
    expect(daysSince('2025-06-10T00:00:00Z')).toBe(5)
  })

  it('retorna 30 para 30 dias atrás', () => {
    expect(daysSince('2025-05-16T00:00:00Z')).toBe(30)
  })
})
