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
    .select('full_name, business_name, phone, logo_url, accent_color, freelancer_code, address, document_type, cpf_cnpj, email_business, website, instagram, linkedin, facebook, youtube, tiktok, signature_data, followup_enabled, followup_days, followup_expiry_enabled, notify_email_viewed, notify_email_responded, notify_email_followup')
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
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    let body: Record<string, unknown>
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'Payload inválido ou muito grande.' }, { status: 413 })
    }

    // Prevent storing oversized signature data (canvas output is ~100-200KB; cap at 1MB)
    if (typeof body.signature_data === 'string' && body.signature_data.length > 1_000_000) {
      return NextResponse.json(
        { error: 'Imagem de assinatura muito grande. Tente gerar novamente.' },
        { status: 413 }
      )
    }

    const allowed = [
      'full_name', 'business_name', 'phone', 'accent_color', 'logo_url',
      'email_business', 'address', 'website',
      'instagram', 'linkedin', 'facebook', 'youtube', 'tiktok',
      'signature_data',
    ] as const
    type Field = typeof allowed[number]
    const updates: Partial<Record<Field | 'document_type' | 'cpf_cnpj' | 'followup_enabled' | 'followup_days' | 'followup_expiry_enabled' | 'notify_email_viewed' | 'notify_email_responded' | 'notify_email_followup', unknown>> = {}

    for (const key of allowed) {
      if (key in body) {
        updates[key] = typeof body[key] === 'string' ? body[key].trim() || null : null
      }
    }

    if ('followup_enabled' in body) updates.followup_enabled = Boolean(body.followup_enabled)
    if ('followup_days' in body) {
      const days = parseInt(body.followup_days as string, 10)
      updates.followup_days = isNaN(days) || days < 1 ? 1 : days > 30 ? 30 : days
    }
    if ('followup_expiry_enabled' in body)   updates.followup_expiry_enabled   = Boolean(body.followup_expiry_enabled)
    if ('notify_email_viewed' in body)       updates.notify_email_viewed       = Boolean(body.notify_email_viewed)
    if ('notify_email_responded' in body)    updates.notify_email_responded    = Boolean(body.notify_email_responded)
    if ('notify_email_followup' in body)     updates.notify_email_followup     = Boolean(body.notify_email_followup)

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
  } catch (err) {
    console.error('[PATCH /api/profile]', err)
    return NextResponse.json({ error: 'Erro interno ao salvar perfil.' }, { status: 500 })
  }
}
