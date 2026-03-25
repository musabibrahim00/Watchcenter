/**
 * Investigation Feature — Barrel export for investigation and narrative modules.
 *
 * Provides the investigation context, timeline, task-investigation bridge,
 * and agent narrative system.
 */

/* ── Investigation context & provider ── */
export {
  InvestigationProvider,
  useInvestigation,
  INVESTIGATION_SCENARIOS,
  AGENT_NAMES,
  getTimelineSteps,
  AGENT_CONTRIBUTIONS,
  INVESTIGATION_CENTER_MESSAGES,
  PASSIVE_MESSAGES,
} from "../watch-center/InvestigationContext";
export type {
  InvestigationScenario,
  InvestigationPhase,
  TimelineStep,
} from "../watch-center/InvestigationContext";

/* ── Investigation timeline component ── */
export { default as InvestigationTimeline } from "./InvestigationTimeline";

/* ── Task-to-AiBox investigation bridge ── */
export {
  TaskInvestigationBridgeProvider,
  useTaskInvestigation,
  buildTaskRequest,
  TASK_ANALYST_MAP,
} from "./TaskInvestigationBridge";
export type { TaskInvestigationRequest } from "./TaskInvestigationBridge";

/* ── Agent narrative system ── */
export { buildInvestigationNarrative } from "../watch-center/AgentNarratives";
export type {
  NarrativeStep,
  AgentNarrative,
  InvestigationNarrative,
} from "../watch-center/AgentNarratives";
