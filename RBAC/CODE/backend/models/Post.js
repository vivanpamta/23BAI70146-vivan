const mongoose = require('mongoose')
const { Schema } = mongoose

const postSchema = new Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  authorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date }
})

postSchema.index({ authorId: 1 })

module.exports = mongoose.model('Post', postSchema)
