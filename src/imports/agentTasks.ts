export interface AgentTask {
  id: string;
  description: string;
}

export interface AgentTaskGroup {
  agentId: string;
  agentName: string;
  tasks: AgentTask[];
}

export const AGENT_TASKS: AgentTaskGroup[] = [
  {
    agentId: "alpha",
    agentName: "Asset Intelligence Analyst",
    tasks: [
      { id: "alpha-1", description: "Discovered 12 unmanaged endpoints in finance-subnet-02." },
      { id: "alpha-2", description: "Reconciled CMDB records for corp-endpoint-17." },
      { id: "alpha-3", description: "Classified shadow IT instance on cloud-sandbox-04." },
      { id: "alpha-4", description: "Updated asset ownership for db-prod-03." },
    ],
  },
  {
    agentId: "bravo",
    agentName: "Configuration Security Analyst",
    tasks: [
      { id: "bravo-1", description: "Detected Terraform drift on infra-gateway-02." },
      { id: "bravo-2", description: "Remediated open security group on api-edge-02." },
      { id: "bravo-3", description: "Flagged CIS benchmark failure on storage-01." },
      { id: "bravo-4", description: "Validated NTP/DNS config baseline for web-node-07." },
      { id: "bravo-5", description: "Audited Kubernetes RBAC for EKS-cluster-03." },
    ],
  },
  {
    agentId: "charlie",
    agentName: "Application Security Analyst",
    tasks: [
      { id: "charlie-1", description: "Detected injection flaw in auth-v2." },
      { id: "charlie-2", description: "Patched vulnerable dependency in ui-app-09." },
      { id: "charlie-3", description: "Scanned container image for auth-service-02." },
      { id: "charlie-4", description: "Completed DAST run for payments-04." },
    ],
  },
  {
    agentId: "delta",
    agentName: "Governance & Compliance Analyst",
    tasks: [
      { id: "delta-1", description: "Validated SOC 2 control coverage for iam-core-01." },
      { id: "delta-2", description: "Flagged PCI DSS gap on payment-03." },
      { id: "delta-3", description: "Generated compliance report for Q1 audit cycle." },
      { id: "delta-4", description: "Updated remediation workflow SLA for data-classification-02." },
    ],
  },
  {
    agentId: "echo",
    agentName: "Risk Intelligence Analyst",
    tasks: [
      { id: "echo-1", description: "Recalculated composite risk score for vendor-17." },
      { id: "echo-2", description: "Correlated vulnerability and config signals for cloud-east-01." },
      { id: "echo-3", description: "Published risk briefing for exec-access-group-01." },
      { id: "echo-4", description: "Initiated risk model recalibration for critical-asset-tier-01." },
      { id: "echo-5", description: "Assessed business impact for onboarding-04 exposure." },
    ],
  },
  {
    agentId: "foxtrot",
    agentName: "Exposure Analyst",
    tasks: [
      { id: "foxtrot-1", description: "Mapped attack path from jump-server-02 to finance-db-01." },
      { id: "foxtrot-2", description: "Simulated lateral movement via AD credential chain." },
      { id: "foxtrot-3", description: "Validated network segmentation for crown jewel isolation." },
      { id: "foxtrot-4", description: "Published blast radius model for cross-account-trust-03." },
    ],
  },
  {
    agentId: "golf",
    agentName: "Identity Security Analyst",
    tasks: [
      { id: "golf-1", description: "Detected 14 dormant accounts in admin-group-03." },
      { id: "golf-2", description: "Revoked over-provisioned roles for svc-analytics-02." },
      { id: "golf-3", description: "Completed MFA compliance audit for org-wide." },
      { id: "golf-4", description: "Initiated JIT access policy for admin-group-05." },
    ],
  },
  {
    agentId: "hotel",
    agentName: "Vulnerability Analyst",
    tasks: [
      { id: "hotel-1", description: "Triaged CVE-2024-3912 across DMZ hosts." },
      { id: "hotel-2", description: "Prioritized remediation for api-gateway-cluster." },
      { id: "hotel-3", description: "Validated compensating controls for unpatched linux-fleet-02." },
      { id: "hotel-4", description: "Completed EPSS scoring for node-services-04 dependencies." },
    ],
  },
];
