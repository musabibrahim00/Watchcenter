/* ================================================================
   ASSET REGISTER — Mock Data
   Aligned to the Figma design screens.

   Data layer reads from the unified security graph via adapters.
   Module-specific shapes (Asset, Vulnerability, etc.) are preserved
   exactly so the UI remains unchanged.
   ================================================================ */

import {
  getAssetNodes,
  getAssetVulnerabilities,
  getAssetMisconfigurations,
  getConnectedAssets,
  getAssetGraphSummary,
} from "../../shared/graph/adapters";
import type { GraphNode } from "../../shared/graph";

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

/* ── KPI Data (matches dashboard screen) ── */
export const KPI_DATA = {
  totalAssets: 1240,
  newlyAdded: 32,
  ownershipCoverage: 92,
  ownershipDelta: "+6.4%",
  classificationCoverage: 87,
  classificationDelta: "+4.1%",
  highRiskAssets: 46,
  highRiskDelta: "+3 vs last week",
};

/* ── Trend Chart Data (Mon–Sun as shown) ── */
export const INVENTORY_TREND = [
  { day: "Mon", newAssets: 38, ownershipAssigned: 22 },
  { day: "Tue", newAssets: 42, ownershipAssigned: 28 },
  { day: "Wed", newAssets: 30, ownershipAssigned: 25 },
  { day: "Thu", newAssets: 38, ownershipAssigned: 20 },
  { day: "Fri", newAssets: 35, ownershipAssigned: 18 },
  { day: "Sat", newAssets: 32, ownershipAssigned: 15 },
  { day: "Sun", newAssets: 28, ownershipAssigned: 12 },
];

/* ── Asset Type Distribution (matches donut chart legend) ── */
export const TYPE_DISTRIBUTION = [
  { type: "Servers", count: 380, color: "#ff4d4f" },
  { type: "Database", count: 290, color: "#ff7a1a" },
  { type: "Cloud Resources", count: 250, color: "#f5b301" },
  { type: "Endpoints", count: 180, color: "#5b6abf" },
  { type: "Networks", count: 140, color: "#0ccf92" },
];

/* ── Risk Indicator Data (matches bottom row) ── */
export const RISK_INDICATORS = [
  { label: "Assets with Critical Vulnerabilities", count: 17 },
  { label: "Assets with Misconfigurations", count: 1240 },
  { label: "Externally Exposed Assets", count: 1240 },
  { label: "Assets in KEV Attack Paths", count: 1240 },
];

/* ── ASSETS TABLE (matches list view screen) ── */
export const ASSETS: Asset[] = [
  { id: "ast-001", accountId: "aws-AROA5LNPMPW32R", accountName: "Prod-Primary-AWS", vendor: "AWS", name: "services_cost", securityPlane: "Infrastructure", assetType: "Cloud", service: "lambda", ciaC: 0, ciaI: 0, ciaA: 0, owner: "", custodian: "", severity: "low", arn: "arn:aws:lambda:us-east-1:917880208823:function:services_cost", region: "us-east-1", assetGroup: "Cloud", assetService: "lambda", riskScore: 2.1, vulnerabilityCount: 3, misconfigurationCount: 1, lastScanned: "2026-02-04", ciaValue: "00" },
  { id: "ast-002", accountId: "aws-AROA5LNPMPW32R", accountName: "Prod-Primary-AWS", vendor: "AWS", name: "vol-034b0407bfc887f55", securityPlane: "Infrastructure", assetType: "Data", service: "ebs_volume", ciaC: 1, ciaI: 2, ciaA: 2, owner: "", custodian: "", severity: "medium", arn: "arn:aws:ec2:us-east-1:917880208823:volume/vol-034b0407bfc887f55", region: "us-east-1", assetGroup: "Data", assetService: "ebs_volume", riskScore: 4.5, vulnerabilityCount: 5, misconfigurationCount: 2, lastScanned: "2026-02-04", ciaValue: "12" },
  { id: "ast-003", accountId: "aws-AROA5LNPMPW32R", accountName: "Prod-Primary-AWS", vendor: "AWS", name: "night-shift-manager-v1", securityPlane: "Infrastructure", assetType: "Servers", service: "ec2", ciaC: 2, ciaI: 2, ciaA: 3, owner: "Muhammad Faisal Ansar", custodian: "DevOps", severity: "high", arn: "arn:aws:ec2:us-east-1:917880208823:instance/i-night-shift-mgr-v1", region: "us-east-1", assetGroup: "Servers", assetService: "ec2", riskScore: 7.8, vulnerabilityCount: 12, misconfigurationCount: 4, lastScanned: "2026-02-04", ciaValue: "23" },
  { id: "ast-004", accountId: "aws-AROA5LNPMPW32R", accountName: "Prod-Primary-AWS", vendor: "AWS", name: "DevopsTool-Start-EC2-And-RDS", securityPlane: "Infrastructure", assetType: "Cloud", service: "lambda", ciaC: 0, ciaI: 0, ciaA: 0, owner: "", custodian: "", severity: "low", arn: "arn:aws:lambda:us-east-1:917880208823:function:DevopsTool-Start-EC2-And-RDS", region: "us-east-1", assetGroup: "Cloud", assetService: "lambda", riskScore: 1.5, vulnerabilityCount: 1, misconfigurationCount: 0, lastScanned: "2026-02-04", ciaValue: "00" },
  { id: "ast-005", accountId: "aws-AROA5LNPMPW32R", accountName: "Prod-Primary-AWS", vendor: "AWS", name: "master-prod-jenkins-v6", securityPlane: "Infrastructure", assetType: "Servers", service: "ec2", ciaC: 2, ciaI: 3, ciaA: 3, owner: "Muhammad Faisal Ansar", custodian: "DevOps", severity: "critical", arn: "arn:aws:ec2:us-east-1:917880208823:instance/i-master-prod-jenkins-v6", region: "us-east-1", assetGroup: "Servers", assetService: "ec2", riskScore: 9.2, vulnerabilityCount: 18, misconfigurationCount: 5, lastScanned: "2026-02-04", ciaValue: "33" },
  { id: "ast-006", accountId: "aws-AROA5LNPMPW32R", accountName: "Prod-Primary-AWS", vendor: "AWS", name: "newrelic-response-time-kasper-alert", securityPlane: "Cloud", assetType: "Cloud", service: "lambda", ciaC: 0, ciaI: 0, ciaA: 0, owner: "", custodian: "", severity: "low", arn: "arn:aws:lambda:us-east-1:917880208823:function:newrelic-response-time-kasper-alert", region: "us-east-1", assetGroup: "Cloud", assetService: "lambda", riskScore: 1.2, vulnerabilityCount: 0, misconfigurationCount: 1, lastScanned: "2026-02-04", ciaValue: "00" },
  { id: "ast-007", accountId: "aws-AROA5LNPMPW32R", accountName: "Prod-Primary-AWS", vendor: "AWS", name: "master-prod-elk-v31", securityPlane: "Infrastructure", assetType: "Servers", service: "ec2", ciaC: 2, ciaI: 3, ciaA: 3, owner: "Muhammad Faisal Ansar", custodian: "DevOps", severity: "critical", arn: "arn:aws:ec2:us-east-1:917880208823:instance/i-master-prod-elk-v31", region: "us-east-1", assetGroup: "Servers", assetService: "ec2", riskScore: 10, vulnerabilityCount: 2248, misconfigurationCount: 0, lastScanned: "2026-02-04", ciaValue: "33" },
  { id: "ast-008", accountId: "aws-AROA5LNPMPW32R", accountName: "Prod-Primary-AWS", vendor: "AWS", name: "vol-0b4b7860168d1e6a4", securityPlane: "Infrastructure", assetType: "Data", service: "ebs_volume", ciaC: 2, ciaI: 2, ciaA: 2, owner: "", custodian: "", severity: "medium", arn: "arn:aws:ec2:us-east-1:917880208823:volume/vol-0b4b7860168d1e6a4", region: "us-east-1", assetGroup: "Data", assetService: "ebs_volume", riskScore: 4.0, vulnerabilityCount: 4, misconfigurationCount: 2, lastScanned: "2026-02-04", ciaValue: "22" },
  { id: "ast-009", accountId: "aws-AROA5LNPMPW32R", accountName: "Prod-Primary-AWS", vendor: "AWS", name: "master-prod-api-v12", securityPlane: "Infrastructure", assetType: "Servers", service: "ec2", ciaC: 2, ciaI: 3, ciaA: 3, owner: "Muhammad Faisal Ansar", custodian: "DevOps", severity: "critical", arn: "arn:aws:ec2:us-east-1:917880208823:instance/i-master-prod-api-v12", region: "us-east-1", assetGroup: "Servers", assetService: "ec2", riskScore: 9.5, vulnerabilityCount: 1890, misconfigurationCount: 3, lastScanned: "2026-02-04", ciaValue: "33" },
  { id: "ast-010", accountId: "aws-AROA5LNPMPW32R", accountName: "Prod-Primary-AWS", vendor: "AWS", name: "staging-web-proxy-01", securityPlane: "Infrastructure", assetType: "Servers", service: "ec2", ciaC: 1, ciaI: 2, ciaA: 2, owner: "", custodian: "", severity: "medium", arn: "arn:aws:ec2:us-east-1:917880208823:instance/i-staging-web-proxy-01", region: "us-east-1", assetGroup: "Servers", assetService: "ec2", riskScore: 5.3, vulnerabilityCount: 7, misconfigurationCount: 3, lastScanned: "2026-03-07", ciaValue: "12" },
  { id: "ast-011", accountId: "azure-SUB-4f2a8c", accountName: "Staging-Azure", vendor: "Azure", name: "az-vm-webapp-prod-01", securityPlane: "Cloud", assetType: "Servers", service: "virtual_machine", ciaC: 2, ciaI: 2, ciaA: 3, owner: "Sarah Chen", custodian: "CloudOps", severity: "high", arn: "/subscriptions/4f2a8c/resourceGroups/prod-rg/providers/Microsoft.Compute/virtualMachines/az-vm-webapp-prod-01", region: "eastus", assetGroup: "Servers", assetService: "virtual_machine", riskScore: 7.1, vulnerabilityCount: 9, misconfigurationCount: 2, lastScanned: "2026-03-06", ciaValue: "23" },
  { id: "ast-012", accountId: "azure-SUB-4f2a8c", accountName: "Staging-Azure", vendor: "Azure", name: "az-sql-analytics-db", securityPlane: "Cloud", assetType: "Data", service: "sql_database", ciaC: 3, ciaI: 3, ciaA: 2, owner: "Sarah Chen", custodian: "CloudOps", severity: "critical", arn: "/subscriptions/4f2a8c/resourceGroups/prod-rg/providers/Microsoft.Sql/servers/analytics/databases/main", region: "eastus", assetGroup: "Data", assetService: "sql_database", riskScore: 9.0, vulnerabilityCount: 14, misconfigurationCount: 6, lastScanned: "2026-03-06", ciaValue: "33" },
  { id: "ast-013", accountId: "gcp-proj-sec-9x7", accountName: "GCP-Security-Prod", vendor: "GCP", name: "gke-cluster-prod-01", securityPlane: "Cloud", assetType: "Cloud", service: "gke_cluster", ciaC: 2, ciaI: 3, ciaA: 3, owner: "Alex Rivera", custodian: "Platform", severity: "high", arn: "projects/sec-9x7/locations/us-central1/clusters/gke-cluster-prod-01", region: "us-central1", assetGroup: "Cloud", assetService: "gke_cluster", riskScore: 8.1, vulnerabilityCount: 22, misconfigurationCount: 3, lastScanned: "2026-03-05", ciaValue: "23" },
  { id: "ast-014", accountId: "gcp-proj-sec-9x7", accountName: "GCP-Security-Prod", vendor: "GCP", name: "gcs-backup-archive", securityPlane: "Cloud", assetType: "Data", service: "storage_bucket", ciaC: 3, ciaI: 2, ciaA: 1, owner: "Alex Rivera", custodian: "Platform", severity: "medium", arn: "projects/sec-9x7/buckets/gcs-backup-archive", region: "us-central1", assetGroup: "Data", assetService: "storage_bucket", riskScore: 5.8, vulnerabilityCount: 2, misconfigurationCount: 4, lastScanned: "2026-03-05", ciaValue: "32" },
  { id: "ast-015", accountId: "aws-AROA5LNPMPW32R", accountName: "Prod-Primary-AWS", vendor: "AWS", name: "vpc-flow-log-analyzer", securityPlane: "Network", assetType: "Network", service: "vpc", ciaC: 1, ciaI: 1, ciaA: 2, owner: "", custodian: "", severity: "low", arn: "arn:aws:ec2:us-east-1:917880208823:vpc/vpc-flow-log-analyzer", region: "us-east-1", assetGroup: "Network", assetService: "vpc", riskScore: 2.5, vulnerabilityCount: 0, misconfigurationCount: 2, lastScanned: "2026-03-07", ciaValue: "11" },
];

/* ── Per-Asset Detail Data ── */
export function getRisks(assetId: string): RiskRow[] {
  return [
    { id: "r1", mainCategory: "Initial Access", message: "An integer overflow can be triggered in SQLite's 'concat_ws()' function. The resulting, truncated integer is then used to allocate a buffer. When SQLite then writes the resulting string to the buffer, it uses the original, untruncated size and thus a wild Heap Buffer overflow of size ~4GB can be triggered. This can result in arbitrary code execution.", subCategory: "Exploit Public-Facing Application", riskOwner: "", riskClass: "critical", lastUpdated: "2026-02-13" },
    { id: "r2", mainCategory: "Initial Access", message: "Increasing the resolution of video frames, while performing a multi-threaded encode, can result in a heap overflow in avf_loop_restoration_dealloc().", subCategory: "Exploit Public-Facing Application", riskOwner: "", riskClass: "critical", lastUpdated: "2026-02-14" },
    { id: "r3", mainCategory: "Initial Access", message: "ImageMagick is free and open-source software used for editing and manipulating digital images. In versions prior to 7.1.2-0 and 6.9.13-26, in ImageMagick's 'magick montify' command, specifying multiple consecutive '%d' format specifiers in a filename template causes internal pointer arithmetic to generate an address below the beginning of the stack buffer, resulting in a stack buffer overflow through 'vsnprintf()'. Versions 7.1.2-0 and 6.9.13-26 fix the issue.", subCategory: "Exploit Public-Facing Application", riskOwner: "", riskClass: "critical", lastUpdated: "2026-02-13" },
    { id: "r4", mainCategory: "Initial Access", message: "ImageMagick is free and open-source software used for editing and manipulating digital images. Versions prior to 7.1.2-0 and 6.9.13-26 have a heap buffer overflow in the 'InterpretImageFilename' function. The issue stems from an off-by-one error that causes out-of-bounds memory access when processing format strings containing consecutive percent signs ('%%'). Versions 7.1.2-0 and 6.9.13-26 fix the issue.", subCategory: "Exploit Public-Facing Application", riskOwner: "", riskClass: "critical", lastUpdated: "2026-02-13" },
    { id: "r5", mainCategory: "Initial Access", message: "ImageMagick is free and open-source software used for editing and manipulating digital images. Prior to versions 7.1.2-13 and 6.9.13-38, a heap buffer overflow vulnerability in the XBM Image decoder (ReadXBMImage) allows an attacker to write controlled data to upload and processing.", subCategory: "Exploit Public-Facing Application", riskOwner: "", riskClass: "critical", lastUpdated: "2026-02-13" },
  ];
}

export function getVulnerabilities(assetId: string): Vulnerability[] {
  return [
    { id: "v1", name: "CVE-2012-4542", description: "block/scsi_ioctl.c in the Linux kernel through 3.8 does not properly consider the SCSI device class during authorization of SCSI commands, which allows local users to bypass intended access restrictions via an SG_IO ioctl call that leverages overlapping opcodes.", cvssScore: null, kev: false, severity: "informational", published: "2013-02-28", source: "Wazuh, Inc.", firstSeen: "06/02/2026 16:22 (31 days)" },
    { id: "v2", name: "CVE-2013-7445", description: "The Direct Rendering Manager (DRM) subsystem in the Linux kernel through 4.x mishandles requests for Graphics Execution Manager (GEM) objects, which allows context-dependent attackers to cause a denial of service (memory consumption) via an application that processes graphics data, as demonstrated by JavaScript code that creates many CANVAS elements for rendering by Chrome or Firefox.", cvssScore: null, kev: false, severity: "informational", published: "2015-10-16", source: "Wazuh, Inc.", firstSeen: "06/02/2026 16:22 (31 days)" },
    { id: "v3", name: "CVE-2015-7837", description: "The Linux kernel, as used in Red Hat Enterprise Linux 7, kernel-rt, and Enterprise MRG 2 and when booted with UEFI Secure Boot enabled, allows local users to bypass intended securelevel/secureboot restrictions by leveraging improper handling of secure_boot flag across kexec reboot.", cvssScore: 5.5, kev: false, severity: "medium", published: "2017-09-19", source: "Wazuh, Inc.", firstSeen: "06/02/2026 16:22 (31 days)" },
    { id: "v4", name: "CVE-2015-8553", description: "Xen allows guest OS users to obtain sensitive information from uninitialized locations in host OS kernel memory by not enabling memory and I/O decoding control bits. NOTE: this vulnerability exists because of an incomplete fix for CVE-2015-0777.", cvssScore: 6.5, kev: false, severity: "medium", published: "2016-04-13", source: "Wazuh, Inc.", firstSeen: "06/02/2026 16:22 (31 days)" },
    { id: "v5", name: "CVE-2016-2568", description: "pkexec, when used with --user nonpriv, allows local users to escape to the parent session via a crafted TIOCSTI ioctl call, which pushes characters to the terminal's input buffer.", cvssScore: 7.8, kev: false, severity: "medium", published: "2017-02-13", source: "Wazuh, Inc.", firstSeen: "06/02/2026 16:22 (31 days)" },
    { id: "v6", name: "CVE-2016-2781", description: "chroot in GNU coreutils, when used with --userspec, allows local users to escape to the parent session via a crafted TIOCSTI ioctl call, which pushes characters to the terminal's input buffer.", cvssScore: 6.5, kev: false, severity: "medium", published: "2017-02-07", source: "Wazuh, Inc.", firstSeen: "18/12/2025 18:56 (41 days)" },
    { id: "v7", name: "CVE-2017-13166", description: "An elevation of privilege vulnerability in the kernel v4l2 video driver. Product: Android. Versions: Android kernel.", cvssScore: 7.8, kev: false, severity: "high", published: "2018-01-31", source: "Wazuh, Inc.", firstSeen: "06/02/2026 16:22 (31 days)" },
    { id: "v8", name: "CVE-2018-12928", description: "In the Linux kernel 4.15.0, a NULL pointer dereference was discovered in hfs_ext_read_extent in hfs.ko.", cvssScore: 5.5, kev: false, severity: "medium", published: "2018-06-28", source: "Wazuh, Inc.", firstSeen: "06/02/2026 16:22 (31 days)" },
    { id: "v9", name: "CVE-2019-15794", description: "Overlayfs in the Linux kernel and shiftfs, a non-upstream patch carried in Ubuntu, did not properly handle a combination of upper mounts.", cvssScore: 6.7, kev: false, severity: "medium", published: "2020-04-24", source: "Wazuh, Inc.", firstSeen: "06/02/2026 16:22 (31 days)" },
    { id: "v10", name: "CVE-2020-14304", description: "A memory disclosure flaw was found in the Linux kernel's ethernet drivers, in the way it read data from the EEPROM of the device.", cvssScore: 4.4, kev: false, severity: "medium", published: "2021-06-30", source: "Wazuh, Inc.", firstSeen: "06/02/2026 16:22 (31 days)" },
  ];
}

export function getMisconfigurations(assetId: string): Misconfiguration[] {
  return [
    { id: "m1", name: "EC2 Instance i-0ae0cdf2d8501f270 has IMDSv2 disabled or not required.", remediation: "If you don't need IMDS you can turn it off. Using aws-cli you can force the instance to use only IMDSv2.", compliance: "CIS-5.0, AWS-Well-Architected-Framework-Security-Pillar", severity: "high" },
    { id: "m2", name: "EC2 Instance i-0ae0cdf2d8501f270 at IP 44.213.119.144 is Internet-facing with Instance Profile arn:aws:iam::917880208823:instance-profile/Elasticsearch.", remediation: "Use an ALB and apply WAF ACL.", compliance: "AWS-Well-Architected-Framework-Security-Pillar", severity: "medium" },
    { id: "m3", name: "EC2 Instance i-0ae0cdf2d8501f270 is not managed by Systems Manager.", remediation: "Verify and apply Systems Manager Prerequisites.", compliance: "AWS-Well-Architected-Framework-Security-Pillar", severity: "medium" },
    { id: "m4", name: "EC2 Instance i-0ae0cdf2d8501f270 has a Public IP: 44.213.119.144 (ec2-44-213-119-144.compute-1.amazonaws.com).", remediation: "Use an ALB and apply WAF ACL.", compliance: "AWS-Well-Architected-Framework-Security-Pillar", severity: "medium" },
  ];
}

export function getSoftware(_assetId: string): Software[] {
  return [
    { id: "sw1", name: "acpid", description: "Advanced Configuration and Power Interface event daemon", vendor: "Ubuntu Developers <ubuntu-devel-discuss@lists.ubuntu.com>", architecture: "amd64", size: 150, version: "1:2.0.33-1ubuntu1" },
    { id: "sw2", name: "ansible", description: "Configuration management, deployment, and task execution system", vendor: "Ubuntu Developers <ubuntu-devel-discuss@lists.ubuntu.com>", architecture: "all", size: 198790, version: "2.10.7+merged+base+2.10.8+dfsg-1" },
    { id: "sw3", name: "apparmor", description: "user-space parser utility for AppArmor", vendor: "Ubuntu Developers <ubuntu-devel-discuss@lists.ubuntu.com>", architecture: "amd64", size: 2680, version: "3.0.4-2ubuntu2.4" },
    { id: "sw4", name: "apport", description: "automatically generate crash reports for debugging", vendor: "Ubuntu Developers <ubuntu-devel-discuss@lists.ubuntu.com>", architecture: "all", size: 818, version: "2.20.11-0ubuntu82.10" },
    { id: "sw5", name: "apport-symptoms", description: "symptom scripts for apport", vendor: "Ubuntu Developers <ubuntu-motu@lists.ubuntu.com>", architecture: "all", size: 61, version: "0.24" },
    { id: "sw6", name: "apt-transport-https", description: "transitional package for https support", vendor: "Ubuntu Developers <ubuntu-devel-discuss@lists.ubuntu.com>", architecture: "all", size: 166, version: "2.4.14" },
    { id: "sw7", name: "apt-utils", description: "package management related utility programs", vendor: "Ubuntu Developers <ubuntu-devel-discuss@lists.ubuntu.com>", architecture: "amd64", size: 792, version: "2.4.14" },
    { id: "sw8", name: "awscli", description: "Universal Command Line Environment for AWS", vendor: "Ubuntu Developers <ubuntu-devel-discuss@lists.ubuntu.com>", architecture: "all", size: 10113, version: "1.22.34-1" },
    { id: "sw9", name: "base-files", description: "Debian base system miscellaneous files", vendor: "Ubuntu Developers <ubuntu-devel-discuss@lists.ubuntu.com>", architecture: "amd64", size: 395, version: "12ubuntu4.7" },
    { id: "sw10", name: "base-passwd", description: "Debian base system master password and group files", vendor: "Colin Watson <cjwatson@debian.org>", architecture: "amd64", size: 243, version: "3.5.52build1" },
    { id: "sw11", name: "bash", description: "GNU Bourne Again SHell", vendor: "Ubuntu Developers <ubuntu-devel-discuss@lists.ubuntu.com>", architecture: "amd64", size: 1824, version: "5.1-6ubuntu1.1" },
    { id: "sw12", name: "bind9-dnsutils", description: "Clients provided with BIND 9", vendor: "Ubuntu Developers <ubuntu-devel-discuss@lists.ubuntu.com>", architecture: "amd64", size: 456, version: "1:9.18.18-0ubuntu0.22.04.2" },
  ];
}

/* ================================================================
   GRAPH-BACKED QUERIES
   ================================================================
   These re-export adapter functions so any consumer of asset-data
   can also query the unified graph without importing from two places.
   ================================================================ */

/** All asset/application nodes from the unified graph. */
export const graphAssetNodes = () => getAssetNodes();

/** Graph-derived vulnerability nodes for a given asset graph-ID. */
export const graphAssetVulnerabilities = (assetGraphId: string) =>
  getAssetVulnerabilities(assetGraphId);

/** Graph-derived misconfiguration nodes for a given asset graph-ID. */
export const graphAssetMisconfigurations = (assetGraphId: string) =>
  getAssetMisconfigurations(assetGraphId);

/** Graph-derived connected assets for a given asset graph-ID. */
export const graphConnectedAssets = (assetGraphId: string) =>
  getConnectedAssets(assetGraphId);

/** Summary statistics from the graph layer. */
export const graphAssetSummary = () => getAssetGraphSummary();