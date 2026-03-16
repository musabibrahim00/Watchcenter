/**
 * Agent Automation Activity Data
 * ================================
 * 
 * Shared data for agent-triggered automation activities.
 * Used in Watch Center, Security Graph, and other surfaces.
 */

type AgentType =
  | "asset-intelligence"
  | "vulnerability"
  | "configuration-security"
  | "identity-security"
  | "application-security"
  | "exposure"
  | "risk-intelligence"
  | "governance-compliance";

type ActionType =
  | "workflow-triggered"
  | "case-created"
  | "approval-requested"
  | "risk-updated"
  | "asset-isolated"
  | "notification-sent";

export interface AgentAutomationActivity {
  id: string;
  timestamp: string;
  agent: AgentType;
  agentName: string;
  action: ActionType;
  actionLabel: string;
  targetEntity: string;
  description: string;
  severity: "critical" | "high" | "medium" | "low";
  status: "completed" | "pending" | "in-progress" | "failed";
  relatedCaseId?: string;
  relatedWorkflowId?: string;
  relatedAssetId?: string;
}

export const AGENT_AUTOMATION_ACTIVITIES: AgentAutomationActivity[] = [
  {
    id: "activity-1",
    timestamp: "2024-03-11T14:23:00Z",
    agent: "exposure",
    agentName: "Exposure Analyst",
    action: "case-created",
    actionLabel: "Created Critical Case",
    targetEntity: "finance-db-01",
    description: "Detected lateral movement path to crown jewel asset. Created case CASE-2024-0042 for immediate investigation.",
    severity: "critical",
    status: "completed",
    relatedCaseId: "CASE-2024-0042",
    relatedAssetId: "asset-1",
  },
  {
    id: "activity-2",
    timestamp: "2024-03-11T14:20:00Z",
    agent: "exposure",
    agentName: "Exposure Analyst",
    action: "approval-requested",
    actionLabel: "Requested Asset Isolation",
    targetEntity: "finance-db-01",
    description: "Attack path identified from exposed asset to domain controller. Requesting approval to isolate asset from production network.",
    severity: "critical",
    status: "pending",
    relatedAssetId: "asset-1",
  },
  {
    id: "activity-3",
    timestamp: "2024-03-11T13:45:00Z",
    agent: "vulnerability",
    agentName: "Vulnerability Analyst",
    action: "workflow-triggered",
    actionLabel: "Triggered Patch Workflow",
    targetEntity: "web-app-prod",
    description: "Critical KEV CVE-2023-4211 detected. Initiated automated patch deployment workflow.",
    severity: "critical",
    status: "in-progress",
    relatedWorkflowId: "workflow-1",
    relatedAssetId: "asset-2",
  },
  {
    id: "activity-4",
    timestamp: "2024-03-11T13:30:00Z",
    agent: "risk-intelligence",
    agentName: "Risk Intelligence Analyst",
    action: "risk-updated",
    actionLabel: "Updated Risk Score",
    targetEntity: "Domain Controller Access",
    description: "Composite risk score increased from High to Critical due to overlapping exposure signals and active exploitation indicators.",
    severity: "critical",
    status: "completed",
  },
  {
    id: "activity-5",
    timestamp: "2024-03-11T13:15:00Z",
    agent: "configuration-security",
    agentName: "Configuration Security Analyst",
    action: "workflow-triggered",
    actionLabel: "Triggered Remediation Workflow",
    targetEntity: "s3://finance-reports-2024",
    description: "Detected critical S3 bucket misconfiguration with public access. Initiated automated remediation workflow.",
    severity: "critical",
    status: "completed",
    relatedWorkflowId: "workflow-2",
  },
  {
    id: "activity-6",
    timestamp: "2024-03-11T12:50:00Z",
    agent: "identity-security",
    agentName: "Identity Security Analyst",
    action: "approval-requested",
    actionLabel: "Requested Credential Reset",
    targetEntity: "j.smith@company.com",
    description: "Unauthorized privilege escalation detected. Requesting approval to reset user credentials and revoke elevated permissions.",
    severity: "high",
    status: "pending",
  },
  {
    id: "activity-7",
    timestamp: "2024-03-11T12:30:00Z",
    agent: "asset-intelligence",
    agentName: "Asset Intelligence Analyst",
    action: "notification-sent",
    actionLabel: "Notified Asset Owner",
    targetEntity: "finance-db-01",
    description: "Detected potential unauthorized access to critical database. Sent notification to Finance Team (asset owner).",
    severity: "high",
    status: "completed",
  },
  {
    id: "activity-8",
    timestamp: "2024-03-11T11:45:00Z",
    agent: "governance-compliance",
    agentName: "Governance & Compliance Analyst",
    action: "case-created",
    actionLabel: "Created Compliance Case",
    targetEntity: "PCI-DSS Policy Violation",
    description: "Critical policy violation detected. Created case CASE-2024-0041 for compliance review.",
    severity: "high",
    status: "completed",
    relatedCaseId: "CASE-2024-0041",
  },
  {
    id: "activity-9",
    timestamp: "2024-03-11T11:20:00Z",
    agent: "application-security",
    agentName: "Application Security Analyst",
    action: "workflow-triggered",
    actionLabel: "Triggered Secret Rotation",
    targetEntity: "api-gateway-prod",
    description: "Exposed API key detected in public repository. Initiated automated secret rotation workflow.",
    severity: "high",
    status: "completed",
    relatedWorkflowId: "workflow-3",
  },
  {
    id: "activity-10",
    timestamp: "2024-03-11T10:55:00Z",
    agent: "vulnerability",
    agentName: "Vulnerability Analyst",
    action: "notification-sent",
    actionLabel: "Notified Security Team",
    targetEntity: "Multiple Assets",
    description: "Critical vulnerability patch successfully deployed to 12 affected assets. Notified Security Team of completion.",
    severity: "medium",
    status: "completed",
  },
];

export function getAgentName(agent: AgentType): string {
  switch (agent) {
    case "asset-intelligence":
      return "Asset Intelligence Analyst";
    case "vulnerability":
      return "Vulnerability Analyst";
    case "configuration-security":
      return "Configuration Security Analyst";
    case "identity-security":
      return "Identity Security Analyst";
    case "application-security":
      return "Application Security Analyst";
    case "exposure":
      return "Exposure Analyst";
    case "risk-intelligence":
      return "Risk Intelligence Analyst";
    case "governance-compliance":
      return "Governance & Compliance Analyst";
    default:
      return "Unknown Agent";
  }
}

export function getActionLabel(action: ActionType): string {
  switch (action) {
    case "workflow-triggered":
      return "Workflow Triggered";
    case "case-created":
      return "Case Created";
    case "approval-requested":
      return "Approval Requested";
    case "risk-updated":
      return "Risk Score Updated";
    case "asset-isolated":
      return "Asset Isolated";
    case "notification-sent":
      return "Team Notified";
    default:
      return "Action Taken";
  }
}

export function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
}
