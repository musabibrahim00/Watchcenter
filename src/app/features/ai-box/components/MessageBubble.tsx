/**
 * AI Box — MessageBubble component.
 *
 * Renders a single chat message: user bubble, agent bubble,
 * divider, rendered-UI slot, or task-graph slot.
 * Purely presentational — no state, no side-effects.
 */

import React from "react";
import imgAvatar from "../../../../assets/TeammateAvatar.png";
import { formatText } from "../../../shared/utils/format-text";
import type { ChatMessage, TaskGraph } from "../types";
import { ActionLifecycleBadge } from "./ActionLifecycleBadge";

export const MessageBubble = React.memo(function MessageBubble({
  message,
  onAction,
  taskGraphRenderer,
}: {
  message: ChatMessage;
  onAction: (l: string) => void;
  taskGraphRenderer?: (taskGraph: TaskGraph) => React.ReactNode;
}) {
  const time = message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  if (message.role === "divider") {
    return (
      <div className="flex items-center gap-[10px] px-[16px] py-[6px] opacity-60">
        <div className="flex-1 h-[1px]" style={{ background: "rgba(87,177,255,0.12)" }} />
        <span style={{ fontSize: 9, color: "#4a6070", fontFamily: "'Inter:Regular',sans-serif", letterSpacing: "0.04em", whiteSpace: "nowrap" }}>
          {message.text}
        </span>
        <div className="flex-1 h-[1px]" style={{ background: "rgba(87,177,255,0.12)" }} />
      </div>
    );
  }

  if (message.role === "user") {
    return (
      <div className="flex flex-col items-end px-[16px] py-[3px]">
        <div className="rounded-[10px] rounded-tr-[4px] px-[10px] py-[8px] max-w-[80%]" style={{ background: "rgba(7,100,152,0.32)" }}>
          <p className="font-['Inter:Regular',sans-serif] font-normal leading-[17px] text-[#f1f3ff] text-[11px] whitespace-pre-wrap break-words">{message.text}</p>
        </div>
        {message.actionMeta && (
          <div className="mt-[3px] mr-[4px]">
            <ActionLifecycleBadge state={message.actionMeta.state} by={message.actionMeta.by} />
          </div>
        )}
        <p className="font-['Inter:Regular',sans-serif] font-normal leading-[12px] text-[#4a5f72] text-[9px] mt-[3px] mr-[4px]">{time}</p>
      </div>
    );
  }

  if (message.taskGraph && taskGraphRenderer) {
    return <>{taskGraphRenderer(message.taskGraph)}</>;
  }

  if (message.renderedUI) {
    return (
      <div className="flex items-start gap-[8px] px-[16px] py-[3px]">
        <div className="shrink-0 size-[22px] rounded-full overflow-hidden mt-[2px]">
          <img alt="" className="size-full object-cover" src={imgAvatar} />
        </div>
        <div className="flex flex-col flex-1 min-w-0 overflow-hidden" style={{ animation: "moduleSlideIn 0.35s ease-out" }}>
          {message.renderedUI}
          <p className="font-['Inter:Regular',sans-serif] font-normal leading-[12px] text-[#4a5f72] text-[9px] mt-[3px] ml-[4px]">{time}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-[8px] px-[16px] py-[3px]">
      <div className="shrink-0 size-[22px] rounded-full overflow-hidden mt-[2px]">
        <img alt="" className="size-full object-cover" src={imgAvatar} />
      </div>
      <div className="flex flex-col max-w-[80%]">
        <div className="bg-[#0e1c2c] rounded-[10px] rounded-tl-[4px] px-[10px] py-[8px] border border-[#172840]">
          <p className="font-['Inter:Regular',sans-serif] font-normal leading-[17px] text-[#9fadb9] text-[11px] whitespace-pre-wrap break-words">{formatText(message.text)}</p>
        </div>
        <p className="font-['Inter:Regular',sans-serif] font-normal leading-[12px] text-[#4a5f72] text-[9px] mt-[3px] ml-[4px]">{time}</p>
      </div>
    </div>
  );
});
