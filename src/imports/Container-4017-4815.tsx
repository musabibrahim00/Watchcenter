function Container4() {
  return <div className="bg-[#00a46e] rounded-[99px] shrink-0 size-[8px]" data-name="Container" />;
}

function Container3() {
  return (
    <div className="relative shrink-0" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[6px] items-center relative">
        <Container4 />
        <p className="font-['Inter:Medium',sans-serif] font-medium leading-[normal] not-italic relative shrink-0 text-[14px] text-white tracking-[-0.3px] whitespace-nowrap">Asset Intelligence Analyst</p>
      </div>
    </div>
  );
}

function Container5() {
  return (
    <div className="bg-[rgba(0,164,110,0.08)] relative rounded-[99px] shrink-0" data-name="Container">
      <div aria-hidden="true" className="absolute border border-[rgba(0,164,110,0.2)] border-solid inset-0 pointer-events-none rounded-[99px]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center px-[12px] py-[4px] relative">
        <p className="font-['Inter:Regular',sans-serif] font-normal leading-[12px] not-italic relative shrink-0 text-[#00a46e] text-[10px] tracking-[0.3px] uppercase whitespace-nowrap">Active</p>
      </div>
    </div>
  );
}

function Container2() {
  return (
    <div className="relative shrink-0" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[8px] items-center relative">
        <Container3 />
        <Container5 />
      </div>
    </div>
  );
}

function MotionDiv() {
  return <div className="bg-[#00a46e] opacity-53 rounded-[33554400px] shrink-0 size-[6.227px]" data-name="motion.div" />;
}

function Span() {
  return (
    <div className="h-[14px] relative shrink-0 w-[96.406px]" data-name="span">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-start relative size-full">
        <p className="font-['Inter:Regular',sans-serif] font-normal leading-[14px] not-italic relative shrink-0 text-[#00a46e] text-[11px] whitespace-nowrap">Processing signals</p>
      </div>
    </div>
  );
}

function Container6() {
  return (
    <div className="h-[14px] relative shrink-0 w-[108.406px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[5.887px] items-center pl-[-0.113px] relative size-full">
        <MotionDiv />
        <Span />
      </div>
    </div>
  );
}

function Container1() {
  return (
    <div className="relative shrink-0 w-[950px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-between relative w-full">
        <Container2 />
        <Container6 />
      </div>
    </div>
  );
}

export default function Container() {
  return (
    <div className="content-stretch flex flex-col gap-[24px] items-start px-[25px] py-[21px] relative rounded-[12px] size-full" data-name="Container">
      <div aria-hidden="true" className="absolute inset-0 mix-blend-screen pointer-events-none rounded-[12px]" style={{ backgroundImage: "linear-gradient(148.694deg, rgb(4, 8, 3) 0%, rgb(0, 0, 0) 35.132%, rgb(0, 0, 0) 65.097%, rgb(4, 8, 3) 90.93%)" }} />
      <div aria-hidden="true" className="absolute border border-[#030609] border-solid inset-0 pointer-events-none rounded-[12px]" />
      <Container1 />
      <p className="font-['IBM_Plex_Mono:Regular',sans-serif] leading-[15.4px] min-w-full not-italic relative shrink-0 text-[#89949e] text-[11px] w-[min-content]">Investigating anomaly on finance-admin-02 — risk score +22 (0.91 confidence). Correlating lateral movement signals across systems.</p>
    </div>
  );
}