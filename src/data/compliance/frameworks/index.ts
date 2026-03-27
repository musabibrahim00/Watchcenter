/**
 * Compliance Frameworks Registry
 *
 * Single entry point for all framework data files.
 * Consumers import getComplianceFramework() and the shared types from here —
 * never from individual framework files directly.
 *
 * ── How to add a new framework ──────────────────────────────────────────────
 *
 * 1. Create src/data/compliance/frameworks/<id>-controls.ts
 *    following the ComplianceFramework schema (id, name, version,
 *    totalControls, requiredControls, categories[]).
 *
 * 2. Import the framework constant below and add it to REGISTRY.
 *
 * 3. Add the framework to compliance-data.ts:
 *    - Add a row to FRAMEWORKS (score, trend, purpose)
 *    - Add an entry to FRAMEWORK_CONTROLS keyed by the same id
 *    - Optionally add an operational overlay (like SOC2_OPERATIONAL)
 *      if you want per-control status, evidence links, and remediation
 *      steps rather than a flat static array.
 *
 * ── Current registry ────────────────────────────────────────────────────────
 *
 *  soc2      ✓  59 controls  (full dataset)
 *  iso27001  ~  93 controls  (placeholder — A.5/A.6/A.7/A.8 seeded)
 *  nist-csf  —  pending migration from compliance-data.ts flat array
 *  pci-dss   —  pending migration from compliance-data.ts flat array
 *  hipaa     —  pending migration from compliance-data.ts flat array
 */

import type { ComplianceFramework } from "./soc2-controls";
import { SOC2_FRAMEWORK }     from "./soc2-controls";
import { ISO27001_FRAMEWORK } from "./iso27001-controls";

/* ── Re-export types ─────────────────────────────────────────────── */

export type { ComplianceControl, ComplianceCategory, ComplianceFramework } from "./soc2-controls";

/* ── Re-export framework constants ──────────────────────────────── */

export { SOC2_FRAMEWORK }     from "./soc2-controls";
export { ISO27001_FRAMEWORK } from "./iso27001-controls";

/* ── Registry ────────────────────────────────────────────────────── */

const REGISTRY: Record<string, ComplianceFramework> = {
  "soc2":     SOC2_FRAMEWORK,
  "iso27001": ISO27001_FRAMEWORK,
};

/**
 * Look up a ComplianceFramework by its string ID.
 *
 * Returns the full framework object (categories, controls, evidence)
 * for frameworks that have been migrated to this registry.
 * Returns null for frameworks still using the legacy flat-array format
 * in compliance-data.ts (nist-csf, pci-dss, hipaa).
 *
 * @example
 *   const fw = getComplianceFramework("soc2");
 *   const catId = fw?.categories.find(c => c.name === "Control Environment")?.id; // "CC1"
 */
export function getComplianceFramework(id: string): ComplianceFramework | null {
  return REGISTRY[id] ?? null;
}
