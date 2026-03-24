/**
 * Integration Setup Modal — Guided integration configuration
 * 
 * Allows users to connect integrations directly from the workflow builder
 * Simple provider selection and configuration interface
 */

import React, { useState } from "react";
import { X, Settings, Check, ExternalLink, AlertCircle } from "lucide-react";
import { colors } from "../../shared/design-system/tokens";

/* ================================================================
   TYPES
   ================================================================ */

interface IntegrationProvider {
  id: string;
  name: string;
  description: string;
  isConfigured: boolean;
  instances?: ConfiguredInstance[];
}

interface ConfiguredInstance {
  id: string;
  name: string;
  workspace?: string;
  isDefault: boolean;
}

interface IntegrationSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  integrationType: "slack" | "jira" | "virustotal" | "aws" | "email" | "threat-intel";
  onComplete: () => void;
}

/* ================================================================
   MOCK DATA
   ================================================================ */

const INTEGRATION_PROVIDERS: Record<string, IntegrationProvider[]> = {
  slack: [
    {
      id: "slack",
      name: "Slack",
      description: "Send notifications to Slack channels",
      isConfigured: false,
    },
  ],
  jira: [
    {
      id: "jira-cloud",
      name: "Jira Cloud",
      description: "Connect to Jira Cloud workspace",
      isConfigured: true,
      instances: [
        { id: "inst-1", name: "SOC Workspace", workspace: "watchcenter.atlassian.net", isDefault: true },
        { id: "inst-2", name: "DevOps Workspace", workspace: "devops.atlassian.net", isDefault: false },
      ],
    },
    {
      id: "jira-server",
      name: "Jira Server",
      description: "Connect to self-hosted Jira",
      isConfigured: false,
    },
  ],
  virustotal: [
    {
      id: "virustotal",
      name: "VirusTotal",
      description: "Threat intelligence and file scanning",
      isConfigured: false,
    },
    {
      id: "crowdstrike",
      name: "CrowdStrike",
      description: "Endpoint detection and threat intel",
      isConfigured: false,
    },
    {
      id: "aws-security-hub",
      name: "AWS Security Hub",
      description: "Cloud security findings",
      isConfigured: false,
    },
  ],
  "threat-intel": [
    {
      id: "virustotal",
      name: "VirusTotal",
      description: "Threat intelligence and file scanning",
      isConfigured: false,
    },
    {
      id: "crowdstrike",
      name: "CrowdStrike",
      description: "Endpoint detection and threat intel",
      isConfigured: false,
    },
  ],
  aws: [
    {
      id: "aws",
      name: "AWS",
      description: "Connect to AWS services",
      isConfigured: false,
    },
  ],
  email: [
    {
      id: "smtp",
      name: "SMTP",
      description: "Send emails via SMTP server",
      isConfigured: false,
    },
    {
      id: "sendgrid",
      name: "SendGrid",
      description: "Send emails via SendGrid API",
      isConfigured: false,
    },
  ],
};

const INTEGRATION_LABELS: Record<string, string> = {
  slack: "Slack",
  jira: "Jira",
  virustotal: "Threat Intelligence",
  "threat-intel": "Threat Intelligence",
  aws: "AWS",
  email: "Email",
};

/* ================================================================
   INTEGRATION SETUP MODAL
   ================================================================ */

export function IntegrationSetupModal({
  isOpen,
  onClose,
  integrationType,
  onComplete,
}: IntegrationSetupModalProps) {
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [selectedInstance, setSelectedInstance] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  if (!isOpen) return null;

  const providers = INTEGRATION_PROVIDERS[integrationType] || [];
  const provider = providers.find(p => p.id === selectedProvider);

  const handleConnect = () => {
    setIsConnecting(true);
    // Simulate connection process
    setTimeout(() => {
      setIsConnecting(false);
      onComplete();
      onClose();
    }, 1500);
  };

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
          className="w-full max-w-[540px] rounded-[12px] pointer-events-auto max-h-[80vh] flex flex-col"
          style={{
            backgroundColor: colors.bgCard,
            border: `1px solid ${colors.border}`,
            boxShadow: "0 24px 48px rgba(0, 0, 0, 0.4)",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div
            className="px-[20px] py-[16px] flex items-center justify-between shrink-0"
            style={{ borderBottom: `1px solid ${colors.border}` }}
          >
            <div className="flex items-center gap-[12px]">
              <div
                className="size-[36px] rounded-[8px] flex items-center justify-center shrink-0"
                style={{
                  backgroundColor: `${colors.accent}15`,
                  border: `1px solid ${colors.accent}`,
                }}
              >
                <Settings size={18} color={colors.accent} strokeWidth={2} />
              </div>
              <div>
                <h3 className="text-[14px]" style={{ color: colors.textPrimary, fontWeight: 600 }}>
                  Connect {INTEGRATION_LABELS[integrationType] || "Integration"}
                </h3>
                <p className="text-[11px]" style={{ color: colors.textMuted }}>
                  Choose a provider and configure connection
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
          <div className="flex-1 overflow-y-auto px-[20px] py-[16px]">
            <div className="space-y-[12px]">
              <h4 className="text-[11px] mb-[8px]" style={{ color: colors.textDim, fontWeight: 600 }}>
                SELECT PROVIDER
              </h4>

              {providers.map((prov) => {
                const isSelected = selectedProvider === prov.id;
                return (
                  <div key={prov.id}>
                    <button
                      onClick={() => setSelectedProvider(prov.id)}
                      className="w-full rounded-[8px] px-[14px] py-[12px] flex items-center gap-[12px] transition-all text-left"
                      style={{
                        backgroundColor: isSelected ? `${colors.accent}08` : "transparent",
                        border: `1px solid ${isSelected ? colors.accent : colors.border}`,
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.backgroundColor = colors.bgCardHover;
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.backgroundColor = "transparent";
                        }
                      }}
                    >
                      <div
                        className="size-[18px] rounded-full flex items-center justify-center shrink-0"
                        style={{
                          backgroundColor: isSelected ? colors.accent : "transparent",
                          border: `2px solid ${isSelected ? colors.accent : colors.border}`,
                        }}
                      >
                        {isSelected && <Check size={10} color="#fff" strokeWidth={3} />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-[8px]">
                          <span className="text-[12px]" style={{ color: colors.textPrimary, fontWeight: 600 }}>
                            {prov.name}
                          </span>
                          {prov.isConfigured && (
                            <span
                              className="px-[6px] py-[2px] rounded-[4px] text-[9px]"
                              style={{
                                backgroundColor: `${colors.active}15`,
                                color: colors.active,
                                fontWeight: 600,
                              }}
                            >
                              CONFIGURED
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] mt-[2px]" style={{ color: colors.textMuted }}>
                          {prov.description}
                        </p>
                      </div>
                    </button>

                    {/* Show instances if provider is configured and selected */}
                    {isSelected && prov.isConfigured && prov.instances && (
                      <div className="mt-[8px] ml-[30px] space-y-[6px]">
                        <h5 className="text-[10px] mb-[6px]" style={{ color: colors.textDim, fontWeight: 600 }}>
                          SELECT INSTANCE
                        </h5>
                        {prov.instances.map((inst) => {
                          const isInstSelected = selectedInstance === inst.id;
                          return (
                            <button
                              key={inst.id}
                              onClick={() => setSelectedInstance(inst.id)}
                              className="w-full rounded-[6px] px-[10px] py-[8px] flex items-center gap-[8px] transition-colors text-left"
                              style={{
                                backgroundColor: isInstSelected ? `${colors.accent}08` : colors.bgCardHover,
                                border: `1px solid ${isInstSelected ? colors.accent : colors.border}`,
                              }}
                            >
                              <div
                                className="size-[14px] rounded-full flex items-center justify-center shrink-0"
                                style={{
                                  backgroundColor: isInstSelected ? colors.accent : "transparent",
                                  border: `2px solid ${isInstSelected ? colors.accent : colors.border}`,
                                }}
                              >
                                {isInstSelected && <Check size={8} color="#fff" strokeWidth={3} />}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-[6px]">
                                  <span className="text-[11px]" style={{ color: colors.textPrimary, fontWeight: 600 }}>
                                    {inst.name}
                                  </span>
                                  {inst.isDefault && (
                                    <span
                                      className="px-[4px] py-[1px] rounded-[3px] text-[8px]"
                                      style={{
                                        backgroundColor: `${colors.accent}15`,
                                        color: colors.accent,
                                        fontWeight: 600,
                                      }}
                                    >
                                      DEFAULT
                                    </span>
                                  )}
                                </div>
                                {inst.workspace && (
                                  <p className="text-[9px]" style={{ color: colors.textMuted }}>
                                    {inst.workspace}
                                  </p>
                                )}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {/* Show connect button if provider is not configured and selected */}
                    {isSelected && !prov.isConfigured && (
                      <div className="mt-[8px] ml-[30px]">
                        <div
                          className="rounded-[6px] px-[10px] py-[8px] flex items-start gap-[8px]"
                          style={{
                            backgroundColor: `${colors.accent}08`,
                            border: `1px solid ${colors.accent}30`,
                          }}
                        >
                          <AlertCircle size={12} color={colors.accent} strokeWidth={2} className="shrink-0 mt-[1px]" />
                          <p className="text-[10px]" style={{ color: colors.textSecondary, lineHeight: 1.4 }}>
                            You'll be redirected to {prov.name} to authorize Watch Center. 
                            This is a one-time setup.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Footer */}
          <div
            className="px-[20px] py-[16px] flex items-center justify-between shrink-0"
            style={{ borderTop: `1px solid ${colors.border}` }}
          >
            <button
              onClick={onClose}
              className="text-[11px] transition-colors"
              style={{ color: colors.textMuted }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = colors.textSecondary;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = colors.textMuted;
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleConnect}
              disabled={!selectedProvider || (provider?.isConfigured && !selectedInstance) || isConnecting}
              className="flex items-center gap-[6px] rounded-[8px] px-[14px] py-[8px] text-[12px] transition-colors disabled:opacity-50"
              style={{
                backgroundColor: colors.buttonPrimary,
                color: "#fff",
                fontWeight: 600,
              }}
              onMouseEnter={(e) => {
                if (!e.currentTarget.disabled) {
                  e.currentTarget.style.backgroundColor = colors.buttonPrimaryHover;
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = colors.buttonPrimary;
              }}
            >
              {isConnecting ? (
                <>
                  <div className="size-[12px] border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <ExternalLink size={14} strokeWidth={2} />
                  {provider?.isConfigured ? "Use This Integration" : "Connect Integration"}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
