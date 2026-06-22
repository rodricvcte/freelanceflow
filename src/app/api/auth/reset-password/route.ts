import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase-service'

export async function POST(request: Request) {
  const { email } = await request.json()

  if (!email || typeof email !== 'string') {
    return NextResponse.json({ error: 'Email inválido.' }, { status: 400 })
  }

  const normalized = email.toLowerCase().trim()
  const supabase = createServiceClient()

  // Verifica se o email existe em auth.users via admin API
  const { data, error: listError } = await supabase.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  })

  if (listError) {
    return NextResponse.json({ error: 'Erro interno. Tente novamente.' }, { status: 500 })
  }

  const exists = data.users.some(u => u.email?.toLowerCase() === normalized)

  if (!exists) {
    return NextResponse.json({ error: 'Este e-mail não está cadastrado.' }, { status: 404 })
  }

  // Email existe — o envio é feito pelo browser para manter o PKCE verifier no cliente
  return NextResponse.json({ ok: true })
}
