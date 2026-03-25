/**
 * AI Box — ChatInput component.
 *
 * Textarea + send button used in all AI chat surfaces.
 * Handles keyboard shortcut (Enter to send) and auto-resize.
 * No orchestration state — all values flow in via props.
 */

import React from "react";

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
          <div
            className="input-area-bg flex-[1_0_0] min-h-[40px] max-h-[120px] min-w-px relative rounded-[8px]"
            data-name={dataName}
            style={{
              border: "1px solid rgba(87,177,255,0.22)",
              boxShadow: "0px 24px 48px 0px rgba(0,0,0,0.48)",
            }}
          >
            <textarea
              id={dataName}
              name={dataName}
              className="relative z-10 w-full min-h-[40px] max-h-[120px] bg-transparent resize-none border-none outline-none px-[16px] py-[11px] font-['Inter:Regular',sans-serif] font-normal leading-normal text-[#dadfe3] text-[12px] placeholder-[#89949e] tracking-[0px]"
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
