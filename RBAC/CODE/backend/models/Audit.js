const mongoose = require('mongoose')
const { Schema } = mongoose

const auditSchema = new Schema({
  action: { type: String, required: true },
  resource: { type: String },
  resourceId: { type: Schema.Types.ObjectId },
  performedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  meta: { type: Schema.Types.Mixed },
  createdAt: { type: Date, default: Date.now }
})

module.exports = mongoose.model('Audit', auditSchema)
