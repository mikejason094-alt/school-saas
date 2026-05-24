export default function errorHandler(err, req, res, _next) {
  console.error('Error:', err)
  const status = err.status || err.statusCode || 500
  if (status === 500) {
    res.status(500).json({ message: 'Internal server error' })
  } else {
    res.status(status).json({ message: err.message || 'Error' })
  }
}
