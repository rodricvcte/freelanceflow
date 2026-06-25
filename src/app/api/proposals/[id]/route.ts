import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { createServiceClient } from '@/lib/supabase-service'
import { buildProposalCode } from '@/lib/proposal-number'

export const runtime = 'nodejs'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabase
    .from('proposals')
    .select('*, clients(id, name, email, phone)')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (error || !data) return NextResponse.json({ error: 'Proposta não encontrada' }, { status: 404 })
  return NextResponse.json(data)
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()

  // Only 'cancelada' is a valid status transition via PATCH — never allow reverting to 'rascunho'
  const PATCH_ALLOWED_STATUSES = ['cancelada']
  if (body.status !== undefined && !PATCH_ALLOWED_STATUSES.includes(body.status)) {
    return NextResponse.json({ error: 'Transição de status não permitida' }, { status: 400 })
  }

  const allowed = [
    'status', 'title', 'service_description', 'value', 'payment_terms',
    'deadline_days', 'valid_until', 'sections', 'installments',
  ]
  const patch = Object.fromEntries(Object.entries(body).filter(([k]) => allowed.includes(k)))

  const { data, error } = await supabase
    .from('proposals')
    .update(patch)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  if (body.status === 'cancelada') {
    await supabase.from('proposal_events').insert({ proposal_id: id, event_type: 'cancelled', metadata: {} })
  }

  return NextResponse.json(data)
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const [{ data: current }, { data: profile }] = await Promise.all([
    supabase
      .from('proposals')
      .select('id, version, created_at, proposal_number, code, status')
      .eq('id', id)
      .eq('user_id', user.id)
      .single(),
    supabase
      .from('profiles')
      .select('freelancer_code, full_name, business_name, accent_color, logo_url, phone, email_business, address, website, document_type, cpf_cnpj, instagram, linkedin, facebook, youtube, tiktok')
      .eq('id', user.id)
      .single(),
  ])

  if (!current) return NextResponse.json({ error: 'Proposta não encontrada' }, { status: 404 })

  if (current.status !== 'rascunho') {
    return NextResponse.json({ error: 'Proposta já enviada não pode ser editada' }, { status: 403 })
  }

  const body = await request.json()
  const {
    title, service_description, value, payment_terms,
    deadline_days, valid_until, client_id, sections,
  } = body

  if (!title?.trim() || value === undefined || value === '') {
    return NextResponse.json({ error: 'Título e valor são obrigatórios' }, { status: 400 })
  }

  // Draft saves never increment version. Keep existing code; generate only if missing.
  const currentCode = (current as Record<string, unknown>).code as string | null
  const proposalCode = currentCode
    ?? await buildProposalCode(user.id, supabase, createServiceClient(), current.created_at)

  const snapshotProfile = profile ? {
    full_name:      profile.full_name,
    business_name:  profile.business_name,
    accent_color:   profile.accent_color,
    logo_url:       profile.logo_url,
    phone:          profile.phone,
    email_business: profile.email_business,
    address:        profile.address,
    website:        profile.website,
    document_type:  profile.document_type,
    cpf_cnpj:       profile.cpf_cnpj,
    instagram:      profile.instagram,
    linkedin:       profile.linkedin,
    facebook:       profile.facebook,
    youtube:        profile.youtube,
    tiktok:         profile.tiktok,
  } : undefined

  const { data, error } = await supabase
    .from('proposals')
    .update({
      title:               title.trim(),
      service_description: service_description?.trim() || null,
      value:               parseFloat(value),
      payment_terms:       payment_terms?.trim() || null,
      deadline_days:       deadline_days ? parseInt(deadline_days) : null,
      valid_until:         valid_until || null,
      client_id:           client_id || null,
      sections:            Array.isArray(sections) ? sections : [],
      code:            proposalCode,
      proposal_number: proposalCode,   // keep in sync for LIKE-based version queries
      ...(snapshotProfile ? { snapshot_profile: snapshotProfile } : {}),
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json(data)
}
