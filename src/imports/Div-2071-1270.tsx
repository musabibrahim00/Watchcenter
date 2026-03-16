import svgPaths from "./svg-mf1jhnberr";

function Container1() {
  return <div className="bg-[#00a46e] rounded-[16777200px] shrink-0 size-[5px]" data-name="Container" />;
}

function Frame1() {
  return (
    <div className="content-stretch flex gap-[7px] items-center relative shrink-0">
      <p className="font-['Inter:Medium',sans-serif] font-medium leading-[normal] not-italic relative shrink-0 text-[#89949e] text-[14px] tracking-[0.4px] uppercase">ASSET INTELLIGENCE ANALYST</p>
      <Container1 />
    </div>
  );
}

function Frame() {
  return (
    <div className="content-stretch flex flex-col font-['Inter:Regular',sans-serif] font-normal gap-[4px] items-start justify-end leading-[normal] not-italic relative shrink-0 text-[#89949e] text-[10px] w-full">
      <p className="relative shrink-0">{`Threat Detection & Response`}</p>
      <p className="relative shrink-0">2 Active · 1 Pending</p>
    </div>
  );
}

function Frame2() {
  return (
    <div className="content-stretch flex flex-col gap-[6px] items-start relative shrink-0 w-[230px]">
      <Frame1 />
      <Frame />
    </div>
  );
}

function Button() {
  return (
    <div className="content-stretch flex flex-col items-start pt-[4px] px-[4px] relative rounded-[4px] shrink-0 size-[20px]" data-name="button">
      <div className="overflow-clip relative shrink-0 size-[16px]" data-name="Icons">
        <div className="-translate-x-1/2 -translate-y-1/2 absolute left-1/2 size-[16px] top-1/2" data-name="Container" />
        <div className="absolute inset-1/4" data-name="Vector">
          <div className="absolute inset-[-6.25%]">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 9 9">
              <path d={svgPaths.p2e230080} id="Vector" stroke="var(--stroke-0, #62707D)" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

function Frame3() {
  return (
    <div className="content-stretch flex items-start justify-between relative shrink-0 w-full">
      <Frame2 />
      <Button />
    </div>
  );
}

function Frame12() {
  return (
    <div className="relative shrink-0">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex font-['Inter:Regular',sans-serif] font-normal gap-[12px] items-center leading-[0] not-italic relative text-[#4a5568] text-[0px] text-[10px]">
        <p className="relative shrink-0">
          <span className="leading-[normal] text-[#89949e]">Conf</span>
          <span className="leading-[normal]">{` `}</span>
          <span className="leading-[normal] text-[#dadfe3]">0.91</span>
        </p>
        <p className="relative shrink-0">
          <span className="leading-[normal] text-[#89949e]">Risk</span>
          <span className="leading-[normal]">{` `}</span>
          <span className="leading-[normal] text-[#ff5757]">+22</span>
        </p>
      </div>
    </div>
  );
}

function Container3() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-start justify-center relative shrink-0 w-full" data-name="Container">
      <Frame12 />
      <p className="font-['Inter:Regular',sans-serif] font-normal leading-[normal] not-italic relative shrink-0 text-[#dadfe3] text-[10px]">Correlating lateral movement signals</p>
    </div>
  );
}

function Button1() {
  return (
    <div className="content-stretch flex gap-[4px] h-[13.5px] items-center relative shrink-0 w-[64.461px]" data-name="button">
      <p className="font-['Inter:Regular',sans-serif] font-normal leading-[13.5px] not-italic relative shrink-0 text-[#89949e] text-[10px] text-center">View details</p>
      <div className="relative shrink-0 size-[16px]" data-name="Icons">
        <div className="bg-clip-padding border-0 border-[transparent] border-solid overflow-clip relative rounded-[inherit] size-full">
          <div className="-translate-x-1/2 -translate-y-1/2 absolute left-1/2 size-[16px] top-1/2" data-name="Container" />
          <div className="absolute flex inset-[29.17%_41.67%_29.17%_37.5%] items-center justify-center">
            <div className="-scale-y-100 flex-none h-[5px] rotate-90 w-[10px]">
              <div className="relative size-full" data-name="Vector">
                <div className="absolute inset-[-15%_-7.5%]">
                  <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 7.66667 4.33333">
                    <path d={svgPaths.pfbb3280} id="Vector" stroke="var(--stroke-0, #62707D)" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Container2() {
  return (
    <div className="bg-[#030609] relative rounded-[8px] shrink-0 w-full" data-name="Container">
      <div aria-hidden="true" className="absolute border border-[#030609] border-solid inset-0 pointer-events-none rounded-[8px]" />
      <div className="content-stretch flex flex-col gap-[16px] items-start p-[12px] relative w-full">
        <p className="font-['Inter:Regular',sans-serif] font-normal leading-[normal] not-italic relative shrink-0 text-[#dadfe3] text-[12px]">Anomaly Investigation — finance-admin-02</p>
        <Container3 />
        <Button1 />
      </div>
    </div>
  );
}

function Frame13() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-start relative shrink-0 w-full">
      <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[normal] not-italic relative shrink-0 text-[#89949e] text-[10px] tracking-[0.8px] uppercase">Active Work</p>
      <Container2 />
    </div>
  );
}

function Frame14() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-start not-italic relative shrink-0 text-[#89949e] text-[10px]">
      <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[normal] relative shrink-0 tracking-[0.8px] uppercase">In Queue</p>
      <ul className="block font-['Inter:Regular',sans-serif] font-normal leading-[0] list-disc relative shrink-0 text-[0px] whitespace-nowrap whitespace-pre-wrap">
        <li className="mb-0 ms-[calc(var(--list-marker-font-size,0)*1.5*1)]">
          <span className="leading-[15px] text-[#89949e] uppercase">{`Phishing Triage — hr-mailbox-02 `}</span>
          <span className="leading-[15px] text-[#4a5568]">·</span>
          <span className="font-['Inter:Regular',sans-serif] font-normal leading-[15px] not-italic text-[#dadfe3]">{` Waiting enrichme`}</span>
        </li>
        <li className="ms-[calc(var(--list-marker-font-size,0)*1.5*1)]">
          <span className="leading-[15px]">EDR Alert — corp-endpoint-17</span>
          <span className="leading-[15px]">{` `}</span>
          <span className="font-['Inter:Regular',sans-serif] font-normal leading-[15px] not-italic">· Scheduled</span>
        </li>
      </ul>
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

function Container4() {
  return (
    <div className="bg-[rgba(7,129,194,0.15)] content-stretch flex items-center justify-center relative rounded-[16777200px] shrink-0 size-[12px]" data-name="Container">
      <Check />
    </div>
  );
}

function Frame4() {
  return (
    <div className="content-stretch flex gap-[8px] items-center relative shrink-0">
      <p className="font-['Inter:Regular',sans-serif] font-normal leading-[normal] not-italic relative shrink-0 text-[#89949e] text-[10px] w-[42px] whitespace-pre-wrap">10:31:44</p>
      <Container4 />
      <p className="font-['Inter:Regular',sans-serif] font-normal leading-[normal] not-italic relative shrink-0 text-[#dadfe3] text-[10px]">Ingested SIEM alert payload</p>
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

function Container5() {
  return (
    <div className="bg-[rgba(7,129,194,0.15)] content-stretch flex items-center justify-center relative rounded-[16777200px] shrink-0 size-[12px]" data-name="Container">
      <Check1 />
    </div>
  );
}

function Frame15() {
  return (
    <div className="content-stretch flex gap-[8px] items-center relative shrink-0">
      <p className="font-['Inter:Regular',sans-serif] font-normal leading-[normal] not-italic relative shrink-0 text-[#89949e] text-[10px] w-[42px] whitespace-pre-wrap">10:31:48</p>
      <Container5 />
      <p className="font-['Inter:Regular',sans-serif] font-normal leading-[normal] not-italic relative shrink-0 text-[#dadfe3] text-[10px]">Enriched with threat intel context</p>
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

function Container6() {
  return (
    <div className="bg-[rgba(7,129,194,0.15)] content-stretch flex items-center justify-center relative rounded-[16777200px] shrink-0 size-[12px]" data-name="Container">
      <Check2 />
    </div>
  );
}

function Frame16() {
  return (
    <div className="content-stretch flex gap-[8px] items-center relative shrink-0">
      <p className="font-['Inter:Regular',sans-serif] font-normal leading-[normal] not-italic relative shrink-0 text-[#89949e] text-[10px] w-[42px] whitespace-pre-wrap">10:31:52</p>
      <Container6 />
      <p className="font-['Inter:Regular',sans-serif] font-normal leading-[normal] not-italic relative shrink-0 text-[#dadfe3] text-[10px]">Correlated with endpoint telemetry</p>
    </div>
  );
}

function Loader() {
  return (
    <div className="relative size-[7px]" data-name="Loader2">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 7 7">
        <g clipPath="url(#clip0_2071_1300)" id="Loader2">
          <path d={svgPaths.p3ccac180} id="Vector" stroke="var(--stroke-0, #F05B06)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.583333" />
        </g>
        <defs>
          <clipPath id="clip0_2071_1300">
            <rect fill="white" height="7" width="7" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Container7() {
  return (
    <div className="bg-[rgba(240,91,6,0.15)] content-stretch flex items-center justify-center relative rounded-[16777200px] shrink-0 size-[12px]" data-name="Container">
      <div className="flex items-center justify-center relative shrink-0 size-[9.243px]" style={{ "--transform-inner-width": "1200", "--transform-inner-height": "19" } as React.CSSProperties}>
        <div className="flex-none rotate-[155.98deg]">
          <Loader />
        </div>
      </div>
    </div>
  );
}

function Frame17() {
  return (
    <div className="content-stretch flex gap-[8px] items-center relative shrink-0">
      <p className="font-['Inter:Regular',sans-serif] font-normal leading-[normal] not-italic relative shrink-0 text-[#89949e] text-[10px] w-[42px] whitespace-pre-wrap">10:31:58</p>
      <Container7 />
      <p className="font-['Inter:Regular',sans-serif] font-normal leading-[normal] not-italic relative shrink-0 text-[#dadfe3] text-[10px]">Analyzing lateral movement indicators</p>
    </div>
  );
}

function Container9() {
  return <div className="bg-[#1e2a34] rounded-[16777200px] shrink-0 size-[3px]" data-name="Container" />;
}

function Container8() {
  return (
    <div className="content-stretch flex items-center justify-center p-px relative rounded-[16777200px] shrink-0 size-[12px]" data-name="Container">
      <div aria-hidden="true" className="absolute border border-[rgba(30,42,52,0.6)] border-solid inset-0 pointer-events-none rounded-[16777200px]" />
      <Container9 />
    </div>
  );
}

function Frame18() {
  return (
    <div className="content-stretch flex gap-[8px] items-center relative shrink-0">
      <p className="font-['Inter:Regular',sans-serif] font-normal leading-[normal] not-italic relative shrink-0 text-[#89949e] text-[10px] w-[42px] whitespace-pre-wrap">—</p>
      <Container8 />
      <p className="font-['Inter:Regular',sans-serif] font-normal leading-[normal] not-italic relative shrink-0 text-[#89949e] text-[10px]">Next: Generate incident summary for DST</p>
    </div>
  );
}

function Frame19() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-start relative shrink-0">
      <Frame4 />
      <Frame15 />
      <Frame16 />
      <Frame17 />
      <Frame18 />
    </div>
  );
}

function Frame20() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-start relative shrink-0">
      <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[normal] not-italic relative shrink-0 text-[#89949e] text-[10px] tracking-[0.8px] uppercase">Step Timeline</p>
      <Frame19 />
    </div>
  );
}

function Frame8() {
  return (
    <div className="content-stretch flex gap-[8px] items-center relative shrink-0">
      <p className="font-['Inter:Medium',sans-serif] font-medium leading-[19.5px] relative shrink-0 text-[#ff5757] text-[12px]">+22</p>
      <p className="font-['Inter:Regular',sans-serif] font-normal leading-[15px] relative shrink-0 text-[#4a5568] text-[10px]">→</p>
      <p className="font-['Inter:Medium',sans-serif] font-medium leading-[19.5px] relative shrink-0 text-[#34d399] text-[12px]">-18</p>
    </div>
  );
}

function Frame7() {
  return (
    <div className="content-stretch flex gap-[4px] items-center relative shrink-0">
      <p className="font-['Inter:Regular',sans-serif] font-normal leading-[normal] relative shrink-0 text-[#89949e] text-[10px]">Residual</p>
      <p className="font-['Inter:Medium',sans-serif] font-medium leading-[19.5px] relative shrink-0 text-[#dadfe3] text-[12px]">+4</p>
    </div>
  );
}

function Frame6() {
  return (
    <div className="content-stretch flex items-center justify-between relative shrink-0 w-full">
      <Frame8 />
      <Frame7 />
    </div>
  );
}

function Frame21() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-start not-italic relative shrink-0 w-full">
      <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[normal] relative shrink-0 text-[#89949e] text-[10px] tracking-[0.8px] uppercase">Risk Projection</p>
      <Frame6 />
    </div>
  );
}

function Button2() {
  return (
    <div className="content-stretch flex h-[17.5px] items-center justify-between relative shrink-0 w-full" data-name="button">
      <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[normal] not-italic relative shrink-0 text-[#89949e] text-[10px] tracking-[0.8px] uppercase">Agent Communication</p>
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

function Container10() {
  return (
    <div className="bg-[rgba(7,129,194,0.15)] content-stretch flex items-center justify-center relative rounded-[16777200px] shrink-0 size-[12px]" data-name="Container">
      <Check3 />
    </div>
  );
}

function Frame5() {
  return (
    <div className="content-stretch flex gap-[8px] items-center relative shrink-0">
      <p className="font-['Inter:Regular',sans-serif] font-normal leading-[normal] not-italic relative shrink-0 text-[#89949e] text-[10px] w-[42px] whitespace-pre-wrap">10:31:44</p>
      <Container10 />
      <p className="font-['Inter:Regular',sans-serif] font-normal leading-[0] not-italic relative shrink-0 text-[#dadfe3] text-[10px]">
        <span className="leading-[normal]">{`InfraSec `}</span>
        <span className="leading-[normal] text-[#89949e]">· Network flow request</span>
      </p>
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

function Container11() {
  return (
    <div className="bg-[rgba(7,129,194,0.15)] content-stretch flex items-center justify-center relative rounded-[16777200px] shrink-0 size-[12px]" data-name="Container">
      <Check4 />
    </div>
  );
}

function Frame22() {
  return (
    <div className="content-stretch flex gap-[8px] items-center relative shrink-0">
      <p className="font-['Inter:Regular',sans-serif] font-normal leading-[normal] not-italic relative shrink-0 text-[#89949e] text-[10px] w-[42px] whitespace-pre-wrap">10:31:48</p>
      <Container11 />
      <p className="font-['Inter:Regular',sans-serif] font-normal leading-[0] not-italic relative shrink-0 text-[#dadfe3] text-[10px]">
        <span className="leading-[normal]">{`InfraSec `}</span>
        <span className="leading-[normal] text-[#89949e]">· Session metadata</span>
      </p>
    </div>
  );
}

function Frame23() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-start relative shrink-0">
      <Frame5 />
      <Frame22 />
    </div>
  );
}

function Frame24() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-start relative shrink-0 w-full">
      <Button2 />
      <Frame23 />
    </div>
  );
}

function Button3() {
  return (
    <div className="content-stretch flex h-[17.5px] items-center justify-between relative shrink-0 w-full" data-name="button">
      <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[normal] not-italic relative shrink-0 text-[#89949e] text-[10px] tracking-[0.8px] uppercase">Automation Boundaries</p>
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

function Frame10() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col gap-[3px] items-start min-h-px min-w-px relative">
      <p className="relative shrink-0 text-[#00a46e] tracking-[0.4px] uppercase w-full">Allowed</p>
      <div className="relative shrink-0 text-[#89949e] w-full">
        <p className="mb-0">· Triage and classify alerts</p>
        <p className="mb-0">· Threat intelligence</p>
        <p>· Escalate to DST</p>
      </div>
    </div>
  );
}

function Frame9() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col gap-[2px] items-start min-h-px min-w-px relative">
      <p className="relative shrink-0 text-[#ff5757] tracking-[0.4px] uppercase w-full">Restricted</p>
      <div className="relative shrink-0 text-[#89949e] w-full">
        <p className="mb-0">· Quarantine endpoints</p>
        <p>· Block network segments</p>
      </div>
    </div>
  );
}

function Frame11() {
  return (
    <div className="content-stretch flex gap-[8px] items-start leading-[normal] relative shrink-0 w-full whitespace-pre-wrap">
      <Frame10 />
      <Frame9 />
    </div>
  );
}

function Frame25() {
  return (
    <div className="content-stretch flex flex-col font-['Inter:Regular',sans-serif] font-normal gap-[8px] items-start not-italic relative shrink-0 text-[10px] w-full">
      <p className="leading-[0] relative shrink-0 text-[#dadfe3]">
        <span className="leading-[normal]">{`InfraSec `}</span>
        <span className="leading-[normal] text-[#89949e]">· Session metadata</span>
      </p>
      <Frame11 />
    </div>
  );
}

function Frame26() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-start relative shrink-0 w-full">
      <Button3 />
      <Frame25 />
    </div>
  );
}

function Container() {
  return (
    <div className="flex-[1_0_0] min-h-px min-w-px relative w-full" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[12px] items-start overflow-clip relative rounded-[inherit] size-full">
        <Frame3 />
        <div className="h-0 relative shrink-0 w-full">
          <div className="absolute inset-[-0.5px_0]">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 286 1">
              <path d="M0 0.5H286" id="Vector 203" stroke="var(--stroke-0, #121E27)" />
            </svg>
          </div>
        </div>
        <Frame13 />
        <div className="h-0 relative shrink-0 w-full">
          <div className="absolute inset-[-0.5px_0]">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 286 1">
              <path d="M0 0.5H286" id="Vector 203" stroke="var(--stroke-0, #121E27)" />
            </svg>
          </div>
        </div>
        <Frame14 />
        <div className="h-0 relative shrink-0 w-full">
          <div className="absolute inset-[-0.5px_0]">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 286 1">
              <path d="M0 0.5H286" id="Vector 203" stroke="var(--stroke-0, #121E27)" />
            </svg>
          </div>
        </div>
        <Frame20 />
        <div className="h-0 relative shrink-0 w-full">
          <div className="absolute inset-[-0.5px_0]">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 286 1">
              <path d="M0 0.5H286" id="Vector 203" stroke="var(--stroke-0, #121E27)" />
            </svg>
          </div>
        </div>
        <Frame21 />
        <div className="h-0 relative shrink-0 w-full">
          <div className="absolute inset-[-0.5px_0]">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 286 1">
              <path d="M0 0.5H286" id="Vector 203" stroke="var(--stroke-0, #121E27)" />
            </svg>
          </div>
        </div>
        <Frame24 />
        <div className="h-0 relative shrink-0 w-full">
          <div className="absolute inset-[-0.5px_0]">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 286 1">
              <path d="M0 0.5H286" id="Vector 203" stroke="var(--stroke-0, #121E27)" />
            </svg>
          </div>
        </div>
        <Frame26 />
        <div className="h-0 relative shrink-0 w-full">
          <div className="absolute inset-[-0.5px_0]">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 286 1">
              <path d="M0 0.5H286" id="Vector 203" stroke="var(--stroke-0, #121E27)" />
            </svg>
          </div>
        </div>
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
      <div aria-hidden="true" className="absolute inset-0 mix-blend-screen pointer-events-none rounded-[12px]" style={{ backgroundImage: "linear-gradient(95.1116deg, rgb(3, 7, 8) 0%, rgb(0, 0, 0) 35.132%, rgb(0, 0, 0) 65.097%, rgb(3, 7, 8) 90.93%)" }} />
      <div className="content-stretch flex flex-col items-start overflow-clip p-[17px] relative rounded-[inherit] size-full">
        <Container />
      </div>
      <div aria-hidden="true" className="absolute border border-[rgba(87,177,255,0.12)] border-solid inset-0 pointer-events-none rounded-[12px]" />
    </div>
  );
}