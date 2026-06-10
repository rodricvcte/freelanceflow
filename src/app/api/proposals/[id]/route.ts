import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { buildProposalNumber } from '@/lib/proposal-number'
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
  const allowed = ['status', 'title', 'service_description', 'value', 'payment_terms', 'deadline_days', 'valid_until']
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

  // Fetch current proposal + profile in parallel
  const [{ data: current }, { data: profile }] = await Promise.all([
    supabase
      .from('proposals')
      .select('id, version, created_at')
      .eq('id', id)
      .eq('user_id', user.id)
      .single(),
    supabase
      .from('profiles')
      .select('freelancer_code')
      .eq('id', user.id)
      .single(),
  ])

  if (!current) return NextResponse.json({ error: 'Proposta não encontrada' }, { status: 404 })

  const body = await request.json()
  const { title, service_description, value, payment_terms, deadline_days, valid_until, client_id } = body

  if (!title?.trim() || !service_description?.trim() || value === undefined || value === '') {
    return NextResponse.json({ error: 'Título, descrição e valor são obrigatórios' }, { status: 400 })
  }

  const newVersion = (current.version ?? 1) + 1
  const proposalNumber = profile?.freelancer_code
    ? buildProposalNumber(current.created_at, profile.freelancer_code, newVersion)
    : null

  const { data, error } = await supabase
    .from('proposals')
    .update({
      title: title.trim(),
      service_description: service_description.trim(),
      value: parseFloat(value),
      payment_terms: payment_terms?.trim() || null,
      deadline_days: deadline_days ? parseInt(deadline_days) : null,
      valid_until: valid_until || null,
      client_id: client_id || null,
      version: newVersion,
      ...(proposalNumber ? { proposal_number: proposalNumber } : {}),
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Regenerate PDF non-fatally
  let pdfUrl: string | null = data.pdf_url
  try {
    pdfUrl = await generateAndSaveProposalPDF(id, supabase)
  } catch { /* non-fatal */ }

  return NextResponse.json({ ...data, pdf_url: pdfUrl })
}
