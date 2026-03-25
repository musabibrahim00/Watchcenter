import { useAssetRegisterData } from "../hooks/useAssetRegisterData";

export function AssetRegisterTable() {
  const { tableData } = useAssetRegisterData();

  return (
    <div className="rounded-2xl border border-white/10 bg-[#07111f] p-4">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1200px] border-separate border-spacing-y-2">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wide text-white/45">
              <th className="px-4 py-3">Asset Name</th>
              <th className="px-4 py-3">Asset Group</th>
              <th className="px-4 py-3">Asset Type</th>
              <th className="px-4 py-3">Asset Tier</th>
              <th className="px-4 py-3">Service</th>
              <th className="px-4 py-3">C.I.A</th>
              <th className="px-4 py-3">First Seen</th>
              <th className="px-4 py-3">Last Seen</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Asset Owner</th>
              <th className="px-4 py-3">Asset Custodian</th>
            </tr>
          </thead>
          <tbody>
            {tableData.map((row) => (
              <tr key={row.assetName} className="rounded-xl bg-white/[0.02] text-sm text-white/80">
                <td className="px-4 py-4">{row.assetName}</td>
                <td className="px-4 py-4">{row.assetGroup}</td>
                <td className="px-4 py-4">{row.assetType}</td>
                <td className="px-4 py-4">{row.assetTier}</td>
                <td className="px-4 py-4">{row.service}</td>
                <td className="px-4 py-4">{row.cia}</td>
                <td className="px-4 py-4">{row.firstSeen}</td>
                <td className="px-4 py-4">{row.lastSeen}</td>
                <td className="px-4 py-4">{row.status}</td>
                <td className="px-4 py-4">{row.assetOwner}</td>
                <td className="px-4 py-4">{row.assetCustodian}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}