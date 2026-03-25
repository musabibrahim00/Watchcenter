import svgPaths from "./svg-4nmzdf0cli";

function Alpha() {
  return (
    <div className="absolute inset-[8.33%_0]" data-name="Alpha">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 28 23.3334">
        <g id="Alpha">
          <g id="Group 8">
            <path d={svgPaths.p1413e080} fill="url(#paint0_linear_2004_1556)" id="Vector" />
            <path d={svgPaths.p224a4440} fill="url(#paint1_linear_2004_1556)" id="Vector_2" />
          </g>
          <path d={svgPaths.p3b453f40} fill="url(#paint2_linear_2004_1556)" id="Vector_3" stroke="var(--stroke-0, #121E27)" />
          <g id="Vector_4">
            <path d={svgPaths.p189b5e00} fill="var(--fill-0, #019279)" id="Vector_5" />
            <path d={svgPaths.p8a5ca00} fill="var(--fill-0, #019279)" id="Vector_6" />
            <path d={svgPaths.p102b1400} fill="var(--fill-0, #019279)" id="Vector_7" />
          </g>
        </g>
        <defs>
          <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_2004_1556" x1="13.9979" x2="13.9979" y1="8.16667" y2="19.8334">
            <stop stopColor="#3E4E5A" />
            <stop offset="1" stopColor="#1E2A34" />
          </linearGradient>
          <linearGradient gradientUnits="userSpaceOnUse" id="paint1_linear_2004_1556" x1="13.9982" x2="13.9982" y1="4.66667" y2="23.3334">
            <stop stopColor="#3E4E5A" />
            <stop offset="1" stopColor="#1E2A34" />
          </linearGradient>
          <linearGradient gradientUnits="userSpaceOnUse" id="paint2_linear_2004_1556" x1="14" x2="14" y1="8.16667" y2="19.8334">
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
    <div className="opacity-50 overflow-clip relative shrink-0 size-[28px]" data-name="Icon">
      <Alpha />
    </div>
  );
}

function Container() {
  return (
    <div className="absolute bg-[#050F18] content-stretch flex items-center left-[8px] p-[20px] rounded-[34px] top-[8px]" data-name="Container">
      <div aria-hidden="true" className="absolute border border-[#121e27] border-solid inset-0 pointer-events-none rounded-[34px] shadow-[0px_0px_4.484px_0px_rgba(137,148,158,0.04)]" />
      <Icon />
    </div>
  );
}

function Frame() {
  return (
    <div className="h-[84px] relative rounded-[99px] shrink-0 w-full">
      <div className="-translate-x-1/2 -translate-y-1/2 absolute left-[calc(50%+0.5px)] size-[84px] top-1/2" data-name="agent-ring">
        <div className="absolute left-0 size-[84px] top-0">
          <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 84 84">
            <g id="Ellipse 6">
              <circle cx="42" cy="42" fill="var(--fill-0, #D9D9D9)" r="41.5" />
              <circle cx="42" cy="42" fill="var(--fill-1, #030609)" r="41.5" />
              <circle cx="42" cy="42" r="41.5" stroke="var(--stroke-0, #091015)" />
            </g>
          </svg>
        </div>
      </div>
      <Container />
      <div className="-translate-x-1/2 absolute bottom-[20px] left-1/2 size-[4px]" data-name="StatusIdle">
        <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 4 4">
          <circle cx="2" cy="2" fill="var(--fill-0, #62707D)" id="StatusIdle" r="2" />
        </svg>
      </div>
    </div>
  );
}

export default function AgentAlpha() {
  return (
    <div className="content-stretch flex flex-col gap-[2px] items-center relative size-full" data-name="AgentAlpha">
      <Frame />
      <p className="font-['Inter:Medium',sans-serif] font-medium leading-[normal] not-italic relative shrink-0 text-[#1e2a34] text-[12px] text-center w-full whitespace-pre-wrap">Alpha</p>
    </div>
  );
}