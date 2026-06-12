import { cookies } from 'next/headers'
import { createServerSupabaseClient } from '@/lib/supabase-server'

const ADMIN_EMAIL = 'rodrigosc19@gmail.com'

export default async function ImpersonationBar() {
  const cookieStore = await cookies()
  const email = cookieStore.get('ff_view_as_email')?.value

  if (!email) return null

  // Bug fix: verify the current auth session is actually the admin.
  // A stale cookie from a previous session must not show the bar.
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user?.email !== ADMIN_EMAIL) return null

  return (
    <div className="fixed top-0 left-0 right-0 z-[200] flex items-center justify-between gap-4 px-4 py-2 bg-amber-400 text-amber-900 text-sm font-medium shadow-md">
      <span>⚠️ Visualizando como <strong>{email}</strong></span>
      <form action="/api/admin/stop-impersonate" method="post">
        <button
          type="submit"
          className="px-3 py-1 text-xs font-semibold bg-amber-900/20 hover:bg-amber-900/30 rounded-md transition-colors"
        >
          Voltar para admin
        </button>
      </form>
    </div>
  )
}
