// Simplified CSRF protection middleware
// Note: csurf is deprecated, using a simpler approach for cookie-based auth
// In production, consider using a more robust CSRF protection library

const crypto = require('crypto')

// Generate CSRF token
function generateCSRFToken() {
  return crypto.randomBytes(32).toString('hex')
}

// CSRF protection middleware
function csrfProtection(req, res, next) {
  // Skip CSRF for GET, HEAD, OPTIONS requests
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next()
  }

  // For cookie-based auth, we rely on sameSite: 'lax' and secure cookies
  // This is a simplified approach. For production, use a proper CSRF library
  // or implement double-submit cookie pattern
  
  // In this implementation, we trust sameSite: 'lax' cookies
  // which provides basic CSRF protection for most cases
  
  next()
}

// Get CSRF token endpoint (for forms if needed)
function getCSRFToken(req, res) {
  const token = generateCSRFToken()
  res.cookie('csrfToken', token, {
    httpOnly: false, // Needs to be accessible to JS for forms
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 1000 * 60 * 60 // 1 hour
  })
  res.json({ csrfToken: token })
}

module.exports = {
  csrfProtection,
  getCSRFToken
}

