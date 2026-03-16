import { useState, useEffect, useRef } from "react";
import type { AgentId } from "./Working";
import { AGENT_TASKS } from "./agent-tasks-data";
import { MODULE_DATA, getVisibleModules, type InterventionData } from "./intervention-data-types";

function Container1() {
  return <div className="bg-[#00a46e] rounded-full shrink-0 size-[5px] animate-[blink_2s_ease-in-out_infinite]" data-name="Container" />;
}

function Header({ name }: { name: string }) {
  return (
    <div className="content-stretch flex gap-[4px] items-center relative shrink-0" data-name="Header">
      <Container1 />
      <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[normal] not-italic relative shrink-0 text-[#dadfe3] text-[12px] tracking-[0.4px] uppercase whitespace-nowrap">{name}</p>
    </div>
  );
}

function PipelineStep({ label, status }: { label: string; status: "complete" | "active" | "pending" }) {
  return (
    <div className="flex items-center gap-[6px]">
      {status === "complete" ? (
        <svg className="size-[12px] shrink-0" viewBox="0 0 12 12" fill="none">
          <circle cx="6" cy="6" r="5.5" stroke="#00A46E" strokeWidth="1" />
          <path d="M3.5 6L5.25 7.5L8.5 4.5" stroke="#00A46E" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ) : status === "active" ? (
        <div className="size-[12px] flex items-center justify-center shrink-0">
          <div className="size-[6px] rounded-full bg-[#1eb2c2]" />
        </div>
      ) : (
        <div className="size-[12px] flex items-center justify-center shrink-0">
          <div className="size-[4px] rounded-full bg-[#2c3c47]" />
        </div>
      )}
      <span
        className="font-['Inter',sans-serif] text-[10px] leading-[13px]"
        style={{ color: status === "complete" ? "#89949e" : status === "active" ? "#dadfe3" : "#4a5568" }}
      >
        {label}
      </span>
    </div>
  );
}

function InterventionInfo({ intervention }: { intervention: InterventionData }) {
  return (
    <div className="flex flex-col gap-[8px]">
      <p className="font-['Inter',sans-serif] text-[11px] text-[#dadfe3] leading-[15px]">
        {intervention.title}
      </p>
      <p className="font-['Inter',sans-serif] text-[10px] text-[#89949e] leading-[13px]">
        Intervention required.
      </p>
      <div className="flex flex-col gap-[4px] mt-[2px]">
        {intervention.pipelineSteps.filter(s => s.trim() !== "").map((step, i) => {
          const status = i < intervention.activeStep ? "complete" : i === intervention.activeStep ? "active" : "pending";
          return <PipelineStep key={`${step}-${i}`} label={step} status={status} />;
        })}
      </div>
    </div>
  );
}

function ModuleInfo({ agentId }: { agentId: AgentId }) {
  const visibleModules = getVisibleModules(agentId);

  // Collect all interventions across visible modules
  const allInterventions: InterventionData[] = [];
  for (const key of visibleModules) {
    const mod = MODULE_DATA[key];
    if (mod) {
      allInterventions.push(...mod.initialInterventions);
    }
  }

  // Rotate through interventions
  const [idx, setIdx] = useState(0);
  const count = allInterventions.length;
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (count <= 1) return;
    timerRef.current = setInterval(() => {
      setIdx((p) => (p + 1) % count);
    }, 6000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [count]);

  // Reset index when agent changes
  useEffect(() => {
    setIdx(0);
  }, [agentId]);

  if (count === 0) {
    return (
      <div className="flex-1 min-h-0 overflow-y-auto relative w-full">
        <p className="font-['IBM_Plex_Mono:Regular',sans-serif] text-[10px] text-[#4a5568] leading-[1.3]">
          No active interventions.
        </p>
      </div>
    );
  }

  const current = allInterventions[idx % count];

  return (
    <div className="flex-1 min-h-0 overflow-y-auto relative w-full" data-name="Working">
      <InterventionInfo intervention={current} />
    </div>
  );
}

function AgentContainer({ agentId }: { agentId: AgentId }) {
  const agent = AGENT_TASKS[agentId];
  return (
    <div className="flex-1 min-h-0 relative w-full" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[12px] items-start pt-[16px] px-[16px] relative size-full">
        <Header name={agent.name} />
        <div className="h-0 relative shrink-0 w-full" data-name="Separator">
          <div className="absolute inset-[-0.5px_0]">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 246 1">
              <path d="M0 0.5H246" id="Separator" stroke="var(--stroke-0, #121E27)" />
            </svg>
          </div>
        </div>
        <ModuleInfo agentId={agentId} />
      </div>
    </div>
  );
}

export default function AgentTasksStatusWidget({ agentId }: { agentId: AgentId }) {
  return (
    <div className="w-[300px]">
      <AgentContainer agentId={agentId} />
    </div>
  );
}