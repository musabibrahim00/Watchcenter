import svgPaths from "./svg-a1mpxm4s4x";

function ChevronRight() {
  return (
    <div className="h-[14px] overflow-clip relative shrink-0 w-full" data-name="ChevronRight">
      <div className="absolute bottom-1/4 left-[37.5%] right-[37.5%] top-1/4" data-name="Vector">
        <div className="absolute inset-[-8.33%_-16.67%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 4.66667 8.16667">
            <path d={svgPaths.p3a6cd80} id="Vector" stroke="var(--stroke-0, #4A5568)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16667" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function MotionDiv() {
  return (
    <div className="relative size-[14px]" data-name="motion.div">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative size-full">
        <ChevronRight />
      </div>
    </div>
  );
}

function Span() {
  return (
    <div className="h-[19.5px] relative shrink-0 w-[95.438px]" data-name="span">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="-translate-x-1/2 absolute font-['Inter:Medium',sans-serif] font-medium leading-[19.5px] left-[48px] not-italic text-[#89949e] text-[13px] text-center top-0 whitespace-nowrap">Done Today (6)</p>
      </div>
    </div>
  );
}

function Span1() {
  return (
    <div className="h-[16.5px] relative shrink-0 w-[177.266px]" data-name="span">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="-translate-x-1/2 absolute font-['Inter:Medium',sans-serif] font-medium leading-[16.5px] left-[89.5px] not-italic text-[#2c3c47] text-[11px] text-center top-0 whitespace-nowrap">Manual approvals · Auto-resolved</p>
      </div>
    </div>
  );
}

function Div() {
  return (
    <div className="flex-[1_0_0] h-[16.5px] min-h-px min-w-px relative" data-name="div">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-start justify-end relative size-full">
        <Span1 />
      </div>
    </div>
  );
}

function Button() {
  return (
    <div className="h-[39.5px] relative rounded-[10px] shrink-0 w-full" data-name="button">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[12px] items-center px-[12px] relative size-full">
          <div className="flex items-center justify-center relative shrink-0 size-[14px]" style={{ "--transform-inner-width": "1200", "--transform-inner-height": "18" } as React.CSSProperties}>
            <div className="flex-none rotate-90">
              <MotionDiv />
            </div>
          </div>
          <Span />
          <Div />
        </div>
      </div>
    </div>
  );
}

function CheckCircle() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="CheckCircle2">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g clipPath="url(#clip0_4018_4997)" id="CheckCircle2">
          <path d={svgPaths.p39ee6532} id="Vector" stroke="var(--stroke-0, #00A46E)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16667" />
          <path d={svgPaths.p17134c00} id="Vector_2" stroke="var(--stroke-0, #00A46E)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16667" />
        </g>
        <defs>
          <clipPath id="clip0_4018_4997">
            <rect fill="white" height="16" width="16" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Div1() {
  return (
    <div className="content-stretch flex flex-col gap-[2px] items-start leading-[normal] not-italic relative shrink-0 w-[720.109px] whitespace-nowrap" data-name="div">
      <p className="font-['Inter:Medium',sans-serif] font-medium relative shrink-0 text-[12px] text-white tracking-[-0.3px]">Critical vulnerability patched — orders-service</p>
      <p className="font-['Inter:Regular',sans-serif] font-normal relative shrink-0 text-[#89949e] text-[10px]">Approved by you</p>
    </div>
  );
}

function Frame() {
  return (
    <div className="content-stretch flex flex-[1_0_0] gap-[12px] items-start min-h-px min-w-px relative">
      <CheckCircle />
      <Div1 />
    </div>
  );
}

function Expand() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="Expand">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="Expand">
          <path d={svgPaths.p1fb8e3e0} id="Vector" stroke="var(--stroke-0, #89949E)" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      </svg>
    </div>
  );
}

function Div2() {
  return (
    <div className="content-stretch flex gap-[8px] items-center relative shrink-0 w-[63.891px]" data-name="div">
      <p className="font-['Inter:Regular',sans-serif] font-normal leading-[normal] not-italic relative shrink-0 text-[#89949e] text-[10px] whitespace-nowrap">2:05 PM</p>
      <Expand />
    </div>
  );
}

function Button1() {
  return (
    <div className="bg-[#071019] opacity-90 relative rounded-tl-[10px] rounded-tr-[10px] shrink-0 w-full" data-name="button">
      <div aria-hidden="true" className="absolute border border-[#141e28] border-solid inset-0 pointer-events-none rounded-tl-[10px] rounded-tr-[10px]" />
      <div className="content-stretch flex items-start justify-between p-[16px] relative w-full">
        <Frame />
        <Div2 />
      </div>
    </div>
  );
}

function CheckCircle1() {
  return (
    <div className="relative shrink-0 size-[12px]" data-name="CheckCircle2">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12 12">
        <g clipPath="url(#clip0_4018_4993)" id="CheckCircle2">
          <path d={svgPaths.p3e7757b0} id="Vector" stroke="var(--stroke-0, #00A46E)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16667" />
          <path d="M4.5 6L5.5 7L7.5 5" id="Vector_2" stroke="var(--stroke-0, #00A46E)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16667" />
        </g>
        <defs>
          <clipPath id="clip0_4018_4993">
            <rect fill="white" height="12" width="12" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Frame2() {
  return (
    <div className="content-stretch flex gap-[12px] items-start relative shrink-0 w-full">
      <CheckCircle1 />
      <p className="font-['Inter:Regular',sans-serif] font-normal leading-[normal] not-italic relative shrink-0 text-[#89949e] text-[10px] whitespace-nowrap">Isolated container from ingress</p>
    </div>
  );
}

function CheckCircle2() {
  return (
    <div className="relative shrink-0 size-[12px]" data-name="CheckCircle2">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12 12">
        <g clipPath="url(#clip0_4018_4993)" id="CheckCircle2">
          <path d={svgPaths.p3e7757b0} id="Vector" stroke="var(--stroke-0, #00A46E)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16667" />
          <path d="M4.5 6L5.5 7L7.5 5" id="Vector_2" stroke="var(--stroke-0, #00A46E)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16667" />
        </g>
        <defs>
          <clipPath id="clip0_4018_4993">
            <rect fill="white" height="12" width="12" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Frame3() {
  return (
    <div className="content-stretch flex gap-[12px] items-start relative shrink-0 w-full">
      <CheckCircle2 />
      <p className="font-['Inter:Regular',sans-serif] font-normal leading-[normal] not-italic relative shrink-0 text-[#89949e] text-[10px] whitespace-nowrap">Applied patched dependency v2.17.1</p>
    </div>
  );
}

function CheckCircle3() {
  return (
    <div className="relative shrink-0 size-[12px]" data-name="CheckCircle2">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12 12">
        <g clipPath="url(#clip0_4018_4993)" id="CheckCircle2">
          <path d={svgPaths.p3e7757b0} id="Vector" stroke="var(--stroke-0, #00A46E)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16667" />
          <path d="M4.5 6L5.5 7L7.5 5" id="Vector_2" stroke="var(--stroke-0, #00A46E)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16667" />
        </g>
        <defs>
          <clipPath id="clip0_4018_4993">
            <rect fill="white" height="12" width="12" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Frame5() {
  return (
    <div className="content-stretch flex gap-[12px] items-start relative shrink-0 w-full">
      <CheckCircle3 />
      <p className="font-['Inter:Regular',sans-serif] font-normal leading-[normal] not-italic relative shrink-0 text-[#89949e] text-[10px] whitespace-nowrap">Redeployed service via CI/CD</p>
    </div>
  );
}

function CheckCircle4() {
  return (
    <div className="relative shrink-0 size-[12px]" data-name="CheckCircle2">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12 12">
        <g clipPath="url(#clip0_4018_4993)" id="CheckCircle2">
          <path d={svgPaths.p3e7757b0} id="Vector" stroke="var(--stroke-0, #00A46E)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16667" />
          <path d="M4.5 6L5.5 7L7.5 5" id="Vector_2" stroke="var(--stroke-0, #00A46E)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16667" />
        </g>
        <defs>
          <clipPath id="clip0_4018_4993">
            <rect fill="white" height="12" width="12" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Frame6() {
  return (
    <div className="content-stretch flex gap-[12px] items-start relative shrink-0 w-full">
      <CheckCircle4 />
      <p className="font-['Inter:Regular',sans-serif] font-normal leading-[normal] not-italic relative shrink-0 text-[#89949e] text-[10px] whitespace-nowrap">Post-deploy scan verified remediation</p>
    </div>
  );
}

function Frame4() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-start relative shrink-0 w-full">
      <Frame2 />
      <Frame3 />
      <Frame5 />
      <Frame6 />
    </div>
  );
}

function Container2() {
  return (
    <div className="content-stretch flex gap-[8px] h-[16.5px] items-start leading-[normal] not-italic relative shrink-0 text-[#89949e] text-[10px] w-full whitespace-nowrap" data-name="Container">
      <p className="font-['Inter:Regular',sans-serif] font-normal relative shrink-0">Patched and verified. Zero downtime.</p>
      <p className="font-['Inter:Medium',sans-serif] font-medium relative shrink-0 tracking-[0.5px] uppercase">Result</p>
    </div>
  );
}

function Frame1() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col gap-[12px] items-start min-h-px min-w-px relative">
      <p className="font-['Inter:Regular',sans-serif] font-normal leading-[normal] not-italic relative shrink-0 text-[#89949e] text-[10px] whitespace-nowrap">WHAT WAS DONE</p>
      <Frame4 />
      <Container2 />
    </div>
  );
}

function Button2() {
  return (
    <div className="bg-[#071019] opacity-90 relative rounded-bl-[10px] rounded-br-[10px] shrink-0 w-full" data-name="button">
      <div aria-hidden="true" className="absolute border border-[#141e28] border-solid inset-0 pointer-events-none rounded-bl-[10px] rounded-br-[10px]" />
      <div className="content-stretch flex items-start justify-between p-[16px] relative w-full">
        <Frame1 />
      </div>
    </div>
  );
}

function Expanded() {
  return (
    <div className="relative shrink-0 w-full" data-name="Expanded">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative w-full">
        <Button1 />
        <Button2 />
      </div>
    </div>
  );
}

function CheckCircle5() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="CheckCircle2">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g clipPath="url(#clip0_4018_4997)" id="CheckCircle2">
          <path d={svgPaths.p39ee6532} id="Vector" stroke="var(--stroke-0, #00A46E)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16667" />
          <path d={svgPaths.p17134c00} id="Vector_2" stroke="var(--stroke-0, #00A46E)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16667" />
        </g>
        <defs>
          <clipPath id="clip0_4018_4997">
            <rect fill="white" height="16" width="16" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Div3() {
  return (
    <div className="content-stretch flex flex-col gap-[2px] items-start leading-[normal] not-italic relative shrink-0 w-[720.109px] whitespace-nowrap" data-name="div">
      <p className="font-['Inter:Medium',sans-serif] font-medium relative shrink-0 text-[12px] text-white tracking-[-0.3px]">Review over-privileged service account</p>
      <p className="font-['Inter:Regular',sans-serif] font-normal relative shrink-0 text-[#89949e] text-[10px]">Auto-resolved under policy</p>
    </div>
  );
}

function Frame7() {
  return (
    <div className="content-stretch flex flex-[1_0_0] gap-[12px] items-start min-h-px min-w-px relative">
      <CheckCircle5 />
      <Div3 />
    </div>
  );
}

function Expand1() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="Expand">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="Expand">
          <path d={svgPaths.p21e06c0} id="Vector" stroke="var(--stroke-0, #89949E)" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      </svg>
    </div>
  );
}

function Div4() {
  return (
    <div className="content-stretch flex gap-[8px] items-center relative shrink-0 w-[63.891px]" data-name="div">
      <p className="font-['Inter:Regular',sans-serif] font-normal leading-[normal] not-italic relative shrink-0 text-[#89949e] text-[10px] whitespace-nowrap">2:05 PM</p>
      <Expand1 />
    </div>
  );
}

function Collapsed() {
  return (
    <div className="bg-[#071019] opacity-90 relative rounded-[10px] shrink-0 w-full" data-name="Collapsed">
      <div aria-hidden="true" className="absolute border border-[#141e28] border-solid inset-0 pointer-events-none rounded-[10px]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-start justify-between p-[16px] relative w-full">
        <Frame7 />
        <Div4 />
      </div>
    </div>
  );
}

function CheckCircle6() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="CheckCircle2">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g clipPath="url(#clip0_4018_4997)" id="CheckCircle2">
          <path d={svgPaths.p39ee6532} id="Vector" stroke="var(--stroke-0, #00A46E)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16667" />
          <path d={svgPaths.p17134c00} id="Vector_2" stroke="var(--stroke-0, #00A46E)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16667" />
        </g>
        <defs>
          <clipPath id="clip0_4018_4997">
            <rect fill="white" height="16" width="16" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Div5() {
  return (
    <div className="content-stretch flex flex-col gap-[2px] items-start leading-[normal] not-italic relative shrink-0 w-[720.109px] whitespace-nowrap" data-name="div">
      <p className="font-['Inter:Medium',sans-serif] font-medium relative shrink-0 text-[12px] text-white tracking-[-0.3px]">TLS certificate renewed — api.payments.internal</p>
      <p className="font-['Inter:Regular',sans-serif] font-normal relative shrink-0 text-[#89949e] text-[10px]">Approved by you</p>
    </div>
  );
}

function Frame8() {
  return (
    <div className="content-stretch flex flex-[1_0_0] gap-[12px] items-start min-h-px min-w-px relative">
      <CheckCircle6 />
      <Div5 />
    </div>
  );
}

function Expand2() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="Expand">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="Expand">
          <path d={svgPaths.p21e06c0} id="Vector" stroke="var(--stroke-0, #89949E)" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      </svg>
    </div>
  );
}

function Div6() {
  return (
    <div className="content-stretch flex gap-[8px] items-center relative shrink-0 w-[63.891px]" data-name="div">
      <p className="font-['Inter:Regular',sans-serif] font-normal leading-[normal] not-italic relative shrink-0 text-[#89949e] text-[10px] whitespace-nowrap">2:05 PM</p>
      <Expand2 />
    </div>
  );
}

function Collapsed1() {
  return (
    <div className="bg-[#071019] opacity-90 relative rounded-[10px] shrink-0 w-full" data-name="Collapsed">
      <div aria-hidden="true" className="absolute border border-[#141e28] border-solid inset-0 pointer-events-none rounded-[10px]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-start justify-between p-[16px] relative w-full">
        <Frame8 />
        <Div6 />
      </div>
    </div>
  );
}

function CheckCircle7() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="CheckCircle2">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g clipPath="url(#clip0_4018_4997)" id="CheckCircle2">
          <path d={svgPaths.p39ee6532} id="Vector" stroke="var(--stroke-0, #00A46E)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16667" />
          <path d={svgPaths.p17134c00} id="Vector_2" stroke="var(--stroke-0, #00A46E)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16667" />
        </g>
        <defs>
          <clipPath id="clip0_4018_4997">
            <rect fill="white" height="16" width="16" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Div7() {
  return (
    <div className="content-stretch flex flex-col gap-[2px] items-start leading-[normal] not-italic relative shrink-0 w-[720.109px] whitespace-nowrap" data-name="div">
      <p className="font-['Inter:Medium',sans-serif] font-medium relative shrink-0 text-[12px] text-white tracking-[-0.3px]">Stale container images — staging-cluster</p>
      <p className="font-['Inter:Regular',sans-serif] font-normal relative shrink-0 text-[#89949e] text-[10px]">Auto-resolved under policy</p>
    </div>
  );
}

function Frame9() {
  return (
    <div className="content-stretch flex flex-[1_0_0] gap-[12px] items-start min-h-px min-w-px relative">
      <CheckCircle7 />
      <Div7 />
    </div>
  );
}

function Expand3() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="Expand">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="Expand">
          <path d={svgPaths.p21e06c0} id="Vector" stroke="var(--stroke-0, #89949E)" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      </svg>
    </div>
  );
}

function Div8() {
  return (
    <div className="content-stretch flex gap-[8px] items-center relative shrink-0 w-[63.891px]" data-name="div">
      <p className="font-['Inter:Regular',sans-serif] font-normal leading-[normal] not-italic relative shrink-0 text-[#89949e] text-[10px] whitespace-nowrap">2:05 PM</p>
      <Expand3 />
    </div>
  );
}

function Collapsed2() {
  return (
    <div className="bg-[#071019] opacity-90 relative rounded-[10px] shrink-0 w-full" data-name="Collapsed">
      <div aria-hidden="true" className="absolute border border-[#141e28] border-solid inset-0 pointer-events-none rounded-[10px]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-start justify-between p-[16px] relative w-full">
        <Frame9 />
        <Div8 />
      </div>
    </div>
  );
}

function CheckCircle8() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="CheckCircle2">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g clipPath="url(#clip0_4018_4997)" id="CheckCircle2">
          <path d={svgPaths.p39ee6532} id="Vector" stroke="var(--stroke-0, #00A46E)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16667" />
          <path d={svgPaths.p17134c00} id="Vector_2" stroke="var(--stroke-0, #00A46E)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16667" />
        </g>
        <defs>
          <clipPath id="clip0_4018_4997">
            <rect fill="white" height="16" width="16" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Div9() {
  return (
    <div className="content-stretch flex flex-col gap-[2px] items-start leading-[normal] not-italic relative shrink-0 w-[720.109px] whitespace-nowrap" data-name="div">
      <p className="font-['Inter:Medium',sans-serif] font-medium relative shrink-0 text-[12px] text-white tracking-[-0.3px]">Privilege drift — policy scope exceeded</p>
      <p className="font-['Inter:Regular',sans-serif] font-normal relative shrink-0 text-[#89949e] text-[10px]">Auto-resolved under policy</p>
    </div>
  );
}

function Frame10() {
  return (
    <div className="content-stretch flex flex-[1_0_0] gap-[12px] items-start min-h-px min-w-px relative">
      <CheckCircle8 />
      <Div9 />
    </div>
  );
}

function Expand4() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="Expand">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="Expand">
          <path d={svgPaths.p21e06c0} id="Vector" stroke="var(--stroke-0, #89949E)" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      </svg>
    </div>
  );
}

function Div10() {
  return (
    <div className="content-stretch flex gap-[8px] items-center relative shrink-0 w-[63.891px]" data-name="div">
      <p className="font-['Inter:Regular',sans-serif] font-normal leading-[normal] not-italic relative shrink-0 text-[#89949e] text-[10px] whitespace-nowrap">2:05 PM</p>
      <Expand4 />
    </div>
  );
}

function Collapsed3() {
  return (
    <div className="bg-[#071019] opacity-90 relative rounded-[10px] shrink-0 w-full" data-name="Collapsed">
      <div aria-hidden="true" className="absolute border border-[#141e28] border-solid inset-0 pointer-events-none rounded-[10px]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-start justify-between p-[16px] relative w-full">
        <Frame10 />
        <Div10 />
      </div>
    </div>
  );
}

function CheckCircle9() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="CheckCircle2">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g clipPath="url(#clip0_4018_4997)" id="CheckCircle2">
          <path d={svgPaths.p39ee6532} id="Vector" stroke="var(--stroke-0, #00A46E)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16667" />
          <path d={svgPaths.p17134c00} id="Vector_2" stroke="var(--stroke-0, #00A46E)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16667" />
        </g>
        <defs>
          <clipPath id="clip0_4018_4997">
            <rect fill="white" height="16" width="16" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Div11() {
  return (
    <div className="content-stretch flex flex-col gap-[2px] items-start leading-[normal] not-italic relative shrink-0 w-[720.109px] whitespace-nowrap" data-name="div">
      <p className="font-['Inter:Medium',sans-serif] font-medium relative shrink-0 text-[12px] text-white tracking-[-0.3px]">Unused API keys — 3 keys inactive 90+ days</p>
      <p className="font-['Inter:Regular',sans-serif] font-normal relative shrink-0 text-[#89949e] text-[10px]">Auto-resolved under policy</p>
    </div>
  );
}

function Frame11() {
  return (
    <div className="content-stretch flex flex-[1_0_0] gap-[12px] items-start min-h-px min-w-px relative">
      <CheckCircle9 />
      <Div11 />
    </div>
  );
}

function Expand5() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="Expand">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="Expand">
          <path d={svgPaths.p21e06c0} id="Vector" stroke="var(--stroke-0, #89949E)" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      </svg>
    </div>
  );
}

function Div12() {
  return (
    <div className="content-stretch flex gap-[8px] items-center relative shrink-0 w-[63.891px]" data-name="div">
      <p className="font-['Inter:Regular',sans-serif] font-normal leading-[normal] not-italic relative shrink-0 text-[#89949e] text-[10px] whitespace-nowrap">2:05 PM</p>
      <Expand5 />
    </div>
  );
}

function Collapsed4() {
  return (
    <div className="bg-[#071019] opacity-90 relative rounded-[10px] shrink-0 w-full" data-name="Collapsed">
      <div aria-hidden="true" className="absolute border border-[#141e28] border-solid inset-0 pointer-events-none rounded-[10px]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-start justify-between p-[16px] relative w-full">
        <Frame11 />
        <Div12 />
      </div>
    </div>
  );
}

function Container1() {
  return (
    <div className="content-stretch flex flex-col gap-[6px] items-start overflow-clip relative shrink-0 w-full" data-name="Container">
      <Expanded />
      <Collapsed />
      <Collapsed1 />
      <Collapsed2 />
      <Collapsed3 />
      <Collapsed4 />
    </div>
  );
}

export default function Container() {
  return (
    <div className="content-stretch flex flex-col items-center relative size-full" data-name="Container">
      <Button />
      <Container1 />
    </div>
  );
}