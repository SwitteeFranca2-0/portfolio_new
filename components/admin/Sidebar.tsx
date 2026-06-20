'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'

const navItems = [
  { href: '/admin',                 label: 'Dashboard',      icon: '⬡' },
  { section: 'Content' },
  { href: '/admin/bio',             label: 'Bio',            icon: '◉' },
  { href: '/admin/projects',        label: 'Projects',       icon: '▣' },
  { href: '/admin/skills',          label: 'Skills',         icon: '◈' },
  { href: '/admin/experience',      label: 'Experience',     icon: '◑' },
  { href: '/admin/education',       label: 'Education',      icon: '◐' },
  { href: '/admin/services',        label: 'Services',       icon: '◇' },
  { href: '/admin/testimonials',    label: 'Testimonials',   icon: '❝' },
  { href: '/admin/certifications',  label: 'Certifications', icon: '◻' },
  { href: '/admin/stats',           label: 'Stats',          icon: '◆' },
  { href: '/admin/contact',         label: 'Contact',        icon: '◎' },
]

export default function Sidebar() {
  const pathname = usePathname()
  const router   = useRouter()

  const handleSignOut = async () => {
    await fetch('/api/admin/auth/logout', { method: 'POST' })
    router.push('/admin/login')
  }

  return (
    <aside className="ar-side">
      {/* Logo */}
      <div className="ar-logo">
        <div className="ar-logo-mark">FU</div>
        <div>
          <div className="ar-logo-name">Franca Uvere</div>
          <div className="ar-logo-sub">Admin Panel</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="ar-nav">
        {navItems.map((item, i) => {
          if ('section' in item) {
            return <div key={i} className="ar-nav-sec">{item.section}</div>
          }
          const isActive = item.href === '/admin'
            ? pathname === '/admin'
            : pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`ar-link${isActive ? ' active' : ''}`}
            >
              <span className="ar-icon">{item.icon}</span>
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="ar-foot">
        <Link href="/" target="_blank" className="ar-link" style={{ marginBottom: 4 }}>
          <span className="ar-dot" />
          <span style={{ fontSize: 12 }}>View live site ↗</span>
        </Link>
        <button
          onClick={handleSignOut}
          className="ar-link"
          style={{ width: '100%', border: 'none', background: 'none', cursor: 'pointer', textAlign: 'left' }}
        >
          <span className="ar-icon" style={{ opacity: .5 }}>↩</span>
          <span style={{ fontSize: 13 }}>Sign out</span>
        </button>
      </div>
    </aside>
  )
}
