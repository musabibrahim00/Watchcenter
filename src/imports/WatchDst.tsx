import React from "react";
import { useNavigate } from "react-router";
import svgPaths from "./svg-kxe7qom7bz";
import Tasks from "./Tasks";
import Working from "./Working";
import type { AgentId } from "./Working";
import KpiWidget from "./KpiWidget";
import ActivityFeed from "./ActivityFeed";
import { StatusProvider } from "./StatusContext";
import { InvestigationProvider } from "./InvestigationContext";
import InvestigationTimeline from "./InvestigationTimeline";
import type { TaskData } from "./Tasks";
import AiBox from "./AiBox";
import { TaskInvestigationBridgeProvider } from "./TaskInvestigationBridge";

function Bottom() {
  return (
    <div className="h-[272px] relative w-[1612.801px]" data-name="bottom">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 1612.8 371.733">
        <g id="bottom">
          <g id="Vector">
            <path d={svgPaths.p3397d300} fill="url(#paint0_linear_1_39)" style={{ mixBlendMode: "screen" }} />
          </g>
          <path d={svgPaths.p2ae43600} fill="url(#paint1_linear_1_39)" id="Vector_2" />
          <path d={svgPaths.p2723d00} fill="url(#paint2_linear_1_39)" id="Vector_3" />
        </g>
        <defs>
          <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_1_39" x1="1.49939" x2="1610.29" y1="-1.79652e-08" y2="4.35956e-05">
            <stop stopColor="#080303" />
            <stop offset="0.351792" />
            <stop offset="0.651569" />
            <stop offset="0.91" stopColor="#080303" />
          </linearGradient>
          <linearGradient gradientUnits="userSpaceOnUse" id="paint1_linear_1_39" x1="805.908" x2="1612.91" y1="549.665" y2="549.665">
            <stop />
            <stop offset="0.403846" stopColor="#0F0808" />
            <stop offset="1" stopColor="#370707" />
          </linearGradient>
          <linearGradient gradientUnits="userSpaceOnUse" id="paint2_linear_1_39" x1="-0.499268" x2="806.501" y1="549.665" y2="549.665">
            <stop stopColor="#370707" />
            <stop offset="0.596154" stopColor="#0F0808" />
            <stop offset="1" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

function Top() {
  return (
    <div className="-translate-x-1/2 absolute h-[601.715px] left-[calc(50%-0.5px)] top-0 w-[1395px]" data-name="top">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 1395 601.715">
        <g id="top">
          <path d={svgPaths.p34fc2d00} fill="url(#paint0_linear_1_30)" id="Vector" />
          <path d={svgPaths.p2ed8a780} fill="url(#paint1_linear_1_30)" id="Vector_2" />
          <g id="Vector_3">
            <path d={svgPaths.pe0fa600} fill="url(#paint2_linear_1_30)" style={{ mixBlendMode: "screen" }} />
          </g>
          <path d={svgPaths.p2cdefc0} fill="url(#paint3_linear_1_30)" id="Vector_4" />
          <path d={svgPaths.p32677770} fill="url(#paint4_linear_1_30)" id="Vector_5" />
          <g id="Vector_6">
            <path d={svgPaths.p2b0f4700} fill="url(#paint5_radial_1_30)" style={{ mixBlendMode: "screen" }} />
          </g>
          <g id="Vector_7">
            <path d={svgPaths.p3f781180} fill="url(#paint6_radial_1_30)" style={{ mixBlendMode: "screen" }} />
          </g>
        </g>
        <defs>
          <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_1_30" x1="1379" x2="1384.5" y1="4.88541e-08" y2="602">
            <stop stopColor="#071D39" />
            <stop offset="1" />
          </linearGradient>
          <linearGradient gradientUnits="userSpaceOnUse" id="paint1_linear_1_30" x1="16" x2="10.5" y1="4.88541e-08" y2="602">
            <stop stopColor="#071D39" />
            <stop offset="1" />
          </linearGradient>
          <linearGradient gradientUnits="userSpaceOnUse" id="paint2_linear_1_30" x1="165" x2="1230" y1="-1.18928e-08" y2="2.88598e-05">
            <stop stopColor="#030508" />
            <stop offset="0.15" />
            <stop offset="0.85" />
            <stop offset="1" stopColor="#030508" />
          </linearGradient>
          <linearGradient gradientUnits="userSpaceOnUse" id="paint3_linear_1_30" x1="697.833" x2="1231.56" y1="0" y2="-12.1173">
            <stop />
            <stop offset="1" stopColor="#071D39" />
          </linearGradient>
          <linearGradient gradientUnits="userSpaceOnUse" id="paint4_linear_1_30" x1="164" x2="697.725" y1="0" y2="-12.1173">
            <stop stopColor="#071D39" />
            <stop offset="1" />
          </linearGradient>
          <radialGradient cx="0" cy="0" gradientTransform="matrix(125.928 93.4085 -25.8529 31.3588 249 150)" gradientUnits="userSpaceOnUse" id="paint5_radial_1_30" r="1">
            <stop stopColor="#00060B" />
            <stop offset="1" stopOpacity="0" />
          </radialGradient>
          <radialGradient cx="0" cy="0" gradientTransform="matrix(30.0208 27.9927 -125.583 94.8815 1147.65 149.509)" gradientUnits="userSpaceOnUse" id="paint6_radial_1_30" r="1">
            <stop stopColor="#00060B" />
            <stop offset="1" stopOpacity="0" />
          </radialGradient>
        </defs>
      </svg>
    </div>
  );
}

const Bg = React.memo(function Bg() {
  return (
    <div className="absolute inset-0 overflow-clip" data-name="bg">
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex h-[272px] items-center justify-center w-[1612.801px]">
        <div className="-scale-y-100 flex-none">
          <Bottom />
        </div>
      </div>
      <Top />
    </div>
  );
});


function Container() {
  const [isDetailView, setIsDetailView] = React.useState(false);
  const [hoveredAgent, setHoveredAgent] = React.useState<AgentId | null>(null);
  const navigate = useNavigate();

  const handleAgentClick = React.useCallback((id: AgentId) => {
    navigate(`/agent/${id}`);
  }, [navigate]);

  const handleTaskDone = React.useCallback((_task: TaskData) => {
    // Task done handling - no longer shown in dashboard
  }, []);

  /* Track container size for responsive scaling */
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [dims, setDims] = React.useState({ w: 1400, h: 800 });
  React.useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => {
      setDims({ w: e.contentRect.width, h: e.contentRect.height });
    });
    ro.observe(el);
    setDims({ w: el.offsetWidth, h: el.offsetHeight });
    return () => ro.disconnect();
  }, []);

  /* Responsive calculations — memoized to avoid recalc on unrelated state changes */
  const globeNative = 600;
  const globeScale = React.useMemo(() => Math.min(1, Math.max(0.55, (dims.w - 620) / 800)), [dims.w]);
  const sideW = React.useMemo(() => Math.min(300, Math.max(220, dims.w * 0.19)), [dims.w]);
  const sideH = React.useMemo(() => Math.min(720, Math.max(520, dims.h * 0.85)), [dims.h]);

  return (
    <StatusProvider>
      <InvestigationProvider>
      <TaskInvestigationBridgeProvider>
      <div ref={containerRef} className="relative h-full bg-[#030609] overflow-clip" data-name="Container">
        <Bg />
        <div className="absolute inset-0 flex flex-col items-center">
          <div className="relative w-full flex justify-center mt-[8px]">
            <div
              className="shrink-0 z-[1] relative"
              style={{
                width: globeNative,
                height: globeNative,
                transform: `scale(${globeScale})`,
                transformOrigin: "top center",
              }}
            >
              <Working onAgentHover={setHoveredAgent} onAgentClick={handleAgentClick} />
            </div>
          </div>
          <div
            className="absolute top-[24px] left-[24px] z-[2] flex flex-col gap-[12px] overflow-hidden"
            style={{ width: sideW, height: sideH * 0.93 }}
          >
            <div style={{ flex: "1.5 1.5 0%", minHeight: 0, overflow: "hidden" }}>
              <ActivityFeed />
            </div>
            <div style={{ flex: "4 4 0%", minHeight: 0, overflow: "hidden" }}>
              <KpiWidget />
            </div>
            <div style={{ flex: "1.5 1.5 0%", minHeight: 0, overflow: "hidden" }}>
              <InvestigationTimeline hoveredAgent={hoveredAgent} />
            </div>
          </div>
          <div
            className="absolute top-[24px] right-[24px] z-[3]"
            style={{ width: sideW, height: sideH * 0.88 }}
          >
            <AiBox />
          </div>
          <div className="absolute bottom-[12px] left-0 right-0 flex justify-center px-[40px] pt-[100px] pb-[20px] z-0 max-h-[70%] overflow-y-auto" style={{ scrollbarWidth: "none" }}>
            <div className="w-full max-w-[1237px] flex flex-col gap-[12px] pointer-events-auto">
              {!isDetailView && (
                <div className="relative flex items-center justify-center w-full">
                  <p className="bg-clip-text bg-gradient-to-r font-['Inter:Regular',sans-serif] font-normal from-[#ffcba3] from-[6.932%] leading-[20px] not-italic shrink-0 text-[16px] text-[transparent] to-[48.267%] to-white via-[#ffe8a3] via-[1.412%] whitespace-nowrap">Risk tracker — required interventions</p>
                  <button
                    className="absolute right-0 font-['Inter:Regular',sans-serif] text-[11px] leading-[14px] transition-colors cursor-pointer"
                    style={{ color: "rgba(87,177,255,0.55)" }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "rgba(87,177,255,0.90)"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "rgba(87,177,255,0.55)"; }}
                    onClick={() => navigate("/case-management")}
                  >
                    View all cases →
                  </button>
                </div>
              )}
              <div className="min-h-[200px]">
                <Tasks onViewChange={setIsDetailView} onTaskDone={handleTaskDone} />
              </div>
            </div>
          </div>
        </div>
      </div>
      </TaskInvestigationBridgeProvider>
      </InvestigationProvider>
    </StatusProvider>
  );
}

export default function WatchDst() {
  return (
    <Container />
  );
}