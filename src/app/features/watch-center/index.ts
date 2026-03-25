/**
 * Watch Center Feature — Barrel export for the main Watch Center dashboard.
 *
 * Provides the dashboard layout, radial globe, activity feed, KPI widget,
 * task carousel, and status context.
 */

/* ── Main Watch Center dashboard ── */
export { default as WatchDst } from "../../../imports/WatchDst";

/* ── Radial globe visualization ── */
export { default as Working } from "../../../imports/Working";
export type { AgentId, WorkingProps } from "../../../imports/Working";

/* ── Investigation Context ── */
export { InvestigationProvider, useInvestigation, INVESTIGATION_SCENARIOS, AGENT_NAMES, getTimelineSteps } from "./InvestigationContext";
export type { InvestigationScenario } from "./InvestigationContext";

/* ── Agent Narratives ── */
export {
  buildInvestigationNarrative,
  buildAgentNarrative,
  buildNarrativeTimeline,
  buildNarrativeSynthesis,
  buildNarrativeAnalystDetail,
  buildNarrativeDecision,
  buildNarrativeInsight,
  getAllInvestigationNarratives,
} from "./AgentNarratives";
export type { NarrativeStep, AgentNarrative, InvestigationNarrative } from "./AgentNarratives";

/* ── Status context ── */
export { StatusProvider, useStatus, STATUS_ENTRIES } from "./StatusContext";
export type { StatusEntry } from "./StatusContext";

/* ── Activity feed ── */
export { default as ActivityFeed } from "./ActivityFeed";

/* ── KPI widget ── */
export { default as KpiWidget } from "./KpiWidget";

/* ── Task carousel ── */
export { default as Tasks } from "../../../imports/Tasks";
export type { TaskData } from "../../../imports/Tasks";