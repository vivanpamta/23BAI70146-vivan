const request = require('supertest')
const express = require('express')
const jwt = require('jsonwebtoken')
const { authorize } = require('../middleware/authorize')

const JWT_SECRET = process.env.JWT_SECRET || 'replace_with_a_strong_secret'

describe('Authorize Middleware', () => {
  let app

  beforeEach(() => {
    app = express()
    app.use(express.json())
    
    // Mock authenticateJWT middleware
    app.use((req, res, next) => {
      const auth = req.headers.authorization || ''
      const token = auth.startsWith('Bearer ') ? auth.slice(7) : null
      if (token) {
        try {
          const payload = jwt.verify(token, JWT_SECRET)
          req.user = { id: payload.sub, role: payload.role }
          req.corrId = 'test-correlation-id'
        } catch(e) {
          // Invalid token
        }
      }
      next()
    })
  })

  it('should allow access when role has permission', async () => {
    const token = jwt.sign({ role: 'Viewer' }, JWT_SECRET, { subject: 'user1' })
    
    app.get('/protected', authorize('posts:read'), (req, res) => {
      res.json({ ok: true })
    })

    const res = await request(app)
      .get('/protected')
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(res.body.ok).toBe(true)
  })

  it('should deny access when role lacks permission', async () => {
    const token = jwt.sign({ role: 'Viewer' }, JWT_SECRET, { subject: 'user1' })
    
    app.post('/protected', authorize('posts:create'), (req, res) => {
      res.json({ ok: true })
    })

    const res = await request(app)
      .post('/protected')
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(403)
    expect(res.body.message).toContain('Forbidden')
  })

  it('should deny access when unauthenticated', async () => {
    app.get('/protected', authorize('posts:read'), (req, res) => {
      res.json({ ok: true })
    })

    const res = await request(app)
      .get('/protected')

    expect(res.status).toBe(401)
    expect(res.body.message).toBe('Unauthenticated')
  })

  it('should allow Admin to access all permissions', async () => {
    const token = jwt.sign({ role: 'Admin' }, JWT_SECRET, { subject: 'admin1' })
    
    app.post('/protected', authorize('posts:create'), (req, res) => {
      res.json({ ok: true })
    })

    const res = await request(app)
      .post('/protected')
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
  })
})

