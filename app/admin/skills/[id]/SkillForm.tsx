'use client'
import { useState } from 'react'

type SkillItem = { id?: number; name: string; highlight: boolean; order: number }
type Skill = { id: number; icon: string; title: string; description: string; proficiency: string; yearsExp?: number | null; items: SkillItem[] }

export default function SkillForm({ skill }: { skill: Skill }) {
  const [form, setForm] = useState({
    icon:        skill.icon,
    title:       skill.title,
    description: skill.description,
    proficiency: skill.proficiency,
    yearsExp:    skill.yearsExp ?? '',
  })
  const [items, setItems] = useState<SkillItem[]>(
    skill.items.map((i, idx) => ({ ...i, order: i.order ?? idx }))
  )
  const [status, setStatus] = useState<'idle'|'saving'|'saved'|'error'>('idle')

  const set = (e: React.ChangeEvent<HTMLInputElement|HTMLTextAreaElement|HTMLSelectElement>) =>
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const addItem = () => setItems(prev => [...prev, { name: '', highlight: false, order: prev.length }])
  const removeItem = (i: number) => setItems(prev => prev.filter((_, j) => j !== i))
  const updateItem = (i: number, patch: Partial<SkillItem>) =>
    setItems(prev => prev.map((item, j) => j === i ? { ...item, ...patch } : item))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('saving')
    const res = await fetch(`/api/admin/skills/${skill.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, yearsExp: form.yearsExp ? Number(form.yearsExp) : null, items }),
    })
    setStatus(res.ok ? 'saved' : 'error')
    setTimeout(() => setStatus('idle'), 3000)
  }

  return (
    <form onSubmit={handleSubmit}>
      {status === 'saved' && <div className="ar-ok">Saved</div>}
      {status === 'error'  && <div className="ar-er">Save failed</div>}

      <div className="ar-card">
        <div className="ar-card-t">Skill Details</div>
        <div className="ar-g2">
          <div className="ar-field">
            <label className="ar-label">Icon (emoji)</label>
            <input name="icon" className="ar-input" value={form.icon} onChange={set} />
          </div>
          <div className="ar-field">
            <label className="ar-label">Title</label>
            <input name="title" className="ar-input" value={form.title} onChange={set} required />
          </div>
          <div className="ar-field">
            <label className="ar-label">Proficiency</label>
            <select name="proficiency" className="ar-select" value={form.proficiency} onChange={set}>
              <option value="expert">Expert</option>
              <option value="proficient">Proficient</option>
              <option value="familiar">Familiar</option>
            </select>
          </div>
          <div className="ar-field">
            <label className="ar-label">Years Experience</label>
            <input name="yearsExp" type="number" className="ar-input" value={form.yearsExp} onChange={set} placeholder="e.g. 3" />
          </div>
        </div>
        <div className="ar-field">
          <label className="ar-label">Description</label>
          <textarea name="description" className="ar-textarea" value={form.description} onChange={set} style={{ minHeight: 80 }} />
        </div>
      </div>

      <div className="ar-card">
        <div className="ar-card-t">Technologies</div>
        <table className="ar-table" style={{ marginBottom: '1rem' }}>
          <thead>
            <tr><th>Name</th><th>Highlight (shown teal)</th><th></th></tr>
          </thead>
          <tbody>
            {items.map((item, i) => (
              <tr key={i}>
                <td>
                  <input className="ar-input" value={item.name}
                    onChange={e => updateItem(i, { name: e.target.value })}
                    placeholder="Technology name" style={{ margin: 0 }} />
                </td>
                <td>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '.5rem', cursor: 'pointer' }}>
                    <input type="checkbox" checked={item.highlight}
                      onChange={e => updateItem(i, { highlight: e.target.checked })} />
                    <span style={{ fontSize: '.78rem', color: item.highlight ? '#3ECFCF' : '#6b6880' }}>
                      {item.highlight ? 'Highlighted' : 'Normal'}
                    </span>
                  </label>
                </td>
                <td>
                  <button type="button" className="ar-btn ar-btn-d" onClick={() => removeItem(i)} style={{ padding: '.3rem .75rem' }}>
                    ×
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <button type="button" className="ar-btn ar-btn-o" onClick={addItem}>+ Add Technology</button>
      </div>

      <button type="submit" className="ar-btn ar-btn-p" disabled={status === 'saving'}>
        {status === 'saving' ? 'Saving...' : 'Save Skill'}
      </button>
    </form>
  )
}
