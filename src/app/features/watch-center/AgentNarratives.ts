/**
 * AgentNarratives — Gives each analyst a distinct voice during investigations.
 *
 * Each analyst contributes a NarrativeStep with:
 *   - discovery: what the analyst found
 *   - conclusion: what it means (risk / impact)
 *   - recommendation: what action is needed
 *
 * Narratives are grounded in real MODULE_DATA, INVESTIGATION_SCENARIOS,
 * and AGENT_TASKS data — never generic text.
 */

import type { AgentId } from "../../shared/types/agent-types";
import type { InvestigationScenario } from "./InvestigationContext";
import {
  INVESTIGATION_SCENARIOS,
  AGENT_NAMES,
} from "./InvestigationContext";
import { MODULE_DATA, type InterventionData } from "../../shared/data/intervention-data-types";
import { AGENT_TASKS as AGENT_TASK_GROUPS } from "../../shared/data/agentTasks";
import type { AiRenderableResponse, SourceModule } from "../../../imports/AiBoxRenderer";

/* ═══════════════════════════════════════════════════════════
   Types
   ═══════════════════════════════════════════════════════════ */

export interface NarrativeStep {
  /** What the analyst found — concrete, data-grounded */
  discovery: string;
  /** What it means — risk implication or correlation */
  conclusion: string;
  /** What should be done — action or recommendation */
  recommendation: string;
}

export interface AgentNarrative {
  agentId: AgentId;
  analystName: string;
  module: SourceModule;
  /** Short action summary for timeline display */
  action: string;
  /** Full narrative step with discovery → conclusion → recommendation */
  narrative: NarrativeStep;
  /** Confidence percentage from the analyst's domain data */
  confidence: number;
  /** Severity tone for rendering */
  tone: "active" | "success" | "warning" | "danger" | "neutral";
}

export interface InvestigationNarrative {
  scenarioName: string;
  scenarioColor: string;
  /** Ordered list of analyst contributions forming the collaborative story */
  steps: AgentNarrative[];
  /** Final synthesized summary: why this matters and what's needed */
  synthesis: string;
  /** The decision or action the user needs to take */
  requiredAction: string;
}

/* ═══════════════════════════════════════════════════════════
   Agent ↔ Module mapping
   ═══════════════════════════════════════════════════════════ */

const AGENT_MODULE: Record<AgentId, SourceModule> = {
  alpha:   "Asset Insight",
  hotel:   "Vulnerability Management",
  bravo:   "Misconfiguration Management",
  charlie: "Application Security Management",
  foxtrot: "Exposure / Threat Modelling",
  delta:   "Policy & Governance Engine",
  echo:    "Risk Analysis",
  golf:    "IAM",
};

const AGENT_TONE: Record<AgentId, "active" | "success" | "warning" | "danger" | "neutral"> = {
  alpha:   "active",
  hotel:   "warning",
  bravo:   "warning",
  charlie: "warning",
  foxtrot: "danger",
  delta:   "active",
  echo:    "danger",
  golf:    "warning",
};

/* ═══════════════════════════════════════════════════════════
   Per-agent narrative builders — grounded in MODULE_DATA
   ═══════════════════════════════════════════════════════════ */

function getTopIntervention(moduleKey: string): InterventionData | undefined {
  return MODULE_DATA[moduleKey]?.initialInterventions[0];
}

function getAgentTasks(agentId: AgentId): string[] {
  const group = AGENT_TASK_GROUPS.find(g => g.agentId === agentId);
  return group?.tasks.map(t => t.description) ?? [];
}

/* --- Exposed Asset Response --- */

function narrativeAlpha_ExposedAsset(): AgentNarrative {
  const tasks = getAgentTasks("alpha");
  return {
    agentId: "alpha",
    analystName: AGENT_NAMES.alpha,
    module: "Asset Insight",
    action: "Discovered exposed workload and classified asset criticality",
    narrative: {
      discovery: tasks[0] || "Discovered 12 unmanaged endpoints in finance-subnet-02.",
      conclusion: "Unmanaged endpoints in a finance subnet represent high-value targets. CMDB records show these assets were never enrolled in vulnerability scanning or configuration baselines.",
      recommendation: "Enroll discovered endpoints in the vulnerability scanning pipeline and assign asset ownership immediately.",
    },
    confidence: 93,
    tone: "active",
  };
}

function narrativeHotel_ExposedAsset(): AgentNarrative {
  const vuln = getTopIntervention("Vulnerabilities");
  return {
    agentId: "hotel",
    analystName: AGENT_NAMES.hotel,
    module: "Vulnerability Management",
    action: "Validated critical CVE exposure on the discovered workload",
    narrative: {
      discovery: vuln ? `${vuln.title} — ${vuln.description}` : "Critical CVE detected on the exposed endpoint.",
      conclusion: vuln?.businessImpact || "Financial data exposure risk confirmed on the newly discovered asset.",
      recommendation: vuln ? `Deploy patch immediately. Confidence: ${vuln.confidence}%.` : "Prioritize emergency patching for the affected endpoint.",
    },
    confidence: vuln?.confidence ?? 96,
    tone: "warning",
  };
}

function narrativeFoxtrot_ExposedAsset(): AgentNarrative {
  const ap = getTopIntervention("Attack Paths");
  const apEval = MODULE_DATA["Attack Paths"]?.evaluatingItems[0];
  return {
    agentId: "foxtrot",
    analystName: AGENT_NAMES.foxtrot,
    module: "Exposure / Threat Modelling",
    action: "Identified lateral movement path from exposed asset to crown jewel",
    narrative: {
      discovery: `Confirmed multi-hop lateral movement path: ${apEval || "internet-facing jump server"} → compromised app server → privileged CI runner → finance-db-01.`,
      conclusion: ap?.businessImpact || "Domain-wide administrative compromise is reachable from the exposed workload.",
      recommendation: ap ? `${ap.title}. Confidence: ${ap.confidence}%.` : "Block lateral movement by isolating the pivot point.",
    },
    confidence: ap?.confidence ?? 94,
    tone: "danger",
  };
}

function narrativeEcho_ExposedAsset(): AgentNarrative {
  const critInterventions = Object.values(MODULE_DATA)
    .flatMap(m => m.initialInterventions)
    .filter(i => i.severity === "Critical");
  return {
    agentId: "echo",
    analystName: AGENT_NAMES.echo,
    module: "Risk Analysis",
    action: "Correlated cross-domain signals and elevated composite risk score",
    narrative: {
      discovery: `Correlated findings from ${critInterventions.length} critical interventions across Asset, Vulnerability, and Exposure domains.`,
      conclusion: "Composite risk score elevated to 92 due to crown-jewel reachability confirmed by multi-analyst correlation. Business impact: financial data store is directly accessible from the internet.",
      recommendation: "Immediate containment required. Risk score exceeds critical threshold — authorize isolation and patching in parallel.",
    },
    confidence: 88,
    tone: "danger",
  };
}

function narrativeDelta_ExposedAsset(): AgentNarrative {
  const comp = getTopIntervention("Compliance");
  return {
    agentId: "delta",
    analystName: AGENT_NAMES.delta,
    module: "Policy & Governance Engine",
    action: "Triggered remediation workflow and requested authorization",
    narrative: {
      discovery: "Governance workflow prepared: network isolation for the compromised workload, emergency patch deployment, and credential rotation.",
      conclusion: comp ? `Regulatory impact: ${comp.businessImpact}` : "Non-compliance window opens if remediation is not authorized within the SLA.",
      recommendation: "Authorize the containment workflow. Automated isolation will execute within 5 minutes of approval.",
    },
    confidence: 92,
    tone: "active",
  };
}

/* --- Identity Breach Investigation --- */

function narrativeGolf_IdentityBreach(): AgentNarrative {
  const tasks = getAgentTasks("golf");
  return {
    agentId: "golf",
    analystName: AGENT_NAMES.golf,
    module: "IAM",
    action: "Detected anomalous identity behavior and privilege escalation",
    narrative: {
      discovery: tasks[0] || "Service principal svc-ci-deploy accessed production data stores outside normal operating hours.",
      conclusion: "The service account has standing write access to production — credential last rotated 94 days ago, exceeding the 90-day rotation policy.",
      recommendation: "Restrict svc-ci-deploy to read-only access and trigger immediate credential rotation.",
    },
    confidence: 90,
    tone: "warning",
  };
}

function narrativeCharlie_IdentityBreach(): AgentNarrative {
  const appsec = getTopIntervention("Application Security Management");
  return {
    agentId: "charlie",
    analystName: AGENT_NAMES.charlie,
    module: "Application Security Management",
    action: "Identified compromised application session linked to the identity",
    narrative: {
      discovery: appsec ? `${appsec.title} — leaked admin token embedded in build artifact.` : "Leaked service token found in CI/CD pipeline build artifact.",
      conclusion: appsec?.businessImpact || "Admin token grants access to the compromised CI runner in the active attack path.",
      recommendation: "Rotate the leaked token immediately and scan all build artifacts for additional credential exposure.",
    },
    confidence: appsec?.confidence ?? 94,
    tone: "warning",
  };
}

function narrativeFoxtrot_IdentityBreach(): AgentNarrative {
  return {
    agentId: "foxtrot",
    analystName: AGENT_NAMES.foxtrot,
    module: "Exposure / Threat Modelling",
    action: "Mapped lateral movement vectors from the compromised identity",
    narrative: {
      discovery: "The compromised service principal's credentials enable a 2-hop lateral movement path from the CI runner to the production data warehouse.",
      conclusion: "Crown-jewel reachability is confirmed through the identity exposure. The attack path bypasses network segmentation via legitimate service credentials.",
      recommendation: "Revoke standing access and enforce just-in-time privilege escalation for service principals in production.",
    },
    confidence: 86,
    tone: "danger",
  };
}

function narrativeEcho_IdentityBreach(): AgentNarrative {
  return {
    agentId: "echo",
    analystName: AGENT_NAMES.echo,
    module: "Risk Analysis",
    action: "Assessed breach impact severity with cross-domain correlation",
    narrative: {
      discovery: "Correlated identity exposure with Application Security findings and Exposure Analyst's attack path to produce a unified breach impact score.",
      conclusion: "Breach impact elevated to critical. The combination of credential exposure, standing privilege, and crown-jewel reachability creates an immediate and exploitable risk.",
      recommendation: "Classify this as a Severity 1 incident. Initiate breach protocol and notify incident commander.",
    },
    confidence: 88,
    tone: "danger",
  };
}

function narrativeDelta_IdentityBreach(): AgentNarrative {
  return {
    agentId: "delta",
    analystName: AGENT_NAMES.delta,
    module: "Policy & Governance Engine",
    action: "Initiated compliance breach protocol and remediation workflow",
    narrative: {
      discovery: "Compliance breach protocol triggered: credential rotation exceeded policy window, standing privilege violates least-privilege mandate.",
      conclusion: "SOC 2 Type II control effectiveness is at risk. The compliance gap requires immediate remediation before the next audit window.",
      recommendation: "Authorize identity remediation workflow: revoke standing access, rotate credentials, and enable JIT access policy.",
    },
    confidence: 92,
    tone: "active",
  };
}

/* --- Configuration Drift Response --- */

function narrativeBravo_ConfigDrift(): AgentNarrative {
  const mc = getTopIntervention("Misconfiguration");
  const tasks = getAgentTasks("bravo");
  return {
    agentId: "bravo",
    analystName: AGENT_NAMES.bravo,
    module: "Misconfiguration Management",
    action: "Detected unauthorized configuration change exposing cloud resources",
    narrative: {
      discovery: mc ? `${mc.title} — ${mc.description}` : (tasks[0] || "Detected Terraform drift on infra-gateway-02."),
      conclusion: mc?.businessImpact || "Public data exposure risk from misconfigured storage policy.",
      recommendation: mc ? `Authorize rollback immediately. Confidence: ${mc.confidence}%.` : "Revert to last known good configuration baseline.",
    },
    confidence: mc?.confidence ?? 98,
    tone: "warning",
  };
}

function narrativeHotel_ConfigDrift(): AgentNarrative {
  const vuln = MODULE_DATA["Vulnerabilities"]?.initialInterventions[1];
  return {
    agentId: "hotel",
    analystName: AGENT_NAMES.hotel,
    module: "Vulnerability Management",
    action: "Assessed new vulnerability exposure from configuration drift",
    narrative: {
      discovery: vuln ? `Configuration drift exposed ${vuln.title}.` : "Configuration change exposed previously protected endpoints to known CVEs.",
      conclusion: vuln?.businessImpact || "Web service exploitation exposure increased due to relaxed security controls.",
      recommendation: "Apply compensating controls immediately while the configuration rollback is pending.",
    },
    confidence: vuln?.confidence ?? 82,
    tone: "warning",
  };
}

function narrativeFoxtrot_ConfigDrift(): AgentNarrative {
  return {
    agentId: "foxtrot",
    analystName: AGENT_NAMES.foxtrot,
    module: "Exposure / Threat Modelling",
    action: "Evaluated expanded attack surface from configuration drift",
    narrative: {
      discovery: "Configuration drift expanded the attack surface: 6 cloud resources are now exposed, 2 of which are internet-facing and overlap with a vulnerable workload cluster.",
      conclusion: "The expanded surface creates a new ingress point into the internal network. Blast radius modeling indicates potential access to 3 additional sensitive data stores.",
      recommendation: "Prioritize rollback of internet-facing resources first. Contain blast radius by segmenting the affected subnet.",
    },
    confidence: 86,
    tone: "danger",
  };
}

function narrativeEcho_ConfigDrift(): AgentNarrative {
  return {
    agentId: "echo",
    analystName: AGENT_NAMES.echo,
    module: "Risk Analysis",
    action: "Recalculated risk posture after configuration drift",
    narrative: {
      discovery: "Composite risk score recalculated: +15 points from baseline due to expanded attack surface and new vulnerability exposure from configuration drift.",
      conclusion: "Risk posture degraded significantly. The drift increased overall exposure by 23% and introduced a new critical attack path to a data warehouse.",
      recommendation: "Immediate risk mitigation required. Configuration rollback will reduce risk score by an estimated 12 points.",
    },
    confidence: 88,
    tone: "danger",
  };
}

function narrativeDelta_ConfigDrift(): AgentNarrative {
  return {
    agentId: "delta",
    analystName: AGENT_NAMES.delta,
    module: "Policy & Governance Engine",
    action: "Enforced policy remediation and prepared rollback workflow",
    narrative: {
      discovery: "Policy violation detected: infrastructure change bypassed the approved change management workflow. No peer review or approval recorded.",
      conclusion: "Change management control gap identified. This violates the organization's SOC 2 change management policy and CIS benchmark requirements.",
      recommendation: "Authorize automated rollback to last known good state. Review change management controls to prevent recurrence.",
    },
    confidence: 92,
    tone: "active",
  };
}

/* ═══════════════════════════════════════════════════════════
   Scenario → Narrative assembly
   ═══════════════════════════════════════════════════════════ */

type NarrativeBuilder = () => AgentNarrative;

const SCENARIO_NARRATIVES: Record<string, NarrativeBuilder[]> = {
  "Exposed Asset Response": [
    narrativeAlpha_ExposedAsset,
    narrativeHotel_ExposedAsset,
    narrativeFoxtrot_ExposedAsset,
    narrativeEcho_ExposedAsset,
    narrativeDelta_ExposedAsset,
  ],
  "Identity Breach Investigation": [
    narrativeGolf_IdentityBreach,
    narrativeCharlie_IdentityBreach,
    narrativeFoxtrot_IdentityBreach,
    narrativeEcho_IdentityBreach,
    narrativeDelta_IdentityBreach,
  ],
  "Configuration Drift Response": [
    narrativeBravo_ConfigDrift,
    narrativeHotel_ConfigDrift,
    narrativeFoxtrot_ConfigDrift,
    narrativeEcho_ConfigDrift,
    narrativeDelta_ConfigDrift,
  ],
};

const SCENARIO_SYNTHESIS: Record<string, { synthesis: string; requiredAction: string }> = {
  "Exposed Asset Response": {
    synthesis: "Asset Intelligence discovered unmanaged endpoints, Vulnerability Analyst confirmed critical CVE exposure, Exposure Analyst traced a lateral movement path to a crown-jewel asset, Risk Intelligence elevated the composite score to critical, and Governance prepared the containment workflow. The investigation confirms an exploitable chain from public internet to production financial data.",
    requiredAction: "Authorize containment workflow to isolate the compromised workload and deploy emergency patches.",
  },
  "Identity Breach Investigation": {
    synthesis: "Identity Security detected anomalous privilege usage, Application Security found a leaked admin token in build artifacts, Exposure Analyst confirmed crown-jewel reachability through the compromised identity, Risk Intelligence assessed breach impact as critical, and Governance initiated the compliance breach protocol. Standing privileges and stale credentials created an exploitable path to production.",
    requiredAction: "Authorize identity remediation: revoke standing access, rotate credentials, and enable just-in-time access.",
  },
  "Configuration Drift Response": {
    synthesis: "Configuration Security detected unauthorized infrastructure changes, Vulnerability Analyst confirmed new CVE exposure, Exposure Analyst mapped a 23% increase in attack surface, Risk Intelligence recalculated a significant posture degradation, and Governance identified a change management policy violation. The drift introduced new ingress points to sensitive data stores.",
    requiredAction: "Authorize configuration rollback to restore the security baseline and close the exposure window.",
  },
};

/**
 * Build a complete investigation narrative for a given scenario.
 * Each step is grounded in real MODULE_DATA and AGENT_TASKS.
 */
export function buildInvestigationNarrative(
  scenario?: InvestigationScenario,
): InvestigationNarrative {
  const sc = scenario ?? INVESTIGATION_SCENARIOS[0];
  const builders = SCENARIO_NARRATIVES[sc.name];
  const steps = builders ? builders.map(fn => fn()) : [];
  const meta = SCENARIO_SYNTHESIS[sc.name] ?? {
    synthesis: "Multiple analysts contributed findings to this investigation.",
    requiredAction: "Review the investigation and authorize the recommended action.",
  };

  return {
    scenarioName: sc.name,
    scenarioColor: sc.color,
    steps,
    synthesis: meta.synthesis,
    requiredAction: meta.requiredAction,
  };
}

/**
 * Build the narrative for a single analyst within the current scenario.
 */
export function buildAgentNarrative(
  agentId: AgentId,
  scenario?: InvestigationScenario,
): AgentNarrative | null {
  const sc = scenario ?? INVESTIGATION_SCENARIOS[0];
  const builders = SCENARIO_NARRATIVES[sc.name];
  if (!builders) return null;
  for (const fn of builders) {
    const n = fn();
    if (n.agentId === agentId) return n;
  }
  return null;
}

/* ═══════════════════════════════════════════════════════════
   AiRenderableResponse builders — narrative-enriched modules
   ═══════════════════════════════════════════════════════════ */

/**
 * Build an InvestigationTimeline response enriched with narrative details.
 */
export function buildNarrativeTimeline(
  scenario?: InvestigationScenario,
): AiRenderableResponse {
  const inv = buildInvestigationNarrative(scenario);
  return {
    type: "timeline",
    title: inv.scenarioName,
    status: "active",
    steps: inv.steps.map((step, i) => ({
      id: String(i + 1),
      analyst: step.analystName,
      action: step.action + ".",
      detail: `${step.narrative.conclusion}`,
      tone: step.tone,
    })),
  };
}

/**
 * Build a synthesis InsightCard summarizing the multi-analyst story.
 */
export function buildNarrativeSynthesis(
  scenario?: InvestigationScenario,
): AiRenderableResponse {
  const inv = buildInvestigationNarrative(scenario);
  const avgConfidence = Math.round(
    inv.steps.reduce((sum, s) => sum + s.confidence, 0) / (inv.steps.length || 1),
  );
  return {
    type: "insight",
    module: "Risk Analysis",
    severity: "critical",
    title: `${inv.scenarioName} — collaborative analysis complete`,
    description: inv.synthesis,
    supportingStats: [
      { label: "Analysts involved", value: String(inv.steps.length) },
      { label: "Avg. confidence", value: `${avgConfidence}%` },
    ],
    actions: ["Authorize", "View details", "Escalate"],
  };
}

/**
 * Build an AnalystDetailPanel from a single agent's narrative.
 */
export function buildNarrativeAnalystDetail(
  agentId: AgentId,
  scenario?: InvestigationScenario,
): AiRenderableResponse {
  const n = buildAgentNarrative(agentId, scenario);
  if (!n) {
    return {
      type: "analyst_detail",
      analyst: AGENT_NAMES[agentId],
      module: AGENT_MODULE[agentId],
      status: "neutral",
      discoveries: ["No findings in the current investigation."],
      decisions: ["Awaiting assignment."],
      actions: ["Monitoring."],
    };
  }
  return {
    type: "analyst_detail",
    analyst: n.analystName,
    module: n.module,
    status: n.tone,
    discoveries: [n.narrative.discovery],
    decisions: [n.narrative.conclusion],
    actions: [n.narrative.recommendation],
  };
}

/**
 * Build a DecisionCard informed by the investigation narrative.
 */
export function buildNarrativeDecision(
  scenario?: InvestigationScenario,
): AiRenderableResponse {
  const inv = buildInvestigationNarrative(scenario);
  const lastStep = inv.steps[inv.steps.length - 1];
  return {
    type: "decision",
    module: "Security Governance Workflows",
    severity: "critical",
    title: inv.requiredAction.split(".")[0],
    whyItMatters: inv.synthesis.slice(0, 200) + "...",
    impact: `${inv.steps.length} analysts corroborated. Avg. confidence: ${Math.round(inv.steps.reduce((s, st) => s + st.confidence, 0) / (inv.steps.length || 1))}%.`,
    primaryAction: "Authorize",
    secondaryAction: "Defer",
    tertiaryAction: "Explain reasoning",
  };
}

/**
 * Build a full narrative InsightCard for a specific analyst.
 */
export function buildNarrativeInsight(
  agentId: AgentId,
  scenario?: InvestigationScenario,
): AiRenderableResponse {
  const n = buildAgentNarrative(agentId, scenario);
  if (!n) {
    return {
      type: "insight",
      module: AGENT_MODULE[agentId],
      severity: "low",
      title: `${AGENT_NAMES[agentId]} — no active findings`,
      description: "This analyst has not contributed to the current investigation.",
      actions: ["View details"],
    };
  }
  return {
    type: "insight",
    module: n.module,
    severity: n.tone === "danger" ? "critical" : n.tone === "warning" ? "high" : "medium",
    title: `${n.analystName} — ${n.action}`,
    description: `${n.narrative.discovery} ${n.narrative.conclusion}`,
    supportingStats: [
      { label: "Confidence", value: `${n.confidence}%` },
      { label: "Recommendation", value: n.narrative.recommendation.split(".")[0] },
    ],
    actions: ["View details", "Investigate", "Explain reasoning"],
  };
}

/* ═══════════════════════════════════════════════════════════
   Convenience: get all 3 scenario narratives
   ═══════════════════════════════════════════════════════════ */

export function getAllInvestigationNarratives(): InvestigationNarrative[] {
  return INVESTIGATION_SCENARIOS.map(sc => buildInvestigationNarrative(sc));
}
