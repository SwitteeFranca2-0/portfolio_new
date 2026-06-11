'use client'
import { useState } from 'react'
import RichTextEditor from '@/components/admin/RichTextEditor'

type Experience = { id: number; company: string; role: string; startDate: string; endDate?: string | null; description: string; order: number; tags: { name: string }[] }

export default function ExperienceForm({ experience }: { experience: Experience }) {
  const [form, setForm] = useState({
    company:     experience.company,
    role:        experience.role,
    startDate:   experience.startDate,
    endDate:     experience.endDate ?? '',
    description: experience.description,
    order:       experience.order,
  })
  const [tags, setTags] = useState(experience.tags.map(t => t.name).join(', '))
  const [status, setStatus] = useState<'idle'|'saving'|'saved'|'error'>('idle')

  const set = (e: React.ChangeEvent<HTMLInputElement|HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('saving')
    const res = await fetch(`/api/admin/experience/${experience.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        order: Number(form.order),
        endDate: form.endDate || null,
        tags: tags.split(',').map(t => t.trim()).filter(Boolean),
      }),
    })
    setStatus(res.ok ? 'saved' : 'error')
    setTimeout(() => setStatus('idle'), 3000)
  }

  return (
    <form onSubmit={handleSubmit}>
      {status === 'saved' && <div className="ar-ok">Saved</div>}
      {status === 'error'  && <div className="ar-er">Save failed</div>}

      <div className="ar-card">
        <div className="ar-card-t">Position</div>
        <div className="ar-g2">
          <div className="ar-field">
            <label className="ar-label">Company</label>
            <input name="company" className="ar-input" value={form.company} onChange={set} required />
          </div>
          <div className="ar-field">
            <label className="ar-label">Role / Title</label>
            <input name="role" className="ar-input" value={form.role} onChange={set} required />
          </div>
          <div className="ar-field">
            <label className="ar-label">Start Date</label>
            <input name="startDate" className="ar-input" value={form.startDate} onChange={set} placeholder="2023" required />
          </div>
          <div className="ar-field">
            <label className="ar-label">End Date</label>
            <input name="endDate" className="ar-input" value={form.endDate} onChange={set} placeholder="2024 (leave blank = Present)" />
          </div>
          <div className="ar-field">
            <label className="ar-label">Order</label>
            <input name="order" type="number" className="ar-input" value={form.order} onChange={set} />
          </div>
        </div>
        <div className="ar-field">
          <label className="ar-label">Description</label>
          <RichTextEditor
            value={form.description}
            onChange={(html) => setForm(f => ({ ...f, description: html }))}
            placeholder="Role responsibilities and achievements..."
          />
        </div>
        <div className="ar-field">
          <label className="ar-label">Tags (comma-separated)</label>
          <input className="ar-input" value={tags} onChange={e => setTags(e.target.value)} placeholder="React, Python, Node.js" />
        </div>
      </div>

      <button type="submit" className="ar-btn ar-btn-p" disabled={status === 'saving'}>
        {status === 'saving' ? 'Saving...' : 'Save Experience'}
      </button>
    </form>
  )
}
