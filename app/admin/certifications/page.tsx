'use client'
import { useState, useEffect } from 'react'
export const dynamic = 'force-dynamic'

type Cert = { id: number; name: string; issuer: string; date: string; credentialUrl: string | null; order: number }
const EMPTY = { name: '', issuer: '', date: '', credentialUrl: '', order: 0 }

export default function AdminCertificationsPage() {
  const [items, setItems] = useState<Cert[]>([])
  const [form, setForm] = useState({ ...EMPTY })
  const [showAdd, setShowAdd] = useState(false)
  const [editId, setEditId] = useState<number|null>(null)
  const [editForm, setEditForm] = useState({ ...EMPTY })
  const [saving, setSaving] = useState(false)

  useEffect(() => { fetch('/api/admin/certifications').then(r=>r.json()).then(setItems) }, [])

  const reload = () => fetch('/api/admin/certifications').then(r=>r.json()).then(setItems)

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true)
    await fetch('/api/admin/certifications', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ ...form, order: Number(form.order), credentialUrl: form.credentialUrl||null }) })
    setForm({...EMPTY}); setShowAdd(false); setSaving(false); reload()
  }

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true)
    await fetch(`/api/admin/certifications/${editId}`, { method:'PUT', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ ...editForm, order: Number(editForm.order), credentialUrl: editForm.credentialUrl||null }) })
    setEditId(null); setSaving(false); reload()
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this certification?')) return
    await fetch(`/api/admin/certifications/${id}`, { method:'DELETE' }); reload()
  }

  const set = (s: typeof form, e: React.ChangeEvent<HTMLInputElement>) => ({ ...s, [e.target.name]: e.target.value })

  return (
    <div>
      <div className="ar-ph">
        <div>
          <div className="ar-eyebrow">Content</div>
          <div className="ar-title">CERTIFICATIONS</div>
          <div className="ar-sub">Professional certifications and credentials</div>
        </div>
        <button className="ar-btn ar-btn-p" onClick={() => setShowAdd(s=>!s)}>+ Add Certification</button>
      </div>

      {showAdd && (
        <form className="ar-card" onSubmit={handleAdd}>
          <div className="ar-card-t">New Certification</div>
          <div className="ar-g2">
            <div className="ar-field"><label className="ar-label">Name</label><input name="name" className="ar-input" value={form.name} onChange={e=>setForm(s=>set(s,e))} required /></div>
            <div className="ar-field"><label className="ar-label">Issuer</label><input name="issuer" className="ar-input" value={form.issuer} onChange={e=>setForm(s=>set(s,e))} required /></div>
            <div className="ar-field"><label className="ar-label">Date</label><input name="date" className="ar-input" value={form.date} onChange={e=>setForm(s=>set(s,e))} placeholder="2024" required /></div>
            <div className="ar-field"><label className="ar-label">Order</label><input name="order" type="number" className="ar-input" value={form.order} onChange={e=>setForm(s=>set(s,e))} /></div>
          </div>
          <div className="ar-field"><label className="ar-label">Credential URL (optional)</label><input name="credentialUrl" className="ar-input" value={form.credentialUrl} onChange={e=>setForm(s=>set(s,e))} placeholder="https://..." /></div>
          <button type="submit" className="ar-btn ar-btn-p" disabled={saving}>{saving?'Saving...':'Save'}</button>
        </form>
      )}

      <div className="ar-tw">
        <table className="ar-table">
          <thead><tr><th>Name</th><th>Issuer</th><th>Date</th><th>Link</th><th></th></tr></thead>
          <tbody>
            {items.map(item => editId === item.id ? (
              <tr key={item.id}>
                <td colSpan={5}>
                  <form onSubmit={handleEdit} style={{display:'flex',flexDirection:'column',gap:10,padding:'8px 0'}}>
                    <div className="ar-g2">
                      <input name="name" className="ar-input" value={editForm.name} onChange={e=>setEditForm(s=>set(s,e))} placeholder="Name" />
                      <input name="issuer" className="ar-input" value={editForm.issuer} onChange={e=>setEditForm(s=>set(s,e))} placeholder="Issuer" />
                      <input name="date" className="ar-input" value={editForm.date} onChange={e=>setEditForm(s=>set(s,e))} placeholder="Date" />
                      <input name="order" type="number" className="ar-input" value={editForm.order} onChange={e=>setEditForm(s=>set(s,e))} placeholder="Order" />
                    </div>
                    <input name="credentialUrl" className="ar-input" value={editForm.credentialUrl??''} onChange={e=>setEditForm(s=>set(s,e))} placeholder="Credential URL (optional)" />
                    <div style={{display:'flex',gap:8}}>
                      <button type="submit" className="ar-btn ar-btn-p" disabled={saving}>{saving?'Saving...':'Save'}</button>
                      <button type="button" className="ar-btn ar-btn-o" onClick={()=>setEditId(null)}>Cancel</button>
                    </div>
                  </form>
                </td>
              </tr>
            ) : (
              <tr key={item.id}>
                <td style={{fontWeight:500}}>{item.name}</td>
                <td>{item.issuer}</td>
                <td style={{fontFamily:"'DM Mono',monospace",fontSize:'.7rem',color:'var(--adm-text-3)'}}>{item.date}</td>
                <td>{item.credentialUrl && <a href={item.credentialUrl} target="_blank" rel="noreferrer" style={{fontSize:'.7rem',color:'var(--adm-accent)'}}>View</a>}</td>
                <td style={{textAlign:'right',display:'flex',gap:8,justifyContent:'flex-end'}}>
                  <button className="ar-btn ar-btn-o" style={{fontSize:'.65rem'}} onClick={()=>{setEditId(item.id);setEditForm({name:item.name,issuer:item.issuer,date:item.date,credentialUrl:item.credentialUrl??'',order:item.order})}}>Edit</button>
                  <button className="ar-btn ar-btn-d" style={{fontSize:'.65rem'}} onClick={()=>handleDelete(item.id)}>Delete</button>
                </td>
              </tr>
            ))}
            {items.length===0 && <tr><td colSpan={5} className="ar-empty">No certifications yet</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  )
}
