const express = require('express');
const router = express.Router();
const { deviceAuth } = require('../middleware/deviceAuthMiddleware');
const DeviceEvent = require('../models/DeviceEvent');
const UsbEvent = require('../models/UsbEvent');
const BehaviorMetric = require('../models/BehaviorMetric');
const Alert = require('../models/Alert');
const TrustScore = require('../models/TrustScore');

router.use(deviceAuth);

/**
 * Allowlist helper — strips any key not in the approved set.
 * Returns { valid: false, missing: [...] } if required fields are absent.
 */
function pick(obj, allowed, required = []) {
  const filtered = {};
  for (const key of allowed) {
    if (obj[key] !== undefined) filtered[key] = obj[key];
  }
  const missing = required.filter(k => filtered[k] === undefined);
  return { payload: filtered, missing };
}

// @route   POST /api/ingest/process
// Approved fields:
//   eventType       (string)  — "process_snapshot" | "process_start" | "process_stop"
//   pid             (int)     — process ID
//   ppid            (int)     — parent process ID
//   name            (string)  — process image name (no path components beyond the exe name)
//   execPath        (string)  — full executable path (no arguments — command lines are never captured)
//   startTime       (string)  — ISO-8601 UTC start time of the process
//   publisher       (string)  — code-signing publisher CN, if available
//   signatureStatus (string)  — "valid" | "invalid" | "unsigned" | "unknown"
//   snapshotSeq     (int)     — monotonic sequence number for snapshot correlation (snapshot events only)
//
// Never captures: command-line arguments, environment variables, file contents.
// execPath is the image path only; any args that appear after the exe name are stripped
// by the agent before transmission (see IntegrityMonitor.cs RedactArgs()).
router.post('/process', async (req, res) => {
  const ALLOWED = ['eventType', 'pid', 'ppid', 'name', 'execPath', 'startTime', 'publisher', 'signatureStatus', 'snapshotSeq'];
  const REQUIRED = ['eventType', 'pid', 'name'];
  const VALID_EVENT_TYPES = ['process_snapshot', 'process_start', 'process_stop'];
  const { payload, missing } = pick(req.body, ALLOWED, REQUIRED);

  if (missing.length) {
    return res.status(400).json({ message: `Missing required fields: ${missing.join(', ')}` });
  }

  if (!VALID_EVENT_TYPES.includes(payload.eventType)) {
    return res.status(400).json({ message: `eventType must be one of: ${VALID_EVENT_TYPES.join(', ')}` });
  }

  // pid/ppid/snapshotSeq must be non-negative integers
  for (const intField of ['pid', 'ppid', 'snapshotSeq']) {
    if (payload[intField] !== undefined && (!Number.isInteger(payload[intField]) || payload[intField] < 0)) {
      return res.status(400).json({ message: `${intField} must be a non-negative integer` });
    }
  }

  // execPath sanity: must not exceed 2048 chars; truncate silently
  if (payload.execPath && payload.execPath.length > 2048) {
    payload.execPath = payload.execPath.slice(0, 2048);
  }

  try {
    await DeviceEvent.create({
      tenantId: req.device.tenantId,
      deviceId: req.device._id,
      eventType: payload.eventType,
      payload: {
        pid:             payload.pid,
        ppid:            payload.ppid,
        name:            payload.name,
        execPath:        payload.execPath,
        startTime:       payload.startTime,
        publisher:       payload.publisher,
        signatureStatus: payload.signatureStatus,
        snapshotSeq:     payload.snapshotSeq
      }
    });
    res.status(202).send();
  } catch (error) {
    res.status(500).json({ message: 'Ingest error' });
  }
});

// @route   POST /api/ingest/startup
// Approved fields:
//   eventType   (string) — "startup_snapshot" | "startup_added" | "startup_removed"
//   hive        (string) — "HKCU" | "HKLM" | "StartupFolder"
//   name        (string) — value name / shortcut name
//   execPath    (string) — image path only (no arguments)
//   snapshotSeq (int)    — for snapshot correlation
// Never captures: full command-line arguments beyond the image path.
router.post('/startup', async (req, res) => {
  const ALLOWED = ['eventType', 'hive', 'name', 'execPath', 'snapshotSeq'];
  const REQUIRED = ['eventType', 'name'];
  const VALID_EVENT_TYPES = ['startup_snapshot', 'startup_added', 'startup_removed'];
  const { payload, missing } = pick(req.body, ALLOWED, REQUIRED);

  if (missing.length) {
    return res.status(400).json({ message: `Missing required fields: ${missing.join(', ')}` });
  }

  if (!VALID_EVENT_TYPES.includes(payload.eventType)) {
    return res.status(400).json({ message: `eventType must be one of: ${VALID_EVENT_TYPES.join(', ')}` });
  }

  if (payload.execPath && payload.execPath.length > 2048) {
    payload.execPath = payload.execPath.slice(0, 2048);
  }

  try {
    await DeviceEvent.create({
      tenantId: req.device.tenantId,
      deviceId: req.device._id,
      eventType: payload.eventType,
      payload: {
        hive:        payload.hive,
        name:        payload.name,
        execPath:    payload.execPath,
        snapshotSeq: payload.snapshotSeq
      }
    });
    res.status(202).send();
  } catch (error) {
    res.status(500).json({ message: 'Ingest error' });
  }
});

// @route   POST /api/ingest/service
// Approved fields:
//   eventType     (string) — "service_snapshot" | "service_state_changed"
//   serviceName   (string) — short service name (e.g. "wuauserv")
//   displayName   (string) — human-readable display name
//   status        (string) — "Running" | "Stopped" | "Paused" | "StartPending" | etc.
//   startType     (string) — "Automatic" | "Manual" | "Disabled"
//   execPath      (string) — image path (no arguments)
//   previousStatus (string) — previous status for delta events
//   snapshotSeq   (int)    — for snapshot correlation
router.post('/service', async (req, res) => {
  const ALLOWED = ['eventType', 'serviceName', 'displayName', 'status', 'startType', 'execPath', 'previousStatus', 'snapshotSeq'];
  const REQUIRED = ['eventType', 'serviceName', 'status'];
  const VALID_EVENT_TYPES = ['service_snapshot', 'service_state_changed'];
  const { payload, missing } = pick(req.body, ALLOWED, REQUIRED);

  if (missing.length) {
    return res.status(400).json({ message: `Missing required fields: ${missing.join(', ')}` });
  }

  if (!VALID_EVENT_TYPES.includes(payload.eventType)) {
    return res.status(400).json({ message: `eventType must be one of: ${VALID_EVENT_TYPES.join(', ')}` });
  }

  if (payload.execPath && payload.execPath.length > 2048) {
    payload.execPath = payload.execPath.slice(0, 2048);
  }

  try {
    await DeviceEvent.create({
      tenantId: req.device.tenantId,
      deviceId: req.device._id,
      eventType: payload.eventType,
      payload: {
        serviceName:    payload.serviceName,
        displayName:    payload.displayName,
        status:         payload.status,
        startType:      payload.startType,
        execPath:       payload.execPath,
        previousStatus: payload.previousStatus,
        snapshotSeq:    payload.snapshotSeq
      }
    });
    res.status(202).send();
  } catch (error) {
    res.status(500).json({ message: 'Ingest error' });
  }
});

// @route   POST /api/ingest/scheduledtask
// Approved fields:
//   eventType   (string) — "task_snapshot" | "task_added" | "task_removed" | "task_state_changed"
//   taskPath    (string) — Task Scheduler path (e.g. "\Microsoft\Windows\UpdateOrchestrator\Schedule Scan")
//   taskName    (string) — friendly task name
//   status      (string) — "Ready" | "Running" | "Disabled" | "Unknown"
//   execPath    (string) — action execute path (no arguments)
//   snapshotSeq (int)    — for snapshot correlation
// Never captures: task arguments/parameters.
router.post('/scheduledtask', async (req, res) => {
  const ALLOWED = ['eventType', 'taskPath', 'taskName', 'status', 'execPath', 'snapshotSeq'];
  const REQUIRED = ['eventType', 'taskName'];
  const VALID_EVENT_TYPES = ['task_snapshot', 'task_added', 'task_removed', 'task_state_changed'];
  const { payload, missing } = pick(req.body, ALLOWED, REQUIRED);

  if (missing.length) {
    return res.status(400).json({ message: `Missing required fields: ${missing.join(', ')}` });
  }

  if (!VALID_EVENT_TYPES.includes(payload.eventType)) {
    return res.status(400).json({ message: `eventType must be one of: ${VALID_EVENT_TYPES.join(', ')}` });
  }

  if (payload.execPath && payload.execPath.length > 2048) {
    payload.execPath = payload.execPath.slice(0, 2048);
  }

  if (payload.taskPath && payload.taskPath.length > 1024) {
    payload.taskPath = payload.taskPath.slice(0, 1024);
  }

  try {
    await DeviceEvent.create({
      tenantId: req.device.tenantId,
      deviceId: req.device._id,
      eventType: payload.eventType,
      payload: {
        taskPath:    payload.taskPath,
        taskName:    payload.taskName,
        status:      payload.status,
        execPath:    payload.execPath,
        snapshotSeq: payload.snapshotSeq
      }
    });
    res.status(202).send();
  } catch (error) {
    res.status(500).json({ message: 'Ingest error' });
  }
});

// @route   POST /api/ingest/driver
// Approved fields:
//   eventType   (string) — "driver_snapshot" | "driver_added" | "driver_removed"
//   name        (string) — driver service name
//   displayName (string) — display name
//   state       (string) — "Running" | "Stopped" | "Unknown"
//   pathName    (string) — .sys file path (no arguments)
//   snapshotSeq (int)    — for snapshot correlation
router.post('/driver', async (req, res) => {
  const ALLOWED = ['eventType', 'name', 'displayName', 'state', 'pathName', 'snapshotSeq'];
  const REQUIRED = ['eventType', 'name'];
  const VALID_EVENT_TYPES = ['driver_snapshot', 'driver_added', 'driver_removed'];
  const { payload, missing } = pick(req.body, ALLOWED, REQUIRED);

  if (missing.length) {
    return res.status(400).json({ message: `Missing required fields: ${missing.join(', ')}` });
  }

  if (!VALID_EVENT_TYPES.includes(payload.eventType)) {
    return res.status(400).json({ message: `eventType must be one of: ${VALID_EVENT_TYPES.join(', ')}` });
  }

  if (payload.pathName && payload.pathName.length > 2048) {
    payload.pathName = payload.pathName.slice(0, 2048);
  }

  try {
    await DeviceEvent.create({
      tenantId: req.device.tenantId,
      deviceId: req.device._id,
      eventType: payload.eventType,
      payload: {
        name:        payload.name,
        displayName: payload.displayName,
        state:       payload.state,
        pathName:    payload.pathName,
        snapshotSeq: payload.snapshotSeq
      }
    });
    res.status(202).send();
  } catch (error) {
    res.status(500).json({ message: 'Ingest error' });
  }
});

// @route   POST /api/ingest/usb
// Approved fields: vendorId, productId, deviceClass, serialNumber, action (insert|remove), trusted (bool)
// Never captures: device content, raw HID reports
router.post('/usb', async (req, res) => {
  const ALLOWED = ['vendorId', 'productId', 'deviceClass', 'serialNumber', 'action', 'trusted'];
  const REQUIRED = ['vendorId', 'productId'];
  const { payload, missing } = pick(req.body, ALLOWED, REQUIRED);

  if (missing.length) {
    return res.status(400).json({ message: `Missing required fields: ${missing.join(', ')}` });
  }

  try {
    await UsbEvent.create({
      tenantId: req.device.tenantId,
      deviceId: req.device._id,
      vendorId: payload.vendorId,
      productId: payload.productId,
      trusted: payload.trusted ?? false
    });
    res.status(202).send();
  } catch (error) {
    res.status(500).json({ message: 'Ingest error' });
  }
});

// @route   POST /api/ingest/behavior
// Approved fields: userSessionDate, activeAppSeconds (int), focusSwitchCount (int), keyboardActivityCount (int)
// keyboardActivityCount is a COUNT ONLY — no keystroke content ever captured
router.post('/behavior', async (req, res) => {
  const ALLOWED = ['userSessionDate', 'activeAppSeconds', 'focusSwitchCount', 'keyboardActivityCount'];
  const REQUIRED = ['userSessionDate'];
  const { payload, missing } = pick(req.body, ALLOWED, REQUIRED);

  if (missing.length) {
    return res.status(400).json({ message: `Missing required fields: ${missing.join(', ')}` });
  }

  // Hard type guards — counts must be non-negative integers
  for (const intField of ['activeAppSeconds', 'focusSwitchCount', 'keyboardActivityCount']) {
    if (payload[intField] !== undefined && (!Number.isInteger(payload[intField]) || payload[intField] < 0)) {
      return res.status(400).json({ message: `${intField} must be a non-negative integer` });
    }
  }

  try {
    await BehaviorMetric.create({
      tenantId: req.device.tenantId,
      deviceId: req.device._id,
      userSessionDate: payload.userSessionDate,
      activeAppSeconds: payload.activeAppSeconds,
      focusSwitchCount: payload.focusSwitchCount,
      keyboardActivityCount: payload.keyboardActivityCount
    });
    res.status(202).send();
  } catch (error) {
    res.status(500).json({ message: 'Ingest error' });
  }
});

// @route   POST /api/ingest/alerts
// Approved fields: severity (low|medium|high|critical), category (string), details (string, max 500 chars)
router.post('/alerts', async (req, res) => {
  const ALLOWED = ['severity', 'category', 'details'];
  const REQUIRED = ['severity', 'category'];
  const VALID_SEVERITY = ['low', 'medium', 'high', 'critical'];
  const { payload, missing } = pick(req.body, ALLOWED, REQUIRED);

  if (missing.length) {
    return res.status(400).json({ message: `Missing required fields: ${missing.join(', ')}` });
  }

  if (!VALID_SEVERITY.includes(payload.severity)) {
    return res.status(400).json({ message: `severity must be one of: ${VALID_SEVERITY.join(', ')}` });
  }

  // Truncate details to prevent log injection / oversized payloads
  if (payload.details && payload.details.length > 500) {
    payload.details = payload.details.slice(0, 500);
  }

  try {
    await Alert.create({
      tenantId: req.device.tenantId,
      deviceId: req.device._id,
      severity: payload.severity,
      category: payload.category,
      details: payload.details
    });
    res.status(202).send();
  } catch (error) {
    res.status(500).json({ message: 'Ingest error' });
  }
});

// @route   POST /api/ingest/trust
// Approved fields: sha256, isSigned, signatureValid, publisherName, publisherTrusted, runningFromTempPath, pathMismatch, score, category, executablePath
// Required fields: sha256, score, category
router.post('/trust', async (req, res) => {
  const ALLOWED = [
    'sha256', 'isSigned', 'signatureValid', 'publisherName', 'publisherTrusted',
    'runningFromTempPath', 'pathMismatch', 'score', 'category', 'executablePath'
  ];
  const REQUIRED = ['sha256', 'score', 'category'];
  const VALID_CATEGORIES = ['trusted', 'caution', 'untrusted'];
  const { payload, missing } = pick(req.body, ALLOWED, REQUIRED);

  if (missing.length) {
    return res.status(400).json({ message: `Missing required fields: ${missing.join(', ')}` });
  }

  if (!VALID_CATEGORIES.includes(payload.category)) {
    return res.status(400).json({ message: `category must be one of: ${VALID_CATEGORIES.join(', ')}` });
  }

  if (!Number.isInteger(payload.score) || payload.score < 0 || payload.score > 100) {
    return res.status(400).json({ message: 'score must be an integer between 0 and 100' });
  }

  if (!/^[0-9a-f]{64}$/i.test(payload.sha256)) {
    return res.status(400).json({ message: 'sha256 must be a 64-character hex string' });
  }

  if (payload.executablePath && payload.executablePath.length > 2048) {
    payload.executablePath = payload.executablePath.slice(0, 2048);
  }

  try {
    await TrustScore.findOneAndUpdate(
      { tenantId: req.device.tenantId, deviceId: req.device._id, sha256: payload.sha256 },
      {
        $set: {
          tenantId: req.device.tenantId,
          deviceId: req.device._id,
          sha256: payload.sha256,
          isSigned: payload.isSigned ?? false,
          signatureValid: payload.signatureValid ?? false,
          publisherName: payload.publisherName,
          publisherTrusted: payload.publisherTrusted ?? false,
          runningFromTempPath: payload.runningFromTempPath ?? false,
          pathMismatch: payload.pathMismatch ?? false,
          score: payload.score,
          category: payload.category,
          executablePath: payload.executablePath,
          evaluatedAt: new Date()
        }
      },
      { upsert: true, new: true }
    );
    res.status(202).send();
  } catch (error) {
    console.error('Trust score ingest error:', error);
    res.status(500).json({ message: 'Ingest error' });
  }
});

module.exports = router;
