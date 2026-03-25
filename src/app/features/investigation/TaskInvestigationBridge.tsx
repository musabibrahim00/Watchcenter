import React from "react";

/* ═══════════════════════════════════════════════════════════
   Task Investigation Bridge — shared context connecting
   task action buttons to AiBox investigation workspace
   ═══════════════════════════════════════════════════════════ */

export interface TaskInvestigationRequest {
  taskId: string;
  title: string;
  description: string;
  reason: string;
  actionType: "investigate" | "view_details" | "open_case" | "authorize";
  severity?: string;
  /** Which analysts contributed to this task */
  analysts: Array<{
    name: string;
    role: string;
    contribution: string;
  }>;
  /** Source context — "watchcenter" or agent ID */
  source: string;
  timestamp: number;
}

interface TaskInvestigationBridgeContextType {
  pendingInvestigation: TaskInvestigationRequest | null;
  investigateTask: (request: TaskInvestigationRequest) => void;
  clearInvestigation: () => void;
}

const TaskInvestigationBridgeContext = React.createContext<TaskInvestigationBridgeContextType>({
  pendingInvestigation: null,
  investigateTask: () => {},
  clearInvestigation: () => {},
});

export function TaskInvestigationBridgeProvider({ children }: { children: React.ReactNode }) {
  const [pendingInvestigation, setPendingInvestigation] = React.useState<TaskInvestigationRequest | null>(null);

  const investigateTask = React.useCallback((request: TaskInvestigationRequest) => {
    setPendingInvestigation(request);
  }, []);

  const clearInvestigation = React.useCallback(() => {
    setPendingInvestigation(null);
  }, []);

  const value = React.useMemo(
    () => ({ pendingInvestigation, investigateTask, clearInvestigation }),
    [pendingInvestigation, investigateTask, clearInvestigation]
  );

  return (
    <TaskInvestigationBridgeContext.Provider value={value}>
      {children}
    </TaskInvestigationBridgeContext.Provider>
  );
}

export function useTaskInvestigation() {
  return React.useContext(TaskInvestigationBridgeContext);
}

/* ═══════════════════════════════════════════════════════════
   Task → Analyst Contribution Map
   Maps each TASK_POOL task to the analysts that contributed
   ═══════════════════════════════════════════════════════════ */

export interface TaskAnalystContribution {
  agentId: string;
  name: string;
  role: string;
  contribution: string;
}

export const TASK_ANALYST_MAP: Record<string, TaskAnalystContribution[]> = {
  "task-1": [
    { agentId: "alpha", name: "Asset Intelligence Analyst", role: "Asset Intelligence Analyst", contribution: "Discovered exposed infrastructure asset finance-db-01 and classified as crown jewel" },
    { agentId: "hotel", name: "Vulnerability Analyst", role: "Vulnerability Analyst", contribution: "Validated CVE-2024-5821 exposure — confirmed active exploitation in the wild" },
    { agentId: "foxtrot", name: "Exposure Analyst", role: "Exposure Analyst", contribution: "Mapped exposure path from internet to finance-db-01 through misconfigured gateway" },
    { agentId: "echo", name: "Risk Intelligence Analyst", role: "Risk Intelligence Analyst", contribution: "Aggregated vulnerability, exposure, and asset signals into composite risk score" },
    { agentId: "delta", name: "Governance & Compliance Analyst", role: "Governance & Compliance Analyst", contribution: "Validated remediation SLA compliance and initiated governance approval" },
  ],
  "task-2": [
    { agentId: "foxtrot", name: "Exposure Analyst", role: "Exposure Analyst", contribution: "Identified lateral movement path — domain admin reachable in 3 hops via jump server" },
    { agentId: "echo", name: "Risk Intelligence Analyst", role: "Risk Intelligence Analyst", contribution: "Correlated credential stuffing signals with lateral movement indicators" },
    { agentId: "golf", name: "Identity Security Analyst", role: "Identity Security Analyst", contribution: "Flagged compromised service account credentials in lateral movement chain" },
  ],
  "task-3": [
    { agentId: "hotel", name: "Vulnerability Analyst", role: "Vulnerability Analyst", contribution: "Flagged TLS certificate expiry < 72h across production load balancers" },
    { agentId: "bravo", name: "Configuration Security Analyst", role: "Configuration Security Analyst", contribution: "Verified TLS configuration baseline deviation across load balancer fleet" },
    { agentId: "delta", name: "Governance & Compliance Analyst", role: "Governance & Compliance Analyst", contribution: "Triggered remediation approval workflow for production TLS rotation" },
  ],
  "task-4": [
    { agentId: "charlie", name: "Application Security Analyst", role: "Application Security Analyst", contribution: "SCA audit flagged over-privileged billing API tokens with no rotation policy" },
    { agentId: "golf", name: "Identity Security Analyst", role: "Identity Security Analyst", contribution: "Detected 23 stale API tokens with admin scope — 180+ days without rotation" },
  ],
  "task-5": [
    { agentId: "alpha", name: "Asset Intelligence Analyst", role: "Asset Intelligence Analyst", contribution: "Mapped WKS-0447 to engineering VLAN and flagged blast radius to source repos" },
    { agentId: "foxtrot", name: "Exposure Analyst", role: "Exposure Analyst", contribution: "Simulated blast radius from compromised workstation to source code repos" },
    { agentId: "charlie", name: "Application Security Analyst", role: "Application Security Analyst", contribution: "Container image scan detected supply chain indicators linked to C2 payload" },
  ],
  "task-6": [
    { agentId: "hotel", name: "Vulnerability Analyst", role: "Vulnerability Analyst", contribution: "Detected CVE-2025-1103 unauthenticated RCE on CI/CD build server" },
    { agentId: "bravo", name: "Configuration Security Analyst", role: "Configuration Security Analyst", contribution: "Identified Terraform drift exposing Jenkins to unauthenticated access" },
    { agentId: "charlie", name: "Application Security Analyst", role: "Application Security Analyst", contribution: "SAST/DAST scan confirmed unauthenticated RCE vector on CI/CD pipeline" },
  ],
  "task-7": [
    { agentId: "echo", name: "Risk Intelligence Analyst", role: "Risk Intelligence Analyst", contribution: "Elevated risk score after correlating credential campaign with unprotected admin accounts" },
    { agentId: "golf", name: "Identity Security Analyst", role: "Identity Security Analyst", contribution: "Identified 12 domain admin service accounts lacking MFA enforcement" },
  ],
  "task-8": [
    { agentId: "alpha", name: "Asset Intelligence Analyst", role: "Asset Intelligence Analyst", contribution: "Identified public-facing PII dataset via asset surface enumeration" },
    { agentId: "bravo", name: "Configuration Security Analyst", role: "Configuration Security Analyst", contribution: "Detected misconfigured S3 bucket policy during CSPM posture scan" },
    { agentId: "delta", name: "Governance & Compliance Analyst", role: "Governance & Compliance Analyst", contribution: "Flagged regulatory breach notification risk and escalated to compliance review" },
  ],
};

/** Build a TaskInvestigationRequest from a task ID and action */
export function buildTaskRequest(
  taskId: string,
  title: string,
  description: string,
  reason: string,
  actionType: TaskInvestigationRequest["actionType"],
  source: string,
  severity?: string,
): TaskInvestigationRequest {
  const analysts = (TASK_ANALYST_MAP[taskId] || []).map(a => ({
    name: a.name,
    role: a.role,
    contribution: a.contribution,
  }));
  return {
    taskId,
    title,
    description,
    reason,
    actionType,
    severity,
    analysts,
    source,
    timestamp: Date.now(),
  };
}
