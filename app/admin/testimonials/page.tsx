'use client'
import { useState, useEffect } from 'react'
export const dynamic = 'force-dynamic'

type Testimonial = { id: number; author: string; role: string; company: string; quote: string; featured: boolean; order: number }
const EMPTY = { author: '', role: '', company: '', quote: '', featured: false, order: 0 }

export default function AdminTestimonialsPage() {
  const [items, setItems] = useState<Testimonial[]>([])
  const [form, setForm] = useState({ ...EMPTY })
  const [showAdd, setShowAdd] = useState(false)
  const [editId, setEditId] = useState<number|null>(null)
  const [editForm, setEditForm] = useState({ ...EMPTY })
  const [saving, setSaving] = useState(false)

  useEffect(() => { fetch('/api/admin/testimonials').then(r=>r.json()).then(setItems) }, [])

  const reload = () => fetch('/api/admin/testimonials').then(r=>r.json()).then(setItems)

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true)
    await fetch('/api/admin/testimonials', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ ...form, order: Number(form.order) }) })
    setForm({...EMPTY}); setShowAdd(false); setSaving(false); reload()
  }

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true)
    await fetch(`/api/admin/testimonials/${editId}`, { method:'PUT', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ ...editForm, order: Number(editForm.order) }) })
    setEditId(null); setSaving(false); reload()
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this testimonial?')) return
    await fetch(`/api/admin/testimonials/${id}`, { method:'DELETE' }); reload()
  }

  const setField = (s: typeof form, e: React.ChangeEvent<HTMLInputElement|HTMLTextAreaElement>) => ({ ...s, [e.target.name]: e.target.value })

  return (
    <div>
      <div className="ar-ph">
        <div>
          <div className="ar-eyebrow">Content</div>
          <div className="ar-title">TESTIMONIALS</div>
          <div className="ar-sub">Client and colleague testimonials</div>
        </div>
        <button className="ar-btn ar-btn-p" onClick={() => setShowAdd(s=>!s)}>+ Add Testimonial</button>
      </div>

      {showAdd && (
        <form className="ar-card" onSubmit={handleAdd}>
          <div className="ar-card-t">New Testimonial</div>
          <div className="ar-g2">
            <div className="ar-field"><label className="ar-label">Author</label><input name="author" className="ar-input" value={form.author} onChange={e=>setForm(s=>setField(s,e))} required /></div>
            <div className="ar-field"><label className="ar-label">Role</label><input name="role" className="ar-input" value={form.role} onChange={e=>setForm(s=>setField(s,e))} required /></div>
            <div className="ar-field"><label className="ar-label">Company</label><input name="company" className="ar-input" value={form.company} onChange={e=>setForm(s=>setField(s,e))} required /></div>
            <div className="ar-field"><label className="ar-label">Order</label><input name="order" type="number" className="ar-input" value={form.order} onChange={e=>setForm(s=>setField(s,e))} /></div>
          </div>
          <div className="ar-field"><label className="ar-label">Quote</label><textarea name="quote" className="ar-textarea" value={form.quote} onChange={e=>setForm(s=>setField(s,e))} style={{minHeight:90}} required /></div>
          <div className="ar-field" style={{display:'flex',alignItems:'center',gap:8}}>
            <input type="checkbox" id="add-featured" checked={form.featured} onChange={e=>setForm(s=>({...s,featured:e.target.checked}))} />
            <label htmlFor="add-featured" className="ar-label" style={{marginBottom:0}}>Featured</label>
          </div>
          <button type="submit" className="ar-btn ar-btn-p" disabled={saving}>{saving?'Saving...':'Save'}</button>
        </form>
      )}

      <div className="ar-tw">
        <table className="ar-table">
          <thead><tr><th>Author</th><th>Role / Company</th><th>Featured</th><th></th></tr></thead>
          <tbody>
            {items.map(item => editId === item.id ? (
              <tr key={item.id}>
                <td colSpan={4}>
                  <form onSubmit={handleEdit} style={{display:'flex',flexDirection:'column',gap:10,padding:'8px 0'}}>
                    <div className="ar-g2">
                      <input name="author" className="ar-input" value={editForm.author} onChange={e=>setEditForm(s=>setField(s,e))} placeholder="Author" />
                      <input name="role" className="ar-input" value={editForm.role} onChange={e=>setEditForm(s=>setField(s,e))} placeholder="Role" />
                      <input name="company" className="ar-input" value={editForm.company} onChange={e=>setEditForm(s=>setField(s,e))} placeholder="Company" />
                      <input name="order" type="number" className="ar-input" value={editForm.order} onChange={e=>setEditForm(s=>setField(s,e))} placeholder="Order" />
                    </div>
                    <textarea name="quote" className="ar-textarea" value={editForm.quote} onChange={e=>setEditForm(s=>setField(s,e))} style={{minHeight:70}} placeholder="Quote" />
                    <div style={{display:'flex',alignItems:'center',gap:8}}>
                      <input type="checkbox" id="edit-featured" checked={editForm.featured} onChange={e=>setEditForm(s=>({...s,featured:e.target.checked}))} />
                      <label htmlFor="edit-featured" className="ar-label" style={{marginBottom:0}}>Featured</label>
                    </div>
                    <div style={{display:'flex',gap:8}}>
                      <button type="submit" className="ar-btn ar-btn-p" disabled={saving}>{saving?'Saving...':'Save'}</button>
                      <button type="button" className="ar-btn ar-btn-o" onClick={()=>setEditId(null)}>Cancel</button>
                    </div>
                  </form>
                </td>
              </tr>
            ) : (
              <tr key={item.id}>
                <td style={{fontWeight:500}}>{item.author}</td>
                <td style={{color:'var(--adm-text-3)',fontSize:'.8rem'}}>{item.role} · {item.company}</td>
                <td>{item.featured && <span style={{fontSize:'.65rem',padding:'2px 8px',borderRadius:4,background:'var(--adm-accent)',color:'#fff'}}>Featured</span>}</td>
                <td style={{textAlign:'right',display:'flex',gap:8,justifyContent:'flex-end'}}>
                  <button className="ar-btn ar-btn-o" style={{fontSize:'.65rem'}} onClick={()=>{setEditId(item.id);setEditForm({author:item.author,role:item.role,company:item.company,quote:item.quote,featured:item.featured,order:item.order})}}>Edit</button>
                  <button className="ar-btn ar-btn-d" style={{fontSize:'.65rem'}} onClick={()=>handleDelete(item.id)}>Delete</button>
                </td>
              </tr>
            ))}
            {items.length===0 && <tr><td colSpan={4} className="ar-empty">No testimonials yet</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  )
}
