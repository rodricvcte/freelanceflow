import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { createServiceClient } from '@/lib/supabase-service'
import { TEMPLATES } from '@/lib/templates-seed'

const ADMIN_EMAIL = 'rodrigosc19@gmail.com'

export async function POST() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.email !== ADMIN_EMAIL) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
  }

  const service = createServiceClient()

  const results: { nicho: string; status: 'inserted' | 'skipped' }[] = []

  for (const tmpl of TEMPLATES) {
    // Skip if a template for this nicho already exists
    const { data: existing } = await service
      .from('proposals')
      .select('id')
      .eq('is_template', true)
      .eq('template_nicho', tmpl.template_nicho)
      .is('user_id', null)
      .maybeSingle()

    if (existing) {
      results.push({ nicho: tmpl.template_nicho, status: 'skipped' })
      continue
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { preview_bullets, ...dbFields } = tmpl

    const { error } = await service.from('proposals').insert(dbFields)
    if (error) {
      return NextResponse.json(
        { error: `Falha ao inserir "${tmpl.template_nicho}": ${error.message}` },
        { status: 500 }
      )
    }

    results.push({ nicho: tmpl.template_nicho, status: 'inserted' })
  }

  return NextResponse.json({ ok: true, results })
}
