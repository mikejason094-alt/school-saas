import { Router } from 'express'
import bcrypt from 'bcryptjs'
import store from '../store.js'
import { protect, superAdminOnly, generateToken } from '../middleware/auth.js'

const router = Router()
router.use(protect, superAdminOnly)

router.get('/', async (req, res, next) => {
  try {
    const schools = await store.schools.find({})
    for (const s of schools) {
      const users = await store.users.find({ tenantId: s._id })
      s.stats = {
        totalUsers: users.length,
        students: users.filter(u => u.role === 'student').length,
        teachers: users.filter(u => u.role === 'teacher').length,
      }
    }
    res.json(schools)
  } catch (e) { next(e) }
})

router.post('/', async (req, res, next) => {
  try {
    const { nameEn, nameAr, slug, email, phone, address, adminEmail, adminPassword } = req.body
    if (!nameEn || !slug || !adminEmail || !adminPassword) return res.status(400).json({ message: 'Name, slug, admin email, and admin password required' })

    const existingSlug = await store.schools.findOne({ slug })
    if (existingSlug) return res.status(409).json({ message: 'School slug already exists' })

    const school = await store.schools.insertOne({ nameEn, nameAr, slug, email, phone, address, isActive: true, subscription: 'trial' })

    const hashed = await bcrypt.hash(adminPassword, 12)
    const adminUser = await store.users.insertOne({
      email: adminEmail.toLowerCase(), password: hashed, role: 'schooladmin',
      nameEn: `${nameEn} Admin`, nameAr: `مشرف ${nameAr || nameEn}`,
      tenantId: school._id, schoolId: school._id, isActive: true,
    })

    res.status(201).json({ school, admin: { email: adminEmail, password: adminPassword } })
  } catch (e) { next(e) }
})

router.get('/:id', async (req, res, next) => {
  try {
    const school = await store.schools.findOne({ _id: req.params.id })
    if (!school) return res.status(404).json({ message: 'School not found' })
    res.json(school)
  } catch (e) { next(e) }
})

router.put('/:id', async (req, res, next) => {
  try {
    const { nameEn, nameAr, email, phone, address, isActive, subscription } = req.body
    const updates = {}
    if (nameEn !== undefined) updates.nameEn = nameEn
    if (nameAr !== undefined) updates.nameAr = nameAr
    if (email !== undefined) updates.email = email
    if (phone !== undefined) updates.phone = phone
    if (address !== undefined) updates.address = address
    if (isActive !== undefined) updates.isActive = isActive
    if (subscription !== undefined) updates.subscription = subscription
    const school = await store.schools.updateOne({ _id: req.params.id }, updates)
    if (!school) return res.status(404).json({ message: 'School not found' })
    res.json(school)
  } catch (e) { next(e) }
})

router.delete('/:id', async (req, res, next) => {
  try {
    const school = await store.schools.findOne({ _id: req.params.id })
    if (!school) return res.status(404).json({ message: 'School not found' })
    await store.schools.updateOne({ _id: req.params.id }, { isActive: false })
    res.json({ message: 'School deactivated' })
  } catch (e) { next(e) }
})

router.post('/:id/login', async (req, res, next) => {
  try {
    const school = await store.schools.findOne({ _id: req.params.id })
    if (!school) return res.status(404).json({ message: 'School not found' })
    const admin = await store.users.findOne({ tenantId: school._id, role: 'schooladmin' })
    if (!admin) return res.status(404).json({ message: 'School admin not found' })
    const token = generateToken(admin)
    delete admin.password
    res.json({ token, user: admin, school })
  } catch (e) { next(e) }
})

export default router
