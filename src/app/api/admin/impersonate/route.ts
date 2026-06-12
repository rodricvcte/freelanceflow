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

  const service = createServiceClient()
  const { data: { user: targetUser }, error } = await service.auth.admin.getUserById(target_user_id)

  if (error || !targetUser?.email) {
    return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
  }

  // View-as approach: keep admin session intact, just track which user to simulate.
  // All data routes check ff_view_as_id and serve that user's data via the service client.
  const cookieStore = await cookies()
  cookieStore.set('ff_view_as_id',    target_user_id,   COOKIE_OPTS)
  cookieStore.set('ff_view_as_email', targetUser.email, COOKIE_OPTS)
  // Clear any stale cookies from the old session-switching approach
  cookieStore.delete('ff_impersonating_id')
  cookieStore.delete('ff_impersonating_email')
  cookieStore.delete('ff_admin_refresh')

  return NextResponse.json({ success: true })
}
