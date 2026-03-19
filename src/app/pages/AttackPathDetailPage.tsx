import React, { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router";
import { ArrowLeft, ZoomIn, ZoomOut, Shield, Globe, Cloud, Server, Database, AlertTriangle, RotateCcw, Zap, ChevronDown, Crosshair, Bug, Settings2, X, ExternalLink, Network, Copy, Check, FileText } from "lucide-react";
import { colors } from "../shared/design-system/tokens";
import { Badge } from "../shared/components/ui/Badge";
import { useAiBox } from "../features/ai-box";
import { getPersonaAiBoxSuggestions } from "../shared/skills";
import { usePersona } from "../features/persona";
import { getControlsForPath } from "../shared/entity-graph";

/* ================================================================
   TYPES
   ================================================================ */

interface PathNode {
  id: string;
  label: string;
  sublabel?: string;
  icon: "internet" | "cloud" | "account" | "region" | "instance" | "database" | "vuln";
  x: number;
  y: number;
  isVulnerable?: boolean;
  cve?: string;
}

interface PathEdge { from: string; to: string; }

interface BlastRadiusAsset {
  id: string;
  name: string;
  arn: string;
  privateIp: string;
  vulnerabilities: number;
  misconfigurations: number;
  riskSeverity: "critical" | "high" | "medium" | "low";
  exposures: string[];
}

interface BlastRadiusData {
  totalAssets: number;
  totalVulnerabilities: number;
  totalMisconfigurations: number;
  assets: BlastRadiusAsset[];
}

interface AttackPathData {
  name: string;
  priority: "critical" | "high" | "medium" | "low";
  description: string;
  assets: number;
  misconfigurations: number;
  vulnerabilities: number;
  nodes: PathNode[];
  edges: PathEdge[];
  blastRadius: BlastRadiusData;
}

/* ================================================================
   MOCK DATA — attack paths
   ================================================================ */

const ATTACK_PATHS: Record<string, AttackPathData> = {
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

const DEFAULT_PATH: AttackPathData = {
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

const nodeIconMap: Record<string, React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }>> = {
  internet: Globe, cloud: Cloud, account: Shield, region: Server,
  instance: Server, database: Database, vuln: AlertTriangle,
};

const nodeColorMap: Record<string, string> = {
  internet: colors.accent, cloud: colors.accent, account: colors.active,
  region: colors.active, instance: colors.high, database: "#d946ef", vuln: colors.critical,
};

const severityAccent: Record<string, string> = { critical: colors.critical, high: colors.high, medium: colors.medium, low: colors.low };

/* ================================================================
   MOCK EXPOSURE DATA — per-asset network exposure entries
   ================================================================ */

const ASSET_EXPOSURES: Record<string, string[]> = {
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

function getAssetExposures(assetId: string): string[] {
  return ASSET_EXPOSURES[assetId] || [
    "Outbound all ports to any IP via default security group",
    "Same VPC communication via subnet routing",
    "Inbound SSH port 22 from bastion host",
  ];
}

/* ================================================================
   GRAPH CANVAS — constants & layout engine
   ================================================================ */

const GRID_SIZE = 30;
const NODE_W = 108;
const NODE_H = 68;
const VULN_NODE_W = 210;
const VULN_NODE_H = 188;
const VULN_KEV_H = 26; /* KEV badge height above card */
const VULN_KEV_GAP = 8;
const H_SPACING = 200;
const V_PAIR_SPACING = 120;
const MIN_ZOOM = 0.6;
const MAX_ZOOM = 2.0;
const FIT_PADDING = 48;
const FIT_ZOOM_MIN = 0.8;
const FIT_ZOOM_MAX = 1.0;
const ZOOM_STEP_BUTTON = 0.2;
const ZOOM_SENSITIVITY = 0.0012;
const PAN_MARGIN_RATIO = 0.25;

/* Blast radius pill (compact trigger to the right of vuln card) */
const BR_PILL_W = 136;
const BR_PILL_H = 40;
const BR_PILL_GAP_X = 28;

/* Vuln info card dimensions (used for attack chain overlay below card) */
const VULN_CARD_W = VULN_NODE_W;
const VULN_CARD_H = VULN_NODE_H;
const VULN_CARD_GAP_Y = 14;
const VULN_CARD_ARROW_H = 32;

/* Attack chain overlay dimensions */
const CHAIN_STEP_H = 36;
const CHAIN_CONNECTOR_H = 20;
const CHAIN_PAD = 10;
const CHAIN_HEADER_H = 30;
const CHAIN_W = 170;
const CHAIN_GAP_Y = 14;

/* Blast radius panel dimensions */
const BR_W = 660;
const BR_GAP_X = 24;
const BR_CARD_MIN = 140;
const BR_CARD_H = 92;
const BR_COLS = 4;
const BR_GRID_GAP = 8;
const BR_HEADER_H = 44;
const BR_SUMMARY_H = 78;
const BR_PANEL_PAD = 14;

interface LayoutResult {
  positions: Map<string, { x: number; y: number }>;
  bbox: { minX: number; minY: number; maxX: number; maxY: number; w: number; h: number };
}

function computeGraphLayout(
  nodes: PathNode[],
  edges: PathEdge[],
): LayoutResult {
  if (nodes.length === 0) {
    return { positions: new Map(), bbox: { minX: 0, minY: 0, maxX: 0, maxY: 0, w: 0, h: 0 } };
  }

  /* --- BFS layering (longest-path) --- */
  const outgoing = new Map<string, string[]>();
  const incoming = new Map<string, string[]>();
  for (const n of nodes) { outgoing.set(n.id, []); incoming.set(n.id, []); }
  for (const e of edges) { outgoing.get(e.from)?.push(e.to); incoming.get(e.to)?.push(e.from); }

  const layer = new Map<string, number>();
  const roots = nodes.filter((n) => (incoming.get(n.id)?.length || 0) === 0);
  if (roots.length === 0) roots.push(nodes[0]);
  const queue: string[] = roots.map((r) => r.id);
  for (const r of roots) layer.set(r.id, 0);

  let head = 0;
  while (head < queue.length) {
    const cur = queue[head++];
    const curLayer = layer.get(cur) || 0;
    for (const next of outgoing.get(cur) || []) {
      const prev = layer.get(next);
      if (prev === undefined || curLayer + 1 > prev) {
        layer.set(next, curLayer + 1);
        queue.push(next);
      }
    }
  }

  const layerGroups = new Map<number, PathNode[]>();
  let maxLayer = 0;
  for (const n of nodes) {
    const l = layer.get(n.id) ?? 0;
    maxLayer = Math.max(maxLayer, l);
    if (!layerGroups.has(l)) layerGroups.set(l, []);
    layerGroups.get(l)!.push(n);
  }

  /* --- Find the vulnerable node to center graph on --- */
  let vulnLayer = -1;
  for (const n of nodes) {
    if (n.isVulnerable) { vulnLayer = layer.get(n.id) ?? -1; break; }
  }
  // If no vulnerable node, center on the middle layer
  if (vulnLayer < 0) vulnLayer = Math.floor(maxLayer / 2);

  /* --- Position nodes with even H_SPACING, centered on the vuln column --- */
  const positions = new Map<string, { x: number; y: number }>();

  for (let l = 0; l <= maxLayer; l++) {
    const group = layerGroups.get(l) || [];
    const count = group.length;
    // Column x: centered so vulnLayer maps to x=0
    const colCenterX = (l - vulnLayer) * H_SPACING;

    if (count === 1) {
      // Single node: vertically centered at y=0
      const nw = group[0].isVulnerable ? VULN_NODE_W : NODE_W;
      const nh = group[0].isVulnerable ? VULN_NODE_H : NODE_H;
      positions.set(group[0].id, {
        x: colCenterX - nw / 2,
        y: -nh / 2,
      });
    } else {
      // Multiple nodes in same layer: stack vertically as pairs
      const totalGroupH = (count - 1) * V_PAIR_SPACING;
      for (let i = 0; i < count; i++) {
        const nw = group[i].isVulnerable ? VULN_NODE_W : NODE_W;
        const nh = group[i].isVulnerable ? VULN_NODE_H : NODE_H;
        positions.set(group[i].id, {
          x: colCenterX - nw / 2,
          y: -totalGroupH / 2 + i * V_PAIR_SPACING - nh / 2,
        });
      }
    }
  }

  /* --- Compute bounding box --- */
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const [id, pos] of positions) {
    const node = nodes.find((n) => n.id === id);
    const nw = node?.isVulnerable ? VULN_NODE_W : NODE_W;
    const nh = node?.isVulnerable ? VULN_NODE_H : NODE_H;
    const topExtra = node?.isVulnerable ? (VULN_KEV_H + VULN_KEV_GAP) : 0;
    minX = Math.min(minX, pos.x);
    minY = Math.min(minY, pos.y - topExtra);
    maxX = Math.max(maxX, pos.x + nw);
    maxY = Math.max(maxY, pos.y + nh);
  }

  return { positions, bbox: { minX, minY, maxX, maxY, w: maxX - minX, h: maxY - minY } };
}

function computeFitView(
  bbox: LayoutResult["bbox"],
  canvasW: number,
  canvasH: number,
): { zoom: number; panX: number; panY: number } {
  if (bbox.w === 0 || bbox.h === 0 || canvasW < 1 || canvasH < 1) {
    return { zoom: 1, panX: canvasW / 2, panY: canvasH / 2 };
  }
  const padW = bbox.w + FIT_PADDING * 2;
  const padH = bbox.h + FIT_PADDING * 2;
  const rawZoom = Math.min(canvasW / padW, canvasH / padH);
  const fitZoom = Math.max(FIT_ZOOM_MIN, Math.min(rawZoom, FIT_ZOOM_MAX));
  const cx = bbox.minX + bbox.w / 2;
  const cy = bbox.minY + bbox.h / 2;
  return { zoom: fitZoom, panX: canvasW / 2 - cx * fitZoom, panY: canvasH / 2 - cy * fitZoom };
}

/**
 * Clamp pan so the graph bbox (in screen coords) cannot be dragged
 * entirely off the visible canvas. Allows PAN_MARGIN_RATIO overshoot
 * on each side so the user still has comfortable breathing room.
 */
function clampPan(
  px: number,
  py: number,
  z: number,
  bbox: LayoutResult["bbox"],
  canvasW: number,
  canvasH: number,
): { x: number; y: number } {
  if (bbox.w === 0 || bbox.h === 0 || canvasW < 1 || canvasH < 1) return { x: px, y: py };

  const scaledW = bbox.w * z;
  const scaledH = bbox.h * z;
  const marginX = Math.max(scaledW * PAN_MARGIN_RATIO, 60);
  const marginY = Math.max(scaledH * PAN_MARGIN_RATIO, 60);

  // Screen-x of graph right edge = bbox.maxX * z + panX  ≥  -marginX
  // Screen-x of graph left  edge = bbox.minX * z + panX  ≤  canvasW + marginX
  const minPanX = -bbox.maxX * z - marginX;
  const maxPanX = canvasW + marginX - bbox.minX * z;
  const minPanY = -bbox.maxY * z - marginY;
  const maxPanY = canvasH + marginY - bbox.minY * z;

  return {
    x: Math.max(minPanX, Math.min(px, maxPanX)),
    y: Math.max(minPanY, Math.min(py, maxPanY)),
  };
}

/* ================================================================
   ATTACK CHAIN — derive longest root→target path
   ================================================================ */

interface ChainStep {
  nodeId: string;
  label: string;
  icon: string;
  isVulnerable: boolean;
  cve?: string;
}

function computeAttackChainToNode(
  targetId: string,
  nodes: PathNode[],
  edges: PathEdge[],
): ChainStep[] {
  if (nodes.length === 0) return [];
  const incoming = new Map<string, string[]>();
  for (const n of nodes) incoming.set(n.id, []);
  for (const e of edges) incoming.get(e.to)?.push(e.from);
  const nodeMap = new Map(nodes.map((n) => [n.id, n]));
  let bestPath: string[] = [];

  function dfs(nodeId: string, path: string[], visited: Set<string>) {
    path.push(nodeId);
    visited.add(nodeId);
    const preds = incoming.get(nodeId) || [];
    if (preds.length === 0 || preds.every((p) => visited.has(p))) {
      if (path.length > bestPath.length) bestPath = [...path];
    } else {
      for (const pred of preds) {
        if (!visited.has(pred)) dfs(pred, path, visited);
      }
    }
    path.pop();
    visited.delete(nodeId);
  }

  dfs(targetId, [], new Set());
  bestPath.reverse();

  return bestPath
    .map((id) => {
      const n = nodeMap.get(id);
      if (!n) return null;
      return { nodeId: n.id, label: n.label, icon: n.icon, isVulnerable: !!n.isVulnerable, cve: n.cve };
    })
    .filter((s): s is ChainStep => !!s);
}

function computeChainPanelHeight(stepCount: number): number {
  const totalSteps = stepCount + 1;
  const totalConnectors = totalSteps - 1;
  return CHAIN_HEADER_H + CHAIN_PAD + totalSteps * CHAIN_STEP_H + totalConnectors * CHAIN_CONNECTOR_H + CHAIN_PAD;
}

function computeBRPanelHeight(assetCount: number): number {
  const rows = Math.ceil(assetCount / BR_COLS);
  const gridH = rows * BR_CARD_H + Math.max(0, rows - 1) * BR_GRID_GAP;
  return BR_HEADER_H + BR_SUMMARY_H + gridH + BR_PANEL_PAD * 3;
}

/* ================================================================
   EXPLOIT FLOW — compute primary attack path edge sequence
   ================================================================ */

function computeExploitFlow(nodes: PathNode[], edges: PathEdge[]): PathEdge[] {
  const entryNode = nodes.find((n) => n.icon === "internet") || nodes[0];
  const vulnNode = nodes.find((n) => n.isVulnerable);
  if (!entryNode || !vulnNode) return [];

  const adj: Record<string, string[]> = {};
  edges.forEach((e) => {
    if (!adj[e.from]) adj[e.from] = [];
    adj[e.from].push(e.to);
  });

  /* BFS: entry → vulnNode */
  const parent: Record<string, string | null> = {};
  parent[entryNode.id] = null;
  const bfsQueue = [entryNode.id];
  let head = 0;
  while (head < bfsQueue.length) {
    const c = bfsQueue[head++];
    if (c === vulnNode.id) break;
    for (const next of adj[c] || []) {
      if (!(next in parent)) {
        parent[next] = c;
        bfsQueue.push(next);
      }
    }
  }

  const pathEdges: PathEdge[] = [];
  let cur: string | null = vulnNode.id;
  while (cur !== null && parent[cur] !== undefined && parent[cur] !== null) {
    pathEdges.unshift({ from: parent[cur]!, to: cur });
    cur = parent[cur]!;
  }

  for (const t of adj[vulnNode.id] || []) {
    pathEdges.push({ from: vulnNode.id, to: t });
  }
  return pathEdges;
}

/* ================================================================
   REVEAL ANIMATION — compute ordered node sequence from flow edges
   ================================================================ */

function computeRevealSequence(flowEdges: PathEdge[]): string[] {
  if (flowEdges.length === 0) return [];
  const seq = [flowEdges[0].from];
  for (const e of flowEdges) {
    if (seq[seq.length - 1] !== e.to) seq.push(e.to);
  }
  return seq;
}

/* Evaluate a cubic Bézier at parameter t */
function evalCubicBezier(t: number, p0: number, p1: number, p2: number, p3: number): number {
  const mt = 1 - t;
  return mt * mt * mt * p0 + 3 * mt * mt * t * p1 + 3 * mt * t * t * p2 + t * t * t * p3;
}

/* ================================================================
   EXPLOIT FLOW PULSE — animated dot traveling the attack path
   ================================================================ */

interface FlowSegment {
  x1: number; y1: number;
  cp1x: number; cp1y: number;
  cp2x: number; cp2y: number;
  x2: number; y2: number;
  isExploit: boolean;
}

const PULSE_SEGMENT_DUR = 1100;
const PULSE_TRAIL_COUNT = 4;

function ExploitFlowPulse({
  flowEdges, nodes, getPos, gradientId, isHighlighted,
}: {
  flowEdges: PathEdge[];
  nodes: PathNode[];
  getPos: (id: string) => { x: number; y: number };
  gradientId: string;
  isHighlighted: boolean;
}) {
  const groupRef = useRef<SVGGElement>(null);
  const rafRef = useRef<number>(0);
  const highlightRef = useRef(isHighlighted);
  highlightRef.current = isHighlighted;

  const segments = useMemo<FlowSegment[]>(() => {
    const nodeMap = new Map(nodes.map((n) => [n.id, n]));
    return flowEdges.map((edge) => {
      const fromNode = nodeMap.get(edge.from);
      const toNode = nodeMap.get(edge.to);
      const fW = fromNode?.isVulnerable ? VULN_NODE_W : NODE_W;
      const fH = fromNode?.isVulnerable ? VULN_NODE_H : NODE_H;
      const tW = toNode?.isVulnerable ? VULN_NODE_W : NODE_W;
      const tH = toNode?.isVulnerable ? VULN_NODE_H : NODE_H;
      const fp = getPos(edge.from);
      const tp = getPos(edge.to);
      const x1 = fp.x + fW / 2, y1 = fp.y + fH / 2;
      const x2 = tp.x + tW / 2, y2 = tp.y + tH / 2;
      const dx = x2 - x1;
      return {
        x1, y1, cp1x: x1 + dx * 0.45, cp1y: y1,
        cp2x: x2 - dx * 0.45, cp2y: y2, x2, y2,
        isExploit: !!fromNode?.isVulnerable || !!toNode?.isVulnerable,
      };
    });
  }, [flowEdges, nodes, getPos]);

  const totalDur = segments.length * PULSE_SEGMENT_DUR;

  useEffect(() => {
    if (segments.length === 0) return;
    const g = groupRef.current;
    if (!g) return;
    let startTime: number | null = null;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = (timestamp - startTime) % totalDur;
      const children = g.children;

      for (let ti = 0; ti <= PULSE_TRAIL_COUNT; ti++) {
        const trailOffset = ti * 45;
        let tElapsed = elapsed - trailOffset;
        if (tElapsed < 0) tElapsed += totalDur;
        const segIdx = Math.min(Math.floor(tElapsed / PULSE_SEGMENT_DUR), segments.length - 1);
        const raw = (tElapsed % PULSE_SEGMENT_DUR) / PULSE_SEGMENT_DUR;
        const te = raw < 0.5 ? 2 * raw * raw : 1 - Math.pow(-2 * raw + 2, 2) / 2;
        const seg = segments[segIdx];
        const px = String(evalCubicBezier(te, seg.x1, seg.cp1x, seg.cp2x, seg.x2));
        const py = String(evalCubicBezier(te, seg.y1, seg.cp1y, seg.cp2y, seg.y2));

        const hi = highlightRef.current;
        const isTail = ti > 0;
        const glowEl = children[ti * 2] as SVGCircleElement | undefined;
        const coreEl = children[ti * 2 + 1] as SVGCircleElement | undefined;
        if (glowEl) {
          glowEl.setAttribute("cx", px);
          glowEl.setAttribute("cy", py);
          const fadeA = isTail ? Math.max(0.08, 0.5 - ti * 0.1) : 1;
          glowEl.setAttribute("opacity", String(fadeA * (hi ? 0.38 : 0.18)));
          glowEl.setAttribute("r", String(hi ? (isTail ? 10 : 16) : (isTail ? 6 : 10)));
        }
        if (coreEl) {
          coreEl.setAttribute("cx", px);
          coreEl.setAttribute("cy", py);
          const coreA = isTail ? Math.max(0.15, 0.75 - ti * 0.15) : 1;
          coreEl.setAttribute("opacity", String(coreA * (hi ? 0.95 : 0.65)));
          coreEl.setAttribute("r", String(hi ? (isTail ? 3 : 5) : (isTail ? 2 : 3.5)));
        }
      }
      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [segments, totalDur]);

  if (segments.length === 0) return null;

  const dots: React.ReactElement[] = [];
  for (let ti = 0; ti <= PULSE_TRAIL_COUNT; ti++) {
    dots.push(
      <circle key={`glow-${ti}`} r={10} fill="#ff6b35" opacity={0.18} filter={`url(#pulse-glow-${gradientId})`} />,
      <circle key={`core-${ti}`} r={3.5} fill="#ff6b35" opacity={0.65} />,
    );
  }
  return <g ref={groupRef}>{dots}</g>;
}

/* ================================================================
   GRAPH CANVAS COMPONENT
   ================================================================ */

function GraphCanvas({
  pathData,
  pathId,
  selectedNodeId,
  onSelectNode,
}: {
  pathData: AttackPathData;
  pathId: string;
  selectedNodeId: string | null;
  onSelectNode: (nodeId: string | null, node?: PathNode) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [canvasSize, setCanvasSize] = useState({ w: 0, h: 0 });
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const panStart = useRef({ x: 0, y: 0, panX: 0, panY: 0 });
  const dragDist = useRef(0);
  const zoomRef = useRef(zoom);
  zoomRef.current = zoom;
  const hasAutoFit = useRef(false);
  const [autoFitDone, setAutoFitDone] = useState(false);
  const animTimer = useRef<ReturnType<typeof setTimeout>>();
  const panRafId = useRef(0);

  /* Hover: ref-based (no React re-renders on pointer move) */
  const hoveredNodeRef = useRef<string | null>(null);

  /* Expansion state: attack chain + blast radius */
  const [showAttackChain, setShowAttackChain] = useState(false);
  const [showBlastRadius, setShowBlastRadius] = useState(false);
  /* Keep kevExpandedNodeId derived from the vulnerable node for compatibility */
  const vulnNode = useMemo(() => pathData.nodes.find((n) => n.isVulnerable), [pathData.nodes]);
  const kevExpandedNodeId = vulnNode?.id || null;

  /* Asset inspection (Insights panel) state */
  const [inspectedAsset, setInspectedAsset] = useState<BlastRadiusAsset | null>(null);

  const handleSelectAsset = useCallback((asset: BlastRadiusAsset) => {
    setInspectedAsset(asset);
  }, []);

  const handleCloseInsights = useCallback(() => {
    setInspectedAsset(null);
  }, []);

  const toggleAttackChain = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setShowAttackChain((prev) => {
      if (prev) setShowBlastRadius(false);
      return !prev;
    });
  }, []);

  const toggleBlastRadius = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setShowBlastRadius((prev) => !prev);
  }, []);

  const attackChain = useMemo(() => {
    if (!kevExpandedNodeId) return [];
    return computeAttackChainToNode(kevExpandedNodeId, pathData.nodes, pathData.edges);
  }, [kevExpandedNodeId, pathData.nodes, pathData.edges]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const r = entries[0];
      if (r) setCanvasSize({ w: r.contentRect.width, h: r.contentRect.height });
    });
    ro.observe(el);
    setCanvasSize({ w: el.clientWidth, h: el.clientHeight });
    return () => ro.disconnect();
  }, []);

  const layout = useMemo(
    () => computeGraphLayout(pathData.nodes, pathData.edges),
    [pathData.nodes, pathData.edges],
  );

  /* Effective bbox — includes blast radius panel when expanded */
  const effectiveBbox = useMemo(() => {
    const bbox = layout.bbox;
    if (!showBlastRadius || !vulnNode) return bbox;
    const vulnPos = layout.positions.get(vulnNode.id);
    if (!vulnPos) return bbox;
    const panelRight = vulnPos.x + VULN_NODE_W + BR_PILL_GAP_X + INLINE_BR_W;
    const brH = computeInlineBRHeight(pathData.blastRadius.assets.length, INLINE_BR_W);
    const panelBottom = vulnPos.y - 10 + brH;
    return {
      ...bbox,
      maxX: Math.max(bbox.maxX, panelRight),
      maxY: Math.max(bbox.maxY, panelBottom),
      w: Math.max(bbox.maxX, panelRight) - bbox.minX,
      h: Math.max(bbox.maxY, panelBottom) - bbox.minY,
    };
  }, [layout, showBlastRadius, vulnNode, pathData.blastRadius.assets.length]);

  /* Refs for clampPan inside event listeners */
  const effectiveBboxRef = useRef(effectiveBbox);
  effectiveBboxRef.current = effectiveBbox;
  const canvasSizeRef = useRef(canvasSize);
  canvasSizeRef.current = canvasSize;

  useEffect(() => {
    if (hasAutoFit.current) return;
    if (canvasSize.w < 50 || canvasSize.h < 50) return;
    if (layout.bbox.w === 0) return;
    hasAutoFit.current = true;
    const fit = computeFitView(layout.bbox, canvasSize.w, canvasSize.h);
    setZoom(fit.zoom);
    setPan({ x: fit.panX, y: fit.panY });
    setAutoFitDone(true);
  }, [canvasSize, layout]);

  const startAnimation = useCallback((durationMs = 320) => {
    setIsAnimating(true);
    clearTimeout(animTimer.current);
    animTimer.current = setTimeout(() => setIsAnimating(false), durationMs);
  }, []);

  const animateToFit = useCallback(() => {
    const bbox = layout.bbox;
    if (bbox.w === 0) return;
    let adjustedBbox = bbox;
    if (showBlastRadius && vulnNode) {
      const vulnPos = layout.positions.get(vulnNode.id);
      if (vulnPos) {
        const panelRight = vulnPos.x + VULN_NODE_W + BR_PILL_GAP_X + INLINE_BR_W;
        const brH = computeInlineBRHeight(pathData.blastRadius.assets.length, INLINE_BR_W);
        const panelBottom = vulnPos.y - 10 + brH;
        adjustedBbox = {
          ...bbox,
          maxX: Math.max(bbox.maxX, panelRight),
          maxY: Math.max(bbox.maxY, panelBottom),
          w: Math.max(bbox.maxX, panelRight) - bbox.minX,
          h: Math.max(bbox.maxY, panelBottom) - bbox.minY,
        };
      }
    }
    const fit = computeFitView(adjustedBbox, canvasSize.w, canvasSize.h);
    startAnimation(350);
    setZoom(fit.zoom);
    setPan({ x: fit.panX, y: fit.panY });
  }, [layout, canvasSize, startAnimation, showBlastRadius, vulnNode, pathData.blastRadius.assets.length]);

  /* Auto-fit when blast radius panel expands/collapses */
  useEffect(() => {
    if (!hasAutoFit.current) return;
    if (canvasSize.w < 50) return;
    const bbox = layout.bbox;
    if (bbox.w === 0) return;
    let adjustedBbox = bbox;
    if (showBlastRadius && vulnNode) {
      const vulnPos = layout.positions.get(vulnNode.id);
      if (vulnPos) {
        const panelRight = vulnPos.x + VULN_NODE_W + BR_PILL_GAP_X + INLINE_BR_W;
        const brH = computeInlineBRHeight(pathData.blastRadius.assets.length, INLINE_BR_W);
        const panelBottom = vulnPos.y - 10 + brH;
        adjustedBbox = {
          ...bbox,
          maxX: Math.max(bbox.maxX, panelRight),
          maxY: Math.max(bbox.maxY, panelBottom),
          w: Math.max(bbox.maxX, panelRight) - bbox.minX,
          h: Math.max(bbox.maxY, panelBottom) - bbox.minY,
        };
      }
    }
    const fit = computeFitView(adjustedBbox, canvasSize.w, canvasSize.h);
    startAnimation(380);
    setZoom(fit.zoom);
    setPan({ x: fit.panX, y: fit.panY });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showBlastRadius]);

  const handleZoomIn = useCallback(() => {
    startAnimation(280);
    setZoom((z) => {
      const nz = Math.min(z + ZOOM_STEP_BUTTON, MAX_ZOOM);
      const s = nz / z;
      const cx = canvasSize.w / 2, cy = canvasSize.h / 2;
      setPan((p) => {
        const rawX = cx - (cx - p.x) * s;
        const rawY = cy - (cy - p.y) * s;
        return clampPan(rawX, rawY, nz, effectiveBboxRef.current, canvasSize.w, canvasSize.h);
      });
      return nz;
    });
  }, [canvasSize, startAnimation]);

  const handleZoomOut = useCallback(() => {
    startAnimation(280);
    setZoom((z) => {
      const nz = Math.max(z - ZOOM_STEP_BUTTON, MIN_ZOOM);
      const s = nz / z;
      const cx = canvasSize.w / 2, cy = canvasSize.h / 2;
      setPan((p) => {
        const rawX = cx - (cx - p.x) * s;
        const rawY = cy - (cy - p.y) * s;
        return clampPan(rawX, rawY, nz, effectiveBboxRef.current, canvasSize.w, canvasSize.h);
      });
      return nz;
    });
  }, [canvasSize, startAnimation]);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const delta = e.ctrlKey ? -e.deltaY * 2 : -e.deltaY;
    const factor = Math.exp(delta * ZOOM_SENSITIVITY);
    const cursorX = e.clientX - rect.left;
    const cursorY = e.clientY - rect.top;
    setZoom((prev) => {
      const next = Math.max(MIN_ZOOM, Math.min(prev * factor, MAX_ZOOM));
      const s = next / prev;
      setPan((p) => {
        const rawX = cursorX - (cursorX - p.x) * s;
        const rawY = cursorY - (cursorY - p.y) * s;
        return clampPan(rawX, rawY, next, effectiveBboxRef.current, canvasSizeRef.current.w, canvasSizeRef.current.h);
      });
      return next;
    });
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return;
    setIsPanning(true);
    setIsAnimating(false);
    dragDist.current = 0;
    panStart.current = { x: e.clientX, y: e.clientY, panX: pan.x, panY: pan.y };
  }, [pan]);

  useEffect(() => {
    const move = (e: MouseEvent) => {
      if (!isPanning) return;
      const dx = e.clientX - panStart.current.x;
      const dy = e.clientY - panStart.current.y;
      dragDist.current = Math.sqrt(dx * dx + dy * dy);
      if (dragDist.current > 4) hoveredNodeRef.current = null;
      // RAF-throttle: only one setPan per animation frame
      if (panRafId.current) return;
      panRafId.current = requestAnimationFrame(() => {
        panRafId.current = 0;
        const ddx = e.clientX - panStart.current.x;
        const ddy = e.clientY - panStart.current.y;
        const rawX = panStart.current.panX + ddx;
        const rawY = panStart.current.panY + ddy;
        const clamped = clampPan(rawX, rawY, zoomRef.current, effectiveBboxRef.current, canvasSizeRef.current.w, canvasSizeRef.current.h);
        setPan(clamped);
      });
    };
    const up = () => {
      setIsPanning(false);
      if (panRafId.current) { cancelAnimationFrame(panRafId.current); panRafId.current = 0; }
    };
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
    return () => { window.removeEventListener("mousemove", move); window.removeEventListener("mouseup", up); };
  }, [isPanning]);

  const handleCanvasClick = useCallback(() => {
    if (dragDist.current < 5) onSelectNode(null);
  }, [onSelectNode]);

  const handleNodeClick = useCallback((e: React.MouseEvent, node: PathNode) => {
    e.stopPropagation();
    if (dragDist.current < 5) {
      onSelectNode(selectedNodeId === node.id ? null : node.id, node);
    }
  }, [onSelectNode, selectedNodeId]);

  const connectedEdgeKeys = useMemo(() => {
    if (!selectedNodeId) return new Set<string>();
    const keys = new Set<string>();
    pathData.edges.forEach((edge) => {
      if (edge.from === selectedNodeId || edge.to === selectedNodeId) keys.add(`${edge.from}-${edge.to}`);
    });
    return keys;
  }, [selectedNodeId, pathData.edges]);

  /* hoveredEdgeKeys removed — hover no longer triggers React state/re-renders */

  /* Exploit flow path for animated pulse */
  const exploitFlowEdges = useMemo(
    () => computeExploitFlow(pathData.nodes, pathData.edges),
    [pathData.nodes, pathData.edges],
  );
  const exploitFlowKeys = useMemo(
    () => new Set(exploitFlowEdges.map((e) => `${e.from}-${e.to}`)),
    [exploitFlowEdges],
  );

  /* ---- Precomputed node index for O(1) lookups (avoids .find() in edge loop) ---- */
  const nodeById = useMemo(() => {
    const m = new Map<string, PathNode>();
    for (const n of pathData.nodes) m.set(n.id, n);
    return m;
  }, [pathData.nodes]);

  /* ---- Progressive reveal animation ---- */
  const prefersReducedMotion = useMemo(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    [],
  );
  const revealSequence = useMemo(
    () => computeRevealSequence(exploitFlowEdges),
    [exploitFlowEdges],
  );
  const revealSequenceSet = useMemo(() => new Set(revealSequence), [revealSequence]);
  const totalRevealSteps = revealSequence.length;
  const [revealedCount, setRevealedCount] = useState(() => prefersReducedMotion ? totalRevealSteps : 0);
  const [revealFinished, setRevealFinished] = useState(prefersReducedMotion);
  const revealComplete = revealFinished;
  const revealRan = useRef(prefersReducedMotion);

  useEffect(() => {
    if (revealRan.current) return;
    if (!autoFitDone) return;
    revealRan.current = true;
    const STEP_INTERVAL = 470;
    let step = 0;
    const reveal = () => {
      step++;
      setRevealedCount(step);
      if (step < totalRevealSteps) {
        timerId = window.setTimeout(reveal, STEP_INTERVAL);
      } else {
        // Delay revealFinished so the last node's entrance animation can play
        timerId = window.setTimeout(() => setRevealFinished(true), 500);
      }
    };
    let timerId = window.setTimeout(reveal, 180);
    return () => window.clearTimeout(timerId);
  }, [autoFitDone, totalRevealSteps]);

  const revealedNodeSet = useMemo(() => {
    const s = new Set<string>();
    for (let i = 0; i < revealedCount && i < revealSequence.length; i++) {
      s.add(revealSequence[i]);
    }
    return s;
  }, [revealedCount, revealSequence]);

  const revealedEdgeSet = useMemo(() => {
    const s = new Set<string>();
    for (let i = 1; i < revealedCount && i < revealSequence.length; i++) {
      s.add(`${revealSequence[i - 1]}-${revealSequence[i]}`);
    }
    return s;
  }, [revealedCount, revealSequence]);

  const justRevealedId = revealedCount > 0 && revealedCount <= revealSequence.length
    ? revealSequence[revealedCount - 1]
    : null;
  const justRevealedEdge = revealedCount >= 2 && revealedCount <= revealSequence.length
    ? `${revealSequence[revealedCount - 2]}-${revealSequence[revealedCount - 1]}`
    : null;

  const isKevActive = showAttackChain;
  const shouldPulseGlow = !showBlastRadius && !showAttackChain;

  const gradientId = React.useId();

  const getPos = useCallback(
    (nodeId: string) => layout.positions.get(nodeId) || { x: 0, y: 0 },
    [layout],
  );

  const gTransitionStyle: React.CSSProperties | undefined = isAnimating
    ? { transition: "transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)" }
    : undefined;

  return (
    <div
      ref={containerRef}
      className="relative flex-1 rounded-[18px] border overflow-hidden select-none"
      style={{ backgroundColor: colors.bgApp, borderColor: colors.border, cursor: isPanning ? "grabbing" : "grab" }}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onClick={handleCanvasClick}
    >
      <svg className="absolute inset-0 w-full h-full" style={{ minHeight: "100%" }}>
        <defs>
          <pattern id={`grid-${gradientId}`} width={GRID_SIZE} height={GRID_SIZE} patternUnits="userSpaceOnUse" patternTransform={`translate(${pan.x % GRID_SIZE},${pan.y % GRID_SIZE})`}>
            <path d={`M ${GRID_SIZE} 0 L 0 0 0 ${GRID_SIZE}`} fill="none" stroke="rgba(87,177,255,0.06)" strokeWidth="0.5" />
          </pattern>
          <filter id={`glow-${gradientId}`}>
            <feGaussianBlur stdDeviation="4" result="coloredBlur" />
            <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id={`selected-glow-${gradientId}`}>
            <feGaussianBlur stdDeviation="6" result="coloredBlur" />
            <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          {/* hover-glow filter removed — hover no longer triggers animations */}
          <radialGradient id={`vuln-glow-${gradientId}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ff4d4f" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#ff4d4f" stopOpacity="0" />
          </radialGradient>
          <filter id={`pulse-glow-${gradientId}`}>
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <radialGradient id={`pulse-grad-${gradientId}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ff8a40" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#ff4d4f" stopOpacity="0" />
          </radialGradient>
        </defs>

        <rect width="100%" height="100%" fill={`url(#grid-${gradientId})`} />

        <g transform={`translate(${pan.x},${pan.y}) scale(${zoom})`} style={gTransitionStyle}>
          {/* ---- Edges ---- */}
          {pathData.edges.map((edge) => {
            const fromNode = nodeById.get(edge.from);
            const toNode = nodeById.get(edge.to);
            const fromNW = fromNode?.isVulnerable ? VULN_NODE_W : NODE_W;
            const fromNH = fromNode?.isVulnerable ? VULN_NODE_H : NODE_H;
            const toNW = toNode?.isVulnerable ? VULN_NODE_W : NODE_W;
            const toNH = toNode?.isVulnerable ? VULN_NODE_H : NODE_H;
            const fromPos = getPos(edge.from);
            const toPos = getPos(edge.to);
            const x1 = fromPos.x + fromNW / 2, y1 = fromPos.y + fromNH / 2;
            const x2 = toPos.x + toNW / 2, y2 = toPos.y + toNH / 2;
            const dx = x2 - x1;
            const cp1x = x1 + dx * 0.45;
            const cp2x = x2 - dx * 0.45;

            const isExploitPath = !!fromNode?.isVulnerable || !!toNode?.isVulnerable;
            const edgeKey = `${edge.from}-${edge.to}`;
            const isHighlighted = connectedEdgeKeys.has(edgeKey);
            const isOnFlowPath = exploitFlowKeys.has(edgeKey);
            const isFlowActive = isOnFlowPath && isKevActive;

            /* Color & width adapt to state */
            let edgeColor: string;
            let edgeWidth: number;
            let dashArray: string | undefined;
            let filterUrl: string | undefined;

            if (isHighlighted) {
              edgeColor = "#57b1ff";
              edgeWidth = 3.5;
              filterUrl = `url(#selected-glow-${gradientId})`;
            } else if (isFlowActive && isExploitPath) {
              /* Exploit segment + KEV active = bright red-orange glow */
              edgeColor = "#ff5533";
              edgeWidth = 3;
              filterUrl = `url(#glow-${gradientId})`;
            } else if (isFlowActive) {
              /* Entry segment of flow + KEV active = brighter blue */
              edgeColor = "rgba(87,177,255,0.55)";
              edgeWidth = 2;
              dashArray = "6 4";
              filterUrl = `url(#glow-${gradientId})`;
            } else if (isExploitPath) {
              edgeColor = "#ff4d4f";
              edgeWidth = 2.5;
              filterUrl = `url(#glow-${gradientId})`;
            } else if (isOnFlowPath) {
              /* Entry path on flow route — slightly brighter than non-flow */
              edgeColor = "rgba(87,177,255,0.38)";
              edgeWidth = 1.5;
              dashArray = "6 4";
            } else {
              edgeColor = "rgba(87,177,255,0.22)";
              edgeWidth = 1.2;
              dashArray = "6 4";
            }

            /* Hover-based edge highlighting removed — only selection + attack-path triggers */
            const showGlowUnderlay = isHighlighted || isExploitPath || isFlowActive;

            /* ---- Reveal animation for edges ---- */
            const isOnRevealPath = revealSequenceSet.has(edge.from) && revealSequenceSet.has(edge.to);
            const isEdgeRevealed = revealComplete || !isOnRevealPath || revealedEdgeSet.has(edgeKey);
            const isJustRevealed = justRevealedEdge === edgeKey;
            // Approximate Bézier arc length for dash draw animation
            const approxLen = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2) * 1.2;

            const pathD = `M ${x1} ${y1} C ${cp1x} ${y1}, ${cp2x} ${y2}, ${x2} ${y2}`;

            return (
              <g key={edgeKey} style={{
                opacity: isEdgeRevealed ? 1 : 0,
                transition: "opacity 200ms ease",
              }}>
                {showGlowUnderlay && (
                  <path
                    d={pathD}
                    fill="none"
                    stroke={
                      isHighlighted ? "rgba(87,177,255,0.2)"
                        : isFlowActive && isExploitPath ? "rgba(255,77,79,0.22)"
                        : isFlowActive ? "rgba(87,177,255,0.12)"
                        : "rgba(255,77,79,0.12)"
                    }
                    strokeWidth={isHighlighted ? 10 : isFlowActive ? 10 : 8}
                    strokeLinecap="round"
                    style={{ transition: "stroke 150ms ease, opacity 150ms ease" }}
                  />
                )}
                <path
                  d={pathD}
                  fill="none"
                  stroke={edgeColor}
                  strokeWidth={edgeWidth}
                  strokeDasharray={isJustRevealed ? `${approxLen}` : dashArray}
                  strokeLinecap="round"
                  filter={filterUrl}
                  style={isJustRevealed ? {
                    ["--edge-length" as string]: approxLen,
                    animation: `reveal-edge-draw 200ms ease-out forwards`,
                  } : { transition: "stroke 150ms ease, opacity 150ms ease" }}
                />
                <ArrowHead x={x2} y={y2} fromX={cp2x} fromY={y2} color={edgeColor} nodeW={toNW} nodeH={toNH} />
              </g>
            );
          })}

          {/* ---- Exploit Flow Animated Pulse (only after reveal completes) ---- */}
          {revealComplete && (
            <ExploitFlowPulse
              flowEdges={exploitFlowEdges}
              nodes={pathData.nodes}
              getPos={getPos}
              gradientId={gradientId}
              isHighlighted={isKevActive}
            />
          )}

          {/* ---- Simple Nodes (non-vulnerable) ---- */}
          {pathData.nodes.filter((n) => !n.isVulnerable).map((node) => {
            const pos = getPos(node.id);
            const Icon = nodeIconMap[node.icon] || Server;
            const accentColor = nodeColorMap[node.icon] || "#57b1ff";
            const cx = pos.x + NODE_W / 2;
            const cy = pos.y + NODE_H / 2;
            const isSelected = selectedNodeId === node.id;
            const isNodeRevealed = revealComplete || !revealSequenceSet.has(node.id) || revealedNodeSet.has(node.id);
            const isNodeJustRevealed = justRevealedId === node.id && !revealComplete;

            /* Derive visual states from selection only (no hover re-renders) */
            const borderStroke = isSelected
              ? "#57b1ff"
              : `${accentColor}45`;
            const borderWidth = isSelected ? 1.5 : 1;
            const bgFill = isSelected
              ? "rgba(87,177,255,0.08)"
              : "rgba(6,12,20,0.92)";

            return (
              <g
                key={node.id}
                style={{
                  cursor: "pointer",
                  opacity: isNodeRevealed ? 1 : 0,
                  transition: "opacity 150ms ease",
                }}
                onClick={(e) => handleNodeClick(e, node)}
              >
                {/* Reveal flash glow */}
                {isNodeJustRevealed && (
                  <circle cx={cx} cy={cy} r={50} fill={`${accentColor}00`} stroke={accentColor} strokeWidth={2} opacity={0}>
                    <animate attributeName="r" values="20;55" dur="0.4s" fill="freeze" />
                    <animate attributeName="opacity" values="0.5;0" dur="0.4s" fill="freeze" />
                  </circle>
                )}
                {/* Selection glow ring — GPU-friendly opacity animation */}
                <rect
                  x={pos.x - 5} y={pos.y - 5} width={NODE_W + 10} height={NODE_H + 10} rx={15}
                  fill="none" stroke="#57b1ff" strokeWidth={1.5} strokeDasharray="4 3"
                  opacity={isSelected ? 1 : 0}
                  style={{ transition: "opacity 150ms ease" }}
                >
                  {isSelected && (
                    <animate attributeName="stroke-dashoffset" values="0;-14" dur="1s" repeatCount="indefinite" />
                  )}
                </rect>
                <rect
                  x={pos.x} y={pos.y} width={NODE_W} height={NODE_H} rx={12}
                  fill={bgFill}
                  stroke={borderStroke}
                  strokeWidth={borderWidth}
                  style={{ transition: "stroke 150ms ease, opacity 150ms ease" }}
                />
                <circle cx={cx} cy={pos.y + 24} r={14} fill={`${accentColor}18`} stroke={`${accentColor}55`} strokeWidth={1} />
                <foreignObject x={cx - 9} y={pos.y + 15} width={18} height={18}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 18, height: 18 }}>
                    <Icon size={14} color={accentColor} strokeWidth={1.5} />
                  </div>
                </foreignObject>
                <text x={cx} y={pos.y + 48} textAnchor="middle" fill={colors.textPrimary} fontSize="10" fontWeight="600" fontFamily="system-ui, -apple-system, sans-serif">{node.label}</text>
                {node.sublabel && <text x={cx} y={pos.y + 61} textAnchor="middle" fill={colors.textDim} fontSize="8" fontFamily="system-ui, -apple-system, sans-serif">{node.sublabel}</text>}
              </g>
            );
          })}

          {/* ---- Vulnerable Asset Detail Card ---- */}
          {pathData.nodes.filter((n) => n.isVulnerable).map((node) => {
            const pos = getPos(node.id);
            const cx = pos.x + VULN_NODE_W / 2;
            const cy = pos.y + VULN_NODE_H / 2;
            const primaryAsset = pathData.blastRadius.assets[0];
            const severity = pathData.priority;
            const sevAccent = severityAccent[severity] || "#ff4d4f";
            const isVulnRevealed = revealComplete || revealedNodeSet.has(node.id);
            const isVulnJustRevealed = justRevealedId === node.id && !revealComplete;

            return (
              <g
                key={node.id}
                style={{
                  cursor: "pointer",
                  opacity: isVulnRevealed ? 1 : 0,
                  transition: "opacity 150ms ease",
                }}
              >
                {/* Vuln card entrance scale animation wrapper */}
                {/* Vuln entrance burst — stronger orange glow ring */}
                {isVulnJustRevealed && (
                  <g>
                    <circle cx={cx} cy={cy} r={40} fill="none" stroke="#ff7a1a" strokeWidth={3} opacity={0} filter={`url(#glow-${gradientId})`}>
                      <animate attributeName="r" values="50;150" dur="0.5s" fill="freeze" />
                      <animate attributeName="opacity" values="0.6;0" dur="0.5s" fill="freeze" />
                    </circle>
                    <circle cx={cx} cy={cy} r={30} fill="rgba(255,122,26,0.25)" opacity={0}>
                      <animate attributeName="r" values="30;110" dur="0.45s" fill="freeze" />
                      <animate attributeName="opacity" values="0.25;0" dur="0.45s" fill="freeze" />
                    </circle>
                  </g>
                )}
                {/* Pulsing glow behind card */}
                <circle cx={cx} cy={cy} r={shouldPulseGlow ? 90 : (isKevActive ? 120 : 100)} fill={`url(#vuln-glow-${gradientId})`} opacity={shouldPulseGlow ? undefined : (isKevActive ? 0.65 : 0.4)}>
                  {shouldPulseGlow && (
                    <animate attributeName="r" values="85;100;85" dur="2.8s" repeatCount="indefinite" />
                  )}
                  {shouldPulseGlow && (
                    <animate attributeName="opacity" values="0.3;0.6;0.3" dur="2.8s" repeatCount="indefinite" />
                  )}
                  {!shouldPulseGlow && isKevActive && (
                    <animate attributeName="r" values="95;125;95" dur="2s" repeatCount="indefinite" />
                  )}
                  {!shouldPulseGlow && isKevActive && (
                    <animate attributeName="opacity" values="0.65;1;0.65" dur="2s" repeatCount="indefinite" />
                  )}
                </circle>

                {/* KEV badge above card — fades in with vuln card */}
                {node.cve && (
                  <g style={{
                    opacity: isVulnRevealed ? 1 : 0,
                    transition: "opacity 250ms ease 80ms",
                  }}>
                    <rect x={cx - 68} y={pos.y - VULN_KEV_H - VULN_KEV_GAP} width={136} height={VULN_KEV_H} rx={14}
                      fill={showAttackChain ? "rgba(255,77,79,0.30)" : "rgba(255,77,79,0.15)"}
                      stroke="#ff4d4f" strokeWidth={1}
                    />
                    <text x={cx} y={pos.y - VULN_KEV_GAP - VULN_KEV_H / 2 + 4} textAnchor="middle" fill="#ff4d4f" fontSize="10" fontWeight="700" fontFamily="system-ui, -apple-system, sans-serif">KEV: {node.cve}</text>
                  </g>
                )}

                {/* Card outer glow — no hover animation, only state-driven */}
                <rect x={pos.x - 3} y={pos.y - 3} width={VULN_NODE_W + 6} height={VULN_NODE_H + 6} rx={16}
                  fill="none"
                  stroke="rgba(255,77,79,0.10)"
                  strokeWidth={5}
                  filter={`url(#glow-${gradientId})`}
                >
                  {shouldPulseGlow && (
                    <animate attributeName="stroke-opacity" values="0.08;0.22;0.08" dur="2.8s" repeatCount="indefinite" />
                  )}
                </rect>
                {/* Card background — no hover animation */}
                <rect x={pos.x} y={pos.y} width={VULN_NODE_W} height={VULN_NODE_H} rx={14}
                  fill="rgba(6,12,20,0.96)"
                  stroke={shouldPulseGlow ? undefined : "rgba(255,77,79,0.45)"}
                  strokeWidth={1.5}
                >
                  {shouldPulseGlow && (
                    <animate attributeName="stroke" values="rgba(255,77,79,0.35);rgba(255,100,60,0.65);rgba(255,77,79,0.35)" dur="2.8s" repeatCount="indefinite" />
                  )}
                </rect>

                {/* Card content */}
                <foreignObject x={pos.x} y={pos.y} width={VULN_NODE_W} height={VULN_NODE_H}>
                  <div
                    onMouseDown={(e) => e.stopPropagation()}
                    style={{
                      width: VULN_NODE_W, height: VULN_NODE_H, fontFamily: "system-ui, -apple-system, sans-serif",
                      color: colors.textPrimary, display: "flex", flexDirection: "column", borderRadius: 14, overflow: "hidden",
                      transform: isVulnJustRevealed ? "scale(1)" : undefined,
                      animation: isVulnJustRevealed ? "vuln-card-entrance 300ms cubic-bezier(0.34, 1.56, 0.64, 1) forwards" : undefined,
                    }}>
                    {/* Header: icon + name + severity */}
                    <div style={{ padding: "12px 14px 6px", display: "flex", alignItems: "center", gap: 7 }}>
                      <div style={{
                        width: 26, height: 26, borderRadius: 7, backgroundColor: "rgba(255,77,79,0.12)",
                        border: "1px solid rgba(255,77,79,0.30)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                      }}>
                        <AlertTriangle size={14} color="#ff4d4f" strokeWidth={2} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 11.5, fontWeight: 600, color: colors.textPrimary, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {node.label}
                        </div>
                        <div style={{ fontSize: 8, color: colors.textDim, marginTop: 1 }}>{node.sublabel}</div>
                      </div>
                      <span style={{
                        fontSize: 7.5, fontWeight: 700, color: sevAccent, textTransform: "uppercase", letterSpacing: "0.04em",
                        padding: "2px 7px", borderRadius: 4, backgroundColor: `${sevAccent}18`, border: `1px solid ${sevAccent}35`, flexShrink: 0,
                      }}>
                        {severity}
                      </span>
                    </div>

                    {/* ARN */}
                    <div style={{
                      padding: "0 14px 8px", fontSize: 7.5, color: colors.textDim,
                      fontFamily: "monospace", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                    }}>
                      {primaryAsset?.arn || "N/A"}
                    </div>

                    <div style={{ height: 1, backgroundColor: "rgba(255,77,79,0.12)", margin: "0 14px", flexShrink: 0 }} />

                    {/* Metrics */}
                    <div style={{ padding: "10px 14px", display: "flex", gap: 20 }}>
                      <VulnMetric label="Vulnerabilities" value={primaryAsset?.vulnerabilities ?? pathData.vulnerabilities} color="#ff4d4f" />
                      <VulnMetric label="Misconfigs" value={primaryAsset?.misconfigurations ?? pathData.misconfigurations} color="#ff7a1a" />
                    </div>

                    <div style={{ height: 1, backgroundColor: "rgba(255,122,26,0.10)", margin: "0 14px", flexShrink: 0 }} />

                    {/* Expand chevron */}
                    <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <button
                        onClick={toggleAttackChain}
                        style={{
                          width: "100%", height: 34, display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
                          cursor: "pointer", border: "none", background: "transparent", transition: "background-color 120ms ease",
                        }}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = "rgba(255,122,26,0.08)"; }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = "transparent"; }}
                      >
                        <span style={{ fontSize: 8.5, fontWeight: 600, color: "#ff7a1a" }}>
                          {showAttackChain ? "Hide Attack Chain" : "Show Attack Chain"}
                        </span>
                        <ChevronDown size={12} color="#ff7a1a" strokeWidth={2.5} style={{
                          transform: showAttackChain ? "rotate(180deg)" : "rotate(0deg)",
                          transition: "transform 200ms ease",
                        }} />
                      </button>
                    </div>
                  </div>
                </foreignObject>

                {/* ---- Blast Radius: Pill (collapsed) or Panel (expanded) — only after reveal ---- */}
                {revealComplete && (() => {
                  const brAnchorX = pos.x + VULN_NODE_W + BR_PILL_GAP_X;
                  const connY = pos.y + VULN_NODE_H / 2;

                  if (!showBlastRadius) {
                    /* ---- Collapsed Pill ---- */
                    const pillY = pos.y + (VULN_NODE_H - BR_PILL_H) / 2;
                    return (
                      <g style={{ animation: "investigationFadeIn 300ms ease forwards" }}>
                        <line x1={pos.x + VULN_NODE_W} y1={connY} x2={brAnchorX} y2={connY}
                          stroke="rgba(255,122,26,0.35)" strokeWidth={1.5} strokeDasharray="5 4" strokeLinecap="round">
                          <animate attributeName="stroke-dashoffset" values="0;-18" dur="1.2s" repeatCount="indefinite" />
                        </line>
                        <rect x={brAnchorX} y={pillY} width={BR_PILL_W} height={BR_PILL_H} rx={BR_PILL_H / 2}
                          fill="rgba(6,12,20,0.92)" stroke="rgba(255,122,26,0.30)" strokeWidth={1.5} style={{ cursor: "pointer" }}
                        />
                        <foreignObject x={brAnchorX} y={pillY} width={BR_PILL_W} height={BR_PILL_H} style={{ cursor: "pointer" }}>
                          <div onClick={toggleBlastRadius} onMouseDown={(e) => e.stopPropagation()}
                            style={{ width: BR_PILL_W, height: BR_PILL_H, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, cursor: "pointer", fontFamily: "system-ui, -apple-system, sans-serif" }}>
                            <Crosshair size={13} color="#ff7a1a" strokeWidth={2} />
                            <span style={{ fontSize: 10, fontWeight: 600, color: "#ff7a1a" }}>Blast Radius</span>
                            <span style={{ fontSize: 8, fontWeight: 700, color: "rgba(255,122,26,0.7)", backgroundColor: "rgba(255,122,26,0.12)", borderRadius: 8, padding: "1px 5px" }}>
                              {pathData.blastRadius.totalAssets}
                            </span>
                          </div>
                        </foreignObject>
                      </g>
                    );
                  }

                  /* ---- Expanded Panel ---- */
                  return (
                    <InlineBlastRadiusPanel
                      anchorX={brAnchorX}
                      anchorY={pos.y}
                      connFromX={pos.x + VULN_NODE_W}
                      connY={connY}
                      data={pathData.blastRadius}
                      gradientId={gradientId}
                      onCollapse={toggleBlastRadius}
                      onSelectAsset={handleSelectAsset}
                      selectedAssetId={inspectedAsset?.id ?? null}
                    />
                  );
                })()}
              </g>
            );
          })}

          {/* ---- Attack Chain + Blast Radius (below vuln card) ---- */}
          {showAttackChain && kevExpandedNodeId && attackChain.length > 0 && (() => {
            const vulnPos = getPos(kevExpandedNodeId);
            const cardBottom = vulnPos.y + VULN_NODE_H;
            const connCenterX = vulnPos.x + VULN_NODE_W / 2;
            return (
              <AttackChainOverlay
                vulnCardBottom={cardBottom}
                vulnCardCenterX={connCenterX}
                chain={attackChain}
                gradientId={gradientId}
              />
            );
          })()}
        </g>
      </svg>

      {/* Zoom controls + Reset View */}
      <div
        className="fixed bottom-[24px] right-[24px] z-50 flex flex-col gap-1 rounded-lg border p-1"
        style={{ backgroundColor: "rgba(6,12,20,0.92)", borderColor: colors.border, backdropFilter: "blur(8px)" }}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <button onClick={handleZoomIn} className="p-1.5 rounded hover:bg-[rgba(87,177,255,0.1)] transition-colors" title="Zoom in">
          <ZoomIn size={16} color={colors.textMuted} />
        </button>
        <div className="text-center text-[9px] py-0.5 tabular-nums" style={{ color: colors.textDim }}>
          {Math.round(zoom * 100)}%
        </div>
        <button onClick={handleZoomOut} className="p-1.5 rounded hover:bg-[rgba(87,177,255,0.1)] transition-colors" title="Zoom out">
          <ZoomOut size={16} color={colors.textMuted} />
        </button>
        <div className="border-t my-0.5" style={{ borderColor: colors.border }} />
        <button
          onClick={animateToFit}
          className="flex items-center gap-1.5 px-2 py-1.5 rounded hover:bg-[rgba(87,177,255,0.1)] transition-colors"
          title="Reset view to auto-fit"
        >
          <RotateCcw size={13} color={colors.textMuted} />
          <span className="text-[9px]" style={{ color: colors.textMuted }}>Reset</span>
        </button>
      </div>

      {/* Insights panel overlay */}
      {inspectedAsset && (
        <InsightsPanel asset={inspectedAsset} onClose={handleCloseInsights} sourcePathId={pathId} sourcePathName={pathData.name} />
      )}
    </div>
  );
}

/* ================================================================
   ARROW HEAD
   ================================================================ */

function ArrowHead({ x, y, fromX, fromY, color, nodeW = NODE_W, nodeH = NODE_H }: { x: number; y: number; fromX: number; fromY: number; color: string; nodeW?: number; nodeH?: number }) {
  const angle = Math.atan2(y - fromY, x - fromX);
  const size = 8;
  const tipX = x - Math.cos(angle) * (nodeW / 2 + 2);
  const tipY = y - Math.sin(angle) * (nodeH / 2 + 2);
  const p1x = tipX - size * Math.cos(angle - Math.PI / 6);
  const p1y = tipY - size * Math.sin(angle - Math.PI / 6);
  const p2x = tipX - size * Math.cos(angle + Math.PI / 6);
  const p2y = tipY - size * Math.sin(angle + Math.PI / 6);
  return <polygon points={`${tipX},${tipY} ${p1x},${p1y} ${p2x},${p2y}`} fill={color} style={{ transition: "fill 120ms ease" }} />;
}

/* ================================================================
   INLINE BLAST RADIUS PANEL — expands to the right of the vuln card
   ================================================================ */

const INLINE_BR_W = 600;
const INLINE_BR_HEADER_H = 46;
const INLINE_BR_SUMMARY_H = 82;
const INLINE_BR_PAD = 14;
const INLINE_BR_GRID_GAP = 8;
const INLINE_BR_CARD_MIN = 132;
const INLINE_BR_CARD_H = 100;
const INLINE_BR_MAX_H = 520;

function computeInlineBRHeight(assetCount: number, panelW: number): number {
  const colsApprox = Math.max(1, Math.floor((panelW - INLINE_BR_PAD * 2 + INLINE_BR_GRID_GAP) / (INLINE_BR_CARD_MIN + INLINE_BR_GRID_GAP)));
  const rows = Math.ceil(assetCount / colsApprox);
  const gridH = rows * INLINE_BR_CARD_H + Math.max(0, rows - 1) * INLINE_BR_GRID_GAP;
  const rawH = INLINE_BR_HEADER_H + INLINE_BR_SUMMARY_H + gridH + INLINE_BR_PAD * 3 + 4;
  return Math.min(rawH, INLINE_BR_MAX_H);
}

function InlineBlastRadiusPanel({
  anchorX, anchorY, connFromX, connY, data, gradientId, onCollapse, onSelectAsset, selectedAssetId,
}: {
  anchorX: number;
  anchorY: number;
  connFromX: number;
  connY: number;
  data: BlastRadiusData;
  gradientId: string;
  onCollapse: (e: React.MouseEvent) => void;
  onSelectAsset?: (asset: BlastRadiusAsset) => void;
  selectedAssetId?: string | null;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const t = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(t);
  }, []);

  const panelH = computeInlineBRHeight(data.assets.length, INLINE_BR_W);
  const panelX = anchorX;
  const panelY = anchorY - 10;

  const sortedAssets = useMemo(
    () => [...data.assets].sort((a, b) => {
      const ord: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 };
      return (ord[a.riskSeverity] ?? 9) - (ord[b.riskSeverity] ?? 9);
    }),
    [data.assets],
  );

  return (
    <g
      style={{
        opacity: mounted ? 1 : 0,
        transform: mounted ? "translateX(0)" : "translateX(24px)",
        transition: "opacity 280ms cubic-bezier(0.22,1,0.36,1), transform 280ms cubic-bezier(0.22,1,0.36,1)",
      }}
    >
      {/* Horizontal dashed connector from vuln card edge to panel */}
      <line x1={connFromX} y1={connY} x2={panelX} y2={connY}
        stroke="rgba(255,122,26,0.40)" strokeWidth={1.5} strokeDasharray="5 4" strokeLinecap="round"
        style={{ opacity: mounted ? 0.8 : 0, transition: "opacity 200ms ease-out 60ms" }}
      >
        <animate attributeName="stroke-dashoffset" values="0;-18" dur="1.2s" repeatCount="indefinite" />
      </line>

      {/* Outer glow */}
      <rect x={panelX - 3} y={panelY - 3} width={INLINE_BR_W + 6} height={panelH + 6} rx={18}
        fill="none" stroke="rgba(255,122,26,0.06)" strokeWidth={5} filter={`url(#glow-${gradientId})`}
      />
      {/* Background */}
      <rect x={panelX} y={panelY} width={INLINE_BR_W} height={panelH} rx={16}
        fill="rgba(6,12,20,0.97)" stroke="rgba(255,122,26,0.35)" strokeWidth={1.5}
      />

      {/* Content */}
      <foreignObject x={panelX} y={panelY} width={INLINE_BR_W} height={panelH}>
        <div
          onMouseDown={(e) => e.stopPropagation()}
          onWheel={(e) => e.stopPropagation()}
          style={{
            width: INLINE_BR_W, height: panelH, fontFamily: "system-ui, -apple-system, sans-serif",
            color: colors.textPrimary, display: "flex", flexDirection: "column",
            overflow: "hidden", borderRadius: 16,
          }}
        >
          {/* ── Top bar (sticky — stays fixed at top) ��─ */}
          <div style={{
            height: INLINE_BR_HEADER_H, display: "flex", alignItems: "center", gap: 8,
            padding: "0 18px", borderBottom: "1px solid rgba(255,122,26,0.15)", flexShrink: 0,
            backgroundColor: "rgba(6,12,20,0.97)", zIndex: 2,
          }}>
            <div style={{
              width: 28, height: 28, borderRadius: 8, backgroundColor: "rgba(255,122,26,0.10)",
              border: "1px solid rgba(255,122,26,0.25)", display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Crosshair size={14} color="#ff7a1a" strokeWidth={2} />
            </div>
            <span style={{ fontSize: 13, fontWeight: 600, color: colors.textPrimary }}>Blast Radius</span>
            <span style={{
              fontSize: 8.5, fontWeight: 600, color: "rgba(255,122,26,0.75)",
              backgroundColor: "rgba(255,122,26,0.10)", borderRadius: 10, padding: "2px 8px", marginLeft: 4,
            }}>
              {data.totalAssets} assets affected
            </span>
            <button
              onClick={onCollapse}
              style={{
                marginLeft: "auto", width: 28, height: 28, borderRadius: 7,
                border: "1px solid rgba(255,122,26,0.25)", backgroundColor: "rgba(255,122,26,0.06)",
                display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
                transition: "background-color 120ms ease",
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = "rgba(255,122,26,0.14)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = "rgba(255,122,26,0.06)"; }}
              title="Collapse Blast Radius"
            >
              <ExternalLink size={13} color="#ff7a1a" strokeWidth={2} />
            </button>
          </div>

          {/* ── Summary card (sticky — stays fixed below top bar) ── */}
          <div style={{
            margin: `${INLINE_BR_PAD}px ${INLINE_BR_PAD}px ${INLINE_BR_PAD / 2}px`, padding: "12px 16px",
            borderRadius: 10, backgroundColor: "rgba(255,122,26,0.035)",
            border: "1px solid rgba(255,122,26,0.16)", flexShrink: 0,
            zIndex: 2,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
              <Network size={12} color="#ff7a1a" strokeWidth={2} />
              <span style={{ fontSize: 10.5, fontWeight: 600, color: "#ff7a1a" }}>Blast Radius via Network</span>
            </div>
            <div style={{ display: "flex", gap: 32 }}>
              <InlineBRMetric label="Total Assets" value={data.totalAssets} color="#57b1ff" />
              <InlineBRMetric label="Vulnerabilities" value={data.totalVulnerabilities} color="#ff4d4f" />
              <InlineBRMetric label="Misconfigurations" value={data.totalMisconfigurations} color="#ff7a1a" />
            </div>
          </div>

          {/* ── Scrollable asset grid ── */}
          <div
            className="br-scroll"
            style={{
              flex: 1, minHeight: 0, overflowY: "auto", overflowX: "hidden",
              scrollbarWidth: "thin",
              scrollbarColor: "rgba(255,122,26,0.25) transparent",
            }}
          >
            <div style={{
              display: "grid",
              gridTemplateColumns: `repeat(auto-fill, minmax(${INLINE_BR_CARD_MIN}px, 1fr))`,
              gap: INLINE_BR_GRID_GAP, padding: INLINE_BR_PAD,
            }}>
              {sortedAssets.map((asset, idx) => {
                const delay = 60 + idx * 25;
                return (
                  <div key={asset.id} style={{
                    opacity: mounted ? 1 : 0,
                    transform: mounted ? "translateX(0) scale(1)" : "translateX(10px) scale(0.95)",
                    transition: `opacity 200ms ease-out ${delay}ms, transform 200ms ease-out ${delay}ms`,
                  }}>
                    <InlineBRAssetCard
                      asset={asset}
                      isSelected={selectedAssetId === asset.id}
                      onClick={() => onSelectAsset?.(asset)}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </foreignObject>
    </g>
  );
}

function InlineBRMetric({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <span style={{ fontSize: 7.5, color: colors.textDim, textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</span>
      <div style={{ display: "flex", alignItems: "baseline", gap: 5 }}>
        <span style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: color, flexShrink: 0, position: "relative" as const, top: -1 }} />
        <span style={{ fontSize: 16, fontWeight: 700, color, fontVariantNumeric: "tabular-nums" }}>{value}</span>
      </div>
    </div>
  );
}

function InlineBRAssetCard({ asset, isSelected, onClick }: { asset: BlastRadiusAsset; isSelected?: boolean; onClick?: () => void }) {
  const accent = severityAccent[asset.riskSeverity] || colors.textDim;
  const selectedBorder = isSelected ? accent : `${accent}35`;
  const selectedBg = isSelected ? `${accent}14` : `${accent}06`;
  const selectedShadow = isSelected ? `0 0 16px ${accent}22, inset 0 0 0 1px ${accent}30` : `0 0 0 0 ${accent}00`;
  return (
    <div
      onClick={(e) => { e.stopPropagation(); onClick?.(); }}
      style={{
        borderRadius: 10, padding: "9px 11px", minWidth: 0, height: "100%",
        borderWidth: 1, borderStyle: "solid",
        borderTopColor: selectedBorder, borderRightColor: selectedBorder, borderBottomColor: selectedBorder,
        borderLeftWidth: 3, borderLeftColor: accent,
        backgroundColor: selectedBg,
        display: "flex", flexDirection: "column", gap: 5,
        cursor: "pointer",
        transition: "border-color 140ms ease, background-color 140ms ease, box-shadow 140ms ease, transform 140ms ease",
        boxShadow: selectedShadow,
        transform: isSelected ? "translateY(-1px)" : "translateY(0)",
      }}
      onMouseEnter={(e) => {
        if (isSelected) return;
        const el = e.currentTarget as HTMLDivElement;
        el.style.borderTopColor = accent;
        el.style.borderRightColor = accent;
        el.style.borderBottomColor = accent;
        el.style.borderLeftColor = accent;
        el.style.backgroundColor = `${accent}10`;
        el.style.boxShadow = `0 2px 12px ${accent}28, 0 1px 3px rgba(0,0,0,0.18)`;
        el.style.transform = "translateY(-2px)";
      }}
      onMouseLeave={(e) => {
        if (isSelected) return;
        const el = e.currentTarget as HTMLDivElement;
        el.style.borderTopColor = `${accent}35`;
        el.style.borderRightColor = `${accent}35`;
        el.style.borderBottomColor = `${accent}35`;
        el.style.borderLeftColor = accent;
        el.style.backgroundColor = `${accent}06`;
        el.style.boxShadow = `0 0 0 0 ${accent}00`;
        el.style.transform = "translateY(0)";
      }}
    >
      {/* Icon + name */}
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <div style={{
          width: 20, height: 20, borderRadius: 5, backgroundColor: `${accent}12`,
          border: `1px solid ${accent}28`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
        }}>
          <Server size={11} color={accent} strokeWidth={1.5} />
        </div>
        <span style={{
          fontSize: 9.5, fontWeight: 600, color: colors.textPrimary, flex: 1, minWidth: 0,
          whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
        }}>
          {asset.name}
        </span>
      </div>

      {/* ARN */}
      <div style={{
        fontSize: 7, color: colors.textDim, whiteSpace: "nowrap", overflow: "hidden",
        textOverflow: "ellipsis", fontFamily: "monospace", lineHeight: 1.3,
      }}>
        {asset.arn}
      </div>

      <div style={{ height: 1, backgroundColor: `${accent}12`, margin: "1px 0" }} />

      {/* Metrics */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
          <Bug size={8} color="#ff4d4f" strokeWidth={1.5} />
          <span style={{ fontSize: 7, color: colors.textDim }}>Vulns</span>
          <span style={{ fontSize: 9, fontWeight: 700, color: "#ff4d4f" }}>{asset.vulnerabilities}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
          <Settings2 size={8} color="#ff7a1a" strokeWidth={1.5} />
          <span style={{ fontSize: 7, color: colors.textDim }}>Misconfigs</span>
          <span style={{ fontSize: 9, fontWeight: 700, color: "#ff7a1a" }}>{asset.misconfigurations}</span>
        </div>
      </div>

      {/* Severity badge */}
      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "auto" }}>
        <span style={{
          fontSize: 7, fontWeight: 700, color: accent, textTransform: "uppercase", letterSpacing: "0.05em",
          padding: "2px 6px", borderRadius: 4, backgroundColor: `${accent}12`, border: `1px solid ${accent}24`,
        }}>
          {asset.riskSeverity}
        </span>
      </div>
    </div>
  );
}

/* ================================================================
   VULN METRIC (small helper)
   ================================================================ */

function VulnMetric({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <span style={{ fontSize: 7, color: colors.textDim, textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</span>
      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
        <span style={{ width: 5, height: 5, borderRadius: "50%", backgroundColor: color, flexShrink: 0 }} />
        <span style={{ fontSize: 13, fontWeight: 700, color }}>{value}</span>
      </div>
    </div>
  );
}

/* ================================================================
   ATTACK CHAIN OVERLAY
   ================================================================ */

function AttackChainOverlay({
  vulnCardBottom,
  vulnCardCenterX,
  chain,
  gradientId,
}: {
  vulnCardBottom: number;
  vulnCardCenterX: number;
  chain: ChainStep[];
  gradientId: string;
}) {
  const chainPanelH = computeChainPanelHeight(chain.length);
  const totalChainH = chainPanelH + 4;
  const panelX = vulnCardCenterX - CHAIN_W / 2;
  const panelY = vulnCardBottom + CHAIN_GAP_Y;

  const connStartX = vulnCardCenterX;
  const connStartY = vulnCardBottom;
  const connEndY = panelY;

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const t = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(t);
  }, []);

  const allSteps = useMemo(() => {
    const steps: Array<ChainStep & { isExploit?: boolean }> = chain.map((s) => ({ ...s }));
    steps.push({
      nodeId: "__exploit__",
      label: "Exploit / Priv Escalation",
      icon: "vuln",
      isVulnerable: false,
      isExploit: true,
    });
    return steps;
  }, [chain]);

  const totalSteps = allSteps.length;

  return (
    <g
      style={{
        opacity: mounted ? 1 : 0,
        transform: mounted ? "scale(1)" : "scale(0.95)",
        transformOrigin: `${vulnCardCenterX}px ${vulnCardBottom}px`,
        transition: "opacity 150ms ease-out, transform 150ms ease-out",
      }}
    >
      {/* Dashed connector from vuln card to chain panel */}
      <line
        x1={connStartX} y1={connStartY} x2={connStartX} y2={connEndY}
        stroke="#ff7a1a" strokeWidth={1.5} strokeDasharray="5 4" strokeLinecap="round"
        style={{ opacity: mounted ? 1 : 0, transition: "opacity 250ms ease-out 80ms" }}
      >
        <animate attributeName="stroke-dashoffset" values="0;-18" dur="1.2s" repeatCount="indefinite" />
      </line>

      {/* Chain panel glow + bg */}
      <rect x={panelX - 3} y={panelY - 3} width={CHAIN_W + 6} height={totalChainH + 6} rx={14}
        fill="none" stroke="rgba(255,122,26,0.12)" strokeWidth={5} filter={`url(#glow-${gradientId})`}
      />
      <rect x={panelX} y={panelY} width={CHAIN_W} height={totalChainH} rx={12}
        fill="rgba(6,12,20,0.94)" stroke="rgba(255,122,26,0.40)" strokeWidth={1.5}
      />

      {/* Chain panel content */}
      <foreignObject x={panelX} y={panelY} width={CHAIN_W} height={totalChainH}>
        <div style={{
          width: CHAIN_W, height: totalChainH, fontFamily: "system-ui, -apple-system, sans-serif",
          color: colors.textPrimary, display: "flex", flexDirection: "column", overflow: "hidden", borderRadius: 12,
        }}>
          {/* Header */}
          <div style={{
            height: CHAIN_HEADER_H, display: "flex", alignItems: "center", gap: 6, padding: "0 10px",
            borderBottom: "1px solid rgba(255,122,26,0.18)", flexShrink: 0,
          }}>
            <Zap size={11} color="#ff7a1a" strokeWidth={2} />
            <span style={{ fontSize: 10, fontWeight: 600, color: "#ff7a1a" }}>Attack Chain</span>
            <span style={{
              marginLeft: "auto", fontSize: 8, fontWeight: 600, color: "rgba(255,122,26,0.7)",
              backgroundColor: "rgba(255,122,26,0.10)", borderRadius: 8, padding: "1px 5px",
            }}>
              {chain.length} steps
            </span>
          </div>

          {/* Steps */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", padding: `${CHAIN_PAD}px 8px`, gap: 0 }}>
            {allSteps.map((step, idx) => {
              const isExploit = !!(step as { isExploit?: boolean }).isExploit;
              const isVuln = step.isVulnerable;
              const accentColor = isExploit ? "#ff4d4f" : isVuln ? "#ff4d4f" : nodeColorMap[step.icon] || "#57b1ff";
              const Icon = isExploit ? Zap : (nodeIconMap[step.icon] || Server);
              const isLast = idx === totalSteps - 1;
              const delay = 80 + idx * 50;

              return (
                <div key={step.nodeId} style={{
                  display: "flex", flexDirection: "column", alignItems: "center", width: "100%",
                  opacity: mounted ? 1 : 0, transform: mounted ? "translateY(0)" : "translateY(6px)",
                  transition: `opacity 150ms ease-out ${delay}ms, transform 150ms ease-out ${delay}ms`,
                }}>
                  <div style={{
                    width: "100%", height: CHAIN_STEP_H, display: "flex", alignItems: "center", gap: 7, padding: "0 8px", borderRadius: 8,
                    border: isExploit ? "1px dashed rgba(255,77,79,0.45)" : isVuln ? "1px solid rgba(255,77,79,0.40)" : `1px solid ${accentColor}30`,
                    backgroundColor: isExploit ? "rgba(255,77,79,0.06)" : isVuln ? "rgba(255,77,79,0.08)" : "rgba(6,12,20,0.6)",
                    boxShadow: isVuln ? "0 0 10px rgba(255,77,79,0.10)" : isExploit ? "0 0 8px rgba(255,77,79,0.08)" : "none",
                    flexShrink: 0,
                  }}>
                    <div style={{
                      width: 22, height: 22, borderRadius: "50%", backgroundColor: `${accentColor}18`,
                      border: `1px solid ${accentColor}40`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                    }}>
                      <Icon size={12} color={accentColor} strokeWidth={1.5} />
                    </div>
                    <span style={{
                      fontSize: 9.5, fontWeight: isVuln || isExploit ? 700 : 600,
                      color: isExploit ? "#ff4d4f" : colors.textPrimary,
                      whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", flex: 1,
                    }}>
                      {step.label}
                    </span>
                  </div>
                  {!isLast && (
                    <div style={{
                      display: "flex", flexDirection: "column", alignItems: "center", height: CHAIN_CONNECTOR_H,
                      justifyContent: "center", opacity: mounted ? 1 : 0, transition: `opacity 150ms ease-out ${delay + 60}ms`,
                    }}>
                      <div style={{ width: 1, height: 8, backgroundColor: isVuln ? "rgba(255,77,79,0.40)" : `${accentColor}35` }} />
                      <ChevronDown size={10} strokeWidth={2} color={isVuln ? "rgba(255,77,79,0.55)" : `${accentColor}55`} style={{ marginTop: -3 }} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </div>
      </foreignObject>
    </g>
  );
}

/* legacy _BlastRadiusPanel — removed */
function _BlastRadiusPanel_UNUSED({
  x, y, w, h, data, chainPanelRight, gradientId, onSelectAsset,
}: {
  x: number; y: number; w: number; h: number;
  data: BlastRadiusData;
  chainPanelRight: number;
  gradientId: string;
  onSelectAsset: (asset: BlastRadiusAsset) => void;
}) {
  const [brMounted, setBrMounted] = useState(false);
  useEffect(() => {
    const t = requestAnimationFrame(() => setBrMounted(true));
    return () => cancelAnimationFrame(t);
  }, []);

  const sortedAssets = useMemo(
    () => [...data.assets].sort((a, b) => {
      const ord: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 };
      return (ord[a.riskSeverity] ?? 9) - (ord[b.riskSeverity] ?? 9);
    }),
    [data.assets],
  );

  /* Connector line from chain panel right edge to BR panel left edge */
  const connY = y + BR_HEADER_H / 2 + 10;
  const connStartX = chainPanelRight;
  const connEndX = x;

  return (
    <g style={{
      opacity: brMounted ? 1 : 0,
      transform: brMounted ? "translateX(0)" : "translateX(20px)",
      transition: "opacity 250ms cubic-bezier(0.22,1,0.36,1), transform 250ms cubic-bezier(0.22,1,0.36,1)",
    }}>
      {/* Horizontal dashed connector from chain to BR panel */}
      <line
        x1={connStartX} y1={connY} x2={connEndX} y2={connY}
        stroke="#ff7a1a" strokeWidth={1.5} strokeDasharray="5 4" strokeLinecap="round"
        style={{ opacity: brMounted ? 1 : 0, transition: "opacity 200ms ease-out 80ms" }}
      >
        <animate attributeName="stroke-dashoffset" values="0;-18" dur="1.2s" repeatCount="indefinite" />
      </line>

      {/* Outer glow ring */}
      <rect x={x - 4} y={y - 4} width={w + 8} height={h + 8} rx={18}
        fill="none" stroke="rgba(255,122,26,0.08)" strokeWidth={6} filter={`url(#glow-${gradientId})`}
      />
      {/* Subtle inner glow */}
      <rect x={x - 1} y={y - 1} width={w + 2} height={h + 2} rx={15}
        fill="none" stroke="rgba(255,122,26,0.18)" strokeWidth={2}
      />
      {/* Background */}
      <rect x={x} y={y} width={w} height={h} rx={14}
        fill="rgba(6,12,20,0.96)" stroke="rgba(255,122,26,0.40)" strokeWidth={1.5}
      />

      {/* Content */}
      <foreignObject x={x} y={y} width={w} height={h}>
        <div style={{
          width: w, height: h, fontFamily: "system-ui, -apple-system, sans-serif",
          color: colors.textPrimary, display: "flex", flexDirection: "column",
          overflow: "hidden", borderRadius: 14,
        }}>
          {/* Header */}
          <div style={{
            height: BR_HEADER_H, display: "flex", alignItems: "center", gap: 8,
            padding: "0 16px", borderBottom: "1px solid rgba(255,122,26,0.15)", flexShrink: 0,
          }}>
            <div style={{
              width: 26, height: 26, borderRadius: 7, backgroundColor: "rgba(255,122,26,0.12)",
              border: "1px solid rgba(255,122,26,0.30)", display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Crosshair size={14} color="#ff7a1a" strokeWidth={2} />
            </div>
            <span style={{ fontSize: 12.5, fontWeight: 600, color: colors.textPrimary }}>Blast Radius</span>
            <span style={{
              marginLeft: "auto", fontSize: 8, fontWeight: 600, color: "rgba(255,122,26,0.7)",
              backgroundColor: "rgba(255,122,26,0.10)", borderRadius: 8, padding: "2px 7px",
            }}>
              {data.totalAssets} assets affected
            </span>
          </div>

          {/* Summary card — "Blast Radius via Network" */}
          <div style={{
            margin: `${BR_PANEL_PAD}px ${BR_PANEL_PAD}px 0`, padding: "12px 16px",
            borderRadius: 10, backgroundColor: "rgba(255,122,26,0.04)",
            border: "1px solid rgba(255,122,26,0.18)", flexShrink: 0,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
              <Network size={11} color="#ff7a1a" strokeWidth={2} />
              <span style={{ fontSize: 10.5, fontWeight: 600, color: "#ff7a1a" }}>
                Blast Radius via Network
              </span>
            </div>
            <div style={{ display: "flex", gap: 28 }}>
              <BRSummaryMetric label="Total Assets" value={data.totalAssets} color="#57b1ff" />
              <BRSummaryMetric label="Vulnerabilities" value={data.totalVulnerabilities} color="#ff4d4f" />
              <BRSummaryMetric label="Misconfigurations" value={data.totalMisconfigurations} color="#ff7a1a" />
            </div>
          </div>

          {/* Asset grid — responsive auto-fill */}
          <div style={{
            display: "grid",
            gridTemplateColumns: `repeat(auto-fill, minmax(${BR_CARD_MIN}px, 1fr))`,
            gap: BR_GRID_GAP, padding: BR_PANEL_PAD, flex: 1, overflow: "hidden",
          }}>
            {sortedAssets.map((asset, idx) => {
              const delay = 80 + idx * 30;
              return (
                <div
                  key={asset.id}
                  style={{
                    opacity: brMounted ? 1 : 0,
                    transform: brMounted ? "translateX(0) scale(1)" : "translateX(8px) scale(0.96)",
                    transition: `opacity 200ms ease-out ${delay}ms, transform 200ms ease-out ${delay}ms`,
                  }}
                >
                  <BRAssetCard asset={asset} onClick={() => onSelectAsset(asset)} />
                </div>
              );
            })}
          </div>
        </div>
      </foreignObject>
    </g>
  );
}

function BRSummaryMetric({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <span style={{ fontSize: 7.5, color: colors.textDim, textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</span>
      <div style={{ display: "flex", alignItems: "baseline", gap: 5 }}>
        <span style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: color, flexShrink: 0, position: "relative", top: -1 }} />
        <span style={{ fontSize: 16, fontWeight: 700, color, fontVariantNumeric: "tabular-nums" }}>{value}</span>
      </div>
    </div>
  );
}

function BRAssetCard({ asset, onClick }: { asset: BlastRadiusAsset; onClick?: () => void }) {
  const accent = severityAccent[asset.riskSeverity] || colors.textDim;
  return (
    <div
      onClick={(e) => { e.stopPropagation(); onClick?.(); }}
      style={{
        borderRadius: 10, padding: "8px 10px", minWidth: 0, height: "100%",
        border: `1.5px solid ${accent}40`,
        borderLeftWidth: 3, borderLeftColor: accent,
        backgroundColor: `${accent}06`,
        display: "flex", flexDirection: "column", gap: 5,
        cursor: "pointer", transition: "border-color 150ms ease, background-color 150ms ease, box-shadow 150ms ease",
        boxShadow: `0 0 0 0 ${accent}00`,
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLDivElement;
        el.style.borderColor = `${accent}`;
        el.style.backgroundColor = `${accent}12`;
        el.style.boxShadow = `0 0 12px ${accent}18`;
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLDivElement;
        el.style.borderColor = `${accent}40`;
        el.style.backgroundColor = `${accent}06`;
        el.style.boxShadow = `0 0 0 0 ${accent}00`;
      }}
    >
      {/* Header row: icon + name */}
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <div style={{
          width: 20, height: 20, borderRadius: 5, backgroundColor: `${accent}15`,
          border: `1px solid ${accent}30`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
        }}>
          <Server size={11} color={accent} strokeWidth={1.5} />
        </div>
        <span style={{
          fontSize: 9.5, fontWeight: 600, color: colors.textPrimary, flex: 1, minWidth: 0,
          whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
        }}>
          {asset.name}
        </span>
      </div>

      {/* ARN reference */}
      <div style={{
        fontSize: 7, color: colors.textDim, whiteSpace: "nowrap", overflow: "hidden",
        textOverflow: "ellipsis", fontFamily: "monospace", lineHeight: 1.3,
      }}>
        {asset.arn}
      </div>

      {/* Divider */}
      <div style={{ height: 1, backgroundColor: `${accent}15`, margin: "1px 0" }} />

      {/* Metrics row: Vulns + Misconfigs */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
          <Bug size={8} color="#ff4d4f" strokeWidth={1.5} />
          <span style={{ fontSize: 7, color: colors.textDim }}>Vulns</span>
          <span style={{ fontSize: 9, fontWeight: 700, color: "#ff4d4f" }}>{asset.vulnerabilities}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
          <Settings2 size={8} color="#ff7a1a" strokeWidth={1.5} />
          <span style={{ fontSize: 7, color: colors.textDim }}>Misconfigs</span>
          <span style={{ fontSize: 9, fontWeight: 700, color: "#ff7a1a" }}>{asset.misconfigurations}</span>
        </div>
      </div>

      {/* Severity badge */}
      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "auto" }}>
        <span style={{
          fontSize: 7, fontWeight: 700, color: accent, textTransform: "uppercase", letterSpacing: "0.05em",
          padding: "2px 6px", borderRadius: 4, backgroundColor: `${accent}15`, border: `1px solid ${accent}28`,
        }}>
          {asset.riskSeverity}
        </span>
      </div>
    </div>
  );
}

/* ================================================================
   INSIGHTS PANEL — right-side slide-in overlay
   ================================================================ */

const INSIGHTS_W = 360;

function InsightsPanel({ asset, onClose, sourcePathId, sourcePathName }: { asset: BlastRadiusAsset; onClose: () => void; sourcePathId: string; sourcePathName: string }) {
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const closingRef = useRef(false);
  const accent = severityAccent[asset.riskSeverity] || colors.textDim;
  const exposures = getAssetExposures(asset.id);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleCopy = useCallback((value: string, field: string) => {
    navigator.clipboard.writeText(value).then(() => {
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 1600);
    });
  }, []);

  /* Animate in on mount */
  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
  }, []);

  /* Smooth close-out: reverse slide animation, then unmount */
  const initiateClose = useCallback(() => {
    if (closingRef.current) return;
    closingRef.current = true;
    setVisible(false);
    setTimeout(onClose, 220);
  }, [onClose]);

  /* Close on ESC key */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") initiateClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [initiateClose]);

  /* Close on click outside the panel */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        initiateClose();
      }
    };
    const t = setTimeout(() => document.addEventListener("mousedown", handler), 60);
    return () => { clearTimeout(t); document.removeEventListener("mousedown", handler); };
  }, [initiateClose]);

  return (
    <div
      className="fixed inset-0 z-[60]"
      style={{ pointerEvents: "none" }}
      onMouseDown={(e) => e.stopPropagation()}
    >
      {/* Semi-transparent backdrop */}
      <div
        style={{
          position: "absolute", inset: 0, backgroundColor: "rgba(0,0,0,0.40)",
          pointerEvents: "auto", opacity: visible ? 1 : 0,
          transition: "opacity 200ms ease-out",
        }}
        onMouseDown={(e) => { e.stopPropagation(); initiateClose(); }}
      />

      {/* Slide-in panel — fixed to viewport right edge */}
      <div
        ref={panelRef}
        style={{
          position: "fixed", top: 0, right: 0, bottom: 0, width: INSIGHTS_W,
          backgroundColor: "rgba(6,12,20,0.98)", borderLeft: `1px solid ${colors.border}`,
          boxShadow: "-8px 0 30px rgba(0,0,0,0.35)",
          backdropFilter: "blur(14px)", pointerEvents: "auto",
          transform: visible ? "translateX(0)" : "translateX(100%)",
          transition: "transform 200ms cubic-bezier(0.22, 0.61, 0.36, 1)",
          fontFamily: "system-ui, -apple-system, sans-serif",
          display: "flex", flexDirection: "column", overflow: "hidden",
        }}
      >
        {/* ── Header (sticky) ── */}
        <div style={{
          padding: "16px 18px 12px", display: "flex", alignItems: "center", justifyContent: "space-between",
          borderBottom: `1px solid ${colors.border}`, flexShrink: 0,
          backgroundColor: "rgba(6,12,20,0.98)", zIndex: 2,
        }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: colors.textPrimary }}>Insights</span>
          <button
            onClick={initiateClose}
            style={{
              width: 28, height: 28, borderRadius: 7, border: `1px solid ${colors.border}`,
              backgroundColor: "transparent", display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", transition: "background-color 150ms ease",
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = "rgba(255,255,255,0.06)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = "transparent"; }}
          >
            <X size={14} color={colors.textMuted} strokeWidth={2} />
          </button>
        </div>

        {/* ── Scrollable body ── */}
        <div
          className="insights-scroll"
          style={{
            flex: 1, minHeight: 0, overflowY: "auto", overflowX: "hidden",
            scrollbarWidth: "thin",
            scrollbarColor: "rgba(87,177,255,0.18) transparent",
          }}
        >
          <div style={{ padding: "18px 20px 24px", display: "flex", flexDirection: "column", gap: 0 }}>

            {/* ══════════════  SECTION 1: Asset Information  ══════════════ */}

            {/* Section label */}
            <InsightSectionLabel text="Asset Information" />

            {/* Asset ID + severity badge */}
            <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 14 }}>
              <span style={{ fontSize: 9.5, color: colors.textDim, textTransform: "uppercase", letterSpacing: "0.06em" }}>Asset ID</span>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{
                  fontSize: 11.5, fontWeight: 600, color: colors.textPrimary, fontFamily: "monospace",
                  flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                }}>
                  {asset.id}
                </span>
                <InsightCopyBtn
                  value={asset.id}
                  field="id"
                  copiedField={copiedField}
                  onCopy={handleCopy}
                />
                <span style={{
                  fontSize: 9, fontWeight: 700, color: accent, textTransform: "uppercase", letterSpacing: "0.05em",
                  padding: "3px 10px", borderRadius: 5, backgroundColor: `${accent}15`, border: `1px solid ${accent}30`,
                }}>
                  {asset.riskSeverity}
                </span>
              </div>
            </div>

            {/* Asset details card */}
            <div style={{
              padding: "14px 16px", borderRadius: 10, backgroundColor: "rgba(87,177,255,0.03)",
              border: `1px solid ${colors.border}`, display: "flex", flexDirection: "column", gap: 12,
              marginBottom: 6,
            }}>
              <InsightRow label="Asset Name" value={asset.name} />
              <InsightRow
                label="Private IP"
                value={asset.privateIp}
                mono
                copyValue={asset.privateIp}
                copyField="ip"
                copiedField={copiedField}
                onCopy={handleCopy}
              />
              <div style={{ height: 1, backgroundColor: colors.border, margin: "2px 0" }} />
              <InsightRow label="Misconfigurations" value={String(asset.misconfigurations)} accent="#ff7a1a" />
              <InsightRow label="Vulnerabilities" value={String(asset.vulnerabilities)} accent="#ff4d4f" />
            </div>

            {/* ══════════════  SECTION 2: Primary Action  ══════════════ */}

            <div style={{ margin: "16px 0" }}>
              <button
                onClick={() => navigate(`/assets/${asset.id}`, {
                  state: {
                    assetName: asset.name,
                    privateIp: asset.privateIp,
                    severity: asset.riskSeverity,
                    vulnerabilityCount: asset.vulnerabilities,
                    misconfigurationCount: asset.misconfigurations,
                    sourceAttackPathId: sourcePathId,
                    sourceAttackPathName: sourcePathName,
                    arn: asset.arn,
                    triggerType: asset.vulnerabilities > 0 ? "vulnerability" : asset.misconfigurations > 0 ? "misconfiguration" : "risk",
                    triggerRecordId: asset.vulnerabilities > 0 ? "v1" : asset.misconfigurations > 0 ? "m1" : "r1",
                  },
                })}
                style={{
                  width: "100%", height: 40, borderRadius: 10, border: "none",
                  background: "linear-gradient(135deg, #57b1ff 0%, #3d8bfd 100%)",
                  color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
                  transition: "opacity 150ms ease, box-shadow 150ms ease, transform 150ms ease",
                  boxShadow: "0 2px 12px rgba(87,177,255,0.20)",
                }}
                onMouseEnter={(e) => { const el = e.currentTarget as HTMLButtonElement; el.style.opacity = "0.90"; el.style.boxShadow = "0 4px 18px rgba(87,177,255,0.30)"; el.style.transform = "translateY(-1px)"; }}
                onMouseLeave={(e) => { const el = e.currentTarget as HTMLButtonElement; el.style.opacity = "1"; el.style.boxShadow = "0 2px 12px rgba(87,177,255,0.20)"; el.style.transform = "translateY(0)"; }}
              >
                <ExternalLink size={13} strokeWidth={2} />
                View Asset Details
              </button>
              
              {/* Create Case Button */}
              <button
                onClick={() => {
                  // Import case integration utilities
                  import("./case-management/case-integration").then(({ createCaseFromAttackPath }) => {
                    import("./case-management/case-data").then(({ addCase, addObservation, addPlaybooks }) => {
                      // Get the attack path data
                      const pathData = ATTACK_PATHS[sourcePathId];
                      if (!pathData) return;
                      
                      // Find the vulnerable node to extract CVE
                      const vulnNode = pathData.nodes.find(n => n.isVulnerable);
                      
                      // Build attack path context
                      const context = {
                        attackPathId: sourcePathId,
                        attackPathName: sourcePathName,
                        attackPathDescription: pathData.description,
                        priority: pathData.priority,
                        assetId: asset.id,
                        assetName: asset.name,
                        assetArn: asset.arn,
                        assetPrivateIp: asset.privateIp,
                        vulnerabilityCount: asset.vulnerabilities,
                        misconfigurationCount: asset.misconfigurations,
                        vulnerabilityId: vulnNode?.cve,
                        riskSeverity: asset.riskSeverity,
                        exposures: asset.exposures,
                        blastRadiusAssets: pathData.blastRadius.totalAssets,
                      };
                      
                      // Create case
                      const { caseData, initialObservation, recommendedPlaybooks } = createCaseFromAttackPath(context);
                      
                      // Add to case data store
                      addCase(caseData);
                      addObservation(caseData.id, initialObservation);
                      addPlaybooks(caseData.id, recommendedPlaybooks);
                      
                      // Navigate to case detail page
                      navigate(`/case-management/${caseData.id}`, {
                        state: {
                          fromAI: true,
                          fromAttackPath: true,
                          attackPathReturnPath: `/attack-paths/${sourcePathId}`,
                          initialTab: "investigation",
                          caseData,
                          initialObservation,
                          recommendedPlaybooks,
                        },
                      });
                    });
                  });
                }}
                style={{
                  width: "100%", height: 38, borderRadius: 10, marginTop: 10,
                  border: "1px solid rgba(240,91,6,0.35)",
                  background: "rgba(240,91,6,0.08)",
                  color: "#F05B06", fontSize: 12, fontWeight: 600, cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
                  transition: "background 150ms ease, border-color 150ms ease, transform 150ms ease",
                }}
                onMouseEnter={(e) => { const el = e.currentTarget as HTMLButtonElement; el.style.background = "rgba(240,91,6,0.14)"; el.style.borderColor = "rgba(240,91,6,0.50)"; el.style.transform = "translateY(-1px)"; }}
                onMouseLeave={(e) => { const el = e.currentTarget as HTMLButtonElement; el.style.background = "rgba(240,91,6,0.08)"; el.style.borderColor = "rgba(240,91,6,0.35)"; el.style.transform = "translateY(0)"; }}
              >
                <FileText size={13} strokeWidth={2} />
                Create Case
              </button>
            </div>

            {/* ══════════════  SECTION 3: Contributing Compliance Gaps  ══════════════ */}

            <div style={{ height: 1, backgroundColor: colors.border, marginBottom: 16 }} />

            <ComplianceGapsSection pathId={sourcePathId} navigate={navigate} />

            {/* ══════════════  SECTION 4: Exposed Via Network  ══════════════ */}

            <div style={{ height: 1, backgroundColor: colors.border, marginBottom: 16 }} />

            <InsightSectionLabel text="Network Exposure" />

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                <div style={{
                  width: 24, height: 24, borderRadius: 6, backgroundColor: "rgba(255,122,26,0.10)",
                  border: "1px solid rgba(255,122,26,0.22)", display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <Network size={12} color="#ff7a1a" strokeWidth={2} />
                </div>
                <span style={{ fontSize: 11.5, fontWeight: 600, color: colors.textPrimary }}>Exposed Via Network</span>
                <span style={{
                  marginLeft: "auto", fontSize: 8.5, fontWeight: 600, color: "rgba(255,122,26,0.75)",
                  padding: "2px 8px", borderRadius: 8, backgroundColor: "rgba(255,122,26,0.08)",
                  border: "1px solid rgba(255,122,26,0.12)",
                }}>
                  {exposures.length}
                </span>
              </div>

              <div style={{
                display: "flex", flexDirection: "column", gap: 0, borderRadius: 8,
                border: `1px solid ${colors.border}`, overflow: "hidden",
              }}>
                {exposures.map((exp, idx) => (
                  <div
                    key={`exp-${idx}`}
                    style={{
                      display: "flex", gap: 10, padding: "10px 12px",
                      backgroundColor: idx % 2 === 0 ? "rgba(255,122,26,0.015)" : "transparent",
                      borderBottom: idx < exposures.length - 1 ? `1px solid rgba(255,255,255,0.035)` : "none",
                    }}
                  >
                    <span style={{
                      width: 20, height: 20, borderRadius: 5, flexShrink: 0,
                      backgroundColor: "rgba(255,122,26,0.10)", border: "1px solid rgba(255,122,26,0.22)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 9, fontWeight: 700, color: "#ff7a1a",
                    }}>
                      {idx + 1}
                    </span>
                    <span style={{ fontSize: 10.5, color: colors.textSecondary, lineHeight: "1.55", paddingTop: 1 }}>
                      {exp}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Contributing compliance gaps section (shown inside InsightsPanel) ── */
function ComplianceGapsSection({ pathId, navigate }: { pathId: string; navigate: ReturnType<typeof useNavigate> }) {
  const gaps = getControlsForPath(pathId);
  if (gaps.length === 0) return null;

  return (
    <div style={{ marginBottom: 16 }}>
      <InsightSectionLabel text="Contributing Compliance Gaps" />
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {gaps.map(gap => {
          const sevColor =
            gap.severity === "critical" ? "#ef4444"
            : gap.severity === "high" ? "#f97316"
            : gap.severity === "medium" ? "#f59e0b"
            : "#22c55e";
          return (
            <div
              key={gap.gapId}
              style={{
                padding: "10px 12px",
                borderRadius: 8,
                background: `${sevColor}0d`,
                border: `1px solid ${sevColor}28`,
                display: "flex",
                flexDirection: "column",
                gap: 4,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{
                  fontSize: 9, fontWeight: 700, color: sevColor,
                  textTransform: "uppercase", letterSpacing: "0.05em",
                  padding: "1px 6px", borderRadius: 4,
                  background: `${sevColor}18`, border: `1px solid ${sevColor}30`,
                  flexShrink: 0,
                }}>
                  {gap.severity}
                </span>
                <span style={{ fontSize: 10, fontWeight: 600, color: colors.textPrimary }}>
                  {gap.control}
                </span>
                <span style={{ fontSize: 10, color: colors.textDim }}>· {gap.framework}</span>
              </div>
              <p style={{ margin: 0, fontSize: 10.5, color: colors.textSecondary, lineHeight: "1.45" }}>
                {gap.title}
              </p>
              <p style={{ margin: 0, fontSize: 9.5, color: colors.textDim, lineHeight: "1.4" }}>
                {gap.contribution}
              </p>
              <button
                onClick={() => navigate("/compliance")}
                style={{
                  marginTop: 4, padding: "4px 10px", borderRadius: 6, cursor: "pointer",
                  fontSize: 10, fontWeight: 600, color: sevColor,
                  background: `${sevColor}10`, border: `1px solid ${sevColor}28`,
                  alignSelf: "flex-start", transition: "background 120ms ease",
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = `${sevColor}1e`; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = `${sevColor}10`; }}
              >
                View in Compliance →
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── Small section label ── */
function InsightSectionLabel({ text }: { text: string }) {
  return (
    <span style={{
      fontSize: 8.5, fontWeight: 700, color: colors.textDim, textTransform: "uppercase",
      letterSpacing: "0.1em", marginBottom: 10, display: "block",
    }}>
      {text}
    </span>
  );
}

/* ── Copy button with feedback ── */
function InsightCopyBtn({
  value, field, copiedField, onCopy,
}: {
  value: string; field: string; copiedField: string | null; onCopy: (v: string, f: string) => void;
}) {
  const isCopied = copiedField === field;
  return (
    <button
      onClick={() => onCopy(value, field)}
      title={isCopied ? "Copied!" : "Copy to clipboard"}
      style={{
        width: 22, height: 22, borderRadius: 5, flexShrink: 0,
        border: `1px solid ${isCopied ? "rgba(12,207,146,0.35)" : colors.border}`,
        backgroundColor: isCopied ? "rgba(12,207,146,0.08)" : "transparent",
        display: "flex", alignItems: "center", justifyContent: "center",
        cursor: "pointer", transition: "all 150ms ease",
      }}
      onMouseEnter={(e) => { if (!isCopied) (e.currentTarget as HTMLButtonElement).style.backgroundColor = "rgba(255,255,255,0.06)"; }}
      onMouseLeave={(e) => { if (!isCopied) (e.currentTarget as HTMLButtonElement).style.backgroundColor = "transparent"; }}
    >
      {isCopied
        ? <Check size={11} color="#0ccf92" strokeWidth={2.5} />
        : <Copy size={11} color={colors.textDim} strokeWidth={2} />
      }
    </button>
  );
}

function InsightRow({
  label, value, mono, accent, copyValue, copyField, copiedField, onCopy,
}: {
  label: string; value: string; mono?: boolean; accent?: string;
  copyValue?: string; copyField?: string; copiedField?: string | null;
  onCopy?: (v: string, f: string) => void;
}) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
      <span style={{ fontSize: 10, color: colors.textDim, flexShrink: 0 }}>{label}</span>
      <div style={{ display: "flex", alignItems: "center", gap: 5, minWidth: 0 }}>
        <span style={{
          fontSize: 10.5, fontWeight: 600,
          color: accent || colors.textPrimary,
          fontFamily: mono ? "monospace" : "inherit",
          textAlign: "right", minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
        }}>
          {value}
        </span>
        {copyValue && copyField && onCopy && (
          <InsightCopyBtn value={copyValue} field={copyField} copiedField={copiedField ?? null} onCopy={onCopy} />
        )}
      </div>
    </div>
  );
}

/* ================================================================
   DETAIL PAGE
   ================================================================ */

export default function AttackPathDetailPage() {
  const { pathId } = useParams<{ pathId: string }>();
  const navigate = useNavigate();
  const { setPageContext } = useAiBox();
  const { persona } = usePersona();
  const resolvedPathId = pathId || "";
  const knownPath = resolvedPathId in ATTACK_PATHS;
  const pathData = knownPath ? ATTACK_PATHS[resolvedPathId] : DEFAULT_PATH;
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  useEffect(() => {
    // Skip context setup for unknown paths — not-found guard renders below
    if (!knownPath) return;

    const contributingGaps = getControlsForPath(resolvedPathId);
    const gapSummary = contributingGaps.length > 0
      ? contributingGaps.map(g => `${g.control} (${g.framework}): ${g.title}`).join("; ")
      : "No mapped compliance gaps for this path.";

    setPageContext({
      type: "general" as const,
      label: pathData.name,
      sublabel: "Attack Path Graph",
      contextKey: `attack-path-detail:${resolvedPathId}`,
      greeting: `**${pathData.name}** — ${pathData.priority.toUpperCase()} priority path with a blast radius of **${pathData.blastRadius.totalAssets} assets**. ${pathData.blastRadius.totalVulnerabilities} vulnerabilities and ${pathData.blastRadius.totalMisconfigurations} misconfigurations are in scope.${contributingGaps.length > 0 ? ` ${contributingGaps.length} compliance gap${contributingGaps.length > 1 ? "s" : ""} contribute to reachability.` : ""} I can walk through each hop, explain the blast radius, or help you build a remediation case.`,
      suggestions: getPersonaAiBoxSuggestions("attack-path", persona, pathData.name, undefined, resolvedPathId),
      // Graph context — compliance gaps that enable this path
      graphContext: {
        pathId: resolvedPathId,
        priority: pathData.priority,
        contributingGaps: contributingGaps.map(g => ({
          control: g.control,
          framework: g.framework,
          title: g.title,
          severity: g.severity,
          contribution: g.contribution,
        })),
        gapSummary,
        blastRadiusAssets: pathData.blastRadius.totalAssets,
      },
    });
  }, [setPageContext, pathData.name, pathData.priority, pathData.blastRadius.totalAssets, resolvedPathId]);

  const handleSelectNode = useCallback((nodeId: string | null, _node?: PathNode) => {
    setSelectedNodeId(nodeId);
  }, []);

  // Guard (after all hooks): unknown pathId — clean not-found state, no misleading skeleton
  if (!knownPath) {
    return (
      <div className="flex-1 flex items-center justify-center" style={{ backgroundColor: colors.bgApp }}>
        <div className="flex flex-col items-center gap-4 text-center">
          <AlertTriangle size={32} color={colors.textDim} strokeWidth={1.5} />
          <p className="font-['Inter',sans-serif] text-[14px]" style={{ color: colors.textPrimary }}>
            Attack path not found
          </p>
          <p className="font-['Inter',sans-serif] text-[12px]" style={{ color: colors.textDim }}>
            Path <code style={{ color: colors.accent, fontFamily: "monospace" }}>{pathId}</code> does not exist.
          </p>
          <button
            onClick={() => navigate("/attack-paths")}
            className="flex items-center gap-2 rounded-lg px-4 py-2 text-[12px] transition-colors cursor-pointer"
            style={{ backgroundColor: `${colors.accent}14`, border: `1px solid ${colors.accent}30`, color: colors.accent }}
          >
            <ArrowLeft size={12} /> Back to Attack Paths
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full min-h-screen" style={{ backgroundColor: colors.bgApp }}>
      {/* Header — sticky context bar */}
      <div className="shrink-0 sticky top-0 z-[50] flex items-center gap-3 px-5 py-2 border-b" style={{ borderColor: colors.border, backgroundColor: colors.bgApp }}>
        <button
          onClick={() => navigate('/attack-paths')}
          className="flex items-center justify-center w-7 h-7 rounded-lg border transition-colors hover:bg-[rgba(87,177,255,0.08)]"
          style={{ borderColor: colors.border }}
          aria-label="Back to Attack Paths"
        >
          <ArrowLeft size={14} color={colors.textMuted} />
        </button>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/attack-paths')}
            className="text-[13px] transition-colors hover:text-white"
            style={{ color: colors.textDim, background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: 'inherit' }}
          >
            Attack Paths
          </button>
          <span className="text-[12px]" style={{ color: colors.textDim }}>/</span>
          <span className="text-[13px] font-semibold" style={{ color: colors.textPrimary }}>{pathData.name}</span>
        </div>
        <Badge tone={pathData.priority} size="sm">{pathData.priority}</Badge>
        <div className="ml-auto flex items-center gap-5">
          <MetricPill label="Assets" value={pathData.assets} color="#57b1ff" />
          <MetricPill label="Misconfigs" value={pathData.misconfigurations} color="#ff7a1a" />
          <MetricPill label="Vulns" value={pathData.vulnerabilities} color="#ff4d4f" />
        </div>
        <button
          onClick={() => {
            import("./case-management/case-integration").then(({ createCaseFromAttackPath }) => {
              import("./case-management/case-data").then(({ addCase, addObservation, addPlaybooks }) => {
                const vulnNode = pathData.nodes.find(n => n.isVulnerable);
                const context = {
                  attackPathId: resolvedPathId,
                  attackPathName: pathData.name,
                  attackPathDescription: pathData.description,
                  priority: pathData.priority,
                  vulnerabilityCount: pathData.vulnerabilities,
                  misconfigurationCount: pathData.misconfigurations,
                  vulnerabilityId: vulnNode?.cve,
                  blastRadiusAssets: pathData.blastRadius.totalAssets,
                };
                const { caseData, initialObservation, recommendedPlaybooks } = createCaseFromAttackPath(context);
                addCase(caseData);
                addObservation(caseData.id, initialObservation);
                addPlaybooks(caseData.id, recommendedPlaybooks);
                navigate(`/case-management/${caseData.id}`, {
                  state: { fromAI: true, fromAttackPath: true, attackPathReturnPath: `/attack-paths/${resolvedPathId}`, initialTab: "investigation", caseData, initialObservation, recommendedPlaybooks },
                });
              });
            });
          }}
          className="flex items-center gap-2 px-3 h-8 rounded-lg border text-[12px] font-semibold transition-all hover:bg-[rgba(240,91,6,0.10)]"
          style={{ borderColor: "rgba(240,91,6,0.35)", color: "#F05B06" }}
        >
          <FileText size={13} strokeWidth={2} />
          Create Case
        </button>
      </div>

      {/* Main content: Full-width Graph canvas */}
      <div className="flex-1 flex flex-col p-2 overflow-hidden" style={{ minHeight: 0 }}>
        <GraphCanvas pathData={pathData} pathId={resolvedPathId} selectedNodeId={selectedNodeId} onSelectNode={handleSelectNode} />
        {/* Graph exploration hint */}
        <div className="shrink-0 flex items-center justify-center gap-[20px] py-[8px] px-4">
          <span className="text-[10px] font-['Inter',sans-serif] tracking-[0.01em]" style={{ color: colors.textMuted }}>
            <span style={{ color: colors.accent, fontWeight: 600 }}>Click any node</span> to inspect its CVE and exposure details
            <span style={{ color: colors.textDim, margin: "0 8px" }}>·</span>
            <span style={{ color: colors.accent, fontWeight: 600 }}>Hover the blast radius pill</span> to see all exposed assets
            <span style={{ color: colors.textDim, margin: "0 8px" }}>·</span>
            <span style={{ color: colors.accent, fontWeight: 600 }}>Ask AI</span> to walk through each hop in plain language
          </span>
        </div>
      </div>
    </div>
  );
}

/* ================================================================
   METRIC PILL (header)
   ================================================================ */

function MetricPill({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
      <span className="text-[10px] uppercase tracking-wider" style={{ color: colors.textDim }}>{label}</span>
      <span className="text-[13px] font-semibold" style={{ color }}>{value}</span>
    </div>
  );
}