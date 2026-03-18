/**
 * ApprovalQueue — approval-first decision model for manager-oriented mode.
 *
 * Provides structured approval queue data for AIBox responses.  In production
 * this would query a backend approval/workflow API.  Here it is driven by the
 * same product signals already visible in the UI, keeping responses grounded.
 *
 * Prioritization order:
 *   1. Critical L3 actions pending approval (block IP, rotate credentials)
 *   2. Workflow publish / high-impact workflow changes
 *   3. Blocked workflows waiting on a decision
 *   4. Delegated items that remain incomplete
 *   5. High-risk unresolved findings escalated to manager
 *
 * Noise filtering: low-severity background churn, auto-resolvable items, and
 * items with no required human decision are excluded.
 */

// ── Types ─────────────────────────────────────────────────────────────────────

export type ApprovalSeverity = "critical" | "high" | "medium" | "low";

export interface ApprovalItem {
  id: string;
  severity: ApprovalSeverity;
  title: string;
  description: string;
  /** Action type — drives approve/reject/delegate button labeling */
  type: "approve-action" | "publish-workflow" | "delegate-review" | "review-finding";
  /** Who submitted this for approval */
  submittedBy: string;
  /** How long it has been pending */
  pendingSince: string;
  /** Whether approval rights are required to act (true = manager-only) */
  requiresApprovalRights: boolean;
}

export interface BlockedItem {
  severity: ApprovalSeverity;
  title: string;
  description: string;
  blockedReason: "awaiting-approval" | "integration-down" | "missing-assignment" | "compliance-hold";
}

export interface DelegationItem {
  severity: ApprovalSeverity;
  title: string;
  suggestedAssignee: string;
  rationale: string;
}

export interface ApprovalQueueReport {
  /** Items requiring explicit manager approval */
  pendingApprovals: ApprovalItem[];
  /** Items currently blocked waiting on a decision or dependency */
  blockedItems: BlockedItem[];
  /** Highest-risk unresolved items needing leadership attention */
  highRiskItems: { severity: ApprovalSeverity; title: string; description: string }[];
  /** Manager-facing recommended next decisions */
  recommendedDecisions: string[];
  /** Items good candidates for delegation rather than direct approval */
  delegationCandidates: DelegationItem[];
}

// ── Detection helpers ─────────────────────────────────────────────────────────

/**
 * Returns true when the query is asking about approvals, pending decisions,
 * blocked work, or the approval queue.
 */
export function isApprovalQuery(query: string): boolean {
  const q = query.toLowerCase();
  return (
    /what\s+(needs?|requires?)\s+(my\s+)?(approval|approving)/i.test(query) ||
    /show\s+(me\s+)?(pending\s+)?(approvals?|approval\s+queue)/i.test(query) ||
    /pending\s+(approvals?|decisions?|actions?)/i.test(query) ||
    /what\s+is\s+blocked/i.test(query) ||
    /show\s+(blocked|waiting\s+for\s+approval)/i.test(query) ||
    /summarize\s+pending\s+decisions/i.test(query) ||
    /what\s+should\s+i\s+(approve|review\s+first)/i.test(query) ||
    q.includes("what needs approval") ||
    q.includes("needs my approval") ||
    q.includes("pending approval") ||
    q.includes("what is blocked") ||
    q.includes("what's blocked") ||
    q.includes("show blocked") ||
    q.includes("approval queue") ||
    q.includes("pending decisions") ||
    q.includes("summarize pending")
  );
}

/**
 * Returns true when the query is asking what to delegate.
 */
export function isDelegationQuery(query: string): boolean {
  const q = query.toLowerCase();
  return (
    /what\s+should\s+i\s+delegate/i.test(query) ||
    /delegate\s+(this|review|workflow|issue|compliance|investigation|task)/i.test(query) ||
    /assign\s+(this|issue|task|investigation)\s+to/i.test(query) ||
    /send\s+(this|compliance)\s+(gap\s+)?to/i.test(query) ||
    q.includes("what should i delegate") ||
    q.includes("delegate to") ||
    q.includes("assign to soc") ||
    q.includes("assign to analyst")
  );
}

/**
 * Returns true when the query is a direct approve/reject command on an action.
 */
export function isApproveRejectQuery(query: string): boolean {
  const q = query.toLowerCase();
  return (
    /^approve\s+(this|workflow|action|publish|remediation)/i.test(query) ||
    /^reject\s+(this|workflow|action|remediation)/i.test(query) ||
    q.startsWith("approve ") ||
    q.startsWith("reject ") ||
    q.includes("approve block ip") ||
    q.includes("approve workflow publish") ||
    q.includes("reject this action") ||
    q.includes("approve this action")
  );
}

// ── Approval queue data ───────────────────────────────────────────────────────

/** Returns the current approval queue state */
export function getApprovalQueue(): ApprovalQueueReport {
  return {
    pendingApprovals: [
      {
        id: "appr-001",
        severity: "critical",
        title: "Block IP Address — finance-db-01 attack path entry",
        description: "Block inbound access from the compromised staging host IP to finance-db-01. Submitted by Risk Intelligence Analyst.",
        type: "approve-action",
        submittedBy: "Risk Intelligence Analyst",
        pendingSince: "2 hours ago",
        requiresApprovalRights: true,
      },
      {
        id: "appr-002",
        severity: "high",
        title: "Publish Critical Alert Auto-Response workflow",
        description: "Publish updated workflow with Slack integration fix and improved escalation logic.",
        type: "publish-workflow",
        submittedBy: "SOC Lead",
        pendingSince: "4 hours ago",
        requiresApprovalRights: true,
      },
      {
        id: "appr-003",
        severity: "medium",
        title: "Rotate service account credentials — prod-0384",
        description: "Rotate exposed service account credentials flagged with 5 new indicators.",
        type: "approve-action",
        submittedBy: "Identity Security Analyst",
        pendingSince: "1 day ago",
        requiresApprovalRights: true,
      },
    ],
    blockedItems: [
      {
        severity: "critical",
        title: "Critical Alert Auto-Response workflow — Blocked",
        description: "Paused waiting for Slack integration reconnection approval and workflow publish sign-off.",
        blockedReason: "awaiting-approval",
      },
      {
        severity: "high",
        title: "Remediation playbook for finance-db-01 — Blocked",
        description: "Remediation requires manager approval before executing lateral movement mitigation.",
        blockedReason: "awaiting-approval",
      },
      {
        severity: "medium",
        title: "Compliance review — SOC 2 CC6.1 gap — Blocked",
        description: "Assigned to compliance team but no owner acknowledged; 2 days without response.",
        blockedReason: "missing-assignment",
      },
    ],
    highRiskItems: [
      {
        severity: "critical",
        title: "Attack path to finance-db-01 remains exploitable",
        description: "Block IP approval pending. Every hour of delay keeps the lateral movement path open.",
      },
      {
        severity: "high",
        title: "Slack integration down — notifications blocked",
        description: "Critical Alert Auto-Response workflow cannot notify on-call team. Workflow publish approval pending.",
      },
      {
        severity: "high",
        title: "3 crown jewel assets with unacknowledged exposure",
        description: "No owner has acknowledged these assets since the risk escalation. Delegation may be required.",
      },
    ],
    recommendedDecisions: [
      "Approve Block IP for finance-db-01 — removes critical attack path",
      "Approve Critical Alert Auto-Response workflow publish — restores notification chain",
      "Delegate SOC 2 CC6.1 review to Compliance Owner",
      "Review and rotate prod-0384 service account credentials",
    ],
    delegationCandidates: [
      {
        severity: "medium",
        title: "SOC 2 CC6.1 compliance gap review",
        suggestedAssignee: "Compliance Owner",
        rationale: "Requires compliance domain expertise; currently unassigned for 2 days.",
      },
      {
        severity: "high",
        title: "Crown jewel asset exposure acknowledgment",
        suggestedAssignee: "Asset Owner / CISO",
        rationale: "3 production assets have unacknowledged exposure — requires asset owner sign-off.",
      },
      {
        severity: "medium",
        title: "Identity security review — stale API tokens",
        suggestedAssignee: "Identity Security Analyst",
        rationale: "23 stale API tokens with admin scope; analyst can execute without manager involvement.",
      },
    ],
  };
}

/** Context-scoped approval summaries for specific page contexts */
export function getContextApprovalSummary(context: string): {
  pendingCount: number;
  blockedCount: number;
  topItem: string | null;
} {
  const queue = getApprovalQueue();
  if (context === "workflow") {
    return {
      pendingCount: 1,
      blockedCount: 2,
      topItem: "Publish Critical Alert Auto-Response workflow",
    };
  }
  if (context === "asset" || context === "attack-path") {
    return {
      pendingCount: 2,
      blockedCount: 1,
      topItem: "Block IP Address — finance-db-01 attack path entry",
    };
  }
  if (context === "compliance") {
    return {
      pendingCount: 1,
      blockedCount: 1,
      topItem: "SOC 2 CC6.1 access control gap — needs delegation",
    };
  }
  return {
    pendingCount: queue.pendingApprovals.length,
    blockedCount: queue.blockedItems.length,
    topItem: queue.pendingApprovals[0]?.title ?? null,
  };
}
