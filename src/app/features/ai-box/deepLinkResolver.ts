import type { AiBoxPageContext } from "./AiBoxContext";
import { AGENT_ROLE_LABELS } from "../../shared/types/agent-types";

/* ================================================================
   DEEP LINK RESOLVER
   Maps ?ctx=<type>:<id>&q=<query> URL params to AiBoxPageContext.

   Supported entity types:
     agent:<agentId>         → agent context
     asset:<assetId>         → asset context
     attack-path:<pathId>    → attack-path context
     workflow:<workflowId>   → workflow context
     case:<caseId>           → case context
     compliance:<id>         → compliance context
     general                 → open-ended general context

   Examples:
     ?ctx=agent:alpha&q=Summarize+findings
     ?ctx=attack-path:ap-001
     ?ctx=asset:finance-db-01&q=What+vulnerabilities
     ?ctx=general&q=What+needs+immediate+action
     ?ctx=compliance:soc2
   ================================================================ */

/** Capitalise a hyphen/underscore-separated ID into a readable label */
function humanise(id: string): string {
  if (!id) return "";
  return id
    .split(/[-_]/)
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(" ");
}

/* ── Per-entity context builders ──────────────────────────────── */

function agentContext(id: string, query?: string): AiBoxPageContext {
  const label = (AGENT_ROLE_LABELS as Record<string, string>)[id] ?? humanise(id);
  return {
    type: "agent",
    label,
    sublabel: "Analyst Context",
    contextKey: `agent:${id}`,
    greeting: `I have **${label}** context loaded. I can summarise findings, explain risk signals, or help you investigate this analyst's activity.`,
    initialQuery: query,
    suggestions: [
      { label: "Summarise findings",   prompt: `Summarise the latest findings for the ${label}` },
      { label: "Explain risk signals", prompt: `Explain the current risk signals from the ${label}` },
      { label: "Recent activity",      prompt: `What has the ${label} flagged in the last 24 hours?` },
      { label: "Recommend actions",    prompt: `What actions should I take based on the ${label}'s findings?` },
    ],
  };
}

function assetContext(id: string, query?: string): AiBoxPageContext {
  const label = id ? humanise(id) : "Asset";
  return {
    type: "asset",
    label,
    sublabel: "Asset Context",
    contextKey: `asset:${id}`,
    greeting: `I have **${label}** asset context loaded. I can explain vulnerabilities, misconfigurations, or exposure paths for this asset.`,
    initialQuery: query,
    suggestions: [
      { label: "Show vulnerabilities",    prompt: `What vulnerabilities affect ${label}?` },
      { label: "Explain exposure",        prompt: `How is ${label} exposed to external threats?` },
      { label: "List misconfigurations",  prompt: `What misconfigurations are present on ${label}?` },
      { label: "Recommend remediations",  prompt: `What should I do to secure ${label}?` },
    ],
  };
}

function attackPathContext(id: string, query?: string): AiBoxPageContext {
  const label = id ? `Attack Path ${id.toUpperCase()}` : "Attack Path";
  return {
    type: "general",
    label,
    sublabel: "Attack Path Context",
    contextKey: `attack-path:${id}`,
    greeting: `I have **${label}** context loaded. I can explain this attack path, identify impacted assets, or recommend mitigations.`,
    initialQuery: query,
    suggestions: [
      { label: "Explain this path",      prompt: `Explain the attack path ${id}` },
      { label: "Show impacted assets",   prompt: `What assets are impacted by attack path ${id}?` },
      { label: "Recommend mitigations",  prompt: `What mitigations are recommended for attack path ${id}?` },
      { label: "Create case",            prompt: `Create an investigation case for attack path ${id}` },
    ],
  };
}

function workflowContext(id: string, query?: string): AiBoxPageContext {
  const label = id ? humanise(id) : "Workflow";
  return {
    type: "workflow",
    label,
    sublabel: "Workflow Context",
    contextKey: `workflow:${id}`,
    greeting: `I have **${label}** workflow context loaded. I can explain runs, debug failures, or suggest improvements.`,
    initialQuery: query,
    suggestions: [
      { label: "Summarise recent runs",  prompt: `Summarise recent runs for workflow ${label}` },
      { label: "Debug failures",         prompt: `Why did the last run of ${label} fail?` },
      { label: "Suggest improvements",   prompt: `How can I improve workflow ${label}?` },
      { label: "Show configuration",     prompt: `Explain the configuration of workflow ${label}` },
    ],
  };
}

function caseContext(id: string, query?: string): AiBoxPageContext {
  const label = id ? `Case ${id.toUpperCase()}` : "Case";
  return {
    type: "case",
    label,
    sublabel: "Case Context",
    contextKey: `case:${id}`,
    greeting: `I have **${label}** loaded. I can summarise the investigation, show findings, or suggest next actions.`,
    initialQuery: query,
    suggestions: [
      { label: "Summarise case",   prompt: `Summarise case ${id}` },
      { label: "Show findings",    prompt: `What findings are linked to case ${id}?` },
      { label: "Next actions",     prompt: `What are the recommended next actions for case ${id}?` },
      { label: "Escalation path",  prompt: `What is the escalation path for case ${id}?` },
    ],
  };
}

function generalContext(query?: string): AiBoxPageContext {
  return {
    type: "general",
    label: "Security Overview",
    sublabel: "General Context",
    contextKey: "general",
    greeting:
      "I'm ready to help. Ask me anything about your security posture, attack paths, analysts, or workflows.",
    initialQuery: query,
    suggestions: [
      { label: "Current risk summary",  prompt: "Summarise the current risk posture" },
      { label: "Active threats",        prompt: "What active threats require immediate attention?" },
      { label: "Top recommendations",   prompt: "What are the top security recommendations right now?" },
      { label: "Recent activity",       prompt: "What has changed in the last 24 hours?" },
    ],
  };
}

function complianceContext(id: string, query?: string): AiBoxPageContext {
  const label = id ? humanise(id) : "Compliance";
  return {
    type: "general",
    label,
    sublabel: "Compliance Context",
    contextKey: `compliance:${id}`,
    greeting: `I have **${label}** compliance context loaded. I can explain control status, highlight gaps, or help you plan remediation.`,
    initialQuery: query,
    suggestions: [
      { label: "Control status",         prompt: `What is the current control status for ${label}?` },
      { label: "Compliance gaps",        prompt: `What compliance gaps exist for ${label}?` },
      { label: "Remediation steps",      prompt: `What remediation steps are needed to meet ${label} requirements?` },
      { label: "Recent policy changes",  prompt: `What policy changes affect ${label} compliance?` },
    ],
  };
}

/** Returned when the ctx param is recognised but the entity could not be resolved. */
function fallbackContext(type: string, id: string, query?: string): AiBoxPageContext {
  const label = id ? `${humanise(type)}: ${humanise(id)}` : humanise(type);
  return {
    type: "general",
    label,
    sublabel: "Context unavailable",
    contextKey: `${type}:${id}`,
    greeting:
      "I couldn't load the exact item from this alert, but I've opened the closest available context. I can still help you investigate or answer questions.",
    initialQuery: query,
    suggestions: [
      { label: "What needs attention?",   prompt: "What needs immediate attention right now?" },
      { label: "Summarise recent events", prompt: "Summarise security events from the last 24 hours" },
      { label: "Current risk posture",    prompt: "What is the current overall risk posture?" },
      { label: "Top recommendations",     prompt: "What are the top security recommendations right now?" },
    ],
  };
}

/* ── Public resolver ──────────────────────────────────────────── */

/**
 * Derive the frontend route path for a given context type and entity id.
 * Used by useAiBoxDeepLink to navigate before loading context.
 */
export function derivePageRoute(type: string, id: string): string {
  switch (type) {
    case "agent":        return `/agent/${id}`;
    case "asset":        return `/asset/${id}`;
    case "attack-path":  return `/attack-paths/${id}`;
    case "workflow":     return `/workflows/new/${id}`;
    case "case":         return `/case-management/${id}`;
    case "compliance":   return `/compliance`;
    case "general":
    default:             return `/`;
  }
}

/**
 * Convert a raw `ctx` param value (e.g. "agent:alpha", "attack-path:ap-001")
 * and an optional pre-filled `query` into a typed AiBoxPageContext.
 * Returns null if the type is unrecognised.
 */
export function resolveDeepLinkContext(
  ctx: string,
  query?: string
): AiBoxPageContext | null {
  if (!ctx) return null;

  const colonIdx = ctx.indexOf(":");
  const type = colonIdx === -1 ? ctx : ctx.slice(0, colonIdx);
  const id   = colonIdx === -1 ? ""  : ctx.slice(colonIdx + 1);

  switch (type) {
    case "agent":       return agentContext(id, query);
    case "asset":       return assetContext(id, query);
    case "attack-path": return attackPathContext(id, query);
    case "workflow":    return workflowContext(id, query);
    case "case":        return caseContext(id, query);
    case "compliance":  return complianceContext(id, query);
    case "general":     return generalContext(query);
    default:            return fallbackContext(type, id, query);
  }
}
