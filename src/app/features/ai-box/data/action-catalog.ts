/**
 * AI Box — Predefined action catalog and matcher.
 *
 * Pure data: no React, no state, no side-effects.
 * ACTION_CATALOG is a static registry of recognized action patterns.
 */

import type { ActionTemplate, ActionCardData } from "../types";

const _actionId = () => crypto.randomUUID();

export const ACTION_CATALOG: ActionTemplate[] = [
  {
    match: /re-?run\s+(analysis|assessment)/i,
    build: (_q, agent) => ({
      id: _actionId(), title: "Re-run Analysis", scope: "agent",
      guardrailLevel: "L2",
      confidence: "high" as const,
      why: `${agent || "This analyst"} has stale findings — the last cycle ran over 6 days ago and new threat indicators have emerged since.`,
      evidence: [
        "Last analysis cycle: 6 days ago",
        "5 new threat indicators since last run",
        "2 linked findings may be out of date",
      ],
      riskSummary: "This will refresh findings and risk scores. Downstream cases and alerts may update.",
      parameters: [
        { label: "Target", value: agent || "All monitored assets" },
        { label: "Scope", value: "Full analysis cycle" },
        { label: "Priority", value: "Normal", editable: true },
      ],
      expectedOutcome: "Fresh analysis cycle across all data sources. Findings and risk scores will be updated upon completion.",
      status: "pending",
    }),
  },
  {
    match: /re-?classify\s+(asset|endpoint|resource)/i,
    build: (q) => {
      const assetMatch = q.match(/re-?classify\s+(?:asset|endpoint|resource)\s+(.+)/i);
      const asset = assetMatch?.[1]?.trim() || "this asset";
      return {
        id: _actionId(), title: "Re-classify Asset", scope: "asset",
        guardrailLevel: "L2",
        confidence: "moderate" as const,
        why: `${asset} has new deployment indicators suggesting it is now a production-facing service. Current classification may understate its risk exposure.`,
        evidence: [
          "New ownership record detected in CMDB",
          "Deployment intent changed since last classification",
          "Asset appears on 1 active attack path",
        ],
        riskSummary: "This will update asset classification and downstream risk mappings.",
        parameters: [
          { label: "Asset", value: asset },
          { label: "Classification", value: "Auto-detect", editable: true },
          { label: "Update CMDB", value: "Yes" },
        ],
        expectedOutcome: "Asset classification and metadata will be updated. Downstream risk scores and compliance mappings will recalculate automatically.",
        status: "pending",
      };
    },
  },
  {
    match: /recalculate\s+(risk|score|posture)/i,
    build: (_q, agent) => ({
      id: _actionId(), title: "Recalculate Risk Score", scope: "risk",
      guardrailLevel: "L2",
      confidence: "high" as const,
      why: "Risk inputs have changed since the last calculation — new vulnerabilities were validated and the attack surface expanded.",
      evidence: [
        "3 new CVEs validated since last risk calculation",
        "Attack surface expanded by 2 newly discovered assets",
        "Threat actor activity increased in the last 48 hours",
      ],
      riskSummary: "This will update composite risk scores. Downstream case priorities may change.",
      parameters: [
        { label: "Scope", value: agent || "Organization-wide" },
        { label: "Include threat intel", value: "Yes" },
        { label: "Recalc dependencies", value: "Yes", editable: true },
      ],
      expectedOutcome: "Composite risk scores will be recalculated using latest vulnerability, exposure, and threat intelligence data.",
      status: "pending",
    }),
  },
  {
    match: /simulate\s+(impact|blast|breach|attack)/i,
    build: (q) => {
      const typeMatch = q.match(/simulate\s+(impact|blast|breach|attack)/i);
      return {
        id: _actionId(), title: `Simulate ${(typeMatch?.[1] || "Impact").charAt(0).toUpperCase() + (typeMatch?.[1] || "impact").slice(1)}`, scope: "investigation",
        guardrailLevel: "L2",
        confidence: "moderate" as const,
        why: "A confirmed attack path exists. Simulating impact helps quantify blast radius and prioritize containment before exploitation occurs.",
        evidence: [
          "Active attack path reaches critical assets in 3 hops",
          "Entry point is internet-facing",
          "No containment action taken yet",
        ],
        riskSummary: "Read-only simulation. No live data will be changed.",
        parameters: [
          { label: "Scenario", value: "Current threat context" },
          { label: "Entry point", value: "Auto-detect from findings", editable: true },
          { label: "Max hops", value: "5", editable: true },
        ],
        expectedOutcome: "Blast radius simulation showing affected assets, lateral movement paths, and estimated business impact score.",
        status: "pending",
      };
    },
  },
  {
    match: /re-?run\s+investigation\b(?!\s+(across|for\s+all|with\s+all))/i,
    build: (_q, agent) => ({
      id: _actionId(), title: "Re-run Investigation", scope: "investigation",
      guardrailLevel: "L2",
      confidence: "high" as const,
      why: "New signals have been collected since the last run. Re-running will correlate the latest events against existing findings and may surface hidden connections.",
      evidence: [
        "New events detected since last investigation run",
        "Linked asset state has changed",
        "Current findings may not reflect the latest threat context",
      ],
      riskSummary: "This will refresh investigation data and update linked findings.",
      parameters: [
        { label: "Analyst", value: agent || "All contributing analysts" },
        { label: "Scope", value: "Full investigation chain" },
        { label: "Include resolved", value: "No", editable: true },
      ],
      expectedOutcome: "Investigation chain will be re-executed with latest data. New correlations and findings will be surfaced.",
      status: "pending",
    }),
  },
  {
    match: /trigger\s+(scan|remediation|workflow|playbook)/i,
    build: (q) => {
      const typeMatch = q.match(/trigger\s+(scan|remediation|workflow|playbook)/i);
      const isHighImpact = /remediation|playbook/i.test(q);
      const typeName = (typeMatch?.[1] || "scan").charAt(0).toUpperCase() + (typeMatch?.[1] || "scan").slice(1);
      return {
        id: _actionId(), title: `Trigger ${typeName}`, scope: "workflow",
        guardrailLevel: isHighImpact ? "L3" : "L2",
        requiresApproval: isHighImpact,
        confidence: isHighImpact ? "high" as const : "moderate" as const,
        why: isHighImpact
          ? `A ${typeName.toLowerCase()} is recommended because open findings meet the threshold for automated remediation.`
          : `A ${typeName.toLowerCase()} is recommended to validate current asset state against known threat signatures.`,
        evidence: isHighImpact
          ? [
              "Open findings have exceeded remediation SLA",
              "Playbook is pre-validated for this asset class",
              "No conflicting changes are in-flight",
            ]
          : [
              "Last scan result is older than 24 hours",
              "New vulnerability signatures available since last run",
              "Asset inventory has changed since last scan",
            ],
        riskSummary: isHighImpact
          ? "This triggers live system actions. Results may affect active cases and infrastructure."
          : "This will initiate a scan. No live configuration will be changed.",
        parameters: [
          { label: "Type", value: typeName },
          { label: "Target", value: "Current scope" },
          { label: "Notify on complete", value: "Yes", editable: true },
        ],
        expectedOutcome: "Action will be queued and executed. Results will appear in the activity feed upon completion.",
        status: "pending",
      };
    },
  },
  {
    match: /create\s+(case|ticket|incident)/i,
    build: (q) => {
      const typeMatch = q.match(/create\s+(case|ticket|incident)/i);
      const typeName = (typeMatch?.[1] || "case").charAt(0).toUpperCase() + (typeMatch?.[1] || "case").slice(1);
      return {
        id: _actionId(), title: `Create ${typeName}`, scope: "investigation",
        guardrailLevel: "L2",
        confidence: "high" as const,
        why: `Creating a ${typeName.toLowerCase()} is recommended to formally track and assign ownership of the current findings, ensuring they are not missed in triage.`,
        evidence: [
          "Current findings have no active investigation tracking",
          "Severity and asset context meet case creation criteria",
          "Linked events span multiple analysts — centralized tracking recommended",
        ],
        riskSummary: "A new investigation case will be created and assigned.",
        parameters: [
          { label: "Type", value: typeName },
          { label: "Priority", value: "Auto-detect", editable: true },
          { label: "Assign to", value: "SOC Tier 1", editable: true },
        ],
        expectedOutcome: "New investigation case created with current findings linked. Assigned analyst will be notified.",
        status: "pending",
      };
    },
  },
  {
    match: /run\s+(compliance\s+check|vulnerability\s+scan|posture\s+scan)/i,
    build: (q) => {
      const typeMatch = q.match(/run\s+(compliance\s+check|vulnerability\s+scan|posture\s+scan)/i);
      const type = typeMatch?.[1] || "scan";
      const typeName = type.charAt(0).toUpperCase() + type.slice(1);
      return {
        id: _actionId(), title: `Run ${typeName}`, scope: "workflow",
        guardrailLevel: "L2",
        confidence: "moderate" as const,
        why: `Running a ${type} will provide current posture data. This is recommended because the last scan result is stale or gaps have been identified.`,
        evidence: [
          "Last scan completed more than 24 hours ago",
          "Open compliance gaps require verification",
          "Asset changes have not been reflected in current posture score",
        ],
        riskSummary: "This will scan all monitored assets and generate a compliance report.",
        parameters: [
          { label: "Type", value: typeName },
          { label: "Scope", value: "All monitored assets" },
          { label: "Report", value: "Generate on completion", editable: true },
        ],
        expectedOutcome: "Scan will execute across all monitored assets. Results and any new findings will be available in the activity feed.",
        status: "pending",
      };
    },
  },
  {
    match: /block\s+(ip|endpoint|user|account)|disable\s+(account|user|token|key)|quarantine|isolate\s+(host|endpoint|machine|asset)/i,
    build: (q) => {
      const isBlock = /block/i.test(q);
      const isDisable = /disable/i.test(q);
      const isQuarantine = /quarantine/i.test(q);
      const title = isBlock ? "Block Access" : isDisable ? "Disable Account" : isQuarantine ? "Quarantine Asset" : "Isolate Asset";
      return {
        id: _actionId(), title, scope: "asset",
        guardrailLevel: "L3",
        requiresApproval: true,
        confidence: "high" as const,
        why: "Active indicators suggest this resource is compromised or poses an immediate lateral movement risk.",
        evidence: [
          "Anomalous access pattern detected in the last 2 hours",
          "Resource appears on a confirmed attack path",
          "No legitimate business activity justifies current behavior",
        ],
        riskSummary: "This action changes live system access. It may disrupt active users or services and requires approval.",
        approvalContext: {
          whyRequired: "Approval is required because this action restricts live system access and may interrupt active users or services.",
          whatIsBlocked: "Execution is paused until a manager or administrator approves this request.",
          approveEffect: "Access will be restricted immediately and affected users notified per policy.",
          rejectEffect: "The target remains accessible. No changes will be made.",
        },
        parameters: [
          { label: "Target", value: "Current selection", editable: true },
          { label: "Duration", value: "Indefinite", editable: true },
          { label: "Notify affected users", value: "Yes" },
        ],
        expectedOutcome: "Access will be restricted immediately. Affected users and systems will be notified per policy.",
        status: "pending",
      };
    },
  },
  {
    match: /rotate\s+(credentials?|tokens?|keys?|secrets?)/i,
    build: () => ({
      id: _actionId(), title: "Rotate Credentials", scope: "asset",
      guardrailLevel: "L3",
      requiresApproval: true,
      confidence: "high" as const,
      why: "Credentials have not been rotated in 180+ days and are flagged as over-privileged, creating a lateral movement risk.",
      evidence: [
        "Last rotation: 180+ days ago",
        "Admin-scoped credentials with no usage justification",
        "Linked to a billing service with external access",
      ],
      riskSummary: "This will invalidate active credentials. Affected systems may require re-authentication.",
      approvalContext: {
        whyRequired: "Approval is required because rotating credentials will invalidate all active sessions using the old keys.",
        whatIsBlocked: "Credential rotation is paused until this request is approved.",
        approveEffect: "All credentials will be rotated and active sessions invalidated. Service owners will be notified.",
        rejectEffect: "Credentials remain active. The over-privilege risk persists.",
      },
      parameters: [
        { label: "Scope", value: "Selected credentials", editable: true },
        { label: "Notify owners", value: "Yes" },
        { label: "Force re-auth", value: "Yes", editable: true },
      ],
      expectedOutcome: "Credentials will be rotated. All active sessions using the old credentials will be invalidated.",
      status: "pending",
    }),
  },
  /* ── Multi-agent orchestration actions ── */
  {
    match: /reinvestigate|re-?run\s+investigation\s+(across|for\s+all|with\s+all)/i,
    build: (_q, _agent) => ({
      id: _actionId(), title: "Re-run Investigation", scope: "investigation",
      guardrailLevel: "L2",
      confidence: "high" as const,
      why: "A full multi-analyst re-run is recommended because findings from multiple sources have not been correlated against the latest event data.",
      evidence: [
        "Analyst findings are from different time windows — correlating them may reveal new attack paths",
        "Asset and vulnerability state has changed since last full run",
        "No resolved findings are included — risk of missing new connections is low",
      ],
      riskSummary: "This will refresh investigation data across all contributing analysts. Findings and linked cases will update.",
      parameters: [
        { label: "Scope", value: "Full investigation chain", editable: true },
        { label: "Include resolved", value: "No", editable: true },
        { label: "Data freshness", value: "Latest only" },
      ],
      expectedOutcome: "Investigation chain re-executed across all contributing analysts. New correlations and updated findings will be surfaced.",
      participatingAnalysts: ["Asset Intelligence Analyst", "Vulnerability Analyst", "Exposure Analyst", "Risk Intelligence Analyst"],
      status: "pending",
    }),
  },
  {
    match: /recalculate\s+risk\s+using|reassess.*risk/i,
    build: (_q, agent) => ({
      id: _actionId(), title: "Recalculate Risk", scope: "risk",
      guardrailLevel: "L2",
      confidence: "high" as const,
      why: "Risk scores are based on inputs that have changed — recalculating will give you an accurate current picture before making decisions.",
      evidence: [
        "Asset inventory or classification has changed since last risk run",
        "New vulnerabilities have been published for assets in scope",
        "Exposure analyst has flagged additional internet-reachable assets",
      ],
      riskSummary: "This will update composite risk scores using multi-analyst inputs. Downstream case priorities may change.",
      parameters: [
        { label: "Scope", value: agent || "Current context", editable: true },
        { label: "Include threat intel", value: "Yes" },
        { label: "Recalc dependencies", value: "Yes", editable: true },
      ],
      expectedOutcome: "Composite risk score recalculated across asset, vulnerability, and exposure inputs. Downstream posture and case priorities will reflect updated values.",
      participatingAnalysts: ["Asset Intelligence Analyst", "Vulnerability Analyst", "Exposure Analyst", "Risk Intelligence Analyst"],
      status: "pending",
    }),
  },
  {
    match: /simulate\s+(cross.?agent|impact\s+if)/i,
    build: (q) => {
      const isInternetFacing = /internet.?facing/i.test(q);
      return {
        id: _actionId(), title: "Simulate Cross-Agent Impact", scope: "investigation",
        guardrailLevel: "L2",
        confidence: "moderate" as const,
        why: "This simulation maps how an attacker could move through your environment based on current findings — helping you prioritize where to act first.",
        evidence: [
          "Internet-facing assets with unpatched vulnerabilities are present in scope",
          "Internal network segmentation gaps have been identified",
          "Simulation uses read-only data — no live systems will be changed",
        ],
        riskSummary: "Read-only simulation across analysts. No live data will be changed.",
        parameters: [
          { label: "Scenario", value: isInternetFacing ? "Internet-facing exposure" : "Current threat context", editable: true },
          { label: "Entry point", value: "Auto-detect from findings", editable: true },
          { label: "Max hops", value: "5", editable: true },
          { label: "Scope", value: "Production assets", editable: true },
        ],
        expectedOutcome: "Blast radius simulation across all relevant analysts. Affected assets, lateral movement paths, and business impact score will be estimated.",
        participatingAnalysts: ["Exposure Analyst", "Asset Intelligence Analyst", "Risk Intelligence Analyst"],
        status: "pending",
      };
    },
  },
  /* ── Approval / Rejection actions ── */
  {
    match: /approve\s+(workflow\s+publish|publish\s+workflow|and\s+publish)/i,
    build: (_q, agent) => ({
      id: _actionId(), title: "Approve & Publish Workflow", scope: "workflow",
      guardrailLevel: "L3",
      requiresApproval: true,
      riskSummary: "Publishing this workflow makes it active. It will begin processing live alerts immediately.",
      parameters: [
        { label: "Workflow", value: agent || "Critical Alert Auto-Response", editable: true },
        { label: "Effective", value: "Immediately on approval" },
        { label: "Notify team", value: "Yes", editable: true },
      ],
      expectedOutcome: "Workflow will be published and activated. Active alert processing will resume with the updated logic.",
      status: "pending",
    }),
  },
  {
    match: /approve\s+(block\s+ip|ip\s+block)/i,
    build: (_q) => ({
      id: _actionId(), title: "Approve Block IP Address", scope: "asset",
      guardrailLevel: "L3",
      requiresApproval: true,
      riskSummary: "Blocking this IP address restricts access at the firewall level. This may affect legitimate traffic if the target is shared.",
      parameters: [
        { label: "Target IP", value: "Compromised staging host (finance-db-01 path)", editable: true },
        { label: "Duration", value: "Indefinite", editable: true },
        { label: "Notify firewall team", value: "Yes" },
      ],
      expectedOutcome: "IP blocked at firewall level. The lateral movement path to finance-db-01 will be severed. Affected services will be notified.",
      status: "pending",
    }),
  },
  {
    match: /approve\s+(this|action|remediation|rotation|credentials?)/i,
    build: (_q, agent) => ({
      id: _actionId(), title: "Approve Action", scope: "investigation",
      guardrailLevel: "L3",
      requiresApproval: true,
      riskSummary: "This approval authorizes execution of the pending action. Review parameters before confirming.",
      parameters: [
        { label: "Target", value: agent || "Pending action", editable: true },
        { label: "Approved by", value: "Current user" },
        { label: "Notify submitter", value: "Yes" },
      ],
      expectedOutcome: "Action will be released from the approval queue and executed. Audit trail will record this approval decision.",
      status: "pending",
    }),
  },

  /* ── Rejection actions ── */
  {
    match: /reject\s+(this|workflow|action|remediation|publish)/i,
    build: (_q, agent) => ({
      id: _actionId(), title: "Reject Action", scope: "investigation",
      guardrailLevel: "L2",
      riskSummary: "Rejecting this action returns it to the submitter with a decline record. It will not be executed.",
      parameters: [
        { label: "Target", value: agent || "Pending action", editable: true },
        { label: "Reason", value: "Requires further review", editable: true },
        { label: "Notify submitter", value: "Yes" },
      ],
      expectedOutcome: "Action rejected and removed from the approval queue. The submitter will be notified. A new submission is required to re-attempt.",
      status: "pending",
    }),
  },

  /* ── Delegation actions ── */
  {
    match: /delegate\s+(this|review|workflow|issue|compliance|investigation|task|attack\s+path)/i,
    build: (q) => {
      const targetMatch = q.match(/delegate\s+(?:this\s+)?(?:to\s+)?(.+)/i);
      const isCompliance = /compliance/i.test(q);
      const isWorkflow = /workflow/i.test(q);
      const isAttack = /attack/i.test(q);
      const suggestedAssignee = isCompliance ? "Compliance Owner"
        : isWorkflow ? "SOC Lead"
        : isAttack ? "Exposure Analyst"
        : "SOC Lead";
      return {
        id: _actionId(), title: "Delegate Task", scope: "investigation",
        guardrailLevel: "L2",
        riskSummary: "Delegating transfers ownership and accountability. The item will appear in the assignee's queue.",
        parameters: [
          { label: "Task", value: targetMatch?.[1]?.trim() || "Current item", editable: true },
          { label: "Assign to", value: suggestedAssignee, editable: true },
          { label: "Due date", value: "48 hours", editable: true },
          { label: "Notify assignee", value: "Yes" },
        ],
        expectedOutcome: "Task delegated and assignee notified. Item will appear in their queue with a due date. You retain visibility via the audit trail.",
        status: "pending",
      };
    },
  },
  {
    match: /assign\s+(this|issue|task|investigation)\s+to\s+(.+)/i,
    build: (q) => {
      const assigneeMatch = q.match(/assign\s+(?:this\s+)?(?:issue\s+|task\s+|investigation\s+)?to\s+(.+)/i);
      return {
        id: _actionId(), title: "Assign to Team Member", scope: "investigation",
        guardrailLevel: "L2",
        riskSummary: "This will transfer the item to the specified team member. Ownership and accountability transfer with it.",
        parameters: [
          { label: "Assign to", value: assigneeMatch?.[1]?.trim() || "SOC Lead", editable: true },
          { label: "Priority", value: "High", editable: true },
          { label: "Notify assignee", value: "Yes" },
          { label: "SLA", value: "24 hours", editable: true },
        ],
        expectedOutcome: "Item assigned. The assignee receives a notification with full context. You retain read access and audit visibility.",
        status: "pending",
      };
    },
  },

  {
    match: /reassess\s+(findings|this|issue|exposure)/i,
    build: (_q, agent) => ({
      id: _actionId(), title: "Reassess Findings", scope: "investigation",
      guardrailLevel: "L2",
      confidence: "moderate" as const,
      why: "Current findings may be mis-classified or stale. A reassessment will apply the latest policies and analyst context to ensure risk ratings are accurate.",
      evidence: [
        "Finding classifications have not been reviewed since last policy update",
        "Asset ownership or criticality may have changed since initial triage",
        "Compliance posture depends on accurate finding classifications",
      ],
      riskSummary: "This will update finding classifications and associated risk ratings.",
      parameters: [
        { label: "Analyst context", value: agent || "All contributing analysts", editable: true },
        { label: "Include historical", value: "No", editable: true },
        { label: "Policy check", value: "Yes" },
      ],
      expectedOutcome: "Findings reassessed against current state. Updated classifications, risk ratings, and compliance impact will be reflected across all linked records.",
      participatingAnalysts: ["Asset Intelligence Analyst", "Vulnerability Analyst", "Exposure Analyst", "Governance & Compliance Analyst"],
      status: "pending",
    }),
  },

  /* ── What-if / Simulation actions (Attack Path investigation) ─── */

  // simulate patch
  {
    match: /simulate\s+(patch|patching)|what\s+if\s+.*patch|patch.*vulnerab.*simulat/i,
    build: (q, _agent) => {
      const nodeMatch = q.match(/["']([^"']+)["']|on\s+(\w[\w\s.-]+)|at\s+(\w[\w\s.-]+)/i);
      const node = nodeMatch ? (nodeMatch[1] || nodeMatch[2] || nodeMatch[3] || "the selected node").trim() : "the selected node";
      return {
        id: _actionId(), title: `Simulate Patch: ${node}`, scope: "attack-path-simulation",
        guardrailLevel: "L1" as const, confidence: "high" as const,
        why: "Patching removes the exploit vulnerability at this hop, potentially breaking the attack chain. This simulation computes the hypothetical blast-radius change without making any live system changes.",
        evidence: [
          "Selected node has an active exploit vulnerability in the current attack chain",
          "Patch at this step eliminates the technique used for lateral movement",
          "Simulation is purely hypothetical — no live changes will be made",
        ],
        riskSummary: "Simulation only. No real patch applied. Results show hypothetical blast-radius and path-status changes.",
        parameters: [
          { label: "Target node", value: node, editable: true },
          { label: "Simulation type", value: "Patch Vulnerability" },
          { label: "Live change", value: "No — hypothetical only" },
        ],
        expectedOutcome: "Hypothetical blast radius computed. Attack path status (broken / reduced / rerouted) shown with before/after comparison. Alternative paths surfaced if applicable.",
        participatingAnalysts: ["Vulnerability Analyst", "Exposure Analyst", "Attack Path Analyst"],
        status: "pending" as const,
        analystContributions: {
          "Vulnerability Analyst": "Confirms whether the patch closes this specific exploit step",
          "Exposure Analyst": "Recomputes reachable assets and crown jewel exposure post-patch",
          "Attack Path Analyst": "Evaluates alternative lateral paths that remain after patching",
        },
      };
    },
  },

  // simulate isolation
  {
    match: /simulate\s+(isolat)|what\s+if\s+.*isolat|isolat.*simulat/i,
    build: (q, _agent) => {
      const nodeMatch = q.match(/["']([^"']+)["']|isolat(?:e|ing)\s+([\w.-]+)/i);
      const node = nodeMatch ? (nodeMatch[1] || nodeMatch[2] || "the compromised workload").trim() : "the compromised workload";
      return {
        id: _actionId(), title: `Simulate Isolation: ${node}`, scope: "attack-path-simulation",
        guardrailLevel: "L1" as const, confidence: "high" as const,
        why: "Isolating the workload cuts its network access, preventing further lateral movement. This simulation shows how blast radius changes and whether alternative paths remain.",
        evidence: [
          "Workload isolation blocks all outbound and inbound network connections",
          "Crown jewel access through this node would be severed",
          "Simulation is purely hypothetical — no live changes will be made",
        ],
        riskSummary: "Hypothetical simulation only. The workload is not actually isolated.",
        parameters: [
          { label: "Target node", value: node, editable: true },
          { label: "Simulation type", value: "Isolate Workload" },
          { label: "Live change", value: "No — hypothetical only" },
        ],
        expectedOutcome: "Blast radius collapse shown. Remaining identity-based or alternative paths surfaced. Path status updated.",
        participatingAnalysts: ["Exposure Analyst", "Attack Path Analyst"],
        status: "pending" as const,
      };
    },
  },

  // simulate credential revocation
  {
    match: /simulate\s+(revok|cred.*revoc)|what\s+if\s+.*revok.*cred|revok.*cred.*simulat/i,
    build: (q, _agent) => {
      const credMatch = q.match(/["']([^"']+)["']|revok.*\s+([\w.-]+\s+cred[\w]*|[\w.-]+\s+key|[\w.-]+\s+token)/i);
      const cred = credMatch ? (credMatch[1] || credMatch[2] || "the exposed credential").trim() : "the exposed credential";
      return {
        id: _actionId(), title: `Simulate Credential Revocation: ${cred}`, scope: "attack-path-simulation",
        guardrailLevel: "L1" as const, confidence: "high" as const,
        why: "Revoking the compromised credential eliminates the attacker's authentication mechanism, collapsing lateral movement paths that depend on that identity.",
        evidence: [
          "Attack chain uses a compromised credential for lateral movement",
          "Credential revocation invalidates all active sessions using this identity",
          "Simulation is purely hypothetical — no credentials are actually revoked",
        ],
        riskSummary: "Hypothetical simulation only. No credentials are actually revoked.",
        parameters: [
          { label: "Credential", value: cred, editable: true },
          { label: "Simulation type", value: "Revoke Credentials" },
          { label: "Live change", value: "No — hypothetical only" },
        ],
        expectedOutcome: "Attack path collapses if credential is required for the exploit step. Alternative access paths surfaced.",
        participatingAnalysts: ["Identity Analyst", "Attack Path Analyst"],
        status: "pending" as const,
      };
    },
  },

  // simulate close exposure
  {
    match: /simulate\s+(clos.*exposure|remov.*public|clos.*port)|what\s+if\s+.*clos.*(?:exposure|port|access)/i,
    build: (q, _agent) => {
      const expMatch = q.match(/["']([^"']+)["']|clos.*\s+(port\s*\d+|[\w.-]+\s+exposure)/i);
      const exposure = expMatch ? (expMatch[1] || expMatch[2] || "the public-facing exposure").trim() : "the public-facing exposure";
      return {
        id: _actionId(), title: `Simulate Close Exposure: ${exposure}`, scope: "attack-path-simulation",
        guardrailLevel: "L1" as const, confidence: "high" as const,
        why: "Closing the public-facing exposure removes the attacker's entry point, which would break this attack path at its origin and collapse blast radius to zero.",
        evidence: [
          "Attack chain entry point is an internet-facing service or open port",
          "Removing public access eliminates the initial foothold entirely",
          "Simulation is purely hypothetical — no firewall or security group changes are made",
        ],
        riskSummary: "Hypothetical simulation. No actual changes to security groups or network ACLs.",
        parameters: [
          { label: "Exposure", value: exposure, editable: true },
          { label: "Simulation type", value: "Close Exposure" },
          { label: "Live change", value: "No — hypothetical only" },
        ],
        expectedOutcome: "Attack path fully broken. Blast radius drops to 0. Alternative entry paths surfaced if applicable.",
        participatingAnalysts: ["Network Security Analyst", "Exposure Analyst"],
        status: "pending" as const,
      };
    },
  },

  // simulate block lateral movement
  {
    match: /simulate\s+(block\s+lateral|blocking\s+lateral)|what\s+if\s+.*block.*lateral|lateral\s+movement.*simulat/i,
    build: (q, _agent) => {
      const nodeMatch = q.match(/["']([^"']+)["']|at\s+([\w.-]+)|on\s+([\w.-]+)/i);
      const node = nodeMatch ? (nodeMatch[1] || nodeMatch[2] || nodeMatch[3] || "the pivot node").trim() : "the pivot node";
      return {
        id: _actionId(), title: `Simulate Block Lateral Movement: ${node}`, scope: "attack-path-simulation",
        guardrailLevel: "L1" as const, confidence: "moderate" as const,
        why: "Blocking lateral movement at this hop limits downstream target access. The entry foothold may still exist — residual exposure must be evaluated.",
        evidence: [
          "Pivot node is used for lateral movement to downstream targets",
          "Segmentation at this hop limits blast radius significantly",
          "Entry-level foothold persists — upstream chain remains",
          "Simulation is purely hypothetical — no network policy changes are made",
        ],
        riskSummary: "Hypothetical simulation. Lateral movement is not actually blocked.",
        parameters: [
          { label: "Target node", value: node, editable: true },
          { label: "Simulation type", value: "Block Lateral Movement" },
          { label: "Live change", value: "No — hypothetical only" },
        ],
        expectedOutcome: "Blast radius significantly reduced. Downstream targets unreachable. Upstream chain and alternative identity routes evaluated.",
        participatingAnalysts: ["Network Security Analyst", "Attack Path Analyst"],
        status: "pending" as const,
      };
    },
  },

  // what-if generic catch-all
  {
    match: /what\s+(if|happens?\s+if|would\s+happen\s+if)|how\s+does\s+blast\s+radius\s+change\s+if/i,
    build: (q, _agent) => ({
      id: _actionId(), title: "What-If Simulation", scope: "attack-path-simulation",
      guardrailLevel: "L1" as const, confidence: "moderate" as const,
      why: "Running a what-if simulation lets you assess the hypothetical impact of a mitigation before committing, helping prioritize which controls reduce risk most effectively.",
      evidence: [
        "Current attack path has active exposure that can be modeled",
        "Simulation engine recomputes blast radius deterministically",
        "Results are hypothetical — no live changes are made",
      ],
      riskSummary: "Hypothetical simulation only. Select a specific mitigation type to get precise results.",
      parameters: [
        { label: "Query", value: q.slice(0, 60), editable: true },
        { label: "Live change", value: "No — hypothetical only" },
      ],
      expectedOutcome: "Simulation scenario constructed. Blast radius recomputed. Before/after comparison and alternative path detection shown.",
      participatingAnalysts: ["Attack Path Analyst", "Exposure Analyst"],
      status: "pending" as const,
    }),
  },
];

export function matchAction(query: string, agentLabel?: string): ActionCardData | null {
  for (const tpl of ACTION_CATALOG) {
    if (tpl.match.test(query)) {
      return tpl.build(query, agentLabel);
    }
  }
  return null;
}
