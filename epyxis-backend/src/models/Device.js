const mongoose = require('mongoose');

const deviceSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
  hostname: { type: String, required: true },
  enrolledBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  apiKeyHash: { type: String, required: true },
  status: { type: String, enum: ['active', 'revoked'], default: 'active' },
  enrolledAt: { type: Date, default: Date.now },
  lastSeenAt: { type: Date, default: Date.now },
  // Server-side consent record — the only independently verifiable copy.
  // Written at enrollment time from the timestamp the local service recorded
  // when the user clicked "I understand — Continue" on the disclosure form.
  disclosureAcknowledgedAt: { type: Date, default: null }
});

module.exports = mongoose.model('Device', deviceSchema);
