export type ProposalEmailData = {
  clientName: string
  freelancerName: string
  freelancerLogoUrl: string | null
  accentColor: string
  proposalTitle: string
  proposalNumber: string | null
  proposalValue: number | null
  proposalValidUntil: string | null
  customMessage: string | null
  freelancerEmail: string | null
  freelancerPhone: string | null
  viewUrl: string
}

function fmtBRL(v: number | null) {
  if (v === null) return '—'
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)
}

function fmtDate(iso: string | null) {
  if (!iso) return '—'
  const [y, m, d] = iso.split('T')[0].split('-').map(Number)
  return new Intl.DateTimeFormat('pt-BR').format(new Date(y, m - 1, d))
}

function truncate(s: string, n: number) {
  return s.length > n ? s.slice(0, n - 1) + '…' : s
}

export function buildProposalEmailHtml(d: ProposalEmailData): string {
  const accent = d.accentColor || '#1D9E75'

  const logoHtml = d.freelancerLogoUrl
    ? `<img src="${d.freelancerLogoUrl}" alt="${d.freelancerName}" width="32" height="32" style="width:32px;height:32px;border-radius:50%;object-fit:cover;background:rgba(255,255,255,0.2);display:inline-block;vertical-align:middle;margin-right:10px" />`
    : `<span style="display:inline-block;vertical-align:middle;width:32px;height:32px;border-radius:50%;background:rgba(255,255,255,0.2);color:white;font-size:15px;font-weight:700;text-align:center;line-height:32px;margin-right:10px">${d.freelancerName.charAt(0).toUpperCase()}</span>`

  const customMessageHtml = d.customMessage?.trim()
    ? `<div style="border-left:3px solid ${accent};padding:10px 14px;margin:0 0 16px;background:#f9fafb;border-radius:0 6px 6px 0">
        <p style="margin:0;font-size:13px;color:#374151;line-height:1.6;white-space:pre-wrap">${d.customMessage.trim()}</p>
      </div>`
    : ''

  const supplierParts = [
    d.freelancerName,
    d.freelancerEmail,
    d.freelancerPhone,
  ].filter(Boolean).join(' · ')

  const titleTruncated = truncate(d.proposalTitle, 40)

  const ffLogoSvg = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="display:inline-block;vertical-align:middle;margin-right:5px"><rect width="24" height="24" rx="6" fill="#1D9E75"/><path d="M7 8h10M7 12h6M7 16h8" stroke="white" stroke-width="2" stroke-linecap="round"/></svg>`

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Proposta Comercial — ${d.proposalTitle}</title>
</head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f3f4f6;padding:20px 12px">
    <tr><td align="center">
      <table width="520" cellpadding="0" cellspacing="0" border="0" style="max-width:520px;width:100%">

        <!-- Header -->
        <tr><td style="background:${accent};padding:20px 24px 0;border-radius:10px 10px 0 0">
          <p style="margin:0 0 18px;color:white;font-size:15px;font-weight:700;line-height:1">${logoHtml}${d.freelancerName}</p>
          <div style="height:3px;background:${accent};opacity:0.35;border-radius:2px 2px 0 0"></div>
        </td></tr>

        <!-- Body -->
        <tr><td style="background:white;padding:20px 24px;border-radius:0 0 10px 10px">

          <!-- Saudação -->
          <p style="margin:0 0 16px;font-size:15px;color:#111827;line-height:1.4">
            Olá, <strong>${d.clientName}</strong>! <span style="color:#4b5563">${d.freelancerName} enviou uma proposta comercial para você.</span>
          </p>

          ${customMessageHtml}

          <!-- Card de dados -->
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid #E0E0E0;border-radius:8px;margin-bottom:16px;overflow:hidden;background:#F5F5F5">

            <!-- Grid 2x2 -->
            <tr>
              <td width="50%" style="padding:10px 14px;border-bottom:1px solid #E0E0E0;border-right:1px solid #E0E0E0;vertical-align:top">
                <p style="margin:0 0 2px;font-size:10px;font-weight:600;color:#9ca3af;text-transform:uppercase;letter-spacing:0.8px">Proposta</p>
                <p style="margin:0;font-size:13px;font-weight:600;color:#111827">${titleTruncated}</p>
              </td>
              <td width="50%" style="padding:10px 14px;border-bottom:1px solid #E0E0E0;vertical-align:top">
                <p style="margin:0 0 2px;font-size:10px;font-weight:600;color:#9ca3af;text-transform:uppercase;letter-spacing:0.8px">Número</p>
                <p style="margin:0;font-size:13px;font-weight:600;color:#111827">${d.proposalNumber ?? '—'}</p>
              </td>
            </tr>
            <tr>
              <td width="50%" style="padding:10px 14px;border-bottom:1px solid #E0E0E0;border-right:1px solid #E0E0E0;vertical-align:top">
                <p style="margin:0 0 2px;font-size:10px;font-weight:600;color:#9ca3af;text-transform:uppercase;letter-spacing:0.8px">Cliente</p>
                <p style="margin:0;font-size:13px;font-weight:600;color:#111827">${d.clientName}</p>
              </td>
              <td width="50%" style="padding:10px 14px;border-bottom:1px solid #E0E0E0;vertical-align:top">
                <p style="margin:0 0 2px;font-size:10px;font-weight:600;color:#9ca3af;text-transform:uppercase;letter-spacing:0.8px">Válida até</p>
                <p style="margin:0;font-size:13px;font-weight:600;color:#111827">${fmtDate(d.proposalValidUntil)}</p>
              </td>
            </tr>

            <!-- Valor — linha inteira -->
            <tr>
              <td colspan="2" style="padding:12px 14px;background:white;border-top:1px solid #E0E0E0">
                <p style="margin:0 0 2px;font-size:10px;font-weight:600;color:#9ca3af;text-transform:uppercase;letter-spacing:0.8px">Valor total</p>
                <p style="margin:0;font-size:22px;font-weight:800;color:${accent}">${fmtBRL(d.proposalValue)}</p>
              </td>
            </tr>
          </table>

          <!-- CTA -->
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:16px">
            <tr><td align="center">
              <a href="${d.viewUrl}"
                 style="display:inline-block;background:${accent};color:white;text-align:center;padding:16px 36px;border-radius:8px;text-decoration:none;font-size:15px;font-weight:700;width:100%;box-sizing:border-box">
                Ver proposta →
              </a>
            </td></tr>
          </table>

          <!-- Separador + fornecedor -->
          <div style="border-top:1px solid #e5e7eb;padding-top:12px;text-align:center">
            <p style="margin:0 0 6px;font-size:11px;color:#9ca3af">${supplierParts}</p>
            <p style="margin:0;font-size:10px;color:#d1d5db">${ffLogoSvg}<span style="vertical-align:middle">Enviado via FreelanceFlow</span></p>
          </div>

        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`
}
