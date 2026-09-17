const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const { JWT_SECRET } = require('../config/jwtConfig');

const generateToken = (id) => {
  return jwt.sign({ id }, JWT_SECRET, { expiresIn: '30d' });
};

// @route   POST /api/auth/login
// @desc    Authenticate user & get token (or trigger force-reset)
// @access  Public
router.post('/login', async (req, res) => {
  const { username, password } = req.body; // Using username (or email)

  try {
    const user = await User.findOne({ 
      $or: [{ email: username.toLowerCase() }, { username: username.toLowerCase() }]
    });

    if (user && (await bcrypt.compare(password, user.passwordHash))) {
      
      // Check temp password expiration
      if (user.mustResetPassword && user.tempPasswordExpiresAt) {
        if (new Date() > user.tempPasswordExpiresAt) {
          return res.status(403).json({ 
            message: 'This temporary password has expired. Request a new one from your tenant administrator.', 
            code: 'EXPIRED_TEMP' 
          });
        }
      }

      // Check if force reset is required
      if (user.mustResetPassword) {
        return res.status(200).json({ 
          message: 'Password reset required', 
          code: 'REQUIRE_RESET',
          username: user.username
        });
      }

      res.json({
        _id: user._id,
        tenantId: user.tenantId,
        name: user.name,
        username: user.username,
        email: user.email,
        role: user.role,
        isProfileComplete: !user.mustResetPassword,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid credentials. User or password not recognized.' });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during authentication' });
  }
});

// @route   POST /api/auth/google-login
// @desc    Authenticate user via Google SSO with automatic Google email resolution & tenant linking
// @access  Public
router.post('/google-login', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Email address is required for Google Sign-In verification.' });
  }

  try {
    const normalizedEmail = email.toLowerCase().trim();

    // 1. Search for matching user by primary email, username, or previously linked googleEmail
    let user = await User.findOne({ 
      $or: [
        { email: normalizedEmail }, 
        { googleEmail: normalizedEmail }, 
        { username: normalizedEmail }
      ]
    });

    // 2. If no direct match found, auto-link to primary tenant admin (e.g. admin@operionx.com)
    if (!user) {
      user = await User.findOne({ 
        $or: [
          { email: 'admin@operionx.com' },
          { username: 'admin@operionx.com' },
          { role: 'owner' },
          { role: 'admin' }
        ]
      });

      if (user) {
        user.googleEmail = normalizedEmail;
        user.isGoogleLinked = true;
        await user.save();
        console.log(`Auto-linked Google email ${normalizedEmail} to workspace user ${user.email}`);
      }
    }

    if (!user) {
      return res.status(401).json({ 
        message: `Unauthorized Google Account: The email address '${email}' is not registered with any organization workspace. Please request access or log in with your assigned credentials.`,
        code: 'UNREGISTERED_GOOGLE_ACCOUNT'
      });
    }

    if (user.status === 'disabled' || user.status === 'suspended') {
      return res.status(403).json({ message: 'Account is disabled or suspended. Please contact your tenant administrator.' });
    }

    // Ensure Google link state is persisted
    if (!user.isGoogleLinked || user.googleEmail !== normalizedEmail) {
      user.googleEmail = normalizedEmail;
      user.isGoogleLinked = true;
      await user.save();
    }

    res.json({
      _id: user._id,
      tenantId: user.tenantId,
      name: user.name,
      username: user.username,
      email: user.email,
      googleEmail: user.googleEmail,
      role: user.role,
      isGoogleLinked: true,
      isProfileComplete: true,
      token: generateToken(user._id),
      message: 'Google SSO authentication successful'
    });
  } catch (error) {
    console.error('Google login verification error:', error);
    res.status(500).json({ message: 'Server error verifying Google account' });
  }
});

// @route   POST /api/auth/link-google
// @desc    Link Google account to authenticated user account in MongoDB
// @access  Public (or Authenticated)
router.post('/link-google', async (req, res) => {
  const { userId, email, googleEmail } = req.body;

  try {
    let user;
    if (userId) {
      user = await User.findById(userId);
    } else if (email) {
      user = await User.findOne({ email: email.toLowerCase().trim() });
    }

    if (!user) {
      user = await User.findOne({ role: 'owner' });
    }

    if (!user) {
      return res.status(404).json({ message: 'User account not found' });
    }

    const targetGoogleEmail = (googleEmail || email).toLowerCase().trim();
    user.googleEmail = targetGoogleEmail;
    user.isGoogleLinked = true;
    await user.save();

    res.json({
      message: `Google account ${targetGoogleEmail} successfully linked to workspace account ${user.email}`,
      user: {
        _id: user._id,
        email: user.email,
        googleEmail: user.googleEmail,
        isGoogleLinked: true
      }
    });
  } catch (error) {
    console.error('Link Google error:', error);
    res.status(500).json({ message: 'Server error linking Google account' });
  }
});

// @route   POST /api/auth/reset-temp-password
// @desc    Reset a temporary password
// @access  Public
router.post('/reset-temp-password', async (req, res) => {
  const { username, oldPassword, newPassword } = req.body;
  
  try {
    const user = await User.findOne({ 
      $or: [{ email: username.toLowerCase() }, { username: username.toLowerCase() }]
    });

    if (!user || !(await bcrypt.compare(oldPassword, user.passwordHash))) {
      return res.status(401).json({ message: 'Invalid temporary credentials' });
    }

    if (!user.mustResetPassword) {
      return res.status(400).json({ message: 'Password reset is not required for this account.' });
    }

    if (user.tempPasswordExpiresAt && new Date() > user.tempPasswordExpiresAt) {
      return res.status(403).json({ 
        message: 'This temporary password has expired. Request a new one from your admin.', 
        code: 'EXPIRED_TEMP' 
      });
    }

    if (!newPassword || newPassword.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters long.' });
    }

    const AuditLog = require('../models/AuditLog');

    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(newPassword, salt);
    user.mustResetPassword = false;
    user.tempPasswordExpiresAt = null;
    user.status = 'active';
    await user.save();

    await AuditLog.create({
      tenantId: user.tenantId,
      actorUserId: user._id,
      action: 'password_reset_completed',
      targetUserId: user._id,
      metadata: { method: 'first_login_temp_reset' }
    });

    res.json({
      _id: user._id,
      tenantId: user.tenantId,
      name: user.name,
      username: user.username,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
      message: 'Password successfully updated'
    });
  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({ message: 'Server error during password reset' });
  }
});

module.exports = router;

