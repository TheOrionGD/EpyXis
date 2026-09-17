const mongoose = require('mongoose');

const usbEventSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true },
  deviceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Device', required: true },
  vendorId: { type: String, required: true },
  productId: { type: String, required: true },
  trusted: { type: Boolean, default: false },
  firstSeenAt: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now }
});

usbEventSchema.index({ tenantId: 1, deviceId: 1, createdAt: -1 });

module.exports = mongoose.model('UsbEvent', usbEventSchema);
