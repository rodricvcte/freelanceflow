import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { createServiceClient } from '@/lib/supabase-service'
import { getViewAs } from '@/lib/view-as'

export async function GET() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const viewAs      = await getViewAs(user)
  const queryClient = viewAs ? createServiceClient() : supabase
  const userId      = viewAs?.id ?? user.id

  const { data, error } = await queryClient
    .from('profiles')
    .select('full_name, business_name, phone, logo_url, accent_color, freelancer_code, address, document_type, cpf_cnpj, email_business, website, instagram, linkedin, facebook, youtube, tiktok, signature_data')
    .eq('id', userId)
    .maybeSingle()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Row is auto-created by trigger; if missing for any reason, return defaults
  return NextResponse.json(data ?? {
    full_name: null,
    business_name: null,
    phone: null,
    logo_url: null,
    accent_color: '#1D9E75',
  })
}

export async function PATCH(request: Request) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const allowed = [
    'full_name', 'business_name', 'phone', 'accent_color', 'logo_url',
    'email_business', 'address', 'website',
    'instagram', 'linkedin', 'facebook', 'youtube', 'tiktok',
    'signature_data',
  ] as const
  type Field = typeof allowed[number]
  const updates: Partial<Record<Field | 'document_type' | 'cpf_cnpj', string | null>> = {}

  for (const key of allowed) {
    if (key in body) {
      updates[key] = typeof body[key] === 'string' ? body[key].trim() || null : null
    }
  }

  if ('document_type' in body) {
    updates.document_type = body.document_type === 'cpf' || body.document_type === 'cnpj'
      ? body.document_type
      : null
  }

  if ('cpf_cnpj' in body) {
    const raw = typeof body.cpf_cnpj === 'string' ? body.cpf_cnpj.replace(/\D/g, '') : ''
    updates.cpf_cnpj = raw || null
  }

  const { data, error } = await supabase
    .from('profiles')
    .upsert({ id: user.id, ...updates }, { onConflict: 'id' })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
