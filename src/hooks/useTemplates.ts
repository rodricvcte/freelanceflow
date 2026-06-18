'use client'

import { useEffect, useState } from 'react'

export type ApiTemplate = {
  id: string
  title: string
  template_nicho: string
  template_icon: string
  sections: unknown[]
  service_description: string | null
  value: number | null
  payment_terms: string | null
  deadline_days: number | null
  valid_until: string | null
}

export function useTemplates() {
  const [templates, setTemplates] = useState<ApiTemplate[]>([])
  const [loading, setLoading]     = useState(true)

  useEffect(() => {
    fetch('/api/templates')
      .then(r => r.json())
      .then(data => { setTemplates(Array.isArray(data) ? data : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  return { templates, loading }
}
