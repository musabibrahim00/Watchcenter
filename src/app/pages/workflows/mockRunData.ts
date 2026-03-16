/**
 * Mock Run Data — Sample execution history for workflows
 */

import { WorkflowRun, RunStatus, TriggerSource } from "./types";
import {
  generateStepExecutions,
  createBlockedIntegrationExecution,
  createRunningExecution,
  createWaitingApprovalExecution,
} from "./mockStepExecutions";

/* ================================================================
   HELPER FUNCTIONS
   ================================================================ */

function generateRunId(index: number): string {
  return `run-${String(index).padStart(3, "0")}`;
}

function getTimeAgo(hoursAgo: number): string {
  const date = new Date();
  date.setHours(date.getHours() - hoursAgo);
  return date.toISOString();
}

function calculateDuration(minutes: number, seconds: number = 0): string {
  if (minutes === 0) return `${seconds}s`;
  if (seconds === 0) return `${minutes}m`;
  return `${minutes}m ${seconds}s`;
}

/* ================================================================
   MOCK RUN DATA
   ================================================================ */

export const MOCK_RUNS: Record<string, WorkflowRun[]> = {
  "wf-1": [
    {
      id: generateRunId(13),
      workflowId: "wf-1",
      workflowName: "Critical Alert Auto Response",
      triggerSource: "event" as TriggerSource,
      startTime: getTimeAgo(0.5),
      status: "paused" as RunStatus,
      triggeredBy: "Watch Center Alert Engine",
      stepExecutions: createBlockedIntegrationExecution(generateRunId(13), getTimeAgo(0.5), "Slack", "wf-1"),
    },
    {
      id: generateRunId(12),
      workflowId: "wf-1",
      workflowName: "Critical Alert Auto Response",
      triggerSource: "event" as TriggerSource,
      startTime: getTimeAgo(1),
      endTime: getTimeAgo(0.95),
      duration: calculateDuration(2, 34),
      status: "completed" as RunStatus,
      triggeredBy: "Watch Center Alert Engine",
      stepExecutions: generateStepExecutions(generateRunId(12), "completed", getTimeAgo(1), "wf-1"),
    },
    {
      id: generateRunId(11),
      workflowId: "wf-1",
      workflowName: "Critical Alert Auto Response",
      triggerSource: "event" as TriggerSource,
      startTime: getTimeAgo(4),
      endTime: getTimeAgo(3.96),
      duration: calculateDuration(2, 18),
      status: "completed" as RunStatus,
      triggeredBy: "Watch Center Alert Engine",
      stepExecutions: generateStepExecutions(generateRunId(11), "completed", getTimeAgo(4), "wf-1"),
    },
    {
      id: generateRunId(10),
      workflowId: "wf-1",
      workflowName: "Critical Alert Auto Response",
      triggerSource: "manual" as TriggerSource,
      startTime: getTimeAgo(8),
      endTime: getTimeAgo(7.95),
      duration: calculateDuration(3, 12),
      status: "failed" as RunStatus,
      errorMessage: "Slack notification failed: Authentication expired",
      triggeredBy: "sarah.chen@watchcenter.io",
      stepExecutions: generateStepExecutions(generateRunId(10), "failed", getTimeAgo(8), "wf-1"),
    },
    {
      id: generateRunId(9),
      workflowId: "wf-1",
      workflowName: "Critical Alert Auto Response",
      triggerSource: "event" as TriggerSource,
      startTime: getTimeAgo(12),
      endTime: getTimeAgo(11.96),
      duration: calculateDuration(2, 45),
      status: "completed" as RunStatus,
      triggeredBy: "Watch Center Alert Engine",
      stepExecutions: generateStepExecutions(generateRunId(9), "completed", getTimeAgo(12), "wf-1"),
    },
    {
      id: generateRunId(8),
      workflowId: "wf-1",
      workflowName: "Critical Alert Auto Response",
      triggerSource: "event" as TriggerSource,
      startTime: getTimeAgo(18),
      status: "running" as RunStatus,
      triggeredBy: "Watch Center Alert Engine",
      stepExecutions: createRunningExecution(generateRunId(8), getTimeAgo(18), 2, "wf-1"),
    },
    {
      id: generateRunId(7),
      workflowId: "wf-1",
      workflowName: "Critical Alert Auto Response",
      triggerSource: "schedule" as TriggerSource,
      startTime: getTimeAgo(24),
      endTime: getTimeAgo(23.97),
      duration: calculateDuration(1, 52),
      status: "completed" as RunStatus,
      triggeredBy: "Scheduled Task",
      stepExecutions: generateStepExecutions(generateRunId(7), "completed", getTimeAgo(24), "wf-1"),
    },
    {
      id: generateRunId(6),
      workflowId: "wf-1",
      workflowName: "Critical Alert Auto Response",
      triggerSource: "manual" as TriggerSource,
      startTime: getTimeAgo(30),
      endTime: getTimeAgo(29.95),
      duration: calculateDuration(2, 56),
      status: "failed" as RunStatus,
      errorMessage: "Integration timeout: Slack",
      triggeredBy: "john.martinez@watchcenter.io",
      stepExecutions: generateStepExecutions(generateRunId(6), "failed", getTimeAgo(30), "wf-1"),
    },
    {
      id: generateRunId(5),
      workflowId: "wf-1",
      workflowName: "Critical Alert Auto Response",
      triggerSource: "event" as TriggerSource,
      startTime: getTimeAgo(36),
      endTime: getTimeAgo(35.96),
      duration: calculateDuration(2, 21),
      status: "completed" as RunStatus,
      triggeredBy: "Watch Center Alert Engine",
      stepExecutions: generateStepExecutions(generateRunId(5), "completed", getTimeAgo(36), "wf-1"),
    },
    {
      id: generateRunId(4),
      workflowId: "wf-1",
      workflowName: "Critical Alert Auto Response",
      triggerSource: "event" as TriggerSource,
      startTime: getTimeAgo(48),
      status: "waiting_approval" as RunStatus,
      triggeredBy: "Watch Center Alert Engine",
      stepExecutions: createWaitingApprovalExecution(generateRunId(4), getTimeAgo(48), 3, "wf-1"),
    },
    {
      id: generateRunId(3),
      workflowId: "wf-1",
      workflowName: "Critical Alert Auto Response",
      triggerSource: "manual" as TriggerSource,
      startTime: getTimeAgo(52),
      status: "cancelled" as RunStatus,
      triggeredBy: "sarah.chen@watchcenter.io",
      stepExecutions: generateStepExecutions(generateRunId(3), "completed", getTimeAgo(52), "wf-1").map((step, i) => ({
        ...step,
        status: i < 2 ? ("success" as const) : ("skipped" as const),
        ...(i >= 2 ? { output: "Cancelled by analyst", endTime: undefined, duration: undefined } : {}),
      })),
    },
    {
      id: generateRunId(2),
      workflowId: "wf-1",
      workflowName: "Critical Alert Auto Response",
      triggerSource: "event" as TriggerSource,
      startTime: getTimeAgo(56),
      endTime: getTimeAgo(55.96),
      duration: calculateDuration(2, 18),
      status: "completed" as RunStatus,
      triggeredBy: "Watch Center Alert Engine",
      stepExecutions: generateStepExecutions(generateRunId(2), "completed", getTimeAgo(56), "wf-1"),
    },
  ],
  "wf-2": [
    {
      id: generateRunId(5),
      workflowId: "wf-2",
      workflowName: "Vulnerability Remediation Flow",
      triggerSource: "event" as TriggerSource,
      startTime: getTimeAgo(2),
      endTime: getTimeAgo(1.97),
      duration: calculateDuration(1, 45),
      status: "completed" as RunStatus,
      triggeredBy: "Vulnerability Scanner",
      stepExecutions: generateStepExecutions(generateRunId(5), "completed", getTimeAgo(2), "wf-2"),
    },
    {
      id: generateRunId(4),
      workflowId: "wf-2",
      workflowName: "Vulnerability Remediation Flow",
      triggerSource: "schedule" as TriggerSource,
      startTime: getTimeAgo(26),
      endTime: getTimeAgo(25.98),
      duration: calculateDuration(1, 12),
      status: "completed" as RunStatus,
      triggeredBy: "Scheduled Task",
      stepExecutions: generateStepExecutions(generateRunId(4), "completed", getTimeAgo(26), "wf-2"),
    },
    {
      id: generateRunId(3),
      workflowId: "wf-2",
      workflowName: "Vulnerability Remediation Flow",
      triggerSource: "manual" as TriggerSource,
      startTime: getTimeAgo(50),
      endTime: getTimeAgo(49.96),
      duration: calculateDuration(2, 8),
      status: "completed" as RunStatus,
      triggeredBy: "alex.rivera@watchcenter.io",
      stepExecutions: generateStepExecutions(generateRunId(3), "completed", getTimeAgo(50), "wf-2"),
    },
  ],
  "wf-3": [
    {
      id: generateRunId(8),
      workflowId: "wf-3",
      workflowName: "Asset Discovery Enrichment",
      triggerSource: "event" as TriggerSource,
      startTime: getTimeAgo(3),
      endTime: getTimeAgo(2.93),
      duration: calculateDuration(4, 22),
      status: "completed" as RunStatus,
      triggeredBy: "CMDB Discovery Engine",
      stepExecutions: generateStepExecutions(generateRunId(8), "completed", getTimeAgo(3), "wf-3"),
    },
    {
      id: generateRunId(7),
      workflowId: "wf-3",
      workflowName: "Asset Discovery Enrichment",
      triggerSource: "manual" as TriggerSource,
      startTime: getTimeAgo(10),
      status: "running" as RunStatus,
      triggeredBy: "maya.patel@watchcenter.io",
      stepExecutions: createRunningExecution(generateRunId(7), getTimeAgo(10), 1, "wf-3"),
    },
  ],
};

/* ================================================================
   RUN CREATION UTILITY
   ================================================================ */

export function createNewRun(
  workflowId: string,
  workflowName: string,
  triggerSource: TriggerSource,
  triggeredBy: string
): WorkflowRun {
  const existingRuns = MOCK_RUNS[workflowId] || [];
  const nextRunNumber = existingRuns.length + 1;

  const newRun: WorkflowRun = {
    id: generateRunId(nextRunNumber),
    workflowId,
    workflowName,
    triggerSource,
    startTime: new Date().toISOString(),
    status: "queued" as RunStatus,
    triggeredBy,
  };

  // Add to mock data
  if (!MOCK_RUNS[workflowId]) {
    MOCK_RUNS[workflowId] = [];
  }
  MOCK_RUNS[workflowId].unshift(newRun);

  return newRun;
}

/* ================================================================
   RUN STATISTICS CALCULATOR
   ================================================================ */

export function calculateRunStatistics(workflowId: string) {
  const runs = MOCK_RUNS[workflowId] || [];
  
  const total = runs.length;
  const completed = runs.filter(r => r.status === "completed").length;
  const failed = runs.filter(r => r.status === "failed").length;
  const running = runs.filter(r => r.status === "running").length;
  const waitingApproval = runs.filter(r => r.status === "waiting_approval").length;
  
  const completedRuns = runs.filter(r => r.status === "completed" && r.duration);
  const avgDurationMs = completedRuns.length > 0
    ? completedRuns.reduce((sum, run) => {
        const parts = run.duration!.split(" ");
        let seconds = 0;
        parts.forEach(part => {
          if (part.includes("m")) seconds += parseInt(part) * 60;
          if (part.includes("s")) seconds += parseInt(part);
        });
        return sum + seconds;
      }, 0) / completedRuns.length
    : 0;
  
  const avgMinutes = Math.floor(avgDurationMs / 60);
  const avgSeconds = Math.floor(avgDurationMs % 60);
  const avgDuration = avgMinutes > 0 ? `${avgMinutes}m ${avgSeconds}s` : `${avgSeconds}s`;
  
  const successRate = total > 0 ? `${Math.round((completed / total) * 100)}%` : "0%";
  
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