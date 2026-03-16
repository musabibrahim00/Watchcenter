import svgPaths from "./svg-862ib3q53m";

function Header() {
  return (
    <div className="content-stretch flex gap-[4px] items-center relative shrink-0" data-name="Header">
      <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[normal] not-italic relative shrink-0 text-[#dadfe3] text-[12px] tracking-[0.4px] uppercase whitespace-nowrap">System Status</p>
    </div>
  );
}

function Working() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col gap-[8px] items-center justify-center leading-[1.3] min-h-px min-w-px not-italic overflow-clip relative text-[10px] w-full" data-name="Working">
      <p className="font-['IBM_Plex_Mono:SemiBold',sans-serif] relative shrink-0 text-[#dadfe3] w-full">Verified endpoint containment.</p>
      <p className="flex-[1_0_0] font-['IBM_Plex_Mono:Regular',sans-serif] min-h-px min-w-px relative text-[#89949e] w-full">Following the SOC containment action on corp-endpoint-17, the system executed automated validation checks to confirm that the endpoint was effectively isolated. These checks included verifying network segmentation enforcement, reviewing active processes, terminating suspicious sessions, and confirming that outbound communications were blocked. Continuous monitoring rules were temporarily strengthened to ensure no residual malicious activity persists after the containment action.</p>
    </div>
  );
}

function Container() {
  return (
    <div className="h-[402px] relative shrink-0 w-full" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[12px] items-start p-[16px] relative size-full">
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

function Tasks() {
  return (
    <div className="content-stretch flex gap-[4px] items-center relative shrink-0" data-name="Tasks">
      <div className="overflow-clip relative shrink-0 size-[16px]" data-name="Previous">
        <div className="-translate-x-1/2 -translate-y-1/2 absolute left-1/2 size-[16px] top-1/2" data-name="Container" />
        <div className="absolute flex inset-[29.17%_41.67%_29.17%_37.5%] items-center justify-center">
          <div className="flex-none h-[5px] rotate-90 w-[10px]">
            <div className="relative size-full" data-name="Vector">
              <div className="absolute inset-[-15%_-7.5%]">
                <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 7.66667 4.33333">
                  <path d={svgPaths.pfbb3280} id="Vector" stroke="var(--stroke-0, #89949E)" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="overflow-clip relative shrink-0 size-[16px]" data-name="Next">
        <div className="-translate-x-1/2 -translate-y-1/2 absolute left-1/2 size-[16px] top-1/2" data-name="Container" />
        <div className="absolute flex inset-[29.17%_41.67%_29.17%_37.5%] items-center justify-center">
          <div className="-scale-y-100 flex-none h-[5px] rotate-90 w-[10px]">
            <div className="relative size-full" data-name="Vector">
              <div className="absolute inset-[-15%_-7.5%]">
                <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 7.66667 4.33333">
                  <path d={svgPaths.pfbb3280} id="Vector" stroke="var(--stroke-0, #89949E)" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Time() {
  return (
    <div className="relative shrink-0 w-full" data-name="Time">
      <div aria-hidden="true" className="absolute border-[#121e27] border-solid border-t inset-0 pointer-events-none" />
      <div className="flex flex-row items-center size-full">
        <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-between px-[16px] py-[8px] relative w-full">
          <p className="font-['Inter:Regular',sans-serif] font-normal leading-[normal] not-italic relative shrink-0 text-[#89949e] text-[10px] whitespace-nowrap">March 04, 2026 - 09:04 AM</p>
          <Tasks />
        </div>
      </div>
    </div>
  );
}

export default function SystemStatusWidget() {
  return (
    <div className="relative rounded-[12px] size-full" data-name="SystemStatusWidget">
      <div className="content-stretch flex flex-col items-start max-h-[inherit] overflow-clip p-px relative rounded-[inherit] size-full">
        <Container />
        <Time />
      </div>
      <div aria-hidden="true" className="absolute border border-[rgba(87,177,255,0.16)] border-solid inset-0 pointer-events-none rounded-[12px]" />
    </div>
  );
}