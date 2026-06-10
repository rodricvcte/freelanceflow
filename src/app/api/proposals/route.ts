import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export async function GET() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabase
    .from('proposals')
    .select('id, title, value, status, created_at, clients(id, name)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(request: Request) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { title, service_description, value, payment_terms, deadline_days, valid_until, client_id } = body

  if (!title?.trim() || !service_description?.trim() || value === undefined || value === '') {
    return NextResponse.json({ error: 'Título, descrição e valor são obrigatórios' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('proposals')
    .insert({
      user_id: user.id,
      title: title.trim(),
      service_description: service_description.trim(),
      value: parseFloat(value),
      payment_terms: payment_terms?.trim() || null,
      deadline_days: deadline_days ? parseInt(deadline_days) : null,
      valid_until: valid_until || null,
      client_id: client_id || null,
      status: 'sent',
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
