import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

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

  // Cria usuário já confirmado — sem enviar nenhum email
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name },
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  const userId = data.user.id

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

  const resend = new Resend(process.env.RESEND_API_KEY)
  await resend.emails.send({
    from:    'FreelanceFlow <contato@freelanceflow.com.br>',
    to:      'rodrigosc19@gmail.com',
    subject: 'Novo usuário cadastrado — FreelanceFlow',
    html:    `<p>Novo cadastro realizado:</p><ul><li><strong>Email:</strong> ${email}</li><li><strong>Nome:</strong> ${full_name}</li><li><strong>Código:</strong> ${freelancer_code}</li><li><strong>Data:</strong> ${new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}</li></ul>`,
  })

  return NextResponse.json({ ok: true })
}
