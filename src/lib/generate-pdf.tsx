import { renderToBuffer } from '@react-pdf/renderer'
import type { SupabaseClient } from '@supabase/supabase-js'
import { ProposalPDFDocument } from '@/components/proposals/ProposalPDF'
import type { ProposalForPDF, ProfileForPDF } from '@/components/proposals/ProposalPDF'
import { createServiceClient } from '@/lib/supabase-service'

const BUCKET = 'proposals-pdfs'

export async function generateAndSaveProposalPDF(
  proposalId: string,
  supabase: SupabaseClient
): Promise<string> {
  const [{ data: raw }, { data: authData }] = await Promise.all([
    supabase
      .from('proposals')
      .select('title, service_description, value, payment_terms, deadline_days, valid_until, token, clients(name, email)')
      .eq('id', proposalId)
      .single(),
    supabase.auth.getUser(),
  ])

  if (!raw || !authData.user) throw new Error('Proposta ou usuário não encontrado')

  const { data: profileRaw } = await supabase
    .from('profiles')
    .select('full_name, business_name, accent_color')
    .eq('id', authData.user.id)
    .single()

  // Supabase may return the FK-joined clients as array or object depending on schema typing
  const rawClients = (raw as Record<string, unknown>).clients
  const clientsNorm = Array.isArray(rawClients)
    ? (rawClients[0] as { name: string; email: string | null } | undefined) ?? null
    : (rawClients as { name: string; email: string | null } | null)

  const proposal: ProposalForPDF = {
    title: raw.title,
    service_description: raw.service_description,
    value: raw.value,
    payment_terms: raw.payment_terms,
    deadline_days: raw.deadline_days,
    valid_until: raw.valid_until,
    token: raw.token,
    clients: clientsNorm,
  }

  const profile: ProfileForPDF = profileRaw ?? {
    full_name: null,
    business_name: null,
    accent_color: null,
  }

  // renderToBuffer expects a ReactElement<DocumentProps>; our wrapper renders a <Document> at its root
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const buffer = await renderToBuffer(<ProposalPDFDocument proposal={proposal} profile={profile} /> as any)

  const service = createServiceClient()
  const filePath = `${authData.user.id}/${proposalId}.pdf`

  await service.storage.createBucket(BUCKET, { public: true })

  const { error: uploadError } = await service.storage
    .from(BUCKET)
    .upload(filePath, buffer, { contentType: 'application/pdf', upsert: true })

  if (uploadError) throw uploadError

  const { data: { publicUrl } } = service.storage.from(BUCKET).getPublicUrl(filePath)

  await supabase.from('proposals').update({ pdf_url: publicUrl }).eq('id', proposalId)

  return publicUrl
}
