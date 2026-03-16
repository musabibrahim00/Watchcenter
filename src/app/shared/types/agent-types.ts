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
    "What did this analyst discover?",
    "Which assets were identified?",
    "Show related attack paths",
    "Which cases involve this analyst?",
  ],
  hotel: [
    "What vulnerabilities were analyzed?",
    "Which CVEs were validated?",
    "Show vulnerability distribution",
    "Explain the investigation flow",
  ],
  foxtrot: [
    "Show attack paths identified",
    "What exposure risks exist?",
    "Which lateral movement paths?",
    "Explain the investigation flow",
  ],
  echo: [
    "What risk signals were processed?",
    "Show correlated alerts",
    "Risk trend graph",
    "Which cases involve this analyst?",
  ],
  delta: [
    "What approvals were triggered?",
    "Show compliance status",
    "Which remediations are pending?",
    "Explain the investigation flow",
  ],
  bravo: [
    "What configurations were assessed?",
    "Show drift detections",
    "Which misconfigurations found?",
    "Explain the investigation flow",
  ],
  charlie: [
    "What apps were scanned?",
    "Show code vulnerabilities detected",
    "Which dependencies were audited?",
    "Show supply chain risks",
  ],
  golf: [
    "What identities were audited?",
    "Show privilege escalation blocks",
    "Which dormant accounts flagged?",
    "Explain the investigation flow",
  ],
};