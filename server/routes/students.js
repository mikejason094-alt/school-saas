import { Router } from 'express'
import bcrypt from 'bcryptjs'
import store from '../store.js'
import { protect, schoolAdminOnly } from '../middleware/auth.js'

const router = Router()
router.use(protect, schoolAdminOnly)

const tenantFilter = (req) => ({ tenantId: req.user.tenantId })

router.get('/', async (req, res, next) => {
  try {
    const { search, classId } = req.query
    let students = await store.students.find(tenantFilter(req))
    if (search) {
      const q = search.toLowerCase()
      students = students.filter(s => (s.nameEn || '').toLowerCase().includes(q) || (s.nameAr || '').toLowerCase().includes(q) || (s.studentId || '').toLowerCase().includes(q))
    }
    if (classId) students = students.filter(s => s.classId === classId)
    res.json(students)
  } catch (e) { next(e) }
})

router.post('/', async (req, res, next) => {
  try {
    const { nameEn, nameAr, email, phone, studentId, classId, address, guardianName, guardianPhone, enrollmentDate } = req.body
    if (!nameEn || !studentId) return res.status(400).json({ message: 'Name and student ID required' })
    const existing = await store.students.findOne({ studentId, tenantId: req.user.tenantId })
    if (existing) return res.status(409).json({ message: 'Student ID already exists' })
    const student = await store.students.insertOne({
      nameEn, nameAr, email, phone, studentId, classId, address, guardianName, guardianPhone,
      enrollmentDate: enrollmentDate || new Date().toISOString().split('T')[0],
      isActive: true, ...tenantFilter(req),
    })
    if (email) {
      const hashed = await bcrypt.hash(studentId, 12)
      await store.users.insertOne({
        email: email.toLowerCase(), password: hashed, role: 'student',
        nameEn, nameAr, studentId: student._id,
        tenantId: req.user.tenantId, schoolId: req.user.tenantId, isActive: true,
      })
    }
    res.status(201).json(student)
  } catch (e) { next(e) }
})

router.get('/:id', async (req, res, next) => {
  try {
    const student = await store.students.findOne({ _id: req.params.id, tenantId: req.user.tenantId })
    if (!student) return res.status(404).json({ message: 'Student not found' })
    res.json(student)
  } catch (e) { next(e) }
})

router.put('/:id', async (req, res, next) => {
  try {
    const student = await store.students.findOne({ _id: req.params.id, tenantId: req.user.tenantId })
    if (!student) return res.status(404).json({ message: 'Student not found' })
    const { nameEn, nameAr, email, phone, classId, address, guardianName, guardianPhone, isActive } = req.body
    const updates = {}
    if (nameEn !== undefined) updates.nameEn = nameEn
    if (nameAr !== undefined) updates.nameAr = nameAr
    if (email !== undefined) updates.email = email
    if (phone !== undefined) updates.phone = phone
    if (classId !== undefined) updates.classId = classId
    if (address !== undefined) updates.address = address
    if (guardianName !== undefined) updates.guardianName = guardianName
    if (guardianPhone !== undefined) updates.guardianPhone = guardianPhone
    if (isActive !== undefined) updates.isActive = isActive
    const updated = await store.students.updateOne({ _id: req.params.id }, updates)
    res.json(updated)
  } catch (e) { next(e) }
})

router.delete('/:id', async (req, res, next) => {
  try {
    const student = await store.students.findOne({ _id: req.params.id, tenantId: req.user.tenantId })
    if (!student) return res.status(404).json({ message: 'Student not found' })
    await store.students.updateOne({ _id: req.params.id }, { isActive: false })
    res.json({ message: 'Student deactivated' })
  } catch (e) { next(e) }
})

export default router
