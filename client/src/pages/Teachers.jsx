import { useState, useEffect } from 'react'
import { teachers } from '../services/api'

export default function Teachers() {
  const [list, setList] = useState([])
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ nameEn: '', nameAr: '', email: '', phone: '', specialization: '', qualification: '' })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  async function load() { try { setList(await teachers.list({ search })) } catch {} }
  useEffect(() => { load() }, [search])

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    try {
      const result = await teachers.create(form)
      setSuccess(`Teacher created. Temp password: ${result.tempPassword}`)
      setShowForm(false)
      setForm({ nameEn: '', nameAr: '', email: '', phone: '', specialization: '', qualification: '' })
      load()
    } catch (err) { setError(err.message) }
  }

  async function deleteTeacher(id) {
    if (!confirm('Deactivate this teacher?')) return
    try { await teachers.delete(id); load() } catch {}
  }

  const inputStyle = { width: '100%', padding: '0.6rem', background: '#0a0a0f', border: '1px solid #27272a', borderRadius: 8, color: '#e4e4e7', fontSize: '0.85rem' }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Teachers</h1>
        <button onClick={() => setShowForm(!showForm)} style={{ padding: '0.6rem 1.2rem', background: '#6366f1', color: '#fff', border: 'none', borderRadius: 8, fontSize: '0.9rem', cursor: 'pointer' }}>{showForm ? 'Cancel' : '+ Add Teacher'}</button>
      </div>
      {error && <div style={{ padding: '0.75rem', background: '#7f1d1d', borderRadius: 8, marginBottom: '1rem', fontSize: '0.85rem' }}>{error}</div>}
      {success && <div style={{ padding: '0.75rem', background: '#14532d', borderRadius: 8, marginBottom: '1rem', fontSize: '0.85rem' }}>{success}</div>}

      {showForm && (
        <form onSubmit={handleSubmit} style={{ background: '#18181b', borderRadius: 12, padding: '1.25rem', border: '1px solid #27272a', marginBottom: '1.5rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          <input placeholder="Name (EN)*" value={form.nameEn} onChange={e => setForm({ ...form, nameEn: e.target.value })} required style={inputStyle} />
          <input placeholder="Name (AR)" value={form.nameAr} onChange={e => setForm({ ...form, nameAr: e.target.value })} style={inputStyle} />
          <input placeholder="Email*" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required type="email" style={inputStyle} />
          <input placeholder="Phone" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} style={inputStyle} />
          <input placeholder="Specialization" value={form.specialization} onChange={e => setForm({ ...form, specialization: e.target.value })} style={inputStyle} />
          <input placeholder="Qualification" value={form.qualification} onChange={e => setForm({ ...form, qualification: e.target.value })} style={inputStyle} />
          <button type="submit" style={{ padding: '0.6rem', background: '#6366f1', color: '#fff', border: 'none', borderRadius: 8, fontSize: '0.9rem', cursor: 'pointer', gridColumn: '1 / -1' }}>Create Teacher</button>
        </form>
      )}

      <input placeholder="Search teachers..." value={search} onChange={e => setSearch(e.target.value)} style={{ ...inputStyle, marginBottom: '1rem', maxWidth: 300 }} />

      <div style={{ background: '#18181b', borderRadius: 12, border: '1px solid #27272a', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
          <thead><tr style={{ color: '#71717a', borderBottom: '1px solid #27272a' }}>
            <th style={{ padding: '0.75rem', textAlign: 'left' }}>Name</th>
            <th style={{ padding: '0.75rem', textAlign: 'left' }}>Email</th>
            <th style={{ padding: '0.75rem', textAlign: 'left' }}>Phone</th>
            <th style={{ padding: '0.75rem', textAlign: 'left' }}>Specialization</th>
            <th style={{ padding: '0.75rem', textAlign: 'left' }}>Status</th>
            <th style={{ padding: '0.75rem', textAlign: 'left' }}>Actions</th>
          </tr></thead>
          <tbody>
            {list.map(t => (
              <tr key={t._id} style={{ borderBottom: '1px solid #27272a' }}>
                <td style={{ padding: '0.75rem' }}>{t.nameEn}{t.nameAr ? ` (${t.nameAr})` : ''}</td>
                <td style={{ padding: '0.75rem', color: '#a1a1aa' }}>{t.email}</td>
                <td style={{ padding: '0.75rem' }}>{t.phone || '—'}</td>
                <td style={{ padding: '0.75rem' }}>{t.specialization || '—'}</td>
                <td style={{ padding: '0.75rem' }}><span style={{ padding: '2px 8px', borderRadius: 4, fontSize: '0.75rem', background: t.isActive !== false ? '#14532d' : '#7f1d1d', color: t.isActive !== false ? '#4ade80' : '#fca5a5' }}>{t.isActive !== false ? 'Active' : 'Inactive'}</span></td>
                <td style={{ padding: '0.75rem' }}><button onClick={() => deleteTeacher(t._id)} style={{ padding: '0.3rem 0.6rem', background: 'transparent', border: '1px solid #7f1d1d', borderRadius: 6, color: '#fca5a5', fontSize: '0.8rem', cursor: 'pointer' }}>Deactivate</button></td>
              </tr>
            ))}
            {list.length === 0 && <tr><td colSpan={6} style={{ padding: '1rem', textAlign: 'center', color: '#71717a' }}>No teachers found</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  )
}
