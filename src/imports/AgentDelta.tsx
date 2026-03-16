function Frame() {
  return (
    <div className="content-stretch flex font-['Inter:Medium',sans-serif] font-medium items-center justify-between leading-[normal] not-italic relative shrink-0 text-[12px] text-center w-full">
      <p className="relative shrink-0 text-[#dadfe3]">Agent Delta</p>
      <p className="relative shrink-0 text-[#f05b06]">Attention</p>
    </div>
  );
}

function Frame1() {
  return (
    <div className="content-stretch flex flex-col items-start justify-center relative shrink-0 w-full">
      <ul className="block font-['Inter:Regular',sans-serif] font-normal leading-[0] list-disc not-italic relative shrink-0 text-[#89949e] text-[12px] whitespace-nowrap whitespace-pre-wrap">
        <li className="mb-0 ms-[18px]">
          <span className="leading-[1.5]">Detecting privilege escalation</span>
        </li>
        <li className="mb-0 ms-[18px]">
          <span className="leading-[1.5]">Profiling lateral movement</span>
        </li>
        <li className="ms-[18px]">
          <span className="leading-[1.5]">Awaiting containment auth</span>
        </li>
      </ul>
    </div>
  );
}

export default function AgentDeltaTooltip() {
  return (
    <div className="bg-[#0c161f] content-stretch flex flex-col gap-[12px] items-start p-[16px] relative rounded-[12px] size-full border border-[rgba(18,30,39,0.6)]" data-name="AgentDelta">
      <Frame />
      <Frame1 />
    </div>
  );
}
