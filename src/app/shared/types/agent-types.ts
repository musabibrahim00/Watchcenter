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
  alpha: "Asset Intelligence Analyst",
  hotel: "Vulnerability Analyst",
  foxtrot: "Exposure Analyst",
  echo: "Risk Intelligence Analyst",
  delta: "Governance & Compliance Analyst",
  bravo: "Configuration Security Analyst",
  charlie: "Application Security Analyst",
  golf: "Identity Security Analyst",
};

