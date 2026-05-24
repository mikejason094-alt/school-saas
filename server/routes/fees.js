import { Router } from 'express'
import store from '../store.js'
import { protect, schoolAdminOnly } from '../middleware/auth.js'

const router = Router()
router.use(protect, schoolAdminOnly)

const tenantFilter = (req) => ({ tenantId: req.user.tenantId })

router.get('/', async (req, res, next) => {
  try {
    const { studentId, classId, status } = req.query
    let fees = await store.fees.find(tenantFilter(req))
    if (studentId) fees = fees.filter(f => f.studentId === studentId)
    if (classId) fees = fees.filter(f => f.classId === classId)
    if (status) fees = fees.filter(f => f.status === status)
    res.json(fees)
  } catch (e) { next(e) }
})

router.post('/', async (req, res, next) => {
  try {
    const { studentId, classId, feeType, amount, dueDate, description } = req.body
    if (!feeType || !amount) return res.status(400).json({ message: 'Fee type and amount required' })
    const fee = await store.fees.insertOne({
      studentId, classId, feeType, amount: parseFloat(amount),
      dueDate: dueDate || new Date().toISOString().split('T')[0],
      description, status: 'unpaid', paidAmount: 0, ...tenantFilter(req),
    })
    res.status(201).json(fee)
  } catch (e) { next(e) }
})

router.post('/:id/pay', async (req, res, next) => {
  try {
    const fee = await store.fees.findOne({ _id: req.params.id, tenantId: req.user.tenantId })
    if (!fee) return res.status(404).json({ message: 'Fee not found' })
    const { amount, paymentMethod, notes } = req.body
    if (!amount) return res.status(400).json({ message: 'Amount required' })
    const paid = parseFloat(amount)
    const newPaid = (fee.paidAmount || 0) + paid
    await store.fees.updateOne({ _id: req.params.id }, {
      paidAmount: newPaid,
      status: newPaid >= fee.amount ? 'paid' : 'partial',
    })
    await store.feePayments.insertOne({
      feeId: req.params.id, studentId: fee.studentId, amount: paid,
      paymentMethod: paymentMethod || 'cash', notes, ...tenantFilter(req),
      paidAt: new Date().toISOString(),
    })
    const updated = await store.fees.findOne({ _id: req.params.id })
    res.json(updated)
  } catch (e) { next(e) }
})

router.get('/payments', async (req, res, next) => {
  try {
    const payments = await store.feePayments.find(tenantFilter(req))
    res.json(payments.sort((a, b) => new Date(b.paidAt || 0) - new Date(a.paidAt || 0)))
  } catch (e) { next(e) }
})

export default router
