/**
 * Mock Step Executions — Detailed step-by-step execution data for runs
 */

import type { StepExecution, StepExecutionStatus } from "./types";

/* ================================================================
   HELPER FUNCTIONS
   ================================================================ */

function addSeconds(isoString: string, seconds: number): string {
  const date = new Date(isoString);
  date.setSeconds(date.getSeconds() + seconds);
  return date.toISOString();
}

function calculateDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  if (remainingSeconds === 0) return `${minutes}m`;
  return `${minutes}m ${remainingSeconds}s`;
}

/* ================================================================
   STEP TEMPLATES PER WORKFLOW
   ================================================================ */

export interface StepTemplate {
  stepName: string;
  stepType: string;
  integrationUsed: string;
  /** Approximate duration in seconds for a successful run */
  avgDurationSec: number;
  /** Possible success outputs (randomly chosen) */
  successOutputs: string[];
  /** If true, execution pauses at this step until an analyst approves */
  requiresApproval?: boolean;
}

/** Default 5-step SOC alert response pipeline */
const ALERT_RESPONSE_STEPS: StepTemplate[] = [
  {
    stepName: "Trigger Alert",
    stepType: "trigger",
    integrationUsed: "SIEM",
    avgDurationSec: 10,
    successOutputs: [
      "Alert triggered from SIEM: Suspicious login attempt detected on server DB-PROD-03",
      "Alert triggered from SIEM: Brute-force attempt on admin portal — 48 failed logins in 5 minutes",
      "Alert triggered: Anomalous outbound traffic detected from endpoint WS-1042",
    ],
  },
  {
    stepName: "Enrich Alert",
    stepType: "enrichment",
    integrationUsed: "Threat Intel",
    avgDurationSec: 42,
    successOutputs: [
      "Enriched with threat intel: IP 185.220.101.45 flagged by 3 threat feeds. User account: admin@company.com. Location: Russia",
      "Threat intel enrichment complete. Source IP matched known C2 infrastructure. Risk score: 92/100",
      "File hash matched known ransomware variant. Enrichment added MITRE ATT&CK tags: T1566, T1059",
    ],
  },
  {
    stepName: "Create Case",
    stepType: "case_management",
    integrationUsed: "Jira",
    avgDurationSec: 25,
    successOutputs: [
      "Investigation case CASE-2847 created with priority: Critical",
      "Case CASE-2903 created in Jira. Linked 3 related alerts from the past 24 hours",
      "Investigation case CASE-2851 created with priority: High. Auto-linked to asset DB-PROD-03",
    ],
  },
  {
    stepName: "Notify Slack",
    stepType: "notification",
    integrationUsed: "Slack",
    avgDurationSec: 30,
    successOutputs: [
      "Notification sent to #security-alerts channel. 3 analysts acknowledged",
      "Slack alert delivered to #soc-team and #incident-response. Priority: urgent",
      "Notification sent to #security-alerts. On-call analyst pinged via @mention",
    ],
  },
  {
    stepName: "Assign Analyst",
    stepType: "assignment",
    integrationUsed: "IAM",
    avgDurationSec: 14,
    requiresApproval: true,
    successOutputs: [
      "Case assigned to Sarah Chen based on current on-call rotation",
      "Auto-assigned to analyst Michael Torres — lowest active case count",
      "Case assigned to on-call analyst via PagerDuty escalation policy",
    ],
  },
];

const VULN_REMEDIATION_STEPS: StepTemplate[] = [
  {
    stepName: "Trigger Alert",
    stepType: "trigger",
    integrationUsed: "Vulnerability Scanner",
    avgDurationSec: 8,
    successOutputs: [
      "Vulnerability scan completed: 12 new CVEs detected across 8 assets",
      "Critical vulnerability alert: CVE-2025-31337 detected on production servers",
    ],
  },
  {
    stepName: "Scan Vulnerabilities",
    stepType: "enrichment",
    integrationUsed: "Nessus",
    avgDurationSec: 65,
    successOutputs: [
      "Deep scan complete: 4 critical, 8 high, 12 medium findings. CVSS scores calculated",
      "Vulnerability analysis finished. 3 assets require immediate patching",
    ],
  },
  {
    stepName: "Create JIRA Ticket",
    stepType: "case_management",
    integrationUsed: "Jira",
    avgDurationSec: 18,
    successOutputs: [
      "JIRA ticket VULN-1204 created. Linked to 4 affected assets",
      "Remediation ticket created with auto-generated patch instructions",
    ],
  },
  {
    stepName: "Assign to Owner",
    stepType: "assignment",
    integrationUsed: "IAM",
    avgDurationSec: 12,
    successOutputs: [
      "Ticket assigned to asset owner: Platform Engineering team",
      "Auto-assigned to system owner based on CMDB asset ownership records",
    ],
  },
  {
    stepName: "Track Patch Status",
    stepType: "monitoring",
    integrationUsed: "CMDB",
    avgDurationSec: 20,
    successOutputs: [
      "Patch tracking initiated. SLA deadline set: 72 hours for critical findings",
      "Remediation tracking active. Dashboard updated with patch progress",
    ],
  },
];

const ASSET_DISCOVERY_STEPS: StepTemplate[] = [
  {
    stepName: "Trigger Discovery",
    stepType: "trigger",
    integrationUsed: "CMDB",
    avgDurationSec: 6,
    successOutputs: [
      "New asset discovered: EC2 instance i-0a1b2c3d4e5f in us-east-1",
      "Asset discovery event: 3 new cloud resources detected in AWS account",
    ],
  },
  {
    stepName: "Query CMDB",
    stepType: "enrichment",
    integrationUsed: "ServiceNow",
    avgDurationSec: 35,
    successOutputs: [
      "CMDB metadata retrieved: Owner, business unit, environment tags applied",
      "Asset enriched with ServiceNow CI data. Classification: Production / Tier 1",
    ],
  },
  {
    stepName: "Assign Asset Owner",
    stepType: "assignment",
    integrationUsed: "IAM",
    avgDurationSec: 15,
    successOutputs: [
      "Owner assigned: Cloud Infrastructure team based on VPC mapping",
      "Asset owner set to Platform Engineering. Notification sent",
    ],
  },
  {
    stepName: "Run Security Scan",
    stepType: "enrichment",
    integrationUsed: "Qualys",
    avgDurationSec: 48,
    successOutputs: [
      "Security posture scan complete: Score 78/100. 2 medium findings",
      "Vulnerability assessment finished. No critical issues. Compliance: passing",
    ],
  },
  {
    stepName: "Update Asset Registry",
    stepType: "update",
    integrationUsed: "Asset DB",
    avgDurationSec: 10,
    successOutputs: [
      "Asset registry updated. Security posture score and ownership recorded",
      "Asset record created in registry with full metadata and scan results",
    ],
  },
];

const AWS_ACTIONS_STEPS: StepTemplate[] = [
  {
    stepName: "Validate AWS Credentials",
    stepType: "trigger",
    integrationUsed: "AWS",
    avgDurationSec: 8,
    successOutputs: [
      "AWS credentials validated. Session token active for account 123456789012",
      "IAM role assumed successfully. Region: us-east-1",
    ],
  },
  {
    stepName: "Execute AWS API Calls",
    stepType: "action",
    integrationUsed: "AWS",
    avgDurationSec: 22,
    requiresApproval: true,
    successOutputs: [
      "AWS API calls executed successfully: SecurityGroup updated, NACL modified",
      "3 AWS actions completed: EC2 isolation, snapshot created, forensic image captured",
    ],
  },
  {
    stepName: "Log to Audit Trail",
    stepType: "logging",
    integrationUsed: "Splunk",
    avgDurationSec: 12,
    successOutputs: [
      "All actions logged to Splunk audit trail. Event IDs: AUD-4821 through AUD-4823",
      "Audit log entries created. Compliance evidence preserved",
    ],
  },
];

const RISK_ESCALATION_STEPS: StepTemplate[] = [
  {
    stepName: "Calculate Risk Score",
    stepType: "enrichment",
    integrationUsed: "Risk Engine",
    avgDurationSec: 18,
    successOutputs: [
      "Risk score calculated: 94/100 (Critical). 3 contributing factors identified",
      "Aggregate risk score: 87/100. Asset criticality: High. Exposure: External",
    ],
  },
  {
    stepName: "Generate Escalation Report",
    stepType: "reporting",
    integrationUsed: "Reporting",
    avgDurationSec: 30,
    successOutputs: [
      "Executive escalation report generated. PDF attached to case",
      "Risk escalation report created with trend analysis and remediation timeline",
    ],
  },
  {
    stepName: "Notify Security Leadership",
    stepType: "notification",
    integrationUsed: "Email",
    avgDurationSec: 15,
    requiresApproval: true,
    successOutputs: [
      "Escalation email sent to CISO and Security Director. Read receipt confirmed",
      "Leadership notification delivered. Calendar hold created for risk review meeting",
    ],
  },
  {
    stepName: "Create Executive Summary",
    stepType: "enrichment",
    integrationUsed: "AI Engine",
    avgDurationSec: 25,
    successOutputs: [
      "AI-generated executive summary attached to escalation ticket",
      "Executive briefing document created with business impact analysis",
    ],
  },
];

const COMPLIANCE_CHECK_STEPS: StepTemplate[] = [
  {
    stepName: "Run Compliance Scans",
    stepType: "trigger",
    integrationUsed: "AWS / Azure",
    avgDurationSec: 55,
    successOutputs: [
      "Compliance scan completed across 3 cloud accounts. 247 controls evaluated",
      "Multi-cloud compliance assessment finished. AWS: 94%, Azure: 91%",
    ],
  },
  {
    stepName: "Check Policy Violations",
    stepType: "enrichment",
    integrationUsed: "Policy Engine",
    avgDurationSec: 28,
    successOutputs: [
      "Policy check complete: 4 violations found. 2 auto-remediated, 2 require review",
      "Zero critical policy violations. 3 medium findings added to remediation queue",
    ],
  },
  {
    stepName: "Generate Audit Reports",
    stepType: "reporting",
    integrationUsed: "Reporting",
    avgDurationSec: 35,
    successOutputs: [
      "SOC 2 audit report generated. Evidence packages compiled for 12 controls",
      "Audit-ready reports created for ISO 27001 and SOC 2 frameworks",
    ],
  },
  {
    stepName: "Send Dashboard Updates",
    stepType: "notification",
    integrationUsed: "Slack",
    avgDurationSec: 10,
    successOutputs: [
      "Compliance dashboard refreshed. Summary posted to #compliance-updates",
      "Weekly compliance digest sent to #compliance-updates channel",
    ],
  },
];

/** Map workflow IDs to their step templates */
export const WORKFLOW_STEP_TEMPLATES: Record<string, StepTemplate[]> = {
  "wf-1": ALERT_RESPONSE_STEPS,
  "wf-2": VULN_REMEDIATION_STEPS,
  "wf-3": ASSET_DISCOVERY_STEPS,
  "wf-4": AWS_ACTIONS_STEPS,
  "wf-5": RISK_ESCALATION_STEPS,
  "wf-6": COMPLIANCE_CHECK_STEPS,
};

/** Fallback template for unknown workflows */
const DEFAULT_STEPS: StepTemplate[] = ALERT_RESPONSE_STEPS;

export function getStepTemplatesForWorkflow(workflowId: string): StepTemplate[] {
  return WORKFLOW_STEP_TEMPLATES[workflowId] || DEFAULT_STEPS;
}

/* ================================================================
   STEP EXECUTION TEMPLATES — Pre-built complete sequences
   ================================================================ */

export function createSuccessfulExecution(
  runId: string,
  startTime: string,
  workflowId?: string
): StepExecution[] {
  const templates = workflowId ? getStepTemplatesForWorkflow(workflowId) : DEFAULT_STEPS;
  const steps: StepExecution[] = [];
  let currentTime = startTime;

  templates.forEach((template, index) => {
    const stepStart = currentTime;
    const durationSec = template.avgDurationSec + Math.floor(Math.random() * 10) - 5;
    const actualDuration = Math.max(3, durationSec);
    const stepEnd = addSeconds(stepStart, actualDuration);

    steps.push({
      stepId: `${runId}-step-${index + 1}`,
      stepName: template.stepName,
      stepType: template.stepType,
      integrationUsed: template.integrationUsed,
      status: "success" as StepExecutionStatus,
      startTime: stepStart,
      endTime: stepEnd,
      duration: calculateDuration(actualDuration),
      output: template.successOutputs[Math.floor(Math.random() * template.successOutputs.length)],
    });

    currentTime = stepEnd;
  });

  return steps;
}

export function createFailedExecution(
  runId: string,
  startTime: string,
  failAtStep: number,
  errorMessage: string,
  errorDetails: string,
  workflowId?: string
): StepExecution[] {
  const templates = workflowId ? getStepTemplatesForWorkflow(workflowId) : DEFAULT_STEPS;
  const steps: StepExecution[] = [];
  let currentTime = startTime;

  templates.forEach((template, index) => {
    if (index < failAtStep) {
      // Steps before the failure: success
      const stepStart = currentTime;
      const durationSec = template.avgDurationSec + Math.floor(Math.random() * 8) - 4;
      const actualDuration = Math.max(3, durationSec);
      const stepEnd = addSeconds(stepStart, actualDuration);

      steps.push({
        stepId: `${runId}-step-${index + 1}`,
        stepName: template.stepName,
        stepType: template.stepType,
        integrationUsed: template.integrationUsed,
        status: "success" as StepExecutionStatus,
        startTime: stepStart,
        endTime: stepEnd,
        duration: calculateDuration(actualDuration),
        output: template.successOutputs[Math.floor(Math.random() * template.successOutputs.length)],
      });
      currentTime = stepEnd;
    } else if (index === failAtStep) {
      // The failed step
      const stepStart = currentTime;
      const failDuration = template.avgDurationSec + 20; // failures take longer
      const stepEnd = addSeconds(stepStart, failDuration);

      steps.push({
        stepId: `${runId}-step-${index + 1}`,
        stepName: template.stepName,
        stepType: template.stepType,
        integrationUsed: template.integrationUsed,
        status: "failed" as StepExecutionStatus,
        startTime: stepStart,
        endTime: stepEnd,
        duration: calculateDuration(failDuration),
        errorMessage,
        errorDetails,
      });
      currentTime = stepEnd;
    } else {
      // Steps after the failure: skipped
      steps.push({
        stepId: `${runId}-step-${index + 1}`,
        stepName: template.stepName,
        stepType: template.stepType,
        integrationUsed: template.integrationUsed,
        status: "skipped" as StepExecutionStatus,
        output: "Step skipped due to previous failure",
      });
    }
  });

  return steps;
}

export function createRunningExecution(
  runId: string,
  startTime: string,
  runningAtStep: number,
  workflowId?: string
): StepExecution[] {
  const templates = workflowId ? getStepTemplatesForWorkflow(workflowId) : DEFAULT_STEPS;
  const steps: StepExecution[] = [];
  let currentTime = startTime;

  templates.forEach((template, index) => {
    if (index < runningAtStep) {
      // Completed steps
      const stepStart = currentTime;
      const durationSec = template.avgDurationSec + Math.floor(Math.random() * 6) - 3;
      const actualDuration = Math.max(3, durationSec);
      const stepEnd = addSeconds(stepStart, actualDuration);

      steps.push({
        stepId: `${runId}-step-${index + 1}`,
        stepName: template.stepName,
        stepType: template.stepType,
        integrationUsed: template.integrationUsed,
        status: "success" as StepExecutionStatus,
        startTime: stepStart,
        endTime: stepEnd,
        duration: calculateDuration(actualDuration),
        output: template.successOutputs[Math.floor(Math.random() * template.successOutputs.length)],
      });
      currentTime = stepEnd;
    } else if (index === runningAtStep) {
      // Currently running step
      steps.push({
        stepId: `${runId}-step-${index + 1}`,
        stepName: template.stepName,
        stepType: template.stepType,
        integrationUsed: template.integrationUsed,
        status: "running" as StepExecutionStatus,
        startTime: currentTime,
        output: `Executing ${template.stepName.toLowerCase()}...`,
      });
    } else {
      // Pending steps
      steps.push({
        stepId: `${runId}-step-${index + 1}`,
        stepName: template.stepName,
        stepType: template.stepType,
        integrationUsed: template.integrationUsed,
        status: index === runningAtStep + 1 ? "queued" as StepExecutionStatus : "pending" as StepExecutionStatus,
      });
    }
  });

  return steps;
}

export function createWaitingApprovalExecution(
  runId: string,
  startTime: string,
  approvalAtStep: number,
  workflowId?: string
): StepExecution[] {
  const templates = workflowId ? getStepTemplatesForWorkflow(workflowId) : DEFAULT_STEPS;
  const steps: StepExecution[] = [];
  let currentTime = startTime;

  templates.forEach((template, index) => {
    if (index < approvalAtStep) {
      // Completed steps
      const stepStart = currentTime;
      const durationSec = template.avgDurationSec + Math.floor(Math.random() * 6) - 3;
      const actualDuration = Math.max(3, durationSec);
      const stepEnd = addSeconds(stepStart, actualDuration);

      steps.push({
        stepId: `${runId}-step-${index + 1}`,
        stepName: template.stepName,
        stepType: template.stepType,
        integrationUsed: template.integrationUsed,
        status: "success" as StepExecutionStatus,
        startTime: stepStart,
        endTime: stepEnd,
        duration: calculateDuration(actualDuration),
        output: template.successOutputs[Math.floor(Math.random() * template.successOutputs.length)],
      });
      currentTime = stepEnd;
    } else if (index === approvalAtStep) {
      // Step awaiting approval
      steps.push({
        stepId: `${runId}-step-${index + 1}`,
        stepName: template.stepName,
        stepType: template.stepType,
        integrationUsed: template.integrationUsed,
        status: "waiting_approval" as StepExecutionStatus,
        startTime: currentTime,
        output: `Waiting for analyst approval to proceed with ${template.stepName.toLowerCase()}`,
      });
    } else {
      // Blocked steps
      steps.push({
        stepId: `${runId}-step-${index + 1}`,
        stepName: template.stepName,
        stepType: template.stepType,
        integrationUsed: template.integrationUsed,
        status: "blocked" as StepExecutionStatus,
        output: "Blocked: Waiting for approval on previous step",
      });
    }
  });

  return steps;
}

export function createBlockedIntegrationExecution(
  runId: string,
  startTime: string,
  integrationName: string = "Slack",
  workflowId?: string
): StepExecution[] {
  const templates = workflowId ? getStepTemplatesForWorkflow(workflowId) : DEFAULT_STEPS;
  // Find the step that uses this integration, or default to step index 3
  const blockedIndex = templates.findIndex(t =>
    t.integrationUsed.toLowerCase() === integrationName.toLowerCase()
  );
  const actualBlockedIndex = blockedIndex >= 0 ? blockedIndex : Math.min(3, templates.length - 1);

  const steps: StepExecution[] = [];
  let currentTime = startTime;

  templates.forEach((template, index) => {
    if (index < actualBlockedIndex) {
      // Completed steps
      const stepStart = currentTime;
      const durationSec = template.avgDurationSec + Math.floor(Math.random() * 6) - 3;
      const actualDuration = Math.max(3, durationSec);
      const stepEnd = addSeconds(stepStart, actualDuration);

      steps.push({
        stepId: `${runId}-step-${index + 1}`,
        stepName: template.stepName,
        stepType: template.stepType,
        integrationUsed: template.integrationUsed,
        status: "success" as StepExecutionStatus,
        startTime: stepStart,
        endTime: stepEnd,
        duration: calculateDuration(actualDuration),
        output: template.successOutputs[Math.floor(Math.random() * template.successOutputs.length)],
      });
      currentTime = stepEnd;
    } else if (index === actualBlockedIndex) {
      // Blocked by integration
      steps.push({
        stepId: `${runId}-step-${index + 1}`,
        stepName: template.stepName,
        stepType: template.stepType,
        integrationUsed: template.integrationUsed,
        status: "blocked" as StepExecutionStatus,
        startTime: currentTime,
        errorMessage: `${integrationName} integration not connected`,
        errorDetails: `This step requires ${integrationName} to be configured. Please connect the integration to continue execution.`,
      });
    } else {
      // Pending steps
      steps.push({
        stepId: `${runId}-step-${index + 1}`,
        stepName: template.stepName,
        stepType: template.stepType,
        integrationUsed: template.integrationUsed,
        status: "pending" as StepExecutionStatus,
        output: "Waiting for previous step to complete",
      });
    }
  });

  return steps;
}

/**
 * Generate step executions for replay runs based on replay mode
 */
export function generateReplayStepExecutions(
  runId: string,
  startTime: string,
  replayMode: "from_failed" | "modified_input" | "entire",
  finalStatus: "completed" | "failed",
  workflowId?: string
): StepExecution[] {
  const templates = workflowId ? getStepTemplatesForWorkflow(workflowId) : DEFAULT_STEPS;

  if (replayMode === "from_failed") {
    const steps: StepExecution[] = [];
    // Find a reasonable "failed step" index (default to step 3)
    const failedStepIndex = Math.min(3, templates.length - 2);
    let currentTime = startTime;

    templates.forEach((template, index) => {
      if (index < failedStepIndex) {
        // Skipped steps (already succeeded in the original run)
        steps.push({
          stepId: `${runId}-step-${index + 1}`,
          stepName: template.stepName,
          stepType: template.stepType,
          integrationUsed: template.integrationUsed,
          status: "skipped" as StepExecutionStatus,
          output: "Skipped: Replaying from failed step",
        });
      } else {
        const stepStart = currentTime;
        const durationSec = template.avgDurationSec + Math.floor(Math.random() * 8) - 4;
        const actualDuration = Math.max(3, durationSec);
        const stepEnd = addSeconds(stepStart, actualDuration);

        if (index === failedStepIndex && finalStatus === "failed") {
          steps.push({
            stepId: `${runId}-step-${index + 1}`,
            stepName: template.stepName,
            stepType: template.stepType,
            integrationUsed: template.integrationUsed,
            status: "failed" as StepExecutionStatus,
            startTime: stepStart,
            endTime: stepEnd,
            duration: calculateDuration(actualDuration),
            errorMessage: `${template.integrationUsed} connection failed on retry`,
            errorDetails: `The ${template.integrationUsed} service returned an error. Please check the integration configuration.`,
          });
          currentTime = stepEnd;
        } else if (index > failedStepIndex && finalStatus === "failed") {
          steps.push({
            stepId: `${runId}-step-${index + 1}`,
            stepName: template.stepName,
            stepType: template.stepType,
            integrationUsed: template.integrationUsed,
            status: "skipped" as StepExecutionStatus,
            output: "Skipped: Previous step failed",
          });
        } else {
          steps.push({
            stepId: `${runId}-step-${index + 1}`,
            stepName: template.stepName,
            stepType: template.stepType,
            integrationUsed: template.integrationUsed,
            status: "success" as StepExecutionStatus,
            startTime: stepStart,
            endTime: stepEnd,
            duration: calculateDuration(actualDuration),
            output: template.successOutputs[Math.floor(Math.random() * template.successOutputs.length)],
          });
          currentTime = stepEnd;
        }
      }
    });

    return steps;
  }

  if (replayMode === "modified_input") {
    return createSuccessfulExecution(runId, startTime, workflowId).map((step, i) => ({
      ...step,
      output: `Modified Input: ${step.output}`,
      status: (i === templates.length - 2 && finalStatus === "failed")
        ? "failed" as StepExecutionStatus
        : (i > templates.length - 2 && finalStatus === "failed")
        ? "skipped" as StepExecutionStatus
        : step.status,
      ...(i === templates.length - 2 && finalStatus === "failed" ? {
        errorMessage: "Execution failed with modified parameters",
        errorDetails: "The modified input values produced an incompatible configuration.",
      } : {}),
    }));
  }

  // Default: entire replay (same as normal execution)
  return generateStepExecutions(runId, finalStatus, startTime, workflowId);
}

/* ================================================================
   EXPORT EXECUTION GENERATOR
   ================================================================ */

export function generateStepExecutions(
  runId: string,
  runStatus: string,
  startTime: string,
  workflowId?: string
): StepExecution[] {
  switch (runStatus) {
    case "completed":
      return createSuccessfulExecution(runId, startTime, workflowId);
    case "failed": {
      // Vary which step fails
      const templates = workflowId ? getStepTemplatesForWorkflow(workflowId) : DEFAULT_STEPS;
      const failIndex = runId.endsWith("10") || runId.endsWith("6")
        ? Math.min(3, templates.length - 1)
        : Math.min(1, templates.length - 1);
      const failStep = templates[failIndex];
      return createFailedExecution(
        runId,
        startTime,
        failIndex,
        `${failStep.integrationUsed} connection failed: Authentication expired`,
        `The ${failStep.integrationUsed} API token has expired. Please reconnect the integration to continue.`,
        workflowId
      );
    }
    case "running":
      return createRunningExecution(runId, startTime, 2, workflowId);
    case "waiting_approval":
      return createWaitingApprovalExecution(runId, startTime, 3, workflowId);
    default:
      return createSuccessfulExecution(runId, startTime, workflowId);
  }
}