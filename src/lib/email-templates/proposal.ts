export type ProposalEmailData = {
  clientName: string
  freelancerName: string
  freelancerLogoUrl: string | null
  accentColor: string
  proposalTitle: string
  proposalValue: number | null
  proposalValidUntil: string | null
  customMessage: string | null
  approveUrl: string
  declineUrl: string
  viewUrl: string
  trackingPixelUrl: string
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

export function buildProposalEmailHtml(d: ProposalEmailData): string {
  const accent = d.accentColor || '#1D9E75'

  const logoHtml = d.freelancerLogoUrl
    ? `<img src="${d.freelancerLogoUrl}" alt="${d.freelancerName}" width="40" height="40" style="width:40px;height:40px;border-radius:50%;object-fit:cover;background:rgba(255,255,255,0.2);display:block;margin-bottom:12px" />`
    : `<div style="width:40px;height:40px;border-radius:50%;background:rgba(255,255,255,0.2);display:flex;align-items:center;justify-content:center;color:white;font-size:18px;font-weight:700;margin-bottom:12px">${d.freelancerName.charAt(0).toUpperCase()}</div>`

  const customMessageHtml = d.customMessage
    ? `<div style="background:#f9fafb;border-left:3px solid ${accent};border-radius:4px;padding:14px 16px;margin:0 0 24px;color:#374151;font-size:14px;line-height:1.6;white-space:pre-wrap">${d.customMessage}</div>`
    : ''

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Proposta Comercial — ${d.proposalTitle}</title>
</head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f3f4f6;padding:32px 16px">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%">

        <!-- Header -->
        <tr><td style="background:${accent};padding:32px 32px 28px;border-radius:12px 12px 0 0">
          ${logoHtml}
          <p style="margin:0 0 2px;color:white;font-size:17px;font-weight:700;line-height:1.3">${d.freelancerName}</p>
          <p style="margin:0;color:rgba(255,255,255,0.7);font-size:11px;font-weight:600;letter-spacing:3px;text-transform:uppercase">PROPOSTA COMERCIAL</p>
        </td></tr>

        <!-- Body -->
        <tr><td style="background:white;padding:32px 32px 0">
          <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#111827">Olá, ${d.clientName}!</h1>
          <p style="margin:0 0 24px;font-size:15px;color:#4b5563;line-height:1.6">
            <strong style="color:#111827">${d.freelancerName}</strong> enviou uma proposta comercial para você.
          </p>

          ${customMessageHtml}

          <!-- Proposal card -->
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid #e5e7eb;border-radius:10px;margin-bottom:28px;overflow:hidden">
            <tr><td style="background:#f9fafb;padding:16px 20px;border-bottom:1px solid #e5e7eb">
              <p style="margin:0;font-size:16px;font-weight:700;color:#111827">${d.proposalTitle}</p>
            </td></tr>
            <tr><td style="padding:16px 20px">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="padding:0 0 8px">
                    <p style="margin:0 0 2px;font-size:11px;font-weight:600;color:#9ca3af;text-transform:uppercase;letter-spacing:1px">Valor total</p>
                    <p style="margin:0;font-size:24px;font-weight:800;color:${accent}">${fmtBRL(d.proposalValue)}</p>
                  </td>
                  ${d.proposalValidUntil ? `<td align="right" style="padding:0 0 8px;vertical-align:top">
                    <p style="margin:0 0 2px;font-size:11px;font-weight:600;color:#9ca3af;text-transform:uppercase;letter-spacing:1px">Válida até</p>
                    <p style="margin:0;font-size:15px;font-weight:600;color:#374151">${fmtDate(d.proposalValidUntil)}</p>
                  </td>` : ''}
                </tr>
              </table>
            </td></tr>
          </table>

          <!-- Action buttons -->
          <p style="margin:0 0 16px;font-size:14px;color:#6b7280;text-align:center">Revise os detalhes e responda esta proposta:</p>
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:20px">
            <tr>
              <td width="50%" style="padding-right:6px">
                <a href="${d.approveUrl}"
                   style="display:block;background:${accent};color:white;text-align:center;padding:14px 16px;border-radius:8px;text-decoration:none;font-size:15px;font-weight:700">
                  ✓ Aprovar proposta
                </a>
              </td>
              <td width="50%" style="padding-left:6px">
                <a href="${d.declineUrl}"
                   style="display:block;background:#f3f4f6;color:#374151;text-align:center;padding:14px 16px;border-radius:8px;text-decoration:none;font-size:15px;font-weight:600;border:1px solid #e5e7eb">
                  ✗ Recusar proposta
                </a>
              </td>
            </tr>
          </table>

          <p style="text-align:center;margin:0 0 32px">
            <a href="${d.viewUrl}" style="color:${accent};font-size:13px;text-decoration:none">
              Ver proposta completa →
            </a>
          </p>
        </td></tr>

        <!-- Footer -->
        <tr><td style="background:#f9fafb;padding:20px 32px;border-top:1px solid #e5e7eb;border-radius:0 0 12px 12px;text-align:center">
          <p style="margin:0;font-size:12px;color:#9ca3af">Enviado via <strong style="color:#6b7280">FreelanceFlow</strong></p>
        </td></tr>

      </table>
    </td></tr>
  </table>

  <!-- Tracking pixel -->
  <img src="${d.trackingPixelUrl}" width="1" height="1" alt="" style="display:none;width:1px;height:1px" />
</body>
</html>`
}
