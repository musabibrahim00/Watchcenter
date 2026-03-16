/**
 * EntityLink — Cross-entity navigation component
 * =================================================
 *
 * Wraps any entity reference (asset, vulnerability, case, attack-path,
 * workflow, risk) with a hover-triggered quick-actions popover. Clicking
 * an action navigates to the appropriate module.
 *
 * Usage:
 *   <EntityLink entityType="asset" entityId="asset-1" label="finance-db-01" />
 *   <EntityLink entityType="case" entityId="CASE-001" label="CASE-2024-0042">
 *     <span>Custom child</span>
 *   </EntityLink>
 */

import React, { useState, useRef, useCallback, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  Server, Shield, GitBranch, AlertTriangle, FolderOpen, Workflow,
  ExternalLink, Eye, Target, Route, Bug, PlusCircle, Play, Crown,
  Link2, Activity,
} from "lucide-react";
import { colors } from "../design-system/tokens";

/* ================================================================
   TYPES
   ================================================================ */

export type EntityType =
  | "asset"
  | "vulnerability"
  | "attack-path"
  | "risk"
  | "case"
  | "workflow";

export interface EntityAction {
  id: string;
  label: string;
  icon: React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }>;
  /** Returns the path to navigate to. Receives the entity id. */
  getPath: (entityId: string) => string;
  /** Optional navigation state. */
  getState?: (entityId: string) => Record<string, unknown>;
}

export interface EntityLinkProps {
  entityType: EntityType;
  entityId: string;
  label?: string;
  /** Optional severity for color-coding the link text */
  severity?: "critical" | "high" | "medium" | "low";
  /** Custom children — if not provided, renders label as text */
  children?: React.ReactNode;
  /** Disable hover popover (still renders as styled text) */
  disabled?: boolean;
  /** Additional class names on the wrapper */
  className?: string;
  /** Inline style overrides */
  style?: React.CSSProperties;
}

/* ================================================================
   ENTITY ICON / COLOR CONFIG
   ================================================================ */

const ENTITY_ICONS: Record<EntityType, React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }>> = {
  asset: Server,
  vulnerability: Shield,
  "attack-path": GitBranch,
  risk: AlertTriangle,
  case: FolderOpen,
  workflow: Workflow,
};

const ENTITY_COLORS: Record<EntityType, string> = {
  asset: colors.accent,
  vulnerability: colors.critical,
  "attack-path": colors.warning,
  risk: colors.critical,
  case: colors.active,
  workflow: colors.accent,
};

const ENTITY_LABELS: Record<EntityType, string> = {
  asset: "Asset",
  vulnerability: "Vulnerability",
  "attack-path": "Attack Path",
  risk: "Risk",
  case: "Case",
  workflow: "Workflow",
};

/* ================================================================
   ACTION DEFINITIONS PER ENTITY TYPE
   ================================================================ */

const ENTITY_ACTIONS: Record<EntityType, EntityAction[]> = {
  asset: [
    {
      id: "open-asset",
      label: "Open Asset",
      icon: ExternalLink,
      getPath: (id) => `/assets/${id}`,
    },
    {
      id: "show-attack-paths",
      label: "Show Attack Paths",
      icon: Route,
      getPath: () => `/attack-path`,
      getState: (id) => ({ filterAssetId: id }),
    },
    {
      id: "show-vulnerabilities",
      label: "Show Vulnerabilities",
      icon: Bug,
      getPath: () => `/vulnerabilities`,
      getState: (id) => ({ filterAssetId: id }),
    },
    {
      id: "create-case",
      label: "Create Case",
      icon: PlusCircle,
      getPath: () => `/case-management`,
      getState: (id) => ({ activeTab: "cases", createFromAsset: id }),
    },
    {
      id: "run-workflow",
      label: "Run Workflow",
      icon: Play,
      getPath: () => `/workflows`,
      getState: (id) => ({ triggerForAsset: id }),
    },
  ],
  vulnerability: [
    {
      id: "show-affected-assets",
      label: "Show Affected Assets",
      icon: Server,
      getPath: () => `/assets`,
      getState: (id) => ({ filterVulnId: id }),
    },
    {
      id: "show-attack-paths",
      label: "Show Attack Paths",
      icon: Route,
      getPath: () => `/attack-path`,
      getState: (id) => ({ filterVulnId: id }),
    },
    {
      id: "create-remediation-case",
      label: "Create Remediation Case",
      icon: PlusCircle,
      getPath: () => `/case-management`,
      getState: (id) => ({ activeTab: "cases", createFromVuln: id }),
    },
  ],
  "attack-path": [
    {
      id: "open-attack-path",
      label: "Open Attack Path",
      icon: ExternalLink,
      getPath: (id) => `/attack-path/${id}`,
    },
    {
      id: "show-entry-asset",
      label: "Show Entry Asset",
      icon: Target,
      getPath: () => `/assets`,
      getState: (id) => ({ fromAttackPath: id, showEntry: true }),
    },
    {
      id: "show-crown-jewels",
      label: "Show Crown Jewel Targets",
      icon: Crown,
      getPath: (id) => `/attack-path/${id}`,
      getState: () => ({ scrollTo: "crown-jewels" }),
    },
    {
      id: "trigger-containment",
      label: "Trigger Containment Workflow",
      icon: Play,
      getPath: () => `/workflows/new`,
      getState: (id) => ({ triggerForPath: id, template: "containment" }),
    },
  ],
  risk: [
    {
      id: "show-related-assets",
      label: "Show Related Assets",
      icon: Server,
      getPath: () => `/assets`,
      getState: (id) => ({ filterRiskId: id }),
    },
    {
      id: "show-attack-paths",
      label: "Open Attack Paths",
      icon: Route,
      getPath: () => `/attack-path`,
      getState: (id) => ({ filterRiskId: id }),
    },
    {
      id: "create-case",
      label: "Create Case",
      icon: PlusCircle,
      getPath: () => `/case-management`,
      getState: (id) => ({ activeTab: "cases", createFromRisk: id }),
    },
  ],
  case: [
    {
      id: "open-case",
      label: "Open Case",
      icon: ExternalLink,
      getPath: (id) => `/case-management/${id}`,
    },
    {
      id: "show-related-assets",
      label: "Show Related Assets",
      icon: Server,
      getPath: () => `/assets`,
      getState: (id) => ({ filterCaseId: id }),
    },
    {
      id: "show-attack-paths",
      label: "Show Attack Paths",
      icon: Route,
      getPath: () => `/attack-path`,
      getState: (id) => ({ filterCaseId: id }),
    },
    {
      id: "open-workflow-runs",
      label: "Open Workflow Runs",
      icon: Activity,
      getPath: () => `/workflows`,
      getState: (id) => ({ filterCaseId: id }),
    },
  ],
  workflow: [
    {
      id: "open-workflow",
      label: "Open Workflow",
      icon: ExternalLink,
      getPath: (id) => `/workflows/new/${id}`,
    },
    {
      id: "view-runs",
      label: "View Runs",
      icon: Activity,
      getPath: () => `/workflows`,
      getState: (id) => ({ filterWorkflowId: id }),
    },
    {
      id: "view-analytics",
      label: "View Analytics",
      icon: Eye,
      getPath: () => `/workflows`,
      getState: (id) => ({ highlightWorkflow: id }),
    },
  ],
};

/* ================================================================
   POPOVER POSITIONING
   ================================================================ */

type PopoverSide = "bottom" | "top" | "right" | "left";

function computePopoverPosition(
  anchor: DOMRect,
  popoverW: number,
  popoverH: number,
): { top: number; left: number; side: PopoverSide } {
  const gap = 6;
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  // Prefer bottom
  if (anchor.bottom + gap + popoverH < vh) {
    return {
      top: anchor.bottom + gap,
      left: Math.max(8, Math.min(anchor.left + anchor.width / 2 - popoverW / 2, vw - popoverW - 8)),
      side: "bottom",
    };
  }
  // Try top
  if (anchor.top - gap - popoverH > 0) {
    return {
      top: anchor.top - gap - popoverH,
      left: Math.max(8, Math.min(anchor.left + anchor.width / 2 - popoverW / 2, vw - popoverW - 8)),
      side: "top",
    };
  }
  // Try right
  if (anchor.right + gap + popoverW < vw) {
    return {
      top: Math.max(8, Math.min(anchor.top + anchor.height / 2 - popoverH / 2, vh - popoverH - 8)),
      left: anchor.right + gap,
      side: "right",
    };
  }
  // Fallback left
  return {
    top: Math.max(8, Math.min(anchor.top + anchor.height / 2 - popoverH / 2, vh - popoverH - 8)),
    left: Math.max(8, anchor.left - gap - popoverW),
    side: "left",
  };
}

/* ================================================================
   ENTITY LINK COMPONENT
   ================================================================ */

export function EntityLink({
  entityType,
  entityId,
  label,
  severity,
  children,
  disabled = false,
  className = "",
  style,
}: EntityLinkProps) {
  const navigate = useNavigate();
  const anchorRef = useRef<HTMLSpanElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const hoverTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closeTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const entityColor = severity
    ? severity === "critical"
      ? colors.critical
      : severity === "high"
        ? colors.warning
        : severity === "medium"
          ? colors.accent
          : colors.active
    : ENTITY_COLORS[entityType];

  const actions = ENTITY_ACTIONS[entityType] ?? [];
  const Icon = ENTITY_ICONS[entityType];

  const showPopover = useCallback(() => {
    if (disabled || !anchorRef.current) return;
    if (closeTimeout.current) clearTimeout(closeTimeout.current);
    const rect = anchorRef.current.getBoundingClientRect();
    const pw = 240;
    const ph = 40 + actions.length * 36 + 12; // header + rows + padding
    const result = computePopoverPosition(rect, pw, ph);
    setPos({ top: result.top, left: result.left });
    setOpen(true);
  }, [disabled, actions.length]);

  const scheduleShow = useCallback(() => {
    if (hoverTimeout.current) clearTimeout(hoverTimeout.current);
    hoverTimeout.current = setTimeout(showPopover, 220);
  }, [showPopover]);

  const scheduleHide = useCallback(() => {
    if (hoverTimeout.current) clearTimeout(hoverTimeout.current);
    closeTimeout.current = setTimeout(() => setOpen(false), 250);
  }, []);

  const cancelHide = useCallback(() => {
    if (closeTimeout.current) clearTimeout(closeTimeout.current);
  }, []);

  // Cleanup
  useEffect(() => {
    return () => {
      if (hoverTimeout.current) clearTimeout(hoverTimeout.current);
      if (closeTimeout.current) clearTimeout(closeTimeout.current);
    };
  }, []);

  const handleAction = useCallback(
    (action: EntityAction) => {
      setOpen(false);
      const path = action.getPath(entityId);
      const state = action.getState?.(entityId);
      navigate(path, state ? { state } : undefined);
    },
    [entityId, navigate],
  );

  return (
    <>
      {/* Anchor */}
      <span
        ref={anchorRef}
        onMouseEnter={scheduleShow}
        onMouseLeave={scheduleHide}
        className={`inline-flex items-center gap-[4px] cursor-pointer transition-opacity hover:opacity-80 ${className}`}
        style={{
          color: entityColor,
          textDecoration: "none",
          borderBottom: `1px dashed ${entityColor}40`,
          paddingBottom: 1,
          ...style,
        }}
      >
        {children ?? label ?? entityId}
      </span>

      {/* Popover */}
      {open && pos && (
        <div
          ref={popoverRef}
          onMouseEnter={cancelHide}
          onMouseLeave={scheduleHide}
          className="fixed z-[200]"
          style={{
            top: pos.top,
            left: pos.left,
            width: 240,
            backgroundColor: colors.bgCard,
            border: `1px solid ${colors.border}`,
            borderRadius: 10,
            boxShadow: "0 8px 24px rgba(0,0,0,0.4), 0 2px 8px rgba(0,0,0,0.2)",
            overflow: "hidden",
            animation: "entityLinkFadeIn 0.15s ease-out",
          }}
        >
          {/* Header */}
          <div
            className="flex items-center gap-[8px] px-[12px] py-[8px]"
            style={{ borderBottom: `1px solid ${colors.divider}` }}
          >
            <div
              className="size-[22px] rounded-[5px] flex items-center justify-center shrink-0"
              style={{ backgroundColor: `${entityColor}15` }}
            >
              <Icon size={12} color={entityColor} strokeWidth={2} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[9px] uppercase tracking-[0.08em]" style={{ color: colors.textDim }}>
                {ENTITY_LABELS[entityType]}
              </div>
              <div
                className="text-[11px] truncate"
                style={{ color: colors.textPrimary, fontWeight: 600, maxWidth: 180 }}
              >
                {label ?? entityId}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="py-[4px]">
            {actions.map((action) => (
              <button
                key={action.id}
                onClick={() => handleAction(action)}
                className="w-full flex items-center gap-[10px] px-[12px] py-[7px] text-left transition-colors cursor-pointer"
                style={{ backgroundColor: "transparent" }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = colors.bgCardHover;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                }}
              >
                <action.icon size={13} color={colors.textDim} strokeWidth={2} />
                <span className="text-[11px]" style={{ color: colors.textSecondary }}>
                  {action.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Inline keyframes for fade-in */}
      {open && (
        <style>{`
          @keyframes entityLinkFadeIn {
            from { opacity: 0; transform: translateY(4px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}</style>
      )}
    </>
  );
}

/* ================================================================
   HELPERS — for external consumers
   ================================================================ */

/** Get the themed color for an entity type */
export function getEntityColor(type: EntityType, sev?: string): string {
  if (sev === "critical") return colors.critical;
  if (sev === "high") return colors.warning;
  if (sev === "medium") return colors.accent;
  if (sev === "low") return colors.active;
  return ENTITY_COLORS[type];
}

/** Get the icon component for an entity type */
export function getEntityIcon(type: EntityType) {
  return ENTITY_ICONS[type];
}

/** Get the human label for an entity type */
export function getEntityLabel(type: EntityType) {
  return ENTITY_LABELS[type];
}

/** Get action definitions for an entity type */
export function getEntityActions(type: EntityType): EntityAction[] {
  return ENTITY_ACTIONS[type] ?? [];
}