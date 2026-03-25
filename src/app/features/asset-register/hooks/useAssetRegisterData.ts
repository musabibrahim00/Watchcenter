import { useMemo } from "react";
import { mockAssets } from "../data/mockAssets";
import {
  getAssetDistribution,
  getAssetTableData,
  getDashboardStats,
  getTrendData,
  groupByAccountAndRegion,
} from "../utils/assetTransforms";

export function useAssetRegisterData() {
  return useMemo(() => {
    const assets = mockAssets;
    const distribution = getAssetDistribution(assets);
    const tableData = getAssetTableData(assets);
    const groupedDiagram = groupByAccountAndRegion(assets);
    const stats = getDashboardStats(assets);
    const trendData = getTrendData();

    return {
      assets,
      distribution,
      tableData,
      groupedDiagram,
      stats,
      trendData,
    };
  }, []);
}