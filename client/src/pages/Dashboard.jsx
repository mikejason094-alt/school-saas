import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { students, teachers, classes, fees, attendance } from '../services/api'

export default function Dashboard() {
  const { user, school } = useAuth()
  const [stats, setStats] = useState(null)
  const [recentFees, setRecentFees] = useState([])

  useEffect(() => {
    async function load() {
      try {
        const [studs, teachs, cls, f, att] = await Promise.all([
          students.list(), teachers.list(), classes.list(), fees.list(), attendance.list(),
        ])
        const totalStudents = studs.filter(s => s.isActive !== false).length
        const totalTeachers = teachs.filter(t => t.isActive !== false).length
        const totalClasses = cls.filter(c => c.isActive !== false).length
        const unpaidFees = f.filter(f => f.status !== 'paid')
        const totalOwed = unpaidFees.reduce((s, f) => s + (f.amount - (f.paidAmount || 0)), 0)
        setStats({ totalStudents, totalTeachers, totalClasses, unpaidFees: unpaidFees.length, totalOwed, totalAttendance: att.length })
        setRecentFees(f.slice(0, 5))
      } catch {}
    }
    load()
  }, [])

  const card = (label, value, color) => (
    <div style={{ background: '#18181b', borderRadius: 12, padding: '1.25rem', border: '1px solid #27272a', flex: 1, minWidth: 180 }}>
      <div style={{ fontSize: '0.8rem', color: '#71717a', marginBottom: 8 }}>{label}</div>
      <div style={{ fontSize: '1.8rem', fontWeight: 700, color }}>{value ?? '—'}</div>
    </div>
  )

  return (
    <div>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 4 }}>Dashboard</h1>
      <p style={{ color: '#71717a', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
        Welcome, {user?.nameEn || user?.email}
        {school && <span style={{ color: '#6366f1' }}> · {school.nameEn}</span>}
      </p>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {card('Students', stats?.totalStudents, '#818cf8')}
        {card('Teachers', stats?.totalTeachers, '#34d399')}
        {card('Classes', stats?.totalClasses, '#fbbf24')}
        {card('Unpaid Fees', stats?.unpaidFees, '#f87171')}
        {card('Total Owed', stats?.totalOwed ? `$${stats.totalOwed.toFixed(2)}` : '$0', '#f87171')}
      </div>

      {recentFees.length > 0 && (
        <div style={{ background: '#18181b', borderRadius: 12, border: '1px solid #27272a', padding: '1.25rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>Recent Fees</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead><tr style={{ color: '#71717a', borderBottom: '1px solid #27272a' }}>
              <th style={{ padding: '0.5rem', textAlign: 'left' }}>Type</th>
              <th style={{ padding: '0.5rem', textAlign: 'left' }}>Amount</th>
              <th style={{ padding: '0.5rem', textAlign: 'left' }}>Status</th>
            </tr></thead>
            <tbody>
              {recentFees.map(f => (
                <tr key={f._id} style={{ borderBottom: '1px solid #27272a' }}>
                  <td style={{ padding: '0.5rem' }}>{f.feeType}</td>
                  <td style={{ padding: '0.5rem' }}>${f.amount}</td>
                  <td style={{ padding: '0.5rem', color: f.status === 'paid' ? '#34d399' : f.status === 'partial' ? '#fbbf24' : '#f87171' }}>{f.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
