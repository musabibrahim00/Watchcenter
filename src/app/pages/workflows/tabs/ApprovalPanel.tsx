/**
 * Approval Panel — Human approval interface for workflow steps
 *
 * Displays when a workflow step requires manual approval to proceed.
 */

import React from "react";
import { AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import { colors } from "../../../shared/design-system/tokens";
import { useTimeTravel } from "../../../shared/contexts/TimeTravelContext";

interface ApprovalPanelProps {
  stepName: string;
  requestedBy: string;
  runId: string;
  stepId: string;
  onApprove: (runId: string, stepId: string) => void;
  onReject: (runId: string, stepId: string) => void;
}

export function ApprovalPanel({
  stepName,
  requestedBy,
  runId,
  stepId,
  onApprove,
  onReject,
}: ApprovalPanelProps) {
  const { isActive: timeTravelActive } = useTimeTravel();

  return (
    <div
      style={{
        marginTop: "16px",
        padding: "20px",
        borderRadius: "10px",
        border: `1px solid ${colors.medium}`,
        background: `linear-gradient(135deg, ${colors.medium}08 0%, ${colors.medium}03 100%)`,
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: "16px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            marginBottom: "6px",
          }}
        >
          <AlertTriangle size={18} color={colors.medium} />
          <h4
            style={{
              fontSize: "14px",
              fontWeight: 600,
              color: colors.textPrimary,
            }}
          >
            Approval Required
          </h4>
        </div>
        <p
          style={{
            fontSize: "12px",
            color: colors.textMuted,
            lineHeight: 1.5,
          }}
        >
          This workflow step requires manual approval before execution can continue.
        </p>
      </div>

      {/* Details Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "auto 1fr",
          gap: "12px 16px",
          marginBottom: "20px",
          padding: "16px",
          borderRadius: "8px",
          background: colors.bgApp,
          border: `1px solid ${colors.border}`,
        }}
      >
        {/* Step */}
        <div
          style={{
            fontSize: "12px",
            fontWeight: 600,
            color: colors.textDim,
          }}
        >
          STEP
        </div>
        <div
          style={{
            fontSize: "13px",
            color: colors.textPrimary,
            fontWeight: 500,
          }}
        >
          {stepName}
        </div>

        {/* Requested By */}
        <div
          style={{
            fontSize: "12px",
            fontWeight: 600,
            color: colors.textDim,
          }}
        >
          REQUESTED BY
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            fontSize: "13px",
            color: colors.textSecondary,
          }}
        >
          {requestedBy}
        </div>

        {/* Run ID */}
        <div
          style={{
            fontSize: "12px",
            fontWeight: 600,
            color: colors.textDim,
          }}
        >
          RUN ID
        </div>
        <div
          style={{
            fontSize: "13px",
            fontFamily: "monospace",
            color: colors.low,
          }}
        >
          {runId}
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ display: "flex", gap: "12px" }}>
        <button
          onClick={() => !timeTravelActive && onApprove(runId, stepId)}
          disabled={timeTravelActive}
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            padding: "12px 20px",
            borderRadius: "8px",
            border: "none",
            background: timeTravelActive ? colors.bgCardHover : colors.active,
            color: timeTravelActive ? colors.textDim : "#fff",
            fontSize: "13px",
            fontWeight: 600,
            cursor: timeTravelActive ? "not-allowed" : "pointer",
            transition: "all 0.2s",
            opacity: timeTravelActive ? 0.5 : 1,
          }}
          onMouseEnter={(e) => {
            if (!timeTravelActive) {
              e.currentTarget.style.background = "#1aa3e8";
              e.currentTarget.style.transform = "translateY(-1px)";
            }
          }}
          onMouseLeave={(e) => {
            if (!timeTravelActive) {
              e.currentTarget.style.background = colors.active;
              e.currentTarget.style.transform = "translateY(0)";
            }
          }}
          title={timeTravelActive ? "Approval disabled in Time Travel mode" : "Approve this step"}
        >
          <CheckCircle2 size={16} strokeWidth={2} />
          Approve
        </button>

        <button
          onClick={() => !timeTravelActive && onReject(runId, stepId)}
          disabled={timeTravelActive}
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            padding: "12px 20px",
            borderRadius: "8px",
            border: `1px solid ${colors.border}`,
            background: "transparent",
            color: timeTravelActive ? colors.textDim : colors.textSecondary,
            fontSize: "13px",
            fontWeight: 600,
            cursor: timeTravelActive ? "not-allowed" : "pointer",
            transition: "all 0.2s",
            opacity: timeTravelActive ? 0.5 : 1,
          }}
          onMouseEnter={(e) => {
            if (!timeTravelActive) {
              e.currentTarget.style.background = colors.bgCardHover;
              e.currentTarget.style.borderColor = colors.critical;
              e.currentTarget.style.color = colors.critical;
            }
          }}
          onMouseLeave={(e) => {
            if (!timeTravelActive) {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.borderColor = colors.border;
              e.currentTarget.style.color = colors.textSecondary;
            }
          }}
          title={timeTravelActive ? "Rejection disabled in Time Travel mode" : "Reject this step"}
        >
          <XCircle size={16} strokeWidth={2} />
          Reject
        </button>
      </div>

      {/* Info Footer */}
      <div
        style={{
          marginTop: "16px",
          padding: "10px 12px",
          borderRadius: "6px",
          background: `${colors.accent}08`,
          border: `1px solid ${colors.accent}20`,
          fontSize: "11px",
          color: colors.textMuted,
          lineHeight: 1.5,
        }}
      >
        <strong style={{ color: colors.accent }}>Note:</strong> Approving will resume workflow execution.
        Rejecting will mark the step as failed and cancel the remaining workflow.
      </div>
    </div>
  );
}