/**
 * Evidence Store
 * Lightweight mutable layer over the static EVIDENCE_ITEMS seed data.
 *
 * Overrides (status, owner, note) are stored in localStorage.
 * A custom DOM event is dispatched on every write so any mounted
 * component that calls useEvidenceStore() re-renders immediately —
 * the same pattern used for the experience switcher.
 */

import { useState, useEffect } from "react";
import { EVIDENCE_ITEMS, type EvidenceStatus } from "../../pages/compliance-data";

export const EVIDENCE_STORE_KEY    = "wc:evidence-overrides";
export const EVIDENCE_UPDATED_EVENT = "wc:evidence-updated";

/* ── Types ──────────────────────────────────────────────────────── */

export type EvidenceOverride = {
  status?:    EvidenceStatus;
  collector?: string;
  note?:      string;
  updatedAt?: string; // ISO string, set automatically
};

export type MergedEvidenceItem = typeof EVIDENCE_ITEMS[number] & {
  note:      string;
  updatedAt: string;
};

/* ── localStorage helpers ─────────────────────────────────────── */

function readStore(): Record<string, EvidenceOverride> {
  try {
    return JSON.parse(localStorage.getItem(EVIDENCE_STORE_KEY) ?? "{}");
  } catch {
    return {};
  }
}

function writeStore(store: Record<string, EvidenceOverride>) {
  localStorage.setItem(EVIDENCE_STORE_KEY, JSON.stringify(store));
  window.dispatchEvent(new CustomEvent(EVIDENCE_UPDATED_EVENT));
}

/** Merge base data with any stored overrides. */
function merge(): MergedEvidenceItem[] {
  const store = readStore();
  return EVIDENCE_ITEMS.map(item => {
    const override = store[item.id] ?? {};
    return {
      ...item,
      status:      override.status    ?? item.status,
      collector:   override.collector ?? item.collector,
      note:        override.note      ?? "",
      updatedAt:   override.updatedAt ?? item.lastUpdated,
    };
  });
}

/* ── Public updater (usable outside React) ────────────────────── */

export function updateEvidenceItem(id: string, patch: EvidenceOverride) {
  const store   = readStore();
  store[id]     = { ...store[id], ...patch, updatedAt: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" }) };
  writeStore(store);
}

/* ── Hook ────────────────────────────────────────────────────── */

export function useEvidenceStore() {
  const [items, setItems] = useState<MergedEvidenceItem[]>(merge);

  useEffect(() => {
    const handler = () => setItems(merge());
    window.addEventListener(EVIDENCE_UPDATED_EVENT, handler);
    return () => window.removeEventListener(EVIDENCE_UPDATED_EVENT, handler);
  }, []);

  function update(id: string, patch: EvidenceOverride) {
    updateEvidenceItem(id, patch);
    // setItems is triggered by the custom event, but set immediately too
    // for zero-jitter UI response
    setItems(merge());
  }

  return { items, update };
}
