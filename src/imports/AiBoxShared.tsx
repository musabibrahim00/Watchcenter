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

/* ═══════════════════════════════════════════════════════════
   Action Model — Structured AI interaction types
   ═══════════════════════════════════════════════════════════ */

export type ActionIntent = "explain" | "explore" | "act";
export type ActionScope = "asset" | "agent" | "workflow" | "investigation" | "risk";
export type ActionStatus = "pending" | "running" | "complete" | "cancelled";

export interface ActionParameter {
  label: string;
  value: string;
  editable?: boolean;
}

export interface ActionCardData {
  id: string;
  title: string;
  scope: ActionScope;
  parameters: ActionParameter[];
  expectedOutcome: string;
  status: ActionStatus;
  progress?: number;
  result?: string;
}

/* ── Action intent classification ── */

const ACT_PATTERNS: RegExp[] = [
  /re-?run\s+(analysis|investigation|scan|assessment)/i,
  /re-?classify\s+(asset|endpoint|resource)/i,
  /recalculate\s+(risk|score|posture)/i,
  /simulate\s+(impact|blast|breach|attack)/i,
  /re-?run\s+(investigation|playbook)/i,
  /block\s+(ip|endpoint|user|account)/i,
  /isolate\s+(host|endpoint|machine|asset)/i,
  /disable\s+(account|user|token|key)/i,
  /rotate\s+(credentials?|tokens?|keys?|secrets?)/i,
  /quarantine/i,
  /trigger\s+(scan|remediation|workflow|playbook)/i,
  /escalate\s+(to|case|alert|incident)/i,
  /create\s+(case|ticket|incident)/i,
  /assign\s+(analyst|owner|case)/i,
  /run\s+(compliance\s+check|vulnerability\s+scan|posture\s+scan)/i,
  /deploy\s+(patch|fix|update|hotfix)/i,
  /update\s+(policy|rule|baseline|config)/i,
];

const EXPLORE_PATTERNS: RegExp[] = [
  /show\s+(me|all|the)/i,
  /list\s+(all|the|active|recent)/i,
  /what\s+(are|is|were|was)/i,
  /how\s+many/i,
  /which\s+(assets?|agents?|cases?|paths?)/i,
  /compare/i,
  /drill\s+(in|down|into)/i,
  /breakdown/i,
  /distribution/i,
  /trend/i,
  /graph|chart|visuali/i,
];

export function classifyActionIntent(query: string): ActionIntent {
  const q = query.trim();
  for (const p of ACT_PATTERNS) {
    if (p.test(q)) return "act";
  }
  for (const p of EXPLORE_PATTERNS) {
    if (p.test(q)) return "explore";
  }
  if (/^(explain|describe|why|how does|what does|tell me about|walk me through)/i.test(q)) return "explain";
  return "explore";
}

/* ── Predefined action catalog ── */

export interface ActionTemplate {
  match: RegExp;
  build: (query: string, agentLabel?: string) => ActionCardData;
}

const _actionId = () => crypto.randomUUID();

export const ACTION_CATALOG: ActionTemplate[] = [
  {
    match: /re-?run\s+(analysis|assessment)/i,
    build: (_q, agent) => ({
      id: _actionId(), title: "Re-run Analysis", scope: "agent",
      parameters: [
        { label: "Target", value: agent || "All monitored assets" },
        { label: "Scope", value: "Full analysis cycle" },
        { label: "Priority", value: "Normal", editable: true },
      ],
      expectedOutcome: "Fresh analysis cycle across all data sources. Findings and risk scores will be updated upon completion.",
      status: "pending",
    }),
  },
  {
    match: /re-?classify\s+(asset|endpoint|resource)/i,
    build: (q) => {
      const assetMatch = q.match(/re-?classify\s+(?:asset|endpoint|resource)\s+(.+)/i);
      return {
        id: _actionId(), title: "Re-classify Asset", scope: "asset",
        parameters: [
          { label: "Asset", value: assetMatch?.[1]?.trim() || "Selected asset" },
          { label: "Classification", value: "Auto-detect", editable: true },
          { label: "Update CMDB", value: "Yes" },
        ],
        expectedOutcome: "Asset classification and metadata will be updated. Downstream risk scores and compliance mappings will recalculate automatically.",
        status: "pending",
      };
    },
  },
  {
    match: /recalculate\s+(risk|score|posture)/i,
    build: (_q, agent) => ({
      id: _actionId(), title: "Recalculate Risk Score", scope: "risk",
      parameters: [
        { label: "Scope", value: agent || "Organization-wide" },
        { label: "Include threat intel", value: "Yes" },
        { label: "Recalc dependencies", value: "Yes", editable: true },
      ],
      expectedOutcome: "Composite risk scores will be recalculated using latest vulnerability, exposure, and threat intelligence data.",
      status: "pending",
    }),
  },
  {
    match: /simulate\s+(impact|blast|breach|attack)/i,
    build: (q) => {
      const typeMatch = q.match(/simulate\s+(impact|blast|breach|attack)/i);
      return {
        id: _actionId(), title: `Simulate ${(typeMatch?.[1] || "Impact").charAt(0).toUpperCase() + (typeMatch?.[1] || "impact").slice(1)}`, scope: "investigation",
        parameters: [
          { label: "Scenario", value: "Current threat context" },
          { label: "Entry point", value: "Auto-detect from findings", editable: true },
          { label: "Max hops", value: "5", editable: true },
        ],
        expectedOutcome: "Blast radius simulation showing affected assets, lateral movement paths, and estimated business impact score.",
        status: "pending",
      };
    },
  },
  {
    match: /re-?run\s+investigation/i,
    build: (_q, agent) => ({
      id: _actionId(), title: "Re-run Investigation", scope: "investigation",
      parameters: [
        { label: "Analyst", value: agent || "All contributing analysts" },
        { label: "Scope", value: "Full investigation chain" },
        { label: "Include resolved", value: "No", editable: true },
      ],
      expectedOutcome: "Investigation chain will be re-executed with latest data. New correlations and findings will be surfaced.",
      status: "pending",
    }),
  },
  {
    match: /trigger\s+(scan|remediation|workflow|playbook)/i,
    build: (q) => {
      const typeMatch = q.match(/trigger\s+(scan|remediation|workflow|playbook)/i);
      return {
        id: _actionId(), title: `Trigger ${(typeMatch?.[1] || "Scan").charAt(0).toUpperCase() + (typeMatch?.[1] || "scan").slice(1)}`, scope: "workflow",
        parameters: [
          { label: "Type", value: (typeMatch?.[1] || "scan").charAt(0).toUpperCase() + (typeMatch?.[1] || "scan").slice(1) },
          { label: "Target", value: "Current scope" },
          { label: "Notify on complete", value: "Yes", editable: true },
        ],
        expectedOutcome: "Action will be queued and executed. Results will appear in the activity feed upon completion.",
        status: "pending",
      };
    },
  },
  {
    match: /create\s+(case|ticket|incident)/i,
    build: (q) => {
      const typeMatch = q.match(/create\s+(case|ticket|incident)/i);
      return {
        id: _actionId(), title: `Create ${(typeMatch?.[1] || "Case").charAt(0).toUpperCase() + (typeMatch?.[1] || "case").slice(1)}`, scope: "investigation",
        parameters: [
          { label: "Type", value: (typeMatch?.[1] || "case").charAt(0).toUpperCase() + (typeMatch?.[1] || "case").slice(1) },
          { label: "Priority", value: "Auto-detect", editable: true },
          { label: "Assign to", value: "SOC Tier 1", editable: true },
        ],
        expectedOutcome: "New investigation case created with current findings linked. Assigned analyst will be notified.",
        status: "pending",
      };
    },
  },
  {
    match: /run\s+(compliance\s+check|vulnerability\s+scan|posture\s+scan)/i,
    build: (q) => {
      const typeMatch = q.match(/run\s+(compliance\s+check|vulnerability\s+scan|posture\s+scan)/i);
      const type = typeMatch?.[1] || "scan";
      return {
        id: _actionId(), title: `Run ${type.charAt(0).toUpperCase() + type.slice(1)}`, scope: "workflow",
        parameters: [
          { label: "Type", value: type.charAt(0).toUpperCase() + type.slice(1) },
          { label: "Scope", value: "All monitored assets" },
          { label: "Report", value: "Generate on completion", editable: true },
        ],
        expectedOutcome: "Scan will execute across all monitored assets. Results and any new findings will be available in the activity feed.",
        status: "pending",
      };
    },
  },
];

export function matchAction(query: string, agentLabel?: string): ActionCardData | null {
  for (const tpl of ACTION_CATALOG) {
    if (tpl.match.test(query)) {
      return tpl.build(query, agentLabel);
    }
  }
  return null;
}

/* ── ActionCard Component ── */

const SCOPE_CONFIG: Record<ActionScope, { label: string; color: string; bg: string }> = {
  asset:         { label: "Asset",         color: "#1eb2c2", bg: "rgba(30,178,194,0.10)" },
  agent:         { label: "Agent",         color: "#00A46E", bg: "rgba(0,164,110,0.10)" },
  workflow:      { label: "Workflow",      color: "#3b82f6", bg: "rgba(59,130,246,0.10)" },
  investigation: { label: "Investigation", color: "#d97506", bg: "rgba(217,117,6,0.10)" },
  risk:          { label: "Risk",          color: "#9738C6", bg: "rgba(151,56,198,0.10)" },
};

export const ActionCard = React.memo(function ActionCard({
  data: initialData,
  onModify,
  onComplete,
}: {
  data: ActionCardData;
  onModify?: (data: ActionCardData, refinement: string) => void;
  onComplete?: (data: ActionCardData) => void;
}) {
  const [data, setData] = React.useState(initialData);
  const [progress, setProgress] = React.useState(0);
  const timerRef = React.useRef<ReturnType<typeof setInterval> | null>(null);

  React.useEffect(() => {
    setData(initialData);
  }, [initialData]);

  const scopeConfig = SCOPE_CONFIG[data.scope];

  const handleRun = React.useCallback(() => {
    setData(d => ({ ...d, status: "running" }));
    setProgress(0);

    const duration = 3000 + Math.random() * 2000;
    const steps = 30;
    const stepMs = duration / steps;
    let step = 0;

    timerRef.current = setInterval(() => {
      step++;
      const pct = Math.min(100, Math.round((step / steps) * 100));
      setProgress(pct);

      if (step >= steps) {
        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = null;
        setData(d => {
          const completed = { ...d, status: "complete" as const, progress: 100, result: `${d.title} completed successfully. All downstream dependencies updated.` };
          onComplete?.(completed);
          return completed;
        });
      }
    }, stepMs);
  }, [onComplete]);

  const handleCancel = React.useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setData(d => ({ ...d, status: "cancelled" }));
  }, []);

  const handleModify = React.useCallback(() => {
    onModify?.(data, `I'd like to modify the "${data.title}" action. What parameters should I change?`);
  }, [data, onModify]);

  React.useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  return (
    <div
      className="rounded-[10px] overflow-hidden"
      style={{
        backgroundColor: "#050B11",
        border: data.status === "running"
          ? "1px solid rgba(59,130,246,0.3)"
          : data.status === "complete"
            ? "1px solid rgba(47,216,151,0.25)"
            : data.status === "cancelled"
              ? "1px solid rgba(98,112,125,0.2)"
              : `1px solid ${scopeConfig.color}30`,
        transition: "border-color 0.3s ease",
      }}
    >
      {/* Header */}
      <div
        className="px-[12px] py-[8px] flex items-center gap-[8px]"
        style={{ borderBottom: "1px solid rgba(14,28,38,0.6)" }}
      >
        {/* Action type badge */}
        <div
          className="flex items-center gap-[3px] px-[5px] py-[2px] rounded-[3px] shrink-0"
          style={{
            backgroundColor: data.status === "complete" ? "rgba(47,216,151,0.10)" : "rgba(59,130,246,0.10)",
            border: `1px solid ${data.status === "complete" ? "rgba(47,216,151,0.20)" : "rgba(59,130,246,0.20)"}`,
          }}
        >
          <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
            {data.status === "complete" ? (
              <path d="M1.5 4L3.2 5.7L6.5 2.3" stroke="#2fd897" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
            ) : (
              <path d="M4 1.5V4L5.5 5.5" stroke="#3b82f6" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
            )}
          </svg>
          <span
            className="font-['Inter:Medium',sans-serif] font-medium text-[8px] leading-[10px] uppercase tracking-[0.04em]"
            style={{ color: data.status === "complete" ? "#2fd897" : "#3b82f6" }}
          >
            {data.status === "complete" ? "Done" : "Action"}
          </span>
        </div>

        <span
          className="font-['Inter:Semi_Bold',sans-serif] font-semibold text-[11px] leading-[14px] text-[#dadfe3] truncate flex-1"
        >
          {data.title}
        </span>

        {/* Scope badge */}
        <div
          className="px-[5px] py-[1px] rounded-[3px] shrink-0"
          style={{ backgroundColor: scopeConfig.bg, border: `1px solid ${scopeConfig.color}25` }}
        >
          <span
            className="font-['Inter:Medium',sans-serif] font-medium text-[8px] leading-[10px] uppercase tracking-[0.04em]"
            style={{ color: scopeConfig.color }}
          >
            {scopeConfig.label}
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="px-[12px] py-[10px] flex flex-col gap-[8px]">
        {/* Parameters */}
        {data.status !== "complete" && data.status !== "cancelled" && (
          <div className="flex flex-col gap-[4px]">
            <span className="font-['Inter:Medium',sans-serif] font-medium text-[9px] leading-[11px] text-[#4a5568] uppercase tracking-[0.05em]">
              Parameters
            </span>
            {data.parameters.map((p, i) => (
              <div key={i} className="flex items-center justify-between gap-[8px]">
                <span className="font-['Inter:Regular',sans-serif] font-normal text-[10px] leading-[13px] text-[#62707D]">
                  {p.label}
                </span>
                <span
                  className="font-['Inter:Medium',sans-serif] font-medium text-[10px] leading-[13px] text-[#89949e] text-right truncate max-w-[60%]"
                  style={p.editable ? { borderBottom: "1px dashed rgba(87,177,255,0.2)" } : undefined}
                >
                  {p.value}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Expected outcome */}
        {data.status === "pending" && (
          <div className="flex flex-col gap-[3px]">
            <span className="font-['Inter:Medium',sans-serif] font-medium text-[9px] leading-[11px] text-[#4a5568] uppercase tracking-[0.05em]">
              Expected Outcome
            </span>
            <p className="font-['Inter:Regular',sans-serif] font-normal text-[10px] leading-[14px] text-[#62707D]">
              {data.expectedOutcome}
            </p>
          </div>
        )}

        {/* Running state */}
        {data.status === "running" && (
          <div className="flex flex-col gap-[5px]">
            <div className="flex items-center justify-between">
              <span className="font-['Inter:Medium',sans-serif] font-medium text-[9px] leading-[11px] text-[#3b82f6] uppercase tracking-[0.05em]">
                Executing
              </span>
              <span className="font-['Inter:Regular',sans-serif] font-normal text-[9px] leading-[11px] text-[#4a5568] tabular-nums">
                {progress}%
              </span>
            </div>
            <div className="h-[3px] rounded-full overflow-hidden" style={{ backgroundColor: "rgba(59,130,246,0.12)" }}>
              <div
                className="h-full rounded-full"
                style={{
                  width: `${progress}%`,
                  backgroundColor: "#3b82f6",
                  boxShadow: "0 0 6px rgba(59,130,246,0.4)",
                  transition: "width 0.15s linear",
                }}
              />
            </div>
            <p className="font-['Inter:Regular',sans-serif] font-normal text-[10px] leading-[13px] text-[#62707D]">
              {data.expectedOutcome}
            </p>
          </div>
        )}

        {/* Complete state */}
        {data.status === "complete" && (
          <div className="flex flex-col gap-[4px]">
            <div className="flex items-center gap-[4px]">
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <circle cx="5" cy="5" r="4" fill="rgba(47,216,151,0.15)" stroke="#2fd897" strokeWidth="0.8" />
                <path d="M3 5L4.5 6.5L7 3.5" stroke="#2fd897" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="font-['Inter:Medium',sans-serif] font-medium text-[10px] leading-[13px] text-[#2fd897]">
                Completed successfully
              </span>
            </div>
            <p className="font-['Inter:Regular',sans-serif] font-normal text-[10px] leading-[14px] text-[#89949e]">
              {data.result || data.expectedOutcome}
            </p>
          </div>
        )}

        {/* Cancelled state */}
        {data.status === "cancelled" && (
          <div className="flex items-center gap-[4px]">
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <circle cx="5" cy="5" r="4" stroke="#62707D" strokeWidth="0.8" />
              <path d="M3.5 3.5L6.5 6.5M6.5 3.5L3.5 6.5" stroke="#62707D" strokeWidth="0.8" strokeLinecap="round" />
            </svg>
            <span className="font-['Inter:Medium',sans-serif] font-medium text-[10px] leading-[13px] text-[#62707D]">
              Action cancelled
            </span>
          </div>
        )}
      </div>

      {/* Action buttons */}
      {data.status === "pending" && (
        <div
          className="px-[12px] py-[8px] flex items-center gap-[8px]"
          style={{ borderTop: "1px solid rgba(14,28,38,0.6)" }}
        >
          <button
            onClick={handleRun}
            className="h-[22px] px-[10px] rounded-[5px] font-['Inter:Medium',sans-serif] font-medium text-[10px] text-white leading-[12px] cursor-pointer border-none transition-colors"
            style={{ backgroundColor: "#076498" }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = "#0879b5"; }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = "#076498"; }}
          >
            Run
          </button>
          <button
            onClick={handleModify}
            className="h-[22px] px-[10px] rounded-[5px] font-['Inter:Medium',sans-serif] font-medium text-[10px] leading-[12px] cursor-pointer border-none transition-colors"
            style={{ backgroundColor: "rgba(87,177,255,0.08)", color: "#57b1ff" }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = "rgba(87,177,255,0.14)"; }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = "rgba(87,177,255,0.08)"; }}
          >
            Modify
          </button>
          <button
            onClick={handleCancel}
            className="h-[22px] px-[8px] font-['Inter:Regular',sans-serif] font-normal text-[10px] text-[#4a5568] leading-[12px] cursor-pointer border-none bg-transparent hover:text-[#62707D] transition-colors"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Running — show cancel */}
      {data.status === "running" && (
        <div
          className="px-[12px] py-[8px] flex items-center"
          style={{ borderTop: "1px solid rgba(14,28,38,0.6)" }}
        >
          <button
            onClick={handleCancel}
            className="h-[22px] px-[8px] font-['Inter:Regular',sans-serif] font-normal text-[10px] text-[#4a5568] leading-[12px] cursor-pointer border-none bg-transparent hover:text-[#62707D] transition-colors"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
});