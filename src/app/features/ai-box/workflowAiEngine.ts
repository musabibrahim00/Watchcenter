/**
 * workflowAiEngine — Workflow plan templates and canvas dispatch utilities
 *
 * Extracted from GlobalAIBox to reduce the size and concern-surface of the
 * main AI panel file.  Contains only pure data and side-effect-free helpers
 * (plus the canvas event dispatchers, which talk to the WorkflowBuilder).
 *
 * Does NOT render React — all JSX stays in GlobalAIBox.
 */

// ── Plan step blueprint ─────────────────────────────────────────────────────

export interface PlanStep {
  id: string;
  templateId: string;
  name: string;
  type: "trigger" | "action";
  integration?: string;
}

// ── Workflow plan templates ─────────────────────────────────────────────────

export const WORKFLOW_PLANS: Record<string, { name: string; steps: PlanStep[] }> = {
  critical_alert: {
    name: "Critical Alert Response",
    steps: [
      { id: "s1", templateId: "alert-trigger",  name: "Alert Trigger",              type: "trigger" },
      { id: "s2", templateId: "enrich-alert",   name: "Enrich Alert",               type: "action", integration: "VirusTotal" },
      { id: "s3", templateId: "create-case",    name: "Create Investigation Case",  type: "action" },
      { id: "s4", templateId: "assign-analyst", name: "Assign Analyst",             type: "action" },
      { id: "s5", templateId: "notify-slack",   name: "Notify Slack",               type: "action", integration: "Slack" },
    ],
  },
  vulnerability: {
    name: "Vulnerability Remediation",
    steps: [
      { id: "s1", templateId: "alert-trigger",  name: "Vulnerability Detected",     type: "trigger" },
      { id: "s2", templateId: "enrich-alert",   name: "Query Patch Status",         type: "action", integration: "Nessus" },
      { id: "s3", templateId: "create-case",    name: "Create Jira Ticket",         type: "action", integration: "Jira" },
      { id: "s4", templateId: "assign-analyst", name: "Assign Asset Owner",         type: "action" },
      { id: "s5", templateId: "notify-slack",   name: "Notify Team",                type: "action", integration: "Slack" },
    ],
  },
  compliance: {
    name: "Weekly Compliance Report",
    steps: [
      { id: "s1", templateId: "alert-trigger",       name: "Scheduled Trigger (Weekly)", type: "trigger" },
      { id: "s2", templateId: "run-scan",            name: "Run Compliance Scan",        type: "action" },
      { id: "s3", templateId: "query-threat-intel",  name: "Check Policy Violations",    type: "action" },
      { id: "s4", templateId: "create-case",         name: "Generate Audit Report",      type: "action" },
      { id: "s5", templateId: "notify-slack",        name: "Distribute to Leadership",   type: "action", integration: "Slack" },
    ],
  },
  manual: {
    name: "Manual SOC Workflow",
    steps: [
      { id: "s1", templateId: "alert-trigger",  name: "Manual Trigger",   type: "trigger" },
      { id: "s2", templateId: "enrich-alert",   name: "Gather Context",   type: "action" },
      { id: "s3", templateId: "create-case",    name: "Create Case",      type: "action" },
      { id: "s4", templateId: "notify-slack",   name: "Notify Team",      type: "action", integration: "Slack" },
    ],
  },
  generic: {
    name: "Custom Workflow",
    steps: [
      { id: "s1", templateId: "alert-trigger",  name: "Alert Trigger",              type: "trigger" },
      { id: "s2", templateId: "create-case",    name: "Create Investigation Case",  type: "action" },
      { id: "s3", templateId: "assign-analyst", name: "Assign Analyst",             type: "action" },
      { id: "s4", templateId: "notify-slack",   name: "Notify Slack",               type: "action", integration: "Slack" },
    ],
  },
};

// ── Plan key matchers ───────────────────────────────────────────────────────

/** Select the best WORKFLOW_PLANS key for a natural-language query */
export function matchPlanKey(query: string): string | null {
  const q = query.toLowerCase();
  if (q.includes("critical") && q.includes("alert"))                                   return "critical_alert";
  if (q.includes("vulnerabilit") || q.includes("remediation") || q.includes("patch")) return "vulnerability";
  if (q.includes("compliance") || q.includes("audit") || q.includes("report"))        return "compliance";
  if (q.includes("manual"))                                                             return "manual";
  if (q.includes("create") || q.includes("build") || q.includes("workflow") ||
      q.includes("respond") || q.includes("automate"))                                 return "generic";
  return null;
}

/** Map a template display name to the best-matching WORKFLOW_PLANS key */
export function matchTemplateToPlan(templateName: string): string {
  const n = templateName.toLowerCase();
  if (n.includes("critical") && n.includes("alert")) return "critical_alert";
  if (n.includes("enrichment"))                      return "critical_alert";
  if (n.includes("vulnerab"))                        return "vulnerability";
  if (n.includes("compliance") || n.includes("report")) return "compliance";
  if (n.includes("asset") || n.includes("onboarding")) return "generic";
  if (n.includes("access") || n.includes("provision")) return "generic";
  return "generic";
}

// ── Canvas event dispatchers ────────────────────────────────────────────────

/** Dispatch full canvas replacement — used by create mode */
export function dispatchCanvasUpdate(steps: PlanStep[]): void {
  window.dispatchEvent(new CustomEvent("workflow-canvas-update", {
    detail: {
      steps: steps.map(s => ({
        id:                   s.id,
        templateId:           s.templateId,
        name:                 s.name,
        status:               "idle" as const,
        requiresIntegration:  s.integration,
      })),
    },
  }));
}

/** Semantic canvas edit operations — WorkflowBuilder listens and applies */
export type CanvasEditOp =
  | { type: "add-after";      afterTemplateId: string; newStep: { id: string; templateId: string; name: string; requiresIntegration?: string } }
  | { type: "add-end";        newStep: { id: string; templateId: string; name: string; requiresIntegration?: string } }
  | { type: "remove";         templateId: string }
  | { type: "replace";        oldTemplateId: string; newStep: { id: string; templateId: string; name: string; requiresIntegration?: string } }
  | { type: "change-trigger"; newStep: { id: string; templateId: string; name: string; requiresIntegration?: string } };

/** Dispatch a semantic canvas edit operation (used by edit mode) */
export function dispatchCanvasEdit(op: CanvasEditOp): void {
  setTimeout(() => {
    window.dispatchEvent(new CustomEvent("workflow-canvas-edit", { detail: op }));
  }, 200);
}

let _editStepCounter = 100;
/** Generate a unique step ID for AI-created canvas steps */
export function nextEditStepId(): string {
  return `ai-step-${++_editStepCounter}`;
}
