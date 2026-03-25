/**
 * AI Box — ContributingAgentsBlock component.
 *
 * Purely presentational: no state, no hooks.
 * Shows which analysts contributed to a multi-agent action.
 */

import React from "react";

export const ContributingAgentsBlock = React.memo(function ContributingAgentsBlock({
  analysts,
  contributions,
}: { analysts: string[]; contributions?: Record<string, string> }) {
  return (
    <div
      className="rounded-[8px] px-[12px] py-[10px] flex flex-col gap-[6px]"
      style={{ background: "rgba(7,18,30,0.80)", border: "1px solid rgba(87,177,255,0.12)" }}
    >
      <span className="font-['Inter:Medium',sans-serif] font-medium text-[9px] leading-[11px] text-[#4a5f72] uppercase tracking-[0.06em]">
        Contributing Analysts
      </span>
      <div className="flex flex-col gap-[5px]">
        {analysts.map(a => (
          <div key={a} className="flex items-start gap-[6px]">
            <div
              className="w-[4px] h-[4px] rounded-full shrink-0 mt-[4px]"
              style={{ backgroundColor: "#57b1ff", opacity: 0.55 }}
            />
            <div className="flex flex-col gap-[1px]">
              <span className="font-['Inter:Regular',sans-serif] font-normal text-[10px] leading-[13px] text-[#7e8e9e]">
                {a}
              </span>
              {contributions?.[a] && (
                <span className="font-['Inter:Regular',sans-serif] font-normal text-[9px] leading-[12px] text-[#4a5f72]">
                  → {contributions[a]}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});
