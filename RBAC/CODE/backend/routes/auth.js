const express = require('express')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const User = require('../models/User')
const { validateLogin } = require('../middleware/validation')
const logger = require('../utils/logger')
const metrics = require('../utils/metrics')
const router = express.Router()

const ACCESS_EXPIRES = process.env.ACCESS_TOKEN_EXPIRES || '15m'
const REFRESH_EXPIRES = process.env.REFRESH_TOKEN_EXPIRES || '7d'
const JWT_SECRET = process.env.JWT_SECRET || 'replace_with_a_strong_secret'

// login - issues access token (short-lived) with role claim
router.post('/login', validateLogin, async (req, res, next) => {
  const corrId = req.corrId || 'unknown'
  const { username, password } = req.body

  try {
    const user = await User.findOne({ username })
    if (!user) {
      metrics.increment('authenticationFailures')
      logger.warn('Login failed: user not found', {
        correlationId: corrId,
        username
      })
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    const ok = await bcrypt.compare(password, user.passwordHash)
    if (!ok) {
      metrics.increment('authenticationFailures')
      logger.warn('Login failed: invalid password', {
        correlationId: corrId,
        username,
        userId: user._id
      })
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    // create JWT
    const payload = { role: user.role }
    const token = jwt.sign(payload, JWT_SECRET, { 
      subject: String(user._id), 
      expiresIn: ACCESS_EXPIRES, 
      jwtid: Date.now().toString() 
    })
    const refresh = jwt.sign({ sub: String(user._id) }, JWT_SECRET, { 
      expiresIn: REFRESH_EXPIRES 
    })

    // Set refresh token as httpOnly cookie
    res.cookie('refreshToken', refresh, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60 * 24 * 7 // 7 days
    })

    metrics.increment('authenticationSuccesses')
    logger.info('Login successful', {
      correlationId: corrId,
      userId: user._id,
      username: user.username,
      role: user.role
    })

    // Return only access token and user info
    res.json({ 
      accessToken: token, 
      user: { id: user._id, username: user.username, role: user.role } 
    })
  } catch (err) {
    logger.error('Login error', {
      correlationId: corrId,
      error: err.message,
      stack: err.stack
    })
    next(err)
  }
})

// refresh endpoint
router.post('/refresh', async (req, res, next) => {
  const corrId = req.corrId || 'unknown'
  const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken
  
  if (!refreshToken) {
    return res.status(400).json({ message: 'refreshToken required' })
  }
  
  try {
    const payload = jwt.verify(refreshToken, JWT_SECRET)
    const userId = payload.sub
    const user = await User.findById(userId)
    
    if (!user) {
      logger.warn('Refresh failed: user not found', {
        correlationId: corrId,
        userId
      })
      return res.status(401).json({ message: 'Invalid refresh token' })
    }
    
    const token = jwt.sign(
      { role: user.role }, 
      JWT_SECRET, 
      { 
        subject: String(user._id), 
        expiresIn: ACCESS_EXPIRES, 
        jwtid: Date.now().toString() 
      }
    )
    
    logger.debug('Token refreshed', {
      correlationId: corrId,
      userId: user._id
    })
    
    return res.json({ accessToken: token })
  } catch (err) {
    logger.warn('Refresh failed: invalid token', {
      correlationId: corrId,
      error: err.message
    })
    return res.status(401).json({ message: 'Invalid or expired refresh token' })
  }
})

// logout - clear refresh cookie
router.post('/logout', (req, res) => {
  const corrId = req.corrId || 'unknown'
  const userId = req.user?.id
  
  logger.info('Logout', {
    correlationId: corrId,
    userId
  })
  
  res.clearCookie('refreshToken', { 
    httpOnly: true, 
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production'
  })
  return res.json({ ok: true })
})

module.exports = router
