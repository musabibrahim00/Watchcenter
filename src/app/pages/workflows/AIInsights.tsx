/**
 * AI Insights — Workflow monitoring insights and improvement suggestions
 *
 * Plain-language observations and actionable recommendations
 * Non-technical interface for continuous workflow improvement
 */

import React, { useState } from "react";
import {
  Sparkles,
  AlertTriangle,
  TrendingUp,
  Zap,
  Link2,
  Clock,
  CheckCircle2,
  X,
  MessageSquare,
  ChevronRight,
  Info,
} from "lucide-react";
import { colors } from "../../shared/design-system/tokens";

/* ================================================================
   TYPES
   ================================================================ */

export type InsightType = "error" | "performance" | "optimization" | "integration";
export type InsightPriority = "high" | "medium" | "low";

export interface AIInsight {
  id: string;
  type: InsightType;
  priority: InsightPriority;
  message: string;
  details?: string;
  suggestion?: {
    title: string;
    description: string;
    benefit: string;
    actionLabel: string;
  };
}

interface AIInsightsProps {
  insights: AIInsight[];
  onAskAI?: (insight: AIInsight) => void;
  onApplySuggestion?: (insight: AIInsight) => void;
  onIgnore?: (insightId: string) => void;
}

/* ================================================================
   CONFIGURATION
   ================================================================ */

const INSIGHT_TYPE_CONFIG: Record<
  InsightType,
  { color: string; icon: typeof AlertTriangle; label: string }
> = {
  error: {
    color: colors.critical,
    icon: AlertTriangle,
    label: "Error",
  },
  performance: {
    color: colors.warning,
    icon: Clock,
    label: "Performance",
  },
  optimization: {
    color: colors.accent,
    icon: Sparkles,
    label: "Optimization",
  },
  integration: {
    color: colors.warning,
    icon: Link2,
    label: "Integration",
  },
};

const PRIORITY_CONFIG: Record<InsightPriority, { color: string }> = {
  high: { color: colors.critical },
  medium: { color: colors.warning },
  low: { color: colors.textMuted },
};

/* ================================================================
   INSIGHT CARD COMPONENT
   ================================================================ */

interface InsightCardProps {
  insight: AIInsight;
  onAskAI?: (insight: AIInsight) => void;
  onApplySuggestion?: (insight: AIInsight) => void;
  onIgnore?: (insightId: string) => void;
}

function InsightCard({ insight, onAskAI, onApplySuggestion, onIgnore }: InsightCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const typeConfig = INSIGHT_TYPE_CONFIG[insight.type];
  const TypeIcon = typeConfig.icon;
  const priorityColor = PRIORITY_CONFIG[insight.priority].color;

  return (
    <div
      className="rounded-[10px] p-[12px]"
      style={{
        backgroundColor: colors.bgCard,
        border: `1px solid ${colors.border}`,
      }}
    >
      {/* Header */}
      <div className="flex items-start gap-[10px] mb-[10px]">
        <div
          className="size-[32px] rounded-[6px] flex items-center justify-center shrink-0"
          style={{
            backgroundColor: `${typeConfig.color}15`,
            border: `1px solid ${typeConfig.color}`,
          }}
        >
          <TypeIcon size={14} color={typeConfig.color} strokeWidth={2} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-[6px] mb-[2px]">
            <span
              className="text-[9px] px-[6px] py-[2px] rounded-[4px]"
              style={{
                backgroundColor: `${typeConfig.color}15`,
                color: typeConfig.color,
                fontWeight: 600,
              }}
            >
              {typeConfig.label.toUpperCase()}
            </span>
            {insight.priority === "high" && (
              <div
                className="size-[6px] rounded-full"
                style={{ backgroundColor: priorityColor }}
              />
            )}
          </div>
          <p className="text-[11px] mt-[4px]" style={{ color: colors.textPrimary, lineHeight: 1.5 }}>
            {insight.message}
          </p>
        </div>
        {onIgnore && (
          <button
            onClick={() => onIgnore(insight.id)}
            className="rounded-[4px] p-[4px] transition-colors shrink-0"
            style={{ color: colors.textDim }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = colors.bgCardHover;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
            }}
          >
            <X size={12} strokeWidth={2} />
          </button>
        )}
      </div>

      {/* Details (if available) */}
      {insight.details && (
        <div
          className="rounded-[6px] px-[10px] py-[8px] mb-[10px]"
          style={{
            backgroundColor: colors.bgCardHover,
            border: `1px solid ${colors.border}`,
          }}
        >
          <p className="text-[10px]" style={{ color: colors.textSecondary, lineHeight: 1.5 }}>
            {insight.details}
          </p>
        </div>
      )}

      {/* Suggestion (if available) */}
      {insight.suggestion && (
        <>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full flex items-center justify-between mb-[8px] text-left"
          >
            <span className="text-[10px]" style={{ color: colors.accent, fontWeight: 600 }}>
              AI SUGGESTION
            </span>
            <ChevronRight
              size={12}
              color={colors.accent}
              strokeWidth={2}
              style={{
                transform: isExpanded ? "rotate(90deg)" : "rotate(0deg)",
                transition: "transform 0.2s",
              }}
            />
          </button>

          {isExpanded && (
            <div
              className="rounded-[8px] p-[10px] mb-[10px]"
              style={{
                backgroundColor: `${colors.accent}08`,
                border: `1px solid ${colors.accent}`,
              }}
            >
              <div className="flex items-start gap-[8px] mb-[8px]">
                <Sparkles size={12} color={colors.accent} strokeWidth={2} className="mt-[1px] shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] mb-[6px]" style={{ color: colors.textPrimary, fontWeight: 600 }}>
                    {insight.suggestion.title}
                  </p>
                  <p className="text-[10px] mb-[8px]" style={{ color: colors.textSecondary, lineHeight: 1.5 }}>
                    {insight.suggestion.description}
                  </p>
                  <div
                    className="rounded-[6px] px-[8px] py-[6px]"
                    style={{
                      backgroundColor: colors.bgCard,
                      border: `1px solid ${colors.border}`,
                    }}
                  >
                    <div className="text-[9px] mb-[2px]" style={{ color: colors.textDim, fontWeight: 600 }}>
                      EXPECTED BENEFIT
                    </div>
                    <p className="text-[10px]" style={{ color: colors.textSecondary }}>
                      {insight.suggestion.benefit}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Actions */}
      <div className="flex items-center gap-[6px]">
        {onAskAI && (
          <button
            onClick={() => onAskAI(insight)}
            className="flex items-center gap-[6px] rounded-[6px] px-[10px] py-[6px] text-[10px] transition-colors"
            style={{
              backgroundColor: "transparent",
              border: `1px solid ${colors.border}`,
              color: colors.textSecondary,
              fontWeight: 500,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = colors.bgCardHover;
              e.currentTarget.style.borderColor = colors.accent;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
              e.currentTarget.style.borderColor = colors.border;
            }}
          >
            <MessageSquare size={10} strokeWidth={2} />
            Ask AI
          </button>
        )}
        {insight.suggestion && onApplySuggestion && (
          <button
            onClick={() => onApplySuggestion(insight)}
            className="flex-1 flex items-center justify-center gap-[6px] rounded-[6px] px-[10px] py-[6px] text-[10px] transition-colors"
            style={{
              backgroundColor: colors.buttonPrimary,
              color: "#fff",
              fontWeight: 600,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = colors.buttonPrimaryHover;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = colors.buttonPrimary;
            }}
          >
            <CheckCircle2 size={10} strokeWidth={2} />
            {insight.suggestion.actionLabel}
          </button>
        )}
      </div>
    </div>
  );
}

/* ================================================================
   MAIN COMPONENT
   ================================================================ */

export function AIInsights({
  insights,
  onAskAI,
  onApplySuggestion,
  onIgnore,
}: AIInsightsProps) {
  const highPriorityInsights = insights.filter((i) => i.priority === "high");
  const otherInsights = insights.filter((i) => i.priority !== "high");

  if (insights.length === 0) {
    return (
      <div
        className="rounded-[10px] p-[20px] flex flex-col items-center justify-center"
        style={{
          backgroundColor: colors.bgCard,
          border: `1px solid ${colors.border}`,
        }}
      >
        <div
          className="size-[48px] rounded-full flex items-center justify-center mb-[12px]"
          style={{
            backgroundColor: `${colors.active}10`,
            border: `1px solid ${colors.active}30`,
          }}
        >
          <CheckCircle2 size={20} color={colors.active} strokeWidth={2} />
        </div>
        <h4 className="text-[12px] mb-[4px]" style={{ color: colors.textPrimary, fontWeight: 600 }}>
          No Issues Detected
        </h4>
        <p className="text-[10px] text-center" style={{ color: colors.textMuted }}>
          Your workflow is running smoothly. AI monitoring is active.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-[12px]">
      {/* Header */}
      <div className="flex items-center gap-[8px]">
        <Sparkles size={14} color={colors.accent} strokeWidth={2} />
        <h3 className="text-[12px]" style={{ color: colors.textPrimary, fontWeight: 600 }}>
          AI Insights
        </h3>
        <span
          className="text-[9px] px-[6px] py-[2px] rounded-[4px]"
          style={{
            backgroundColor: `${colors.accent}15`,
            color: colors.accent,
            fontWeight: 600,
          }}
        >
          {insights.length}
        </span>
      </div>

      {/* High Priority Insights */}
      {highPriorityInsights.length > 0 && (
        <div className="space-y-[8px]">
          {highPriorityInsights.map((insight) => (
            <InsightCard
              key={insight.id}
              insight={insight}
              onAskAI={onAskAI}
              onApplySuggestion={onApplySuggestion}
              onIgnore={onIgnore}
            />
          ))}
        </div>
      )}

      {/* Other Insights */}
      {otherInsights.length > 0 && (
        <div className="space-y-[8px]">
          {otherInsights.map((insight) => (
            <InsightCard
              key={insight.id}
              insight={insight}
              onAskAI={onAskAI}
              onApplySuggestion={onApplySuggestion}
              onIgnore={onIgnore}
            />
          ))}
        </div>
      )}
    </div>
  );
}
