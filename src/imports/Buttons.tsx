import svgPaths from "./svg-tu9d27elxy";

export default function Buttons() {
  return (
    <div className="content-stretch flex gap-[8px] items-center relative size-full" data-name="Buttons">
      <div className="overflow-clip relative shrink-0 size-[14px]" data-name="Loader">
        <div className="-translate-x-1/2 -translate-y-1/2 absolute left-1/2 size-[12px] top-1/2">
          <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12 12">
            <path d={svgPaths.p4071f00} fill="var(--fill-0, #076498)" fillOpacity="0.24" id="Ellipse 230" />
          </svg>
        </div>
        <div className="-translate-x-1/2 -translate-y-1/2 absolute left-1/2 size-[12px] top-1/2">
          <div className="absolute bottom-[0.23%] left-1/2 right-[0.23%] top-1/2">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 5.97276 5.97276">
              <path d={svgPaths.p22ac670} fill="var(--fill-0, #0781C2)" id="Ellipse 229" />
            </svg>
          </div>
        </div>
      </div>
      <p className="font-['Inter:Regular',sans-serif] font-normal h-[11px] leading-[normal] not-italic relative shrink-0 text-[#dadfe3] text-[10px] w-[301.359px] whitespace-pre-wrap">Authorizing</p>
    </div>
  );
}