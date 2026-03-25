import React, { useEffect } from "react";
import { useNavigate } from "react-router";
import {
  AlertTriangle, Clock, TrendingUp, Shield, FileText,
  GitBranch, Server, Sparkles, CheckCircle2, XCircle,
  AlertCircle, Activity, FolderOpen, Calendar, ChevronRight,
} from "lucide-react";
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

const UPCOMING_AUDITS = [
  {
    id: "a1", name: "SOC 2 Type II Annual", framework: "SOC 2", color: "#57B1FF",
    date: "Jun 15, 2026", daysUntil: 82, readiness: 87, owner: "Compliance Team",
    keyRisks: ["MFA gap on 12 service accounts", "Incomplete access reviews for Q1"],
  },
  {
    id: "a2", name: "ISO 27001 Surveillance", framework: "ISO 27001", color: "#7988FF",
    date: "May 20, 2026", daysUntil: 56, readiness: 72, owner: "CISO Office",
    keyRisks: ["Key rotation policy gap", "Vendor risk backlog (8 overdue)"],
  },
  {
    id: "a3", name: "PCI-DSS QSA Assessment", framework: "PCI-DSS", color: "#2FD897",
    date: "Jul 30, 2026", daysUntil: 127, readiness: 93, owner: "Payment Security",
    keyRisks: ["Vulnerability scan overdue on CDE"],
  },
];

type EvidenceStatus = "collected" | "pending" | "overdue";

const EVIDENCE_ITEMS = [
  { id: "e1", name: "Access Review Q1 2026", framework: "SOC 2", control: "CC6.2", status: "collected" as EvidenceStatus, collector: "Identity Team", lastUpdated: "Mar 15", dueDate: "Mar 31" },
  { id: "e2", name: "Pen Test Report 2026", framework: "ISO 27001", control: "A.14.2", status: "collected" as EvidenceStatus, collector: "Security Ops", lastUpdated: "Feb 28", dueDate: "Mar 31" },
  { id: "e3", name: "MFA Enforcement Logs", framework: "SOC 2", control: "CC6.1", status: "pending" as EvidenceStatus, collector: "Platform Eng", lastUpdated: "Mar 10", dueDate: "Mar 28" },
  { id: "e4", name: "Encryption Key Audit Trail", framework: "ISO 27001", control: "A.10.1", status: "overdue" as EvidenceStatus, collector: "Security Ops", lastUpdated: "Feb 15", dueDate: "Mar 10" },
  { id: "e5", name: "Vendor Risk Assessments", framework: "ISO 27001", control: "A.15.2", status: "pending" as EvidenceStatus, collector: "Procurement", lastUpdated: "Mar 01", dueDate: "Apr 01" },
  { id: "e6", name: "Cardholder Scope Map", framework: "PCI-DSS", control: "Req 12.5", status: "collected" as EvidenceStatus, collector: "Payment Security", lastUpdated: "Mar 09", dueDate: "Apr 15" },
];

type MonitorStatus = "passing" | "failing" | "warning";

const MONITORING_CHECKS = [
  { id: "m1", name: "Privileged Access Review", control: "CC6.3", framework: "SOC 2", status: "passing" as MonitorStatus, lastRun: "2h ago", frequency: "Daily", anomalies: 0 },
  { id: "m2", name: "MFA Coverage Scan", control: "CC6.1", framework: "SOC 2", status: "failing" as MonitorStatus, lastRun: "1h ago", frequency: "Hourly", anomalies: 12 },
  { id: "m3", name: "Encryption At-Rest Audit", control: "A.10.1", framework: "ISO 27001", status: "warning" as MonitorStatus, lastRun: "6h ago", frequency: "Daily", anomalies: 3 },
  { id: "m4", name: "Vulnerability Scan Coverage", control: "Req 6.3", framework: "PCI-DSS", status: "failing" as MonitorStatus, lastRun: "3d ago", frequency: "Weekly", anomalies: 1 },
  { id: "m5", name: "Access Log Integrity", control: "AU-3", framework: "NIST CSF", status: "passing" as MonitorStatus, lastRun: "30m ago", frequency: "Continuous", anomalies: 0 },
  { id: "m6", name: "Data Classification Sweep", control: "A.8.2", framework: "ISO 27001", status: "passing" as MonitorStatus, lastRun: "4h ago", frequency: "Daily", anomalies: 0 },
];

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
      { label: "What changed since my last visit?", prompt: "What changed in compliance since my last visit?" },
      { label: "Show critical gaps", prompt: "Show me the critical compliance gaps that need immediate attention" },
      { label: "Audit readiness briefing", prompt: "Give me a readiness briefing for the upcoming SOC 2 and ISO 27001 audits" },
      { label: "Evidence gaps before audit", prompt: "Which evidence items are overdue or pending before upcoming audits?" },
      { label: "Which attack paths does CC6.1 worsen?", prompt: "Which attack paths are made worse by the MFA gap (CC6.1)?" },
      { label: "Remediation blast radius impact", prompt: "If we fix all open compliance gaps, how would it reduce attack path blast radius?" },
      { label: "Recommend remediation steps", prompt: "Recommend remediation steps for the open compliance gaps" },
      { label: "Generate compliance report", prompt: "Generate a summary compliance report across all active frameworks" },
    ],
    greeting: `I'm monitoring compliance posture across your active frameworks. 2 critical gaps are worsening ${totalPathsExposed} attack paths affecting ${totalAssetsAffected} assets, and the ISO 27001 audit is in 56 days with 72% readiness — want to start there?`,
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

const EVIDENCE_STATUS_COLOR: Record<EvidenceStatus, string> = {
  collected: colors.success,
  pending: colors.medium,
  overdue: colors.critical,
};

const MONITOR_STATUS_COLOR: Record<MonitorStatus, string> = {
  passing: colors.success,
  failing: colors.critical,
  warning: colors.medium,
};

const MONITOR_STATUS_ICON: Record<MonitorStatus, React.ReactNode> = {
  passing: <CheckCircle2 size={11} color={colors.success} />,
  failing: <XCircle size={11} color={colors.critical} />,
  warning: <AlertCircle size={11} color={colors.medium} />,
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
        display: "inline-flex",
        alignItems: "center",
        padding: "2px 8px",
        borderRadius: 999,
        fontSize: 10,
        fontWeight: 500,
        background: hovered && onClick ? `${color}28` : `${color}14`,
        color,
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

  const registeredAssets = affectedAssets.filter(a => a.type === "registered");
  const blastAssets = affectedAssets.filter(a => a.type === "blast-radius");

  return (
    <div
      className="flex flex-col gap-[10px] p-[12px] rounded-[8px]"
      style={{ background: SEVERITY_BG[gap.severity], border: `1px solid ${SEVERITY_COLOR[gap.severity]}22` }}
    >
      <div className="flex items-start gap-[12px]">
        <div
          className="shrink-0 mt-[2px] px-[6px] py-[2px] rounded-[4px] text-[10px] font-semibold uppercase tracking-wide"
          style={{ background: SEVERITY_COLOR[gap.severity] + "22", color: SEVERITY_COLOR[gap.severity] }}
        >
          {gap.severity}
        </div>
        <div className="flex-1 min-w-0">
          <span style={{ fontSize: 11, fontWeight: 600, color: colors.textPrimary }}>{gap.title}</span>
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
              display: "inline-flex", alignItems: "center", gap: 4,
              padding: "2px 7px", borderRadius: 99, fontSize: 10, fontWeight: 600,
              background: `${SEVERITY_COLOR[gap.severity]}10`, color: SEVERITY_COLOR[gap.severity],
              border: `1px solid ${SEVERITY_COLOR[gap.severity]}2a`, cursor: "pointer", whiteSpace: "nowrap",
            }}
          >
            <Sparkles size={9} />
            Ask AI
          </button>
        </div>
      </div>

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
                <Server size={10} />{affectedAssets.length} asset{affectedAssets.length > 1 ? "s" : ""} affected:
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
            <p style={{ fontSize: 10, color: colors.textDim, lineHeight: "1.5", marginTop: 2 }}>
              <span style={{ color: colors.success, fontWeight: 600 }}>↓ Remediation impact: </span>{blastImpact}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Audit Readiness Card ── */

function AuditCard({ audit }: { audit: typeof UPCOMING_AUDITS[number] }) {
  const urgency = audit.daysUntil <= 60 ? colors.medium : colors.textDim;
  return (
    <div
      className="flex flex-col gap-[10px] p-[14px] rounded-[10px]"
      style={{ background: colors.bgCard, border: `1px solid ${colors.border}` }}
    >
      {/* Top row */}
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
          <p style={{ fontSize: 16, fontWeight: 700, color: urgency }}>{audit.daysUntil}d</p>
          <p style={{ fontSize: 9, color: colors.textDim }}>{audit.date}</p>
        </div>
      </div>

      {/* Readiness bar */}
      <div className="flex flex-col gap-[4px]">
        <div className="flex items-center justify-between">
          <span style={{ fontSize: 10, color: colors.textMuted }}>Readiness</span>
          <span style={{ fontSize: 11, fontWeight: 700, color: audit.readiness >= 85 ? colors.success : audit.readiness >= 70 ? colors.medium : colors.critical }}>
            {audit.readiness}%
          </span>
        </div>
        <div className="flex h-[4px] rounded-full overflow-hidden w-full" style={{ background: "rgba(255,255,255,0.06)" }}>
          <div
            style={{
              width: `${audit.readiness}%`,
              background: audit.readiness >= 85 ? colors.success : audit.readiness >= 70 ? colors.medium : colors.critical,
              borderRadius: 999,
              transition: "width 0.4s ease",
            }}
          />
        </div>
      </div>

      {/* Key risks */}
      {audit.keyRisks.length > 0 && (
        <div className="flex flex-col gap-[3px]">
          {audit.keyRisks.map((r, i) => (
            <div key={i} className="flex items-start gap-[5px]">
              <span className="mt-[5px] shrink-0 size-[4px] rounded-full" style={{ background: colors.medium }} />
              <span style={{ fontSize: 10, color: colors.textDim, lineHeight: 1.5 }}>{r}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Evidence Row ── */

function EvidenceRow({ item }: { item: typeof EVIDENCE_ITEMS[number] }) {
  const statusColor = EVIDENCE_STATUS_COLOR[item.status];
  const StatusIcon = item.status === "collected"
    ? <CheckCircle2 size={11} color={statusColor} />
    : item.status === "overdue"
    ? <XCircle size={11} color={statusColor} />
    : <AlertCircle size={11} color={statusColor} />;

  return (
    <div
      className="flex items-center gap-[10px] px-[12px] py-[9px] rounded-[8px]"
      style={{ background: colors.bgCard, border: `1px solid ${colors.border}` }}
    >
      <div className="shrink-0">{StatusIcon}</div>
      <div className="flex-1 min-w-0">
        <p style={{ fontSize: 11, fontWeight: 500, color: colors.textPrimary, lineHeight: 1.3 }} className="truncate">{item.name}</p>
        <p style={{ fontSize: 10, color: colors.textDim }}>{item.framework} · {item.control} · {item.collector}</p>
      </div>
      <div className="shrink-0 text-right">
        <span
          className="px-[6px] py-[2px] rounded-[4px] text-[9px] font-semibold capitalize"
          style={{ background: `${statusColor}18`, color: statusColor }}
        >
          {item.status}
        </span>
        <p style={{ fontSize: 9, color: colors.textDim, marginTop: 2 }}>Due {item.dueDate}</p>
      </div>
    </div>
  );
}

/* ── Monitoring Row ── */

function MonitorRow({ check }: { check: typeof MONITORING_CHECKS[number] }) {
  const statusColor = MONITOR_STATUS_COLOR[check.status];
  return (
    <div
      className="flex items-center gap-[10px] px-[12px] py-[9px] rounded-[8px]"
      style={{ background: colors.bgCard, border: `1px solid ${colors.border}` }}
    >
      <div className="shrink-0">{MONITOR_STATUS_ICON[check.status]}</div>
      <div className="flex-1 min-w-0">
        <p style={{ fontSize: 11, fontWeight: 500, color: colors.textPrimary, lineHeight: 1.3 }} className="truncate">{check.name}</p>
        <p style={{ fontSize: 10, color: colors.textDim }}>{check.framework} · {check.control} · {check.frequency}</p>
      </div>
      <div className="shrink-0 text-right">
        {check.anomalies > 0 && (
          <span
            className="px-[6px] py-[2px] rounded-[4px] text-[9px] font-semibold"
            style={{ background: `${statusColor}18`, color: statusColor }}
          >
            {check.anomalies} anomal{check.anomalies === 1 ? "y" : "ies"}
          </span>
        )}
        <p style={{ fontSize: 9, color: colors.textDim, marginTop: 2 }}>{check.lastRun}</p>
      </div>
    </div>
  );
}

/* ── KPI Strip ── */

function KpiCard({ label, value, sub, color }: { label: string; value: string | number; sub?: string; color?: string }) {
  return (
    <div
      className="flex flex-col gap-[2px] px-[16px] py-[12px] rounded-[10px] flex-1"
      style={{ background: colors.bgCard, border: `1px solid ${colors.border}` }}
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
  const { setPageContext } = useAiBox();

  useEffect(() => {
    setPageContext(buildPageContext());
  }, [setPageContext]);

  const criticalGaps = GAPS.filter(g => g.severity === "critical").length;
  const highGaps = GAPS.filter(g => g.severity === "high").length;
  const avgScore = Math.round(FRAMEWORKS.reduce((s, f) => s + f.score, 0) / FRAMEWORKS.length);
  const totalControls = FRAMEWORKS.reduce((s, f) => s + f.controls, 0);
  const passingControls = FRAMEWORKS.reduce((s, f) => s + f.passing, 0);
  const evidenceCollected = EVIDENCE_ITEMS.filter(e => e.status === "collected").length;
  const monitorFailing = MONITORING_CHECKS.filter(m => m.status === "failing").length;
  const nextAuditDays = Math.min(...UPCOMING_AUDITS.map(a => a.daysUntil));

  return (
    <div className="flex-1 flex flex-col overflow-y-auto" style={{ backgroundColor: colors.bgApp }}>

      {/* ── Page Header ── */}
      <div className="flex-none px-[32px] pt-[24px] pb-[20px]" style={{ borderBottom: `1px solid ${colors.border}` }}>
        <PageHeader
          icon={<Shield size={18} style={{ color: colors.accent }} />}
          title="Compliance"
          subtitle="Posture, audit readiness, evidence, and continuous controls monitoring"
          actions={
            <div className="flex items-center gap-[8px]">
              <button
                className="flex items-center gap-[6px] px-[12px] py-[7px] rounded-[8px] text-[12px] font-medium cursor-pointer transition-colors"
                style={{ background: colors.bgCard, border: `1px solid ${colors.border}`, color: colors.textMuted }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = colors.textPrimary; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = colors.textMuted; }}
              >
                <FileText size={12} />
                Export Report
              </button>
            </div>
          }
        />
      </div>

      {/* ── KPI Strip ── */}
      <div className="flex-none px-[32px] pt-[20px] pb-[4px]">
        <div className="flex gap-[10px]">
          <KpiCard label="Avg Score" value={`${avgScore}%`} sub="across 5 frameworks" color={avgScore >= 90 ? colors.success : colors.medium} />
          <KpiCard label="Critical Gaps" value={criticalGaps} sub="need immediate action" color={colors.critical} />
          <KpiCard label="High Gaps" value={highGaps} sub="open" color={colors.high} />
          <KpiCard label="Controls" value={`${passingControls}/${totalControls}`} sub="passing" color={colors.success} />
          <KpiCard label="Evidence" value={`${evidenceCollected}/${EVIDENCE_ITEMS.length}`} sub="items collected" color={evidenceCollected === EVIDENCE_ITEMS.length ? colors.success : colors.medium} />
          <KpiCard label="Next Audit" value={`${nextAuditDays}d`} sub="ISO 27001" color={nextAuditDays <= 60 ? colors.medium : colors.textPrimary} />
          <KpiCard label="Monitor Alerts" value={monitorFailing} sub="checks failing" color={monitorFailing > 0 ? colors.critical : colors.success} />
        </div>
      </div>

      {/* ── Body: two-column layout ── */}
      <div className="flex-1 px-[32px] py-[24px] flex gap-[24px] min-h-0">

        {/* Left column — Frameworks + Gaps + Policy */}
        <div className="flex-1 min-w-0 flex flex-col gap-[28px]">

          {/* Frameworks */}
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

          {/* Open Gaps */}
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

          {/* Recent Policy Changes */}
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
                    style={{ background: SEVERITY_BG[p.impact], color: SEVERITY_COLOR[p.impact] }}
                  >
                    {p.impact} impact
                  </span>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Right column — Audit Readiness + Evidence + Monitoring */}
        <div className="w-[340px] shrink-0 flex flex-col gap-[28px]">

          {/* Audit Readiness */}
          <section>
            <SectionLabel
              icon={<Calendar size={13} color={colors.textMuted} />}
              label="Audit Readiness"
              count={UPCOMING_AUDITS.length}
            />
            <div className="flex flex-col gap-[10px]">
              {UPCOMING_AUDITS.map(audit => <AuditCard key={audit.id} audit={audit} />)}
            </div>
          </section>

          {/* Evidence Collection */}
          <section>
            <div className="flex items-center justify-between mb-[10px]">
              <SectionLabel
                icon={<FolderOpen size={13} color={colors.textMuted} />}
                label="Evidence Collection"
                count={EVIDENCE_ITEMS.length}
              />
              <div className="flex items-center gap-[4px]" style={{ fontSize: 10, color: colors.textDim }}>
                <span style={{ color: colors.success, fontWeight: 600 }}>{evidenceCollected}</span>/{EVIDENCE_ITEMS.length} collected
              </div>
            </div>
            {/* Progress bar */}
            <div className="mb-[10px] flex h-[3px] rounded-full overflow-hidden w-full" style={{ background: "rgba(255,255,255,0.06)" }}>
              <div style={{ width: `${(evidenceCollected / EVIDENCE_ITEMS.length) * 100}%`, background: colors.success }} />
              <div style={{ width: `${(EVIDENCE_ITEMS.filter(e => e.status === "pending").length / EVIDENCE_ITEMS.length) * 100}%`, background: colors.medium }} />
              <div style={{ width: `${(EVIDENCE_ITEMS.filter(e => e.status === "overdue").length / EVIDENCE_ITEMS.length) * 100}%`, background: colors.critical }} />
            </div>
            <div className="flex flex-col gap-[6px]">
              {EVIDENCE_ITEMS.map(item => <EvidenceRow key={item.id} item={item} />)}
            </div>
          </section>

          {/* Continuous Monitoring */}
          <section>
            <div className="flex items-center justify-between mb-[10px]">
              <SectionLabel
                icon={<Activity size={13} color={colors.textMuted} />}
                label="Continuous Monitoring"
                count={MONITORING_CHECKS.length}
              />
              {monitorFailing > 0 && (
                <span
                  className="flex items-center gap-[4px] px-[6px] py-[2px] rounded-[4px] text-[10px] font-semibold"
                  style={{ background: `${colors.critical}18`, color: colors.critical }}
                >
                  <XCircle size={9} />
                  {monitorFailing} failing
                </span>
              )}
            </div>
            <div className="flex flex-col gap-[6px]">
              {MONITORING_CHECKS.map(check => <MonitorRow key={check.id} check={check} />)}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
