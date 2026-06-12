import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { createServiceClient } from '@/lib/supabase-service'

const ADMIN_EMAIL = 'rodrigosc19@gmail.com'
const COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  path: '/',
  sameSite: 'lax' as const,
  maxAge: 60 * 60 * 8,
}

export async function POST(request: Request) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || user.email !== ADMIN_EMAIL) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { target_user_id } = await request.json()
  if (!target_user_id) {
    return NextResponse.json({ error: 'target_user_id required' }, { status: 400 })
  }

  // Save admin refresh token before switching
  const { data: { session } } = await supabase.auth.getSession()
  const adminRefreshToken = session?.refresh_token

  // Get target user details
  const service = createServiceClient()
  const { data: { user: targetUser }, error: userError } = await service.auth.admin.getUserById(target_user_id)

  if (userError || !targetUser?.email) {
    return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
  }

  // Generate magic link for the target user
  const { data: linkData, error: linkError } = await service.auth.admin.generateLink({
    type: 'magiclink',
    email: targetUser.email,
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/impersonate-callback`,
    },
  })

  if (linkError || !linkData?.properties?.action_link) {
    return NextResponse.json({ error: 'Falha ao gerar link' }, { status: 500 })
  }

  const cookieStore = await cookies()
  cookieStore.set('ff_impersonating_id',    target_user_id,     COOKIE_OPTS)
  cookieStore.set('ff_impersonating_email', targetUser.email,   COOKIE_OPTS)
  if (adminRefreshToken) {
    cookieStore.set('ff_admin_refresh', adminRefreshToken, COOKIE_OPTS)
  }

  return NextResponse.json({ url: linkData.properties.action_link })
}
