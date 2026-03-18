/**
 * SessionAwareness — lightweight last-visit tracking for returning-user experience.
 *
 * Records the user's last meaningful session timestamp so AIBox can answer
 * "what changed since my last visit?" with temporal relevance.
 *
 * Nothing stored here is shown directly to the user — it powers relevance
 * calculations only.  Follows the same localStorage pattern as PersonaContext.
 */

const STORAGE_KEY = "secops:session";

/** Idle threshold — gap larger than this starts a new session */
const SESSION_IDLE_MS = 30 * 60 * 1000; // 30 minutes

interface SessionRecord {
  /** Unix ms timestamp of the user's last sealed visit */
  lastVisit: number;
  /** Page context label at last visit */
  lastContext: string;
  /** Unix ms timestamp when the current session began */
  sessionStart: number;
}

function read(): SessionRecord | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as SessionRecord) : null;
  } catch {
    return null;
  }
}

function write(record: SessionRecord): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(record));
  } catch {
    // ignore write failures (private browsing, storage quota)
  }
}

/**
 * Returns true when the user is returning after a meaningful idle period.
 * "Returning" = last sealed visit was > SESSION_IDLE_MS ago but < 30 days.
 * First-time visitors return false.
 */
export function isReturningUser(): boolean {
  const record = read();
  if (!record) return false;
  const elapsed = Date.now() - record.lastVisit;
  return elapsed > SESSION_IDLE_MS && elapsed < 30 * 24 * 60 * 60 * 1000;
}

/**
 * Human-readable label for when the user was last here.
 * Used to make AIBox responses feel grounded ("since 2 days ago", not raw timestamps).
 */
export function getLastVisitLabel(): string {
  const record = read();
  if (!record) return "a while ago";
  const elapsed = Date.now() - record.lastVisit;
  const minutes = Math.floor(elapsed / 60_000);
  const hours = Math.floor(elapsed / 3_600_000);
  const days = Math.floor(elapsed / 86_400_000);
  if (days >= 2) return `${days} days ago`;
  if (days === 1) return "yesterday";
  if (hours >= 1) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  if (minutes >= 1) return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
  return "a moment ago";
}

/**
 * Returns elapsed milliseconds since last sealed visit, or null for first visit.
 * Used to weight change significance — 3-day absence = broader summary than 30-min gap.
 */
export function msSinceLastVisit(): number | null {
  const record = read();
  return record ? Date.now() - record.lastVisit : null;
}

/**
 * Record a page visit.  Call this once per meaningful page load.
 *
 * If the idle gap since lastVisit exceeds SESSION_IDLE_MS, this is a new
 * session — the previous lastVisit is preserved as the "since" anchor while
 * sessionStart advances to now.
 *
 * If within the same session, only lastContext is updated.
 */
export function recordVisit(contextLabel: string): void {
  const now = Date.now();
  const existing = read();
  if (!existing) {
    // First ever visit — bootstrap record; no "returning" until sealed + re-opened
    write({ lastVisit: now, lastContext: contextLabel, sessionStart: now });
    return;
  }
  const elapsed = now - existing.lastVisit;
  if (elapsed > SESSION_IDLE_MS) {
    // New session — preserve lastVisit as the "since" anchor, advance sessionStart
    write({ lastVisit: existing.lastVisit, lastContext: contextLabel, sessionStart: now });
  } else {
    // Continuing session — just update context label
    write({ ...existing, lastContext: contextLabel });
  }
}

/**
 * Seal the current session by updating lastVisit to now.
 * Call on visibilitychange:hidden or beforeunload so the next session can
 * compute the correct "since" window.
 */
export function sealSession(): void {
  const now = Date.now();
  const existing = read();
  if (!existing) {
    write({ lastVisit: now, lastContext: "watch-center", sessionStart: now });
    return;
  }
  write({ ...existing, lastVisit: now });
}
