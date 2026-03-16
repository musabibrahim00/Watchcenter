import { useStatus } from "./StatusContext";
import type { AgentId } from "./Working";
import AgentTasksStatusWidget from "./AgentTasksStatusWidget";

function Header() {
  return (
    <div className="content-stretch flex gap-[4px] items-center relative shrink-0" data-name="Header">
      <div className="bg-[#00a46e] rounded-full shrink-0 size-[5px] animate-[blink_2s_ease-in-out_infinite]" />
      <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[normal] not-italic relative shrink-0 text-[#dadfe3] text-[12px] tracking-[0.4px] uppercase whitespace-nowrap">Alex Status</p>
    </div>
  );
}

function Working() {
  const { currentStatus, fade } = useStatus();

  return (
    <div className="flex-1 min-h-0 overflow-y-auto relative w-full" data-name="Working">
      <div
        className="font-['IBM_Plex_Mono:Regular',sans-serif] leading-[1.3] not-italic relative text-[#89949e] text-[10px] w-full whitespace-pre-wrap"
        style={{ opacity: fade ? 1 : 0, transition: "opacity 0.4s ease" }}
      >
        <p className="mb-0 font-['IBM_Plex_Mono:SemiBold',sans-serif] text-[#dadfe3]">{currentStatus.title}</p>
        <p className="mb-0">&nbsp;</p>
        <p className="mb-0">{currentStatus.description}</p>
      </div>
    </div>
  );
}

function Container() {
  return (
    <div className="flex-1 min-h-0 relative w-full" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[12px] items-start pt-[16px] px-[16px] relative size-full">
        <Header />
        <div className="h-0 relative shrink-0 w-full" data-name="Separator">
          <div className="absolute inset-[-0.5px_0]">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 246 1">
              <path d="M0 0.5H246" id="Separator" stroke="var(--stroke-0, #121E27)" />
            </svg>
          </div>
        </div>
        <Working />
      </div>
    </div>
  );
}

export default function SystemStatusWidget({ hoveredAgent }: { hoveredAgent?: AgentId | null }) {
  return (
    <div className="relative rounded-[12px] w-[300px] h-[150px]" data-name="SystemStatusWidget">
      <div className="content-stretch flex flex-col items-start overflow-hidden p-px relative rounded-[inherit] size-full bg-[rgba(3,6,9,0.85)]">
        {hoveredAgent ? (
          <AgentTasksStatusWidget agentId={hoveredAgent} />
        ) : (
          <Container />
        )}
      </div>
      <div aria-hidden="true" className="absolute border border-[rgba(87,177,255,0.16)] border-solid inset-0 pointer-events-none rounded-[12px]" />
    </div>
  );
}