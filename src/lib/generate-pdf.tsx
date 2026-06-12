import { renderToBuffer } from '@react-pdf/renderer'
import type { SupabaseClient } from '@supabase/supabase-js'
import { ProposalPDFDocument } from '@/components/proposals/ProposalPDF'
import type { ProposalForPDF, ProfileForPDF, Section } from '@/components/proposals/ProposalPDF'
import { createServiceClient } from '@/lib/supabase-service'

const BUCKET = 'proposals-pdfs'

export async function generateAndSaveProposalPDF(
  proposalId: string,
  supabase: SupabaseClient
): Promise<string> {
  const [{ data: raw }, { data: authData }] = await Promise.all([
    supabase
      .from('proposals')
      .select('title, service_description, value, payment_terms, deadline_days, valid_until, token, proposal_number, version, sections, snapshot_profile, clients(name, email)')
      .eq('id', proposalId)
      .single(),
    supabase.auth.getUser(),
  ])

  if (!raw || !authData.user) throw new Error('Proposta ou usuário não encontrado')

  // Use snapshot saved at creation time; fall back to current profile for old proposals
  const snapshotProfile = (raw as Record<string, unknown>).snapshot_profile as ProfileForPDF | null

  const service = createServiceClient()

  const [{ data: profileRaw }, { data: sub }, { data: sigRow }] = await Promise.all([
    snapshotProfile
      ? Promise.resolve({ data: null })
      : supabase
          .from('profiles')
          .select('full_name, business_name, accent_color, logo_url, phone, email_business, address, website, document_type, cpf_cnpj, instagram, linkedin, facebook, youtube, tiktok, signature_data')
          .eq('id', authData.user.id)
          .single(),
    supabase
      .from('subscriptions')
      .select('plan, status')
      .eq('user_id', authData.user.id)
      .maybeSingle(),
    // Always fetch signature_data from the current profile — snapshot doesn't carry it.
    // Use service client to bypass RLS so signature works for all plan types.
    service
      .from('profiles')
      .select('signature_data')
      .eq('id', authData.user.id)
      .single(),
  ])

  const isFreePlan = !sub || sub.plan === 'free' || sub.status !== 'active'

  const rawClients = (raw as Record<string, unknown>).clients
  const clientsNorm = Array.isArray(rawClients)
    ? (rawClients[0] as { name: string; email: string | null } | undefined) ?? null
    : (rawClients as { name: string; email: string | null } | null)

  const proposal: ProposalForPDF = {
    title:               raw.title,
    service_description: raw.service_description,
    value:               raw.value,
    payment_terms:       raw.payment_terms,
    deadline_days:       raw.deadline_days,
    valid_until:         raw.valid_until,
    token:               raw.token,
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
    signature_data: sigRow?.signature_data ?? null,
  }

  const buffer = await renderToBuffer(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    <ProposalPDFDocument proposal={proposal} profile={profile} isFreePlan={isFreePlan} /> as any
  )

  const filePath = `${authData.user.id}/${proposalId}.pdf`

  await service.storage.createBucket(BUCKET, { public: true }).catch(() => {})

  const { error: uploadError } = await service.storage
    .from(BUCKET)
    .upload(filePath, buffer, { contentType: 'application/pdf', upsert: true })

  if (uploadError) throw uploadError

  const { data: { publicUrl } } = service.storage.from(BUCKET).getPublicUrl(filePath)

  // Append version to bust CDN cache — same file path is overwritten on each save
  const versionedUrl = `${publicUrl}?v=${Date.now()}`

  await supabase.from('proposals').update({ pdf_url: versionedUrl }).eq('id', proposalId)

  return versionedUrl
}
