/**
 * PlaybookEngine — Centralized workflow execution engine
 *
 * Responsibilities:
 *   - Manages the Playbook -> Runs relationship
 *   - Creates new Run instances (never overwrites previous runs)
 *   - Drives run lifecycle: queued -> running -> completed/failed
 *   - Simulates progressive step-by-step execution with realistic timing
 *   - Each step transitions: pending -> queued -> running -> success/failed
 *   - Notifies subscribers of state changes via callbacks
 *
 * Execution model:
 *   Playbook (== Workflow)
 *     -> Run 001
 *     -> Run 002
 *     -> Run 003
 *     ...
 *
 * Each Run stores:
 *   run_id, playbook_id, trigger_source, status, started_at, ended_at, duration
 *   stepExecutions[] — each with step_id, step_name, status, started_at, ended_at,
 *                      duration, error_message, integration_used
 */

import type {
  WorkflowRun,
  RunStatus,
  TriggerSource,
  StepExecution,
  StepExecutionStatus,
  Playbook,
  RunStatistics,
  TimelineEvent,
  TimelineEventKind,
} from "../types";
import { MOCK_RUNS } from "../mockRunData";
import {
  getStepTemplatesForWorkflow,
} from "../mockStepExecutions";
import type { StepTemplate } from "../mockStepExecutions";

/* ================================================================
   TYPES
   ================================================================ */

export type RunEventType =
  | "run_created"
  | "run_status_changed"
  | "run_completed"
  | "run_failed"
  | "run_paused_integration"
  | "run_waiting_approval"
  | "step_status_changed";

export interface RunEvent {
  type: RunEventType;
  run: WorkflowRun;
  previousStatus?: RunStatus;
  stepId?: string;
  stepStatus?: StepExecutionStatus;
}

export type RunEventListener = (event: RunEvent) => void;

export type ReplayMode = "entire" | "from_failed" | "modified_input";

/* ================================================================
   RUN ID GENERATOR
   ================================================================ */

let globalRunCounter = 1000;

function generateUniqueRunId(): string {
  globalRunCounter += 1;
  return `run-${String(globalRunCounter).padStart(4, "0")}`;
}

/* ================================================================
   DURATION HELPERS
   ================================================================ */

function computeHumanDuration(startIso: string, endIso: string): string {
  const ms = new Date(endIso).getTime() - new Date(startIso).getTime();
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  if (minutes > 0) return `${minutes}m ${String(seconds).padStart(2, "0")}s`;
  return `${seconds}s`;
}

function addSeconds(isoString: string, seconds: number): string {
  const date = new Date(isoString);
  date.setSeconds(date.getSeconds() + seconds);
  return date.toISOString();
}

function calculateStepDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  if (remainingSeconds === 0) return `${minutes}m`;
  return `${minutes}m ${remainingSeconds}s`;
}

/* ================================================================
   PLAYBOOK ENGINE
   ================================================================ */

export class PlaybookEngine {
  /** All runs, keyed by playbook_id (== workflowId) */
  private runsByPlaybook: Record<string, WorkflowRun[]>;

  /** Active timers so we can cancel if needed */
  private activeTimers: Map<string, NodeJS.Timeout[]> = new Map();

  /** Subscribers */
  private listeners: Set<RunEventListener> = new Set();

  /**
   * Simulated set of disconnected integrations.
   * Steps that require an integration in this set will be blocked at runtime.
   */
  private disconnectedIntegrations: Set<string> = new Set(["Slack"]);

  /**
   * Tracks paused runs awaiting integration resolution.
   * Maps runId -> { stepIndex, stepId, integrationName, options }
   * so execution can resume from the correct point.
   */
  private pausedRuns: Map<
    string,
    {
      stepIndex: number;
      stepId: string;
      integrationName: string;
      templates: StepTemplate[];
      failStepIndex: number;
      options?: { replayMode?: ReplayMode; sourceRunId?: string; failureProbability?: number };
    }
  > = new Map();

  constructor() {
    // Seed from existing mock data (deep clone so we don't mutate the module-level object)
    this.runsByPlaybook = {};
    for (const [playbookId, runs] of Object.entries(MOCK_RUNS)) {
      this.runsByPlaybook[playbookId] = runs.map((r) => ({
        ...r,
        stepExecutions: r.stepExecutions?.map((s) => ({ ...s })),
        timelineEvents: r.timelineEvents
          ? r.timelineEvents.map((e) => ({ ...e }))
          : PlaybookEngine.buildRetroactiveTimeline(r),
      }));
    }
  }

  /**
   * Builds timeline events retroactively from a completed/failed/seeded run.
   * Used to give historical mock runs a timeline without re-executing them.
   */
  private static buildRetroactiveTimeline(run: WorkflowRun): TimelineEvent[] {
    const events: TimelineEvent[] = [];

    // Run started
    events.push({
      timestamp: run.startTime,
      kind: "run_started",
      description: `Run started (${run.triggerSource})`,
      status: "running",
    });

    // Step events
    if (run.stepExecutions) {
      for (const step of run.stepExecutions) {
        if (step.status === "pending") continue;

        if (step.startTime && (step.status === "running" || step.status === "success" || step.status === "failed" || step.status === "waiting_approval" || step.status === "blocked")) {
          events.push({
            timestamp: step.startTime,
            kind: "step_started",
            description: `${step.stepName} started`,
            stepName: step.stepName,
            status: "running",
            integrationUsed: step.integrationUsed,
          });
        }

        if (step.status === "success" && step.endTime) {
          events.push({
            timestamp: step.endTime,
            kind: "step_completed",
            description: step.output || `${step.stepName} completed`,
            stepName: step.stepName,
            status: "success",
            integrationUsed: step.integrationUsed,
            duration: step.duration,
          });
        } else if (step.status === "failed" && step.endTime) {
          events.push({
            timestamp: step.endTime,
            kind: "step_failed",
            description: step.errorMessage || `${step.stepName} failed`,
            stepName: step.stepName,
            status: "failed",
            integrationUsed: step.integrationUsed,
            duration: step.duration,
          });
        } else if (step.status === "skipped") {
          const ts = step.endTime || step.startTime || run.startTime;
          events.push({
            timestamp: ts,
            kind: "step_skipped",
            description: step.output || `${step.stepName} skipped`,
            stepName: step.stepName,
            status: "skipped",
            integrationUsed: step.integrationUsed,
          });
        } else if (step.status === "blocked") {
          events.push({
            timestamp: step.startTime || run.startTime,
            kind: "step_blocked",
            description: step.errorMessage || `${step.stepName} blocked`,
            stepName: step.stepName,
            status: "blocked",
            integrationUsed: step.integrationUsed,
          });
        } else if (step.status === "waiting_approval") {
          events.push({
            timestamp: step.startTime || run.startTime,
            kind: "step_approval_required",
            description: `${step.stepName} — awaiting analyst approval`,
            stepName: step.stepName,
            status: "waiting_approval",
            integrationUsed: step.integrationUsed,
          });
        }
      }
    }

    // Run ended
    if (run.endTime) {
      if (run.status === "completed") {
        events.push({
          timestamp: run.endTime,
          kind: "run_completed",
          description: "Run completed successfully",
          status: "completed",
          duration: run.duration,
        });
      } else if (run.status === "failed") {
        events.push({
          timestamp: run.endTime,
          kind: "run_failed",
          description: run.errorMessage || "Run failed",
          status: "failed",
          duration: run.duration,
        });
      } else if (run.status === "cancelled") {
        events.push({
          timestamp: run.endTime,
          kind: "run_cancelled",
          description: "Run cancelled by analyst",
          status: "cancelled",
          duration: run.duration,
        });
      }
    } else if (run.status === "paused") {
      events.push({
        timestamp: run.startTime,
        kind: "run_paused",
        description: "Run paused — integration required",
        status: "paused",
      });
    } else if (run.status === "waiting_approval") {
      events.push({
        timestamp: run.startTime,
        kind: "run_paused",
        description: "Run paused — awaiting approval",
        status: "waiting_approval",
      });
    }

    // Sort chronologically
    events.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    return events;
  }

  /* ── Cleanup ── */

  /** Cancel all active timers and release resources */
  destroy(): void {
    for (const [runId, timers] of this.activeTimers) {
      timers.forEach(clearTimeout);
    }
    this.activeTimers.clear();
    this.pausedRuns.clear();
    this.listeners.clear();
  }

  /* ── Subscription ── */

  subscribe(listener: RunEventListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private emit(event: RunEvent) {
    this.listeners.forEach((fn) => fn(event));
  }

  /* ── Internal mutation helpers ── */

  /** Update a run's fields in-place (shallow merge) */
  private updateRun(runId: string, updates: Partial<WorkflowRun>): void {
    for (const runs of Object.values(this.runsByPlaybook)) {
      const idx = runs.findIndex((r) => r.id === runId);
      if (idx !== -1) {
        runs[idx] = { ...runs[idx], ...updates };
        return;
      }
    }
  }

  /** Update a specific step's fields within a run */
  private updateStepStatus(
    runId: string,
    stepId: string,
    updates: Partial<StepExecution>
  ): void {
    const run = this.getRun(runId);
    if (!run || !run.stepExecutions) return;

    // Find the step to get its name and integration for timeline recording
    const existingStep = run.stepExecutions.find((s) => s.stepId === stepId);

    const updatedSteps = run.stepExecutions.map((step) =>
      step.stepId === stepId ? { ...step, ...updates } : step
    );
    this.updateRun(runId, { stepExecutions: updatedSteps });

    // Auto-record meaningful step status changes to the timeline
    if (updates.status && existingStep) {
      const stepName = existingStep.stepName;
      const integration = existingStep.integrationUsed;

      const timelineMap: Partial<Record<StepExecutionStatus, { kind: TimelineEventKind; desc: string }>> = {
        running: { kind: "step_started", desc: `${stepName} started` },
        success: { kind: "step_completed", desc: updates.output || `${stepName} completed` },
        failed: { kind: "step_failed", desc: updates.errorMessage || `${stepName} failed` },
        skipped: { kind: "step_skipped", desc: updates.output || `${stepName} skipped` },
        blocked: { kind: "step_blocked", desc: updates.errorMessage || `${stepName} blocked` },
        waiting_approval: { kind: "step_approval_required", desc: `${stepName} — awaiting analyst approval` },
      };

      const mapping = timelineMap[updates.status];
      if (mapping) {
        this.appendTimelineEvent(runId, {
          timestamp: new Date().toISOString(),
          kind: mapping.kind,
          description: mapping.desc,
          stepName,
          status: updates.status,
          integrationUsed: integration,
          duration: updates.duration,
        });
      }
    }

    this.emit({
      type: "step_status_changed",
      run: this.getRun(runId)!,
      stepId,
      stepStatus: updates.status,
    });
  }

  /**
   * Append an immutable timeline event to a run's event log.
   * Events are stored in chronological order on the WorkflowRun object.
   */
  private appendTimelineEvent(runId: string, event: TimelineEvent): void {
    const run = this.getRun(runId);
    if (!run) return;
    const events = run.timelineEvents ? [...run.timelineEvents, event] : [event];
    this.updateRun(runId, { timelineEvents: events });
  }

  /* ── Read API ── */

  /** Get all runs for a playbook, newest first. Never mutate the returned array. */
  getRunsForPlaybook(playbookId: string): WorkflowRun[] {
    return this.runsByPlaybook[playbookId] || [];
  }

  /** Get a single run by ID across all playbooks */
  getRun(runId: string): WorkflowRun | null {
    for (const runs of Object.values(this.runsByPlaybook)) {
      const run = runs.find((r) => r.id === runId);
      if (run) return run;
    }
    return null;
  }

  /** Calculate statistics for a playbook */
  getStatistics(playbookId: string): RunStatistics {
    const runs = this.getRunsForPlaybook(playbookId);
    const total = runs.length;
    const completed = runs.filter((r) => r.status === "completed").length;
    const failed = runs.filter((r) => r.status === "failed").length;
    const running = runs.filter((r) => r.status === "running").length;
    const waitingApproval = runs.filter(
      (r) => r.status === "waiting_approval"
    ).length;

    // Average duration from completed runs
    const completedRuns = runs.filter(
      (r) => r.status === "completed" && r.duration
    );
    let avgDurationSec = 0;
    if (completedRuns.length > 0) {
      avgDurationSec =
        completedRuns.reduce((sum, run) => {
          const parts = run.duration!.split(" ");
          let seconds = 0;
          parts.forEach((part) => {
            if (part.includes("m")) seconds += parseInt(part) * 60;
            if (part.includes("s")) seconds += parseInt(part);
          });
          return sum + seconds;
        }, 0) / completedRuns.length;
    }
    const avgMinutes = Math.floor(avgDurationSec / 60);
    const avgSeconds = Math.floor(avgDurationSec % 60);
    const avgDuration =
      avgMinutes > 0 ? `${avgMinutes}m ${avgSeconds}s` : `${avgSeconds}s`;

    const successRate =
      total > 0 ? `${Math.round((completed / total) * 100)}%` : "0%";

    return {
      total,
      completed,
      failed,
      running,
      waitingApproval,
      avgDuration,
      successRate,
    };
  }

  /* ── Write API ── */

  /**
   * Create and enqueue a new Run for the given playbook.
   * This NEVER overwrites previous runs — it always prepends a new instance.
   */
  createRun(
    playbookId: string,
    playbookName: string,
    triggerSource: TriggerSource,
    triggeredBy: string,
    metadata?: Record<string, any>
  ): WorkflowRun {
    const runId = generateUniqueRunId();
    const now = new Date().toISOString();

    // Initialize step executions in "pending" state based on workflow templates
    const templates = getStepTemplatesForWorkflow(playbookId);
    const initialSteps: StepExecution[] = templates.map((template, index) => ({
      stepId: `${runId}-step-${index + 1}`,
      stepName: template.stepName,
      stepType: template.stepType,
      integrationUsed: template.integrationUsed,
      status: "pending" as StepExecutionStatus,
    }));

    const newRun: WorkflowRun = {
      id: runId,
      workflowId: playbookId,
      workflowName: playbookName,
      triggerSource,
      startTime: now,
      status: "queued",
      triggeredBy,
      metadata,
      stepExecutions: initialSteps,
    };

    // Ensure the array exists, then prepend
    if (!this.runsByPlaybook[playbookId]) {
      this.runsByPlaybook[playbookId] = [];
    }
    this.runsByPlaybook[playbookId].unshift(newRun);

    this.emit({ type: "run_created", run: newRun });

    return newRun;
  }

  /**
   * Execute a run through the full lifecycle with progressive step execution:
   *   queued -> running -> (step-by-step) -> completed/failed
   *
   * Each step transitions: pending -> queued -> running -> success/failed
   * Uses simulated timing for the UI demo.
   */
  executeRun(
    runId: string,
    options?: {
      replayMode?: ReplayMode;
      sourceRunId?: string;
      failureProbability?: number;
      skipUntilStep?: number;
    }
  ): void {
    const run = this.getRun(runId);
    if (!run) return;

    const failProb = options?.failureProbability ?? 0.12;
    const willFail = Math.random() < failProb;
    const timers: NodeJS.Timeout[] = [];
    const templates = getStepTemplatesForWorkflow(run.workflowId);

    // Decide which step fails (if any)
    const failStepIndex = willFail
      ? Math.min(
          Math.floor(Math.random() * templates.length - 1) + 1,
          templates.length - 1
        )
      : -1;

    // PHASE 1: queued -> running (500ms)
    const t1 = setTimeout(() => {
      const currentRun = this.getRun(runId);
      if (!currentRun || currentRun.status === "cancelled") return;

      // Transition run to running and first step to queued
      const updatedSteps = currentRun.stepExecutions?.map((step, i) => {
        if (i === 0) return { ...step, status: "queued" as StepExecutionStatus };
        return step;
      });

      this.updateRun(runId, { status: "running", stepExecutions: updatedSteps });
      this.appendTimelineEvent(runId, {
        timestamp: new Date().toISOString(),
        kind: "run_started",
        description: `Run started (${currentRun.triggerSource})`,
        status: "running",
      });
      this.emit({
        type: "run_status_changed",
        run: this.getRun(runId)!,
        previousStatus: "queued",
      });
    }, 500);
    timers.push(t1);

    // PHASE 2: Progressive step execution
    let cumulativeDelay = 800; // Start after run transitions to running

    // For replay from_failed mode, skip early steps
    const skipUntilStep =
      options?.replayMode === "from_failed"
        ? (options?.skipUntilStep != null
            ? options.skipUntilStep
            : Math.min(3, templates.length - 2))
        : 0;

    templates.forEach((template, stepIndex) => {
      const stepId = `${runId}-step-${stepIndex + 1}`;
      const isSkippedReplay = options?.replayMode === "from_failed" && stepIndex < skipUntilStep;

      if (isSkippedReplay) {
        // Mark as skipped immediately
        const tSkip = setTimeout(() => {
          const currentRun = this.getRun(runId);
          if (!currentRun || currentRun.status === "cancelled" || currentRun.status === "paused") return;

          this.updateStepStatus(runId, stepId, {
            status: "skipped",
            output: "Skipped: Replaying from failed step",
          });
        }, cumulativeDelay);
        timers.push(tSkip);
        cumulativeDelay += 200;
        return;
      }

      // Step transitions: queued -> running -> success/failed
      const stepDurationMs = (template.avgDurationSec * 100) + Math.floor(Math.random() * 800);
      // Compressed for demo: real durations would be too long

      // Transition: -> queued (if not first step, which is already queued)
      if (stepIndex > 0 || skipUntilStep > 0) {
        const tQueue = setTimeout(() => {
          const currentRun = this.getRun(runId);
          if (!currentRun || currentRun.status === "cancelled" || currentRun.status === "paused") return;

          this.updateStepStatus(runId, stepId, { status: "queued" });
        }, cumulativeDelay);
        timers.push(tQueue);
        cumulativeDelay += 300;
      }

      // Transition: -> running (with integration check)
      const tRunning = setTimeout(() => {
        const currentRun = this.getRun(runId);
        if (!currentRun || currentRun.status === "cancelled" || currentRun.status === "paused" || currentRun.status === "waiting_approval") return;

        // Integration check
        if (this.disconnectedIntegrations.has(template.integrationUsed)) {
          this.updateStepStatus(runId, stepId, {
            status: "blocked",
            startTime: new Date().toISOString(),
            errorMessage: `${template.integrationUsed} integration not connected`,
            errorDetails: `This step requires ${template.integrationUsed} to be configured. Please connect the integration to continue execution.`,
          });
          this.updateRun(runId, { status: "paused" });
          this.pausedRuns.set(runId, {
            stepIndex,
            stepId,
            integrationName: template.integrationUsed,
            templates,
            failStepIndex,
            options,
          });
          // Cancel remaining timers
          const allTimers = this.activeTimers.get(runId);
          if (allTimers) {
            allTimers.forEach(clearTimeout);
            this.activeTimers.delete(runId);
          }
          this.emit({
            type: "run_paused_integration",
            run: this.getRun(runId)!,
            previousStatus: "running",
            stepId,
            stepStatus: "blocked",
          });
          return;
        }

        // Approval check during resume
        if (template.requiresApproval) {
          this.updateStepStatus(runId, stepId, {
            status: "waiting_approval",
            startTime: new Date().toISOString(),
            output: `Waiting for analyst approval to proceed with ${template.stepName.toLowerCase()}`,
          });
          this.updateRun(runId, { status: "waiting_approval" });
          this.pausedRuns.set(runId, {
            stepIndex,
            stepId,
            integrationName: "__approval__",
            templates,
            failStepIndex,
            options,
          });
          const allTimers = this.activeTimers.get(runId);
          if (allTimers) {
            allTimers.forEach(clearTimeout);
            this.activeTimers.delete(runId);
          }
          this.emit({
            type: "run_waiting_approval",
            run: this.getRun(runId)!,
            previousStatus: "running",
            stepId,
            stepStatus: "waiting_approval",
          });
          return;
        }

        this.updateStepStatus(runId, stepId, {
          status: "running",
          startTime: new Date().toISOString(),
          output: `Executing ${template.stepName.toLowerCase()}...`,
        });
      }, cumulativeDelay);
      timers.push(tRunning);
      cumulativeDelay += stepDurationMs;

      // Transition: -> success or failed
      const isFailStep = stepIndex === failStepIndex;

      const tComplete = setTimeout(() => {
        const currentRun = this.getRun(runId);
        if (!currentRun || currentRun.status === "cancelled" || currentRun.status === "paused" || currentRun.status === "waiting_approval") return;

        const step = currentRun.stepExecutions?.find((s) => s.stepId === stepId);
        const endTime = new Date().toISOString();
        const duration = step?.startTime
          ? computeHumanDuration(step.startTime, endTime)
          : calculateStepDuration(Math.floor(template.avgDurationSec));

        if (isFailStep) {
          // This step fails
          this.updateStepStatus(runId, stepId, {
            status: "failed",
            endTime,
            duration,
            errorMessage: `${template.integrationUsed} connection failed: Authentication expired`,
            errorDetails: `The ${template.integrationUsed} API returned an error. Please check the integration configuration and try again.`,
          });

          // Mark remaining steps as skipped
          const currentRun2 = this.getRun(runId);
          if (currentRun2?.stepExecutions) {
            const updatedSteps = currentRun2.stepExecutions.map((s, i) => {
              if (i > stepIndex && s.status !== "success") {
                return {
                  ...s,
                  status: "skipped" as StepExecutionStatus,
                  output: "Step skipped due to previous failure",
                };
              }
              return s;
            });

            // Finalize the run as failed
            const runEndTime = new Date().toISOString();
            this.updateRun(runId, {
              status: "failed",
              endTime: runEndTime,
              duration: computeHumanDuration(currentRun2.startTime, runEndTime),
              stepExecutions: updatedSteps,
              errorMessage: `${template.stepName} failed: ${template.integrationUsed} error`,
            });

            this.appendTimelineEvent(runId, {
              timestamp: runEndTime,
              kind: "run_failed",
              description: `Run failed: ${template.stepName} — ${template.integrationUsed} error`,
              status: "failed",
              duration: computeHumanDuration(currentRun2.startTime, runEndTime),
            });

            this.emit({
              type: "run_failed",
              run: this.getRun(runId)!,
              previousStatus: "running",
            });
          }
        } else {
          // This step succeeds
          const successOutput =
            template.successOutputs[
              Math.floor(Math.random() * template.successOutputs.length)
            ];

          this.updateStepStatus(runId, stepId, {
            status: "success",
            endTime,
            duration,
            output: options?.replayMode === "modified_input"
              ? `Modified Input: ${successOutput}`
              : successOutput,
          });

          // If this is the last step and it succeeds, finalize the run
          if (stepIndex === templates.length - 1) {
            const currentRun3 = this.getRun(runId);
            if (currentRun3) {
              const runEndTime = new Date().toISOString();
              this.updateRun(runId, {
                status: "completed",
                endTime: runEndTime,
                duration: computeHumanDuration(currentRun3.startTime, runEndTime),
              });

              this.appendTimelineEvent(runId, {
                timestamp: runEndTime,
                kind: "run_completed",
                description: "Run completed successfully",
                status: "completed",
                duration: computeHumanDuration(currentRun3.startTime, runEndTime),
              });

              this.emit({
                type: "run_completed",
                run: this.getRun(runId)!,
                previousStatus: "running",
              });
            }
          }
        }
      }, cumulativeDelay);
      timers.push(tComplete);
      cumulativeDelay += 400; // Brief gap between steps
    });

    this.activeTimers.set(runId, timers);
  }

  /**
   * Cancel a running/queued/paused run.
   */
  cancelRun(runId: string): void {
    const run = this.getRun(runId);
    if (!run) return;

    const previousStatus = run.status;

    // Clear pending timers
    const timers = this.activeTimers.get(runId);
    if (timers) {
      timers.forEach(clearTimeout);
      this.activeTimers.delete(runId);
    }

    // Clean up pause state
    this.pausedRuns.delete(runId);

    // Mark remaining non-completed steps as cancelled
    const updatedSteps = run.stepExecutions?.map((step) => {
      if (step.status === "success" || step.status === "failed") return step;
      return {
        ...step,
        status: "skipped" as StepExecutionStatus,
        output: "Cancelled by analyst",
      };
    });

    this.updateRun(runId, {
      status: "cancelled",
      endTime: new Date().toISOString(),
      stepExecutions: updatedSteps,
    });

    this.appendTimelineEvent(runId, {
      timestamp: new Date().toISOString(),
      kind: "run_cancelled",
      description: "Run cancelled by analyst",
      status: "cancelled",
    });

    this.emit({
      type: "run_status_changed",
      run: this.getRun(runId)!,
      previousStatus,
    });
  }

  /* ── Integration Management ── */

  /** Check if an integration is currently disconnected */
  isIntegrationDisconnected(integrationName: string): boolean {
    return this.disconnectedIntegrations.has(integrationName);
  }

  /** Get all disconnected integrations */
  getDisconnectedIntegrations(): string[] {
    return Array.from(this.disconnectedIntegrations);
  }

  /**
   * Connect an integration and resume the blocked run.
   * - Removes the integration from the disconnected set
   * - Marks the blocked step as "queued" (ready to execute)
   * - Resumes the run from the blocked step
   */
  connectIntegration(runId: string, stepId: string): void {
    const paused = this.pausedRuns.get(runId);
    if (!paused) return;

    const run = this.getRun(runId);
    if (!run || run.status !== "paused") return;

    // Remove integration from the disconnected set
    this.disconnectedIntegrations.delete(paused.integrationName);

    // Record integration connected event
    this.appendTimelineEvent(runId, {
      timestamp: new Date().toISOString(),
      kind: "integration_connected",
      description: `${paused.integrationName} integration connected — resuming execution`,
      stepName: run.stepExecutions?.find((s) => s.stepId === stepId)?.stepName,
      status: "running",
      integrationUsed: paused.integrationName,
    });

    // Clear blocked status on the step
    this.updateStepStatus(runId, stepId, {
      status: "queued",
      errorMessage: undefined,
      errorDetails: undefined,
    });

    // Resume the run
    this.updateRun(runId, { status: "running" });

    this.emit({
      type: "run_status_changed",
      run: this.getRun(runId)!,
      previousStatus: "paused",
    });

    // Resume execution from the blocked step
    this.resumeExecution(runId, paused);
    this.pausedRuns.delete(runId);
  }

  /**
   * Skip the blocked step and continue execution.
   * - Marks the blocked step as "skipped"
   * - Resumes the run from the next step
   */
  skipBlockedStep(runId: string, stepId: string): void {
    const paused = this.pausedRuns.get(runId);
    if (!paused) return;

    const run = this.getRun(runId);
    if (!run || run.status !== "paused") return;

    // Mark the blocked step as skipped
    this.updateStepStatus(runId, stepId, {
      status: "skipped",
      output: `Skipped: ${paused.integrationName} integration not connected`,
      errorMessage: undefined,
      errorDetails: undefined,
    });

    // Resume the run
    this.updateRun(runId, { status: "running" });

    this.emit({
      type: "step_status_changed",
      run: this.getRun(runId)!,
      stepId,
      stepStatus: "skipped",
    });

    // Resume execution from the NEXT step (skip the blocked one)
    const nextPaused = { ...paused, stepIndex: paused.stepIndex + 1 };
    if (nextPaused.stepIndex < paused.templates.length) {
      this.resumeExecution(runId, nextPaused);
    } else {
      // The blocked step was the last step — finalize the run
      const runEndTime = new Date().toISOString();
      this.updateRun(runId, {
        status: "completed",
        endTime: runEndTime,
        duration: computeHumanDuration(run.startTime, runEndTime),
      });
      this.emit({
        type: "run_completed",
        run: this.getRun(runId)!,
        previousStatus: "running",
      });
    }

    this.pausedRuns.delete(runId);
  }

  /**
   * Resume execution from a specific step after a pause.
   * Schedules timers for remaining steps.
   */
  private resumeExecution(
    runId: string,
    context: {
      stepIndex: number;
      stepId: string;
      templates: StepTemplate[];
      failStepIndex: number;
      options?: { replayMode?: ReplayMode; sourceRunId?: string; failureProbability?: number };
    }
  ): void {
    const run = this.getRun(runId);
    if (!run) return;

    const { templates, failStepIndex, options } = context;
    const timers: NodeJS.Timeout[] = [];
    let cumulativeDelay = 300; // Small delay before resuming

    for (let stepIndex = context.stepIndex; stepIndex < templates.length; stepIndex++) {
      const template = templates[stepIndex];
      const stepId = `${runId}-step-${stepIndex + 1}`;
      const stepDurationMs = (template.avgDurationSec * 100) + Math.floor(Math.random() * 800);

      // Transition: -> queued
      const tQueue = setTimeout(() => {
        const currentRun = this.getRun(runId);
        if (!currentRun || currentRun.status === "cancelled" || currentRun.status === "paused") return;
        this.updateStepStatus(runId, stepId, { status: "queued" });
      }, cumulativeDelay);
      timers.push(tQueue);
      cumulativeDelay += 300;

      // Transition: -> running (with integration check)
      const tRunning = setTimeout(() => {
        const currentRun = this.getRun(runId);
        if (!currentRun || currentRun.status === "cancelled" || currentRun.status === "paused") return;

        // Integration check
        if (this.disconnectedIntegrations.has(template.integrationUsed)) {
          this.updateStepStatus(runId, stepId, {
            status: "blocked",
            startTime: new Date().toISOString(),
            errorMessage: `${template.integrationUsed} integration not connected`,
            errorDetails: `This step requires ${template.integrationUsed} to be configured. Please connect the integration to continue execution.`,
          });
          this.updateRun(runId, { status: "paused" });
          this.pausedRuns.set(runId, {
            stepIndex,
            stepId,
            integrationName: template.integrationUsed,
            templates,
            failStepIndex,
            options,
          });
          // Cancel remaining timers
          const allTimers = this.activeTimers.get(runId);
          if (allTimers) {
            allTimers.forEach(clearTimeout);
            this.activeTimers.delete(runId);
          }
          this.emit({
            type: "run_paused_integration",
            run: this.getRun(runId)!,
            previousStatus: "running",
            stepId,
            stepStatus: "blocked",
          });
          return;
        }

        this.updateStepStatus(runId, stepId, {
          status: "running",
          startTime: new Date().toISOString(),
          output: `Executing ${template.stepName.toLowerCase()}...`,
        });
      }, cumulativeDelay);
      timers.push(tRunning);
      cumulativeDelay += stepDurationMs;

      // Transition: -> success or failed
      const isFailStep = stepIndex === failStepIndex;

      const tComplete = setTimeout(() => {
        const currentRun = this.getRun(runId);
        if (!currentRun || currentRun.status === "cancelled" || currentRun.status === "paused") return;

        const step = currentRun.stepExecutions?.find((s) => s.stepId === stepId);
        const endTime = new Date().toISOString();
        const duration = step?.startTime
          ? computeHumanDuration(step.startTime, endTime)
          : calculateStepDuration(Math.floor(template.avgDurationSec));

        if (isFailStep) {
          this.updateStepStatus(runId, stepId, {
            status: "failed",
            endTime,
            duration,
            errorMessage: `${template.integrationUsed} connection failed: Authentication expired`,
            errorDetails: `The ${template.integrationUsed} API returned an error. Please check the integration configuration and try again.`,
          });
          const currentRun2 = this.getRun(runId);
          if (currentRun2?.stepExecutions) {
            const updatedSteps = currentRun2.stepExecutions.map((s, i) => {
              if (i > stepIndex && s.status !== "success") {
                return { ...s, status: "skipped" as StepExecutionStatus, output: "Step skipped due to previous failure" };
              }
              return s;
            });
            const runEndTime = new Date().toISOString();
            this.updateRun(runId, {
              status: "failed",
              endTime: runEndTime,
              duration: computeHumanDuration(currentRun2.startTime, runEndTime),
              stepExecutions: updatedSteps,
              errorMessage: `${template.stepName} failed: ${template.integrationUsed} error`,
            });
            this.emit({ type: "run_failed", run: this.getRun(runId)!, previousStatus: "running" });
          }
        } else {
          const successOutput = template.successOutputs[Math.floor(Math.random() * template.successOutputs.length)];
          this.updateStepStatus(runId, stepId, {
            status: "success",
            endTime,
            duration,
            output: options?.replayMode === "modified_input" ? `Modified Input: ${successOutput}` : successOutput,
          });
          if (stepIndex === templates.length - 1) {
            const currentRun3 = this.getRun(runId);
            if (currentRun3) {
              const runEndTime = new Date().toISOString();
              this.updateRun(runId, {
                status: "completed",
                endTime: runEndTime,
                duration: computeHumanDuration(currentRun3.startTime, runEndTime),
              });
              this.emit({ type: "run_completed", run: this.getRun(runId)!, previousStatus: "running" });
            }
          }
        }
      }, cumulativeDelay);
      timers.push(tComplete);
      cumulativeDelay += 400;
    }

    this.activeTimers.set(runId, timers);
  }

  /**
   * Approve a step that requires approval.
   * Transitions the approved step to "running", the run from waiting_approval -> running,
   * and resumes execution from that step.
   */
  approveStep(runId: string, stepId: string): void {
    const run = this.getRun(runId);
    if (!run || !run.stepExecutions) return;

    const paused = this.pausedRuns.get(runId);

    // Mark the approved step as "running"
    this.updateStepStatus(runId, stepId, {
      status: "running",
      output: `Approved — executing step...`,
    });

    // Record approval event
    const approvedStep = run.stepExecutions.find((s) => s.stepId === stepId);
    this.appendTimelineEvent(runId, {
      timestamp: new Date().toISOString(),
      kind: "step_approved",
      description: `${approvedStep?.stepName || "Step"} approved by analyst`,
      stepName: approvedStep?.stepName,
      status: "running",
      integrationUsed: approvedStep?.integrationUsed,
    });

    // Resume the run status
    this.updateRun(runId, { status: "running" });

    this.emit({
      type: "run_status_changed",
      run: this.getRun(runId)!,
      previousStatus: "waiting_approval",
      stepId,
      stepStatus: "running",
    });

    // Resume execution from the approved step (it's already "running", so
    // resumeExecution will handle it from the SAME step index — but we need
    // to simulate the step completing successfully after a short delay).
    if (paused) {
      const { templates, failStepIndex, options, stepIndex } = paused;
      const template = templates[stepIndex];
      const timers: NodeJS.Timeout[] = [];

      // Simulate the approved step completing
      const stepDurationMs = (template.avgDurationSec * 100) + Math.floor(Math.random() * 800);

      const tComplete = setTimeout(() => {
        const currentRun = this.getRun(runId);
        if (!currentRun || currentRun.status === "cancelled" || currentRun.status === "paused" || currentRun.status === "waiting_approval") return;

        const step = currentRun.stepExecutions?.find((s) => s.stepId === stepId);
        const endTime = new Date().toISOString();
        const duration = step?.startTime
          ? computeHumanDuration(step.startTime, endTime)
          : calculateStepDuration(Math.floor(template.avgDurationSec));

        const isFailStep = stepIndex === failStepIndex;
        if (isFailStep) {
          this.updateStepStatus(runId, stepId, {
            status: "failed",
            endTime,
            duration,
            errorMessage: `${template.integrationUsed} connection failed: Authentication expired`,
            errorDetails: `The ${template.integrationUsed} API returned an error.`,
          });
          const currentRun2 = this.getRun(runId);
          if (currentRun2?.stepExecutions) {
            const updatedSteps = currentRun2.stepExecutions.map((s, i) => {
              if (i > stepIndex && s.status !== "success") {
                return { ...s, status: "skipped" as StepExecutionStatus, output: "Step skipped due to previous failure" };
              }
              return s;
            });
            const runEndTime = new Date().toISOString();
            this.updateRun(runId, {
              status: "failed",
              endTime: runEndTime,
              duration: computeHumanDuration(currentRun2.startTime, runEndTime),
              stepExecutions: updatedSteps,
              errorMessage: `${template.stepName} failed: ${template.integrationUsed} error`,
            });
            this.emit({ type: "run_failed", run: this.getRun(runId)!, previousStatus: "running" });
          }
        } else {
          const successOutput = template.successOutputs[Math.floor(Math.random() * template.successOutputs.length)];
          this.updateStepStatus(runId, stepId, {
            status: "success",
            endTime,
            duration,
            output: successOutput,
          });

          // If this was the last step, finalize
          if (stepIndex === templates.length - 1) {
            const currentRun3 = this.getRun(runId);
            if (currentRun3) {
              const runEndTime = new Date().toISOString();
              this.updateRun(runId, {
                status: "completed",
                endTime: runEndTime,
                duration: computeHumanDuration(currentRun3.startTime, runEndTime),
              });
              this.emit({ type: "run_completed", run: this.getRun(runId)!, previousStatus: "running" });
            }
          } else {
            // Resume from next step
            this.resumeExecution(runId, {
              stepIndex: stepIndex + 1,
              stepId: `${runId}-step-${stepIndex + 2}`,
              templates,
              failStepIndex,
              options,
            });
          }
        }
      }, stepDurationMs);
      timers.push(tComplete);
      this.activeTimers.set(runId, timers);
      this.pausedRuns.delete(runId);
    }
  }

  /**
   * Reject a step that requires approval.
   * Transitions the run to cancelled, marks the step as failed.
   */
  rejectStep(runId: string, stepId: string): void {
    const run = this.getRun(runId);
    if (!run || !run.stepExecutions) return;

    // Record rejection event
    const rejectedStep = run.stepExecutions.find((s) => s.stepId === stepId);
    this.appendTimelineEvent(runId, {
      timestamp: new Date().toISOString(),
      kind: "step_rejected",
      description: `${rejectedStep?.stepName || "Step"} rejected by analyst`,
      stepName: rejectedStep?.stepName,
      status: "failed",
      integrationUsed: rejectedStep?.integrationUsed,
    });

    // Clean up pause context
    this.pausedRuns.delete(runId);

    const endTime = new Date().toISOString();
    this.updateRun(runId, {
      status: "cancelled",
      endTime,
      stepExecutions: run.stepExecutions.map((step) => {
        if (step.stepId === stepId && step.status === "waiting_approval") {
          return {
            ...step,
            status: "failed" as const,
            endTime,
            errorMessage: "Rejected by analyst",
            errorDetails: "This step was rejected during the approval review. The workflow has been cancelled.",
          };
        }
        if (step.status === "blocked" || step.status === "pending" || step.status === "queued") {
          return { ...step, status: "skipped" as const, output: "Skipped: Workflow cancelled after approval rejection" };
        }
        return step;
      }),
    });

    this.appendTimelineEvent(runId, {
      timestamp: endTime,
      kind: "run_cancelled",
      description: "Run cancelled after approval rejection",
      status: "cancelled",
    });

    this.emit({
      type: "run_status_changed",
      run: this.getRun(runId)!,
      previousStatus: "waiting_approval",
      stepId,
      stepStatus: "failed",
    });
  }

  /**
   * Create a replay Run from a source run.
   * Always creates a NEW run instance.
   * All replay modes use trigger_source = "replay".
   */
  replayRun(
    sourceRunId: string,
    mode: ReplayMode,
    modifiedInputs?: Record<string, string>
  ): WorkflowRun | null {
    const sourceRun = this.getRun(sourceRunId);
    if (!sourceRun) return null;

    // All replay modes always use "replay" as trigger source
    const triggerSource: TriggerSource = "replay";

    // For "from_failed" mode, find the actual failed step index in the source run
    let failedStepIndex = -1;
    if (mode === "from_failed" && sourceRun.stepExecutions) {
      failedStepIndex = sourceRun.stepExecutions.findIndex(
        (s) => s.status === "failed"
      );
    }

    const newRun = this.createRun(
      sourceRun.workflowId,
      sourceRun.workflowName,
      triggerSource,
      "Current User",
      {
        replayMode: mode,
        sourceRunId,
        ...(failedStepIndex >= 0 ? { failedStepIndex } : {}),
        ...(modifiedInputs ? { modifiedInputs } : {}),
      }
    );

    // Start execution with the resolved failed step index
    this.executeRun(newRun.id, {
      replayMode: mode,
      sourceRunId,
      skipUntilStep: failedStepIndex >= 0 ? failedStepIndex : undefined,
    });

    return newRun;
  }

  /**
   * Manual run — triggered by "Run Workflow" button
   */
  manualRun(playbookId: string, playbookName: string): WorkflowRun {
    const newRun = this.createRun(
      playbookId,
      playbookName,
      "manual",
      "Current User"
    );
    this.executeRun(newRun.id, { failureProbability: 0.15 });
    return newRun;
  }

  /**
   * Test run — triggered from Workflow Builder "Test Run" button
   */
  testRun(playbookId: string, playbookName: string): WorkflowRun {
    const newRun = this.createRun(
      playbookId,
      playbookName,
      "manual",
      "sarah.chen@watchcenter.io"
    );
    this.executeRun(newRun.id);
    return newRun;
  }
}