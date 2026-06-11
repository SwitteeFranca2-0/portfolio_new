'use client'
import { usePathname } from 'next/navigation'
import Nav from './Nav'
import Footer from './Footer'
import Cursor from './Cursor'
import ScrollReveal from '@/components/ui/ScrollReveal'

type NavBio = { name: string; resumeUrl?: string | null }

export default function PublicShell({
  children,
  bio,
}: {
  children: React.ReactNode
  bio: NavBio
}) {
  const pathname = usePathname()

  // Admin pages have their own layout — no portfolio nav/footer/cursor
  if (pathname?.startsWith('/admin')) {
    return <>{children}</>
  }

  return (
    <>
      <Cursor />
      <Nav bio={bio} />
      <ScrollReveal>
        {children}
      </ScrollReveal>
      <Footer />
    </>
  )
}
