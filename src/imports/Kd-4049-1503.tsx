import svgPaths from "./svg-g917fa6ogx";

function Container1() {
  return (
    <div className="flex-[1_0_0] h-[36px] min-h-px min-w-px relative" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[4px] items-start leading-[normal] not-italic relative size-full tracking-[0.4px]">
        <p className="font-['Inter:Medium',sans-serif] font-medium relative shrink-0 text-[#dadfe3] text-[12px] w-full">Block lateral movement to domain controller</p>
        <p className="font-['Inter:Regular',sans-serif] font-normal relative shrink-0 text-[#89949e] text-[10px] w-full">Simulated attack path reaches domain admin in 3 hops via compromised jump server.</p>
      </div>
    </div>
  );
}

function Container() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-start justify-between relative w-full">
        <Container1 />
      </div>
    </div>
  );
}

function Container3() {
  return (
    <div className="flex-[1_0_0] min-h-px min-w-px relative" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col font-['Inter:Regular',sans-serif] font-normal gap-[4px] items-start leading-[normal] not-italic relative text-[10px] w-full">
        <p className="h-[11px] relative shrink-0 text-[#dadfe3] w-full">Why this matters</p>
        <p className="relative shrink-0 text-[#89949e] w-full">Domain admin reachable in 3 hops — active exploitation pattern detected</p>
      </div>
    </div>
  );
}

function Container2() {
  return (
    <div className="content-stretch flex flex-[1_0_0] gap-[12px] items-start min-h-px min-w-px relative" data-name="Container">
      <div className="flex h-0 items-center justify-center relative self-center shrink-0 w-0" style={{ "--transform-inner-width": "1200", "--transform-inner-height": "19" } as React.CSSProperties}>
        <div className="flex-none h-full rotate-90">
          <div className="h-full relative w-[39px]" data-name="separator">
            <div className="absolute inset-[-1px_0_0_0]">
              <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 39 1">
                <line id="separator" stroke="var(--stroke-0, #FF5757)" x2="39" y1="0.5" y2="0.5" />
              </svg>
            </div>
          </div>
        </div>
      </div>
      <Container3 />
    </div>
  );
}

function Progress() {
  return (
    <div className="content-stretch flex gap-[4px] items-center relative shrink-0" data-name="progress">
      <div className="flex items-center justify-center relative shrink-0">
        <div className="-scale-y-100 flex-none">
          <div className="overflow-clip relative size-[14px]" data-name="Icons">
            <div className="-translate-x-1/2 -translate-y-1/2 absolute left-1/2 size-[16px] top-1/2" data-name="Container" />
            <div className="absolute bottom-[20.83%] flex items-center justify-center left-1/4 right-1/4 top-[20.83%]">
              <div className="-rotate-90 flex-none h-[12px] w-[14px]">
                <div className="relative size-full" data-name="Vector">
                  <div className="absolute inset-[-7.14%_-6.12%]">
                    <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 9.16667 8">
                      <path d={svgPaths.p13457880} id="Vector" stroke="var(--stroke-0, #FF5757)" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <p className="font-['Inter:Regular',sans-serif] font-normal leading-[14px] not-italic relative shrink-0 text-[#ff5757] text-[14px] whitespace-nowrap">23.5%</p>
    </div>
  );
}

function Metrics() {
  return (
    <div className="relative shrink-0" data-name="Metrics">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[8px] items-center relative">
        <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[24px] not-italic relative shrink-0 text-[14px] text-white tracking-[-0.5px] whitespace-nowrap">3.6 hrs</p>
        <Progress />
      </div>
    </div>
  );
}

function Mttd() {
  return (
    <div className="bg-[#030609] content-stretch flex flex-col gap-[2px] items-start relative rounded-[12px] shadow-[0px_0px_15px_0px_rgba(0,0,0,0.1)] shrink-0" data-name="MTTD">
      <p className="font-['Inter:Regular',sans-serif] font-normal leading-[normal] not-italic relative shrink-0 text-[#dadfe3] text-[10px] whitespace-nowrap">MTTD</p>
      <Metrics />
    </div>
  );
}

function Frame() {
  return (
    <div className="relative shrink-0 w-full">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[16px] items-center relative w-full">
        <Container2 />
        <div className="flex flex-row items-center self-stretch">
          <div className="flex h-0 items-center justify-center relative self-center shrink-0 w-0" style={{ "--transform-inner-width": "1200", "--transform-inner-height": "19" } as React.CSSProperties}>
            <div className="flex-none h-full rotate-90">
              <div className="h-full relative w-[39px]" data-name="separator">
                <div className="absolute inset-[-1px_0_0_0]">
                  <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 39 1">
                    <line id="separator" opacity="0.2" stroke="var(--stroke-0, #89949E)" x2="39" y1="0.5" y2="0.5" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
        <Mttd />
      </div>
    </div>
  );
}

function ButtonGray() {
  return (
    <div className="h-[24px] relative rounded-[6px] shrink-0" data-name="ButtonGray">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex h-full items-center justify-center px-[12px] py-[8px] relative">
        <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[12px] not-italic relative shrink-0 text-[#f1f3ff] text-[10px] text-center whitespace-nowrap">Defer</p>
      </div>
    </div>
  );
}

function Buttons1() {
  return (
    <div className="content-stretch flex gap-[8px] items-center relative shrink-0" data-name="buttons">
      <div className="bg-[#076498] h-[24px] min-w-[84px] relative rounded-[6px] shrink-0" data-name="ButtonPrimary">
        <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[12px] h-full items-center justify-center min-w-[inherit] p-[8px] relative">
          <p className="flex-[1_0_0] font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[12px] min-h-px min-w-px not-italic relative text-[#f1f3ff] text-[10px] text-center">Authorize</p>
        </div>
      </div>
      <ButtonGray />
    </div>
  );
}

function ButtonGray1() {
  return (
    <div className="content-stretch flex h-[24px] items-center justify-center px-[12px] py-[8px] relative rounded-[6px] shrink-0" data-name="ButtonGray">
      <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[12px] not-italic relative shrink-0 text-[#f1f3ff] text-[10px] text-center whitespace-nowrap">View details</p>
    </div>
  );
}

function Buttons() {
  return (
    <div className="relative shrink-0 w-full" data-name="Buttons">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-between relative w-full">
        <Buttons1 />
        <ButtonGray1 />
      </div>
    </div>
  );
}

export default function Kd() {
  return (
    <div className="content-stretch flex flex-col gap-[20px] items-start p-[17px] relative rounded-[12px] size-full" data-name="Kd">
      <div aria-hidden="true" className="absolute inset-0 mix-blend-screen pointer-events-none rounded-[12px]" style={{ backgroundImage: "linear-gradient(111.789deg, rgb(8, 3, 3) 0%, rgb(0, 0, 0) 35.132%, rgb(0, 0, 0) 65.097%, rgb(8, 3, 3) 90.93%)" }} />
      <div aria-hidden="true" className="absolute border border-[#030609] border-solid inset-0 pointer-events-none rounded-[12px]" />
      <Container />
      <Frame />
      <Buttons />
    </div>
  );
}