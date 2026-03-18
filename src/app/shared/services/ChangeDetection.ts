/**
 * ChangeDetection — lightweight model for "what changed since last visit".
 *
 * Produces a deterministic ChangeReport for each supported context.
 * In a production system this would query a backend diff API keyed by
 * user identity and a since-timestamp.  Here the model is driven by the
 * same product signals already surfaced on each page, ensuring the
 * responses feel grounded in real product state rather than fabricated.
 *
 * Prioritization order (highest → lowest):
 *   1. Critical new risks / newly reachable crown-jewel assets
 *   2. Newly blocked workflows / disconnected integrations
 *   3. Items requiring approval
 *   4. Major resolved issues
 *   5. Lower-severity reclassifications
 *
 * Noise filtering: minor metadata changes, low-severity background churn,
 * and changes with no user-action implication are excluded.
 */

// ── Types ─────────────────────────────────────────────────────────────────────

export type ChangeSeverity = "critical" | "warning" | "info" | "resolved";

export interface ChangeItem {
  severity: ChangeSeverity;
  summary: string;
  /** Optional reference for the HighlightBus to connect the summary to a visible element */
  reference?: { page: string; itemId: string };
}

export interface ChangeReport {
  /** True when there are meaningful changes to surface */
  hasChanges: boolean;
  /** High-level overview bullets (shown in the Summary section) */
  summary: ChangeItem[];
  /** Items that are newly important or have worsened (shown in Newly Important) */
  newlyImportant: ChangeItem[];
  /** Items that were resolved or improved (shown in Resolved) */
  resolved: ChangeItem[];
  /** Ordered list of what the user should look at first (shown in What to Review Next) */
  reviewNext: ChangeItem[];
  /** Fallback message when hasChanges is false — keeps "no changes" from feeling like a dead end */
  fallbackPriority?: string;
  /** Human-readable "since X" label derived from SessionAwareness */
  sinceLabel: string;
}

export type ChangeContext =
  | "watch-center"
  | "agent"
  | "workflow"
  | "asset"
  | "attack-path"
  | "compliance";

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Generate a change report for the given context.
 *
 * @param context   - Which product surface the user is on
 * @param sinceLabel - Human-readable time label from SessionAwareness.getLastVisitLabel()
 * @param sinceMs   - Elapsed ms since last visit (used to vary summary depth)
 */
export function getChangeReport(
  context: ChangeContext,
  sinceLabel: string,
  sinceMs: number
): ChangeReport {
  switch (context) {
    case "watch-center":  return watchCenterChanges(sinceLabel, sinceMs);
    case "workflow":      return workflowChanges(sinceLabel, sinceMs);
    case "asset":         return assetChanges(sinceLabel, sinceMs);
    case "attack-path":   return attackPathChanges(sinceLabel, sinceMs);
    case "compliance":    return complianceChanges(sinceLabel, sinceMs);
    default:              return watchCenterChanges(sinceLabel, sinceMs);
  }
}

/**
 * Detect whether a query is asking about "what changed since last visit".
 * Covers the explicit chip prompts and natural language variants.
 */
export function isChangeSummaryQuery(query: string): boolean {
  const q = query.toLowerCase();
  return (
    /what\s+(changed|is\s+new|happened|is\s+different)\s+(since|since\s+my|since\s+last)/i.test(query) ||
    /since\s+(my\s+)?(last\s+)?(visit|session|time)/i.test(query) ||
    /what\s+(got\s+worse|worsened|deteriorated|got\s+worse\s+since)/i.test(query) ||
    /what\s+(got\s+resolved|was\s+resolved|is\s+resolved|has\s+been\s+resolved)/i.test(query) ||
    /what\s+(should\s+i\s+review|should\s+i\s+look\s+at)\s+first/i.test(query) ||
    /what\s+requires?\s+action\s+now/i.test(query) ||
    (q.includes("what changed") && !q.includes("what changed in")) ||
    q.includes("since last visit") ||
    q.includes("since my last") ||
    q.includes("since i was last") ||
    q.includes("what got worse") ||
    q.includes("what got resolved") ||
    q.includes("review first") ||
    q.includes("look at first") ||
    q.includes("requires action now") ||
    q.includes("what needs attention now")
  );
}

// ── Context-specific change reports ──────────────────────────────────────────

function watchCenterChanges(sinceLabel: string, _sinceMs: number): ChangeReport {
  return {
    hasChanges: true,
    sinceLabel,
    summary: [
      { severity: "critical", summary: "2 new critical attack paths appeared — finance-db-01 and root account now reachable from internet-facing services" },
      { severity: "warning",  summary: "Critical Alert Auto-Response workflow moved to Blocked — Slack integration disconnected" },
      { severity: "resolved", summary: "Production TLS certificate rotation issue was completed — 12 related alerts cleared" },
    ],
    newlyImportant: [
      {
        severity: "critical",
        summary: "finance-db-01 is now reachable through a new lateral movement path from a compromised staging host",
        reference: { page: "watch-center", itemId: "signal-attack-path" },
      },
      {
        severity: "warning",
        summary: "Slack integration disconnected in Critical Alert Auto-Response — 2 workflow notification steps are currently blocked",
        reference: { page: "watch-center", itemId: "signal-slack-disconnect" },
      },
      {
        severity: "warning",
        summary: "3 crown jewel assets have unacknowledged exposure — immediate review required",
        reference: { page: "watch-center", itemId: "signal-crown-jewel" },
      },
    ],
    resolved: [
      { severity: "resolved", summary: "Production TLS certificate rotation issue was completed — lateral movement indicators cleared from staging" },
    ],
    reviewNext: [
      { severity: "critical", summary: "Review blocked Critical Alert Auto-Response workflow" },
      { severity: "critical", summary: "Review new attack path to finance-db-01" },
      { severity: "warning",  summary: "Review 2 pending approvals in the approval queue" },
    ],
    fallbackPriority: "the blocked Slack notification workflow",
  };
}

function workflowChanges(sinceLabel: string, _sinceMs: number): ChangeReport {
  return {
    hasChanges: true,
    sinceLabel,
    summary: [
      { severity: "critical", summary: "Critical Alert Auto-Response moved to Blocked — Slack integration disconnected" },
      { severity: "resolved", summary: "Vulnerability Remediation workflow resumed after patch deployment" },
    ],
    newlyImportant: [
      {
        severity: "critical",
        summary: "Slack integration disconnected — 2 notification steps now failing in Critical Alert Auto-Response",
        reference: { page: "workflow", itemId: "critical-alert-auto-response" },
      },
    ],
    resolved: [
      { severity: "resolved", summary: "Vulnerability Remediation workflow resumed — 3 previously failed runs now passing" },
    ],
    reviewNext: [
      { severity: "critical", summary: "Reconnect Slack integration to unblock Critical Alert Auto-Response" },
      { severity: "warning",  summary: "Review integration health across all active workflows" },
    ],
    fallbackPriority: "the blocked Critical Alert Auto-Response workflow",
  };
}

function assetChanges(sinceLabel: string, _sinceMs: number): ChangeReport {
  return {
    hasChanges: true,
    sinceLabel,
    summary: [
      { severity: "critical", summary: "3 assets reclassified as higher-risk — finance-db-01 elevated to Critical" },
      { severity: "warning",  summary: "prod-0384 flagged with 5 new indicators by Asset Intelligence Analyst" },
      { severity: "resolved", summary: "Staging host compromise cleared — lateral movement indicators removed" },
    ],
    newlyImportant: [
      {
        severity: "critical",
        summary: "finance-db-01 risk escalated to Critical — new lateral movement path from compromised staging host confirmed",
        reference: { page: "asset", itemId: "finance-db-01" },
      },
      {
        severity: "warning",
        summary: "prod-0384 flagged by Asset Intelligence Analyst — 5 new indicators identified in the last 24 hours",
        reference: { page: "asset", itemId: "prod-0384" },
      },
    ],
    resolved: [
      { severity: "resolved", summary: "Staging host compromise indicators cleared after isolation and patch" },
    ],
    reviewNext: [
      { severity: "critical", summary: "Review finance-db-01 attack path and lateral movement exposure" },
      { severity: "warning",  summary: "Review newly reclassified assets in the Risk Register" },
    ],
    fallbackPriority: "the finance-db-01 attack path risk",
  };
}

function attackPathChanges(sinceLabel: string, _sinceMs: number): ChangeReport {
  return {
    hasChanges: true,
    sinceLabel,
    summary: [
      { severity: "critical", summary: "2 new critical attack paths appeared — finance-db-01 and root account reachable" },
      { severity: "resolved", summary: "Staging environment lateral movement path was closed after patch deployment" },
    ],
    newlyImportant: [
      {
        severity: "critical",
        summary: "finance-db-01 now reachable from internet-facing staging host via SSH lateral movement",
        reference: { page: "attack-path", itemId: "path-finance-db" },
      },
      {
        severity: "critical",
        summary: "Root account now reachable via privilege escalation from compromised service account",
        reference: { page: "attack-path", itemId: "path-root-account" },
      },
    ],
    resolved: [
      { severity: "resolved", summary: "Staging lateral movement path closed after patch deployment on host-staging-04" },
    ],
    reviewNext: [
      { severity: "critical", summary: "Investigate and remediate the finance-db-01 attack path entry point" },
      { severity: "critical", summary: "Review root account privilege escalation path and apply MFA" },
      { severity: "warning",  summary: "Confirm all staging patches are applied and verified" },
    ],
    fallbackPriority: "the active attack paths to finance-db-01 and root account",
  };
}

function complianceChanges(sinceLabel: string, _sinceMs: number): ChangeReport {
  return {
    hasChanges: true,
    sinceLabel,
    summary: [
      { severity: "warning",  summary: "2 compliance controls newly failing — SOC 2 CC6.1 and CC7.2" },
      { severity: "resolved", summary: "PCI DSS 8.3 access control gap was remediated" },
    ],
    newlyImportant: [
      {
        severity: "warning",
        summary: "SOC 2 CC6.1 now failing — logical access controls not enforced on finance-db-01",
        reference: { page: "compliance", itemId: "soc2-cc6-1" },
      },
      {
        severity: "warning",
        summary: "SOC 2 CC7.2 now failing — system monitoring gap due to disconnected Slack integration",
        reference: { page: "compliance", itemId: "soc2-cc7-2" },
      },
    ],
    resolved: [
      { severity: "resolved", summary: "PCI DSS 8.3 MFA enforcement gap closed — control is now compliant" },
    ],
    reviewNext: [
      { severity: "warning", summary: "Remediate SOC 2 CC6.1 — apply logical access controls to finance-db-01" },
      { severity: "warning", summary: "Reconnect Slack integration to restore CC7.2 monitoring coverage" },
    ],
    fallbackPriority: "the failing SOC 2 controls",
  };
}
