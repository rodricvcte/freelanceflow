import { describe, it, expect } from 'vitest'

const ADMIN_EMAIL = 'rodrigosc19@gmail.com'

function isAdmin(email: string | undefined): boolean {
  return email === ADMIN_EMAIL
}

describe('admin email guard', () => {
  it('permite acesso ao email de admin correto', () => {
    expect(isAdmin(ADMIN_EMAIL)).toBe(true)
  })

  it('bloqueia email de outro usuário', () => {
    expect(isAdmin('outro@exemplo.com')).toBe(false)
  })

  it('bloqueia email vazio', () => {
    expect(isAdmin('')).toBe(false)
  })

  it('bloqueia undefined (não autenticado)', () => {
    expect(isAdmin(undefined)).toBe(false)
  })

  it('é case-sensitive — maiúsculas são bloqueadas', () => {
    expect(isAdmin('RODRIGOSC19@GMAIL.COM')).toBe(false)
    expect(isAdmin('Rodrigosc19@Gmail.Com')).toBe(false)
  })

  it('não aceita email com espaços extras', () => {
    expect(isAdmin(' rodrigosc19@gmail.com')).toBe(false)
    expect(isAdmin('rodrigosc19@gmail.com ')).toBe(false)
  })
})
