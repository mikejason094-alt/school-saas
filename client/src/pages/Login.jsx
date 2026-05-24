import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { auth } from '../services/api'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [schoolSlug, setSchoolSlug] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      const data = await auth.login({ email, password, schoolSlug: schoolSlug || undefined })
      login(data.token, data.user, data.school)
      navigate('/')
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <form onSubmit={handleSubmit} style={{ width: '100%', maxWidth: 400, background: '#18181b', borderRadius: 16, padding: '2rem', border: '1px solid #27272a' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 4 }}>School Management</h1>
        <p style={{ color: '#71717a', fontSize: '0.9rem', marginBottom: '1.5rem' }}>Sign in to your account</p>
        {error && <div style={{ padding: '0.75rem', background: '#7f1d1d', borderRadius: 8, marginBottom: '1rem', fontSize: '0.85rem' }}>{error}</div>}
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', fontSize: '0.85rem', color: '#a1a1aa', marginBottom: 6 }}>School Slug (optional for school users)</label>
          <input value={schoolSlug} onChange={e => setSchoolSlug(e.target.value)} placeholder="e.g. al-noor-school" style={{ width: '100%', padding: '0.7rem', background: '#0a0a0f', border: '1px solid #27272a', borderRadius: 8, color: '#e4e4e7', fontSize: '0.9rem' }} />
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', fontSize: '0.85rem', color: '#a1a1aa', marginBottom: 6 }}>Email</label>
          <input value={email} onChange={e => setEmail(e.target.value)} type="email" required style={{ width: '100%', padding: '0.7rem', background: '#0a0a0f', border: '1px solid #27272a', borderRadius: 8, color: '#e4e4e7', fontSize: '0.9rem' }} />
        </div>
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', fontSize: '0.85rem', color: '#a1a1aa', marginBottom: 6 }}>Password</label>
          <input value={password} onChange={e => setPassword(e.target.value)} type="password" required style={{ width: '100%', padding: '0.7rem', background: '#0a0a0f', border: '1px solid #27272a', borderRadius: 8, color: '#e4e4e7', fontSize: '0.9rem' }} />
        </div>
        <button type="submit" disabled={submitting} style={{ width: '100%', padding: '0.75rem', background: '#6366f1', color: '#fff', border: 'none', borderRadius: 8, fontSize: '0.95rem', fontWeight: 600, cursor: 'pointer', opacity: submitting ? 0.5 : 1 }}>
          {submitting ? 'Signing in...' : 'Sign In'}
        </button>
        <div style={{ marginTop: '1.5rem', padding: '0.75rem', background: '#0a0a0f', borderRadius: 8, fontSize: '0.8rem', color: '#71717a', lineHeight: 1.8 }}>
          <strong style={{ color: '#a1a1aa' }}>Demo:</strong><br />
          Super Admin: superadmin@schoolsaas.com / superadmin123
        </div>
      </form>
    </div>
  )
}
