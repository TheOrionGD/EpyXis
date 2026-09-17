const mongoose = require('mongoose');

const behaviorMetricSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true },
  deviceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Device', required: true },
  userSessionDate: { type: Date, required: true },
  activeAppSeconds: { type: Number, default: 0 },
  focusSwitchCount: { type: Number, default: 0 },
  keyboardActivityCount: { type: Number, default: 0 }, // count only, never content
  createdAt: { type: Date, default: Date.now }
});

behaviorMetricSchema.index({ tenantId: 1, deviceId: 1, createdAt: -1 });

module.exports = mongoose.model('BehaviorMetric', behaviorMetricSchema);
