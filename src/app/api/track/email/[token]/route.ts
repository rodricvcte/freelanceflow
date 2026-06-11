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
  const service = createServiceClient()

  const { data: proposal } = await service
    .from('proposals')
    .select('id')
    .eq('token', token)
    .maybeSingle()

  if (proposal) {
    await service
      .from('proposal_events')
      .insert({ proposal_id: proposal.id, event_type: 'email_opened', metadata: {} })
  }

  return new Response(PIXEL, {
    headers: {
      'Content-Type': 'image/gif',
      'Cache-Control': 'no-store, no-cache, must-revalidate',
    },
  })
}
