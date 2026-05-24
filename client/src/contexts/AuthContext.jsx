import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [school, setSchool] = useState(null)
  const [token, setToken] = useState(localStorage.getItem('token'))
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem('user')
    const storedSchool = localStorage.getItem('school')
    if (stored) setUser(JSON.parse(stored))
    if (storedSchool) setSchool(JSON.parse(storedSchool))
    setLoading(false)
  }, [])

  function login(tokenVal, userVal, schoolVal) {
    localStorage.setItem('token', tokenVal)
    localStorage.setItem('user', JSON.stringify(userVal))
    if (schoolVal) localStorage.setItem('school', JSON.stringify(schoolVal))
    setToken(tokenVal)
    setUser(userVal)
    setSchool(schoolVal)
  }

  function logout() {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('school')
    setToken(null)
    setUser(null)
    setSchool(null)
  }

  function isSuperAdmin() { return user?.role === 'superadmin' }
  function isSchoolAdmin() { return user?.role === 'schooladmin' || user?.role === 'superadmin' }

  return (
    <AuthContext.Provider value={{ user, school, token, loading, login, logout, isSuperAdmin, isSchoolAdmin }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
