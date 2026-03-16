/**
 * useIncrementalGraph — Incremental Graph Loading Hook
 * =====================================================
 *
 * Connects the GraphDataStore (incremental, cached) to the
 * useFocusedGraph engine (30-node cap, collapse indicators).
 *
 * Loading lifecycle:
 *   1. On mount → load only the focus node
 *   2. Immediately after → fetch first-degree relationships
 *   3. On expand → fetch next-level neighborhood for that node
 *   4. Never loads the full graph — always incremental
 *
 * Accepts `allNodes`/`allEdges` as backing data (simulating an API).
 * Internally creates a GraphDataStore from them and only feeds the
 * incrementally-loaded subset to useFocusedGraph.
 *
 * No UI code — returns the same shape as useFocusedGraph plus
 * loading metadata.
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { GraphDataStore } from "./GraphDataStore";
import type { GraphStoreSnapshot } from "./GraphDataStore";
import { useFocusedGraph } from "./useFocusedGraph";
import type { FocusedNode, FocusedEdge, FocusedGraphState, FocusedGraphConfig } from "./useFocusedGraph";

/* ═══════════════════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════════════════ */

export interface IncrementalGraphOptions extends FocusedGraphConfig {
  /** Custom store instance (overrides allNodes/allEdges). */
  store?: GraphDataStore;
}

export interface IncrementalGraphResult<
  N extends FocusedNode = FocusedNode,
  E extends FocusedEdge = FocusedEdge,
> extends FocusedGraphState<N, E> {
  /** Whether the initial focus node is currently loading. */
  isLoading: boolean;
  /** Whether a neighborhood expansion is in progress. */
  isExpanding: boolean;
  /** Total node count in the full backing dataset. */
  totalBackingCount: number;
  /** Number of nodes currently loaded in the store. */
  loadedCount: number;
}

/* ═══════════════════════════════════════════════════════════
   HOOK
   ═══════════════════════════════════════════════════════════ */

export function useIncrementalGraph<
  N extends FocusedNode = FocusedNode,
  E extends FocusedEdge = FocusedEdge,
>(
  /** Full backing dataset of nodes (simulates API; never passed to UI). */
  allNodes: N[],
  /** Full backing dataset of edges (simulates API; never passed to UI). */
  allEdges: E[],
  /** Initial focus node ID. */
  initialFocusId: string | null,
  options: IncrementalGraphOptions = {},
): IncrementalGraphResult<N, E> {
  /* ── Create or use provided store ── */
  const storeRef = useRef<GraphDataStore | null>(null);
  if (!storeRef.current) {
    storeRef.current = options.store ?? new GraphDataStore(
      allNodes as any[],
      allEdges as any[],
    );
  }
  const store = storeRef.current;

  /* ── Loading states ── */
  const [isLoading, setIsLoading] = useState(true);
  const [isExpanding, setIsExpanding] = useState(false);

  /* ── Snapshot of loaded data (triggers re-render when store changes) ── */
  const [snapshot, setSnapshot] = useState<GraphStoreSnapshot>(() => store.getSnapshot());

  /* ── Subscribe to store changes ── */
  useEffect(() => {
    const unsub = store.subscribe(() => {
      setSnapshot(store.getSnapshot());
    });
    return unsub;
  }, [store]);

  /* ── Initial load: focus node + first-degree neighborhood ── */
  useEffect(() => {
    if (!initialFocusId) {
      setIsLoading(false);
      return;
    }

    // Reset store for clean start
    store.reset();

    // Step 1: Load focus node only
    store.fetchNode(initialFocusId);
    setSnapshot(store.getSnapshot());

    // Step 2: Load first-degree relationships
    // Uses queueMicrotask to simulate async two-phase load.
    // In a real API this would be `await fetch(...)`.
    queueMicrotask(() => {
      store.fetchNeighborhood(initialFocusId);
      setSnapshot(store.getSnapshot());
      setIsLoading(false);
    });
  }, [initialFocusId, store]);

  /* ── Feed ONLY the loaded subset to the focused graph engine ── */
  const loadedNodes = snapshot.nodes as N[];
  const loadedEdges = snapshot.edges as E[];

  const focused = useFocusedGraph<N, E>(loadedNodes, loadedEdges, initialFocusId, {
    maxVisible: options.maxVisible ?? 30,
    getNodeType: options.getNodeType,
    getTypeLabel: options.getTypeLabel,
  });

  /* ── Incremental expand: fetch neighborhood, then expand in engine ── */
  const expandNodeIncremental = useCallback(
    (nodeId: string) => {
      // If neighborhood is already cached, just expand
      if (store.isNeighborhoodLoaded(nodeId)) {
        focused.expandNode(nodeId);
        return;
      }

      setIsExpanding(true);

      // Fetch neighborhood (simulated async)
      queueMicrotask(() => {
        store.fetchNeighborhood(nodeId);
        setSnapshot(store.getSnapshot());
        focused.expandNode(nodeId);
        setIsExpanding(false);
      });
    },
    [store, focused.expandNode],
  );

  /* ── Change focus: reset store and load new neighborhood ── */
  const setFocusIncremental = useCallback(
    (nodeId: string) => {
      setIsLoading(true);
      store.reset();

      // Load focus node
      store.fetchNode(nodeId);
      setSnapshot(store.getSnapshot());

      // Load neighborhood
      queueMicrotask(() => {
        store.fetchNeighborhood(nodeId);
        setSnapshot(store.getSnapshot());
        setIsLoading(false);
      });

      // Reset engine state
      focused.setFocus(nodeId);
    },
    [store, focused.setFocus],
  );

  /* ── Reset: clear store and reload initial focus ── */
  const resetIncremental = useCallback(() => {
    if (!initialFocusId) return;
    setIsLoading(true);
    store.reset();

    store.fetchNode(initialFocusId);
    setSnapshot(store.getSnapshot());

    queueMicrotask(() => {
      store.fetchNeighborhood(initialFocusId);
      setSnapshot(store.getSnapshot());
      setIsLoading(false);
    });

    focused.reset();
  }, [initialFocusId, store, focused.reset]);

  /* ── Incremental collapse: delegate to engine (no store change needed) ── */
  const collapseNodeIncremental = useCallback(
    (nodeId: string) => {
      focused.collapseNode(nodeId);
    },
    [focused.collapseNode],
  );

  /* ── Expand collapsed group: fetch neighborhoods for hidden nodes first ── */
  const expandCollapsedGroupIncremental = useCallback(
    (parentNodeId: string, type: string) => {
      // The group's hidden nodes may not have their neighborhoods loaded.
      // We don't need to load their neighborhoods — just ensure they're in the store.
      // They are already in the store because they were discovered when
      // the parent's neighborhood was fetched.
      focused.expandCollapsedGroup(parentNodeId, type);
    },
    [focused.expandCollapsedGroup],
  );

  return {
    // Spread all focused graph state
    visibleNodes: focused.visibleNodes,
    visibleEdges: focused.visibleEdges,
    collapsedGroups: focused.collapsedGroups,
    compressedPaths: focused.compressedPaths,
    focusNodeId: focused.focusNodeId,
    expandedIds: focused.expandedIds,
    totalUncappedCount: focused.totalUncappedCount,

    // Override actions with incremental versions
    setFocus: setFocusIncremental,
    expandNode: expandNodeIncremental,
    expandCollapsedGroup: expandCollapsedGroupIncremental,
    expandCompressedPath: focused.expandCompressedPath,
    collapseNode: collapseNodeIncremental,
    isExpanded: focused.isExpanded,
    reset: resetIncremental,

    // Incremental-specific extras
    isLoading,
    isExpanding,
    totalBackingCount: snapshot.totalNodeCount,
    loadedCount: snapshot.nodes.length,
  };
}
