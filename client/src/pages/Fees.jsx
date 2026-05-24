import { useState, useEffect } from 'react'
import { fees, students } from '../services/api'

export default function Fees() {
  const [list, setList] = useState([])
  const [studentList, setStudentList] = useState([])
  const [payments, setPayments] = useState([])
  const [filter, setFilter] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ studentId: '', feeType: 'Tuition', amount: '', dueDate: '', description: '' })
  const [payForm, setPayForm] = useState({ feeId: '', amount: '', paymentMethod: 'cash', notes: '' })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [tab, setTab] = useState('fees')

  async function load() {
    try { setList(await fees.list({ status: filter || undefined })) } catch {}
    try { setStudentList(await students.list()) } catch {}
    try { setPayments(await fees.payments()) } catch {}
  }
  useEffect(() => { load() }, [filter])

  async function handleCreate(e) {
    e.preventDefault()
    setError('')
    try { await fees.create(form); setSuccess('Fee created'); setShowForm(false); load() } catch (err) { setError(err.message) }
  }

  async function handlePay(e) {
    e.preventDefault()
    setError('')
    try { await fees.pay(payForm.feeId, { amount: payForm.amount, paymentMethod: payForm.paymentMethod, notes: payForm.notes }); setSuccess('Payment recorded'); setPayForm({ feeId: '', amount: '', paymentMethod: 'cash', notes: '' }); load() } catch (err) { setError(err.message) }
  }

  const inputStyle = { width: '100%', padding: '0.6rem', background: '#0a0a0f', border: '1px solid #27272a', borderRadius: 8, color: '#e4e4e7', fontSize: '0.85rem' }
  const tabStyle = (active) => ({ padding: '0.5rem 1rem', background: active ? '#6366f1' : 'transparent', border: 'none', borderRadius: 6, color: active ? '#fff' : '#a1a1aa', cursor: 'pointer', fontSize: '0.85rem' })

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Fees</h1>
        <button onClick={() => setShowForm(!showForm)} style={{ padding: '0.6rem 1.2rem', background: '#6366f1', color: '#fff', border: 'none', borderRadius: 8, fontSize: '0.9rem', cursor: 'pointer' }}>{showForm ? 'Cancel' : '+ Add Fee'}</button>
      </div>
      <div style={{ display: 'flex', gap: 8, marginBottom: '1rem' }}>
        <button onClick={() => setTab('fees')} style={tabStyle(tab === 'fees')}>Fees</button>
        <button onClick={() => setTab('payments')} style={tabStyle(tab === 'payments')}>Payment History</button>
        <button onClick={() => setTab('record')} style={tabStyle(tab === 'record')}>Record Payment</button>
      </div>
      {error && <div style={{ padding: '0.75rem', background: '#7f1d1d', borderRadius: 8, marginBottom: '1rem', fontSize: '0.85rem' }}>{error}</div>}
      {success && <div style={{ padding: '0.75rem', background: '#14532d', borderRadius: 8, marginBottom: '1rem', fontSize: '0.85rem' }}>{success}</div>}

      {tab === 'fees' && (
        <>
          {showForm && (
            <form onSubmit={handleCreate} style={{ background: '#18181b', borderRadius: 12, padding: '1.25rem', border: '1px solid #27272a', marginBottom: '1.5rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <select value={form.studentId} onChange={e => setForm({ ...form, studentId: e.target.value })} style={inputStyle}>
                <option value="">All Students</option>
                {studentList.map(s => <option key={s._id} value={s._id}>{s.nameEn} ({s.studentId})</option>)}
              </select>
              <select value={form.feeType} onChange={e => setForm({ ...form, feeType: e.target.value })} style={inputStyle}>
                <option>Tuition</option><option>Registration</option><option>Exam</option><option>Library</option><option>Activity</option><option>Other</option>
              </select>
              <input placeholder="Amount*" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} type="number" required style={inputStyle} />
              <input placeholder="Due Date" value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })} type="date" style={inputStyle} />
              <input placeholder="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} style={{ ...inputStyle, gridColumn: '1 / -1' }} />
              <button type="submit" style={{ padding: '0.6rem', background: '#6366f1', color: '#fff', border: 'none', borderRadius: 8, fontSize: '0.9rem', cursor: 'pointer', gridColumn: '1 / -1' }}>Create Fee</button>
            </form>
          )}
          <div style={{ display: 'flex', gap: 8, marginBottom: '1rem' }}>
            {['', 'unpaid', 'partial', 'paid'].map(s => (
              <button key={s} onClick={() => setFilter(s)} style={{ padding: '0.4rem 0.8rem', background: filter === s ? '#6366f1' : 'transparent', border: '1px solid #27272a', borderRadius: 6, color: filter === s ? '#fff' : '#a1a1aa', fontSize: '0.8rem', cursor: 'pointer' }}>{s || 'All'}</button>
            ))}
          </div>
          <div style={{ background: '#18181b', borderRadius: 12, border: '1px solid #27272a', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead><tr style={{ color: '#71717a', borderBottom: '1px solid #27272a' }}>
                <th style={{ padding: '0.75rem', textAlign: 'left' }}>Student</th>
                <th style={{ padding: '0.75rem', textAlign: 'left' }}>Type</th>
                <th style={{ padding: '0.75rem', textAlign: 'left' }}>Amount</th>
                <th style={{ padding: '0.75rem', textAlign: 'left' }}>Paid</th>
                <th style={{ padding: '0.75rem', textAlign: 'left' }}>Due</th>
                <th style={{ padding: '0.75rem', textAlign: 'left' }}>Status</th>
              </tr></thead>
              <tbody>
                {list.map(f => (
                  <tr key={f._id} style={{ borderBottom: '1px solid #27272a' }}>
                    <td style={{ padding: '0.75rem' }}>{studentList.find(s => s._id === f.studentId)?.nameEn || f.feeType}</td>
                    <td style={{ padding: '0.75rem' }}>{f.feeType}</td>
                    <td style={{ padding: '0.75rem' }}>${f.amount}</td>
                    <td style={{ padding: '0.75rem' }}>${f.paidAmount || 0}</td>
                    <td style={{ padding: '0.75rem' }}>${(f.amount - (f.paidAmount || 0)).toFixed(2)}</td>
                    <td style={{ padding: '0.75rem' }}><span style={{ padding: '2px 8px', borderRadius: 4, fontSize: '0.75rem', background: f.status === 'paid' ? '#14532d' : f.status === 'partial' ? '#713f12' : '#7f1d1d', color: f.status === 'paid' ? '#4ade80' : f.status === 'partial' ? '#fbbf24' : '#fca5a5' }}>{f.status}</span></td>
                  </tr>
                ))}
                {list.length === 0 && <tr><td colSpan={6} style={{ padding: '1rem', textAlign: 'center', color: '#71717a' }}>No fees found</td></tr>}
              </tbody>
            </table>
          </div>
        </>
      )}

      {tab === 'payments' && (
        <div style={{ background: '#18181b', borderRadius: 12, border: '1px solid #27272a', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead><tr style={{ color: '#71717a', borderBottom: '1px solid #27272a' }}>
              <th style={{ padding: '0.75rem', textAlign: 'left' }}>Date</th>
              <th style={{ padding: '0.75rem', textAlign: 'left' }}>Amount</th>
              <th style={{ padding: '0.75rem', textAlign: 'left' }}>Method</th>
              <th style={{ padding: '0.75rem', textAlign: 'left' }}>Notes</th>
            </tr></thead>
            <tbody>
              {payments.map(p => (
                <tr key={p._id} style={{ borderBottom: '1px solid #27272a' }}>
                  <td style={{ padding: '0.75rem' }}>{p.paidAt ? new Date(p.paidAt).toLocaleDateString() : '—'}</td>
                  <td style={{ padding: '0.75rem' }}>${p.amount}</td>
                  <td style={{ padding: '0.75rem' }}>{p.paymentMethod}</td>
                  <td style={{ padding: '0.75rem', color: '#71717a' }}>{p.notes || '—'}</td>
                </tr>
              ))}
              {payments.length === 0 && <tr><td colSpan={4} style={{ padding: '1rem', textAlign: 'center', color: '#71717a' }}>No payments yet</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'record' && (
        <form onSubmit={handlePay} style={{ background: '#18181b', borderRadius: 12, padding: '1.25rem', border: '1px solid #27272a', maxWidth: 400 }}>
          <select value={payForm.feeId} onChange={e => setPayForm({ ...payForm, feeId: e.target.value })} required style={{ ...inputStyle, marginBottom: '0.75rem' }}>
            <option value="">Select Fee</option>
            {list.filter(f => f.status !== 'paid').map(f => (
              <option key={f._id} value={f._id}>{studentList.find(s => s._id === f.studentId)?.nameEn || 'Unknown'} - ${f.amount - (f.paidAmount || 0)} remaining</option>
            ))}
          </select>
          <input placeholder="Amount*" value={payForm.amount} onChange={e => setPayForm({ ...payForm, amount: e.target.value })} type="number" required style={{ ...inputStyle, marginBottom: '0.75rem' }} />
          <select value={payForm.paymentMethod} onChange={e => setPayForm({ ...payForm, paymentMethod: e.target.value })} style={{ ...inputStyle, marginBottom: '0.75rem' }}>
            <option value="cash">Cash</option><option value="card">Card</option><option value="bank">Bank Transfer</option><option value="cheque">Cheque</option>
          </select>
          <input placeholder="Notes" value={payForm.notes} onChange={e => setPayForm({ ...payForm, notes: e.target.value })} style={{ ...inputStyle, marginBottom: '0.75rem' }} />
          <button type="submit" style={{ padding: '0.6rem', background: '#6366f1', color: '#fff', border: 'none', borderRadius: 8, fontSize: '0.9rem', cursor: 'pointer', width: '100%' }}>Record Payment</button>
        </form>
      )}
    </div>
  )
}
