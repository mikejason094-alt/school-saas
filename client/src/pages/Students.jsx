import { useState, useEffect } from 'react'
import { students, classes } from '../services/api'

export default function Students() {
  const [list, setList] = useState([])
  const [classList, setClassList] = useState([])
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ nameEn: '', nameAr: '', email: '', phone: '', studentId: '', classId: '', guardianName: '', guardianPhone: '' })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  async function load() {
    try { setList(await students.list({ search })) } catch {}
    try { setClassList(await classes.list()) } catch {}
  }
  useEffect(() => { load() }, [search])

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    try {
      await students.create(form)
      setSuccess(`Student ${form.nameEn} created`)
      setShowForm(false)
      setForm({ nameEn: '', nameAr: '', email: '', phone: '', studentId: '', classId: '', guardianName: '', guardianPhone: '' })
      load()
    } catch (err) { setError(err.message) }
  }

  async function deleteStudent(id) {
    if (!confirm('Deactivate this student?')) return
    try { await students.delete(id); load() } catch {}
  }

  const inputStyle = { width: '100%', padding: '0.6rem', background: '#0a0a0f', border: '1px solid #27272a', borderRadius: 8, color: '#e4e4e7', fontSize: '0.85rem' }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Students</h1>
        <button onClick={() => setShowForm(!showForm)} style={{ padding: '0.6rem 1.2rem', background: '#6366f1', color: '#fff', border: 'none', borderRadius: 8, fontSize: '0.9rem', cursor: 'pointer' }}>{showForm ? 'Cancel' : '+ Add Student'}</button>
      </div>
      {error && <div style={{ padding: '0.75rem', background: '#7f1d1d', borderRadius: 8, marginBottom: '1rem', fontSize: '0.85rem' }}>{error}</div>}
      {success && <div style={{ padding: '0.75rem', background: '#14532d', borderRadius: 8, marginBottom: '1rem', fontSize: '0.85rem' }}>{success}</div>}

      {showForm && (
        <form onSubmit={handleSubmit} style={{ background: '#18181b', borderRadius: 12, padding: '1.25rem', border: '1px solid #27272a', marginBottom: '1.5rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          <input placeholder="Name (EN)*" value={form.nameEn} onChange={e => setForm({ ...form, nameEn: e.target.value })} required style={inputStyle} />
          <input placeholder="Name (AR)" value={form.nameAr} onChange={e => setForm({ ...form, nameAr: e.target.value })} style={inputStyle} />
          <input placeholder="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} style={inputStyle} />
          <input placeholder="Phone" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} style={inputStyle} />
          <input placeholder="Student ID*" value={form.studentId} onChange={e => setForm({ ...form, studentId: e.target.value })} required style={inputStyle} />
          <select value={form.classId} onChange={e => setForm({ ...form, classId: e.target.value })} style={inputStyle}>
            <option value="">No Class</option>
            {classList.map(c => <option key={c._id} value={c._id}>{c.nameEn}</option>)}
          </select>
          <input placeholder="Guardian Name" value={form.guardianName} onChange={e => setForm({ ...form, guardianName: e.target.value })} style={inputStyle} />
          <input placeholder="Guardian Phone" value={form.guardianPhone} onChange={e => setForm({ ...form, guardianPhone: e.target.value })} style={inputStyle} />
          <button type="submit" style={{ padding: '0.6rem', background: '#6366f1', color: '#fff', border: 'none', borderRadius: 8, fontSize: '0.9rem', cursor: 'pointer', gridColumn: '1 / -1' }}>Create Student</button>
        </form>
      )}

      <input placeholder="Search students..." value={search} onChange={e => setSearch(e.target.value)} style={{ ...inputStyle, marginBottom: '1rem', maxWidth: 300 }} />

      <div style={{ background: '#18181b', borderRadius: 12, border: '1px solid #27272a', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
          <thead><tr style={{ color: '#71717a', borderBottom: '1px solid #27272a' }}>
            <th style={{ padding: '0.75rem', textAlign: 'left' }}>ID</th>
            <th style={{ padding: '0.75rem', textAlign: 'left' }}>Name</th>
            <th style={{ padding: '0.75rem', textAlign: 'left' }}>Email</th>
            <th style={{ padding: '0.75rem', textAlign: 'left' }}>Phone</th>
            <th style={{ padding: '0.75rem', textAlign: 'left' }}>Class</th>
            <th style={{ padding: '0.75rem', textAlign: 'left' }}>Status</th>
            <th style={{ padding: '0.75rem', textAlign: 'left' }}>Actions</th>
          </tr></thead>
          <tbody>
            {list.map(s => (
              <tr key={s._id} style={{ borderBottom: '1px solid #27272a' }}>
                <td style={{ padding: '0.75rem', color: '#71717a' }}>{s.studentId}</td>
                <td style={{ padding: '0.75rem' }}>{s.nameEn}{s.nameAr ? ` (${s.nameAr})` : ''}</td>
                <td style={{ padding: '0.75rem', color: '#a1a1aa' }}>{s.email || '—'}</td>
                <td style={{ padding: '0.75rem' }}>{s.phone || '—'}</td>
                <td style={{ padding: '0.75rem' }}>{classList.find(c => c._id === s.classId)?.nameEn || '—'}</td>
                <td style={{ padding: '0.75rem' }}><span style={{ padding: '2px 8px', borderRadius: 4, fontSize: '0.75rem', background: s.isActive !== false ? '#14532d' : '#7f1d1d', color: s.isActive !== false ? '#4ade80' : '#fca5a5' }}>{s.isActive !== false ? 'Active' : 'Inactive'}</span></td>
                <td style={{ padding: '0.75rem' }}><button onClick={() => deleteStudent(s._id)} style={{ padding: '0.3rem 0.6rem', background: 'transparent', border: '1px solid #7f1d1d', borderRadius: 6, color: '#fca5a5', fontSize: '0.8rem', cursor: 'pointer' }}>Deactivate</button></td>
              </tr>
            ))}
            {list.length === 0 && <tr><td colSpan={7} style={{ padding: '1rem', textAlign: 'center', color: '#71717a' }}>No students found</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  )
}
