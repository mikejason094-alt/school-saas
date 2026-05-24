import { Router } from 'express'
import store from '../store.js'
import { protect, schoolAdminOnly, teacherOnly } from '../middleware/auth.js'

const router = Router()
router.use(protect, teacherOnly)

const tenantFilter = (req) => ({ tenantId: req.user.tenantId })

router.get('/', async (req, res, next) => {
  try {
    const { studentId, classId, subjectId, examId } = req.query
    let grades = await store.grades.find(tenantFilter(req))
    if (studentId) grades = grades.filter(g => g.studentId === studentId)
    if (classId) grades = grades.filter(g => g.classId === classId)
    if (subjectId) grades = grades.filter(g => g.subjectId === subjectId)
    if (examId) grades = grades.filter(g => g.examId === examId)
    res.json(grades)
  } catch (e) { next(e) }
})

router.post('/', async (req, res, next) => {
  try {
    const { studentId, classId, subjectId, examId, score, maxScore, term, academicYear } = req.body
    if (!studentId || score === undefined) return res.status(400).json({ message: 'Student ID and score required' })
    const existing = await store.grades.findOne({ studentId, subjectId: subjectId || 'general', term: term || '1', academicYear: academicYear || new Date().getFullYear().toString(), tenantId: req.user.tenantId })
    if (existing) {
      const updated = await store.grades.updateOne({ _id: existing._id }, { score, maxScore: maxScore || 100, examId, updatedBy: req.user._id })
      return res.json(updated)
    }
    const grade = await store.grades.insertOne({
      studentId, classId, subjectId, examId, score: parseFloat(score),
      maxScore: maxScore || 100, term: term || '1',
      academicYear: academicYear || new Date().getFullYear().toString(),
      updatedBy: req.user._id, ...tenantFilter(req),
    })
    res.status(201).json(grade)
  } catch (e) { next(e) }
})

router.post('/batch', async (req, res, next) => {
  try {
    const { grades } = req.body
    if (!grades || !Array.isArray(grades)) return res.status(400).json({ message: 'Grades array required' })
    const created = []
    for (const g of grades) {
      const existing = await store.grades.findOne({ studentId: g.studentId, subjectId: g.subjectId || 'general', term: g.term || '1', tenantId: req.user.tenantId })
      if (existing) {
        created.push(await store.grades.updateOne({ _id: existing._id }, { score: parseFloat(g.score), maxScore: g.maxScore || 100, updatedBy: req.user._id }))
      } else {
        created.push(await store.grades.insertOne({ ...g, score: parseFloat(g.score), updatedBy: req.user._id, ...tenantFilter(req) }))
      }
    }
    res.status(201).json(created)
  } catch (e) { next(e) }
})

router.get('/subjects', async (req, res, next) => {
  try {
    let subjects = await store.subjects.find(tenantFilter(req))
    res.json(subjects)
  } catch (e) { next(e) }
})

router.post('/subjects', async (req, res, next) => {
  try {
    const { nameEn, nameAr, code, teacherId } = req.body
    if (!nameEn) return res.status(400).json({ message: 'Subject name required' })
    const subject = await store.subjects.insertOne({ nameEn, nameAr, code, teacherId, isActive: true, ...tenantFilter(req) })
    res.status(201).json(subject)
  } catch (e) { next(e) }
})

// Exam routes
router.get('/exams', async (req, res, next) => {
  try {
    let exams = await store.exams.find(tenantFilter(req))
    res.json(exams.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0)))
  } catch (e) { next(e) }
})

router.post('/exams', async (req, res, next) => {
  try {
    const { titleEn, titleAr, subjectId, classId, date, maxScore, term, type } = req.body
    if (!titleEn) return res.status(400).json({ message: 'Title required' })
    const exam = await store.exams.insertOne({
      titleEn, titleAr, subjectId, classId, date, maxScore: maxScore || 100,
      term: term || '1', type: type || 'exam', ...tenantFilter(req),
    })
    res.status(201).json(exam)
  } catch (e) { next(e) }
})

export default router
