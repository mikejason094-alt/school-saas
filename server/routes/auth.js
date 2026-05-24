import { Router } from 'express'
import bcrypt from 'bcryptjs'
import store from '../store.js'
import { generateToken } from '../middleware/auth.js'

const router = Router()

router.post('/login', async (req, res, next) => {
  try {
    const { email, password, schoolSlug } = req.body
    if (!email || !password) return res.status(400).json({ message: 'Email and password required' })

    let user
    if (schoolSlug) {
      const school = await store.schools.findOne({ slug: schoolSlug })
      if (!school) return res.status(404).json({ message: 'School not found' })
      user = await store.users.findOne({ email: email.toLowerCase(), tenantId: school._id })
    } else {
      user = await store.users.findOne({ email: email.toLowerCase() })
    }

    if (!user) return res.status(401).json({ message: 'Invalid credentials' })
    if (user.isActive === false) return res.status(401).json({ message: 'Account deactivated' })

    const match = await bcrypt.compare(password, user.password)
    if (!match) return res.status(401).json({ message: 'Invalid credentials' })

    let school = null
    if (user.tenantId) school = await store.schools.findOne({ _id: user.tenantId })

    const token = generateToken(user)
    delete user.password
    res.json({ token, user, school })
  } catch (e) { next(e) }
})

export default router
