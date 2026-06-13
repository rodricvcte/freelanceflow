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
    .select('id, status, user_id')
    .eq('token', token)
    .single()

  if (proposal) {
    // Check if proposal owner is Pro — free users' proposals are not tracked
    let trackingAllowed = process.env.DISABLE_PLAN_LIMITS === 'true'
    if (!trackingAllowed) {
      const { data: sub } = await service
        .from('subscriptions')
        .select('plan, status')
        .eq('user_id', proposal.user_id)
        .maybeSingle()
      trackingAllowed = !!sub && sub.plan !== 'free' && (sub.status === 'active' || sub.status === 'trialing')
    }

    if (trackingAllowed) {
      // Always update viewed_at — keeps proposals UPDATE firing on every visit,
      // which is the reliable trigger for the dashboard's Realtime subscription.
      const updatePayload: Record<string, unknown> = { viewed_at: new Date().toISOString() }
      if (proposal.status === 'enviada') updatePayload.status = 'visualizada'
      await service.from('proposals').update(updatePayload).eq('id', proposal.id)

      await service
        .from('proposal_events')
        .insert({ proposal_id: proposal.id, event_type: 'viewed', metadata: {} })
    }
  }

  // ?_t=1 tells the public page that tracking already happened via this redirect
  return NextResponse.redirect(new URL(`/p/${token}?_t=1`, request.url), 302)
}
