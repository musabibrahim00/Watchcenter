/**
 * Response Labels — Maps AI intent types to human-readable context labels.
 */

const RESPONSE_CONTEXT_LABELS: Record<string, string> = {
  attention: "Priority findings",
  incident_timeline: "Investigation timeline",
  system_summary: "System overview",
  approval_queue: "Pending approvals",
  attack_paths: "Exposure analysis",
  analyst_reasoning: "Analyst reasoning",
  case_summary: "Case management",
  compliance_status: "Compliance posture",
  vulnerability_posture: "Vulnerability analysis",
  asset_exposure: "Asset intelligence",
  misconfiguration_status: "Configuration security",
  iam_exposure: "Identity & access",
  appsec_findings: "Application security",
  risk_summary: "Risk analysis",
  investigation_narrative: "Investigation narrative",
};

export function getResponseContextLabel(intent: string): string | null {
  return RESPONSE_CONTEXT_LABELS[intent] || null;
}
