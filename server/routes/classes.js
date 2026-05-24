import { Router } from 'express'
import store from '../store.js'
import { protect, schoolAdminOnly } from '../middleware/auth.js'

const router = Router()
router.use(protect, schoolAdminOnly)

const tenantFilter = (req) => ({ tenantId: req.user.tenantId })

router.get('/', async (req, res, next) => {
  try {
    let classes = await store.classes.find(tenantFilter(req))
    for (const c of classes) {
      const students = await store.students.find({ classId: c._id, tenantId: req.user.tenantId })
      c.studentCount = students.filter(s => s.isActive !== false).length
    }
    res.json(classes)
  } catch (e) { next(e) }
})

router.post('/', async (req, res, next) => {
  try {
    const { nameEn, nameAr, gradeLevel, section, teacherId, room, capacity } = req.body
    if (!nameEn) return res.status(400).json({ message: 'Class name required' })
    const cls = await store.classes.insertOne({
      nameEn, nameAr, gradeLevel: gradeLevel || '1', section, teacherId, room,
      capacity: capacity || 30, isActive: true, ...tenantFilter(req),
    })
    res.status(201).json(cls)
  } catch (e) { next(e) }
})

router.put('/:id', async (req, res, next) => {
  try {
    const cls = await store.classes.findOne({ _id: req.params.id, tenantId: req.user.tenantId })
    if (!cls) return res.status(404).json({ message: 'Class not found' })
    const f = ['nameEn', 'nameAr', 'gradeLevel', 'section', 'teacherId', 'room', 'capacity', 'isActive']
    const updates = {}
    for (const field of f) { if (req.body[field] !== undefined) updates[field] = req.body[field] }
    const updated = await store.classes.updateOne({ _id: req.params.id }, updates)
    res.json(updated)
  } catch (e) { next(e) }
})

router.delete('/:id', async (req, res, next) => {
  try {
    const cls = await store.classes.findOne({ _id: req.params.id, tenantId: req.user.tenantId })
    if (!cls) return res.status(404).json({ message: 'Class not found' })
    await store.classes.updateOne({ _id: req.params.id }, { isActive: false })
    res.json({ message: 'Class deactivated' })
  } catch (e) { next(e) }
})

export default router
