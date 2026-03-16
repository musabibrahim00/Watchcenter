import React, { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { CheckCircle2, ChevronRight } from "lucide-react";

export interface Mission {
  id: string;
  title: string;
  autoExecuted: boolean;
  timestamp: string;
  executed: string[];
  outcome: string;
}

function DoneItemRow({
  mission,
  index,
  isDetailOpen,
  onToggleDetail,
}: {
  mission: Mission;
  index: number;
  isDetailOpen: boolean;
  onToggleDetail: (id: string) => void;
}) {
  const resolutionText = mission.autoExecuted
    ? "Auto-resolved under policy"
    : "Approved by you";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 0.9 }}
      exit={{ opacity: 0 }}
      transition={{
        duration: 0.25,
        ease: "easeOut",
        delay: index * 0.05,
      }}
    >
      {/* Main row */}
      <button
        onClick={() => onToggleDetail(mission.id)}
        className={`w-full flex items-start gap-3 px-4 py-3 bg-[#071019] border border-[#141e28] hover:bg-[#081420] transition-colors duration-200 cursor-pointer group text-left ${
          isDetailOpen ? "rounded-t-lg" : "rounded-lg"
        }`}
      >
        <CheckCircle2
          size={14}
          className="text-[#00A46E] shrink-0 mt-0.5"
        />
        <div className="flex-1 min-w-0">
          <span className="font-['Inter',sans-serif] text-[13px] text-[#dadfe3] font-medium block truncate">
            {mission.title}
          </span>
          <span className="font-['Inter',sans-serif] text-[11px] text-[#4a5568] block mt-0.5">
            {resolutionText}
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="font-['Inter',sans-serif] text-[11px] text-[#4a5568]">
            {mission.timestamp}
          </span>
          <motion.div
            animate={{ rotate: isDetailOpen ? 90 : 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="text-[#2c3c47] group-hover:text-[#4a5568] transition-colors duration-200"
          >
            <ChevronRight size={12} />
          </motion.div>
        </div>
      </button>

      {/* Micro detail expansion */}
      <AnimatePresence initial={false}>
        {isDetailOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="px-4 py-3 bg-[#060d16] border border-[#141e28] border-t-0 rounded-b-lg font-['Inter',sans-serif]">
              {mission.executed.length > 0 && (
                <div className="mb-2.5">
                  <span className="text-[10px] text-[#4a5568] uppercase tracking-wider font-medium">
                    What was done
                  </span>
                  <div className="flex flex-col gap-1 mt-1.5">
                    {mission.executed.map((e, i) => (
                      <div key={i} className="flex items-start gap-1.5">
                        <CheckCircle2
                          size={10}
                          className="text-[#1e6e4e] mt-[3px] shrink-0"
                        />
                        <span className="text-[11px] text-[#62707D] leading-[15px]">
                          {e}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {mission.outcome && (
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-[10px] text-[#4a5568] uppercase tracking-wider font-medium shrink-0">
                    Result
                  </span>
                  <span className="text-[11px] text-[#89949e]">
                    {mission.outcome}
                  </span>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function DoneTodaySection({
  missions,
  isOpen,
  onToggle,
}: {
  missions: Mission[];
  isOpen: boolean;
  onToggle: () => void;
}) {
  const [expandedDetailId, setExpandedDetailId] = useState<string | null>(null);

  const manualCount = missions.filter((m) => !m.autoExecuted).length;
  const autoCount = missions.filter((m) => m.autoExecuted).length;

  const summaryParts: string[] = [];
  summaryParts.push(
    `${missions.length} item${missions.length !== 1 ? "s" : ""} resolved`
  );
  if (manualCount > 0)
    summaryParts.push(
      `${manualCount} manual approval${manualCount !== 1 ? "s" : ""}`
    );
  if (autoCount > 0) summaryParts.push(`${autoCount} auto-resolved`);
  const summaryText =
    missions.length === 0
      ? "No items resolved yet."
      : summaryParts.join(" \u00B7 ");

  const toggleDetail = useCallback((id: string) => {
    setExpandedDetailId((prev) => (prev === id ? null : id));
  }, []);

  // Collapse detail rows when section collapses
  useEffect(() => {
    if (!isOpen) setExpandedDetailId(null);
  }, [isOpen]);

  return (
    <div className="flex flex-col mt-3">
      {/* Header row - removed */}

      {/* Collapsed summary line - removed */}

      {/* Expanded list */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="flex flex-col gap-1.5 pt-2 pl-1">
              {missions.length > 0 ? (
                missions.map((m, i) => (
                  <DoneItemRow
                    key={m.id}
                    mission={m}
                    index={i}
                    isDetailOpen={expandedDetailId === m.id}
                    onToggleDetail={toggleDetail}
                  />
                ))
              ) : (
                <div className="px-4 py-6 text-center">
                  <span className="font-['Inter',sans-serif] text-[13px] text-[#3d4d5a]">
                    Completed items will appear here.
                  </span>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}