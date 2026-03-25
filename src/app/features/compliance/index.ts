/**
 * Compliance Feature
 *
 * Provides the mutable evidence layer over the static compliance data.
 * Used by:
 *   - CompliancePage          (overview evidence tracker)
 *   - ComplianceFrameworkPage (framework detail sidebar)
 *   - ControlDetailPanel      (control → evidence feedback loop)
 */

export { useEvidenceStore, updateEvidenceItem } from "./evidence-store";
export type { EvidenceOverride, MergedEvidenceItem } from "./evidence-store";
export { ActionableEvidenceRow } from "./ActionableEvidenceRow";
