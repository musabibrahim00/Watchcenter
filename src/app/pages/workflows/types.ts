/**
 * Workflow Types — Core data models for Workflows and Runs
 */

import type React from "react";

/* ================================================================
   RUN TYPES
   ================================================================ */

export type TriggerSource = "event" | "schedule" | "manual" | "manual_replay" | "replay";

export type RunStatus =
  | "queued"
  | "running"
  | "waiting_approval"
  | "paused"
  | "completed"
  | "failed"
  | "cancelled";

export type StepExecutionStatus =
  | "pending"
  | "queued"
  | "running"
  | "success"
  | "failed"
  | "skipped"
  | "waiting_approval"
  | "blocked";

export interface WorkflowRun {
  id: string;
  workflowId: string;
  workflowName: string;
  triggerSource: TriggerSource;
  startTime: string; // ISO timestamp
  endTime?: string; // ISO timestamp
  duration?: string; // Human-readable (e.g., "2m 34s")
  status: RunStatus;
  stepExecutions?: StepExecution[];
  /** Immutable, append-only log of execution events */
  timelineEvents?: TimelineEvent[];
  errorMessage?: string;
  triggeredBy?: string; // User or system
  metadata?: Record<string, string | number | boolean | null | undefined>;
}

export interface StepExecution {
  stepId: string;
  stepName: string;
  stepType: string; // e.g., "trigger", "enrichment", "notification", etc.
  status: StepExecutionStatus;
  startTime?: string;
  endTime?: string;
  duration?: string;
  output?: string; // User-friendly output description
  errorMessage?: string;
  errorDetails?: string; // More detailed error for context
  integrationUsed?: string; // e.g., "Slack", "Jira", "AWS", "Splunk"
}

/* ================================================================
   TIMELINE EVENT — Immutable log entry produced during execution
   ================================================================ */

export type TimelineEventKind =
  | "run_started"
  | "run_completed"
  | "run_failed"
  | "run_cancelled"
  | "run_paused"
  | "step_queued"
  | "step_started"
  | "step_completed"
  | "step_failed"
  | "step_skipped"
  | "step_blocked"
  | "step_approval_required"
  | "step_approved"
  | "step_rejected"
  | "integration_connected"
  | "integration_skipped";

export interface TimelineEvent {
  /** ISO-8601 timestamp when the event occurred */
  timestamp: string;
  /** Machine-readable event kind */
  kind: TimelineEventKind;
  /** Human-readable description (e.g., "Alert enriched successfully") */
  description: string;
  /** Step name if the event relates to a step */
  stepName?: string;
  /** Step status at the time of the event */
  status?: StepExecutionStatus | RunStatus;
  /** Integration involved (e.g., "Slack", "Jira") */
  integrationUsed?: string;
  /** Duration string if the event represents a completion (e.g., "4s") */
  duration?: string;
}

/* ================================================================
   WORKFLOW TYPES
   ================================================================ */

export interface WorkflowStepConfig {
  [key: string]: string | number | boolean | null | undefined;
}

export interface WorkflowStep {
  id: string;
  templateId: string;
  name: string;
  icon?: React.ComponentType<{ size?: number; className?: string }>;
  status?: "idle" | "running" | "success" | "failed";
  executionTime?: string;
  config?: WorkflowStepConfig;
  requiresIntegration?: string;
}

export interface Workflow {
  id: string;
  name: string;
  description: string;
  category: string;
  isActive: boolean;
  steps: WorkflowStep[];
  triggers?: {
    event?: string[];
    schedule?: string;
    manual: boolean;
  };
  createdAt: string;
  updatedAt: string;
  lastRunAt?: string;
  totalRuns: number;
  successRate: string;
}

/* ================================================================
   PLAYBOOK — Execution-model alias for Workflow
   ================================================================ */

/**
 * A Playbook is the execution-model identity of a Workflow.
 * It maps 1-to-1 with a Workflow and owns an ordered list of Runs.
 *
 * - `playbook_id` === `workflow.id`
 * - All runs reference `playbook_id`
 */
export interface Playbook {
  playbook_id: string;
  name: string;
  description: string;
  isActive: boolean;
  triggers: {
    event?: string[];
    schedule?: string;
    manual: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

/* ================================================================
   RUN STATISTICS
   ================================================================ */

export interface RunStatistics {
  total: number;
  completed: number;
  failed: number;
  running: number;
  waitingApproval: number;
  avgDuration: string;
  successRate: string;
}
/* ================================================================
   UI TYPES — Workflows Index Page
   ================================================================ */

export type WorkflowStatus = "running" | "completed" | "approval_required" | "disabled";

export interface WorkflowCard {
  id: string;
  title: string;
  description: string;
  tags: string[];
  status: WorkflowStatus;
  runCount?: number;
  lastRun?: string;
  actions?: string[];
}
