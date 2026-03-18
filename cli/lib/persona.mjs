/**
 * persona.mjs — CLI persona-aware prioritization layer
 *
 * Mirrors src/app/shared/skills/persona.ts for terminal consumers.
 *
 * Persona resolution order:
 *   1. Explicit argument passed to resolvePersona()
 *   2. SECOPS_PERSONA environment variable
 *   3. ~/.secops/config.json  { "persona": "analyst" }
 *   4. Default: "analyst"
 *
 * Usage:
 *   SECOPS_PERSONA=manager secops ask "what should I approve?"
 *   secops ask "re-run analysis"   # uses stored/default persona
 */

import fs from "fs";

const VALID_PERSONAS = ["analyst", "manager", "compliance", "operator"];
const DEFAULT_PERSONA = "analyst";
const PERSONA_BOOST = 20;

/**
 * Skill IDs that are promoted to the front for each persona.
 * Mirrors PERSONA_SKILL_BOOSTS in persona.ts.
 */
export const PERSONA_SKILL_BOOSTS = {
  analyst: [
    "agent-explain", "agent-assess", "agent-trace", "agent-rerun",
    "vuln-explain-cves", "vuln-show-cves", "vuln-patching-priority",
    "exp-attack-surface", "exp-trace-paths",
    "gov-explain-gaps", "gov-recommend-remediation",
    "create-case", "path-explain", "path-recommend-mitigation",
    "asset-show-vulns", "asset-show-open-findings", "asset-explain-exposure",
    "comp-explain-control", "comp-remediation",
    "case-show-findings", "case-next-actions",
    "wc-happened", "wc-risk-trend", "wc-attack-path",
  ],
  manager: [
    "wc-attention", "wc-approve", "wc-risk-trend", "wc-today",
    "agent-assess", "agent-summarise", "agent-recommend",
    "wf-last-run",
    "path-show-impacted", "create-case",
    "asset-assess-risk", "asset-show-paths",
    "comp-gaps", "comp-recent-policy-changes",
    "vuln-show-cves", "exp-highlight-externally",
    "gov-approval-impact",
    "case-summarise", "case-escalation-path",
  ],
  compliance: [
    "comp-explain-control", "comp-gaps", "comp-remediation",
    "comp-create-workflow", "comp-create-task", "comp-recent-policy-changes",
    "gov-explain-gaps", "gov-recommend-remediation",
    "gov-affected-controls", "gov-approval-impact",
    "path-recommend-mitigation", "create-case",
    "case-escalation-path", "case-next-actions",
    "asset-assess-risk",
  ],
  operator: [
    "agent-rerun", "agent-simulate", "agent-trace",
    "wf-diagnose", "wf-rerun", "wf-suggest", "wf-show-config",
    "asset-recommend-patches", "asset-list-misconfigs", "asset-recommend-remediations",
    "vuln-patching-priority", "vuln-recheck-patch",
    "exp-lateral-movement",
    "path-simulate-impact", "create-case",
    "wc-attack-path", "wc-approve",
    "case-next-actions", "case-escalation-path",
  ],
};

/**
 * Post-action follow-up skill IDs per persona.
 * Mirrors PERSONA_POST_ACTION_SKILLS in persona.ts.
 */
export const PERSONA_POST_ACTION_SKILLS = {
  analyst: {
    "agent-rerun":           ["agent-explain", "create-case", "agent-assess"],
    "agent-simulate":        ["agent-assess", "create-case", "path-recommend-mitigation"],
    "create-case":           ["case-show-findings", "case-next-actions", "agent-explain"],
    "wf-diagnose":           ["wf-rerun", "wf-suggest", "agent-explain"],
    "comp-remediation":      ["comp-create-task", "create-case", "comp-gaps"],
    default:                 ["agent-explain", "agent-assess", "create-case"],
  },
  manager: {
    "agent-rerun":           ["agent-summarise", "wc-approve", "agent-assess"],
    "create-case":           ["case-summarise", "case-escalation-path", "wc-approve"],
    "agent-simulate":        ["agent-assess", "wc-approve", "agent-summarise"],
    "wf-last-run":           ["wf-diagnose", "wf-suggest", "wc-attention"],
    default:                 ["wc-attention", "wc-approve", "agent-summarise"],
  },
  compliance: {
    "comp-remediation":      ["comp-create-task", "gov-affected-controls", "comp-gaps"],
    "comp-create-workflow":  ["comp-gaps", "comp-remediation", "gov-explain-gaps"],
    "create-case":           ["case-escalation-path", "comp-gaps", "comp-recent-policy-changes"],
    "gov-recommend-remediation": ["comp-create-task", "comp-gaps", "gov-affected-controls"],
    default:                 ["comp-explain-control", "comp-gaps", "comp-remediation"],
  },
  operator: {
    "agent-rerun":           ["wf-diagnose", "agent-simulate", "wf-rerun"],
    "wf-rerun":              ["wf-last-run", "wf-diagnose", "wf-suggest"],
    "wf-diagnose":           ["wf-rerun", "wf-suggest", "wf-show-config"],
    "agent-simulate":        ["agent-rerun", "path-simulate-impact", "create-case"],
    default:                 ["agent-rerun", "wf-diagnose", "agent-simulate"],
  },
};

// ── Persona resolution ────────────────────────────────────────────────────────

/**
 * Resolve the active persona.
 * @param {string|null} explicit  - value from --persona flag or similar
 * @returns {string}  one of the VALID_PERSONAS values
 */
export function resolvePersona(explicit) {
  if (explicit && VALID_PERSONAS.includes(explicit)) return explicit;

  // Environment variable
  const env = process.env.SECOPS_PERSONA;
  if (env && VALID_PERSONAS.includes(env)) return env;

  // Config file
  try {
    const home = process.env.HOME || process.env.USERPROFILE || "";
    const raw  = fs.readFileSync(`${home}/.secops/config.json`, "utf8");
    const cfg  = JSON.parse(raw);
    if (cfg.persona && VALID_PERSONAS.includes(cfg.persona)) return cfg.persona;
  } catch {
    // file absent or unreadable — use default
  }

  return DEFAULT_PERSONA;
}

// ── Scoring ───────────────────────────────────────────────────────────────────

/**
 * Effective priority score for a skill under a given persona.
 * Lower = shown first.
 */
export function scoreSkillForPersona(skill, persona) {
  const boosts = PERSONA_SKILL_BOOSTS[persona] ?? [];
  return boosts.includes(skill.id) ? skill.priority - PERSONA_BOOST : skill.priority;
}

// ── Persona-aware skill queries ───────────────────────────────────────────────

/**
 * All skills for a context, sorted by persona-aware priority.
 * Falls back to standard ordering when persona is null/unknown.
 */
export function getPersonaSkills(getSkillsForContext, context, persona, agentId) {
  const skills = getSkillsForContext(context, agentId);
  if (!persona || !VALID_PERSONAS.includes(persona)) return skills;
  return [...skills]
    .map(skill => ({ skill, score: scoreSkillForPersona(skill, persona) }))
    .sort((a, b) => a.score - b.score)
    .map(({ skill }) => skill);
}

/**
 * Default-visible skills for a context, in persona-aware order.
 */
export function getPersonaDefaultSkills(getSkillsForContext, context, persona, agentId) {
  return getPersonaSkills(getSkillsForContext, context, persona, agentId)
    .filter(s => s.defaultVisible);
}

/**
 * Rendered suggestions for a context, ranked by persona.
 */
export function getPersonaAiBoxSuggestions(getSkillsForContext, renderSkillSuggestion, context, persona, entityLabel, agentId, entityId, limit = 6) {
  return getPersonaDefaultSkills(getSkillsForContext, context, persona, agentId)
    .slice(0, limit)
    .map(s => renderSkillSuggestion(s, entityLabel, entityId));
}

/**
 * Follow-up suggestion labels for a completed skill, derived from the
 * post-action map.  Returns an empty array when persona is unknown.
 */
export function getPostActionLabels(completedSkillId, persona, limit = 3) {
  if (!persona || !VALID_PERSONAS.includes(persona)) return [];
  const personaMap = PERSONA_POST_ACTION_SKILLS[persona];
  const skillIds = personaMap[completedSkillId] ?? personaMap.default ?? [];
  return skillIds.slice(0, limit);
}
