/**
 * Compliance Module — Shared Data
 *
 * Single source of truth for all compliance data used across:
 *   - CompliancePage (overview dashboard)
 *   - ComplianceFrameworkPage (framework detail view)
 */

export type Severity       = "critical" | "high" | "medium" | "low";
export type EvidenceStatus = "collected" | "pending" | "overdue";
export type MonitorStatus  = "passing" | "failing" | "warning";
export type ControlStatus  = "passing" | "failing" | "in-progress" | "not-started";

/* ── Frameworks ── */

export const FRAMEWORKS = [
  { id: "soc2",     name: "SOC 2 Type II",  controls: 64,  passing: 58, failing: 4, inProgress: 2, score: 91, trend: "+3", purpose: "Demonstrates trust-service commitments to customers and prospects." },
  { id: "iso27001", name: "ISO 27001",       controls: 114, passing: 99, failing: 8, inProgress: 7, score: 87, trend: "+1", purpose: "International standard for managing information security risks." },
  { id: "nist-csf", name: "NIST CSF",        controls: 108, passing: 91, failing: 9, inProgress: 8, score: 84, trend: "-2", purpose: "Framework for managing and reducing cybersecurity risk." },
  { id: "pci-dss",  name: "PCI-DSS v4.0",   controls: 78,  passing: 72, failing: 3, inProgress: 3, score: 92, trend: "+4", purpose: "Security standard for organizations that handle payment card data." },
  { id: "hipaa",    name: "HIPAA",           controls: 45,  passing: 40, failing: 2, inProgress: 3, score: 89, trend: "0",  purpose: "Protects the privacy and security of health information." },
] as const;

export type FrameworkId = typeof FRAMEWORKS[number]["id"];

/* ── Open Gaps ── */

export const GAPS = [
  { id: "g1", severity: "critical" as Severity, control: "AC-2",    framework: "NIST CSF",  fwId: "nist-csf", title: "Privileged account lifecycle not enforced",                 daysOpen: 14, owner: "Identity Team" },
  { id: "g2", severity: "critical" as Severity, control: "CC6.1",   framework: "SOC 2",     fwId: "soc2",     title: "MFA not required on 12 service accounts",                   daysOpen: 8,  owner: "Platform Engineering" },
  { id: "g3", severity: "high"     as Severity, control: "A.9.4",   framework: "ISO 27001", fwId: "iso27001", title: "Encryption key rotation policy not enforced",               daysOpen: 22, owner: "Security Operations" },
  { id: "g4", severity: "high"     as Severity, control: "Req 6.3", framework: "PCI-DSS",   fwId: "pci-dss",  title: "Vulnerability scan overdue on cardholder segment",          daysOpen: 5,  owner: "Vulnerability Team" },
  { id: "g5", severity: "medium"   as Severity, control: "PR.IP-1", framework: "NIST CSF",  fwId: "nist-csf", title: "Configuration baseline not documented for 3 asset classes", daysOpen: 31, owner: "Configuration Team" },
];

/* ── Evidence Items ── */

export const EVIDENCE_ITEMS = [
  { id: "e1", name: "Access Review Q1 2026",        fwId: "soc2",     control: "CC6.2",    status: "collected" as EvidenceStatus, collector: "Identity Team",    lastUpdated: "Mar 15", dueDate: "Mar 31" },
  { id: "e2", name: "Pen Test Report 2026",          fwId: "iso27001", control: "A.14.2",   status: "collected" as EvidenceStatus, collector: "Security Ops",     lastUpdated: "Feb 28", dueDate: "Mar 31" },
  { id: "e3", name: "MFA Enforcement Logs",          fwId: "soc2",     control: "CC6.1",    status: "pending"   as EvidenceStatus, collector: "Platform Eng",     lastUpdated: "Mar 10", dueDate: "Mar 28" },
  { id: "e4", name: "Encryption Key Audit Trail",    fwId: "iso27001", control: "A.10.1",   status: "overdue"   as EvidenceStatus, collector: "Security Ops",     lastUpdated: "Feb 15", dueDate: "Mar 10" },
  { id: "e5", name: "Vendor Risk Assessments",       fwId: "iso27001", control: "A.15.2",   status: "pending"   as EvidenceStatus, collector: "Procurement",      lastUpdated: "Mar 01", dueDate: "Apr 01" },
  { id: "e6", name: "Cardholder Scope Map",          fwId: "pci-dss",  control: "Req 12.5", status: "collected" as EvidenceStatus, collector: "Payment Security", lastUpdated: "Mar 09", dueDate: "Apr 15" },
];

/* ── Monitoring Checks ── */

export const MONITORING_CHECKS = [
  { id: "m1", name: "Privileged Access Review",   control: "CC6.3",  fwId: "soc2",     status: "passing" as MonitorStatus, lastRun: "2h ago",  frequency: "Daily",      anomalies: 0  },
  { id: "m2", name: "MFA Coverage Scan",           control: "CC6.1",  fwId: "soc2",     status: "failing" as MonitorStatus, lastRun: "1h ago",  frequency: "Hourly",     anomalies: 12 },
  { id: "m3", name: "Encryption At-Rest Audit",    control: "A.10.1", fwId: "iso27001", status: "warning" as MonitorStatus, lastRun: "6h ago",  frequency: "Daily",      anomalies: 3  },
  { id: "m4", name: "Vulnerability Scan Coverage", control: "Req 6.3",fwId: "pci-dss",  status: "failing" as MonitorStatus, lastRun: "3d ago",  frequency: "Weekly",     anomalies: 1  },
  { id: "m5", name: "Access Log Integrity",        control: "AU-3",   fwId: "nist-csf", status: "passing" as MonitorStatus, lastRun: "30m ago", frequency: "Continuous", anomalies: 0  },
  { id: "m6", name: "Data Classification Sweep",   control: "A.8.2",  fwId: "iso27001", status: "passing" as MonitorStatus, lastRun: "4h ago",  frequency: "Daily",      anomalies: 0  },
];

/* ── Upcoming Audits ── */

export const UPCOMING_AUDITS = [
  {
    id: "a1", fwId: "soc2",     name: "SOC 2 Type II Annual",   framework: "SOC 2",     color: "#57B1FF",
    date: "Jun 15, 2026", daysUntil: 82,  readiness: 87, owner: "Compliance Team",
    keyRisks: ["MFA gap on 12 service accounts", "Incomplete access reviews for Q1"],
  },
  {
    id: "a2", fwId: "iso27001", name: "ISO 27001 Surveillance", framework: "ISO 27001", color: "#7988FF",
    date: "May 20, 2026", daysUntil: 56,  readiness: 72, owner: "CISO Office",
    keyRisks: ["Key rotation policy gap", "Vendor risk backlog (8 overdue)"],
  },
  {
    id: "a3", fwId: "pci-dss",  name: "PCI-DSS QSA Assessment", framework: "PCI-DSS",   color: "#2FD897",
    date: "Jul 30, 2026", daysUntil: 127, readiness: 93, owner: "Payment Security",
    keyRisks: ["Vulnerability scan overdue on CDE"],
  },
];

/* ── Recent Policy Changes ── */

export const RECENT_POLICY_CHANGES = [
  { id: "p1", date: "Mar 14", change: "Updated MFA policy to require FIDO2 for all admin accounts",        impact: "high"   as Severity },
  { id: "p2", date: "Mar 11", change: "Extended vulnerability SLA for medium severity from 30 to 45 days", impact: "medium" as Severity },
  { id: "p3", date: "Mar 09", change: "Added cardholder data scope to PCI-DSS quarterly review",           impact: "high"   as Severity },
];

/* ================================================================
   FRAMEWORK CONTROLS
   Representative controls per framework — includes all known failing
   controls from GAPS plus a meaningful cross-section of passing and
   in-progress controls by category.
   ================================================================ */

export type FrameworkControl = {
  id: string;
  name: string;
  category: string;
  status: ControlStatus;
  description: string;
  gapId?: string;         // links to GAPS if this control is failing
  evidenceIds?: string[]; // links to EVIDENCE_ITEMS
  lastTested?: string;
};

export const FRAMEWORK_CONTROLS: Record<string, FrameworkControl[]> = {

  "soc2": [
    // CC5 — Control Activities
    { id: "CC5.1", category: "Control Activities",          status: "passing",     name: "Policies and Procedures",          description: "Documented security policies cover all trust-service categories.", lastTested: "Mar 1" },
    { id: "CC5.2", category: "Control Activities",          status: "passing",     name: "Controls Over Technology",         description: "Technical controls aligned to policies and regularly reviewed.", lastTested: "Feb 28" },
    // CC6 — Logical and Physical Access
    { id: "CC6.1", category: "Logical and Physical Access", status: "failing",     name: "Logical Access Controls",          description: "Multi-factor authentication required for all system access.", gapId: "g2", evidenceIds: ["e3"], lastTested: "Mar 5" },
    { id: "CC6.2", category: "Logical and Physical Access", status: "passing",     name: "User Registration and De-registration", description: "Formal process for granting and revoking access.", evidenceIds: ["e1"], lastTested: "Mar 15" },
    { id: "CC6.3", category: "Logical and Physical Access", status: "passing",     name: "Privileged Access Management",     description: "Privileged accounts are managed, monitored, and reviewed.", lastTested: "2h ago" },
    { id: "CC6.7", category: "Logical and Physical Access", status: "in-progress", name: "Transmission Protection",          description: "Data transmitted over public networks is encrypted.", lastTested: "Feb 20" },
    // CC7 — System Operations
    { id: "CC7.1", category: "System Operations",           status: "passing",     name: "System and Boundary Protection",   description: "Boundaries between system components are enforced.", lastTested: "Mar 10" },
    { id: "CC7.2", category: "System Operations",           status: "in-progress", name: "Change Detection",                 description: "System components are monitored for unauthorized changes.", lastTested: "Mar 8" },
    // CC8 — Change Management
    { id: "CC8.1", category: "Change Management",           status: "passing",     name: "Change Management Process",        description: "Changes to infrastructure go through a formal approval process.", lastTested: "Mar 12" },
    // CC9 — Risk Mitigation
    { id: "CC9.1", category: "Risk Mitigation",             status: "passing",     name: "Risk Assessment Process",          description: "Formal risk assessments are conducted at least annually.", lastTested: "Jan 15" },
    { id: "CC9.2", category: "Risk Mitigation",             status: "in-progress", name: "Vendor Risk Management",           description: "Third-party vendors are assessed for compliance and risk.", lastTested: "Feb 10" },
  ],

  "iso27001": [
    // A.5 — Information Security Policies
    { id: "A.5.1",  category: "Information Security Policies",  status: "passing",     name: "Policies for Information Security",    description: "Management-approved information security policy is in place.", lastTested: "Jan 20" },
    // A.6 — Organization
    { id: "A.6.1",  category: "Organization of Information Security", status: "passing", name: "Internal Organization",               description: "Roles and responsibilities for information security are assigned.", lastTested: "Feb 5" },
    // A.8 — Asset Management
    { id: "A.8.1",  category: "Asset Management",               status: "passing",     name: "Inventory of Assets",                  description: "All assets are identified, inventoried, and owned.", lastTested: "Mar 5" },
    { id: "A.8.2",  category: "Asset Management",               status: "passing",     name: "Classification of Information",        description: "Information is classified according to sensitivity.", lastTested: "4h ago" },
    // A.9 — Access Control
    { id: "A.9.1",  category: "Access Control",                  status: "passing",     name: "Access Control Policy",               description: "Access control policy is documented and reviewed.", lastTested: "Feb 28" },
    { id: "A.9.4",  category: "Access Control",                  status: "failing",     name: "System and Application Access Control", description: "Cryptographic key rotation and access controls enforced per policy.", gapId: "g3", lastTested: "Mar 1" },
    // A.10 — Cryptography
    { id: "A.10.1", category: "Cryptography",                    status: "in-progress", name: "Policy on Cryptographic Controls",     description: "Controls for the use of cryptography to protect information.", evidenceIds: ["e4"], lastTested: "Feb 15" },
    // A.12 — Operations Security
    { id: "A.12.1", category: "Operations Security",             status: "passing",     name: "Documented Operating Procedures",      description: "Operating procedures are documented and available.", lastTested: "Mar 8" },
    { id: "A.12.6", category: "Operations Security",             status: "in-progress", name: "Technical Vulnerability Management",   description: "Technical vulnerabilities are identified and remediated.", lastTested: "Mar 10" },
    // A.14 — System Acquisition
    { id: "A.14.2", category: "System Acquisition & Development",status: "passing",     name: "Security in Development Processes",    description: "Secure development rules are applied to internal systems.", evidenceIds: ["e2"], lastTested: "Feb 28" },
    // A.15 — Supplier Relationships
    { id: "A.15.2", category: "Supplier Relationships",          status: "in-progress", name: "Supplier Service Delivery Management", description: "Supplier delivery and performance are regularly monitored.", evidenceIds: ["e5"], lastTested: "Mar 1" },
    // A.18 — Compliance
    { id: "A.18.1", category: "Compliance",                      status: "passing",     name: "Compliance with Legal Requirements",   description: "Legal, regulatory, and contractual requirements are identified.", lastTested: "Jan 30" },
  ],

  "nist-csf": [
    // ID — Identify
    { id: "ID.AM-1", category: "Identify — Asset Management",    status: "passing",     name: "Physical device inventory",            description: "Physical devices and systems are inventoried.", lastTested: "Mar 5" },
    { id: "ID.RA-1", category: "Identify — Risk Assessment",     status: "in-progress", name: "Asset vulnerabilities identified",      description: "Vulnerabilities in assets are identified and documented.", lastTested: "Mar 8" },
    // PR.AC — Protect: Access Control
    { id: "PR.AC-1", category: "Protect — Access Control",       status: "in-progress", name: "Identity and credential management",    description: "Identities and credentials are issued, managed, and verified.", lastTested: "Mar 6" },
    { id: "PR.AC-3", category: "Protect — Access Control",       status: "passing",     name: "Remote access management",             description: "Remote access is managed and controlled.", lastTested: "Mar 12" },
    // AC — Account Management
    { id: "AC-2",    category: "Protect — Account Management",   status: "failing",     name: "Account Management",                   description: "User accounts are managed across the account lifecycle.", gapId: "g1", lastTested: "Mar 10" },
    // PR.DS — Data Security
    { id: "PR.DS-1", category: "Protect — Data Security",        status: "passing",     name: "Data at rest protection",              description: "Data at rest is protected using encryption.", lastTested: "Mar 1" },
    // PR.IP — Information Protection
    { id: "PR.IP-1", category: "Protect — Information Protection",status: "failing",    name: "Baseline configuration",               description: "Baseline configurations documented for all IT/OT/ICS systems.", gapId: "g5", lastTested: "Feb 22" },
    { id: "PR.IP-3", category: "Protect — Information Protection",status: "passing",    name: "Configuration change control",          description: "Configuration change control processes are in place.", lastTested: "Mar 10" },
    // DE.CM — Detect: Monitoring
    { id: "DE.CM-1", category: "Detect — Security Monitoring",   status: "passing",     name: "Network monitoring",                   description: "The network is monitored to detect potential cybersecurity events.", lastTested: "30m ago" },
    { id: "AU-3",    category: "Detect — Security Monitoring",   status: "passing",     name: "Access log integrity",                 description: "Audit logs are protected from unauthorized access and modification.", lastTested: "30m ago" },
    // RS — Respond
    { id: "RS.RP-1", category: "Respond — Response Planning",    status: "passing",     name: "Response plan executed",               description: "Response plan is executed during or after an event.", lastTested: "Feb 15" },
    // RC — Recover
    { id: "RC.RP-1", category: "Recover — Recovery Planning",    status: "in-progress", name: "Recovery plan executed",               description: "Recovery plan is executed during or after a cybersecurity event.", lastTested: "Jan 20" },
  ],

  "pci-dss": [
    // Req 3 — Cardholder Data
    { id: "Req 3.2",  category: "Protect Stored Account Data",    status: "passing",     name: "Cardholder data not retained",         description: "Sensitive authentication data not stored after authorization.", lastTested: "Mar 9" },
    // Req 4 — Encryption
    { id: "Req 4.1",  category: "Protect Data in Transit",        status: "passing",     name: "Encryption of data transmission",      description: "All cardholder data transmitted over open networks is encrypted.", lastTested: "Mar 9" },
    // Req 6 — Secure Systems
    { id: "Req 6.3",  category: "Develop and Maintain Secure Systems", status: "failing","name": "Address security vulnerabilities",   description: "Vulnerabilities must be ranked and scanned quarterly.", gapId: "g4", lastTested: "Mar 22" },
    { id: "Req 6.4",  category: "Develop and Maintain Secure Systems", status: "passing","name": "Protect public-facing web apps",     description: "Public web apps are protected via WAF or code review.", lastTested: "Mar 9" },
    // Req 8 — Authentication
    { id: "Req 8.2",  category: "Identify and Authenticate Users", status: "passing",    name: "User identification and authentication","description": "Unique IDs assigned to all users accessing system components.", lastTested: "Mar 9" },
    { id: "Req 8.3",  category: "Identify and Authenticate Users", status: "in-progress","name": "Individual non-consumer passwords",  description: "Password complexity and rotation policies in place.", lastTested: "Feb 28" },
    // Req 10 — Logging
    { id: "Req 10.1", category: "Log and Monitor All Access",      status: "passing",     name: "Audit trail for all access",           description: "Audit trails are implemented to link all access to individual users.", lastTested: "3d ago" },
    { id: "Req 11.2", category: "Test Security Regularly",         status: "in-progress", name: "Vulnerability scans",                  description: "Internal and external scans are run at least quarterly.", lastTested: "3d ago" },
    // Req 12 — Policy
    { id: "Req 12.5", category: "Support Security with Policies",  status: "passing",     name: "Assign information security responsibilities","description": "Security responsibilities formally assigned to individuals.", evidenceIds: ["e6"], lastTested: "Mar 9" },
    { id: "Req 12.10",category: "Support Security with Policies",  status: "passing",     name: "Implement incident response plan",     description: "Incident response plan is tested at least annually.", lastTested: "Feb 1" },
  ],

  "hipaa": [
    // Administrative Safeguards
    { id: "§164.308(a)(1)", category: "Administrative Safeguards",  status: "passing",     name: "Security Management Process",          description: "Policies and procedures to prevent, detect, and correct security violations.", lastTested: "Feb 15" },
    { id: "§164.308(a)(3)", category: "Administrative Safeguards",  status: "in-progress", name: "Workforce Authorization",              description: "Procedures to authorize workforce member access to ePHI.", lastTested: "Feb 28" },
    { id: "§164.308(a)(4)", category: "Administrative Safeguards",  status: "passing",     name: "Information Access Management",        description: "Policies for authorizing access to ePHI.", lastTested: "Mar 1" },
    { id: "§164.308(a)(5)", category: "Administrative Safeguards",  status: "passing",     name: "Security Awareness Training",          description: "Security awareness and training program for all workforce members.", lastTested: "Jan 30" },
    // Physical Safeguards
    { id: "§164.310(a)(1)", category: "Physical Safeguards",        status: "passing",     name: "Facility Access Controls",             description: "Limit physical access to ePHI systems to authorized personnel.", lastTested: "Feb 20" },
    // Technical Safeguards
    { id: "§164.312(a)(1)", category: "Technical Safeguards",       status: "passing",     name: "Access Control",                       description: "Unique user identification and automatic log-off.", lastTested: "Mar 5" },
    { id: "§164.312(b)",    category: "Technical Safeguards",       status: "passing",     name: "Audit Controls",                       description: "Hardware, software, and procedural mechanisms to record activity.", lastTested: "Mar 3" },
    { id: "§164.312(e)(1)", category: "Technical Safeguards",       status: "in-progress", name: "Transmission Security",                description: "Guard against unauthorized access to ePHI in transit.", lastTested: "Feb 25" },
    // Organizational Requirements
    { id: "§164.314(a)(1)", category: "Organizational Requirements", status: "in-progress","name": "Business Associate Contracts",       description: "BAAs in place with all business associates handling ePHI.", lastTested: "Feb 10" },
  ],
};
