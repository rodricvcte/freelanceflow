import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export async function GET() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabase
    .from('follow_ups')
    .select(`
      id, type, trigger_rule, scheduled_for, sent_at, created_at,
      proposals (
        id, title, value, status, token,
        clients ( id, name )
      )
    `)
    .eq('user_id', user.id)
    .order('scheduled_for', { ascending: true, nullsFirst: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data ?? [])
}

export async function POST(request: Request) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { proposal_id, type = 'email', scheduled_for } = body

  if (!proposal_id) return NextResponse.json({ error: 'proposal_id é obrigatório' }, { status: 400 })
  if (!['whatsapp', 'email'].includes(type)) return NextResponse.json({ error: 'type inválido' }, { status: 400 })

  // Verify ownership
  const { data: proposal } = await supabase
    .from('proposals')
    .select('id')
    .eq('id', proposal_id)
    .eq('user_id', user.id)
    .single()

  if (!proposal) return NextResponse.json({ error: 'Proposta não encontrada' }, { status: 404 })

  const { data, error } = await supabase
    .from('follow_ups')
    .insert({
      proposal_id,
      user_id: user.id,
      type,
      trigger_rule: 'manual',
      scheduled_for: scheduled_for ?? null,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
