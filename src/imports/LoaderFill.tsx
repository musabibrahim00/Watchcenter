import React from "react";
import svgPaths from "./svg-naruo5er91";

export default function LoaderFill() {
  return (
    <div className="relative size-full" data-name="Loader Fill">
      <div className="-translate-x-1/2 -translate-y-1/2 absolute left-1/2 size-[12px] top-1/2">
        <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12 12">
          <path d={svgPaths.p4071f00} fill="var(--fill-0, #2FD897)" fillOpacity="0.12" id="Ellipse 230" />
        </svg>
      </div>
      <div className="-translate-x-1/2 -translate-y-1/2 absolute flex items-center justify-center left-1/2 size-[12px] top-1/2" style={{ "--transform-inner-width": "1200", "--transform-inner-height": "19" } as React.CSSProperties}>
        <div className="-rotate-90 flex-none">
          <div className="relative size-[12px]">
            <div className="absolute bottom-0 left-[0.23%] right-[0.23%] top-1/2">
              <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 11.9455 6">
                <path d={svgPaths.p3f488f00} fill="var(--fill-0, #2FD897)" id="Ellipse 229" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}