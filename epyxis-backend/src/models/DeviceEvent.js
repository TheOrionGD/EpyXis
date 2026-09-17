const mongoose = require('mongoose');

const deviceEventSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true },
  deviceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Device', required: true },
  eventType: { type: String, required: true }, // "process_start" | "startup_entry" | "service_change" | ...
  payload: { type: Object, required: true },
  createdAt: { type: Date, default: Date.now }
});

deviceEventSchema.index({ tenantId: 1, deviceId: 1, createdAt: -1 });

module.exports = mongoose.model('DeviceEvent', deviceEventSchema);
