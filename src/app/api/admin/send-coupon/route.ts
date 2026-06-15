import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { createServiceClient } from '@/lib/supabase-service'

const ADMIN_EMAIL = 'rodrigosc19@gmail.com'

function buildCouponEmail(name: string, code: string): string {
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
          <p style="margin:0 0 6px;font-size:22px">🎁</p>
          <h1 style="margin:0 0 16px;font-size:18px;font-weight:700;color:#111827">Seu cupom de fundador chegou!</h1>
          <p style="margin:0 0 12px;font-size:15px;color:#374151;line-height:1.6">
            Olá, <strong>${name}</strong>!
          </p>
          <p style="margin:0 0 20px;font-size:15px;color:#374151;line-height:1.6">
            Seu cupom de <strong>Membro Fundador</strong> está aqui. Com ele você terá acesso ao plano Pro do FreelanceFlow gratuitamente, para sempre.
          </p>
          <div style="margin:0 0 24px;padding:16px 20px;background:#f0fdf9;border:2px dashed #1D9E75;border-radius:10px;text-align:center">
            <p style="margin:0 0 6px;font-size:11px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:0.8px">Seu cupom</p>
            <p style="margin:0;font-size:24px;font-weight:800;color:#1D9E75;letter-spacing:3px;font-family:monospace,monospace">${code}</p>
          </div>
          <p style="margin:0 0 10px;font-size:14px;font-weight:600;color:#374151">Para ativar:</p>
          <ol style="margin:0 0 20px;padding-left:20px;font-size:14px;color:#374151;line-height:2.2">
            <li>Acesse <a href="https://freelanceflow.com.br" style="color:#1D9E75;font-weight:500">freelanceflow.com.br</a> e crie sua conta</li>
            <li>Vá em <strong>Configurações → Plano</strong></li>
            <li>Insira o cupom e aproveite</li>
          </ol>
          <p style="margin:0 0 20px;font-size:14px;color:#6b7280;line-height:1.6">
            Qualquer dúvida é só responder esse email.
          </p>
          <table width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr><td>
              <a href="https://freelanceflow.com.br" style="display:inline-block;background:#1D9E75;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-size:14px;font-weight:600">Acessar o FreelanceFlow →</a>
            </td></tr>
          </table>
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

export async function POST(req: Request) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.email !== ADMIN_EMAIL) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
  }

  const body = await req.json().catch(() => ({}))
  const { leadId, email, name, code } = body as Record<string, string>

  if (!leadId || !email || !name || !code?.trim()) {
    return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 })
  }

  const resend = new Resend(process.env.RESEND_API_KEY)
  const { error: emailError } = await resend.emails.send({
    from:    'FreelanceFlow <contato@freelanceflow.com.br>',
    to:      email,
    replyTo: ADMIN_EMAIL,
    subject: 'Seu cupom de fundador chegou — FreelanceFlow',
    html:    buildCouponEmail(name.split(' ')[0], code.trim()),
  })

  if (emailError) {
    console.error('[send-coupon] email error:', emailError)
    return NextResponse.json({ error: 'Erro ao enviar email' }, { status: 500 })
  }

  const service = createServiceClient()
  await service.from('founder_leads').update({ coupon_sent: true }).eq('id', leadId)

  return NextResponse.json({ ok: true })
}
