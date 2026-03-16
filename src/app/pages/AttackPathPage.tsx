import { colors } from "../shared/design-system/tokens";
import { Badge } from "../shared/components/ui/Badge";
import { DeferredChart } from "../shared/components/DeferredChart";
import { EntityLink } from "../shared/components/EntityLink";

// Graph-backed imports — all attack path data flows through the unified graph
import {
  getAttackPathNodes,
  getAttackPathMembers,
  getAttackPathGraphSummary,
} from "../shared/graph/adapters";

// Mock data for trend chart
const trendData = [
  { week: "W1", vuln: 245, misconfig: 189 },
  { week: "W2", vuln: 238, misconfig: 185 },
  { week: "W3", vuln: 252, misconfig: 192 },
  { week: "W4", vuln: 247, misconfig: 188 },
  { week: "W5", vuln: 241, misconfig: 183 },
  { week: "W6", vuln: 235, misconfig: 180 },
];

// Mock data for attack paths table
const attackPathsData = [
  {
    id: "ap-001",
    name: "Internet-facing service → Database",
    assets: 12,
    misconfigurations: 8,
    vulnerabilities: 15,
    priority: "critical" as const,
  },
  {
    id: "ap-002",
    name: "Compromised credentials → Cloud admin",
    assets: 8,
    misconfigurations: 5,
    vulnerabilities: 3,
    priority: "critical" as const,
  },
  {
    id: "ap-003",
    name: "Lateral movement via SMB",
    assets: 24,
    misconfigurations: 12,
    vulnerabilities: 18,
    priority: "high" as const,
  },
  {
    id: "ap-004",
    name: "Container escape → Host access",
    assets: 6,
    misconfigurations: 9,
    vulnerabilities: 4,
    priority: "high" as const,
  },
  {
    id: "ap-005",
    name: "Privilege escalation path",
    assets: 15,
    misconfigurations: 7,
    vulnerabilities: 11,
    priority: "medium" as const,
  },
  {
    id: "ap-006",
    name: "API misconfiguration chain",
    assets: 9,
    misconfigurations: 14,
    vulnerabilities: 6,
    priority: "medium" as const,
  },
  {
    id: "ap-007",
    name: "Network segmentation bypass",
    assets: 18,
    misconfigurations: 3,
    vulnerabilities: 8,
    priority: "low" as const,
  },
];

const summaryMetrics = {
  total: 47,
  critical: 12,
  high: 18,
  medium: 13,
  low: 4,
};

export default function AttackPathPage() {
  const navigate = useNavigate();
  const [selectedCloud, setSelectedCloud] = React.useState("all");
  const [selectedAccount, setSelectedAccount] = React.useState("all");
  
  const chartId = React.useId();
  const vulnGradId = `vuln-grad-${chartId}`;
  const misconfigGradId = `misconfig-grad-${chartId}`;

  const handleRowClick = (pathId: string) => {
    navigate(`/attack-path/${pathId}`);
  };

  return (
    <div className="flex flex-col gap-6 p-6" style={{ backgroundColor: colors.bgApp, minHeight: "100vh", maxWidth: "100%", overflowX: "hidden" }}>
      {/* Header Section */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[28px] font-semibold tracking-tight" style={{ color: colors.textPrimary }}>
            Attack Paths
          </h1>
          <p className="mt-1 text-[12px]" style={{ color: colors.textMuted }}>
            Identify and prioritize potential attack vectors across your infrastructure
          </p>
        </div>
        
        {/* Filters */}
        <div className="flex items-center gap-3">
          <select
            value={selectedCloud}
            onChange={(e) => setSelectedCloud(e.target.value)}
            className="px-3 py-2 text-[11px] rounded-lg border bg-transparent transition-colors cursor-pointer"
            style={{
              color: colors.textSecondary,
              borderColor: colors.border,
              backgroundColor: colors.bgPanel,
            }}
          >
            <option value="all">All Cloud Providers</option>
            <option value="aws">AWS</option>
            <option value="azure">Azure</option>
            <option value="gcp">Google Cloud</option>
          </select>
          
          <select
            value={selectedAccount}
            onChange={(e) => setSelectedAccount(e.target.value)}
            className="px-3 py-2 text-[11px] rounded-lg border bg-transparent transition-colors cursor-pointer"
            style={{
              color: colors.textSecondary,
              borderColor: colors.border,
              backgroundColor: colors.bgPanel,
            }}
          >
            <option value="all">All Accounts</option>
            <option value="prod">Production</option>
            <option value="staging">Staging</option>
            <option value="dev">Development</option>
          </select>
        </div>
      </div>

      {/* Threat Anatomy Section */}
      <div
        className="rounded-[18px] border p-6"
        style={{
          backgroundColor: colors.bgPanel,
          borderColor: colors.border,
        }}
      >
        <div className="mb-6">
          <h2 className="text-[14px] font-semibold" style={{ color: colors.textPrimary }}>
            Threat Anatomy
          </h2>
          <p className="mt-1 text-[10px]" style={{ color: colors.textMuted }}>
            Understanding vulnerability progression to attack paths
          </p>
        </div>

        {/* Legend */}
        <div className="mb-3 flex items-center gap-4 text-[10px]">
          <div className="flex items-center gap-2">
            <span className="size-2 rounded-full" style={{ backgroundColor: colors.critical }} />
            <span style={{ color: colors.textMuted }}>Vulnerability Exposure</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="size-2 rounded-full" style={{ backgroundColor: colors.high }} />
            <span style={{ color: colors.textMuted }}>Misconfiguration Exposure</span>
          </div>
        </div>

        {/* Chart — full width */}
        <div style={{ width: "100%", height: 300 }}>
          <DeferredChart key={`container-${chartId}`} minWidth={0}>
            <AreaChart data={trendData} key={`area-chart-${chartId}`}>
              <defs key={`defs-${chartId}`}>
                <linearGradient id={vulnGradId} x1="0" y1="0" x2="0" y2="1" key={vulnGradId}>
                  <stop offset="0%" stopColor={colors.critical} stopOpacity={0.4} key={`${vulnGradId}-stop-0`} />
                  <stop offset="100%" stopColor={colors.critical} stopOpacity={0.05} key={`${vulnGradId}-stop-1`} />
                </linearGradient>
                <linearGradient id={misconfigGradId} x1="0" y1="0" x2="0" y2="1" key={misconfigGradId}>
                  <stop offset="0%" stopColor={colors.high} stopOpacity={0.4} key={`${misconfigGradId}-stop-0`} />
                  <stop offset="100%" stopColor={colors.high} stopOpacity={0.05} key={`${misconfigGradId}-stop-1`} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" key={`grid-${chartId}`} />
              <XAxis dataKey="week" stroke={colors.textMuted} tick={{ fill: colors.textMuted, fontSize: 10 }} key={`xaxis-${chartId}`} />
              <YAxis stroke={colors.textMuted} tick={{ fill: colors.textMuted, fontSize: 10 }} key={`yaxis-${chartId}`} />
              <Tooltip
                contentStyle={{
                  backgroundColor: colors.bgPanel,
                  border: `1px solid ${colors.border}`,
                  borderRadius: "8px",
                  fontSize: "10px",
                }}
                key={`tooltip-${chartId}`}
              />
              <Area type="monotone" dataKey="vuln" stroke={colors.critical} fill={`url(#${vulnGradId})`} key={`area-vuln-${chartId}`} />
              <Area type="monotone" dataKey="misconfig" stroke={colors.high} fill={`url(#${misconfigGradId})`} key={`area-misconfig-${chartId}`} />
            </AreaChart>
          </DeferredChart>
        </div>
      </div>

      {/* Summary Metrics Row */}
      <div className="grid grid-cols-5 gap-4">
        <MetricCard label="Total Attack Paths" value={summaryMetrics.total} color={colors.accent} />
        <MetricCard label="Critical" value={summaryMetrics.critical} color={colors.critical} />
        <MetricCard label="High" value={summaryMetrics.high} color={colors.high} />
        <MetricCard label="Medium" value={summaryMetrics.medium} color={colors.medium} />
        <MetricCard label="Low" value={summaryMetrics.low} color={colors.low} />
      </div>

      {/* Attack Paths Table */}
      <div
        className="rounded-[18px] border overflow-hidden"
        style={{
          backgroundColor: colors.bgPanel,
          borderColor: colors.border,
        }}
      >
        <div className="px-6 py-4 border-b" style={{ borderColor: colors.border }}>
          <h2 className="text-[14px] font-semibold" style={{ color: colors.textPrimary }}>
            Attack Paths Overview
          </h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr
                className="border-b text-[10px] uppercase tracking-wider"
                style={{ borderColor: colors.border }}
              >
                <th className="px-6 py-3 text-left font-semibold" style={{ color: colors.textDim }}>
                  Attack Path Name
                </th>
                <th className="px-6 py-3 text-left font-semibold" style={{ color: colors.textDim }}>
                  Assets
                </th>
                <th className="px-6 py-3 text-left font-semibold" style={{ color: colors.textDim }}>
                  Misconfigurations
                </th>
                <th className="px-6 py-3 text-left font-semibold" style={{ color: colors.textDim }}>
                  Vulnerabilities
                </th>
                <th className="px-6 py-3 text-left font-semibold" style={{ color: colors.textDim }}>
                  Priority
                </th>
              </tr>
            </thead>
            <tbody>
              {attackPathsData.map((path) => (
                <tr
                  key={path.id}
                  onClick={() => handleRowClick(path.id)}
                  className="border-b transition-colors cursor-pointer hover:bg-[rgba(87,177,255,0.04)]"
                  style={{ borderColor: colors.border }}
                >
                  <td className="px-6 py-4">
                    <div onClick={e => e.stopPropagation()}>
                      <EntityLink
                        entityType="attack-path"
                        entityId={path.id}
                        label={path.name}
                        severity={path.priority}
                        style={{ fontSize: 12, fontWeight: 500, borderBottom: "none" }}
                      />
                    </div>
                    <div className="mt-1 text-[10px]" style={{ color: colors.textMuted }}>
                      ID: {path.id}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-[12px] font-medium" style={{ color: colors.textSecondary }}>
                      {path.assets}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-[12px] font-medium" style={{ color: colors.textSecondary }}>
                      {path.misconfigurations}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-[12px] font-medium" style={{ color: colors.textSecondary }}>
                      {path.vulnerabilities}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Badge tone={path.priority}>{path.priority}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// Metric Card Component
function MetricCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div
      className="rounded-[18px] border p-5 transition-all duration-300 hover:scale-[1.02]"
      style={{
        backgroundColor: colors.bgPanel,
        borderColor: colors.border,
      }}
    >
      <div className="text-[10px] uppercase tracking-wider mb-2" style={{ color: colors.textMuted }}>
        {label}
      </div>
      <div className="text-[32px] font-semibold" style={{ color }}>
        {value}
      </div>
    </div>
  );
}