import type { AlertActionSource } from "../../shared/utils/audit-log";

export type { AlertActionSource };

/**
 * Build a deep-link URL that opens AIBox pre-loaded with the given context.
 *
 * @param base   - Absolute or relative origin (e.g. "https://app.example.com" or "")
 * @param ctx    - Context identifier, e.g. "agent:alpha", "asset:finance-db-01", "general"
 * @param query  - Optional pre-filled query to inject into AIBox
 * @param src    - Entry surface: "slack" | "email" | "notification" | "direct"
 *
 * @example
 * buildDeepLink("https://app.example.com", "agent:alpha", "Summarise findings", "slack")
 * // → "https://app.example.com/?ctx=agent%3Aalpha&q=Summarise+findings&src=slack"
 *
 * buildDeepLink("", "attack-path:ap-001", undefined, "email")
 * // → "/?ctx=attack-path%3Aap-001&src=email"
 */
export function buildDeepLink(
  base: string,
  ctx: string,
  query?: string,
  src: AlertActionSource = "direct"
): string {
  const params = new URLSearchParams();
  params.set("ctx", ctx);
  if (query) params.set("q", query);
  if (src !== "direct") params.set("src", src);
  return `${base}/?${params.toString()}`;
}
