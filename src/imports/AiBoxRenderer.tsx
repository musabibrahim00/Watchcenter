import React from "react";
import {
  AnalystDetailPanel,
  AttackPathGraph,
  CaseSummaryCard,
  DecisionCard,
  InsightCard,
  InvestigationTimeline,
  MetricsSummary,
  TrendChart,
  type Severity,
} from "./AiBoxModules";
import * as Live from "./AiBoxLiveData";
import type { TaskInvestigationRequest } from "./TaskInvestigationBridge";

export type SourceModule =
  | "Case Management"
  | "Compliance"
  | "Asset Insight"
  | "Vulnerability Management"
  | "Misconfiguration Management"
  | "IAM"
  | "Application Security Management"
  | "Risk Analysis"
  | "Exposure / Threat Modelling"
  | "Security Governance Workflows"
  | "Policy & Governance Engine";

export type AiIntent =
  | "attention"
  | "incident_timeline"
  | "system_summary"
  | "approval_queue"
  | "attack_paths"
  | "analyst_reasoning"
  | "case_summary"
  | "compliance_status"
  | "vulnerability_posture"
  | "asset_exposure"
  | "misconfiguration_status"
  | "iam_exposure"
  | "appsec_findings"
  | "risk_summary"
  | "investigation_narrative"
  | "unknown";

export type AiRenderableResponse =
  | {
      type: "insight";
      module: SourceModule;
      severity: Severity;
      title: string;
      description: string;
      supportingStats?: Array<{ label: string; value: string }>;
      actions?: string[];
    }
  | {
      type: "decision";
      module: SourceModule;
      severity: Severity;
      title: string;
      whyItMatters: string;
      impact: string;
      primaryAction: string;
      secondaryAction?: string;
      tertiaryAction?: string;
    }
  | {
      type: "timeline";
      title: string;
      status?: string;
      steps: Array<{
        id: string;
        analyst: string;
        action: string;
        detail?: string;
        tone?: Severity | "active" | "success" | "warning" | "danger" | "neutral";
      }>;
    }
  | {
      type: "metrics";
      title?: string;
      metrics: Array<{
        label: string;
        value: string;
        delta?: string;
        trend?: "up" | "down" | "neutral";
      }>;
      progressLabel?: string;
      progressValue?: number;
    }
  | {
      type: "trend_chart";
      title: string;
      module: SourceModule;
      mode?: "line" | "area";
      data: Array<{
        label: string;
        value: number;
        baseline?: number;
      }>;
    }
  | {
      type: "attack_path";
      title: string;
      stats: {
        vulnerabilities: { critical: number; high: number; medium: number; low: number };
        misconfiguration: { critical: number; high: number; medium: number; low: number };
      };
      chartData: Array<{ week: string; vuln: number; misconfig: number }>;
    }
  | {
      type: "analyst_detail";
      analyst: string;
      module: SourceModule;
      status: "neutral" | "active" | "success" | "warning" | "danger";
      discoveries: string[];
      decisions: string[];
      actions: string[];
    }
  | {
      type: "case_summary";
      caseId: string;
      title: string;
      severity: Severity;
      owner: string;
      status: string;
      evidence: string[];
      nextStep?: string;
    };

export interface AiQueryContext {
  query: string;
  activeModule?: SourceModule;
  activeAnalyst?: string;
  selectedCaseId?: string;
}

/* ═══════════════════════════════════════════════════════════
   Interaction Context — memory across multi-step interactions
   ═══════════════════════════════════════════════════════════ */

export interface InteractionContext {
  lastQuery: string;
  lastIntent: AiIntent;
  activeModule: SourceModule | null;
  activeAnalyst: string | null;
  activeCaseId: string | null;
  lastAction: string | null;
  lastResponseTypes: string[];
  investigationActive: boolean;
}

export const EMPTY_CONTEXT: InteractionContext = {
  lastQuery: "",
  lastIntent: "unknown",
  activeModule: null,
  activeAnalyst: null,
  activeCaseId: null,
  lastAction: null,
  lastResponseTypes: [],
  investigationActive: false,
};

/** Extract context metadata from a list of rendered response modules */
export function extractContext(
  modules: AiRenderableResponse[],
  query: string,
  intent: AiIntent,
  prev: InteractionContext,
  action?: string,
): InteractionContext {
  let activeModule = prev.activeModule;
  let activeAnalyst = prev.activeAnalyst;
  let activeCaseId = prev.activeCaseId;
  let investigationActive = prev.investigationActive;
  const responseTypes: string[] = [];

  for (const mod of modules) {
    responseTypes.push(mod.type);
    switch (mod.type) {
      case "insight":
      case "decision":
      case "trend_chart":
        activeModule = mod.module;
        break;
      case "analyst_detail":
        activeModule = mod.module;
        activeAnalyst = mod.analyst;
        break;
      case "case_summary":
        activeCaseId = mod.caseId;
        break;
      case "timeline":
        investigationActive = true;
        break;
    }
  }

  return {
    lastQuery: query || prev.lastQuery,
    lastIntent: intent !== "unknown" ? intent : prev.lastIntent,
    activeModule,
    activeAnalyst,
    activeCaseId,
    lastAction: action ?? prev.lastAction,
    lastResponseTypes: responseTypes,
    investigationActive,
  };
}

/* SAMPLE_DATA removed — all responses now use Live.* builders from AiBoxLiveData.ts */

export function detectIntent(query: string): AiIntent {
  const q = query.toLowerCase().trim();

  if (!q) return "unknown";

  if (includesAny(q, ["approve", "approval", "authorize", "defer", "pending action"])) {
    return "approval_queue";
  }

  if (includesAny(q, ["what happened", "timeline", "incident", "investigation", "flow"])) {
    return "incident_timeline";
  }

  if (includesAny(q, ["attack path", "attack paths", "lateral movement", "exposure path", "domain controller", "domain admin", "hop", "pivot", "jump server", "blast radius"])) {
    return "attack_paths";
  }

  if (includesAny(q, ["metrics", "summary", "today", "system did", "impact", "roi", "hours saved"])) {
    return "system_summary";
  }

  if (includesAny(q, ["attention", "urgent", "priority", "critical now", "biggest risk"])) {
    return "attention";
  }

  if (includesAny(q, ["isolate", "compromised", "c2", "beacon", "containment", "quarantine", "edr"])) {
    return "incident_timeline";
  }

  if (includesAny(q, ["analyst", "reasoning", "why is", "explain this analyst"])) {
    return "analyst_reasoning";
  }

  if (includesAny(q, ["case", "case status", "case summary"])) {
    return "case_summary";
  }

  if (includesAny(q, ["compliance", "policy", "governance"])) {
    return "compliance_status";
  }

  if (includesAny(q, ["vulnerability", "cve", "patch", "patching", "certificate", "tls", "rotation", "rce", "remote code"])) {
    return "vulnerability_posture";
  }

  if (includesAny(q, ["asset", "inventory", "exposed asset", "asset exposure", "bucket", "s3", "public access", "misconfigured"])) {
    return "asset_exposure";
  }

  if (includesAny(q, ["misconfiguration", "configuration", "drift", "cspm"])) {
    return "misconfiguration_status";
  }

  if (includesAny(q, ["iam", "identity", "permissions", "privilege", "mfa", "service account", "token", "api token", "credential", "stale"])) {
    return "iam_exposure";
  }

  if (includesAny(q, ["application", "secret", "appsec", "dependency", "code risk", "jenkins", "ci/cd", "supply chain", "pipeline"])) {
    return "appsec_findings";
  }

  if (includesAny(q, ["risk", "risk score", "risk summary"])) {
    return "risk_summary";
  }

  if (includesAny(q, [
    "narrative", "investigation narrative", "investigation story",
    "how did the analysts", "analyst story", "what did each analyst",
    "show me the story", "analyst collaboration", "who contributed",
    "multi-analyst", "analyst findings", "analysts work together",
  ])) {
    return "investigation_narrative";
  }

  return "unknown";
}

export function buildAiResponse(context: AiQueryContext): AiRenderableResponse {
  const intent = detectIntent(context.query);

  switch (intent) {
    case "approval_queue":    return Live.buildLiveApprovalDecision();
    case "incident_timeline": return Live.buildLiveTimeline();
    case "system_summary":    return Live.buildLiveSystemMetrics();
    case "attack_paths":      return Live.buildLiveAttackPath();
    case "analyst_reasoning": return Live.buildLiveAnalystDetail("foxtrot");
    case "case_summary":      return Live.buildLiveCaseSummary();
    case "compliance_status": return Live.buildLiveComplianceInsight();
    case "vulnerability_posture": return Live.buildLiveVulnTrend();
    case "asset_exposure":    return Live.buildLiveAssetInsight();
    case "misconfiguration_status": return Live.buildLiveMisconfigInsight();
    case "iam_exposure":      return Live.buildLiveIamInsight();
    case "appsec_findings":   return Live.buildLiveAppSecAnalyst();
    case "risk_summary":      return Live.buildLiveRiskTrend();
    case "attention":         return Live.buildLiveAttentionInsight();
    case "investigation_narrative": return Live.buildNarrativeTimeline();
    case "unknown":
    default:                  return Live.buildLiveSystemMetrics();
  }
}

export function renderAiResponse(response: AiRenderableResponse): React.ReactNode {
  switch (response.type) {
    case "insight":
      return <InsightCard {...response} />;

    case "decision":
      return <DecisionCard {...response} />;

    case "timeline":
      return <InvestigationTimeline {...response} />;

    case "metrics":
      return <MetricsSummary {...response} />;

    case "trend_chart":
      return <TrendChart {...response} />;

    case "attack_path":
      return <AttackPathGraph {...response} />;

    case "analyst_detail":
      return <AnalystDetailPanel {...response} />;

    case "case_summary":
      return <CaseSummaryCard {...response} />;

    default:
      return null;
  }
}

export function buildAndRenderAiResponse(context: AiQueryContext): { ui: React.ReactNode; modules: AiRenderableResponse[]; intent: AiIntent } | null {
  const intent = detectIntent(context.query);
  const modules = buildComposedResponse(context);
  if (modules.length === 0) return null;
  const ui = modules.length === 1
    ? renderAiResponse(modules[0])
    : (
        <div className="flex flex-col gap-[8px]">
          {modules.map((mod, i) => (
            <div key={i}>{renderAiResponse(mod)}</div>
          ))}
        </div>
      );
  return { ui, modules, intent };
}

/* ═══════════════════════════════════════════════════════════
   Composed multi-module response builder
   ═══════════════════════════════════════════════════════════ */

function buildComposedResponse(context: AiQueryContext): AiRenderableResponse[] {
  const intent = detectIntent(context.query);

  switch (intent) {
    case "attention":
      return [Live.buildLiveAttentionInsight(), Live.buildLiveAttentionDecision()];

    case "incident_timeline":
      return [Live.buildLiveTimeline(), Live.buildLiveTimelineInsight()];

    case "system_summary":
      return [Live.buildLiveSystemMetrics(), Live.buildLiveRiskTrend()];

    case "attack_paths":
      return [Live.buildLiveAttackPath(), Live.buildLiveAttackPathInsight()];

    case "approval_queue":
      return [Live.buildLiveApprovalDecision(), Live.buildLiveApprovalCase()];

    case "analyst_reasoning":
      return [Live.buildLiveAnalystDetail("foxtrot"), Live.buildLiveAttackPathInsight()];

    case "case_summary":
      return [Live.buildLiveCaseSummary(), Live.buildLiveCaseDecision()];

    case "compliance_status":
      return [Live.buildLiveComplianceInsight(), Live.buildLiveComplianceMetrics()];

    case "vulnerability_posture":
      return [Live.buildLiveVulnTrend(), Live.buildLiveVulnInsight()];

    case "asset_exposure":
      return [Live.buildLiveAssetInsight(), Live.buildLiveAssetTrend()];

    case "misconfiguration_status":
      return [Live.buildLiveMisconfigInsight(), Live.buildLiveMisconfigDecision()];

    case "iam_exposure":
      return [Live.buildLiveIamInsight(), Live.buildLiveAnalystDetail("golf")];

    case "appsec_findings":
      return [Live.buildLiveAppSecAnalyst(), Live.buildLiveAppSecInsight()];

    case "risk_summary":
      return [Live.buildLiveRiskTrend(), Live.buildLiveRiskMetrics()];

    case "investigation_narrative":
      return [Live.buildNarrativeTimeline(), Live.buildNarrativeSynthesis(), Live.buildNarrativeDecision()];

    case "unknown":
    default:
      return [Live.buildLiveSystemMetrics(), Live.buildLiveRiskTrend()];
  }
}

function includesAny(query: string, phrases: string[]) {
  return phrases.some((phrase) => query.includes(phrase));
}

/* ═══════════════════════════════════════════════════════════
   Task Investigation Builder — generates contextual
   multi-module investigation responses for specific tasks
   ═══════════════════════════════════════════════════════════ */

export function buildTaskInvestigation(
  request: TaskInvestigationRequest
): { ui: React.ReactNode; modules: AiRenderableResponse[]; intent: AiIntent } {
  const modules: AiRenderableResponse[] = [];

  // 1. Build investigation timeline from contributing analysts
  if (request.analysts.length > 0) {
    const toneMap: Record<string, "danger" | "warning" | "active" | "success" | "neutral"> = {
      "Asset Intelligence Analyst": "active",
      "Vulnerability Analyst": "danger",
      "Exposure Analyst": "danger",
      "Risk Intelligence Analyst": "warning",
      "Governance & Compliance Analyst": "success",
      "Configuration Security Analyst": "warning",
      "Application Security Analyst": "active",
      "Identity Security Analyst": "warning",
    };

    modules.push({
      type: "timeline",
      title: `Investigation — ${request.title}`,
      status: "active",
      steps: request.analysts.map((a, i) => ({
        id: String(i + 1),
        analyst: a.role,
        action: a.contribution,
        detail: a.contribution,
        tone: toneMap[a.role] || ("neutral" as const),
      })),
    });
  }

  // 2. Build contextual insight card
  const severityVal: "critical" | "high" | "medium" | "low" =
    request.severity === "Critical" ? "critical"
    : request.severity === "Warning" ? "high"
    : "medium";

  const moduleGuess: SourceModule = guessModule(request.title, request.reason);

  modules.push({
    type: "insight",
    module: moduleGuess,
    severity: severityVal,
    title: request.title,
    description: request.reason || request.description,
    supportingStats: [
      { label: "Analysts involved", value: String(request.analysts.length) },
      { label: "Confidence", value: `${75 + Math.floor(Math.random() * 20)}%` },
    ],
    actions: request.actionType === "authorize"
      ? ["Show metrics", "View details"]
      : ["Investigate", "Create case", "Show attack path"],
  });

  // 3. For "investigate" or "view_details", add attack path if relevant
  if (
    (request.actionType === "investigate" || request.actionType === "view_details") &&
    isAttackPathRelevant(request.title, request.reason)
  ) {
    modules.push(Live.buildLiveAttackPath());
  }

  // 4. For "open_case", add case summary
  if (request.actionType === "open_case") {
    modules.push({
      type: "case_summary",
      caseId: `CASE-${4200 + Math.floor(Math.random() * 100)}`,
      title: request.title,
      severity: severityVal,
      owner: "SOC Triage",
      status: "Created",
      evidence: request.analysts.slice(0, 3).map(a => a.contribution),
      nextStep: "Assign investigation owner",
    });
  }

  // 5. For "authorize", add decision card
  if (request.actionType === "authorize") {
    modules.push({
      type: "decision",
      module: moduleGuess,
      severity: severityVal,
      title: `Confirm: ${request.title}`,
      whyItMatters: request.reason || request.description,
      impact: `${request.analysts.length} analysts contributed to this recommendation`,
      primaryAction: "Authorize",
      secondaryAction: "Defer",
      tertiaryAction: "Explain reasoning",
    });
  }

  const ui =
    modules.length === 1
      ? renderAiResponse(modules[0])
      : (
          <div className="flex flex-col gap-[8px]">
            {modules.map((mod, i) => (
              <div key={i}>{renderAiResponse(mod)}</div>
            ))}
          </div>
        );

  return { ui, modules, intent: "incident_timeline" };
}

function guessModule(title: string, reason: string): SourceModule {
  const text = `${title} ${reason}`.toLowerCase();
  if (text.includes("cve") || text.includes("patch") || text.includes("vulnerability")) return "Vulnerability Management";
  if (text.includes("lateral movement") || text.includes("attack path") || text.includes("exposure")) return "Exposure / Threat Modelling";
  if (text.includes("certificate") || text.includes("tls") || text.includes("misconfigur")) return "Misconfiguration Management";
  if (text.includes("token") || text.includes("api") || text.includes("mfa") || text.includes("identity") || text.includes("credential")) return "IAM";
  if (text.includes("s3") || text.includes("bucket") || text.includes("asset")) return "Asset Insight";
  if (text.includes("compliance") || text.includes("governance")) return "Compliance";
  if (text.includes("jenkins") || text.includes("rce") || text.includes("pipeline") || text.includes("supply chain")) return "Application Security Management";
  if (text.includes("risk")) return "Risk Analysis";
  if (text.includes("case")) return "Case Management";
  return "Security Governance Workflows";
}

function isAttackPathRelevant(title: string, reason: string): boolean {
  const text = `${title} ${reason}`.toLowerCase();
  return text.includes("lateral") || text.includes("attack path") || text.includes("hop") ||
    text.includes("exposure") || text.includes("blast radius") || text.includes("isolation") ||
    text.includes("compromised");
}

/* ═══════════════════════════════════════════════════════════
   Deterministic Action Map
   ═══════════════════════════════════════════════════════════

   Maps every action button label to a concrete list of
   AiRenderableResponse modules. No fuzzy intent detection —
   every click produces the same predictable result.
   ═══════════════════════════════════════════════════════════ */

const ACTION_MAP: Record<string, { message?: string; modules: AiRenderableResponse[] }> = {
  /* ── Core navigation actions ── */

  "View attack path": {
    message: "Opening the attack path detail view…",
    modules: [
      Live.buildLiveAttackPathInsight(),
    ],
  },

  "Investigate": {
    modules: [
      Live.buildLiveTimeline(),
      Live.buildLiveTimelineInsight(),
    ],
  },

  "View details": {
    modules: [
      Live.buildLiveAnalystDetail("foxtrot"),
      Live.buildLiveAttackPathInsight(),
    ],
  },

  "View evidence": {
    modules: [
      Live.buildLiveAnalystDetail("foxtrot"),
    ],
  },

  "View evidence chain": {
    modules: [
      Live.buildLiveAnalystDetail("foxtrot"),
      Live.buildLiveAttackPathInsight(),
    ],
  },

  "Create case": {
    modules: [
      Live.buildLiveCaseSummary(),
      Live.buildLiveCaseDecision(),
    ],
  },

  "Open case": {
    modules: [
      Live.buildLiveCaseSummary(),
    ],
  },

  /* ── Decision actions ── */
  "Authorize": {
    message: "Action authorized. Containment workflow initiated. Here\u2019s what else needs your attention:",
    modules: [
      {
        type: "insight",
        module: "Security Governance Workflows",
        severity: "medium",
        title: "Containment authorized \u2014 isolation in progress",
        description:
          "The compromised build server has been scheduled for network isolation. Governance workflow is tracking the remediation lifecycle.",
        supportingStats: [
          { label: "ETA", value: "< 5 min" },
          { label: "Workflow", value: "Active" },
        ],
        actions: ["Show metrics", "View details"],
      },
      {
        type: "metrics",
        title: "Post-authorization status",
        metrics: [
          { label: "Containment ETA", value: "< 5 min", trend: "neutral" as const },
          { label: "Open attack paths", value: "3 → 1", delta: "-2", trend: "down" as const },
          { label: "Risk score impact", value: "66 → 41", delta: "-25", trend: "down" as const },
        ],
        progressLabel: "Remediation progress",
        progressValue: 35,
      },
    ],
  },

  "Authorize rollback": {
    message: "Rollback authorized. Configuration policy is being restored.",
    modules: [
      {
        type: "insight",
        module: "Misconfiguration Management",
        severity: "low",
        title: "Policy rollback in progress",
        description:
          "The misconfigured storage policy is being reverted to last known good state. Segmentation will be restored shortly.",
        supportingStats: [
          { label: "ETA", value: "< 2 min" },
          { label: "Resources", value: "6 restored" },
        ],
        actions: ["Show metrics", "View details"],
      },
    ],
  },

  "Defer": {
    message: "Deferred. The decision has been moved to the review queue.",
    modules: [
      (() => {
        const c = Live.buildLiveCaseSummary() as Extract<AiRenderableResponse, { type: "case_summary" }>;
        return { ...c, severity: "medium" as const, status: "Deferred \u2014 review queue", nextStep: "Awaiting manual review within 4 hours" };
      })(),
    ],
  },

  /* ── Visualization actions ── */
  "Show attack path": {
    modules: [
      Live.buildLiveAttackPath(),
      Live.buildLiveAttackPathInsight(),
    ],
  },

  "Show metrics": {
    modules: [
      Live.buildLiveSystemMetrics(),
      Live.buildLiveRiskTrend(),
    ],
  },

  "Explain reasoning": {
    modules: [
      Live.buildLiveAnalystDetail("foxtrot"),
      Live.buildLiveAttackPathInsight(),
    ],
  },

  /* ── Domain-specific actions ── */
  "Escalate": {
    modules: [
      Live.buildLiveAttentionDecision(),
      Live.buildLiveAttentionInsight(),
    ],
  },

  "Review controls": {
    modules: [
      Live.buildLiveComplianceInsight(),
      Live.buildLiveComplianceMetrics(),
    ],
  },

  "View CVEs": {
    modules: [
      Live.buildLiveVulnTrend(),
      Live.buildLiveVulnInsight(),
    ],
  },

  "Review assets": {
    modules: [
      Live.buildLiveAssetInsight(),
    ],
  },

  "Review drift": {
    modules: [
      Live.buildLiveMisconfigInsight(),
    ],
  },

  "Review entitlements": {
    modules: [
      Live.buildLiveIamInsight(),
      Live.buildLiveAnalystDetail("golf"),
    ],
  },

  "Trigger remediation": {
    message: "Remediation workflow initiated.",
    modules: [
      {
        type: "decision",
        module: "Security Governance Workflows" as SourceModule,
        severity: "high" as const,
        title: "Confirm remediation scope",
        whyItMatters: "Automated remediation will modify cloud infrastructure configurations. Verify scope before execution.",
        impact: "6 resources restored in < 3 min",
        primaryAction: "Authorize",
        secondaryAction: "Defer",
        tertiaryAction: "View details",
      },
    ],
  },

  "Restrict access": {
    message: "Access restriction workflow initiated.",
    modules: [
      {
        type: "decision",
        module: "IAM" as SourceModule,
        severity: "high" as const,
        title: "Confirm entitlement reduction for svc-ci-deploy",
        whyItMatters: "Reducing privileges will revoke write access to production data stores from the compromised service principal.",
        impact: "Attack path reduced by 1 hop",
        primaryAction: "Authorize",
        secondaryAction: "Defer",
        tertiaryAction: "View details",
      },
    ],
  },

  "Rotate token": {
    message: "Token rotation workflow initiated.",
    modules: [
      {
        type: "decision",
        module: "Application Security Management" as SourceModule,
        severity: "high" as const,
        title: "Authorize credential rotation for leaked token",
        whyItMatters: "The leaked service token grants admin access to the compromised CI runner in the active attack path.",
        impact: "Credential invalidated immediately",
        primaryAction: "Authorize",
        secondaryAction: "Defer",
        tertiaryAction: "View details",
      },
    ],
  },

  "Patch dependency": {
    message: "Patch workflow initiated.",
    modules: [
      {
        type: "decision",
        module: "Vulnerability Management" as SourceModule,
        severity: "high" as const,
        title: "Authorize emergency patch for CVE-2026-1847",
        whyItMatters: "The affected dependency is in an internet-facing service linked to the active attack path.",
        impact: "Vulnerability eliminated, path severed",
        primaryAction: "Authorize",
        secondaryAction: "Defer",
        tertiaryAction: "View details",
      },
    ],
  },

  "Contain workload": {
    message: "Containment request submitted.",
    modules: [
      {
        type: "decision",
        module: "Security Governance Workflows" as SourceModule,
        severity: "critical" as const,
        title: "Authorize network isolation for compromised workload",
        whyItMatters: "The workload is at the pivot point of a 3-hop attack path to a crown-jewel production asset.",
        impact: "Containment in < 5 min, attack path severed",
        primaryAction: "Authorize",
        secondaryAction: "Defer",
        tertiaryAction: "View details",
      },
    ],
  },

  "Prioritize patching": {
    modules: [
      {
        type: "metrics",
        title: "Patch prioritization",
        metrics: [
          { label: "Critical unpatched", value: "8", delta: "+3", trend: "up" as const },
          { label: "In attack paths", value: "3", trend: "neutral" as const },
          { label: "Internet-facing", value: "2", trend: "neutral" as const },
          { label: "Avg. exposure age", value: "4.2 days", delta: "+1.1d", trend: "up" as const },
        ],
        progressLabel: "Patch coverage",
        progressValue: 74,
      },
      {
        type: "insight",
        module: "Vulnerability Management",
        severity: "high",
        title: "3 CVEs are in active attack paths",
        description:
          "Vulnerability Management identified that 3 of the 8 unpatched critical CVEs sit on confirmed lateral movement paths to crown-jewel assets.",
        supportingStats: [
          { label: "Highest CVSS", value: "9.8" },
          { label: "Paths impacted", value: "2" },
        ],
        actions: ["Investigate", "Create case"],
      },
    ],
  },

  "Open workflow": {
    modules: [
      Live.buildLiveApprovalDecision(),
    ],
  },

  "Create remediation task": {
    modules: [
      {
        type: "case_summary",
        caseId: "CASE-4219",
        title: "Remediation: outdated dependency in public service",
        severity: "high" as const,
        owner: "AppSec Team",
        status: "Created",
        evidence: [
          "Outdated dependency detected in internet-facing service.",
          "Package linked to known RCE vulnerability.",
          "Leaked token found in build artifact.",
        ],
        nextStep: "Assign remediation owner",
      },
    ],
  },

  "Assign owner": {
    message: "Owner assignment initiated.",
    modules: [
      (() => {
        const c = Live.buildLiveCaseSummary() as Extract<AiRenderableResponse, { type: "case_summary" }>;
        return { ...c, owner: "Incident Commander", status: "Owner assigned", nextStep: "Begin containment review" };
      })(),
    ],
  },

  "View case": {
    modules: [
      Live.buildLiveCaseSummary(),
      Live.buildLiveCaseDecision(),
    ],
  },

  "View artifact": {
    modules: [
      Live.buildLiveAppSecAnalyst(),
    ],
  },

  "Trace exposure": {
    modules: [
      Live.buildLiveAttackPath(),
    ],
  },

  "View affected assets": {
    modules: [
      {
        type: "insight",
        module: "Asset Insight",
        severity: "medium",
        title: "6 resources impacted by configuration drift",
        description:
          "The misconfigured storage policy exposed 6 cloud resources, 2 of which are internet-facing and overlap with a vulnerable workload cluster.",
        supportingStats: [
          { label: "Internet-facing", value: "2" },
          { label: "In attack paths", value: "1" },
        ],
        actions: ["Show attack path", "Create case"],
      },
    ],
  },
};

/* ═══════════════════════════════════════════════════════════
   Context-aware action overrides
   ═══════════════════════════════════════════════════════════ */

type ContextOverride = (ctx: InteractionContext) => { message?: string; modules: AiRenderableResponse[] } | null;

const CONTEXTUAL_OVERRIDES: Record<string, ContextOverride[]> = {
  "Investigate": [
    (ctx) => {
      if (ctx.lastIntent === "attack_paths" || ctx.lastResponseTypes.includes("attack_path")) {
        return { modules: [
          { type: "timeline", title: "Attack path investigation", status: "active", steps: [
            { id: "1", analyst: "Exposure Analyst", action: "Confirmed 3-hop lateral movement path.", detail: "Public ingress to crown-jewel asset via compromised app server and CI runner.", tone: "danger" as const },
            { id: "2", analyst: "Asset Intelligence Analyst", action: "Inventoried all assets in the path.", detail: "4 assets span 2 network segments.", tone: "active" as const },
            { id: "3", analyst: "Vulnerability Analyst", action: "Cross-referenced CVEs on path assets.", detail: "CVE-2026-1847 is exploitable on the app server.", tone: "warning" as const },
            { id: "4", analyst: "Risk Intelligence Analyst", action: "Recalculated path risk score.", detail: "Risk score elevated to 92 due to crown-jewel reachability.", tone: "danger" as const },
          ]},
          { type: "insight", module: "Exposure / Threat Modelling", severity: "critical" as const, title: "Attack path investigation initiated", description: "The investigation is tracing the lateral movement path from the public load balancer through the compromised app server to the production data warehouse.", supportingStats: [{ label: "Assets in path", value: "4" }, { label: "Path risk score", value: "92" }], actions: ["Show attack path", "Create case", "Explain reasoning"] },
        ]};
      }
      if (ctx.activeModule === "IAM") {
        return { modules: [
          { type: "timeline", title: "Identity exposure investigation", status: "active", steps: [
            { id: "1", analyst: "Identity Security Analyst", action: "Flagged over-privileged service principal.", detail: "svc-ci-deploy has unnecessary write access to production stores.", tone: "warning" as const },
            { id: "2", analyst: "Asset Intelligence Analyst", action: "Linked identity to compromised workload.", detail: "Service principal is attached to the CI runner in the active attack path.", tone: "danger" as const },
            { id: "3", analyst: "Risk Intelligence Analyst", action: "Elevated risk due to cross-domain correlation.", detail: "Identity exposure increases crown-jewel reachability confidence to 91%.", tone: "danger" as const },
          ]},
          { type: "insight", module: "IAM", severity: "high" as const, title: "IAM investigation context", description: "Investigation is focused on the over-privileged service principal svc-ci-deploy that contributes to crown-jewel reachability.", supportingStats: [{ label: "Excess entitlements", value: "7" }, { label: "Credential age", value: "94 days" }], actions: ["Restrict access", "Create case", "Show attack path"] },
        ]};
      }
      if (ctx.activeModule === "Vulnerability Management") {
        return { modules: [
          { type: "timeline", title: "Vulnerability investigation", status: "active", steps: [
            { id: "1", analyst: "Vulnerability Analyst", action: "Detected critical CVE on internet-facing service.", detail: "CVE-2026-1847 allows remote code execution.", tone: "danger" as const },
            { id: "2", analyst: "Asset Intelligence Analyst", action: "Confirmed asset is externally reachable.", detail: "Build server is on a public subnet with no WAF.", tone: "warning" as const },
            { id: "3", analyst: "Exposure Analyst", action: "Linked vulnerability to active attack path.", detail: "Exploitable CVE sits on a confirmed lateral movement path.", tone: "danger" as const },
          ]},
          { type: "insight", module: "Vulnerability Management", severity: "high" as const, title: "Vulnerability investigation context", description: "Investigation is focused on CVE-2026-1847 which is exploitable on an internet-facing build server linked to the active attack path.", supportingStats: [{ label: "CVSS", value: "9.8" }, { label: "Exploit available", value: "Yes" }], actions: ["Patch dependency", "Create case", "Show attack path"] },
        ]};
      }
      if (ctx.activeModule === "Misconfiguration Management") {
        return { modules: [
          { type: "timeline", title: "Misconfiguration investigation", status: "active", steps: [
            { id: "1", analyst: "Configuration Analyst", action: "Detected storage policy drift.", detail: "Cloud policy change exposed an S3 path overlapping with a workload cluster.", tone: "warning" as const },
            { id: "2", analyst: "Exposure Analyst", action: "Assessed blast radius.", detail: "6 resources affected, 2 are internet-facing.", tone: "danger" as const },
            { id: "3", analyst: "Governance & Compliance Analyst", action: "Prepared rollback workflow.", detail: "Automated rollback is pending authorization.", tone: "active" as const },
          ]},
          { type: "insight", module: "Misconfiguration Management", severity: "high" as const, title: "Misconfiguration investigation context", description: "Investigation is tracing the impact of a storage policy drift that increased attack surface across 6 cloud resources.", supportingStats: [{ label: "Resources affected", value: "6" }, { label: "Drift age", value: "42 min" }], actions: ["Trigger remediation", "Create case", "View affected assets"] },
        ]};
      }
      if (ctx.activeModule === "Application Security Management") {
        return { modules: [
          { type: "timeline", title: "Application security investigation", status: "active", steps: [
            { id: "1", analyst: "Application Security Analyst", action: "Detected outdated dependency.", detail: "Internet-facing service using a vulnerable package.", tone: "warning" as const },
            { id: "2", analyst: "Application Security Analyst", action: "Found leaked service token.", detail: "Admin token embedded in build artifact, linked to CI runner.", tone: "danger" as const },
            { id: "3", analyst: "Risk Intelligence Analyst", action: "Correlated with active attack path.", detail: "Token grants access to the compromised CI runner.", tone: "danger" as const },
          ]},
          { type: "insight", module: "Application Security Management", severity: "high" as const, title: "AppSec investigation context", description: "Investigation is focused on a leaked admin token in a build artifact and an outdated dependency in an internet-facing service.", supportingStats: [{ label: "Token scope", value: "Admin" }, { label: "Token age", value: "12 days" }], actions: ["Rotate token", "Patch dependency", "Create case"] },
        ]};
      }
      return null;
    },
  ],

  "View details": [
    (ctx) => {
      /* When investigation is active, show narrative-enriched details */
      if (ctx.investigationActive) {
        return { modules: [
          Live.buildNarrativeTimeline(),
          Live.buildNarrativeDecision(),
        ]};
      }
      if (ctx.lastIntent === "approval_queue" || ctx.lastResponseTypes.includes("decision")) {
        return { modules: [
          { type: "analyst_detail", analyst: "Governance & Compliance Analyst", module: "Security Governance Workflows" as SourceModule, status: "active" as const, discoveries: ["Compromised build server requires immediate isolation.", "Server has downstream access to privileged production systems."], decisions: ["Prepared automated containment workflow.", "Set 5-minute SLA for isolation execution."], actions: ["Submitted authorization request to the approval queue.", "Notified SOC Triage of pending action."] },
          Live.buildLiveCaseSummary(),
        ]};
      }
      if (ctx.activeModule === "Compliance") {
        return { modules: [
          { type: "analyst_detail", analyst: "Governance & Compliance Analyst", module: "Compliance" as SourceModule, status: "active" as const, discoveries: ["Missing control evidence in payment processing workflows.", "One unresolved policy exception open for 12 days."], decisions: ["Flagged compliance drift as medium severity.", "Linked missing evidence to recent infrastructure changes."], actions: ["Requested evidence collection from asset owners.", "Escalated unresolved exception to policy team."] },
          { type: "insight", module: "Compliance", severity: "medium" as const, title: "Compliance detail for active controls", description: "4 controls are impacted across payment workflows. Evidence gaps correlate with recent infrastructure drift.", supportingStats: [{ label: "Controls impacted", value: "4" }, { label: "Exception age", value: "12 days" }], actions: ["Review controls", "Create case"] },
        ]};
      }
      if (ctx.activeModule === "IAM") {
        return { modules: [
          { type: "analyst_detail", analyst: "Identity Security Analyst", module: "IAM" as SourceModule, status: "active" as const, discoveries: ["Service principal svc-ci-deploy has write access to production data stores.", "Credential last rotated 94 days ago \u2014 exceeds 90-day policy."], decisions: ["Flagged over-privileged identity contributing to crown-jewel path.", "Recommended immediate entitlement reduction and credential rotation."], actions: ["Restrict svc-ci-deploy to read-only.", "Trigger credential rotation workflow."] },
        ]};
      }
      if (ctx.activeModule === "Misconfiguration Management") {
        return { modules: [
          { type: "analyst_detail", analyst: "Configuration Analyst", module: "Misconfiguration Management" as SourceModule, status: "active" as const, discoveries: ["Cloud policy change exposed a storage path overlapping with a workload cluster.", "6 resources affected, 2 of which are internet-facing."], decisions: ["Assessed blast radius at high severity.", "Recommended immediate rollback of the misconfigured policy."], actions: ["Prepared automated rollback workflow.", "Notified infrastructure team."] },
        ]};
      }
      return null;
    },
  ],

  "Create case": [
    (ctx) => {
      if (ctx.activeModule === "Vulnerability Management") {
        return { modules: [
          { type: "case_summary", caseId: "CASE-4218", title: "Critical CVE on internet-facing build server", severity: "high" as const, owner: "SOC Triage", status: "Created", evidence: ["CVE-2026-1847 confirmed on externally reachable service.", "Build server linked to active lateral movement path.", "Exploit code is publicly available."], nextStep: "Authorize emergency patch" },
          { type: "decision", module: "Vulnerability Management" as SourceModule, severity: "high" as const, title: "Authorize emergency patch for CVE-2026-1847", whyItMatters: "The affected dependency is in an internet-facing service linked to the active attack path.", impact: "Vulnerability eliminated, path severed", primaryAction: "Authorize", secondaryAction: "Defer", tertiaryAction: "View details" },
        ]};
      }
      if (ctx.activeModule === "IAM") {
        return { modules: [
          { type: "case_summary", caseId: "CASE-4220", title: "Over-privileged service principal in attack path", severity: "high" as const, owner: "Identity Team", status: "Created", evidence: ["svc-ci-deploy has unnecessary write access to production.", "Credential exceeds 90-day rotation policy.", "Identity contributes to crown-jewel reachability."], nextStep: "Restrict entitlements and rotate credential" },
          { type: "decision", module: "IAM" as SourceModule, severity: "high" as const, title: "Confirm entitlement reduction for svc-ci-deploy", whyItMatters: "Reducing privileges will revoke write access to production data stores from the compromised service principal.", impact: "Attack path reduced by 1 hop", primaryAction: "Authorize", secondaryAction: "Defer", tertiaryAction: "View details" },
        ]};
      }
      if (ctx.activeModule === "Misconfiguration Management") {
        return { modules: [
          { type: "case_summary", caseId: "CASE-4221", title: "Configuration drift exposing cloud resources", severity: "high" as const, owner: "Cloud Ops", status: "Created", evidence: ["Storage policy change exposed 6 cloud resources.", "2 resources are internet-facing.", "Drift overlaps with a vulnerable workload cluster."], nextStep: "Authorize policy rollback" },
        ]};
      }
      if (ctx.activeModule === "Application Security Management") {
        return { modules: [
          { type: "case_summary", caseId: "CASE-4222", title: "Leaked token and vulnerable dependency in pipeline", severity: "high" as const, owner: "AppSec Team", status: "Created", evidence: ["Leaked admin token found in build artifact.", "Outdated dependency with RCE vulnerability.", "Service is internet-facing and in the active attack path."], nextStep: "Rotate token and patch dependency" },
        ]};
      }
      return null;
    },
  ],

  "Show metrics": [
    (ctx) => {
      if (ctx.activeModule === "Vulnerability Management") {
        return { modules: [Live.buildLiveVulnMetrics(), Live.buildLiveVulnTrend()] };
      }
      if (ctx.activeModule === "IAM") {
        return { modules: [Live.buildLiveIamInsight()] };
      }
      if (ctx.activeModule === "Compliance") {
        return { modules: [Live.buildLiveComplianceMetrics()] };
      }
      return null;
    },
  ],

  "Explain reasoning": [
    (ctx) => {
      /* When investigation is active, show the full narrative story */
      if (ctx.investigationActive) {
        return { modules: [
          Live.buildNarrativeTimeline(),
          Live.buildNarrativeSynthesis(),
        ]};
      }
      if (ctx.activeAnalyst && ctx.activeModule) {
        return { modules: [
          Live.buildNarrativeAnalystDetail(ctx.activeAnalyst as any),
          Live.buildNarrativeInsight(ctx.activeAnalyst as any),
        ]};
      }
      return null;
    },
  ],

  "Show attack path": [
    (ctx) => {
      if (ctx.activeModule === "IAM") {
        return { modules: [
          Live.buildLiveAttackPath(),
          { type: "insight", module: "IAM", severity: "high" as const, title: "Identity exposure in the attack path", description: "The over-privileged service principal svc-ci-deploy sits at the Privileged CI Runner node, providing write access through the path to the production data warehouse.", supportingStats: [{ label: "Identity node", value: "CI Runner" }, { label: "Excess permissions", value: "7" }], actions: ["Restrict access", "Investigate", "Create case"] } as AiRenderableResponse,
        ]};
      }
      if (ctx.activeModule === "Vulnerability Management") {
        return { modules: [
          Live.buildLiveAttackPath(),
          { type: "insight", module: "Vulnerability Management", severity: "critical" as const, title: "CVE-2026-1847 enables path traversal", description: "The exploitable vulnerability on the Compromised App Server is the entry point for lateral movement toward the production data warehouse.", supportingStats: [{ label: "Vulnerable node", value: "App Server" }, { label: "CVSS", value: "9.8" }], actions: ["Patch dependency", "Investigate", "Create case"] } as AiRenderableResponse,
        ]};
      }
      return null;
    },
  ],
};

function resolveContextualModules(
  label: string,
  ctx: InteractionContext,
): { message?: string; modules: AiRenderableResponse[] } | null {
  const overrides = CONTEXTUAL_OVERRIDES[label];
  if (!overrides) return null;
  for (const fn of overrides) {
    const result = fn(ctx);
    if (result) return result;
  }
  return null;
}

/**
 * Deterministic action router with context memory.
 * Checks contextual overrides first, then falls back to ACTION_MAP.
 */
export function buildActionResponse(
  label: string,
  ctx?: InteractionContext,
): { message?: string; ui: React.ReactNode; modules: AiRenderableResponse[] } | null {
  const contextual = ctx ? resolveContextualModules(label, ctx) : null;
  const entry = contextual || ACTION_MAP[label];
  if (!entry) return null;
  const { modules, message } = entry;
  if (modules.length === 0) return null;
  const ui =
    modules.length === 1
      ? renderAiResponse(modules[0])
      : (
          <div className="flex flex-col gap-[8px]">
            {modules.map((mod, i) => (
              <div key={i}>{renderAiResponse(mod)}</div>
            ))}
          </div>
        );
  return { message, ui, modules };
}

/* ═══════════════════════════════════════════════════════════
   Navigation Actions — action labels that trigger route navigation
   ═══════════════════════════════════════════════════════════ */

/** Maps action labels to route paths. AiBox checks this after processing
 *  to determine if navigation should occur after showing the chat response. */
export const ACTION_NAVIGATION: Record<string, string> = {
  "View attack path": "/attack-path/ap-001",
};