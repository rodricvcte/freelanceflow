import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { createServiceClient } from '@/lib/supabase-service'
import { buildProposalEmailHtml } from '@/lib/email-templates/proposal'
import { APP_URL } from '@/lib/app-url'
import { generateAndSaveProposalPDF } from '@/lib/generate-pdf'

export const runtime = 'nodejs'
export const maxDuration = 30

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
    resend?: boolean
  }

  if (!body.recipient_email?.trim()) {
    return NextResponse.json({ error: 'recipient_email é obrigatório' }, { status: 400 })
  }

  // Fetch proposal + profile in parallel
  const [{ data: proposal }, { data: profile }] = await Promise.all([
    supabase
      .from('proposals')
      .select('id, title, token, status, value, valid_until, proposal_number, code, snapshot_profile')
      .eq('id', id)
      .eq('user_id', user.id)
      .single(),
    supabase
      .from('profiles')
      .select('full_name, business_name, logo_url, accent_color, email_business, phone, instagram, linkedin, facebook, youtube, tiktok')
      .eq('id', user.id)
      .single(),
  ])

  if (!proposal) return NextResponse.json({ error: 'Proposta não encontrada' }, { status: 404 })

  if (body.resend) {
    if (proposal.status !== 'enviada' && proposal.status !== 'visualizada') {
      return NextResponse.json({ error: 'Só é possível reenviar propostas enviadas ou visualizadas' }, { status: 400 })
    }
  } else {
    if (proposal.status !== 'rascunho') {
      return NextResponse.json({ error: 'Só é possível enviar propostas em rascunho' }, { status: 400 })
    }
  }

  const snap = proposal.snapshot_profile as Record<string, unknown> | null
  const freelancerName = (
    (snap?.business_name as string | undefined) ||
    (profile?.business_name as string | undefined) ||
    (snap?.full_name as string | undefined) ||
    (profile?.full_name as string | undefined) ||
    'Freelancer'
  )
  const logoUrl      = (snap?.logo_url    ?? profile?.logo_url    ?? null) as string | null
  const accentColor  = (snap?.accent_color ?? profile?.accent_color ?? '#1D9E75') as string
  const token        = proposal.token as string
  const clientName   = body.recipient_name?.trim() || 'Cliente'
  const proposalCode = (proposal.code ?? proposal.proposal_number ?? null) as string | null

  const html = buildProposalEmailHtml({
    clientName,
    freelancerName,
    freelancerLogoUrl: logoUrl,
    accentColor,
    proposalTitle:     (proposal.title as string) ?? 'Proposta Comercial',
    proposalNumber:    proposalCode,
    proposalValue:     (proposal.value as number | null) ?? null,
    proposalValidUntil:(proposal.valid_until as string | null) ?? null,
    customMessage:     body.custom_message?.trim() || null,
    freelancerEmail:   (profile?.email_business ?? null) as string | null,
    freelancerPhone:   (profile?.phone ?? null) as string | null,
    viewUrl:           `${APP_URL}/api/track/view/${token}`,
  })

  if (!process.env.RESEND_API_KEY) {
    console.error('[send] RESEND_API_KEY not set')
    return NextResponse.json({ error: 'Serviço de e-mail não configurado' }, { status: 503 })
  }

  const resend = new Resend(process.env.RESEND_API_KEY)
  const subject = `Proposta Comercial — ${proposal.title ?? 'Proposta'} — ${freelancerName}${proposalCode ? ` · ${proposalCode}` : ''}`

  const { error: sendError } = await resend.emails.send({
    from:    `${freelancerName} via FreelanceFlow <contato@freelanceflow.com.br>`,
    to:      body.recipient_email.trim(),
    replyTo: user.email ?? undefined,
    subject,
    html,
  })

  if (sendError) {
    console.error('[send] Resend error:', JSON.stringify(sendError))
    return NextResponse.json(
      { error: 'Falha ao enviar e-mail', detail: (sendError as { message?: string }).message ?? String(sendError) },
      { status: 502 }
    )
  }

  // Generate PDF and persist updates
  const service = createServiceClient()
  const proposalUpdate: Record<string, unknown> = {
    recipient_email: body.recipient_email.trim(),
    recipient_name:  body.recipient_name?.trim() ?? null,
  }

  if (!body.resend) {
    proposalUpdate.status  = 'enviada'
    proposalUpdate.sent_at = new Date().toISOString()

    // Generate PDF with current proposal data
    try {
      proposalUpdate.pdf_url = await generateAndSaveProposalPDF(id, user.id)
    } catch (e) {
      console.error('[send] Falha ao gerar PDF ao enviar proposta', id, e)
    }

    // Freeze profile snapshot at send time
    if (profile) {
      proposalUpdate.snapshot_profile = {
        full_name:      profile.full_name,
        business_name:  profile.business_name,
        accent_color:   profile.accent_color,
        logo_url:       profile.logo_url,
        phone:          profile.phone,
        email_business: profile.email_business,
        instagram:      profile.instagram,
        linkedin:       profile.linkedin,
        facebook:       profile.facebook,
        youtube:        profile.youtube,
        tiktok:         profile.tiktok,
      }
    }
  }

  await Promise.all([
    service.from('proposals').update(proposalUpdate).eq('id', id),
    service.from('proposal_events').insert({
      proposal_id: id,
      event_type:  body.resend ? 'resent' : 'sent',
      metadata:    { recipient_email: body.recipient_email.trim() },
    }),
  ])

  return NextResponse.json({ ok: true })
}
