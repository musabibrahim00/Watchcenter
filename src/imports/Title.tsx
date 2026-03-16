function Dot() {
  return <div className="bg-[#0781c2] rounded-[16777200px] shrink-0 size-[4px]" data-name="Dot" />;
}

function Dot1() {
  return <div className="bg-[#0781c2] rounded-[16777200px] shrink-0 size-[4px]" data-name="Dot" />;
}

export default function Title() {
  return (
    <div className="content-stretch flex gap-[16px] items-center relative size-full" data-name="Title">
      <p className="font-['Inter:Regular',sans-serif] font-normal leading-[normal] not-italic relative shrink-0 text-center text-[#dadfe3] text-[14px]">06:38:55 UTC</p>
      <Dot1 />
      <p className="font-['Inter:Regular',sans-serif] font-normal leading-[normal] not-italic relative shrink-0 text-center text-[#dadfe3] text-[14px]">Mode: Tactical</p>
    </div>
  );
}