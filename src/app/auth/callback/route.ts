import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase-service'
import { APP_URL } from '@/lib/app-url'

async function ensureFreelancerCode(userId: string, fullName: string | null) {
  const service = createServiceClient()

  const { data: profile } = await service
    .from('profiles')
    .select('freelancer_code')
    .eq('id', userId)
    .maybeSingle()

  if (profile?.freelancer_code) return

  const name = fullName?.trim() || 'U'
  const parts = name.split(/\s+/)
  const first = parts[0][0].toUpperCase()
  const last =
    parts.length >= 2
      ? parts[parts.length - 1][0].toUpperCase()
      : (parts[0][1]?.toUpperCase() ?? first)
  const prefix = first + last

  const { count } = await service
    .from('profiles')
    .select('id', { count: 'exact', head: true })
    .like('freelancer_code', `${prefix}%`)

  let counter = (count ?? 0) + 1
  let code = `${prefix}${String(counter).padStart(3, '0')}`

  for (let i = 0; i < 100; i++) {
    const { data } = await service
      .from('profiles')
      .select('id')
      .eq('freelancer_code', code)
      .maybeSingle()
    if (!data) break
    counter++
    code = `${prefix}${String(counter).padStart(3, '0')}`
  }

  await service
    .from('profiles')
    .upsert({ id: userId, freelancer_code: code }, { onConflict: 'id' })
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (code) {
    const cookieStore = await cookies()

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          },
        },
      }
    )

    const { data } = await supabase.auth.exchangeCodeForSession(code)

    if (data.user) {
      const fullName =
        data.user.user_metadata?.full_name ??
        data.user.user_metadata?.name ??
        null
      await ensureFreelancerCode(data.user.id, fullName)

      // Salva aceite da política para novos usuários Google
      // (checkbox obrigatório antes de iniciar o fluxo OAuth)
      const service = createServiceClient()
      const { data: profile } = await service
        .from('profiles')
        .select('terms_accepted_at')
        .eq('id', data.user.id)
        .maybeSingle()

      if (!profile?.terms_accepted_at) {
        const ip =
          request.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
          request.headers.get('x-real-ip') ??
          null
        await service
          .from('profiles')
          .update({ terms_accepted_at: new Date().toISOString(), terms_accepted_ip: ip })
          .eq('id', data.user.id)
      }
    }
  }

  return NextResponse.redirect(`${APP_URL}/dashboard`)
}
