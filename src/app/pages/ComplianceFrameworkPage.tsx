import React from "react";
import { useParams, useNavigate } from "react-router";
import {
  ArrowLeft, CheckCircle2, XCircle, AlertCircle, Clock,
  FileText, Sparkles, AlertTriangle, Calendar, TrendingDown,
} from "lucide-react";
import { colors } from "../shared/design-system/tokens";
import { PageHeader } from "../shared/components/ui";
import { useAiBox } from "../features/ai-box";
import {
  FRAMEWORKS, FRAMEWORK_CONTROLS, GAPS, EVIDENCE_ITEMS, UPCOMING_AUDITS,
  type FrameworkControl, type ControlStatus, type EvidenceStatus,
} from "./compliance-data";

/* ================================================================
   HELPERS
   ================================================================ */

const CONTROL_STATUS_COLOR: Record<ControlStatus, string> = {
  passing:     colors.success,
  failing:     colors.critical,
  "in-progress": colors.medium,
  "not-started": colors.textDim,
};

const CONTROL_STATUS_ICON: Record<ControlStatus, React.ReactNode> = {
  passing:     <CheckCircle2 size={13} color={colors.success}   />,
  failing:     <XCircle      size={13} color={colors.critical}  />,
  "in-progress": <AlertCircle size={13} color={colors.medium}   />,
  "not-started": <Clock      size={13} color={colors.textDim}   />,
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
   CONTROL ROW
   ================================================================ */

function ControlRow({ ctrl, onAskAI }: { ctrl: FrameworkControl; onAskAI: (ctrl: FrameworkControl) => void }) {
  const isFailingOrGap = ctrl.status === "failing";

  return (
    <div
      className="flex items-start gap-[12px] px-[14px] py-[12px] rounded-[8px]"
      style={{
        background: isFailingOrGap ? `${colors.critical}08` : "transparent",
        border: `1px solid ${isFailingOrGap ? colors.critical + "28" : colors.border}`,
        marginBottom: 4,
      }}
    >
      {/* Status icon */}
      <div className="shrink-0 mt-[2px]">{CONTROL_STATUS_ICON[ctrl.status]}</div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-[8px]">
          <div className="min-w-0">
            <span
              className="text-[11px] font-mono mr-[8px]"
              style={{ color: CONTROL_STATUS_COLOR[ctrl.status] }}
            >
              {ctrl.id}
            </span>
            <span style={{ fontSize: 13, fontWeight: 600, color: colors.textPrimary }}>
              {ctrl.name}
            </span>
          </div>
          <span
            className="shrink-0 px-[7px] py-[2px] rounded-full text-[10px] font-medium capitalize"
            style={{
              background: `${CONTROL_STATUS_COLOR[ctrl.status]}15`,
              color: CONTROL_STATUS_COLOR[ctrl.status],
              border: `1px solid ${CONTROL_STATUS_COLOR[ctrl.status]}28`,
            }}
          >
            {ctrl.status}
          </span>
        </div>

        <p style={{ fontSize: 12, color: colors.textMuted, marginTop: 3, lineHeight: 1.5 }}>
          {ctrl.description}
        </p>

        <div className="flex items-center gap-[12px] mt-[8px] flex-wrap">
          {ctrl.lastTested && (
            <span style={{ fontSize: 10, color: colors.textDim }}>
              Last tested: {ctrl.lastTested}
            </span>
          )}
          {ctrl.gapId && (
            <span
              className="flex items-center gap-[4px] px-[7px] py-[2px] rounded-full text-[10px]"
              style={{ background: `${colors.critical}14`, color: colors.critical, border: `1px solid ${colors.critical}28` }}
            >
              <AlertTriangle size={9} />
              Open gap
            </span>
          )}
          {ctrl.evidenceIds && ctrl.evidenceIds.length > 0 && (
            <span
              className="flex items-center gap-[4px] px-[7px] py-[2px] rounded-full text-[10px]"
              style={{ background: `${colors.accent}14`, color: colors.accent, border: `1px solid ${colors.accent}28` }}
            >
              <FileText size={9} />
              {ctrl.evidenceIds.length} evidence item{ctrl.evidenceIds.length !== 1 ? "s" : ""}
            </span>
          )}
          {ctrl.status === "failing" && (
            <button
              onClick={() => onAskAI(ctrl)}
              className="flex items-center gap-[4px] px-[8px] py-[3px] rounded-full text-[10px] font-medium cursor-pointer transition-colors"
              style={{ background: `${colors.primary}18`, color: colors.primary, border: `1px solid ${colors.primary}2a` }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = `${colors.primary}28`; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = `${colors.primary}18`; }}
            >
              <Sparkles size={9} />
              Remediate
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ================================================================
   EVIDENCE ROW
   ================================================================ */

function EvidenceRow({ ev }: { ev: typeof EVIDENCE_ITEMS[number] }) {
  const isOverdue = ev.status === "overdue";
  return (
    <div
      className="flex items-center gap-[12px] px-[14px] py-[10px] rounded-[8px]"
      style={{
        background: isOverdue ? `${colors.critical}08` : "transparent",
        border: `1px solid ${isOverdue ? colors.critical + "28" : colors.border}`,
        marginBottom: 4,
      }}
    >
      <FileText size={13} color={EVIDENCE_STATUS_COLOR[ev.status]} />
      <div className="flex-1 min-w-0">
        <p style={{ fontSize: 12, fontWeight: 600, color: colors.textPrimary }}>{ev.name}</p>
        <p style={{ fontSize: 10, color: colors.textMuted, marginTop: 1 }}>
          {ev.control} · {ev.collector} · Due {ev.dueDate}
        </p>
      </div>
      <span
        className="shrink-0 px-[7px] py-[2px] rounded-full text-[10px] font-medium capitalize"
        style={{
          background: `${EVIDENCE_STATUS_COLOR[ev.status]}15`,
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
   PAGE
   ================================================================ */

export default function ComplianceFrameworkPage() {
  const { frameworkId } = useParams<{ frameworkId: string }>();
  const navigate = useNavigate();
  const { openWithContext } = useAiBox();

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

  // Group controls by category, maintaining sort order within each group
  const categories = Array.from(new Set(controls.map(c => c.category)));

  const scoreColor = framework.score >= 90 ? colors.success : framework.score >= 80 ? colors.medium : colors.critical;
  const trendNum   = parseInt(framework.trend);
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
        { label: "Give me a step-by-step remediation plan", prompt: `Give me a detailed, step-by-step remediation plan for control ${ctrl.id}: ${ctrl.name} in ${framework!.name}.` },
        { label: "Who owns this and what do they need?",    prompt: `Who is responsible for remediating ${ctrl.id} and what do they need to fix it?` },
        { label: "What evidence is required?",              prompt: `What evidence needs to be collected to close the gap on ${ctrl.id} in ${framework!.name}?` },
      ],
      greeting: gap
        ? `Control ${ctrl.id} (${ctrl.name}) is failing. The open gap "${gap.title}" has been open for ${gap.daysOpen} days and is owned by ${gap.owner}. Where would you like to start?`
        : `Control ${ctrl.id} (${ctrl.name}) is failing. Let me help you build a remediation plan.`,
    });
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
          {/* Score */}
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

          {/* Stat row */}
          {[
            { label: "Total controls", value: framework.controls,    color: colors.textPrimary },
            { label: "Passing",        value: framework.passing,     color: colors.success     },
            { label: "In progress",    value: framework.inProgress,  color: colors.medium      },
            { label: "Failing",        value: framework.failing,     color: colors.critical    },
            { label: "Open gaps",      value: gaps.length,           color: gaps.length > 0 ? colors.critical : colors.success },
          ].map(s => (
            <div key={s.label} className="flex flex-col gap-[2px]">
              <span style={{ fontSize: 11, color: colors.textDim }}>{s.label}</span>
              <span style={{ fontSize: 20, fontWeight: 700, color: s.color, lineHeight: 1 }}>{s.value}</span>
            </div>
          ))}

          {/* Audit card (if any) */}
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

        {/* Two columns */}
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
                  {/* Category header */}
                  <div className="flex items-center gap-[8px] mb-[8px]">
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
                    <ControlRow key={ctrl.id} ctrl={ctrl} onAskAI={handleRemediateControl} />
                  ))}
                </div>
              );
            })}
          </div>

          {/* RIGHT — evidence + audit detail */}
          <div className="w-[300px] shrink-0 flex flex-col gap-[16px]">

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
                style={{
                  background: colors.bgCard,
                  border: `1px solid ${audit.readiness < 80 ? colors.medium + "44" : colors.border}`,
                }}
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

                {/* Readiness bar */}
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

                {/* Key risks */}
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

            {/* Open gaps for this framework */}
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
                    <p style={{ fontSize: 10, color: colors.textMuted }}>
                      {gap.daysOpen}d open · {gap.owner}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
