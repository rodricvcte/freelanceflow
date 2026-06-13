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
    .select('id, status')
    .eq('token', token)
    .single()

  if (!proposal) {
    return NextResponse.redirect(new URL(`/p/${token}`, process.env.NEXT_PUBLIC_APP_URL!))
  }

  if (['expirada', 'cancelada'].includes(proposal.status)) {
    return NextResponse.redirect(new URL(`/p/${token}`, process.env.NEXT_PUBLIC_APP_URL!))
  }

  if (!['aceita', 'recusada'].includes(proposal.status)) {
    await service
      .from('proposals')
      .update({ status: 'recusada', responded_at: new Date().toISOString() })
      .eq('id', proposal.id)

    await service
      .from('proposal_events')
      .insert({ proposal_id: proposal.id, event_type: 'declined', metadata: { via: 'email' } })
  }

  return NextResponse.redirect(
    new URL(`/p/${token}/confirmed?action=declined`, process.env.NEXT_PUBLIC_APP_URL!)
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
    .select('id, status')
    .eq('token', token)
    .single()

  if (!proposal) return NextResponse.json({ error: 'Proposta não encontrada' }, { status: 404 })

  if (['aceita', 'recusada', 'expirada', 'cancelada'].includes(proposal.status)) {
    return NextResponse.json({ error: 'Proposta não disponível para resposta' }, { status: 409 })
  }

  await service
    .from('proposals')
    .update({ status: 'recusada', responded_at: new Date().toISOString() })
    .eq('id', proposal.id)

  await service
    .from('proposal_events')
    .insert({ proposal_id: proposal.id, event_type: 'declined', metadata: {} })

  return NextResponse.json({ ok: true })
}
