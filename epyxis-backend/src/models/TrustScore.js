const mongoose = require('mongoose');

/**
 * TrustScore — one document per unique executable hash per device.
 *
 * Populated by POST /api/ingest/trust from TrustEngine (Module 2).
 * The agent upserts by (deviceId, sha256) so the same hash is never
 * duplicated if the service restarts before the cache warms.
 */
const trustScoreSchema = new mongoose.Schema({
  tenantId:           { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true },
  deviceId:           { type: mongoose.Schema.Types.ObjectId, ref: 'Device', required: true },

  // SHA-256 hex of the executable — primary identity key for the cache
  sha256:             { type: String, required: true },

  // Authenticode results
  isSigned:           { type: Boolean, default: false },
  signatureValid:     { type: Boolean, default: false },
  publisherName:      { type: String },
  publisherTrusted:   { type: Boolean, default: false },

  // Path heuristics
  runningFromTempPath: { type: Boolean, default: false },
  pathMismatch:        { type: Boolean, default: false },

  // Score output
  score:              { type: Number, required: true },    // 0–100
  category:           { type: String, enum: ['trusted', 'caution', 'untrusted'], required: true },

  // Display / correlation
  executablePath:     { type: String },

  evaluatedAt:        { type: Date, default: Date.now }
});

// Primary query pattern: "show all trust scores for this tenant, newest first"
trustScoreSchema.index({ tenantId: 1, deviceId: 1, evaluatedAt: -1 });

// Enforce uniqueness per device+hash at the DB level (belt-and-suspenders for upserts)
trustScoreSchema.index({ deviceId: 1, sha256: 1 }, { unique: true });

module.exports = mongoose.model('TrustScore', trustScoreSchema);
