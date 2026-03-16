import type { AgentId } from "./Working";

/* ================================================================
   TYPES
   ================================================================ */

export interface InterventionData {
  id: string;
  title: string;
  description: string;
  businessImpact: string;
  severity: "Critical" | "Warning";
  pipelineSteps: string[];
  activeStep: number;
  confidence: number;
  status: "awaiting" | "executing" | "completed";
  executingStep?: number;
}

export interface CompletedAction {
  id: string;
  title: string;
  description: string;
  completedAt: string;
  pipelineSteps: string[];
}

export interface ProcessingTask {
  task: string;
  outcome: "resolve" | "escalate";
  escalation?: Omit<InterventionData, "status" | "executingStep">;
}

export interface ModuleConfig {
  agents: string[];
  evaluatingItems: string[];
  processingTasks: ProcessingTask[];
  initialInterventions: InterventionData[];
}

/* ================================================================
   MODULE DATA
   ================================================================ */

export const MODULE_DATA: Record<string, ModuleConfig> = {
  "Risk Register": {
    agents: ["Signal Analyst", "Risk Modeler", "Remediation Planner", "Validation Agent"],
    evaluatingItems: [
      "Anomalous login — admin console",
      "Certificate expiration risk — production LB",
      "Exposure path recalculation",
      "Privilege escalation simulation",
    ],
    processingTasks: [
      { task: "Lateral movement pattern — internal segmentation", outcome: "resolve" },
      {
        task: "Anomalous privilege escalation — service accounts",
        outcome: "escalate",
        escalation: {
          id: "rr-esc-1",
          title: "Revoke elevated service account permissions",
          description: "Intervention required. Confidence: 88%.",
          businessImpact: "Service account abuse exposure.",
          severity: "Critical",
          pipelineSteps: ["Intelligence cycle", "Awaiting authorization", "Execution"],
          activeStep: 1,
          confidence: 88,
        },
      },
      { task: "Data exfiltration risk — cloud storage endpoints", outcome: "resolve" },
    ],
    initialInterventions: [
      {
        id: "rr-1",
        title: "Certificate rotation — production load balancers",
        description: "Intervention required. Confidence: 91%.",
        businessImpact: "External service disruption risk.",
        severity: "Critical",
        pipelineSteps: ["Intelligence cycle", "Awaiting authorization", "Execution"],
        activeStep: 1,
        confidence: 91,
        status: "awaiting",
      },
      {
        id: "rr-2",
        title: "Rotate exposed credentials",
        description: "Intervention required. Confidence: 91%.",
        businessImpact: "Credential compromise exposure.",
        severity: "Critical",
        pipelineSteps: ["Detected", "Analyzed", "Prepared", "Awaiting authorization", "Execution"],
        activeStep: 3,
        confidence: 91,
        status: "awaiting",
      },
    ],
  },
  "Attack Paths": {
    agents: ["Path Analyzer", "Risk Scorer", "Remediation Engine", "Validator"],
    evaluatingItems: [
      "Crown jewel reachability — finance cluster",
      "Lateral path to domain admin",
      "Internet-facing jump server exposure",
      "Cloud credential chain simulation",
    ],
    processingTasks: [
      { task: "Crown jewel exposure simulation — finance cluster", outcome: "resolve" },
      {
        task: "Kerberoasting path analysis — AD environment",
        outcome: "escalate",
        escalation: {
          id: "ap-esc-1",
          title: "Block Kerberoasting path via service account hardening",
          description: "Intervention required. Confidence: 92%.",
          businessImpact: "Domain credential theft risk.",
          severity: "Critical",
          pipelineSteps: ["Simulation", "Impact analysis", "Awaiting authorization", "Execution"],
          activeStep: 2,
          confidence: 92,
        },
      },
    ],
    initialInterventions: [
      {
        id: "ap-1",
        title: "Block lateral movement to domain controller",
        description: "Intervention required. Confidence: 94%.",
        businessImpact: "Domain-wide administrative compromise.",
        severity: "Critical",
        pipelineSteps: ["Simulation", "Impact analysis", "Awaiting authorization", "Execution"],
        activeStep: 2,
        confidence: 94,
        status: "awaiting",
      },
      {
        id: "ap-2",
        title: "Isolate exposed jump server",
        description: "Intervention required. Confidence: 87%.",
        businessImpact: "Unauthorized network access path.",
        severity: "Warning",
        pipelineSteps: ["Detected", "Analyzed", "Awaiting authorization", "Execution"],
        activeStep: 2,
        confidence: 87,
        status: "awaiting",
      },
    ],
  },
  Vulnerabilities: {
    agents: ["CVE Scanner", "Impact Analyzer", "Patch Planner", "Verification Agent"],
    evaluatingItems: [
      "CVE-2024-3912 impact — DMZ hosts",
      "Kernel vulnerability sweep — Linux fleet",
      "Dependency chain audit — Node services",
      "Zero-day correlation — threat feed",
    ],
    processingTasks: [
      { task: "CVE-2024-3912 impact assessment — DMZ segment", outcome: "resolve" },
      {
        task: "OpenSSL regression scan — API gateway cluster",
        outcome: "escalate",
        escalation: {
          id: "vl-esc-1",
          title: "Patch OpenSSL regression on API gateways",
          description: "Intervention required. Confidence: 95%.",
          businessImpact: "API traffic interception vulnerability.",
          severity: "Critical",
          pipelineSteps: ["Scan", "Validation", "Staging", "Awaiting authorization", "Deployment"],
          activeStep: 3,
          confidence: 95,
        },
      },
    ],
    initialInterventions: [
      {
        id: "vl-1",
        title: "Deploy critical patch to finance-db-01",
        description: "Intervention required. Confidence: 96%.",
        businessImpact: "Financial data exposure risk.",
        severity: "Critical",
        pipelineSteps: ["Scan", "Validation", "Staging", "Awaiting authorization", "Deployment"],
        activeStep: 3,
        confidence: 96,
        status: "awaiting",
      },
      {
        id: "vl-2",
        title: "Remediate CVE-2024-5821 on web servers",
        description: "Intervention required. Confidence: 82%.",
        businessImpact: "Web service exploitation exposure.",
        severity: "Warning",
        pipelineSteps: ["Detection", "Analysis", "Remediation"],
        activeStep: 1,
        confidence: 82,
        status: "awaiting",
      },
    ],
  },
  Misconfiguration: {
    agents: ["Config Scanner", "Drift Analyzer", "Remediation Planner", "Compliance Checker"],
    evaluatingItems: [
      "IAM policy drift — production",
      "S3 bucket ACL audit",
      "TLS configuration baseline",
      "Network ACL consistency check",
    ],
    processingTasks: [
      { task: "IAM policy drift analysis — production environment", outcome: "resolve" },
      {
        task: "Security group over-permissioning — VPC east",
        outcome: "escalate",
        escalation: {
          id: "mc-esc-1",
          title: "Restrict over-permissive security group on VPC east",
          description: "Intervention required. Confidence: 97%.",
          businessImpact: "Unrestricted network ingress.",
          severity: "Critical",
          pipelineSteps: ["Detection", "Analysis", "Awaiting authorization", "Auto-remediation"],
          activeStep: 2,
          confidence: 97,
        },
      },
    ],
    initialInterventions: [
      {
        id: "mc-1",
        title: "Restrict public S3 bucket access",
        description: "Intervention required. Confidence: 98%.",
        businessImpact: "Public data exposure — analytics dataset.",
        severity: "Critical",
        pipelineSteps: ["Detection", "Analysis", "Awaiting authorization", "Auto-remediation"],
        activeStep: 2,
        confidence: 98,
        status: "awaiting",
      },
      {
        id: "mc-2",
        title: "Enforce TLS 1.3 on API endpoints",
        description: "Intervention required. Confidence: 89%.",
        businessImpact: "Data-in-transit interception risk.",
        severity: "Warning",
        pipelineSteps: ["Drift detected", "Validation", "Enforcement"],
        activeStep: 1,
        confidence: 89,
        status: "awaiting",
      },
    ],
  },
  "Cases": {
    agents: ["Intake Analyst", "Forensic Examiner", "Incident Commander", "Recovery Agent"],
    evaluatingItems: [
      "Case #CS-112 — ransomware containment",
      "Case #CS-118 — insider threat review",
      "Case #CS-125 — supply chain compromise",
      "Open case backlog prioritization",
    ],
    processingTasks: [
      { task: "Case #CS-112 timeline reconstruction — ransomware entry vector", outcome: "resolve" },
      {
        task: "Case #CS-125 deep analysis — compromised dependency chain",
        outcome: "escalate",
        escalation: {
          id: "cs-esc-1",
          title: "Quarantine affected build pipeline — supply chain IOC confirmed",
          description: "Intervention required. Confidence: 91%.",
          businessImpact: "CI/CD pipeline integrity at risk.",
          severity: "Critical",
          pipelineSteps: ["Detection", "Scoping", "Awaiting authorization", "Quarantine"],
          activeStep: 2,
          confidence: 91,
        },
      },
    ],
    initialInterventions: [
      {
        id: "cs-1",
        title: "Authorize network isolation for compromised build server",
        description: "Intervention required. Confidence: 94%.",
        businessImpact: "Prevent lateral spread to production clusters.",
        severity: "Critical",
        pipelineSteps: ["Detection", "Scoping", "Awaiting authorization", "Isolation"],
        activeStep: 2,
        confidence: 94,
        status: "awaiting",
      },
      {
        id: "cs-2",
        title: "Revoke compromised service tokens — supply chain incident",
        description: "Intervention required. Confidence: 87%.",
        businessImpact: "Token reuse window closing in 4h.",
        severity: "Warning",
        pipelineSteps: ["Identification", "Validation", "Revocation"],
        activeStep: 1,
        confidence: 87,
        status: "awaiting",
      },
    ],
  },
  "Compliance": {
    agents: ["Policy Analyst", "Audit Reviewer", "Control Assessor", "Reporting Agent"],
    evaluatingItems: [
      "PCI-DSS control gap — cardholder data environment",
      "SOC 2 Type II evidence collection — access controls",
      "GDPR data retention policy review — EU customers",
      "NIST CSF alignment assessment — critical infrastructure",
    ],
    processingTasks: [
      { task: "ISO 27001 control mapping — Annex A audit trail", outcome: "resolve" },
      {
        task: "HIPAA compliance drift — PHI access logging gap detected",
        outcome: "escalate",
        escalation: {
          id: "comp-esc-1",
          title: "Enforce PHI access logging — compliance deadline in 48h",
          description: "Intervention required. Confidence: 92%.",
          businessImpact: "Regulatory penalty risk if unresolved before audit window.",
          severity: "Critical",
          pipelineSteps: ["Detection", "Impact Assessment", "Awaiting authorization", "Remediation"],
          activeStep: 2,
          confidence: 92,
        },
      },
    ],
    initialInterventions: [
      {
        id: "comp-1",
        title: "Approve emergency policy update — data retention non-compliance",
        description: "Intervention required. Confidence: 91%.",
        businessImpact: "Regulatory audit in 72h — non-compliant retention windows.",
        severity: "Critical",
        pipelineSteps: ["Discovery", "Policy Draft", "Awaiting approval", "Enforcement"],
        activeStep: 2,
        confidence: 91,
        status: "awaiting",
      },
      {
        id: "comp-2",
        title: "Schedule access review — privilege creep in regulated systems",
        description: "Intervention required. Confidence: 86%.",
        businessImpact: "SOC 2 control effectiveness at risk.",
        severity: "Warning",
        pipelineSteps: ["Identification", "Scheduling", "Execution"],
        activeStep: 1,
        confidence: 86,
        status: "awaiting",
      },
    ],
  },
  "Application Security Management": {
    agents: ["SAST Scanner", "DAST Orchestrator", "Dependency Auditor", "Remediation Agent"],
    evaluatingItems: [
      "SQL injection vector — auth-v2 login endpoint",
      "Insecure deserialization — payment gateway module",
      "OWASP Top 10 compliance gap — session management",
      "Dependency CVE scan — npm supply chain risk",
    ],
    processingTasks: [
      { task: "Static analysis — code commit review for AUTH-SERVICE-02", outcome: "resolve" },
      {
        task: "Critical XSS vulnerability — user input sanitization bypass detected",
        outcome: "escalate",
        escalation: {
          id: "appsec-esc-1",
          title: "Authorize hotfix deployment — reflected XSS in production",
          description: "Intervention required. Confidence: 94%.",
          businessImpact: "Active exploitation possible — customer-facing endpoint exposed.",
          severity: "Critical",
          pipelineSteps: ["Detection", "Impact Analysis", "Awaiting authorization", "Hotfix Deploy"],
          activeStep: 2,
          confidence: 94,
        },
      },
    ],
    initialInterventions: [
      {
        id: "appsec-1",
        title: "Approve emergency WAF rule — zero-day exploit in API gateway",
        description: "Intervention required. Confidence: 96%.",
        businessImpact: "Unpatched RCE vector — active scanning detected from threat actors.",
        severity: "Critical",
        pipelineSteps: ["Discovery", "Threat Assessment", "Awaiting approval", "WAF Deployment"],
        activeStep: 2,
        confidence: 96,
        status: "awaiting",
      },
      {
        id: "appsec-2",
        title: "Review dependency upgrade — breaking change in crypto library",
        description: "Intervention required. Confidence: 83%.",
        businessImpact: "Outdated TLS implementation risk across 12 microservices.",
        severity: "Warning",
        pipelineSteps: ["Audit", "Compatibility Check", "Approval", "Rollout"],
        activeStep: 2,
        confidence: 83,
        status: "awaiting",
      },
    ],
  },
};

export const MODULE_KEYS = Object.keys(MODULE_DATA);

/* ================================================================
   PER-AGENT MODULE VISIBILITY
   ================================================================ */

export const HIDDEN_MODULES_BY_AGENT: Partial<Record<AgentId, string[]>> = {
  alpha: ["Risk Register", "Attack Paths", "Vulnerabilities", "Misconfiguration", "Compliance", "Application Security Management"],
  bravo: ["Risk Register", "Attack Paths", "Vulnerabilities", "Cases", "Compliance", "Application Security Management", "Case Management"],
  charlie: ["Risk Register", "Attack Paths", "Misconfiguration", "Cases", "Compliance", "Case Management"],
  delta: ["Risk Register", "Attack Paths", "Vulnerabilities", "Misconfiguration", "Cases", "Application Security Management"],
  echo: ["Misconfiguration", "Case Management", "Cases", "Compliance", "Application Security Management"],
  foxtrot: ["Vulnerabilities", "Misconfiguration", "Case Management", "Cases", "Compliance", "Application Security Management"],
  golf: ["Attack Paths", "Vulnerabilities", "Misconfiguration", "Cases", "Compliance", "Application Security Management"],
  hotel: ["Risk Register", "Attack Paths", "Misconfiguration", "Case Management", "Cases", "Compliance", "Application Security Management"],
};

export function getVisibleModules(agentId: AgentId): string[] {
  const hidden = HIDDEN_MODULES_BY_AGENT[agentId] || [];
  return MODULE_KEYS.filter((k) => !hidden.includes(k));
}