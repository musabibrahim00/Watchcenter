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

// ── Raw JSON output (always emits, ignores mode) ──────────────────────────────
export function jsonOutput(data) {
  process.stdout.write(JSON.stringify(data, null, 2) + "\n");
}

// ── Help ──────────────────────────────────────────────────────────────────────
export function printHelp() {
  w("");
  w(`${C.bold}${C.bwhite}secops${C.reset}  ${dim("Security operations AI assistant")}`);
  w(dim("─".repeat(62)));
  w("");
  w(`${C.bold}Context commands:${C.reset}`);
  w(`  ${C.bcyan}secops ask${C.reset} <query>                  Watch Center overview`);
  w(`  ${C.bcyan}secops agent${C.reset} <analyst> <query>       Analyst-specific query`);
  w(`  ${C.bcyan}secops workflow${C.reset} <name> <query>       Workflow query`);
  w(`  ${C.bcyan}secops asset${C.reset} <name> <query>          Asset query`);
  w(`  ${C.bcyan}secops attack-path${C.reset} <name> <query>    Attack path query`);
  w(`  ${C.bcyan}secops compliance${C.reset} <control> <query>  Compliance query`);
  w("");
  w(`${C.bold}Shorthand commands:${C.reset}`);
  w(`  ${C.bcyan}secops investigate${C.reset} <entity>          Deep-dive investigation`);
  w(`  ${C.bcyan}secops explain${C.reset} <entity>              Explain an entity`);
  w(`  ${C.bcyan}secops diagnose${C.reset} <workflow>           Diagnose workflow failures`);
  w(`  ${C.bcyan}secops simulate${C.reset} <entity>             Simulate impact`);
  w(`  ${C.bcyan}secops rerun${C.reset} <analysis-target>       Re-run analysis`);
  w("");
  w(`${C.bold}Action flow commands:${C.reset}`);
  w(`  ${C.bgreen}secops confirm${C.reset}                      Execute pending action`);
  w(`  ${C.byellow}secops modify${C.reset} <field> <value>       Modify pending action`);
  w(`  ${C.bred}secops cancel${C.reset}                       Discard pending action`);
  w(`  ${C.bcyan}secops request-approval${C.reset}              Request team approval`);
  w("");
  w(`${C.bold}Utility commands:${C.reset}`);
  w(`  ${C.bcyan}secops status${C.reset}                        Show session state`);
  w(`  ${C.bcyan}secops open-in-ui${C.reset}                    Generate UI deep-link`);
  w(`  ${C.bcyan}secops help${C.reset}                          Show this help`);
  w("");
  w(`${C.bold}Flags:${C.reset}`);
  w(`  ${C.dim}--format=json${C.reset}  (or ${C.dim}-j${C.reset})   Structured JSON output`);
  w("");
  w(`${C.bold}Examples:${C.reset}`);
  w(`  ${C.dim}secops agent "Vulnerability Analyst" "explain recent findings"${C.reset}`);
  w(`  ${C.dim}secops asset finance-db-01 "assess current CIA risk"${C.reset}`);
  w(`  ${C.dim}secops attack-path internet-to-finance-db-01 "show why this is critical"${C.reset}`);
  w(`  ${C.dim}secops rerun "Vulnerability Analyst"${C.reset}`);
  w(`  ${C.dim}secops confirm${C.reset}`);
  w(`  ${C.dim}secops ask "what needs attention" --format=json${C.reset}`);
  w("");
}
