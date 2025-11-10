const logger = require('../utils/logger')

// Error handling middleware
function errorHandler(err, req, res, next) {
  const corrId = req.corrId || 'unknown'
  
  // Log error
  logger.error('Request error', {
    correlationId: corrId,
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    userId: req.user?.id
  })

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      message: 'Validation error',
      errors: Object.values(err.errors).map(e => e.message)
    })
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    return res.status(409).json({
      message: 'Duplicate entry',
      field: Object.keys(err.keyPattern)[0]
    })
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ message: 'Invalid token' })
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ message: 'Token expired' })
  }

  // Default error
  const statusCode = err.statusCode || err.status || 500
  const message = err.message || 'Internal server error'

  res.status(statusCode).json({
    message,
    correlationId: corrId,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  })
}

// 404 handler
function notFoundHandler(req, res) {
  res.status(404).json({
    message: 'Route not found',
    path: req.path,
    method: req.method
  })
}

module.exports = {
  errorHandler,
  notFoundHandler
}

