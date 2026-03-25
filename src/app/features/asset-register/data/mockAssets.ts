import type { Asset, AssetStatus, AssetTier, AssetType, AssetVendor } from "./assetTypes";

/* ── Accounts ── */
const AWS_ACCOUNTS = ["Prod-Primary-AWS", "Shared-Services-AWS", "Security-AWS", "Dev-AWS"];
const AZURE_ACCOUNTS = ["Prod-Primary-Azure", "Dev-Azure"];
const GCP_ACCOUNTS = ["Prod-Primary-GCP", "Dev-GCP"];

/* ── Regions ── */
const AWS_REGIONS = ["us-east-1", "us-east-2", "us-west-2", "eu-west-1", "ap-southeast-1"];
const AZURE_REGIONS = ["eastus", "westeurope", "eastus2", "northeurope"];
const GCP_REGIONS = ["us-central1", "europe-west1", "us-east1"];

const owners = [
  "Liam Carter", "Ella Smith", "Noah Lee", "Ava Brown", "Mia Davis",
  "Ethan Wilson", "Zoe Johnson", "Lucas White", "Sophie Green", "Jack Taylor",
  "Chloe Martinez", "Oliver Anderson",
];
const custodians = ["Engineering", "Platform", "Security", "Infrastructure", "CloudOps", "DevOps"];

const tiers: AssetTier[] = ["Primary", "Secondary"];
const statuses: AssetStatus[] = ["Active", "Running", "Stopped", "Decommissioned", "Terminated", "Open"];

/* ── Service catalogues per vendor/type ── */
const awsServices: Record<AssetType, string[]> = {
  Server:          ["EC2 Instance", "EC2 Auto Scaling", "Lightsail", "Elastic Beanstalk"],
  Database:        ["RDS Aurora", "RDS Postgres", "DynamoDB", "ElastiCache Redis", "Redshift Cluster"],
  "Cloud Resource":["S3 Bucket", "Lambda Function", "ECS Fargate", "EKS Cluster", "CloudFront CDN", "SNS Topic", "SQS Queue"],
  Endpoint:        ["CloudTrail", "IAM Role", "SSO Portal", "API Gateway", "CloudWatch Agent"],
  Network:         ["VPC", "Subnet", "Load Balancer", "Transit Gateway", "Route 53"],
};

const azureServices: Record<AssetType, string[]> = {
  Server:          ["VM Instance", "VM Scale Set", "Dedicated Host"],
  Database:        ["Azure SQL", "CosmosDB", "PostgreSQL Flexible", "MySQL Flexible"],
  "Cloud Resource":["Blob Storage", "Azure Functions", "AKS Cluster", "App Service", "Managed Cluster"],
  Endpoint:        ["Entra ID App", "Key Vault", "Jump Host"],
  Network:         ["VNet", "NSG", "Azure Load Balancer", "VNet Gateway"],
};

const gcpServices: Record<AssetType, string[]> = {
  Server:          ["Compute Engine", "GKE Node", "App Engine"],
  Database:        ["Cloud SQL", "Firestore", "BigQuery Dataset", "Spanner"],
  "Cloud Resource":["Cloud Storage", "Cloud Run", "Pub/Sub Topic", "Artifact Registry"],
  Endpoint:        ["IAM Service Account", "Cloud Endpoints"],
  Network:         ["VPC Network", "Cloud Load Balancer", "Cloud DNS"],
};

function pick<T>(arr: T[], seed: number): T {
  return arr[((seed % arr.length) + arr.length) % arr.length];
}

function makeDate(month: number, day: number, hour: number, minute: number) {
  const m = String(month).padStart(2, "0");
  const d = String(day).padStart(2, "0");
  const h = String(hour).padStart(2, "0");
  const mn = String(minute).padStart(2, "0");
  return `2024-${m}-${d} ${h}:${mn}:00`;
}

interface Spec { vendor: AssetVendor; account: string; region: string; type: AssetType }

/** Build 150 specs: ~90 AWS · ~35 Azure · ~25 GCP */
function buildSpecs(): Spec[] {
  const specs: Spec[] = [];

  // AWS — weighted towards prod accounts and varied types
  const awsTypePool: AssetType[] = [
    "Server", "Server", "Server", "Server", "Server",
    "Database", "Database", "Database", "Database",
    "Cloud Resource", "Cloud Resource", "Cloud Resource", "Cloud Resource", "Cloud Resource", "Cloud Resource",
    "Endpoint", "Endpoint", "Endpoint",
    "Network", "Network", "Network",
  ];
  for (let i = 0; i < 90; i++) {
    specs.push({
      vendor: "AWS",
      account: pick(AWS_ACCOUNTS, i * 7 + 3),
      region: pick(AWS_REGIONS, i * 3 + 11),
      type: pick(awsTypePool, i),
    });
  }

  // Azure
  const azureTypePool: AssetType[] = [
    "Server", "Server", "Server",
    "Database", "Database", "Database",
    "Cloud Resource", "Cloud Resource", "Cloud Resource", "Cloud Resource",
    "Endpoint", "Endpoint",
    "Network", "Network", "Network",
    "Server", "Database", "Cloud Resource",
    "Endpoint", "Network",
    "Server", "Cloud Resource",
    "Database", "Network", "Server",
    "Cloud Resource", "Endpoint", "Server", "Database", "Network",
    "Cloud Resource", "Server", "Database", "Network", "Endpoint",
  ];
  for (let i = 0; i < 35; i++) {
    specs.push({
      vendor: "Azure",
      account: pick(AZURE_ACCOUNTS, i),
      region: pick(AZURE_REGIONS, i * 2 + 1),
      type: pick(azureTypePool, i),
    });
  }

  // GCP
  const gcpTypePool: AssetType[] = [
    "Server", "Database", "Cloud Resource", "Cloud Resource", "Network",
    "Endpoint", "Server", "Database", "Cloud Resource", "Network",
    "Server", "Database", "Cloud Resource", "Endpoint", "Network",
    "Server", "Cloud Resource", "Database", "Network", "Server",
    "Cloud Resource", "Database", "Endpoint", "Network", "Server",
  ];
  for (let i = 0; i < 25; i++) {
    specs.push({
      vendor: "GCP",
      account: pick(GCP_ACCOUNTS, i),
      region: pick(GCP_REGIONS, i * 2),
      type: pick(gcpTypePool, i),
    });
  }

  return specs;
}

const allSpecs = buildSpecs(); // 150 total

function makeAsset(spec: Spec, index: number): Asset {
  const { vendor, account, region, type } = spec;

  const serviceMap =
    vendor === "AWS" ? awsServices
    : vendor === "Azure" ? azureServices
    : gcpServices;

  const service = pick(serviceMap[type], index + type.length + vendor.length);
  const tier = pick(tiers, index);
  const status = pick(statuses, index * 3 + 1);

  const group =
    type === "Server" ? "Instances"
    : type === "Database" ? "Databases"
    : type === "Cloud Resource" ? "Assets"
    : type === "Endpoint" ? "Endpoints"
    : "Networks";

  const namePrefix =
    type === "Server" ? "srv"
    : type === "Database" ? "db"
    : type === "Cloud Resource" ? "res"
    : type === "Endpoint" ? "end"
    : "net";

  const rawName = service.toLowerCase().replace(/\s+/g, "-");

  // Prod / Security accounts carry more findings
  const isProd = account.includes("Prod") || account.includes("Security");
  const critVulns  = isProd ? (index % 4)       : (index % 2);
  const highVulns  = isProd ? ((index % 6) + 1) : ((index % 3) + 1);
  const critMisconfig = isProd ? (index % 3)    : (index % 2);
  const highMisconfig = (index % 5) + 1;

  return {
    id: `${namePrefix}-${String(index + 1).padStart(4, "0")}`,
    name: `${rawName}-${String(index + 1).padStart(3, "0")}`,
    type,
    group,
    vendor,
    account,
    region,
    service,
    tier,
    cia: { c: index % 4, i: (index + 1) % 4, a: (index + 2) % 4 },
    firstSeen: makeDate((index % 9) + 1, (index % 27) + 1, 9 + (index % 8), (index * 7) % 60),
    lastSeen:  makeDate((index % 9) + 2, (index % 27) + 1, 10 + (index % 8), (index * 11) % 60),
    status,
    owner: pick(owners, index),
    custodian: pick(custodians, index),
    vulnerabilities: { critical: critVulns, high: highVulns },
    misconfig:       { critical: critMisconfig, high: highMisconfig },
  };
}

export const mockAssets: Asset[] = allSpecs.map((spec, i) => makeAsset(spec, i));
