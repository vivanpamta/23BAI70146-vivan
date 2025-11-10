const roles = require('../config/roles')
const logger = require('../utils/logger')
const metrics = require('../utils/metrics')

// returns middleware checking permission string like 'posts:update'
function authorize(permission) {
  return (req, res, next) => {
    const role = req.user?.role
    const corrId = req.corrId || 'unknown'
    
    if (!role) {
      metrics.increment('authorizationDenials')
      logger.warn('Authorization failed: unauthenticated', {
        correlationId: corrId,
        permission,
        path: req.path,
        method: req.method
      })
      return res.status(401).json({ 
        message: 'Unauthenticated',
        correlationId: corrId
      })
    }

    const rolePerms = roles[role] || {}
    if (rolePerms[permission]) {
      metrics.increment('authorizationSuccesses')
      logger.debug('Authorization successful', {
        correlationId: corrId,
        userId: req.user.id,
        role,
        permission,
        path: req.path
      })
      return next()
    }

    metrics.increment('authorizationDenials')
    logger.warn('Authorization denied: missing permission', {
      correlationId: corrId,
      userId: req.user.id,
      role,
      permission,
      path: req.path,
      method: req.method
    })
    return res.status(403).json({ 
      message: `Forbidden: missing permission ${permission}`,
      correlationId: corrId,
      role,
      requiredPermission: permission
    })
  }
}

module.exports = { authorize }
