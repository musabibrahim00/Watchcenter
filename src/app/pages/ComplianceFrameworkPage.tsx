import React, { useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router";
import {
  ArrowLeft, CheckCircle2, XCircle, AlertCircle, Clock,
  FileText, Sparkles, AlertTriangle, Calendar, TrendingDown,
  ChevronRight, X, BookmarkPlus, BookmarkCheck, ListChecks, Shield,
  FolderOpen, ClipboardList, FileCheck2, ClipboardCheck, Search, User, StickyNote,
  Target, Zap, CheckCheck, CircleDot, Flag,
} from "lucide-react";
import { colors } from "../shared/design-system/tokens";
import { PageHeader } from "../shared/components/ui";
import { useAiBox } from "../features/ai-box";
import { useEvidenceStore } from "../features/compliance/evidence-store";
import { useControlStatusStore } from "../features/compliance/control-store";
import { useGapStatusStore } from "../features/compliance/gap-store";
import { ActionableEvidenceRow } from "../features/compliance/ActionableEvidenceRow";
import {
  FRAMEWORKS, FRAMEWORK_CONTROLS, FRAMEWORK_POLICIES, GAPS, EVIDENCE_ITEMS, UPCOMING_AUDITS,
  type FrameworkControl, type FrameworkPolicy, type PolicyStatus, type ControlStatus, type EvidenceStatus, type GapStatus,
} from "./compliance-data";
import { getComplianceFramework } from "../../data/compliance/frameworks";

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

/** Returns urgency tier for a gap based on its due date. */
function getGapUrgency(dueDate: string): "overdue" | "due-soon" | "normal" {
  const d = new Date(dueDate);
  const diffDays = Math.ceil((d.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return "overdue";
  if (diffDays <= 7) return "due-soon";
  return "normal";
}

const GAP_STATUS_LABELS: Record<GapStatus, string> = {
  open:        "Open",
  in_progress: "In Progress",
  resolved:    "Resolved",
};

const GAP_STATUS_ICONS: Record<GapStatus, React.ReactNode> = {
  open:        <CircleDot  size={10} />,
  in_progress: <AlertCircle size={10} />,
  resolved:    <CheckCheck  size={10} />,
};

/* ================================================================
   CONTROL TABLE ROW
   ================================================================ */

function ControlTableRow({
  ctrl, isSelected, onSelect, owner, evidenceCount, gapCount, gapUrgency,
}: {
  ctrl: FrameworkControl;
  isSelected: boolean;
  onSelect: (ctrl: FrameworkControl) => void;
  owner: string;
  evidenceCount: number;
  gapCount: number;
  gapUrgency: "overdue" | "due-soon" | null;
}) {
  const statusColor = CONTROL_STATUS_COLOR[ctrl.status];

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

      {/* Evidence + gap urgency */}
      <div className="shrink-0 px-[8px] py-[8px] flex items-center gap-[5px]" style={{ width: 80 }}>
        <FileCheck2 size={11} color={evidenceCount > 0 ? colors.success : colors.textDim} />
        <span style={{ fontSize: 11, color: evidenceCount > 0 ? colors.textMuted : colors.textDim }}>
          {evidenceCount}
        </span>
        {gapCount > 0 && (
          <span className="flex items-center gap-[2px] ml-[2px]">
            <AlertTriangle
              size={10}
              color={gapUrgency === "overdue" ? colors.critical : gapUrgency === "due-soon" ? colors.medium : colors.critical}
            />
            {gapCount > 1 && (
              <span style={{ fontSize: 9, fontWeight: 700, color: gapUrgency === "due-soon" ? colors.medium : colors.critical }}>{gapCount}</span>
            )}
          </span>
        )}
        {/* Urgency dot */}
        {gapUrgency === "overdue" && (
          <span
            className="size-[5px] rounded-full shrink-0"
            style={{ background: colors.critical, boxShadow: `0 0 4px ${colors.critical}` }}
          />
        )}
        {gapUrgency === "due-soon" && (
          <span className="size-[5px] rounded-full shrink-0" style={{ background: colors.medium }} />
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
  onStatusChange,
}: {
  ctrl: FrameworkControl;
  frameworkName: string;
  onClose: () => void;
  onAskAI: (ctrl: FrameworkControl) => void;
  onStatusChange: (status: ControlStatus) => void;
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

  const { items: evidenceStore }                      = useEvidenceStore();
  const { allStatuses: gapStatuses, setStatus: setGapStatus } = useGapStatusStore();

  const statusColor = CONTROL_STATUS_COLOR[ctrl.status];
  const isActiveGap = ctrl.status === "failing" || ctrl.status === "in-progress";

  // All gaps for this control, with live status from store
  const controlGaps = GAPS
    .filter(g => g.control === ctrl.id)
    .map(g => ({ ...g, status: (gapStatuses[g.id] ?? g.status) as GapStatus }));

  const openGaps = controlGaps.filter(g => g.status !== "resolved");

  // Build enriched evidence — each required artifact paired with its store item (if collected)
  const reqEvidence      = ctrl.requiredEvidence ?? [];
  const enrichedEvidence = reqEvidence.map(req => ({
    ...req,
    storeItem: req.evidenceId ? evidenceStore.find(e => e.id === req.evidenceId) ?? null : null,
  }));
  const evCollected = enrichedEvidence.filter(r => r.storeItem?.status === "collected").length;
  const evPending   = enrichedEvidence.filter(r => r.storeItem && r.storeItem.status !== "collected").length;
  const evMissing   = enrichedEvidence.filter(r => !r.storeItem).length;

  const audit = UPCOMING_AUDITS.find(a =>
    FRAMEWORK_CONTROLS[a.fwId]?.some(c => c.id === ctrl.id)
  );

  // Urgency state across all open gaps
  const hasCriticalGap = openGaps.some(g => g.severity === "critical");
  const hasOverdueGap  = openGaps.some(g => getGapUrgency(g.dueDate) === "overdue");
  const hasDueSoonGap  = openGaps.some(g => getGapUrgency(g.dueDate) === "due-soon");

  function handleToggleFollowUp() {
    const next = toggleFollowUp(ctrl.id);
    setFollowedUp(next);
  }

  // Urgency border on the panel itself when critical + failing
  const panelBorderColor = (ctrl.status === "failing" && hasCriticalGap)
    ? colors.critical
    : statusColor;

  return (
    <div
      className="flex flex-col h-full rounded-[12px] overflow-hidden"
      style={{ background: colors.bgCard, border: `1px solid ${panelBorderColor}44` }}
    >
      {/* Panel header */}
      <div
        className="flex items-start justify-between gap-[10px] px-[16px] py-[14px] shrink-0"
        style={{ borderBottom: `1px solid ${colors.border}` }}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-[7px] mb-[3px]">
            {CONTROL_STATUS_ICON[ctrl.status]}
            <span className="text-[11px] font-mono font-semibold" style={{ color: statusColor }}>
              {ctrl.id}
            </span>
            <span
              className="px-[6px] py-[1px] rounded-full text-[9px] font-bold uppercase"
              style={{ background: `${statusColor}14`, color: statusColor, border: `1px solid ${statusColor}28` }}
            >
              {ctrl.status}
            </span>
            {/* Urgency pill */}
            {hasOverdueGap && (
              <span
                className="flex items-center gap-[3px] px-[5px] py-[1px] rounded-full text-[9px] font-bold uppercase"
                style={{ background: `${colors.critical}20`, color: colors.critical, border: `1px solid ${colors.critical}40` }}
              >
                <AlertTriangle size={8} /> OVERDUE
              </span>
            )}
            {!hasOverdueGap && hasDueSoonGap && (
              <span
                className="flex items-center gap-[3px] px-[5px] py-[1px] rounded-full text-[9px] font-bold uppercase"
                style={{ background: `${colors.medium}18`, color: colors.medium, border: `1px solid ${colors.medium}38` }}
              >
                <Clock size={8} /> DUE SOON
              </span>
            )}
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

        {/* ── OPEN ACTIONS — most prominent for failing/in-progress ── */}
        {openGaps.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-[8px]">
              <div className="flex items-center gap-[6px]">
                <Target size={11} color={hasCriticalGap ? colors.critical : colors.medium} />
                <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase" as const,
                  color: hasCriticalGap ? colors.critical : colors.medium }}>
                  Open Actions ({openGaps.length})
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-[8px]">
              {openGaps.map(gap => {
                const urgency = getGapUrgency(gap.dueDate);
                const sc      = gap.severity === "critical" ? colors.critical
                              : gap.severity === "high"     ? colors.high
                              :                               colors.medium;
                const gStatus = gap.status;

                // Urgency accent
                const urgencyColor = urgency === "overdue"  ? colors.critical
                                   : urgency === "due-soon" ? colors.medium
                                   : "transparent";
                const cardBg       = gap.severity === "critical" ? `${colors.critical}08`
                                   : gap.severity === "high"     ? `${colors.high}08`
                                   :                               `${colors.medium}06`;
                return (
                  <div
                    key={gap.id}
                    className="flex flex-col gap-[8px] p-[11px] rounded-[9px]"
                    style={{
                      background: cardBg,
                      border: `1px solid ${sc}${urgency === "overdue" ? "44" : "28"}`,
                      boxShadow: urgency === "overdue" ? `0 0 0 1px ${colors.critical}18` : undefined,
                    }}
                  >
                    {/* Top row: severity + urgency */}
                    <div className="flex items-center gap-[6px] flex-wrap">
                      <span
                        className="px-[6px] py-[1px] rounded-full text-[9px] font-bold uppercase"
                        style={{ background: `${sc}18`, color: sc }}
                      >
                        {gap.severity}
                      </span>
                      {urgency === "overdue" && (
                        <span className="flex items-center gap-[3px] text-[9px] font-bold uppercase" style={{ color: colors.critical }}>
                          <AlertTriangle size={9} /> OVERDUE — was due {gap.dueDate}
                        </span>
                      )}
                      {urgency === "due-soon" && (
                        <span className="flex items-center gap-[3px] text-[9px] font-semibold" style={{ color: colors.medium }}>
                          <Clock size={9} /> Due {gap.dueDate}
                        </span>
                      )}
                      {urgency === "normal" && (
                        <span style={{ fontSize: 9, color: colors.textDim }}>Due {gap.dueDate}</span>
                      )}
                    </div>

                    {/* Title */}
                    <p style={{ fontSize: 12, fontWeight: 600, color: colors.textPrimary, lineHeight: 1.35 }}>
                      {gap.title}
                    </p>

                    {/* Description */}
                    <p style={{ fontSize: 11, color: colors.textMuted, lineHeight: 1.5 }}>
                      {gap.description}
                    </p>

                    {/* Meta row */}
                    <div className="flex items-center gap-[12px]">
                      <span className="flex items-center gap-[4px]" style={{ fontSize: 10, color: colors.textDim }}>
                        <User size={9} /> {gap.owner}
                      </span>
                      <span style={{ fontSize: 10, color: colors.textDim }}>{gap.daysOpen}d open</span>
                    </div>

                    {/* Status quick-actions */}
                    <div className="flex gap-[4px] flex-wrap pt-[2px]" style={{ borderTop: `1px solid ${sc}18` }}>
                      {(["open", "in_progress", "resolved"] as GapStatus[]).map(s => {
                        const isActive = gStatus === s;
                        const sColor   = s === "resolved" ? colors.success
                                       : s === "in_progress" ? colors.medium
                                       : sc;
                        return (
                          <button
                            key={s}
                            onClick={() => setGapStatus(gap.id, s)}
                            className="flex items-center gap-[4px] px-[7px] py-[3px] rounded-[5px] text-[9px] font-semibold cursor-pointer"
                            style={{
                              background: isActive ? `${sColor}20` : "rgba(255,255,255,0.04)",
                              color:      isActive ? sColor : colors.textDim,
                              border:     `1px solid ${isActive ? sColor + "44" : "rgba(255,255,255,0.08)"}`,
                            }}
                          >
                            {GAP_STATUS_ICONS[s]}
                            {GAP_STATUS_LABELS[s]}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Status selector */}
        <div>
          <span style={{ fontSize: 10, fontWeight: 700, color: colors.textDim, letterSpacing: "0.07em", textTransform: "uppercase", display: "block", marginBottom: 7 }}>
            Control Status
          </span>
          <div className="flex gap-[4px] flex-wrap">
            {(["passing", "in-progress", "not-started", "failing"] as ControlStatus[]).map(s => {
              const sc = CONTROL_STATUS_COLOR[s];
              const isActive = ctrl.status === s;
              const label = s === "in-progress" ? "In Progress" : s === "not-started" ? "Not Started" : s.charAt(0).toUpperCase() + s.slice(1);
              return (
                <button
                  key={s}
                  onClick={() => onStatusChange(s)}
                  className="flex items-center gap-[5px] px-[9px] py-[4px] rounded-[6px] text-[10px] font-semibold cursor-pointer"
                  style={{
                    background: isActive ? `${sc}20` : "rgba(255,255,255,0.04)",
                    color: isActive ? sc : colors.textDim,
                    border: `1px solid ${isActive ? sc + "44" : "rgba(255,255,255,0.08)"}`,
                  }}
                >
                  {CONTROL_STATUS_ICON[s]}
                  {label}
                </button>
              );
            })}
          </div>
        </div>

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

        {/* Evidence — unified required + collection status */}
        {reqEvidence.length > 0 && (
          <div>
            {/* Section header */}
            <div className="flex items-center justify-between mb-[8px]">
              <div className="flex items-center gap-[6px]">
                <FileText size={11} color={colors.textDim} />
                <span style={{ fontSize: 10, fontWeight: 700, color: colors.textDim, letterSpacing: "0.07em", textTransform: "uppercase" }}>
                  Evidence
                </span>
              </div>
              <span style={{ fontSize: 10, color: colors.textDim }}>
                {evCollected + evPending}/{reqEvidence.length} linked
                {evPending > 0 && <span style={{ color: colors.medium }}> · {evPending} pending</span>}
              </span>
            </div>

            {/* Missing evidence → blocks gap alert */}
            {evMissing > 0 && isActiveGap && (
              <div
                className="flex flex-col gap-[4px] px-[10px] py-[8px] rounded-[7px] mb-[8px]"
                style={{ background: `${colors.critical}08`, border: `1px solid ${colors.critical}28` }}
              >
                <div className="flex items-center gap-[7px]">
                  <AlertTriangle size={11} color={colors.critical} className="shrink-0" />
                  <p style={{ fontSize: 11, color: colors.critical, fontWeight: 600 }}>
                    {evMissing} item{evMissing !== 1 ? "s" : ""} missing
                  </p>
                </div>
                {openGaps.length > 0 && (
                  <p style={{ fontSize: 10, color: colors.textMuted, lineHeight: 1.4, paddingLeft: 18 }}>
                    This missing evidence is preventing this control from passing. Collect it to close{" "}
                    <span style={{ color: colors.textPrimary, fontWeight: 600 }}>
                      {openGaps.map(g => `"${g.title}"`).join(" and ")}
                    </span>.
                  </p>
                )}
              </div>
            )}

            {/* Evidence rows */}
            <div className="flex flex-col gap-[2px]">
              {enrichedEvidence.map((req, i) => {
                const item    = req.storeItem;
                const missing = !item;
                const sc = item
                  ? EVIDENCE_STATUS_COLOR[item.status]
                  : isActiveGap ? colors.critical : colors.textDim;
                return (
                  <div
                    key={i}
                    className="flex items-start gap-[8px] px-[8px] py-[6px] rounded-[6px]"
                    style={{
                      background: missing && isActiveGap ? `${colors.critical}07` : "transparent",
                      border: `1px solid ${missing && isActiveGap ? colors.critical + "18" : "transparent"}`,
                    }}
                  >
                    <span className="shrink-0 mt-[1px]">
                      {item
                        ? item.status === "collected" ? <CheckCircle2 size={12} color={colors.success}  />
                        : item.status === "pending"   ? <Clock        size={12} color={colors.medium}   />
                                                      : <AlertTriangle size={12} color={colors.critical} />
                        : isActiveGap
                          ? <XCircle size={12} color={colors.critical} />
                          : <div className="size-[5px] rounded-full mt-[4px] shrink-0" style={{ background: colors.textDim }} />
                      }
                    </span>
                    <div className="flex-1 min-w-0">
                      <p
                        className="truncate"
                        style={{
                          fontSize: 11,
                          fontWeight: missing && isActiveGap ? 600 : 400,
                          color: missing && isActiveGap ? colors.critical : item ? colors.textPrimary : colors.textMuted,
                          lineHeight: 1.4,
                        }}
                      >
                        {req.label}
                        {req.assumed && (
                          <span style={{ fontSize: 9, color: colors.textDim, marginLeft: 5, fontWeight: 400 }}>~assumed</span>
                        )}
                      </p>
                      {item && (
                        <p style={{ fontSize: 10, color: colors.textDim, marginTop: 1 }}>
                          {item.collector}{item.dueDate ? ` · due ${item.dueDate}` : ""}
                        </p>
                      )}
                    </div>
                    {item ? (
                      <span
                        className="shrink-0 px-[5px] py-[1px] rounded-full text-[9px] font-medium capitalize"
                        style={{ background: `${sc}14`, color: sc, border: `1px solid ${sc}22` }}
                      >
                        {item.status}
                      </span>
                    ) : (
                      <span style={{ fontSize: 9, fontWeight: 600, color: sc, flexShrink: 0 }}>
                        {isActiveGap ? "missing" : "unlinked"}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
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
              {audit.readiness < 80 && <span style={{ color: colors.critical }}> — at risk</span>}
            </p>
            {ctrl.status === "failing" && (
              <p style={{ fontSize: 11, color: colors.medium, lineHeight: 1.45, marginTop: 2 }}>
                This control failing will be a direct audit finding. Resolving it before the audit date improves readiness and reduces the risk of a qualified opinion.
              </p>
            )}
          </div>
        )}

        {/* Passing state — no open actions */}
        {ctrl.status === "passing" && openGaps.length === 0 && !ctrl.whyItMatters && (
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

        {/* Owner */}
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
            placeholder={controlGaps[0]?.owner ?? "Assign owner…"}
            onChange={(e) => setOwner(e.target.value)}
            onBlur={(e) => setCtrlOwner(ctrl.id, e.target.value)}
            className="w-full px-[10px] py-[7px] rounded-[7px] text-[12px] outline-none"
            style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${colors.border}`, color: colors.textPrimary }}
          />
        </div>

        {/* Note */}
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
            style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${colors.border}`, color: colors.textPrimary, lineHeight: 1.5 }}
          />
        </div>
      </div>

      {/* Action footer */}
      <div
        className="shrink-0 flex flex-col gap-[8px] px-[16px] py-[14px]"
        style={{ borderTop: `1px solid ${colors.border}` }}
      >
        {/* Primary CTA: "Fix this control" for failing, "Remediate with AI" for others */}
        {ctrl.status !== "passing" && (
          <button
            onClick={() => onAskAI(ctrl)}
            className="w-full flex items-center justify-center gap-[6px] px-[12px] py-[10px] rounded-[8px] text-[12px] font-semibold cursor-pointer transition-colors"
            style={
              ctrl.status === "failing"
                ? { background: colors.critical, color: "#fff", border: `1px solid ${colors.critical}` }
                : { background: `${statusColor}18`, color: statusColor, border: `1px solid ${statusColor}2a` }
            }
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.opacity = "0.88";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.opacity = "1";
            }}
          >
            {ctrl.status === "failing" ? <Zap size={13} /> : <Sparkles size={13} />}
            {ctrl.status === "failing" ? "Fix this control" : "Remediate with AI"}
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
  const { items: allEvidence }               = useEvidenceStore();
  const { allStatuses: ctrlStatusOverrides,
          setStatus:   setCtrlStatus }         = useControlStatusStore();

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

  // Merge stored status overrides so all consumers (counts, table, detail) stay in sync
  const controls = (FRAMEWORK_CONTROLS[framework.id] ?? [])
    .map(c => ({ ...c, status: ctrlStatusOverrides[c.id] ?? c.status }))
    .sort((a, b) => STATUS_SORT[a.status] - STATUS_SORT[b.status]);

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
    const ctrlGaps      = GAPS.filter(g => g.control === ctrl.id);
    const missingEv     = (ctrl.requiredEvidence ?? []).filter(req =>
      !req.evidenceId || !allEvidence.find(e => e.id === req.evidenceId && e.status === "collected")
    );
    const criticalGap   = ctrlGaps.find(g => g.severity === "critical");
    const overdueGaps   = ctrlGaps.filter(g => getGapUrgency(g.dueDate) === "overdue");

    const gapContext    = ctrlGaps.length > 0
      ? `\n\nOpen gaps (${ctrlGaps.length}):\n${ctrlGaps.map(g => `• [${g.severity.toUpperCase()}] ${g.title} — ${g.daysOpen}d open, owner: ${g.owner}, due ${g.dueDate}`).join("\n")}`
      : "";
    const evidenceContext = missingEv.length > 0
      ? `\n\nMissing evidence (${missingEv.length}):\n${missingEv.map(e => `• ${e.label}`).join("\n")}`
      : "";

    openWithContext({
      type: "general",
      label: ctrl.name,
      sublabel: `${framework!.name} — ${ctrl.category}`,
      contextKey: `compliance-control-${ctrl.id}`,
      suggestions: [
        {
          label: "Fix this control — full action plan",
          prompt: `Give me a prioritized action plan to fix control ${ctrl.id}: "${ctrl.name}" in ${framework!.name}.${gapContext}${evidenceContext}\n\nInclude: who should do what, by when, and which evidence to collect first.`,
        },
        {
          label: "What evidence do I collect first?",
          prompt: `For control ${ctrl.id} in ${framework!.name}, list the missing evidence in priority order. For each item, tell me exactly where to get it and who should collect it.${evidenceContext}`,
        },
        {
          label: "Who owns this and what do they need?",
          prompt: `Who is responsible for fixing ${ctrl.id} — "${ctrl.name}"? What specific actions do they need to take, and what resources or approvals do they need to move forward?`,
        },
        {
          label: "What is the audit impact if unresolved?",
          prompt: `If control ${ctrl.id} in ${framework!.name} is still failing at the next audit, what is the likely finding, how does it affect our score, and what remediation timeline is acceptable?`,
        },
      ],
      greeting: ctrlGaps.length > 0
        ? `Control ${ctrl.id} — "${ctrl.name}" is ${ctrl.status}.${
            overdueGaps.length > 0 ? ` ⚠ ${overdueGaps.length} gap${overdueGaps.length > 1 ? "s are" : " is"} overdue.` : ""
          } ${ctrlGaps.length} open gap${ctrlGaps.length > 1 ? "s" : ""}${criticalGap ? ` including a critical issue: "${criticalGap.title}"` : ""}. ${
            missingEv.length > 0 ? `${missingEv.length} evidence item${missingEv.length > 1 ? "s are" : " is"} missing.` : "Evidence is linked."
          } I've loaded the full context. What would you like to tackle first?`
        : `Control ${ctrl.id} — "${ctrl.name}" is ${ctrl.status}. ${
            missingEv.length > 0 ? `${missingEv.length} evidence item${missingEv.length > 1 ? "s are" : " is"} missing.` : ""
          } Let me help you build a remediation plan.`,
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
                  ) : (() => {
                    // Build ordered category groups from filtered controls
                    const groupOrder: string[] = [];
                    const groupMap = new Map<string, FrameworkControl[]>();
                    for (const ctrl of filteredControls) {
                      const cat = ctrl.category ?? "Other";
                      if (!groupMap.has(cat)) { groupOrder.push(cat); groupMap.set(cat, []); }
                      groupMap.get(cat)!.push(ctrl);
                    }
                    // Lookup short category ID (e.g. "CC1") from the framework registry, else derive from name
                    function catId(catName: string): string {
                      const fw = getComplianceFramework(framework.id);
                      const found = fw?.categories.find(c => c.name === catName);
                      if (found) return found.id;
                      const match = catName.match(/^([A-Z]+\d*)/);
                      return match ? match[1] : catName.slice(0, 4).toUpperCase();
                    }
                    const isGrouped = groupOrder.length > 1;
                    return groupOrder.map(catName => {
                      const ctrlsInGroup = groupMap.get(catName)!;
                      const failingInGroup = ctrlsInGroup.filter(c => c.status === "failing").length;
                      return (
                        <React.Fragment key={catName}>
                          {isGrouped && (
                            <div
                              className="flex items-center gap-[10px] px-[12px] py-[6px]"
                              style={{ background: "rgba(255,255,255,0.025)", borderBottom: `1px solid ${colors.border}` }}
                            >
                              <span style={{ fontSize: 10, fontWeight: 700, fontFamily: "monospace", color: colors.accent, minWidth: 36 }}>
                                {catId(catName)}
                              </span>
                              <span style={{ fontSize: 10, fontWeight: 600, color: colors.textMuted }}>
                                {catName}
                              </span>
                              <span style={{ fontSize: 10, color: colors.textDim, marginLeft: 2 }}>
                                · {ctrlsInGroup.length}
                              </span>
                              {failingInGroup > 0 && (
                                <span
                                  className="flex items-center gap-[3px] ml-[4px]"
                                  style={{ fontSize: 10, color: colors.critical, fontWeight: 600 }}
                                >
                                  <AlertTriangle size={8} />
                                  {failingInGroup} failing
                                </span>
                              )}
                            </div>
                          )}
                          {ctrlsInGroup.map(ctrl => {
                            const gapOwner      = GAPS.find(g => g.id === ctrl.gapId)?.owner ?? "";
                            const overrideOwner = getCtrlOwner(ctrl.id);
                            const displayOwner  = overrideOwner || gapOwner;
                            const evCount       = allEvidence.filter(e => (e.control as string) === ctrl.id).length;
                            const ctrlGaps      = GAPS.filter(g => g.control === ctrl.id);
                            const gCount        = ctrlGaps.length;
                            const urgency       = ctrlGaps.reduce<"overdue" | "due-soon" | null>((acc, g) => {
                              const u = getGapUrgency(g.dueDate);
                              if (u === "overdue") return "overdue";
                              if (u === "due-soon" && acc !== "overdue") return "due-soon";
                              return acc;
                            }, null);
                            return (
                              <ControlTableRow
                                key={ctrl.id}
                                ctrl={ctrl}
                                isSelected={selectedControlId === ctrl.id}
                                onSelect={handleSelectControl}
                                owner={displayOwner}
                                evidenceCount={evCount}
                                gapCount={gCount}
                                gapUrgency={urgency}
                              />
                            );
                          })}
                        </React.Fragment>
                      );
                    });
                  })()}
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
                    onStatusChange={(s) => setCtrlStatus(selectedControl.id, s)}
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
