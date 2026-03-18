/**
 * Graph Adapter — Compliance
 *
 * Provides a filtered view of the unified graph for the Compliance module.
 * Queries nodes where entity_type = ComplianceControl | Policy.
 * Relationships: VIOLATES_POLICY, INCREASES_RISK, MITIGATED_BY.
 *
 * Does NOT change any UI — only supplies data.
 */

import type { GraphNode, GraphEdge, SecurityGraph } from "../types";
import { SECURITY_GRAPH } from "../instance";
import {
  getNodesByType,
  getNodeById,
  getEdgesForNode,
  getOutgoingEdges,
  getIncomingEdges,
  getEventsForEntity,
} from "../utils";

/* ═══════════════════════════════════════════════════════════
   CONSTANTS
   ═══════════════════════════════════════════════════════════ */

const COMPLIANCE_RELATIONSHIP_TYPES = [
  "VIOLATES_POLICY",
  "INCREASES_RISK",
  "MITIGATED_BY",
] as const;

/* ═══════════════════════════════════════════════════════════
   QUERIES
   ═══════════════════════════════════════════════════════════ */

/** All ComplianceControl nodes in the graph. */
export function getComplianceNodes(graph: SecurityGraph = SECURITY_GRAPH): GraphNode[] {
  return getNodesByType(graph, "ComplianceControl");
}

/** All Policy nodes in the graph. */
export function getPolicyNodes(graph: SecurityGraph = SECURITY_GRAPH): GraphNode[] {
  return getNodesByType(graph, "Policy");
}

/** Single compliance control by ID. */
export function getComplianceNodeById(
  id: string,
  graph: SecurityGraph = SECURITY_GRAPH,
): GraphNode | undefined {
  const node = getNodeById(graph, id);
  return node?.entity_type === "ComplianceControl" ? node : undefined;
}

/** Edges relevant to the compliance module for a given control. */
export function getComplianceRelationships(
  controlId: string,
  graph: SecurityGraph = SECURITY_GRAPH,
): GraphEdge[] {
  return getEdgesForNode(graph, controlId).filter((e) =>
    (COMPLIANCE_RELATIONSHIP_TYPES as readonly string[]).includes(e.relationship_type),
  );
}

/**
 * Get assets that VIOLATE_POLICY linked from a compliance control.
 * These are assets that are non-compliant with this control.
 */
export function getControlViolatingAssets(
  controlId: string,
  graph: SecurityGraph = SECURITY_GRAPH,
): GraphNode[] {
  const edges = getIncomingEdges(graph, controlId).filter(
    (e) => e.relationship_type === "VIOLATES_POLICY",
  );
  return edges
    .map((e) => getNodeById(graph, e.from_id))
    .filter(Boolean) as GraphNode[];
}

/**
 * Get risks or attack-path nodes that INCREASES_RISK edges point to
 * from a compliance control (i.e., gaps that worsen a risk).
 */
export function getControlIncreasedRisks(
  controlId: string,
  graph: SecurityGraph = SECURITY_GRAPH,
): GraphNode[] {
  const edges = getOutgoingEdges(graph, controlId).filter(
    (e) => e.relationship_type === "INCREASES_RISK",
  );
  return edges
    .map((e) => getNodeById(graph, e.to_id))
    .filter(Boolean) as GraphNode[];
}

/**
 * Get workflows/controls that MITIGATED_BY edges point to
 * from a compliance control node.
 */
export function getControlMitigations(
  controlId: string,
  graph: SecurityGraph = SECURITY_GRAPH,
): GraphNode[] {
  const edges = getOutgoingEdges(graph, controlId).filter(
    (e) => e.relationship_type === "MITIGATED_BY",
  );
  return edges
    .map((e) => getNodeById(graph, e.to_id))
    .filter(Boolean) as GraphNode[];
}

/** Timeline events for a compliance control. */
export function getComplianceEvents(
  controlId: string,
  graph: SecurityGraph = SECURITY_GRAPH,
) {
  return getEventsForEntity(graph, controlId);
}

/** Summary statistics derived from graph data for compliance. */
export function getComplianceGraphSummary(graph: SecurityGraph = SECURITY_GRAPH) {
  const controls = getComplianceNodes(graph);
  const policies = getPolicyNodes(graph);

  const nonCompliant = controls.filter(
    (c) => c.status === "non_compliant",
  );
  const compliant = controls.filter(
    (c) => c.status === "compliant",
  );
  const critical = nonCompliant.filter((c) => c.severity === "critical");
  const high = nonCompliant.filter((c) => c.severity === "high");

  // Count assets with policy violations
  const violationEdges = graph.edges.filter(
    (e) => e.relationship_type === "VIOLATES_POLICY",
  );
  const uniqueViolatingAssets = new Set(violationEdges.map((e) => e.from_id));

  return {
    totalControls: controls.length,
    compliantControls: compliant.length,
    nonCompliantControls: nonCompliant.length,
    criticalGaps: critical.length,
    highGaps: high.length,
    totalPolicies: policies.length,
    assetsWithViolations: uniqueViolatingAssets.size,
    complianceScore:
      controls.length > 0
        ? Math.round((compliant.length / controls.length) * 100)
        : 0,
  };
}
