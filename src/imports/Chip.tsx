export default function Chip() {
  return (
    <div className="bg-[rgba(0,164,110,0.08)] content-stretch flex items-center justify-center px-[12px] py-[4px] relative rounded-[99px] size-full" data-name="Chip">
      <div aria-hidden="true" className="absolute border border-[rgba(0,164,110,0.2)] border-solid inset-0 pointer-events-none rounded-[99px]" />
      <p className="font-['Inter:Regular',sans-serif] font-normal leading-[12px] not-italic relative shrink-0 text-[#00a46e] text-[10px] tracking-[0.3px] uppercase whitespace-nowrap">Active</p>
    </div>
  );
}