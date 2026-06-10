import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase-server'

const summaryCards = [
  { label: 'Abertas', value: 0, color: 'text-blue-600', bg: 'bg-blue-50' },
  { label: 'Aceitas', value: 0, color: 'text-[#1D9E75]', bg: 'bg-[#1D9E75]/10' },
  { label: 'Recusadas', value: 0, color: 'text-red-600', bg: 'bg-red-50' },
  { label: 'Expiradas', value: 0, color: 'text-gray-500', bg: 'bg-gray-100' },
]

export default async function DashboardPage() {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user.id)
    .single()

  const firstName = profile?.full_name?.split(' ')[0] ?? 'Freelancer'

  return (
    <div className="p-6 md:p-8 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Olá, {firstName}! 👋
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Aqui está o resumo das suas propostas
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {summaryCards.map((card) => (
          <div
            key={card.label}
            className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm"
          >
            <p className="text-sm font-medium text-gray-500 mb-2">{card.label}</p>
            <div className="flex items-end gap-2">
              <span className={`text-3xl font-bold ${card.color}`}>
                {card.value}
              </span>
              <span
                className={`mb-0.5 text-xs font-medium px-2 py-0.5 rounded-full ${card.bg} ${card.color}`}
              >
                propostas
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Atenção necessária */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
          <div className="p-5 border-b border-gray-50">
            <h2 className="text-sm font-semibold text-gray-900">
              Atenção necessária
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Propostas que precisam de acompanhamento
            </p>
          </div>
          <div className="p-5 flex flex-col items-center justify-center py-10 text-center">
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
            <p className="text-sm text-gray-500">Nenhum item no momento</p>
          </div>
        </div>

        {/* Propostas Recentes */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
          <div className="p-5 border-b border-gray-50">
            <h2 className="text-sm font-semibold text-gray-900">
              Propostas Recentes
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Suas últimas propostas enviadas
            </p>
          </div>
          <div className="p-5 flex flex-col items-center justify-center py-10 text-center">
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-sm text-gray-500">Nenhuma proposta ainda</p>
            <a
              href="/propostas"
              className="mt-3 text-xs font-medium text-[#1D9E75] hover:underline"
            >
              Criar primeira proposta →
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
