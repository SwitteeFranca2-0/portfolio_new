'use client'
import { useState, useEffect } from 'react'
export const dynamic = 'force-dynamic'

type Service = { id: number; title: string; description: string; priceRange: string | null; order: number }
const EMPTY = { title: '', description: '', priceRange: '', order: 0 }

export default function AdminServicesPage() {
  const [items, setItems] = useState<Service[]>([])
  const [form, setForm] = useState({ ...EMPTY })
  const [showAdd, setShowAdd] = useState(false)
  const [editId, setEditId] = useState<number|null>(null)
  const [editForm, setEditForm] = useState({ ...EMPTY })
  const [saving, setSaving] = useState(false)

  useEffect(() => { fetch('/api/admin/services').then(r=>r.json()).then(setItems) }, [])

  const reload = () => fetch('/api/admin/services').then(r=>r.json()).then(setItems)

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true)
    await fetch('/api/admin/services', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ ...form, order: Number(form.order), priceRange: form.priceRange||null }) })
    setForm({...EMPTY}); setShowAdd(false); setSaving(false); reload()
  }

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true)
    await fetch(`/api/admin/services/${editId}`, { method:'PUT', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ ...editForm, order: Number(editForm.order), priceRange: editForm.priceRange||null }) })
    setEditId(null); setSaving(false); reload()
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this service?')) return
    await fetch(`/api/admin/services/${id}`, { method:'DELETE' }); reload()
  }

  const set = (s: typeof form, e: React.ChangeEvent<HTMLInputElement|HTMLTextAreaElement>) => ({ ...s, [e.target.name]: e.target.value })

  return (
    <div>
      <div className="ar-ph">
        <div>
          <div className="ar-eyebrow">Content</div>
          <div className="ar-title">SERVICES</div>
          <div className="ar-sub">Services offered and pricing</div>
        </div>
        <button className="ar-btn ar-btn-p" onClick={() => setShowAdd(s=>!s)}>+ Add Service</button>
      </div>

      {showAdd && (
        <form className="ar-card" onSubmit={handleAdd}>
          <div className="ar-card-t">New Service</div>
          <div className="ar-g2">
            <div className="ar-field"><label className="ar-label">Title</label><input name="title" className="ar-input" value={form.title} onChange={e=>setForm(s=>set(s,e))} required /></div>
            <div className="ar-field"><label className="ar-label">Price Range (optional)</label><input name="priceRange" className="ar-input" value={form.priceRange} onChange={e=>setForm(s=>set(s,e))} placeholder="e.g. $500–$2000" /></div>
            <div className="ar-field"><label className="ar-label">Order</label><input name="order" type="number" className="ar-input" value={form.order} onChange={e=>setForm(s=>set(s,e))} /></div>
          </div>
          <div className="ar-field"><label className="ar-label">Description</label><textarea name="description" className="ar-textarea" value={form.description} onChange={e=>setForm(s=>set(s,e))} style={{minHeight:80}} required /></div>
          <button type="submit" className="ar-btn ar-btn-p" disabled={saving}>{saving?'Saving...':'Save'}</button>
        </form>
      )}

      <div className="ar-tw">
        <table className="ar-table">
          <thead><tr><th>Title</th><th>Price Range</th><th></th></tr></thead>
          <tbody>
            {items.map(item => editId === item.id ? (
              <tr key={item.id}>
                <td colSpan={3}>
                  <form onSubmit={handleEdit} style={{display:'flex',flexDirection:'column',gap:10,padding:'8px 0'}}>
                    <div className="ar-g2">
                      <input name="title" className="ar-input" value={editForm.title} onChange={e=>setEditForm(s=>set(s,e))} placeholder="Title" />
                      <input name="priceRange" className="ar-input" value={editForm.priceRange??''} onChange={e=>setEditForm(s=>set(s,e))} placeholder="Price Range (optional)" />
                      <input name="order" type="number" className="ar-input" value={editForm.order} onChange={e=>setEditForm(s=>set(s,e))} placeholder="Order" />
                    </div>
                    <textarea name="description" className="ar-textarea" value={editForm.description} onChange={e=>setEditForm(s=>set(s,e))} style={{minHeight:70}} placeholder="Description" />
                    <div style={{display:'flex',gap:8}}>
                      <button type="submit" className="ar-btn ar-btn-p" disabled={saving}>{saving?'Saving...':'Save'}</button>
                      <button type="button" className="ar-btn ar-btn-o" onClick={()=>setEditId(null)}>Cancel</button>
                    </div>
                  </form>
                </td>
              </tr>
            ) : (
              <tr key={item.id}>
                <td style={{fontWeight:500}}>{item.title}</td>
                <td style={{fontFamily:"'DM Mono',monospace",fontSize:'.7rem',color:'var(--adm-text-3)'}}>{item.priceRange??'—'}</td>
                <td style={{textAlign:'right',display:'flex',gap:8,justifyContent:'flex-end'}}>
                  <button className="ar-btn ar-btn-o" style={{fontSize:'.65rem'}} onClick={()=>{setEditId(item.id);setEditForm({title:item.title,description:item.description,priceRange:item.priceRange??'',order:item.order})}}>Edit</button>
                  <button className="ar-btn ar-btn-d" style={{fontSize:'.65rem'}} onClick={()=>handleDelete(item.id)}>Delete</button>
                </td>
              </tr>
            ))}
            {items.length===0 && <tr><td colSpan={3} className="ar-empty">No services yet</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  )
}
