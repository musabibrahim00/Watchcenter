import React from "react";
import { useNavigate } from "react-router";
import svgPaths from "./svg-sx6d9u7tbs";
import imgOld from "../assets/TeammateAvatar.png";
import { buildAndRenderAiResponse, buildActionResponse, buildTaskInvestigation, extractContext, renderAiResponse, EMPTY_CONTEXT, ACTION_NAVIGATION, type InteractionContext } from "./AiBoxRenderer";
import { AiBoxActionProvider, FallbackSuggestion, SuccessConfirmation, ResponseContext, InsightCard } from "./AiBoxModules";
import { getRankedProactiveScenarios, type ProactiveScenario } from "./AiBoxLiveData";
import { useTaskInvestigation } from "./TaskInvestigationBridge";
import {
  type ChatMessage,
  type TaskNode,
  type TaskGraph,
  isCasual,
  CASUAL_RESPS,
  getResponseContextLabel,
  getSuccessState,
  TypingIndicator,
  MessageBubble as SharedMessageBubble,
  WelcomeScreen as SharedWelcomeScreen,
  ChatInput as SharedChatInput,
  classifyActionIntent,
  matchAction,
  ActionCard,
  type ActionCardData,
} from "./AiBoxShared";

/* ═══════════════════════════════════════════════════════════
   Intent Classification
   ═══════════════════════════════════════════════════════════ */

type Intent = "insights" | "timeline" | "metrics" | "decisions" | "analyst"
            | "threat" | "incident" | "compliance" | "status" | "vulnerability" | "identity" | "agent" | "help" | "default"
            | "riskChart" | "vulnChart" | "attackPathChart" | "assetChart";

const INTENT_PATTERNS: { intent: Intent; patterns: RegExp[] }[] = [
  { intent: "insights", patterns: [
    /what.*(needs?|requires?)\s+attention/i, /what.?s\s+(urgent|critical|flagged|wrong)/i,
    /anything\s+(critical|urgent|important)/i, /top\s+(risks?|priorities|issues)/i,
    /what\s+should\s+i\s+(worry|know|focus)/i, /priority\s+(items?|issues?|findings?)/i,
    /needs?\s+(attention|review|action)/i, /high.?priority/i,
  ]},
  { intent: "timeline", patterns: [
    /what\s+(happened|occurred)/i, /show\s+(me\s+)?(the\s+)?(timeline|events?|sequence|history)/i,
    /recent\s+(events?|activity|actions?)/i, /chain\s+of\s+events/i,
    /incident\s+timeline/i, /walk\s+me\s+through/i, /what\s+took\s+place/i,
    /sequence\s+of/i, /step\s+by\s+step/i,
  ]},
  { intent: "metrics", patterns: [
    /what\s+did\s+(the\s+)?(system|agents?)\s+do/i, /show\s+(me\s+)?(metrics|numbers|stats|kpis?)/i,
    /performance\s+(summary|report|overview)/i, /daily\s+(summary|report|overview)/i,
    /today.?s\s+(numbers|stats|summary|metrics)/i, /operational\s+(summary|metrics|stats)/i,
    /give\s+me\s+(a\s+)?(summary|overview|report)/i, /how\s+(are|is)\s+(things|everything)\s+(going|doing|looking)/i,
  ]},
  { intent: "decisions", patterns: [
    /what\s+should\s+i\s+approve/i, /pending\s+(approval|review|decision)/i,
    /awaiting\s+(approval|authorization|review)/i, /needs?\s+my\s+(approval|sign.?off|authorization)/i,
    /action\s+items?/i, /approve|authorize/i, /what.?s\s+pending/i,
    /review\s+queue/i, /decisions?\s+(pending|queue|waiting)/i,
  ]},
  { intent: "analyst", patterns: [
    /show\s+(me\s+)?(analyst|agent)\s+(reasoning|logic|thinking)/i,
    /why\s+did\s+(the\s+)?(agent|analyst|system)/i, /explain\s+(the\s+)?(reasoning|decision|logic|action)/i,
    /how\s+did\s+(the\s+)?(agent|analyst|system)\s+(decide|determine|reach)/i,
    /decision\s+(rationale|audit|trail)/i, /evidence\s+(chain|trail)/i,
    /confidence\s+(score|breakdown|detail)/i, /what\s+was\s+the\s+(reasoning|logic|basis)/i,
    /justification/i, /thinking\s+behind/i,
  ]},
  { intent: "riskChart", patterns: [
    /risk\s*(trend|graph|chart|score\s*over|posture\s*over|history)/i,
    /show\s*(me\s*)?(a\s*)?(risk|threat)\s*(trend|graph|chart)/i,
    /risk\s*(analysis\s*)?(visual|graph|chart|plot)/i,
    /how\s+(has|have)\s+(the\s+)?risk/i,
  ]},
  { intent: "vulnChart", patterns: [
    /vuln\w*\s*(distribution|breakdown|chart|graph|by\s*severity)/i,
    /show\s*(me\s*)?(a\s*)?vuln\w*\s*(distribution|breakdown|chart|graph)/i,
    /severity\s*(distribution|breakdown)/i,
    /cve\s*(distribution|breakdown|chart)/i,
  ]},
  { intent: "attackPathChart", patterns: [
    /attack\s*path\s*(visual|graph|chart|map|diagram|show)/i,
    /show\s*(me\s*)?(the\s*)?(attack\s*path|kill\s*chain|threat\s*model)/i,
    /exposure\s*(map|graph|path|visual)/i,
    /threat\s*model\s*(visual|graph|diagram)/i,
    /lateral\s*movement\s*(path|map|graph)/i,
  ]},
  { intent: "assetChart", patterns: [
    /asset\s*(discovery|exposure|inventory|coverage)\s*(graph|chart|trend|over\s*time|visual)/i,
    /show\s*(me\s*)?(a\s*)?asset\s*(graph|chart|trend|visual)/i,
    /asset\s*insight\s*(graph|chart|trend|visual)/i,
    /how\s+(many|much)\s+assets?\s*(discovered|monitored|over)/i,
  ]},
  { intent: "threat", patterns: [/\b(threat|ioc|attack|apt|malware|campaign|attack\s*path|exposure|threat\s*model)/i] },
  { intent: "incident", patterns: [/\b(incident|breach|case\s*management|case|alert)\b/i] },
  { intent: "compliance", patterns: [/\b(compliance|audit|soc\s?2|nist|iso|governance\s*workflow|policy\s*engine|security\s*governance)\b/i] },
  { intent: "status", patterns: [/\b(status|health|system|dashboard)\b/i] },
  { intent: "vulnerability", patterns: [/\b(vulnerability|vuln|patch|scan|cve|vulnerability\s*management)\b/i] },
  { intent: "identity", patterns: [/\b(identity|access|privilege|credential|iam)\b/i] },
  { intent: "agent", patterns: [/\b(agent|autonomous|bot|analyst)\b/i] },
  { intent: "insights", patterns: [/\b(asset\s*insight|asset\s*discovery|asset\s*inventory)\b/i] },
  { intent: "insights", patterns: [/\b(misconfig|misconfiguration\s*management|configuration\s*security)\b/i] },
  { intent: "insights", patterns: [/\b(app\s*sec|application\s*security|appsec)\b/i] },
  { intent: "metrics", patterns: [/\b(risk\s*analysis|risk\s*score|risk\s*posture)\b/i] },
  { intent: "help", patterns: [/\b(help)\b/i, /what\s+can\s+you/i, /how\s+do\s+(i|you)/i] },
];

function classifyIntent(text: string): Intent {
  for (const { intent, patterns } of INTENT_PATTERNS) {
    if (patterns.some(p => p.test(text))) return intent;
  }
  return "default";
}

/* ═══════════════════════════════════════════════════════════
   Task Graph per Intent
   ═══════════════════════════════════════════════════════════ */

const TASK_GRAPHS: Record<Intent, Omit<TaskNode, "status">[]> = {
  insights: [
    { id: "1", label: "Classify query → route to modules", agent: "Router" },
    { id: "2", label: "Query Risk Analysis for open findings", agent: "Risk Intelligence Analyst" },
    { id: "3", label: "Query Exposure / Threat Modelling for attack surfaces", agent: "Exposure Analyst" },
    { id: "4", label: "Cross-reference IAM + Compliance posture", agent: "Alex" },
    { id: "5", label: "Rank and prioritize by module severity", agent: "Alex" },
  ],
  timeline: [
    { id: "1", label: "Classify query → Case Management", agent: "Router" },
    { id: "2", label: "Query Case Management event log", agent: "Incident Responder" },
    { id: "3", label: "Enrich via Asset Insight + Risk Analysis", agent: "Risk Intelligence Analyst" },
    { id: "4", label: "Assemble investigation timeline", agent: "Alex" },
  ],
  metrics: [
    { id: "1", label: "Classify query → operational modules", agent: "Router" },
    { id: "2", label: "Poll Vulnerability Management + Asset Insight", agent: "System Monitor" },
    { id: "3", label: "Aggregate via Policy & Governance Engine", agent: "Governance Engine" },
    { id: "4", label: "Compile cross-module summary", agent: "Alex" },
  ],
  decisions: [
    { id: "1", label: "Classify query → Policy & Governance Engine", agent: "Router" },
    { id: "2", label: "Query pending decisions from governance queue", agent: "Governance Engine" },
    { id: "3", label: "Validate thresholds via Risk Analysis", agent: "Risk Intelligence Analyst" },
    { id: "4", label: "Present module-attributed decisions", agent: "Alex" },
  ],
  analyst: [
    { id: "1", label: "Classify query → decision audit", agent: "Router" },
    { id: "2", label: "Retrieve audit trail from Policy & Governance Engine", agent: "Governance Engine" },
    { id: "3", label: "Reconstruct evidence via Risk Analysis", agent: "Risk Intelligence Analyst" },
    { id: "4", label: "Format module-level reasoning chains", agent: "Alex" },
  ],
  threat: [
    { id: "1", label: "Classify query → Exposure / Threat Modelling", agent: "Router" },
    { id: "2", label: "Fetch threat intel from Exposure module", agent: "Exposure Analyst" },
    { id: "3", label: "Correlate IOCs via Risk Analysis", agent: "Risk Intelligence Analyst" },
    { id: "4", label: "Cross-reference with Asset Insight inventory", agent: "Asset Intelligence Analyst" },
    { id: "5", label: "Generate attack path assessment", agent: "Alex" },
  ],
  incident: [
    { id: "1", label: "Classify query → Case Management", agent: "Router" },
    { id: "2", label: "Query Case Management for open incidents", agent: "Incident Responder" },
    { id: "3", label: "Enrich via Risk Analysis + containment status", agent: "Risk Intelligence Analyst" },
    { id: "4", label: "Build incident summary", agent: "Alex" },
  ],
  compliance: [
    { id: "1", label: "Classify query → Compliance + Security Governance", agent: "Router" },
    { id: "2", label: "Fetch posture from Compliance module", agent: "Governance & Compliance Analyst" },
    { id: "3", label: "Evaluate controls via Policy & Governance Engine", agent: "Governance & Compliance Analyst" },
    { id: "4", label: "Generate compliance brief", agent: "Alex" },
  ],
  status: [
    { id: "1", label: "Classify query → system-wide modules", agent: "Router" },
    { id: "2", label: "Poll Policy & Governance Engine health", agent: "System Monitor" },
    { id: "3", label: "Check Misconfiguration Management status", agent: "Configuration Security Analyst" },
    { id: "4", label: "Compile cross-module health report", agent: "Alex" },
  ],
  vulnerability: [
    { id: "1", label: "Classify query → Vulnerability Management", agent: "Router" },
    { id: "2", label: "Query Vulnerability Management database", agent: "Vulnerability Analyst" },
    { id: "3", label: "Calculate exposure via Threat Modelling", agent: "Exposure Analyst" },
    { id: "4", label: "Prioritize remediation by risk score", agent: "Alex" },
  ],
  identity: [
    { id: "1", label: "Classify query → IAM module", agent: "Router" },
    { id: "2", label: "Audit IAM identity store", agent: "Identity Security Analyst" },
    { id: "3", label: "Analyze privilege patterns via IAM", agent: "Identity Security Analyst" },
    { id: "4", label: "Compile access report", agent: "Alex" },
  ],
  agent: [
    { id: "1", label: "Classify query → Policy & Governance Engine", agent: "Router" },
    { id: "2", label: "Poll module health endpoints", agent: "System Monitor" },
    { id: "3", label: "Collect confidence via Policy & Governance Engine", agent: "Governance Engine" },
    { id: "4", label: "Compile module status report", agent: "Alex" },
  ],
  riskChart: [
    { id: "1", label: "Classify query → Risk Analysis", agent: "Router" },
    { id: "2", label: "Query Risk Analysis historical scores", agent: "Risk Intelligence Analyst" },
    { id: "3", label: "Compute trend regression + anomaly detection", agent: "Risk Intelligence Analyst" },
    { id: "4", label: "Render risk trend visualization", agent: "Alex" },
  ],
  vulnChart: [
    { id: "1", label: "Classify query → Vulnerability Management", agent: "Router" },
    { id: "2", label: "Query Vulnerability Management severity index", agent: "Vulnerability Analyst" },
    { id: "3", label: "Aggregate CVE distribution by severity", agent: "Vulnerability Analyst" },
    { id: "4", label: "Render severity distribution chart", agent: "Alex" },
  ],
  attackPathChart: [
    { id: "1", label: "Classify query → Exposure / Threat Modelling", agent: "Router" },
    { id: "2", label: "Query Exposure module attack surface graph", agent: "Exposure Analyst" },
    { id: "3", label: "Enrich nodes via Asset Insight + IAM", agent: "Exposure Analyst" },
    { id: "4", label: "Map MITRE techniques to path edges", agent: "Risk Intelligence Analyst" },
    { id: "5", label: "Render attack path visualization", agent: "Alex" },
  ],
  assetChart: [
    { id: "1", label: "Classify query → Asset Insight", agent: "Router" },
    { id: "2", label: "Query Asset Insight discovery timeline", agent: "Asset Intelligence Analyst" },
    { id: "3", label: "Cross-reference exposure data from Vuln Management", agent: "Vulnerability Analyst" },
    { id: "4", label: "Render asset exposure chart", agent: "Alex" },
  ],
  help: [
    { id: "1", label: "Classify query intent", agent: "Router" },
    { id: "2", label: "Index available platform modules", agent: "Alex" },
  ],
  default: [
    { id: "1", label: "Classify query → route to modules", agent: "Router" },
    { id: "2", label: "Route to relevant platform modules", agent: "Router" },
    { id: "3", label: "Correlate cross-module telemetry", agent: "Risk Intelligence Analyst" },
    { id: "4", label: "Generate response", agent: "Alex" },
  ],
};

/* ═══════════════════════════════════════════════════════════
   Header Components
   ═══════════════════════════════════════════════════════════ */

const Teammate = React.memo(function Teammate() {
  return (
    <div className="content-stretch flex gap-[8px] items-center relative min-w-0">
      <div className="relative rounded-[96px] shrink-0 size-[32px]">
        <div className="overflow-clip relative rounded-[inherit] size-full">
          <div className="absolute inset-[-2.94%]"><div className="absolute inset-0 overflow-hidden pointer-events-none"><img alt="" className="absolute left-0 max-w-none size-full top-0" src={imgOld} /></div></div>
        </div>
        <div aria-hidden="true" className="absolute border-0 border-[#1e2a34] border-solid inset-0 pointer-events-none rounded-[96px]" />
      </div>
      <div className="flex flex-col">
        <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[14px] not-italic relative shrink-0 text-[#dadfe3] text-[12px] whitespace-nowrap">Alex</p>
        <p className="font-['Inter:Regular',sans-serif] font-normal leading-[14px] not-italic relative shrink-0 text-[#4a5568] text-[10px] whitespace-nowrap mt-[2px]">Digital Security Teammate</p>
      </div>
    </div>
  );
});

const StatusIndicator = React.memo(function StatusIndicator({ hasProactive }: { hasProactive?: boolean }) {
  if (hasProactive) {
    return (
      <div className="flex items-center gap-[2px] px-[6px] py-[2px] rounded-[4px]"
        style={{ background: "rgba(240,91,6,0.10)", border: "1px solid rgba(240,91,6,0.24)" }}>
        <span className="relative size-[6px] shrink-0">
          <span className="absolute inset-0 rounded-full bg-[#F05B06]" style={{ animation: "proactivePulse 2s ease-in-out infinite" }}/>
        </span>
        <span className="font-['Inter:Medium',sans-serif] text-[8px] leading-[11px] text-[#F05B06] uppercase tracking-wider">
          Alert
        </span>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-[4px] px-[6px] py-[2px] rounded-[4px]"
      style={{ background: "rgba(87,177,255,0.06)", border: "1px solid rgba(87,177,255,0.12)" }}>
      <span className="relative size-[6px] shrink-0">
        <span className="absolute inset-0 rounded-full bg-[#57b1ff]"/>
      </span>
      <span className="font-['Inter:Medium',sans-serif] text-[8px] leading-[11px] text-[#57b1ff] uppercase tracking-wider">
        Standby
      </span>
    </div>
  );
});

const AiBoxHeader = React.memo(function AiBoxHeader({ hasProactive }: { hasProactive?: boolean }) {
  return (
    <div className="relative shrink-0 w-full z-[3]">
      <div aria-hidden="true" className="absolute border-[#121e27] border-b border-solid inset-0 pointer-events-none" />
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center justify-between p-[16px] relative size-full">
          <Teammate />
          <div className="content-stretch flex gap-[8px] items-center relative shrink-0">
            <StatusIndicator hasProactive={hasProactive}/>
          </div>
        </div>
      </div>
    </div>
  );
});

/* ═══════════════════════════════════════════════════════════
   Proactive Recommendation Card
   ═══════════════════════════════════════════════════════════ */

const PRIORITY_COLORS: Record<string, { bg: string; border: string; text: string; dot: string }> = {
  critical: { bg: "rgba(240,30,30,0.06)", border: "rgba(240,30,30,0.18)", text: "#ff5757", dot: "#ff5757" },
  high: { bg: "rgba(240,91,6,0.06)", border: "rgba(240,91,6,0.18)", text: "#F05B06", dot: "#F05B06" },
};

const ProactiveCard = React.memo(function ProactiveCard({ scenario, onDismiss }: { scenario: ProactiveScenario; onDismiss: () => void }) {
  const colors = PRIORITY_COLORS[scenario.priority] || PRIORITY_COLORS.high;
  return (
    <div className="w-full shrink-0 z-[2]" style={{ animation: "proactiveSlideIn 0.4s ease-out" }}>
      <div className="mx-[8px] mt-[4px] mb-[2px] rounded-[10px] overflow-hidden" style={{ background: colors.bg, border: `1px solid ${colors.border}` }}>
        {/* Header bar */}
        <div className="flex items-center justify-between px-[10px] py-[6px]" style={{ borderBottom: `1px solid ${colors.border}` }}>
          <div className="flex items-center gap-[6px] min-w-0">
            <span className="relative size-[6px] shrink-0">
              <span className="absolute inset-0 rounded-full" style={{ background: colors.dot, animation: "proactivePulse 2s ease-in-out infinite" }}/>
            </span>
            <span className="font-['Inter:Medium',sans-serif] text-[8px] leading-[11px] uppercase tracking-wider" style={{ color: colors.text }}>
              System recommendation
            </span>
            <span className="font-['Inter:Regular',sans-serif] text-[12px] leading-[11px] text-[#4a5568]">&mdash;</span>
            <span className="font-['Inter:Regular',sans-serif] text-[12px] leading-[11px] text-[#4a5568] truncate">{scenario.source}</span>
          </div>
          <div className="flex items-center gap-[6px] shrink-0">
            {scenario.score > 0 && (
              <span className="font-['Inter:Medium',sans-serif] text-[12px] leading-[10px] px-[4px] py-[1px] rounded-[3px]"
                style={{ color: colors.text, background: `${colors.dot}14` }}>
                P{scenario.score}
              </span>
            )}
            <button className="shrink-0 size-[16px] flex items-center justify-center rounded-[4px] cursor-pointer border-none bg-transparent opacity-40 hover:opacity-80 transition-opacity" onClick={onDismiss} aria-label="Dismiss">
              <svg width="8" height="8" viewBox="0 0 8 8" fill="none"><path d="M1 1l6 6M7 1L1 7" stroke="#89949e" strokeWidth="1.2" strokeLinecap="round"/></svg>
            </button>
          </div>
        </div>
        {/* Event label */}
        <div className="px-[10px] pt-[6px] pb-[4px]">
          <p className="font-['Inter:Medium',sans-serif] text-[12px] leading-[14px] text-[#dadfe3]">{scenario.label}</p>
        </div>
        {/* Module cards */}
        <div className="px-[8px] pb-[8px] flex flex-col gap-[6px]">
          {scenario.modules.map((mod, i) => (
            <div key={i}>{renderAiResponse(mod)}</div>
          ))}
        </div>
      </div>
    </div>
  );
});

/* ═══════════════════════════════════════════════════════════
   Task Graph Renderer
   ═══════════════════════════════════════════════════════════ */

function SpinnerIcon({ className }: { className?: string }) { return (<svg className={`animate-spin ${className||""}`} viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6" stroke="#1e3a5f" strokeWidth="2"/><path d="M14 8a6 6 0 0 0-6-6" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round"/></svg>); }
function CheckIcon({ className }: { className?: string }) { return (<svg className={className} viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="7" fill="#065f46" stroke="#10b981" strokeWidth="1"/><path d="M5 8l2 2 4-4" stroke="#34d399" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>); }
function PendingDot({ className }: { className?: string }) { return (<svg className={className} viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="5" stroke="#2a3a4a" strokeWidth="1" strokeDasharray="2 2"/><circle cx="8" cy="8" r="2" fill="#2a3a4a"/></svg>); }

const TaskGraphBubble = React.memo(function TaskGraphBubble({ taskGraph }: { taskGraph: TaskGraph }) {
  const { nodes, allDone } = taskGraph;
  return (
    <div className="flex items-start gap-[8px] px-[16px] py-[4px]">
      <div className="shrink-0 size-[22px] rounded-full overflow-hidden mt-[2px]"><img alt="" className="size-full object-cover" src={imgOld} /></div>
      <div className="flex flex-col max-w-[92%]">
        <div className="bg-[#060d14] rounded-[10px] rounded-tl-[4px] px-[12px] py-[10px] border border-[#121e27]">
          <div className="flex items-center gap-[6px] mb-[8px]">
            <svg className="size-[11px]" viewBox="0 0 16 16" fill="none"><path d="M2 4h12M2 8h8M2 12h10" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round"/></svg>
            <span className="font-['Inter:Semi_Bold',sans-serif] font-semibold text-[10px] leading-[13px] text-[#62707D] uppercase tracking-wider">Processing</span>
            {allDone && <span className="ml-auto font-['Inter:Medium',sans-serif] text-[10px] leading-[12px] text-[#10b981]">Complete</span>}
          </div>
          <div className="flex flex-col">
            {nodes.map((node, i) => (
              <div key={node.id} className="flex items-stretch gap-[8px]">
                <div className="flex flex-col items-center w-[14px] shrink-0">
                  {node.status === "running" ? <SpinnerIcon className="size-[14px] shrink-0"/> : node.status === "done" ? <CheckIcon className="size-[14px] shrink-0"/> : <PendingDot className="size-[14px] shrink-0"/>}
                  {i < nodes.length - 1 && <div className="w-[1px] flex-1 min-h-[6px]" style={{ background: node.status === "done" ? "linear-gradient(to bottom, #10b981, #10b98140)" : "#1a2736" }}/>}
                </div>
                <div className={i < nodes.length - 1 ? "pb-[8px]" : ""}>
                  <p className={`font-['Inter:Regular',sans-serif] font-normal text-[10px] leading-[13px] transition-colors duration-300 ${node.status === "done" ? "text-[#89949e]" : node.status === "running" ? "text-[#dadfe3]" : "text-[#3a4754]"}`}>{node.label}</p>
                  {node.agent && <p className={`font-['Inter:Regular',sans-serif] font-normal text-[10px] leading-[11px] mt-[1px] transition-colors duration-300 ${node.status === "done" ? "text-[#3a4754]" : node.status === "running" ? "text-[#3b82f6]" : "text-[#2a3544]"}`}>{node.agent}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
});

/* ═══════════════════════════��═══════════════════════════════
   Message Rendering — uses shared MessageBubble with taskGraphRenderer
   ═══════════════════════════════════════════════════════════ */

const renderTaskGraph = (taskGraph: TaskGraph) => <TaskGraphBubble taskGraph={taskGraph} />;

/* ═══════════════════════════════════════════════════════════
   Welcome + Chat Area + Input
   ═══════════════════════════════════════════════════════════ */

import { getPersonaDefaultSkills } from "../app/shared/skills";
import { usePersona } from "../app/features/persona";
import { isReturningUser, getLastVisitLabel, msSinceLastVisit, recordVisit, sealSession } from "../app/shared/services/SessionAwareness";
import { isChangeSummaryQuery, getChangeReport } from "../app/shared/services/ChangeDetection";
import { emitHighlights } from "../app/shared/services/HighlightBus";
import {
  isApprovalQuery, isDelegationQuery, isApproveRejectQuery,
  getApprovalQueue, getContextApprovalSummary,
} from "../app/shared/services/ApprovalQueue";
import { logAction } from "../app/shared/utils/audit-log";

/* ── Custom send icon matching Figma design ── */
const AiBoxSendIcon = (
  <div className="overflow-clip relative shrink-0 size-[24px]">
    <div className="-translate-x-1/2 -translate-y-1/2 absolute left-1/2 size-[16px] top-1/2"/>
    <div className="absolute inset-[16.67%]"><div className="absolute inset-[-3.13%]">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 17.0009 17.0009"><path d={svgPaths.p32950080} stroke="var(--stroke-0, #F1F3FF)" strokeLinecap="round" strokeLinejoin="round"/></svg>
    </div></div>
  </div>
);

function ChatArea({ messages, isTyping, onSuggestionClick, onAction, messagesEndRef, proactiveScenario, onDismissProactive, welcomeSuggestions }: {
  messages: ChatMessage[]; isTyping: boolean; onSuggestionClick: (t: string) => void; onAction: (l: string) => void; messagesEndRef: React.RefObject<HTMLDivElement | null>;
  proactiveScenario?: ProactiveScenario | null; onDismissProactive?: () => void; welcomeSuggestions: string[];
}) {
  return (
    <div className="flex-1 min-h-0 min-w-0 relative w-full z-[2] overflow-y-auto" style={{ scrollbarWidth: "none" }}
      onClick={(e) => { const el = (e.target as HTMLElement).closest("[data-suggestion]") as HTMLElement|null; if (el?.dataset.suggestion) onSuggestionClick(el.dataset.suggestion); }}>
      {messages.length === 0 && !isTyping && !proactiveScenario ? <SharedWelcomeScreen suggestions={welcomeSuggestions}/> : (
        <div className="flex flex-col py-[12px] min-h-full justify-end">
          {proactiveScenario && onDismissProactive && (
            <ProactiveCard scenario={proactiveScenario} onDismiss={onDismissProactive}/>
          )}
          {messages.length === 0 && !isTyping && proactiveScenario && (
            <div className="flex-1"/>
          )}
          {messages.map(m => <SharedMessageBubble key={m.id} message={m} onAction={onAction} taskGraphRenderer={renderTaskGraph}/>)}
          {isTyping && <TypingIndicator/>}
          <div ref={messagesEndRef}/>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   Main AiBox
   ═══════════════════════════════════════════════════════════ */

const STEP_MS = 500;

/* ── Proactive scheduling constants ── */
const PROACTIVE_INITIAL_DELAY = 45000;   /* first event after 45 seconds */
const PROACTIVE_INTERVAL_MIN  = 90000;   /* minimum 90s between events */
const PROACTIVE_INTERVAL_MAX  = 180000;  /* maximum 180s between events */

export default function AiBox() {
  const navigate = useNavigate();
  const { persona } = usePersona();
  const returning = React.useMemo(() => isReturningUser(), []);

  // Entry chips — focused 3-4 actions shown inline with the greeting message.
  // Returning users see change-oriented chips; managers see approval-first chips.
  const entryChips: string[] = React.useMemo(() => {
    if (returning) return [
      "What changed since my last visit?",
      "What escalated?",
      "Review pending interventions",
    ];
    if (persona === "manager") return [
      "What needs my approval?",
      "What needs attention right now?",
      "Review pending interventions",
    ];
    return [
      "What needs attention right now?",
      "Investigate the top risk",
      "Review pending interventions",
    ];
  }, [returning, persona]);

  // Fallback welcome chips (shown if messages are cleared — not normally visible).
  const welcomeSuggestions = React.useMemo(() => {
    const base = getPersonaDefaultSkills("watch-center", persona).map(s => s.label);
    return returning
      ? ["What changed since my last visit?", "What got worse?", ...base].slice(0, 5)
      : base.slice(0, 4);
  }, [returning, persona]);

  // Build the initial greeting message with embedded action chips.
  const greetingText = returning
    ? "Welcome back — here's the current status. Risks have shifted since your last session, and one intervention is awaiting your authorization."
    : "Here's what needs your attention right now — high-confidence risks are active and one intervention requires authorization.";

  const [messages, setMessages] = React.useState<ChatMessage[]>(() => [{
    id: crypto.randomUUID(),
    role: "agent" as const,
    text: greetingText,
    timestamp: new Date(),
    renderedUI: (
      <div className="flex flex-col gap-[8px] bg-[#0e1c2c] rounded-[10px] rounded-tl-[4px] px-[10px] py-[8px] border border-[#172840]">
        <p className="font-['Inter:Regular',sans-serif] font-normal leading-[17px] text-[#9fadb9] text-[11px]">{greetingText}</p>
        <div className="flex flex-col gap-[4px] mt-[2px]">
          {entryChips.map(chip => (
            <div key={chip} className="bg-[#0a1828] border border-[#172a3c] rounded-[6px] px-[9px] py-[6px] cursor-pointer hover:border-[#1e3a5f] transition-colors group" data-suggestion={chip}>
              <div className="flex items-center gap-[5px]">
                <svg className="size-[8px] shrink-0 opacity-30 group-hover:opacity-60 transition-opacity" viewBox="0 0 10 10" fill="none"><path d="M3.5 2L6.5 5L3.5 8" stroke="#57b1ff" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                <p className="font-['Inter:Regular',sans-serif] font-normal leading-[13px] text-[#7e8e9e] group-hover:text-[#9fadb9] transition-colors text-[11px]">{chip}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
  }]);
  const [inputValue, setInputValue] = React.useState("");
  const [isTyping, setIsTyping] = React.useState(false);
  const ctxRef = React.useRef<InteractionContext>(EMPTY_CONTEXT);
  const endRef = React.useRef<HTMLDivElement>(null);
  const timersRef = React.useRef<ReturnType<typeof setTimeout>[]>([]);

  /* ── Session awareness ── */
  React.useEffect(() => {
    recordVisit("Watch Center");
    const onHide = () => { if (document.visibilityState === "hidden") sealSession(); };
    document.addEventListener("visibilitychange", onHide);
    return () => {
      document.removeEventListener("visibilitychange", onHide);
      sealSession();
    };
  }, []);

  /* ── Proactive recommendation state ── */
  const [proactiveScenario, setProactiveScenario] = React.useState<ProactiveScenario | null>(null);
  const proactiveTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const dismissedIdsRef = React.useRef<Set<string>>(new Set());

  /* ── Task investigation bridge ── */
  const { pendingInvestigation, clearInvestigation } = useTaskInvestigation();
  const lastInvestigationTs = React.useRef<number>(0);

  const scroll = React.useCallback(() => { setTimeout(() => endRef.current?.scrollIntoView({ behavior: "smooth" }), 50); }, []);
  React.useEffect(() => { scroll(); }, [messages, isTyping, proactiveScenario, scroll]);
  React.useEffect(() => () => { timersRef.current.forEach(clearTimeout); }, []);

  /* ── External query injection bridge ── */
  const sendRef = React.useRef<((text: string) => void) | null>(null);
  React.useEffect(() => {
    const handler = (e: Event) => {
      const query = (e as CustomEvent).detail?.query;
      if (query && sendRef.current) sendRef.current(query);
    };
    window.addEventListener("aibox-inject-query", handler);
    return () => window.removeEventListener("aibox-inject-query", handler);
  }, []);

  /* ── Pick the highest-scored non-dismissed scenario ── */
  const pickTopScenario = React.useCallback((): ProactiveScenario | null => {
    const ranked = getRankedProactiveScenarios();
    return ranked.find(sc => !dismissedIdsRef.current.has(sc.id)) ?? null;
  }, []);

  /* ── Proactive event scheduler ── */
  const scheduleNextProactive = React.useCallback(() => {
    if (proactiveTimerRef.current) clearTimeout(proactiveTimerRef.current);
    const delay = PROACTIVE_INTERVAL_MIN + Math.random() * (PROACTIVE_INTERVAL_MAX - PROACTIVE_INTERVAL_MIN);
    proactiveTimerRef.current = setTimeout(() => {
      const top = pickTopScenario();
      if (top) {
        setProactiveScenario(top);
      } else {
        dismissedIdsRef.current.clear();
        scheduleNextProactive();
      }
    }, delay);
  }, [pickTopScenario]);

  const dismissProactive = React.useCallback(() => {
    if (proactiveScenario) {
      dismissedIdsRef.current.add(proactiveScenario.id);
    }
    setProactiveScenario(null);
    scheduleNextProactive();
  }, [proactiveScenario, scheduleNextProactive]);

  /* Initial proactive schedule */
  React.useEffect(() => {
    proactiveTimerRef.current = setTimeout(() => {
      const top = pickTopScenario();
      if (top) setProactiveScenario(top);
    }, PROACTIVE_INITIAL_DELAY);
    return () => { if (proactiveTimerRef.current) clearTimeout(proactiveTimerRef.current); };
  }, [pickTopScenario]);

  /* ── Task investigation bridge listener ── */
  React.useEffect(() => {
    if (!pendingInvestigation || pendingInvestigation.timestamp === lastInvestigationTs.current) return;
    lastInvestigationTs.current = pendingInvestigation.timestamp;

    if (proactiveScenario) {
      dismissedIdsRef.current.add(proactiveScenario.id);
      setProactiveScenario(null);
    }

    const actionLabel = pendingInvestigation.actionType === "view_details" ? "View details"
      : pendingInvestigation.actionType === "open_case" ? "Open case"
      : pendingInvestigation.actionType === "authorize" ? "Authorize"
      : "Investigate";
    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      text: `${actionLabel}: ${pendingInvestigation.title}`,
      timestamp: new Date(),
    };

    setMessages(p => [...p, userMsg]);
    setIsTyping(true);

    const t = setTimeout(() => {
      const result = buildTaskInvestigation(pendingInvestigation);
      ctxRef.current = extractContext(result.modules, pendingInvestigation.title, result.intent, ctxRef.current);
      ctxRef.current.investigationActive = true;

      const wrappedUI = (
        <ResponseContext label="Task Investigation">
          {result.ui}
        </ResponseContext>
      );
      setMessages(p => [...p, {
        id: crypto.randomUUID(),
        role: "agent",
        text: "",
        timestamp: new Date(),
        renderedUI: wrappedUI,
      }]);
      setIsTyping(false);
      clearInvestigation();
    }, 800 + Math.random() * 400);

    timersRef.current = [t];
  }, [pendingInvestigation, clearInvestigation, proactiveScenario]);

  /* ── Action button handler ── */

  const handleAction = React.useCallback((label: string) => {
    if (isTyping) return;
    if (proactiveScenario) {
      dismissedIdsRef.current.add(proactiveScenario.id);
      setProactiveScenario(null);
      scheduleNextProactive();
    }
    setMessages(p => [...p, { id: crypto.randomUUID(), role: "user", text: label, timestamp: new Date() }]);
    setIsTyping(true);

    const t = setTimeout(() => {
      const successState = getSuccessState(label);
      const result = buildActionResponse(label, ctxRef.current);
      if (result) {
        ctxRef.current = extractContext(result.modules, "", ctxRef.current.lastIntent, ctxRef.current, label);
        const msgs: ChatMessage[] = [];
        if (successState) {
          msgs.push({ id: crypto.randomUUID(), role: "agent", text: "", timestamp: new Date(), renderedUI: <SuccessConfirmation {...successState}/> });
        } else if (result.message) {
          msgs.push({ id: crypto.randomUUID(), role: "agent", text: result.message, timestamp: new Date() });
        }
        if (result.ui) {
          msgs.push({ id: crypto.randomUUID(), role: "agent", text: "", timestamp: new Date(), renderedUI: result.ui });
        }
        if (msgs.length > 0) {
          setMessages(p => [...p, ...msgs]);
        } else {
          setMessages(p => [...p, { id: crypto.randomUUID(), role: "agent", text: `Acknowledged. "${label}" processed.`, timestamp: new Date() }]);
        }
      } else {
        ctxRef.current = { ...ctxRef.current, lastAction: label };
        if (successState) {
          setMessages(p => [...p, { id: crypto.randomUUID(), role: "agent", text: "", timestamp: new Date(), renderedUI: <SuccessConfirmation {...successState}/> }]);
        } else {
          setMessages(p => [...p, { id: crypto.randomUUID(), role: "agent", text: `Acknowledged. "${label}" processed.`, timestamp: new Date() }]);
        }
      }
      setIsTyping(false);

      /* Navigate after showing the chat response if this action has a route target */
      const navTarget = ACTION_NAVIGATION[label];
      if (navTarget) {
        setTimeout(() => navigate(navTarget), 600);
      }
      
      /* Handle "Create case" action - navigate to case detail with AI context */
      if (label === "Create case" && proactiveScenario) {
        // Import case integration utility dynamically
        import("../app/pages/case-management/case-integration").then(({ createCaseFromAIRecommendation }) => {
          import("../app/pages/case-management/case-data").then(({ addCase, addObservation, addPlaybooks }) => {
            // Extract first insight/decision module from proactive scenario
            const insightModule = proactiveScenario.modules.find(m => m.type === "insight" || m.type === "decision");
            
            // Create case from AI recommendation
            const aiContext = {
              type: insightModule?.type || "insight",
              module: insightModule?.module || "Watch Center AI",
              severity: proactiveScenario.signals.severity || "high",
              title: insightModule?.title || proactiveScenario.label || "Security Investigation",
              description: insightModule?.description || insightModule?.whyItMatters || proactiveScenario.label || "",
              supportingStats: insightModule?.supportingStats,
              actions: insightModule?.actions,
            };
            
            // Try to extract attack path ID from any action or module data
            const attackPathId = proactiveScenario.modules
              .find(m => m.type === "insight" && m.actions?.some(a => a.includes("attack path")))
              ?.title.match(/ap-\d{3}/i)?.[0];
            
            const { caseData, initialObservation, recommendedPlaybooks } = createCaseFromAIRecommendation(
              aiContext,
              attackPathId
            );
            
            // Add to case data store
            addCase(caseData);
            addObservation(caseData.id, initialObservation);
            addPlaybooks(caseData.id, recommendedPlaybooks);
            
            // Navigate to case detail page with context
            setTimeout(() => {
              navigate(`/case-management/${caseData.id}`, {
                state: {
                  fromAI: true,
                  initialTab: "investigation",
                  caseData,
                  initialObservation,
                  recommendedPlaybooks,
                },
              });
            }, 600);
          });
        });
      }
    }, 600 + Math.random() * 400);
    timersRef.current = [t];
  }, [isTyping, proactiveScenario, scheduleNextProactive, navigate]);

  /* ── Send message ── */

  const send = React.useCallback((text?: string) => {
    const msg = (text || inputValue).trim();
    if (!msg || isTyping) return;
    if (proactiveScenario) {
      dismissedIdsRef.current.add(proactiveScenario.id);
      setProactiveScenario(null);
      scheduleNextProactive();
    }
    const userMsg: ChatMessage = { id: crypto.randomUUID(), role: "user", text: msg, timestamp: new Date() };
    setInputValue("");
    const ta = document.querySelector("[data-name='InputArea'] textarea") as HTMLTextAreaElement | null;
    if (ta) ta.style.height = "40px";

    if (isCasual(msg)) {
      setMessages(p => [...p, userMsg]);
      setIsTyping(true);
      const t = setTimeout(() => {
        setMessages(p => [...p, { id: crypto.randomUUID(), role: "agent", text: CASUAL_RESPS[Math.floor(Math.random() * CASUAL_RESPS.length)], timestamp: new Date() }]);
        setIsTyping(false);
      }, 400 + Math.random() * 400);
      timersRef.current = [t];
      return;
    }

    /* ── Change Summary — intercept "what changed" queries before action model ── */
    if (isChangeSummaryQuery(msg)) {
      setMessages(p => [...p, userMsg]);
      setIsTyping(true);
      const t = setTimeout(() => {
        const sinceLabel = getLastVisitLabel();
        const sinceMs = msSinceLastVisit() ?? 0;
        const report = getChangeReport("watch-center", sinceLabel, sinceMs);

        // Emit highlight signals for referenced page elements
        const refs = [
          ...report.newlyImportant,
          ...report.summary,
        ].filter(i => i.reference);
        if (refs.length > 0) {
          emitHighlights(refs.map(i => ({ page: i.reference!.page, itemId: i.reference!.itemId })));
        }

        let responseText: string;
        if (!report.hasChanges) {
          responseText = `Nothing materially changed since ${sinceLabel}.\n\nThe highest priority item remains ${report.fallbackPriority ?? "the current open issues"}.`;
        } else {
          const fmt = (items: { summary: string }[]) =>
            items.map(i => `- ${i.summary}`).join("\n");
          responseText = [
            `## Summary`,
            fmt(report.summary),
            ``,
            `## Newly Important`,
            fmt(report.newlyImportant),
            ``,
            `## Resolved`,
            fmt(report.resolved),
            ``,
            `## What to Review Next`,
            fmt(report.reviewNext),
          ].join("\n");
        }

        setMessages(p => [...p, { id: crypto.randomUUID(), role: "agent", text: responseText, timestamp: new Date() }]);
        setIsTyping(false);
      }, 600);
      timersRef.current = [t];
      return;
    }

    /* ── Approval Queue / Delegation — intercept manager queries before action model ── */
    if (isApproveRejectQuery(msg)) {
      setMessages(p => [...p, userMsg]);
      setIsTyping(true);
      const t = setTimeout(() => {
        const isApprove = /\b(approve|accept|ok)\b/i.test(msg);
        const actionData: ActionCardData = {
          id: crypto.randomUUID(),
          title: isApprove ? "Approve Action" : "Reject Action",
          scope: "Pending item in approval queue",
          guardrailLevel: isApprove ? "L3" : "L2",
          requiresApproval: isApprove,
          parameters: [
            { label: "Decision", value: isApprove ? "Approved" : "Rejected", editable: false },
            { label: "Justification", value: "Manager decision", editable: true },
          ],
          expectedOutcome: isApprove
            ? "Item approved and moved to execution queue"
            : "Item rejected and submitter notified",
          status: "pending",
        };
        logAction({
          user: "current-user",
          pageContext: "watch-center",
          actionTitle: actionData.title,
          scope: actionData.scope,
          guardrailLevel: actionData.guardrailLevel,
          approvalStatus: isApprove ? "approved" : "not-required",
          outcome: "initiated",
          decisionType: isApprove ? "approved" : "rejected",
        });
        const handleModify = (data: ActionCardData, _r: string) => {
          setMessages(prev => [...prev, {
            id: crypto.randomUUID(), role: "agent",
            text: `You'd like to modify **${data.title}**. Adjust the justification or cancel the decision.`,
            timestamp: new Date(),
          }]);
        };
        setMessages(p => [...p,
          { id: crypto.randomUUID(), role: "agent", text: `Review the ${isApprove ? "approval" : "rejection"} below and confirm.`, timestamp: new Date() },
          { id: crypto.randomUUID(), role: "agent", text: "", timestamp: new Date(), renderedUI: <ActionCard data={actionData} onModify={handleModify}/> },
        ]);
        setIsTyping(false);
      }, 600);
      timersRef.current = [t];
      return;
    }

    if (isDelegationQuery(msg)) {
      setMessages(p => [...p, userMsg]);
      setIsTyping(true);
      const t = setTimeout(() => {
        const assigneeMatch = msg.match(/to\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/);
        const assignee = assigneeMatch?.[1] ?? "Team Lead";
        const actionData: ActionCardData = {
          id: crypto.randomUUID(),
          title: "Delegate Task",
          scope: "Selected item",
          guardrailLevel: "L2",
          requiresApproval: false,
          parameters: [
            { label: "Assignee", value: assignee, editable: true },
            { label: "Due", value: "48 hours", editable: true },
            { label: "Note", value: "Delegated via Watch Center", editable: true },
          ],
          expectedOutcome: `Task assigned to ${assignee} with SLA reminder`,
          status: "pending",
        };
        logAction({
          user: "current-user",
          pageContext: "watch-center",
          actionTitle: actionData.title,
          scope: actionData.scope,
          guardrailLevel: "L2",
          approvalStatus: "not-required",
          outcome: "initiated",
          delegateTo: assignee,
        });
        const handleModify = (data: ActionCardData, _r: string) => {
          setMessages(prev => [...prev, {
            id: crypto.randomUUID(), role: "agent",
            text: `You'd like to modify **${data.title}**. Adjust assignee, due date, or note.`,
            timestamp: new Date(),
          }]);
        };
        setMessages(p => [...p,
          { id: crypto.randomUUID(), role: "agent", text: `Delegating to **${assignee}**. Confirm or adjust below.`, timestamp: new Date() },
          { id: crypto.randomUUID(), role: "agent", text: "", timestamp: new Date(), renderedUI: <ActionCard data={actionData} onModify={handleModify}/> },
        ]);
        setIsTyping(false);
      }, 600);
      timersRef.current = [t];
      return;
    }

    if (isApprovalQuery(msg)) {
      setMessages(p => [...p, userMsg]);
      setIsTyping(true);
      const t = setTimeout(() => {
        const report = getApprovalQueue();
        const summary = getContextApprovalSummary("watch-center");
        const items = report.pendingApprovals.map(a => `- **${a.title}** — ${a.description} *(submitted by ${a.submittedBy})*`).join("\n");
        const blocked = report.blockedItems.map(b => `- **${b.title}**: ${b.blockedReason.replace(/-/g, " ")}`).join("\n");
        const responseText = [
          `## Pending Approvals (${summary.pendingCount})`,
          items || "None.",
          ``,
          `## Blocked Items (${summary.blockedCount})`,
          blocked || "None.",
          ``,
          `## Recommended Next Action`,
          summary.topItem ? `Start with **${summary.topItem.title}** — highest urgency pending your decision.` : "Review queue above.",
        ].join("\n");
        const insightUI = (
          <InsightCard
            module="Approval Queue"
            severity={summary.pendingCount > 0 ? "critical" : "info"}
            title="Pending Approvals — Watch Center"
            description={`${summary.pendingCount} item${summary.pendingCount !== 1 ? "s" : ""} awaiting your decision · ${summary.blockedCount} blocked`}
            supportingStats={[
              { label: "Pending", value: String(summary.pendingCount) },
              { label: "Blocked", value: String(summary.blockedCount) },
            ]}
            actions={["Approve top item", "Show blocked", "Delegate"]}
          />
        );
        setMessages(p => [...p,
          { id: crypto.randomUUID(), role: "agent", text: responseText, timestamp: new Date() },
          { id: crypto.randomUUID(), role: "agent", text: "", timestamp: new Date(), renderedUI: insightUI },
        ]);
        setIsTyping(false);
      }, 600);
      timersRef.current = [t];
      return;
    }

    /* ── Action Model — detect Act-type queries and render ActionCard ── */
    const actionType = classifyActionIntent(msg);
    if (actionType === "act") {
      const actionData = matchAction(msg);
      if (actionData) {
        setMessages(p => [...p, userMsg]);
        setIsTyping(true);
        const t = setTimeout(() => {
          const handleModify = (data: ActionCardData, _refinement: string) => {
            const agentModifyMsg: ChatMessage = {
              id: crypto.randomUUID(),
              role: "agent",
              text: `You'd like to modify **${data.title}**. You can refine:\n\n${data.parameters.filter(p => p.editable).map(p => `• **${p.label}**: currently "${p.value}"`).join("\n")}\n\nTell me what to change.`,
              timestamp: new Date(),
            };
            setMessages(prev => [...prev, agentModifyMsg]);
          };
          const actionUI = (
            <ActionCard
              data={actionData}
              onModify={handleModify}
            />
          );
          setMessages(p => [
            ...p,
            { id: crypto.randomUUID(), role: "agent", text: "I've prepared the following action. Review the parameters and click **Run** to execute, or **Modify** to adjust.", timestamp: new Date() },
            { id: crypto.randomUUID(), role: "agent", text: "", timestamp: new Date(), renderedUI: actionUI },
          ]);
          setIsTyping(false);
        }, 600);
        timersRef.current = [t];
        return;
      }
    }

    const intent = classifyIntent(msg);
    const rawNodes = TASK_GRAPHS[intent] || TASK_GRAPHS.default;
    const nodes: TaskNode[] = rawNodes.map(n => ({ ...n, status: "pending" as const }));
    const gid = crypto.randomUUID();
    setMessages(p => [...p, userMsg, { id: gid, role: "agent", text: "", timestamp: new Date(), taskGraph: { nodes, allDone: false } }]);
    setIsTyping(true);

    const ts: ReturnType<typeof setTimeout>[] = [];
    nodes.forEach((_, i) => {
      ts.push(setTimeout(() => {
        setMessages(p => p.map(m => m.id !== gid || !m.taskGraph ? m : { ...m, taskGraph: { ...m.taskGraph, nodes: m.taskGraph.nodes.map((n, ni) => ni === i ? { ...n, status: "running" as const } : n), allDone: false } }));
      }, i * STEP_MS));
      ts.push(setTimeout(() => {
        const fin = i === nodes.length - 1;
        setMessages(p => p.map(m => m.id !== gid || !m.taskGraph ? m : { ...m, taskGraph: { ...m.taskGraph, nodes: m.taskGraph.nodes.map((n, ni) => ni === i ? { ...n, status: "done" as const } : n), allDone: fin } }));
      }, i * STEP_MS + STEP_MS * 0.7));
    });

    ts.push(setTimeout(() => {
      const result = buildAndRenderAiResponse({ query: msg });
      if (result) {
        ctxRef.current = extractContext(result.modules, msg, result.intent, ctxRef.current);
        const contextLabel = getResponseContextLabel(result.intent);
        const wrappedUI = contextLabel ? <ResponseContext label={contextLabel}>{result.ui}</ResponseContext> : result.ui;
        setMessages(p => [...p, { id: crypto.randomUUID(), role: "agent", text: "", timestamp: new Date(), renderedUI: wrappedUI }]);
      } else {
        setMessages(p => [...p, { id: crypto.randomUUID(), role: "agent", text: "", timestamp: new Date(), renderedUI: <FallbackSuggestion/> }]);
      }
      setIsTyping(false);
    }, nodes.length * STEP_MS + 350));

    timersRef.current = ts;
    sendRef.current = send;
  }, [inputValue, isTyping, proactiveScenario, scheduleNextProactive]);

  /* ── Keep sendRef in sync for external injection ── */
  React.useEffect(() => { sendRef.current = send; }, [send]);

  const onSend = React.useCallback(() => send(), [send]);
  const hasProactive = !!proactiveScenario;

  return (
    <AiBoxActionProvider onAction={handleAction}>
      <div
        className="bg-[rgba(3,6,9,0.16)] relative rounded-[16px] size-full min-h-0"
        data-name="AiBox"
        style={{
          border: "1px solid #030609",
          boxShadow: "0px 24px 48px 0px rgba(0,0,0,0.48), inset 0 0 0 1px rgba(87,177,255,0.13)",
        }}
      >
        <div className="content-stretch flex flex-col isolate items-center overflow-hidden relative rounded-[inherit] size-full min-h-0">
          <AiBoxHeader hasProactive={hasProactive}/>
          <ChatArea messages={messages} isTyping={isTyping} onSuggestionClick={send} onAction={handleAction} messagesEndRef={endRef}
            proactiveScenario={proactiveScenario} onDismissProactive={dismissProactive} welcomeSuggestions={welcomeSuggestions}/>
          <SharedChatInput inputValue={inputValue} onInputChange={setInputValue} onSend={onSend} placeholder="Ask Alex or pick a task — e.g. investigate this alert, re-check risk, explain an attack path" sendIcon={AiBoxSendIcon} sendButtonSize={48} sendButtonRadius={12}/>
        </div>
      </div>
    </AiBoxActionProvider>
  );
}