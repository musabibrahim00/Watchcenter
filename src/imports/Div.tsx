import svgPaths from "./svg-caq8t4ff0l";

function Frame1() {
  return (
    <div className="h-[18px] relative shrink-0 w-[103px]">
      <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[normal] left-0 not-italic text-[#89949e] text-[14px] top-0 tracking-[0.4px] uppercase">ASSET INTELLIGENCE ANALYST</p>
    </div>
  );
}

function Container1() {
  return <div className="bg-[#00a46e] rounded-[16777200px] shrink-0 size-[5px]" data-name="Container" />;
}

function Frame2() {
  return (
    <div className="content-stretch flex gap-[7px] items-center relative shrink-0">
      <Frame1 />
      <Container1 />
    </div>
  );
}

function Frame() {
  return (
    <div className="content-stretch flex font-['Inter:Regular',sans-serif] font-normal gap-[8px] items-end leading-[normal] not-italic relative shrink-0 text-[#89949e] text-[10px] w-full">
      <p className="relative shrink-0">{`Threat Detection & Response`}</p>
      <p className="relative shrink-0">2 Active · 1 Pending</p>
    </div>
  );
}

function Frame3() {
  return (
    <div className="content-stretch flex flex-col gap-[2px] items-start relative shrink-0 w-[230px]">
      <Frame2 />
      <Frame />
    </div>
  );
}

function X() {
  return (
    <div className="h-[12px] overflow-clip relative shrink-0 w-full" data-name="X">
      <div className="absolute inset-1/4" data-name="Vector">
        <div className="absolute inset-[-8.33%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 7 7">
            <path d="M6.5 0.5L0.5 6.5" id="Vector" stroke="var(--stroke-0, #4A5568)" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
      <div className="absolute inset-1/4" data-name="Vector">
        <div className="absolute inset-[-8.33%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 7 7">
            <path d="M0.5 0.5L6.5 6.5" id="Vector" stroke="var(--stroke-0, #4A5568)" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Button() {
  return (
    <div className="content-stretch flex flex-col items-start pt-[4px] px-[4px] relative rounded-[4px] shrink-0 size-[20px]" data-name="button">
      <X />
    </div>
  );
}

function Frame4() {
  return (
    <div className="content-stretch flex items-center justify-between relative shrink-0 w-full">
      <Frame3 />
      <Button />
    </div>
  );
}

function Frame5() {
  return (
    <div className="h-[14px] relative shrink-0 w-[72px]">
      <p className="absolute font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[13.5px] left-0 not-italic text-[#89949e] text-[9px] top-0 tracking-[0.8px] uppercase">Active Work</p>
    </div>
  );
}

function P() {
  return (
    <div className="h-[15px] relative shrink-0 w-full" data-name="p">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[normal] left-0 not-italic text-[#dadfe3] text-[12px] top-0">Anomaly Investigation — finance-admin-02</p>
    </div>
  );
}

function P1() {
  return (
    <div className="h-[13.5px] relative shrink-0 w-[36.547px]" data-name="p">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[0] left-0 not-italic text-[#4a5568] text-[0px] top-[0.5px]">
          <span className="leading-[13.5px] text-[#89949e] text-[10px]">Risk</span>
          <span className="leading-[13.5px] text-[9px]">{` `}</span>
          <span className="leading-[13.5px] text-[#ff5757] text-[9px]">+22</span>
        </p>
      </div>
    </div>
  );
}

function P2() {
  return (
    <div className="h-[13.5px] relative shrink-0 w-[40.57px]" data-name="p">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[0] left-0 not-italic text-[#4a5568] text-[0px] top-[0.5px]">
          <span className="leading-[13.5px] text-[#89949e] text-[10px]">Conf</span>
          <span className="leading-[13.5px] text-[9px]">{` `}</span>
          <span className="leading-[13.5px] text-[#dadfe3] text-[10px]">0.91</span>
        </p>
      </div>
    </div>
  );
}

function P3() {
  return (
    <div className="h-[13.5px] relative shrink-0 w-[239.883px]" data-name="p">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid overflow-clip relative rounded-[inherit] size-full">
        <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[normal] left-0 not-italic text-[#dadfe3] text-[10px] top-[0.5px]">Correlating lateral movement signals</p>
      </div>
    </div>
  );
}

function Container3() {
  return (
    <div className="content-center flex flex-wrap gap-[12px] items-center relative shrink-0 w-full" data-name="Container">
      <P1 />
      <P2 />
      <P3 />
    </div>
  );
}

function ChevronRight() {
  return (
    <div className="relative shrink-0 size-[9px]" data-name="ChevronRight">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 9 9">
        <g id="ChevronRight">
          <path d={svgPaths.p1b3a0c40} id="Vector" stroke="var(--stroke-0, #4A5568)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.75" />
        </g>
      </svg>
    </div>
  );
}

function P4() {
  return (
    <div className="flex-[1_0_0] h-[13.5px] min-h-px min-w-px relative" data-name="p">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="-translate-x-1/2 absolute font-['Inter:Regular',sans-serif] font-normal leading-[13.5px] left-[26px] not-italic text-[#4a5568] text-[9px] text-center top-[0.5px]">View details</p>
      </div>
    </div>
  );
}

function Button1() {
  return (
    <div className="content-stretch flex gap-[4px] h-[13.5px] items-center relative shrink-0 w-[64.461px]" data-name="button">
      <ChevronRight />
      <P4 />
    </div>
  );
}

function Container2() {
  return (
    <div className="bg-[#030609] relative rounded-[8px] shrink-0 w-full" data-name="Container">
      <div aria-hidden="true" className="absolute border border-[#030609] border-solid inset-0 pointer-events-none rounded-[8px]" />
      <div className="content-stretch flex flex-col gap-[16px] items-start p-[12px] relative w-full">
        <P />
        <Container3 />
        <Button1 />
      </div>
    </div>
  );
}

function Frame16() {
  return (
    <div className="h-[14px] relative shrink-0 w-[49px]">
      <p className="absolute font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[13.5px] left-0 not-italic text-[#89949e] text-[9px] top-0 tracking-[0.8px] uppercase">In Queue</p>
    </div>
  );
}

function P5() {
  return (
    <div className="h-[15px] relative shrink-0 w-[201.688px]" data-name="p">
      <ul className="absolute block font-['Inter:Regular',sans-serif] font-normal leading-[0] left-0 not-italic text-[#89949e] text-[0px] top-[0.5px] whitespace-nowrap">
        <li className="list-disc ms-[calc(var(--list-marker-font-size,0)*1.5*1)] text-[10px] whitespace-pre-wrap">
          <span className="leading-[15px] text-[#89949e] uppercase">EDR Alert — corp-endpoint-17</span>
          <span className="leading-[15px]">{` `}</span>
          <span className="font-['Inter:Regular',sans-serif] font-normal leading-[15px] not-italic text-[#dadfe3]">· Scheduled</span>
        </li>
      </ul>
    </div>
  );
}

function Frame17() {
  return (
    <div className="h-[14px] relative shrink-0 w-[77px]">
      <p className="absolute font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[13.5px] left-0 not-italic text-[#89949e] text-[9px] top-0 tracking-[0.8px] uppercase">Step Timeline</p>
    </div>
  );
}

function Frame6() {
  return (
    <div className="h-[14px] relative shrink-0 w-[37px]">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[normal] left-0 not-italic text-[#89949e] text-[10px] top-0">10:31:44</p>
    </div>
  );
}

function Check() {
  return (
    <div className="relative shrink-0 size-[7px]" data-name="Check">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 7 7">
        <g id="Check">
          <path d={svgPaths.pe6a7480} id="Vector" stroke="var(--stroke-0, #0781C2)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.583333" />
        </g>
      </svg>
    </div>
  );
}

function Container5() {
  return (
    <div className="bg-[rgba(7,129,194,0.15)] flex-[1_0_0] min-h-px min-w-px relative rounded-[16777200px] w-[12px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center relative size-full">
        <Check />
      </div>
    </div>
  );
}

function Container4() {
  return (
    <div className="content-stretch flex flex-col items-center relative shrink-0 size-[12px]" data-name="Container">
      <Container5 />
    </div>
  );
}

function Frame11() {
  return (
    <div className="content-stretch flex gap-[8px] items-center relative shrink-0">
      <Frame6 />
      <Container4 />
      <p className="font-['Inter:Regular',sans-serif] font-normal leading-[normal] not-italic relative shrink-0 text-[#dadfe3] text-[10px]">Ingested SIEM alert payload</p>
    </div>
  );
}

function Frame7() {
  return (
    <div className="h-[14px] relative shrink-0 w-[36px]">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[normal] left-0 not-italic text-[#89949e] text-[10px] top-0">10:31:48</p>
    </div>
  );
}

function Check1() {
  return (
    <div className="relative shrink-0 size-[7px]" data-name="Check">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 7 7">
        <g id="Check">
          <path d={svgPaths.pe6a7480} id="Vector" stroke="var(--stroke-0, #0781C2)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.583333" />
        </g>
      </svg>
    </div>
  );
}

function Container7() {
  return (
    <div className="bg-[rgba(7,129,194,0.15)] flex-[1_0_0] min-h-px min-w-px relative rounded-[16777200px] w-[12px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center relative size-full">
        <Check1 />
      </div>
    </div>
  );
}

function Container6() {
  return (
    <div className="content-stretch flex flex-col items-center relative shrink-0 size-[12px]" data-name="Container">
      <Container7 />
    </div>
  );
}

function Frame12() {
  return (
    <div className="content-stretch flex gap-[8px] items-center relative shrink-0">
      <Frame7 />
      <Container6 />
      <p className="font-['Inter:Regular',sans-serif] font-normal leading-[normal] not-italic relative shrink-0 text-[#dadfe3] text-[10px]">Enriched with threat intel context</p>
    </div>
  );
}

function Frame8() {
  return (
    <div className="h-[14px] relative shrink-0 w-[36px]">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[normal] left-0 not-italic text-[#89949e] text-[10px] top-0">10:31:52</p>
    </div>
  );
}

function Check2() {
  return (
    <div className="relative shrink-0 size-[7px]" data-name="Check">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 7 7">
        <g id="Check">
          <path d={svgPaths.pe6a7480} id="Vector" stroke="var(--stroke-0, #0781C2)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.583333" />
        </g>
      </svg>
    </div>
  );
}

function Container9() {
  return (
    <div className="bg-[rgba(7,129,194,0.15)] flex-[1_0_0] min-h-px min-w-px relative rounded-[16777200px] w-[12px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center relative size-full">
        <Check2 />
      </div>
    </div>
  );
}

function Container8() {
  return (
    <div className="content-stretch flex flex-col items-center relative shrink-0 size-[12px]" data-name="Container">
      <Container9 />
    </div>
  );
}

function Frame13() {
  return (
    <div className="content-stretch flex gap-[8px] items-center relative shrink-0">
      <Frame8 />
      <Container8 />
      <p className="font-['Inter:Regular',sans-serif] font-normal leading-[normal] not-italic relative shrink-0 text-[#dadfe3] text-[10px]">Correlated with endpoint telemetry</p>
    </div>
  );
}

function Frame9() {
  return (
    <div className="h-[14px] relative shrink-0 w-[36px]">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[normal] left-0 not-italic text-[#89949e] text-[10px] top-0">10:31:58</p>
    </div>
  );
}

function Loader() {
  return (
    <div className="relative size-[7px]" data-name="Loader2">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 7 7">
        <g clipPath="url(#clip0_2051_1249)" id="Loader2">
          <path d={svgPaths.p3ccac180} id="Vector" stroke="var(--stroke-0, #F05B06)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.583333" />
        </g>
        <defs>
          <clipPath id="clip0_2051_1249">
            <rect fill="white" height="7" width="7" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Container11() {
  return (
    <div className="bg-[rgba(240,91,6,0.15)] flex-[1_0_0] min-h-px min-w-px relative rounded-[16777200px] w-[12px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center relative size-full">
        <div className="flex items-center justify-center relative shrink-0 size-[9.243px]" style={{ "--transform-inner-width": "1200", "--transform-inner-height": "19" } as React.CSSProperties}>
          <div className="flex-none rotate-[155.98deg]">
            <Loader />
          </div>
        </div>
      </div>
    </div>
  );
}

function Container10() {
  return (
    <div className="content-stretch flex flex-col items-center relative shrink-0 size-[12px]" data-name="Container">
      <Container11 />
    </div>
  );
}

function Frame14() {
  return (
    <div className="content-stretch flex gap-[8px] items-center relative shrink-0">
      <Frame9 />
      <Container10 />
      <p className="font-['Inter:Regular',sans-serif] font-normal leading-[normal] not-italic relative shrink-0 text-[#dadfe3] text-[10px]">Analyzing lateral movement indicators</p>
    </div>
  );
}

function Frame10() {
  return (
    <div className="h-[14px] relative shrink-0 w-[36px]">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[normal] not-italic right-[9px] text-[#89949e] text-[10px] top-0 translate-x-full">—</p>
    </div>
  );
}

function Container14() {
  return <div className="bg-[#1e2a34] rounded-[16777200px] shrink-0 size-[3px]" data-name="Container" />;
}

function Container13() {
  return (
    <div className="flex-[1_0_0] min-h-px min-w-px relative rounded-[16777200px] w-[12px]" data-name="Container">
      <div aria-hidden="true" className="absolute border border-[rgba(30,42,52,0.6)] border-solid inset-0 pointer-events-none rounded-[16777200px]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center p-px relative size-full">
        <Container14 />
      </div>
    </div>
  );
}

function Container12() {
  return (
    <div className="content-stretch flex flex-col items-center relative shrink-0 size-[12px]" data-name="Container">
      <Container13 />
    </div>
  );
}

function Frame15() {
  return (
    <div className="content-stretch flex gap-[8px] items-center relative shrink-0 w-[261px]">
      <Frame10 />
      <Container12 />
      <p className="flex-[1_0_0] font-['Inter:Regular',sans-serif] font-normal leading-[normal] min-h-px min-w-px not-italic relative text-[#89949e] text-[10px] whitespace-pre-wrap">Next: Generate incident summary for DST</p>
    </div>
  );
}

function Frame18() {
  return (
    <div className="h-[14px] relative shrink-0 w-[92px]">
      <p className="absolute font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[13.5px] left-0 not-italic text-[#89949e] text-[9px] top-0 tracking-[0.8px] uppercase">Risk Projection</p>
    </div>
  );
}

function Frame24() {
  return (
    <div className="h-[20px] relative shrink-0 w-[25px]">
      <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[19.5px] left-0 not-italic text-[#ff5757] text-[13px] top-0">+22</p>
    </div>
  );
}

function Frame23() {
  return (
    <div className="h-[15px] relative shrink-0 w-[10px]">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[15px] left-0 not-italic text-[#4a5568] text-[10px] top-0">→</p>
    </div>
  );
}

function Frame22() {
  return (
    <div className="h-[20px] relative shrink-0 w-[21px]">
      <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[19.5px] left-0 not-italic text-[#34d399] text-[13px] top-0">-18</p>
    </div>
  );
}

function Frame27() {
  return (
    <div className="content-stretch flex gap-[8px] items-center relative shrink-0">
      <Frame24 />
      <Frame23 />
      <Frame22 />
    </div>
  );
}

function Frame21() {
  return (
    <div className="h-[15px] relative shrink-0 w-[40px]">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[normal] left-0 not-italic text-[#89949e] text-[10px] top-0">Residual</p>
    </div>
  );
}

function Frame20() {
  return (
    <div className="h-[20px] relative shrink-0 w-[18px]">
      <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[19.5px] left-0 not-italic text-[#dadfe3] text-[13px] top-0">+4</p>
    </div>
  );
}

function Frame26() {
  return (
    <div className="content-stretch flex gap-[8px] items-center relative shrink-0">
      <Frame21 />
      <Frame20 />
    </div>
  );
}

function Frame25() {
  return (
    <div className="content-stretch flex items-center justify-between relative shrink-0 w-full">
      <Frame27 />
      <Frame26 />
    </div>
  );
}

function P6() {
  return (
    <div className="h-[13.5px] relative shrink-0 w-[128.633px]" data-name="p">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="-translate-x-1/2 absolute font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[13.5px] left-[64px] not-italic text-[#89949e] text-[9px] text-center top-[0.5px] tracking-[0.8px] uppercase">Agent Communication</p>
      </div>
    </div>
  );
}

function Button2() {
  return (
    <div className="content-stretch flex h-[17.5px] items-center justify-between relative shrink-0 w-full" data-name="button">
      <P6 />
      <div className="relative shrink-0 size-[16px]" data-name="Icons">
        <div className="bg-clip-padding border-0 border-[transparent] border-solid overflow-clip relative rounded-[inherit] size-full">
          <div className="-translate-x-1/2 -translate-y-1/2 absolute left-1/2 size-[16px] top-1/2" data-name="Container" />
          <div className="absolute inset-[41.67%_29.17%_37.5%_29.17%]" data-name="Vector">
            <div className="absolute inset-[-15%_-7.5%]">
              <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 7.66667 4.33333">
                <path d={svgPaths.pfbb3280} id="Vector" stroke="var(--stroke-0, #62707D)" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Frame19() {
  return (
    <div className="h-[14px] relative shrink-0 w-[37px]">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[normal] left-0 not-italic text-[#89949e] text-[10px] top-0">10:31:44</p>
    </div>
  );
}

function Check3() {
  return (
    <div className="relative shrink-0 size-[7px]" data-name="Check">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 7 7">
        <g id="Check">
          <path d={svgPaths.pe6a7480} id="Vector" stroke="var(--stroke-0, #0781C2)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.583333" />
        </g>
      </svg>
    </div>
  );
}

function Container16() {
  return (
    <div className="bg-[rgba(7,129,194,0.15)] flex-[1_0_0] min-h-px min-w-px relative rounded-[16777200px] w-[12px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center relative size-full">
        <Check3 />
      </div>
    </div>
  );
}

function Container15() {
  return (
    <div className="content-stretch flex flex-col items-center relative shrink-0 size-[12px]" data-name="Container">
      <Container16 />
    </div>
  );
}

function Frame28() {
  return (
    <div className="content-stretch flex gap-[8px] items-center relative shrink-0">
      <Frame19 />
      <Container15 />
      <p className="font-['Inter:Regular',sans-serif] font-normal leading-[0] not-italic relative shrink-0 text-[#dadfe3] text-[10px]">
        <span className="leading-[normal]">{`InfraSec `}</span>
        <span className="leading-[normal] text-[#89949e]">· Network flow request</span>
      </p>
    </div>
  );
}

function Frame30() {
  return (
    <div className="h-[14px] relative shrink-0 w-[36px]">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[normal] left-0 not-italic text-[#89949e] text-[10px] top-0">10:31:48</p>
    </div>
  );
}

function Check4() {
  return (
    <div className="relative shrink-0 size-[7px]" data-name="Check">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 7 7">
        <g id="Check">
          <path d={svgPaths.pe6a7480} id="Vector" stroke="var(--stroke-0, #0781C2)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.583333" />
        </g>
      </svg>
    </div>
  );
}

function Container18() {
  return (
    <div className="bg-[rgba(7,129,194,0.15)] flex-[1_0_0] min-h-px min-w-px relative rounded-[16777200px] w-[12px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center relative size-full">
        <Check4 />
      </div>
    </div>
  );
}

function Container17() {
  return (
    <div className="content-stretch flex flex-col items-center relative shrink-0 size-[12px]" data-name="Container">
      <Container18 />
    </div>
  );
}

function Frame29() {
  return (
    <div className="content-stretch flex gap-[8px] items-center relative shrink-0">
      <Frame30 />
      <Container17 />
      <p className="font-['Inter:Regular',sans-serif] font-normal leading-[0] not-italic relative shrink-0 text-[#dadfe3] text-[10px]">
        <span className="leading-[normal]">{`InfraSec `}</span>
        <span className="leading-[normal] text-[#89949e]">· Session metadata</span>
      </p>
    </div>
  );
}

function P7() {
  return (
    <div className="h-[13.5px] relative shrink-0 w-[139.203px]" data-name="p">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="-translate-x-1/2 absolute font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[13.5px] left-[70.5px] not-italic text-[#89949e] text-[9px] text-center top-[0.5px] tracking-[0.8px] uppercase">Automation Boundaries</p>
      </div>
    </div>
  );
}

function Button3() {
  return (
    <div className="content-stretch flex h-[17.5px] items-center justify-between relative shrink-0 w-full" data-name="button">
      <P7 />
      <div className="relative shrink-0 size-[16px]" data-name="Icons">
        <div className="bg-clip-padding border-0 border-[transparent] border-solid overflow-clip relative rounded-[inherit] size-full">
          <div className="-translate-x-1/2 -translate-y-1/2 absolute left-1/2 size-[16px] top-1/2" data-name="Container" />
          <div className="absolute inset-[41.67%_29.17%_37.5%_29.17%]" data-name="Vector">
            <div className="absolute inset-[-15%_-7.5%]">
              <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 7.66667 4.33333">
                <path d={svgPaths.pfbb3280} id="Vector" stroke="var(--stroke-0, #62707D)" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Frame32() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col gap-[3px] items-start min-h-px min-w-px relative">
      <p className="leading-[13.5px] relative shrink-0 text-[#00a46e] text-[9px] tracking-[0.4px] uppercase w-full">Allowed</p>
      <p className="leading-[normal] relative shrink-0 text-[#89949e] text-[10px] w-full">· Triage and classify alerts</p>
      <p className="leading-[normal] relative shrink-0 text-[#89949e] text-[10px] w-full">· Threat intelligence</p>
      <p className="leading-[normal] relative shrink-0 text-[#89949e] text-[10px] w-full">· Escalate to DST</p>
    </div>
  );
}

function Frame33() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col gap-[2px] items-start min-h-px min-w-px relative">
      <p className="leading-[13.5px] relative shrink-0 text-[#ff5757] text-[9px] tracking-[0.4px] uppercase w-full">Restricted</p>
      <p className="leading-[normal] relative shrink-0 text-[#89949e] text-[10px] w-full">· Quarantine endpoints</p>
      <p className="leading-[normal] relative shrink-0 text-[#89949e] text-[10px] w-full">· Block network segments</p>
    </div>
  );
}

function Frame31() {
  return (
    <div className="content-stretch flex font-['Inter:Regular',sans-serif] font-normal gap-[8px] items-start not-italic relative shrink-0 w-full whitespace-pre-wrap">
      <Frame32 />
      <Frame33 />
    </div>
  );
}

function Container() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[8px] items-start justify-center overflow-clip relative rounded-[inherit] w-full">
        <Frame4 />
        <div className="h-0 relative shrink-0 w-full">
          <div className="absolute inset-[-0.5px_0]">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 286 1">
              <path d="M0 0.5H286" id="Vector 203" stroke="var(--stroke-0, #121E27)" />
            </svg>
          </div>
        </div>
        <Frame5 />
        <Container2 />
        <div className="h-px relative shrink-0 w-full">
          <div className="absolute bottom-1/2 left-0 right-0 top-[-50%]">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 286 1">
              <path d="M0 0.5H286" id="Vector 204" stroke="var(--stroke-0, #121E27)" />
            </svg>
          </div>
        </div>
        <Frame16 />
        <ul className="block font-['Inter:Regular',sans-serif] font-normal leading-[0] not-italic relative shrink-0 text-[#89949e] text-[0px] whitespace-nowrap">
          <li className="list-disc ms-[calc(var(--list-marker-font-size,0)*1.5*1)] text-[10px] whitespace-pre-wrap">
            <span className="leading-[15px] text-[#89949e] uppercase">{`Phishing Triage — hr-mailbox-02 `}</span>
            <span className="leading-[15px] text-[#4a5568]">·</span>
            <span className="font-['Inter:Regular',sans-serif] font-normal leading-[15px] not-italic text-[#dadfe3]">{` Waiting enrichment`}</span>
          </li>
        </ul>
        <P5 />
        <div className="h-0 relative shrink-0 w-full">
          <div className="absolute inset-[-0.5px_0]">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 286 1">
              <path d="M0 0.5H286" id="Vector 203" stroke="var(--stroke-0, #121E27)" />
            </svg>
          </div>
        </div>
        <Frame17 />
        <Frame11 />
        <Frame12 />
        <Frame13 />
        <Frame14 />
        <Frame15 />
        <div className="h-0 relative shrink-0 w-full">
          <div className="absolute inset-[-0.5px_0]">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 286 1">
              <path d="M0 0.5H286" id="Vector 203" stroke="var(--stroke-0, #121E27)" />
            </svg>
          </div>
        </div>
        <Frame18 />
        <Frame25 />
        <div className="h-0 relative shrink-0 w-full">
          <div className="absolute inset-[-0.5px_0]">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 286 1">
              <path d="M0 0.5H286" id="Vector 203" stroke="var(--stroke-0, #121E27)" />
            </svg>
          </div>
        </div>
        <Button2 />
        <Frame28 />
        <Frame29 />
        <div className="h-0 relative shrink-0 w-full">
          <div className="absolute inset-[-0.5px_0]">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 286 1">
              <path d="M0 0.5H286" id="Vector 203" stroke="var(--stroke-0, #121E27)" />
            </svg>
          </div>
        </div>
        <Button3 />
        <p className="font-['Inter:Regular',sans-serif] font-normal leading-[0] not-italic relative shrink-0 text-[#dadfe3] text-[10px]">
          <span className="leading-[normal]">{`InfraSec `}</span>
          <span className="leading-[normal] text-[#89949e]">· Session metadata</span>
        </p>
        <Frame31 />
        <p className="font-['Inter:Regular',sans-serif] font-normal leading-[0] not-italic relative shrink-0 text-[#dadfe3] text-[10px]">
          <span className="leading-[normal]">{`Policy Reference `}</span>
          <span className="leading-[normal] text-[#89949e]">· NIST SP 800-61r2 · SOC2 CC7.2</span>
        </p>
      </div>
    </div>
  );
}

export default function Div() {
  return (
    <div className="relative rounded-[12px] size-full" data-name="div">
      <div aria-hidden="true" className="absolute inset-0 mix-blend-screen pointer-events-none rounded-[12px]" style={{ backgroundImage: "linear-gradient(94.2602deg, rgb(3, 7, 8) 0%, rgb(0, 0, 0) 35.132%, rgb(0, 0, 0) 65.097%, rgb(3, 7, 8) 90.93%)" }} />
      <div className="content-stretch flex flex-col items-start overflow-clip p-[17px] relative rounded-[inherit] size-full">
        <Container />
      </div>
      <div aria-hidden="true" className="absolute border border-[rgba(87,177,255,0.12)] border-solid inset-0 pointer-events-none rounded-[12px]" />
    </div>
  );
}