'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import styles from './Nav.module.css'

type NavBio = { name: string; resumeUrl?: string | null }

const LINKS = [
  { href: '/', label: 'Home' },
  { href: '/skills', label: 'Skills' },
  { href: '/projects', label: 'Projects' },
  { href: '/experience', label: 'Experience' },
  { href: '/contact', label: 'Contact' },
]

export default function Nav({ bio }: { bio: NavBio }) {
  const [firstName, ...rest] = bio.name.split(' ')
  const lastName = rest.join(' ')
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Lock page scroll and allow Escape to close while the drawer is open
  useEffect(() => {
    if (!menuOpen) return
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setMenuOpen(false)
    const onResize = () => window.innerWidth > 900 && setMenuOpen(false)
    window.addEventListener('keydown', onKey)
    window.addEventListener('resize', onResize)
    return () => {
      document.body.style.overflow = prevOverflow
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('resize', onResize)
    }
  }, [menuOpen])

  const close = () => setMenuOpen(false)

  return (
    <>
      <nav id="main-nav" className={`${styles.nav} ${scrolled && !menuOpen ? styles.scrolled : ''}`}>
        <Link href="/" className={styles.logo} onClick={close}>
          {firstName} <span>{lastName}</span>
        </Link>
        <ul className={styles.links}>
          {LINKS.map(l => <li key={l.href}><Link href={l.href}>{l.label}</Link></li>)}
        </ul>
        <a href={bio.resumeUrl ?? undefined} className={styles.cta} target="_blank" rel="noopener noreferrer">
          Resume ↗
        </a>
        <button
          className={styles.burger}
          onClick={() => setMenuOpen(o => !o)}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          aria-controls="mobile-drawer"
        >
          <span className={`${styles.burgerLine} ${menuOpen ? styles.burgerOpen : ''}`} />
          <span className={`${styles.burgerLine} ${menuOpen ? styles.burgerOpen : ''}`} />
          <span className={`${styles.burgerLine} ${menuOpen ? styles.burgerOpen : ''}`} />
        </button>
      </nav>
      {/* Rendered outside <nav>: the nav's backdrop-filter would otherwise
          become the containing block and clip this fixed overlay to the bar */}
      {menuOpen && (
        <div id="mobile-drawer" className={styles.drawer} onClick={close}>
          {LINKS.map(l => (
            <Link key={l.href} href={l.href} className={styles.drawerLink} onClick={close}>{l.label}</Link>
          ))}
          <a href={bio.resumeUrl ?? undefined} className={styles.drawerCta} target="_blank" rel="noopener noreferrer" onClick={close}>Resume ↗</a>
        </div>
      )}
    </>
  )
}
