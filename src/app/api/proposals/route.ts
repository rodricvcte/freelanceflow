import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { createServiceClient } from '@/lib/supabase-service'
import { canCreateProposal } from '@/lib/plan'
import { buildProposalCode } from '@/lib/proposal-number'
import { getViewAs } from '@/lib/view-as'

export const runtime = 'nodejs'

export async function GET() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const viewAs      = await getViewAs(user)
  const queryClient = viewAs ? createServiceClient() : supabase
  const userId      = viewAs?.id ?? user.id

  const { data, error } = await queryClient
    .from('proposals')
    .select('id, title, value, status, created_at, sent_at, version, proposal_number, code, token, clients(id, name)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(request: Request) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const planCheck = await canCreateProposal(user.id, supabase)
  if (!planCheck.allowed) {
    return NextResponse.json(
      {
        error: `Limite do plano Free atingido (${planCheck.used}/${planCheck.limit} propostas este mês). Faça upgrade para o plano Pro.`,
        code: 'PLAN_LIMIT_REACHED',
        used: planCheck.used,
        limit: planCheck.limit,
      },
      { status: 403 }
    )
  }

  const body = await request.json()
  const {
    title, service_description, value, payment_terms,
    deadline_days, valid_until, client_id, sections,
  } = body

  if (!title?.trim() || value === undefined || value === '') {
    return NextResponse.json({ error: 'Título e valor são obrigatórios' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('proposals')
    .insert({
      user_id:             user.id,
      title:               title.trim(),
      service_description: service_description?.trim() || null,
      value:               parseFloat(value),
      payment_terms:       payment_terms?.trim() || null,
      deadline_days:       deadline_days ? parseInt(deadline_days) : null,
      valid_until:         valid_until || null,
      client_id:           client_id || null,
      sections:            Array.isArray(sections) ? sections : [],
      status:              'rascunho',
      version:             1,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Fetch full profile for proposal_number + snapshot
  const { data: profile } = await supabase
    .from('profiles')
    .select('freelancer_code, full_name, business_name, accent_color, logo_url, phone, email_business, address, website, document_type, cpf_cnpj, instagram, linkedin, facebook, youtube, tiktok')
    .eq('id', user.id)
    .single()

  const updates: Record<string, unknown> = {}

  const serviceClient = createServiceClient()
  const proposalCode = await buildProposalCode(user.id, supabase, serviceClient, data.created_at)
  updates.code            = proposalCode
  updates.proposal_number = proposalCode  // keep proposal_number in sync for LIKE queries

  if (profile) {
    updates.snapshot_profile = {
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
    }
  }

  if (Object.keys(updates).length > 0) {
    await supabase.from('proposals').update(updates).eq('id', data.id)
    Object.assign(data, updates)
  }

  await supabase.from('proposal_events').insert({ proposal_id: data.id, event_type: 'created', metadata: {} })

  return NextResponse.json({ ...data, pdf_url: null }, { status: 201 })
}
