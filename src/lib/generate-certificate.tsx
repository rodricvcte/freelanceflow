import { renderToBuffer } from '@react-pdf/renderer'
import { CertificatePDFDocument } from '@/components/proposals/CertificatePDF'
import type { CertificateData } from '@/components/proposals/CertificatePDF'
import { createServiceClient } from '@/lib/supabase-service'

const BUCKET = 'proposals-pdfs'

export async function generateAndSaveCertificate(
  proposalId: string,
  data: CertificateData
): Promise<string> {
  const service = createServiceClient()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const buffer = await renderToBuffer(<CertificatePDFDocument data={data} /> as any)

  const filePath = `certificates/${proposalId}.pdf`

  await service.storage.createBucket(BUCKET, { public: true }).catch(() => {})

  const { error: uploadError } = await service.storage
    .from(BUCKET)
    .upload(filePath, buffer, { contentType: 'application/pdf', upsert: true })

  if (uploadError) throw uploadError

  const { data: { publicUrl } } = service.storage.from(BUCKET).getPublicUrl(filePath)

  const url = `${publicUrl}?v=${Date.now()}`

  await service.from('proposals').update({ certificate_url: url }).eq('id', proposalId)

  return url
}
