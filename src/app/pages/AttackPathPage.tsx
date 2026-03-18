import React, { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router";
import { colors } from "../shared/design-system/tokens";
import { Badge } from "../shared/components/ui/Badge";
import { useAiBox } from "../features/ai-box";

/* ================================================================
   TYPES
   ================================================================ */

type Severity = "critical" | "high" | "medium" | "low";
type PathStatus = "active" | "mitigated" | "acknowledged";

interface AttackPathItem {
  id: string;
  name: string;
  severity: Severity;
  entryPoint: string;
  targetAsset: string;
  riskSummary: string;
  lastUpdated: string;
  status: PathStatus;
  assets: number;
  misconfigurations: number;
  vulnerabilities: number;
  hops: string[];
  mitigations: string[];
}

/* ================================================================
   MOCK DATA
   ================================================================ */

const ATTACK_PATHS: AttackPathItem[] = [
  {
    id: "ap-001",
    name: "Internet-facing service → Database",
    severity: "critical",
    entryPoint: "Jenkins (port 8080, public)",
    targetAsset: "finance-db-01 (RDS)",
    riskSummary:
      "Unauthenticated access to Jenkins allows arbitrary code execution, enabling credential theft and lateral movement to the production database.",
    lastUpdated: "2 hours ago",
    status: "active",
    assets: 12,
    misconfigurations: 8,
    vulnerabilities: 15,
    hops: [
      "Internet",
      "Jenkins Server (CVE-2018-15133)",
      "Credential Theft",
      "Internal VPC",
      "finance-db-01",
    ],
    mitigations: [
      "Restrict Jenkins to VPN access only",
      "Rotate all credentials stored in Jenkins",
      "Enable WAF rules for port 8080",
      "Implement network segmentation for database tier",
    ],
  },
  {
    id: "ap-002",
    name: "Compromised credentials → Cloud admin",
    severity: "critical",
    entryPoint: "Phishing / leaked IAM keys",
    targetAsset: "AWS Root Account",
    riskSummary:
      "Exposed IAM credentials with excessive permissions allow direct escalation to cloud administrator, giving full account control.",
    lastUpdated: "4 hours ago",
    status: "active",
    assets: 8,
    misconfigurations: 5,
    vulnerabilities: 3,
    hops: [
      "Phishing Email",
      "Exposed IAM Keys",
      "Privilege Escalation",
      "AWS Admin Role",
      "Root Account Access",
    ],
    mitigations: [
      "Enable MFA on all IAM users",
      "Rotate all exposed credentials immediately",
      "Apply least-privilege IAM policies",
      "Enable CloudTrail anomaly detection",
    ],
  },
  {
    id: "ap-003",
    name: "Lateral movement via SMB",
    severity: "high",
    entryPoint: "Workstation (SMB exploit)",
    targetAsset: "Domain Controller",
    riskSummary:
      "Unpatched SMB vulnerability allows lateral movement from a compromised workstation to the domain controller, enabling full domain takeover.",
    lastUpdated: "1 day ago",
    status: "acknowledged",
    assets: 24,
    misconfigurations: 12,
    vulnerabilities: 18,
    hops: [
      "Compromised Workstation",
      "SMB Exploit (MS17-010)",
      "Pass-the-Hash",
      "Admin Share",
      "Domain Controller",
    ],
    mitigations: [
      "Patch MS17-010 across all workstations",
      "Block SMB on network perimeter",
      "Enable Windows Defender Credential Guard",
      "Segment workstations from critical infrastructure",
    ],
  },
  {
    id: "ap-004",
    name: "Container escape → Host access",
    severity: "high",
    entryPoint: "Misconfigured container runtime",
    targetAsset: "Kubernetes node (k8s-node-04)",
    riskSummary:
      "A container running with elevated privileges can escape to the host OS, gaining access to the underlying Kubernetes node and other containers.",
    lastUpdated: "6 hours ago",
    status: "active",
    assets: 6,
    misconfigurations: 9,
    vulnerabilities: 4,
    hops: [
      "Internet",
      "Web Application",
      "Container Breakout",
      "Host Filesystem",
      "Kubernetes Node",
    ],
    mitigations: [
      "Remove privileged container configurations",
      "Enable seccomp and AppArmor profiles",
      "Restrict host volume mounts",
      "Upgrade container runtime to latest version",
    ],
  },
  {
    id: "ap-005",
    name: "Privilege escalation path",
    severity: "medium",
    entryPoint: "Low-privileged user account",
    targetAsset: "Server admin access",
    riskSummary:
      "A misconfigured sudo rule allows a low-privileged user to escalate to root on several production servers.",
    lastUpdated: "2 days ago",
    status: "acknowledged",
    assets: 15,
    misconfigurations: 7,
    vulnerabilities: 11,
    hops: [
      "Low-privilege User",
      "Misconfigured sudo",
      "SUID Binary Exploit",
      "Root Shell",
      "Server Admin",
    ],
    mitigations: [
      "Audit and restrict sudo rules",
      "Remove SUID bit from non-essential binaries",
      "Implement PAM rules for privilege escalation",
      "Review service account permissions",
    ],
  },
  {
    id: "ap-006",
    name: "API misconfiguration chain",
    severity: "medium",
    entryPoint: "Exposed internal API",
    targetAsset: "Customer data store",
    riskSummary:
      "An internal API exposed without authentication allows unauthorized access to customer records through a series of misconfigured endpoints.",
    lastUpdated: "3 days ago",
    status: "mitigated",
    assets: 9,
    misconfigurations: 14,
    vulnerabilities: 6,
    hops: [
      "Internet",
      "Exposed API Gateway",
      "Unauthenticated Endpoint",
      "Data Access Layer",
      "Customer Database",
    ],
    mitigations: [
      "Add API key authentication to all endpoints",
      "Implement rate limiting",
      "Enable API gateway access logging",
      "Review CORS policies",
    ],
  },
  {
    id: "ap-007",
    name: "Network segmentation bypass",
    severity: "low",
    entryPoint: "Misconfigured firewall rule",
    targetAsset: "Internal services",
    riskSummary:
      "An overly permissive firewall rule allows traffic between network segments that should be isolated, potentially exposing internal services.",
    lastUpdated: "5 days ago",
    status: "acknowledged",
    assets: 18,
    misconfigurations: 3,
    vulnerabilities: 8,
    hops: [
      "External Network",
      "Firewall Bypass",
      "Internal Segment",
      "Service Discovery",
      "Internal Services",
    ],
    mitigations: [
      "Review and tighten firewall ruleset",
      "Implement zero-trust network policies",
      "Enable network traffic monitoring",
      "Conduct firewall rule audit",
    ],
  },
];

const KPI_DATA = [
  {
    label: "Critical Attack Paths",
    value: 2,
    color: colors.critical,
    delta: "+1 since last scan",
  },
  {
    label: "Internet-Reachable Assets",
    value: 34,
    color: "#f97316",
    delta: "6 at critical risk",
  },
  {
    label: "Crown Jewel Exposure",
    value: 3,
    color: "#a78bfa",
    delta: "finance-db-01, root acct, DC",
  },
  {
    label: "Require Immediate Action",
    value: 4,
    color: colors.high,
    delta: "2 unacknowledged",
  },
];

/* ================================================================
   HELPERS
   ================================================================ */

const severityColor: Record<Severity, string> = {
  critical: colors.critical,
  high: colors.high,
  medium: colors.medium,
  low: colors.low,
};

const statusConfig: Record<PathStatus, { label: string; color: string; bg: string }> = {
  active: { label: "Active", color: "#ef4444", bg: "rgba(239,68,68,0.08)" },
  acknowledged: { label: "Acknowledged", color: "#f59e0b", bg: "rgba(245,158,11,0.08)" },
  mitigated: { label: "Mitigated", color: "#2fd897", bg: "rgba(47,216,151,0.08)" },
};

function buildPageContext() {
  return {
    type: "general" as const,
    label: "Attack Path",
    sublabel: "Page Context",
    contextKey: "attack-path-page",
    greeting:
      "I have **Attack Path** context loaded. I can help you understand your attack surface, explain specific paths, or help prioritize remediation.",
    suggestions: [
      { label: "Summarize critical paths", prompt: "Summarize all critical attack paths on this page" },
      { label: "What needs immediate action?", prompt: "Which attack paths require immediate action?" },
      { label: "Crown jewel exposure", prompt: "Which crown jewel assets are exposed in these attack paths?" },
      { label: "Top mitigations", prompt: "What are the top mitigations to reduce attack surface?" },
      { label: "Investigate top threat", prompt: "Help me investigate the highest-risk attack path" },
    ],
  };
}

function buildPathContext(path: AttackPathItem) {
  return {
    type: "general" as const,
    label: path.name,
    sublabel: "Attack Path Context",
    contextKey: `attack-path:${path.id}`,
    greeting: `I have the **${path.name}** attack path loaded. Entry: ${path.entryPoint} → Target: ${path.targetAsset}. I can explain the path, recommend mitigations, or help create a remediation case.`,
    suggestions: [
      { label: "Explain this path", prompt: `Explain the attack path: ${path.name}` },
      { label: "What makes this critical?", prompt: `Why is "${path.name}" considered ${path.severity} severity?` },
      { label: "Show impacted assets", prompt: `What assets are impacted by the "${path.name}" attack path?` },
      { label: "Recommend mitigations", prompt: `What are the recommended mitigations for the "${path.name}" attack path?` },
      { label: "Create remediation workflow", prompt: `Create a remediation workflow for the "${path.name}" attack path` },
    ],
  };
}

/* ================================================================
   PAGE
   ================================================================ */

export default function AttackPathPage() {
  const navigate = useNavigate();
  const { openWithContext, setPageContext } = useAiBox();

  const [selectedPath, setSelectedPath] = useState<AttackPathItem | null>(null);
  const [search, setSearch] = useState("");
  const [filterSeverity, setFilterSeverity] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  // Set ambient AIBox context for this page on mount
  useEffect(() => {
    setPageContext(buildPageContext());
  }, [setPageContext]);

  // Update AIBox context when selected path changes
  useEffect(() => {
    if (selectedPath) {
      setPageContext(buildPathContext(selectedPath));
    } else {
      setPageContext(buildPageContext());
    }
  }, [selectedPath, setPageContext]);

  const filtered = ATTACK_PATHS.filter((p) => {
    const q = search.toLowerCase();
    const matchSearch =
      p.name.toLowerCase().includes(q) ||
      p.entryPoint.toLowerCase().includes(q) ||
      p.targetAsset.toLowerCase().includes(q);
    const matchSev = filterSeverity === "all" || p.severity === filterSeverity;
    const matchStatus = filterStatus === "all" || p.status === filterStatus;
    return matchSearch && matchSev && matchStatus;
  });

  const handleOpenPath = useCallback((path: AttackPathItem) => {
    setSelectedPath((prev) => (prev?.id === path.id ? null : path));
  }, []);

  const handleAIAction = useCallback(
    (path: AttackPathItem, prompt: string) => {
      openWithContext({ ...buildPathContext(path), initialQuery: prompt });
    },
    [openWithContext]
  );

  const handleViewFullGraph = useCallback(
    (path: AttackPathItem) => {
      navigate(`/attack-paths/${path.id}`);
    },
    [navigate]
  );

  return (
    <div
      className="flex flex-col gap-6 p-6"
      style={{ backgroundColor: colors.bgApp, minHeight: "100vh", maxWidth: "100%", overflowX: "hidden" }}
    >
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1
            className="text-[28px] font-semibold tracking-tight"
            style={{ color: colors.textPrimary }}
          >
            Attack Path
          </h1>
          <p className="mt-1 text-[12px]" style={{ color: colors.textMuted }}>
            Understand how an attacker could move from an exposed entry point to your
            highest-value targets
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Search */}
          <div className="relative flex items-center">
            <svg
              className="absolute left-[9px] pointer-events-none"
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
              style={{ opacity: 0.35 }}
            >
              <circle cx="5" cy="5" r="3.5" stroke={colors.textMuted} strokeWidth="1.2" />
              <path
                d="M7.5 7.5L10 10"
                stroke={colors.textMuted}
                strokeWidth="1.2"
                strokeLinecap="round"
              />
            </svg>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search paths, assets…"
              className="pl-[28px] pr-[10px] py-[7px] text-[11px] rounded-lg border bg-transparent outline-none"
              style={{
                color: colors.textSecondary,
                borderColor: colors.border,
                backgroundColor: colors.bgPanel,
                width: 180,
              }}
            />
          </div>

          {/* Severity filter */}
          <select
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value)}
            className="px-3 py-[7px] text-[11px] rounded-lg border bg-transparent cursor-pointer outline-none"
            style={{
              color: colors.textSecondary,
              borderColor: colors.border,
              backgroundColor: colors.bgPanel,
            }}
          >
            <option value="all">All Severities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          {/* Status filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-[7px] text-[11px] rounded-lg border bg-transparent cursor-pointer outline-none"
            style={{
              color: colors.textSecondary,
              borderColor: colors.border,
              backgroundColor: colors.bgPanel,
            }}
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="acknowledged">Acknowledged</option>
            <option value="mitigated">Mitigated</option>
          </select>

          {/* Export */}
          <HeaderButton
            icon={
              <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                <path
                  d="M5.5 1v7M2.5 5.5l3 3 3-3M1 9.5h9"
                  stroke={colors.textSecondary}
                  strokeWidth="1.1"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            }
            label="Export"
            onClick={() => {}}
          />

          {/* Investigate — opens AIBox */}
          <button
            onClick={() => openWithContext(buildPageContext())}
            className="flex items-center gap-[6px] px-3 py-[7px] rounded-lg text-[11px] font-medium border transition-colors"
            style={{
              color: colors.accent,
              borderColor: "rgba(87,177,255,0.22)",
              backgroundColor: "rgba(87,177,255,0.06)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "rgba(87,177,255,0.12)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "rgba(87,177,255,0.06)";
            }}
          >
            <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
              <circle cx="5.5" cy="5.5" r="4" stroke={colors.accent} strokeWidth="1.1" />
              <path
                d="M5.5 3.5V5.5M5.5 7.5V7.6"
                stroke={colors.accent}
                strokeWidth="1.1"
                strokeLinecap="round"
              />
            </svg>
            Investigate
          </button>
        </div>
      </div>

      {/* ── KPI Row ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-4 gap-4">
        {KPI_DATA.map((kpi) => (
          <KPICard key={kpi.label} {...kpi} />
        ))}
      </div>

      {/* ── Main content ────────────────────────────────────────────────── */}
      <div className="flex gap-4 items-start">
        {/* Path list */}
        <div
          className="flex flex-col gap-3"
          style={{ width: selectedPath ? 420 : undefined, minWidth: selectedPath ? 420 : undefined, flex: selectedPath ? undefined : 1 }}
        >
          {/* Section label + count */}
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium" style={{ color: colors.textSecondary }}>
              Attack Paths
            </span>
            <span className="text-[10px]" style={{ color: colors.textDim }}>
              {filtered.length} of {ATTACK_PATHS.length}
            </span>
          </div>

          {filtered.length === 0 ? (
            <div
              className="rounded-[14px] border p-8 text-center"
              style={{ backgroundColor: colors.bgPanel, borderColor: colors.border }}
            >
              <p className="text-[12px]" style={{ color: colors.textMuted }}>
                No attack paths match your filters.
              </p>
            </div>
          ) : (
            filtered.map((path) => (
              <PathCard
                key={path.id}
                path={path}
                isSelected={selectedPath?.id === path.id}
                onOpen={handleOpenPath}
                onAIAction={handleAIAction}
              />
            ))
          )}
        </div>

        {/* Detail panel */}
        {selectedPath && (
          <div className="flex-1 min-w-0">
            <PathDetailPanel
              path={selectedPath}
              onClose={() => setSelectedPath(null)}
              onAIAction={handleAIAction}
              onViewFullGraph={handleViewFullGraph}
            />
          </div>
        )}
      </div>
    </div>
  );
}

/* ================================================================
   KPI CARD
   ================================================================ */

function KPICard({
  label,
  value,
  color,
  delta,
}: {
  label: string;
  value: number;
  color: string;
  delta: string;
}) {
  return (
    <div
      className="rounded-[14px] border p-5"
      style={{ backgroundColor: colors.bgPanel, borderColor: colors.border }}
    >
      <div
        className="text-[10px] uppercase tracking-wider mb-2"
        style={{ color: colors.textMuted }}
      >
        {label}
      </div>
      <div className="text-[32px] font-semibold leading-none mb-2" style={{ color }}>
        {value}
      </div>
      <div className="text-[10px]" style={{ color: colors.textDim }}>
        {delta}
      </div>
    </div>
  );
}

/* ================================================================
   PATH CARD
   ================================================================ */

function PathCard({
  path,
  isSelected,
  onOpen,
  onAIAction,
}: {
  path: AttackPathItem;
  isSelected: boolean;
  onOpen: (p: AttackPathItem) => void;
  onAIAction: (p: AttackPathItem, prompt: string) => void;
}) {
  const sColor = severityColor[path.severity];
  const sStatus = statusConfig[path.status];

  return (
    <div
      className="rounded-[14px] border transition-all cursor-pointer"
      style={{
        backgroundColor: isSelected ? "rgba(87,177,255,0.04)" : colors.bgPanel,
        borderColor: isSelected ? "rgba(87,177,255,0.28)" : colors.border,
      }}
      onClick={() => onOpen(path)}
    >
      {/* Top row: name + badges */}
      <div className="px-4 pt-4 pb-3 flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span
              className="inline-block w-[7px] h-[7px] rounded-full shrink-0"
              style={{ backgroundColor: sColor }}
            />
            <span
              className="text-[12px] font-medium truncate"
              style={{ color: colors.textPrimary }}
            >
              {path.name}
            </span>
          </div>
          <p
            className="text-[10px] leading-[14px] line-clamp-2"
            style={{ color: colors.textMuted }}
          >
            {path.riskSummary}
          </p>
        </div>
        <div className="flex flex-col items-end gap-[5px] shrink-0">
          <Badge tone={path.severity}>{path.severity}</Badge>
          <span
            className="text-[9px] px-[6px] py-[2px] rounded-[4px] font-medium"
            style={{ color: sStatus.color, backgroundColor: sStatus.bg }}
          >
            {sStatus.label}
          </span>
        </div>
      </div>

      {/* Entry → Target row */}
      <div
        className="px-4 pb-3 flex items-center gap-3 flex-wrap border-t"
        style={{ borderColor: colors.border, paddingTop: 10 }}
      >
        <div>
          <div
            className="text-[9px] uppercase tracking-wider mb-[2px]"
            style={{ color: colors.textDim }}
          >
            Entry Point
          </div>
          <div className="text-[10px] font-medium" style={{ color: colors.textSecondary }}>
            {path.entryPoint}
          </div>
        </div>

        <svg
          width="14"
          height="8"
          viewBox="0 0 14 8"
          fill="none"
          className="shrink-0"
          style={{ opacity: 0.25 }}
        >
          <path
            d="M1 4H13M9.5 1L13 4L9.5 7"
            stroke={colors.textMuted}
            strokeWidth="1"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>

        <div>
          <div
            className="text-[9px] uppercase tracking-wider mb-[2px]"
            style={{ color: colors.textDim }}
          >
            Target Asset
          </div>
          <div className="text-[10px] font-medium" style={{ color: colors.textSecondary }}>
            {path.targetAsset}
          </div>
        </div>

        <div className="ml-auto text-[9px]" style={{ color: colors.textDim }}>
          Updated {path.lastUpdated}
        </div>
      </div>

      {/* Metrics + AI actions row */}
      <div
        className="px-4 pb-3 flex items-center gap-4 border-t"
        style={{ borderColor: colors.border, paddingTop: 10 }}
      >
        <MetricPill label="Assets" value={path.assets} color={colors.textSecondary} />
        <MetricPill label="Misconfigs" value={path.misconfigurations} color={colors.medium} />
        <MetricPill label="Vulns" value={path.vulnerabilities} color={sColor} />

        {/* AI actions — stop propagation so they don't toggle the detail panel */}
        <div
          className="ml-auto flex items-center gap-[6px]"
          onClick={(e) => e.stopPropagation()}
        >
          <AIChip
            label="Explain"
            onClick={() =>
              onAIAction(path, `Explain the attack path: ${path.name}`)
            }
          />
          <AIChip
            label="Investigate"
            onClick={() =>
              onAIAction(
                path,
                `Help me investigate the "${path.name}" attack path`
              )
            }
          />
          <AIChip
            label="Create Case"
            onClick={() =>
              onAIAction(
                path,
                `Create an investigation case for the "${path.name}" attack path`
              )
            }
          />
        </div>
      </div>
    </div>
  );
}

/* ================================================================
   PATH DETAIL PANEL
   ================================================================ */

function PathDetailPanel({
  path,
  onClose,
  onAIAction,
  onViewFullGraph,
}: {
  path: AttackPathItem;
  onClose: () => void;
  onAIAction: (p: AttackPathItem, prompt: string) => void;
  onViewFullGraph: (p: AttackPathItem) => void;
}) {
  const sStatus = statusConfig[path.status];

  return (
    <div
      className="rounded-[14px] border overflow-hidden"
      style={{ backgroundColor: colors.bgPanel, borderColor: colors.border }}
    >
      {/* Panel header */}
      <div
        className="px-5 py-4 flex items-center justify-between border-b"
        style={{ borderColor: colors.border }}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className="text-[13px] font-semibold truncate"
              style={{ color: colors.textPrimary }}
            >
              {path.name}
            </span>
            <Badge tone={path.severity}>{path.severity}</Badge>
            <span
              className="text-[9px] px-[6px] py-[2px] rounded-[4px] font-medium shrink-0"
              style={{ color: sStatus.color, backgroundColor: sStatus.bg }}
            >
              {sStatus.label}
            </span>
          </div>
          <div className="text-[10px] mt-[3px]" style={{ color: colors.textMuted }}>
            Path overview · Updated {path.lastUpdated}
          </div>
        </div>

        <div className="flex items-center gap-2 ml-3 shrink-0">
          <button
            onClick={() => onViewFullGraph(path)}
            className="flex items-center gap-[5px] px-3 py-[6px] text-[10px] font-medium rounded-lg border transition-colors"
            style={{
              color: colors.accent,
              borderColor: "rgba(87,177,255,0.22)",
              backgroundColor: "rgba(87,177,255,0.06)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "rgba(87,177,255,0.12)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "rgba(87,177,255,0.06)";
            }}
          >
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <rect
                x="1"
                y="1"
                width="8"
                height="8"
                rx="1.5"
                stroke={colors.accent}
                strokeWidth="0.9"
              />
              <path
                d="M6 1v3h3"
                stroke={colors.accent}
                strokeWidth="0.9"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Full Graph
          </button>

          <button
            onClick={onClose}
            className="w-[28px] h-[28px] flex items-center justify-center rounded-lg border transition-colors"
            style={{
              color: colors.textDim,
              borderColor: colors.border,
              backgroundColor: "transparent",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.04)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
            }}
          >
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path
                d="M1.5 1.5L8.5 8.5M8.5 1.5L1.5 8.5"
                stroke={colors.textDim}
                strokeWidth="1.2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
      </div>

      <div className="p-5 flex flex-col gap-5">
        {/* Risk overview */}
        <div>
          <SectionLabel>Risk Overview</SectionLabel>
          <p
            className="text-[11px] leading-[17px]"
            style={{ color: colors.textSecondary }}
          >
            {path.riskSummary}
          </p>
        </div>

        {/* Entry + Target */}
        <div className="grid grid-cols-2 gap-3">
          <InfoBlock
            label="Entry Point"
            value={path.entryPoint}
            accentColor="#ef4444"
          />
          <InfoBlock
            label="Target Asset"
            value={path.targetAsset}
            accentColor="#a78bfa"
          />
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-3 gap-3">
          <MetricBlock label="Assets at Risk" value={path.assets} color={colors.textSecondary} />
          <MetricBlock label="Misconfigurations" value={path.misconfigurations} color={colors.medium} />
          <MetricBlock label="Vulnerabilities" value={path.vulnerabilities} color={severityColor[path.severity]} />
        </div>

        {/* Attack flow */}
        <div>
          <SectionLabel>Attack Flow</SectionLabel>
          <div className="flex flex-col">
            {path.hops.map((hop, i) => (
              <PathHop
                key={i}
                hop={hop}
                index={i}
                isFirst={i === 0}
                isLast={i === path.hops.length - 1}
                severity={path.severity}
              />
            ))}
          </div>
        </div>

        {/* Suggested mitigations */}
        <div>
          <SectionLabel>Suggested Mitigations</SectionLabel>
          <div className="flex flex-col gap-[7px]">
            {path.mitigations.map((m, i) => (
              <div key={i} className="flex items-start gap-2">
                <div
                  className="w-[5px] h-[5px] rounded-full shrink-0 mt-[5px]"
                  style={{ backgroundColor: "#2fd897", opacity: 0.55 }}
                />
                <span
                  className="text-[10px] leading-[15px]"
                  style={{ color: colors.textSecondary }}
                >
                  {m}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* AI action chips */}
        <div
          className="flex flex-wrap gap-2 pt-2 border-t"
          style={{ borderColor: colors.border }}
        >
          {[
            {
              label: "Explain this path",
              prompt: `Explain the attack path: ${path.name}`,
            },
            {
              label: "Recommend Fix",
              prompt: `What are the recommended mitigations for "${path.name}"?`,
            },
            {
              label: "Investigate",
              prompt: `Help me investigate the "${path.name}" attack path`,
            },
            {
              label: "Create Case",
              prompt: `Create an investigation case for the "${path.name}" attack path`,
            },
          ].map(({ label, prompt }) => (
            <button
              key={label}
              onClick={() => onAIAction(path, prompt)}
              className="px-3 py-[6px] text-[10px] font-medium rounded-lg border transition-colors"
              style={{
                color: colors.accent,
                borderColor: "rgba(87,177,255,0.18)",
                backgroundColor: "rgba(87,177,255,0.05)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "rgba(87,177,255,0.11)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "rgba(87,177,255,0.05)";
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ================================================================
   PATH HOP — step-by-step attack flow item
   ================================================================ */

function PathHop({
  hop,
  index,
  isFirst,
  isLast,
  severity,
}: {
  hop: string;
  index: number;
  isFirst: boolean;
  isLast: boolean;
  severity: Severity;
}) {
  const sColor = severityColor[severity];
  const dotColor = isFirst ? "#ef4444" : isLast ? "#a78bfa" : sColor;

  return (
    <div className="flex items-stretch gap-3">
      {/* Timeline column */}
      <div className="flex flex-col items-center" style={{ width: 20, minWidth: 20 }}>
        <div
          className="w-[10px] h-[10px] rounded-full shrink-0 mt-[7px] z-10"
          style={{
            backgroundColor: dotColor,
            opacity: isFirst || isLast ? 1 : 0.5,
            border: `1.5px solid ${dotColor}`,
          }}
        />
        {!isLast && (
          <div
            className="flex-1 w-[1px] my-[2px]"
            style={{ backgroundColor: "rgba(87,177,255,0.10)" }}
          />
        )}
      </div>

      {/* Hop content */}
      <div
        className="flex-1 rounded-[8px] px-3 py-[7px] mb-[5px]"
        style={{
          backgroundColor: isFirst
            ? "rgba(239,68,68,0.04)"
            : isLast
            ? "rgba(167,139,250,0.05)"
            : "rgba(255,255,255,0.02)",
          border: `1px solid ${
            isFirst
              ? "rgba(239,68,68,0.12)"
              : isLast
              ? "rgba(167,139,250,0.12)"
              : "rgba(255,255,255,0.04)"
          }`,
        }}
      >
        <div className="flex items-center justify-between">
          <span
            className="text-[11px] font-medium"
            style={{
              color: isFirst ? "#ef4444" : isLast ? "#a78bfa" : colors.textSecondary,
            }}
          >
            {hop}
          </span>
          {isFirst && (
            <span
              className="text-[8px] px-[5px] py-[1px] rounded-[3px]"
              style={{ color: "#ef4444", backgroundColor: "rgba(239,68,68,0.10)" }}
            >
              Entry
            </span>
          )}
          {isLast && (
            <span
              className="text-[8px] px-[5px] py-[1px] rounded-[3px]"
              style={{ color: "#a78bfa", backgroundColor: "rgba(167,139,250,0.10)" }}
            >
              Target
            </span>
          )}
          {!isFirst && !isLast && (
            <span className="text-[8px]" style={{ color: colors.textDim }}>
              hop {index}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

/* ================================================================
   SMALL REUSABLE COMPONENTS
   ================================================================ */

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="text-[9px] uppercase tracking-wider mb-2"
      style={{ color: colors.textDim }}
    >
      {children}
    </div>
  );
}

function InfoBlock({
  label,
  value,
  accentColor,
}: {
  label: string;
  value: string;
  accentColor: string;
}) {
  return (
    <div
      className="rounded-[8px] p-3"
      style={{
        backgroundColor: "rgba(255,255,255,0.02)",
        border: "1px solid rgba(255,255,255,0.05)",
      }}
    >
      <div className="flex items-center gap-[5px] mb-1">
        <div className="w-[5px] h-[5px] rounded-full" style={{ backgroundColor: accentColor }} />
        <span className="text-[8px] uppercase tracking-wider" style={{ color: colors.textDim }}>
          {label}
        </span>
      </div>
      <span className="text-[10px] font-medium" style={{ color: colors.textSecondary }}>
        {value}
      </span>
    </div>
  );
}

function MetricBlock({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div
      className="rounded-[8px] p-3 text-center"
      style={{
        backgroundColor: "rgba(255,255,255,0.02)",
        border: "1px solid rgba(255,255,255,0.05)",
      }}
    >
      <div className="text-[18px] font-semibold leading-none mb-1" style={{ color }}>
        {value}
      </div>
      <div className="text-[9px]" style={{ color: colors.textDim }}>
        {label}
      </div>
    </div>
  );
}

function MetricPill({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="flex items-center gap-[4px]">
      <span className="text-[11px] font-medium" style={{ color }}>
        {value}
      </span>
      <span className="text-[9px]" style={{ color: colors.textDim }}>
        {label}
      </span>
    </div>
  );
}

function AIChip({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="px-2 py-[4px] text-[9px] font-medium rounded-[5px] border transition-colors"
      style={{
        color: colors.accent,
        borderColor: "rgba(87,177,255,0.16)",
        backgroundColor: "rgba(87,177,255,0.04)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = "rgba(87,177,255,0.10)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = "rgba(87,177,255,0.04)";
      }}
    >
      {label}
    </button>
  );
}

function HeaderButton({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-[6px] px-3 py-[7px] rounded-lg text-[11px] font-medium border transition-colors"
      style={{
        color: colors.textSecondary,
        borderColor: colors.border,
        backgroundColor: colors.bgPanel,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = "rgba(87,177,255,0.05)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = colors.bgPanel;
      }}
    >
      {icon}
      {label}
    </button>
  );
}
