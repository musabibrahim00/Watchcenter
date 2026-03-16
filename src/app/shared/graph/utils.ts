/**
 * Unified Security Graph — Query Utilities
 *
 * Pure functions for traversing and querying the graph.
 * No side-effects, no UI — safe to call from any module.
 */

import type {
  GraphNode,
  GraphEdge,
  GraphEvent,
  SecurityGraph,
  NodeType,
  RelationshipType,
  EventType,
  Severity,
  EntityStatus,
} from "./types";

/* ═══════════════════════════════════════════════════════════
   NODE LOOKUPS
   ═══════════════════════════════════════════════════════════ */

/** O(n) lookup — fine for current dataset sizes. */
export function getNodeById(
  graph: SecurityGraph,
  id: string,
): GraphNode | undefined {
  return graph.nodes.find((n) => n.id === id);
}

/** Return all nodes of a given entity type. */
export function getNodesByType(
  graph: SecurityGraph,
  type: NodeType,
): GraphNode[] {
  return graph.nodes.filter((n) => n.entity_type === type);
}

/** Return nodes matching a severity threshold or above. */
export function getNodesBySeverity(
  graph: SecurityGraph,
  minSeverity: Severity,
): GraphNode[] {
  const order: Record<Severity, number> = {
    critical: 4,
    high: 3,
    medium: 2,
    low: 1,
    info: 0,
  };
  const threshold = order[minSeverity];
  return graph.nodes.filter((n) => order[n.severity] >= threshold);
}

/** Return nodes matching a given status. */
export function getNodesByStatus(
  graph: SecurityGraph,
  status: EntityStatus,
): GraphNode[] {
  return graph.nodes.filter((n) => n.status === status);
}

/** Full-text search across node name, tags, and id. */
export function searchNodes(
  graph: SecurityGraph,
  query: string,
): GraphNode[] {
  const q = query.toLowerCase();
  return graph.nodes.filter(
    (n) =>
      n.name.toLowerCase().includes(q) ||
      n.id.toLowerCase().includes(q) ||
      n.tags.some((t) => t.toLowerCase().includes(q)),
  );
}

/* ═══════════════════════════════════════════════════════════
   EDGE LOOKUPS
   ═══════════════════════════════════════════════════════════ */

/** All edges originating from a given node. */
export function getOutgoingEdges(
  graph: SecurityGraph,
  nodeId: string,
): GraphEdge[] {
  return graph.edges.filter((e) => e.from_id === nodeId);
}

/** All edges pointing to a given node. */
export function getIncomingEdges(
  graph: SecurityGraph,
  nodeId: string,
): GraphEdge[] {
  return graph.edges.filter((e) => e.to_id === nodeId);
}

/** All edges (both directions) for a given node. */
export function getEdgesForNode(
  graph: SecurityGraph,
  nodeId: string,
): GraphEdge[] {
  return graph.edges.filter(
    (e) => e.from_id === nodeId || e.to_id === nodeId,
  );
}

/** Edges filtered by relationship type. */
export function getEdgesByRelationship(
  graph: SecurityGraph,
  type: RelationshipType,
): GraphEdge[] {
  return graph.edges.filter((e) => e.relationship_type === type);
}

/* ═══════════════════════════════════════════════════════════
   GRAPH TRAVERSAL
   ═══════════════════════════════════════════════════════════ */

/** Return the immediate neighbor node IDs for a given node (both directions). */
export function getNeighborIds(
  graph: SecurityGraph,
  nodeId: string,
): string[] {
  const ids = new Set<string>();
  for (const e of graph.edges) {
    if (e.from_id === nodeId) ids.add(e.to_id);
    if (e.to_id === nodeId) ids.add(e.from_id);
  }
  return Array.from(ids);
}

/** Return the full neighbor nodes. */
export function getNeighbors(
  graph: SecurityGraph,
  nodeId: string,
): GraphNode[] {
  const ids = getNeighborIds(graph, nodeId);
  return graph.nodes.filter((n) => ids.includes(n.id));
}

/**
 * Breadth-first traversal from a starting node.
 * Returns all reachable node IDs within `maxDepth` hops.
 */
export function bfsTraverse(
  graph: SecurityGraph,
  startId: string,
  maxDepth: number = Infinity,
): string[] {
  const visited = new Set<string>([startId]);
  let frontier = [startId];
  let depth = 0;

  while (frontier.length > 0 && depth < maxDepth) {
    const next: string[] = [];
    for (const id of frontier) {
      for (const neighborId of getNeighborIds(graph, id)) {
        if (!visited.has(neighborId)) {
          visited.add(neighborId);
          next.push(neighborId);
        }
      }
    }
    frontier = next;
    depth++;
  }

  return Array.from(visited);
}

/**
 * Find the shortest path between two nodes (unweighted BFS).
 * Returns the ordered list of node IDs, or null if unreachable.
 */
export function shortestPath(
  graph: SecurityGraph,
  fromId: string,
  toId: string,
): string[] | null {
  if (fromId === toId) return [fromId];

  const visited = new Set<string>([fromId]);
  const parent = new Map<string, string>();
  let frontier = [fromId];

  while (frontier.length > 0) {
    const next: string[] = [];
    for (const id of frontier) {
      for (const neighborId of getNeighborIds(graph, id)) {
        if (!visited.has(neighborId)) {
          visited.add(neighborId);
          parent.set(neighborId, id);
          if (neighborId === toId) {
            // reconstruct path
            const path: string[] = [toId];
            let cur = toId;
            while (parent.has(cur)) {
              cur = parent.get(cur)!;
              path.unshift(cur);
            }
            return path;
          }
          next.push(neighborId);
        }
      }
    }
    frontier = next;
  }

  return null;
}

/* ═══════════════════════════════════════════════════════════
   EVENT LOOKUPS
   ═══════════════════════════════════════════════════════════ */

/** Events for a given entity, most recent first. */
export function getEventsForEntity(
  graph: SecurityGraph,
  entityId: string,
): GraphEvent[] {
  return graph.events
    .filter((e) => e.entity_id === entityId)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

/** Events filtered by type, most recent first. */
export function getEventsByType(
  graph: SecurityGraph,
  type: EventType,
): GraphEvent[] {
  return graph.events
    .filter((e) => e.event_type === type)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

/** Events within a time window (ISO strings). */
export function getEventsInWindow(
  graph: SecurityGraph,
  after: string,
  before: string,
): GraphEvent[] {
  const afterMs = new Date(after).getTime();
  const beforeMs = new Date(before).getTime();
  return graph.events
    .filter((e) => {
      const t = new Date(e.timestamp).getTime();
      return t >= afterMs && t <= beforeMs;
    })
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

/* ═══════════════════════════════════════════════════════════
   GRAPH CONSTRUCTION HELPERS
   ═══════════════════════════════════════════════════════════ */

/** Build an index map for O(1) node lookups. */
export function buildNodeIndex(
  nodes: GraphNode[],
): Map<string, GraphNode> {
  return new Map(nodes.map((n) => [n.id, n]));
}

/** Build an adjacency list for fast traversal. */
export function buildAdjacencyList(
  edges: GraphEdge[],
): Map<string, { edge: GraphEdge; neighborId: string }[]> {
  const adj = new Map<string, { edge: GraphEdge; neighborId: string }[]>();

  const addEntry = (nodeId: string, neighborId: string, edge: GraphEdge) => {
    if (!adj.has(nodeId)) adj.set(nodeId, []);
    adj.get(nodeId)!.push({ edge, neighborId });
  };

  for (const e of edges) {
    addEntry(e.from_id, e.to_id, e);
    addEntry(e.to_id, e.from_id, e);
  }

  return adj;
}

/* ═══════════════════════════════════════════════════════════
   SUBGRAPH EXTRACTION
   ═══════════════════════════════════════════════════════════ */

/**
 * Extract a subgraph containing only the specified node IDs
 * and the edges that connect them.
 */
export function extractSubgraph(
  graph: SecurityGraph,
  nodeIds: Set<string>,
): SecurityGraph {
  const nodes = graph.nodes.filter((n) => nodeIds.has(n.id));
  const edges = graph.edges.filter(
    (e) => nodeIds.has(e.from_id) && nodeIds.has(e.to_id),
  );
  const events = graph.events.filter((e) => nodeIds.has(e.entity_id));
  return { nodes, edges, events };
}

/**
 * Extract the N-hop neighborhood subgraph around a node.
 */
export function getNeighborhoodSubgraph(
  graph: SecurityGraph,
  centerId: string,
  hops: number = 1,
): SecurityGraph {
  const nodeIds = new Set(bfsTraverse(graph, centerId, hops));
  return extractSubgraph(graph, nodeIds);
}
