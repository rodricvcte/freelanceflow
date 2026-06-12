import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { bumpProposalVersion, buildNewProposalNumber } from '@/lib/proposal-number'
import { generateAndSaveProposalPDF } from '@/lib/generate-pdf'

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
      .select('id, version, created_at, proposal_number, status')
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

  const newVersion = (current.version ?? 1) + 1
  // Bump version on existing number, or generate a fresh one if none exists yet
  const proposalNumber = current.proposal_number
    ? bumpProposalVersion(current.proposal_number)
    : profile?.freelancer_code
      ? await buildNewProposalNumber(user.id, profile.freelancer_code, current.created_at, supabase)
      : null

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
      version:             newVersion,
      ...(proposalNumber  ? { proposal_number: proposalNumber } : {}),
      ...(snapshotProfile ? { snapshot_profile: snapshotProfile } : {}),
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  let pdfUrl: string | null = data.pdf_url
  try {
    pdfUrl = await generateAndSaveProposalPDF(id, supabase)
  } catch (e) {
    console.error('[PDF] Falha ao regenerar PDF da proposta', id, e)
  }

  return NextResponse.json({ ...data, pdf_url: pdfUrl })
}
