import svgPaths from "./svg-vdr1mak4h3";

function Title() {
  return (
    <div className="relative shrink-0 w-full" data-name="Title">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[4px] items-center relative w-full">
        <div className="overflow-clip relative shrink-0 size-[20px]" data-name="Icons">
          <div className="-translate-x-1/2 -translate-y-1/2 absolute left-1/2 size-[16px] top-1/2" data-name="Container" />
          <div className="absolute inset-[18.75%]" data-name="Subtract">
            <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12.5 12.5">
              <path d={svgPaths.paf75d00} fill="var(--fill-0, #00A46E)" id="Subtract" />
            </svg>
          </div>
        </div>
        <p className="flex-[1_0_0] font-['Inter:Medium',sans-serif] font-medium leading-[normal] min-h-px min-w-px not-italic relative text-[#89949e] text-[14px] tracking-[0.4px] uppercase whitespace-pre-wrap">Decisions Taken Today</p>
        <div className="overflow-clip relative shrink-0 size-[16px]" data-name="Icons">
          <div className="-translate-x-1/2 -translate-y-1/2 absolute left-1/2 size-[16px] top-1/2" data-name="Container" />
          <div className="absolute inset-[41.67%_29.17%_37.5%_29.17%]" data-name="Vector">
            <div className="absolute inset-[-15%_-7.5%]">
              <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 7.66667 4.33333">
                <path d={svgPaths.pfbb3280} id="Vector" stroke="var(--stroke-0, #2C3C47)" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DecisionsTakenTodayCollapsed() {
  return (
    <div className="content-stretch flex flex-col gap-[16px] items-start p-[17px] relative rounded-[12px] size-full" data-name="DecisionsTakenTodayCollapsed">
      <div aria-hidden="true" className="absolute inset-0 mix-blend-screen pointer-events-none rounded-[12px]" style={{ backgroundImage: "linear-gradient(134.825deg, rgb(3, 7, 8) 0%, rgb(0, 0, 0) 35.132%, rgb(0, 0, 0) 65.097%, rgb(3, 7, 8) 90.93%)" }} />
      <div aria-hidden="true" className="absolute border border-[#030609] border-solid inset-0 pointer-events-none rounded-[12px]" />
      <Title />
    </div>
  );
}