import { useState, useEffect } from 'react'
import { classes, teachers } from '../services/api'

export default function Classes() {
  const [list, setList] = useState([])
  const [teacherList, setTeacherList] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ nameEn: '', nameAr: '', gradeLevel: '1', section: '', teacherId: '', room: '', capacity: 30 })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  async function load() { try { setList(await classes.list()); setTeacherList(await teachers.list()) } catch {} }
  useEffect(() => { load() }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    try {
      await classes.create(form)
      setSuccess(`Class ${form.nameEn} created`)
      setShowForm(false)
      setForm({ nameEn: '', nameAr: '', gradeLevel: '1', section: '', teacherId: '', room: '', capacity: 30 })
      load()
    } catch (err) { setError(err.message) }
  }

  async function deleteClass(id) {
    if (!confirm('Deactivate this class?')) return
    try { await classes.delete(id); load() } catch {}
  }

  const inputStyle = { width: '100%', padding: '0.6rem', background: '#0a0a0f', border: '1px solid #27272a', borderRadius: 8, color: '#e4e4e7', fontSize: '0.85rem' }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Classes</h1>
        <button onClick={() => setShowForm(!showForm)} style={{ padding: '0.6rem 1.2rem', background: '#6366f1', color: '#fff', border: 'none', borderRadius: 8, fontSize: '0.9rem', cursor: 'pointer' }}>{showForm ? 'Cancel' : '+ Add Class'}</button>
      </div>
      {error && <div style={{ padding: '0.75rem', background: '#7f1d1d', borderRadius: 8, marginBottom: '1rem', fontSize: '0.85rem' }}>{error}</div>}
      {success && <div style={{ padding: '0.75rem', background: '#14532d', borderRadius: 8, marginBottom: '1rem', fontSize: '0.85rem' }}>{success}</div>}

      {showForm && (
        <form onSubmit={handleSubmit} style={{ background: '#18181b', borderRadius: 12, padding: '1.25rem', border: '1px solid #27272a', marginBottom: '1.5rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          <input placeholder="Name (EN)*" value={form.nameEn} onChange={e => setForm({ ...form, nameEn: e.target.value })} required style={inputStyle} />
          <input placeholder="Name (AR)" value={form.nameAr} onChange={e => setForm({ ...form, nameAr: e.target.value })} style={inputStyle} />
          <select value={form.gradeLevel} onChange={e => setForm({ ...form, gradeLevel: e.target.value })} style={inputStyle}>
            {[1,2,3,4,5,6,7,8,9,10,11,12].map(g => <option key={g} value={g}>Grade {g}</option>)}
          </select>
          <input placeholder="Section (e.g. A)" value={form.section} onChange={e => setForm({ ...form, section: e.target.value })} style={inputStyle} />
          <select value={form.teacherId} onChange={e => setForm({ ...form, teacherId: e.target.value })} style={inputStyle}>
            <option value="">No Homeroom Teacher</option>
            {teacherList.filter(t => t.isActive !== false).map(t => <option key={t._id} value={t._id}>{t.nameEn}</option>)}
          </select>
          <input placeholder="Room" value={form.room} onChange={e => setForm({ ...form, room: e.target.value })} style={inputStyle} />
          <input placeholder="Capacity" value={form.capacity} onChange={e => setForm({ ...form, capacity: parseInt(e.target.value) || 30 })} type="number" style={inputStyle} />
          <button type="submit" style={{ padding: '0.6rem', background: '#6366f1', color: '#fff', border: 'none', borderRadius: 8, fontSize: '0.9rem', cursor: 'pointer', gridColumn: '1 / -1' }}>Create Class</button>
        </form>
      )}

      <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
        {list.map(c => (
          <div key={c._id} style={{ background: '#18181b', borderRadius: 12, padding: '1.25rem', border: '1px solid #27272a' }}>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>{c.nameEn} {c.section ? `- ${c.section}` : ''}</div>
            <div style={{ fontSize: '0.8rem', color: '#71717a', marginBottom: 8 }}>{c.nameAr} · Grade {c.gradeLevel}</div>
            <div style={{ fontSize: '0.85rem', color: '#a1a1aa' }}>
              👨‍🎓 {c.studentCount || 0} / {c.capacity || 30} students
              {c.teacherId && <span> · 👩‍🏫 {teacherList.find(t => t._id === c.teacherId)?.nameEn || ''}</span>}
              {c.room && <span> · 🏫 {c.room}</span>}
            </div>
            <button onClick={() => deleteClass(c._id)} style={{ marginTop: 8, padding: '0.3rem 0.6rem', background: 'transparent', border: '1px solid #7f1d1d', borderRadius: 6, color: '#fca5a5', fontSize: '0.8rem', cursor: 'pointer' }}>Deactivate</button>
          </div>
        ))}
        {list.length === 0 && <div style={{ color: '#71717a', textAlign: 'center', padding: '2rem' }}>No classes yet</div>}
      </div>
    </div>
  )
}
