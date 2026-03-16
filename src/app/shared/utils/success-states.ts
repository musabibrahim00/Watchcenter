/**
 * Success States — Predefined success confirmation data for action buttons.
 */
import type { SuccessConfirmationProps } from "../../../imports/AiBoxModules";

export const SUCCESS_STATES: Record<string, SuccessConfirmationProps> = {
  Authorize: {
    title: "Remediation authorized",
    description: "Governance workflow triggered. Containment will execute within the SLA window.",
    detail: "Audit trail updated. SOC Triage notified.",
    metrics: [
      { label: "ETA", value: "< 5 min" },
      { label: "Workflow", value: "Active" },
      { label: "Audit", value: "Logged" },
    ],
    actions: ["Show metrics", "View details"],
  },
  "Authorize rollback": {
    title: "Rollback authorized",
    description: "Configuration policy is being restored to last known good state.",
    metrics: [
      { label: "Resources", value: "6 restoring" },
      { label: "ETA", value: "< 2 min" },
      { label: "Status", value: "Executing" },
    ],
    actions: ["Show metrics"],
  },
  "Create case": {
    title: "Case created successfully",
    description: "Investigation case has been opened and assigned to the appropriate team.",
    detail: "SLA clock started. Full artifact bundle attached.",
    metrics: [
      { label: "Case", value: "CASE-4223" },
      { label: "SLA", value: "4h response" },
      { label: "Owner", value: "SOC Triage" },
    ],
    actions: ["View case", "Assign owner"],
  },
  Escalate: {
    title: "Escalation confirmed",
    description: "Finding escalated to Tier 2 SOC. On-call analyst notified via PagerDuty.",
    metrics: [
      { label: "Channel", value: "PagerDuty" },
      { label: "Tier", value: "2" },
      { label: "Status", value: "Notified" },
    ],
    actions: ["View details"],
  },
  "Trigger remediation": {
    title: "Remediation workflow initiated",
    description: "Automated remediation has been queued. Awaiting scope confirmation before execution.",
    metrics: [
      { label: "Scope", value: "6 resources" },
      { label: "Type", value: "Auto-remediation" },
      { label: "ETA", value: "< 3 min" },
    ],
    actions: ["View details"],
  },
  "Block IOCs": {
    title: "IOC block rules deployed",
    description: "14 indicators blocked across all network segments. Firewall and EDR block lists updated.",
    metrics: [
      { label: "Blocked", value: "14 IOCs" },
      { label: "Segments", value: "3/3" },
      { label: "Status", value: "Enforced" },
    ],
  },
  "Block access": {
    title: "Access revoked successfully",
    description: "Privileges removed from flagged service accounts. Credential rotation triggered.",
    metrics: [
      { label: "Accounts", value: "3 revoked" },
      { label: "Credentials", value: "Rotating" },
      { label: "Audit", value: "Logged" },
    ],
  },
  "Restrict access": {
    title: "Access restriction applied",
    description: "Entitlements reduced for the flagged service principal. Write access to production stores has been revoked.",
    metrics: [
      { label: "Principal", value: "svc-ci-deploy" },
      { label: "Access", value: "Read-only" },
      { label: "Path impact", value: "-1 hop" },
    ],
    actions: ["View details"],
  },
  "Rotate token": {
    title: "Token rotation initiated",
    description: "Leaked service token has been invalidated. New credential will be issued to authorized consumers.",
    metrics: [
      { label: "Token", value: "Invalidated" },
      { label: "New token", value: "Generating" },
      { label: "ETA", value: "< 1 min" },
    ],
  },
  "Patch dependency": {
    title: "Emergency patch authorized",
    description: "Patch deployment pipeline initiated for the affected dependency. Staging validation will precede production rollout.",
    metrics: [
      { label: "CVE", value: "CVE-2026-1847" },
      { label: "Stage", value: "Deploying" },
      { label: "Impact", value: "Path severed" },
    ],
    actions: ["Show metrics"],
  },
  "Contain workload": {
    title: "Containment initiated",
    description: "Network isolation requested for the compromised workload. Governance workflow tracking the remediation lifecycle.",
    metrics: [
      { label: "Target", value: "Build server" },
      { label: "ETA", value: "< 5 min" },
      { label: "Method", value: "Net isolation" },
    ],
  },
  Investigate: {
    title: "Investigation initiated",
    description: "Deep-dive investigation triggered across correlated signals.",
    metrics: [
      { label: "Signals", value: "Correlating" },
      { label: "Scope", value: "Expanding" },
    ],
    actions: ["Show metrics"],
  },
};

export function getSuccessState(label: string): SuccessConfirmationProps | null {
  return SUCCESS_STATES[label] || null;
}
