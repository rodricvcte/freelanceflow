import { redirect } from 'next/navigation'
import Link from 'next/link'
import { cookies } from 'next/headers'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { createServiceClient } from '@/lib/supabase-service'
import ImpersonateButton from './ImpersonateButton'
import FoundersTab from './FoundersTab'

const ADMIN_EMAIL = 'rodrigosc19@gmail.com'

function fmtDate(iso: string | null | undefined) {
  if (!iso) return '—'
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(iso))
}

function fmtDateTime(iso: string | null | undefined) {
  if (!iso) return '—'
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
    timeZone: 'America/Sao_Paulo',
  }).format(new Date(iso))
}

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>
}) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.email !== ADMIN_EMAIL) redirect('/dashboard')

  const cookieStore = await cookies()
  if (cookieStore.get('ff_view_as_id')?.value) {
    redirect('/api/admin/stop-impersonate')
  }

  const { tab = 'usuarios' } = await searchParams
  const activeTab = tab === 'fundadores' ? 'fundadores' : 'usuarios'

  const service = createServiceClient()

  const [
    { data: { users } },
    { data: profiles },
    { data: subs },
    { data: leads },
  ] = await Promise.all([
    service.auth.admin.listUsers({ perPage: 1000 }),
    service.from('profiles').select('id, full_name, business_name'),
    service.from('subscriptions').select('user_id, plan, status'),
    service.from('founder_leads').select('id, name, email, created_at, coupon_sent').order('created_at', { ascending: false }),
  ])

  // eslint-disable-next-line react-hooks/purity
  const cutoff = new Date(Date.now() - 30 * 86_400_000)

  const rows = users.map(u => {
    const profile  = profiles?.find(p => p.id === u.id)
    const sub      = subs?.find(s => s.user_id === u.id)
    const isPro    = sub?.plan === 'pro' && (sub.status === 'active' || sub.status === 'trialing')
    const lastLogin = u.last_sign_in_at ?? null
    const isActive = lastLogin ? new Date(lastLogin) > cutoff : false
    const name     = profile?.business_name ?? profile?.full_name ?? '—'
    return { u, name, isPro, isActive, lastLogin }
  }).sort((a, b) => new Date(b.u.created_at).getTime() - new Date(a.u.created_at).getTime())

  const tabClass = (t: string) =>
    t === activeTab
      ? 'px-4 py-2.5 text-sm font-semibold text-[#1D9E75] border-b-2 border-[#1D9E75] -mb-px'
      : 'px-4 py-2.5 text-sm font-medium text-gray-500 hover:text-gray-700 border-b-2 border-transparent -mb-px transition-colors'

  return (
    <div className="p-6 md:p-8 max-w-7xl">

      {/* Header */}
      <div className="mb-5 md:mb-6">
        <h1 className="text-xl md:text-2xl font-bold text-gray-900">Painel Administrativo</h1>
        <p className="text-sm text-gray-400 mt-0.5">FreelanceFlow</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6">
        <Link href="?tab=usuarios"   className={tabClass('usuarios')}>Usuários</Link>
        <Link href="?tab=fundadores" className={tabClass('fundadores')}>
          Fundadores
          {(leads?.length ?? 0) > 0 && (
            <span className="ml-2 inline-flex items-center justify-center w-5 h-5 text-[10px] font-bold rounded-full bg-[#1D9E75]/10 text-[#1D9E75]">
              {leads!.length}
            </span>
          )}
        </Link>
      </div>

      {/* ── Tab: Usuários ── */}
      {activeTab === 'usuarios' && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            {[
              { label: 'Total de usuários', value: rows.length },
              { label: 'Plano Pro',         value: rows.filter(r => r.isPro).length },
              { label: 'Ativos (30d)',       value: rows.filter(r => r.isActive).length },
              { label: 'Nunca logaram',      value: rows.filter(r => !r.lastLogin).length },
            ].map(stat => (
              <div key={stat.label} className="bg-white rounded-[10px] border border-gray-100 px-4 py-3">
                <p className="text-xs text-gray-400 mb-1">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            ))}
          </div>

          <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wide px-4 py-3">E-mail</th>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wide px-4 py-3">Nome</th>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wide px-4 py-3 whitespace-nowrap">Cadastro</th>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wide px-4 py-3 whitespace-nowrap">Último login</th>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wide px-4 py-3">Plano</th>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wide px-4 py-3">Status</th>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wide px-4 py-3">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {rows.map((row, i) => (
                    <tr key={row.u.id} className={i % 2 !== 0 ? 'bg-gray-50/50' : 'bg-white'}>
                      <td className="px-4 py-3 text-gray-700 max-w-[200px]">
                        <span className="truncate block">{row.u.email ?? '—'}</span>
                        {row.u.email === ADMIN_EMAIL && (
                          <span className="text-[10px] font-semibold text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded">admin</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-700 max-w-[160px]">
                        <span className="truncate block">{row.name}</span>
                      </td>
                      <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{fmtDate(row.u.created_at)}</td>
                      <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{fmtDateTime(row.lastLogin)}</td>
                      <td className="px-4 py-3">
                        {row.isPro ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-[#1D9E75]/10 text-[#1D9E75]">Pro</span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500">Free</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {row.isActive ? (
                          <span className="inline-flex items-center gap-1 text-xs text-emerald-700">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            Ativo
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs text-gray-400">
                            <span className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                            Inativo
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {row.u.email !== ADMIN_EMAIL && (
                          <ImpersonateButton userId={row.u.id} email={row.u.email ?? ''} />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* ── Tab: Fundadores ── */}
      {activeTab === 'fundadores' && (
        <FoundersTab leads={leads ?? []} />
      )}

    </div>
  )
}
