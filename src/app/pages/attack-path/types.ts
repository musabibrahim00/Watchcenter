/* ================================================================
   TYPES — attack path domain types
   ================================================================ */

export interface PathNode {
  id: string;
  label: string;
  sublabel?: string;
  icon: "internet" | "cloud" | "account" | "region" | "instance" | "database" | "vuln";
  x: number;
  y: number;
  isVulnerable?: boolean;
  cve?: string;
}

export interface PathEdge { from: string; to: string; }

export interface BlastRadiusAsset {
  id: string;
  name: string;
  arn: string;
  privateIp: string;
  vulnerabilities: number;
  misconfigurations: number;
  riskSeverity: "critical" | "high" | "medium" | "low";
  exposures: string[];
}

export interface BlastRadiusData {
  totalAssets: number;
  totalVulnerabilities: number;
  totalMisconfigurations: number;
  assets: BlastRadiusAsset[];
}

export interface AttackPathData {
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

export interface LayoutResult {
  positions: Map<string, { x: number; y: number }>;
  bbox: { minX: number; minY: number; maxX: number; maxY: number; w: number; h: number };
}
