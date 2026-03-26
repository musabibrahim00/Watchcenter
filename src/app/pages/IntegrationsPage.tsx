/**
 * Integrations Page
 * =================
 * 
 * Central hub for managing external service connections used by workflows.
 * Connect services, manage credentials, test connections, and view usage.
 */

import React, { useState, useMemo } from "react";
import {
  Search, Plus, ChevronDown, CheckCircle2, XCircle,
  AlertCircle, Settings, Power, FlaskConical, Eye,
  EyeOff, Copy, ExternalLink, Workflow, Slack,
  Mail, Webhook, Globe, Database, Code2, Cloud,
  Github, Lock, Key, Shield, Activity, X,
  Zap, AlertTriangle,
} from "lucide-react";
import { useNavigate } from "react-router";
import { colors } from "../shared/design-system/tokens";

/* ================================================================
   TYPES
   ================================================================ */

type ConnectionStatus = "connected" | "not_connected" | "disabled" | "error";

interface Integration {
  id: string;
  name: string;
  category: string;
  description: string;
  icon: React.ComponentType<{ size?: number; className?: string; color?: string; strokeWidth?: number }>;
  iconColor: string;
  status: ConnectionStatus;
  lastTested?: string;
  usedInWorkflows: number;
  config?: {
    workspace?: string;
    token?: string;
    channel?: string;
    apiKey?: string;
    endpoint?: string;
    database?: string;
    username?: string;
  };
}

/* ================================================================
   MOCK DATA
   ================================================================ */

const INTEGRATIONS: Integration[] = [
  {
    id: "slack",
    name: "Slack",
    category: "Communication",
    description: "Send alerts and notifications to Slack channels.",
    icon: Slack,
    iconColor: "#4A154B",
    status: "connected",
    lastTested: "2024-03-11 14:23",
    usedInWorkflows: 8,
    config: {
      workspace: "watch-center",
      channel: "#soc-alerts",
    },
  },
  {
    id: "email",
    name: "Email",
    category: "Communication",
    description: "Send notifications and approval requests via email.",
    icon: Mail,
    iconColor: "#EA4335",
    status: "connected",
    lastTested: "2024-03-11 12:15",
    usedInWorkflows: 12,
  },
  {
    id: "webhook",
    name: "Webhook",
    category: "Triggers",
    description: "Trigger workflows using external HTTP requests.",
    icon: Webhook,
    iconColor: colors.accent,
    status: "connected",
    lastTested: "2024-03-11 10:05",
    usedInWorkflows: 15,
  },
  {
    id: "aws",
    name: "AWS",
    category: "Cloud",
    description: "Automate AWS infrastructure actions.",
    icon: Cloud,
    iconColor: "#FF9900",
    status: "not_connected",
    usedInWorkflows: 0,
  },
  {
    id: "github",
    name: "GitHub",
    category: "Development",
    description: "Trigger workflows from repository events.",
    icon: Github,
    iconColor: "#24292e",
    status: "connected",
    lastTested: "2024-03-10 16:42",
    usedInWorkflows: 3,
  },
  {
    id: "postgres",
    name: "PostgreSQL",
    category: "Database",
    description: "Query and update database records.",
    icon: Database,
    iconColor: "#336791",
    status: "connected",
    lastTested: "2024-03-11 08:30",
    usedInWorkflows: 5,
  },
  {
    id: "rest-api",
    name: "REST API",
    category: "Integration",
    description: "Call external APIs with authentication.",
    icon: Code2,
    iconColor: colors.buttonPrimary,
    status: "disabled",
    usedInWorkflows: 0,
  },
  {
    id: "jira",
    name: "Jira",
    category: "Project Management",
    description: "Create and update Jira tickets automatically.",
    icon: Activity,
    iconColor: "#0052CC",
    status: "not_connected",
    usedInWorkflows: 0,
  },
];

const AVAILABLE_INTEGRATIONS = [
  { id: "slack", name: "Slack", icon: Slack, color: "#4A154B", category: "Communication" },
  { id: "email", name: "Email", icon: Mail, color: "#EA4335", category: "Communication" },
  { id: "webhook", name: "Webhook", icon: Webhook, color: colors.accent, category: "Triggers" },
  { id: "aws", name: "AWS", icon: Cloud, color: "#FF9900", category: "Cloud" },
  { id: "github", name: "GitHub", icon: Github, color: "#24292e", category: "Development" },
  { id: "postgres", name: "PostgreSQL", icon: Database, color: "#336791", category: "Database" },
  { id: "rest-api", name: "REST API", icon: Code2, color: colors.buttonPrimary, category: "Integration" },
  { id: "jira", name: "Jira", icon: Activity, color: "#0052CC", category: "Project Management" },
];

/* ================================================================
   STATUS BADGE
   ================================================================ */

function StatusBadge({ status }: { status: ConnectionStatus }) {
  const config = {
    connected: { label: "Connected", color: colors.active, icon: CheckCircle2 },
    not_connected: { label: "Not Connected", color: colors.textDim, icon: AlertCircle },
    disabled: { label: "Disabled", color: colors.textDim, icon: XCircle },
    error: { label: "Error", color: colors.critical, icon: AlertTriangle },
  };

  const { label, color, icon: Icon } = config[status];

  return (
    <div
      className="inline-flex items-center gap-[5px] px-[8px] py-[4px] rounded-[6px] text-[11px]"
      style={{
        backgroundColor: `${color}12`,
        color: color,
        border: `1px solid ${color}30`,
        fontWeight: 500,
      }}
    >
      <Icon size={11} strokeWidth={2} />
      {label}
    </div>
  );
}

/* ================================================================
   INTEGRATION CARD
   ================================================================ */

const IntegrationCard = React.memo(function IntegrationCard({
  integration,
  onClick,
}: {
  integration: Integration;
  onClick: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const Icon = integration.icon;

  return (
    <div
      className="rounded-[10px] p-[18px] transition-all cursor-pointer"
      style={{
        backgroundColor: colors.bgCard,
        border: `1px solid ${hovered ? colors.accent : colors.border}`,
        transform: hovered ? "translateY(-2px)" : "translateY(0)",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onClick}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-[14px]">
        <div
          className="size-[48px] rounded-[10px] flex items-center justify-center shrink-0"
          style={{ backgroundColor: `${integration.iconColor}15` }}
        >
          <Icon size={24} color={integration.iconColor} strokeWidth={2} />
        </div>
        <StatusBadge status={integration.status} />
      </div>

      {/* Content */}
      <h3 className="text-[14px] mb-[6px]" style={{ color: colors.textPrimary, fontWeight: 600 }}>
        {integration.name}
      </h3>
      <p className="text-[12px] mb-[14px] line-clamp-2" style={{ color: colors.textMuted }}>
        {integration.description}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="text-[11px]" style={{ color: colors.textDim }}>
          {integration.usedInWorkflows > 0
            ? `${integration.usedInWorkflows} workflow${integration.usedInWorkflows !== 1 ? "s" : ""}`
            : "Not in use"}
        </div>
        {integration.lastTested && (
          <div className="text-[10px]" style={{ color: colors.textDim }}>
            Tested {integration.lastTested}
          </div>
        )}
      </div>
    </div>
  );
});

/* ================================================================
   ADD INTEGRATION MODAL
   ================================================================ */

function AddIntegrationModal({
  onClose,
  onSelect,
}: {
  onClose: () => void;
  onSelect: (id: string) => void;
}) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return AVAILABLE_INTEGRATIONS.filter(
      (int) =>
        int.name.toLowerCase().includes(q) || int.category.toLowerCase().includes(q)
    );
  }, [search]);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center"
      style={{ backgroundColor: "rgba(0,0,0,0.65)" }}
      onClick={onClose}
    >
      <div
        className="rounded-[14px] w-[720px] max-h-[80vh] overflow-hidden flex flex-col"
        style={{ backgroundColor: colors.bgCard, border: `1px solid ${colors.border}` }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-[24px] shrink-0"
          style={{ height: 56, borderBottom: `1px solid ${colors.border}` }}
        >
          <h2 className="text-[16px]" style={{ color: colors.textPrimary, fontWeight: 600 }}>
            Add Integration
          </h2>
          <button
            onClick={onClose}
            className="size-[28px] rounded-[6px] flex items-center justify-center cursor-pointer transition-colors"
            style={{ backgroundColor: "transparent" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = colors.bgCardHover;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
            }}
          >
            <X size={16} color={colors.textDim} strokeWidth={2} />
          </button>
        </div>

        {/* Search */}
        <div className="px-[24px] pt-[20px] pb-[16px]">
          <div
            className="flex items-center gap-[10px] rounded-[8px] px-[14px]"
            style={{
              height: 40,
              backgroundColor: "rgba(255,255,255,0.03)",
              border: `1px solid ${colors.border}`,
            }}
          >
            <Search size={16} color={colors.textDim} strokeWidth={2} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search integrations..."
              className="flex-1 bg-transparent outline-none text-[13px]"
              style={{ color: colors.textSecondary }}
              autoFocus
            />
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-[24px] pb-[20px]">
          <div className="grid grid-cols-2 gap-[12px]">
            {filtered.map((int) => {
              const Icon = int.icon;
              return (
                <button
                  key={int.id}
                  onClick={() => {
                    onSelect(int.id);
                    onClose();
                  }}
                  className="text-left rounded-[10px] p-[16px] transition-all cursor-pointer"
                  style={{
                    backgroundColor: colors.bgApp,
                    border: `1px solid ${colors.border}`,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = colors.bgCardHover;
                    e.currentTarget.style.borderColor = colors.accent;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = colors.bgApp;
                    e.currentTarget.style.borderColor = colors.border;
                  }}
                >
                  <div className="flex items-center gap-[12px] mb-[10px]">
                    <div
                      className="size-[40px] rounded-[8px] flex items-center justify-center shrink-0"
                      style={{ backgroundColor: `${int.color}15` }}
                    >
                      <Icon size={20} color={int.color} strokeWidth={2} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] mb-[2px]" style={{ color: colors.textPrimary, fontWeight: 600 }}>
                        {int.name}
                      </div>
                      <div className="text-[10px]" style={{ color: colors.textDim }}>
                        {int.category}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================================================================
   INTEGRATION DETAIL MODAL
   ================================================================ */

function IntegrationDetailModal({
  integration,
  onClose,
  onSave,
  onTest,
  onDisable,
}: {
  integration: Integration;
  onClose: () => void;
  onSave: (config: any) => void;
  onTest: () => void;
  onDisable: () => void;
}) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"settings" | "auth" | "usage">("settings");
  const [showToken, setShowToken] = useState(false);
  const [config, setConfig] = useState(integration.config || {});

  const Icon = integration.icon;
  const isConnected = integration.status === "connected";

  // Mock workflows using this integration
  const mockWorkflows = [
    "Vulnerability Escalation",
    "Alert Notification",
    "Asset Monitoring",
    "Compliance Check",
    "Incident Response",
  ].slice(0, integration.usedInWorkflows);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center"
      style={{ backgroundColor: "rgba(0,0,0,0.65)" }}
      onClick={onClose}
    >
      <div
        className="rounded-[14px] w-[680px] max-h-[85vh] overflow-hidden flex flex-col"
        style={{ backgroundColor: colors.bgCard, border: `1px solid ${colors.border}` }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="px-[24px] shrink-0"
          style={{ borderBottom: `1px solid ${colors.border}` }}
        >
          <div className="flex items-center justify-between" style={{ height: 56 }}>
            <div className="flex items-center gap-[12px]">
              <div
                className="size-[40px] rounded-[8px] flex items-center justify-center"
                style={{ backgroundColor: `${integration.iconColor}15` }}
              >
                <Icon size={20} color={integration.iconColor} strokeWidth={2} />
              </div>
              <div>
                <h2 className="text-[16px]" style={{ color: colors.textPrimary, fontWeight: 600 }}>
                  {integration.name}
                </h2>
                <div className="text-[11px]" style={{ color: colors.textMuted }}>
                  {integration.category}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-[10px]">
              <StatusBadge status={integration.status} />
              <button
                onClick={onClose}
                className="size-[28px] rounded-[6px] flex items-center justify-center cursor-pointer transition-colors"
                style={{ backgroundColor: "transparent" }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = colors.bgCardHover;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                }}
              >
                <X size={16} color={colors.textDim} strokeWidth={2} />
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex" style={{ borderBottom: `1px solid ${colors.border}` }}>
            {[
              { key: "settings" as const, label: "Connection Settings" },
              { key: "auth" as const, label: "Authentication" },
              { key: "usage" as const, label: "Workflow Usage" },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className="pb-[12px] px-[14px] relative"
              >
                <span
                  className="text-[12px] transition-colors"
                  style={{
                    color: activeTab === tab.key ? colors.textPrimary : colors.textSecondary,
                    fontWeight: activeTab === tab.key ? 600 : 500,
                  }}
                >
                  {tab.label}
                </span>
                {activeTab === tab.key && (
                  <div
                    className="absolute bottom-0 left-0 right-0 h-[2px]"
                    style={{ backgroundColor: colors.accent }}
                  />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-[24px] py-[20px]">
          {activeTab === "settings" && (
            <div className="flex flex-col gap-[16px]">
              {/* Workspace/Endpoint */}
              <div>
                <label className="text-[11px] mb-[8px] block" style={{ color: colors.textMuted, fontWeight: 500 }}>
                  {integration.id === "slack" ? "Slack Workspace" : "Endpoint URL"}
                </label>
                <input
                  type="text"
                  value={config.workspace || config.endpoint || ""}
                  onChange={(e) => setConfig({ ...config, workspace: e.target.value, endpoint: e.target.value })}
                  placeholder={integration.id === "slack" ? "watch-center" : "https://api.example.com"}
                  className="w-full rounded-[8px] px-[14px] py-[10px] text-[13px] outline-none"
                  style={{
                    backgroundColor: "rgba(255,255,255,0.03)",
                    border: `1px solid ${colors.border}`,
                    color: colors.textPrimary,
                  }}
                />
              </div>

              {/* Channel/Database */}
              {integration.id === "slack" && (
                <div>
                  <label className="text-[11px] mb-[8px] block" style={{ color: colors.textMuted, fontWeight: 500 }}>
                    Default Channel
                  </label>
                  <input
                    type="text"
                    value={config.channel || ""}
                    onChange={(e) => setConfig({ ...config, channel: e.target.value })}
                    placeholder="#soc-alerts"
                    className="w-full rounded-[8px] px-[14px] py-[10px] text-[13px] outline-none"
                    style={{
                      backgroundColor: "rgba(255,255,255,0.03)",
                      border: `1px solid ${colors.border}`,
                      color: colors.textPrimary,
                    }}
                  />
                </div>
              )}
            </div>
          )}

          {activeTab === "auth" && (
            <div className="flex flex-col gap-[16px]">
              {/* API Key / Token */}
              <div>
                <label className="text-[11px] mb-[8px] block" style={{ color: colors.textMuted, fontWeight: 500 }}>
                  {integration.id === "slack" ? "Bot Token" : "API Key"}
                </label>
                <div className="relative">
                  <input
                    type={showToken ? "text" : "password"}
                    value={config.token || config.apiKey || (isConnected ? "••••••••••••••••" : "")}
                    onChange={(e) => setConfig({ ...config, token: e.target.value, apiKey: e.target.value })}
                    placeholder={integration.id === "slack" ? "xoxb-..." : "Enter API key"}
                    className="w-full rounded-[8px] px-[14px] py-[10px] pr-[40px] text-[13px] outline-none font-mono"
                    style={{
                      backgroundColor: "rgba(255,255,255,0.03)",
                      border: `1px solid ${colors.border}`,
                      color: colors.textPrimary,
                    }}
                  />
                  <button
                    onClick={() => setShowToken(!showToken)}
                    className="absolute right-[10px] top-1/2 -translate-y-1/2 size-[24px] rounded-[4px] flex items-center justify-center transition-colors"
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = colors.bgCardHover;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "transparent";
                    }}
                  >
                    {showToken ? (
                      <EyeOff size={14} color={colors.textDim} strokeWidth={2} />
                    ) : (
                      <Eye size={14} color={colors.textDim} strokeWidth={2} />
                    )}
                  </button>
                </div>
              </div>

              {/* Security Notice */}
              <div
                className="rounded-[8px] p-[12px]"
                style={{
                  backgroundColor: `${colors.accent}08`,
                  border: `1px solid ${colors.accent}20`,
                }}
              >
                <div className="flex items-start gap-[10px]">
                  <Shield size={16} color={colors.accent} strokeWidth={2} className="shrink-0 mt-[2px]" />
                  <div className="flex-1 min-w-0">
                    <div className="text-[11px] mb-[4px]" style={{ color: colors.accent, fontWeight: 600 }}>
                      Secure Storage
                    </div>
                    <div className="text-[10px]" style={{ color: colors.textMuted }}>
                      Credentials are encrypted and stored securely. They are never exposed in logs or workflow outputs.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "usage" && (
            <div>
              {mockWorkflows.length > 0 ? (
                <>
                  <div className="text-[11px] uppercase tracking-[0.08em] mb-[12px]" style={{ color: colors.textDim, fontWeight: 600 }}>
                    Used in {mockWorkflows.length} Workflow{mockWorkflows.length !== 1 ? "s" : ""}
                  </div>
                  <div className="flex flex-col gap-[8px]">
                    {mockWorkflows.map((workflow, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          navigate("/workflows/new/demo");
                          onClose();
                        }}
                        className="flex items-center justify-between rounded-[8px] px-[14px] py-[12px] transition-colors text-left"
                        style={{
                          backgroundColor: colors.bgApp,
                          border: `1px solid ${colors.border}`,
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = colors.bgCardHover;
                          e.currentTarget.style.borderColor = colors.accent;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = colors.bgApp;
                          e.currentTarget.style.borderColor = colors.border;
                        }}
                      >
                        <div className="flex items-center gap-[10px]">
                          <Workflow size={16} color={colors.textMuted} strokeWidth={2} />
                          <span className="text-[12px]" style={{ color: colors.textPrimary, fontWeight: 500 }}>
                            {workflow}
                          </span>
                        </div>
                        <ExternalLink size={14} color={colors.textDim} strokeWidth={2} />
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-center py-[40px]">
                  <div
                    className="size-[64px] rounded-full flex items-center justify-center mx-auto mb-[16px]"
                    style={{
                      backgroundColor: `${colors.textDim}10`,
                      border: `1px solid ${colors.textDim}20`,
                    }}
                  >
                    <Workflow size={28} color={colors.textDim} strokeWidth={2} />
                  </div>
                  <div className="text-[13px] mb-[4px]" style={{ color: colors.textPrimary, fontWeight: 600 }}>
                    Not used in any workflows
                  </div>
                  <div className="text-[12px]" style={{ color: colors.textMuted }}>
                    Connect this integration to start using it.
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className="flex items-center justify-between px-[24px] py-[16px] shrink-0"
          style={{ borderTop: `1px solid ${colors.border}` }}
        >
          <div className="flex items-center gap-[10px]">
            {isConnected && (
              <>
                <button
                  onClick={onTest}
                  className="flex items-center gap-[6px] rounded-[8px] px-[14px] py-[8px] text-[12px] transition-colors cursor-pointer"
                  style={{
                    backgroundColor: "transparent",
                    border: `1px solid ${colors.border}`,
                    color: colors.textSecondary,
                    fontWeight: 500,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = colors.bgCardHover;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                  }}
                >
                  <FlaskConical size={14} strokeWidth={2} />
                  Test Connection
                </button>
                <button
                  onClick={onDisable}
                  className="flex items-center gap-[6px] rounded-[8px] px-[14px] py-[8px] text-[12px] transition-colors cursor-pointer"
                  style={{
                    backgroundColor: "transparent",
                    border: `1px solid ${colors.border}`,
                    color: colors.textSecondary,
                    fontWeight: 500,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = colors.bgCardHover;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                  }}
                >
                  <Power size={14} strokeWidth={2} />
                  Disable
                </button>
              </>
            )}
          </div>
          <div className="flex items-center gap-[10px]">
            <button
              onClick={onClose}
              className="rounded-[8px] px-[16px] py-[8px] text-[12px] transition-colors cursor-pointer"
              style={{
                backgroundColor: "transparent",
                border: `1px solid ${colors.border}`,
                color: colors.textSecondary,
                fontWeight: 500,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = colors.bgCardHover;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
              }}
            >
              Cancel
            </button>
            <button
              onClick={() => {
                onSave(config);
                onClose();
              }}
              className="rounded-[8px] px-[16px] py-[8px] text-[12px] transition-colors cursor-pointer"
              style={{
                backgroundColor: colors.buttonPrimary,
                color: "#fff",
                fontWeight: 600,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = colors.buttonPrimaryHover;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = colors.buttonPrimary;
              }}
            >
              {isConnected ? "Save Changes" : "Connect"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================================================================
   MAIN PAGE COMPONENT
   ================================================================ */

export default function IntegrationsPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<ConnectionStatus | "all">("all");
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null);
  const [integrations, setIntegrations] = useState(INTEGRATIONS);

  const filteredIntegrations = useMemo(() => {
    const q = searchQuery.toLowerCase();
    let result = integrations;

    // Status filter
    if (statusFilter !== "all") {
      result = result.filter((int) => int.status === statusFilter);
    }

    // Search
    if (q) {
      result = result.filter(
        (int) =>
          int.name.toLowerCase().includes(q) ||
          int.description.toLowerCase().includes(q) ||
          int.category.toLowerCase().includes(q)
      );
    }

    return result;
  }, [integrations, searchQuery, statusFilter]);

  const handleSelectIntegration = (id: string) => {
    const integration = integrations.find((int) => int.id === id);
    if (integration) {
      setSelectedIntegration(integration);
    } else {
      // Create new integration placeholder
      const template = AVAILABLE_INTEGRATIONS.find((int) => int.id === id);
      if (template) {
        const newInt: Integration = {
          id: template.id,
          name: template.name,
          category: template.category,
          description: `Configure ${template.name} integration`,
          icon: template.icon,
          iconColor: template.color,
          status: "not_connected",
          usedInWorkflows: 0,
        };
        setSelectedIntegration(newInt);
      }
    }
  };

  const handleSave = (config: any) => {
    if (selectedIntegration) {
      setIntegrations((prev) => {
        const existing = prev.find((int) => int.id === selectedIntegration.id);
        if (existing) {
          return prev.map((int) =>
            int.id === selectedIntegration.id
              ? { ...int, config, status: "connected" as ConnectionStatus, lastTested: new Date().toLocaleString() }
              : int
          );
        } else {
          return [...prev, { ...selectedIntegration, config, status: "connected" as ConnectionStatus, lastTested: new Date().toLocaleString() }];
        }
      });
    }
  };

  const handleTest = () => {
    alert("✅ Connection test successful!");
  };

  const handleDisable = () => {
    if (selectedIntegration) {
      setIntegrations((prev) =>
        prev.map((int) =>
          int.id === selectedIntegration.id ? { ...int, status: "disabled" as ConnectionStatus } : int
        )
      );
      setSelectedIntegration(null);
    }
  };

  const stats = {
    total: integrations.length,
    connected: integrations.filter((int) => int.status === "connected").length,
    notConnected: integrations.filter((int) => int.status === "not_connected").length,
    disabled: integrations.filter((int) => int.status === "disabled").length,
  };

  return (
    <div className="h-full flex flex-col" style={{ backgroundColor: colors.bgApp }}>
      {/* Modals */}
      {showAddModal && (
        <AddIntegrationModal
          onClose={() => setShowAddModal(false)}
          onSelect={handleSelectIntegration}
        />
      )}
      {selectedIntegration && (
        <IntegrationDetailModal
          integration={selectedIntegration}
          onClose={() => setSelectedIntegration(null)}
          onSave={handleSave}
          onTest={handleTest}
          onDisable={handleDisable}
        />
      )}

      {/* ═══════════ HEADER ═══════════ */}
      <div className="px-[24px] pt-[24px] pb-[20px]">
        <div className="flex items-center justify-between mb-[20px]">
          <h1 className="text-[24px]" style={{ color: colors.textPrimary, fontWeight: 700 }}>
            Integrations
          </h1>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-[8px] rounded-[8px] px-[16px] py-[10px] text-[13px] transition-colors cursor-pointer"
            style={{
              backgroundColor: colors.buttonPrimary,
              color: "#fff",
              fontWeight: 600,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = colors.buttonPrimaryHover;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = colors.buttonPrimary;
            }}
          >
            <Plus size={16} strokeWidth={2} />
            Add Integration
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-[12px] mb-[20px]">
          {[
            { label: "Total", value: stats.total, color: colors.textSecondary },
            { label: "Connected", value: stats.connected, color: colors.active },
            { label: "Not Connected", value: stats.notConnected, color: colors.textDim },
            { label: "Disabled", value: stats.disabled, color: colors.textDim },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-[8px] px-[16px] py-[12px]"
              style={{
                backgroundColor: colors.bgCard,
                border: `1px solid ${colors.border}`,
              }}
            >
              <div className="text-[11px] mb-[4px]" style={{ color: colors.textMuted }}>
                {stat.label}
              </div>
              <div className="text-[20px]" style={{ color: stat.color, fontWeight: 700 }}>
                {stat.value}
              </div>
            </div>
          ))}
        </div>

        {/* Search and Filter */}
        <div className="flex items-center gap-[12px]">
          {/* Search */}
          <div
            className="flex-1 flex items-center gap-[10px] rounded-[8px] px-[14px]"
            style={{
              height: 40,
              backgroundColor: "rgba(255,255,255,0.03)",
              border: `1px solid ${colors.border}`,
            }}
          >
            <Search size={16} color={colors.textDim} strokeWidth={2} />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search integrations..."
              className="flex-1 bg-transparent outline-none text-[13px]"
              style={{ color: colors.textSecondary }}
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <button
              onClick={() => setShowStatusMenu(!showStatusMenu)}
              className="flex items-center gap-[8px] rounded-[8px] px-[14px] transition-colors cursor-pointer"
              style={{
                height: 40,
                backgroundColor: showStatusMenu ? colors.bgCardHover : "rgba(255,255,255,0.03)",
                border: `1px solid ${colors.border}`,
                color: colors.textSecondary,
                fontWeight: 500,
              }}
              onMouseEnter={(e) => {
                if (!showStatusMenu) e.currentTarget.style.backgroundColor = colors.bgCardHover;
              }}
              onMouseLeave={(e) => {
                if (!showStatusMenu)
                  e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.03)";
              }}
            >
              <span className="text-[12px]">
                {statusFilter === "all"
                  ? "All"
                  : statusFilter === "not_connected"
                  ? "Not Connected"
                  : statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}
              </span>
              <ChevronDown size={14} strokeWidth={2} />
            </button>

            {showStatusMenu && (
              <>
                <div
                  className="fixed inset-0 z-[40]"
                  onClick={() => setShowStatusMenu(false)}
                />
                <div
                  className="absolute top-[44px] right-0 z-[50] rounded-[8px] py-[6px] min-w-[160px]"
                  style={{
                    backgroundColor: colors.bgCard,
                    border: `1px solid ${colors.border}`,
                    boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
                  }}
                >
                  {[
                    { value: "all" as const, label: "All" },
                    { value: "connected" as const, label: "Connected" },
                    { value: "not_connected" as const, label: "Not Connected" },
                    { value: "disabled" as const, label: "Disabled" },
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setStatusFilter(option.value);
                        setShowStatusMenu(false);
                      }}
                      className="w-full flex items-center justify-between px-[12px] py-[8px] text-left transition-colors"
                      style={{ color: colors.textSecondary }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = colors.bgCardHover;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "transparent";
                      }}
                    >
                      <span className="text-[12px]" style={{ fontWeight: 500 }}>
                        {option.label}
                      </span>
                      {statusFilter === option.value && (
                        <CheckCircle2 size={13} color={colors.accent} strokeWidth={2} />
                      )}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ═══════════ CONTENT ═══════════ */}
      <div className="flex-1 overflow-auto px-[24px] pb-[24px]">
        {filteredIntegrations.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[16px]">
            {filteredIntegrations.map((integration) => (
              <IntegrationCard
                key={integration.id}
                integration={integration}
                onClick={() => setSelectedIntegration(integration)}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-[80px]">
            <div
              className="size-[80px] rounded-full flex items-center justify-center mb-[20px]"
              style={{
                backgroundColor: `${colors.accent}10`,
                border: `1px solid ${colors.accent}20`,
              }}
            >
              <Zap size={32} color={colors.accent} strokeWidth={2} />
            </div>
            <h3
              className="text-[16px] mb-[8px]"
              style={{ color: colors.textPrimary, fontWeight: 600 }}
            >
              No integrations found
            </h3>
            <p
              className="text-[13px] text-center max-w-[340px] mb-[20px]"
              style={{ color: colors.textMuted }}
            >
              Try adjusting your search or filters, or add a new integration.
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-[6px] rounded-[8px] px-[14px] py-[8px] text-[12px] transition-colors cursor-pointer"
              style={{
                backgroundColor: colors.buttonPrimary,
                color: "#fff",
                fontWeight: 600,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = colors.buttonPrimaryHover;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = colors.buttonPrimary;
              }}
            >
              <Plus size={14} strokeWidth={2} />
              Add Integration
            </button>
          </div>
        )}
      </div>
    </div>
  );
}