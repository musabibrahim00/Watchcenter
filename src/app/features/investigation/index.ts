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
} from "../../../imports/InvestigationContext";
export type {
  InvestigationScenario,
  InvestigationPhase,
  TimelineStep,
} from "../../../imports/InvestigationContext";

/* ── Investigation timeline component ── */
export { default as InvestigationTimeline } from "../../../imports/InvestigationTimeline";

/* ── Task-to-AiBox investigation bridge ── */
export {
  TaskInvestigationBridgeProvider,
  useTaskInvestigation,
  buildTaskRequest,
  TASK_ANALYST_MAP,
} from "../../../imports/TaskInvestigationBridge";
export type { TaskInvestigationRequest } from "../../../imports/TaskInvestigationBridge";

/* ── Agent narrative system ── */
export { buildInvestigationNarrative } from "../../../imports/AgentNarratives";
export type {
  NarrativeStep,
  AgentNarrative,
  InvestigationNarrative,
} from "../../../imports/AgentNarratives";
