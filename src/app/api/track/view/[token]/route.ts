import { NextResponse, type NextRequest } from 'next/server'
import { Resend } from 'resend'
import { createServiceClient } from '@/lib/supabase-service'
import { buildViewedNotificationHtml } from '@/lib/email-templates/notification'
import { APP_URL } from '@/lib/app-url'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params
  const service = createServiceClient()

  const { data: proposal } = await service
    .from('proposals')
    .select('id, status, user_id, title, code, proposal_number, recipient_name, recipient_email')
    .eq('token', token)
    .single()

  if (proposal) {
    const isFirstView = proposal.status === 'enviada'

    // Always update viewed_at — keeps proposals UPDATE firing on every visit,
    // which is the reliable trigger for the dashboard's Realtime subscription.
    const updatePayload: Record<string, unknown> = { viewed_at: new Date().toISOString() }
    if (isFirstView) updatePayload.status = 'visualizada'
    await service.from('proposals').update(updatePayload).eq('id', proposal.id)

    await service
      .from('proposal_events')
      .insert({ proposal_id: proposal.id, event_type: 'viewed', metadata: {} })

    try {
      const { data: profile } = await service
        .from('profiles')
        .select('notify_email_viewed')
        .eq('id', proposal.user_id)
        .single()

      const notifyEnabled = profile?.notify_email_viewed !== false

      if (notifyEnabled) {
        const { data: { user: freelancer } } = await service.auth.admin.getUserById(
          proposal.user_id as string
        )
        if (freelancer?.email) {
          const resend        = new Resend(process.env.RESEND_API_KEY)
          const clientName    = (proposal.recipient_name as string | null) || 'Seu cliente'
          const proposalCode  = (proposal.code ?? proposal.proposal_number) as string | null
          const codeSuffix    = proposalCode ? ` · ${proposalCode}` : ''
          await resend.emails.send({
            from:     'FreelanceFlow <contato@freelanceflow.com.br>',
            to:       freelancer.email,
            replyTo: (proposal.recipient_email as string | null) ?? undefined,
            subject:  `${clientName} visualizou sua proposta — ${proposal.title ?? 'Proposta'}${codeSuffix}`,
            html:     buildViewedNotificationHtml({
              clientName,
              proposalTitle: (proposal.title as string) ?? 'Proposta',
              proposalUrl:   `${APP_URL}/p/${token}?preview=1`,
              proposalCode,
            }),
          })
        }
      }
    } catch (err) {
      console.error('[view notification]', err)
    }
  }

  // ?_t=1 tells the public page that tracking already happened via this redirect
  return NextResponse.redirect(new URL(`/p/${token}?_t=1`, request.url), 302)
}
