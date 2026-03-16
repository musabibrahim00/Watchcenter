/**
 * Integration Required Panel — Runtime integration blocker UI
 *
 * Displayed when a workflow step is blocked due to missing integration.
 * Provides user actions: Connect Integration, Skip Step, Cancel Run
 */

import React from "react";
import { AlertTriangle, Plug, SkipForward, XCircle } from "lucide-react";
import { colors } from "../../shared/design-system/tokens";
import { useTimeTravel } from "../../shared/contexts/TimeTravelContext";

interface IntegrationRequiredPanelProps {
  integrationName: string;
  stepName: string;
  runId: string;
  onConnectIntegration: () => void;
  onSkipStep: () => void;
  onCancelRun: () => void;
}

export function IntegrationRequiredPanel({
  integrationName,
  stepName,
  runId,
  onConnectIntegration,
  onSkipStep,
  onCancelRun,
}: IntegrationRequiredPanelProps) {
  const { isActive: timeTravelActive } = useTimeTravel();

  const disabledStyle = timeTravelActive ? {
    opacity: 0.5,
    cursor: "not-allowed" as const,
    pointerEvents: "none" as const,
  } : {};

  return (
    <div
      style={{
        marginTop: "20px",
        padding: "24px",
        borderRadius: "12px",
        border: `2px solid ${colors.warning}`,
        background: `linear-gradient(135deg, ${colors.warning}12, ${colors.warning}08)`,
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          marginBottom: "16px",
        }}
      >
        <div
          style={{
            width: "40px",
            height: "40px",
            borderRadius: "50%",
            background: `${colors.warning}20`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <AlertTriangle size={20} color={colors.warning} />
        </div>
        <div>
          <h3
            style={{
              fontSize: "16px",
              fontWeight: 600,
              color: colors.textPrimary,
              marginBottom: "4px",
            }}
          >
            Integration Required
          </h3>
          <p
            style={{
              fontSize: "13px",
              color: colors.textMuted,
            }}
          >
            Run {runId} is paused
          </p>
        </div>
      </div>

      {/* Message */}
      <div
        style={{
          padding: "16px",
          borderRadius: "8px",
          background: colors.bgCard,
          border: `1px solid ${colors.border}`,
          marginBottom: "20px",
        }}
      >
        <p
          style={{
            fontSize: "14px",
            color: colors.textSecondary,
            lineHeight: 1.6,
            marginBottom: "8px",
          }}
        >
          <strong style={{ color: colors.textPrimary }}>{integrationName}</strong> integration
          is required to continue execution.
        </p>
        <p
          style={{
            fontSize: "13px",
            color: colors.textMuted,
            lineHeight: 1.5,
          }}
        >
          The workflow step "<strong>{stepName}</strong>" cannot proceed without a connected{" "}
          {integrationName} account. Please connect the integration or skip this step to continue.
        </p>
      </div>

      {/* Action Buttons */}
      <div
        style={{
          display: "flex",
          gap: "12px",
          flexWrap: "wrap",
        }}
      >
        {timeTravelActive && (
          <div
            style={{
              width: "100%",
              padding: "8px 12px",
              borderRadius: "6px",
              background: `${colors.warning}12`,
              border: `1px solid ${colors.warning}30`,
              fontSize: "11px",
              color: colors.warning,
              fontWeight: 500,
              marginBottom: "4px",
            }}
          >
            Actions are disabled in Time Travel mode.
          </div>
        )}
        {/* Connect Integration (Primary) */}
        <button
          onClick={timeTravelActive ? undefined : onConnectIntegration}
          disabled={timeTravelActive}
          style={{
            flex: "1 1 auto",
            minWidth: "180px",
            padding: "12px 20px",
            borderRadius: "8px",
            border: "none",
            background: timeTravelActive ? colors.bgCardHover : colors.accent,
            color: timeTravelActive ? colors.textDim : "#ffffff",
            fontSize: "14px",
            fontWeight: 600,
            cursor: timeTravelActive ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            transition: "all 0.2s",
            opacity: timeTravelActive ? 0.5 : 1,
          }}
          onMouseEnter={(e) => {
            if (!timeTravelActive) {
              e.currentTarget.style.background = colors.accentHover;
              e.currentTarget.style.transform = "translateY(-1px)";
            }
          }}
          onMouseLeave={(e) => {
            if (!timeTravelActive) {
              e.currentTarget.style.background = colors.accent;
              e.currentTarget.style.transform = "translateY(0)";
            }
          }}
          title={timeTravelActive ? "This action is disabled in Time Travel mode" : `Connect ${integrationName}`}
        >
          <Plug size={16} />
          Connect {integrationName}
        </button>

        {/* Skip Step (Secondary) */}
        <button
          onClick={timeTravelActive ? undefined : onSkipStep}
          disabled={timeTravelActive}
          style={{
            flex: "0 1 auto",
            padding: "12px 20px",
            borderRadius: "8px",
            border: `1px solid ${colors.border}`,
            background: colors.bgCard,
            color: timeTravelActive ? colors.textDim : colors.textSecondary,
            fontSize: "14px",
            fontWeight: 500,
            cursor: timeTravelActive ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            transition: "all 0.2s",
            opacity: timeTravelActive ? 0.5 : 1,
          }}
          onMouseEnter={(e) => {
            if (!timeTravelActive) {
              e.currentTarget.style.background = colors.bgCardHover;
              e.currentTarget.style.borderColor = colors.textMuted;
            }
          }}
          onMouseLeave={(e) => {
            if (!timeTravelActive) {
              e.currentTarget.style.background = colors.bgCard;
              e.currentTarget.style.borderColor = colors.border;
            }
          }}
          title={timeTravelActive ? "This action is disabled in Time Travel mode" : "Skip Step"}
        >
          <SkipForward size={16} />
          Skip Step
        </button>

        {/* Cancel Run (Destructive) */}
        <button
          onClick={timeTravelActive ? undefined : onCancelRun}
          disabled={timeTravelActive}
          style={{
            flex: "0 1 auto",
            padding: "12px 20px",
            borderRadius: "8px",
            border: `1px solid ${timeTravelActive ? colors.border : `${colors.critical}40`}`,
            background: timeTravelActive ? colors.bgCard : `${colors.critical}10`,
            color: timeTravelActive ? colors.textDim : colors.critical,
            fontSize: "14px",
            fontWeight: 500,
            cursor: timeTravelActive ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            transition: "all 0.2s",
            opacity: timeTravelActive ? 0.5 : 1,
          }}
          onMouseEnter={(e) => {
            if (!timeTravelActive) {
              e.currentTarget.style.background = `${colors.critical}20`;
              e.currentTarget.style.borderColor = colors.critical;
            }
          }}
          onMouseLeave={(e) => {
            if (!timeTravelActive) {
              e.currentTarget.style.background = `${colors.critical}10`;
              e.currentTarget.style.borderColor = `${colors.critical}40`;
            }
          }}
          title={timeTravelActive ? "This action is disabled in Time Travel mode" : "Cancel Run"}
        >
          <XCircle size={16} />
          Cancel Run
        </button>
      </div>
    </div>
  );
}