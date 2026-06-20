'use client'
import { useState, useEffect } from 'react'
export const dynamic = 'force-dynamic'

type Edu = { id: number; institution: string; degree: string; startDate: string; endDate: string | null; description: string | null; order: number }
const EMPTY = { institution: '', degree: '', startDate: '', endDate: '', description: '', order: 0 }

export default function AdminEducationPage() {
  const [items, setItems] = useState<Edu[]>([])
  const [form, setForm] = useState({ ...EMPTY })
  const [showAdd, setShowAdd] = useState(false)
  const [editId, setEditId] = useState<number|null>(null)
  const [editForm, setEditForm] = useState({ ...EMPTY })
  const [saving, setSaving] = useState(false)

  useEffect(() => { fetch('/api/admin/education').then(r=>r.json()).then(setItems) }, [])

  const reload = () => fetch('/api/admin/education').then(r=>r.json()).then(setItems)

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true)
    await fetch('/api/admin/education', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ ...form, order: Number(form.order), endDate: form.endDate||null, description: form.description||null }) })
    setForm({...EMPTY}); setShowAdd(false); setSaving(false); reload()
  }

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true)
    await fetch(`/api/admin/education/${editId}`, { method:'PUT', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ ...editForm, order: Number(editForm.order), endDate: editForm.endDate||null, description: editForm.description||null }) })
    setEditId(null); setSaving(false); reload()
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this entry?')) return
    await fetch(`/api/admin/education/${id}`, { method:'DELETE' }); reload()
  }

  const set = (s: typeof form, e: React.ChangeEvent<HTMLInputElement|HTMLTextAreaElement>) => ({ ...s, [e.target.name]: e.target.value })

  return (
    <div>
      <div className="ar-ph">
        <div>
          <div className="ar-eyebrow">Content</div>
          <div className="ar-title">EDUCATION</div>
          <div className="ar-sub">Academic background and qualifications</div>
        </div>
        <button className="ar-btn ar-btn-p" onClick={() => setShowAdd(s=>!s)}>+ Add Entry</button>
      </div>

      {showAdd && (
        <form className="ar-card" onSubmit={handleAdd}>
          <div className="ar-card-t">New Entry</div>
          <div className="ar-g2">
            <div className="ar-field"><label className="ar-label">Institution</label><input name="institution" className="ar-input" value={form.institution} onChange={e=>setForm(s=>set(s,e))} required /></div>
            <div className="ar-field"><label className="ar-label">Degree</label><input name="degree" className="ar-input" value={form.degree} onChange={e=>setForm(s=>set(s,e))} required /></div>
            <div className="ar-field"><label className="ar-label">Start Date</label><input name="startDate" className="ar-input" value={form.startDate} onChange={e=>setForm(s=>set(s,e))} placeholder="2020" required /></div>
            <div className="ar-field"><label className="ar-label">End Date</label><input name="endDate" className="ar-input" value={form.endDate} onChange={e=>setForm(s=>set(s,e))} placeholder="2024 (blank = present)" /></div>
          </div>
          <div className="ar-field"><label className="ar-label">Description</label><textarea name="description" className="ar-textarea" value={form.description ?? ''} onChange={e=>setForm(s=>set(s,e))} style={{minHeight:70}} /></div>
          <button type="submit" className="ar-btn ar-btn-p" disabled={saving}>{saving?'Saving...':'Save'}</button>
        </form>
      )}

      <div className="ar-tw">
        <table className="ar-table">
          <thead><tr><th>Institution</th><th>Degree</th><th>Period</th><th></th></tr></thead>
          <tbody>
            {items.map(item => editId === item.id ? (
              <tr key={item.id}>
                <td colSpan={4}>
                  <form onSubmit={handleEdit} style={{display:'flex',flexDirection:'column',gap:10,padding:'8px 0'}}>
                    <div className="ar-g2">
                      <input name="institution" className="ar-input" value={editForm.institution} onChange={e=>setEditForm(s=>set(s,e))} />
                      <input name="degree" className="ar-input" value={editForm.degree} onChange={e=>setEditForm(s=>set(s,e))} />
                      <input name="startDate" className="ar-input" value={editForm.startDate} onChange={e=>setEditForm(s=>set(s,e))} placeholder="Start" />
                      <input name="endDate" className="ar-input" value={editForm.endDate??''} onChange={e=>setEditForm(s=>set(s,e))} placeholder="End (blank=present)" />
                    </div>
                    <textarea name="description" className="ar-textarea" value={editForm.description??''} onChange={e=>setEditForm(s=>set(s,e))} style={{minHeight:60}} />
                    <div style={{display:'flex',gap:8}}>
                      <button type="submit" className="ar-btn ar-btn-p" disabled={saving}>{saving?'Saving...':'Save'}</button>
                      <button type="button" className="ar-btn ar-btn-o" onClick={()=>setEditId(null)}>Cancel</button>
                    </div>
                  </form>
                </td>
              </tr>
            ) : (
              <tr key={item.id}>
                <td style={{fontWeight:500}}>{item.institution}</td>
                <td>{item.degree}</td>
                <td style={{fontFamily:"'DM Mono',monospace",fontSize:'.7rem',color:'var(--adm-text-3)'}}>{item.startDate} — {item.endDate??'Present'}</td>
                <td style={{textAlign:'right',display:'flex',gap:8,justifyContent:'flex-end'}}>
                  <button className="ar-btn ar-btn-o" style={{fontSize:'.65rem'}} onClick={()=>{setEditId(item.id);setEditForm({institution:item.institution,degree:item.degree,startDate:item.startDate,endDate:item.endDate??'',description:item.description??'',order:item.order})}}>Edit</button>
                  <button className="ar-btn ar-btn-d" style={{fontSize:'.65rem'}} onClick={()=>handleDelete(item.id)}>Delete</button>
                </td>
              </tr>
            ))}
            {items.length===0 && <tr><td colSpan={4} className="ar-empty">No entries yet</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  )
}
