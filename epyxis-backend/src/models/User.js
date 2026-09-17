const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true },
  name: { type: String, required: true },
  email: { type: String, required: true }, // removed unique: true because of compound index
  username: { type: String, required: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['owner', 'admin', 'analyst', 'viewer'], default: 'viewer' },
  mustResetPassword: { type: Boolean, default: false },
  tempPasswordExpiresAt: { type: Date },
  googleEmail: { type: String, default: null },
  isGoogleLinked: { type: Boolean, default: false },
  status: { type: String, enum: ['invited', 'active', 'disabled'], default: 'invited' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

userSchema.index({ tenantId: 1, email: 1 }, { unique: true });
userSchema.index({ tenantId: 1, username: 1 }, { unique: true });

module.exports = mongoose.model('User', userSchema);
