'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase-browser'

export default function ImpersonateCallbackPage() {
  useEffect(() => {
    const supabase = createClient()

    // Register listener before getSession so we don't miss the event
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        subscription.unsubscribe()
        // Hard reload so the server re-renders with the new session cookies
        window.location.replace('/dashboard')
      }
    })

    // In case the hash was already processed before the listener registered
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        subscription.unsubscribe()
        window.location.replace('/dashboard')
      }
    })

    // Fallback: redirect anyway after 3s if nothing fired
    const timeout = setTimeout(() => {
      subscription.unsubscribe()
      window.location.replace('/dashboard')
    }, 3000)

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
