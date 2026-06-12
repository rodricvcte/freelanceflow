'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

// ─── Masks ────────────────────────────────────────────────────────────────────

function maskCPF(v: string) {
  const d = v.replace(/\D/g, '').slice(0, 11)
  return d
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
}

function maskCNPJ(v: string) {
  const d = v.replace(/\D/g, '').slice(0, 14)
  return d
    .replace(/(\d{2})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1/$2')
    .replace(/(\d{4})(\d{1,2})$/, '$1-$2')
}

// ─── Types ────────────────────────────────────────────────────────────────────

type DocType = 'cpf' | 'cnpj'

const EMPTY = {
  full_name: '',
  business_name: '',
  email_business: '',
  phone: '',
  address: '',
  document_type: 'cpf' as DocType,
  cpf_cnpj: '',
  website: '',
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function OnboardingPage() {
  const router   = useRouter()
  const [form, setForm]           = useState(EMPTY)
  const [submitting, setSub]      = useState(false)
  const [error, setError]         = useState<string | null>(null)
  const [termsAccepted, setTerms] = useState(false)

  // If already onboarded, skip to dashboard
  useEffect(() => {
    fetch('/api/profile')
      .then(r => r.json())
      .then(d => { if (d.freelancer_code) router.replace('/dashboard') })
      .catch(() => {})
  }, [router])

  function set<K extends keyof typeof EMPTY>(k: K, v: typeof EMPTY[K]) {
    setForm(p => ({ ...p, [k]: v }))
  }

  function handleDocInput(raw: string) {
    const masked = form.document_type === 'cpf' ? maskCPF(raw) : maskCNPJ(raw)
    set('cpf_cnpj', masked)
  }

  function handleDocTypeChange(t: DocType) {
    set('document_type', t)
    set('cpf_cnpj', '') // clear mask on type switch
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSub(true)
    try {
      const res = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      router.push('/dashboard')
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Erro ao salvar perfil')
      setSub(false)
    }
  }

  const inputCls = 'w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#1D9E75] focus:border-transparent'
  const labelCls = 'block text-sm font-medium text-gray-700 mb-1'

  return (
    <div className="min-h-screen bg-gray-50 flex items-start justify-center py-10 px-4">
      <div className="w-full max-w-xl">
        {/* Logo */}
        <div className="text-center mb-8">
          <span className="text-2xl font-bold text-[#1D9E75]">FreelanceFlow</span>
          <h1 className="text-xl font-bold text-gray-900 mt-3">Configure seu perfil</h1>
          <p className="text-sm text-gray-500 mt-1">Feito uma única vez. Aparece em todas as suas propostas.</p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Dados pessoais */}
          <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm space-y-4">
            <h2 className="text-sm font-semibold text-gray-900">Dados pessoais</h2>

            <div>
              <label className={labelCls}>Nome completo <span className="text-red-500">*</span></label>
              <input type="text" required value={form.full_name} onChange={e => set('full_name', e.target.value)}
                placeholder="Rodrigo Costa" className={inputCls} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Nome do negócio</label>
                <input type="text" value={form.business_name} onChange={e => set('business_name', e.target.value)}
                  placeholder="RC Design" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Telefone</label>
                <input type="tel" value={form.phone} onChange={e => set('phone', e.target.value)}
                  placeholder="(11) 99999-9999" className={inputCls} />
              </div>
            </div>

            <div>
              <label className={labelCls}>E-mail de contato</label>
              <input type="email" value={form.email_business} onChange={e => set('email_business', e.target.value)}
                placeholder="rodrigo@rcdesign.com.br" className={inputCls} />
            </div>

            <div>
              <label className={labelCls}>Endereço completo</label>
              <input type="text" value={form.address} onChange={e => set('address', e.target.value)}
                placeholder="Rua das Flores, 123 — São Paulo, SP" className={inputCls} />
            </div>

            <div>
              <label className={labelCls}>Site / portfólio</label>
              <input type="url" value={form.website} onChange={e => set('website', e.target.value)}
                placeholder="https://rcdesign.com.br" className={inputCls} />
            </div>
          </div>

          {/* Documento */}
          <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm space-y-4">
            <h2 className="text-sm font-semibold text-gray-900">Documento</h2>

            <div>
              <label className={labelCls}>Tipo de documento</label>
              <div className="flex gap-4">
                {(['cpf', 'cnpj'] as DocType[]).map(t => (
                  <label key={t} className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="document_type" value={t} checked={form.document_type === t}
                      onChange={() => handleDocTypeChange(t)}
                      className="w-4 h-4 text-[#1D9E75] border-gray-300 focus:ring-[#1D9E75]" />
                    <span className="text-sm font-medium text-gray-700 uppercase">{t}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className={labelCls}>{form.document_type.toUpperCase()}</label>
              <input type="text" value={form.cpf_cnpj}
                onChange={e => handleDocInput(e.target.value)}
                placeholder={form.document_type === 'cpf' ? '000.000.000-00' : '00.000.000/0000-00'}
                maxLength={form.document_type === 'cpf' ? 14 : 18}
                className={inputCls} />
            </div>
          </div>

          {/* Termo de responsabilidade */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={termsAccepted}
                onChange={e => setTerms(e.target.checked)}
                className="mt-0.5 w-4 h-4 shrink-0 rounded border-gray-300 text-[#1D9E75] focus:ring-[#1D9E75] accent-[#1D9E75]"
              />
              <span className="text-xs text-gray-700 leading-relaxed">
                Declaro que as informações fornecidas (nome, razão social, documento, endereço e dados de contato) são verdadeiras e de minha responsabilidade. Confirmo que sou o titular ou representante legalmente autorizado da empresa ou negócio cadastrado, tendo plenos poderes para emitir propostas comerciais em seu nome. Estou ciente que essas informações constarão nas propostas geradas pelo FreelanceFlow.
              </span>
            </label>
          </div>

          <button type="submit" disabled={!termsAccepted || submitting}
            className="w-full py-3 bg-[#1D9E75] text-white text-sm font-semibold rounded-xl hover:bg-[#188f68] transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            {submitting ? 'Salvando...' : 'Concluir configuração →'}
          </button>
        </form>
      </div>
    </div>
  )
}
