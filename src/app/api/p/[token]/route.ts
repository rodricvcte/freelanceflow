import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase-service'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params
  const service = createServiceClient()

  const { data: proposal } = await service
    .from('proposals')
    .select('id, title, proposal_number, service_description, sections, value, payment_terms, deadline_days, valid_until, status, token, created_at, pdf_url, user_id, clients(name, email)')
    .eq('token', token)
    .single()

  if (!proposal) return NextResponse.json({ error: 'Proposta não encontrada' }, { status: 404 })

  const { data: profile } = await service
    .from('profiles')
    .select('full_name, business_name, logo_url, accent_color, email_business, phone, instagram, linkedin, facebook, youtube, tiktok')
    .eq('id', proposal.user_id)
    .single()

  return NextResponse.json({
    proposal: {
      id: proposal.id,
      title: proposal.title,
      proposal_number: proposal.proposal_number ?? null,
      service_description: proposal.service_description,
      sections: proposal.sections ?? [],
      value: proposal.value,
      payment_terms: proposal.payment_terms,
      deadline_days: proposal.deadline_days,
      valid_until: proposal.valid_until,
      status: proposal.status,
      token: proposal.token,
      created_at: proposal.created_at,
      pdf_url: (proposal.pdf_url as string | null) ?? null,
      clients: Array.isArray(proposal.clients)
        ? (proposal.clients[0] ?? null)
        : proposal.clients,
    },
    profile: profile ?? {
      full_name: null, business_name: null, logo_url: null, accent_color: null,
      email_business: null, phone: null,
      instagram: null, linkedin: null, facebook: null, youtube: null, tiktok: null,
    },
  })
}
