/**
 * Modified Input Modal — Input parameter modification for workflow replay
 *
 * Allows users to modify workflow input parameters before replaying a run.
 */

import React, { useState } from "react";
import { RotateCcw, AlertCircle } from "lucide-react";
import { colors } from "../../../shared/design-system/tokens";
import type { WorkflowRun } from "../types";

interface ModifiedInputModalProps {
  run: WorkflowRun;
  onConfirm: (modifiedInputs: Record<string, string>) => void;
  onCancel: () => void;
}

export function ModifiedInputModal({ run, onConfirm, onCancel }: ModifiedInputModalProps) {
  // Default input parameters (mock)
  const [alertSeverity, setAlertSeverity] = useState("critical");
  const [notificationChannel, setNotificationChannel] = useState("slack");
  const [autoAssign, setAutoAssign] = useState(true);

  const handleConfirm = () => {
    const modifiedInputs = {
      alertSeverity,
      notificationChannel,
      autoAssign: String(autoAssign),
    };
    onConfirm(modifiedInputs);
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[100]"
        style={{ backgroundColor: "rgba(0, 0, 0, 0.6)" }}
        onClick={onCancel}
      />

      {/* Modal */}
      <div
        className="fixed left-1/2 top-1/2 z-[101] w-[520px] rounded-[12px] p-[24px]"
        style={{
          backgroundColor: colors.bgCard,
          border: `1px solid ${colors.border}`,
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.5)",
          transform: "translate(-50%, -50%)",
        }}
      >
        {/* Header */}
        <div className="mb-[20px]">
          <h3 className="text-[16px] mb-[6px]" style={{ color: colors.textPrimary, fontWeight: 600 }}>
            Modify Input Parameters
          </h3>
          <p className="text-[12px]" style={{ color: colors.textMuted }}>
            Adjust workflow inputs before replaying run{" "}
            <span style={{ fontFamily: "monospace", color: colors.low }}>{run.id}</span>:
          </p>
        </div>

        {/* Info Banner */}
        <div
          className="mb-[20px] p-[12px] rounded-[8px] flex items-start gap-[10px]"
          style={{
            backgroundColor: `${colors.accent}10`,
            border: `1px solid ${colors.accent}30`,
          }}
        >
          <AlertCircle size={16} color={colors.accent} style={{ marginTop: "2px", flexShrink: 0 }} />
          <p className="text-[12px]" style={{ color: colors.textSecondary, lineHeight: 1.5 }}>
            Modified parameters will only apply to the new replay run. The original run remains unchanged.
          </p>
        </div>

        {/* Input Fields */}
        <div className="mb-[24px] space-y-[16px]">
          {/* Alert Severity */}
          <div>
            <label
              className="block mb-[8px] text-[12px]"
              style={{ color: colors.textMuted, fontWeight: 600 }}
            >
              ALERT SEVERITY
            </label>
            <select
              value={alertSeverity}
              onChange={(e) => setAlertSeverity(e.target.value)}
              className="w-full rounded-[8px] px-[12px] py-[10px] text-[14px]"
              style={{
                backgroundColor: colors.bgApp,
                border: `1px solid ${colors.border}`,
                color: colors.textPrimary,
              }}
            >
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          {/* Notification Channel */}
          <div>
            <label
              className="block mb-[8px] text-[12px]"
              style={{ color: colors.textMuted, fontWeight: 600 }}
            >
              NOTIFICATION CHANNEL
            </label>
            <select
              value={notificationChannel}
              onChange={(e) => setNotificationChannel(e.target.value)}
              className="w-full rounded-[8px] px-[12px] py-[10px] text-[14px]"
              style={{
                backgroundColor: colors.bgApp,
                border: `1px solid ${colors.border}`,
                color: colors.textPrimary,
              }}
            >
              <option value="slack">Slack</option>
              <option value="email">Email</option>
              <option value="pagerduty">PagerDuty</option>
              <option value="teams">Microsoft Teams</option>
            </select>
          </div>

          {/* Auto-Assign Toggle */}
          <div>
            <label className="flex items-center gap-[10px] cursor-pointer">
              <input
                type="checkbox"
                checked={autoAssign}
                onChange={(e) => setAutoAssign(e.target.checked)}
                className="cursor-pointer"
                style={{ accentColor: colors.accent }}
              />
              <div>
                <div className="text-[13px]" style={{ color: colors.textPrimary, fontWeight: 500 }}>
                  Auto-assign to analyst
                </div>
                <div className="text-[11px]" style={{ color: colors.textMuted }}>
                  Automatically assign investigation case to available analyst
                </div>
              </div>
            </label>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-[10px]">
          <button
            onClick={onCancel}
            className="rounded-[8px] px-[18px] py-[9px] text-[13px] transition-colors cursor-pointer"
            style={{
              backgroundColor: "transparent",
              border: `1px solid ${colors.border}`,
              color: colors.textSecondary,
              fontWeight: 500,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = colors.bgCardHover;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="flex items-center gap-[8px] rounded-[8px] px-[18px] py-[9px] text-[13px] transition-colors cursor-pointer"
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
            <RotateCcw size={14} strokeWidth={2} />
            Replay With Changes
          </button>
        </div>
      </div>
    </>
  );
}
