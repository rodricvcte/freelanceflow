import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { createServiceClient } from '@/lib/supabase-service'
import { generateAndSaveProposalPDF } from '@/lib/generate-pdf'
import { buildProposalEmailHtml } from '@/lib/email-templates/proposal'

export const runtime = 'nodejs'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json() as {
    recipient_email: string
    recipient_name?: string
    custom_message?: string
  }

  if (!body.recipient_email?.trim()) {
    return NextResponse.json({ error: 'recipient_email é obrigatório' }, { status: 400 })
  }

  // Fetch proposal + profile
  const { data: proposal } = await supabase
    .from('proposals')
    .select('id, title, token, status, pdf_url, value, valid_until, proposal_number, snapshot_profile')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!proposal) return NextResponse.json({ error: 'Proposta não encontrada' }, { status: 404 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, business_name, logo_url, accent_color, email_business, phone')
    .eq('id', user.id)
    .single()

  // Generate PDF if missing (saved to storage for public page download)
  if (!proposal.pdf_url) {
    await generateAndSaveProposalPDF(id, supabase)
  }

  const snap = proposal.snapshot_profile as Record<string, unknown> | null
  const freelancerName = (
    (snap?.business_name as string | null | undefined) ||
    (profile?.business_name as string | null | undefined) ||
    (snap?.full_name as string | null | undefined) ||
    (profile?.full_name as string | null | undefined) ||
    'Freelancer'
  )
  const logoUrl = (snap?.logo_url ?? profile?.logo_url ?? null) as string | null
  const accentColor = (snap?.accent_color ?? profile?.accent_color ?? '#1D9E75') as string
  const token = proposal.token as string
  const clientName = body.recipient_name?.trim() || 'Cliente'

  const html = buildProposalEmailHtml({
    clientName,
    freelancerName,
    freelancerLogoUrl: logoUrl,
    accentColor,
    proposalTitle: (proposal.title as string) ?? 'Proposta Comercial',
    proposalNumber: (proposal.proposal_number as string | null) ?? null,
    proposalValue: (proposal.value as number | null) ?? null,
    proposalValidUntil: (proposal.valid_until as string | null) ?? null,
    customMessage: body.custom_message?.trim() || null,
    freelancerEmail: (profile?.email_business ?? null) as string | null,
    freelancerPhone: (profile?.phone ?? null) as string | null,
    viewUrl: `${APP_URL}/api/track/view/${token}`,
  })

  const resend = new Resend(process.env.RESEND_API_KEY)
  const proposalCode = (proposal.proposal_number as string | null) ?? null
  const subject = `Proposta Comercial — ${proposal.title ?? 'Proposta'} — ${freelancerName}${proposalCode ? ` · ${proposalCode}` : ''}`

  const { error: sendError } = await resend.emails.send({
    from: `${freelancerName} via FreelanceFlow <onboarding@resend.dev>`,
    to: body.recipient_email.trim(),
    subject,
    html,
  })

  if (sendError) {
    console.error('[send] Resend error:', sendError)
    return NextResponse.json({ error: 'Falha ao enviar e-mail' }, { status: 502 })
  }

  // Persist recipient info + mark as enviada
  const service = createServiceClient()
  await service
    .from('proposals')
    .update({
      status: 'enviada',
      sent_at: new Date().toISOString(),
      recipient_email: body.recipient_email.trim(),
      recipient_name: body.recipient_name?.trim() ?? null,
    })
    .eq('id', id)

  await service
    .from('proposal_events')
    .insert({
      proposal_id: id,
      event_type: 'sent',
      metadata: { recipient_email: body.recipient_email.trim() },
    })

  return NextResponse.json({ ok: true })
}
