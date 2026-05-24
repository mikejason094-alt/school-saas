import { Router } from 'express'
import store from '../store.js'
import { protect, schoolAdminOnly } from '../middleware/auth.js'

const router = Router()
router.use(protect, schoolAdminOnly)

const tenantFilter = (req) => ({ tenantId: req.user.tenantId })

router.get('/', async (req, res, next) => {
  try {
    const { studentId, classId, date, subject } = req.query
    let records = await store.attendance.find(tenantFilter(req))
    if (studentId) records = records.filter(a => a.studentId === studentId)
    if (classId) records = records.filter(a => a.classId === classId)
    if (date) records = records.filter(a => a.date === date)
    if (subject) records = records.filter(a => a.subject === subject)
    records.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0))
    res.json(records)
  } catch (e) { next(e) }
})

router.post('/batch', async (req, res, next) => {
  try {
    const { records } = req.body
    if (!records || !Array.isArray(records)) return res.status(400).json({ message: 'Records array required' })
    const created = []
    for (const r of records) {
      const existing = await store.attendance.findOne({ studentId: r.studentId, date: r.date, tenantId: req.user.tenantId })
      if (existing) {
        await store.attendance.updateOne({ _id: existing._id }, { status: r.status, notes: r.notes || '' })
        created.push({ ...existing, status: r.status })
      } else {
        const att = await store.attendance.insertOne({
          studentId: r.studentId, classId: r.classId, date: r.date,
          status: r.status || 'present', notes: r.notes || '',
          subject: r.subject || '', ...tenantFilter(req),
        })
        created.push(att)
      }
    }
    res.status(201).json(created)
  } catch (e) { next(e) }
})

router.get('/stats/:studentId', async (req, res, next) => {
  try {
    const records = await store.attendance.find({ studentId: req.params.studentId, tenantId: req.user.tenantId })
    const total = records.length
    const present = records.filter(a => a.status === 'present').length
    const absent = records.filter(a => a.status === 'absent').length
    const late = records.filter(a => a.status === 'late').length
    res.json({ total, present, absent, late, attendanceRate: total > 0 ? Math.round((present / total) * 100) : 0 })
  } catch (e) { next(e) }
})

export default router
