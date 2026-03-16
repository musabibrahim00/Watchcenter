/**
 * Case Management Data
 * ====================
 * Mock data for the Case Management module.
 *
 * Data layer reads from the unified security graph via adapters.
 * Module-specific shapes (Case, Observation, etc.) are preserved
 * exactly so the UI remains unchanged.
 */

import {
  getCaseNodes,
  getCaseTriggers,
  getCaseLinkedRuns,
  getCaseApprovals,
  getCaseGraphSummary,
} from "../../shared/graph/adapters";
import type { GraphNode } from "../../shared/graph";

export type CaseSeverity = "Critical" | "High" | "Medium" | "Low";
export type CaseStatus = "Open" | "In Progress" | "Resolved" | "Closed" | "Escalated";
export type ResolutionState = "Unresolved" | "True Positive" | "False Positive" | "Duplicate" | "Case Assigned";
export type CaseVerdict = "Benign True Positive" | "True Positive" | "False Positive" | "Under Review";
export type CaseCategory = "Intrusion" | "Malware" | "Malware Alert" | "Data Exfiltration" | "Unauthorized Access" | "Anomaly" | "Policy Violation";

export interface CaseOwner {
  id: string;
  name: string;
  avatar: string;
  role: string;
}

export interface Case {
  id: string;
  title: string;
  severity: CaseSeverity;
  category: CaseCategory;
  source: string;
  assignedTeam: string;
  owner: CaseOwner;
  status: CaseStatus;
  resolutionState: ResolutionState;
  verdict: CaseVerdict;
  createdAt: string;
  updatedAt: string;
  caseAge: string;
  description: string;
}

export interface Observation {
  id: string;
  caseId: string;
  author: CaseOwner;
  title?: string;
  content: string;
  timestamp: string;
  quickActions?: string[];
}

export interface Playbook {
  id: string;
  title: string;
  description: string;
  reason: string;
  action: string;
}

export interface CaseReport {
  summary: string;
  actors: string;
  threatActor: string;
  keyFindings: string[];
  actions: string[];
  assetsAffected: string[];
  attributesImpacted: string[];
}

// Mock case owners
export const CASE_OWNERS: CaseOwner[] = [
  {
    id: "owner-system",
    name: "System",
    avatar: "https://i.pravatar.cc/150?img=60",
    role: "Automated System",
  },
  {
    id: "owner-1",
    name: "Sarah Chen",
    avatar: "https://i.pravatar.cc/150?img=1",
    role: "Senior SOC Analyst",
  },
  {
    id: "owner-2",
    name: "Marcus Rodriguez",
    avatar: "https://i.pravatar.cc/150?img=2",
    role: "Incident Response Lead",
  },
  {
    id: "owner-3",
    name: "Emily Watson",
    avatar: "https://i.pravatar.cc/150?img=3",
    role: "Security Analyst",
  },
  {
    id: "owner-4",
    name: "James Park",
    avatar: "https://i.pravatar.cc/150?img=4",
    role: "Threat Hunter",
  },
  {
    id: "owner-5",
    name: "Lisa Anderson",
    avatar: "https://i.pravatar.cc/150?img=5",
    role: "SOC Manager",
  },
];

// Mock cases
export const CASES: Case[] = [
  {
    id: "Secure-92741",
    title: "Windows application error event. - Faulting application name p...",
    severity: "High",
    category: "Malware Alert",
    source: "SIEM Alert",
    assignedTeam: "SOC Triage",
    owner: {
      id: "owner-m",
      name: "Mansoor Ul Hassan",
      avatar: "https://i.pravatar.cc/150?img=12",
      role: "Senior SOC Analyst",
    },
    status: "Open",
    resolutionState: "Case Assigned",
    verdict: "Under Review",
    createdAt: "2024-03-08T14:23:00Z",
    updatedAt: "2024-03-09T02:15:00Z",
    caseAge: "3 days ago",
    description: "Windows application error event detected. Faulting application name pattern suggests potential malicious activity.",
  },
  {
    id: "CASE-4223",
    title: "Suspicious outbound traffic detected from production server",
    severity: "Critical",
    category: "Data Exfiltration",
    source: "SIEM Alert",
    assignedTeam: "SOC Triage",
    owner: CASE_OWNERS[1], // Sarah Chen
    status: "In Progress",
    resolutionState: "Unresolved",
    verdict: "Under Review",
    createdAt: "2024-03-08T14:23:00Z",
    updatedAt: "2024-03-09T02:15:00Z",
    caseAge: "18h 15m",
    description: "Multiple large file transfers detected to unknown external IP addresses. Initial analysis indicates potential data exfiltration attempt.",
  },
  {
    id: "CASE-4222",
    title: "Unauthorized admin access attempt on AWS console",
    severity: "High",
    category: "Unauthorized Access",
    source: "CloudTrail",
    assignedTeam: "Cloud Security",
    owner: CASE_OWNERS[2], // Marcus Rodriguez
    status: "Escalated",
    resolutionState: "Unresolved",
    verdict: "Under Review",
    createdAt: "2024-03-08T09:45:00Z",
    updatedAt: "2024-03-09T01:30:00Z",
    caseAge: "1d 4h",
    description: "Failed authentication attempts detected from unrecognized IP address attempting to access AWS console with admin privileges.",
  },
  {
    id: "CASE-4221",
    title: "Malware detected on endpoint workstation",
    severity: "High",
    category: "Malware",
    source: "EDR",
    assignedTeam: "Endpoint Security",
    owner: CASE_OWNERS[3], // Emily Watson
    status: "Resolved",
    resolutionState: "True Positive",
    verdict: "True Positive",
    createdAt: "2024-03-07T16:20:00Z",
    updatedAt: "2024-03-08T10:45:00Z",
    caseAge: "2d 1h",
    description: "Trojan detected on user workstation. System quarantined and malware removed. Investigation ongoing to determine entry vector.",
  },
  {
    id: "CASE-4220",
    title: "Anomalous database query patterns detected",
    severity: "Medium",
    category: "Anomaly",
    source: "Database Monitor",
    assignedTeam: "Database Security",
    owner: CASE_OWNERS[4], // James Park
    status: "In Progress",
    resolutionState: "Unresolved",
    verdict: "Under Review",
    createdAt: "2024-03-07T11:30:00Z",
    updatedAt: "2024-03-08T22:10:00Z",
    caseAge: "2d 6h",
    description: "Unusual query patterns detected accessing sensitive customer data tables. Investigating potential SQL injection or compromised credentials.",
  },
  {
    id: "CASE-4219",
    title: "Failed login attempts from multiple geographic locations",
    severity: "Medium",
    category: "Unauthorized Access",
    source: "Auth System",
    assignedTeam: "Identity Security",
    owner: CASE_OWNERS[5], // Lisa Anderson
    status: "Resolved",
    resolutionState: "False Positive",
    verdict: "False Positive",
    createdAt: "2024-03-06T20:15:00Z",
    updatedAt: "2024-03-07T14:20:00Z",
    caseAge: "3d",
    description: "Multiple failed authentication attempts from various countries. Confirmed as legitimate user traveling with VPN connection issues.",
  },
  {
    id: "CASE-4218",
    title: "Privilege escalation attempt detected",
    severity: "Critical",
    category: "Intrusion",
    source: "Host IDS",
    assignedTeam: "SOC Triage",
    owner: CASE_OWNERS[1], // Sarah Chen
    status: "Open",
    resolutionState: "Unresolved",
    verdict: "Under Review",
    createdAt: "2024-03-09T03:00:00Z",
    updatedAt: "2024-03-09T03:00:00Z",
    caseAge: "3h 38m",
    description: "Detected attempt to escalate privileges on Linux production server using known CVE exploit.",
  },
  {
    id: "CASE-4217",
    title: "Policy violation: Unapproved software installation",
    severity: "Low",
    category: "Policy Violation",
    source: "Asset Management",
    assignedTeam: "Compliance",
    owner: CASE_OWNERS[3], // Emily Watson
    status: "Closed",
    resolutionState: "True Positive",
    verdict: "Benign True Positive",
    createdAt: "2024-03-05T13:40:00Z",
    updatedAt: "2024-03-06T09:20:00Z",
    caseAge: "4d",
    description: "User installed unauthorized software on company laptop. Software removed and user educated on policy.",
  },
  {
    id: "CASE-4216",
    title: "Ransomware indicators detected in file system",
    severity: "Critical",
    category: "Malware",
    source: "EDR",
    assignedTeam: "Incident Response",
    owner: CASE_OWNERS[2], // Marcus Rodriguez
    status: "In Progress",
    resolutionState: "Unresolved",
    verdict: "True Positive",
    createdAt: "2024-03-08T22:10:00Z",
    updatedAt: "2024-03-09T05:30:00Z",
    caseAge: "8h 28m",
    description: "File encryption activity detected matching known ransomware behavior. System isolated and forensics in progress.",
  },
];

// Recommended playbooks
export const RECOMMENDED_PLAYBOOKS: Record<string, Playbook[]> = {
  "Secure-92741": [
    {
      id: "playbook-m1",
      title: "Asset Decommissioning",
      description: "Workflow to manage asset decommissioning with required approvals. On rejection, notifies the initiator...",
      reason: "Recommended based on malware alert classification and asset status review",
      action: "Review asset inventory, verify decommissioning approvals, execute removal workflow",
    },
    {
      id: "playbook-m2",
      title: "Asset Onboarding",
      description: "Routes asset onboarding requests through Finance and Compliance (Business Security and Legal) before upd...",
      reason: "Standard procedure for managing asset lifecycle in response to security incidents",
      action: "Initiate asset review, obtain necessary approvals, update asset registry",
    },
    {
      id: "playbook-m3",
      title: "Access Provisioning Internally",
      description: "Workflow to allow internal provisions to assets",
      reason: "May be required to restore secure access after incident resolution",
      action: "Review access requirements, provision access through secure channels",
    },
  ],
  "CASE-4223": [
    {
      id: "playbook-1",
      title: "Data Exfiltration Response",
      description: "Standard operating procedure for investigating and containing potential data exfiltration incidents.",
      reason: "This case involves suspicious outbound traffic patterns consistent with data exfiltration.",
      action: "Isolate affected systems, capture network traffic, identify exfiltrated data.",
    },
    {
      id: "playbook-2",
      title: "Network Forensics Analysis",
      description: "Deep-dive network traffic analysis to identify attack vectors and data flow.",
      reason: "Network traffic analysis required to determine full scope of data transfer.",
      action: "Analyze packet captures, identify C2 infrastructure, map data flow paths.",
    },
  ],
  "CASE-4222": [
    {
      id: "playbook-3",
      title: "Unauthorized Access Investigation",
      description: "Procedures for investigating and responding to unauthorized access attempts.",
      reason: "Multiple failed authentication attempts from unknown sources detected.",
      action: "Review access logs, verify user identity, enforce MFA, rotate credentials.",
    },
  ],
  "CASE-4218": [
    {
      id: "playbook-4",
      title: "Privilege Escalation Response",
      description: "Immediate containment and forensic investigation for privilege escalation attempts.",
      reason: "Detected exploitation attempt using known CVE against production systems.",
      action: "Isolate system, patch vulnerability, review audit logs, check for persistence.",
    },
  ],
};

// Observations
export const OBSERVATIONS: Record<string, Observation[]> = {
  "Secure-92741": [
    {
      id: "obs-m1",
      caseId: "Secure-92741",
      author: {
        id: "owner-alert",
        name: "Security Incident",
        avatar: "https://i.pravatar.cc/150?img=10",
        role: "Automated Alert",
      },
      title: "#018 • Security Incident",
      content: "A total of 15 failed login attempts were detected within a 10-minute timeframe originating from the external IP address 192.168.1.14. The attempts targeted the user account John Doe (johndoe@company.com), which is linked to the Active Directory. Credential verification repeatedly failed in AD, indicating either an unauthorized access attempt or incorrect credentials being used.",
      timestamp: "2024-03-05T08:12:00Z",
    },
    {
      id: "obs-m2",
      caseId: "Secure-92741",
      author: {
        id: "owner-ai",
        name: "AI Insight from Mindy",
        avatar: "https://i.pravatar.cc/150?img=11",
        role: "AI Security Assistant",
      },
      title: "AI Insight from Mindy",
      content: "15 failed login attempts detected from external IP 192.168.1.14. Recommend disabling user account temporarily and escalating for further review.",
      timestamp: "2024-03-05T08:12:00Z",
      quickActions: ["Disable User Account", "Escalate Case to Tier-2 Analyst", "Block Source IP", "Isolate Host"],
    },
  ],
  "CASE-4223": [
    {
      id: "obs-1",
      caseId: "CASE-4223",
      author: CASE_OWNERS[0],
      content: "Initial triage complete. Confirmed outbound traffic to IP 185.234.72.18 (known malicious). Approx 2.3GB transferred over 4-hour window.",
      timestamp: "2024-03-08T15:45:00Z",
    },
    {
      id: "obs-2",
      caseId: "CASE-4223",
      author: CASE_OWNERS[0],
      content: "Server isolated from network. Forensic image captured. Escalating to IR team for deep-dive analysis.",
      timestamp: "2024-03-08T17:20:00Z",
    },
    {
      id: "obs-3",
      caseId: "CASE-4223",
      author: CASE_OWNERS[1],
      content: "IR analysis underway. Found scheduled task created by attacker. Persistence mechanism identified. Timeline reconstruction in progress.",
      timestamp: "2024-03-09T02:15:00Z",
    },
  ],
  "CASE-4222": [
    {
      id: "obs-4",
      caseId: "CASE-4222",
      author: CASE_OWNERS[1],
      content: "Source IP traced to TOR exit node. 47 failed login attempts over 2-hour period. No successful authentications.",
      timestamp: "2024-03-08T10:30:00Z",
    },
  ],
};

// Case reports
export const CASE_REPORTS: Record<string, CaseReport> = {
  "CASE-4221": {
    summary:
      "On March 7, 2024, EDR detected Trojan.Generic malware on workstation WS-2847 owned by user jdoe@company.com. The malware was delivered via phishing email and executed when user opened malicious attachment. System was immediately quarantined, malware removed, and credentials rotated. No data exfiltration detected. User re-educated on phishing awareness.",
    actors: "External threat actor using commodity malware",
    threatActor: "Unknown - likely opportunistic attack rather than targeted",
    keyFindings: [
      "Malware delivered via spear-phishing email with malicious PDF attachment",
      "User bypassed email warning and executed payload",
      "Trojan attempted to establish C2 connection (blocked by firewall)",
      "No lateral movement detected",
      "No data exfiltration occurred",
      "Malware successfully quarantined within 15 minutes of detection",
    ],
    actions: [
      "Isolated infected workstation from network",
      "Captured forensic image for analysis",
      "Removed malware using EDR remediation",
      "Rotated user credentials (AD password, email, VPN)",
      "Scanned all user files for additional malware",
      "Updated email filtering rules to block similar attachments",
      "Conducted user security awareness training",
    ],
    assetsAffected: ["Workstation WS-2847", "User account jdoe@company.com"],
    attributesImpacted: ["Endpoint integrity", "User credentials (rotated as precaution)"],
  },
};

// Dashboard metrics
export interface DashboardMetrics {
  mtto: { value: string; current: string; trend: number; gaugeValue: number; progressLabel: string; progressPercent: number };
  mtta: { value: string; current: string; trend: number; gaugeValue: number; progressLabel: string; progressPercent: number };
  mttd: { value: string; current: string; trend: number; gaugeValue: number; progressLabel: string; progressPercent: number };
  mttr: { value: string; current: string; trend: number; gaugeValue: number; progressLabel: string; progressPercent: number };
  mttc: { value: string; current: string; trend: number; gaugeValue: number; progressLabel: string; progressPercent: number };
  fpr: { value: string; current: string; trend: number; gaugeValue: number; progressLabel: string; progressPercent: number };
}

export const DASHBOARD_METRICS: DashboardMetrics = {
  mtto: {
    value: "4.3mins",
    current: "Current MTTO",
    trend: -12.5,
    gaugeValue: 85,
    progressLabel: "Source → SIEM visibility",
    progressPercent: 78,
  },
  mtta: {
    value: "3.1hrs",
    current: "Current MTTA",
    trend: -15.3,
    gaugeValue: 78,
    progressLabel: "Ingestion → Initial classification",
    progressPercent: 76,
  },
  mttd: {
    value: "4.7 days",
    current: "Current MTTD",
    trend: -8.2,
    gaugeValue: 71,
    progressLabel: "Alert → confirmed incident",
    progressPercent: 66,
  },
  mttr: {
    value: "55%",
    current: "Current MTTR",
    trend: -12.5,
    gaugeValue: 55,
    progressLabel: "Incident confirmation → closure",
    progressPercent: 52,
  },
  mttc: {
    value: "55%",
    current: "Current MTTC",
    trend: 3.1,
    gaugeValue: 55,
    progressLabel: "Alert generation → case closure",
    progressPercent: 64,
  },
  fpr: {
    value: "80%",
    current: "Current FPR",
    trend: -8.2,
    gaugeValue: 80,
    progressLabel: "Automated classification accuracy",
    progressPercent: 64,
  },
};

// Trend chart data
export interface TrendDataPoint {
  date: string;
  value: number;
}

export const MTTD_TREND: TrendDataPoint[] = [
  { date: "Mar 1", value: 3.2 },
  { date: "Mar 2", value: 2.8 },
  { date: "Mar 3", value: 3.1 },
  { date: "Mar 4", value: 2.5 },
  { date: "Mar 5", value: 2.7 },
  { date: "Mar 6", value: 2.4 },
  { date: "Mar 7", value: 2.1 },
  { date: "Mar 8", value: 2.3 },
];

export const MTTR_TREND: TrendDataPoint[] = [
  { date: "Mar 1", value: 5.8 },
  { date: "Mar 2", value: 5.2 },
  { date: "Mar 3", value: 5.5 },
  { date: "Mar 4", value: 4.9 },
  { date: "Mar 5", value: 5.1 },
  { date: "Mar 6", value: 4.5 },
  { date: "Mar 7", value: 4.8 },
  { date: "Mar 8", value: 4.7 },
];

// Helper functions
export function getCaseById(id: string): Case | undefined {
  return CASES.find((c) => c.id === id);
}

export function getObservations(caseId: string): Observation[] {
  return OBSERVATIONS[caseId] || [];
}

export function getRecommendedPlaybooks(caseId: string): Playbook[] {
  return RECOMMENDED_PLAYBOOKS[caseId] || [];
}

export function getCaseReport(caseId: string): CaseReport | undefined {
  return CASE_REPORTS[caseId];
}

// ============================
// Reactive subscription system
// ============================
let _listeners: Array<() => void> = [];
let _casesVersion = 0;

function _notifyListeners() {
  _casesVersion++;
  _listeners.forEach((l) => l());
}

/** Subscribe to case data changes (useSyncExternalStore compatible) */
export function subscribeCases(listener: () => void): () => void {
  _listeners.push(listener);
  return () => {
    _listeners = _listeners.filter((l) => l !== listener);
  };
}

/** Snapshot counter — changes whenever cases are mutated */
export function getCasesSnapshot(): number {
  return _casesVersion;
}

// Dynamic case management for AI-created cases
export function addCase(caseData: Case): void {
  CASES.unshift(caseData); // Add to beginning of list
  _notifyListeners();
}

export function updateCase(caseId: string, updates: Partial<Case>): void {
  const idx = CASES.findIndex((c) => c.id === caseId);
  if (idx !== -1) {
    CASES[idx] = { ...CASES[idx], ...updates, updatedAt: new Date().toISOString() };
    _notifyListeners();
  }
}

export function addObservation(caseId: string, observation: Observation): void {
  if (!OBSERVATIONS[caseId]) {
    OBSERVATIONS[caseId] = [];
  }
  OBSERVATIONS[caseId].push(observation);
  _notifyListeners();
}

export function addPlaybooks(caseId: string, playbooks: Playbook[]): void {
  if (!RECOMMENDED_PLAYBOOKS[caseId]) {
    RECOMMENDED_PLAYBOOKS[caseId] = [];
  }
  RECOMMENDED_PLAYBOOKS[caseId].push(...playbooks);
  _notifyListeners();
}

/* ================================================================
   GRAPH-BACKED QUERIES
   ================================================================
   These re-export adapter functions so any consumer of case-data
   can also query the unified graph without importing from two places.
   ================================================================ */

/** All case nodes from the unified graph. */
export const graphCaseNodes = () => getCaseNodes();

/** Entities that triggered a case (risks, attack paths, etc.) via graph edges. */
export const graphCaseTriggers = (caseGraphId: string) =>
  getCaseTriggers(caseGraphId);

/** Workflow runs linked to a case via graph edges. */
export const graphCaseLinkedRuns = (caseGraphId: string) =>
  getCaseLinkedRuns(caseGraphId);

/** Approvals required by a case via graph edges. */
export const graphCaseApprovals = (caseGraphId: string) =>
  getCaseApprovals(caseGraphId);

/** Summary statistics from the graph layer. */
export const graphCaseSummary = () => getCaseGraphSummary();