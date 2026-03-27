/**
 * Compliance Module — Shared Data
 *
 * Single source of truth for all compliance data used across:
 *   - CompliancePage (overview dashboard)
 *   - ComplianceFrameworkPage (framework detail view)
 */

import { SOC2_FRAMEWORK } from "../../data/compliance/soc2-controls";

export type Severity       = "critical" | "high" | "medium" | "low";
export type EvidenceStatus = "collected" | "pending" | "overdue";
export type MonitorStatus  = "passing" | "failing" | "warning";
export type ControlStatus  = "passing" | "failing" | "in-progress" | "not-started";

/**
 * A single required evidence artifact for a control.
 * - `label`      — short artifact name shown in the UI
 * - `evidenceId` — links to EVIDENCE_ITEMS[id] when the artifact has been
 *                  collected, submitted, or is pending/overdue
 * - `assumed`    — true when the artifact name was derived operationally,
 *                  not extracted directly from the source document (PRD)
 */
export type EvidenceRequirement = {
  label:       string;
  evidenceId?: string;
  assumed?:    boolean;
};

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
  {
    id: "e1", name: "Access Review Q1 2026", fwId: "soc2", control: "CC6.2",
    status: "collected" as EvidenceStatus, collector: "Identity Team", lastUpdated: "Mar 15", dueDate: "Mar 31",
    description: "Quarterly report showing all user accounts reviewed, access confirmed appropriate, and stale accounts deprovisioned.",
    suggestedSource: "Identity Provider admin console → export quarterly access review report as PDF or CSV.",
  },
  {
    id: "e2", name: "Pen Test Report 2026", fwId: "iso27001", control: "A.14.2",
    status: "collected" as EvidenceStatus, collector: "Security Ops", lastUpdated: "Feb 28", dueDate: "Mar 31",
    description: "Formal penetration test report from an approved external vendor covering all in-scope systems.",
    suggestedSource: "External pentest vendor → request final report PDF. Confirm scope includes all production systems.",
  },
  {
    id: "e3", name: "MFA Enforcement Logs", fwId: "soc2", control: "CC6.1",
    status: "pending" as EvidenceStatus, collector: "Platform Eng", lastUpdated: "Mar 10", dueDate: "Mar 28",
    description: "Logs demonstrating MFA is enforced for all 12 non-compliant service accounts. Must show 100% enforcement rate.",
    suggestedSource: "AWS CloudTrail or Okta → filter authentication events by MFA method for all service account principals.",
  },
  {
    id: "e4", name: "Encryption Key Audit Trail", fwId: "iso27001", control: "A.10.1",
    status: "overdue" as EvidenceStatus, collector: "Security Ops", lastUpdated: "Feb 15", dueDate: "Mar 10",
    description: "Audit log showing all encryption keys, their last rotation date, and confirmation that rotation policy was followed.",
    suggestedSource: "AWS KMS or HashiCorp Vault → export key rotation history for all active keys. Filter last 12 months.",
  },
  {
    id: "e5", name: "Vendor Risk Assessments", fwId: "iso27001", control: "A.15.2",
    status: "pending" as EvidenceStatus, collector: "Procurement", lastUpdated: "Mar 01", dueDate: "Apr 01",
    description: "Completed risk assessments for all active third-party vendors with access to company data or systems.",
    suggestedSource: "Vendor management system → export completed assessment records. Escalate any overdue assessments to vendor owners.",
  },
  {
    id: "e6", name: "Cardholder Scope Map", fwId: "pci-dss", control: "Req 12.5",
    status: "collected" as EvidenceStatus, collector: "Payment Security", lastUpdated: "Mar 09", dueDate: "Apr 15",
    description: "Current data flow diagram showing all systems, networks, and components within the cardholder data environment.",
    suggestedSource: "Network team → export current CDE topology diagram. Include all data flows and system boundaries.",
  },
] as const;

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
  gapId?: string;             // links to GAPS if this control is failing
  evidenceIds?: string[];     // links to EVIDENCE_ITEMS (already collected)
  lastTested?: string;
  // Detail view fields — present for failing / in-progress controls
  whyItMatters?: string;
  remediationSteps?: string[];
  requiredEvidence?: EvidenceRequirement[];
};

/* ================================================================
   SOC 2 OPERATIONAL STATE OVERLAY
   Maps control IDs to their current runtime status.
   Any control NOT listed here defaults to status: "passing".
   Operational fields (gapId, evidenceIds, remediation) are preserved
   exactly as they were in the original mock layer.
   ================================================================ */

type Soc2Override = {
  status?:           ControlStatus;
  gapId?:            string;
  evidenceIds?:      string[];
  lastTested?:       string;
  whyItMatters?:     string;
  remediationSteps?: string[];
  requiredEvidence?: EvidenceRequirement[];
};

const SOC2_OPERATIONAL: Record<string, Soc2Override> = {
  "CC5.1": { status: "passing",     lastTested: "Mar 1"  },
  "CC5.2": { status: "passing",     lastTested: "Feb 28" },
  "CC6.1": {
    status: "failing", gapId: "g2", evidenceIds: ["e3"], lastTested: "Mar 5",
    whyItMatters:
      "MFA is the primary barrier against credential-based attacks. 12 service accounts without MFA are directly exploitable via credential stuffing or phishing — each one a potential lateral movement entry point. This is the top blocker for the SOC 2 annual audit.",
    remediationSteps: [
      "Inventory all 12 non-compliant service accounts by owner",
      "Enable FIDO2 MFA per the updated MFA policy (Mar 14)",
      "Enforce MFA at the identity provider level — block auth without second factor",
      "Re-run MFA Coverage Scan to confirm 100% enforcement",
      "Collect MFA Enforcement Logs as audit evidence and submit to Compliance Team",
    ],
    requiredEvidence: [
      { label: "MFA Enforcement Logs",                              evidenceId: "e3"             },
      { label: "Updated access policy confirming FIDO2 requirement",                assumed: true },
      { label: "Service account inventory with MFA status confirmed",               assumed: true },
    ],
  },
  "CC6.2": {
    status: "passing", evidenceIds: ["e1"], lastTested: "Mar 15",
    requiredEvidence: [
      { label: "Access Review Q1 2026",      evidenceId: "e1" },
      { label: "User provisioning procedures"                  },
      { label: "Access request ticket samples", assumed: true  },
    ],
  },
  "CC6.3": { status: "passing",     lastTested: "2h ago"  },
  "CC6.7": {
    status: "in-progress", lastTested: "Feb 20",
    requiredEvidence: [
      { label: "DLP configuration documentation",     assumed: true },
      { label: "Encryption-in-transit certificate",   assumed: true },
      { label: "Data transfer authorization policy",  assumed: true },
    ],
  },
  "CC7.1": { status: "passing",     lastTested: "Mar 10"  },
  "CC7.2": {
    status: "in-progress", lastTested: "Mar 8",
    requiredEvidence: [
      { label: "SIEM dashboard configuration",          assumed: true },
      { label: "Anomaly detection rules documentation", assumed: true },
      { label: "Alert escalation runbook",              assumed: true },
    ],
  },
  "CC8.1": {
    status: "passing", lastTested: "Mar 12",
    requiredEvidence: [
      { label: "Change management policy"                    },
      { label: "Change ticket samples (last 90 days)", assumed: true },
      { label: "CAB meeting records",                  assumed: true },
      { label: "Deployment logs",                      assumed: true },
    ],
  },
  "CC9.1": { status: "passing",     lastTested: "Jan 15"  },
  "CC9.2": {
    status: "in-progress", lastTested: "Feb 10",
    requiredEvidence: [
      { label: "Vendor risk assessments"                            },
      { label: "Third-party audit reports or SOC 2 reports", assumed: true },
      { label: "Vendor contract security clauses",           assumed: true },
    ],
  },
};

/** Build the full SOC 2 control list from the real dataset, merged with
 *  operational state. Controls without an explicit override get status
 *  "passing" and their canonical evidence list from the PRD dataset. */
function buildSoc2Controls(): FrameworkControl[] {
  return SOC2_FRAMEWORK.categories.flatMap(cat =>
    cat.controls.map((ctrl): FrameworkControl => {
      const op = SOC2_OPERATIONAL[ctrl.id] ?? {};
      return {
        id:               ctrl.id,
        name:             ctrl.title,
        category:         cat.name,
        description:      ctrl.description,
        status:           op.status           ?? "passing",
        gapId:            op.gapId,
        evidenceIds:      op.evidenceIds,
        lastTested:       op.lastTested,
        whyItMatters:     op.whyItMatters,
        remediationSteps: op.remediationSteps,
        // requiredEvidence falls back to the canonical evidence list from the PRD
        requiredEvidence: op.requiredEvidence  ?? ctrl.evidence.map(label => ({ label })),
      };
    })
  );
}

export const FRAMEWORK_CONTROLS: Record<string, FrameworkControl[]> = {

  // SOC 2 — built from real PRD dataset (59 controls) + operational overlay
  "soc2": buildSoc2Controls(),

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
    { id: "A.9.4",  category: "Access Control",                  status: "failing",     name: "System and Application Access Control", description: "Cryptographic key rotation and access controls enforced per policy.", gapId: "g3", lastTested: "Mar 1",
      whyItMatters: "Key rotation limits the blast radius of a compromised key. Without enforcement, stale keys may have been exposed without detection. This is 22 days open and is the primary blocker for the ISO 27001 surveillance audit in 56 days.",
      remediationSteps: ["Audit all encryption keys against the rotation policy deadline", "Identify keys past their rotation date in the key management system", "Rotate overdue keys and document each rotation event", "Implement automated rotation scheduling with failure alerts", "Generate and submit the Encryption Key Audit Trail as evidence"],
      requiredEvidence: [
        { label: "Encryption Key Audit Trail",                 evidenceId: "e4"             },
        { label: "Key rotation policy document with sign-off", assumed: true                },
        { label: "Automated rotation confirmation logs (KMS)", assumed: true                },
      ],
    },
    // A.10 — Cryptography
    { id: "A.10.1", category: "Cryptography",                    status: "in-progress", name: "Policy on Cryptographic Controls",     description: "Controls for the use of cryptography to protect information.", evidenceIds: ["e4"], lastTested: "Feb 15",
      requiredEvidence: [
        { label: "Encryption Key Audit Trail",              evidenceId: "e4"             },
        { label: "Key management system configuration",     assumed: true                },
        { label: "Cryptographic algorithm inventory",       assumed: true                },
      ],
    },
    // A.12 — Operations Security
    { id: "A.12.1", category: "Operations Security",             status: "passing",     name: "Documented Operating Procedures",      description: "Operating procedures are documented and available.", lastTested: "Mar 8" },
    { id: "A.12.6", category: "Operations Security",             status: "in-progress", name: "Technical Vulnerability Management",   description: "Technical vulnerabilities are identified and remediated.", lastTested: "Mar 10" },
    // A.14 — System Acquisition
    { id: "A.14.2", category: "System Acquisition & Development",status: "passing",     name: "Security in Development Processes",    description: "Secure development rules are applied to internal systems.", evidenceIds: ["e2"], lastTested: "Feb 28" },
    // A.15 — Supplier Relationships
    { id: "A.15.2", category: "Supplier Relationships",          status: "in-progress", name: "Supplier Service Delivery Management", description: "Supplier delivery and performance are regularly monitored.", evidenceIds: ["e5"], lastTested: "Mar 1",
      requiredEvidence: [
        { label: "Vendor Risk Assessments",              evidenceId: "e5"             },
        { label: "Third-party SLA monitoring records",   assumed: true                },
        { label: "Supplier audit or certification",      assumed: true                },
      ],
    },
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
    { id: "AC-2",    category: "Protect — Account Management",   status: "failing",     name: "Account Management",                   description: "User accounts are managed across the account lifecycle.", gapId: "g1", lastTested: "Mar 10",
      whyItMatters: "Stale privileged accounts are one of the most exploited attack vectors. Without lifecycle enforcement, deprovisioned employees or contractors may retain access — directly expanding the blast radius of any breach. This gap has been open 14 days.",
      remediationSteps: ["Run a full privileged account audit to identify all active accounts", "Disable or remove accounts inactive for 90+ days", "Implement automated deprovisioning triggers tied to HR offboarding events", "Schedule and document quarterly access reviews in the compliance calendar", "Update and re-approve the account lifecycle policy"],
      requiredEvidence: [
        { label: "Privileged account audit report",                    assumed: true },
        { label: "Deprovisioning workflow documentation",              assumed: true },
        { label: "Quarterly access review records (most recent cycle)",assumed: true },
      ],
    },
    // PR.DS — Data Security
    { id: "PR.DS-1", category: "Protect — Data Security",        status: "passing",     name: "Data at rest protection",              description: "Data at rest is protected using encryption.", lastTested: "Mar 1" },
    // PR.IP — Information Protection
    { id: "PR.IP-1", category: "Protect — Information Protection",status: "failing",    name: "Baseline configuration",               description: "Baseline configurations documented for all IT/OT/ICS systems.", gapId: "g5", lastTested: "Feb 22",
      whyItMatters: "Without documented baselines, configuration drift goes undetected and deviations from secure state cannot be verified or audited. This gap affects 3 asset classes and weakens the foundation for detecting attack paths across the environment.",
      remediationSteps: ["Identify the 3 asset classes missing approved baseline documentation", "Export current configurations as candidate baselines for review", "Review and formally approve baselines with the Configuration Team", "Implement continuous drift monitoring against each approved baseline", "Record approved baselines in the CMDB and link to asset inventory"],
      requiredEvidence: [
        { label: "Approved baseline configuration documents (per asset class)", assumed: true },
        { label: "CMDB records linking each asset to its baseline",             assumed: true },
        { label: "Drift monitoring configuration confirmation",                  assumed: true },
      ],
    },
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
    { id: "Req 6.3",  category: "Develop and Maintain Secure Systems", status: "failing", name: "Address security vulnerabilities",   description: "Vulnerabilities must be ranked and scanned quarterly.", gapId: "g4", lastTested: "Mar 22",
      whyItMatters: "PCI-DSS requires quarterly scans of the cardholder data environment. An overdue scan means known vulnerabilities may exist in scope — a direct QSA finding that could fail the assessment. The QSA assessment is in 127 days.",
      remediationSteps: ["Initiate an internal vulnerability scan on the cardholder segment immediately", "Triage all critical and high findings and assign remediation owners", "Remediate all critical findings within 30 days", "Engage an approved ASV for the required external scan", "Archive scan reports and remediation evidence for the QSA assessment"],
      requiredEvidence: [
        { label: "Internal vulnerability scan report (cardholder segment)", assumed: true },
        { label: "ASV external scan certificate",                           assumed: true },
        { label: "Remediation closure records for critical findings",       assumed: true },
      ],
    },
    { id: "Req 6.4",  category: "Develop and Maintain Secure Systems", status: "passing","name": "Protect public-facing web apps",     description: "Public web apps are protected via WAF or code review.", lastTested: "Mar 9" },
    // Req 8 — Authentication
    { id: "Req 8.2",  category: "Identify and Authenticate Users", status: "passing",    name: "User identification and authentication","description": "Unique IDs assigned to all users accessing system components.", lastTested: "Mar 9" },
    { id: "Req 8.3",  category: "Identify and Authenticate Users", status: "in-progress","name": "Individual non-consumer passwords",  description: "Password complexity and rotation policies in place.", lastTested: "Feb 28" },
    // Req 10 — Logging
    { id: "Req 10.1", category: "Log and Monitor All Access",      status: "passing",     name: "Audit trail for all access",           description: "Audit trails are implemented to link all access to individual users.", lastTested: "3d ago" },
    { id: "Req 11.2", category: "Test Security Regularly",         status: "in-progress", name: "Vulnerability scans",                  description: "Internal and external scans are run at least quarterly.", lastTested: "3d ago" },
    // Req 12 — Policy
    { id: "Req 12.5", category: "Support Security with Policies",  status: "passing",     name: "Assign information security responsibilities","description": "Security responsibilities formally assigned to individuals.", evidenceIds: ["e6"], lastTested: "Mar 9",
      requiredEvidence: [
        { label: "Cardholder Scope Map", evidenceId: "e6" },
        { label: "Assigned security roles documentation", assumed: true },
      ],
    },
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

/* ================================================================
   FRAMEWORK POLICIES
   Representative policies per framework — one policy per major
   control domain. Includes status, ownership, and review dates.
   ================================================================ */

export type PolicyStatus = "approved" | "under-review" | "draft" | "expired";

export type FrameworkPolicy = {
  id: string;
  name: string;
  category: string;
  status: PolicyStatus;
  owner: string;
  version: string;
  lastReviewed?: string;
  nextReview?: string;
  controlIds?: string[];
  summary: string;
};

export const FRAMEWORK_POLICIES: Record<string, FrameworkPolicy[]> = {

  "soc2": [
    { id: "soc2-p1", name: "Access Control Policy",          category: "Logical & Physical Access", status: "approved",      owner: "Platform Engineering",  version: "v3.2", lastReviewed: "Mar 14", nextReview: "Sep 14",  controlIds: ["CC6.1","CC6.2","CC6.3"], summary: "Defines MFA requirements, least-privilege access, and quarterly access review procedures for all systems in scope." },
    { id: "soc2-p2", name: "Change Management Policy",       category: "Change Management",         status: "approved",      owner: "Platform Engineering",  version: "v2.1", lastReviewed: "Feb 28", nextReview: "Aug 28",  controlIds: ["CC8.1"],             summary: "Governs the formal review, testing, and approval process for all infrastructure and code changes before production deployment." },
    { id: "soc2-p3", name: "Incident Response Plan",         category: "System Operations",         status: "under-review",  owner: "Security Operations",   version: "v4.0-draft", lastReviewed: "Feb 10", nextReview: "Mar 31", controlIds: ["CC7.1","CC7.2"],  summary: "Defines escalation paths, triage severity levels, and communication protocols for security incidents. Currently under annual review." },
    { id: "soc2-p4", name: "Vendor Risk Management Policy",  category: "Risk Mitigation",           status: "draft",         owner: "Compliance Team",       version: "v1.0-draft", nextReview: "Apr 15",   controlIds: ["CC9.2"],             summary: "Establishes vendor onboarding assessment, annual review requirements, and offboarding procedures for third-party suppliers." },
    { id: "soc2-p5", name: "Risk Assessment Procedure",      category: "Risk Mitigation",           status: "approved",      owner: "Compliance Team",       version: "v2.0", lastReviewed: "Jan 15",  nextReview: "Jul 15",  controlIds: ["CC9.1"],             summary: "Documents the annual risk assessment methodology, scoring criteria, and treatment plan approval process." },
    { id: "soc2-p6", name: "Transmission Protection Standard",category: "Logical & Physical Access", status: "under-review", owner: "Platform Engineering",  version: "v1.3-draft", lastReviewed: "Feb 20", nextReview: "Mar 31", controlIds: ["CC6.7"],            summary: "Specifies TLS version requirements, cipher suites, and certificate management for all data transmitted over public networks." },
  ],

  "iso27001": [
    { id: "iso-p1", name: "Information Security Policy",       category: "Information Security Policies", status: "approved",     owner: "CISO Office",          version: "v5.1", lastReviewed: "Jan 20",  nextReview: "Jan 20, 2027", controlIds: ["A.5.1"],           summary: "Top-level management-endorsed policy establishing the organisation's commitment to information security and high-level control objectives." },
    { id: "iso-p2", name: "Access Control Policy",             category: "Access Control",                status: "approved",     owner: "Platform Engineering", version: "v3.0", lastReviewed: "Feb 28",  nextReview: "Aug 28",       controlIds: ["A.9.1","A.9.4"],   summary: "Defines role-based access control, least-privilege principles, and cryptographic key access restrictions across all systems." },
    { id: "iso-p3", name: "Cryptographic Controls Policy",     category: "Cryptography",                  status: "under-review", owner: "Security Operations",  version: "v2.1-draft", lastReviewed: "Feb 15", nextReview: "Mar 31",    controlIds: ["A.10.1"],          summary: "Specifies approved encryption algorithms, key lengths, rotation schedules, and key escrow procedures. Under review to address current key rotation gap." },
    { id: "iso-p4", name: "Supplier Relationships Policy",     category: "Supplier Relationships",        status: "draft",        owner: "Procurement",          version: "v1.0-draft", nextReview: "Apr 01",               controlIds: ["A.15.2"],          summary: "Establishes due diligence requirements, SLA monitoring, and annual assessments for all suppliers with access to company systems or data." },
    { id: "iso-p5", name: "Asset Classification Standard",     category: "Asset Management",              status: "approved",     owner: "Security Operations",  version: "v2.3", lastReviewed: "Mar 5",   nextReview: "Sep 5",        controlIds: ["A.8.1","A.8.2"],   summary: "Defines the four-tier data classification scheme (Public, Internal, Confidential, Restricted) and mandatory handling requirements per tier." },
    { id: "iso-p6", name: "Secure Development Lifecycle Policy",category: "System Acquisition",          status: "approved",     owner: "Platform Engineering", version: "v2.0", lastReviewed: "Feb 28",  nextReview: "Aug 28",       controlIds: ["A.14.2"],          summary: "Mandates security requirements, code review gates, and penetration testing at each phase of the software development lifecycle." },
    { id: "iso-p7", name: "Legal and Regulatory Compliance Policy", category: "Compliance",              status: "approved",     owner: "Legal",                version: "v1.2", lastReviewed: "Jan 30",  nextReview: "Jul 30",       controlIds: ["A.18.1"],          summary: "Maps applicable laws, regulations, and contractual requirements; assigns compliance owners; and sets review cadence." },
  ],

  "nist-csf": [
    { id: "nist-p1", name: "Cybersecurity Policy",               category: "Govern",                    status: "approved",     owner: "CISO Office",           version: "v3.0", lastReviewed: "Mar 1",   nextReview: "Sep 1",     summary: "Top-level policy aligning cybersecurity activities to the NIST CSF Identify–Protect–Detect–Respond–Recover structure." },
    { id: "nist-p2", name: "Account Lifecycle Management Procedure", category: "Protect — Access Control", status: "under-review", owner: "Identity Team",      version: "v2.0-draft", lastReviewed: "Mar 6", nextReview: "Mar 31",  controlIds: ["AC-2","PR.AC-1"],  summary: "Defines provisioning, review, and deprovisioning workflows for all privileged and standard accounts. Currently under emergency review to address AC-2 gap." },
    { id: "nist-p3", name: "Configuration Baseline Standard",    category: "Protect — Information Protection", status: "draft", owner: "Configuration Team",  version: "v1.0-draft", nextReview: "Apr 30",               controlIds: ["PR.IP-1","PR.IP-3"],summary: "Documents approved baseline configurations for all asset classes. 3 asset classes still pending initial baseline documentation — linked to open gap PR.IP-1." },
    { id: "nist-p4", name: "Vulnerability Management Policy",    category: "Identify — Risk Assessment", status: "approved",     owner: "Security Operations",  version: "v2.1", lastReviewed: "Mar 8",   nextReview: "Sep 8",     controlIds: ["ID.RA-1"],         summary: "Defines vulnerability scan frequency, severity-based SLA windows, and remediation tracking requirements across all environments." },
    { id: "nist-p5", name: "Security Monitoring Runbook",        category: "Detect — Security Monitoring", status: "approved",  owner: "Security Operations",  version: "v1.4", lastReviewed: "Mar 10",  nextReview: "Jun 10",    controlIds: ["DE.CM-1","AU-3"],  summary: "Defines alert triage procedures, escalation thresholds, and evidence preservation requirements for the SOC monitoring team." },
    { id: "nist-p6", name: "Incident Response Plan",             category: "Respond",                   status: "approved",     owner: "Security Operations",  version: "v3.1", lastReviewed: "Feb 15",  nextReview: "Aug 15",    controlIds: ["RS.RP-1"],         summary: "Defines response team roles, incident severity classification, communication timelines, and post-incident review process." },
  ],

  "pci-dss": [
    { id: "pci-p1", name: "Cardholder Data Handling Policy",     category: "Protect Stored Account Data", status: "approved",   owner: "Payment Security",      version: "v4.1", lastReviewed: "Mar 9",   nextReview: "Sep 9",     controlIds: ["Req 3.2","Req 12.5"], summary: "Defines what cardholder data may be stored, how it must be protected, and retention and disposal requirements for all payment data." },
    { id: "pci-p2", name: "Encryption and Transmission Policy",  category: "Protect Data in Transit",   status: "approved",     owner: "Payment Security",      version: "v3.0", lastReviewed: "Mar 9",   nextReview: "Sep 9",     controlIds: ["Req 4.1"],         summary: "Mandates TLS 1.2+ for all cardholder data transmission, prohibits deprecated protocols, and requires annual cipher suite review." },
    { id: "pci-p3", name: "Vulnerability Management Procedure",  category: "Develop and Maintain Secure Systems", status: "under-review", owner: "Vulnerability Team", version: "v2.0-draft", lastReviewed: "Mar 1", nextReview: "Mar 31", controlIds: ["Req 6.3","Req 11.2"], summary: "Specifies quarterly internal and ASV scan requirements for the CDE. Currently under review to address the overdue cardholder segment scan." },
    { id: "pci-p4", name: "Password and Authentication Policy",  category: "Identify and Authenticate Users", status: "approved", owner: "Platform Engineering", version: "v2.2", lastReviewed: "Feb 28", nextReview: "Aug 28",    controlIds: ["Req 8.2","Req 8.3"], summary: "Defines password complexity, rotation intervals, lockout policies, and MFA requirements for all users accessing CDE components." },
    { id: "pci-p5", name: "Logging and Monitoring Standard",     category: "Log and Monitor All Access",status: "approved",     owner: "Security Operations",  version: "v2.0", lastReviewed: "Mar 9",   nextReview: "Sep 9",     controlIds: ["Req 10.1"],        summary: "Mandates audit trail requirements, log retention periods (12 months), tamper-evidence controls, and daily log review for CDE systems." },
    { id: "pci-p6", name: "Information Security Policy (PCI)",   category: "Support Security with Policies", status: "approved", owner: "Payment Security",     version: "v4.0", lastReviewed: "Mar 9",   nextReview: "Mar 9, 2027", controlIds: ["Req 12.5","Req 12.10"], summary: "Annual PCI-DSS program policy covering roles, responsibilities, incident response testing, and security awareness requirements." },
  ],

  "hipaa": [
    { id: "hipaa-p1", name: "HIPAA Privacy Policy",              category: "Administrative Safeguards", status: "approved",     owner: "Compliance Team",       version: "v3.0", lastReviewed: "Feb 15",  nextReview: "Feb 15, 2027", controlIds: ["§164.308(a)(4)"], summary: "Documents permissible uses and disclosures of PHI, patient rights, minimum necessary standard, and privacy officer responsibilities." },
    { id: "hipaa-p2", name: "HIPAA Security Policy",             category: "Administrative Safeguards", status: "approved",     owner: "CISO Office",           version: "v2.1", lastReviewed: "Feb 15",  nextReview: "Feb 15, 2027", controlIds: ["§164.308(a)(1)"], summary: "Top-level policy establishing administrative, physical, and technical safeguard requirements for all electronic PHI." },
    { id: "hipaa-p3", name: "Security Awareness Training Program",category: "Administrative Safeguards", status: "approved",    owner: "People Operations",     version: "v1.5", lastReviewed: "Jan 30",  nextReview: "Jul 30",       controlIds: ["§164.308(a)(5)"], summary: "Annual mandatory training for all workforce members covering phishing awareness, PHI handling, breach reporting, and device security." },
    { id: "hipaa-p4", name: "Workforce Authorization Procedure", category: "Administrative Safeguards", status: "under-review", owner: "People Operations",     version: "v1.2-draft", lastReviewed: "Feb 28", nextReview: "Mar 31",   controlIds: ["§164.308(a)(3)"], summary: "Defines role-based ePHI access authorisation workflow, clearance levels, and access revocation on workforce change." },
    { id: "hipaa-p5", name: "Business Associate Agreement Template", category: "Organizational Requirements", status: "under-review", owner: "Legal",            version: "v2.0-draft", lastReviewed: "Feb 10", nextReview: "Mar 31",   controlIds: ["§164.314(a)(1)"], summary: "Standard BAA template covering required HIPAA provisions for all business associates with access to ePHI. Under review with Legal for 2026 updates." },
    { id: "hipaa-p6", name: "Transmission Security Standard",    category: "Technical Safeguards",      status: "approved",     owner: "Platform Engineering",  version: "v1.1", lastReviewed: "Feb 25",  nextReview: "Aug 25",       controlIds: ["§164.312(e)(1)"], summary: "Specifies encryption protocols, VPN requirements, and session timeout standards for all ePHI transmitted over networks." },
  ],
};
