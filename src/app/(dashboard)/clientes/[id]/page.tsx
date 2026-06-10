import { createServerSupabaseClient } from '@/lib/supabase-server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import DeleteClientButton from './DeleteClientButton'

type Proposal = {
  id: string
  title: string
  value: number | null
  status: string
  created_at: string
  token: string
  pdf_url: string | null
}

type Client = {
  id: string
  name: string
  email: string | null
  phone: string | null
  notes: string | null
  created_at: string
  proposals: Proposal[]
}

function fmtBRL(v: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)
}

function fmtDate(s: string) {
  const [y, m, d] = s.split('T')[0].split('-')
  return `${d}/${m}/${y}`
}

function initials(name: string) {
  return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
}

const STATUS_LABELS: Record<string, { label: string; cls: string }> = {
  draft:    { label: 'Rascunho',  cls: 'bg-gray-100 text-gray-600' },
  sent:     { label: 'Enviada',   cls: 'bg-blue-100 text-blue-700' },
  viewed:   { label: 'Visualizada', cls: 'bg-yellow-100 text-yellow-700' },
  accepted: { label: 'Aceita',    cls: 'bg-green-100 text-green-700' },
  rejected: { label: 'Recusada',  cls: 'bg-red-100 text-red-700' },
}

export default async function ClienteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createServerSupabaseClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: client, error } = await supabase
    .from('clients')
    .select('id, name, email, phone, notes, created_at, proposals(id, title, value, status, created_at, token, pdf_url)')
    .eq('id', id)
    .eq('user_id', user.id)
    .single() as { data: Client | null; error: unknown }

  if (error || !client) notFound()

  const proposals = Array.isArray(client.proposals) ? client.proposals : []
  const totalValue = proposals.reduce((s, p) => s + (p.value ?? 0), 0)
  const acceptedCount = proposals.filter(p => p.status === 'accepted').length

  return (
    <div className="p-6 md:p-8 max-w-5xl">
      {/* Header */}
      <div className="flex items-start justify-between mb-8 gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <Link href="/clientes" className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-100">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[#1D9E75]/10 flex items-center justify-center shrink-0">
              <span className="text-sm font-bold text-[#1D9E75]">{initials(client.name)}</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{client.name}</h1>
              <p className="text-sm text-gray-500">Cliente desde {fmtDate(client.created_at)}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/clientes/${id}/editar`}
            className="px-3 py-2 text-sm font-medium text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Editar
          </Link>
          <DeleteClientButton id={id} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column — contact info + stats */}
        <div className="space-y-4">
          {/* Contact */}
          <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-gray-900 mb-3">Contato</h2>
            <dl className="space-y-2.5">
              {client.email && (
                <div>
                  <dt className="text-xs text-gray-400 uppercase tracking-wider">Email</dt>
                  <dd className="text-sm text-gray-700 truncate">{client.email}</dd>
                </div>
              )}
              {client.phone && (
                <div>
                  <dt className="text-xs text-gray-400 uppercase tracking-wider">Telefone</dt>
                  <dd className="text-sm text-gray-700">{client.phone}</dd>
                </div>
              )}
              {!client.email && !client.phone && (
                <p className="text-sm text-gray-400">Sem contato cadastrado</p>
              )}
            </dl>
          </div>

          {/* Notes */}
          {client.notes && (
            <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
              <h2 className="text-sm font-semibold text-gray-900 mb-3">Notas</h2>
              <p className="text-sm text-gray-600 whitespace-pre-line">{client.notes}</p>
            </div>
          )}

          {/* Stats */}
          <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-gray-900 mb-3">Resumo</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Propostas</span>
                <span className="text-sm font-semibold text-gray-900">{proposals.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Aceitas</span>
                <span className="text-sm font-semibold text-green-600">{acceptedCount}</span>
              </div>
              <div className="pt-2 border-t border-gray-50">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Valor total</span>
                  <span className="text-base font-bold text-gray-900">{fmtBRL(totalValue)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right column — proposals history */}
        <div className="lg:col-span-2">
          <div className="bg-white border border-gray-100 rounded-xl shadow-sm">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
              <h2 className="font-semibold text-gray-900">Histórico de Propostas</h2>
              <Link
                href={`/propostas/nova?client_id=${id}`}
                className="text-sm text-[#1D9E75] font-medium hover:underline"
              >
                + Nova proposta
              </Link>
            </div>

            {proposals.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center px-6">
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <p className="text-sm font-medium text-gray-900 mb-1">Nenhuma proposta ainda</p>
                <p className="text-sm text-gray-500">Crie uma proposta para este cliente.</p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-50">
                {proposals
                  .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                  .map(p => {
                    const st = STATUS_LABELS[p.status] ?? { label: p.status, cls: 'bg-gray-100 text-gray-600' }
                    return (
                      <li key={p.id}>
                        <Link href={`/propostas/${p.id}`} className="flex items-center justify-between px-5 py-4 hover:bg-gray-50/50 transition-colors group">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 group-hover:text-[#1D9E75] transition-colors truncate">{p.title}</p>
                            <p className="text-xs text-gray-400 mt-0.5">{fmtDate(p.created_at)}</p>
                          </div>
                          <div className="flex items-center gap-3 ml-4 shrink-0">
                            {p.value != null && (
                              <span className="text-sm font-semibold text-gray-900">{fmtBRL(p.value)}</span>
                            )}
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${st.cls}`}>{st.label}</span>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-300 group-hover:text-[#1D9E75] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        </Link>
                      </li>
                    )
                  })}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
