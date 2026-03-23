/**
 * output.mjs — Terminal output formatting
 *
 * Human-readable ANSI mode (default) and JSON structured mode.
 * All print functions are no-ops in JSON mode except jsonOutput().
 */

// ── ANSI colour palette ──────────────────────────────────────────────────────
export const C = {
  reset:   "\x1b[0m",
  bold:    "\x1b[1m",
  dim:     "\x1b[2m",
  red:     "\x1b[31m",
  green:   "\x1b[32m",
  yellow:  "\x1b[33m",
  cyan:    "\x1b[36m",
  bred:    "\x1b[91m",
  bgreen:  "\x1b[92m",
  byellow: "\x1b[93m",
  bblue:   "\x1b[94m",
  bcyan:   "\x1b[96m",
  bwhite:  "\x1b[97m",
};

// ── Output mode ──────────────────────────────────────────────────────────────
export let mode = "human";
export const setMode = (m) => { mode = m === "json" ? "json" : "human"; };

const w   = (s) => process.stdout.write(s + "\n");
const err = (s) => process.stderr.write(s + "\n");

// ── Box drawing constants ─────────────────────────────────────────────────────
// Total box width: 62 chars
//   │ + space + content(58) + space + │ = 62
const INNER = 58;

const dim = (s) => `${C.dim}${s}${C.reset}`;

function bl(text = "") {
  return dim("│") + " " + String(text).padEnd(INNER) + " " + dim("│");
}

// ── Context header ────────────────────────────────────────────────────────────
export function contextHeader(label, sublabel) {
  if (mode === "json") return;
  w("");
  w(`  ${C.bold}${C.bwhite}${label}${C.reset}  ${C.dim}·  ${sublabel}${C.reset}`);
  w(dim("─".repeat(62)));
  w("");
}

// ── Section title ─────────────────────────────────────────────────────────────
export function sectionTitle(title) {
  if (mode === "json") return;
  w(`${C.bold}${C.bcyan}${title}${C.reset}`);
}

// ── Bullet line ───────────────────────────────────────────────────────────────
export function bullet(text, indent = 1) {
  if (mode === "json") return;
  w("  ".repeat(indent) + dim("•") + " " + text);
}

// ── Key-value line ────────────────────────────────────────────────────────────
export function kv(key, value, indent = 1) {
  if (mode === "json") return;
  w("  ".repeat(indent) + dim(key + ":") + "  " + value);
}

// ── Separator line ────────────────────────────────────────────────────────────
export function separator() {
  if (mode === "json") return;
  w(dim("━".repeat(62)));
}

export function blank() {
  if (mode === "json") return;
  w("");
}

// ── Risk level badge ──────────────────────────────────────────────────────────
export function riskBadge(level) {
  if (mode === "json") return level.toUpperCase();
  const map = {
    critical: `${C.bold}${C.bred}CRITICAL${C.reset}`,
    high:     `${C.bold}${C.byellow}HIGH${C.reset}`,
    medium:   `${C.bold}${C.yellow}MEDIUM${C.reset}`,
    low:      `${C.bold}${C.bgreen}LOW${C.reset}`,
    info:     `${C.bold}${C.bcyan}INFO${C.reset}`,
  };
  return map[level.toLowerCase()] ?? `${C.bold}${level.toUpperCase()}${C.reset}`;
}

// ── Guardrail level badge ─────────────────────────────────────────────────────
export function guardrailBadge(gl) {
  if (mode === "json") return gl;
  const colors = { L1: C.bgreen, L2: C.byellow, L3: C.bred };
  return `${C.bold}${colors[gl] ?? ""}${gl}${C.reset}`;
}

// ── Action preview box ────────────────────────────────────────────────────────
export function printActionPreview(preview) {
  if (mode === "json") {
    process.stdout.write(JSON.stringify({ type: "action_preview", ...preview }, null, 2) + "\n");
    return;
  }

  const titleLabel = "─ Proposed Action ";  // 18 chars
  const top = dim(`┌${titleLabel}${"─".repeat(60 - titleLabel.length)}┐`);
  const bot = dim(`└${"─".repeat(60)}┘`);

  w("");
  w(top);
  w(bl());
  w(bl(`  ${preview.title}`));
  w(bl());
  w(bl(`  Scope:   ${preview.scope}`));
  w(bl());

  if (preview.parameters && Object.keys(preview.parameters).length > 0) {
    w(bl(`  Parameters:`));
    for (const [k, v] of Object.entries(preview.parameters)) {
      w(bl(`    - ${k}: ${v}`));
    }
    w(bl());
  }

  if (preview.expectedOutcome?.length > 0) {
    w(bl(`  Expected outcome:`));
    for (const o of preview.expectedOutcome) {
      w(bl(`    • ${o}`));
    }
    w(bl());
  }

  w(bl(`  Guardrail level:     ${preview.guardrailLevel}`));
  w(bl(`  Confirmation:        ${preview.confirmationRequired ? "Required" : "Not required"}`));
  w(bl(`  Approval required:   ${preview.approvalRequired ? "Yes — use: secops request-approval" : "No"}`));
  w(bl());
  w(bot);
  w("");

  w(dim("Available next commands:"));
  w(`  ${C.bgreen}secops confirm${C.reset}                   execute this action`);
  w(`  ${C.byellow}secops modify <field> <value>${C.reset}    adjust parameters`);
  w(`  ${C.bred}secops cancel${C.reset}                    discard and abort`);
  if (preview.approvalRequired) {
    w(`  ${C.bcyan}secops request-approval${C.reset}          submit for team approval`);
  }
  w("");
}

// ── Success result ────────────────────────────────────────────────────────────
export function printSuccess(result) {
  if (mode === "json") {
    process.stdout.write(JSON.stringify({ type: "result", ...result }, null, 2) + "\n");
    return;
  }

  w("");
  w(`${C.bold}${C.bgreen}✓ Completed successfully${C.reset}`);
  w("");

  if (result.whatChanged?.length) {
    w(`${C.bold}What changed:${C.reset}`);
    for (const c of result.whatChanged) w("  " + dim("•") + " " + c);
    w("");
  }

  if (result.nextActions?.length) {
    w(`${C.bold}Suggested next steps:${C.reset}`);
    for (const a of result.nextActions) w(`  ${C.bcyan}${a}${C.reset}`);
    w("");
  }
}

// ── Error / warn / info ───────────────────────────────────────────────────────
export function printError(msg) {
  if (mode === "json") {
    process.stdout.write(JSON.stringify({ type: "error", message: msg }) + "\n");
    return;
  }
  err(`${C.bred}✗ ${msg}${C.reset}`);
}

export function printWarn(msg) {
  if (mode === "json") return;
  w(`${C.byellow}⚠  ${msg}${C.reset}`);
}

export function printInfo(msg) {
  if (mode === "json") return;
  w(`${C.bcyan}ℹ  ${msg}${C.reset}`);
}

// ── Update confirmation ───────────────────────────────────────────────────────
export function printUpdate(field, value) {
  if (mode === "json") {
    process.stdout.write(JSON.stringify({ type: "update", field, value }) + "\n");
    return;
  }
  w(`${C.bgreen}Updated:${C.reset} ${field} → ${C.bold}${value}${C.reset}`);
}

// ── Next steps ────────────────────────────────────────────────────────────────
export function printNextSteps(steps) {
  if (mode === "json") return;
  if (!steps?.length) return;
  w("");
  w(dim("Suggested next steps:"));
  for (const s of steps) w(`  ${C.bcyan}${s}${C.reset}`);
  w("");
}

// ── Deep-link output ──────────────────────────────────────────────────────────
export function printDeepLink(url, description) {
  if (mode === "json") {
    process.stdout.write(JSON.stringify({ type: "deep_link", url, description }) + "\n");
    return;
  }
  w("");
  w(`${C.bold}${C.bcyan}Open in UI:${C.reset}`);
  w(`  ${C.dim}${description}${C.reset}`);
  w(`  ${C.bblue}${url}${C.reset}`);
  w("");
}

// ── Session status ────────────────────────────────────────────────────────────
export function printSessionStatus(session) {
  if (mode === "json") {
    process.stdout.write(JSON.stringify({ type: "session_status", ...session }, null, 2) + "\n");
    return;
  }

  w("");
  w(`${C.bold}Current session status${C.reset}`);
  w(dim("─".repeat(62)));

  if (session.pending) {
    w(`${C.byellow}Pending action:${C.reset} ${session.pending.title}`);
    w(`  Scope:      ${session.pending.scope}`);
    w(`  Guardrail:  ${guardrailBadge(session.pending.guardrailLevel)}`);
    w(`  Approval:   ${session.pending.approvalRequired ? C.bred + "Required" + C.reset : C.bgreen + "Not required" + C.reset}`);
    w("");
    w(dim("Run 'secops confirm', 'secops modify <field> <val>', or 'secops cancel'"));
  } else {
    w(dim("No pending action."));
  }

  if (session.lastContext) {
    w("");
    w(`Last context: ${C.bwhite}${session.lastContext.label}${C.reset}  ${dim("(" + session.lastContext.type + ")")}`);
  }

  w("");
}

// ── Workflow list ─────────────────────────────────────────────────────────────
export function printWorkflowList(workflows) {
  if (mode === "json") {
    process.stdout.write(JSON.stringify({ type: "workflow_list", workflows }, null, 2) + "\n");
    return;
  }

  const statusColors = {
    completed:        C.bgreen,
    failed:           C.bred,
    running:          C.bcyan,
    waiting_approval: C.byellow,
    queued:           C.dim,
  };

  w("");
  w(`${C.bold}${C.bwhite}Workflows${C.reset}  ${dim("(" + workflows.length + " total)")}`);
  w(dim("─".repeat(62)));
  w("");

  for (const wf of workflows) {
    const sc = statusColors[wf.lastStatus] ?? C.dim;
    const statusLabel = (wf.lastStatus ?? "unknown").replace(/_/g, " ").toUpperCase();
    w(`  ${C.bold}${wf.label}${C.reset}`);
    w(`    ${dim("Status:")}  ${sc}${statusLabel}${C.reset}  ${dim("·")}  ${dim("Last run: " + (wf.lastRun ?? "—"))}`);
    w(`    ${dim("Trigger:")} ${wf.trigger}  ${dim("·")}  ${dim("Runs: " + wf.totalRuns + "  ·  Success: " + wf.successRate)}`);
    w(`    ${dim(wf.description)}`);
    w("");
  }

  w(dim("Run:  watch workflow run \"<name>\"   to trigger a workflow"));
  w(dim("Run:  watch workflow runs           to see recent run history"));
  w("");
}

// ── Workflow run confirmation ──────────────────────────────────────────────────
export function printWorkflowRunStarted(run, workflow) {
  if (mode === "json") {
    process.stdout.write(JSON.stringify({ type: "workflow_run_started", run, workflow }, null, 2) + "\n");
    return;
  }

  w("");
  w(`${C.bold}${C.bgreen}✓ Workflow triggered${C.reset}`);
  w("");
  w(`  ${C.bold}${workflow.label}${C.reset}`);
  w(`  ${dim("Run ID:")}   ${run.id}`);
  w(`  ${dim("Status:")}   ${C.bcyan}RUNNING${C.reset}`);
  w(`  ${dim("Trigger:")}  manual (CLI)`);
  w(`  ${dim("Started:")}  ${new Date(run.startTime).toLocaleTimeString()}`);
  w("");
  w(`${C.bold}Steps enqueued:${C.reset}`);
  for (const step of run.steps) {
    const icon = step.status === "running" ? `${C.bcyan}▶${C.reset}` : dim("○");
    w(`  ${icon}  ${step.name}`);
  }
  w("");
  w(dim("Suggested:"));
  w(`  ${C.bcyan}watch workflow runs${C.reset}              view run history`);
  w(`  ${C.bcyan}watch workflow debug ${run.id}${C.reset}   inspect this run`);
  w("");
}

// ── Workflow runs list ────────────────────────────────────────────────────────
export function printWorkflowRuns(runs) {
  if (mode === "json") {
    process.stdout.write(JSON.stringify({ type: "workflow_runs", runs }, null, 2) + "\n");
    return;
  }

  if (!runs.length) {
    w("");
    w(dim("No workflow runs in current session."));
    w(`  ${C.bcyan}watch workflow run "<name>"${C.reset}  to trigger a workflow`);
    w("");
    return;
  }

  const sc = { completed: C.bgreen, failed: C.bred, running: C.bcyan, waiting_approval: C.byellow };

  w("");
  w(`${C.bold}${C.bwhite}Recent Workflow Runs${C.reset}`);
  w(dim("─".repeat(62)));
  w("");

  for (const run of runs) {
    const color = sc[run.status] ?? C.dim;
    w(`  ${C.bold}${run.workflowName ?? run.workflowId}${C.reset}`);
    w(`  ${dim("Run ID:")}  ${run.id}  ${dim("·")}  ${color}${run.status.toUpperCase()}${C.reset}`);
    w(`  ${dim("Trigger:")} ${run.triggerSource}  ${dim("·")}  ${dim("Started: " + new Date(run.startTime).toLocaleString())}`);
    w(`  ${dim("By:")}      ${run.triggeredBy ?? "automated"}`);
    if (run.failureReason) w(`  ${C.bred}Failure:${C.reset}  ${run.failureReason}`);
    w("");
  }

  w(dim("Run:  watch workflow debug <run-id>   to inspect a run"));
  w("");
}

// ── Workflow run debug ────────────────────────────────────────────────────────
export function printRunDebug(run) {
  if (mode === "json") {
    process.stdout.write(JSON.stringify({ type: "run_debug", run }, null, 2) + "\n");
    return;
  }

  const sc = { completed: C.bgreen, failed: C.bred, running: C.bcyan, waiting_approval: C.byellow, skipped: C.dim, pending: C.dim };
  const statusOf = (s) => `${sc[s] ?? C.dim}${(s ?? "?").toUpperCase()}${C.reset}`;

  w("");
  w(`${C.bold}${C.bwhite}Run Debug — ${run.workflowName ?? run.workflowId}${C.reset}`);
  w(dim("─".repeat(62)));
  w("");
  w(`  ${dim("Run ID:")}    ${run.id}`);
  w(`  ${dim("Status:")}    ${statusOf(run.status)}`);
  w(`  ${dim("Trigger:")}   ${run.triggerSource}  ${dim("·")}  ${dim("By: " + (run.triggeredBy ?? "automated"))}`);
  w(`  ${dim("Started:")}   ${new Date(run.startTime).toLocaleString()}`);
  if (run.failureReason) {
    w("");
    w(`${C.bred}Failure reason:${C.reset}`);
    w(`  ${run.failureReason}`);
  }
  w("");

  if (run.steps?.length) {
    w(`${C.bold}Step execution:${C.reset}`);
    for (const step of run.steps) {
      const icon = { completed: "✓", failed: "✗", running: "▶", skipped: "—", pending: "○" }[step.status] ?? "?";
      const color = sc[step.status] ?? C.dim;
      w(`  ${color}${icon}${C.reset}  ${step.name}  ${dim("[" + (step.status ?? "?") + "]")}`);
    }
    w("");
  }

  if (run.timelineEvents?.length) {
    w(`${C.bold}Timeline:${C.reset}`);
    for (const ev of run.timelineEvents) {
      const ts = ev.timestamp ? new Date(ev.timestamp).toLocaleTimeString() : "—";
      const color = ev.status === "failed" ? C.bred : ev.status === "completed" ? C.bgreen : C.bcyan;
      w(`  ${dim(ts)}  ${color}${ev.kind.replace(/_/g, " ")}${C.reset}  ${dim("·")}  ${ev.description}`);
    }
    w("");
  }

  w(dim("Suggested:"));
  w(`  ${C.bcyan}watch workflow run "${run.workflowName ?? run.workflowId}"${C.reset}  re-trigger this workflow`);
  w(`  ${C.bcyan}watch workflow runs${C.reset}                               view all recent runs`);
  w("");
}

// ── Alert trigger output ──────────────────────────────────────────────────────
export function printAlertTrigger(alert, context, response) {
  if (mode === "json") {
    process.stdout.write(JSON.stringify({
      type:    "alert_triggered",
      alert,
      context: { type: context.type, label: context.label },
      response,
    }, null, 2) + "\n");
    return;
  }

  const severityColor = { critical: C.bred, high: C.byellow, medium: C.yellow, low: C.bgreen };
  const sc = severityColor[alert.severity] ?? C.dim;

  w("");
  w(`${C.bold}${C.bred}[Alert Triggered]${C.reset}  ${sc}${alert.severity.toUpperCase()}${C.reset}`);
  w(dim("─".repeat(62)));
  w(`  ${dim("ID:")}        ${alert.id}`);
  w(`  ${dim("Type:")}      ${alert.type.replace(/_/g, " ")}`);
  w(`  ${dim("Time:")}      ${new Date(alert.timestamp).toLocaleString()}`);
  w(`  ${dim("Routed to:")} ${context.label}`);
  w("");
  w(`${C.bold}${C.byellow}[Alert]${C.reset}`);
  w(`  ${alert.description}`);
  w("");

  for (const sec of response.sections) {
    w(`${C.bold}${C.bcyan}[${sec.title}]${C.reset}`);
    for (const b of sec.bullets) w(`  ${dim("•")} ${b}`);
    w("");
  }

  w(`${C.bold}Risk level:${C.reset}  ${riskBadge(response.riskLevel)}`);
  w("");
  separator();
  printNextSteps([
    ...(response.nextSteps ?? []),
    "watch alerts",
  ]);
}

// ── Alert list ────────────────────────────────────────────────────────────────
export function printAlertList(alerts) {
  if (mode === "json") {
    process.stdout.write(JSON.stringify({ type: "alert_list", alerts }, null, 2) + "\n");
    return;
  }

  if (!alerts.length) {
    w("");
    w(dim("No queued alerts."));
    w(`  ${C.bcyan}watch trigger alert "<description>"${C.reset}  to simulate an alert`);
    w("");
    return;
  }

  const sc = { critical: C.bred, high: C.byellow, medium: C.yellow, low: C.bgreen };

  w("");
  w(`${C.bold}${C.bwhite}Alert Queue${C.reset}  ${dim("(" + alerts.length + " alerts)")}`);
  w(dim("─".repeat(62)));
  w("");

  for (const a of alerts) {
    const color = sc[a.severity] ?? C.dim;
    const statusDim = a.status === "handled" ? dim : (s) => s;
    w(`  ${color}${a.severity.toUpperCase().padEnd(8)}${C.reset}  ${statusDim(a.description)}`);
    w(`  ${dim("ID:")}     ${a.id}  ${dim("·")}  ${dim("Type: " + a.type)}  ${dim("·")}  ${dim(new Date(a.timestamp).toLocaleString())}`);
    if (a.assetId) w(`  ${dim("Asset:")}  ${a.assetId}`);
    if (a.status === "handled") w(`  ${C.bgreen}Handled${C.reset}  ${dim(a.handledAt ? new Date(a.handledAt).toLocaleTimeString() : "")}`);
    w("");
  }

  w(dim("Tip:  watch trigger alert \"<description>\"  to add a new alert"));
  w("");
}

// ── Risk list ─────────────────────────────────────────────────────────────────
export function printRiskList(risks) {
  if (mode === "json") {
    process.stdout.write(JSON.stringify({ type: "risk_list", risks }, null, 2) + "\n");
    return;
  }

  const execColor = {
    not_started:      C.dim,
    in_progress:      C.byellow,
    awaiting_approval:C.bcyan,
    completed:        C.bgreen,
    failed:           C.bred,
  };

  w("");
  w(`${C.bold}${C.bwhite}Risk Tracker${C.reset}  ${dim("(required interventions)")}`);
  w(dim("─".repeat(62)));
  w("");

  for (const risk of risks) {
    const ec  = execColor[risk.execution?.status ?? "not_started"];
    const exLabel = (risk.execution?.status ?? "not_started").replace(/_/g, " ").toUpperCase();
    w(`  ${C.bold}${risk.title}${C.reset}`);
    w(`  ${dim("Asset:")}      ${risk.affectedAsset}  ${dim("·")}  ${dim("Owner: " + risk.owner)}`);
    w(`  ${dim("Impact:")}     ${risk.reason}`);
    w(`  ${dim("Detected:")}   ${risk.detectedAt}  ${dim("·")}  ${dim("Source: " + risk.source)}`);
    w(`  ${dim("Execution:")}  ${ec}${exLabel}${C.reset}`);
    if (risk.execution?.status === "completed") {
      w(`  ${C.bgreen}Outcome:${C.reset}     ${risk.expectedOutcome}`);
    }
    w("");
  }

  w(dim("Tip:  watch ask \"What risks should I prioritise?\"  for AI analysis"));
  w("");
}

// ── Raw JSON output (always emits, ignores mode) ──────────────────────────────
export function jsonOutput(data) {
  process.stdout.write(JSON.stringify(data, null, 2) + "\n");
}

// ── Help ──────────────────────────────────────────────────────────────────────
export function printHelp() {
  w("");
  w(`${C.bold}${C.bwhite}watch${C.reset}  ${dim("(also: secops)  Security operations AI assistant")}`);
  w(dim("─".repeat(62)));
  w("");
  w(`${C.bold}AI query commands:${C.reset}`);
  w(`  ${C.bcyan}watch ask${C.reset} <query>                       Watch Center overview`);
  w(`  ${C.bcyan}watch agent${C.reset} <analyst> <query>            Analyst-specific query`);
  w(`  ${C.bcyan}watch asset${C.reset} <name> <query>               Asset query`);
  w(`  ${C.bcyan}watch attack-path${C.reset} <name> <query>         Attack path query`);
  w(`  ${C.bcyan}watch compliance${C.reset} <framework> <query>     Compliance query`);
  w(`  ${C.bcyan}watch investigate${C.reset} <entity>               Deep-dive investigation`);
  w(`  ${C.bcyan}watch explain${C.reset} <entity>                   Explain an entity`);
  w("");
  w(`${C.bold}Workflow commands:${C.reset}`);
  w(`  ${C.bcyan}watch workflow list${C.reset}                      List all workflows + status`);
  w(`  ${C.bcyan}watch workflow run${C.reset} "<name>"              Trigger a workflow`);
  w(`  ${C.bcyan}watch workflow runs${C.reset}                      Recent run history`);
  w(`  ${C.bcyan}watch workflow debug${C.reset} <run-id>            Inspect a specific run`);
  w(`  ${C.bcyan}watch workflow${C.reset} "<name>" "<query>"        AI query about a workflow`);
  w(`  ${C.bcyan}watch diagnose${C.reset} <workflow>                Diagnose workflow failures`);
  w("");
  w(`${C.bold}Alert & risk commands:${C.reset}`);
  w(`  ${C.bcyan}watch trigger alert${C.reset} "<description>"      Fire an alert → AI response`);
  w(`  ${C.bcyan}watch trigger cve${C.reset} "<description>"        Fire a CVE alert`);
  w(`  ${C.bcyan}watch trigger exposure${C.reset} "<description>"   Fire an exposure alert`);
  w(`  ${C.bcyan}watch alerts${C.reset}                             Show queued alerts`);
  w(`  ${C.bcyan}watch risk list${C.reset}                          Show risk tracker state`);
  w("");
  w(`${C.bold}Action flow:${C.reset}`);
  w(`  ${C.bgreen}watch confirm${C.reset}                           Execute pending action`);
  w(`  ${C.byellow}watch modify${C.reset} <field> <value>            Modify pending action`);
  w(`  ${C.bred}watch cancel${C.reset}                            Discard pending action`);
  w(`  ${C.bcyan}watch request-approval${C.reset}                   Request team approval`);
  w(`  ${C.bcyan}watch simulate${C.reset} <entity>                  Simulate impact`);
  w(`  ${C.bcyan}watch rerun${C.reset} <target>                     Re-run analysis`);
  w("");
  w(`${C.bold}Utilities:${C.reset}`);
  w(`  ${C.bcyan}watch status${C.reset}                             Session state`);
  w(`  ${C.bcyan}watch open-in-ui${C.reset}                         Generate UI deep-link`);
  w(`  ${C.bcyan}watch help${C.reset}                               This help`);
  w("");
  w(`${C.bold}Context flags (apply to any command):${C.reset}`);
  w(`  ${C.dim}--context agent:hotel${C.reset}      set context to a specific agent`);
  w(`  ${C.dim}--context asset:finance-db-01${C.reset}  set context to an asset`);
  w(`  ${C.dim}--asset <name>${C.reset}             shorthand for asset context`);
  w(`  ${C.dim}--id <agent-id>${C.reset}            shorthand for agent context`);
  w(`  ${C.dim}--format=json${C.reset}  (or ${C.dim}-j${C.reset})  Structured JSON output`);
  w("");
  w(`${C.bold}Examples:${C.reset}`);
  w(`  ${C.dim}watch ask "What risks should I prioritise?"${C.reset}`);
  w(`  ${C.dim}watch agent vulnerability "Explain findings"${C.reset}`);
  w(`  ${C.dim}watch ask "Re-evaluate asset" --asset finance-db-01${C.reset}`);
  w(`  ${C.dim}watch agent exposure --id foxtrot${C.reset}`);
  w(`  ${C.dim}watch investigate asset-123${C.reset}`);
  w(`  ${C.dim}watch workflow list${C.reset}`);
  w(`  ${C.dim}watch workflow run "Critical Alert Auto-Response"${C.reset}`);
  w(`  ${C.dim}watch workflow runs${C.reset}`);
  w(`  ${C.dim}watch workflow debug run-abc123${C.reset}`);
  w(`  ${C.dim}watch trigger alert "CVE-2025-9999 on finance-db-01" --asset finance-db-01${C.reset}`);
  w(`  ${C.dim}watch trigger exposure "finance-db-01 newly reachable from internet"${C.reset}`);
  w(`  ${C.dim}watch alerts${C.reset}`);
  w(`  ${C.dim}watch risk list${C.reset}`);
  w(`  ${C.dim}watch ask "what needs attention" -j${C.reset}`);
  w("");
}
