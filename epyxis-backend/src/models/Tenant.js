const mongoose = require('mongoose');

const tenantSchema = new mongoose.Schema({
  name: { type: String, required: true },
  domain: { type: String }, // Optional now
  planTier: { type: String },
  endpointLimit: { type: Number },
  status: { type: String, enum: ['active', 'suspended', 'pending'], default: 'pending' },
  securityPolicy: {
    passwordMinLength: { type: Number, default: 8 },
    mfaRequired: { type: Boolean, default: false },
    sessionTimeoutMinutes: { type: Number, default: 60 },
    trustedPublishers: {
      type: [String],
      default: [
        'Microsoft Corporation',
        'Microsoft Windows',
        'Microsoft Windows Publisher',
        'Google LLC',
        'Apple Inc.'
      ]
    }
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  createdFromRequestId: { type: mongoose.Schema.Types.ObjectId, ref: 'TenantRequest' }
});

module.exports = mongoose.model('Tenant', tenantSchema);
