import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import path from 'path'
import { fileURLToPath } from 'url'
import rateLimit from 'express-rate-limit'
import store from './store.js'
import errorHandler from './middleware/errorHandler.js'
import authRoutes from './routes/auth.js'
import schoolRoutes from './routes/schools.js'
import studentRoutes from './routes/students.js'
import teacherRoutes from './routes/teachers.js'
import classRoutes from './routes/classes.js'
import feeRoutes from './routes/fees.js'
import attendanceRoutes from './routes/attendance.js'
import gradeRoutes from './routes/grades.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const app = express()

app.use(helmet({ contentSecurityPolicy: false, crossOriginEmbedderPolicy: false }))
app.use(cors({ origin: '*', credentials: true }))
app.use(express.json({ limit: '1mb' }))

const loginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20, message: { message: 'Too many login attempts' } })
app.use('/api/auth/login', loginLimiter)

app.use('/api/auth', authRoutes)
app.use('/api/schools', schoolRoutes)
app.use('/api/students', studentRoutes)
app.use('/api/teachers', teacherRoutes)
app.use('/api/classes', classRoutes)
app.use('/api/fees', feeRoutes)
app.use('/api/attendance', attendanceRoutes)
app.use('/api/grades', gradeRoutes)

app.use(express.static(path.join(__dirname, '..', 'client', 'dist')))
app.get('*', (req, res) => res.sendFile(path.join(__dirname, '..', 'client', 'dist', 'index.html')))

app.use(errorHandler)

const PORT = process.env.PORT || 5000

async function start() {
  console.log('Initializing store...')
  await store.init()
  await store.seed()
  app.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`))
}

start().catch(err => { console.error('Failed to start:', err); process.exit(1) })
