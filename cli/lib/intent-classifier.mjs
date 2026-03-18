/**
 * intent-classifier.mjs — Classify a query string into an intent category
 *
 * Mirrors the UI's action classification logic.
 * Intent categories:
 *   Executable (→ Action Preview):  rerun | simulate | publish | remediate | create-case | reclassify
 *   Read-only  (→ direct response): explain | assess | trace | summarise | diagnose |
 *                                   investigate | recommend | list | compliance | general
 */

export const EXECUTABLE_INTENTS = new Set([
  "rerun", "simulate", "publish", "remediate", "create-case", "reclassify",
]);

export function classifyIntent(query) {
  if (!query) return "general";
  const q = query.toLowerCase();

  // ── Executable intents ──────────────────────────────────────────────────────
  if (/\b(re-?run|restart analysis|refresh analysis|run analysis|re-?scan)\b/.test(q))
    return "rerun";
  if (/\b(simulat|blast radius|impact analysis|what.?if scenario)\b/.test(q))
    return "simulate";
  if (/\b(publish|deploy workflow|activate workflow|go live|enable workflow)\b/.test(q))
    return "publish";
  if (/\b(remediat|patch|apply fix|resolve vulnerability|close finding)\b/.test(q))
    return "remediate";
  if (/\b(create case|open case|escalate to case|create investigation)\b/.test(q))
    return "create-case";
  if (/\b(reclassif|change classification|update asset class|mark as)\b/.test(q))
    return "reclassify";

  // ── Read-only intents ───────────────────────────────────────────────────────
  if (/\b(trace|attack path|lateral movement|kill chain|path from|path to|reachab)\b/.test(q))
    return "trace";
  if (/\b(diagnos|debug|why.*fail|troubleshoot|not working|run.*fail|error in)\b/.test(q))
    return "diagnose";
  if (/\b(investigat|deep dive|drill down|deep.?analysis)\b/.test(q))
    return "investigate";
  if (/\b(recommend|suggest|what should|next step|action plan|what.*do)\b/.test(q))
    return "recommend";
  if (/\b(cia|availabilit|integrit|confidential|risk score|posture|criticality|severity|assess|current risk)\b/.test(q))
    return "assess";
  if (/\b(explain|what is|what are|describe|how does|why is|what does|what.*mean)\b/.test(q))
    return "explain";
  if (/\b(summar|overview|brief|tl.?dr|recent findings|findings|what.*found|status)\b/.test(q))
    return "summarise";
  if (/\b(show|list|display|get|view|what.*happened|recent|last \d+)\b/.test(q))
    return "list";
  if (/\b(compliance|gap|control|policy|requirement|audit|certif|framework)\b/.test(q))
    return "compliance-check";
  if (/\b(priorit|rank|top|worst|most.?critical)\b/.test(q))
    return "prioritise";

  return "general";
}

export const isExecutable = (intent) => EXECUTABLE_INTENTS.has(intent);
