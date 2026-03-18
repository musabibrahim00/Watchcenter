/**
 * AI Box Feature — Barrel export for the ALEX AI assistant module.
 *
 * Provides the main AiBox component, renderer engine, shared chat components,
 * module widgets, live data bridge, context providers, and type definitions.
 */

/* ── Main AiBox component ── */
export { default as AiBox } from "../../../imports/AiBox";

/* ── AiBox renderer engine ── */
export {
  buildAndRenderAiResponse,
  buildActionResponse,
  buildTaskInvestigation,
  extractContext,
  renderAiResponse,
  EMPTY_CONTEXT,
} from "../../../imports/AiBoxRenderer";
export type {
  SourceModule,
  AiIntent,
  AiRenderableResponse,
  InteractionContext,
  AiQueryContext,
} from "../../../imports/AiBoxRenderer";

/* ── Shared chat sub-components ── */
export {
  MessageBubble,
  TypingIndicator,
  ChatInput,
  WelcomeScreen,
  formatText,
  isCasual,
  CASUAL_RESPS,
  getResponseContextLabel,
  getSuccessState,
  imgAvatar,
} from "../../../imports/AiBoxShared";
export type { ChatMessage, TaskNode, TaskGraph } from "../../../imports/AiBoxShared";

/* ── Module widget components ── */
export {
  AiBoxActionProvider,
  InsightCard,
  DecisionCard,
  InvestigationTimeline,
  MetricsSummary,
  TrendChart,
  AttackPathGraph,
  AnalystDetailPanel,
  CaseSummaryCard,
  LoadingSkeleton,
  SuccessConfirmation,
  FallbackSuggestion,
  ResponseContext,
} from "../../../imports/AiBoxModules";

/* ── Live data bridge ── */
export {
  getRankedProactiveScenarios,
} from "../../../imports/AiBoxLiveData";
export type { ProactiveScenario } from "../../../imports/AiBoxLiveData";

/* ── AiBox open/close context ── */
export { AiBoxProvider, useAiBox } from "./AiBoxContext";
export type { AiBoxPageContext, AiBoxSuggestion } from "./AiBoxContext";

/* ── Deep-link entry ── */
export { useAiBoxDeepLink } from "./useAiBoxDeepLink";
export { resolveDeepLinkContext, derivePageRoute } from "./deepLinkResolver";
export { buildDeepLink } from "./deepLinkUtils";
export type { AlertActionSource } from "./deepLinkUtils";