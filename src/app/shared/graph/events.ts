/**
 * Unified Security Graph — Seed Events
 *
 * Time-ordered activity log that captures state changes across the platform.
 */

import type { GraphEvent } from "./types";

const now = "2026-03-11T00:00:00Z";
const hoursAgo = (h: number) => {
  const d = new Date(now);
  d.setHours(d.getHours() - h);
  return d.toISOString();
};

let _evid = 0;
const evid = () => `evt_${String(++_evid).padStart(3, "0")}`;

export const SEED_EVENTS: GraphEvent[] = [
  /* ── Risk score changes ── */
  {
    id: evid(),
    event_type: "risk_score_changed",
    entity_id: "asset_finance_db_01",
    actor: "agent_sentinel",
    before_state: { risk_score: 78 },
    after_state: { risk_score: 92 },
    timestamp: hoursAgo(18),
  },
  {
    id: evid(),
    event_type: "risk_score_changed",
    entity_id: "asset_web_01",
    actor: "agent_sentinel",
    before_state: { risk_score: 65 },
    after_state: { risk_score: 78 },
    timestamp: hoursAgo(24),
  },
  {
    id: evid(),
    event_type: "risk_score_changed",
    entity_id: "ident_admin_legacy",
    actor: "system",
    before_state: { risk_score: 72 },
    after_state: { risk_score: 88 },
    timestamp: hoursAgo(48),
  },

  /* ── Vulnerability detected ── */
  {
    id: evid(),
    event_type: "vulnerability_detected",
    entity_id: "vuln_cve_2023_4211",
    actor: "integ_crowdstrike",
    before_state: null,
    after_state: { severity: "critical", cvss: 9.8 },
    timestamp: hoursAgo(720), // ~30 days
  },
  {
    id: evid(),
    event_type: "vulnerability_detected",
    entity_id: "vuln_cve_2024_1001",
    actor: "integ_splunk",
    before_state: null,
    after_state: { severity: "high", cvss: 8.6 },
    timestamp: hoursAgo(336), // ~14 days
  },

  /* ── Misconfiguration found ── */
  {
    id: evid(),
    event_type: "misconfiguration_found",
    entity_id: "misconfig_s3_public",
    actor: "agent_compliance",
    before_state: null,
    after_state: { severity: "critical", bucket: "corp-reports-2026" },
    timestamp: hoursAgo(120), // ~5 days
  },

  /* ── Attack path discovered ── */
  {
    id: evid(),
    event_type: "attack_path_discovered",
    entity_id: "ap_lateral_finance",
    actor: "agent_pathfinder",
    before_state: null,
    after_state: { steps: 4, severity: "critical" },
    timestamp: hoursAgo(240), // ~10 days
  },

  /* ── Case created ── */
  {
    id: evid(),
    event_type: "case_created",
    entity_id: "case_ir_001",
    actor: "agent_sentinel",
    before_state: null,
    after_state: { status: "in_progress", priority: "P1" },
    timestamp: hoursAgo(72), // 3 days
  },
  {
    id: evid(),
    event_type: "case_created",
    entity_id: "case_ir_002",
    actor: "user_analyst_02",
    before_state: null,
    after_state: { status: "open", priority: "P2" },
    timestamp: hoursAgo(48),
  },

  /* ── Workflow executed ── */
  {
    id: evid(),
    event_type: "workflow_executed",
    entity_id: "wfr_isolate_001",
    actor: "system",
    before_state: { status: "pending" },
    after_state: { status: "resolved", duration_ms: 11200 },
    timestamp: hoursAgo(24),
  },
  {
    id: evid(),
    event_type: "workflow_executed",
    entity_id: "wfr_patch_001",
    actor: "system",
    before_state: { status: "pending" },
    after_state: { status: "active" },
    timestamp: hoursAgo(1),
  },

  /* ── Approval lifecycle ── */
  {
    id: evid(),
    event_type: "approval_requested",
    entity_id: "appr_isolate_001",
    actor: "agent_sentinel",
    before_state: null,
    after_state: { status: "pending", workflow: "wf_isolate_host" },
    timestamp: hoursAgo(24),
  },
  {
    id: evid(),
    event_type: "approval_granted",
    entity_id: "appr_isolate_001",
    actor: "user_analyst_01",
    before_state: { status: "pending" },
    after_state: { status: "approved" },
    timestamp: hoursAgo(23),
  },

  /* ── Policy violated ── */
  {
    id: evid(),
    event_type: "policy_violated",
    entity_id: "policy_no_public_s3",
    actor: "agent_compliance",
    before_state: { violations: 0 },
    after_state: { violations: 1, violatingEntity: "misconfig_s3_public" },
    timestamp: hoursAgo(120),
  },

  /* ── Compliance check ── */
  {
    id: evid(),
    event_type: "compliance_check_failed",
    entity_id: "cc_soc2_cc7",
    actor: "system",
    before_state: { status: "compliant" },
    after_state: { status: "non_compliant", reason: "SLA breach on mean-time-to-respond" },
    timestamp: hoursAgo(336),
  },
];
