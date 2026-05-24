import pkg from 'pg'
const { Pool } = pkg

let idCounter = Date.now()
function newId() { return String(++idCounter) }

function matchQuery(obj, query) {
  for (const [key, val] of Object.entries(query)) {
    if (key === '_id') { if (obj._id !== val) return false }
    else if (val && typeof val === 'object' && '$in' in val) { if (!val.$in.includes(obj[key])) return false }
    else { if (obj[key] !== val) return false }
  }
  return true
}

class Collection {
  constructor(pool, name) {
    this.pool = pool
    this.name = name
  }

  async _init() {
    await this.pool.query(`
        CREATE TABLE IF NOT EXISTS saas_saas_documents (
        id SERIAL PRIMARY KEY,
        collection VARCHAR(100) NOT NULL,
        doc_id VARCHAR(100) NOT NULL,
        data JSONB NOT NULL DEFAULT '{}'::jsonb,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(collection, doc_id)
      )
    `)
  }

  async _allDocs(tenantId) {
    if (tenantId) {
      const result = await this.pool.query(
        'SELECT doc_id, data FROM saas_documents WHERE collection = $1 AND data->>\'tenantId\' = $2 ORDER BY id',
        [this.name, tenantId]
      )
      return result.rows.map(r => ({ ...r.data, _id: r.doc_id }))
    }
    const result = await this.pool.query(
      'SELECT doc_id, data FROM saas_documents WHERE collection = $1 ORDER BY id',
      [this.name]
    )
    return result.rows.map(r => ({ ...r.data, _id: r.doc_id }))
  }

  async findOne(query) {
    if (query._id) {
      const result = await this.pool.query(
        'SELECT data FROM saas_documents WHERE collection = $1 AND doc_id = $2 LIMIT 1',
        [this.name, query._id]
      )
      if (!result.rows[0]) return null
      return { ...result.rows[0].data, _id: result.rows[0].data._id || query._id }
    }
    const docs = await this._allDocs(query.tenantId)
    for (const doc of docs) {
      if (matchQuery(doc, query)) return doc
    }
    return null
  }

  async find(query = {}) {
    const docs = await this._allDocs(query.tenantId)
    const results = docs.filter(d => matchQuery(d, query))
    const q = { _results: results }
    q.sort = function (sortObj) {
      const field = Object.keys(sortObj)[0]
      const dir = sortObj[field]
      this._results.sort((a, b) => {
        if (a[field] < b[field]) return -1 * dir
        if (a[field] > b[field]) return 1 * dir
        return 0
      })
      return this
    }
    q.then = (resolve) => resolve(q._results)
    q.exec = async () => q._results
    return q
  }

  async _save(doc) {
    await this.pool.query(`
      INSERT INTO saas_documents (collection, doc_id, data, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $4)
      ON CONFLICT (collection, doc_id)
      DO UPDATE SET data = $3, updated_at = NOW()
    `, [this.name, doc._id, doc, new Date().toISOString()])
  }

  async insertOne(data) {
    const doc = { ...data, _id: newId(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
    await this._save(doc)
    return doc
  }

  async insertMany(arr) {
    const results = []
    for (const data of arr) results.push(await this.insertOne(data))
    return results
  }

  async updateOne(query, updates) {
    const doc = await this.findOne(query)
    if (!doc) return null
    Object.assign(doc, updates, { updatedAt: new Date().toISOString() })
    await this._save(doc)
    return doc
  }

  async deleteOne(query) {
    if (query._id) {
      const result = await this.pool.query(
        'DELETE FROM saas_documents WHERE collection = $1 AND doc_id = $2',
        [this.name, query._id]
      )
      return { deletedCount: result.rowCount }
    }
    const docs = await this._allDocs(query.tenantId)
    for (const doc of docs) {
      if (matchQuery(doc, query)) {
        await this.pool.query('DELETE FROM saas_documents WHERE collection = $1 AND doc_id = $2', [this.name, doc._id])
        return { deletedCount: 1 }
      }
    }
    return { deletedCount: 0 }
  }

  async deleteMany(query = {}) {
    if (query.tenantId) {
      const docs = await this._allDocs(query.tenantId)
      let count = 0
      for (const doc of docs) {
        if (matchQuery(doc, query)) {
          await this.pool.query('DELETE FROM saas_documents WHERE collection = $1 AND doc_id = $2', [this.name, doc._id])
          count++
        }
      }
      return { deletedCount: count }
    }
    const result = await this.pool.query('DELETE FROM saas_documents WHERE collection = $1', [this.name])
    return { deletedCount: result.rowCount }
  }
}

export default class PGStore {
  constructor(connectionString) {
    this.pool = new Pool({ connectionString, ssl: { rejectUnauthorized: false } })
    const cols = ['schools', 'users', 'students', 'teachers', 'classes', 'fees', 'feePayments', 'grades', 'exams', 'attendance', 'subjects', 'timetable']
    for (const name of cols) {
      this[name] = new Collection(this.pool, name)
    }
  }

  async init() {
    await this.schools._init()
  }

  async seed() {
    const bcrypt = (await import('bcryptjs')).default
    const superAdmin = await this.users.findOne({ email: 'superadmin@schoolsaas.com' })
    if (!superAdmin) {
      console.log('Creating super admin...')
      const pw = await bcrypt.hash('superadmin123', 12)
      await this.users.insertOne({ email: 'superadmin@schoolsaas.com', password: pw, role: 'superadmin', nameEn: 'Super Admin', nameAr: 'المشرف العام' })
      console.log('Super admin created: superadmin@schoolsaas.com / superadmin123')
    }
  }
}
