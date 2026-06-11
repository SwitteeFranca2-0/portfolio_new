'use client'
import { useState } from 'react'
import MediaUpload from '@/components/admin/MediaUpload'
import RichTextEditor from '@/components/admin/RichTextEditor'

type Bio = {
  id: number
  name: string
  headline: string
  tagline: string
  typedRole: string
  location: string
  availability: string
  responseTime: string
  photoUrl: string | null
  resumeUrl: string | null
}

export default function BioForm({ bio }: { bio: Bio | null }) {
  const [form, setForm] = useState({
    name:         bio?.name ?? '',
    headline:     bio?.headline ?? '',
    tagline:      bio?.tagline ?? '',
    typedRole:    bio?.typedRole ?? '',
    location:     bio?.location ?? '',
    availability: bio?.availability ?? '',
    responseTime: bio?.responseTime ?? '',
    photoUrl:     bio?.photoUrl ?? '',
    resumeUrl:    bio?.resumeUrl ?? '',
  })
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('saving')
    const res = await fetch('/api/admin/bio', {
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
        <div className="ar-card-t">Identity</div>
        <div className="ar-g2">
          <div className="ar-field">
            <label className="ar-label">Full Name</label>
            <input name="name" className="ar-input" value={form.name} onChange={handleChange} required />
          </div>
          <div className="ar-field">
            <label className="ar-label">Typed Role (hero animation)</label>
            <input name="typedRole" className="ar-input" value={form.typedRole} onChange={handleChange} />
          </div>
        </div>
        <div className="ar-field">
          <label className="ar-label">Headline (nav tag)</label>
          <input name="headline" className="ar-input" value={form.headline} onChange={handleChange} />
        </div>
        <div className="ar-field">
          <label className="ar-label">Tagline (hero subtitle)</label>
          <RichTextEditor
            value={form.tagline}
            onChange={(html) => setForm(f => ({ ...f, tagline: html }))}
            placeholder="Hero subtitle paragraph..."
            minHeight={100}
          />
        </div>
      </div>

      <div className="ar-card">
        <div className="ar-card-t">Details</div>
        <div className="ar-g2">
          <div className="ar-field">
            <label className="ar-label">Location</label>
            <input name="location" className="ar-input" value={form.location} onChange={handleChange} />
          </div>
          <div className="ar-field">
            <label className="ar-label">Availability</label>
            <input name="availability" className="ar-input" value={form.availability} onChange={handleChange} />
          </div>
          <div className="ar-field">
            <label className="ar-label">Response Time</label>
            <input name="responseTime" className="ar-input" value={form.responseTime} onChange={handleChange} />
          </div>
        </div>
      </div>

      <div className="ar-card">
        <div className="ar-card-t">Media</div>
        <div className="ar-field">
          <MediaUpload
            label="Photo"
            value={form.photoUrl}
            onChange={(url) => setForm(f => ({ ...f, photoUrl: url }))}
            accept="image/*"
            hint="Profile photo — appears in the hero section"
            folder="profile"
          />
        </div>
        <MediaUpload
          label="Resume PDF"
          value={form.resumeUrl}
          onChange={(url) => setForm(f => ({ ...f, resumeUrl: url }))}
          accept="application/pdf"
          hint="PDF — shown as download link in nav"
          folder="resume"
        />
      </div>

      <button
        type="submit"
        className="ar-btn ar-btn-p"
        disabled={status === 'saving'}
      >
        {status === 'saving' ? 'Saving...' : 'Save Bio'}
      </button>
    </form>
  )
}
