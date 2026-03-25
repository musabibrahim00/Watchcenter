/**
 * AI Box — Action result display components.
 *
 * Purely presentational: no state, no useEffect, no hooks.
 * Renders before/after comparisons and failure explanations.
 */

import React from "react";
import type { ActionResultData, ActionFailureInfo } from "../types";

export const ActionResultCard = React.memo(function ActionResultCard({
  result,
}: {
  result: ActionResultData;
}) {
  /* Build unified before→after pairs from before + after records */
  const allKeys = Array.from(
    new Set([...Object.keys(result.before || {}), ...Object.keys(result.after || {})])
  ).slice(0, 5);
  const pairs = allKeys.map(key => ({
    key,
    from: result.before?.[key],
    to: result.after?.[key],
  }));

  const unchangedPairs = Object.entries(result.unchanged || {});
  const hasComparison = pairs.length > 0;
  const hasUnchanged = unchangedPairs.length > 0;
  const hasAnalysts = (result.analysts?.length ?? 0) > 0;
  const isNoChange = result.changeState === "no-change";
  const isPartial = result.changeState === "partial";

  return (
    <div
      className="rounded-[10px] overflow-hidden"
      style={{ background: "rgba(4,10,16,0.85)", border: "1px solid rgba(47,216,151,0.16)" }}
    >
      {/* Header */}
      <div
        className="pl-[12px] pr-[10px] py-[7px] flex items-center justify-between"
        style={{ borderBottom: "1px solid rgba(47,216,151,0.08)" }}
      >
        <div className="flex items-center gap-[6px]">
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <circle cx="5" cy="5" r="4" fill="rgba(47,216,151,0.12)" stroke="#2fd897" strokeWidth="0.8" />
            <path d="M3 5L4.5 6.5L7 3.5" stroke="#2fd897" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="font-['Inter:Semi_Bold',sans-serif] font-semibold text-[10px] leading-[13px] text-[#2fd897]">
            Action complete
          </span>
        </div>
        {isPartial && (
          <span
            className="px-[6px] py-[2px] rounded-[3px] font-['Inter:Medium',sans-serif] font-medium text-[8px] leading-[10px]"
            style={{ background: "rgba(251,191,36,0.08)", border: "1px solid rgba(251,191,36,0.18)", color: "#f59e0b" }}
          >
            Partial update
          </span>
        )}
        {isNoChange && (
          <span
            className="px-[6px] py-[2px] rounded-[3px] font-['Inter:Medium',sans-serif] font-medium text-[8px] leading-[10px]"
            style={{ background: "rgba(87,177,255,0.07)", border: "1px solid rgba(87,177,255,0.15)", color: "#57b1ff" }}
          >
            No change
          </span>
        )}
      </div>

      {/* Summary bullets */}
      <div className="pl-[12px] pr-[10px] pt-[8px] pb-[6px] flex flex-col gap-[4px]">
        {result.bullets.map((b, i) => (
          <div key={i} className="flex items-start gap-[6px]">
            <div
              className="w-[3px] h-[3px] rounded-full shrink-0 mt-[5px]"
              style={{ backgroundColor: isNoChange ? "#57b1ff" : "#2fd897", opacity: 0.5 }}
            />
            <span className="font-['Inter:Regular',sans-serif] font-normal text-[10px] leading-[14px] text-[#7e8e9e]">
              {b}
            </span>
          </div>
        ))}
      </div>

      {/* Before / After comparison block — only when there are actual changes */}
      {hasComparison && !isNoChange && (
        <div
          className="pl-[12px] pr-[10px] py-[8px] flex flex-col gap-[6px]"
          style={{ borderTop: "1px solid rgba(47,216,151,0.07)" }}
        >
          {/* Section label row */}
          <div className="flex items-center gap-[6px]">
            <span className="font-['Inter:Medium',sans-serif] font-medium text-[9px] leading-[11px] text-[#4a5f72] uppercase tracking-[0.05em]">
              Before
            </span>
            <svg width="14" height="8" viewBox="0 0 14 8" fill="none" className="shrink-0">
              <path d="M1 4H13M9.5 1L13 4L9.5 7" stroke="#3a4754" strokeWidth="0.7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="font-['Inter:Medium',sans-serif] font-medium text-[9px] leading-[11px] text-[#2fd897] uppercase tracking-[0.05em]">
              After
            </span>
          </div>

          {/* Comparison rows */}
          {pairs.map(({ key, from, to }) => (
            <div key={key} className="flex items-center gap-[5px] min-w-0">
              {/* Field label */}
              <span
                className="font-['Inter:Regular',sans-serif] font-normal text-[9px] leading-[12px] shrink-0"
                style={{ color: "#4a5f72", minWidth: 90 }}
              >
                {key}
              </span>
              {/* Before value */}
              {from ? (
                <span
                  className="font-['Inter:Regular',sans-serif] font-normal text-[10px] leading-[13px] truncate"
                  style={{ color: "#4a5568", textDecoration: to ? "line-through" : "none", textDecorationColor: "rgba(74,85,104,0.4)" }}
                >
                  {from}
                </span>
              ) : (
                <span className="font-['Inter:Regular',sans-serif] font-normal text-[9px] leading-[12px]" style={{ color: "#2d3748" }}>
                  —
                </span>
              )}
              {/* Arrow */}
              {to && (
                <svg width="10" height="8" viewBox="0 0 10 8" fill="none" className="shrink-0 opacity-40">
                  <path d="M1 4H9M6.5 1.5L9 4L6.5 6.5" stroke="#2fd897" strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
              {/* After value */}
              {to && (
                <span className="font-['Inter:Semi_Bold',sans-serif] font-semibold text-[10px] leading-[13px] text-[#2fd897] truncate">
                  {to}
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Unchanged values — shown for partial and no-change states */}
      {(hasUnchanged) && (
        <div
          className="pl-[12px] pr-[10px] py-[7px] flex flex-col gap-[5px]"
          style={{ borderTop: "1px solid rgba(47,216,151,0.07)" }}
        >
          <span className="font-['Inter:Medium',sans-serif] font-medium text-[9px] leading-[11px] text-[#4a5f72] uppercase tracking-[0.05em]">
            Unchanged
          </span>
          {unchangedPairs.map(([key, val]) => (
            <div key={key} className="flex items-center gap-[5px] min-w-0">
              <span
                className="font-['Inter:Regular',sans-serif] font-normal text-[9px] leading-[12px] shrink-0"
                style={{ color: "#4a5f72", minWidth: 90 }}
              >
                {key}
              </span>
              <span className="font-['Inter:Regular',sans-serif] font-normal text-[10px] leading-[13px] text-[#4a5568] truncate">
                {val}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Why it changed */}
      {result.whyItChanged && (
        <div
          className="pl-[12px] pr-[10px] py-[8px]"
          style={{ borderTop: "1px solid rgba(47,216,151,0.07)" }}
        >
          <div className="flex items-start gap-[5px]">
            <svg width="9" height="9" viewBox="0 0 9 9" fill="none" className="shrink-0 mt-[2px]">
              <circle cx="4.5" cy="4.5" r="3.5" fill="none" stroke="#3a4754" strokeWidth="0.7" />
              <path d="M4.5 3.5V4.5M4.5 5.5V5.6" stroke="#3a4754" strokeWidth="0.7" strokeLinecap="round" />
            </svg>
            <div className="flex flex-col gap-[3px]">
              <span className="font-['Inter:Medium',sans-serif] font-medium text-[9px] leading-[11px] text-[#4a5f72] uppercase tracking-[0.05em]">
                Why it changed
              </span>
              <p className="font-['Inter:Regular',sans-serif] font-normal text-[10px] leading-[14px] text-[#7e8e9e]">
                {result.whyItChanged}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Contributing Analysts */}
      {hasAnalysts && (
        <div
          className="pl-[12px] pr-[10px] py-[6px] flex flex-col gap-[4px]"
          style={{ borderTop: "1px solid rgba(47,216,151,0.07)" }}
        >
          <span className="font-['Inter:Medium',sans-serif] font-medium text-[9px] leading-[11px] text-[#4a5f72] uppercase tracking-[0.05em]">
            Contributing Analysts
          </span>
          {result.analysts!.map(a => (
            <div key={a} className="flex items-center gap-[5px]">
              <div className="w-[3px] h-[3px] rounded-full shrink-0" style={{ backgroundColor: "#2fd897", opacity: 0.3 }} />
              <span className="font-['Inter:Regular',sans-serif] font-normal text-[9px] leading-[12px] text-[#4a5568]">
                {a}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Next Actions */}
      <div
        className="pl-[12px] pr-[10px] py-[8px] flex flex-col gap-[5px]"
        style={{ borderTop: "1px solid rgba(47,216,151,0.07)" }}
      >
        <span className="font-['Inter:Medium',sans-serif] font-medium text-[9px] leading-[11px] text-[#4a5f72] uppercase tracking-[0.05em]">
          Next Actions
        </span>
        <div className="flex flex-wrap gap-[5px]">
          {result.nextActions.slice(0, 4).map((a, i) => (
            <button
              key={i}
              className="px-[8px] py-[4px] rounded-[4px] font-['Inter:Regular',sans-serif] font-normal text-[10px] leading-[13px] cursor-pointer border-none transition-colors"
              style={{ background: "rgba(87,177,255,0.05)", color: "#57b1ff", border: "1px solid rgba(87,177,255,0.12)" }}
              data-suggestion={a}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(87,177,255,0.11)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "rgba(87,177,255,0.05)"; }}
            >
              {a}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
});

/* ── ActionFailureCard — shown in AIBox when an AI action fails ── */

export const ActionFailureCard = React.memo(function ActionFailureCard({
  failure,
}: {
  failure: ActionFailureInfo;
}) {
  return (
    <div
      className="rounded-[10px] overflow-hidden"
      style={{ background: "rgba(4,10,16,0.85)", border: "1px solid rgba(239,68,68,0.16)" }}
    >
      {/* Header */}
      <div
        className="pl-[12px] pr-[10px] py-[7px] flex items-center gap-[6px]"
        style={{ borderBottom: "1px solid rgba(239,68,68,0.08)" }}
      >
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
          <circle cx="5" cy="5" r="4" fill="rgba(239,68,68,0.10)" stroke="rgba(239,68,68,0.6)" strokeWidth="0.8" />
          <path d="M3.5 3.5L6.5 6.5M6.5 3.5L3.5 6.5" stroke="rgba(239,68,68,0.7)" strokeWidth="0.9" strokeLinecap="round" />
        </svg>
        <span
          className="font-['Inter:Semi_Bold',sans-serif] font-semibold text-[10px] leading-[13px]"
          style={{ color: "rgba(239,68,68,0.85)" }}
        >
          Action could not be completed
        </span>
      </div>

      {/* Reason */}
      <div className="pl-[12px] pr-[10px] pt-[8px] pb-[6px] flex flex-col gap-[6px]">
        <p className="font-['Inter:Regular',sans-serif] font-normal text-[10px] leading-[14px] text-[#7e8e9e]">
          {failure.reason}
        </p>
        {/* Impact */}
        <div
          className="flex items-start gap-[5px] px-[7px] py-[5px] rounded-[4px]"
          style={{ background: "rgba(239,68,68,0.04)", border: "1px solid rgba(239,68,68,0.09)" }}
        >
          <svg width="9" height="9" viewBox="0 0 9 9" fill="none" className="shrink-0 mt-[2px]">
            <circle cx="4.5" cy="4.5" r="3.5" stroke="rgba(239,68,68,0.5)" strokeWidth="0.7" />
            <path d="M4.5 3v1.5M4.5 5.5v.5" stroke="rgba(239,68,68,0.5)" strokeWidth="0.7" strokeLinecap="round" />
          </svg>
          <span className="font-['Inter:Regular',sans-serif] font-normal text-[10px] leading-[14px] text-[#4a5568]">
            {failure.impact}
          </span>
        </div>
      </div>

      {/* Next Actions */}
      <div
        className="pl-[12px] pr-[10px] py-[8px] flex flex-col gap-[5px]"
        style={{ borderTop: "1px solid rgba(239,68,68,0.07)" }}
      >
        <span className="font-['Inter:Medium',sans-serif] font-medium text-[9px] leading-[11px] text-[#4a5f72] uppercase tracking-[0.05em]">
          Next Actions
        </span>
        <div className="flex flex-wrap gap-[5px]">
          {failure.nextActions.map((a, i) => (
            <button
              key={i}
              className="px-[8px] py-[4px] rounded-[4px] font-['Inter:Regular',sans-serif] font-normal text-[10px] leading-[13px] cursor-pointer border-none transition-colors"
              style={{ background: "rgba(239,68,68,0.05)", color: "rgba(239,68,68,0.75)", border: "1px solid rgba(239,68,68,0.13)" }}
              data-suggestion={a}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(239,68,68,0.10)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "rgba(239,68,68,0.05)"; }}
            >
              {a}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
});