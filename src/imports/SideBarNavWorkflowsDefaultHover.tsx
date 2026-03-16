import svgPaths from "./svg-3wm1i1jx1d";

function Icons() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="Icons">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="Icons">
          <path d={svgPaths.p114a8f70} id="Vector" stroke="var(--stroke-0, #DADFE3)" strokeLinecap="round" strokeLinejoin="round" />
          <g id="Vector_2">
            <mask fill="white" id="path-2-inside-1_6175_4202">
              <path d={svgPaths.pca5b980} />
              <path d={svgPaths.p3b7ecf80} />
              <path d={svgPaths.p1f262100} />
              <path d={svgPaths.p3f212600} />
            </mask>
            <path d={svgPaths.p11519240} fill="var(--stroke-0, #DADFE3)" mask="url(#path-2-inside-1_6175_4202)" />
          </g>
        </g>
      </svg>
    </div>
  );
}

function SideBarNavWorkflows() {
  return (
    <div className="bg-[#08121c] content-stretch flex items-center justify-center p-[4px] relative rounded-[8px] shrink-0 size-[28px]" data-name="SideBarNavWorkflows">
      <Icons />
    </div>
  );
}

function SideBarNavWorkflowsTooltip() {
  return (
    <div className="bg-[#08121c] content-stretch flex items-center justify-center p-[8px] relative rounded-[8px] shrink-0" data-name="SideBarNavWorkflowsTooltip">
      <div aria-hidden="true" className="absolute border border-[#1e2a34] border-solid inset-0 pointer-events-none rounded-[8px]" />
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[12px] text-white whitespace-nowrap">
        <p className="leading-none">Workflows</p>
      </div>
    </div>
  );
}

export default function SideBarNavWorkflowsDefaultHover() {
  return (
    <div className="content-stretch flex gap-[12px] items-center relative size-full" data-name="SideBarNavWorkflowsDefaultHover">
      <SideBarNavWorkflows />
      <SideBarNavWorkflowsTooltip />
    </div>
  );
}