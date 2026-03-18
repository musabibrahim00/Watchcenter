/**
 * deep-link.mjs — Generate UI deep-links for hybrid CLI ↔ UI workflows
 *
 * Produces URLs that open the UI with AIBox pre-loaded for the current context.
 * Base URL is configurable via SECOPS_UI_BASE_URL env var (defaults to
 * http://localhost:5173 for local dev).
 */

const BASE_URL = (process.env.SECOPS_UI_BASE_URL ?? "http://localhost:5173").replace(/\/$/, "");

/**
 * Build a UI deep-link URL.
 *
 * @param {string} ctxParam  - ctx URL param value, e.g. "agent:alpha" or "asset:finance-db-01"
 * @param {string} [query]   - Pre-filled query to inject into AIBox
 * @param {string} [src]     - Entry source: "slack" | "email" | "notification" | "direct"
 * @returns {string}         - Full URL
 */
export function buildDeepLink(ctxParam, query, src = "direct") {
  const params = new URLSearchParams();
  params.set("ctx", ctxParam);
  if (query) params.set("q", query);
  if (src !== "direct") params.set("src", src);
  return `${BASE_URL}/?${params.toString()}`;
}

/**
 * Derive the ctx param from a resolved context object.
 */
export function ctxParamFromContext(ctx) {
  switch (ctx.type) {
    case "agent":        return `agent:${ctx.agentId}`;
    case "asset":        return `asset:${ctx.id}`;
    case "attack-path":  return `attack-path:${ctx.id}`;
    case "workflow":     return `workflow:${ctx.id}`;
    case "compliance":   return `compliance:${ctx.id}`;
    case "general":
    default:             return "general";
  }
}

/**
 * Build a deep-link for a resolved context with optional pre-filled query.
 */
export function deepLinkForContext(ctx, query) {
  const ctxParam = ctxParamFromContext(ctx);
  return buildDeepLink(ctxParam, query);
}

/**
 * Human-readable description of where the link will open.
 */
export function describeDeepLink(ctx, query) {
  const dest = {
    agent:        `Agent Detail — ${ctx.label}`,
    asset:        `Asset — ${ctx.label}`,
    "attack-path": `Attack Path — ${ctx.label}`,
    workflow:     `Workflow — ${ctx.label}`,
    compliance:   `Compliance — ${ctx.label}`,
    general:      "Watch Center",
  };

  const desc = dest[ctx.type] ?? "Watch Center";
  return query ? `${desc}  ·  AIBox pre-loaded with your query` : desc;
}
