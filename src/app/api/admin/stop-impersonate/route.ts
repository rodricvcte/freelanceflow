import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export async function POST(request: Request) {
  const cookieStore = await cookies()
  const adminRefreshToken = cookieStore.get('ff_admin_refresh')?.value

  if (adminRefreshToken) {
    const supabase = await createServerSupabaseClient()
    await supabase.auth.refreshSession({ refresh_token: adminRefreshToken })
  }

  cookieStore.delete('ff_impersonating_id')
  cookieStore.delete('ff_impersonating_email')
  cookieStore.delete('ff_admin_refresh')

  const base = new URL(request.url).origin
  return NextResponse.redirect(new URL('/admin', base), { status: 303 })
}
