import { renderToBuffer } from '@react-pdf/renderer'
import { CertificatePDFDocument } from '@/components/proposals/CertificatePDF'
import type { CertificateData } from '@/components/proposals/CertificatePDF'

export type { CertificateData }

export async function generateCertificateBuffer(data: CertificateData): Promise<Buffer> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const buf = await renderToBuffer(<CertificatePDFDocument data={data} /> as any)
  return Buffer.from(buf)
}
