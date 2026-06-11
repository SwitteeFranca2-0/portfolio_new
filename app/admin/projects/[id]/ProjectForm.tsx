'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import MediaUpload from '@/components/admin/MediaUpload'
import RichTextEditor from '@/components/admin/RichTextEditor'

type Category = { id: string; label: string; order: number }
type Project = {
  id: number; slug: string; title: string; type: string; categoryId: string; year: number
  description: string; body: string|null; outcome: string|null; imageUrl: string|null
  liveUrl: string|null; repoUrl: string|null; featured: boolean; order: number
  stack: { name: string }[]; features: { text: string }[]
  media: { type: string; url: string; caption: string|null }[]
}

export default function ProjectForm({ project, categories }: { project: Project; categories: Category[] }) {
  const router = useRouter()
  const [form, setForm] = useState({
    title:       project.title,
    slug:        project.slug,
    type:        project.type,
    categoryId:  project.categoryId,
    year:        project.year,
    description: project.description,
    body:        project.body ?? '',
    outcome:     project.outcome ?? '',
    imageUrl:    project.imageUrl ?? '',
    liveUrl:     project.liveUrl ?? '',
    repoUrl:     project.repoUrl ?? '',
    featured:    project.featured,
    order:       project.order,
    stack:       project.stack.map(s => s.name).join(', '),
    features:    project.features.map(f => f.text).join('\n'),
    media:       project.media.map(m => ({ type: m.type as 'image'|'video', url: m.url, caption: m.caption ?? '' })),
  })
  const [status, setStatus] = useState<'idle'|'saving'|'saved'|'error'>('idle')
  const [deleteConfirm, setDeleteConfirm] = useState(false)

  const set = (e: React.ChangeEvent<HTMLInputElement|HTMLTextAreaElement|HTMLSelectElement>) => {
    const val = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value
    setForm(f => ({ ...f, [e.target.name]: val }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('saving')
    const res = await fetch(`/api/admin/projects/${project.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        year: Number(form.year),
        order: Number(form.order),
        stack: form.stack.split(',').map(s => s.trim()).filter(Boolean),
        features: form.features.split('\n').map(s => s.trim()).filter(Boolean),
        media: form.media,
      }),
    })
    setStatus(res.ok ? 'saved' : 'error')
    setTimeout(() => setStatus('idle'), 3000)
  }

  const handleDelete = async () => {
    if (!deleteConfirm) { setDeleteConfirm(true); return }
    await fetch(`/api/admin/projects/${project.id}`, { method: 'DELETE' })
    router.push('/admin/projects')
  }

  return (
    <form onSubmit={handleSubmit}>
      {status === 'saved' && <div className="ar-ok">Saved</div>}
      {status === 'error' && <div className="ar-er">Save failed</div>}

      <div className="ar-card">
        <div className="ar-card-t">Core Details</div>
        <div className="ar-g2">
          <div className="ar-field">
            <label className="ar-label">Title</label>
            <input name="title" className="ar-input" value={form.title} onChange={set} required />
          </div>
          <div className="ar-field">
            <label className="ar-label">Slug</label>
            <input name="slug" className="ar-input" value={form.slug} onChange={set} required />
          </div>
          <div className="ar-field">
            <label className="ar-label">Type</label>
            <input name="type" className="ar-input" value={form.type} onChange={set} placeholder="Fullstack · Client" />
          </div>
          <div className="ar-field">
            <label className="ar-label">Category</label>
            <select name="categoryId" className="ar-select" value={form.categoryId} onChange={set}>
              {categories.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
            </select>
          </div>
          <div className="ar-field">
            <label className="ar-label">Year</label>
            <input name="year" type="number" className="ar-input" value={form.year} onChange={set} />
          </div>
          <div className="ar-field">
            <label className="ar-label">Order</label>
            <input name="order" type="number" className="ar-input" value={form.order} onChange={set} />
          </div>
        </div>
        <div className="ar-field">
          <label className="ar-label">Description (short)</label>
          <RichTextEditor
            value={form.description}
            onChange={(html) => setForm(f => ({ ...f, description: html }))}
            placeholder="Short project description..."
            minHeight={80}
          />
        </div>
        <div className="ar-field">
          <label className="ar-label">Body (case study / long description)</label>
          <RichTextEditor
            value={form.body}
            onChange={(html) => setForm(f => ({ ...f, body: html }))}
            placeholder="Full case study or project details..."
            minHeight={200}
          />
        </div>
        <div className="ar-field">
          <label className="ar-label">Outcome</label>
          <input name="outcome" className="ar-input" value={form.outcome} onChange={set} placeholder="Live project — used by..." />
        </div>
      </div>

      <div className="ar-card">
        <div className="ar-card-t">Links & Media</div>
        <div className="ar-field">
          <MediaUpload
            label="Cover Image"
            value={form.imageUrl}
            onChange={(url) => setForm(f => ({ ...f, imageUrl: url }))}
            accept="image/*"
            hint="Main project image shown in cards and hero"
            folder={`projects/${form.slug}`}
          />
        </div>
        <div className="ar-g2">
          <div className="ar-field">
            <label className="ar-label">Live URL</label>
            <input name="liveUrl" className="ar-input" value={form.liveUrl} onChange={set} placeholder="https://..." />
          </div>
          <div className="ar-field">
            <label className="ar-label">Repo URL</label>
            <input name="repoUrl" className="ar-input" value={form.repoUrl} onChange={set} placeholder="https://github.com/..." />
          </div>
        </div>
      </div>

      <div className="ar-card">
        <div className="ar-card-t">Stack & Features</div>
        <div className="ar-field">
          <label className="ar-label">Tech Stack (comma-separated)</label>
          <input name="stack" className="ar-input" value={form.stack} onChange={set} placeholder="Next.js, React, TypeScript" />
        </div>
        <div className="ar-field">
          <label className="ar-label">Key Features (one per line)</label>
          <textarea name="features" className="ar-textarea" value={form.features} onChange={set} />
        </div>
      </div>

      <div className="ar-card">
        <div className="ar-card-t">Media Gallery</div>

        {form.media.map((item, i) => (
          <div key={i} style={{ marginBottom: '1.25rem', padding: '1rem', background: 'rgba(255,255,255,.02)', border: '1px solid rgba(255,255,255,.04)' }}>
            <div className="ar-g2" style={{ marginBottom: '.75rem' }}>
              <div className="ar-field">
                <label className="ar-label">Type</label>
                <select className="ar-select" value={item.type}
                  onChange={e => setForm(f => ({ ...f, media: f.media.map((m, j) => j === i ? { ...m, type: e.target.value as 'image'|'video' } : m) }))}>
                  <option value="image">Image</option>
                  <option value="video">Video (embed URL)</option>
                </select>
              </div>
              <div className="ar-field">
                <label className="ar-label">Caption</label>
                <input className="ar-input" value={item.caption}
                  onChange={e => setForm(f => ({ ...f, media: f.media.map((m, j) => j === i ? { ...m, caption: e.target.value } : m) }))}
                  placeholder="Optional caption" />
              </div>
            </div>

            {item.type === 'video' ? (
              <div className="ar-field">
                <label className="ar-label">Video Embed URL</label>
                <input className="ar-input" value={item.url}
                  onChange={e => setForm(f => ({ ...f, media: f.media.map((m, j) => j === i ? { ...m, url: e.target.value } : m) }))}
                  placeholder="https://www.youtube.com/embed/..." />
              </div>
            ) : (
              <MediaUpload
                label="Image"
                value={item.url}
                onChange={(url) => setForm(f => ({ ...f, media: f.media.map((m, j) => j === i ? { ...m, url } : m) }))}
                accept="image/*"
                folder={`projects/${form.slug}`}
                caption={item.caption}
              />
            )}

            <button type="button" className="ar-btn ar-btn-d" style={{ marginTop: '.5rem' }}
              onClick={() => setForm(f => ({ ...f, media: f.media.filter((_, j) => j !== i) }))}>
              Remove
            </button>
          </div>
        ))}

        <div style={{ display: 'flex', gap: '.75rem', marginTop: '.5rem' }}>
          <button type="button" className="ar-btn ar-btn-o"
            onClick={() => setForm(f => ({ ...f, media: [...f.media, { type: 'image', url: '', caption: '' }] }))}>
            + Add Image
          </button>
          <button type="button" className="ar-btn ar-btn-o"
            onClick={() => setForm(f => ({ ...f, media: [...f.media, { type: 'video', url: '', caption: '' }] }))}>
            + Add Video
          </button>
        </div>
      </div>

      <div className="ar-card">
        <div className="ar-card-t">Landing Page</div>
        <label style={{ display: 'flex', alignItems: 'center', gap: '.75rem', cursor: 'pointer' }}>
          <input type="checkbox" name="featured" checked={form.featured} onChange={set} />
          <span style={{ fontSize: '.875rem', color: '#e8e6f0' }}>Sticky project — shown large on landing page</span>
        </label>
        <p style={{ fontSize: '.75rem', color: '#6b6880', marginTop: '.5rem' }}>
          Only one project can be sticky. Enabling this will automatically unset the current sticky project.
        </p>
      </div>

      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <button type="submit" className="ar-btn ar-btn-p" disabled={status === 'saving'}>
          {status === 'saving' ? 'Saving...' : 'Save Project'}
        </button>
        <button type="button" className="ar-btn ar-btn-d" onClick={handleDelete}>
          {deleteConfirm ? 'Confirm Delete' : 'Delete'}
        </button>
        {deleteConfirm && (
          <button type="button" className="ar-btn ar-btn-o" onClick={() => setDeleteConfirm(false)}>
            Cancel
          </button>
        )}
      </div>
    </form>
  )
}
