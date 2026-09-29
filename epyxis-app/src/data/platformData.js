import { pseudoSha256 } from '../services/securityEngine';

// Hero Section Configuration
export const HERO_CONTENT = {
  trustBadge: {
    category: 'Open-Source Multi-Tenant Platform',
    tagline: 'Instant Self-Service Provisioning'
  },
  titleLines: [
    { text: 'Designed', highlight: false },
    { text: 'for Trust.', highlight: false },
    { text: 'Built', highlight: true },
    { text: 'for Clarity.', highlight: true }
  ],
  subheadline: 'Open-source multi-tenant endpoint governance platform. Instantly provision isolated tenant environments, bind hardware secrets via DPAPI, and monitor real-time threat telemetry with zero admin approval delays.',
  primaryCta: 'Provision Workspace Now',
  secondaryCta: 'Watch 3D Experience',
  badges: [
    { iconName: 'Shield', label: 'DPAPI Hardware Encrypted' },
    { iconName: 'EyeOff', label: 'Zero Keystroke Retention' },
    { iconName: 'Lock', label: 'Instant Tenant Isolation' }
  ],
  sculptureLabel: 'Real-Time WebGL 3D Topology'
};

// Statistics Section Configuration
export const STATS_SECTION_DATA = {
  headline: 'Open-Source Multi-Tenant Scale.',
  subheadline: 'Continuous real-time posture analysis and instant self-service workspace provisioning across thousands of endpoints.',
  counters: [
    { id: 'latency', value: '< 5ms', label: 'Ingestion Latency', subtext: 'Async stream processing at 3,500 events/sec' },
    { id: 'privacy', value: '100%', label: 'Privacy Preserved', subtext: 'Zero raw keystroke or payload logging' },
    { id: 'trust', value: 'Instant', label: 'Tenant Provisioning', subtext: 'Zero system admin approval gates' },
    { id: 'uptime', value: '99.99%', label: 'Background Uptime', subtext: 'Machine-bound DPAPI background daemon' }
  ]
};

// 10-Node Kernel OS Architecture Configuration
export const ARCHITECTURE_NODES = [
  {
    id: 'node-1',
    layer: 'Self-Service Gateway',
    title: 'Instant Multi-Tenant Provisioning Engine',
    status: 'Zero Admin Gates',
    description: 'Instantly provisions isolated tenant environments, generates JWT session tokens, and issues single-use device activation keys.',
    specs: ['Instant Provisioning', 'Multi-Tenant Isolation', 'Zero Admin Delay']
  },
  {
    id: 'node-2',
    layer: 'Kernel Layer',
    title: 'Windows ETW Kernel Provider',
    status: 'Active Streaming',
    description: 'Subscribes to low-level Windows kernel events for process executions, thread creation, and handle duplication.',
    specs: ['Event IDs: 4688, 7045', 'Kernel ETW Stream', '< 1.2ms Dispatch']
  },
  {
    id: 'node-3',
    layer: 'Hardware Identity',
    title: 'DPAPI Hardware Secrets Engine',
    status: 'Cryptographically Bound',
    description: 'Encrypts device API keys using Local Machine DPAPI scope, binding authorization secrets strictly to physical host descriptors.',
    specs: ['CryptProtectData API', 'HKLM Registry Protection', 'Machine-Bound Secret']
  },
  {
    id: 'node-4',
    layer: 'Enforcement Shield',
    title: 'Win32 WndProc Kiosk Guard',
    status: 'SC_CLOSE Intercept',
    description: 'Hooks low-level Windows message loops to swallow Escape, Alt+F4, and system commands during initial security disclosure enrollment.',
    specs: ['WndProc Hooking', 'SC_CLOSE Intercept', 'Kiosk Enforcement']
  },
  {
    id: 'node-5',
    layer: 'Hardware Defense',
    title: 'USB HID Filter Driver',
    status: 'Hardware Monitoring',
    description: 'Intercepts incoming USB Human Interface Devices, matching Vendor ID (VID) & Product ID (PID) to neutralize BadUSB attacks.',
    specs: ['VID/PID Verification', 'Rubber Ducky Shield', '< 12ms Block Latency']
  },
  {
    id: 'node-6',
    layer: 'Identity Layer',
    title: 'WinVerifyTrust Authenticode',
    status: 'Authenticode Verified',
    description: 'Validates X.509 Certificate chains and binary hash digests for every spawned executable in memory.',
    specs: ['Microsoft API Integration', 'SHA-256 Hash Matching', 'Revocation Sync']
  },
  {
    id: 'node-7',
    layer: 'Telemetry Gateway',
    title: 'Express 5 Async Ingest Proxy',
    status: 'High Throughput',
    description: 'Asynchronous payload validator handling over 3,500 payloads/sec with under 5ms latency.',
    specs: ['3,500 payloads/sec', 'Rate-Limited Proxy', 'JWT Bearer Validation']
  },
  {
    id: 'node-8',
    layer: 'Analytics Engine',
    title: 'Dynamic Trust Score Evaluator',
    status: 'Continuous Posture',
    description: 'Evaluates composite posture scores (0.00 - 100.00) based on telemetry freshness, USB violations, and compliance drift.',
    specs: ['Multi-Vector Weighting', 'Automatic Quarantine', 'Real-Time Posture']
  },
  {
    id: 'node-9',
    layer: 'Audit Ledger',
    title: 'Merkle-Chained SHA-256 Ledger',
    status: 'Tamper Evident',
    description: 'Chains security audit logs in an immutable Merkle cryptographic structure to prevent log tampering.',
    specs: ['SHA-256 Cryptographic Chain', 'Audit Verification', 'PDF/CSV Reports']
  },
  {
    id: 'node-10',
    layer: 'User Interface',
    title: 'Three.js WebGL Topology Canvas',
    status: '3D Rendered',
    description: 'Renders dynamic 3D network node graph topologies with color-coded health indicators inside modern browsers.',
    specs: ['WebGL 2.0 Acceleration', 'Dynamic Node Colors', '60 FPS Smooth Render']
  }
];

// Experience Page Scenarios
export const EXPERIENCE_SCENARIOS = [
  {
    step: 1,
    title: 'Instant Multi-Tenant Provisioning',
    iconName: 'Shield',
    subtitle: 'Open-Source Self-Service',
    description: 'Create an isolated organization workspace instantly. Zero system admin approval delays, instant JWT session creation, and immediate agent enrollment token generation.',
    stat: '0 Sec Delay (Instant Access)',
    detail: 'Full tenant isolation with compound database indexing and automated owner role assignment.'
  },
  {
    step: 2,
    title: 'DPAPI Hardware Secrets Binding',
    iconName: 'Lock',
    subtitle: 'Host Machine Key Protection',
    description: 'Authorization tokens are encrypted on disk via Windows DPAPI (CryptProtectData), locking API keys to the physical host machine and Local System account.',
    stat: 'Machine-Bound Secret Storage',
    detail: 'Cryptographic protection against offline key theft and local non-admin tampering.'
  },
  {
    step: 3,
    title: 'USB HID Hardware Defense',
    iconName: 'HardDrive',
    subtitle: 'BadUSB & Rubber Ducky Shield',
    description: 'New USB input devices are fingerprinted for Vendor ID and Product ID matching. Non-whitelisted HID devices attempting high-speed keystroke injection are blocked instantly.',
    stat: '< 12ms Block Latency',
    detail: 'Direct Windows kernel HID filter driver level enforcement.'
  }
];

// Dynamic Metric Generator based on Live Telemetry State
export const getDynamicPlatformMetrics = (telemetryData = {}) => {
  const { processes = [], usbDevices = [], etwEvents = [] } = telemetryData;

  const healthScore = Math.max(0, 100 - (etwEvents.filter(e => e.level === 'Critical' || e.level === 'Warning').length * 2));
  const trustScore = processes.length > 0
    ? Math.round((processes.filter(p => p.signatureStatus === 'VALID').length / processes.length) * 100)
    : 100;

  return {
    healthScore,
    trustScore,
    activeMonitors: processes.length,
    threatsBlocked: etwEvents.filter(e => e.level === 'Critical' || e.level === 'Quarantined').length,
    usbDevicesAudited: usbDevices.length,
    keystrokesAnalyzed: 'Active Keystroke Cadence',
    textCaptured: '0 bytes (100% Privacy Preserved)',
    uptime: '100%',
    lastScan: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  };
};

export const PLATFORM_METRICS = getDynamicPlatformMetrics();

// Dynamic Module Data Generator based on Live System State
export const getDynamicSecurityModules = (telemetryData = {}) => {
  const { processes = [], usbDevices = [], etwEvents = [], persistence = [] } = telemetryData;
  const processCount = processes.length;
  const usbCount = usbDevices.length;
  const etwCount = etwEvents.length;

  return [
    {
      id: 'provisioning',
      title: 'Instant Multi-Tenant Provisioning Engine',
      badge: 'Open-Source Self-Service',
      description: 'Instantly provisions isolated organization workspaces with zero system admin approval delays, automated JWT token issuance, and device enrollment keys.',
      metrics: [
        { label: 'Provisioning Speed', value: 'Instant (0s)', status: 'Active' },
        { label: 'Admin Approval Gate', value: 'Bypassed', status: 'Self-Service' },
        { label: 'Tenant Isolation', value: 'Strict Scoped', status: 'Enforced' },
        { label: 'Access Token', value: '30-Day JWT', status: 'Issued' }
      ],
      highlights: [
        'Instant multi-tenant organization creation with isolated data partitions',
        'Zero manual system admin confirmation or authorization bottlenecks',
        'Automated single-use hardware activation token generation'
      ]
    },
    {
      id: 'dpapi_kiosk',
      title: 'DPAPI Hardware Secrets & Kiosk Guard',
      badge: 'Win32 Kernel Security',
      description: 'Encrypts device API keys using Local Machine DPAPI scopes while intercepting WndProc message loops to block Escape & Alt+F4 during kiosk enrollment.',
      metrics: [
        { label: 'Key Protection', value: 'Win32 DPAPI', status: 'Encrypted' },
        { label: 'Host Binding', value: 'Local Machine', status: 'Bound' },
        { label: 'Kiosk Intercept', value: 'WndProc Active', status: 'Locked' },
        { label: 'Close Protection', value: 'SC_CLOSE Swallowed', status: 'Enforced' }
      ],
      highlights: [
        'Machine-bound DPAPI token encryption preventing offline key extraction',
        'WndProc system command interception blocking user bypass attempts',
        'HKLM Registry security descriptor isolation'
      ]
    },
    {
      id: 'integrity',
      title: 'Process & Driver Enumeration Engine',
      badge: 'Capability 1 & 5',
      description: 'Continuously monitors running processes, parent-child relationships, startup entries, services, and Windows kernel driver integrity without system overhead.',
      metrics: [
        { label: 'System Health Score', value: `${telemetryData.healthScore ?? 100}/100`, status: 'Optimal' },
        { label: 'Tracked Processes', value: `${processCount} Active`, status: 'Verified' },
        { label: 'Startup Entries', value: `${persistence.length} Audited`, status: 'Audited' },
        { label: 'Kernel Drivers', value: 'WHQL Signed', status: 'Verified' }
      ],
      highlights: [
        'Parent-child process relationship mapping and PID tracking',
        'Real-time Windows kernel driver integrity validation',
        'Automated background startup entry scanner across Registry & WMI'
      ]
    },
    {
      id: 'trust',
      title: 'WinVerifyTrust Authenticode Engine',
      badge: 'Capability 2',
      description: 'Validates Authenticode digital signatures, binary SHA-256 hash digests, and X.509 Certificate Authority chains to ensure only trusted software executes.',
      metrics: [
        { label: 'Trust Score', value: `${telemetryData.trustScore ?? 100}/100`, status: 'High Trust' },
        { label: 'Verified Publishers', value: '100%', status: 'Authenticode' },
        { label: 'Unsigned Executables', value: '0 Isolated', status: 'Clean' },
        { label: 'Reputation Database', value: 'Synced', status: 'Live' }
      ],
      highlights: [
        'Microsoft Authenticode signature verification via OS APIs',
        'SHA-256 hash reputation scoring against verified signature database',
        'Detailed X.509 certificate chain inspector modal'
      ]
    },
    {
      id: 'etw',
      title: 'Windows Security Event Log & ETW',
      badge: 'Capability 3',
      description: 'Subscribes to Event Tracing for Windows (ETW) and Windows Security Event Log providers (Event IDs 4688, 7045, 4624, 6416, 7040, 4672).',
      metrics: [
        { label: 'ETW Stream Status', value: 'Live Streaming', status: 'Active' },
        { label: 'Monitored Providers', value: 'Kernel & Auditing', status: 'Subscribed' },
        { label: 'Critical Events', value: `${etwCount} Logged`, status: 'Monitored' },
        { label: 'Event Buffer', value: 'Real-time', status: 'Buffered' }
      ],
      highlights: [
        'Live stream subscriber for kernel process creations and privilege escalation',
        'Severity level filtering (Information, Warning, Critical)',
        'Direct integration with local & cloud security telemetry pipelines'
      ]
    },
    {
      id: 'usb',
      title: 'USB Hardware Fingerprinting Auditor',
      badge: 'Capability 4',
      description: 'Inspects connected USB Human Interface Devices (HID), auditing Vendor IDs, Product IDs, and serial signatures to block malicious BadUSB / Rubber Ducky hardware.',
      metrics: [
        { label: 'Connected HIDs', value: `${usbCount} Devices`, status: 'Audited' },
        { label: 'Unknown Hardware', value: '0 Blocked', status: 'Secure' },
        { label: 'Vendor Validation', value: '100% Match', status: 'Passed' },
        { label: 'Block Latency', value: '< 12ms', status: 'Instant' }
      ],
      highlights: [
        'HID Hardware fingerprinting and Vendor ID matching',
        'Keystroke injection attack (Rubber Ducky) defense',
        'Instant device quarantine upon unauthorized HID connection'
      ]
    }
  ];
};

export const SECURITY_MODULES = getDynamicSecurityModules();

export const PRIVACY_COMPARISON = {
  stored: [
    { title: 'Event Metadata & Timestamps', detail: 'Event types, session lengths, process PIDs' },
    { title: 'Authenticode Signatures', detail: 'X.509 certificate publisher signatures & validity' },
    { title: 'SHA-256 Binary Hashes', detail: 'Cryptographic file digests for binary integrity' },
    { title: 'USB Hardware Fingerprints', detail: 'Vendor ID (VID), Product ID (PID), Device Class' },
    { title: 'Driver WHQL Catalogs', detail: 'Kernel driver service names and verification state' },
    { title: 'SHA-256 Audit Ledger', detail: 'Tamper-evident chained log blocks for compliance' }
  ],
  neverStored: [
    { title: 'Passwords & Credentials', detail: 'Never intercepted or recorded under any condition' },
    { title: 'Search Queries & Web URLs', detail: 'Zero browser history or query text recording' },
    { title: 'Chat Messages & Emails', detail: 'Complete exclusion of communication app inputs' },
    { title: 'Document & Clipboard Contents', detail: 'No text body inspection or keylogging' },
    { title: 'Individual Character Input', detail: 'Zero keystroke retention; only anonymized cadence' },
    { title: 'Personal User Documents', detail: 'Zero file content reading or payload storage' }
  ]
};

// Telemetry and Event Data (Dynamically loaded from Backend API)
export const INITIAL_PROCESS_LIST = [];
export const INITIAL_DRIVERS_LIST = [];
export const INITIAL_PERSISTENCE_LIST = [];
export const INITIAL_USB_DEVICES = [];
export const INITIAL_ETW_EVENTS = [];
export const INITIAL_AUDIT_LEDGER = [];
