'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

// endpoint is the item's admin API URL, e.g. /api/admin/projects/3
type Props = { endpoint: string; hidden: boolean }

const eyeOpen = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
)

const eyeOff = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M17.94 17.94A10.94 10.94 0 0 1 12 19c-7 0-11-7-11-7a18.5 18.5 0 0 1 4.22-5.22M9.9 4.24A10.94 10.94 0 0 1 12 4c7 0 11 7 11 7a18.5 18.5 0 0 1-2.16 3.19" />
    <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
    <path d="M1 1l22 22" />
  </svg>
)

export default function VisibilityToggle({ endpoint, hidden }: Props) {
  const [busy, setBusy] = useState(false)
  const router = useRouter()

  async function toggle() {
    setBusy(true)
    try {
      await fetch(endpoint, {
        method:  'PUT',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ hidden: !hidden }),
      })
      router.refresh()
    } finally {
      setBusy(false)
    }
  }

  return (
    <button
      onClick={toggle}
      disabled={busy}
      title={hidden ? 'Hidden — click to show on the public site' : 'Visible — click to hide from the public site'}
      style={{
        background: 'none', border: 'none', cursor: busy ? 'default' : 'pointer',
        color: hidden ? '#6b6880' : '#3ECFCF', opacity: busy ? .5 : 1,
        display: 'flex', alignItems: 'center', padding: '2px',
      }}
    >
      {hidden ? eyeOff : eyeOpen}
    </button>
  )
}
