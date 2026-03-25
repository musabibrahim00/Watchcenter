import type React from "react";
import { Globe, Cloud, Shield, Server, Database, AlertTriangle } from "lucide-react";
import { colors } from "../../shared/design-system/tokens";
import type { PathNode, PathEdge, BlastRadiusAsset, BlastRadiusData, AttackPathData } from "./types";

/* ================================================================
   MOCK DATA — attack paths
   ================================================================ */

export const ATTACK_PATHS: Record<string, AttackPathData> = {
  "ap-001": {
    name: "Internet-facing service \u2192 Database",
    priority: "critical",
    description: "External attacker can traverse from an internet-facing service through misconfigured cloud resources to reach sensitive database assets.",
    assets: 12, misconfigurations: 8, vulnerabilities: 15,
    nodes: [
      { id: "internet", label: "Internet", sublabel: "External", icon: "internet", x: 80, y: 300 },
      { id: "cloud", label: "Cloud", sublabel: "AWS", icon: "cloud", x: 280, y: 300 },
      { id: "account", label: "AWS Account", sublabel: "prod-0384", icon: "account", x: 480, y: 300 },
      { id: "region", label: "Region", sublabel: "us-east-1", icon: "region", x: 680, y: 300 },
      { id: "ec2", label: "EC2 Instance", sublabel: "i-0a3f7c9d", icon: "instance", x: 880, y: 300, isVulnerable: true, cve: "CVE-2018-15133" },
    ],
    edges: [
      { from: "internet", to: "cloud" }, { from: "cloud", to: "account" },
      { from: "account", to: "region" }, { from: "region", to: "ec2" },
    ],
    blastRadius: {
      totalAssets: 12, totalVulnerabilities: 49, totalMisconfigurations: 18,
      assets: [
        { id: "br-1", name: "mandrill-prod", arn: "arn:aws:ec2:us-east-1:384:i-0a3f7c9d", privateIp: "10.0.1.10", vulnerabilities: 49, misconfigurations: 3, riskSeverity: "critical", exposures: ["SSH", "HTTP"] },
        { id: "br-2", name: "finance-db-01", arn: "arn:aws:rds:us-east-1:384:db/finance-01", privateIp: "10.0.1.20", vulnerabilities: 12, misconfigurations: 5, riskSeverity: "critical", exposures: ["SQL Injection"] },
        { id: "br-3", name: "api-gateway-prod", arn: "arn:aws:apigateway:us-east-1:384:api/gw-prod", privateIp: "10.0.1.30", vulnerabilities: 8, misconfigurations: 2, riskSeverity: "high", exposures: ["API Key"] },
        { id: "br-4", name: "auth-service-01", arn: "arn:aws:ecs:us-east-1:384:svc/auth-01", privateIp: "10.0.1.40", vulnerabilities: 6, misconfigurations: 4, riskSeverity: "medium", exposures: ["JWT"] },
        { id: "br-5", name: "cache-redis-prod", arn: "arn:aws:elasticache:us-east-1:384:redis-prod", privateIp: "10.0.1.50", vulnerabilities: 3, misconfigurations: 1, riskSeverity: "low", exposures: ["Redis"] },
        { id: "br-6", name: "worker-queue-01", arn: "arn:aws:sqs:us-east-1:384:queue/worker-01", privateIp: "10.0.1.60", vulnerabilities: 5, misconfigurations: 3, riskSeverity: "medium", exposures: ["SQS"] },
        { id: "br-7", name: "log-aggregator", arn: "arn:aws:lambda:us-east-1:384:fn/log-agg", privateIp: "10.0.1.70", vulnerabilities: 2, misconfigurations: 1, riskSeverity: "low", exposures: ["Lambda"] },
        { id: "br-8", name: "s3-data-lake", arn: "arn:aws:s3:::data-lake-prod-384", privateIp: "10.0.1.80", vulnerabilities: 7, misconfigurations: 2, riskSeverity: "high", exposures: ["S3"] },
      ],
    },
  },
  "ap-002": {
    name: "Compromised credentials \u2192 Cloud admin",
    priority: "critical",
    description: "Stolen credentials enable lateral movement through IAM roles to reach cloud administrator privileges.",
    assets: 8, misconfigurations: 5, vulnerabilities: 3,
    nodes: [
      { id: "internet", label: "Internet", sublabel: "Phishing", icon: "internet", x: 80, y: 300 },
      { id: "cloud", label: "Cloud", sublabel: "AWS", icon: "cloud", x: 280, y: 300 },
      { id: "iam", label: "IAM User", sublabel: "dev-user-01", icon: "account", x: 480, y: 300 },
      { id: "role", label: "IAM Role", sublabel: "admin-role", icon: "account", x: 680, y: 300 },
      { id: "admin", label: "Cloud Admin", sublabel: "root-access", icon: "instance", x: 880, y: 300, isVulnerable: true, cve: "CVE-2024-5821" },
    ],
    edges: [
      { from: "internet", to: "cloud" }, { from: "cloud", to: "iam" },
      { from: "iam", to: "role" }, { from: "role", to: "admin" },
    ],
    blastRadius: {
      totalAssets: 8, totalVulnerabilities: 22, totalMisconfigurations: 11,
      assets: [
        { id: "br-1", name: "iam-root-account", arn: "arn:aws:iam::384:root", privateIp: "10.0.1.90", vulnerabilities: 7, misconfigurations: 4, riskSeverity: "critical", exposures: ["IAM"] },
        { id: "br-2", name: "s3-secrets-bucket", arn: "arn:aws:s3:::secrets-384", privateIp: "10.0.1.100", vulnerabilities: 5, misconfigurations: 3, riskSeverity: "critical", exposures: ["S3"] },
        { id: "br-3", name: "kms-master-key", arn: "arn:aws:kms:us-east-1:384:key/master", privateIp: "10.0.1.110", vulnerabilities: 4, misconfigurations: 2, riskSeverity: "high", exposures: ["KMS"] },
        { id: "br-4", name: "cloudtrail-logs", arn: "arn:aws:cloudtrail:us-east-1:384:trail/main", privateIp: "10.0.1.120", vulnerabilities: 3, misconfigurations: 1, riskSeverity: "medium", exposures: ["CloudTrail"] },
        { id: "br-5", name: "vpc-prod-network", arn: "arn:aws:ec2:us-east-1:384:vpc/vpc-prod", privateIp: "10.0.1.130", vulnerabilities: 3, misconfigurations: 1, riskSeverity: "low", exposures: ["VPC"] },
      ],
    },
  },
  "ap-003": {
    name: "Lateral movement via SMB",
    priority: "high",
    description: "An attacker pivots through internal network via SMB protocol misconfiguration across multiple workstations.",
    assets: 24, misconfigurations: 12, vulnerabilities: 18,
    nodes: [
      { id: "internet", label: "Internet", sublabel: "External", icon: "internet", x: 80, y: 300 },
      { id: "cloud", label: "Network", sublabel: "Corp LAN", icon: "cloud", x: 280, y: 300 },
      { id: "wks1", label: "Workstation", sublabel: "WKS-0223", icon: "instance", x: 480, y: 300 },
      { id: "wks2", label: "Workstation", sublabel: "WKS-0447", icon: "instance", x: 680, y: 300 },
      { id: "dc", label: "Domain Controller", sublabel: "DC-PROD-01", icon: "instance", x: 880, y: 300, isVulnerable: true, cve: "CVE-2021-34527" },
    ],
    edges: [
      { from: "internet", to: "cloud" }, { from: "cloud", to: "wks1" },
      { from: "wks1", to: "wks2" }, { from: "wks2", to: "dc" },
    ],
    blastRadius: {
      totalAssets: 24, totalVulnerabilities: 67, totalMisconfigurations: 31,
      assets: [
        { id: "br-1", name: "dc-prod-01", arn: "corp\\DC-PROD-01.internal.corp", privateIp: "10.0.1.140", vulnerabilities: 14, misconfigurations: 6, riskSeverity: "critical", exposures: ["SMB"] },
        { id: "br-2", name: "git-server-01", arn: "corp\\GIT-SERVER-01.internal.corp", privateIp: "10.0.1.150", vulnerabilities: 11, misconfigurations: 5, riskSeverity: "critical", exposures: ["Git"] },
        { id: "br-3", name: "file-server-02", arn: "corp\\FILE-SERVER-02.internal.corp", privateIp: "10.0.1.160", vulnerabilities: 9, misconfigurations: 4, riskSeverity: "high", exposures: ["SMB"] },
        { id: "br-4", name: "build-server-ci", arn: "corp\\BUILD-CI-01.internal.corp", privateIp: "10.0.1.170", vulnerabilities: 8, misconfigurations: 3, riskSeverity: "high", exposures: ["CI/CD"] },
        { id: "br-5", name: "backup-nas-01", arn: "corp\\NAS-BACKUP-01.internal.corp", privateIp: "10.0.1.180", vulnerabilities: 6, misconfigurations: 2, riskSeverity: "medium", exposures: ["NAS"] },
        { id: "br-6", name: "monitoring-srv", arn: "corp\\MON-SRV-01.internal.corp", privateIp: "10.0.1.190", vulnerabilities: 4, misconfigurations: 2, riskSeverity: "medium", exposures: ["Monitoring"] },
        { id: "br-7", name: "print-server-01", arn: "corp\\PRINT-SRV-01.internal.corp", privateIp: "10.0.1.200", vulnerabilities: 2, misconfigurations: 1, riskSeverity: "low", exposures: ["Printing"] },
        { id: "br-8", name: "vpn-gateway", arn: "corp\\VPN-GW-01.internal.corp", privateIp: "10.0.1.210", vulnerabilities: 5, misconfigurations: 3, riskSeverity: "high", exposures: ["VPN"] },
      ],
    },
  },
  "ap-004": {
    name: "S3 bucket data exfiltration",
    priority: "high",
    description: "An attacker accesses a publicly readable S3 bucket to exfiltrate sensitive datasets stored without encryption at rest.",
    assets: 6, misconfigurations: 9, vulnerabilities: 4,
    nodes: [
      { id: "internet", label: "Internet", sublabel: "External", icon: "internet", x: 80, y: 300 },
      { id: "cloud", label: "Cloud", sublabel: "AWS", icon: "cloud", x: 280, y: 300 },
      { id: "s3", label: "S3 Bucket", sublabel: "data-lake-prod", icon: "database", x: 480, y: 300 },
      { id: "kms", label: "KMS Key", sublabel: "key-disabled", icon: "account", x: 680, y: 300 },
      { id: "data", label: "Sensitive Data", sublabel: "PII Dataset", icon: "database", x: 880, y: 300, isVulnerable: true, cve: "CVE-2023-34312" },
    ],
    edges: [
      { from: "internet", to: "cloud" }, { from: "cloud", to: "s3" },
      { from: "s3", to: "kms" }, { from: "kms", to: "data" },
    ],
    blastRadius: {
      totalAssets: 6, totalVulnerabilities: 18, totalMisconfigurations: 9,
      assets: [
        { id: "br-1", name: "data-lake-prod", arn: "arn:aws:s3:::data-lake-prod", privateIp: "N/A", vulnerabilities: 5, misconfigurations: 3, riskSeverity: "critical", exposures: ["S3 Public Read"] },
        { id: "br-2", name: "etl-pipeline-fn", arn: "arn:aws:lambda:us-east-1:384:fn/etl-pipeline", privateIp: "N/A", vulnerabilities: 4, misconfigurations: 2, riskSeverity: "high", exposures: ["Lambda"] },
        { id: "br-3", name: "glue-crawler-01", arn: "arn:aws:glue:us-east-1:384:crawler/main", privateIp: "N/A", vulnerabilities: 3, misconfigurations: 1, riskSeverity: "medium", exposures: ["Glue"] },
        { id: "br-4", name: "athena-workgroup", arn: "arn:aws:athena:us-east-1:384:workgroup/primary", privateIp: "N/A", vulnerabilities: 2, misconfigurations: 1, riskSeverity: "low", exposures: ["Athena"] },
        { id: "br-5", name: "redshift-cluster", arn: "arn:aws:redshift:us-east-1:384:cluster/analytics", privateIp: "10.0.3.10", vulnerabilities: 3, misconfigurations: 1, riskSeverity: "high", exposures: ["Redshift"] },
        { id: "br-6", name: "quicksight-dash", arn: "arn:aws:quicksight:us-east-1:384:dashboard/finance", privateIp: "N/A", vulnerabilities: 1, misconfigurations: 1, riskSeverity: "low", exposures: ["QuickSight"] },
      ],
    },
  },
  "ap-005": {
    name: "Container escape → host takeover",
    priority: "critical",
    description: "A vulnerable container image allows escape to the underlying host, leading to full cluster compromise.",
    assets: 18, misconfigurations: 14, vulnerabilities: 22,
    nodes: [
      { id: "internet", label: "Internet", sublabel: "External", icon: "internet", x: 80, y: 300 },
      { id: "lb", label: "Load Balancer", sublabel: "ALB-prod", icon: "cloud", x: 280, y: 300 },
      { id: "eks", label: "EKS Cluster", sublabel: "prod-cluster", icon: "region", x: 480, y: 300 },
      { id: "pod", label: "Pod", sublabel: "app-pod-7f2d", icon: "instance", x: 680, y: 300 },
      { id: "host", label: "EC2 Host", sublabel: "i-0b7e2f3c", icon: "instance", x: 880, y: 300, isVulnerable: true, cve: "CVE-2024-21626" },
    ],
    edges: [
      { from: "internet", to: "lb" }, { from: "lb", to: "eks" },
      { from: "eks", to: "pod" }, { from: "pod", to: "host" },
    ],
    blastRadius: {
      totalAssets: 18, totalVulnerabilities: 72, totalMisconfigurations: 28,
      assets: [
        { id: "br-1", name: "host-node-01", arn: "arn:aws:ec2:us-east-1:384:i-0b7e2f3c", privateIp: "10.0.4.10", vulnerabilities: 15, misconfigurations: 6, riskSeverity: "critical", exposures: ["Docker Socket"] },
        { id: "br-2", name: "kube-apiserver", arn: "arn:aws:eks:us-east-1:384:cluster/prod/api", privateIp: "10.0.4.20", vulnerabilities: 12, misconfigurations: 4, riskSeverity: "critical", exposures: ["Kubernetes API"] },
        { id: "br-3", name: "secrets-store", arn: "arn:aws:secretsmanager:us-east-1:384:secret/prod", privateIp: "10.0.4.30", vulnerabilities: 8, misconfigurations: 3, riskSeverity: "high", exposures: ["Secrets Manager"] },
        { id: "br-4", name: "ecr-registry", arn: "arn:aws:ecr:us-east-1:384:repo/prod-images", privateIp: "N/A", vulnerabilities: 6, misconfigurations: 3, riskSeverity: "high", exposures: ["ECR"] },
        { id: "br-5", name: "svc-mesh-proxy", arn: "arn:aws:appmesh:us-east-1:384:mesh/prod", privateIp: "10.0.4.40", vulnerabilities: 4, misconfigurations: 2, riskSeverity: "medium", exposures: ["App Mesh"] },
        { id: "br-6", name: "node-exporter", arn: "arn:aws:ec2:us-east-1:384:i-metrics", privateIp: "10.0.4.50", vulnerabilities: 3, misconfigurations: 1, riskSeverity: "low", exposures: ["Prometheus"] },
      ],
    },
  },
  "ap-006": {
    name: "Lambda function injection",
    priority: "medium",
    description: "Injection payload via API Gateway triggers vulnerable Lambda function, accessing downstream DynamoDB tables.",
    assets: 5, misconfigurations: 3, vulnerabilities: 6,
    nodes: [
      { id: "internet", label: "Internet", sublabel: "API Client", icon: "internet", x: 80, y: 300 },
      { id: "apigw", label: "API Gateway", sublabel: "rest-api-v2", icon: "cloud", x: 280, y: 300 },
      { id: "lambda", label: "Lambda", sublabel: "fn-process-order", icon: "instance", x: 480, y: 300 },
      { id: "role", label: "IAM Role", sublabel: "lambda-exec-role", icon: "account", x: 680, y: 300 },
      { id: "dynamo", label: "DynamoDB", sublabel: "orders-table", icon: "database", x: 880, y: 300, isVulnerable: true, cve: "CVE-2023-41892" },
    ],
    edges: [
      { from: "internet", to: "apigw" }, { from: "apigw", to: "lambda" },
      { from: "lambda", to: "role" }, { from: "role", to: "dynamo" },
    ],
    blastRadius: {
      totalAssets: 5, totalVulnerabilities: 14, totalMisconfigurations: 7,
      assets: [
        { id: "br-1", name: "orders-table", arn: "arn:aws:dynamodb:us-east-1:384:table/orders", privateIp: "N/A", vulnerabilities: 5, misconfigurations: 2, riskSeverity: "high", exposures: ["DynamoDB"] },
        { id: "br-2", name: "users-table", arn: "arn:aws:dynamodb:us-east-1:384:table/users", privateIp: "N/A", vulnerabilities: 4, misconfigurations: 2, riskSeverity: "high", exposures: ["DynamoDB"] },
        { id: "br-3", name: "sns-notify-topic", arn: "arn:aws:sns:us-east-1:384:topic/order-notify", privateIp: "N/A", vulnerabilities: 2, misconfigurations: 1, riskSeverity: "medium", exposures: ["SNS"] },
        { id: "br-4", name: "sqs-dlq-orders", arn: "arn:aws:sqs:us-east-1:384:queue/orders-dlq", privateIp: "N/A", vulnerabilities: 2, misconfigurations: 1, riskSeverity: "low", exposures: ["SQS"] },
        { id: "br-5", name: "cloudwatch-logs", arn: "arn:aws:logs:us-east-1:384:log-group/orders", privateIp: "N/A", vulnerabilities: 1, misconfigurations: 1, riskSeverity: "low", exposures: ["CloudWatch"] },
      ],
    },
  },
  "ap-007": {
    name: "RDS snapshot public exposure",
    priority: "high",
    description: "A publicly shared RDS snapshot leaks database credentials, allowing direct access to the production database.",
    assets: 10, misconfigurations: 7, vulnerabilities: 9,
    nodes: [
      { id: "internet", label: "Internet", sublabel: "External", icon: "internet", x: 80, y: 300 },
      { id: "snapshot", label: "RDS Snapshot", sublabel: "snap-public", icon: "database", x: 280, y: 300 },
      { id: "creds", label: "DB Credentials", sublabel: "plaintext", icon: "account", x: 480, y: 300 },
      { id: "rds", label: "RDS Instance", sublabel: "prod-db-master", icon: "database", x: 680, y: 300 },
      { id: "data", label: "Customer Data", sublabel: "PII records", icon: "database", x: 880, y: 300, isVulnerable: true, cve: "CVE-2023-22527" },
    ],
    edges: [
      { from: "internet", to: "snapshot" }, { from: "snapshot", to: "creds" },
      { from: "creds", to: "rds" }, { from: "rds", to: "data" },
    ],
    blastRadius: {
      totalAssets: 10, totalVulnerabilities: 35, totalMisconfigurations: 16,
      assets: [
        { id: "br-1", name: "prod-db-master", arn: "arn:aws:rds:us-east-1:384:db/prod-master", privateIp: "10.0.5.10", vulnerabilities: 9, misconfigurations: 4, riskSeverity: "critical", exposures: ["MySQL 3306"] },
        { id: "br-2", name: "prod-db-replica", arn: "arn:aws:rds:us-east-1:384:db/prod-replica", privateIp: "10.0.5.20", vulnerabilities: 7, misconfigurations: 3, riskSeverity: "critical", exposures: ["MySQL 3306"] },
        { id: "br-3", name: "db-proxy-rds", arn: "arn:aws:rds:us-east-1:384:db-proxy/prod", privateIp: "10.0.5.30", vulnerabilities: 5, misconfigurations: 2, riskSeverity: "high", exposures: ["RDS Proxy"] },
        { id: "br-4", name: "backup-vault", arn: "arn:aws:backup:us-east-1:384:vault/prod-db", privateIp: "N/A", vulnerabilities: 3, misconfigurations: 2, riskSeverity: "medium", exposures: ["Backup"] },
        { id: "br-5", name: "dms-replication", arn: "arn:aws:dms:us-east-1:384:rep/prod-migration", privateIp: "10.0.5.40", vulnerabilities: 4, misconfigurations: 2, riskSeverity: "high", exposures: ["DMS"] },
        { id: "br-6", name: "param-store-db", arn: "arn:aws:ssm:us-east-1:384:parameter/db-creds", privateIp: "N/A", vulnerabilities: 3, misconfigurations: 1, riskSeverity: "medium", exposures: ["SSM Parameter"] },
        { id: "br-7", name: "audit-trail-db", arn: "arn:aws:cloudtrail:us-east-1:384:trail/db-audit", privateIp: "N/A", vulnerabilities: 2, misconfigurations: 1, riskSeverity: "low", exposures: ["CloudTrail"] },
        { id: "br-8", name: "perf-insights", arn: "arn:aws:pi:us-east-1:384:metrics/prod-db", privateIp: "N/A", vulnerabilities: 2, misconfigurations: 1, riskSeverity: "low", exposures: ["PI"] },
      ],
    },
  },
};

export const DEFAULT_PATH: AttackPathData = {
  name: "Unknown Attack Path", priority: "medium",
  description: "Attack path details unavailable.",
  assets: 0, misconfigurations: 0, vulnerabilities: 0,
  nodes: [
    { id: "internet", label: "Internet", sublabel: "External", icon: "internet", x: 80, y: 300 },
    { id: "cloud", label: "Cloud", sublabel: "AWS", icon: "cloud", x: 280, y: 300 },
    { id: "account", label: "AWS Account", sublabel: "unknown", icon: "account", x: 480, y: 300 },
    { id: "region", label: "Region", sublabel: "us-east-1", icon: "region", x: 680, y: 300 },
    { id: "ec2", label: "EC2 Instance", sublabel: "unknown", icon: "instance", x: 880, y: 300, isVulnerable: true, cve: "CVE-2018-15133" },
  ],
  edges: [
    { from: "internet", to: "cloud" }, { from: "cloud", to: "account" },
    { from: "account", to: "region" }, { from: "region", to: "ec2" },
  ],
  blastRadius: {
    totalAssets: 3, totalVulnerabilities: 12, totalMisconfigurations: 5,
    assets: [
      { id: "br-1", name: "unknown-asset-01", arn: "arn:aws:ec2:us-east-1:000:i-unknown01", privateIp: "10.0.1.220", vulnerabilities: 5, misconfigurations: 2, riskSeverity: "medium", exposures: ["Unknown"] },
      { id: "br-2", name: "unknown-asset-02", arn: "arn:aws:ec2:us-east-1:000:i-unknown02", privateIp: "10.0.1.230", vulnerabilities: 4, misconfigurations: 2, riskSeverity: "low", exposures: ["Unknown"] },
      { id: "br-3", name: "unknown-asset-03", arn: "arn:aws:ec2:us-east-1:000:i-unknown03", privateIp: "10.0.1.240", vulnerabilities: 3, misconfigurations: 1, riskSeverity: "low", exposures: ["Unknown"] },
    ],
  },
};

/* ================================================================
   ICON / COLOR MAPS
   ================================================================ */

export const nodeIconMap: Record<string, React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }>> = {
  internet: Globe, cloud: Cloud, account: Shield, region: Server,
  instance: Server, database: Database, vuln: AlertTriangle,
};

export const nodeColorMap: Record<string, string> = {
  internet: colors.accent, cloud: colors.accent, account: colors.active,
  region: colors.active, instance: colors.high, database: "#d946ef", vuln: colors.critical,
};

export const severityAccent: Record<string, string> = { critical: colors.critical, high: colors.high, medium: colors.medium, low: colors.low };

/* ================================================================
   MOCK EXPOSURE DATA — per-asset network exposure entries
   ================================================================ */

export const ASSET_EXPOSURES: Record<string, string[]> = {
  "br-1": [
    "Outbound all ports to any IP via security group sg-0a3c7d",
    "Network topology cross subnet communication via VPC peering",
    "Same VPC communication to 10.0.0.0/16",
    "Outbound access via office IPs (203.0.113.0/24)",
    "Inbound TCP ports 443, 8080 via EKS cluster security group",
  ],
  "br-2": [
    "Inbound MySQL 3306 from EC2 instances in same subnet",
    "Cross-AZ replication traffic on port 3307",
    "Same VPC communication to 10.0.0.0/16",
    "Outbound access to S3 VPC endpoint",
  ],
  "br-3": [
    "Inbound HTTPS 443 from public internet via ALB",
    "Outbound to Lambda functions via VPC endpoint",
    "API rate limiting bypass via misconfigured throttle",
  ],
  "br-4": [
    "Inbound gRPC 9090 from API gateway",
    "Outbound to Redis cache on port 6379",
    "Same VPC communication to 10.0.0.0/16",
    "JWT token validation endpoint exposed",
  ],
  "br-5": [
    "Inbound Redis 6379 from auth-service and worker-queue",
    "No encryption in transit configured",
  ],
  "br-6": [
    "Inbound SQS messages from EC2 producer instances",
    "Outbound to Lambda consumer functions",
    "Cross-account access via IAM role assumption",
  ],
  "br-7": [
    "Outbound CloudWatch logs delivery",
    "Invocation from EventBridge scheduled rules",
  ],
  "br-8": [
    "Public read access via bucket policy misconfiguration",
    "Cross-account replication to backup account",
    "VPC endpoint access from production subnets",
    "S3 event notifications to SNS topic",
  ],
};

export function getAssetExposures(assetId: string): string[] {
  return ASSET_EXPOSURES[assetId] ?? [];
}
