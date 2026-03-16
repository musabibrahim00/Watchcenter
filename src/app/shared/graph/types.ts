/**
 * Unified Security Graph — Type Definitions
 *
 * Core data model for the entire platform. Every security entity
 * (asset, vulnerability, case, workflow, etc.) is represented as a
 * Node. Relationships between entities are Edges. Time-based
 * activity is captured as Events.
 *
 * NO UI code lives here — this is a pure data-layer contract.
 */

/* ═══════════════════════════════════════════════════════════
   ENUMS & LITERALS
   ═══════════════════════════════════════════════════════════ */

export const NODE_TYPES = [
  "Asset",
  "Vulnerability",
  "Misconfiguration",
  "AttackPath",
  "Risk",
  "Case",
  "Workflow",
  "WorkflowRun",
  "Approval",
  "Integration",
  "User",
  "Identity",
  "Application",
  "Policy",
  "ComplianceControl",
] as const;

export type NodeType = (typeof NODE_TYPES)[number];

export const RELATIONSHIP_TYPES = [
  "HAS_VULNERABILITY",
  "HAS_MISCONFIGURATION",
  "PART_OF_ATTACK_PATH",
  "INCREASES_RISK",
  "MITIGATED_BY",
  "TRIGGERED_CASE",
  "TRIGGERED_WORKFLOW",
  "REQUIRES_APPROVAL",
  "CONNECTED_TO",
  "CAN_ACCESS",
  "VIOLATES_POLICY",
  "LINKED_TO_RUN",
] as const;

export type RelationshipType = (typeof RELATIONSHIP_TYPES)[number];

export const EVENT_TYPES = [
  "risk_score_changed",
  "workflow_executed",
  "case_created",
  "approval_requested",
  "approval_granted",
  "vulnerability_detected",
  "misconfiguration_found",
  "attack_path_discovered",
  "policy_violated",
  "compliance_check_failed",
] as const;

export type EventType = (typeof EVENT_TYPES)[number];

export type Severity = "critical" | "high" | "medium" | "low" | "info";

export type EntityStatus =
  | "active"
  | "inactive"
  | "resolved"
  | "in_progress"
  | "pending"
  | "closed"
  | "open"
  | "compliant"
  | "non_compliant";

export type Environment =
  | "production"
  | "staging"
  | "development"
  | "shared"
  | "external";

/* ═══════════════════════════════════════════════════════════
   TIMESTAMPS
   ═══════════════════════════════════════════════════════════ */

export interface Timestamps {
  created_at: string; // ISO-8601
  updated_at: string; // ISO-8601
}

/* ═══════════════════════════════════════════════════════════
   NODE
   ═══════════════════════════════════════════════════════════ */

export interface GraphNode {
  id: string;
  entity_type: NodeType;
  name: string;
  severity: Severity;
  risk_score: number; // 0-100
  status: EntityStatus;
  environment: Environment;
  tags: string[];
  metadata: Record<string, unknown>;
  timestamps: Timestamps;
}

/* ═══════════════════════════════════════════════════════════
   EDGE
   ═══════════════════════════════════════════════════════════ */

export interface GraphEdge {
  id: string;
  from_id: string;
  to_id: string;
  relationship_type: RelationshipType;
  metadata: Record<string, unknown>;
  timestamps: Timestamps;
}

/* ═══════════════════════════════════════════════════════════
   EVENT
   ═══════════════════════════════════════════════════════════ */

export interface GraphEvent {
  id: string;
  event_type: EventType;
  entity_id: string;
  actor: string; // user-id, agent-id, or "system"
  before_state: Record<string, unknown> | null;
  after_state: Record<string, unknown> | null;
  timestamp: string; // ISO-8601
}

/* ═══════════════════════════════════════════════════════════
   GRAPH CONTAINER
   ═══════════════════════════════════════════════════════════ */

/** Top-level container holding the full graph state. */
export interface SecurityGraph {
  nodes: GraphNode[];
  edges: GraphEdge[];
  events: GraphEvent[];
}