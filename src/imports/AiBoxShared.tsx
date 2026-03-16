import React from "react";
import imgAvatar from "figma:asset/976dde1a603f5a46e2c8728e96db5d977bcbfff3.png";
import imgInputArea from "figma:asset/e48d3f4f9530b463fdfa63f8bd84ace2538c65c8.png";
import { LoadingSkeleton } from "./AiBoxModules";

/* ── Import shared utilities for local use ── */
import { formatText } from "../app/shared/utils/format-text";
import { isCasual, CASUAL_RESPS } from "../app/shared/utils/casual-detection";
import { getResponseContextLabel } from "../app/shared/utils/response-labels";
import { SUCCESS_STATES, getSuccessState } from "../app/shared/utils/success-states";

/* ── Re-export shared utilities for backward-compatible import paths ── */
export { formatText, isCasual, CASUAL_RESPS, getResponseContextLabel, SUCCESS_STATES, getSuccessState };

/* ═══════════════════════════════════════════════════════════
   Shared Types
   ═══════════════════════════════════════════════════════════ */

export interface TaskNode {
  id: string;
  label: string;
  agent?: string;
  status: "pending" | "running" | "done";
}

export interface TaskGraph {
  nodes: TaskNode[];
  allDone: boolean;
}

export interface ChatMessage {
  id: string;
  role: "user" | "agent";
  text: string;
  timestamp: Date;
  taskGraph?: TaskGraph;
  renderedUI?: React.ReactNode;
}

/* ═══════════════════════════════════════════════════════════
   Shared Avatar Image Export
   ═══════════════════════════════════════════════════════════ */

export { imgAvatar };

/* ═══════════════════════════════════════════════════════════
   Shared Sub-Components
   ═══════════════════════════════════════════════════════════ */

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

  if (message.role === "user") {
    return (
      <div className="flex flex-col items-end px-[16px] py-[3px]">
        <div className="bg-[#076498] rounded-[10px] rounded-tr-[4px] px-[10px] py-[8px] max-w-[80%]">
          <p className="font-['Inter:Regular',sans-serif] font-normal leading-[17px] text-[#f1f3ff] text-[11px] whitespace-pre-wrap break-words">{message.text}</p>
        </div>
        <p className="font-['Inter:Regular',sans-serif] font-normal leading-[12px] text-[#3a4754] text-[9px] mt-[3px] mr-[4px]">{time}</p>
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
          <p className="font-['Inter:Regular',sans-serif] font-normal leading-[12px] text-[#3a4754] text-[9px] mt-[3px] ml-[4px]">{time}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-[8px] px-[16px] py-[3px]">
      <div className="shrink-0 size-[22px] rounded-full overflow-hidden mt-[2px]">
        <img alt="" className="size-full object-cover" src={imgAvatar} />
      </div>
      <div className="flex flex-col max-w-[85%]">
        <div className="bg-[#0a1420] rounded-[10px] rounded-tl-[4px] px-[10px] py-[8px] border border-[#121e27]">
          <p className="font-['Inter:Regular',sans-serif] font-normal leading-[17px] text-[#89949e] text-[11px] whitespace-pre-wrap break-words">{formatText(message.text)}</p>
        </div>
        <p className="font-['Inter:Regular',sans-serif] font-normal leading-[12px] text-[#3a4754] text-[9px] mt-[3px] ml-[4px]">{time}</p>
      </div>
    </div>
  );
});

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

/* ═══════════════════════════════════════════════════════════
   Shared ChatInput Component
   ═══════════════════════════════════════════════════════════ */

export const ChatInput = React.memo(function ChatInput({
  inputValue,
  onInputChange,
  onSend,
  placeholder = "Ask me anything...",
  dataName = "InputArea",
  sendButtonSize = 48,
  sendButtonRadius = 12,
  sendIcon,
}: {
  inputValue: string;
  onInputChange: (v: string) => void;
  onSend: () => void;
  placeholder?: string;
  dataName?: string;
  sendButtonSize?: number;
  sendButtonRadius?: number;
  sendIcon?: React.ReactNode;
}) {
  const kd = React.useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); onSend(); }
    },
    [onSend],
  );
  const onInput = React.useCallback((e: React.FormEvent) => {
    const t = e.target as HTMLTextAreaElement;
    t.style.height = "auto";
    t.style.height = Math.min(t.scrollHeight, 120) + "px";
  }, []);

  return (
    <div className="relative shrink-0 w-full z-[4]">
      <div className="content-stretch flex flex-col gap-[12px] items-start p-[16px] relative w-full">
        <div className="content-stretch flex gap-[12px] items-end relative shrink-0 w-full">
          <div className="flex-[1_0_0] min-h-[40px] max-h-[120px] min-w-px relative rounded-[12px]" data-name={dataName}>
            <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none rounded-[12px] size-full z-0" src={imgInputArea} />
            <div aria-hidden="true" className="absolute border border-[rgba(87,177,255,0.16)] border-solid inset-0 pointer-events-none rounded-[12px] z-0" />
            <textarea
              className="relative z-10 w-full min-h-[40px] max-h-[120px] bg-transparent resize-none border-none outline-none px-[12px] py-[11px] font-['Inter:Regular',sans-serif] font-normal leading-[18px] text-[#dadfe3] text-[12px] placeholder-[#89949e]"
              style={{ scrollbarWidth: "none" }}
              placeholder={placeholder}
              value={inputValue}
              onChange={e => onInputChange(e.target.value)}
              onKeyDown={kd}
              rows={1}
              onInput={onInput}
            />
          </div>
          <button
            className={`shrink-0 flex items-center justify-center transition-all cursor-pointer border-none ${inputValue.trim() ? "bg-[#076498] hover:bg-[#0879b5]" : "bg-[#076498]/40"}`}
            style={{
              width: sendButtonSize,
              height: sendButtonSize,
              borderRadius: sendButtonRadius,
            }}
            onClick={onSend}
            disabled={!inputValue.trim()}
          >
            {sendIcon || (
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M14 2L7 9M14 2L9.5 14L7 9M14 2L2 6.5L7 9" stroke="#F1F3FF" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
});

/* ═══════════════════════════════════════════════════════════
   Shared WelcomeScreen Component
   ═══════════════════════════════════════════════════════════ */

export const WelcomeScreen = React.memo(function WelcomeScreen({ suggestions }: { suggestions: string[] }) {
  return (
    <div className="flex flex-col items-center justify-end size-full gap-[10px] px-[20px] pb-[8px]">
      <div className="flex flex-col gap-[5px] w-full max-w-[260px]">
        {suggestions.map(s => (
          <div key={s} className="bg-[#060d14] border border-[#121e27] rounded-[6px] px-[10px] py-[7px] cursor-pointer hover:border-[#1e3a5f] transition-colors group" data-suggestion={s}>
            <div className="flex items-center gap-[6px]">
              <svg className="size-[8px] shrink-0 opacity-30 group-hover:opacity-60 transition-opacity" viewBox="0 0 10 10" fill="none"><path d="M3.5 2L6.5 5L3.5 8" stroke="#57b1ff" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
              <p className="font-['Inter:Regular',sans-serif] font-normal leading-[13px] text-[#62707D] group-hover:text-[#89949e] transition-colors text-[10px]">{s}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});