export type AssetType =
  | "Server"
  | "Database"
  | "Cloud Resource"
  | "Endpoint"
  | "Network";

export type AssetVendor = "AWS" | "Azure" | "GCP";

export type AssetStatus =
  | "Open"
  | "Active"
  | "Running"
  | "Stopped"
  | "Decommissioned"
  | "Terminated";

export type AssetTier = "Primary" | "Secondary";

export type Asset = {
  id: string;
  name: string;
  type: AssetType;
  group: string;
  vendor: AssetVendor;
  account: string;
  region: string;
  service: string;
  tier: AssetTier;
  cia: {
    c: number;
    i: number;
    a: number;
  };
  firstSeen: string;
  lastSeen: string;
  status: AssetStatus;
  owner: string;
  custodian: string;
  vulnerabilities: {
    critical: number;
    high: number;
  };
  misconfig: {
    critical: number;
    high: number;
  };
};