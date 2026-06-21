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
  backgroundStyle: string
  demoMode: boolean
}

const BG_OPTIONS = [
  {
    value: 'laptop',
    label: 'Laptop Journey',
    desc: 'Scroll-driven laptop that opens, spins, and dissolves into a nebula',
    preview: '💻 → ✨',
  },
  {
    value: 'particles',
    label: 'Particle Field',
    desc: 'Scroll-reactive particle cloud with floating geometry and atmospheric colour shifts',
    preview: '✦ ✦ ✦',
  },
]

export default function BioForm({ bio }: { bio: Bio | null }) {
  const [form, setForm] = useState({
    name:         bio?.name ?? '',
    headline:     bio?.headline ?? '',
    tagline:      bio?.tagline ?? '',
    typedRole:    bio?.typedRole ?? '',
    location:     bio?.location ?? '',
    availability: bio?.availability ?? '',
    responseTime: bio?.responseTime ?? '',
    photoUrl:        bio?.photoUrl        ?? '',
    resumeUrl:       bio?.resumeUrl       ?? '',
    backgroundStyle: bio?.backgroundStyle ?? 'laptop',
    demoMode:        bio?.demoMode        ?? false,
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

      {/* ── Demo Mode ── */}
      <div className="ar-card" style={{ borderColor: form.demoMode ? 'rgba(123,94,167,.45)' : 'var(--adm-border)' }}>
        <div className="ar-card-t">Demo Mode</div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <p style={{ fontSize: 13, color: 'var(--adm-text)', marginBottom: 4 }}>
              {form.demoMode ? '🔧 Demo mode is ON — visitors see placeholder data' : '✅ Live mode — visitors see your real content'}
            </p>
            <p style={{ fontSize: 11, color: 'var(--adm-text-3)', lineHeight: 1.5 }}>
              When on, the public site shows the generic sample data from <code style={{ background: 'rgba(255,255,255,.06)', padding: '1px 5px', borderRadius: 3, fontSize: 10 }}>lib/data.ts</code> instead of your database content.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setForm(f => ({ ...f, demoMode: !f.demoMode }))}
            style={{
              flexShrink: 0,
              padding: '8px 20px',
              border: `1px solid ${form.demoMode ? 'rgba(123,94,167,.5)' : 'var(--adm-border-hi)'}`,
              borderRadius: 8,
              background: form.demoMode ? 'rgba(123,94,167,.15)' : 'transparent',
              color: form.demoMode ? '#9966ff' : 'var(--adm-text-2)',
              fontFamily: "'DM Mono', monospace",
              fontSize: 11,
              letterSpacing: '.08em',
              textTransform: 'uppercase',
              cursor: 'pointer',
              transition: 'all .15s',
            }}
          >
            {form.demoMode ? 'Turn Off' : 'Turn On'}
          </button>
        </div>
      </div>

      {/* ── Background Style ── */}
      <div className="ar-card">
        <div className="ar-card-t">Background Style</div>
        <p style={{ fontSize: 12, color: 'var(--adm-text-3)', marginBottom: 16 }}>
          Choose the 3D animated background shown behind the portfolio.
        </p>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {BG_OPTIONS.map(opt => {
            const active = form.backgroundStyle === opt.value
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => setForm(f => ({ ...f, backgroundStyle: opt.value }))}
                style={{
                  flex: 1, minWidth: 200, textAlign: 'left', cursor: 'pointer',
                  background: active ? 'rgba(62,207,207,.08)' : 'rgba(255,255,255,.02)',
                  border: `1px solid ${active ? 'rgba(62,207,207,.5)' : 'var(--adm-border)'}`,
                  borderRadius: 8, padding: '14px 16px',
                  transition: 'all .15s',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 13, fontWeight: 600, color: active ? 'var(--adm-accent)' : 'var(--adm-text)' }}>
                    {opt.label}
                  </span>
                  <span style={{ fontSize: 16 }}>{opt.preview}</span>
                </div>
                <p style={{ fontSize: 11, color: 'var(--adm-text-3)', lineHeight: 1.5, margin: 0 }}>{opt.desc}</p>
                {active && (
                  <div style={{ marginTop: 8, fontFamily: "'DM Mono',monospace", fontSize: 9, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--adm-accent)' }}>
                    ✓ Active
                  </div>
                )}
              </button>
            )
          })}
        </div>
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
