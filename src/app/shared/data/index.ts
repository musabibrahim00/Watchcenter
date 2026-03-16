/**
 * Shared Data — Barrel export for platform data constants.
 *
 * Centralized location for all application data (agent tasks, interventions,
 * investigation scenarios, status entries).
 */

/* ── Agent task data ── */
export { AGENT_TASKS as AGENT_TASK_GROUPS } from "./agentTasks";
export type { AgentTask, AgentTaskGroup } from "./agentTasks";

export { AGENT_TASKS as AGENT_DETAIL_DATA } from "./agent-tasks-data";
export type { AgentTaskData } from "./agent-tasks-data";

/* ── Intervention / module data ── */
export {
  MODULE_DATA,
  MODULE_KEYS,
  HIDDEN_MODULES_BY_AGENT,
  getVisibleModules,
} from "./intervention-data-types";
export type {
  InterventionData,
  CompletedAction,
  ModuleConfig,
} from "./intervention-data-types";
