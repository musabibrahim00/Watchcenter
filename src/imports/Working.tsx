import React from "react";
import svgPaths from "./svg-qltd33sf09";
import { imgTransfer3, imgGroup } from "./svg-sukzc";
import Secure from "./Secure";
import { useStatus } from "./StatusContext";
import { useInvestigation } from "./InvestigationContext";
import type { InvestigationScenario } from "./InvestigationContext";
import { getPersonaDefaultSkills } from "../app/shared/skills";

/* AgentId canonical definition is in /src/app/shared/types/agent-types.ts */
export type { AgentId } from "../app/shared/types/agent-types";
import type { AgentId } from "../app/shared/types/agent-types";
import { AGENT_NAMES } from "../app/shared/types/agent-types";

export interface WorkingProps {
  selectedAgent?: AgentId | null;
  onAgentClick?: (id: AgentId) => void;
  onAgentHover?: (id: AgentId | null) => void;
}

type AgentStatus = "active" | "idle" | "attention";

const AGENT_ACTIVITIES: Record<AgentId, { status: AgentStatus; tasks: string[] }> = {
  alpha:   { status: "active",    tasks: ["Discovering new assets", "Mapping asset dependencies", "Cataloging endpoints", "Scanning network topology", "Indexing cloud resources"] },
  hotel:   { status: "active",    tasks: ["Validating CVE exposure", "Scanning vulnerability feeds", "Prioritizing patch cycles", "Correlating exploit data"] },
  bravo:   { status: "active",    tasks: ["Analyzing config risks", "Auditing security policies", "Checking drift baselines", "Validating hardening rules"] },
  charlie: { status: "active",    tasks: ["Detecting app vulns", "Reviewing code deps", "Testing API endpoints", "Scanning container images"] },
  foxtrot: { status: "active",    tasks: ["Modelling attack paths", "Mapping attack surface", "Evaluating exposure chains", "Simulating breach scenarios"] },
  delta:   { status: "attention", tasks: ["Running compliance checks", "Auditing policy controls", "Verifying frameworks", "Flagging policy violations"] },
  echo:    { status: "active",    tasks: ["Correlating risk signals", "Analyzing threat intel", "Scoring risk factors", "Aggregating risk posture"] },
  golf:    { status: "active",    tasks: ["Evaluating IAM perms", "Reviewing access policies", "Detecting privilege escalation", "Auditing service accounts"] },
};

const STATUS_CONFIG: Record<AgentStatus, { color: string; label: string; dotShadow: string }> = {
  active:    { color: "#00A46E", label: "Active",    dotShadow: "0 0 4px #00A46E, 0 0 8px rgba(0,164,110,0.3)" },
  idle:      { color: "#62707D", label: "Idle",      dotShadow: "none" },
  attention: { color: "#F05B06", label: "Attention", dotShadow: "0 0 4px #F05B06, 0 0 8px rgba(240,91,6,0.3)" },
};

const AgentStatusIndicator = React.memo(function AgentStatusIndicator({ agentId }: { agentId: AgentId }) {
  const { status } = AGENT_ACTIVITIES[agentId];
  const config = STATUS_CONFIG[status];
  return (
    <div className="flex items-center gap-[3px] mt-[1px]">
      <div
        className="shrink-0 rounded-full"
        style={{
          width: 4,
          height: 4,
          backgroundColor: config.color,
          boxShadow: config.dotShadow,
          animation: status !== "idle" ? "pulseGlow 2s ease-in-out infinite" : undefined,
        }}
      />
      <span
        className="font-['Inter:Medium',sans-serif] font-medium leading-[normal] not-italic"
        style={{
          fontSize: 8,
          color: config.color,
          letterSpacing: "0.04em",
          textTransform: "uppercase" as const,
        }}
      >
        {config.label}
      </span>
    </div>
  );
});

// AGENT_NAMES imported from ../app/shared/types/agent-types

const AGENT_POSITIONS: Record<AgentId, { x: number; y: number; side: "left" | "right" | "center"; ring: "outer" | "inner" }> = {
  // Single ring (r=225) — 8 agents at 45° intervals, clockwise from top
  alpha:   { x: 300, y: 33,  side: "center", ring: "outer" },  // 0°
  bravo:   { x: 459, y: 99,  side: "right",  ring: "outer" },  // 45°
  charlie: { x: 525, y: 258, side: "right",  ring: "outer" },  // 90°
  delta:   { x: 459, y: 417, side: "right",  ring: "outer" },  // 135°
  echo:    { x: 300, y: 483, side: "center", ring: "outer" },  // 180°
  foxtrot: { x: 141, y: 417, side: "left",   ring: "outer" },  // 225°
  golf:    { x: 75,  y: 258, side: "left",   ring: "outer" },  // 270°
  hotel:   { x: 141, y: 99,  side: "left",   ring: "outer" },  // 315°
};

function useActivityCycler(tasks: string[], interval: number) {
  const [index, setIndex] = React.useState(() => Math.floor(Math.random() * tasks.length));
  const [fading, setFading] = React.useState(false);

  React.useEffect(() => {
    const jitter = interval + (Math.random() - 0.5) * 2000;
    const timer = setInterval(() => {
      setFading(true);
      setTimeout(() => {
        setIndex((prev) => (prev + 1) % tasks.length);
        setFading(false);
      }, 300);
    }, jitter);
    return () => clearInterval(timer);
  }, [tasks.length, interval]);

  return { task: tasks[index], fading };
}

const AgentTooltip = React.memo(function AgentTooltip({ agentId, onTooltipHover }: { agentId: AgentId; onTooltipHover?: (h: boolean) => void }) {
  const { status, tasks } = AGENT_ACTIVITIES[agentId];
  const config = STATUS_CONFIG[status];
  const pos = AGENT_POSITIONS[agentId];
  const cycleSpeed = status === "active" ? 3500 : status === "attention" ? 4000 : 6000;
  const { task, fading } = useActivityCycler(tasks, cycleSpeed);
  const { scenario, phase, isRevealed, getContribution, activeAgentIndex, steps } = useInvestigation();

  const investigationActive = phase === "drawing" || phase === "holding";
  const agentInChain = scenario.agents.includes(agentId);
  const agentRevealed = isRevealed(agentId);
  const contribution = getContribution(agentId);
  const agentStepIdx = scenario.agents.indexOf(agentId);
  const isCurrentlyActive = investigationActive && agentStepIdx === activeAgentIndex;

  const ringLabel = pos.ring === "outer" ? "Discovery" : "Correlation";
  const ringColor = pos.ring === "outer" ? "rgba(7,129,194,0.6)" : "rgba(30,178,194,0.6)";

  const tooltipStyle: React.CSSProperties = {
    position: "absolute",
    top: pos.y + 30,
    zIndex: 1000,
    pointerEvents: "auto",
  };

  if (pos.side === "right") {
    tooltipStyle.left = pos.x + 68;
  } else if (pos.side === "left") {
    tooltipStyle.right = 600 - pos.x + 68;
  } else {
    tooltipStyle.left = pos.x;
    tooltipStyle.transform = "translateX(-50%)";
    tooltipStyle.top = pos.y + 105;
  }

  return (
    <div
      style={tooltipStyle}
      onMouseEnter={() => onTooltipHover?.(true)}
      onMouseLeave={() => onTooltipHover?.(false)}
    >
      <div
        className="rounded-[8px] px-[12px] py-[8px] flex flex-col gap-[5px] backdrop-blur-[8px]"
        style={{
          background: "rgba(3,6,9,0.92)",
          border: `1px solid ${investigationActive && agentInChain ? `${scenario.color}40` : "rgba(87,177,255,0.16)"}`,
          boxShadow: `0 4px 16px rgba(0,0,0,0.4)${investigationActive && isCurrentlyActive ? `, 0 0 12px ${scenario.color}20` : ""}`,
          minWidth: 210,
          maxWidth: 260,
          animation: "taskFadeIn 0.15s ease forwards",
        }}
      >
        <div className="flex items-center justify-between gap-[6px]">
          <div className="flex items-center gap-[4px]">
            <div
              className="shrink-0 rounded-full"
              style={{
                width: 5,
                height: 5,
                backgroundColor: investigationActive && agentInChain ? scenario.color : config.color,
                boxShadow: investigationActive && isCurrentlyActive
                  ? `0 0 6px ${scenario.color}, 0 0 10px ${scenario.color}60`
                  : config.dotShadow,
              }}
            />
            <span
              className="font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[normal] not-italic text-[#dadfe3]"
              style={{ fontSize: 10 }}
            >
              {AGENT_NAMES[agentId]}
            </span>
          </div>
          {investigationActive && agentInChain ? (
            <span
              className="font-['Inter:Medium',sans-serif] font-medium leading-[normal] not-italic shrink-0 rounded-[3px] px-[4px] py-[1px]"
              style={{
                fontSize: 7,
                color: scenario.color,
                border: `1px solid ${scenario.color}60`,
                letterSpacing: "0.05em",
                textTransform: "uppercase",
              }}
            >
              Step {agentStepIdx + 1}/{scenario.agents.length}
            </span>
          ) : (
            <span
              className="font-['Inter:Medium',sans-serif] font-medium leading-[normal] not-italic shrink-0 rounded-[3px] px-[4px] py-[1px]"
              style={{
                fontSize: 7,
                color: ringColor,
                border: `1px solid ${ringColor}`,
                letterSpacing: "0.05em",
                textTransform: "uppercase",
              }}
            >
              {ringLabel}
            </span>
          )}
        </div>
        <div className="h-px w-full" style={{ background: investigationActive && agentInChain ? `${scenario.color}18` : "rgba(87,177,255,0.1)" }} />

        {/* Investigation context */}
        {investigationActive && agentInChain && agentRevealed && contribution ? (
          <>
            <div className="flex items-center gap-[4px]">
              <span
                className="font-['Inter:Medium',sans-serif] font-medium leading-[normal] not-italic uppercase"
                style={{ fontSize: 8, color: scenario.color, letterSpacing: "0.04em" }}
              >
                {isCurrentlyActive ? "Active" : "Complete"}
              </span>
              <span className="text-[#3E4E5A]" style={{ fontSize: 8 }}>·</span>
              <span
                className="font-['Inter:Regular',sans-serif] font-normal leading-[normal] not-italic text-[#89949e]"
                style={{ fontSize: 9, animation: "taskFadeIn 0.3s ease forwards" }}
              >
                {contribution}
              </span>
            </div>
            {/* Mini timeline preview */}
            <div className="flex flex-col gap-[3px] mt-[2px]">
              {steps.slice(0, Math.min(agentStepIdx + 2, steps.length)).map((step, i) => {
                const done = i <= agentStepIdx;
                const current = i === agentStepIdx;
                return (
                  <div key={step.agentId} className="flex items-center gap-[4px]">
                    <div
                      className="shrink-0 rounded-full"
                      style={{
                        width: 3,
                        height: 3,
                        backgroundColor: current ? scenario.color : done ? `${scenario.color}80` : "#3a4754",
                        boxShadow: current ? `0 0 4px ${scenario.color}` : "none",
                      }}
                    />
                    <span
                      className="font-['Inter:Regular',sans-serif] font-normal leading-[normal] not-italic truncate"
                      style={{
                        fontSize: 8,
                        color: current ? "#dadfe3" : done ? "#62707D" : "#3a4754",
                      }}
                    >
                      {step.action}
                    </span>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <div className="flex items-center gap-[4px]">
            <span
              className="font-['Inter:Medium',sans-serif] font-medium leading-[normal] not-italic uppercase"
              style={{ fontSize: 8, color: config.color, letterSpacing: "0.04em" }}
            >
              {config.label}
            </span>
            <span className="text-[#3E4E5A]" style={{ fontSize: 8 }}>·</span>
            <span
              className="font-['Inter:Regular',sans-serif] font-normal leading-[normal] not-italic text-[#89949e]"
              style={{
                fontSize: 9,
                animation: fading ? "taskFadeOut 0.3s ease forwards" : "taskFadeIn 0.3s ease forwards",
              }}
            >
              {task}
            </span>
          </div>
        )}

        {/* Skill hints — what this agent can do */}
        {(() => {
          const topSkills = getPersonaDefaultSkills("agent", "analyst", agentId).slice(0, 3);
          if (topSkills.length === 0) return null;
          return (
            <>
              <div className="h-px w-full" style={{ background: "rgba(87,177,255,0.08)" }} />
              <div className="flex flex-col gap-[4px]">
                <span
                  className="font-['Inter:Medium',sans-serif] font-medium leading-[normal] not-italic uppercase"
                  style={{ fontSize: 7, color: "rgba(87,177,255,0.4)", letterSpacing: "0.06em" }}
                >
                  Can help with
                </span>
                {topSkills.map(skill => (
                  <div key={skill.id} className="flex items-center gap-[4px]">
                    <svg width="6" height="6" viewBox="0 0 6 6" fill="none" style={{ flexShrink: 0 }}>
                      <path d="M1 3H5M5 3L3.5 1.5M5 3L3.5 4.5" stroke="rgba(87,177,255,0.45)" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span
                      className="font-['Inter:Regular',sans-serif] font-normal leading-[normal] not-italic"
                      style={{ fontSize: 9, color: "rgba(87,177,255,0.55)" }}
                    >
                      {skill.label}
                    </span>
                  </div>
                ))}
              </div>
            </>
          );
        })()}
        {/* Action row — ask or open details */}
        <div className="h-px w-full" style={{ background: "rgba(87,177,255,0.08)" }} />
        <div className="flex items-center gap-[6px]">
          <button
            className="font-['Inter:Medium',sans-serif] font-medium leading-[normal] not-italic flex items-center gap-[4px] flex-1"
            style={{
              fontSize: 10,
              color: "#57b1ff",
              cursor: "pointer",
              transition: "background 0.15s, border-color 0.15s",
              background: "rgba(87,177,255,0.09)",
              border: "1px solid rgba(87,177,255,0.22)",
              borderRadius: 6,
              padding: "5px 8px",
              justifyContent: "center",
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.background = "rgba(87,177,255,0.16)";
              (e.currentTarget as HTMLElement).style.borderColor = "rgba(87,177,255,0.38)";
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.background = "rgba(87,177,255,0.09)";
              (e.currentTarget as HTMLElement).style.borderColor = "rgba(87,177,255,0.22)";
            }}
            onClick={React.useCallback((e: React.MouseEvent) => {
              e.stopPropagation();
              const agentName = AGENT_NAMES[agentId];
              const query = `Tell me about the ${agentName} agent — what is it currently working on, what are its capabilities, and what should I watch for?`;
              window.dispatchEvent(new CustomEvent("aibox-inject-query", { detail: { query } }));
            }, [agentId])}
          >
            <svg width="9" height="9" viewBox="0 0 9 9" fill="none" style={{ flexShrink: 0 }}>
              <path d="M1 7.5L2.5 5.5C1.67 4.83 1.5 3.83 2 3C2.5 2.17 3.42 1.5 4.5 1.5C6.16 1.5 7.5 2.84 7.5 4.5C7.5 6.16 6.16 7.5 4.5 7.5H1Z" stroke="#57b1ff" strokeWidth="0.9" strokeLinejoin="round" fill="none"/>
            </svg>
            Ask this analyst
          </button>
          <span
            className="font-['Inter:Regular',sans-serif] font-normal leading-[normal] not-italic shrink-0"
            style={{ fontSize: 8, color: "#4a6070" }}
          >
            Click to open →
          </span>
        </div>
      </div>
    </div>
  );
});

const ParticleFlow = React.memo(function ParticleFlow({ color, intensity = 1 }: { color: string; intensity?: number; count?: number; duration?: number }) {
  const [particles, setParticles] = React.useState<{ id: number; duration: number; size: number }[]>([]);
  const nextId = React.useRef(0);

  React.useEffect(() => {
    function spawnParticle() {
      const duration = 2.5 + Math.random() * 2;
      const size = 2 + Math.random() * 1;
      const id = nextId.current++;
      setParticles((prev) => [...prev, { id, duration, size }]);
      setTimeout(() => {
        setParticles((prev) => prev.filter((p) => p.id !== id));
      }, duration * 1000);
      const nextDelay = duration * 1000 + 1500 + Math.random() * 2500;
      return setTimeout(spawnParticle, nextDelay);
    }
    const timer = spawnParticle();
    return () => clearTimeout(timer);
  }, [intensity]);

  return (
    <>
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute left-0 top-0 rounded-full pointer-events-none will-change-transform"
          style={{
            width: p.size,
            height: p.size,
            backgroundColor: color,
            boxShadow: `0 0 3px 1px ${color}, 0 0 6px 2px ${color}40`,
            "--particle-travel": "300px",
            animation: `particleFlow ${p.duration}s linear forwards`,
          } as React.CSSProperties}
        />
      ))}
    </>
  );
});

const SpokeConnection = React.memo(function SpokeConnection({ angle, color, length = 300 }: { angle: number; color: string; length?: number }) {
  return (
    <div
      className="absolute left-[calc(50%-1.5px)] bottom-1/2 w-[3px]"
      style={{
        height: length,
        transformOrigin: 'center bottom',
        transform: `rotate(${angle}deg)`,
      }}
    >
      <div className="absolute inset-[-0.5px_0]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox={`0 0 1 ${length}`}>
          <path d={`M0.5 0V${length}`} stroke={color} strokeOpacity="0.08" />
        </svg>
      </div>
    </div>
  );
});

function Group3() {
  const intensities = React.useRef(
    [0, 45, 90, 135, 180, 225, 270, 315].reduce((acc, angle) => {
      acc[angle] = 0.5 + Math.random() * 2;
      return acc;
    }, {} as Record<number, number>)
  ).current;

  // Single ring — 8 spokes at 45° intervals aligned with agents (R=225)
  const allSpokes = [
    { angle: 0,   color: '#0781C2', active: true, dotOffset: 60, length: 225 },  // Alpha
    { angle: 45,  color: '#0781C2', active: true, dotOffset: 72, length: 225 },  // Bravo
    { angle: 90,  color: '#0781C2', active: true, dotOffset: 55, length: 225 },  // Charlie
    { angle: 135, color: '#0781C2', active: true, dotOffset: 68, length: 225 },  // Delta
    { angle: 180, color: '#0781C2', active: true, dotOffset: 60, length: 225 },  // Echo
    { angle: 225, color: '#0781C2', active: true, dotOffset: 75, length: 225 },  // Foxtrot
    { angle: 270, color: '#0781C2', active: true, dotOffset: 55, length: 225 },  // Golf
    { angle: 315, color: '#0781C2', active: true, dotOffset: 65, length: 225 },  // Hotel
  ];

  return (
    <div className="absolute inset-0">
      <div
        className="absolute inset-0 overflow-clip"
        style={{
          maskImage: `url('${imgTransfer3}')`,
          WebkitMaskImage: `url('${imgTransfer3}')`,
          maskSize: '100% 100%',
          WebkitMaskSize: '100% 100%',
        }}
      >
        {allSpokes.map(({ angle, color, length }) => (
          <SpokeConnection key={angle} angle={angle} color={color} length={length} />
        ))}
      </div>
      {allSpokes.filter(s => s.active).map(({ angle, color, length }) => (
        <div
          key={`p-${angle}`}
          className="absolute left-[calc(50%-1.5px)] bottom-1/2 w-[3px] overflow-visible pointer-events-none"
          style={{
            height: length * 0.8,
            transformOrigin: 'center bottom',
            transform: `rotate(${angle}deg)`,
          }}
        >
          <ParticleFlow color={color} intensity={intensities[angle] ?? 1} />
        </div>
      ))}
    </div>
  );
}

function Mask() {
  return (
    <div className="absolute contents left-0 top-[-1px]" data-name="Mask">
      <Group3 />
    </div>
  );
}

function Base() {
  return (
    <div className="-translate-x-1/2 -translate-y-1/2 absolute left-1/2 size-[600px] top-[332px]" data-name="Base">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 601 601">
        <g id="outer-ring">
          <path d={svgPaths.p38dd2400} fill="var(--fill-0, #030609)" />
          <path d={svgPaths.p38dd2400} fill="url(#paint0_radial_2_641)" />
          <path d={svgPaths.p38dd2400} stroke="var(--stroke-0, #121E27)" strokeOpacity="0.6" />
        </g>
        <defs>
          <radialGradient cx="0" cy="0" gradientTransform="translate(300.5 270.5) scale(330)" gradientUnits="userSpaceOnUse" id="paint0_radial_2_641" r="1">
            <stop stopColor="#050B11" stopOpacity="0.6" />
            <stop offset="0.7" stopColor="#050B11" stopOpacity="0.8" />
            <stop offset="1" stopColor="#030609" />
          </radialGradient>
        </defs>
      </svg>
      <div className="absolute inset-[12.67%]" data-name="ring-outer">
        <div className="absolute inset-[-0.11%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 449 449">
            <path d={svgPaths.p2b333280} id="Vector" stroke="var(--stroke-0, #0781C2)" strokeDasharray="20 20" strokeOpacity="0.24" />
          </svg>
        </div>
      </div>
      <div className="absolute inset-[23.33%_23.67%]" data-name="Vector">
        <div className="absolute inset-[-2.5%_-3.8%_-5%_-3.8%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 340 344">
            <g filter="url(#filter0_d_2_627)" id="Vector">
              <path d={svgPaths.p3b2ce300} fill="var(--fill-0, #030609)" />
              <path d={svgPaths.p480ba70} stroke="var(--stroke-0, #121E27)" strokeOpacity="0.6" />
            </g>
            <defs>
              <filter colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse" height="344" id="filter0_d_2_627" width="340" x="0" y="0">
                <feFlood floodOpacity="0" result="BackgroundImageFix" />
                <feColorMatrix in="SourceAlpha" result="hardAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" />
                <feOffset dy="4" />
                <feGaussianBlur stdDeviation="6" />
                <feComposite in2="hardAlpha" operator="out" />
                <feColorMatrix type="matrix" values="0 0 0 0 0.027451 0 0 0 0 0.505882 0 0 0 0 0.760784 0 0 0 0.04 0" />
                <feBlend in2="BackgroundImageFix" mode="normal" result="effect1_dropShadow_2_627" />
                <feBlend in="SourceGraphic" in2="effect1_dropShadow_2_627" mode="normal" result="shape" />
              </filter>
            </defs>
          </svg>
        </div>
      </div>
      <Mask />
      <div className="-translate-x-1/2 absolute aspect-square left-1/2 top-1/2 -translate-y-1/2" data-name="ring-inner" style={{ width: 268, height: 268 }}>
        <div className="absolute inset-[-0.19%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 268 268">
            <circle cx="134" cy="134" r="133" fill="var(--fill-0, #1E2A34)" fillOpacity="0.08" stroke="var(--stroke-0, #0781C2)" strokeDasharray="100 20" strokeOpacity="0.2" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Alpha() {
  return (
    <div className="absolute inset-[8.33%_0]" data-name="Alpha">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 28 23.3334">
        <g id="Alpha">
          <g id="Group 8">
            <path d={svgPaths.p1413e080} fill="url(#paint0_linear_2_495)" id="Vector" />
            <path d={svgPaths.p224a4440} fill="url(#paint1_linear_2_495)" id="Vector_2" />
          </g>
          <path d={svgPaths.p3b453f40} fill="url(#paint2_linear_2_495)" id="Vector_3" stroke="var(--stroke-0, #121E27)" />
          <g id="Vector_4">
            <path d={svgPaths.p189b5e00} fill="var(--fill-0, #019279)" id="Vector_5" />
            <path d={svgPaths.p8a5ca00} fill="var(--fill-0, #019279)" id="Vector_6" />
            <path d={svgPaths.p102b1400} fill="var(--fill-0, #019279)" id="Vector_7" />
          </g>
        </g>
        <defs>
          <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_2_495" x1="13.9979" x2="13.9979" y1="8.16667" y2="19.8334">
            <stop stopColor="#3E4E5A" />
            <stop offset="1" stopColor="#1E2A34" />
          </linearGradient>
          <linearGradient gradientUnits="userSpaceOnUse" id="paint1_linear_2_495" x1="13.9982" x2="13.9982" y1="4.66667" y2="23.3334">
            <stop stopColor="#3E4E5A" />
            <stop offset="1" stopColor="#1E2A34" />
          </linearGradient>
          <linearGradient gradientUnits="userSpaceOnUse" id="paint2_linear_2_495" x1="14" x2="14" y1="8.16667" y2="19.8334">
            <stop stopColor="#01101F" />
            <stop offset="1" stopColor="#009A7E" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

function Icon() {
  return (
    <div className="overflow-clip relative shrink-0 size-[28px]" data-name="Icon">
      <Alpha />
    </div>
  );
}

function Container({ selected }: { selected?: boolean }) {
  return (
    <div className="absolute bg-[#050b11] content-stretch flex items-center left-[8px] p-[20px] rounded-[34px] top-[8px]" data-name="Container">
      <div aria-hidden="true" className={`absolute border border-solid inset-0 pointer-events-none rounded-[34px] shadow-[0px_0px_4.484px_0px_rgba(137,148,158,0.04)] ${selected ? 'border-[#0781c2]' : 'border-[#121e27]'}`} />
      <Icon />
    </div>
  );
}

function Frame1({ selected }: { selected?: boolean }) {
  return (
    <div className="bg-[#030609] overflow-hidden relative rounded-[99px] shrink-0 size-[84px]">
      <div aria-hidden="true" className="absolute border border-[rgba(18,30,39,0.4)] border-solid inset-0 pointer-events-none rounded-[99px]" />
      <div className="-translate-x-1/2 -translate-y-1/2 absolute left-[calc(50%+0.5px)] size-[84px] top-1/2" data-name="agent-ring" style={{ animationDelay: '-3s' }}>
        <div className="absolute left-0 size-[84px] top-0">
          <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 84 84">
            <g id="Ellipse 6">
              <circle cx="42" cy="42" fill="var(--fill-0, #D9D9D9)" r="41.5" />
              <circle cx="42" cy="42" fill="var(--fill-1, #030609)" r="41.5" />
              <circle cx="42" cy="42" r="41.5" stroke="var(--stroke-0, #091015)" />
            </g>
          </svg>
        </div>
        <div className="absolute left-0 size-[84px] top-0">
          {selected ? (
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 84 84">
              <circle cx="42" cy="42" r="41" stroke="#0781C2" strokeWidth="2" fill="none" />
            </svg>
          ) : (
            <div className="absolute bottom-1/2 left-1/2 right-0 top-0">
              <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 42 42">
                <path d={svgPaths.p25566ec0} id="Ellipse 7" stroke="var(--stroke-0, #0781C2)" />
              </svg>
            </div>
          )}
        </div>
      </div>
      <Container selected={selected} />
      <div className="-translate-x-1/2 absolute bottom-[20px] left-1/2 size-[4px]" data-name="StatusActive">
        <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 4 4">
          <circle cx="2" cy="2" fill="#00A46E" r="2" />
        </svg>
      </div>
    </div>
  );
}

function AgentAlpha({ onClick, selected, onHover }: { onClick?: () => void; selected?: boolean; onHover?: (hovered: boolean) => void }) {
  return (
    <div className={`-translate-x-1/2 absolute content-stretch flex flex-col gap-[2px] items-center left-1/2 top-[33px] w-[110px] cursor-pointer ${selected ? "z-[999]" : ""}`} data-name="AgentAlpha" onClick={onClick} onMouseEnter={() => onHover?.(true)} onMouseLeave={() => onHover?.(false)}>
      <Frame1 selected={selected} />
      <p className="font-['Inter:Medium',sans-serif] font-medium leading-[normal] not-italic relative shrink-0 text-[#89949e] text-[10px] text-center w-full whitespace-pre-wrap">{"Asset Intelligence\nAnalyst"}</p>
    </div>
  );
}

function Foxtrot() {
  return (
    <div className="absolute inset-[8.33%_0]" data-name="Foxtrot">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 28 23.3334">
        <g id="Foxtrot">
          <g id="Group 8">
            <path d={svgPaths.p39296bf0} fill="url(#paint0_linear_2_631)" id="Vector" />
            <path d={svgPaths.p36bcf800} fill="url(#paint1_linear_2_631)" id="Vector_2" />
          </g>
          <path d={svgPaths.p33231a00} fill="url(#paint2_linear_2_631)" id="Vector_3" stroke="var(--stroke-0, #121E27)" />
          <g id="Vector_4">
            <path d={svgPaths.p3fc13c80} fill="var(--fill-0, #074FC2)" id="Vector_5" />
            <path d={svgPaths.p27fb0e80} fill="var(--fill-0, #074FC2)" id="Vector_6" />
            <path d={svgPaths.p26be0300} fill="var(--fill-0, #074FC2)" id="Vector_7" />
          </g>
        </g>
        <defs>
          <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_2_631" x1="13.9979" x2="13.9979" y1="8.16666" y2="19.8334">
            <stop stopColor="#3E4E5A" />
            <stop offset="1" stopColor="#1E2A34" />
          </linearGradient>
          <linearGradient gradientUnits="userSpaceOnUse" id="paint1_linear_2_631" x1="13.9982" x2="13.9982" y1="4.66666" y2="23.3334">
            <stop stopColor="#3E4E5A" />
            <stop offset="1" stopColor="#1E2A34" />
          </linearGradient>
          <linearGradient gradientUnits="userSpaceOnUse" id="paint2_linear_2_631" x1="14" x2="14" y1="8.16666" y2="19.8334">
            <stop stopColor="#01101F" />
            <stop offset="1" stopColor="#074FC2" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

function Icon1() {
  return (
    <div className="overflow-clip relative shrink-0 size-[28px]" data-name="Icon">
      <Foxtrot />
    </div>
  );
}

function Container1({ selected }: { selected?: boolean }) {
  return (
    <div className="absolute bg-[#050b11] content-stretch flex items-center left-[8px] p-[20px] rounded-[34px] top-[8px]" data-name="Container">
      <div aria-hidden="true" className={`absolute border border-solid inset-0 pointer-events-none rounded-[34px] shadow-[0px_0px_4.484px_0px_rgba(137,148,158,0.04)] ${selected ? 'border-[#0781c2]' : 'border-[#121e27]'}`} />
      <Icon1 />
    </div>
  );
}

function Frame({ selected }: { selected?: boolean }) {
  return (
    <div className="bg-[#030609] overflow-hidden relative rounded-[99px] shrink-0 size-[84px]">
      <div aria-hidden="true" className="absolute border border-[rgba(18,30,39,0.4)] border-solid inset-0 pointer-events-none rounded-[99px]" />
      <div className="-translate-x-1/2 -translate-y-1/2 absolute left-[calc(50%+0.5px)] size-[84px] top-1/2" data-name="agent-ring" style={{ animationDelay: '-17s' }}>
        <div className="absolute left-0 size-[84px] top-0">
          <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 84 84">
            <g id="Ellipse 6">
              <circle cx="42" cy="42" fill="var(--fill-0, #D9D9D9)" r="41.5" />
              <circle cx="42" cy="42" fill="var(--fill-1, #030609)" r="41.5" />
              <circle cx="42" cy="42" r="41.5" stroke="var(--stroke-0, #091015)" />
            </g>
          </svg>
        </div>
        <div className="absolute left-0 size-[84px] top-0">
          {selected ? (
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 84 84">
              <circle cx="42" cy="42" r="41" stroke="#0781C2" strokeWidth="2" fill="none" />
            </svg>
          ) : (
            <div className="absolute bottom-1/2 left-1/2 right-0 top-0">
              <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 42 42">
                <path d={svgPaths.p25566ec0} id="Ellipse 7" stroke="var(--stroke-0, #0781C2)" />
              </svg>
            </div>
          )}
        </div>
      </div>
      <Container1 selected={selected} />
      <div className="-translate-x-1/2 absolute bottom-[20px] left-1/2 size-[4px]" data-name="StatusActive">
        <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 4 4">
          <circle cx="2" cy="2" fill="#00A46E" r="2" />
        </svg>
      </div>
    </div>
  );
}

function AgentBravo({ onClick, selected, onHover }: { onClick?: () => void; selected?: boolean; onHover?: (hovered: boolean) => void }) {
  return (
    <div className={`-translate-x-1/2 absolute content-stretch flex flex-col gap-[2px] items-center left-[calc(50%+159px)] top-[99px] w-[110px] cursor-pointer ${selected ? "z-[999]" : ""}`} data-name="AgentBravo" onClick={onClick} onMouseEnter={() => onHover?.(true)} onMouseLeave={() => onHover?.(false)}>
      <Frame selected={selected} />
      <p className="font-['Inter:Medium',sans-serif] font-medium leading-[normal] not-italic relative shrink-0 text-[#89949e] text-[10px] text-center w-full whitespace-pre-wrap">{"Configuration\nSecurity Analyst"}</p>
    </div>
  );
}

function Charlie() {
  return (
    <div className="absolute inset-[8.33%_0]" data-name="Charlie">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 28 23.3334">
        <g id="Charlie">
          <g id="Group 8">
            <path d={svgPaths.p39296bf0} fill="url(#paint0_linear_2_613)" id="Vector" />
            <path d={svgPaths.p36bcf800} fill="url(#paint1_linear_2_613)" id="Vector_2" />
          </g>
          <path d={svgPaths.p33231a00} fill="url(#paint2_linear_2_613)" id="Vector_3" stroke="var(--stroke-0, #121E27)" />
          <g id="Vector_4">
            <path d={svgPaths.p3fc13c80} fill="var(--fill-0, #515888)" id="Vector_5" />
            <path d={svgPaths.p27fb0e80} fill="var(--fill-0, #515888)" id="Vector_6" />
            <path d={svgPaths.p26be0300} fill="var(--fill-0, #515888)" id="Vector_7" />
          </g>
        </g>
        <defs>
          <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_2_613" x1="13.9979" x2="13.9979" y1="8.16666" y2="19.8334">
            <stop stopColor="#3E4E5A" />
            <stop offset="1" stopColor="#1E2A34" />
          </linearGradient>
          <linearGradient gradientUnits="userSpaceOnUse" id="paint1_linear_2_613" x1="13.9982" x2="13.9982" y1="4.66666" y2="23.3334">
            <stop stopColor="#3E4E5A" />
            <stop offset="1" stopColor="#1E2A34" />
          </linearGradient>
          <linearGradient gradientUnits="userSpaceOnUse" id="paint2_linear_2_613" x1="14" x2="14" y1="8.16666" y2="19.8334">
            <stop stopColor="#01101F" />
            <stop offset="1" stopColor="#515888" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

function Icon2() {
  return (
    <div className="overflow-clip relative shrink-0 size-[28px]" data-name="Icon">
      <Charlie />
    </div>
  );
}

function Container2({ selected }: { selected?: boolean }) {
  return (
    <div className="absolute bg-[#050b11] content-stretch flex items-center left-[8px] p-[20px] rounded-[34px] top-[8px]" data-name="Container">
      <div aria-hidden="true" className={`absolute border border-solid inset-0 pointer-events-none rounded-[34px] shadow-[0px_0px_4.484px_0px_rgba(137,148,158,0.04)] ${selected ? 'border-[#0781c2]' : 'border-[#121e27]'}`} />
      <Icon2 />
    </div>
  );
}

function Frame2({ selected }: { selected?: boolean }) {
  return (
    <div className="bg-[#030609] overflow-hidden relative rounded-[99px] shrink-0 size-[84px]">
      <div aria-hidden="true" className="absolute border border-[rgba(18,30,39,0.4)] border-solid inset-0 pointer-events-none rounded-[99px]" />
      <div className="-translate-x-1/2 -translate-y-1/2 absolute left-[calc(50%+0.5px)] size-[84px] top-1/2" data-name="agent-ring" style={{ animationDelay: '-8s' }}>
        <div className="absolute left-0 size-[84px] top-0">
          <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 84 84">
            <g id="Ellipse 6">
              <circle cx="42" cy="42" fill="var(--fill-0, #D9D9D9)" r="41.5" />
              <circle cx="42" cy="42" fill="var(--fill-1, #030609)" r="41.5" />
              <circle cx="42" cy="42" r="41.5" stroke="var(--stroke-0, #091015)" />
            </g>
          </svg>
        </div>
        <div className="absolute left-0 size-[84px] top-0">
          {selected ? (
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 84 84">
              <circle cx="42" cy="42" r="41" stroke="#0781C2" strokeWidth="2" fill="none" />
            </svg>
          ) : (
            <div className="absolute bottom-1/2 left-1/2 right-0 top-0">
              <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 42 42">
                <path d={svgPaths.p25566ec0} id="Ellipse 7" stroke="var(--stroke-0, #0781C2)" />
              </svg>
            </div>
          )}
        </div>
      </div>
      <Container2 selected={selected} />
      <div className="-translate-x-1/2 absolute bottom-[20px] left-1/2 size-[4px]" data-name="StatusActive">
        <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 4 4">
          <circle cx="2" cy="2" fill="#00A46E" r="2" />
        </svg>
      </div>
    </div>
  );
}

function AgentCharlie({ onClick, selected, onHover }: { onClick?: () => void; selected?: boolean; onHover?: (hovered: boolean) => void }) {
  return (
    <div className={`-translate-x-1/2 absolute content-stretch flex flex-col gap-[2px] items-center left-[calc(50%+225px)] top-[258px] w-[110px] cursor-pointer ${selected ? "z-[999]" : ""}`} data-name="AgentCharlie" onClick={onClick} onMouseEnter={() => onHover?.(true)} onMouseLeave={() => onHover?.(false)}>
      <Frame2 selected={selected} />
      <p className="font-['Inter:Medium',sans-serif] font-medium leading-[normal] not-italic relative shrink-0 text-[#89949e] text-[10px] text-center w-full whitespace-pre-wrap">{"Application\nSecurity Analyst"}</p>
    </div>
  );
}

function Delta() {
  return (
    <div className="absolute inset-[8.33%_0]" data-name="Delta">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 28 23.3334">
        <g id="Delta">
          <g id="Group 8">
            <path d={svgPaths.p39296bf0} fill="url(#paint0_linear_2_551)" id="Vector" />
            <path d={svgPaths.p36bcf800} fill="url(#paint1_linear_2_551)" id="Vector_2" />
          </g>
          <path d={svgPaths.p33231a00} fill="url(#paint2_linear_2_551)" id="Vector_3" stroke="var(--stroke-0, #121E27)" />
          <g id="Vector_4">
            <path d={svgPaths.p3fc13c80} fill="var(--fill-0, #D05D27)" id="Vector_5" />
            <path d={svgPaths.p27fb0e80} fill="var(--fill-0, #D05D27)" id="Vector_6" />
            <path d={svgPaths.p26be0300} fill="var(--fill-0, #D05D27)" id="Vector_7" />
          </g>
        </g>
        <defs>
          <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_2_551" x1="13.9979" x2="13.9979" y1="8.16666" y2="19.8334">
            <stop stopColor="#3E4E5A" />
            <stop offset="1" stopColor="#1E2A34" />
          </linearGradient>
          <linearGradient gradientUnits="userSpaceOnUse" id="paint1_linear_2_551" x1="13.9982" x2="13.9982" y1="4.66666" y2="23.3334">
            <stop stopColor="#3E4E5A" />
            <stop offset="1" stopColor="#1E2A34" />
          </linearGradient>
          <linearGradient gradientUnits="userSpaceOnUse" id="paint2_linear_2_551" x1="14" x2="14" y1="8.16666" y2="19.8334">
            <stop stopColor="#01101F" />
            <stop offset="1" stopColor="#D05D27" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

function Icon3() {
  return (
    <div className="overflow-clip relative shrink-0 size-[28px]" data-name="Icon">
      <Delta />
    </div>
  );
}

function Container3({ selected }: { selected?: boolean }) {
  return (
    <div className="absolute bg-[#050b11] content-stretch flex items-center left-[8px] p-[20px] rounded-[34px] top-[8px]" data-name="Container">
      <div aria-hidden="true" className={`absolute border border-solid inset-0 pointer-events-none rounded-[34px] ${selected ? 'border-[#0781c2] shadow-[0px_0px_4.484px_0px_rgba(137,148,158,0.04)]' : 'border-[#121e27] shadow-[0px_0px_13.995px_0px_rgba(228,108,18,0.22),0px_0px_31.99px_0px_rgba(228,108,18,0.1),0px_0px_4.484px_0px_rgba(137,148,158,0.04)]'}`} />
      <Icon3 />
    </div>
  );
}

function Frame3({ selected }: { selected?: boolean }) {
  return (
    <div className="bg-[#030609] overflow-hidden relative rounded-[99px] shrink-0 size-[84px]">
      <div aria-hidden="true" className="absolute border border-[rgba(18,30,39,0.4)] border-solid inset-0 pointer-events-none rounded-[99px]" />
      <div className="-translate-x-1/2 -translate-y-1/2 absolute left-1/2 size-[84px] top-1/2" data-name="agent-ring" style={{ animationDelay: '-22s' }}>
        <div className="absolute left-0 size-[84px] top-0">
          <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 84 84">
            <g id="Ellipse 6">
              <circle cx="42" cy="42" fill="var(--fill-0, #D9D9D9)" r="41.5" />
              <circle cx="42" cy="42" fill="var(--fill-1, #030609)" r="41.5" />
              <circle cx="42" cy="42" r="41.5" stroke="var(--stroke-0, #091015)" />
            </g>
          </svg>
        </div>
        <div className="absolute left-0 size-[84px] top-0">
          {selected ? (
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 84 84">
              <circle cx="42" cy="42" r="41" stroke="#0781C2" strokeWidth="2" fill="none" />
            </svg>
          ) : (
            <div className="absolute bottom-1/2 left-1/2 right-0 top-0">
              <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 42 42">
                <path d={svgPaths.p25566ec0} id="Ellipse 7" stroke="var(--stroke-0, #F05B06)" />
              </svg>
            </div>
          )}
        </div>
      </div>
      <Container3 selected={selected} />
      <div className="-translate-x-1/2 absolute bottom-[20px] left-1/2 size-[4px]" data-name="StatusActive">
        <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 4 4">
          <circle cx="2" cy="2" fill="#00A46E" r="2" />
        </svg>
      </div>
    </div>
  );
}

function AgentDelta({ onClick, selected, onHover }: { onClick?: () => void; selected?: boolean; onHover?: (hovered: boolean) => void }) {
  return (
    <div className={`-translate-x-1/2 absolute content-stretch flex flex-col gap-[2px] items-center left-[calc(50%+159px)] top-[417px] w-[110px] cursor-pointer ${selected ? "z-[999]" : ""}`} data-name="AgentDelta" onClick={onClick} onMouseEnter={() => onHover?.(true)} onMouseLeave={() => onHover?.(false)}>
      <Frame3 selected={selected} />
      <p className="font-['Inter:Medium',sans-serif] font-medium leading-[normal] not-italic relative shrink-0 text-[#89949e] text-[10px] text-center w-full whitespace-pre-wrap">{"Governance &\nCompliance Analyst"}</p>
    </div>
  );
}

function Echo() {
  return (
    <div className="absolute inset-[8.33%_0]" data-name="Echo">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 28 23.3334">
        <g id="Echo">
          <g id="Group 8">
            <path d={svgPaths.p39296bf0} fill="url(#paint0_linear_2_539)" id="Vector" />
            <path d={svgPaths.p36bcf800} fill="url(#paint1_linear_2_539)" id="Vector_2" />
          </g>
          <path d={svgPaths.p33231a00} fill="url(#paint2_linear_2_539)" id="Vector_3" stroke="var(--stroke-0, #121E27)" />
          <g id="Vector_4">
            <path d={svgPaths.p3fc13c80} fill="var(--fill-0, #9738C6)" id="Vector_5" />
            <path d={svgPaths.p27fb0e80} fill="var(--fill-0, #9738C6)" id="Vector_6" />
            <path d={svgPaths.p26be0300} fill="var(--fill-0, #9738C6)" id="Vector_7" />
          </g>
        </g>
        <defs>
          <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_2_539" x1="13.9979" x2="13.9979" y1="8.16666" y2="19.8334">
            <stop stopColor="#3E4E5A" />
            <stop offset="1" stopColor="#1E2A34" />
          </linearGradient>
          <linearGradient gradientUnits="userSpaceOnUse" id="paint1_linear_2_539" x1="13.9982" x2="13.9982" y1="4.66666" y2="23.3334">
            <stop stopColor="#3E4E5A" />
            <stop offset="1" stopColor="#1E2A34" />
          </linearGradient>
          <linearGradient gradientUnits="userSpaceOnUse" id="paint2_linear_2_539" x1="14" x2="14" y1="8.16666" y2="19.8334">
            <stop stopColor="#01101F" />
            <stop offset="1" stopColor="#9738C6" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

function Icon4() {
  return (
    <div className="overflow-clip relative shrink-0 size-[28px]" data-name="Icon">
      <Echo />
    </div>
  );
}

function Container4({ selected }: { selected?: boolean }) {
  return (
    <div className="absolute bg-[#050b11] content-stretch flex items-center left-[8px] p-[20px] rounded-[34px] top-[8px]" data-name="Container">
      <div aria-hidden="true" className={`absolute border border-solid inset-0 pointer-events-none rounded-[34px] shadow-[0px_0px_4.484px_0px_rgba(137,148,158,0.04)] ${selected ? 'border-[#0781c2]' : 'border-[#121e27]'}`} />
      <Icon4 />
    </div>
  );
}

function Frame4({ selected }: { selected?: boolean }) {
  return (
    <div className="bg-[#030609] overflow-hidden relative rounded-[99px] shrink-0 size-[84px]">
      <div aria-hidden="true" className="absolute border border-[rgba(18,30,39,0.4)] border-solid inset-0 pointer-events-none rounded-[99px]" />
      <div className="-translate-x-1/2 -translate-y-1/2 absolute left-[calc(50%+0.5px)] size-[84px] top-1/2" data-name="agent-ring" style={{ animationDelay: '-12s' }}>
        <div className="absolute left-0 size-[84px] top-0">
          <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 84 84">
            <g id="Ellipse 6">
              <circle cx="42" cy="42" fill="var(--fill-0, #D9D9D9)" r="41.5" />
              <circle cx="42" cy="42" fill="var(--fill-1, #030609)" r="41.5" />
              <circle cx="42" cy="42" r="41.5" stroke="var(--stroke-0, #091015)" />
            </g>
          </svg>
        </div>
        <div className="absolute left-0 size-[84px] top-0">
          {selected ? (
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 84 84">
              <circle cx="42" cy="42" r="41" stroke="#0781C2" strokeWidth="2" fill="none" />
            </svg>
          ) : (
            <div className="absolute bottom-1/2 left-1/2 right-0 top-0">
              <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 42 42">
                <path d={svgPaths.p25566ec0} id="Ellipse 7" stroke="var(--stroke-0, #0781C2)" />
              </svg>
            </div>
          )}
        </div>
      </div>
      <Container4 selected={selected} />
      <div className="-translate-x-1/2 absolute bottom-[20px] left-1/2 size-[4px]" data-name="StatusActive">
        <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 4 4">
          <circle cx="2" cy="2" fill="#00A46E" r="2" />
        </svg>
      </div>
    </div>
  );
}

function AgentEcho({ onClick, selected, onHover }: { onClick?: () => void; selected?: boolean; onHover?: (hovered: boolean) => void }) {
  return (
    <div className={`-translate-x-1/2 absolute content-stretch flex flex-col gap-[2px] items-center left-1/2 top-[483px] w-[110px] cursor-pointer ${selected ? "z-[999]" : ""}`} data-name="AgentEcho" onClick={onClick} onMouseEnter={() => onHover?.(true)} onMouseLeave={() => onHover?.(false)}>
      <Frame4 selected={selected} />
      <p className="font-['Inter:Medium',sans-serif] font-medium leading-[normal] not-italic relative shrink-0 text-[#89949e] text-[10px] text-center w-full whitespace-pre-wrap">{"Risk Intelligence\nAnalyst"}</p>
    </div>
  );
}

function Group2() {
  return (
    <div className="absolute bottom-[8.33%] contents left-0 right-0 top-1/4">
      <div className="absolute inset-[37.5%_0_20.83%_0]" data-name="Vector">
        <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 28 11.6667">
          <path d={svgPaths.pd9bc600} fill="url(#paint0_linear_2_450)" id="Vector" />
          <defs>
            <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_2_450" x1="13.9979" x2="13.9979" y1="0" y2="11.6667">
              <stop stopColor="#3E4E5A" />
              <stop offset="1" stopColor="#1E2A34" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      <div className="absolute bottom-[8.33%] left-[8.33%] right-[8.33%] top-1/4" data-name="Vector_2">
        <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 23.3333 18.6667">
          <path d={svgPaths.p343f8500} fill="url(#paint0_linear_2_609)" id="Vector_2" />
          <defs>
            <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_2_609" x1="11.6649" x2="11.6649" y1="5.53327e-07" y2="18.6667">
              <stop stopColor="#3E4E5A" />
              <stop offset="1" stopColor="#1E2A34" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </div>
  );
}

function Vector() {
  return (
    <div className="absolute contents inset-[8.33%_41.67%_66.67%_41.67%]" data-name="Vector_4">
      <div className="absolute inset-[28.21%_41.67%_66.67%_41.67%]" data-name="Vector">
        <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 4.6666 1.43449">
          <path d={svgPaths.pa72b180} fill="var(--fill-0, #D94482)" id="Vector" />
        </svg>
      </div>
      <div className="absolute inset-[13.56%_43.66%_69.61%_42.64%]" data-name="Vector">
        <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 3.8362 4.71343">
          <path d={svgPaths.p9b83500} fill="var(--fill-0, #D94482)" id="Vector" />
        </svg>
      </div>
      <div className="absolute inset-[8.33%_46.72%_86.43%_46.71%]" data-name="Vector">
        <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 1.84206 1.46647">
          <path d={svgPaths.p6864700} fill="var(--fill-0, #D94482)" id="Vector" />
        </svg>
      </div>
    </div>
  );
}

function Golf() {
  return (
    <div className="absolute contents inset-[8.33%_0]" data-name="Golf">
      <Group2 />
      <div className="absolute inset-[39.29%_18.45%_22.62%_18.45%]" data-name="Vector_3">
        <div className="absolute inset-[-4.69%_-2.83%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18.6664 11.667">
            <path d={svgPaths.p3acc7600} fill="url(#paint0_linear_2_537)" id="Vector_3" stroke="var(--stroke-0, #121E27)" />
            <defs>
              <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_2_537" x1="9.33306" x2="9.33306" y1="6.24864e-05" y2="11.6668">
                <stop stopColor="#01101F" />
                <stop offset="1" stopColor="#D94482" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>
      <Vector />
    </div>
  );
}

function Icon6() {
  return (
    <div className="overflow-clip relative shrink-0 size-[28px]" data-name="Icon">
      <Golf />
    </div>
  );
}

function Container6({ selected }: { selected?: boolean }) {
  return (
    <div className="absolute bg-[#050b11] content-stretch flex items-center left-[8px] p-[20px] rounded-[34px] top-[8px]" data-name="Container">
      <div aria-hidden="true" className={`absolute border border-solid inset-0 pointer-events-none rounded-[34px] shadow-[0px_0px_4.484px_0px_rgba(137,148,158,0.04)] ${selected ? 'border-[#0781c2]' : 'border-[#121e27]'}`} />
      <Icon6 />
    </div>
  );
}

function Frame6({ selected }: { selected?: boolean }) {
  return (
    <div className="bg-[#030609] overflow-hidden relative rounded-[99px] shrink-0 size-[84px]">
      <div aria-hidden="true" className="absolute border border-[rgba(18,30,39,0.4)] border-solid inset-0 pointer-events-none rounded-[99px]" />
      <div className="-translate-x-1/2 -translate-y-1/2 absolute left-[calc(50%+0.5px)] size-[84px] top-1/2" data-name="agent-ring" style={{ animationDelay: '-26s' }}>
        <div className="absolute left-0 size-[84px] top-0">
          <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 84 84">
            <g id="Ellipse 6">
              <circle cx="42" cy="42" fill="var(--fill-0, #D9D9D9)" r="41.5" />
              <circle cx="42" cy="42" fill="var(--fill-1, #030609)" r="41.5" />
              <circle cx="42" cy="42" r="41.5" stroke="var(--stroke-0, #091015)" />
            </g>
          </svg>
        </div>
        <div className="absolute left-0 size-[84px] top-0">
          {selected ? (
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 84 84">
              <circle cx="42" cy="42" r="41" stroke="#0781C2" strokeWidth="2" fill="none" />
            </svg>
          ) : (
            <div className="absolute bottom-1/2 left-1/2 right-0 top-0">
              <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 42 42">
                <path d={svgPaths.p25566ec0} id="Ellipse 7" stroke="var(--stroke-0, #0781C2)" />
              </svg>
            </div>
          )}
        </div>
      </div>
      <Container6 selected={selected} />
      <div className="-translate-x-1/2 absolute bottom-[20px] left-1/2 size-[4px]" data-name="StatusActive">
        <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 4 4">
          <circle cx="2" cy="2" fill="#00A46E" r="2" />
        </svg>
      </div>
    </div>
  );
}

function AgentGolf({ onClick, selected, onHover }: { onClick?: () => void; selected?: boolean; onHover?: (hovered: boolean) => void }) {
  return (
    <div className={`-translate-x-1/2 absolute content-stretch flex flex-col gap-[2px] items-center left-[calc(50%-225px)] top-[258px] w-[110px] cursor-pointer ${selected ? "z-[999]" : ""}`} data-name="AgentGolf" onClick={onClick} onMouseEnter={() => onHover?.(true)} onMouseLeave={() => onHover?.(false)}>
      <Frame6 selected={selected} />
      <p className="font-['Inter:Medium',sans-serif] font-medium leading-[normal] not-italic relative shrink-0 text-[#89949e] text-[10px] text-center w-full whitespace-pre-wrap">{"Identity\nSecurity Analyst"}</p>
    </div>
  );
}

function Hotel() {
  return (
    <div className="absolute inset-[8.33%_0]" data-name="Hotel">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 28 23.3334">
        <g id="Hotel">
          <g id="Group 8">
            <path d={svgPaths.p39296bf0} fill="url(#paint0_linear_2_525)" id="Vector" />
            <path d={svgPaths.p36bcf800} fill="url(#paint1_linear_2_525)" id="Vector_2" />
          </g>
          <path d={svgPaths.p33231a00} fill="url(#paint2_linear_2_525)" id="Vector_3" stroke="var(--stroke-0, #121E27)" />
          <g id="Vector_4">
            <path d={svgPaths.p3fc13c80} fill="var(--fill-0, #1F728D)" id="Vector_5" />
            <path d={svgPaths.p27fb0e80} fill="var(--fill-0, #1F728D)" id="Vector_6" />
            <path d={svgPaths.p26be0300} fill="var(--fill-0, #1F728D)" id="Vector_7" />
          </g>
        </g>
        <defs>
          <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_2_525" x1="13.9979" x2="13.9979" y1="8.16666" y2="19.8334">
            <stop stopColor="#3E4E5A" />
            <stop offset="1" stopColor="#1E2A34" />
          </linearGradient>
          <linearGradient gradientUnits="userSpaceOnUse" id="paint1_linear_2_525" x1="13.9982" x2="13.9982" y1="4.66666" y2="23.3334">
            <stop stopColor="#3E4E5A" />
            <stop offset="1" stopColor="#1E2A34" />
          </linearGradient>
          <linearGradient gradientUnits="userSpaceOnUse" id="paint2_linear_2_525" x1="14" x2="14" y1="8.16666" y2="19.8334">
            <stop stopColor="#01101F" />
            <stop offset="1" stopColor="#1F728D" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

function Icon7() {
  return (
    <div className="overflow-clip relative shrink-0 size-[28px]" data-name="Icon">
      <Hotel />
    </div>
  );
}

function Container7({ selected }: { selected?: boolean }) {
  return (
    <div className="absolute bg-[#050b11] content-stretch flex items-center left-[8px] p-[20px] rounded-[34px] top-[8px]" data-name="Container">
      <div aria-hidden="true" className={`absolute border border-solid inset-0 pointer-events-none rounded-[34px] shadow-[0px_0px_4.484px_0px_rgba(137,148,158,0.04)] ${selected ? 'border-[#0781c2]' : 'border-[#121e27]'}`} />
      <Icon7 />
    </div>
  );
}

function Frame7({ selected }: { selected?: boolean }) {
  return (
    <div className="bg-[#030609] overflow-hidden relative rounded-[99px] shrink-0 size-[84px]">
      <div aria-hidden="true" className="absolute border border-[rgba(18,30,39,0.4)] border-solid inset-0 pointer-events-none rounded-[99px]" />
      <div className="-translate-x-1/2 -translate-y-1/2 absolute left-[calc(50%+0.5px)] size-[84px] top-1/2" data-name="agent-ring" style={{ animationDelay: '-5s' }}>
        <div className="absolute left-0 size-[84px] top-0">
          <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 84 84">
            <g id="Ellipse 6">
              <circle cx="42" cy="42" fill="var(--fill-0, #D9D9D9)" r="41.5" />
              <circle cx="42" cy="42" fill="var(--fill-1, #030609)" r="41.5" />
              <circle cx="42" cy="42" r="41.5" stroke="var(--stroke-0, #091015)" />
            </g>
          </svg>
        </div>
        <div className="absolute left-0 size-[84px] top-0">
          {selected ? (
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 84 84">
              <circle cx="42" cy="42" r="41" stroke="#0781C2" strokeWidth="2" fill="none" />
            </svg>
          ) : (
            <div className="absolute bottom-1/2 left-1/2 right-0 top-0">
              <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 42 42">
                <path d={svgPaths.p25566ec0} id="Ellipse 7" stroke="var(--stroke-0, #0781C2)" />
              </svg>
            </div>
          )}
        </div>
      </div>
      <Container7 selected={selected} />
      <div className="-translate-x-1/2 absolute bottom-[20px] left-1/2 size-[4px]" data-name="StatusActive">
        <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 4 4">
          <circle cx="2" cy="2" fill="#00A46E" r="2" />
        </svg>
      </div>
    </div>
  );
}

function AgentHotel({ onClick, selected, onHover }: { onClick?: () => void; selected?: boolean; onHover?: (hovered: boolean) => void }) {
  return (
    <div className={`-translate-x-1/2 absolute content-stretch flex flex-col gap-[2px] items-center left-[calc(50%-159px)] top-[99px] w-[110px] cursor-pointer ${selected ? "z-[999]" : ""}`} data-name="AgentHotel" onClick={onClick} onMouseEnter={() => onHover?.(true)} onMouseLeave={() => onHover?.(false)}>
      <Frame7 selected={selected} />
      <p className="font-['Inter:Medium',sans-serif] font-medium leading-[normal] not-italic relative shrink-0 text-[#89949e] text-[10px] text-center w-full whitespace-pre-wrap">{"Vulnerability\nAnalyst"}</p>
    </div>
  );
}

function India() {
  return (
    <div className="absolute inset-[8.33%_0]" data-name="India">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 28 23.3334">
        <g id="India">
          <g id="Group 8">
            <path d={svgPaths.p39296bf0} fill="url(#paint0_linear_india)" id="Vector" />
            <path d={svgPaths.p36bcf800} fill="url(#paint1_linear_india)" id="Vector_2" />
          </g>
          <path d={svgPaths.p33231a00} fill="url(#paint2_linear_india)" id="Vector_3" stroke="var(--stroke-0, #121E27)" />
          <g id="Vector_4">
            <path d={svgPaths.p3fc13c80} fill="var(--fill-0, #C23B58)" id="Vector_5" />
            <path d={svgPaths.p27fb0e80} fill="var(--fill-0, #C23B58)" id="Vector_6" />
            <path d={svgPaths.p26be0300} fill="var(--fill-0, #C23B58)" id="Vector_7" />
          </g>
        </g>
        <defs>
          <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_india" x1="13.9979" x2="13.9979" y1="8.16666" y2="19.8334">
            <stop stopColor="#3E4E5A" />
            <stop offset="1" stopColor="#1E2A34" />
          </linearGradient>
          <linearGradient gradientUnits="userSpaceOnUse" id="paint1_linear_india" x1="13.9982" x2="13.9982" y1="4.66666" y2="23.3334">
            <stop stopColor="#3E4E5A" />
            <stop offset="1" stopColor="#1E2A34" />
          </linearGradient>
          <linearGradient gradientUnits="userSpaceOnUse" id="paint2_linear_india" x1="14" x2="14" y1="8.16666" y2="19.8334">
            <stop stopColor="#01101F" />
            <stop offset="1" stopColor="#C23B58" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

function Icon8() {
  return (
    <div className="overflow-clip relative shrink-0 size-[28px]" data-name="Icon">
      <India />
    </div>
  );
}

function Container8({ selected }: { selected?: boolean }) {
  return (
    <div className="absolute bg-[#050b11] content-stretch flex items-center left-[8px] p-[20px] rounded-[34px] top-[8px]" data-name="Container">
      <div aria-hidden="true" className={`absolute border border-solid inset-0 pointer-events-none rounded-[34px] shadow-[0px_0px_4.484px_0px_rgba(137,148,158,0.04)] ${selected ? 'border-[#0781c2]' : 'border-[#121e27]'}`} />
      <Icon8 />
    </div>
  );
}

function Frame8({ selected }: { selected?: boolean }) {
  return (
    <div className="bg-[#030609] overflow-hidden relative rounded-[99px] shrink-0 size-[84px]">
      <div aria-hidden="true" className="absolute border border-[rgba(18,30,39,0.4)] border-solid inset-0 pointer-events-none rounded-[99px]" />
      <div className="-translate-x-1/2 -translate-y-1/2 absolute left-[calc(50%+0.5px)] size-[84px] top-1/2" data-name="agent-ring" style={{ animationDelay: '-19s' }}>
        <div className="absolute left-0 size-[84px] top-0">
          <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 84 84">
            <g id="Ellipse 6">
              <circle cx="42" cy="42" fill="var(--fill-0, #D9D9D9)" r="41.5" />
              <circle cx="42" cy="42" fill="var(--fill-1, #030609)" r="41.5" />
              <circle cx="42" cy="42" r="41.5" stroke="var(--stroke-0, #091015)" />
            </g>
          </svg>
        </div>
        <div className="absolute left-0 size-[84px] top-0">
          {selected ? (
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 84 84">
              <circle cx="42" cy="42" r="41" stroke="#0781C2" strokeWidth="2" fill="none" />
            </svg>
          ) : (
            <div className="absolute bottom-1/2 left-1/2 right-0 top-0">
              <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 42 42">
                <path d={svgPaths.p25566ec0} id="Ellipse 7" stroke="var(--stroke-0, #0781C2)" />
              </svg>
            </div>
          )}
        </div>
      </div>
      <Container8 selected={selected} />
      <div className="-translate-x-1/2 absolute bottom-[20px] left-1/2 size-[4px]" data-name="StatusActive">
        <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 4 4">
          <circle cx="2" cy="2" fill="#00A46E" r="2" />
        </svg>
      </div>
    </div>
  );
}

function AgentFoxtrot({ onClick, selected, onHover }: { onClick?: () => void; selected?: boolean; onHover?: (hovered: boolean) => void }) {
  return (
    <div className={`-translate-x-1/2 absolute content-stretch flex flex-col gap-[2px] items-center left-[calc(50%-159px)] top-[417px] w-[110px] cursor-pointer ${selected ? "z-[999]" : ""}`} data-name="AgentFoxtrot" onClick={onClick} onMouseEnter={() => onHover?.(true)} onMouseLeave={() => onHover?.(false)}>
      <Frame8 selected={selected} />
      <p className="font-['Inter:Medium',sans-serif] font-medium leading-[normal] not-italic relative shrink-0 text-[#89949e] text-[10px] text-center w-full whitespace-pre-wrap">{"Exposure\nAnalyst"}</p>
    </div>
  );
}

function Glow() {
  return <div className="-translate-x-1/2 -translate-y-1/2 absolute blur-[30px] left-1/2 rounded-[99px] size-[240px] top-1/2" data-name="glow" style={{ backgroundImage: "url('data:image/svg+xml;utf8,<svg viewBox=\\'0 0 240 240\\' xmlns=\\'http://www.w3.org/2000/svg\\' preserveAspectRatio=\\'none\\'><rect x=\\'0\\' y=\\'0\\' height=\\'100%\\' width=\\'100%\\' fill=\\'url(%23grad)\\' opacity=\\'0.4000000059604645\\'/><defs><radialGradient id=\\'grad\\' gradientUnits=\\'userSpaceOnUse\\' cx=\\'0\\' cy=\\'0\\' r=\\'10\\' gradientTransform=\\'matrix(0 -16.971 -16.971 0 120 120)\\'><stop stop-color=\\'rgba(7,129,194,0.28)\\' offset=\\'0\\'/><stop stop-color=\\'rgba(7,129,194,0.1)\\' offset=\\'0.45\\'/><stop stop-color=\\'rgba(0,0,0,0)\\' offset=\\'0.68\\'/></radialGradient></defs></svg>')" }} />;
}

function Group() {
  return (
    <div className="absolute inset-[5.93%_12.53%_14.98%_31.64%] mask-intersect mask-luminance mask-no-clip mask-no-repeat mask-position-[0px_40.391px] mask-size-[70.714px_86.696px]" data-name="Group" style={{ maskImage: `url('${imgGroup}')` }}>
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 106.076 150.274">
        <g id="Group">
          <path d={svgPaths.p34455480} fill="url(#paint0_linear_1_1953)" id="Vector" />
          <path d={svgPaths.p2ba8bf80} fill="url(#paint1_linear_1_1953)" id="Vector_2" />
        </g>
        <defs>
          <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_1_1953" x1="64.4534" x2="28.9418" y1="65.7253" y2="38.4135">
            <stop stopColor="#136C88" />
            <stop offset="1" stopColor="#117591" />
          </linearGradient>
          <linearGradient gradientUnits="userSpaceOnUse" id="paint1_linear_1_1953" x1="77.3144" x2="61.9784" y1="85.7022" y2="135.078">
            <stop stopColor="#002B43" />
            <stop offset="1" stopColor="#0A2135" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

function MaskGroup() {
  return (
    <div className="absolute contents inset-[27.19%_31.14%_27.19%_31.64%]" data-name="Mask group">
      <Group />
    </div>
  );
}

function Group1() {
  return (
    <div className="absolute contents inset-[0_8.97%_0_9.47%]">
      <div className="absolute inset-[0_8.97%_66.44%_50.25%]" data-name="Vector">
        <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 40.7806 33.5617">
          <path d={svgPaths.p38a29500} fill="url(#paint0_linear_2_561)" id="Vector" />
          <defs>
            <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_2_561" x1="-6.39742" x2="42.1459" y1="5.95284" y2="31.3072">
              <stop stopColor="#45C2D4" />
              <stop offset="0.24" stopColor="#33A6BD" />
              <stop offset="0.75" stopColor="#117191" />
              <stop offset="1" stopColor="#045D80" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      <div className="absolute inset-[64.88%_49.75%_0_9.47%]" data-name="Vector">
        <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 40.7805 35.1205">
          <path d={svgPaths.p6f01180} fill="url(#paint0_linear_2_565)" id="Vector" />
          <defs>
            <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_2_565" x1="56.0079" x2="12.8367" y1="35.8895" y2="9.1279">
              <stop stopColor="#091627" />
              <stop offset="1" stopColor="#08162A" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      <div className="absolute inset-[0_49.75%_26.71%_9.47%]" data-name="Vector">
        <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 40.7805 73.2911">
          <path d={svgPaths.p76b4e80} fill="url(#paint0_linear_2_515)" id="Vector" />
          <defs>
            <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_2_515" x1="8.05042" x2="51.3105" y1="43.4273" y2="19.637">
              <stop stopColor="#0B446C" />
              <stop offset="1" stopColor="#01719B" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      <div className="absolute inset-[26.71%_8.97%_0_50.25%]" data-name="Vector">
        <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 40.7806 73.2908">
          <path d={svgPaths.p3386c500} fill="url(#paint0_linear_2_507)" id="Vector" />
          <defs>
            <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_2_507" x1="29.4448" x2="1.11942" y1="32.1181" y2="60.7102">
              <stop stopColor="#061B30" />
              <stop offset="1" stopColor="#071D37" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      <div className="absolute inset-[11.28%_18.17%_11.28%_18.67%]" data-name="Vector">
        <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 63.1582 77.439">
          <path d={svgPaths.p2fb5f100} fill="url(#paint0_linear_2_585)" id="Vector" />
          <defs>
            <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_2_585" x1="0" x2="63.1582" y1="38.7142" y2="38.7142">
              <stop stopColor="#05172C" />
              <stop offset="1" stopColor="#05172C" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      <div className="absolute inset-[11.28%_49.75%_31.97%_18.67%]" data-name="Vector">
        <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 31.5793 56.7505">
          <path d={svgPaths.p3e1dd100} fill="url(#paint0_linear_2_569)" id="Vector" />
          <defs>
            <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_2_569" x1="14.6048" x2="41.1466" y1="29.0161" y2="14.6885">
              <stop stopColor="#071F33" />
              <stop offset="1" stopColor="#0A1625" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      <div className="absolute inset-[31.97%_18.17%_11.28%_50.25%]" data-name="Vector">
        <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 31.579 56.7505">
          <path d={svgPaths.pb28f480} fill="url(#paint0_radial_2_489)" id="Vector" />
          <defs>
            <radialGradient cx="0" cy="0" gradientTransform="translate(37.1395 47.7952) scale(34.0273 34.0273)" gradientUnits="userSpaceOnUse" id="paint0_radial_2_489" r="1">
              <stop stopColor="#024667" />
              <stop offset="1" stopColor="#052437" />
            </radialGradient>
          </defs>
        </svg>
      </div>
      <div className="absolute inset-[26.71%_8.97%_26.71%_81.83%]" data-name="Vector">
        <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 9.20158 46.5818">
          <path d={svgPaths.p18980700} fill="url(#paint0_linear_2_477)" id="Vector" />
          <defs>
            <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_2_477" x1="4.59842" x2="4.59842" y1="-0.816053" y2="39.1955">
              <stop stopColor="#0D3454" />
              <stop offset="1" stopColor="#052540" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      <div className="absolute inset-[26.71%_81.33%_26.71%_9.47%]" data-name="Vector">
        <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 9.20121 46.5818">
          <path d={svgPaths.p3300da00} fill="url(#paint0_linear_2_485)" id="Vector" />
          <defs>
            <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_2_485" x1="4.598" x2="4.598" y1="0" y2="38.0602">
              <stop stopColor="#061D35" />
              <stop offset="1" stopColor="#061930" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      <div className="absolute inset-[31.97%_18.17%_31.97%_74.58%]" data-name="Vector">
        <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 7.25001 36.0673">
          <path d={svgPaths.p46b1300} fill="url(#paint0_linear_2_493)" id="Vector" />
          <defs>
            <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_2_493" x1="5.09527" x2="2.40632" y1="35.9473" y2="-0.60679">
              <stop stopColor="#081F34" />
              <stop offset="1" stopColor="#0A1620" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      <div className="absolute inset-[31.97%_74.07%_31.97%_18.67%]" data-name="Vector">
        <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 7.25011 36.0673">
          <path d={svgPaths.pde38f80} fill="var(--fill-0, #002B44)" id="Vector" />
        </svg>
      </div>
      <div className="absolute inset-[27.19%_31.14%_27.19%_31.64%]" data-name="Vector">
        <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 37.2181 45.6295">
          <path d={svgPaths.p366ae180} fill="url(#paint0_linear_2_611)" id="Vector" />
          <defs>
            <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_2_611" x1="21.6665" x2="2.20747" y1="20.4687" y2="35.398">
              <stop stopColor="#082338" />
              <stop offset="1" stopColor="#072239" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      <MaskGroup />
      <div className="absolute inset-[63.89%_49.74%_11.28%_18.69%]" data-name="Vector">
        <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 31.574 24.8263">
          <path d={svgPaths.p2fc07400} fill="url(#paint0_linear_2_479)" id="Vector" />
          <defs>
            <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_2_479" x1="-15.2063" x2="26.2437" y1="19.0511" y2="11.1053">
              <stop stopColor="#005A7E" />
              <stop offset="1" stopColor="#002A41" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      <div className="absolute inset-[38.56%_54.83%_60.02%_43%]" data-name="Vector">
        <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 2.16418 1.42153">
          <path d={svgPaths.p1fa50d00} fill="var(--fill-0, #1EB2C2)" id="Vector" />
        </svg>
      </div>
      <div className="absolute inset-[45.75%_34.64%_36.66%_58.86%]" data-name="Vector">
        <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 6.50211 17.5917">
          <path d={svgPaths.p21fe0100} fill="var(--fill-0, #085A71)" id="Vector" />
        </svg>
      </div>
      <div className="absolute inset-[52.73%_37.06%_45.3%_61.67%]" data-name="Vector">
        <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 1.27632 1.97061">
          <path d={svgPaths.p28cbbff0} fill="var(--fill-0, #085A71)" id="Vector" />
        </svg>
      </div>
      <div className="absolute inset-[44.78%_34.22%_53.25%_64.51%]" data-name="Vector">
        <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 1.27631 1.97065">
          <path d={svgPaths.p119abc00} fill="var(--fill-0, #085A71)" id="Vector" />
        </svg>
      </div>
      <div className="absolute inset-[62%_40.29%_36.03%_58.43%]" data-name="Vector">
        <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 1.27632 1.96558">
          <path d={svgPaths.p20243b80} fill="var(--fill-0, #085A71)" id="Vector" />
        </svg>
      </div>
      <div className="absolute inset-[47.44%_37.53%_32.78%_52.9%]" data-name="Vector">
        <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 9.5779 19.7837">
          <path d={svgPaths.p15fce300} fill="var(--fill-0, #085A71)" id="Vector" />
        </svg>
      </div>
      <div className="absolute inset-[46.63%_37.02%_51.4%_61.7%]" data-name="Vector">
        <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 1.27632 1.97069">
          <path d={svgPaths.p26358e00} fill="var(--fill-0, #085A71)" id="Vector" />
        </svg>
      </div>
      <div className="absolute inset-[65.87%_46.14%_32.16%_52.59%]" data-name="Vector">
        <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 1.27658 1.96547">
          <path d={svgPaths.p2f6e0270} fill="var(--fill-0, #085A71)" id="Vector" />
        </svg>
      </div>
      <div className="absolute inset-[58.98%_34.8%_37.85%_60.59%]" data-name="Vector">
        <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 4.6148 3.17069">
          <path d={svgPaths.p2feefaf0} fill="var(--fill-0, #085A71)" id="Vector" />
        </svg>
      </div>
      <div className="absolute inset-[58.34%_34.58%_39.68%_64.15%]" data-name="Vector">
        <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 1.27632 1.97578">
          <path d={svgPaths.p37735380} fill="var(--fill-0, #085A71)" id="Vector" />
        </svg>
      </div>
      <div className="absolute inset-[45.75%_58.72%_36.66%_34.77%]" data-name="Vector">
        <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 6.50727 17.5917">
          <path d={svgPaths.p177f2e00} fill="var(--fill-0, #0C5B6F)" id="Vector" />
        </svg>
      </div>
      <div className="absolute inset-[52.73%_61.53%_45.3%_37.19%]" data-name="Vector">
        <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 1.27637 1.97061">
          <path d={svgPaths.p7d1a380} fill="var(--fill-0, #0C5B6F)" id="Vector" />
        </svg>
      </div>
      <div className="absolute inset-[44.78%_64.37%_53.25%_34.35%]" data-name="Vector">
        <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 1.27637 1.97065">
          <path d={svgPaths.p1cd37f00} fill="var(--fill-0, #0C5B6F)" id="Vector" />
        </svg>
      </div>
      <div className="absolute inset-[62%_58.29%_36.03%_40.43%]" data-name="Vector">
        <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 1.27631 1.96558">
          <path d={svgPaths.p2669bd31} fill="var(--fill-0, #0C5B6F)" id="Vector" />
        </svg>
      </div>
      <div className="absolute inset-[47.44%_52.76%_32.81%_37.66%]" data-name="Vector">
        <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 9.57785 19.7521">
          <path d={svgPaths.p38dd2800} fill="var(--fill-0, #0C5B6F)" id="Vector" />
        </svg>
      </div>
      <div className="absolute inset-[46.63%_61.57%_51.4%_37.15%]" data-name="Vector">
        <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 1.27637 1.97066">
          <path d={svgPaths.p28018200} fill="var(--fill-0, #0C5B6F)" id="Vector" />
        </svg>
      </div>
      <div className="absolute inset-[65.84%_52.45%_32.19%_46.27%]" data-name="Vector">
        <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 1.27637 1.96547">
          <path d={svgPaths.pa870380} fill="var(--fill-0, #0C5B6F)" id="Vector" />
        </svg>
      </div>
      <div className="absolute inset-[58.98%_60.46%_37.85%_34.93%]" data-name="Vector">
        <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 4.61209 3.16935">
          <path d={svgPaths.p7c9ed80} fill="var(--fill-0, #0C5B6F)" id="Vector" />
        </svg>
      </div>
      <div className="absolute inset-[58.34%_64.01%_39.68%_34.71%]" data-name="Vector">
        <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 1.27637 1.97578">
          <path d={svgPaths.p2e272550} fill="var(--fill-0, #0C5B6F)" id="Vector" />
        </svg>
      </div>
      <div className="absolute inset-[39.56%_36.87%_59.02%_60.97%]" data-name="Vector">
        <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 2.16432 1.42153">
          <path d={svgPaths.p1215800} fill="var(--fill-0, #1EB2C2)" id="Vector" />
        </svg>
      </div>
      <div className="absolute inset-[36.59%_44.36%_61.99%_53.47%]" data-name="Vector">
        <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 2.16406 1.42154">
          <path d={svgPaths.p23a352f0} fill="var(--fill-0, #1EB2C2)" id="Vector" />
        </svg>
      </div>
      <div className="absolute inset-[29.19%_46.34%_62.64%_38.57%]" data-name="Vector">
        <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 15.0966 8.17074">
          <path d={svgPaths.p23396800} fill="var(--fill-0, #1EB2C2)" id="Vector" />
        </svg>
      </div>
      <div className="absolute inset-[37.08%_45.21%_58.11%_44.07%]" data-name="Vector">
        <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 10.7235 4.81248">
          <path d={svgPaths.p3157b100} fill="var(--fill-0, #1EB2C2)" id="Vector" />
        </svg>
      </div>
      <div className="absolute inset-[40.19%_37.82%_50.95%_46.05%]" data-name="Vector">
        <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16.1216 8.856">
          <path d={svgPaths.p394eaf80} fill="var(--fill-0, #1EB2C2)" id="Vector" />
        </svg>
      </div>
      <div className="absolute inset-[36.52%_60.07%_62.06%_37.76%]" data-name="Vector">
        <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 2.16418 1.42156">
          <path d={svgPaths.p2f335070} fill="var(--fill-0, #1EB2C2)" id="Vector" />
        </svg>
      </div>
      <div className="absolute inset-[11.26%_18.16%_11.26%_18.53%]" data-name="Vector">
        <div className="absolute inset-[-0.14%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 63.4879 77.7047">
            <path d={svgPaths.p2b0e4900} id="Vector" stroke="var(--stroke-0, #0789B2)" strokeMiterlimit="10" strokeWidth="0.183158" />
          </svg>
        </div>
      </div>
      <div className="absolute inset-[39.18%_31.14%_27.19%_31.64%]" data-name="Vector">
        <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 37.2181 33.6298">
          <path d={svgPaths.p2be6b3c0} fill="url(#paint0_radial_2_426)" id="Vector" />
          <defs>
            <radialGradient cx="0" cy="0" gradientTransform="translate(18.6954 11.6336) scale(10.3416)" gradientUnits="userSpaceOnUse" id="paint0_radial_2_426" r="1">
              <stop stopColor="#6FCBDC" />
              <stop offset="1" stopColor="#34BFCB" />
            </radialGradient>
          </defs>
        </svg>
      </div>
      <div className="absolute inset-[0_8.97%_0_9.47%] mix-blend-soft-light" data-name="Vector">
        <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 81.5611 100">
          <path d={svgPaths.p18983d00} fill="url(#paint0_linear_2_523)" id="Vector" style={{ mixBlendMode: "soft-light" }} />
          <defs>
            <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_2_523" x1="3.80811" x2="72.0669" y1="30.9358" y2="66.1295">
              <stop stopColor="#45C2D4" />
              <stop offset="0.24" stopColor="#33A6BD" />
              <stop offset="0.75" stopColor="#117191" />
              <stop offset="1" stopColor="#045D80" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </div>
  );
}

function Manager() {
  const { phase, scenario } = useInvestigation();
  const investigationActive = phase === "drawing" || phase === "holding";

  return (
    <div className="-translate-x-1/2 -translate-y-1/2 absolute left-[calc(50%+0.5px)] size-[120px] top-[calc(50%+9px)]" data-name="Manager">
      <Glow />
      {/* Investigation glow overlay */}
      {investigationActive && (
        <div
          className="-translate-x-1/2 -translate-y-1/2 absolute left-1/2 top-1/2 rounded-full pointer-events-none will-change-[transform,opacity]"
          style={{
            width: 160, height: 160,
            background: `radial-gradient(circle, ${scenario.color}12 0%, ${scenario.color}06 40%, transparent 70%)`,
            animation: "investigationPulse 3s ease-in-out infinite",
          }}
        />
      )}
      <div className="-translate-x-1/2 absolute aspect-square bottom-[8.33%] left-1/2 overflow-clip top-[8.33%]" data-name="Secure">
        <Secure />
      </div>
    </div>
  );
}

function Working1() {
  const { currentStatus, fade } = useStatus();
  const { phase, centerMessage, scenario, completionMessage } = useInvestigation();

  const investigationActive = phase === "drawing" || phase === "holding";
  const showCompletion = phase === "fading";

  return (
    <div className="-translate-x-1/2 absolute content-stretch flex flex-col items-center left-[calc(50%+0.5px)] top-[365px] w-[180px]" data-name="Working">
      {/* Investigation center message */}
      {investigationActive && (
        <div
          className="flex flex-col items-center gap-[3px]"
          style={{ animation: "centerMessageIn 0.4s ease forwards" }}
          key={`inv-${centerMessage}`}
        >
          <div className="flex items-center gap-[4px]">
            <div
              className="shrink-0 rounded-full"
              style={{
                width: 4, height: 4,
                backgroundColor: scenario.color,
                boxShadow: `0 0 6px ${scenario.color}`,
                animation: "investigationPulse 2s ease-in-out infinite",
              }}
            />
            <span
              className="font-['Inter:Medium',sans-serif] font-medium uppercase"
              style={{ fontSize: 7, letterSpacing: "0.1em", color: scenario.color, opacity: 0.7 }}
            >
              Investigating
            </span>
          </div>
          <p
            className="font-['Inter:Regular',sans-serif] font-normal leading-[13px] not-italic text-[#dadfe3] text-[9px] text-center w-full"
            style={{ animation: "centerMessageIn 0.35s ease forwards" }}
            key={centerMessage}
          >
            {centerMessage}
          </p>
        </div>
      )}
      {/* Completion message */}
      {showCompletion && (
        <div
          className="flex flex-col items-center gap-[3px]"
          style={{ animation: "completionFlash 1.2s ease forwards" }}
        >
          <div className="flex items-center gap-[4px]">
            <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
              <circle cx="6" cy="6" r="5" stroke={scenario.color} strokeWidth="1" strokeOpacity="0.5" />
              <path d="M4 6l1.5 1.5 3-3" stroke={scenario.color} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span
              className="font-['Inter:Medium',sans-serif] font-medium uppercase"
              style={{ fontSize: 7, letterSpacing: "0.1em", color: scenario.color }}
            >
              Complete
            </span>
          </div>
          <p
            className="font-['Inter:Regular',sans-serif] font-normal leading-[13px] not-italic text-[#dadfe3] text-[9px] text-center w-full"
          >
            {completionMessage}
          </p>
        </div>
      )}
      {/* Default passive message (gap phase) */}
      {phase === "gap" && (
        <p
          className="font-['Inter:Regular',sans-serif] font-normal leading-[normal] not-italic relative shrink-0 text-[#89949e] text-[10px] text-center w-full whitespace-pre-wrap"
          style={{ opacity: fade ? 1 : 0, transition: "opacity 0.4s ease" }}
        >
          {centerMessage || currentStatus.title}
        </p>
      )}
    </div>
  );
}

function Status() {
  const { phase, scenario } = useInvestigation();
  const investigationActive = phase === "drawing" || phase === "holding";
  const dotColor = investigationActive ? scenario.color : "#00A46E";
  const label = investigationActive ? "INVESTIGATING" : phase === "fading" ? "COMPLETE" : "MONITORING";

  return (
    <div
      className="-translate-x-1/2 absolute content-stretch flex gap-[4px] items-center left-[calc(50%+1px)] top-[225px]"
      data-name="Status"
      style={{ transition: "opacity 0.4s ease" }}
    >
      <div className="relative shrink-0 size-[6px]">
        <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 6 6">
          <circle
            cx="3" cy="3" r="3"
            fill={dotColor}
            style={{
              animation: investigationActive ? "investigationPulse 1.5s ease-in-out infinite" : "blink 2s ease-in-out infinite",
              transition: "fill 0.4s ease",
            }}
          />
        </svg>
      </div>
      <p
        className="font-['Inter:Medium',sans-serif] font-medium leading-[normal] not-italic relative shrink-0 text-[10px] text-center uppercase"
        style={{
          color: investigationActive ? scenario.color : "#dadfe3",
          letterSpacing: "0.08em",
          transition: "color 0.4s ease",
        }}
      >
        {label}
      </p>
    </div>
  );
}

function RingLabels() {
  return null;
}

// ── Investigation Flow Visualization ──────────────────────────────────────

function getAgentCenter(id: AgentId): { cx: number; cy: number } {
  const pos = AGENT_POSITIONS[id];
  // x is the horizontal center (agent wrappers use -translate-x-1/2)
  // y is the top of the wrapper; +42 reaches center of the 84px Frame circle
  return { cx: pos.x, cy: pos.y + 42 };
}

// Geometric center of the agent ring circle (R=225 centered here)
const HUB_CENTER = { cx: 300, cy: 300 };
const ALL_AGENTS: AgentId[] = ["alpha", "bravo", "charlie", "delta", "echo", "foxtrot", "golf", "hotel"];

// Seeded pseudo-random per agent for deterministic but varied timing
function agentRandom(agentId: AgentId, seed: number): number {
  const hash = (agentId.charCodeAt(0) * 31 + agentId.charCodeAt(1) * 17 + seed * 13) % 1000;
  return hash / 1000;
}

function getFlowPath(agentId: AgentId): string {
  const a = getAgentCenter(agentId);
  const b = HUB_CENTER;
  return `M${a.cx},${a.cy} L${b.cx},${b.cy}`;
}

const AgentFlowLine = React.memo(function AgentFlowLine({ agentId, color, index }: { agentId: AgentId; color: string; index: number }) {
  const pathD = React.useMemo(() => getFlowPath(agentId), [agentId]);
  const pathRef = React.useRef<SVGPathElement>(null);
  const filterId = `flow_glow_${agentId}`;

  // Travel time: 20–30s, then a pause of 8–14s before repeating
  const travelDur = React.useMemo(() => 20 + agentRandom(agentId, 1) * 10, [agentId]);
  const pauseDur = React.useMemo(() => 8 + agentRandom(agentId, 2) * 6, [agentId]);
  const totalDur = travelDur + pauseDur;
  const travelFraction = travelDur / totalDur;
  const begin1 = React.useMemo(() => agentRandom(agentId, 3) * 15, [agentId]);

  // Opacity: fade in early, stay visible during travel, fade out at arrival, hidden during pause
  const t1 = 0.03 * travelFraction;
  const t2 = 0.90 * travelFraction;
  const t3 = travelFraction;
  const opacityKeyTimes = `0;${t1.toFixed(4)};${t2.toFixed(4)};${t3.toFixed(4)};1`;
  const opacityValues = "0;0.7;0.7;0;0";

  const rKeyTimes = `0;${(0.5 * travelFraction).toFixed(4)};${t3.toFixed(4)};1`;
  const rValues = "1.5;2.5;1;1";

  return (
    <g>
      <defs>
        <filter id={filterId} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>
      {/* Faint static line */}
      <path
        ref={pathRef}
        d={pathD}
        fill="none"
        stroke={color}
        strokeOpacity="0.06"
        strokeWidth="1"
      />
      {/* Single particle: travels to center then waits before next trip */}
      <circle r="1.5" fill={color} opacity="0">
        <animateMotion dur={`${totalDur}s`} repeatCount="indefinite" begin={`${begin1}s`} path={pathD} keyPoints="0;1;1" keyTimes={`0;${travelFraction.toFixed(4)};1`} calcMode="linear" />
        <animate attributeName="opacity" values={opacityValues} keyTimes={opacityKeyTimes} dur={`${totalDur}s`} repeatCount="indefinite" begin={`${begin1}s`} calcMode="linear" />
        <animate attributeName="r" values={rValues} keyTimes={rKeyTimes} dur={`${totalDur}s`} repeatCount="indefinite" begin={`${begin1}s`} calcMode="linear" />
      </circle>
    </g>
  );
});

// Per-agent flow particle colors (Delta uses its orange ring color)
const AGENT_FLOW_COLORS: Record<AgentId, string> = {
  alpha: "#0781C2", bravo: "#0781C2", charlie: "#0781C2",
  delta: "#F05B06",
  echo: "#0781C2", foxtrot: "#0781C2", golf: "#0781C2", hotel: "#0781C2",
};

const AgentFlowOverlay = React.memo(function AgentFlowOverlay() {
  return (
    <div className="absolute inset-0 pointer-events-none" data-name="AgentFlow">
      <svg className="absolute inset-0 size-full" viewBox="0 0 600 600" fill="none" style={{ overflow: "visible" }}>
        {ALL_AGENTS.map((agentId, i) => (
          <AgentFlowLine key={`flow-${agentId}`} agentId={agentId} color={AGENT_FLOW_COLORS[agentId]} index={i} />
        ))}
      </svg>
    </div>
  );
});

function getCurvedPath(from: AgentId, to: AgentId): string {
  const a = getAgentCenter(from);
  const b = getAgentCenter(to);
  const mx = (a.cx + b.cx) / 2;
  const my = (a.cy + b.cy) / 2;
  const dx = mx - 300;
  const dy = my - 300;
  const dist = Math.sqrt(dx * dx + dy * dy) || 1;
  const push = 35;
  const cpx = mx + (dx / dist) * push;
  const cpy = my + (dy / dist) * push;
  return `M${a.cx},${a.cy} Q${cpx},${cpy} ${b.cx},${b.cy}`;
}

const InvestigationSegment = React.memo(function InvestigationSegment({
  from,
  to,
  color,
  index,
  active,
}: {
  from: AgentId;
  to: AgentId;
  color: string;
  index: number;
  active: boolean;
}) {
  const pathD = React.useMemo(() => getCurvedPath(from, to), [from, to]);
  const pathRef = React.useRef<SVGPathElement>(null);
  const [pathLength, setPathLength] = React.useState(300);

  React.useEffect(() => {
    if (pathRef.current) {
      setPathLength(pathRef.current.getTotalLength());
    }
  }, [pathD]);

  const filterId = `inv_glow_${from}_${to}`;

  return (
    <g style={{ opacity: active ? 1 : 0, transition: "opacity 0.4s ease" }}>
      <defs>
        <filter id={filterId} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>
      {/* Faint background line */}
      <path d={pathD} fill="none" stroke={color} strokeOpacity="0.06" strokeWidth="1" />
      {/* Draw-in line */}
      <path
        ref={pathRef}
        d={pathD}
        fill="none"
        stroke={color}
        strokeOpacity="0.35"
        strokeWidth="1.5"
        strokeLinecap="round"
        filter={`url(#${filterId})`}
        style={{
          strokeDasharray: pathLength,
          strokeDashoffset: active ? 0 : pathLength,
          transition: active ? `stroke-dashoffset 1.2s ease-out ${index * 0.1}s` : "none",
        }}
      />
      {/* Wide glow overlay */}
      <path
        d={pathD}
        fill="none"
        stroke={color}
        strokeOpacity="0.12"
        strokeWidth="4"
        strokeLinecap="round"
        filter={`url(#${filterId})`}
        style={{
          strokeDasharray: pathLength,
          strokeDashoffset: active ? 0 : pathLength,
          transition: active ? `stroke-dashoffset 1.2s ease-out ${index * 0.1}s` : "none",
        }}
      />
      {/* Traveling pulse */}
      {active && (
        <circle r="3" fill={color} opacity="0.9">
          <animateMotion dur="1.8s" repeatCount="indefinite" begin={`${index * 0.3}s`} path={pathD} />
          <animate attributeName="opacity" values="0;0.9;0.9;0" keyTimes="0;0.1;0.85;1" dur="1.8s" repeatCount="indefinite" begin={`${index * 0.3}s`} />
          <animate attributeName="r" values="2;3.5;2" dur="1.8s" repeatCount="indefinite" begin={`${index * 0.3}s`} />
        </circle>
      )}
    </g>
  );
});

const InvestigationNodeHighlight = React.memo(function InvestigationNodeHighlight({
  agentId,
  color,
  active,
  isCurrentlyActive,
}: {
  agentId: AgentId;
  color: string;
  active: boolean;
  isCurrentlyActive?: boolean;
}) {
  const { cx, cy } = getAgentCenter(agentId);
  return (
    <g style={{ opacity: active ? 1 : 0, transition: "opacity 0.6s ease" }}>
      <circle
        cx={cx} cy={cy} r="52"
        fill="none" stroke={color} strokeOpacity="0.08" strokeWidth="1"
      />
      <circle
        cx={cx} cy={cy} r="48"
        fill={color} fillOpacity={isCurrentlyActive ? "0.06" : "0.03"}
      />
      {/* Active agent pulsing ring */}
      {isCurrentlyActive && (
        <circle
          cx={cx} cy={cy} r="46"
          fill="none" stroke={color} strokeWidth="1.5"
          style={{ animation: "activeNodeRing 2s ease-in-out infinite" }}
        />
      )}
      <circle
        cx={cx} cy={cy} r="44"
        fill="none" stroke={color} strokeOpacity="0.18" strokeWidth="0.8"
        strokeDasharray="6 4"
      >
        {active && (
          <animate
            attributeName="stroke-dashoffset"
            values="0;20"
            dur="3s"
            repeatCount="indefinite"
          />
        )}
      </circle>

    </g>
  );
});

const InvestigationLabel = React.memo(function InvestigationLabel({
  scenario,
  phase,
  revealedSegments,
}: {
  scenario: InvestigationScenario;
  phase: "drawing" | "holding" | "fading" | "gap";
  revealedSegments: number;
}) {
  const visible = phase === "drawing" || phase === "holding";
  const totalAgents = scenario.agents.length;
  const progress = phase === "holding" ? totalAgents : Math.min(revealedSegments + 1, totalAgents);
  return (
    <div
      className="absolute left-1/2 -translate-x-1/2 flex items-center gap-[6px] pointer-events-none"
      style={{ top: 5, opacity: visible ? 1 : 0, transition: "opacity 0.8s ease", zIndex: 10 }}
    >
      <div
        className="rounded-full"
        style={{
          width: 5, height: 5,
          backgroundColor: scenario.color,
          boxShadow: `0 0 6px ${scenario.color}, 0 0 12px ${scenario.color}40`,
          animation: visible ? "pulseGlow 2s ease-in-out infinite" : "none",
        }}
      />
      <span
        className="font-['Inter:Medium',sans-serif] font-medium uppercase"
        style={{ fontSize: 7, letterSpacing: "0.12em", color: scenario.color, opacity: 0.7, whiteSpace: "nowrap" }}
      >
        {scenario.name}
      </span>
      {/* Progress indicator */}
      {visible && (
        <span
          className="font-['Inter:Regular',sans-serif] font-normal"
          style={{ fontSize: 7, color: `${scenario.color}90`, whiteSpace: "nowrap" }}
        >
          {progress}/{totalAgents}
        </span>
      )}
    </div>
  );
});

const InvestigationFlowOverlay = React.memo(function InvestigationFlowOverlay() {
  const { scenario, revealedSegments, phase, activeAgentIndex } = useInvestigation();
  const isVisible = phase === "drawing" || phase === "holding";
  const isFading = phase === "fading";

  return (
    <div
      className="absolute inset-0 pointer-events-none"
      style={{ opacity: isFading ? 0 : 1, transition: "opacity 1s ease" }}
      data-name="InvestigationFlow"
    >
      <InvestigationLabel scenario={scenario} phase={phase} revealedSegments={revealedSegments} />
      <svg className="absolute inset-0 size-full" viewBox="0 0 600 600" fill="none" style={{ overflow: "visible" }}>
        {scenario.agents.map((agentId, i) => (
          <InvestigationNodeHighlight
            key={`${scenario.name}-node-${agentId}`}
            agentId={agentId}
            color={scenario.color}
            active={(isVisible || isFading) && (i === 0 ? revealedSegments >= 0 : revealedSegments >= i)}
            isCurrentlyActive={isVisible && i === activeAgentIndex}
          />
        ))}
        {scenario.agents.slice(0, -1).map((fromId, i) => {
          const toId = scenario.agents[i + 1];
          return (
            <InvestigationSegment
              key={`${scenario.name}-seg-${fromId}-${toId}`}
              from={fromId}
              to={toId}
              color={scenario.color}
              index={i}
              active={(isVisible || isFading) && revealedSegments > i}
            />
          );
        })}
      </svg>
    </div>
  );
});

const AgentWrapper = React.memo(function AgentWrapper({ agentId, isInChain, investigationActive, children }: { agentId: AgentId; isInChain: boolean; investigationActive: boolean; children: React.ReactNode }) {
  // When investigation is active, dim agents NOT in the chain
  const shouldDim = investigationActive && !isInChain;
  const [hovered, setHovered] = React.useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        opacity: shouldDim ? 0.35 : 1,
        filter: isInChain && investigationActive
          ? "brightness(1.1)"
          : shouldDim
            ? "brightness(0.7) saturate(0.4)"
            : hovered
              ? "brightness(1.15) drop-shadow(0 0 6px rgba(7,129,194,0.35))"
              : "none",
        transform: hovered && !investigationActive ? "scale(1.06)" : "scale(1)",
        transition: "opacity 0.8s ease, filter 0.3s ease, transform 0.25s ease",
      }}
    >
      {children}
    </div>
  );
});

/* Static agent registry — defined once, never recreated */
const AGENT_REGISTRY: { id: AgentId; Component: React.FC<{ onClick?: () => void; selected?: boolean; onHover?: (h: boolean) => void }> }[] = [
  { id: "alpha", Component: AgentAlpha },
  { id: "bravo", Component: AgentBravo },
  { id: "charlie", Component: AgentCharlie },
  { id: "delta", Component: AgentDelta },
  { id: "echo", Component: AgentEcho },
  { id: "foxtrot", Component: AgentFoxtrot },
  { id: "golf", Component: AgentGolf },
  { id: "hotel", Component: AgentHotel },
];

function Agents({ selectedAgent, onAgentClick, onAgentHover }: { selectedAgent?: AgentId | null; onAgentClick?: (id: AgentId) => void; onAgentHover?: (id: AgentId | null) => void }) {
  const [hoveredAgent, setHoveredAgent] = React.useState<AgentId | null>(null);
  const { scenario, phase, revealedSegments } = useInvestigation();

  /* Delay-close so cursor can move from agent node to tooltip card */
  const closeTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const tooltipHovered = React.useRef(false);

  const handleTooltipHover = React.useCallback((h: boolean) => {
    tooltipHovered.current = h;
    if (!h) {
      // cursor left tooltip — close now (agent node already fired its leave)
      setHoveredAgent(null);
      onAgentHover?.(null);
    }
  }, [onAgentHover]);

  const handleHover = React.useCallback((id: AgentId | null) => {
    if (id !== null) {
      if (closeTimer.current) { clearTimeout(closeTimer.current); closeTimer.current = null; }
      setHoveredAgent(id);
      onAgentHover?.(id);
    } else {
      closeTimer.current = setTimeout(() => {
        closeTimer.current = null;
        if (!tooltipHovered.current) {
          setHoveredAgent(null);
          onAgentHover?.(null);
        }
      }, 140);
    }
  }, [onAgentHover]);

  /* Stable per-agent callback refs — avoids new closures every render */
  const onAgentClickRef = React.useRef(onAgentClick);
  onAgentClickRef.current = onAgentClick;
  const handleHoverRef = React.useRef(handleHover);
  handleHoverRef.current = handleHover;

  const agentCallbacks = React.useMemo(() => {
    const map: Record<string, { onClick: () => void; onHover: (h: boolean) => void }> = {};
    for (const { id } of AGENT_REGISTRY) {
      map[id] = {
        onClick: () => onAgentClickRef.current?.(id),
        onHover: (h: boolean) => handleHoverRef.current(h ? id : null),
      };
    }
    return map;
  }, []); // stable — uses refs internally

  const tooltipAgent = hoveredAgent || selectedAgent;

  const investigationActive = phase === "drawing" || phase === "holding";
  const activeChainAgents = React.useMemo(() => {
    if (!investigationActive) return new Set<AgentId>();
    const revealed = new Set<AgentId>();
    for (let i = 0; i <= Math.min(revealedSegments, scenario.agents.length - 1); i++) {
      revealed.add(scenario.agents[i]);
    }
    if (revealedSegments + 1 < scenario.agents.length) {
      revealed.add(scenario.agents[revealedSegments + 1]);
    }
    return revealed;
  }, [investigationActive, revealedSegments, scenario]);

  return (
    <div className="-translate-x-1/2 -translate-y-1/2 absolute left-1/2 overflow-visible size-[600px] top-[332px]" data-name="Agents">
      {AGENT_REGISTRY.map(({ id, Component }) => (
        <AgentWrapper key={id} agentId={id} isInChain={activeChainAgents.has(id)} investigationActive={investigationActive}>
          <Component
            onClick={agentCallbacks[id].onClick}
            selected={selectedAgent === id}
            onHover={agentCallbacks[id].onHover}
          />
        </AgentWrapper>
      ))}
      <Manager />
      <Working1 />
      <Status />
      {tooltipAgent && <AgentTooltip agentId={tooltipAgent} onTooltipHover={handleTooltipHover} />}
    </div>
  );
}

export default function Working({ selectedAgent, onAgentClick, onAgentHover }: WorkingProps) {
  return (
    <div className="relative size-full" data-name="Working">
      <Base />
      <div className="-translate-x-1/2 -translate-y-1/2 absolute left-1/2 overflow-visible size-[600px] top-[332px] pointer-events-none">
        <AgentFlowOverlay />
        <InvestigationFlowOverlay />
      </div>
      <Agents selectedAgent={selectedAgent} onAgentClick={onAgentClick} onAgentHover={onAgentHover} />
    </div>
  );
}