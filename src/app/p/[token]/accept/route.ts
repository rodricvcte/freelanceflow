import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { createServiceClient } from '@/lib/supabase-service'
import { buildAcceptedNotificationHtml } from '@/lib/email-templates/notification'
import { APP_URL } from '@/lib/app-url'

async function sendAcceptedNotification(
  service: ReturnType<typeof createServiceClient>,
  proposal: { id: string; user_id: unknown; title: unknown; code: unknown; proposal_number: unknown; recipient_name: unknown; recipient_email: unknown },
  token: string
) {
  try {
    const { data: profile } = await service
      .from('profiles')
      .select('notify_email_responded')
      .eq('id', proposal.user_id as string)
      .single()

    if (profile?.notify_email_responded === false) return

    const { data: { user: freelancer } } = await service.auth.admin.getUserById(
      proposal.user_id as string
    )
    if (!freelancer?.email) return

    const resend       = new Resend(process.env.RESEND_API_KEY)
    const clientName   = (proposal.recipient_name as string | null) || 'Seu cliente'
    const proposalCode = (proposal.code ?? proposal.proposal_number) as string | null
    const codeSuffix   = proposalCode ? ` · ${proposalCode}` : ''
    await resend.emails.send({
      from:     'FreelanceFlow <contato@freelanceflow.com.br>',
      to:       freelancer.email,
      replyTo: (proposal.recipient_email as string | null) ?? undefined,
      subject:  `${clientName} aceitou sua proposta — ${proposal.title ?? 'Proposta'}${codeSuffix}`,
      html:     buildAcceptedNotificationHtml({
        clientName,
        proposalTitle: (proposal.title as string) ?? 'Proposta',
        proposalUrl:   `${APP_URL}/p/${token}?preview=1`,
        proposalCode,
      }),
    })
  } catch (err) {
    console.error('[accept notification]', err)
  }
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params
  const service = createServiceClient()

  const { data: proposal } = await service
    .from('proposals')
    .select('id, status, user_id, title, code, proposal_number, recipient_name, recipient_email')
    .eq('token', token)
    .single()

  if (!proposal) {
    return NextResponse.redirect(new URL(`/p/${token}`, APP_URL))
  }

  if (['expirada', 'cancelada'].includes(proposal.status)) {
    return NextResponse.redirect(new URL(`/p/${token}`, APP_URL))
  }

  if (!['aceita', 'recusada'].includes(proposal.status)) {
    await service
      .from('proposals')
      .update({ status: 'aceita', responded_at: new Date().toISOString() })
      .eq('id', proposal.id)

    await service
      .from('proposal_events')
      .insert({ proposal_id: proposal.id, event_type: 'accepted', metadata: { via: 'email' } })

    await sendAcceptedNotification(service, proposal, token)
  }

  return NextResponse.redirect(
    new URL(`/p/${token}/confirmed?action=accepted`, APP_URL)
  )
}

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params
  const service = createServiceClient()

  const { data: proposal } = await service
    .from('proposals')
    .select('id, status, user_id, title, code, proposal_number, recipient_name, recipient_email')
    .eq('token', token)
    .single()

  if (!proposal) return NextResponse.json({ error: 'Proposta não encontrada' }, { status: 404 })

  if (['aceita', 'recusada', 'expirada', 'cancelada'].includes(proposal.status)) {
    return NextResponse.json({ error: 'Proposta não disponível para resposta' }, { status: 409 })
  }

  await service
    .from('proposals')
    .update({ status: 'aceita', responded_at: new Date().toISOString() })
    .eq('id', proposal.id)

  await service
    .from('proposal_events')
    .insert({ proposal_id: proposal.id, event_type: 'accepted', metadata: {} })

  await sendAcceptedNotification(service, proposal, token)

  return NextResponse.json({ ok: true })
}
