import { Router } from 'express'
import bcrypt from 'bcryptjs'
import store from '../store.js'
import { protect, schoolAdminOnly } from '../middleware/auth.js'

const router = Router()
router.use(protect, schoolAdminOnly)

const tenantFilter = (req) => ({ tenantId: req.user.tenantId })

router.get('/', async (req, res, next) => {
  try {
    const { search } = req.query
    let teachers = await store.teachers.find(tenantFilter(req))
    if (search) {
      const q = search.toLowerCase()
      teachers = teachers.filter(t => (t.nameEn || '').toLowerCase().includes(q) || (t.nameAr || '').toLowerCase().includes(q) || (t.email || '').toLowerCase().includes(q))
    }
    res.json(teachers)
  } catch (e) { next(e) }
})

router.post('/', async (req, res, next) => {
  try {
    const { nameEn, nameAr, email, phone, specialization, qualification, address } = req.body
    if (!nameEn || !email) return res.status(400).json({ message: 'Name and email required' })
    const existing = await store.teachers.findOne({ email: email.toLowerCase(), tenantId: req.user.tenantId })
    if (existing) return res.status(409).json({ message: 'Email already exists' })
    const teacher = await store.teachers.insertOne({
      nameEn, nameAr, email: email.toLowerCase(), phone, specialization, qualification, address,
      isActive: true, ...tenantFilter(req),
    })
    const tempPw = 'teacher123'
    const hashed = await bcrypt.hash(tempPw, 12)
    await store.users.insertOne({
      email: email.toLowerCase(), password: hashed, role: 'teacher',
      nameEn, nameAr, teacherId: teacher._id,
      tenantId: req.user.tenantId, schoolId: req.user.tenantId, isActive: true,
    })
    res.status(201).json({ ...teacher, tempPassword: tempPw })
  } catch (e) { next(e) }
})

router.put('/:id', async (req, res, next) => {
  try {
    const teacher = await store.teachers.findOne({ _id: req.params.id, tenantId: req.user.tenantId })
    if (!teacher) return res.status(404).json({ message: 'Teacher not found' })
    const updates = {}
    const f = ['nameEn', 'nameAr', 'email', 'phone', 'specialization', 'qualification', 'address', 'isActive']
    for (const field of f) { if (req.body[field] !== undefined) updates[field] = req.body[field] }
    const updated = await store.teachers.updateOne({ _id: req.params.id }, updates)
    res.json(updated)
  } catch (e) { next(e) }
})

router.delete('/:id', async (req, res, next) => {
  try {
    const teacher = await store.teachers.findOne({ _id: req.params.id, tenantId: req.user.tenantId })
    if (!teacher) return res.status(404).json({ message: 'Teacher not found' })
    await store.teachers.updateOne({ _id: req.params.id }, { isActive: false })
    res.json({ message: 'Teacher deactivated' })
  } catch (e) { next(e) }
})

export default router
