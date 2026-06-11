import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { createServiceClient } from '@/lib/supabase-service'

export async function POST(request: Request) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const {
    full_name, business_name, email_business, phone,
    address, document_type, cpf_cnpj, website, accent_color, logo_url,
  } = body

  if (!full_name?.trim()) {
    return NextResponse.json({ error: 'Nome completo é obrigatório' }, { status: 400 })
  }

  // Generate unique freelancer_code via DB function
  const { data: code, error: codeErr } = await supabase.rpc('generate_freelancer_code', {
    p_full_name: full_name.trim(),
  })

  if (codeErr || !code) {
    return NextResponse.json(
      { error: codeErr?.message ?? 'Erro ao gerar código de freelancer' },
      { status: 500 }
    )
  }

  const serviceClient = createServiceClient()
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
        accent_color: accent_color || '#1D9E75',
        logo_url: logo_url || null,
        freelancer_code: code,
      },
      { onConflict: 'id' }
    )
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ profile: data, freelancer_code: code })
}
