export type FollowUpEmailData = {
  clientName: string
  freelancerName: string
  freelancerLogoUrl: string | null
  accentColor: string
  proposalTitle: string
  proposalNumber: string | null
  proposalValue: number | null
  proposalValidUntil: string | null
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

function base(d: FollowUpEmailData, bodyHtml: string): string {
  const accent = d.accentColor || '#1D9E75'
  const logoHtml = d.freelancerLogoUrl
    ? `<img src="${d.freelancerLogoUrl}" alt="${d.freelancerName}" width="32" height="32" style="width:32px;height:32px;border-radius:50%;object-fit:cover;background:rgba(255,255,255,0.2);display:inline-block;vertical-align:middle;margin-right:10px" />`
    : `<span style="display:inline-block;vertical-align:middle;width:32px;height:32px;border-radius:50%;background:rgba(255,255,255,0.2);color:white;font-size:15px;font-weight:700;text-align:center;line-height:32px;margin-right:10px">${d.freelancerName.charAt(0).toUpperCase()}</span>`

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
</head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f3f4f6;padding:20px 12px">
    <tr><td align="center">
      <table width="520" cellpadding="0" cellspacing="0" border="0" style="max-width:520px;width:100%">

        <!-- Header -->
        <tr><td style="background:${accent};padding:18px 24px 0;border-radius:10px 10px 0 0">
          <p style="margin:0 0 16px;color:white;font-size:15px;font-weight:700;line-height:1">${logoHtml}${d.freelancerName}</p>
          <div style="height:3px;background:rgba(0,0,0,0.15);border-radius:2px 2px 0 0"></div>
        </td></tr>

        <!-- Body -->
        <tr><td style="background:white;padding:20px 24px;border-radius:0 0 10px 10px">

          ${bodyHtml}

          <!-- Card de resumo -->
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid #E0E0E0;border-radius:8px;margin-bottom:16px;overflow:hidden;background:#F5F5F5">
            <tr>
              <td width="50%" style="padding:10px 14px;border-bottom:1px solid #E0E0E0;border-right:1px solid #E0E0E0;vertical-align:top">
                <p style="margin:0 0 2px;font-size:10px;font-weight:600;color:#9ca3af;text-transform:uppercase;letter-spacing:0.8px">Proposta</p>
                <p style="margin:0;font-size:13px;font-weight:600;color:#111827">${d.proposalTitle}</p>
              </td>
              <td width="50%" style="padding:10px 14px;border-bottom:1px solid #E0E0E0;vertical-align:top">
                <p style="margin:0 0 2px;font-size:10px;font-weight:600;color:#9ca3af;text-transform:uppercase;letter-spacing:0.8px">Válida até</p>
                <p style="margin:0;font-size:13px;font-weight:600;color:#111827">${fmtDate(d.proposalValidUntil)}</p>
              </td>
            </tr>
            <tr>
              <td colspan="2" style="padding:12px 14px;background:white;border-top:1px solid #E0E0E0">
                <p style="margin:0 0 2px;font-size:10px;font-weight:600;color:#9ca3af;text-transform:uppercase;letter-spacing:0.8px">Valor total</p>
                <p style="margin:0;font-size:20px;font-weight:800;color:${accent}">${fmtBRL(d.proposalValue)}</p>
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

          <!-- Footer -->
          <div style="border-top:1px solid #e5e7eb;padding-top:12px;text-align:center">
            <p style="margin:0;font-size:10px;color:#d1d5db">Enviado via FreelanceFlow</p>
          </div>

        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
}

export function buildFollowUpNotViewedHtml(d: FollowUpEmailData): string {
  const body = `
    <p style="margin:0 0 16px;font-size:15px;color:#111827;line-height:1.5">
      Olá, <strong>${d.clientName}</strong>! Passamos para lembrar que você tem uma proposta aguardando a sua resposta.
    </p>
    <p style="margin:0 0 16px;font-size:14px;color:#4b5563;line-height:1.6">
      <strong style="color:#111827">${d.freelancerName}</strong> enviou uma proposta comercial para você e ela ainda não foi visualizada.
      Confira os detalhes e, se tiver dúvidas, é só entrar em contato.
    </p>
  `
  return base(d, body)
}

export function buildFollowUpNotRespondedHtml(d: FollowUpEmailData): string {
  const body = `
    <p style="margin:0 0 16px;font-size:15px;color:#111827;line-height:1.5">
      Olá, <strong>${d.clientName}</strong>! Notamos que você visualizou a proposta mas ainda não respondeu.
    </p>
    <p style="margin:0 0 16px;font-size:14px;color:#4b5563;line-height:1.6">
      Ficou com alguma dúvida? <strong style="color:#111827">${d.freelancerName}</strong> está à disposição para esclarecer
      qualquer ponto antes de você tomar uma decisão. Acesse a proposta abaixo:
    </p>
  `
  return base(d, body)
}

export function buildFollowUpExpiringTomorrowHtml(d: FollowUpEmailData): string {
  const accent = d.accentColor || '#1D9E75'
  const body = `
    <p style="margin:0 0 16px;font-size:15px;color:#111827;line-height:1.5">
      Olá, <strong>${d.clientName}</strong>! Esta é uma mensagem importante sobre sua proposta.
    </p>
    <div style="margin:0 0 16px;padding:12px 14px;background:#FEF3C7;border-left:3px solid #F59E0B;border-radius:0 6px 6px 0">
      <p style="margin:0;font-size:13px;font-weight:700;color:#92400E">⏰ Esta proposta expira amanhã</p>
    </div>
    <p style="margin:0 0 16px;font-size:14px;color:#4b5563;line-height:1.6">
      A proposta de <strong style="color:#111827">${d.freelancerName}</strong> vence amanhã. Depois disso,
      as condições e o valor apresentados podem não estar mais disponíveis.
    </p>
    <p style="margin:0 0 16px;font-size:14px;color:#4b5563;line-height:1.6">
      Se quiser aproveitar esta proposta, acesse o link abaixo e responda antes do prazo:
    </p>
  `
  void accent
  return base(d, body)
}
