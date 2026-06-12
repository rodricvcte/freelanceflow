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
      if (proposal.status === 'enviada') {
        await service
          .from('proposals')
          .update({ status: 'visualizada', viewed_at: new Date().toISOString() })
          .eq('id', proposal.id)
      }

      await service
        .from('proposal_events')
        .insert({ proposal_id: proposal.id, event_type: 'viewed', metadata: {} })
    }
  }

  return NextResponse.redirect(new URL(`/p/${token}`, request.url), 302)
}
