'use client'
import { useState } from 'react'
import { signOut } from 'next-auth/react'

export default function SettingsForm({ currentEmail }: { currentEmail: string }) {
  const [pwForm, setPwForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' })
  const [pwStatus, setPwStatus] = useState<'idle'|'saving'|'saved'|'error'>('idle')
  const [pwError, setPwError] = useState('')

  const setPw = (e: React.ChangeEvent<HTMLInputElement>) =>
    setPwForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setPwError('')

    if (pwForm.newPassword !== pwForm.confirmPassword) {
      setPwError('New passwords do not match')
      setPwStatus('error')
      return
    }

    setPwStatus('saving')
    const res = await fetch('/api/admin/settings/password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ oldPassword: pwForm.oldPassword, newPassword: pwForm.newPassword }),
    })
    if (res.ok) {
      setPwStatus('saved')
      setPwForm({ oldPassword: '', newPassword: '', confirmPassword: '' })
      setTimeout(() => setPwStatus('idle'), 3000)
    } else {
      const data = await res.json().catch(() => null)
      setPwError(data?.error ?? 'Failed to update password')
      setPwStatus('error')
      setTimeout(() => { setPwStatus('idle'); setPwError('') }, 6000)
    }
  }

  const [emailForm, setEmailForm] = useState({ password: '', newEmail: currentEmail })
  const [emailStatus, setEmailStatus] = useState<'idle'|'saving'|'saved'|'error'>('idle')
  const [emailError, setEmailError] = useState('')

  const setEmailField = (e: React.ChangeEvent<HTMLInputElement>) =>
    setEmailForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setEmailStatus('saving')
    setEmailError('')
    const res = await fetch('/api/admin/settings/email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: emailForm.password, newEmail: emailForm.newEmail }),
    })
    if (res.ok) {
      const data = await res.json().catch(() => null)
      if (data?.unchanged) {
        // Email didn't actually change — no need to force a re-login.
        setEmailStatus('saved')
        setTimeout(() => setEmailStatus('idle'), 3000)
        return
      }
      // The current session JWT still carries the old email — force a fresh
      // sign-in so the next session reflects the change.
      await signOut({ callbackUrl: '/admin/login' })
    } else {
      const data = await res.json().catch(() => null)
      setEmailError(data?.error ?? 'Failed to update email')
      setEmailStatus('error')
      setTimeout(() => { setEmailStatus('idle'); setEmailError('') }, 6000)
    }
  }

  return (
    <>
      <div className="ar-card">
        <div className="ar-card-t">Change Password</div>
        {pwStatus === 'saved' && <div className="ar-ok">Password updated</div>}
        {pwStatus === 'error' && <div className="ar-er">{pwError || 'Save failed'}</div>}
        <form onSubmit={handlePasswordSubmit}>
          <div className="ar-field">
            <label className="ar-label">Current Password</label>
            <input
              name="oldPassword" type="password" className="ar-input"
              value={pwForm.oldPassword} onChange={setPw} required autoComplete="current-password"
            />
          </div>
          <div className="ar-g2">
            <div className="ar-field">
              <label className="ar-label">New Password</label>
              <input
                name="newPassword" type="password" className="ar-input"
                value={pwForm.newPassword} onChange={setPw} required minLength={8} autoComplete="new-password"
              />
            </div>
            <div className="ar-field">
              <label className="ar-label">Confirm New Password</label>
              <input
                name="confirmPassword" type="password" className="ar-input"
                value={pwForm.confirmPassword} onChange={setPw} required minLength={8} autoComplete="new-password"
              />
            </div>
          </div>
          <button type="submit" className="ar-btn ar-btn-p" disabled={pwStatus === 'saving'}>
            {pwStatus === 'saving' ? 'Saving...' : 'Update Password'}
          </button>
        </form>
      </div>
      <div className="ar-card">
        <div className="ar-card-t">Change Email</div>
        {emailStatus === 'saved' && <div className="ar-ok">Email unchanged</div>}
        {emailStatus === 'error' && <div className="ar-er">{emailError || 'Save failed'}</div>}
        <form onSubmit={handleEmailSubmit}>
          <div className="ar-field">
            <label className="ar-label">Current Password</label>
            <input
              name="password" type="password" className="ar-input"
              value={emailForm.password} onChange={setEmailField} required autoComplete="current-password"
            />
          </div>
          <div className="ar-field">
            <label className="ar-label">New Email</label>
            <input
              name="newEmail" type="email" className="ar-input"
              value={emailForm.newEmail} onChange={setEmailField} required autoComplete="email"
            />
          </div>
          <button type="submit" className="ar-btn ar-btn-p" disabled={emailStatus === 'saving'}>
            {emailStatus === 'saving' ? 'Saving...' : 'Update Email'}
          </button>
          <p style={{ fontSize: '.75rem', color: '#6b6880', marginTop: '.5rem' }}>
            You'll be signed out after this to refresh your session with the new email.
          </p>
        </form>
      </div>
    </>
  )
}
