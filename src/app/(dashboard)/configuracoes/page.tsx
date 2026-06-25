'use client'

import { Suspense, useEffect, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import { maskPhone } from '@/lib/masks'

// ─── Types ───────────────────────────────────────────────────────────────────

type DocType = 'cpf' | 'cnpj'

type Profile = {
  full_name:        string | null
  business_name:    string | null
  phone:            string | null
  logo_url:         string | null
  accent_color:     string
  email_business:   string | null
  address:          string | null
  document_type:    DocType | null
  cpf_cnpj:         string | null
  website:          string | null
  instagram:        string | null
  linkedin:         string | null
  facebook:         string | null
  youtube:          string | null
  tiktok:           string | null
  signature_data:   string | null
  followup_enabled:        boolean | null
  followup_days:           number | null
  followup_expiry_enabled: boolean | null
}

const SIG_FONTS = [
  { family: 'Dancing Script', weight: '600', canvasSize: 42 },
  { family: 'Pacifico',       weight: '400', canvasSize: 34 },
  { family: 'Caveat',         weight: '700', canvasSize: 48 },
] as const

type SubInfo = {
  plan:                   string
  status:                 string
  current_period_end:     string | null
  stripe_customer_id:     string | null
  stripe_subscription_id: string | null
  stripe_price_id:        string | null
  used:                   number
  limit:                  number
}

// ─── Masks ───────────────────────────────────────────────────────────────────

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

function applyDocMask(raw: string | null, type: DocType | null): string {
  if (!raw) return ''
  return (type ?? 'cpf') === 'cpf' ? maskCPF(raw) : maskCNPJ(raw)
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmtDate(s: string) {
  const [y, m, d] = s.split('T')[0].split('-')
  return `${d}/${m}/${y}`
}

const STATUS_LABELS: Record<string, { label: string; cls: string }> = {
  active:   { label: 'Ativo',              cls: 'bg-green-100 text-green-700' },
  trialing: { label: 'Teste grátis',        cls: 'bg-blue-100 text-blue-700' },
  canceled: { label: 'Cancelado',           cls: 'bg-gray-100 text-gray-600' },
  past_due: { label: 'Pagamento pendente',  cls: 'bg-red-100 text-red-700' },
}

// ─── Tab: Perfil ─────────────────────────────────────────────────────────────

function ProfileTab({ initial, isPro }: { initial: Profile; isPro: boolean }) {
  const [form, setForm] = useState({
    full_name:      initial.full_name      ?? '',
    business_name:  initial.business_name  ?? '',
    phone:          maskPhone(initial.phone ?? ''),
    email_business: initial.email_business ?? '',
    address:        initial.address        ?? '',
    website:        initial.website        ?? '',
    accent_color:   initial.accent_color   ?? '#1D9E75',
    logo_url:       initial.logo_url       ?? '',
    document_type:  (initial.document_type ?? 'cpf') as DocType,
    cpf_cnpj:       applyDocMask(initial.cpf_cnpj, initial.document_type),
    instagram:       initial.instagram       ?? '',
    linkedin:        initial.linkedin        ?? '',
    facebook:        initial.facebook        ?? '',
    youtube:         initial.youtube         ?? '',
    tiktok:          initial.tiktok          ?? '',
    signature_data:  initial.signature_data  ?? '',
  })

  const [logoPreview,  setPreview]      = useState<string | null>(initial.logo_url)
  const [saving,       setSaving]      = useState(false)
  const [uploading,    setUp]          = useState(false)
  const [msg,          setMsg]         = useState<{ text: string; ok: boolean } | null>(null)
  const [selectedSig,  setSelectedSig]  = useState<number | null>(null)
  const [sigLoading,   setSigLoading]   = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const link = document.createElement('link')
    link.rel  = 'stylesheet'
    link.href = 'https://fonts.googleapis.com/css2?family=Dancing+Script:wght@600&family=Pacifico&family=Caveat:wght@700&display=swap'
    document.head.appendChild(link)
    return () => { if (document.head.contains(link)) document.head.removeChild(link) }
  }, [])

  async function generateSignature(index: number) {
    const name = form.full_name.trim()
    if (!name) return
    setSigLoading(true)
    setSelectedSig(index)
    try {
      const { family, weight, canvasSize } = SIG_FONTS[index]
      await document.fonts.load(`${weight} ${canvasSize}px "${family}"`)
      const canvas  = document.createElement('canvas')
      canvas.width  = 520
      canvas.height = 80
      const ctx     = canvas.getContext('2d')!
      ctx.font         = `${weight} ${canvasSize}px "${family}"`
      ctx.fillStyle    = '#111827'
      ctx.textAlign    = 'center'
      ctx.textBaseline = 'bottom'
      ctx.fillText(name.split(/\s+/).slice(0, 2).join(' '), 260, 76)
      set('signature_data', canvas.toDataURL('image/png'))
    } finally {
      setSigLoading(false)
    }
  }

  function set<K extends keyof typeof form>(k: K, v: typeof form[K]) {
    setForm(p => ({ ...p, [k]: v }))
  }

  function handleDocTypeChange(t: DocType) {
    set('document_type', t)
    set('cpf_cnpj', '')
  }

  function handleDocInput(raw: string) {
    const masked = form.document_type === 'cpf' ? maskCPF(raw) : maskCNPJ(raw)
    set('cpf_cnpj', masked)
  }

  async function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setPreview(URL.createObjectURL(file))
    setUp(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res  = await fetch('/api/profile/logo', { method: 'POST', body: fd })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      set('logo_url', data.url)
      setPreview(data.url)
    } catch (e: unknown) {
      setMsg({ text: e instanceof Error ? e.message : 'Erro no upload', ok: false })
    } finally {
      setUp(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setMsg(null)
    setSaving(true)
    try {
      const rawWebsite = form.website.trim()
      const website = rawWebsite
        ? (/^https?:\/\//i.test(rawWebsite) ? rawWebsite : `https://${rawWebsite}`)
        : ''

      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          website,
          cpf_cnpj: form.cpf_cnpj.replace(/\D/g, '') || null,
        }),
      })
      let data: Record<string, unknown> = {}
      try {
        data = await res.json()
      } catch {
        throw new Error(
          res.status === 413
            ? 'Dados muito grandes para salvar. Tente regenerar a assinatura.'
            : `Erro ${res.status} ao salvar perfil.`
        )
      }
      if (!res.ok) throw new Error((data.error as string | undefined) ?? 'Erro ao salvar')
      setMsg({ text: 'Perfil salvo com sucesso!', ok: true })
      window.dispatchEvent(new Event('ff:profile-updated'))
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (e: unknown) {
      setMsg({ text: e instanceof Error ? e.message : 'Erro ao salvar', ok: false })
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } finally {
      setSaving(false)
    }
  }

  const inputCls = 'w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#1D9E75] focus:border-transparent'
  const labelCls = 'block text-sm font-medium text-gray-700 mb-1'

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {msg && (
        <div className={`p-3 rounded-lg text-sm ${msg.ok ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-red-50 border border-red-200 text-red-700'}`}>
          {msg.text}
        </div>
      )}

      {/* Logo */}
      <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Logo</h3>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden bg-gray-50 shrink-0">
            {logoPreview ? (
              <Image src={logoPreview} alt="Logo" width={64} height={64} className="w-full h-full object-contain" unoptimized />
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            )}
          </div>
          <div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleLogoChange} />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              {uploading ? 'Enviando...' : 'Alterar logo'}
            </button>
            <p className="text-xs text-gray-400 mt-1">PNG, JPG ou SVG · Máx. 2 MB</p>
          </div>
        </div>
      </div>

      {/* Dados pessoais */}
      <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm space-y-4">
        <h3 className="text-sm font-semibold text-gray-900">Dados pessoais</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Nome completo</label>
            <input type="text" value={form.full_name} onChange={e => set('full_name', e.target.value)}
              placeholder="Rodrigo Costa" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Nome do negócio</label>
            <input type="text" value={form.business_name} onChange={e => set('business_name', e.target.value)}
              placeholder="RC Design" className={inputCls} />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Telefone</label>
            <input type="tel" value={form.phone} onChange={e => set('phone', maskPhone(e.target.value))}
              placeholder="(11) 99999-9999" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>E-mail de contato</label>
            <input type="email" value={form.email_business} onChange={e => set('email_business', e.target.value)}
              placeholder="rodrigo@rcdesign.com.br" className={inputCls} />
          </div>
        </div>

        <div>
          <label className={labelCls}>Endereço completo</label>
          <input type="text" value={form.address} onChange={e => set('address', e.target.value)}
            placeholder="Rua das Flores, 123 — São Paulo, SP" className={inputCls} />
        </div>

        <div>
          <label className={labelCls}>Site / portfólio</label>
          <input type="text" value={form.website} onChange={e => set('website', e.target.value)}
            placeholder="rcdesign.com.br" className={inputCls} />
        </div>
      </div>

      {/* Documento */}
      <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm space-y-4">
        <h3 className="text-sm font-semibold text-gray-900">Documento</h3>

        <div>
          <label className={labelCls}>Tipo de documento</label>
          <div className="flex gap-4">
            {(['cpf', 'cnpj'] as DocType[]).map(t => (
              <label key={t} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="document_type"
                  value={t}
                  checked={form.document_type === t}
                  onChange={() => handleDocTypeChange(t)}
                  className="w-4 h-4 text-[#1D9E75] border-gray-300 focus:ring-[#1D9E75]"
                />
                <span className="text-sm font-medium text-gray-700 uppercase">{t}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className={labelCls}>{form.document_type.toUpperCase()}</label>
          <input
            type="text"
            value={form.cpf_cnpj}
            onChange={e => handleDocInput(e.target.value)}
            placeholder={form.document_type === 'cpf' ? '000.000.000-00' : '00.000.000/0000-00'}
            maxLength={form.document_type === 'cpf' ? 14 : 18}
            className={inputCls}
          />
        </div>
      </div>

      {/* Assinatura no PDF */}
      <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-900 mb-1">Sua assinatura no PDF</h3>
        <p className="text-xs text-gray-500 mb-4">
          Clique em um estilo para gerar sua assinatura com base no seu nome.
        </p>

        {!form.full_name.trim() ? (
          <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2.5">
            Preencha o campo <strong className="font-semibold">Nome completo</strong> acima para gerar sua assinatura.
          </p>
        ) : (
          <div className="grid grid-cols-3 gap-3">
            {SIG_FONTS.map((f, i) => (
              <button
                key={i}
                type="button"
                onClick={() => generateSignature(i)}
                disabled={sigLoading}
                className={`rounded-xl border-2 px-3 h-16 flex items-center justify-center transition-all overflow-hidden disabled:opacity-60 ${
                  selectedSig === i
                    ? 'border-[#1D9E75] bg-[#f0fdf8]'
                    : 'border-gray-100 hover:border-gray-200 bg-gray-50'
                }`}
              >
                <span
                  style={{
                    fontFamily: `"${f.family}", cursive`,
                    fontWeight: f.weight,
                    fontSize:   '22px',
                    color:      selectedSig === i ? '#1D9E75' : '#111827',
                    lineHeight: 1,
                    whiteSpace: 'nowrap',
                    maxWidth:   '100%',
                    overflow:   'hidden',
                  }}
                >
                  {form.full_name.trim().split(/\s+/).slice(0, 2).join(' ')}
                </span>
              </button>
            ))}
          </div>
        )}

        {form.signature_data && (
          <div className="flex items-center gap-3 pt-4 mt-4 border-t border-gray-50">
            <div className="flex-1 min-w-0">
              <p className="text-[11px] text-gray-400 mb-1.5">Prévia no PDF:</p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={form.signature_data} alt="Assinatura" className="h-9 object-contain" />
            </div>
            <button
              type="button"
              onClick={() => { set('signature_data', ''); setSelectedSig(null) }}
              className="text-xs text-gray-400 hover:text-red-500 transition-colors shrink-0"
            >
              Remover
            </button>
          </div>
        )}
      </div>

      {/* Cor da proposta */}
      <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-900 mb-1">Cor da proposta</h3>
        <p className="text-xs text-gray-500 mb-4">Cor do cabeçalho e destaques no PDF gerado.</p>
        <div className="flex items-center gap-3">
          <input
            type="color"
            value={form.accent_color}
            onChange={e => set('accent_color', e.target.value)}
            className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer p-0.5 bg-white"
          />
          <div
            className="w-8 h-8 rounded-lg border border-gray-100 shadow-sm"
            style={{ backgroundColor: form.accent_color }}
          />
          <span className="text-sm font-mono text-gray-700">{form.accent_color.toUpperCase()}</span>
          <button
            type="button"
            onClick={() => set('accent_color', '#1D9E75')}
            className="text-xs text-gray-400 hover:text-[#1D9E75] transition-colors"
          >
            Resetar
          </button>
        </div>
      </div>

      {/* Redes sociais */}
      <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm space-y-4">
        <h3 className="text-sm font-semibold text-gray-900">Redes sociais</h3>
        <p className="text-xs text-gray-500 -mt-2">Exibidas no PDF da proposta.</p>

        {([
          { key: 'instagram', label: 'Instagram', placeholder: '@usuario ou URL', icon: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z' },
          { key: 'linkedin',  label: 'LinkedIn',  placeholder: 'URL do perfil ou empresa', icon: 'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z' },
          { key: 'facebook',  label: 'Facebook',  placeholder: 'URL da página ou perfil', icon: 'M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z' },
          { key: 'youtube',   label: 'YouTube',   placeholder: 'URL do canal', icon: 'M23.495 6.205a3.007 3.007 0 0 0-2.088-2.088c-1.87-.501-9.396-.501-9.396-.501s-7.507-.01-9.396.501A3.007 3.007 0 0 0 .527 6.205a31.247 31.247 0 0 0-.522 5.805 31.247 31.247 0 0 0 .522 5.783 3.007 3.007 0 0 0 2.088 2.088c1.868.502 9.396.502 9.396.502s7.506 0 9.396-.502a3.007 3.007 0 0 0 2.088-2.088 31.247 31.247 0 0 0 .5-5.783 31.247 31.247 0 0 0-.5-5.805zM9.609 15.601V8.408l6.264 3.602z' },
          { key: 'tiktok',    label: 'TikTok',    placeholder: '@usuario ou URL', icon: 'M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z' },
        ] as const).map(({ key, label, placeholder, icon }) => (
          <div key={key}>
            <label className={labelCls}>
              <span className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" viewBox="0 0 24 24" fill="currentColor">
                  <path d={icon} />
                </svg>
                {label}
              </span>
            </label>
            <input
              type="text"
              value={form[key]}
              onChange={e => set(key, e.target.value)}
              placeholder={placeholder}
              className={inputCls}
            />
          </div>
        ))}
      </div>

      <div className="flex flex-col items-end gap-2">
        <button
          type="submit"
          disabled={saving}
          className="px-6 py-2.5 bg-[#1D9E75] text-white text-sm font-medium rounded-lg hover:bg-[#188f68] transition-colors disabled:opacity-50"
        >
          {saving ? 'Salvando...' : 'Salvar alterações'}
        </button>
        <p className="text-xs text-gray-400 text-right max-w-sm">
          Ao salvar, você confirma que as informações são verdadeiras e de sua responsabilidade, e que possui autorização para emitir propostas em nome da empresa cadastrada.
        </p>
      </div>
    </form>
  )
}

// ─── Tab: Plano ───────────────────────────────────────────────────────────────

const PRO_FEATURES = [
  'Propostas ilimitadas',
  'Clientes ilimitados',
  'PDF sem marca d\'água',
  'Follow-up automático para o cliente',
  'Rastreamento de abertura em tempo real',
]

function PlanTab({ sub }: { sub: SubInfo }) {
  const isPro      = sub.plan === 'pro' && (sub.status === 'active' || sub.status === 'trialing')
  const isPastDue  = sub.status === 'past_due'
  const st         = STATUS_LABELS[sub.status] ?? { label: sub.status, cls: 'bg-gray-100 text-gray-600' }
  const usagePct   = isPro ? 0 : Math.min(100, (sub.used / sub.limit) * 100)

  const [loadingBtn, setLoading] = useState<string | null>(null)
  const [err, setErr]            = useState<string | null>(null)
  const [syncing, setSyncing]    = useState(false)

  // Auto-sync silencioso ao abrir a aba — detecta cancelamentos que o webhook não entregou
  useEffect(() => {
    if (!sub.stripe_customer_id) return
    fetch('/api/subscriptions/sync', { method: 'POST' })
      .then(r => r.json())
      .then(data => { if (data.synced && data.plan !== sub.plan) window.location.reload() })
      .catch(() => {})
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function handleSync() {
    setSyncing(true)
    setErr(null)
    try {
      const res  = await fetch('/api/subscriptions/sync', { method: 'POST', cache: 'no-store' })
      const data = await res.json()
      if (data.synced) {
        window.location.reload()
      } else {
        setErr('Erro ao sincronizar com o Stripe.')
      }
    } catch {
      setErr('Erro ao verificar plano.')
    } finally {
      setSyncing(false)
    }
  }

  async function handleCheckout(priceId: string | undefined) {
    if (!priceId || !priceId.startsWith('price_')) {
      setErr('Configuração de preço não encontrada. Contate o suporte.')
      return
    }
    setLoading(priceId)
    setErr(null)
    try {
      const res  = await fetch('/api/subscriptions/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ price_id: priceId }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      window.location.href = data.url
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Erro ao iniciar checkout')
      setLoading(null)
    }
  }

  async function handlePortal() {
    setLoading('portal')
    setErr(null)
    try {
      const res  = await fetch('/api/subscriptions/portal', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      window.location.href = data.url
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Erro ao abrir portal')
      setLoading(null)
    }
  }

  const PRICE_MONTHLY = process.env.NEXT_PUBLIC_STRIPE_PRICE_MONTHLY
  const PRICE_YEARLY  = process.env.NEXT_PUBLIC_STRIPE_PRICE_YEARLY

  return (
    <div className="space-y-4">
      {err && (
        <div className="p-3 rounded-lg text-sm bg-red-50 border border-red-200 text-red-700">{err}</div>
      )}

      {/* Current plan card */}
      <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Plano atual</p>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-gray-900">{isPro ? 'Pro' : 'Free'}</span>
              {(isPro || isPastDue) && (
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${st.cls}`}>{st.label}</span>
              )}
              {isPro && (
                <span className="bg-[#1D9E75] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">PRO</span>
              )}
            </div>
          </div>
          {isPro && sub.current_period_end && (
            <div className="text-right">
              <p className="text-xs text-gray-400">Renova em</p>
              <p className="text-sm font-medium text-gray-700">{fmtDate(sub.current_period_end)}</p>
            </div>
          )}
        </div>

        {/* Free: usage bar */}
        {!isPro && (
          <div>
            <div className="flex justify-between text-xs text-gray-500 mb-1.5">
              <span>Propostas este mês</span>
              <span className={sub.used >= sub.limit ? 'font-semibold text-red-600' : 'font-semibold text-gray-700'}>
                {sub.used} / {sub.limit}
              </span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${usagePct >= 100 ? 'bg-red-500' : usagePct >= 80 ? 'bg-amber-500' : 'bg-[#1D9E75]'}`}
                style={{ width: `${usagePct}%` }}
              />
            </div>
          </div>
        )}

        {/* Pro: features list + manage button */}
        {isPro && (
          <div className="space-y-3">
            <ul className="space-y-1.5">
              {PRO_FEATURES.map(f => (
                <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#1D9E75] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  {f}
                </li>
              ))}
            </ul>
            {sub.stripe_customer_id && (
              <button
                onClick={handlePortal}
                disabled={loadingBtn === 'portal'}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                {loadingBtn === 'portal' && <div className="w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />}
                Gerenciar assinatura →
              </button>
            )}
          </div>
        )}

        {/* Past due warning */}
        {isPastDue && (
          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            Há uma falha no pagamento. Atualize seu método de pagamento para continuar com acesso Pro.
            {sub.stripe_customer_id && (
              <button
                onClick={handlePortal}
                disabled={loadingBtn === 'portal'}
                className="ml-2 underline font-medium disabled:opacity-50"
              >
                Corrigir agora →
              </button>
            )}
          </div>
        )}
      </div>

      {/* Upgrade card — show for free or canceled */}
      {!isPro && (
        <div className="bg-white border-2 border-[#1D9E75] rounded-xl p-6 shadow-sm">
          <div className="flex items-start justify-between mb-4">
            <div>
              <span className="text-xs font-semibold text-[#1D9E75] uppercase tracking-wider">Plano Pro</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-2xl font-bold text-gray-900">R$19</span>
                <span className="text-sm text-gray-500">/mês</span>
              </div>
            </div>
            <span className="bg-[#1D9E75]/10 text-[#1D9E75] text-xs font-semibold px-2 py-1 rounded-full">Recomendado</span>
          </div>

          <ul className="space-y-2 text-sm text-gray-600 mb-5">
            {PRO_FEATURES.map(f => (
              <li key={f} className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#1D9E75] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                {f}
              </li>
            ))}
          </ul>

          <div className="space-y-2.5">
            <button
              onClick={() => handleCheckout(PRICE_MONTHLY)}
              disabled={!!loadingBtn || syncing}
              className="flex items-center justify-center gap-2 w-full py-2.5 bg-[#1D9E75] text-white text-sm font-semibold rounded-xl hover:bg-[#188f68] transition-colors disabled:opacity-50"
            >
              {loadingBtn === PRICE_MONTHLY && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
              Assinar Pro Mensal — R$19/mês
            </button>
            <button
              onClick={() => handleCheckout(PRICE_YEARLY)}
              disabled={!!loadingBtn || syncing}
              className="flex items-center justify-center gap-2 w-full py-2.5 border border-[#1D9E75] text-[#1D9E75] text-sm font-semibold rounded-xl hover:bg-[#1D9E75]/5 transition-colors disabled:opacity-50"
            >
              {loadingBtn === PRICE_YEARLY && <div className="w-4 h-4 border-2 border-[#1D9E75] border-t-transparent rounded-full animate-spin" />}
              Assinar Pro Anual — R$190/ano
              <span className="text-[10px] font-bold bg-[#1D9E75] text-white px-1.5 py-0.5 rounded-full">economize 2 meses</span>
            </button>
            <button
              onClick={handleSync}
              disabled={!!loadingBtn || syncing}
              className="flex items-center justify-center gap-2 w-full py-2 text-xs text-gray-500 hover:text-gray-700 transition-colors disabled:opacity-50"
            >
              {syncing && <div className="w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />}
              {syncing ? 'Verificando…' : 'Já assinou? Clique aqui para verificar o plano'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Tab: Follow-ups ─────────────────────────────────────────────────────────

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      className={`relative shrink-0 w-10 h-6 rounded-full transition-colors ${value ? 'bg-[#1D9E75]' : 'bg-gray-200'}`}
      role="switch"
      aria-checked={value}
    >
      <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${value ? 'translate-x-4' : 'translate-x-0'}`} />
    </button>
  )
}

function FollowUpsTab({
  initialEnabled,
  initialDays,
  initialExpiryEnabled,
}: {
  initialEnabled:        boolean
  initialDays:           number
  initialExpiryEnabled:  boolean
}) {
  const [enabled,       setEnabled]       = useState(initialEnabled)
  const [days,          setDays]          = useState(String(initialDays))
  const [expiryEnabled, setExpiryEnabled] = useState(initialExpiryEnabled)
  const [saving,        setSaving]        = useState(false)
  const [msg,           setMsg]           = useState<{ text: string; ok: boolean } | null>(null)

  async function handleSave() {
    setSaving(true)
    setMsg(null)
    try {
      const res = await fetch('/api/profile', {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          followup_enabled:        enabled,
          followup_days:           parseInt(days, 10) || 2,
          followup_expiry_enabled: expiryEnabled,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setMsg({ text: 'Configurações salvas!', ok: true })
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (e) {
      setMsg({ text: e instanceof Error ? e.message : 'Erro ao salvar', ok: false })
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } finally {
      setSaving(false)
    }
  }

  const inputCls = 'px-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#1D9E75] focus:border-transparent w-24 text-center'

  return (
    <div className="space-y-4">
      {msg && (
        <div className={`p-3 rounded-lg text-sm ${msg.ok ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-red-50 border border-red-200 text-red-700'}`}>
          {msg.text}
        </div>
      )}

      {/* ── Lembrete de resposta ─────────────────────────────── */}
      <div className="bg-white border border-gray-100 rounded-xl shadow-sm divide-y divide-gray-50">
        <div className="px-6 py-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Lembrete de resposta</p>
        </div>

        <div className="flex items-center justify-between px-6 py-4 gap-4">
          <div>
            <p className="text-sm font-medium text-gray-900">Follow-up automático</p>
            <p className="text-xs text-gray-500 mt-0.5">
              Enviar e-mail ao cliente quando a proposta ficar sem resposta.
            </p>
          </div>
          <Toggle value={enabled} onChange={setEnabled} />
        </div>

        <div className={`flex items-center justify-between px-6 py-4 gap-4 ${!enabled ? 'opacity-40 pointer-events-none' : ''}`}>
          <div>
            <p className="text-sm font-medium text-gray-900">Dias sem resposta</p>
            <p className="text-xs text-gray-500 mt-0.5">
              Disparar o follow-up após quantos dias sem visualização ou resposta.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <input
              type="number"
              min={1}
              max={30}
              value={days}
              onChange={e => setDays(e.target.value)}
              className={inputCls}
            />
            <span className="text-sm text-gray-500">dias</span>
          </div>
        </div>
      </div>

      {/* ── Aviso de expiração iminente ──────────────────────── */}
      <div className="bg-white border border-gray-100 rounded-xl shadow-sm divide-y divide-gray-50">
        <div className="px-6 py-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Aviso de expiração</p>
        </div>

        <div className="flex items-center justify-between px-6 py-4 gap-4">
          <div>
            <p className="text-sm font-medium text-gray-900">Avisar sobre expiração iminente</p>
            <p className="text-xs text-gray-500 mt-0.5">
              Enviar e-mail ao cliente 1 dia antes da proposta expirar, se ainda não respondeu.
            </p>
          </div>
          <Toggle value={expiryEnabled} onChange={setExpiryEnabled} />
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-100 rounded-xl px-5 py-4 text-xs text-blue-700 space-y-1">
        <p className="font-semibold">Como funciona:</p>
        <p>• <strong>Não visualizou:</strong> proposta em "enviada" há X dias → lembrete de visualização.</p>
        <p>• <strong>Visualizou mas não respondeu:</strong> proposta em "visualizada" há X dias → lembrete de resposta.</p>
        <p>• <strong>Expira amanhã:</strong> proposta sem resposta com vencimento no dia seguinte → alerta de urgência.</p>
        <p>• Cada regra é disparada no máximo <strong>1 vez por proposta</strong>.</p>
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2.5 bg-[#1D9E75] text-white text-sm font-medium rounded-lg hover:bg-[#188f68] transition-colors disabled:opacity-50"
        >
          {saving ? 'Salvando...' : 'Salvar configurações'}
        </button>
      </div>
    </div>
  )
}

// ─── Tab: Notificações ────────────────────────────────────────────────────────

type NotifKeys = 'email_viewed' | 'email_responded' | 'email_followup'

const NOTIF_DEFAULTS: Record<NotifKeys, boolean> = {
  email_viewed:    true,
  email_responded: true,
  email_followup:  true,
}

const NOTIF_LABELS: Record<NotifKeys, { title: string; desc: string }> = {
  email_viewed:    { title: 'Proposta visualizada',      desc: 'Receber e-mail quando o cliente abrir o link da proposta.' },
  email_responded: { title: 'Proposta aceita/recusada', desc: 'Receber e-mail quando o cliente aceitar ou recusar.' },
  email_followup:  { title: 'Follow-up automático',      desc: 'Receber e-mail diário com os follow-ups agendados.' },
}

function NotificationsTab() {
  const [prefs,   setPrefs]   = useState<Record<NotifKeys, boolean>>(NOTIF_DEFAULTS)
  const [loading, setLoading] = useState(true)
  const [saving,  setSaving]  = useState<NotifKeys | null>(null)

  useEffect(() => {
    fetch('/api/profile')
      .then(r => r.json())
      .then(data => {
        if (!data) return
        setPrefs({
          email_viewed:    data.notify_email_viewed    ?? true,
          email_responded: data.notify_email_responded ?? true,
          email_followup:  data.notify_email_followup  ?? true,
        })
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  async function toggle(k: NotifKeys) {
    const next = !prefs[k]
    setPrefs(p => ({ ...p, [k]: next }))
    setSaving(k)
    try {
      await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [`notify_${k}`]: next }),
      })
    } catch { /* ignore */ } finally {
      setSaving(null)
    }
  }

  return (
    <div className="space-y-4">
      <div className="bg-white border border-gray-100 rounded-xl shadow-sm divide-y divide-gray-50">
        {(Object.keys(NOTIF_LABELS) as NotifKeys[]).map(k => (
          <div key={k} className="flex items-center justify-between px-6 py-4 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-900">{NOTIF_LABELS[k].title}</p>
              <p className="text-xs text-gray-500 mt-0.5">{NOTIF_LABELS[k].desc}</p>
            </div>
            <button
              type="button"
              onClick={() => toggle(k)}
              disabled={loading || saving === k}
              className={`relative shrink-0 w-10 h-6 rounded-full transition-colors disabled:opacity-60 ${prefs[k] ? 'bg-[#1D9E75]' : 'bg-gray-200'}`}
              role="switch"
              aria-checked={prefs[k]}
            >
              <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${prefs[k] ? 'translate-x-4' : 'translate-x-0'}`} />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

type Tab = 'perfil' | 'plano' | 'notificacoes' | 'followups' | 'suporte'

export default function ConfiguracoesPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-[#1D9E75] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <ConfiguracoesInner />
    </Suspense>
  )
}

function ConfiguracoesInner() {
  const searchParams = useSearchParams()
  const router       = useRouter()
  const tab = (searchParams.get('tab') as Tab) ?? 'perfil'

  const [profile, setProfile] = useState<Profile | null>(null)
  const [sub,     setSub]     = useState<SubInfo | null>(null)
  const [loading, setLoading] = useState(true)

  function loadData() {
    setLoading(true)
    Promise.all([
      fetch('/api/profile',        { cache: 'no-store' }).then(r => r.json()),
      fetch('/api/subscriptions',  { cache: 'no-store' }).then(r => r.json()),
    ])
      .then(([p, s]) => { setProfile(p); setSub(s) })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadData()

    // Re-busca ao voltar à aba (ex: após checkout Stripe)
    const onFocus = () => {
      if (document.visibilityState === 'visible') loadData()
    }
    document.addEventListener('visibilitychange', onFocus)
    return () => document.removeEventListener('visibilitychange', onFocus)
  }, [])

  const tabs: { id: Tab; label: string }[] = [
    { id: 'perfil',        label: 'Perfil' },
    { id: 'plano',         label: 'Plano' },
    { id: 'notificacoes',  label: 'Notificações' },
    { id: 'followups',     label: 'Follow-ups' },
    { id: 'suporte',       label: 'Suporte' },
  ]

  return (
    <div className="p-4 md:p-8 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-xl md:text-2xl font-bold text-gray-900">Configurações</h1>
        <p className="text-sm text-gray-500 mt-0.5">Gerencie seu perfil, plano e preferências</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200 mb-6 overflow-x-auto scrollbar-hide">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => router.replace(`/configuracoes?tab=${t.id}`, { scroll: false })}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors whitespace-nowrap shrink-0 ${
              tab === t.id
                ? 'border-[#1D9E75] text-[#1D9E75]'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {t.label}
            {t.id === 'plano' && sub && sub.plan !== 'free' && (
              <span className="ml-1.5 bg-[#1D9E75] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">PRO</span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-6 h-6 border-2 border-[#1D9E75] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {tab === 'perfil'        && profile && (
            <ProfileTab
              initial={profile}
              isPro={!!sub && sub.plan !== 'free' && (sub.status === 'active' || sub.status === 'trialing')}
            />
          )}
          {tab === 'plano'         && sub     && <PlanTab sub={sub} />}
          {tab === 'notificacoes'             && <NotificationsTab />}
          {tab === 'followups'     && profile && (
            <FollowUpsTab
              initialEnabled={profile.followup_enabled ?? true}
              initialDays={profile.followup_days ?? 2}
              initialExpiryEnabled={profile.followup_expiry_enabled ?? true}
            />
          )}
          {tab === 'suporte' && <SuporteTab />}
        </>
      )}
    </div>
  )
}

// ─── Tab: Suporte ─────────────────────────────────────────────────────────────

const TIPOS_SUPORTE = ['Dúvida', 'Sugestão', 'Problema', 'Outro'] as const

function SuporteTab() {
  const [tipo,     setTipo]     = useState<string>('Dúvida')
  const [mensagem, setMensagem] = useState('')
  const [sending,  setSending]  = useState(false)
  const [result,   setResult]   = useState<{ ok: boolean; text: string } | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (mensagem.trim().length < 20) return
    setSending(true)
    setResult(null)
    try {
      const res  = await fetch('/api/support', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ tipo, mensagem: mensagem.trim() }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Erro ao enviar')
      setResult({ ok: true, text: 'Mensagem enviada! Responderemos em breve no seu email.' })
      setTipo('Dúvida')
      setMensagem('')
    } catch (e: unknown) {
      setResult({ ok: false, text: e instanceof Error ? e.message : 'Erro ao enviar mensagem.' })
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm">
        <h2 className="text-base font-semibold text-gray-900 mb-1">Fale conosco</h2>
        <p className="text-sm text-gray-500 mb-6">
          Dúvidas, sugestões ou problemas? Nos conte o que está acontecendo.
        </p>

        {result && (
          <div className={`mb-5 p-3 rounded-lg text-sm ${result.ok ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-red-50 border border-red-200 text-red-700'}`}>
            {result.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
            <select
              value={tipo}
              onChange={e => setTipo(e.target.value)}
              disabled={sending}
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#1D9E75] focus:border-transparent disabled:opacity-50"
            >
              {TIPOS_SUPORTE.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mensagem</label>
            <textarea
              value={mensagem}
              onChange={e => setMensagem(e.target.value)}
              required
              disabled={sending}
              rows={5}
              placeholder="Descreva sua dúvida, sugestão ou problema com o máximo de detalhes..."
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#1D9E75] focus:border-transparent resize-none disabled:opacity-50"
            />
            <p className={`text-xs mt-1 ${mensagem.trim().length < 20 && mensagem.length > 0 ? 'text-amber-600' : 'text-gray-400'}`}>
              {mensagem.trim().length} / 20 caracteres mínimos
            </p>
          </div>

          <button
            type="submit"
            disabled={sending || mensagem.trim().length < 20}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[#1D9E75] text-white text-sm font-semibold rounded-xl hover:bg-[#188f68] transition-colors disabled:opacity-50"
          >
            {sending && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
            {sending ? 'Enviando...' : 'Enviar mensagem'}
          </button>
        </form>
      </div>
    </div>
  )
}
