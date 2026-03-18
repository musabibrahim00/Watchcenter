/**
 * Entity Graph — Shared Relationship Model
 *
 * Single source of truth for cross-module relationships between:
 *   Assets ↔ Attack Paths ↔ Compliance Gaps ↔ Controls
 *
 * This file does NOT contain UI code. It is pure data layer.
 * All three surfaces (Asset Register, Attack Paths, Compliance) query
 * this model so they share the same underlying entity relationships.
 *
 * How to extend:
 *   - Add new asset IDs to ASSET_RELATIONSHIPS
 *   - Add new gap–path wiring in GAP_METADATA
 *   - Add new path–gap wiring in ATTACK_PATH_METADATA
 */

/* ================================================================
   SHARED REFERENCE TYPES
   ================================================================ */

export interface PathRef {
  pathId: string;
  name: string;
  priority: "critical" | "high" | "medium" | "low";
}

export interface GapRef {
  gapId: string;
  control: string;
  framework: string;
  title: string;
  severity: "critical" | "high" | "medium" | "low";
  /** How this gap enables or worsens the related attack path */
  contribution: string;
}

export interface AssetRef {
  /** Asset register ID (ast-xxx) OR blast-radius asset name */
  assetId: string;
  name: string;
  type: "registered" | "blast-radius";
}

/* ================================================================
   ATTACK PATH → COMPLIANCE GAPS THAT CONTRIBUTE TO IT
   Keyed by attack path ID (matches AttackPathDetailPage ATTACK_PATHS keys)
   ================================================================ */

export const ATTACK_PATH_CONTRIBUTING_GAPS: Record<string, GapRef[]> = {
  "ap-001": [
    {
      gapId: "g2",
      control: "CC6.1",
      framework: "SOC 2",
      title: "MFA not required on 12 service accounts",
      severity: "critical",
      contribution: "auth-service-01 lacks MFA enforcement, enabling credential-based lateral movement to the database.",
    },
    {
      gapId: "g4",
      control: "Req 6.3",
      framework: "PCI-DSS",
      title: "Vulnerability scan overdue on cardholder segment",
      severity: "high",
      contribution: "CVE-2018-15133 on the EC2 entry point was not caught due to overdue vuln scanning.",
    },
  ],
  "ap-002": [
    {
      gapId: "g1",
      control: "AC-2",
      framework: "NIST CSF",
      title: "Privileged account lifecycle not enforced",
      severity: "critical",
      contribution: "Stale IAM privileged accounts with no lifecycle review created the lateral pivot to cloud admin.",
    },
    {
      gapId: "g2",
      control: "CC6.1",
      framework: "SOC 2",
      title: "MFA not required on 12 service accounts",
      severity: "critical",
      contribution: "IAM dev-user-01 had no MFA, allowing phishing to succeed without a second factor.",
    },
  ],
  "ap-003": [
    {
      gapId: "g5",
      control: "PR.IP-1",
      framework: "NIST CSF",
      title: "Configuration baseline not documented for 3 asset classes",
      severity: "medium",
      contribution: "Workstation configuration drift was undetected without a documented baseline, enabling SMB pivoting.",
    },
    {
      gapId: "g4",
      control: "Req 6.3",
      framework: "PCI-DSS",
      title: "Vulnerability scan overdue on cardholder segment",
      severity: "high",
      contribution: "CVE-2021-34527 (PrintNightmare) on the Domain Controller was not caught by overdue scanning.",
    },
  ],
  "ap-004": [
    {
      gapId: "g3",
      control: "A.9.4",
      framework: "ISO 27001",
      title: "Encryption key rotation policy not enforced",
      severity: "high",
      contribution: "The disabled KMS key (key-disabled) reflects key rotation failure, leaving PII dataset unprotected at rest.",
    },
    {
      gapId: "g4",
      control: "Req 6.3",
      framework: "PCI-DSS",
      title: "Vulnerability scan overdue on cardholder segment",
      severity: "high",
      contribution: "The public S3 bucket misconfiguration was missed due to stale vulnerability scanning coverage.",
    },
  ],
  "ap-005": [
    {
      gapId: "g4",
      control: "Req 6.3",
      framework: "PCI-DSS",
      title: "Vulnerability scan overdue on cardholder segment",
      severity: "high",
      contribution: "CVE-2024-21626 (container escape) in the pod image was not detected by overdue scanning.",
    },
    {
      gapId: "g5",
      control: "PR.IP-1",
      framework: "NIST CSF",
      title: "Configuration baseline not documented for 3 asset classes",
      severity: "medium",
      contribution: "No documented baseline for EKS cluster configuration allowed privileged container configs to persist.",
    },
  ],
  "ap-006": [
    {
      gapId: "g5",
      control: "PR.IP-1",
      framework: "NIST CSF",
      title: "Configuration baseline not documented for 3 asset classes",
      severity: "medium",
      contribution: "Lambda function fn-process-order had no validated configuration baseline; injection remained undetected.",
    },
    {
      gapId: "g3",
      control: "A.9.4",
      framework: "ISO 27001",
      title: "Encryption key rotation policy not enforced",
      severity: "high",
      contribution: "DynamoDB orders-table lacked enforced encryption key rotation, increasing the value of a successful injection.",
    },
  ],
  "ap-007": [
    {
      gapId: "g3",
      control: "A.9.4",
      framework: "ISO 27001",
      title: "Encryption key rotation policy not enforced",
      severity: "high",
      contribution: "RDS snapshot was created with plaintext credentials due to key rotation policy failure.",
    },
    {
      gapId: "g2",
      control: "CC6.1",
      framework: "SOC 2",
      title: "MFA not required on 12 service accounts",
      severity: "critical",
      contribution: "Database admin service accounts had no MFA, making credential-based DB access trivial once snapshot credentials leaked.",
    },
  ],
};

/* ================================================================
   COMPLIANCE GAP → ATTACK PATHS IT WORSENS + ASSETS IT AFFECTS
   Keyed by gap ID (matches CompliancePage GAPS[].id)
   ================================================================ */

export interface GapMetadata {
  relatedPaths: PathRef[];
  affectedAssets: AssetRef[];
  /** Remediation impact on blast radius */
  blastRadiusImpact: string;
}

export const GAP_METADATA: Record<string, GapMetadata> = {
  g1: {
    relatedPaths: [
      { pathId: "ap-002", name: "Phishing Entry → Domain Controller", priority: "critical" },
    ],
    affectedAssets: [
      { assetId: "ast-003", name: "night-shift-manager-v1", type: "registered" },
      { assetId: "ast-009", name: "master-prod-api-v12", type: "registered" },
      { assetId: "iam-root-account", name: "iam-root-account", type: "blast-radius" },
    ],
    blastRadiusImpact: "Closing this gap collapses the cloud-admin lateral pivot in ap-002, removing 5 assets from blast radius.",
  },
  g2: {
    relatedPaths: [
      { pathId: "ap-001", name: "Internet-Facing Service → Database", priority: "critical" },
      { pathId: "ap-002", name: "Phishing Entry → Domain Controller", priority: "critical" },
      { pathId: "ap-007", name: "Vendor VPN → Internal Network", priority: "medium" },
    ],
    affectedAssets: [
      { assetId: "ast-003", name: "night-shift-manager-v1", type: "registered" },
      { assetId: "ast-007", name: "master-prod-elk-v31", type: "registered" },
      { assetId: "ast-009", name: "master-prod-api-v12", type: "registered" },
      { assetId: "ast-011", name: "az-vm-webapp-prod-01", type: "registered" },
      { assetId: "auth-service-01", name: "auth-service-01", type: "blast-radius" },
    ],
    blastRadiusImpact: "Enforcing MFA breaks the credential-reuse pivot shared by ap-001, ap-002, and ap-007. Reduces combined blast radius by ~18 assets.",
  },
  g3: {
    relatedPaths: [
      { pathId: "ap-004", name: "Misconfigured S3 → PII Exfiltration", priority: "high" },
      { pathId: "ap-007", name: "Vendor VPN → Internal Network", priority: "medium" },
      { pathId: "ap-006", name: "Lateral Movement → Dev Secrets", priority: "high" },
    ],
    affectedAssets: [
      { assetId: "ast-012", name: "az-sql-analytics-db", type: "registered" },
      { assetId: "ast-014", name: "gcs-backup-archive", type: "registered" },
      { assetId: "kms-master-key", name: "kms-master-key", type: "blast-radius" },
      { assetId: "data-lake-prod", name: "data-lake-prod", type: "blast-radius" },
    ],
    blastRadiusImpact: "Enforcing key rotation re-encrypts at-rest data, reducing the value of a successful exfiltration across ap-004 and ap-007.",
  },
  g4: {
    relatedPaths: [
      { pathId: "ap-001", name: "Internet-Facing Service → Database", priority: "critical" },
      { pathId: "ap-003", name: "Supply Chain Compromise → Core API", priority: "critical" },
      { pathId: "ap-004", name: "Misconfigured S3 → PII Exfiltration", priority: "high" },
      { pathId: "ap-005", name: "Insider Threat → Financial Records", priority: "high" },
    ],
    affectedAssets: [
      { assetId: "ast-003", name: "night-shift-manager-v1", type: "registered" },
      { assetId: "ast-005", name: "master-prod-jenkins-v6", type: "registered" },
      { assetId: "ast-013", name: "gke-cluster-prod-01", type: "registered" },
    ],
    blastRadiusImpact: "Completing overdue scans would detect 3 active CVEs enabling these paths. Highest remediation ROI across all open gaps.",
  },
  g5: {
    relatedPaths: [
      { pathId: "ap-003", name: "Supply Chain Compromise → Core API", priority: "critical" },
      { pathId: "ap-005", name: "Insider Threat → Financial Records", priority: "high" },
      { pathId: "ap-006", name: "Lateral Movement → Dev Secrets", priority: "high" },
    ],
    affectedAssets: [
      { assetId: "ast-005", name: "master-prod-jenkins-v6", type: "registered" },
      { assetId: "ast-009", name: "master-prod-api-v12", type: "registered" },
      { assetId: "ast-013", name: "gke-cluster-prod-01", type: "registered" },
    ],
    blastRadiusImpact: "Documenting baselines enables drift detection that would have flagged misconfigured workstations (ap-003) and containers (ap-005).",
  },
};

/* ================================================================
   ASSET (registered IDs) → ATTACK PATHS + COMPLIANCE GAPS
   Keyed by asset register ID (ast-xxx)
   ================================================================ */

export interface AssetEntityContext {
  attackPaths: PathRef[];
  complianceGaps: GapRef[];
  /** Human-readable role in the risk graph */
  riskGraphRole: string;
}

export const ASSET_ENTITY_CONTEXT: Record<string, AssetEntityContext> = {
  "ast-003": {
    attackPaths: [
      { pathId: "ap-001", name: "Internet-Facing Service → Database", priority: "critical" },
    ],
    complianceGaps: [
      { gapId: "g2", control: "CC6.1", framework: "SOC 2", title: "MFA not required on 12 service accounts", severity: "critical", contribution: "This asset hosts one of the 12 service accounts without MFA." },
      { gapId: "g4", control: "Req 6.3", framework: "PCI-DSS", title: "Vulnerability scan overdue on cardholder segment", severity: "high", contribution: "CVE-2018-15133 was not caught on this EC2 instance due to overdue scanning." },
    ],
    riskGraphRole: "Internet-facing EC2 entry point in ap-001. Exploitation enables pivot to finance-db-01.",
  },
  "ast-005": {
    attackPaths: [
      { pathId: "ap-003", name: "Supply Chain Compromise → Core API", priority: "critical" },
    ],
    complianceGaps: [
      { gapId: "g4", control: "Req 6.3", framework: "PCI-DSS", title: "Vulnerability scan overdue on cardholder segment", severity: "high", contribution: "Build server is in cardholder segment scope with overdue scans." },
      { gapId: "g5", control: "PR.IP-1", framework: "NIST CSF", title: "Configuration baseline not documented for 3 asset classes", severity: "medium", contribution: "Jenkins CI server is one of the 3 undocumented asset classes." },
    ],
    riskGraphRole: "build-server-ci appears in ap-003 blast radius — compromise allows attacker to inject supply-chain artifacts.",
  },
  "ast-007": {
    attackPaths: [
      { pathId: "ap-001", name: "Internet-Facing Service → Database", priority: "critical" },
    ],
    complianceGaps: [
      { gapId: "g2", control: "CC6.1", framework: "SOC 2", title: "MFA not required on 12 service accounts", severity: "critical", contribution: "Log aggregator service account lacks MFA; log poisoning may go undetected." },
    ],
    riskGraphRole: "log-aggregator in ap-001 blast radius. Compromise obscures forensic trail and enables attacker dwell-time.",
  },
  "ast-009": {
    attackPaths: [
      { pathId: "ap-001", name: "Internet-Facing Service → Database", priority: "critical" },
      { pathId: "ap-006", name: "Lateral Movement → Dev Secrets", priority: "high" },
    ],
    complianceGaps: [
      { gapId: "g1", control: "AC-2", framework: "NIST CSF", title: "Privileged account lifecycle not enforced", severity: "critical", contribution: "API server has a stale privileged service account not captured in lifecycle review." },
      { gapId: "g2", control: "CC6.1", framework: "SOC 2", title: "MFA not required on 12 service accounts", severity: "critical", contribution: "API gateway service account is one of the accounts missing MFA." },
      { gapId: "g5", control: "PR.IP-1", framework: "NIST CSF", title: "Configuration baseline not documented for 3 asset classes", severity: "medium", contribution: "API server class has no documented configuration baseline." },
    ],
    riskGraphRole: "api-gateway-prod appears in ap-001 and ap-006 — dual exposure across database and secrets paths.",
  },
  "ast-011": {
    attackPaths: [
      { pathId: "ap-001", name: "Internet-Facing Service → Database", priority: "critical" },
    ],
    complianceGaps: [
      { gapId: "g2", control: "CC6.1", framework: "SOC 2", title: "MFA not required on 12 service accounts", severity: "critical", contribution: "Azure VM webapp service account lacks MFA enforcement." },
    ],
    riskGraphRole: "Internet-facing web application VM — analogous entry surface to ap-001 EC2 entry point.",
  },
  "ast-012": {
    attackPaths: [
      { pathId: "ap-007", name: "Vendor VPN → Internal Network", priority: "medium" },
    ],
    complianceGaps: [
      { gapId: "g3", control: "A.9.4", framework: "ISO 27001", title: "Encryption key rotation policy not enforced", severity: "high", contribution: "SQL analytics DB data at rest is affected by key rotation policy failure." },
    ],
    riskGraphRole: "SQL database — at-rest data remains at risk from failed encryption key rotation aligned with ap-007 credential exposure.",
  },
  "ast-013": {
    attackPaths: [
      { pathId: "ap-005", name: "Insider Threat → Financial Records", priority: "high" },
    ],
    complianceGaps: [
      { gapId: "g4", control: "Req 6.3", framework: "PCI-DSS", title: "Vulnerability scan overdue on cardholder segment", severity: "high", contribution: "GKE container images have overdue vulnerability scanning; CVE-2024-21626 was not flagged." },
      { gapId: "g5", control: "PR.IP-1", framework: "NIST CSF", title: "Configuration baseline not documented for 3 asset classes", severity: "medium", contribution: "Container cluster is one of the 3 undocumented asset classes enabling privileged pod escape." },
    ],
    riskGraphRole: "EKS/GKE cluster entry point for container escape path ap-005. Compromise reaches kube-apiserver and secrets-store.",
  },
  "ast-014": {
    attackPaths: [
      { pathId: "ap-004", name: "Misconfigured S3 → PII Exfiltration", priority: "high" },
    ],
    complianceGaps: [
      { gapId: "g3", control: "A.9.4", framework: "ISO 27001", title: "Encryption key rotation policy not enforced", severity: "high", contribution: "GCS backup archive holds sensitive data at rest without enforced key rotation." },
    ],
    riskGraphRole: "Cloud storage bucket — analog to data-lake-prod in ap-004. PII exfiltration risk compounded by key rotation gap.",
  },
};

/* ================================================================
   QUERY HELPERS
   ================================================================ */

/** Get compliance gaps that contribute to a given attack path */
export function getControlsForPath(pathId: string): GapRef[] {
  return ATTACK_PATH_CONTRIBUTING_GAPS[pathId] ?? [];
}

/** Get attack paths that are worsened by a given compliance gap */
export function getPathsForGap(gapId: string): PathRef[] {
  return GAP_METADATA[gapId]?.relatedPaths ?? [];
}

/** Get assets affected by a given compliance gap */
export function getAssetsForGap(gapId: string): AssetRef[] {
  return GAP_METADATA[gapId]?.affectedAssets ?? [];
}

/** Get blast-radius impact description for a gap */
export function getBlastRadiusImpactForGap(gapId: string): string {
  return GAP_METADATA[gapId]?.blastRadiusImpact ?? "";
}

/** Get attack paths and compliance gaps for a registered asset */
export function getEntityContextForAsset(assetId: string): AssetEntityContext | null {
  return ASSET_ENTITY_CONTEXT[assetId] ?? null;
}

/** Get all registered asset IDs that participate in a given attack path */
export function getRegisteredAssetsForPath(pathId: string): AssetRef[] {
  const result: AssetRef[] = [];
  for (const [assetId, ctx] of Object.entries(ASSET_ENTITY_CONTEXT)) {
    if (ctx.attackPaths.some(p => p.pathId === pathId)) {
      result.push({ assetId, name: ctx.attackPaths.find(p => p.pathId === pathId)!.name, type: "registered" });
    }
  }
  return result;
}
