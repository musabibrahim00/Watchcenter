/**
 * Workflows Module — Main Entry Point
 * ====================================
 *
 * Unified automation hub with 2 top-level tabs:
 *   1. Workspace — operational area (workflows, runs, debug, settings)
 *   2. Library   — segmented sections (Templates, Actions, Flows, Resources, Integrations)
 *
 * Time Travel is consumed from the global TimeTravelContext (Section 1).
 */

import React, { useState, useMemo, useCallback, useEffect } from "react";
import {
  Search, MoreVertical, Play, Copy, Edit3, Power, Trash2,
  Zap, CheckCircle2, SlidersHorizontal, Activity,
  BookOpen, Bug, Download, Globe, Sparkles,
  ArrowRight, Star, Layers, Code2, Database,
  FileText, Settings as SettingsIcon,
  Shield, Bell, User as UserIcon, X, Plug, Loader2, Clock,
  HelpCircle, TrendingUp,
} from "lucide-react";
import { toast } from "sonner";
import { colors } from "../../shared/design-system/tokens";
import {
  HUB_ITEMS, INTEGRATIONS, HUB_STATS,
  type HubItem, type HubItemKind, type HubSource,
} from "../../shared/data/hubData";
import { useTimeTravel } from "../../shared/contexts/TimeTravelContext";

import RunsTab from "./tabs/RunsTab";
import DebugTab from "./tabs/DebugTab";
import SettingsTab from "./tabs/SettingsTab";
import WorkflowBuilder from "./WorkflowBuilder";
import { PlaybookEngineProvider, usePlaybookEngine } from "./engine";
import { getStepTemplatesForWorkflow } from "./mockStepExecutions";
import type { WorkflowRun } from "./types";
import { useAiBox } from "../../features/ai-box";
import { buildWorkflowAiContext } from "./workflowAiStates";
import { IntegrationRequiredModal } from "./IntegrationRequiredModal";
import { IntegrationSetupModal } from "./IntegrationSetupModal";

/* ================================================================
   TYPES
   ================================================================ */

type TopTab = "workspace" | "library";
type WorkflowTab = "workflow" | "runs" | "debug" | "settings";
type LibrarySegment = "templates" | "actions" | "flows" | "resources" | "integrations";
type WorkflowStatus = "running" | "completed" | "approval_required" | "disabled";
interface WorkflowCard {
  id: string;
  title: string;
  description: string;
  tags: string[];
  status: WorkflowStatus;
  runCount?: number;
  lastRun?: string;
  actions?: string[]; // Actions the workflow will perform
}

/* ================================================================
   MOCK DATA — WORKFLOWS
   ================================================================ */

const WORKSPACE_WORKFLOWS: WorkflowCard[] = [
  { id: "wf-1", title: "Critical Alert Auto-Response", description: "Automatically create cases and notify SOC team when critical severity alerts are detected in Watch Center.", tags: ["Alerts", "Case Management", "Automation"], status: "running", runCount: 142, lastRun: "2 hours ago", actions: ["Enrich alert data", "Create investigation case", "Send Slack notification"] },
  { id: "wf-2", title: "Vulnerability Remediation Flow", description: "Track vulnerability patches from detection through validation with automatic ticket creation and owner assignment.", tags: ["Vulnerabilities", "Remediation", "Compliance"], status: "running", runCount: 89, lastRun: "5 hours ago", actions: ["Scan for vulnerabilities", "Create JIRA tickets", "Assign to owners", "Track patch status"] },
  { id: "wf-3", title: "Asset Discovery Enrichment", description: "Automatically enrich newly discovered assets with CMDB metadata, owner assignment, and security posture assessment.", tags: ["Asset Management", "Discovery", "Enrichment"], status: "approval_required", runCount: 56, lastRun: "1 day ago", actions: ["Query CMDB for asset data", "Assign asset owner", "Run security posture scan", "Update asset registry"] },
  { id: "wf-4", title: "AWS Actions", description: "Workflow outlining steps to perform various actions on Amazon Web Services environments.", tags: ["Provisioning", "Asset Decommissioning", "Access Management"], status: "completed", runCount: 203, lastRun: "3 days ago", actions: ["Validate AWS credentials", "Execute AWS API calls", "Log actions to audit trail"] },
  { id: "wf-5", title: "Risk Escalation Pipeline", description: "Escalate high-risk assets and findings to security leadership with automated reporting and notification.", tags: ["Risk Management", "Escalation", "Reporting"], status: "disabled", runCount: 12, lastRun: "1 week ago", actions: ["Calculate risk scores", "Generate escalation report", "Notify security leadership", "Create executive summary"] },
  { id: "wf-6", title: "Compliance Check Automation", description: "Run scheduled compliance checks across cloud infrastructure and generate audit-ready reports.", tags: ["Compliance", "Auditing", "Reporting"], status: "running", runCount: 76, lastRun: "6 hours ago", actions: ["Run compliance scans", "Check policy violations", "Generate audit reports", "Send compliance dashboard updates"] },
];

const WF_STATS = { running: 100, completed: 85, approvalRequired: 15 };



/* ================================================================
   LIBRARY KIND METADATA
   ================================================================ */

const KIND_META: Record<HubItemKind, { icon: typeof Code2; label: string; color: string }> = {
  script:        { icon: Code2,    label: "Action",     color: colors.buttonPrimary },
  flow:          { icon: Layers,   label: "Flow",       color: colors.active },
  template:      { icon: FileText, label: "Template",   color: colors.accent },
  resource_type: { icon: Database, label: "Resource",   color: "#A855F7" },
};

const SOURCE_META: Record<HubSource, { label: string; color: string }> = {
  official:  { label: "Official",  color: colors.accent },
  community: { label: "Community", color: colors.active },
  workspace: { label: "Workspace", color: colors.medium },
};

/* ================================================================
   SHARED HELPER COMPONENTS
   ================================================================ */

function StatusBadge({ status }: { status: WorkflowStatus }) {
  const map: Record<WorkflowStatus, { bg: string; text: string; border: string; label: string }> = {
    running: { bg: `${colors.active}12`, text: colors.active, border: `${colors.active}30`, label: "Running" },
    completed: { bg: `${colors.textMuted}12`, text: colors.textMuted, border: `${colors.textMuted}30`, label: "Completed" },
    approval_required: { bg: `${colors.medium}12`, text: colors.medium, border: `${colors.medium}30`, label: "Approval Required" },
    disabled: { bg: `${colors.textDim}12`, text: colors.textDim, border: `${colors.textDim}30`, label: "Disabled" },
  };
  const s = map[status];
  return (
    <div className="inline-flex items-center px-[8px] py-[3px] rounded-[5px] text-[10px]" style={{ backgroundColor: s.bg, color: s.text, border: `1px solid ${s.border}`, fontWeight: 500 }}>
      {s.label}
    </div>
  );
}

function Tag({ label }: { label: string }) {
  return (
    <div className="inline-flex items-center px-[8px] py-[3px] rounded-[5px] text-[10px]" style={{ backgroundColor: "rgba(255,255,255,0.04)", color: colors.textMuted, border: `1px solid ${colors.border}`, fontWeight: 500 }}>
      {label}
    </div>
  );
}

function IntegrationDot({ color, size = 10 }: { color: string; size?: number }) {
  return <div className="rounded-full shrink-0" style={{ width: size, height: size, backgroundColor: color }} />;
}

/* ================================================================
   WORKFLOW CARD COMPONENT (Section 10)
   ================================================================ */

function WorkflowCardComp({ workflow, onClick, onEdit, readOnly }: {
  workflow: WorkflowCard;
  onClick: () => void;
  onEdit?: () => void;
  readOnly?: boolean;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="rounded-[10px] p-[16px] transition-all cursor-pointer relative"
      style={{ backgroundColor: hovered ? colors.bgCardHover : colors.bgCard, border: `1px solid ${colors.border}` }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-[10px]">
        <div className="flex items-center gap-[8px] flex-1 pr-[8px]">
          <h3 className="text-[13px]" style={{ color: colors.textPrimary, fontWeight: 600 }}>{workflow.title}</h3>
          {readOnly && (
            <span className="text-[8px] uppercase tracking-[0.06em] px-[5px] py-[1px] rounded-[3px] shrink-0" style={{ backgroundColor: `${colors.medium}12`, color: colors.medium, fontWeight: 600 }}>Snapshot</span>
          )}
        </div>
        <div className="relative">
          <button onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen); }} className="size-[24px] rounded-[6px] flex items-center justify-center transition-colors" style={{ backgroundColor: menuOpen ? colors.bgCardHover : "transparent" }} onMouseEnter={(e) => { if (!menuOpen) e.currentTarget.style.backgroundColor = colors.bgCardHover; }} onMouseLeave={(e) => { if (!menuOpen) e.currentTarget.style.backgroundColor = "transparent"; }}>
            <MoreVertical size={14} color={colors.textMuted} strokeWidth={2} />
          </button>
          {menuOpen && (
            <>
              <div className="fixed inset-0 z-[40]" onClick={(e) => { e.stopPropagation(); setMenuOpen(false); }} />
              <div className="absolute top-[28px] right-0 z-[50] rounded-[8px] py-[4px] min-w-[140px]" style={{ backgroundColor: colors.bgCard, border: `1px solid ${colors.border}`, boxShadow: "0 8px 24px rgba(0,0,0,0.4)" }}>
                {(readOnly
                  ? [{ icon: Play, label: "View Workflow", color: colors.textSecondary, action: onClick }]
                  : [
                      { icon: Play, label: "Open Workflow", color: colors.textSecondary, action: onClick },
                      { icon: Edit3, label: "Edit", color: colors.textSecondary, action: onEdit },
                      { icon: Copy, label: "Duplicate", color: colors.textSecondary, action: undefined },
                      { icon: Power, label: workflow.status === "disabled" ? "Enable" : "Disable", color: colors.textSecondary, action: undefined },
                      { icon: Trash2, label: "Delete", color: colors.critical, action: undefined },
                    ]
                ).map((item) => {
                  const Icon = item.icon;
                  return (
                    <button key={item.label} onClick={(e) => { e.stopPropagation(); setMenuOpen(false); item.action?.(); }} className="w-full flex items-center gap-[10px] px-[12px] py-[7px] text-left transition-colors" style={{ color: item.color }} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = colors.bgCardHover; }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}>
                      <Icon size={13} strokeWidth={2} />
                      <span className="text-[12px]" style={{ fontWeight: 500 }}>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
      <p className="text-[11px] leading-[1.5] mb-[12px] line-clamp-2" style={{ color: colors.textMuted }}>{workflow.description}</p>
      <div className="flex flex-wrap gap-[6px] mb-[12px]">{workflow.tags.map((tag) => <Tag key={tag} label={tag} />)}</div>
      <div className="flex items-center justify-between pt-[10px]" style={{ borderTop: `1px solid ${colors.divider}` }}>
        <StatusBadge status={workflow.status} />
        {workflow.runCount !== undefined && (
          <div className="flex items-center gap-[12px]">
            <span className="text-[10px]" style={{ color: colors.textDim }}>{workflow.runCount} runs</span>
            {workflow.lastRun && <span className="text-[10px]" style={{ color: colors.textDim }}>{workflow.lastRun}</span>}
          </div>
        )}
      </div>
    </div>
  );
}

/* ================================================================
   LIBRARY ITEM CARD COMPONENT
   ================================================================ */

const LibraryItemCard = React.memo(function LibraryItemCard({
  item, onSelect,
}: { item: HubItem; onSelect: (item: HubItem) => void }) {
  const [hovered, setHovered] = useState(false);
  const km = KIND_META[item.kind];
  const Icon = km.icon;
  const integration = item.integration ? INTEGRATIONS.find(i => i.slug === item.integration) : undefined;

  return (
    <div
      className="rounded-[10px] p-[16px] transition-all cursor-pointer relative"
      style={{ backgroundColor: hovered ? colors.bgCardHover : colors.bgCard, border: `1px solid ${hovered ? colors.borderHover : colors.border}` }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onSelect(item)}
    >
      <div className="flex items-start gap-[12px] mb-[10px]">
        <div className="size-[34px] rounded-[8px] flex items-center justify-center shrink-0" style={{ backgroundColor: `${km.color}12` }}>
          <Icon size={16} color={km.color} strokeWidth={2} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-[6px] mb-[3px] flex-wrap">
            <h3 className="text-[13px] truncate" style={{ color: colors.textPrimary, fontWeight: 600 }}>{item.title}</h3>
            {item.verified && (
              <span className="inline-flex items-center gap-[3px] text-[9px]" style={{ color: colors.active, fontWeight: 600 }}>
                <CheckCircle2 size={9} strokeWidth={2.5} />Verified
              </span>
            )}
          </div>
          <div className="flex items-center gap-[6px]">
            <span className="inline-flex items-center gap-[4px] px-[6px] py-[2px] rounded-[4px] text-[9px] shrink-0"
              style={{ backgroundColor: `${SOURCE_META[item.source].color}12`, color: SOURCE_META[item.source].color, fontWeight: 600 }}>
              {SOURCE_META[item.source].label}
            </span>
            <span className="inline-flex items-center gap-[4px] px-[6px] py-[2px] rounded-[4px] text-[9px] shrink-0"
              style={{ backgroundColor: `${km.color}12`, color: km.color, fontWeight: 600 }}>
              {km.label}
            </span>
            {integration && (
              <span className="inline-flex items-center gap-[4px] text-[9px]" style={{ color: colors.textDim }}>
                <IntegrationDot color={integration.color} size={7} />
                {integration.name}
              </span>
            )}
          </div>
        </div>
      </div>
      <p className="text-[11px] leading-[1.5] mb-[12px] line-clamp-2" style={{ color: colors.textMuted }}>{item.description}</p>
      <div className="flex flex-wrap gap-[5px] mb-[12px]">
        {item.tags.map(tag => (
          <span key={tag} className="inline-flex items-center px-[7px] py-[2px] rounded-[5px] text-[9px]"
            style={{ backgroundColor: "rgba(255,255,255,0.04)", color: colors.textDim, border: `1px solid ${colors.border}`, fontWeight: 500 }}>
            {tag}
          </span>
        ))}
      </div>
      <div className="flex items-center justify-between pt-[10px]" style={{ borderTop: `1px solid ${colors.divider}` }}>
        <div className="flex items-center gap-[12px]">
          <span className="inline-flex items-center gap-[3px] text-[10px]" style={{ color: colors.textDim }}>
            <Download size={10} strokeWidth={2} />{item.downloads.toLocaleString()}
          </span>
          {item.kind !== "resource_type" && (
            <span className="inline-flex items-center gap-[3px] text-[10px]" style={{ color: colors.textDim }}>
              <Star size={10} strokeWidth={2} />{item.stars}
            </span>
          )}
          <span className="text-[10px]" style={{ color: colors.textDim }}>v{item.version}</span>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onSelect(item); }}
          className="flex items-center gap-[4px] rounded-[6px] px-[10px] py-[5px] text-[10px] transition-colors cursor-pointer"
          style={{ backgroundColor: "transparent", border: `1px solid ${colors.border}`, color: colors.textSecondary, fontWeight: 500 }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = colors.bgCardHover; e.currentTarget.style.borderColor = colors.accent; e.currentTarget.style.color = colors.accent; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.borderColor = colors.border; e.currentTarget.style.color = colors.textSecondary; }}
        >
          <ArrowRight size={10} strokeWidth={2} />Use
        </button>
      </div>
    </div>
  );
});

/* ================================================================
   INTEGRATION CARD (for Library integrations view)
   ================================================================ */

const IntegrationCard = React.memo(function IntegrationCard({
  integration, isSelected, onClick,
}: { integration: typeof INTEGRATIONS[0]; isSelected: boolean; onClick: () => void }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-[12px] rounded-[10px] p-[14px] text-left transition-all cursor-pointer"
      style={{
        backgroundColor: isSelected ? `${integration.color}08` : hovered ? colors.bgCardHover : colors.bgCard,
        border: `1px solid ${isSelected ? `${integration.color}40` : colors.border}`,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="size-[36px] rounded-[8px] flex items-center justify-center shrink-0" style={{ backgroundColor: `${integration.color}15` }}>
        <IntegrationDot color={integration.color} size={14} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[12px] mb-[2px] truncate" style={{ color: colors.textPrimary, fontWeight: 600 }}>{integration.name}</div>
        <div className="text-[10px] truncate" style={{ color: colors.textMuted }}>{integration.description}</div>
      </div>
      <div className="text-[10px] shrink-0" style={{ color: colors.textDim }}>{integration.itemCount}</div>
    </button>
  );
});

/* ================================================================
   WORKFLOW-SCOPED TAB NAV
   ================================================================ */

const WORKFLOW_TABS: { key: WorkflowTab; label: string; icon: typeof Zap }[] = [
  { key: "workflow", label: "Workflow", icon: Layers },
  { key: "runs", label: "Runs", icon: Activity },
  { key: "debug", label: "Debug", icon: Bug },
  { key: "settings", label: "Settings", icon: SettingsIcon },
];

/* ================================================================
   LIBRARY SEGMENT TABS (Section 2 — segmented navigation)
   ================================================================ */

const LIBRARY_SEGMENTS: { key: LibrarySegment; label: string; icon: typeof Code2; count: number }[] = [
  { key: "templates", label: "Templates", icon: FileText, count: HUB_STATS.templates },
  { key: "actions", label: "Actions", icon: Code2, count: HUB_STATS.scripts },
  { key: "flows", label: "Flows", icon: Layers, count: HUB_STATS.flows },
  { key: "resources", label: "Resources", icon: Database, count: HUB_STATS.resourceTypes },
  { key: "integrations", label: "Integrations", icon: Globe, count: HUB_STATS.integrations },
];

/* ================================================================
   LIBRARY TEMPLATES (for quick-start)
   ================================================================ */

interface LibraryTemplate {
  id: string;
  title: string;
  description: string;
  tags: string[];
  prompt: string;
  icon: typeof Zap;
  color: string;
  featured?: boolean;
}

const LIBRARY_TEMPLATES: LibraryTemplate[] = [
  { id: "tpl-1", title: "Create Case on Critical Alert", description: "Automatically create investigation cases when critical severity alerts are detected, with enrichment and team notification.", tags: ["Alerts", "Case Management", "SOC"], prompt: "Create case when critical alert appears in Watch Center, enrich with threat intel, request SOC approval, and notify Slack", icon: Shield, color: colors.accent, featured: true },
  { id: "tpl-2", title: "Alert Enrichment Workflow", description: "Enrich incoming alerts with threat intelligence, CMDB data, and risk scoring before routing to the SOC team.", tags: ["Enrichment", "Threat Intel", "Alerts"], prompt: "Create alert enrichment workflow that queries threat intelligence, enriches with CMDB data, scores risk, and routes to SOC", icon: Bug, color: "#EF4444", featured: true },
  { id: "tpl-3", title: "Vulnerability Notification", description: "Notify stakeholders when high-risk vulnerabilities are discovered, with automatic ticket creation and escalation.", tags: ["Vulnerabilities", "Notifications", "Escalation"], prompt: "Notify security team when high-risk vulnerability is found, create JIRA ticket, and escalate if unpatched after 48 hours", icon: Bell, color: "#F59E0B" },
  { id: "tpl-4", title: "Weekly Compliance Report", description: "Generate and distribute automated weekly compliance reports with posture metrics, violations, and remediation progress.", tags: ["Compliance", "Reporting", "Scheduled"], prompt: "Send weekly compliance report with posture metrics, violations, and remediation progress to compliance team and leadership", icon: FileText, color: "#3B82F6" },
  { id: "tpl-5", title: "Asset Onboarding Automation", description: "Automate new asset onboarding with discovery scanning, CMDB registration, owner assignment, and security baseline.", tags: ["Asset Management", "Onboarding", "Discovery"], prompt: "Create asset onboarding workflow with initial scan, CMDB registration, owner assignment, and security posture baseline", icon: Database, color: "#10B981" },
  { id: "tpl-6", title: "Access Provisioning Workflow", description: "Streamline access provisioning requests with validation, manager approval, automated provisioning, and audit logging.", tags: ["IAM", "Provisioning", "Access Management"], prompt: "Create access provisioning workflow with request validation, manager approval, automated provisioning, and audit logging", icon: UserIcon, color: "#A855F7" },
];

/* ================================================================
   RUN CONFIRMATION MODAL
   ================================================================ */

function RunConfirmationModal({
  workflow,
  onConfirm,
  onCancel,
  isExecuting,
}: {
  workflow: WorkflowCard;
  onConfirm: () => void;
  onCancel: () => void;
  isExecuting?: boolean;
}) {
  const stepTemplates = getStepTemplatesForWorkflow(workflow.id);

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[100]"
        style={{ backgroundColor: "rgba(0, 0, 0, 0.6)" }}
        onClick={isExecuting ? undefined : onCancel}
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
        <div className="flex items-start justify-between mb-[20px]">
          <div>
            <h3 className="text-[16px] mb-[4px]" style={{ color: colors.textPrimary, fontWeight: 600 }}>
              Run Workflow
            </h3>
            <p className="text-[12px]" style={{ color: colors.textMuted }}>
              Manual execution of <span style={{ color: colors.textSecondary, fontWeight: 500 }}>{workflow.title}</span>
            </p>
          </div>
          {!isExecuting && (
            <button
              onClick={onCancel}
              className="size-[28px] rounded-[6px] flex items-center justify-center transition-colors cursor-pointer shrink-0"
              style={{ color: colors.textDim }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = colors.bgCardHover; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
            >
              <X size={16} strokeWidth={2} />
            </button>
          )}
        </div>

        {/* Execution Steps */}
        <div className="mb-[20px]">
          <div className="text-[11px] uppercase tracking-[0.06em] mb-[10px]" style={{ color: colors.textDim, fontWeight: 600 }}>
            Execution Steps ({stepTemplates.length})
          </div>
          <div
            className="rounded-[8px] overflow-hidden"
            style={{
              border: `1px solid ${colors.border}`,
              background: colors.bgApp,
            }}
          >
            {stepTemplates.map((step, idx) => (
              <div
                key={idx}
                className="flex items-center gap-[12px] px-[14px] py-[10px]"
                style={{
                  borderBottom: idx < stepTemplates.length - 1 ? `1px solid ${colors.border}` : undefined,
                }}
              >
                {/* Step number */}
                <div
                  className="size-[22px] rounded-full flex items-center justify-center shrink-0 text-[11px]"
                  style={{
                    background: `${colors.accent}15`,
                    color: colors.accent,
                    fontWeight: 600,
                  }}
                >
                  {idx + 1}
                </div>

                {/* Step name */}
                <span className="flex-1 text-[13px]" style={{ color: colors.textSecondary, fontWeight: 500 }}>
                  {step.stepName}
                </span>

                {/* Integration pill */}
                <span
                  className="inline-flex items-center gap-[4px] px-[8px] py-[2px] rounded-[10px] text-[10px] shrink-0"
                  style={{
                    background: "rgba(7, 100, 152, 0.12)",
                    color: colors.low,
                    border: `1px solid rgba(7, 100, 152, 0.2)`,
                    fontWeight: 500,
                  }}
                >
                  <Plug size={9} />
                  {step.integrationUsed}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Trigger info */}
        <div
          className="rounded-[8px] px-[14px] py-[10px] mb-[20px] flex items-center gap-[10px]"
          style={{
            background: `${colors.accent}08`,
            border: `1px solid ${colors.accent}20`,
          }}
        >
          <UserIcon size={14} color={colors.accent} />
          <span className="text-[12px]" style={{ color: colors.textMuted }}>
            Trigger: <span style={{ color: colors.textSecondary, fontWeight: 500 }}>Manual</span> — executed by current user
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-[10px]">
          <button
            onClick={onCancel}
            disabled={isExecuting}
            className="rounded-[8px] px-[18px] py-[9px] text-[13px] transition-colors cursor-pointer"
            style={{
              backgroundColor: "transparent",
              border: `1px solid ${colors.border}`,
              color: colors.textSecondary,
              fontWeight: 500,
              opacity: isExecuting ? 0.5 : 1,
              cursor: isExecuting ? "not-allowed" : "pointer",
            }}
            onMouseEnter={(e) => {
              if (!isExecuting) e.currentTarget.style.backgroundColor = colors.bgCardHover;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
            }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isExecuting}
            className="flex items-center gap-[8px] rounded-[8px] px-[18px] py-[9px] text-[13px] transition-colors cursor-pointer"
            style={{
              backgroundColor: isExecuting ? colors.buttonPrimaryActive : colors.buttonPrimary,
              color: "#fff",
              fontWeight: 600,
              cursor: isExecuting ? "not-allowed" : "pointer",
            }}
            onMouseEnter={(e) => {
              if (!isExecuting) e.currentTarget.style.backgroundColor = colors.buttonPrimaryHover;
            }}
            onMouseLeave={(e) => {
              if (!isExecuting) e.currentTarget.style.backgroundColor = colors.buttonPrimary;
            }}
          >
            {isExecuting ? (
              <>
                <Loader2 size={14} strokeWidth={2} className="animate-spin" />
                Starting...
              </>
            ) : (
              <>
                <Play size={14} strokeWidth={2} />
                Run Now
              </>
            )}
          </button>
        </div>
      </div>
    </>
  );
}

/* ================================================================
   MAIN COMPONENT — default export wraps with PlaybookEngineProvider
   ================================================================ */

export default function WorkflowsIndexPage() {
  return (
    <PlaybookEngineProvider>
      <WorkflowsIndexPageInner />
    </PlaybookEngineProvider>
  );
}

function WorkflowsIndexPageInner() {
  const { isActive: timeTravelActive } = useTimeTravel();
  const aiBox = useAiBox();
  const openAiBox = aiBox.openWithContext;
  const setAiBoxPageContext = aiBox.setPageContext;

  /* ── Top-level tab state ── */
  const [activeTab, setActiveTab] = useState<TopTab>("workspace");

  /* ── Workspace state ── */
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<WorkflowStatus | "all">("all");
  const [showFilterMenu, setShowFilterMenu] = useState(false);

  /* ── Workflow detail state ── */
  const [openWorkflowId, setOpenWorkflowId] = useState<string | null>(null);
  const [workflowTab, setWorkflowTab] = useState<WorkflowTab>("workflow");
  const [debugRunId, setDebugRunId] = useState<string | null>(null);
  const [debugSelectedRun, setDebugSelectedRun] = useState<WorkflowRun | null>(null);

  /* ── Library state (Section 2) ── */
  const [librarySegment, setLibrarySegment] = useState<LibrarySegment>("templates");
  const [librarySearch, setLibrarySearch] = useState("");
  const [sourceFilter, setSourceFilter] = useState<HubSource | "all">("all");
  const [showSourceMenu, setShowSourceMenu] = useState(false);
  const [integrationFilter, setIntegrationFilter] = useState<string | null>(null);

  /* ── Dynamically created workflows (from template creation) ── */
  const [createdWorkflows, setCreatedWorkflows] = useState<WorkflowCard[]>([]);
  /** All workflows: static + dynamically created from templates */
  const allWorkflows = useMemo(() => [...WORKSPACE_WORKFLOWS, ...createdWorkflows], [createdWorkflows]);

  /* ── Run workflow modal state ── */
  const [showRunModal, setShowRunModal] = useState(false);
  const [showActionsMenu, setShowActionsMenu] = useState(false);
  const [isExecutingRun, setIsExecutingRun] = useState(false);

  /* ── Template creation integration check state ── */
  const [pendingTemplateCreation, setPendingTemplateCreation] = useState<{
    templateName: string;
    steps: Array<{ id: string; templateId: string; name: string; type: string; integration?: string }>;
    mode: "create" | "customize";
  } | null>(null);
  const [showTemplateIntegrationModal, setShowTemplateIntegrationModal] = useState(false);
  const [showTemplateSetupModal, setShowTemplateSetupModal] = useState(false);
  const [templateSetupType, setTemplateSetupType] = useState<string | null>(null);
  const [templateSetupOriginalName, setTemplateSetupOriginalName] = useState<string | null>(null);
  const [templateConnectedIntegrations, setTemplateConnectedIntegrations] = useState<string[]>([]);

  /* ── Playbook Engine ── */
  const { manualRun: engineManualRun, getRunsForPlaybook, version } = usePlaybookEngine();

  /* ── AI-driven workflow creation (replaces WorkflowCreator overlay) ── */
  const openNewWorkflowAI = useCallback(() => {
    openAiBox(buildWorkflowAiContext({
      state: "create",
      workflowId: "new",
      workflowName: "New Workflow",
    }));
  }, [openAiBox]);

  const openTemplateAI = useCallback((templateName: string, templatePrompt?: string) => {
    const ctx = buildWorkflowAiContext({
      state: "library",
      workflowId: `library:${templateName}`,
      workflowName: templateName,
    });

    // Build a template-specific greeting from the prompt — explains what the
    // workflow does in plain bullet points so the analyst can review & customize
    // before committing.  No initialQuery is sent (no auto-fire).
    if (templatePrompt) {
      // Strip "Create/Build … workflow that/with" preamble when present,
      // otherwise keep the full prompt so verbs like Notify stay intact.
      const stripped = templatePrompt
        .replace(/^(?:create|build|set\s+up)\s+[\w\s]*?workflow\s+(?:that|with)\s+/i, "");

      const actions = stripped
        .split(/,\s*(?:and\s+)?|\s+and\s+/)
        .map(s => s.trim())
        .filter(s => s.length > 0)
        .map(s => s.charAt(0).toUpperCase() + s.slice(1));

      const bullets = actions.map(a => `- ${a}`).join("\n");
      const greeting =
        `I have **${templateName}** loaded. Here's what this workflow will do:\n\n` +
        bullets +
        `\n\nYou can ask me to customize it before creating it — for example, change the trigger, add an approval step, or switch notification targets.`;

      openAiBox({ ...ctx, greeting, initialQuery: undefined });
    } else {
      openAiBox(ctx);
    }
  }, [openAiBox]);

  /** Check if there's a currently active (queued/running) run for the open workflow */
  const hasActiveRun = useMemo(() => {
    if (!openWorkflowId) return false;
    const runs = getRunsForPlaybook(openWorkflowId);
    return runs.some(r => r.status === "queued" || r.status === "running");
  }, [openWorkflowId, getRunsForPlaybook, version]);

  // Ref to avoid stale closure in useEffect
  const currentWorkflowRef = React.useRef(true);

  /** Push workflow / library context to global AIBox based on active view */
  useEffect(() => {
    // Workspace workflow detail — push tab-aware context
    if (activeTab === "workspace" && openWorkflowId && currentWorkflowRef.current) {
      const wf = allWorkflows.find(w => w.id === openWorkflowId);
      if (!wf) return;

      // Debug tab → diagnose state with debug-specific context
      if (workflowTab === "debug") {
        const ctx = buildWorkflowAiContext({
          state: "diagnose",
          workflowId: `${openWorkflowId}:debug${debugSelectedRun ? `:${debugSelectedRun.id}` : ""}`,
          workflowName: wf.title,
        });
        setAiBoxPageContext({
          ...ctx,
          greeting: debugSelectedRun
            ? `I have **run ${debugSelectedRun.id}** loaded for **${wf.title}**. I can help you understand what happened, identify errors, and suggest fixes.`
            : `I'm ready to help debug **${wf.title}**. Select a run from the list, or ask me about recent failures and errors.`,
          suggestions: [
            { label: "Why did the last run fail?", prompt: "Why is this workflow failing?" },
            { label: "Find bottlenecks", prompt: "Find bottleneck steps in this workflow" },
            { label: "Check integrations", prompt: "Check integrations for this workflow" },
            { label: "Summarize workflow health", prompt: "Summarize workflow health" },
          ],
        });
        return;
      }

      // Runs tab → diagnose state with runs-specific context
      if (workflowTab === "runs") {
        const ctx = buildWorkflowAiContext({
          state: "diagnose",
          workflowId: `${openWorkflowId}:runs`,
          workflowName: wf.title,
        });
        setAiBoxPageContext({
          ...ctx,
          greeting: `I can help you understand the execution history of **${wf.title}** — recent runs, failure patterns, and performance trends.\n\nAsk me anything or pick a suggestion below.`,
          suggestions: [
            { label: "Show recent runs", prompt: "Show recent workflow runs" },
            { label: "Why is this workflow failing?", prompt: "Why is this workflow failing?" },
            { label: "Summarize run history", prompt: "Summarize workflow health" },
            { label: "Find failed runs", prompt: "Show recent workflow runs" },
          ],
        });
        return;
      }

      // Settings tab → explain state with settings-specific context
      if (workflowTab === "settings") {
        const ctx = buildWorkflowAiContext({
          state: "explain",
          workflowId: `${openWorkflowId}:settings`,
          workflowName: wf.title,
        });
        setAiBoxPageContext({
          ...ctx,
          greeting: `I can help you configure **${wf.title}** — integrations, variables, secrets, and environment settings.\n\nAsk me anything or pick a suggestion below.`,
          suggestions: [
            { label: "What integrations are needed?", prompt: "Check integrations for this workflow" },
            { label: "Explain workflow variables", prompt: "Explain what variables this workflow uses" },
            { label: "Help configure secrets", prompt: "What secrets does this workflow need?" },
            { label: "Explain environments", prompt: "Explain how environments work for this workflow" },
          ],
        });
        return;
      }

      // Default: workflow tab → explain state
      setAiBoxPageContext(buildWorkflowAiContext({
        state: "explain",
        workflowId: `${openWorkflowId}:${workflowTab}`,
        workflowName: wf.title,
      }));
      return;
    }

    // Library tab — push ambient library context
    if (activeTab === "library") {
      setAiBoxPageContext(buildWorkflowAiContext({
        state: "library",
        workflowId: `library-browse:${librarySegment}`,
        workflowName: "Template Library",
      }));
      return;
    }

    // Default — clear context
    setAiBoxPageContext(null);
  }, [activeTab, openWorkflowId, workflowTab, librarySegment, setAiBoxPageContext, allWorkflows, debugSelectedRun]);

  /* ── Workspace: workflow filtering ── */
  const filteredWorkflows = useMemo(() => {
    const q = searchQuery.toLowerCase();
    let result = allWorkflows;
    if (statusFilter !== "all") result = result.filter((wf) => wf.status === statusFilter);
    if (q) result = result.filter((wf) => wf.title.toLowerCase().includes(q) || wf.description.toLowerCase().includes(q) || wf.tags.some((t) => t.toLowerCase().includes(q)));
    return result;
  }, [searchQuery, statusFilter, allWorkflows]);

  /* ── Library: item filtering ── */
  const segmentToKind: Record<LibrarySegment, HubItemKind | null> = {
    templates: "template",
    actions: "script",
    flows: "flow",
    resources: "resource_type",
    integrations: null,
  };

  const filteredLibraryItems = useMemo(() => {
    let items = HUB_ITEMS;
    const kind = segmentToKind[librarySegment];
    if (kind) {
      items = items.filter(i => i.kind === kind);
    }
    if (sourceFilter !== "all") {
      items = items.filter(i => i.source === sourceFilter);
    }
    if (integrationFilter) {
      items = items.filter(i => i.integration === integrationFilter);
    }
    if (librarySearch) {
      const q = librarySearch.toLowerCase();
      items = items.filter(i =>
        i.title.toLowerCase().includes(q) ||
        i.description.toLowerCase().includes(q) ||
        i.tags.some(t => t.toLowerCase().includes(q)) ||
        i.author.toLowerCase().includes(q) ||
        (i.integration && i.integration.toLowerCase().includes(q))
      );
    }
    return items;
  }, [librarySegment, sourceFilter, integrationFilter, librarySearch]);

  const handleDebugRun = useCallback((runId: string) => {
    setDebugRunId(runId);
    setWorkflowTab("debug");
  }, []);

  const handleDebugAskAI = useCallback((context: { runId: string; workflowName: string; error?: string }) => {
    const debugQuery = context.error
      ? `Help me debug run ${context.runId} for "${context.workflowName}". Error: ${context.error}`
      : `Help me debug run ${context.runId} for "${context.workflowName}"`;
    const ctx = buildWorkflowAiContext({
      state: "diagnose",
      workflowId: context.runId,
      workflowName: context.workflowName,
    });
    openAiBox({
      ...ctx,
      greeting: `Analyzing run **${context.runId}** for **${context.workflowName}**...`,
      initialQuery: debugQuery,
    });
  }, [openAiBox]);

  /** Runs tab — "Ask AI" button handler for a specific run */
  const handleRunsAskAI = useCallback((run: WorkflowRun) => {
    const wf = allWorkflows.find(w => w.id === openWorkflowId);
    const workflowName = wf?.title || "Workflow";
    const hasError = run.status === "failed";
    const ctx = buildWorkflowAiContext({
      state: "diagnose",
      workflowId: `${openWorkflowId}:run:${run.id}`,
      workflowName,
    });
    openAiBox({
      ...ctx,
      greeting: hasError
        ? `I see **run ${run.id}** for **${workflowName}** has failed. I can help you understand what went wrong and suggest fixes.`
        : `I have **run ${run.id}** for **${workflowName}** loaded. Ask me anything about this execution.`,
      initialQuery: hasError
        ? `Why did run ${run.id} fail?`
        : `Show me the details of run ${run.id}`,
    });
  }, [openAiBox, allWorkflows, openWorkflowId]);

  // Replay is now handled entirely by the PlaybookEngine via RunsTab

  const handleOpenWorkflow = useCallback((workflowId: string) => {
    setOpenWorkflowId(workflowId);
    setWorkflowTab("workflow");
  }, []);

  const handleCloseWorkflow = useCallback(() => {
    setOpenWorkflowId(null);
    setWorkflowTab("workflow");
  }, []);

  const handleRunWorkflow = useCallback(() => {
    if (!openWorkflowId || isExecutingRun) return;
    
    const workflow = allWorkflows.find(w => w.id === openWorkflowId);
    if (!workflow) return;

    // Brief "starting" state on the button
    setIsExecutingRun(true);

    // Small delay for visual feedback before closing modal
    setTimeout(() => {
      // Delegate to PlaybookEngine — creates run with trigger_source=manual, status=queued
      // Then progresses: queued → running → completed/failed with step-by-step execution
      const newRun = engineManualRun(openWorkflowId, workflow.title);

      // Toast notification
      const stepCount = getStepTemplatesForWorkflow(openWorkflowId).length;
      toast.success(`Run started: ${newRun.id}`, {
        description: `Executing ${stepCount} steps for "${workflow.title}"`,
        duration: 4000,
      });

      // Close modal, reset executing state, switch to Runs tab
      setShowRunModal(false);
      setIsExecutingRun(false);
      setWorkflowTab("runs");
    }, 600);
  }, [openWorkflowId, isExecutingRun, engineManualRun, allWorkflows]);

  /* ── Template creation counter ref (used by finalizeTemplateCreation and event handlers) ── */
  const _templateCounter = React.useRef(0);

  /* ── Template integration check helpers ── */
  const getTemplateMissingIntegrations = useCallback((
    steps: Array<{ id: string; templateId: string; name: string; type: string; integration?: string }>,
  ) => {
    const required = steps
      .filter(s => s.integration)
      .map(s => s.integration as string);
    const unique = Array.from(new Set(required));
    return unique
      .filter(intName => !templateConnectedIntegrations.includes(intName))
      .map(intName => ({
        id: intName.toLowerCase().replace(/\s+/g, "-"),
        name: intName,
        provider: intName,
        isConnected: false,
        requiredBySteps: steps.filter(s => s.integration === intName).map(s => s.name),
      }));
  }, [templateConnectedIntegrations]);

  /** Finalize template creation (called after integration check passes or user skips) */
  const finalizeTemplateCreation = useCallback((
    templateName: string,
    steps: Array<{ id: string; templateId: string; name: string; type: string; integration?: string }>,
    mode: "create" | "customize",
  ) => {
    const newId = `wf-tpl-${++_templateCounter.current}`;
    const newWorkflow: WorkflowCard = {
      id: newId,
      title: templateName,
      description: mode === "customize"
        ? `Draft — customizing "${templateName}" template.`
        : `Created from the "${templateName}" template.`,
      tags: ["Template", "Draft"],
      status: "completed" as WorkflowStatus,
      runCount: 0,
      lastRun: "Just now",
    };
    setCreatedWorkflows(prev => [...prev, newWorkflow]);
    setActiveTab("workspace");
    setOpenWorkflowId(newId);
    setWorkflowTab("workflow");
    // Push steps to canvas after mount
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent("workflow-canvas-update", {
        detail: {
          steps: steps.map(s => ({
            id: s.id,
            templateId: s.templateId,
            name: s.name,
            status: "idle" as const,
            requiresIntegration: s.integration,
          })),
        },
      }));
    }, 150);
    if (mode === "customize") {
      // Switch AIBox to edit state
      setTimeout(() => {
        openAiBox(buildWorkflowAiContext({
          state: "edit",
          workflowId: newId,
          workflowName: templateName,
        }));
      }, 300);
    }
    // Clear pending state
    setPendingTemplateCreation(null);
    setTemplateConnectedIntegrations([]);

    toast.success(`Workflow created: ${templateName}`, {
      description: mode === "customize"
        ? "Draft opened for customization"
        : "Added to workspace as a draft",
      duration: 4000,
    });
  }, [openAiBox]);

  /** Map integration display names to IntegrationSetupModal type keys */
  const integrationToSetupType = useCallback((intName: string): "slack" | "jira" | "virustotal" | "aws" | "email" | "threat-intel" => {
    const n = intName.toLowerCase();
    if (n.includes("slack")) return "slack";
    if (n.includes("jira")) return "jira";
    if (n.includes("virustotal")) return "virustotal";
    if (n.includes("aws")) return "aws";
    if (n.includes("email") || n.includes("smtp") || n.includes("sendgrid")) return "email";
    if (n.includes("nessus") || n.includes("qualys") || n.includes("crowdstrike") || n.includes("threat")) return "threat-intel";
    // Default fallback
    return "slack";
  }, []);

  const handleTemplateConfigureIntegrations = useCallback(() => {
    if (!pendingTemplateCreation) return;
    setShowTemplateIntegrationModal(false);
    const missing = getTemplateMissingIntegrations(pendingTemplateCreation.steps);
    if (missing.length > 0) {
      setTemplateSetupOriginalName(missing[0].name);
      setTemplateSetupType(integrationToSetupType(missing[0].name));
      setShowTemplateSetupModal(true);
    }
  }, [pendingTemplateCreation, getTemplateMissingIntegrations, integrationToSetupType]);

  const handleTemplateSetupComplete = useCallback(() => {
    if (templateSetupOriginalName) {
      // Use the original integration name from the step (e.g. "Slack", "Nessus", "Jira")
      setTemplateConnectedIntegrations(prev => [...prev, templateSetupOriginalName]);
    }
    setShowTemplateSetupModal(false);
    setTemplateSetupType(null);
    setTemplateSetupOriginalName(null);
    // Check if there are still missing integrations
    setTimeout(() => {
      if (!pendingTemplateCreation) return;
      // Re-check with the updated connected list (via state update in next tick)
      setTemplateConnectedIntegrations(prev => {
        const updated = [...prev];
        const missing = pendingTemplateCreation.steps
          .filter(s => s.integration)
          .map(s => s.integration as string);
        const unique = Array.from(new Set(missing));
        const stillMissing = unique.filter(intName => !updated.includes(intName));
        if (stillMissing.length > 0) {
          setShowTemplateIntegrationModal(true);
        } else {
          // All connected — finalize
          finalizeTemplateCreation(
            pendingTemplateCreation.templateName,
            pendingTemplateCreation.steps,
            pendingTemplateCreation.mode,
          );
        }
        return updated;
      });
    }, 300);
  }, [templateSetupOriginalName, pendingTemplateCreation, finalizeTemplateCreation]);

  const handleTemplateSkipIntegrations = useCallback(() => {
    setShowTemplateIntegrationModal(false);
    if (!pendingTemplateCreation) return;
    finalizeTemplateCreation(
      pendingTemplateCreation.templateName,
      pendingTemplateCreation.steps,
      pendingTemplateCreation.mode,
    );
  }, [pendingTemplateCreation, finalizeTemplateCreation]);

  const handleTemplateCancelCreation = useCallback(() => {
    setShowTemplateIntegrationModal(false);
    setShowTemplateSetupModal(false);
    setPendingTemplateCreation(null);
    setTemplateConnectedIntegrations([]);
    setTemplateSetupOriginalName(null);
    setTemplateSetupType(null);
  }, []);

  const handleLibraryItemSelect = useCallback((item: HubItem) => {
    const ctx = buildWorkflowAiContext({
      state: "library",
      workflowId: `library:${item.kind}:${item.id}`,
      workflowName: item.title,
    });
    openAiBox(ctx);
  }, [openAiBox]);

  const handleTemplateSelect = useCallback((template: LibraryTemplate) => {
    openTemplateAI(template.title, template.prompt);
  }, [openTemplateAI]);

  /* ── "Create from Template" event listeners ── */
  useEffect(() => {
    /**
     * Create as is — check integrations first, then create workflow.
     * If required integrations are missing, show IntegrationRequiredModal
     * before proceeding with creation.
     */
    const handleCreate = (e: Event) => {
      const { templateName, steps } = (e as CustomEvent).detail;
      // Check if any steps require integrations that aren't connected
      const required = steps
        .filter((s: { integration?: string }) => s.integration)
        .map((s: { integration?: string }) => s.integration as string);
      const uniqueRequired = Array.from(new Set(required));

      if (uniqueRequired.length > 0) {
        // Store pending creation and show integration check modal
        setPendingTemplateCreation({ templateName, steps, mode: "create" });
        setTemplateConnectedIntegrations([]);
        setShowTemplateIntegrationModal(true);
      } else {
        // No integrations needed — create immediately
        const newId = `wf-tpl-${++_templateCounter.current}`;
        const newWorkflow: WorkflowCard = {
          id: newId,
          title: templateName,
          description: `Created from the "${templateName}" template.`,
          tags: ["Template", "Draft"],
          status: "completed" as WorkflowStatus,
          runCount: 0,
          lastRun: "Just now",
        };
        setCreatedWorkflows(prev => [...prev, newWorkflow]);
        setActiveTab("workspace");
        setOpenWorkflowId(newId);
        setWorkflowTab("workflow");
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent("workflow-canvas-update", {
            detail: {
              steps: steps.map((s: { id: string; templateId: string; name: string; type: string; integration?: string }) => ({
                id: s.id,
                templateId: s.templateId,
                name: s.name,
                status: "idle" as const,
                requiresIntegration: s.integration,
              })),
            },
          }));
        }, 150);
        toast.success(`Workflow created: ${templateName}`, {
          description: "Added to workspace as a draft",
          duration: 4000,
        });
      }
    };

    /**
     * Customize before creating — check integrations first, then create draft
     * and open on canvas in edit mode.
     */
    const handleCustomize = (e: Event) => {
      const { templateName, steps } = (e as CustomEvent).detail;
      const required = steps
        .filter((s: { integration?: string }) => s.integration)
        .map((s: { integration?: string }) => s.integration as string);
      const uniqueRequired = Array.from(new Set(required));

      if (uniqueRequired.length > 0) {
        setPendingTemplateCreation({ templateName, steps, mode: "customize" });
        setTemplateConnectedIntegrations([]);
        setShowTemplateIntegrationModal(true);
      } else {
        const newId = `wf-tpl-${++_templateCounter.current}`;
        const newWorkflow: WorkflowCard = {
          id: newId,
          title: templateName,
          description: `Draft — customizing "${templateName}" template.`,
          tags: ["Template", "Draft"],
          status: "completed" as WorkflowStatus,
          runCount: 0,
          lastRun: "Just now",
        };
        setCreatedWorkflows(prev => [...prev, newWorkflow]);
        setActiveTab("workspace");
        setOpenWorkflowId(newId);
        setWorkflowTab("workflow");
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent("workflow-canvas-update", {
            detail: {
              steps: steps.map((s: { id: string; templateId: string; name: string; type: string; integration?: string }) => ({
                id: s.id,
                templateId: s.templateId,
                name: s.name,
                status: "idle" as const,
                requiresIntegration: s.integration,
              })),
            },
          }));
        }, 150);
        setTimeout(() => {
          openAiBox(buildWorkflowAiContext({
            state: "edit",
            workflowId: newId,
            workflowName: templateName,
          }));
        }, 300);
        toast.success(`Workflow created: ${templateName}`, {
          description: "Draft opened for customization",
          duration: 4000,
        });
      }
    };

    window.addEventListener("workflow-create-from-template", handleCreate);
    window.addEventListener("workflow-customize-template", handleCustomize);
    return () => {
      window.removeEventListener("workflow-create-from-template", handleCreate);
      window.removeEventListener("workflow-customize-template", handleCustomize);
    };
  }, [openAiBox]);

  const currentWorkflow = openWorkflowId ? allWorkflows.find(w => w.id === openWorkflowId) : null;

  const total = WF_STATS.running + WF_STATS.completed + WF_STATS.approvalRequired;

  /* ── TOP-LEVEL TAB DEFS ── */
  const TOP_TABS: { key: TopTab; label: string; icon: typeof Zap }[] = [
    { key: "workspace", label: "Workspace", icon: Zap },
    { key: "library", label: "Library", icon: BookOpen },
  ];

  return (
    <div className="h-full flex flex-col" style={{ backgroundColor: colors.bgApp }}>
      {/* ═══════════ TOP TAB BAR + NEW WORKFLOW ═══════════ */}
      {/* Hide top-level navigation when inside a workflow */}
      {!openWorkflowId && (
        <div className="px-[24px] pt-[20px]" style={{ borderBottom: `1px solid ${colors.border}` }}>
          <div className="flex items-center justify-between">
            <div className="flex gap-[28px]">
              {TOP_TABS.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.key;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className="pb-[14px] relative flex items-center gap-[7px]"
                  >
                    <Icon size={14} strokeWidth={2} color={isActive ? colors.accent : colors.textDim} />
                    <span className="text-[13px] transition-colors" style={{ color: isActive ? colors.textPrimary : colors.textSecondary, fontWeight: isActive ? 600 : 500 }}>
                      {tab.label}
                    </span>
                    {isActive && <div className="absolute bottom-0 left-0 right-0 h-[2px]" style={{ backgroundColor: colors.accent }} />}
                  </button>
                );
              })}
            </div>
            <div className="flex items-center gap-[8px] mb-[10px]">
              {/* New Workflow — hidden in Time Travel */}
              {!timeTravelActive && (
                <button
                  onClick={openNewWorkflowAI}
                  className="flex items-center gap-[8px] rounded-[8px] px-[16px] py-[8px] text-[13px] transition-colors cursor-pointer"
                  style={{ backgroundColor: colors.buttonPrimary, color: "#fff", fontWeight: 600 }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = colors.buttonPrimaryHover; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = colors.buttonPrimary; }}
                >
                  <Sparkles size={15} strokeWidth={2} />
                  New Workflow
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ═══════════ TAB CONTENT ═══════════ */}
      <div className="flex-1 overflow-auto">

        {/* ──────── WORKSPACE TAB ──────── */}
        {activeTab === "workspace" && (
          <>
            {/* ── Show workflow list if no workflow is open ── */}
            {!openWorkflowId && (
              <div className="px-[24px] py-[20px]">
                {/* Status Summary */}
                <div className="rounded-[10px] p-[18px] mb-[20px]" style={{ backgroundColor: colors.bgCard, border: `1px solid ${colors.border}` }}>
                  <div className="flex items-center gap-[24px] mb-[14px]">
                    <div><div className="text-[11px] mb-[4px]" style={{ color: colors.textMuted }}>Running</div><div className="text-[20px]" style={{ color: colors.active, fontWeight: 700 }}>{WF_STATS.running}</div></div>
                    <div><div className="text-[11px] mb-[4px]" style={{ color: colors.textMuted }}>Completed</div><div className="text-[20px]" style={{ color: colors.textSecondary, fontWeight: 700 }}>{WF_STATS.completed}</div></div>
                    <div><div className="text-[11px] mb-[4px]" style={{ color: colors.textMuted }}>Approval Required</div><div className="text-[20px]" style={{ color: colors.medium, fontWeight: 700 }}>{WF_STATS.approvalRequired}</div></div>
                  </div>
                  <div className="h-[6px] rounded-full overflow-hidden flex" style={{ backgroundColor: colors.bgDark }}>
                    <div className="h-full" style={{ width: `${(WF_STATS.running / total) * 100}%`, backgroundColor: colors.active }} />
                    <div className="h-full" style={{ width: `${(WF_STATS.completed / total) * 100}%`, backgroundColor: colors.textMuted }} />
                    <div className="h-full" style={{ width: `${(WF_STATS.approvalRequired / total) * 100}%`, backgroundColor: colors.medium }} />
                  </div>
                </div>

                {/* Search & Filter */}
                <div className="flex items-center gap-[12px] mb-[20px]">
                  <div className="flex-1 flex items-center gap-[10px] rounded-[8px] px-[14px]" style={{ height: 40, backgroundColor: "rgba(255,255,255,0.03)", border: `1px solid ${colors.border}` }}>
                    <Search size={16} color={colors.textDim} strokeWidth={2} />
                    <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search workflows..." className="flex-1 bg-transparent outline-none text-[13px]" style={{ color: colors.textSecondary }} />
                  </div>
                  <div className="relative">
                    <button onClick={() => setShowFilterMenu(!showFilterMenu)} className="flex items-center gap-[8px] rounded-[8px] px-[14px] transition-colors cursor-pointer" style={{ height: 40, backgroundColor: showFilterMenu ? colors.bgCardHover : "rgba(255,255,255,0.03)", border: `1px solid ${colors.border}`, color: colors.textSecondary, fontWeight: 500 }} onMouseEnter={(e) => { if (!showFilterMenu) e.currentTarget.style.backgroundColor = colors.bgCardHover; }} onMouseLeave={(e) => { if (!showFilterMenu) e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.03)"; }}>
                      <SlidersHorizontal size={16} strokeWidth={2} />
                      <span className="text-[13px]">Filter</span>
                      {statusFilter !== "all" && <div className="size-[6px] rounded-full" style={{ backgroundColor: colors.accent }} />}
                    </button>
                    {showFilterMenu && (
                      <>
                        <div className="fixed inset-0 z-[40]" onClick={() => setShowFilterMenu(false)} />
                        <div className="absolute top-[44px] right-0 z-[50] rounded-[8px] py-[6px] min-w-[180px]" style={{ backgroundColor: colors.bgCard, border: `1px solid ${colors.border}`, boxShadow: "0 8px 24px rgba(0,0,0,0.4)" }}>
                          <div className="px-[12px] py-[6px] text-[10px] uppercase tracking-[0.08em]" style={{ color: colors.textDim, fontWeight: 600 }}>Status</div>
                          {([{ value: "all" as const, label: "All Workflows" }, { value: "running" as const, label: "Running" }, { value: "completed" as const, label: "Completed" }, { value: "approval_required" as const, label: "Approval Required" }, { value: "disabled" as const, label: "Disabled" }] as const).map((opt) => (
                            <button key={opt.value} onClick={() => { setStatusFilter(opt.value); setShowFilterMenu(false); }} className="w-full flex items-center justify-between px-[12px] py-[8px] text-left transition-colors" style={{ color: colors.textSecondary }} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = colors.bgCardHover; }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}>
                              <span className="text-[12px]" style={{ fontWeight: 500 }}>{opt.label}</span>
                              {statusFilter === opt.value && <CheckCircle2 size={13} color={colors.accent} strokeWidth={2} />}
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Workflow Cards Grid */}
                {filteredWorkflows.length > 0 ? (
                  <div className="grid grid-cols-2 gap-[16px]">{filteredWorkflows.map((wf) => (
                      <WorkflowCardComp
                        key={wf.id}
                        workflow={wf}
                        onClick={() => { if (!timeTravelActive) handleOpenWorkflow(wf.id); }}
                        onEdit={() => handleOpenWorkflow(wf.id)}
                        readOnly={timeTravelActive}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-[80px]">
                    <div className="size-[80px] rounded-full flex items-center justify-center mb-[20px]" style={{ backgroundColor: `${colors.accent}10`, border: `1px solid ${colors.accent}20` }}><Zap size={32} color={colors.accent} strokeWidth={2} /></div>
                    <h3 className="text-[16px] mb-[8px]" style={{ color: colors.textPrimary, fontWeight: 600 }}>{searchQuery ? "No workflows found" : "No workflows yet"}</h3>
                    <p className="text-[13px] mb-[24px] text-center max-w-[340px]" style={{ color: colors.textMuted }}>{searchQuery ? "Try adjusting your search query or filters." : "Create your first automation workflow to streamline operations."}</p>
                    {!searchQuery && (
                      <button onClick={openNewWorkflowAI} className="flex items-center gap-[8px] rounded-[8px] px-[18px] py-[10px] text-[13px] transition-colors cursor-pointer" style={{ backgroundColor: colors.buttonPrimary, color: "#fff", fontWeight: 600 }} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = colors.buttonPrimaryHover; }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = colors.buttonPrimary; }}>
                        <Sparkles size={16} strokeWidth={2} /> Create Workflow
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* ── Show workflow detail view if a workflow is open ── */}
            {openWorkflowId && currentWorkflow && (
              <div className="h-full flex flex-col">
                {/* Workflow Header with Back Button */}
                <div className="px-[24px] pt-[20px] pb-[12px]" style={{ borderBottom: `1px solid ${colors.border}` }}>
                  <div className="flex items-center gap-[12px] mb-[16px]">
                    <button
                      onClick={handleCloseWorkflow}
                      className="size-[32px] rounded-[8px] flex items-center justify-center transition-colors"
                      style={{ backgroundColor: colors.bgCard, border: `1px solid ${colors.border}` }}
                      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = colors.bgCardHover; }}
                      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = colors.bgCard; }}
                    >
                      <ArrowRight size={16} color={colors.textSecondary} strokeWidth={2} style={{ transform: "rotate(180deg)" }} />
                    </button>
                    <div className="flex-1">
                      <h2 className="text-[16px]" style={{ color: colors.textPrimary, fontWeight: 600 }}>{currentWorkflow.title}</h2>
                      <p className="text-[11px]" style={{ color: colors.textMuted }}>{currentWorkflow.description}</p>
                    </div>
                    <StatusBadge status={currentWorkflow.status} />

                    {/* Time Travel indicator */}
                    {timeTravelActive && (
                      <div
                        className="flex items-center gap-[6px] px-[10px] py-[6px] rounded-[8px] text-[11px]"
                        style={{
                          background: `${colors.warning}12`,
                          border: `1px solid ${colors.warning}30`,
                          color: colors.warning,
                          fontWeight: 500,
                        }}
                      >
                        <Clock size={12} />
                        Time Travel Mode — Execution actions disabled
                      </div>
                    )}

                    {/* Action Buttons */}
                    {!timeTravelActive && (
                      <div className="flex items-center gap-[8px]">
                        {/* Active run indicator */}
                        {hasActiveRun && (
                          <div
                            className="flex items-center gap-[6px] px-[10px] py-[6px] rounded-[8px] text-[12px]"
                            style={{
                              background: `${colors.active}12`,
                              border: `1px solid ${colors.active}30`,
                              color: colors.active,
                              fontWeight: 500,
                            }}
                          >
                            <Loader2 size={12} className="animate-spin" />
                            Run in progress
                          </div>
                        )}

                        <button
                          onClick={() => setShowRunModal(true)}
                          disabled={currentWorkflow.status === "disabled"}
                          className="flex items-center gap-[8px] rounded-[8px] px-[14px] py-[8px] text-[13px] transition-colors"
                          style={{
                            backgroundColor: currentWorkflow.status === "disabled" ? colors.bgCard : colors.buttonPrimary,
                            color: currentWorkflow.status === "disabled" ? colors.textDim : "#fff",
                            fontWeight: 600,
                            opacity: currentWorkflow.status === "disabled" ? 0.5 : 1,
                            cursor: currentWorkflow.status === "disabled" ? "not-allowed" : "pointer",
                          }}
                          onMouseEnter={(e) => {
                            if (currentWorkflow.status !== "disabled") {
                              e.currentTarget.style.backgroundColor = colors.buttonPrimaryHover;
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (currentWorkflow.status !== "disabled") {
                              e.currentTarget.style.backgroundColor = colors.buttonPrimary;
                            }
                          }}
                        >
                          <Play size={14} strokeWidth={2} />
                          Run Workflow
                        </button>

                        <div className="relative">
                          <button
                            onClick={() => setShowActionsMenu(!showActionsMenu)}
                            className="size-[36px] rounded-[8px] flex items-center justify-center transition-colors"
                            style={{
                              backgroundColor: showActionsMenu ? colors.bgCardHover : colors.bgCard,
                              border: `1px solid ${colors.border}`,
                            }}
                            onMouseEnter={(e) => {
                              if (!showActionsMenu) e.currentTarget.style.backgroundColor = colors.bgCardHover;
                            }}
                            onMouseLeave={(e) => {
                              if (!showActionsMenu) e.currentTarget.style.backgroundColor = colors.bgCard;
                            }}
                          >
                            <MoreVertical size={16} color={colors.textMuted} strokeWidth={2} />
                          </button>

                          {showActionsMenu && (
                            <>
                              <div
                                className="fixed inset-0 z-[40]"
                                onClick={() => setShowActionsMenu(false)}
                              />
                              <div
                                className="absolute top-[40px] right-0 z-[50] rounded-[8px] py-[4px] min-w-[160px]"
                                style={{
                                  backgroundColor: colors.bgCard,
                                  border: `1px solid ${colors.border}`,
                                  boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
                                }}
                              >
                                <button
                                  onClick={() => {
                                    setShowActionsMenu(false);
                                    openAiBox(buildWorkflowAiContext({
                                      state: "edit",
                                      workflowId: currentWorkflow.id,
                                      workflowName: currentWorkflow.title,
                                    }));
                                  }}
                                  className="w-full flex items-center gap-[10px] px-[12px] py-[8px] text-left transition-colors"
                                  style={{ color: colors.textSecondary }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = colors.bgCardHover;
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = "transparent";
                                  }}
                                >
                                  <Edit3 size={14} strokeWidth={2} />
                                  <span className="text-[12px]" style={{ fontWeight: 500 }}>
                                    Edit Workflow
                                  </span>
                                </button>

                                {/* Divider */}
                                <div className="mx-[8px] my-[4px]" style={{ borderTop: `1px solid ${colors.border}` }} />

                                {/* Explain Workflow */}
                                <button
                                  onClick={() => {
                                    setShowActionsMenu(false);
                                    openAiBox(buildWorkflowAiContext({
                                      state: "explain",
                                      workflowId: currentWorkflow.id,
                                      workflowName: currentWorkflow.title,
                                    }));
                                  }}
                                  className="w-full flex items-center gap-[10px] px-[12px] py-[8px] text-left transition-colors"
                                  style={{ color: colors.textSecondary }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = colors.bgCardHover;
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = "transparent";
                                  }}
                                >
                                  <HelpCircle size={14} strokeWidth={2} />
                                  <span className="text-[12px]" style={{ fontWeight: 500 }}>
                                    Explain
                                  </span>
                                </button>

                                {/* Optimize Workflow */}
                                <button
                                  onClick={() => {
                                    setShowActionsMenu(false);
                                    openAiBox(buildWorkflowAiContext({
                                      state: "optimize",
                                      workflowId: currentWorkflow.id,
                                      workflowName: currentWorkflow.title,
                                    }));
                                  }}
                                  className="w-full flex items-center gap-[10px] px-[12px] py-[8px] text-left transition-colors"
                                  style={{ color: colors.textSecondary }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = colors.bgCardHover;
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = "transparent";
                                  }}
                                >
                                  <TrendingUp size={14} strokeWidth={2} />
                                  <span className="text-[12px]" style={{ fontWeight: 500 }}>
                                    Optimize
                                  </span>
                                </button>

                                {/* Divider */}
                                <div className="mx-[8px] my-[4px]" style={{ borderTop: `1px solid ${colors.border}` }} />

                                {/* Check Integrations */}
                                <button
                                  onClick={() => {
                                    setShowActionsMenu(false);
                                    const ctx = buildWorkflowAiContext({
                                      state: "diagnose",
                                      workflowId: currentWorkflow.id,
                                      workflowName: currentWorkflow.title,
                                    });
                                    openAiBox({
                                      ...ctx,
                                      initialQuery: "Check integrations for this workflow",
                                    });
                                  }}
                                  className="w-full flex items-center gap-[10px] px-[12px] py-[8px] text-left transition-colors"
                                  style={{ color: colors.textSecondary }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = colors.bgCardHover;
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = "transparent";
                                  }}
                                >
                                  <Plug size={14} strokeWidth={2} />
                                  <span className="text-[12px]" style={{ fontWeight: 500 }}>
                                    Check Integrations
                                  </span>
                                </button>

                                {/* Show Recent Runs */}
                                <button
                                  onClick={() => {
                                    setShowActionsMenu(false);
                                    const ctx = buildWorkflowAiContext({
                                      state: "diagnose",
                                      workflowId: currentWorkflow.id,
                                      workflowName: currentWorkflow.title,
                                    });
                                    openAiBox({
                                      ...ctx,
                                      initialQuery: "Show recent workflow runs",
                                    });
                                  }}
                                  className="w-full flex items-center gap-[10px] px-[12px] py-[8px] text-left transition-colors"
                                  style={{ color: colors.textSecondary }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = colors.bgCardHover;
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = "transparent";
                                  }}
                                >
                                  <Activity size={14} strokeWidth={2} />
                                  <span className="text-[12px]" style={{ fontWeight: 500 }}>
                                    Show Recent Runs
                                  </span>
                                </button>

                                {/* Divider */}
                                <div className="mx-[8px] my-[4px]" style={{ borderTop: `1px solid ${colors.border}` }} />

                                <button
                                  onClick={() => {
                                    setShowActionsMenu(false);
                                  }}
                                  className="w-full flex items-center gap-[10px] px-[12px] py-[8px] text-left transition-colors"
                                  style={{ color: colors.textSecondary }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = colors.bgCardHover;
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = "transparent";
                                  }}
                                >
                                  <Power size={14} strokeWidth={2} />
                                  <span className="text-[12px]" style={{ fontWeight: 500 }}>
                                    {currentWorkflow.status === "disabled" ? "Enable" : "Disable"} Workflow
                                  </span>
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Workflow-scoped Tabs */}
                  <div className="flex gap-[20px]">
                    {WORKFLOW_TABS.map((tab) => {
                      const Icon = tab.icon;
                      const isActive = workflowTab === tab.key;
                      return (
                        <button
                          key={tab.key}
                          onClick={() => setWorkflowTab(tab.key)}
                          className="pb-[12px] relative flex items-center gap-[7px]"
                        >
                          <Icon size={14} strokeWidth={2} color={isActive ? colors.accent : colors.textDim} />
                          <span className="text-[13px] transition-colors" style={{ color: isActive ? colors.textPrimary : colors.textSecondary, fontWeight: isActive ? 600 : 500 }}>
                            {tab.label}
                          </span>
                          {isActive && <div className="absolute bottom-0 left-0 right-0 h-[2px]" style={{ backgroundColor: colors.accent }} />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Workflow Tab Content + AI Panel */}
                <div className="flex-1 flex overflow-hidden">
                  {/* Main content area */}
                  <div className="flex-1 overflow-auto min-w-0">
                    {/* ── Workflow Tab ── */}
                    {workflowTab === "workflow" && (
                      <div className="px-[24px] py-[20px]">
                        <WorkflowBuilder 
                          workflowId={openWorkflowId} 
                          workflowName={currentWorkflow.title}
                        />
                      </div>
                    )}

                    {/* ── Runs Tab ── */}
                    {workflowTab === "runs" && (
                      <div className="h-full">
                        <RunsTab onDebugRun={handleDebugRun} onAskAI={handleRunsAskAI} workflowId={openWorkflowId} />
                      </div>
                    )}

                    {/* ── Debug Tab ── */}
                    {workflowTab === "debug" && (
                      <div className="h-full">
                        <DebugTab
                          initialRunId={debugRunId}
                          workflowId={openWorkflowId}
                          onAskAI={handleDebugAskAI}
                          onRunSelected={setDebugSelectedRun}
                        />
                      </div>
                    )}

                    {/* ── Settings Tab ── */}
                    {workflowTab === "settings" && (
                      <div className="h-full">
                        <SettingsTab workflowId={openWorkflowId} />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* ════════════════════════════════════════════════��═
            LIBRARY TAB — Section 2: Segmented Navigation
            ══════════════════════════════════════════════════ */}
        {activeTab === "library" && (
          <div className="px-[24px] py-[20px]">

            {/* Search bar + Source filter + Segment selector */}
            <div className="flex items-center gap-[12px] mb-[16px]">
              <div className="flex-1 flex items-center gap-[10px] rounded-[8px] px-[14px]" style={{ height: 40, backgroundColor: "rgba(255,255,255,0.03)", border: `1px solid ${colors.border}` }}>
                <Search size={16} color={colors.textDim} strokeWidth={2} />
                <input
                  value={librarySearch}
                  onChange={(e) => setLibrarySearch(e.target.value)}
                  placeholder={`Search ${LIBRARY_SEGMENTS.find(s => s.key === librarySegment)?.label.toLowerCase() || "library"}...`}
                  className="flex-1 bg-transparent outline-none text-[13px]"
                  style={{ color: colors.textSecondary }}
                />
                {librarySearch && (
                  <button onClick={() => setLibrarySearch("")} className="cursor-pointer" style={{ color: colors.textDim }}>
                    <span className="text-[14px]">&times;</span>
                  </button>
                )}
              </div>
              <div className="relative">
                <button onClick={() => setShowSourceMenu(!showSourceMenu)} className="flex items-center gap-[8px] rounded-[8px] px-[14px] transition-colors cursor-pointer"
                  style={{ height: 40, backgroundColor: showSourceMenu ? colors.bgCardHover : "rgba(255,255,255,0.03)", border: `1px solid ${colors.border}`, color: colors.textSecondary, fontWeight: 500 }}
                  onMouseEnter={(e) => { if (!showSourceMenu) e.currentTarget.style.backgroundColor = colors.bgCardHover; }}
                  onMouseLeave={(e) => { if (!showSourceMenu) e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.03)"; }}>
                  <Sparkles size={14} strokeWidth={2} />
                  <span className="text-[13px]">{sourceFilter === "all" ? "All Sources" : SOURCE_META[sourceFilter].label}</span>
                  {sourceFilter !== "all" && <div className="size-[6px] rounded-full" style={{ backgroundColor: colors.accent }} />}
                </button>
                {showSourceMenu && (
                  <>
                    <div className="fixed inset-0 z-[40]" onClick={() => setShowSourceMenu(false)} />
                    <div className="absolute top-[44px] right-0 z-[50] rounded-[8px] py-[6px] min-w-[180px]" style={{ backgroundColor: colors.bgCard, border: `1px solid ${colors.border}`, boxShadow: "0 8px 24px rgba(0,0,0,0.4)" }}>
                      {([{ value: "all" as const, label: "All Sources" }, { value: "official" as const, label: "Official" }, { value: "community" as const, label: "Community" }, { value: "workspace" as const, label: "Workspace" }]).map((opt) => (
                        <button key={opt.value} onClick={() => { setSourceFilter(opt.value); setShowSourceMenu(false); }} className="w-full flex items-center justify-between px-[12px] py-[8px] text-left transition-colors" style={{ color: colors.textSecondary }} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = colors.bgCardHover; }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}>
                          <span className="text-[12px]" style={{ fontWeight: 500 }}>{opt.label}</span>
                          {sourceFilter === opt.value && <CheckCircle2 size={13} color={colors.accent} strokeWidth={2} />}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Segment Selector — one section at a time */}
            <div className="flex gap-[4px] mb-[20px] rounded-[8px] p-[4px]" style={{ backgroundColor: colors.bgCard, border: `1px solid ${colors.border}` }}>
              {LIBRARY_SEGMENTS.map(tab => {
                const TabIcon = tab.icon;
                const active = librarySegment === tab.key;
                return (
                  <button
                    key={tab.key}
                    onClick={() => { setLibrarySegment(tab.key); setIntegrationFilter(null); }}
                    className="flex items-center gap-[6px] rounded-[6px] px-[12px] py-[7px] transition-colors cursor-pointer"
                    style={{
                      backgroundColor: active ? `${colors.accent}12` : "transparent",
                      color: active ? colors.accent : colors.textSecondary,
                      fontWeight: active ? 600 : 500,
                    }}
                    onMouseEnter={(e) => { if (!active) e.currentTarget.style.backgroundColor = colors.bgCardHover; }}
                    onMouseLeave={(e) => { if (!active) e.currentTarget.style.backgroundColor = active ? `${colors.accent}12` : "transparent"; }}
                  >
                    <TabIcon size={13} strokeWidth={2} />
                    <span className="text-[12px]">{tab.label}</span>
                    <span className="text-[10px] px-[5px] py-[1px] rounded-[4px]" style={{ backgroundColor: active ? `${colors.accent}20` : "rgba(255,255,255,0.04)", color: active ? colors.accent : colors.textDim, fontWeight: 600 }}>
                      {tab.count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* ══ TEMPLATES SECTION ══ */}
            {librarySegment === "templates" && (
              <>
                {/* Featured Templates */}
                {!librarySearch && (
                  <div className="mb-[24px]">
                    <div className="flex items-center gap-[8px] mb-[14px]">
                      <Sparkles size={14} color={colors.accent} strokeWidth={2} />
                      <h3 className="text-[14px]" style={{ color: colors.textPrimary, fontWeight: 600 }}>Featured Templates</h3>
                      <span className="text-[11px]" style={{ color: colors.textDim }}>AI-powered workflow templates</span>
                    </div>
                    <div className="grid grid-cols-3 gap-[12px]">
                      {LIBRARY_TEMPLATES.filter(t => t.featured).map((tpl) => {
                        const TplIcon = tpl.icon;
                        return (
                          <div key={tpl.id} className="rounded-[10px] p-[14px] transition-all cursor-pointer"
                            style={{ backgroundColor: colors.bgCard, border: `1px solid ${colors.border}` }}
                            onClick={() => handleTemplateSelect(tpl)}
                            onMouseEnter={(e) => { e.currentTarget.style.borderColor = `${tpl.color}40`; e.currentTarget.style.backgroundColor = colors.bgCardHover; }}
                            onMouseLeave={(e) => { e.currentTarget.style.borderColor = colors.border; e.currentTarget.style.backgroundColor = colors.bgCard; }}>
                            <div className="flex items-center gap-[10px] mb-[8px]">
                              <div className="size-[30px] rounded-[7px] flex items-center justify-center shrink-0" style={{ backgroundColor: `${tpl.color}12` }}>
                                <TplIcon size={14} color={tpl.color} strokeWidth={2} />
                              </div>
                              <h4 className="text-[12px] flex-1 min-w-0 truncate" style={{ color: colors.textPrimary, fontWeight: 600 }}>{tpl.title}</h4>
                            </div>
                            <p className="text-[10px] leading-[1.5] mb-[10px] line-clamp-2" style={{ color: colors.textMuted }}>{tpl.description}</p>
                            <button onClick={(e) => { e.stopPropagation(); handleTemplateSelect(tpl); }}
                              className="flex items-center gap-[5px] rounded-[6px] px-[10px] py-[5px] text-[10px] transition-colors cursor-pointer w-full justify-center"
                              style={{ backgroundColor: `${tpl.color}08`, border: `1px solid ${tpl.color}20`, color: tpl.color, fontWeight: 600 }}
                              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = `${tpl.color}15`; }}
                              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = `${tpl.color}08`; }}>
                              <Sparkles size={10} strokeWidth={2} />Use Template
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* All Templates Grid */}
                <div className="flex items-center gap-[8px] mb-[14px]">
                  <span className="text-[10px] uppercase tracking-[0.08em]" style={{ color: colors.textDim, fontWeight: 600 }}>
                    {librarySearch ? `${LIBRARY_TEMPLATES.filter(t => t.title.toLowerCase().includes(librarySearch.toLowerCase())).length} results` : "All Templates"}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-[12px]">
                  {LIBRARY_TEMPLATES.filter(t => !librarySearch || t.title.toLowerCase().includes(librarySearch.toLowerCase()) || t.description.toLowerCase().includes(librarySearch.toLowerCase())).map((tpl) => {
                    const TplIcon = tpl.icon;
                    return (
                      <div key={tpl.id} className="rounded-[10px] p-[14px] transition-all cursor-pointer"
                        style={{ backgroundColor: colors.bgCard, border: `1px solid ${colors.border}` }}
                        onClick={() => handleTemplateSelect(tpl)}
                        onMouseEnter={(e) => { e.currentTarget.style.borderColor = `${tpl.color}40`; e.currentTarget.style.backgroundColor = colors.bgCardHover; }}
                        onMouseLeave={(e) => { e.currentTarget.style.borderColor = colors.border; e.currentTarget.style.backgroundColor = colors.bgCard; }}>
                        <div className="flex items-center gap-[10px] mb-[8px]">
                          <div className="size-[30px] rounded-[7px] flex items-center justify-center shrink-0" style={{ backgroundColor: `${tpl.color}12` }}>
                            <TplIcon size={14} color={tpl.color} strokeWidth={2} />
                          </div>
                          <h4 className="text-[12px] flex-1 min-w-0 truncate" style={{ color: colors.textPrimary, fontWeight: 600 }}>{tpl.title}</h4>
                        </div>
                        <p className="text-[10px] leading-[1.5] mb-[10px] line-clamp-2" style={{ color: colors.textMuted }}>{tpl.description}</p>
                        <div className="flex flex-wrap gap-[4px] mb-[10px]">
                          {tpl.tags.map((tag) => (
                            <span key={tag} className="inline-flex items-center px-[6px] py-[1px] rounded-[4px] text-[9px]" style={{ backgroundColor: "rgba(255,255,255,0.04)", color: colors.textDim, border: `1px solid ${colors.border}`, fontWeight: 500 }}>
                              {tag}
                            </span>
                          ))}
                        </div>
                        <button onClick={(e) => { e.stopPropagation(); handleTemplateSelect(tpl); }}
                          className="flex items-center gap-[5px] rounded-[6px] px-[10px] py-[5px] text-[10px] transition-colors cursor-pointer w-full justify-center"
                          style={{ backgroundColor: `${tpl.color}08`, border: `1px solid ${tpl.color}20`, color: tpl.color, fontWeight: 600 }}
                          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = `${tpl.color}15`; }}
                          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = `${tpl.color}08`; }}>
                          <Sparkles size={10} strokeWidth={2} />Use Template
                        </button>
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            {/* ══ ACTIONS SECTION ══ */}
            {librarySegment === "actions" && (
              <>
                {/* Integration filter chips */}
                {!integrationFilter && (
                  <div className="flex items-center gap-[8px] mb-[16px] flex-wrap">
                    <span className="text-[10px] uppercase tracking-[0.06em] shrink-0" style={{ color: colors.textDim, fontWeight: 600 }}>Integration:</span>
                    {INTEGRATIONS.slice(0, 8).map(integ => (
                      <button key={integ.id} onClick={() => setIntegrationFilter(integ.slug)}
                        className="flex items-center gap-[5px] rounded-[6px] px-[10px] py-[5px] text-[11px] transition-colors cursor-pointer"
                        style={{ backgroundColor: "transparent", border: `1px solid ${colors.border}`, color: colors.textSecondary, fontWeight: 500 }}
                        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = `${integ.color}08`; e.currentTarget.style.borderColor = `${integ.color}40`; }}
                        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.borderColor = colors.border; }}>
                        <IntegrationDot color={integ.color} size={8} />{integ.name}
                      </button>
                    ))}
                  </div>
                )}

                {/* Active integration filter chip */}
                {integrationFilter && (
                  <div className="flex items-center gap-[8px] mb-[16px]">
                    <span className="text-[10px] uppercase tracking-[0.06em]" style={{ color: colors.textDim, fontWeight: 600 }}>Filtered by:</span>
                    {(() => {
                      const integ = INTEGRATIONS.find(i => i.slug === integrationFilter);
                      if (!integ) return null;
                      return (
                        <span className="flex items-center gap-[5px] rounded-[6px] px-[10px] py-[5px] text-[11px]"
                          style={{ backgroundColor: `${integ.color}08`, border: `1px solid ${integ.color}40`, color: integ.color, fontWeight: 600 }}>
                          <IntegrationDot color={integ.color} size={8} />{integ.name}
                          <button onClick={() => setIntegrationFilter(null)} className="ml-[4px] cursor-pointer" style={{ color: integ.color }}>&times;</button>
                        </span>
                      );
                    })()}
                  </div>
                )}

                <div className="flex items-center justify-between mb-[14px]">
                  <span className="text-[11px]" style={{ color: colors.textDim }}>
                    {filteredLibraryItems.length} {filteredLibraryItems.length === 1 ? "action" : "actions"} found
                    {librarySearch && <> for &ldquo;{librarySearch}&rdquo;</>}
                  </span>
                </div>

                {filteredLibraryItems.length > 0 ? (
                  <div className="grid grid-cols-2 gap-[14px]">
                    {filteredLibraryItems.map(item => <LibraryItemCard key={item.id} item={item} onSelect={handleLibraryItemSelect} />)}
                  </div>
                ) : (
                  <EmptyLibraryState />
                )}
              </>
            )}

            {/* ══ FLOWS SECTION ══ */}
            {librarySegment === "flows" && (
              <>
                <div className="flex items-center justify-between mb-[14px]">
                  <span className="text-[11px]" style={{ color: colors.textDim }}>
                    {filteredLibraryItems.length} reusable {filteredLibraryItems.length === 1 ? "flow" : "flows"}
                    {librarySearch && <> matching &ldquo;{librarySearch}&rdquo;</>}
                  </span>
                </div>
                {filteredLibraryItems.length > 0 ? (
                  <div className="grid grid-cols-2 gap-[14px]">
                    {filteredLibraryItems.map(item => <LibraryItemCard key={item.id} item={item} onSelect={handleLibraryItemSelect} />)}
                  </div>
                ) : (
                  <EmptyLibraryState />
                )}
              </>
            )}

            {/* ══ RESOURCES SECTION ══ */}
            {librarySegment === "resources" && (
              <>
                <div className="flex items-center justify-between mb-[14px]">
                  <span className="text-[11px]" style={{ color: colors.textDim }}>
                    {filteredLibraryItems.length} {filteredLibraryItems.length === 1 ? "resource" : "resources"}
                    {librarySearch && <> matching &ldquo;{librarySearch}&rdquo;</>}
                  </span>
                </div>
                {filteredLibraryItems.length > 0 ? (
                  <div className="grid grid-cols-2 gap-[14px]">
                    {filteredLibraryItems.map(item => <LibraryItemCard key={item.id} item={item} onSelect={handleLibraryItemSelect} />)}
                  </div>
                ) : (
                  <EmptyLibraryState />
                )}
              </>
            )}

            {/* ══ INTEGRATIONS SECTION ══ */}
            {librarySegment === "integrations" && (
              <div className="flex gap-[20px]">
                <div className="w-[280px] shrink-0 flex flex-col gap-[8px]">
                  <div className="text-[10px] uppercase tracking-[0.06em] mb-[4px]" style={{ color: colors.textDim, fontWeight: 600 }}>
                    {INTEGRATIONS.length} Integrations
                  </div>
                  {INTEGRATIONS.map(integ => (
                    <IntegrationCard
                      key={integ.id}
                      integration={integ}
                      isSelected={integrationFilter === integ.slug}
                      onClick={() => setIntegrationFilter(integrationFilter === integ.slug ? null : integ.slug)}
                    />
                  ))}
                </div>
                <div className="flex-1">
                  {integrationFilter ? (
                    (() => {
                      const integ = INTEGRATIONS.find(i => i.slug === integrationFilter)!;
                      const items = filteredLibraryItems;
                      return (
                        <>
                          <div className="flex items-center gap-[10px] mb-[16px]">
                            <IntegrationDot color={integ.color} size={12} />
                            <span className="text-[14px]" style={{ color: colors.textPrimary, fontWeight: 600 }}>{integ.name}</span>
                            <span className="text-[11px]" style={{ color: colors.textMuted }}>{items.length} items</span>
                          </div>
                          {items.length > 0 ? (
                            <div className="grid grid-cols-2 gap-[14px]">
                              {items.map(item => <LibraryItemCard key={item.id} item={item} onSelect={handleLibraryItemSelect} />)}
                            </div>
                          ) : (
                            <div className="flex flex-col items-center justify-center py-[60px]">
                              <div className="text-[13px] mb-[4px]" style={{ color: colors.textMuted }}>No items found for this integration</div>
                              <div className="text-[11px]" style={{ color: colors.textDim }}>Try adjusting your search or source filter</div>
                            </div>
                          )}
                        </>
                      );
                    })()
                  ) : (
                    <div className="flex flex-col items-center justify-center py-[80px]">
                      <div className="size-[64px] rounded-full flex items-center justify-center mb-[16px]" style={{ backgroundColor: `${colors.accent}10`, border: `1px solid ${colors.accent}20` }}>
                        <Globe size={28} color={colors.accent} strokeWidth={2} />
                      </div>
                      <div className="text-[14px] mb-[6px]" style={{ color: colors.textPrimary, fontWeight: 600 }}>Select an Integration</div>
                      <div className="text-[12px] text-center max-w-[300px]" style={{ color: colors.textMuted }}>Choose an integration from the left to browse its available actions, flows, and resource types.</div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Run Confirmation Modal */}
      {showRunModal && currentWorkflow && (
        <RunConfirmationModal
          workflow={currentWorkflow}
          onConfirm={handleRunWorkflow}
          onCancel={() => { if (!isExecutingRun) setShowRunModal(false); }}
          isExecuting={isExecutingRun}
        />
      )}

      {/* Template Creation — Integration Required Modal */}
      {pendingTemplateCreation && (
        <IntegrationRequiredModal
          isOpen={showTemplateIntegrationModal}
          onClose={handleTemplateCancelCreation}
          missingIntegrations={getTemplateMissingIntegrations(pendingTemplateCreation.steps)}
          onConfigureIntegrations={handleTemplateConfigureIntegrations}
          onPublishLater={handleTemplateSkipIntegrations}
          subtitle="Connect integrations before creating this workflow"
          bodyText={`"${pendingTemplateCreation.templateName}" uses the following integrations. Connect them now, or skip and configure later.`}
          infoText="You can skip this step and connect integrations later from the workflow settings. The workflow will be saved as a draft and won't execute steps that require missing integrations."
          skipLabel="Skip & Create Draft"
          configureLabel="Connect Integration"
        />
      )}

      {/* Template Creation — Integration Setup Modal */}
      {templateSetupType && (
        <IntegrationSetupModal
          isOpen={showTemplateSetupModal}
          onClose={() => {
            setShowTemplateSetupModal(false);
            setTemplateSetupType(null);
            setTemplateSetupOriginalName(null);
            // Return to the required modal if there's still a pending creation
            if (pendingTemplateCreation) {
              setTimeout(() => setShowTemplateIntegrationModal(true), 200);
            }
          }}
          integrationType={templateSetupType as "slack" | "jira" | "virustotal" | "aws" | "email" | "threat-intel"}
          onComplete={handleTemplateSetupComplete}
        />
      )}
    </div>
  );
}

/* (default export is defined above, near WorkflowsIndexPageInner) */

/* ================================================================
   EMPTY LIBRARY STATE
   ================================================================ */

function EmptyLibraryState() {
  return (
    <div className="flex flex-col items-center justify-center py-[80px]">
      <div className="size-[80px] rounded-full flex items-center justify-center mb-[20px]" style={{ backgroundColor: `${colors.accent}10`, border: `1px solid ${colors.accent}20` }}>
        <Search size={32} color={colors.accent} strokeWidth={2} />
      </div>
      <h3 className="text-[16px] mb-[8px]" style={{ color: colors.textPrimary, fontWeight: 600 }}>No items found</h3>
      <p className="text-[13px] text-center max-w-[360px]" style={{ color: colors.textMuted }}>
        Try adjusting your search query, filters, or switch to a different category.
      </p>
    </div>
  );
}
