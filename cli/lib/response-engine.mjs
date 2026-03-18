/**
 * response-engine.mjs — Generate context-aware, read-only responses
 *
 * For each (context-type × intent) combination, produces a structured
 * response with sections, bullets, a risk level, and next-step suggestions.
 * Uses the same product-facing language as the UI.
 */

// ── Response shape ────────────────────────────────────────────────────────────
// { sections: [{ title, bullets }], riskLevel, nextSteps }

// ── Helpers ───────────────────────────────────────────────────────────────────
const s = (title, bullets) => ({ title, bullets });

// ── Agent responses ───────────────────────────────────────────────────────────
function agentResponse(ctx, intent) {
  const { label } = ctx;

  const findings = {
    "Asset Intelligence Analyst": {
      summarise: s("Findings summary (last 24 hours)", [
        "3 unregistered assets discovered on dmz-segment-04 — not previously inventoried",
        "finance-db-01 and root account reachable from internet-facing services via active attack paths",
        "Risk score for prod-0384 escalated to Critical — 5 new indicators identified",
        "247 total assets indexed — 12 newly discovered in cloud-vpc-02",
      ]),
      assess: s("Risk assessment", [
        "Overall risk level: CRITICAL",
        "High-risk assets: 8 total (3 critical, 5 high)",
        "Attack surface change: +4 newly exposed endpoints this week",
        "Most urgent: finance-db-01 — reachable via 2 confirmed external paths",
        "Risk trend: Increasing — 2 additional critical findings since yesterday",
      ]),
      explain: s("Analyst scope and capability", [
        "Responsible for discovering, inventorying, and tracking all assets across environments",
        "Monitors cloud, on-premise, and hybrid infrastructure for new or changed assets",
        "Maintains dependency maps and identifies unprotected attack surfaces",
        "Feeds asset data to Exposure and Vulnerability analysts",
      ]),
      trace: s("Active attack paths involving monitored assets", [
        "Path 1: Internet → api-edge-02 → dmz-segment-04 → finance-db-01 (4 hops, CRITICAL)",
        "Path 2: Compromised cloud-vpc-02 → iam-core-01 → Root Account (3 hops, CRITICAL)",
        "3 crown jewel assets remain reachable — immediate attention required",
      ]),
    },
    "Vulnerability Analyst": {
      summarise: s("Findings summary (last 24 hours)", [
        "CVE-2026-1847 validated on prod-db-03 — CVSS 9.8, patch available, exploit active",
        "CVE-2025-4421 on web-node-07 — CVSS 8.1, known exploit in the wild",
        "3 critical CVEs on api-edge-02 remain unpatched with confirmed public exposure",
        "14 total CVEs across production: 3 critical, 7 high, 4 medium",
      ]),
      assess: s("Vulnerability risk assessment", [
        "Patch compliance — Production: 62% (target: 90%), Staging: 41% (target: 85%)",
        "Critical CVE exposure window: avg 18 days (threshold: 7 days)",
        "2 CVEs with active exploits in the wild remain unpatched on production assets",
        "Remediation velocity: 3 CVEs patched this week (down from 7 last week)",
      ]),
      explain: s("Analyst scope and capability", [
        "Scans all assets for known vulnerabilities using CVE database and threat feeds",
        "Prioritises CVEs by exploitability, exposure, and asset criticality",
        "Tracks patch compliance and remediation status across environments",
        "Coordinates with Configuration Security on hardening recommendations",
      ]),
      trace: s("Exploitation path analysis", [
        "CVE-2026-1847 on prod-db-03: exploitable remotely, no authentication required",
        "CVE-2025-4421 on web-node-07: reachable via internet, exploit PoC public",
        "api-edge-02 unpatched CVEs can chain to finance-db-01 access",
      ]),
    },
    "Exposure Analyst": {
      summarise: s("Findings summary (last 24 hours)", [
        "External attack surface: +4 newly exposed endpoints identified",
        "finance-db-01 reachable from 2 external paths — reassessment triggered",
        "3 crown jewel assets flagged for unacknowledged exposure",
        "Simulated breach scenario on api-edge-02 completed — results available",
      ]),
      assess: s("Exposure risk assessment", [
        "Overall exposure level: CRITICAL",
        "Internet-exposed assets: 14 (up from 11 last week)",
        "Crown jewel assets with external exposure: 3 unacknowledged",
        "Attack surface score: 87/100 (higher = more exposed)",
      ]),
      explain: s("Analyst scope and capability", [
        "Maps external and internal exposure for all assets in the inventory",
        "Identifies reachable attack paths and calculates blast radius",
        "Simulates breach scenarios to quantify potential impact",
        "Feeds exposure data to Risk Intelligence for posture scoring",
      ]),
      trace: s("Active exposure paths", [
        "Internet → api-edge-02 → finance-db-01: 2-hop direct path (CRITICAL)",
        "Internet → web-node-07 → dmz-segment-04 → prod-db-03: 3-hop path (HIGH)",
        "Misconfigured S3 bucket in aws-prod: accessible without authentication",
      ]),
    },
    "Risk Intelligence Analyst": {
      summarise: s("Findings summary (last 24 hours)", [
        "Risk posture: CRITICAL — elevated from High 6 hours ago",
        "Threat signals correlated across 47 endpoints — 3 patterns identified",
        "Finance segment risk score updated: 91/100",
        "Aggregated risk posture metrics published to leadership dashboard",
      ]),
      assess: s("Risk posture assessment", [
        "Overall risk score: 91/100 (CRITICAL threshold: 80)",
        "Top risk driver: internet-exposed finance-db-01 with active attack paths",
        "Secondary driver: unpatched critical CVEs on production assets",
        "Risk reduction opportunity: patching CVE-2026-1847 would reduce score by ~14 points",
      ]),
      explain: s("Analyst scope and capability", [
        "Aggregates findings from all analysts into a unified risk posture",
        "Correlates threat signals, vulnerabilities, and exposure data",
        "Produces risk scores for assets, segments, and the overall environment",
        "Identifies the highest-leverage actions to reduce risk efficiently",
      ]),
      trace: s("Risk propagation paths", [
        "prod-0384 compromise → iam-core-01 → full environment access (CRITICAL)",
        "finance-db-01 breach → regulatory impact + data loss (CRITICAL)",
        "api-edge-02 exploitation → lateral movement to 12 internal assets (HIGH)",
      ]),
    },
    "Governance & Compliance Analyst": {
      summarise: s("Findings summary (last 24 hours)", [
        "Remediation workflow initiated for 3 outstanding compliance gaps",
        "Vendor-17 approval lifecycle: tracking active — decision pending",
        "PCI DSS 4.0: 2 new gaps identified in network segmentation controls",
        "SOC 2 Type II review in progress — 4 controls under re-evaluation",
      ]),
      assess: s("Compliance risk assessment", [
        "SOC 2 Type II: 87% compliant — review in progress",
        "PCI DSS 4.0: 74% compliant — 2 gaps require immediate remediation",
        "ISO 27001: Compliant — next audit in 6 months",
        "High-risk control gap: network segmentation for cardholder data (PCI req 1.3)",
      ]),
      explain: s("Analyst scope and capability", [
        "Monitors compliance posture against SOC 2, ISO 27001, PCI DSS, NIST CSF",
        "Tracks control effectiveness and identifies drift from policy baselines",
        "Manages remediation workflows and approval lifecycles",
        "Generates evidence packages for auditors",
      ]),
      trace: s("Compliance gap traceability", [
        "PCI DSS Req 1.3 gap → finance-db-01 accessible without network segmentation",
        "SOC 2 CC6.6 gap → admin access without MFA on 3 privileged accounts",
        "NIST CSF PR.AC-3 gap → remote access policy not consistently enforced",
      ]),
    },
    "Configuration Security Analyst": {
      summarise: s("Findings summary (last 24 hours)", [
        "Misconfiguration detected on web-node-07: TLS 1.1 enabled, patch available",
        "Security policy audited on iam-core-01: 3 deviations from hardening baseline",
        "corp-endpoint-17: hardening rules verified — no deviations",
        "17 configurations audited today across production environment",
      ]),
      assess: s("Configuration risk assessment", [
        "Misconfiguration exposure: 11 active findings (2 critical, 5 high, 4 medium)",
        "Critical: TLS 1.1 active on public-facing web-node-07",
        "High: Default credentials not rotated on 2 network devices",
        "Hardening compliance: 78% (target: 95%)",
      ]),
      explain: s("Analyst scope and capability", [
        "Audits configuration of all assets against security hardening baselines",
        "Detects deviations from CIS Benchmarks, STIG, and internal policy",
        "Tracks remediation of configuration findings and verifies corrections",
        "Feeds configuration data to Vulnerability and Compliance analysts",
      ]),
      trace: s("Configuration-based attack vectors", [
        "TLS 1.1 on web-node-07: enables POODLE/BEAST attacks → data interception",
        "Default credentials on network devices: direct admin access without brute force",
        "Weak IAM policy on iam-core-01: privilege escalation path via misconfigured role",
      ]),
    },
    "Application Security Analyst": {
      summarise: s("Findings summary (last 24 hours)", [
        "Container images scanned: 24 images, 3 critical vulnerabilities found",
        "Phishing evidence enriched for hr-mailbox-02: indicators confirmed",
        "Dependency tree on ui-app-09: 2 vulnerable transitive dependencies identified",
        "SAST scan triggered on 4 repositories — results pending",
      ]),
      assess: s("Application security risk assessment", [
        "Critical app vulnerabilities: 3 (in container images, unpatched)",
        "Vulnerable dependencies: 7 packages across 4 applications",
        "Phishing indicators: active campaign targeting hr-mailbox-02",
        "OWASP Top 10 exposure: SQL injection risk in api-edge-02 (unconfirmed)",
      ]),
      explain: s("Analyst scope and capability", [
        "Scans application code, containers, and dependencies for vulnerabilities",
        "Enriches phishing and social engineering indicators",
        "Reviews SAST, DAST, and SCA findings across the application portfolio",
        "Coordinates with DevSecOps on pipeline security gates",
      ]),
      trace: s("Application attack vectors", [
        "Vulnerable container → lateral movement to host via escape technique",
        "Compromised hr-mailbox-02 → credential harvesting → identity access",
        "Vulnerable dependency in ui-app-09 → supply chain injection risk",
      ]),
    },
    "Identity Security Analyst": {
      summarise: s("Findings summary (last 24 hours)", [
        "Anomalous privilege escalation detected — investigation in progress",
        "MFA policy enforced for admin-group-02: 14 accounts updated",
        "Service account permissions reviewed: 3 accounts with excessive privileges",
        "Suspicious login pattern: prod-0384 accessed from 2 geographic locations",
      ]),
      assess: s("Identity risk assessment", [
        "Privileged accounts without MFA: 3 remaining (down from 9 last week)",
        "Anomalous access events: 7 in last 24h (threshold: 3)",
        "Service accounts with admin rights: 12 (8 flagged for review)",
        "Most urgent: prod-0384 geographic anomaly — possible credential compromise",
      ]),
      explain: s("Analyst scope and capability", [
        "Monitors identity and access management across all users and service accounts",
        "Detects anomalous login patterns, privilege escalation, and lateral movement",
        "Enforces MFA, least-privilege, and access review policies",
        "Feeds identity risk signals to Risk Intelligence for posture scoring",
      ]),
      trace: s("Identity-based attack paths", [
        "prod-0384 compromise → admin-group-02 membership → full environment access",
        "Service account with admin rights on iam-core-01 → no audit trail",
        "Single-factor admin account → brute force → critical infrastructure access",
      ]),
    },
  };

  const intentMap = {
    summarise: "summarise", explain: "explain", assess: "assess",
    trace: "trace", list: "summarise", investigate: "summarise",
    general: "summarise", recommend: "summarise", "compliance-check": "summarise",
    prioritise: "assess", diagnose: "summarise",
  };

  const mappedIntent = intentMap[intent] ?? "summarise";
  const agentFindings = findings[label];
  const section = agentFindings?.[mappedIntent] ?? agentFindings?.summarise ?? s("Analyst findings", [
    `${label} is active and monitoring the environment.`,
    "Run 'secops ask \"what needs attention\"' for a Watch Center overview.",
  ]);

  const riskLevels = {
    "Asset Intelligence Analyst":    "critical",
    "Vulnerability Analyst":         "critical",
    "Exposure Analyst":              "critical",
    "Risk Intelligence Analyst":     "critical",
    "Governance & Compliance Analyst":"high",
    "Configuration Security Analyst":"high",
    "Application Security Analyst":  "high",
    "Identity Security Analyst":     "high",
  };

  const nextSteps = {
    summarise: [
      `secops agent "${label}" "assess current risk"`,
      `secops rerun "${label}"`,
    ],
    assess: [
      `secops agent "${label}" "explain recent findings"`,
      `secops agent "${label}" "recommend actions"`,
    ],
    trace: [
      `secops agent "${label}" "recommend mitigations"`,
      `secops rerun "${label}"`,
    ],
    explain: [
      `secops agent "${label}" "explain recent findings"`,
      `secops agent "${label}" "assess current risk"`,
    ],
  };

  return {
    sections: [section],
    riskLevel: riskLevels[label] ?? "high",
    nextSteps: nextSteps[mappedIntent] ?? nextSteps.summarise,
  };
}

// ── Workflow responses ────────────────────────────────────────────────────────
function workflowResponse(ctx, intent) {
  const { label } = ctx;

  const diagSec = s("Diagnostic summary", [
    "Last run: Failed — trigger condition matched but action step 3 timed out",
    "Step 3 (Slack notification): connection refused — integration disconnected",
    "2 previous runs also failed on the same step — systematic issue",
    "Workflow has not completed successfully in the last 72 hours",
  ]);

  const summarySec = s(`${label} — workflow status`, [
    "Status: Active — last triggered 14 minutes ago",
    "Last successful run: 3 hours ago (2 of 3 steps completed)",
    "Failure point: Slack notification step — integration disconnected",
    "Total runs today: 8 (5 succeeded, 3 failed)",
  ]);

  const section = (intent === "diagnose" || intent === "explain") ? diagSec : summarySec;

  return {
    sections: [section],
    riskLevel: "high",
    nextSteps: [
      `secops diagnose "${label}"`,
      `secops workflow "${label}" "suggest improvements"`,
      `secops open-in-ui`,
    ],
  };
}

// ── Asset responses ───────────────────────────────────────────────────────────
function assetResponse(ctx, intent) {
  const { label, risk, assetType } = ctx;

  const sections = {
    summarise: s(`${label} — asset overview`, [
      `Type: ${assetType}  ·  Risk level: ${(risk ?? "unknown").toUpperCase()}`,
      "Located in: dmz-segment-04 (internet-accessible network segment)",
      "Active attack paths: 2 paths with direct external access",
      "Unacknowledged exposure: Yes — immediate review required",
    ]),
    assess: s(`CIA risk assessment — ${label}`, [
      "Confidentiality: HIGH — sensitive financial records accessible",
      "Integrity: HIGH — database writable from compromised path",
      "Availability: MEDIUM — no active DoS indicators, but exposure is high",
      `Overall CIA risk: ${(risk ?? "high").toUpperCase()}`,
      "Recommended action: isolate from internet-facing services immediately",
    ]),
    explain: s(`What is ${label}?`, [
      `${label} is a ${assetType} in the production environment.`,
      "Classified as a crown jewel asset — contains sensitive financial data.",
      "Currently reachable from 2 external attack paths.",
      "Last configuration audit: 5 days ago (overdue — threshold: 3 days).",
    ]),
    trace: s(`Attack paths targeting ${label}`, [
      "Path 1: Internet → api-edge-02 → dmz-segment-04 → finance-db-01 (4 hops)",
      "Path 2: Compromised endpoint in corp-network → VPN → finance-db-01 (3 hops)",
      "Both paths confirmed active — no mitigations applied",
      "Recommended mitigation: network segmentation + firewall rule update",
    ]),
    recommend: s(`Recommended actions for ${label}`, [
      "Immediate: Apply network segmentation to block external paths",
      "Short-term: Patch CVE-2026-1847 — reduces attack surface significantly",
      "Short-term: Enable database activity monitoring and alerting",
      "Strategic: Move to dedicated private subnet with no internet route",
    ]),
  };

  const intentMap = {
    summarise: "summarise", assess: "assess", explain: "explain",
    trace: "trace", investigate: "trace", recommend: "recommend",
    list: "summarise", general: "summarise", diagnose: "assess",
  };

  const key = intentMap[intent] ?? "summarise";

  return {
    sections: [sections[key] ?? sections.summarise],
    riskLevel: risk ?? "high",
    nextSteps: [
      `secops asset ${label} "trace attack path"`,
      `secops asset ${label} "recommend actions"`,
      `secops simulate ${label}`,
      `secops open-in-ui`,
    ],
  };
}

// ── Attack path responses ─────────────────────────────────────────────────────
function attackPathResponse(ctx, intent) {
  const { label, hops, severity } = ctx;

  const sections = {
    explain: s(`Why is this path critical?`, [
      `${label} provides direct access to production data from the internet.`,
      `The path traverses ${hops ?? "multiple"} hops with no effective control points.`,
      "No network segmentation exists between the entry point and the target.",
      "Exploitation does not require valid credentials at all hops.",
      "Impact: full read/write access to financial records if exploited.",
    ]),
    summarise: s(`Attack path summary — ${label}`, [
      `Severity: ${(severity ?? "unknown").toUpperCase()}  ·  ${hops ?? "?"} hops`,
      "Entry point: internet-facing api-edge-02 (CVE-2025-4421, unpatched)",
      "Intermediate node: dmz-segment-04 (no egress filter to finance subnet)",
      "Target: finance-db-01 (crown jewel — financial records)",
      "Status: Active — no mitigations applied",
    ]),
    trace: s(`Step-by-step path`, [
      "Step 1 → api-edge-02: exploit CVE-2025-4421 (remote code execution, no auth)",
      "Step 2 → dmz-segment-04: pivot via unrestricted internal route",
      "Step 3 → finance subnet: no egress filter — direct DB access available",
      "Step 4 → finance-db-01: read/write via service account with excessive privileges",
    ]),
    assess: s(`Risk assessment`, [
      `Path severity: ${(severity ?? "UNKNOWN").toUpperCase()}`,
      "Exploitability: High — public exploit available for entry-point CVE",
      "Detection coverage: Low — no IDS rules covering this path",
      "Business impact: Regulatory exposure + financial data breach",
    ]),
    recommend: s(`Recommended mitigations`, [
      "Immediate: Block external access to api-edge-02 (firewall rule)",
      "Immediate: Patch CVE-2025-4421 on web-node-07 and api-edge-02",
      "Short-term: Apply network segmentation between DMZ and finance subnet",
      "Short-term: Remove excessive privileges from finance-db-01 service account",
      "Strategic: Implement zero-trust network architecture for finance segment",
    ]),
  };

  const intentMap = {
    explain: "explain", summarise: "summarise", trace: "trace",
    assess: "assess", recommend: "recommend", investigate: "trace",
    list: "summarise", general: "summarise",
  };

  const key = intentMap[intent] ?? "summarise";

  return {
    sections: [sections[key] ?? sections.summarise],
    riskLevel: severity ?? "critical",
    nextSteps: [
      `secops attack-path "${label}" "recommend mitigations"`,
      `secops asset finance-db-01 "assess current CIA risk"`,
      `secops create-case`,
      `secops open-in-ui`,
    ],
  };
}

// ── Compliance responses ──────────────────────────────────────────────────────
function complianceResponse(ctx, intent) {
  const { label, status } = ctx;

  const section = s(`${label} — compliance status`, [
    `Current status: ${(status ?? "unknown").replace("-", " ").toUpperCase()}`,
    "Gap 1: Network segmentation for cardholder data (Req 1.3) — finance-db-01 accessible",
    "Gap 2: Admin access without MFA on 3 privileged accounts (CC6.6)",
    "Remediation: 2 gaps have active workflows — ETA 14 days",
    "Next audit: Scheduled in 6 months — 2 critical gaps must be resolved first",
  ]);

  return {
    sections: [section],
    riskLevel: "high",
    nextSteps: [
      `secops compliance "${label}" "remediation steps"`,
      `secops agent "Governance & Compliance Analyst" "explain recent findings"`,
      `secops open-in-ui`,
    ],
  };
}

// ── Watch Center / General responses ─────────────────────────────────────────
function generalResponse(_ctx, intent) {
  const sections = {
    general: s("Watch Center — current situation", [
      "CRITICAL  2 active attack paths — finance-db-01 and root account reachable from internet",
      "WARNING   Asset Intelligence escalated prod-0384 to Critical — 5 new indicators",
      "WARNING   3 crown jewel assets with unacknowledged exposure — review required",
      "INFO      Slack integration disconnected — 2 workflow notification steps blocked",
      "RESOLVED  12 alerts cleared in the last 24 hours — staging lateral movement cleared",
    ]),
    assess: s("Risk posture summary", [
      "Overall risk: CRITICAL (score: 91/100)",
      "Active attack paths: 2 critical, 1 high",
      "Unpatched critical CVEs: 3 (with active exploits)",
      "Analysts active: 8 of 8 — all running",
      "Active investigations: 4 | Pending approvals: 2",
    ]),
    prioritise: s("Highest-priority items", [
      "1. Patch CVE-2026-1847 on prod-db-03 — active exploit, CVSS 9.8",
      "2. Block external access to finance-db-01 — 2 active attack paths",
      "3. Enforce MFA on remaining 3 privileged accounts",
      "4. Resolve Slack integration — 2 blocked workflow notifications",
      "5. Acknowledge exposure on 3 crown jewel assets",
    ]),
  };

  const intentMap = {
    assess: "assess", prioritise: "prioritise", summarise: "general",
    list: "general", general: "general", investigate: "general",
    explain: "general", recommend: "prioritise",
  };

  const key = intentMap[intent] ?? "general";

  return {
    sections: [sections[key] ?? sections.general],
    riskLevel: "critical",
    nextSteps: [
      'secops agent "Asset Intelligence Analyst" "explain recent findings"',
      'secops attack-path internet-to-finance-db-01 "show why this is critical"',
      'secops asset finance-db-01 "assess current CIA risk"',
      'secops rerun "Vulnerability Analyst"',
    ],
  };
}

// ── Public API ────────────────────────────────────────────────────────────────
export function generateResponse(ctx, intent) {
  switch (ctx.type) {
    case "agent":       return agentResponse(ctx, intent);
    case "workflow":    return workflowResponse(ctx, intent);
    case "asset":       return assetResponse(ctx, intent);
    case "attack-path": return attackPathResponse(ctx, intent);
    case "compliance":  return complianceResponse(ctx, intent);
    case "general":
    default:            return generalResponse(ctx, intent);
  }
}
