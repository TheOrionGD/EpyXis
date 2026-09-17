// Data-Driven Navigation & Header/Footer Configurations
export const HEADER_NAV_LINKS = [
  { name: 'Home', path: '/' },
  { name: 'Defensive Engines', path: '/modules' },
  { name: 'Architecture', path: '/architecture' },
  { name: 'Privacy Engine', path: '/privacy' },
  { name: 'Interactive Demo', path: '/experience' },
  { name: 'Request Access', path: '/request-access' },
  { name: 'Provider Admin', path: '/provider-admin' },
];

export const HEADER_STATUS_BADGE = {
  integrity: '99.8%',
  label: 'Privacy-by-Design Engine',
  loginText: 'Login Portal',
  dashboardText: 'Dashboard'
};

export const QUICK_DOCK_SECTIONS = [
  { id: 'hero', label: 'Top', iconName: 'ChevronUp' },
  { id: 'stats', label: 'Metrics', iconName: 'Shield' },
  { id: 'modules', label: 'Engines', iconName: 'Layers' },
  { id: 'architecture', label: 'Architecture', iconName: 'Cpu' },
  { id: 'preview', label: 'Dashboard', iconName: 'Eye' },
  { id: 'privacy', label: 'Privacy', iconName: 'Lock' },
  { id: 'request-access', label: 'Access', iconName: 'Send' },
];

export const FOOTER_SECTIONS = {
  brand: {
    name: 'Epyxis Security Platform',
    tagline: 'Precision Endpoint Security & Zero-Trust Governance Engine',
    copyright: '© 2026 Epyxis Precision Security Systems Inc. All rights reserved.'
  },
  columns: [
    {
      title: 'Platform Capabilities',
      links: [
        { label: 'Process & Driver Engine', path: '/modules' },
        { label: 'Authenticode Verification', path: '/modules' },
        { label: 'ETW Event Log Subscriber', path: '/modules' },
        { label: 'USB HID Hardware Defense', path: '/modules' },
        { label: 'Cryptographic Audit Ledger', path: '/modules' }
      ]
    },
    {
      title: 'Architecture & Trust',
      links: [
        { label: 'Kernel Telemetry Architecture', path: '/architecture' },
        { label: 'Privacy-by-Design Matrix', path: '/privacy' },
        { label: 'Interactive Walkthrough', path: '/experience' },
        { label: 'Multi-Tenant Provider Admin', path: '/provider-admin' }
      ]
    },
    {
      title: 'Access & Credentials',
      links: [
        { label: 'Request Workspace Access', path: '/request-access' },
        { label: 'Operator Login Portal', path: '/login' },
        { label: 'Live Operations Dashboard', path: '/dashboard' },
        { label: 'Profile & Credentials Setup', path: '/profile-setup' }
      ]
    }
  ],
  legal: [
    { label: 'Privacy Policy', path: '/privacy' },
    { label: 'Terms of Service', path: '/privacy' },
    { label: 'GDPR Compliance', path: '/privacy' },
    { label: 'ISO 27001 Audit', path: '/privacy' }
  ]
};
