function Container() {
  return <div className="bg-[#00a46e] rounded-[16777200px] shrink-0 size-[5px]" data-name="Container" />;
}

export default function Header() {
  return (
    <div className="content-stretch flex gap-[4px] items-center relative size-full" data-name="Header">
      <Container />
      <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[normal] not-italic relative shrink-0 text-[#dadfe3] text-[12px] tracking-[0.4px] uppercase whitespace-nowrap">Live System Status</p>
    </div>
  );
}