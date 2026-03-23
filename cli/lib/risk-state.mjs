/**
 * risk-state.mjs — CLI mirror of the UI's risk tracker state
 *
 * Mirrors TASK_POOL from src/imports/Tasks.tsx and ExecutionState from the
 * same file.  The UI stores execution state in a module-level Map + browser
 * sessionStorage.  The CLI stores it in the session file — same data model,
 * different transport.  No logic is duplicated; both surfaces share the same
 * risk definitions and execution state shape.
 */

import { readSession, writeSession } from "./session.mjs";

// ── Risk registry — mirrors TASK_POOL from Tasks.tsx ─────────────────────────
export const RISK_REGISTRY = [
  {
    id:           "task-1",
    title:        "Deploy critical patch to finance-db-01",
    subtitle:     "CVE-2024-5821 actively exploited in the wild. Finance database directly exposed.",
    reason:       "KEV match + internet exposed + asset classified as crown jewel",
    pipelineStage:"awaiting_authorization",
    confidence:   "high",
    source:       "Vulnerability Analyst",
    affectedAsset:"finance-db-01",
    owner:        "Infrastructure",
    detectedAt:   "47 min ago",
    expectedOutcome:  "CVE-2024-5821 patched — finance-db-01 exposure closed.",
    riskIfDeferred:   "Active KEV exploitation window grows — crown jewel asset remains exposed.",
  },
  {
    id:           "task-2",
    title:        "Block lateral movement to domain controller",
    subtitle:     "Simulated attack path reaches domain admin in 3 hops via compromised jump server.",
    reason:       "Domain admin reachable in 3 hops — active exploitation pattern detected",
    pipelineStage:"awaiting_authorization",
    confidence:   "high",
    source:       "Exposure Analyst",
    affectedAsset:"corp-dc-01",
    owner:        "Security Operations",
    detectedAt:   "1.2 hrs ago",
    expectedOutcome:  "Lateral movement path blocked — domain-wide compromise surface eliminated.",
    riskIfDeferred:   "Domain admin reachability window stays open via active attack path.",
  },
  {
    id:           "task-3",
    title:        "Certificate rotation — production load balancers",
    subtitle:     "Production TLS certificates expire in < 72 hours. External services at risk.",
    reason:       "Production TLS expiry < 72h — external-facing services affected",
    pipelineStage:"awaiting_authorization",
    confidence:   "high",
    source:       "Configuration Security",
    affectedAsset:"prod-lb-01/02",
    owner:        "Infrastructure",
    detectedAt:   "3h ago",
    expectedOutcome:  "TLS certificates renewed — zero external service disruption.",
    riskIfDeferred:   "Certificates expire in < 72h causing external service failures.",
  },
  {
    id:           "task-4",
    title:        "Revoke stale API tokens — billing microservice",
    subtitle:     "23 API tokens with admin scope haven't been rotated in 180+ days.",
    reason:       "Over-privileged tokens with no rotation — lateral movement risk via billing API",
    pipelineStage:"awaiting_authorization",
    confidence:   "high",
    source:       "Identity Security",
    affectedAsset:"billing-api",
    owner:        "Identity Security",
    detectedAt:   "6h ago",
    expectedOutcome:  "23 over-privileged tokens revoked — lateral movement via billing API eliminated.",
    riskIfDeferred:   "Active credential stuffing campaign could exploit these tokens during delay.",
  },
  {
    id:           "task-5",
    title:        "Isolate compromised endpoint — WKS-0447",
    subtitle:     "EDR flagged C2 beacon activity from workstation in the engineering VLAN.",
    reason:       "Active C2 communication detected — blast radius includes source code repos",
    pipelineStage:"awaiting_authorization",
    confidence:   "high",
    source:       "Risk Intelligence",
    affectedAsset:"WKS-0447",
    owner:        "Security Operations",
    detectedAt:   "22 min ago",
    expectedOutcome:  "WKS-0447 isolated — C2 channel severed and source code repos protected.",
    riskIfDeferred:   "Active C2 communication continues — blast radius expands to source code repos.",
  },
  {
    id:           "task-6",
    title:        "Patch RCE in internal Jenkins instance",
    subtitle:     "CVE-2025-1103 allows unauthenticated remote code execution on CI/CD pipeline.",
    reason:       "Unauthenticated RCE on build server — supply chain compromise risk",
    pipelineStage:"awaiting_authorization",
    confidence:   "high",
    source:       "Application Security",
    affectedAsset:"jenkins-prod-01",
    owner:        "Application Security",
    detectedAt:   "2h ago",
    expectedOutcome:  "CVE-2025-1103 patched — unauthenticated RCE vector on CI/CD closed.",
    riskIfDeferred:   "Supply chain compromise risk persists — unauthenticated RCE remains exploitable.",
  },
  {
    id:           "task-7",
    title:        "Enforce MFA on privileged service accounts",
    subtitle:     "12 service accounts with domain admin privileges lack multi-factor authentication.",
    reason:       "Credential stuffing campaign active — unprotected admin accounts at risk",
    pipelineStage:"awaiting_authorization",
    confidence:   "moderate",
    source:       "Identity Security",
    affectedAsset:"admin-group-02",
    owner:        "Identity Security",
    detectedAt:   "5h ago",
    expectedOutcome:  "MFA enforced on 12 admin accounts — credential stuffing risk significantly reduced.",
    riskIfDeferred:   "Active credential stuffing campaign — 12 unprotected admin accounts remain at risk.",
  },
  {
    id:           "task-8",
    title:        "Remediate S3 bucket public exposure",
    subtitle:     "Customer PII dataset accessible via misconfigured bucket policy since last deploy.",
    reason:       "Public read access on PII bucket — regulatory and breach notification risk",
    pipelineStage:"awaiting_authorization",
    confidence:   "high",
    source:       "Governance & Compliance",
    affectedAsset:"s3://pii-prod-data",
    owner:        "Governance & Compliance",
    detectedAt:   "3.5h ago",
    expectedOutcome:  "Bucket policy corrected — PII secured and breach notification risk eliminated.",
    riskIfDeferred:   "Customer PII remains publicly accessible — breach notification obligation active.",
  },
];

// ── Execution state (mirrors ExecutionState in Tasks.tsx) ─────────────────────
function getExecutionMap() {
  return readSession().riskExecutions ?? {};
}

function saveExecutionMap(map) {
  writeSession({ riskExecutions: map });
}

/**
 * setRiskExecution — Update execution state for a task.
 * Mirrors setTaskExecution() in Tasks.tsx.
 */
export function setRiskExecution(taskId, state) {
  const map = getExecutionMap();
  map[taskId] = { ...state, updatedAt: new Date().toISOString() };
  saveExecutionMap(map);
  return map[taskId];
}

/**
 * getRiskExecution — Get execution state for a task.
 */
export function getRiskExecution(taskId) {
  return getExecutionMap()[taskId] ?? { status: "not_started", lastAction: "", actor: "", timestamp: "" };
}

/**
 * listRisks — Return all risks with their current execution state.
 */
export function listRisks() {
  const execMap = getExecutionMap();
  return RISK_REGISTRY.map(risk => ({
    ...risk,
    execution: execMap[risk.id] ?? { status: "not_started" },
  }));
}

/**
 * getRisk — Find a risk by id or partial title match.
 */
export function getRisk(idOrTitle) {
  if (!idOrTitle) return null;
  const q = idOrTitle.toLowerCase();
  return RISK_REGISTRY.find(r =>
    r.id === q ||
    r.id.includes(q) ||
    r.title.toLowerCase().includes(q) ||
    r.affectedAsset.toLowerCase().includes(q)
  ) ?? null;
}
