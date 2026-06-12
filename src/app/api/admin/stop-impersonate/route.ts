import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

async function clearImpersonateCookies() {
  const cookieStore = await cookies()
  cookieStore.delete('ff_view_as_id')
  cookieStore.delete('ff_view_as_email')
  cookieStore.delete('ff_impersonating_id')
  cookieStore.delete('ff_impersonating_email')
  cookieStore.delete('ff_admin_refresh')
}

export async function POST(request: Request) {
  await clearImpersonateCookies()
  const base = new URL(request.url).origin
  return NextResponse.redirect(new URL('/admin', base), { status: 303 })
}

export async function GET(request: Request) {
  await clearImpersonateCookies()
  const base = new URL(request.url).origin
  return NextResponse.redirect(new URL('/admin', base), { status: 303 })
}
