/* ================================================================
   ASSET REGISTER — Shared Data Bridge
   Uses src/app/features/asset-register as the source of truth,
   while preserving the page-level shapes used by AssetRegisterPage.
   ================================================================ */

import {
  getAssetNodes,
  getAssetVulnerabilities,
  getAssetMisconfigurations,
  getConnectedAssets,
  getAssetGraphSummary,
} from "../../shared/graph/adapters";

import { mockAssets } from "../../features/asset-register/data/mockAssets";
import {
  getAssetDistribution,
  getDashboardStats,
  getTrendData,
} from "../../features/asset-register/utils/assetTransforms";

export type Severity = "critical" | "high" | "medium" | "low" | "informational";
export type SecurityPlane = "Infrastructure" | "Cloud" | "Network" | "Identity" | "Application";
export type AssetGroup = "Cloud" | "Servers" | "Data" | "Endpoints" | "Network";

export interface Asset {
  id: string;
  accountId: string;
  accountName: string;
  vendor: string;
  name: string;
  securityPlane: SecurityPlane;
  assetType: AssetGroup;
  service: string;
  ciaC: number;
  ciaI: number;
  ciaA: number;
  owner: string;
  custodian: string;
  severity: Severity;
  arn: string;
  region: string;
  assetGroup: AssetGroup;
  assetService: string;
  riskScore: number;
  vulnerabilityCount: number;
  misconfigurationCount: number;
  lastScanned: string;
  ciaValue: string;
}

export interface RiskRow {
  id: string;
  mainCategory: string;
  message: string;
  subCategory: string;
  riskOwner: string;
  riskClass: Severity;
  lastUpdated: string;
}

export interface Vulnerability {
  id: string;
  name: string;
  description: string;
  cvssScore: number | null;
  kev: boolean;
  severity: Severity;
  published: string;
  source: string;
  firstSeen: string;
}

export interface Misconfiguration {
  id: string;
  name: string;
  remediation: string;
  compliance: string;
  severity: Severity;
}

export interface Software {
  id: string;
  name: string;
  description: string;
  vendor: string;
  architecture: string;
  size: number;
  version: string;
}

function mapTypeToAssetGroup(type: string): AssetGroup {
  switch (type) {
    case "Server":
      return "Servers";
    case "Database":
      return "Data";
    case "Cloud Resource":
      return "Cloud";
    case "Endpoint":
      return "Endpoints";
    case "Network":
      return "Network";
    default:
      return "Cloud";
  }
}

function mapTypeToSecurityPlane(type: string): SecurityPlane {
  switch (type) {
    case "Cloud Resource":
      return "Cloud";
    case "Network":
      return "Network";
    case "Endpoint":
      return "Identity";
    case "Server":
    case "Database":
      return "Infrastructure";
    default:
      return "Infrastructure";
  }
}

function computeRiskScore(
  vulnerabilityCount: number,
  misconfigurationCount: number,
  ciaC: number,
  ciaI: number,
  ciaA: number
): number {
  const raw =
    vulnerabilityCount * 0.55 +
    misconfigurationCount * 0.45 +
    ciaC * 0.7 +
    ciaI * 0.7 +
    ciaA * 0.7;

  return Math.min(10, Number(raw.toFixed(1)));
}

function computeSeverity(riskScore: number): Severity {
  if (riskScore >= 9) return "critical";
  if (riskScore >= 6.5) return "high";
  if (riskScore >= 4) return "medium";
  if (riskScore >= 1.5) return "low";
  return "informational";
}

function buildArn(vendor: string, region: string, service: string, id: string) {
  const safeService = service.toLowerCase().replace(/\s+/g, "_");
  if (vendor === "AWS") {
    return `arn:aws:${safeService}:${region}:demo-account:${id}`;
  }
  if (vendor === "Azure") {
    return `/subscriptions/demo/resourceGroups/default/providers/${safeService}/${id}`;
  }
  return `projects/demo/${region}/${safeService}/${id}`;
}

function buildAccountId(vendor: string, account: string) {
  return `${vendor.toLowerCase()}-${account.toLowerCase().replace(/\s+/g, "-")}`;
}

/* ── ASSETS TABLE / source for page filters ── */
export const ASSETS: Asset[] = mockAssets.map((asset) => {
  const vulnerabilityCount =
    (asset.vulnerabilities?.critical ?? 0) + (asset.vulnerabilities?.high ?? 0);

  const misconfigurationCount =
    (asset.misconfig?.critical ?? 0) + (asset.misconfig?.high ?? 0);

  const ciaC = asset.cia?.c ?? 0;
  const ciaI = asset.cia?.i ?? 0;
  const ciaA = asset.cia?.a ?? 0;

  const assetGroup = mapTypeToAssetGroup(asset.type);
  const securityPlane = mapTypeToSecurityPlane(asset.type);
  const riskScore = computeRiskScore(
    vulnerabilityCount,
    misconfigurationCount,
    ciaC,
    ciaI,
    ciaA
  );
  const severity = computeSeverity(riskScore);

  return {
    id: asset.id,
    accountId: buildAccountId(asset.vendor, asset.account),
    accountName: asset.account,
    vendor: asset.vendor,
    name: asset.name,
    securityPlane,
    assetType: assetGroup,
    service: asset.service,
    ciaC,
    ciaI,
    ciaA,
    owner: asset.owner || "",
    custodian: asset.custodian || "",
    severity,
    arn: buildArn(asset.vendor, asset.region, asset.service, asset.id),
    region: asset.region,
    assetGroup,
    assetService: asset.service,
    riskScore,
    vulnerabilityCount,
    misconfigurationCount,
    lastScanned: asset.lastSeen,
    ciaValue: `${ciaC}${ciaI}${ciaA}`,
  };
});

const dashboardStats = getDashboardStats(mockAssets);
const trendData = getTrendData();
const typeDistribution = getAssetDistribution(mockAssets);

export const KPI_DATA = {
  totalAssets: dashboardStats.totalAssets,
  newlyAdded: dashboardStats.newlyAddedAssets,
  ownershipCoverage: dashboardStats.ownershipCoverage,
  ownershipDelta: "+6.4%",
  classificationCoverage: dashboardStats.classificationCoverage,
  classificationDelta: "+4.1%",
  highRiskAssets: dashboardStats.highRiskAssets,
  highRiskDelta: "+3 vs last week",
};

export const INVENTORY_TREND = trendData;

const typeColorMap: Record<string, string> = {
  Server: "#FF5757",
  Database: "#FF740A",
  "Cloud Resource": "#f5b301",
  Endpoint: "#5b6abf",
  Network: "#2FD897",
};

const typeLabelMap: Record<string, string> = {
  Server: "Servers",
  Database: "Database",
  "Cloud Resource": "Cloud Resources",
  Endpoint: "Endpoints",
  Network: "Networks",
};

export const TYPE_DISTRIBUTION = typeDistribution.map((item) => ({
  type: typeLabelMap[item.name] || item.name,
  count: item.value,
  color: typeColorMap[item.name] || "#57b1ff",
}));

export const RISK_INDICATORS = [
  {
    label: "Assets with Critical Vulnerabilities",
    count: dashboardStats.assetsWithCriticalVulnerabilities,
  },
  {
    label: "Assets with Misconfigurations",
    count: dashboardStats.assetsWithMisconfigurations,
  },
  {
    label: "Externally Exposed Assets",
    count: dashboardStats.externallyExposedAssets,
  },
  {
    label: "Assets in KEV Attack Paths",
    count: dashboardStats.assetsInKevAttackPaths,
  },
];

/* ── Per-Asset Detail Data ── */
export function getRisks(assetId: string): RiskRow[] {
  return [
    {
      id: "r1",
      mainCategory: "Initial Access",
      message:
        "An integer overflow can be triggered in SQLite's 'concat_ws()' function. The resulting, truncated integer is then used to allocate a buffer. When SQLite then writes the resulting string to the buffer, it uses the original, untruncated size and thus a wild Heap Buffer overflow of size ~4GB can be triggered. This can result in arbitrary code execution.",
      subCategory: "Exploit Public-Facing Application",
      riskOwner: "",
      riskClass: "critical",
      lastUpdated: "2026-02-13",
    },
    {
      id: "r2",
      mainCategory: "Initial Access",
      message:
        "Increasing the resolution of video frames, while performing a multi-threaded encode, can result in a heap overflow in avf_loop_restoration_dealloc().",
      subCategory: "Exploit Public-Facing Application",
      riskOwner: "",
      riskClass: "critical",
      lastUpdated: "2026-02-14",
    },
    {
      id: "r3",
      mainCategory: "Initial Access",
      message:
        "ImageMagick is free and open-source software used for editing and manipulating digital images. In versions prior to 7.1.2-0 and 6.9.13-26, in ImageMagick's 'magick montify' command, specifying multiple consecutive '%d' format specifiers in a filename template causes internal pointer arithmetic to generate an address below the beginning of the stack buffer, resulting in a stack buffer overflow through 'vsnprintf()'. Versions 7.1.2-0 and 6.9.13-26 fix the issue.",
      subCategory: "Exploit Public-Facing Application",
      riskOwner: "",
      riskClass: "critical",
      lastUpdated: "2026-02-13",
    },
    {
      id: "r4",
      mainCategory: "Initial Access",
      message:
        "ImageMagick is free and open-source software used for editing and manipulating digital images. Versions prior to 7.1.2-0 and 6.9.13-26 have a heap buffer overflow in the 'InterpretImageFilename' function. The issue stems from an off-by-one error that causes out-of-bounds memory access when processing format strings containing consecutive percent signs ('%%'). Versions 7.1.2-0 and 6.9.13-26 fix the issue.",
      subCategory: "Exploit Public-Facing Application",
      riskOwner: "",
      riskClass: "critical",
      lastUpdated: "2026-02-13",
    },
    {
      id: "r5",
      mainCategory: "Initial Access",
      message:
        "ImageMagick is free and open-source software used for editing and manipulating digital images. Prior to versions 7.1.2-13 and 6.9.13-38, a heap buffer overflow vulnerability in the XBM Image decoder (ReadXBMImage) allows an attacker to write controlled data to upload and processing.",
      subCategory: "Exploit Public-Facing Application",
      riskOwner: "",
      riskClass: "critical",
      lastUpdated: "2026-02-13",
    },
  ];
}

export function getVulnerabilities(assetId: string): Vulnerability[] {
  return [
    {
      id: "v1",
      name: "CVE-2012-4542",
      description:
        "block/scsi_ioctl.c in the Linux kernel through 3.8 does not properly consider the SCSI device class during authorization of SCSI commands, which allows local users to bypass intended access restrictions via an SG_IO ioctl call that leverages overlapping opcodes.",
      cvssScore: null,
      kev: false,
      severity: "informational",
      published: "2013-02-28",
      source: "Wazuh, Inc.",
      firstSeen: "06/02/2026 16:22 (31 days)",
    },
    {
      id: "v2",
      name: "CVE-2013-7445",
      description:
        "The Direct Rendering Manager (DRM) subsystem in the Linux kernel through 4.x mishandles requests for Graphics Execution Manager (GEM) objects, which allows context-dependent attackers to cause a denial of service (memory consumption) via an application that processes graphics data, as demonstrated by JavaScript code that creates many CANVAS elements for rendering by Chrome or Firefox.",
      cvssScore: null,
      kev: false,
      severity: "informational",
      published: "2015-10-16",
      source: "Wazuh, Inc.",
      firstSeen: "06/02/2026 16:22 (31 days)",
    },
    {
      id: "v3",
      name: "CVE-2015-7837",
      description:
        "The Linux kernel, as used in Red Hat Enterprise Linux 7, kernel-rt, and Enterprise MRG 2 and when booted with UEFI Secure Boot enabled, allows local users to bypass intended securelevel/secureboot restrictions by leveraging improper handling of secure_boot flag across kexec reboot.",
      cvssScore: 5.5,
      kev: false,
      severity: "medium",
      published: "2017-09-19",
      source: "Wazuh, Inc.",
      firstSeen: "06/02/2026 16:22 (31 days)",
    },
    {
      id: "v4",
      name: "CVE-2015-8553",
      description:
        "Xen allows guest OS users to obtain sensitive information from uninitialized locations in host OS kernel memory by not enabling memory and I/O decoding control bits. NOTE: this vulnerability exists because of an incomplete fix for CVE-2015-0777.",
      cvssScore: 6.5,
      kev: false,
      severity: "medium",
      published: "2016-04-13",
      source: "Wazuh, Inc.",
      firstSeen: "06/02/2026 16:22 (31 days)",
    },
    {
      id: "v5",
      name: "CVE-2016-2568",
      description:
        "pkexec, when used with --user nonpriv, allows local users to escape to the parent session via a crafted TIOCSTI ioctl call, which pushes characters to the terminal's input buffer.",
      cvssScore: 7.8,
      kev: false,
      severity: "medium",
      published: "2017-02-13",
      source: "Wazuh, Inc.",
      firstSeen: "06/02/2026 16:22 (31 days)",
    },
  ];
}

export function getMisconfigurations(assetId: string): Misconfiguration[] {
  return [
    {
      id: "m1",
      name: "EC2 Instance i-0ae0cdf2d8501f270 has IMDSv2 disabled or not required.",
      remediation:
        "If you don't need IMDS you can turn it off. Using aws-cli you can force the instance to use only IMDSv2.",
      compliance: "CIS-5.0, AWS-Well-Architected-Framework-Security-Pillar",
      severity: "high",
    },
    {
      id: "m2",
      name: "EC2 Instance i-0ae0cdf2d8501f270 at IP 44.213.119.144 is Internet-facing with Instance Profile arn:aws:iam::917880208823:instance-profile/Elasticsearch.",
      remediation: "Use an ALB and apply WAF ACL.",
      compliance: "AWS-Well-Architected-Framework-Security-Pillar",
      severity: "medium",
    },
    {
      id: "m3",
      name: "EC2 Instance i-0ae0cdf2d8501f270 is not managed by Systems Manager.",
      remediation: "Verify and apply Systems Manager Prerequisites.",
      compliance: "AWS-Well-Architected-Framework-Security-Pillar",
      severity: "medium",
    },
    {
      id: "m4",
      name: "EC2 Instance i-0ae0cdf2d8501f270 has a Public IP: 44.213.119.144 (ec2-44-213-119-144.compute-1.amazonaws.com).",
      remediation: "Use an ALB and apply WAF ACL.",
      compliance: "AWS-Well-Architected-Framework-Security-Pillar",
      severity: "medium",
    },
  ];
}

export function getSoftware(_assetId: string): Software[] {
  return [
    {
      id: "sw1",
      name: "acpid",
      description: "Advanced Configuration and Power Interface event daemon",
      vendor: "Ubuntu Developers <ubuntu-devel-discuss@lists.ubuntu.com>",
      architecture: "amd64",
      size: 150,
      version: "1:2.0.33-1ubuntu1",
    },
    {
      id: "sw2",
      name: "ansible",
      description: "Configuration management, deployment, and task execution system",
      vendor: "Ubuntu Developers <ubuntu-devel-discuss@lists.ubuntu.com>",
      architecture: "all",
      size: 198790,
      version: "2.10.7+merged+base+2.10.8+dfsg-1",
    },
    {
      id: "sw3",
      name: "apparmor",
      description: "user-space parser utility for AppArmor",
      vendor: "Ubuntu Developers <ubuntu-devel-discuss@lists.ubuntu.com>",
      architecture: "amd64",
      size: 2680,
      version: "3.0.4-2ubuntu2.4",
    },
    {
      id: "sw4",
      name: "apport",
      description: "automatically generate crash reports for debugging",
      vendor: "Ubuntu Developers <ubuntu-devel-discuss@lists.ubuntu.com>",
      architecture: "all",
      size: 818,
      version: "2.20.11-0ubuntu82.10",
    },
    {
      id: "sw5",
      name: "apport-symptoms",
      description: "symptom scripts for apport",
      vendor: "Ubuntu Developers <ubuntu-motu@lists.ubuntu.com>",
      architecture: "all",
      size: 61,
      version: "0.24",
    },
  ];
}

/* ================================================================
   GRAPH-BACKED QUERIES
   ================================================================ */

export const graphAssetNodes = () => getAssetNodes();

export const graphAssetVulnerabilities = (assetGraphId: string) =>
  getAssetVulnerabilities(assetGraphId);

export const graphAssetMisconfigurations = (assetGraphId: string) =>
  getAssetMisconfigurations(assetGraphId);

export const graphConnectedAssets = (assetGraphId: string) =>
  getConnectedAssets(assetGraphId);

export const graphAssetSummary = () => getAssetGraphSummary();