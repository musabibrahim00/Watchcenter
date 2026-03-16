/**
 * Step Summary — Simplified step configuration view
 *
 * Shows step configuration as simple readable summaries
 * Users can edit via AI instead of complex forms
 */

import React from "react";
import { Sparkles, AlertTriangle, FileText, MessageSquare, User, Database } from "lucide-react";
import { colors } from "../../shared/design-system/tokens";

/* ================================================================
   TYPES
   ================================================================ */

interface StepSummaryProps {
  stepTemplateId: string;
  onEditWithAI: () => void;
}

/* ================================================================
   STEP SUMMARIES
   ================================================================ */

function AlertTriggerSummary({ onEditWithAI }: { onEditWithAI: () => void }) {
  return (
    <div className="space-y-[12px]">
      <div>
        <div className="text-[10px] mb-[6px]" style={{ color: colors.textDim, fontWeight: 600 }}>
          TRIGGER CONFIGURATION
        </div>
        <div className="space-y-[6px]">
          <div className="flex items-center justify-between">
            <span className="text-[11px]" style={{ color: colors.textMuted }}>
              Severity
            </span>
            <span className="text-[11px]" style={{ color: colors.textPrimary, fontWeight: 500 }}>
              Critical
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[11px]" style={{ color: colors.textMuted }}>
              Condition
            </span>
            <span className="text-[11px]" style={{ color: colors.textPrimary, fontWeight: 500 }}>
              New Alert
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[11px]" style={{ color: colors.textMuted }}>
              Scope
            </span>
            <span className="text-[11px]" style={{ color: colors.textPrimary, fontWeight: 500 }}>
              All Assets
            </span>
          </div>
        </div>
      </div>

      <div
        className="rounded-[8px] p-[10px]"
        style={{
          backgroundColor: colors.bgCardHover,
          border: `1px solid ${colors.border}`,
        }}
      >
        <div className="flex items-start gap-[8px]">
          <AlertTriangle size={12} color={colors.accent} strokeWidth={2} className="mt-[1px] shrink-0" />
          <p className="text-[10px]" style={{ color: colors.textSecondary, lineHeight: 1.5 }}>
            This workflow runs when a new <strong>Critical</strong> alert is detected on any asset.
          </p>
        </div>
      </div>

      <button
        onClick={onEditWithAI}
        className="w-full flex items-center justify-center gap-[6px] py-[8px] rounded-[6px] text-[11px] transition-colors"
        style={{
          backgroundColor: `${colors.accent}15`,
          border: `1px solid ${colors.accent}`,
          color: colors.accent,
          fontWeight: 600,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = `${colors.accent}25`;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = `${colors.accent}15`;
        }}
      >
        <Sparkles size={12} strokeWidth={2} />
        Edit with AI
      </button>
    </div>
  );
}

function CreateCaseSummary({ onEditWithAI }: { onEditWithAI: () => void }) {
  return (
    <div className="space-y-[12px]">
      <div>
        <div className="text-[10px] mb-[6px]" style={{ color: colors.textDim, fontWeight: 600 }}>
          CASE DETAILS
        </div>
        <div className="space-y-[6px]">
          <div className="flex items-center justify-between">
            <span className="text-[11px]" style={{ color: colors.textMuted }}>
              Case Type
            </span>
            <span className="text-[11px]" style={{ color: colors.textPrimary, fontWeight: 500 }}>
              Investigation
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[11px]" style={{ color: colors.textMuted }}>
              Priority
            </span>
            <span className="text-[11px]" style={{ color: colors.textPrimary, fontWeight: 500 }}>
              Inherit from Alert
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[11px]" style={{ color: colors.textMuted }}>
              Title
            </span>
            <span className="text-[11px]" style={{ color: colors.textPrimary, fontWeight: 500 }}>
              Alert: {`{{alert.title}}`}
            </span>
          </div>
        </div>
      </div>

      <div
        className="rounded-[8px] p-[10px]"
        style={{
          backgroundColor: colors.bgCardHover,
          border: `1px solid ${colors.border}`,
        }}
      >
        <div className="flex items-start gap-[8px]">
          <FileText size={12} color={colors.accent} strokeWidth={2} className="mt-[1px] shrink-0" />
          <p className="text-[10px]" style={{ color: colors.textSecondary, lineHeight: 1.5 }}>
            Creates an investigation case with details from the triggering alert.
          </p>
        </div>
      </div>

      <button
        onClick={onEditWithAI}
        className="w-full flex items-center justify-center gap-[6px] py-[8px] rounded-[6px] text-[11px] transition-colors"
        style={{
          backgroundColor: `${colors.accent}15`,
          border: `1px solid ${colors.accent}`,
          color: colors.accent,
          fontWeight: 600,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = `${colors.accent}25`;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = `${colors.accent}15`;
        }}
      >
        <Sparkles size={12} strokeWidth={2} />
        Edit with AI
      </button>
    </div>
  );
}

function NotifySlackSummary({ onEditWithAI }: { onEditWithAI: () => void }) {
  return (
    <div className="space-y-[12px]">
      <div>
        <div className="text-[10px] mb-[6px]" style={{ color: colors.textDim, fontWeight: 600 }}>
          NOTIFICATION SETTINGS
        </div>
        <div className="space-y-[6px]">
          <div className="flex items-center justify-between">
            <span className="text-[11px]" style={{ color: colors.textMuted }}>
              Channel
            </span>
            <span className="text-[11px]" style={{ color: colors.textPrimary, fontWeight: 500 }}>
              #critical-alerts
            </span>
          </div>
          <div className="flex items-start justify-between">
            <span className="text-[11px] shrink-0" style={{ color: colors.textMuted }}>
              Message
            </span>
            <span className="text-[11px] text-right" style={{ color: colors.textPrimary, fontWeight: 500 }}>
              🚨 Alert: {`{{alert.title}}`}
            </span>
          </div>
        </div>
      </div>

      <div
        className="rounded-[8px] p-[10px]"
        style={{
          backgroundColor: colors.bgCardHover,
          border: `1px solid ${colors.border}`,
        }}
      >
        <div className="flex items-start gap-[8px]">
          <MessageSquare size={12} color={colors.accent} strokeWidth={2} className="mt-[1px] shrink-0" />
          <p className="text-[10px]" style={{ color: colors.textSecondary, lineHeight: 1.5 }}>
            Sends a Slack notification to <strong>#critical-alerts</strong> with alert details.
          </p>
        </div>
      </div>

      <button
        onClick={onEditWithAI}
        className="w-full flex items-center justify-center gap-[6px] py-[8px] rounded-[6px] text-[11px] transition-colors"
        style={{
          backgroundColor: `${colors.accent}15`,
          border: `1px solid ${colors.accent}`,
          color: colors.accent,
          fontWeight: 600,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = `${colors.accent}25`;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = `${colors.accent}15`;
        }}
      >
        <Sparkles size={12} strokeWidth={2} />
        Edit with AI
      </button>
    </div>
  );
}

function EnrichAlertSummary({ onEditWithAI }: { onEditWithAI: () => void }) {
  return (
    <div className="space-y-[12px]">
      <div>
        <div className="text-[10px] mb-[6px]" style={{ color: colors.textDim, fontWeight: 600 }}>
          ENRICHMENT SOURCES
        </div>
        <div className="space-y-[6px]">
          <div className="flex items-center justify-between">
            <span className="text-[11px]" style={{ color: colors.textMuted }}>
              Threat Intel
            </span>
            <span className="text-[11px]" style={{ color: colors.textPrimary, fontWeight: 500 }}>
              VirusTotal, AbuseIPDB
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[11px]" style={{ color: colors.textMuted }}>
              Asset Context
            </span>
            <span className="text-[11px]" style={{ color: colors.textPrimary, fontWeight: 500 }}>
              CMDB, Asset Register
            </span>
          </div>
        </div>
      </div>

      <div
        className="rounded-[8px] p-[10px]"
        style={{
          backgroundColor: colors.bgCardHover,
          border: `1px solid ${colors.border}`,
        }}
      >
        <div className="flex items-start gap-[8px]">
          <Database size={12} color={colors.accent} strokeWidth={2} className="mt-[1px] shrink-0" />
          <p className="text-[10px]" style={{ color: colors.textSecondary, lineHeight: 1.5 }}>
            Enriches alert with threat intelligence and asset context from multiple sources.
          </p>
        </div>
      </div>

      <button
        onClick={onEditWithAI}
        className="w-full flex items-center justify-center gap-[6px] py-[8px] rounded-[6px] text-[11px] transition-colors"
        style={{
          backgroundColor: `${colors.accent}15`,
          border: `1px solid ${colors.accent}`,
          color: colors.accent,
          fontWeight: 600,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = `${colors.accent}25`;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = `${colors.accent}15`;
        }}
      >
        <Sparkles size={12} strokeWidth={2} />
        Edit with AI
      </button>
    </div>
  );
}

function AssignAnalystSummary({ onEditWithAI }: { onEditWithAI: () => void }) {
  return (
    <div className="space-y-[12px]">
      <div>
        <div className="text-[10px] mb-[6px]" style={{ color: colors.textDim, fontWeight: 600 }}>
          ASSIGNMENT RULES
        </div>
        <div className="space-y-[6px]">
          <div className="flex items-center justify-between">
            <span className="text-[11px]" style={{ color: colors.textMuted }}>
              Team
            </span>
            <span className="text-[11px]" style={{ color: colors.textPrimary, fontWeight: 500 }}>
              SOC Tier 1
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[11px]" style={{ color: colors.textMuted }}>
              Distribution
            </span>
            <span className="text-[11px]" style={{ color: colors.textPrimary, fontWeight: 500 }}>
              Round Robin
            </span>
          </div>
        </div>
      </div>

      <div
        className="rounded-[8px] p-[10px]"
        style={{
          backgroundColor: colors.bgCardHover,
          border: `1px solid ${colors.border}`,
        }}
      >
        <div className="flex items-start gap-[8px]">
          <User size={12} color={colors.accent} strokeWidth={2} className="mt-[1px] shrink-0" />
          <p className="text-[10px]" style={{ color: colors.textSecondary, lineHeight: 1.5 }}>
            Assigns the case to <strong>SOC Tier 1</strong> team using round-robin distribution.
          </p>
        </div>
      </div>

      <button
        onClick={onEditWithAI}
        className="w-full flex items-center justify-center gap-[6px] py-[8px] rounded-[6px] text-[11px] transition-colors"
        style={{
          backgroundColor: `${colors.accent}15`,
          border: `1px solid ${colors.accent}`,
          color: colors.accent,
          fontWeight: 600,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = `${colors.accent}25`;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = `${colors.accent}15`;
        }}
      >
        <Sparkles size={12} strokeWidth={2} />
        Edit with AI
      </button>
    </div>
  );
}

function DefaultSummary({ onEditWithAI }: { onEditWithAI: () => void }) {
  return (
    <div className="space-y-[12px]">
      <div
        className="rounded-[8px] p-[10px]"
        style={{
          backgroundColor: colors.bgCardHover,
          border: `1px solid ${colors.border}`,
        }}
      >
        <p className="text-[10px]" style={{ color: colors.textSecondary, lineHeight: 1.5 }}>
          This step is configured and ready to use.
        </p>
      </div>

      <button
        onClick={onEditWithAI}
        className="w-full flex items-center justify-center gap-[6px] py-[8px] rounded-[6px] text-[11px] transition-colors"
        style={{
          backgroundColor: `${colors.accent}15`,
          border: `1px solid ${colors.accent}`,
          color: colors.accent,
          fontWeight: 600,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = `${colors.accent}25`;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = `${colors.accent}15`;
        }}
      >
        <Sparkles size={12} strokeWidth={2} />
        Edit with AI
      </button>
    </div>
  );
}

/* ================================================================
   MAIN COMPONENT
   ================================================================ */

export function StepSummary({ stepTemplateId, onEditWithAI }: StepSummaryProps) {
  switch (stepTemplateId) {
    case "alert-trigger":
      return <AlertTriggerSummary onEditWithAI={onEditWithAI} />;
    case "create-case":
      return <CreateCaseSummary onEditWithAI={onEditWithAI} />;
    case "notify-slack":
      return <NotifySlackSummary onEditWithAI={onEditWithAI} />;
    case "enrich-alert":
      return <EnrichAlertSummary onEditWithAI={onEditWithAI} />;
    case "assign-analyst":
      return <AssignAnalystSummary onEditWithAI={onEditWithAI} />;
    default:
      return <DefaultSummary onEditWithAI={onEditWithAI} />;
  }
}
