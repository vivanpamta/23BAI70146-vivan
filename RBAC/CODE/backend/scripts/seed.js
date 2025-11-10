// Seed script: create Admin, Editor, Viewer and sample posts
require('dotenv').config()
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const User = require('../models/User')
const Post = require('../models/Post')

async function run() {
  const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/rbac_demo'
  await mongoose.connect(uri)
  console.log('Connected to', uri)

  await User.deleteMany({})
  await Post.deleteMany({})

  const adminHash = await bcrypt.hash('admin@123', 10)
  const editorHash = await bcrypt.hash('creator@123', 10)
  const viewerHash = await bcrypt.hash('viewer@123', 10)

  const admin = await User.create({ username: 'admin', passwordHash: adminHash, role: 'Admin' })
  const editor = await User.create({ username: 'contentcreator', passwordHash: editorHash, role: 'Editor' })
  const viewer = await User.create({ username: 'viewer', passwordHash: viewerHash, role: 'Viewer' })

  console.log('Users created: admin/editor/viewer (passwords: adminpass/editorpass/viewerpass)')

  await Post.create({ title: 'Admin Post', content: 'Post created by admin', authorId: admin._id })
  await Post.create({ title: 'Editor Post', content: 'Post created by editor', authorId: editor._id })
  await Post.create({ title: 'Public Post', content: 'Post visible to all', authorId: admin._id })

  // create audit entries for seed actions
  const Audit = require('../models/Audit')
  await Audit.create({ action: 'seed', resource: 'User', resourceId: admin._id, performedBy: admin._id, meta: { username: admin.username } })
  await Audit.create({ action: 'seed', resource: 'User', resourceId: editor._id, performedBy: admin._id, meta: { username: editor.username } })
  await Audit.create({ action: 'seed', resource: 'User', resourceId: viewer._id, performedBy: admin._id, meta: { username: viewer.username } })

  console.log('Sample posts created')
  process.exit(0)
}

run().catch((err) => { console.error(err); process.exit(1) })
