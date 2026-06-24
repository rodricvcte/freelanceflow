import { renderToBuffer } from '@react-pdf/renderer'
import { ProposalPDFDocument } from '@/components/proposals/ProposalPDF'
import type { ProposalForPDF, ProfileForPDF, Section } from '@/components/proposals/ProposalPDF'
import { createServiceClient } from '@/lib/supabase-service'

const BUCKET = 'proposals-pdfs'

export async function generateAndSaveProposalPDF(
  proposalId: string,
  userId: string
): Promise<string> {
  const service = createServiceClient()

  // All DB reads in a single parallel batch — no auth round-trip needed
  const [{ data: raw }, { data: profileRaw }, { data: sub }] = await Promise.all([
    service
      .from('proposals')
      .select('title, service_description, value, payment_terms, deadline_days, valid_until, token, proposal_number, code, version, sections, snapshot_profile, clients(name, email)')
      .eq('id', proposalId)
      .single(),
    service
      .from('profiles')
      .select('full_name, business_name, accent_color, logo_url, phone, email_business, address, website, document_type, cpf_cnpj, instagram, linkedin, facebook, youtube, tiktok, signature_data')
      .eq('id', userId)
      .single(),
    service
      .from('subscriptions')
      .select('plan, status')
      .eq('user_id', userId)
      .maybeSingle(),
  ])

  if (!raw) throw new Error('Proposta não encontrada')

  const snapshotProfile = (raw as Record<string, unknown>).snapshot_profile as ProfileForPDF | null
  const isFreePlan = !sub || sub.plan === 'free' || sub.status !== 'active'

  const rawClients = (raw as Record<string, unknown>).clients
  const clientsNorm = Array.isArray(rawClients)
    ? (rawClients[0] as { name: string; email: string | null } | undefined) ?? null
    : (rawClients as { name: string; email: string | null } | null)

  const rawCode = (raw as Record<string, unknown>).code as string | null

  const proposal: ProposalForPDF = {
    title:               raw.title,
    service_description: raw.service_description,
    value:               raw.value,
    payment_terms:       raw.payment_terms,
    deadline_days:       raw.deadline_days,
    valid_until:         raw.valid_until,
    token:               raw.token,
    code:                rawCode,
    proposal_number:     raw.proposal_number ?? null,
    version:             raw.version ?? 1,
    sections:            (raw.sections as Section[] | null) ?? [],
    clients:             clientsNorm,
  }

  const profile: ProfileForPDF = {
    ...(snapshotProfile ?? profileRaw ?? {
      full_name: null, business_name: null, accent_color: null, logo_url: null,
      phone: null, email_business: null, address: null, website: null,
      document_type: null, cpf_cnpj: null,
      instagram: null, linkedin: null, facebook: null, youtube: null, tiktok: null,
      signature_data: null,
    }),
    // Always use current identity fields — snapshot may predate the user filling these in
    business_name:  profileRaw?.business_name  ?? null,
    full_name:      profileRaw?.full_name       ?? null,
    signature_data: profileRaw?.signature_data  ?? null,
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const buffer = await renderToBuffer(
    <ProposalPDFDocument proposal={proposal} profile={profile} isFreePlan={isFreePlan} /> as any
  )

  const filePath = `${userId}/${rawCode ?? (raw.proposal_number as string | null) ?? proposalId}.pdf`

  await service.storage.createBucket(BUCKET, { public: true }).catch(() => {})

  const { error: uploadError } = await service.storage
    .from(BUCKET)
    .upload(filePath, buffer, { contentType: 'application/pdf', upsert: true })

  if (uploadError) throw uploadError

  const { data: { publicUrl } } = service.storage.from(BUCKET).getPublicUrl(filePath)

  const versionedUrl = `${publicUrl}?v=${Date.now()}`

  await service.from('proposals').update({ pdf_url: versionedUrl }).eq('id', proposalId)

  return versionedUrl
}
