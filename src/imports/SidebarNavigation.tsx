import React from "react";
import svgPaths from "./svg-63n4fkkbae";
const img5 = "";
import { imgGroup } from "./svg-0cfqo";
import { useNavigate, useLocation } from "react-router";
import { getStoredExperience, EXPERIENCE_EVENT } from "../app/pages/ExperienceChooser";

/* ================================================================
   GLOBAL SIDEBAR NAVIGATION
   ================================================================
   
   This is the single reusable sidebar component for the entire platform.
   It persists across all pages and provides navigation to all modules.
   
   Architecture:
   - Width: 64px (fixed)
   - Position: Left edge, sticky top-0
   - Z-index: 50 (highest layer - tooltips always visible)
   - Persists: Across all route changes
   
   Navigation Items:
   ✓ Watch Center          ✓ Misconfigurations
   ✓ Control Center        ✓ Case Management
   ✓ Asset Register        ✓ Compliance
   ✓ Employees            ✓ Integrations
   ✓ Risk Register        ✓ Workflows
   ✓ Attack Paths         ✓ Module Configurations
   ✓ Vulnerabilities      ✓ Settings
                          ✓ Profile
   
   Icon States:
   1. Default       - Normal gray (#62707D)
   2. Hover         - Brightened (#DADFE3) with dark bg (#08121c)
   3. Active        - Bright (#E1F2FD) with gradient + border
   4. Active+Hover  - Active state with hover tooltip
   
   Tooltip Behavior:
   - Appears on hover at left: 40px (12px gap from icon)
   - Always renders above page content (z-50)
   - Never hidden by charts, dashboards, or page elements
   
   ================================================================ */

/* ================================================================
   NAV ITEM — wraps each icon with routing + active-state highlight
   ================================================================ */

function NavItem({ to, label, children }: { to: string; label: string; children: React.ReactNode }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const isActive = to === "/" ? pathname === "/" || pathname === "/subpage" : pathname.startsWith(to);

  return (
    <div
      onClick={() => navigate(to)}
      className="cursor-pointer group/nav relative flex items-center shrink-0"
    >
      {/* Icon container */}
      <div
        className={`content-stretch flex items-center justify-center p-[4px] relative rounded-[8px] shrink-0 size-[28px] transition-colors duration-150 ${
          isActive
            ? "bg-gradient-to-r from-[rgba(20,162,227,0.32)] to-[rgba(5,11,17,0)]"
            : "group-hover/nav:bg-[#08121c]"
        }`}
        style={{ '--stroke-0': isActive ? '#E1F2FD' : undefined } as React.CSSProperties}
      >
        {isActive && (
          <div aria-hidden="true" className="absolute border border-[rgba(20,162,227,0.48)] border-solid inset-0 pointer-events-none rounded-[8px]" />
        )}
        {/* On hover, override --stroke-0 to brighten icons */}
        <div
          className="contents"
          style={{ '--stroke-0': isActive ? '#E1F2FD' : '#62707D' } as React.CSSProperties}
        >
          <div className="contents group-hover/nav:[--stroke-0:#DADFE3]">
            {children}
          </div>
        </div>
      </div>
      {/* Tooltip — appears on hover */}
      <div className="absolute left-[40px] opacity-0 group-hover/nav:opacity-100 transition-opacity duration-150 z-50 pointer-events-none">
        <div className="bg-[#08121c] content-stretch flex items-center justify-center p-[8px] relative rounded-[8px] shrink-0">
          <div aria-hidden="true" className="absolute border border-[#1e2a34] border-solid inset-0 pointer-events-none rounded-[8px]" />
          <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[12px] text-white whitespace-nowrap">
            <p className="leading-none">{label}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================================================================
   SEPARATOR — thin horizontal line
   ================================================================ */

function Separator({ width = 28 }: { width?: number }) {
  return (
    <div className="h-0 relative shrink-0 w-full">
      <div className="absolute inset-[-1px_0_0_0]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox={`0 0 ${width} 1`}>
          <line stroke="#121E27" x2={String(width)} y1="0.5" y2="0.5" />
        </svg>
      </div>
    </div>
  );
}

/* ================================================================
   LOGO (Secure-Icon) — hexagonal shield
   ================================================================ */

function Group() {
  return (
    <div className="absolute inset-[5.93%_12.53%_14.98%_31.64%] mask-intersect mask-luminance mask-no-clip mask-no-repeat mask-position-[0px_40.391px] mask-size-[70.714px_86.696px]" data-name="Group" style={{ maskImage: `url('${imgGroup}')` }}>
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 17.8655 25.3094">
        <g id="Group">
          <path d={svgPaths.p2bf14c00} fill="url(#paint0_linear_sb_logo1)" id="Vector" />
          <path d={svgPaths.p129dd940} fill="url(#paint1_linear_sb_logo1)" id="Vector_2" />
        </g>
        <defs>
          <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_sb_logo1" x1="10.8553" x2="4.87441" y1="11.0695" y2="6.46964">
            <stop stopColor="#136C88" />
            <stop offset="1" stopColor="#117591" />
          </linearGradient>
          <linearGradient gradientUnits="userSpaceOnUse" id="paint1_linear_sb_logo1" x1="13.0214" x2="10.4385" y1="14.4341" y2="22.75">
            <stop stopColor="#002B43" />
            <stop offset="1" stopColor="#0A2135" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

function MaskGroup() {
  return (
    <div className="absolute contents inset-[27.19%_31.14%_27.19%_31.64%]" data-name="Mask group">
      <Group />
    </div>
  );
}

function LogoIcon() {
  return (
    <div className="absolute contents inset-[0_8.97%_0_9.47%]">
      <div className="absolute inset-[0_8.97%_66.44%_50.25%]" data-name="Vector">
        <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13.0498 10.7398">
          <path d={svgPaths.p53a1880} fill="url(#paint0_linear_sb_logo2)" id="Vector" />
          <defs>
            <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_sb_logo2" x1="-2.04717" x2="13.4867" y1="1.90491" y2="10.0183">
              <stop stopColor="#45C2D4" />
              <stop offset="0.24" stopColor="#33A6BD" />
              <stop offset="0.75" stopColor="#117191" />
              <stop offset="1" stopColor="#045D80" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      <div className="absolute inset-[64.88%_49.75%_0_9.47%]" data-name="Vector">
        <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13.0498 11.2386">
          <path d={svgPaths.p16590ac0} fill="url(#paint0_linear_sb_logo3)" id="Vector" />
          <defs>
            <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_sb_logo3" x1="17.9225" x2="4.10776" y1="11.4846" y2="2.92093">
              <stop stopColor="#091627" />
              <stop offset="1" stopColor="#08162A" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      <div className="absolute inset-[0_49.75%_26.71%_9.47%]" data-name="Vector">
        <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13.0498 23.4531">
          <path d={svgPaths.pcbf7561} fill="url(#paint0_linear_sb_logo4)" id="Vector" />
          <defs>
            <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_sb_logo4" x1="2.57614" x2="16.4194" y1="13.8967" y2="6.28382">
              <stop stopColor="#0B446C" />
              <stop offset="1" stopColor="#01719B" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      <div className="absolute inset-[26.71%_8.97%_0_50.25%]" data-name="Vector">
        <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13.0498 23.453">
          <path d={svgPaths.p2e24aa00} fill="url(#paint0_linear_sb_logo5)" id="Vector" />
          <defs>
            <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_sb_logo5" x1="9.42233" x2="0.358216" y1="10.2778" y2="19.4273">
              <stop stopColor="#061B30" />
              <stop offset="1" stopColor="#071D37" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      <div className="absolute inset-[11.28%_18.17%_11.28%_18.67%]" data-name="Vector">
        <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20.2106 24.7805">
          <path d={svgPaths.p3c62c700} fill="url(#paint0_linear_sb_logo6)" id="Vector" />
          <defs>
            <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_sb_logo6" x1="0" x2="20.2106" y1="12.3885" y2="12.3885">
              <stop stopColor="#05172C" />
              <stop offset="1" stopColor="#05172C" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      <div className="absolute inset-[11.28%_49.75%_31.97%_18.67%]" data-name="Vector">
        <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 10.1054 18.1602">
          <path d={svgPaths.p2d9ed280} fill="url(#paint0_linear_sb_logo7)" id="Vector" />
          <defs>
            <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_sb_logo7" x1="4.67353" x2="13.1669" y1="9.28514" y2="4.70031">
              <stop stopColor="#071F33" />
              <stop offset="1" stopColor="#0A1625" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      <div className="absolute inset-[31.97%_18.17%_11.28%_50.25%]" data-name="Vector">
        <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 10.1053 18.1602">
          <path d={svgPaths.pd681c00} fill="url(#paint0_radial_sb_logo8)" id="Vector" />
          <defs>
            <radialGradient cx="0" cy="0" gradientTransform="translate(11.8846 15.2945) scale(10.8887)" gradientUnits="userSpaceOnUse" id="paint0_radial_sb_logo8" r="1">
              <stop stopColor="#024667" />
              <stop offset="1" stopColor="#052437" />
            </radialGradient>
          </defs>
        </svg>
      </div>
      <div className="absolute inset-[26.71%_8.97%_26.71%_81.83%]" data-name="Vector">
        <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 2.94451 14.9062">
          <path d={svgPaths.p118bb980} fill="url(#paint0_linear_sb_logo9)" id="Vector" />
          <defs>
            <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_sb_logo9" x1="1.47149" x2="1.47149" y1="-0.261137" y2="12.5426">
              <stop stopColor="#0D3454" />
              <stop offset="1" stopColor="#052540" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      <div className="absolute inset-[26.71%_81.33%_26.71%_9.47%]" data-name="Vector">
        <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 2.94439 14.9062">
          <path d={svgPaths.p23456100} fill="url(#paint0_linear_sb_logo10)" id="Vector" />
          <defs>
            <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_sb_logo10" x1="1.47136" x2="1.47136" y1="0" y2="12.1793">
              <stop stopColor="#061D35" />
              <stop offset="1" stopColor="#061930" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      <div className="absolute inset-[31.97%_18.17%_31.97%_74.58%]" data-name="Vector">
        <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 2.32 11.5415">
          <path d={svgPaths.p3f32e740} fill="url(#paint0_linear_sb_logo11)" id="Vector" />
          <defs>
            <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_sb_logo11" x1="1.63049" x2="0.770022" y1="11.5031" y2="-0.194173">
              <stop stopColor="#081F34" />
              <stop offset="1" stopColor="#0A1620" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      <div className="absolute inset-[31.97%_74.07%_31.97%_18.67%]" data-name="Vector">
        <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 2.32003 11.5415">
          <path d={svgPaths.p189df880} fill="var(--fill-0, #002B44)" id="Vector" />
        </svg>
      </div>
      <div className="absolute inset-[27.19%_31.14%_27.19%_31.64%]" data-name="Vector">
        <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 11.9098 14.6014">
          <path d={svgPaths.p2be1e100} fill="url(#paint0_linear_sb_logo12)" id="Vector" />
          <defs>
            <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_sb_logo12" x1="6.93329" x2="0.706391" y1="6.54998" y2="11.3273">
              <stop stopColor="#082338" />
              <stop offset="1" stopColor="#072239" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      <MaskGroup />
      <div className="absolute inset-[63.89%_49.74%_11.28%_18.69%]" data-name="Vector">
        <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 10.1037 7.94442">
          <path d={svgPaths.p3326c600} fill="url(#paint0_linear_sb_logo13)" id="Vector" />
          <defs>
            <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_sb_logo13" x1="-4.86603" x2="8.39798" y1="6.09634" y2="3.55369">
              <stop stopColor="#005A7E" />
              <stop offset="1" stopColor="#002A41" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      <div className="absolute inset-[38.56%_54.83%_60.02%_43%]"><svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 0.692538 0.454891"><path d={svgPaths.p39a2af00} fill="var(--fill-0, #1EB2C2)" /></svg></div>
      <div className="absolute inset-[45.75%_34.64%_36.66%_58.86%]"><svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 2.08067 5.62934"><path d={svgPaths.pcdee200} fill="var(--fill-0, #085A71)" /></svg></div>
      <div className="absolute inset-[52.73%_37.06%_45.3%_61.67%]"><svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 0.408422 0.630594"><path d={svgPaths.p3478c500} fill="var(--fill-0, #085A71)" /></svg></div>
      <div className="absolute inset-[44.78%_34.22%_53.25%_64.51%]"><svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 0.40842 0.630608"><path d={svgPaths.p6651800} fill="var(--fill-0, #085A71)" /></svg></div>
      <div className="absolute inset-[62%_40.29%_36.03%_58.43%]"><svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 0.408422 0.628986"><path d={svgPaths.p3154c970} fill="var(--fill-0, #085A71)" /></svg></div>
      <div className="absolute inset-[47.44%_37.53%_32.78%_52.9%]"><svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 3.06493 6.33078"><path d={svgPaths.p14b1bd72} fill="var(--fill-0, #085A71)" /></svg></div>
      <div className="absolute inset-[46.63%_37.02%_51.4%_61.7%]"><svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 0.408422 0.630622"><path d={svgPaths.p20508600} fill="var(--fill-0, #085A71)" /></svg></div>
      <div className="absolute inset-[65.87%_46.14%_32.16%_52.59%]"><svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 0.408506 0.62895"><path d={svgPaths.p2b342a00} fill="var(--fill-0, #085A71)" /></svg></div>
      <div className="absolute inset-[58.98%_34.8%_37.85%_60.59%]"><svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 1.47673 1.01462"><path d={svgPaths.p12554500} fill="var(--fill-0, #085A71)" /></svg></div>
      <div className="absolute inset-[58.34%_34.58%_39.68%_64.15%]"><svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 0.408422 0.632248"><path d={svgPaths.p208d5980} fill="var(--fill-0, #085A71)" /></svg></div>
      <div className="absolute inset-[45.75%_58.72%_36.66%_34.77%]"><svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 2.08232 5.62934"><path d={svgPaths.p1de252f1} fill="var(--fill-0, #0C5B6F)" /></svg></div>
      <div className="absolute inset-[52.73%_61.53%_45.3%_37.19%]"><svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 0.408438 0.630594"><path d={svgPaths.p26afe220} fill="var(--fill-0, #0C5B6F)" /></svg></div>
      <div className="absolute inset-[44.78%_64.37%_53.25%_34.35%]"><svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 0.408438 0.630608"><path d={svgPaths.p219190f0} fill="var(--fill-0, #0C5B6F)" /></svg></div>
      <div className="absolute inset-[62%_58.29%_36.03%_40.43%]"><svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 0.40842 0.628986"><path d={svgPaths.p352b0180} fill="var(--fill-0, #0C5B6F)" /></svg></div>
      <div className="absolute inset-[47.44%_52.76%_32.81%_37.66%]"><svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 3.06491 6.32067"><path d={svgPaths.p3d89fd00} fill="var(--fill-0, #0C5B6F)" /></svg></div>
      <div className="absolute inset-[46.63%_61.57%_51.4%_37.15%]"><svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 0.408438 0.63061"><path d={svgPaths.p198d9d00} fill="var(--fill-0, #0C5B6F)" /></svg></div>
      <div className="absolute inset-[65.84%_52.45%_32.19%_46.27%]"><svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 0.408438 0.628951"><path d={svgPaths.p20ed9c80} fill="var(--fill-0, #0C5B6F)" /></svg></div>
      <div className="absolute inset-[58.98%_60.46%_37.85%_34.93%]"><svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 1.47587 1.01419"><path d={svgPaths.p3de0dc80} fill="var(--fill-0, #0C5B6F)" /></svg></div>
      <div className="absolute inset-[58.34%_64.01%_39.68%_34.71%]"><svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 0.408438 0.632248"><path d={svgPaths.p1208d500} fill="var(--fill-0, #0C5B6F)" /></svg></div>
      <div className="absolute inset-[39.56%_36.87%_59.02%_60.97%]"><svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 0.692582 0.454891"><path d={svgPaths.p3d389f00} fill="var(--fill-0, #1EB2C2)" /></svg></div>
      <div className="absolute inset-[36.59%_44.36%_61.99%_53.47%]"><svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 0.692498 0.454893"><path d={svgPaths.peb95000} fill="var(--fill-0, #1EB2C2)" /></svg></div>
      <div className="absolute inset-[29.19%_46.34%_62.64%_38.57%]"><svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 4.8309 2.61464"><path d={svgPaths.pd9a8180} fill="var(--fill-0, #1EB2C2)" /></svg></div>
      <div className="absolute inset-[37.08%_45.21%_58.11%_44.07%]"><svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 3.43153 1.53999"><path d={svgPaths.p22710180} fill="var(--fill-0, #1EB2C2)" /></svg></div>
      <div className="absolute inset-[40.19%_37.82%_50.95%_46.05%]"><svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 5.15891 2.83392"><path d={svgPaths.p2276be00} fill="var(--fill-0, #1EB2C2)" /></svg></div>
      <div className="absolute inset-[36.52%_60.07%_62.06%_37.76%]"><svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 0.692536 0.454898"><path d={svgPaths.p226e800} fill="var(--fill-0, #1EB2C2)" /></svg></div>
      <div className="absolute inset-[11.26%_18.16%_11.26%_18.53%]">
        <div className="absolute inset-[-0.35%_-0.36%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20.404 24.9704">
            <path d={svgPaths.p13c56700} stroke="#0789B2" strokeMiterlimit="10" strokeWidth="0.146526" />
          </svg>
        </div>
      </div>
      <div className="absolute inset-[39.18%_31.14%_27.19%_31.64%]">
        <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 11.9098 10.7615">
          <path d={svgPaths.pe17a630} fill="url(#paint0_radial_sb_logo14)" />
          <defs>
            <radialGradient cx="0" cy="0" gradientTransform="translate(5.98254 3.72276) scale(3.30931)" gradientUnits="userSpaceOnUse" id="paint0_radial_sb_logo14" r="1">
              <stop stopColor="#6FCBDC" />
              <stop offset="1" stopColor="#34BFCB" />
            </radialGradient>
          </defs>
        </svg>
      </div>
      <div className="absolute inset-[0_8.97%_0_9.47%] mix-blend-soft-light">
        <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 26.0995 32">
          <path d={svgPaths.p399b2c80} fill="url(#paint0_linear_sb_logo15)" style={{ mixBlendMode: "soft-light" }} />
          <defs>
            <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_sb_logo15" x1="1.21859" x2="23.0614" y1="9.89945" y2="21.1614">
              <stop stopColor="#45C2D4" />
              <stop offset="0.24" stopColor="#33A6BD" />
              <stop offset="0.75" stopColor="#117191" />
              <stop offset="1" stopColor="#045D80" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </div>
  );
}

function LogoFrame() {
  return (
    <div className="content-stretch flex flex-col gap-[24px] items-start relative shrink-0 w-full">
      <div className="overflow-clip relative shrink-0 size-[32px]" data-name="Secure-Icon">
        <LogoIcon />
        <div className="absolute inset-[47.37%_45.79%_45.26%_46.84%]">
          <div className="absolute inset-[-85.71%]">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 6.4 6.4">
              <g filter="url(#filter0_f_sb_logo)" id="Ellipse 1">
                <circle cx="3.2" cy="3.2" fill="var(--fill-0, #FFF200)" r="1.17895" />
              </g>
              <defs>
                <filter colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse" height="6.4" id="filter0_f_sb_logo" width="6.4" x="0" y="0">
                  <feFlood floodOpacity="0" result="BackgroundImageFix" />
                  <feBlend in="SourceGraphic" in2="BackgroundImageFix" mode="normal" result="shape" />
                  <feGaussianBlur result="effect1_foregroundBlur" stdDeviation="1.01053" />
                </filter>
              </defs>
            </svg>
          </div>
        </div>
      </div>
      <Separator width={32} />
    </div>
  );
}

/* ================================================================
   ICON COMPONENTS — from new Figma design (svg-63n4fkkbae)
   ================================================================ */

function IconWatchCenter() {
  return (
    <div className="relative shrink-0 size-[24px]">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g>
          <path d={svgPaths.pe51da00} stroke="var(--stroke-0, #62707D)" strokeLinecap="round" strokeLinejoin="round" />
          <path d={svgPaths.p3ed77700} stroke="var(--stroke-0, #62707D)" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      </svg>
    </div>
  );
}

function IconControlCenter() {
  return (
    <div className="relative shrink-0 size-[24px]">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <path d={svgPaths.p315c5a00} stroke="var(--stroke-0, #62707D)" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

function IconAssetRegister() {
  return (
    <div className="relative shrink-0 size-[24px]">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <path d={svgPaths.p237377f2} stroke="var(--stroke-0, #62707D)" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

function IconEmployees() {
  return (
    <div className="relative shrink-0 size-[24px]">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <path d={svgPaths.p38624500} stroke="var(--stroke-0, #62707D)" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

function IconRiskRegister() {
  return (
    <div className="relative shrink-0 size-[24px]">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <path d={svgPaths.p2724ee00} stroke="var(--stroke-0, #62707D)" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

function IconAttackPaths() {
  return (
    <div className="relative shrink-0 size-[24px]">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <path d={svgPaths.p1323a480} stroke="var(--stroke-0, #62707D)" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

function IconVulnerabilities() {
  return (
    <div className="relative shrink-0 size-[24px]">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <path d={svgPaths.p11cefa00} stroke="var(--stroke-0, #62707D)" strokeLinecap="round" strokeLinejoin="round" />
        <path d={svgPaths.p18db2400} stroke="var(--stroke-0, #62707D)" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

function IconMisconfigurations() {
  return (
    <div className="relative shrink-0 size-[24px]">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <path d={svgPaths.p1efffd00} stroke="var(--stroke-0, #62707D)" strokeLinecap="round" strokeLinejoin="round" />
        <path d={svgPaths.p3ed77700} stroke="var(--stroke-0, #62707D)" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M17 13V16.1111" stroke="var(--stroke-0, #62707D)" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M17 18V18.7778" stroke="var(--stroke-0, #62707D)" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

function IconCaseManagement() {
  return (
    <div className="relative shrink-0 size-[24px]">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <path d="M5 7H9" stroke="var(--stroke-0, #62707D)" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M5 10H7" stroke="var(--stroke-0, #62707D)" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M5 13H6" stroke="var(--stroke-0, #62707D)" strokeLinecap="round" strokeLinejoin="round" />
        <path d={svgPaths.p31d9b500} stroke="var(--stroke-0, #62707D)" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

function IconCompliance() {
  return (
    <div className="relative shrink-0 size-[24px]">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <path d={svgPaths.pf115a00} stroke="var(--stroke-0, #62707D)" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

function IconIntegrations() {
  return (
    <div className="relative shrink-0 size-[24px]">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <path d={svgPaths.p7b29c00} stroke="var(--stroke-0, #62707D)" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

function IconWorkflows() {
  return (
    <div className="relative shrink-0 size-[24px]">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <path d={svgPaths.p114a8f70} stroke="var(--stroke-0, #62707D)" strokeLinecap="round" strokeLinejoin="round" />
        <g>
          <mask fill="white" id="path-2-inside-sb-workflows">
            <path d={svgPaths.pca5b980} />
            <path d={svgPaths.p3b7ecf80} />
            <path d={svgPaths.p1f262100} />
            <path d={svgPaths.p3f212600} />
          </mask>
          <path d={svgPaths.p11519240} fill="var(--stroke-0, #62707D)" mask="url(#path-2-inside-sb-workflows)" />
        </g>
      </svg>
    </div>
  );
}

function IconModuleConfig() {
  return (
    <div className="overflow-clip relative shrink-0 size-[24px]">
      <div className="-translate-x-1/2 -translate-y-1/2 absolute left-1/2 size-[13.333px] top-1/2" />
      <div className="absolute inset-1/4">
        <div className="absolute inset-[-4.17%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13 13">
            <path d={svgPaths.p74b0500} stroke="var(--stroke-0, #62707D)" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function IconSettings() {
  return (
    <div className="overflow-clip relative shrink-0 size-[24px]">
      <div className="-translate-x-1/2 -translate-y-1/2 absolute left-1/2 size-[16px] top-1/2" />
      <div className="absolute inset-[20.83%]">
        <div className="absolute inset-[-3.57%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 15 15">
            <g>
              <path d={svgPaths.p308d5100} stroke="var(--stroke-0, #62707D)" strokeLinecap="round" strokeLinejoin="round" />
              <path d={svgPaths.p19bcd240} stroke="var(--stroke-0, #62707D)" strokeLinecap="round" strokeLinejoin="round" />
            </g>
          </svg>
        </div>
      </div>
    </div>
  );
}

/* ================================================================
   TOP ITEMS — navigation icons with grouping & separators
   ================================================================ */

function TopItems() {
  const [isAli, setIsAli] = React.useState(() => getStoredExperience() === "ali");

  React.useEffect(() => {
    const handler = (e: Event) => setIsAli((e as CustomEvent).detail === "ali");
    window.addEventListener(EXPERIENCE_EVENT, handler);
    return () => window.removeEventListener(EXPERIENCE_EVENT, handler);
  }, []);
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-start relative shrink-0" data-name="Top items">
      {/* Watch Center */}
      <NavItem to="/" label="Watch Center">
        <IconWatchCenter />
      </NavItem>
      <Separator />
      {/* Control Center */}
      <NavItem to="/control-center" label="Control Center">
        <IconControlCenter />
      </NavItem>
      <Separator />
      {/* Asset Register */}
      <NavItem to="/asset-register" label="Assets">
        <IconAssetRegister />
      </NavItem>
      <Separator />
      {/* Employees */}
      <NavItem to="/employees" label="Employees">
        <IconEmployees />
      </NavItem>
      <Separator />
      {/* Risk Register */}
      <NavItem to="/risk-register" label="Risk Register">
        <IconRiskRegister />
      </NavItem>
      {/* Attack Paths */}
      <NavItem to="/attack-paths" label="Attack Path">
        <IconAttackPaths />
      </NavItem>
      {/* Vulnerabilities */}
      <NavItem to="/vulnerabilities" label="Vulnerabilities">
        <IconVulnerabilities />
      </NavItem>
      {/* Misconfigurations */}
      <NavItem to="/misconfigurations" label="Misconfigurations">
        <IconMisconfigurations />
      </NavItem>
      <Separator />
      {/* Case Management */}
      <NavItem to="/case-management" label="Case Management">
        <IconCaseManagement />
      </NavItem>
      {/* Compliance */}
      <div className="relative">
        <NavItem to="/compliance" label="Compliance">
          <IconCompliance />
        </NavItem>
        {isAli && (
          <span
            className="absolute top-[2px] right-[2px] size-[5px] rounded-full pointer-events-none"
            style={{ backgroundColor: "#2FD897", boxShadow: "0 0 4px #2FD897" }}
          />
        )}
      </div>
      <Separator />
      {/* Integrations */}
      <NavItem to="/integrations" label="Integrations">
        <IconIntegrations />
      </NavItem>
      {/* Workflows */}
      <NavItem to="/workflows" label="Workflows">
        <IconWorkflows />
      </NavItem>
    </div>
  );
}

function TopContainer() {
  return (
    <div className="content-stretch flex flex-col gap-[15px] items-center relative shrink-0 w-full" data-name="Top Container">
      <LogoFrame />
      <TopItems />
    </div>
  );
}

/* ================================================================
   BOTTOM CONTAINER — module config, settings, profile avatar
   ================================================================ */

function BottomContainer() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-center relative shrink-0 w-full" data-name="Bottom Container">
      {/* Module Configuration (non-routable) */}
      <div className="cursor-pointer group/nav relative flex items-center shrink-0">
        <div className="content-stretch flex items-center justify-center p-[4px] relative rounded-[8px] shrink-0 size-[28px] transition-colors duration-150 group-hover/nav:bg-[#08121c]">
          <div
            className="contents"
            style={{ '--stroke-0': '#62707D' } as React.CSSProperties}
          >
            <div className="contents group-hover/nav:[--stroke-0:#DADFE3]">
              <IconModuleConfig />
            </div>
          </div>
        </div>
        {/* Tooltip */}
        <div className="absolute left-[40px] opacity-0 group-hover/nav:opacity-100 transition-opacity duration-150 z-50 pointer-events-none">
          <div className="bg-[#08121c] content-stretch flex items-center justify-center p-[8px] relative rounded-[8px] shrink-0">
            <div aria-hidden="true" className="absolute border border-[#1e2a34] border-solid inset-0 pointer-events-none rounded-[8px]" />
            <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[12px] text-white whitespace-nowrap">
              <p className="leading-none">Module Configurations</p>
            </div>
          </div>
        </div>
      </div>
      {/* Settings */}
      <NavItem to="/settings" label="Settings">
        <IconSettings />
      </NavItem>
      {/* Profile Avatar */}
      <div className="cursor-pointer group/nav relative flex items-center shrink-0">
        <div className="content-stretch flex items-center justify-center p-[4px] relative rounded-[8px] shrink-0 size-[28px]">
          <div className="relative rounded-[24px] shrink-0 size-[24px]">
            <div className="overflow-clip relative rounded-[inherit] size-full">
              <div className="absolute inset-[0_-1.56%_-2.81%_-1.25%]">
                <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={img5} />
              </div>
            </div>
            {/* Blue accent border on hover */}
            <div aria-hidden="true" className="absolute border border-transparent group-hover/nav:border-[#14a2e3] border-solid inset-0 pointer-events-none rounded-[24px] transition-colors duration-150" />
          </div>
        </div>
        {/* Tooltip */}
        <div className="absolute left-[40px] opacity-0 group-hover/nav:opacity-100 transition-opacity duration-150 z-50 pointer-events-none">
          <div className="bg-[#08121c] content-stretch flex items-center justify-center p-[8px] relative rounded-[8px] shrink-0">
            <div aria-hidden="true" className="absolute border border-[#1e2a34] border-solid inset-0 pointer-events-none rounded-[8px]" />
            <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[12px] text-white whitespace-nowrap">
              <p className="leading-none">Profile</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================================================================
   MAIN EXPORT
   ================================================================ */

export default function SidebarNavigation() {
  return (
    <div className="bg-[#030609] content-stretch flex flex-col items-center justify-between p-[16px] relative size-full" data-name="SidebarNavigation">
      <div aria-hidden="true" className="absolute border-[#0E1C26] border-r border-solid inset-0 pointer-events-none" />
      <TopContainer />
      <BottomContainer />
    </div>
  );
}