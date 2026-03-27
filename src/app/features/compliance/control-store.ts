/**
 * Control Status Store
 * Mutable layer for per-control status overrides.
 *
 * Stored in localStorage; dispatches a DOM event on writes so any
 * mounted useControlStatusStore() consumer re-renders immediately —
 * the same pattern used by evidence-store.ts.
 */

import { useState, useEffect } from "react";
import type { ControlStatus } from "../../pages/compliance-data";

export const CTRL_STATUS_KEY     = "wc:compliance:ctrl-status";
export const CTRL_STATUS_EVENT   = "wc:ctrl-status-updated";

/* ── localStorage helpers ─────────────────────────────────────── */

function readStore(): Record<string, ControlStatus> {
  try { return JSON.parse(localStorage.getItem(CTRL_STATUS_KEY) ?? "{}"); }
  catch { return {}; }
}

function writeStore(map: Record<string, ControlStatus>) {
  localStorage.setItem(CTRL_STATUS_KEY, JSON.stringify(map));
  window.dispatchEvent(new CustomEvent(CTRL_STATUS_EVENT));
}

/* ── Public updater (usable outside React) ────────────────────── */

export function setControlStatus(id: string, status: ControlStatus) {
  const map = readStore();
  map[id] = status;
  writeStore(map);
}

/* ── Hook ─────────────────────────────────────────────────────── */

export function useControlStatusStore() {
  const [allStatuses, setAllStatuses] = useState<Record<string, ControlStatus>>(readStore);

  useEffect(() => {
    const handler = () => setAllStatuses(readStore());
    window.addEventListener(CTRL_STATUS_EVENT, handler);
    return () => window.removeEventListener(CTRL_STATUS_EVENT, handler);
  }, []);

  function setStatus(id: string, status: ControlStatus) {
    setControlStatus(id, status);
    setAllStatuses(readStore());
  }

  return { allStatuses, setStatus };
}
