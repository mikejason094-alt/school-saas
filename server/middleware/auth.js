import jwt from 'jsonwebtoken'
import store from '../store.js'

const JWT_SECRET = process.env.JWT_SECRET || 'school-saas-jwt-secret-2025'

export function protect(req, res, next) {
  const header = req.headers.authorization
  if (!header || !header.startsWith('Bearer ')) return res.status(401).json({ message: 'No token provided' })
  try {
    const decoded = jwt.verify(header.split(' ')[1], JWT_SECRET)
    req.user = decoded
    next()
  } catch { res.status(401).json({ message: 'Invalid token' }) }
}

export function superAdminOnly(req, res, next) {
  if (req.user.role !== 'superadmin') return res.status(403).json({ message: 'Super admin only' })
  next()
}

export function schoolAdminOnly(req, res, next) {
  if (req.user.role !== 'schooladmin' && req.user.role !== 'superadmin') return res.status(403).json({ message: 'School admin only' })
  next()
}

export function teacherOnly(req, res, next) {
  if (req.user.role !== 'teacher' && req.user.role !== 'schooladmin' && req.user.role !== 'superadmin') return res.status(403).json({ message: 'Access denied' })
  next()
}

export function generateToken(user) {
  return jwt.sign(
    { _id: user._id, email: user.email, role: user.role, tenantId: user.tenantId, schoolId: user.schoolId },
    JWT_SECRET,
    { expiresIn: '7d' }
  )
}
