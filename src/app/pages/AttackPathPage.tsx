import React, { useEffect } from "react";
import { useNavigate } from "react-router";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import {
  ChevronRight, ChevronDown, Cloud, Database, Sparkles,
} from "lucide-react";
import { colors, fontSize, fontWeight, radius } from "../shared/design-system/tokens";
import { useAiBox } from "../features/ai-box";
import { getPersonaAiBoxSuggestions } from "../shared/skills";
import { usePersona } from "../features/persona";

/* ================================================================
   DATA
   ================================================================ */

interface PathSummary {
  id: string;
  name: string;
  priority: "critical" | "high" | "medium" | "low";
  assets: number;
  misconfigurations: number;
  vulnerabilities: number;
}

const PATHS: PathSummary[] = [
  { id: "ap-001", name: "Internet-Facing Service → Database",    priority: "critical", assets: 12, misconfigurations: 8,  vulnerabilities: 15 },
  { id: "ap-002", name: "Compromised Credentials → Cloud Admin", priority: "critical", assets: 8,  misconfigurations: 5,  vulnerabilities: 3  },
  { id: "ap-003", name: "Lateral Movement via SMB",              priority: "high",     assets: 24, misconfigurations: 12, vulnerabilities: 18 },
  { id: "ap-004", name: "S3 Bucket Data Exfiltration",           priority: "high",     assets: 6,  misconfigurations: 9,  vulnerabilities: 4  },
  { id: "ap-005", name: "Container Escape → Host Takeover",      priority: "critical", assets: 18, misconfigurations: 14, vulnerabilities: 22 },
  { id: "ap-006", name: "Lambda Function Injection",             priority: "medium",   assets: 5,  misconfigurations: 3,  vulnerabilities: 6  },
  { id: "ap-007", name: "RDS Snapshot Public Exposure",          priority: "high",     assets: 10, misconfigurations: 7,  vulnerabilities: 9  },
];

const KPI = {
  total:    PATHS.length,
  critical: PATHS.filter(p => p.priority === "critical").length,
  high:     PATHS.filter(p => p.priority === "high").length,
  medium:   PATHS.filter(p => p.priority === "medium").length,
  low:      PATHS.filter(p => p.priority === "low").length,
};

/* Threat Anatomy time-series */
const THREAT_DATA = [
  { month: "Jan", vuln: 38, misconfig: 22 },
  { month: "Feb", vuln: 44, misconfig: 26 },
  { month: "Mar", vuln: 52, misconfig: 31 },
  { month: "Apr", vuln: 49, misconfig: 36 },
  { month: "May", vuln: 61, misconfig: 42 },
  { month: "Jun", vuln: 57, misconfig: 45 },
  { month: "Jul", vuln: 69, misconfig: 51 },
  { month: "Aug", vuln: 75, misconfig: 57 },
  { month: "Sep", vuln: 71, misconfig: 53 },
  { month: "Oct", vuln: 79, misconfig: 63 },
  { month: "Nov", vuln: 83, misconfig: 68 },
  { month: "Dec", vuln: 78, misconfig: 72 },
];

/* ================================================================
   PRIORITY COLORS
   ================================================================ */

const PRIORITY_COLORS: Record<string, string> = {
  critical: colors.critical,
  high:     colors.high,
  medium:   colors.medium,
  low:      colors.low,
};

/* ================================================================
   PRIORITY BADGE
   ================================================================ */

function PriorityBadge({ priority }: { priority: string }) {
  const col = PRIORITY_COLORS[priority] ?? colors.neutral;
  return (
    <span style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 5,
      padding: "4px 10px",
      borderRadius: radius.full,
      fontSize: "10px",
      fontWeight: fontWeight.semibold,
      background: `${col}18`,
      color: col,
      border: `1px solid ${col}2e`,
      textTransform: "capitalize",
      letterSpacing: "0.02em",
    }}>
      <span style={{ width: 5, height: 5, borderRadius: "50%", background: col, display: "inline-block", flexShrink: 0 }} />
      {priority}
    </span>
  );
}

/* ================================================================
   FILTER PILL
   ================================================================ */

function FilterPill({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <button
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "5px 11px",
        borderRadius: radius.sm,
        background: "rgba(255,255,255,0.04)",
        border: `1px solid ${colors.border}`,
        color: colors.textMuted,
        fontSize: fontSize.md,
        fontWeight: fontWeight.medium,
        cursor: "pointer",
        outline: "none",
        transition: "border-color 0.12s ease",
      }}
    >
      {icon}
      <span>{label}</span>
      <ChevronDown size={11} color={colors.textDim} style={{ marginLeft: 2 }} />
    </button>
  );
}

/* ================================================================
   CUSTOM TOOLTIP
   ================================================================ */

function ChartTooltip({ active, payload, label }: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "#0b1a28",
      border: `1px solid ${colors.border}`,
      borderRadius: radius.md,
      padding: "10px 14px",
      fontSize: "11px",
      boxShadow: "0 8px 24px rgba(0,0,0,0.6)",
    }}>
      <p style={{ color: colors.textDim, marginBottom: 7, fontWeight: fontWeight.medium, fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</p>
      {payload.map((entry, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: i < payload.length - 1 ? 5 : 0 }}>
          <span style={{ width: 7, height: 7, borderRadius: "50%", background: entry.color, flexShrink: 0 }} />
          <span style={{ color: colors.textSecondary, fontSize: "11px" }}>{entry.name}</span>
          <span style={{ color: entry.color, fontWeight: fontWeight.semibold, marginLeft: "auto", paddingLeft: 12 }}>{entry.value}</span>
        </div>
      ))}
    </div>
  );
}

/* ================================================================
   MAIN PAGE
   ================================================================ */

export default function AttackPathPage() {
  const navigate = useNavigate();
  const { setPageContext } = useAiBox();

  useEffect(() => {
    setPageContext({
      type: "general",
      label: "Attack Paths",
      sublabel: "Overview",
      contextKey: "attack-paths-overview",
      greeting: `There are ${KPI.total} active attack paths: ${KPI.critical} critical, ${KPI.high} high, ${KPI.medium} medium. How can I help you prioritize?`,
      suggestions: [
        { label: "Which paths pose the highest blast radius?", prompt: "Which attack paths pose the highest blast radius risk?" },
        { label: "Summarize critical paths",                   prompt: "Summarize the critical attack paths and their entry points." },
        { label: "Top mitigations across all paths",           prompt: "What mitigations would eliminate the most risk across all paths?" },
        { label: "Paths sharing misconfigurations",            prompt: "Show me paths that share common misconfigurations." },
      ],
      graphContext: {
        totalPaths: KPI.total,
        critical: KPI.critical,
        high: KPI.high,
        medium: KPI.medium,
        low: KPI.low,
      },
    });
  }, [setPageContext]);

  return (
    <div style={{
      minHeight: "100vh",
      background: colors.bgApp,
      display: "flex",
      flexDirection: "column",
    }}>

      {/* ── Page Header ── */}
      <div style={{
        padding: "24px 40px 20px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 20,
        borderBottom: `1px solid ${colors.border}`,
      }}>
        <div>
          <h1 style={{
            margin: 0,
            fontSize: "20px",
            fontWeight: fontWeight.semibold,
            color: colors.textPrimary,
            letterSpacing: "-0.02em",
            lineHeight: 1.25,
          }}>
            Attack Paths
          </h1>
          <p style={{
            margin: "3px 0 0",
            fontSize: fontSize.lg,
            color: colors.textDim,
            lineHeight: 1.4,
          }}>
            Identify and prioritize potential attack vectors across your infrastructure
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
          <FilterPill icon={<Cloud size={12} color={colors.textDim} />}     label="All Cloud Providers" />
          <FilterPill icon={<Database size={12} color={colors.textDim} />}  label="All Accounts" />
        </div>
      </div>

      {/* ── Body ── */}
      <div style={{ flex: 1, padding: "24px 40px 32px", display: "flex", flexDirection: "column", gap: 20 }}>

        {/* ── Threat Anatomy ── */}
        <div style={{
          background: colors.bgCard,
          border: `1px solid ${colors.border}`,
          borderRadius: radius.lg,
          overflow: "hidden",
        }}>
          {/* Section label row — lean, not a "card header" */}
          <div style={{
            padding: "18px 28px 0",
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
          }}>
            <div>
              <p style={{
                margin: 0,
                fontSize: "11px",
                fontWeight: fontWeight.semibold,
                color: colors.textMuted,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
              }}>
                Threat Anatomy
              </p>
              <p style={{
                margin: "3px 0 0",
                fontSize: fontSize.md,
                color: colors.textDim,
              }}>
                Vulnerability progression to active attack paths — last 12 months
              </p>
            </div>

            {/* Inline legend — right-aligned, no border below them */}
            <div style={{ display: "flex", alignItems: "center", gap: 20, paddingBottom: 2 }}>
              <LegendItem color={colors.accent} label="Vulnerability Exposure" />
              <LegendItem color={colors.high}   label="Misconfiguration Exposure" />
            </div>
          </div>

          {/* Chart */}
          <div style={{ padding: "16px 20px 20px 12px" }}>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart
                data={THREAT_DATA}
                margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="gradVuln" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor={colors.accent} stopOpacity={0.32} />
                    <stop offset="80%" stopColor={colors.accent} stopOpacity={0.04} />
                  </linearGradient>
                  <linearGradient id="gradMisconfig" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor={colors.high} stopOpacity={0.28} />
                    <stop offset="80%" stopColor={colors.high} stopOpacity={0.03} />
                  </linearGradient>
                </defs>

                <CartesianGrid
                  strokeDasharray="2 6"
                  stroke="rgba(255,255,255,0.05)"
                  vertical={false}
                />

                <XAxis
                  dataKey="month"
                  tick={{ fill: colors.textDim, fontSize: 10, fontFamily: "inherit" }}
                  axisLine={{ stroke: "rgba(255,255,255,0.06)" }}
                  tickLine={false}
                  dy={4}
                />

                <YAxis
                  tick={{ fill: colors.textDim, fontSize: 10, fontFamily: "inherit" }}
                  axisLine={false}
                  tickLine={false}
                  domain={[0, 100]}
                  tickFormatter={(v: number) => `${v}`}
                  width={32}
                />

                <Tooltip
                  content={<ChartTooltip />}
                  cursor={{ stroke: "rgba(255,255,255,0.08)", strokeWidth: 1 }}
                />

                {/* Misconfig under vuln so vuln stroke reads on top */}
                <Area
                  type="monotone"
                  dataKey="misconfig"
                  name="Misconfiguration Exposure"
                  stroke={colors.high}
                  strokeWidth={1.5}
                  fill="url(#gradMisconfig)"
                  dot={false}
                  activeDot={{ r: 3.5, fill: colors.high, stroke: colors.bgCard, strokeWidth: 2 }}
                />
                <Area
                  type="monotone"
                  dataKey="vuln"
                  name="Vulnerability Exposure"
                  stroke={colors.accent}
                  strokeWidth={2}
                  fill="url(#gradVuln)"
                  dot={false}
                  activeDot={{ r: 3.5, fill: colors.accent, stroke: colors.bgCard, strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ── KPI Row ── */}
        <div style={{ display: "flex", gap: 12 }}>
          <KpiCard label="Total Attack Paths" value={KPI.total}    color={colors.accent}   />
          <KpiCard label="Critical"            value={KPI.critical} color={colors.critical} />
          <KpiCard label="High"                value={KPI.high}     color={colors.high}     />
          <KpiCard label="Medium"              value={KPI.medium}   color={colors.medium}   />
          <KpiCard label="Low"                 value={KPI.low}      color={colors.low}      />
        </div>

        {/* ── Attack Paths Table ── */}
        <div style={{
          background: colors.bgCard,
          border: `1px solid ${colors.border}`,
          borderRadius: radius.lg,
          overflow: "hidden",
        }}>
          {/* Table bar */}
          <div style={{
            padding: "14px 28px",
            borderBottom: `1px solid ${colors.border}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}>
            <span style={{
              fontSize: fontSize.lg,
              fontWeight: fontWeight.semibold,
              color: colors.textPrimary,
            }}>
              Attack Paths Overview
            </span>
            <span style={{
              fontSize: "10px",
              fontWeight: fontWeight.semibold,
              color: colors.textDim,
              background: "rgba(255,255,255,0.05)",
              border: `1px solid ${colors.border}`,
              borderRadius: radius.full,
              padding: "2px 9px",
              letterSpacing: "0.03em",
            }}>
              {PATHS.length} paths
            </span>
          </div>

          {/* Column headers */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 88px 120px 100px 120px 24px",
            padding: "8px 28px",
            background: colors.tableHeaderBg,
            borderBottom: `1px solid ${colors.border}`,
          }}>
            {["Attack Path", "Assets", "Misconfigs", "Vulns", "Priority", ""].map((col, i) => (
              <span key={i} style={{
                fontSize: "10px",
                fontWeight: fontWeight.semibold,
                color: colors.textMuted,
                textTransform: "uppercase",
                letterSpacing: "0.07em",
              }}>
                {col}
              </span>
            ))}
          </div>

          {/* Rows */}
          {PATHS.map((path, idx) => (
            <PathRow key={path.id} path={path} last={idx === PATHS.length - 1} />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ================================================================
   LEGEND ITEM
   ================================================================ */

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
      <span style={{
        width: 24,
        height: 2,
        borderRadius: 2,
        background: color,
        display: "inline-block",
        flexShrink: 0,
      }} />
      <span style={{ fontSize: "10px", color: colors.textDim, whiteSpace: "nowrap" }}>{label}</span>
    </div>
  );
}

/* ================================================================
   KPI CARD
   ================================================================ */

function KpiCard({ label, value, color }: {
  label: string;
  value: number;
  color: string;
}) {
  const isTotal = color === colors.accent;
  const displayColor = value === 0 ? colors.textDim : isTotal ? colors.textPrimary : color;

  return (
    <div style={{
      flex: 1,
      background: colors.bgCard,
      border: `1px solid ${colors.border}`,
      borderTop: `2px solid ${value === 0 ? colors.border : color}`,
      borderRadius: radius.lg,
      padding: "18px 22px 20px",
      display: "flex",
      flexDirection: "column",
      gap: 0,
    }}>
      <span style={{
        fontSize: "11px",
        fontWeight: fontWeight.semibold,
        color: colors.textMuted,
        textTransform: "uppercase",
        letterSpacing: "0.07em",
        marginBottom: 10,
        display: "block",
      }}>
        {label}
      </span>

      <span style={{
        fontSize: "36px",
        fontWeight: fontWeight.bold,
        color: displayColor,
        lineHeight: 1,
        letterSpacing: "-0.03em",
        display: "block",
      }}>
        {value}
      </span>
    </div>
  );
}

/* ================================================================
   TABLE ROW
   ================================================================ */

function PathRow({ path, last }: { path: PathSummary; last: boolean }) {
  const navigate = useNavigate();
  const { openWithContext } = useAiBox();
  const { persona } = usePersona();
  const [hovered, setHovered] = React.useState(false);

  function handleAskAI(e: React.MouseEvent) {
    e.stopPropagation();
    openWithContext({
      type: "general",
      label: path.name,
      sublabel: "Attack Path",
      contextKey: `attack-path-overview-ask:${path.id}`,
      greeting: `I have the **${path.name}** attack path loaded. Priority: **${path.priority}** — ${path.assets} assets, ${path.vulnerabilities} vulnerabilities, ${path.misconfigurations} misconfigurations. What would you like to know?`,
      suggestions: getPersonaAiBoxSuggestions("attack-path", persona, path.name, undefined, path.id),
      graphContext: {
        pathId: path.id,
        priority: path.priority,
        assets: path.assets,
        vulnerabilities: path.vulnerabilities,
        misconfigurations: path.misconfigurations,
      },
    });
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => navigate(`/attack-paths/${path.id}`)}
      onKeyDown={e => e.key === "Enter" && navigate(`/attack-paths/${path.id}`)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 88px 120px 100px 120px 24px",
        padding: "15px 28px",
        alignItems: "center",
        background: hovered ? colors.tableRowHoverBg : colors.tableRowBg,
        borderBottom: last ? "none" : `1px solid ${colors.divider}`,
        cursor: "pointer",
        transition: "background 0.12s ease",
        outline: "none",
      }}
    >
      {/* Name + Ask AI */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
        <span style={{
          width: 7,
          height: 7,
          borderRadius: "50%",
          background: PRIORITY_COLORS[path.priority] ?? colors.neutral,
          flexShrink: 0,
        }} />
        <span style={{
          fontSize: fontSize.lg,
          color: hovered ? colors.accent : colors.textPrimary,
          fontWeight: fontWeight.medium,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          transition: "color 0.12s ease",
          minWidth: 0,
        }}>
          {path.name}
        </span>
        <button
          onClick={handleAskAI}
          title="Ask AI about this path"
          style={{
            flexShrink: 0,
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
            padding: "3px 8px",
            borderRadius: radius.full,
            fontSize: "10px",
            fontWeight: fontWeight.semibold,
            background: hovered ? `${colors.accent}1a` : `${colors.accent}08`,
            color: hovered ? colors.accent : colors.textDim,
            border: `1px solid ${hovered ? colors.accent + "38" : colors.accent + "14"}`,
            cursor: "pointer",
            whiteSpace: "nowrap",
            transition: "all 0.15s ease",
            opacity: hovered ? 1 : 0.6,
          }}
        >
          <Sparkles size={9} />
          Ask AI
        </button>
      </div>

      {/* Assets */}
      <span style={{ fontSize: fontSize.lg, color: colors.textSecondary, fontWeight: fontWeight.medium }}>
        {path.assets}
      </span>

      {/* Misconfigs */}
      <span style={{ fontSize: fontSize.lg, color: colors.textSecondary, fontWeight: fontWeight.medium }}>
        {path.misconfigurations}
      </span>

      {/* Vulns */}
      <span style={{ fontSize: fontSize.lg, color: colors.textSecondary, fontWeight: fontWeight.medium }}>
        {path.vulnerabilities}
      </span>

      {/* Priority */}
      <PriorityBadge priority={path.priority} />

      {/* Chevron */}
      <ChevronRight
        size={13}
        color={hovered ? colors.accent : colors.border}
        style={{ transition: "color 0.12s ease", justifySelf: "end" }}
      />
    </div>
  );
}
