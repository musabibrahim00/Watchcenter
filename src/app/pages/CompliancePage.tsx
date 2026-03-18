import React, { useEffect } from "react";
import { CheckCircle, AlertTriangle, XCircle, Clock, TrendingUp, Shield, FileText, ArrowRight } from "lucide-react";
import { colors } from "../shared/design-system/tokens";
import { useAiBox } from "../features/ai-box";

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
  return {
    type: "general" as const,
    label: "Compliance",
    sublabel: "Posture Overview",
    contextKey: "compliance",
    suggestions: [
      { label: "What changed since my last visit?", prompt: "What changed in compliance since my last visit?" },
      { label: "Show critical gaps", prompt: "Show me the critical compliance gaps that need immediate attention" },
      { label: "Explain control AC-2", prompt: "Explain what control AC-2 requires and why it's failing" },
      { label: "Recommend remediation steps", prompt: "Recommend remediation steps for the open compliance gaps" },
      { label: "Recent policy changes", prompt: "What policy changes happened recently and what controls do they affect?" },
      { label: "Generate compliance report", prompt: "Generate a summary compliance report across all active frameworks" },
    ],
    greeting: "I'm monitoring compliance posture across your active frameworks. 2 critical gaps need attention — would you like to start there?",
  };
}

/* ================================================================
   SEVERITY HELPERS
   ================================================================ */

type Severity = "critical" | "high" | "medium" | "low";

const SEVERITY_COLOR: Record<Severity, string> = {
  critical: "#ef4444",
  high: "#f97316",
  medium: "#f59e0b",
  low: "#22c55e",
};

const SEVERITY_BG: Record<Severity, string> = {
  critical: "rgba(239,68,68,0.12)",
  high: "rgba(249,115,22,0.10)",
  medium: "rgba(245,158,11,0.10)",
  low: "rgba(34,197,94,0.10)",
};

/* ================================================================
   SUB-COMPONENTS
   ================================================================ */

function ScoreBadge({ score, trend }: { score: number; trend: string }) {
  const trendNum = parseInt(trend);
  return (
    <div className="flex items-center gap-[6px]">
      <span style={{ fontSize: 20, fontWeight: 700, color: score >= 90 ? "#22c55e" : score >= 80 ? "#f59e0b" : "#ef4444" }}>
        {score}%
      </span>
      {trendNum !== 0 && (
        <span style={{ fontSize: 11, color: trendNum > 0 ? "#22c55e" : "#ef4444" }}>
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
        <div style={{ width: passWidth, background: "#22c55e" }} />
        <div style={{ width: inProgressWidth, background: "#f59e0b" }} />
        <div style={{ width: failWidth, background: "#ef4444" }} />
      </div>
      <div className="flex gap-[14px]">
        <span style={{ fontSize: 10, color: "#22c55e" }}>{fw.passing} passing</span>
        <span style={{ fontSize: 10, color: "#f59e0b" }}>{fw.inProgress} in progress</span>
        <span style={{ fontSize: 10, color: "#ef4444" }}>{fw.failing} failing</span>
      </div>
    </div>
  );
}

function GapRow({ gap }: { gap: typeof GAPS[number] }) {
  return (
    <div
      className="flex items-start gap-[12px] p-[12px] rounded-[8px]"
      style={{ background: SEVERITY_BG[gap.severity], border: `1px solid ${SEVERITY_COLOR[gap.severity]}22` }}
    >
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
      <div className="shrink-0 flex items-center gap-[4px]" style={{ color: colors.textDim }}>
        <Clock size={11} />
        <span style={{ fontSize: 10 }}>{gap.daysOpen}d</span>
      </div>
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
        className="flex-none px-[32px] pt-[28px] pb-[20px]"
        style={{ borderBottom: `1px solid ${colors.border}` }}
      >
        <div className="flex items-end justify-between gap-[16px]">
          <div>
            <div className="flex items-center gap-[8px] mb-[4px]">
              <Shield size={14} style={{ color: "#10B981" }} />
              <span style={{ fontSize: 11, color: colors.textDim, letterSpacing: "0.06em", textTransform: "uppercase" }}>
                Compliance
              </span>
            </div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: colors.textPrimary, letterSpacing: "-0.5px" }}>
              Posture Overview
            </h1>
          </div>
          <div className="flex items-center gap-[20px]">
            <div className="text-right">
              <p style={{ fontSize: 11, color: colors.textDim }}>Avg Score</p>
              <p style={{ fontSize: 20, fontWeight: 700, color: avgScore >= 90 ? "#22c55e" : "#f59e0b" }}>{avgScore}%</p>
            </div>
            <div className="text-right">
              <p style={{ fontSize: 11, color: colors.textDim }}>Critical Gaps</p>
              <p style={{ fontSize: 20, fontWeight: 700, color: "#ef4444" }}>{criticalGaps}</p>
            </div>
            <div className="text-right">
              <p style={{ fontSize: 11, color: colors.textDim }}>High Gaps</p>
              <p style={{ fontSize: 20, fontWeight: 700, color: "#f97316" }}>{highGaps}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 px-[32px] py-[24px] flex flex-col gap-[28px]">

        {/* Frameworks grid */}
        <section>
          <div className="flex items-center gap-[8px] mb-[14px]">
            <TrendingUp size={13} style={{ color: colors.textMuted }} />
            <h2 style={{ fontSize: 12, fontWeight: 600, color: colors.textSecondary, letterSpacing: "0.06em", textTransform: "uppercase" }}>
              Active Frameworks
            </h2>
          </div>
          <div className="grid gap-[12px]" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))" }}>
            {FRAMEWORKS.map(fw => <FrameworkRow key={fw.id} fw={fw} />)}
          </div>
        </section>

        {/* Open gaps */}
        <section>
          <div className="flex items-center justify-between mb-[14px]">
            <div className="flex items-center gap-[8px]">
              <AlertTriangle size={13} style={{ color: "#f59e0b" }} />
              <h2 style={{ fontSize: 12, fontWeight: 600, color: colors.textSecondary, letterSpacing: "0.06em", textTransform: "uppercase" }}>
                Open Gaps
              </h2>
              <span
                className="px-[8px] py-[2px] rounded-full"
                style={{ fontSize: 10, background: "rgba(239,68,68,0.15)", color: "#ef4444" }}
              >
                {GAPS.length} open
              </span>
            </div>
          </div>
          <div className="flex flex-col gap-[8px]">
            {GAPS.map(gap => <GapRow key={gap.id} gap={gap} />)}
          </div>
        </section>

        {/* Recent policy changes */}
        <section>
          <div className="flex items-center gap-[8px] mb-[14px]">
            <FileText size={13} style={{ color: colors.textMuted }} />
            <h2 style={{ fontSize: 12, fontWeight: 600, color: colors.textSecondary, letterSpacing: "0.06em", textTransform: "uppercase" }}>
              Recent Policy Changes
            </h2>
          </div>
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
