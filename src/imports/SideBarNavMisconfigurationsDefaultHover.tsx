import svgPaths from "./svg-cxfacvy5gf";

function Icons() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="Icons">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="Icons">
          <path d={svgPaths.p1efffd00} id="Vector" stroke="var(--stroke-0, #DADFE3)" strokeLinecap="round" strokeLinejoin="round" />
          <path d={svgPaths.p3ed77700} id="Vector_2" stroke="var(--stroke-0, #DADFE3)" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M17 13V16.1111" id="Vector_3" stroke="var(--stroke-0, #DADFE3)" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M17 18V18.7778" id="Vector_4" stroke="var(--stroke-0, #DADFE3)" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      </svg>
    </div>
  );
}

function SideBarNavMisconfigurations() {
  return (
    <div className="bg-[#08121c] content-stretch flex items-center justify-center p-[4px] relative rounded-[8px] shrink-0 size-[28px]" data-name="SideBarNavMisconfigurations">
      <Icons />
    </div>
  );
}

function SideBarNavMisconfigurationsTooltip() {
  return (
    <div className="bg-[#08121c] content-stretch flex items-center justify-center p-[8px] relative rounded-[8px] shrink-0" data-name="SideBarNavMisconfigurationsTooltip">
      <div aria-hidden="true" className="absolute border border-[#1e2a34] border-solid inset-0 pointer-events-none rounded-[8px]" />
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[12px] text-white whitespace-nowrap">
        <p className="leading-none">Misconfigurations</p>
      </div>
    </div>
  );
}

export default function SideBarNavMisconfigurationsDefaultHover() {
  return (
    <div className="content-stretch flex gap-[12px] items-center relative size-full" data-name="SideBarNavMisconfigurationsDefaultHover">
      <SideBarNavMisconfigurations />
      <SideBarNavMisconfigurationsTooltip />
    </div>
  );
}