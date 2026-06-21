'use client'

import { useRef, useEffect, ReactNode } from 'react'

export default function RevealSection({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const targets = el.querySelectorAll<HTMLElement>('.reveal')
    const observer = new IntersectionObserver(
      entries => entries.forEach(e => {
        if (e.isIntersecting) {
          (e.target as HTMLElement).classList.add('revealed')
          observer.unobserve(e.target)
        }
      }),
      { threshold: 0.12 }
    )
    targets.forEach(t => observer.observe(t))
    return () => observer.disconnect()
  }, [])

  return <div ref={ref} className={className}>{children}</div>
}
