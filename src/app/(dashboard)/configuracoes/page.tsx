'use client'

import { Suspense, useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Image from 'next/image'

// ─── Types ───────────────────────────────────────────────────────────────────

type DocType = 'cpf' | 'cnpj'

type Profile = {
  full_name:      string | null
  business_name:  string | null
  phone:          string | null
  logo_url:       string | null
  accent_color:   string
  email_business: string | null
  address:        string | null
  document_type:  DocType | null
  cpf_cnpj:       string | null
  website:        string | null
}

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

function ProfileTab({ initial }: { initial: Profile }) {
  const [form, setForm] = useState({
    full_name:      initial.full_name      ?? '',
    business_name:  initial.business_name  ?? '',
    phone:          initial.phone          ?? '',
    email_business: initial.email_business ?? '',
    address:        initial.address        ?? '',
    website:        initial.website        ?? '',
    accent_color:   initial.accent_color   ?? '#1D9E75',
    logo_url:       initial.logo_url       ?? '',
    document_type:  (initial.document_type ?? 'cpf') as DocType,
    cpf_cnpj:       applyDocMask(initial.cpf_cnpj, initial.document_type),
  })

  const [logoPreview, setPreview] = useState<string | null>(initial.logo_url)
  const [saving,    setSaving]    = useState(false)
  const [uploading, setUp]        = useState(false)
  const [msg,       setMsg]       = useState<{ text: string; ok: boolean } | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

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
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          cpf_cnpj: form.cpf_cnpj.replace(/\D/g, '') || null,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setMsg({ text: 'Perfil salvo com sucesso!', ok: true })
    } catch (e: unknown) {
      setMsg({ text: e instanceof Error ? e.message : 'Erro ao salvar', ok: false })
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
            <input type="tel" value={form.phone} onChange={e => set('phone', e.target.value)}
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
          <input type="url" value={form.website} onChange={e => set('website', e.target.value)}
            placeholder="https://rcdesign.com.br" className={inputCls} />
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
  'PDF com sua identidade visual',
  'Envio por e-mail com aprovação via link',
  'Follow-ups automáticos',
  'Link público rastreável',
  'Suporte prioritário',
]

function PlanTab({ sub }: { sub: SubInfo }) {
  const isPro    = sub.plan === 'pro' && (sub.status === 'active' || sub.status === 'trialing')
  const isCanceled = sub.plan === 'pro' && sub.status === 'canceled'
  const isPastDue  = sub.status === 'past_due'
  const st         = STATUS_LABELS[sub.status] ?? { label: sub.status, cls: 'bg-gray-100 text-gray-600' }
  const usagePct   = isPro ? 0 : Math.min(100, (sub.used / sub.limit) * 100)

  const [loadingBtn, setLoading] = useState<string | null>(null)
  const [err, setErr]            = useState<string | null>(null)

  async function handleCheckout(priceId: string) {
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

  const PRICE_MONTHLY = process.env.NEXT_PUBLIC_STRIPE_PRICE_MONTHLY ?? 'price_monthly'
  const PRICE_YEARLY  = process.env.NEXT_PUBLIC_STRIPE_PRICE_YEARLY  ?? 'price_yearly'

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
              <span className="text-xl font-bold text-gray-900">{isPro || isCanceled ? 'Pro' : 'Free'}</span>
              {(isPro || isCanceled || isPastDue) && (
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${st.cls}`}>{st.label}</span>
              )}
              {isPro && (
                <span className="bg-[#1D9E75] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">PRO</span>
              )}
            </div>
          </div>
          {sub.current_period_end && (
            <div className="text-right">
              <p className="text-xs text-gray-400">
                {isCanceled ? 'Acesso até' : 'Renova em'}
              </p>
              <p className="text-sm font-medium text-gray-700">{fmtDate(sub.current_period_end)}</p>
            </div>
          )}
        </div>

        {/* Free: usage bar */}
        {!isPro && !isCanceled && (
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

        {/* Pro: unlimited + manage button */}
        {(isPro || isCanceled) && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500 flex items-center gap-1.5">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#1D9E75]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              {isCanceled ? 'Acesso Pro até o fim do período' : 'Propostas ilimitadas'}
            </p>
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
                <span className="text-2xl font-bold text-gray-900">R$39</span>
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
              disabled={!!loadingBtn}
              className="flex items-center justify-center gap-2 w-full py-2.5 bg-[#1D9E75] text-white text-sm font-semibold rounded-xl hover:bg-[#188f68] transition-colors disabled:opacity-50"
            >
              {loadingBtn === PRICE_MONTHLY && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
              Assinar Pro Mensal — R$39/mês
            </button>
            <button
              onClick={() => handleCheckout(PRICE_YEARLY)}
              disabled={!!loadingBtn}
              className="flex items-center justify-center gap-2 w-full py-2.5 border border-[#1D9E75] text-[#1D9E75] text-sm font-semibold rounded-xl hover:bg-[#1D9E75]/5 transition-colors disabled:opacity-50"
            >
              {loadingBtn === PRICE_YEARLY && <div className="w-4 h-4 border-2 border-[#1D9E75] border-t-transparent rounded-full animate-spin" />}
              Assinar Pro Anual — R$349/ano
              <span className="text-[10px] font-bold bg-[#1D9E75] text-white px-1.5 py-0.5 rounded-full">economize 2 meses</span>
            </button>
          </div>
        </div>
      )}
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
  email_responded: { title: 'Proposta aprovada/reprovada', desc: 'Receber e-mail quando o cliente aceitar ou recusar.' },
  email_followup:  { title: 'Follow-up automático',      desc: 'Receber e-mail diário com os follow-ups agendados.' },
}

function NotificationsTab() {
  const [prefs, setPrefs] = useState<Record<NotifKeys, boolean>>(NOTIF_DEFAULTS)
  const [saved,  setSaved] = useState(false)

  useEffect(() => {
    try {
      const raw = localStorage.getItem('ff_notif_prefs')
      if (raw) setPrefs({ ...NOTIF_DEFAULTS, ...JSON.parse(raw) })
    } catch { /* ignore */ }
  }, [])

  function toggle(k: NotifKeys) {
    setPrefs(p => {
      const next = { ...p, [k]: !p[k] }
      localStorage.setItem('ff_notif_prefs', JSON.stringify(next))
      return next
    })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  function handleSave() {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
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
              className={`relative shrink-0 w-10 h-6 rounded-full transition-colors ${prefs[k] ? 'bg-[#1D9E75]' : 'bg-gray-200'}`}
              role="switch"
              aria-checked={prefs[k]}
            >
              <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${prefs[k] ? 'translate-x-4' : 'translate-x-0'}`} />
            </button>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-400">
          E-mails serão enviados quando a integração de envio automático for configurada.
        </p>
        <button
          type="button"
          onClick={handleSave}
          className="px-4 py-2 bg-[#1D9E75] text-white text-sm font-medium rounded-lg hover:bg-[#188f68] transition-colors"
        >
          {saved ? 'Salvo!' : 'Salvar preferências'}
        </button>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

type Tab = 'perfil' | 'plano' | 'notificacoes'

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
  const [tab, setTab]       = useState<Tab>((searchParams.get('tab') as Tab) ?? 'perfil')
  const [profile, setProfile] = useState<Profile | null>(null)
  const [sub,     setSub]     = useState<SubInfo | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/profile').then(r => r.json()),
      fetch('/api/subscriptions').then(r => r.json()),
    ])
      .then(([p, s]) => { setProfile(p); setSub(s) })
      .finally(() => setLoading(false))
  }, [])

  const tabs: { id: Tab; label: string }[] = [
    { id: 'perfil',        label: 'Perfil' },
    { id: 'plano',         label: 'Plano' },
    { id: 'notificacoes',  label: 'Notificações' },
  ]

  return (
    <div className="p-6 md:p-8 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Configurações</h1>
        <p className="text-sm text-gray-500 mt-0.5">Gerencie seu perfil, plano e preferências</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200 mb-6">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
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
          {tab === 'perfil'        && profile && <ProfileTab initial={profile} />}
          {tab === 'plano'         && sub     && <PlanTab sub={sub} />}
          {tab === 'notificacoes'             && <NotificationsTab />}
        </>
      )}
    </div>
  )
}
