'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

type Category = { id: string; label: string; order: number }

export default function NewProjectForm({ categories, nextOrder }: { categories: Category[]; nextOrder: number }) {
  const router = useRouter()
  const [form, setForm] = useState({
    title: '', slug: '', type: '', categoryId: categories[0]?.id ?? 'software',
    year: new Date().getFullYear(), description: '', body: '', outcome: '',
    imageUrl: '', liveUrl: '', repoUrl: '', featured: false,
    order: nextOrder, stack: '', features: '',
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
      <button type="submit" className="ar-btn ar-btn-p" disabled={status === 'saving'}>
        {status === 'saving' ? 'Creating...' : 'Create Project'}
      </button>
    </form>
  )
}
