import { Suspense } from 'react'
import { fetchSidebarData } from '@/lib/sidebar-data'
import Sidebar from '@/components/sidebar'
import ProfileCompleteBanner from '@/components/ProfileCompleteBanner'
import PixelCompleteRegistration from '@/components/PixelCompleteRegistration'

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

async function BannerWithData() {
  const data = await fetchSidebarData()
  const p = data?.profile
  if (!p) return <ProfileCompleteBanner initialPercent={null} />
  const vals   = [p.full_name, p.business_name, p.phone, p.address, p.cpf_cnpj, p.email_business]
  const filled = vals.filter(v => typeof v === 'string' && (v as string).trim() !== '').length
  return <ProfileCompleteBanner initialPercent={Math.round((filled / 6) * 100)} />
}

export default function DashboardGroupLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Suspense fallback={<Sidebar />}>
        <SidebarWithData />
      </Suspense>
      <main className="flex-1 md:ml-60 min-w-0 pt-16 md:pt-0">
        <Suspense fallback={null}>
          <BannerWithData />
        </Suspense>
        {children}
        <Suspense fallback={null}>
          <PixelCompleteRegistration />
        </Suspense>
      </main>
    </div>
  )
}
