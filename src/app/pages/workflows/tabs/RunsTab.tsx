/**
 * Runs Tab — Workflow-scoped execution history
 *
 * Shows execution instances for a specific workflow.
 * Each run displays: Run ID, Triggered By, Start Time, Duration, Status
 * with actions: View Run, Replay, Debug, Ask AI
 */

import React, { useState, useMemo } from "react";
import {
  Play, Eye, MessageCircle, Search,
  Clock, User, Zap, RotateCcw, Bug,
} from "lucide-react";
import { toast } from "sonner";
import { colors } from "../../../shared/design-system/tokens";
import type { WorkflowRun, RunStatus, TriggerSource } from "../types";
import { ModifiedInputModal } from "./ModifiedInputModal";
import { useTimeTravel } from "../../../shared/contexts/TimeTravelContext";
import { usePlaybookEngine } from "../engine";

/* ================================================================
   HELPERS
   ================================================================ */

type ReplayMode = "entire" | "from_failed" | "modified_input";

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

/* ================================================================
   REPLAY MODAL COMPONENT
   ================================================================ */

function ReplayModal({
  run,
  onConfirm,
  onCancel,
}: {
  run: WorkflowRun;
  onConfirm: (mode: ReplayMode) => void;
  onCancel: () => void;
}) {
  const [selectedMode, setSelectedMode] = useState<ReplayMode>("entire");

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
        className="fixed left-1/2 top-1/2 z-[101] w-[480px] rounded-[12px] p-[24px]"
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
            Replay Run
          </h3>
          <p className="text-[12px]" style={{ color: colors.textMuted }}>
            Choose replay mode for run <span style={{ fontFamily: "monospace", color: colors.low }}>{run.id}</span>:
          </p>
        </div>

        {/* Replay Options */}
        <div className="mb-[24px] space-y-[10px]">
          {/* Option 1: Replay Entire Workflow */}
          <label
            className="flex items-start gap-[12px] p-[14px] rounded-[8px] cursor-pointer transition-all"
            style={{
              border: `1px solid ${selectedMode === "entire" ? colors.accent : colors.border}`,
              backgroundColor: selectedMode === "entire" ? `${colors.accent}10` : "transparent",
            }}
          >
            <input
              type="radio"
              name="replayMode"
              value="entire"
              checked={selectedMode === "entire"}
              onChange={() => setSelectedMode("entire")}
              style={{ marginTop: "2px" }}
            />
            <div className="flex-1">
              <div className="text-[13px] mb-[4px]" style={{ color: colors.textPrimary, fontWeight: 600 }}>
                Replay Entire Workflow
              </div>
              <div className="text-[12px]" style={{ color: colors.textMuted }}>
                Re-execute all steps from the beginning with the same configuration
              </div>
            </div>
          </label>

          {/* Option 2: Replay From Failed Step */}
          <label
            className="flex items-start gap-[12px] p-[14px] rounded-[8px] cursor-pointer transition-all"
            style={{
              border: `1px solid ${selectedMode === "from_failed" ? colors.accent : colors.border}`,
              backgroundColor: selectedMode === "from_failed" ? `${colors.accent}10` : "transparent",
              opacity: run.status !== "failed" ? 0.5 : 1,
              cursor: run.status !== "failed" ? "not-allowed" : "pointer",
            }}
          >
            <input
              type="radio"
              name="replayMode"
              value="from_failed"
              checked={selectedMode === "from_failed"}
              onChange={() => setSelectedMode("from_failed")}
              disabled={run.status !== "failed"}
              style={{ marginTop: "2px" }}
            />
            <div className="flex-1">
              <div className="text-[13px] mb-[4px]" style={{ color: colors.textPrimary, fontWeight: 600 }}>
                Replay From Failed Step
              </div>
              <div className="text-[12px]" style={{ color: colors.textMuted }}>
                Resume execution from the step that failed
                {run.status !== "failed" && " (only available for failed runs)"}
              </div>
            </div>
          </label>

          {/* Option 3: Replay With Modified Input */}
          <label
            className="flex items-start gap-[12px] p-[14px] rounded-[8px] cursor-pointer transition-all"
            style={{
              border: `1px solid ${selectedMode === "modified_input" ? colors.accent : colors.border}`,
              backgroundColor: selectedMode === "modified_input" ? `${colors.accent}10` : "transparent",
            }}
          >
            <input
              type="radio"
              name="replayMode"
              value="modified_input"
              checked={selectedMode === "modified_input"}
              onChange={() => setSelectedMode("modified_input")}
              style={{ marginTop: "2px" }}
            />
            <div className="flex-1">
              <div className="text-[13px] mb-[4px]" style={{ color: colors.textPrimary, fontWeight: 600 }}>
                Replay With Modified Input
              </div>
              <div className="text-[12px]" style={{ color: colors.textMuted }}>
                Re-run the workflow with different input parameters
              </div>
            </div>
          </label>
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
            onClick={() => onConfirm(selectedMode)}
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
            Replay
          </button>
        </div>
      </div>
    </>
  );
}

/* ================================================================
   COMPONENT
   ================================================================ */

interface RunsTabProps {
  workflowId: string;
  onDebugRun?: (runId: string) => void;
  onAskAI?: (run: WorkflowRun) => void;
}

export default function RunsTab({ workflowId, onDebugRun, onAskAI }: RunsTabProps) {
  const { getRunsForPlaybook, replayRun: engineReplayRun, version } = usePlaybookEngine();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<RunStatus | "all">("all");
  const [replayModalRun, setReplayModalRun] = useState<WorkflowRun | null>(null);
  const [modifiedInputModalRun, setModifiedInputModalRun] = useState<WorkflowRun | null>(null);
  const { isActive: timeTravelActive } = useTimeTravel();

  // Handle replay confirmation — delegates to PlaybookEngine
  const handleReplayConfirm = (mode: ReplayMode) => {
    if (!replayModalRun) return;

    // If mode is modified_input, show the modified input modal
    if (mode === "modified_input") {
      setReplayModalRun(null);
      setModifiedInputModalRun(replayModalRun);
      return;
    }

    // Delegate to PlaybookEngine — creates a NEW run, never overwrites
    const newRun = engineReplayRun(replayModalRun.id, mode);

    // Toast notification
    const modeLabels: Record<string, string> = {
      entire: "Replay Entire Run",
      from_failed: "Replay From Failed Step",
    };
    if (newRun) {
      toast.success(`Replay started: ${newRun.id}`, {
        description: `${modeLabels[mode] || mode} — source: ${replayModalRun.id}`,
        duration: 4000,
      });
    }

    // Close modal
    setReplayModalRun(null);
  };

  // Handle modified input replay confirmation
  const handleModifiedInputConfirm = (modifiedInputs: Record<string, string>) => {
    if (!modifiedInputModalRun) return;

    // Delegate to PlaybookEngine with modified inputs
    const newRun = engineReplayRun(modifiedInputModalRun.id, "modified_input", modifiedInputs);

    // Toast notification
    if (newRun) {
      toast.success(`Replay started: ${newRun.id}`, {
        description: `Replay With Modified Input — source: ${modifiedInputModalRun.id}`,
        duration: 4000,
      });
    }

    // Close modal
    setModifiedInputModalRun(null);
  };

  // Get all runs for this playbook from the engine (reactive via version)
  const workflowRuns = useMemo(() => {
    return getRunsForPlaybook(workflowId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workflowId, version]);

  // Apply search and filters
  const filteredRuns = useMemo(() => {
    return workflowRuns.filter((run) => {
      const matchesSearch =
        searchQuery === "" ||
        run.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (run.triggeredBy?.toLowerCase() || "").includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "all" || run.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [workflowRuns, searchQuery, statusFilter]);

  // Status badge helper
  const getStatusBadge = (status: RunStatus) => {
    const styles: Record<RunStatus, { bg: string; text: string; label: string }> = {
      queued: { bg: "rgba(124, 141, 166, 0.2)", text: "#7c8da6", label: "Queued" },
      running: { bg: "rgba(43, 183, 255, 0.2)", text: "#2bb7ff", label: "Running" },
      waiting_approval: { bg: "rgba(255, 159, 67, 0.2)", text: "#ff9f43", label: "Awaiting Approval" },
      paused: { bg: "rgba(255, 159, 67, 0.2)", text: "#ff9f43", label: "Paused — Integration Required" },
      completed: { bg: "rgba(12, 207, 146, 0.2)", text: "#0ccf92", label: "Completed" },
      failed: { bg: "rgba(255, 77, 79, 0.2)", text: "#ff4d4f", label: "Failed" },
      cancelled: { bg: "rgba(124, 141, 166, 0.2)", text: "#7c8da6", label: "Cancelled" },
    };
    const style = styles[status];
    return (
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "6px",
          padding: "4px 12px",
          borderRadius: "12px",
          fontSize: "13px",
          fontWeight: 500,
          background: style.bg,
          color: style.text,
        }}
      >
        {style.label}
      </span>
    );
  };

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
          background: "#050B11",
          color: "#96a4b2",
        }}
      >
        {icons[triggeredBy]}
        {labels[triggeredBy]}
      </span>
    );
  };

  return (
    <div style={{ padding: "24px" }}>
      {/* Header with search and filters */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          marginBottom: "24px",
        }}
      >
        {/* Search */}
        <div style={{ position: "relative", flex: 1, maxWidth: "400px" }}>
          <Search
            size={16}
            style={{
              position: "absolute",
              left: "12px",
              top: "50%",
              transform: "translateY(-50%)",
              color: "#96a4b2",
            }}
          />
          <input
            type="text"
            placeholder="Search by run ID or user..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: "100%",
              padding: "8px 12px 8px 36px",
              borderRadius: "8px",
              border: `1px solid ${colors.border}`,
              background: colors.bgCard,
              color: colors.textPrimary,
              fontSize: "14px",
            }}
          />
        </div>

        {/* Status filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as RunStatus | "all")}
          style={{
            padding: "8px 12px",
            borderRadius: "8px",
            border: `1px solid ${colors.border}`,
            background: colors.bgCard,
            color: colors.textPrimary,
            fontSize: "14px",
          }}
        >
          <option value="all">All Status</option>
          <option value="running">Running</option>
          <option value="completed">Completed</option>
          <option value="failed">Failed</option>
          <option value="approval_required">Awaiting Approval</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Runs table or empty state */}
      {filteredRuns.length === 0 ? (
        <div
          style={{
            padding: "64px 24px",
            textAlign: "center",
            color: colors.textMuted,
          }}
        >
          <Play size={48} style={{ margin: "0 auto 16px", opacity: 0.3 }} />
          <p style={{ fontSize: "16px", marginBottom: "8px" }}>
            {workflowRuns.length === 0 ? "No runs yet" : "No matching runs"}
          </p>
          <p style={{ fontSize: "14px" }}>
            {workflowRuns.length === 0
              ? "Execute this workflow to see run history here."
              : "Try adjusting your filters."}
          </p>
        </div>
      ) : (
        <div
          style={{
            border: `1px solid ${colors.border}`,
            borderRadius: "8px",
            overflow: "hidden",
          }}
        >
          {/* Table header */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "160px 180px 200px 120px 1fr 200px",
              gap: "16px",
              padding: "12px 16px",
              background: colors.tableHeaderBg,
              borderBottom: `1px solid ${colors.border}`,
              fontSize: "13px",
              fontWeight: 600,
              color: colors.textMuted,
            }}
          >
            <div>Run ID</div>
            <div>Triggered By</div>
            <div>Start Time</div>
            <div>Duration</div>
            <div>Status</div>
            <div>Actions</div>
          </div>

          {/* Table rows */}
          {filteredRuns.map((run) => (
            <div
              key={run.id}
              style={{
                display: "grid",
                gridTemplateColumns: "160px 180px 200px 120px 1fr 200px",
                gap: "16px",
                padding: "16px",
                borderBottom: `1px solid ${colors.border}`,
                fontSize: "14px",
                color: colors.textPrimary,
              }}
            >
              <div style={{ fontFamily: "monospace", color: colors.low }}>
                {run.id}
              </div>
              <div>{getTriggerBadge(run.triggerSource, run.triggeredBy)}</div>
              <div style={{ color: colors.textMuted }}>{formatTimestamp(run.startTime)}</div>
              <div style={{ color: colors.textMuted }}>
                {run.duration || "—"}
              </div>
              <div>{getStatusBadge(run.status)}</div>
              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                <button
                  style={{
                    padding: "6px 10px",
                    borderRadius: "6px",
                    border: `1px solid ${colors.border}`,
                    background: colors.bgCard,
                    color: colors.textPrimary,
                    fontSize: "13px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                  }}
                  title="View Run"
                >
                  <Eye size={14} />
                </button>
                <button
                  onClick={() => !timeTravelActive && setReplayModalRun(run)}
                  disabled={timeTravelActive}
                  style={{
                    padding: "6px 10px",
                    borderRadius: "6px",
                    border: `1px solid ${colors.border}`,
                    background: colors.bgCard,
                    color: timeTravelActive ? colors.textDim : colors.textPrimary,
                    fontSize: "13px",
                    cursor: timeTravelActive ? "not-allowed" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                    opacity: timeTravelActive ? 0.5 : 1,
                  }}
                  title={timeTravelActive ? "Replay disabled in Time Travel mode" : "Replay Run"}
                >
                  <RotateCcw size={14} />
                </button>
                <button
                  onClick={() => onDebugRun?.(run.id)}
                  style={{
                    padding: "6px 10px",
                    borderRadius: "6px",
                    border: `1px solid ${colors.border}`,
                    background: colors.bgCard,
                    color: colors.textPrimary,
                    fontSize: "13px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                  }}
                  title="Debug Run"
                >
                  <Bug size={14} />
                </button>
                <button
                  onClick={() => onAskAI?.(run)}
                  style={{
                    padding: "6px 10px",
                    borderRadius: "6px",
                    border: `1px solid ${colors.border}`,
                    background: colors.bgCard,
                    color: colors.textPrimary,
                    fontSize: "13px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                  }}
                  title="Ask AI"
                >
                  <MessageCircle size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Replay Modal */}
      {replayModalRun && (
        <ReplayModal
          run={replayModalRun}
          onConfirm={handleReplayConfirm}
          onCancel={() => setReplayModalRun(null)}
        />
      )}

      {/* Modified Input Modal */}
      {modifiedInputModalRun && (
        <ModifiedInputModal
          run={modifiedInputModalRun}
          onConfirm={handleModifiedInputConfirm}
          onCancel={() => setModifiedInputModalRun(null)}
        />
      )}
    </div>
  );
}