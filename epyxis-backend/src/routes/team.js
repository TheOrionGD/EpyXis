const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

// Helper for scoping
const getTenantScope = (req) => ({ tenantId: req.user.tenantId });

// @route   GET /api/team/users
router.get('/users', async (req, res) => {
  try {
    const users = await User.find(getTenantScope(req)).select('-passwordHash').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/team/users
router.post('/users', async (req, res) => {
  // Only admin or owner can create users
  if (req.user.role !== 'admin' && req.user.role !== 'owner') {
    return res.status(403).json({ message: 'Not authorized' });
  }

  const { name, email, role, password } = req.body;
  
  try {
    const existing = await User.findOne({ tenantId: req.user.tenantId, email });
    if (existing) return res.status(400).json({ message: 'User already exists in workspace' });

    let tempPassword = password;
    if (!tempPassword) {
      tempPassword = crypto.randomBytes(8).toString('hex');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(tempPassword, salt);
    
    const expiry = new Date();
    expiry.setHours(expiry.getHours() + 72);

    const user = new User({
      tenantId: req.user.tenantId,
      name,
      email,
      username: email,
      passwordHash,
      role: role || 'viewer',
      mustResetPassword: true,
      tempPasswordExpiresAt: expiry,
      status: 'invited',
      createdBy: req.user._id
    });
    
    await user.save();

    await AuditLog.create({
      tenantId: req.user.tenantId,
      actorUserId: req.user._id,
      action: 'user_created',
      targetUserId: user._id,
      metadata: { role: user.role }
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      tempPassword // Only returned once!
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/team/users/:id/reset
router.post('/users/:id/reset', async (req, res) => {
  if (req.user.role !== 'admin' && req.user.role !== 'owner') {
    return res.status(403).json({ message: 'Not authorized' });
  }
  
  try {
    const user = await User.findOne({ _id: req.params.id, tenantId: req.user.tenantId });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const tempPassword = crypto.randomBytes(8).toString('hex');
    const salt = await bcrypt.genSalt(10);
    
    user.passwordHash = await bcrypt.hash(tempPassword, salt);
    user.mustResetPassword = true;
    user.tempPasswordExpiresAt = new Date(Date.now() + 72 * 60 * 60 * 1000);
    await user.save();

    await AuditLog.create({
      tenantId: req.user.tenantId,
      actorUserId: req.user._id,
      action: 'password_reset_forced',
      targetUserId: user._id
    });

    if (process.env.NODE_ENV !== 'production') {
      console.log(`\n=== DEV ONLY: TEMP PASSWORD for ${user.email}: ${tempPassword} ===\n`);
    }

    res.json({ message: 'Password reset', tempPassword });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/team/users/:id/disable
router.post('/users/:id/disable', async (req, res) => {
  if (req.user.role !== 'admin' && req.user.role !== 'owner') {
    return res.status(403).json({ message: 'Not authorized' });
  }
  
  try {
    const user = await User.findOne({ _id: req.params.id, tenantId: req.user.tenantId });
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.status = 'disabled';
    await user.save();

    await AuditLog.create({
      tenantId: req.user.tenantId,
      actorUserId: req.user._id,
      action: 'user_disabled',
      targetUserId: user._id
    });

    res.json({ message: 'User disabled' });
  } catch (error) {
    res.status(500).json({ message: 'Server error disabling user' });
  }
});

// @route   GET /api/team/audit-logs
// @desc    Get tenant-scoped audit trail
router.get('/audit-logs', async (req, res) => {
  try {
    const auditLogs = await AuditLog.find(getTenantScope(req))
      .populate('actorUserId', 'name email role')
      .populate('targetUserId', 'name email role')
      .sort({ createdAt: -1 })
      .limit(100);

    res.json(auditLogs);
  } catch (error) {
    console.error('Audit log error:', error);
    res.status(500).json({ message: 'Server error fetching audit logs' });
  }
});

module.exports = router;
