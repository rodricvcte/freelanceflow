import { Suspense } from 'react'
import { fetchSidebarData } from '@/lib/sidebar-data'
import Sidebar from '@/components/sidebar'

async function SidebarWithData() {
  const data = await fetchSidebarData()
  const p = data?.profile
  const s = data?.sub
  return (
    <Sidebar initialData={{
      name:      p?.business_name ?? p?.full_name ?? '',
      isPro:     !!s && s.plan === 'pro' && (s.status === 'active' || s.status === 'trialing'),
      email:     data?.email ?? '',
      viewingAs: data?.viewingAs ?? undefined,
    }} />
  )
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Suspense fallback={<Sidebar />}>
        <SidebarWithData />
      </Suspense>
      <main className="flex-1 md:ml-60 min-w-0">
        {children}
      </main>
    </div>
  )
}
