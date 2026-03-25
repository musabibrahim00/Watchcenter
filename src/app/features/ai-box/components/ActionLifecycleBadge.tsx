/**
 * AI Box — ActionLifecycleBadge component.
 *
 * Displays the lifecycle state of a chat action message.
 * Purely presentational — no state, no side-effects.
 */

import React from "react";
import type { ActionLifecycleState } from "../types";

const ACTION_LIFECYCLE_CONFIG: Record<ActionLifecycleState, { label: string; color: string; bg: string }> = {
  recommended: { label: "Recommended", color: "#57b1ff", bg: "rgba(87,177,255,0.08)" },
  approved:    { label: "Authorized",  color: "#2fd897", bg: "rgba(47,216,151,0.08)" },
  deferred:    { label: "Deferred",    color: "#f59e0b", bg: "rgba(245,158,11,0.07)" },
  modified:    { label: "Modified",    color: "#a78bfa", bg: "rgba(167,139,250,0.07)" },
  executed:    { label: "Executing",   color: "#57b1ff", bg: "rgba(87,177,255,0.06)" },
  completed:   { label: "Completed",   color: "#2fd897", bg: "rgba(47,216,151,0.06)" },
  failed:      { label: "Failed",      color: "#ff5757", bg: "rgba(255,87,87,0.07)" },
  reopened:    { label: "Reopened",    color: "#f59e0b", bg: "rgba(245,158,11,0.08)" },
};

export const ActionLifecycleBadge = React.memo(function ActionLifecycleBadge({ state, by }: { state: ActionLifecycleState; by?: string }) {
  const cfg = ACTION_LIFECYCLE_CONFIG[state];
  return (
    <div className="flex items-center gap-[5px]">
      <span
        className="inline-flex items-center px-[5px] py-[1px] rounded-[3px] font-['Inter:Medium',sans-serif] text-[8px] tracking-[0.3px]"
        style={{ color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.color}22` }}
      >
        {cfg.label}
      </span>
      {by && <span className="font-['Inter:Regular',sans-serif] text-[8px]" style={{ color: "#3a5060" }}>{by}</span>}
    </div>
  );
});
