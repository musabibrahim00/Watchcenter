/**
 * Graph Adapter — Workflows
 *
 * Provides a filtered view of the unified graph for the Workflows module.
 * Queries nodes where entity_type = Workflow | WorkflowRun.
 * Relationships: TRIGGERED_WORKFLOW, REQUIRES_APPROVAL, MITIGATED_BY.
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

const WORKFLOW_RELATIONSHIP_TYPES = [
  "TRIGGERED_WORKFLOW",
  "REQUIRES_APPROVAL",
  "MITIGATED_BY",
  "LINKED_TO_RUN",
] as const;

/* ═══════════════════════════════════════════════════════════
   QUERIES
   ═══════════════════════════════════════════════════════════ */

/** All workflow nodes in the graph. */
export function getWorkflowNodes(graph: SecurityGraph = SECURITY_GRAPH): GraphNode[] {
  return getNodesByType(graph, "Workflow");
}

/** All workflow run nodes in the graph. */
export function getWorkflowRunNodes(graph: SecurityGraph = SECURITY_GRAPH): GraphNode[] {
  return getNodesByType(graph, "WorkflowRun");
}

/** All workflow + run nodes combined. */
export function getAllWorkflowEntities(graph: SecurityGraph = SECURITY_GRAPH): GraphNode[] {
  return [...getWorkflowNodes(graph), ...getWorkflowRunNodes(graph)];
}

/** Single workflow or run by ID. */
export function getWorkflowNodeById(
  id: string,
  graph: SecurityGraph = SECURITY_GRAPH,
): GraphNode | undefined {
  const node = getNodeById(graph, id);
  if (
    node &&
    (node.entity_type === "Workflow" || node.entity_type === "WorkflowRun")
  ) {
    return node;
  }
  return undefined;
}

/** All edges relevant to the workflow module for a given workflow. */
export function getWorkflowRelationships(
  workflowId: string,
  graph: SecurityGraph = SECURITY_GRAPH,
): GraphEdge[] {
  return getEdgesForNode(graph, workflowId).filter((e) =>
    (WORKFLOW_RELATIONSHIP_TYPES as readonly string[]).includes(e.relationship_type),
  );
}

/**
 * Entities that triggered a workflow (cases, risks, etc.).
 * Follows incoming TRIGGERED_WORKFLOW edges.
 */
export function getWorkflowTriggers(
  workflowId: string,
  graph: SecurityGraph = SECURITY_GRAPH,
): GraphNode[] {
  const edges = getIncomingEdges(graph, workflowId).filter(
    (e) => e.relationship_type === "TRIGGERED_WORKFLOW",
  );
  return edges
    .map((e) => getNodeById(graph, e.from_id))
    .filter(Boolean) as GraphNode[];
}

/**
 * Approvals required by a workflow.
 * Follows outgoing REQUIRES_APPROVAL edges.
 */
export function getWorkflowApprovals(
  workflowId: string,
  graph: SecurityGraph = SECURITY_GRAPH,
): GraphNode[] {
  const edges = getOutgoingEdges(graph, workflowId).filter(
    (e) => e.relationship_type === "REQUIRES_APPROVAL",
  );
  return edges
    .map((e) => getNodeById(graph, e.to_id))
    .filter(Boolean) as GraphNode[];
}

/**
 * Entities mitigated by a workflow.
 * Follows incoming MITIGATED_BY edges (risk → workflow).
 */
export function getWorkflowMitigatedEntities(
  workflowId: string,
  graph: SecurityGraph = SECURITY_GRAPH,
): GraphNode[] {
  const edges = getIncomingEdges(graph, workflowId).filter(
    (e) => e.relationship_type === "MITIGATED_BY",
  );
  return edges
    .map((e) => getNodeById(graph, e.from_id))
    .filter(Boolean) as GraphNode[];
}

/**
 * Workflow runs linked to a workflow via LINKED_TO_RUN.
 */
export function getWorkflowRuns(
  workflowId: string,
  graph: SecurityGraph = SECURITY_GRAPH,
): GraphNode[] {
  const edges = getOutgoingEdges(graph, workflowId).filter(
    (e) => e.relationship_type === "LINKED_TO_RUN",
  );
  return edges
    .map((e) => getNodeById(graph, e.to_id))
    .filter(Boolean) as GraphNode[];
}

/**
 * The parent workflow for a given workflow run.
 */
export function getRunParentWorkflow(
  runId: string,
  graph: SecurityGraph = SECURITY_GRAPH,
): GraphNode | undefined {
  const edges = getIncomingEdges(graph, runId).filter(
    (e) => e.relationship_type === "LINKED_TO_RUN",
  );
  if (edges.length > 0) {
    return getNodeById(graph, edges[0].from_id);
  }
  return undefined;
}

/** Timeline events for a workflow entity. */
export function getWorkflowEvents(
  workflowId: string,
  graph: SecurityGraph = SECURITY_GRAPH,
) {
  return getEventsForEntity(graph, workflowId);
}

/** Summary statistics derived from graph data. */
export function getWorkflowGraphSummary(graph: SecurityGraph = SECURITY_GRAPH) {
  const workflows = getWorkflowNodes(graph);
  const runs = getWorkflowRunNodes(graph);
  const activeWorkflows = workflows.filter((w) => w.status === "active");
  const resolvedRuns = runs.filter((r) => r.status === "resolved");
  const activeRuns = runs.filter((r) => r.status === "active");

  // Count total approvals and triggers
  let totalApprovals = 0;
  let totalTriggers = 0;
  let totalMitigatedEntities = 0;
  for (const wf of workflows) {
    totalApprovals += getWorkflowApprovals(wf.id, graph).length;
    totalTriggers += getWorkflowTriggers(wf.id, graph).length;
    totalMitigatedEntities += getWorkflowMitigatedEntities(wf.id, graph).length;
  }

  return {
    totalWorkflows: workflows.length,
    totalRuns: runs.length,
    activeWorkflows: activeWorkflows.length,
    completedRuns: resolvedRuns.length,
    runningRuns: activeRuns.length,
    totalApprovals,
    totalTriggers,
    totalMitigatedEntities,
  };
}