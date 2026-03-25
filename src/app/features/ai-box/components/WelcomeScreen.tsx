/**
 * AI Box — WelcomeScreen component.
 *
 * Shown when the chat is empty — renders suggestion chips
 * the user can click to seed the first message.
 * Purely presentational — no state, no side-effects.
 */

import React from "react";

export const WelcomeScreen = React.memo(function WelcomeScreen({ suggestions }: { suggestions: string[] }) {
  return (
    <div className="flex flex-col items-center justify-end size-full gap-[10px] px-[20px] pb-[8px]">
      <div className="flex flex-col gap-[5px] w-full max-w-[260px]">
        {suggestions.map(s => (
          <div key={s} className="bg-[#0a1828] border border-[#172a3c] rounded-[6px] px-[10px] py-[7px] cursor-pointer hover:border-[#1e3a5f] transition-colors group" data-suggestion={s}>
            <div className="flex items-center gap-[6px]">
              <svg className="size-[8px] shrink-0 opacity-30 group-hover:opacity-60 transition-opacity" viewBox="0 0 10 10" fill="none"><path d="M3.5 2L6.5 5L3.5 8" stroke="#57b1ff" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
              <p className="font-['Inter:Regular',sans-serif] font-normal leading-[13px] text-[#7e8e9e] group-hover:text-[#9fadb9] transition-colors text-[12px]">{s}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});
