/**
 * Integration Required Modal — Pre-publish validation
 * 
 * Shows when user tries to publish a workflow with missing integrations
 * Guides users to configure required integrations before publishing
 */

import React from "react";
import { X, AlertTriangle, Settings, Clock } from "lucide-react";
import { colors } from "../../shared/design-system/tokens";

/* ================================================================
   TYPES
   ================================================================ */

interface Integration {
  id: string;
  name: string;
  provider: string;
  isConnected: boolean;
  requiredBySteps: string[];
}

interface IntegrationRequiredModalProps {
  isOpen: boolean;
  onClose: () => void;
  missingIntegrations: Integration[];
  onConfigureIntegrations: () => void;
  onPublishLater: () => void;
  /** Optional label overrides for reuse outside publish flow */
  subtitle?: string;
  bodyText?: string;
  infoText?: string;
  skipLabel?: string;
  configureLabel?: string;
}

/* ================================================================
   INTEGRATION REQUIRED MODAL
   ================================================================ */

export function IntegrationRequiredModal({
  isOpen,
  onClose,
  missingIntegrations,
  onConfigureIntegrations,
  onPublishLater,
  subtitle,
  bodyText,
  infoText,
  skipLabel,
  configureLabel,
}: IntegrationRequiredModalProps) {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[100]"
        style={{ backgroundColor: "rgba(0, 0, 0, 0.6)" }}
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-[24px] pointer-events-none">
        <div
          className="w-full max-w-[480px] rounded-[12px] pointer-events-auto"
          style={{
            backgroundColor: colors.bgCard,
            border: `1px solid ${colors.border}`,
            boxShadow: "0 24px 48px rgba(0, 0, 0, 0.4)",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div
            className="px-[20px] py-[16px] flex items-center justify-between"
            style={{ borderBottom: `1px solid ${colors.border}` }}
          >
            <div className="flex items-center gap-[12px]">
              <div
                className="size-[36px] rounded-[8px] flex items-center justify-center shrink-0"
                style={{
                  backgroundColor: `${colors.warning}15`,
                  border: `1px solid ${colors.warning}`,
                }}
              >
                <AlertTriangle size={18} color={colors.warning} strokeWidth={2} />
              </div>
              <div>
                <h3 className="text-[14px]" style={{ color: colors.textPrimary, fontWeight: 600 }}>
                  Integration Required
                </h3>
                <p className="text-[11px]" style={{ color: colors.textMuted }}>
                  {subtitle || "Configure integrations to publish this workflow"}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="rounded-[6px] p-[6px] transition-colors"
              style={{ color: colors.textMuted }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = colors.bgCardHover;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
              }}
            >
              <X size={16} strokeWidth={2} />
            </button>
          </div>

          {/* Content */}
          <div className="px-[20px] py-[16px]">
            <p className="text-[12px] mb-[16px]" style={{ color: colors.textSecondary }}>
              {bodyText || "This workflow requires the following integrations before it can run:"}
            </p>

            {/* Missing integrations list */}
            <div className="space-y-[8px]">
              {missingIntegrations.map((integration) => (
                <div
                  key={integration.id}
                  className="rounded-[8px] px-[12px] py-[10px] flex items-start gap-[10px]"
                  style={{
                    backgroundColor: colors.bgCardHover,
                    border: `1px solid ${colors.border}`,
                  }}
                >
                  <div
                    className="size-[32px] rounded-[6px] flex items-center justify-center shrink-0 mt-[2px]"
                    style={{
                      backgroundColor: `${colors.warning}10`,
                      border: `1px solid ${colors.warning}30`,
                    }}
                  >
                    <Settings size={14} color={colors.warning} strokeWidth={2} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-[6px] mb-[2px]">
                      <h4 className="text-[12px]" style={{ color: colors.textPrimary, fontWeight: 600 }}>
                        {integration.name}
                      </h4>
                      <span
                        className="px-[6px] py-[2px] rounded-[4px] text-[9px]"
                        style={{
                          backgroundColor: `${colors.warning}15`,
                          color: colors.warning,
                          fontWeight: 600,
                        }}
                      >
                        NOT CONNECTED
                      </span>
                    </div>
                    <p className="text-[10px]" style={{ color: colors.textMuted }}>
                      Required by: {integration.requiredBySteps.join(", ")}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Info box */}
            <div
              className="mt-[16px] rounded-[8px] px-[12px] py-[10px] flex gap-[10px]"
              style={{
                backgroundColor: `${colors.accent}08`,
                border: `1px solid ${colors.accent}30`,
              }}
            >
              <AlertTriangle size={14} color={colors.accent} strokeWidth={2} className="shrink-0 mt-[1px]" />
              <p className="text-[11px]" style={{ color: colors.textSecondary, lineHeight: 1.5 }}>
                {infoText || "Don't worry! You can save your workflow and configure integrations later. The workflow won't run until integrations are connected."}
              </p>
            </div>
          </div>

          {/* Footer */}
          <div
            className="px-[20px] py-[16px] flex items-center justify-end gap-[8px]"
            style={{ borderTop: `1px solid ${colors.border}` }}
          >
            <button
              onClick={onPublishLater}
              className="flex items-center gap-[6px] rounded-[8px] px-[14px] py-[8px] text-[12px] transition-colors"
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
              <Clock size={14} strokeWidth={2} />
              {skipLabel || "Publish Later"}
            </button>
            <button
              onClick={onConfigureIntegrations}
              className="flex items-center gap-[6px] rounded-[8px] px-[14px] py-[8px] text-[12px] transition-colors"
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
              <Settings size={14} strokeWidth={2} />
              {configureLabel || "Configure Integrations"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
