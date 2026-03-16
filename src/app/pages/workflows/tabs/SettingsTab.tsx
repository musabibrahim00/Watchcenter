/**
 * Workflows Settings Tab
 * =======================
 *
 * Manages resources/connections, variables, secrets, and environment
 * configuration — all within the Workflows module, no separate pages.
 *
 * Sub-tabs:
 *   1. Resources  — reusable connections (Slack, AWS, DB, etc.)
 *   2. Variables  — workflow variables
 *   3. Secrets    — masked credentials
 *   4. Environments — per-environment overrides
 */

import React, { useState, useMemo } from "react";
import {
  Plus, Search, X, Eye, EyeOff,
  Link2, Variable, KeyRound, Server,
  Slack, Mail, Webhook, Cloud, Github, Database, Globe,
} from "lucide-react";
import { colors } from "../../../shared/design-system/tokens";
import {
  MOCK_RESOURCES, MOCK_VARIABLES, MOCK_SECRETS, MOCK_ENVIRONMENTS,
  RESOURCE_TYPE_META,
  type ResourceConnection, type WorkflowVariable, type WorkflowSecret, type WorkflowEnvironment,
  type ResourceType,
} from "../../../shared/data/workflowResources";

/* ================================================================
   SUB-TAB TYPE
   ================================================================ */

type SettingsSubTab = "resources" | "variables" | "secrets" | "environments";

const RESOURCE_ICONS: Record<ResourceType, typeof Slack> = {
  slack: Slack, email: Mail, webhook: Webhook, aws: Cloud,
  github: Github, database: Database, rest_api: Globe,
};

/* ================================================================
   SHARED SMALL COMPONENTS
   ================================================================ */

function EmptyState({ icon: Icon, title, description, actionLabel, onAction }: {
  icon: typeof Plus; title: string; description: string; actionLabel?: string; onAction?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-[60px]">
      <div className="size-[64px] rounded-full flex items-center justify-center mb-[16px]" style={{ backgroundColor: `${colors.accent}10`, border: `1px solid ${colors.accent}20` }}>
        <Icon size={28} color={colors.accent} strokeWidth={2} />
      </div>
      <h3 className="text-[15px] mb-[6px]" style={{ color: colors.textPrimary, fontWeight: 600 }}>{title}</h3>
      <p className="text-[12px] mb-[20px] text-center max-w-[320px]" style={{ color: colors.textMuted }}>{description}</p>
      {actionLabel && onAction && (
        <button onClick={onAction}
          className="flex items-center gap-[6px] rounded-[8px] px-[16px] py-[9px] text-[12px] transition-colors cursor-pointer"
          style={{ backgroundColor: colors.buttonPrimary, color: "#fff", fontWeight: 600 }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = colors.buttonPrimaryHover; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = colors.buttonPrimary; }}>
          <Plus size={14} strokeWidth={2} />{actionLabel}
        </button>
      )}
    </div>
  );
}

/* ================================================================
   RESOURCE / CONNECTION MODAL
   ================================================================ */

function ResourceModal({ resource, onClose, onSave }: {
  resource: ResourceConnection | null;
  onClose: () => void;
  onSave: (r: ResourceConnection) => void;
}) {
  const isNew = !resource;
  const [name, setName] = useState(resource?.name || "");
  const [type, setType] = useState<ResourceType>(resource?.type || "slack");
  const [description, setDescription] = useState(resource?.description || "");
  const meta = RESOURCE_TYPE_META[type];
  const RIcon = RESOURCE_ICONS[type];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center" style={{ backgroundColor: "rgba(0,0,0,0.65)" }} onClick={onClose}>
      <div className="rounded-[14px] w-[560px] max-h-[80vh] overflow-hidden flex flex-col"
        style={{ backgroundColor: colors.bgCard, border: `1px solid ${colors.border}` }}
        onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-[24px] shrink-0" style={{ height: 56, borderBottom: `1px solid ${colors.border}` }}>
          <h2 className="text-[15px]" style={{ color: colors.textPrimary, fontWeight: 600 }}>{isNew ? "New Resource" : "Edit Resource"}</h2>
          <button onClick={onClose} className="size-[28px] rounded-[6px] flex items-center justify-center cursor-pointer transition-colors"
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = colors.bgCardHover; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}>
            <X size={16} color={colors.textDim} strokeWidth={2} />
          </button>
        </div>
        {/* Body */}
        <div className="flex-1 overflow-y-auto px-[24px] py-[20px] flex flex-col gap-[16px]">
          {/* Name */}
          <div>
            <label className="text-[11px] mb-[6px] block" style={{ color: colors.textSecondary, fontWeight: 500 }}>Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. SOC Slack Workspace"
              className="w-full rounded-[8px] px-[12px] text-[12px] outline-none"
              style={{ height: 36, backgroundColor: "rgba(255,255,255,0.03)", border: `1px solid ${colors.border}`, color: colors.textSecondary }} />
          </div>
          {/* Type */}
          <div>
            <label className="text-[11px] mb-[6px] block" style={{ color: colors.textSecondary, fontWeight: 500 }}>Type</label>
            <div className="grid grid-cols-4 gap-[8px]">
              {(Object.keys(RESOURCE_TYPE_META) as ResourceType[]).map((t) => {
                const m = RESOURCE_TYPE_META[t];
                const TIcon = RESOURCE_ICONS[t];
                const active = type === t;
                return (
                  <button key={t} onClick={() => setType(t)}
                    className="flex flex-col items-center gap-[6px] rounded-[8px] py-[10px] px-[8px] text-center transition-colors cursor-pointer"
                    style={{ backgroundColor: active ? `${m.color}10` : "transparent", border: `1px solid ${active ? m.color : colors.border}` }}
                    onMouseEnter={(e) => { if (!active) e.currentTarget.style.backgroundColor = colors.bgCardHover; }}
                    onMouseLeave={(e) => { if (!active) e.currentTarget.style.backgroundColor = active ? `${m.color}10` : "transparent"; }}>
                    <TIcon size={16} color={active ? m.color : colors.textDim} strokeWidth={2} />
                    <span className="text-[10px]" style={{ color: active ? colors.textPrimary : colors.textMuted, fontWeight: active ? 600 : 500 }}>{m.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
          {/* Description */}
          <div>
            <label className="text-[11px] mb-[6px] block" style={{ color: colors.textSecondary, fontWeight: 500 }}>Description</label>
            <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What is this connection for?"
              className="w-full rounded-[8px] px-[12px] text-[12px] outline-none"
              style={{ height: 36, backgroundColor: "rgba(255,255,255,0.03)", border: `1px solid ${colors.border}`, color: colors.textSecondary }} />
          </div>
          {/* Type-specific config hint */}
          <div className="rounded-[8px] p-[12px]" style={{ backgroundColor: `${meta.color}08`, border: `1px solid ${meta.color}20` }}>
            <div className="flex items-center gap-[8px] mb-[6px]">
              <RIcon size={14} color={meta.color} strokeWidth={2} />
              <span className="text-[11px]" style={{ color: meta.color, fontWeight: 600 }}>{meta.label} Configuration</span>
            </div>
            <p className="text-[10px]" style={{ color: colors.textMuted }}>{meta.description}. Connection details are encrypted at rest and stored securely.</p>
          </div>
        </div>
        {/* Footer */}
        <div className="px-[24px] py-[14px] flex items-center justify-end gap-[10px] shrink-0" style={{ borderTop: `1px solid ${colors.border}` }}>
          <button onClick={onClose} className="rounded-[8px] px-[16px] py-[8px] text-[12px] cursor-pointer transition-colors"
            style={{ backgroundColor: "transparent", border: `1px solid ${colors.border}`, color: colors.textSecondary, fontWeight: 500 }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = colors.bgCardHover; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}>Cancel</button>
          <button onClick={() => {
            onSave({ id: resource?.id || `rc-${Date.now()}`, name, type, description, status: "connected", lastUsed: "Just now", config: resource?.config || {} });
            onClose();
          }} className="rounded-[8px] px-[16px] py-[8px] text-[12px] cursor-pointer transition-colors"
            style={{ backgroundColor: colors.buttonPrimary, color: "#fff", fontWeight: 600 }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = colors.buttonPrimaryHover; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = colors.buttonPrimary; }}>
            {isNew ? "Create Resource" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ================================================================
   VARIABLE MODAL
   ================================================================ */

function VariableModal({ variable, onClose, onSave }: {
  variable: WorkflowVariable | null; onClose: () => void; onSave: (v: WorkflowVariable) => void;
}) {
  const isNew = !variable;
  const [name, setName] = useState(variable?.name || "");
  const [value, setValue] = useState(variable?.value || "");
  const [description, setDescription] = useState(variable?.description || "");
  const [type, setType] = useState(variable?.type || "string");

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center" style={{ backgroundColor: "rgba(0,0,0,0.65)" }} onClick={onClose}>
      <div className="rounded-[14px] w-[480px] max-h-[80vh] overflow-hidden flex flex-col"
        style={{ backgroundColor: colors.bgCard, border: `1px solid ${colors.border}` }}
        onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-[24px] shrink-0" style={{ height: 56, borderBottom: `1px solid ${colors.border}` }}>
          <h2 className="text-[15px]" style={{ color: colors.textPrimary, fontWeight: 600 }}>{isNew ? "New Variable" : "Edit Variable"}</h2>
          <button onClick={onClose} className="size-[28px] rounded-[6px] flex items-center justify-center cursor-pointer transition-colors"
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = colors.bgCardHover; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}>
            <X size={16} color={colors.textDim} strokeWidth={2} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-[24px] py-[20px] flex flex-col gap-[14px]">
          <div>
            <label className="text-[11px] mb-[6px] block" style={{ color: colors.textSecondary, fontWeight: 500 }}>Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. soc_channel"
              className="w-full rounded-[8px] px-[12px] text-[12px] outline-none font-mono"
              style={{ height: 36, backgroundColor: "rgba(255,255,255,0.03)", border: `1px solid ${colors.border}`, color: colors.textSecondary }} />
          </div>
          <div>
            <label className="text-[11px] mb-[6px] block" style={{ color: colors.textSecondary, fontWeight: 500 }}>Type</label>
            <div className="flex gap-[6px]">
              {(["string", "number", "boolean", "json"] as const).map((t) => (
                <button key={t} onClick={() => setType(t)}
                  className="px-[12px] py-[6px] rounded-[6px] text-[11px] capitalize cursor-pointer transition-colors"
                  style={{ backgroundColor: type === t ? `${colors.accent}15` : "transparent", border: `1px solid ${type === t ? colors.accent : colors.border}`, color: type === t ? colors.accent : colors.textMuted, fontWeight: type === t ? 600 : 500 }}>
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-[11px] mb-[6px] block" style={{ color: colors.textSecondary, fontWeight: 500 }}>Value</label>
            {type === "json" ? (
              <textarea value={value} onChange={(e) => setValue(e.target.value)} placeholder='{"key": "value"}' rows={3}
                className="w-full rounded-[8px] px-[12px] py-[8px] text-[12px] outline-none resize-none font-mono"
                style={{ backgroundColor: "rgba(255,255,255,0.03)", border: `1px solid ${colors.border}`, color: colors.textSecondary }} />
            ) : (
              <input value={value} onChange={(e) => setValue(e.target.value)} placeholder="Enter value..."
                className="w-full rounded-[8px] px-[12px] text-[12px] outline-none"
                style={{ height: 36, backgroundColor: "rgba(255,255,255,0.03)", border: `1px solid ${colors.border}`, color: colors.textSecondary }} />
            )}
          </div>
          <div>
            <label className="text-[11px] mb-[6px] block" style={{ color: colors.textSecondary, fontWeight: 500 }}>Description</label>
            <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What is this variable for?"
              className="w-full rounded-[8px] px-[12px] text-[12px] outline-none"
              style={{ height: 36, backgroundColor: "rgba(255,255,255,0.03)", border: `1px solid ${colors.border}`, color: colors.textSecondary }} />
          </div>
        </div>
        <div className="px-[24px] py-[14px] flex items-center justify-end gap-[10px] shrink-0" style={{ borderTop: `1px solid ${colors.border}` }}>
          <button onClick={onClose} className="rounded-[8px] px-[16px] py-[8px] text-[12px] cursor-pointer transition-colors"
            style={{ backgroundColor: "transparent", border: `1px solid ${colors.border}`, color: colors.textSecondary, fontWeight: 500 }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = colors.bgCardHover; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}>Cancel</button>
          <button onClick={() => {
            onSave({ id: variable?.id || `var-${Date.now()}`, name, value, description, scope: "global", type: type as WorkflowVariable["type"] });
            onClose();
          }} className="rounded-[8px] px-[16px] py-[8px] text-[12px] cursor-pointer transition-colors"
            style={{ backgroundColor: colors.buttonPrimary, color: "#fff", fontWeight: 600 }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = colors.buttonPrimaryHover; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = colors.buttonPrimary; }}>
            {isNew ? "Create Variable" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ================================================================
   SECRET MODAL
   ================================================================ */

function SecretModal({ secret, onClose, onSave }: {
  secret: WorkflowSecret | null; onClose: () => void; onSave: (s: WorkflowSecret) => void;
}) {
  const isNew = !secret;
  const [name, setName] = useState(secret?.name || "");
  const [description, setDescription] = useState(secret?.description || "");

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center" style={{ backgroundColor: "rgba(0,0,0,0.65)" }} onClick={onClose}>
      <div className="rounded-[14px] w-[480px] max-h-[80vh] overflow-hidden flex flex-col"
        style={{ backgroundColor: colors.bgCard, border: `1px solid ${colors.border}` }}
        onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-[24px] shrink-0" style={{ height: 56, borderBottom: `1px solid ${colors.border}` }}>
          <h2 className="text-[15px]" style={{ color: colors.textPrimary, fontWeight: 600 }}>{isNew ? "New Secret" : "Edit Secret"}</h2>
          <button onClick={onClose} className="size-[28px] rounded-[6px] flex items-center justify-center cursor-pointer transition-colors"
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = colors.bgCardHover; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}>
            <X size={16} color={colors.textDim} strokeWidth={2} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-[24px] py-[20px] flex flex-col gap-[14px]">
          <div>
            <label className="text-[11px] mb-[6px] block" style={{ color: colors.textSecondary, fontWeight: 500 }}>Name</label>
            <input value={name} onChange={(e) => setName(e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, "_"))} placeholder="e.g. SLACK_BOT_TOKEN"
              className="w-full rounded-[8px] px-[12px] text-[12px] outline-none font-mono"
              style={{ height: 36, backgroundColor: "rgba(255,255,255,0.03)", border: `1px solid ${colors.border}`, color: colors.textSecondary }} />
          </div>
          <div>
            <label className="text-[11px] mb-[6px] block" style={{ color: colors.textSecondary, fontWeight: 500 }}>Value</label>
            <input type="password" placeholder="Enter secret value..." autoComplete="off"
              className="w-full rounded-[8px] px-[12px] text-[12px] outline-none font-mono"
              style={{ height: 36, backgroundColor: "rgba(255,255,255,0.03)", border: `1px solid ${colors.border}`, color: colors.textSecondary }} />
            <p className="text-[9px] mt-[4px]" style={{ color: colors.textDim }}>Secret values are encrypted at rest and never displayed after creation.</p>
          </div>
          <div>
            <label className="text-[11px] mb-[6px] block" style={{ color: colors.textSecondary, fontWeight: 500 }}>Description</label>
            <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What is this secret for?"
              className="w-full rounded-[8px] px-[12px] text-[12px] outline-none"
              style={{ height: 36, backgroundColor: "rgba(255,255,255,0.03)", border: `1px solid ${colors.border}`, color: colors.textSecondary }} />
          </div>
          <div className="rounded-[8px] p-[10px]" style={{ backgroundColor: `${colors.medium}08`, border: `1px solid ${colors.medium}20` }}>
            <div className="flex items-center gap-[6px] mb-[4px]"><KeyRound size={12} color={colors.medium} strokeWidth={2} /><span className="text-[10px]" style={{ color: colors.medium, fontWeight: 600 }}>Security Note</span></div>
            <p className="text-[10px]" style={{ color: colors.textMuted }}>Secrets are masked by default and only revealed to authorized users. They are referenced in steps as <span className="font-mono">{"{"}{"{"}&nbsp;secrets.NAME&nbsp;{"}"}{"}"}</span>.</p>
          </div>
        </div>
        <div className="px-[24px] py-[14px] flex items-center justify-end gap-[10px] shrink-0" style={{ borderTop: `1px solid ${colors.border}` }}>
          <button onClick={onClose} className="rounded-[8px] px-[16px] py-[8px] text-[12px] cursor-pointer transition-colors"
            style={{ backgroundColor: "transparent", border: `1px solid ${colors.border}`, color: colors.textSecondary, fontWeight: 500 }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = colors.bgCardHover; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}>Cancel</button>
          <button onClick={() => {
            onSave({ id: secret?.id || `sec-${Date.now()}`, name, description, lastRotated: "Just now", scope: "global", usedBy: 0 });
            onClose();
          }} className="rounded-[8px] px-[16px] py-[8px] text-[12px] cursor-pointer transition-colors"
            style={{ backgroundColor: colors.buttonPrimary, color: "#fff", fontWeight: 600 }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = colors.buttonPrimaryHover; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = colors.buttonPrimary; }}>
            {isNew ? "Create Secret" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ================================================================
   ENVIRONMENT MODAL
   ================================================================ */

function EnvironmentModal({ env, onClose, onSave }: {
  env: WorkflowEnvironment | null; onClose: () => void; onSave: (e: WorkflowEnvironment) => void;
}) {
  const isNew = !env;
  const [name, setName] = useState(env?.name || "");
  const [description, setDescription] = useState(env?.description || "");
  const [vars, setVars] = useState<[string, string][]>(env ? Object.entries(env.variables) : [["", ""]]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center" style={{ backgroundColor: "rgba(0,0,0,0.65)" }} onClick={onClose}>
      <div className="rounded-[14px] w-[540px] max-h-[80vh] overflow-hidden flex flex-col"
        style={{ backgroundColor: colors.bgCard, border: `1px solid ${colors.border}` }}
        onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-[24px] shrink-0" style={{ height: 56, borderBottom: `1px solid ${colors.border}` }}>
          <h2 className="text-[15px]" style={{ color: colors.textPrimary, fontWeight: 600 }}>{isNew ? "New Environment" : "Edit Environment"}</h2>
          <button onClick={onClose} className="size-[28px] rounded-[6px] flex items-center justify-center cursor-pointer transition-colors"
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = colors.bgCardHover; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}>
            <X size={16} color={colors.textDim} strokeWidth={2} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-[24px] py-[20px] flex flex-col gap-[14px]">
          <div>
            <label className="text-[11px] mb-[6px] block" style={{ color: colors.textSecondary, fontWeight: 500 }}>Environment Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Production"
              className="w-full rounded-[8px] px-[12px] text-[12px] outline-none"
              style={{ height: 36, backgroundColor: "rgba(255,255,255,0.03)", border: `1px solid ${colors.border}`, color: colors.textSecondary }} />
          </div>
          <div>
            <label className="text-[11px] mb-[6px] block" style={{ color: colors.textSecondary, fontWeight: 500 }}>Description</label>
            <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Environment purpose"
              className="w-full rounded-[8px] px-[12px] text-[12px] outline-none"
              style={{ height: 36, backgroundColor: "rgba(255,255,255,0.03)", border: `1px solid ${colors.border}`, color: colors.textSecondary }} />
          </div>
          <div>
            <div className="flex items-center justify-between mb-[8px]">
              <label className="text-[11px]" style={{ color: colors.textSecondary, fontWeight: 500 }}>Environment Variables</label>
              <button onClick={() => setVars((v) => [...v, ["", ""]])}
                className="flex items-center gap-[4px] text-[10px] cursor-pointer transition-colors"
                style={{ color: colors.accent }}
                onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.8"; }}
                onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}>
                <Plus size={10} strokeWidth={2} /> Add
              </button>
            </div>
            <div className="flex flex-col gap-[8px]">
              {vars.map(([k, v], i) => (
                <div key={i} className="flex items-center gap-[8px]">
                  <input value={k} onChange={(e) => setVars((arr) => arr.map((pair, j) => j === i ? [e.target.value, pair[1]] : pair))}
                    placeholder="KEY" className="flex-1 rounded-[6px] px-[10px] text-[11px] outline-none font-mono"
                    style={{ height: 32, backgroundColor: "rgba(255,255,255,0.03)", border: `1px solid ${colors.border}`, color: colors.textSecondary }} />
                  <input value={v} onChange={(e) => setVars((arr) => arr.map((pair, j) => j === i ? [pair[0], e.target.value] : pair))}
                    placeholder="value" className="flex-1 rounded-[6px] px-[10px] text-[11px] outline-none"
                    style={{ height: 32, backgroundColor: "rgba(255,255,255,0.03)", border: `1px solid ${colors.border}`, color: colors.textSecondary }} />
                  <button onClick={() => setVars((arr) => arr.filter((_, j) => j !== i))}
                    className="size-[24px] rounded-[4px] flex items-center justify-center cursor-pointer shrink-0 transition-colors"
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = `${colors.critical}15`; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}>
                    <X size={10} color={colors.textDim} strokeWidth={2} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="px-[24px] py-[14px] flex items-center justify-end gap-[10px] shrink-0" style={{ borderTop: `1px solid ${colors.border}` }}>
          <button onClick={onClose} className="rounded-[8px] px-[16px] py-[8px] text-[12px] cursor-pointer transition-colors"
            style={{ backgroundColor: "transparent", border: `1px solid ${colors.border}`, color: colors.textSecondary, fontWeight: 500 }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = colors.bgCardHover; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}>Cancel</button>
          <button onClick={() => {
            const variables: Record<string, string> = {};
            vars.forEach(([k, v]) => { if (k) variables[k] = v; });
            onSave({ id: env?.id || `env-${Date.now()}`, name, description, isActive: env?.isActive ?? false, variables });
            onClose();
          }} className="rounded-[8px] px-[16px] py-[8px] text-[12px] cursor-pointer transition-colors"
            style={{ backgroundColor: colors.buttonPrimary, color: "#fff", fontWeight: 600 }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = colors.buttonPrimaryHover; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = colors.buttonPrimary; }}>
            {isNew ? "Create Environment" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ================================================================
   MAIN SETTINGS TAB
   ================================================================ */

export default function SettingsTab({ workflowId }: { workflowId?: string } = {}) {
  const [subTab, setSubTab] = useState<SettingsSubTab>("resources");
  const [search, setSearch] = useState("");

  // Data state
  const [resources, setResources] = useState<ResourceConnection[]>(MOCK_RESOURCES);
  const [variables, setVariables] = useState<WorkflowVariable[]>(MOCK_VARIABLES);
  const [secrets, setSecrets] = useState<WorkflowSecret[]>(MOCK_SECRETS);
  const [environments, setEnvironments] = useState<WorkflowEnvironment[]>(MOCK_ENVIRONMENTS);

  // Modal state
  const [editingResource, setEditingResource] = useState<ResourceConnection | null | "new">(null);
  const [editingVariable, setEditingVariable] = useState<WorkflowVariable | null | "new">(null);
  const [editingSecret, setEditingSecret] = useState<WorkflowSecret | null | "new">(null);
  const [editingEnv, setEditingEnv] = useState<WorkflowEnvironment | null | "new">(null);

  // Secret reveal state
  const [revealedSecrets, setRevealedSecrets] = useState<Set<string>>(new Set());

  const SUB_TABS: { key: SettingsSubTab; label: string; icon: typeof Link2 }[] = [
    { key: "resources", label: "Resources", icon: Link2 },
    { key: "variables", label: "Variables", icon: Variable },
    { key: "secrets", label: "Secrets", icon: KeyRound },
    { key: "environments", label: "Environments", icon: Server },
  ];

  const filteredResources = useMemo(() => {
    const q = search.toLowerCase();
    return q ? resources.filter((r) => r.name.toLowerCase().includes(q) || r.type.includes(q) || r.description.toLowerCase().includes(q)) : resources;
  }, [resources, search]);

  const filteredVariables = useMemo(() => {
    const q = search.toLowerCase();
    return q ? variables.filter((v) => v.name.toLowerCase().includes(q) || v.description.toLowerCase().includes(q)) : variables;
  }, [variables, search]);

  const filteredSecrets = useMemo(() => {
    const q = search.toLowerCase();
    return q ? secrets.filter((s) => s.name.toLowerCase().includes(q) || s.description.toLowerCase().includes(q)) : secrets;
  }, [secrets, search]);

  const statusColor: Record<string, string> = { connected: colors.active, disconnected: colors.textDim, error: colors.critical };

  return (
    <>
      {/* Modals */}
      {editingResource !== null && (
        <ResourceModal
          resource={editingResource === "new" ? null : editingResource}
          onClose={() => setEditingResource(null)}
          onSave={(r) => setResources((prev) => { const idx = prev.findIndex((x) => x.id === r.id); if (idx >= 0) { const copy = [...prev]; copy[idx] = r; return copy; } return [...prev, r]; })}
        />
      )}
      {editingVariable !== null && (
        <VariableModal
          variable={editingVariable === "new" ? null : editingVariable}
          onClose={() => setEditingVariable(null)}
          onSave={(v) => setVariables((prev) => { const idx = prev.findIndex((x) => x.id === v.id); if (idx >= 0) { const copy = [...prev]; copy[idx] = v; return copy; } return [...prev, v]; })}
        />
      )}
      {editingSecret !== null && (
        <SecretModal
          secret={editingSecret === "new" ? null : editingSecret}
          onClose={() => setEditingSecret(null)}
          onSave={(s) => setSecrets((prev) => { const idx = prev.findIndex((x) => x.id === s.id); if (idx >= 0) { const copy = [...prev]; copy[idx] = s; return copy; } return [...prev, s]; })}
        />
      )}
      {editingEnv !== null && (
        <EnvironmentModal
          env={editingEnv === "new" ? null : editingEnv}
          onClose={() => setEditingEnv(null)}
          onSave={(e) => setEnvironments((prev) => { const idx = prev.findIndex((x) => x.id === e.id); if (idx >= 0) { const copy = [...prev]; copy[idx] = e; return copy; } return [...prev, e]; })}
        />
      )}

      {/* Sub-tab bar */}
      <div className="flex items-center gap-[6px] mb-[20px]">
        {SUB_TABS.map((t) => {
          const TIcon = t.icon;
          const active = subTab === t.key;
          return (
            <button key={t.key} onClick={() => { setSubTab(t.key); setSearch(""); }}
              className="flex items-center gap-[6px] rounded-[8px] px-[14px] py-[8px] text-[12px] transition-colors cursor-pointer"
              style={{ backgroundColor: active ? `${colors.accent}12` : "transparent", border: `1px solid ${active ? colors.accent : colors.border}`, color: active ? colors.accent : colors.textSecondary, fontWeight: active ? 600 : 500 }}
              onMouseEnter={(e) => { if (!active) e.currentTarget.style.backgroundColor = colors.bgCardHover; }}
              onMouseLeave={(e) => { if (!active) e.currentTarget.style.backgroundColor = active ? `${colors.accent}12` : "transparent"; }}>
              <TIcon size={13} strokeWidth={2} />{t.label}
            </button>
          );
        })}
      </div>

      {/* Search + Add */}
      <div className="flex items-center gap-[12px] mb-[20px]">
        <div className="flex-1 flex items-center gap-[10px] rounded-[8px] px-[14px]" style={{ height: 40, backgroundColor: "rgba(255,255,255,0.03)", border: `1px solid ${colors.border}` }}>
          <Search size={16} color={colors.textDim} strokeWidth={2} />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={`Search ${subTab}...`} className="flex-1 bg-transparent outline-none text-[13px]" style={{ color: colors.textSecondary }} />
        </div>
        <button onClick={() => {
          if (subTab === "resources") setEditingResource("new");
          else if (subTab === "variables") setEditingVariable("new");
          else if (subTab === "secrets") setEditingSecret("new");
          else setEditingEnv("new");
        }} className="flex items-center gap-[6px] rounded-[8px] px-[14px] py-[9px] text-[12px] transition-colors cursor-pointer shrink-0"
          style={{ backgroundColor: colors.buttonPrimary, color: "#fff", fontWeight: 600 }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = colors.buttonPrimaryHover; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = colors.buttonPrimary; }}>
          <Plus size={14} strokeWidth={2} />Add {subTab === "resources" ? "Resource" : subTab === "variables" ? "Variable" : subTab === "secrets" ? "Secret" : "Environment"}
        </button>
      </div>

      {/* ── RESOURCES SUB-TAB ── */}
      {subTab === "resources" && (
        filteredResources.length > 0 ? (
          <div className="grid grid-cols-2 gap-[14px]">
            {filteredResources.map((rc) => {
              const meta = RESOURCE_TYPE_META[rc.type];
              const RIcon = RESOURCE_ICONS[rc.type];
              return (
                <div key={rc.id} className="rounded-[10px] p-[16px] transition-colors cursor-pointer"
                  style={{ backgroundColor: colors.bgCard, border: `1px solid ${colors.border}` }}
                  onClick={() => setEditingResource(rc)}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = colors.bgCardHover; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = colors.bgCard; }}>
                  <div className="flex items-start gap-[12px] mb-[10px]">
                    <div className="size-[36px] rounded-[8px] flex items-center justify-center shrink-0" style={{ backgroundColor: `${meta.color}12` }}>
                      <RIcon size={18} color={meta.color} strokeWidth={2} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] mb-[3px] truncate" style={{ color: colors.textPrimary, fontWeight: 600 }}>{rc.name}</div>
                      <div className="text-[11px] truncate" style={{ color: colors.textMuted }}>{rc.description}</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-[10px]" style={{ borderTop: `1px solid ${colors.divider}` }}>
                    <div className="flex items-center gap-[6px]">
                      <div className="size-[6px] rounded-full" style={{ backgroundColor: statusColor[rc.status] }} />
                      <span className="text-[10px] capitalize" style={{ color: statusColor[rc.status], fontWeight: 500 }}>{rc.status}</span>
                    </div>
                    {rc.lastUsed && <span className="text-[10px]" style={{ color: colors.textDim }}>{rc.lastUsed}</span>}
                  </div>
                </div>
              );
            })}
          </div>
        ) : <EmptyState icon={Link2} title="No resources yet" description="Add reusable connections like Slack, AWS, or databases." actionLabel="Add Resource" onAction={() => setEditingResource("new")} />
      )}

      {/* ── VARIABLES SUB-TAB ── */}
      {subTab === "variables" && (
        filteredVariables.length > 0 ? (
          <div className="rounded-[10px] overflow-hidden" style={{ border: `1px solid ${colors.border}` }}>
            {/* Header row */}
            <div className="grid grid-cols-[1fr_1fr_180px_60px] px-[16px] py-[10px]" style={{ backgroundColor: colors.tableHeaderBg, borderBottom: `1px solid ${colors.border}` }}>
              <span className="text-[10px] uppercase tracking-[0.08em]" style={{ color: colors.textDim, fontWeight: 600 }}>Name</span>
              <span className="text-[10px] uppercase tracking-[0.08em]" style={{ color: colors.textDim, fontWeight: 600 }}>Value</span>
              <span className="text-[10px] uppercase tracking-[0.08em]" style={{ color: colors.textDim, fontWeight: 600 }}>Description</span>
              <span className="text-[10px] uppercase tracking-[0.08em] text-right" style={{ color: colors.textDim, fontWeight: 600 }}>Type</span>
            </div>
            {filteredVariables.map((v) => (
              <div key={v.id} className="grid grid-cols-[1fr_1fr_180px_60px] items-center px-[16px] py-[12px] cursor-pointer transition-colors"
                style={{ backgroundColor: colors.tableRowBg, borderBottom: `1px solid ${colors.border}` }}
                onClick={() => setEditingVariable(v)}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = colors.tableRowHoverBg; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = colors.tableRowBg; }}>
                <span className="text-[12px] font-mono truncate" style={{ color: colors.accent, fontWeight: 500 }}>{v.name}</span>
                <span className="text-[12px] font-mono truncate" style={{ color: colors.textSecondary }}>{v.value}</span>
                <span className="text-[11px] truncate" style={{ color: colors.textMuted }}>{v.description}</span>
                <span className="text-[10px] text-right px-[6px] py-[2px] rounded-[4px]" style={{ backgroundColor: "rgba(255,255,255,0.04)", color: colors.textDim }}>{v.type}</span>
              </div>
            ))}
          </div>
        ) : <EmptyState icon={Variable} title="No variables yet" description="Create reusable variables for your workflows." actionLabel="Add Variable" onAction={() => setEditingVariable("new")} />
      )}

      {/* ── SECRETS SUB-TAB ── */}
      {subTab === "secrets" && (
        filteredSecrets.length > 0 ? (
          <div className="rounded-[10px] overflow-hidden" style={{ border: `1px solid ${colors.border}` }}>
            <div className="grid grid-cols-[1fr_180px_100px_80px_40px] px-[16px] py-[10px]" style={{ backgroundColor: colors.tableHeaderBg, borderBottom: `1px solid ${colors.border}` }}>
              <span className="text-[10px] uppercase tracking-[0.08em]" style={{ color: colors.textDim, fontWeight: 600 }}>Name</span>
              <span className="text-[10px] uppercase tracking-[0.08em]" style={{ color: colors.textDim, fontWeight: 600 }}>Description</span>
              <span className="text-[10px] uppercase tracking-[0.08em]" style={{ color: colors.textDim, fontWeight: 600 }}>Rotated</span>
              <span className="text-[10px] uppercase tracking-[0.08em]" style={{ color: colors.textDim, fontWeight: 600 }}>Used by</span>
              <span className="text-[10px] uppercase tracking-[0.08em] text-right" style={{ color: colors.textDim, fontWeight: 600 }}></span>
            </div>
            {filteredSecrets.map((s) => {
              const revealed = revealedSecrets.has(s.id);
              return (
                <div key={s.id} className="grid grid-cols-[1fr_180px_100px_80px_40px] items-center px-[16px] py-[12px] cursor-pointer transition-colors"
                  style={{ backgroundColor: colors.tableRowBg, borderBottom: `1px solid ${colors.border}` }}
                  onClick={() => setEditingSecret(s)}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = colors.tableRowHoverBg; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = colors.tableRowBg; }}>
                  <div className="flex items-center gap-[8px]">
                    <KeyRound size={13} color={colors.medium} strokeWidth={2} />
                    <span className="text-[12px] font-mono truncate" style={{ color: colors.textPrimary, fontWeight: 500 }}>{s.name}</span>
                  </div>
                  <span className="text-[11px] truncate" style={{ color: colors.textMuted }}>{s.description}</span>
                  <span className="text-[11px]" style={{ color: colors.textDim }}>{s.lastRotated}</span>
                  <span className="text-[11px]" style={{ color: colors.textSecondary }}>{s.usedBy} workflows</span>
                  <div className="flex justify-end">
                    <button onClick={(e) => { e.stopPropagation(); setRevealedSecrets((prev) => { const n = new Set(prev); if (n.has(s.id)) n.delete(s.id); else n.add(s.id); return n; }); }}
                      className="size-[24px] rounded-[4px] flex items-center justify-center cursor-pointer transition-colors"
                      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = colors.bgCardHover; }}
                      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}>
                      {revealed ? <EyeOff size={12} color={colors.textDim} strokeWidth={2} /> : <Eye size={12} color={colors.textDim} strokeWidth={2} />}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : <EmptyState icon={KeyRound} title="No secrets yet" description="Store encrypted credentials for use in workflow steps." actionLabel="Add Secret" onAction={() => setEditingSecret("new")} />
      )}

      {/* ── ENVIRONMENTS SUB-TAB ── */}
      {subTab === "environments" && (
        environments.length > 0 ? (
          <div className="grid gap-[14px]">
            {environments.map((env) => (
              <div key={env.id} className="rounded-[10px] p-[16px] transition-colors cursor-pointer"
                style={{ backgroundColor: colors.bgCard, border: `1px solid ${env.isActive ? colors.active : colors.border}`, boxShadow: env.isActive ? `0 0 0 1px ${colors.active}20` : "none" }}
                onClick={() => setEditingEnv(env)}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = colors.bgCardHover; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = colors.bgCard; }}>
                <div className="flex items-center justify-between mb-[10px]">
                  <div className="flex items-center gap-[10px]">
                    <Server size={16} color={env.isActive ? colors.active : colors.textDim} strokeWidth={2} />
                    <span className="text-[13px]" style={{ color: colors.textPrimary, fontWeight: 600 }}>{env.name}</span>
                    {env.isActive && (
                      <span className="text-[9px] px-[6px] py-[2px] rounded-[4px]" style={{ backgroundColor: `${colors.active}12`, color: colors.active, fontWeight: 600, border: `1px solid ${colors.active}30` }}>Active</span>
                    )}
                  </div>
                  <span className="text-[10px]" style={{ color: colors.textDim }}>{Object.keys(env.variables).length} variables</span>
                </div>
                <p className="text-[11px] mb-[12px]" style={{ color: colors.textMuted }}>{env.description}</p>
                <div className="flex flex-wrap gap-[6px]">
                  {Object.entries(env.variables).map(([k, v]) => (
                    <div key={k} className="flex items-center gap-[4px] px-[8px] py-[4px] rounded-[5px]"
                      style={{ backgroundColor: "rgba(255,255,255,0.03)", border: `1px solid ${colors.border}` }}>
                      <span className="text-[10px] font-mono" style={{ color: colors.accent }}>{k}</span>
                      <span className="text-[10px]" style={{ color: colors.textDim }}>=</span>
                      <span className="text-[10px] font-mono" style={{ color: colors.textSecondary }}>{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : <EmptyState icon={Server} title="No environments yet" description="Create environments for different deployment targets." actionLabel="Add Environment" onAction={() => setEditingEnv("new")} />
      )}
    </>
  );
}