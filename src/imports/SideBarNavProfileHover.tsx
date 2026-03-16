import img5 from "figma:asset/a1d9b7e3c2e2ac7d5a48423ceaf15797baefd768.png";

function NavigationItems() {
  return (
    <div className="content-stretch flex items-center justify-center relative rounded-[8px] shrink-0 size-[28px]" data-name="_navigation-items">
      <div className="relative rounded-[24px] shrink-0 size-[24px]" data-name="Avatars">
        <div className="overflow-clip relative rounded-[inherit] size-full">
          <div className="absolute inset-[0_-1.56%_-2.81%_-1.25%]" data-name="5">
            <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={img5} />
          </div>
        </div>
        <div aria-hidden="true" className="absolute border border-[#14a2e3] border-solid inset-0 pointer-events-none rounded-[24px]" />
      </div>
    </div>
  );
}

function SideBarNavProfile() {
  return (
    <div className="content-stretch flex items-center justify-center p-[4px] relative rounded-[8px] shrink-0 size-[28px]" data-name="SideBarNavProfile">
      <NavigationItems />
    </div>
  );
}

function SideBarNavProfileTooltip() {
  return (
    <div className="bg-[#08121c] content-stretch flex items-center justify-center p-[8px] relative rounded-[8px] shrink-0" data-name="SideBarNavProfileTooltip">
      <div aria-hidden="true" className="absolute border border-[#1e2a34] border-solid inset-0 pointer-events-none rounded-[8px]" />
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[12px] text-white whitespace-nowrap">
        <p className="leading-none">Profile</p>
      </div>
    </div>
  );
}

export default function SideBarNavProfileHover() {
  return (
    <div className="content-stretch flex gap-[12px] items-center relative size-full" data-name="SideBarNavProfileHover">
      <SideBarNavProfile />
      <SideBarNavProfileTooltip />
    </div>
  );
}