/**
 * Shared Components — Barrel export for all reusable components.
 */

/* ── UI Primitives ── */
export * from "./ui";

/* ── Layout Components ── */
export * from "./layout";

/* ── Chart Utilities ── */
export { DeferredChart } from "./DeferredChart";

/* ── Cross-entity Navigation ── */
export { EntityLink, getEntityColor, getEntityIcon, getEntityLabel, getEntityActions } from "./EntityLink";
export type { EntityType, EntityAction, EntityLinkProps } from "./EntityLink";