/**
 * workflow-runner.mjs — Workflow list, run, and debug operations
 *
 * Mirrors the workflow data model from src/app/pages/workflows/types.ts.
 * Run state is persisted in the session file so `workflow runs` and
 * `workflow debug` work across invocations — same state model as the UI.
 */

import { readSession, writeSession } from "./session.mjs";

// ── Workflow registry — mirrors KNOWN_WORKFLOWS in context-resolver.mjs ───────
export const WORKFLOW_CATALOG = [
  {
    id:          "critical-alert-auto-response",
    label:       "Critical Alert Auto-Response",
    description: "Automatically triages and escalates critical security alerts",
    trigger:     "event",
    steps:       ["Alert ingestion", "Severity classification", "Agent assignment", "Slack notification", "Case creation"],
    lastStatus:  "failed",
    lastRun:     "14 min ago",
    totalRuns:   8,
    successRate: "62%",
  },
  {
    id:          "asset-vulnerability-triage",
    label:       "Asset Vulnerability Triage",
    description: "Correlates CVEs against asset criticality and exposure to prioritise patches",
    trigger:     "schedule",
    steps:       ["CVE ingestion", "Asset correlation", "Exposure scoring", "Priority ranking", "Report generation"],
    lastStatus:  "completed",
    lastRun:     "2h ago",
    totalRuns:   22,
    successRate: "91%",
  },
  {
    id:          "compliance-drift-detection",
    label:       "Compliance Drift Detection",
    description: "Detects configuration and policy drift against compliance frameworks",
    trigger:     "schedule",
    steps:       ["Policy snapshot", "Baseline comparison", "Drift identification", "Owner notification"],
    lastStatus:  "completed",
    lastRun:     "6h ago",
    totalRuns:   14,
    successRate: "100%",
  },
  {
    id:          "identity-anomaly-response",
    label:       "Identity Anomaly Response",
    description: "Responds to anomalous login patterns and privilege escalation events",
    trigger:     "event",
    steps:       ["Anomaly detection", "Geo-IP analysis", "MFA enforcement", "Account suspension", "Incident report"],
    lastStatus:  "completed",
    lastRun:     "3h ago",
    totalRuns:   5,
    successRate: "80%",
  },
  {
    id:          "patch-cycle-automation",
    label:       "Patch Cycle Automation",
    description: "Automates patch scheduling, deployment, and verification across environments",
    trigger:     "schedule",
    steps:       ["CVE scan", "Patch sourcing", "Staging deployment", "Validation", "Production rollout", "Verification"],
    lastStatus:  "running",
    lastRun:     "just now",
    totalRuns:   31,
    successRate: "87%",
  },
  {
    id:          "threat-intel-enrichment",
    label:       "Threat Intelligence Enrichment",
    description: "Enriches alerts and assets with threat intelligence from external feeds",
    trigger:     "event",
    steps:       ["Indicator extraction", "Feed correlation", "Confidence scoring", "Entity tagging"],
    lastStatus:  "completed",
    lastRun:     "45 min ago",
    totalRuns:   67,
    successRate: "98%",
  },
  {
    id:          "incident-escalation",
    label:       "Incident Escalation Workflow",
    description: "Escalates incidents to the appropriate team based on severity and asset classification",
    trigger:     "event",
    steps:       ["Severity gate", "Owner lookup", "Escalation routing", "SLA tracking", "Stakeholder notification"],
    lastStatus:  "waiting_approval",
    lastRun:     "1h ago",
    totalRuns:   12,
    successRate: "75%",
  },
  {
    id:          "crown-jewel-alert",
    label:       "Crown Jewel Asset Alert",
    description: "Immediate response pipeline for any event touching crown jewel assets",
    trigger:     "event",
    steps:       ["Asset classification check", "Crown jewel gate", "Immediate isolation", "Executive notification", "War room creation"],
    lastStatus:  "completed",
    lastRun:     "5h ago",
    totalRuns:   3,
    successRate: "100%",
  },
];

// ── Run timeline step templates ────────────────────────────────────────────────
const STEP_EVENTS = {
  completed: [
    { kind: "run_started",     description: "Run triggered",                           status: "completed" },
    { kind: "step_started",    description: "Initialising trigger conditions",          status: "completed" },
    { kind: "step_completed",  description: "Trigger validated — conditions met",       status: "completed" },
    { kind: "step_started",    description: "Executing primary action steps",           status: "completed" },
    { kind: "step_completed",  description: "All action steps completed successfully",  status: "completed" },
    { kind: "run_completed",   description: "Run completed — 0 errors",                 status: "completed" },
  ],
  failed: [
    { kind: "run_started",     description: "Run triggered",                                        status: "completed" },
    { kind: "step_started",    description: "Processing step 1–2",                                  status: "completed" },
    { kind: "step_completed",  description: "Steps 1–2 completed successfully",                     status: "completed" },
    { kind: "step_started",    description: "Step 3: Slack notification",                           status: "running"   },
    { kind: "step_failed",     description: "Step 3 failed — connection refused (integration down)", status: "failed"    },
    { kind: "run_failed",      description: "Run failed at step 3 — 2 subsequent steps skipped",   status: "failed"    },
  ],
  running: [
    { kind: "run_started",     description: "Run triggered",                status: "completed" },
    { kind: "step_started",    description: "Processing step 1",            status: "completed" },
    { kind: "step_completed",  description: "Step 1 completed",             status: "completed" },
    { kind: "step_started",    description: "Processing step 2 (in progress)", status: "running" },
  ],
  waiting_approval: [
    { kind: "run_started",         description: "Run triggered",                          status: "completed" },
    { kind: "step_completed",      description: "Pre-approval steps completed",            status: "completed" },
    { kind: "step_approval_required", description: "Approval required before proceeding", status: "waiting_approval" },
  ],
};

// ── Fuzzy match ────────────────────────────────────────────────────────────────
function findWorkflow(nameArg) {
  if (!nameArg) return null;
  const q = nameArg.toLowerCase().trim();
  return WORKFLOW_CATALOG.find(w =>
    w.id === q ||
    w.label.toLowerCase() === q ||
    w.id.includes(q) ||
    w.label.toLowerCase().includes(q)
  ) ?? null;
}

// ── Session accessors for workflow runs ────────────────────────────────────────
function getRunsFromSession() {
  return readSession().workflowRuns ?? [];
}

function saveRun(run) {
  const session = readSession();
  const runs = session.workflowRuns ?? [];
  // Keep last 20 runs
  const updated = [run, ...runs].slice(0, 20);
  writeSession({ workflowRuns: updated });
}

// ── list ───────────────────────────────────────────────────────────────────────
export function listWorkflows() {
  return WORKFLOW_CATALOG;
}

// ── run ────────────────────────────────────────────────────────────────────────
export function runWorkflow(nameArg) {
  const wf = findWorkflow(nameArg);
  if (!wf) return { error: `Workflow not found: "${nameArg}"` };

  const runId = `run-${Date.now().toString(36)}`;
  const now   = new Date().toISOString();

  const run = {
    id:           runId,
    workflowId:   wf.id,
    workflowName: wf.label,
    triggerSource: "manual",
    status:       "running",
    startTime:    now,
    steps:        wf.steps.map((name, i) => ({
      name,
      status: i === 0 ? "running" : "pending",
    })),
    timelineEvents: [
      { kind: "run_started", description: `Run triggered via CLI`, timestamp: now, status: "running" },
      { kind: "step_started", description: `Starting: ${wf.steps[0]}`, timestamp: now, status: "running" },
    ],
    triggeredBy: "CLI / manual",
  };

  saveRun(run);
  return { run, workflow: wf };
}

// ── runs ───────────────────────────────────────────────────────────────────────
export function getRecentRuns(limit = 10) {
  const session = getRunsFromSession();
  // Merge with catalog "last run" context for display
  return session.slice(0, limit);
}

// ── debug ──────────────────────────────────────────────────────────────────────
export function debugRun(runId) {
  const runs = getRunsFromSession();
  const sessionRun = runs.find(r => r.id === runId || r.id.includes(runId));
  if (sessionRun) return { run: sessionRun, source: "session" };

  // Fallback: synthesise a debug view from the catalog's last-known state
  const wf = WORKFLOW_CATALOG.find(w => w.id === runId || w.label.toLowerCase().includes(runId.toLowerCase()));
  if (!wf) return { error: `Run not found: "${runId}". Use 'watch workflow runs' to list recent runs.` };

  const syntheticRun = {
    id:           runId,
    workflowId:   wf.id,
    workflowName: wf.label,
    triggerSource: "event",
    status:       wf.lastStatus,
    startTime:    new Date(Date.now() - 14 * 60 * 1000).toISOString(),
    steps:        wf.steps.map((name, i) => ({
      name,
      status: wf.lastStatus === "failed" && i === 2 ? "failed"
            : wf.lastStatus === "failed" && i < 2   ? "completed"
            : wf.lastStatus === "failed"             ? "skipped"
            : "completed",
    })),
    timelineEvents: STEP_EVENTS[wf.lastStatus] ?? STEP_EVENTS.completed,
    triggeredBy: "automated trigger",
    failureReason: wf.lastStatus === "failed"
      ? "Step 3 (Slack notification): connection refused — Slack integration disconnected"
      : null,
  };

  return { run: syntheticRun, source: "catalog" };
}

// ── Resolve by name for context ───────────────────────────────────────────────
export function resolveWorkflowByName(nameArg) {
  return findWorkflow(nameArg);
}
