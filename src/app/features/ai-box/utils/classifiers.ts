/**
 * AI Box — Query classification utilities.
 *
 * Pure functions: no React, no state, no side-effects.
 * Determines action intent and guardrail level from query strings.
 */

import type { ActionIntent, GuardrailLevel } from "../types";

/* ── Action verb patterns — triggers "act" intent ── */

const ACT_PATTERNS: RegExp[] = [
  /re-?run\s+(analysis|investigation|scan|assessment)/i,
  /re-?classify\s+(asset|endpoint|resource)/i,
  /recalculate\s+(risk|score|posture)/i,
  /simulate\s+(impact|blast|breach|attack)/i,
  /re-?run\s+(investigation|playbook)/i,
  /block\s+(ip|endpoint|user|account)/i,
  /isolate\s+(host|endpoint|machine|asset)/i,
  /disable\s+(account|user|token|key)/i,
  /rotate\s+(credentials?|tokens?|keys?|secrets?)/i,
  /quarantine/i,
  /trigger\s+(scan|remediation|workflow|playbook)/i,
  /escalate\s+(to|case|alert|incident)/i,
  /create\s+(case|ticket|incident)/i,
  /assign\s+(analyst|owner|case)/i,
  /run\s+(compliance\s+check|vulnerability\s+scan|posture\s+scan)/i,
  /deploy\s+(patch|fix|update|hotfix)/i,
  /update\s+(policy|rule|baseline|config)/i,
  /* ── Multi-agent orchestration triggers ── */
  /reinvestigate/i,
  /re-?run\s+investigation\s+(across|for\s+all|with\s+all)/i,
  /reassess\s+(this|findings|issue|exposure|vulnerabilit)/i,
  /recalculate\s+risk\s+using/i,
  /simulate\s+(cross.?agent|impact\s+if)/i,
  /across\s+(all\s+)?(analysts?|agents?|perspectives?)/i,
  /from\s+a?\s*different\s+(lens|perspective|angle)/i,
  /comprehensive\s+(review|analysis|assessment|investigation)/i,
  /full\s+investigation/i,
];

/* ── Explore verb patterns — triggers "explore" intent ── */

const EXPLORE_PATTERNS: RegExp[] = [
  /show\s+(me|all|the)/i,
  /list\s+(all|the|active|recent)/i,
  /what\s+(are|is|were|was)/i,
  /how\s+many/i,
  /which\s+(assets?|agents?|cases?|paths?)/i,
  /compare/i,
  /drill\s+(in|down|into)/i,
  /breakdown/i,
  /distribution/i,
  /trend/i,
  /graph|chart|visuali/i,
];

/* ── Guardrail level patterns ── */

const _L3_GUARD: RegExp[] = [
  /block\s+(ip|endpoint|user|account)/i,
  /disable\s+(account|user|token|key)/i,
  /quarantine/i,
  /isolate\s+(host|endpoint|machine|asset)/i,
  /rotate\s+(credentials?|tokens?|keys?|secrets?)/i,
  /publish\s+(workflow|playbook)/i,
  /reconnect\s+(integration|slack|jira|aws|virustotal)/i,
  /deploy\s+(patch|fix|update|hotfix)/i,
  /trigger\s+(remediation|playbook)/i,
  /escalate\s+(to|case|alert|incident)/i,
];

const _L2_GUARD: RegExp[] = [
  /re-?run/i,
  /recalculate/i,
  /reassess/i,
  /simulat/i,
  /re-?classify/i,
  /create\s+(case|ticket|incident)/i,
  /run\s+(scan|check|assessment)/i,
  /update\s+(policy|rule|baseline|config)/i,
  /trigger\s+scan/i,
  /assign\s+(analyst|owner|case)/i,
  /reinvestigate/i,
];

export function classifyGuardrailLevel(query: string): GuardrailLevel {
  if (_L3_GUARD.some(p => p.test(query))) return "L3";
  if (_L2_GUARD.some(p => p.test(query))) return "L2";
  return "L1";
}

export function classifyActionIntent(query: string): ActionIntent {
  const q = query.trim();
  for (const p of ACT_PATTERNS) {
    if (p.test(q)) return "act";
  }
  for (const p of EXPLORE_PATTERNS) {
    if (p.test(q)) return "explore";
  }
  if (/^(explain|describe|why|how does|what does|tell me about|walk me through)/i.test(q)) return "explain";
  return "explore";
}
