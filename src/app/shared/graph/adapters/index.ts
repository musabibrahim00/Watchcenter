/**
 * Graph Adapters — Barrel Export
 *
 * Per-module adapters that provide filtered views of the unified graph.
 * Each adapter queries the same SECURITY_GRAPH instance, ensuring all
 * modules share a single source of truth.
 *
 * Usage:
 *   import { getAssetNodes, getCaseNodes } from "@/app/shared/graph/adapters";
 */

/* ── Asset Register ── */
export {
  getAssetNodes,
  getAssetNodeById,
  getAssetRelationships,
  getAssetVulnerabilities,
  getAssetMisconfigurations,
  getConnectedAssets,
  getAssetEvents,
  getAssetGraphSummary,
} from "./asset-register";

/* ── Attack Paths ── */
export {
  getAttackPathNodes,
  getAttackPathById,
  getAttackPathRelationships,
  getAttackPathMembers,
  getAttackPathAccessors,
  getAttackPathConnectivity,
  getAttackPathEvents,
  getAttackPathGraphSummary,
} from "./attack-paths";

/* ── Risk Register ── */
export {
  getRiskNodes,
  getRiskNodeById,
  getRiskRelationships,
  getRiskContributors,
  getRiskMitigations,
  getRiskPolicyViolations,
  getRiskEvents,
  getRiskGraphSummary,
} from "./risk-register";

/* ── Case Management ── */
export {
  getCaseNodes,
  getCaseNodeById,
  getCaseRelationships,
  getCaseTriggers,
  getCaseLinkedRuns,
  getCaseApprovals,
  getCaseTriggeredWorkflows,
  getCaseEvents,
  getCaseGraphSummary,
} from "./case-management";

/* ── Workflows ── */
export {
  getWorkflowNodes,
  getWorkflowRunNodes,
  getAllWorkflowEntities,
  getWorkflowNodeById,
  getWorkflowRelationships,
  getWorkflowTriggers,
  getWorkflowApprovals,
  getWorkflowMitigatedEntities,
  getWorkflowRuns,
  getRunParentWorkflow,
  getWorkflowEvents,
  getWorkflowGraphSummary,
} from "./workflows";
