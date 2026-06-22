import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase-service'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

function buildResetEmailHtml(actionLink: string): string {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Redefinição de senha — FreelanceFlow</title>
</head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px">

          <!-- Logo -->
          <tr>
            <td align="center" style="padding-bottom:28px">
              <span style="font-size:22px;font-weight:700;color:#1D9E75">FreelanceFlow</span>
            </td>
          </tr>

          <!-- Card -->
          <tr>
            <td style="background:#ffffff;border-radius:12px;border:1px solid #e5e7eb;padding:36px 32px">

              <p style="margin:0 0 8px;font-size:20px;font-weight:700;color:#111827">
                Redefinição de senha
              </p>
              <p style="margin:0 0 28px;font-size:14px;color:#6b7280;line-height:1.6">
                Recebemos uma solicitação para redefinir a senha da sua conta.<br>
                Clique no botão abaixo para criar uma nova senha. O link expira em <strong>1 hora</strong>.
              </p>

              <!-- CTA -->
              <table cellpadding="0" cellspacing="0" style="margin:0 0 28px">
                <tr>
                  <td style="border-radius:8px;background:#1D9E75">
                    <a href="${actionLink}"
                       style="display:inline-block;padding:13px 28px;font-size:14px;font-weight:600;color:#ffffff;text-decoration:none;border-radius:8px">
                      Redefinir minha senha
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 8px;font-size:12px;color:#9ca3af;line-height:1.6">
                Se o botão não funcionar, copie e cole o link abaixo no seu navegador:
              </p>
              <p style="margin:0;font-size:11px;color:#6b7280;word-break:break-all">
                ${actionLink}
              </p>

              <hr style="margin:28px 0;border:none;border-top:1px solid #f3f4f6">

              <p style="margin:0;font-size:12px;color:#9ca3af;line-height:1.6">
                Se você não solicitou a redefinição de senha, ignore este email.
                Sua senha permanece a mesma.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding-top:24px">
              <p style="margin:0;font-size:11px;color:#9ca3af">
                FreelanceFlow · Propostas comerciais para freelancers brasileiros
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

export async function POST(request: Request) {
  const { email } = await request.json()

  if (!email || typeof email !== 'string') {
    return NextResponse.json({ error: 'Email inválido.' }, { status: 400 })
  }

  const normalized = email.toLowerCase().trim()
  const supabase = createServiceClient()

  // Verifica se o email está cadastrado
  const { data: listData, error: listError } = await supabase.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  })

  if (listError) {
    return NextResponse.json({ error: 'Erro interno. Tente novamente.' }, { status: 500 })
  }

  const exists = listData.users.some(u => u.email?.toLowerCase() === normalized)

  if (!exists) {
    return NextResponse.json({ error: 'Este e-mail não está cadastrado.' }, { status: 404 })
  }

  // Gera o link de recuperação via admin (sem enviar email pelo Supabase)
  const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
    type: 'recovery',
    email: normalized,
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL ?? 'https://freelanceflow.com.br'}/redefinir-senha`,
    },
  })

  if (linkError || !linkData?.properties?.action_link) {
    return NextResponse.json({ error: 'Erro ao gerar link. Tente novamente.' }, { status: 500 })
  }

  // Envia via Resend com template customizado
  const { error: emailError } = await resend.emails.send({
    from:    'FreelanceFlow <contato@freelanceflow.com.br>',
    to:      normalized,
    subject: 'Redefinição de senha — FreelanceFlow',
    html:    buildResetEmailHtml(linkData.properties.action_link),
  })

  if (emailError) {
    return NextResponse.json({ error: 'Erro ao enviar email. Tente novamente.' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
