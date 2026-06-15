import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import { buildEmailConfirmationHtml } from '@/lib/email-templates/notification'

// Prefer explicit server-side URL over NEXT_PUBLIC_ which defaults to localhost in .env.local
const APP_URL =
  process.env.APP_URL ??
  process.env.NEXT_PUBLIC_APP_URL ??
  'https://www.freelanceflow.com.br'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function generateFreelancerCode(fullName: string, serviceClient: any): Promise<string> {
  const parts = fullName.trim().split(/\s+/)
  const first = parts[0][0].toUpperCase()
  const last =
    parts.length >= 2
      ? parts[parts.length - 1][0].toUpperCase()
      : (parts[0][1]?.toUpperCase() ?? first)
  const prefix = first + last

  const { count } = await serviceClient
    .from('profiles')
    .select('id', { count: 'exact', head: true })
    .like('freelancer_code', `${prefix}%`)

  let counter = (count ?? 0) + 1
  let code = `${prefix}${String(counter).padStart(3, '0')}`

  for (let i = 0; i < 100; i++) {
    const { data } = await serviceClient
      .from('profiles')
      .select('id')
      .eq('freelancer_code', code)
      .maybeSingle()
    if (!data) break
    counter++
    code = `${prefix}${String(counter).padStart(3, '0')}`
  }

  return code
}

export async function POST(request: Request) {
  const { email, password } = await request.json()

  if (!email || !password) {
    return NextResponse.json({ error: 'Email e senha são obrigatórios' }, { status: 400 })
  }

  const full_name = email.split('@')[0]

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )

  // Cria o usuário e gera o link de confirmação em um único passo
  const { data, error } = await supabase.auth.admin.generateLink({
    type: 'signup',
    email,
    password,
    options: {
      data: { full_name },
      redirectTo: `${APP_URL}/auth/callback`,
    },
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  const userId     = data.user.id
  const confirmUrl = data.properties.action_link

  // Cria o perfil com código de freelancer
  let freelancer_code: string
  try {
    freelancer_code = await generateFreelancerCode(full_name.trim(), supabase)
  } catch {
    freelancer_code = `U${userId.slice(0, 6).toUpperCase()}`
  }

  await supabase.from('profiles').upsert(
    { id: userId, full_name: full_name.trim(), freelancer_code },
    { onConflict: 'id' }
  )

  // Envia email de confirmação via Resend
  if (!process.env.RESEND_API_KEY) {
    console.error('[register] RESEND_API_KEY não configurada')
    return NextResponse.json({ error: 'Configuração de email ausente no servidor.' }, { status: 500 })
  }

  const resend = new Resend(process.env.RESEND_API_KEY)
  const { error: emailError } = await resend.emails.send({
    from:    'FreelanceFlow <onboarding@resend.dev>',
    to:      email,
    subject: 'Confirme sua conta — FreelanceFlow',
    html:    buildEmailConfirmationHtml({
      name:       full_name.trim().split(/\s+/)[0],
      confirmUrl,
    }),
  })

  if (emailError) {
    console.error('[register] Resend error:', emailError)
    return NextResponse.json(
      { error: `Erro ao enviar email: ${emailError.message}` },
      { status: 500 }
    )
  }

  return NextResponse.json({ ok: true })
}
