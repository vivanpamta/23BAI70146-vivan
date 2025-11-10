const request = require('supertest')
const express = require('express')
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const User = require('../models/User')
const Post = require('../models/Post')
const postRoutes = require('../routes/posts')
const { authenticateJWT } = require('../middleware/auth')

// Create test app
const app = express()
app.use(express.json())
app.use('/api/posts', authenticateJWT, postRoutes)

const JWT_SECRET = process.env.JWT_SECRET || 'replace_with_a_strong_secret'

function generateToken(user) {
  return jwt.sign(
    { role: user.role },
    JWT_SECRET,
    { subject: String(user._id), expiresIn: '15m' }
  )
}

describe('Posts Routes', () => {
  let adminUser, editorUser, viewerUser
  let adminToken, editorToken, viewerToken

  beforeAll(async () => {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/rbac_test'
    await mongoose.connect(mongoUri)

    // Create test users
    const adminHash = await bcrypt.hash('adminpass', 10)
    const editorHash = await bcrypt.hash('editorpass', 10)
    const viewerHash = await bcrypt.hash('viewerpass', 10)

    adminUser = await User.create({
      username: 'admintest',
      passwordHash: adminHash,
      role: 'Admin'
    })

    editorUser = await User.create({
      username: 'editortest',
      passwordHash: editorHash,
      role: 'Editor'
    })

    viewerUser = await User.create({
      username: 'viewertest',
      passwordHash: viewerHash,
      role: 'Viewer'
    })

    adminToken = generateToken(adminUser)
    editorToken = generateToken(editorUser)
    viewerToken = generateToken(viewerUser)
  })

  afterAll(async () => {
    await User.deleteMany({})
    await Post.deleteMany({})
    await mongoose.connection.close()
  })

  beforeEach(async () => {
    await Post.deleteMany({})
  })

  describe('POST /api/posts', () => {
    it('should create post as Admin', async () => {
      const res = await request(app)
        .post('/api/posts')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ title: 'Admin Post', content: 'Content' })

      expect(res.status).toBe(201)
      expect(res.body).toHaveProperty('_id')
      expect(res.body.title).toBe('Admin Post')
      expect(res.body.authorId).toBe(adminUser._id.toString())
    })

    it('should create post as Editor', async () => {
      const res = await request(app)
        .post('/api/posts')
        .set('Authorization', `Bearer ${editorToken}`)
        .send({ title: 'Editor Post', content: 'Content' })

      expect(res.status).toBe(201)
      expect(res.body.authorId).toBe(editorUser._id.toString())
    })

    it('should reject post creation as Viewer', async () => {
      const res = await request(app)
        .post('/api/posts')
        .set('Authorization', `Bearer ${viewerToken}`)
        .send({ title: 'Viewer Post', content: 'Content' })

      expect(res.status).toBe(403)
    })

    it('should validate input', async () => {
      const res = await request(app)
        .post('/api/posts')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ title: '', content: '' })

      expect(res.status).toBe(400)
    })
  })

  describe('GET /api/posts', () => {
    beforeEach(async () => {
      await Post.create([
        { title: 'Post 1', content: 'Content 1', authorId: adminUser._id },
        { title: 'Post 2', content: 'Content 2', authorId: editorUser._id }
      ])
    })

    it('should fetch all posts as Admin', async () => {
      const res = await request(app)
        .get('/api/posts')
        .set('Authorization', `Bearer ${adminToken}`)

      expect(res.status).toBe(200)
      expect(res.body).toHaveLength(2)
    })

    it('should fetch all posts as Editor', async () => {
      const res = await request(app)
        .get('/api/posts')
        .set('Authorization', `Bearer ${editorToken}`)

      expect(res.status).toBe(200)
      expect(res.body).toHaveLength(2)
    })

    it('should fetch all posts as Viewer', async () => {
      const res = await request(app)
        .get('/api/posts')
        .set('Authorization', `Bearer ${viewerToken}`)

      expect(res.status).toBe(200)
      expect(res.body).toHaveLength(2)
    })
  })

  describe('PUT /api/posts/:id', () => {
    let post

    beforeEach(async () => {
      post = await Post.create({
        title: 'Test Post',
        content: 'Test Content',
        authorId: editorUser._id
      })
    })

    it('should update own post as Editor', async () => {
      const res = await request(app)
        .put(`/api/posts/${post._id}`)
        .set('Authorization', `Bearer ${editorToken}`)
        .send({ title: 'Updated Title', content: 'Updated Content' })

      expect(res.status).toBe(200)
      expect(res.body.title).toBe('Updated Title')
    })

    it('should not update other user post as Editor', async () => {
      const otherPost = await Post.create({
        title: 'Other Post',
        content: 'Other Content',
        authorId: adminUser._id
      })

      const res = await request(app)
        .put(`/api/posts/${otherPost._id}`)
        .set('Authorization', `Bearer ${editorToken}`)
        .send({ title: 'Updated Title' })

      expect(res.status).toBe(403)
    })

    it('should update any post as Admin', async () => {
      const res = await request(app)
        .put(`/api/posts/${post._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ title: 'Admin Updated' })

      expect(res.status).toBe(200)
      expect(res.body.title).toBe('Admin Updated')
    })
  })

  describe('DELETE /api/posts/:id', () => {
    let post

    beforeEach(async () => {
      post = await Post.create({
        title: 'Test Post',
        content: 'Test Content',
        authorId: editorUser._id
      })
    })

    it('should delete post as Admin', async () => {
      const res = await request(app)
        .delete(`/api/posts/${post._id}`)
        .set('Authorization', `Bearer ${adminToken}`)

      expect(res.status).toBe(200)
      expect(res.body.ok).toBe(true)
    })

    it('should reject delete as Editor', async () => {
      const res = await request(app)
        .delete(`/api/posts/${post._id}`)
        .set('Authorization', `Bearer ${editorToken}`)

      expect(res.status).toBe(403)
    })

    it('should reject delete as Viewer', async () => {
      const res = await request(app)
        .delete(`/api/posts/${post._id}`)
        .set('Authorization', `Bearer ${viewerToken}`)

      expect(res.status).toBe(403)
    })
  })
})

