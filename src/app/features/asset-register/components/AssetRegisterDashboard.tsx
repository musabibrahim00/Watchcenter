import { useAssetRegisterData } from "../hooks/useAssetRegisterData";

export function AssetRegisterDashboard() {
  const { stats, distribution, trendData } = useAssetRegisterData();

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-6">
        <StatCard title="Total Assets" value={stats.totalAssets.toLocaleString()} />
        <StatCard title="Newly Added Assets" value={String(stats.newlyAddedAssets)} accent="text-emerald-400" />
        <StatCard title="Ownership Coverage" value={`${stats.ownershipCoverage}%`} accent="text-orange-400" />
        <StatCard title="Classification Coverage" value={`${stats.classificationCoverage}%`} />
        <StatCard title="High-Risk Assets" value={String(stats.highRiskAssets)} accent="text-red-400" />
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="rounded-2xl border border-white/10 bg-[#07111f] p-5">
          <div className="mb-4 text-white/80">Asset Inventory Trend</div>
          <div className="space-y-2 text-sm text-white/70">
            {trendData.map((item) => (
              <div key={item.day} className="flex items-center justify-between rounded-lg bg-white/[0.02] px-3 py-2">
                <span>{item.day}</span>
                <div className="flex gap-4">
                  <span>New Assets: {item.newAssets}</span>
                  <span>Ownership Assigned: {item.ownershipAssigned}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#07111f] p-5">
          <div className="mb-4 text-white/80">Asset Types Distribution</div>
          <div className="space-y-3">
            {distribution.map((item) => (
              <div key={item.name} className="flex items-center justify-between rounded-lg bg-white/[0.02] px-3 py-2 text-sm">
                <span className="text-white/70">{item.name}</span>
                <span className="text-white">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-[#07111f] p-5">
        <div className="mb-4 text-white/80">Asset Risk Indicators</div>
        <div className="grid grid-cols-4 gap-4">
          <MiniStatCard title="Assets with Critical Vulnerabilities" value={String(stats.assetsWithCriticalVulnerabilities)} />
          <MiniStatCard title="Assets with Misconfigurations" value={String(stats.assetsWithMisconfigurations)} />
          <MiniStatCard title="Externally Exposed Assets" value={String(stats.externallyExposedAssets)} />
          <MiniStatCard title="Assets in KEV Attack Paths" value={String(stats.assetsInKevAttackPaths)} />
        </div>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  accent,
}: {
  title: string;
  value: string;
  accent?: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#07111f] p-5">
      <div className="mb-4 text-white/70">{title}</div>
      <div className={`text-5xl font-semibold text-white ${accent ?? ""}`}>{value}</div>
    </div>
  );
}

function MiniStatCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
      <div className="mb-2 text-sm text-white/60">{title}</div>
      <div className="text-2xl font-semibold text-white">{value}</div>
    </div>
  );
}