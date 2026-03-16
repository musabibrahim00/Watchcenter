/**
 * Security Graph Instance — The singleton graph object.
 *
 * Extracted into its own file to break the circular dependency between
 * graph/index.ts (which re-exports adapters) and the adapters themselves
 * (which need SECURITY_GRAPH).
 *
 * Import chain (no cycles):
 *   adapters/* → instance.ts → nodes/edges/events
 *   index.ts   → instance.ts → nodes/edges/events
 */

import type { SecurityGraph } from "./types";
import { SEED_NODES } from "./nodes";
import { SEED_EDGES } from "./edges";
import { SEED_EVENTS } from "./events";

/**
 * The default platform-wide security graph, assembled from seed data.
 * Modules should import this as their single source of truth.
 */
export const SECURITY_GRAPH: SecurityGraph = {
  nodes: SEED_NODES,
  edges: SEED_EDGES,
  events: SEED_EVENTS,
};
