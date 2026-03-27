import React, { useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router";
import {
  ArrowLeft, CheckCircle2, XCircle, AlertCircle, Clock,
  FileText, Sparkles, AlertTriangle, Calendar, TrendingDown,
  ChevronRight, X, BookmarkPlus, BookmarkCheck, ListChecks, Shield,
  FolderOpen, ClipboardList, FileCheck2, ClipboardCheck, Search, User, StickyNote,
  Target, Zap, CheckCheck, CircleDot, Flag,
  MoreHorizontal, ChevronDown, Layers, BookOpen, Globe, Activity, Info,
} from "lucide-react";
import { colors } from "../shared/design-system/tokens";
import { PageHeader } from "../shared/components/ui";
import { useAiBox } from "../features/ai-box";
import { useEvidenceStore } from "../features/compliance/evidence-store";
import { useControlStatusStore } from "../features/compliance/control-store";
import { useGapStatusStore } from "../features/compliance/gap-store";
import {
  FRAMEWORKS, FRAMEWORK_CONTROLS, FRAMEWORK_POLICIES, GAPS, EVIDENCE_ITEMS, UPCOMING_AUDITS, MONITORING_CHECKS,
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
   CONTROL DRAWER
   Sliding overlay panel for control detail — replaces right side panel.
   ================================================================ */

function ControlDrawer({
  ctrl,
  frameworkId,
  frameworkName,
  onClose,
  onAskAI,
  onStatusChange,
}: {
  ctrl: FrameworkControl;
  frameworkId: string;
  frameworkName: string;
  onClose: () => void;
  onAskAI: (ctrl: FrameworkControl) => void;
  onStatusChange: (status: ControlStatus) => void;
}) {
  const [drawerTab, setDrawerTab] = React.useState<"mapped" | "history" | "comments">("mapped");
  const { allStatuses: gapStatuses, setStatus: setGapStatus } = useGapStatusStore();
  const { items: evidenceStore }                               = useEvidenceStore();
  const [followedUp, setFollowedUp] = React.useState(() => getFollowUps().has(ctrl.id));
  const [owner, setOwner]           = React.useState(() => getCtrlOwner(ctrl.id));
  const [note, setNote]             = React.useState(() => getCtrlNote(ctrl.id));

  React.useEffect(() => {
    setFollowedUp(getFollowUps().has(ctrl.id));
    setOwner(getCtrlOwner(ctrl.id));
    setNote(getCtrlNote(ctrl.id));
    setDrawerTab("mapped");
  }, [ctrl.id]);

  const statusColor = CONTROL_STATUS_COLOR[ctrl.status];
  const isActiveGap = ctrl.status === "failing" || ctrl.status === "in-progress";

  const controlGaps = GAPS
    .filter(g => g.control === ctrl.id)
    .map(g => ({ ...g, status: (gapStatuses[g.id] ?? g.status) as GapStatus }));
  const openGaps = controlGaps.filter(g => g.status !== "resolved");

  const reqEvidence      = ctrl.requiredEvidence ?? [];
  const enrichedEvidence = reqEvidence.map(req => ({
    ...req,
    storeItem: req.evidenceId ? evidenceStore.find(e => e.id === req.evidenceId) ?? null : null,
  }));
  const evCollected = enrichedEvidence.filter(r => r.storeItem?.status === "collected").length;
  const evMissing   = enrichedEvidence.filter(r => !r.storeItem).length;

  const monitoringTests = MONITORING_CHECKS.filter(m => m.control === ctrl.id);
  const linkedPolicies  = (FRAMEWORK_POLICIES[frameworkId] ?? []).filter(p => p.controlIds?.includes(ctrl.id));
  const audit           = UPCOMING_AUDITS.find(a => FRAMEWORK_CONTROLS[a.fwId]?.some(c => c.id === ctrl.id));

  const hasCritical = openGaps.some(g => g.severity === "critical");
  const hasOverdue  = openGaps.some(g => getGapUrgency(g.dueDate) === "overdue");
  const hasDueSoon  = openGaps.some(g => getGapUrgency(g.dueDate) === "due-soon");

  const DRAWER_TABS = [
    { id: "mapped",   label: "Mapped elements" },
    { id: "history",  label: "History" },
    { id: "comments", label: "Comments" },
  ] as const;

  return (
      <div
        className="flex flex-col overflow-hidden shrink-0"
        style={{
          width: 340,
          height: "100%",
          background: colors.bgCard,
          borderRight: `1px solid ${hasCritical && ctrl.status === "failing" ? colors.critical + "44" : colors.border}`,
        }}
      >
        {/* Drawer header */}
        <div
          className="shrink-0 px-[20px] py-[16px]"
          style={{ borderBottom: `1px solid ${colors.border}` }}
        >
          <div className="flex items-start justify-between gap-[12px] mb-[10px]">
            <div className="flex-1 min-w-0">
              <p style={{ fontSize: 16, fontWeight: 700, color: colors.textPrimary, lineHeight: 1.25 }}>
                {ctrl.name}
              </p>
              <p style={{ fontSize: 11, color: colors.textMuted, marginTop: 4, lineHeight: 1.5 }} className="line-clamp-2">
                {ctrl.description}
              </p>
            </div>
            <div className="flex items-center gap-[6px] shrink-0">
              {hasOverdue && (
                <span
                  className="flex items-center gap-[3px] px-[6px] py-[2px] rounded-full text-[9px] font-bold uppercase"
                  style={{ background: `${colors.critical}20`, color: colors.critical, border: `1px solid ${colors.critical}40` }}
                >
                  <AlertTriangle size={8} /> OVERDUE
                </span>
              )}
              {!hasOverdue && hasDueSoon && (
                <span
                  className="flex items-center gap-[3px] px-[6px] py-[2px] rounded-full text-[9px] font-bold uppercase"
                  style={{ background: `${colors.medium}18`, color: colors.medium }}
                >
                  <Clock size={8} /> DUE SOON
                </span>
              )}
              <button
                onClick={onClose}
                className="flex items-center justify-center size-[28px] rounded-[7px] cursor-pointer"
                style={{ background: "rgba(255,255,255,0.05)", color: colors.textDim, border: `1px solid ${colors.border}` }}
              >
                <X size={13} />
              </button>
            </div>
          </div>

          {/* Metadata grid */}
          <div className="grid grid-cols-2 gap-[8px]">
            {[
              { label: "ID",     value: ctrl.id },
              { label: "Source", value: "Watchcenter" },
              { label: "Domain", value: ctrl.category },
              { label: "Owner",  value: owner || openGaps[0]?.owner || "—" },
            ].map(item => (
              <div key={item.label} className="flex items-baseline gap-[6px]">
                <span style={{ fontSize: 10, color: colors.textDim, width: 44, flexShrink: 0 }}>{item.label}</span>
                <span style={{ fontSize: 11, color: colors.textMuted, fontWeight: item.label === "ID" ? 600 : 400, fontFamily: item.label === "ID" ? "monospace" : undefined }}
                  className="truncate">{item.value}</span>
              </div>
            ))}
          </div>

          {/* Note */}
          <div className="flex items-baseline gap-[6px] mt-[6px]">
            <span style={{ fontSize: 10, color: colors.textDim, width: 44, flexShrink: 0 }}>Note</span>
            <input
              type="text"
              value={note}
              placeholder="Add a note…"
              onChange={(e) => setNote(e.target.value)}
              onBlur={(e) => setCtrlNote(ctrl.id, e.target.value)}
              className="flex-1 min-w-0 px-[8px] py-[4px] rounded-[6px] text-[11px] outline-none"
              style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${colors.border}`, color: colors.textPrimary }}
            />
          </div>
        </div>

        {/* Drawer tabs */}
        <div className="shrink-0 flex gap-0 px-[20px]" style={{ borderBottom: `1px solid ${colors.border}` }}>
          {DRAWER_TABS.map(tab => {
            const isActive = drawerTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setDrawerTab(tab.id)}
                className="px-[12px] py-[9px] text-[11px] font-medium cursor-pointer"
                style={{
                  color: isActive ? colors.textPrimary : colors.textDim,
                  background: "none",
                  border: "none",
                  borderBottom: `2px solid ${isActive ? colors.accent : "transparent"}`,
                  marginBottom: -1,
                  paddingBottom: 10,
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Drawer body */}
        <div className="flex-1 overflow-y-auto px-[20px] py-[16px] flex flex-col gap-[16px]">

          {/* ── MAPPED ELEMENTS TAB ── */}
          {drawerTab === "mapped" && (
            <>
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
                      <button key={s} onClick={() => onStatusChange(s)}
                        className="flex items-center gap-[5px] px-[9px] py-[4px] rounded-[6px] text-[10px] font-semibold cursor-pointer"
                        style={{ background: isActive ? `${sc}20` : "rgba(255,255,255,0.04)", color: isActive ? sc : colors.textDim, border: `1px solid ${isActive ? sc + "44" : "rgba(255,255,255,0.08)"}` }}>
                        {CONTROL_STATUS_ICON[s]}
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Open Actions */}
              {openGaps.length > 0 && (
                <div>
                  <div className="flex items-center gap-[6px] mb-[8px]">
                    <Target size={11} color={hasCritical ? colors.critical : colors.medium} />
                    <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase" as const, color: hasCritical ? colors.critical : colors.medium }}>
                      Open Actions ({openGaps.length})
                    </span>
                  </div>
                  <div className="flex flex-col gap-[8px]">
                    {openGaps.map(gap => {
                      const urgency = getGapUrgency(gap.dueDate);
                      const sc = gap.severity === "critical" ? colors.critical : gap.severity === "high" ? colors.high : colors.medium;
                      return (
                        <div key={gap.id} className="flex flex-col gap-[8px] p-[11px] rounded-[9px]"
                          style={{ background: `${sc}08`, border: `1px solid ${sc}${urgency === "overdue" ? "44" : "28"}` }}>
                          <div className="flex items-center gap-[6px] flex-wrap">
                            <span className="px-[6px] py-[1px] rounded-full text-[9px] font-bold uppercase"
                              style={{ background: `${sc}18`, color: sc }}>{gap.severity}</span>
                            {urgency === "overdue" && (
                              <span className="flex items-center gap-[3px] text-[9px] font-bold uppercase" style={{ color: colors.critical }}>
                                <AlertTriangle size={9} /> OVERDUE
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
                          <p style={{ fontSize: 12, fontWeight: 600, color: colors.textPrimary, lineHeight: 1.35 }}>{gap.title}</p>
                          <p style={{ fontSize: 11, color: colors.textMuted, lineHeight: 1.5 }}>{gap.description}</p>
                          <div className="flex items-center gap-[12px]">
                            <span className="flex items-center gap-[4px]" style={{ fontSize: 10, color: colors.textDim }}>
                              <User size={9} /> {gap.owner}
                            </span>
                            <span style={{ fontSize: 10, color: colors.textDim }}>{gap.daysOpen}d open</span>
                          </div>
                          <div className="flex gap-[4px] flex-wrap pt-[2px]" style={{ borderTop: `1px solid ${sc}18` }}>
                            {(["open", "in_progress", "resolved"] as GapStatus[]).map(s => {
                              const isActive = gap.status === s;
                              const sColor = s === "resolved" ? colors.success : s === "in_progress" ? colors.medium : sc;
                              return (
                                <button key={s} onClick={() => setGapStatus(gap.id, s)}
                                  className="flex items-center gap-[4px] px-[7px] py-[3px] rounded-[5px] text-[9px] font-semibold cursor-pointer"
                                  style={{ background: isActive ? `${sColor}20` : "rgba(255,255,255,0.04)", color: isActive ? sColor : colors.textDim, border: `1px solid ${isActive ? sColor + "44" : "rgba(255,255,255,0.08)"}` }}>
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

              {/* Tests */}
              <div>
                <div className="flex items-center justify-between mb-[8px]">
                  <div className="flex items-center gap-[6px]">
                    <Activity size={11} color={colors.textDim} />
                    <span style={{ fontSize: 10, fontWeight: 700, color: colors.textDim, letterSpacing: "0.07em", textTransform: "uppercase" }}>
                      Tests {monitoringTests.length > 0 ? `${monitoringTests.filter(m => m.status === "passing").length}/${monitoringTests.length} OK` : ""}
                    </span>
                  </div>
                </div>
                {monitoringTests.length === 0 ? (
                  <p style={{ fontSize: 11, color: colors.textDim }}>No automated tests mapped to this control.</p>
                ) : (
                  <div className="flex flex-col gap-[4px]">
                    {monitoringTests.map(test => {
                      const tc = test.status === "passing" ? colors.success : test.status === "failing" ? colors.critical : colors.medium;
                      return (
                        <div key={test.id} className="flex items-center gap-[8px] px-[10px] py-[7px] rounded-[7px]"
                          style={{ background: `${tc}08`, border: `1px solid ${tc}20` }}>
                          {test.status === "passing" ? <CheckCircle2 size={11} color={tc} /> : test.status === "failing" ? <XCircle size={11} color={tc} /> : <AlertCircle size={11} color={tc} />}
                          <div className="flex-1 min-w-0">
                            <p style={{ fontSize: 11, fontWeight: 600, color: colors.textPrimary }} className="truncate">{test.name}</p>
                            <p style={{ fontSize: 9, color: colors.textDim }}>{test.lastRun} · {test.frequency}</p>
                          </div>
                          {test.anomalies > 0 && (
                            <span style={{ fontSize: 9, fontWeight: 700, color: colors.critical }}>{test.anomalies} anomal{test.anomalies === 1 ? "y" : "ies"}</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Documents / Evidence */}
              {reqEvidence.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-[8px]">
                    <div className="flex items-center gap-[6px]">
                      <FileText size={11} color={colors.textDim} />
                      <span style={{ fontSize: 10, fontWeight: 700, color: colors.textDim, letterSpacing: "0.07em", textTransform: "uppercase" }}>
                        Documents
                      </span>
                    </div>
                    <span style={{ fontSize: 10, color: colors.textDim }}>
                      {evCollected}/{reqEvidence.length} OK
                      {evMissing > 0 && isActiveGap && <span style={{ color: colors.critical }}> · {evMissing} missing</span>}
                    </span>
                  </div>
                  {evMissing > 0 && isActiveGap && openGaps.length > 0 && (
                    <div className="flex flex-col gap-[4px] px-[10px] py-[8px] rounded-[7px] mb-[8px]"
                      style={{ background: `${colors.critical}08`, border: `1px solid ${colors.critical}28` }}>
                      <div className="flex items-center gap-[7px]">
                        <AlertTriangle size={11} color={colors.critical} className="shrink-0" />
                        <p style={{ fontSize: 11, color: colors.critical, fontWeight: 600 }}>{evMissing} item{evMissing !== 1 ? "s" : ""} missing</p>
                      </div>
                      <p style={{ fontSize: 10, color: colors.textMuted, lineHeight: 1.4, paddingLeft: 18 }}>
                        This missing evidence is preventing this control from passing.
                      </p>
                    </div>
                  )}
                  <div className="flex flex-col gap-[2px]">
                    {enrichedEvidence.map((req, i) => {
                      const item    = req.storeItem;
                      const missing = !item;
                      const sc = item ? (item.status === "collected" ? colors.success : item.status === "pending" ? colors.medium : colors.critical) : isActiveGap ? colors.critical : colors.textDim;
                      return (
                        <div key={i} className="flex items-start gap-[8px] px-[8px] py-[6px] rounded-[6px]"
                          style={{ background: missing && isActiveGap ? `${colors.critical}07` : "transparent", border: `1px solid ${missing && isActiveGap ? colors.critical + "18" : "transparent"}` }}>
                          <span className="shrink-0 mt-[1px]">
                            {item ? (item.status === "collected" ? <CheckCircle2 size={12} color={colors.success} /> : item.status === "pending" ? <Clock size={12} color={colors.medium} /> : <AlertTriangle size={12} color={colors.critical} />) : isActiveGap ? <XCircle size={12} color={colors.critical} /> : <div className="size-[5px] rounded-full mt-[4px]" style={{ background: colors.textDim }} />}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="truncate" style={{ fontSize: 11, fontWeight: missing && isActiveGap ? 600 : 400, color: missing && isActiveGap ? colors.critical : item ? colors.textPrimary : colors.textMuted }}>
                              {req.label}
                              {req.assumed && <span style={{ fontSize: 9, color: colors.textDim, marginLeft: 5 }}>~assumed</span>}
                            </p>
                            {item && <p style={{ fontSize: 10, color: colors.textDim, marginTop: 1 }}>{item.collector}{item.dueDate ? ` · due ${item.dueDate}` : ""}</p>}
                          </div>
                          {item ? (
                            <span className="shrink-0 px-[5px] py-[1px] rounded-full text-[9px] font-medium capitalize" style={{ background: `${sc}14`, color: sc }}>
                              {item.status}
                            </span>
                          ) : (
                            <span style={{ fontSize: 9, fontWeight: 600, color: sc, flexShrink: 0 }}>{isActiveGap ? "missing" : "unlinked"}</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Policies */}
              <div>
                <div className="flex items-center gap-[6px] mb-[8px]">
                  <FileCheck2 size={11} color={colors.textDim} />
                  <span style={{ fontSize: 10, fontWeight: 700, color: colors.textDim, letterSpacing: "0.07em", textTransform: "uppercase" }}>
                    Policies {linkedPolicies.length > 0 ? `(${linkedPolicies.length})` : ""}
                  </span>
                </div>
                {linkedPolicies.length === 0 ? (
                  <p style={{ fontSize: 11, color: colors.textDim }}>No policies mapped to this control.</p>
                ) : (
                  <div className="flex flex-col gap-[4px]">
                    {linkedPolicies.map(policy => {
                      const pc = POLICY_STATUS_COLOR[policy.status];
                      return (
                        <div key={policy.id} className="flex items-center gap-[8px] px-[10px] py-[8px] rounded-[7px]"
                          style={{ background: colors.bgCard, border: `1px solid ${colors.border}` }}>
                          <div className="flex-1 min-w-0">
                            <p style={{ fontSize: 11, fontWeight: 600, color: colors.textPrimary }} className="truncate">{policy.name}</p>
                            <p style={{ fontSize: 10, color: colors.textDim }}>Control depends on policy approval and employee acceptance</p>
                          </div>
                          <span className="px-[5px] py-[1px] rounded-full text-[9px] font-medium capitalize shrink-0"
                            style={{ background: `${pc}14`, color: pc }}>{policy.status}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Frameworks */}
              <div>
                <div className="flex items-center gap-[6px] mb-[8px]">
                  <Layers size={11} color={colors.textDim} />
                  <span style={{ fontSize: 10, fontWeight: 700, color: colors.textDim, letterSpacing: "0.07em", textTransform: "uppercase" }}>
                    Frameworks
                  </span>
                </div>
                <div className="flex flex-wrap gap-[4px]">
                  <span className="flex items-center gap-[4px] px-[8px] py-[3px] rounded-full text-[10px] font-medium"
                    style={{ background: `${colors.accent}14`, color: colors.accent, border: `1px solid ${colors.accent}28` }}>
                    {frameworkName} · {ctrl.category}
                    <button style={{ marginLeft: 2, color: colors.textDim, background: "none", border: "none", cursor: "pointer" }}>×</button>
                  </span>
                </div>
              </div>

              {/* Risk Scenarios */}
              <div>
                <div className="flex items-center gap-[6px] mb-[8px]">
                  <AlertTriangle size={11} color={colors.textDim} />
                  <span style={{ fontSize: 10, fontWeight: 700, color: colors.textDim, letterSpacing: "0.07em", textTransform: "uppercase" }}>
                    Risk scenarios
                  </span>
                </div>
                {controlGaps.length === 0 ? (
                  <p style={{ fontSize: 11, color: colors.textDim }}>No risk scenarios associated with this control.</p>
                ) : (
                  <div className="flex flex-col gap-[4px]">
                    {controlGaps.map(gap => {
                      const sc = gap.severity === "critical" ? colors.critical : gap.severity === "high" ? colors.high : colors.medium;
                      return (
                        <div key={gap.id} className="flex items-start gap-[8px] px-[10px] py-[8px] rounded-[7px]"
                          style={{ background: `${sc}08`, border: `1px solid ${sc}22` }}>
                          <span className="px-[5px] py-[1px] rounded-full text-[9px] font-bold uppercase shrink-0 mt-[1px]"
                            style={{ background: `${sc}18`, color: sc }}>{gap.severity}</span>
                          <p style={{ fontSize: 11, color: colors.textMuted, lineHeight: 1.4 }}>{gap.title}</p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Audit impact */}
              {audit && (
                <div className="flex flex-col gap-[6px] p-[12px] rounded-[8px]"
                  style={{ background: `${colors.primary}0a`, border: `1px solid ${colors.primary}22` }}>
                  <div className="flex items-center gap-[6px]">
                    <Calendar size={11} color={colors.primary} />
                    <span style={{ fontSize: 10, fontWeight: 700, color: colors.textDim, letterSpacing: "0.07em", textTransform: "uppercase" }}>Audit impact</span>
                  </div>
                  <p style={{ fontSize: 12, fontWeight: 600, color: colors.textPrimary }}>{audit.name}</p>
                  <p style={{ fontSize: 10, color: colors.textMuted }}>{audit.date} · {audit.daysUntil} days away · Readiness {audit.readiness}%</p>
                </div>
              )}

              {/* Why it matters */}
              {ctrl.whyItMatters && (
                <div>
                  <div className="flex items-center gap-[6px] mb-[6px]">
                    <Shield size={11} color={colors.textDim} />
                    <span style={{ fontSize: 10, fontWeight: 700, color: colors.textDim, letterSpacing: "0.07em", textTransform: "uppercase" }}>Why this matters</span>
                  </div>
                  <p style={{ fontSize: 12, color: colors.textMuted, lineHeight: 1.6 }}>{ctrl.whyItMatters}</p>
                </div>
              )}

              {/* Remediation steps */}
              {ctrl.remediationSteps && ctrl.remediationSteps.length > 0 && (
                <div>
                  <div className="flex items-center gap-[6px] mb-[8px]">
                    <ListChecks size={11} color={colors.textDim} />
                    <span style={{ fontSize: 10, fontWeight: 700, color: colors.textDim, letterSpacing: "0.07em", textTransform: "uppercase" }}>Remediation steps</span>
                  </div>
                  <ol className="flex flex-col gap-[6px]">
                    {ctrl.remediationSteps.map((step, i) => (
                      <li key={i} className="flex items-start gap-[9px]">
                        <span className="shrink-0 flex items-center justify-center rounded-full size-[17px] text-[9px] font-bold mt-[1px]"
                          style={{ background: `${colors.primary}18`, color: colors.primary, border: `1px solid ${colors.primary}28` }}>{i + 1}</span>
                        <span style={{ fontSize: 12, color: colors.textMuted, lineHeight: 1.5 }}>{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              {/* Passing state */}
              {ctrl.status === "passing" && openGaps.length === 0 && !ctrl.whyItMatters && (
                <div className="flex items-center gap-[8px] p-[12px] rounded-[8px]"
                  style={{ background: `${colors.success}0a`, border: `1px solid ${colors.success}22` }}>
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
                  <span style={{ fontSize: 10, fontWeight: 700, color: colors.textDim, letterSpacing: "0.07em", textTransform: "uppercase" }}>Owner</span>
                </div>
                <input
                  type="text" value={owner}
                  placeholder={controlGaps[0]?.owner ?? "Assign owner…"}
                  onChange={(e) => setOwner(e.target.value)}
                  onBlur={(e) => setCtrlOwner(ctrl.id, e.target.value)}
                  className="w-full px-[10px] py-[7px] rounded-[7px] text-[12px] outline-none"
                  style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${colors.border}`, color: colors.textPrimary }}
                />
              </div>
            </>
          )}

          {/* ── HISTORY TAB ── */}
          {drawerTab === "history" && (
            <div className="flex flex-col gap-[10px]">
              {[
                { date: "Mar 27, 2026", event: "Status changed to " + ctrl.status, actor: "You" },
                { date: "Mar 15, 2026", event: "Evidence updated — MFA Enforcement Logs", actor: "Platform Eng" },
                { date: "Mar 5, 2026",  event: "Control reviewed and assigned", actor: "Compliance Team" },
              ].map((entry, i) => (
                <div key={i} className="flex items-start gap-[10px]">
                  <div className="size-[6px] rounded-full mt-[5px] shrink-0" style={{ background: colors.textDim }} />
                  <div className="flex-1 min-w-0">
                    <p style={{ fontSize: 11, color: colors.textMuted }}>{entry.event}</p>
                    <p style={{ fontSize: 10, color: colors.textDim, marginTop: 1 }}>{entry.date} · {entry.actor}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── COMMENTS TAB ── */}
          {drawerTab === "comments" && (
            <div className="flex flex-col gap-[10px]">
              <textarea
                value={note}
                placeholder="Add a comment or note…"
                rows={3}
                onChange={(e) => setNote(e.target.value)}
                onBlur={(e) => setCtrlNote(ctrl.id, e.target.value)}
                className="w-full px-[10px] py-[7px] rounded-[7px] text-[12px] outline-none resize-none"
                style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${colors.border}`, color: colors.textPrimary, lineHeight: 1.5 }}
              />
              <p style={{ fontSize: 11, color: colors.textDim }}>No comments yet.</p>
            </div>
          )}
        </div>

        {/* Drawer footer */}
        <div className="shrink-0 flex flex-col gap-[8px] px-[20px] py-[14px]"
          style={{ borderTop: `1px solid ${colors.border}` }}>
          {ctrl.status !== "passing" && (
            <button
              onClick={() => onAskAI(ctrl)}
              className="w-full flex items-center justify-center gap-[6px] px-[12px] py-[10px] rounded-[8px] text-[12px] font-semibold cursor-pointer"
              style={ctrl.status === "failing"
                ? { background: colors.critical, color: "#fff", border: `1px solid ${colors.critical}` }
                : { background: `${statusColor}18`, color: statusColor, border: `1px solid ${statusColor}2a` }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = "0.88"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = "1"; }}
            >
              {ctrl.status === "failing" ? <Zap size={13} /> : <Sparkles size={13} />}
              {ctrl.status === "failing" ? "Fix this control" : "Remediate with AI"}
            </button>
          )}
          <button
            onClick={() => { const next = toggleFollowUp(ctrl.id); setFollowedUp(next); }}
            className="w-full flex items-center justify-center gap-[6px] px-[12px] py-[8px] rounded-[8px] text-[12px] font-medium cursor-pointer"
            style={{
              background: followedUp ? `${colors.accent}14` : "rgba(255,255,255,0.04)",
              color: followedUp ? colors.accent : colors.textMuted,
              border: `1px solid ${followedUp ? colors.accent + "33" : "rgba(255,255,255,0.08)"}`,
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
   OVERVIEW TAB
   Framework overview — calmer, informational.
   ================================================================ */

function OverviewTab({
  framework,
  controls,
  gaps,
}: {
  framework: typeof FRAMEWORKS[number];
  controls: import("./compliance-data").FrameworkControl[];
  gaps: typeof GAPS;
}) {
  const { items: evidenceItems } = useEvidenceStore();
  const fwEv       = evidenceItems.filter(e => e.fwId === framework.id);
  const evOK       = fwEv.filter(e => e.status === "collected").length;
  const evPending  = fwEv.filter(e => e.status === "pending").length;
  const evOverdue  = fwEv.filter(e => e.status === "overdue").length;

  const ctrlFailing   = controls.filter(c => c.status === "failing").length;
  const ctrlInProg    = controls.filter(c => c.status === "in-progress").length;
  const ctrlPassing   = controls.filter(c => c.status === "passing").length;
  const SOC2_TRUST_SERVICES = ["Security", "Availability", "Confidentiality", "Processing Integrity", "Privacy"];

  const INDUSTRIES_BY_FW: Record<string, string[]> = {
    "soc2":     ["Technology", "Finance", "Healthcare", "Government", "SaaS", "Cloud Service Providers"],
    "iso27001": ["Manufacturing", "Finance", "Healthcare", "Government", "Technology", "Legal"],
    "nist-csf": ["Critical Infrastructure", "Government", "Finance", "Energy", "Healthcare"],
    "pci-dss":  ["Retail", "Finance", "E-Commerce", "Hospitality", "Healthcare"],
    "hipaa":    ["Healthcare", "Health Insurance", "Clearinghouses", "Business Associates"],
  };
  const industries = INDUSTRIES_BY_FW[framework.id] ?? ["Technology", "Finance", "Government"];

  const SCOPE_BY_FW: Record<string, string> = {
    "soc2":    "SOC 2 controls depend on the Trust Services Criteria included in your audit. Security covers people, processes, and technologies used to deliver a service. Availability & Processing Integrity cover uptime and processing commitments. Confidentiality & Privacy cover personal and sensitive information.",
    "iso27001":"ISO 27001 applies to the entire ISMS scope as defined by the organisation. Clause 4–10 covers the management system itself. Annex A provides 93 controls across 4 categories. The scope can be a business unit, a product line, or the full organisation.",
    "nist-csf":"The CSF applies to any organisation seeking to manage cybersecurity risk. The framework consists of the Core (Identify, Protect, Detect, Respond, Recover), Profiles, and Tiers. Implementation can be partial or complete depending on risk tolerance.",
    "pci-dss": "PCI-DSS scope covers all system components in the cardholder data environment (CDE) — any system that stores, processes, or transmits cardholder data, plus connected systems. Scoping reduction through segmentation can significantly reduce compliance effort.",
    "hipaa":   "HIPAA applies to covered entities (healthcare providers, insurers, clearinghouses) and their business associates. ePHI in any form — stored, transmitted, or processed — is in scope. The Security Rule focuses on administrative, physical, and technical safeguards.",
  };
  const scope = SCOPE_BY_FW[framework.id] ?? "Framework scope covers organisational systems, processes, and data handling practices as defined in your compliance programme.";

  const BENEFITS_BY_FW: Record<string, string[]> = {
    "soc2":    ["Build trust: Demonstrates strong security, availability, and privacy controls, reassuring clients and stakeholders.", "Increase sales: Attracts enterprise clients and regulated industries that require vendors to meet SOC 2.", "Reduce risk: Helps prevent data breaches and operational disruptions by enforcing best-in-class security controls."],
    "iso27001":["Risk reduction: Provides a structured approach to identifying and treating information security risks.", "International recognition: Accepted globally as evidence of security maturity.", "Operational resilience: Embeds security into organisational processes and supplier relationships."],
    "nist-csf":["Flexible adoption: Scales from basic to advanced implementation based on risk appetite.", "Common language: Provides a shared vocabulary for cybersecurity risk management across teams.", "Regulatory alignment: Maps to many regulations including HIPAA, PCI-DSS, and FISMA."],
    "pci-dss": ["Payment trust: Demonstrates commitment to protecting cardholder data, a prerequisite for accepting card payments.", "Breach prevention: Enforces proven controls that significantly reduce payment card fraud risk.", "Contractual compliance: Required by card brands and acquiring banks as a condition of doing business."],
    "hipaa":   ["Patient trust: Demonstrates commitment to protecting sensitive health information.", "Legal protection: Reduces risk of regulatory penalties and breach notification requirements.", "Operational security: Embeds safeguards that protect clinical and operational systems."],
  };
  const benefits = BENEFITS_BY_FW[framework.id] ?? ["Reduces risk", "Builds trust", "Improves security posture"];

  return (
    <div className="flex flex-col gap-[20px] max-w-[900px]">

      {/* Health summary cards */}
      <div className="grid grid-cols-2 gap-[12px]">
        {/* Controls card */}
        <div className="flex flex-col gap-[10px] p-[16px] rounded-[10px]"
          style={{ background: colors.bgCard, border: `1px solid ${colors.border}` }}>
          <p style={{ fontSize: 10, fontWeight: 700, color: colors.textDim, letterSpacing: "0.07em", textTransform: "uppercase" }}>Controls</p>
          <div className="flex items-baseline gap-[4px]">
            <span style={{ fontSize: 22, fontWeight: 700, color: colors.textPrimary, lineHeight: 1 }}>{ctrlPassing}</span>
            <span style={{ fontSize: 11, color: colors.textDim }}>/ {controls.length} passing</span>
          </div>
          <div className="flex gap-[3px] h-[4px] rounded-full overflow-hidden">
            <div style={{ flex: ctrlPassing, background: colors.success }} />
            <div style={{ flex: ctrlInProg, background: colors.medium }} />
            <div style={{ flex: ctrlFailing, background: colors.critical }} />
            <div style={{ flex: controls.length - ctrlPassing - ctrlInProg - ctrlFailing, background: "rgba(255,255,255,0.06)" }} />
          </div>
          <div className="flex gap-[10px]">
            {ctrlFailing > 0 && <span style={{ fontSize: 10, color: colors.critical }}>{ctrlFailing} failing</span>}
            {ctrlInProg > 0 && <span style={{ fontSize: 10, color: colors.medium }}>{ctrlInProg} in progress</span>}
          </div>
        </div>

        {/* Evidence card */}
        <div className="flex flex-col gap-[10px] p-[16px] rounded-[10px]"
          style={{ background: colors.bgCard, border: `1px solid ${colors.border}` }}>
          <p style={{ fontSize: 10, fontWeight: 700, color: colors.textDim, letterSpacing: "0.07em", textTransform: "uppercase" }}>Evidence</p>
          <div className="flex items-baseline gap-[4px]">
            <span style={{ fontSize: 22, fontWeight: 700, color: colors.textPrimary, lineHeight: 1 }}>{fwEv.length > 0 ? Math.round((evOK / fwEv.length) * 100) : 0}%</span>
            <span style={{ fontSize: 11, color: colors.textDim }}>passing</span>
          </div>
          <div className="flex gap-[3px] h-[4px] rounded-full overflow-hidden">
            <div style={{ flex: evOK, background: colors.success }} />
            <div style={{ flex: evPending, background: colors.medium }} />
            <div style={{ flex: evOverdue, background: colors.critical }} />
            <div style={{ flex: Math.max(0, fwEv.length - evOK - evPending - evOverdue), background: "rgba(255,255,255,0.06)" }} />
          </div>
          <p style={{ fontSize: 10, color: colors.textDim }}>
            {evOK} collected · {evPending} pending{evOverdue > 0 ? ` · ${evOverdue} overdue` : ""}
          </p>
        </div>
      </div>

      {/* Framework description */}
      <div className="flex flex-col gap-[12px] p-[20px] rounded-[10px]"
        style={{ background: colors.bgCard, border: `1px solid ${colors.border}` }}>
        <p style={{ fontSize: 13, fontWeight: 700, color: colors.textPrimary }}>{framework.name} program overview</p>
        <p style={{ fontSize: 12, color: colors.textMuted, lineHeight: 1.7 }}>{framework.purpose}</p>

        {/* Trust service categories for SOC 2 */}
        {framework.id === "soc2" && (
          <div>
            <p style={{ fontSize: 11, fontWeight: 600, color: colors.textMuted, marginBottom: 8 }}>Available control sets</p>
            <div className="flex flex-wrap gap-[6px]">
              {SOC2_TRUST_SERVICES.map(ts => (
                <span key={ts} className="px-[10px] py-[4px] rounded-full text-[11px] font-medium"
                  style={{ background: `${colors.accent}12`, color: colors.accent, border: `1px solid ${colors.accent}28` }}>
                  {ts}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Expandable sections */}
      {[
        {
          title: "Audit and assurance steps",
          content: framework.id === "soc2"
            ? "SOC 2 requires a formal audit conducted by an independent third-party auditor. It cannot be self-attested.\n\nAssessment approach: SOC 2 audits have two main types. A Type 1 audit evaluates the design of controls at a point in time. A Type 2 audit assesses the operational effectiveness of controls over a period, typically six months to a year.\n\nOutcome: A SOC 2 audit results in an attestation report on compliance."
            : `${framework.name} assessments require documented evidence of control effectiveness, management review, and in most cases third-party verification. Assessment frequency is defined by the standard and your organisation's risk profile.`,
        },
        {
          title: "Relevant industries and geographies",
          content: `Relevant industries: ${industries.join(", ")}.\n\nGeographical focus: ${framework.id === "hipaa" ? "United States" : framework.id === "pci-dss" ? "Global (card brand territories)" : "International / Global"}.`,
        },
        {
          title: "Typical implementation scope",
          content: scope,
        },
        {
          title: "Benefits of compliance",
          content: benefits.join("\n\n"),
        },
      ].map(section => (
        <OverviewSection key={section.title} title={section.title} content={section.content} />
      ))}
    </div>
  );
}

function OverviewSection({ title, content }: { title: string; content: string }) {
  const [open, setOpen] = React.useState(true);
  return (
    <div className="rounded-[10px] overflow-hidden"
      style={{ border: `1px solid ${colors.border}`, background: colors.bgCard }}>
      <button
        className="w-full flex items-center justify-between gap-[10px] px-[16px] py-[13px] cursor-pointer text-left"
        onClick={() => setOpen(p => !p)}
        style={{ background: "none", border: "none" }}
      >
        <span style={{ fontSize: 13, fontWeight: 600, color: colors.textPrimary }}>{title}</span>
        {open ? <ChevronDown size={14} color={colors.textDim} /> : <ChevronRight size={14} color={colors.textDim} />}
      </button>
      {open && (
        <div className="px-[16px] pb-[14px]" style={{ borderTop: `1px solid ${colors.border}` }}>
          {content.split("\n\n").map((para, i) => (
            <p key={i} style={{ fontSize: 12, color: colors.textMuted, lineHeight: 1.7, marginTop: i > 0 ? 10 : 10 }}>
              {para}
            </p>
          ))}
        </div>
      )}
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
  const navigate    = useNavigate();
  const { frameworkId } = useParams<{ frameworkId: string }>();
  const [menuOpenId, setMenuOpenId] = React.useState<string | null>(null);

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
            <span style={{ fontSize: 10, fontWeight: 700, color: colors.textDim, textTransform: "uppercase", letterSpacing: "0.07em" }}>Name</span>
          </div>
          <div className="shrink-0 px-[8px] py-[8px]" style={{ width: 110 }}>
            <span style={{ fontSize: 10, fontWeight: 700, color: colors.textDim, textTransform: "uppercase", letterSpacing: "0.07em" }}>Overall status</span>
          </div>
          <div className="shrink-0 px-[8px] py-[8px]" style={{ width: 100 }}>
            <span style={{ fontSize: 10, fontWeight: 700, color: colors.textDim, textTransform: "uppercase", letterSpacing: "0.07em" }}>Renew by</span>
          </div>
          <div className="shrink-0 px-[8px] py-[8px]" style={{ width: 90 }}>
            <span style={{ fontSize: 10, fontWeight: 700, color: colors.textDim, textTransform: "uppercase", letterSpacing: "0.07em" }}>Latest version</span>
          </div>
          <div className="shrink-0 px-[8px] py-[8px]" style={{ width: 120 }}>
            <span style={{ fontSize: 10, fontWeight: 700, color: colors.textDim, textTransform: "uppercase", letterSpacing: "0.07em" }}>Owner</span>
          </div>
          <div className="shrink-0" style={{ width: 40 }} />
        </div>

        {/* Rows */}
        {sorted.map(policy => {
          const statusColor  = POLICY_STATUS_COLOR[policy.status];
          const isAtRisk     = policy.status !== "approved";
          const statusLabel  = policy.status === "under-review" ? "Under Review" : policy.status === "approved" ? "Approved" : policy.status.charAt(0).toUpperCase() + policy.status.slice(1);
          const isMenuOpen   = menuOpenId === policy.id;
          return (
            <div
              key={policy.id}
              role="button"
              tabIndex={0}
              className="flex items-center cursor-pointer select-none relative"
              style={{
                borderBottom: `1px solid ${colors.border}`,
                background: isAtRisk ? `${statusColor}06` : "transparent",
                outline: "none",
              }}
              onClick={() => navigate(`/compliance/${frameworkId}/policies/${policy.id}`)}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") navigate(`/compliance/${frameworkId}/policies/${policy.id}`); }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = isAtRisk ? `${statusColor}0e` : "rgba(255,255,255,0.02)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = isAtRisk ? `${statusColor}06` : "transparent"; }}
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
              <div className="shrink-0 px-[8px] py-[10px]" style={{ width: 110 }}>
                <span
                  className="flex items-center gap-[5px] px-[6px] py-[2px] rounded-[5px] w-fit text-[10px] font-semibold"
                  style={{ background: `${statusColor}14`, color: statusColor, border: `1px solid ${statusColor}28` }}
                >
                  {POLICY_STATUS_ICON[policy.status]}
                  {statusLabel}
                </span>
              </div>

              {/* Renew by */}
              <div className="shrink-0 px-[8px] py-[10px]" style={{ width: 100 }}>
                <span
                  className="flex items-center gap-[4px]"
                  style={{ fontSize: 11, color: isAtRisk ? statusColor : colors.textMuted }}
                >
                  {policy.nextReview ? <><Calendar size={10} /> {policy.nextReview}</> : "—"}
                </span>
              </div>

              {/* Version */}
              <div className="shrink-0 px-[8px] py-[10px]" style={{ width: 90 }}>
                <span
                  className="px-[6px] py-[1px] rounded-[4px] text-[10px] font-medium"
                  style={{
                    background: policy.status === "approved" ? `${colors.success}14` : `${statusColor}14`,
                    color: policy.status === "approved" ? colors.success : statusColor,
                  }}
                >
                  {policy.version}
                </span>
              </div>

              {/* Owner */}
              <div className="shrink-0 px-[8px] py-[10px]" style={{ width: 120 }}>
                <span style={{ fontSize: 11, color: colors.textMuted }} className="truncate block">{policy.owner}</span>
              </div>

              {/* Actions menu */}
              <div className="shrink-0 px-[8px] py-[10px]" style={{ width: 40 }}>
                <button
                  onClick={(e) => { e.stopPropagation(); setMenuOpenId(isMenuOpen ? null : policy.id); }}
                  className="flex items-center justify-center size-[24px] rounded-[5px] cursor-pointer"
                  style={{
                    background: isMenuOpen ? "rgba(255,255,255,0.1)" : "transparent",
                    color: colors.textDim,
                    border: `1px solid ${isMenuOpen ? colors.border : "transparent"}`,
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.07)"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = isMenuOpen ? "rgba(255,255,255,0.1)" : "transparent"; }}
                >
                  <MoreHorizontal size={12} />
                </button>

                {isMenuOpen && (
                  <div
                    className="absolute right-[12px] top-[32px] z-[20] rounded-[8px] overflow-hidden"
                    style={{
                      background: "#1a2332",
                      border: `1px solid ${colors.border}`,
                      boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
                      minWidth: 160,
                    }}
                  >
                    {[
                      { label: "View details", action: () => navigate(`/compliance/${frameworkId}/policies/${policy.id}`), icon: <FileText size={11} /> },
                      { label: "Manage access", action: () => {}, icon: <User size={11} /> },
                      { label: "Download", action: () => {}, icon: <ChevronDown size={11} /> },
                    ].map((item, idx) => (
                      <button
                        key={idx}
                        onClick={(e) => { e.stopPropagation(); item.action(); setMenuOpenId(null); }}
                        className="w-full flex items-center gap-[8px] px-[12px] py-[9px] text-left cursor-pointer text-[11px]"
                        style={{ background: "none", border: "none", color: colors.textMuted }}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.06)"; }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "none"; }}
                      >
                        {item.icon}
                        {item.label}
                      </button>
                    ))}
                  </div>
                )}
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
  const navigate              = useNavigate();
  const { items, update }     = useEvidenceStore();
  const [menuOpenId, setMenuOpenId] = React.useState<string | null>(null);
  const fwItems               = items.filter(ev => ev.fwId === frameworkId);

  const collectedCount = fwItems.filter(e => e.status === "collected").length;
  const pendingCount   = fwItems.filter(e => e.status === "pending").length;
  const overdueCount   = fwItems.filter(e => e.status === "overdue").length;

  const sorted = [...fwItems].sort((a, b) => {
    const o = { overdue: 0, pending: 1, collected: 2 } as const;
    return o[a.status] - o[b.status];
  });

  const EV_COLOR: Record<string, string> = { collected: colors.success, pending: colors.medium, overdue: colors.critical };

  return (
    <div className="flex flex-col gap-[12px]">
      {/* Summary */}
      {fwItems.length > 0 && (
        <div className="flex items-center gap-[14px] flex-wrap">
          <span style={{ fontSize: 11, color: colors.success }}>{collectedCount} collected</span>
          <span style={{ fontSize: 11, color: colors.medium }}>{pendingCount} pending</span>
          {overdueCount > 0 && <span style={{ fontSize: 11, color: colors.critical }}>{overdueCount} overdue</span>}
          <div className="flex-1 min-w-[100px] max-w-[200px]">
            <div className="flex h-[3px] rounded-full overflow-hidden w-full" style={{ background: "rgba(255,255,255,0.06)" }}>
              <div style={{ width: `${fwItems.length ? (collectedCount / fwItems.length) * 100 : 0}%`, background: colors.success }} />
              <div style={{ width: `${fwItems.length ? (pendingCount / fwItems.length) * 100 : 0}%`, background: colors.medium }} />
              <div style={{ width: `${fwItems.length ? (overdueCount / fwItems.length) * 100 : 0}%`, background: colors.critical }} />
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      {sorted.length === 0 ? (
        <div className="flex items-center justify-center p-[32px] rounded-[12px]"
          style={{ background: colors.bgCard, border: `1px solid ${colors.border}` }}>
          <p style={{ fontSize: 12, color: colors.textDim }}>No evidence items mapped to this framework yet.</p>
        </div>
      ) : (
        <div className="rounded-[10px] overflow-hidden" style={{ border: `1px solid ${colors.border}`, background: colors.bgCard }}>
          {/* Header */}
          <div className="flex items-center" style={{ borderBottom: `1px solid ${colors.border}`, background: "rgba(255,255,255,0.02)" }}>
            <div className="flex-1 min-w-0 px-[12px] py-[8px]">
              <span style={{ fontSize: 10, fontWeight: 700, color: colors.textDim, textTransform: "uppercase", letterSpacing: "0.07em" }}>Name</span>
            </div>
            <div className="shrink-0 px-[8px] py-[8px]" style={{ width: 80 }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: colors.textDim, textTransform: "uppercase", letterSpacing: "0.07em" }}>Owner</span>
            </div>
            <div className="shrink-0 px-[8px] py-[8px]" style={{ width: 100 }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: colors.textDim, textTransform: "uppercase", letterSpacing: "0.07em" }}>Overall status</span>
            </div>
            <div className="shrink-0 px-[8px] py-[8px]" style={{ width: 80 }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: colors.textDim, textTransform: "uppercase", letterSpacing: "0.07em" }}>Renew by</span>
            </div>
            <div className="shrink-0" style={{ width: 40 }} />
          </div>
          {sorted.map((ev, i) => {
            const sc = EV_COLOR[ev.status] ?? colors.textDim;
            const isMenuOpen = menuOpenId === ev.id;
            return (
              <div key={ev.id}
                role="button"
                tabIndex={0}
                className="flex items-center cursor-pointer select-none relative"
                style={{
                  borderBottom: i < sorted.length - 1 ? `1px solid ${colors.border}` : "none",
                  background: ev.status === "overdue" ? `${colors.critical}06` : "transparent",
                  outline: "none",
                }}
                onClick={() => navigate(`/compliance/${frameworkId}/documents/${ev.id}`)}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") navigate(`/compliance/${frameworkId}/documents/${ev.id}`); }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = ev.status === "overdue" ? `${colors.critical}0e` : "rgba(255,255,255,0.02)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = ev.status === "overdue" ? `${colors.critical}06` : "transparent"; }}
              >
                <div className="flex-1 min-w-0 px-[12px] py-[10px]">
                  <p style={{ fontSize: 12, fontWeight: 600, color: colors.textPrimary }} className="truncate">{ev.name}</p>
                  <p style={{ fontSize: 10, color: colors.textDim, marginTop: 1 }} className="truncate">{ev.control}</p>
                </div>
                <div className="shrink-0 px-[8px] py-[10px]" style={{ width: 80 }}>
                  <span style={{ fontSize: 11, color: colors.textMuted }} className="truncate block">{ev.collector}</span>
                </div>
                <div className="shrink-0 px-[8px] py-[10px]" style={{ width: 100 }}>
                  <span className="flex items-center gap-[5px] px-[6px] py-[2px] rounded-[5px] w-fit text-[10px] font-semibold capitalize"
                    style={{ background: `${sc}14`, color: sc, border: `1px solid ${sc}28` }}>
                    {ev.status === "collected" ? <CheckCircle2 size={10} color={sc} /> : ev.status === "overdue" ? <XCircle size={10} color={sc} /> : <Clock size={10} color={sc} />}
                    {ev.status}
                  </span>
                </div>
                <div className="shrink-0 px-[8px] py-[10px]" style={{ width: 80 }}>
                  <span style={{ fontSize: 11, color: ev.status === "overdue" ? colors.critical : colors.textMuted }}>
                    {ev.dueDate || "—"}
                  </span>
                </div>
                <div className="shrink-0 px-[8px] py-[10px]" style={{ width: 40 }}>
                  <button
                    onClick={(e) => { e.stopPropagation(); setMenuOpenId(isMenuOpen ? null : ev.id); }}
                    className="flex items-center justify-center size-[24px] rounded-[5px] cursor-pointer"
                    style={{ background: "transparent", color: colors.textDim, border: "1px solid transparent" }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.07)"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
                  >
                    <MoreHorizontal size={12} />
                  </button>
                  {isMenuOpen && (
                    <div className="absolute right-[12px] top-[32px] z-[20] rounded-[8px] overflow-hidden"
                      style={{ background: "#1a2332", border: `1px solid ${colors.border}`, boxShadow: "0 8px 24px rgba(0,0,0,0.4)", minWidth: 150 }}>
                      {[
                        { label: "View details", action: () => navigate(`/compliance/${frameworkId}/documents/${ev.id}`) },
                        { label: "Manage access", action: () => {} },
                      ].map((item, idx) => (
                        <button key={idx}
                          onClick={(e) => { e.stopPropagation(); item.action(); setMenuOpenId(null); }}
                          className="w-full flex items-center gap-[8px] px-[12px] py-[9px] text-left cursor-pointer text-[11px]"
                          style={{ background: "none", border: "none", color: colors.textMuted }}
                          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.06)"; }}
                          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "none"; }}>
                          {item.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
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

type TabId = "overview" | "controls" | "policies" | "documents" | "audit";

const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: "overview",  label: "Overview",  icon: <Info          size={12} /> },
  { id: "controls",  label: "Controls",  icon: <ClipboardList size={12} /> },
  { id: "policies",  label: "Policies",  icon: <FileText      size={12} /> },
  { id: "documents", label: "Documents", icon: <FolderOpen    size={12} /> },
  { id: "audit",     label: "Audit",     icon: <ClipboardCheck size={12} /> },
];

export default function ComplianceFrameworkPage() {
  const { frameworkId } = useParams<{ frameworkId: string }>();
  const navigate        = useNavigate();
  const { openWithContext, setPageContext, open } = useAiBox();
  const [searchParams, setSearchParams] = useSearchParams();

  const activeTab = (searchParams.get("tab") as TabId | null) ?? "overview";

  const [drawerControlId, setDrawerControlId] = useState<string | null>(null);
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

  const drawerControl = controls.find(c => c.id === drawerControlId) ?? null;

  // Auto-update AIBox context when framework or tab changes
  React.useEffect(() => {
    if (!framework) return;
    const tabCtx: Record<string, { sublabel: string; suggestions: { label: string; prompt: string }[] }> = {
      overview:  {
        sublabel: "Framework Overview",
        suggestions: [
          { label: "Summarise this framework for me", prompt: `Give me a concise executive summary of ${framework.name}: what it covers, who it applies to, and what the key compliance obligations are.` },
          { label: "How do we get to 95% readiness?", prompt: `What specific actions would bring ${framework.name} compliance from ${framework.score}% to 95%? List by priority.` },
          { label: "What should I focus on first?", prompt: `Looking at our ${framework.name} posture — score ${framework.score}%, ${framework.failing} failing controls — what should the team focus on this week?` },
        ],
      },
      controls:  {
        sublabel: "Controls",
        suggestions: [
          { label: "Which controls need urgent attention?", prompt: `Which ${framework.name} controls are failing or in-progress and have the highest audit risk? List them with recommended actions.` },
          { label: "Show me the remediation plan", prompt: `Give me a prioritised remediation plan for all failing controls in ${framework.name}.` },
          { label: "What evidence is missing?", prompt: `Which evidence items are missing or overdue for ${framework.name} controls? Who should collect them?` },
        ],
      },
      policies:  {
        sublabel: "Policies",
        suggestions: [
          { label: "Which policies need renewal?", prompt: `List all ${framework.name} policies that are expired or under review and explain what action is needed for each.` },
          { label: "What policies are missing?", prompt: `Based on ${framework.name} requirements, are there any policy gaps we should address?` },
        ],
      },
      documents: {
        sublabel: "Documents & Evidence",
        suggestions: [
          { label: "What evidence is overdue?", prompt: `Which evidence documents for ${framework.name} are overdue or pending? Who owns them and what are the deadlines?` },
          { label: "How do I collect this evidence?", prompt: `Walk me through how to collect the missing evidence for ${framework.name} before the next audit.` },
        ],
      },
      audit:     {
        sublabel: "Audit Readiness",
        suggestions: [
          { label: "Audit readiness briefing", prompt: `Give me an audit readiness briefing for ${framework.name}. What needs to be done in the next 30 days?` },
          { label: "What will auditors ask about?", prompt: `What are the most common auditor questions for a ${framework.name} audit and how should we prepare?` },
        ],
      },
    };
    const ctx = tabCtx[activeTab] ?? tabCtx["overview"];
    setPageContext({
      type: "general",
      label: framework.name,
      sublabel: ctx.sublabel,
      contextKey: `compliance-framework-${framework.id}-${activeTab}`,
      suggestions: ctx.suggestions,
      greeting: `${framework.name} is at ${framework.score}%${parseInt(framework.trend) !== 0 ? ` (${framework.trend} trending)` : ""}. ${framework.failing} control${(framework.failing as number) !== 1 ? "s" : ""} failing, ${gaps.length} open gap${gaps.length !== 1 ? "s" : ""}. You're on the ${ctx.sublabel} tab — what would you like to work on?`,
    });
    open();
  }, [framework?.id, activeTab]);

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
    setDrawerControlId(prev => prev === ctrl.id ? null : ctrl.id);
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
                  if (tab.id !== "controls") setDrawerControlId(null);
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
            <div className="flex flex-1 min-w-0" style={{ minHeight: 0 }}>
              {/* Inline drawer — left column */}
              {drawerControl && (
                <ControlDrawer
                  ctrl={drawerControl}
                  frameworkId={framework.id}
                  frameworkName={framework.name}
                  onClose={() => setDrawerControlId(null)}
                  onAskAI={handleRemediateControl}
                  onStatusChange={(s) => setCtrlStatus(drawerControl.id, s)}
                />
              )}
              {/* Table — right column */}
              <div className="flex-1 min-w-0 overflow-y-auto">
              {/* Controls table */}
              <div>

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
                                isSelected={drawerControlId === ctrl.id}
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

              </div>
            </div>
          );
        })()}

        {/* Overview tab */}
        {activeTab === "overview" && (
          <OverviewTab framework={framework} controls={controls} gaps={gaps} />
        )}

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
