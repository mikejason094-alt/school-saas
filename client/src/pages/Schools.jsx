import { useState, useEffect } from 'react'
import { schools } from '../services/api'

export default function Schools() {
  const [list, setList] = useState([])
  const [form, setForm] = useState({ nameEn: '', nameAr: '', slug: '', adminEmail: '', adminPassword: 'admin123' })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [selected, setSelected] = useState(null)

  async function load() {
    try { setList(await schools.list()) } catch {}
  }
  useEffect(() => { load() }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSuccess('')
    try {
      const result = await schools.create(form)
      setSuccess(`School created! Admin: ${result.admin.email} / ${result.admin.password}`)
      setForm({ nameEn: '', nameAr: '', slug: '', adminEmail: '', adminPassword: 'admin123' })
      load()
    } catch (err) { setError(err.message) }
  }

  async function toggleActive(s, val) {
    try { await schools.update(s._id, { isActive: val }); load() } catch {}
  }

  const inputStyle = { width: '100%', padding: '0.6rem', background: '#0a0a0f', border: '1px solid #27272a', borderRadius: 8, color: '#e4e4e7', fontSize: '0.85rem' }

  return (
    <div>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem' }}>Schools Management</h1>
      {error && <div style={{ padding: '0.75rem', background: '#7f1d1d', borderRadius: 8, marginBottom: '1rem', fontSize: '0.85rem' }}>{error}</div>}
      {success && <div style={{ padding: '0.75rem', background: '#14532d', borderRadius: 8, marginBottom: '1rem', fontSize: '0.85rem' }}>{success}</div>}

      <form onSubmit={handleSubmit} style={{ background: '#18181b', borderRadius: 12, padding: '1.25rem', border: '1px solid #27272a', marginBottom: '1.5rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
        <input placeholder="School Name (EN)*" value={form.nameEn} onChange={e => setForm({ ...form, nameEn: e.target.value })} required style={inputStyle} />
        <input placeholder="School Name (AR)" value={form.nameAr} onChange={e => setForm({ ...form, nameAr: e.target.value })} style={inputStyle} />
        <input placeholder="Slug* (e.g. al-noor)" value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} required style={inputStyle} />
        <input placeholder="Admin Email*" value={form.adminEmail} onChange={e => setForm({ ...form, adminEmail: e.target.value })} required style={inputStyle} />
        <input placeholder="Admin Password" value={form.adminPassword} onChange={e => setForm({ ...form, adminPassword: e.target.value })} style={inputStyle} />
        <button type="submit" style={{ padding: '0.6rem', background: '#6366f1', color: '#fff', border: 'none', borderRadius: 8, fontSize: '0.9rem', cursor: 'pointer' }}>Create School</button>
      </form>

      <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
        {list.map(s => (
          <div key={s._id} style={{ background: '#18181b', borderRadius: 12, padding: '1.25rem', border: '1px solid #27272a' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 8 }}>
              <div>
                <div style={{ fontWeight: 600 }}>{s.nameEn}</div>
                <div style={{ fontSize: '0.8rem', color: '#71717a' }}>{s.nameAr} · {s.slug}</div>
              </div>
              <span style={{ padding: '2px 8px', borderRadius: 4, fontSize: '0.75rem', background: s.isActive ? '#14532d' : '#7f1d1d', color: s.isActive ? '#4ade80' : '#fca5a5' }}>{s.isActive ? 'Active' : 'Inactive'}</span>
            </div>
            {s.stats && <div style={{ fontSize: '0.85rem', color: '#a1a1aa', marginBottom: 8 }}>👨‍🎓 {s.stats.students} · 👩‍🏫 {s.stats.teachers}</div>}
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => toggleActive(s, !s.isActive)} style={{ padding: '0.4rem 0.8rem', background: 'transparent', border: '1px solid #27272a', borderRadius: 6, color: '#a1a1aa', fontSize: '0.8rem', cursor: 'pointer' }}>{s.isActive ? 'Deactivate' : 'Activate'}</button>
              <button onClick={() => { navigator.clipboard.writeText(s._id) }} style={{ padding: '0.4rem 0.8rem', background: 'transparent', border: '1px solid #27272a', borderRadius: 6, color: '#a1a1aa', fontSize: '0.8rem', cursor: 'pointer' }}>Copy ID</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
