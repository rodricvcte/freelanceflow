import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: Request) {
  try {
    const body  = await request.json().catch(() => ({}))
    const name  = (body.name  ?? '').trim()
    const email = (body.email ?? '').trim().toLowerCase()

    if (!name || !email) {
      return NextResponse.json({ error: 'Nome e email são obrigatórios.' }, { status: 400 })
    }

    // Usa a chave anon + RLS policy "insert_public" (FOR INSERT TO anon)
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    )

    const { error } = await supabase.from('founder_leads').insert({ name, email })

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ duplicate: true })
      }
      console.error('[founder] supabase error:', JSON.stringify(error))
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[founder] uncaught:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 },
    )
  }
}
