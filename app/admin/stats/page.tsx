'use client'
import { useState, useEffect } from 'react'
export const dynamic = 'force-dynamic'

type Stat = { id: number; label: string; value: string; order: number }
const EMPTY = { label: '', value: '', order: 0 }

export default function AdminStatsPage() {
  const [items, setItems] = useState<Stat[]>([])
  const [form, setForm] = useState({ ...EMPTY })
  const [showAdd, setShowAdd] = useState(false)
  const [editId, setEditId] = useState<number|null>(null)
  const [editForm, setEditForm] = useState({ ...EMPTY })
  const [saving, setSaving] = useState(false)

  useEffect(() => { fetch('/api/admin/stats').then(r=>r.json()).then(setItems) }, [])

  const reload = () => fetch('/api/admin/stats').then(r=>r.json()).then(setItems)

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true)
    await fetch('/api/admin/stats', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ ...form, order: Number(form.order) }) })
    setForm({...EMPTY}); setShowAdd(false); setSaving(false); reload()
  }

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true)
    await fetch(`/api/admin/stats/${editId}`, { method:'PUT', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ ...editForm, order: Number(editForm.order) }) })
    setEditId(null); setSaving(false); reload()
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this stat?')) return
    await fetch(`/api/admin/stats/${id}`, { method:'DELETE' }); reload()
  }

  const set = (s: typeof form, e: React.ChangeEvent<HTMLInputElement>) => ({ ...s, [e.target.name]: e.target.value })

  return (
    <div>
      <div className="ar-ph">
        <div>
          <div className="ar-eyebrow">Content</div>
          <div className="ar-title">STATS</div>
          <div className="ar-sub">Key numbers and metrics displayed on the portfolio</div>
        </div>
        <button className="ar-btn ar-btn-p" onClick={() => setShowAdd(s=>!s)}>+ Add Stat</button>
      </div>

      {showAdd && (
        <form className="ar-card" onSubmit={handleAdd}>
          <div className="ar-card-t">New Stat</div>
          <div className="ar-g2">
            <div className="ar-field"><label className="ar-label">Label</label><input name="label" className="ar-input" value={form.label} onChange={e=>setForm(s=>set(s,e))} placeholder="e.g. Projects Completed" required /></div>
            <div className="ar-field"><label className="ar-label">Value</label><input name="value" className="ar-input" value={form.value} onChange={e=>setForm(s=>set(s,e))} placeholder="e.g. 50+" required /></div>
            <div className="ar-field"><label className="ar-label">Order</label><input name="order" type="number" className="ar-input" value={form.order} onChange={e=>setForm(s=>set(s,e))} /></div>
          </div>
          <button type="submit" className="ar-btn ar-btn-p" disabled={saving}>{saving?'Saving...':'Save'}</button>
        </form>
      )}

      <div className="ar-tw">
        <table className="ar-table">
          <thead><tr><th>Label</th><th>Value</th><th></th></tr></thead>
          <tbody>
            {items.map(item => editId === item.id ? (
              <tr key={item.id}>
                <td colSpan={3}>
                  <form onSubmit={handleEdit} style={{display:'flex',flexDirection:'column',gap:10,padding:'8px 0'}}>
                    <div className="ar-g2">
                      <input name="label" className="ar-input" value={editForm.label} onChange={e=>setEditForm(s=>set(s,e))} placeholder="Label" />
                      <input name="value" className="ar-input" value={editForm.value} onChange={e=>setEditForm(s=>set(s,e))} placeholder="Value" />
                      <input name="order" type="number" className="ar-input" value={editForm.order} onChange={e=>setEditForm(s=>set(s,e))} placeholder="Order" />
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
                <td style={{fontWeight:500}}>{item.label}</td>
                <td style={{fontFamily:"'DM Mono',monospace",fontSize:'.85rem'}}>{item.value}</td>
                <td style={{textAlign:'right',display:'flex',gap:8,justifyContent:'flex-end'}}>
                  <button className="ar-btn ar-btn-o" style={{fontSize:'.65rem'}} onClick={()=>{setEditId(item.id);setEditForm({label:item.label,value:item.value,order:item.order})}}>Edit</button>
                  <button className="ar-btn ar-btn-d" style={{fontSize:'.65rem'}} onClick={()=>handleDelete(item.id)}>Delete</button>
                </td>
              </tr>
            ))}
            {items.length===0 && <tr><td colSpan={3} className="ar-empty">No stats yet</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  )
}
