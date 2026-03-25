import React, { useState } from "react";
import { useParams, useNavigate } from "react-router";
import {
  ArrowLeft, CheckCircle2, XCircle, AlertCircle, Clock,
  FileText, Sparkles, AlertTriangle, Calendar, TrendingDown,
  ChevronRight, X, BookmarkPlus, BookmarkCheck, ListChecks, Shield,
} from "lucide-react";
import { colors } from "../shared/design-system/tokens";
import { PageHeader } from "../shared/components/ui";
import { useAiBox } from "../features/ai-box";
import {
  FRAMEWORKS, FRAMEWORK_CONTROLS, GAPS, EVIDENCE_ITEMS, UPCOMING_AUDITS,
  type FrameworkControl, type ControlStatus, type EvidenceStatus,
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
   CONTROL ROW  (clickable, highlights when selected)
   ================================================================ */

function ControlRow({
  ctrl, isSelected, onSelect,
}: {
  ctrl: FrameworkControl;
  isSelected: boolean;
  onSelect: (ctrl: FrameworkControl) => void;
}) {
  const isFailingOrGap = ctrl.status === "failing";
  const statusColor    = CONTROL_STATUS_COLOR[ctrl.status];

  return (
    <button
      onClick={() => onSelect(ctrl)}
      className="w-full flex items-start gap-[12px] px-[14px] py-[11px] rounded-[8px] text-left cursor-pointer transition-all"
      style={{
        background: isSelected
          ? `${statusColor}14`
          : isFailingOrGap ? `${colors.critical}07` : "transparent",
        border: `1px solid ${isSelected ? statusColor + "55" : isFailingOrGap ? colors.critical + "28" : colors.border}`,
        marginBottom: 4,
        outline: "none",
      }}
      onMouseEnter={(e) => {
        if (!isSelected) (e.currentTarget as HTMLButtonElement).style.borderColor = statusColor + "44";
      }}
      onMouseLeave={(e) => {
        if (!isSelected) (e.currentTarget as HTMLButtonElement).style.borderColor =
          isFailingOrGap ? colors.critical + "28" : colors.border;
      }}
    >
      {/* Status icon */}
      <div className="shrink-0 mt-[2px]">{CONTROL_STATUS_ICON[ctrl.status]}</div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-[8px]">
          <div className="min-w-0">
            <span className="text-[11px] font-mono mr-[7px]" style={{ color: statusColor }}>
              {ctrl.id}
            </span>
            <span style={{ fontSize: 13, fontWeight: 600, color: colors.textPrimary }}>
              {ctrl.name}
            </span>
          </div>
          <ChevronRight size={13} color={colors.textDim} className="shrink-0 mt-[2px]" />
        </div>

        <p style={{ fontSize: 11, color: colors.textMuted, marginTop: 2, lineHeight: 1.45 }}>
          {ctrl.description}
        </p>

        <div className="flex items-center gap-[10px] mt-[6px] flex-wrap">
          {ctrl.lastTested && (
            <span style={{ fontSize: 10, color: colors.textDim }}>Last tested: {ctrl.lastTested}</span>
          )}
          {ctrl.gapId && (
            <span
              className="flex items-center gap-[4px] px-[6px] py-[1px] rounded-full text-[10px]"
              style={{ background: `${colors.critical}14`, color: colors.critical, border: `1px solid ${colors.critical}28` }}
            >
              <AlertTriangle size={9} />
              Open gap
            </span>
          )}
          {ctrl.status !== "passing" && ctrl.status !== "not-started" && (
            <span
              className="px-[6px] py-[1px] rounded-full text-[10px] font-medium capitalize"
              style={{
                background: `${statusColor}12`,
                color: statusColor,
                border: `1px solid ${statusColor}28`,
              }}
            >
              {ctrl.status}
            </span>
          )}
        </div>
      </div>
    </button>
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

  // Update follow-up state when ctrl changes
  React.useEffect(() => {
    setFollowedUp(getFollowUps().has(ctrl.id));
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
  evidence: typeof EVIDENCE_ITEMS;
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
   PAGE
   ================================================================ */

export default function ComplianceFrameworkPage() {
  const { frameworkId } = useParams<{ frameworkId: string }>();
  const navigate        = useNavigate();
  const { openWithContext } = useAiBox();

  const [selectedControlId, setSelectedControlId] = useState<string | null>(null);

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

  const evidence = EVIDENCE_ITEMS.filter(e => e.fwId === framework.id);
  const audit    = UPCOMING_AUDITS.find(a => a.fwId === framework.id);
  const gaps     = GAPS.filter(g => g.fwId === framework.id);

  const categories     = Array.from(new Set(controls.map(c => c.category)));
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
      {/* Page header */}
      <PageHeader
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

      {/* Back nav */}
      <div className="flex-none px-[32px] pt-[4px] pb-[8px]">
        <button
          onClick={() => navigate("/compliance")}
          className="flex items-center gap-[5px] text-[12px] cursor-pointer transition-colors"
          style={{ color: colors.textMuted }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = colors.textPrimary; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = colors.textMuted; }}
        >
          <ArrowLeft size={13} />
          All Frameworks
        </button>
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto px-[32px] pb-[32px]">

        {/* Score + stats strip */}
        <div
          className="flex items-center gap-[20px] p-[20px] rounded-[12px] mb-[24px] flex-wrap"
          style={{ background: colors.bgCard, border: `1px solid ${isTrendingDown ? colors.medium + "44" : colors.border}` }}
        >
          <div className="flex flex-col gap-[2px] min-w-[80px]">
            <span style={{ fontSize: 11, color: colors.textDim }}>Score</span>
            <div className="flex items-baseline gap-[6px]">
              <span style={{ fontSize: 28, fontWeight: 700, color: scoreColor, lineHeight: 1 }}>{framework.score}%</span>
              {trendNum !== 0 && (
                <span style={{ fontSize: 12, color: trendNum > 0 ? colors.success : colors.critical }}>
                  {trendNum > 0 ? "+" : ""}{framework.trend}
                  {isTrendingDown && <TrendingDown size={11} style={{ display: "inline", marginLeft: 3 }} />}
                </span>
              )}
            </div>
          </div>

          <div style={{ width: 1, height: 40, background: colors.border }} />

          {[
            { label: "Total controls", value: framework.controls,   color: colors.textPrimary },
            { label: "Passing",        value: framework.passing,    color: colors.success     },
            { label: "In progress",    value: framework.inProgress, color: colors.medium      },
            { label: "Failing",        value: framework.failing,    color: colors.critical    },
            { label: "Open gaps",      value: gaps.length,          color: gaps.length > 0 ? colors.critical : colors.success },
          ].map(s => (
            <div key={s.label} className="flex flex-col gap-[2px]">
              <span style={{ fontSize: 11, color: colors.textDim }}>{s.label}</span>
              <span style={{ fontSize: 20, fontWeight: 700, color: s.color, lineHeight: 1 }}>{s.value}</span>
            </div>
          ))}

          {audit && (
            <>
              <div style={{ width: 1, height: 40, background: colors.border }} className="ml-auto" />
              <div className="flex flex-col gap-[2px]">
                <span style={{ fontSize: 11, color: colors.textDim }}>Next audit</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: audit.color }}>{audit.date}</span>
                <span style={{ fontSize: 10, color: audit.readiness < 80 ? colors.critical : colors.textMuted }}>
                  Readiness {audit.readiness}%{audit.readiness < 80 ? " — at risk" : ""}
                </span>
              </div>
            </>
          )}
        </div>

        {/* Two-column layout */}
        <div className="flex gap-[20px] items-start">

          {/* LEFT — controls by category */}
          <div className="flex-1 min-w-0 flex flex-col gap-[20px]">
            <p style={{ fontSize: 12, fontWeight: 700, color: colors.textDim, letterSpacing: "0.08em", textTransform: "uppercase" }}>
              Controls ({controls.length})
            </p>

            {categories.map(cat => {
              const catControls = controls.filter(c => c.category === cat);
              const failCount   = catControls.filter(c => c.status === "failing").length;
              return (
                <div key={cat} className="flex flex-col gap-[2px]">
                  <div className="flex items-center gap-[8px] mb-[6px]">
                    <span style={{ fontSize: 11, fontWeight: 700, color: failCount > 0 ? colors.critical : colors.textMuted }}>
                      {cat}
                    </span>
                    {failCount > 0 && (
                      <span
                        className="px-[6px] py-[1px] rounded-full text-[9px] font-bold"
                        style={{ background: `${colors.critical}18`, color: colors.critical, border: `1px solid ${colors.critical}28` }}
                      >
                        {failCount} failing
                      </span>
                    )}
                  </div>
                  {catControls.map(ctrl => (
                    <ControlRow
                      key={ctrl.id}
                      ctrl={ctrl}
                      isSelected={selectedControlId === ctrl.id}
                      onSelect={handleSelectControl}
                    />
                  ))}
                </div>
              );
            })}
          </div>

          {/* RIGHT — detail panel or default sidebar */}
          <div className="w-[300px] shrink-0" style={{ position: "sticky", top: 0 }}>
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
      </div>
    </div>
  );
}
