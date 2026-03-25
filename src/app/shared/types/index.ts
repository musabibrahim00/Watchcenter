/**
 * Shared Types — Barrel export for all shared type definitions.
 */

/* ── Agent types ── */
export type { AgentId } from "./agent-types";
export { AGENT_ROLE_LABELS, AGENT_SUGGESTIONS } from "./agent-types";

/* ── AiBox module types (re-exported from source) ── */
export type {
  Severity,
  StatusTone,
  InsightCardProps,
  DecisionCardProps,
  TimelineStep,
  InvestigationTimelineProps,
  MetricsSummaryProps,
  TrendChartDatum,
  TrendChartProps,
  AttackPathGraphProps,
  AnalystDetailPanelProps,
  CaseSummaryCardProps,
  SuccessConfirmationProps,
  FallbackSuggestionProps,
} from "../../../imports/AiBoxModules";

/* ── AiBox response types ── */
export type {
  SourceModule,
  AiIntent,
  AiRenderableResponse,
  InteractionContext,
  AiQueryContext,
} from "../../../imports/AiBoxRenderer";

/* ── Chat message types ── */
export type { ChatMessage, TaskNode, TaskGraph } from "../../../imports/AiBoxShared";

/* ── Investigation types ── */
export type { InvestigationScenario } from "../../features/watch-center/InvestigationContext";
export type { TaskInvestigationRequest } from "../../../imports/TaskInvestigationBridge";

/* ── Data types ── */
export type {
  InterventionData,
  CompletedAction,
  ModuleConfig,
} from "../data/intervention-data-types";
