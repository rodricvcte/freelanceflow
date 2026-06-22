'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-browser'
import UpgradeModal from '@/components/UpgradeModal'

const nav = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 9.75L12 3l9 6.75V20.25a.75.75 0 01-.75.75H15v-6H9v6H3.75a.75.75 0 01-.75-.75V9.75z" />
      </svg>
    ),
  },
  {
    label: 'Propostas',
    href: '/propostas',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    label: 'Clientes',
    href: '/clientes',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    label: 'Follow-ups',
    href: '/follow-ups',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>
    ),
  },
  {
    label: 'Modelos',
    href: '/modelos',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    label: 'Configurações',
    href: '/configuracoes',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
]

const ADMIN_EMAIL = 'rodrigosc19@gmail.com'

type UserInfo = { name: string; isPro: boolean; email: string; viewingAs?: string }

export default function Sidebar({ initialData }: { initialData?: UserInfo }) {
  const [open, setOpen]               = useState(false)
  const [userInfo, setUserInfo]       = useState<UserInfo | null>(initialData ?? null)
  const [showUpgrade, setShowUpgrade] = useState(false)
  const pathname = usePathname()
  const router   = useRouter()

  // Fetch client-side apenas quando não há dados do servidor (ex.: layout do admin).
  // Nunca re-busca em cada navegação — elimina o gargalo de 3 requests por troca de página.
  const hasServerData = !!initialData
  useEffect(() => {
    if (hasServerData) return
    const supabase = createClient()
    Promise.all([
      fetch('/api/profile',       { cache: 'no-store' }).then(r => r.json()).catch(() => ({})),
      fetch('/api/subscriptions', { cache: 'no-store' }).then(r => r.json()).catch(() => ({})),
      supabase.auth.getUser(),
    ]).then(([profile, sub, { data: { user } }]) => {
      setUserInfo({
        name:  (profile.business_name ?? profile.full_name ?? '') as string,
        isPro: sub.plan === 'pro' && (sub.status === 'active' || sub.status === 'trialing'),
        email: user?.email ?? '',
      })
    })
  }, [hasServerData])

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  const isActive = (href: string) =>
    pathname === href || (href !== '/dashboard' && pathname.startsWith(href))

  return (
    <>
      <UpgradeModal open={showUpgrade} onClose={() => setShowUpgrade(false)} />

      {/* Hamburger — mobile */}
      <button
        onClick={() => setOpen(true)}
        aria-label="Abrir menu"
        className="fixed top-4 left-4 z-50 p-2 rounded-lg bg-white border border-gray-200 shadow-sm md:hidden"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Mobile overlay */}
      {open && (
        <div className="fixed inset-0 bg-black/40 z-40 md:hidden" onClick={() => setOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={[
        'fixed top-0 left-0 h-screen w-60 bg-white border-r border-gray-200 z-50 flex flex-col',
        'transition-transform duration-300 ease-in-out',
        'md:translate-x-0',
        open ? 'translate-x-0' : '-translate-x-full',
      ].join(' ')}>

        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-gray-100">
          <span className="text-lg font-bold text-[#1D9E75] tracking-tight">FreelanceFlow</span>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
          {nav.map(item => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={[
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                isActive(item.href)
                  ? 'bg-[#1D9E75]/10 text-[#1D9E75]'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
              ].join(' ')}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}

          {/* Admin — visível apenas para rodrigosc19@gmail.com */}
          {userInfo?.email === ADMIN_EMAIL && (
            <>
              <div className="my-2 border-t border-gray-100" />
              <Link
                href="/admin"
                onClick={() => setOpen(false)}
                className={[
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  isActive('/admin')
                    ? 'bg-purple-50 text-purple-700'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900',
                ].join(' ')}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                Admin
              </Link>
            </>
          )}
        </nav>

        {/* User / plan footer */}
        <div className="p-4 border-t border-gray-100">
          {userInfo ? (
            <Link
              href="/configuracoes?tab=plano"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="w-7 h-7 rounded-full bg-[#1D9E75]/10 flex items-center justify-center shrink-0">
                <span className="text-xs font-bold text-[#1D9E75]">
                  {(userInfo.name || 'U').charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-700 truncate">
                  {userInfo.name || 'Meu perfil'}
                </p>
                {userInfo.isPro ? (
                  <span className="inline-flex items-center text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-[#1D9E75] text-white leading-none mt-0.5">
                    FreelanceFlow Pro
                  </span>
                ) : (
                  <span className="text-[10px] text-gray-400">FreelanceFlow Free</span>
                )}
                {userInfo.email && (
                  <p className="text-[11px] text-gray-400 truncate mt-0.5">{userInfo.email}</p>
                )}
              </div>
            </Link>
          ) : (
            <p className="text-xs text-gray-400 text-center py-1">FreelanceFlow v0.1</p>
          )}

          {/* Upgrade banner — free users only */}
          {userInfo && !userInfo.isPro && (
            <div className="mt-1 mb-1 px-2 py-2 bg-amber-50 border border-amber-200 rounded-lg flex items-center justify-between gap-2">
              <p className="text-[11px] text-amber-700 leading-tight">Plano Free</p>
              <button
                onClick={() => setShowUpgrade(true)}
                className="shrink-0 text-[11px] font-semibold text-white bg-[#1D9E75] px-2 py-0.5 rounded-full hover:bg-[#188f68] transition-colors"
              >
                Upgrade
              </button>
            </div>
          )}

          {/* Indicador discreto de impersonação */}
          {userInfo?.viewingAs && (
            <div className="mt-1 mb-1 px-2 py-1.5 rounded-lg bg-purple-50 border border-purple-200 flex items-center justify-between gap-1.5">
              <div className="flex items-center gap-1.5 min-w-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-purple-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <span className="text-[11px] text-purple-700 truncate">{userInfo.viewingAs}</span>
              </div>
              <form action="/api/admin/stop-impersonate" method="post">
                <button type="submit" className="text-[10px] font-medium text-purple-500 hover:text-purple-800 shrink-0 transition-colors">
                  sair
                </button>
              </form>
            </div>
          )}

          <div className="border-t border-gray-100 my-1" />
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-sm font-medium text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Sair
          </button>
        </div>
      </aside>
    </>
  )
}
