import { useLocation } from "react-router";
import { useState, useEffect } from "react";
import svgPaths from "./svg-vlugkcafyl";
import { useTimeTravel } from "../app/shared/contexts/TimeTravelContext";

/**
 * Global Application Header
 * ==========================
 * 
 * Displays at the top of every page in the application.
 * Shows dynamic page title based on current route.
 * 
 * Features:
 * - Dynamic page title based on route
 * - UTC clock
 * - Time Travel calendar icon
 * - Global action icons (AI, activity monitor, teammate)
 * - Consistent styling across all pages
 * - Sticky positioning (z-40)
 * 
 * Layout:
 * [Page Title]                [Time] [Calendar] [Divider] [AI] [Monitor] [Teammate]
 */

// Route to page title mapping
const PAGE_TITLES: Record<string, string> = {
  "/": "Watch Center",
  "/control-center": "Control Center",
  "/assets": "Asset Register",
  "/employees": "Employees",
  "/risk-register": "Risk Register",
  "/attack-path": "Attack Paths",
  "/vulnerabilities": "Vulnerabilities",
  "/misconfigurations": "Misconfigurations",
  "/case-management": "Case Management",
  "/compliance": "Compliance",
  "/integrations": "Integrations",
  "/workflows": "Workflows",
  "/settings": "Settings",
};

function getPageTitle(pathname: string): string {
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname];
  if (pathname.startsWith("/assets/")) return "Asset Detail";
  if (pathname.startsWith("/attack-path/")) return "Attack Path Detail";
  if (pathname.startsWith("/agent/")) return "Agent Detail";
  if (pathname.startsWith("/case-management/")) return "Case Detail";
  return "Watch Center";
}

function TimeTravelButton() {
  const { isActive, activate, deactivate } = useTimeTravel();
  const [pickerDate, setPickerDate] = useState("");
  const [showPicker, setShowPicker] = useState(false);

  const togglePicker = () => setShowPicker((p) => !p);
  const closePicker = () => setShowPicker(false);

  return (
    <div className="relative shrink-0">
      <button
        onClick={togglePicker}
        className="size-[28px] rounded-[8px] flex items-center justify-center transition-colors cursor-pointer"
        style={{
          backgroundColor: isActive ? "rgba(245,179,1,0.12)" : "transparent",
          border: isActive ? "1px solid rgba(245,179,1,0.40)" : "none",
        }}
        title="Time Travel — View historical state"
        onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.06)"; }}
        onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.backgroundColor = "transparent"; }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={isActive ? "#f5b301" : "#62707D"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      </button>
      {showPicker && (
        <>
          <div className="fixed inset-0 z-[60]" onClick={closePicker} />
          <div
            className="absolute top-[34px] right-0 z-[70] rounded-[10px] p-[16px] min-w-[260px]"
            style={{ backgroundColor: "#0b1a25", border: "1px solid #0E1C26", boxShadow: "0 8px 24px rgba(0,0,0,0.5)" }}
          >
            <div className="flex items-center gap-[8px] mb-[12px]">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f5b301" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              <span className="text-[12px]" style={{ color: "#dadfe3", fontWeight: 600 }}>Time Travel</span>
            </div>
            <p className="text-[10px] leading-[1.5] mb-[12px]" style={{ color: "#89949e" }}>
              View the entire platform as it existed at a specific date. All actions become read-only.
            </p>
            <label className="text-[10px] mb-[6px] block" style={{ color: "#b0bcc6", fontWeight: 500 }}>Select date</label>
            <input
              type="date"
              value={pickerDate}
              onChange={(e) => setPickerDate(e.target.value)}
              max={new Date().toISOString().split("T")[0]}
              className="w-full rounded-[6px] px-[10px] py-[8px] text-[12px] mb-[12px] outline-none"
              style={{ backgroundColor: "#060c12", border: "1px solid #0E1C26", color: "#dadfe3", colorScheme: "dark" }}
            />
            <div className="flex items-center gap-[8px]">
              <button
                onClick={() => { activate(pickerDate); closePicker(); }}
                disabled={!pickerDate}
                className="flex-1 flex items-center justify-center gap-[6px] rounded-[6px] py-[7px] text-[11px] transition-colors cursor-pointer"
                style={{ backgroundColor: pickerDate ? "#f5b301" : "rgba(245,179,1,0.3)", color: "#fff", fontWeight: 600, opacity: pickerDate ? 1 : 0.5 }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                Activate
              </button>
              {isActive && (
                <button
                  onClick={() => { deactivate(); closePicker(); }}
                  className="flex items-center justify-center gap-[6px] rounded-[6px] px-[14px] py-[7px] text-[11px] transition-colors cursor-pointer"
                  style={{ backgroundColor: "transparent", border: "1px solid #0E1C26", color: "#b0bcc6", fontWeight: 500 }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.04)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
                >
                  Exit
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default function Header() {
  const { pathname } = useLocation();
  const pageTitle = getPageTitle(pathname);

  const [utcTime, setUtcTime] = useState(() => {
    const now = new Date();
    return now.toISOString().slice(11, 19) + " UTC";
  });

  useEffect(() => {
    const id = setInterval(() => {
      const now = new Date();
      setUtcTime(now.toISOString().slice(11, 19) + " UTC");
    }, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="bg-[#030609] content-stretch flex items-center px-[24px] py-[16px] relative size-full" data-name="Header">
      <div aria-hidden="true" className="absolute border-[#0E1C26] border-b border-solid inset-0 pointer-events-none" />
      <p className="flex-1 font-['Inter:Bold',sans-serif] font-bold leading-[24px] not-italic relative text-[#dadfe3] text-[20px] tracking-[-0.5px] whitespace-pre-wrap">{pageTitle}</p>
      <div className="content-stretch flex gap-[12px] items-center relative shrink-0">
        {/* UTC Clock */}
        <p className="font-['Inter:Regular',sans-serif] font-normal leading-[normal] not-italic relative shrink-0 text-[#89949e] text-[14px] whitespace-nowrap">{utcTime}</p>

        {/* Separator before Calendar */}
        <div className="flex h-[18px] items-center justify-center relative shrink-0 w-0">
          <div className="flex-none rotate-90">
            <div className="h-0 relative w-[18px]">
              <div className="absolute inset-[-1px_0_0_0]">
                <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 1">
                  <line stroke="#57B1FF" strokeOpacity="0.12" x2="18" y1="0.5" y2="0.5" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Time Travel Calendar */}
        <TimeTravelButton />

        {/* Divider */}
        <div className="flex h-[18px] items-center justify-center relative shrink-0 w-0">
          <div className="flex-none rotate-90">
            <div className="h-0 relative w-[18px]">
              <div className="absolute inset-[-1px_0_0_0]">
                <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 1">
                  <line stroke="#57B1FF" strokeOpacity="0.12" x2="18" y1="0.5" y2="0.5" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Action Icons */}
        <div className="content-stretch flex gap-[8px] items-center relative shrink-0" data-name="actions">
          <div className="content-stretch flex items-center justify-center p-[4px] relative rounded-[8px] shrink-0 size-[28px]" data-name="_header-icon-AI-trace">
            <div className="overflow-clip relative shrink-0 size-[24px]" data-name="Icons">
              <div className="-translate-x-1/2 -translate-y-1/2 absolute left-1/2 size-[16px] top-1/2" data-name="Container" />
              <div className="absolute bottom-[45.83%] left-1/4 right-[41.67%] top-[20.83%]" data-name="Vector">
                <div className="absolute inset-[-6.25%]">
                  <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 9 9">
                    <path d={svgPaths.p197af580} id="Vector" stroke="var(--stroke-0, #62707D)" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </div>
              <div className="absolute inset-[37.5%_16.67%_20.83%_41.67%]" data-name="Vector">
                <div className="absolute inset-[-5%]">
                  <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 11 11">
                    <path d={svgPaths.p2a697800} id="Vector" stroke="var(--stroke-0, #62707D)" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
          <div className="content-stretch flex items-center justify-center p-[4px] relative rounded-[8px] shrink-0 size-[28px]" data-name="_header-icon-activity-monitor">
            <div className="overflow-clip relative shrink-0 size-[24px]" data-name="Icons">
              <div className="-translate-x-1/2 -translate-y-1/2 absolute left-1/2 size-[13.333px] top-1/2" data-name="Container" />
              <div className="absolute inset-[20.83%]" data-name="Vector">
                <div className="absolute inset-[-3.57%]">
                  <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 15 15">
                    <path d={svgPaths.p34ec8600} id="Vector" stroke="var(--stroke-0, #62707D)" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
          <div className="content-stretch flex items-center justify-center p-[4px] relative rounded-[8px] shrink-0 size-[28px]" data-name="_header-icon-teammate">
            <div className="overflow-clip relative shrink-0 size-[24px]" data-name="Icons">
              <div className="-translate-x-1/2 -translate-y-1/2 absolute left-1/2 size-[16px] top-1/2" data-name="Container" />
              <div className="absolute inset-[27.08%_29.17%_29.17%_20.83%]">
                <div className="absolute inset-[-4.76%_-4.17%]">
                  <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13 11.5">
                    <path d={svgPaths.p1f1e6f00} id="Rectangle 2256" stroke="var(--stroke-0, #62707D)" strokeLinecap="round" />
                  </svg>
                </div>
              </div>
              <div className="absolute flex inset-[20.83%_56.25%_70.83%_43.75%] items-center justify-center">
                <div className="flex-none h-px rotate-90 w-[2px]">
                  <div className="relative size-full">
                    <div className="absolute inset-[-1px_0_0_0]">
                      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 2 1">
                        <line id="Line 119" stroke="var(--stroke-0, #62707D)" strokeLinecap="round" x1="0.5" x2="1.5" y1="0.5" y2="0.5" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute bottom-1/2 left-[33.33%] right-[41.67%] top-[41.67%]" data-name="Vector">
                <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 6 2">
                  <g id="Vector">
                    <path d={svgPaths.p39bde000} fill="var(--fill-0, #62707D)" />
                    <path d={svgPaths.p25258f70} fill="var(--fill-0, #62707D)" />
                  </g>
                </svg>
              </div>
              <div className="absolute inset-[58.33%_20.83%_20.83%_58.33%]" data-name="Vector">
                <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 5 5">
                  <path d={svgPaths.p2bdf8300} fill="var(--fill-0, #62707D)" id="Vector" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}