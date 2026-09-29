const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const TenantRequest = require('../models/TenantRequest');
const Tenant = require('../models/Tenant');
const User = require('../models/User');
const ProviderUser = require('../models/ProviderUser');
const AuditLog = require('../models/AuditLog');
const { providerProtect } = require('../middleware/authMiddleware');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/jwtConfig');
const { sendTransactionalEmail } = require('../services/emailService');

const generateToken = (id) => {
  return jwt.sign({ id }, JWT_SECRET, { expiresIn: '12h' });
};

// @route   POST /api/provider/login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const providerUser = await ProviderUser.findOne({ username });
    if (providerUser && (await bcrypt.compare(password, providerUser.passwordHash))) {
      res.json({
        _id: providerUser._id,
        name: providerUser.name,
        username: providerUser.username,
        token: generateToken(providerUser._id)
      });
    } else {
      res.status(401).json({ message: 'Invalid provider credentials' });
    }
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Protect all following provider routes
router.use(providerProtect);

// @route   GET /api/provider/requests
router.get('/requests', async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status && status !== 'all' ? { status } : {};
    const requests = await TenantRequest.find(filter).sort({ submittedAt: -1 });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching requests' });
  }
});

// @route   POST /api/provider/requests/:id/notes
// @desc    Update internal notes for a tenant request
router.post('/requests/:id/notes', async (req, res) => {
  try {
    const { notes } = req.body;
    const request = await TenantRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: 'Request not found' });

    request.internalNotes = notes || '';
    await request.save();

    res.json({ message: 'Notes updated successfully', internalNotes: request.internalNotes });
  } catch (error) {
    res.status(500).json({ message: 'Server error updating notes' });
  }
});

// @route   POST /api/provider/requests/:id/approve
router.post('/requests/:id/approve', async (req, res) => {
  try {
    const request = await TenantRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: 'Request not found' });
    if (request.status === 'approved') return res.status(400).json({ message: 'Request already approved' });

    // 1. Create Tenant
    const tenant = new Tenant({
      name: request.orgName,
      domain: request.workEmail.split('@')[1],
      planTier: 'Enterprise',
      endpointLimit: request.endpointEstimate || 100,
      status: 'active',
      createdFromRequestId: request._id
    });
    await tenant.save();

    // 2. Generate Temp Password
    const tempPassword = crypto.randomBytes(6).toString('hex') + 'A1!'; // e.g. 3a89f0e12cA1!
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(tempPassword, salt);
    
    const expiry = new Date();
    expiry.setHours(expiry.getHours() + 72); // 72 hour expiry

    // 3. Create Tenant Owner
    const owner = new User({
      tenantId: tenant._id,
      name: request.contactName,
      email: request.workEmail,
      username: request.workEmail, // System-generated username
      passwordHash: passwordHash,
      role: 'owner',
      mustResetPassword: true,
      tempPasswordExpiresAt: expiry,
      status: 'active'
    });
    await owner.save();

    // 4. Update Request
    request.status = 'approved';
    if (req.body.notes) request.internalNotes = req.body.notes;
    request.reviewedAt = new Date();
    request.reviewedBy = req.providerUser._id;
    await request.save();

    // 5. Audit Log
    await AuditLog.create({
      tenantId: tenant._id,
      action: 'tenant_approved',
      targetUserId: owner._id,
      metadata: { requestId: request._id, providerUserId: req.providerUser._id }
    });

    // 6. Dispatch Real Transactional Email
    await sendTransactionalEmail({
      to: owner.email,
      subject: `Your Epyxis Enterprise Security Workspace is Ready: ${tenant.name}`,
      text: `Hello ${owner.name},\n\nYour isolated workspace for ${tenant.name} is active and ready.\n\nTenant Name: ${tenant.name}\nUsername: ${owner.username}\nTemporary Password: ${tempPassword}\n\nNotice: Password expires in 72 hours. You must change your password on first login.\nLogin Portal: http://localhost:5173/login\n\nSecurity Operations Team\nEpyxis Precision Endpoint Governance`
    });

    res.json({ 
      message: 'Tenant approved and provisioned successfully', 
      tenantId: tenant._id,
      tempPassword 
    });
  } catch (error) {
    console.error('Approve tenant error:', error);
    res.status(500).json({ message: 'Server error approving tenant' });
  }
});

// @route   POST /api/provider/requests/:id/reject
router.post('/requests/:id/reject', async (req, res) => {
  try {
    const request = await TenantRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: 'Request not found' });

    request.status = 'rejected';
    if (req.body.reason || req.body.notes) {
      request.internalNotes = req.body.reason || req.body.notes;
    }
    request.reviewedAt = new Date();
    request.reviewedBy = req.providerUser._id;
    await request.save();

    await sendTransactionalEmail({
      to: request.workEmail,
      subject: `Update on your Epyxis Workspace Request - ${request.orgName}`,
      text: `Hello ${request.contactName},\n\nThank you for your interest in Epyxis Endpoint Security. Unfortunately, our team is unable to provision an enterprise workspace for ${request.orgName} at this time.\n\nSecurity Operations Team\nEpyxis Precision Endpoint Governance`
    });

    res.json({ message: 'Tenant request rejected' });
  } catch (error) {
    console.error('Reject tenant error:', error);
    res.status(500).json({ message: 'Server error rejecting request' });
  }
});

// @route   POST /api/provider/requests/:id/more-info
router.post('/requests/:id/more-info', async (req, res) => {
  try {
    const request = await TenantRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: 'Request not found' });

    request.status = 'more_info';
    if (req.body.notes) request.internalNotes = req.body.notes;
    request.reviewedAt = new Date();
    request.reviewedBy = req.providerUser._id;
    await request.save();

    await sendTransactionalEmail({
      to: request.workEmail,
      subject: `Further Information Required: Epyxis Workspace for ${request.orgName}`,
      text: `Hello ${request.contactName},\n\nOur security governance team is reviewing your workspace application for ${request.orgName}. Additional endpoint specifications are required before enrollment keys can be minted.\n\nPlease reply directly to this notice with your endpoint deployment parameters.\n\nSecurity Operations Team\nEpyxis Precision Endpoint Governance`
    });

    res.json({ message: 'More info requested from tenant' });
  } catch (error) {
    console.error('Request more info error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/provider/tenants
// @desc    Provider oversight view of active tenants
router.get('/tenants', async (req, res) => {
  try {
    const tenants = await Tenant.find().sort({ createdAt: -1 });
    const userCounts = await User.aggregate([
      { $group: { _id: '$tenantId', totalUsers: { $sum: 1 } } }
    ]);
    const userCountMap = {};
    userCounts.forEach(u => { userCountMap[u._id.toString()] = u.totalUsers; });

    const tenantSummaries = tenants.map(t => ({
      _id: t._id,
      name: t.name,
      domain: t.domain,
      planTier: t.planTier || 'Enterprise',
      endpointLimit: t.endpointLimit || 100,
      status: t.status,
      activeUsers: userCountMap[t._id.toString()] || 1,
      createdAt: t.createdAt
    }));

    res.json(tenantSummaries);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching provider tenant overview' });
  }
});

module.exports = router;
