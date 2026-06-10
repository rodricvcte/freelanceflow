import { NextResponse, type NextRequest } from 'next/server'
import { createServiceClient } from '@/lib/supabase-service'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params
  const service = createServiceClient()

  const { data: proposal } = await service
    .from('proposals')
    .select('id, status')
    .eq('token', token)
    .single()

  if (proposal) {
    if (proposal.status === 'sent') {
      await service
        .from('proposals')
        .update({ status: 'viewed', viewed_at: new Date().toISOString() })
        .eq('id', proposal.id)
    }

    await service
      .from('proposal_events')
      .insert({ proposal_id: proposal.id, event_type: 'viewed', metadata: {} })
  }

  return NextResponse.redirect(new URL(`/p/${token}`, request.url), 302)
}
