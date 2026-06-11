import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { generateAndSaveProposalPDF } from '@/lib/generate-pdf'
import { canCreateProposal } from '@/lib/plan'
import { buildProposalNumber } from '@/lib/proposal-number'

export async function GET() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabase
    .from('proposals')
    .select('id, title, value, status, created_at, sent_at, version, proposal_number, pdf_url, clients(id, name)')
    .eq('user_id', user.id)
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
  const { title, service_description, value, payment_terms, deadline_days, valid_until, client_id } = body

  if (!title?.trim() || !service_description?.trim() || value === undefined || value === '') {
    return NextResponse.json({ error: 'Título, descrição e valor são obrigatórios' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('proposals')
    .insert({
      user_id: user.id,
      title: title.trim(),
      service_description: service_description.trim(),
      value: parseFloat(value),
      payment_terms: payment_terms?.trim() || null,
      deadline_days: deadline_days ? parseInt(deadline_days) : null,
      valid_until: valid_until || null,
      client_id: client_id || null,
      status: 'sent',
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Generate proposal_number if profile has a freelancer_code
  const { data: profile } = await supabase
    .from('profiles')
    .select('freelancer_code')
    .eq('id', user.id)
    .single()

  if (profile?.freelancer_code) {
    const proposalNumber = buildProposalNumber(data.created_at, profile.freelancer_code, 1, data.id)
    await supabase
      .from('proposals')
      .update({ proposal_number: proposalNumber })
      .eq('id', data.id)
    data.proposal_number = proposalNumber
  }

  let pdfUrl: string | null = null
  try {
    pdfUrl = await generateAndSaveProposalPDF(data.id, supabase)
  } catch {
    // PDF generation failure is non-fatal
  }

  return NextResponse.json({ ...data, pdf_url: pdfUrl ?? data.pdf_url }, { status: 201 })
}
