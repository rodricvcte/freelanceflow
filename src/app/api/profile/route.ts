import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export async function GET() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabase
    .from('profiles')
    .select('full_name, business_name, phone, logo_url, accent_color, freelancer_code, address, document_type, cpf_cnpj, email_business, website')
    .eq('id', user.id)
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
  const allowed = ['full_name', 'business_name', 'phone', 'accent_color', 'logo_url'] as const
  type Field = typeof allowed[number]
  const updates: Partial<Record<Field, string | null>> = {}

  for (const key of allowed) {
    if (key in body) {
      updates[key] = typeof body[key] === 'string' ? body[key].trim() || null : null
    }
  }

  const { data, error } = await supabase
    .from('profiles')
    .upsert({ id: user.id, ...updates }, { onConflict: 'id' })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
