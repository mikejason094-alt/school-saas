import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Schools from './pages/Schools'
import Students from './pages/Students'
import Teachers from './pages/Teachers'
import Classes from './pages/Classes'
import Fees from './pages/Fees'
import Attendance from './pages/Attendance'
import Grades from './pages/Grades'

function ProtectedRoute({ children, roleCheck }) {
  const { user, loading } = useAuth()
  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Loading...</div>
  if (!user) return <Navigate to="/login" />
  if (roleCheck && !roleCheck()) return <Navigate to="/" />
  return children
}

function Layout({ children }) {
  const { user, school, logout } = useAuth()
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <nav style={{ width: 240, background: '#18181b', borderLeft: '1px solid #27272a', padding: '1rem', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '1rem 0', borderBottom: '1px solid #27272a', marginBottom: '1rem' }}>
          <div style={{ fontWeight: 700, fontSize: '1.1rem', color: '#e4e4e7' }}>School SaaS</div>
          {school && <div style={{ fontSize: '0.8rem', color: '#71717a', marginTop: 4 }}>{school.nameEn}</div>}
        </div>
        <NavItem to="/" label="Dashboard" icon="📊" />
        {user?.role === 'superadmin' && <NavItem to="/schools" label="Schools" icon="🏫" />}
        <NavItem to="/students" label="Students" icon="👨‍🎓" />
        <NavItem to="/teachers" label="Teachers" icon="👩‍🏫" />
        <NavItem to="/classes" label="Classes" icon="📚" />
        <NavItem to="/fees" label="Fees" icon="💰" />
        <NavItem to="/attendance" label="Attendance" icon="📋" />
        <NavItem to="/grades" label="Grades" icon="📝" />
        <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid #27272a' }}>
          <div style={{ fontSize: '0.85rem', color: '#71717a', marginBottom: 8 }}>{user?.email}</div>
          <button onClick={logout} style={{ width: '100%', padding: '0.5rem', background: 'transparent', border: '1px solid #27272a', borderRadius: 8, color: '#ef4444', cursor: 'pointer' }}>Logout</button>
        </div>
      </nav>
      <main style={{ flex: 1, padding: '2rem' }}>{children}</main>
    </div>
  )
}

function NavItem({ to, label, icon }) {
  return (
    <a href={to} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0.6rem 0.8rem', borderRadius: 8, color: '#a1a1aa', textDecoration: 'none', fontSize: '0.9rem', transition: '0.2s' }}
       onMouseOver={e => e.currentTarget.style.background = '#27272a'}
       onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
      <span>{icon}</span> {label}
    </a>
  )
}

function HomeRoute() {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" />
  if (user.role === 'superadmin') return <Schools />
  return <Dashboard />
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<ProtectedRoute><Layout><HomeRoute /></Layout></ProtectedRoute>} />
        <Route path="/schools" element={<ProtectedRoute roleCheck={() => useAuth().isSuperAdmin()}><Layout><Schools /></Layout></ProtectedRoute>} />
        <Route path="/students" element={<ProtectedRoute><Layout><Students /></Layout></ProtectedRoute>} />
        <Route path="/teachers" element={<ProtectedRoute><Layout><Teachers /></Layout></ProtectedRoute>} />
        <Route path="/classes" element={<ProtectedRoute><Layout><Classes /></Layout></ProtectedRoute>} />
        <Route path="/fees" element={<ProtectedRoute><Layout><Fees /></Layout></ProtectedRoute>} />
        <Route path="/attendance" element={<ProtectedRoute><Layout><Attendance /></Layout></ProtectedRoute>} />
        <Route path="/grades" element={<ProtectedRoute><Layout><Grades /></Layout></ProtectedRoute>} />
      </Routes>
    </AuthProvider>
  )
}
