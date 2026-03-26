import { useEffect } from "react";
import { useNavigate } from "react-router";
import { Shield, Sparkles, ArrowRight, AlertTriangle, Calendar } from "lucide-react";
import { colors } from "../shared/design-system/tokens";
import { PageHeader } from "../shared/components/ui";
import { useAiBox } from "../features/ai-box";
import { FRAMEWORKS, GAPS, UPCOMING_AUDITS } from "./compliance-data";
import { getPathsForGap, getAssetsForGap } from "../shared/entity-graph";

/* ================================================================
   AIBOX CONTEXT
   All richness preserved — just the UI is simplified.
   ================================================================ */

function buildPageContext() {
  const totalPathsExposed = new Set(
    GAPS.flatMap(g => getPathsForGap(g.id).map(p => p.pathId))
  ).size;
  const totalAssetsAffected = new Set(
    GAPS.flatMap(g => getAssetsForGap(g.id).map(a => a.assetId))
  ).size;

  return {
    type: "general" as const,
    label: "Compliance",
    sublabel: "Posture Overview",
    contextKey: "compliance",
    suggestions: [
      { label: "What should I focus on today?",               prompt: "Given the current compliance posture, what should I prioritize today?" },
      { label: "ISO 27001 audit prep briefing",               prompt: "Give me a readiness briefing for the ISO 27001 surveillance audit in 56 days — what needs to happen before then?" },
      { label: "Fix the critical gaps first",                 prompt: "Walk me through a remediation plan for the 2 critical compliance gaps (AC-2 and CC6.1)" },
      { label: "Which evidence is overdue?",                  prompt: "Which evidence items are overdue or at risk before upcoming audits, and who owns them?" },
      { label: "How do these gaps affect our attack surface?",prompt: "How do the open compliance gaps worsen our attack paths and blast radius?" },
      { label: "Generate a compliance summary report",        prompt: "Generate a compliance summary report across all active frameworks suitable for a leadership review" },
      { label: "What changed this week?",                     prompt: "What compliance changes, policy updates, or new gaps appeared this week?" },
    ],
    greeting: `Compliance overview loaded. ISO 27001 audit is in 56 days with readiness at 72% — that's your most time-sensitive issue. 2 critical gaps (AC-2, CC6.1) are worsening ${totalPathsExposed} attack path${totalPathsExposed !== 1 ? "s" : ""} affecting ${totalAssetsAffected} asset${totalAssetsAffected !== 1 ? "s" : ""}. Want me to walk you through the highest priorities?`,
    graphContext: {
      totalPathsExposed,
      totalAssetsAffected,
      criticalGaps: GAPS.filter(g => g.severity === "critical").map(g => ({
        id: g.id, control: g.control, title: g.title,
        affectedPaths: getPathsForGap(g.id).map(p => p.name),
        affectedAssets: getAssetsForGap(g.id).map(a => a.name),
      })),
    },
  };
}

/* ================================================================
   FRAMEWORK CARD
   ================================================================ */

function FrameworkCard({ fw }: { fw: typeof FRAMEWORKS[number] }) {
  const navigate         = useNavigate();
  const trendNum         = parseInt(fw.trend);
  const isTrendingDown   = trendNum < 0;
  const scoreColor       = fw.score >= 90 ? colors.success : fw.score >= 80 ? colors.medium : colors.critical;
  const audit            = UPCOMING_AUDITS.find(a => a.fwId === fw.id);
  const criticalGapCount = GAPS.filter(g => g.fwId === fw.id && g.severity === "critical").length;
  const hasCritical      = criticalGapCount > 0;
  const hasAuditRisk     = audit && audit.readiness < 80;

  const borderColor = hasCritical
    ? `${colors.critical}33`
    : hasAuditRisk
    ? `${colors.medium}40`
    : isTrendingDown
    ? `${colors.medium}28`
    : colors.border;

  return (
    <div
      className="flex flex-col gap-[12px] p-[18px] rounded-[12px] cursor-pointer transition-all"
      onClick={() => navigate(`/compliance/${fw.id}`)}
      onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = colors.primary + "55"; }}
      onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = borderColor; }}
      style={{ background: colors.bgCard, border: `1px solid ${borderColor}` }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-[8px]">
        <div className="flex-1 min-w-0">
          <p style={{ fontSize: 13, fontWeight: 600, color: colors.textPrimary }}>{fw.name}</p>
          <p style={{ fontSize: 11, color: colors.textMuted, marginTop: 2 }}>
            {fw.controls} controls ·{" "}
            <span style={{ color: fw.failing > 0 ? colors.critical : colors.textMuted }}>
              {fw.failing} failing
            </span>
          </p>
        </div>
        <div className="flex items-center gap-[8px] shrink-0">
          <div className="text-right">
            <p style={{ fontSize: 22, fontWeight: 700, color: scoreColor, lineHeight: 1 }}>
              {fw.score}%
            </p>
            {trendNum !== 0 && (
              <p style={{ fontSize: 10, color: trendNum > 0 ? colors.success : colors.critical, marginTop: 2 }}>
                {trendNum > 0 ? "+" : ""}{fw.trend}
              </p>
            )}
          </div>
          <ArrowRight size={13} color={colors.textDim} />
        </div>
      </div>

      {/* Progress bar */}
      <div
        className="flex h-[4px] rounded-full overflow-hidden w-full"
        style={{ background: "rgba(255,255,255,0.06)" }}
      >
        <div style={{ width: `${(fw.passing    / fw.controls) * 100}%`, background: colors.success  }} />
        <div style={{ width: `${(fw.inProgress / fw.controls) * 100}%`, background: colors.medium   }} />
        <div style={{ width: `${(fw.failing    / fw.controls) * 100}%`, background: colors.critical }} />
      </div>

      {/* Counts */}
      <div className="flex gap-[14px]">
        <span style={{ fontSize: 10, color: colors.success  }}>{fw.passing}    passing</span>
        <span style={{ fontSize: 10, color: colors.medium   }}>{fw.inProgress} in progress</span>
        <span style={{ fontSize: 10, color: fw.failing > 0 ? colors.critical : colors.textDim }}>
          {fw.failing} failing
        </span>
      </div>

      {/* Audit + gap indicators — only shown when there's something to surface */}
      {(audit || hasCritical) && (
        <div
          className="flex items-center gap-[12px] flex-wrap pt-[8px]"
          style={{ borderTop: `1px solid ${colors.border}` }}
        >
          {audit && (
            <span
              className="flex items-center gap-[4px] text-[10px]"
              style={{ color: hasAuditRisk ? colors.medium : colors.textDim }}
            >
              <Calendar size={9} />
              Audit in {audit.daysUntil}d
              {hasAuditRisk && (
                <span style={{ color: colors.medium, fontWeight: 600 }}> · {audit.readiness}% ready</span>
              )}
            </span>
          )}
          {hasCritical && (
            <span
              className="flex items-center gap-[4px] text-[10px]"
              style={{ color: colors.critical }}
            >
              <AlertTriangle size={9} />
              {criticalGapCount} critical gap{criticalGapCount > 1 ? "s" : ""}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

/* ================================================================
   PAGE
   ================================================================ */

export default function CompliancePage() {
  const { setPageContext, openWithContext } = useAiBox();

  useEffect(() => {
    setPageContext(buildPageContext());
  }, [setPageContext]);

  const avgScore    = Math.round(FRAMEWORKS.reduce((s, f) => s + f.score, 0) / FRAMEWORKS.length);
  const openGaps    = GAPS.length;
  const criticalGaps = GAPS.filter(g => g.severity === "critical").length;
  const nextAudit   = [...UPCOMING_AUDITS].sort((a, b) => a.daysUntil - b.daysUntil)[0];
  const scoreColor  = avgScore >= 90 ? colors.success : avgScore >= 80 ? colors.medium : colors.critical;

  function handleAskAI() {
    openWithContext(buildPageContext());
  }

  return (
    <div className="flex-1 flex flex-col overflow-y-auto" style={{ backgroundColor: colors.bgApp }}>

      {/* Page header */}
      <div
        className="flex-none px-[32px] pt-[24px] pb-[20px]"
        style={{ borderBottom: `1px solid ${colors.border}` }}
      >
        <PageHeader
          icon={<Shield size={18} style={{ color: colors.accent }} />}
          title="Compliance"
          subtitle="Certification posture across all active frameworks"
          actions={
            <button
              onClick={handleAskAI}
              className="flex items-center gap-[6px] px-[14px] py-[7px] rounded-[8px] text-[12px] font-semibold cursor-pointer transition-colors"
              style={{ background: `${colors.primary}18`, color: colors.primary, border: `1px solid ${colors.primary}28` }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = `${colors.primary}28`; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = `${colors.primary}18`; }}
            >
              <Sparkles size={12} />
              Ask AI
            </button>
          }
        />
      </div>

      {/* Summary strip — three pills */}
      <div className="flex-none px-[32px] pt-[20px]">
        <div className="flex items-center gap-[8px] flex-wrap">

          {/* Avg score */}
          <div
            className="flex items-center gap-[8px] px-[14px] py-[9px] rounded-[8px]"
            style={{ background: colors.bgCard, border: `1px solid ${colors.border}` }}
          >
            <span style={{ fontSize: 10, color: colors.textDim }}>Avg score</span>
            <span style={{ fontSize: 16, fontWeight: 700, color: scoreColor, lineHeight: 1 }}>{avgScore}%</span>
            <span style={{ fontSize: 10, color: colors.textDim }}>across {FRAMEWORKS.length} frameworks</span>
          </div>

          {/* Open gaps */}
          <div
            className="flex items-center gap-[8px] px-[14px] py-[9px] rounded-[8px]"
            style={{
              background: criticalGaps > 0 ? `${colors.critical}0d` : colors.bgCard,
              border: `1px solid ${criticalGaps > 0 ? colors.critical + "28" : colors.border}`,
            }}
          >
            <AlertTriangle size={11} color={criticalGaps > 0 ? colors.critical : colors.textDim} />
            <span style={{ fontSize: 16, fontWeight: 700, color: criticalGaps > 0 ? colors.critical : colors.textPrimary, lineHeight: 1 }}>
              {openGaps}
            </span>
            <span style={{ fontSize: 10, color: colors.textDim }}>
              open gaps
              {criticalGaps > 0 && (
                <span style={{ color: colors.critical, fontWeight: 600 }}> · {criticalGaps} critical</span>
              )}
            </span>
          </div>

          {/* Next audit */}
          {nextAudit && (
            <div
              className="flex items-center gap-[8px] px-[14px] py-[9px] rounded-[8px]"
              style={{
                background: nextAudit.daysUntil <= 60 ? `${colors.medium}0d` : colors.bgCard,
                border: `1px solid ${nextAudit.daysUntil <= 60 ? colors.medium + "28" : colors.border}`,
              }}
            >
              <Calendar size={11} color={nextAudit.daysUntil <= 60 ? colors.medium : colors.textDim} />
              <span style={{ fontSize: 16, fontWeight: 700, color: nextAudit.daysUntil <= 60 ? colors.medium : colors.textPrimary, lineHeight: 1 }}>
                {nextAudit.daysUntil}d
              </span>
              <span style={{ fontSize: 10, color: colors.textDim }}>
                {nextAudit.framework} audit
                {nextAudit.readiness < 80 && (
                  <span style={{ color: colors.medium, fontWeight: 600 }}> · {nextAudit.readiness}% ready</span>
                )}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Framework grid */}
      <div className="flex-1 px-[32px] py-[24px]">
        <p
          style={{
            fontSize: 10, fontWeight: 700, color: colors.textDim,
            letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 14,
          }}
        >
          Frameworks · {FRAMEWORKS.length}
        </p>
        <div
          className="grid gap-[12px]"
          style={{ gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))" }}
        >
          {FRAMEWORKS.map(fw => <FrameworkCard key={fw.id} fw={fw} />)}
        </div>
      </div>
    </div>
  );
}
