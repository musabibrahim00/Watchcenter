import svgPaths from "./svg-gqlitrnmbx";

function SideBarNavSettings() {
  return (
    <div className="bg-[#08121c] content-stretch flex items-center justify-center p-[4px] relative rounded-[8px] shrink-0 size-[28px]" data-name="SideBarNavSettings">
      <div className="overflow-clip relative shrink-0 size-[24px]" data-name="Icons">
        <div className="-translate-x-1/2 -translate-y-1/2 absolute left-1/2 size-[16px] top-1/2" data-name="Container" />
        <div className="absolute inset-[20.83%]" data-name="Vector">
          <div className="absolute inset-[-3.57%]">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 15 15">
              <g id="Vector">
                <path d={svgPaths.p308d5100} stroke="var(--stroke-0, #DADFE3)" strokeLinecap="round" strokeLinejoin="round" />
                <path d={svgPaths.p19bcd240} stroke="var(--stroke-0, #DADFE3)" strokeLinecap="round" strokeLinejoin="round" />
              </g>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

function SideBarNavSettingsTooltip() {
  return (
    <div className="bg-[#08121c] content-stretch flex items-center justify-center p-[8px] relative rounded-[8px] shrink-0" data-name="SideBarNavSettingsTooltip">
      <div aria-hidden="true" className="absolute border border-[#1e2a34] border-solid inset-0 pointer-events-none rounded-[8px]" />
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[12px] text-white whitespace-nowrap">
        <p className="leading-none">Settings</p>
      </div>
    </div>
  );
}

export default function SideBarNavSettingsHover() {
  return (
    <div className="content-stretch flex gap-[12px] items-center relative size-full" data-name="SideBarNavSettingsHover">
      <SideBarNavSettings />
      <SideBarNavSettingsTooltip />
    </div>
  );
}