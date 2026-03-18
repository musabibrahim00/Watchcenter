import { useEffect, useRef } from "react";
import { useSearchParams, useNavigate, useLocation } from "react-router";
import { useAiBox } from "./AiBoxContext";
import { resolveDeepLinkContext, derivePageRoute } from "./deepLinkResolver";
import { logDeepLinkEntry } from "../../shared/utils/audit-log";
import type { AlertActionSource } from "../../shared/utils/audit-log";

/**
 * useAiBoxDeepLink
 * ─────────────────
 * Reads deep-link params from the URL on initial render, navigates to the
 * correct page if needed, opens AIBox with the resolved context, then cleans
 * the params from the address bar.
 *
 * Supported URL params:
 *   ctx  — entity reference:  "agent:alpha" | "asset:<id>" | "attack-path:<id>" |
 *                              "workflow:<id>" | "case:<id>" | "compliance:<id>" | "general"
 *   q    — pre-filled query string (URL-encoded)
 *   src  — entry source: "slack" | "email" | "notification" | "direct"
 *
 * Examples:
 *   /?ctx=attack-path:ap-001&q=Explain+this+path&src=slack
 *   /agent/alpha?ctx=agent:alpha&q=Summarize+findings&src=email
 *   /attack-paths?ctx=general&q=What+needs+immediate+action
 *   /workflows?ctx=workflow:wf-alert-triage&src=notification
 *
 * Behaviour:
 *   - Runs once on mount; the processedRef prevents double-fire in StrictMode.
 *   - Navigates to the derived page route if the current path doesn't match.
 *   - Uses a short rAF delay so the page renders before AIBox slides in.
 *   - If the page will call openWithContext() itself (e.g. AgentDetailPage),
 *     the query is preserved in pendingEntryQuery so it survives the overwrite.
 *   - Removes ctx, q, and src from the URL (replace: true) after opening.
 *   - Logs the entry event to the audit trail for traceability.
 */
export function useAiBoxDeepLink(): void {
  const [searchParams, setSearchParams] = useSearchParams();
  const { openWithContext, setPendingEntryQuery } = useAiBox();
  const navigate   = useNavigate();
  const location   = useLocation();

  // Refs so the effect closure doesn't capture stale values
  const openRef               = useRef(openWithContext);
  const setPendingRef         = useRef(setPendingEntryQuery);
  const setRef                = useRef(setSearchParams);
  const navigateRef           = useRef(navigate);
  const processedRef          = useRef(false);

  openRef.current       = openWithContext;
  setPendingRef.current = setPendingEntryQuery;
  setRef.current        = setSearchParams;
  navigateRef.current   = navigate;

  useEffect(() => {
    if (processedRef.current) return;

    const ctx    = searchParams.get("ctx");
    const query  = searchParams.get("q") ?? undefined;
    const srcRaw = searchParams.get("src");
    const src: AlertActionSource =
      srcRaw === "slack" || srcRaw === "email" || srcRaw === "notification"
        ? srcRaw
        : "direct";

    if (!ctx) return;

    const context = resolveDeepLinkContext(ctx, query);
    if (!context) return;

    processedRef.current = true;

    // Derive the target page route for this context type
    const colonIdx   = ctx.indexOf(":");
    const ctxType    = colonIdx === -1 ? ctx : ctx.slice(0, colonIdx);
    const ctxId      = colonIdx === -1 ? ""  : ctx.slice(colonIdx + 1);
    const targetPath = derivePageRoute(ctxType, ctxId);

    // Log the deep-link entry for traceability
    logDeepLinkEntry({
      source:          src,
      destinationPage: targetPath,
      contextType:     ctxType,
      hadPrefillQuery: !!query,
    });

    // Preserve the query so page-level context overwrites don't lose it
    if (query) {
      setPendingRef.current(query);
    }

    // Navigate to the target page if we're not already there
    const needsNav = targetPath !== "/" && !location.pathname.startsWith(targetPath);

    const raf = requestAnimationFrame(() => {
      if (needsNav) {
        // Navigate with the ctx/q still on the URL; the new page's Layout
        // will call useAiBoxDeepLink again — but processedRef is per-mount,
        // so navigate with the params stripped and context already primed.
        navigateRef.current(targetPath, { replace: true });
      }

      openRef.current(context);

      setRef.current(
        (prev) => {
          const next = new URLSearchParams(prev);
          next.delete("ctx");
          next.delete("q");
          next.delete("src");
          return next;
        },
        { replace: true }
      );
    });

    return () => cancelAnimationFrame(raf);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
}
