/**
 * AI Box — TypingIndicator component.
 *
 * Shows an animated skeleton while the agent is generating a response.
 * Purely presentational — no state, no side-effects.
 */

import React from "react";
import imgAvatar from "../../../../assets/TeammateAvatar.png";
import { LoadingSkeleton } from "../../../../imports/AiBoxModules";

export const TypingIndicator = React.memo(function TypingIndicator() {
  return (
    <div className="flex items-start gap-[8px] px-[16px] py-[4px]">
      <div className="shrink-0 size-[22px] rounded-full overflow-hidden mt-[2px]">
        <img alt="" className="size-full object-cover" src={imgAvatar} />
      </div>
      <div className="flex flex-col flex-1 min-w-0" style={{ animation: "moduleSlideIn 0.35s ease-out" }}>
        <LoadingSkeleton />
      </div>
    </div>
  );
});
