import { useState, useEffect } from 'react'
import { attendance, students, classes } from '../services/api'

export default function Attendance() {
  const [list, setList] = useState([])
  const [studentList, setStudentList] = useState([])
  const [classList, setClassList] = useState([])
  const [selectedClass, setSelectedClass] = useState('')
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [records, setRecords] = useState({})
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  async function load() {
    try { setList(await attendance.list({ classId: selectedClass || undefined, date: selectedDate })) } catch {}
    try { setStudentList(await students.list({ classId: selectedClass || undefined })) } catch {}
    try { setClassList(await classes.list()) } catch {}
  }
  useEffect(() => { load() }, [selectedClass, selectedDate])

  useEffect(() => {
    const r = {}
    for (const s of studentList) {
      const existing = list.find(a => a.studentId === s._id)
      r[s._id] = existing ? existing.status : 'present'
    }
    setRecords(r)
  }, [studentList, list])

  async function saveAll() {
    setError('')
    setSuccess('')
    const data = Object.entries(records).map(([studentId, status]) => ({
      studentId, classId: selectedClass, date: selectedDate, status,
    }))
    try {
      await attendance.batch(data)
      setSuccess(`Attendance saved for ${data.length} students`)
    } catch (err) { setError(err.message) }
  }

  const inputStyle = { padding: '0.6rem', background: '#0a0a0f', border: '1px solid #27272a', borderRadius: 8, color: '#e4e4e7', fontSize: '0.85rem' }

  return (
    <div>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem' }}>Attendance</h1>
      {error && <div style={{ padding: '0.75rem', background: '#7f1d1d', borderRadius: 8, marginBottom: '1rem', fontSize: '0.85rem' }}>{error}</div>}
      {success && <div style={{ padding: '0.75rem', background: '#14532d', borderRadius: 8, marginBottom: '1rem', fontSize: '0.85rem' }}>{success}</div>}

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', alignItems: 'end', flexWrap: 'wrap' }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.8rem', color: '#71717a', marginBottom: 4 }}>Class</label>
          <select value={selectedClass} onChange={e => setSelectedClass(e.target.value)} style={inputStyle}>
            <option value="">All Classes</option>
            {classList.map(c => <option key={c._id} value={c._id}>{c.nameEn}</option>)}
          </select>
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '0.8rem', color: '#71717a', marginBottom: 4 }}>Date</label>
          <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} style={inputStyle} />
        </div>
        <button onClick={saveAll} style={{ padding: '0.6rem 1.2rem', background: '#6366f1', color: '#fff', border: 'none', borderRadius: 8, fontSize: '0.9rem', cursor: 'pointer' }}>Save All</button>
      </div>

      <div style={{ background: '#18181b', borderRadius: 12, border: '1px solid #27272a', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
          <thead><tr style={{ color: '#71717a', borderBottom: '1px solid #27272a' }}>
            <th style={{ padding: '0.75rem', textAlign: 'left' }}>Student</th>
            <th style={{ padding: '0.75rem', textAlign: 'left' }}>Status</th>
          </tr></thead>
          <tbody>
            {studentList.map(s => (
              <tr key={s._id} style={{ borderBottom: '1px solid #27272a' }}>
                <td style={{ padding: '0.75rem' }}>{s.nameEn}{s.nameAr ? ` (${s.nameAr})` : ''}</td>
                <td style={{ padding: '0.75rem' }}>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {['present', 'absent', 'late'].map(status => (
                      <button key={status} onClick={() => setRecords({ ...records, [s._id]: status })}
                        style={{ padding: '0.3rem 0.7rem', background: records[s._id] === status ? '#6366f1' : 'transparent', border: '1px solid #27272a', borderRadius: 6, color: records[s._id] === status ? '#fff' : '#a1a1aa', fontSize: '0.8rem', cursor: 'pointer' }}>{status}</button>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
            {studentList.length === 0 && <tr><td colSpan={2} style={{ padding: '1rem', textAlign: 'center', color: '#71717a' }}>No students in this class</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  )
}
