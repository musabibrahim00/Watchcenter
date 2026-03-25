import React, { useEffect } from "react";
import { useNavigate } from "react-router";
import {
  AlertTriangle, TrendingUp, Shield, FileText,
  GitBranch, Server, Sparkles, CheckCircle2, XCircle,
  AlertCircle, Activity, FolderOpen, Calendar, ArrowRight,
} from "lucide-react";
import { colors } from "../shared/design-system/tokens";
import { PageHeader, SectionLabel } from "../shared/components/ui";
import { useAiBox } from "../features/ai-box";
import { useEvidenceStore } from "../features/compliance/evidence-store";
import { ActionableEvidenceRow } from "../features/compliance/ActionableEvidenceRow";
import {
  getPathsForGap,
  getAssetsForGap,
  getBlastRadiusImpactForGap,
} from "../shared/entity-graph";

/* ================================================================
   DATA
   ================================================================ */

const FRAMEWORKS = [
  { id: "soc2",     name: "SOC 2 Type II",  controls: 64,  passing: 58, failing: 4, inProgress: 2, score: 91, trend: "+3" },
  { id: "iso27001", name: "ISO 27001",       controls: 114, passing: 99, failing: 8, inProgress: 7, score: 87, trend: "+1" },
  { id: "nist-csf", name: "NIST CSF",        controls: 108, passing: 91, failing: 9, inProgress: 8, score: 84, trend: "-2" },
  { id: "pci-dss",  name: "PCI-DSS v4.0",   controls: 78,  passing: 72, failing: 3, inProgress: 3, score: 92, trend: "+4" },
  { id: "hipaa",    name: "HIPAA",           controls: 45,  passing: 40, failing: 2, inProgress: 3, score: 89, trend: "0"  },
];

const GAPS = [
  { id: "g1", severity: "critical" as const, control: "AC-2",    framework: "NIST CSF",  title: "Privileged account lifecycle not enforced",                    daysOpen: 14, owner: "Identity Team" },
  { id: "g2", severity: "critical" as const, control: "CC6.1",   framework: "SOC 2",     title: "MFA not required on 12 service accounts",                      daysOpen: 8,  owner: "Platform Engineering" },
  { id: "g3", severity: "high"     as const, control: "A.9.4",   framework: "ISO 27001", title: "Encryption key rotation policy not enforced",                  daysOpen: 22, owner: "Security Operations" },
  { id: "g4", severity: "high"     as const, control: "Req 6.3", framework: "PCI-DSS",   title: "Vulnerability scan overdue on cardholder segment",             daysOpen: 5,  owner: "Vulnerability Team" },
  { id: "g5", severity: "medium"   as const, control: "PR.IP-1", framework: "NIST CSF",  title: "Configuration baseline not documented for 3 asset classes",    daysOpen: 31, owner: "Configuration Team" },
];

const RECENT_POLICY_CHANGES = [
  { id: "p1", date: "Mar 14", change: "Updated MFA policy to require FIDO2 for all admin accounts",              impact: "high"   as const },
  { id: "p2", date: "Mar 11", change: "Extended vulnerability SLA for medium severity from 30 to 45 days",       impact: "medium" as const },
  { id: "p3", date: "Mar 09", change: "Added cardholder data scope to PCI-DSS quarterly review",                 impact: "high"   as const },
];

const UPCOMING_AUDITS = [
  {
    id: "a1", name: "SOC 2 Type II Annual",   framework: "SOC 2",     color: "#57B1FF",
    date: "Jun 15, 2026", daysUntil: 82,  readiness: 87, owner: "Compliance Team",
    keyRisks: ["MFA gap on 12 service accounts", "Incomplete access reviews for Q1"],
  },
  {
    id: "a2", name: "ISO 27001 Surveillance", framework: "ISO 27001", color: "#7988FF",
    date: "May 20, 2026", daysUntil: 56,  readiness: 72, owner: "CISO Office",
    keyRisks: ["Key rotation policy gap", "Vendor risk backlog (8 overdue)"],
  },
  {
    id: "a3", name: "PCI-DSS QSA Assessment", framework: "PCI-DSS",   color: "#2FD897",
    date: "Jul 30, 2026", daysUntil: 127, readiness: 93, owner: "Payment Security",
    keyRisks: ["Vulnerability scan overdue on CDE"],
  },
];

// EVIDENCE_ITEMS and EvidenceStatus removed — live data now comes from useEvidenceStore()
// which merges compliance-data.ts seed data with any localStorage overrides.

type MonitorStatus = "passing" | "failing" | "warning";

const MONITORING_CHECKS = [
  { id: "m1", name: "Privileged Access Review",  control: "CC6.3",  framework: "SOC 2",     status: "passing" as MonitorStatus, lastRun: "2h ago",  frequency: "Daily",      anomalies: 0  },
  { id: "m2", name: "MFA Coverage Scan",          control: "CC6.1",  framework: "SOC 2",     status: "failing" as MonitorStatus, lastRun: "1h ago",  frequency: "Hourly",     anomalies: 12 },
  { id: "m3", name: "Encryption At-Rest Audit",   control: "A.10.1", framework: "ISO 27001", status: "warning" as MonitorStatus, lastRun: "6h ago",  frequency: "Daily",      anomalies: 3  },
  { id: "m4", name: "Vulnerability Scan Coverage",control: "Req 6.3",framework: "PCI-DSS",   status: "failing" as MonitorStatus, lastRun: "3d ago",  frequency: "Weekly",     anomalies: 1  },
  { id: "m5", name: "Access Log Integrity",       control: "AU-3",   framework: "NIST CSF",  status: "passing" as MonitorStatus, lastRun: "30m ago", frequency: "Continuous", anomalies: 0  },
  { id: "m6", name: "Data Classification Sweep",  control: "A.8.2",  framework: "ISO 27001", status: "passing" as MonitorStatus, lastRun: "4h ago",  frequency: "Daily",      anomalies: 0  },
];

const MONITORING_SORTED = [...MONITORING_CHECKS].sort((a, b) => {
  const order: Record<MonitorStatus, number> = { failing: 0, warning: 1, passing: 2 };
  return order[a.status] - order[b.status];
});

/* ================================================================
   AIBOX CONTEXT
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
      { label: "What should I focus on today?",        prompt: "Given the current compliance posture, what should I prioritize today?" },
      { label: "ISO 27001 audit prep briefing",        prompt: "Give me a readiness briefing for the ISO 27001 surveillance audit in 56 days — what needs to happen before then?" },
      { label: "Fix the critical gaps first",          prompt: "Walk me through a remediation plan for the 2 critical compliance gaps (AC-2 and CC6.1)" },
      { label: "Which evidence is overdue?",           prompt: "Which evidence items are overdue or at risk before upcoming audits, and who owns them?" },
      { label: "How do these gaps affect our attack surface?", prompt: "How do the open compliance gaps worsen our attack paths and blast radius?" },
      { label: "Generate a compliance summary report", prompt: "Generate a compliance summary report across all active frameworks suitable for a leadership review" },
      { label: "What changed this week?",              prompt: "What compliance changes, policy updates, or new gaps appeared this week?" },
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
   HELPERS
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

// EVIDENCE_STATUS_COLOR removed — EvidenceRow replaced by ActionableEvidenceRow from compliance feature

const MONITOR_STATUS_COLOR: Record<MonitorStatus, string> = {
  passing: colors.success,
  failing: colors.critical,
  warning: colors.medium,
};

const MONITOR_STATUS_ICON: Record<MonitorStatus, React.ReactNode> = {
  passing: <CheckCircle2 size={11} color={colors.success} />,
  failing: <XCircle       size={11} color={colors.critical} />,
  warning: <AlertCircle   size={11} color={colors.medium}   />,
};

/* ================================================================
   FOCUS BANNER — surfaces the #1 priority near the top
   ================================================================ */

function FocusBanner({ onReviewGaps, onAuditPrep }: {
  onReviewGaps: () => void;
  onAuditPrep: () => void;
}) {
  const criticalCount = GAPS.filter(g => g.severity === "critical").length;
  const urgentAudit = [...UPCOMING_AUDITS].sort((a, b) => a.daysUntil - b.daysUntil)[0];
  const isAuditRisk = urgentAudit.readiness < 80;

  return (
    <div
      className="flex-none mx-[32px] mt-[20px] rounded-[12px] p-[16px] flex items-start gap-[14px]"
      style={{
        background: `linear-gradient(135deg, rgba(255,87,87,0.07) 0%, rgba(245,179,1,0.06) 100%)`,
        border: `1px solid rgba(255,87,87,0.22)`,
      }}
    >
      {/* Icon */}
      <div
        className="shrink-0 flex items-center justify-center rounded-[8px] size-[36px] mt-[1px]"
        style={{ background: `${colors.critical}18`, border: `1px solid ${colors.critical}2a` }}
      >
        <AlertTriangle size={16} color={colors.critical} />
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <p style={{ fontSize: 13, fontWeight: 700, color: colors.textPrimary, lineHeight: 1.3 }}>
          {criticalCount} critical gap{criticalCount !== 1 ? "s" : ""} require immediate action
        </p>
        <p style={{ fontSize: 12, color: colors.textMuted, marginTop: 4, lineHeight: 1.5 }}>
          {isAuditRisk
            ? `${urgentAudit.name} is in ${urgentAudit.daysUntil} days with readiness at ${urgentAudit.readiness}% — below the safe threshold. The MFA and key rotation gaps are the main blockers.`
            : `Your next audit (${urgentAudit.name}) is in ${urgentAudit.daysUntil} days. Review open gaps to stay on track.`
          }
        </p>
      </div>

      {/* Actions */}
      <div className="shrink-0 flex items-center gap-[8px]">
        <button
          onClick={onReviewGaps}
          className="flex items-center gap-[5px] px-[11px] py-[7px] rounded-[7px] text-[11px] font-semibold cursor-pointer transition-colors"
          style={{ background: `${colors.critical}18`, color: colors.critical, border: `1px solid ${colors.critical}2a` }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = `${colors.critical}28`; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = `${colors.critical}18`; }}
        >
          <AlertTriangle size={10} />
          Review critical gaps
        </button>
        <button
          onClick={onAuditPrep}
          className="flex items-center gap-[5px] px-[11px] py-[7px] rounded-[7px] text-[11px] font-semibold cursor-pointer transition-colors"
          style={{ background: `${colors.medium}14`, color: colors.medium, border: `1px solid ${colors.medium}28` }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = `${colors.medium}24`; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = `${colors.medium}14`; }}
        >
          <Calendar size={10} />
          Check audit prep
        </button>
      </div>
    </div>
  );
}

/* ================================================================
   SUB-COMPONENTS
   ================================================================ */

function ScoreBadge({ score, trend }: { score: number; trend: string }) {
  const trendNum = parseInt(trend);
  const scoreColor = score >= 90 ? colors.success : score >= 80 ? colors.medium : colors.critical;
  return (
    <div className="flex items-center gap-[6px]">
      <span style={{ fontSize: 20, fontWeight: 700, color: scoreColor }}>{score}%</span>
      {trendNum !== 0 && (
        <span style={{ fontSize: 11, color: trendNum > 0 ? colors.success : colors.critical }}>
          {trendNum > 0 ? "+" : ""}{trend}
        </span>
      )}
    </div>
  );
}

function FrameworkRow({ fw }: { fw: typeof FRAMEWORKS[number] }) {
  const navigate       = useNavigate();
  const passWidth      = `${(fw.passing    / fw.controls) * 100}%`;
  const failWidth      = `${(fw.failing    / fw.controls) * 100}%`;
  const inProgressWidth= `${(fw.inProgress / fw.controls) * 100}%`;
  const isTrending     = parseInt(fw.trend) < 0;

  return (
    <div
      className="flex flex-col gap-[10px] p-[16px] rounded-[10px] cursor-pointer transition-colors"
      onClick={() => navigate(`/compliance/${fw.id}`)}
      onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = isTrending ? colors.medium + "66" : colors.primary + "44"; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = isTrending ? colors.medium + "44" : colors.border; }}
      style={{
        background: colors.bgCard,
        border: `1px solid ${isTrending ? colors.medium + "44" : colors.border}`,
      }}
    >
      <div className="flex items-start justify-between gap-[8px]">
        <div>
          <p style={{ fontSize: 13, fontWeight: 600, color: colors.textPrimary }}>{fw.name}</p>
          <p style={{ fontSize: 11, color: colors.textMuted, marginTop: 2 }}>
            {fw.controls} controls · {fw.failing} failing
          </p>
        </div>
        <div className="flex items-center gap-[10px]">
          <ScoreBadge score={fw.score} trend={fw.trend} />
          <ArrowRight size={13} color={colors.textDim} />
        </div>
      </div>
      <div className="flex h-[5px] rounded-full overflow-hidden w-full" style={{ background: "rgba(255,255,255,0.06)" }}>
        <div style={{ width: passWidth,       background: colors.success }} />
        <div style={{ width: inProgressWidth, background: colors.medium }} />
        <div style={{ width: failWidth,       background: colors.critical }} />
      </div>
      <div className="flex gap-[14px]">
        <span style={{ fontSize: 10, color: colors.success  }}>{fw.passing}    passing</span>
        <span style={{ fontSize: 10, color: colors.medium   }}>{fw.inProgress} in progress</span>
        <span style={{ fontSize: 10, color: colors.critical }}>{fw.failing}    failing</span>
      </div>
    </div>
  );
}

function EntityChip({ label, color, onClick }: { label: string; color: string; onClick?: () => void }) {
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
        display: "inline-flex", alignItems: "center",
        padding: "2px 8px", borderRadius: 999,
        fontSize: 10, fontWeight: 500,
        background: hovered && onClick ? `${color}28` : `${color}14`,
        color, border: `1px solid ${color}30`,
        cursor: onClick ? "pointer" : "default",
        transition: "background 0.12s ease", whiteSpace: "nowrap",
      }}
    >
      {label}
    </span>
  );
}

function GapRow({ gap }: { gap: typeof GAPS[number] }) {
  const navigate = useNavigate();
  const { openWithContext } = useAiBox();
  const relatedPaths  = getPathsForGap(gap.id);
  const affectedAssets= getAssetsForGap(gap.id);
  const blastImpact   = getBlastRadiusImpactForGap(gap.id);

  const registeredAssets = affectedAssets.filter(a => a.type === "registered");
  const blastAssets      = affectedAssets.filter(a => a.type === "blast-radius");

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
        { label: "Explain the impact",         prompt: `Explain the business impact of the ${gap.control} compliance gap: "${gap.title}"` },
        { label: "Show remediation steps",     prompt: `Give me step-by-step remediation for the ${gap.control} gap (${gap.framework}): "${gap.title}"` },
        { label: "Who should fix this?",       prompt: `Who should own the remediation of ${gap.control} (${gap.framework}) and what's a realistic timeline?` },
        { label: "Impact on attack paths",     prompt: `Which attack paths are worsened by the ${gap.control} gap and by how much?` },
      ],
    });
  }

  return (
    <div
      className="flex flex-col gap-[10px] p-[12px] rounded-[8px]"
      style={{ background: SEVERITY_BG[gap.severity], border: `1px solid ${SEVERITY_COLOR[gap.severity]}22` }}
    >
      {/* Main row */}
      <div className="flex items-start gap-[10px]">
        <div
          className="shrink-0 mt-[1px] px-[6px] py-[2px] rounded-[4px] text-[10px] font-semibold uppercase tracking-wide"
          style={{ background: SEVERITY_COLOR[gap.severity] + "22", color: SEVERITY_COLOR[gap.severity] }}
        >
          {gap.severity}
        </div>
        <div className="flex-1 min-w-0">
          <p style={{ fontSize: 12, fontWeight: 600, color: colors.textPrimary, lineHeight: 1.35 }}>{gap.title}</p>
          <div className="flex items-center gap-[10px] mt-[4px] flex-wrap">
            <span style={{ fontSize: 10, color: colors.textMuted }}>{gap.framework} · {gap.control}</span>
            <span style={{ fontSize: 10, color: colors.textDim   }}>Open {gap.daysOpen} days</span>
            <span style={{ fontSize: 10, color: colors.textDim   }}>Owner: {gap.owner}</span>
          </div>
        </div>
        <button
          onClick={handleAskAI}
          title={`Get remediation help for ${gap.control}`}
          style={{
            display: "inline-flex", alignItems: "center", gap: 4,
            padding: "4px 9px", borderRadius: 99, fontSize: 10, fontWeight: 600,
            background: `${SEVERITY_COLOR[gap.severity]}10`,
            color: SEVERITY_COLOR[gap.severity],
            border: `1px solid ${SEVERITY_COLOR[gap.severity]}2a`,
            cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0,
          }}
        >
          <Sparkles size={9} />
          Remediate
        </button>
      </div>

      {/* Cross-entity context */}
      {(relatedPaths.length > 0 || affectedAssets.length > 0) && (
        <div className="flex flex-col gap-[6px] pt-[8px]" style={{ borderTop: `1px solid ${SEVERITY_COLOR[gap.severity]}18` }}>
          {relatedPaths.length > 0 && (
            <div className="flex items-center gap-[6px] flex-wrap">
              <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 10, color: colors.textDim, flexShrink: 0 }}>
                <GitBranch size={10} />{relatedPaths.length} attack path{relatedPaths.length > 1 ? "s" : ""} worsened:
              </span>
              {relatedPaths.map(p => (
                <EntityChip key={p.pathId} label={p.name} color={PRIORITY_COLORS[p.priority] ?? "#7c8da6"} onClick={() => navigate(`/attack-paths/${p.pathId}`)} />
              ))}
            </div>
          )}
          {affectedAssets.length > 0 && (
            <div className="flex items-center gap-[6px] flex-wrap">
              <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 10, color: colors.textDim, flexShrink: 0 }}>
                <Server size={10} />{affectedAssets.length} asset{affectedAssets.length > 1 ? "s" : ""} at risk:
              </span>
              {registeredAssets.map(a => (
                <EntityChip key={a.assetId} label={a.name} color={colors.accent} onClick={() => navigate(`/asset-register/${a.assetId}`)} />
              ))}
              {blastAssets.map(a => (
                <EntityChip key={a.assetId} label={a.name} color={colors.textDim} />
              ))}
            </div>
          )}
          {blastImpact && (
            <p style={{ fontSize: 10, color: colors.textDim, lineHeight: 1.5, marginTop: 2 }}>
              <span style={{ color: colors.success, fontWeight: 600 }}>↓ Fix this to: </span>{blastImpact}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Audit Readiness Card ── */

function AuditCard({ audit, onAskAI }: { audit: typeof UPCOMING_AUDITS[number]; onAskAI: () => void }) {
  const isUrgent    = audit.daysUntil <= 60;
  const isAtRisk    = audit.readiness < 80;
  const urgentColor = isAtRisk ? colors.critical : isUrgent ? colors.medium : colors.textDim;
  const borderColor = isUrgent && isAtRisk ? `${colors.medium}44` : colors.border;

  return (
    <div
      className="flex flex-col gap-[12px] p-[14px] rounded-[10px]"
      style={{ background: colors.bgCard, border: `1px solid ${borderColor}` }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-[8px]">
        <div className="flex-1 min-w-0">
          <p style={{ fontSize: 12, fontWeight: 600, color: colors.textPrimary, lineHeight: 1.3 }}>{audit.name}</p>
          <div className="flex items-center gap-[8px] mt-[4px]">
            <span
              className="px-[6px] py-[1px] rounded-[4px] text-[9px] font-semibold"
              style={{ background: `${audit.color}18`, color: audit.color, border: `1px solid ${audit.color}28` }}
            >
              {audit.framework}
            </span>
            <span style={{ fontSize: 10, color: colors.textDim }}>{audit.owner}</span>
          </div>
        </div>
        <div className="text-right shrink-0">
          <p style={{ fontSize: 17, fontWeight: 700, color: urgentColor, lineHeight: 1 }}>{audit.daysUntil}d</p>
          <p style={{ fontSize: 9, color: colors.textDim, marginTop: 2 }}>{audit.date}</p>
        </div>
      </div>

      {/* Readiness bar */}
      <div className="flex flex-col gap-[5px]">
        <div className="flex items-center justify-between">
          <span style={{ fontSize: 10, color: colors.textMuted }}>Readiness</span>
          <span style={{ fontSize: 11, fontWeight: 700, color: audit.readiness >= 85 ? colors.success : audit.readiness >= 70 ? colors.medium : colors.critical }}>
            {audit.readiness}%
          </span>
        </div>
        <div className="flex h-[4px] rounded-full overflow-hidden w-full" style={{ background: "rgba(255,255,255,0.06)" }}>
          <div style={{ width: `${audit.readiness}%`, background: audit.readiness >= 85 ? colors.success : audit.readiness >= 70 ? colors.medium : colors.critical, borderRadius: 999, transition: "width 0.4s ease" }} />
        </div>
        {isAtRisk && (
          <p style={{ fontSize: 10, color: colors.medium, marginTop: 1 }}>
            Below 80% — needs attention before audit
          </p>
        )}
      </div>

      {/* Blocking risks */}
      {audit.keyRisks.length > 0 && (
        <div
          className="flex flex-col gap-[4px] rounded-[6px] p-[8px]"
          style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}
        >
          <p style={{ fontSize: 9, fontWeight: 600, color: colors.textDim, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 2 }}>
            Blocking issues
          </p>
          {audit.keyRisks.map((r, i) => (
            <div key={i} className="flex items-start gap-[6px]">
              <AlertCircle size={10} color={colors.medium} style={{ marginTop: 2, flexShrink: 0 }} />
              <span style={{ fontSize: 10, color: colors.textDim, lineHeight: 1.5 }}>{r}</span>
            </div>
          ))}
        </div>
      )}

      {/* Action */}
      {(isUrgent || isAtRisk) && (
        <button
          onClick={onAskAI}
          className="flex items-center justify-center gap-[5px] w-full py-[7px] rounded-[7px] text-[11px] font-semibold cursor-pointer transition-colors"
          style={{ background: `${colors.medium}14`, color: colors.medium, border: `1px solid ${colors.medium}28` }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = `${colors.medium}24`; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = `${colors.medium}14`; }}
        >
          <Sparkles size={10} />
          Get audit preparation checklist
        </button>
      )}
    </div>
  );
}


/* ── Monitoring Row ── */

function MonitorRow({ check }: { check: typeof MONITORING_CHECKS[number] }) {
  const statusColor = MONITOR_STATUS_COLOR[check.status];
  return (
    <div
      className="flex items-center gap-[10px] px-[12px] py-[9px] rounded-[8px]"
      style={{
        background: check.status === "failing" ? `${colors.critical}0a` : colors.bgCard,
        border: `1px solid ${check.status === "failing" ? colors.critical + "28" : colors.border}`,
      }}
    >
      <div className="shrink-0">{MONITOR_STATUS_ICON[check.status]}</div>
      <div className="flex-1 min-w-0">
        <p style={{ fontSize: 11, fontWeight: 500, color: colors.textPrimary, lineHeight: 1.3 }} className="truncate">{check.name}</p>
        <p style={{ fontSize: 10, color: colors.textDim }}>{check.framework} · {check.control} · {check.frequency}</p>
      </div>
      <div className="shrink-0 text-right">
        {check.anomalies > 0 && (
          <span className="px-[6px] py-[2px] rounded-[4px] text-[9px] font-semibold" style={{ background: `${statusColor}18`, color: statusColor }}>
            {check.anomalies} anomal{check.anomalies === 1 ? "y" : "ies"}
          </span>
        )}
        <p style={{ fontSize: 9, color: colors.textDim, marginTop: check.anomalies > 0 ? 2 : 0 }}>{check.lastRun}</p>
      </div>
    </div>
  );
}

/* ── KPI Strip ── */

function KpiCard({
  label, value, sub, color, highlight,
}: {
  label: string; value: string | number; sub?: string; color?: string; highlight?: boolean;
}) {
  return (
    <div
      className="flex flex-col gap-[2px] px-[16px] py-[12px] rounded-[10px] flex-1"
      style={{
        background: highlight ? `rgba(255,255,255,0.04)` : colors.bgCard,
        border: `1px solid ${highlight ? "rgba(255,255,255,0.1)" : colors.border}`,
      }}
    >
      <p style={{ fontSize: 10, color: colors.textDim }}>{label}</p>
      <p style={{ fontSize: 20, fontWeight: 700, color: color || colors.textPrimary, lineHeight: 1.2 }}>{value}</p>
      {sub && <p style={{ fontSize: 10, color: colors.textDim }}>{sub}</p>}
    </div>
  );
}

/* ================================================================
   PAGE
   ================================================================ */

export default function CompliancePage() {
  const { setPageContext, openWithContext } = useAiBox();
  const { items: evidenceItems, update: updateEvidence } = useEvidenceStore();

  useEffect(() => {
    setPageContext(buildPageContext());
  }, [setPageContext]);

  const criticalGaps      = GAPS.filter(g => g.severity === "critical").length;
  const avgScore          = Math.round(FRAMEWORKS.reduce((s, f) => s + f.score, 0) / FRAMEWORKS.length);
  const totalControls     = FRAMEWORKS.reduce((s, f) => s + f.controls, 0);
  const passingControls   = FRAMEWORKS.reduce((s, f) => s + f.passing, 0);
  const evidenceCollected = evidenceItems.filter(e => e.status === "collected").length;
  const evidenceOverdue   = evidenceItems.filter(e => e.status === "overdue").length;
  const monitorFailing    = MONITORING_CHECKS.filter(m => m.status === "failing").length;
  const nextAuditDays     = Math.min(...UPCOMING_AUDITS.map(a => a.daysUntil));
  const nextAudit         = UPCOMING_AUDITS.find(a => a.daysUntil === nextAuditDays)!;

  const evidenceSorted = [...evidenceItems].sort((a, b) => {
    const o = { overdue: 0, pending: 1, collected: 2 } as const;
    return o[a.status] - o[b.status];
  });;

  function handleReviewGaps() {
    openWithContext({
      type: "general",
      label: "Critical Gaps",
      sublabel: "Remediation Priority",
      contextKey: "compliance-critical-gaps",
      greeting: `You have 2 critical compliance gaps open right now:\n\n1. **AC-2** (NIST CSF) — Privileged account lifecycle not enforced — open 14 days\n2. **CC6.1** (SOC 2) — MFA not required on 12 service accounts — open 8 days\n\nBoth are blocking your upcoming audits. Where would you like to start?`,
      suggestions: [
        { label: "Remediation plan for AC-2",         prompt: "Give me a step-by-step remediation plan for AC-2 (Privileged account lifecycle not enforced)" },
        { label: "Remediation plan for CC6.1",        prompt: "Give me a step-by-step remediation plan for CC6.1 (MFA not required on service accounts)" },
        { label: "Which is faster to fix?",           prompt: "Which of the two critical gaps (AC-2 vs CC6.1) is faster to remediate and what's the risk of waiting?" },
        { label: "Who should own these?",             prompt: "Who should own the remediation of AC-2 and CC6.1, and what's a realistic timeline for each?" },
      ],
    });
  }

  function handleAuditPrep() {
    openWithContext({
      type: "general",
      label: "ISO 27001 Prep",
      sublabel: "56 days until audit",
      contextKey: "compliance-audit-iso27001",
      greeting: `ISO 27001 Surveillance audit is in 56 days with readiness at **72%** — below the recommended 80% threshold.\n\nThe two main blockers are:\n- Key rotation policy not enforced (A.9.4)\n- Vendor risk backlog (8 overdue assessments)\n\nWant me to create a preparation plan?`,
      suggestions: [
        { label: "Create a 56-day prep plan",         prompt: "Create a week-by-week preparation plan to get ISO 27001 readiness from 72% to 90%+ before the audit in 56 days" },
        { label: "Fix the key rotation gap first",    prompt: "What needs to happen to close the encryption key rotation gap (A.9.4) before the ISO 27001 audit?" },
        { label: "Clear the vendor risk backlog",     prompt: "How do we clear 8 overdue vendor risk assessments before the ISO 27001 surveillance audit?" },
        { label: "What if we go in at 72% readiness?",prompt: "What's the risk of entering the ISO 27001 surveillance audit at 72% readiness? What are auditors likely to flag?" },
      ],
    });
  }

  return (
    <div className="flex-1 flex flex-col overflow-y-auto" style={{ backgroundColor: colors.bgApp }}>

      {/* ── Page Header ── */}
      <div className="flex-none px-[32px] pt-[24px] pb-[20px]" style={{ borderBottom: `1px solid ${colors.border}` }}>
        <PageHeader
          icon={<Shield size={18} style={{ color: colors.accent }} />}
          title="Compliance"
          subtitle="Track your certification posture, close gaps, collect evidence, and prepare for audits"
          actions={undefined}
        />
      </div>

      {/* ── Focus Banner — highest priority at the top ── */}
      <FocusBanner onReviewGaps={handleReviewGaps} onAuditPrep={handleAuditPrep} />

      {/* ── KPI Strip ── */}
      <div className="flex-none px-[32px] pt-[16px] pb-[4px]">
        <div className="flex gap-[10px]">
          <KpiCard label="Avg Score"       value={`${avgScore}%`}                sub="5 frameworks"           color={avgScore >= 90 ? colors.success : colors.medium} />
          <KpiCard label="Critical Gaps"   value={criticalGaps}                  sub="need immediate fix"     color={colors.critical}  highlight />
          <KpiCard label="Next Audit"      value={`${nextAuditDays}d`}           sub={nextAudit.framework}    color={nextAuditDays <= 60 ? colors.medium : colors.textPrimary} highlight />
          <KpiCard label="Controls"        value={`${passingControls}/${totalControls}`} sub="passing"       color={colors.success} />
          <KpiCard label="Evidence"        value={`${evidenceCollected}/${evidenceItems.length}`} sub={evidenceOverdue > 0 ? `${evidenceOverdue} overdue` : "collected"} color={evidenceOverdue > 0 ? colors.critical : colors.success} />
          <KpiCard label="Live Monitors"   value={monitorFailing > 0 ? monitorFailing : "All clear"} sub={monitorFailing > 0 ? "checks failing" : "no failures"} color={monitorFailing > 0 ? colors.critical : colors.success} />
        </div>
      </div>

      {/* ── Body: two-column layout ── */}
      <div className="flex-1 px-[32px] py-[24px] flex gap-[24px] min-h-0">

        {/* Left column — sorted by urgency: Gaps → Frameworks → Policy */}
        <div className="flex-1 min-w-0 flex flex-col gap-[28px]">

          {/* Open Gaps — first, most actionable */}
          <section>
            <SectionLabel
              icon={<AlertTriangle size={13} color={colors.medium} />}
              label="Open Control Gaps"
              count={GAPS.length}
              description="Issues that are blocking your certifications and need to be fixed"
            />
            <div className="flex flex-col gap-[8px]">
              {GAPS.map(gap => <GapRow key={gap.id} gap={gap} />)}
            </div>
          </section>

          {/* Frameworks — context, not action */}
          <section>
            <SectionLabel
              icon={<TrendingUp size={13} color={colors.textMuted} />}
              label="Framework Status"
              count={FRAMEWORKS.length}
              description="How you're scoring across each active compliance framework"
            />
            <div className="grid gap-[12px]" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))" }}>
              {FRAMEWORKS.map(fw => <FrameworkRow key={fw.id} fw={fw} />)}
            </div>
          </section>

          {/* Policy Changes — lowest urgency */}
          <section>
            <SectionLabel
              icon={<FileText size={13} color={colors.textMuted} />}
              label="Recent Policy Changes"
              description="Control policies updated in the last 30 days"
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
                    style={{ background: SEVERITY_BG[p.impact], color: SEVERITY_COLOR[p.impact] }}
                  >
                    {p.impact} impact
                  </span>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Right column — Upcoming Audits → Evidence → Monitoring */}
        <div className="w-[340px] shrink-0 flex flex-col gap-[28px]">

          {/* Upcoming Audits */}
          <section>
            <SectionLabel
              icon={<Calendar size={13} color={colors.textMuted} />}
              label="Upcoming Audits"
              count={UPCOMING_AUDITS.length}
              description="Preparation status for scheduled assessments"
            />
            <div className="flex flex-col gap-[10px]">
              {[...UPCOMING_AUDITS]
                .sort((a, b) => a.daysUntil - b.daysUntil)
                .map(audit => (
                  <AuditCard
                    key={audit.id}
                    audit={audit}
                    onAskAI={() => openWithContext({
                      type: "general",
                      label: audit.name,
                      sublabel: `${audit.daysUntil} days until audit`,
                      contextKey: `compliance-audit:${audit.id}`,
                      greeting: `${audit.name} is in ${audit.daysUntil} days. Readiness is at ${audit.readiness}%. Blocking issues: ${audit.keyRisks.join("; ")}. How can I help you prepare?`,
                      suggestions: [
                        { label: "Build a preparation checklist", prompt: `Create a preparation checklist for the ${audit.name} audit in ${audit.daysUntil} days` },
                        { label: "Fix blocking issues",           prompt: `How do I resolve these blocking issues before ${audit.name}: ${audit.keyRisks.join(", ")}?` },
                        { label: "What will auditors check?",     prompt: `What are auditors most likely to focus on in a ${audit.framework} ${audit.name.includes("Surveillance") ? "surveillance" : ""} audit?` },
                      ],
                    })}
                  />
                ))
              }
            </div>
          </section>

          {/* Evidence Tracker */}
          <section>
            <div className="flex items-center justify-between" style={{ marginBottom: 10 }}>
              <SectionLabel
                icon={<FolderOpen size={13} color={colors.textMuted} />}
                label="Evidence Tracker"
                count={evidenceItems.length}
              />
              <div style={{ fontSize: 10, color: colors.textDim, marginBottom: 12 }}>
                <span style={{ color: colors.success, fontWeight: 600 }}>{evidenceCollected}</span>/{evidenceItems.length} collected
                {evidenceOverdue > 0 && (
                  <span style={{ color: colors.critical, fontWeight: 600, marginLeft: 8 }}>· {evidenceOverdue} overdue</span>
                )}
              </div>
            </div>
            <div className="mb-[10px] flex h-[3px] rounded-full overflow-hidden w-full" style={{ background: "rgba(255,255,255,0.06)" }}>
              <div style={{ width: `${(evidenceCollected / evidenceItems.length) * 100}%`, background: colors.success }} />
              <div style={{ width: `${(evidenceItems.filter(e => e.status === "pending").length / evidenceItems.length) * 100}%`, background: colors.medium }} />
              <div style={{ width: `${(evidenceOverdue / evidenceItems.length) * 100}%`, background: colors.critical }} />
            </div>
            <div className="flex flex-col gap-[6px]">
              {evidenceSorted.map(ev => (
                <ActionableEvidenceRow key={ev.id} ev={ev} onUpdate={updateEvidence} />
              ))}
            </div>
          </section>

          {/* Live Controls Monitor */}
          <section>
            <div className="flex items-center justify-between" style={{ marginBottom: 10 }}>
              <SectionLabel
                icon={<Activity size={13} color={colors.textMuted} />}
                label="Live Controls Monitor"
                count={MONITORING_CHECKS.length}
              />
              {monitorFailing > 0 ? (
                <span
                  className="flex items-center gap-[4px] px-[6px] py-[2px] rounded-[4px] text-[10px] font-semibold"
                  style={{ background: `${colors.critical}18`, color: colors.critical, marginBottom: 12 }}
                >
                  <XCircle size={9} />{monitorFailing} failing
                </span>
              ) : (
                <span style={{ fontSize: 10, color: colors.success, marginBottom: 12 }}>All passing</span>
              )}
            </div>
            <div className="flex flex-col gap-[6px]">
              {MONITORING_SORTED.map(check => <MonitorRow key={check.id} check={check} />)}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
