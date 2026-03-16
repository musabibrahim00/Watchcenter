import svgPaths from "./svg-9211zzbtvq";

function Icons() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="Icons">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="Icons">
          <path d={svgPaths.p2724ee00} id="Vector" stroke="var(--stroke-0, #DADFE3)" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      </svg>
    </div>
  );
}

function SideBarNavRiskRegister() {
  return (
    <div className="bg-[#08121c] content-stretch flex items-center justify-center p-[4px] relative rounded-[8px] shrink-0 size-[28px]" data-name="SideBarNavRiskRegister">
      <Icons />
    </div>
  );
}

function SideBarNavRiskRegisterTooltip() {
  return (
    <div className="bg-[#08121c] content-stretch flex items-center justify-center p-[8px] relative rounded-[8px] shrink-0" data-name="SideBarNavRiskRegisterTooltip">
      <div aria-hidden="true" className="absolute border border-[#1e2a34] border-solid inset-0 pointer-events-none rounded-[8px]" />
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[12px] text-white whitespace-nowrap">
        <p className="leading-none">Risk Register</p>
      </div>
    </div>
  );
}

export default function SideBarNavRiskRegisterDefaultHover() {
  return (
    <div className="content-stretch flex gap-[12px] items-center relative size-full" data-name="SideBarNavRiskRegisterDefaultHover">
      <SideBarNavRiskRegister />
      <SideBarNavRiskRegisterTooltip />
    </div>
  );
}