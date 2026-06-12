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

  // Save admin refresh token BEFORE any session changes
  const { data: { session: adminSession } } = await supabase.auth.getSession()
  const adminRefreshToken = adminSession?.refresh_token

  const service = createServiceClient()

  // Get target user details
  const { data: { user: targetUser }, error: userError } = await service.auth.admin.getUserById(target_user_id)
  if (userError || !targetUser?.email) {
    return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
  }

  // Generate a one-time magic link for the target user
  const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  const { data: linkData, error: linkError } = await service.auth.admin.generateLink({
    type: 'magiclink',
    email: targetUser.email,
    options: { redirectTo: `${APP_URL}/impersonate-callback` },
  })

  if (linkError || !linkData?.properties?.action_link) {
    return NextResponse.json({ error: 'Falha ao gerar link' }, { status: 500 })
  }

  // Extract the raw OTP token from the action_link query string
  // e.g. https://project.supabase.co/auth/v1/verify?token=OTP&type=magiclink&...
  const actionUrl = new URL(linkData.properties.action_link)
  const otpToken  = actionUrl.searchParams.get('token')

  if (!otpToken) {
    return NextResponse.json({ error: 'OTP token ausente no action_link' }, { status: 500 })
  }

  // Verify the OTP server-side via the Supabase auth REST API.
  // POST /auth/v1/verify returns the session JSON directly (no redirect).
  // This is what supabase.auth.verifyOtp() calls internally.
  const verifyRes = await fetch(
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/verify`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      },
      body: JSON.stringify({
        type: 'magiclink',
        token: otpToken,
        email: targetUser.email,
      }),
    }
  )

  if (!verifyRes.ok) {
    const errBody = await verifyRes.text().catch(() => '')
    return NextResponse.json(
      { error: `OTP verification failed: ${errBody}` },
      { status: 500 }
    )
  }

  const tokens = await verifyRes.json() as {
    access_token?: string
    refresh_token?: string
  }

  if (!tokens.access_token || !tokens.refresh_token) {
    return NextResponse.json({ error: 'Tokens ausentes na resposta' }, { status: 500 })
  }

  // Set the target user's session in response cookies via the SSR client.
  // This replaces the admin's current session cookie with the target user's session.
  const sessionClient = await createServerSupabaseClient()
  const { error: setErr } = await sessionClient.auth.setSession({
    access_token:  tokens.access_token,
    refresh_token: tokens.refresh_token,
  })

  if (setErr) {
    return NextResponse.json({ error: `setSession: ${setErr.message}` }, { status: 500 })
  }

  // Persist impersonation metadata so the bar and stop-route can read them
  const cookieStore = await cookies()
  if (adminRefreshToken) {
    cookieStore.set('ff_admin_refresh', adminRefreshToken, COOKIE_OPTS)
  }
  cookieStore.set('ff_impersonating_id',    target_user_id,   COOKIE_OPTS)
  cookieStore.set('ff_impersonating_email', targetUser.email, COOKIE_OPTS)

  // Session is now established server-side in cookies.
  // Client just needs to navigate to /dashboard for a fresh server render.
  return NextResponse.json({ success: true })
}
