import Sidebar from '@/components/sidebar'
import ImpersonationBar from '@/components/ImpersonationBar'
import ProfileCompleteBanner from '@/components/ProfileCompleteBanner'

export default function DashboardGroupLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <ImpersonationBar />
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <main className="flex-1 md:ml-60 min-w-0">
          <ProfileCompleteBanner />
          {children}
        </main>
      </div>
    </>
  )
}
