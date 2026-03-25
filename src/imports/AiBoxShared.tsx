import imgAvatar from "../assets/TeammateAvatar.png";

/* ── Import shared utilities for local use ── */
import { formatText } from "../app/shared/utils/format-text";
import { isCasual, CASUAL_RESPS } from "../app/shared/utils/casual-detection";
import { getResponseContextLabel } from "../app/shared/utils/response-labels";
import { getSuccessState } from "../app/shared/utils/success-states";

/* ── Re-export shared utilities for backward-compatible import paths ── */
export { formatText, isCasual, CASUAL_RESPS, getResponseContextLabel, getSuccessState };

export { imgAvatar };

/* ================================================================
   CANONICAL RE-EXPORTS — extracted to feature module subfolders.
   These maintain full backward-compatibility for all existing
   consumers importing from this file.
   ================================================================ */

/* ── Types ── */
export type {
  TaskNode,
  TaskGraph,
  ActionLifecycleState,
  ChatMessage,
  ActionIntent,
  ActionScope,
  ActionStatus,
  ActionParameter,
  GuardrailLevel,
  ActionCardData,
  ActionTemplate,
  ActionResultType,
  ActionResultData,
  ActionFailureInfo,
} from "../app/features/ai-box/types";

/* ── Classifier utilities ── */
export { classifyGuardrailLevel, classifyActionIntent } from "../app/features/ai-box/utils/classifiers";

/* ── Action catalog + matcher ── */
export { ACTION_CATALOG, matchAction } from "../app/features/ai-box/data/action-catalog";

/* ── Action result derivation ── */
export { deriveActionResult, deriveActionFailure } from "../app/features/ai-box/utils/action-result";

/* ── Presentational result components ── */
export { ActionResultCard, ActionFailureCard } from "../app/features/ai-box/components/ActionResultCards";

/* ── Multi-agent contributor block ── */
export { ContributingAgentsBlock } from "../app/features/ai-box/components/ContributingAgentsBlock";

/* ── UI Components ── */
export { ActionLifecycleBadge } from "../app/features/ai-box/components/ActionLifecycleBadge";
export { MessageBubble } from "../app/features/ai-box/components/MessageBubble";
export { TypingIndicator } from "../app/features/ai-box/components/TypingIndicator";
export { ChatInput } from "../app/features/ai-box/components/ChatInput";
export { WelcomeScreen } from "../app/features/ai-box/components/WelcomeScreen";
export { ActionCard } from "../app/features/ai-box/components/ActionCard";
