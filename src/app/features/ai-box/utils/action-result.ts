/**
 * AI Box — Action result derivation utilities.
 *
 * Pure functions: no React, no state, no side-effects.
 * Derives structured result/failure summaries from completed ActionCardData.
 */

import type { ActionCardData, ActionResultData, ActionFailureInfo } from "../types";

export function deriveActionResult(data: ActionCardData): ActionResultData {
  const t = data.title;
  const analysts = data.participatingAnalysts;

  if (/re-?run analysis|re-?run investigation/i.test(t)) {
    return {
      resultType: "findings_updated",
      changeState: "changed",
      bullets: [
        "Analysis cycle completed successfully",
        "Findings refreshed with latest data",
        "Risk scores updated across linked records",
        "Downstream cases and alerts synchronized",
      ],
      before: { "Severity": "Medium", "Finding Count": "14", "Last Analyzed": "6 days ago" },
      after: { "Severity": "High", "Finding Count": "19", "Last Analyzed": "Just now" },
      whyItChanged: "Five new indicators emerged from updated threat intelligence feeds since the previous cycle. Severity elevated because three of the new findings match active campaign patterns.",
      nextActions: ["View updated findings", "Recalculate risk score", "Create case from findings"],
      analysts,
    };
  }

  if (/recalculate risk/i.test(t)) {
    return {
      resultType: "risk_score_updated",
      changeState: "changed",
      bullets: [
        "Composite risk score recalculated",
        "Asset criticality and threat intelligence incorporated",
        "Downstream case priorities updated",
      ],
      before: { "Risk Score": "High (78/100)", "Priority": "Standard" },
      after: { "Risk Score": "Critical (91/100)", "Priority": "Elevated" },
      whyItChanged: "Three high-criticality assets were recently added to the blast radius, and the threat actor associated with this campaign escalated activity in the last 48 hours.",
      nextActions: ["View risk breakdown", "Review affected assets", "Create remediation case"],
      analysts,
    };
  }

  if (/re-?classify asset/i.test(t)) {
    return {
      resultType: "asset_classification_changed",
      changeState: "changed",
      bullets: [
        "Asset classification updated",
        "CMDB metadata refreshed",
        "Downstream risk and compliance mappings updated",
      ],
      before: { "Classification": "Internal Asset", "Exposure": "Low", "Compliance Scope": "Out of scope" },
      after: { "Classification": "Production Service", "Exposure": "External", "Compliance Scope": "PCI-DSS" },
      whyItChanged: "The asset was found to be reachable from the public internet via a recently exposed endpoint, and its data flows match production service criteria under the current classification policy.",
      nextActions: ["View updated asset", "Review compliance impact", "Re-run risk analysis"],
      analysts,
    };
  }

  if (/simulate/i.test(t)) {
    return {
      resultType: "attack_path_refreshed",
      changeState: "changed",
      bullets: [
        "Blast radius simulation complete",
        "Affected assets and lateral movement paths mapped",
        "Business impact estimated across analyst inputs",
      ],
      before: { "Blast Radius": "Not calculated", "Hops to Domain Admin": "Unknown" },
      after: { "Business Impact": "High", "Blast Radius": "12 assets", "Hops to Domain Admin": "3" },
      whyItChanged: "Simulation identified a chain of misconfigured trust relationships that allows lateral movement from the initial foothold to privileged infrastructure in three hops.",
      nextActions: ["Review simulation results", "Recalculate risk with simulation data", "Restrict access to affected assets"],
      analysts,
    };
  }

  if (/reassess findings/i.test(t)) {
    return {
      resultType: "findings_updated",
      changeState: "partial",
      bullets: [
        "Findings reassessed against current state",
        "Two of five findings updated with revised ratings",
        "Three findings confirmed — no material change detected",
      ],
      before: { "Critical Findings": "1", "High Findings": "4" },
      after: { "Critical Findings": "3", "High Findings": "2" },
      unchanged: { "Medium Findings": "7", "Compliance Status": "Non-compliant" },
      whyItChanged: "Two previously high-severity findings were reclassified as critical due to new exploitation evidence. The remaining findings had no new data available to revise their ratings.",
      nextActions: ["View updated findings", "Review changed risk ratings", "Create case from high-severity findings"],
      analysts,
    };
  }

  if (/create case|create ticket|create incident/i.test(t)) {
    return {
      resultType: "case_linkage_created",
      changeState: "changed",
      bullets: [
        "Investigation case created and linked",
        "Analyst assigned and notified",
        "Current findings attached to the case",
      ],
      before: { "Case Status": "None" },
      after: { "Case Status": "Open", "Assigned To": "SOC Tier 1" },
      whyItChanged: "Case created from the current finding set to begin formal investigation and ensure findings are tracked through to resolution.",
      nextActions: ["View created case", "Add findings to case", "Assign additional analyst"],
      analysts,
    };
  }

  if (/block|disable|quarantine|isolate/i.test(t)) {
    return {
      resultType: "run_status_changed",
      changeState: "changed",
      bullets: [
        `${t} executed successfully`,
        "Access and session changes applied",
        "Affected users and systems notified",
        "Event recorded in audit trail",
      ],
      before: { "Access Status": "Active" },
      after: { "Access Status": "Restricted", "Audit Log": "Updated" },
      whyItChanged: "Action applied immediately to all matched targets. Sessions were terminated and access policies updated to prevent re-entry until manually reviewed.",
      nextActions: ["View audit log", "Monitor affected systems", "Review blast radius"],
      analysts,
    };
  }

  if (/rotate credentials/i.test(t)) {
    return {
      resultType: "run_status_changed",
      changeState: "changed",
      bullets: [
        "Credentials rotated successfully",
        "Active sessions invalidated",
        "Credential owners notified",
        "Event recorded in audit trail",
      ],
      before: { "Credential Status": "Active (stale)", "Last Rotated": "94 days ago" },
      after: { "Credential Status": "Rotated", "Last Rotated": "Just now" },
      whyItChanged: "Credentials exceeded the maximum rotation window and were flagged for potential compromise based on exposure indicators in the current investigation.",
      nextActions: ["Monitor re-authentication", "Update dependent systems", "View audit log"],
      analysts,
    };
  }

  if (/trigger scan|run.*scan|compliance check/i.test(t)) {
    return {
      resultType: "findings_updated",
      changeState: "no-change",
      bullets: [
        "Scan completed successfully",
        "No material differences detected since the last cycle",
        "All previously identified findings remain unchanged",
      ],
      unchanged: { "Finding Count": "14", "Risk Score": "High (78/100)", "Compliance Status": "Non-compliant" },
      whyItChanged: "The scan ran against the same configuration and data as the previous cycle. No new indicators, asset changes, or threat intelligence updates were available to alter the results.",
      nextActions: ["View scan results", "Export report", "Create case for findings"],
      analysts,
    };
  }

  if (/workflow diagnostics|health check|run diagnostics/i.test(t)) {
    return {
      resultType: "workflow_health_updated",
      changeState: "partial",
      bullets: [
        "Workflow diagnostics completed",
        "Two integrations returned degraded status",
        "Notification delivery confirmed on three of five steps",
      ],
      before: { "Workflow Health": "Unknown", "Failed Steps": "Unknown" },
      after: { "Workflow Health": "Degraded", "Failed Steps": "2" },
      unchanged: { "Passing Steps": "3", "Trigger Config": "Valid" },
      whyItChanged: "Two downstream integration endpoints returned authentication failures during the diagnostic sweep. The workflow can partially execute but cannot complete the full sequence.",
      nextActions: ["View failing steps", "Reconnect integrations", "Re-run after fixing"],
      analysts,
    };
  }

  if (/reconnect|integration/i.test(t)) {
    return {
      resultType: "integration_state_changed",
      changeState: "changed",
      bullets: [
        "Integration reconnected successfully",
        "Authentication handshake completed",
        "Pending workflow notifications queued for delivery",
      ],
      before: { "Integration Status": "Disconnected", "Pending Notifications": "8" },
      after: { "Integration Status": "Connected", "Pending Notifications": "Queued" },
      whyItChanged: "The integration token was refreshed and the endpoint responded with a valid handshake. Queued notifications will be delivered on the next workflow run.",
      nextActions: ["Verify delivery", "Re-run workflow", "Check notification history"],
      analysts,
    };
  }

  /* Generic fallback */
  return {
    resultType: "findings_updated",
    changeState: "changed",
    bullets: [
      `${t} completed successfully`,
      "All downstream dependencies updated",
      "Results are now available",
    ],
    whyItChanged: "The action ran to completion and applied all requested changes to the current state.",
    nextActions: ["View updated results", "Create case from findings", "Re-run from another lens"],
    analysts,
  };
}

/** Derive a structured failure description from a failed ActionCardData */
export function deriveActionFailure(data: ActionCardData): ActionFailureInfo {
  const t = data.title;

  if (/reconnect|integration/i.test(t) || data.scope === "workflow") {
    return {
      reason: "The integration could not be reconnected due to an authentication error.",
      impact: "Workflow notifications remain blocked. Affected steps cannot deliver results.",
      nextActions: ["Retry connection", "Check credentials in Settings", "Contact your Slack admin"],
    };
  }
  if (/recalculate risk/i.test(t)) {
    return {
      reason: "Risk recalculation encountered incomplete data from one or more analysts.",
      impact: "Risk scores remain from the previous cycle. Downstream case priorities are unchanged.",
      nextActions: ["Retry with current data", "Review data source health", "Re-run after fixing sources"],
    };
  }
  if (/re-?run analysis|re-?run investigation/i.test(t)) {
    return {
      reason: "The analysis engine could not complete the cycle due to a data source timeout.",
      impact: "Findings may be outdated. Previous results remain visible.",
      nextActions: ["Retry analysis", "Check integration connectivity", "Contact support"],
    };
  }
  if (/block|disable|rotate|quarantine|isolate/i.test(t)) {
    return {
      reason: "The action could not be applied to one or more targets due to a permission error.",
      impact: "System access remains unchanged. No configuration was modified.",
      nextActions: ["Review required permissions", "Request elevated access", "Try a narrower scope"],
    };
  }
  return {
    reason: "The action could not be completed due to an unexpected error.",
    impact: "No changes were applied. System state is unchanged.",
    nextActions: ["Retry the action", "Check system status", "Contact support"],
  };
}
