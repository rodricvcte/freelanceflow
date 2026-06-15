import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import { buildEmailConfirmationHtml } from '@/lib/email-templates/notification'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

export async function POST(request: Request) {
  const { email, password } = await request.json()

  if (!email || !password) {
    return NextResponse.json({ error: 'Email e senha são obrigatórios' }, { status: 400 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )

  const { data, error } = await supabase.auth.admin.generateLink({
    type: 'signup',
    email,
    password,
    options: { redirectTo: `${APP_URL}/auth/callback` },
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  const confirmUrl = data.properties.action_link
  const name = email.split('@')[0]

  try {
    const resend = new Resend(process.env.RESEND_API_KEY)
    await resend.emails.send({
      from:    'FreelanceFlow <onboarding@resend.dev>',
      to:      email,
      subject: 'Confirme sua conta — FreelanceFlow',
      html:    buildEmailConfirmationHtml({ name, confirmUrl }),
    })
  } catch (emailErr) {
    console.error('[resend-confirmation] erro ao reenviar email:', emailErr)
  }

  return NextResponse.json({ ok: true })
}
