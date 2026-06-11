import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase-service'

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

  if (['aprovada', 'reprovada'].includes(proposal.status)) {
    return NextResponse.json({ error: 'Proposta já respondida' }, { status: 409 })
  }

  await service
    .from('proposals')
    .update({ status: 'aprovada', responded_at: new Date().toISOString() })
    .eq('id', proposal.id)

  await service
    .from('proposal_events')
    .insert({ proposal_id: proposal.id, event_type: 'accepted', metadata: {} })

  return NextResponse.json({ ok: true })
}
