'use client'

import { useState } from 'react'

export default function ImpersonateButton({ userId, email }: { userId: string; email: string }) {
  const [loading, setLoading] = useState(false)

  async function handleClick() {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/impersonate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target_user_id: userId }),
      })
      const data = await res.json()

      if (data.success) {
        // Session cookies were set server-side in the response above.
        // A hard navigation to /dashboard makes the browser send the new cookies
        // so the server renders the page as the target user from the very first request.
        window.location.href = '/dashboard'
      } else {
        alert(data.error ?? 'Erro ao iniciar impersonation')
        setLoading(false)
      }
    } catch {
      alert('Erro de conexão')
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      title={`Entrar como ${email}`}
      className="px-2.5 py-1 text-xs font-medium text-[#1D9E75] border border-[#1D9E75]/30 rounded-lg hover:bg-[#1D9E75]/5 transition-colors disabled:opacity-50 whitespace-nowrap"
    >
      {loading ? '...' : 'Entrar como'}
    </button>
  )
}
