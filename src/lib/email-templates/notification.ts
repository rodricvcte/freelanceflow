// Notification emails sent to the freelancer (not the client).
// Reply-To should be the client's email so the freelancer can reply directly.

export type NotifData = {
  proposalTitle: string
  clientName:    string
  proposalUrl:   string
}

function wrap(content: string): string {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f3f4f6;padding:24px 12px">
    <tr><td align="center">
      <table width="480" cellpadding="0" cellspacing="0" border="0" style="max-width:480px;width:100%;background:white;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb">
        <tr>
          <td style="padding:20px 28px 0;background:#1D9E75">
            <p style="margin:0;font-size:13px;font-weight:700;color:rgba(255,255,255,0.9);letter-spacing:0.5px">FreelanceFlow</p>
          </td>
        </tr>
        <tr><td style="padding:28px 28px 24px">
          ${content}
          <div style="margin-top:28px;padding-top:20px;border-top:1px solid #f3f4f6">
            <p style="margin:0;font-size:11px;color:#9ca3af;text-align:center">FreelanceFlow · Gerencie suas propostas em <a href="https://freelanceflow.com.br" style="color:#9ca3af">freelanceflow.com.br</a></p>
          </div>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
}

function cta(url: string, label: string): string {
  return `<table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:20px">
    <tr><td>
      <a href="${url}" style="display:inline-block;background:#1D9E75;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-size:14px;font-weight:600">${label} →</a>
    </td></tr>
  </table>`
}

export function buildViewedNotificationHtml(d: NotifData): string {
  return wrap(`
    <p style="margin:0 0 6px;font-size:22px">👀</p>
    <h1 style="margin:0 0 12px;font-size:18px;font-weight:700;color:#111827">
      Proposta visualizada
    </h1>
    <p style="margin:0 0 8px;font-size:15px;color:#374151;line-height:1.6">
      <strong>${d.clientName}</strong> acabou de visualizar sua proposta <strong>${d.proposalTitle}</strong>.
    </p>
    <p style="margin:0;font-size:14px;color:#6b7280;line-height:1.6">
      A proposta ainda aguarda uma resposta. Este pode ser um bom momento para entrar em contato.
    </p>
    ${cta(d.proposalUrl, 'Ver proposta')}
  `)
}

export function buildAcceptedNotificationHtml(d: NotifData): string {
  return wrap(`
    <p style="margin:0 0 6px;font-size:22px">🎉</p>
    <h1 style="margin:0 0 12px;font-size:18px;font-weight:700;color:#111827">
      Proposta aceita!
    </h1>
    <p style="margin:0 0 8px;font-size:15px;color:#374151;line-height:1.6">
      <strong>${d.clientName}</strong> aceitou sua proposta <strong>${d.proposalTitle}</strong>.
    </p>
    <p style="margin:0;font-size:14px;color:#6b7280;line-height:1.6">
      Entre em contato para confirmar os próximos passos e dar início ao projeto.
    </p>
    ${cta(d.proposalUrl, 'Ver proposta')}
  `)
}

export function buildDeclinedNotificationHtml(d: NotifData): string {
  return wrap(`
    <p style="margin:0 0 6px;font-size:22px">📋</p>
    <h1 style="margin:0 0 12px;font-size:18px;font-weight:700;color:#111827">
      Proposta recusada
    </h1>
    <p style="margin:0 0 8px;font-size:15px;color:#374151;line-height:1.6">
      <strong>${d.clientName}</strong> recusou a proposta <strong>${d.proposalTitle}</strong>.
    </p>
    <p style="margin:0;font-size:14px;color:#6b7280;line-height:1.6">
      Considere entrar em contato para entender os motivos e, se necessário, apresentar uma nova versão.
    </p>
    ${cta(d.proposalUrl, 'Ver proposta')}
  `)
}
