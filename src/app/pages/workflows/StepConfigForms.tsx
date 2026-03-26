/**
 * Step Configuration Forms — Type-aware form-based configuration
 *
 * No-code analyst-friendly configuration panels for workflow steps
 * Includes data mapping panel and data preview for SOC playbooks
 */


import React, { useState } from "react";
import { AlertTriangle, Link2, Database, ChevronDown, Sparkles } from "lucide-react";
import { colors } from "../../shared/design-system/tokens";
import type { WorkflowStep } from "./types";
import {
  SlackConfigForm, CreateCaseConfigForm, AlertTriggerConfigForm,
  VulnerabilityDetectedTriggerForm, AssetDiscoveredTriggerForm, CaseCreatedTriggerForm,
  ScheduledTriggerForm, ManualTriggerForm, NotificationConfigForm,
  JiraConfigForm, GitHubConfigForm, ConditionConfigForm,
  AIEnrichmentConfigForm, UpdateAssetConfigForm, TagResourceConfigForm, GenericConfigForm,
} from "./StepFormComponents";

export interface StepConfigurationFormProps {
  step: WorkflowStep;
  onUpdate: (updates: Partial<WorkflowStep>) => void;
}

/* ================================================================
   WORKFLOW DATA VARIABLES
   ================================================================ */

export const WORKFLOW_DATA_VARIABLES = {
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
