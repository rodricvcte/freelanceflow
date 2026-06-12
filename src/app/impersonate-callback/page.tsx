'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase-browser'

// Emergency fallback: reached only if the server-side OTP exchange in
// /api/admin/impersonate fails and we somehow end up here with a hash.
export default function ImpersonateCallbackPage() {
  useEffect(() => {
    const supabase = createClient()

    // Wait for the SIGNED_IN event that fires after createBrowserClient
    // processes the #access_token hash — then hard-reload /dashboard so
    // the server re-renders with the freshly written session cookies.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN') {
        subscription.unsubscribe()
        window.location.replace('/dashboard')
      }
    })

    const timeout = setTimeout(() => {
      subscription.unsubscribe()
      window.location.replace('/dashboard')
    }, 4000)

    return () => {
      subscription.unsubscribe()
      clearTimeout(timeout)
    }
  }, [])

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-[#1D9E75] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm text-gray-500">Estabelecendo sessão...</p>
      </div>
    </div>
  )
}
