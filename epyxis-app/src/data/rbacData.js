// Data-Driven RBAC Roles & Permissions Schema
export const RBAC_ROLES = [
  {
    id: 'usr-admin',
    name: 'Security Operations Admin',
    badge: 'FULL ACCESS',
    description: 'Unrestricted access to all multi-tenant security modules, device isolation controls, tenant provisioning, and cryptographic ledger exports.',
    permissions: [
      'Full Telemetry & Event Ingestion Management',
      'Device Revocation & Dynamic Isolation Enforcement',
      'Multi-Tenant Provider & Workspace Provisioning',
      'Merkle Ledger Cryptographic Audit Verification'
    ]
  },
  {
    id: 'usr-analyst',
    name: 'Threat Intelligence Analyst',
    badge: 'ANALYST ACCESS',
    description: 'Access to real-time process monitoring, ETW logs, and threat intelligence graphs without administrative device revocation permissions.',
    permissions: [
      'Real-Time Telemetry & Process Event Inspection',
      'WinVerifyTrust Authenticode Signature Audit',
      'ETW Event Log Stream Analysis',
      'Export Executive PDF & CSV Reports'
    ]
  },
  {
    id: 'usr-auditor',
    name: 'Compliance & Audit Inspector',
    badge: 'READ ONLY',
    description: 'Read-only access strictly scoped to privacy verification metrics, ISO 27001 audit logs, and GDPR Article 25 compliance reports.',
    permissions: [
      'Read-Only Privacy-by-Design Matrix Inspection',
      'Cryptographic SHA-256 Ledger Chain Verification',
      'Anonymized Device Health Posture Auditing',
      'GDPR & Compliance Report Downloads'
    ]
  }
];

export const RBAC_MODAL_TEXT = {
  title: 'RBAC Security Guard',
  subtitle: 'Role-Based Access Control Verification',
  description: 'Select your administrative persona to evaluate granular security permissions and multi-tenant access boundaries.',
  confirmBtn: 'Apply Role Profile'
};
