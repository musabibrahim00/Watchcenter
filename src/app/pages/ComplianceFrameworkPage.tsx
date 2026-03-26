import React, { useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router";
import {
  ArrowLeft, CheckCircle2, XCircle, AlertCircle, Clock,
  FileText, Sparkles, AlertTriangle, Calendar, TrendingDown,
  ChevronRight, X, BookmarkPlus, BookmarkCheck, ListChecks, Shield,
  FolderOpen, ClipboardList, FileCheck2, ClipboardCheck, Search, User, StickyNote,
} from "lucide-react";
import { colors } from "../shared/design-system/tokens";
import { PageHeader } from "../shared/components/ui";
import { useAiBox } from "../features/ai-box";
import { useEvidenceStore } from "../features/compliance/evidence-store";
import { ActionableEvidenceRow } from "../features/compliance/ActionableEvidenceRow";
import {
  FRAMEWORKS, FRAMEWORK_CONTROLS, FRAMEWORK_POLICIES, GAPS, EVIDENCE_ITEMS, UPCOMING_AUDITS,
  type FrameworkControl, type FrameworkPolicy, type PolicyStatus, type ControlStatus, type EvidenceStatus,
} from "./compliance-data";

/* ================================================================
   CONSTANTS
   ================================================================ */

const FOLLOW_UP_KEY = "wc:compliance:followup";

function getFollowUps(): Set<string> {
  try { return new Set(JSON.parse(localStorage.getItem(FOLLOW_UP_KEY) ?? "[]")); }
  catch { return new Set(); }
}

function toggleFollowUp(id: string): boolean {
  const set = getFollowUps();
  if (set.has(id)) { set.delete(id); } else { set.add(id); }
  localStorage.setItem(FOLLOW_UP_KEY, JSON.stringify([...set]));
  return set.has(id);
}

const CTRL_OWNER_KEY = "wc:compliance:ctrl-owner";
const CTRL_NOTE_KEY  = "wc:compliance:ctrl-note";

function getCtrlOwner(id: string): string {
  try { return JSON.parse(localStorage.getItem(CTRL_OWNER_KEY) ?? "{}")[id] ?? ""; }
  catch { return ""; }
}

function setCtrlOwner(id: string, val: string) {
  try {
    const map = JSON.parse(localStorage.getItem(CTRL_OWNER_KEY) ?? "{}");
    if (val) { map[id] = val; } else { delete map[id]; }
    localStorage.setItem(CTRL_OWNER_KEY, JSON.stringify(map));
  } catch { /* ignore */ }
}

function getCtrlNote(id: string): string {
  try { return JSON.parse(localStorage.getItem(CTRL_NOTE_KEY) ?? "{}")[id] ?? ""; }
  catch { return ""; }
}

function setCtrlNote(id: string, val: string) {
  try {
    const map = JSON.parse(localStorage.getItem(CTRL_NOTE_KEY) ?? "{}");
    if (val) { map[id] = val; } else { delete map[id]; }
    localStorage.setItem(CTRL_NOTE_KEY, JSON.stringify(map));
  } catch { /* ignore */ }
}

/* ================================================================
   HELPERS
   ================================================================ */

const CONTROL_STATUS_COLOR: Record<ControlStatus, string> = {
  passing:       colors.success,
  failing:       colors.critical,
  "in-progress": colors.medium,
  "not-started": colors.textDim,
};

const CONTROL_STATUS_ICON: Record<ControlStatus, React.ReactNode> = {
  passing:       <CheckCircle2 size={13} color={colors.success}  />,
  failing:       <XCircle      size={13} color={colors.critical} />,
  "in-progress": <AlertCircle  size={13} color={colors.medium}   />,
  "not-started": <Clock        size={13} color={colors.textDim}  />,
};

const EVIDENCE_STATUS_COLOR: Record<EvidenceStatus, string> = {
  collected: colors.success,
  pending:   colors.medium,
  overdue:   colors.critical,
};

const STATUS_SORT: Record<ControlStatus, number> = {
  failing: 0, "in-progress": 1, "not-started": 2, passing: 3,
};

/* ================================================================
   CONTROL TABLE ROW
   ================================================================ */

function ControlTableRow({
  ctrl, isSelected, onSelect, owner,
}: {
  ctrl: FrameworkControl;
  isSelected: boolean;
  onSelect: (ctrl: FrameworkControl) => void;
  owner: string;
}) {
  const statusColor    = CONTROL_STATUS_COLOR[ctrl.status];
  const evidenceCount  = ctrl.evidenceIds?.length ?? 0;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onSelect(ctrl)}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") onSelect(ctrl); }}
      className="flex items-center gap-0 cursor-pointer select-none transition-colors"
      style={{
        background: isSelected
          ? `${statusColor}12`
          : ctrl.status === "failing" ? `${colors.critical}06` : "transparent",
        borderBottom: `1px solid ${colors.border}`,
        outline: "none",
      }}
      onMouseEnter={(e) => {
        if (!isSelected) (e.currentTarget as HTMLDivElement).style.background = "rgba(255,255,255,0.03)";
      }}
      onMouseLeave={(e) => {
        if (!isSelected) (e.currentTarget as HTMLDivElement).style.background =
          ctrl.status === "failing" ? `${colors.critical}06` : "transparent";
      }}
    >
      {/* ID */}
      <div className="shrink-0 px-[12px] py-[8px]" style={{ width: 88 }}>
        <span className="text-[11px] font-mono font-semibold" style={{ color: statusColor }}>
          {ctrl.id}
        </span>
      </div>

      {/* Name + category */}
      <div className="flex-1 min-w-0 px-[8px] py-[8px]">
        <p
          style={{ fontSize: 12, fontWeight: 600, color: colors.textPrimary, lineHeight: 1.3 }}
          className="truncate"
        >
          {ctrl.name}
        </p>
        <p style={{ fontSize: 10, color: colors.textDim, marginTop: 1 }} className="truncate">
          {ctrl.category}
        </p>
      </div>

      {/* Status */}
      <div className="shrink-0 px-[8px] py-[8px]" style={{ width: 110 }}>
        <span
          className="flex items-center gap-[5px] px-[7px] py-[3px] rounded-[5px] w-fit text-[10px] font-semibold capitalize"
          style={{
            background: `${statusColor}14`,
            color: statusColor,
            border: `1px solid ${statusColor}28`,
          }}
        >
          {CONTROL_STATUS_ICON[ctrl.status]}
          {ctrl.status}
        </span>
      </div>

      {/* Owner */}
      <div className="shrink-0 px-[8px] py-[8px]" style={{ width: 120 }}>
        <span
          style={{ fontSize: 11, color: owner ? colors.textMuted : colors.textDim }}
          className="truncate block"
        >
          {owner || "—"}
        </span>
      </div>

      {/* Evidence */}
      <div className="shrink-0 px-[8px] py-[8px] flex items-center gap-[5px]" style={{ width: 80 }}>
        <FileCheck2 size={11} color={evidenceCount > 0 ? colors.success : colors.textDim} />
        <span style={{ fontSize: 11, color: evidenceCount > 0 ? colors.textMuted : colors.textDim }}>
          {evidenceCount}
        </span>
        {ctrl.gapId && (
          <AlertTriangle size={10} color={colors.critical} className="ml-[2px]" />
        )}
      </div>

      {/* Chevron */}
      <div className="shrink-0 px-[10px]">
        <ChevronRight size={12} color={isSelected ? statusColor : colors.textDim} />
      </div>
    </div>
  );
}

/* ================================================================
   EVIDENCE ROW  (compact)
   ================================================================ */

function EvidenceRow({ ev }: { ev: typeof EVIDENCE_ITEMS[number] }) {
  const isOverdue = ev.status === "overdue";
  return (
    <div
      className="flex items-center gap-[10px] px-[12px] py-[9px] rounded-[7px]"
      style={{
        background: isOverdue ? `${colors.critical}08` : "transparent",
        border: `1px solid ${isOverdue ? colors.critical + "28" : colors.border}`,
        marginBottom: 3,
      }}
    >
      <FileText size={12} color={EVIDENCE_STATUS_COLOR[ev.status]} className="shrink-0" />
      <div className="flex-1 min-w-0">
        <p style={{ fontSize: 11, fontWeight: 600, color: colors.textPrimary }}>{ev.name}</p>
        <p style={{ fontSize: 10, color: colors.textMuted }}>
          {ev.control} · Due {ev.dueDate}
        </p>
      </div>
      <span
        className="shrink-0 px-[6px] py-[1px] rounded-full text-[9px] font-medium capitalize"
        style={{
          background: `${EVIDENCE_STATUS_COLOR[ev.status]}14`,
          color: EVIDENCE_STATUS_COLOR[ev.status],
          border: `1px solid ${EVIDENCE_STATUS_COLOR[ev.status]}28`,
        }}
      >
        {ev.status}
      </span>
    </div>
  );
}

/* ================================================================
   CONTROL DETAIL PANEL
   Replaces right sidebar when a control is selected.
   ================================================================ */

function ControlDetailPanel({
  ctrl,
  frameworkName,
  onClose,
  onAskAI,
}: {
  ctrl: FrameworkControl;
  frameworkName: string;
  onClose: () => void;
  onAskAI: (ctrl: FrameworkControl) => void;
}) {
  const [followedUp, setFollowedUp] = React.useState(() => getFollowUps().has(ctrl.id));
  const [owner, setOwner]           = React.useState(() => getCtrlOwner(ctrl.id));
  const [note, setNote]             = React.useState(() => getCtrlNote(ctrl.id));

  // Sync state when ctrl changes
  React.useEffect(() => {
    setFollowedUp(getFollowUps().has(ctrl.id));
    setOwner(getCtrlOwner(ctrl.id));
    setNote(getCtrlNote(ctrl.id));
  }, [ctrl.id]);

  const gap            = GAPS.find(g => g.id === ctrl.gapId);
  const linkedEvidence = EVIDENCE_ITEMS.filter(e => ctrl.evidenceIds?.includes(e.id));
  const statusColor    = CONTROL_STATUS_COLOR[ctrl.status];
  const audit          = UPCOMING_AUDITS.find(a =>
    FRAMEWORK_CONTROLS[a.fwId]?.some(c => c.id === ctrl.id)
  );

  function handleToggleFollowUp() {
    const next = toggleFollowUp(ctrl.id);
    setFollowedUp(next);
  }

  return (
    <div
      className="flex flex-col h-full rounded-[12px] overflow-hidden"
      style={{ background: colors.bgCard, border: `1px solid ${statusColor}33` }}
    >
      {/* Panel header */}
      <div
        className="flex items-start justify-between gap-[10px] px-[16px] py-[14px] shrink-0"
        style={{ borderBottom: `1px solid ${colors.border}` }}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-[7px] mb-[3px]">
            {CONTROL_STATUS_ICON[ctrl.status]}
            <span
              className="text-[11px] font-mono font-semibold"
              style={{ color: statusColor }}
            >
              {ctrl.id}
            </span>
            <span
              className="px-[6px] py-[1px] rounded-full text-[9px] font-bold uppercase"
              style={{
                background: `${statusColor}14`,
                color: statusColor,
                border: `1px solid ${statusColor}28`,
              }}
            >
              {ctrl.status}
            </span>
          </div>
          <p style={{ fontSize: 13, fontWeight: 700, color: colors.textPrimary, lineHeight: 1.3 }}>
            {ctrl.name}
          </p>
          <p style={{ fontSize: 10, color: colors.textDim, marginTop: 2 }}>{frameworkName}</p>
        </div>
        <button
          onClick={onClose}
          className="shrink-0 flex items-center justify-center size-[26px] rounded-[6px] cursor-pointer transition-colors"
          style={{ background: "rgba(255,255,255,0.04)", color: colors.textDim }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.08)"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.04)"; }}
        >
          <X size={13} />
        </button>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-[16px] py-[14px] flex flex-col gap-[16px]">

        {/* Why it matters */}
        {ctrl.whyItMatters && (
          <div>
            <div className="flex items-center gap-[6px] mb-[7px]">
              <Shield size={11} color={colors.textDim} />
              <span style={{ fontSize: 10, fontWeight: 700, color: colors.textDim, letterSpacing: "0.07em", textTransform: "uppercase" }}>
                Why this matters
              </span>
            </div>
            <p style={{ fontSize: 12, color: colors.textMuted, lineHeight: 1.6 }}>
              {ctrl.whyItMatters}
            </p>
          </div>
        )}

        {/* Related gap */}
        {gap && (
          <div
            className="flex flex-col gap-[6px] p-[12px] rounded-[8px]"
            style={{
              background: `${gap.severity === "critical" ? colors.critical : colors.high}0a`,
              border: `1px solid ${gap.severity === "critical" ? colors.critical : colors.high}28`,
            }}
          >
            <div className="flex items-center gap-[6px]">
              <AlertTriangle size={11} color={gap.severity === "critical" ? colors.critical : colors.high} />
              <span style={{ fontSize: 10, fontWeight: 700, color: colors.textDim, letterSpacing: "0.07em", textTransform: "uppercase" }}>
                Open gap
              </span>
              <span
                className="px-[6px] py-[1px] rounded-full text-[9px] font-bold uppercase"
                style={{
                  background: `${gap.severity === "critical" ? colors.critical : colors.high}18`,
                  color: gap.severity === "critical" ? colors.critical : colors.high,
                }}
              >
                {gap.severity}
              </span>
            </div>
            <p style={{ fontSize: 12, fontWeight: 600, color: colors.textPrimary }}>{gap.title}</p>
            <div className="flex items-center gap-[12px]">
              <span style={{ fontSize: 10, color: colors.textMuted }}>{gap.daysOpen} days open</span>
              <span style={{ fontSize: 10, color: colors.textMuted }}>Owner: {gap.owner}</span>
            </div>
          </div>
        )}

        {/* Remediation steps */}
        {ctrl.remediationSteps && ctrl.remediationSteps.length > 0 && (
          <div>
            <div className="flex items-center gap-[6px] mb-[8px]">
              <ListChecks size={11} color={colors.textDim} />
              <span style={{ fontSize: 10, fontWeight: 700, color: colors.textDim, letterSpacing: "0.07em", textTransform: "uppercase" }}>
                Remediation steps
              </span>
            </div>
            <ol className="flex flex-col gap-[6px]">
              {ctrl.remediationSteps.map((step, i) => (
                <li key={i} className="flex items-start gap-[9px]">
                  <span
                    className="shrink-0 flex items-center justify-center rounded-full size-[17px] text-[9px] font-bold mt-[1px]"
                    style={{ background: `${colors.primary}18`, color: colors.primary, border: `1px solid ${colors.primary}28` }}
                  >
                    {i + 1}
                  </span>
                  <span style={{ fontSize: 12, color: colors.textMuted, lineHeight: 1.5 }}>{step}</span>
                </li>
              ))}
            </ol>
          </div>
        )}

        {/* Required evidence */}
        {ctrl.requiredEvidence && ctrl.requiredEvidence.length > 0 && (
          <div>
            <div className="flex items-center gap-[6px] mb-[8px]">
              <FileText size={11} color={colors.textDim} />
              <span style={{ fontSize: 10, fontWeight: 700, color: colors.textDim, letterSpacing: "0.07em", textTransform: "uppercase" }}>
                Required evidence
              </span>
            </div>
            <div className="flex flex-col gap-[4px]">
              {ctrl.requiredEvidence.map((ev, i) => (
                <div key={i} className="flex items-start gap-[7px]">
                  <div
                    className="shrink-0 size-[5px] rounded-full mt-[6px]"
                    style={{ background: colors.medium }}
                  />
                  <span style={{ fontSize: 11, color: colors.textMuted, lineHeight: 1.5 }}>{ev}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Linked evidence (already collected) */}
        {linkedEvidence.length > 0 && (
          <div>
            <div className="flex items-center gap-[6px] mb-[8px]">
              <CheckCircle2 size={11} color={colors.textDim} />
              <span style={{ fontSize: 10, fontWeight: 700, color: colors.textDim, letterSpacing: "0.07em", textTransform: "uppercase" }}>
                Collected evidence
              </span>
            </div>
            {linkedEvidence.map(ev => <EvidenceRow key={ev.id} ev={ev} />)}
          </div>
        )}

        {/* Audit impact */}
        {audit && (
          <div
            className="flex flex-col gap-[7px] p-[12px] rounded-[8px]"
            style={{ background: `${colors.primary}0a`, border: `1px solid ${colors.primary}22` }}
          >
            <div className="flex items-center gap-[6px]">
              <Calendar size={11} color={colors.primary} />
              <span style={{ fontSize: 10, fontWeight: 700, color: colors.textDim, letterSpacing: "0.07em", textTransform: "uppercase" }}>
                Audit impact
              </span>
            </div>
            <p style={{ fontSize: 12, fontWeight: 600, color: colors.textPrimary }}>{audit.name}</p>
            <p style={{ fontSize: 10, color: colors.textMuted }}>
              {audit.date} · {audit.daysUntil} days away · Readiness {audit.readiness}%
              {audit.readiness < 80 && (
                <span style={{ color: colors.critical }}> — at risk</span>
              )}
            </p>
            {ctrl.status === "failing" && (
              <p style={{ fontSize: 11, color: colors.medium, lineHeight: 1.45, marginTop: 2 }}>
                This control failing will be a direct audit finding. Resolving it before the audit date improves readiness and reduces the risk of a qualified opinion.
              </p>
            )}
          </div>
        )}

        {/* Passing state */}
        {ctrl.status === "passing" && !ctrl.whyItMatters && (
          <div
            className="flex items-center gap-[8px] p-[12px] rounded-[8px]"
            style={{ background: `${colors.success}0a`, border: `1px solid ${colors.success}22` }}
          >
            <CheckCircle2 size={14} color={colors.success} />
            <p style={{ fontSize: 12, color: colors.textMuted }}>
              This control is passing. No action required.
              {ctrl.lastTested && ` Last verified ${ctrl.lastTested}.`}
            </p>
          </div>
        )}

        {/* Change owner */}
        <div>
          <div className="flex items-center gap-[6px] mb-[7px]">
            <User size={11} color={colors.textDim} />
            <span style={{ fontSize: 10, fontWeight: 700, color: colors.textDim, letterSpacing: "0.07em", textTransform: "uppercase" }}>
              Owner
            </span>
          </div>
          <input
            type="text"
            value={owner}
            placeholder={gap?.owner ?? "Assign owner…"}
            onChange={(e) => setOwner(e.target.value)}
            onBlur={(e) => setCtrlOwner(ctrl.id, e.target.value)}
            className="w-full px-[10px] py-[7px] rounded-[7px] text-[12px] outline-none"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: `1px solid ${colors.border}`,
              color: colors.textPrimary,
            }}
          />
        </div>

        {/* Add note */}
        <div>
          <div className="flex items-center gap-[6px] mb-[7px]">
            <StickyNote size={11} color={colors.textDim} />
            <span style={{ fontSize: 10, fontWeight: 700, color: colors.textDim, letterSpacing: "0.07em", textTransform: "uppercase" }}>
              Note
            </span>
          </div>
          <textarea
            value={note}
            placeholder="Add a note…"
            rows={3}
            onChange={(e) => setNote(e.target.value)}
            onBlur={(e) => setCtrlNote(ctrl.id, e.target.value)}
            className="w-full px-[10px] py-[7px] rounded-[7px] text-[12px] outline-none resize-none"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: `1px solid ${colors.border}`,
              color: colors.textPrimary,
              lineHeight: 1.5,
            }}
          />
        </div>
      </div>

      {/* Action footer */}
      <div
        className="shrink-0 flex flex-col gap-[8px] px-[16px] py-[14px]"
        style={{ borderTop: `1px solid ${colors.border}` }}
      >
        {/* Remediate with AI — only for non-passing */}
        {ctrl.status !== "passing" && (
          <button
            onClick={() => onAskAI(ctrl)}
            className="w-full flex items-center justify-center gap-[6px] px-[12px] py-[9px] rounded-[8px] text-[12px] font-semibold cursor-pointer transition-colors"
            style={{ background: `${statusColor}18`, color: statusColor, border: `1px solid ${statusColor}2a` }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = `${statusColor}28`; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = `${statusColor}18`; }}
          >
            <Sparkles size={13} />
            Remediate with AI
          </button>
        )}

        {/* Mark for follow-up */}
        <button
          onClick={handleToggleFollowUp}
          className="w-full flex items-center justify-center gap-[6px] px-[12px] py-[8px] rounded-[8px] text-[12px] font-medium cursor-pointer transition-colors"
          style={{
            background: followedUp ? `${colors.accent}14` : "rgba(255,255,255,0.04)",
            color: followedUp ? colors.accent : colors.textMuted,
            border: `1px solid ${followedUp ? colors.accent + "33" : "rgba(255,255,255,0.08)"}`,
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = followedUp ? `${colors.accent}20` : "rgba(255,255,255,0.07)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = followedUp ? `${colors.accent}14` : "rgba(255,255,255,0.04)";
          }}
        >
          {followedUp ? <BookmarkCheck size={13} /> : <BookmarkPlus size={13} />}
          {followedUp ? "Following up" : "Mark for follow-up"}
        </button>
      </div>
    </div>
  );
}

/* ================================================================
   DEFAULT RIGHT SIDEBAR  (shown when no control is selected)
   ================================================================ */

function DefaultSidebar({
  evidence,
  audit,
  gaps,
}: {
  evidence: typeof EVIDENCE_ITEMS[number][];
  audit: typeof UPCOMING_AUDITS[number] | undefined;
  gaps: typeof GAPS;
}) {
  return (
    <div className="flex flex-col gap-[16px]">
      {/* Evidence */}
      <div
        className="flex flex-col gap-[10px] p-[16px] rounded-[12px]"
        style={{ background: colors.bgCard, border: `1px solid ${colors.border}` }}
      >
        <p style={{ fontSize: 11, fontWeight: 700, color: colors.textDim, letterSpacing: "0.08em", textTransform: "uppercase" }}>
          Evidence ({evidence.length})
        </p>
        {evidence.length === 0 ? (
          <p style={{ fontSize: 12, color: colors.textDim }}>No evidence items for this framework.</p>
        ) : (
          evidence
            .slice()
            .sort((a, b) => {
              const o: Record<EvidenceStatus, number> = { overdue: 0, pending: 1, collected: 2 };
              return o[a.status] - o[b.status];
            })
            .map(ev => <EvidenceRow key={ev.id} ev={ev} />)
        )}
      </div>

      {/* Upcoming audit detail */}
      {audit && (
        <div
          className="flex flex-col gap-[12px] p-[16px] rounded-[12px]"
          style={{ background: colors.bgCard, border: `1px solid ${audit.readiness < 80 ? colors.medium + "44" : colors.border}` }}
        >
          <div className="flex items-start justify-between gap-[8px]">
            <div>
              <p style={{ fontSize: 12, fontWeight: 700, color: colors.textPrimary }}>{audit.name}</p>
              <p style={{ fontSize: 10, color: colors.textMuted, marginTop: 2 }}>
                {audit.date} · {audit.daysUntil} days · {audit.owner}
              </p>
            </div>
            <Calendar size={14} color={audit.color} />
          </div>
          <div>
            <div className="flex justify-between mb-[4px]">
              <span style={{ fontSize: 10, color: colors.textDim }}>Readiness</span>
              <span style={{ fontSize: 10, fontWeight: 700, color: audit.readiness < 80 ? colors.critical : colors.success }}>
                {audit.readiness}%
              </span>
            </div>
            <div className="h-[4px] rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
              <div
                style={{
                  width: `${audit.readiness}%`,
                  height: "100%",
                  background: audit.readiness < 80 ? colors.critical : colors.success,
                  borderRadius: 999,
                }}
              />
            </div>
          </div>
          {audit.keyRisks.length > 0 && (
            <div className="flex flex-col gap-[4px]">
              <p style={{ fontSize: 10, fontWeight: 600, color: colors.textDim, marginBottom: 2 }}>Key risks</p>
              {audit.keyRisks.map((r, i) => (
                <div key={i} className="flex items-start gap-[6px]">
                  <AlertTriangle size={9} color={colors.medium} className="mt-[2px] shrink-0" />
                  <span style={{ fontSize: 11, color: colors.textMuted, lineHeight: 1.4 }}>{r}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Open gaps */}
      {gaps.length > 0 && (
        <div
          className="flex flex-col gap-[10px] p-[16px] rounded-[12px]"
          style={{ background: colors.bgCard, border: `1px solid ${colors.border}` }}
        >
          <p style={{ fontSize: 11, fontWeight: 700, color: colors.textDim, letterSpacing: "0.08em", textTransform: "uppercase" }}>
            Open Gaps ({gaps.length})
          </p>
          {gaps.map(gap => (
            <div
              key={gap.id}
              className="flex flex-col gap-[4px] p-[10px] rounded-[8px]"
              style={{
                background: `${gap.severity === "critical" ? colors.critical : colors.high}08`,
                border: `1px solid ${gap.severity === "critical" ? colors.critical : colors.high}28`,
              }}
            >
              <div className="flex items-center gap-[6px]">
                <span
                  className="px-[6px] py-[1px] rounded-full text-[9px] font-bold uppercase"
                  style={{
                    background: `${gap.severity === "critical" ? colors.critical : colors.high}18`,
                    color: gap.severity === "critical" ? colors.critical : colors.high,
                  }}
                >
                  {gap.severity}
                </span>
                <span style={{ fontSize: 10, color: colors.textDim, fontFamily: "monospace" }}>{gap.control}</span>
              </div>
              <p style={{ fontSize: 12, fontWeight: 600, color: colors.textPrimary }}>{gap.title}</p>
              <p style={{ fontSize: 10, color: colors.textMuted }}>{gap.daysOpen}d open · {gap.owner}</p>
            </div>
          ))}
        </div>
      )}

      {/* Hint when no control is selected */}
      <div
        className="flex items-center gap-[8px] p-[12px] rounded-[10px]"
        style={{ background: "rgba(255,255,255,0.025)", border: `1px solid rgba(255,255,255,0.06)` }}
      >
        <ChevronRight size={12} color={colors.textDim} />
        <p style={{ fontSize: 11, color: colors.textDim, lineHeight: 1.4 }}>
          Click any control on the left to see its detail, remediation steps, and required evidence.
        </p>
      </div>
    </div>
  );
}

/* ================================================================
   POLICY STATUS HELPERS
   ================================================================ */

const POLICY_STATUS_COLOR: Record<PolicyStatus, string> = {
  approved:      colors.success,
  "under-review": colors.medium,
  draft:         colors.textDim,
  expired:       colors.critical,
};

const POLICY_STATUS_ICON: Record<PolicyStatus, React.ReactNode> = {
  approved:       <FileCheck2  size={12} color={colors.success}  />,
  "under-review": <AlertCircle size={12} color={colors.medium}   />,
  draft:          <Clock       size={12} color={colors.textDim}  />,
  expired:        <XCircle     size={12} color={colors.critical} />,
};

/* ================================================================
   POLICIES TAB
   ================================================================ */

function PoliciesTab({ policies }: { policies: FrameworkPolicy[] }) {
  if (policies.length === 0) {
    return (
      <div
        className="flex items-center justify-center p-[32px] rounded-[12px]"
        style={{ background: colors.bgCard, border: `1px solid ${colors.border}` }}
      >
        <p style={{ fontSize: 12, color: colors.textDim }}>No policies mapped for this framework.</p>
      </div>
    );
  }

  const approvedCount = policies.filter(p => p.status === "approved").length;
  const reviewCount   = policies.filter(p => p.status === "under-review").length;
  const draftCount    = policies.filter(p => p.status === "draft").length;
  const expiredCount  = policies.filter(p => p.status === "expired").length;
  const needsAttn     = reviewCount + draftCount + expiredCount;

  const sorted = [...policies].sort((a, b) => {
    const o: Record<PolicyStatus, number> = { expired: 0, "under-review": 1, draft: 2, approved: 3 };
    return o[a.status] - o[b.status];
  });

  return (
    <div className="flex flex-col gap-[12px]">
      {/* Summary line */}
      <div className="flex items-center gap-[14px] flex-wrap">
        <span style={{ fontSize: 11, color: colors.success }}>{approvedCount} approved</span>
        <span style={{ fontSize: 11, color: colors.medium }}>{reviewCount} under review</span>
        <span style={{ fontSize: 11, color: colors.textDim }}>{draftCount} draft</span>
        {expiredCount > 0 && (
          <span style={{ fontSize: 11, color: colors.critical }}>{expiredCount} expired</span>
        )}
        {needsAttn > 0 && (
          <span
            className="flex items-center gap-[4px] px-[8px] py-[3px] rounded-full text-[10px] font-semibold ml-auto"
            style={{ background: `${colors.medium}14`, color: colors.medium, border: `1px solid ${colors.medium}28` }}
          >
            <AlertCircle size={9} />
            {needsAttn} need{needsAttn === 1 ? "s" : ""} attention
          </span>
        )}
      </div>

      {/* Table */}
      <div
        className="rounded-[10px] overflow-hidden"
        style={{ border: `1px solid ${colors.border}`, background: colors.bgCard }}
      >
        {/* Header */}
        <div
          className="flex items-center"
          style={{ borderBottom: `1px solid ${colors.border}`, background: "rgba(255,255,255,0.02)" }}
        >
          <div className="flex-1 min-w-0 px-[12px] py-[8px]">
            <span style={{ fontSize: 10, fontWeight: 700, color: colors.textDim, textTransform: "uppercase", letterSpacing: "0.07em" }}>Policy</span>
          </div>
          <div className="shrink-0 px-[8px] py-[8px]" style={{ width: 90 }}>
            <span style={{ fontSize: 10, fontWeight: 700, color: colors.textDim, textTransform: "uppercase", letterSpacing: "0.07em" }}>Status</span>
          </div>
          <div className="shrink-0 px-[8px] py-[8px]" style={{ width: 130 }}>
            <span style={{ fontSize: 10, fontWeight: 700, color: colors.textDim, textTransform: "uppercase", letterSpacing: "0.07em" }}>Owner</span>
          </div>
          <div className="shrink-0 px-[8px] py-[8px]" style={{ width: 80 }}>
            <span style={{ fontSize: 10, fontWeight: 700, color: colors.textDim, textTransform: "uppercase", letterSpacing: "0.07em" }}>Reviewed</span>
          </div>
          <div className="shrink-0 px-[8px] py-[8px]" style={{ width: 86 }}>
            <span style={{ fontSize: 10, fontWeight: 700, color: colors.textDim, textTransform: "uppercase", letterSpacing: "0.07em" }}>Next Review</span>
          </div>
          <div className="shrink-0 px-[8px] py-[8px]" style={{ width: 100 }}>
            <span style={{ fontSize: 10, fontWeight: 700, color: colors.textDim, textTransform: "uppercase", letterSpacing: "0.07em" }}>Controls</span>
          </div>
        </div>

        {/* Rows */}
        {sorted.map(policy => {
          const statusColor  = POLICY_STATUS_COLOR[policy.status];
          const isAtRisk     = policy.status !== "approved";
          const statusLabel  = policy.status === "under-review" ? "Review" : policy.status.charAt(0).toUpperCase() + policy.status.slice(1);
          return (
            <div
              key={policy.id}
              className="flex items-center"
              style={{
                borderBottom: `1px solid ${colors.border}`,
                background: isAtRisk ? `${statusColor}06` : "transparent",
              }}
            >
              {/* Policy name + summary */}
              <div className="flex-1 min-w-0 px-[12px] py-[10px]">
                <p style={{ fontSize: 12, fontWeight: 600, color: colors.textPrimary }} className="truncate">
                  {policy.name}
                </p>
                <p style={{ fontSize: 10, color: colors.textDim, marginTop: 1 }} className="truncate">
                  {policy.summary}
                </p>
              </div>

              {/* Status */}
              <div className="shrink-0 px-[8px] py-[10px]" style={{ width: 90 }}>
                <span
                  className="flex items-center gap-[5px] px-[6px] py-[2px] rounded-[5px] w-fit text-[10px] font-semibold"
                  style={{
                    background: `${statusColor}14`,
                    color: statusColor,
                    border: `1px solid ${statusColor}28`,
                  }}
                >
                  {POLICY_STATUS_ICON[policy.status]}
                  {statusLabel}
                </span>
              </div>

              {/* Owner */}
              <div className="shrink-0 px-[8px] py-[10px]" style={{ width: 130 }}>
                <span style={{ fontSize: 11, color: colors.textMuted }} className="truncate block">{policy.owner}</span>
              </div>

              {/* Last reviewed */}
              <div className="shrink-0 px-[8px] py-[10px]" style={{ width: 80 }}>
                <span style={{ fontSize: 11, color: policy.lastReviewed ? colors.textMuted : colors.textDim }}>
                  {policy.lastReviewed || "—"}
                </span>
              </div>

              {/* Next review */}
              <div className="shrink-0 px-[8px] py-[10px]" style={{ width: 86 }}>
                <span style={{ fontSize: 11, color: isAtRisk ? statusColor : colors.textMuted }}>
                  {policy.nextReview || "—"}
                </span>
              </div>

              {/* Controls */}
              <div className="shrink-0 px-[8px] py-[10px]" style={{ width: 100 }}>
                <span
                  className="text-[10px] font-mono truncate block"
                  style={{ color: policy.controlIds?.length ? colors.textMuted : colors.textDim }}
                >
                  {policy.controlIds?.join(", ") || "—"}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ================================================================
   DOCUMENTS TAB
   ================================================================ */

function DocumentsTab({ frameworkId }: { frameworkId: string }) {
  const { items, update } = useEvidenceStore();
  const fwItems = items.filter(ev => ev.fwId === frameworkId);

  const collectedCount = fwItems.filter(e => e.status === "collected").length;
  const pendingCount   = fwItems.filter(e => e.status === "pending").length;
  const overdueCount   = fwItems.filter(e => e.status === "overdue").length;

  const sorted = [...fwItems].sort((a, b) => {
    const o = { overdue: 0, pending: 1, collected: 2 } as const;
    return o[a.status] - o[b.status];
  });

  return (
    <div className="flex flex-col gap-[12px]">
      {/* Summary line */}
      {fwItems.length > 0 && (
        <div className="flex items-center gap-[14px] flex-wrap">
          <span style={{ fontSize: 11, color: colors.success }}>{collectedCount} collected</span>
          <span style={{ fontSize: 11, color: colors.medium }}>{pendingCount} pending</span>
          {overdueCount > 0 && (
            <span style={{ fontSize: 11, color: colors.critical }}>{overdueCount} overdue</span>
          )}
          {/* Progress bar */}
          <div className="flex-1 min-w-[100px] max-w-[200px]">
            <div className="flex h-[3px] rounded-full overflow-hidden w-full" style={{ background: "rgba(255,255,255,0.06)" }}>
              <div style={{ width: `${fwItems.length ? (collectedCount / fwItems.length) * 100 : 0}%`, background: colors.success }} />
              <div style={{ width: `${fwItems.length ? (pendingCount / fwItems.length) * 100 : 0}%`, background: colors.medium }} />
              <div style={{ width: `${fwItems.length ? (overdueCount / fwItems.length) * 100 : 0}%`, background: colors.critical }} />
            </div>
          </div>
        </div>
      )}

      {/* Column header */}
      {sorted.length > 0 && (
        <div
          className="flex items-center px-[12px] py-[7px] rounded-t-[10px]"
          style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${colors.border}`, borderBottom: "none" }}
        >
          <div className="w-[20px] shrink-0 mr-[10px]" />
          <div className="flex-1 min-w-0">
            <span style={{ fontSize: 10, fontWeight: 700, color: colors.textDim, textTransform: "uppercase", letterSpacing: "0.07em" }}>Evidence Item</span>
          </div>
          <div className="shrink-0 flex items-center gap-[8px]">
            <span style={{ fontSize: 10, fontWeight: 700, color: colors.textDim, textTransform: "uppercase", letterSpacing: "0.07em", width: 85, textAlign: "right" }}>Status</span>
            <span style={{ fontSize: 10, fontWeight: 700, color: colors.textDim, textTransform: "uppercase", letterSpacing: "0.07em", width: 60, textAlign: "right" }}>Due</span>
            <div className="w-[12px]" />
          </div>
        </div>
      )}

      {/* Evidence rows */}
      {sorted.length === 0 ? (
        <div
          className="flex items-center justify-center p-[32px] rounded-[12px]"
          style={{ background: colors.bgCard, border: `1px solid ${colors.border}` }}
        >
          <p style={{ fontSize: 12, color: colors.textDim }}>No evidence items mapped to this framework yet.</p>
        </div>
      ) : (
        <div
          className="flex flex-col rounded-b-[10px] overflow-hidden"
          style={{ border: `1px solid ${colors.border}` }}
        >
          {sorted.map(ev => (
            <ActionableEvidenceRow key={ev.id} ev={ev} onUpdate={update} />
          ))}
        </div>
      )}
    </div>
  );
}

/* ================================================================
   AUDIT TAB
   ================================================================ */

function AuditTab({
  frameworkId,
  frameworkName,
  frameworkScore,
  controls,
  gaps,
  onAskAI,
}: {
  frameworkId: string;
  frameworkName: string;
  frameworkScore: number;
  controls: FrameworkControl[];
  gaps: typeof GAPS;
  onAskAI: () => void;
}) {
  const { items: evidenceItems } = useEvidenceStore();
  const audit       = UPCOMING_AUDITS.find(a => a.fwId === frameworkId);
  const failingCtrl = controls.filter(c => c.status === "failing");
  const inProgCtrl  = controls.filter(c => c.status === "in-progress");
  const missingEv   = evidenceItems.filter(e => e.fwId === frameworkId && e.status !== "collected");

  const scoreColor = audit
    ? (audit.readiness >= 85 ? colors.success : audit.readiness >= 70 ? colors.medium : colors.critical)
    : (frameworkScore >= 90 ? colors.success : frameworkScore >= 80 ? colors.medium : colors.critical);

  if (!audit) {
    return (
      <div className="flex flex-col gap-[16px]">
        <div
          className="flex items-center gap-[10px] p-[16px] rounded-[10px]"
          style={{ background: colors.bgCard, border: `1px solid ${colors.border}` }}
        >
          <CheckCircle2 size={14} color={colors.success} />
          <div>
            <p style={{ fontSize: 13, fontWeight: 600, color: colors.textPrimary }}>No upcoming audit scheduled</p>
            <p style={{ fontSize: 11, color: colors.textMuted, marginTop: 2 }}>No audits scheduled for {frameworkName} in the next 12 months.</p>
          </div>
        </div>
        {failingCtrl.length > 0 && (
          <BlockingControlsList controls={failingCtrl} label="Failing Controls" color={colors.critical} />
        )}
      </div>
    );
  }

  const isAtRisk    = audit.readiness < 80;
  const isUrgent    = audit.daysUntil <= 60;
  const urgentColor = isAtRisk ? colors.critical : isUrgent ? colors.medium : colors.textDim;

  return (
    <div className="flex flex-col gap-[16px]">

      {/* Readiness strip */}
      <div
        className="flex flex-col gap-[10px] px-[16px] pt-[12px] pb-[10px] rounded-[10px]"
        style={{ background: colors.bgCard, border: `1px solid ${isAtRisk ? colors.medium + "44" : colors.border}` }}
      >
        <div className="flex items-center gap-[16px] flex-wrap">
          {/* Days countdown */}
          <div className="flex flex-col gap-[1px]">
            <span style={{ fontSize: 10, color: colors.textDim }}>Time until audit</span>
            <span style={{ fontSize: 22, fontWeight: 700, color: urgentColor, lineHeight: 1 }}>{audit.daysUntil}d</span>
          </div>

          <div style={{ width: 1, height: 32, background: colors.border }} />

          {/* Audit identity */}
          <div className="flex flex-col gap-[1px] flex-1 min-w-0">
            <span style={{ fontSize: 10, color: colors.textDim }}>Audit</span>
            <span style={{ fontSize: 13, fontWeight: 600, color: colors.textPrimary }}>{audit.name}</span>
            <span style={{ fontSize: 10, color: colors.textMuted }}>{audit.date} · {audit.owner}</span>
          </div>

          {/* Readiness score */}
          <div className="flex flex-col gap-[1px] shrink-0">
            <span style={{ fontSize: 10, color: colors.textDim }}>Readiness</span>
            <span style={{ fontSize: 22, fontWeight: 700, color: scoreColor, lineHeight: 1 }}>{audit.readiness}%</span>
            {isAtRisk && <span style={{ fontSize: 10, color: colors.medium }}>Below threshold</span>}
          </div>

          {/* CTA */}
          <button
            onClick={onAskAI}
            className="shrink-0 flex items-center gap-[6px] px-[12px] py-[7px] rounded-[8px] text-[11px] font-semibold cursor-pointer transition-colors"
            style={{ background: `${colors.primary}18`, color: colors.primary, border: `1px solid ${colors.primary}28` }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = `${colors.primary}28`; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = `${colors.primary}18`; }}
          >
            <Sparkles size={11} />
            Prep plan
          </button>
        </div>

        {/* Readiness bar */}
        <div className="flex h-[4px] rounded-full overflow-hidden w-full" style={{ background: "rgba(255,255,255,0.06)" }}>
          <div style={{ width: `${audit.readiness}%`, background: scoreColor, borderRadius: 999, transition: "width 0.4s ease" }} />
        </div>

        {/* Key risks — compact */}
        {audit.keyRisks.length > 0 && (
          <div className="flex flex-col gap-[4px]">
            {audit.keyRisks.map((r, i) => (
              <div key={i} className="flex items-start gap-[6px]">
                <AlertCircle size={10} color={colors.medium} style={{ marginTop: 2, flexShrink: 0 }} />
                <span style={{ fontSize: 11, color: colors.textMuted, lineHeight: 1.4 }}>{r}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Failing controls — direct audit findings */}
      {failingCtrl.length > 0 && (
        <BlockingControlsList controls={failingCtrl} label="Failing Controls — Direct Findings" color={colors.critical} />
      )}

      {/* In-progress controls — may be flagged */}
      {inProgCtrl.length > 0 && (
        <BlockingControlsList controls={inProgCtrl} label="In Progress — May Be Flagged" color={colors.medium} />
      )}

      {/* Missing evidence */}
      {missingEv.length > 0 && (
        <div
          className="flex flex-col gap-[2px] rounded-[10px] overflow-hidden"
          style={{ border: `1px solid ${colors.medium}28` }}
        >
          <div
            className="flex items-center justify-between px-[12px] py-[8px]"
            style={{ background: `${colors.medium}08`, borderBottom: `1px solid ${colors.medium}20` }}
          >
            <span style={{ fontSize: 11, fontWeight: 700, color: colors.textDim, textTransform: "uppercase", letterSpacing: "0.07em" }}>
              Missing Evidence ({missingEv.length})
            </span>
          </div>
          {missingEv.map(ev => (
            <div
              key={ev.id}
              className="flex items-center gap-[10px] px-[12px] py-[9px]"
              style={{ borderBottom: `1px solid ${colors.border}`, background: ev.status === "overdue" ? `${colors.critical}06` : "transparent" }}
            >
              <FileText size={11} color={ev.status === "overdue" ? colors.critical : colors.medium} className="shrink-0" />
              <div className="flex-1 min-w-0">
                <p style={{ fontSize: 12, fontWeight: 600, color: colors.textPrimary }} className="truncate">{ev.name}</p>
                <p style={{ fontSize: 10, color: colors.textDim }}>{ev.control} · {ev.collector}</p>
              </div>
              <span
                className="shrink-0 px-[6px] py-[1px] rounded-[4px] text-[9px] font-semibold capitalize"
                style={{
                  background: `${EVIDENCE_STATUS_COLOR[ev.status]}14`,
                  color: EVIDENCE_STATUS_COLOR[ev.status],
                }}
              >
                {ev.status}
              </span>
              <span style={{ fontSize: 10, color: ev.status === "overdue" ? colors.critical : colors.textDim, flexShrink: 0 }}>
                Due {ev.dueDate}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Open gaps */}
      {gaps.length > 0 && (
        <div
          className="flex flex-col rounded-[10px] overflow-hidden"
          style={{ border: `1px solid ${colors.border}` }}
        >
          <div
            className="flex items-center px-[12px] py-[8px]"
            style={{ background: "rgba(255,255,255,0.02)", borderBottom: `1px solid ${colors.border}` }}
          >
            <span style={{ fontSize: 11, fontWeight: 700, color: colors.textDim, textTransform: "uppercase", letterSpacing: "0.07em" }}>
              Open Gaps ({gaps.length})
            </span>
          </div>
          {gaps.map(gap => {
            const gapColor = gap.severity === "critical" ? colors.critical : colors.high;
            return (
              <div
                key={gap.id}
                className="flex items-center gap-[10px] px-[12px] py-[9px]"
                style={{ borderBottom: `1px solid ${colors.border}`, background: `${gapColor}05` }}
              >
                <span
                  className="shrink-0 px-[5px] py-[1px] rounded-full text-[9px] font-bold uppercase"
                  style={{ background: `${gapColor}18`, color: gapColor }}
                >
                  {gap.severity}
                </span>
                <span className="shrink-0 text-[10px] font-mono" style={{ color: gapColor, width: 60 }}>{gap.control}</span>
                <p style={{ fontSize: 12, fontWeight: 600, color: colors.textPrimary, flex: 1 }} className="truncate">{gap.title}</p>
                <span style={{ fontSize: 10, color: colors.textDim, flexShrink: 0 }}>{gap.daysOpen}d · {gap.owner}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function BlockingControlsList({ controls, label, color }: { controls: FrameworkControl[]; label: string; color: string }) {
  return (
    <div
      className="flex flex-col rounded-[10px] overflow-hidden"
      style={{ border: `1px solid ${color}22` }}
    >
      <div
        className="flex items-center px-[12px] py-[8px]"
        style={{ background: `${color}08`, borderBottom: `1px solid ${color}18` }}
      >
        <span style={{ fontSize: 11, fontWeight: 700, color: colors.textDim, textTransform: "uppercase", letterSpacing: "0.07em" }}>
          {label} ({controls.length})
        </span>
      </div>
      {controls.map(ctrl => (
        <div
          key={ctrl.id}
          className="flex items-center gap-[10px] px-[12px] py-[9px]"
          style={{ borderBottom: `1px solid ${color}14`, background: `${color}04` }}
        >
          <span className="shrink-0 text-[10px] font-mono font-semibold" style={{ color, width: 70 }}>{ctrl.id}</span>
          <div className="flex-1 min-w-0">
            <p style={{ fontSize: 12, fontWeight: 600, color: colors.textPrimary }} className="truncate">{ctrl.name}</p>
            <p style={{ fontSize: 10, color: colors.textMuted, marginTop: 1 }}>{ctrl.category}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ================================================================
   PAGE
   ================================================================ */

type TabId = "controls" | "policies" | "documents" | "audit";

const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: "controls",  label: "Controls",  icon: <ClipboardList size={12} /> },
  { id: "policies",  label: "Policies",  icon: <FileText      size={12} /> },
  { id: "documents", label: "Documents", icon: <FolderOpen    size={12} /> },
  { id: "audit",     label: "Audit",     icon: <ClipboardCheck size={12} /> },
];

export default function ComplianceFrameworkPage() {
  const { frameworkId } = useParams<{ frameworkId: string }>();
  const navigate        = useNavigate();
  const { openWithContext } = useAiBox();
  const [searchParams, setSearchParams] = useSearchParams();

  const activeTab = (searchParams.get("tab") as TabId | null) ?? "controls";

  const [selectedControlId, setSelectedControlId] = useState<string | null>(null);
  const [ctrlStatusFilter, setCtrlStatusFilter]   = useState<ControlStatus | "all">("all");
  const [ctrlSearch, setCtrlSearch]               = useState("");
  const { items: allEvidence } = useEvidenceStore();

  const framework = FRAMEWORKS.find(f => f.id === frameworkId);

  if (!framework) {
    return (
      <div className="flex flex-col h-full items-center justify-center" style={{ color: colors.textMuted }}>
        <p>Framework not found.</p>
        <button
          onClick={() => navigate("/compliance")}
          className="mt-[12px] text-[12px] cursor-pointer"
          style={{ color: colors.primary }}
        >
          Back to Compliance
        </button>
      </div>
    );
  }

  const controls = (FRAMEWORK_CONTROLS[framework.id] ?? []).slice().sort(
    (a, b) => STATUS_SORT[a.status] - STATUS_SORT[b.status]
  );

  const evidence           = EVIDENCE_ITEMS.filter(e => e.fwId === framework.id);
  const audit              = UPCOMING_AUDITS.find(a => a.fwId === framework.id);
  const gaps               = GAPS.filter(g => g.fwId === framework.id);
  const missingEvidence    = allEvidence.filter(e => e.fwId === framework.id && e.status !== "collected").length;

  const selectedControl = controls.find(c => c.id === selectedControlId) ?? null;

  const scoreColor     = framework.score >= 90 ? colors.success : framework.score >= 80 ? colors.medium : colors.critical;
  const trendNum       = parseInt(framework.trend);
  const isTrendingDown = trendNum < 0;

  function handleOpenAI() {
    openWithContext({
      type: "general",
      label: framework!.name,
      sublabel: "Framework Detail",
      contextKey: `compliance-framework-${framework!.id}`,
      suggestions: [
        { label: "What are the highest priority gaps?",     prompt: `What are the highest priority control gaps in ${framework!.name} and how should I remediate them?` },
        { label: "How do I get to 95%?",                   prompt: `What specific actions would bring ${framework!.name} compliance from ${framework!.score}% to 95%?` },
        { label: "Which evidence is at risk?",             prompt: `Which evidence items for ${framework!.name} are overdue or at risk before the next audit?` },
        { label: "Audit readiness briefing",               prompt: `Give me an audit readiness briefing for ${framework!.name}. What needs to be done in the next 30 days?` },
      ],
      greeting: `${framework!.name} is at ${framework!.score}%${trendNum !== 0 ? ` (${trendNum > 0 ? "+" : ""}${framework!.trend} trending)` : ""}. There ${gaps.length === 1 ? "is" : "are"} ${gaps.length} open gap${gaps.length !== 1 ? "s" : ""} linked to this framework. What would you like to work on?`,
    });
  }

  function handleRemediateControl(ctrl: FrameworkControl) {
    const gap = gaps.find(g => g.id === ctrl.gapId);
    openWithContext({
      type: "general",
      label: ctrl.name,
      sublabel: `${framework!.name} — ${ctrl.category}`,
      contextKey: `compliance-control-${ctrl.id}`,
      suggestions: [
        { label: "Step-by-step remediation plan",          prompt: `Give me a detailed step-by-step remediation plan for control ${ctrl.id}: ${ctrl.name} in ${framework!.name}.` },
        { label: "Who owns this and what do they need?",   prompt: `Who is responsible for remediating ${ctrl.id} and what specific actions do they need to take?` },
        { label: "What evidence is required?",             prompt: `What evidence needs to be collected to close the gap on ${ctrl.id} in ${framework!.name}? List each artifact with who should collect it.` },
        { label: "What is the audit impact?",              prompt: `If ${ctrl.id} is still failing at the next audit, what is the likely outcome and how does it affect our overall compliance score?` },
      ],
      greeting: gap
        ? `Control ${ctrl.id} — "${ctrl.name}" is failing. The open gap "${gap.title}" has been open ${gap.daysOpen} days and is owned by ${gap.owner}. I've loaded the remediation context. Where would you like to start?`
        : `Control ${ctrl.id} — "${ctrl.name}" is ${ctrl.status}. Let me help you build a remediation plan.`,
    });
  }

  function handleSelectControl(ctrl: FrameworkControl) {
    setSelectedControlId(prev => prev === ctrl.id ? null : ctrl.id);
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header — breadcrumb + identity */}
      <div
        className="flex-none px-[32px] pt-[16px] pb-[0px]"
        style={{ borderBottom: `1px solid ${colors.border}` }}
      >
        {/* Breadcrumb */}
        <div className="flex items-center gap-[5px] mb-[8px]">
          <button
            onClick={() => navigate("/compliance")}
            className="flex items-center gap-[4px] text-[11px] cursor-pointer transition-colors"
            style={{ color: colors.textDim }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = colors.textMuted; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = colors.textDim; }}
          >
            <ArrowLeft size={10} />
            Compliance
          </button>
          <ChevronRight size={9} color={colors.textDim} />
          <span style={{ fontSize: 11, color: colors.textMuted }}>{framework.name}</span>
        </div>
        <PageHeader
          icon={<Shield size={16} style={{ color: colors.accent }} />}
          title={framework.name}
          subtitle={framework.purpose}
          actions={
            <button
              onClick={handleOpenAI}
              className="flex items-center gap-[6px] px-[14px] py-[7px] rounded-[8px] text-[12px] font-semibold cursor-pointer transition-colors"
              style={{ background: `${colors.primary}18`, color: colors.primary, border: `1px solid ${colors.primary}28` }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = `${colors.primary}28`; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = `${colors.primary}18`; }}
            >
              <Sparkles size={13} />
              Ask AI
            </button>
          }
        />
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto px-[32px] pb-[32px]">

        {/* Score + stats strip */}
        <div
          className="flex flex-col gap-[10px] px-[16px] pt-[12px] pb-[10px] rounded-[10px] mb-[16px]"
          style={{ background: colors.bgCard, border: `1px solid ${isTrendingDown ? colors.medium + "44" : colors.border}` }}
        >
          <div className="flex items-center gap-[16px] flex-wrap">
            {/* Score */}
            <div className="flex flex-col gap-[1px] min-w-[60px]">
              <span style={{ fontSize: 10, color: colors.textDim }}>Score</span>
              <div className="flex items-baseline gap-[5px]">
                <span style={{ fontSize: 22, fontWeight: 700, color: scoreColor, lineHeight: 1 }}>{framework.score}%</span>
                {trendNum !== 0 && (
                  <span style={{ fontSize: 11, color: trendNum > 0 ? colors.success : colors.critical }}>
                    {trendNum > 0 ? "+" : ""}{framework.trend}
                    {isTrendingDown && <TrendingDown size={10} style={{ display: "inline", marginLeft: 2 }} />}
                  </span>
                )}
              </div>
            </div>

            <div style={{ width: 1, height: 32, background: colors.border }} />

            {[
              { label: "Controls",  value: framework.controls,   color: colors.textPrimary },
              { label: "Passing",   value: framework.passing,    color: colors.success     },
              { label: "Progress",  value: framework.inProgress, color: colors.medium      },
              { label: "Failing",   value: framework.failing,    color: framework.failing > 0 ? colors.critical : colors.textDim },
              { label: "Gaps",      value: gaps.length,          color: gaps.length > 0 ? colors.critical : colors.textDim },
              { label: "Missing ev.",value: missingEvidence,     color: missingEvidence > 0 ? colors.medium : colors.textDim },
            ].map(s => (
              <div key={s.label} className="flex flex-col gap-[1px]">
                <span style={{ fontSize: 10, color: colors.textDim }}>{s.label}</span>
                <span style={{ fontSize: 16, fontWeight: 700, color: s.color, lineHeight: 1 }}>{s.value}</span>
              </div>
            ))}

            {audit && (
              <>
                <div style={{ width: 1, height: 32, background: colors.border }} className="ml-auto" />
                <div className="flex flex-col gap-[1px]">
                  <span style={{ fontSize: 10, color: colors.textDim }}>Next audit</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: audit.color }}>{audit.date}</span>
                  <span style={{ fontSize: 10, color: audit.readiness < 80 ? colors.medium : colors.textDim }}>
                    {audit.daysUntil}d · {audit.readiness}% ready{audit.readiness < 80 ? " — at risk" : ""}
                  </span>
                </div>
              </>
            )}
          </div>

          {/* Progress bar */}
          <div className="flex h-[3px] rounded-full overflow-hidden w-full" style={{ background: "rgba(255,255,255,0.05)" }}>
            <div style={{ width: `${(framework.passing / framework.controls) * 100}%`, background: colors.success }} />
            <div style={{ width: `${(framework.inProgress / framework.controls) * 100}%`, background: colors.medium }} />
            <div style={{ width: `${(framework.failing / framework.controls) * 100}%`, background: colors.critical }} />
          </div>
        </div>

        {/* Tab navigation strip */}
        <div
          className="flex items-center gap-[0px] mb-[20px]"
          style={{ borderBottom: `1px solid ${colors.border}` }}
        >
          {TABS.map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setSearchParams({ tab: tab.id }, { replace: true });
                  if (tab.id !== "controls") setSelectedControlId(null);
                }}
                className="flex items-center gap-[6px] px-[14px] py-[10px] text-[12px] font-medium cursor-pointer transition-colors relative"
                style={{
                  color: isActive ? colors.textPrimary : colors.textMuted,
                  background: "transparent",
                  border: "none",
                  outline: "none",
                  borderBottom: isActive ? `2px solid ${colors.primary}` : "2px solid transparent",
                  marginBottom: -1,
                }}
                onMouseEnter={(e) => {
                  if (!isActive) (e.currentTarget as HTMLButtonElement).style.color = colors.textSecondary;
                }}
                onMouseLeave={(e) => {
                  if (!isActive) (e.currentTarget as HTMLButtonElement).style.color = colors.textMuted;
                }}
              >
                {tab.icon}
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Controls tab */}
        {activeTab === "controls" && (() => {
          const STATUS_FILTERS: { id: ControlStatus | "all"; label: string }[] = [
            { id: "all",          label: "All"          },
            { id: "failing",      label: "Failing"      },
            { id: "in-progress",  label: "In Progress"  },
            { id: "not-started",  label: "Not Started"  },
            { id: "passing",      label: "Passing"      },
          ];

          const filteredControls = controls.filter(c => {
            if (ctrlStatusFilter !== "all" && c.status !== ctrlStatusFilter) return false;
            if (ctrlSearch) {
              const q = ctrlSearch.toLowerCase();
              if (!c.id.toLowerCase().includes(q) && !c.name.toLowerCase().includes(q)) return false;
            }
            return true;
          });

          const passingCount    = controls.filter(c => c.status === "passing").length;
          const failingCount    = controls.filter(c => c.status === "failing").length;
          const inProgCount     = controls.filter(c => c.status === "in-progress").length;
          const notStartedCount = controls.filter(c => c.status === "not-started").length;

          return (
            <div className="flex gap-[20px] items-start">
              {/* LEFT — table */}
              <div className="flex-1 min-w-0">

                {/* Filter bar */}
                <div className="flex items-center gap-[8px] mb-[12px] flex-wrap">
                  {/* Status filters */}
                  <div className="flex items-center gap-[4px]">
                    {STATUS_FILTERS.map(f => (
                      <button
                        key={f.id}
                        onClick={() => setCtrlStatusFilter(f.id)}
                        className="px-[10px] py-[5px] rounded-[6px] text-[11px] font-medium cursor-pointer transition-colors"
                        style={{
                          background: ctrlStatusFilter === f.id ? `${colors.primary}20` : "rgba(255,255,255,0.04)",
                          color: ctrlStatusFilter === f.id ? colors.primary : colors.textMuted,
                          border: `1px solid ${ctrlStatusFilter === f.id ? colors.primary + "44" : "rgba(255,255,255,0.08)"}`,
                        }}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>

                  {/* Search */}
                  <div
                    className="flex items-center gap-[6px] px-[10px] py-[5px] rounded-[6px] flex-1 min-w-[160px] max-w-[240px]"
                    style={{ background: "rgba(255,255,255,0.04)", border: `1px solid rgba(255,255,255,0.08)` }}
                  >
                    <Search size={11} color={colors.textDim} />
                    <input
                      type="text"
                      value={ctrlSearch}
                      onChange={(e) => setCtrlSearch(e.target.value)}
                      placeholder="Search ID or name…"
                      className="flex-1 bg-transparent outline-none"
                      style={{ fontSize: 11, color: colors.textPrimary }}
                    />
                  </div>
                </div>

                {/* Summary strip */}
                <div className="flex items-center gap-[14px] mb-[10px]">
                  <span style={{ fontSize: 11, color: colors.success  }}>{passingCount} passing</span>
                  <span style={{ fontSize: 11, color: colors.critical }}>{failingCount} failing</span>
                  <span style={{ fontSize: 11, color: colors.medium   }}>{inProgCount} in progress</span>
                  <span style={{ fontSize: 11, color: colors.textDim  }}>{notStartedCount} not started</span>
                  {(ctrlStatusFilter !== "all" || ctrlSearch) && (
                    <span style={{ fontSize: 11, color: colors.textDim }}>· {filteredControls.length} shown</span>
                  )}
                </div>

                {/* Table */}
                <div
                  className="rounded-[10px] overflow-hidden"
                  style={{ border: `1px solid ${colors.border}`, background: colors.bgCard }}
                >
                  {/* Table header */}
                  <div
                    className="flex items-center gap-0"
                    style={{ borderBottom: `1px solid ${colors.border}`, background: "rgba(255,255,255,0.02)" }}
                  >
                    <div className="shrink-0 px-[12px] py-[8px]" style={{ width: 88 }}>
                      <span style={{ fontSize: 10, fontWeight: 700, color: colors.textDim, textTransform: "uppercase", letterSpacing: "0.07em" }}>ID</span>
                    </div>
                    <div className="flex-1 min-w-0 px-[8px] py-[8px]">
                      <span style={{ fontSize: 10, fontWeight: 700, color: colors.textDim, textTransform: "uppercase", letterSpacing: "0.07em" }}>Name</span>
                    </div>
                    <div className="shrink-0 px-[8px] py-[8px]" style={{ width: 110 }}>
                      <span style={{ fontSize: 10, fontWeight: 700, color: colors.textDim, textTransform: "uppercase", letterSpacing: "0.07em" }}>Status</span>
                    </div>
                    <div className="shrink-0 px-[8px] py-[8px]" style={{ width: 120 }}>
                      <span style={{ fontSize: 10, fontWeight: 700, color: colors.textDim, textTransform: "uppercase", letterSpacing: "0.07em" }}>Owner</span>
                    </div>
                    <div className="shrink-0 px-[8px] py-[8px]" style={{ width: 80 }}>
                      <span style={{ fontSize: 10, fontWeight: 700, color: colors.textDim, textTransform: "uppercase", letterSpacing: "0.07em" }}>Evidence</span>
                    </div>
                    <div className="shrink-0" style={{ width: 32 }} />
                  </div>

                  {/* Table rows */}
                  {filteredControls.length === 0 ? (
                    <div className="flex items-center justify-center py-[32px]">
                      <p style={{ fontSize: 12, color: colors.textDim }}>No controls match the current filter.</p>
                    </div>
                  ) : (
                    filteredControls.map(ctrl => {
                      const gapOwner      = GAPS.find(g => g.id === ctrl.gapId)?.owner ?? "";
                      const overrideOwner = getCtrlOwner(ctrl.id);
                      const displayOwner  = overrideOwner || gapOwner;
                      return (
                        <ControlTableRow
                          key={ctrl.id}
                          ctrl={ctrl}
                          isSelected={selectedControlId === ctrl.id}
                          onSelect={handleSelectControl}
                          owner={displayOwner}
                        />
                      );
                    })
                  )}
                </div>
              </div>

              {/* RIGHT — detail panel or default sidebar */}
              <div className="w-[320px] shrink-0" style={{ position: "sticky", top: 0 }}>
                {selectedControl ? (
                  <ControlDetailPanel
                    ctrl={selectedControl}
                    frameworkName={framework.name}
                    onClose={() => setSelectedControlId(null)}
                    onAskAI={handleRemediateControl}
                  />
                ) : (
                  <DefaultSidebar evidence={evidence} audit={audit} gaps={gaps} />
                )}
              </div>
            </div>
          );
        })()}

        {/* Policies tab */}
        {activeTab === "policies" && (
          <PoliciesTab policies={FRAMEWORK_POLICIES[framework.id] ?? []} />
        )}

        {/* Documents tab */}
        {activeTab === "documents" && (
          <DocumentsTab frameworkId={framework.id} />
        )}

        {/* Audit tab */}
        {activeTab === "audit" && (
          <AuditTab
            frameworkId={framework.id}
            frameworkName={framework.name}
            frameworkScore={framework.score}
            controls={controls}
            gaps={gaps}
            onAskAI={handleOpenAI}
          />
        )}
      </div>
    </div>
  );
}
