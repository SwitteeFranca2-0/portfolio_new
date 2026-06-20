'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import MediaUpload from '@/components/admin/MediaUpload'

type Category = { id: string; label: string; order: number }

export default function NewProjectForm({ categories, nextOrder }: { categories: Category[]; nextOrder: number }) {
  const router = useRouter()
  const [form, setForm] = useState({
    title: '', slug: '', type: '', categoryId: categories[0]?.id ?? 'software',
    year: new Date().getFullYear(), description: '', body: '', outcome: '',
    imageUrl: '', liveUrl: '', repoUrl: '', featured: false,
    order: nextOrder, stack: '', features: '',
    media: [] as { type: 'image'|'video'; url: string; caption: string }[],
  })
  const [status, setStatus] = useState<'idle'|'saving'|'error'>('idle')

  const set = (e: React.ChangeEvent<HTMLInputElement|HTMLTextAreaElement|HTMLSelectElement>) => {
    const val = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value
    setForm(f => ({ ...f, [e.target.name]: val }))
  }

  // Auto-generate slug from title
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
    setForm(f => ({ ...f, title, slug }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('saving')
    const res = await fetch('/api/admin/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        year: Number(form.year),
        order: Number(form.order),
        stack: form.stack.split(',').map((s: string) => s.trim()).filter(Boolean),
        features: form.features.split('\n').map((s: string) => s.trim()).filter(Boolean),
        media: form.media,
      }),
    })
    if (res.ok) {
      const project = await res.json()
      router.push(`/admin/projects/${project.id}`)
    } else {
      setStatus('error')
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {status === 'error' && <div className="ar-er">Failed to create project</div>}
      <div className="ar-card">
        <div className="ar-card-t">Core Details</div>
        <div className="ar-g2">
          <div className="ar-field">
            <label className="ar-label">Title</label>
            <input name="title" className="ar-input" value={form.title} onChange={handleTitleChange} required />
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
        </div>
        <div className="ar-field">
          <label className="ar-label">Description</label>
          <textarea name="description" className="ar-textarea" value={form.description} onChange={set} style={{ minHeight: 80 }} />
        </div>
      </div>
      <div className="ar-card">
        <div className="ar-card-t">Links</div>
        <div className="ar-g2">
          <div className="ar-field"><label className="ar-label">Image URL</label><input name="imageUrl" className="ar-input" value={form.imageUrl} onChange={set} /></div>
          <div className="ar-field"><label className="ar-label">Live URL</label><input name="liveUrl" className="ar-input" value={form.liveUrl} onChange={set} /></div>
        </div>
      </div>
      <div className="ar-card">
        <div className="ar-card-t">Stack & Features</div>
        <div className="ar-field"><label className="ar-label">Stack (comma-separated)</label><input name="stack" className="ar-input" value={form.stack} onChange={set} /></div>
        <div className="ar-field"><label className="ar-label">Features (one per line)</label><textarea name="features" className="ar-textarea" value={form.features} onChange={set} /></div>
      </div>
      <div className="ar-card">
        <div className="ar-card-t">Media Gallery</div>

        {form.media.map((item, i) => (
          <div key={i} style={{ marginBottom: '1.25rem', padding: '1rem', background: 'rgba(255,255,255,.02)', border: '1px solid rgba(255,255,255,.04)', borderRadius: 8 }}>
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

      <button type="submit" className="ar-btn ar-btn-p" disabled={status === 'saving'}>
        {status === 'saving' ? 'Creating...' : 'Create Project'}
      </button>
    </form>
  )
}
