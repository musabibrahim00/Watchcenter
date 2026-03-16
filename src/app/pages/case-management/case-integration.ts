/**
 * Case Integration with Watch Center and Attack Path Analysis
 * ============================================================
 * 
 * This module provides utilities to create security cases from:
 * 1. Watch Center AI recommendations
 * 2. Attack Path investigations (detail page header)
 * 3. Attack Path Insights panel (Blast Radius assets)
 * 
 * Auto-generates context-aware playbooks based on:
 * - Attack vector (IAM, network, S3, CloudTrail, etc.)
 * - Severity and priority levels
 * - Vulnerability/misconfiguration counts
 * - Network exposure types
 * 
 * Usage examples in INTEGRATION.md
 */

import type { Case, CaseOwner, CaseReport, Observation, Playbook } from "./case-data";
import { CASE_OWNERS, CASE_REPORTS } from "./case-data";

/**
 * AI Recommendation Context - for Watch Center AI integration
 */
export interface AIRecommendationContext {
  type: string;
  module: string;
  severity: string;
  title: string;
  description: string;
  supportingStats?: Array<{ label: string; value: string }>;
  actions?: string[];
}

/**
 * Attack Path Context - for Attack Path investigation integration
 */
export interface AttackPathContext {
  attackPathId: string;
  attackPathName: string;
  attackPathDescription: string;
  priority: "critical" | "high" | "medium" | "low";
  assetId?: string;
  assetName?: string;
  assetArn?: string;
  assetPrivateIp?: string;
  vulnerabilityCount?: number;
  misconfigurationCount?: number;
  vulnerabilityId?: string; // CVE or vulnerability identifier
  misconfigurationId?: string;
  riskSeverity?: "critical" | "high" | "medium" | "low";
  exposures?: string[];
  threatActor?: string;
  blastRadiusAssets?: number;
}

/**
 * Case creation result
 */
export interface CaseFromAI {
  caseData: Case;
  initialObservation: Observation;
  recommendedPlaybooks: Playbook[];
}

/**
 * Location state interface for case detail page
 */
export interface CaseDetailLocationState {
  fromAI?: boolean;
  fromAttackPath?: boolean;
  attackPathReturnPath?: string;
  initialTab?: "investigation" | "reporting";
  caseData?: Case;
  initialObservation?: Observation;
  recommendedPlaybooks?: Playbook[];
}

/**
 * Generate a new case ID
 */
function generateCaseId(): string {
  const num = 4200 + Math.floor(Math.random() * 100);
  return `CASE-${num}`;
}

/**
 * Map AI severity to Case severity
 */
function mapSeverity(aiSeverity: string): "Critical" | "High" | "Medium" | "Low" {
  const s = aiSeverity.toLowerCase();
  if (s === "critical") return "Critical";
  if (s === "high") return "High";
  if (s === "medium") return "Medium";
  return "Low";
}

/**
 * Determine case category based on AI module and title
 */
function determineCaseCategory(module: string, title: string): "Intrusion" | "Malware" | "Data Exfiltration" | "Unauthorized Access" | "Anomaly" | "Policy Violation" {
  const text = `${module} ${title}`.toLowerCase();
  
  if (text.includes("exfiltration") || text.includes("data transfer")) {
    return "Data Exfiltration";
  }
  if (text.includes("intrusion") || text.includes("breach")) {
    return "Intrusion";
  }
  if (text.includes("malware") || text.includes("ransomware")) {
    return "Malware";
  }
  if (text.includes("unauthorized") || text.includes("access")) {
    return "Unauthorized Access";
  }
  if (text.includes("policy") || text.includes("compliance")) {
    return "Policy Violation";
  }
  return "Anomaly";
}

/**
 * Extract affected assets from AI recommendation
 */
function extractAffectedAssets(recommendation: AIRecommendationContext): string[] {
  const assets: string[] = [];
  const desc = recommendation.description;
  
  if (desc.includes("production")) assets.push("Production Environment");
  if (desc.includes("database") || desc.includes("DB")) assets.push("Database Server");
  if (desc.includes("S3") || desc.includes("storage")) assets.push("Cloud Storage");
  if (desc.includes("EC2") || desc.includes("instance")) assets.push("Compute Instance");
  if (desc.includes("Lambda")) assets.push("Serverless Function");
  if (desc.includes("RDS")) assets.push("RDS Database");
  if (desc.includes("container")) assets.push("Container Workload");
  
  if (assets.length === 0) {
    assets.push("Cloud Infrastructure");
  }
  
  return assets;
}

/**
 * Generate playbooks based on AI recommendation
 */
function generatePlaybooks(caseId: string, recommendation: AIRecommendationContext): Playbook[] {
  const playbooks: Playbook[] = [];
  const severity = recommendation.severity.toLowerCase();
  const module = recommendation.module.toLowerCase();
  
  if (module.includes("exposure") || module.includes("threat") || module.includes("attack")) {
    playbooks.push({
      id: `playbook-${caseId}-1`,
      title: "Attack Path Containment",
      description: "Immediate containment procedures for verified attack paths to crown-jewel assets.",
      reason: "AI has confirmed a lateral movement path from public ingress to critical production systems.",
      action: "Isolate affected segments, block ingress points, validate segmentation controls, deploy compensating controls.",
    });
    
    playbooks.push({
      id: `playbook-${caseId}-2`,
      title: "Exposure Remediation",
      description: "Systematic remediation of security exposures identified in the attack path.",
      reason: "Multiple vulnerabilities and misconfigurations enable the attack chain.",
      action: "Patch vulnerabilities, correct misconfigurations, implement principle of least privilege, validate access controls.",
    });
  }
  
  if (module.includes("vulnerability") || recommendation.description.toLowerCase().includes("cve")) {
    playbooks.push({
      id: `playbook-${caseId}-3`,
      title: "Vulnerability Exploitation Response",
      description: "Procedures for investigating and responding to potential vulnerability exploitation attempts.",
      reason: "Detected exploitation attempt against known vulnerabilities in production systems.",
      action: "Isolate vulnerable systems, apply emergency patches, review exploit indicators, check for persistence mechanisms.",
    });
  }
  
  if (module.includes("risk") || severity === "critical") {
    playbooks.push({
      id: `playbook-${caseId}-4`,
      title: "Critical Risk Mitigation",
      description: "Prioritized risk mitigation workflow for critical security findings.",
      reason: "High-confidence critical risk requires immediate attention and mitigation.",
      action: "Assess business impact, implement temporary controls, develop mitigation plan, execute remediation with validation.",
    });
  }
  
  playbooks.push({
    id: `playbook-${caseId}-5`,
    title: "Forensic Investigation",
    description: "Standard digital forensics procedures for incident investigation and evidence collection.",
    reason: "Comprehensive investigation required to determine full scope and timeline.",
    action: "Preserve evidence, collect logs and artifacts, perform timeline analysis, document findings for potential escalation.",
  });
  
  return playbooks;
}

/**
 * Create a new case from AI recommendation
 */
export function createCaseFromAIRecommendation(
  recommendation: AIRecommendationContext,
  attackPathId?: string
): CaseFromAI {
  const caseId = generateCaseId();
  const now = new Date();
  const severity = mapSeverity(recommendation.severity);
  const category = determineCaseCategory(recommendation.module, recommendation.title);
  const owner = CASE_OWNERS[0];
  
  let enhancedDescription = recommendation.description;
  if (attackPathId) {
    enhancedDescription += `\n\nAttack Path Reference: ${attackPathId}`;
  }
  
  if (recommendation.supportingStats && recommendation.supportingStats.length > 0) {
    enhancedDescription += "\n\n";
    recommendation.supportingStats.forEach(stat => {
      enhancedDescription += `${stat.label}: ${stat.value}\n`;
    });
  }
  
  const caseData: Case = {
    id: caseId,
    title: recommendation.title,
    severity,
    category,
    source: "Watch Center AI",
    assignedTeam: severity === "Critical" || severity === "High" ? "Incident Response" : "SOC",
    owner,
    status: "Open",
    resolutionState: "Case Assigned",
    verdict: "Under Review",
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
    caseAge: "Just now",
    description: enhancedDescription,
  };
  
  const initialObservation: Observation = {
    id: `obs-${caseId}-1`,
    caseId,
    author: owner,
    title: "AI Insight from Watch Center",
    content: "Case created automatically from Watch Center AI recommendation. AI-identified security exposure requires immediate investigation and containment.",
    timestamp: now.toISOString(),
    quickActions: ["Disable User Account", "Escalate Case to Tier-2 Analyst", "Block Source IP", "Isolate Host"],
  };
  
  const recommendedPlaybooks = generatePlaybooks(caseId, recommendation);

  // Auto-generate case report
  const affectedAssets = extractAffectedAssets(recommendation);
  const report: CaseReport = {
    summary: `${recommendation.title}. ${recommendation.description}`,
    actors: "External actor or unknown attacker source",
    threatActor: "Under investigation — source identified via Watch Center AI",
    keyFindings: [
      recommendation.description,
      ...(recommendation.supportingStats || []).map(s => `${s.label}: ${s.value}`),
    ],
    actions: [
      "Containment initiated, case created, investigation assigned",
      "AI recommendation acknowledged and triage started",
      ...(recommendation.actions || []).map(a => `Recommended: ${a}`),
    ],
    assetsAffected: affectedAssets,
    attributesImpacted: ["Confidentiality", "Integrity", "Availability"],
  };
  CASE_REPORTS[caseId] = report;

  return {
    caseData,
    initialObservation,
    recommendedPlaybooks,
  };
}

/**
 * Utility to create a case and navigate to it
 * Handles all the case creation, data storage, and navigation in one call
 */
export async function createAndNavigateToCase(
  context: AttackPathContext,
  navigate: (path: string, options?: { state?: unknown }) => void,
  dataModule: typeof import("./case-data")
) {
  const { caseData, initialObservation, recommendedPlaybooks } = createCaseFromAttackPath(context);
  
  dataModule.addCase(caseData);
  dataModule.addObservation(caseData.id, initialObservation);
  dataModule.addPlaybooks(caseData.id, recommendedPlaybooks);
  
  navigate(`/case-management/${caseData.id}`, {
    state: {
      fromAI: true,
      initialTab: "investigation" as const,
      caseData,
      initialObservation,
      recommendedPlaybooks,
    },
  });
}

/**
 * Generate playbooks specific to attack path context
 */
function generateAttackPathPlaybooks(caseId: string, context: AttackPathContext): Playbook[] {
  const playbooks: Playbook[] = [];
  
  // IAM-related playbooks
  if (context.attackPathName.toLowerCase().includes("iam") || 
      context.attackPathName.toLowerCase().includes("credentials") ||
      context.attackPathName.toLowerCase().includes("admin")) {
    playbooks.push({
      id: `playbook-${caseId}-iam-1`,
      title: "Disable Compromised IAM User",
      description: "Immediate IAM credential revocation and access termination procedures.",
      reason: "Attack path indicates potential credential compromise or privilege escalation through IAM.",
      action: "Disable IAM user, revoke all active sessions, rotate access keys, review CloudTrail logs for unauthorized access, audit permission grants.",
    });
    
    playbooks.push({
      id: `playbook-${caseId}-iam-2`,
      title: "Enable MFA Enforcement",
      description: "Implement multi-factor authentication to prevent unauthorized access.",
      reason: "Lack of MFA enabled lateral movement through compromised credentials.",
      action: "Enable MFA for all IAM users, enforce MFA policy, audit MFA compliance, revoke non-MFA sessions.",
    });
  }
  
  // Network-related playbooks
  if (context.exposures && context.exposures.length > 0) {
    const hasPublicExposure = context.exposures.some(e => 
      e.toLowerCase().includes("internet") || 
      e.toLowerCase().includes("public") ||
      e.toLowerCase().includes("ssh") ||
      e.toLowerCase().includes("http")
    );
    
    if (hasPublicExposure) {
      playbooks.push({
        id: `playbook-${caseId}-network-1`,
        title: "Block Malicious IP Addresses",
        description: "Network segmentation and ingress filtering to block attack sources.",
        reason: "Attack path originates from internet-facing exposure points.",
        action: "Identify source IPs from CloudTrail/VPC Flow Logs, add to network ACL deny list, update security groups, enable AWS Shield if not active.",
      });
    }
  }
  
  // Logging and monitoring playbooks
  if (context.attackPathName.toLowerCase().includes("s3") ||
      context.attackPathName.toLowerCase().includes("cloudtrail") ||
      context.priority === "critical" || context.priority === "high") {
    playbooks.push({
      id: `playbook-${caseId}-logging-1`,
      title: "Enable CloudTrail Logging",
      description: "Comprehensive audit logging and monitoring activation.",
      reason: "Attack path traversal requires enhanced visibility and audit trail.",
      action: "Enable CloudTrail in all regions, configure S3 bucket logging, enable log file validation, set up CloudWatch alarms for suspicious activity.",
    });
  }
  
  // Vulnerability patching playbook
  if (context.vulnerabilityCount && context.vulnerabilityCount > 0) {
    playbooks.push({
      id: `playbook-${caseId}-vuln-1`,
      title: "Emergency Vulnerability Patching",
      description: "Immediate patching procedures for exploitable vulnerabilities in the attack path.",
      reason: `${context.vulnerabilityCount} known vulnerabilities enable attack progression.`,
      action: "Identify affected systems, apply emergency patches, validate patch deployment, scan for exploitation indicators, implement compensating controls if patching not immediately possible.",
    });
  }
  
  // Misconfiguration remediation playbook
  if (context.misconfigurationCount && context.misconfigurationCount > 0) {
    playbooks.push({
      id: `playbook-${caseId}-misconfig-1`,
      title: "Security Misconfiguration Remediation",
      description: "Systematic correction of security misconfigurations enabling attack path.",
      reason: `${context.misconfigurationCount} misconfigurations create exploitable security gaps.`,
      action: "Review AWS Config findings, correct excessive permissions, implement least privilege, validate security group rules, enable encryption at rest.",
    });
  }
  
  // Attack path containment (always include)
  playbooks.push({
    id: `playbook-${caseId}-containment`,
    title: "Attack Path Containment",
    description: "Immediate containment procedures to break the attack chain.",
    reason: `Verified attack path ${context.attackPathId} enables lateral movement to critical assets.`,
    action: "Isolate affected network segments, disable lateral movement pathways, implement micro-segmentation, deploy inline threat detection, validate network policies.",
  });
  
  // Blast radius analysis (if applicable)
  if (context.blastRadiusAssets && context.blastRadiusAssets > 0) {
    playbooks.push({
      id: `playbook-${caseId}-blast-radius`,
      title: "Blast Radius Impact Assessment",
      description: "Comprehensive assessment of potential impact across connected assets.",
      reason: `${context.blastRadiusAssets} assets within blast radius require immediate security review.`,
      action: "Enumerate all assets in blast radius, assess vulnerability/misconfiguration exposure, prioritize remediation by criticality, implement compensating controls.",
    });
  }
  
  // Forensic investigation (always include)
  playbooks.push({
    id: `playbook-${caseId}-forensics`,
    title: "Attack Path Forensic Analysis",
    description: "Detailed forensic investigation of attack path progression and exploitation.",
    reason: "Complete attack timeline and evidence collection required for remediation validation.",
    action: "Capture CloudTrail logs, analyze VPC flow logs, collect system snapshots, reconstruct attack timeline, identify persistence mechanisms, document evidence chain.",
  });
  
  return playbooks;
}

/**
 * Create a new case from Attack Path investigation
 */
export function createCaseFromAttackPath(context: AttackPathContext): CaseFromAI {
  const caseId = generateCaseId();
  const now = new Date();
  const severity = mapSeverity(context.priority);
  
  // Determine category based on attack path characteristics
  let category: "Intrusion" | "Malware" | "Data Exfiltration" | "Unauthorized Access" | "Anomaly" | "Policy Violation" = "Intrusion";
  const pathText = `${context.attackPathName} ${context.attackPathDescription}`.toLowerCase();
  
  if (pathText.includes("exfiltration") || pathText.includes("s3") || pathText.includes("data")) {
    category = "Data Exfiltration";
  } else if (pathText.includes("credentials") || pathText.includes("unauthorized") || pathText.includes("iam")) {
    category = "Unauthorized Access";
  } else if (pathText.includes("policy") || pathText.includes("compliance")) {
    category = "Policy Violation";
  }
  
  // Assign owner based on severity
  const owner = CASE_OWNERS[0]; // System (Automated System)
  
  // Build case title
  const caseTitle = `Attack Path Investigation: ${context.attackPathName}`;
  
  // Build enhanced description
  let description = `${context.attackPathDescription}\n\n`;
  description += `**Attack Path Reference:** ${context.attackPathId}\n`;
  description += `**Priority:** ${context.priority.toUpperCase()}\n\n`;
  
  if (context.assetId && context.assetName) {
    description += `**Affected Asset:**\n`;
    description += `- Name: ${context.assetName}\n`;
    description += `- Asset ID: ${context.assetId}\n`;
    if (context.assetArn) description += `- ARN: ${context.assetArn}\n`;
    if (context.assetPrivateIp) description += `- Private IP: ${context.assetPrivateIp}\n`;
    if (context.riskSeverity) description += `- Risk Severity: ${context.riskSeverity.toUpperCase()}\n`;
    description += `\n`;
  }
  
  if (context.vulnerabilityCount || context.misconfigurationCount) {
    description += `**Security Exposures:**\n`;
    if (context.vulnerabilityCount) description += `- Vulnerabilities: ${context.vulnerabilityCount}\n`;
    if (context.misconfigurationCount) description += `- Misconfigurations: ${context.misconfigurationCount}\n`;
    if (context.vulnerabilityId) description += `- Known CVE: ${context.vulnerabilityId}\n`;
    description += `\n`;
  }
  
  if (context.exposures && context.exposures.length > 0) {
    description += `**Network Exposures:**\n`;
    context.exposures.forEach(exp => {
      description += `- ${exp}\n`;
    });
    description += `\n`;
  }
  
  if (context.blastRadiusAssets) {
    description += `**Blast Radius:** ${context.blastRadiusAssets} assets potentially affected\n\n`;
  }
  
  if (context.threatActor) {
    description += `**Threat Actor:** ${context.threatActor}\n\n`;
  }
  
  description += `**Key Findings:**\n`;
  description += `- Verified lateral movement path from internet ingress to critical infrastructure\n`;
  if (context.vulnerabilityCount && context.vulnerabilityCount > 0) {
    description += `- ${context.vulnerabilityCount} exploitable vulnerabilities enable attack progression\n`;
  }
  if (context.misconfigurationCount && context.misconfigurationCount > 0) {
    description += `- ${context.misconfigurationCount} security misconfigurations weaken defense posture\n`;
  }
  if (context.exposures && context.exposures.length > 0) {
    description += `- Multiple network exposure points identified: ${context.exposures.join(", ")}\n`;
  }
  description += `- Immediate containment required to prevent further lateral movement\n`;
  
  // Create case
  const caseData: Case = {
    id: caseId,
    title: caseTitle,
    severity,
    category,
    source: "Attack Path Analysis",
    assignedTeam: "Incident Response",
    owner,
    status: "Open",
    resolutionState: "Case Assigned",
    verdict: "Under Review",
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
    caseAge: "Just now",
    description,
  };
  
  // Create initial observation
  let observationContent = `Case created automatically from Attack Path investigation (${context.attackPathId}). `;
  observationContent += `AI-verified attack path from internet to critical infrastructure requires immediate containment and remediation.`;
  
  if (context.assetName) {
    observationContent += `\n\nPrimary affected asset: ${context.assetName}`;
    if (context.vulnerabilityCount || context.misconfigurationCount) {
      observationContent += ` (${context.vulnerabilityCount || 0} vulnerabilities, ${context.misconfigurationCount || 0} misconfigurations)`;
    }
  }
  
  const initialObservation: Observation = {
    id: `obs-${caseId}-1`,
    caseId,
    author: owner,
    title: "AI Insight from Attack Path",
    content: observationContent,
    timestamp: now.toISOString(),
    quickActions: ["Disable User Account", "Escalate Case to Tier-2 Analyst", "Block Source IP", "Isolate Host", "Open Asset Detail"],
  };
  
  // Generate context-specific playbooks
  const recommendedPlaybooks = generateAttackPathPlaybooks(caseId, context);

  // Auto-generate case report from attack path context
  const assetsAffected: string[] = [];
  if (context.assetName) assetsAffected.push(context.assetName);
  if (context.blastRadiusAssets) assetsAffected.push(`${context.blastRadiusAssets} assets in blast radius`);
  if (context.exposures && context.exposures.length > 0) {
    assetsAffected.push(...context.exposures.map(e => `Exposure: ${e}`));
  }
  if (assetsAffected.length === 0) assetsAffected.push("Cloud Infrastructure");

  const keyFindings: string[] = [
    `Verified lateral movement path from internet ingress to critical infrastructure`,
  ];
  if (context.vulnerabilityCount && context.vulnerabilityCount > 0) {
    keyFindings.push(`${context.vulnerabilityCount} exploitable vulnerabilities enable attack progression`);
  }
  if (context.misconfigurationCount && context.misconfigurationCount > 0) {
    keyFindings.push(`${context.misconfigurationCount} security misconfigurations weaken defense posture`);
  }
  if (context.vulnerabilityId) {
    keyFindings.push(`Known CVE: ${context.vulnerabilityId}`);
  }
  if (context.exposures && context.exposures.length > 0) {
    keyFindings.push(`Network exposure points: ${context.exposures.join(", ")}`);
  }

  const report: CaseReport = {
    summary: `Critical attack path confirmed from internet-facing source to crown-jewel asset. ${context.attackPathDescription}`,
    actors: context.threatActor || "External actor or unknown attacker source",
    threatActor: context.threatActor || "Under investigation — attack path analysis in progress",
    keyFindings,
    actions: [
      "Containment initiated, case created, investigation assigned",
      "Attack path analysis completed and remediation plan generated",
      "Blast radius assessment conducted for impacted assets",
    ],
    assetsAffected,
    attributesImpacted: ["Confidentiality", "Integrity", "Availability"],
  };
  CASE_REPORTS[caseId] = report;

  return {
    caseData,
    initialObservation,
    recommendedPlaybooks,
  };
}