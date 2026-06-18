import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { createServiceClient } from '@/lib/supabase-service'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json() as { recipient_name?: string; resend?: boolean }

  const { data: proposal } = await supabase
    .from('proposals')
    .select('id, status, sent_at')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

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

  const now = new Date().toISOString()
  const service = createServiceClient()

  const proposalUpdate: Record<string, unknown> = {
    recipient_name: body.recipient_name?.trim() ?? null,
  }
  if (!body.resend) {
    proposalUpdate.status  = 'enviada'
    proposalUpdate.sent_at = proposal.sent_at ?? now
  }

  const [updateResult, eventResult] = await Promise.all([
    service
      .from('proposals')
      .update(proposalUpdate)
      .eq('id', id)
      .select('status, sent_at')
      .single(),
    service
      .from('proposal_events')
      .insert({
        proposal_id: id,
        event_type:  body.resend ? 'resent' : 'sent',
        metadata:    { channel: 'whatsapp' },
      }),
  ])

  if (updateResult.error) {
    return NextResponse.json({ error: updateResult.error.message }, { status: 500 })
  }
  if (eventResult.error) {
    console.error('[send-whatsapp] event insert error:', eventResult.error.message)
  }

  return NextResponse.json({ ok: true, proposal: updateResult.data })
}
