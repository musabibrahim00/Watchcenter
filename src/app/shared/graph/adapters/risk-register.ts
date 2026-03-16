/**
 * Graph Adapter — Risk Register
 *
 * Provides a filtered view of the unified graph for the Risk Register module.
 * Queries nodes where entity_type = Risk.
 * Relationships: INCREASES_RISK, MITIGATED_BY, VIOLATES_POLICY.
 *
 * Does NOT change any UI — only supplies data.
 */

import type { GraphNode, GraphEdge, SecurityGraph } from "../types";
import { SECURITY_GRAPH } from "../instance";
import {
  getNodesByType,
  getNodeById,
  getEdgesForNode,
  getIncomingEdges,
  getOutgoingEdges,
  getEventsForEntity,
} from "../utils";

/* ═══════════════════════════════════════════════════════════
   CONSTANTS
   ═══════════════════════════════════════════════════════════ */

const RISK_RELATIONSHIP_TYPES = [
  "INCREASES_RISK",
  "MITIGATED_BY",
  "VIOLATES_POLICY",
] as const;

/* ═══════════════════════════════════════════════════════════
   QUERIES
   ═════════════════════════════════════════��═════════════════ */

/** All risk nodes in the graph. */
export function getRiskNodes(graph: SecurityGraph = SECURITY_GRAPH): GraphNode[] {
  return getNodesByType(graph, "Risk");
}

/** Single risk by ID. */
export function getRiskNodeById(
  id: string,
  graph: SecurityGraph = SECURITY_GRAPH,
): GraphNode | undefined {
  const node = getNodeById(graph, id);
  return node?.entity_type === "Risk" ? node : undefined;
}

/** All edges relevant to the risk register for a given risk. */
export function getRiskRelationships(
  riskId: string,
  graph: SecurityGraph = SECURITY_GRAPH,
): GraphEdge[] {
  return getEdgesForNode(graph, riskId).filter((e) =>
    (RISK_RELATIONSHIP_TYPES as readonly string[]).includes(e.relationship_type),
  );
}

/**
 * Entities that INCREASES_RISK for a given risk node.
 * These are attack paths, vulnerabilities, misconfigurations, etc.
 */
export function getRiskContributors(
  riskId: string,
  graph: SecurityGraph = SECURITY_GRAPH,
): { node: GraphNode; contribution: number }[] {
  const edges = getIncomingEdges(graph, riskId).filter(
    (e) => e.relationship_type === "INCREASES_RISK",
  );
  return edges
    .map((e) => {
      const node = getNodeById(graph, e.from_id);
      const contribution = (e.metadata.contribution as number) ?? 0;
      return node ? { node, contribution } : null;
    })
    .filter(Boolean) as { node: GraphNode; contribution: number }[];
}

/**
 * Workflows/controls that MITIGATE a given risk.
 */
export function getRiskMitigations(
  riskId: string,
  graph: SecurityGraph = SECURITY_GRAPH,
): GraphNode[] {
  const edges = getOutgoingEdges(graph, riskId).filter(
    (e) => e.relationship_type === "MITIGATED_BY",
  );
  return edges
    .map((e) => getNodeById(graph, e.to_id))
    .filter(Boolean) as GraphNode[];
}

/**
 * Policies violated by a given risk (VIOLATES_POLICY edges from the risk).
 */
export function getRiskPolicyViolations(
  riskId: string,
  graph: SecurityGraph = SECURITY_GRAPH,
): GraphNode[] {
  const edges = getOutgoingEdges(graph, riskId).filter(
    (e) => e.relationship_type === "VIOLATES_POLICY",
  );
  return edges
    .map((e) => getNodeById(graph, e.to_id))
    .filter(Boolean) as GraphNode[];
}

/** Timeline events for a risk entity. */
export function getRiskEvents(
  riskId: string,
  graph: SecurityGraph = SECURITY_GRAPH,
) {
  return getEventsForEntity(graph, riskId);
}

/** Summary statistics derived from graph data. */
export function getRiskGraphSummary(graph: SecurityGraph = SECURITY_GRAPH) {
  const risks = getRiskNodes(graph);
  const critical = risks.filter((r) => r.severity === "critical");
  const high = risks.filter((r) => r.severity === "high");
  const active = risks.filter((r) => r.status === "active");

  // Count total mitigations across all risks
  let totalMitigations = 0;
  let totalContributors = 0;
  let totalViolations = 0;
  for (const risk of risks) {
    totalMitigations += getRiskMitigations(risk.id, graph).length;
    totalContributors += getRiskContributors(risk.id, graph).length;
    totalViolations += getRiskPolicyViolations(risk.id, graph).length;
  }

  return {
    total: risks.length,
    critical: critical.length,
    high: high.length,
    active: active.length,
    totalMitigations,
    totalContributors,
    totalViolations,
    averageRiskScore:
      risks.length > 0
        ? Math.round(risks.reduce((s, r) => s + r.risk_score, 0) / risks.length)
        : 0,
  };
}