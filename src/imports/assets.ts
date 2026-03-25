export type Asset = {
  id: string;
  name: string;
  type: "Server" | "Database" | "Cloud Resource" | "Endpoint" | "Network";
  group: string;
  vendor: "AWS" | "Azure" | "GCP";
  account: string;
  region: string;
  service: string;
  tier: "Primary" | "Secondary";
  cia: { c: number; i: number; a: number };
  firstSeen: string;
  lastSeen: string;
  status: "Open" | "Active" | "Running" | "Stopped" | "Decommissioned";
  owner: string;
  custodian: string;
  vulnerabilities: { critical: number; high: number };
  misconfig: { critical: number; high: number };
};