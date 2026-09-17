const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const Tenant = require('../models/Tenant');
const User = require('../models/User');
const TenantRequest = require('../models/TenantRequest');
const { JWT_SECRET } = require('../config/jwtConfig');

const generateToken = (id) => {
  return jwt.sign({ id }, JWT_SECRET, { expiresIn: '30d' });
};

// @route   POST /api/onboarding/request
// @desc    Self-service Instant Tenant Provisioning (No System Admin Approval Needed)
// @access  Public (Open Source Self-Service)
router.post('/request', async (req, res) => {
  try {
    const { orgName, workEmail, contactName, contactRole, orgSize, industry, endpointEstimate, password } = req.body;

    if (!orgName || !workEmail || !contactName) {
      return res.status(400).json({ message: 'Please provide required fields (Organization Name, Work Email, Contact Name)' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(workEmail)) {
      return res.status(400).json({ message: 'Please enter a valid email address.' });
    }

    const cleanEmail = workEmail.toLowerCase().trim();

    // 1. Check if user already exists
    let existingUser = await User.findOne({ email: cleanEmail });
    if (existingUser) {
      return res.status(400).json({ message: 'An account with this email address already exists. Please log in directly.' });
    }

    // 2. Create Active Isolated Multi-Tenant Workspace immediately
    const tenant = new Tenant({
      name: orgName,
      status: 'active',
      planTier: 'Enterprise Open Source',
      endpointLimit: Number(endpointEstimate) || 500,
      securityPolicy: {
        passwordMinLength: 8,
        mfaRequired: false,
        sessionTimeoutMinutes: 120
      }
    });
    await tenant.save();

    // 3. Create Tenant Owner Account
    const defaultPassword = password || 'EpyxisAdmin2026!';
    const passwordHash = await bcrypt.hash(defaultPassword, 10);

    const user = new User({
      tenantId: tenant._id,
      name: contactName,
      email: cleanEmail,
      username: cleanEmail,
      passwordHash,
      role: 'owner',
      status: 'active',
      mustResetPassword: false
    });
    await user.save();

    // 4. Record Tenant Request for Audit History
    const tenantRequest = new TenantRequest({
      orgName,
      workEmail: cleanEmail,
      contactName,
      contactRole,
      orgSize,
      industry,
      endpointEstimate: Number(endpointEstimate) || 500,
      status: 'approved'
    });
    await tenantRequest.save();

    // 5. Generate Instant Device Enrollment Token
    const enrollmentToken = `epyxis-token-${tenant._id}-${crypto.randomBytes(8).toString('hex')}`;
    const userJwtToken = generateToken(user._id);

    console.log(`\n======================================================`);
    console.log(`[OPEN SOURCE SELF-SERVICE] INSTANT TENANT PROVISIONED`);
    console.log(`Tenant Name:       ${tenant.name} (${tenant._id})`);
    console.log(`Admin User:        ${user.name} (${user.email})`);
    console.log(`Enrollment Token:  ${enrollmentToken}`);
    console.log(`======================================================\n`);

    return res.status(201).json({
      success: true,
      instantProvisioned: true,
      message: 'Workspace instantly provisioned! Your open-source isolated multi-tenant environment is ready.',
      tenant: {
        id: tenant._id,
        name: tenant.name,
        status: tenant.status,
        endpointLimit: tenant.endpointLimit
      },
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        username: user.username,
        role: user.role
      },
      token: userJwtToken,
      enrollmentToken
    });

  } catch (error) {
    console.error('Error during self-service tenant provisioning:', error);
    res.status(500).json({ message: 'Server error during instant workspace provisioning' });
  }
});

module.exports = router;
