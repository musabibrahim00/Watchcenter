/**
 * session.mjs — Lightweight session state for the secops CLI
 *
 * Persists pending actions and last context between individual command
 * invocations using a temp file.  The session expires after 2 hours of
 * inactivity.
 */

import { readFileSync, writeFileSync, existsSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";

const SESSION_FILE = join(tmpdir(), ".secops-session.json");
const TTL_MS       = 2 * 60 * 60 * 1000; // 2 hours

/** @typedef {{ pending: object|null, lastContext: object|null, updatedAt: string }} Session */

function empty() {
  return { pending: null, lastContext: null, updatedAt: new Date().toISOString() };
}

export function readSession() {
  if (!existsSync(SESSION_FILE)) return empty();
  try {
    const raw = readFileSync(SESSION_FILE, "utf8");
    const data = JSON.parse(raw);
    // Expire stale sessions
    if (Date.now() - new Date(data.updatedAt).getTime() > TTL_MS) return empty();
    return data;
  } catch {
    return empty();
  }
}

export function writeSession(data) {
  const session = { ...readSession(), ...data, updatedAt: new Date().toISOString() };
  try {
    writeFileSync(SESSION_FILE, JSON.stringify(session, null, 2), "utf8");
  } catch {
    // Silently ignore write failures (e.g. in restricted environments)
  }
}

export function setPending(preview) {
  writeSession({ pending: preview });
}

export function clearPending() {
  writeSession({ pending: null });
}

export function setLastContext(ctx) {
  writeSession({ lastContext: ctx });
}

export function getPending() {
  return readSession().pending;
}

export function getLastContext() {
  return readSession().lastContext;
}

export function clearSession() {
  writeSession(empty());
}
