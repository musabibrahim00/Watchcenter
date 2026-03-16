import svgPaths from "./svg-45d05lnyah";

function SideBarNavModuleConfiguration() {
  return (
    <div className="bg-[#08121c] content-stretch flex items-center justify-center p-[4px] relative rounded-[8px] shrink-0 size-[28px]" data-name="SideBarNavModuleConfiguration">
      <div className="overflow-clip relative shrink-0 size-[24px]" data-name="Icons">
        <div className="-translate-x-1/2 -translate-y-1/2 absolute left-1/2 size-[13.333px] top-1/2" data-name="Container" />
        <div className="absolute inset-1/4" data-name="Vector">
          <div className="absolute inset-[-4.17%]">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13 13">
              <path d={svgPaths.p74b0500} id="Vector" stroke="var(--stroke-0, #DADFE3)" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

function SideBarNavModuleConfigurationTooltip() {
  return (
    <div className="bg-[#08121c] content-stretch flex items-center justify-center p-[8px] relative rounded-[8px] shrink-0" data-name="SideBarNavModuleConfigurationTooltip">
      <div aria-hidden="true" className="absolute border border-[#1e2a34] border-solid inset-0 pointer-events-none rounded-[8px]" />
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[12px] text-white whitespace-nowrap">
        <p className="leading-none">Module Configurations</p>
      </div>
    </div>
  );
}

export default function SideBarNavModuleConfigurationHover() {
  return (
    <div className="content-stretch flex gap-[12px] items-center relative size-full" data-name="SideBarNavModuleConfigurationHover">
      <SideBarNavModuleConfiguration />
      <SideBarNavModuleConfigurationTooltip />
    </div>
  );
}