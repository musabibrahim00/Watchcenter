/**
 * Agent Activity Indicator Component
 * ====================================
 * 
 * Displays automated action indicators on Security Graph nodes
 * and other surfaces where agents have taken action.
 */

import React, { useState } from "react";
import {
  Workflow, FolderOpen, Users, Target, Activity, Shield,
  CheckCircle2, Clock, Sparkles,
} from "lucide-react";
import { colors } from "../shared/design-system/tokens";

/* ================================================================
   TYPES
   ================================================================ */

type ActionType = "workflow-triggered" | "case-created" | "approval-requested" | "risk-updated" | "asset-isolated" | "notification-sent";

interface AgentAction {
  id: string;
  type: ActionType;
  agent: string;
  timestamp: string;
  status: "completed" | "pending" | "in-progress";
}

/* ================================================================
   UTILITY FUNCTIONS
   ================================================================ */

function getActionIcon(type: ActionType) {
  switch (type) {
    case "workflow-triggered":
      return Workflow;
    case "case-created":
      return FolderOpen;
    case "approval-requested":
      return Users;
    case "risk-updated":
      return Target;
    case "asset-isolated":
      return Shield;
    case "notification-sent":
      return Activity;
    default:
      return Activity;
  }
}

function getActionLabel(type: ActionType): string {
  switch (type) {
    case "workflow-triggered":
      return "Workflow Triggered";
    case "case-created":
      return "Case Created";
    case "approval-requested":
      return "Approval Requested";
    case "risk-updated":
      return "Risk Score Updated";
    case "asset-isolated":
      return "Asset Isolated";
    case "notification-sent":
      return "Team Notified";
    default:
      return "Action Taken";
  }
}

function getStatusIcon(status: string) {
  switch (status) {
    case "completed":
      return CheckCircle2;
    case "pending":
      return Clock;
    case "in-progress":
      return Activity;
    default:
      return Activity;
  }
}

function getStatusColor(status: string) {
  switch (status) {
    case "completed":
      return colors.active;
    case "pending":
      return colors.warning;
    case "in-progress":
      return colors.accent;
    default:
      return colors.textMuted;
  }
}

/* ================================================================
   MAIN COMPONENT (for graph nodes - SVG)
   ================================================================ */

export function AgentActivityIndicatorSVG({
  actions,
  x,
  y,
}: {
  actions: AgentAction[];
  x: number;
  y: number;
}) {
  if (actions.length === 0) return null;

  return (
    <g transform={`translate(${x}, ${y})`}>
      {/* Background circle */}
      <circle
        cx={0}
        cy={0}
        r={12}
        fill={colors.bgCard}
        stroke={colors.accent}
        strokeWidth={2}
      />

      {/* Icon */}
      <g transform="translate(-6, -6)">
        <foreignObject width={12} height={12}>
          <Sparkles size={12} color={colors.accent} strokeWidth={2} />
        </foreignObject>
      </g>

      {/* Badge count */}
      {actions.length > 1 && (
        <>
          <circle
            cx={8}
            cy={-8}
            r={8}
            fill={colors.accent}
          />
          <text
            x={8}
            y={-8}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={9}
            fontWeight={600}
            fill="#fff"
          >
            {actions.length}
          </text>
        </>
      )}
    </g>
  );
}

/* ================================================================
   TOOLTIP COMPONENT (for hover details)
   ================================================================ */

export function AgentActivityTooltip({
  actions,
  position,
}: {
  actions: AgentAction[];
  position: { x: number; y: number };
}) {
  if (actions.length === 0) return null;

  return (
    <div
      className="absolute z-50 rounded-[8px] p-[12px] pointer-events-none"
      style={{
        left: position.x,
        top: position.y,
        backgroundColor: colors.bgCard,
        border: `1px solid ${colors.border}`,
        boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
        minWidth: 220,
      }}
    >
      <div className="text-[10px] uppercase tracking-[0.08em] mb-[8px]" style={{ color: colors.textDim, fontWeight: 600 }}>
        Agent Actions
      </div>
      <div className="flex flex-col gap-[8px]">
        {actions.slice(0, 3).map((action) => {
          const Icon = getActionIcon(action.type);
          const StatusIcon = getStatusIcon(action.status);
          const statusColor = getStatusColor(action.status);

          return (
            <div key={action.id} className="flex items-start gap-[8px]">
              <div
                className="size-[20px] rounded-[4px] flex items-center justify-center shrink-0"
                style={{ backgroundColor: `${colors.accent}15` }}
              >
                <Icon size={10} color={colors.accent} strokeWidth={2} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[11px] mb-[2px]" style={{ color: colors.textPrimary, fontWeight: 600 }}>
                  {getActionLabel(action.type)}
                </div>
                <div className="flex items-center gap-[4px]">
                  <StatusIcon size={10} color={statusColor} strokeWidth={2} />
                  <span className="text-[10px]" style={{ color: colors.textMuted }}>
                    {action.agent} • {action.timestamp}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
        {actions.length > 3 && (
          <div className="text-[10px] text-center pt-[4px]" style={{ color: colors.textMuted, borderTop: `1px solid ${colors.divider}` }}>
            +{actions.length - 3} more actions
          </div>
        )}
      </div>
    </div>
  );
}

/* ================================================================
   STANDARD COMPONENT (for regular UI - not SVG)
   ================================================================ */

export function AgentActivityIndicator({
  actions,
  onClick,
}: {
  actions: AgentAction[];
  onClick?: () => void;
}) {
  const [showTooltip, setShowTooltip] = useState(false);

  if (actions.length === 0) return null;

  return (
    <div className="relative inline-flex">
      <button
        className="relative flex items-center justify-center cursor-pointer transition-all"
        style={{
          width: 28,
          height: 28,
          borderRadius: 6,
          backgroundColor: `${colors.accent}15`,
          border: `1px solid ${colors.accent}30`,
        }}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onClick={onClick}
        onMouseEnter={(e) => {
          setShowTooltip(true);
          e.currentTarget.style.backgroundColor = `${colors.accent}25`;
        }}
        onMouseLeave={(e) => {
          setShowTooltip(false);
          e.currentTarget.style.backgroundColor = `${colors.accent}15`;
        }}
      >
        <Sparkles size={14} color={colors.accent} strokeWidth={2} />
        {actions.length > 1 && (
          <div
            className="absolute -top-1 -right-1 rounded-full flex items-center justify-center"
            style={{
              width: 16,
              height: 16,
              backgroundColor: colors.accent,
              fontSize: 9,
              fontWeight: 600,
              color: "#fff",
            }}
          >
            {actions.length}
          </div>
        )}
      </button>

      {/* Tooltip */}
      {showTooltip && (
        <div
          className="absolute top-full left-1/2 -translate-x-1/2 mt-[8px] z-50 rounded-[8px] p-[12px] pointer-events-none"
          style={{
            backgroundColor: colors.bgCard,
            border: `1px solid ${colors.border}`,
            boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
            minWidth: 220,
          }}
        >
          <div className="text-[10px] uppercase tracking-[0.08em] mb-[8px]" style={{ color: colors.textDim, fontWeight: 600 }}>
            Agent Actions
          </div>
          <div className="flex flex-col gap-[8px]">
            {actions.slice(0, 3).map((action) => {
              const Icon = getActionIcon(action.type);
              const StatusIcon = getStatusIcon(action.status);
              const statusColor = getStatusColor(action.status);

              return (
                <div key={action.id} className="flex items-start gap-[8px]">
                  <div
                    className="size-[20px] rounded-[4px] flex items-center justify-center shrink-0"
                    style={{ backgroundColor: `${colors.accent}15` }}
                  >
                    <Icon size={10} color={colors.accent} strokeWidth={2} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[11px] mb-[2px]" style={{ color: colors.textPrimary, fontWeight: 600 }}>
                      {getActionLabel(action.type)}
                    </div>
                    <div className="flex items-center gap-[4px]">
                      <StatusIcon size={10} color={statusColor} strokeWidth={2} />
                      <span className="text-[10px]" style={{ color: colors.textMuted }}>
                        {action.agent} • {action.timestamp}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
            {actions.length > 3 && (
              <div className="text-[10px] text-center pt-[4px]" style={{ color: colors.textMuted, borderTop: `1px solid ${colors.divider}` }}>
                +{actions.length - 3} more actions
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ================================================================
   MOCK DATA EXPORT
   ================================================================ */

export const MOCK_AGENT_ACTIONS: Record<string, AgentAction[]> = {
  "asset-1": [
    {
      id: "action-1",
      type: "case-created",
      agent: "Exposure Analyst",
      timestamp: "2h ago",
      status: "completed",
    },
    {
      id: "action-2",
      type: "approval-requested",
      agent: "Exposure Analyst",
      timestamp: "1h 45m ago",
      status: "pending",
    },
  ],
  "vuln-1": [
    {
      id: "action-3",
      type: "workflow-triggered",
      agent: "Vulnerability Analyst",
      timestamp: "30m ago",
      status: "in-progress",
    },
  ],
  "path-1": [
    {
      id: "action-4",
      type: "risk-updated",
      agent: "Risk Intelligence Analyst",
      timestamp: "3h ago",
      status: "completed",
    },
  ],
  "risk-1": [
    {
      id: "action-5",
      type: "notification-sent",
      agent: "Risk Intelligence Analyst",
      timestamp: "2h 30m ago",
      status: "completed",
    },
  ],
};
