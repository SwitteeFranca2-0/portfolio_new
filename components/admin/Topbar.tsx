'use client'
import { usePathname } from 'next/navigation'

const labels: Record<string, string> = {
  '/admin':            'dashboard',
  '/admin/bio':        'bio',
  '/admin/projects':   'projects',
  '/admin/skills':     'skills',
  '/admin/experience': 'experience',
  '/admin/contact':    'contact',
}

interface Props {
  actions?: React.ReactNode
}

export default function Topbar({ actions }: Props) {
  const pathname = usePathname()

  // Find best label match
  const label = Object.entries(labels)
    .filter(([path]) => pathname === path || pathname.startsWith(path + '/'))
    .sort((a, b) => b[0].length - a[0].length)[0]?.[1] ?? 'admin'

  const isSubPage = pathname.split('/').length > 3

  return (
    <div className="ar-topbar">
      <div className="ar-crumb">
        admin
        <span style={{ color: '#3a4a5a', margin: '0 2px' }}>/</span>
        {isSubPage ? (
          <>
            <span>{label}</span>
            <span style={{ color: '#3a4a5a', margin: '0 2px' }}>/</span>
            <span className="ar-crumb-a">edit</span>
          </>
        ) : (
          <span className="ar-crumb-a">{label}</span>
        )}
      </div>
      {actions && (
        <div>{actions}</div>
      )}
    </div>
  )
}
