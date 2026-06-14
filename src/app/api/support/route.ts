import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { createServiceClient } from '@/lib/supabase-service'

const TIPOS = ['Dúvida', 'Sugestão', 'Problema', 'Outro'] as const

export async function POST(req: Request) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const body = await req.json().catch(() => ({}))
  const tipo: string     = body.tipo     ?? ''
  const mensagem: string = body.mensagem ?? ''

  if (!TIPOS.includes(tipo as typeof TIPOS[number])) {
    return NextResponse.json({ error: 'Tipo inválido' }, { status: 400 })
  }
  if (!mensagem.trim() || mensagem.trim().length < 20) {
    return NextResponse.json({ error: 'Mensagem muito curta (mínimo 20 caracteres)' }, { status: 400 })
  }

  const service = createServiceClient()

  const [{ data: profile }, { data: sub }] = await Promise.all([
    service.from('profiles').select('full_name, business_name').eq('id', user.id).maybeSingle(),
    service.from('subscriptions').select('plan, status').eq('user_id', user.id).maybeSingle(),
  ])

  const userName  = (profile?.business_name || profile?.full_name) ?? user.email ?? 'Usuário'
  const userEmail = user.email ?? '—'
  const plano     = sub && sub.plan !== 'free' && (sub.status === 'active' || sub.status === 'trialing')
    ? 'Pro'
    : 'Free'

  const now = new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })

  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f3f4f6;padding:24px 12px">
    <tr><td align="center">
      <table width="480" cellpadding="0" cellspacing="0" border="0" style="max-width:480px;width:100%;background:white;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb">
        <tr>
          <td style="padding:20px 28px 16px;background:#1D9E75">
            <p style="margin:0;font-size:13px;font-weight:700;color:rgba(255,255,255,0.9);letter-spacing:0.5px">FreelanceFlow · Suporte</p>
          </td>
        </tr>
        <tr><td style="padding:28px 28px 24px">
          <h2 style="margin:0 0 20px;font-size:17px;font-weight:700;color:#111827">${tipo} de ${userName}</h2>
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;margin-bottom:20px">
            <tr style="background:#f9fafb"><td style="padding:10px 14px;font-size:12px;font-weight:600;color:#6b7280;width:120px">Usuário</td><td style="padding:10px 14px;font-size:13px;color:#111827">${userName}</td></tr>
            <tr style="border-top:1px solid #f3f4f6"><td style="padding:10px 14px;font-size:12px;font-weight:600;color:#6b7280">Email</td><td style="padding:10px 14px;font-size:13px;color:#111827">${userEmail}</td></tr>
            <tr style="border-top:1px solid #f3f4f6;background:#f9fafb"><td style="padding:10px 14px;font-size:12px;font-weight:600;color:#6b7280">Plano</td><td style="padding:10px 14px;font-size:13px;color:#111827">${plano}</td></tr>
            <tr style="border-top:1px solid #f3f4f6"><td style="padding:10px 14px;font-size:12px;font-weight:600;color:#6b7280">Tipo</td><td style="padding:10px 14px;font-size:13px;color:#111827">${tipo}</td></tr>
            <tr style="border-top:1px solid #f3f4f6;background:#f9fafb"><td style="padding:10px 14px;font-size:12px;font-weight:600;color:#6b7280">Data</td><td style="padding:10px 14px;font-size:13px;color:#111827">${now}</td></tr>
          </table>
          <p style="margin:0 0 8px;font-size:12px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:0.5px">Mensagem</p>
          <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:14px;font-size:14px;color:#374151;line-height:1.7;white-space:pre-wrap">${mensagem.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
          <div style="margin-top:28px;padding-top:20px;border-top:1px solid #f3f4f6">
            <p style="margin:0;font-size:11px;color:#9ca3af;text-align:center">Responda diretamente para <a href="mailto:${userEmail}" style="color:#1D9E75">${userEmail}</a></p>
          </div>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`

  const resend = new Resend(process.env.RESEND_API_KEY)
  const { error } = await resend.emails.send({
    from:    'FreelanceFlow <onboarding@resend.dev>',
    to:      'rodrigosc19@gmail.com',
    replyTo: userEmail,
    subject: `[FreelanceFlow Suporte] ${tipo} — ${userName}`,
    html,
  })

  if (error) {
    console.error('[support] erro ao enviar email:', error)
    return NextResponse.json({ error: 'Erro ao enviar mensagem. Tente novamente.' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
