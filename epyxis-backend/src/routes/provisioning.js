const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const Tenant = require('../models/Tenant');
const User = require('../models/User');

// @route   POST /api/provisioning/tenant
// @desc    Provision a new tenant and admin user
// @access  Public (or protected depending on business logic, assuming public for request form)
router.post('/tenant', async (req, res) => {
  const { tenantName, domain, adminEmail, adminPassword } = req.body;

  try {
    const tenantExists = await Tenant.findOne({ domain });
    if (tenantExists) {
      return res.status(400).json({ message: 'Tenant domain already exists' });
    }

    const userExists = await User.findOne({ email: adminEmail });
    if (userExists) {
      return res.status(400).json({ message: 'User email already exists' });
    }

    const tenant = await Tenant.create({
      name: tenantName,
      domain,
      status: 'active' // usually 'pending', but set active for simplicity
    });

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(adminPassword, salt);

    const user = await User.create({
      tenantId: tenant._id,
      email: adminEmail,
      passwordHash,
      role: 'admin'
    });

    res.status(201).json({
      tenantId: tenant._id,
      adminUserId: user._id,
      message: 'Tenant provisioned successfully'
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
