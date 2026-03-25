/**
 * Agent Detail Feature — Barrel export for the Agent Detail page and components.
 *
 * Provides the agent detail page, agent task data, and intervention data.
 */

/* ── Agent detail page ── */
export { default as AgentDetailPage } from "../../pages/AgentDetailPage";

/* ── Agent task metadata ── */
export { AGENT_TASKS } from "../../shared/data/agent-tasks-data";
export type { AgentTaskData } from "../../shared/data/agent-tasks-data";

/* ── Intervention / module data ── */
export {
  MODULE_DATA,
  MODULE_KEYS,
  HIDDEN_MODULES_BY_AGENT,
  getVisibleModules,
} from "../../shared/data/intervention-data-types";
export type {
  InterventionData,
  CompletedAction,
  ModuleConfig,
} from "../../shared/data/intervention-data-types";