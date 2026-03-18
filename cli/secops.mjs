#!/usr/bin/env node
/**
 * secops — Security operations AI assistant CLI
 *
 * Provides the same AI contexts, skills, and action flows as the product UI
 * from the terminal.  Executable actions always produce a preview and require
 * explicit confirmation — they are never auto-run.
 *
 * Usage:
 *   secops ask <query>
 *   secops agent <analyst-name> <query>
 *   secops workflow <name> <query>
 *   secops asset <name> <query>
 *   secops attack-path <name> <query>
 *   secops compliance <framework> <query>
 *   secops investigate <entity>
 *   secops explain <entity>
 *   secops diagnose <workflow>
 *   secops simulate <entity>
 *   secops rerun <target>
 *   secops confirm
 *   secops modify <field> <value>
 *   secops cancel
 *   secops request-approval
 *   secops status
 *   secops open-in-ui
 *   secops help
 *
 * Flags:
 *   --format=json  (or -j)   Structured JSON output
 */

import {
  setMode, mode,
  contextHeader, sectionTitle, bullet, kv, blank, separator,
  riskBadge, printActionPreview, printSuccess,
  printError, printWarn, printInfo, printUpdate,
  printNextSteps, printDeepLink, printSessionStatus, printHelp,
} from "./lib/output.mjs";

import {
  resolveAgent, resolveWorkflow, resolveAsset,
  resolveAttackPath, resolveCompliance, watchCenterContext,
  inferContext, deriveUIPath, suggestSimilar,
} from "./lib/context-resolver.mjs";

import { classifyIntent, isExecutable } from "./lib/intent-classifier.mjs";
import { generateResponse }             from "./lib/response-engine.mjs";
import { buildActionPreview, applyModification, simulateResult } from "./lib/action-engine.mjs";
import { setPending, clearPending, setLastContext, getPending, getLastContext, readSession } from "./lib/session.mjs";
import { logCliAction }                 from "./lib/audit.mjs";
import { deepLinkForContext, describeDeepLink } from "./lib/deep-link.mjs";

// ── Parse arguments ───────────────────────────────────────────────────────────
const rawArgs = process.argv.slice(2);

// Extract --format=json / -j / --json before command parsing
let jsonFlag = false;
const args = rawArgs.filter(a => {
  if (a === "-j" || a === "--json" || a === "--format=json") { jsonFlag = true; return false; }
  if (a.startsWith("--format=")) { jsonFlag = a.split("=")[1] === "json"; return false; }
  return true;
});
if (jsonFlag) setMode("json");

const [cmd, ...rest] = args;

// ── Helpers ───────────────────────────────────────────────────────────────────
function printResponse(ctx, response) {
  if (mode === "json") {
    const out = {
      type:       "response",
      context:    { type: ctx.type, label: ctx.label },
      riskLevel:  response.riskLevel,
      sections:   response.sections,
      nextSteps:  response.nextSteps,
    };
    process.stdout.write(JSON.stringify(out, null, 2) + "\n");
    return;
  }

  contextHeader(ctx.label, ctx.sublabel ?? ctx.type);

  for (const sec of response.sections) {
    sectionTitle(sec.title);
    for (const b of sec.bullets) bullet(b);
    blank();
  }

  kv("Risk level", riskBadge(response.riskLevel));
  blank();
  separator();
  printNextSteps(response.nextSteps);
}

function handleActionIntent(ctx, intent, rawQuery) {
  const preview = buildActionPreview(ctx, intent);

  if (!preview) {
    // No action builder for this intent/context combination — fall through
    // to a read-only response
    const response = generateResponse(ctx, intent);
    printResponse(ctx, response);
    return;
  }

  // Store in session for confirm/modify/cancel
  setPending(preview);
  setLastContext(ctx);

  // Audit: initiated
  logCliAction({
    command:       [cmd, ...rest].join(" "),
    contextType:   ctx.type,
    actionTitle:   preview.title,
    scope:         preview.scope,
    guardrailLevel:preview.guardrailLevel,
    approvalStatus:preview.approvalRequired ? "pending" : "not-required",
    outcome:       "initiated",
  });

  printActionPreview(preview);
}

function dispatchQuery(ctx, query, forcedIntent) {
  setLastContext(ctx);

  if (ctx.isFallback) {
    printWarn(`Could not find an exact match for "${ctx.label}".`);
    printWarn("Showing closest available context. Use 'secops help' for valid entities.");
    blank();
  }

  const intent = forcedIntent ?? classifyIntent(query);

  if (isExecutable(intent)) {
    handleActionIntent(ctx, intent, query);
  } else {
    const response = generateResponse(ctx, intent);
    printResponse(ctx, response);

    // Audit: completed read-only
    logCliAction({
      command:       [cmd, ...rest].join(" "),
      contextType:   ctx.type,
      actionTitle:   `Query: ${query?.slice(0, 60) ?? "(no query)"}`,
      scope:         ctx.label,
      guardrailLevel:"L1",
      approvalStatus:"not-required",
      outcome:       "completed",
    });
  }
}

// ── Command handlers ──────────────────────────────────────────────────────────

// secops ask <query>
async function cmdAsk(query) {
  const ctx = watchCenterContext();
  dispatchQuery(ctx, query || "what needs attention");
}

// secops agent <analyst> <query>
async function cmdAgent(nameArg, query) {
  if (!nameArg) {
    printInfo("Available analysts:");
    const { AGENT_ROLES } = await import("./lib/context-resolver.mjs");
    for (const label of Object.values(AGENT_ROLES)) bullet(label);
    blank();
    printInfo('Example: secops agent "Vulnerability Analyst" "explain recent findings"');
    return;
  }

  const ctx = resolveAgent(nameArg);
  if (!ctx) {
    printError(`Analyst not found: "${nameArg}"`);
    const suggestions = suggestSimilar(nameArg);
    if (suggestions.length) printNextSteps(["Did you mean:", ...suggestions]);
    process.exit(1);
  }

  dispatchQuery(ctx, query || "summarise findings");
}

// secops workflow <name> <query>
async function cmdWorkflow(nameArg, query) {
  if (!nameArg) {
    printError("Provide a workflow name.  Example: secops workflow \"Critical Alert Auto-Response\" \"why is this failing?\"");
    process.exit(1);
  }

  const ctx = resolveWorkflow(nameArg);
  if (!ctx) {
    printError(`Workflow not found: "${nameArg}"`);
    const suggestions = suggestSimilar(nameArg);
    if (suggestions.length) printNextSteps(["Did you mean:", ...suggestions]);
    process.exit(1);
  }

  dispatchQuery(ctx, query || "summarise status");
}

// secops asset <name> <query>
async function cmdAsset(nameArg, query) {
  if (!nameArg) {
    printError("Provide an asset name.  Example: secops asset finance-db-01 \"assess current CIA risk\"");
    process.exit(1);
  }

  const ctx = resolveAsset(nameArg);
  dispatchQuery(ctx, query || "summarise");
}

// secops attack-path <name> <query>
async function cmdAttackPath(nameArg, query) {
  if (!nameArg) {
    printError("Provide an attack path name or ID.  Example: secops attack-path internet-to-finance-db-01 \"show why this is critical\"");
    process.exit(1);
  }

  const ctx = resolveAttackPath(nameArg);
  dispatchQuery(ctx, query || "summarise");
}

// secops compliance <framework> <query>
async function cmdCompliance(nameArg, query) {
  if (!nameArg) {
    printError("Provide a compliance framework.  Example: secops compliance \"PCI DSS\" \"show compliance gaps\"");
    process.exit(1);
  }

  const ctx = resolveCompliance(nameArg);
  dispatchQuery(ctx, query || "summarise");
}

// secops investigate <entity>  — infer context then investigate
async function cmdInvestigate(entity) {
  const ctx = inferContext(entity);
  dispatchQuery(ctx, "investigate", "investigate");
}

// secops explain <entity>
async function cmdExplain(entity) {
  const ctx = inferContext(entity);
  dispatchQuery(ctx, "explain", "explain");
}

// secops diagnose <workflow>
async function cmdDiagnose(nameArg) {
  const ctx = resolveWorkflow(nameArg) ?? inferContext(nameArg);
  dispatchQuery(ctx, "diagnose workflow failures", "diagnose");
}

// secops simulate <entity>
async function cmdSimulate(entity) {
  const ctx = inferContext(entity);
  handleActionIntent(ctx, "simulate", "simulate impact");
}

// secops rerun <target>
async function cmdRerun(target) {
  const ctx = inferContext(target);
  handleActionIntent(ctx, "rerun", "rerun analysis");
}

// secops confirm
async function cmdConfirm() {
  const pending = getPending();
  if (!pending) {
    printError("No pending action to confirm.  Use a command like 'secops rerun' to create one.");
    process.exit(1);
  }

  if (pending.approvalRequired) {
    printError(`"${pending.title}" requires approval before execution.`);
    printInfo("Use 'secops request-approval' to submit for team approval.");
    process.exit(1);
  }

  // Log confirmation
  logCliAction({
    command:       "confirm",
    contextType:   pending.contextType,
    actionTitle:   pending.title,
    scope:         pending.scope,
    guardrailLevel:pending.guardrailLevel,
    approvalStatus:"not-required",
    outcome:       "completed",
  });

  const result = simulateResult(pending);
  clearPending();
  printSuccess(result);
}

// secops modify <field> <value>
async function cmdModify(field, value) {
  const pending = getPending();
  if (!pending) {
    printError("No pending action to modify.  Create one first (e.g. 'secops rerun').");
    process.exit(1);
  }
  if (!field || !value) {
    printError("Usage: secops modify <field> <value>");
    printInfo("Available fields: " + Object.keys(pending.parameters ?? {}).join(", "));
    process.exit(1);
  }

  const updated = applyModification(pending, field, value);
  setPending(updated);

  // Human-readable field name for the update confirmation
  const displayField = field.charAt(0).toUpperCase() + field.slice(1).replace(/-/g, " ");
  printUpdate(displayField, value);
}

// secops cancel
async function cmdCancel() {
  const pending = getPending();
  if (!pending) {
    printInfo("No pending action — nothing to cancel.");
    return;
  }

  logCliAction({
    command:       "cancel",
    contextType:   pending.contextType,
    actionTitle:   pending.title,
    scope:         pending.scope,
    guardrailLevel:pending.guardrailLevel,
    approvalStatus:"not-required",
    outcome:       "cancelled",
  });

  clearPending();
  printInfo(`Cancelled: "${pending.title}" — no changes were made.`);
}

// secops request-approval
async function cmdRequestApproval() {
  const pending = getPending();
  if (!pending) {
    printError("No pending action.  Create one first (e.g. 'secops simulate finance-db-01').");
    process.exit(1);
  }

  if (!pending.approvalRequired) {
    printInfo(`"${pending.title}" does not require approval.  Run 'secops confirm' to proceed.`);
    return;
  }

  logCliAction({
    command:       "request-approval",
    contextType:   pending.contextType,
    actionTitle:   pending.title,
    scope:         pending.scope,
    guardrailLevel:pending.guardrailLevel,
    approvalStatus:"pending",
    outcome:       "initiated",
  });

  if (mode === "json") {
    process.stdout.write(JSON.stringify({
      type:    "approval_requested",
      action:  pending.title,
      scope:   pending.scope,
      message: "Approval request submitted.  You will be notified when approved.",
    }, null, 2) + "\n");
    return;
  }

  blank();
  printInfo(`Approval request submitted for: "${pending.title}"`);
  kv("  Scope", pending.scope);
  kv("  Guardrail level", pending.guardrailLevel);
  blank();
  printInfo("You will be notified when the request is approved.");
  printInfo("Once approved, run 'secops confirm' to execute.");
  blank();
}

// secops status
async function cmdStatus() {
  const session = readSession();
  printSessionStatus(session);
}

// secops open-in-ui
async function cmdOpenInUI() {
  const ctx = getLastContext() ?? watchCenterContext();
  const url = deepLinkForContext(ctx);
  const desc = describeDeepLink(ctx);
  printDeepLink(url, desc);
}

// ── Main dispatch ─────────────────────────────────────────────────────────────
switch (cmd) {
  case "ask":
    await cmdAsk(rest.join(" "));
    break;

  case "agent":
    await cmdAgent(rest[0], rest.slice(1).join(" "));
    break;

  case "workflow":
    await cmdWorkflow(rest[0], rest.slice(1).join(" "));
    break;

  case "asset":
    await cmdAsset(rest[0], rest.slice(1).join(" "));
    break;

  case "attack-path":
    await cmdAttackPath(rest[0], rest.slice(1).join(" "));
    break;

  case "compliance":
    await cmdCompliance(rest[0], rest.slice(1).join(" "));
    break;

  case "investigate":
    await cmdInvestigate(rest.join(" "));
    break;

  case "explain":
    await cmdExplain(rest.join(" "));
    break;

  case "diagnose":
    await cmdDiagnose(rest.join(" "));
    break;

  case "simulate":
    await cmdSimulate(rest.join(" "));
    break;

  case "rerun":
    await cmdRerun(rest.join(" "));
    break;

  case "confirm":
    await cmdConfirm();
    break;

  case "modify":
    await cmdModify(rest[0], rest.slice(1).join(" "));
    break;

  case "cancel":
    await cmdCancel();
    break;

  case "request-approval":
    await cmdRequestApproval();
    break;

  case "status":
    await cmdStatus();
    break;

  case "open-in-ui":
    await cmdOpenInUI();
    break;

  case "help":
  case "--help":
  case "-h":
    printHelp();
    break;

  case undefined:
    printHelp();
    break;

  default:
    // Treat unknown single-word args as a freeform question to Watch Center
    await cmdAsk(args.join(" "));
}
