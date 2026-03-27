/**
 * Gap Status Store
 * Mutable layer for per-gap status overrides (open → in_progress → resolved).
 *
 * Stored in localStorage; dispatches a DOM event on writes so any
 * mounted useGapStatusStore() consumer re-renders immediately —
 * the same pattern used by control-store.ts and evidence-store.ts.
 */

import { useState, useEffect } from "react";
import type { GapStatus } from "../../pages/compliance-data";

export const GAP_STATUS_KEY   = "wc:compliance:gap-status";
export const GAP_STATUS_EVENT = "wc:gap-status-updated";

/* ── localStorage helpers ─────────────────────────────────────── */

function readStore(): Record<string, GapStatus> {
  try { return JSON.parse(localStorage.getItem(GAP_STATUS_KEY) ?? "{}"); }
  catch { return {}; }
}

function writeStore(map: Record<string, GapStatus>) {
  localStorage.setItem(GAP_STATUS_KEY, JSON.stringify(map));
  window.dispatchEvent(new CustomEvent(GAP_STATUS_EVENT));
}

/* ── Public updater (usable outside React) ────────────────────── */

export function setGapStatus(id: string, status: GapStatus) {
  const map = readStore();
  map[id] = status;
  writeStore(map);
}

/* ── Hook ─────────────────────────────────────────────────────── */

export function useGapStatusStore() {
  const [allStatuses, setAllStatuses] = useState<Record<string, GapStatus>>(readStore);

  useEffect(() => {
    const handler = () => setAllStatuses(readStore());
    window.addEventListener(GAP_STATUS_EVENT, handler);
    return () => window.removeEventListener(GAP_STATUS_EVENT, handler);
  }, []);

  function setStatus(id: string, status: GapStatus) {
    setGapStatus(id, status);
    setAllStatuses(readStore());
  }

  return { allStatuses, setStatus };
}
