/**
 * Graph Adapter — Case Management
 *
 * Provides a filtered view of the unified graph for the Case Management module.
 * Queries nodes where entity_type = Case.
 * Relationships: TRIGGERED_CASE, LINKED_TO_RUN, REQUIRES_APPROVAL.
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

const CASE_RELATIONSHIP_TYPES = [
  "TRIGGERED_CASE",
  "LINKED_TO_RUN",
  "REQUIRES_APPROVAL",
] as const;

/* ═══════════════════════════════════════════════════════════
   QUERIES
   ═══════════════════════════════════════════════════════════ */

/** All case nodes in the graph. */
export function getCaseNodes(graph: SecurityGraph = SECURITY_GRAPH): GraphNode[] {
  return getNodesByType(graph, "Case");
}

/** Single case by ID. */
export function getCaseNodeById(
  id: string,
  graph: SecurityGraph = SECURITY_GRAPH,
): GraphNode | undefined {
  const node = getNodeById(graph, id);
  return node?.entity_type === "Case" ? node : undefined;
}

/** All edges relevant to case management for a given case. */
export function getCaseRelationships(
  caseId: string,
  graph: SecurityGraph = SECURITY_GRAPH,
): GraphEdge[] {
  return getEdgesForNode(graph, caseId).filter((e) =>
    (CASE_RELATIONSHIP_TYPES as readonly string[]).includes(e.relationship_type),
  );
}

/**
 * Entities that TRIGGERED a case (risks, attack paths, etc.).
 * Follows incoming TRIGGERED_CASE edges.
 */
export function getCaseTriggers(
  caseId: string,
  graph: SecurityGraph = SECURITY_GRAPH,
): GraphNode[] {
  const edges = getIncomingEdges(graph, caseId).filter(
    (e) => e.relationship_type === "TRIGGERED_CASE",
  );
  return edges
    .map((e) => getNodeById(graph, e.from_id))
    .filter(Boolean) as GraphNode[];
}

/**
 * Workflow runs linked to a case via LINKED_TO_RUN.
 */
export function getCaseLinkedRuns(
  caseId: string,
  graph: SecurityGraph = SECURITY_GRAPH,
): GraphNode[] {
  const edges = getOutgoingEdges(graph, caseId).filter(
    (e) => e.relationship_type === "LINKED_TO_RUN",
  );
  return edges
    .map((e) => getNodeById(graph, e.to_id))
    .filter(Boolean) as GraphNode[];
}

/**
 * Approvals required by a case via REQUIRES_APPROVAL.
 */
export function getCaseApprovals(
  caseId: string,
  graph: SecurityGraph = SECURITY_GRAPH,
): GraphNode[] {
  const edges = getOutgoingEdges(graph, caseId).filter(
    (e) => e.relationship_type === "REQUIRES_APPROVAL",
  );
  return edges
    .map((e) => getNodeById(graph, e.to_id))
    .filter(Boolean) as GraphNode[];
}

/**
 * Workflows triggered by a case.
 * Follows outgoing TRIGGERED_WORKFLOW edges.
 */
export function getCaseTriggeredWorkflows(
  caseId: string,
  graph: SecurityGraph = SECURITY_GRAPH,
): GraphNode[] {
  const edges = getOutgoingEdges(graph, caseId).filter(
    (e) => e.relationship_type === "TRIGGERED_WORKFLOW",
  );
  return edges
    .map((e) => getNodeById(graph, e.to_id))
    .filter(Boolean) as GraphNode[];
}

/** Timeline events for a case. */
export function getCaseEvents(
  caseId: string,
  graph: SecurityGraph = SECURITY_GRAPH,
) {
  return getEventsForEntity(graph, caseId);
}

/** Summary statistics derived from graph data. */
export function getCaseGraphSummary(graph: SecurityGraph = SECURITY_GRAPH) {
  const cases = getCaseNodes(graph);
  const open = cases.filter((c) => c.status === "open");
  const inProgress = cases.filter((c) => c.status === "in_progress");
  const critical = cases.filter((c) => c.severity === "critical");

  // Count total linked runs and approvals
  let totalLinkedRuns = 0;
  let totalApprovals = 0;
  let totalTriggers = 0;
  for (const c of cases) {
    totalLinkedRuns += getCaseLinkedRuns(c.id, graph).length;
    totalApprovals += getCaseApprovals(c.id, graph).length;
    totalTriggers += getCaseTriggers(c.id, graph).length;
  }

  return {
    total: cases.length,
    open: open.length,
    inProgress: inProgress.length,
    critical: critical.length,
    totalLinkedRuns,
    totalApprovals,
    totalTriggers,
  };
}