'use client'
import { useState } from 'react'

type Contact = {
  id: number
  email: string
  location: string
  availability: string
  responseTime: string
  whatsapp: string | null
  github: string | null
  linkedin: string | null
  instagram: string | null
  formEnabled: boolean
}

export default function ContactForm({ contact }: { contact: Contact | null }) {
  const [form, setForm] = useState({
    email:        contact?.email ?? '',
    location:     contact?.location ?? '',
    availability: contact?.availability ?? '',
    responseTime: contact?.responseTime ?? '',
    github:       contact?.github ?? '',
    linkedin:     contact?.linkedin ?? '',
    instagram:    contact?.instagram ?? '',
    whatsapp:     contact?.whatsapp ?? '',
    formEnabled:  contact?.formEnabled ?? true,
  })
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setForm(f => ({ ...f, [e.target.name]: val }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('saving')
    const res = await fetch('/api/admin/contact', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    setStatus(res.ok ? 'saved' : 'error')
    setTimeout(() => setStatus('idle'), 3000)
  }

  return (
    <form onSubmit={handleSubmit}>
      {status === 'saved' && <div className="ar-ok">Saved successfully</div>}
      {status === 'error' && <div className="ar-er">Save failed — try again</div>}

      <div className="ar-card">
        <div className="ar-card-t">Primary Contact</div>
        <div className="ar-g2">
          <div className="ar-field">
            <label className="ar-label">Email</label>
            <input
              name="email"
              type="email"
              className="ar-input"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="ar-field">
            <label className="ar-label">Response Time</label>
            <input name="responseTime" className="ar-input" value={form.responseTime} onChange={handleChange} />
          </div>
          <div className="ar-field">
            <label className="ar-label">Location</label>
            <input name="location" className="ar-input" value={form.location} onChange={handleChange} />
          </div>
          <div className="ar-field">
            <label className="ar-label">Availability</label>
            <input name="availability" className="ar-input" value={form.availability} onChange={handleChange} />
          </div>
        </div>
      </div>

      <div className="ar-card">
        <div className="ar-card-t">Social Links</div>
        <div className="ar-g2">
          {(['github', 'linkedin', 'instagram', 'whatsapp'] as const).map(key => (
            <div key={key} className="ar-field">
              <label className="ar-label">{key.charAt(0).toUpperCase() + key.slice(1)}</label>
              <input
                name={key}
                className="ar-input"
                value={form[key]}
                onChange={handleChange}
                placeholder="https://..."
              />
            </div>
          ))}
        </div>
      </div>

      <div className="ar-card">
        <div className="ar-card-t">Settings</div>
        <label style={{ display: 'flex', alignItems: 'center', gap: '.75rem', cursor: 'pointer' }}>
          <input
            type="checkbox"
            name="formEnabled"
            checked={form.formEnabled}
            onChange={handleChange}
          />
          <span style={{ fontSize: '.875rem', color: '#e8e6f0' }}>
            Enable contact form on /contact page
          </span>
        </label>
      </div>

      <button
        type="submit"
        className="ar-btn ar-btn-p"
        disabled={status === 'saving'}
      >
        {status === 'saving' ? 'Saving...' : 'Save Contact'}
      </button>
    </form>
  )
}
