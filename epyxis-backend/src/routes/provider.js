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

    // 6. Mock Email
    console.log(`\n=======================================================`);
    console.log(`=== MOCK TRANSACTIONAL EMAIL: TENANT WORKSPACE READY ===`);
    console.log(`To: ${owner.email}`);
    console.log(`Subject: Your Epyxis workspace is ready`);
    console.log(`Body:\nHello ${owner.name},\nYour Epyxis workspace for ${tenant.name} is ready.`);
    console.log(`Workspace Tenant Name: ${tenant.name}`);
    console.log(`Username: ${owner.username}`);
    console.log(`Temporary Password: ${tempPassword}`);
    console.log(`Notice: Password expires in 72 hours. You must change your password on first login.`);
    console.log(`Login URL: http://localhost:5173/login`);
    console.log(`=======================================================\n`);

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

    console.log(`\n=== MOCK EMAIL: TENANT REQUEST REJECTED ===`);
    console.log(`To: ${request.workEmail}`);
    console.log(`Subject: Update on your Epyxis request`);
    console.log(`Body: Thank you for your interest. Unfortunately, we are unable to provision a workspace for ${request.orgName} at this time.\n===========================================\n`);

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

    console.log(`\n=== MOCK EMAIL: MORE INFO REQUESTED ===`);
    console.log(`To: ${request.workEmail}`);
    console.log(`Subject: Further details required for your Epyxis request`);
    console.log(`Body: Hello ${request.contactName}, our team needs additional details regarding your endpoint requirements for ${request.orgName}.\n=======================================\n`);

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
