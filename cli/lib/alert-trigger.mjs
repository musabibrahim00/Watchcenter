/**
 * alert-trigger.mjs — Alert → AI trigger model
 *
 * Implements the event-driven entry point: when a risk/alert arrives,
 * a structured AI trigger event is created, routed through the same
 * intent classification and response engine as AIBox, and a
 * recommendation is returned.
 *
 * Architecture mirrors the UI's aibox-inject-query CustomEvent pattern:
 *   alert → classify intent → generateResponse() → recommendation
 *
 * State is persisted in a tmp file so queued alerts survive across
 * invocations (same session model as pending actions).
 */

import { readFileSync, writeFileSync, existsSync } from "fs";
import { tmpdir } from "os";
import { join }   from "path";

import { classifyIntent }      from "./intent-classifier.mjs";
import { generateResponse }    from "./response-engine.mjs";
import { resolveAsset, inferContext, watchCenterContext } from "./context-resolver.mjs";

const ALERT_FILE = join(tmpdir(), ".secops-alerts.json");

// ── Alert types and their default severity ────────────────────────────────────
const ALERT_SEVERITY = {
  cve:          "critical",
  vulnerability:"critical",
  attack_path:  "critical",
  exposure:     "high",
  misconfiguration: "high",
  identity:     "high",
  compliance:   "medium",
  generic:      "medium",
};

// ── Alert → context mapping ────────────────────────────────────────────────────
function alertTypeToContext(type, assetId) {
  if (assetId) return resolveAsset(assetId);

  const typeMap = {
    cve:              () => ({ type: "agent", agentId: "hotel", label: "Vulnerability Analyst",          sublabel: "Alert Context" }),
    vulnerability:    () => ({ type: "agent", agentId: "hotel", label: "Vulnerability Analyst",          sublabel: "Alert Context" }),
    attack_path:      () => ({ type: "agent", agentId: "foxtrot", label: "Exposure Analyst",             sublabel: "Alert Context" }),
    exposure:         () => ({ type: "agent", agentId: "foxtrot", label: "Exposure Analyst",             sublabel: "Alert Context" }),
    misconfiguration: () => ({ type: "agent", agentId: "bravo", label: "Configuration Security Analyst", sublabel: "Alert Context" }),
    identity:         () => ({ type: "agent", agentId: "golf",  label: "Identity Security Analyst",      sublabel: "Alert Context" }),
    compliance:       () => ({ type: "agent", agentId: "delta", label: "Governance & Compliance Analyst",sublabel: "Alert Context" }),
  };
  return (typeMap[type] ?? watchCenterContext)();
}

// ── Alert → natural-language query ────────────────────────────────────────────
function alertToQuery(type, description) {
  const prefixes = {
    cve:              "A new vulnerability has been detected: ",
    vulnerability:    "Vulnerability alert: ",
    attack_path:      "New attack path discovered: ",
    exposure:         "Exposure alert: ",
    misconfiguration: "Misconfiguration detected: ",
    identity:         "Identity anomaly alert: ",
    compliance:       "Compliance alert: ",
    generic:          "Alert: ",
  };
  const prefix = prefixes[type] ?? "Security alert: ";
  return `${prefix}${description}. What is the risk and what should be done immediately?`;
}

// ── Alert queue (file-backed) ──────────────────────────────────────────────────
function readAlerts() {
  if (!existsSync(ALERT_FILE)) return [];
  try {
    return JSON.parse(readFileSync(ALERT_FILE, "utf8"));
  } catch {
    return [];
  }
}

function writeAlerts(alerts) {
  try {
    writeFileSync(ALERT_FILE, JSON.stringify(alerts, null, 2), "utf8");
  } catch {
    // Silently ignore (restricted environments)
  }
}

function saveAlert(alert) {
  const alerts = readAlerts();
  const updated = [alert, ...alerts].slice(0, 50); // keep last 50
  writeAlerts(updated);
}

// ── Classify alert type from description ──────────────────────────────────────
function inferAlertType(description) {
  const d = description.toLowerCase();
  if (/\bcve\b/.test(d))                          return "cve";
  if (/\bvulnerabilit/.test(d))                   return "vulnerability";
  if (/\battack.?path|lateral.?movement/.test(d)) return "attack_path";
  if (/\bexposure|exposed|reachable/.test(d))     return "exposure";
  if (/\bmisconfig/.test(d))                      return "misconfiguration";
  if (/\bidentity|login|privilege|mfa|iam/.test(d)) return "identity";
  if (/\bcompliance|policy|audit|gap/.test(d))    return "compliance";
  return "generic";
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * triggerAlert — Create an alert event and immediately route it through
 * the AI response engine, mirroring the aibox-inject-query pipeline.
 *
 * Returns: { alert, context, query, response }
 */
export function triggerAlert({ type: explicitType, description, assetId } = {}) {
  if (!description) return { error: "Alert description is required." };

  const type      = explicitType ?? inferAlertType(description);
  const severity  = ALERT_SEVERITY[type] ?? "medium";
  const alertId   = `alert-${Date.now().toString(36)}`;
  const timestamp = new Date().toISOString();

  const alert = {
    id:          alertId,
    type,
    severity,
    description,
    assetId:     assetId ?? null,
    timestamp,
    status:      "new",
  };

  saveAlert(alert);

  // Route through same context + intent + response pipeline as AIBox
  const ctx   = alertTypeToContext(type, assetId);
  const query = alertToQuery(type, description);
  const intent = classifyIntent(query);
  const response = generateResponse(ctx, intent);

  return { alert, context: ctx, query, intent, response };
}

/**
 * listAlerts — Return queued alerts, newest first.
 */
export function listAlerts(limit = 20) {
  return readAlerts().slice(0, limit);
}

/**
 * clearAlerts — Clear the alert queue.
 */
export function clearAlerts() {
  writeAlerts([]);
}

/**
 * markAlertHandled — Update alert status in queue.
 */
export function markAlertHandled(alertId) {
  const alerts = readAlerts();
  const updated = alerts.map(a =>
    a.id === alertId ? { ...a, status: "handled", handledAt: new Date().toISOString() } : a
  );
  writeAlerts(updated);
  return updated.find(a => a.id === alertId) ?? null;
}
