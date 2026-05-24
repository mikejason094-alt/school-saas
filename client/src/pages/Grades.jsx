import { useState, useEffect } from 'react'
import { grades, students, classes } from '../services/api'

export default function Grades() {
  const [gradeList, setGradeList] = useState([])
  const [subjectList, setSubjectList] = useState([])
  const [studentList, setStudentList] = useState([])
  const [classList, setClassList] = useState([])
  const [examList, setExamList] = useState([])
  const [selectedClass, setSelectedClass] = useState('')
  const [selectedSubject, setSelectedSubject] = useState('')
  const [selectedTerm, setSelectedTerm] = useState('1')
  const [showSubjectForm, setShowSubjectForm] = useState(false)
  const [showExamForm, setShowExamForm] = useState(false)
  const [subjectForm, setSubjectForm] = useState({ nameEn: '', nameAr: '', code: '' })
  const [examForm, setExamForm] = useState({ titleEn: '', titleAr: '', subjectId: '', classId: '', date: '', maxScore: 100, term: '1', type: 'exam' })
  const [scores, setScores] = useState({})
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [tab, setTab] = useState('entry')

  async function load() {
    try { setGradeList(await grades.list({ classId: selectedClass || undefined, subjectId: selectedSubject || undefined, term: selectedTerm })) } catch {}
    try { setSubjectList(await grades.subjects()) } catch {}
    try { setStudentList(await students.list({ classId: selectedClass || undefined })) } catch {}
    try { setClassList(await classes.list()) } catch {}
    try { setExamList(await grades.exams()) } catch {}
  }
  useEffect(() => { load() }, [selectedClass, selectedSubject, selectedTerm])

  useEffect(() => {
    const s = {}
    for (const g of gradeList) s[g.studentId] = g.score
    setScores(s)
  }, [gradeList])

  async function saveGrade(studentId) {
    setError('')
    try {
      await grades.create({ studentId, classId: selectedClass, subjectId: selectedSubject || 'general', score: scores[studentId], term: selectedTerm })
      setSuccess('Grade saved')
      load()
    } catch (err) { setError(err.message) }
  }

  async function saveAll() {
    setError('')
    const data = Object.entries(scores).filter(([_, score]) => score !== undefined && score !== '').map(([studentId, score]) => ({
      studentId, classId: selectedClass, subjectId: selectedSubject || 'general', score: parseFloat(score), term: selectedTerm,
    }))
    if (data.length === 0) return
    try { await grades.batch(data); setSuccess(`Saved ${data.length} grades`); load() } catch (err) { setError(err.message) }
  }

  async function handleSubjectSubmit(e) {
    e.preventDefault()
    try { await grades.createSubject(subjectForm); setSuccess('Subject created'); setShowSubjectForm(false); setSubjectForm({ nameEn: '', nameAr: '', code: '' }); load() } catch (err) { setError(err.message) }
  }

  async function handleExamSubmit(e) {
    e.preventDefault()
    try { await grades.createExam(examForm); setSuccess('Exam created'); setShowExamForm(false); load() } catch (err) { setError(err.message) }
  }

  const inputStyle = { width: '100%', padding: '0.6rem', background: '#0a0a0f', border: '1px solid #27272a', borderRadius: 8, color: '#e4e4e7', fontSize: '0.85rem' }
  const tabStyle = (active) => ({ padding: '0.5rem 1rem', background: active ? '#6366f1' : 'transparent', border: 'none', borderRadius: 6, color: active ? '#fff' : '#a1a1aa', cursor: 'pointer', fontSize: '0.85rem' })

  return (
    <div>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>Grades</h1>
      <div style={{ display: 'flex', gap: 8, marginBottom: '1rem' }}>
        <button onClick={() => setTab('entry')} style={tabStyle(tab === 'entry')}>Grade Entry</button>
        <button onClick={() => setTab('subjects')} style={tabStyle(tab === 'subjects')}>Subjects</button>
        <button onClick={() => setTab('exams')} style={tabStyle(tab === 'exams')}>Exams</button>
      </div>
      {error && <div style={{ padding: '0.75rem', background: '#7f1d1d', borderRadius: 8, marginBottom: '1rem', fontSize: '0.85rem' }}>{error}</div>}
      {success && <div style={{ padding: '0.75rem', background: '#14532d', borderRadius: 8, marginBottom: '1rem', fontSize: '0.85rem' }}>{success}</div>}

      {tab === 'entry' && (
        <>
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', alignItems: 'end', flexWrap: 'wrap' }}>
            <div><label style={{ display: 'block', fontSize: '0.8rem', color: '#71717a', marginBottom: 4 }}>Class</label>
              <select value={selectedClass} onChange={e => setSelectedClass(e.target.value)} style={inputStyle}>
                <option value="">All Classes</option>
                {classList.map(c => <option key={c._id} value={c._id}>{c.nameEn}</option>)}
              </select></div>
            <div><label style={{ display: 'block', fontSize: '0.8rem', color: '#71717a', marginBottom: 4 }}>Subject</label>
              <select value={selectedSubject} onChange={e => setSelectedSubject(e.target.value)} style={inputStyle}>
                <option value="">General</option>
                {subjectList.map(s => <option key={s._id} value={s._id}>{s.nameEn}</option>)}
              </select></div>
            <div><label style={{ display: 'block', fontSize: '0.8rem', color: '#71717a', marginBottom: 4 }}>Term</label>
              <select value={selectedTerm} onChange={e => setSelectedTerm(e.target.value)} style={inputStyle}>
                <option value="1">Term 1</option><option value="2">Term 2</option><option value="3">Term 3</option>
              </select></div>
            <button onClick={saveAll} style={{ padding: '0.6rem 1.2rem', background: '#6366f1', color: '#fff', border: 'none', borderRadius: 8, fontSize: '0.9rem', cursor: 'pointer' }}>Save All</button>
          </div>
          <div style={{ background: '#18181b', borderRadius: 12, border: '1px solid #27272a', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead><tr style={{ color: '#71717a', borderBottom: '1px solid #27272a' }}>
                <th style={{ padding: '0.75rem', textAlign: 'left' }}>Student</th>
                <th style={{ padding: '0.75rem', textAlign: 'left' }}>Score (0-100)</th>
                <th style={{ padding: '0.75rem', textAlign: 'left' }}>Actions</th>
              </tr></thead>
              <tbody>
                {studentList.map(s => (
                  <tr key={s._id} style={{ borderBottom: '1px solid #27272a' }}>
                    <td style={{ padding: '0.75rem' }}>{s.nameEn}</td>
                    <td style={{ padding: '0.75rem' }}>
                      <input type="number" min="0" max="100" value={scores[s._id] ?? ''} onChange={e => setScores({ ...scores, [s._id]: e.target.value })}
                        style={{ width: 100, padding: '0.4rem', background: '#0a0a0f', border: '1px solid #27272a', borderRadius: 6, color: '#e4e4e7', fontSize: '0.85rem' }} />
                    </td>
                    <td style={{ padding: '0.75rem' }}>
                      <button onClick={() => saveGrade(s._id)} style={{ padding: '0.3rem 0.6rem', background: '#6366f1', border: 'none', borderRadius: 6, color: '#fff', fontSize: '0.8rem', cursor: 'pointer' }}>Save</button>
                    </td>
                  </tr>
                ))}
                {studentList.length === 0 && <tr><td colSpan={3} style={{ padding: '1rem', textAlign: 'center', color: '#71717a' }}>No students found</td></tr>}
              </tbody>
            </table>
          </div>
        </>
      )}

      {tab === 'subjects' && (
        <>
          <button onClick={() => setShowSubjectForm(!showSubjectForm)} style={{ marginBottom: '1rem', padding: '0.6rem 1.2rem', background: '#6366f1', color: '#fff', border: 'none', borderRadius: 8, fontSize: '0.9rem', cursor: 'pointer' }}>{showSubjectForm ? 'Cancel' : '+ Add Subject'}</button>
          {showSubjectForm && (
            <form onSubmit={handleSubjectSubmit} style={{ background: '#18181b', borderRadius: 12, padding: '1.25rem', border: '1px solid #27272a', marginBottom: '1rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', maxWidth: 500 }}>
              <input placeholder="Name (EN)*" value={subjectForm.nameEn} onChange={e => setSubjectForm({ ...subjectForm, nameEn: e.target.value })} required style={inputStyle} />
              <input placeholder="Name (AR)" value={subjectForm.nameAr} onChange={e => setSubjectForm({ ...subjectForm, nameAr: e.target.value })} style={inputStyle} />
              <input placeholder="Code" value={subjectForm.code} onChange={e => setSubjectForm({ ...subjectForm, code: e.target.value })} style={inputStyle} />
              <button type="submit" style={{ padding: '0.6rem', background: '#6366f1', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer' }}>Create</button>
            </form>
          )}
          <div style={{ display: 'grid', gap: '0.75rem', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))' }}>
            {subjectList.map(s => (
              <div key={s._id} style={{ background: '#18181b', borderRadius: 8, padding: '1rem', border: '1px solid #27272a' }}>
                <div style={{ fontWeight: 600 }}>{s.nameEn}</div>
                <div style={{ fontSize: '0.8rem', color: '#71717a' }}>{s.nameAr}{s.code ? ` · ${s.code}` : ''}</div>
              </div>
            ))}
          </div>
        </>
      )}

      {tab === 'exams' && (
        <>
          <button onClick={() => setShowExamForm(!showExamForm)} style={{ marginBottom: '1rem', padding: '0.6rem 1.2rem', background: '#6366f1', color: '#fff', border: 'none', borderRadius: 8, fontSize: '0.9rem', cursor: 'pointer' }}>{showExamForm ? 'Cancel' : '+ Add Exam'}</button>
          {showExamForm && (
            <form onSubmit={handleExamSubmit} style={{ background: '#18181b', borderRadius: 12, padding: '1.25rem', border: '1px solid #27272a', marginBottom: '1rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', maxWidth: 500 }}>
              <input placeholder="Title (EN)*" value={examForm.titleEn} onChange={e => setExamForm({ ...examForm, titleEn: e.target.value })} required style={inputStyle} />
              <input placeholder="Title (AR)" value={examForm.titleAr} onChange={e => setExamForm({ ...examForm, titleAr: e.target.value })} style={inputStyle} />
              <select value={examForm.subjectId} onChange={e => setExamForm({ ...examForm, subjectId: e.target.value })} style={inputStyle}>
                <option value="">Subject</option>
                {subjectList.map(s => <option key={s._id} value={s._id}>{s.nameEn}</option>)}
              </select>
              <select value={examForm.type} onChange={e => setExamForm({ ...examForm, type: e.target.value })} style={inputStyle}>
                <option value="exam">Exam</option><option value="quiz">Quiz</option><option value="midterm">Midterm</option><option value="final">Final</option>
              </select>
              <input type="date" value={examForm.date} onChange={e => setExamForm({ ...examForm, date: e.target.value })} style={inputStyle} />
              <input type="number" placeholder="Max Score" value={examForm.maxScore} onChange={e => setExamForm({ ...examForm, maxScore: parseInt(e.target.value) || 100 })} style={inputStyle} />
              <button type="submit" style={{ padding: '0.6rem', background: '#6366f1', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', gridColumn: '1 / -1' }}>Create</button>
            </form>
          )}
          <div style={{ background: '#18181b', borderRadius: 12, border: '1px solid #27272a', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead><tr style={{ color: '#71717a', borderBottom: '1px solid #27272a' }}>
                <th style={{ padding: '0.75rem', textAlign: 'left' }}>Title</th>
                <th style={{ padding: '0.75rem', textAlign: 'left' }}>Type</th>
                <th style={{ padding: '0.75rem', textAlign: 'left' }}>Date</th>
                <th style={{ padding: '0.75rem', textAlign: 'left' }}>Max</th>
                <th style={{ padding: '0.75rem', textAlign: 'left' }}>Term</th>
              </tr></thead>
              <tbody>
                {examList.map(e => (
                  <tr key={e._id} style={{ borderBottom: '1px solid #27272a' }}>
                    <td style={{ padding: '0.75rem' }}>{e.titleEn}{e.titleAr ? ` (${e.titleAr})` : ''}</td>
                    <td style={{ padding: '0.75rem' }}>{e.type}</td>
                    <td style={{ padding: '0.75rem' }}>{e.date ? new Date(e.date).toLocaleDateString() : '—'}</td>
                    <td style={{ padding: '0.75rem' }}>{e.maxScore}</td>
                    <td style={{ padding: '0.75rem' }}>Term {e.term}</td>
                  </tr>
                ))}
                {examList.length === 0 && <tr><td colSpan={5} style={{ padding: '1rem', textAlign: 'center', color: '#71717a' }}>No exams yet</td></tr>}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}
