/**
 * Audit Log — implementation-level logging for AI-triggered executable actions
 * and deep-link entry events.
 * Not exposed directly in main UI. Available for debugging and compliance review.
 */

export type GuardrailLevel = "L1" | "L2" | "L3";

export interface AuditEntry {
  timestamp: string;
  /** Simulated user context (replace with real auth when available) */
  user: string;
  pageContext: string;
  actionTitle: string;
  scope: string;
  guardrailLevel: GuardrailLevel;
  approvalStatus: "not-required" | "pending" | "approved" | "denied" | "bypassed";
  outcome: "initiated" | "completed" | "failed" | "cancelled" | "denied";
  /** Set when the entry is an approval decision (approve / reject) */
  decisionType?: "approved" | "rejected";
  /** Target user or team when an item is delegated */
  delegateTo?: string;
  /** Approval queue item ID when the entry links to a pending approval */
  approvalItemId?: string;
}

/* ── Deep-link entry traceability ────────────────────────────── */

export type AlertActionSource = "slack" | "email" | "notification" | "direct";

export interface DeepLinkEntry {
  timestamp: string;
  /** Where the deep link originated */
  source: AlertActionSource;
  /** Route navigated to */
  destinationPage: string;
  /** AIBox context type loaded (e.g. "agent", "asset", "attack-path") */
  contextType: string;
  /** Whether a prefilled query was carried in the link */
  hadPrefillQuery: boolean;
  /** Whether the user subsequently executed an action (updated externally) */
  actionExecuted?: boolean;
}

const _log: AuditEntry[] = [];
const _deepLinkLog: DeepLinkEntry[] = [];

export function logAction(entry: Omit<AuditEntry, "timestamp">): void {
  const record: AuditEntry = { timestamp: new Date().toISOString(), ...entry };
  _log.push(record);
  if (import.meta.env.DEV) {
    // eslint-disable-next-line no-console
    console.debug("[AuditLog]", record);
  }
}

export function getAuditLog(): readonly AuditEntry[] {
  return _log;
}

/** Record a deep-link entry event for traceability. */
export function logDeepLinkEntry(entry: Omit<DeepLinkEntry, "timestamp">): void {
  const record: DeepLinkEntry = { timestamp: new Date().toISOString(), ...entry };
  _deepLinkLog.push(record);
  if (import.meta.env.DEV) {
    // eslint-disable-next-line no-console
    console.debug("[DeepLinkEntry]", record);
  }
}

export function getDeepLinkLog(): readonly DeepLinkEntry[] {
  return _deepLinkLog;
}
