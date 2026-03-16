function Container1() {
  return (
    <div className="flex-[1_0_0] h-[36px] min-h-px min-w-px relative" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[4px] items-start leading-[normal] not-italic relative size-full tracking-[0.4px] whitespace-pre-wrap">
        <p className="font-['Inter:Medium',sans-serif] font-medium relative shrink-0 text-[#dadfe3] text-[12px] w-full">Deploy critical patch to finance-db-01</p>
        <p className="font-['Inter:Regular',sans-serif] font-normal relative shrink-0 text-[#89949e] text-[10px] w-full">CVE-2024-5821 actively exploited in the wild. Finance database directly exposed.</p>
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
        <p className="h-[11px] relative shrink-0 text-[#dadfe3] w-[301.359px] whitespace-pre-wrap">Why this matters</p>
        <p className="relative shrink-0 text-[#89949e]">KEV match + internet exposed + asset classified as crown jewel</p>
      </div>
    </div>
  );
}

function Container2() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[12px] items-start relative w-full">
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
        <Container3 />
      </div>
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
      <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[12px] not-italic relative shrink-0 text-[#f1f3ff] text-[10px] text-center">View details</p>
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
      <div aria-hidden="true" className="absolute inset-0 mix-blend-screen pointer-events-none rounded-[12px]" style={{ backgroundImage: "linear-gradient(112.026deg, rgb(8, 3, 3) 0%, rgb(0, 0, 0) 35.132%, rgb(0, 0, 0) 65.097%, rgb(8, 3, 3) 90.93%)" }} />
      <div aria-hidden="true" className="absolute border border-[#030609] border-solid inset-0 pointer-events-none rounded-[12px]" />
      <Container />
      <Container2 />
      <Buttons />
    </div>
  );
}