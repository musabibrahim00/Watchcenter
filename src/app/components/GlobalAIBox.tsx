/**
 * GlobalAIBox — Single platform-wide AI assistant panel
 *
 * Uses a consistent visual design (avatar header, suggestion chips,
 * chat input) and adapts to page context via AiBoxContext.
 *
 * Rendered once in Layout as a contextual right sidebar.
 * Pages push their context via useAiBox().setPageContext().
 */

import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { Zap } from "lucide-react";
import { toast } from "sonner";
import { colors } from "../shared/design-system/tokens";
import { useAiBox, type AiBoxPageContext } from "../features/ai-box";
import {
  imgAvatar,
  MessageBubble as SharedMessageBubble,
  TypingIndicator,
  ChatInput as SharedChatInput,
  type ChatMessage,
  classifyActionIntent,
  classifyGuardrailLevel,
  matchAction,
  ActionCard,
  ContributingAgentsBlock,
  ActionResultCard,
  ActionFailureCard,
  deriveActionResult,
  deriveActionFailure,
  type ActionCardData,
  type ActionResultData,
} from "../../imports/AiBoxShared";
import { logAction } from "../shared/utils/audit-log";
import svgPaths from "../../imports/svg-sx6d9u7tbs";
import { inferWorkflowAiState, getWorkflowPlaceholder } from "../pages/workflows/workflowAiStates";
import {
  type PlanStep, WORKFLOW_PLANS,
  matchPlanKey, matchTemplateToPlan,
  dispatchCanvasUpdate, type CanvasEditOp, dispatchCanvasEdit, nextEditStepId,
} from "../features/ai-box/workflowAiEngine";
import {
  detectMultiAgentIntent, resolveAnalysts,
  buildMultiAgentExploreResponse,
} from "../features/ai-box/multiAgentEngine";
import {
  InsightCard,
  DecisionCard,
} from "../../imports/AiBoxModules";
import { isReturningUser, getLastVisitLabel, msSinceLastVisit, recordVisit, sealSession } from "../shared/services/SessionAwareness";
import { isChangeSummaryQuery, getChangeReport, type ChangeContext } from "../shared/services/ChangeDetection";
import { emitHighlights } from "../shared/services/HighlightBus";
import {
  isApprovalQuery, isDelegationQuery, isApproveRejectQuery,
  getApprovalQueue, getContextApprovalSummary,
} from "../shared/services/ApprovalQueue";

/* ================================================================
   TYPES  (ChatMessage is imported from AiBoxShared)
   ================================================================ */

/*
 * Workflow plan templates, canvas dispatchers, and multi-agent engine
 * functions are imported from dedicated modules:
 *
 *   workflowAiEngine.ts  — WORKFLOW_PLANS, matchPlanKey, dispatchCanvas*
 *   multiAgentEngine.ts  — detectMultiAgentIntent, resolveAnalysts, ...
 *
 * JSX-producing workflow/multi-agent functions (PlaybookPlanCard,
 * processWorkflowQuery, processMultiAgentQuery) remain below because
 * they depend on React, InsightCard, ActionCard, and other imports
 * already present in this file.
 */

/* ── PlaybookPlanCard — rendered in chat to show generated plan ── */

function PlaybookPlanCard({ steps }: { steps: PlanStep[] }) {
  return (
    <div
      className="rounded-[10px] overflow-hidden"
      style={{
        backgroundColor: colors.bgCard,
        border: `1px solid ${colors.border}`,
      }}
    >
      <div
        className="px-[14px] py-[10px] flex items-center gap-[8px]"
        style={{ borderBottom: `1px solid ${colors.border}` }}
      >
        <Zap size={12} color={colors.accent} strokeWidth={2} />
        <span className="text-[11px]" style={{ color: colors.textPrimary, fontWeight: 600 }}>
          Generated Playbook
        </span>
        <span className="text-[10px] ml-auto" style={{ color: colors.textDim }}>
          {steps.length} steps
        </span>
      </div>
      <div className="px-[14px] py-[12px] space-y-0">
        {steps.map((step, i) => {
          const isLast = i === steps.length - 1;
          const isTrigger = step.type === "trigger";
          return (
            <div key={step.id} className="flex items-stretch gap-[12px]">
              {/* Timeline rail */}
              <div className="flex flex-col items-center shrink-0" style={{ width: 20 }}>
                <div
                  className="size-[20px] rounded-full flex items-center justify-center shrink-0"
                  style={{
                    backgroundColor: isTrigger ? `${colors.accent}20` : `${colors.active}15`,
                    border: `1.5px solid ${isTrigger ? colors.accent : colors.active}`,
                  }}
                >
                  {isTrigger ? (
                    <Zap size={9} color={colors.accent} strokeWidth={2.5} />
                  ) : (
                    <span className="text-[8px]" style={{ color: colors.active, fontWeight: 700 }}>{i}</span>
                  )}
                </div>
                {!isLast && (
                  <div className="flex-1 min-h-[16px]" style={{ width: 2, backgroundColor: colors.border }} />
                )}
              </div>
              {/* Step label */}
              <div className="flex-1 min-w-0 pb-[10px]">
                <div className="flex items-center gap-[6px]">
                  <span
                    className="text-[11px] truncate"
                    style={{
                      color: colors.textPrimary,
                      fontWeight: 500,
                    }}
                  >
                    {step.name}
                  </span>
                  <span
                    className="text-[9px] px-[5px] py-[1px] rounded-[4px] shrink-0"
                    style={{
                      backgroundColor: isTrigger ? `${colors.accent}12` : `${colors.active}10`,
                      color: isTrigger ? colors.accent : colors.active,
                      fontWeight: 600,
                    }}
                  >
                    {isTrigger ? "Trigger" : "Action"}
                  </span>
                  {step.integration && (
                    <span
                      className="text-[8px] px-[4px] py-[1px] rounded-[3px] shrink-0"
                      style={{
                        backgroundColor: `${colors.medium}10`,
                        color: colors.medium,
                        fontWeight: 500,
                      }}
                    >
                      {step.integration}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ================================================================
   MULTI-AGENT ORCHESTRATION
   Pure detection/resolution functions are imported from multiAgentEngine.ts.
   processMultiAgentQuery (below) handles JSX output and stays here.
   ================================================================ */

/** Process a multi-agent query — routes to Action Card or structured response */
function processMultiAgentQuery(
  query: string,
  analysts: string[],
  ctx: AiBoxPageContext | null,
  onModify?: (data: ActionCardData, refinement: string) => void
): { content: string; uiModule?: React.ReactNode } {
  const actionIntent = classifyActionIntent(query);

  if (actionIntent === "act") {
    const actionData = matchAction(query, ctx?.label);
    if (actionData) {
      const enriched: ActionCardData = enrichActionData(
        { ...actionData, participatingAnalysts: actionData.participatingAnalysts ?? analysts },
        query,
        ctx
      );
      logAction({
        user: "current-user",
        pageContext: ctx?.label || "multi-agent",
        actionTitle: enriched.title,
        scope: enriched.scope,
        guardrailLevel: enriched.guardrailLevel ?? "L2",
        approvalStatus: enriched.requiresApproval ? "pending" : "not-required",
        outcome: "initiated",
      });
      const previewText = enriched.isReadOnly
        ? "This action is unavailable in read-only mode."
        : enriched.requiresApproval
          ? `I've prepared a multi-analyst action. This is a **Level 3** action and requires approval before it can run.`
          : `I've prepared a multi-analyst action. Review the participating analysts and parameters, then click **Run** to execute.`;
      return {
        content: previewText,
        uiModule: (
          <div className="flex flex-col gap-[8px]">
            <ContributingAgentsBlock analysts={enriched.participatingAnalysts!} />
            <ActionCard data={enriched} onModify={onModify} />
          </div>
        ),
      };
    }
  }

  /* Explain/explore — return structured response with contributing agents block */
  const exploreResult = buildMultiAgentExploreResponse(query, analysts, ctx);
  return {
    ...exploreResult,
    uiModule: (
      <ContributingAgentsBlock analysts={analysts} />
    ),
  };
}

/* ================================================================
   WORKFLOW RESPONSE ENGINE
   ================================================================ */

function processWorkflowQuery(query: string, ctx: AiBoxPageContext): { content: string; uiModule?: React.ReactNode } {
  const q = query.toLowerCase();
  const isDiagnoseState = ctx.contextKey?.includes("workflow:diagnose:");

  /* ── DIAGNOSE STATE — initial auto-query ── */
  if (isDiagnoseState && q.includes("run full workflow diagnostics")) {
    return {
      content: `Diagnostics complete for **${ctx.label}**. I found 1 critical issue affecting recent runs.`,
      uiModule: (
        <InsightCard
          module="Workflow Diagnostics"
          severity="critical"
          title="Slack Authentication Expired"
          description="The Slack OAuth token used by the Notify Slack step expired 3 days ago. This is the root cause of 3 failures in the last 10 runs."
          supportingStats={[
            { label: "Root Cause", value: "Slack auth expired" },
            { label: "Impact", value: "Notifications not delivered" },
            { label: "Recommended Fix", value: "Reconnect Slack" },
            { label: "Affected Runs", value: "3 of 10" },
            { label: "First Failure", value: "3 days ago" },
          ]}
          actions={["Reconnect Slack", "View failed runs", "Skip notification step"]}
        />
      ),
    };
  }

  /* ── DIAGNOSE STATE — find bottlenecks ── */
  if (q.includes("bottleneck") || (q.includes("find") && q.includes("slow"))) {
    return {
      content: `I've profiled step execution times across the last 10 runs of **${ctx.label}**. Here are the bottlenecks:`,
      uiModule: (
        <InsightCard
          module="Performance Analysis"
          severity="high"
          title="Step Bottleneck — Enrich Alert"
          description="The Enrich Alert step accounts for 62% of total execution time. It waits for sequential responses from VirusTotal, AbuseIPDB, and CMDB before proceeding."
          supportingStats={[
            { label: "Root Cause", value: "Sequential API calls" },
            { label: "Impact", value: "62% of runtime" },
            { label: "Recommended Fix", value: "Parallelize enrichment" },
            { label: "Avg Duration", value: "45s" },
            { label: "P95 Duration", value: "72s" },
          ]}
          actions={["Parallelize enrichment", "Add timeout", "Cache results"]}
        />
      ),
    };
  }

  /* ── DIAGNOSE STATE — summarize workflow health ── */
  if (q.includes("summarize") && q.includes("health")) {
    return {
      content: `Here's the full health summary for **${ctx.label}**:`,
      uiModule: (
        <InsightCard
          module="Health Summary"
          severity="high"
          title="Needs Attention — 1 Critical Issue"
          description="Overall workflow health is degraded due to a Slack integration failure. When Slack is healthy, the workflow completes reliably in under 3 minutes."
          supportingStats={[
            { label: "Root Cause", value: "Slack disconnected" },
            { label: "Impact", value: "30% failure rate" },
            { label: "Recommended Fix", value: "Reconnect Slack" },
            { label: "Healthy Steps", value: "3 of 4" },
            { label: "Avg Runtime", value: "2.5min" },
            { label: "Uptime (30d)", value: "70%" },
          ]}
          actions={["Reconnect Slack", "View failure timeline", "Set up alerts"]}
        />
      ),
    };
  }

  /* ── EXPLAIN STATE HANDLERS ── */
  const isExplainState = ctx.contextKey?.includes("workflow:explain:");

  // Explain this workflow end-to-end
  if ((q.includes("explain") && (q.includes("workflow") || q.includes("end-to-end") || q.includes("end to end"))) || (q.includes("walk") && q.includes("through"))) {
    return {
      content: `Here's how **${ctx.label}** works:\n\n**1. Something happens that needs attention** — When your security tools detect a critical alert (such as suspicious login activity, malware detected, or unauthorized access), this workflow automatically kicks in.\n\n**2. A case is created** — The system opens a new investigation case so the team has a single place to track everything related to this alert.\n\n**3. An analyst is assigned** — The workflow picks the right person on your team and assigns them to investigate, so nothing falls through the cracks.\n\n**4. The team is notified** — A message is sent to your team's Slack channel so everyone knows the alert is being handled and who's responsible.\n\nThe entire process takes about 2–3 minutes from alert to notification, with no manual steps required.`,
    };
  }

  // Explain the trigger
  if (q.includes("trigger") && !q.includes("add") && !q.includes("change")) {
    return {
      content: `**What starts this workflow:**\n\nThis workflow runs automatically whenever your SIEM (your main security monitoring system) detects an alert marked as **Critical** severity.\n\nThink of it like a smoke detector — when the alarm goes off, this workflow is the automatic response that notifies the fire department, dispatches a truck, and alerts the building manager.\n\nYou don't need to press any buttons or check any dashboards. As soon as a critical alert fires, this workflow handles the initial response so your team can focus on the investigation itself.\n\n**Common triggers include:**\n• Malware detected on an endpoint\n• Unauthorized access attempt\n• Data exfiltration alert\n• Brute-force login detected`,
    };
  }

  // What does each step do?
  if (q.includes("step") && (q.includes("what") || q.includes("each") || q.includes("does")) && !q.includes("add") && !q.includes("remove")) {
    return {
      content: `Here's what each step in **${ctx.label}** does:`,
      uiModule: (
        <InsightCard
          module="Step Breakdown"
          severity="info"
          title="What Each Step Does"
          description="A plain-language explanation of every step in this workflow, in the order they run."
          supportingStats={[
            { label: "Alert Trigger", value: "Watches for critical security alerts" },
            { label: "Create Case", value: "Opens an investigation for tracking" },
            { label: "Assign Analyst", value: "Picks the right team member" },
            { label: "Notify Slack", value: "Tells the team what's happening" },
          ]}
          actions={["Explain a specific step", "Why this order?"]}
        />
      ),
    };
  }

  // Why does this workflow exist?
  if (q.includes("why") && (q.includes("exist") || q.includes("purpose") || q.includes("problem"))) {
    return {
      content: `**Why ${ctx.label} exists:**\n\nBefore this workflow, when a critical alert fired, someone had to manually check the dashboard, decide if it was serious, create a ticket, figure out who should investigate, and then message the team. That process could take anywhere from 15 minutes to over an hour — and sometimes alerts were missed entirely.\n\nThis workflow solves that by automating the entire initial response:\n\n• **Speed** — Response time drops from 15+ minutes to under 3 minutes\n• **Consistency** — Every critical alert gets the same thorough response, every time\n• **Accountability** — An analyst is always assigned, so nothing gets lost\n• **Visibility** — The team is notified immediately, so everyone knows what's happening\n\nIn short, it makes sure no critical alert goes unnoticed and the right person is on it within minutes.`,
    };
  }

  // Summarize in plain language
  if (q.includes("summarize") || q.includes("summary") || (q.includes("plain") && q.includes("language")) || q.includes("non-technical") || q.includes("simple")) {
    return {
      content: `**${ctx.label} in one sentence:**\n\nWhen a critical security alert fires, this workflow automatically creates an investigation case, assigns the right analyst, and notifies the team on Slack — all within about 2 minutes, with no manual work required.\n\n**Who it helps:**\n• **SOC analysts** — They get assigned automatically and can start investigating right away\n• **SOC managers** — They have full visibility into every critical alert and who's handling it\n• **The organization** — Critical threats get a consistent, fast response every time`,
    };
  }

  // Generic explain fallback (for explain state only)
  if (isExplainState) {
    return {
      content: `Here's what I can tell you about **${ctx.label}**:\n\nThis is an automated security response workflow that handles the initial response when a critical alert is detected — creating a case, assigning an analyst, and notifying the team.\n\nWant me to go deeper? I can:\n• Explain any specific step\n• Walk through the full workflow end-to-end\n• Explain why each step matters\n• Describe what happens when something goes wrong`,
    };
  }

  /* ── OPTIMIZE STATE HANDLERS ── */
  const isOptimizeState = ctx.contextKey?.includes("workflow:optimize:");

  // Full optimization analysis (initial query or "optimize this workflow")
  if ((q.includes("optimize") && (q.includes("workflow") || q.includes("performance") || q.includes("recent"))) || (q.includes("analyze") && q.includes("optimization"))) {
    return {
      content: `I've reviewed the last 30 days of run data for **${ctx.label}**. Here's what I found:`,
      uiModule: (
        <InsightCard
          module="Optimization Report"
          severity="high"
          title="3 Improvement Opportunities Found"
          description={`Based on 47 recent runs of ${ctx.label}, I identified 3 areas that would meaningfully improve reliability and speed.`}
          supportingStats={[
            { label: "Slack Notification", value: "Failing 23% of the time — token expired" },
            { label: "Assign Analyst Step", value: "Avg 45s — could run in parallel with Case Creation" },
            { label: "No Retry Logic", value: "Steps fail permanently on first error" },
          ]}
          actions={["Reconnect Slack", "Add retry logic", "Add fallback notification"]}
        />
      ),
    };
  }

  // Reduce failures
  if (q.includes("reduce") && q.includes("fail")) {
    return {
      content: `**How to reduce failures in ${ctx.label}:**\n\nI looked at the last 47 runs and found that **78% of failures** come from two root causes:\n\n**1. Slack notification failures (62% of all failures)**\nThe Slack integration token expired 12 days ago. Every run that reaches the "Notify Slack" step fails.\n\n→ **Fix:** Reconnect your Slack integration in Settings → Integrations. This alone would eliminate most failures.\n\n**2. Analyst assignment timeouts (16% of all failures)**\nWhen all analysts in the rotation are unavailable, the "Assign Analyst" step times out after 60 seconds.\n\n→ **Fix:** Add a fallback rule — if no analyst responds in 30 seconds, escalate to the on-call manager.\n\n**Quick wins I can apply now:**`,
      uiModule: (
        <InsightCard
          module="Failure Reduction"
          severity="high"
          title="2 Fixes to Reduce Failures by 78%"
          description="These two changes would bring the failure rate from 23% down to approximately 5%."
          supportingStats={[
            { label: "Current Failure Rate", value: "23% (11 of 47 runs)" },
            { label: "After Fixes", value: "~5% estimated" },
            { label: "Top Cause", value: "Expired Slack token" },
          ]}
          actions={["Reconnect Slack", "Add fallback analyst rule", "Add retry logic"]}
        />
      ),
    };
  }

  // Improve runtime
  if ((q.includes("improve") || q.includes("reduce") || q.includes("speed") || q.includes("faster")) && (q.includes("runtime") || q.includes("time") || q.includes("duration") || q.includes("slow") || q.includes("performance"))) {
    return {
      content: `**Runtime analysis for ${ctx.label}:**\n\nThe average end-to-end runtime is **2 minutes 34 seconds**. Here's where the time goes:\n\n| Step | Avg Duration | % of Total |\n|------|-------------|------------|\n| Alert Trigger | 2s | 1% |\n| Create Case | 18s | 12% |\n| Assign Analyst | 45s | 29% |\n| Notify Slack | 89s | 58% |\n\nThe biggest opportunity is the **Notify Slack** step — it's averaging 89 seconds because it retries on timeout before failing. The second opportunity is running **Create Case** and **Assign Analyst** in parallel instead of sequentially.\n\n**Projected improvement:** These two changes would reduce average runtime from 2m 34s to approximately **1 minute 15 seconds** — a 51% improvement.`,
      uiModule: (
        <InsightCard
          module="Runtime Optimization"
          severity="medium"
          title="Cut Runtime by 51%"
          description="Two changes can reduce average execution time from 2m 34s to ~1m 15s."
          supportingStats={[
            { label: "Current Avg Runtime", value: "2m 34s" },
            { label: "Projected Runtime", value: "~1m 15s" },
            { label: "Slowest Step", value: "Notify Slack (89s)" },
          ]}
          actions={["Fix Slack timeout", "Enable parallel steps", "Add timeout limits"]}
        />
      ),
    };
  }

  // Reduce noise / false positives
  if (q.includes("noise") || q.includes("false positive") || q.includes("alert fatigue") || (q.includes("reduce") && q.includes("alert"))) {
    return {
      content: `**Noise reduction analysis for ${ctx.label}:**\n\nOver the last 30 days, this workflow triggered **47 times**. Based on the case outcomes:\n\n• **29 runs** (62%) resulted in genuine investigations\n• **12 runs** (25%) were closed as false positives within 10 minutes\n• **6 runs** (13%) were duplicates of existing cases\n\n**Recommendations to reduce noise:**\n\n**1. Add a deduplication check** — Before creating a new case, check if an open case already exists for the same alert source. This would eliminate the 6 duplicate runs.\n\n**2. Add an enrichment step before case creation** — Query threat intelligence to score the alert. If the confidence score is below 40%, tag the case as "low confidence" instead of assigning an analyst immediately.\n\n**3. Tune your SIEM trigger** — 8 of the 12 false positives came from the same detection rule. Consider raising the threshold or adding exclusions for known-safe IPs.`,
      uiModule: (
        <InsightCard
          module="Noise Reduction"
          severity="medium"
          title="Reduce Unnecessary Runs by 38%"
          description="Adding deduplication and enrichment would prevent 18 of the 47 recent runs from triggering full investigations."
          supportingStats={[
            { label: "False Positive Rate", value: "25% (12 of 47)" },
            { label: "Duplicate Rate", value: "13% (6 of 47)" },
            { label: "Actionable Runs", value: "62% (29 of 47)" },
          ]}
          actions={["Add deduplication check", "Add enrichment step", "Tune SIEM trigger rule"]}
        />
      ),
    };
  }

  // Add retry logic
  if (q.includes("retry") && (q.includes("add") || q.includes("logic") || q.includes("fail"))) {
    return {
      content: `**Adding retry logic to ${ctx.label}:**\n\nRight now, if any step fails, the entire workflow stops. Here's what I recommend:\n\n**Steps that should have retries:**\n\n• **Notify Slack** — Retry up to 3 times with a 10-second delay between attempts. Slack occasionally returns 503 errors during high-traffic periods.\n\n• **Create Case** — Retry up to 2 times with a 5-second delay. The case management API sometimes throttles requests.\n\n• **Assign Analyst** — No retry needed. If assignment fails, it should escalate rather than retry the same pool.\n\n**Fallback actions I recommend:**\n\n• If Slack fails after 3 retries → send an email notification instead\n• If Case creation fails after 2 retries → log to the audit trail and alert the SOC manager\n\nWant me to apply these retry rules to the workflow?`,
      uiModule: (
        <InsightCard
          module="Retry Logic"
          severity="low"
          title="Retry Rules for 2 Steps"
          description="Adding automatic retries with fallback actions to prevent workflow failures from transient errors."
          supportingStats={[
            { label: "Notify Slack", value: "3 retries, 10s delay, email fallback" },
            { label: "Create Case", value: "2 retries, 5s delay, audit log fallback" },
            { label: "Expected Impact", value: "Eliminate ~15% of failures" },
          ]}
          actions={["Apply retry rules", "Add fallback notification", "Customize retry counts"]}
        />
      ),
    };
  }

  // Improve escalation flow (guard against "add escalation" which is a modification command)
  if (q.includes("escalat") && !q.includes("add") && !q.includes("remove")) {
    return {
      content: `**Escalation flow improvements for ${ctx.label}:**\n\nThe current workflow has a flat structure �� every critical alert gets the same response regardless of severity score, asset criticality, or analyst availability. Here's how to improve it:\n\n**1. Add tiered escalation based on asset criticality**\nIf the affected asset is a production server or contains sensitive data, skip the standard analyst queue and route directly to a senior analyst or the incident commander.\n\n**2. Add a time-based escalation rule**\nIf the assigned analyst hasn't acknowledged the case within 15 minutes, automatically escalate to the SOC manager and send an urgent notification.\n\n**3. Add an approval gate before destructive actions**\nIf the workflow includes containment steps (like disabling accounts or blocking IPs), require manager approval before executing. This prevents accidental disruption from false positives.\n\n**4. Add a notification to security leadership for high-impact cases**\nWhen the alert involves a critical asset or the blast radius exceeds 10 endpoints, send a summary to the CISO channel.`,
      uiModule: (
        <InsightCard
          module="Escalation Improvement"
          severity="medium"
          title="4 Escalation Enhancements"
          description="Add tiered routing, time-based escalation, approval gates, and leadership notifications to improve response quality."
          supportingStats={[
            { label: "Tiered Routing", value: "Route by asset criticality" },
            { label: "Auto-Escalation", value: "15-min acknowledgment SLA" },
            { label: "Approval Gate", value: "Before destructive actions" },
            { label: "Leadership Alert", value: "High-impact cases only" },
          ]}
          actions={["Add approval before escalation", "Add time-based escalation", "Add leadership notification"]}
        />
      ),
    };
  }

  // Reconnect Slack (action from optimization cards)
  if (q.includes("reconnect") && q.includes("slack")) {
    return {
      content: `To reconnect your Slack integration:\n\n1. Go to **Settings → Integrations → Slack**\n2. Click **Reconnect** and authorize with your workspace\n3. Select the notification channel (currently set to #soc-alerts)\n4. Test the connection with a test message\n\nOnce reconnected, the "Notify Slack" step will resume working immediately — no workflow changes needed. Based on recent failures, this single fix would resolve **62% of all workflow failures**.`,
    };
  }

  // Add fallback notification (action from optimization cards)
  if (q.includes("fallback") && q.includes("notification")) {
    return {
      content: `I'll add a fallback notification path to **${ctx.label}**:\n\nIf the Slack notification fails after retries, the workflow will automatically:\n\n1. **Send an email** to the assigned analyst and SOC manager\n2. **Create a PagerDuty alert** if the case severity is Critical\n3. **Log the delivery failure** to the audit trail for tracking\n\nThis ensures your team is always notified even when Slack is unavailable. Want me to apply this change?`,
      uiModule: (
        <InsightCard
          module="Fallback Added"
          severity="low"
          title="Fallback Notification Path"
          description="Email and PagerDuty fallback when Slack delivery fails, ensuring zero missed notifications."
          supportingStats={[
            { label: "Primary", value: "Slack → #soc-alerts" },
            { label: "Fallback 1", value: "Email to analyst + manager" },
            { label: "Fallback 2", value: "PagerDuty (Critical only)" },
          ]}
          actions={["Apply fallback", "Customize channels", "Test fallback path"]}
        />
      ),
    };
  }

  // Generic optimize fallback (for optimize state only)
  if (isOptimizeState) {
    return {
      content: `Here's what I can help you optimize in **${ctx.label}**:\n\n• **Reduce failures** — Fix integration issues and add retry logic\n• **Improve runtime** — Identify slow steps and enable parallel execution\n• **Reduce noise** — Filter false positives and deduplicate alerts\n• **Strengthen escalation** — Add tiered routing and approval gates\n\nTell me which area to focus on, or describe a specific problem you've noticed.`,
    };
  }

  /* ── LIBRARY CUSTOMIZATION STATE HANDLERS ── */
  const isLibraryState = ctx.contextKey?.includes("workflow:library:");

  // Template overview (catches initial prompts from template selection — descriptive sentences)
  if (isLibraryState && (
    (q.startsWith("create ") && !q.includes("step") && q.length > 30) ||
    (q.startsWith("notify ") && q.length > 30) ||
    (q.startsWith("send ") && q.length > 30) ||
    (q.includes("workflow") && (q.includes("scan") || q.includes("enrich") || q.includes("provision") || q.includes("report")))
  )) {
    return {
      content: `I've loaded **${ctx.label}** and here's what it does in plain terms:\n\n${query}\n\nThis template is ready to go — I can deploy it as-is, or you can tell me what to change first.`,
      uiModule: (
        <InsightCard
          module="Template Summary"
          severity="low"
          title={ctx.label}
          description="This template is ready for your workspace. You can customize the steps, change which tools it connects to, or adjust when it runs — just ask."
          supportingStats={[
            { label: "Status", value: "Ready" },
            { label: "Tools needed", value: "3–4" },
            { label: "Can customize", value: "Yes" },
          ]}
          actions={["Deploy now", "Customize first", "Show integrations"]}
        />
      ),
    };
  }

  // 1. Explain this template
  if (isLibraryState && (q.includes("explain") || q.includes("what does") || q.includes("walk me through") || q.includes("how does") || q.includes("step by step"))) {
    return {
      content: `Here's what **${ctx.label}** does, step by step:\n\n1. **Watches for a trigger** — The workflow starts automatically when a specific event happens, like a new alert appearing or a scheduled time arriving.\n\n2. **Gathers context** — It pulls in extra information from your connected tools — things like threat intelligence feeds, asset details, and historical data — so the team has the full picture.\n\n3. **Makes a decision** — Based on severity, affected assets, and your rules, it decides what to do next — escalate, suppress, or take action.\n\n4. **Takes action** — It carries out the response: creating a case, assigning an analyst, sending a notification, or blocking a threat.\n\n5. **Logs everything** — Every step and decision is recorded so you have a clear audit trail.\n\nWant me to customize any of these steps for your environment?`,
      uiModule: (
        <InsightCard
          module="Template Walkthrough"
          severity="low"
          title={ctx.label}
          description="A fully automated response workflow that watches for events, gathers context, decides on a response, takes action, and logs the result."
          supportingStats={[
            { label: "Steps", value: "5" },
            { label: "Fully automated", value: "Yes" },
            { label: "Customizable", value: "Every step" },
            { label: "Typical runtime", value: "~12 seconds" },
          ]}
          actions={["Customize a step", "Deploy as-is", "Change the trigger"]}
        />
      ),
    };
  }

  // 2. Customize this workflow / Customize before creating
  if (isLibraryState && (q.includes("customiz") || q.includes("tailor") || q.includes("modify") || q.includes("personali"))) {
    // Map template name → plan steps for canvas preview
    const planKey = matchTemplateToPlan(ctx.label);
    const plan = WORKFLOW_PLANS[planKey];

    // Dispatch event to create a draft workflow + open on canvas
    window.dispatchEvent(new CustomEvent("workflow-customize-template", {
      detail: {
        templateName: ctx.label,
        steps: plan.steps,
      },
    }));

    return {
      content: `I've opened **${ctx.label}** on the canvas so you can see it while we make changes.\n\nTell me what you'd like to customize — for example:\n• "Add an enrichment step after the trigger"\n• "Change notification from Slack to Jira"\n• "Add an approval checkpoint before escalation"\n• "Only trigger on critical severity"\n\nEvery change shows up on the canvas in real time.`,
    };
  }

  // 3. What integrations are required?
  if (isLibraryState && (q.includes("integrat") || q.includes("require") || q.includes("connect") || q.includes("tool"))) {
    return {
      content: `**${ctx.label}** connects to these tools:\n\n• **Alert source** — Where alerts come from (e.g. Splunk, Microsoft Sentinel, or your SIEM). This is how the workflow knows when to start.\n\n• **Messaging** — Where notifications go (e.g. Slack, Microsoft Teams). Used to alert your team when something happens.\n\n• **Ticketing** — Where cases and tickets are created (e.g. Jira, ServiceNow). Used to track investigations.\n\n• **Threat intelligence** — Where IOC data comes from (e.g. VirusTotal, AbuseIPDB). Used to add context during enrichment.\n\nYou don't need all of these connected right away — you can set them up after deploying. Missing connections will be flagged so nothing runs without the right tools in place.`,
      uiModule: (
        <InsightCard
          module="Required Connections"
          severity="medium"
          title={`Tools for ${ctx.label}`}
          description="These are the external tools this workflow talks to. You can connect them now or after deploying."
          supportingStats={[
            { label: "Alert source", value: "SIEM" },
            { label: "Messaging", value: "Slack / Teams" },
            { label: "Ticketing", value: "Jira / ServiceNow" },
            { label: "Threat intel", value: "VirusTotal" },
          ]}
          actions={["Deploy without all connected", "Help me connect", "Change a tool"]}
        />
      ),
    };
  }

  // 4. Adapt this for critical alerts
  if (isLibraryState && (q.includes("adapt") || q.includes("critical alert") || q.includes("high severity") || q.includes("critical only"))) {
    return {
      content: `Done — I've tailored **${ctx.label}** for critical alerts. Here's what changed:\n\n• **Trigger** now only fires on **Critical** and **High** severity alerts — lower-severity alerts are ignored so your team isn't overwhelmed.\n\n• **Response speed** is set to **immediate** — no delays or batching. Critical alerts go straight to action.\n\n• **Escalation** is turned on — if no analyst picks up the case within 15 minutes, it automatically escalates to the on-call lead.\n\n• **Notification priority** is set to **urgent** — messages are flagged as high-priority in Slack/Teams so they stand out.\n\nWant me to adjust the severity threshold or change the escalation timing?`,
      uiModule: (
        <InsightCard
          module="Template Customized"
          severity="low"
          title="Adapted for Critical Alerts"
          description="Trigger restricted to Critical and High severity. Immediate response with 15-minute escalation window and urgent notification priority."
          supportingStats={[
            { label: "Severity filter", value: "Critical + High" },
            { label: "Response mode", value: "Immediate" },
            { label: "Auto-escalation", value: "15 min" },
            { label: "Notification", value: "Urgent priority" },
          ]}
          actions={["Adjust severity filter", "Change escalation time", "Deploy this version"]}
        />
      ),
    };
  }

  // 5. Add approval before notification
  if (isLibraryState && (q.includes("approval") || q.includes("approve") || q.includes("sign off") || q.includes("checkpoint"))) {
    return {
      content: `Done — I've added an **approval checkpoint** to **${ctx.label}**.\n\nHere's how it works now:\n\n1. The workflow runs normally through detection and enrichment\n2. **Before sending any notification or taking action**, it pauses and asks a team member to review\n3. The approver sees a summary of what happened and what the workflow wants to do\n4. They can **approve** (workflow continues) or **reject** (workflow stops and logs the decision)\n\nThis means no alert goes out and no action is taken without a human confirming it first. The approval request shows up in the Runs tab and can also be sent to Slack.\n\nWant me to change who gets the approval request, or add a time limit?`,
      uiModule: (
        <InsightCard
          module="Template Customized"
          severity="low"
          title="Approval Step Added"
          description="A human review checkpoint has been inserted before the notification step. The workflow pauses until someone approves or rejects."
          supportingStats={[
            { label: "Checkpoint", value: "Before notification" },
            { label: "Approval via", value: "Runs tab + Slack" },
            { label: "Timeout", value: "None (waits indefinitely)" },
            { label: "On reject", value: "Workflow stops" },
          ]}
          actions={["Set approval timeout", "Change approver", "Add second approval"]}
        />
      ),
    };
  }

  // 6. Change notification target
  if (isLibraryState && (q.includes("notification target") || q.includes("change notif") || q.includes("switch notif") || q.includes("send to") || q.includes("notify via") || (q.includes("change") && q.includes("notif")))) {
    return {
      content: `Sure — right now **${ctx.label}** sends notifications to **Slack**. I can change that to any of these:\n\n• **Microsoft Teams** — Posts to a Teams channel instead\n• **Email** — Sends an email to a distribution list or individual\n• **Jira** — Creates a Jira ticket instead of a chat message\n• **PagerDuty** — Pages the on-call analyst\n• **Multiple** — Send to more than one place (e.g. Slack + email)\n\nJust tell me where you want notifications to go. For example: *"Send notifications to Teams and email the SOC lead."*`,
    };
  }

  // 7. Make this manual instead of automatic
  if (isLibraryState && (q.includes("manual") || (q.includes("instead of") && q.includes("auto")))) {
    return {
      content: `Done — **${ctx.label}** is now set to **manual trigger** instead of automatic.\n\nHere's what that means:\n\n• The workflow **won't start on its own** — it only runs when someone clicks "Run" from the Workflows page\n• Everything else stays the same — enrichment, case creation, notification all work as before\n• You can run it whenever you want, as many times as you need\n\nThis is useful when you want to control exactly when the workflow fires — for example, during an active investigation or a scheduled review.\n\nWant me to add a button to run it from a specific page, or keep it in the Workflows area only?`,
      uiModule: (
        <InsightCard
          module="Template Customized"
          severity="low"
          title="Switched to Manual Trigger"
          description="This workflow will only run when manually started by a team member. No automatic triggering."
          supportingStats={[
            { label: "Trigger", value: "Manual only" },
            { label: "Auto-start", value: "Disabled" },
            { label: "Steps", value: "Unchanged" },
            { label: "Run from", value: "Workflows page" },
          ]}
          actions={["Switch back to automatic", "Add schedule option", "Deploy this version"]}
        />
      ),
    };
  }

  // 8. Change trigger (library-specific — no canvas yet)
  if (isLibraryState && q.includes("change") && q.includes("trigger")) {
    return {
      content: `Sure — I can change when **${ctx.label}** starts. Right now it triggers automatically on events. Here are your options:\n\n• **Event-based** (current) — Runs whenever a matching alert or event appears\n• **Scheduled** — Runs on a schedule (daily, weekly, custom cron)\n• **Manual** — Only runs when someone clicks "Run"\n• **Webhook** — Runs when an external system sends a signal\n• **Conditional** — Only triggers when specific criteria are met (e.g. severity = Critical)\n\nJust tell me which one — for example: *"Only trigger on critical severity alerts"* or *"Run every Monday at 9am."*`,
      uiModule: (
        <InsightCard
          module="Trigger Options"
          severity="low"
          title={`Change Trigger for ${ctx.label}`}
          description="Choose when this workflow starts: on events, on a schedule, manually, via webhook, or conditionally."
          supportingStats={[
            { label: "Current", value: "Event-based" },
            { label: "Options", value: "5 trigger types" },
          ]}
          actions={["Critical alerts only", "Run on schedule", "Make manual"]}
        />
      ),
    };
  }

  // Create as is / Deploy (creates a new workflow from the template and navigates to it)
  if (isLibraryState && (q.includes("create this workflow as is") || q.includes("create as is") || q.includes("deploy") || q.includes("use this") || q.includes("create from") || q.includes("as a new workflow") || q.includes("deploy now") || q.includes("deploy this version"))) {
    const planKey = matchTemplateToPlan(ctx.label);
    const plan = WORKFLOW_PLANS[planKey];

    // Dispatch event to WorkflowsIndexPage — it will create the workflow + navigate
    window.dispatchEvent(new CustomEvent("workflow-create-from-template", {
      detail: {
        templateName: ctx.label,
        steps: plan.steps,
      },
    }));

    // Check if there are integrations that need connecting
    const integrations = plan.steps.filter(s => s.integration).map(s => s.integration!);
    const uniqueIntegrations = Array.from(new Set(integrations));
    const hasIntegrations = uniqueIntegrations.length > 0;

    return {
      content: hasIntegrations
        ? `Creating **${ctx.label}**…\n\nThis template uses **${uniqueIntegrations.join(", ")}** — I'll check which integrations need connecting before setting it up.`
        : `**${ctx.label}** has been created and added to your workspace.\n\nIt's saved as a draft — nothing will run automatically until you publish it. You can:\n\n• **Review the steps** on the canvas\n• **Run a test** to see how it behaves\n• **Publish** when you're ready to go live`,
      uiModule: (
        <InsightCard
          module={hasIntegrations ? "Integration Check" : "Created"}
          severity={hasIntegrations ? "medium" : "low"}
          title={hasIntegrations ? `${ctx.label} — Checking Integrations` : `${ctx.label} — Added to Workspace`}
          description={hasIntegrations
            ? `This workflow requires ${uniqueIntegrations.length} integration${uniqueIntegrations.length > 1 ? "s" : ""}. You'll be prompted to connect or skip each one.`
            : "Saved as a draft workflow. Review the steps, connect your tools, and publish when ready."}
          supportingStats={[
            { label: "Status", value: hasIntegrations ? "Checking integrations" : "Draft" },
            { label: "Steps", value: `${plan.steps.length}` },
            ...(hasIntegrations
              ? [{ label: "Integrations", value: uniqueIntegrations.join(", ") }]
              : [{ label: "Next step", value: "Review & publish" }]),
          ]}
          actions={hasIntegrations ? ["Connect all", "Skip & create draft"] : ["Connect tools", "Run a test"]}
        />
      ),
    };
  }

  // Compare templates
  if (isLibraryState && (q.includes("compar") || q.includes("similar") || q.includes("difference") || q.includes("vs"))) {
    return {
      content: `Here's how **${ctx.label}** compares to similar templates:\n\n• **${ctx.label}** — Handles the full cycle: detect, enrich, decide, act, and notify. Best when you want end-to-end automation.\n\n• **Alert Enrichment Only** — Just gathers extra context and stops. Good if your team handles response manually.\n\n• **Simple Notification** — Sends a message when something happens. No enrichment, no case creation.\n\n**${ctx.label}** is the most complete option — it automates the entire response so your team only steps in when needed.\n\nWant me to deploy this one, or would you like to look at a simpler version?`,
    };
  }

  // Generic library fallback — plain-language menu
  if (isLibraryState) {
    return {
      content: `I have **${ctx.label}** loaded. Here's how I can help:\n\n• **Explain** — Walk you through what this template does in plain language\n• **Customize** — Change steps, triggers, notifications, or integrations\n• **Adapt** — Tailor it for critical alerts, specific teams, or your environment\n• **Deploy** — Add it to your workspace as a draft workflow\n\nJust pick one, or describe what you need in your own words.`,
    };
  }

  /* ── MODIFICATION COMMANDS ── */

  // Add enrichment step
  if (q.includes("add") && (q.includes("enrich") || q.includes("enrichment"))) {
    dispatchCanvasEdit({ type: "add-after", afterTemplateId: "alert-trigger", newStep: { id: nextEditStepId(), templateId: "enrich-alert", name: "Enrich Alert", requiresIntegration: "VirusTotal" } });
    return {
      content: `Done — I've added an **Enrich Alert** step to the playbook. It will query VirusTotal and AbuseIPDB for IOC context, and pull asset details from your CMDB.\n\nThe step has been placed after **Alert Trigger** so enrichment data is available for downstream steps.`,
      uiModule: (
        <InsightCard
          module="Workflow Updated"
          severity="low"
          title="Step Added — Enrich Alert"
          description="Queries VirusTotal, AbuseIPDB, and CMDB to enrich alert data with threat intelligence and asset context."
          supportingStats={[
            { label: "Position", value: "After Alert Trigger" },
            { label: "Sources", value: "3 integrations" },
            { label: "Avg Duration", value: "~8s" },
          ]}
          actions={["Customize sources", "Move step", "Undo"]}
        />
      ),
    };
  }

  // Add escalation step
  if (q.includes("add") && q.includes("escalat")) {
    dispatchCanvasEdit({ type: "add-end", newStep: { id: nextEditStepId(), templateId: "escalate", name: "Escalate to Leadership" } });
    return {
      content: `Done — I've added an **Escalate to Leadership** step at the end of the playbook. It will notify security leadership and create an executive summary.\n\nYou can ask me to move it or add an approval gate before it.`,
      uiModule: (
        <InsightCard
          module="Workflow Updated"
          severity="low"
          title="Step Added — Escalate to Leadership"
          description="Escalates the case to Tier 2 and notifies security leadership with an incident summary."
          supportingStats={[
            { label: "Notify", value: "Security Leadership" },
            { label: "Include", value: "Executive Summary" },
            { label: "Tier", value: "Tier 2 Escalation" },
          ]}
          actions={["Add approval gate", "Change notification", "Undo"]}
        />
      ),
    };
  }

  // Add notification step
  if (q.includes("add") && q.includes("notif")) {
    dispatchCanvasEdit({ type: "add-end", newStep: { id: nextEditStepId(), templateId: "notify-slack", name: "Notify Slack", requiresIntegration: "Slack" } });
    return {
      content: `Done — I've added a **Notify Slack** step to the playbook. It will send a notification to #critical-alerts with a summary and case link.\n\nYou can ask me to change the channel or switch to Jira.`,
      uiModule: (
        <InsightCard
          module="Workflow Updated"
          severity="low"
          title="Step Added — Notify Slack"
          description="Sends a notification to the SOC Slack channel with alert summary, severity, and investigation case link."
          supportingStats={[
            { label: "Channel", value: "#critical-alerts" },
            { label: "Integration", value: "Slack" },
            { label: "Content", value: "Alert summary + case link" },
          ]}
          actions={["Change channel", "Switch to Jira", "Undo"]}
        />
      ),
    };
  }

  // Change trigger
  if (q.includes("change") && q.includes("trigger")) {
    dispatchCanvasEdit({ type: "change-trigger", newStep: { id: nextEditStepId(), templateId: "alert-trigger", name: "Modified Trigger" } });
    return {
      content: `Done — I've updated the **trigger** configuration.\n\nTell me more about what should trigger this workflow — for example:\n• "Trigger on high and critical alerts only"\n• "Trigger on a schedule every Monday"\n• "Trigger manually"`,
      uiModule: (
        <InsightCard
          module="Workflow Updated"
          severity="low"
          title="Trigger Modified"
          description="The workflow trigger has been updated. Refine the trigger condition by describing the event type."
          supportingStats={[
            { label: "Type", value: "Event-based" },
            { label: "Status", value: "Updated" },
          ]}
          actions={["Set severity filter", "Switch to schedule", "Undo"]}
        />
      ),
    };
  }

  // Add approval step
  if (q.includes("add") && q.includes("approval")) {
    dispatchCanvasEdit({ type: "add-end", newStep: { id: nextEditStepId(), templateId: "approval", name: "Approval Gate" } });
    const beforeStep = q.includes("before") ? q.split("before")[1]?.trim() : "escalation";
    return {
      content: `Done — I've added an **Approval Gate** step. The workflow will pause and wait for an analyst to approve or reject before continuing.\n\nThis is useful for high-impact actions like account disabling or IP blocking where you want a human in the loop.`,
      uiModule: (
        <InsightCard
          module="Workflow Updated"
          severity="low"
          title="Step Added — Approval Gate"
          description="Pauses workflow execution and sends an approval request. Continues only after an authorized analyst approves."
          supportingStats={[
            { label: "Approvers", value: "SOC Tier 2+" },
            { label: "Timeout", value: "4 hours" },
            { label: "On Reject", value: "Cancel workflow" },
          ]}
          actions={["Change approver group", "Set timeout", "Undo"]}
        />
      ),
    };
  }

  // Change notification to Jira / Replace Slack with Jira
  if ((q.includes("change") || q.includes("replace") || q.includes("switch")) && q.includes("jira")) {
    dispatchCanvasEdit({ type: "replace", oldTemplateId: "notify-slack", newStep: { id: nextEditStepId(), templateId: "notify-jira", name: "Create Jira Ticket", requiresIntegration: "Jira" } });
    return {
      content: `Done — I've replaced the **Notify Slack** step with **Create Jira Ticket**. The workflow will now create a Jira ticket instead of sending a Slack message.\n\nThe ticket will include the alert summary, severity, affected assets, and a link to the investigation case.`,
      uiModule: (
        <InsightCard
          module="Workflow Updated"
          severity="low"
          title="Step Replaced — Notify Slack → Create Jira Ticket"
          description="Replaces the Slack notification with a Jira ticket creation step. All alert context and case details are mapped to Jira fields."
          supportingStats={[
            { label: "Old Step", value: "Notify Slack" },
            { label: "New Step", value: "Create Jira Ticket" },
            { label: "Integration", value: "Jira" },
          ]}
          actions={["Configure Jira project", "Add Slack back", "Undo"]}
        />
      ),
    };
  }

  // Delay / wait step
  if (q.includes("delay") || (q.includes("wait") && !q.includes("waiting"))) {
    const minuteMatch = q.match(/(\d+)\s*min/);
    const minutes = minuteMatch ? minuteMatch[1] : "10";
    dispatchCanvasEdit({ type: "add-end", newStep: { id: nextEditStepId(), templateId: "delay", name: `${minutes}-Minute Delay` } });
    return {
      content: `Done — I've added a **${minutes}-minute delay** before the notification step. The workflow will pause for ${minutes} minutes to allow alert deduplication and correlation before notifying the team.\n\nThis helps reduce alert fatigue from rapid-fire triggers.`,
      uiModule: (
        <InsightCard
          module="Workflow Updated"
          severity="low"
          title={`Step Added — ${minutes}-Minute Delay`}
          description={`Pauses execution for ${minutes} minutes before proceeding. Useful for deduplication windows and batching related alerts.`}
          supportingStats={[
            { label: "Duration", value: `${minutes} min` },
            { label: "Position", value: "Before notification" },
            { label: "Cancellable", value: "Yes" },
          ]}
          actions={["Change duration", "Move delay", "Undo"]}
        />
      ),
    };
  }

  // Add a step (generic)
  if (q.includes("add") && q.includes("step")) {
    // Try to extract what kind of step
    if (q.includes("block") && q.includes("ip")) {
      dispatchCanvasEdit({ type: "add-end", newStep: { id: nextEditStepId(), templateId: "block-ip", name: "Block IP" } });
      return {
        content: `Done — I've added a **Block IP** step to the playbook. It will add the source IP from the alert to your firewall block list.\n\nI recommend adding an approval gate before this step since IP blocking is a high-impact action.`,
        uiModule: (
          <InsightCard
            module="Workflow Updated"
            severity="medium"
            title="Step Added — Block IP"
            description="Adds the malicious source IP to the firewall deny list. Requires firewall integration."
            supportingStats={[
              { label: "Action", value: "Firewall block" },
              { label: "Integration", value: "Firewall API" },
              { label: "Reversible", value: "Yes" },
            ]}
            actions={["Add approval gate", "Set auto-expiry", "Undo"]}
          />
        ),
      };
    }
    if (q.includes("disable") && q.includes("account")) {
      dispatchCanvasEdit({ type: "add-end", newStep: { id: nextEditStepId(), templateId: "approval", name: "Approval Gate" } });
      setTimeout(() => dispatchCanvasEdit({ type: "add-end", newStep: { id: nextEditStepId(), templateId: "disable-account", name: "Disable Account" } }), 400);
      return {
        content: `Done — I've added a **Disable Account** step. It will disable the compromised user account in Active Directory.\n\nThis is a destructive action. I've automatically added an approval gate before it.`,
        uiModule: (
          <InsightCard
            module="Workflow Updated"
            severity="high"
            title="Step Added — Disable Account (with Approval)"
            description="Disables the affected user account in Active Directory. An approval gate has been added before this step."
            supportingStats={[
              { label: "Target", value: "Active Directory" },
              { label: "Approval", value: "Required" },
              { label: "Integration", value: "AD / Azure AD" },
            ]}
            actions={["Change approval rules", "Skip approval", "Undo"]}
          />
        ),
      };
    }
    return {
      content: `I can add a step to your workflow. Here are common options:\n\n• **Enrich Alert** — Add threat intelligence context\n• **Assign Analyst** — Route to a team member\n• **Notify Slack/Jira** — Send notifications\n• **Block IP** — Block malicious IPs\n• **Disable Account** — Disable compromised accounts\n• **Approval Gate** — Require human approval\n• **Delay** — Wait before proceeding\n\nJust tell me which one, or describe what you need in your own words.`,
    };
  }

  // Remove a step
  if (q.includes("remove") || q.includes("delete")) {
    const removeMap: Record<string, string> = {
      "enrich": "enrich-alert", "enrichment": "enrich-alert",
      "case": "create-case", "assign": "assign-analyst", "analyst": "assign-analyst",
      "slack": "notify-slack", "jira": "notify-jira", "notification": "notify-slack", "notify": "notify-slack",
      "approval": "approval", "delay": "delay", "block": "block-ip",
      "disable": "disable-account", "escalat": "escalate", "scan": "run-scan",
    };
    let removedName = "";
    for (const [keyword, templateId] of Object.entries(removeMap)) {
      if (q.includes(keyword)) {
        dispatchCanvasEdit({ type: "remove", templateId });
        removedName = keyword.charAt(0).toUpperCase() + keyword.slice(1);
        break;
      }
    }
    const stepName = removedName || q.replace(/remove|delete|step|the|a /gi, "").trim();
    return {
      content: `Done — I've removed the **${stepName || "selected"}** step from the playbook. The remaining steps have been reconnected.\n\nYou can always add it back by asking me.`,
    };
  }

  // Move / reorder
  if (q.includes("move") || q.includes("reorder")) {
    return {
      content: `Done — I've updated the step order. The playbook canvas now reflects the new sequence.\n\nYou can also click any step and choose **Modify with AI** to fine-tune its position.`,
    };
  }

  // Modify / customize a step
  if (q.includes("modify") || q.includes("customize") || q.includes("change") || q.includes("configure") || q.includes("update")) {
    return {
      content: `I can help modify that step. Tell me what you'd like to change in plain language. For example:\n\n• "Send to #soc-escalations instead of #critical-alerts"\n• "Only assign to Tier 2 analysts"\n• "Include asset owner in the notification"\n• "Change severity filter to High and Critical"\n\nWhat would you like to update?`,
    };
  }

  /* ── DIAGNOSTIC / INSIGHT COMMANDS ── */

  // Create workflow (from New Workflow context — uses plan templates + canvas update)
  const isCreateState = ctx.contextKey?.includes("workflow:create:");
  const planKey = matchPlanKey(q);
  if (isCreateState && planKey) {
    const plan = WORKFLOW_PLANS[planKey];
    // Dispatch canvas update after a short delay (simulates generation)
    setTimeout(() => dispatchCanvasUpdate(plan.steps), 200);
    return {
      content: `I've generated a **${plan.name}** playbook with ${plan.steps.length} steps. The canvas has been updated.`,
      uiModule: <PlaybookPlanCard steps={plan.steps} />,
    };
  }

  // Non-create "create workflow" queries (from edit/other states) — keep original behavior
  if (q.includes("create") && (q.includes("workflow") || q.includes("alert") || q.includes("vulnerability") || q.includes("compliance") || q.includes("remediation"))) {
    const planKey2 = matchPlanKey(q);
    if (planKey2) {
      const plan = WORKFLOW_PLANS[planKey2];
      return {
        content: `I've drafted a **${plan.name}** workflow. Here's the initial playbook:`,
        uiModule: <PlaybookPlanCard steps={plan.steps} />,
      };
    }
    return {
      content: `I can create a workflow for you. Just describe what it should do — for example:\n\n• "When a critical alert fires, create a case and notify Slack"\n• "Scan for vulnerabilities weekly and escalate unpatched ones"\n• "Enrich new assets with CMDB data and assign owners"`,
    };
  }

  // Suggest best workflow for SOC
  if (q.includes("suggest") && (q.includes("best") || q.includes("soc"))) {
    return {
      content: `Based on typical SOC operations, I recommend starting with these high-impact workflows:\n\n1. **Critical Alert Auto-Response** — Automatically triages and routes critical alerts\n2. **Vulnerability Escalation** — Escalates unpatched vulnerabilities after SLA breach\n3. **Asset Discovery Enrichment** — Enriches new assets with CMDB and security context\n\nWould you like me to create any of these?`,
    };
  }

  // Explain template
  if (q.includes("explain") && (q.includes("template") || ctx.contextKey?.includes("template"))) {
    return {
      content: `**${ctx.label}** is a pre-built SOC automation template that provides:\n\n1. **Trigger** — Configured event or schedule-based activation\n2. **Enrichment** — Automatic data gathering from integrated sources\n3. **Action** — Automated response steps with configurable parameters\n4. **Notification** — Team alerts via Slack, Email, or Jira\n\nYou can deploy it as-is or customize any step to match your environment.`,
    };
  }

  // Template integration requirements
  if (q.includes("integration") && (q.includes("required") || ctx.contextKey?.includes("template"))) {
    return {
      content: `**${ctx.label}** requires the following integrations:`,
      uiModule: (
        <InsightCard
          module="Integration Requirements"
          severity="medium"
          title={`Integrations for ${ctx.label}`}
          description="These integrations must be connected before the workflow can be published and executed."
          supportingStats={[
            { label: "Required", value: "Slack, SIEM" },
            { label: "Optional", value: "Jira, PagerDuty" },
            { label: "Status", value: "1 disconnected" },
          ]}
          actions={["Connect Slack", "View all integrations"]}
        />
      ),
    };
  }

  // Run-specific details (from "Ask AI" button in RunsTab)
  if (q.includes("details of run") || q.includes("show me") && q.includes("run")) {
    const runIdMatch = q.match(/run[- ]?([\w-]+)/i);
    const runId = runIdMatch ? runIdMatch[1] : "unknown";
    return {
      content: `Here's the execution summary for **run ${runId}** of **${ctx.label}**:`,
      uiModule: (
        <InsightCard
          module="Run Details"
          severity="low"
          title={`Run ${runId}`}
          description="This run completed the full playbook sequence. All steps executed within normal parameters."
          supportingStats={[
            { label: "Status", value: "Completed" },
            { label: "Duration", value: "2m 18s" },
            { label: "Steps Passed", value: "4 of 4" },
            { label: "Trigger", value: "Event-based" },
          ]}
          actions={["View step details", "Replay this run", "Compare with previous"]}
        />
      ),
    };
  }

  // Why is this workflow failing?
  if (q.includes("why") && (q.includes("fail") || q.includes("error"))) {
    return {
      content: `I've analyzed recent executions for **${ctx.label}**. The primary failure point is the **Notify Slack** step — here's the breakdown:`,
      uiModule: (
        <InsightCard
          module="Failure Diagnosis"
          severity="critical"
          title="Notify Slack — Recurring Failure"
          description="Slack integration authentication has expired, causing 3 out of the last 10 runs to fail at the notification step."
          supportingStats={[
            { label: "Root Cause", value: "Slack auth expired" },
            { label: "Impact", value: "30% failure rate" },
            { label: "Recommended Fix", value: "Reconnect Slack" },
            { label: "Failed Step", value: "Notify Slack" },
            { label: "First Failure", value: "3 days ago" },
          ]}
          actions={["Reconnect Slack", "Add retry logic", "View failed runs"]}
        />
      ),
    };
  }

  // Show recent workflow runs
  if (q.includes("recent") || q.includes("runs") || q.includes("history")) {
    return {
      content: `Here are the recent execution metrics for **${ctx.label}**:`,
      uiModule: (
        <InsightCard
          module="Run Statistics"
          severity="medium"
          title="Execution Overview — Last 10 Runs"
          description="3 of the last 10 runs failed at the Notify Slack step due to an expired integration token. Successful runs complete in under 3 minutes."
          supportingStats={[
            { label: "Root Cause", value: "Slack auth expired" },
            { label: "Impact", value: "3 runs failed" },
            { label: "Recommended Fix", value: "Reconnect Slack" },
            { label: "Success Rate", value: "70%" },
            { label: "Avg Duration", value: "2.5min" },
          ]}
          actions={["View failed runs", "Replay last failure", "Reconnect Slack"]}
        />
      ),
    };
  }

  // Optimize this workflow
  if (q.includes("optim") || q.includes("faster") || q.includes("improve") || q.includes("performance")) {
    return {
      content: `I've identified optimization opportunities for **${ctx.label}**:`,
      uiModule: (
        <DecisionCard
          title="Workflow Optimization"
          module="Performance Analysis"
          severity="medium"
          whyItMatters="The Enrich Alert step takes the longest at ~45 seconds. Running enrichment in parallel with case creation could reduce total execution time by ~35%."
          impact="Estimated execution time reduction from 2.5 minutes to ~1.6 minutes."
          primaryAction="Enable Parallel Execution"
          secondaryAction="Add Caching Layer"
          tertiaryAction="Review step timeouts"
        />
      ),
    };
  }

  // Check integrations
  if (q.includes("integration") || q.includes("connect")) {
    return {
      content: `Here's the integration status for **${ctx.label}**:`,
      uiModule: (
        <InsightCard
          module="Integration Status"
          severity="high"
          title="Slack Integration — Disconnected"
          description="The Slack OAuth token expired 3 days ago. The Notify Slack step cannot deliver messages until the integration is reconnected."
          supportingStats={[
            { label: "Root Cause", value: "OAuth token expired" },
            { label: "Impact", value: "Notifications not delivered" },
            { label: "Recommended Fix", value: "Reconnect Slack" },
            { label: "Affected Steps", value: "Notify Slack" },
            { label: "Other Integrations", value: "All healthy" },
          ]}
          actions={["Reconnect Slack", "Skip notification step", "Replace with Jira"]}
        />
      ),
    };
  }

  // Explain this workflow
  if (q.includes("explain") || q.includes("what does") || q.includes("describe")) {
    return {
      content: `**${ctx.label}** is a SOC automation playbook that:\n\n1. **Triggers** when critical severity alerts are detected\n2. **Creates** an investigation case in Case Management\n3. **Assigns** an analyst from the SOC team\n4. **Notifies** the team via Slack channel\n\nThe workflow runs automatically on alert events and has processed 142 runs to date.`,
    };
  }

  // Health check / diagnostics
  if (q.includes("health") || q.includes("status") || q.includes("diagnos")) {
    return {
      content: `Workflow health assessment for **${ctx.label}**:`,
      uiModule: (
        <InsightCard
          module="Workflow Health"
          severity="high"
          title="Needs Attention — 1 Critical Issue"
          description="Slack notification failed in 3 of the last 10 runs due to expired authentication. All other steps are executing normally."
          supportingStats={[
            { label: "Root Cause", value: "Slack auth expired" },
            { label: "Impact", value: "30% failure rate" },
            { label: "Recommended Fix", value: "Reconnect Slack" },
            { label: "Healthy Steps", value: "3 of 4" },
            { label: "Avg Runtime", value: "2.5min" },
          ]}
          actions={["Reconnect Slack", "View failed runs", "Optimize workflow"]}
        />
      ),
    };
  }

  /* ── SETTINGS CONTEXT HANDLERS ── */

  // Explain variables
  if (q.includes("variable") && (q.includes("explain") || q.includes("what") || q.includes("use"))) {
    return {
      content: `**Variables in ${ctx.label}:**\n\nVariables let you store values that steps can reference — things like channel names, severity thresholds, or team assignments. Instead of hardcoding these into each step, you define them once and reuse them throughout the workflow.\n\n**Current variables:**\n• **alert_severity_threshold** — Minimum severity to trigger (currently: "Critical")\n• **notification_channel** — Where alerts are sent (currently: "#soc-alerts")\n• **assignment_group** — Team that receives assignments (currently: "SOC Tier 1")\n\nYou can change any of these in the Variables section of Settings, or ask me to update them.`,
    };
  }

  // Explain secrets
  if (q.includes("secret") && (q.includes("what") || q.includes("need") || q.includes("explain") || q.includes("help"))) {
    return {
      content: `**Secrets in ${ctx.label}:**\n\nSecrets are encrypted credentials that your workflow uses to connect to external services. They're stored securely and never shown in plain text after creation.\n\n**Required secrets:**\n• **SLACK_BOT_TOKEN** — Authenticates with your Slack workspace\n• **SIEM_API_KEY** — Connects to your SIEM for alert data\n\n**Optional secrets:**\n• **JIRA_API_TOKEN** — Only needed if you add a Jira step\n• **VIRUSTOTAL_API_KEY** — Only needed for enrichment steps\n\nYou can add or rotate secrets in the Secrets section of Settings.`,
    };
  }

  // Explain environments
  if (q.includes("environment") && (q.includes("explain") || q.includes("how") || q.includes("work"))) {
    return {
      content: `**Environments in ${ctx.label}:**\n\nEnvironments let you run the same workflow with different configurations — for example, a "Development" environment that sends notifications to a test channel, and a "Production" environment that sends to the real SOC channel.\n\n**Available environments:**\n• **Production** — Live environment with real integrations\n• **Staging** — Test environment with sandboxed connections\n• **Development** — Local testing with mock responses\n\nEach environment can override variables and secrets without changing the workflow steps. Switch environments in the Environments section of Settings.`,
    };
  }

  // Step-specific explain (from "Explain this step" context menu)
  if (q.includes("how can i custom") || q.includes("what happens if")) {
    if (q.includes("fail")) {
      return {
        content: `When a step fails, the workflow behavior depends on the error handling configuration:\n\n• **Default** — The entire workflow is marked as failed and stops\n• **Retry** — The step is retried up to 3 times with exponential backoff\n• **Skip** — The failed step is skipped and execution continues\n• **Fallback** — An alternative action is executed instead\n\nWould you like me to add error handling to a specific step?`,
      };
    }
    return {
      content: `You can customize any step by telling me what to change. For example:\n\n• "Change the trigger to only fire on High and Critical alerts"\n• "Assign to Tier 2 instead of Tier 1"\n• "Add the asset owner to the Slack notification"\n• "Create the Jira ticket in the Incidents project"\n\nJust describe what you want in plain language and I'll update the step configuration.`,
    };
  }

  // Fallback — workflow-aware help
  return {
    content: `I have **${ctx.label}** loaded. I can help you:\n\n**Build & Edit**\n• Add, remove, or modify steps\n• Reorder the playbook flow\n• Change integrations (Slack → Jira, etc.)\n\n**Monitor & Debug**\n• Diagnose failures\n• View run history\n• Check integration status\n\n**Optimize**\n• Performance improvements\n• Error handling recommendations\n\nJust tell me what you need in plain language.`,
  };
}

/** Enrich ActionCardData with guardrail metadata from the current context */
function enrichActionData(
  data: ActionCardData,
  query: string,
  ctx: AiBoxPageContext | null
): ActionCardData {
  const isReadOnly = ctx?.isReadOnly ?? false;
  const level = data.guardrailLevel ?? classifyGuardrailLevel(query);
  return {
    ...data,
    guardrailLevel: level,
    isReadOnly,
  };
}

function processAgentQuery(query: string, ctx: AiBoxPageContext, onModifyAction?: (data: ActionCardData, refinement: string) => void): { content: string; uiModule?: React.ReactNode } {
  const q = query.toLowerCase();

  /* ── Action Model — classify intent and generate ActionCard for Act-type ── */
  const actionIntent = classifyActionIntent(query);
  if (actionIntent === "act") {
    const actionData = matchAction(query, ctx.label);
    if (actionData) {
      const enriched = enrichActionData(actionData, query, ctx);
      logAction({
        user: "current-user",
        pageContext: ctx?.label || "agent",
        actionTitle: enriched.title,
        scope: enriched.scope,
        guardrailLevel: enriched.guardrailLevel ?? "L2",
        approvalStatus: enriched.requiresApproval ? "pending" : "not-required",
        outcome: "initiated",
      });
      const previewText = enriched.isReadOnly
        ? "This action is unavailable in read-only mode."
        : enriched.requiresApproval
          ? `I've prepared the following action. This is a **Level 3** action and requires approval before it can run.`
          : `I've prepared the following action. Review the parameters and click **Run** to execute, or **Modify** to adjust.`;
      return {
        content: previewText,
        uiModule: (
          <ActionCard
            data={enriched}
            onModify={onModifyAction}
          />
        ),
      };
    }
  }

  if (q.includes("discover") || q.includes("found") || q.includes("identified") || q.includes("what did")) {
    return {
      content: `Here's a summary of **${ctx.label}**'s recent discoveries:`,
      uiModule: (
        <InsightCard
          module="Analyst Discoveries"
          severity="medium"
          title="Recent Findings Summary"
          description="This analyst has identified 4 active findings in the current analysis cycle, including shadow IT exposure and unclassified assets."
          supportingStats={[
            { label: "Active Findings", value: "4" },
            { label: "Confirmed", value: "2" },
            { label: "Monitoring", value: "1" },
            { label: "Resolved", value: "1" },
          ]}
          actions={["View all findings", "Open investigation", "Export report"]}
        />
      ),
    };
  }

  if (q.includes("attack path") || q.includes("lateral") || q.includes("exposure")) {
    return {
      content: `Attack path analysis from **${ctx.label}**:`,
      uiModule: (
        <InsightCard
          module="Attack Path Analysis"
          severity="high"
          title="Critical Exposure Paths Detected"
          description="3 attack paths identified with potential lateral movement to domain admin. The most critical path involves a misconfigured jump server allowing 3-hop access."
          supportingStats={[
            { label: "Attack Paths", value: "3" },
            { label: "Critical", value: "1" },
            { label: "Hops to DA", value: "3" },
            { label: "Blast Radius", value: "12 assets" },
          ]}
          actions={["View attack paths", "Simulate blast radius", "Create case"]}
        />
      ),
    };
  }

  if (q.includes("case") || q.includes("investigation")) {
    return {
      content: `Cases involving **${ctx.label}**:`,
      uiModule: (
        <InsightCard
          module="Case Management"
          severity="medium"
          title="Active Investigations"
          description="This analyst is contributing to 3 active investigation cases, with 2 requiring follow-up action."
          supportingStats={[
            { label: "Active Cases", value: "3" },
            { label: "Pending Action", value: "2" },
            { label: "Resolved (30d)", value: "7" },
          ]}
          actions={["View active cases", "Create new case"]}
        />
      ),
    };
  }

  if (q.includes("risk") || q.includes("trend") || q.includes("score")) {
    return {
      content: `Risk intelligence from **${ctx.label}**:`,
      uiModule: (
        <InsightCard
          module="Risk Analysis"
          severity="high"
          title="Elevated Risk Signals"
          description="Composite risk score has increased 15% over the past 7 days, driven by new vulnerability correlations and credential exposure indicators."
          supportingStats={[
            { label: "Risk Score", value: "78/100" },
            { label: "7d Change", value: "+15%" },
            { label: "Correlated Alerts", value: "187" },
            { label: "Business Impact", value: "High" },
          ]}
          actions={["View risk breakdown", "Drill into signals"]}
        />
      ),
    };
  }

  if (q.includes("vulnerabilit") || q.includes("cve") || q.includes("patch")) {
    return {
      content: `Vulnerability analysis from **${ctx.label}**:`,
      uiModule: (
        <InsightCard
          module="Vulnerability Assessment"
          severity="critical"
          title="Critical Vulnerabilities Requiring Action"
          description="42 critical patches flagged across monitored assets. 3 CVEs have confirmed active exploitation in the wild."
          supportingStats={[
            { label: "Critical CVEs", value: "42" },
            { label: "Actively Exploited", value: "3" },
            { label: "Validated", value: "347" },
            { label: "False Positives", value: "71% reduced" },
          ]}
          actions={["View critical CVEs", "Export vulnerability report"]}
        />
      ),
    };
  }

  if (q.includes("explain") || q.includes("flow") || q.includes("how")) {
    return {
      content: `**${ctx.label}** operates through a continuous analysis cycle:\n\n1. **Collect** — Ingests data from integrated sources (SIEM, CMDB, scanners)\n2. **Analyze** — Applies domain-specific detection logic and pattern matching\n3. **Correlate** — Cross-references findings with threat intelligence and asset context\n4. **Recommend** — Surfaces prioritized insights with recommended actions\n5. **Track** — Monitors remediation progress and updates risk posture\n\nAll findings are automatically linked to relevant cases and attack paths.`,
    };
  }

  // Fallback
  return {
    content: `I have **${ctx.label}** context loaded. I can help you with:\n\n• Understanding discoveries and findings\n• Viewing related attack paths\n• Checking associated cases\n• Analyzing risk trends\n• Explaining the analysis workflow\n\nWhat would you like to know?`,
  };
}

function processGeneralQuery(query: string, ctx: AiBoxPageContext | null, onModifyAction?: (data: ActionCardData, refinement: string) => void): { content: string; uiModule?: React.ReactNode } {
  /* ── Action Model — detect Act-type in general context ── */
  const actionType = classifyActionIntent(query);
  if (actionType === "act") {
    const actionData = matchAction(query, ctx?.label);
    if (actionData) {
      const enriched = enrichActionData(actionData, query, ctx);
      logAction({
        user: "current-user",
        pageContext: ctx?.label || "general",
        actionTitle: enriched.title,
        scope: enriched.scope,
        guardrailLevel: enriched.guardrailLevel ?? "L2",
        approvalStatus: enriched.requiresApproval ? "pending" : "not-required",
        outcome: "initiated",
      });
      const previewText = enriched.isReadOnly
        ? "This action is unavailable in read-only mode."
        : enriched.requiresApproval
          ? `I've prepared the following action. This is a **Level 3** action and requires approval before it can run.`
          : `I've prepared the following action. Review the parameters and click **Run** to execute, or **Modify** to adjust.`;
      return {
        content: previewText,
        uiModule: (
          <ActionCard
            data={enriched}
            onModify={onModifyAction}
          />
        ),
      };
    }
  }

  const label = ctx?.label || "your request";
  return {
    content: `I understand your question about **${label}**. I'm analyzing the available context and will provide insights shortly.\n\nTry asking me about:\n• Workflow health and diagnostics\n• Analyst discoveries and findings\n• Run history and failure patterns\n• Performance optimization\n• Integration status`,
  };
}

/* ================================================================
   MANAGER / APPROVAL RESPONSE ENGINE
   ================================================================ */

/**
 * processApprovalQueueQuery — handles "what needs approval?", "show blocked",
 * "summarize pending decisions", "what should I delegate?" queries.
 *
 * Returns a structured Section 5 format: Pending Approvals / Blocked Items /
 * Highest-Risk Items / Recommended Next Decisions.
 * Respects read-only mode — shows summary but blocks execution.
 */
function processApprovalQueueQuery(
  query: string,
  ctx: AiBoxPageContext | null
): { content: string; uiModule?: React.ReactNode } {
  const isReadOnly = ctx?.isReadOnly ?? false;
  const q = query.toLowerCase();
  const isDelegateOnly = isDelegationQuery(query);

  const queue = getApprovalQueue();
  const ctxSummary = getContextApprovalSummary(ctx?.type ?? "watch-center");

  // Delegation-only variant
  if (isDelegateOnly) {
    const fmt = (items: { title: string; suggestedAssignee: string; rationale: string }[]) =>
      items.map(i => `- **${i.title}** → Suggested: ${i.suggestedAssignee}\n  *${i.rationale}*`).join("\n");

    const content = [
      `## Delegation Candidates`,
      fmt(queue.delegationCandidates),
      ``,
      `## How to Delegate`,
      `Say "Delegate [item name] to [assignee]" and I'll prepare a delegation action for your review.`,
    ].join("\n");

    return {
      content,
      uiModule: (
        <InsightCard
          module="Delegation Queue"
          severity="medium"
          title={`${queue.delegationCandidates.length} items ready for delegation`}
          description={queue.delegationCandidates[0]?.title ?? "Review delegation candidates"}
          supportingStats={[
            { label: "Candidates", value: String(queue.delegationCandidates.length) },
            { label: "Longest pending", value: "2 days" },
            { label: "High priority", value: "1" },
          ]}
          actions={queue.delegationCandidates.slice(0, 2).map(d => `Delegate to ${d.suggestedAssignee}`)}
        />
      ),
    };
  }

  // Blocked-only variant
  const isBlockedOnly = /blocked/i.test(q) && !/approval|pending|delegate/i.test(q);
  if (isBlockedOnly) {
    const fmt = (items: { title: string; description: string }[]) =>
      items.map(i => `- **${i.title}**\n  ${i.description}`).join("\n");

    return {
      content: [
        `## Blocked Items`,
        fmt(queue.blockedItems),
        ``,
        isReadOnly
          ? `**Note:** Approval and delegation actions are unavailable in read-only mode.`
          : `To unblock items, use "Approve [item]" or "Delegate [item]".`,
      ].join("\n"),
      uiModule: (
        <InsightCard
          module="Blocked Items"
          severity="high"
          title={`${queue.blockedItems.length} items blocked`}
          description={queue.blockedItems[0]?.description ?? "Items waiting for decision"}
          supportingStats={[
            { label: "Blocked", value: String(queue.blockedItems.length) },
            { label: "Awaiting approval", value: String(queue.blockedItems.filter(b => b.blockedReason === "awaiting-approval").length) },
            { label: "Missing assignment", value: String(queue.blockedItems.filter(b => b.blockedReason === "missing-assignment").length) },
          ]}
          actions={isReadOnly ? [] : ["Approve blocked item", "Delegate to owner", "Diagnose workflow"]}
        />
      ),
    };
  }

  // Full approval queue summary
  const fmtApprovals = (items: typeof queue.pendingApprovals) =>
    items.map(i => `- **${i.title}** — pending ${i.pendingSince} (submitted by ${i.submittedBy})`).join("\n");

  const fmtBlocked = (items: typeof queue.blockedItems) =>
    items.map(i => `- **${i.title}**`).join("\n");

  const fmtRisk = (items: typeof queue.highRiskItems) =>
    items.map(i => `- **${i.title}** — ${i.description}`).join("\n");

  const fmtDecisions = (items: string[]) =>
    items.map(i => `- ${i}`).join("\n");

  const readOnlyNote = isReadOnly
    ? `\n\n> **Read-only mode:** Approvals and delegation are unavailable. Summaries are still available for review.`
    : "";

  const content = [
    `## Pending Approvals`,
    fmtApprovals(queue.pendingApprovals),
    ``,
    `## Blocked Items`,
    fmtBlocked(queue.blockedItems),
    ``,
    `## Highest-Risk Items`,
    fmtRisk(queue.highRiskItems),
    ``,
    `## Recommended Next Decisions`,
    fmtDecisions(queue.recommendedDecisions),
    readOnlyNote,
  ].join("\n");

  const topApproval = queue.pendingApprovals[0];

  return {
    content,
    uiModule: topApproval ? (
      <InsightCard
        module="Approval Queue"
        severity={topApproval.severity === "critical" ? "critical" : "high"}
        title={`${queue.pendingApprovals.length} pending approval${queue.pendingApprovals.length !== 1 ? "s" : ""}, ${queue.blockedItems.length} blocked`}
        description={topApproval.title}
        supportingStats={[
          { label: "Pending approvals", value: String(queue.pendingApprovals.length) },
          { label: "Blocked items",     value: String(queue.blockedItems.length) },
          { label: "Delegation needed", value: String(queue.delegationCandidates.length) },
        ]}
        actions={isReadOnly
          ? ["View pending approvals"]
          : ["Approve top item", "Show blocked workflows", "What should I delegate?"]}
      />
    ) : undefined,
  };
}

/**
 * processApproveRejectQuery — handles direct "approve this" / "reject this" commands.
 * Routes to an ActionCard with appropriate guardrail level and audit logging.
 */
function processApproveRejectQuery(
  query: string,
  ctx: AiBoxPageContext | null,
  onModifyAction?: (data: ActionCardData, refinement: string) => void
): { content: string; uiModule?: React.ReactNode } {
  const isReadOnly = ctx?.isReadOnly ?? false;
  if (isReadOnly) {
    return {
      content: "Approvals and delegation are unavailable in read-only mode. Switch to live view to execute decisions.",
    };
  }

  const isApprove = /^approve/i.test(query.trim());
  const actionData = matchAction(query, ctx?.label);

  if (actionData) {
    const enriched: ActionCardData = {
      ...enrichActionData(actionData, query, ctx),
      guardrailLevel: "L3",
      requiresApproval: true,
    };
    logAction({
      user: "current-user",
      pageContext: ctx?.label || "approval",
      actionTitle: enriched.title,
      scope: enriched.scope,
      guardrailLevel: "L3",
      approvalStatus: "pending",
      outcome: "initiated",
      decisionType: isApprove ? "approved" : "rejected",
    });
    const previewText = isApprove
      ? `I've prepared this approval for your confirmation. This is a **Level 3** decision — review the parameters and click **Run** to authorize.`
      : `I've prepared this rejection for your confirmation. Once confirmed, the action will be returned to the submitter as declined.`;
    return {
      content: previewText,
      uiModule: <ActionCard data={enriched} onModify={onModifyAction} />,
    };
  }

  // No matching action — show the approval queue as context
  return processApprovalQueueQuery(query, ctx);
}

/**
 * processDelegationQuery — handles "delegate [item] to [assignee]" commands.
 */
function processDelegationQuery(
  query: string,
  ctx: AiBoxPageContext | null,
  onModifyAction?: (data: ActionCardData, refinement: string) => void
): { content: string; uiModule?: React.ReactNode } {
  const isReadOnly = ctx?.isReadOnly ?? false;
  if (isReadOnly) {
    return {
      content: "Delegation is unavailable in read-only mode. Switch to live view to assign items.",
    };
  }

  const actionData = matchAction(query, ctx?.label);
  if (actionData) {
    const enriched = enrichActionData(actionData, query, ctx);
    const delegateTo = (query.match(/to\s+(.+?)(?:\s+now)?$/i)?.[1] ?? "SOC Lead").trim();
    logAction({
      user: "current-user",
      pageContext: ctx?.label || "delegation",
      actionTitle: enriched.title,
      scope: enriched.scope,
      guardrailLevel: enriched.guardrailLevel ?? "L2",
      approvalStatus: "not-required",
      outcome: "initiated",
      delegateTo,
    });
    return {
      content: `I've prepared a delegation action. Review the assignee and scope, then click **Run** to delegate.`,
      uiModule: <ActionCard data={enriched} onModify={onModifyAction} />,
    };
  }

  // No specific action matched — show delegation candidates
  return processApprovalQueueQuery(query, ctx);
}

/* ================================================================
   CHANGE SUMMARY RESPONSE ENGINE
   ================================================================ */

/** Map AiBoxPageContext type → ChangeContext for the change detection model */
function resolveChangeContext(ctx: AiBoxPageContext | null): ChangeContext {
  if (!ctx) return "watch-center";
  if (ctx.type === "workflow") return "workflow";
  if (ctx.type === "agent")   return "watch-center"; // agents summarize at watch-center level
  if (ctx.type === "asset")   return "asset";
  // Detect compliance and attack-path via contextKey or label
  if (ctx.contextKey?.includes("compliance") || ctx.label?.toLowerCase().includes("compliance")) return "compliance";
  if (ctx.contextKey?.includes("attack-path") || ctx.label?.toLowerCase().includes("attack path")) return "attack-path";
  return "watch-center";
}

function processChangeSummaryQuery(
  query: string,
  ctx: AiBoxPageContext | null
): { content: string; uiModule?: React.ReactNode } {
  const sinceLabel  = getLastVisitLabel();
  const sinceMs     = msSinceLastVisit() ?? 0;
  const changeCtx   = resolveChangeContext(ctx);
  const report      = getChangeReport(changeCtx, sinceLabel, sinceMs);

  // Emit highlights for referenced page elements
  const refItems = [...report.newlyImportant, ...report.summary].filter(i => i.reference);
  if (refItems.length > 0) {
    emitHighlights(refItems.map(i => ({ page: i.reference!.page, itemId: i.reference!.itemId })));
  }

  if (!report.hasChanges) {
    return {
      content: `Nothing materially changed since ${sinceLabel}.\n\nThe highest priority item remains **${report.fallbackPriority ?? "the current open issues"}**.`,
    };
  }

  const fmt = (items: { summary: string }[]) =>
    items.map(i => `- ${i.summary}`).join("\n");

  const content = [
    `## Summary`,
    fmt(report.summary),
    ``,
    `## Newly Important`,
    fmt(report.newlyImportant),
    ``,
    `## Resolved`,
    fmt(report.resolved),
    ``,
    `## What to Review Next`,
    fmt(report.reviewNext),
  ].join("\n");

  // Surface the top-priority item as an InsightCard for visual emphasis
  const topItem = report.newlyImportant[0] ?? report.summary[0];
  const uiModule = topItem ? (
    <InsightCard
      module="Since Your Last Visit"
      severity={topItem.severity === "critical" ? "critical" : topItem.severity === "warning" ? "high" : "medium"}
      title={`${report.summary.length} change${report.summary.length !== 1 ? "s" : ""} since ${sinceLabel}`}
      description={topItem.summary}
      supportingStats={[
        { label: "Newly important", value: String(report.newlyImportant.length) },
        { label: "Resolved",        value: String(report.resolved.length) },
        { label: "Review next",     value: String(report.reviewNext.length) },
      ]}
      actions={report.reviewNext.slice(0, 2).map(r => r.summary.replace(/^Review\s+/i, "").split(" ").slice(0, 4).join(" "))}
    />
  ) : undefined;

  return { content, uiModule };
}

/* ================================================================
   COMPONENT
   ================================================================ */

function GlobalAIBoxInner() {
  const { isOpen, pageContext, pendingEntryQuery, setPendingEntryQuery } = useAiBox();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [runningAction, setRunningAction] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const prevContextKeyRef = useRef<string>("");
  const prevInitialQueryRef = useRef<string>("");
  const returning = useMemo(() => isReturningUser(), []);

  /* ── Session awareness — record visit on open, seal on close/unmount ── */
  useEffect(() => {
    if (!isOpen) return;
    recordVisit(pageContext?.label ?? "Watch Center");
    const onHide = () => { if (document.visibilityState === "hidden") sealSession(); };
    document.addEventListener("visibilitychange", onHide);
    return () => {
      document.removeEventListener("visibilitychange", onHide);
    };
  }, [isOpen, pageContext?.label]);
  useEffect(() => () => { sealSession(); }, []);

  /* ── Action status events from ActionCard ── */
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as {
        running: boolean;
        title: string;
        completed?: boolean;
        failed?: boolean;
        analystCount?: number;
        actionData?: ActionCardData;
      };

      if (detail.running) {
        setRunningAction(detail.title);
        return;
      }

      setRunningAction(null);

      if (detail.completed && detail.actionData) {
        /* Derive structured result and dispatch page-refresh event */
        const result: ActionResultData = deriveActionResult(detail.actionData);
        window.dispatchEvent(new CustomEvent("aibox-page-refresh", {
          detail: { resultType: result.resultType, scope: detail.actionData.scope },
        }));

        /* Append "What changed" summary to chat */
        setMessages(prev => [
          ...prev,
          {
            id: crypto.randomUUID(),
            role: "agent" as const,
            text: "",
            timestamp: new Date(),
            renderedUI: <ActionResultCard result={result} />,
          },
        ]);

        /* Toast for quick confirmation */
        const analystCount = detail.analystCount;
        toast.success("Action completed", {
          description: analystCount && analystCount > 1
            ? `${detail.title} finished across ${analystCount} analysts. Results updated.`
            : `${detail.title} finished. Results updated.`,
          duration: 3000,
        });
      } else if (detail.failed && detail.actionData) {
        /* Derive failure info and append failure card to chat */
        const failure = deriveActionFailure(detail.actionData);
        setMessages(prev => [
          ...prev,
          {
            id: crypto.randomUUID(),
            role: "agent" as const,
            text: "",
            timestamp: new Date(),
            renderedUI: <ActionFailureCard failure={failure} />,
          },
        ]);

        toast.error("Action failed", {
          description: `${detail.title} could not be completed.`,
          duration: 3500,
        });
      }
    };
    window.addEventListener("globalaibox-action-status", handler);
    return () => window.removeEventListener("globalaibox-action-status", handler);
  }, []);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
  }, []);

  useEffect(() => { scrollToBottom(); }, [messages, isProcessing, scrollToBottom]);

  /* ── External query injection bridge (from page capability buttons) ── */
  const handleSendRef = useRef<((text: string) => void) | null>(null);
  useEffect(() => {
    const handler = (e: Event) => {
      const query = (e as CustomEvent).detail?.query;
      if (query && handleSendRef.current) handleSendRef.current(query);
    };
    window.addEventListener("globalaibox-inject-query", handler);
    return () => window.removeEventListener("globalaibox-inject-query", handler);
  }, []);

  // Preserve chat history across context changes; add a subtle divider when switching
  const contextKey = pageContext?.contextKey || pageContext?.label || "";
  useEffect(() => {
    if (contextKey === prevContextKeyRef.current) return;
    const isFirstLoad = prevContextKeyRef.current === "";
    prevContextKeyRef.current = contextKey;
    prevInitialQueryRef.current = "";

    if (isFirstLoad) {
      // Initial page load — show greeting or start empty
      if (pageContext?.greeting) {
        setMessages([{
          id: crypto.randomUUID(),
          role: "agent",
          text: pageContext.greeting,
          timestamp: new Date(),
        }]);
      } else {
        setMessages([]);
      }
    } else {
      // Context switch — keep history, append a subtle separator
      if (!pageContext?.label) return;
      const switchLabel = pageContext.label;
      setMessages(prev => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "divider" as const,
          text: switchLabel,
          timestamp: new Date(),
        },
        ...(pageContext?.greeting ? [{
          id: crypto.randomUUID(),
          role: "agent" as const,
          text: pageContext.greeting,
          timestamp: new Date(),
        }] : []),
      ]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contextKey]);

  // Handle initial query (from "View AI Insights" button)
  useEffect(() => {
    if (!pageContext?.initialQuery || !isOpen) return;
    const queryKey = `${contextKey}:${pageContext.initialQuery}`;
    if (prevInitialQueryRef.current === queryKey) return;
    prevInitialQueryRef.current = queryKey;

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      text: pageContext.initialQuery,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMsg]);
    setIsProcessing(true);

    setTimeout(() => {
      const result = isChangeSummaryQuery(pageContext.initialQuery!)
        ? processChangeSummaryQuery(pageContext.initialQuery!, pageContext)
        : isApproveRejectQuery(pageContext.initialQuery!)
        ? processApproveRejectQuery(pageContext.initialQuery!, pageContext, handleModifyAction)
        : isDelegationQuery(pageContext.initialQuery!)
        ? processDelegationQuery(pageContext.initialQuery!, pageContext, handleModifyAction)
        : isApprovalQuery(pageContext.initialQuery!)
        ? processApprovalQueueQuery(pageContext.initialQuery!, pageContext)
        : detectMultiAgentIntent(pageContext.initialQuery!)
        ? processMultiAgentQuery(pageContext.initialQuery!, resolveAnalysts(pageContext.initialQuery!, pageContext), pageContext, handleModifyAction)
        : pageContext?.type === "workflow"
        ? processWorkflowQuery(pageContext.initialQuery!, pageContext)
        : pageContext?.type === "agent"
        ? processAgentQuery(pageContext.initialQuery!, pageContext, handleModifyAction)
        : processGeneralQuery(pageContext.initialQuery!, pageContext, handleModifyAction);

      const newMsgs: ChatMessage[] = [];
      if (result.uiModule && result.content) {
        newMsgs.push({ id: crypto.randomUUID(), role: "agent", text: result.content, timestamp: new Date() });
        newMsgs.push({ id: crypto.randomUUID(), role: "agent", text: "", timestamp: new Date(), renderedUI: result.uiModule });
      } else if (result.uiModule) {
        newMsgs.push({ id: crypto.randomUUID(), role: "agent", text: "", timestamp: new Date(), renderedUI: result.uiModule });
      } else {
        newMsgs.push({ id: crypto.randomUUID(), role: "agent", text: result.content, timestamp: new Date() });
      }
      setMessages(prev => [...prev, ...newMsgs]);
      setIsProcessing(false);
    }, 800);
  }, [pageContext?.initialQuery, isOpen, contextKey]);

  // Inject deep-link entry query once the page context has settled.
  // pendingEntryQuery is set by useAiBoxDeepLink before the page renders, so
  // when the page calls openWithContext() it would overwrite initialQuery.
  // This effect fires after the context is stable and sends the query.
  useEffect(() => {
    if (!pendingEntryQuery || !isOpen) return;
    const query = pendingEntryQuery;
    setPendingEntryQuery(null);

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      text: query,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMsg]);
    setIsProcessing(true);

    setTimeout(() => {
      const result = isChangeSummaryQuery(query)
        ? processChangeSummaryQuery(query, pageContext)
        : isApproveRejectQuery(query)
        ? processApproveRejectQuery(query, pageContext, handleModifyAction)
        : isDelegationQuery(query)
        ? processDelegationQuery(query, pageContext, handleModifyAction)
        : isApprovalQuery(query)
        ? processApprovalQueueQuery(query, pageContext)
        : detectMultiAgentIntent(query)
        ? processMultiAgentQuery(query, resolveAnalysts(query, pageContext), pageContext, handleModifyAction)
        : pageContext?.type === "workflow"
        ? processWorkflowQuery(query, pageContext)
        : pageContext?.type === "agent"
        ? processAgentQuery(query, pageContext, handleModifyAction)
        : processGeneralQuery(query, pageContext, handleModifyAction);

      const newMsgs: ChatMessage[] = [];
      if (result.uiModule && result.content) {
        newMsgs.push({ id: crypto.randomUUID(), role: "agent", text: result.content, timestamp: new Date() });
        newMsgs.push({ id: crypto.randomUUID(), role: "agent", text: "", timestamp: new Date(), renderedUI: result.uiModule });
      } else if (result.uiModule) {
        newMsgs.push({ id: crypto.randomUUID(), role: "agent", text: "", timestamp: new Date(), renderedUI: result.uiModule });
      } else {
        newMsgs.push({ id: crypto.randomUUID(), role: "agent", text: result.content, timestamp: new Date() });
      }
      setMessages(prev => [...prev, ...newMsgs]);
      setIsProcessing(false);
    }, 800);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingEntryQuery, isOpen]);

  // Prepend a "what changed" chip for returning users — before standard chips
  const suggestions = useMemo(() => {
    const base = pageContext?.suggestions || [];
    if (!returning) return base;
    const returningChip = {
      label: "What changed since my last visit?",
      prompt: "What changed since my last visit?",
    };
    // Avoid duplicate if already in base
    if (base.some(s => s.prompt === returningChip.prompt)) return base;
    return [returningChip, ...base];
  }, [pageContext?.suggestions, returning]);

  /* ── Modify callback for ActionCard — no-op; inline editing handled by ActionCard itself ── */
  const handleModifyAction = useCallback((_actionData: ActionCardData, _refinement: string) => {
    // Modification is now handled inline within the ActionCard component.
    // This callback is kept for API compatibility but performs no action.
  }, []);

  const handleSend = useCallback((promptText?: string) => {
    const messageText = promptText || inputValue;
    if (!messageText.trim() || isProcessing) return;

    const userMsg: ChatMessage = { id: crypto.randomUUID(), role: "user", text: messageText, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInputValue("");

    // Reset textarea height
    const ta = document.querySelector("[data-name='GlobalInputArea'] textarea") as HTMLTextAreaElement | null;
    if (ta) ta.style.height = "40px";

    setIsProcessing(true);

    /* Block L2/L3 actions in read-only mode before processing */
    if (pageContext?.isReadOnly && classifyGuardrailLevel(messageText) !== "L1") {
      setTimeout(() => {
        setMessages(prev => [...prev, {
          id: crypto.randomUUID(),
          role: "agent" as const,
          text: "This action is unavailable in read-only mode. Switch to live view to execute changes.",
          timestamp: new Date(),
        }]);
        setIsProcessing(false);
      }, 300);
      return;
    }

    setTimeout(() => {
      const result = isChangeSummaryQuery(messageText)
        ? processChangeSummaryQuery(messageText, pageContext)
        : isApproveRejectQuery(messageText)
        ? processApproveRejectQuery(messageText, pageContext, handleModifyAction)
        : isDelegationQuery(messageText)
        ? processDelegationQuery(messageText, pageContext, handleModifyAction)
        : isApprovalQuery(messageText)
        ? processApprovalQueueQuery(messageText, pageContext)
        : detectMultiAgentIntent(messageText)
        ? processMultiAgentQuery(messageText, resolveAnalysts(messageText, pageContext), pageContext, handleModifyAction)
        : pageContext?.type === "workflow"
        ? processWorkflowQuery(messageText, pageContext!)
        : pageContext?.type === "agent"
        ? processAgentQuery(messageText, pageContext!, handleModifyAction)
        : processGeneralQuery(messageText, pageContext, handleModifyAction);

      const newMsgs: ChatMessage[] = [];
      if (result.uiModule && result.content) {
        newMsgs.push({ id: crypto.randomUUID(), role: "agent", text: result.content, timestamp: new Date() });
        newMsgs.push({ id: crypto.randomUUID(), role: "agent", text: "", timestamp: new Date(), renderedUI: result.uiModule });
      } else if (result.uiModule) {
        newMsgs.push({ id: crypto.randomUUID(), role: "agent", text: "", timestamp: new Date(), renderedUI: result.uiModule });
      } else {
        newMsgs.push({ id: crypto.randomUUID(), role: "agent", text: result.content, timestamp: new Date() });
      }
      setMessages(prev => [...prev, ...newMsgs]);
      setIsProcessing(false);
    }, 700);
  }, [inputValue, isProcessing, pageContext, handleModifyAction]);

  const onSend = useCallback(() => handleSend(), [handleSend]);

  /* Keep ref in sync for external injection */
  useEffect(() => { handleSendRef.current = handleSend; }, [handleSend]);

  // No-op action handler (SharedMessageBubble expects it)
  const handleAction = useCallback(() => {}, []);

  if (!isOpen) return null;

  const contextSubtitle = pageContext?.sublabel || "Digital Security Teammate";

  const placeholder = (() => {
    const wfState = inferWorkflowAiState(pageContext?.contextKey);
    if (wfState && pageContext) return getWorkflowPlaceholder(wfState, pageContext.label);
    if (pageContext?.type === "agent") return `Ask ${pageContext.label} about findings, risks, or tasks...`;
    if (pageContext) return `Ask about ${pageContext.label}...`;
    return "Ask Alex anything...";
  })();

  /* ── Custom send icon — matches Watch Center AiBox ── */
  const sendIcon = (
    <div className="overflow-clip relative shrink-0 size-[24px]">
      <div className="-translate-x-1/2 -translate-y-1/2 absolute left-1/2 size-[16px] top-1/2"/>
      <div className="absolute inset-[16.67%]"><div className="absolute inset-[-3.13%]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 17.0009 17.0009"><path d={svgPaths.p32950080} stroke="var(--stroke-0, #F1F3FF)" strokeLinecap="round" strokeLinejoin="round"/></svg>
      </div></div>
    </div>
  );

  return (
    <div
      className="bg-[rgba(3,6,9,0.16)] relative rounded-[16px] size-full min-h-0"
      data-name="GlobalAIBox"
      style={{
        border: "1px solid #0e1c28",
        boxShadow: "0px 24px 48px 0px rgba(0,0,0,0.52), inset 0 0 0 1px rgba(87,177,255,0.18)",
      }}
    >
      <div className="content-stretch flex flex-col isolate items-center overflow-hidden relative rounded-[inherit] size-full min-h-0">

        {/* ── Header ── */}
        <div className="relative shrink-0 w-full z-[3]">
          <div aria-hidden="true" className="absolute border-[#172a3c] border-b border-solid inset-0 pointer-events-none" />
          <div className="flex flex-row items-center size-full">
            <div className="content-stretch flex items-center justify-between p-[16px] relative size-full">
              {/* Teammate */}
              <div className="content-stretch flex gap-[8px] items-center relative min-w-0">
                <div className="relative rounded-[96px] shrink-0 size-[32px]">
                  <div className="overflow-clip relative rounded-[inherit] size-full">
                    <div className="absolute inset-[-2.94%]"><div className="absolute inset-0 overflow-hidden pointer-events-none"><img alt="" className="absolute left-0 max-w-none size-full top-0" src={imgAvatar} /></div></div>
                  </div>
                  <div aria-hidden="true" className="absolute border-0 border-[#1e2a34] border-solid inset-0 pointer-events-none rounded-[96px]" />
                </div>
                <div className="flex flex-col min-w-0">
                  <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[14px] not-italic relative shrink-0 text-[#dadfe3] text-[12px] whitespace-nowrap">Alex</p>
                  <p className="font-['Inter:Regular',sans-serif] font-normal leading-[14px] not-italic relative shrink-0 text-[#5a6e84] text-[10px] whitespace-nowrap mt-[2px]">Digital Security Teammate</p>
                </div>
              </div>
              {/* Status indicator */}
              <div className="content-stretch flex gap-[8px] items-center relative shrink-0">
                <div
                  className="flex items-center gap-[4px] px-[6px] py-[2px] rounded-[4px] transition-all duration-300"
                  style={{
                    background: runningAction ? "rgba(59,130,246,0.06)" : "rgba(87,177,255,0.06)",
                    border: `1px solid ${runningAction ? "rgba(59,130,246,0.20)" : "rgba(87,177,255,0.12)"}`,
                  }}
                >
                  <span className="relative size-[6px] shrink-0">
                    <span
                      className={`absolute inset-0 rounded-full ${runningAction ? "animate-pulse" : ""}`}
                      style={{ backgroundColor: runningAction ? "#3b82f6" : "#57b1ff" }}
                    />
                  </span>
                  <span
                    className="font-['Inter:Medium',sans-serif] text-[8px] leading-[11px] uppercase tracking-wider transition-colors duration-300"
                    style={{ color: runningAction ? "#3b82f6" : "#57b1ff" }}
                  >
                    {runningAction ? "Running" : "Standby"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Context strip — shown when a page context is active ── */}
        {pageContext && (
          <div className="relative shrink-0 w-full z-[2] px-[16px] py-[8px] flex flex-col gap-[3px]"
            style={{ borderBottom: "1px solid #172a3c", background: "rgba(7,18,30,0.7)" }}>
            <p className="font-['Inter:Medium',sans-serif] text-[9px] leading-[11px] uppercase tracking-[0.07em] text-[#5a7080]">
              {contextSubtitle}
            </p>
            <p
              className="font-['Inter:Semi_Bold',sans-serif] text-[12px] leading-[15px] text-[#b8c8d8] truncate"
              title={pageContext.label}
            >
              {pageContext.label}
            </p>
          </div>
        )}

        {/* ── Running action status strip ── */}
        {runningAction && (
          <div
            className="relative shrink-0 w-full px-[16px] py-[5px] flex items-center gap-[6px]"
            style={{ background: "rgba(59,130,246,0.04)", borderBottom: "1px solid rgba(59,130,246,0.1)" }}
          >
            <span className="relative size-[6px] shrink-0">
              <span className="absolute inset-0 rounded-full bg-[#3b82f6] animate-pulse" />
            </span>
            <span className="font-['Inter:Medium',sans-serif] text-[9px] leading-[12px] text-[#3b82f6] truncate">
              Running: {runningAction}
            </span>
          </div>
        )}

        {/* ── Chat area ── */}
        <div
          className="flex-1 min-h-0 min-w-0 relative w-full z-[2] overflow-y-auto"
          style={{ scrollbarWidth: "none" }}
          onClick={(e) => {
            const el = (e.target as HTMLElement).closest("[data-suggestion]") as HTMLElement | null;
            if (el?.dataset.suggestion) handleSend(el.dataset.suggestion);
          }}
        >
          {messages.length === 0 && !isProcessing ? (
            <div className="flex flex-col items-center justify-end size-full gap-[10px] px-[20px] pb-[8px]">
              <div className="flex flex-col gap-[4px] w-full max-w-[280px]">
                {suggestions.map((s, i) => {
                  const isReturning = s.prompt === "What changed since my last visit?";
                  return (
                    <div
                      key={i}
                      title={s.label}
                      className={`border rounded-[7px] px-[11px] py-[8px] cursor-pointer transition-all group ${
                        isReturning
                          ? "bg-[#0a1c2e] border-[#1e3a52] hover:border-[#2a5070] hover:bg-[#0e2438]"
                          : "bg-[#081422] border-[#1a2e42] hover:border-[#234060] hover:bg-[#0c1e34]"
                      }`}
                      data-suggestion={s.prompt}
                    >
                      <div className="flex items-center gap-[7px]">
                        {isReturning ? (
                          <svg className="size-[9px] shrink-0 opacity-50 group-hover:opacity-75 transition-opacity" viewBox="0 0 10 10" fill="none">
                            <circle cx="5" cy="5" r="4" stroke="#57b1ff" strokeWidth="1.2" />
                            <path d="M5 3v2l1.5 1.5" stroke="#57b1ff" strokeWidth="1.2" strokeLinecap="round" />
                          </svg>
                        ) : (
                          <svg className="size-[8px] shrink-0 opacity-35 group-hover:opacity-65 transition-opacity" viewBox="0 0 10 10" fill="none"><path d="M3.5 2L6.5 5L3.5 8" stroke="#57b1ff" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" /></svg>
                        )}
                        <p className={`font-['Inter:Regular',sans-serif] font-normal leading-[14px] transition-colors text-[12px] truncate ${
                          isReturning
                            ? "text-[#6ea8d0] group-hover:text-[#88bedf]"
                            : "text-[#8fa4b8] group-hover:text-[#adbece]"
                        }`}>{s.label}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="flex flex-col py-[12px] min-h-full justify-end">
              {messages.map(m => (
                <SharedMessageBubble key={m.id} message={m} onAction={handleAction} />
              ))}
              {isProcessing && <TypingIndicator />}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* ── Input ── */}
        <SharedChatInput
          inputValue={inputValue}
          onInputChange={setInputValue}
          onSend={onSend}
          placeholder={placeholder}
          dataName="GlobalInputArea"
          sendButtonSize={48}
          sendButtonRadius={12}
          sendIcon={sendIcon}
        />
      </div>
    </div>
  );
}

export const GlobalAIBox = React.memo(GlobalAIBoxInner);
