/**
 * skills-registry.mjs — CLI mirror of the unified Skills Registry
 *
 * Plain-JS counterpart of src/app/shared/skills/registry.ts.
 * Provides the same data and helper functions used by the UI, adapted for
 * terminal consumption.  Skill IDs are internal — never show them to users.
 */

// ── Agent role labels (mirrors AGENT_ROLE_LABELS) ────────────────────────────

export const AGENT_ROLES = {
  alpha:   "Asset Intelligence Analyst",
  bravo:   "Configuration Security Analyst",
  charlie: "Application Security Analyst",
  delta:   "Governance & Compliance Analyst",
  echo:    "Risk Intelligence Analyst",
  foxtrot: "Exposure Analyst",
  golf:    "Identity Security Analyst",
  hotel:   "Vulnerability Analyst",
};

// ── Skill definitions ─────────────────────────────────────────────────────────

export const SKILLS = [

  // ── WATCH CENTER ──────────────────────────────────────────────────────────
  { id: "wc-attention",    label: "What needs attention?",        promptTemplate: "What needs immediate attention right now?",            category: "explore", contexts: ["watch-center"], defaultVisible: true,  priority: 10, cliAliases: ["attention", "status"] },
  { id: "wc-happened",     label: "Show me what happened",        promptTemplate: "What happened in the last 24 hours?",                  category: "explain", contexts: ["watch-center"], defaultVisible: true,  priority: 20 },
  { id: "wc-today",        label: "What did the system do today?",promptTemplate: "What did the system do today?",                        category: "explain", contexts: ["watch-center"], defaultVisible: true,  priority: 30 },
  { id: "wc-risk-trend",   label: "Risk trend graph",             promptTemplate: "Show the risk trend graph",                            category: "explore", contexts: ["watch-center"], defaultVisible: true,  priority: 40 },
  { id: "wc-attack-path",  label: "Show attack path",             promptTemplate: "Show active attack paths",                             category: "explore", contexts: ["watch-center"], defaultVisible: true,  priority: 50, cliAliases: ["attack-path"] },
  { id: "wc-approve",      label: "What should I approve?",       promptTemplate: "What actions require my approval?",                    category: "explore", contexts: ["watch-center"], defaultVisible: true,  priority: 60 },
  { id: "wc-risk-posture", label: "Current risk posture",         promptTemplate: "Summarise the current risk posture",                   category: "explain", contexts: ["watch-center"], defaultVisible: false, priority: 70 },
  { id: "wc-active-threats",label: "Active threats",              promptTemplate: "What active threats require immediate attention?",      category: "explore", contexts: ["watch-center"], defaultVisible: false, priority: 80 },

  // ── AGENT — common (all analysts) ────────────────────────────────────────
  { id: "agent-explain",   label: "Explain recent findings",      promptTemplate: "Explain the latest findings from the {label}",        category: "explain", contexts: ["agent"], defaultVisible: true,  priority: 10, cliAliases: ["explain", "findings"] },
  { id: "agent-assess",    label: "Assess current risk",          promptTemplate: "Assess the current risk level for the {label}",       category: "explore", contexts: ["agent"], defaultVisible: true,  priority: 20, cliAliases: ["assess", "risk"] },
  { id: "agent-trace",     label: "Trace attack path",            promptTemplate: "Show attack paths related to the {label}",            category: "explore", contexts: ["agent"], defaultVisible: true,  priority: 30, cliAliases: ["trace"] },
  { id: "agent-rerun",     label: "Re-run analysis",              promptTemplate: "Re-run investigation across all relevant analysts for the {label}", category: "act", contexts: ["agent"], defaultVisible: true,  priority: 40, cliAliases: ["rerun"] },
  { id: "agent-simulate",  label: "Simulate impact",              promptTemplate: "Simulate cross-agent impact for {label} findings",    category: "act",     contexts: ["agent"], defaultVisible: true,  priority: 50, cliAliases: ["simulate"] },
  { id: "agent-summarise", label: "Summarise findings",           promptTemplate: "Summarise the latest findings for the {label}",       category: "explain", contexts: ["agent"], defaultVisible: false, priority: 60, cliAliases: ["summarise", "summary"] },
  { id: "agent-recommend", label: "Recommend next actions",       promptTemplate: "What actions should I take based on {label}'s findings?", category: "explore", contexts: ["agent"], defaultVisible: false, priority: 70 },

  // ── AGENT — Vulnerability Analyst (hotel) ────────────────────────────────
  { id: "vuln-explain-cves",      label: "Explain recent CVEs",         promptTemplate: "Explain the CVEs recently flagged by the {label}",       category: "explain", contexts: ["agent"], agentIds: ["hotel"], defaultVisible: true,  priority: 5,  cliAliases: ["cves"] },
  { id: "vuln-show-cves",         label: "Show critical CVEs",          promptTemplate: "List all critical CVEs currently tracked by the {label}", category: "explore", contexts: ["agent"], agentIds: ["hotel"], defaultVisible: true,  priority: 6,  cliAliases: ["critical-cves"] },
  { id: "vuln-patching-priority", label: "Patching priority",           promptTemplate: "What patches should be applied first based on {label} findings?", category: "explore", contexts: ["agent"], agentIds: ["hotel"], defaultVisible: true,  priority: 7,  cliAliases: ["patch", "patching"] },
  { id: "vuln-recheck-patch",     label: "Recheck patch status",        promptTemplate: "Recheck the patch status for all assets tracked by the {label}", category: "act", contexts: ["agent"], agentIds: ["hotel"], defaultVisible: false, priority: 8,  cliAliases: ["recheck"] },

  // ── AGENT — Exposure Analyst (foxtrot) ───────────────────────────────────
  { id: "exp-attack-surface",      label: "Explain attack surface",               promptTemplate: "Explain the current attack surface identified by the {label}", category: "explain", contexts: ["agent"], agentIds: ["foxtrot"], defaultVisible: true,  priority: 5, cliAliases: ["surface"] },
  { id: "exp-trace-paths",         label: "Trace exposure paths",                 promptTemplate: "Trace all exposure paths currently monitored by the {label}",  category: "explore", contexts: ["agent"], agentIds: ["foxtrot"], defaultVisible: true,  priority: 6, cliAliases: ["paths"] },
  { id: "exp-highlight-externally",label: "Highlight externally reachable assets",promptTemplate: "Which assets are externally reachable according to the {label}?", category: "explore", contexts: ["agent"], agentIds: ["foxtrot"], defaultVisible: true,  priority: 7 },
  { id: "exp-lateral-movement",    label: "Reassess lateral movement risk",       promptTemplate: "Reassess the lateral movement risk from current findings",     category: "explore", contexts: ["agent"], agentIds: ["foxtrot"], defaultVisible: false, priority: 8 },

  // ── AGENT — Governance & Compliance Analyst (delta) ─────────────────────
  { id: "gov-explain-gaps",       label: "Explain compliance gaps",   promptTemplate: "Explain the current compliance gaps identified by the {label}", category: "explain", contexts: ["agent"], agentIds: ["delta"], defaultVisible: true,  priority: 5, cliAliases: ["gaps"] },
  { id: "gov-recommend-remediation",label: "Recommend remediation",   promptTemplate: "Recommend remediation steps for compliance gaps",              category: "explore", contexts: ["agent"], agentIds: ["delta"], defaultVisible: true,  priority: 6, cliAliases: ["remediation"] },
  { id: "gov-affected-controls",  label: "Show affected controls",    promptTemplate: "Show the compliance controls affected by current findings",    category: "explain", contexts: ["agent"], agentIds: ["delta"], defaultVisible: false, priority: 7 },
  { id: "gov-approval-impact",    label: "Assess approval impact",    promptTemplate: "Assess the impact of pending approvals on compliance posture", category: "explore", contexts: ["agent"], agentIds: ["delta"], defaultVisible: false, priority: 8 },

  // ── WORKFLOWS ─────────────────────────────────────────────────────────────
  { id: "wf-explain",     label: "Explain workflow",         promptTemplate: "Explain the {label} workflow",                     category: "explain", contexts: ["workflow"],             defaultVisible: true,  priority: 10, cliAliases: ["explain"] },
  { id: "wf-diagnose",    label: "Diagnose workflow",        promptTemplate: "Diagnose failures in the {label} workflow",         category: "explore", contexts: ["workflow", "workflow-run"], defaultVisible: true,  priority: 20, cliAliases: ["diagnose"] },
  { id: "wf-last-run",    label: "Last run summary",         promptTemplate: "Summarise the last run of {label}",                 category: "explain", contexts: ["workflow", "workflow-run"], defaultVisible: true,  priority: 30, cliAliases: ["last-run"] },
  { id: "wf-suggest",     label: "Suggest improvements",     promptTemplate: "How can I improve workflow {label}?",               category: "explore", contexts: ["workflow"],             defaultVisible: true,  priority: 40, cliAliases: ["improve"] },
  { id: "wf-rerun",       label: "Re-run workflow",          promptTemplate: "Re-run the {label} workflow",                       category: "act",     contexts: ["workflow"],             defaultVisible: true,  priority: 50, cliAliases: ["rerun"] },
  { id: "wf-show-config", label: "Show configuration",       promptTemplate: "Explain the configuration of workflow {label}",     category: "explain", contexts: ["workflow"],             defaultVisible: false, priority: 60 },

  // ── ASSETS ────────────────────────────────────────────────────────────────
  { id: "asset-show-vulns",           label: "Show vulnerabilities",    promptTemplate: "What vulnerabilities affect {label}?",              category: "explain", contexts: ["asset"], defaultVisible: true,  priority: 10, cliAliases: ["vulns"] },
  { id: "asset-assess-risk",          label: "Assess CIA risk",         promptTemplate: "Assess the CIA risk for {label}",                   category: "explore", contexts: ["asset"], defaultVisible: true,  priority: 20, cliAliases: ["cia", "risk"] },
  { id: "asset-show-open-findings",   label: "Show open findings",      promptTemplate: "What open findings are associated with {label}?",   category: "explain", contexts: ["asset"], defaultVisible: true,  priority: 30, cliAliases: ["findings"] },
  { id: "asset-recommend-patches",    label: "Recommend patches",       promptTemplate: "What patches does {label} need?",                   category: "explore", contexts: ["asset"], defaultVisible: true,  priority: 40, cliAliases: ["patches"] },
  { id: "asset-show-paths",           label: "Show attack paths",       promptTemplate: "What attack paths reach {label}?",                  category: "explore", contexts: ["asset"], defaultVisible: true,  priority: 50, cliAliases: ["paths"] },
  { id: "asset-explain-exposure",     label: "Explain exposure",        promptTemplate: "How is {label} exposed to external threats?",       category: "explain", contexts: ["asset"], defaultVisible: false, priority: 60 },
  { id: "asset-list-misconfigs",      label: "List misconfigurations",  promptTemplate: "What misconfigurations are present on {label}?",    category: "explain", contexts: ["asset"], defaultVisible: false, priority: 70, cliAliases: ["misconfigs"] },
  { id: "asset-recommend-remediations",label: "Recommend remediations", promptTemplate: "What should I do to secure {label}?",               category: "explore", contexts: ["asset"], defaultVisible: false, priority: 80, cliAliases: ["recommend"] },

  // ── ATTACK PATH ───────────────────────────────────────────────────────────
  { id: "path-explain",         label: "Explain this path",       promptTemplate: "Explain the {label} attack path",                       category: "explain", contexts: ["attack-path"],              defaultVisible: true,  priority: 10, cliAliases: ["explain"] },
  { id: "path-show-impacted",   label: "Show impacted assets",    promptTemplate: "What assets are impacted by {label}?",                  category: "explore", contexts: ["attack-path"],              defaultVisible: true,  priority: 20, cliAliases: ["impacted"] },
  { id: "path-recommend-mitigation",label: "Recommend mitigation",promptTemplate: "What mitigations are recommended for {label}?",         category: "explore", contexts: ["attack-path", "compliance"],defaultVisible: true,  priority: 30, cliAliases: ["mitigation", "mitigate"] },
  { id: "create-case",          label: "Create case",             promptTemplate: "Create an investigation case for {label}",              category: "act",     contexts: ["attack-path", "watch-center", "asset", "compliance"], defaultVisible: true, priority: 40, cliAliases: ["case", "create-case"] },
  { id: "path-simulate-impact", label: "Simulate impact",         promptTemplate: "Simulate the impact of {label}",                        category: "act",     contexts: ["attack-path"],              defaultVisible: false, priority: 50, cliAliases: ["simulate"] },

  // ── COMPLIANCE ────────────────────────────────────────────────────────────
  { id: "comp-explain-control",    label: "Explain control status",  promptTemplate: "What is the current control status for {label}?",      category: "explain", contexts: ["compliance"], defaultVisible: true,  priority: 10, cliAliases: ["controls"] },
  { id: "comp-gaps",               label: "Show compliance gaps",    promptTemplate: "What compliance gaps exist for {label}?",              category: "explore", contexts: ["compliance"], defaultVisible: true,  priority: 20, cliAliases: ["gaps"] },
  { id: "comp-remediation",        label: "Remediation steps",       promptTemplate: "What remediation steps are needed for {label}?",       category: "explore", contexts: ["compliance"], defaultVisible: true,  priority: 30, cliAliases: ["remediation"] },
  { id: "comp-create-workflow",    label: "Create compliance workflow",promptTemplate: "Create a compliance workflow for {label}",           category: "act",     contexts: ["compliance"], defaultVisible: true,  priority: 40, cliAliases: ["workflow"] },
  { id: "comp-create-task",        label: "Create task",             promptTemplate: "Create a remediation task for {label}",               category: "act",     contexts: ["compliance"], defaultVisible: true,  priority: 50, cliAliases: ["task"] },
  { id: "comp-recent-policy-changes",label: "Recent policy changes", promptTemplate: "What policy changes affect {label} compliance?",      category: "explain", contexts: ["compliance"], defaultVisible: false, priority: 60 },

  // ── CASE MANAGEMENT ───────────────────────────────────────────────────────
  { id: "case-summarise",      label: "Summarise case",    promptTemplate: "Summarise case {id}",                                   category: "explain", contexts: ["case"], defaultVisible: true,  priority: 10, cliAliases: ["summarise"] },
  { id: "case-show-findings",  label: "Show findings",     promptTemplate: "What findings are linked to case {id}?",               category: "explain", contexts: ["case"], defaultVisible: true,  priority: 20 },
  { id: "case-next-actions",   label: "Next actions",      promptTemplate: "What are the recommended next actions for case {id}?", category: "explore", contexts: ["case"], defaultVisible: true,  priority: 30 },
  { id: "case-escalation-path",label: "Escalation path",   promptTemplate: "What is the escalation path for case {id}?",          category: "explore", contexts: ["case"], defaultVisible: true,  priority: 40 },
];

// ── Query helpers ─────────────────────────────────────────────────────────────

/**
 * Return all skills valid for a given context, sorted by priority.
 * If agentId is provided, includes agent-specific skills for that analyst.
 */
export function getSkillsForContext(context, agentId) {
  return SKILLS
    .filter(s => s.contexts.includes(context))
    .filter(s => {
      if (!s.agentIds) return true;
      return agentId ? s.agentIds.includes(agentId) : false;
    })
    .sort((a, b) => a.priority - b.priority);
}

/** Return default-visible skills for a context. */
export function getDefaultSkills(context, agentId) {
  return getSkillsForContext(context, agentId).filter(s => s.defaultVisible);
}

/**
 * Render a skill into a { label, prompt } suggestion by substituting
 * {label} and {id} placeholders in the promptTemplate.
 */
export function renderSkillSuggestion(skill, entityLabel, entityId) {
  const prompt = skill.promptTemplate
    .replace(/\{label\}/g, entityLabel)
    .replace(/\{id\}/g, entityId ?? entityLabel);
  return { label: skill.label, prompt };
}

/**
 * Get up to `limit` rendered suggestions for a context.
 */
export function getAiBoxSuggestions(context, entityLabel, agentId, entityId, limit = 6) {
  return getDefaultSkills(context, agentId)
    .slice(0, limit)
    .map(s => renderSkillSuggestion(s, entityLabel, entityId));
}

/** Find skills matching a CLI alias string within a context. */
export function resolveSkillByAlias(alias, context, agentId) {
  const q = alias.toLowerCase();
  return getSkillsForContext(context, agentId)
    .find(s => s.cliAliases?.includes(q) || s.label.toLowerCase().includes(q));
}
