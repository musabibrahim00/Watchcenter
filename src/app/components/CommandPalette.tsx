/**
 * Command Palette Component
 * ==========================
 *
 * Global command palette for searching and triggering actions across
 * the platform. Triggered by Cmd+K or Ctrl+K.
 *
 * Supports: Assets, Cases, Workflows, CVEs, Attack Paths, Risks, Actions, AI Queries
 * Actions:  Open Asset, Create Case, Run Workflow, Simulate Attack Path, Open Risk
 *
 * Results are grouped by entity type and rendered with rich, entity-specific cards.
 */

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useNavigate, useLocation } from "react-router";
import {
  Search, X, Server, FolderOpen, Workflow, GitBranch, AlertTriangle,
  Shield, Target, Plus, Play, Eye, Sparkles, ArrowRight,
  Bug, Radio, Activity, Zap, Clock, TrendingUp, BarChart3,
  ExternalLink, FileText, ChevronRight, Cpu, Globe, Lock,
  AlertCircle, Crosshair, RotateCcw, Box, Hash,
} from "lucide-react";
import { colors } from "../shared/design-system/tokens";

/* ================================================================
   TYPES
   ================================================================ */

type EntityType =
  | "asset"
  | "case"
  | "workflow"
  | "cve"
  | "attack-path"
  | "risk"
  | "action"
  | "ai-query";

type Severity = "critical" | "high" | "medium" | "low" | "info";

interface SearchResult {
  id: string;
  type: EntityType;
  title: string;
  subtitle?: string;
  severity?: Severity;
  path?: string;
  keywords?: string[];
  meta?: Record<string, string>;
}

interface QuickAction {
  id: string;
  label: string;
  icon: React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }>;
  action: () => void;
  accent?: boolean;
}

interface CommandGroup {
  type: EntityType;
  label: string;
  icon: React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }>;
  accentColor: string;
  results: SearchResult[];
}

/* ================================================================
   ENTITY CONFIG
   ================================================================ */

const ENTITY_CONFIG: Record<
  EntityType,
  {
    label: string;
    pluralLabel: string;
    icon: React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }>;
    accentColor: string;
  }
> = {
  action: { label: "Action", pluralLabel: "Actions", icon: Play, accentColor: colors.accent },
  asset: { label: "Asset", pluralLabel: "Assets", icon: Server, accentColor: "#2bb7ff" },
  case: { label: "Case", pluralLabel: "Cases", icon: FolderOpen, accentColor: "#f5b301" },
  workflow: { label: "Workflow", pluralLabel: "Workflows", icon: Workflow, accentColor: colors.active },
  cve: { label: "CVE", pluralLabel: "CVEs", icon: Bug, accentColor: "#ff4d4f" },
  "attack-path": { label: "Attack Path", pluralLabel: "Attack Paths", icon: GitBranch, accentColor: "#ff7a1a" },
  risk: { label: "Risk", pluralLabel: "Risks", icon: AlertTriangle, accentColor: "#ff5f56" },
  "ai-query": { label: "AI Query", pluralLabel: "AI Queries", icon: Sparkles, accentColor: "#a78bfa" },
};

/* ================================================================
   MOCK DATA — Entities
   ================================================================ */

const ENTITY_DATA: SearchResult[] = [
  // ── Assets ──
  { id: "asset-1", type: "asset", title: "finance-db-01", subtitle: "PostgreSQL Database • 10.0.1.23", severity: "critical", path: "/assets/asset-1", keywords: ["finance", "database", "postgres", "db", "critical", "sql"], meta: { type: "Database", ip: "10.0.1.23", vulns: "12", env: "Production" } },
  { id: "asset-2", type: "asset", title: "web-app-prod", subtitle: "Apache Web Server • 10.0.2.44", severity: "high", path: "/assets/asset-2", keywords: ["web", "apache", "production", "server", "http"], meta: { type: "Web Server", ip: "10.0.2.44", vulns: "7", env: "Production" } },
  { id: "asset-3", type: "asset", title: "dc-primary-01", subtitle: "Domain Controller • 10.0.0.5", severity: "critical", path: "/assets/asset-3", keywords: ["domain", "controller", "dc", "active directory", "ad"], meta: { type: "Domain Controller", ip: "10.0.0.5", vulns: "3", env: "Core" } },
  { id: "asset-4", type: "asset", title: "k8s-cluster-prod", subtitle: "Kubernetes Control Plane • 10.0.3.10", severity: "medium", path: "/assets/asset-4", keywords: ["kubernetes", "k8s", "cluster", "container", "pod"], meta: { type: "Kubernetes", ip: "10.0.3.10", vulns: "5", env: "Production" } },
  { id: "asset-5", type: "asset", title: "vpn-gateway-01", subtitle: "VPN Concentrator • 203.0.113.5", severity: "high", path: "/assets/asset-5", keywords: ["vpn", "gateway", "remote", "access", "network"], meta: { type: "Gateway", ip: "203.0.113.5", vulns: "2", env: "Edge" } },
  { id: "asset-6", type: "asset", title: "ci-cd-jenkins", subtitle: "Jenkins Build Server • 10.0.4.88", severity: "medium", path: "/assets/asset-6", keywords: ["jenkins", "ci", "cd", "build", "pipeline", "devops"], meta: { type: "CI/CD Server", ip: "10.0.4.88", vulns: "4", env: "DevOps" } },
  { id: "asset-7", type: "asset", title: "s3-logs-archive", subtitle: "AWS S3 Bucket • us-east-1", severity: "low", path: "/assets/asset-7", keywords: ["s3", "aws", "bucket", "logs", "archive", "cloud", "storage"], meta: { type: "Cloud Storage", ip: "us-east-1", vulns: "1", env: "Cloud" } },

  // ── Cases ──
  { id: "case-1", type: "case", title: "CASE-2024-0042", subtitle: "Critical Attack Path Investigation", severity: "critical", path: "/case-management/CASE-2024-0042", keywords: ["case", "investigation", "critical", "attack", "path"], meta: { status: "Open", assignee: "Sarah Chen", priority: "P1", age: "2d" } },
  { id: "case-2", type: "case", title: "CASE-2024-0038", subtitle: "Vulnerability Remediation — CVE-2024-3094", severity: "high", path: "/case-management/CASE-2024-0038", keywords: ["case", "vulnerability", "remediation", "xz", "backdoor"], meta: { status: "In Progress", assignee: "Mike Torres", priority: "P2", age: "5d" } },
  { id: "case-3", type: "case", title: "CASE-2024-0051", subtitle: "Lateral Movement Detection", severity: "critical", path: "/case-management/CASE-2024-0051", keywords: ["case", "lateral", "movement", "detection", "incident"], meta: { status: "Open", assignee: "Alex Rivera", priority: "P1", age: "4h" } },
  { id: "case-4", type: "case", title: "CASE-2024-0047", subtitle: "Compliance Violation — PCI-DSS", severity: "medium", path: "/case-management/CASE-2024-0047", keywords: ["case", "compliance", "pci", "dss", "violation"], meta: { status: "Awaiting Approval", assignee: "Lisa Park", priority: "P3", age: "7d" } },
  { id: "case-5", type: "case", title: "CASE-2024-0053", subtitle: "Suspicious DNS Exfiltration", severity: "high", path: "/case-management/CASE-2024-0053", keywords: ["case", "dns", "exfiltration", "suspicious", "data loss"], meta: { status: "Open", assignee: "Sarah Chen", priority: "P1", age: "1h" } },

  // ── Workflows ──
  { id: "workflow-1", type: "workflow", title: "Automated Vulnerability Patching", subtitle: "Active • 45 runs this week", path: "/workflows/new/workflow-1", keywords: ["workflow", "automation", "patch", "vulnerability", "remediation"], meta: { status: "Active", runs: "45", success: "98%", lastRun: "12m ago" } },
  { id: "workflow-2", type: "workflow", title: "Asset Containment", subtitle: "Active • 12 runs this week", path: "/workflows/new/workflow-2", keywords: ["workflow", "containment", "isolation", "incident", "response"], meta: { status: "Active", runs: "12", success: "100%", lastRun: "3h ago" } },
  { id: "workflow-3", type: "workflow", title: "Critical Alert Auto-Response", subtitle: "Active • 89 runs this week", path: "/workflows/new/workflow-3", keywords: ["workflow", "alert", "auto", "response", "critical", "triage"], meta: { status: "Active", runs: "89", success: "95%", lastRun: "4m ago" } },
  { id: "workflow-4", type: "workflow", title: "Compliance Check Automation", subtitle: "Active • 7 runs today", path: "/workflows/new/workflow-4", keywords: ["workflow", "compliance", "check", "audit", "pci", "soc2"], meta: { status: "Active", runs: "7", success: "100%", lastRun: "1h ago" } },
  { id: "workflow-5", type: "workflow", title: "Threat Intel Enrichment", subtitle: "Active • 203 runs this week", path: "/workflows/new/workflow-5", keywords: ["workflow", "threat", "intel", "enrichment", "ioc", "indicator"], meta: { status: "Active", runs: "203", success: "99%", lastRun: "2m ago" } },

  // ── CVEs ──
  { id: "cve-1", type: "cve", title: "CVE-2024-3094", subtitle: "XZ Utils Backdoor — liblzma RCE", severity: "critical", path: "/vulnerabilities", keywords: ["cve", "xz", "utils", "backdoor", "liblzma", "rce", "supply chain", "2024-3094"], meta: { cvss: "10.0", affected: "3 assets", exploited: "Yes", published: "Mar 2024" } },
  { id: "cve-2", type: "cve", title: "CVE-2024-21762", subtitle: "Fortinet FortiOS — Out-of-bound Write", severity: "critical", path: "/vulnerabilities", keywords: ["cve", "fortinet", "fortios", "out", "bound", "write", "ssl", "vpn", "2024-21762"], meta: { cvss: "9.8", affected: "1 asset", exploited: "Yes", published: "Feb 2024" } },
  { id: "cve-3", type: "cve", title: "CVE-2023-44228", subtitle: "Apache Log4j — Remote Code Execution", severity: "critical", path: "/vulnerabilities", keywords: ["cve", "log4j", "apache", "rce", "remote", "code", "execution", "log4shell", "2023-44228"], meta: { cvss: "10.0", affected: "5 assets", exploited: "Yes", published: "Dec 2023" } },
  { id: "cve-4", type: "cve", title: "CVE-2024-1709", subtitle: "ConnectWise ScreenConnect Auth Bypass", severity: "critical", path: "/vulnerabilities", keywords: ["cve", "connectwise", "screenconnect", "auth", "bypass", "authentication", "2024-1709"], meta: { cvss: "10.0", affected: "2 assets", exploited: "Yes", published: "Feb 2024" } },
  { id: "cve-5", type: "cve", title: "CVE-2024-27198", subtitle: "JetBrains TeamCity — Auth Bypass", severity: "high", path: "/vulnerabilities", keywords: ["cve", "jetbrains", "teamcity", "auth", "bypass", "ci", "cd", "2024-27198"], meta: { cvss: "9.1", affected: "1 asset", exploited: "No", published: "Mar 2024" } },
  { id: "cve-6", type: "cve", title: "CVE-2024-0204", subtitle: "GoAnywhere MFT — Auth Bypass", severity: "critical", path: "/vulnerabilities", keywords: ["cve", "goanywhere", "mft", "auth", "bypass", "file", "transfer", "2024-0204"], meta: { cvss: "9.8", affected: "1 asset", exploited: "Yes", published: "Jan 2024" } },

  // ── Attack Paths ──
  { id: "path-1", type: "attack-path", title: "Lateral Movement to Crown Jewel", subtitle: "web-app-prod → dc-primary-01 → finance-db-01", severity: "critical", path: "/attack-path/path-1", keywords: ["attack", "path", "lateral", "movement", "crown", "jewel", "database"], meta: { hops: "3", blastRadius: "14 assets", choke: "dc-primary-01", risk: "9.4" } },
  { id: "path-2", type: "attack-path", title: "Privilege Escalation via Jenkins", subtitle: "ci-cd-jenkins → k8s-cluster-prod → finance-db-01", severity: "high", path: "/attack-path/path-2", keywords: ["attack", "privilege", "escalation", "jenkins", "kubernetes"], meta: { hops: "2", blastRadius: "8 assets", choke: "k8s-cluster-prod", risk: "8.7" } },
  { id: "path-3", type: "attack-path", title: "Internet-Facing RCE Chain", subtitle: "vpn-gateway-01 → web-app-prod → dc-primary-01", severity: "critical", path: "/attack-path/path-3", keywords: ["attack", "internet", "rce", "vpn", "chain", "remote", "code", "execution"], meta: { hops: "3", blastRadius: "22 assets", choke: "vpn-gateway-01", risk: "9.8" } },
  { id: "path-4", type: "attack-path", title: "Cloud Key Exfiltration", subtitle: "ci-cd-jenkins → s3-logs-archive → IAM Role Assumption", severity: "high", path: "/attack-path/path-4", keywords: ["attack", "cloud", "key", "exfiltration", "s3", "iam", "aws"], meta: { hops: "2", blastRadius: "6 assets", choke: "ci-cd-jenkins", risk: "8.2" } },

  // ── Risks ──
  { id: "risk-1", type: "risk", title: "Unpatched Critical CVEs", subtitle: "12 critical vulnerabilities across production assets", severity: "critical", path: "/risk-register", keywords: ["risk", "unpatched", "critical", "cve", "vulnerability", "production"], meta: { score: "9.6", trend: "↑ Rising", category: "Vulnerability", controls: "2/5" } },
  { id: "risk-2", type: "risk", title: "Lateral Movement Exposure", subtitle: "3 unrestricted network paths to crown jewels", severity: "critical", path: "/risk-register", keywords: ["risk", "lateral", "movement", "network", "segmentation", "crown jewel"], meta: { score: "9.2", trend: "→ Stable", category: "Network", controls: "3/6" } },
  { id: "risk-3", type: "risk", title: "Excessive Admin Privileges", subtitle: "47 service accounts with domain admin rights", severity: "high", path: "/risk-register", keywords: ["risk", "admin", "privilege", "service", "account", "domain", "identity"], meta: { score: "8.5", trend: "↓ Declining", category: "Identity", controls: "4/7" } },
  { id: "risk-4", type: "risk", title: "Supply Chain Dependency Risk", subtitle: "Unverified open-source packages in CI/CD pipeline", severity: "high", path: "/risk-register", keywords: ["risk", "supply", "chain", "dependency", "open source", "ci", "cd"], meta: { score: "7.8", trend: "↑ Rising", category: "Supply Chain", controls: "1/4" } },
];

/* ================================================================
   MOCK DATA — Global Actions
   ================================================================ */

const GLOBAL_ACTIONS: SearchResult[] = [
  { id: "action-open-asset", type: "action", title: "Open Asset", subtitle: "Navigate to Asset Register", path: "/assets", keywords: ["open", "asset", "register", "view", "browse"] },
  { id: "action-create-case", type: "action", title: "Create Case", subtitle: "Start a new security investigation", path: "/case-management", keywords: ["create", "case", "new", "investigation", "incident"] },
  { id: "action-run-workflow", type: "action", title: "Run Workflow", subtitle: "Execute an automation workflow", path: "/workflows", keywords: ["run", "workflow", "execute", "automation", "trigger"] },
  { id: "action-simulate-attack", type: "action", title: "Simulate Attack Path", subtitle: "Test attack scenarios in workflows", path: "/workflows", keywords: ["simulate", "attack", "path", "test", "scenario", "blast", "radius"] },
  { id: "action-open-risk", type: "action", title: "Open Risk Register", subtitle: "View and manage organizational risks", path: "/risk-register", keywords: ["open", "risk", "register", "view", "manage"] },
  { id: "action-open-workflows", type: "action", title: "Open Automation Workflows", subtitle: "Manage and run automation workflows", path: "/workflows", keywords: ["automation", "command", "center", "ops", "dashboard", "workflows", "audit", "logs"] },
];

const AI_QUERIES: SearchResult[] = [
  { id: "ai-1", type: "ai-query", title: "Which workflows failed today?", subtitle: "AI Query • Automation Health", keywords: ["failed", "workflows", "today", "errors", "failures"] },
  { id: "ai-2", type: "ai-query", title: "Show assets exposed to internet", subtitle: "AI Query • Attack Surface", keywords: ["assets", "exposed", "internet", "public", "surface"] },
  { id: "ai-3", type: "ai-query", title: "Explain attack path to finance-db-01", subtitle: "AI Query • Attack Path Analysis", keywords: ["attack", "path", "explain", "finance", "database"] },
  { id: "ai-4", type: "ai-query", title: "What risks increased this week?", subtitle: "AI Query • Risk Trending", keywords: ["risks", "increased", "trending", "week", "rising"] },
  { id: "ai-5", type: "ai-query", title: "List all critical CVEs with active exploits", subtitle: "AI Query • Vulnerability Intel", keywords: ["critical", "cve", "exploit", "active", "vulnerability"] },
];

/* ================================================================
   UTILITY FUNCTIONS
   ================================================================ */

function getSeverityColor(severity?: string): string {
  switch (severity) {
    case "critical": return colors.critical;
    case "high": return colors.high;
    case "medium": return colors.medium;
    case "low": return colors.low;
    case "info": return colors.info;
    default: return colors.textMuted;
  }
}

function getSeverityLabel(severity?: string): string {
  if (!severity) return "";
  return severity.charAt(0).toUpperCase() + severity.slice(1);
}

function searchEntities(query: string, currentPath: string): SearchResult[] {
  if (!query.trim()) return getContextSuggestions(currentPath);

  const q = query.toLowerCase().trim();
  const tokens = q.split(/\s+/);
  const all = [...ENTITY_DATA, ...GLOBAL_ACTIONS, ...AI_QUERIES];

  // Score-based ranking
  const scored = all
    .map((entity) => {
      let score = 0;
      const titleLower = entity.title.toLowerCase();
      const subtitleLower = (entity.subtitle || "").toLowerCase();
      const keywordsJoined = (entity.keywords || []).join(" ").toLowerCase();
      const metaJoined = entity.meta ? Object.values(entity.meta).join(" ").toLowerCase() : "";

      // Exact title match = highest
      if (titleLower === q) score += 100;
      // Title starts with query
      else if (titleLower.startsWith(q)) score += 80;
      // Title contains query
      else if (titleLower.includes(q)) score += 60;

      // Token matching
      for (const token of tokens) {
        if (titleLower.includes(token)) score += 20;
        if (subtitleLower.includes(token)) score += 10;
        if (keywordsJoined.includes(token)) score += 8;
        if (metaJoined.includes(token)) score += 5;
      }

      // Severity boost for critical items
      if (entity.severity === "critical" && score > 0) score += 5;

      return { entity, score };
    })
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((s) => s.entity);

  return scored.slice(0, 20);
}

function getContextSuggestions(currentPath: string): SearchResult[] {
  if (currentPath.includes("/assets")) {
    return [
      ...GLOBAL_ACTIONS.filter((a) => a.id === "action-create-case" || a.id === "action-simulate-attack"),
      ...ENTITY_DATA.filter((e) => e.type === "asset").slice(0, 4),
      ...ENTITY_DATA.filter((e) => e.type === "cve").slice(0, 2),
    ];
  }
  if (currentPath.includes("/workflows")) {
    return [
      ...GLOBAL_ACTIONS.filter((a) => a.id === "action-run-workflow"),
      ...ENTITY_DATA.filter((e) => e.type === "workflow").slice(0, 4),
      ...AI_QUERIES.filter((q) => q.id === "ai-1"),
    ];
  }
  if (currentPath.includes("/case-management")) {
    return [
      ...GLOBAL_ACTIONS.filter((a) => a.id === "action-create-case" || a.id === "action-run-workflow"),
      ...ENTITY_DATA.filter((e) => e.type === "case").slice(0, 4),
    ];
  }
  if (currentPath.includes("/attack-path")) {
    return [
      ...GLOBAL_ACTIONS.filter((a) => a.id === "action-simulate-attack"),
      ...ENTITY_DATA.filter((e) => e.type === "attack-path").slice(0, 4),
      ...ENTITY_DATA.filter((e) => e.type === "cve").slice(0, 2),
    ];
  }
  if (currentPath.includes("/risk")) {
    return [
      ...GLOBAL_ACTIONS.filter((a) => a.id === "action-open-risk"),
      ...ENTITY_DATA.filter((e) => e.type === "risk").slice(0, 4),
    ];
  }

  // Default: show mixed suggestions
  return [
    ...GLOBAL_ACTIONS.slice(0, 3),
    ...ENTITY_DATA.filter((e) => e.type === "asset").slice(0, 2),
    ...ENTITY_DATA.filter((e) => e.type === "case").slice(0, 2),
    ...ENTITY_DATA.filter((e) => e.type === "cve").slice(0, 2),
    ...AI_QUERIES.slice(0, 2),
  ];
}

/* ================================================================
   GROUP RESULTS BY ENTITY TYPE
   ================================================================ */

const GROUP_ORDER: EntityType[] = [
  "action", "asset", "case", "workflow", "cve", "attack-path", "risk", "ai-query",
];

function groupResults(results: SearchResult[]): CommandGroup[] {
  const buckets: Record<EntityType, SearchResult[]> = {
    action: [], asset: [], case: [], workflow: [], cve: [],
    "attack-path": [], risk: [], "ai-query": [],
  };

  results.forEach((r) => buckets[r.type].push(r));

  return GROUP_ORDER
    .filter((type) => buckets[type].length > 0)
    .map((type) => ({
      type,
      label: ENTITY_CONFIG[type].pluralLabel,
      icon: ENTITY_CONFIG[type].icon,
      accentColor: ENTITY_CONFIG[type].accentColor,
      results: buckets[type],
    }));
}

/* ================================================================
   RESULT CARD COMPONENTS — entity-specific rich cards
   ================================================================ */

/** Severity pill used across multiple card types */
function SeverityPill({ severity }: { severity?: Severity }) {
  if (!severity) return null;
  const color = getSeverityColor(severity);
  return (
    <div
      className="inline-flex items-center gap-[4px] rounded-full px-[7px] py-[1px]"
      style={{ backgroundColor: `${color}14`, border: `1px solid ${color}28` }}
    >
      <div className="size-[5px] rounded-full" style={{ backgroundColor: color }} />
      <span className="text-[9px] uppercase tracking-[0.04em]" style={{ color, fontWeight: 700 }}>
        {getSeverityLabel(severity)}
      </span>
    </div>
  );
}

/** Inline key-value metadata tag */
function MetaTag({ label, value, color: tagColor }: { label: string; value: string; color?: string }) {
  return (
    <div className="flex items-center gap-[4px]">
      <span className="text-[9px] uppercase tracking-[0.04em]" style={{ color: colors.textDim, fontWeight: 600 }}>
        {label}
      </span>
      <span className="text-[10px]" style={{ color: tagColor || colors.textSecondary, fontWeight: 500 }}>
        {value}
      </span>
    </div>
  );
}

/* ── Asset Card ── */
function AssetResultCard({ result }: { result: SearchResult }) {
  const m = result.meta || {};
  return (
    <div className="flex items-start gap-[10px] flex-1 min-w-0">
      <div
        className="size-[36px] rounded-[8px] flex items-center justify-center shrink-0 mt-[1px]"
        style={{ backgroundColor: `${ENTITY_CONFIG.asset.accentColor}10`, border: `1px solid ${ENTITY_CONFIG.asset.accentColor}20` }}
      >
        <Server size={16} color={ENTITY_CONFIG.asset.accentColor} strokeWidth={1.8} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-[8px] mb-[3px]">
          <span className="text-[13px] truncate" style={{ color: colors.textPrimary, fontWeight: 600 }}>{result.title}</span>
          <SeverityPill severity={result.severity} />
        </div>
        <div className="text-[11px] truncate mb-[5px]" style={{ color: colors.textMuted }}>{result.subtitle}</div>
        <div className="flex items-center gap-[12px] flex-wrap">
          {m.type && <MetaTag label="Type" value={m.type} />}
          {m.env && <MetaTag label="Env" value={m.env} />}
          {m.vulns && <MetaTag label="Vulns" value={m.vulns} color={parseInt(m.vulns) > 5 ? colors.critical : colors.textSecondary} />}
        </div>
      </div>
    </div>
  );
}

/* ── Case Card ── */
function CaseResultCard({ result }: { result: SearchResult }) {
  const m = result.meta || {};
  const statusColor =
    m.status === "Open" ? colors.critical :
    m.status === "In Progress" ? colors.accent :
    m.status === "Awaiting Approval" ? colors.medium :
    colors.textMuted;
  return (
    <div className="flex items-start gap-[10px] flex-1 min-w-0">
      <div
        className="size-[36px] rounded-[8px] flex items-center justify-center shrink-0 mt-[1px]"
        style={{ backgroundColor: `${ENTITY_CONFIG.case.accentColor}10`, border: `1px solid ${ENTITY_CONFIG.case.accentColor}20` }}
      >
        <FolderOpen size={16} color={ENTITY_CONFIG.case.accentColor} strokeWidth={1.8} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-[8px] mb-[3px]">
          <span className="text-[13px] font-mono" style={{ color: colors.textPrimary, fontWeight: 600 }}>{result.title}</span>
          <SeverityPill severity={result.severity} />
          {m.priority && (
            <span className="text-[9px] rounded-[3px] px-[5px] py-[1px]" style={{ backgroundColor: `${colors.accent}18`, color: colors.accent, fontWeight: 700 }}>
              {m.priority}
            </span>
          )}
        </div>
        <div className="text-[11px] truncate mb-[5px]" style={{ color: colors.textMuted }}>{result.subtitle}</div>
        <div className="flex items-center gap-[12px] flex-wrap">
          {m.status && <MetaTag label="Status" value={m.status} color={statusColor} />}
          {m.assignee && <MetaTag label="Assignee" value={m.assignee} />}
          {m.age && <MetaTag label="Age" value={m.age} />}
        </div>
      </div>
    </div>
  );
}

/* ── Workflow Card ── */
function WorkflowResultCard({ result }: { result: SearchResult }) {
  const m = result.meta || {};
  return (
    <div className="flex items-start gap-[10px] flex-1 min-w-0">
      <div
        className="size-[36px] rounded-[8px] flex items-center justify-center shrink-0 mt-[1px]"
        style={{ backgroundColor: `${ENTITY_CONFIG.workflow.accentColor}10`, border: `1px solid ${ENTITY_CONFIG.workflow.accentColor}20` }}
      >
        <Workflow size={16} color={ENTITY_CONFIG.workflow.accentColor} strokeWidth={1.8} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-[8px] mb-[3px]">
          <span className="text-[13px] truncate" style={{ color: colors.textPrimary, fontWeight: 600 }}>{result.title}</span>
          {m.status && (
            <div
              className="size-[6px] rounded-full shrink-0"
              style={{ backgroundColor: m.status === "Active" ? colors.active : colors.textDim }}
            />
          )}
        </div>
        <div className="text-[11px] truncate mb-[5px]" style={{ color: colors.textMuted }}>{result.subtitle}</div>
        <div className="flex items-center gap-[12px] flex-wrap">
          {m.runs && <MetaTag label="Runs" value={m.runs} />}
          {m.success && <MetaTag label="Success" value={m.success} color={parseFloat(m.success) >= 98 ? colors.active : colors.medium} />}
          {m.lastRun && <MetaTag label="Last" value={m.lastRun} />}
        </div>
      </div>
    </div>
  );
}

/* ── CVE Card ── */
function CveResultCard({ result }: { result: SearchResult }) {
  const m = result.meta || {};
  const isExploited = m.exploited === "Yes";
  return (
    <div className="flex items-start gap-[10px] flex-1 min-w-0">
      <div
        className="size-[36px] rounded-[8px] flex items-center justify-center shrink-0 mt-[1px]"
        style={{ backgroundColor: `${ENTITY_CONFIG.cve.accentColor}10`, border: `1px solid ${ENTITY_CONFIG.cve.accentColor}20` }}
      >
        <Bug size={16} color={ENTITY_CONFIG.cve.accentColor} strokeWidth={1.8} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-[8px] mb-[3px]">
          <span className="text-[13px] font-mono" style={{ color: colors.textPrimary, fontWeight: 600 }}>{result.title}</span>
          <SeverityPill severity={result.severity} />
          {isExploited && (
            <span
              className="text-[9px] rounded-[3px] px-[5px] py-[1px] uppercase tracking-[0.04em]"
              style={{ backgroundColor: `${colors.critical}18`, color: colors.critical, fontWeight: 700 }}
            >
              Exploited
            </span>
          )}
        </div>
        <div className="text-[11px] truncate mb-[5px]" style={{ color: colors.textMuted }}>{result.subtitle}</div>
        <div className="flex items-center gap-[12px] flex-wrap">
          {m.cvss && <MetaTag label="CVSS" value={m.cvss} color={parseFloat(m.cvss) >= 9.0 ? colors.critical : colors.high} />}
          {m.affected && <MetaTag label="Affected" value={m.affected} />}
          {m.published && <MetaTag label="Published" value={m.published} />}
        </div>
      </div>
    </div>
  );
}

/* ── Attack Path Card ── */
function AttackPathResultCard({ result }: { result: SearchResult }) {
  const m = result.meta || {};
  return (
    <div className="flex items-start gap-[10px] flex-1 min-w-0">
      <div
        className="size-[36px] rounded-[8px] flex items-center justify-center shrink-0 mt-[1px]"
        style={{ backgroundColor: `${ENTITY_CONFIG["attack-path"].accentColor}10`, border: `1px solid ${ENTITY_CONFIG["attack-path"].accentColor}20` }}
      >
        <GitBranch size={16} color={ENTITY_CONFIG["attack-path"].accentColor} strokeWidth={1.8} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-[8px] mb-[3px]">
          <span className="text-[13px] truncate" style={{ color: colors.textPrimary, fontWeight: 600 }}>{result.title}</span>
          <SeverityPill severity={result.severity} />
        </div>
        <div className="text-[11px] truncate mb-[5px]" style={{ color: colors.textMuted }}>
          {result.subtitle}
        </div>
        <div className="flex items-center gap-[12px] flex-wrap">
          {m.hops && <MetaTag label="Hops" value={m.hops} />}
          {m.blastRadius && <MetaTag label="Blast" value={m.blastRadius} />}
          {m.choke && <MetaTag label="Choke" value={m.choke} />}
          {m.risk && <MetaTag label="Risk" value={m.risk} color={parseFloat(m.risk) >= 9 ? colors.critical : colors.high} />}
        </div>
      </div>
    </div>
  );
}

/* ── Risk Card ── */
function RiskResultCard({ result }: { result: SearchResult }) {
  const m = result.meta || {};
  const trendColor = m.trend?.includes("↑") ? colors.critical : m.trend?.includes("↓") ? colors.active : colors.textMuted;
  return (
    <div className="flex items-start gap-[10px] flex-1 min-w-0">
      <div
        className="size-[36px] rounded-[8px] flex items-center justify-center shrink-0 mt-[1px]"
        style={{ backgroundColor: `${ENTITY_CONFIG.risk.accentColor}10`, border: `1px solid ${ENTITY_CONFIG.risk.accentColor}20` }}
      >
        <AlertTriangle size={16} color={ENTITY_CONFIG.risk.accentColor} strokeWidth={1.8} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-[8px] mb-[3px]">
          <span className="text-[13px] truncate" style={{ color: colors.textPrimary, fontWeight: 600 }}>{result.title}</span>
          <SeverityPill severity={result.severity} />
        </div>
        <div className="text-[11px] truncate mb-[5px]" style={{ color: colors.textMuted }}>{result.subtitle}</div>
        <div className="flex items-center gap-[12px] flex-wrap">
          {m.score && <MetaTag label="Score" value={m.score} color={parseFloat(m.score) >= 9 ? colors.critical : colors.high} />}
          {m.trend && <MetaTag label="Trend" value={m.trend} color={trendColor} />}
          {m.category && <MetaTag label="Category" value={m.category} />}
          {m.controls && <MetaTag label="Controls" value={m.controls} />}
        </div>
      </div>
    </div>
  );
}

/* ── Action Card ── */
function ActionResultCard({ result }: { result: SearchResult }) {
  return (
    <div className="flex items-center gap-[10px] flex-1 min-w-0">
      <div
        className="size-[32px] rounded-[8px] flex items-center justify-center shrink-0"
        style={{ backgroundColor: `${colors.accent}12`, border: `1px solid ${colors.accent}20` }}
      >
        <Play size={14} color={colors.accent} strokeWidth={2} />
      </div>
      <div className="flex-1 min-w-0">
        <span className="text-[13px]" style={{ color: colors.textPrimary, fontWeight: 600 }}>{result.title}</span>
        {result.subtitle && (
          <div className="text-[11px] truncate" style={{ color: colors.textMuted }}>{result.subtitle}</div>
        )}
      </div>
    </div>
  );
}

/* ── AI Query Card ── */
function AiQueryResultCard({ result }: { result: SearchResult }) {
  return (
    <div className="flex items-center gap-[10px] flex-1 min-w-0">
      <div
        className="size-[32px] rounded-[8px] flex items-center justify-center shrink-0"
        style={{ backgroundColor: "rgba(167,139,250,0.08)", border: "1px solid rgba(167,139,250,0.18)" }}
      >
        <Sparkles size={14} color="#a78bfa" strokeWidth={2} />
      </div>
      <div className="flex-1 min-w-0">
        <span className="text-[13px]" style={{ color: colors.textPrimary, fontWeight: 500 }}>{result.title}</span>
        {result.subtitle && (
          <div className="text-[10px] truncate" style={{ color: "#a78bfa" }}>{result.subtitle}</div>
        )}
      </div>
    </div>
  );
}

/** Dispatch to the correct card component */
function ResultCard({ result }: { result: SearchResult }) {
  switch (result.type) {
    case "asset": return <AssetResultCard result={result} />;
    case "case": return <CaseResultCard result={result} />;
    case "workflow": return <WorkflowResultCard result={result} />;
    case "cve": return <CveResultCard result={result} />;
    case "attack-path": return <AttackPathResultCard result={result} />;
    case "risk": return <RiskResultCard result={result} />;
    case "action": return <ActionResultCard result={result} />;
    case "ai-query": return <AiQueryResultCard result={result} />;
    default: return <ActionResultCard result={result} />;
  }
}

/* ================================================================
   COMMAND PALETTE COMPONENT
   ================================================================ */

export function CommandPalette({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const selectedRef = useRef<HTMLDivElement>(null);

  const searchResults = useMemo(
    () => searchEntities(query, location.pathname),
    [query, location.pathname]
  );
  const groupedResults = useMemo(() => groupResults(searchResults), [searchResults]);
  const flatResults = searchResults;

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery("");
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Scroll selected into view
  useEffect(() => {
    selectedRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [selectedIndex]);

  // Quick actions for a result
  const getQuickActions = useCallback(
    (result: SearchResult): QuickAction[] => {
      const close = () => onClose();

      if (result.type === "asset") {
        return [
          { id: "open", label: "Open Asset", icon: Eye, action: () => { if (result.path) navigate(result.path); close(); } },
          { id: "case", label: "Create Case", icon: Plus, action: () => { navigate("/case-management"); close(); } },
          { id: "paths", label: "Attack Paths", icon: GitBranch, action: () => { navigate("/attack-path"); close(); } },
        ];
      }
      if (result.type === "case") {
        return [
          { id: "open", label: "Open Case", icon: Eye, action: () => { if (result.path) navigate(result.path); close(); } },
          { id: "assets", label: "Related Assets", icon: Server, action: () => { navigate("/assets"); close(); } },
          { id: "workflow", label: "Run Workflow", icon: Play, action: () => { navigate("/workflows"); close(); }, accent: true },
        ];
      }
      if (result.type === "workflow") {
        return [
          { id: "open", label: "Open", icon: Eye, action: () => { if (result.path) navigate(result.path); close(); } },
          { id: "run", label: "Run Now", icon: Play, action: () => { navigate("/workflows"); close(); }, accent: true },
          { id: "runs", label: "View Runs", icon: Activity, action: () => { navigate("/workflows"); close(); } },
        ];
      }
      if (result.type === "cve") {
        return [
          { id: "open", label: "View CVE", icon: Eye, action: () => { if (result.path) navigate(result.path); close(); } },
          { id: "assets", label: "Affected Assets", icon: Server, action: () => { navigate("/assets"); close(); } },
          { id: "case", label: "Create Case", icon: Plus, action: () => { navigate("/case-management"); close(); } },
        ];
      }
      if (result.type === "attack-path") {
        return [
          { id: "open", label: "Open Path", icon: Eye, action: () => { if (result.path) navigate(result.path); close(); } },
          { id: "simulate", label: "Simulate", icon: Crosshair, action: () => { navigate("/workflows"); close(); }, accent: true },
          { id: "case", label: "Create Case", icon: Plus, action: () => { navigate("/case-management"); close(); } },
        ];
      }
      if (result.type === "risk") {
        return [
          { id: "open", label: "Open Risk", icon: Eye, action: () => { if (result.path) navigate(result.path); close(); } },
          { id: "paths", label: "Attack Paths", icon: GitBranch, action: () => { navigate("/attack-path"); close(); } },
        ];
      }
      return [];
    },
    [navigate, onClose]
  );

  // Handle selecting a result
  const handleSelectResult = useCallback(
    (result: SearchResult) => {
      if (result.type === "ai-query") {
        navigate("/workflows");
        onClose();
      } else if (result.path) {
        navigate(result.path);
        onClose();
      }
    },
    [navigate, onClose]
  );

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 1, flatResults.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === "Enter") {
        e.preventDefault();
        const selected = flatResults[selectedIndex];
        if (selected) handleSelectResult(selected);
      } else if (e.key === "Tab") {
        e.preventDefault();
        // Tab cycles through quick actions (future enhancement)
        setSelectedIndex((prev) => (prev + 1) % Math.max(flatResults.length, 1));
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, selectedIndex, flatResults, handleSelectResult]);

  if (!isOpen) return null;

  const resultCount = flatResults.length;
  const hasQuery = query.trim().length > 0;

  return (
    <>
      {/* ── Backdrop ── */}
      <div
        className="fixed inset-0 z-[9998]"
        style={{
          backgroundColor: "rgba(0, 0, 0, 0.60)",
          backdropFilter: "blur(6px)",
        }}
        onClick={onClose}
      />

      {/* ── Command Palette Modal ── */}
      <div
        className="fixed left-1/2 top-[12%] z-[9999] w-[720px] max-w-[calc(100vw-48px)] flex flex-col overflow-hidden rounded-[14px]"
        style={{
          transform: "translateX(-50%)",
          backgroundColor: colors.bgCard,
          border: `1px solid ${colors.border}`,
          boxShadow: `0 0 0 1px ${colors.border}, 0 24px 80px rgba(0,0,0,0.50), 0 0 120px rgba(20,162,227,0.04)`,
          maxHeight: "72vh",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Search Input ── */}
        <div
          className="flex items-center gap-[12px] px-[20px] shrink-0"
          style={{
            height: 60,
            borderBottom: `1px solid ${colors.border}`,
          }}
        >
          <Search size={18} color={colors.textDim} strokeWidth={2} />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search assets, cases, workflows, CVEs, attack paths…"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            className="flex-1 text-[14px] outline-none"
            style={{
              backgroundColor: "transparent",
              color: colors.textPrimary,
            }}
          />
          {query && (
            <button
              onClick={() => { setQuery(""); setSelectedIndex(0); inputRef.current?.focus(); }}
              className="size-[24px] rounded-[5px] flex items-center justify-center cursor-pointer transition-colors shrink-0"
              style={{ backgroundColor: "transparent" }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = colors.bgCardHover; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
            >
              <X size={12} color={colors.textDim} strokeWidth={2.5} />
            </button>
          )}
          <kbd
            className="rounded-[5px] px-[7px] py-[3px] text-[10px] shrink-0"
            style={{
              backgroundColor: colors.bgApp,
              border: `1px solid ${colors.border}`,
              color: colors.textDim,
              fontWeight: 600,
            }}
          >
            ESC
          </kbd>
        </div>

        {/* ── Filter Chips (when query present) ── */}
        {hasQuery && resultCount > 0 && (
          <div
            className="flex items-center gap-[6px] px-[20px] py-[8px] shrink-0 overflow-x-auto"
            style={{ borderBottom: `1px solid ${colors.divider}` }}
          >
            <span className="text-[10px] shrink-0" style={{ color: colors.textDim, fontWeight: 500 }}>
              {resultCount} result{resultCount !== 1 ? "s" : ""}
            </span>
            <div className="w-[1px] h-[12px] shrink-0" style={{ backgroundColor: colors.border }} />
            {groupedResults.map((group) => {
              const Ic = group.icon;
              return (
                <div
                  key={group.type}
                  className="flex items-center gap-[4px] rounded-full px-[8px] py-[2px] shrink-0"
                  style={{ backgroundColor: `${group.accentColor}0C`, border: `1px solid ${group.accentColor}1A` }}
                >
                  <Ic size={10} color={group.accentColor} strokeWidth={2} />
                  <span className="text-[10px]" style={{ color: group.accentColor, fontWeight: 600 }}>
                    {group.results.length} {group.label}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {/* ── Results ── */}
        <div ref={resultsRef} className="overflow-y-auto flex-1" style={{ maxHeight: "calc(72vh - 120px)" }}>
          {resultCount === 0 ? (
            <div className="py-[52px] text-center">
              <div
                className="size-[48px] rounded-full flex items-center justify-center mx-auto mb-[14px]"
                style={{ backgroundColor: `${colors.accent}08`, border: `1px solid ${colors.accent}14` }}
              >
                <Search size={20} color={colors.textDim} strokeWidth={1.5} />
              </div>
              <p className="text-[13px] mb-[4px]" style={{ color: colors.textMuted, fontWeight: 500 }}>
                No results found
              </p>
              <p className="text-[11px]" style={{ color: colors.textDim }}>
                Try different keywords or browse by category
              </p>
            </div>
          ) : (
            <div className="py-[6px]">
              {groupedResults.map((group) => {
                const GroupIcon = group.icon;
                return (
                  <div key={group.type} className="mb-[4px]">
                    {/* Group Header */}
                    <div className="flex items-center gap-[8px] px-[20px] pt-[10px] pb-[6px]">
                      <GroupIcon size={11} color={group.accentColor} strokeWidth={2.2} />
                      <span
                        className="text-[10px] uppercase tracking-[0.08em]"
                        style={{ color: group.accentColor, fontWeight: 700 }}
                      >
                        {group.label}
                      </span>
                      <div className="flex-1 h-[1px]" style={{ backgroundColor: `${group.accentColor}14` }} />
                      <span className="text-[10px]" style={{ color: colors.textDim, fontWeight: 500 }}>
                        {group.results.length}
                      </span>
                    </div>

                    {/* Group Items */}
                    {group.results.map((result) => {
                      const globalIndex = flatResults.indexOf(result);
                      const isSelected = globalIndex === selectedIndex;
                      const quickActions = getQuickActions(result);

                      return (
                        <div
                          key={result.id}
                          ref={isSelected ? selectedRef : undefined}
                          className="px-[10px] cursor-pointer"
                          onMouseEnter={() => setSelectedIndex(globalIndex)}
                          onClick={() => handleSelectResult(result)}
                        >
                          <div
                            className="rounded-[10px] px-[12px] py-[10px] transition-all"
                            style={{
                              backgroundColor: isSelected ? colors.bgCardHover : "transparent",
                              border: isSelected ? `1px solid ${colors.border}` : "1px solid transparent",
                            }}
                          >
                            <div className="flex items-start gap-[0px]">
                              {/* Entity-specific card */}
                              <ResultCard result={result} />

                              {/* Quick actions (visible on hover/selection) */}
                              <div
                                className="flex items-center gap-[5px] shrink-0 ml-[8px] mt-[2px] transition-opacity"
                                style={{ opacity: isSelected ? 1 : 0 }}
                              >
                                {quickActions.length > 0 ? (
                                  quickActions.map((action) => (
                                    <button
                                      key={action.id}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        action.action();
                                      }}
                                      className="rounded-[6px] px-[8px] py-[5px] flex items-center gap-[4px] cursor-pointer transition-colors whitespace-nowrap"
                                      style={{
                                        backgroundColor: action.accent ? `${colors.accent}14` : colors.bgApp,
                                        border: `1px solid ${action.accent ? `${colors.accent}30` : colors.border}`,
                                      }}
                                      onMouseEnter={(e) => {
                                        e.currentTarget.style.backgroundColor = action.accent
                                          ? `${colors.accent}22`
                                          : colors.bgCardHover;
                                      }}
                                      onMouseLeave={(e) => {
                                        e.currentTarget.style.backgroundColor = action.accent
                                          ? `${colors.accent}14`
                                          : colors.bgApp;
                                      }}
                                    >
                                      <action.icon
                                        size={10}
                                        color={action.accent ? colors.accent : colors.textSecondary}
                                        strokeWidth={2}
                                      />
                                      <span
                                        className="text-[10px]"
                                        style={{
                                          color: action.accent ? colors.accent : colors.textSecondary,
                                          fontWeight: 600,
                                        }}
                                      >
                                        {action.label}
                                      </span>
                                    </button>
                                  ))
                                ) : (
                                  <ArrowRight size={14} color={colors.textDim} strokeWidth={2} />
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <div
          className="flex items-center justify-between px-[20px] shrink-0"
          style={{
            height: 42,
            borderTop: `1px solid ${colors.border}`,
            backgroundColor: colors.bgApp,
          }}
        >
          <div className="flex items-center gap-[16px]">
            {[
              { keys: "↑↓", label: "Navigate" },
              { keys: "↵", label: "Open" },
              { keys: "ESC", label: "Close" },
            ].map((hint) => (
              <div key={hint.label} className="flex items-center gap-[5px]">
                <kbd
                  className="rounded-[4px] px-[6px] py-[2px] text-[10px]"
                  style={{
                    backgroundColor: colors.bgCard,
                    border: `1px solid ${colors.border}`,
                    color: colors.textDim,
                    fontWeight: 600,
                  }}
                >
                  {hint.keys}
                </kbd>
                <span className="text-[10px]" style={{ color: colors.textDim }}>
                  {hint.label}
                </span>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-[6px]">
            <Sparkles size={10} color="#a78bfa" strokeWidth={2} />
            <span className="text-[10px]" style={{ color: colors.textDim }}>
              Type a question for AI analysis
            </span>
          </div>
        </div>
      </div>
    </>
  );
}