'use client'

import { useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'

export default function PixelCompleteRegistration() {
  const params = useSearchParams()
  const router = useRouter()

  useEffect(() => {
    if (params.get('registered') !== '1') return
    ;(window as unknown as { fbq?: (...args: unknown[]) => void }).fbq?.('track', 'CompleteRegistration')
    router.replace('/dashboard')
  }, [params, router])

  return null
}
