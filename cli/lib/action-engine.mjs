/**
 * action-engine.mjs — Build ActionPreview objects for executable intents
 *
 * Mirrors the UI's Action Card model:
 *   L1 — Low-risk read-adjacent actions (re-run, refresh).
 *         Confirmation required; no approval needed.
 *   L2 — Moderate-risk actions (simulate, reclassify, create case).
 *         Confirmation required; approval may be needed.
 *   L3 — High-risk or irreversible actions (publish, remediate, patch).
 *         Full approval workflow required before execution.
 *
 * Executable actions are NEVER auto-run. They always produce a preview
 * that the user must explicitly confirm.
 */

// ── ActionPreview shape ───────────────────────────────────────────────────────
// {
//   title, scope, parameters, expectedOutcome,
//   guardrailLevel, confirmationRequired, approvalRequired,
//   contextType, contextId, intent
// }

// ── Per-context action builders ───────────────────────────────────────────────

function agentActions(ctx, intent) {
  const { label, agentId } = ctx;

  const map = {
    rerun: {
      title: "Re-run Analysis",
      scope: label,
      parameters: {
        "Priority":        "Normal",
        "Analysis scope":  "Full cycle",
        "Target context":  label,
      },
      expectedOutcome: [
        "Findings refreshed with latest data",
        "Risk score recalculated",
        "New indicators added to investigation timeline",
      ],
      guardrailLevel:       "L1",
      confirmationRequired: true,
      approvalRequired:     false,
    },
    simulate: {
      title: "Simulate Impact",
      scope: label,
      parameters: {
        "Simulation mode":    "Full breach scenario",
        "Analyst context":    label,
        "Affected segments":  "All monitored",
      },
      expectedOutcome: [
        "Blast radius calculated across all monitored assets",
        "Impacted asset list generated",
        "Risk score updated with simulation data",
      ],
      guardrailLevel:       "L2",
      confirmationRequired: true,
      approvalRequired:     true,
    },
    "create-case": {
      title: "Create Investigation Case",
      scope: label,
      parameters: {
        "Case type":    "Analyst findings",
        "Priority":     "High",
        "Assigned to":  "Security Operations",
      },
      expectedOutcome: [
        "New investigation case created",
        "Current findings linked to case",
        "Notification sent to case owner",
      ],
      guardrailLevel:       "L2",
      confirmationRequired: true,
      approvalRequired:     false,
    },
  };

  const action = map[intent];
  if (!action) return null;
  return { ...action, contextType: "agent", contextId: agentId ?? "unknown" };
}

function workflowActions(ctx, intent) {
  const { label, id } = ctx;

  const map = {
    publish: {
      title: "Publish Workflow",
      scope: label,
      parameters: {
        "Environment":       "Production",
        "Trigger mode":      "Automatic",
        "Notification step": "Slack (will require reconnection)",
      },
      expectedOutcome: [
        "Workflow activated in production",
        "Automatic trigger rules applied",
        "Run history tracking enabled",
      ],
      guardrailLevel:       "L3",
      confirmationRequired: true,
      approvalRequired:     true,
    },
    rerun: {
      title: "Re-run Workflow",
      scope: label,
      parameters: {
        "Run mode":  "Manual trigger",
        "Dry run":   "No",
      },
      expectedOutcome: [
        "Workflow execution started",
        "Step results recorded in run history",
      ],
      guardrailLevel:       "L1",
      confirmationRequired: true,
      approvalRequired:     false,
    },
    remediate: {
      title: "Apply Workflow Fix",
      scope: label,
      parameters: {
        "Fix target": "Slack notification step",
        "Action":     "Reconnect integration and retry",
      },
      expectedOutcome: [
        "Failing step reconfigured",
        "Workflow re-enabled and queued",
      ],
      guardrailLevel:       "L2",
      confirmationRequired: true,
      approvalRequired:     false,
    },
  };

  const action = map[intent];
  if (!action) return null;
  return { ...action, contextType: "workflow", contextId: id ?? "unknown" };
}

function assetActions(ctx, intent) {
  const { label, id } = ctx;

  const map = {
    simulate: {
      title: "Simulate Impact",
      scope: label,
      parameters: {
        "Simulation mode":   "Full breach scenario",
        "Target asset":      label,
        "Include laterals":  "Yes",
      },
      expectedOutcome: [
        "Blast radius and lateral movement path calculated",
        "Impacted assets and data classes listed",
        "Business impact score updated",
      ],
      guardrailLevel:       "L2",
      confirmationRequired: true,
      approvalRequired:     true,
    },
    reclassify: {
      title: "Reclassify Asset",
      scope: label,
      parameters: {
        "Current classification": "Production Database",
        "New classification":     "(pending input — use: modify classification <value>)",
      },
      expectedOutcome: [
        "Asset classification updated in inventory",
        "Risk scoring rules re-evaluated",
        "Compliance controls re-mapped",
      ],
      guardrailLevel:       "L2",
      confirmationRequired: true,
      approvalRequired:     false,
    },
    remediate: {
      title: "Initiate Asset Remediation",
      scope: label,
      parameters: {
        "Remediation type": "Network isolation",
        "Priority":         "Critical",
        "Scope":            "Block external access routes",
      },
      expectedOutcome: [
        "Firewall rule change request created",
        "Network segmentation policy applied",
        "Attack paths blocked — re-verification scheduled",
      ],
      guardrailLevel:       "L3",
      confirmationRequired: true,
      approvalRequired:     true,
    },
    "create-case": {
      title: "Create Investigation Case",
      scope: label,
      parameters: {
        "Case type": "Asset risk investigation",
        "Priority":  "Critical",
        "Assets":    label,
      },
      expectedOutcome: [
        "Investigation case created",
        "Asset findings linked to case",
        "Analyst assigned for follow-up",
      ],
      guardrailLevel:       "L2",
      confirmationRequired: true,
      approvalRequired:     false,
    },
    rerun: {
      title: "Re-run Asset Analysis",
      scope: label,
      parameters: {
        "Analysis scope": "Full asset scan",
        "Priority":       "Normal",
      },
      expectedOutcome: [
        "Asset data refreshed",
        "Vulnerability and exposure data updated",
        "Risk score recalculated",
      ],
      guardrailLevel:       "L1",
      confirmationRequired: true,
      approvalRequired:     false,
    },
  };

  const action = map[intent];
  if (!action) return null;
  return { ...action, contextType: "asset", contextId: id ?? "unknown" };
}

function attackPathActions(ctx, intent) {
  const { label, id } = ctx;

  const map = {
    remediate: {
      title: "Initiate Path Remediation",
      scope: label,
      parameters: {
        "Remediation strategy": "Block all hops + patch entry point",
        "Priority":             "Critical",
        "Notify teams":         "Security Operations, Network Engineering",
      },
      expectedOutcome: [
        "Firewall rule change request created for each hop",
        "CVE patch task created for entry-point vulnerability",
        "Path marked as mitigated pending verification",
        "Re-verification scheduled in 24 hours",
      ],
      guardrailLevel:       "L3",
      confirmationRequired: true,
      approvalRequired:     true,
    },
    "create-case": {
      title: "Create Investigation Case",
      scope: label,
      parameters: {
        "Case type": "Attack path investigation",
        "Priority":  "Critical",
        "Path":      label,
      },
      expectedOutcome: [
        "Investigation case created and linked to attack path",
        "All path nodes added as evidence",
        "Assigned to Security Operations team",
      ],
      guardrailLevel:       "L2",
      confirmationRequired: true,
      approvalRequired:     false,
    },
    simulate: {
      title: "Simulate Path Exploitation",
      scope: label,
      parameters: {
        "Simulation depth": "Full path execution",
        "Target":           "End node (finance-db-01)",
        "Include post-exp": "Yes",
      },
      expectedOutcome: [
        "Full exploitation scenario mapped",
        "Data classes at risk identified",
        "Business impact quantified",
      ],
      guardrailLevel:       "L2",
      confirmationRequired: true,
      approvalRequired:     true,
    },
  };

  const action = map[intent];
  if (!action) return null;
  return { ...action, contextType: "attack-path", contextId: id ?? "unknown" };
}

function complianceActions(ctx, intent) {
  const { label, id } = ctx;

  const map = {
    remediate: {
      title: "Initiate Compliance Remediation",
      scope: label,
      parameters: {
        "Gap priority":    "Critical",
        "Remediation type": "Automated + manual tasks",
        "Deadline":         "14 days",
      },
      expectedOutcome: [
        "Remediation tasks created for each gap",
        "Owners assigned and notified",
        "Compliance score updated when tasks complete",
      ],
      guardrailLevel:       "L2",
      confirmationRequired: true,
      approvalRequired:     false,
    },
    "create-case": {
      title: "Create Compliance Case",
      scope: label,
      parameters: {
        "Case type": "Compliance gap remediation",
        "Framework": label,
        "Priority":  "High",
      },
      expectedOutcome: [
        "Compliance case created with all active gaps",
        "Assigned to Governance team for remediation",
        "Evidence collection initiated",
      ],
      guardrailLevel:       "L2",
      confirmationRequired: true,
      approvalRequired:     false,
    },
  };

  const action = map[intent];
  if (!action) return null;
  return { ...action, contextType: "compliance", contextId: id ?? "unknown" };
}

function generalActions(_ctx, intent) {
  if (intent === "create-case") {
    return {
      title: "Create Investigation Case",
      scope: "Watch Center",
      parameters: {
        "Case type": "Security investigation",
        "Priority":  "High",
        "Scope":     "Current Watch Center context",
      },
      expectedOutcome: [
        "Investigation case created",
        "Current findings linked",
        "Assigned to Security Operations",
      ],
      guardrailLevel:       "L2",
      confirmationRequired: true,
      approvalRequired:     false,
      contextType:          "general",
      contextId:            "watch-center",
    };
  }
  return null;
}

// ── Public API ────────────────────────────────────────────────────────────────
export function buildActionPreview(ctx, intent) {
  switch (ctx.type) {
    case "agent":       return agentActions(ctx, intent);
    case "workflow":    return workflowActions(ctx, intent);
    case "asset":       return assetActions(ctx, intent);
    case "attack-path": return attackPathActions(ctx, intent);
    case "compliance":  return complianceActions(ctx, intent);
    case "general":
    default:            return generalActions(ctx, intent);
  }
}

// ── Apply a modification to an existing ActionPreview ─────────────────────────
export function applyModification(preview, field, value) {
  const normalField = field.toLowerCase().replace(/[- ]/g, "_");

  // Map common field aliases to parameter keys
  const paramAliases = {
    priority: "Priority",
    scope: "Analysis scope",
    analysis_scope: "Analysis scope",
    mode: "Simulation mode",
    simulation_mode: "Simulation mode",
    environment: "Environment",
    max_hops: "Max hops",
    classification: "New classification",
    type: "Remediation type",
    deadline: "Deadline",
    dry_run: "Dry run",
  };

  const paramKey = paramAliases[normalField] ?? field;

  // Check if this is a known parameter
  if (preview.parameters && paramKey in preview.parameters) {
    return {
      ...preview,
      parameters: { ...preview.parameters, [paramKey]: value },
    };
  }

  // Try case-insensitive match against existing parameter keys
  const existingKey = Object.keys(preview.parameters ?? {}).find(
    k => k.toLowerCase() === paramKey.toLowerCase()
  );
  if (existingKey) {
    return {
      ...preview,
      parameters: { ...preview.parameters, [existingKey]: value },
    };
  }

  // Add as new parameter
  return {
    ...preview,
    parameters: { ...(preview.parameters ?? {}), [paramKey]: value },
  };
}

// ── Simulate result after confirmation ────────────────────────────────────────
export function simulateResult(preview) {
  const results = {
    "Re-run Analysis": {
      whatChanged: [
        "Findings refreshed — 2 new indicators detected",
        "Risk score recalculated — no change from previous run",
        "Investigation timeline updated with latest events",
      ],
      nextActions: [
        `secops ask "what needs attention"`,
        `secops agent "${preview.scope}" "explain recent findings"`,
      ],
    },
    "Simulate Impact": {
      whatChanged: [
        "Blast radius calculated — 14 assets potentially impacted",
        "Critical data classes at risk: financial records, PII",
        "Business impact score: 92/100 (CRITICAL)",
        "Impacted asset list saved to investigation context",
      ],
      nextActions: [
        `secops asset finance-db-01 "recommend actions"`,
        `secops create-case`,
        `secops open-in-ui`,
      ],
    },
    "Publish Workflow": {
      whatChanged: [
        `Workflow activated in production`,
        "Automatic trigger rules applied",
        "Run history tracking enabled",
      ],
      nextActions: [
        `secops workflow "${preview.scope}" "check status"`,
        `secops open-in-ui`,
      ],
    },
    "Create Investigation Case": {
      whatChanged: [
        "Investigation case created — Case ID: CASE-2026-0384",
        "Current findings linked to case",
        "Assigned to Security Operations team",
      ],
      nextActions: [
        `secops ask "view active cases"`,
        `secops open-in-ui`,
      ],
    },
    "Initiate Path Remediation": {
      whatChanged: [
        "Firewall rule change request created — ticket: FW-2026-041",
        "CVE patch task created and assigned to Vulnerability team",
        "Attack path marked as mitigated — pending verification in 24 hours",
      ],
      nextActions: [
        `secops ask "what needs attention"`,
        `secops open-in-ui`,
      ],
    },
    "Initiate Asset Remediation": {
      whatChanged: [
        "Network isolation request submitted — ticket: NET-2026-088",
        "Firewall team notified — SLA: 4 hours",
        "Asset marked as under remediation in inventory",
      ],
      nextActions: [
        `secops asset ${preview.scope} "assess current CIA risk"`,
        `secops open-in-ui`,
      ],
    },
    "Re-run Asset Analysis": {
      whatChanged: [
        "Asset data refreshed — last seen: now",
        "Vulnerability scan updated — 1 new CVE matched",
        "Risk score recalculated — unchanged",
      ],
      nextActions: [
        `secops asset ${preview.scope} "explain recent findings"`,
        `secops open-in-ui`,
      ],
    },
  };

  const result = results[preview.title] ?? {
    whatChanged: ["Action completed successfully."],
    nextActions: [`secops ask "what needs attention"`, `secops open-in-ui`],
  };

  return {
    ...result,
    action:       preview.title,
    scope:        preview.scope,
    guardrail:    preview.guardrailLevel,
    completedAt:  new Date().toISOString(),
  };
}
