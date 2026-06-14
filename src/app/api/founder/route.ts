import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase-service'

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}))
  const name  = (body.name  ?? '').trim()
  const email = (body.email ?? '').trim().toLowerCase()

  if (!name || !email) {
    return NextResponse.json({ error: 'Nome e email são obrigatórios.' }, { status: 400 })
  }

  const service = createServiceClient()
  const { error } = await service.from('founder_leads').insert({ name, email })

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ duplicate: true })
    }
    console.error('[founder_leads]', error)
    return NextResponse.json({ error: 'Erro ao salvar. Tente novamente.' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
