/**
 * Workflow Builder — AI-first playbook builder
 *
 * Non-technical users create and edit workflows entirely through
 * natural language via the global AIBox. The canvas displays a
 * simplified playbook-style vertical flow with minimal step actions.
 *
 * No configuration panels, no step libraries, no code/JSON inputs.
 * All editing happens through conversation with Alex.
 */

import React, { useState, useCallback, useEffect, useRef } from "react";
import { debug } from "../../shared/utils/debug";
import {
  AlertTriangle, FileText, MessageSquare, User, Database,
  Shield, Clock, Zap, Bell, Search, GitBranch, Lock,
  Check, X, RotateCw, Plus, Sparkles, Save, TestTube, Rocket,
  MessageCircle, Info, Trash2, Pencil, ChevronDown,
} from "lucide-react";
import { colors } from "../../shared/design-system/tokens";
import { WorkflowHealthSummary, type WorkflowHealthData } from "./WorkflowHealthSummary";
import { IntegrationRequiredModal } from "./IntegrationRequiredModal";
import { IntegrationSetupModal } from "./IntegrationSetupModal";
import { usePlaybookEngine } from "./engine";
import { useTimeTravel } from "../../shared/contexts/TimeTravelContext";
import { useAiBox } from "../../features/ai-box";
import { buildWorkflowAiContext } from "./workflowAiStates";

/* ================================================================
   STEP ICON REGISTRY
   ================================================================ */

const STEP_ICONS: Record<string, typeof AlertTriangle> = {
  "alert-trigger": AlertTriangle,
  "enrich-alert": Database,
  "query-threat-intel": Search,
  "create-case": FileText,
  "assign-analyst": User,
  "notify-slack": MessageSquare,
  "notify-jira": FileText,
  "disable-account": Lock,
  "block-ip": Shield,
  "approval": Clock,
  "delay": Clock,
  "escalate": Bell,
  "run-scan": Zap,
  "conditional": GitBranch,
};

function getStepIcon(templateId: string) {
  return STEP_ICONS[templateId] || Zap;
}

/* ================================================================
   STEP DESCRIPTION REGISTRY — plain-language summaries
   ================================================================ */

const STEP_DESCRIPTIONS: Record<string, string> = {
  "alert-trigger": "Triggers when a new critical alert is detected on any monitored asset.",
  "enrich-alert": "Enriches the alert with threat intelligence from VirusTotal, AbuseIPDB, and asset context from CMDB.",
  "query-threat-intel": "Queries external threat intelligence feeds for IOC correlation.",
  "create-case": "Creates an investigation case with details inherited from the triggering alert.",
  "assign-analyst": "Assigns the case to a SOC Tier 1 analyst using round-robin distribution.",
  "notify-slack": "Sends a notification to #critical-alerts with alert summary and case link.",
  "notify-jira": "Creates a Jira ticket with alert details and assigns it to the on-call team.",
  "disable-account": "Disables the compromised user account in Active Directory.",
  "block-ip": "Adds the malicious IP to the firewall block list.",
  "approval": "Pauses execution and waits for analyst approval before proceeding.",
  "delay": "Waits for a specified duration before continuing to the next step.",
  "escalate": "Escalates the case to Tier 2 and notifies security leadership.",
  "run-scan": "Initiates an on-demand vulnerability scan on affected assets.",
};

/* ================================================================
   TYPES
   ================================================================ */

type StepStatus = "idle" | "running" | "success" | "failed";

interface WorkflowStep {
  id: string;
  templateId: string;
  name: string;
  status: StepStatus;
  executionTime?: string;
  requiresIntegration?: string;
}

interface WorkflowData {
  id: string;
  name: string;
  steps: WorkflowStep[];
}

const STATUS_COLORS: Record<StepStatus, string> = {
  idle: colors.textDim,
  running: colors.accent,
  success: colors.active,
  failed: colors.critical,
};

const STATUS_ICONS: Record<StepStatus, typeof Check> = {
  idle: Plus,
  running: RotateCw,
  success: Check,
  failed: X,
};

/* ================================================================
   STEP CONTEXT MENU — minimal floating popover
   ================================================================ */

interface StepContextMenuProps {
  step: WorkflowStep;
  anchorRect: DOMRect | null;
  onClose: () => void;
  onExplain: () => void;
  onRemove: () => void;
  onModifyWithAI: () => void;
  disabled?: boolean;
}

function StepContextMenu({ step, anchorRect, onClose, onExplain, onRemove, onModifyWithAI, disabled }: StepContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [onClose]);

  if (!anchorRect) return null;

  const actions = [
    {
      label: "Explain this step",
      icon: Info,
      color: colors.accent,
      onClick: onExplain,
    },
    ...(disabled ? [] : [
      {
        label: "Modify with AI",
        icon: Sparkles,
        color: colors.accent,
        onClick: onModifyWithAI,
      },
      {
        label: "Remove step",
        icon: Trash2,
        color: colors.critical,
        onClick: onRemove,
      },
    ]),
  ];

  return (
    <div
      ref={menuRef}
      className="fixed z-[60] rounded-[10px] overflow-hidden py-[4px]"
      style={{
        top: anchorRect.bottom + 6,
        left: anchorRect.left + anchorRect.width / 2 - 100,
        width: 200,
        backgroundColor: colors.bgCard,
        border: `1px solid ${colors.border}`,
        boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
      }}
    >
      {actions.map((action, i) => {
        const Icon = action.icon;
        return (
          <button
            key={i}
            onClick={() => { action.onClick(); onClose(); }}
            className="w-full flex items-center gap-[10px] px-[14px] py-[9px] text-left transition-colors cursor-pointer"
            style={{ backgroundColor: "transparent" }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = colors.bgCardHover; }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = "transparent"; }}
          >
            <Icon size={14} color={action.color} strokeWidth={2} />
            <span className="text-[12px]" style={{ color: action.color === colors.critical ? colors.critical : colors.textPrimary, fontWeight: 500 }}>
              {action.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

/* ================================================================
   WORKFLOW BUILDER COMPONENT
   ================================================================ */

interface WorkflowBuilderProps {
  workflowId: string;
  workflowName: string;
}

function WorkflowBuilderInner({ workflowId, workflowName }: WorkflowBuilderProps) {
  const { testRun: engineTestRun } = usePlaybookEngine();
  const { isActive: timeTravelActive } = useTimeTravel();
  const { openWithContext: openAiBox, setPageContext: setAiBoxPageContext } = useAiBox();
  const [workflow, setWorkflow] = useState<WorkflowData | null>(null);
  const [contextMenu, setContextMenu] = useState<{ step: WorkflowStep; rect: DOMRect } | null>(null);

  // Integration modals (kept for publish flow)
  const [showIntegrationRequiredModal, setShowIntegrationRequiredModal] = useState(false);
  const [showIntegrationSetupModal, setShowIntegrationSetupModal] = useState(false);
  const [setupIntegrationType, setSetupIntegrationType] = useState<string | null>(null);
  const [connectedIntegrations, setConnectedIntegrations] = useState<string[]>([]);

  const mockHealthData: WorkflowHealthData = {
    status: "needs_attention",
    reason: "Slack notification failed in 3 of the last 10 runs.",
    signals: {
      failureRate: { value: "30%", status: "warning" },
      avgRunTime: { value: "2.5min", status: "good" },
      pendingApprovals: { value: 0, status: "good" },
      missingIntegrations: { value: ["Slack"], status: "critical" },
      aiDetectedIssues: { value: 2, status: "warning" },
    },
    recentPerformance: {
      totalRuns: 10,
      completed: 7,
      failed: 3,
      awaitingApproval: 0,
    },
  };

  /* ── Sync read-only state to AIBox context when time travel changes ── */
  useEffect(() => {
    if (timeTravelActive) {
      setAiBoxPageContext(prev => prev ? { ...prev, isReadOnly: true } : prev);
    } else {
      setAiBoxPageContext(prev => prev ? { ...prev, isReadOnly: false } : prev);
    }
  }, [timeTravelActive, setAiBoxPageContext]);

  // Load workflow — 4 clean playbook steps
  useEffect(() => {
    setWorkflow({
      id: workflowId,
      name: workflowName || "Critical Alert Response",
      steps: [
        {
          id: "step-1",
          templateId: "alert-trigger",
          name: "Alert Trigger",
          status: "idle",
        },
        {
          id: "step-2",
          templateId: "create-case",
          name: "Create Investigation Case",
          status: "idle",
        },
        {
          id: "step-3",
          templateId: "assign-analyst",
          name: "Assign Analyst",
          status: "idle",
        },
        {
          id: "step-4",
          templateId: "notify-slack",
          name: "Notify Slack",
          status: "idle",
          requiresIntegration: "Slack",
        },
      ],
    });
  }, [workflowId, workflowName]);

  /* ── Listen for AI-generated canvas updates ── */
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail?.steps && Array.isArray(detail.steps)) {
        setWorkflow(prev => ({
          id: prev?.id || workflowId,
          name: prev?.name || workflowName || "New Workflow",
          steps: detail.steps as WorkflowStep[],
        }));
      }
    };
    window.addEventListener("workflow-canvas-update", handler);
    return () => window.removeEventListener("workflow-canvas-update", handler);
  }, [workflowId, workflowName]);

  /* ── Listen for semantic AI canvas edits (add/remove/replace steps) ── */
  useEffect(() => {
    const handler = (e: Event) => {
      const op = (e as CustomEvent).detail;
      if (!op?.type) return;

      setWorkflow(prev => {
        if (!prev) return prev;
        const steps = [...prev.steps];

        switch (op.type) {
          case "add-after": {
            const idx = steps.findIndex(s => s.templateId === op.afterTemplateId);
            const newStep: WorkflowStep = { ...op.newStep, status: "idle" as StepStatus };
            if (idx >= 0) {
              steps.splice(idx + 1, 0, newStep);
            } else {
              steps.push(newStep);
            }
            break;
          }
          case "add-end": {
            const newStep: WorkflowStep = { ...op.newStep, status: "idle" as StepStatus };
            steps.push(newStep);
            break;
          }
          case "remove": {
            const removeIdx = steps.findIndex(s => s.templateId === op.templateId);
            if (removeIdx >= 0) steps.splice(removeIdx, 1);
            break;
          }
          case "replace": {
            const replaceIdx = steps.findIndex(s => s.templateId === op.oldTemplateId);
            if (replaceIdx >= 0) {
              steps[replaceIdx] = { ...op.newStep, status: "idle" as StepStatus };
            }
            break;
          }
          case "change-trigger": {
            if (steps.length > 0) {
              steps[0] = { ...op.newStep, status: "idle" as StepStatus };
            }
            break;
          }
        }

        return { ...prev, steps };
      });
    };
    window.addEventListener("workflow-canvas-edit", handler);
    return () => window.removeEventListener("workflow-canvas-edit", handler);
  }, []);

  /* ── Step actions ── */

  const deleteStep = useCallback((stepId: string) => {
    setWorkflow(prev => {
      if (!prev) return prev;
      return { ...prev, steps: prev.steps.filter(s => s.id !== stepId) };
    });
  }, []);

  const handleStepClick = useCallback((step: WorkflowStep, e: React.MouseEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setContextMenu({ step, rect });
  }, []);

  const handleExplainStep = useCallback((step: WorkflowStep) => {
    const description = STEP_DESCRIPTIONS[step.templateId] || "This step is configured and ready to run.";
    const ctx = buildWorkflowAiContext({
      state: "explain",
      workflowId: `${workflowId}:step:${step.id}`,
      workflowName: workflowName || "Workflow",
    });
    openAiBox({
      ...ctx,
      greeting: `**${step.name}**\n\n${description}`,
      suggestions: [
        { label: "How can I customize this step?", prompt: `How can I customize the "${step.name}" step?` },
        { label: "What happens if this step fails?", prompt: `What happens if the "${step.name}" step fails?` },
        { label: "Add a step after this one", prompt: `Add a step after "${step.name}"` },
      ],
    });
  }, [openAiBox, workflowId, workflowName]);

  const handleModifyWithAI = useCallback((step: WorkflowStep) => {
    const ctx = buildWorkflowAiContext({
      state: "edit",
      workflowId: `${workflowId}:step:${step.id}`,
      workflowName: workflowName || "Workflow",
    });
    openAiBox({
      ...ctx,
      greeting: `I'm ready to help you modify **${step.name}**. What would you like to change?\n\nYou can say things like:\n• "Change the notification channel"\n• "Add a 10 minute delay"\n• "Route to a different team"\n• "Add approval before this step"`,
      suggestions: [
        { label: "Change configuration", prompt: `Modify the "${step.name}" step configuration` },
        { label: "Add step before this", prompt: `Add a new step before "${step.name}"` },
        { label: "Add step after this", prompt: `Add a new step after "${step.name}"` },
        { label: "Replace with different action", prompt: `Replace "${step.name}" with a different action` },
      ],
    });
  }, [openAiBox, workflowId, workflowName]);

  /* ── Integration / publish flow ── */

  const getMissingIntegrations = useCallback(() => {
    if (!workflow) return [];
    const required = workflow.steps
      .filter(s => s.requiresIntegration)
      .map(s => s.requiresIntegration as string);
    const unique = Array.from(new Set(required));
    return unique
      .filter(int => !connectedIntegrations.includes(int))
      .map(intName => ({
        id: intName.toLowerCase(),
        name: intName,
        provider: intName,
        isConnected: false,
        requiredBySteps: workflow.steps.filter(s => s.requiresIntegration === intName).map(s => s.name),
      }));
  }, [workflow, connectedIntegrations]);

  const handlePublish = useCallback(() => {
    const missing = getMissingIntegrations();
    if (missing.length > 0) {
      setShowIntegrationRequiredModal(true);
    } else {
      debug.log("Publishing workflow...");
    }
  }, [getMissingIntegrations]);

  const handleConfigureIntegrations = useCallback(() => {
    setShowIntegrationRequiredModal(false);
    const missing = getMissingIntegrations();
    if (missing.length > 0) {
      setSetupIntegrationType(missing[0].id);
      setShowIntegrationSetupModal(true);
    }
  }, [getMissingIntegrations]);

  const handleIntegrationSetupComplete = useCallback(() => {
    if (setupIntegrationType) {
      setConnectedIntegrations(prev => [
        ...prev,
        setupIntegrationType.charAt(0).toUpperCase() + setupIntegrationType.slice(1),
      ]);
    }
    setShowIntegrationSetupModal(false);
    setSetupIntegrationType(null);
    setTimeout(() => {
      const stillMissing = getMissingIntegrations();
      if (stillMissing.length > 0) {
        setShowIntegrationRequiredModal(true);
      }
    }, 300);
  }, [setupIntegrationType, getMissingIntegrations]);

  const handleTestRun = useCallback(() => {
    if (!workflow) return;
    engineTestRun(workflow.id, workflow.name);
  }, [workflow, engineTestRun]);

  /* ── Open AI to edit/create from scratch ── */
  const handleCreateWithAI = useCallback(() => {
    openAiBox(buildWorkflowAiContext({
      state: "edit",
      workflowId,
      workflowName: workflowName || "New Workflow",
    }));
  }, [openAiBox, workflowId, workflowName]);

  /* ── Open AI Insights ── */
  const handleViewInsights = useCallback(() => {
    openAiBox(buildWorkflowAiContext({
      state: "diagnose",
      workflowId,
      workflowName: workflowName || "Workflow",
    }));
  }, [openAiBox, workflowId, workflowName]);

  /* ── Render ── */

  const stepCount = workflow?.steps.length ?? 0;

  return (
    <div className="flex h-[calc(100vh-200px)] gap-[16px]">
      {/* ── CANVAS ── */}
      <div
        className="flex-1 min-w-0 rounded-[10px] flex flex-col"
        style={{
          backgroundColor: colors.bgCard,
          border: `1px solid ${colors.border}`,
        }}
      >
        {/* Canvas Header */}
        <div
          className="px-[16px] py-[12px] flex items-center justify-between shrink-0"
          style={{ borderBottom: `1px solid ${colors.border}` }}
        >
          <div className="flex items-center gap-[10px]">
            <h3 className="text-[13px]" style={{ color: colors.textPrimary, fontWeight: 600 }}>
              Playbook
            </h3>
            <span className="text-[11px]" style={{ color: colors.textMuted }}>
              {stepCount} {stepCount === 1 ? "step" : "steps"}
            </span>
          </div>

          <div className="flex items-center gap-[6px]">
            {/* Generate with AI */}
            <button
              onClick={timeTravelActive ? undefined : handleCreateWithAI}
              disabled={timeTravelActive}
              className="flex items-center gap-[6px] rounded-[6px] px-[10px] py-[6px] text-[11px] transition-colors"
              style={{
                backgroundColor: `${colors.accent}15`,
                border: `1px solid ${colors.accent}`,
                color: colors.accent,
                fontWeight: 600,
                opacity: timeTravelActive ? 0.5 : 1,
                cursor: timeTravelActive ? "not-allowed" : "pointer",
              }}
              onMouseEnter={e => { if (!timeTravelActive) e.currentTarget.style.backgroundColor = `${colors.accent}25`; }}
              onMouseLeave={e => { if (!timeTravelActive) e.currentTarget.style.backgroundColor = `${colors.accent}15`; }}
            >
              <Sparkles size={12} strokeWidth={2} />
              Edit with AI
            </button>

            <button
              disabled={timeTravelActive}
              className="flex items-center gap-[6px] rounded-[6px] px-[10px] py-[6px] text-[11px] transition-colors"
              style={{
                backgroundColor: "transparent",
                border: `1px solid ${colors.border}`,
                color: timeTravelActive ? colors.textDim : colors.textSecondary,
                fontWeight: 500,
                opacity: timeTravelActive ? 0.5 : 1,
                cursor: timeTravelActive ? "not-allowed" : "pointer",
              }}
              onMouseEnter={e => { if (!timeTravelActive) e.currentTarget.style.backgroundColor = colors.bgCardHover; }}
              onMouseLeave={e => { if (!timeTravelActive) e.currentTarget.style.backgroundColor = "transparent"; }}
            >
              <Save size={12} strokeWidth={2} />
              Save
            </button>
            <button
              disabled={timeTravelActive}
              onClick={timeTravelActive ? undefined : handleTestRun}
              className="flex items-center gap-[6px] rounded-[6px] px-[10px] py-[6px] text-[11px] transition-colors"
              style={{
                backgroundColor: "transparent",
                border: `1px solid ${colors.border}`,
                color: timeTravelActive ? colors.textDim : colors.textSecondary,
                fontWeight: 500,
                opacity: timeTravelActive ? 0.5 : 1,
                cursor: timeTravelActive ? "not-allowed" : "pointer",
              }}
              onMouseEnter={e => { if (!timeTravelActive) e.currentTarget.style.backgroundColor = colors.bgCardHover; }}
              onMouseLeave={e => { if (!timeTravelActive) e.currentTarget.style.backgroundColor = "transparent"; }}
            >
              <TestTube size={12} strokeWidth={2} />
              Test Run
            </button>
            <button
              disabled={timeTravelActive}
              onClick={timeTravelActive ? undefined : handlePublish}
              className="flex items-center gap-[6px] rounded-[6px] px-[10px] py-[6px] text-[11px] transition-colors"
              style={{
                backgroundColor: timeTravelActive ? colors.bgCardHover : colors.buttonPrimary,
                color: timeTravelActive ? colors.textDim : "#fff",
                fontWeight: 600,
                opacity: timeTravelActive ? 0.5 : 1,
                cursor: timeTravelActive ? "not-allowed" : "pointer",
              }}
              onMouseEnter={e => { if (!timeTravelActive) e.currentTarget.style.backgroundColor = colors.buttonPrimaryHover; }}
              onMouseLeave={e => { if (!timeTravelActive) e.currentTarget.style.backgroundColor = colors.buttonPrimary; }}
            >
              <Rocket size={12} strokeWidth={2} />
              Publish
            </button>
          </div>
        </div>

        {/* Canvas Content */}
        <div
          className="flex-1 overflow-y-auto p-[32px]"
          onClick={() => setContextMenu(null)}
        >
          {/* Workflow Health Summary */}
          {workflow && stepCount > 0 && (
            <div className="max-w-[520px] mx-auto mb-[24px]">
              <WorkflowHealthSummary health={mockHealthData} onViewDetails={handleViewInsights} />
            </div>
          )}

          {stepCount === 0 ? (
            /* ── Empty state — AI-first prompt ── */
            <div className="flex flex-col items-center justify-center h-full">
              <div
                className="size-[64px] rounded-full flex items-center justify-center mb-[16px]"
                style={{
                  backgroundColor: `${colors.accent}10`,
                  border: `1px solid ${colors.accent}30`,
                }}
              >
                <Sparkles size={28} color={colors.accent} strokeWidth={1.5} />
              </div>
              <h4
                className="text-[15px] mb-[6px]"
                style={{ color: colors.textPrimary, fontWeight: 600 }}
              >
                Build with AI
              </h4>
              <p
                className="text-[12px] text-center max-w-[380px] mb-[20px]"
                style={{ color: colors.textMuted, lineHeight: 1.6 }}
              >
                Describe what you want this workflow to do in plain language.
                Alex will create the steps for you.
              </p>
              <button
                onClick={handleCreateWithAI}
                className="flex items-center gap-[8px] rounded-[8px] px-[20px] py-[10px] text-[12px] transition-colors cursor-pointer"
                style={{
                  backgroundColor: colors.accent,
                  color: "#fff",
                  fontWeight: 600,
                }}
                onMouseEnter={e => { e.currentTarget.style.opacity = "0.9"; }}
                onMouseLeave={e => { e.currentTarget.style.opacity = "1"; }}
              >
                <MessageCircle size={14} strokeWidth={2} />
                Start a conversation
              </button>
            </div>
          ) : (
            /* ── Playbook flow ── */
            <div className="max-w-[520px] mx-auto">
              {workflow?.steps.map((step, index) => {
                const StepIcon = getStepIcon(step.templateId);
                const statusColor = STATUS_COLORS[step.status];
                const StatusIcon = STATUS_ICONS[step.status];
                const isLast = index === (workflow?.steps.length ?? 1) - 1;
                const isMenuOpen = contextMenu?.step.id === step.id;
                const description = STEP_DESCRIPTIONS[step.templateId] || "Configured step.";

                return (
                  <div key={step.id} className="relative">
                    {/* Connector line */}
                    {!isLast && (
                      <div
                        className="absolute left-[27px] top-[56px] bottom-[-4px] w-[2px]"
                        style={{ backgroundColor: colors.border }}
                      />
                    )}

                    {/* Step card */}
                    <div
                      onClick={(e) => handleStepClick(step, e)}
                      className="flex items-start gap-[14px] p-[14px] rounded-[10px] mb-[8px] transition-all cursor-pointer group"
                      style={{
                        backgroundColor: isMenuOpen ? `${colors.accent}06` : "transparent",
                        border: `1px solid ${isMenuOpen ? colors.accent : colors.border}`,
                      }}
                      onMouseEnter={e => {
                        if (!isMenuOpen) {
                          e.currentTarget.style.backgroundColor = colors.bgCardHover;
                          e.currentTarget.style.borderColor = `${colors.accent}40`;
                        }
                      }}
                      onMouseLeave={e => {
                        if (!isMenuOpen) {
                          e.currentTarget.style.backgroundColor = "transparent";
                          e.currentTarget.style.borderColor = colors.border;
                        }
                      }}
                    >
                      {/* Step icon */}
                      <div
                        className="size-[42px] rounded-[10px] flex items-center justify-center shrink-0 relative"
                        style={{
                          backgroundColor: `${colors.accent}12`,
                          border: `1px solid ${colors.accent}30`,
                        }}
                      >
                        <StepIcon size={18} color={colors.accent} strokeWidth={2} />
                        {/* Status dot */}
                        <div
                          className="absolute -bottom-[3px] -right-[3px] size-[14px] rounded-full flex items-center justify-center"
                          style={{
                            backgroundColor: colors.bgCard,
                            border: `2px solid ${statusColor}`,
                          }}
                        >
                          <StatusIcon
                            size={7}
                            color={statusColor}
                            strokeWidth={2.5}
                            className={step.status === "running" ? "animate-spin" : ""}
                          />
                        </div>
                      </div>

                      {/* Step info */}
                      <div className="flex-1 min-w-0 pt-[2px]">
                        <div className="flex items-center gap-[8px] mb-[3px]">
                          <span
                            className="text-[12px] truncate"
                            style={{ color: colors.textPrimary, fontWeight: 600 }}
                          >
                            {step.name}
                          </span>
                          {step.requiresIntegration && (
                            <span
                              className="text-[9px] px-[6px] py-[1px] rounded-[4px] shrink-0"
                              style={{
                                backgroundColor: `${colors.accent}12`,
                                color: colors.accent,
                                fontWeight: 600,
                              }}
                            >
                              {step.requiresIntegration}
                            </span>
                          )}
                          {step.executionTime && (
                            <span className="text-[10px] shrink-0" style={{ color: colors.textDim }}>
                              {step.executionTime}
                            </span>
                          )}
                        </div>
                        <p
                          className="text-[11px] line-clamp-2"
                          style={{ color: colors.textMuted, lineHeight: 1.5 }}
                        >
                          {description}
                        </p>
                      </div>

                      {/* Click hint */}
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-[4px]">
                        <ChevronDown size={14} color={colors.textDim} strokeWidth={2} />
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Add step hint — points to AI */}
              {!timeTravelActive && (
                <button
                  onClick={handleCreateWithAI}
                  className="w-full flex items-center justify-center gap-[8px] py-[12px] rounded-[10px] mt-[4px] transition-colors cursor-pointer group"
                  style={{
                    backgroundColor: "transparent",
                    border: `1px dashed ${colors.border}`,
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.backgroundColor = `${colors.accent}06`;
                    e.currentTarget.style.borderColor = colors.accent;
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.backgroundColor = "transparent";
                    e.currentTarget.style.borderColor = colors.border;
                  }}
                >
                  <Sparkles size={13} color={colors.accent} strokeWidth={2} />
                  <span className="text-[11px]" style={{ color: colors.accent, fontWeight: 500 }}>
                    Ask AI to add more steps
                  </span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Step Context Menu (floating popover) ── */}
      {contextMenu && (
        <StepContextMenu
          step={contextMenu.step}
          anchorRect={contextMenu.rect}
          onClose={() => setContextMenu(null)}
          onExplain={() => handleExplainStep(contextMenu.step)}
          onRemove={() => deleteStep(contextMenu.step.id)}
          onModifyWithAI={() => handleModifyWithAI(contextMenu.step)}
          disabled={timeTravelActive}
        />
      )}

      {/* Integration Modals */}
      <IntegrationRequiredModal
        isOpen={showIntegrationRequiredModal}
        onClose={() => setShowIntegrationRequiredModal(false)}
        missingIntegrations={getMissingIntegrations()}
        onConfigureIntegrations={handleConfigureIntegrations}
        onPublishLater={() => {
          setShowIntegrationRequiredModal(false);
        }}
      />
      <IntegrationSetupModal
        isOpen={showIntegrationSetupModal}
        onClose={() => {
          setShowIntegrationSetupModal(false);
          setSetupIntegrationType(null);
        }}
        integrationType={setupIntegrationType as any}
        onComplete={handleIntegrationSetupComplete}
      />
    </div>
  );
}

export const WorkflowBuilder = React.memo(WorkflowBuilderInner);
export default WorkflowBuilder;