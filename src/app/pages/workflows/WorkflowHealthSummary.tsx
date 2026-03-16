/**
 * Workflow Health Summary — AI-powered workflow monitoring
 *
 * Displays workflow health status and key signals in plain language
 * Non-technical, action-oriented interface for monitoring workflow performance
 */

import React from "react";
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  Zap,
  Link2,
  TrendingUp,
  Sparkles,
  ChevronRight,
} from "lucide-react";
import { colors } from "../../shared/design-system/tokens";

/* ================================================================
   TYPES
   ================================================================ */

export type WorkflowHealthStatus = "healthy" | "needs_attention" | "failing";

export interface WorkflowHealthData {
  status: WorkflowHealthStatus;
  reason: string;
  signals: {
    failureRate: { value: string; status: "good" | "warning" | "critical" };
    avgRunTime: { value: string; status: "good" | "warning" | "critical" };
    pendingApprovals: { value: number; status: "good" | "warning" | "critical" };
    missingIntegrations: { value: string[]; status: "good" | "warning" | "critical" };
    aiDetectedIssues: { value: number; status: "good" | "warning" | "critical" };
  };
  recentPerformance: {
    totalRuns: number;
    completed: number;
    failed: number;
    awaitingApproval: number;
  };
}

interface WorkflowHealthSummaryProps {
  health: WorkflowHealthData;
  onViewDetails?: () => void;
}

/* ================================================================
   CONFIGURATION
   ================================================================ */

const HEALTH_CONFIG: Record<
  WorkflowHealthStatus,
  { color: string; icon: typeof CheckCircle2; label: string }
> = {
  healthy: {
    color: colors.active,
    icon: CheckCircle2,
    label: "Healthy",
  },
  needs_attention: {
    color: colors.warning,
    icon: AlertTriangle,
    label: "Needs Attention",
  },
  failing: {
    color: colors.critical,
    icon: XCircle,
    label: "Failing",
  },
};

const SIGNAL_STATUS_COLORS: Record<"good" | "warning" | "critical", string> = {
  good: colors.active,
  warning: colors.warning,
  critical: colors.critical,
};

/* ================================================================
   COMPONENT
   ================================================================ */

export function WorkflowHealthSummary({ health, onViewDetails }: WorkflowHealthSummaryProps) {
  const healthConfig = HEALTH_CONFIG[health.status];
  const HealthIcon = healthConfig.icon;

  const hasIssues = 
    health.signals.failureRate.status !== "good" ||
    health.signals.pendingApprovals.value > 0 ||
    health.signals.missingIntegrations.value.length > 0 ||
    health.signals.aiDetectedIssues.value > 0;

  return (
    <div
      className="max-w-[500px] mx-auto rounded-[10px] p-[16px]"
      style={{
        backgroundColor: `${healthConfig.color}08`,
        border: `1px solid ${healthConfig.color}`,
      }}
    >
      {/* Header */}
      <div className="flex items-start gap-[12px] mb-[12px]">
        <div
          className="size-[40px] rounded-[8px] flex items-center justify-center shrink-0"
          style={{
            backgroundColor: `${healthConfig.color}15`,
            border: `1px solid ${healthConfig.color}`,
          }}
        >
          <HealthIcon size={18} color={healthConfig.color} strokeWidth={2} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-[6px] mb-[2px]">
            <span className="text-[10px]" style={{ color: colors.textDim, fontWeight: 600 }}>
              WORKFLOW HEALTH
            </span>
          </div>
          <h4 className="text-[13px] mb-[4px]" style={{ color: colors.textPrimary, fontWeight: 600 }}>
            {healthConfig.label}
          </h4>
          <p className="text-[11px]" style={{ color: colors.textSecondary, lineHeight: 1.5 }}>
            {health.reason}
          </p>
        </div>
      </div>

      {/* Quick Stats */}
      {hasIssues && (
        <div
          className="rounded-[8px] p-[10px] mb-[12px]"
          style={{
            backgroundColor: colors.bgCard,
            border: `1px solid ${colors.border}`,
          }}
        >
          <div className="text-[9px] mb-[8px]" style={{ color: colors.textDim, fontWeight: 600 }}>
            KEY SIGNALS
          </div>
          <div className="grid grid-cols-2 gap-[8px]">
            {/* Failure Rate */}
            {health.signals.failureRate.status !== "good" && (
              <div className="flex items-center gap-[6px]">
                <div
                  className="size-[6px] rounded-full shrink-0"
                  style={{ backgroundColor: SIGNAL_STATUS_COLORS[health.signals.failureRate.status] }}
                />
                <span className="text-[10px] flex-1 truncate" style={{ color: colors.textSecondary }}>
                  {health.signals.failureRate.value} failure rate
                </span>
              </div>
            )}

            {/* Pending Approvals */}
            {health.signals.pendingApprovals.value > 0 && (
              <div className="flex items-center gap-[6px]">
                <Clock size={10} color={SIGNAL_STATUS_COLORS[health.signals.pendingApprovals.status]} strokeWidth={2} />
                <span className="text-[10px] flex-1 truncate" style={{ color: colors.textSecondary }}>
                  {health.signals.pendingApprovals.value} pending approval
                </span>
              </div>
            )}

            {/* Missing Integrations */}
            {health.signals.missingIntegrations.value.length > 0 && (
              <div className="flex items-center gap-[6px]">
                <Link2 size={10} color={SIGNAL_STATUS_COLORS[health.signals.missingIntegrations.status]} strokeWidth={2} />
                <span className="text-[10px] flex-1 truncate" style={{ color: colors.textSecondary }}>
                  {health.signals.missingIntegrations.value.join(", ")} disconnected
                </span>
              </div>
            )}

            {/* AI Issues */}
            {health.signals.aiDetectedIssues.value > 0 && (
              <div className="flex items-center gap-[6px]">
                <Sparkles size={10} color={SIGNAL_STATUS_COLORS[health.signals.aiDetectedIssues.status]} strokeWidth={2} />
                <span className="text-[10px] flex-1 truncate" style={{ color: colors.textSecondary }}>
                  {health.signals.aiDetectedIssues.value} AI-detected issue{health.signals.aiDetectedIssues.value > 1 ? "s" : ""}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Recent Performance */}
      <div
        className="rounded-[8px] p-[10px]"
        style={{
          backgroundColor: colors.bgCard,
          border: `1px solid ${colors.border}`,
        }}
      >
        <div className="text-[9px] mb-[8px]" style={{ color: colors.textDim, fontWeight: 600 }}>
          RECENT PERFORMANCE
        </div>
        <div className="flex items-center gap-[12px]">
          <div className="flex items-center gap-[4px]">
            <span className="text-[13px]" style={{ color: colors.textPrimary, fontWeight: 600 }}>
              {health.recentPerformance.totalRuns}
            </span>
            <span className="text-[10px]" style={{ color: colors.textMuted }}>
              runs
            </span>
          </div>
          <div className="w-[1px] h-[12px]" style={{ backgroundColor: colors.border }} />
          <div className="flex items-center gap-[4px]">
            <span className="text-[13px]" style={{ color: colors.active, fontWeight: 600 }}>
              {health.recentPerformance.completed}
            </span>
            <span className="text-[10px]" style={{ color: colors.textMuted }}>
              completed
            </span>
          </div>
          {health.recentPerformance.failed > 0 && (
            <>
              <div className="w-[1px] h-[12px]" style={{ backgroundColor: colors.border }} />
              <div className="flex items-center gap-[4px]">
                <span className="text-[13px]" style={{ color: colors.critical, fontWeight: 600 }}>
                  {health.recentPerformance.failed}
                </span>
                <span className="text-[10px]" style={{ color: colors.textMuted }}>
                  failed
                </span>
              </div>
            </>
          )}
          {health.recentPerformance.awaitingApproval > 0 && (
            <>
              <div className="w-[1px] h-[12px]" style={{ backgroundColor: colors.border }} />
              <div className="flex items-center gap-[4px]">
                <span className="text-[13px]" style={{ color: colors.warning, fontWeight: 600 }}>
                  {health.recentPerformance.awaitingApproval}
                </span>
                <span className="text-[10px]" style={{ color: colors.textMuted }}>
                  pending
                </span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* View Details */}
      {onViewDetails && (
        <button
          onClick={onViewDetails}
          className="w-full flex items-center justify-center gap-[6px] mt-[10px] py-[8px] rounded-[6px] text-[11px] transition-colors"
          style={{
            backgroundColor: "transparent",
            border: `1px solid ${healthConfig.color}`,
            color: healthConfig.color,
            fontWeight: 500,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = `${healthConfig.color}10`;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "transparent";
          }}
        >
          View AI Insights
          <ChevronRight size={12} strokeWidth={2} />
        </button>
      )}
    </div>
  );
}
