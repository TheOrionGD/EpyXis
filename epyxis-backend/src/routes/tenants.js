const express = require('express');
const router = express.Router();
const { deviceAuth } = require('../middleware/deviceAuthMiddleware');
const Tenant = require('../models/Tenant');

// @route   GET /api/tenants/trusted-publishers
// @desc    Returns the trusted publishers allowlist for the requesting device's tenant.
// @access  Device (X-Device-Key)
router.get('/trusted-publishers', deviceAuth, async (req, res) => {
  try {
    const tenant = await Tenant.findById(req.device.tenantId).select('securityPolicy.trustedPublishers');
    if (!tenant) {
      return res.status(404).json({ message: 'Tenant not found' });
    }

    const trustedPublishers = tenant.securityPolicy?.trustedPublishers || [
      'Microsoft Corporation',
      'Microsoft Windows',
      'Microsoft Windows Publisher',
      'Google LLC',
      'Apple Inc.'
    ];

    res.json({ trustedPublishers });
  } catch (error) {
    console.error('Fetch trusted publishers error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

const { protect, admin } = require('../middleware/authMiddleware');

// @route   GET /api/tenants/settings
// @desc    Get tenant profile and security policy defaults
// @access  Protected
router.get('/settings', protect, async (req, res) => {
  try {
    const tenant = await Tenant.findById(req.user.tenantId);
    if (!tenant) return res.status(404).json({ message: 'Tenant not found' });
    res.json(tenant);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching tenant settings' });
  }
});

// @route   POST /api/tenants/settings
// @desc    Update tenant security policy and profile defaults
// @access  Protected (Admin / Owner)
router.post('/settings', protect, admin, async (req, res) => {
  try {
    const tenant = await Tenant.findById(req.user.tenantId);
    if (!tenant) return res.status(404).json({ message: 'Tenant not found' });

    const { securityPolicy, name } = req.body;
    if (name) tenant.name = name;
    if (securityPolicy) {
      tenant.securityPolicy = {
        ...tenant.securityPolicy.toObject(),
        ...securityPolicy
      };
    }
    tenant.updatedAt = new Date();
    await tenant.save();

    const AuditLog = require('../models/AuditLog');
    await AuditLog.create({
      tenantId: tenant._id,
      actorUserId: req.user._id,
      action: 'security_policy_updated',
      metadata: { securityPolicy: tenant.securityPolicy }
    });

    res.json(tenant);
  } catch (error) {
    res.status(500).json({ message: 'Server error updating tenant settings' });
  }
});

module.exports = router;
