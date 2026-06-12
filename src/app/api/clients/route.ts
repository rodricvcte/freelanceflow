import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { createServiceClient } from '@/lib/supabase-service'
import { canCreateClient } from '@/lib/plan'
import { getViewAs } from '@/lib/view-as'

export async function GET() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const viewAs      = await getViewAs(user)
  const queryClient = viewAs ? createServiceClient() : supabase
  const userId      = viewAs?.id ?? user.id

  const { data, error } = await queryClient
    .from('clients')
    .select('id, name, email, phone, notes, created_at, proposals(id, value, status)')
    .eq('user_id', userId)
    .order('name')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const enriched = (data ?? []).map(c => {
    const proposals = Array.isArray(c.proposals) ? c.proposals : []
    return {
      id: c.id,
      name: c.name,
      email: c.email,
      phone: c.phone,
      notes: c.notes,
      created_at: c.created_at,
      proposal_count: proposals.length,
      total_value: proposals.reduce((s: number, p: { value: number | null }) => s + (p.value ?? 0), 0),
    }
  })

  return NextResponse.json(enriched)
}

export async function POST(request: Request) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const planCheck = await canCreateClient(user.id, supabase)
  if (!planCheck.allowed) {
    return NextResponse.json(
      {
        error: `Limite do plano Free atingido (${planCheck.used}/${planCheck.limit} clientes). Faça upgrade para o plano Pro.`,
        code: 'PLAN_LIMIT_REACHED',
        used: planCheck.used,
        limit: planCheck.limit,
      },
      { status: 403 }
    )
  }

  const body = await request.json()
  const { name, email, phone } = body

  if (!name?.trim()) return NextResponse.json({ error: 'Nome é obrigatório' }, { status: 400 })

  const { data, error } = await supabase
    .from('clients')
    .insert({ user_id: user.id, name: name.trim(), email: email?.trim() || null, phone: phone?.trim() || null })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
