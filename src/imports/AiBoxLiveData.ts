/**
 * AiBoxLiveData — Bridges real application state into AiBox response modules.
 *
 * Imports from the platform's existing data sources (KPI metrics,
 * InvestigationContext scenarios, MODULE_DATA interventions, agent tasks)
 * and produces AiRenderableResponse objects that reflect live system state.
 */

import type { AiRenderableResponse, SourceModule } from "./AiBoxRenderer";
import type { InvestigationScenario } from "../app/features/watch-center/InvestigationContext";
import {
  INVESTIGATION_SCENARIOS,
  AGENT_NAMES,
  getTimelineSteps,
} from "../app/features/watch-center/InvestigationContext";
import { MODULE_DATA, type InterventionData } from "../app/shared/data/intervention-data-types";
import { AGENT_TASKS as AGENT_TASK_GROUPS } from "../app/shared/data/agentTasks";
import { AGENT_TASKS as AGENT_DETAIL_DATA } from "../app/shared/data/agent-tasks-data";
import type { AgentId } from "../app/shared/types/agent-types";
import {
  buildInvestigationNarrative,
  buildAgentNarrative,
  buildNarrativeTimeline,
  buildNarrativeSynthesis,
  buildNarrativeAnalystDetail,
  buildNarrativeDecision,
  buildNarrativeInsight,
} from "../app/features/watch-center/AgentNarratives";

/* ═══════════════════════════════════════════════════════════
   KPI / System Metrics — sourced from KpiWidget METRICS
   ═══════════════════════════════════════════════════════════ */

const LIVE_KPI = {
  alertsProcessed: 14728,
  assetsDiscovered: 3842,
  vulnsAnalyzed: 1259,
  attackPathsIdentified: 47,
  casesGenerated: 186,
  analystHoursSaved: 312,
};

export function buildLiveSystemMetrics(): AiRenderableResponse {
  return {
    type: "metrics",
    title: "Platform operational status",
    metrics: [
      { label: "Alerts processed today", value: LIVE_KPI.alertsProcessed.toLocaleString(), delta: "+12%", trend: "up" },
      { label: "Assets discovered", value: LIVE_KPI.assetsDiscovered.toLocaleString(), delta: "+4%", trend: "up" },
      { label: "Vulnerabilities analyzed", value: LIVE_KPI.vulnsAnalyzed.toLocaleString(), delta: "-8.2%", trend: "down" },
      { label: "Attack paths identified", value: String(LIVE_KPI.attackPathsIdentified) },
      { label: "Cases generated", value: String(LIVE_KPI.casesGenerated), delta: "+15%", trend: "up" },
      { label: "Analyst hours saved", value: `${LIVE_KPI.analystHoursSaved}h` },
    ],
    progressLabel: "Automation rate",
    progressValue: 94,
  };
}

export function buildLiveRiskTrend(): AiRenderableResponse {
  return {
    type: "trend_chart",
    title: "Composite risk score — last 7 days",
    module: "Risk Analysis",
    mode: "area",
    data: [
      { label: "Mon", value: 42, baseline: 35 },
      { label: "Tue", value: 39, baseline: 35 },
      { label: "Wed", value: 48, baseline: 36 },
      { label: "Thu", value: 54, baseline: 37 },
      { label: "Fri", value: 61, baseline: 38 },
      { label: "Sat", value: 58, baseline: 38 },
      { label: "Sun", value: 66, baseline: 39 },
    ],
  };
}

export function buildLiveRiskMetrics(): AiRenderableResponse {
  const apData = MODULE_DATA["Attack Paths"];
  const vulnData = MODULE_DATA["Vulnerabilities"];
  const openPaths = apData.initialInterventions.length + apData.evaluatingItems.length;
  const critFindings = vulnData.initialInterventions.filter(i => i.severity === "Critical").length;
  return {
    type: "metrics",
    title: "Risk posture breakdown",
    metrics: [
      { label: "Overall risk score", value: "66", delta: "+8", trend: "up" },
      { label: "Critical findings", value: String(critFindings + apData.initialInterventions.filter(i => i.severity === "Critical").length), delta: "+1", trend: "up" },
      { label: "Open attack paths", value: String(openPaths), delta: "+1", trend: "up" },
      { label: "Mean time to respond", value: "18 min", delta: "-4 min", trend: "down" },
    ],
  };
}

/* ═══════════════════════════════════════════════════════════
   Investigation Timeline — from InvestigationContext
   ═══════════════════════════════════════════════════════════ */

const TONE_MAP: Record<string, "active" | "warning" | "danger" | "success" | "neutral"> = {
  alpha: "active",
  hotel: "warning",
  foxtrot: "danger",
  echo: "danger",
  delta: "warning",
  bravo: "warning",
  charlie: "active",
  golf: "active",
};

export function buildLiveTimeline(scenario?: InvestigationScenario): AiRenderableResponse {
  const sc = scenario || INVESTIGATION_SCENARIOS[0];
  /* Use narrative-enriched timeline that includes detail (conclusion) for each step */
  return buildNarrativeTimeline(sc);
}

export function buildLiveTimelineInsight(scenario?: InvestigationScenario): AiRenderableResponse {
  const sc = scenario || INVESTIGATION_SCENARIOS[0];
  /* Use narrative synthesis that describes the collaborative multi-analyst story */
  return buildNarrativeSynthesis(sc);
}

/* ═══════════════════════════════════════════════════════════
   Attack Paths — from MODULE_DATA["Attack Paths"]
   ═══════════════════════════════════════════════════════════ */

export function buildLiveAttackPath(): AiRenderableResponse {
  const apData = MODULE_DATA["Attack Paths"];
  const topIntervention = apData.initialInterventions[0];
  return {
    type: "attack_path",
    title: "Attack path — crown-jewel reachability",
    stats: {
      vulnerabilities: { critical: 12, high: 28, medium: 47, low: 93 },
      misconfiguration: { critical: 8, high: 19, medium: 34, low: 56 },
    },
    chartData: [
      { week: "W1", vuln: 180, misconfig: 117 },
      { week: "W2", vuln: 175, misconfig: 115 },
      { week: "W3", vuln: 182, misconfig: 119 },
      { week: "W4", vuln: 180, misconfig: 117 },
    ],
  };
}

export function buildLiveAttackPathInsight(): AiRenderableResponse {
  const apData = MODULE_DATA["Attack Paths"];
  const topIntervention = apData.initialInterventions[0];
  return {
    type: "insight",
    module: "Exposure / Threat Modelling",
    severity: "critical",
    title: topIntervention?.title || "Crown-jewel reachability confirmed",
    description: topIntervention
      ? `${topIntervention.description} ${topIntervention.businessImpact}`
      : "Exposure Analyst verified a lateral movement path from a public ingress to a privileged production asset.",
    supportingStats: [
      { label: "Confidence", value: topIntervention ? `${topIntervention.confidence}%` : "94%" },
      { label: "Evaluating", value: String(apData.evaluatingItems.length) },
    ],
    actions: ["View attack path", "Contain workload", "Create case", "Investigate"],
  };
}

/* ═══════════════════════════════════════════════════════════
   Cases — from MODULE_DATA["Cases"]
   ═══════════════════════════════════════════════════════════ */

export function buildLiveCaseSummary(): AiRenderableResponse {
  const caseData = MODULE_DATA["Cases"];
  const topCase = caseData.initialInterventions[0];
  return {
    type: "case_summary",
    caseId: topCase?.id?.toUpperCase() || "CS-001",
    title: topCase?.title || "Active investigation case",
    severity: topCase?.severity === "Critical" ? "critical" : "high",
    owner: "SOC Triage",
    status: topCase?.status === "awaiting" ? "Awaiting authorization" : topCase?.status || "Active",
    evidence: [
      ...caseData.evaluatingItems.slice(0, 2),
      ...(topCase ? [topCase.businessImpact] : []),
    ],
    nextStep: topCase?.pipelineSteps[topCase.activeStep] || "Awaiting authorization",
  };
}

export function buildLiveCaseDecision(): AiRenderableResponse {
  const caseData = MODULE_DATA["Cases"];
  const topCase = caseData.initialInterventions[0];
  return {
    type: "decision",
    module: "Security Governance Workflows",
    severity: topCase?.severity === "Critical" ? "critical" : "high",
    title: topCase?.title || "Authorize containment action",
    whyItMatters: topCase?.businessImpact || "Prevent lateral spread to production clusters.",
    impact: `Confidence: ${topCase?.confidence || 94}%`,
    primaryAction: "Authorize",
    secondaryAction: "Defer",
    tertiaryAction: "View details",
  };
}

/* ═══════════════════════════════════════════════════════════
   Analyst Detail — from agentTasks + agent-tasks-data
   ═══════════════════════════════════════════════════════════ */

const AGENT_MODULE_MAP: Record<string, SourceModule> = {
  alpha: "Asset Insight",
  bravo: "Misconfiguration Management",
  charlie: "Application Security Management",
  delta: "Policy & Governance Engine",
  echo: "Risk Analysis",
  foxtrot: "Exposure / Threat Modelling",
  golf: "IAM",
  hotel: "Vulnerability Management",
};

export function buildLiveAnalystDetail(agentId?: AgentId): AiRenderableResponse {
  const id = agentId || "foxtrot";

  /* Try narrative-enriched version first — provides investigation-grounded content */
  const narrativeDetail = buildNarrativeAnalystDetail(id);
  if (narrativeDetail && narrativeDetail.type === "analyst_detail") {
    const detail = narrativeDetail as Extract<AiRenderableResponse, { type: "analyst_detail" }>;
    /* Only use narrative if it has real content (not the fallback "No findings" placeholder) */
    if (!detail.discoveries.includes("No findings in the current investigation.")) {
      return narrativeDetail;
    }
  }

  /* Fallback to the original task-data approach for analysts not in the active investigation */
  const name = AGENT_NAMES[id];
  const module = AGENT_MODULE_MAP[id] || "Risk Analysis";
  const taskGroup = AGENT_TASK_GROUPS.find(g => g.agentId === id);
  const detailData = AGENT_DETAIL_DATA[id];

  const completedTasks = taskGroup?.tasks.map(t => t.description) || [];
  const descriptionLines = detailData?.description.split("\n\n") || [];

  // Extract discoveries (completed tasks), decisions, and actions from the description
  const discoveries = completedTasks.slice(0, 3);
  const decisions: string[] = [];
  const actions: string[] = [];

  // Parse the detailed description for decision/action content
  for (const line of descriptionLines) {
    if (line.startsWith("Completed:")) {
      // Already using completedTasks for discoveries
    } else if (line.startsWith("Queued:")) {
      actions.push(...line.replace("Queued: ", "").split(", ").slice(0, 2).map(s => s.trim().replace(/\.$/, "") + "."));
    } else if (line.startsWith("Coordinating")) {
      decisions.push(line.trim());
    } else if (line.includes("risk score") || line.includes("confidence") || line.includes("coverage")) {
      decisions.push(line.split(" — ")[0].trim() + ".");
    }
  }

  // Ensure we have content in all sections
  if (decisions.length === 0) {
    decisions.push(`${name} correlated findings with cross-domain signals.`);
    decisions.push("Elevated risk assessment based on active investigation context.");
  }
  if (actions.length === 0) {
    actions.push("Submitted findings to investigation flow.");
    actions.push("Requested governance review.");
  }

  return {
    type: "analyst_detail",
    analyst: name,
    module: module,
    status: "active",
    discoveries: discoveries.length > 0 ? discoveries : ["Analyzing active signals."],
    decisions,
    actions,
  };
}

/* ═══════════════════════════════════════════════════════════
   Vulnerability Management — from MODULE_DATA["Vulnerabilities"]
   ═══════════════════════════════════════════════════════════ */

export function buildLiveVulnInsight(): AiRenderableResponse {
  const vulnData = MODULE_DATA["Vulnerabilities"];
  const topVuln = vulnData.initialInterventions[0];
  const critCount = vulnData.initialInterventions.filter(i => i.severity === "Critical").length;
  const totalEval = vulnData.evaluatingItems.length;
  return {
    type: "insight",
    module: "Vulnerability Management",
    severity: critCount > 0 ? "critical" : "high",
    title: topVuln?.title || "Critical vulnerability posture",
    description: topVuln
      ? `${topVuln.description} ${topVuln.businessImpact} Currently evaluating ${totalEval} additional items including ${vulnData.evaluatingItems[0]}.`
      : `${totalEval} vulnerability evaluations in progress.`,
    supportingStats: [
      { label: "Total analyzed", value: LIVE_KPI.vulnsAnalyzed.toLocaleString() },
      { label: "Critical interventions", value: String(critCount) },
      { label: "Confidence", value: topVuln ? `${topVuln.confidence}%` : "N/A" },
    ],
    actions: ["Investigate", "Create case", "Show attack path"],
  };
}

export function buildLiveVulnTrend(): AiRenderableResponse {
  return {
    type: "trend_chart",
    title: "Critical vulnerability trend — last 5 days",
    module: "Vulnerability Management",
    mode: "line",
    data: [
      { label: "Mon", value: 16, baseline: 12 },
      { label: "Tue", value: 14, baseline: 12 },
      { label: "Wed", value: 18, baseline: 12 },
      { label: "Thu", value: 21, baseline: 13 },
      { label: "Fri", value: LIVE_KPI.vulnsAnalyzed > 1000 ? 17 : 12, baseline: 13 },
    ],
  };
}

export function buildLiveVulnMetrics(): AiRenderableResponse {
  const vulnData = MODULE_DATA["Vulnerabilities"];
  const critCount = vulnData.initialInterventions.filter(i => i.severity === "Critical").length;
  const warnCount = vulnData.initialInterventions.filter(i => i.severity === "Warning").length;
  return {
    type: "metrics",
    title: "Vulnerability management metrics",
    metrics: [
      { label: "Total analyzed", value: LIVE_KPI.vulnsAnalyzed.toLocaleString(), delta: "-8.2%", trend: "down" },
      { label: "Critical interventions", value: String(critCount), trend: "neutral" },
      { label: "Warning interventions", value: String(warnCount), trend: "neutral" },
      { label: "Evaluating", value: String(vulnData.evaluatingItems.length), trend: "neutral" },
    ],
    progressLabel: "Patch coverage",
    progressValue: 74,
  };
}

/* ═══════════════════════════════════════════════════════════
   Asset Insight
   ═══════════════════════════════════════════════════════════ */

export function buildLiveAssetInsight(): AiRenderableResponse {
  return {
    type: "insight",
    module: "Asset Insight",
    severity: "medium",
    title: `${LIVE_KPI.assetsDiscovered.toLocaleString()} assets discovered and classified`,
    description: `Asset Intelligence Analyst discovered and classified ${LIVE_KPI.assetsDiscovered.toLocaleString()} assets across the environment. ${AGENT_TASK_GROUPS.find(g => g.agentId === "alpha")?.tasks[0]?.description || "Ongoing discovery and reconciliation."}`,
    supportingStats: [
      { label: "Assets discovered", value: LIVE_KPI.assetsDiscovered.toLocaleString() },
      { label: "Attack paths linked", value: String(LIVE_KPI.attackPathsIdentified) },
    ],
    actions: ["Review assets", "Trace exposure", "Create case"],
  };
}

export function buildLiveAssetTrend(): AiRenderableResponse {
  const base = LIVE_KPI.assetsDiscovered;
  return {
    type: "trend_chart",
    title: "Asset discovery — last 7 days",
    module: "Asset Insight",
    mode: "area",
    data: [
      { label: "Mon", value: base - 638, baseline: base - 800 },
      { label: "Tue", value: base - 624, baseline: base - 800 },
      { label: "Wed", value: base - 595, baseline: base - 790 },
      { label: "Thu", value: base - 530, baseline: base - 780 },
      { label: "Fri", value: base - 453, baseline: base - 770 },
      { label: "Sat", value: base - 440, baseline: base - 770 },
      { label: "Sun", value: base, baseline: base - 760 },
    ],
  };
}

/* ═══════════════════════════════════════════════════════════
   Compliance & Governance — from MODULE_DATA["Compliance"]
   ═══════════════════════════════════════════════════════════ */

export function buildLiveComplianceInsight(): AiRenderableResponse {
  const compData = MODULE_DATA["Compliance"];
  const topIntervention = compData.initialInterventions[0];
  return {
    type: "insight",
    module: "Compliance",
    severity: topIntervention?.severity === "Critical" ? "high" : "medium",
    title: topIntervention?.title || "Compliance posture assessment",
    description: topIntervention
      ? `${topIntervention.description} ${topIntervention.businessImpact}`
      : "Compliance assessment in progress.",
    supportingStats: [
      { label: "Evaluating", value: String(compData.evaluatingItems.length) },
      { label: "Interventions", value: String(compData.initialInterventions.length) },
    ],
    actions: ["Review controls", "Open workflow", "View evidence"],
  };
}

export function buildLiveComplianceMetrics(): AiRenderableResponse {
  const compData = MODULE_DATA["Compliance"];
  return {
    type: "metrics",
    title: "Compliance coverage",
    metrics: [
      { label: "Frameworks assessed", value: String(compData.evaluatingItems.length), delta: "+1", trend: "up" },
      { label: "Controls passing", value: "142/158", delta: "-3", trend: "down" },
      { label: "Open interventions", value: String(compData.initialInterventions.length), trend: "neutral" },
      { label: "Evidence collected", value: "94%", delta: "+2%", trend: "up" },
    ],
    progressLabel: "Compliance coverage",
    progressValue: 90,
  };
}

export function buildLiveGovernanceDecision(): AiRenderableResponse {
  const compData = MODULE_DATA["Compliance"];
  const topIntervention = compData.initialInterventions[0];
  return {
    type: "decision",
    module: "Policy & Governance Engine",
    severity: topIntervention?.severity === "Critical" ? "critical" : "high",
    title: topIntervention?.title || "Governance action required",
    whyItMatters: topIntervention?.businessImpact || "Compliance deadline approaching.",
    impact: `Confidence: ${topIntervention?.confidence || 91}%`,
    primaryAction: "Authorize",
    secondaryAction: "Defer",
    tertiaryAction: "View details",
  };
}

/* ═══════════════════════════════════════════════════════════
   Misconfiguration — from MODULE_DATA["Misconfiguration"]
   ═══════════════════════════════════════════════════════════ */

export function buildLiveMisconfigInsight(): AiRenderableResponse {
  const mcData = MODULE_DATA["Misconfiguration"];
  const topIntervention = mcData.initialInterventions[0];
  return {
    type: "insight",
    module: "Misconfiguration Management",
    severity: topIntervention?.severity === "Critical" ? "high" : "medium",
    title: topIntervention?.title || "Configuration drift detected",
    description: topIntervention
      ? `${topIntervention.description} ${topIntervention.businessImpact}`
      : "Configuration analysis in progress.",
    supportingStats: [
      { label: "Evaluating", value: String(mcData.evaluatingItems.length) },
      { label: "Interventions", value: String(mcData.initialInterventions.length) },
    ],
    actions: ["Review drift", "Trigger remediation", "View affected assets"],
  };
}

export function buildLiveMisconfigDecision(): AiRenderableResponse {
  const mcData = MODULE_DATA["Misconfiguration"];
  const topIntervention = mcData.initialInterventions[0];
  return {
    type: "decision",
    module: "Misconfiguration Management",
    severity: topIntervention?.severity === "Critical" ? "critical" : "high",
    title: topIntervention?.title || "Authorize configuration remediation",
    whyItMatters: topIntervention?.businessImpact || "Configuration drift increases attack surface.",
    impact: `Confidence: ${topIntervention?.confidence || 98}%`,
    primaryAction: "Authorize rollback",
    secondaryAction: "Defer",
    tertiaryAction: "View details",
  };
}

/* ═══════════════════════════════════════════════════════════
   IAM — from agent golf data
   ═══════════════════════════════════════════════════════════ */

export function buildLiveIamInsight(): AiRenderableResponse {
  const golfTasks = AGENT_TASK_GROUPS.find(g => g.agentId === "golf");
  const taskDescriptions = golfTasks?.tasks.map(t => t.description) || [];
  return {
    type: "insight",
    module: "IAM",
    severity: "high",
    title: "Identity security posture assessment",
    description: `Identity Security Analyst completed ${taskDescriptions.length} actions. ${taskDescriptions[0] || "Reviewing privileged access."} ${taskDescriptions[1] || ""}`,
    supportingStats: [
      { label: "Actions completed", value: String(taskDescriptions.length) },
      { label: "Dormant accounts", value: "14" },
    ],
    actions: ["Review entitlements", "Restrict access", "Open case"],
  };
}

/* ═══════════════════════════════════════════════════════════
   AppSec — from MODULE_DATA["Application Security Management"]
   ═══════════════════════════════════════════════════════════ */

export function buildLiveAppSecAnalyst(): AiRenderableResponse {
  const appData = MODULE_DATA["Application Security Management"];
  const charlieTasks = AGENT_TASK_GROUPS.find(g => g.agentId === "charlie");
  return {
    type: "analyst_detail",
    analyst: "Application Security Analyst",
    module: "Application Security Management",
    status: "active",
    discoveries: charlieTasks?.tasks.map(t => t.description).slice(0, 3) || [
      "Detected injection flaw in auth-v2.",
      "Patched vulnerable dependency in ui-app-09.",
    ],
    decisions: [
      `Evaluating ${appData.evaluatingItems.length} items: ${appData.evaluatingItems[0]}.`,
      appData.initialInterventions[0]?.businessImpact || "Raised severity for internet-reachable package.",
    ],
    actions: appData.initialInterventions.map(i => i.title).slice(0, 3),
  };
}

export function buildLiveAppSecInsight(): AiRenderableResponse {
  const appData = MODULE_DATA["Application Security Management"];
  const topIntervention = appData.initialInterventions[0];
  return {
    type: "insight",
    module: "Application Security Management",
    severity: topIntervention?.severity === "Critical" ? "critical" : "high",
    title: topIntervention?.title || "Application security findings",
    description: topIntervention
      ? `${topIntervention.description} ${topIntervention.businessImpact}`
      : "Application security scan in progress.",
    supportingStats: [
      { label: "Evaluating", value: String(appData.evaluatingItems.length) },
      { label: "Confidence", value: topIntervention ? `${topIntervention.confidence}%` : "N/A" },
    ],
    actions: ["Rotate token", "View artifact", "Create case"],
  };
}

/* ═══════════════════════════════════════════════════════════
   Attention / Priority — cross-module aggregate
   ═══════════════════════════════════════════════════════════ */

export function buildLiveAttentionInsight(): AiRenderableResponse {
  const allInterventions: InterventionData[] = [];
  for (const mod of Object.values(MODULE_DATA)) {
    allInterventions.push(...mod.initialInterventions.filter(i => i.status === "awaiting"));
  }
  const critCount = allInterventions.filter(i => i.severity === "Critical").length;
  const topItem = allInterventions.find(i => i.severity === "Critical") || allInterventions[0];

  return {
    type: "insight",
    module: "Risk Analysis",
    severity: critCount > 0 ? "critical" : "high",
    title: `${critCount} critical interventions awaiting authorization`,
    description: topItem
      ? `Highest priority: ${topItem.title}. ${topItem.businessImpact} ${allInterventions.length} total interventions across all modules require attention.`
      : `${allInterventions.length} interventions awaiting review.`,
    supportingStats: [
      { label: "Critical", value: String(critCount) },
      { label: "Total awaiting", value: String(allInterventions.length) },
    ],
    actions: ["Investigate", "Create case", "View details"],
  };
}

export function buildLiveAttentionDecision(): AiRenderableResponse {
  const allInterventions: InterventionData[] = [];
  for (const mod of Object.values(MODULE_DATA)) {
    allInterventions.push(...mod.initialInterventions.filter(i => i.status === "awaiting" && i.severity === "Critical"));
  }
  const topItem = allInterventions[0];
  return {
    type: "decision",
    module: "Security Governance Workflows",
    severity: "critical",
    title: topItem?.title || "Authorize highest-priority intervention",
    whyItMatters: topItem?.businessImpact || "Critical intervention awaiting action.",
    impact: `Confidence: ${topItem?.confidence || 94}%. ${allInterventions.length} critical items in queue.`,
    primaryAction: "Authorize",
    secondaryAction: "Defer",
    tertiaryAction: "View details",
  };
}

/* ═══════════════════════════════════════════════════════════
   Approval Queue — real interventions awaiting authorization
   ═══════════════════════════════════════════════════════════ */

export function buildLiveApprovalDecision(): AiRenderableResponse {
  const allAwaiting: InterventionData[] = [];
  for (const mod of Object.values(MODULE_DATA)) {
    allAwaiting.push(...mod.initialInterventions.filter(i => i.status === "awaiting"));
  }
  const topItem = allAwaiting.sort((a, b) => b.confidence - a.confidence)[0];
  return {
    type: "decision",
    module: "Security Governance Workflows",
    severity: topItem?.severity === "Critical" ? "critical" : "high",
    title: topItem?.title || "Pending authorization",
    whyItMatters: topItem?.businessImpact || "Action requires authorization.",
    impact: `Confidence: ${topItem?.confidence || 90}%. ${allAwaiting.length} items in approval queue.`,
    primaryAction: "Authorize",
    secondaryAction: "Defer",
    tertiaryAction: "View details",
  };
}

export function buildLiveApprovalCase(): AiRenderableResponse {
  const allAwaiting: InterventionData[] = [];
  for (const mod of Object.values(MODULE_DATA)) {
    allAwaiting.push(...mod.initialInterventions.filter(i => i.status === "awaiting"));
  }
  return {
    type: "case_summary",
    caseId: allAwaiting[0]?.id?.toUpperCase() || "CS-001",
    title: allAwaiting[0]?.title || "Pending approval case",
    severity: allAwaiting[0]?.severity === "Critical" ? "critical" : "high",
    owner: "SOC Triage",
    status: `${allAwaiting.length} items awaiting authorization`,
    evidence: allAwaiting.slice(0, 3).map(i => `${i.title} — ${i.businessImpact}`),
    nextStep: allAwaiting[0]?.pipelineSteps[allAwaiting[0].activeStep] || "Awaiting authorization",
  };
}

/* ═══════════════════════════════════════════════════════════
   Investigation Narrative — multi-analyst collaborative story
   ═══════════════════════════════════════════════════════════ */

export function buildLiveInvestigationNarrative(): AiRenderableResponse {
  /* Return the narrative-enriched timeline as the primary module.
     When called via buildComposedResponse, this is paired with
     buildNarrativeSynthesis + buildNarrativeDecision. */
  return buildNarrativeTimeline();
}

/* ═══════════════════════════════════════════════════════════
   Proactive Recommendations — Priority Ranking System
   ═══════════════════════════════════════════════════════════

   Every proactive scenario carries `PrioritySignals` that
   feed a deterministic `computePriorityScore()` function.

   Score range: 0 – 100
     • Severity            0 – 30
     • Business impact      0 – 25
     • Required user action 0 – 25
     • Correlation conf.    0 – 10
     • Recency              0 – 10

   `getRankedProactiveScenarios()` returns scenarios sorted
   highest-score-first so AiBox always surfaces the most
   important insight before lower-priority modules.
   ═══════════════════════════════════════════════════════════ */

/* ── Scoring factor types ── */

export type ImpactClass =
  | "crown_jewel"       // production / crown-jewel asset
  | "sensitive_data"    // PII, secrets, certificates
  | "internal_system"   // internal infrastructure
  | "informational";    // general posture / metrics

export type ActionUrgency =
  | "immediate"         // authorization, containment, block
  | "remediation"       // patch, remediate, rollback
  | "investigation"     // triage, investigate, escalate
  | "informational";    // review, monitor

export interface PrioritySignals {
  /** Highest severity across all modules in the scenario */
  severity: "critical" | "high" | "medium" | "low";
  /** What class of asset / data is affected */
  businessImpact: ImpactClass;
  /** What the user is expected to do */
  actionUrgency: ActionUrgency;
  /** 0 – 100 confidence score (avg across correlated analysts) */
  correlationConfidence: number;
  /** Number of distinct analysts / signals that contributed */
  correlatedSignals: number;
  /** Epoch ms — when the event was generated */
  detectedAt: number;
}

export interface ProactiveScenario {
  id: string;
  priority: "critical" | "high";
  source: string;
  label: string;
  modules: AiRenderableResponse[];
  /** Scoring signals used by the priority ranking engine */
  signals: PrioritySignals;
  /** Computed priority score (0 – 100) — populated by `computePriorityScore` */
  score: number;
}

/* ── Score computation ── */

const SEV_SCORES: Record<string, number> = { critical: 30, high: 20, medium: 10, low: 5 };
const IMPACT_SCORES: Record<ImpactClass, number> = { crown_jewel: 25, sensitive_data: 20, internal_system: 10, informational: 5 };
const ACTION_SCORES: Record<ActionUrgency, number> = { immediate: 25, remediation: 20, investigation: 15, informational: 5 };

export function computePriorityScore(signals: PrioritySignals): number {
  /* 1. Severity  (0 – 30) */
  const sevScore = SEV_SCORES[signals.severity] ?? 10;

  /* 2. Business impact  (0 – 25) */
  const impactScore = IMPACT_SCORES[signals.businessImpact];

  /* 3. Required user action  (0 – 25) */
  const actionScore = ACTION_SCORES[signals.actionUrgency];

  /* 4. Correlation confidence  (0 – 10)
        Blend of raw confidence (0-100 → 0-6) and multi-signal bonus (0-4) */
  const confBase = Math.min(6, Math.round((signals.correlationConfidence / 100) * 6));
  const multiSignalBonus = Math.min(4, signals.correlatedSignals >= 4 ? 4 : signals.correlatedSignals >= 2 ? 3 : 1);
  const corrScore = confBase + multiSignalBonus;

  /* 5. Recency  (0 – 10)
        Full 10 if < 60 s old, decays linearly to 0 over 10 minutes */
  const ageMs = Date.now() - signals.detectedAt;
  const ageSec = ageMs / 1000;
  const recencyScore = ageSec < 60 ? 10 : Math.max(0, Math.round(10 - ((ageSec - 60) / 540) * 10));

  return Math.min(100, sevScore + impactScore + actionScore + corrScore + recencyScore);
}

/* ── Ranked scenario retrieval ── */

export function getRankedProactiveScenarios(): ProactiveScenario[] {
  const scenarios = getProactiveScenarios();
  /* Recompute scores (recency changes over time) */
  for (const sc of scenarios) {
    sc.score = computePriorityScore(sc.signals);
  }
  return scenarios.sort((a, b) => b.score - a.score);
}

/* ── Scenario builder (enriched with signals) ── */

export function getProactiveScenarios(): ProactiveScenario[] {
  const apData = MODULE_DATA["Attack Paths"];
  const vulnData = MODULE_DATA["Vulnerabilities"];
  const mcData = MODULE_DATA["Misconfiguration"];

  const now = Date.now();

  return [
    /* 1. Critical attack path discovered → AttackPathGraph + InsightCard */
    {
      id: "proactive-attack-path",
      priority: "critical",
      source: "Exposure / Threat Modelling",
      label: "Crown-jewel reachability path confirmed",
      modules: [
        buildLiveAttackPath(),
        {
          type: "insight",
          module: "Exposure / Threat Modelling",
          severity: "critical",
          title: `${apData.initialInterventions[0]?.title || "Lateral movement path to crown jewel"}`,
          description: `Exposure Analyst confirmed a multi-hop lateral movement path from an internet-facing asset to finance-db-01. ${apData.initialInterventions[0]?.businessImpact || "Domain-wide administrative compromise risk."}`,
          supportingStats: [
            { label: "Confidence", value: `${apData.initialInterventions[0]?.confidence || 94}%` },
            { label: "Attack paths", value: String(LIVE_KPI.attackPathsIdentified) },
          ],
          actions: ["Investigate", "Create case", "View details"],
        },
      ],
      signals: {
        severity: "critical",
        businessImpact: "crown_jewel",
        actionUrgency: "immediate",
        correlationConfidence: apData.initialInterventions[0]?.confidence || 94,
        correlatedSignals: apData.initialInterventions.length,
        detectedAt: now,
      },
      score: 0,
    },

    /* 2. Governance approval waiting → DecisionCard */
    {
      id: "proactive-governance-approval",
      priority: "high",
      source: "Security Governance Workflows",
      label: "Authorization required — containment pending",
      modules: [
        (() => {
          const allAwaiting: InterventionData[] = [];
          for (const mod of Object.values(MODULE_DATA)) {
            allAwaiting.push(...mod.initialInterventions.filter(i => i.status === "awaiting" && i.severity === "Critical"));
          }
          const top = allAwaiting.sort((a, b) => b.confidence - a.confidence)[0];
          return {
            type: "decision" as const,
            module: "Security Governance Workflows" as const,
            severity: "critical" as const,
            title: top?.title || "Authorize containment workflow",
            whyItMatters: top?.businessImpact || "Critical intervention requires immediate authorization.",
            impact: `Confidence: ${top?.confidence || 94}%. ${allAwaiting.length} critical items in queue.`,
            primaryAction: "Authorize",
            secondaryAction: "Defer",
            tertiaryAction: "View details",
          } as AiRenderableResponse;
        })(),
      ],
      signals: {
        severity: "critical",
        businessImpact: "internal_system",
        actionUrgency: "immediate",
        correlationConfidence: 94,
        correlatedSignals: 1,
        detectedAt: now,
      },
      score: 0,
    },

    /* 3. Investigation milestone → InvestigationTimeline + InsightCard */
    {
      id: "proactive-investigation-milestone",
      priority: "high",
      source: "Case Management",
      label: "Investigation reached governance stage",
      modules: [
        buildLiveTimeline(),
        {
          type: "insight",
          module: "Case Management",
          severity: "high",
          title: `${INVESTIGATION_SCENARIOS[0].name} — governance authorization reached`,
          description: `All ${INVESTIGATION_SCENARIOS[0].agents.length} analysts in the ${INVESTIGATION_SCENARIOS[0].name.toLowerCase()} investigation have completed their assessment. The flow has reached the governance authorization stage and requires your review.`,
          supportingStats: [
            { label: "Agents completed", value: String(INVESTIGATION_SCENARIOS[0].agents.length) },
            { label: "Status", value: "Awaiting approval" },
          ],
          actions: ["Authorize", "View details", "Escalate"],
        },
      ],
      signals: {
        severity: "high",
        businessImpact: "internal_system",
        actionUrgency: "immediate",
        correlationConfidence: 90,
        correlatedSignals: INVESTIGATION_SCENARIOS[0].agents.length,
        detectedAt: now,
      },
      score: 0,
    },

    /* 4. Risk metrics spike → MetricsSummary + TrendChart */
    {
      id: "proactive-risk-spike",
      priority: "high",
      source: "Risk Analysis",
      label: "Composite risk score elevated — review recommended",
      modules: [
        {
          type: "metrics",
          title: "Risk posture — elevated signals",
          metrics: [
            { label: "Composite risk score", value: "66", delta: "+8", trend: "up" as const },
            { label: "New critical CVEs", value: String(vulnData.initialInterventions.filter(i => i.severity === "Critical").length), delta: "+1", trend: "up" as const },
            { label: "Open attack paths", value: String(apData.initialInterventions.length + apData.evaluatingItems.length), delta: "+1", trend: "up" as const },
            { label: "Pending approvals", value: String((() => { let c = 0; for (const m of Object.values(MODULE_DATA)) c += m.initialInterventions.filter(i => i.status === "awaiting").length; return c; })()), trend: "neutral" as const },
          ],
          progressLabel: "Automation coverage",
          progressValue: 94,
        } as AiRenderableResponse,
        buildLiveRiskTrend(),
      ],
      signals: {
        severity: "high",
        businessImpact: "informational",
        actionUrgency: "investigation",
        correlationConfidence: 85,
        correlatedSignals: 3,
        detectedAt: now,
      },
      score: 0,
    },

    /* 5. Critical vulnerability with active exploit path */
    {
      id: "proactive-vuln-critical",
      priority: "critical",
      source: "Vulnerability Management",
      label: `${vulnData.initialInterventions[0]?.title || "Critical CVE requires patching"}`,
      modules: [
        {
          type: "insight",
          module: "Vulnerability Management",
          severity: "critical",
          title: vulnData.initialInterventions[0]?.title || "Critical vulnerability in production",
          description: `${vulnData.initialInterventions[0]?.description || "Intervention required."} ${vulnData.initialInterventions[0]?.businessImpact || "Production system at risk."} This vulnerability is linked to an active attack path.`,
          supportingStats: [
            { label: "Confidence", value: `${vulnData.initialInterventions[0]?.confidence || 96}%` },
            { label: "Vulns analyzed", value: LIVE_KPI.vulnsAnalyzed.toLocaleString() },
          ],
          actions: ["Investigate", "Create case", "Show attack path"],
        },
        buildLiveVulnTrend(),
      ],
      signals: {
        severity: "critical",
        businessImpact: "crown_jewel",
        actionUrgency: "remediation",
        correlationConfidence: vulnData.initialInterventions[0]?.confidence || 96,
        correlatedSignals: 1,
        detectedAt: now,
      },
      score: 0,
    },

    /* 6. Misconfiguration drift detected */
    {
      id: "proactive-misconfig-drift",
      priority: "high",
      source: "Misconfiguration Management",
      label: mcData.initialInterventions[0]?.title || "Configuration drift detected",
      modules: [
        buildLiveMisconfigInsight(),
        buildLiveMisconfigDecision(),
      ],
      signals: {
        severity: "high",
        businessImpact: "internal_system",
        actionUrgency: "remediation",
        correlationConfidence: mcData.initialInterventions[0]?.confidence || 98,
        correlatedSignals: 1,
        detectedAt: now,
      },
      score: 0,
    },
  ];
}

/* ═══════════════════════════════════════════════════════════
   Re-export Agent Narrative builders for use by AiBoxRenderer
   ═══════════════════════════════════════════════════════════ */

export {
  buildNarrativeTimeline,
  buildNarrativeSynthesis,
  buildNarrativeAnalystDetail,
  buildNarrativeDecision,
  buildNarrativeInsight,
  buildInvestigationNarrative,
  buildAgentNarrative,
} from "../app/features/watch-center/AgentNarratives";