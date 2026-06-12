import { cookies } from 'next/headers'

export default async function ImpersonationBar() {
  const cookieStore = await cookies()
  const email = cookieStore.get('ff_impersonating_email')?.value

  if (!email) return null

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
