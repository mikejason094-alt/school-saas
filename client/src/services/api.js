const API = '/api'

function getToken() { return localStorage.getItem('token') }

async function request(url, options = {}) {
  const token = getToken()
  const headers = { 'Content-Type': 'application/json', ...options.headers }
  if (token) headers['Authorization'] = `Bearer ${token}`
  const res = await fetch(`${API}${url}`, { ...options, headers })
  const data = await res.json()
  if (!res.ok) throw new Error(data.message || 'Request failed')
  return data
}

export const auth = {
  login: (body) => request('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
}

export const schools = {
  list: () => request('/schools'),
  get: (id) => request(`/schools/${id}`),
  create: (body) => request('/schools', { method: 'POST', body: JSON.stringify(body) }),
  update: (id, body) => request(`/schools/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  delete: (id) => request(`/schools/${id}`, { method: 'DELETE' }),
  login: (id) => request(`/schools/${id}/login`, { method: 'POST' }),
}

export const students = {
  list: (params) => request(`/students?${new URLSearchParams(params || '')}`),
  get: (id) => request(`/students/${id}`),
  create: (body) => request('/students', { method: 'POST', body: JSON.stringify(body) }),
  update: (id, body) => request(`/students/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  delete: (id) => request(`/students/${id}`, { method: 'DELETE' }),
}

export const teachers = {
  list: (params) => request(`/teachers?${new URLSearchParams(params || '')}`),
  create: (body) => request('/teachers', { method: 'POST', body: JSON.stringify(body) }),
  update: (id, body) => request(`/teachers/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  delete: (id) => request(`/teachers/${id}`, { method: 'DELETE' }),
}

export const classes = {
  list: () => request('/classes'),
  create: (body) => request('/classes', { method: 'POST', body: JSON.stringify(body) }),
  update: (id, body) => request(`/classes/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  delete: (id) => request(`/classes/${id}`, { method: 'DELETE' }),
}

export const fees = {
  list: (params) => request(`/fees?${new URLSearchParams(params || '')}`),
  create: (body) => request('/fees', { method: 'POST', body: JSON.stringify(body) }),
  pay: (id, body) => request(`/fees/${id}/pay`, { method: 'POST', body: JSON.stringify(body) }),
  payments: () => request('/fees/payments'),
}

export const attendance = {
  list: (params) => request(`/attendance?${new URLSearchParams(params || '')}`),
  batch: (records) => request('/attendance/batch', { method: 'POST', body: JSON.stringify({ records }) }),
  stats: (studentId) => request(`/attendance/stats/${studentId}`),
}

export const grades = {
  list: (params) => request(`/grades?${new URLSearchParams(params || '')}`),
  create: (body) => request('/grades', { method: 'POST', body: JSON.stringify(body) }),
  batch: (grades) => request('/grades/batch', { method: 'POST', body: JSON.stringify({ grades }) }),
  subjects: () => request('/grades/subjects'),
  createSubject: (body) => request('/grades/subjects', { method: 'POST', body: JSON.stringify(body) }),
  exams: () => request('/grades/exams'),
  createExam: (body) => request('/grades/exams', { method: 'POST', body: JSON.stringify(body) }),
}
