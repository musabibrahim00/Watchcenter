/**
 * Workflow AIBox Behavior States
 * ===============================
 *
 * Defines the 6 standardized AIBox behavior states for the Workflows module.
 * Each state produces an AiBoxPageContext that drives the global AIBox shell —
 * same container, different behavior (greeting, suggestions, placeholder, contextKey).
 *
 * SHELL CONSISTENCY RULE:
 *   Every workflow entry point (New Workflow, Use Template, Library template
 *   explanation, Library template customization, Edit, Diagnose, Explain,
 *   Optimize, Debug context, Runs context, Settings context, step explain,
 *   step modify) renders in the EXACT SAME GlobalAIBox shell — the same visual
 *   structure used by the Agent Detail page.  Only the context header text
 *   (sublabel + label), greeting, and suggestion chips may differ.  No entry
 *   point may introduce additional visual chrome, icons, or layout changes.
 *
 *   Context chip format:
 *     sublabel  →  "Workflow Context"   (constant across all states)
 *     label     →  workflow/template name
 *
 * States:
 *   1. Create  — new workflow creation via natural language
 *   2. Edit    — modifying an existing workflow's steps/config
 *   3. Diagnose — investigating failures, health issues, debug & runs context
 *   4. Explain  — understanding what a workflow does, settings context
 *   5. Optimize — performance and reliability improvements
 *   6. Library  — browsing or selecting a library template/item
 *
 * Entry Point → State Mapping:
 *   Workflow page (ambient)       → explain
 *   View AI Insights              → diagnose (with auto-query)
 *   Explain workflow              → explain
 *   Optimize workflow             → optimize (with auto-query)
 *   Edit with AI                  → edit
 *   New Workflow                  → create
 *   Use Template from Library     → library
 *   Library template explanation  → library
 *   Library template customization → library
 *   Run diagnostics               → diagnose (with auto-query)
 *   Debug context (ambient)       → diagnose
 *   Runs context (ambient)        → diagnose
 *   Settings context (ambient)    → explain (with settings suggestions)
 *   Step explain (canvas)         → explain (with step-specific greeting)
 *   Step modify (canvas)          → edit (with step-specific greeting)
 */

import type { AiBoxPageContext, AiBoxSuggestion } from "../../features/ai-box/AiBoxContext";

/* ================================================================
   CONSTANTS — shared across all states to enforce shell parity
   ================================================================ */

/** Context chip sublabel — identical for every workflow AIBox state */
const WORKFLOW_SUBLABEL = "Workflow Context";

/* ================================================================
   BEHAVIOR STATE ENUM
   ================================================================ */

export type WorkflowAiState =
  | "create"
  | "edit"
  | "diagnose"
  | "explain"
  | "optimize"
  | "library";

/* ================================================================
   STATE DEFINITIONS
   ================================================================ */

interface WorkflowAiStateDef {
  /** Sublabel shown in the AIBox context chip */
  sublabel: string;
  /** Greeting message rendered as the first assistant message */
  greeting: (workflowName: string) => string;
  /** Suggestion chips */
  suggestions: (workflowName: string) => AiBoxSuggestion[];
  /** Input placeholder text */
  placeholder: (workflowName: string) => string;
  /** Initial query to auto-send (optional — used by Diagnose) */
  initialQuery?: (workflowName: string) => string;
}

const STATE_DEFS: Record<WorkflowAiState, WorkflowAiStateDef> = {
  /* ── 1. CREATE ── */
  create: {
    sublabel: WORKFLOW_SUBLABEL,
    greeting: (name) =>
      `Describe the workflow you want to create in plain language. I'll build the steps for you.\n\nFor example: *"When a critical alert fires, create a case, assign an analyst, and notify Slack."*`,
    suggestions: () => [
      { label: "Create workflow for critical alerts", prompt: "Create a workflow that responds to critical alerts" },
      { label: "Create workflow for vulnerability remediation", prompt: "Create a workflow for vulnerability remediation" },
      { label: "Create weekly compliance workflow", prompt: "Create a weekly compliance reporting workflow" },
      { label: "Start with manual trigger", prompt: "Create a workflow with a manual trigger" },
      { label: "Suggest best workflow for SOC", prompt: "Suggest the best workflow for a SOC team" },
    ],
    placeholder: () => "Describe the workflow you want to create...",
  },

  /* ── 2. EDIT ── */
  edit: {
    sublabel: WORKFLOW_SUBLABEL,
    greeting: (name) =>
      `I have **${name}** loaded. Tell me what you'd like to change and I'll update the playbook canvas automatically.\n\nFor example:\n• "Add an enrichment step after the trigger"\n• "Replace Slack with Jira"\n• "Add approval before escalation"`,
    suggestions: () => [
      { label: "Add enrichment", prompt: "Add an enrichment step to enrich the alert with threat intelligence" },
      { label: "Add approval step", prompt: "Add an approval step before any destructive action" },
      { label: "Add escalation", prompt: "Add an escalation step to notify security leadership" },
      { label: "Add notification", prompt: "Add a notification step to alert the SOC team via Slack" },
      { label: "Change trigger", prompt: "Change the trigger to a different event type" },
      { label: "Remove a step", prompt: "Remove a step from the workflow" },
      { label: "Replace Slack with Jira", prompt: "Replace Slack notification with Jira ticket creation" },
      { label: "Delay a step by 10 minutes", prompt: "Add a 10 minute delay before the notification step" },
    ],
    placeholder: () => "Describe what you want to change...",
  },

  /* ── 3. DIAGNOSE ── */
  diagnose: {
    sublabel: WORKFLOW_SUBLABEL,
    greeting: (name) =>
      `Running diagnostics on **${name}**…\n\nI'll check integration health, recent run failures, step performance, and error patterns.`,
    suggestions: () => [
      { label: "Why is this workflow failing?", prompt: "Why is this workflow failing?" },
      { label: "Show recent workflow runs", prompt: "Show recent workflow runs" },
      { label: "Check integrations", prompt: "Check integrations for this workflow" },
      { label: "Find bottlenecks", prompt: "Find bottleneck steps in this workflow" },
      { label: "Summarize workflow health", prompt: "Summarize workflow health" },
    ],
    placeholder: () => "Ask about workflow health or failures...",
    initialQuery: () => "Run full workflow diagnostics",
  },

  /* ── 4. EXPLAIN ── */
  explain: {
    sublabel: WORKFLOW_SUBLABEL,
    greeting: (name) =>
      `I can explain **${name}** in plain language — how it works, why it exists, and what each step does.\n\nWhat would you like to understand?`,
    suggestions: () => [
      { label: "Explain this workflow", prompt: "Explain this workflow end-to-end in plain language" },
      { label: "Explain this trigger", prompt: "Explain what triggers this workflow" },
      { label: "What does this step do?", prompt: "What does each step in this workflow do?" },
      { label: "Why does this workflow exist?", prompt: "Why does this workflow exist and what problem does it solve?" },
      { label: "Summarize in plain language", prompt: "Summarize this workflow in plain language for a non-technical audience" },
    ],
    placeholder: () => "Ask AI to explain this workflow...",
  },

  /* ── 5. OPTIMIZE ── */
  optimize: {
    sublabel: WORKFLOW_SUBLABEL,
    greeting: (name) =>
      `I've analyzed **${name}** based on recent runs, failure patterns, and integration health.\n\nHere are a few areas I can help you improve — pick one or ask me anything.`,
    suggestions: () => [
      { label: "Optimize this workflow", prompt: "Optimize this workflow based on recent performance" },
      { label: "Reduce failures", prompt: "How can I reduce failures in this workflow?" },
      { label: "Improve runtime", prompt: "How can I improve the runtime of this workflow?" },
      { label: "Reduce noise", prompt: "How can I reduce noise and false positives from this workflow?" },
      { label: "Add retry logic", prompt: "Add retry logic to steps that commonly fail" },
      { label: "Improve escalation flow", prompt: "Improve the escalation flow in this workflow" },
    ],
    placeholder: () => "Ask AI how to improve this workflow...",
    initialQuery: () => "Optimize this workflow based on recent performance",
  },

  /* ── 6. LIBRARY — template browsing & customization ── */
  library: {
    sublabel: WORKFLOW_SUBLABEL,
    greeting: (name) =>
      `I have **${name}** loaded. I can walk you through what it does, help you tailor it to your environment, or get it running right away.\n\nJust pick an option below or describe what you need in your own words.`,
    suggestions: () => [
      { label: "Explain this template", prompt: "Explain this template" },
      { label: "Customize this workflow", prompt: "Customize this workflow" },
      { label: "What integrations are required?", prompt: "What integrations are required?" },
      { label: "Adapt this for critical alerts", prompt: "Adapt this for critical alerts" },
      { label: "Add approval before notification", prompt: "Add approval before notification" },
      { label: "Change notification target", prompt: "Change notification target" },
      { label: "Make this manual instead of automatic", prompt: "Make this manual instead of automatic" },
    ],
    placeholder: () => "Ask about this workflow template...",
  },
};

/* ================================================================
   PUBLIC API — build AiBoxPageContext from state + workflow info
   ================================================================ */

interface WorkflowAiStateParams {
  /** The behavior state to activate */
  state: WorkflowAiState;
  /** Workflow ID (used in contextKey for deduplication) */
  workflowId: string;
  /** Workflow display name */
  workflowName: string;
}

/**
 * Builds a standardized `AiBoxPageContext` for the given workflow behavior state.
 * All 6 states produce context objects that render in the same global AIBox shell.
 *
 * IMPORTANT: Callers may spread the result and override `greeting`, `suggestions`,
 * or `initialQuery`, but MUST NOT override `sublabel` or `type` — doing so would
 * break shell parity with the Agent Detail AIBox.
 */
export function buildWorkflowAiContext({
  state,
  workflowId,
  workflowName,
}: WorkflowAiStateParams): AiBoxPageContext {
  const def = STATE_DEFS[state];
  return {
    type: "workflow",
    label: workflowName,
    sublabel: def.sublabel,
    contextKey: `workflow:${state}:${workflowId}`,
    greeting: def.greeting(workflowName),
    suggestions: def.suggestions(workflowName),
    initialQuery: def.initialQuery?.(workflowName),
  };
}

/**
 * Returns the placeholder text for the given state & workflow.
 * Used by GlobalAIBox to show context-aware input prompts.
 */
export function getWorkflowPlaceholder(state: WorkflowAiState, workflowName: string): string {
  return STATE_DEFS[state].placeholder(workflowName);
}

/**
 * Infers the WorkflowAiState from an existing contextKey string.
 * Returns null if the contextKey doesn't match the workflow pattern.
 */
export function inferWorkflowAiState(contextKey: string | undefined): WorkflowAiState | null {
  if (!contextKey) return null;
  const match = contextKey.match(/^workflow:(create|edit|diagnose|explain|optimize|library):/);
  return match ? (match[1] as WorkflowAiState) : null;
}