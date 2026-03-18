import React, { useEffect } from "react";
import { useNavigate } from "react-router";
import { AlertTriangle, Clock, TrendingUp, Shield, FileText, GitBranch, Server, Sparkles } from "lucide-react";
import { colors } from "../shared/design-system/tokens";
import { PageHeader, SectionLabel } from "../shared/components/ui";
import { useAiBox } from "../features/ai-box";
import {
  getPathsForGap,
  getAssetsForGap,
  getBlastRadiusImpactForGap,
} from "../shared/entity-graph";

/* ================================================================
   DATA
   ================================================================ */

const FRAMEWORKS = [
  { id: "soc2", name: "SOC 2 Type II", controls: 64, passing: 58, failing: 4, inProgress: 2, score: 91, trend: "+3" },
  { id: "iso27001", name: "ISO 27001", controls: 114, passing: 99, failing: 8, inProgress: 7, score: 87, trend: "+1" },
  { id: "nist-csf", name: "NIST CSF", controls: 108, passing: 91, failing: 9, inProgress: 8, score: 84, trend: "-2" },
  { id: "pci-dss", name: "PCI-DSS v4.0", controls: 78, passing: 72, failing: 3, inProgress: 3, score: 92, trend: "+4" },
  { id: "hipaa", name: "HIPAA", controls: 45, passing: 40, failing: 2, inProgress: 3, score: 89, trend: "0" },
];

const GAPS = [
  { id: "g1", severity: "critical" as const, control: "AC-2", framework: "NIST CSF", title: "Privileged account lifecycle not enforced", daysOpen: 14, owner: "Identity Team" },
  { id: "g2", severity: "critical" as const, control: "CC6.1", framework: "SOC 2", title: "MFA not required on 12 service accounts", daysOpen: 8, owner: "Platform Engineering" },
  { id: "g3", severity: "high" as const, control: "A.9.4", framework: "ISO 27001", title: "Encryption key rotation policy not enforced", daysOpen: 22, owner: "Security Operations" },
  { id: "g4", severity: "high" as const, control: "Req 6.3", framework: "PCI-DSS", title: "Vulnerability scan overdue on cardholder segment", daysOpen: 5, owner: "Vulnerability Team" },
  { id: "g5", severity: "medium" as const, control: "PR.IP-1", framework: "NIST CSF", title: "Configuration baseline not documented for 3 asset classes", daysOpen: 31, owner: "Configuration Team" },
];

const RECENT_POLICY_CHANGES = [
  { id: "p1", date: "Mar 14", change: "Updated MFA policy to require FIDO2 for all admin accounts", impact: "high" as const },
  { id: "p2", date: "Mar 11", change: "Extended vulnerability SLA for medium severity from 30 to 45 days", impact: "medium" as const },
  { id: "p3", date: "Mar 09", change: "Added cardholder data scope to PCI-DSS quarterly review", impact: "high" as const },
];

/* ================================================================
   AIBOX CONTEXT
   ================================================================ */

function buildPageContext() {
  // Derive cross-entity summary for AIBox
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
      { label: "What changed since my last visit?", prompt: "What changed in compliance since my last visit?" },
      { label: "Show critical gaps", prompt: "Show me the critical compliance gaps that need immediate attention" },
      { label: "Which attack paths does CC6.1 worsen?", prompt: "Which attack paths are made worse by the MFA gap (CC6.1)?" },
      { label: "Remediation blast radius impact", prompt: "If we fix all open compliance gaps, how would it reduce attack path blast radius?" },
      { label: "Which assets are at risk from these gaps?", prompt: `There are ${totalAssetsAffected} assets affected by open compliance gaps. Which are the highest risk?` },
      { label: "Recommend remediation steps", prompt: "Recommend remediation steps for the open compliance gaps" },
      { label: "Recent policy changes", prompt: "What policy changes happened recently and what controls do they affect?" },
      { label: "Generate compliance report", prompt: "Generate a summary compliance report across all active frameworks" },
    ],
    greeting: `I'm monitoring compliance posture across your active frameworks. 2 critical gaps are worsening ${totalPathsExposed} attack paths affecting ${totalAssetsAffected} assets — would you like to start there?`,
    // Graph context for AIBox reasoning
    graphContext: {
      totalPathsExposed,
      totalAssetsAffected,
      criticalGaps: GAPS.filter(g => g.severity === "critical").map(g => ({
        id: g.id,
        control: g.control,
        title: g.title,
        affectedPaths: getPathsForGap(g.id).map(p => p.name),
        affectedAssets: getAssetsForGap(g.id).map(a => a.name),
      })),
    },
  };
}

/* ================================================================
   SEVERITY HELPERS
   ================================================================ */

type Severity = "critical" | "high" | "medium" | "low";

const SEVERITY_COLOR: Record<Severity, string> = {
  critical: colors.critical,
  high: colors.high,
  medium: colors.medium,
  low: colors.success,
};

const SEVERITY_BG: Record<Severity, string> = {
  critical: `${colors.critical}1f`,
  high: `${colors.high}1a`,
  medium: `${colors.medium}1a`,
  low: `${colors.success}1a`,
};

const PRIORITY_COLORS: Record<string, string> = {
  critical: colors.critical,
  high: colors.high,
  medium: colors.medium,
  low: colors.success,
};

/* ================================================================
   SUB-COMPONENTS
   ================================================================ */

function ScoreBadge({ score, trend }: { score: number; trend: string }) {
  const trendNum = parseInt(trend);
  return (
    <div className="flex items-center gap-[6px]">
      <span style={{ fontSize: 20, fontWeight: 700, color: score >= 90 ? colors.success : score >= 80 ? colors.medium : colors.critical }}>
        {score}%
      </span>
      {trendNum !== 0 && (
        <span style={{ fontSize: 11, color: trendNum > 0 ? colors.success : colors.critical }}>
          {trendNum > 0 ? "+" : ""}{trend}
        </span>
      )}
    </div>
  );
}

function FrameworkRow({ fw }: { fw: typeof FRAMEWORKS[number] }) {
  const passWidth = `${(fw.passing / fw.controls) * 100}%`;
  const failWidth = `${(fw.failing / fw.controls) * 100}%`;
  const inProgressWidth = `${(fw.inProgress / fw.controls) * 100}%`;
  return (
    <div
      className="flex flex-col gap-[10px] p-[16px] rounded-[10px]"
      style={{ background: colors.bgCard, border: `1px solid ${colors.border}` }}
    >
      <div className="flex items-start justify-between gap-[8px]">
        <div>
          <p style={{ fontSize: 13, fontWeight: 600, color: colors.textPrimary }}>{fw.name}</p>
          <p style={{ fontSize: 11, color: colors.textMuted, marginTop: 2 }}>{fw.controls} controls</p>
        </div>
        <ScoreBadge score={fw.score} trend={fw.trend} />
      </div>
      {/* Progress bar */}
      <div className="flex h-[5px] rounded-full overflow-hidden w-full" style={{ background: "rgba(255,255,255,0.06)" }}>
        <div style={{ width: passWidth, background: colors.success }} />
        <div style={{ width: inProgressWidth, background: colors.medium }} />
        <div style={{ width: failWidth, background: colors.critical }} />
      </div>
      <div className="flex gap-[14px]">
        <span style={{ fontSize: 10, color: colors.success }}>{fw.passing} passing</span>
        <span style={{ fontSize: 10, color: colors.medium }}>{fw.inProgress} in progress</span>
        <span style={{ fontSize: 10, color: colors.critical }}>{fw.failing} failing</span>
      </div>
    </div>
  );
}

/* ── Cross-entity relationship chips ── */

function EntityChip({
  label,
  color,
  onClick,
}: {
  label: string;
  color: string;
  onClick?: () => void;
}) {
  const [hovered, setHovered] = React.useState(false);
  return (
    <span
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={onClick ? (e) => e.key === "Enter" && onClick() : undefined}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "2px 8px",
        borderRadius: 999,
        fontSize: 10,
        fontWeight: 500,
        background: hovered && onClick ? `${color}28` : `${color}14`,
        color: color,
        border: `1px solid ${color}30`,
        cursor: onClick ? "pointer" : "default",
        transition: "background 0.12s ease",
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </span>
  );
}

function GapRow({ gap }: { gap: typeof GAPS[number] }) {
  const navigate = useNavigate();
  const { openWithContext } = useAiBox();
  const relatedPaths = getPathsForGap(gap.id);
  const affectedAssets = getAssetsForGap(gap.id);
  const blastImpact = getBlastRadiusImpactForGap(gap.id);

  function handleAskAI(e: React.MouseEvent) {
    e.stopPropagation();
    const pathNames = relatedPaths.map(p => p.name).join(", ");
    openWithContext({
      type: "general",
      label: gap.control,
      sublabel: `${gap.framework} Gap`,
      contextKey: `compliance-gap:${gap.id}`,
      greeting: `I have the **${gap.control}** compliance gap loaded (${gap.framework}). This is a **${gap.severity}** severity issue: "${gap.title}"${relatedPaths.length > 0 ? ` — it worsens ${relatedPaths.length} attack path${relatedPaths.length > 1 ? "s" : ""} (${pathNames})` : ""}. How can I help?`,
      suggestions: [
        { label: "Explain the impact of this gap", prompt: `Explain the impact of the ${gap.control} compliance gap: "${gap.title}"` },
        { label: "What attack paths does this worsen?", prompt: `Which attack paths are worsened by the ${gap.control} gap (${gap.framework})?` },
        { label: "Suggest remediation steps", prompt: `Suggest remediation steps for fixing the ${gap.control} gap: "${gap.title}"` },
        { label: "Estimate remediation effort", prompt: `Estimate the effort to fix the ${gap.control} gap and reduce its blast radius` },
      ],
    });
  }

  // Only show registered assets for navigation; blast-radius ones are display-only
  const registeredAssets = affectedAssets.filter(a => a.type === "registered");
  const blastAssets = affectedAssets.filter(a => a.type === "blast-radius");

  return (
    <div
      className="flex flex-col gap-[10px] p-[12px] rounded-[8px]"
      style={{ background: SEVERITY_BG[gap.severity], border: `1px solid ${SEVERITY_COLOR[gap.severity]}22` }}
    >
      {/* ── Main row ── */}
      <div className="flex items-start gap-[12px]">
        <div
          className="shrink-0 mt-[2px] px-[6px] py-[2px] rounded-[4px] text-[10px] font-semibold uppercase tracking-wide"
          style={{ background: SEVERITY_COLOR[gap.severity] + "22", color: SEVERITY_COLOR[gap.severity] }}
        >
          {gap.severity}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-[6px] flex-wrap">
            <span style={{ fontSize: 11, fontWeight: 600, color: colors.textPrimary }}>{gap.title}</span>
          </div>
          <div className="flex items-center gap-[10px] mt-[4px] flex-wrap">
            <span style={{ fontSize: 10, color: colors.textMuted }}>{gap.framework} · {gap.control}</span>
            <span style={{ fontSize: 10, color: colors.textDim }}>Open {gap.daysOpen}d</span>
            <span style={{ fontSize: 10, color: colors.textDim }}>Owner: {gap.owner}</span>
          </div>
        </div>
        <div className="shrink-0 flex items-center gap-[8px]">
          <div className="flex items-center gap-[4px]" style={{ color: colors.textDim }}>
            <Clock size={11} />
            <span style={{ fontSize: 10 }}>{gap.daysOpen}d</span>
          </div>
          <button
            onClick={handleAskAI}
            title={`Ask AI about ${gap.control}`}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
              padding: "2px 7px",
              borderRadius: 99,
              fontSize: 10,
              fontWeight: 600,
              background: `${SEVERITY_COLOR[gap.severity]}10`,
              color: SEVERITY_COLOR[gap.severity],
              border: `1px solid ${SEVERITY_COLOR[gap.severity]}2a`,
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            <Sparkles size={9} />
            Ask AI
          </button>
        </div>
      </div>

      {/* ── Cross-entity relationships ── */}
      {(relatedPaths.length > 0 || affectedAssets.length > 0) && (
        <div
          className="flex flex-col gap-[6px] pt-[8px]"
          style={{ borderTop: `1px solid ${SEVERITY_COLOR[gap.severity]}18` }}
        >
          {/* Related attack paths */}
          {relatedPaths.length > 0 && (
            <div className="flex items-center gap-[6px] flex-wrap">
              <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 10, color: colors.textDim, flexShrink: 0 }}>
                <GitBranch size={10} />
                {relatedPaths.length} attack path{relatedPaths.length > 1 ? "s" : ""} worsened:
              </span>
              {relatedPaths.map(p => (
                <EntityChip
                  key={p.pathId}
                  label={p.name}
                  color={PRIORITY_COLORS[p.priority] ?? "#7c8da6"}
                  onClick={() => navigate(`/attack-paths/${p.pathId}`)}
                />
              ))}
            </div>
          )}

          {/* Affected assets */}
          {affectedAssets.length > 0 && (
            <div className="flex items-center gap-[6px] flex-wrap">
              <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 10, color: colors.textDim, flexShrink: 0 }}>
                <Server size={10} />
                {affectedAssets.length} asset{affectedAssets.length > 1 ? "s" : ""} affected:
              </span>
              {registeredAssets.map(a => (
                <EntityChip
                  key={a.assetId}
                  label={a.name}
                  color={colors.accent}
                  onClick={() => navigate(`/asset-register/${a.assetId}`)}
                />
              ))}
              {blastAssets.map(a => (
                <EntityChip
                  key={a.assetId}
                  label={a.name}
                  color={colors.textDim}
                />
              ))}
            </div>
          )}

          {/* Blast radius impact note */}
          {blastImpact && (
            <p style={{ fontSize: 10, color: colors.textDim, lineHeight: "1.5", marginTop: 2 }}>
              <span style={{ color: colors.success, fontWeight: 600 }}>↓ Remediation impact: </span>
              {blastImpact}
            </p>
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
  const { setPageContext } = useAiBox();

  useEffect(() => {
    setPageContext(buildPageContext());
  }, [setPageContext]);

  const criticalGaps = GAPS.filter(g => g.severity === "critical").length;
  const highGaps = GAPS.filter(g => g.severity === "high").length;
  const avgScore = Math.round(FRAMEWORKS.reduce((s, f) => s + f.score, 0) / FRAMEWORKS.length);

  return (
    <div
      className="flex-1 flex flex-col overflow-y-auto"
      style={{ backgroundColor: colors.bgApp }}
    >
      {/* Header */}
      <div
        className="flex-none px-[32px] pt-[24px] pb-[20px]"
        style={{ borderBottom: `1px solid ${colors.border}` }}
      >
        <PageHeader
          icon={<Shield size={18} style={{ color: colors.accent }} />}
          title="Compliance"
          subtitle="Posture overview across all active control frameworks"
          actions={
            <div className="flex items-center gap-[20px]">
              <div className="text-right">
                <p style={{ fontSize: 11, color: colors.textDim }}>Avg Score</p>
                <p style={{ fontSize: 20, fontWeight: 700, color: avgScore >= 90 ? colors.success : colors.medium }}>{avgScore}%</p>
              </div>
              <div className="text-right">
                <p style={{ fontSize: 11, color: colors.textDim }}>Critical Gaps</p>
                <p style={{ fontSize: 20, fontWeight: 700, color: colors.critical }}>{criticalGaps}</p>
              </div>
              <div className="text-right">
                <p style={{ fontSize: 11, color: colors.textDim }}>High Gaps</p>
                <p style={{ fontSize: 20, fontWeight: 700, color: colors.high }}>{highGaps}</p>
              </div>
            </div>
          }
        />
      </div>

      {/* Body */}
      <div className="flex-1 px-[32px] py-[24px] flex flex-col gap-[28px]">

        {/* Frameworks grid */}
        <section>
          <SectionLabel
            icon={<TrendingUp size={13} color={colors.textMuted} />}
            label="Active Frameworks"
            count={FRAMEWORKS.length}
          />
          <div className="grid gap-[12px]" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))" }}>
            {FRAMEWORKS.map(fw => <FrameworkRow key={fw.id} fw={fw} />)}
          </div>
        </section>

        {/* Open gaps */}
        <section>
          <SectionLabel
            icon={<AlertTriangle size={13} color={colors.medium} />}
            label="Open Gaps"
            count={GAPS.length}
          />
          <div className="flex flex-col gap-[8px]">
            {GAPS.map(gap => <GapRow key={gap.id} gap={gap} />)}
          </div>
        </section>

        {/* Recent policy changes */}
        <section>
          <SectionLabel
            icon={<FileText size={13} color={colors.textMuted} />}
            label="Recent Policy Changes"
          />
          <div className="flex flex-col gap-[8px]">
            {RECENT_POLICY_CHANGES.map(p => (
              <div
                key={p.id}
                className="flex items-start gap-[12px] p-[12px] rounded-[8px]"
                style={{ background: colors.bgCard, border: `1px solid ${colors.border}` }}
              >
                <span style={{ fontSize: 10, color: colors.textDim, whiteSpace: "nowrap", minWidth: 36 }}>{p.date}</span>
                <span style={{ fontSize: 12, color: colors.textSecondary, flex: 1 }}>{p.change}</span>
                <span
                  className="shrink-0 px-[6px] py-[2px] rounded-[4px] text-[10px]"
                  style={{
                    background: SEVERITY_BG[p.impact],
                    color: SEVERITY_COLOR[p.impact],
                  }}
                >
                  {p.impact} impact
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
