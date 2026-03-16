/**
 * Unified Security Graph — Barrel Export
 *
 * Single import point for the platform's shared graph data model.
 *
 * Usage:
 *   import { SECURITY_GRAPH, getNodeById, GraphNode } from "@/app/shared/graph";
 */

/* ── Types ── */
export type {
  NodeType,
  RelationshipType,
  EventType,
  Severity,
  EntityStatus,
  Environment,
  Timestamps,
  GraphNode,
  GraphEdge,
  GraphEvent,
  SecurityGraph,
} from "./types";

export { NODE_TYPES, RELATIONSHIP_TYPES, EVENT_TYPES } from "./types";

/* ── Seed data ── */
export { SEED_NODES } from "./nodes";
export { SEED_EDGES } from "./edges";
export { SEED_EVENTS } from "./events";

/* ── Utilities ── */
export {
  // Node lookups
  getNodeById,
  getNodesByType,
  getNodesBySeverity,
  getNodesByStatus,
  searchNodes,
  // Edge lookups
  getOutgoingEdges,
  getIncomingEdges,
  getEdgesForNode,
  getEdgesByRelationship,
  // Traversal
  getNeighborIds,
  getNeighbors,
  bfsTraverse,
  shortestPath,
  // Event lookups
  getEventsForEntity,
  getEventsByType,
  getEventsInWindow,
  // Construction helpers
  buildNodeIndex,
  buildAdjacencyList,
  // Subgraph extraction
  extractSubgraph,
  getNeighborhoodSubgraph,
} from "./utils";

/* ── Pre-built graph instance (from separate file to avoid circular deps) ── */
export { SECURITY_GRAPH } from "./instance";

/* ── Module Adapters (re-exported for convenience) ── */
export * from "./adapters";

/* ── Performance Utilities ── */
export {
  useThrottledRAF,
  useStablePositions,
  useViewportCull,
  useRefHover,
  screenToGraphViewport,
  isInViewport,
} from "./perf-utils";
export type { ViewportRect } from "./perf-utils";

/* ── Incremental Graph Loading ── */
export { GraphDataStore, graphDataStore } from "./GraphDataStore";
export type { NeighborhoodResult, GraphStoreSnapshot } from "./GraphDataStore";
export { useIncrementalGraph } from "./useIncrementalGraph";
export type { IncrementalGraphOptions, IncrementalGraphResult } from "./useIncrementalGraph";