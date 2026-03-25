import type { Asset } from "../data/assetTypes";

export function getAssetDistribution(assets: Asset[]) {
  const map = {
    Server: 0,
    Database: 0,
    "Cloud Resource": 0,
    Endpoint: 0,
    Network: 0,
  };

  assets.forEach((asset) => {
    map[asset.type] += 1;
  });

  return Object.entries(map).map(([name, value]) => ({
    name,
    value,
  }));
}

export function getAssetTableData(assets: Asset[]) {
  return assets.map((asset) => ({
    assetName: asset.id,
    assetGroup: asset.group,
    assetType: asset.type,
    assetTier: asset.tier,
    service: asset.service,
    cia: `${asset.cia.c}/${asset.cia.i}/${asset.cia.a}`,
    firstSeen: asset.firstSeen,
    lastSeen: asset.lastSeen,
    status: asset.status,
    assetOwner: asset.owner,
    assetCustodian: asset.custodian,
  }));
}

export function groupByAccountAndRegion(assets: Asset[]) {
  const structure: Record<string, Record<string, Asset[]>> = {};

  assets.forEach((asset) => {
    if (!structure[asset.account]) {
      structure[asset.account] = {};
    }

    if (!structure[asset.account][asset.region]) {
      structure[asset.account][asset.region] = [];
    }

    structure[asset.account][asset.region].push(asset);
  });

  return structure;
}

export function getDashboardStats(assets: Asset[]) {
  const totalAssets = assets.length;
  const newlyAddedAssets = 32;
  const ownershipCoverage = Math.round(
    (assets.filter((asset) => asset.owner && asset.owner.trim().length > 0).length / totalAssets) * 100
  );
  const classificationCoverage = 87;
  const highRiskAssets = assets.filter(
    (asset) => asset.vulnerabilities.critical > 0 || asset.misconfig.critical > 0
  ).length;

  return {
    totalAssets,
    newlyAddedAssets,
    ownershipCoverage,
    classificationCoverage,
    highRiskAssets,
    assetsWithCriticalVulnerabilities: assets.filter((a) => a.vulnerabilities.critical > 0).length,
    assetsWithMisconfigurations: assets.filter(
      (a) => a.misconfig.critical > 0 || a.misconfig.high > 0
    ).length,
    externallyExposedAssets: 17,
    assetsInKevAttackPaths: 12,
  };
}

export function getTrendData() {
  return [
    { day: "Mon", newAssets: 48, ownershipAssigned: 12 },
    { day: "Tue", newAssets: 35, ownershipAssigned: 7 },
    { day: "Wed", newAssets: 45, ownershipAssigned: 29 },
    { day: "Thu", newAssets: 34, ownershipAssigned: 20 },
    { day: "Fri", newAssets: 40, ownershipAssigned: 13 },
    { day: "Sat", newAssets: 35, ownershipAssigned: 17 },
    { day: "Sun", newAssets: 20, ownershipAssigned: 15 },
  ];
}