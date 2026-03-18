/**
 * HighlightBus — lightweight event bus for AIBox → page UI element highlights.
 *
 * When AIBox references a specific item (signal, workflow, asset, attack path),
 * it emits a highlight event so the page can subtly emphasize that element
 * without polling or shared React state across module boundaries.
 *
 * Design decisions:
 *   - Uses native CustomEvents on window — no React coupling, no Redux
 *   - Pages add data-highlight-id attributes and subscribe on mount
 *   - Highlights auto-clear after a configurable duration (default 4s)
 *   - Page-scoped: events only apply to elements matching the `page` field,
 *     preventing cross-page false positives during navigation
 *   - Visual treatment is CSS only (ring + bg tint) — no layout changes
 *
 * Usage:
 *   // AIBox — emit when referencing an item
 *   emitHighlight({ page: "watch-center", itemId: "signal-attack-path" });
 *
 *   // Page — subscribe and apply CSS
 *   useEffect(() => onHighlight(({ page, itemId }) => {
 *     if (page !== "watch-center") return;
 *     setHighlightedId(itemId);
 *   }), []);
 */

export const HIGHLIGHT_EVENT       = "secops:highlight";
export const CLEAR_HIGHLIGHT_EVENT = "secops:clear-highlight";

export interface HighlightPayload {
  /** Page scope — prevents cross-page false positives */
  page: string;
  /** Matches data-highlight-id attributes on page elements */
  itemId: string;
  /** Auto-clear after this many ms (default 4000) */
  duration?: number;
}

/**
 * Emit a highlight signal from AIBox.
 * Auto-clears after `duration` ms (default 4 seconds).
 */
export function emitHighlight(payload: HighlightPayload): void {
  window.dispatchEvent(
    new CustomEvent<HighlightPayload>(HIGHLIGHT_EVENT, { detail: payload })
  );
  setTimeout(() => {
    window.dispatchEvent(
      new CustomEvent<HighlightPayload>(CLEAR_HIGHLIGHT_EVENT, {
        detail: { page: payload.page, itemId: payload.itemId },
      })
    );
  }, payload.duration ?? 4000);
}

/**
 * Emit highlights for multiple items sequentially (staggered by 300ms).
 * Used when an AIBox response references several page elements.
 */
export function emitHighlights(payloads: HighlightPayload[]): void {
  payloads.forEach((p, i) => {
    setTimeout(() => emitHighlight(p), i * 300);
  });
}

/**
 * Subscribe to highlight events.
 * Returns an unsubscribe function — call it in useEffect cleanup.
 */
export function onHighlight(
  handler: (payload: HighlightPayload) => void
): () => void {
  const listener = (e: Event) =>
    handler((e as CustomEvent<HighlightPayload>).detail);
  window.addEventListener(HIGHLIGHT_EVENT, listener);
  return () => window.removeEventListener(HIGHLIGHT_EVENT, listener);
}

/**
 * Subscribe to clear-highlight events.
 * Returns an unsubscribe function.
 */
export function onClearHighlight(
  handler: (payload: HighlightPayload) => void
): () => void {
  const listener = (e: Event) =>
    handler((e as CustomEvent<HighlightPayload>).detail);
  window.addEventListener(CLEAR_HIGHLIGHT_EVENT, listener);
  return () => window.removeEventListener(CLEAR_HIGHLIGHT_EVENT, listener);
}
