import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { bumpProposalVersion } from '@/lib/proposal-number'
import { generateAndSaveProposalPDF } from '@/lib/generate-pdf'

export const runtime = 'nodejs'

export async function POST(
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
      .select('title, service_description, value, payment_terms, deadline_days, valid_until, client_id, sections, version, proposal_number, snapshot_profile, status, parent_proposal_id')
      .eq('id', id)
      .eq('user_id', user.id)
      .single(),
    supabase
      .from('profiles')
      .select('full_name, business_name, accent_color, logo_url, phone, email_business, address, website, document_type, cpf_cnpj, instagram, linkedin, facebook, youtube, tiktok')
      .eq('id', user.id)
      .single(),
  ])

  if (!current) return NextResponse.json({ error: 'Proposta não encontrada' }, { status: 404 })
  if (current.status === 'rascunho' || current.status === 'cancelada') {
    return NextResponse.json({ error: 'Não é possível criar nova versão neste status' }, { status: 400 })
  }

  // Body is optional — when provided (user saved from editor), use those values
  let body: Record<string, unknown> = {}
  try { body = await request.json() } catch { /* no body */ }

  const newVersion = (current.version ?? 1) + 1
  const newNumber  = bumpProposalVersion(current.proposal_number as string | null)
  // All versions in a chain share the same root (v1) as parent_proposal_id
  const parentId = (current as Record<string, unknown>).parent_proposal_id as string | null ?? id

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
  } : current.snapshot_profile ?? undefined

  const sections = Array.isArray(body.sections) ? body.sections
    : Array.isArray(current.sections) ? current.sections
    : []

  const { data: draft, error } = await supabase
    .from('proposals')
    .insert({
      user_id:             user.id,
      title:               current.title, // always locked to source title
      service_description: body.service_description !== undefined ? (body.service_description as string | null) : current.service_description,
      value:               body.value !== undefined ? parseFloat(String(body.value)) : current.value,
      payment_terms:       body.payment_terms !== undefined ? (body.payment_terms as string | null) : current.payment_terms,
      deadline_days:       body.deadline_days !== undefined ? (body.deadline_days ? parseInt(String(body.deadline_days)) : null) : current.deadline_days,
      valid_until:         body.valid_until !== undefined ? (body.valid_until as string | null) : current.valid_until,
      client_id:           body.client_id !== undefined ? (body.client_id as string | null) : current.client_id,
      sections,
      status:              'rascunho',
      version:             newVersion,
      parent_proposal_id:  parentId,
      ...(newNumber        ? { proposal_number: newNumber } : {}),
      ...(snapshotProfile  ? { snapshot_profile: snapshotProfile } : {}),
    })
    .select('id')
    .single()

  if (error || !draft) return NextResponse.json({ error: error?.message ?? 'Erro ao criar versão' }, { status: 500 })

  await supabase.from('proposal_events').insert({ proposal_id: draft.id, event_type: 'created', metadata: { version: newVersion } })

  try {
    await generateAndSaveProposalPDF(draft.id, supabase)
  } catch (e) {
    console.error('[PDF] Falha ao gerar PDF da nova versão', draft.id, e)
  }

  return NextResponse.json({ id: draft.id }, { status: 201 })
}
