const crypto = require('crypto');
const Device = require('../models/Device');

/**
 * Device authentication middleware.
 * Expects header: X-Device-Key: <plaintext key>
 * Verifies using SHA-256 against stored hash — fast, irreversible, no bcrypt overhead.
 * Enforces device.status === 'active' so revocation takes immediate effect.
 */
const deviceAuth = async (req, res, next) => {
  const rawKey = req.headers['x-device-key'];
  if (!rawKey) {
    return res.status(401).json({ message: 'Missing X-Device-Key header' });
  }

  const keyHash = crypto.createHash('sha256').update(rawKey).digest('hex');

  try {
    const device = await Device.findOne({ apiKeyHash: keyHash });

    if (!device) {
      return res.status(401).json({ message: 'Invalid device key' });
    }

    if (device.status !== 'active') {
      return res.status(403).json({ message: 'Device is revoked or inactive' });
    }

    // Attach full device doc so routes can access tenantId, _id, hostname
    req.device = device;

    // Update lastSeenAt — fire-and-forget, don't block the request
    Device.updateOne({ _id: device._id }, { lastSeenAt: new Date() }).exec();

    next();
  } catch (err) {
    res.status(500).json({ message: 'Server error during device auth' });
  }
};

module.exports = { deviceAuth };
