/**
 * Exposure Monitoring Activity Data
 * ===================================
 * 
 * Shared data for exposure monitoring activities that feed into
 * Watch Center, Security Graph, and Exposure Monitoring dashboard.
 */

export type ExposureEventType =
  | "new-vulnerability"
  | "new-attack-path"
  | "risk-score-updated"
  | "crown-jewel-exposed"
  | "misconfiguration-detected"
  | "exposure-remediated"
  | "blast-radius-expanded";

export interface ExposureMonitoringEvent {
  id: string;
  timestamp: string;
  eventType: ExposureEventType;
  agent: string;
  title: string;
  description: string;
  affectedEntity: string;
  severity: "critical" | "high" | "medium" | "low";
  actionTaken?: string;
  relatedCaseId?: string;
  relatedWorkflowId?: string;
  relatedAssetId?: string;
  metadata?: {
    previousRiskScore?: number;
    currentRiskScore?: number;
    attackPathLength?: number;
    affectedAssets?: number;
    cveId?: string;
  };
}

export const EXPOSURE_MONITORING_EVENTS: ExposureMonitoringEvent[] = [
  {
    id: "expo-1",
    timestamp: "2024-03-11T15:02:00Z",
    eventType: "new-attack-path",
    agent: "Exposure Analyst",
    title: "New Attack Path to Crown Jewel Detected",
    description: "Lateral movement path identified from web-server-02 to finance-db-01 through privilege escalation.",
    affectedEntity: "finance-db-01",
    severity: "critical",
    actionTaken: "Created case CASE-2024-0042 and requested approval for isolation",
    relatedCaseId: "CASE-2024-0042",
    relatedAssetId: "asset-1",
    metadata: {
      attackPathLength: 3,
      affectedAssets: 8,
    },
  },
  {
    id: "expo-2",
    timestamp: "2024-03-11T14:58:00Z",
    eventType: "new-vulnerability",
    agent: "Vulnerability Analyst",
    title: "Critical KEV Detected on Production Assets",
    description: "CVE-2023-4211 (CVSS 9.8) identified on 3 production assets. Actively exploited in the wild.",
    affectedEntity: "Multiple Assets",
    severity: "critical",
    actionTaken: "Triggered automated patching workflow",
    relatedWorkflowId: "workflow-1",
    metadata: {
      cveId: "CVE-2023-4211",
      affectedAssets: 3,
    },
  },
  {
    id: "expo-3",
    timestamp: "2024-03-11T14:55:00Z",
    eventType: "risk-score-updated",
    agent: "Risk Intelligence Analyst",
    title: "Risk Score Increased for finance-db-01",
    description: "Composite risk score increased from 75 to 92 due to new vulnerability and attack path detection.",
    affectedEntity: "finance-db-01",
    severity: "critical",
    relatedAssetId: "asset-1",
    metadata: {
      previousRiskScore: 75,
      currentRiskScore: 92,
    },
  },
  {
    id: "expo-4",
    timestamp: "2024-03-11T14:50:00Z",
    eventType: "crown-jewel-exposed",
    agent: "Exposure Analyst",
    title: "Crown Jewel Asset Became Internet-Reachable",
    description: "Domain controller dc-primary-01 became reachable from internet-facing web server.",
    affectedEntity: "dc-primary-01",
    severity: "critical",
    actionTaken: "Requested emergency approval for network isolation",
    metadata: {
      attackPathLength: 4,
      affectedAssets: 15,
    },
  },
  {
    id: "expo-5",
    timestamp: "2024-03-11T14:45:00Z",
    eventType: "misconfiguration-detected",
    agent: "Configuration Security Analyst",
    title: "Critical S3 Bucket Misconfiguration",
    description: "S3 bucket finance-reports-2024 exposed with public read access containing sensitive data.",
    affectedEntity: "s3://finance-reports-2024",
    severity: "critical",
    actionTaken: "Triggered automated remediation workflow",
    relatedWorkflowId: "workflow-2",
  },
  {
    id: "expo-6",
    timestamp: "2024-03-11T14:40:00Z",
    eventType: "blast-radius-expanded",
    agent: "Exposure Analyst",
    title: "Blast Radius Expanded by 40%",
    description: "New vulnerability connections expanded potential blast radius from 12 to 17 assets.",
    affectedEntity: "Production Network",
    severity: "high",
    metadata: {
      affectedAssets: 17,
    },
  },
  {
    id: "expo-7",
    timestamp: "2024-03-11T14:35:00Z",
    eventType: "exposure-remediated",
    agent: "Configuration Security Analyst",
    title: "Misconfiguration Successfully Remediated",
    description: "Auth-service-01 misconfiguration resolved through automated workflow.",
    affectedEntity: "auth-service-01",
    severity: "low",
    actionTaken: "Risk score reduced from 45 to 38",
    metadata: {
      previousRiskScore: 45,
      currentRiskScore: 38,
    },
  },
  {
    id: "expo-8",
    timestamp: "2024-03-11T14:30:00Z",
    eventType: "risk-score-updated",
    agent: "Risk Intelligence Analyst",
    title: "Risk Score Increased for web-app-prod",
    description: "Internet-facing exposure detected. Risk score increased from 58 to 82.",
    affectedEntity: "web-app-prod",
    severity: "high",
    relatedAssetId: "asset-2",
    metadata: {
      previousRiskScore: 58,
      currentRiskScore: 82,
    },
  },
  {
    id: "expo-9",
    timestamp: "2024-03-11T14:25:00Z",
    eventType: "new-vulnerability",
    agent: "Vulnerability Analyst",
    title: "High-Severity RCE Vulnerability Detected",
    description: "CVE-2023-5432 identified on web-app-prod allowing remote code execution.",
    affectedEntity: "web-app-prod",
    severity: "high",
    actionTaken: "Created case CASE-2024-0043",
    relatedCaseId: "CASE-2024-0043",
    relatedAssetId: "asset-2",
    metadata: {
      cveId: "CVE-2023-5432",
      affectedAssets: 1,
    },
  },
  {
    id: "expo-10",
    timestamp: "2024-03-11T14:20:00Z",
    eventType: "new-attack-path",
    agent: "Exposure Analyst",
    title: "Privilege Escalation Path Detected",
    description: "New 2-hop attack path enables privilege escalation to domain admin.",
    affectedEntity: "Domain Admin Accounts",
    severity: "high",
    metadata: {
      attackPathLength: 2,
      affectedAssets: 5,
    },
  },
];

export function getEventTypeLabel(eventType: ExposureEventType): string {
  switch (eventType) {
    case "new-vulnerability":
      return "New Vulnerability";
    case "new-attack-path":
      return "New Attack Path";
    case "risk-score-updated":
      return "Risk Score Updated";
    case "crown-jewel-exposed":
      return "Crown Jewel Exposed";
    case "misconfiguration-detected":
      return "Misconfiguration";
    case "exposure-remediated":
      return "Exposure Remediated";
    case "blast-radius-expanded":
      return "Blast Radius Expanded";
    default:
      return "Exposure Event";
  }
}

export function formatExposureTimestamp(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return date.toLocaleDateString();
}
