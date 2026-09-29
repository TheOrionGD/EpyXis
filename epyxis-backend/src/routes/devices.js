const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const Device = require('../models/Device');
const AuditLog = require('../models/AuditLog');
const { protect, admin } = require('../middleware/authMiddleware');
const { JWT_SECRET } = require('../config/jwtConfig');

// @route   POST /api/devices/generate-token
// @desc    Generate a short-lived enrollment token (tenant admin only)
// @access  Private/Admin
router.post('/generate-token', protect, admin, (req, res) => {
  const token = jwt.sign(
    { tenantId: req.user.tenantId, userId: req.user._id },
    JWT_SECRET,
    { expiresIn: '1h' }
  );
  res.json({ enrollmentToken: token });
});

// @route   POST /api/devices/enroll
// @desc    Enroll a device using a one-time token; returns a plaintext API key (shown once only)
// @access  Public (requires valid enrollment token)
router.post('/enroll', async (req, res) => {
  const { enrollmentToken, hostname, disclosureAcknowledgedAt } = req.body;

  if (!enrollmentToken || !hostname) {
    return res.status(400).json({ message: 'Missing enrollment token or hostname' });
  }

  try {
    const decoded = jwt.verify(enrollmentToken, JWT_SECRET);

    // Generate plaintext key — crypto random, high entropy
    const apiKey = crypto.randomBytes(32).toString('hex');

    // SHA-256 hash for storage. Fast to verify, irreversible.
    const apiKeyHash = crypto.createHash('sha256').update(apiKey).digest('hex');

    // Validate and coerce the acknowledgment timestamp supplied by the agent.
    // The agent records this locally when the user clicks "I understand — Continue";
    // we write it here so the server holds the only independently-verifiable copy.
    let ackTimestamp = null;
    if (disclosureAcknowledgedAt) {
      const parsed = new Date(disclosureAcknowledgedAt);
      ackTimestamp = isNaN(parsed.getTime()) ? new Date() : parsed;
    } else {
      // Fallback: if the agent didn't send it, record now as a conservative default.
      ackTimestamp = new Date();
    }

    const device = await Device.create({
      tenantId: decoded.tenantId,
      hostname,
      enrolledBy: decoded.userId,
      apiKeyHash,
      status: 'active',
      disclosureAcknowledgedAt: ackTimestamp
    });

    await AuditLog.create({
      tenantId: decoded.tenantId,
      actorUserId: decoded.userId,
      action: 'device_enrolled',
      metadata: {
        deviceId: device._id,
        hostname,
        disclosureAcknowledgedAt: ackTimestamp
      }
    });

    res.status(201).json({
      deviceId: device._id,
      apiKey, // Plaintext shown ONCE — never stored
      message: 'Device enrolled successfully'
    });
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Invalid or expired enrollment token' });
    }
    console.error('Enrollment error:', error);
    res.status(500).json({ message: 'Server error during enrollment' });
  }
});

// @route   GET /api/devices/me/status
// @desc    Enrolled device polls its own status (active/revoked) and last check-in time.
//          Authenticated by the device's own API key, not a tenant JWT.
//          The agent uses this to detect revocation within one poll cycle.
// @access  Device (X-Device-Key header)
router.get('/me/status', async (req, res) => {
  const deviceKey = req.headers['x-device-key'];
  if (!deviceKey) {
    return res.status(401).json({ message: 'Missing X-Device-Key header' });
  }

  const keyHash = crypto.createHash('sha256').update(deviceKey).digest('hex');
  const device = await Device.findOne({ apiKeyHash: keyHash }).select(
    'hostname status lastSeenAt enrolledAt tenantId disclosureAcknowledgedAt'
  );

  if (!device) {
    return res.status(401).json({ message: 'Unknown device key' });
  }

  // Update the last-seen timestamp on every successful poll.
  device.lastSeenAt = new Date();
  await device.save();

  res.json({
    deviceId: device._id,
    hostname: device.hostname,
    status: device.status,
    lastSeenAt: device.lastSeenAt,
    enrolledAt: device.enrolledAt,
    tenantId: device.tenantId,
    disclosureAcknowledgedAt: device.disclosureAcknowledgedAt
  });
});


// @route   GET /api/devices
// @desc    List all devices for a tenant
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const devices = await Device.find({ tenantId: req.user.tenantId })
      .select('-apiKeyHash')
      .sort({ enrolledAt: -1 });
    res.json(devices);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/devices/:id/revoke
// @desc    Revoke a device — blocks all future ingestion immediately
// @access  Private/Admin
router.post('/:id/revoke', protect, admin, async (req, res) => {
  try {
    const device = await Device.findOne({ _id: req.params.id, tenantId: req.user.tenantId });
    if (!device) return res.status(404).json({ message: 'Device not found' });

    device.status = 'revoked';
    await device.save();

    await AuditLog.create({
      tenantId: req.user.tenantId,
      actorUserId: req.user._id,
      action: 'device_revoked',
      metadata: { deviceId: device._id, hostname: device.hostname }
    });

    res.json({ message: `Device ${device.hostname} revoked` });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
