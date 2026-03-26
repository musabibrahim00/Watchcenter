import React from "react";

// ── Priority signals (top 3 highest-value signals for compact view) ────────
const PRIORITY_SIGNALS: Array<{ type: "critical" | "warning" | "good" | "info"; badge: string; text: string }> = [
  { type: "critical", badge: "CRIT", text: "Lateral movement confirmed to finance-db-01 — domain credentials at risk" },
  { type: "warning", badge: "HIGH", text: "3 crown jewel assets exposed to internet with no active mitigation" },
  { type: "warning", badge: "HIGH", text: "TLS cert expiry <72h on prod-lb-01/02 — service disruption risk" },
];

const SIGNAL_COLORS: Record<string, string> = {
  critical: "#FF5757",
  warning: "#F05B06",
  info: "#57b1ff",
  good: "#00A46E",
};

// Animated counter hook for number values
function useAnimatedValue(target: number, duration = 1200) {
  const [value, setValue] = React.useState(0);
  React.useEffect(() => {
    const start = performance.now();
    let raf: number;
    function tick(now: number) {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3); // ease-out cubic
      setValue(Math.round(eased * target));
      if (t < 1) raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return value;
}

interface MetricDef {
  label: string;
  value: number;
  formatted?: string;
  suffix?: string;
  trend?: { value: string; up: boolean };
  accent?: string;
}

const METRICS: MetricDef[] = [
  { label: "Alerts Processed Today", value: 14728, accent: "#0781C2", trend: { value: "12%", up: true } },
  { label: "Attack Paths Identified", value: 47, accent: "#FF5757" },
  { label: "Cases Generated", value: 186, accent: "#00A46E", trend: { value: "15%", up: true } },
  { label: "Analyst Hours Saved", value: 312, suffix: "hrs", accent: "#00A46E" },
];

function TrendBadge({ value, up }: { value: string; up: boolean }) {
  const color = up ? "#00A46E" : "#FF5757";
  return (
    <span className="flex items-center gap-[2px] ml-[6px]" style={{ color }}>
      <svg width="8" height="8" viewBox="0 0 8 8" fill="none" style={{ transform: up ? "none" : "rotate(180deg)" }}>
        <path d="M4 1L7 5H1L4 1Z" fill={color} />
      </svg>
      <span className="text-[10px] font-['Inter:Medium',sans-serif]">{value}</span>
    </span>
  );
}

function MetricRow({ metric, index }: { metric: MetricDef; index: number }) {
  const animVal = useAnimatedValue(metric.value, 1400 + index * 150);
  const displayVal = metric.formatted ?? animVal.toLocaleString();

  return (
    <div
      className="flex items-center justify-between py-[2px] group"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <div className="flex items-center gap-[6px] min-w-0">
        <span
          className="block size-[4px] rounded-full shrink-0"
          style={{ backgroundColor: metric.accent ?? "#0781C2", boxShadow: `0 0 4px ${metric.accent ?? "#0781C2"}44` }}
        />
        <span className="text-[10px] text-[#89949e] font-['Inter:Regular',sans-serif] truncate leading-[1]">
          {metric.label}
        </span>
      </div>
      <div className="flex items-center shrink-0 ml-[8px]">
        <span className="text-[10px] text-white font-['Inter:Semi_Bold',sans-serif] tabular-nums leading-[1] tracking-[-0.3px]">
          {displayVal}{metric.suffix ?? ""}
        </span>
        {metric.trend && <TrendBadge value={metric.trend.value} up={metric.trend.up} />}
      </div>
    </div>
  );
}

function Separator() {
  return (
    <div className="h-0 relative shrink-0 w-full">
      <div className="absolute inset-[-0.5px_0]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 326 1">
          <path d="M0 0.5H326" stroke="#121E27" />
        </svg>
      </div>
    </div>
  );
}

function HeroStat() {
  const mttd = useAnimatedValue(36, 1200);
  return (
    <div className="flex items-center gap-[8px] w-full">
      <div className="flex items-baseline gap-[3px]">
        <span className="text-[8px] text-[#4a5f72] font-['Inter:Semi_Bold',sans-serif] uppercase tracking-[0.4px] leading-[1]">MTTD</span>
        <span className="text-[11px] text-white font-['Inter:Semi_Bold',sans-serif] tracking-[-0.3px] leading-[1] ml-[2px]">{(mttd / 10).toFixed(1)}</span>
        <span className="text-[9px] text-[#89949e] font-['Inter:Regular',sans-serif] leading-[1]">h</span>
      </div>
      <span className="text-[#2e4a63] leading-[1] text-[10px]">·</span>
      <div className="flex items-baseline gap-[3px]">
        <span className="text-[8px] text-[#4a5f72] font-['Inter:Semi_Bold',sans-serif] uppercase tracking-[0.4px] leading-[1]">MTTR</span>
        <span className="text-[11px] text-white font-['Inter:Semi_Bold',sans-serif] tracking-[-0.3px] leading-[1] ml-[2px]">1.2</span>
        <span className="text-[9px] text-[#89949e] font-['Inter:Regular',sans-serif] leading-[1]">h</span>
      </div>
      <span className="text-[#2e4a63] leading-[1] text-[10px]">·</span>
      <div className="flex items-baseline gap-[3px]">
        <span className="text-[8px] text-[#4a5f72] font-['Inter:Semi_Bold',sans-serif] uppercase tracking-[0.4px] leading-[1]">SLA</span>
        <span className="text-[11px] text-[#00A46E] font-['Inter:Semi_Bold',sans-serif] tracking-[-0.3px] leading-[1] ml-[2px]">98.7</span>
        <span className="text-[9px] text-[#89949e] font-['Inter:Regular',sans-serif] leading-[1]">%</span>
      </div>
    </div>
  );
}

function WhatMattersNow() {
  return (
    <div className="flex flex-col gap-[5px] w-full">
      <div className="flex items-center justify-between w-full">
        <span className="text-[9px] text-[#5a7280] font-['Inter:Semi_Bold',sans-serif] uppercase tracking-[0.6px] leading-[1]">
          Situation now
        </span>
        <span className="text-[8px] text-[#5a7088] font-['Inter:Regular',sans-serif] leading-[1]">
          click any signal to ask
        </span>
      </div>
      <div className="flex flex-col gap-[4px] w-full">
        {PRIORITY_SIGNALS.map((sig, i) => (
          <div
            key={i}
            className="flex items-start gap-[5px] group cursor-pointer rounded-[4px] px-[4px] py-[3px] -mx-[4px] transition-colors"
            style={{ background: "transparent" }}
            onMouseEnter={e => (e.currentTarget.style.background = sig.type === "critical" ? "rgba(255,87,87,0.06)" : "rgba(240,91,6,0.06)")}
            onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
            onClick={() => window.dispatchEvent(new CustomEvent("aibox-inject-query", { detail: { query: sig.text } }))}
          >
            <span
              className="text-[8px] font-['Inter:Semi_Bold',sans-serif] leading-[1] shrink-0 mt-[1.5px] rounded-[2px] px-[3px] py-[1px]"
              style={{
                color: SIGNAL_COLORS[sig.type],
                backgroundColor: `${SIGNAL_COLORS[sig.type]}18`,
                letterSpacing: "0.3px",
              }}
            >
              {sig.badge}
            </span>
            <span className="text-[10px] font-['Inter:Regular',sans-serif] leading-[1.35] flex-1" style={{ color: sig.type === "critical" ? "#e8a0a0" : sig.type === "warning" ? "#d4906a" : sig.type === "good" ? "#7ecfae" : "#7ea9cc" }}>
              {sig.text}
            </span>
            <span className="text-[8px] font-['Inter:Medium',sans-serif] text-[#57b1ff] opacity-[0.40] group-hover:opacity-100 transition-opacity shrink-0 self-center leading-[1]">
              →
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function KpiWidget() {
  const standardMetrics = METRICS.filter(m => m.label !== "Automation Rate");

  return (
    <div
      className="bg-[#050B11] flex flex-col relative rounded-[12px] w-full h-full overflow-hidden"
      data-name="KPIWidget"
    >
      <div
        aria-hidden="true"
        className="absolute border border-[#122C4A] border-solid inset-0 pointer-events-none rounded-[12px] z-[1]"
      />

      {/* Fixed header — never scrolls */}
      <div className="flex items-center justify-between w-full shrink-0 px-[12px] pt-[12px] pb-[6px]">
        <div className="flex items-center gap-[6px]">
          <div className="bg-[#00a46e] rounded-full shrink-0 size-[4px] animate-[blink_2s_ease-in-out_infinite]" />
          <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[normal] text-[#dadfe3] text-[12px] tracking-[0.4px] uppercase">
            Insights
          </p>
        </div>
        <span className="text-[10px] text-[#6b7c8a] font-['Inter:Regular',sans-serif] tracking-[0.3px]">
          LAST 24H
        </span>
      </div>

      {/* Scrollable body — clipped by the outer overflow-hidden */}
      <div className="flex-1 min-h-0 overflow-y-auto px-[12px] pb-[12px] flex flex-col gap-[6px]" style={{ scrollbarWidth: "none" }}>
        <Separator />

        {/* What Matters Now */}
        <WhatMattersNow />

        <Separator />

        {/* Hero KPIs row */}
        <HeroStat />

        <Separator />

        {/* Metric rows */}
        <div className="flex flex-col w-full gap-[3px]">
          <span className="text-[8px] text-[#5a7280] font-['Inter:Semi_Bold',sans-serif] uppercase tracking-[0.6px] leading-[1] mb-[1px]">
            Performance
          </span>
          {standardMetrics.map((m, i) => (
            <MetricRow key={m.label} metric={m} index={i} />
          ))}
        </div>
      </div>
    </div>
  );
}