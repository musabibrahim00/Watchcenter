/**
 * Debug Tab — Step-by-step workflow execution inspector
 *
 * Displays execution timeline with step statuses, durations, outputs, and errors.
 * Shows which integration each step uses (e.g. Slack, Jira, AWS).
 * Designed for non-technical SOC analysts with plain-language feedback.
 */

import React, { useState, useMemo, useEffect } from "react";
import {
  Clock, CheckCircle2, XCircle, AlertTriangle, PlayCircle,
  PauseCircle, MinusCircle, Ban, HelpCircle, ChevronDown, ChevronRight,
  Calendar, User, Zap, Activity, RotateCcw, Plug, Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { colors } from "../../../shared/design-system/tokens";
import type { WorkflowRun, StepExecution, StepExecutionStatus, TriggerSource } from "../types";
import { usePlaybookEngine } from "../engine";
import { IntegrationRequiredPanel } from "../IntegrationRequiredPanel";
import { ApprovalPanel } from "./ApprovalPanel";
import { RunTimeline } from "./RunTimeline";
import { useTimeTravel } from "../../../shared/contexts/TimeTravelContext";

/* ================================================================
   HELPER FUNCTIONS
   ================================================================ */

function formatTimestamp(isoString: string): string {
  const date = new Date(isoString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

function formatTimeOnly(isoString?: string): string {
  if (!isoString) return "—";
  const date = new Date(isoString);
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");
  return `${hours}:${minutes}:${seconds}`;
}

/* ================================================================
   STEP STATUS VISUAL CONFIG
   ================================================================ */

const STEP_STATUS_CONFIG: Record<
  StepExecutionStatus,
  { icon: React.ReactNode; bg: string; text: string; label: string; borderColor: string }
> = {
  pending: {
    icon: <Clock size={14} />,
    bg: "rgba(128,128,128, 0.12)",
    text: "#808080",
    label: "Pending",
    borderColor: colors.border,
  },
  queued: {
    icon: <Clock size={14} />,
    bg: "rgba(128,128,128, 0.15)",
    text: "#96a4b2",
    label: "Queued",
    borderColor: colors.border,
  },
  running: {
    icon: <Loader2 size={14} className="animate-spin" />,
    bg: "rgba(121,136,255, 0.15)",
    text: "#7988FF",
    label: "Running",
    borderColor: "#7988FF",
  },
  success: {
    icon: <CheckCircle2 size={14} />,
    bg: "rgba(47,216,151, 0.12)",
    text: "#2FD897",
    label: "Success",
    borderColor: colors.active,
  },
  failed: {
    icon: <XCircle size={14} />,
    bg: "rgba(255,87,87, 0.12)",
    text: "#FF5757",
    label: "Failed",
    borderColor: colors.critical,
  },
  skipped: {
    icon: <MinusCircle size={14} />,
    bg: "rgba(128,128,128, 0.1)",
    text: "#808080",
    label: "Skipped",
    borderColor: colors.border,
  },
  waiting_approval: {
    icon: <PauseCircle size={14} />,
    bg: "rgba(255,116,10, 0.15)",
    text: "#FF740A",
    label: "Awaiting Approval",
    borderColor: "#FF740A",
  },
  blocked: {
    icon: <Ban size={14} />,
    bg: "rgba(255,116,10, 0.12)",
    text: "#FF740A",
    label: "Blocked",
    borderColor: "#FF740A",
  },
};

/* ================================================================
   COMPONENT
   ================================================================ */

interface DebugTabProps {
  workflowId: string;
  debugRunId?: string;
  initialRunId?: string;
  onAskAI?: (context: { runId: string; workflowName: string; error?: string }) => void;
  /** Notify parent when the selected run changes (for contextual AI panel) */
  onRunSelected?: (run: WorkflowRun | null) => void;
}

export default function DebugTab({ workflowId, debugRunId, initialRunId, onAskAI, onRunSelected }: DebugTabProps) {
  // Get all runs for this playbook from the engine
  const { getRunsForPlaybook, version, connectIntegration, skipBlockedStep, cancelRun, approveStep, rejectStep } = usePlaybookEngine();
  const workflowRuns = useMemo(() => getRunsForPlaybook(workflowId), [workflowId, version]);
  
  // Set initial selected run (debug run or initial run or most recent)
  const initialRun = debugRunId || initialRunId || (workflowRuns.length > 0 ? workflowRuns[0].id : null);
  const [selectedRunId, setSelectedRunId] = useState<string | null>(initialRun);
  const [expandedSteps, setExpandedSteps] = useState<Set<string>>(new Set());
  const { isActive: timeTravelActive } = useTimeTravel();

  const selectedRun = useMemo(() => {
    return workflowRuns.find(r => r.id === selectedRunId) || null;
  }, [workflowRuns, selectedRunId]);

  // Notify parent of selected run changes
  useEffect(() => {
    onRunSelected?.(selectedRun);
  }, [selectedRun, onRunSelected]);

  const toggleStepExpansion = (stepId: string) => {
    setExpandedSteps(prev => {
      const next = new Set(prev);
      if (next.has(stepId)) {
        next.delete(stepId);
      } else {
        next.add(stepId);
      }
      return next;
    });
  };

  // Find blocked integration step
  const blockedStep = useMemo(() => {
    if (!selectedRun?.stepExecutions) return null;
    return selectedRun.stepExecutions.find(step => 
      step.status === "blocked" && 
      step.errorMessage?.includes("integration not connected")
    ) || null;
  }, [selectedRun]);

  // Find waiting approval step
  const approvalStep = useMemo(() => {
    if (!selectedRun?.stepExecutions) return null;
    return selectedRun.stepExecutions.find(step => 
      step.status === "waiting_approval"
    ) || null;
  }, [selectedRun]);

  // Extract integration name from blocked step
  const blockedIntegrationName = useMemo(() => {
    if (!blockedStep?.errorMessage) return null;
    const match = blockedStep.errorMessage.match(/^(.+?) integration not connected/);
    return match ? match[1] : null;
  }, [blockedStep]);

  // Integration action handlers — wired to PlaybookEngine
  const handleConnectIntegration = () => {
    if (timeTravelActive) { toast.error("This action is disabled in Time Travel mode."); return; }
    if (!blockedIntegrationName || !selectedRun || !blockedStep) return;
    connectIntegration(selectedRun.id, blockedStep.stepId);
    toast.success(`${blockedIntegrationName} connected`, {
      description: `Resuming execution of "${blockedStep.stepName}"`,
      duration: 3000,
    });
  };

  const handleSkipStep = () => {
    if (timeTravelActive) { toast.error("This action is disabled in Time Travel mode."); return; }
    if (!blockedStep || !selectedRun) return;
    skipBlockedStep(selectedRun.id, blockedStep.stepId);
    toast.info(`Step skipped: ${blockedStep.stepName}`, {
      description: "Execution will continue with the next step",
      duration: 3000,
    });
  };

  const handleCancelRun = () => {
    if (timeTravelActive) { toast.error("This action is disabled in Time Travel mode."); return; }
    if (!selectedRun) return;
    cancelRun(selectedRun.id);
    toast.error(`Run cancelled: ${selectedRun.id}`, {
      description: "All remaining steps have been cancelled",
      duration: 3000,
    });
  };

  const handleApproveStep = () => {
    if (timeTravelActive) { toast.error("This action is disabled in Time Travel mode."); return; }
    if (!approvalStep || !selectedRun) return;
    approveStep(selectedRun.id, approvalStep.stepId);
    toast.success(`Step approved: ${approvalStep.stepName}`, {
      description: "Execution will continue with the next step",
      duration: 3000,
    });
  };

  const handleRejectStep = () => {
    if (timeTravelActive) { toast.error("This action is disabled in Time Travel mode."); return; }
    if (!approvalStep || !selectedRun) return;
    rejectStep(selectedRun.id, approvalStep.stepId);
    toast.error(`Step rejected: ${approvalStep.stepName}`, {
      description: "Execution will continue with the next step",
      duration: 3000,
    });
  };

  // Step progress summary
  const stepSummary = useMemo(() => {
    if (!selectedRun?.stepExecutions) return null;
    const steps = selectedRun.stepExecutions;
    const total = steps.length;
    const succeeded = steps.filter(s => s.status === "success").length;
    const failed = steps.filter(s => s.status === "failed").length;
    const running = steps.filter(s => s.status === "running").length;
    const blocked = steps.filter(s => s.status === "blocked").length;
    const waitingApproval = steps.filter(s => s.status === "waiting_approval").length;
    const pending = steps.filter(s => s.status === "pending" || s.status === "queued").length;
    return { total, succeeded, failed, running, blocked, waitingApproval, pending };
  }, [selectedRun]);

  // Trigger badge helper
  const getTriggerBadge = (triggeredBy: TriggerSource, user?: string) => {
    const icons: Record<TriggerSource, React.ReactNode> = {
      manual: <User size={14} />,
      schedule: <Clock size={14} />,
      event: <Zap size={14} />,
      manual_replay: <RotateCcw size={14} />,
      replay: <RotateCcw size={14} />,
    };
    const labels: Record<TriggerSource, string> = {
      manual: user ? `Manual (${user})` : "Manual",
      schedule: "Scheduled",
      event: "Event",
      manual_replay: user ? `Replay (${user})` : "Replay",
      replay: user ? `Replay (${user})` : "Replay",
    };
    return (
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "6px",
          padding: "4px 10px",
          borderRadius: "8px",
          fontSize: "13px",
          background: "#050C14",
          color: "#96a4b2",
        }}
      >
        {icons[triggeredBy]}
        {labels[triggeredBy]}
      </span>
    );
  };

  return (
    <div style={{ padding: "24px", height: "100%", overflow: "auto" }}>
      {/* Run Selector */}
      <div style={{ marginBottom: "24px" }}>
        <label
          style={{
            display: "block",
            marginBottom: "8px",
            fontSize: "12px",
            fontWeight: 600,
            color: colors.textMuted,
          }}
        >
          SELECT RUN TO INSPECT
        </label>
        <select
          value={selectedRunId || ""}
          onChange={(e) => setSelectedRunId(e.target.value)}
          style={{
            width: "100%",
            maxWidth: "400px",
            padding: "10px 12px",
            borderRadius: "8px",
            border: `1px solid ${colors.border}`,
            background: colors.bgCard,
            color: colors.textPrimary,
            fontSize: "14px",
          }}
        >
          {workflowRuns.length === 0 && (
            <option value="">No runs available</option>
          )}
          {workflowRuns.map((run) => (
            <option key={run.id} value={run.id}>
              {run.id} — {run.status} — {formatTimestamp(run.startTime)}
            </option>
          ))}
        </select>
      </div>

      {selectedRun ? (
        <>
          {/* Run Metadata */}
          <div
            style={{
              padding: "20px",
              borderRadius: "12px",
              border: `1px solid ${colors.border}`,
              background: colors.bgCard,
              marginBottom: "24px",
            }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "20px",
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: "11px",
                    fontWeight: 600,
                    color: colors.textDim,
                    marginBottom: "6px",
                  }}
                >
                  RUN ID
                </div>
                <div
                  style={{
                    fontSize: "14px",
                    fontFamily: "monospace",
                    color: colors.low,
                  }}
                >
                  {selectedRun.id}
                </div>
              </div>
              <div>
                <div
                  style={{
                    fontSize: "11px",
                    fontWeight: 600,
                    color: colors.textDim,
                    marginBottom: "6px",
                  }}
                >
                  TRIGGERED BY
                </div>
                <div>{getTriggerBadge(selectedRun.triggerSource, selectedRun.triggeredBy)}</div>
              </div>
              <div>
                <div
                  style={{
                    fontSize: "11px",
                    fontWeight: 600,
                    color: colors.textDim,
                    marginBottom: "6px",
                  }}
                >
                  START TIME
                </div>
                <div
                  style={{
                    fontSize: "14px",
                    color: colors.textSecondary,
                  }}
                >
                  {formatTimestamp(selectedRun.startTime)}
                </div>
              </div>
              <div>
                <div
                  style={{
                    fontSize: "11px",
                    fontWeight: 600,
                    color: colors.textDim,
                    marginBottom: "6px",
                  }}
                >
                  DURATION
                </div>
                <div
                  style={{
                    fontSize: "14px",
                    color: colors.textSecondary,
                  }}
                >
                  {selectedRun.duration || "In progress..."}
                </div>
              </div>
            </div>
          </div>

          {/* Step Progress Bar */}
          {stepSummary && stepSummary.total > 0 && (
            <div
              style={{
                padding: "16px 20px",
                borderRadius: "12px",
                border: `1px solid ${colors.border}`,
                background: colors.bgCard,
                marginBottom: "24px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "12px",
                }}
              >
                <span
                  style={{
                    fontSize: "13px",
                    fontWeight: 600,
                    color: colors.textPrimary,
                  }}
                >
                  Step Progress
                </span>
                <span
                  style={{
                    fontSize: "12px",
                    color: colors.textMuted,
                  }}
                >
                  {stepSummary.succeeded} of {stepSummary.total} steps completed
                </span>
              </div>

              {/* Progress segments */}
              <div
                style={{
                  display: "flex",
                  gap: "3px",
                  height: "6px",
                  borderRadius: "3px",
                  overflow: "hidden",
                  background: colors.bgCardHover,
                }}
              >
                {selectedRun.stepExecutions?.map((step, i) => {
                  const cfg = STEP_STATUS_CONFIG[step.status];
                  const bgColor =
                    step.status === "success" ? colors.active
                    : step.status === "failed" ? colors.critical
                    : step.status === "running" ? colors.accent
                    : step.status === "waiting_approval" || step.status === "blocked" ? "#FF740A"
                    : step.status === "skipped" ? "#3a4a5a"
                    : colors.bgCardHover;
                  return (
                    <div
                      key={step.stepId}
                      style={{
                        flex: 1,
                        background: bgColor,
                        borderRadius: "2px",
                        transition: "background 0.3s ease",
                      }}
                    />
                  );
                })}
              </div>

              {/* Legend */}
              <div
                style={{
                  display: "flex",
                  gap: "16px",
                  marginTop: "10px",
                  flexWrap: "wrap",
                }}
              >
                {stepSummary.succeeded > 0 && (
                  <span style={{ fontSize: "11px", color: colors.active, display: "flex", alignItems: "center", gap: "4px" }}>
                    <CheckCircle2 size={10} /> {stepSummary.succeeded} succeeded
                  </span>
                )}
                {stepSummary.running > 0 && (
                  <span style={{ fontSize: "11px", color: colors.accent, display: "flex", alignItems: "center", gap: "4px" }}>
                    <PlayCircle size={10} /> {stepSummary.running} running
                  </span>
                )}
                {stepSummary.blocked > 0 && (
                  <span style={{ fontSize: "11px", color: "#FF740A", display: "flex", alignItems: "center", gap: "4px" }}>
                    <Ban size={10} /> {stepSummary.blocked} blocked
                  </span>
                )}
                {stepSummary.waitingApproval > 0 && (
                  <span style={{ fontSize: "11px", color: "#FF740A", display: "flex", alignItems: "center", gap: "4px" }}>
                    <PauseCircle size={10} /> {stepSummary.waitingApproval} awaiting approval
                  </span>
                )}
                {stepSummary.failed > 0 && (
                  <span style={{ fontSize: "11px", color: colors.critical, display: "flex", alignItems: "center", gap: "4px" }}>
                    <XCircle size={10} /> {stepSummary.failed} failed
                  </span>
                )}
                {stepSummary.pending > 0 && (
                  <span style={{ fontSize: "11px", color: colors.textDim, display: "flex", alignItems: "center", gap: "4px" }}>
                    <Clock size={10} /> {stepSummary.pending} pending
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Run Timeline */}
          <div style={{ marginBottom: "24px" }}>
            <RunTimeline run={selectedRun} />
          </div>

          {/* Step Execution Timeline */}
          <div>
            <h3
              style={{
                fontSize: "14px",
                fontWeight: 600,
                color: colors.textPrimary,
                marginBottom: "16px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <Activity size={16} />
              Step Execution Details
            </h3>

            {selectedRun.stepExecutions && selectedRun.stepExecutions.length > 0 ? (
              <div style={{ position: "relative" }}>
                {/* Timeline line */}
                <div
                  style={{
                    position: "absolute",
                    left: "31px",
                    top: "24px",
                    bottom: "24px",
                    width: "2px",
                    background: `linear-gradient(180deg, ${colors.accent}40 0%, ${colors.border} 100%)`,
                  }}
                />

                {/* Steps */}
                <div style={{ position: "relative", zIndex: 1 }}>
                  {selectedRun.stepExecutions.map((step, index) => {
                    const isExpanded = expandedSteps.has(step.stepId);
                    const hasDetails = step.output || step.errorMessage;
                    const cfg = STEP_STATUS_CONFIG[step.status];
                    const isActive = step.status === "running" || step.status === "waiting_approval" || step.status === "blocked";

                    return (
                      <div
                        key={step.stepId}
                        style={{
                          marginBottom: index < selectedRun.stepExecutions!.length - 1 ? "12px" : "0",
                        }}
                      >
                        {/* Step card */}
                        <div
                          style={{
                            display: "flex",
                            gap: "16px",
                            padding: "16px",
                            borderRadius: "10px",
                            border: `1px solid ${cfg.borderColor}`,
                            background: isActive ? `${cfg.text}06` : colors.bgCard,
                            transition: "border-color 0.3s, background 0.3s",
                          }}
                        >
                          {/* Step number badge */}
                          <div
                            style={{
                              width: "32px",
                              height: "32px",
                              borderRadius: "50%",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: "14px",
                              fontWeight: 600,
                              flexShrink: 0,
                              background: cfg.bg,
                              color: cfg.text,
                              border: `2px solid ${cfg.borderColor}`,
                              transition: "all 0.3s",
                            }}
                          >
                            {index + 1}
                          </div>

                          {/* Step content */}
                          <div style={{ flex: 1, minWidth: 0 }}>
                            {/* Row 1: Name + status badge */}
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "10px",
                                marginBottom: "8px",
                                flexWrap: "wrap",
                              }}
                            >
                              <h4
                                style={{
                                  fontSize: "14px",
                                  fontWeight: 600,
                                  color: colors.textPrimary,
                                }}
                              >
                                {step.stepName}
                              </h4>

                              {/* Status badge */}
                              <span
                                style={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: "5px",
                                  padding: "3px 10px",
                                  borderRadius: "12px",
                                  fontSize: "12px",
                                  fontWeight: 500,
                                  background: cfg.bg,
                                  color: cfg.text,
                                }}
                              >
                                {cfg.icon}
                                {cfg.label}
                              </span>

                              {/* Integration badge */}
                              {step.integrationUsed && (
                                <span
                                  style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: "5px",
                                    padding: "3px 10px",
                                    borderRadius: "12px",
                                    fontSize: "11px",
                                    fontWeight: 500,
                                    background: "rgba(7, 100, 152, 0.15)",
                                    color: colors.low,
                                    border: `1px solid rgba(7, 100, 152, 0.25)`,
                                  }}
                                >
                                  <Plug size={10} />
                                  {step.integrationUsed}
                                </span>
                              )}
                            </div>

                            {/* Row 2: Timing metadata */}
                            <div
                              style={{
                                display: "flex",
                                gap: "20px",
                                fontSize: "12px",
                                color: colors.textMuted,
                                flexWrap: "wrap",
                              }}
                            >
                              {step.startTime && (
                                <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                                  <Clock size={11} />
                                  Started: {formatTimeOnly(step.startTime)}
                                </div>
                              )}
                              {step.endTime && (
                                <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                                  <CheckCircle2 size={11} />
                                  Ended: {formatTimeOnly(step.endTime)}
                                </div>
                              )}
                              {step.duration && (
                                <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                                  <Activity size={11} />
                                  Duration: {step.duration}
                                </div>
                              )}
                            </div>

                            {/* Expandable details */}
                            {hasDetails && (
                              <button
                                onClick={() => toggleStepExpansion(step.stepId)}
                                style={{
                                  marginTop: "10px",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "6px",
                                  padding: "5px 10px",
                                  borderRadius: "6px",
                                  border: `1px solid ${colors.border}`,
                                  background: colors.bgCardHover,
                                  color: colors.textSecondary,
                                  fontSize: "12px",
                                  fontWeight: 500,
                                  cursor: "pointer",
                                  transition: "background 0.2s",
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.background = colors.tableHeaderBg;
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.background = colors.bgCardHover;
                                }}
                              >
                                {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                                {isExpanded ? "Hide" : "Show"} Details
                              </button>
                            )}

                            {/* Expanded details */}
                            {isExpanded && hasDetails && (
                              <div
                                style={{
                                  marginTop: "10px",
                                  padding: "12px",
                                  borderRadius: "8px",
                                  background: step.status === "failed" ? `${colors.critical}08` : colors.bgCardHover,
                                  border: `1px solid ${step.status === "failed" ? `${colors.critical}40` : colors.border}`,
                                }}
                              >
                                {step.output && (
                                  <div style={{ marginBottom: step.errorMessage ? "12px" : "0" }}>
                                    <div
                                      style={{
                                        fontSize: "11px",
                                        fontWeight: 600,
                                        color: colors.textDim,
                                        marginBottom: "6px",
                                      }}
                                    >
                                      OUTPUT
                                    </div>
                                    <div
                                      style={{
                                        fontSize: "13px",
                                        color: colors.textSecondary,
                                        lineHeight: 1.6,
                                      }}
                                    >
                                      {step.output}
                                    </div>
                                  </div>
                                )}
                                {step.errorMessage && (
                                  <div>
                                    <div
                                      style={{
                                        fontSize: "11px",
                                        fontWeight: 600,
                                        color: colors.critical,
                                        marginBottom: "6px",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "6px",
                                      }}
                                    >
                                      <AlertTriangle size={12} />
                                      WHAT WENT WRONG
                                    </div>
                                    <div
                                      style={{
                                        fontSize: "13px",
                                        color: colors.textPrimary,
                                        marginBottom: step.errorDetails ? "8px" : "0",
                                        fontWeight: 500,
                                      }}
                                    >
                                      {step.errorMessage}
                                    </div>
                                    {step.errorDetails && (
                                      <div
                                        style={{
                                          fontSize: "12px",
                                          color: colors.textSecondary,
                                          lineHeight: 1.6,
                                          padding: "8px 12px",
                                          borderRadius: "6px",
                                          background: `${colors.critical}06`,
                                          border: `1px solid ${colors.critical}20`,
                                        }}
                                      >
                                        {step.errorDetails}
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div
                style={{
                  padding: "48px 24px",
                  textAlign: "center",
                  color: colors.textMuted,
                }}
              >
                <Activity size={48} style={{ margin: "0 auto 16px", opacity: 0.3 }} />
                <p style={{ fontSize: "14px" }}>No step execution data available for this run.</p>
              </div>
            )}

            {/* Integration Required Panel */}
            {blockedStep && blockedIntegrationName && selectedRun && (
              <IntegrationRequiredPanel
                integrationName={blockedIntegrationName}
                stepName={blockedStep.stepName}
                runId={selectedRun.id}
                onConnectIntegration={handleConnectIntegration}
                onSkipStep={handleSkipStep}
                onCancelRun={handleCancelRun}
              />
            )}

            {/* Approval Panel */}
            {approvalStep && selectedRun && (
              <ApprovalPanel
                stepName={approvalStep.stepName}
                requestedBy="Workflow Engine"
                runId={selectedRun.id}
                stepId={approvalStep.stepId}
                onApprove={() => handleApproveStep()}
                onReject={() => handleRejectStep()}
              />
            )}
          </div>
        </>
      ) : (
        <div
          style={{
            padding: "64px 24px",
            textAlign: "center",
            color: colors.textMuted,
          }}
        >
          <HelpCircle size={48} style={{ margin: "0 auto 16px", opacity: 0.3 }} />
          <p style={{ fontSize: "16px", marginBottom: "8px" }}>No Run Selected</p>
          <p style={{ fontSize: "14px" }}>Select a run from the dropdown to view its execution timeline.</p>
        </div>
      )}
    </div>
  );
}