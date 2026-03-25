import React from "react";
import { useInvestigation } from "./InvestigationContext";
import type { AgentId } from "./Working";
import type { ExecutionState } from "./Tasks";

const AGENT_ICON_COLORS: Record<AgentId, string> = {
  alpha: "#019279",
  hotel: "#1F728D",
  bravo: "#074FC2",
  charlie: "#515888",
  foxtrot: "#C23B58",
  delta: "#D05D27",
  echo: "#9738C6",
  golf: "#D94482",
};

function TimelineStepRow({
  analystName,
  action,
  agentId,
  color,
  isRevealed,
  isActive,
  isLast,
  stepIndex,
}: {
  analystName: string;
  action: string;
  agentId: AgentId;
  color: string;
  isRevealed: boolean;
  isActive: boolean;
  isLast: boolean;
  stepIndex: number;
}) {
  const iconColor = AGENT_ICON_COLORS[agentId];

  return (
    <div
      className="flex gap-[8px] relative"
      style={{
        opacity: isRevealed ? 1 : 0.15,
        transition: `opacity 0.6s ease ${stepIndex * 0.08}s`,
      }}
    >
      {/* Timeline rail */}
      <div className="flex flex-col items-center shrink-0" style={{ width: 20 }}>
        {/* Node dot */}
        <div
          className="relative shrink-0 rounded-full"
          style={{
            width: 7,
            height: 7,
            marginTop: 3,
            backgroundColor: isActive ? color : isRevealed ? color : "#1E2A34",
            border: `1.5px solid ${isRevealed ? color : "#1E2A34"}`,
            boxShadow: isActive
              ? `0 0 6px ${color}, 0 0 12px ${color}40`
              : "none",
            transition: "all 0.4s ease",
          }}
        >
          {isActive && (
            <div
              className="absolute inset-[-2px] rounded-full"
              style={{
                border: `1px solid ${color}`,
                opacity: 0.3,
                animation: "pulseGlow 2s ease-in-out infinite",
              }}
            />
          )}
        </div>
        {/* Connector line */}
        {!isLast && (
          <div
            className="flex-1"
            style={{
              width: 1.5,
              minHeight: 8,
              background: isRevealed
                ? `linear-gradient(to bottom, ${color}60, ${color}15)`
                : "#1E2A3440",
              transition: "background 0.6s ease",
            }}
          />
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col gap-[2px] pb-[4px] min-w-0">
        <div className="flex items-center gap-[4px]">
          <span
            className="font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[normal] not-italic truncate"
            style={{
              fontSize: 10,
              color: isRevealed ? "#dadfe3" : "#3E4E5A",
              letterSpacing: "0.02em",
              transition: "color 0.4s ease",
            }}
          >
            {analystName}
          </span>
        </div>
        <span
          className="font-['Inter:Regular',sans-serif] font-normal leading-[14px] not-italic"
          style={{
            fontSize: 10,
            color: isRevealed ? "#89949e" : "#2A3640",
            transition: "color 0.4s ease",
          }}
        >
          {action}
        </span>
        {/* "Ask about this step" */}
        {isRevealed && (
          <button
            onClick={() => window.dispatchEvent(new CustomEvent("aibox-inject-query", { detail: { query: `Why did this step matter? The ${analystName} performed: "${action}" — explain what risk this revealed or mitigated and what should happen next.` } }))}
            className="mt-[2px] cursor-pointer border-none bg-transparent p-0 self-start group/askbtn"
          >
            <span
              className="font-['Inter:Medium',sans-serif] font-medium leading-[normal] not-italic flex items-center gap-[3px]"
              style={{ fontSize: 9, color: "#57b1ff", letterSpacing: "0.02em", transition: "opacity 0.2s" }}
              onMouseEnter={e => { e.currentTarget.style.opacity = "0.75"; }}
              onMouseLeave={e => { e.currentTarget.style.opacity = "1"; }}
            >
              <svg width="7" height="7" viewBox="0 0 8 8" fill="none" style={{ flexShrink: 0 }}>
                <path d="M4 1C2.34 1 1 2.34 1 4s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3zm.5 4.5h-1v-2h1v2zm0-3h-1V2h1v.5z" fill="#57b1ff"/>
              </svg>
              Explain why this matters
            </span>
          </button>
        )}
      </div>
    </div>
  );
}

export default function InvestigationTimeline({ hoveredAgent }: { hoveredAgent?: AgentId | null }) {
  const { scenario, revealedSegments, phase, steps } = useInvestigation();
  const isVisible = phase === "drawing" || phase === "holding";
  const isFading = phase === "fading";

  const [latestExecution, setLatestExecution] = React.useState<ExecutionState | null>(null);
  React.useEffect(() => {
    const handler = (e: Event) => {
      const { state } = (e as CustomEvent<{ taskId: string; state: ExecutionState }>).detail;
      if (state.status === "completed" || state.status === "in_progress") {
        setLatestExecution(state);
      }
    };
    window.addEventListener("task-execution-update", handler);
    return () => window.removeEventListener("task-execution-update", handler);
  }, []);

  // When an agent is hovered, highlight if it's part of current scenario
  const highlightedAgent = hoveredAgent && scenario.agents.includes(hoveredAgent) ? hoveredAgent : null;

  return (
    <div
      className="relative rounded-[12px] w-full h-full overflow-hidden"
      data-name="InvestigationTimeline"
    >
      <div className="content-stretch flex flex-col gap-[6px] items-start overflow-hidden p-[10px] relative rounded-[inherit] size-full bg-[#050B11]">
        {/* Header */}
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-[4px]">
            <span
              className="font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[normal] not-italic tracking-[0.4px] uppercase whitespace-nowrap"
              style={{ fontSize: 12, color: "#dadfe3" }}
            >
              Investigation Flow
            </span>
          </div>
          <span
            className="font-['Inter:Medium',sans-serif] font-medium leading-[normal] not-italic uppercase shrink-0 rounded-[3px] px-[5px] py-[2px]"
            style={{
              fontSize: 7,
              color: scenario.color,
              border: `1px solid ${scenario.color}40`,
              letterSpacing: "0.06em",
              opacity: isVisible ? 1 : 0.4,
              transition: "opacity 0.4s ease",
            }}
          >
            {phase === "drawing" ? "Active" : phase === "holding" ? "Complete" : phase === "fading" ? "Closing" : "Standby"}
          </span>
        </div>

        {/* Scenario name */}
        <div
          className="w-full"
          style={{
            opacity: isVisible || isFading ? 1 : 0.3,
            transition: "opacity 0.6s ease",
          }}
        >
          <span
            className="font-['Inter:Medium',sans-serif] font-medium leading-[normal] not-italic"
            style={{
              fontSize: 10,
              color: scenario.color,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}
          >
            {scenario.name}
          </span>
        </div>

       

        {/* Timeline steps */}
        <div className="flex flex-col w-full">
          {steps.map((step, i) => {
            // A step is "revealed" if the investigation has drawn past it
            const isRevealed =
              (isVisible || isFading) &&
              (i === 0 ? revealedSegments >= 0 : revealedSegments >= i);
            const isActiveStep =
              isVisible &&
              ((i < steps.length - 1 && revealedSegments === i) ||
                (i === steps.length - 1 && revealedSegments >= steps.length - 1));
            const isHovered = highlightedAgent === step.agentId;

            return (
              <TimelineStepRow
                key={`${scenario.name}-${step.agentId}`}
                analystName={step.analystName}
                action={step.action}
                agentId={step.agentId}
                color={scenario.color}
                isRevealed={isRevealed || isHovered}
                isActive={isActiveStep || isHovered}
                isLast={i === steps.length - 1}
                stepIndex={i}
              />
            );
          })}
        </div>

        {/* Lifecycle: execution outcome entry */}
        {latestExecution && (
          <div
            className="w-full mt-[4px] pt-[6px]"
            style={{ borderTop: "1px solid #121E27", animation: "tasksFadeIn 0.4s ease forwards" }}
          >
            <p
              className="font-['Inter:Semi_Bold',sans-serif] uppercase tracking-[0.5px] mb-[6px]"
              style={{ fontSize: 7, color: "#3d5060", letterSpacing: "0.06em" }}
            >
              Lifecycle
            </p>
            <div className="flex gap-[8px]">
              <div className="flex flex-col items-center shrink-0" style={{ width: 20 }}>
                <div
                  className="rounded-full shrink-0"
                  style={{
                    width: 7,
                    height: 7,
                    marginTop: 3,
                    backgroundColor: latestExecution.status === "completed" ? "#2fd897" : "#f59e0b",
                    border: `1.5px solid ${latestExecution.status === "completed" ? "#2fd897" : "#f59e0b"}`,
                    boxShadow: `0 0 6px ${latestExecution.status === "completed" ? "#2fd89744" : "#f59e0b44"}`,
                  }}
                />
              </div>
              <div className="flex flex-col gap-[2px] pb-[2px] min-w-0">
                <span
                  className="font-['Inter:Semi_Bold',sans-serif]"
                  style={{ fontSize: 10, color: "#dadfe3", letterSpacing: "0.02em" }}
                >
                  {latestExecution.actor}
                </span>
                <span
                  className="font-['Inter:Regular',sans-serif] leading-[14px]"
                  style={{ fontSize: 10, color: "#89949e" }}
                >
                  {latestExecution.lastAction} · {latestExecution.timestamp}
                </span>
                {latestExecution.outcome && (
                  <span
                    className="font-['Inter:Regular',sans-serif] leading-[13px] mt-[1px]"
                    style={{ fontSize: 9, color: "#4a6070" }}
                  >
                    {latestExecution.outcome}
                  </span>
                )}
                {latestExecution.status === "completed" && (
                  <span
                    className="font-['Inter:Regular',sans-serif] mt-[2px]"
                    style={{ fontSize: 9, color: "#2a3e4a" }}
                  >
                    Monitoring: <span style={{ color: "#f59e0b" }}>Pending validation</span>
                  </span>
                )}
              </div>
            </div>
          </div>
        )}


      </div>

      {/* Border overlay */}
      <div
        aria-hidden="true"
        className="absolute border border-solid inset-0 pointer-events-none rounded-[12px]"
        style={{
          borderColor: "#122C4A",
        }}
      />
    </div>
  );
}