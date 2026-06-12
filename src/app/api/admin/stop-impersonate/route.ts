import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(request: Request) {
  const cookieStore = await cookies()
  // Clear view-as cookies
  cookieStore.delete('ff_view_as_id')
  cookieStore.delete('ff_view_as_email')
  // Also clear legacy cookies from the old session-switching approach
  cookieStore.delete('ff_impersonating_id')
  cookieStore.delete('ff_impersonating_email')
  cookieStore.delete('ff_admin_refresh')

  const base = new URL(request.url).origin
  return NextResponse.redirect(new URL('/admin', base), { status: 303 })
}
