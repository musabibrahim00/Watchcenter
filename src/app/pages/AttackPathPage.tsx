import React, { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router";
import { Activity, AlertTriangle, Crosshair, ExternalLink, FlaskConical, GitBranch, Play, RefreshCcw, Shield, Zap, X } from "lucide-react";
import { colors } from "../shared/design-system/tokens";
import { Badge } from "../shared/components/ui/Badge";
import { useAiBox } from "../features/ai-box";

/* ================================================================
   TYPES
   ================================================================ */

type Severity = "critical" | "high" | "medium" | "low";
type PathStatus = "active" | "mitigated" | "acknowledged";
type HopType = "entry" | "exploit" | "technique" | "pivot" | "target";

interface PathHop {
  label: string;
  type: HopType;
  note?: string;
}

interface BlastRadiusData {
  reachableAssets: number;
  crownJewels: string[];
  identityRoutes: number;
  scenario: string;
  spread: "targeted" | "wide" | "domain-wide";
}

interface AttackPathItem {
  id: string;
  name: string;
  severity: Severity;
  entryPoint: string;
  targetAsset: string;
  riskSummary: string;
  criticalityReason: string;
  lastUpdated: string;
  status: PathStatus;
  hops: PathHop[];
  mitigations: string[];
  blastRadius: BlastRadiusData;
}

/* ── Simulation types ─────────────────────────────────────── */

type SimType =
  | "patch"
  | "isolate"
  | "revoke-creds"
  | "close-exposure"
  | "block-lateral"
  | "apply-control";

interface SimulationScenario {
  id: string;
  type: SimType;
  title: string;
  targetHopLabel: string;
  targetHopType: HopType;
  hypothesis: string;
}

interface BlastSnapshot {
  reachableAssets: number;
  crownJewels: string[];
  identityRoutes: number;
  spread: BlastRadiusData["spread"];
}

interface AltPath {
  via: string;
  severity: Severity;
  description: string;
}

interface SimulationResultData {
  scenario: SimulationScenario;
  pathStatus: "broken" | "reduced" | "rerouted" | "unchanged";
  pathStatusLabel: string;
  mitigatedHopLabels: string[];
  remainingHopLabels: string[];
  blastBefore: BlastSnapshot;
  blastAfter: BlastSnapshot;
  alternativePaths: AltPath[];
  residualRisk: string;
  whyItChanged: string;
}

/* ================================================================
   DATA
   ================================================================ */

const ATTACK_PATHS: AttackPathItem[] = [
  {
    id: "ap-001",
    name: "Internet-facing service → Database",
    severity: "critical",
    entryPoint: "Jenkins (port 8080, public)",
    targetAsset: "finance-db-01 (RDS)",
    riskSummary: "Unauthenticated access to Jenkins allows arbitrary code execution, enabling credential theft and lateral movement to the production database.",
    criticalityReason: "Jenkins is publicly accessible without authentication. An attacker with internet access can execute arbitrary code, steal all stored credentials, and reach finance-db-01 in 3 hops — with no detection currently in place for this traversal.",
    lastUpdated: "2 hours ago",
    status: "active",
    hops: [
      { label: "Internet", type: "entry" },
      { label: "Jenkins Server", type: "exploit", note: "CVE-2018-15133 · Unauthenticated RCE · port 8080 exposed" },
      { label: "Credential Theft", type: "technique", note: "Plaintext credentials in build logs and environment variables" },
      { label: "Internal VPC", type: "pivot" },
      { label: "finance-db-01", type: "target", note: "Crown Jewel · Production RDS · All financial records" },
    ],
    mitigations: [
      "Restrict Jenkins to VPN access only — remove public exposure immediately",
      "Rotate all credentials stored in Jenkins build environments",
      "Enable WAF rules blocking port 8080 from external IPs",
      "Implement network segmentation isolating the database tier",
    ],
    blastRadius: {
      reachableAssets: 12,
      crownJewels: ["finance-db-01", "billing-svc-01", "audit-logs-s3"],
      identityRoutes: 3,
      scenario: "Data exfiltration + lateral movement across production tier",
      spread: "wide",
    },
  },
  {
    id: "ap-002",
    name: "Compromised credentials → Cloud admin",
    severity: "critical",
    entryPoint: "Phishing / leaked IAM keys",
    targetAsset: "AWS Root Account",
    riskSummary: "Exposed IAM credentials with excessive permissions allow direct escalation to cloud administrator, giving full account control.",
    criticalityReason: "Leaked IAM keys with AdministratorAccess policy grant direct root-level cloud control. A single phishing attempt is sufficient to compromise the entire AWS environment — all 8 reachable accounts, all services, all data.",
    lastUpdated: "4 hours ago",
    status: "active",
    hops: [
      { label: "Phishing Email", type: "entry" },
      { label: "Exposed IAM Keys", type: "exploit", note: "Keys leaked in public GitHub repo · AdministratorAccess policy attached" },
      { label: "Privilege Escalation", type: "technique", note: "AssumeRole chain to admin · No MFA enforcement" },
      { label: "AWS Admin Role", type: "pivot" },
      { label: "AWS Root Account", type: "target", note: "Crown Jewel · Full cloud control · All services reachable" },
    ],
    mitigations: [
      "Revoke exposed IAM keys immediately and audit all recent API calls",
      "Enable MFA on all IAM users — enforce for console and API access",
      "Apply least-privilege policies — remove AdministratorAccess from all users",
      "Enable CloudTrail with anomaly detection and real-time alerting",
    ],
    blastRadius: {
      reachableAssets: 8,
      crownJewels: ["AWS Root Account", "KMS Master Keys", "S3 Secrets Bucket"],
      identityRoutes: 5,
      scenario: "Full cloud account takeover — all services, all data, all identities reachable",
      spread: "domain-wide",
    },
  },
  {
    id: "ap-003",
    name: "Lateral movement via SMB",
    severity: "high",
    entryPoint: "Workstation (SMB exploit)",
    targetAsset: "Domain Controller",
    riskSummary: "Unpatched SMB vulnerability allows lateral movement from a compromised workstation to the domain controller, enabling full domain takeover.",
    criticalityReason: "MS17-010 remains unpatched on 6 workstations. Pass-the-Hash allows token reuse to pivot across machines without re-authentication, ultimately reaching the domain controller and enabling full Active Directory takeover.",
    lastUpdated: "1 day ago",
    status: "acknowledged",
    hops: [
      { label: "Compromised Workstation", type: "entry" },
      { label: "SMB Exploit", type: "exploit", note: "MS17-010 · EternalBlue · 6 unpatched workstations" },
      { label: "Pass-the-Hash", type: "technique", note: "Token reuse across workstations — no re-auth required" },
      { label: "Admin Share (C$)", type: "pivot" },
      { label: "Domain Controller", type: "target", note: "Crown Jewel · Full AD control · All domain accounts" },
    ],
    mitigations: [
      "Patch MS17-010 across all workstations immediately — critical priority",
      "Block SMB (port 445) on the network perimeter",
      "Enable Windows Defender Credential Guard to prevent token theft",
      "Segment workstations from critical infrastructure with firewall rules",
    ],
    blastRadius: {
      reachableAssets: 24,
      crownJewels: ["Domain Controller", "Git Server", "Build Server CI"],
      identityRoutes: 4,
      scenario: "Domain-wide compromise — all AD-joined systems accessible from single workstation",
      spread: "domain-wide",
    },
  },
  {
    id: "ap-004",
    name: "Container escape → Host access",
    severity: "high",
    entryPoint: "Misconfigured container runtime",
    targetAsset: "Kubernetes node (k8s-node-04)",
    riskSummary: "Containers running with elevated privileges can escape to the host OS, gaining access to the underlying Kubernetes node and co-located workloads.",
    criticalityReason: "3 containers are running with privileged mode enabled and unrestricted host filesystem access. A container breakout grants access to all co-located pods and the node's service account token — which can then be used to pivot across the cluster.",
    lastUpdated: "6 hours ago",
    status: "active",
    hops: [
      { label: "Internet", type: "entry" },
      { label: "Web Application Pod", type: "exploit", note: "Public-facing pod · no egress restriction · known RCE" },
      { label: "Container Breakout", type: "technique", note: "Privileged runtime + hostPath mount = direct host access" },
      { label: "Host Filesystem", type: "pivot" },
      { label: "Kubernetes Node", type: "target", note: "Crown Jewel · Access to all co-located pods + service account" },
    ],
    mitigations: [
      "Remove privileged:true from all container security contexts",
      "Enable seccomp and AppArmor runtime profiles",
      "Restrict host volume mounts — remove hostPath entries",
      "Upgrade container runtime to latest patched version",
    ],
    blastRadius: {
      reachableAssets: 6,
      crownJewels: ["k8s-node-04", "auth-service", "payment-processor"],
      identityRoutes: 2,
      scenario: "Workload compromise across Kubernetes node + service account pivot",
      spread: "wide",
    },
  },
  {
    id: "ap-005",
    name: "Privilege escalation path",
    severity: "medium",
    entryPoint: "Low-privileged user account",
    targetAsset: "Server admin access",
    riskSummary: "A misconfigured sudo rule allows any user in the devops group to escalate to root on production servers.",
    criticalityReason: "The misconfigured sudo entry allows NOPASSWD: ALL for the 'devops' group. 14 accounts are in this group with no MFA requirement. Any of these accounts compromised via credential attack immediately grants root on 15 production servers.",
    lastUpdated: "2 days ago",
    status: "acknowledged",
    hops: [
      { label: "Low-privilege User", type: "entry" },
      { label: "Misconfigured sudo", type: "exploit", note: "NOPASSWD: ALL · devops group · 14 accounts in scope" },
      { label: "SUID Binary Exploit", type: "technique", note: "Alternative escalation via setuid binaries" },
      { label: "Root Shell", type: "pivot" },
      { label: "Server Admin Access", type: "target", note: "15 production servers · full root control" },
    ],
    mitigations: [
      "Audit and restrict sudo rules — remove NOPASSWD: ALL immediately",
      "Remove SUID bit from non-essential binaries",
      "Enforce MFA for all accounts in the devops group",
      "Review and reduce group membership to minimum required",
    ],
    blastRadius: {
      reachableAssets: 15,
      crownJewels: ["prod-db-master", "log-aggregator"],
      identityRoutes: 1,
      scenario: "Root access across 15 production servers from single credential compromise",
      spread: "targeted",
    },
  },
  {
    id: "ap-006",
    name: "API misconfiguration chain",
    severity: "medium",
    entryPoint: "Exposed internal API",
    targetAsset: "Customer data store",
    riskSummary: "Internal API endpoints exposed without authentication allow unauthorized access to customer records.",
    criticalityReason: "3 API endpoints return full customer PII without any authentication requirement. The API gateway has no rate limiting or IP allowlist, making automated enumeration and exfiltration trivial. 850k customer records are at risk.",
    lastUpdated: "3 days ago",
    status: "mitigated",
    hops: [
      { label: "Internet", type: "entry" },
      { label: "Exposed API Gateway", type: "exploit", note: "No authentication required · no rate limiting · no IP restriction" },
      { label: "Unauthenticated Endpoint", type: "technique", note: "/api/v1/customers — returns full PII without auth" },
      { label: "Data Access Layer", type: "pivot" },
      { label: "Customer Database", type: "target", note: "850k customer records · full PII · GDPR scope" },
    ],
    mitigations: [
      "Add API key or OAuth2 authentication to all endpoints immediately",
      "Implement rate limiting and IP-based allowlisting",
      "Enable comprehensive API gateway access logging",
      "Audit all endpoints and remove unintended public exposure",
    ],
    blastRadius: {
      reachableAssets: 9,
      crownJewels: ["Customer Database", "PII Data Lake"],
      identityRoutes: 0,
      scenario: "Customer data exfiltration — full PII accessible without credentials",
      spread: "targeted",
    },
  },
  {
    id: "ap-007",
    name: "Network segmentation bypass",
    severity: "low",
    entryPoint: "Misconfigured firewall rule",
    targetAsset: "Internal services",
    riskSummary: "An overly permissive firewall rule allows traffic between network segments that should be isolated.",
    criticalityReason: "Firewall rule 'allow-all-internal' was added during a P1 incident 6 months ago and never removed. It allows unrestricted cross-segment traffic between the DMZ and production — enabling reconnaissance and lateral movement enablement.",
    lastUpdated: "5 days ago",
    status: "acknowledged",
    hops: [
      { label: "External Network", type: "entry" },
      { label: "Firewall Bypass", type: "exploit", note: "'allow-all-internal' rule · DMZ → Production unrestricted" },
      { label: "Internal Segment", type: "pivot" },
      { label: "Service Discovery", type: "technique", note: "Full visibility into internal topology once traversed" },
      { label: "Internal Services", type: "target" },
    ],
    mitigations: [
      "Remove the 'allow-all-internal' firewall rule immediately",
      "Implement zero-trust network policies with explicit allow rules",
      "Enable network traffic monitoring and anomaly detection",
      "Conduct full firewall ruleset audit and cleanup",
    ],
    blastRadius: {
      reachableAssets: 18,
      crownJewels: [],
      identityRoutes: 1,
      scenario: "Reconnaissance enablement — full internal topology visible from DMZ",
      spread: "wide",
    },
  },
];

/* ================================================================
   KPI DATA
   ================================================================ */

const KPI_DATA = [
  { label: "Critical Attack Paths", value: 2, color: colors.critical, delta: "+1 since last scan" },
  { label: "Internet-Reachable Assets", value: 34, color: "#f97316", delta: "6 at critical risk" },
  { label: "Crown Jewel Exposure", value: 3, color: "#a78bfa", delta: "finance-db, root acct, DC" },
  { label: "Blast Radius (Immediate)", value: 4, color: colors.high, delta: "2 unacknowledged paths" },
];

/* ================================================================
   HELPERS
   ================================================================ */

const SEVERITY_COLOR: Record<Severity, string> = {
  critical: colors.critical,
  high: colors.high,
  medium: colors.medium,
  low: colors.low,
};

const STATUS_CONFIG: Record<PathStatus, { label: string; color: string; bg: string }> = {
  active: { label: "Active", color: "#ef4444", bg: "rgba(239,68,68,0.10)" },
  acknowledged: { label: "Acknowledged", color: "#f59e0b", bg: "rgba(245,158,11,0.10)" },
  mitigated: { label: "Mitigated", color: "#2fd897", bg: "rgba(47,216,151,0.10)" },
};

const HOP_CONFIG: Record<HopType, { color: string; bg: string; label: string }> = {
  entry: { color: "#ef4444", bg: "rgba(239,68,68,0.10)", label: "Entry" },
  exploit: { color: "#f97316", bg: "rgba(249,115,22,0.10)", label: "Exploit" },
  technique: { color: "#f59e0b", bg: "rgba(245,158,11,0.10)", label: "Technique" },
  pivot: { color: "#57b1ff", bg: "rgba(87,177,255,0.08)", label: "Pivot" },
  target: { color: "#a78bfa", bg: "rgba(167,139,250,0.10)", label: "Target" },
};

const SPREAD_CONFIG: Record<BlastRadiusData["spread"], { label: string; color: string }> = {
  targeted: { label: "Targeted", color: colors.medium },
  wide: { label: "Wide Spread", color: colors.high },
  "domain-wide": { label: "Domain-Wide", color: colors.critical },
};

/* ================================================================
   SIMULATION ENGINE
   ================================================================ */

const SIM_TYPE_CONFIG: Record<SimType, { label: string; verb: string; color: string }> = {
  "patch":          { label: "Patch Vulnerability",    verb: "patching",               color: "#2fd897" },
  "isolate":        { label: "Isolate Workload",        verb: "isolating",              color: "#57b1ff" },
  "revoke-creds":   { label: "Revoke Credentials",     verb: "revoking credentials on", color: "#f97316" },
  "close-exposure": { label: "Close Exposure",         verb: "closing exposure at",    color: "#f59e0b" },
  "block-lateral":  { label: "Block Lateral Movement", verb: "blocking lateral at",    color: "#a78bfa" },
  "apply-control":  { label: "Apply Control Policy",   verb: "applying a control at",  color: "#57b1ff" },
};

const PATH_STATUS_CONFIG: Record<SimulationResultData["pathStatus"], { label: string; color: string; bg: string }> = {
  broken:    { label: "Attack Path Broken",   color: "#2fd897", bg: "rgba(47,216,151,0.08)" },
  reduced:   { label: "Path Reduced",         color: "#f59e0b", bg: "rgba(245,158,11,0.08)" },
  rerouted:  { label: "Path Rerouted",        color: "#f97316", bg: "rgba(249,115,22,0.08)" },
  unchanged: { label: "Path Unchanged",       color: colors.critical, bg: "rgba(239,68,68,0.08)" },
};

/**
 * Deterministic simulation engine.
 * Computes blast-radius changes and path status based on hop position + simType.
 * This is hypothetical — no live changes are made.
 */
function simulateScenario(
  path: AttackPathItem,
  scenario: SimulationScenario
): SimulationResultData {
  const hopIndex = path.hops.findIndex(
    (h) => h.label === scenario.targetHopLabel && h.type === scenario.targetHopType
  );
  const hop = path.hops[hopIndex < 0 ? 0 : hopIndex];

  const blastBefore: BlastSnapshot = {
    reachableAssets: path.blastRadius.reachableAssets,
    crownJewels: [...path.blastRadius.crownJewels],
    identityRoutes: path.blastRadius.identityRoutes,
    spread: path.blastRadius.spread,
  };

  const isEntry      = hop.type === "entry";
  const isExploit    = hop.type === "exploit";
  const isEarly      = isEntry || isExploit || scenario.type === "close-exposure";
  const isMid        = !isEntry && !isExploit && hop.type !== "target";
  const isTargetHop  = hop.type === "target";

  let pathStatus: SimulationResultData["pathStatus"];
  let mitigatedHopLabels: string[];
  let remainingHopLabels: string[];
  let blastAfter: BlastSnapshot;
  let alternativePaths: AltPath[];
  let residualRisk: string;
  let whyItChanged: string;

  if (isEarly || scenario.type === "revoke-creds") {
    // Blocking at entry or revoking creds collapses the entire chain
    pathStatus = "broken";
    mitigatedHopLabels = path.hops.map((h) => h.label);
    remainingHopLabels = [];
    blastAfter = { reachableAssets: 0, crownJewels: [], identityRoutes: 0, spread: "targeted" };
    const hasAlt = path.blastRadius.identityRoutes > 1 || scenario.type === "revoke-creds";
    alternativePaths = hasAlt
      ? [{ via: "IAM / Identity route", severity: "medium", description: `Secondary identity-based access may remain active. Verify all service account permissions tied to ${path.targetAsset}.` }]
      : [];
    residualRisk = alternativePaths.length > 0
      ? `Primary attack path broken. ${alternativePaths.length} alternative route(s) detected — full remediation requires additional steps.`
      : "Attack path fully blocked. No alternative routes identified in current scope.";
    whyItChanged = `Removing access at "${hop.label}" eliminates the initial foothold required for this attack chain. All downstream hops become unreachable without that entry point.`;

  } else if (isMid || scenario.type === "block-lateral") {
    // Blocking mid-chain reduces but does not fully eliminate
    pathStatus = "reduced";
    mitigatedHopLabels = path.hops.slice(hopIndex).map((h) => h.label);
    remainingHopLabels = path.hops.slice(0, hopIndex).map((h) => h.label);
    const factor = scenario.type === "block-lateral" ? 0.22 : 0.30;
    const cjRemaining = path.blastRadius.crownJewels.slice(
      Math.floor(path.blastRadius.crownJewels.length / 2)
    );
    blastAfter = {
      reachableAssets: Math.max(1, Math.ceil(path.blastRadius.reachableAssets * factor)),
      crownJewels: cjRemaining,
      identityRoutes: Math.max(0, path.blastRadius.identityRoutes - 1),
      spread: "targeted",
    };
    alternativePaths =
      path.blastRadius.identityRoutes > 0
        ? [{ via: "Identity / credential route", severity: "medium", description: `${path.targetAsset} may still be reachable via existing identity routes — verify IAM bindings.` }]
        : [];
    residualRisk = `Lateral movement blocked at "${hop.label}". Blast radius reduced from ${blastBefore.reachableAssets} → ${blastAfter.reachableAssets} assets. Entry foothold persists — partial exposure remains.`;
    whyItChanged = `Blocking at "${hop.label}" prevents downstream movement to the target. However, the initial foothold (${path.hops[0].label}) remains exploitable, and the attacker may pivot to alternative routes.`;

  } else if (isTargetHop || scenario.type === "isolate" || scenario.type === "apply-control") {
    // Protecting the target asset — path continues but target is hardened
    pathStatus = "rerouted";
    mitigatedHopLabels = [hop.label];
    remainingHopLabels = path.hops.slice(0, -1).map((h) => h.label);
    const newCj = path.blastRadius.crownJewels.filter((cj) => cj !== path.targetAsset);
    blastAfter = {
      reachableAssets: Math.max(0, path.blastRadius.reachableAssets - 4),
      crownJewels: newCj,
      identityRoutes: path.blastRadius.identityRoutes,
      spread: path.blastRadius.reachableAssets > 10 ? "wide" : "targeted",
    };
    alternativePaths = [
      {
        via: "Alternative lateral path",
        severity: "high",
        description: `Attack chain up to "${path.hops[path.hops.length - 2]?.label}" still active. Attacker retains foothold in environment and may redirect to other targets.`,
      },
    ];
    residualRisk = `"${hop.label}" protected. Upstream chain persists — attacker foothold not fully eliminated. Additional targets may still be reachable.`;
    whyItChanged = `Isolating "${hop.label}" protects the specific target but does not remove the attacker's initial foothold or upstream chain. The environment remains partially compromised.`;

  } else {
    // Fallback — patch on pivot or other
    pathStatus = "reduced";
    mitigatedHopLabels = path.hops.slice(hopIndex).map((h) => h.label);
    remainingHopLabels = path.hops.slice(0, hopIndex).map((h) => h.label);
    blastAfter = {
      reachableAssets: Math.max(0, Math.ceil(path.blastRadius.reachableAssets * 0.4)),
      crownJewels: path.blastRadius.crownJewels.slice(1),
      identityRoutes: Math.max(0, path.blastRadius.identityRoutes - 1),
      spread: "targeted",
    };
    alternativePaths = [];
    residualRisk = `Patch applied at "${hop.label}". Downstream reach significantly reduced.`;
    whyItChanged = `Patching "${hop.label}" removes the specific vulnerability that enabled this attack step. The upstream chain still exists but cannot progress to downstream targets.`;
  }

  return {
    scenario,
    pathStatus,
    pathStatusLabel: PATH_STATUS_CONFIG[pathStatus].label,
    mitigatedHopLabels,
    remainingHopLabels,
    blastBefore,
    blastAfter,
    alternativePaths,
    residualRisk,
    whyItChanged,
  };
}

/* ================================================================
   AIBOX CONTEXT BUILDERS
   ================================================================ */

function buildPageContext() {
  return {
    type: "general" as const,
    label: "Attack Path",
    sublabel: "Exposure & Blast Radius",
    contextKey: "attack-path-page",
    greeting:
      "I have attack path context loaded. I can explain why specific paths are risky, assess blast radius across your environment, and help prioritize remediation. 2 critical paths are currently active.",
    suggestions: [
      { label: "Summarize critical paths", prompt: "Summarize all critical attack paths and what makes them urgent" },
      { label: "What is my blast radius?", prompt: "What is the total blast radius across all active attack paths?" },
      { label: "Crown jewel exposure", prompt: "Which crown jewel assets are exposed across these attack paths?" },
      { label: "Top mitigations", prompt: "What are the top 5 mitigations to reduce my attack surface right now?" },
      { label: "Investigate top threat", prompt: "Help me investigate the highest-risk attack path in detail" },
    ],
  };
}

function buildPathContext(path: AttackPathItem) {
  return {
    type: "general" as const,
    label: path.name,
    sublabel: "Attack Path · Blast Radius",
    contextKey: `attack-path:${path.id}`,
    greeting: `I have **${path.name}** loaded. Entry: ${path.entryPoint} → Target: ${path.targetAsset}. Blast radius: ${path.blastRadius.reachableAssets} reachable assets, ${path.blastRadius.crownJewels.length} crown jewels exposed. I can explain the chain, assess impact, or help with remediation.`,
    suggestions: [
      { label: "Explain this path", prompt: `Explain the attack path: ${path.name}` },
      { label: "Why is this critical?", prompt: `Why is "${path.name}" considered ${path.severity} severity?` },
      { label: "Assess blast radius", prompt: `Assess the full blast radius for the "${path.name}" attack path` },
      { label: "Recommend mitigations", prompt: `What are the top mitigations for the "${path.name}" attack path?` },
      { label: "Create case", prompt: `Create a remediation case for the "${path.name}" attack path` },
      { label: "Simulate impact", prompt: `Simulate the impact if the "${path.name}" attack path is exploited` },
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
  const [filterSeverity, setFilterSeverity] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    setPageContext(buildPageContext());
  }, [setPageContext]);

  useEffect(() => {
    if (selectedPath) {
      setPageContext(buildPathContext(selectedPath));
    } else {
      setPageContext(buildPageContext());
    }
  }, [selectedPath, setPageContext]);

  const filtered = ATTACK_PATHS.filter((p) => {
    const matchSev = filterSeverity === "all" || p.severity === filterSeverity;
    const matchStatus = filterStatus === "all" || p.status === filterStatus;
    return matchSev && matchStatus;
  });

  const handleSelectPath = useCallback((path: AttackPathItem) => {
    setSelectedPath((prev) => (prev?.id === path.id ? null : path));
  }, []);

  const handleAIAction = useCallback(
    (path: AttackPathItem, prompt: string) => {
      openWithContext({ ...buildPathContext(path), initialQuery: prompt });
    },
    [openWithContext]
  );

  const handleFullGraph = useCallback(
    (path: AttackPathItem) => {
      navigate(`/attack-paths/${path.id}`);
    },
    [navigate]
  );

  return (
    <div
      className="flex flex-col"
      style={{ backgroundColor: colors.bgApp, minHeight: "100%", maxWidth: "100%", overflowX: "hidden" }}
    >
      {/* ── Header ─────────────────────────────────────────────────── */}
      <div
        className="shrink-0 px-[32px] pt-[28px] pb-[20px]"
        style={{ borderBottom: `1px solid ${colors.border}` }}
      >
        <div className="flex items-end justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-[8px] mb-[4px]">
              <Crosshair size={14} style={{ color: colors.critical }} />
              <span
                style={{
                  fontSize: 11, color: colors.textDim,
                  letterSpacing: "0.06em", textTransform: "uppercase",
                }}
              >
                Attack Path
              </span>
            </div>
            <h1
              style={{
                fontSize: 22, fontWeight: 700, color: colors.textPrimary,
                letterSpacing: "-0.5px", margin: 0,
              }}
            >
              Exposure &amp; Blast Radius
            </h1>
            <p style={{ fontSize: 12, color: colors.textMuted, marginTop: 4 }}>
              Understand how an attacker moves through your environment — from entry point to crown jewel.
            </p>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-[8px] flex-wrap">
            <select
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value)}
              className="px-3 py-[7px] text-[11px] rounded-[8px] border bg-transparent cursor-pointer outline-none"
              style={{ color: colors.textSecondary, borderColor: colors.border, backgroundColor: colors.bgCard }}
            >
              <option value="all">All Severities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-[7px] text-[11px] rounded-[8px] border bg-transparent cursor-pointer outline-none"
              style={{ color: colors.textSecondary, borderColor: colors.border, backgroundColor: colors.bgCard }}
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="acknowledged">Acknowledged</option>
              <option value="mitigated">Mitigated</option>
            </select>
            <button
              onClick={() => openWithContext({ ...buildPageContext(), initialQuery: "Help me investigate the highest-risk attack path" })}
              className="flex items-center gap-[6px] px-3 py-[7px] rounded-[8px] text-[11px] font-medium border transition-colors"
              style={{
                color: colors.accent,
                borderColor: "rgba(87,177,255,0.22)",
                backgroundColor: "rgba(87,177,255,0.06)",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "rgba(87,177,255,0.12)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "rgba(87,177,255,0.06)"; }}
            >
              <Zap size={11} color={colors.accent} />
              Investigate
            </button>
          </div>
        </div>
      </div>

      {/* ── KPI Strip ────────────────────────────────────────────── */}
      <div
        className="shrink-0 px-[32px] py-[18px]"
        style={{ borderBottom: `1px solid ${colors.border}` }}
      >
        <div className="grid grid-cols-4 gap-[16px]">
          {KPI_DATA.map((kpi) => (
            <KpiCard key={kpi.label} {...kpi} />
          ))}
        </div>
      </div>

      {/* ── Two-column body ──────────────────────────────────────── */}
      <div className="flex flex-1" style={{ minHeight: 0 }}>

        {/* LEFT: Attack path list */}
        <div
          className="shrink-0 flex flex-col"
          style={{
            width: 400,
            borderRight: `1px solid ${colors.border}`,
            minHeight: 0,
          }}
        >
          {/* List header */}
          <div
            className="shrink-0 flex items-center justify-between px-[16px] py-[10px]"
            style={{ borderBottom: `1px solid ${colors.border}` }}
          >
            <span style={{ fontSize: 11, fontWeight: 600, color: colors.textSecondary, textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Attack Paths
            </span>
            <span style={{ fontSize: 10, color: colors.textDim }}>
              {filtered.length} of {ATTACK_PATHS.length}
            </span>
          </div>

          {/* Path cards */}
          <div className="flex-1 overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 text-center gap-2">
                <AlertTriangle size={20} color={colors.textDim} />
                <p style={{ fontSize: 12, color: colors.textDim }}>No paths match the current filters.</p>
              </div>
            ) : (
              filtered.map((path) => (
                <PathCard
                  key={path.id}
                  path={path}
                  isSelected={selectedPath?.id === path.id}
                  onSelect={handleSelectPath}
                  onAIAction={handleAIAction}
                />
              ))
            )}
          </div>
        </div>

        {/* RIGHT: Investigation panel */}
        <div className="flex-1 overflow-y-auto" style={{ minHeight: 0 }}>
          {selectedPath ? (
            <PathInvestigation
              path={selectedPath}
              onClose={() => setSelectedPath(null)}
              onAIAction={handleAIAction}
              onFullGraph={handleFullGraph}
            />
          ) : (
            <NoSelectionState
              paths={filtered}
              onSelect={handleSelectPath}
              onInvestigate={() =>
                openWithContext({
                  ...buildPageContext(),
                  initialQuery: "Summarize all critical attack paths and what requires immediate action",
                })
              }
            />
          )}
        </div>
      </div>
    </div>
  );
}

/* ================================================================
   KPI CARD
   ================================================================ */

function KpiCard({ label, value, color, delta }: {
  label: string; value: number; color: string; delta: string;
}) {
  return (
    <div
      className="rounded-[10px] p-[16px]"
      style={{ backgroundColor: colors.bgCard, border: `1px solid ${colors.border}` }}
    >
      <p style={{ fontSize: 10, color: colors.textDim, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>
        {label}
      </p>
      <p style={{ fontSize: 28, fontWeight: 700, color, lineHeight: 1, marginBottom: 4 }}>{value}</p>
      <p style={{ fontSize: 10, color: colors.textMuted }}>{delta}</p>
    </div>
  );
}

/* ================================================================
   PATH CARD (left panel — investigation-oriented, not a table row)
   ================================================================ */

function PathCard({
  path,
  isSelected,
  onSelect,
  onAIAction,
}: {
  path: AttackPathItem;
  isSelected: boolean;
  onSelect: (p: AttackPathItem) => void;
  onAIAction: (p: AttackPathItem, prompt: string) => void;
}) {
  const sColor = SEVERITY_COLOR[path.severity];
  const status = STATUS_CONFIG[path.status];
  const spread = SPREAD_CONFIG[path.blastRadius.spread];

  // Compact chain string: entry → ... → target
  const chainParts = path.hops.map((h) => h.label);

  return (
    <div
      onClick={() => onSelect(path)}
      className="cursor-pointer transition-all"
      style={{
        borderLeft: `3px solid ${isSelected ? sColor : "transparent"}`,
        backgroundColor: isSelected ? "rgba(87,177,255,0.04)" : "transparent",
        borderBottom: `1px solid ${colors.border}`,
      }}
      onMouseEnter={(e) => {
        if (!isSelected) e.currentTarget.style.backgroundColor = "rgba(87,177,255,0.02)";
      }}
      onMouseLeave={(e) => {
        if (!isSelected) e.currentTarget.style.backgroundColor = "transparent";
      }}
    >
      <div className="px-[16px] py-[14px] flex flex-col gap-[8px]">

        {/* Row 1: severity dot + name + status */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-[7px] min-w-0">
            <div
              className="shrink-0 w-[7px] h-[7px] rounded-full mt-[3px]"
              style={{ backgroundColor: sColor, boxShadow: `0 0 5px ${sColor}50` }}
            />
            <span style={{ fontSize: 12, fontWeight: 600, color: colors.textPrimary }}>
              {path.name}
            </span>
          </div>
          <span
            className="shrink-0 px-[6px] py-[2px] rounded-[4px] text-[9px] font-semibold uppercase"
            style={{ backgroundColor: status.bg, color: status.color }}
          >
            {status.label}
          </span>
        </div>

        {/* Row 2: attack chain strip (arrows) */}
        <div className="flex items-center gap-[4px] flex-wrap">
          {chainParts.map((hop, i) => {
            const hopType = path.hops[i].type;
            const hopCfg = HOP_CONFIG[hopType];
            return (
              <React.Fragment key={i}>
                <span
                  className="px-[5px] py-[1px] rounded-[3px] text-[9px] font-medium"
                  style={{ backgroundColor: hopCfg.bg, color: hopCfg.color }}
                >
                  {hop}
                </span>
                {i < chainParts.length - 1 && (
                  <span style={{ fontSize: 9, color: colors.textDim }}>→</span>
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Row 3: blast radius summary */}
        <div className="flex items-center gap-[8px] flex-wrap">
          <div className="flex items-center gap-[3px]">
            <Activity size={10} style={{ color: "#a78bfa" }} />
            <span style={{ fontSize: 10, color: "#a78bfa", fontWeight: 600 }}>
              {path.blastRadius.reachableAssets} assets
            </span>
          </div>
          {path.blastRadius.crownJewels.length > 0 && (
            <>
              <span style={{ fontSize: 9, color: colors.textDim }}>·</span>
              <span style={{ fontSize: 10, color: colors.critical, fontWeight: 600 }}>
                {path.blastRadius.crownJewels.length} crown jewels
              </span>
            </>
          )}
          {path.blastRadius.identityRoutes > 0 && (
            <>
              <span style={{ fontSize: 9, color: colors.textDim }}>·</span>
              <span style={{ fontSize: 10, color: colors.high }}>
                {path.blastRadius.identityRoutes} identity routes
              </span>
            </>
          )}
          <span style={{ fontSize: 9, color: spread.color }} className="ml-auto">
            {spread.label}
          </span>
        </div>

        {/* Row 4: AI chips + updated */}
        <div
          className="flex items-center gap-[5px]"
          onClick={(e) => e.stopPropagation()}
        >
          <AIChip label="Explain" onClick={() => onAIAction(path, `Explain the attack path: ${path.name}`)} />
          <AIChip label="Blast Radius" onClick={() => onAIAction(path, `Assess the full blast radius for "${path.name}"`)} />
          <AIChip label="Create Case" onClick={() => onAIAction(path, `Create a remediation case for "${path.name}"`)} />
          <span style={{ fontSize: 9, color: colors.textDim, marginLeft: "auto" }}>
            {path.lastUpdated}
          </span>
        </div>
      </div>
    </div>
  );
}

/* ================================================================
   PATH INVESTIGATION PANEL (right — full detail view)
   ================================================================ */

/* ================================================================
   PATH INVESTIGATION — node-centric investigation layout
   S1: target node as center anchor
   S3: three interaction states (default / node-focused / blast-expanded)
   S4: attack chain always visible
   S5: insights panel opens on node click
   ================================================================ */

type InvestigationState = "default" | "node-focused" | "blast-expanded" | "sim-result" | "sim-compare";

function PathInvestigation({
  path,
  onClose,
  onAIAction,
  onFullGraph,
}: {
  path: AttackPathItem;
  onClose: () => void;
  onAIAction: (p: AttackPathItem, prompt: string) => void;
  onFullGraph: (p: AttackPathItem) => void;
}) {
  const { openWithContext } = useAiBox();
  const status = STATUS_CONFIG[path.status];

  const [focusedHop, setFocusedHop] = useState<PathHop | null>(null);
  const [blastExpanded, setBlastExpanded] = useState(false);
  const [simulationResult, setSimulationResult] = useState<SimulationResultData | null>(null);
  const [comparisonResult, setComparisonResult] = useState<SimulationResultData | null>(null);

  const invState: InvestigationState =
    simulationResult && comparisonResult ? "sim-compare" :
    simulationResult ? "sim-result" :
    blastExpanded ? "blast-expanded" :
    focusedHop ? "node-focused" :
    "default";

  // Reset all state when path changes
  useEffect(() => {
    setFocusedHop(null);
    setBlastExpanded(false);
    setSimulationResult(null);
    setComparisonResult(null);
  }, [path.id]);

  const handleHopClick = (hop: PathHop) => {
    const alreadyFocused = focusedHop?.label === hop.label && focusedHop?.type === hop.type;
    if (alreadyFocused) {
      setFocusedHop(null);
      setBlastExpanded(false);
    } else {
      setFocusedHop(hop);
      setBlastExpanded(false);
      openWithContext({
        ...buildPathContext(path),
        initialQuery: `Analyze the "${hop.label}" (${hop.type} step) in the "${path.name}" attack path. What makes this node critical and how can it be secured?`,
      });
    }
  };

  const handleBlastExpand = () => {
    setBlastExpanded(true);
    setFocusedHop(null);
    openWithContext({
      ...buildPathContext(path),
      initialQuery: `Assess the full blast radius for "${path.name}": ${path.blastRadius.reachableAssets} reachable assets, ${path.blastRadius.crownJewels.length} crown jewels exposed. What is the complete business impact?`,
    });
  };

  /**
   * Run a simulation scenario against the current focused hop.
   * Results are purely hypothetical — no live changes occur.
   */
  const runSimulation = useCallback(
    (simType: SimType, hop: PathHop) => {
      const scenario: SimulationScenario = {
        id: `sim-${Date.now()}`,
        type: simType,
        title: `${SIM_TYPE_CONFIG[simType].label}: ${hop.label}`,
        targetHopLabel: hop.label,
        targetHopType: hop.type,
        hypothesis: `Hypothetically ${SIM_TYPE_CONFIG[simType].verb} "${hop.label}" to assess the impact on the attack path and blast radius.`,
      };
      const result = simulateScenario(path, scenario);

      if (simulationResult && !comparisonResult) {
        // Store as comparison (second scenario)
        setComparisonResult(result);
      } else {
        setSimulationResult(result);
        setComparisonResult(null);
      }

      // Open AIBox with simulation result context
      openWithContext({
        ...buildPathContext(path),
        initialQuery: `I ran a simulation: "${scenario.title}". Result: ${result.pathStatusLabel}. Blast radius: ${result.blastBefore.reachableAssets} → ${result.blastAfter.reachableAssets} assets. ${result.residualRisk} What should I prioritize?`,
      });
    },
    [path, simulationResult, comparisonResult, openWithContext]
  );

  const clearSimulation = () => {
    setSimulationResult(null);
    setComparisonResult(null);
  };

  return (
    <div className="flex flex-col h-full">
      {/* ── Panel header ─────────────────────────────────────────── */}
      <div
        className="shrink-0 px-[24px] py-[16px]"
        style={{ borderBottom: `1px solid ${colors.border}` }}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-[8px] flex-wrap mb-[5px]">
              <Badge tone={path.severity}>{path.severity}</Badge>
              <span
                className="px-[6px] py-[1px] rounded-[4px] text-[9px] font-semibold uppercase"
                style={{ backgroundColor: status.bg, color: status.color }}
              >
                {status.label}
              </span>
              <span style={{ fontSize: 10, color: colors.textDim }}>· Updated {path.lastUpdated}</span>
            </div>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: colors.textPrimary, letterSpacing: "-0.3px", margin: 0 }}>
              {path.name}
            </h2>
            <p style={{ fontSize: 11, color: colors.textMuted, marginTop: 2 }}>
              <span style={{ color: colors.textDim }}>Entry:</span> {path.entryPoint}
              <span style={{ margin: "0 6px", color: colors.textDim }}>→</span>
              <span style={{ color: colors.textDim }}>Target:</span> {path.targetAsset}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => onFullGraph(path)}
              className="flex items-center gap-[5px] px-3 py-[6px] text-[10px] font-medium rounded-[7px] border transition-colors"
              style={{ color: colors.accent, borderColor: "rgba(87,177,255,0.22)", backgroundColor: "rgba(87,177,255,0.06)" }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "rgba(87,177,255,0.12)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "rgba(87,177,255,0.06)"; }}
            >
              <ExternalLink size={10} />
              Full Graph
            </button>
            <button
              onClick={onClose}
              className="w-[28px] h-[28px] flex items-center justify-center rounded-[7px] border transition-colors"
              style={{ color: colors.textDim, borderColor: colors.border, backgroundColor: "transparent" }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = colors.hoverOverlay; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
            >
              <X size={12} />
            </button>
          </div>
        </div>
      </div>

      {/* ── Chain canvas — always visible ────────────────────────── */}
      <div
        className="shrink-0 px-[20px] py-[20px]"
        style={{ borderBottom: `1px solid ${colors.border}`, backgroundColor: "rgba(0,0,0,0.10)" }}
      >
        <div className="flex items-center gap-[6px] mb-[14px]">
          <Crosshair size={11} style={{ color: colors.textDim }} />
          <span style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: colors.textDim }}>
            Attack Chain
          </span>
          <span style={{ fontSize: 9, color: colors.textDim, marginLeft: 4 }}>
            · Click any node to investigate
          </span>
          {simulationResult && (
            <>
              <span style={{ fontSize: 9, color: colors.textDim, marginLeft: 4 }}>·</span>
              <span style={{ fontSize: 9, color: "#2fd897", fontWeight: 600, marginLeft: 2 }}>
                Simulation active
              </span>
              <button
                onClick={clearSimulation}
                style={{
                  display: "flex", alignItems: "center", gap: 3,
                  marginLeft: 8, fontSize: 9, color: colors.textDim,
                  background: "none", border: "none", cursor: "pointer", padding: 0,
                }}
                onMouseEnter={(e) => { e.currentTarget.style.color = colors.textSecondary; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = colors.textDim; }}
              >
                <RefreshCcw size={9} />
                Reset
              </button>
            </>
          )}
        </div>
        <HorizontalChainViz
          path={path}
          focusedHop={focusedHop}
          blastExpanded={blastExpanded}
          simulationResult={simulationResult}
          onHopClick={handleHopClick}
          onBlastExpand={handleBlastExpand}
          onBlastCollapse={() => setBlastExpanded(false)}
          onRunSimulation={runSimulation}
        />
      </div>

      {/* ── State-dependent details pane ─────────────────────────── */}
      <div
        className="flex-1 overflow-y-auto px-[24px] py-[20px]"
        style={{ scrollbarWidth: "thin", scrollbarColor: `rgba(87,177,255,0.10) transparent` }}
      >
        {invState === "sim-compare" && simulationResult && comparisonResult && (
          <ScenarioComparisonPane
            a={simulationResult}
            b={comparisonResult}
            path={path}
            onReset={clearSimulation}
            onAIAction={onAIAction}
          />
        )}
        {invState === "sim-result" && simulationResult && (
          <SimulationResultPane
            result={simulationResult}
            path={path}
            onReset={clearSimulation}
            onRunComparison={(simType) => focusedHop && runSimulation(simType, focusedHop)}
            onAIAction={onAIAction}
          />
        )}
        {invState === "default" && (
          <DefaultDetails path={path} onAIAction={onAIAction} />
        )}
        {invState === "node-focused" && focusedHop && (
          <NodeFocusedDetails
            hop={focusedHop}
            path={path}
            onAIAction={onAIAction}
            onRunSimulation={(simType) => runSimulation(simType, focusedHop)}
          />
        )}
        {invState === "blast-expanded" && (
          <BlastExpandedDetails
            br={path.blastRadius}
            path={path}
            onAIAction={onAIAction}
            onRunSimulation={(simType) => {
              const targetHop = path.hops[path.hops.length - 1];
              runSimulation(simType, targetHop);
            }}
          />
        )}
      </div>
    </div>
  );
}

/* ================================================================
   HORIZONTAL CHAIN VIZ
   S1: target as center anchor, chain flows left→right into it, blast radius right
   S2: BlastConnector links target node to blast radius panel
   S6: evenly spaced, aligned to center axis
   ================================================================ */

function HorizontalChainViz({
  path,
  focusedHop,
  blastExpanded,
  simulationResult,
  onHopClick,
  onBlastExpand,
  onBlastCollapse,
  onRunSimulation,
}: {
  path: AttackPathItem;
  focusedHop: PathHop | null;
  blastExpanded: boolean;
  simulationResult: SimulationResultData | null;
  onHopClick: (hop: PathHop) => void;
  onBlastExpand: () => void;
  onBlastCollapse: () => void;
  onRunSimulation: (simType: SimType, hop: PathHop) => void;
}) {
  const targetHop = path.hops[path.hops.length - 1];
  const chainHops = path.hops.slice(0, -1);

  const targetFocused =
    (focusedHop?.label === targetHop.label && focusedHop?.type === targetHop.type) ||
    blastExpanded;

  const isMitigated = (hop: PathHop) =>
    simulationResult?.mitigatedHopLabels.includes(hop.label) ?? false;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 0,
        overflowX: "auto",
        paddingBottom: 4,
        scrollbarWidth: "thin",
        scrollbarColor: `rgba(87,177,255,0.08) transparent`,
      }}
    >
      {/* Left: chain hops */}
      <div style={{ display: "flex", alignItems: "center", flex: 1, minWidth: 0 }}>
        {chainHops.map((hop, i) => {
          const isFocused = focusedHop?.label === hop.label && focusedHop?.type === hop.type;
          const mitigated = isMitigated(hop);
          const arrowColor = mitigated ? colors.textDim : HOP_CONFIG[hop.type].color;
          return (
            <React.Fragment key={hop.label + i}>
              <HopNode
                hop={hop}
                isFocused={isFocused}
                isMitigated={mitigated}
                onClick={() => onHopClick(hop)}
                onSimulate={(t) => onRunSimulation(t, hop)}
              />
              <ChainArrow color={arrowColor} muted={mitigated} />
            </React.Fragment>
          );
        })}
        <ChainArrow
          color={isMitigated(targetHop) ? colors.textDim : HOP_CONFIG[targetHop.type].color}
          thick
          muted={isMitigated(targetHop)}
        />
      </div>

      {/* Center: target (compromised) focal node */}
      <TargetNode
        hop={targetHop}
        isFocused={targetFocused}
        isMitigated={isMitigated(targetHop)}
        onClick={() => onHopClick(targetHop)}
        onSimulate={(t) => onRunSimulation(t, targetHop)}
      />

      {/* Connector to blast radius */}
      <BlastConnector expanded={blastExpanded} dimmed={simulationResult?.blastAfter.reachableAssets === 0} />

      {/* Blast radius side panel */}
      <BlastRadiusSidePanel
        br={simulationResult ? simulationResult.blastAfter : path.blastRadius}
        originalBr={simulationResult ? path.blastRadius : undefined}
        expanded={blastExpanded}
        simulated={simulationResult !== null}
        onExpand={onBlastExpand}
        onCollapse={onBlastCollapse}
      />
    </div>
  );
}

/* ================================================================
   HOP NODE — clickable chain step (S7: hover + selection states)
   ================================================================ */

function HopNode({
  hop,
  isFocused,
  isMitigated,
  onClick,
  onSimulate,
}: {
  hop: PathHop;
  isFocused: boolean;
  isMitigated: boolean;
  onClick: () => void;
  onSimulate: (t: SimType) => void;
}) {
  const cfg = HOP_CONFIG[hop.type];
  const [hovered, setHovered] = useState(false);
  const [simMenuOpen, setSimMenuOpen] = useState(false);
  const active = isFocused || hovered;

  // Simulation types relevant to chain hops (not target)
  const simOptions: { type: SimType; label: string }[] =
    hop.type === "entry"
      ? [{ type: "close-exposure", label: "Close Exposure" }, { type: "patch", label: "Patch" }]
      : hop.type === "exploit"
      ? [{ type: "patch", label: "Patch" }, { type: "revoke-creds", label: "Revoke Creds" }]
      : [{ type: "block-lateral", label: "Block Lateral" }, { type: "patch", label: "Patch" }];

  return (
    <div
      style={{ position: "relative", flexShrink: 0 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setSimMenuOpen(false); }}
    >
      <button
        onClick={onClick}
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 4,
          padding: "8px 10px",
          borderRadius: 8,
          border: `1px solid ${isMitigated ? `${colors.textDim}30` : active ? cfg.color : `${cfg.color}35`}`,
          backgroundColor: isMitigated
            ? "rgba(255,255,255,0.008)"
            : active ? cfg.bg : "rgba(255,255,255,0.015)",
          cursor: "pointer",
          transition: "all 0.14s ease",
          minWidth: 72,
          maxWidth: 96,
          outline: "none",
          opacity: isMitigated ? 0.35 : 1,
          transform: isFocused && !isMitigated ? "translateY(-2px)" : "none",
          boxShadow: isFocused && !isMitigated ? `0 4px 14px ${cfg.color}28` : "none",
        }}
      >
        <span style={{
          fontSize: 8, fontWeight: 700, textTransform: "uppercase",
          letterSpacing: "0.06em",
          color: isMitigated ? colors.textDim : cfg.color,
          backgroundColor: isMitigated ? "rgba(255,255,255,0.04)" : `${cfg.color}18`,
          padding: "1px 5px", borderRadius: 3,
          textDecoration: isMitigated ? "line-through" : "none",
        }}>
          {isMitigated ? "Mitigated" : cfg.label}
        </span>
        <span style={{
          fontSize: 10, fontWeight: 600,
          color: isMitigated ? colors.textDim : active ? colors.textPrimary : colors.textSecondary,
          textAlign: "center", lineHeight: "13px",
          wordBreak: "break-word",
        }}>
          {hop.label}
        </span>
      </button>

      {/* Simulate button — appears on hover when not mitigated */}
      {hovered && !isMitigated && (
        <div style={{ position: "absolute", bottom: -26, left: "50%", transform: "translateX(-50%)", zIndex: 10 }}>
          <button
            onMouseDown={(e) => { e.stopPropagation(); setSimMenuOpen((p) => !p); }}
            style={{
              display: "flex", alignItems: "center", gap: 3,
              padding: "2px 6px", borderRadius: 4, fontSize: 8, fontWeight: 600,
              color: "#2fd897", border: "1px solid rgba(47,216,151,0.25)",
              backgroundColor: "rgba(47,216,151,0.08)", cursor: "pointer",
              whiteSpace: "nowrap", outline: "none",
            }}
          >
            <FlaskConical size={8} />
            Simulate
          </button>
        </div>
      )}

      {/* Sim type dropdown */}
      {simMenuOpen && (
        <div style={{
          position: "absolute", bottom: -82, left: "50%", transform: "translateX(-50%)",
          backgroundColor: colors.bgCard, border: `1px solid ${colors.border}`,
          borderRadius: 8, overflow: "hidden", zIndex: 20, minWidth: 130,
          boxShadow: "0 4px 16px rgba(0,0,0,0.35)",
        }}>
          {simOptions.map(({ type, label }) => (
            <button
              key={type}
              onMouseDown={(e) => {
                e.stopPropagation();
                setSimMenuOpen(false);
                setHovered(false);
                onSimulate(type);
              }}
              style={{
                display: "block", width: "100%", textAlign: "left",
                padding: "7px 12px", fontSize: 10, fontWeight: 500,
                color: SIM_TYPE_CONFIG[type].color,
                backgroundColor: "transparent", border: "none", cursor: "pointer",
                borderBottom: `1px solid ${colors.border}`,
                transition: "background 0.1s",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = colors.hoverOverlay; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
            >
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ================================================================
   TARGET NODE — the compromised focal node (S1: center anchor)
   ================================================================ */

function TargetNode({
  hop,
  isFocused,
  isMitigated,
  onClick,
  onSimulate,
}: {
  hop: PathHop;
  isFocused: boolean;
  isMitigated: boolean;
  onClick: () => void;
  onSimulate: (t: SimType) => void;
}) {
  const cfg = HOP_CONFIG[hop.type];
  const [hovered, setHovered] = useState(false);
  const [simMenuOpen, setSimMenuOpen] = useState(false);
  const active = isFocused || hovered;

  const simOptions: { type: SimType; label: string }[] = [
    { type: "isolate", label: "Isolate Workload" },
    { type: "apply-control", label: "Apply Control" },
    { type: "patch", label: "Patch" },
  ];

  return (
    <div
      style={{ position: "relative", flexShrink: 0 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setSimMenuOpen(false); }}
    >
      {/* Label above node */}
      <div style={{
        position: "absolute", top: -18, left: "50%", transform: "translateX(-50%)",
        whiteSpace: "nowrap", fontSize: 8, fontWeight: 700,
        textTransform: "uppercase", letterSpacing: "0.07em",
        color: isMitigated ? "#2fd897" : cfg.color,
        backgroundColor: colors.bgApp,
        padding: "1px 8px",
        border: `1px solid ${isMitigated ? "rgba(47,216,151,0.40)" : `${cfg.color}45`}`,
        borderRadius: 9999,
      }}>
        {isMitigated ? "Protected" : "Compromised"}
      </div>

      <button
        onClick={onClick}
        style={{
          display: "flex", flexDirection: "column", alignItems: "center", gap: 5,
          padding: "14px 18px", borderRadius: 12,
          border: `2px solid ${isMitigated ? "rgba(47,216,151,0.50)" : active ? cfg.color : `${cfg.color}50`}`,
          backgroundColor: isMitigated
            ? "rgba(47,216,151,0.06)"
            : isFocused ? `${cfg.color}18`
            : hovered ? `${cfg.color}0a`
            : "rgba(167,139,250,0.06)",
          cursor: "pointer",
          transition: "all 0.14s ease",
          minWidth: 110,
          outline: "none",
          opacity: isMitigated ? 0.55 : 1,
          boxShadow: isMitigated
            ? "0 0 14px rgba(47,216,151,0.18)"
            : isFocused ? `0 0 22px ${cfg.color}35, 0 4px 18px ${cfg.color}22`
            : hovered ? `0 0 12px ${cfg.color}1a`
            : "none",
          transform: isFocused && !isMitigated ? "scale(1.04)" : "none",
        }}
      >
        <span style={{
          fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em",
          color: isMitigated ? "#2fd897" : cfg.color,
          backgroundColor: isMitigated ? "rgba(47,216,151,0.15)" : `${cfg.color}18`,
          padding: "2px 7px", borderRadius: 4,
        }}>
          {isMitigated ? "Mitigated" : cfg.label}
        </span>
        <span style={{ fontSize: 12, fontWeight: 700, color: isMitigated ? colors.textDim : colors.textPrimary, textAlign: "center", lineHeight: "15px" }}>
          {hop.label}
        </span>
        {hop.note && !isMitigated && (
          <span style={{ fontSize: 9, color: colors.textDim, textAlign: "center", lineHeight: "12px", maxWidth: 100 }}>
            {hop.note.split("·")[0].trim()}
          </span>
        )}
      </button>

      {/* Simulate hover button */}
      {hovered && !isMitigated && (
        <div style={{ position: "absolute", bottom: -26, left: "50%", transform: "translateX(-50%)", zIndex: 10 }}>
          <button
            onMouseDown={(e) => { e.stopPropagation(); setSimMenuOpen((p) => !p); }}
            style={{
              display: "flex", alignItems: "center", gap: 3,
              padding: "2px 8px", borderRadius: 4, fontSize: 8, fontWeight: 600,
              color: "#2fd897", border: "1px solid rgba(47,216,151,0.25)",
              backgroundColor: "rgba(47,216,151,0.08)", cursor: "pointer",
              whiteSpace: "nowrap", outline: "none",
            }}
          >
            <FlaskConical size={8} />
            Simulate
          </button>
        </div>
      )}

      {simMenuOpen && (
        <div style={{
          position: "absolute", bottom: -98, left: "50%", transform: "translateX(-50%)",
          backgroundColor: colors.bgCard, border: `1px solid ${colors.border}`,
          borderRadius: 8, overflow: "hidden", zIndex: 20, minWidth: 140,
          boxShadow: "0 4px 16px rgba(0,0,0,0.35)",
        }}>
          {simOptions.map(({ type, label }) => (
            <button
              key={type}
              onMouseDown={(e) => {
                e.stopPropagation();
                setSimMenuOpen(false);
                setHovered(false);
                onSimulate(type);
              }}
              style={{
                display: "block", width: "100%", textAlign: "left",
                padding: "7px 12px", fontSize: 10, fontWeight: 500,
                color: SIM_TYPE_CONFIG[type].color,
                backgroundColor: "transparent", border: "none", cursor: "pointer",
                borderBottom: `1px solid ${colors.border}`,
                transition: "background 0.1s",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = colors.hoverOverlay; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
            >
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ================================================================
   CHAIN ARROW — connector between hop nodes
   ================================================================ */

function ChainArrow({ color, thick, muted }: { color: string; thick?: boolean; muted?: boolean }) {
  const alpha = muted ? "22" : "55";
  const alphaHead = muted ? "30" : "80";
  return (
    <div style={{ display: "flex", alignItems: "center", flexShrink: 0, padding: "0 2px" }}>
      <div style={{
        width: thick ? 18 : 12,
        height: thick ? 1.5 : 1,
        backgroundColor: `${color}${alpha}`,
      }} />
      <div style={{
        width: 0, height: 0,
        borderTop: `${thick ? 4 : 3}px solid transparent`,
        borderBottom: `${thick ? 4 : 3}px solid transparent`,
        borderLeft: `${thick ? 6 : 5}px solid ${color}${alphaHead}`,
      }} />
    </div>
  );
}

/* ================================================================
   BLAST CONNECTOR — visual link from target to blast radius (S2)
   ================================================================ */

function BlastConnector({ expanded, dimmed }: { expanded: boolean; dimmed?: boolean }) {
  const lineColor = dimmed
    ? "rgba(167,139,250,0.12)"
    : expanded ? "rgba(167,139,250,0.65)" : "rgba(167,139,250,0.30)";
  const headColor = dimmed
    ? "rgba(167,139,250,0.18)"
    : expanded ? "rgba(167,139,250,0.85)" : "rgba(167,139,250,0.42)";
  return (
    <div style={{ display: "flex", alignItems: "center", flexShrink: 0, padding: "0 4px", transition: "all 0.2s" }}>
      <div style={{
        width: expanded ? 24 : 16,
        height: 1.5,
        backgroundColor: lineColor,
        transition: "all 0.2s ease",
      }} />
      <div style={{
        width: 0, height: 0,
        borderTop: "4px solid transparent",
        borderBottom: "4px solid transparent",
        borderLeft: `6px solid ${headColor}`,
        transition: "all 0.2s ease",
      }} />
    </div>
  );
}

/* ================================================================
   BLAST RADIUS SIDE PANEL — collapsed pill / expanded card (S2, S3)
   Anchored right of the target node — shows how compromise propagates
   ================================================================ */

function BlastRadiusSidePanel({
  br,
  originalBr,
  expanded,
  simulated,
  onExpand,
  onCollapse,
}: {
  br: BlastSnapshot | BlastRadiusData;
  originalBr?: BlastRadiusData;
  expanded: boolean;
  simulated?: boolean;
  onExpand: () => void;
  onCollapse: () => void;
}) {
  const spread = SPREAD_CONFIG[br.spread];
  const collapsed = br.reachableAssets === 0 && simulated;

  if (!expanded) {
    return (
      <button
        onClick={onExpand}
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          gap: 5,
          padding: "10px 14px",
          borderRadius: 10,
          border: `1px solid ${collapsed ? "rgba(47,216,151,0.22)" : "rgba(167,139,250,0.22)"}`,
          backgroundColor: collapsed ? "rgba(47,216,151,0.04)" : "rgba(167,139,250,0.06)",
          cursor: "pointer",
          flexShrink: 0,
          minWidth: 120,
          outline: "none",
          transition: "all 0.15s ease",
          textAlign: "left",
          opacity: collapsed ? 0.65 : 1,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = collapsed ? "rgba(47,216,151,0.08)" : "rgba(167,139,250,0.11)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = collapsed ? "rgba(47,216,151,0.04)" : "rgba(167,139,250,0.06)";
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <Activity size={10} color={collapsed ? "#2fd897" : "#a78bfa"} />
          <span style={{ fontSize: 9, fontWeight: 700, color: collapsed ? "#2fd897" : "#a78bfa", textTransform: "uppercase", letterSpacing: "0.06em" }}>
            {simulated ? "Simulated Radius" : "Blast Radius"}
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
          {simulated && originalBr && originalBr.reachableAssets !== br.reachableAssets && (
            <span style={{ fontSize: 11, color: colors.textDim, textDecoration: "line-through" }}>
              {originalBr.reachableAssets}
            </span>
          )}
          <span style={{ fontSize: 20, fontWeight: 700, color: collapsed ? "#2fd897" : "#a78bfa", lineHeight: 1 }}>
            {br.reachableAssets}
          </span>
          <span style={{ fontSize: 9, color: colors.textDim }}>assets</span>
        </div>
        {br.crownJewels.length > 0 ? (
          <span style={{ fontSize: 9, color: colors.critical, fontWeight: 600 }}>
            {br.crownJewels.length} crown jewels
          </span>
        ) : simulated ? (
          <span style={{ fontSize: 9, color: "#2fd897", fontWeight: 600 }}>No crown jewels exposed</span>
        ) : null}
        <span style={{ fontSize: 8, color: collapsed ? "#2fd897" : spread.color, fontWeight: 600 }}>
          {collapsed ? "Contained" : `${spread.label} · expand →`}
        </span>
      </button>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 10,
        padding: "12px 14px",
        borderRadius: 10,
        border: "1px solid rgba(167,139,250,0.28)",
        backgroundColor: "rgba(167,139,250,0.07)",
        flexShrink: 0,
        width: 210,
        position: "relative",
      }}
    >
      <button
        onClick={onCollapse}
        style={{
          position: "absolute", top: 8, right: 8,
          width: 18, height: 18,
          display: "flex", alignItems: "center", justifyContent: "center",
          borderRadius: 4, border: "none",
          backgroundColor: "transparent", cursor: "pointer",
          color: colors.textDim, transition: "background 0.12s",
        }}
        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = colors.hoverOverlay; }}
        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
      >
        <X size={10} />
      </button>

      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <Activity size={11} color={simulated ? "#2fd897" : "#a78bfa"} />
        <span style={{ fontSize: 10, fontWeight: 700, color: simulated ? "#2fd897" : "#a78bfa", textTransform: "uppercase", letterSpacing: "0.06em" }}>
          {simulated ? "Simulated Radius" : "Blast Radius"}
        </span>
        <span style={{
          fontSize: 8, fontWeight: 600, color: spread.color,
          backgroundColor: `${spread.color}18`,
          padding: "1px 6px", borderRadius: 9999,
        }}>
          {spread.label}
        </span>
        {simulated && (
          <span style={{ fontSize: 8, color: colors.textDim, fontStyle: "italic" }}>
            · hypothetical
          </span>
        )}
      </div>

      {/* Stats — with delta when simulated */}
      <div style={{ display: "flex", gap: 6 }}>
        {[
          { val: br.reachableAssets, orig: originalBr?.reachableAssets, label: "Assets", color: simulated ? "#2fd897" : "#a78bfa" },
          { val: br.crownJewels.length, orig: originalBr?.crownJewels.length, label: "Crown Jewels", color: br.crownJewels.length > 0 ? colors.critical : "#2fd897" },
          { val: br.identityRoutes, orig: originalBr?.identityRoutes, label: "Identity", color: br.identityRoutes > 0 ? colors.high : colors.textDim },
        ].map(({ val, orig, label, color }) => (
          <div key={label} style={{ flex: 1, textAlign: "center" }}>
            {simulated && orig !== undefined && orig !== val && (
              <div style={{ fontSize: 10, color: colors.textDim, textDecoration: "line-through", lineHeight: 1 }}>{orig}</div>
            )}
            <div style={{ fontSize: 18, fontWeight: 700, color, lineHeight: 1 }}>{val}</div>
            <div style={{ fontSize: 7, color: colors.textDim, textTransform: "uppercase", letterSpacing: "0.04em", marginTop: 3 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Crown jewel pills */}
      {br.crownJewels.length > 0 ? (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
          {br.crownJewels.map((cj) => (
            <span key={cj} style={{
              fontSize: 9, color: colors.critical,
              backgroundColor: "rgba(239,68,68,0.08)",
              border: "1px solid rgba(239,68,68,0.18)",
              padding: "2px 6px", borderRadius: 3,
            }}>
              {cj}
            </span>
          ))}
        </div>
      ) : simulated ? (
        <div style={{ fontSize: 9, color: "#2fd897", fontWeight: 600 }}>
          ✓ No crown jewels exposed
        </div>
      ) : null}

      {"scenario" in br && (
        <p style={{ fontSize: 9, color: colors.textMuted, lineHeight: "13px", margin: 0 }}>
          {(br as BlastRadiusData).scenario}
        </p>
      )}
    </div>
  );
}

/* ================================================================
   DEFAULT DETAILS — shown when no node is selected
   ================================================================ */

function DefaultDetails({
  path,
  onAIAction,
}: {
  path: AttackPathItem;
  onAIAction: (p: AttackPathItem, prompt: string) => void;
}) {
  return (
    <div className="flex flex-col gap-[18px]">
      {/* Hint */}
      <div style={{
        padding: "10px 14px", borderRadius: 8,
        border: `1px solid rgba(87,177,255,0.10)`,
        backgroundColor: "rgba(87,177,255,0.03)",
      }}>
        <p style={{ fontSize: 11, color: colors.textDim, lineHeight: "16px" }}>
          Click any node in the attack chain to investigate that step in detail, or expand the blast radius panel to see affected assets.
        </p>
      </div>

      {/* Why critical */}
      <section>
        <InvSectionLabel icon={<AlertTriangle size={12} />} label="Why This Is Critical" />
        <p style={{
          fontSize: 12, color: colors.textSecondary, lineHeight: "19px",
          padding: "12px 14px", borderRadius: 8,
          backgroundColor: "rgba(239,68,68,0.04)",
          border: `1px solid rgba(239,68,68,0.10)`,
        }}>
          {path.criticalityReason}
        </p>
      </section>

      {/* Risk overview */}
      <section>
        <InvSectionLabel icon={<Shield size={12} />} label="Risk Overview" />
        <p style={{ fontSize: 12, color: colors.textSecondary, lineHeight: "18px" }}>
          {path.riskSummary}
        </p>
      </section>

      {/* Mitigations */}
      <section>
        <InvSectionLabel label="Recommended Mitigations" />
        <div className="flex flex-col gap-[8px]">
          {path.mitigations.map((m, i) => (
            <div key={i} className="flex items-start gap-[10px]">
              <span style={{ fontSize: 10, color: "#2fd897", fontWeight: 700, minWidth: 18, marginTop: 2, flexShrink: 0 }}>
                {i + 1}.
              </span>
              <span style={{ fontSize: 12, color: colors.textSecondary, lineHeight: "18px" }}>{m}</span>
            </div>
          ))}
        </div>
      </section>

      {/* AI Actions */}
      <div className="flex flex-wrap gap-[8px] pt-[4px]" style={{ borderTop: `1px solid ${colors.border}` }}>
        {[
          { label: "Explain this path", prompt: `Explain the attack path: ${path.name}` },
          { label: "Assess blast radius", prompt: `Assess the full blast radius for "${path.name}"` },
          { label: "Recommend fix", prompt: `What are the top mitigations for "${path.name}"?` },
          { label: "Create case", prompt: `Create a remediation case for "${path.name}"` },
          { label: "Simulate impact", prompt: `Simulate the impact if "${path.name}" is exploited` },
        ].map(({ label, prompt }) => (
          <button
            key={label}
            onClick={() => onAIAction(path, prompt)}
            className="px-3 py-[6px] text-[10px] font-medium rounded-[7px] border transition-colors"
            style={{ color: colors.accent, borderColor: "rgba(87,177,255,0.18)", backgroundColor: "rgba(87,177,255,0.05)" }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "rgba(87,177,255,0.12)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "rgba(87,177,255,0.05)"; }}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ================================================================
   NODE FOCUSED DETAILS — shown when a chain hop is selected (S3)
   ================================================================ */

function NodeFocusedDetails({
  hop,
  path,
  onAIAction,
  onRunSimulation,
}: {
  hop: PathHop;
  path: AttackPathItem;
  onAIAction: (p: AttackPathItem, prompt: string) => void;
  onRunSimulation: (simType: SimType) => void;
}) {
  const cfg = HOP_CONFIG[hop.type];

  const simOptions: { type: SimType; label: string }[] =
    hop.type === "entry"
      ? [{ type: "close-exposure", label: "Close Exposure" }, { type: "patch", label: "Patch Vulnerability" }]
      : hop.type === "exploit"
      ? [{ type: "patch", label: "Patch Vulnerability" }, { type: "revoke-creds", label: "Revoke Credentials" }]
      : hop.type === "target"
      ? [{ type: "isolate", label: "Isolate Workload" }, { type: "apply-control", label: "Apply Control" }]
      : [{ type: "block-lateral", label: "Block Lateral Movement" }, { type: "patch", label: "Patch" }];

  return (
    <div className="flex flex-col gap-[18px]">
      {/* Node card */}
      <div style={{ padding: "14px 16px", borderRadius: 10, border: `1px solid ${cfg.color}30`, backgroundColor: cfg.bg }}>
        <div className="flex items-center gap-[8px] mb-[8px]">
          <span style={{ fontSize: 8, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: cfg.color, backgroundColor: `${cfg.color}22`, padding: "2px 7px", borderRadius: 3 }}>
            {cfg.label}
          </span>
          <span style={{ fontSize: 14, fontWeight: 700, color: colors.textPrimary }}>{hop.label}</span>
        </div>
        {hop.note && (
          <p style={{ fontSize: 11, color: colors.textMuted, lineHeight: "16px" }}>{hop.note}</p>
        )}
      </div>

      {/* What-if simulation — entry point (S2, S10) */}
      <section style={{
        padding: "14px 16px", borderRadius: 10,
        border: "1px solid rgba(47,216,151,0.18)",
        backgroundColor: "rgba(47,216,151,0.03)",
      }}>
        <div className="flex items-center gap-[7px] mb-[10px]">
          <FlaskConical size={11} style={{ color: "#2fd897" }} />
          <span style={{ fontSize: 10, fontWeight: 700, color: "#2fd897", textTransform: "uppercase", letterSpacing: "0.06em" }}>
            What-If Simulation
          </span>
          <span style={{ fontSize: 9, color: colors.textDim, fontStyle: "italic" }}>
            · hypothetical only
          </span>
        </div>
        <p style={{ fontSize: 11, color: colors.textDim, marginBottom: 10, lineHeight: "15px" }}>
          Simulate a mitigation at "{hop.label}" and see how the attack path and blast radius respond.
        </p>
        <div className="flex flex-wrap gap-[6px]">
          {simOptions.map(({ type, label }) => (
            <button
              key={type}
              onClick={() => onRunSimulation(type)}
              style={{
                display: "flex", alignItems: "center", gap: 4,
                padding: "5px 10px", borderRadius: 6, fontSize: 10, fontWeight: 600,
                color: SIM_TYPE_CONFIG[type].color,
                border: `1px solid ${SIM_TYPE_CONFIG[type].color}30`,
                backgroundColor: `${SIM_TYPE_CONFIG[type].color}08`,
                cursor: "pointer", outline: "none", transition: "all 0.12s",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = `${SIM_TYPE_CONFIG[type].color}15`; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = `${SIM_TYPE_CONFIG[type].color}08`; }}
            >
              <Play size={8} />
              {label}
            </button>
          ))}
        </div>
      </section>

      {/* Criticality */}
      <section>
        <InvSectionLabel icon={<AlertTriangle size={12} />} label="Why This Step Is Critical" />
        <p style={{ fontSize: 12, color: colors.textSecondary, lineHeight: "19px", padding: "12px 14px", borderRadius: 8, backgroundColor: "rgba(239,68,68,0.04)", border: `1px solid rgba(239,68,68,0.10)` }}>
          {path.criticalityReason}
        </p>
      </section>

      {/* Mitigations */}
      <section>
        <InvSectionLabel label="Recommended Mitigations" />
        <div className="flex flex-col gap-[8px]">
          {path.mitigations.map((m, i) => (
            <div key={i} className="flex items-start gap-[10px]">
              <span style={{ fontSize: 10, color: "#2fd897", fontWeight: 700, minWidth: 18, marginTop: 2, flexShrink: 0 }}>{i + 1}.</span>
              <span style={{ fontSize: 12, color: colors.textSecondary, lineHeight: "18px" }}>{m}</span>
            </div>
          ))}
        </div>
      </section>

      {/* AI Actions */}
      <div className="flex flex-wrap gap-[8px] pt-[4px]" style={{ borderTop: `1px solid ${colors.border}` }}>
        {[
          { label: `Explain "${hop.label}"`, prompt: `Explain the role of "${hop.label}" in the "${path.name}" attack path` },
          { label: "How to secure this node", prompt: `How do I secure "${hop.label}" to break the "${path.name}" attack chain?` },
          { label: "Create case", prompt: `Create a remediation case for the "${path.name}" attack path` },
        ].map(({ label, prompt }) => (
          <button
            key={label}
            onClick={() => onAIAction(path, prompt)}
            className="px-3 py-[6px] text-[10px] font-medium rounded-[7px] border transition-colors"
            style={{ color: colors.accent, borderColor: "rgba(87,177,255,0.18)", backgroundColor: "rgba(87,177,255,0.05)" }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "rgba(87,177,255,0.12)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "rgba(87,177,255,0.05)"; }}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ================================================================
   BLAST EXPANDED DETAILS — shown when blast radius panel is expanded (S3)
   ================================================================ */

function BlastExpandedDetails({
  br,
  path,
  onAIAction,
  onRunSimulation,
}: {
  br: BlastRadiusData;
  path: AttackPathItem;
  onAIAction: (p: AttackPathItem, prompt: string) => void;
  onRunSimulation: (simType: SimType) => void;
}) {
  const spread = SPREAD_CONFIG[br.spread];

  return (
    <div className="flex flex-col gap-[18px]">
      {/* Full blast radius breakdown */}
      <section>
        <InvSectionLabel icon={<Activity size={12} />} label="Blast Radius Detail" />
        <div
          className="rounded-[10px] p-[16px]"
          style={{ backgroundColor: "rgba(167,139,250,0.05)", border: "1px solid rgba(167,139,250,0.16)" }}
        >
          {/* Stats */}
          <div className="grid grid-cols-3 gap-[10px] mb-[14px]">
            <StatCell value={br.reachableAssets} label="Reachable Assets" color="#a78bfa" />
            <StatCell value={br.crownJewels.length} label="Crown Jewels" color={br.crownJewels.length > 0 ? colors.critical : colors.textDim} />
            <StatCell value={br.identityRoutes} label="Identity Routes" color={br.identityRoutes > 0 ? colors.high : colors.textDim} />
          </div>

          {/* Crown jewels */}
          {br.crownJewels.length > 0 && (
            <div className="flex flex-wrap gap-[6px] mb-[12px]">
              {br.crownJewels.map((cj) => (
                <span key={cj} style={{
                  fontSize: 10, fontWeight: 500, color: colors.critical,
                  backgroundColor: "rgba(239,68,68,0.08)",
                  border: "1px solid rgba(239,68,68,0.18)",
                  padding: "2px 8px", borderRadius: 4,
                }}>
                  {cj}
                </span>
              ))}
            </div>
          )}

          {/* Spread + scenario */}
          <div className="flex items-center gap-[8px] mb-[8px]">
            <span style={{ fontSize: 9, fontWeight: 600, color: spread.color }}>
              {spread.label}
            </span>
          </div>
          <p style={{ fontSize: 11, color: colors.textMuted, lineHeight: "16px" }}>
            <span style={{ color: "#a78bfa", fontWeight: 600 }}>Scenario: </span>
            {br.scenario}
          </p>
        </div>
      </section>

      {/* What-if simulation entry from blast radius */}
      <section style={{
        padding: "14px 16px", borderRadius: 10,
        border: "1px solid rgba(47,216,151,0.18)",
        backgroundColor: "rgba(47,216,151,0.03)",
      }}>
        <div className="flex items-center gap-[7px] mb-[10px]">
          <FlaskConical size={11} style={{ color: "#2fd897" }} />
          <span style={{ fontSize: 10, fontWeight: 700, color: "#2fd897", textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Simulate Mitigation
          </span>
          <span style={{ fontSize: 9, color: colors.textDim, fontStyle: "italic" }}>· hypothetical only</span>
        </div>
        <p style={{ fontSize: 11, color: colors.textDim, marginBottom: 10, lineHeight: "15px" }}>
          Apply a hypothetical control to the compromised node and recompute blast radius.
        </p>
        <div className="flex flex-wrap gap-[6px]">
          {(["isolate", "apply-control", "block-lateral"] as SimType[]).map((type) => (
            <button
              key={type}
              onClick={() => onRunSimulation(type)}
              style={{
                display: "flex", alignItems: "center", gap: 4,
                padding: "5px 10px", borderRadius: 6, fontSize: 10, fontWeight: 600,
                color: SIM_TYPE_CONFIG[type].color,
                border: `1px solid ${SIM_TYPE_CONFIG[type].color}30`,
                backgroundColor: `${SIM_TYPE_CONFIG[type].color}08`,
                cursor: "pointer", outline: "none", transition: "all 0.12s",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = `${SIM_TYPE_CONFIG[type].color}15`; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = `${SIM_TYPE_CONFIG[type].color}08`; }}
            >
              <Play size={8} />
              {SIM_TYPE_CONFIG[type].label}
            </button>
          ))}
        </div>
      </section>

      {/* AI Actions */}
      <div className="flex flex-wrap gap-[8px] pt-[4px]" style={{ borderTop: `1px solid ${colors.border}` }}>
        {[
          { label: "Assess full impact", prompt: `Assess the full blast radius for "${path.name}": ${br.reachableAssets} assets, ${br.crownJewels.length} crown jewels. What is the business impact?` },
          { label: "Crown jewel exposure", prompt: `Which crown jewel assets are exposed in the "${path.name}" blast radius and what's the risk?` },
          { label: "Simulate impact", prompt: `Simulate the impact if "${path.name}" is fully exploited across all ${br.reachableAssets} reachable assets` },
          { label: "Create case", prompt: `Create a remediation case for "${path.name}" with blast radius documentation` },
        ].map(({ label, prompt }) => (
          <button
            key={label}
            onClick={() => onAIAction(path, prompt)}
            className="px-3 py-[6px] text-[10px] font-medium rounded-[7px] border transition-colors"
            style={{ color: colors.accent, borderColor: "rgba(87,177,255,0.18)", backgroundColor: "rgba(87,177,255,0.05)" }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "rgba(87,177,255,0.12)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "rgba(87,177,255,0.05)"; }}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ================================================================
   SIMULATION RESULT PANE — before/after, path status, alt paths (S4–S8, S11)
   ================================================================ */

function SimulationResultPane({
  result,
  path,
  onReset,
  onRunComparison,
  onAIAction,
}: {
  result: SimulationResultData;
  path: AttackPathItem;
  onReset: () => void;
  onRunComparison: (simType: SimType) => void;
  onAIAction: (p: AttackPathItem, prompt: string) => void;
}) {
  const statusCfg = PATH_STATUS_CONFIG[result.pathStatus];
  const simCfg = SIM_TYPE_CONFIG[result.scenario.type];

  return (
    <div className="flex flex-col gap-[16px]">
      {/* Hypothetical label — required S11 clarity */}
      <div style={{
        display: "flex", alignItems: "center", gap: 8, justifyContent: "space-between",
        padding: "8px 12px", borderRadius: 8,
        border: "1px solid rgba(47,216,151,0.20)",
        backgroundColor: "rgba(47,216,151,0.04)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
          <FlaskConical size={11} color="#2fd897" />
          <span style={{ fontSize: 10, fontWeight: 700, color: "#2fd897", textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Simulation — Hypothetical Only
          </span>
        </div>
        <button
          onClick={onReset}
          style={{
            display: "flex", alignItems: "center", gap: 4,
            fontSize: 9, color: colors.textDim, background: "none", border: "none",
            cursor: "pointer", padding: 0,
          }}
          onMouseEnter={(e) => { e.currentTarget.style.color = colors.textSecondary; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = colors.textDim; }}
        >
          <RefreshCcw size={9} />
          Reset
        </button>
      </div>

      {/* Scenario description */}
      <div style={{ padding: "12px 14px", borderRadius: 8, border: `1px solid ${simCfg.color}22`, backgroundColor: `${simCfg.color}06` }}>
        <div style={{ fontSize: 9, fontWeight: 700, color: simCfg.color, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 5 }}>
          Scenario
        </div>
        <div style={{ fontSize: 12, fontWeight: 600, color: colors.textPrimary, marginBottom: 4 }}>
          {result.scenario.title}
        </div>
        <p style={{ fontSize: 11, color: colors.textMuted, lineHeight: "15px" }}>
          {result.scenario.hypothesis}
        </p>
      </div>

      {/* Path status badge */}
      <div style={{
        display: "flex", alignItems: "center", gap: 10,
        padding: "12px 14px", borderRadius: 8,
        border: `1px solid ${statusCfg.color}30`,
        backgroundColor: statusCfg.bg,
      }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 9, fontWeight: 700, color: statusCfg.color, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>
            Path Result
          </div>
          <div style={{ fontSize: 14, fontWeight: 700, color: statusCfg.color }}>
            {result.pathStatusLabel}
          </div>
        </div>
        <div style={{
          fontSize: 9, fontWeight: 600, color: statusCfg.color,
          border: `1px solid ${statusCfg.color}40`,
          backgroundColor: `${statusCfg.color}15`,
          padding: "3px 10px", borderRadius: 9999,
        }}>
          {result.pathStatus}
        </div>
      </div>

      {/* Before / After comparison table (S5) */}
      <section>
        <InvSectionLabel icon={<GitBranch size={12} />} label="Before / After" />
        <div style={{ borderRadius: 8, border: `1px solid ${colors.border}`, overflow: "hidden" }}>
          {[
            {
              label: "Reachable Assets",
              before: `${result.blastBefore.reachableAssets}`,
              after: `${result.blastAfter.reachableAssets}`,
              improved: result.blastAfter.reachableAssets < result.blastBefore.reachableAssets,
            },
            {
              label: "Crown Jewels Exposed",
              before: `${result.blastBefore.crownJewels.length}`,
              after: `${result.blastAfter.crownJewels.length}`,
              improved: result.blastAfter.crownJewels.length < result.blastBefore.crownJewels.length,
            },
            {
              label: "Identity Routes",
              before: `${result.blastBefore.identityRoutes}`,
              after: `${result.blastAfter.identityRoutes}`,
              improved: result.blastAfter.identityRoutes <= result.blastBefore.identityRoutes,
            },
            {
              label: "Attack Path Status",
              before: "Active",
              after: result.pathStatusLabel,
              improved: result.pathStatus !== "unchanged",
            },
          ].map((row, i) => (
            <div
              key={row.label}
              style={{
                display: "flex", alignItems: "center",
                padding: "8px 12px",
                borderBottom: i < 3 ? `1px solid ${colors.border}` : "none",
                backgroundColor: i % 2 === 0 ? "rgba(255,255,255,0.01)" : "transparent",
              }}
            >
              <span style={{ flex: 1, fontSize: 11, color: colors.textMuted }}>{row.label}</span>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 11, color: colors.textDim, textDecoration: "line-through" }}>
                  {row.before}
                </span>
                <span style={{ fontSize: 10, color: colors.textDim }}>→</span>
                <span style={{
                  fontSize: 11, fontWeight: 700,
                  color: row.improved ? "#2fd897" : colors.critical,
                }}>
                  {row.after}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Why it changed (S5) */}
      <section>
        <InvSectionLabel icon={<Shield size={12} />} label="Why It Changed" />
        <p style={{ fontSize: 12, color: colors.textSecondary, lineHeight: "19px", padding: "10px 12px", borderRadius: 8, backgroundColor: "rgba(255,255,255,0.02)", border: `1px solid ${colors.border}` }}>
          {result.whyItChanged}
        </p>
      </section>

      {/* Alternative paths — surface if any (S8) */}
      {result.alternativePaths.length > 0 && (
        <section>
          <InvSectionLabel icon={<GitBranch size={12} />} label="Alternative Paths Detected" />
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {result.alternativePaths.map((alt, i) => (
              <div key={i} style={{
                padding: "10px 12px", borderRadius: 8,
                border: `1px solid ${SEVERITY_COLOR[alt.severity]}30`,
                backgroundColor: `${SEVERITY_COLOR[alt.severity]}06`,
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                  <AlertTriangle size={10} color={SEVERITY_COLOR[alt.severity]} />
                  <span style={{ fontSize: 9, fontWeight: 700, color: SEVERITY_COLOR[alt.severity], textTransform: "uppercase" }}>
                    Via {alt.via}
                  </span>
                </div>
                <p style={{ fontSize: 11, color: colors.textMuted, lineHeight: "15px" }}>
                  {alt.description}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Residual risk summary */}
      <section>
        <InvSectionLabel label="Residual Risk" />
        <p style={{ fontSize: 12, color: colors.textSecondary, lineHeight: "18px" }}>
          {result.residualRisk}
        </p>
      </section>

      {/* Follow-up actions (S14) */}
      <div style={{ borderTop: `1px solid ${colors.border}`, paddingTop: 14, display: "flex", flexDirection: "column", gap: 10 }}>
        <span style={{ fontSize: 9, fontWeight: 700, color: colors.textDim, textTransform: "uppercase", letterSpacing: "0.06em" }}>
          Next Steps
        </span>

        {/* Compare another scenario (S12) */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          <span style={{ fontSize: 10, color: colors.textDim, alignSelf: "center" }}>Compare:</span>
          {(["isolate", "block-lateral", "apply-control"] as SimType[])
            .filter((t) => t !== result.scenario.type)
            .slice(0, 2)
            .map((type) => (
              <button
                key={type}
                onClick={() => onRunComparison(type)}
                style={{
                  display: "flex", alignItems: "center", gap: 4,
                  padding: "4px 9px", borderRadius: 5, fontSize: 9, fontWeight: 600,
                  color: SIM_TYPE_CONFIG[type].color,
                  border: `1px solid ${SIM_TYPE_CONFIG[type].color}28`,
                  backgroundColor: `${SIM_TYPE_CONFIG[type].color}06`,
                  cursor: "pointer", outline: "none",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = `${SIM_TYPE_CONFIG[type].color}14`; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = `${SIM_TYPE_CONFIG[type].color}06`; }}
              >
                <FlaskConical size={8} />
                {SIM_TYPE_CONFIG[type].label}
              </button>
            ))}
        </div>

        {/* Real-world follow-up actions */}
        <div className="flex flex-wrap gap-[6px]">
          {[
            { label: "Create remediation task", prompt: `Create a remediation task for "${result.scenario.title}" on the "${path.name}" attack path` },
            { label: "Create case", prompt: `Create a security case for "${path.name}" based on the simulation result: ${result.pathStatusLabel}` },
            { label: "Show remaining risks", prompt: `What are the remaining risks after simulating "${result.scenario.title}" on "${path.name}"? ${result.residualRisk}` },
            { label: "Delegate for review", prompt: `Draft a delegation request for the "${result.scenario.title}" mitigation on "${path.name}"` },
          ].map(({ label, prompt }) => (
            <button
              key={label}
              onClick={() => onAIAction(path, prompt)}
              className="px-3 py-[6px] text-[10px] font-medium rounded-[7px] border transition-colors"
              style={{ color: colors.accent, borderColor: "rgba(87,177,255,0.18)", backgroundColor: "rgba(87,177,255,0.05)" }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "rgba(87,177,255,0.12)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "rgba(87,177,255,0.05)"; }}
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
   SCENARIO COMPARISON PANE — side-by-side two simulations (S12)
   ================================================================ */

function ScenarioComparisonPane({
  a,
  b,
  path,
  onReset,
  onAIAction,
}: {
  a: SimulationResultData;
  b: SimulationResultData;
  path: AttackPathItem;
  onReset: () => void;
  onAIAction: (p: AttackPathItem, prompt: string) => void;
}) {
  // Determine which scenario performs better
  const aScore =
    (a.blastBefore.reachableAssets - a.blastAfter.reachableAssets) +
    (a.blastBefore.crownJewels.length - a.blastAfter.crownJewels.length) * 3 +
    (a.pathStatus === "broken" ? 5 : a.pathStatus === "reduced" ? 2 : 0);
  const bScore =
    (b.blastBefore.reachableAssets - b.blastAfter.reachableAssets) +
    (b.blastBefore.crownJewels.length - b.blastAfter.crownJewels.length) * 3 +
    (b.pathStatus === "broken" ? 5 : b.pathStatus === "reduced" ? 2 : 0);
  const winner = aScore >= bScore ? "a" : "b";

  const statusA = PATH_STATUS_CONFIG[a.pathStatus];
  const statusB = PATH_STATUS_CONFIG[b.pathStatus];

  return (
    <div className="flex flex-col gap-[16px]">
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
          <FlaskConical size={11} color="#2fd897" />
          <span style={{ fontSize: 10, fontWeight: 700, color: "#2fd897", textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Scenario Comparison — Hypothetical Only
          </span>
        </div>
        <button
          onClick={onReset}
          style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 9, color: colors.textDim, background: "none", border: "none", cursor: "pointer", padding: 0 }}
          onMouseEnter={(e) => { e.currentTarget.style.color = colors.textSecondary; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = colors.textDim; }}
        >
          <RefreshCcw size={9} />
          Reset
        </button>
      </div>

      {/* Side by side cards */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {([{ result: a, side: "a" }, { result: b, side: "b" }] as const).map(({ result, side }) => {
          const cfg = SIM_TYPE_CONFIG[result.scenario.type];
          const sCfg = PATH_STATUS_CONFIG[result.pathStatus];
          const isWinner = winner === side;
          return (
            <div key={side} style={{
              padding: "12px 14px", borderRadius: 10,
              border: `1px solid ${isWinner ? "rgba(47,216,151,0.35)" : colors.border}`,
              backgroundColor: isWinner ? "rgba(47,216,151,0.04)" : "rgba(255,255,255,0.015)",
              position: "relative",
            }}>
              {isWinner && (
                <div style={{
                  position: "absolute", top: -10, left: "50%", transform: "translateX(-50%)",
                  fontSize: 8, fontWeight: 700, color: "#2fd897",
                  backgroundColor: colors.bgApp, padding: "1px 8px",
                  border: "1px solid rgba(47,216,151,0.35)", borderRadius: 9999,
                  whiteSpace: "nowrap",
                }}>
                  More Effective
                </div>
              )}
              <div style={{ fontSize: 8, fontWeight: 700, color: cfg.color, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>
                {cfg.label}
              </div>
              <div style={{ fontSize: 11, fontWeight: 600, color: colors.textPrimary, marginBottom: 10, lineHeight: "14px" }}>
                {result.scenario.targetHopLabel}
              </div>
              <div style={{ fontSize: 10, fontWeight: 700, color: sCfg.color, marginBottom: 8 }}>
                {sCfg.label}
              </div>
              {[
                { label: "Assets", before: result.blastBefore.reachableAssets, after: result.blastAfter.reachableAssets },
                { label: "Crown Jewels", before: result.blastBefore.crownJewels.length, after: result.blastAfter.crownJewels.length },
                { label: "Alt Paths", before: "-", after: result.alternativePaths.length },
              ].map(({ label, before, after }) => (
                <div key={label} style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ fontSize: 10, color: colors.textDim }}>{label}</span>
                  <span style={{ fontSize: 10, color: "#2fd897", fontWeight: 600 }}>
                    {before !== "-" ? `${before} → ` : ""}{after}
                  </span>
                </div>
              ))}
              {result.alternativePaths.length > 0 && (
                <div style={{ marginTop: 8, fontSize: 9, color: colors.high }}>
                  ⚠ {result.alternativePaths.length} alt route(s) remain
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Recommendation */}
      <div style={{ padding: "12px 14px", borderRadius: 8, border: `1px solid rgba(87,177,255,0.14)`, backgroundColor: "rgba(87,177,255,0.04)" }}>
        <div style={{ fontSize: 9, fontWeight: 700, color: colors.accent, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>
          Recommendation
        </div>
        <p style={{ fontSize: 11, color: colors.textSecondary, lineHeight: "16px" }}>
          {winner === "a" ? a.scenario.title : b.scenario.title} reduces blast radius more effectively
          {(winner === "a" ? a : b).alternativePaths.length === 0 ? " and leaves no alternative paths." : ", though alternative routes remain."}
          {" "}Consider combining both mitigations for maximum coverage.
        </p>
      </div>

      {/* Follow-up actions */}
      <div className="flex flex-wrap gap-[6px] pt-[4px]" style={{ borderTop: `1px solid ${colors.border}` }}>
        {[
          { label: "Create task for winning scenario", prompt: `Create a remediation task for "${winner === "a" ? a.scenario.title : b.scenario.title}" on "${path.name}"` },
          { label: "Explain comparison", prompt: `Compare these two mitigations for "${path.name}": "${a.scenario.title}" vs "${b.scenario.title}". Which should we prioritize?` },
          { label: "Create case", prompt: `Create a case for "${path.name}" based on the scenario comparison results` },
        ].map(({ label, prompt }) => (
          <button
            key={label}
            onClick={() => onAIAction(path, prompt)}
            className="px-3 py-[6px] text-[10px] font-medium rounded-[7px] border transition-colors"
            style={{ color: colors.accent, borderColor: "rgba(87,177,255,0.18)", backgroundColor: "rgba(87,177,255,0.05)" }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "rgba(87,177,255,0.12)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "rgba(87,177,255,0.05)"; }}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ================================================================
   NO SELECTION STATE — aggregate overview
   ================================================================ */

function NoSelectionState({
  paths,
  onSelect,
  onInvestigate,
}: {
  paths: AttackPathItem[];
  onSelect: (p: AttackPathItem) => void;
  onInvestigate: () => void;
}) {
  const activePaths = paths.filter((p) => p.status === "active");
  const totalAssets = paths.reduce((s, p) => s + p.blastRadius.reachableAssets, 0);
  const allCrownJewels = new Set(paths.flatMap((p) => p.blastRadius.crownJewels));
  const topPath = activePaths[0] ?? paths[0];

  return (
    <div className="flex flex-col h-full px-[32px] py-[28px] gap-[24px]">
      {/* Prompt */}
      <div>
        <h3 style={{ fontSize: 16, fontWeight: 600, color: colors.textPrimary, marginBottom: 6 }}>
          Select a path to investigate
        </h3>
        <p style={{ fontSize: 12, color: colors.textMuted }}>
          Choose an attack path from the list to see the full chain, blast radius, and recommended mitigations.
        </p>
      </div>

      {/* Aggregate blast radius */}
      <div
        className="rounded-[12px] p-[20px]"
        style={{ backgroundColor: colors.bgCard, border: `1px solid ${colors.border}` }}
      >
        <div className="flex items-center gap-[8px] mb-[16px]">
          <Activity size={13} style={{ color: "#a78bfa" }} />
          <span style={{ fontSize: 11, fontWeight: 600, color: "#a78bfa", textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Aggregate Blast Radius
          </span>
        </div>
        <div className="grid grid-cols-3 gap-[12px] mb-[14px]">
          <StatCell value={activePaths.length} label="Active Paths" color={colors.critical} />
          <StatCell value={totalAssets} label="Assets at Risk" color="#a78bfa" />
          <StatCell value={allCrownJewels.size} label="Crown Jewels" color={colors.high} />
        </div>
        <p style={{ fontSize: 10, color: colors.textMuted }}>
          Across all {paths.length} attack paths in the current view.
        </p>
      </div>

      {/* Quick jump to top threat */}
      {topPath && (
        <div
          className="rounded-[12px] p-[16px]"
          style={{ backgroundColor: "rgba(239,68,68,0.04)", border: "1px solid rgba(239,68,68,0.12)" }}
        >
          <div className="flex items-center gap-[8px] mb-[8px]">
            <div
              style={{
                width: 7, height: 7, borderRadius: "50%",
                backgroundColor: SEVERITY_COLOR[topPath.severity],
              }}
            />
            <span style={{ fontSize: 11, fontWeight: 600, color: colors.critical, textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Highest Risk Path
            </span>
          </div>
          <p style={{ fontSize: 13, fontWeight: 600, color: colors.textPrimary, marginBottom: 4 }}>
            {topPath.name}
          </p>
          <p style={{ fontSize: 11, color: colors.textMuted, marginBottom: 12 }}>
            {topPath.blastRadius.reachableAssets} reachable assets ·{" "}
            {topPath.blastRadius.crownJewels.length} crown jewels ·{" "}
            {SPREAD_CONFIG[topPath.blastRadius.spread].label}
          </p>
          <div className="flex gap-[8px]">
            <button
              onClick={() => onSelect(topPath)}
              className="px-3 py-[7px] text-[11px] font-medium rounded-[7px] border transition-colors"
              style={{
                color: colors.textPrimary,
                borderColor: colors.border,
                backgroundColor: colors.bgCard,
              }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = colors.hoverBg; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = colors.bgCard; }}
            >
              Open Investigation
            </button>
            <button
              onClick={onInvestigate}
              className="px-3 py-[7px] text-[11px] font-medium rounded-[7px] border transition-colors"
              style={{
                color: colors.accent,
                borderColor: "rgba(87,177,255,0.22)",
                backgroundColor: "rgba(87,177,255,0.06)",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "rgba(87,177,255,0.12)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "rgba(87,177,255,0.06)"; }}
            >
              Ask AI
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ================================================================
   SMALL REUSABLES
   ================================================================ */

function InvSectionLabel({
  label,
  icon,
}: {
  label: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-[6px] mb-[10px]">
      {icon && <span style={{ color: colors.textDim }}>{icon}</span>}
      <span
        style={{
          fontSize: 9, fontWeight: 700, textTransform: "uppercase",
          letterSpacing: "0.08em", color: colors.textDim,
        }}
      >
        {label}
      </span>
    </div>
  );
}

function StatCell({ value, label, color }: { value: number; label: string; color: string }) {
  return (
    <div
      className="flex flex-col items-center py-[10px] rounded-[8px]"
      style={{ backgroundColor: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)" }}
    >
      <span style={{ fontSize: 22, fontWeight: 700, color, lineHeight: 1 }}>{value}</span>
      <span style={{ fontSize: 9, color: colors.textDim, marginTop: 4, textTransform: "uppercase", letterSpacing: "0.04em", textAlign: "center" }}>
        {label}
      </span>
    </div>
  );
}

function AIChip({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="px-[7px] py-[3px] text-[9px] font-medium rounded-[4px] border transition-colors"
      style={{
        color: colors.accent,
        borderColor: "rgba(87,177,255,0.16)",
        backgroundColor: "rgba(87,177,255,0.04)",
      }}
      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "rgba(87,177,255,0.10)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "rgba(87,177,255,0.04)"; }}
    >
      {label}
    </button>
  );
}
