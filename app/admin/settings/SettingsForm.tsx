'use client'
import { useState } from 'react'

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
    </>
  )
}
