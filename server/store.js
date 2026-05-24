import PGStore from './pgstore.js'

const connectionString = process.env.DATABASE_URL
let store

if (connectionString) {
  console.log('Using PostgreSQL store')
  store = new PGStore(connectionString)
} else {
  console.log('DATABASE_URL not set — please set it in environment')
  process.exit(1)
}

export default store
