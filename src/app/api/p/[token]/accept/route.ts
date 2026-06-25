import { createHash } from 'crypto'
import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { createServiceClient } from '@/lib/supabase-service'
import { buildAcceptedNotificationHtml } from '@/lib/email-templates/notification'
import { APP_URL } from '@/lib/app-url'
import { generateAndSaveCertificate } from '@/lib/generate-certificate'

export const runtime   = 'nodejs'
export const maxDuration = 30

type ProposalRow = {
  id: string
  status: string
  user_id: string
  title: string
  value: number | null
  deadline_days: number | null
  code: string | null
  proposal_number: string | null
  sections: unknown
  service_description: string | null
  recipient_name: string | null
  recipient_email: string | null
  snapshot_profile: unknown
}

async function sendAcceptedNotification(
  service: ReturnType<typeof createServiceClient>,
  proposal: ProposalRow,
  certificateUrl: string | null
) {
  try {
    const { data: { user: freelancer } } = await service.auth.admin.getUserById(proposal.user_id)
    if (!freelancer?.email) return

    const resend     = new Resend(process.env.RESEND_API_KEY)
    const clientName = proposal.recipient_name || 'Seu cliente'
    await resend.emails.send({
      from:    'FreelanceFlow <contato@freelanceflow.com.br>',
      to:      freelancer.email,
      replyTo: proposal.recipient_email ?? undefined,
      subject: `${clientName} aceitou sua proposta — ${proposal.title ?? 'Proposta'}`,
      html:    buildAcceptedNotificationHtml({
        clientName,
        proposalTitle:  proposal.title ?? 'Proposta',
        proposalUrl:    `${APP_URL}/propostas/${proposal.id}`,
        certificateUrl: certificateUrl ?? undefined,
      }),
    })
  } catch (err) {
    console.error('[accept notification]', err)
  }
}

// GET — email link click (legacy, keeps working but no certificate for GET flow)
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params
  const service = createServiceClient()

  const { data: proposal } = await service
    .from('proposals')
    .select('id, status, user_id, title, value, deadline_days, code, proposal_number, sections, service_description, recipient_name, recipient_email, snapshot_profile')
    .eq('token', token)
    .single()

  if (!proposal) return NextResponse.redirect(new URL(`/p/${token}`, APP_URL))
  if (['expirada', 'cancelada'].includes(proposal.status)) {
    return NextResponse.redirect(new URL(`/p/${token}`, APP_URL))
  }

  if (!['aceita', 'recusada'].includes(proposal.status)) {
    const now = new Date().toISOString()

    await service
      .from('proposals')
      .update({ status: 'aceita', responded_at: now })
      .eq('id', proposal.id)

    await service
      .from('proposal_events')
      .insert({ proposal_id: proposal.id, event_type: 'accepted', metadata: { via: 'email' } })

    await sendAcceptedNotification(service, proposal as ProposalRow, null)
  }

  return NextResponse.redirect(new URL(`/p/${token}/confirmed?action=accepted`, APP_URL))
}

// POST — called by the public page accept button (includes client_name)
export async function POST(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params
  const service = createServiceClient()

  let body: { client_name?: string } = {}
  try { body = await request.json() } catch { /* no body */ }

  const { data: proposal } = await service
    .from('proposals')
    .select('id, status, user_id, title, value, deadline_days, code, proposal_number, sections, service_description, recipient_name, recipient_email, snapshot_profile')
    .eq('token', token)
    .single()

  if (!proposal) return NextResponse.json({ error: 'Proposta não encontrada' }, { status: 404 })

  if (['aceita', 'recusada', 'expirada', 'cancelada'].includes(proposal.status)) {
    return NextResponse.json({ error: 'Proposta não disponível para resposta' }, { status: 409 })
  }

  const now       = new Date().toISOString()
  const clientName = (body.client_name ?? '').trim() || (proposal.recipient_name ?? 'Cliente')

  // Content hash — fingerprint of what the client accepted
  const contentPayload = JSON.stringify(
    (proposal.sections as unknown[])?.length
      ? proposal.sections
      : proposal.service_description
  )
  const contentHash = createHash('sha256').update(contentPayload).digest('hex')

  const ip        = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? ''
  const userAgent = request.headers.get('user-agent') ?? ''

  const eventMetadata = {
    client_name:  clientName,
    ip,
    user_agent:   userAgent,
    timestamp:    now,
    content_hash: contentHash,
  }

  await service.from('proposals')
    .update({ status: 'aceita', responded_at: now })
    .eq('id', proposal.id)

  await service.from('proposal_events')
    .insert({ proposal_id: proposal.id, event_type: 'accepted', metadata: eventMetadata })

  // Generate certificate
  const snap        = (proposal.snapshot_profile as Record<string, unknown> | null)
  const freelancerName = (snap?.business_name ?? snap?.full_name ?? '') as string ||
    (await (async () => {
      const { data: p } = await service.from('profiles').select('full_name, business_name').eq('id', proposal.user_id).single()
      return p?.business_name ?? p?.full_name ?? 'Freelancer'
    })())

  let certificateUrl: string | null = null
  try {
    certificateUrl = await generateAndSaveCertificate(proposal.id, {
      proposalTitle:  proposal.title ?? 'Proposta',
      proposalCode:   (proposal.code ?? proposal.proposal_number) as string | null,
      proposalValue:  proposal.value as number | null,
      deadlineDays:   proposal.deadline_days as number | null,
      freelancerName,
      clientName,
      ip,
      userAgent,
      timestamp:    now,
      contentHash,
    })
  } catch (e) {
    console.error('[accept] Falha ao gerar certificado', proposal.id, e)
  }

  await sendAcceptedNotification(service, proposal as ProposalRow, certificateUrl)

  return NextResponse.json({ ok: true, certificate_url: certificateUrl })
}
