import React from "react";
import imgAvatar from "../assets/TeammateAvatar.png";
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
              <p className="font-['Inter:Regular',sans-serif] font-normal leading-[13px] text-[#62707D] group-hover:text-[#89949e] transition-colors text-[12px]">{s}</p>
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
export type ActionStatus =
  | "pending"
  | "awaiting-approval"
  | "approval-denied"
  | "running"
  | "complete"
  | "failed"
  | "cancelled";

export interface ActionParameter {
  label: string;
  value: string;
  editable?: boolean;
}

export type GuardrailLevel = "L1" | "L2" | "L3";

export interface ActionCardData {
  id: string;
  title: string;
  scope: ActionScope;
  parameters: ActionParameter[];
  expectedOutcome: string;
  status: ActionStatus;
  progress?: number;
  result?: string;
  /** Analysts contributing to this action (multi-agent orchestration) */
  participatingAnalysts?: string[];
  /** Guardrail classification */
  guardrailLevel?: GuardrailLevel;
  /** Level 3: requires human approval before execution */
  requiresApproval?: boolean;
  /** Short impact summary shown on the card */
  riskSummary?: string;
  /** false = current user lacks permission */
  userCanExecute?: boolean;
  /** Custom message when userCanExecute is false */
  permissionMessage?: string;
  /** true = read-only mode active, execution blocked */
  isReadOnly?: boolean;
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
  /* ── Multi-agent orchestration triggers ── */
  /reinvestigate/i,
  /re-?run\s+investigation\s+(across|for\s+all|with\s+all)/i,
  /reassess\s+(this|findings|issue|exposure|vulnerabilit)/i,
  /recalculate\s+risk\s+using/i,
  /simulate\s+(cross.?agent|impact\s+if)/i,
  /across\s+(all\s+)?(analysts?|agents?|perspectives?)/i,
  /from\s+a?\s*different\s+(lens|perspective|angle)/i,
  /comprehensive\s+(review|analysis|assessment|investigation)/i,
  /full\s+investigation/i,
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

const _L3_GUARD: RegExp[] = [
  /block\s+(ip|endpoint|user|account)/i,
  /disable\s+(account|user|token|key)/i,
  /quarantine/i,
  /isolate\s+(host|endpoint|machine|asset)/i,
  /rotate\s+(credentials?|tokens?|keys?|secrets?)/i,
  /publish\s+(workflow|playbook)/i,
  /reconnect\s+(integration|slack|jira|aws|virustotal)/i,
  /deploy\s+(patch|fix|update|hotfix)/i,
  /trigger\s+(remediation|playbook)/i,
  /escalate\s+(to|case|alert|incident)/i,
];
const _L2_GUARD: RegExp[] = [
  /re-?run/i,
  /recalculate/i,
  /reassess/i,
  /simulat/i,
  /re-?classify/i,
  /create\s+(case|ticket|incident)/i,
  /run\s+(scan|check|assessment)/i,
  /update\s+(policy|rule|baseline|config)/i,
  /trigger\s+scan/i,
  /assign\s+(analyst|owner|case)/i,
  /reinvestigate/i,
];

export function classifyGuardrailLevel(query: string): GuardrailLevel {
  if (_L3_GUARD.some(p => p.test(query))) return "L3";
  if (_L2_GUARD.some(p => p.test(query))) return "L2";
  return "L1";
}

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
      guardrailLevel: "L2",
      riskSummary: "This will refresh findings and risk scores. Downstream cases and alerts may update.",
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
        guardrailLevel: "L2",
        riskSummary: "This will update asset classification and downstream risk mappings.",
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
      guardrailLevel: "L2",
      riskSummary: "This will update composite risk scores. Downstream case priorities may change.",
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
        guardrailLevel: "L2",
        riskSummary: "Read-only simulation. No live data will be changed.",
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
    match: /re-?run\s+investigation\b(?!\s+(across|for\s+all|with\s+all))/i,
    build: (_q, agent) => ({
      id: _actionId(), title: "Re-run Investigation", scope: "investigation",
      guardrailLevel: "L2",
      riskSummary: "This will refresh investigation data and update linked findings.",
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
      const isHighImpact = /remediation|playbook/i.test(q);
      return {
        id: _actionId(), title: `Trigger ${(typeMatch?.[1] || "Scan").charAt(0).toUpperCase() + (typeMatch?.[1] || "scan").slice(1)}`, scope: "workflow",
        guardrailLevel: isHighImpact ? "L3" : "L2",
        requiresApproval: isHighImpact,
        riskSummary: isHighImpact
          ? "This triggers live system actions. Results may affect active cases and infrastructure."
          : "This will initiate a scan. No live configuration will be changed.",
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
        guardrailLevel: "L2",
        riskSummary: "A new investigation case will be created and assigned.",
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
        guardrailLevel: "L2",
        riskSummary: "This will scan all monitored assets and generate a compliance report.",
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
  {
    match: /block\s+(ip|endpoint|user|account)|disable\s+(account|user|token|key)|quarantine|isolate\s+(host|endpoint|machine|asset)/i,
    build: (q) => {
      const isBlock = /block/i.test(q);
      const isDisable = /disable/i.test(q);
      const isQuarantine = /quarantine/i.test(q);
      const title = isBlock ? "Block Access" : isDisable ? "Disable Account" : isQuarantine ? "Quarantine Asset" : "Isolate Asset";
      return {
        id: _actionId(), title, scope: "asset",
        guardrailLevel: "L3",
        requiresApproval: true,
        riskSummary: "This action changes live system access. It may disrupt active users or services and requires approval.",
        parameters: [
          { label: "Target", value: "Current selection", editable: true },
          { label: "Duration", value: "Indefinite", editable: true },
          { label: "Notify affected users", value: "Yes" },
        ],
        expectedOutcome: "Access will be restricted immediately. Affected users and systems will be notified per policy.",
        status: "pending",
      };
    },
  },
  {
    match: /rotate\s+(credentials?|tokens?|keys?|secrets?)/i,
    build: () => ({
      id: _actionId(), title: "Rotate Credentials", scope: "asset",
      guardrailLevel: "L3",
      requiresApproval: true,
      riskSummary: "This will invalidate active credentials. Affected systems may require re-authentication.",
      parameters: [
        { label: "Scope", value: "Selected credentials", editable: true },
        { label: "Notify owners", value: "Yes" },
        { label: "Force re-auth", value: "Yes", editable: true },
      ],
      expectedOutcome: "Credentials will be rotated. All active sessions using the old credentials will be invalidated.",
      status: "pending",
    }),
  },
  /* ── Multi-agent orchestration actions ── */
  {
    match: /reinvestigate|re-?run\s+investigation\s+(across|for\s+all|with\s+all)/i,
    build: (_q, agent) => ({
      id: _actionId(), title: "Re-run Investigation", scope: "investigation",
      guardrailLevel: "L2",
      riskSummary: "This will refresh investigation data across all contributing analysts. Findings and linked cases will update.",
      parameters: [
        { label: "Scope", value: "Full investigation chain", editable: true },
        { label: "Include resolved", value: "No", editable: true },
        { label: "Data freshness", value: "Latest only" },
      ],
      expectedOutcome: "Investigation chain re-executed across all contributing analysts. New correlations and updated findings will be surfaced.",
      participatingAnalysts: ["Asset Intelligence Analyst", "Vulnerability Analyst", "Exposure Analyst", "Risk Intelligence Analyst"],
      status: "pending",
    }),
  },
  {
    match: /recalculate\s+risk\s+using|reassess.*risk/i,
    build: (_q, agent) => ({
      id: _actionId(), title: "Recalculate Risk", scope: "risk",
      guardrailLevel: "L2",
      riskSummary: "This will update composite risk scores using multi-analyst inputs. Downstream case priorities may change.",
      parameters: [
        { label: "Scope", value: agent || "Current context", editable: true },
        { label: "Include threat intel", value: "Yes" },
        { label: "Recalc dependencies", value: "Yes", editable: true },
      ],
      expectedOutcome: "Composite risk score recalculated across asset, vulnerability, and exposure inputs. Downstream posture and case priorities will reflect updated values.",
      participatingAnalysts: ["Asset Intelligence Analyst", "Vulnerability Analyst", "Exposure Analyst", "Risk Intelligence Analyst"],
      status: "pending",
    }),
  },
  {
    match: /simulate\s+(cross.?agent|impact\s+if)/i,
    build: (q) => {
      const isInternetFacing = /internet.?facing/i.test(q);
      return {
        id: _actionId(), title: "Simulate Cross-Agent Impact", scope: "investigation",
        guardrailLevel: "L2",
        riskSummary: "Read-only simulation across analysts. No live data will be changed.",
        parameters: [
          { label: "Scenario", value: isInternetFacing ? "Internet-facing exposure" : "Current threat context", editable: true },
          { label: "Entry point", value: "Auto-detect from findings", editable: true },
          { label: "Max hops", value: "5", editable: true },
          { label: "Scope", value: "Production assets", editable: true },
        ],
        expectedOutcome: "Blast radius simulation across all relevant analysts. Affected assets, lateral movement paths, and business impact score will be estimated.",
        participatingAnalysts: ["Exposure Analyst", "Asset Intelligence Analyst", "Risk Intelligence Analyst"],
        status: "pending",
      };
    },
  },
  {
    match: /reassess\s+(findings|this|issue|exposure)/i,
    build: (_q, agent) => ({
      id: _actionId(), title: "Reassess Findings", scope: "investigation",
      guardrailLevel: "L2",
      riskSummary: "This will update finding classifications and associated risk ratings.",
      parameters: [
        { label: "Analyst context", value: agent || "All contributing analysts", editable: true },
        { label: "Include historical", value: "No", editable: true },
        { label: "Policy check", value: "Yes" },
      ],
      expectedOutcome: "Findings reassessed against current state. Updated classifications, risk ratings, and compliance impact will be reflected across all linked records.",
      participatingAnalysts: ["Asset Intelligence Analyst", "Vulnerability Analyst", "Exposure Analyst", "Governance & Compliance Analyst"],
      status: "pending",
    }),
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

/* ── ContributingAgentsBlock ── */

export const ContributingAgentsBlock = React.memo(function ContributingAgentsBlock({
  analysts,
}: { analysts: string[] }) {
  return (
    <div
      className="rounded-[8px] px-[12px] py-[10px] flex flex-col gap-[6px]"
      style={{ background: "rgba(4,10,16,0.7)", border: "1px solid rgba(87,177,255,0.08)" }}
    >
      <span className="font-['Inter:Medium',sans-serif] font-medium text-[9px] leading-[11px] text-[#3a4754] uppercase tracking-[0.06em]">
        Contributing Analysts
      </span>
      <div className="flex flex-col gap-[4px]">
        {analysts.map(a => (
          <div key={a} className="flex items-center gap-[6px]">
            <div
              className="w-[4px] h-[4px] rounded-full shrink-0"
              style={{ backgroundColor: "#57b1ff", opacity: 0.45 }}
            />
            <span className="font-['Inter:Regular',sans-serif] font-normal text-[10px] leading-[13px] text-[#62707D]">
              {a}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
});

/* ── ActionCard Component ── */

type AnalystPhase = "queued" | "running" | "complete";

const SCOPE_CONFIG: Record<ActionScope, { label: string; color: string; bg: string }> = {
  asset:         { label: "Asset",         color: "#1eb2c2", bg: "rgba(30,178,194,0.10)" },
  agent:         { label: "Agent",         color: "#00A46E", bg: "rgba(0,164,110,0.10)" },
  workflow:      { label: "Workflow",      color: "#3b82f6", bg: "rgba(59,130,246,0.10)" },
  investigation: { label: "Investigation", color: "#d97706", bg: "rgba(217,119,6,0.10)" },
  risk:          { label: "Risk",          color: "#9738C6", bg: "rgba(151,56,198,0.10)" },
};

export const ActionCard = React.memo(function ActionCard({
  data: initialData,
  onModify,
  onComplete,
  onFail,
}: {
  data: ActionCardData;
  onModify?: (data: ActionCardData, refinement: string) => void;
  onComplete?: (data: ActionCardData) => void;
  onFail?: (data: ActionCardData) => void;
}) {
  const [data, setData] = React.useState(initialData);
  const [progress, setProgress] = React.useState(0);
  const timerRef = React.useRef<ReturnType<typeof setInterval> | null>(null);

  /* ── Inline modify state ── */
  const [isEditing, setIsEditing] = React.useState(false);
  const [editValues, setEditValues] = React.useState<Record<string, string>>({});
  const [updateMsg, setUpdateMsg] = React.useState<string | null>(null);

  /* ── Per-analyst progress (multi-agent) ── */
  const [analystPhases, setAnalystPhases] = React.useState<Record<string, AnalystPhase>>({});

  const approvalTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(() => {
    setData(initialData);
  }, [initialData]);

  const scopeConfig = SCOPE_CONFIG[data.scope];

  const handleRun = React.useCallback(() => {
    setData(d => ({ ...d, status: "running" }));
    setProgress(0);

    /* Notify GlobalAIBox — shows status indicator */
    window.dispatchEvent(new CustomEvent("globalaibox-action-status", {
      detail: { running: true, title: data.title },
    }));

    /* Initialize per-analyst phases */
    const analysts = data.participatingAnalysts || [];
    if (analysts.length > 0) {
      const init: Record<string, AnalystPhase> = {};
      analysts.forEach((a, i) => { init[a] = i === 0 ? "running" : "queued"; });
      setAnalystPhases(init);
    }

    const duration = 3000 + Math.random() * 2000;
    const steps = 30;
    const stepMs = duration / steps;
    let step = 0;

    timerRef.current = setInterval(() => {
      step++;
      const pct = Math.min(100, Math.round((step / steps) * 100));
      setProgress(pct);

      /* Stagger analyst completions evenly across progress */
      if (analysts.length > 0) {
        setAnalystPhases(() => {
          const next: Record<string, AnalystPhase> = {};
          analysts.forEach((a, i) => {
            const completeAt = Math.round(((i + 1) / analysts.length) * 100);
            const runAt = Math.round((i / analysts.length) * 100);
            if (pct >= completeAt) {
              next[a] = "complete";
            } else if (pct >= runAt) {
              next[a] = "running";
            } else {
              next[a] = "queued";
            }
          });
          return next;
        });
      }

      if (step >= steps) {
        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = null;
        /* ~12% chance of failure to demonstrate failure handling */
        const isFailed = Math.random() < 0.12;
        setData(d => {
          const analystCount = (d.participatingAnalysts || []).length;
          if (isFailed) {
            const failedData = { ...d, status: "failed" as const, progress: 0 };
            onFail?.(failedData);
            window.dispatchEvent(new CustomEvent("globalaibox-action-status", {
              detail: { running: false, title: d.title, completed: false, failed: true, actionData: failedData },
            }));
            return failedData;
          }
          const completed = {
            ...d,
            status: "complete" as const,
            progress: 100,
            result: analystCount > 1
              ? `${d.title} completed across ${analystCount} analysts. All findings and downstream dependencies updated.`
              : `${d.title} completed. All downstream dependencies updated.`,
          };
          onComplete?.(completed);
          window.dispatchEvent(new CustomEvent("globalaibox-action-status", {
            detail: { running: false, title: d.title, completed: true, analystCount, actionData: completed },
          }));
          return completed;
        });
      }
    }, stepMs);
  }, [data.title, data.participatingAnalysts, onComplete, onFail]);

  const handleCancel = React.useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    window.dispatchEvent(new CustomEvent("globalaibox-action-status", {
      detail: { running: false, title: data.title, completed: false },
    }));
    setData(d => ({ ...d, status: "cancelled" }));
  }, [data.title]);

  /* ── Inline modify — no chat messages ── */
  const handleModify = React.useCallback(() => {
    const vals: Record<string, string> = {};
    data.parameters.filter(p => p.editable).forEach(p => { vals[p.label] = p.value; });
    setEditValues(vals);
    setIsEditing(true);
  }, [data.parameters]);

  const handleSaveEdit = React.useCallback(() => {
    const changed = data.parameters
      .filter(p => p.editable && editValues[p.label] !== undefined && editValues[p.label] !== p.value)
      .map(p => `${p.label} → ${editValues[p.label]}`);

    setData(d => ({
      ...d,
      parameters: d.parameters.map(p =>
        p.editable && editValues[p.label] !== undefined ? { ...p, value: editValues[p.label] } : p
      ),
    }));
    setIsEditing(false);

    /* Re-evaluate whether approval is needed if scope/analyst changes dramatically */
    const scopeChanged = data.parameters.some(
      p => p.editable && editValues[p.label] !== undefined && editValues[p.label] !== p.value && /scope|target|production/i.test(p.label)
    );
    if (scopeChanged && data.guardrailLevel === "L2") {
      const newValueStr = Object.values(editValues).join(" ");
      if (/production|all\s+asset|live/i.test(newValueStr)) {
        setData(d => ({ ...d, requiresApproval: true, riskSummary: (d.riskSummary || "") + " Scope updated to include production assets." }));
      }
    }

    if (changed.length > 0) {
      setUpdateMsg(`Updated: ${changed.join(" · ")}`);
      setTimeout(() => setUpdateMsg(null), 2500);
    }
  }, [data.parameters, data.guardrailLevel, editValues]);

  const handleCancelEdit = React.useCallback(() => {
    setIsEditing(false);
    setEditValues({});
  }, []);

  const handleRequestApproval = React.useCallback(() => {
    setData(d => ({ ...d, status: "awaiting-approval" }));

    /* Simulate approval granted after 3s (replace with real approval API) */
    approvalTimerRef.current = setTimeout(() => {
      setData(d => {
        if (d.status !== "awaiting-approval") return d;
        return { ...d, status: "pending", requiresApproval: false };
      });
    }, 3000);
  }, []);

  const handleDenyApproval = React.useCallback(() => {
    if (approvalTimerRef.current) {
      clearTimeout(approvalTimerRef.current);
      approvalTimerRef.current = null;
    }
    setData(d => ({ ...d, status: "approval-denied" }));
  }, []);

  React.useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (approvalTimerRef.current) clearTimeout(approvalTimerRef.current);
    };
  }, []);

  /* ── Accent color for left border stripe ── */
  const accentColor = data.status === "running"
    ? "#3b82f6"
    : data.status === "complete"
      ? "#2fd897"
      : data.status === "cancelled" || data.status === "approval-denied" || data.status === "failed"
        ? "#62707D"
        : data.status === "awaiting-approval"
          ? "#d97706"
          : data.guardrailLevel === "L3"
            ? "#d97706"
            : scopeConfig.color;

  return (
    <div
      className="rounded-[10px] overflow-hidden relative"
      style={{
        backgroundColor: "#040A10",
        border: data.status === "running"
          ? "1px solid rgba(59,130,246,0.28)"
          : data.status === "complete"
            ? "1px solid rgba(47,216,151,0.22)"
            : data.status === "cancelled" || data.status === "failed"
              ? "1px solid rgba(98,112,125,0.18)"
              : data.status === "awaiting-approval"
                ? "1px solid rgba(217,119,6,0.28)"
                : data.status === "approval-denied"
                  ? "1px solid rgba(98,112,125,0.18)"
                  : data.guardrailLevel === "L3"
                    ? "1px solid rgba(217,119,6,0.22)"
                    : `1px solid ${scopeConfig.color}28`,
        transition: "border-color 0.3s ease",
      }}
    >
      {/* Left accent stripe */}
      <div
        className="absolute left-0 top-0 bottom-0 w-[3px] rounded-l-[10px]"
        style={{ backgroundColor: accentColor, opacity: 0.7 }}
      />

      {/* Header */}
      <div
        className="pl-[15px] pr-[12px] py-[8px] flex items-center gap-[8px]"
        style={{ borderBottom: "1px solid rgba(14,28,38,0.8)" }}
      >
        {/* [ACTION] label */}
        <div
          className="flex items-center gap-[3px] px-[5px] py-[2px] rounded-[3px] shrink-0"
          style={{
            backgroundColor: data.status === "complete" ? "rgba(47,216,151,0.08)" : "rgba(59,130,246,0.08)",
            border: `1px solid ${data.status === "complete" ? "rgba(47,216,151,0.18)" : "rgba(59,130,246,0.18)"}`,
          }}
        >
          <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
            {data.status === "complete" ? (
              <path d="M1.5 4L3.2 5.7L6.5 2.3" stroke="#2fd897" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
            ) : data.status === "running" ? (
              <circle cx="4" cy="4" r="2.5" stroke="#3b82f6" strokeWidth="1" />
            ) : (
              <path d="M4 1.5V4L5.5 5.5" stroke="#3b82f6" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
            )}
          </svg>
          <span
            className="font-['Inter:Semi_Bold',sans-serif] font-semibold text-[8px] leading-[10px] uppercase tracking-[0.06em]"
            style={{ color: data.status === "complete" ? "#2fd897" : "#3b82f6" }}
          >
            {data.status === "complete" ? "Done" : data.status === "running" ? "Running" : "Action"}
          </span>
        </div>

        <span className="font-['Inter:Semi_Bold',sans-serif] font-semibold text-[11px] leading-[14px] text-[#c8d0d8] truncate flex-1">
          {data.title}
        </span>

        {/* Scope badge */}
        <div
          className="px-[5px] py-[1px] rounded-[3px] shrink-0"
          style={{ backgroundColor: scopeConfig.bg, border: `1px solid ${scopeConfig.color}20` }}
        >
          <span
            className="font-['Inter:Medium',sans-serif] font-medium text-[8px] leading-[10px] uppercase tracking-[0.04em]"
            style={{ color: scopeConfig.color }}
          >
            {scopeConfig.label}
          </span>
        </div>

        {/* Guardrail level badge */}
        {data.guardrailLevel && data.guardrailLevel !== "L1" && (
          <div
            className="px-[5px] py-[1px] rounded-[3px] shrink-0"
            style={{
              backgroundColor: data.guardrailLevel === "L3" ? "rgba(217,119,6,0.08)" : "rgba(87,177,255,0.06)",
              border: `1px solid ${data.guardrailLevel === "L3" ? "rgba(217,119,6,0.22)" : "rgba(87,177,255,0.12)"}`,
            }}
          >
            <span
              className="font-['Inter:Medium',sans-serif] font-medium text-[8px] leading-[10px] uppercase tracking-[0.04em]"
              style={{ color: data.guardrailLevel === "L3" ? "#d97706" : "#57b1ff" }}
            >
              {data.guardrailLevel === "L3" ? "Requires approval" : "Confirmation required"}
            </span>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="pl-[15px] pr-[12px] py-[10px] flex flex-col gap-[8px]">

        {/* Inline update confirmation */}
        {updateMsg && (
          <div
            className="flex items-center gap-[5px] px-[8px] py-[5px] rounded-[5px]"
            style={{ background: "rgba(47,216,151,0.06)", border: "1px solid rgba(47,216,151,0.15)" }}
          >
            <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
              <path d="M1.5 4L3 5.5L6.5 2" stroke="#2fd897" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="font-['Inter:Medium',sans-serif] font-medium text-[10px] leading-[13px] text-[#2fd897]">
              {updateMsg}
            </span>
          </div>
        )}

        {/* Risk / impact summary */}
        {data.riskSummary && data.status === "pending" && !isEditing && (
          <div
            className="flex items-start gap-[5px] px-[8px] py-[5px] rounded-[5px]"
            style={{ background: "rgba(87,177,255,0.04)", border: "1px solid rgba(87,177,255,0.08)" }}
          >
            <svg width="9" height="9" viewBox="0 0 9 9" fill="none" className="shrink-0 mt-[2px]">
              <circle cx="4.5" cy="4.5" r="3.5" stroke="#57b1ff" strokeWidth="0.8" opacity="0.5" />
              <path d="M4.5 3v2M4.5 6v.5" stroke="#57b1ff" strokeWidth="0.8" strokeLinecap="round" opacity="0.5" />
            </svg>
            <span className="font-['Inter:Regular',sans-serif] font-normal text-[10px] leading-[14px] text-[#4a5a6a]">
              {data.riskSummary}
            </span>
          </div>
        )}

        {/* Risk summary — shown in awaiting-approval state too */}
        {data.riskSummary && data.status === "awaiting-approval" && (
          <div
            className="flex items-start gap-[5px] px-[8px] py-[5px] rounded-[5px]"
            style={{ background: "rgba(217,119,6,0.04)", border: "1px solid rgba(217,119,6,0.10)" }}
          >
            <svg width="9" height="9" viewBox="0 0 9 9" fill="none" className="shrink-0 mt-[2px]">
              <circle cx="4.5" cy="4.5" r="3.5" stroke="#d97706" strokeWidth="0.8" opacity="0.6" />
              <path d="M4.5 3v2M4.5 6v.5" stroke="#d97706" strokeWidth="0.8" strokeLinecap="round" opacity="0.6" />
            </svg>
            <span className="font-['Inter:Regular',sans-serif] font-normal text-[10px] leading-[14px] text-[#4a5a6a]">
              {data.riskSummary}
            </span>
          </div>
        )}

        {/* Participating analysts (multi-agent) — pending state */}
        {!isEditing && data.status === "pending" && data.participatingAnalysts && data.participatingAnalysts.length > 0 && (
          <div className="flex flex-col gap-[4px]">
            <span className="font-['Inter:Medium',sans-serif] font-medium text-[9px] leading-[11px] text-[#3a4754] uppercase tracking-[0.05em]">
              Participating Analysts
            </span>
            {data.participatingAnalysts.map(a => (
              <div key={a} className="flex items-center gap-[5px]">
                <div className="w-[4px] h-[4px] rounded-full shrink-0" style={{ backgroundColor: "#57b1ff", opacity: 0.4 }} />
                <span className="font-['Inter:Regular',sans-serif] font-normal text-[10px] leading-[13px] text-[#62707D]">{a}</span>
              </div>
            ))}
          </div>
        )}

        {/* Parameters — view mode (Key → Value format) */}
        {!isEditing && data.status !== "complete" && data.status !== "cancelled" && (
          <div className="flex flex-col gap-[5px]">
            <span className="font-['Inter:Medium',sans-serif] font-medium text-[9px] leading-[11px] text-[#3a4754] uppercase tracking-[0.05em]">
              Parameters
            </span>
            {data.parameters.map((p, i) => (
              <div key={i} className="flex items-center gap-[5px]">
                <span className="font-['Inter:Regular',sans-serif] font-normal text-[9px] leading-[12px] text-[#3a4754]">•</span>
                <span className="font-['Inter:Regular',sans-serif] font-normal text-[10px] leading-[13px] text-[#62707D] shrink-0">
                  {p.label}
                </span>
                <span className="font-['Inter:Regular',sans-serif] text-[10px] text-[#3a4754] mx-[2px]">→</span>
                <span
                  className="font-['Inter:Medium',sans-serif] font-medium text-[10px] leading-[13px] text-[#89949e] truncate"
                  style={p.editable ? { borderBottom: "1px dashed rgba(87,177,255,0.18)" } : undefined}
                >
                  {p.value}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Parameters — edit mode */}
        {isEditing && (
          <div className="flex flex-col gap-[6px]">
            <span className="font-['Inter:Medium',sans-serif] font-medium text-[9px] leading-[11px] text-[#57b1ff] uppercase tracking-[0.05em]">
              Edit Parameters
            </span>
            {data.parameters.filter(p => p.editable).map((p, i) => (
              <div key={i} className="flex flex-col gap-[3px]">
                <span className="font-['Inter:Regular',sans-serif] font-normal text-[9px] leading-[12px] text-[#62707D]">
                  {p.label}
                </span>
                <input
                  type="text"
                  value={editValues[p.label] ?? p.value}
                  onChange={e => setEditValues(v => ({ ...v, [p.label]: e.target.value }))}
                  className="w-full rounded-[4px] px-[8px] py-[4px] font-['Inter:Regular',sans-serif] font-normal text-[10px] leading-[13px] text-[#c8d0d8] outline-none"
                  style={{
                    background: "rgba(87,177,255,0.04)",
                    border: "1px solid rgba(87,177,255,0.18)",
                  }}
                />
              </div>
            ))}
          </div>
        )}

        {/* Expected outcome */}
        {!isEditing && data.status === "pending" && (
          <div className="flex flex-col gap-[3px]">
            <span className="font-['Inter:Medium',sans-serif] font-medium text-[9px] leading-[11px] text-[#3a4754] uppercase tracking-[0.05em]">
              Expected Outcome
            </span>
            <p className="font-['Inter:Regular',sans-serif] font-normal text-[10px] leading-[14px] text-[#4a5a6a]">
              {data.expectedOutcome}
            </p>
          </div>
        )}

        {/* Running state */}
        {data.status === "running" && (
          <div className="flex flex-col gap-[6px]">
            <div className="flex items-center justify-between">
              <span className="font-['Inter:Medium',sans-serif] font-medium text-[9px] leading-[11px] text-[#3b82f6] uppercase tracking-[0.05em]">
                {data.participatingAnalysts && data.participatingAnalysts.length > 1 ? "Running multi-agent investigation..." : "Executing"}
              </span>
              <span className="font-['Inter:Regular',sans-serif] font-normal text-[9px] leading-[11px] text-[#3a4754] tabular-nums">
                {progress}%
              </span>
            </div>
            <div className="h-[3px] rounded-full overflow-hidden" style={{ backgroundColor: "rgba(59,130,246,0.10)" }}>
              <div
                className="h-full rounded-full"
                style={{
                  width: `${progress}%`,
                  backgroundColor: "#3b82f6",
                  boxShadow: "0 0 6px rgba(59,130,246,0.35)",
                  transition: "width 0.15s linear",
                }}
              />
            </div>
            {/* Per-analyst progress (multi-agent) */}
            {data.participatingAnalysts && data.participatingAnalysts.length > 0 && (
              <div className="flex flex-col gap-[3px] mt-[2px]">
                {data.participatingAnalysts.map(a => {
                  const phase = analystPhases[a] || "queued";
                  return (
                    <div key={a} className="flex items-center gap-[6px]">
                      <div
                        className="w-[5px] h-[5px] rounded-full shrink-0"
                        style={{
                          backgroundColor: phase === "complete" ? "#2fd897" : phase === "running" ? "#3b82f6" : "#3a4754",
                          boxShadow: phase === "running" ? "0 0 4px rgba(59,130,246,0.5)" : "none",
                        }}
                      />
                      <span
                        className="font-['Inter:Regular',sans-serif] font-normal text-[9px] leading-[12px]"
                        style={{ color: phase === "complete" ? "#62707D" : phase === "running" ? "#89949e" : "#3a4754" }}
                      >
                        {phase === "complete" ? `${a} complete` : phase === "running" ? a : a}
                      </span>
                      {phase === "complete" && (
                        <svg width="8" height="8" viewBox="0 0 8 8" fill="none" className="shrink-0">
                          <path d="M1.5 4L3 5.5L6.5 2" stroke="#2fd897" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Awaiting approval state */}
        {data.status === "awaiting-approval" && (
          <div className="flex flex-col gap-[6px]">
            <div className="flex items-center gap-[5px]">
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none" className="shrink-0">
                <circle cx="5" cy="5" r="4" stroke="#d97706" strokeWidth="0.8" />
                <path d="M5 3v2.5l1.5 1" stroke="#d97706" strokeWidth="0.8" strokeLinecap="round" />
              </svg>
              <span className="font-['Inter:Medium',sans-serif] font-medium text-[10px] leading-[13px] text-[#d97706]">
                Approval requested
              </span>
            </div>
            <p className="font-['Inter:Regular',sans-serif] font-normal text-[10px] leading-[14px] text-[#4a5568]">
              Waiting for a manager or administrator to approve this action. You will be notified when a decision is made.
            </p>
          </div>
        )}

        {/* Approval denied state */}
        {data.status === "approval-denied" && (
          <div className="flex flex-col gap-[4px]">
            <div className="flex items-center gap-[4px]">
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <circle cx="5" cy="5" r="4" stroke="#62707D" strokeWidth="0.8" />
                <path d="M3.5 3.5L6.5 6.5M6.5 3.5L3.5 6.5" stroke="#62707D" strokeWidth="0.8" strokeLinecap="round" />
              </svg>
              <span className="font-['Inter:Medium',sans-serif] font-medium text-[10px] leading-[13px] text-[#62707D]">
                Approval declined
              </span>
            </div>
            <p className="font-['Inter:Regular',sans-serif] font-normal text-[10px] leading-[14px] text-[#4a5568]">
              This request was not approved. Contact your security manager if you believe this is incorrect.
            </p>
          </div>
        )}

        {/* Failed state */}
        {data.status === "failed" && (
          <div className="flex flex-col gap-[4px]">
            <div className="flex items-center gap-[4px]">
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <circle cx="5" cy="5" r="4" fill="rgba(239,68,68,0.08)" stroke="rgba(239,68,68,0.5)" strokeWidth="0.8" />
                <path d="M3.5 3.5L6.5 6.5M6.5 3.5L3.5 6.5" stroke="rgba(239,68,68,0.7)" strokeWidth="0.8" strokeLinecap="round" />
              </svg>
              <span className="font-['Inter:Medium',sans-serif] font-medium text-[10px] leading-[13px]" style={{ color: "rgba(239,68,68,0.7)" }}>
                Action could not be completed
              </span>
            </div>
            <p className="font-['Inter:Regular',sans-serif] font-normal text-[10px] leading-[14px] text-[#4a5568]">
              Execution failed before completion. Please try again or contact support.
            </p>
          </div>
        )}

        {/* Permission denied */}
        {data.userCanExecute === false && data.status === "pending" && (
          <div
            className="flex items-center gap-[5px] px-[8px] py-[5px] rounded-[5px]"
            style={{ background: "rgba(98,112,125,0.06)", border: "1px solid rgba(98,112,125,0.14)" }}
          >
            <svg width="9" height="9" viewBox="0 0 9 9" fill="none" className="shrink-0">
              <circle cx="4.5" cy="4.5" r="3.5" stroke="#62707D" strokeWidth="0.8" />
              <path d="M3 4.5h3" stroke="#62707D" strokeWidth="0.8" strokeLinecap="round" />
            </svg>
            <span className="font-['Inter:Regular',sans-serif] font-normal text-[10px] leading-[13px] text-[#4a5568]">
              {data.permissionMessage || "You do not have permission to perform this action."}
            </span>
          </div>
        )}

        {/* Read-only mode block */}
        {data.isReadOnly && data.status === "pending" && (
          <div
            className="flex items-center gap-[5px] px-[8px] py-[5px] rounded-[5px]"
            style={{ background: "rgba(98,112,125,0.06)", border: "1px solid rgba(98,112,125,0.14)" }}
          >
            <svg width="9" height="9" viewBox="0 0 9 9" fill="none" className="shrink-0">
              <rect x="2" y="4" width="5" height="3.5" rx="0.5" stroke="#62707D" strokeWidth="0.7" />
              <path d="M3 4V3a1.5 1.5 0 013 0v1" stroke="#62707D" strokeWidth="0.7" />
            </svg>
            <span className="font-['Inter:Regular',sans-serif] font-normal text-[10px] leading-[13px] text-[#4a5568]">
              This action is unavailable in read-only mode.
            </span>
          </div>
        )}

        {/* Complete state */}
        {data.status === "complete" && (
          <div className="flex flex-col gap-[4px]">
            <div className="flex items-center gap-[4px]">
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <circle cx="5" cy="5" r="4" fill="rgba(47,216,151,0.12)" stroke="#2fd897" strokeWidth="0.8" />
                <path d="M3 5L4.5 6.5L7 3.5" stroke="#2fd897" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="font-['Inter:Medium',sans-serif] font-medium text-[10px] leading-[13px] text-[#2fd897]">
                Completed
              </span>
            </div>
            <p className="font-['Inter:Regular',sans-serif] font-normal text-[10px] leading-[14px] text-[#62707D]">
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
            <span className="font-['Inter:Medium',sans-serif] font-medium text-[10px] leading-[13px] text-[#4a5568]">
              Action cancelled
            </span>
          </div>
        )}
      </div>

      {/* Footer buttons — pending (view mode) */}
      {data.status === "pending" && !isEditing && !data.isReadOnly && data.userCanExecute !== false && (
        <div
          className="pl-[15px] pr-[12px] py-[8px] flex items-center gap-[8px]"
          style={{ borderTop: "1px solid rgba(14,28,38,0.8)" }}
        >
          {data.requiresApproval ? (
            <>
              <button
                onClick={handleRequestApproval}
                className="h-[24px] px-[12px] rounded-[5px] font-['Inter:Medium',sans-serif] font-medium text-[10px] leading-[12px] cursor-pointer border-none transition-colors"
                style={{ backgroundColor: "rgba(217,119,6,0.15)", color: "#d97706", border: "1px solid rgba(217,119,6,0.28)" }}
                onMouseEnter={e => { e.currentTarget.style.backgroundColor = "rgba(217,119,6,0.22)"; }}
                onMouseLeave={e => { e.currentTarget.style.backgroundColor = "rgba(217,119,6,0.15)"; }}
              >
                Request Approval
              </button>
              <button
                onClick={handleCancel}
                className="h-[24px] px-[8px] font-['Inter:Regular',sans-serif] font-normal text-[10px] text-[#3a4754] leading-[12px] cursor-pointer border-none bg-transparent transition-colors"
                onMouseEnter={e => { e.currentTarget.style.color = "#62707D"; }}
                onMouseLeave={e => { e.currentTarget.style.color = "#3a4754"; }}
              >
                Cancel
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleRun}
                className="h-[24px] px-[12px] rounded-[5px] font-['Inter:Medium',sans-serif] font-medium text-[10px] text-white leading-[12px] cursor-pointer border-none transition-colors"
                style={{ backgroundColor: "#076498" }}
                onMouseEnter={e => { e.currentTarget.style.backgroundColor = "#0879b5"; }}
                onMouseLeave={e => { e.currentTarget.style.backgroundColor = "#076498"; }}
              >
                Run
              </button>
              <button
                onClick={handleModify}
                className="h-[24px] px-[10px] rounded-[5px] font-['Inter:Medium',sans-serif] font-medium text-[10px] leading-[12px] cursor-pointer border-none transition-colors"
                style={{ backgroundColor: "rgba(87,177,255,0.07)", color: "#57b1ff", border: "1px solid rgba(87,177,255,0.14)" }}
                onMouseEnter={e => { e.currentTarget.style.backgroundColor = "rgba(87,177,255,0.13)"; }}
                onMouseLeave={e => { e.currentTarget.style.backgroundColor = "rgba(87,177,255,0.07)"; }}
              >
                Modify
              </button>
              <button
                onClick={handleCancel}
                className="h-[24px] px-[8px] font-['Inter:Regular',sans-serif] font-normal text-[10px] text-[#3a4754] leading-[12px] cursor-pointer border-none bg-transparent transition-colors"
                onMouseEnter={e => { e.currentTarget.style.color = "#62707D"; }}
                onMouseLeave={e => { e.currentTarget.style.color = "#3a4754"; }}
              >
                Cancel
              </button>
            </>
          )}
        </div>
      )}

      {/* Footer — awaiting approval */}
      {data.status === "awaiting-approval" && (
        <div
          className="pl-[15px] pr-[12px] py-[8px] flex items-center gap-[8px]"
          style={{ borderTop: "1px solid rgba(14,28,38,0.8)" }}
        >
          <button
            onClick={handleDenyApproval}
            className="h-[24px] px-[8px] font-['Inter:Regular',sans-serif] font-normal text-[10px] text-[#3a4754] leading-[12px] cursor-pointer border-none bg-transparent transition-colors"
            onMouseEnter={e => { e.currentTarget.style.color = "#62707D"; }}
            onMouseLeave={e => { e.currentTarget.style.color = "#3a4754"; }}
          >
            Cancel request
          </button>
        </div>
      )}

      {/* Footer — approval denied */}
      {data.status === "approval-denied" && (
        <div
          className="pl-[15px] pr-[12px] py-[8px] flex items-center"
          style={{ borderTop: "1px solid rgba(14,28,38,0.8)" }}
        >
          <button
            onClick={handleCancel}
            className="h-[24px] px-[8px] font-['Inter:Regular',sans-serif] font-normal text-[10px] text-[#3a4754] leading-[12px] cursor-pointer border-none bg-transparent transition-colors"
            onMouseEnter={e => { e.currentTarget.style.color = "#62707D"; }}
            onMouseLeave={e => { e.currentTarget.style.color = "#3a4754"; }}
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Footer buttons — edit mode */}
      {data.status === "pending" && isEditing && (
        <div
          className="pl-[15px] pr-[12px] py-[8px] flex items-center gap-[8px]"
          style={{ borderTop: "1px solid rgba(87,177,255,0.08)" }}
        >
          <button
            onClick={handleSaveEdit}
            className="h-[24px] px-[12px] rounded-[5px] font-['Inter:Medium',sans-serif] font-medium text-[10px] text-white leading-[12px] cursor-pointer border-none transition-colors"
            style={{ backgroundColor: "#076498" }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = "#0879b5"; }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = "#076498"; }}
          >
            Save
          </button>
          <button
            onClick={handleCancelEdit}
            className="h-[24px] px-[8px] font-['Inter:Regular',sans-serif] font-normal text-[10px] text-[#3a4754] leading-[12px] cursor-pointer border-none bg-transparent transition-colors"
            onMouseEnter={e => { e.currentTarget.style.color = "#62707D"; }}
            onMouseLeave={e => { e.currentTarget.style.color = "#3a4754"; }}
          >
            Cancel
          </button>
        </div>
      )}

      {/* Running — show cancel */}
      {data.status === "running" && (
        <div
          className="pl-[15px] pr-[12px] py-[8px] flex items-center"
          style={{ borderTop: "1px solid rgba(14,28,38,0.8)" }}
        >
          <button
            onClick={handleCancel}
            className="h-[24px] px-[8px] font-['Inter:Regular',sans-serif] font-normal text-[10px] text-[#3a4754] leading-[12px] cursor-pointer border-none bg-transparent transition-colors"
            onMouseEnter={e => { e.currentTarget.style.color = "#62707D"; }}
            onMouseLeave={e => { e.currentTarget.style.color = "#3a4754"; }}
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
});

/* ═══════════════════════════════════════════════════════════
   ACTION RESULT PROPAGATION
   — Types, derivation helpers, and UI components for
     showing "What changed" after an AI action completes.
   ═══════════════════════════════════════════════════════════ */

export type ActionResultType =
  | "findings_updated"
  | "risk_score_updated"
  | "asset_classification_changed"
  | "attack_path_refreshed"
  | "workflow_health_updated"
  | "run_status_changed"
  | "integration_state_changed"
  | "case_linkage_created";

export interface ActionResultData {
  resultType: ActionResultType;
  bullets: string[];
  before?: Record<string, string>;
  after?: Record<string, string>;
  unchanged?: Record<string, string>;
  changeState: "changed" | "partial" | "no-change";
  whyItChanged?: string;
  nextActions: string[];
  analysts?: string[];
}

export interface ActionFailureInfo {
  reason: string;
  impact: string;
  nextActions: string[];
}

/** Derive a structured result summary from a completed ActionCardData */
export function deriveActionResult(data: ActionCardData): ActionResultData {
  const t = data.title;
  const analysts = data.participatingAnalysts;

  if (/re-?run analysis|re-?run investigation/i.test(t)) {
    return {
      resultType: "findings_updated",
      changeState: "changed",
      bullets: [
        "Analysis cycle completed successfully",
        "Findings refreshed with latest data",
        "Risk scores updated across linked records",
        "Downstream cases and alerts synchronized",
      ],
      before: { "Severity": "Medium", "Finding Count": "14", "Last Analyzed": "6 days ago" },
      after: { "Severity": "High", "Finding Count": "19", "Last Analyzed": "Just now" },
      whyItChanged: "Five new indicators emerged from updated threat intelligence feeds since the previous cycle. Severity elevated because three of the new findings match active campaign patterns.",
      nextActions: ["View updated findings", "Recalculate risk score", "Create case from findings"],
      analysts,
    };
  }

  if (/recalculate risk/i.test(t)) {
    return {
      resultType: "risk_score_updated",
      changeState: "changed",
      bullets: [
        "Composite risk score recalculated",
        "Asset criticality and threat intelligence incorporated",
        "Downstream case priorities updated",
      ],
      before: { "Risk Score": "High (78/100)", "Priority": "Standard" },
      after: { "Risk Score": "Critical (91/100)", "Priority": "Elevated" },
      whyItChanged: "Three high-criticality assets were recently added to the blast radius, and the threat actor associated with this campaign escalated activity in the last 48 hours.",
      nextActions: ["View risk breakdown", "Review affected assets", "Create remediation case"],
      analysts,
    };
  }

  if (/re-?classify asset/i.test(t)) {
    return {
      resultType: "asset_classification_changed",
      changeState: "changed",
      bullets: [
        "Asset classification updated",
        "CMDB metadata refreshed",
        "Downstream risk and compliance mappings updated",
      ],
      before: { "Classification": "Internal Asset", "Exposure": "Low", "Compliance Scope": "Out of scope" },
      after: { "Classification": "Production Service", "Exposure": "External", "Compliance Scope": "PCI-DSS" },
      whyItChanged: "The asset was found to be reachable from the public internet via a recently exposed endpoint, and its data flows match production service criteria under the current classification policy.",
      nextActions: ["View updated asset", "Review compliance impact", "Re-run risk analysis"],
      analysts,
    };
  }

  if (/simulate/i.test(t)) {
    return {
      resultType: "attack_path_refreshed",
      changeState: "changed",
      bullets: [
        "Blast radius simulation complete",
        "Affected assets and lateral movement paths mapped",
        "Business impact estimated across analyst inputs",
      ],
      before: { "Blast Radius": "Not calculated", "Hops to Domain Admin": "Unknown" },
      after: { "Business Impact": "High", "Blast Radius": "12 assets", "Hops to Domain Admin": "3" },
      whyItChanged: "Simulation identified a chain of misconfigured trust relationships that allows lateral movement from the initial foothold to privileged infrastructure in three hops.",
      nextActions: ["Review simulation results", "Recalculate risk with simulation data", "Restrict access to affected assets"],
      analysts,
    };
  }

  if (/reassess findings/i.test(t)) {
    return {
      resultType: "findings_updated",
      changeState: "partial",
      bullets: [
        "Findings reassessed against current state",
        "Two of five findings updated with revised ratings",
        "Three findings confirmed — no material change detected",
      ],
      before: { "Critical Findings": "1", "High Findings": "4" },
      after: { "Critical Findings": "3", "High Findings": "2" },
      unchanged: { "Medium Findings": "7", "Compliance Status": "Non-compliant" },
      whyItChanged: "Two previously high-severity findings were reclassified as critical due to new exploitation evidence. The remaining findings had no new data available to revise their ratings.",
      nextActions: ["View updated findings", "Review changed risk ratings", "Create case from high-severity findings"],
      analysts,
    };
  }

  if (/create case|create ticket|create incident/i.test(t)) {
    return {
      resultType: "case_linkage_created",
      changeState: "changed",
      bullets: [
        "Investigation case created and linked",
        "Analyst assigned and notified",
        "Current findings attached to the case",
      ],
      before: { "Case Status": "None" },
      after: { "Case Status": "Open", "Assigned To": "SOC Tier 1" },
      whyItChanged: "Case created from the current finding set to begin formal investigation and ensure findings are tracked through to resolution.",
      nextActions: ["View created case", "Add findings to case", "Assign additional analyst"],
      analysts,
    };
  }

  if (/block|disable|quarantine|isolate/i.test(t)) {
    return {
      resultType: "run_status_changed",
      changeState: "changed",
      bullets: [
        `${t} executed successfully`,
        "Access and session changes applied",
        "Affected users and systems notified",
        "Event recorded in audit trail",
      ],
      before: { "Access Status": "Active" },
      after: { "Access Status": "Restricted", "Audit Log": "Updated" },
      whyItChanged: "Action applied immediately to all matched targets. Sessions were terminated and access policies updated to prevent re-entry until manually reviewed.",
      nextActions: ["View audit log", "Monitor affected systems", "Review blast radius"],
      analysts,
    };
  }

  if (/rotate credentials/i.test(t)) {
    return {
      resultType: "run_status_changed",
      changeState: "changed",
      bullets: [
        "Credentials rotated successfully",
        "Active sessions invalidated",
        "Credential owners notified",
        "Event recorded in audit trail",
      ],
      before: { "Credential Status": "Active (stale)", "Last Rotated": "94 days ago" },
      after: { "Credential Status": "Rotated", "Last Rotated": "Just now" },
      whyItChanged: "Credentials exceeded the maximum rotation window and were flagged for potential compromise based on exposure indicators in the current investigation.",
      nextActions: ["Monitor re-authentication", "Update dependent systems", "View audit log"],
      analysts,
    };
  }

  if (/trigger scan|run.*scan|compliance check/i.test(t)) {
    return {
      resultType: "findings_updated",
      changeState: "no-change",
      bullets: [
        "Scan completed successfully",
        "No material differences detected since the last cycle",
        "All previously identified findings remain unchanged",
      ],
      unchanged: { "Finding Count": "14", "Risk Score": "High (78/100)", "Compliance Status": "Non-compliant" },
      whyItChanged: "The scan ran against the same configuration and data as the previous cycle. No new indicators, asset changes, or threat intelligence updates were available to alter the results.",
      nextActions: ["View scan results", "Export report", "Create case for findings"],
      analysts,
    };
  }

  if (/workflow diagnostics|health check|run diagnostics/i.test(t)) {
    return {
      resultType: "workflow_health_updated",
      changeState: "partial",
      bullets: [
        "Workflow diagnostics completed",
        "Two integrations returned degraded status",
        "Notification delivery confirmed on three of five steps",
      ],
      before: { "Workflow Health": "Unknown", "Failed Steps": "Unknown" },
      after: { "Workflow Health": "Degraded", "Failed Steps": "2" },
      unchanged: { "Passing Steps": "3", "Trigger Config": "Valid" },
      whyItChanged: "Two downstream integration endpoints returned authentication failures during the diagnostic sweep. The workflow can partially execute but cannot complete the full sequence.",
      nextActions: ["View failing steps", "Reconnect integrations", "Re-run after fixing"],
      analysts,
    };
  }

  if (/reconnect|integration/i.test(t)) {
    return {
      resultType: "integration_state_changed",
      changeState: "changed",
      bullets: [
        "Integration reconnected successfully",
        "Authentication handshake completed",
        "Pending workflow notifications queued for delivery",
      ],
      before: { "Integration Status": "Disconnected", "Pending Notifications": "8" },
      after: { "Integration Status": "Connected", "Pending Notifications": "Queued" },
      whyItChanged: "The integration token was refreshed and the endpoint responded with a valid handshake. Queued notifications will be delivered on the next workflow run.",
      nextActions: ["Verify delivery", "Re-run workflow", "Check notification history"],
      analysts,
    };
  }

  /* Generic fallback */
  return {
    resultType: "findings_updated",
    changeState: "changed",
    bullets: [
      `${t} completed successfully`,
      "All downstream dependencies updated",
      "Results are now available",
    ],
    whyItChanged: "The action ran to completion and applied all requested changes to the current state.",
    nextActions: ["View updated results", "Create case from findings", "Re-run from another lens"],
    analysts,
  };
}

/** Derive a structured failure description from a failed ActionCardData */
export function deriveActionFailure(data: ActionCardData): ActionFailureInfo {
  const t = data.title;

  if (/reconnect|integration/i.test(t) || data.scope === "workflow") {
    return {
      reason: "The integration could not be reconnected due to an authentication error.",
      impact: "Workflow notifications remain blocked. Affected steps cannot deliver results.",
      nextActions: ["Retry connection", "Check credentials in Settings", "Contact your Slack admin"],
    };
  }
  if (/recalculate risk/i.test(t)) {
    return {
      reason: "Risk recalculation encountered incomplete data from one or more analysts.",
      impact: "Risk scores remain from the previous cycle. Downstream case priorities are unchanged.",
      nextActions: ["Retry with current data", "Review data source health", "Re-run after fixing sources"],
    };
  }
  if (/re-?run analysis|re-?run investigation/i.test(t)) {
    return {
      reason: "The analysis engine could not complete the cycle due to a data source timeout.",
      impact: "Findings may be outdated. Previous results remain visible.",
      nextActions: ["Retry analysis", "Check integration connectivity", "Contact support"],
    };
  }
  if (/block|disable|rotate|quarantine|isolate/i.test(t)) {
    return {
      reason: "The action could not be applied to one or more targets due to a permission error.",
      impact: "System access remains unchanged. No configuration was modified.",
      nextActions: ["Review required permissions", "Request elevated access", "Try a narrower scope"],
    };
  }
  return {
    reason: "The action could not be completed due to an unexpected error.",
    impact: "No changes were applied. System state is unchanged.",
    nextActions: ["Retry the action", "Check system status", "Contact support"],
  };
}

/* ── ActionResultCard — Before/After comparison shown in AIBox after completion ── */

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
            <span className="font-['Inter:Regular',sans-serif] font-normal text-[10px] leading-[14px] text-[#62707D]">
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
            <span className="font-['Inter:Medium',sans-serif] font-medium text-[9px] leading-[11px] text-[#3a4754] uppercase tracking-[0.05em]">
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
                style={{ color: "#3a4754", minWidth: 90 }}
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
          <span className="font-['Inter:Medium',sans-serif] font-medium text-[9px] leading-[11px] text-[#3a4754] uppercase tracking-[0.05em]">
            Unchanged
          </span>
          {unchangedPairs.map(([key, val]) => (
            <div key={key} className="flex items-center gap-[5px] min-w-0">
              <span
                className="font-['Inter:Regular',sans-serif] font-normal text-[9px] leading-[12px] shrink-0"
                style={{ color: "#3a4754", minWidth: 90 }}
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
              <span className="font-['Inter:Medium',sans-serif] font-medium text-[9px] leading-[11px] text-[#3a4754] uppercase tracking-[0.05em]">
                Why it changed
              </span>
              <p className="font-['Inter:Regular',sans-serif] font-normal text-[10px] leading-[14px] text-[#62707D]">
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
          <span className="font-['Inter:Medium',sans-serif] font-medium text-[9px] leading-[11px] text-[#3a4754] uppercase tracking-[0.05em]">
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
        <span className="font-['Inter:Medium',sans-serif] font-medium text-[9px] leading-[11px] text-[#3a4754] uppercase tracking-[0.05em]">
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
        <p className="font-['Inter:Regular',sans-serif] font-normal text-[10px] leading-[14px] text-[#62707D]">
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
        <span className="font-['Inter:Medium',sans-serif] font-medium text-[9px] leading-[11px] text-[#3a4754] uppercase tracking-[0.05em]">
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