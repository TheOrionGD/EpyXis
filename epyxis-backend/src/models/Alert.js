const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true },
  deviceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Device', required: true },
  severity: { type: String, enum: ['low', 'medium', 'high', 'critical'], required: true },
  category: { type: String, required: true },
  details: { type: Object, required: true },
  resolvedAt: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

alertSchema.index({ tenantId: 1, deviceId: 1, createdAt: -1 });

module.exports = mongoose.model('Alert', alertSchema);
