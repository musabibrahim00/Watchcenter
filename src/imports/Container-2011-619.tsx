import svgPaths from "./svg-v49dyl2g2g";

function Container2() {
  return (
    <div className="flex-[1_0_0] h-[36px] min-h-px min-w-px relative" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[4px] items-start leading-[normal] not-italic relative size-full tracking-[0.4px] whitespace-pre-wrap">
        <p className="font-['Inter:Medium',sans-serif] font-medium relative shrink-0 text-[#dadfe3] text-[12px] w-full">Deploy critical patch to finance-db-01</p>
        <p className="font-['Inter:Regular',sans-serif] font-normal relative shrink-0 text-[#89949e] text-[10px] w-full">CVE-2024-5821 actively exploited in the wild. Finance database directly exposed.</p>
      </div>
    </div>
  );
}

function Container1() {
  return (
    <div className="content-stretch flex items-start justify-between relative shrink-0 w-full" data-name="Container">
      <Container2 />
    </div>
  );
}

function Container4() {
  return (
    <div className="flex-[1_0_0] min-h-px min-w-px relative" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col font-['Inter:Regular',sans-serif] font-normal gap-[4px] items-start leading-[normal] not-italic relative text-[10px] w-full">
        <p className="h-[11px] relative shrink-0 text-[#dadfe3] w-[301.359px] whitespace-pre-wrap">Why this matters</p>
        <p className="relative shrink-0 text-[#89949e]">KEV match + internet exposed + asset classified as crown jewel</p>
      </div>
    </div>
  );
}

function Container3() {
  return (
    <div className="content-stretch flex gap-[12px] items-start relative shrink-0 w-full" data-name="Container">
      <div className="flex h-0 items-center justify-center relative self-center shrink-0 w-0" style={{ "--transform-inner-width": "1200", "--transform-inner-height": "19" } as React.CSSProperties}>
        <div className="flex-none h-full rotate-90">
          <div className="h-full relative w-[27px]" data-name="separator">
            <div className="absolute inset-[-1px_0_0_0]">
              <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 27 1">
                <line id="separator" stroke="var(--stroke-0, #FF5757)" x2="27" y1="0.5" y2="0.5" />
              </svg>
            </div>
          </div>
        </div>
      </div>
      <Container4 />
    </div>
  );
}

function ButtonGray() {
  return (
    <div className="h-[24px] relative rounded-[6px] shrink-0" data-name="ButtonGray">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex h-full items-center justify-center px-[12px] py-[8px] relative">
        <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[12px] not-italic relative shrink-0 text-[#f1f3ff] text-[10px] text-center">Defer</p>
      </div>
    </div>
  );
}

function Buttons1() {
  return (
    <div className="content-stretch flex gap-[8px] items-center relative shrink-0" data-name="buttons">
      <div className="bg-[#076498] h-[24px] min-w-[84px] relative rounded-[6px] shrink-0" data-name="ButtonPrimary">
        <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[12px] h-full items-center justify-center min-w-[inherit] p-[8px] relative">
          <p className="flex-[1_0_0] font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[12px] min-h-px min-w-px not-italic relative text-[#f1f3ff] text-[10px] text-center whitespace-pre-wrap">Authorize</p>
        </div>
      </div>
      <ButtonGray />
    </div>
  );
}

function ButtonGray1() {
  return (
    <div className="content-stretch flex h-[24px] items-center justify-center px-[12px] py-[8px] relative rounded-[6px] shrink-0" data-name="ButtonGray">
      <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[12px] not-italic relative shrink-0 text-[#f1f3ff] text-[10px] text-center">Hide details</p>
    </div>
  );
}

function Buttons() {
  return (
    <div className="content-stretch flex items-center justify-between relative shrink-0 w-full" data-name="Buttons">
      <Buttons1 />
      <ButtonGray1 />
    </div>
  );
}

function Frame4() {
  return (
    <div className="relative shrink-0 w-[392px]">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[20px] items-start relative w-full">
        <Container1 />
        <Container3 />
        <Buttons />
      </div>
    </div>
  );
}

function Span() {
  return (
    <div className="bg-[rgba(52,211,153,0.08)] relative rounded-[3px] shrink-0" data-name="span">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center px-[2px] py-px relative">
        <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[12px] not-italic relative shrink-0 text-[#34d399] text-[10px]">Δ -36</p>
      </div>
    </div>
  );
}

function Container5() {
  return (
    <div className="content-stretch flex gap-[4px] items-center relative shrink-0" data-name="Container">
      <p className="font-['Inter:Medium',sans-serif] font-medium leading-[13.5px] not-italic relative shrink-0 text-[#ff5757] text-[10px]">88</p>
      <p className="font-['Inter:Regular',sans-serif] font-normal leading-[12px] not-italic relative shrink-0 text-[#4a5568] text-[8px]">→</p>
      <p className="font-['Inter:Medium',sans-serif] font-medium leading-[13.5px] not-italic relative shrink-0 text-[#dadfe3] text-[10px]">52</p>
      <Span />
    </div>
  );
}

function Frame3() {
  return (
    <div className="content-stretch flex flex-col gap-[4px] items-start relative shrink-0">
      <p className="font-['Inter:Medium',sans-serif] font-medium leading-[10.5px] not-italic relative shrink-0 text-[#89949e] text-[12px] tracking-[0.4px]">Projected Impact</p>
      <Container5 />
    </div>
  );
}

function Alpha() {
  return (
    <div className="absolute inset-[8.33%_0]" data-name="Alpha">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 22 18.3334">
        <g id="Alpha">
          <g id="Group 8">
            <path d={svgPaths.p1b477300} fill="url(#paint0_linear_2011_636)" id="Vector" />
            <path d={svgPaths.p21ad0ef2} fill="url(#paint1_linear_2011_636)" id="Vector_2" />
          </g>
          <path d={svgPaths.p71f9100} fill="url(#paint2_linear_2011_636)" id="Vector_3" stroke="var(--stroke-0, #121E27)" />
          <g id="Vector_4">
            <path d={svgPaths.p17ca9bc0} fill="var(--fill-0, #019279)" id="Vector_5" />
            <path d={svgPaths.p393a3b80} fill="var(--fill-0, #019279)" id="Vector_6" />
            <path d={svgPaths.p2f1c3e00} fill="var(--fill-0, #019279)" id="Vector_7" />
          </g>
        </g>
        <defs>
          <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_2011_636" x1="10.9983" x2="10.9983" y1="6.41667" y2="15.5834">
            <stop stopColor="#3E4E5A" />
            <stop offset="1" stopColor="#1E2A34" />
          </linearGradient>
          <linearGradient gradientUnits="userSpaceOnUse" id="paint1_linear_2011_636" x1="10.9986" x2="10.9986" y1="3.66667" y2="18.3334">
            <stop stopColor="#3E4E5A" />
            <stop offset="1" stopColor="#1E2A34" />
          </linearGradient>
          <linearGradient gradientUnits="userSpaceOnUse" id="paint2_linear_2011_636" x1="11" x2="11" y1="6.41667" y2="15.5834">
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
    <div className="relative shrink-0 size-[22px]" data-name="Icon">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid overflow-clip relative rounded-[inherit] size-full">
        <Alpha />
      </div>
    </div>
  );
}

function Container6() {
  return (
    <div className="content-stretch flex gap-[4px] items-center relative shrink-0" data-name="Container">
      <Icon />
      <p className="font-['Inter:Regular',sans-serif] font-normal leading-[normal] not-italic relative shrink-0 text-[#89949e] text-[10px] tracking-[0.2px]">Alpha</p>
    </div>
  );
}

function Charlie() {
  return (
    <div className="absolute inset-[8.33%_0]" data-name="Charlie">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 22 18.3333">
        <g id="Charlie">
          <g id="Group 8">
            <path d={svgPaths.p15cb2780} fill="url(#paint0_linear_2011_626)" id="Vector" />
            <path d={svgPaths.p2dc72b00} fill="url(#paint1_linear_2011_626)" id="Vector_2" />
          </g>
          <path d={svgPaths.p176a580} fill="url(#paint2_linear_2011_626)" id="Vector_3" stroke="var(--stroke-0, #121E27)" />
          <g id="Vector_4">
            <path d={svgPaths.p22507f00} fill="var(--fill-0, #515888)" id="Vector_5" />
            <path d={svgPaths.p277a7b00} fill="var(--fill-0, #515888)" id="Vector_6" />
            <path d={svgPaths.pd541f00} fill="var(--fill-0, #515888)" id="Vector_7" />
          </g>
        </g>
        <defs>
          <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_2011_626" x1="10.9983" x2="10.9983" y1="6.41666" y2="15.5834">
            <stop stopColor="#3E4E5A" />
            <stop offset="1" stopColor="#1E2A34" />
          </linearGradient>
          <linearGradient gradientUnits="userSpaceOnUse" id="paint1_linear_2011_626" x1="10.9986" x2="10.9986" y1="3.66666" y2="18.3334">
            <stop stopColor="#3E4E5A" />
            <stop offset="1" stopColor="#1E2A34" />
          </linearGradient>
          <linearGradient gradientUnits="userSpaceOnUse" id="paint2_linear_2011_626" x1="11" x2="11" y1="6.41666" y2="15.5834">
            <stop stopColor="#01101F" />
            <stop offset="1" stopColor="#515888" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

function Icon1() {
  return (
    <div className="relative shrink-0 size-[22px]" data-name="Icon">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid overflow-clip relative rounded-[inherit] size-full">
        <Charlie />
      </div>
    </div>
  );
}

function Container7() {
  return (
    <div className="content-stretch flex gap-[4px] items-center relative shrink-0" data-name="Container">
      <Icon1 />
      <p className="font-['Inter:Regular',sans-serif] font-normal leading-[normal] not-italic relative shrink-0 text-[#89949e] text-[10px] tracking-[0.2px]">Charlie</p>
    </div>
  );
}

function Delta() {
  return (
    <div className="absolute inset-[8.33%_0]" data-name="Delta">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 22 18.3333">
        <g id="Delta">
          <g id="Group 8">
            <path d={svgPaths.p15cb2780} fill="url(#paint0_linear_2011_648)" id="Vector" />
            <path d={svgPaths.p2dc72b00} fill="url(#paint1_linear_2011_648)" id="Vector_2" />
          </g>
          <path d={svgPaths.p176a580} fill="url(#paint2_linear_2011_648)" id="Vector_3" stroke="var(--stroke-0, #121E27)" />
          <g id="Vector_4">
            <path d={svgPaths.p22507f00} fill="var(--fill-0, #D05D27)" id="Vector_5" />
            <path d={svgPaths.p277a7b00} fill="var(--fill-0, #D05D27)" id="Vector_6" />
            <path d={svgPaths.pd541f00} fill="var(--fill-0, #D05D27)" id="Vector_7" />
          </g>
        </g>
        <defs>
          <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_2011_648" x1="10.9983" x2="10.9983" y1="6.41666" y2="15.5834">
            <stop stopColor="#3E4E5A" />
            <stop offset="1" stopColor="#1E2A34" />
          </linearGradient>
          <linearGradient gradientUnits="userSpaceOnUse" id="paint1_linear_2011_648" x1="10.9986" x2="10.9986" y1="3.66666" y2="18.3334">
            <stop stopColor="#3E4E5A" />
            <stop offset="1" stopColor="#1E2A34" />
          </linearGradient>
          <linearGradient gradientUnits="userSpaceOnUse" id="paint2_linear_2011_648" x1="11" x2="11" y1="6.41666" y2="15.5834">
            <stop stopColor="#01101F" />
            <stop offset="1" stopColor="#D05D27" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

function Icon2() {
  return (
    <div className="relative shrink-0 size-[22px]" data-name="Icon">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid overflow-clip relative rounded-[inherit] size-full">
        <Delta />
      </div>
    </div>
  );
}

function Container8() {
  return (
    <div className="content-stretch flex gap-[4px] items-center relative shrink-0" data-name="Container">
      <Icon2 />
      <p className="font-['Inter:Regular',sans-serif] font-normal leading-[normal] not-italic relative shrink-0 text-[#89949e] text-[10px] tracking-[0.2px]">Delta</p>
    </div>
  );
}

function Frame1() {
  return (
    <div className="content-stretch flex gap-[12px] items-center relative shrink-0">
      <Container6 />
      <Container7 />
      <Container8 />
    </div>
  );
}

function Frame2() {
  return (
    <div className="content-stretch flex flex-col gap-[4px] items-start relative shrink-0">
      <p className="font-['Inter:Medium',sans-serif] font-medium leading-[normal] not-italic relative shrink-0 text-[#89949e] text-[12px] tracking-[0.4px]">Agents Involved</p>
      <Frame1 />
    </div>
  );
}

function Frame() {
  return (
    <div className="content-stretch flex items-start justify-between relative shrink-0 w-full">
      <Frame3 />
      <Frame2 />
    </div>
  );
}

function Frame5() {
  return (
    <div className="content-stretch flex flex-col h-[42.006px] items-start justify-between relative shrink-0 w-full">
      <Frame />
    </div>
  );
}

function Container9() {
  return <div className="bg-[#14a2e3] rounded-[16777200px] shadow-[0px_0px_4px_0px_rgba(20,162,227,0.5)] shrink-0 size-[5.761px]" data-name="Container" />;
}

function Step() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col gap-[4px] items-center min-h-px min-w-px relative" data-name="Step">
      <Container9 />
      <p className="font-['Inter:Medium',sans-serif] font-medium leading-[normal] min-w-full not-italic relative shrink-0 text-[#dadfe3] text-[10px] text-center w-[min-content] whitespace-pre-wrap">Detect</p>
      <p className="font-['Inter:Regular',sans-serif] font-normal leading-[normal] min-w-full not-italic relative shrink-0 text-[#89949e] text-[10px] text-center w-[min-content] whitespace-pre-wrap">Lateral path telemetry flagged</p>
    </div>
  );
}

function ProgressLine1() {
  return <div className="bg-[#1e2a34] h-px shrink-0 w-full" data-name="ProgressLine" />;
}

function ProgressLine() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col h-[6px] items-center justify-end min-h-px min-w-px relative" data-name="ProgressLine">
      <ProgressLine1 />
    </div>
  );
}

function Container10() {
  return <div className="bg-[#1e2a34] rounded-[16777200px] shrink-0 size-[5.761px]" data-name="Container" />;
}

function Step1() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col gap-[4px] items-center min-h-px min-w-px relative" data-name="Step">
      <Container10 />
      <p className="font-['Inter:Medium',sans-serif] font-medium leading-[normal] min-w-full not-italic relative shrink-0 text-[#1e2a34] text-[10px] text-center w-[min-content] whitespace-pre-wrap">Correlate</p>
      <p className="font-['Inter:Regular',sans-serif] font-normal leading-[normal] min-w-full not-italic relative shrink-0 text-[#1e2a34] text-[10px] text-center w-[min-content] whitespace-pre-wrap">Linked to jump server JS-04</p>
    </div>
  );
}

function ProgressLine3() {
  return <div className="bg-[#1e2a34] h-px shrink-0 w-full" data-name="ProgressLine" />;
}

function ProgressLine2() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col h-[6px] items-center justify-end min-h-px min-w-px relative" data-name="ProgressLine">
      <ProgressLine3 />
    </div>
  );
}

function Container11() {
  return <div className="bg-[#1e2a34] rounded-[16777200px] shrink-0 size-[5.761px]" data-name="Container" />;
}

function Step2() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col gap-[4px] items-center min-h-px min-w-px relative" data-name="Step">
      <Container11 />
      <p className="font-['Inter:Medium',sans-serif] font-medium leading-[normal] min-w-full not-italic relative shrink-0 text-[#1e2a34] text-[10px] text-center w-[min-content] whitespace-pre-wrap">Simulate</p>
      <p className="font-['Inter:Regular',sans-serif] font-normal leading-[normal] min-w-full not-italic relative shrink-0 text-[#1e2a34] text-[10px] text-center w-[min-content] whitespace-pre-wrap">Domain admin in 3 hops</p>
    </div>
  );
}

function ProgressLine5() {
  return <div className="bg-[#1e2a34] h-px shrink-0 w-full" data-name="ProgressLine" />;
}

function ProgressLine4() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col h-[6px] items-center justify-end min-h-px min-w-px relative" data-name="ProgressLine">
      <ProgressLine5 />
    </div>
  );
}

function Container12() {
  return <div className="bg-[#1e2a34] rounded-[16777200px] shrink-0 size-[5.761px]" data-name="Container" />;
}

function Step3() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col gap-[4px] items-center min-h-px min-w-px relative" data-name="Step">
      <Container12 />
      <p className="font-['Inter:Medium',sans-serif] font-medium leading-[normal] min-w-full not-italic relative shrink-0 text-[#1e2a34] text-[10px] text-center w-[min-content] whitespace-pre-wrap">Validate</p>
      <p className="font-['Inter:Regular',sans-serif] font-normal leading-[normal] min-w-full not-italic relative shrink-0 text-[#1e2a34] text-[10px] text-center w-[min-content] whitespace-pre-wrap">Verifying segmentation rules</p>
    </div>
  );
}

function ProgressLine7() {
  return <div className="bg-[#1e2a34] h-px shrink-0 w-full" data-name="ProgressLine" />;
}

function ProgressLine6() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col h-[6px] items-center justify-end min-h-px min-w-px relative" data-name="ProgressLine">
      <ProgressLine7 />
    </div>
  );
}

function Container13() {
  return <div className="bg-[#1e2a34] rounded-[16777200px] shrink-0 size-[5.761px]" data-name="Container" />;
}

function Step4() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col gap-[4px] items-center min-h-px min-w-px relative" data-name="Step">
      <Container13 />
      <p className="font-['Inter:Medium',sans-serif] font-medium leading-[normal] min-w-full not-italic relative shrink-0 text-[#1e2a34] text-[10px] text-center w-[min-content] whitespace-pre-wrap">Recommend</p>
      <p className="font-['Inter:Regular',sans-serif] font-normal leading-[normal] min-w-full not-italic relative shrink-0 text-[#1e2a34] text-[10px] text-center w-[min-content] whitespace-pre-wrap">Awaiting validation</p>
    </div>
  );
}

function Frame6() {
  return (
    <div className="content-stretch flex items-start justify-between relative shrink-0 w-full">
      <Step />
      <ProgressLine />
      <Step1 />
      <ProgressLine2 />
      <Step2 />
      <ProgressLine4 />
      <Step3 />
      <ProgressLine6 />
      <Step4 />
    </div>
  );
}

function Frame7() {
  return (
    <div className="flex-[1_0_0] h-full min-h-px min-w-px relative">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start justify-between relative size-full">
        <Frame5 />
        <Frame6 />
      </div>
    </div>
  );
}

export default function Container() {
  return (
    <div className="content-stretch flex gap-[20px] items-start p-[17px] relative rounded-[12px] size-full" data-name="Container">
      <div aria-hidden="true" className="absolute inset-0 mix-blend-screen pointer-events-none rounded-[12px]" style={{ backgroundImage: "linear-gradient(146.739deg, rgb(8, 3, 3) 0%, rgb(0, 0, 0) 35.132%, rgb(0, 0, 0) 65.097%, rgb(8, 3, 3) 90.93%)" }} />
      <div aria-hidden="true" className="absolute border border-[#030609] border-solid inset-0 pointer-events-none rounded-[12px]" />
      <Frame4 />
      <div className="h-full relative shrink-0 w-0">
        <div className="absolute inset-[0_-0.5px]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 1 99">
            <path d="M0.5 0V99" id="Vector 1" stroke="var(--stroke-0, #121E27)" />
          </svg>
        </div>
      </div>
      <Frame7 />
    </div>
  );
}