/**
 * multiAgentEngine — Multi-analyst intent detection and response building
 *
 * Extracted from GlobalAIBox to isolate multi-agent orchestration logic
 * from the main AI panel rendering concern.  Contains only pure functions
 * (no JSX, no React, no side effects).
 *
 * GlobalAIBox imports these helpers; `processMultiAgentQuery` (which builds
 * JSX with ActionCard / ContributingAgentsBlock) remains in GlobalAIBox.
 */

import type { AiBoxPageContext } from "./AiBoxContext";

// ── Analyst keyword routing ─────────────────────────────────────────────────

/** Keyword signals mapped to analyst roles for query routing */
export const ANALYST_KEYWORDS: Record<string, string[]> = {
  "Asset Intelligence Analyst":        ["asset", "inventory", "ownership", "classification", "device", "endpoint", "cmdb"],
  "Vulnerability Analyst":             ["vulnerabilit", "cve", "patch", "exploit", "weakness"],
  "Exposure Analyst":                  ["exposure", "attack path", "lateral", "internet-facing", "blast radius", "reachable"],
  "Risk Intelligence Analyst":         ["risk score", "risk posture", "business impact", "risk intelligence", "risk recalcul", "business risk"],
  "Governance & Compliance Analyst":   ["compliance", "policy", "regulatory", "audit", "approval", "governance"],
  "Configuration Security Analyst":    ["misconfiguration", "drift", "baseline", "configuration"],
  "Application Security Analyst":      ["application sec", "code", "dependency", "supply chain"],
  "Identity Security Analyst":         ["identity", "privilege escalation", "dormant account", "credential"],
};

/** Natural-language patterns that indicate a multi-analyst investigation intent */
export const MULTI_AGENT_PATTERNS: RegExp[] = [
  /reinvestigate/i,
  /re-?run\s+investigation\s+(across|for\s+all|with\s+all)/i,
  /reassess\s+(this|findings|issue|exposure|vulnerabilit)/i,
  /recalculate\s+risk\s+using/i,
  /simulate\s+(cross.?agent|impact\s+if)/i,
  /across\s+(all\s+)?(analysts?|agents?|perspectives?)/i,
  /from\s+a?\s*different\s+(lens|perspective|angle)/i,
  /comprehensive\s+(review|analysis|assessment|investigation)/i,
  /full\s+investigation/i,
  /all\s+(relevant\s+)?(analysts?|agents?)/i,
  /multiple\s+(analysts?|perspectives?|lenses?)/i,
];

// ── Intent detection helpers ────────────────────────────────────────────────

/** Returns true when the query matches a multi-analyst orchestration pattern */
export function detectMultiAgentIntent(query: string): boolean {
  return MULTI_AGENT_PATTERNS.some(p => p.test(query));
}

/**
 * Resolve which analysts should participate given the query text and current
 * page context.  Returns 2–5 analyst role strings.
 */
export function resolveAnalysts(query: string, _ctx: AiBoxPageContext | null): string[] {
  const q = query.toLowerCase();

  // Predefined sets for common orchestration patterns
  if (/reinvestigate|re-?run\s+investigation/i.test(query)) {
    return ["Asset Intelligence Analyst", "Vulnerability Analyst", "Exposure Analyst", "Risk Intelligence Analyst"];
  }
  if (/recalculate\s+risk\s+using|reassess.*risk/i.test(query)) {
    return ["Asset Intelligence Analyst", "Vulnerability Analyst", "Exposure Analyst", "Risk Intelligence Analyst"];
  }
  if (/simulate\s+(cross|impact\s+if)/i.test(query)) {
    return ["Exposure Analyst", "Asset Intelligence Analyst", "Risk Intelligence Analyst"];
  }
  if (/reassess\s+(findings|this|issue)/i.test(query)) {
    return ["Asset Intelligence Analyst", "Vulnerability Analyst", "Exposure Analyst", "Governance & Compliance Analyst"];
  }
  if (/comprehensive|full\s+investigation/i.test(query)) {
    return [
      "Asset Intelligence Analyst", "Vulnerability Analyst", "Exposure Analyst",
      "Risk Intelligence Analyst", "Governance & Compliance Analyst",
    ];
  }

  // Keyword-based resolution
  const matched: string[] = [];
  for (const [analyst, keywords] of Object.entries(ANALYST_KEYWORDS)) {
    if (keywords.some(kw => q.includes(kw))) matched.push(analyst);
  }
  if (matched.length >= 2) return matched.slice(0, 4);

  // Fallback
  return ["Asset Intelligence Analyst", "Exposure Analyst", "Risk Intelligence Analyst"];
}

/** Produce a one-line contribution summary for a given analyst and query type */
export function getAnalystContribution(analyst: string, query: string): string {
  const isRisk     = /risk|posture|score/i.test(query);
  const isSimulate = /simulat/i.test(query);
  const isReassess = /reassess/i.test(query);

  const contributions: Record<string, string> = {
    "Asset Intelligence Analyst":
      isRisk     ? "provided asset classification and business criticality"
      : isSimulate ? "assessed downstream asset scope and ownership"
      :              "identified affected assets and established ownership",

    "Vulnerability Analyst":
      isRisk     ? "contributed validated CVE severity and patch status"
      : isReassess ? "re-validated CVE exploitability against current patch state"
      :              "validated exploitable vulnerabilities and CVE impact",

    "Exposure Analyst":
      isSimulate ? "modeled reachable attack paths from the exposed entry point"
      : isReassess ? "re-assessed lateral movement and reachability"
      :              "mapped reachable attack paths and lateral movement risk",

    "Risk Intelligence Analyst":
      isSimulate ? "estimated business impact score for each blast radius"
      :            "synthesized composite risk score across all analyst inputs",

    "Governance & Compliance Analyst":
      isReassess ? "re-evaluated compliance posture against current findings"
      :            "assessed policy impact and approval requirements",

    "Configuration Security Analyst":  "identified configuration drift and baseline deviations",
    "Application Security Analyst":    "reviewed dependency exposure and code-level risks",
    "Identity Security Analyst":       "assessed privilege paths and credential exposure",
  };

  return contributions[analyst] ?? "contributed analysis for this investigation";
}

/**
 * Build a structured text response for multi-analyst explore/explain queries.
 * Returns `{ content }` only — the JSX `uiModule` (ContributingAgentsBlock) is
 * added by `processMultiAgentQuery` in GlobalAIBox.
 */
export function buildMultiAgentExploreResponse(
  query: string,
  analysts: string[],
  ctx: AiBoxPageContext | null,
): { content: string } {
  const label      = ctx?.label ? `**${ctx.label}**` : "the current scope";
  const isSimulate = /simulat/i.test(query);
  const isRisk     = /risk/i.test(query);
  const isReassess = /reassess/i.test(query);

  const summary = isSimulate
    ? `Simulating impact across ${analysts.length} analysts for ${label}. The analysis covers attack path reachability, asset exposure, and estimated business impact.`
    : isRisk
    ? `Recalculating risk for ${label} using inputs from ${analysts.length} analysts. The composite score incorporates asset criticality, vulnerability severity, exposure reachability, and threat intelligence.`
    : isReassess
    ? `Reassessing findings for ${label} across ${analysts.length} analysts. Each analyst re-evaluates their domain against the current state.`
    : `Re-running investigation for ${label} across ${analysts.length} analysts. Each analyst contributes domain-specific findings to a synthesized result.`;

  const contributions = analysts
    .map(a => `- **${a}** → ${getAnalystContribution(a, query)}`)
    .join("\n");

  const nextActions = isSimulate
    ? ["Create a case from the blast radius findings", "Recalculate risk with simulation results", "Restrict internet-facing access for affected assets"]
    : isRisk
    ? ["Review updated risk score in the Risk Register", "Reassess exposure for top-risk assets", "Create a remediation case for critical findings"]
    : ["Review updated findings in Agent Detail", "Recalculate risk score with new data", "Create a case from high-severity findings"];

  const content = [
    `## Summary`,
    summary,
    ``,
    `## Analyst Contributions`,
    contributions,
    ``,
    `## Recommended Next Actions`,
    nextActions.map(a => `- ${a}`).join("\n"),
  ].join("\n");

  return { content };
}
