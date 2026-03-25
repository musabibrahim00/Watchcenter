/**
 * AI Box — Pure type/interface definitions.
 *
 * No imports from React, no side-effects, no runtime logic.
 * Safe to import from any layer.
 */

/* ── Task graph ── */

export interface TaskNode {
  id: string;
  label: string;
  agent?: string;
  status: "pending" | "running" | "done";
}

export interface TaskGraph {
  nodes: TaskNode[];
  allDone: boolean;
}

/* ── Action lifecycle ── */

export type ActionLifecycleState =
  | "recommended"
  | "approved"
  | "deferred"
  | "modified"
  | "executed"
  | "completed"
  | "failed"
  | "reopened";

/* ── Chat message ── */

export interface ChatMessage {
  id: string;
  role: "user" | "agent" | "divider";
  text: string;
  timestamp: Date;
  taskGraph?: TaskGraph;
  renderedUI?: React.ReactNode;
  actionMeta?: {
    state: ActionLifecycleState;
    subject?: string;
    by?: string;
  };
}

/* ── Action model ── */

export type ActionIntent = "explain" | "explore" | "act";
export type ActionScope = "asset" | "agent" | "workflow" | "investigation" | "risk";
export type ActionStatus =
  | "pending"
  | "awaiting-approval"
  | "approval-denied"
  | "running"
  | "complete"
  | "failed"
  | "cancelled";

export interface ActionParameter {
  label: string;
  value: string;
  editable?: boolean;
}

export type GuardrailLevel = "L1" | "L2" | "L3";

export interface ActionCardData {
  id: string;
  title: string;
  scope: ActionScope;
  parameters: ActionParameter[];
  expectedOutcome: string;
  status: ActionStatus;
  progress?: number;
  result?: string;
  /** Analysts contributing to this action (multi-agent orchestration) */
  participatingAnalysts?: string[];
  /** What each analyst contributed — keyed by analyst name */
  analystContributions?: Record<string, string>;
  /** Guardrail classification */
  guardrailLevel?: GuardrailLevel;
  /** Level 3: requires human approval before execution */
  requiresApproval?: boolean;
  /** Short impact summary shown on the card */
  riskSummary?: string;
  /** false = current user lacks permission */
  userCanExecute?: boolean;
  /** Custom message when userCanExecute is false */
  permissionMessage?: string;
  /** true = read-only mode active, execution blocked */
  isReadOnly?: boolean;
  /** Plain-language explanation of why this action is recommended */
  why?: string;
  /** Supporting evidence bullets (2–5 items) */
  evidence?: string[];
  /** Certainty signal for trust calibration */
  confidence?: "high" | "moderate" | "needs-review";
  /** Approval explainability — why approval is required and what happens after */
  approvalContext?: {
    whyRequired: string;
    whatIsBlocked?: string;
    approveEffect: string;
    rejectEffect: string;
  };
}

/* ── Action catalog template ── */

export interface ActionTemplate {
  match: RegExp;
  build: (query: string, agentLabel?: string) => ActionCardData;
}

/* ── Action result propagation ── */

export type ActionResultType =
  | "findings_updated"
  | "risk_score_updated"
  | "asset_classification_changed"
  | "attack_path_refreshed"
  | "workflow_health_updated"
  | "run_status_changed"
  | "integration_state_changed"
  | "case_linkage_created";

export interface ActionResultData {
  resultType: ActionResultType;
  bullets: string[];
  before?: Record<string, string>;
  after?: Record<string, string>;
  unchanged?: Record<string, string>;
  changeState: "changed" | "partial" | "no-change";
  whyItChanged?: string;
  nextActions: string[];
  analysts?: string[];
}

export interface ActionFailureInfo {
  reason: string;
  impact: string;
  nextActions: string[];
}
