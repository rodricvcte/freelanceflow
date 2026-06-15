import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import { buildEmailConfirmationHtml } from '@/lib/email-templates/notification'
import { APP_URL } from '@/lib/app-url'

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

  let resendOk = false
  if (process.env.RESEND_API_KEY) {
    const resend = new Resend(process.env.RESEND_API_KEY)
    const { error: emailError } = await resend.emails.send({
      from:    'FreelanceFlow <contato@freelanceflow.com.br>',
      to:      email,
      replyTo: 'rodrigosc19@gmail.com',
      subject: 'Confirme sua conta — FreelanceFlow',
      html:    buildEmailConfirmationHtml({ name, confirmUrl }),
    })
    if (emailError) {
      console.warn('[resend-confirmation] Resend falhou, usando fallback Supabase:', emailError.message)
    } else {
      resendOk = true
    }
  }

  if (!resendOk) {
    const anonClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    )
    await anonClient.auth.resend({
      type:    'signup',
      email,
      options: { emailRedirectTo: `${APP_URL}/auth/callback` },
    })
  }

  return NextResponse.json({ ok: true })
}
