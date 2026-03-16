import type { AgentId } from "./Working";

export interface AgentTaskData {
  name: string;
  description: string;
}

export const AGENT_TASKS: Record<AgentId, AgentTaskData> = {
  alpha: {
    name: "Asset Intelligence Analyst",
    description: `Discovering and classifying assets across finance-admin-02, corp-endpoint-17 — coverage delta +14 (0.93 confidence). Reconciling CMDB records with live network scans.

Completed: Network sweep, fingerprinting, service enumeration, ownership mapping. Currently correlating asset metadata with vulnerability and configuration context.

Queued: Shadow IT discovery for CLOUD-SANDBOX-04, OT/IoT asset fingerprinting for PLANT-FLOOR-02.

Coordinating with IT Ops and Cloud Ops for deployment manifest reconciliation.`,
  },
  bravo: {
    name: "Configuration Security Analyst",
    description: `Assessing cloud posture and infrastructure configs on infra-gateway-02 and api-edge-02 — risk score +15 (0.87 confidence). Verifying baselines against CIS benchmarks.

Completed: CSPM scan, Terraform drift detection, security group audit, NTP/DNS config review. Currently evaluating firewall rule sprawl against approved baseline.

Queued: Kubernetes RBAC audit for EKS-CLUSTER-03, storage encryption policy check for S3-PROD-BUCKET-07.

Coordinating with Platform Engineering for IaC remediation and config drift resolution.`,
  },
  charlie: {
    name: "Application Security Analyst",
    description: `Reviewing web-node-07 and ui-app-09 after dependency updates — risk score +18 (0.84 confidence). Validating patched libraries for new attack vectors.

Completed: SAST scan, SCA dependency audit, secrets detection, code commit review. Currently running DAST against staging endpoints.

Queued: API security audit for PAYMENT-API-01, container image scan for AUTH-SERVICE-02.

Engaged Dev team for build artifacts and deployment logs.`,
  },
  delta: {
    name: "Governance & Compliance Analyst",
    description: `Validating iam-core-01 and payment-03 against SOC 2 Type II / PCI DSS — compliance gap score +12 (0.92 confidence). Confirming mandatory controls are active.

Completed: Evidence collection, control mapping, policy-to-implementation validation. Currently evaluating audit log retention and remediation workflow SLAs.

Queued: HIPAA gap analysis for HEALTH-DATA-01, governance workflow update for DATA-CLASSIFICATION-02.

Coordinating with Legal, Audit, and Policy teams for upcoming external audit cycle.`,
  },
  echo: {
    name: "Risk Intelligence Analyst",
    description: `Correlating cross-analyst findings for vendor-17 and onboarding-04 — composite risk score +9 (0.88 confidence). Aggregating exposure, vulnerability, and compliance signals into unified risk posture.

Completed: Risk factor weighting, business impact scoring, historical trend analysis. Currently recalculating risk scores based on latest vulnerability and configuration data.

Queued: Quarterly risk review for EXEC-ACCESS-GROUP-01, risk model recalibration for CRITICAL-ASSET-TIER-01.

Engaged Security Architecture and Business Stakeholders for risk acceptance workflows.`,
  },
  foxtrot: {
    name: "Exposure Analyst",
    description: `Mapping attack paths from internet-facing jump-server-02 to crown jewel finance-db-01 — exposure score +19 (0.86 confidence). Simulating lateral movement and privilege escalation chains.

Completed: Attack surface enumeration, blast radius modelling, credential chain analysis. Currently validating reachability paths through network segmentation boundaries.

Queued: Kerberoasting path simulation for AD-ENV-01, cloud credential chain audit for CROSS-ACCOUNT-TRUST-03.

Coordinating with Infrastructure and Identity analysts for segmentation validation.`,
  },
  golf: {
    name: "Identity Security Analyst",
    description: `Auditing privileged access for iam-core-03 and svc-analytics-02 — identity risk score +14 (0.90 confidence). Reviewing dormant accounts and over-provisioned roles.

Completed: Entitlement review, orphaned account detection, MFA compliance audit. Currently analyzing service account privilege sprawl and standing access.

Queued: Just-in-time access policy rollout for ADMIN-GROUP-05, SSO federation audit for PARTNER-IDP-02.

Coordinating with HR Systems and IT Ops for identity lifecycle automation.`,
  },
  hotel: {
    name: "Vulnerability Analyst",
    description: `Triaging CVE-2024-3912 impact across DMZ hosts and api-gateway-cluster — risk score +17 (0.89 confidence). Prioritizing remediation based on exploitability and asset criticality.

Completed: CVE correlation, EPSS scoring, patch availability check, affected asset enumeration. Currently validating compensating controls for unpatched systems.

Queued: Kernel vulnerability sweep for LINUX-FLEET-02, dependency chain audit for NODE-SERVICES-04.

Coordinating with Asset Intelligence and Configuration analysts for patch deployment prioritization.`,
  },
};
