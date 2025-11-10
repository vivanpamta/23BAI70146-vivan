const request = require('supertest')
const express = require('express')
const jwt = require('jsonwebtoken')

// small test app
const app = express()
app.use(express.json())

// create a mock authorize middleware by requiring the real one
const { authorize } = require('../middleware/authorize')

app.get('/protected', (req, res, next) => {
  // attach a fake user via header token for test
  const auth = req.headers.authorization || ''
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null
  if (token) {
    try { const p = jwt.verify(token, process.env.JWT_SECRET || 'replace_with_a_strong_secret'); req.user = { role: p.role, id: p.sub }; } catch(e){}
  }
  next()
}, authorize('posts:read'), (req,res) => res.json({ ok: true }))

describe('authorize middleware', () => {
  it('should allow access when role has permission', async () => {
    const token = jwt.sign({ role: 'Viewer' }, process.env.JWT_SECRET || 'replace_with_a_strong_secret', { subject: 'user1' })
    const res = await request(app).get('/protected').set('Authorization', `Bearer ${token}`)
    expect(res.status).toBe(200)
    expect(res.body.ok).toBe(true)
  })

  it('should deny access when role lacks permission', async () => {
    const token = jwt.sign({ role: 'Viewer' }, process.env.JWT_SECRET || 'replace_with_a_strong_secret', { subject: 'user1' })
    // temporarily modify roles config so Viewer has no posts:read
    const roles = require('../config/roles')
    const orig = roles.Viewer['posts:read']
    roles.Viewer['posts:read'] = false
    const res = await request(app).get('/protected').set('Authorization', `Bearer ${token}`)
    expect(res.status).toBe(403)
    roles.Viewer['posts:read'] = orig
  })
})

