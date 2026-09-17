const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const Device = require('../models/Device');
const DeviceEvent = require('../models/DeviceEvent');
const TrustScore = require('../models/TrustScore');
const BehaviorMetric = require('../models/BehaviorMetric');
const UsbEvent = require('../models/UsbEvent');
const Alert = require('../models/Alert');

// All dashboard routes require user authentication
router.use(protect);

// Helper to scope queries by tenantId
const getTenantScope = (req) => ({ tenantId: req.user.tenantId });

// @route   GET /api/dashboard/devices
router.get('/devices', async (req, res) => {
  try {
    const devices = await Device.find(getTenantScope(req)).sort({ createdAt: -1 });
    res.json(devices);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/dashboard/events
router.get('/events', async (req, res) => {
  try {
    const events = await DeviceEvent.find(getTenantScope(req)).sort({ createdAt: -1 }).limit(100);
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/dashboard/trust-scores
router.get('/trust-scores', async (req, res) => {
  try {
    const scores = await TrustScore.find(getTenantScope(req)).sort({ evaluatedAt: -1 }).limit(100);
    res.json(scores);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/dashboard/behavior
router.get('/behavior', async (req, res) => {
  try {
    const behavior = await BehaviorMetric.find(getTenantScope(req)).sort({ createdAt: -1 }).limit(100);
    res.json(behavior);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/dashboard/usb
router.get('/usb', async (req, res) => {
  try {
    const usb = await UsbEvent.find(getTenantScope(req)).sort({ createdAt: -1 });
    res.json(usb);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/dashboard/alerts
router.get('/alerts', async (req, res) => {
  try {
    const alerts = await Alert.find(getTenantScope(req)).sort({ createdAt: -1 });
    res.json(alerts);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
