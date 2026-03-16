/**
 * Graph Adapter — Asset Register
 *
 * Provides a filtered view of the unified graph for the Asset Register module.
 * Queries nodes where entity_type = Asset | Application.
 * Relationships: HAS_VULNERABILITY, HAS_MISCONFIGURATION, CONNECTED_TO.
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

const ASSET_NODE_TYPES = ["Asset", "Application"] as const;

const ASSET_RELATIONSHIP_TYPES = [
  "HAS_VULNERABILITY",
  "HAS_MISCONFIGURATION",
  "CONNECTED_TO",
] as const;

type AssetRelationship = (typeof ASSET_RELATIONSHIP_TYPES)[number];

/* ═══════════════════════════════════════════════════════════
   QUERIES
   ═══════════════════════════════════════════════════════════ */

/** All asset/application nodes in the graph. */
export function getAssetNodes(graph: SecurityGraph = SECURITY_GRAPH): GraphNode[] {
  return [
    ...getNodesByType(graph, "Asset"),
    ...getNodesByType(graph, "Application"),
  ];
}

/** Single asset by ID. */
export function getAssetNodeById(
  id: string,
  graph: SecurityGraph = SECURITY_GRAPH,
): GraphNode | undefined {
  const node = getNodeById(graph, id);
  if (node && (node.entity_type === "Asset" || node.entity_type === "Application")) {
    return node;
  }
  return undefined;
}

/** Edges relevant to the asset register for a given asset. */
export function getAssetRelationships(
  assetId: string,
  graph: SecurityGraph = SECURITY_GRAPH,
): GraphEdge[] {
  return getEdgesForNode(graph, assetId).filter((e) =>
    (ASSET_RELATIONSHIP_TYPES as readonly string[]).includes(e.relationship_type),
  );
}

/** Vulnerability nodes linked to an asset via HAS_VULNERABILITY. */
export function getAssetVulnerabilities(
  assetId: string,
  graph: SecurityGraph = SECURITY_GRAPH,
): GraphNode[] {
  const edges = getOutgoingEdges(graph, assetId).filter(
    (e) => e.relationship_type === "HAS_VULNERABILITY",
  );
  return edges
    .map((e) => getNodeById(graph, e.to_id))
    .filter(Boolean) as GraphNode[];
}

/** Misconfiguration nodes linked to an asset via HAS_MISCONFIGURATION. */
export function getAssetMisconfigurations(
  assetId: string,
  graph: SecurityGraph = SECURITY_GRAPH,
): GraphNode[] {
  const edges = getOutgoingEdges(graph, assetId).filter(
    (e) => e.relationship_type === "HAS_MISCONFIGURATION",
  );
  return edges
    .map((e) => getNodeById(graph, e.to_id))
    .filter(Boolean) as GraphNode[];
}

/** Assets connected to a given asset via CONNECTED_TO (bidirectional). */
export function getConnectedAssets(
  assetId: string,
  graph: SecurityGraph = SECURITY_GRAPH,
): GraphNode[] {
  const edges = getEdgesForNode(graph, assetId).filter(
    (e) => e.relationship_type === "CONNECTED_TO",
  );
  const neighborIds = edges.map((e) =>
    e.from_id === assetId ? e.to_id : e.from_id,
  );
  return neighborIds
    .map((id) => getNodeById(graph, id))
    .filter(Boolean) as GraphNode[];
}

/** Timeline events for an asset. */
export function getAssetEvents(
  assetId: string,
  graph: SecurityGraph = SECURITY_GRAPH,
) {
  return getEventsForEntity(graph, assetId);
}

/** Summary statistics derived from graph data. */
export function getAssetGraphSummary(graph: SecurityGraph = SECURITY_GRAPH) {
  const assets = getAssetNodes(graph);
  const vulnEdges = graph.edges.filter(
    (e) => e.relationship_type === "HAS_VULNERABILITY",
  );
  const misconfigEdges = graph.edges.filter(
    (e) => e.relationship_type === "HAS_MISCONFIGURATION",
  );

  const criticalAssets = assets.filter((a) => a.severity === "critical");
  const highRiskAssets = assets.filter((a) => a.risk_score >= 70);

  return {
    totalAssets: assets.length,
    criticalCount: criticalAssets.length,
    highRiskCount: highRiskAssets.length,
    totalVulnerabilityLinks: vulnEdges.length,
    totalMisconfigurationLinks: misconfigEdges.length,
    averageRiskScore:
      assets.length > 0
        ? Math.round(assets.reduce((s, a) => s + a.risk_score, 0) / assets.length)
        : 0,
  };
}