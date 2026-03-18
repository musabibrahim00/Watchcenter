/**
 * context-resolver.mjs — Maps entity names and types to structured contexts
 *
 * Mirrors the UI's deepLinkResolver.ts in concept but operates on named
 * entities rather than URL params.  Uses the same product-facing labels
 * as the UI; never exposes internal agent IDs in user-facing output.
 */

import { AGENT_ROLES, getAiBoxSuggestions } from "./skills-registry.mjs";
export { AGENT_ROLES };

// Reverse map: role label → agent id
const ROLE_TO_ID = Object.fromEntries(
  Object.entries(AGENT_ROLES).map(([id, label]) => [label.toLowerCase(), id])
);

// Short aliases for convenience
const AGENT_ALIASES = {
  "asset":           "alpha",
  "asset intel":     "alpha",
  "asset-intel":     "alpha",
  "config":          "bravo",
  "configuration":   "bravo",
  "config security": "bravo",
  "appsec":          "charlie",
  "application":     "charlie",
  "app security":    "charlie",
  "compliance":      "delta",
  "governance":      "delta",
  "risk":            "echo",
  "risk intel":      "echo",
  "exposure":        "foxtrot",
  "identity":        "golf",
  "iam":             "golf",
  "vuln":            "hotel",
  "vulnerability":   "hotel",
  "vulnerabilities": "hotel",
};

// ── Known workflows ───────────────────────────────────────────────────────────
const KNOWN_WORKFLOWS = [
  { id: "critical-alert-auto-response",  label: "Critical Alert Auto-Response" },
  { id: "asset-vulnerability-triage",    label: "Asset Vulnerability Triage" },
  { id: "compliance-drift-detection",    label: "Compliance Drift Detection" },
  { id: "identity-anomaly-response",     label: "Identity Anomaly Response" },
  { id: "patch-cycle-automation",        label: "Patch Cycle Automation" },
  { id: "threat-intel-enrichment",       label: "Threat Intelligence Enrichment" },
  { id: "incident-escalation",           label: "Incident Escalation Workflow" },
  { id: "crown-jewel-alert",             label: "Crown Jewel Asset Alert" },
];

// ── Known assets ──────────────────────────────────────────────────────────────
const KNOWN_ASSETS = [
  { id: "finance-db-01",    label: "finance-db-01",    type: "Database",         risk: "critical" },
  { id: "prod-db-03",       label: "prod-db-03",       type: "Database",         risk: "high" },
  { id: "web-node-07",      label: "web-node-07",      type: "Web Server",       risk: "high" },
  { id: "dmz-segment-04",   label: "dmz-segment-04",   type: "Network Segment",  risk: "critical" },
  { id: "api-edge-02",      label: "api-edge-02",      type: "API Gateway",      risk: "high" },
  { id: "corp-endpoint-17", label: "corp-endpoint-17", type: "Endpoint",         risk: "medium" },
  { id: "cloud-vpc-02",     label: "cloud-vpc-02",     type: "Cloud VPC",        risk: "high" },
  { id: "aws-prod",         label: "aws-prod",         type: "Cloud Environment",risk: "high" },
  { id: "iam-core-01",      label: "iam-core-01",      type: "IAM System",       risk: "critical" },
  { id: "prod-0384",        label: "prod-0384",        type: "Account",          risk: "critical" },
];

// ── Known attack paths ────────────────────────────────────────────────────────
const KNOWN_ATTACK_PATHS = [
  { id: "internet-to-finance-db-01",   label: "Internet → finance-db-01",           hops: 4, severity: "critical" },
  { id: "internet-to-root-account",    label: "Internet → Root Account",             hops: 3, severity: "critical" },
  { id: "ap-001",                      label: "External to DMZ to Finance DB",       hops: 5, severity: "critical" },
  { id: "ap-002",                      label: "Compromised Endpoint to IAM Core",    hops: 3, severity: "high" },
  { id: "ap-003",                      label: "API Edge to Production Database",     hops: 2, severity: "high" },
  { id: "lateral-movement-staging",    label: "Staging Lateral Movement",            hops: 6, severity: "medium" },
];

// ── Known compliance frameworks ───────────────────────────────────────────────
const KNOWN_COMPLIANCE = [
  { id: "soc2",      label: "SOC 2 Type II",       status: "in-review" },
  { id: "iso27001",  label: "ISO 27001",            status: "compliant" },
  { id: "pci-dss",   label: "PCI DSS 4.0",          status: "gap-identified" },
  { id: "nist-csf",  label: "NIST CSF 2.0",         status: "in-progress" },
  { id: "cis",       label: "CIS Controls v8",       status: "partial" },
  { id: "gdpr",      label: "GDPR",                  status: "compliant" },
];

// ── Fuzzy match helper ────────────────────────────────────────────────────────
function fuzzyMatch(query, items, labelKey = "label") {
  if (!query) return null;
  const q = query.toLowerCase().trim();
  // Exact match
  const exact = items.find(item => item[labelKey].toLowerCase() === q || item.id?.toLowerCase() === q);
  if (exact) return exact;
  // Starts with
  const prefix = items.find(item => item[labelKey].toLowerCase().startsWith(q) || item.id?.toLowerCase().startsWith(q));
  if (prefix) return prefix;
  // Contains
  const contains = items.find(item => item[labelKey].toLowerCase().includes(q) || item.id?.toLowerCase().includes(q));
  if (contains) return contains;
  return null;
}

// ── Agent resolution ──────────────────────────────────────────────────────────
export function resolveAgent(nameOrAlias) {
  if (!nameOrAlias) return null;
  const key = nameOrAlias.toLowerCase().trim();

  // Direct ID match
  if (AGENT_ROLES[key]) {
    return { type: "agent", agentId: key, label: AGENT_ROLES[key], sublabel: "Analyst Context" };
  }

  // Alias match
  const aliasId = AGENT_ALIASES[key];
  if (aliasId) {
    return { type: "agent", agentId: aliasId, label: AGENT_ROLES[aliasId], sublabel: "Analyst Context" };
  }

  // Role label match (e.g. "Vulnerability Analyst")
  const roleId = ROLE_TO_ID[key];
  if (roleId) {
    return { type: "agent", agentId: roleId, label: AGENT_ROLES[roleId], sublabel: "Analyst Context" };
  }

  // Partial role label match
  const partialId = Object.entries(AGENT_ROLES).find(([, label]) =>
    label.toLowerCase().includes(key)
  )?.[0];
  if (partialId) {
    return { type: "agent", agentId: partialId, label: AGENT_ROLES[partialId], sublabel: "Analyst Context" };
  }

  return null;
}

// ── Workflow resolution ───────────────────────────────────────────────────────
export function resolveWorkflow(name) {
  if (!name) return null;
  const wf = fuzzyMatch(name, KNOWN_WORKFLOWS);
  if (!wf) return null;
  return { type: "workflow", id: wf.id, label: wf.label, sublabel: "Workflow Context" };
}

// ── Asset resolution ──────────────────────────────────────────────────────────
export function resolveAsset(name) {
  if (!name) return null;
  const asset = fuzzyMatch(name, KNOWN_ASSETS);
  if (!asset) {
    // Return unknown asset context
    return { type: "asset", id: name, label: name, sublabel: "Asset Context", risk: "unknown", assetType: "Asset" };
  }
  return { type: "asset", id: asset.id, label: asset.label, sublabel: `${asset.type} · Asset Context`, risk: asset.risk, assetType: asset.type };
}

// ── Attack path resolution ────────────────────────────────────────────────────
export function resolveAttackPath(name) {
  if (!name) return null;
  const path = fuzzyMatch(name, KNOWN_ATTACK_PATHS);
  if (!path) {
    return { type: "attack-path", id: name, label: name, sublabel: "Attack Path Context", hops: null, severity: "unknown" };
  }
  return { type: "attack-path", id: path.id, label: path.label, sublabel: `Attack Path · ${path.hops} hops · ${path.severity.toUpperCase()}`, hops: path.hops, severity: path.severity };
}

// ── Compliance resolution ─────────────────────────────────────────────────────
export function resolveCompliance(name) {
  if (!name) return null;
  const fw = fuzzyMatch(name, KNOWN_COMPLIANCE);
  if (!fw) {
    return { type: "compliance", id: name, label: name, sublabel: "Compliance Context", status: "unknown" };
  }
  return { type: "compliance", id: fw.id, label: fw.label, sublabel: `Compliance · ${fw.status}`, status: fw.status };
}

// ── General / Watch Center context ────────────────────────────────────────────
export function watchCenterContext() {
  return { type: "general", id: "watch-center", label: "Watch Center", sublabel: "Security Overview" };
}

// ── Smart entity inference (for investigate/explain/simulate/rerun) ───────────
export function inferContext(entity) {
  if (!entity) return watchCenterContext();

  // Try each resolver in priority order
  const agent = resolveAgent(entity);
  if (agent) return agent;

  const asset = fuzzyMatch(entity, KNOWN_ASSETS);
  if (asset) return resolveAsset(entity);

  const path = fuzzyMatch(entity, KNOWN_ATTACK_PATHS);
  if (path) return resolveAttackPath(entity);

  const wf = fuzzyMatch(entity, KNOWN_WORKFLOWS);
  if (wf) return resolveWorkflow(entity);

  const fw = fuzzyMatch(entity, KNOWN_COMPLIANCE);
  if (fw) return resolveCompliance(entity);

  // Return a graceful fallback
  return {
    type: "general",
    id: entity,
    label: entity,
    sublabel: "Context unavailable — showing nearest available context",
    isFallback: true,
  };
}

// ── Derive UI deep-link path for a context ────────────────────────────────────
export function deriveUIPath(ctx) {
  switch (ctx.type) {
    case "agent":       return `/agent/${ctx.agentId}`;
    case "asset":       return `/asset/${ctx.id}`;
    case "attack-path": return `/attack-paths/${ctx.id}`;
    case "workflow":    return `/workflows/new/${ctx.id}`;
    case "compliance":  return `/compliance`;
    case "general":
    default:            return `/`;
  }
}

// ── Suggest similar entities when resolution fails ────────────────────────────
export function suggestSimilar(query) {
  const q = query.toLowerCase();
  const suggestions = [];

  for (const [id, label] of Object.entries(AGENT_ROLES)) {
    if (label.toLowerCase().includes(q) || id.includes(q)) {
      suggestions.push(`secops agent "${label}"`);
    }
  }
  for (const a of KNOWN_ASSETS) {
    if (a.id.includes(q) || a.label.toLowerCase().includes(q)) {
      suggestions.push(`secops asset ${a.id}`);
    }
  }
  for (const p of KNOWN_ATTACK_PATHS) {
    if (p.id.includes(q) || p.label.toLowerCase().includes(q)) {
      suggestions.push(`secops attack-path ${p.id}`);
    }
  }
  for (const w of KNOWN_WORKFLOWS) {
    if (w.id.includes(q) || w.label.toLowerCase().includes(q)) {
      suggestions.push(`secops workflow "${w.label}"`);
    }
  }

  return suggestions.slice(0, 3);
}
