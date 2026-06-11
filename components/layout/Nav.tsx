'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import styles from './Nav.module.css'

type NavBio = { name: string; resumeUrl?: string | null }

export default function Nav({ bio }: { bio: NavBio }) {
  const [firstName, ...rest] = bio.name.split(' ')
  const lastName = rest.join(' ')
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const nav = document.getElementById('main-nav')!
    const onScroll = () => nav.classList.toggle(styles.scrolled, window.scrollY > 60)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav id="main-nav" className={styles.nav}>
      <Link href="/" className={styles.logo}>
        {firstName} <span>{lastName}</span>
      </Link>
      <ul className={styles.links}>
        <li><Link href="/">Home</Link></li>
        <li><Link href="/skills">Skills</Link></li>
        <li><Link href="/projects">Projects</Link></li>
        <li><a href="/#experience">Experience</a></li>
        <li><Link href="/contact">Contact</Link></li>
      </ul>
      <a href={bio.resumeUrl ?? undefined} className={styles.cta} target="_blank" rel="noopener noreferrer">
        Resume ↗
      </a>
      <button className={styles.burger} onClick={() => setMenuOpen(o => !o)} aria-label="Menu">
        <span className={`${styles.burgerLine} ${menuOpen ? styles.burgerOpen : ''}`} />
        <span className={`${styles.burgerLine} ${menuOpen ? styles.burgerOpen : ''}`} />
        <span className={`${styles.burgerLine} ${menuOpen ? styles.burgerOpen : ''}`} />
      </button>
      {menuOpen && (
        <div className={styles.drawer} onClick={() => setMenuOpen(false)}>
          <Link href="/" className={styles.drawerLink} onClick={() => setMenuOpen(false)}>Home</Link>
          <Link href="/skills" className={styles.drawerLink} onClick={() => setMenuOpen(false)}>Skills</Link>
          <Link href="/projects" className={styles.drawerLink} onClick={() => setMenuOpen(false)}>Projects</Link>
          <a href="/#experience" className={styles.drawerLink} onClick={() => setMenuOpen(false)}>Experience</a>
          <Link href="/contact" className={styles.drawerLink} onClick={() => setMenuOpen(false)}>Contact</Link>
          <a href={bio.resumeUrl ?? undefined} className={styles.drawerCta} target="_blank" rel="noopener noreferrer" onClick={() => setMenuOpen(false)}>Resume ↗</a>
        </div>
      )}
    </nav>
  )
}
