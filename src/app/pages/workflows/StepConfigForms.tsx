/**
 * Step Configuration Forms — Type-aware form-based configuration
 *
 * No-code analyst-friendly configuration panels for workflow steps
 * Includes data mapping panel and data preview for SOC playbooks
 */

import React, { useState } from "react";
import { Sparkles, AlertTriangle, Link2, Database, ChevronDown } from "lucide-react";
import { colors } from "../../shared/design-system/tokens";
import { WorkflowDataPanel, SampleDataPreview, TokenInput } from "./VariableMapping";

/* ================================================================
   TYPES
   ================================================================ */

interface WorkflowStep {
  id: string;
  templateId: string;
  name: string;
  icon: any;
  status: string;
  executionTime?: string;
  config?: Record<string, any>;
  requiresIntegration?: string;
}

interface StepConfigurationFormProps {
  step: WorkflowStep;
  onUpdate: (updates: Partial<WorkflowStep>) => void;
}

/* ================================================================
   WORKFLOW DATA VARIABLES
   ================================================================ */

const WORKFLOW_DATA_VARIABLES = {
  alert: [
    { key: "alert.title", label: "Alert Title", example: "Suspicious PowerShell Execution" },
    { key: "alert.severity", label: "Alert Severity", example: "Critical" },
    { key: "alert.asset", label: "Alert Asset", example: "workstation-23" },
    { key: "alert.source", label: "Alert Source", example: "EDR" },
    { key: "alert.timestamp", label: "Alert Timestamp", example: "2026-03-14 14:23:00" },
    { key: "alert.description", label: "Alert Description", example: "PowerShell executed with suspicious parameters" },
  ],
  case: [
    { key: "case.id", label: "Case ID", example: "CASE-2024-0317" },
    { key: "case.link", label: "Case Link", example: "https://watchcenter.com/cases/317" },
    { key: "case.assignee", label: "Case Assignee", example: "SOC Analyst" },
    { key: "case.status", label: "Case Status", example: "Open" },
  ],
  asset: [
    { key: "asset.hostname", label: "Asset Hostname", example: "workstation-23" },
    { key: "asset.owner", label: "Asset Owner", example: "john.doe@company.com" },
    { key: "asset.type", label: "Asset Type", example: "Endpoint" },
    { key: "asset.ip", label: "Asset IP", example: "10.0.1.45" },
    { key: "asset.location", label: "Asset Location", example: "US-EAST" },
  ],
};

/* ================================================================
   MAIN CONFIGURATION FORM ROUTER
   ================================================================ */

export function StepConfigurationForm({ step, onUpdate }: StepConfigurationFormProps) {
  // Render different forms based on step template ID
  const renderConfigForm = () => {
    switch (step.templateId) {
      case "slack":
        return <SlackConfigForm step={step} onUpdate={onUpdate} />;
      case "create-case":
        return <CreateCaseConfigForm step={step} onUpdate={onUpdate} />;
      case "alert-trigger":
        return <AlertTriggerConfigForm step={step} onUpdate={onUpdate} />;
      case "vulnerability-detected":
        return <VulnerabilityDetectedTriggerForm step={step} onUpdate={onUpdate} />;
      case "asset-discovered":
        return <AssetDiscoveredTriggerForm step={step} onUpdate={onUpdate} />;
      case "case-created":
        return <CaseCreatedTriggerForm step={step} onUpdate={onUpdate} />;
      case "scheduled-trigger":
        return <ScheduledTriggerForm step={step} onUpdate={onUpdate} />;
      case "manual-trigger":
        return <ManualTriggerForm step={step} onUpdate={onUpdate} />;
      case "send-notification":
        return <NotificationConfigForm step={step} onUpdate={onUpdate} />;
      case "jira":
        return <JiraConfigForm step={step} onUpdate={onUpdate} />;
      case "github":
        return <GitHubConfigForm step={step} onUpdate={onUpdate} />;
      case "condition":
        return <ConditionConfigForm step={step} onUpdate={onUpdate} />;
      case "ai-enrichment":
        return <AIEnrichmentConfigForm step={step} onUpdate={onUpdate} />;
      case "update-asset":
        return <UpdateAssetConfigForm step={step} onUpdate={onUpdate} />;
      case "tag-resource":
        return <TagResourceConfigForm step={step} onUpdate={onUpdate} />;
      default:
        return <GenericConfigForm step={step} onUpdate={onUpdate} />;
    }
  };

  return (
    <div className="space-y-[16px]">
      {/* Step Name */}
      <div>
        <label className="text-[11px] mb-[6px] block" style={{ color: colors.textMuted, fontWeight: 500 }}>
          Step Name
        </label>
        <input
          type="text"
          value={step.name}
          className="w-full px-[12px] py-[8px] rounded-[6px] text-[12px]"
          style={{
            backgroundColor: colors.bgCardHover,
            border: `1px solid ${colors.border}`,
            color: colors.textPrimary,
          }}
          onChange={(e) => onUpdate({ name: e.target.value })}
        />
      </div>

      {/* Integration Warning */}
      {step.requiresIntegration && (
        <div
          className="rounded-[8px] p-[12px]"
          style={{
            backgroundColor: `${colors.medium}08`,
            border: `1px solid ${colors.medium}30`,
          }}
        >
          <div className="flex items-start gap-[8px] mb-[10px]">
            <AlertTriangle size={14} color={colors.medium} strokeWidth={2} className="mt-[1px] shrink-0" />
            <div className="text-[11px]" style={{ color: colors.medium, fontWeight: 600 }}>
              This step requires {step.requiresIntegration} integration
            </div>
          </div>
          <button
            className="w-full flex items-center justify-center gap-[6px] px-[10px] py-[7px] rounded-[6px] text-[11px] transition-colors"
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
            <Link2 size={12} strokeWidth={2} />
            Connect Integration
          </button>
        </div>
      )}

      {/* Step-specific configuration */}
      {renderConfigForm()}

      {/* Data Preview Panel */}
      <DataPreviewPanel step={step} />

      {/* Data Mapping Panel */}
      <DataMappingPanel />
    </div>
  );
}

/* ================================================================
   AI SUGGESTION COMPONENT
   ================================================================ */

function AISuggestionBox({ message, onApply }: { message: string; onApply: () => void }) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div
      className="rounded-[8px] p-[12px] mb-[16px]"
      style={{
        backgroundColor: `${colors.accent}08`,
        border: `1px solid ${colors.accent}30`,
      }}
    >
      <div className="flex items-start gap-[8px] mb-[8px]">
        <Sparkles size={12} color={colors.accent} strokeWidth={2} className="mt-[1px] shrink-0" />
        <div className="flex-1">
          <div className="text-[11px] mb-[4px]" style={{ color: colors.textPrimary, fontWeight: 600 }}>
            AI Suggestion
          </div>
          <p className="text-[10px] mb-[8px]" style={{ color: colors.textSecondary, lineHeight: 1.4 }}>
            {message}
          </p>
          <button
            onClick={() => {
              onApply();
              setDismissed(true);
            }}
            className="flex items-center gap-[4px] px-[8px] py-[5px] rounded-[4px] text-[10px] transition-colors"
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
            <Sparkles size={10} strokeWidth={2} />
            Apply Suggestion
          </button>
        </div>
      </div>
    </div>
  );
}

/* ================================================================
   DATA PREVIEW PANEL
   ================================================================ */

function DataPreviewPanel({ step }: { step: WorkflowStep }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className="rounded-[8px] overflow-hidden"
      style={{
        backgroundColor: `${colors.textDim}05`,
        border: `1px solid ${colors.border}`,
      }}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-[12px] py-[10px] transition-colors"
        style={{
          backgroundColor: colors.bgCardHover,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = colors.bgCard;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = colors.bgCardHover;
        }}
      >
        <div className="flex items-center gap-[8px]">
          <Database size={12} color={colors.accent} strokeWidth={2} />
          <span className="text-[11px]" style={{ color: colors.textPrimary, fontWeight: 600 }}>
            Data Preview
          </span>
        </div>
        <ChevronDown
          size={14}
          color={colors.textMuted}
          strokeWidth={2}
          className={`transition-transform ${expanded ? "rotate-180" : ""}`}
        />
      </button>

      {expanded && (
        <div className="px-[12px] py-[10px] space-y-[8px]">
          <div>
            <div className="text-[10px] mb-[4px]" style={{ color: colors.textDim, fontWeight: 500 }}>
              Alert Title
            </div>
            <div className="text-[11px]" style={{ color: colors.textSecondary }}>
              Suspicious PowerShell Execution
            </div>
          </div>
          <div>
            <div className="text-[10px] mb-[4px]" style={{ color: colors.textDim, fontWeight: 500 }}>
              Severity
            </div>
            <div className="text-[11px]" style={{ color: colors.critical, fontWeight: 600 }}>
              Critical
            </div>
          </div>
          <div>
            <div className="text-[10px] mb-[4px]" style={{ color: colors.textDim, fontWeight: 500 }}>
              Asset
            </div>
            <div className="text-[11px]" style={{ color: colors.textSecondary }}>
              workstation-23
            </div>
          </div>
          <div>
            <div className="text-[10px] mb-[4px]" style={{ color: colors.textDim, fontWeight: 500 }}>
              Source
            </div>
            <div className="text-[11px]" style={{ color: colors.textSecondary }}>
              EDR
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ================================================================
   DATA MAPPING PANEL
   ================================================================ */

function DataMappingPanel() {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className="rounded-[8px] overflow-hidden"
      style={{
        backgroundColor: `${colors.accent}05`,
        border: `1px solid ${colors.accent}30`,
      }}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-[12px] py-[10px] transition-colors"
        style={{
          backgroundColor: `${colors.accent}08`,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = `${colors.accent}12`;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = `${colors.accent}08`;
        }}
      >
        <div className="flex items-center gap-[8px]">
          <Sparkles size={12} color={colors.accent} strokeWidth={2} />
          <span className="text-[11px]" style={{ color: colors.textPrimary, fontWeight: 600 }}>
            Available Data Variables
          </span>
        </div>
        <ChevronDown
          size={14}
          color={colors.textMuted}
          strokeWidth={2}
          className={`transition-transform ${expanded ? "rotate-180" : ""}`}
        />
      </button>

      {expanded && (
        <div className="px-[12px] py-[10px] space-y-[12px]">
          {/* Alert Variables */}
          <div>
            <div className="text-[10px] mb-[6px]" style={{ color: colors.textMuted, fontWeight: 600 }}>
              ALERT DATA
            </div>
            <div className="space-y-[4px]">
              {WORKFLOW_DATA_VARIABLES.alert.map((variable) => (
                <div
                  key={variable.key}
                  className="flex items-center justify-between px-[8px] py-[6px] rounded-[4px] cursor-pointer transition-colors"
                  style={{ backgroundColor: colors.bgCardHover }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = colors.bgCard;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = colors.bgCardHover;
                  }}
                >
                  <div>
                    <div className="text-[10px] font-mono" style={{ color: colors.accent }}>
                      {`{{${variable.key}}}`}
                    </div>
                    <div className="text-[9px]" style={{ color: colors.textDim }}>
                      {variable.example}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Case Variables */}
          <div>
            <div className="text-[10px] mb-[6px]" style={{ color: colors.textMuted, fontWeight: 600 }}>
              CASE DATA
            </div>
            <div className="space-y-[4px]">
              {WORKFLOW_DATA_VARIABLES.case.map((variable) => (
                <div
                  key={variable.key}
                  className="flex items-center justify-between px-[8px] py-[6px] rounded-[4px] cursor-pointer transition-colors"
                  style={{ backgroundColor: colors.bgCardHover }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = colors.bgCard;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = colors.bgCardHover;
                  }}
                >
                  <div>
                    <div className="text-[10px] font-mono" style={{ color: colors.accent }}>
                      {`{{${variable.key}}}`}
                    </div>
                    <div className="text-[9px]" style={{ color: colors.textDim }}>
                      {variable.example}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Asset Variables */}
          <div>
            <div className="text-[10px] mb-[6px]" style={{ color: colors.textMuted, fontWeight: 600 }}>
              ASSET DATA
            </div>
            <div className="space-y-[4px]">
              {WORKFLOW_DATA_VARIABLES.asset.map((variable) => (
                <div
                  key={variable.key}
                  className="flex items-center justify-between px-[8px] py-[6px] rounded-[4px] cursor-pointer transition-colors"
                  style={{ backgroundColor: colors.bgCardHover }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = colors.bgCard;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = colors.bgCardHover;
                  }}
                >
                  <div>
                    <div className="text-[10px] font-mono" style={{ color: colors.accent }}>
                      {`{{${variable.key}}}`}
                    </div>
                    <div className="text-[9px]" style={{ color: colors.textDim }}>
                      {variable.example}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ================================================================
   STEP-SPECIFIC CONFIG FORMS
   ================================================================ */

/* ── Slack Configuration Form ── */
function SlackConfigForm({ step, onUpdate }: StepConfigurationFormProps) {
  return (
    <>
      <AISuggestionBox
        message="Use SOC workspace and #alerts channel. Mention @security-team for critical issues."
        onApply={() => {}}
      />

      <div>
        <label className="text-[11px] mb-[6px] block" style={{ color: colors.textMuted, fontWeight: 500 }}>
          Slack Workspace
        </label>
        <select
          className="w-full px-[12px] py-[8px] rounded-[6px] text-[12px]"
          style={{
            backgroundColor: colors.bgCardHover,
            border: `1px solid ${colors.border}`,
            color: colors.textPrimary,
          }}
        >
          <option>SOC Team Workspace</option>
          <option>Security Operations</option>
          <option>Incident Response</option>
        </select>
      </div>

      <div>
        <label className="text-[11px] mb-[6px] block" style={{ color: colors.textMuted, fontWeight: 500 }}>
          Channel
        </label>
        <input
          type="text"
          placeholder="#alerts"
          className="w-full px-[12px] py-[8px] rounded-[6px] text-[12px]"
          style={{
            backgroundColor: colors.bgCardHover,
            border: `1px solid ${colors.border}`,
            color: colors.textPrimary,
          }}
        />
      </div>

      <div>
        <label className="text-[11px] mb-[6px] block" style={{ color: colors.textMuted, fontWeight: 500 }}>
          Message Template
        </label>
        <TokenInput
          placeholder="🚨 New critical alert: {{alert.title}}"
          multiline
          rows={3}
          onChange={(value, tokens) => {
            console.log("Message updated:", value, tokens);
          }}
        />
        <div className="mt-[6px] text-[10px]" style={{ color: colors.textDim }}>
          Click "Insert Variable" or drag variables from the Workflow Data panel
        </div>
      </div>

      <div>
        <label className="text-[11px] mb-[6px] block" style={{ color: colors.textMuted, fontWeight: 500 }}>
          Mention Users
        </label>
        <input
          type="text"
          placeholder="@security-team, @on-call"
          className="w-full px-[12px] py-[8px] rounded-[6px] text-[12px]"
          style={{
            backgroundColor: colors.bgCardHover,
            border: `1px solid ${colors.border}`,
            color: colors.textPrimary,
          }}
        />
      </div>

      <div className="flex items-center justify-between">
        <label className="text-[11px]" style={{ color: colors.textMuted, fontWeight: 500 }}>
          Attach Case Link
        </label>
        <button
          className="relative inline-flex h-[20px] w-[36px] items-center rounded-full transition-colors"
          style={{ backgroundColor: colors.accent }}
        >
          <span className="inline-block h-[14px] w-[14px] translate-x-[18px] rounded-full bg-white transition-transform" />
        </button>
      </div>
    </>
  );
}

/* ── Create Case Configuration Form ── */
function CreateCaseConfigForm({ step, onUpdate }: StepConfigurationFormProps) {
  return (
    <>
      <AISuggestionBox
        message="Set severity to Critical for alerts with risk score > 8.0. Auto-assign to SOC L2 team."
        onApply={() => {}}
      />

      <div>
        <label className="text-[11px] mb-[6px] block" style={{ color: colors.textMuted, fontWeight: 500 }}>
          Case Title
        </label>
        <input
          type="text"
          placeholder="{{alert.title}} - Investigation"
          className="w-full px-[12px] py-[8px] rounded-[6px] text-[12px]"
          style={{
            backgroundColor: colors.bgCardHover,
            border: `1px solid ${colors.border}`,
            color: colors.textPrimary,
          }}
        />
      </div>

      <div>
        <label className="text-[11px] mb-[6px] block" style={{ color: colors.textMuted, fontWeight: 500 }}>
          Severity
        </label>
        <select
          className="w-full px-[12px] py-[8px] rounded-[6px] text-[12px]"
          style={{
            backgroundColor: colors.bgCardHover,
            border: `1px solid ${colors.border}`,
            color: colors.textPrimary,
          }}
        >
          <option>Match alert severity</option>
          <option>Critical</option>
          <option>High</option>
          <option>Medium</option>
          <option>Low</option>
        </select>
      </div>

      <div>
        <label className="text-[11px] mb-[6px] block" style={{ color: colors.textMuted, fontWeight: 500 }}>
          Assign To
        </label>
        <select
          className="w-full px-[12px] py-[8px] rounded-[6px] text-[12px]"
          style={{
            backgroundColor: colors.bgCardHover,
            border: `1px solid ${colors.border}`,
            color: colors.textPrimary,
          }}
        >
          <option>SOC L1 Team</option>
          <option>SOC L2 Team</option>
          <option>Incident Response Team</option>
          <option>Threat Intelligence Team</option>
          <option>Current user</option>
        </select>
      </div>

      <div className="flex items-center justify-between">
        <label className="text-[11px]" style={{ color: colors.textMuted, fontWeight: 500 }}>
          Attach Alert Evidence
        </label>
        <button
          className="relative inline-flex h-[20px] w-[36px] items-center rounded-full transition-colors"
          style={{ backgroundColor: colors.accent }}
        >
          <span className="inline-block h-[14px] w-[14px] translate-x-[18px] rounded-full bg-white transition-transform" />
        </button>
      </div>

      <div className="flex items-center justify-between">
        <label className="text-[11px]" style={{ color: colors.textMuted, fontWeight: 500 }}>
          Auto-open Investigation
        </label>
        <button
          className="relative inline-flex h-[20px] w-[36px] items-center rounded-full transition-colors"
          style={{ backgroundColor: colors.accent }}
        >
          <span className="inline-block h-[14px] w-[14px] translate-x-[18px] rounded-full bg-white transition-transform" />
        </button>
      </div>
    </>
  );
}

/* ── Alert Trigger Configuration Form ── */
function AlertTriggerConfigForm({ step, onUpdate }: StepConfigurationFormProps) {
  const [config, setConfig] = useState({
    source: "watch-center",
    severity: "critical",
    alertType: "any",
    assetScope: "all",
    condition: "new-alert",
  });

  const isComplete = config.severity !== "" && config.condition !== "";

  const updateConfig = (key: string, value: string) => {
    const newConfig = { ...config, [key]: value };
    setConfig(newConfig);
  };

  const getPreviewText = () => {
    const severityText = config.severity === "any" ? "any" : config.severity;
    const conditionText = {
      "new-alert": "a new",
      "alert-updated": "an updated",
      "alert-reopened": "a reopened",
    }[config.condition] || "a";
    const assetText = config.assetScope === "all" ? "any asset" : config.assetScope;
    
    return `This playbook will run when ${conditionText} ${severityText} Watch Center alert is created on ${assetText}.`;
  };

  return (
    <>
      {/* Trigger Summary Card */}
      <div
        className="rounded-[8px] p-[12px]"
        style={{
          backgroundColor: `${colors.accent}08`,
          border: `1px solid ${colors.accent}30`,
        }}
      >
        <div className="flex items-center gap-[6px] mb-[8px]">
          <AlertTriangle size={12} color={colors.accent} strokeWidth={2} />
          <span className="text-[10px] uppercase tracking-wide" style={{ color: colors.accent, fontWeight: 600 }}>
            Trigger Summary
          </span>
        </div>
        <div className="space-y-[4px]">
          <div className="flex items-center justify-between">
            <span className="text-[10px]" style={{ color: colors.textDim }}>Type:</span>
            <span className="text-[10px]" style={{ color: colors.textPrimary, fontWeight: 500 }}>Watch Center Alert</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[10px]" style={{ color: colors.textDim }}>Condition:</span>
            <span className="text-[10px]" style={{ color: colors.textPrimary, fontWeight: 500 }}>
              {config.condition === "new-alert" ? "New Alert" : config.condition === "alert-updated" ? "Alert Updated" : "Alert Reopened"}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[10px]" style={{ color: colors.textDim }}>Severity:</span>
            <span className="text-[10px]" style={{ color: colors.textPrimary, fontWeight: 500 }}>
              {config.severity.charAt(0).toUpperCase() + config.severity.slice(1)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[10px]" style={{ color: colors.textDim }}>Scope:</span>
            <span className="text-[10px]" style={{ color: colors.textPrimary, fontWeight: 500 }}>
              {config.assetScope === "all" ? "All Assets" : config.assetScope}
            </span>
          </div>
        </div>
      </div>

      {/* Validation Warning */}
      {!isComplete && (
        <div
          className="rounded-[8px] p-[10px]"
          style={{
            backgroundColor: `${colors.medium}08`,
            border: `1px solid ${colors.medium}30`,
          }}
        >
          <div className="flex items-start gap-[8px]">
            <AlertTriangle size={12} color={colors.medium} strokeWidth={2} className="mt-[1px] shrink-0" />
            <span className="text-[10px]" style={{ color: colors.medium, fontWeight: 500 }}>
              Complete Severity and Condition to activate this trigger.
            </span>
          </div>
        </div>
      )}

      <AISuggestionBox
        message="AI suggests: Critical severity + New alert condition for incident response playbooks."
        onApply={() => {
          updateConfig("severity", "critical");
          updateConfig("condition", "new-alert");
        }}
      />

      <div>
        <label className="text-[11px] mb-[6px] block" style={{ color: colors.textMuted, fontWeight: 500 }}>
          Trigger Source
        </label>
        <select
          value={config.source}
          onChange={(e) => updateConfig("source", e.target.value)}
          className="w-full px-[12px] py-[8px] rounded-[6px] text-[12px]"
          style={{
            backgroundColor: colors.bgCardHover,
            border: `1px solid ${colors.border}`,
            color: colors.textPrimary,
          }}
        >
          <option value="watch-center">Watch Center Alerts</option>
          <option value="siem">SIEM Alerts</option>
          <option value="edr">EDR Alerts</option>
        </select>
      </div>

      <div>
        <label className="text-[11px] mb-[6px] block" style={{ color: colors.textMuted, fontWeight: 500 }}>
          Severity
        </label>
        <select
          value={config.severity}
          onChange={(e) => updateConfig("severity", e.target.value)}
          className="w-full px-[12px] py-[8px] rounded-[6px] text-[12px]"
          style={{
            backgroundColor: colors.bgCardHover,
            border: `1px solid ${colors.border}`,
            color: colors.textPrimary,
          }}
        >
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
          <option value="any">Any</option>
        </select>
      </div>

      <div>
        <label className="text-[11px] mb-[6px] block" style={{ color: colors.textMuted, fontWeight: 500 }}>
          Alert Type
        </label>
        <select
          value={config.alertType}
          onChange={(e) => updateConfig("alertType", e.target.value)}
          className="w-full px-[12px] py-[8px] rounded-[6px] text-[12px]"
          style={{
            backgroundColor: colors.bgCardHover,
            border: `1px solid ${colors.border}`,
            color: colors.textPrimary,
          }}
        >
          <option value="any">Any</option>
          <option value="malware">Malware Detection</option>
          <option value="suspicious-login">Suspicious Login</option>
          <option value="privilege-escalation">Privilege Escalation</option>
          <option value="data-exfiltration">Data Exfiltration</option>
          <option value="lateral-movement">Lateral Movement</option>
        </select>
      </div>

      <div>
        <label className="text-[11px] mb-[6px] block" style={{ color: colors.textMuted, fontWeight: 500 }}>
          Asset Scope
        </label>
        <select
          value={config.assetScope}
          onChange={(e) => updateConfig("assetScope", e.target.value)}
          className="w-full px-[12px] py-[8px] rounded-[6px] text-[12px]"
          style={{
            backgroundColor: colors.bgCardHover,
            border: `1px solid ${colors.border}`,
            color: colors.textPrimary,
          }}
        >
          <option value="all">All Assets</option>
          <option value="servers">Servers</option>
          <option value="endpoints">Endpoints</option>
          <option value="cloud">Cloud Assets</option>
          <option value="critical-systems">Critical Systems</option>
        </select>
      </div>

      <div>
        <label className="text-[11px] mb-[6px] block" style={{ color: colors.textMuted, fontWeight: 500 }}>
          Condition
        </label>
        <select
          value={config.condition}
          onChange={(e) => updateConfig("condition", e.target.value)}
          className="w-full px-[12px] py-[8px] rounded-[6px] text-[12px]"
          style={{
            backgroundColor: colors.bgCardHover,
            border: `1px solid ${colors.border}`,
            color: colors.textPrimary,
          }}
        >
          <option value="new-alert">New Alert</option>
          <option value="alert-updated">Alert Updated</option>
          <option value="alert-reopened">Alert Reopened</option>
        </select>
      </div>

      {/* Preview */}
      <div
        className="rounded-[8px] p-[12px]"
        style={{
          backgroundColor: colors.bgCardHover,
          border: `1px solid ${colors.border}`,
        }}
      >
        <div className="flex items-start gap-[8px]">
          <Sparkles size={12} color={colors.accent} strokeWidth={2} className="mt-[1px] shrink-0" />
          <div>
            <div className="text-[10px] mb-[4px]" style={{ color: colors.textDim, fontWeight: 600 }}>
              TRIGGER PREVIEW
            </div>
            <p className="text-[11px]" style={{ color: colors.textSecondary, lineHeight: 1.5 }}>
              {getPreviewText()}
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

/* ── Vulnerability Detected Trigger Configuration Form ── */
function VulnerabilityDetectedTriggerForm({ step, onUpdate }: StepConfigurationFormProps) {
  const [config, setConfig] = useState({
    source: "vulnerability-scanner",
    severity: "critical",
    assetScope: "all",
    condition: "new-vulnerability",
  });

  const isComplete = config.severity !== "" && config.condition !== "";

  const updateConfig = (key: string, value: string) => {
    const newConfig = { ...config, [key]: value };
    setConfig(newConfig);
  };

  const getPreviewText = () => {
    const severityText = config.severity === "any" ? "any" : config.severity;
    const conditionText = {
      "new-vulnerability": "a new",
      "vulnerability-updated": "an updated",
      "vulnerability-reopened": "a reopened",
    }[config.condition] || "a";
    const assetText = config.assetScope === "all" ? "any asset" : config.assetScope;
    
    return `This playbook will run when ${conditionText} ${severityText} vulnerability is detected on ${assetText}.`;
  };

  return (
    <>
      {/* Trigger Summary Card */}
      <div
        className="rounded-[8px] p-[12px]"
        style={{
          backgroundColor: `${colors.accent}08`,
          border: `1px solid ${colors.accent}30`,
        }}
      >
        <div className="flex items-center gap-[6px] mb-[8px]">
          <AlertTriangle size={12} color={colors.accent} strokeWidth={2} />
          <span className="text-[10px] uppercase tracking-wide" style={{ color: colors.accent, fontWeight: 600 }}>
            Trigger Summary
          </span>
        </div>
        <div className="space-y-[4px]">
          <div className="flex items-center justify-between">
            <span className="text-[10px]" style={{ color: colors.textDim }}>Type:</span>
            <span className="text-[10px]" style={{ color: colors.textPrimary, fontWeight: 500 }}>Vulnerability Detection</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[10px]" style={{ color: colors.textDim }}>Condition:</span>
            <span className="text-[10px]" style={{ color: colors.textPrimary, fontWeight: 500 }}>
              {config.condition === "new-vulnerability" ? "New Vulnerability" : config.condition === "vulnerability-updated" ? "Vulnerability Updated" : "Vulnerability Reopened"}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[10px]" style={{ color: colors.textDim }}>Severity:</span>
            <span className="text-[10px]" style={{ color: colors.textPrimary, fontWeight: 500 }}>
              {config.severity.charAt(0).toUpperCase() + config.severity.slice(1)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[10px]" style={{ color: colors.textDim }}>Scope:</span>
            <span className="text-[10px]" style={{ color: colors.textPrimary, fontWeight: 500 }}>
              {config.assetScope === "all" ? "All Assets" : config.assetScope}
            </span>
          </div>
        </div>
      </div>

      {/* Validation Warning */}
      {!isComplete && (
        <div
          className="rounded-[8px] p-[10px]"
          style={{
            backgroundColor: `${colors.medium}08`,
            border: `1px solid ${colors.medium}30`,
          }}
        >
          <div className="flex items-start gap-[8px]">
            <AlertTriangle size={12} color={colors.medium} strokeWidth={2} className="mt-[1px] shrink-0" />
            <span className="text-[10px]" style={{ color: colors.medium, fontWeight: 500 }}>
              Complete Severity and Condition to activate this trigger.
            </span>
          </div>
        </div>
      )}

      <AISuggestionBox
        message="AI suggests: Critical severity + New vulnerability condition for incident response playbooks."
        onApply={() => {
          updateConfig("severity", "critical");
          updateConfig("condition", "new-vulnerability");
        }}
      />

      <div>
        <label className="text-[11px] mb-[6px] block" style={{ color: colors.textMuted, fontWeight: 500 }}>
          Trigger Source
        </label>
        <select
          value={config.source}
          onChange={(e) => updateConfig("source", e.target.value)}
          className="w-full px-[12px] py-[8px] rounded-[6px] text-[12px]"
          style={{
            backgroundColor: colors.bgCardHover,
            border: `1px solid ${colors.border}`,
            color: colors.textPrimary,
          }}
        >
          <option value="vulnerability-scanner">Vulnerability Scanner</option>
          <option value="siem">SIEM Alerts</option>
          <option value="edr">EDR Alerts</option>
        </select>
      </div>

      <div>
        <label className="text-[11px] mb-[6px] block" style={{ color: colors.textMuted, fontWeight: 500 }}>
          Severity
        </label>
        <select
          value={config.severity}
          onChange={(e) => updateConfig("severity", e.target.value)}
          className="w-full px-[12px] py-[8px] rounded-[6px] text-[12px]"
          style={{
            backgroundColor: colors.bgCardHover,
            border: `1px solid ${colors.border}`,
            color: colors.textPrimary,
          }}
        >
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
          <option value="any">Any</option>
        </select>
      </div>

      <div>
        <label className="text-[11px] mb-[6px] block" style={{ color: colors.textMuted, fontWeight: 500 }}>
          Asset Scope
        </label>
        <select
          value={config.assetScope}
          onChange={(e) => updateConfig("assetScope", e.target.value)}
          className="w-full px-[12px] py-[8px] rounded-[6px] text-[12px]"
          style={{
            backgroundColor: colors.bgCardHover,
            border: `1px solid ${colors.border}`,
            color: colors.textPrimary,
          }}
        >
          <option value="all">All Assets</option>
          <option value="servers">Servers</option>
          <option value="endpoints">Endpoints</option>
          <option value="cloud">Cloud Assets</option>
          <option value="critical-systems">Critical Systems</option>
        </select>
      </div>

      <div>
        <label className="text-[11px] mb-[6px] block" style={{ color: colors.textMuted, fontWeight: 500 }}>
          Condition
        </label>
        <select
          value={config.condition}
          onChange={(e) => updateConfig("condition", e.target.value)}
          className="w-full px-[12px] py-[8px] rounded-[6px] text-[12px]"
          style={{
            backgroundColor: colors.bgCardHover,
            border: `1px solid ${colors.border}`,
            color: colors.textPrimary,
          }}
        >
          <option value="new-vulnerability">New Vulnerability</option>
          <option value="vulnerability-updated">Vulnerability Updated</option>
          <option value="vulnerability-reopened">Vulnerability Reopened</option>
        </select>
      </div>

      {/* Preview */}
      <div
        className="rounded-[8px] p-[12px]"
        style={{
          backgroundColor: colors.bgCardHover,
          border: `1px solid ${colors.border}`,
        }}
      >
        <div className="flex items-start gap-[8px]">
          <Sparkles size={12} color={colors.accent} strokeWidth={2} className="mt-[1px] shrink-0" />
          <div>
            <div className="text-[10px] mb-[4px]" style={{ color: colors.textDim, fontWeight: 600 }}>
              TRIGGER PREVIEW
            </div>
            <p className="text-[11px]" style={{ color: colors.textSecondary, lineHeight: 1.5 }}>
              {getPreviewText()}
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

/* ── Asset Discovered Trigger Configuration Form ── */
function AssetDiscoveredTriggerForm({ step, onUpdate }: StepConfigurationFormProps) {
  const [config, setConfig] = useState({
    source: "asset-discovery",
    severity: "critical",
    assetScope: "all",
    condition: "new-asset",
  });

  const isComplete = config.severity !== "" && config.condition !== "";

  const updateConfig = (key: string, value: string) => {
    const newConfig = { ...config, [key]: value };
    setConfig(newConfig);
  };

  const getPreviewText = () => {
    const severityText = config.severity === "any" ? "any" : config.severity;
    const conditionText = {
      "new-asset": "a new",
      "asset-updated": "an updated",
      "asset-reopened": "a reopened",
    }[config.condition] || "a";
    const assetText = config.assetScope === "all" ? "any asset" : config.assetScope;
    
    return `This playbook will run when ${conditionText} ${severityText} asset is discovered on ${assetText}.`;
  };

  return (
    <>
      {/* Trigger Summary Card */}
      <div
        className="rounded-[8px] p-[12px]"
        style={{
          backgroundColor: `${colors.accent}08`,
          border: `1px solid ${colors.accent}30`,
        }}
      >
        <div className="flex items-center gap-[6px] mb-[8px]">
          <AlertTriangle size={12} color={colors.accent} strokeWidth={2} />
          <span className="text-[10px] uppercase tracking-wide" style={{ color: colors.accent, fontWeight: 600 }}>
            Trigger Summary
          </span>
        </div>
        <div className="space-y-[4px]">
          <div className="flex items-center justify-between">
            <span className="text-[10px]" style={{ color: colors.textDim }}>Type:</span>
            <span className="text-[10px]" style={{ color: colors.textPrimary, fontWeight: 500 }}>Asset Discovery</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[10px]" style={{ color: colors.textDim }}>Condition:</span>
            <span className="text-[10px]" style={{ color: colors.textPrimary, fontWeight: 500 }}>
              {config.condition === "new-asset" ? "New Asset" : config.condition === "asset-updated" ? "Asset Updated" : "Asset Reopened"}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[10px]" style={{ color: colors.textDim }}>Severity:</span>
            <span className="text-[10px]" style={{ color: colors.textPrimary, fontWeight: 500 }}>
              {config.severity.charAt(0).toUpperCase() + config.severity.slice(1)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[10px]" style={{ color: colors.textDim }}>Scope:</span>
            <span className="text-[10px]" style={{ color: colors.textPrimary, fontWeight: 500 }}>
              {config.assetScope === "all" ? "All Assets" : config.assetScope}
            </span>
          </div>
        </div>
      </div>

      {/* Validation Warning */}
      {!isComplete && (
        <div
          className="rounded-[8px] p-[10px]"
          style={{
            backgroundColor: `${colors.medium}08`,
            border: `1px solid ${colors.medium}30`,
          }}
        >
          <div className="flex items-start gap-[8px]">
            <AlertTriangle size={12} color={colors.medium} strokeWidth={2} className="mt-[1px] shrink-0" />
            <span className="text-[10px]" style={{ color: colors.medium, fontWeight: 500 }}>
              Complete Severity and Condition to activate this trigger.
            </span>
          </div>
        </div>
      )}

      <AISuggestionBox
        message="AI suggests: Critical severity + New asset condition for incident response playbooks."
        onApply={() => {
          updateConfig("severity", "critical");
          updateConfig("condition", "new-asset");
        }}
      />

      <div>
        <label className="text-[11px] mb-[6px] block" style={{ color: colors.textMuted, fontWeight: 500 }}>
          Trigger Source
        </label>
        <select
          value={config.source}
          onChange={(e) => updateConfig("source", e.target.value)}
          className="w-full px-[12px] py-[8px] rounded-[6px] text-[12px]"
          style={{
            backgroundColor: colors.bgCardHover,
            border: `1px solid ${colors.border}`,
            color: colors.textPrimary,
          }}
        >
          <option value="asset-discovery">Asset Discovery</option>
          <option value="siem">SIEM Alerts</option>
          <option value="edr">EDR Alerts</option>
        </select>
      </div>

      <div>
        <label className="text-[11px] mb-[6px] block" style={{ color: colors.textMuted, fontWeight: 500 }}>
          Severity
        </label>
        <select
          value={config.severity}
          onChange={(e) => updateConfig("severity", e.target.value)}
          className="w-full px-[12px] py-[8px] rounded-[6px] text-[12px]"
          style={{
            backgroundColor: colors.bgCardHover,
            border: `1px solid ${colors.border}`,
            color: colors.textPrimary,
          }}
        >
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
          <option value="any">Any</option>
        </select>
      </div>

      <div>
        <label className="text-[11px] mb-[6px] block" style={{ color: colors.textMuted, fontWeight: 500 }}>
          Asset Scope
        </label>
        <select
          value={config.assetScope}
          onChange={(e) => updateConfig("assetScope", e.target.value)}
          className="w-full px-[12px] py-[8px] rounded-[6px] text-[12px]"
          style={{
            backgroundColor: colors.bgCardHover,
            border: `1px solid ${colors.border}`,
            color: colors.textPrimary,
          }}
        >
          <option value="all">All Assets</option>
          <option value="servers">Servers</option>
          <option value="endpoints">Endpoints</option>
          <option value="cloud">Cloud Assets</option>
          <option value="critical-systems">Critical Systems</option>
        </select>
      </div>

      <div>
        <label className="text-[11px] mb-[6px] block" style={{ color: colors.textMuted, fontWeight: 500 }}>
          Condition
        </label>
        <select
          value={config.condition}
          onChange={(e) => updateConfig("condition", e.target.value)}
          className="w-full px-[12px] py-[8px] rounded-[6px] text-[12px]"
          style={{
            backgroundColor: colors.bgCardHover,
            border: `1px solid ${colors.border}`,
            color: colors.textPrimary,
          }}
        >
          <option value="new-asset">New Asset</option>
          <option value="asset-updated">Asset Updated</option>
          <option value="asset-reopened">Asset Reopened</option>
        </select>
      </div>

      {/* Preview */}
      <div
        className="rounded-[8px] p-[12px]"
        style={{
          backgroundColor: colors.bgCardHover,
          border: `1px solid ${colors.border}`,
        }}
      >
        <div className="flex items-start gap-[8px]">
          <Sparkles size={12} color={colors.accent} strokeWidth={2} className="mt-[1px] shrink-0" />
          <div>
            <div className="text-[10px] mb-[4px]" style={{ color: colors.textDim, fontWeight: 600 }}>
              TRIGGER PREVIEW
            </div>
            <p className="text-[11px]" style={{ color: colors.textSecondary, lineHeight: 1.5 }}>
              {getPreviewText()}
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

/* ── Case Created Trigger Configuration Form ── */
function CaseCreatedTriggerForm({ step, onUpdate }: StepConfigurationFormProps) {
  const [config, setConfig] = useState({
    source: "case-management",
    severity: "critical",
    assetScope: "all",
    condition: "new-case",
  });

  const isComplete = config.severity !== "" && config.condition !== "";

  const updateConfig = (key: string, value: string) => {
    const newConfig = { ...config, [key]: value };
    setConfig(newConfig);
  };

  const getPreviewText = () => {
    const severityText = config.severity === "any" ? "any" : config.severity;
    const conditionText = {
      "new-case": "a new",
      "case-updated": "an updated",
      "case-reopened": "a reopened",
    }[config.condition] || "a";
    const assetText = config.assetScope === "all" ? "any asset" : config.assetScope;
    
    return `This playbook will run when ${conditionText} ${severityText} case is created on ${assetText}.`;
  };

  return (
    <>
      {/* Trigger Summary Card */}
      <div
        className="rounded-[8px] p-[12px]"
        style={{
          backgroundColor: `${colors.accent}08`,
          border: `1px solid ${colors.accent}30`,
        }}
      >
        <div className="flex items-center gap-[6px] mb-[8px]">
          <AlertTriangle size={12} color={colors.accent} strokeWidth={2} />
          <span className="text-[10px] uppercase tracking-wide" style={{ color: colors.accent, fontWeight: 600 }}>
            Trigger Summary
          </span>
        </div>
        <div className="space-y-[4px]">
          <div className="flex items-center justify-between">
            <span className="text-[10px]" style={{ color: colors.textDim }}>Type:</span>
            <span className="text-[10px]" style={{ color: colors.textPrimary, fontWeight: 500 }}>Case Creation</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[10px]" style={{ color: colors.textDim }}>Condition:</span>
            <span className="text-[10px]" style={{ color: colors.textPrimary, fontWeight: 500 }}>
              {config.condition === "new-case" ? "New Case" : config.condition === "case-updated" ? "Case Updated" : "Case Reopened"}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[10px]" style={{ color: colors.textDim }}>Severity:</span>
            <span className="text-[10px]" style={{ color: colors.textPrimary, fontWeight: 500 }}>
              {config.severity.charAt(0).toUpperCase() + config.severity.slice(1)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[10px]" style={{ color: colors.textDim }}>Scope:</span>
            <span className="text-[10px]" style={{ color: colors.textPrimary, fontWeight: 500 }}>
              {config.assetScope === "all" ? "All Assets" : config.assetScope}
            </span>
          </div>
        </div>
      </div>

      {/* Validation Warning */}
      {!isComplete && (
        <div
          className="rounded-[8px] p-[10px]"
          style={{
            backgroundColor: `${colors.medium}08`,
            border: `1px solid ${colors.medium}30`,
          }}
        >
          <div className="flex items-start gap-[8px]">
            <AlertTriangle size={12} color={colors.medium} strokeWidth={2} className="mt-[1px] shrink-0" />
            <span className="text-[10px]" style={{ color: colors.medium, fontWeight: 500 }}>
              Complete Severity and Condition to activate this trigger.
            </span>
          </div>
        </div>
      )}

      <AISuggestionBox
        message="AI suggests: Critical severity + New case condition for incident response playbooks."
        onApply={() => {
          updateConfig("severity", "critical");
          updateConfig("condition", "new-case");
        }}
      />

      <div>
        <label className="text-[11px] mb-[6px] block" style={{ color: colors.textMuted, fontWeight: 500 }}>
          Trigger Source
        </label>
        <select
          value={config.source}
          onChange={(e) => updateConfig("source", e.target.value)}
          className="w-full px-[12px] py-[8px] rounded-[6px] text-[12px]"
          style={{
            backgroundColor: colors.bgCardHover,
            border: `1px solid ${colors.border}`,
            color: colors.textPrimary,
          }}
        >
          <option value="case-management">Case Management</option>
          <option value="siem">SIEM Alerts</option>
          <option value="edr">EDR Alerts</option>
        </select>
      </div>

      <div>
        <label className="text-[11px] mb-[6px] block" style={{ color: colors.textMuted, fontWeight: 500 }}>
          Severity
        </label>
        <select
          value={config.severity}
          onChange={(e) => updateConfig("severity", e.target.value)}
          className="w-full px-[12px] py-[8px] rounded-[6px] text-[12px]"
          style={{
            backgroundColor: colors.bgCardHover,
            border: `1px solid ${colors.border}`,
            color: colors.textPrimary,
          }}
        >
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
          <option value="any">Any</option>
        </select>
      </div>

      <div>
        <label className="text-[11px] mb-[6px] block" style={{ color: colors.textMuted, fontWeight: 500 }}>
          Asset Scope
        </label>
        <select
          value={config.assetScope}
          onChange={(e) => updateConfig("assetScope", e.target.value)}
          className="w-full px-[12px] py-[8px] rounded-[6px] text-[12px]"
          style={{
            backgroundColor: colors.bgCardHover,
            border: `1px solid ${colors.border}`,
            color: colors.textPrimary,
          }}
        >
          <option value="all">All Assets</option>
          <option value="servers">Servers</option>
          <option value="endpoints">Endpoints</option>
          <option value="cloud">Cloud Assets</option>
          <option value="critical-systems">Critical Systems</option>
        </select>
      </div>

      <div>
        <label className="text-[11px] mb-[6px] block" style={{ color: colors.textMuted, fontWeight: 500 }}>
          Condition
        </label>
        <select
          value={config.condition}
          onChange={(e) => updateConfig("condition", e.target.value)}
          className="w-full px-[12px] py-[8px] rounded-[6px] text-[12px]"
          style={{
            backgroundColor: colors.bgCardHover,
            border: `1px solid ${colors.border}`,
            color: colors.textPrimary,
          }}
        >
          <option value="new-case">New Case</option>
          <option value="case-updated">Case Updated</option>
          <option value="case-reopened">Case Reopened</option>
        </select>
      </div>

      {/* Preview */}
      <div
        className="rounded-[8px] p-[12px]"
        style={{
          backgroundColor: colors.bgCardHover,
          border: `1px solid ${colors.border}`,
        }}
      >
        <div className="flex items-start gap-[8px]">
          <Sparkles size={12} color={colors.accent} strokeWidth={2} className="mt-[1px] shrink-0" />
          <div>
            <div className="text-[10px] mb-[4px]" style={{ color: colors.textDim, fontWeight: 600 }}>
              TRIGGER PREVIEW
            </div>
            <p className="text-[11px]" style={{ color: colors.textSecondary, lineHeight: 1.5 }}>
              {getPreviewText()}
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

/* ── Scheduled Trigger Configuration Form ── */
function ScheduledTriggerForm({ step, onUpdate }: StepConfigurationFormProps) {
  const [config, setConfig] = useState({
    schedule: "daily",
    time: "08:00",
    timezone: "UTC",
  });

  const updateConfig = (key: string, value: string) => {
    const newConfig = { ...config, [key]: value };
    setConfig(newConfig);
  };

  const getPreviewText = () => {
    const scheduleText = config.schedule === "daily" ? "daily" : config.schedule;
    const timeText = config.time;
    const timezoneText = config.timezone;
    
    return `This playbook will run ${scheduleText} at ${timeText} ${timezoneText}.`;
  };

  return (
    <>
      {/* Trigger Summary Card */}
      <div
        className="rounded-[8px] p-[12px]"
        style={{
          backgroundColor: `${colors.accent}08`,
          border: `1px solid ${colors.accent}30`,
        }}
      >
        <div className="flex items-center gap-[6px] mb-[8px]">
          <AlertTriangle size={12} color={colors.accent} strokeWidth={2} />
          <span className="text-[10px] uppercase tracking-wide" style={{ color: colors.accent, fontWeight: 600 }}>
            Trigger Summary
          </span>
        </div>
        <div className="space-y-[4px]">
          <div className="flex items-center justify-between">
            <span className="text-[10px]" style={{ color: colors.textDim }}>Type:</span>
            <span className="text-[10px]" style={{ color: colors.textPrimary, fontWeight: 500 }}>Scheduled Trigger</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[10px]" style={{ color: colors.textDim }}>Schedule:</span>
            <span className="text-[10px]" style={{ color: colors.textPrimary, fontWeight: 500 }}>
              {config.schedule.charAt(0).toUpperCase() + config.schedule.slice(1)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[10px]" style={{ color: colors.textDim }}>Time:</span>
            <span className="text-[10px]" style={{ color: colors.textPrimary, fontWeight: 500 }}>
              {config.time}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[10px]" style={{ color: colors.textDim }}>Timezone:</span>
            <span className="text-[10px]" style={{ color: colors.textPrimary, fontWeight: 500 }}>
              {config.timezone}
            </span>
          </div>
        </div>
      </div>

      <AISuggestionBox
        message="AI suggests: Daily schedule at 08:00 UTC for routine checks."
        onApply={() => {
          updateConfig("schedule", "daily");
          updateConfig("time", "08:00");
          updateConfig("timezone", "UTC");
        }}
      />

      <div>
        <label className="text-[11px] mb-[6px] block" style={{ color: colors.textMuted, fontWeight: 500 }}>
          Schedule
        </label>
        <select
          value={config.schedule}
          onChange={(e) => updateConfig("schedule", e.target.value)}
          className="w-full px-[12px] py-[8px] rounded-[6px] text-[12px]"
          style={{
            backgroundColor: colors.bgCardHover,
            border: `1px solid ${colors.border}`,
            color: colors.textPrimary,
          }}
        >
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
        </select>
      </div>

      <div>
        <label className="text-[11px] mb-[6px] block" style={{ color: colors.textMuted, fontWeight: 500 }}>
          Time
        </label>
        <input
          type="time"
          value={config.time}
          onChange={(e) => updateConfig("time", e.target.value)}
          className="w-full px-[12px] py-[8px] rounded-[6px] text-[12px]"
          style={{
            backgroundColor: colors.bgCardHover,
            border: `1px solid ${colors.border}`,
            color: colors.textPrimary,
          }}
        />
      </div>

      <div>
        <label className="text-[11px] mb-[6px] block" style={{ color: colors.textMuted, fontWeight: 500 }}>
          Timezone
        </label>
        <select
          value={config.timezone}
          onChange={(e) => updateConfig("timezone", e.target.value)}
          className="w-full px-[12px] py-[8px] rounded-[6px] text-[12px]"
          style={{
            backgroundColor: colors.bgCardHover,
            border: `1px solid ${colors.border}`,
            color: colors.textPrimary,
          }}
        >
          <option value="UTC">UTC</option>
          <option value="America/New_York">America/New_York</option>
          <option value="Europe/London">Europe/London</option>
          <option value="Asia/Tokyo">Asia/Tokyo</option>
        </select>
      </div>

      {/* Preview */}
      <div
        className="rounded-[8px] p-[12px]"
        style={{
          backgroundColor: colors.bgCardHover,
          border: `1px solid ${colors.border}`,
        }}
      >
        <div className="flex items-start gap-[8px]">
          <Sparkles size={12} color={colors.accent} strokeWidth={2} className="mt-[1px] shrink-0" />
          <div>
            <div className="text-[10px] mb-[4px]" style={{ color: colors.textDim, fontWeight: 600 }}>
              TRIGGER PREVIEW
            </div>
            <p className="text-[11px]" style={{ color: colors.textSecondary, lineHeight: 1.5 }}>
              {getPreviewText()}
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

/* ── Manual Trigger Configuration Form ── */
function ManualTriggerForm({ step, onUpdate }: StepConfigurationFormProps) {
  const [config, setConfig] = useState({
    description: "Manual trigger for ad-hoc actions",
  });

  const updateConfig = (key: string, value: string) => {
    const newConfig = { ...config, [key]: value };
    setConfig(newConfig);
  };

  const getPreviewText = () => {
    const descriptionText = config.description;
    
    return `This playbook will run when manually triggered with the description: "${descriptionText}".`;
  };

  return (
    <>
      {/* Trigger Summary Card */}
      <div
        className="rounded-[8px] p-[12px]"
        style={{
          backgroundColor: `${colors.accent}08`,
          border: `1px solid ${colors.accent}30`,
        }}
      >
        <div className="flex items-center gap-[6px] mb-[8px]">
          <AlertTriangle size={12} color={colors.accent} strokeWidth={2} />
          <span className="text-[10px] uppercase tracking-wide" style={{ color: colors.accent, fontWeight: 600 }}>
            Trigger Summary
          </span>
        </div>
        <div className="space-y-[4px]">
          <div className="flex items-center justify-between">
            <span className="text-[10px]" style={{ color: colors.textDim }}>Type:</span>
            <span className="text-[10px]" style={{ color: colors.textPrimary, fontWeight: 500 }}>Manual Trigger</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[10px]" style={{ color: colors.textDim }}>Description:</span>
            <span className="text-[10px]" style={{ color: colors.textPrimary, fontWeight: 500 }}>
              {config.description}
            </span>
          </div>
        </div>
      </div>

      <AISuggestionBox
        message="AI suggests: Description as 'Manual trigger for ad-hoc actions'."
        onApply={() => {
          updateConfig("description", "Manual trigger for ad-hoc actions");
        }}
      />

      <div>
        <label className="text-[11px] mb-[6px] block" style={{ color: colors.textMuted, fontWeight: 500 }}>
          Description
        </label>
        <input
          type="text"
          value={config.description}
          onChange={(e) => updateConfig("description", e.target.value)}
          className="w-full px-[12px] py-[8px] rounded-[6px] text-[12px]"
          style={{
            backgroundColor: colors.bgCardHover,
            border: `1px solid ${colors.border}`,
            color: colors.textPrimary,
          }}
        />
      </div>

      {/* Preview */}
      <div
        className="rounded-[8px] p-[12px]"
        style={{
          backgroundColor: colors.bgCardHover,
          border: `1px solid ${colors.border}`,
        }}
      >
        <div className="flex items-start gap-[8px]">
          <Sparkles size={12} color={colors.accent} strokeWidth={2} className="mt-[1px] shrink-0" />
          <div>
            <div className="text-[10px] mb-[4px]" style={{ color: colors.textDim, fontWeight: 600 }}>
              TRIGGER PREVIEW
            </div>
            <p className="text-[11px]" style={{ color: colors.textSecondary, lineHeight: 1.5 }}>
              {getPreviewText()}
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

/* ── Notification Configuration Form ── */
function NotificationConfigForm({ step, onUpdate }: StepConfigurationFormProps) {
  return (
    <>
      <div>
        <label className="text-[11px] mb-[6px] block" style={{ color: colors.textMuted, fontWeight: 500 }}>
          Notification Channel
        </label>
        <select
          className="w-full px-[12px] py-[8px] rounded-[6px] text-[12px]"
          style={{
            backgroundColor: colors.bgCardHover,
            border: `1px solid ${colors.border}`,
            color: colors.textPrimary,
          }}
        >
          <option>Email</option>
          <option>SMS</option>
          <option>Push Notification</option>
          <option>PagerDuty</option>
        </select>
      </div>

      <div>
        <label className="text-[11px] mb-[6px] block" style={{ color: colors.textMuted, fontWeight: 500 }}>
          Recipients
        </label>
        <input
          type="text"
          placeholder="security-team@company.com"
          className="w-full px-[12px] py-[8px] rounded-[6px] text-[12px]"
          style={{
            backgroundColor: colors.bgCardHover,
            border: `1px solid ${colors.border}`,
            color: colors.textPrimary,
          }}
        />
      </div>

      <div>
        <label className="text-[11px] mb-[6px] block" style={{ color: colors.textMuted, fontWeight: 500 }}>
          Message
        </label>
        <textarea
          className="w-full px-[12px] py-[8px] rounded-[6px] text-[11px] resize-none"
          rows={4}
          placeholder="Critical security alert detected..."
          style={{
            backgroundColor: colors.bgCardHover,
            border: `1px solid ${colors.border}`,
            color: colors.textPrimary,
          }}
        />
      </div>
    </>
  );
}

/* ── Jira Configuration Form ── */
function JiraConfigForm({ step, onUpdate }: StepConfigurationFormProps) {
  return (
    <>
      <div>
        <label className="text-[11px] mb-[6px] block" style={{ color: colors.textMuted, fontWeight: 500 }}>
          Project
        </label>
        <select
          className="w-full px-[12px] py-[8px] rounded-[6px] text-[12px]"
          style={{
            backgroundColor: colors.bgCardHover,
            border: `1px solid ${colors.border}`,
            color: colors.textPrimary,
          }}
        >
          <option>Security Operations (SEC)</option>
          <option>Incident Response (IR)</option>
          <option>Vulnerability Management (VM)</option>
        </select>
      </div>

      <div>
        <label className="text-[11px] mb-[6px] block" style={{ color: colors.textMuted, fontWeight: 500 }}>
          Issue Type
        </label>
        <select
          className="w-full px-[12px] py-[8px] rounded-[6px] text-[12px]"
          style={{
            backgroundColor: colors.bgCardHover,
            border: `1px solid ${colors.border}`,
            color: colors.textPrimary,
          }}
        >
          <option>Bug</option>
          <option>Task</option>
          <option>Incident</option>
          <option>Security Finding</option>
        </select>
      </div>

      <div>
        <label className="text-[11px] mb-[6px] block" style={{ color: colors.textMuted, fontWeight: 500 }}>
          Summary
        </label>
        <input
          type="text"
          placeholder="{{alert.title}}"
          className="w-full px-[12px] py-[8px] rounded-[6px] text-[12px]"
          style={{
            backgroundColor: colors.bgCardHover,
            border: `1px solid ${colors.border}`,
            color: colors.textPrimary,
          }}
        />
      </div>

      <div>
        <label className="text-[11px] mb-[6px] block" style={{ color: colors.textMuted, fontWeight: 500 }}>
          Priority
        </label>
        <select
          className="w-full px-[12px] py-[8px] rounded-[6px] text-[12px]"
          style={{
            backgroundColor: colors.bgCardHover,
            border: `1px solid ${colors.border}`,
            color: colors.textPrimary,
          }}
        >
          <option>Highest</option>
          <option>High</option>
          <option>Medium</option>
          <option>Low</option>
        </select>
      </div>
    </>
  );
}

/* ── GitHub Configuration Form ── */
function GitHubConfigForm({ step, onUpdate }: StepConfigurationFormProps) {
  return (
    <>
      <div>
        <label className="text-[11px] mb-[6px] block" style={{ color: colors.textMuted, fontWeight: 500 }}>
          Action
        </label>
        <select
          className="w-full px-[12px] py-[8px] rounded-[6px] text-[12px]"
          style={{
            backgroundColor: colors.bgCardHover,
            border: `1px solid ${colors.border}`,
            color: colors.textPrimary,
          }}
        >
          <option>Create Issue</option>
          <option>Create Pull Request</option>
          <option>Add Comment</option>
          <option>Update Issue</option>
        </select>
      </div>

      <div>
        <label className="text-[11px] mb-[6px] block" style={{ color: colors.textMuted, fontWeight: 500 }}>
          Repository
        </label>
        <input
          type="text"
          placeholder="organization/repository"
          className="w-full px-[12px] py-[8px] rounded-[6px] text-[12px]"
          style={{
            backgroundColor: colors.bgCardHover,
            border: `1px solid ${colors.border}`,
            color: colors.textPrimary,
          }}
        />
      </div>

      <div>
        <label className="text-[11px] mb-[6px] block" style={{ color: colors.textMuted, fontWeight: 500 }}>
          Title
        </label>
        <input
          type="text"
          placeholder="Security vulnerability detected"
          className="w-full px-[12px] py-[8px] rounded-[6px] text-[12px]"
          style={{
            backgroundColor: colors.bgCardHover,
            border: `1px solid ${colors.border}`,
            color: colors.textPrimary,
          }}
        />
      </div>

      <div>
        <label className="text-[11px] mb-[6px] block" style={{ color: colors.textMuted, fontWeight: 500 }}>
          Labels
        </label>
        <input
          type="text"
          placeholder="security, critical, automated"
          className="w-full px-[12px] py-[8px] rounded-[6px] text-[12px]"
          style={{
            backgroundColor: colors.bgCardHover,
            border: `1px solid ${colors.border}`,
            color: colors.textPrimary,
          }}
        />
      </div>
    </>
  );
}

/* ── Condition Configuration Form ── */
function ConditionConfigForm({ step, onUpdate }: StepConfigurationFormProps) {
  return (
    <>
      <div>
        <label className="text-[11px] mb-[6px] block" style={{ color: colors.textMuted, fontWeight: 500 }}>
          Condition Type
        </label>
        <select
          className="w-full px-[12px] py-[8px] rounded-[6px] text-[12px]"
          style={{
            backgroundColor: colors.bgCardHover,
            border: `1px solid ${colors.border}`,
            color: colors.textPrimary,
          }}
        >
          <option>If severity is Critical</option>
          <option>If risk score &gt; threshold</option>
          <option>If asset type matches</option>
          <option>If time window matches</option>
          <option>Custom condition</option>
        </select>
      </div>

      <div>
        <label className="text-[11px] mb-[6px] block" style={{ color: colors.textMuted, fontWeight: 500 }}>
          Field
        </label>
        <select
          className="w-full px-[12px] py-[8px] rounded-[6px] text-[12px]"
          style={{
            backgroundColor: colors.bgCardHover,
            border: `1px solid ${colors.border}`,
            color: colors.textPrimary,
          }}
        >
          <option>Alert Severity</option>
          <option>Risk Score</option>
          <option>Asset Type</option>
          <option>Time of Day</option>
          <option>Alert Count</option>
        </select>
      </div>

      <div>
        <label className="text-[11px] mb-[6px] block" style={{ color: colors.textMuted, fontWeight: 500 }}>
          Operator
        </label>
        <select
          className="w-full px-[12px] py-[8px] rounded-[6px] text-[12px]"
          style={{
            backgroundColor: colors.bgCardHover,
            border: `1px solid ${colors.border}`,
            color: colors.textPrimary,
          }}
        >
          <option>equals</option>
          <option>greater than</option>
          <option>less than</option>
          <option>contains</option>
          <option>does not contain</option>
        </select>
      </div>

      <div>
        <label className="text-[11px] mb-[6px] block" style={{ color: colors.textMuted, fontWeight: 500 }}>
          Value
        </label>
        <input
          type="text"
          placeholder="Critical"
          className="w-full px-[12px] py-[8px] rounded-[6px] text-[12px]"
          style={{
            backgroundColor: colors.bgCardHover,
            border: `1px solid ${colors.border}`,
            color: colors.textPrimary,
          }}
        />
      </div>
    </>
  );
}

/* ── AI Enrichment Configuration Form ── */
function AIEnrichmentConfigForm({ step, onUpdate }: StepConfigurationFormProps) {
  return (
    <>
      <div>
        <label className="text-[11px] mb-[6px] block" style={{ color: colors.textMuted, fontWeight: 500 }}>
          Enrichment Type
        </label>
        <select
          className="w-full px-[12px] py-[8px] rounded-[6px] text-[12px]"
          style={{
            backgroundColor: colors.bgCardHover,
            border: `1px solid ${colors.border}`,
            color: colors.textPrimary,
          }}
        >
          <option>Threat Intelligence Lookup</option>
          <option>Asset Context Enrichment</option>
          <option>Attack Pattern Analysis</option>
          <option>Impact Assessment</option>
        </select>
      </div>

      <div>
        <label className="text-[11px] mb-[6px] block" style={{ color: colors.textMuted, fontWeight: 500 }}>
          Data Sources
        </label>
        <div className="space-y-[6px]">
          {["Threat Intel Feeds", "MITRE ATT&CK", "Asset Database", "Historical Incidents"].map((source) => (
            <label key={source} className="flex items-center gap-[8px] cursor-pointer">
              <input
                type="checkbox"
                defaultChecked
                className="rounded"
                style={{ accentColor: colors.accent }}
              />
              <span className="text-[11px]" style={{ color: colors.textSecondary }}>
                {source}
              </span>
            </label>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <label className="text-[11px]" style={{ color: colors.textMuted, fontWeight: 500 }}>
          Include Recommendations
        </label>
        <button
          className="relative inline-flex h-[20px] w-[36px] items-center rounded-full transition-colors"
          style={{ backgroundColor: colors.accent }}
        >
          <span className="inline-block h-[14px] w-[14px] translate-x-[18px] rounded-full bg-white transition-transform" />
        </button>
      </div>
    </>
  );
}

/* ── Update Asset Configuration Form ── */
function UpdateAssetConfigForm({ step, onUpdate }: StepConfigurationFormProps) {
  return (
    <>
      <div>
        <label className="text-[11px] mb-[6px] block" style={{ color: colors.textMuted, fontWeight: 500 }}>
          Asset Selection
        </label>
        <select
          className="w-full px-[12px] py-[8px] rounded-[6px] text-[12px]"
          style={{
            backgroundColor: colors.bgCardHover,
            border: `1px solid ${colors.border}`,
            color: colors.textPrimary,
          }}
        >
          <option>Alert source asset</option>
          <option>All affected assets</option>
          <option>Specific asset ID</option>
        </select>
      </div>

      <div>
        <label className="text-[11px] mb-[6px] block" style={{ color: colors.textMuted, fontWeight: 500 }}>
          Field to Update
        </label>
        <select
          className="w-full px-[12px] py-[8px] rounded-[6px] text-[12px]"
          style={{
            backgroundColor: colors.bgCardHover,
            border: `1px solid ${colors.border}`,
            color: colors.textPrimary,
          }}
        >
          <option>Risk Score</option>
          <option>Status</option>
          <option>Tags</option>
          <option>Owner</option>
          <option>Last Incident Date</option>
        </select>
      </div>

      <div>
        <label className="text-[11px] mb-[6px] block" style={{ color: colors.textMuted, fontWeight: 500 }}>
          New Value
        </label>
        <input
          type="text"
          placeholder="Enter new value"
          className="w-full px-[12px] py-[8px] rounded-[6px] text-[12px]"
          style={{
            backgroundColor: colors.bgCardHover,
            border: `1px solid ${colors.border}`,
            color: colors.textPrimary,
          }}
        />
      </div>
    </>
  );
}

/* ── Tag Resource Configuration Form ── */
function TagResourceConfigForm({ step, onUpdate }: StepConfigurationFormProps) {
  return (
    <>
      <div>
        <label className="text-[11px] mb-[6px] block" style={{ color: colors.textMuted, fontWeight: 500 }}>
          Resource Type
        </label>
        <select
          className="w-full px-[12px] py-[8px] rounded-[6px] text-[12px]"
          style={{
            backgroundColor: colors.bgCardHover,
            border: `1px solid ${colors.border}`,
            color: colors.textPrimary,
          }}
        >
          <option>Alert source asset</option>
          <option>Case</option>
          <option>Investigation</option>
          <option>Alert</option>
        </select>
      </div>

      <div>
        <label className="text-[11px] mb-[6px] block" style={{ color: colors.textMuted, fontWeight: 500 }}>
          Tags to Add
        </label>
        <input
          type="text"
          placeholder="high-priority, investigated, escalated"
          className="w-full px-[12px] py-[8px] rounded-[6px] text-[12px]"
          style={{
            backgroundColor: colors.bgCardHover,
            border: `1px solid ${colors.border}`,
            color: colors.textPrimary,
          }}
        />
        <div className="mt-[6px] text-[10px]" style={{ color: colors.textDim }}>
          Separate multiple tags with commas
        </div>
      </div>

      <div className="flex items-center justify-between">
        <label className="text-[11px]" style={{ color: colors.textMuted, fontWeight: 500 }}>
          Remove Existing Tags
        </label>
        <button
          className="relative inline-flex h-[20px] w-[36px] items-center rounded-full transition-colors"
          style={{ backgroundColor: colors.border }}
        >
          <span className="inline-block h-[14px] w-[14px] translate-x-[4px] rounded-full bg-white transition-transform" />
        </button>
      </div>
    </>
  );
}

/* ── Generic Configuration Form (Fallback) ── */
function GenericConfigForm({ step, onUpdate }: StepConfigurationFormProps) {
  return (
    <div
      className="rounded-[8px] p-[14px]"
      style={{
        backgroundColor: `${colors.textDim}08`,
        border: `1px solid ${colors.border}`,
      }}
    >
      <p className="text-[11px] text-center" style={{ color: colors.textMuted }}>
        No configuration required for this step type.
      </p>
    </div>
  );
}