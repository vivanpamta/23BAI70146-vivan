const jwt = require('jsonwebtoken')
const { v4: uuidv4 } = require('uuid')
const logger = require('../utils/logger')
const metrics = require('../utils/metrics')

function authenticateJWT(req, res, next) {
  // Generate correlation ID if not present
  req.corrId = req.corrId || uuidv4()
  
  const authHeader = req.headers.authorization || ''
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null
  
  if (!token) {
    metrics.increment('authenticationFailures')
    logger.warn('Authentication failed: missing token', {
      correlationId: req.corrId,
      path: req.path,
      method: req.method
    })
    return res.status(401).json({ 
      message: 'Missing token',
      correlationId: req.corrId
    })
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'replace_with_a_strong_secret')
    // attach user info
    req.user = { id: payload.sub, role: payload.role, jti: payload.jti }
    metrics.increment('authenticationSuccesses')
    logger.info('Authentication successful', {
      correlationId: req.corrId,
      userId: req.user.id,
      role: req.user.role,
      path: req.path
    })
    next()
  } catch (err) {
    metrics.increment('authenticationFailures')
    logger.warn('Authentication failed: invalid token', {
      correlationId: req.corrId,
      error: err.message,
      path: req.path
    })
    return res.status(401).json({ 
      message: 'Invalid or expired token',
      correlationId: req.corrId
    })
  }
}

module.exports = { authenticateJWT }
