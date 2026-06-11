import { createServiceClient } from '@/lib/supabase-service'

export default async function ConfirmedPage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>
  searchParams: Promise<{ action?: string }>
}) {
  const { token } = await params
  const { action } = await searchParams
  const accepted = action === 'accepted'

  const service = createServiceClient()
  const { data: proposal } = await service
    .from('proposals')
    .select('user_id')
    .eq('token', token)
    .maybeSingle()

  let freelancerName = 'o freelancer'
  let logoUrl: string | null = null
  let accentColor = '#1D9E75'

  if (proposal) {
    const { data: profile } = await service
      .from('profiles')
      .select('full_name, business_name, logo_url, accent_color')
      .eq('id', proposal.user_id)
      .maybeSingle()
    freelancerName = profile?.business_name ?? profile?.full_name ?? 'o freelancer'
    logoUrl = profile?.logo_url ?? null
    accentColor = profile?.accent_color ?? '#1D9E75'
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm text-center">
        {/* Logo */}
        {logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={logoUrl} alt={freelancerName} className="w-16 h-16 rounded-full object-cover mx-auto mb-6" />
        ) : (
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 text-white text-2xl font-bold"
            style={{ backgroundColor: accentColor }}
          >
            {freelancerName.charAt(0).toUpperCase()}
          </div>
        )}

        {/* Status icon */}
        <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5 ${accepted ? 'bg-green-100' : 'bg-gray-100'}`}>
          {accepted ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          )}
        </div>

        <h1 className={`text-xl font-bold mb-2 ${accepted ? 'text-green-700' : 'text-gray-700'}`}>
          {accepted ? 'Proposta aprovada!' : 'Proposta recusada.'}
        </h1>
        <p className="text-sm text-gray-500 leading-relaxed">
          {accepted
            ? `Ótimo! ${freelancerName} foi notificado e entrará em contato em breve.`
            : `${freelancerName} foi notificado da sua decisão.`}
        </p>
      </div>
    </div>
  )
}
