/**
 * Hub Data — Reusable Building Blocks
 * ====================================
 * Central catalog of scripts/actions, flows/subflows, UI templates,
 * resource types, and integrations for the Workflow Hub.
 */

/* ── Integration definitions ── */

export interface Integration {
  id: string;
  name: string;
  slug: string;
  color: string;
  description: string;
  itemCount: number;
}

export const INTEGRATIONS: Integration[] = [
  { id: "int-slack", name: "Slack", slug: "slack", color: "#E01E5A", description: "Messaging & notifications", itemCount: 12 },
  { id: "int-github", name: "GitHub", slug: "github", color: "#8B5CF6", description: "Code & repository management", itemCount: 9 },
  { id: "int-aws", name: "AWS", slug: "aws", color: "#FF9900", description: "Cloud infrastructure & services", itemCount: 14 },
  { id: "int-postgres", name: "PostgreSQL", slug: "postgresql", color: "#336791", description: "Relational database operations", itemCount: 8 },
  { id: "int-rest", name: "REST API", slug: "rest-api", color: "#0CCF92", description: "Generic HTTP / REST requests", itemCount: 6 },
  { id: "int-jira", name: "Jira", slug: "jira", color: "#0052CC", description: "Issue tracking & project management", itemCount: 7 },
  { id: "int-email", name: "Email / SMTP", slug: "email", color: "#14A2E3", description: "Send & receive email", itemCount: 5 },
  { id: "int-pagerduty", name: "PagerDuty", slug: "pagerduty", color: "#06AC38", description: "Incident management & alerting", itemCount: 4 },
  { id: "int-okta", name: "Okta", slug: "okta", color: "#007DC1", description: "Identity & access management", itemCount: 5 },
  { id: "int-splunk", name: "Splunk", slug: "splunk", color: "#65A637", description: "SIEM & log analysis", itemCount: 6 },
  { id: "int-azure", name: "Azure", slug: "azure", color: "#0078D4", description: "Microsoft cloud services", itemCount: 8 },
  { id: "int-gcp", name: "GCP", slug: "gcp", color: "#4285F4", description: "Google Cloud Platform", itemCount: 7 },
  { id: "int-webhook", name: "Webhooks", slug: "webhook", color: "#F59E0B", description: "Inbound & outbound webhooks", itemCount: 4 },
  { id: "int-s3", name: "S3 / Object Storage", slug: "s3", color: "#569A31", description: "File & object storage", itemCount: 5 },
];

/* ── Hub item types ── */

export type HubItemKind = "script" | "flow" | "template" | "resource_type";

export type HubSource = "official" | "community" | "workspace";

export interface HubItem {
  id: string;
  kind: HubItemKind;
  title: string;
  description: string;
  integration?: string;      // slug from INTEGRATIONS
  source: HubSource;
  author: string;
  version: string;
  downloads: number;
  stars: number;
  tags: string[];
  updatedAt: string;
  verified: boolean;
}

/* ── Mock Hub Items ── */

export const HUB_ITEMS: HubItem[] = [
  // ─── Scripts / Actions ───
  { id: "hub-s1", kind: "script", title: "Send Slack Message", description: "Post a message to a Slack channel with optional attachments and thread replies.", integration: "slack", source: "official", author: "Platform Team", version: "2.1.0", downloads: 18420, stars: 342, tags: ["Messaging", "Notifications"], updatedAt: "2 days ago", verified: true },
  { id: "hub-s2", kind: "script", title: "Create GitHub Issue", description: "Create a new issue in a GitHub repository with labels, assignees, and milestone.", integration: "github", source: "official", author: "Platform Team", version: "1.8.0", downloads: 12850, stars: 287, tags: ["Issue Tracking", "Code"], updatedAt: "5 days ago", verified: true },
  { id: "hub-s3", kind: "script", title: "AWS Lambda Invoke", description: "Invoke an AWS Lambda function with custom payload and parse the response.", integration: "aws", source: "official", author: "Platform Team", version: "3.0.1", downloads: 15200, stars: 310, tags: ["Serverless", "Compute"], updatedAt: "1 week ago", verified: true },
  { id: "hub-s4", kind: "script", title: "PostgreSQL Query", description: "Execute a parameterized SQL query against a PostgreSQL database and return results.", integration: "postgresql", source: "official", author: "Platform Team", version: "2.3.0", downloads: 11400, stars: 256, tags: ["Database", "SQL"], updatedAt: "3 days ago", verified: true },
  { id: "hub-s5", kind: "script", title: "HTTP Request", description: "Make an HTTP request with configurable method, headers, body, and authentication.", integration: "rest-api", source: "official", author: "Platform Team", version: "4.0.0", downloads: 24600, stars: 478, tags: ["HTTP", "API"], updatedAt: "1 day ago", verified: true },
  { id: "hub-s6", kind: "script", title: "Slack Channel Archive", description: "Archive inactive Slack channels based on last message date threshold.", integration: "slack", source: "community", author: "secops-contrib", version: "1.2.0", downloads: 3420, stars: 89, tags: ["Cleanup", "Governance"], updatedAt: "2 weeks ago", verified: false },
  { id: "hub-s7", kind: "script", title: "GitHub PR Review Assigner", description: "Automatically assign code reviewers based on CODEOWNERS and team availability.", integration: "github", source: "community", author: "devops-hub", version: "1.0.3", downloads: 5670, stars: 134, tags: ["Code Review", "Automation"], updatedAt: "1 week ago", verified: false },
  { id: "hub-s8", kind: "script", title: "AWS Security Group Audit", description: "Audit AWS security groups for overly permissive rules and flag violations.", integration: "aws", source: "official", author: "Platform Team", version: "2.0.0", downloads: 8900, stars: 201, tags: ["Security", "Compliance"], updatedAt: "4 days ago", verified: true },
  { id: "hub-s9", kind: "script", title: "Create Jira Ticket", description: "Create a Jira issue with custom fields, priority, labels, and component assignments.", integration: "jira", source: "official", author: "Platform Team", version: "2.5.0", downloads: 14200, stars: 298, tags: ["Issue Tracking", "Project Management"], updatedAt: "6 days ago", verified: true },
  { id: "hub-s10", kind: "script", title: "Send Email via SMTP", description: "Send formatted HTML or plain text emails with attachments through SMTP.", integration: "email", source: "official", author: "Platform Team", version: "1.6.0", downloads: 9800, stars: 187, tags: ["Email", "Notifications"], updatedAt: "1 week ago", verified: true },
  { id: "hub-s11", kind: "script", title: "PagerDuty Create Incident", description: "Create and escalate PagerDuty incidents with severity, urgency, and service routing.", integration: "pagerduty", source: "official", author: "Platform Team", version: "1.4.0", downloads: 6500, stars: 156, tags: ["Incident Management", "Alerting"], updatedAt: "2 weeks ago", verified: true },
  { id: "hub-s12", kind: "script", title: "Okta User Lookup", description: "Look up user profile, group membership, and MFA status in Okta.", integration: "okta", source: "official", author: "Platform Team", version: "1.2.0", downloads: 4300, stars: 98, tags: ["Identity", "IAM"], updatedAt: "3 weeks ago", verified: true },
  { id: "hub-s13", kind: "script", title: "Splunk Search Query", description: "Execute a Splunk SPL search and return results with optional time range filtering.", integration: "splunk", source: "official", author: "Platform Team", version: "2.1.0", downloads: 7800, stars: 178, tags: ["SIEM", "Log Analysis"], updatedAt: "5 days ago", verified: true },
  { id: "hub-s14", kind: "script", title: "VirusTotal Hash Lookup", description: "Check file hash against VirusTotal database and return detection results.", integration: "rest-api", source: "community", author: "threat-intel-org", version: "1.3.2", downloads: 8200, stars: 195, tags: ["Threat Intel", "Malware"], updatedAt: "1 week ago", verified: true },
  { id: "hub-s15", kind: "script", title: "S3 Upload File", description: "Upload files to AWS S3 bucket with configurable ACL, encryption, and metadata.", integration: "s3", source: "official", author: "Platform Team", version: "1.5.0", downloads: 6100, stars: 142, tags: ["Storage", "File"], updatedAt: "2 weeks ago", verified: true },
  { id: "hub-s16", kind: "script", title: "Azure AD User Disable", description: "Disable an Azure AD user account and revoke all active sessions.", integration: "azure", source: "community", author: "cloud-sec-team", version: "1.1.0", downloads: 3800, stars: 87, tags: ["Identity", "Containment"], updatedAt: "3 weeks ago", verified: false },
  { id: "hub-s17", kind: "script", title: "GCP Firewall Rule Update", description: "Create or update GCP firewall rules with source/target specifications.", integration: "gcp", source: "community", author: "gcp-contrib", version: "1.0.1", downloads: 2900, stars: 67, tags: ["Network", "Firewall"], updatedAt: "1 month ago", verified: false },
  { id: "hub-s18", kind: "script", title: "Webhook Forwarder", description: "Receive webhook payloads and forward them to multiple downstream endpoints.", integration: "webhook", source: "official", author: "Platform Team", version: "1.3.0", downloads: 5400, stars: 124, tags: ["Webhook", "Router"], updatedAt: "1 week ago", verified: true },
  { id: "hub-s19", kind: "script", title: "Enrich IOC from ThreatFeed", description: "Enrich indicators of compromise with data from multiple threat intelligence feeds.", integration: "rest-api", source: "workspace", author: "SOC Team", version: "1.0.0", downloads: 120, stars: 8, tags: ["Threat Intel", "Enrichment"], updatedAt: "3 days ago", verified: false },
  { id: "hub-s20", kind: "script", title: "Quarantine EC2 Instance", description: "Isolate a compromised EC2 instance by modifying security groups and snapshots.", integration: "aws", source: "workspace", author: "IR Team", version: "1.1.0", downloads: 85, stars: 5, tags: ["Containment", "IR"], updatedAt: "1 week ago", verified: false },

  // ─── Flows / Subflows ───
  { id: "hub-f1", kind: "flow", title: "Alert Triage Pipeline", description: "End-to-end alert triage: enrich, deduplicate, score severity, and route to appropriate team.", integration: undefined, source: "official", author: "Platform Team", version: "3.0.0", downloads: 9800, stars: 245, tags: ["Alerts", "Triage", "SOC"], updatedAt: "3 days ago", verified: true },
  { id: "hub-f2", kind: "flow", title: "Incident Response Playbook", description: "Automated IR playbook with containment, eradication, recovery, and post-incident review steps.", integration: undefined, source: "official", author: "Platform Team", version: "2.5.0", downloads: 12400, stars: 312, tags: ["IR", "Playbook"], updatedAt: "1 week ago", verified: true },
  { id: "hub-f3", kind: "flow", title: "Vulnerability Scan & Remediate", description: "Run vulnerability scan, parse results, create tickets, and track remediation progress.", integration: "jira", source: "official", author: "Platform Team", version: "2.0.0", downloads: 7200, stars: 189, tags: ["Vulnerability", "Remediation"], updatedAt: "5 days ago", verified: true },
  { id: "hub-f4", kind: "flow", title: "Phishing Email Analysis", description: "Analyze reported phishing emails: extract URLs, detonate in sandbox, check reputation, notify user.", integration: "email", source: "community", author: "soc-community", version: "1.4.0", downloads: 6300, stars: 167, tags: ["Phishing", "Email", "Analysis"], updatedAt: "2 weeks ago", verified: true },
  { id: "hub-f5", kind: "flow", title: "Cloud Compliance Audit", description: "Automated compliance audit across AWS, Azure, GCP with report generation and ticket creation.", integration: "aws", source: "official", author: "Platform Team", version: "1.8.0", downloads: 5100, stars: 134, tags: ["Compliance", "Multi-Cloud"], updatedAt: "1 week ago", verified: true },
  { id: "hub-f6", kind: "flow", title: "User Access Review", description: "Periodic user access review workflow with manager approval, deprovisioning, and audit trail.", integration: "okta", source: "community", author: "iam-contrib", version: "1.2.0", downloads: 3400, stars: 92, tags: ["IAM", "Access Review"], updatedAt: "3 weeks ago", verified: false },
  { id: "hub-f7", kind: "flow", title: "Threat Hunt Pipeline", description: "Structured threat hunting workflow: hypothesis creation, data collection, analysis, and reporting.", integration: "splunk", source: "community", author: "threat-hunt-team", version: "1.0.0", downloads: 2800, stars: 78, tags: ["Threat Hunting", "Detection"], updatedAt: "1 month ago", verified: false },
  { id: "hub-f8", kind: "flow", title: "Slack Approval Subflow", description: "Reusable approval subflow that sends an interactive Slack message and waits for user decision.", integration: "slack", source: "official", author: "Platform Team", version: "1.5.0", downloads: 8900, stars: 215, tags: ["Approval", "Slack"], updatedAt: "4 days ago", verified: true },
  { id: "hub-f9", kind: "flow", title: "Asset Onboarding", description: "Automated new asset onboarding: register, scan, classify, assign owner, and baseline security posture.", integration: undefined, source: "workspace", author: "Asset Team", version: "1.0.0", downloads: 64, stars: 3, tags: ["Asset Management", "Onboarding"], updatedAt: "2 days ago", verified: false },

  // ─── UI Templates ───
  { id: "hub-t1", kind: "template", title: "SOC Dashboard Workflow", description: "Complete SOC operations workflow with alert ingestion, triage, escalation, and metrics dashboard.", integration: undefined, source: "official", author: "Platform Team", version: "2.0.0", downloads: 8600, stars: 267, tags: ["SOC", "Dashboard", "Operations"], updatedAt: "3 days ago", verified: true },
  { id: "hub-t2", kind: "template", title: "SOAR Playbook Template", description: "Security orchestration template with modular response steps and integration connectors.", integration: undefined, source: "official", author: "Platform Team", version: "1.6.0", downloads: 6200, stars: 198, tags: ["SOAR", "Orchestration"], updatedAt: "1 week ago", verified: true },
  { id: "hub-t3", kind: "template", title: "Compliance Report Generator", description: "Template for generating compliance reports from multiple data sources with customizable formatting.", integration: undefined, source: "official", author: "Platform Team", version: "1.3.0", downloads: 4500, stars: 134, tags: ["Compliance", "Reporting"], updatedAt: "2 weeks ago", verified: true },
  { id: "hub-t4", kind: "template", title: "Risk Assessment Workflow", description: "End-to-end risk assessment template with scoring, owner assignment, and mitigation tracking.", integration: undefined, source: "community", author: "risk-mgmt-org", version: "1.1.0", downloads: 3200, stars: 89, tags: ["Risk", "Assessment"], updatedAt: "3 weeks ago", verified: false },
  { id: "hub-t5", kind: "template", title: "Multi-Cloud Asset Inventory", description: "Template for collecting and reconciling assets across AWS, Azure, and GCP accounts.", integration: "aws", source: "community", author: "cloud-ops", version: "1.0.2", downloads: 2700, stars: 72, tags: ["Multi-Cloud", "Inventory"], updatedAt: "1 month ago", verified: false },
  { id: "hub-t6", kind: "template", title: "Threat Intelligence Pipeline", description: "Modular threat intel pipeline template with feed ingestion, normalization, and IOC distribution.", integration: "rest-api", source: "official", author: "Platform Team", version: "2.2.0", downloads: 5800, stars: 178, tags: ["Threat Intel", "Pipeline"], updatedAt: "5 days ago", verified: true },

  // ─── Resource Types ───
  { id: "hub-r1", kind: "resource_type", title: "Slack Bot Token", description: "OAuth token configuration for Slack Bot API access with scoped permissions.", integration: "slack", source: "official", author: "Platform Team", version: "1.0.0", downloads: 14200, stars: 0, tags: ["OAuth", "Bot"], updatedAt: "1 month ago", verified: true },
  { id: "hub-r2", kind: "resource_type", title: "GitHub App Credentials", description: "GitHub App installation credentials with repository and organization scope.", integration: "github", source: "official", author: "Platform Team", version: "1.0.0", downloads: 10500, stars: 0, tags: ["App", "Auth"], updatedAt: "2 months ago", verified: true },
  { id: "hub-r3", kind: "resource_type", title: "AWS IAM Role", description: "AWS IAM role assumption configuration with external ID and session policy.", integration: "aws", source: "official", author: "Platform Team", version: "2.0.0", downloads: 12800, stars: 0, tags: ["IAM", "Role"], updatedAt: "3 weeks ago", verified: true },
  { id: "hub-r4", kind: "resource_type", title: "PostgreSQL Connection", description: "PostgreSQL database connection with connection pooling, SSL, and read replica support.", integration: "postgresql", source: "official", author: "Platform Team", version: "1.2.0", downloads: 9200, stars: 0, tags: ["Database", "Connection"], updatedAt: "1 month ago", verified: true },
  { id: "hub-r5", kind: "resource_type", title: "REST API Bearer Token", description: "Generic REST API authentication with bearer token, API key, or basic auth.", integration: "rest-api", source: "official", author: "Platform Team", version: "1.0.0", downloads: 16800, stars: 0, tags: ["Auth", "Token"], updatedAt: "2 months ago", verified: true },
  { id: "hub-r6", kind: "resource_type", title: "Jira API Token", description: "Jira Cloud API token with project and issue type access configuration.", integration: "jira", source: "official", author: "Platform Team", version: "1.1.0", downloads: 7600, stars: 0, tags: ["API", "Token"], updatedAt: "1 month ago", verified: true },
  { id: "hub-r7", kind: "resource_type", title: "PagerDuty API Key", description: "PagerDuty REST API key with service and escalation policy access.", integration: "pagerduty", source: "official", author: "Platform Team", version: "1.0.0", downloads: 4200, stars: 0, tags: ["API", "Key"], updatedAt: "2 months ago", verified: true },
  { id: "hub-r8", kind: "resource_type", title: "Splunk HEC Token", description: "Splunk HTTP Event Collector token with index and sourcetype configuration.", integration: "splunk", source: "official", author: "Platform Team", version: "1.0.0", downloads: 5600, stars: 0, tags: ["HEC", "Ingest"], updatedAt: "6 weeks ago", verified: true },
  { id: "hub-r9", kind: "resource_type", title: "Azure Service Principal", description: "Azure AD service principal with tenant, subscription, and resource group scope.", integration: "azure", source: "official", author: "Platform Team", version: "1.0.0", downloads: 6100, stars: 0, tags: ["Service Principal", "Auth"], updatedAt: "2 months ago", verified: true },
  { id: "hub-r10", kind: "resource_type", title: "GCP Service Account", description: "GCP service account JSON key configuration with project and API scope.", integration: "gcp", source: "official", author: "Platform Team", version: "1.0.0", downloads: 4800, stars: 0, tags: ["Service Account", "Auth"], updatedAt: "2 months ago", verified: true },
];

/* ── Derived stats ── */
export const HUB_STATS = {
  totalItems: HUB_ITEMS.length,
  scripts: HUB_ITEMS.filter(i => i.kind === "script").length,
  flows: HUB_ITEMS.filter(i => i.kind === "flow").length,
  templates: HUB_ITEMS.filter(i => i.kind === "template").length,
  resourceTypes: HUB_ITEMS.filter(i => i.kind === "resource_type").length,
  integrations: INTEGRATIONS.length,
  totalDownloads: HUB_ITEMS.reduce((a, b) => a + b.downloads, 0),
};
