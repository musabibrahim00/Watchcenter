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

/** Suggested prompts per analyst for the AI assistant */
export const AGENT_SUGGESTIONS: Record<AgentId, string[]> = {
  alpha: [
    "Explain recent findings",
    "Assess current risk",
    "Trace attack path",
    "Re-run analysis",
  ],
  hotel: [
    "Explain recent findings",
    "Assess current risk",
    "Simulate impact",
    "Re-run analysis",
  ],
  foxtrot: [
    "Explain recent findings",
    "Trace attack path",
    "Assess current risk",
    "Simulate impact",
  ],
  echo: [
    "Explain recent findings",
    "Assess current risk",
    "Re-run analysis",
    "Simulate impact",
  ],
  delta: [
    "Explain recent findings",
    "Assess current risk",
    "Re-run analysis",
    "Trace attack path",
  ],
  bravo: [
    "Explain recent findings",
    "Assess current risk",
    "Re-run analysis",
    "Trace attack path",
  ],
  charlie: [
    "Explain recent findings",
    "Assess current risk",
    "Trace attack path",
    "Re-run analysis",
  ],
  golf: [
    "Explain recent findings",
    "Assess current risk",
    "Re-run analysis",
    "Simulate impact",
  ],
};