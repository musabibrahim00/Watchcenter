/**
 * audit.mjs — Implementation-level audit logging for CLI AI actions
 *
 * Appends JSONL entries to ~/.secops/audit.jsonl — same conceptual model
 * as the UI's audit-log.ts.  Not printed to normal terminal output.
 *
 * Log is available for compliance review at: ~/.secops/audit.jsonl
 */

import { appendFileSync, mkdirSync, existsSync } from "fs";
import { homedir } from "os";
import { join } from "path";

const AUDIT_DIR  = join(homedir(), ".secops");
const AUDIT_FILE = join(AUDIT_DIR, "audit.jsonl");

function ensureDir() {
  if (!existsSync(AUDIT_DIR)) {
    try { mkdirSync(AUDIT_DIR, { recursive: true }); } catch { /* ignore */ }
  }
}

/**
 * Log a CLI AI action to the audit trail.
 *
 * @param {object} entry
 * @param {string} entry.user           - Simulated user context
 * @param {string} entry.command        - The CLI command issued
 * @param {string} entry.contextType    - "agent" | "workflow" | "asset" | "attack-path" | "compliance" | "general"
 * @param {string} entry.actionTitle    - Human-readable action title
 * @param {string} entry.scope          - Entity the action targets
 * @param {string} entry.guardrailLevel - "L1" | "L2" | "L3"
 * @param {string} entry.approvalStatus - "not-required" | "pending" | "approved" | "denied" | "bypassed"
 * @param {string} entry.outcome        - "initiated" | "completed" | "failed" | "cancelled" | "denied"
 */
export function logCliAction(entry) {
  ensureDir();
  const record = {
    timestamp:     new Date().toISOString(),
    surface:       "cli",
    user:          entry.user          ?? process.env.USER ?? "cli-user",
    command:       entry.command       ?? "",
    contextType:   entry.contextType   ?? "general",
    actionTitle:   entry.actionTitle   ?? "",
    scope:         entry.scope         ?? "",
    guardrailLevel:entry.guardrailLevel ?? "L1",
    approvalStatus:entry.approvalStatus ?? "not-required",
    outcome:       entry.outcome       ?? "initiated",
  };

  try {
    appendFileSync(AUDIT_FILE, JSON.stringify(record) + "\n", "utf8");
  } catch {
    // Silently ignore — audit failure must never block the user workflow
  }
}

/** Log a deep-link or context entry event from the CLI. */
export function logDeepLinkEntry(entry) {
  ensureDir();
  const record = {
    timestamp:      new Date().toISOString(),
    surface:        "cli",
    source:         entry.source         ?? "direct",
    destinationPage:entry.destinationPage ?? "",
    contextType:    entry.contextType     ?? "general",
    hadPrefillQuery:entry.hadPrefillQuery ?? false,
    actionExecuted: entry.actionExecuted  ?? false,
  };

  try {
    appendFileSync(AUDIT_FILE, JSON.stringify(record) + "\n", "utf8");
  } catch { /* ignore */ }
}
