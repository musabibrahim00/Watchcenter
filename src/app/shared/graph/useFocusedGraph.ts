/**
 * Focused Graph Engine
 * ====================
 *
 * Manages progressive loading of graph data:
 *   1. Start with a single focus node
 *   2. Show only first-degree relationships
 *   3. Expand on demand per-node
 *   4. Cap visible nodes at MAX_VISIBLE (30)
 *   5. Produce collapsed indicators ("+N more vulnerabilities")
 *   6. Produce compressed path indicators ("(+3 intermediate nodes)")
 *
 * Pure data — no UI code. Works with any node/edge shape that has `id`,
 * `from`/`to` (or configurable accessors).
 */

import { useState, useMemo, useCallback } from "react";

/* ═══════════════════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════════════════ */

export interface FocusedNode {
  id: string;
  type: string;
  [key: string]: unknown;
}

export interface FocusedEdge {
  from: string;
  to: string;
  [key: string]: unknown;
}

/** Overflow indicator shown when a type exceeds the visible cap. */
export interface CollapsedGroup {
  /** The node from which these were discovered */
  parentNodeId: string;
  /** The hidden node type (e.g. "vulnerability") */
  type: string;
  /** Human label (e.g. "vulnerabilities") */
  label: string;
  /** How many nodes are hidden behind the indicator */
  count: number;
  /** IDs of the hidden nodes (for later expansion) */
  hiddenIds: string[];
}

/** Indicator for a compressed multi-hop path. */
export interface CompressedPath {
  fromId: string;
  toId: string;
  /** IDs of the intermediate hidden nodes */
  intermediateIds: string[];
  /** Count of intermediate hops */
  intermediateCount: number;
}

export interface FocusedGraphState<N extends FocusedNode, E extends FocusedEdge> {
  /** Currently visible nodes (capped at maxVisible). */
  visibleNodes: N[];
  /** Edges where both endpoints are visible. */
  visibleEdges: E[];
  /** Overflow groups that can be expanded. */
  collapsedGroups: CollapsedGroup[];
  /** Compressed multi-hop paths. */
  compressedPaths: CompressedPath[];
  /** The current focus node ID. */
  focusNodeId: string | null;
  /** Set of node IDs that have been expanded. */
  expandedIds: Set<string>;
  /** Total nodes that *would* be visible without the cap. */
  totalUncappedCount: number;

  /* ── Actions ── */
  /** Set the focus to a specific node (resets expansion). */
  setFocus: (nodeId: string) => void;
  /** Expand first-degree relationships for a node. */
  expandNode: (nodeId: string) => void;
  /** Expand a collapsed group (reveal hidden nodes of a type). */
  expandCollapsedGroup: (parentNodeId: string, type: string) => void;
  /** Expand a compressed path (reveal intermediate nodes). */
  expandCompressedPath: (fromId: string, toId: string) => void;
  /** Collapse a previously expanded node back. */
  collapseNode: (nodeId: string) => void;
  /** Check whether a specific node has been expanded. */
  isExpanded: (nodeId: string) => boolean;
  /** Reset to initial state with only the focus node. */
  reset: () => void;
}

/* ═══════════════════════════════════════════════════════════
   CONFIG
   ═══════════════════════════════════════════════════════════ */

export interface FocusedGraphConfig {
  /** Maximum number of visible nodes. Default 30. */
  maxVisible?: number;
  /** Type accessor for a node. Default: `n => n.type`. */
  getNodeType?: (n: FocusedNode) => string;
  /** Human-readable plural label for a type. */
  getTypeLabel?: (type: string) => string;
}

const DEFAULT_MAX = 30;

/* ═══════════════════════════════════════════════════════════
   HOOK
   ═══════════════════════════════════════════════════════════ */

export function useFocusedGraph<
  N extends FocusedNode = FocusedNode,
  E extends FocusedEdge = FocusedEdge,
>(
  allNodes: N[],
  allEdges: E[],
  initialFocusId: string | null,
  config: FocusedGraphConfig = {},
): FocusedGraphState<N, E> {
  const maxVisible = config.maxVisible ?? DEFAULT_MAX;
  const getType = (config.getNodeType ?? ((n: FocusedNode) => n.type)) as (n: N) => string;
  const getLabel = config.getTypeLabel ?? ((t: string) => `${t}s`);

  // ── Index maps (stable across renders if allNodes/allEdges don't change) ──
  const { nodeMap, outgoing, incoming } = useMemo(() => {
    const nm = new Map<string, N>();
    const out = new Map<string, string[]>();
    const inc = new Map<string, string[]>();
    for (const n of allNodes) {
      nm.set(n.id, n);
      out.set(n.id, []);
      inc.set(n.id, []);
    }
    for (const e of allEdges) {
      out.get(e.from)?.push(e.to);
      inc.get(e.to)?.push(e.from);
    }
    return { nodeMap: nm, outgoing: out, incoming: inc };
  }, [allNodes, allEdges]);

  // ── State ──
  const [focusNodeId, setFocusNodeId] = useState<string | null>(initialFocusId);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => {
    // Auto-expand the initial focus node so first-degree neighbors are visible
    return initialFocusId ? new Set([initialFocusId]) : new Set();
  });
  // Track explicitly expanded collapsed groups: Map<`${parentId}:${type}`, Set<hiddenIds>>
  const [revealedGroups, setRevealedGroups] = useState<Set<string>>(new Set());
  // Track explicitly expanded compressed paths
  const [revealedPaths, setRevealedPaths] = useState<Set<string>>(new Set());

  // ── Compute visible set ──
  const computed = useMemo(() => {
    if (!focusNodeId || !nodeMap.has(focusNodeId)) {
      return {
        visibleNodes: [] as N[],
        visibleEdges: [] as E[],
        collapsedGroups: [] as CollapsedGroup[],
        compressedPaths: [] as CompressedPath[],
        totalUncappedCount: 0,
      };
    }

    // Step 1: Collect all candidate node IDs
    const candidateIds = new Set<string>();
    candidateIds.add(focusNodeId);

    for (const expandedId of expandedIds) {
      if (!nodeMap.has(expandedId)) continue;
      candidateIds.add(expandedId);
      // Add first-degree neighbors
      for (const neighborId of outgoing.get(expandedId) ?? []) {
        candidateIds.add(neighborId);
      }
      for (const neighborId of incoming.get(expandedId) ?? []) {
        candidateIds.add(neighborId);
      }
    }

    // Add revealed group nodes
    for (const key of revealedGroups) {
      const [parentId] = key.split(":");
      // Re-gather all neighbors of parent and add those matching the type
      for (const nid of outgoing.get(parentId) ?? []) candidateIds.add(nid);
      for (const nid of incoming.get(parentId) ?? []) candidateIds.add(nid);
    }

    // Add revealed compressed path intermediates
    for (const key of revealedPaths) {
      const [fromId, toId] = key.split("→");
      // BFS from fromId to toId to find intermediates
      const intermediates = findShortestPath(fromId, toId, outgoing, incoming);
      for (const nid of intermediates) candidateIds.add(nid);
    }

    const totalUncappedCount = candidateIds.size;

    // Step 2: Apply the 30-node cap with priority ordering:
    //   - Focus node first
    //   - Then expanded nodes
    //   - Then neighbors sorted by proximity to focus
    const prioritized: string[] = [focusNodeId];
    const added = new Set<string>([focusNodeId]);

    // Expanded nodes next
    for (const eid of expandedIds) {
      if (!added.has(eid) && candidateIds.has(eid)) {
        prioritized.push(eid);
        added.add(eid);
      }
    }

    // Remaining candidates
    for (const cid of candidateIds) {
      if (!added.has(cid)) {
        prioritized.push(cid);
        added.add(cid);
      }
    }

    const visibleIdSet = new Set(prioritized.slice(0, maxVisible));
    const overflowIds = new Set(prioritized.slice(maxVisible));

    // Step 3: Build visible node array
    const visibleNodes: N[] = [];
    for (const id of visibleIdSet) {
      const node = nodeMap.get(id);
      if (node) visibleNodes.push(node);
    }

    // Step 4: Visible edges — both endpoints must be visible
    const visibleEdges = allEdges.filter(
      (e) => visibleIdSet.has(e.from) && visibleIdSet.has(e.to),
    );

    // Step 5: Collapsed groups — for each expanded node, group hidden neighbors by type
    const collapsedGroups: CollapsedGroup[] = [];
    for (const expandedId of expandedIds) {
      const allNeighborIds = new Set<string>();
      for (const nid of outgoing.get(expandedId) ?? []) allNeighborIds.add(nid);
      for (const nid of incoming.get(expandedId) ?? []) allNeighborIds.add(nid);

      // Group hidden neighbors by type
      const hiddenByType = new Map<string, string[]>();
      for (const nid of allNeighborIds) {
        if (!visibleIdSet.has(nid)) {
          const node = nodeMap.get(nid);
          if (node) {
            const t = getType(node);
            if (!hiddenByType.has(t)) hiddenByType.set(t, []);
            hiddenByType.get(t)!.push(nid);
          }
        }
      }

      for (const [type, ids] of hiddenByType) {
        if (ids.length > 0) {
          collapsedGroups.push({
            parentNodeId: expandedId,
            type,
            label: getLabel(type),
            count: ids.length,
            hiddenIds: ids,
          });
        }
      }
    }

    // Also add collapsed groups for global overflow (nodes that exceed the 30 cap)
    if (overflowIds.size > 0) {
      const overflowByType = new Map<string, string[]>();
      for (const oid of overflowIds) {
        const node = nodeMap.get(oid);
        if (node) {
          const t = getType(node);
          if (!overflowByType.has(t)) overflowByType.set(t, []);
          overflowByType.get(t)!.push(oid);
        }
      }
      for (const [type, ids] of overflowByType) {
        // Only add if not already covered by a per-node group
        const alreadyCovered = collapsedGroups.some(
          (g) => g.type === type && g.hiddenIds.some((hid) => ids.includes(hid)),
        );
        if (!alreadyCovered && ids.length > 0) {
          collapsedGroups.push({
            parentNodeId: "__overflow__",
            type,
            label: getLabel(type),
            count: ids.length,
            hiddenIds: ids,
          });
        }
      }
    }

    // Step 6: Compressed paths — find pairs of visible nodes connected
    // through hidden intermediates
    const compressedPaths: CompressedPath[] = [];
    for (const edge of allEdges) {
      if (visibleIdSet.has(edge.from) && !visibleIdSet.has(edge.to)) {
        // Walk forward from edge.to until we find a visible node
        const path = walkToVisible(edge.to, outgoing, visibleIdSet, nodeMap);
        if (path.targetId && path.intermediates.length > 0) {
          // Avoid duplicates
          const key = `${edge.from}→${path.targetId}`;
          if (!compressedPaths.some((p) => `${p.fromId}→${p.toId}` === key)) {
            compressedPaths.push({
              fromId: edge.from,
              toId: path.targetId,
              intermediateIds: path.intermediates,
              intermediateCount: path.intermediates.length,
            });
          }
        }
      }
    }

    return { visibleNodes, visibleEdges, collapsedGroups, compressedPaths, totalUncappedCount };
  }, [
    focusNodeId, expandedIds, revealedGroups, revealedPaths,
    allNodes, allEdges, nodeMap, outgoing, incoming, maxVisible, getType, getLabel,
  ]);

  // ── Actions ──
  const setFocus = useCallback((nodeId: string) => {
    setFocusNodeId(nodeId);
    setExpandedIds(new Set([nodeId]));
    setRevealedGroups(new Set());
    setRevealedPaths(new Set());
  }, []);

  const expandNode = useCallback((nodeId: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      next.add(nodeId);
      return next;
    });
  }, []);

  const collapseNode = useCallback((nodeId: string) => {
    if (nodeId === focusNodeId) return; // Can't collapse focus
    setExpandedIds((prev) => {
      const next = new Set(prev);
      next.delete(nodeId);
      return next;
    });
  }, [focusNodeId]);

  const expandCollapsedGroup = useCallback((parentNodeId: string, type: string) => {
    const key = `${parentNodeId}:${type}`;
    setRevealedGroups((prev) => {
      const next = new Set(prev);
      next.add(key);
      return next;
    });
    // Also mark the parent as expanded
    setExpandedIds((prev) => {
      const next = new Set(prev);
      next.add(parentNodeId);
      return next;
    });
  }, []);

  const expandCompressedPath = useCallback((fromId: string, toId: string) => {
    const key = `${fromId}→${toId}`;
    setRevealedPaths((prev) => {
      const next = new Set(prev);
      next.add(key);
      return next;
    });
  }, []);

  const isExpanded = useCallback(
    (nodeId: string) => expandedIds.has(nodeId),
    [expandedIds],
  );

  const reset = useCallback(() => {
    setExpandedIds(initialFocusId ? new Set([initialFocusId]) : new Set());
    setFocusNodeId(initialFocusId);
    setRevealedGroups(new Set());
    setRevealedPaths(new Set());
  }, [initialFocusId]);

  return {
    ...computed,
    focusNodeId,
    expandedIds,
    setFocus,
    expandNode,
    expandCollapsedGroup,
    expandCompressedPath,
    collapseNode,
    isExpanded,
    reset,
  };
}

/* ═══════════════════════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════════════════════ */

/** Walk outgoing edges from `startId` until we hit a node in `visibleSet`. */
function walkToVisible(
  startId: string,
  outgoing: Map<string, string[]>,
  visibleSet: Set<string>,
  nodeMap: Map<string, FocusedNode>,
  maxDepth = 10,
): { targetId: string | null; intermediates: string[] } {
  const intermediates: string[] = [];
  let current = startId;
  const visited = new Set<string>();

  for (let depth = 0; depth < maxDepth; depth++) {
    if (visited.has(current)) break;
    visited.add(current);

    const neighbors = outgoing.get(current) ?? [];

    for (const nid of neighbors) {
      if (visibleSet.has(nid)) {
        return { targetId: nid, intermediates };
      }
    }

    // Pick first unvisited neighbor to continue walking
    const next = neighbors.find((n) => !visited.has(n) && nodeMap.has(n));
    if (!next) break;
    intermediates.push(current);
    current = next;
  }

  // Check if current itself is visible
  if (visibleSet.has(current)) {
    return { targetId: current, intermediates };
  }

  return { targetId: null, intermediates: [] };
}

/** BFS shortest path between two nodes. */
function findShortestPath(
  fromId: string,
  toId: string,
  outgoing: Map<string, string[]>,
  incoming: Map<string, string[]>,
): string[] {
  const parent = new Map<string, string | null>();
  parent.set(fromId, null);
  const queue = [fromId];
  let head = 0;

  while (head < queue.length) {
    const cur = queue[head++];
    if (cur === toId) break;
    for (const next of outgoing.get(cur) ?? []) {
      if (!parent.has(next)) {
        parent.set(next, cur);
        queue.push(next);
      }
    }
  }

  if (!parent.has(toId)) return [];

  const path: string[] = [];
  let cur: string | null = toId;
  while (cur !== null) {
    path.unshift(cur);
    cur = parent.get(cur) ?? null;
  }
  return path;
}
