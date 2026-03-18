import type { AiBoxPageContext } from "./AiBoxContext";
import { AGENT_ROLE_LABELS } from "../../shared/types/agent-types";
import type { AgentId } from "../../shared/types/agent-types";
import { getAiBoxSuggestions } from "../../shared/skills";

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
    suggestions: getAiBoxSuggestions("agent", label, id as AgentId, id),
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
    suggestions: getAiBoxSuggestions("asset", label, undefined, id),
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
    suggestions: getAiBoxSuggestions("attack-path", label, undefined, id),
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
    suggestions: getAiBoxSuggestions("workflow", label, undefined, id),
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
    suggestions: getAiBoxSuggestions("case", label, undefined, id),
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
    suggestions: getAiBoxSuggestions("watch-center", "Watch Center"),
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
    suggestions: getAiBoxSuggestions("compliance", label, undefined, id),
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
    suggestions: getAiBoxSuggestions("watch-center", "Watch Center"),
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
