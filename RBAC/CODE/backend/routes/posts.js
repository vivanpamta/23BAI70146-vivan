const express = require('express')
const Post = require('../models/Post')
const Audit = require('../models/Audit')
const { authenticateJWT } = require('../middleware/auth')
const { authorize } = require('../middleware/authorize')
const { validatePostCreate, validatePostUpdate } = require('../middleware/validation')
const logger = require('../utils/logger')
const router = express.Router()

// Create post
router.post('/', authenticateJWT, authorize('posts:create'), validatePostCreate, async (req, res, next) => {
  const corrId = req.corrId || 'unknown'
  const { title, content } = req.body
  
  try {
    const post = new Post({ 
      title: title.trim(), 
      content: content.trim(), 
      authorId: req.user.id 
    })
    await post.save()
    
    // Audit logging
    try {
      await Audit.create({ 
        action: 'create', 
        resource: 'Post', 
        resourceId: post._id, 
        performedBy: req.user.id, 
        meta: { title: post.title } 
      })
    } catch(e) {
      logger.warn('Audit creation failed', {
        correlationId: corrId,
        error: e.message
      })
    }
    
    logger.info('Post created', {
      correlationId: corrId,
      postId: post._id,
      userId: req.user.id,
      title: post.title
    })
    
    res.status(201).json(post)
  } catch (err) {
    logger.error('Post creation error', {
      correlationId: corrId,
      error: err.message,
      stack: err.stack
    })
    next(err)
  }
})

// Read posts (scoped by role)
router.get('/', authenticateJWT, authorize('posts:read'), async (req, res, next) => {
  const corrId = req.corrId || 'unknown'
  const role = req.user.role
  
  try {
    let query = {}
    // For Editors we show all posts for read. If you want restricted view, change here.
    // Example: if (role === 'Viewer') query = { public: true }
    
    const posts = await Post.find(query)
      .populate('authorId', 'username role')
      .sort({ createdAt: -1 })
    
    logger.debug('Posts fetched', {
      correlationId: corrId,
      userId: req.user.id,
      role,
      count: posts.length
    })
    
    res.json(posts)
  } catch (err) {
    logger.error('Posts fetch error', {
      correlationId: corrId,
      error: err.message,
      stack: err.stack
    })
    next(err)
  }
})

// Update post
router.put('/:id', authenticateJWT, authorize('posts:update'), validatePostUpdate, async (req, res, next) => {
  const corrId = req.corrId || 'unknown'
  const { id } = req.params
  const { title, content } = req.body
  
  try {
    const post = await Post.findById(id)
    if (!post) {
      logger.warn('Post not found for update', {
        correlationId: corrId,
        postId: id,
        userId: req.user.id
      })
      return res.status(404).json({ message: 'Not found' })
    }

    // Ownership check: Editors can only edit their own posts
    if (req.user.role === 'Editor' && String(post.authorId) !== String(req.user.id)) {
      logger.warn('Post update denied: ownership check failed', {
        correlationId: corrId,
        postId: id,
        userId: req.user.id,
        postAuthorId: post.authorId
      })
      return res.status(403).json({ message: 'Editors can only update their own posts' })
    }

    if (title) post.title = title.trim()
    if (content) post.content = content.trim()
    post.updatedAt = new Date()
    await post.save()
    
    // Audit logging
    try {
      await Audit.create({ 
        action: 'update', 
        resource: 'Post', 
        resourceId: post._id, 
        performedBy: req.user.id, 
        meta: { title: post.title } 
      })
    } catch(e) {
      logger.warn('Audit creation failed', {
        correlationId: corrId,
        error: e.message
      })
    }
    
    logger.info('Post updated', {
      correlationId: corrId,
      postId: post._id,
      userId: req.user.id
    })
    
    res.json(post)
  } catch (err) {
    logger.error('Post update error', {
      correlationId: corrId,
      error: err.message,
      stack: err.stack
    })
    next(err)
  }
})

// Delete post
router.delete('/:id', authenticateJWT, authorize('posts:delete'), async (req, res, next) => {
  const corrId = req.corrId || 'unknown'
  const { id } = req.params
  
  try {
    const post = await Post.findById(id)
    if (!post) {
      logger.warn('Post not found for delete', {
        correlationId: corrId,
        postId: id,
        userId: req.user.id
      })
      return res.status(404).json({ message: 'Not found' })
    }

    // Ownership: Editors don't have delete permission in roles config, but if changed, enforce here
    if (req.user.role === 'Editor' && String(post.authorId) !== String(req.user.id)) {
      logger.warn('Post delete denied: ownership check failed', {
        correlationId: corrId,
        postId: id,
        userId: req.user.id,
        postAuthorId: post.authorId
      })
      return res.status(403).json({ message: 'Editors can only delete their own posts' })
    }

    await Post.findByIdAndDelete(id)
    
    // Audit logging
    try {
      await Audit.create({ 
        action: 'delete', 
        resource: 'Post', 
        resourceId: post._id, 
        performedBy: req.user.id 
      })
    } catch(e) {
      logger.warn('Audit creation failed', {
        correlationId: corrId,
        error: e.message
      })
    }
    
    logger.info('Post deleted', {
      correlationId: corrId,
      postId: id,
      userId: req.user.id
    })
    
    res.json({ ok: true })
  } catch (err) {
    logger.error('Post delete error', {
      correlationId: corrId,
      error: err.message,
      stack: err.stack
    })
    next(err)
  }
})

module.exports = router
