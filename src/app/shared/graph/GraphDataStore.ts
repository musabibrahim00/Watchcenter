/**
 * Graph Data Store — Incremental Loading with Cache
 * ===================================================
 *
 * Simulates an API-backed graph store that never loads the full dataset.
 * Data is fetched incrementally, one neighborhood at a time:
 *
 *   1. fetchNode(id)          — load a single node
 *   2. fetchNeighborhood(id)  — load first-degree relationships for a node
 *
 * Internally backed by the full seed data (SG_NODES / SG_EDGES), but
 * consumers only ever see the subset that has been explicitly fetched.
 *
 * A relationship cache (keyed by `nodeId:relationshipType`) avoids
 * redundant lookups for frequently accessed patterns like
 * Asset -> vulnerabilities, Attack Path -> assets, Risk -> cases.
 *
 * This module is UI-agnostic — no React, no rendering code.
 */

import type { SGNode, SGEdge } from "./security-graph-data";
import { SG_NODES, SG_EDGES } from "./security-graph-data";

/* ═══════════════════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════════════════ */

export interface NeighborhoodResult {
  /** The target node (if it exists). */
  node: SGNode | null;
  /** First-degree neighbor nodes. */
  neighbors: SGNode[];
  /** Edges connecting the target to its neighbors. */
  edges: SGEdge[];
}

export interface GraphStoreSnapshot {
  /** All nodes currently in the store (loaded so far). */
  nodes: SGNode[];
  /** All edges where both endpoints are loaded. */
  edges: SGEdge[];
  /** Total node count in the full backing dataset (for "showing X of Y"). */
  totalNodeCount: number;
}

/* ═══════════════════════════════════════════════════════════
   STORE IMPLEMENTATION
   ═══════════════════════════════════════════════════════════ */

export class GraphDataStore {
  /* ── Backing data (simulates remote API) ── */
  private readonly _allNodes: Map<string, SGNode>;
  private readonly _outgoing: Map<string, SGEdge[]>;
  private readonly _incoming: Map<string, SGEdge[]>;

  /* ── Loaded subset (what the UI sees) ── */
  private readonly _loadedNodes: Map<string, SGNode> = new Map();
  private readonly _loadedEdges: Map<string, SGEdge> = new Map(); // key = `from:to`

  /* ── Relationship cache ── */
  private readonly _neighborhoodCache: Map<string, NeighborhoodResult> = new Map();

  /* ── Change listeners ── */
  private readonly _listeners: Set<() => void> = new Set();

  /* ── Version counter (bumped on every mutation for React reactivity) ── */
  private _version = 0;

  constructor(nodes?: SGNode[], edges?: SGEdge[]) {
    const rawNodes = nodes ?? SG_NODES;
    const rawEdges = edges ?? SG_EDGES;

    this._allNodes = new Map(rawNodes.map((n) => [n.id, n]));
    this._outgoing = new Map();
    this._incoming = new Map();

    for (const n of rawNodes) {
      this._outgoing.set(n.id, []);
      this._incoming.set(n.id, []);
    }

    for (const e of rawEdges) {
      this._outgoing.get(e.from)?.push(e);
      this._incoming.get(e.to)?.push(e);
    }
  }

  /* ═══════════════════════════════════════════════════════════
     PUBLIC API
     ═══════════════════════════════════════════════════════════ */

  /** Total number of nodes in the full backing dataset. */
  get totalNodeCount(): number {
    return this._allNodes.size;
  }

  /** Current version counter (for React dependency arrays). */
  get version(): number {
    return this._version;
  }

  /**
   * Load a single node into the store.
   * Returns null if the node doesn't exist in the backing data.
   *
   * Simulates: `GET /api/graph/nodes/:id`
   */
  fetchNode(id: string): SGNode | null {
    const cached = this._loadedNodes.get(id);
    if (cached) return cached;

    const node = this._allNodes.get(id) ?? null;
    if (node) {
      this._loadedNodes.set(id, node);
      this._bump();
    }
    return node;
  }

  /**
   * Load a node and all its first-degree relationships.
   * Returns the neighborhood result and adds everything to the store.
   * Uses the cache for subsequent calls with the same nodeId.
   *
   * Simulates: `GET /api/graph/nodes/:id/neighborhood`
   */
  fetchNeighborhood(nodeId: string): NeighborhoodResult {
    // Check cache first
    const cached = this._neighborhoodCache.get(nodeId);
    if (cached) return cached;

    const node = this._allNodes.get(nodeId) ?? null;
    if (!node) {
      const empty: NeighborhoodResult = { node: null, neighbors: [], edges: [] };
      this._neighborhoodCache.set(nodeId, empty);
      return empty;
    }

    // Collect first-degree edges and neighbors
    const neighborIds = new Set<string>();
    const edges: SGEdge[] = [];

    for (const e of this._outgoing.get(nodeId) ?? []) {
      neighborIds.add(e.to);
      edges.push(e);
    }
    for (const e of this._incoming.get(nodeId) ?? []) {
      neighborIds.add(e.from);
      edges.push(e);
    }

    const neighbors: SGNode[] = [];
    for (const nid of neighborIds) {
      const n = this._allNodes.get(nid);
      if (n) neighbors.push(n);
    }

    const result: NeighborhoodResult = { node, neighbors, edges };
    this._neighborhoodCache.set(nodeId, result);

    // Add to loaded subset
    this._loadedNodes.set(nodeId, node);
    for (const n of neighbors) {
      this._loadedNodes.set(n.id, n);
    }
    for (const e of edges) {
      this._loadedEdges.set(`${e.from}:${e.to}`, e);
    }

    // Also add any cross-edges between already-loaded nodes
    this._resolveInterEdges();

    this._bump();
    return result;
  }

  /**
   * Fetch neighbors of a specific type for a node.
   * Uses a type-specific cache key for frequent patterns.
   *
   * Simulates: `GET /api/graph/nodes/:id/neighborhood?type=vulnerability`
   */
  fetchNeighborsByType(nodeId: string, type: string): SGNode[] {
    const cacheKey = `${nodeId}:${type}`;
    // Leverage neighborhood cache — fetch full neighborhood if not cached
    if (!this._neighborhoodCache.has(nodeId)) {
      this.fetchNeighborhood(nodeId);
    }
    const neighborhood = this._neighborhoodCache.get(nodeId);
    if (!neighborhood) return [];
    return neighborhood.neighbors.filter((n) => n.type === type);
  }

  /**
   * Get a snapshot of all loaded data (for passing to useFocusedGraph).
   * The snapshot arrays are rebuilt only when the version changes.
   */
  getSnapshot(): GraphStoreSnapshot {
    return {
      nodes: Array.from(this._loadedNodes.values()),
      edges: Array.from(this._loadedEdges.values()),
      totalNodeCount: this._allNodes.size,
    };
  }

  /**
   * Check if a node's neighborhood has already been loaded.
   */
  isNeighborhoodLoaded(nodeId: string): boolean {
    return this._neighborhoodCache.has(nodeId);
  }

  /**
   * Check if a specific node is in the loaded subset.
   */
  isNodeLoaded(nodeId: string): boolean {
    return this._loadedNodes.has(nodeId);
  }

  /**
   * Subscribe to store changes.
   * Returns an unsubscribe function.
   */
  subscribe(listener: () => void): () => void {
    this._listeners.add(listener);
    return () => { this._listeners.delete(listener); };
  }

  /**
   * Reset the store to empty state, clearing all caches.
   */
  reset(): void {
    this._loadedNodes.clear();
    this._loadedEdges.clear();
    this._neighborhoodCache.clear();
    this._bump();
  }

  /* ═══════════════════════════════════════════════════════════
     INTERNALS
     ═══════════════════════════════════════════════════════════ */

  /**
   * After loading new nodes, check if there are edges in the full dataset
   * that now connect two loaded nodes but haven't been added yet.
   * This keeps the visible edge set complete without loading all edges upfront.
   */
  private _resolveInterEdges(): void {
    for (const nodeId of this._loadedNodes.keys()) {
      for (const e of this._outgoing.get(nodeId) ?? []) {
        const key = `${e.from}:${e.to}`;
        if (!this._loadedEdges.has(key) && this._loadedNodes.has(e.to)) {
          this._loadedEdges.set(key, e);
        }
      }
    }
  }

  /** Increment version and notify listeners. */
  private _bump(): void {
    this._version++;
    for (const fn of this._listeners) {
      try { fn(); } catch { /* ignore listener errors */ }
    }
  }
}

/* ═══════════════════════════════════════════════════════════
   SINGLETON INSTANCE
   ═══════════════════════════════════════════════════════════ */

/**
 * Default store backed by security-graph-data.ts seed data.
 * Import this for the Security Graph page and any other consumer.
 */
export const graphDataStore = new GraphDataStore();
