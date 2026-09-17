const mongoose = require('mongoose');

const tenantRequestSchema = new mongoose.Schema({
  orgName: { type: String, required: true },
  workEmail: { type: String, required: true, unique: true }, // domain-validated
  contactName: { type: String, required: true },
  contactRole: { type: String },
  orgSize: { type: String },
  industry: { type: String },
  endpointEstimate: { type: Number },
  phone: { type: String },
  status: { type: String, enum: ['pending', 'approved', 'rejected', 'more_info'], default: 'pending' },
  internalNotes: { type: String, default: '' },
  submittedAt: { type: Date, default: Date.now },
  reviewedAt: { type: Date },
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'ProviderUser' }
});

module.exports = mongoose.model('TenantRequest', tenantRequestSchema);
