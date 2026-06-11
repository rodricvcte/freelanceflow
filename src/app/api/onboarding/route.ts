import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { createServiceClient } from '@/lib/supabase-service'

async function generateFreelancerCode(fullName: string, serviceClient: ReturnType<typeof createServiceClient>): Promise<string> {
  const parts = fullName.trim().split(/\s+/)
  const first = parts[0][0].toUpperCase()
  const last = parts.length >= 2
    ? parts[parts.length - 1][0].toUpperCase()
    : (parts[0][1]?.toUpperCase() ?? first)
  const prefix = first + last

  const { count } = await serviceClient
    .from('profiles')
    .select('id', { count: 'exact', head: true })
    .like('freelancer_code', `${prefix}%`)

  let counter = (count ?? 0) + 1
  let code = `${prefix}${String(counter).padStart(3, '0')}`

  for (let i = 0; i < 100; i++) {
    const { data } = await serviceClient
      .from('profiles')
      .select('id')
      .eq('freelancer_code', code)
      .maybeSingle()
    if (!data) break
    counter++
    code = `${prefix}${String(counter).padStart(3, '0')}`
  }

  return code
}

export async function POST(request: Request) {
  const supabase = await createServerSupabaseClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    request.headers.get('x-real-ip') ??
    'unknown'

  const body = await request.json()
  const {
    full_name, business_name, email_business, phone,
    address, document_type, cpf_cnpj, website, accent_color, logo_url,
  } = body

  if (!full_name?.trim()) {
    return NextResponse.json({ error: 'Nome completo é obrigatório' }, { status: 400 })
  }

  const serviceClient = createServiceClient()

  let code: string
  try {
    code = await generateFreelancerCode(full_name.trim(), serviceClient)
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Erro ao gerar código'
    return NextResponse.json({ error: `Erro ao gerar código de freelancer: ${msg}` }, { status: 500 })
  }

  const { data, error } = await serviceClient
    .from('profiles')
    .upsert(
      {
        id: user.id,
        full_name: full_name.trim(),
        business_name: business_name?.trim() || null,
        email_business: email_business?.trim() || null,
        phone: phone?.trim() || null,
        address: address?.trim() || null,
        document_type: document_type || null,
        cpf_cnpj: cpf_cnpj?.replace(/\D/g, '') || null,
        website: website?.trim() || null,
        accent_color:       accent_color || '#1D9E75',
        logo_url:           logo_url || null,
        freelancer_code:    code,
        terms_accepted_at:  new Date().toISOString(),
        terms_accepted_ip:  ip,
      },
      { onConflict: 'id' }
    )
    .select()
    .single()

  if (error) return NextResponse.json({ error: `Erro ao salvar perfil: ${error.message}` }, { status: 500 })
  return NextResponse.json({ profile: data, freelancer_code: code })
}
