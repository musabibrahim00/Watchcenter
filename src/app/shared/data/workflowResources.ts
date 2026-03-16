/**
 * Workflow Resources, Variables, Secrets & Environment Config
 * ============================================================
 *
 * Shared mock data for the Workflows module.
 * These are reusable across all workflows.
 */

/* ── Resource / Connection types ── */

export type ResourceType = "slack" | "email" | "webhook" | "aws" | "github" | "database" | "rest_api";

export interface ResourceConnection {
  id: string;
  name: string;
  type: ResourceType;
  description: string;
  status: "connected" | "disconnected" | "error";
  lastUsed?: string;
  config: Record<string, string>;
}

export const RESOURCE_TYPE_META: Record<ResourceType, { label: string; color: string; description: string }> = {
  slack: { label: "Slack", color: "#E01E5A", description: "Post messages, manage channels" },
  email: { label: "Email / SMTP", color: "#4A90D9", description: "Send emails via SMTP or API" },
  webhook: { label: "Webhook", color: "#F59E0B", description: "Send or receive HTTP webhooks" },
  aws: { label: "AWS", color: "#FF9900", description: "AWS services (Lambda, S3, SQS, etc.)" },
  github: { label: "GitHub", color: "#8B5CF6", description: "Repos, issues, actions, PRs" },
  database: { label: "Database", color: "#10B981", description: "PostgreSQL, MySQL, MongoDB, etc." },
  rest_api: { label: "REST API", color: "#3B82F6", description: "Generic HTTP/REST endpoints" },
};

export const MOCK_RESOURCES: ResourceConnection[] = [
  { id: "rc-1", name: "SOC Slack Workspace", type: "slack", description: "Primary SOC team Slack workspace for alerts and notifications", status: "connected", lastUsed: "2 hours ago", config: { workspace: "acme-security.slack.com", channel: "#soc-alerts", token: "xoxb-****-****-****" } },
  { id: "rc-2", name: "Security Team Email", type: "email", description: "SMTP relay for security team email notifications", status: "connected", lastUsed: "5 hours ago", config: { host: "smtp.acme.com", port: "587", from: "security@acme.com" } },
  { id: "rc-3", name: "Alert Webhook Receiver", type: "webhook", description: "Inbound webhook for receiving external alert notifications", status: "connected", lastUsed: "1 hour ago", config: { url: "https://hooks.platform.io/wf/alerts", method: "POST" } },
  { id: "rc-4", name: "AWS Production", type: "aws", description: "Production AWS account for Lambda, S3, and SQS operations", status: "connected", lastUsed: "3 hours ago", config: { region: "us-east-1", accountId: "1234****5678", role: "SecurityAutomationRole" } },
  { id: "rc-5", name: "Security GitHub Org", type: "github", description: "GitHub organization for security tooling and IaC repos", status: "connected", lastUsed: "1 day ago", config: { org: "acme-security", auth: "GitHub App" } },
  { id: "rc-6", name: "CMDB PostgreSQL", type: "database", description: "Configuration Management Database for asset metadata", status: "connected", lastUsed: "6 hours ago", config: { host: "cmdb.internal.acme.com", port: "5432", database: "cmdb_prod" } },
  { id: "rc-7", name: "Threat Intel API", type: "rest_api", description: "VirusTotal and AbuseIPDB threat intelligence endpoints", status: "error", lastUsed: "2 days ago", config: { baseUrl: "https://api.virustotal.com/v3", auth: "API Key" } },
  { id: "rc-8", name: "JIRA Cloud", type: "rest_api", description: "Atlassian JIRA for ticket creation and management", status: "connected", lastUsed: "4 hours ago", config: { baseUrl: "https://acme.atlassian.net", auth: "OAuth 2.0" } },
];

/* ── Variables ── */

export interface WorkflowVariable {
  id: string;
  name: string;
  value: string;
  description: string;
  scope: "global" | "workflow";
  type: "string" | "number" | "boolean" | "json";
}

export const MOCK_VARIABLES: WorkflowVariable[] = [
  { id: "var-1", name: "soc_channel", value: "#soc-alerts", description: "Default SOC alerts Slack channel", scope: "global", type: "string" },
  { id: "var-2", name: "critical_threshold", value: "9.0", description: "CVSS threshold for critical severity classification", scope: "global", type: "number" },
  { id: "var-3", name: "default_assignee", value: "soc-team", description: "Default team for new case assignment", scope: "global", type: "string" },
  { id: "var-4", name: "max_retries", value: "3", description: "Maximum retry attempts for failed steps", scope: "global", type: "number" },
  { id: "var-5", name: "enrichment_enabled", value: "true", description: "Enable automatic threat intel enrichment", scope: "global", type: "boolean" },
  { id: "var-6", name: "webhook_timeout", value: "30", description: "Webhook timeout in seconds", scope: "global", type: "number" },
  { id: "var-7", name: "case_prefix", value: "CASE", description: "Prefix for auto-generated case IDs", scope: "global", type: "string" },
  { id: "var-8", name: "alert_routing_rules", value: '{"critical":"immediate","high":"15m","medium":"1h"}', description: "Alert routing SLA rules as JSON", scope: "global", type: "json" },
];

/* ── Secrets ── */

export interface WorkflowSecret {
  id: string;
  name: string;
  description: string;
  lastRotated: string;
  scope: "global" | "workflow";
  usedBy: number;
}

export const MOCK_SECRETS: WorkflowSecret[] = [
  { id: "sec-1", name: "SLACK_BOT_TOKEN", description: "Slack Bot OAuth token for posting messages", lastRotated: "14 days ago", scope: "global", usedBy: 4 },
  { id: "sec-2", name: "AWS_ACCESS_KEY_ID", description: "AWS IAM access key for automation role", lastRotated: "30 days ago", scope: "global", usedBy: 3 },
  { id: "sec-3", name: "AWS_SECRET_ACCESS_KEY", description: "AWS IAM secret key for automation role", lastRotated: "30 days ago", scope: "global", usedBy: 3 },
  { id: "sec-4", name: "GITHUB_APP_KEY", description: "GitHub App private key for API access", lastRotated: "60 days ago", scope: "global", usedBy: 2 },
  { id: "sec-5", name: "VIRUSTOTAL_API_KEY", description: "VirusTotal API key for threat intelligence", lastRotated: "7 days ago", scope: "global", usedBy: 2 },
  { id: "sec-6", name: "JIRA_API_TOKEN", description: "JIRA Cloud API token for ticket operations", lastRotated: "21 days ago", scope: "global", usedBy: 2 },
  { id: "sec-7", name: "SMTP_PASSWORD", description: "SMTP relay password for email notifications", lastRotated: "45 days ago", scope: "global", usedBy: 1 },
  { id: "sec-8", name: "DB_CONNECTION_STRING", description: "PostgreSQL CMDB connection string", lastRotated: "10 days ago", scope: "global", usedBy: 1 },
];

/* ── Environments ── */

export interface WorkflowEnvironment {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  variables: Record<string, string>;
}

export const MOCK_ENVIRONMENTS: WorkflowEnvironment[] = [
  { id: "env-1", name: "Production", description: "Live production environment with real connections", isActive: true, variables: { API_BASE: "https://api.acme.com", LOG_LEVEL: "warn", RATE_LIMIT: "100" } },
  { id: "env-2", name: "Staging", description: "Pre-production staging for testing workflows", isActive: false, variables: { API_BASE: "https://staging-api.acme.com", LOG_LEVEL: "info", RATE_LIMIT: "500" } },
  { id: "env-3", name: "Development", description: "Local development with mock services", isActive: false, variables: { API_BASE: "http://localhost:3000", LOG_LEVEL: "debug", RATE_LIMIT: "9999" } },
];
