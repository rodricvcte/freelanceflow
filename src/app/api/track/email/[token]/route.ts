import { createServiceClient } from '@/lib/supabase-service'

// Transparent 1×1 GIF
const PIXEL = Buffer.from(
  'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
  'base64'
)

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params
  console.log('[track/email] called — token:', token)

  const service = createServiceClient()

  const { data: proposal, error: queryError } = await service
    .from('proposals')
    .select('id, status')
    .eq('token', token)
    .maybeSingle()

  console.log('[track/email] query result — proposal:', proposal, 'error:', queryError)

  if (!proposal) {
    console.log('[track/email] no proposal found for token:', token)
    return new Response(PIXEL, {
      headers: { 'Content-Type': 'image/gif', 'Cache-Control': 'no-store' },
    })
  }

  const now = new Date().toISOString()

  if (proposal.status === 'enviada') {
    const { error: updateError } = await service
      .from('proposals')
      .update({ status: 'vista', viewed_at: now })
      .eq('id', proposal.id)
    console.log('[track/email] status update — error:', updateError ?? 'none')
  } else {
    console.log('[track/email] skipping status update — current status:', proposal.status)
  }

  const { error: eventError } = await service
    .from('proposal_events')
    .insert({ proposal_id: proposal.id, event_type: 'viewed', metadata: {} })
  console.log('[track/email] event insert — error:', eventError ?? 'none')

  return new Response(PIXEL, {
    headers: {
      'Content-Type': 'image/gif',
      'Cache-Control': 'no-store, no-cache, must-revalidate',
    },
  })
}
