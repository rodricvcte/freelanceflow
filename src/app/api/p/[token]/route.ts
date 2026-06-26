import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase-service'

type ProfileData = {
  full_name: string | null
  business_name: string | null
  logo_url: string | null
  accent_color: string | null
  email_business: string | null
  phone: string | null
  instagram: string | null
  linkedin: string | null
  facebook: string | null
  youtube: string | null
  tiktok: string | null
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params
  const service = createServiceClient()

  const { data: proposal } = await service
    .from('proposals')
    .select('id, title, proposal_number, service_description, sections, value, payment_terms, deadline_days, valid_until, status, token, created_at, pdf_url, user_id, snapshot_profile, recipient_name, recipient_email, clients(name, email)')
    .eq('token', token)
    .single()

  if (!proposal) return NextResponse.json({ error: 'Proposta não encontrada' }, { status: 404 })

  const isDraft  = proposal.status === 'rascunho'
  const snapshot = (proposal as Record<string, unknown>).snapshot_profile as Record<string, unknown> | null

  const EMPTY_PROFILE: ProfileData = {
    full_name: null, business_name: null, logo_url: null, accent_color: null,
    email_business: null, phone: null,
    instagram: null, linkedin: null, facebook: null, youtube: null, tiktok: null,
  }

  // Non-draft proposals must use the snapshot so profile changes don't bleed into sent/accepted proposals.
  // Draft proposals (still being edited) use the live profile so the freelancer sees current data.
  let profileData: ProfileData

  if (!isDraft && snapshot) {
    profileData = {
      full_name:      (snapshot.full_name      as string | null) ?? null,
      business_name:  (snapshot.business_name  as string | null) ?? null,
      logo_url:       (snapshot.logo_url       as string | null) ?? null,
      accent_color:   (snapshot.accent_color   as string | null) ?? null,
      email_business: (snapshot.email_business as string | null) ?? null,
      phone:          (snapshot.phone          as string | null) ?? null,
      instagram:      (snapshot.instagram      as string | null) ?? null,
      linkedin:       (snapshot.linkedin       as string | null) ?? null,
      facebook:       (snapshot.facebook       as string | null) ?? null,
      youtube:        (snapshot.youtube        as string | null) ?? null,
      tiktok:         (snapshot.tiktok         as string | null) ?? null,
    }
  } else {
    const { data: liveProfile } = await service
      .from('profiles')
      .select('full_name, business_name, logo_url, accent_color, email_business, phone, instagram, linkedin, facebook, youtube, tiktok')
      .eq('id', proposal.user_id)
      .single()
    profileData = liveProfile ?? EMPTY_PROFILE
  }

  const proposalAny = proposal as Record<string, unknown>
  const liveClients = Array.isArray(proposal.clients)
    ? (proposal.clients[0] ?? null)
    : proposal.clients

  // For non-draft proposals, use the recipient snapshot stored at send time so that
  // subsequent client edits don't bleed into already-sent/accepted proposals.
  const snapshotClients =
    !isDraft && proposalAny.recipient_name
      ? { name: proposalAny.recipient_name as string, email: (proposalAny.recipient_email as string | null) ?? null }
      : liveClients

  return NextResponse.json({
    proposal: {
      id: proposal.id,
      title: proposal.title,
      proposal_number: proposal.proposal_number ?? null,
      service_description: proposal.service_description,
      sections: proposal.sections ?? [],
      value: proposal.value,
      payment_terms: proposal.payment_terms,
      deadline_days: proposal.deadline_days,
      valid_until: proposal.valid_until,
      status: proposal.status,
      token: proposal.token,
      created_at: proposal.created_at,
      pdf_url: (proposal.pdf_url as string | null) ?? null,
      clients: snapshotClients,
    },
    profile: profileData,
  })
}
