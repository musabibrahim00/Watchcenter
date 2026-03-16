/**
 * Agent Detail Feature — Barrel export for the Agent Detail page and components.
 *
 * Provides the agent detail page, agent task data, and intervention data.
 */

/* ── Agent detail page ── */
export { default as AgentDetailPage } from "../../pages/AgentDetailPage";

/* ── Agent task metadata ── */
export { AGENT_TASKS } from "../../../imports/agent-tasks-data";
export type { AgentTaskData } from "../../../imports/agent-tasks-data";

/* ── Intervention / module data ── */
export {
  MODULE_DATA,
  MODULE_KEYS,
  HIDDEN_MODULES_BY_AGENT,
  getVisibleModules,
} from "../../../imports/intervention-data-types";
export type {
  InterventionData,
  CompletedAction,
  ModuleConfig,
} from "../../../imports/intervention-data-types";