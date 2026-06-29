import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const ADMIN_EMAIL   = 'rodrigosc19@gmail.com'
const publicRoutes  = ['/', '/login', '/cadastro', '/fundador', '/auth/callback', '/privacidade', '/esqueci-senha', '/redefinir-senha']

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  // Supabase redireciona erros OAuth para o Site URL (/) com ?error=...
  // Captura aqui e manda pro login com mensagem amigável
  if (pathname === '/' && request.nextUrl.searchParams.get('error')) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.search = ''
    url.searchParams.set('auth_error', '1')
    return NextResponse.redirect(url)
  }

  const isPublicRoute =
    publicRoutes.includes(pathname) ||
    pathname.startsWith('/p/') ||
    pathname.startsWith('/api/p/') ||
    pathname.startsWith('/api/track/') ||
    pathname.startsWith('/api/webhooks/') ||
    pathname.startsWith('/blog') ||
    pathname.startsWith('/modelos-de-proposta')

  const isAuthRoute    = pathname.startsWith('/login') || pathname.startsWith('/cadastro')
  const isApiRoute     = pathname.startsWith('/api/')
  const isAdminRoute   = pathname.startsWith('/admin')

  // Block /admin for non-admin users
  if (isAdminRoute && user?.email !== ADMIN_EMAIL) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  if (!user && !isPublicRoute && !isApiRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  if (user && isAuthRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|sitemap\\.xml|robots\\.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
