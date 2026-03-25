import React, { useState } from "react";
import {
  MoreVertical, Play, Copy, Edit3, Power, Trash2,
  CheckCircle2, ArrowRight, Star, Download, Plug,
  Code2, Layers, FileText, Database, X, Loader2,
} from "lucide-react";
import { colors } from "../../shared/design-system/tokens";
import {
  INTEGRATIONS,
  type HubItem, type HubItemKind, type HubSource,
} from "../../shared/data/hubData";
import { getStepTemplatesForWorkflow } from "./mockStepExecutions";
import type { WorkflowCard, WorkflowStatus } from "./types";

export const KIND_META: Record<HubItemKind, { icon: typeof Code2; label: string; color: string }> = {
  script:        { icon: Code2,    label: "Action",     color: colors.buttonPrimary },
  flow:          { icon: Layers,   label: "Flow",       color: colors.active },
  template:      { icon: FileText, label: "Template",   color: colors.accent },
  resource_type: { icon: Database, label: "Resource",   color: "#A855F7" },
};

export const SOURCE_META: Record<HubSource, { label: string; color: string }> = {
  official:  { label: "Official",  color: colors.accent },
  community: { label: "Community", color: colors.active },
  workspace: { label: "Workspace", color: colors.medium },
};

/* ================================================================
   SHARED HELPER COMPONENTS
   ================================================================ */

export function StatusBadge({ status }: { status: WorkflowStatus }) {
  const map: Record<WorkflowStatus, { bg: string; text: string; border: string; label: string }> = {
    running: { bg: `${colors.active}12`, text: colors.active, border: `${colors.active}30`, label: "Running" },
    completed: { bg: `${colors.textMuted}12`, text: colors.textMuted, border: `${colors.textMuted}30`, label: "Completed" },
    approval_required: { bg: `${colors.medium}12`, text: colors.medium, border: `${colors.medium}30`, label: "Approval Required" },
    disabled: { bg: `${colors.textDim}12`, text: colors.textDim, border: `${colors.textDim}30`, label: "Disabled" },
  };
  const s = map[status];
  return (
    <div className="inline-flex items-center px-[8px] py-[3px] rounded-[5px] text-[10px]" style={{ backgroundColor: s.bg, color: s.text, border: `1px solid ${s.border}`, fontWeight: 500 }}>
      {s.label}
    </div>
  );
}

export function Tag({ label }: { label: string }) {
  return (
    <div className="inline-flex items-center px-[8px] py-[3px] rounded-[5px] text-[10px]" style={{ backgroundColor: "rgba(255,255,255,0.04)", color: colors.textMuted, border: `1px solid ${colors.border}`, fontWeight: 500 }}>
      {label}
    </div>
  );
}

export function IntegrationDot({ color, size = 10 }: { color: string; size?: number }) {
  return <div className="rounded-full shrink-0" style={{ width: size, height: size, backgroundColor: color }} />;
}

/* ================================================================
   WORKFLOW CARD COMPONENT (Section 10)
   ================================================================ */

export function WorkflowCardComp({ workflow, onClick, onEdit, readOnly }: {
  workflow: WorkflowCard;
  onClick: () => void;
  onEdit?: () => void;
  readOnly?: boolean;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="rounded-[10px] p-[16px] transition-all cursor-pointer relative"
      style={{ backgroundColor: hovered ? colors.bgCardHover : colors.bgCard, border: `1px solid ${colors.border}` }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-[10px]">
        <div className="flex items-center gap-[8px] flex-1 pr-[8px]">
          <h3 className="text-[13px]" style={{ color: colors.textPrimary, fontWeight: 600 }}>{workflow.title}</h3>
          {readOnly && (
            <span className="text-[8px] uppercase tracking-[0.06em] px-[5px] py-[1px] rounded-[3px] shrink-0" style={{ backgroundColor: `${colors.medium}12`, color: colors.medium, fontWeight: 600 }}>Snapshot</span>
          )}
        </div>
        <div className="relative">
          <button onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen); }} className="size-[24px] rounded-[6px] flex items-center justify-center transition-colors" style={{ backgroundColor: menuOpen ? colors.bgCardHover : "transparent" }} onMouseEnter={(e) => { if (!menuOpen) e.currentTarget.style.backgroundColor = colors.bgCardHover; }} onMouseLeave={(e) => { if (!menuOpen) e.currentTarget.style.backgroundColor = "transparent"; }}>
            <MoreVertical size={14} color={colors.textMuted} strokeWidth={2} />
          </button>
          {menuOpen && (
            <>
              <div className="fixed inset-0 z-[40]" onClick={(e) => { e.stopPropagation(); setMenuOpen(false); }} />
              <div className="absolute top-[28px] right-0 z-[50] rounded-[8px] py-[4px] min-w-[140px]" style={{ backgroundColor: colors.bgCard, border: `1px solid ${colors.border}`, boxShadow: "0 8px 24px rgba(0,0,0,0.4)" }}>
                {(readOnly
                  ? [{ icon: Play, label: "View Workflow", color: colors.textSecondary, action: onClick }]
                  : [
                      { icon: Play, label: "Open Workflow", color: colors.textSecondary, action: onClick },
                      { icon: Edit3, label: "Edit", color: colors.textSecondary, action: onEdit },
                      { icon: Copy, label: "Duplicate", color: colors.textSecondary, action: undefined },
                      { icon: Power, label: workflow.status === "disabled" ? "Enable" : "Disable", color: colors.textSecondary, action: undefined },
                      { icon: Trash2, label: "Delete", color: colors.critical, action: undefined },
                    ]
                ).map((item) => {
                  const Icon = item.icon;
                  return (
                    <button key={item.label} onClick={(e) => { e.stopPropagation(); setMenuOpen(false); item.action?.(); }} className="w-full flex items-center gap-[10px] px-[12px] py-[7px] text-left transition-colors" style={{ color: item.color }} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = colors.bgCardHover; }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}>
                      <Icon size={13} strokeWidth={2} />
                      <span className="text-[12px]" style={{ fontWeight: 500 }}>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
      <p className="text-[11px] leading-[1.5] mb-[12px] line-clamp-2" style={{ color: colors.textMuted }}>{workflow.description}</p>
      <div className="flex flex-wrap gap-[6px] mb-[12px]">{workflow.tags.map((tag) => <Tag key={tag} label={tag} />)}</div>
      <div className="flex items-center justify-between pt-[10px]" style={{ borderTop: `1px solid ${colors.divider}` }}>
        <StatusBadge status={workflow.status} />
        {workflow.runCount !== undefined && (
          <div className="flex items-center gap-[12px]">
            <span className="text-[10px]" style={{ color: colors.textDim }}>{workflow.runCount} runs</span>
            {workflow.lastRun && <span className="text-[10px]" style={{ color: colors.textDim }}>{workflow.lastRun}</span>}
          </div>
        )}
      </div>
    </div>
  );
}

/* ================================================================
   LIBRARY ITEM CARD COMPONENT
   ================================================================ */

export const LibraryItemCard = React.memo(function LibraryItemCard({
  item, onSelect,
}: { item: HubItem; onSelect: (item: HubItem) => void }) {
  const [hovered, setHovered] = useState(false);
  const km = KIND_META[item.kind];
  const Icon = km.icon;
  const integration = item.integration ? INTEGRATIONS.find(i => i.slug === item.integration) : undefined;

  return (
    <div
      className="rounded-[10px] p-[16px] transition-all cursor-pointer relative"
      style={{ backgroundColor: hovered ? colors.bgCardHover : colors.bgCard, border: `1px solid ${hovered ? colors.borderHover : colors.border}` }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onSelect(item)}
    >
      <div className="flex items-start gap-[12px] mb-[10px]">
        <div className="size-[34px] rounded-[8px] flex items-center justify-center shrink-0" style={{ backgroundColor: `${km.color}12` }}>
          <Icon size={16} color={km.color} strokeWidth={2} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-[6px] mb-[3px] flex-wrap">
            <h3 className="text-[13px] truncate" style={{ color: colors.textPrimary, fontWeight: 600 }}>{item.title}</h3>
            {item.verified && (
              <span className="inline-flex items-center gap-[3px] text-[9px]" style={{ color: colors.active, fontWeight: 600 }}>
                <CheckCircle2 size={9} strokeWidth={2.5} />Verified
              </span>
            )}
          </div>
          <div className="flex items-center gap-[6px]">
            <span className="inline-flex items-center gap-[4px] px-[6px] py-[2px] rounded-[4px] text-[9px] shrink-0"
              style={{ backgroundColor: `${SOURCE_META[item.source].color}12`, color: SOURCE_META[item.source].color, fontWeight: 600 }}>
              {SOURCE_META[item.source].label}
            </span>
            <span className="inline-flex items-center gap-[4px] px-[6px] py-[2px] rounded-[4px] text-[9px] shrink-0"
              style={{ backgroundColor: `${km.color}12`, color: km.color, fontWeight: 600 }}>
              {km.label}
            </span>
            {integration && (
              <span className="inline-flex items-center gap-[4px] text-[9px]" style={{ color: colors.textDim }}>
                <IntegrationDot color={integration.color} size={7} />
                {integration.name}
              </span>
            )}
          </div>
        </div>
      </div>
      <p className="text-[11px] leading-[1.5] mb-[12px] line-clamp-2" style={{ color: colors.textMuted }}>{item.description}</p>
      <div className="flex flex-wrap gap-[5px] mb-[12px]">
        {item.tags.map(tag => (
          <span key={tag} className="inline-flex items-center px-[7px] py-[2px] rounded-[5px] text-[9px]"
            style={{ backgroundColor: "rgba(255,255,255,0.04)", color: colors.textDim, border: `1px solid ${colors.border}`, fontWeight: 500 }}>
            {tag}
          </span>
        ))}
      </div>
      <div className="flex items-center justify-between pt-[10px]" style={{ borderTop: `1px solid ${colors.divider}` }}>
        <div className="flex items-center gap-[12px]">
          <span className="inline-flex items-center gap-[3px] text-[10px]" style={{ color: colors.textDim }}>
            <Download size={10} strokeWidth={2} />{item.downloads.toLocaleString()}
          </span>
          {item.kind !== "resource_type" && (
            <span className="inline-flex items-center gap-[3px] text-[10px]" style={{ color: colors.textDim }}>
              <Star size={10} strokeWidth={2} />{item.stars}
            </span>
          )}
          <span className="text-[10px]" style={{ color: colors.textDim }}>v{item.version}</span>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onSelect(item); }}
          className="flex items-center gap-[4px] rounded-[6px] px-[10px] py-[5px] text-[10px] transition-colors cursor-pointer"
          style={{ backgroundColor: "transparent", border: `1px solid ${colors.border}`, color: colors.textSecondary, fontWeight: 500 }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = colors.bgCardHover; e.currentTarget.style.borderColor = colors.accent; e.currentTarget.style.color = colors.accent; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.borderColor = colors.border; e.currentTarget.style.color = colors.textSecondary; }}
        >
          <ArrowRight size={10} strokeWidth={2} />Use
        </button>
      </div>
    </div>
  );
});

/* ================================================================
   INTEGRATION CARD (for Library integrations view)
   ================================================================ */

export const IntegrationCard = React.memo(function IntegrationCard({
  integration, isSelected, onClick,
}: { integration: typeof INTEGRATIONS[0]; isSelected: boolean; onClick: () => void }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-[12px] rounded-[10px] p-[14px] text-left transition-all cursor-pointer"
      style={{
        backgroundColor: isSelected ? `${integration.color}08` : hovered ? colors.bgCardHover : colors.bgCard,
        border: `1px solid ${isSelected ? `${integration.color}40` : colors.border}`,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="size-[36px] rounded-[8px] flex items-center justify-center shrink-0" style={{ backgroundColor: `${integration.color}15` }}>
        <IntegrationDot color={integration.color} size={14} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[12px] mb-[2px] truncate" style={{ color: colors.textPrimary, fontWeight: 600 }}>{integration.name}</div>
        <div className="text-[10px] truncate" style={{ color: colors.textMuted }}>{integration.description}</div>
      </div>
      <div className="text-[10px] shrink-0" style={{ color: colors.textDim }}>{integration.itemCount}</div>
    </button>
  );
});

export function RunConfirmationModal({
  workflow,
  onConfirm,
  onCancel,
  isExecuting,
}: {
  workflow: WorkflowCard;
  onConfirm: () => void;
  onCancel: () => void;
  isExecuting?: boolean;
}) {
  const stepTemplates = getStepTemplatesForWorkflow(workflow.id);

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[100]"
        style={{ backgroundColor: "rgba(0, 0, 0, 0.6)" }}
        onClick={isExecuting ? undefined : onCancel}
      />

      {/* Modal */}
      <div
        className="fixed left-1/2 top-1/2 z-[101] w-[520px] rounded-[12px] p-[24px]"
        style={{
          backgroundColor: colors.bgCard,
          border: `1px solid ${colors.border}`,
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.5)",
          transform: "translate(-50%, -50%)",
        }}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-[20px]">
          <div>
            <h3 className="text-[16px] mb-[4px]" style={{ color: colors.textPrimary, fontWeight: 600 }}>
              Run Workflow
            </h3>
            <p className="text-[12px]" style={{ color: colors.textMuted }}>
              Manual execution of <span style={{ color: colors.textSecondary, fontWeight: 500 }}>{workflow.title}</span>
            </p>
          </div>
          {!isExecuting && (
            <button
              onClick={onCancel}
              className="size-[28px] rounded-[6px] flex items-center justify-center transition-colors cursor-pointer shrink-0"
              style={{ color: colors.textDim }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = colors.bgCardHover; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
            >
              <X size={16} strokeWidth={2} />
            </button>
          )}
        </div>

        {/* Execution Steps */}
        <div className="mb-[20px]">
          <div className="text-[11px] uppercase tracking-[0.06em] mb-[10px]" style={{ color: colors.textDim, fontWeight: 600 }}>
            Execution Steps ({stepTemplates.length})
          </div>
          <div
            className="rounded-[8px] overflow-hidden"
            style={{
              border: `1px solid ${colors.border}`,
              background: colors.bgApp,
            }}
          >
            {stepTemplates.map((step, idx) => (
              <div
                key={idx}
                className="flex items-center gap-[12px] px-[14px] py-[10px]"
                style={{
                  borderBottom: idx < stepTemplates.length - 1 ? `1px solid ${colors.border}` : undefined,
                }}
              >
                {/* Step number */}
                <div
                  className="size-[22px] rounded-full flex items-center justify-center shrink-0 text-[11px]"
                  style={{
                    background: `${colors.accent}15`,
                    color: colors.accent,
                    fontWeight: 600,
                  }}
                >
                  {idx + 1}
                </div>

                {/* Step name */}
                <span className="flex-1 text-[13px]" style={{ color: colors.textSecondary, fontWeight: 500 }}>
                  {step.stepName}
                </span>

                {/* Integration pill */}
                <span
                  className="inline-flex items-center gap-[4px] px-[8px] py-[2px] rounded-[10px] text-[10px] shrink-0"
                  style={{
                    background: "rgba(7, 100, 152, 0.12)",
                    color: colors.low,
                    border: `1px solid rgba(7, 100, 152, 0.2)`,
                    fontWeight: 500,
                  }}
                >
                  <Plug size={9} />
                  {step.integrationUsed}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Trigger info */}
        <div
          className="rounded-[8px] px-[14px] py-[10px] mb-[20px] flex items-center gap-[10px]"
          style={{
            background: `${colors.accent}08`,
            border: `1px solid ${colors.accent}20`,
          }}
        >
          <UserIcon size={14} color={colors.accent} />
          <span className="text-[12px]" style={{ color: colors.textMuted }}>
            Trigger: <span style={{ color: colors.textSecondary, fontWeight: 500 }}>Manual</span> — executed by current user
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-[10px]">
          <button
            onClick={onCancel}
            disabled={isExecuting}
            className="rounded-[8px] px-[18px] py-[9px] text-[13px] transition-colors cursor-pointer"
            style={{
              backgroundColor: "transparent",
              border: `1px solid ${colors.border}`,
              color: colors.textSecondary,
              fontWeight: 500,
              opacity: isExecuting ? 0.5 : 1,
              cursor: isExecuting ? "not-allowed" : "pointer",
            }}
            onMouseEnter={(e) => {
              if (!isExecuting) e.currentTarget.style.backgroundColor = colors.bgCardHover;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
            }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isExecuting}
            className="flex items-center gap-[8px] rounded-[8px] px-[18px] py-[9px] text-[13px] transition-colors cursor-pointer"
            style={{
              backgroundColor: isExecuting ? colors.buttonPrimaryActive : colors.buttonPrimary,
              color: "#fff",
              fontWeight: 600,
              cursor: isExecuting ? "not-allowed" : "pointer",
            }}
            onMouseEnter={(e) => {
              if (!isExecuting) e.currentTarget.style.backgroundColor = colors.buttonPrimaryHover;
            }}
            onMouseLeave={(e) => {
              if (!isExecuting) e.currentTarget.style.backgroundColor = colors.buttonPrimary;
            }}
          >
            {isExecuting ? (
              <>
                <Loader2 size={14} strokeWidth={2} className="animate-spin" />
                Starting...
              </>
            ) : (
              <>
                <Play size={14} strokeWidth={2} />
                Run Now
              </>
            )}
          </button>
        </div>
      </div>
    </>
  );
}

/* ================================================================
   MAIN COMPONENT — default export wraps with PlaybookEngineProvider
   ================================================================ */

