/**
 * Unified Security Graph — Seed Edges
 *
 * Relationships that connect the seed nodes into a traversable graph.
 */

import type { GraphEdge } from "./types";

const now = "2026-03-11T00:00:00Z";
const ts = (daysAgo: number) => {
  const d = new Date(now);
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString();
};

let _eid = 0;
const eid = () => `edge_${String(++_eid).padStart(3, "0")}`;

export const SEED_EDGES: GraphEdge[] = [
  /* ── Asset → Vulnerability ── */
  {
    id: eid(),
    from_id: "asset_web_01",
    to_id: "vuln_cve_2023_4211",
    relationship_type: "HAS_VULNERABILITY",
    metadata: { detectedBy: "integ_crowdstrike" },
    timestamps: { created_at: ts(30), updated_at: ts(1) },
  },
  {
    id: eid(),
    from_id: "asset_finance_db_01",
    to_id: "vuln_cve_2024_1001",
    relationship_type: "HAS_VULNERABILITY",
    metadata: { detectedBy: "integ_splunk" },
    timestamps: { created_at: ts(14), updated_at: ts(2) },
  },
  {
    id: eid(),
    from_id: "asset_web_01",
    to_id: "vuln_cve_2024_3055",
    relationship_type: "HAS_VULNERABILITY",
    metadata: { detectedBy: "scanner" },
    timestamps: { created_at: ts(7), updated_at: ts(1) },
  },

  /* ── Asset → Misconfiguration ── */
  {
    id: eid(),
    from_id: "asset_finance_db_01",
    to_id: "misconfig_ssh_root",
    relationship_type: "HAS_MISCONFIGURATION",
    metadata: {},
    timestamps: { created_at: ts(20), updated_at: ts(3) },
  },
  {
    id: eid(),
    from_id: "asset_finance_db_01",
    to_id: "misconfig_s3_public",
    relationship_type: "HAS_MISCONFIGURATION",
    metadata: { note: "Backup bucket used by this host" },
    timestamps: { created_at: ts(5), updated_at: ts(1) },
  },

  /* ── Attack Path membership ── */
  {
    id: eid(),
    from_id: "asset_web_01",
    to_id: "ap_lateral_finance",
    relationship_type: "PART_OF_ATTACK_PATH",
    metadata: { role: "entry_point" },
    timestamps: { created_at: ts(10), updated_at: ts(1) },
  },
  {
    id: eid(),
    from_id: "asset_finance_db_01",
    to_id: "ap_lateral_finance",
    relationship_type: "PART_OF_ATTACK_PATH",
    metadata: { role: "target" },
    timestamps: { created_at: ts(10), updated_at: ts(1) },
  },
  {
    id: eid(),
    from_id: "asset_k8s_node_01",
    to_id: "ap_cloud_escape",
    relationship_type: "PART_OF_ATTACK_PATH",
    metadata: { role: "entry_point" },
    timestamps: { created_at: ts(8), updated_at: ts(2) },
  },

  /* ── Risk links ── */
  {
    id: eid(),
    from_id: "ap_lateral_finance",
    to_id: "risk_data_exfil",
    relationship_type: "INCREASES_RISK",
    metadata: { contribution: 0.72 },
    timestamps: { created_at: ts(10), updated_at: ts(1) },
  },
  {
    id: eid(),
    from_id: "vuln_cve_2024_1001",
    to_id: "risk_data_exfil",
    relationship_type: "INCREASES_RISK",
    metadata: { contribution: 0.45 },
    timestamps: { created_at: ts(14), updated_at: ts(2) },
  },
  {
    id: eid(),
    from_id: "asset_cicd_runner",
    to_id: "risk_supply_chain",
    relationship_type: "INCREASES_RISK",
    metadata: { contribution: 0.6 },
    timestamps: { created_at: ts(15), updated_at: ts(4) },
  },

  /* ── Mitigation (Workflow) ── */
  {
    id: eid(),
    from_id: "risk_data_exfil",
    to_id: "wf_isolate_host",
    relationship_type: "MITIGATED_BY",
    metadata: {},
    timestamps: { created_at: ts(10), updated_at: ts(1) },
  },
  {
    id: eid(),
    from_id: "vuln_cve_2024_1001",
    to_id: "wf_patch_vuln",
    relationship_type: "MITIGATED_BY",
    metadata: {},
    timestamps: { created_at: ts(14), updated_at: ts(5) },
  },

  /* ── Case triggers ── */
  {
    id: eid(),
    from_id: "risk_data_exfil",
    to_id: "case_ir_001",
    relationship_type: "TRIGGERED_CASE",
    metadata: { triggeredBy: "agent_sentinel" },
    timestamps: { created_at: ts(3), updated_at: ts(0) },
  },

  /* ── Workflow triggers ── */
  {
    id: eid(),
    from_id: "case_ir_001",
    to_id: "wf_isolate_host",
    relationship_type: "TRIGGERED_WORKFLOW",
    metadata: {},
    timestamps: { created_at: ts(1), updated_at: ts(1) },
  },

  /* ── Approval requirement ── */
  {
    id: eid(),
    from_id: "wf_isolate_host",
    to_id: "appr_isolate_001",
    relationship_type: "REQUIRES_APPROVAL",
    metadata: {},
    timestamps: { created_at: ts(1), updated_at: ts(0) },
  },

  /* ── Network connectivity ── */
  {
    id: eid(),
    from_id: "asset_web_01",
    to_id: "asset_finance_db_01",
    relationship_type: "CONNECTED_TO",
    metadata: { port: 5432, protocol: "tcp" },
    timestamps: { created_at: ts(120), updated_at: ts(10) },
  },
  {
    id: eid(),
    from_id: "asset_k8s_node_01",
    to_id: "asset_web_01",
    relationship_type: "CONNECTED_TO",
    metadata: { port: 443, protocol: "tcp" },
    timestamps: { created_at: ts(90), updated_at: ts(5) },
  },

  /* ── Access relationships ── */
  {
    id: eid(),
    from_id: "ident_svc_deploy",
    to_id: "asset_k8s_node_01",
    relationship_type: "CAN_ACCESS",
    metadata: { accessLevel: "admin" },
    timestamps: { created_at: ts(90), updated_at: ts(0) },
  },
  {
    id: eid(),
    from_id: "ident_admin_legacy",
    to_id: "asset_finance_db_01",
    relationship_type: "CAN_ACCESS",
    metadata: { accessLevel: "root" },
    timestamps: { created_at: ts(500), updated_at: ts(30) },
  },
  {
    id: eid(),
    from_id: "app_payment_api",
    to_id: "asset_finance_db_01",
    relationship_type: "CAN_ACCESS",
    metadata: { accessLevel: "read-write", connectionString: true },
    timestamps: { created_at: ts(300), updated_at: ts(2) },
  },

  /* ── Policy / Compliance ── */
  {
    id: eid(),
    from_id: "policy_no_public_s3",
    to_id: "misconfig_s3_public",
    relationship_type: "VIOLATES_POLICY",
    metadata: { note: "Policy violation detected" },
    timestamps: { created_at: ts(5), updated_at: ts(1) },
  },
  {
    id: eid(),
    from_id: "cc_pci_321",
    to_id: "asset_finance_db_01",
    relationship_type: "MITIGATED_BY",
    metadata: { note: "Encryption validated" },
    timestamps: { created_at: ts(7), updated_at: ts(7) },
  },

  /* ── VIOLATES_POLICY ── */
  {
    id: eid(),
    from_id: "misconfig_ssh_root",
    to_id: "policy_mfa_required",
    relationship_type: "VIOLATES_POLICY",
    metadata: { note: "Root login bypasses MFA requirement" },
    timestamps: { created_at: ts(20), updated_at: ts(3) },
  },
  {
    id: eid(),
    from_id: "risk_data_exfil",
    to_id: "policy_no_public_s3",
    relationship_type: "VIOLATES_POLICY",
    metadata: { note: "Public bucket increases exfiltration risk" },
    timestamps: { created_at: ts(5), updated_at: ts(1) },
  },

  /* ── LINKED_TO_RUN ── */
  {
    id: eid(),
    from_id: "case_ir_001",
    to_id: "wfr_isolate_001",
    relationship_type: "LINKED_TO_RUN",
    metadata: { note: "Workflow run triggered by case" },
    timestamps: { created_at: ts(1), updated_at: ts(1) },
  },
  {
    id: eid(),
    from_id: "case_ir_002",
    to_id: "wfr_patch_001",
    relationship_type: "LINKED_TO_RUN",
    metadata: { note: "Patching run linked to phishing case" },
    timestamps: { created_at: ts(0), updated_at: ts(0) },
  },

  /* ── Additional Case ↔ Approval ── */
  {
    id: eid(),
    from_id: "case_ir_001",
    to_id: "appr_isolate_001",
    relationship_type: "REQUIRES_APPROVAL",
    metadata: { note: "Case response needs approval" },
    timestamps: { created_at: ts(1), updated_at: ts(0) },
  },

  /* ── Additional Attack Path edges ── */
  {
    id: eid(),
    from_id: "vuln_cve_2023_4211",
    to_id: "ap_lateral_finance",
    relationship_type: "PART_OF_ATTACK_PATH",
    metadata: { role: "exploit" },
    timestamps: { created_at: ts(10), updated_at: ts(1) },
  },
  {
    id: eid(),
    from_id: "ident_admin_legacy",
    to_id: "ap_lateral_finance",
    relationship_type: "CAN_ACCESS",
    metadata: { note: "Legacy root account enables lateral movement" },
    timestamps: { created_at: ts(10), updated_at: ts(1) },
  },
  {
    id: eid(),
    from_id: "ident_svc_deploy",
    to_id: "ap_cloud_escape",
    relationship_type: "CAN_ACCESS",
    metadata: { note: "Service account with admin access to k8s" },
    timestamps: { created_at: ts(8), updated_at: ts(2) },
  },

  /* ── Additional Risk edges ── */
  {
    id: eid(),
    from_id: "misconfig_s3_public",
    to_id: "risk_data_exfil",
    relationship_type: "INCREASES_RISK",
    metadata: { contribution: 0.55 },
    timestamps: { created_at: ts(5), updated_at: ts(1) },
  },
  {
    id: eid(),
    from_id: "risk_data_exfil",
    to_id: "wf_patch_vuln",
    relationship_type: "MITIGATED_BY",
    metadata: {},
    timestamps: { created_at: ts(10), updated_at: ts(5) },
  },
  {
    id: eid(),
    from_id: "risk_supply_chain",
    to_id: "wf_isolate_host",
    relationship_type: "MITIGATED_BY",
    metadata: {},
    timestamps: { created_at: ts(15), updated_at: ts(4) },
  },

  /* ── Application connectivity ── */
  {
    id: eid(),
    from_id: "app_payment_api",
    to_id: "asset_web_01",
    relationship_type: "CONNECTED_TO",
    metadata: { port: 8080, protocol: "http" },
    timestamps: { created_at: ts(300), updated_at: ts(2) },
  },
  {
    id: eid(),
    from_id: "asset_cicd_runner",
    to_id: "asset_k8s_node_01",
    relationship_type: "CONNECTED_TO",
    metadata: { port: 6443, protocol: "tcp" },
    timestamps: { created_at: ts(60), updated_at: ts(5) },
  },

  /* ── Workflow ↔ WorkflowRun ── */
  {
    id: eid(),
    from_id: "wf_isolate_host",
    to_id: "wfr_isolate_001",
    relationship_type: "LINKED_TO_RUN",
    metadata: {},
    timestamps: { created_at: ts(1), updated_at: ts(1) },
  },
  {
    id: eid(),
    from_id: "wf_patch_vuln",
    to_id: "wfr_patch_001",
    relationship_type: "LINKED_TO_RUN",
    metadata: {},
    timestamps: { created_at: ts(0), updated_at: ts(0) },
  },
];