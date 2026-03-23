/**
 * Agent Types — Foundational agent type definitions.
 *
 * AgentId is the core identifier used across the entire platform.
 * Extracted here to break the dependency on Working.tsx for type-only imports.
 */

export type AgentId =
  | "alpha"
  | "bravo"
  | "charlie"
  | "delta"
  | "echo"
  | "foxtrot"
  | "golf"
  | "hotel";

/** Human-readable role labels for each analyst */
export const AGENT_ROLE_LABELS: Record<AgentId, string> = {
  alpha:   "Asset Intelligence Analyst",
  bravo:   "Configuration Security Analyst",
  charlie: "Application Security Analyst",
  delta:   "Governance & Compliance Analyst",
  echo:    "Risk Intelligence Analyst",
  foxtrot: "Exposure Analyst",
  golf:    "Identity Security Analyst",
  hotel:   "Vulnerability Analyst",
};

/** Alias used across the codebase — prefer AGENT_ROLE_LABELS for new code */
export const AGENT_NAMES = AGENT_ROLE_LABELS;

/** URL-safe slugs for each agent — used in page routes */
export const AGENT_SLUGS: Record<AgentId, string> = {
  alpha:   "asset-intelligence-analyst",
  bravo:   "configuration-security-analyst",
  charlie: "application-security-analyst",
  delta:   "governance-compliance-analyst",
  echo:    "risk-intelligence-analyst",
  foxtrot: "exposure-analyst",
  golf:    "identity-security-analyst",
  hotel:   "vulnerability-analyst",
};

/** Reverse map: slug → AgentId (type-safe, derived from AGENT_SLUGS) */
export const SLUG_TO_AGENT_ID = {
  "asset-intelligence-analyst":    "alpha",
  "configuration-security-analyst": "bravo",
  "application-security-analyst":  "charlie",
  "governance-compliance-analyst": "delta",
  "risk-intelligence-analyst":     "echo",
  "exposure-analyst":              "foxtrot",
  "identity-security-analyst":     "golf",
  "vulnerability-analyst":         "hotel",
} as const satisfies Record<string, AgentId>;

