/**
 * Graph Adapter — Attack Paths
 *
 * Provides a filtered view of the unified graph for the Attack Paths module.
 * Queries nodes where entity_type = AttackPath.
 * Relationships: PART_OF_ATTACK_PATH, CONNECTED_TO, CAN_ACCESS.
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
  getEventsForEntity,
} from "../utils";

/* ═══════════════════════════════════════════════════════════
   CONSTANTS
   ═══════════════════════════════════════════════════════════ */

const ATTACK_PATH_RELATIONSHIP_TYPES = [
  "PART_OF_ATTACK_PATH",
  "CONNECTED_TO",
  "CAN_ACCESS",
] as const;

/* ═══════════════════════════════════════════════════════════
   QUERIES
   ═══════════════════════════════════════════════════════════ */

/** All attack path nodes in the graph. */
export function getAttackPathNodes(graph: SecurityGraph = SECURITY_GRAPH): GraphNode[] {
  return getNodesByType(graph, "AttackPath");
}

/** Single attack path by ID. */
export function getAttackPathById(
  id: string,
  graph: SecurityGraph = SECURITY_GRAPH,
): GraphNode | undefined {
  const node = getNodeById(graph, id);
  return node?.entity_type === "AttackPath" ? node : undefined;
}

/** Edges relevant to the attack paths module for a given path. */
export function getAttackPathRelationships(
  pathId: string,
  graph: SecurityGraph = SECURITY_GRAPH,
): GraphEdge[] {
  return getEdgesForNode(graph, pathId).filter((e) =>
    (ATTACK_PATH_RELATIONSHIP_TYPES as readonly string[]).includes(e.relationship_type),
  );
}

/**
 * Get all entities that are PART_OF an attack path.
 * Returns nodes (assets, vulns, identities, etc.) linked via PART_OF_ATTACK_PATH.
 */
export function getAttackPathMembers(
  pathId: string,
  graph: SecurityGraph = SECURITY_GRAPH,
): GraphNode[] {
  const edges = getIncomingEdges(graph, pathId).filter(
    (e) => e.relationship_type === "PART_OF_ATTACK_PATH",
  );
  return edges
    .map((e) => getNodeById(graph, e.from_id))
    .filter(Boolean) as GraphNode[];
}

/**
 * Get entities with CAN_ACCESS edges pointing to / from an attack path.
 * These represent identities/accounts that could traverse the path.
 */
export function getAttackPathAccessors(
  pathId: string,
  graph: SecurityGraph = SECURITY_GRAPH,
): { node: GraphNode; edge: GraphEdge }[] {
  const edges = getEdgesForNode(graph, pathId).filter(
    (e) => e.relationship_type === "CAN_ACCESS",
  );
  return edges
    .map((e) => {
      const neighborId = e.from_id === pathId ? e.to_id : e.from_id;
      const node = getNodeById(graph, neighborId);
      return node ? { node, edge: e } : null;
    })
    .filter(Boolean) as { node: GraphNode; edge: GraphEdge }[];
}

/**
 * Get network connectivity edges relevant to attack path members.
 * Returns CONNECTED_TO edges between any members of the path.
 */
export function getAttackPathConnectivity(
  pathId: string,
  graph: SecurityGraph = SECURITY_GRAPH,
): GraphEdge[] {
  const memberIds = new Set(
    getAttackPathMembers(pathId, graph).map((n) => n.id),
  );
  return graph.edges.filter(
    (e) =>
      e.relationship_type === "CONNECTED_TO" &&
      (memberIds.has(e.from_id) || memberIds.has(e.to_id)),
  );
}

/** Timeline events for an attack path. */
export function getAttackPathEvents(
  pathId: string,
  graph: SecurityGraph = SECURITY_GRAPH,
) {
  return getEventsForEntity(graph, pathId);
}

/** Summary statistics derived from graph data. */
export function getAttackPathGraphSummary(graph: SecurityGraph = SECURITY_GRAPH) {
  const paths = getAttackPathNodes(graph);
  const critical = paths.filter((p) => p.severity === "critical");
  const high = paths.filter((p) => p.severity === "high");
  const medium = paths.filter((p) => p.severity === "medium");
  const low = paths.filter((p) => p.severity === "low" || p.severity === "info");

  // Count total unique member entities
  const allMemberIds = new Set<string>();
  for (const path of paths) {
    const members = getAttackPathMembers(path.id, graph);
    members.forEach((m) => allMemberIds.add(m.id));
  }

  return {
    total: paths.length,
    critical: critical.length,
    high: high.length,
    medium: medium.length,
    low: low.length,
    uniqueEntitiesInvolved: allMemberIds.size,
    averageRiskScore:
      paths.length > 0
        ? Math.round(paths.reduce((s, p) => s + p.risk_score, 0) / paths.length)
        : 0,
  };
}