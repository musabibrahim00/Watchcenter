/**
 * Security Graph Page — Expanded Mock Data
 * ==========================================
 *
 * Full graph dataset with 35+ nodes and 45+ edges.
 * The focused graph engine ensures only a subset is rendered at once,
 * starting from a single focus node.
 *
 * x/y are placeholders — layout is computed dynamically by FocusedGraphCanvas.
 */

export interface SGNode {
  id: string;
  type: "asset" | "vulnerability" | "attack-path" | "risk" | "case" | "workflow";
  label: string;
  sublabel?: string;
  severity?: "critical" | "high" | "medium" | "low";
  x: number;
  y: number;
}

export interface SGEdge {
  from: string;
  to: string;
  label?: string;
}

export const SG_NODES: SGNode[] = [
  // ── Assets ──
  { id: "asset-1", type: "asset", label: "finance-db-01", sublabel: "PostgreSQL", severity: "critical", x: 0, y: 0 },
  { id: "asset-2", type: "asset", label: "web-app-prod", sublabel: "Apache", severity: "high", x: 0, y: 0 },
  { id: "asset-3", type: "asset", label: "k8s-node-01", sublabel: "EKS", severity: "high", x: 0, y: 0 },
  { id: "asset-4", type: "asset", label: "ci-cd-runner", sublabel: "Jenkins", severity: "medium", x: 0, y: 0 },
  { id: "asset-5", type: "asset", label: "auth-service", sublabel: "OAuth", severity: "high", x: 0, y: 0 },
  { id: "asset-6", type: "asset", label: "api-gateway", sublabel: "Kong", severity: "medium", x: 0, y: 0 },
  { id: "asset-7", type: "asset", label: "s3-data-lake", sublabel: "S3", severity: "high", x: 0, y: 0 },
  { id: "asset-8", type: "asset", label: "redis-cache", sublabel: "Redis", severity: "low", x: 0, y: 0 },
  { id: "asset-9", type: "asset", label: "vpn-gateway", sublabel: "WireGuard", severity: "medium", x: 0, y: 0 },
  { id: "asset-10", type: "asset", label: "monitoring-srv", sublabel: "Prometheus", severity: "low", x: 0, y: 0 },
  // ── Vulnerabilities ──
  { id: "vuln-1", type: "vulnerability", label: "CVE-2023-4211", sublabel: "SQL Injection", severity: "critical", x: 0, y: 0 },
  { id: "vuln-2", type: "vulnerability", label: "CVE-2023-5432", sublabel: "RCE", severity: "high", x: 0, y: 0 },
  { id: "vuln-3", type: "vulnerability", label: "CVE-2024-1234", sublabel: "SSRF", severity: "high", x: 0, y: 0 },
  { id: "vuln-4", type: "vulnerability", label: "CVE-2024-5678", sublabel: "XSS", severity: "medium", x: 0, y: 0 },
  { id: "vuln-5", type: "vulnerability", label: "CVE-2023-9012", sublabel: "Path Traversal", severity: "high", x: 0, y: 0 },
  { id: "vuln-6", type: "vulnerability", label: "CVE-2024-3456", sublabel: "Auth Bypass", severity: "critical", x: 0, y: 0 },
  { id: "vuln-7", type: "vulnerability", label: "CVE-2023-7890", sublabel: "Deserialization", severity: "high", x: 0, y: 0 },
  { id: "vuln-8", type: "vulnerability", label: "CVE-2024-2345", sublabel: "Buffer Overflow", severity: "critical", x: 0, y: 0 },
  { id: "vuln-9", type: "vulnerability", label: "CVE-2023-6543", sublabel: "Priv Escalation", severity: "high", x: 0, y: 0 },
  { id: "vuln-10", type: "vulnerability", label: "CVE-2024-7891", sublabel: "IDOR", severity: "medium", x: 0, y: 0 },
  { id: "vuln-11", type: "vulnerability", label: "CVE-2023-1111", sublabel: "Log Injection", severity: "low", x: 0, y: 0 },
  { id: "vuln-12", type: "vulnerability", label: "CVE-2024-8765", sublabel: "Open Redirect", severity: "medium", x: 0, y: 0 },
  // ── Attack Paths ──
  { id: "path-1", type: "attack-path", label: "Lateral Movement Path", sublabel: "3 hops", severity: "critical", x: 0, y: 0 },
  { id: "path-2", type: "attack-path", label: "Privilege Escalation", sublabel: "2 hops", severity: "high", x: 0, y: 0 },
  { id: "path-3", type: "attack-path", label: "Container Escape", sublabel: "4 hops", severity: "critical", x: 0, y: 0 },
  { id: "path-4", type: "attack-path", label: "Data Exfil via S3", sublabel: "2 hops", severity: "high", x: 0, y: 0 },
  // ── Risks ──
  { id: "risk-1", type: "risk", label: "Domain Controller Access", sublabel: "Critical Risk", severity: "critical", x: 0, y: 0 },
  { id: "risk-2", type: "risk", label: "Data Exfiltration", sublabel: "High Risk", severity: "high", x: 0, y: 0 },
  { id: "risk-3", type: "risk", label: "Supply Chain Compromise", sublabel: "High Risk", severity: "high", x: 0, y: 0 },
  // ── Cases ──
  { id: "case-1", type: "case", label: "CASE-2024-0042", sublabel: "Active Investigation", severity: "critical", x: 0, y: 0 },
  { id: "case-2", type: "case", label: "CASE-2024-0038", sublabel: "Under Review", severity: "high", x: 0, y: 0 },
  { id: "case-3", type: "case", label: "CASE-2024-0055", sublabel: "Pending", severity: "medium", x: 0, y: 0 },
  // ── Workflows ──
  { id: "workflow-1", type: "workflow", label: "Auto Patch & Isolate", sublabel: "Automated", x: 0, y: 0 },
  { id: "workflow-2", type: "workflow", label: "Vulnerability Scan", sublabel: "Scheduled", x: 0, y: 0 },
  { id: "workflow-3", type: "workflow", label: "Incident Response", sublabel: "Manual", x: 0, y: 0 },
];

export const SG_EDGES: SGEdge[] = [
  // ── Primary chain 1 ──
  { from: "asset-1", to: "vuln-1", label: "has" },
  { from: "vuln-1", to: "path-1", label: "enables" },
  { from: "path-1", to: "risk-1", label: "creates" },
  { from: "risk-1", to: "case-1", label: "tracked by" },
  { from: "case-1", to: "workflow-1", label: "triggers" },
  // ── Primary chain 2 ──
  { from: "asset-2", to: "vuln-2", label: "has" },
  { from: "vuln-2", to: "path-2", label: "enables" },
  { from: "path-2", to: "risk-2", label: "creates" },
  { from: "risk-2", to: "case-2", label: "tracked by" },
  { from: "case-2", to: "workflow-2", label: "triggers" },
  // ── Extra vulns from asset-1 ──
  { from: "asset-1", to: "vuln-3" },
  { from: "asset-1", to: "vuln-4" },
  { from: "asset-1", to: "vuln-5" },
  { from: "asset-1", to: "vuln-6" },
  { from: "asset-1", to: "vuln-7" },
  { from: "asset-1", to: "vuln-8" },
  { from: "asset-1", to: "vuln-9" },
  { from: "asset-1", to: "vuln-10" },
  { from: "asset-1", to: "vuln-11" },
  { from: "asset-1", to: "vuln-12" },
  // ── Cross-asset connections ──
  { from: "asset-2", to: "vuln-3" },
  { from: "asset-3", to: "vuln-5" },
  { from: "asset-3", to: "vuln-7" },
  { from: "asset-4", to: "vuln-9" },
  { from: "asset-5", to: "vuln-6" },
  { from: "asset-6", to: "vuln-4" },
  { from: "asset-7", to: "vuln-12" },
  // ── Attack path members ──
  { from: "vuln-3", to: "path-3", label: "enables" },
  { from: "vuln-5", to: "path-3", label: "enables" },
  { from: "vuln-12", to: "path-4", label: "enables" },
  { from: "path-3", to: "risk-3", label: "creates" },
  { from: "path-4", to: "risk-2", label: "creates" },
  // ── Case → workflow links ──
  { from: "risk-3", to: "case-3", label: "tracked by" },
  { from: "case-3", to: "workflow-3", label: "triggers" },
  // ── Network connectivity ──
  { from: "asset-1", to: "asset-2" },
  { from: "asset-2", to: "asset-3" },
  { from: "asset-3", to: "asset-4" },
  { from: "asset-5", to: "asset-6" },
  { from: "asset-6", to: "asset-7" },
  { from: "asset-6", to: "asset-8" },
  { from: "asset-9", to: "asset-2" },
  { from: "asset-10", to: "asset-3" },
];

/** Default focus: the critical finance-db asset. */
export const SG_DEFAULT_FOCUS = "asset-1";
