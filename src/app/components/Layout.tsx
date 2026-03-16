import { Outlet } from "react-router";
import { useState, useEffect } from "react";
import SidebarNavigation from "../../imports/SidebarNavigation";
import Header from "../../imports/Header";
import { AiBoxProvider, useAiBox } from "../features/ai-box";
import { colors } from "../shared/design-system/tokens";
import { CommandPalette } from "./CommandPalette";
import { TimeTravelProvider, useTimeTravel } from "../shared/contexts/TimeTravelContext";
import { Clock, X, Download } from "lucide-react";
import { GlobalAIBox } from "./GlobalAIBox";

/**
 * Global Application Layout Architecture
 * =======================================
 * 
 * This component defines the root application shell for the entire platform.
 * All pages and modules render within this layout structure.
 * 
 * Layout Structure:
 * ┌──────────────────────────────────────────────────┐
 * │  Sidebar (z-50)    │  Header (z-40)              │
 * │  Navigation        │─────────────────────────────│
 * │                    │  [Time Travel Banner]       │
 * │  [64px fixed]      │  Main Content Canvas (z-0)  │
 * │                    │  • Watch Center             │
 * │                    │  • Control Center           │
 * │                    │  • Asset Register           │
 * │                    │  • Attack Path              │
 * │                    │  • Risk Register            │
 * │                    │  • etc.                     │
 * │                    │                             │
 * └──────────────────────────────────────────────────┘
 * 
 * Layer Priority (z-index):
 * - Sidebar Navigation:  z-[50]  (highest - tooltips always visible)
 * - Top Header:          z-[40]  (second - sticky header)
 * - Main Content:        z-[0]   (base layer)
 * 
 * Features:
 * - Persistent sidebar across all routes
 * - Sticky header with page context
 * - Scrollable main content area
 * - Global Time Travel mode (read-only historical view)
 * - Proper overflow handling (content never clips sidebar)
 * - Sidebar tooltips always render above page content
 */

function TimeTravelBanner() {
  const { isActive, formattedDate, deactivate, date } = useTimeTravel();

  if (!isActive) return null;

  const handleExportSnapshot = () => {
    const data = JSON.stringify(
      { date, timestamp: new Date().toISOString(), mode: "time-travel-snapshot", note: "Platform-wide historical state export" },
      null,
      2
    );
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `platform-snapshot-${date}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      className="px-[24px] py-[10px] flex items-center justify-between shrink-0"
      style={{ backgroundColor: `${colors.medium}08`, borderBottom: `1px solid ${colors.medium}20` }}
    >
      <div className="flex items-center gap-[10px]">
        <Clock size={14} color={colors.medium} strokeWidth={2} />
        <span className="text-[12px]" style={{ color: colors.medium, fontWeight: 600 }}>
          Time Travel Mode
        </span>
        <span className="text-[11px]" style={{ color: colors.textMuted }}>
          Viewing system state from {formattedDate}
        </span>
        <span
          className="text-[9px] uppercase tracking-[0.06em] px-[6px] py-[2px] rounded-[4px]"
          style={{ backgroundColor: `${colors.medium}12`, color: colors.medium, fontWeight: 600 }}
        >
          Read-only
        </span>
      </div>
      <div className="flex items-center gap-[8px]">
        <button
          className="flex items-center gap-[5px] rounded-[6px] px-[10px] py-[5px] text-[10px] transition-colors cursor-pointer"
          style={{ backgroundColor: "transparent", border: `1px solid ${colors.medium}30`, color: colors.medium, fontWeight: 500 }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = `${colors.medium}08`; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
          onClick={handleExportSnapshot}
        >
          <Download size={10} strokeWidth={2} />Export Snapshot
        </button>
        <button
          onClick={deactivate}
          className="flex items-center gap-[5px] rounded-[6px] px-[10px] py-[5px] text-[10px] transition-colors cursor-pointer"
          style={{ backgroundColor: `${colors.medium}12`, color: colors.medium, fontWeight: 600 }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = `${colors.medium}20`; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = `${colors.medium}12`; }}
        >
          <X size={10} strokeWidth={2} />Exit Time Travel
        </button>
      </div>
    </div>
  );
}

function LayoutInner() {
  const { isOpen: isAiBoxOpen } = useAiBox();

  return (
    <div className="flex h-screen w-full overflow-hidden" style={{ backgroundColor: colors.bgApp }} data-name="WatchDST">
      {/* Sidebar Navigation - Highest layer (z-50) */}
      <div className="w-[64px] shrink-0 h-screen sticky top-0 z-[50]">
        <SidebarNavigation />
      </div>

      {/* Main application area */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Top Header - Second layer (z-40) */}
        <div className="h-[72px] shrink-0 w-full sticky top-0 z-[40]">
          <Header />
        </div>

        {/* Global Time Travel Banner */}
        <TimeTravelBanner />

        {/* Content + AIBox row */}
        <div className="flex flex-1 min-h-0 overflow-hidden">
          {/* Main Content Canvas - Base layer (z-0) */}
          <div className="flex-1 min-w-0 overflow-auto relative">
            <Outlet />
          </div>

          {/* GlobalAIBox - Right sidebar (inline, not fixed) */}
          {isAiBoxOpen && (
            <div className="shrink-0 h-full p-[24px]" style={{ width: "clamp(308px, calc(20vw + 48px), 348px)" }}>
              <GlobalAIBox />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Layout() {
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  // Global keyboard shortcut: Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsCommandPaletteOpen(true);
      }
      if (e.key === "Escape") {
        setIsCommandPaletteOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <TimeTravelProvider>
      <AiBoxProvider>
        <LayoutInner />
        <CommandPalette
          isOpen={isCommandPaletteOpen}
          onClose={() => setIsCommandPaletteOpen(false)}
        />
      </AiBoxProvider>
    </TimeTravelProvider>
  );
}