import { Shield, Database, FileWarning, Route, Bug, Settings, Briefcase, CheckCircle, Plug, GitBranch, LayoutDashboard, Cog } from "lucide-react";
import { colors } from "../shared/design-system/tokens";

// Graph-backed imports — placeholder pages reference the unified graph for context
import { getRiskGraphSummary } from "../shared/graph/adapters";

const pageConfig: Record<string, { icon: typeof Shield; description: string; color: string }> = {
  "Control Center": {
    icon: LayoutDashboard,
    description: "Monitor and manage your security operations from a centralized command dashboard.",
    color: "#14A2E3",
  },
  Assets: {
    icon: Database,
    description: "Track and manage your organization's digital assets, endpoints, and infrastructure inventory.",
    color: "#00A46E",
  },
  "Risk Register": {
    icon: FileWarning,
    description: "Maintain a comprehensive register of identified risks, their severity, and mitigation status.",
    color: "#F59E0B",
  },
  "Attack Path": {
    icon: Route,
    description: "Visualize and analyze potential attack paths across your environment to prioritize defenses.",
    color: "#EF4444",
  },
  Vulnerabilities: {
    icon: Bug,
    description: "Discover, track, and remediate vulnerabilities across your systems and applications.",
    color: "#F97316",
  },
  Misconfigurations: {
    icon: Cog,
    description: "Detect and resolve security misconfigurations in cloud, network, and application layers.",
    color: "#A855F7",
  },
  "Case Management": {
    icon: Briefcase,
    description: "Create, assign, and track security cases and incidents through their full lifecycle.",
    color: "#06B6D4",
  },
  Compliance: {
    icon: CheckCircle,
    description: "Monitor compliance posture against regulatory frameworks and internal policies.",
    color: "#10B981",
  },
  Integrations: {
    icon: Plug,
    description: "Connect third-party tools and data sources to unify your security ecosystem.",
    color: "#8B5CF6",
  },
  Workflows: {
    icon: GitBranch,
    description: "Build and automate security workflows for faster response and consistent operations.",
    color: "#EC4899",
  },
  Settings: {
    icon: Settings,
    description: "Configure platform preferences, user roles, notifications, and system integrations.",
    color: "#62707D",
  },
};

export default function PlaceholderPage({ title }: { title: string }) {
  const config = pageConfig[title] || {
    icon: Shield,
    description: "This section is under development.",
    color: "#14A2E3",
  };
  const Icon = config.icon;

  return (
    <div className="relative flex-1 flex items-center justify-center overflow-clip" style={{ backgroundColor: colors.bgApp }}>
      {/* Subtle radial glow */}
      <div
        className="absolute w-[600px] h-[600px] rounded-full opacity-[0.07] blur-[120px]"
        style={{ background: config.color }}
      />

      <div className="flex flex-col items-center gap-8 max-w-md text-center z-10">
        {/* Icon container */}
        <div
          className="p-5 rounded-2xl"
          style={{
            background: `${config.color}15`,
            border: `1px solid ${config.color}30`,
          }}
        >
          <Icon size={48} color={config.color} strokeWidth={1.5} />
        </div>

        {/* Title */}
        <h1 style={{ color: colors.textSecondary }} className="tracking-[-0.5px] text-[28px]">{title}</h1>

        {/* Description */}
        <p style={{ color: colors.textMuted }} className="leading-[1.6] text-[14px]">{config.description}</p>

        {/* Coming Soon badge */}
        <div className="flex items-center gap-2 px-4 py-2 rounded-lg" style={{ backgroundColor: colors.bgCard, border: `1px solid ${colors.border}` }}>
          <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: config.color }} />
          <span style={{ color: colors.textDim }} className="text-[13px]">Coming Soon</span>
        </div>
      </div>
    </div>
  );
}