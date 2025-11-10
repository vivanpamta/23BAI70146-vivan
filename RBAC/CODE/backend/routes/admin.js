const express = require('express')
const User = require('../models/User')
const bcrypt = require('bcrypt')
const { authenticateJWT } = require('../middleware/auth')
const { authorize } = require('../middleware/authorize')
const { validateUserCreate } = require('../middleware/validation')
const logger = require('../utils/logger')
const router = express.Router()

// Admin only: list users
router.get('/users', authenticateJWT, authorize('users:manage'), async (req, res, next) => {
  const corrId = req.corrId || 'unknown'
  
  try {
    const users = await User.find({}, 'username role createdAt').sort({ createdAt: -1 })
    
    logger.debug('Users list fetched', {
      correlationId: corrId,
      userId: req.user.id,
      count: users.length
    })
    
    res.json(users)
  } catch (err) {
    logger.error('Users list error', {
      correlationId: corrId,
      error: err.message,
      stack: err.stack
    })
    next(err)
  }
})

// Admin: create user
router.post('/users', authenticateJWT, authorize('users:manage'), validateUserCreate, async (req, res, next) => {
  const corrId = req.corrId || 'unknown'
  const { username, password, role } = req.body
  
  try {
    const existing = await User.findOne({ username })
    if (existing) {
      logger.warn('User creation failed: username exists', {
        correlationId: corrId,
        username,
        userId: req.user.id
      })
      return res.status(409).json({ message: 'Username already exists' })
    }
    
    const hash = await bcrypt.hash(password, 10)
    const user = new User({ 
      username: username.trim(), 
      passwordHash: hash, 
      role: role || 'Viewer' 
    })
    await user.save()
    
    // Audit user creation
    try {
      const Audit = require('../models/Audit')
      await Audit.create({ 
        action: 'create_user', 
        resource: 'User', 
        resourceId: user._id, 
        performedBy: req.user.id, 
        meta: { username: user.username, role: user.role } 
      })
    } catch(e) {
      logger.warn('Audit creation failed', {
        correlationId: corrId,
        error: e.message
      })
    }
    
    logger.info('User created', {
      correlationId: corrId,
      newUserId: user._id,
      username: user.username,
      role: user.role,
      createdBy: req.user.id
    })
    
    res.status(201).json({ 
      id: user._id, 
      username: user.username, 
      role: user.role,
      createdAt: user.createdAt
    })
  } catch (err) {
    logger.error('User creation error', {
      correlationId: corrId,
      error: err.message,
      stack: err.stack
    })
    next(err)
  }
})

module.exports = router
