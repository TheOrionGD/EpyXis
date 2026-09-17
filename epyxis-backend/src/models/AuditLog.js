const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true },
  actorUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // admin or system
  action: { type: String, required: true }, // e.g. "tenant_approved", "user_created"
  targetUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  metadata: { type: mongoose.Schema.Types.Mixed }, // freeform Object
  createdAt: { type: Date, default: Date.now }
});

auditLogSchema.index({ tenantId: 1, createdAt: -1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);
