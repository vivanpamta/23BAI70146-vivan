const request = require('supertest')
const express = require('express')
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const User = require('../models/User')
const authRoutes = require('../routes/auth')

// Create test app
const app = express()
app.use(express.json())
app.use('/api/auth', authRoutes)

describe('Auth Routes', () => {
  let testUser

  beforeAll(async () => {
    // Connect to test database
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/rbac_test'
    await mongoose.connect(mongoUri)
    
    // Create test user
    const passwordHash = await bcrypt.hash('testpass', 10)
    testUser = await User.create({
      username: 'testuser',
      passwordHash,
      role: 'Editor'
    })
  })

  afterAll(async () => {
    await User.deleteMany({})
    await mongoose.connection.close()
  })

  describe('POST /api/auth/login', () => {
    it('should login with valid credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ username: 'testuser', password: 'testpass' })

      expect(res.status).toBe(200)
      expect(res.body).toHaveProperty('accessToken')
      expect(res.body).toHaveProperty('user')
      expect(res.body.user.username).toBe('testuser')
      expect(res.body.user.role).toBe('Editor')
      expect(res.headers['set-cookie']).toBeDefined()
    })

    it('should reject invalid username', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ username: 'invalid', password: 'testpass' })

      expect(res.status).toBe(401)
      expect(res.body.message).toBe('Invalid credentials')
    })

    it('should reject invalid password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ username: 'testuser', password: 'wrongpass' })

      expect(res.status).toBe(401)
      expect(res.body.message).toBe('Invalid credentials')
    })

    it('should validate input', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ username: 'ab', password: 'test' }) // Too short

      expect(res.status).toBe(400)
      expect(res.body).toHaveProperty('errors')
    })
  })

  describe('POST /api/auth/refresh', () => {
    it('should refresh token with valid refresh token', async () => {
      // First login
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({ username: 'testuser', password: 'testpass' })

      const refreshToken = loginRes.headers['set-cookie'][0].split(';')[0].split('=')[1]

      const res = await request(app)
        .post('/api/auth/refresh')
        .set('Cookie', `refreshToken=${refreshToken}`)

      expect(res.status).toBe(200)
      expect(res.body).toHaveProperty('accessToken')
    })

    it('should reject invalid refresh token', async () => {
      const res = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken: 'invalid' })

      expect(res.status).toBe(401)
    })
  })

  describe('POST /api/auth/logout', () => {
    it('should logout successfully', async () => {
      const res = await request(app)
        .post('/api/auth/logout')

      expect(res.status).toBe(200)
      expect(res.body.ok).toBe(true)
    })
  })
})

