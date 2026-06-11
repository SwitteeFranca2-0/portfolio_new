'use client'
import { useEffect, useRef } from 'react'

export default function ScrollReveal({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const targets = el.querySelectorAll<HTMLElement>('.reveal')
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry, i) => {
          if (entry.isIntersecting) {
            setTimeout(() => entry.target.classList.add('in'), i * 80)
          }
        })
      },
      { threshold: 0.1 }
    )
    targets.forEach((t) => obs.observe(t))
    return () => obs.disconnect()
  }, [])

  return <div ref={ref} style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>{children}</div>
}
