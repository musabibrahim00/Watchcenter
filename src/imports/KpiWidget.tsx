import React from "react";

// ── Priority signals (mirrors WatchDst SITUATION_SIGNALS) ─────────────────
const PRIORITY_SIGNALS = [
  { type: "critical" as const, text: "2 critical attack paths active — finance-db-01 reachable from internet" },
  { type: "warning" as const, text: "3 crown jewel assets have unacknowledged exposure" },
  { type: "warning" as const, text: "Cert expiry < 72h on prod load balancers" },
  { type: "info" as const, text: "Slack integration disconnected — 2 workflow steps blocked" },
  { type: "good" as const, text: "12 alerts resolved in the last 24 hours" },
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
  { label: "Assets Discovered", value: 3842, accent: "#0781C2" },
  { label: "Vulnerabilities Analyzed", value: 1259, accent: "#F05B06", trend: { value: "8.2%", up: false } },
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
      className="flex items-center justify-between py-[5px] group"
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
          <path d="M0 0.5H326" stroke="#172a3c" />
        </svg>
      </div>
    </div>
  );
}

function HeroStat() {
  const mttd = useAnimatedValue(36, 1200); // 3.6 hrs → animate to 36 then display as 3.6
  return (
    <div className="flex items-end justify-between w-full">
      <div className="flex flex-col gap-[6px]">
        <span className="text-[10px] text-[#89949e] font-['Inter:Regular',sans-serif] uppercase tracking-[0.5px] leading-[1]">
          MTTD
        </span>
        <div className="flex items-baseline gap-[4px]">
          <span className="text-[14px] text-white font-['Inter:Semi_Bold',sans-serif] tracking-[-0.5px] leading-[1]">
            {(mttd / 10).toFixed(1)}
          </span>
          <span className="text-[10px] text-[#89949e] font-['Inter:Regular',sans-serif] leading-[1]">hrs</span>
        </div>
      </div>
      <div className="flex flex-col items-start gap-[6px]">
        <span className="text-[10px] text-[#89949e] font-['Inter:Regular',sans-serif] uppercase tracking-[0.5px] leading-[1]">
          MTTR
        </span>
        <div className="flex items-baseline gap-[4px]">
          <span className="text-[14px] text-white font-['Inter:Semi_Bold',sans-serif] tracking-[-0.5px] leading-[1]">
            1.2
          </span>
          <span className="text-[10px] text-[#89949e] font-['Inter:Regular',sans-serif] leading-[1]">hrs</span>
        </div>
      </div>
      <div className="flex flex-col items-center gap-[6px]">
        <span className="text-[10px] text-[#89949e] font-['Inter:Regular',sans-serif] uppercase tracking-[0.5px] leading-[1]">
          SLA MET
        </span>
        <div className="flex items-baseline gap-[4px]">
          <span className="text-[14px] text-[#00A46E] font-['Inter:Semi_Bold',sans-serif] tracking-[-0.5px] leading-[1]">
            98.7
          </span>
          <span className="text-[10px] text-[#89949e] font-['Inter:Regular',sans-serif] leading-[1]">%</span>
        </div>
      </div>
    </div>
  );
}

function WhatMattersNow() {
  return (
    <div className="flex flex-col gap-[5px] w-full">
      <span className="text-[9px] text-[#4a5f72] font-['Inter:Semi_Bold',sans-serif] uppercase tracking-[0.6px] leading-[1]">
        What matters now
      </span>
      <div className="flex flex-col gap-[4px] w-full">
        {PRIORITY_SIGNALS.map((sig, i) => (
          <div key={i} className="flex items-start gap-[6px]">
            <span
              className="block size-[5px] rounded-full shrink-0 mt-[3px]"
              style={{
                backgroundColor: SIGNAL_COLORS[sig.type],
                boxShadow: `0 0 5px ${SIGNAL_COLORS[sig.type]}66`,
              }}
            />
            <span className="text-[10px] font-['Inter:Regular',sans-serif] leading-[1.35]" style={{ color: sig.type === "critical" ? "#e8a0a0" : sig.type === "warning" ? "#d4906a" : sig.type === "good" ? "#7ecfae" : "#7ea9cc" }}>
              {sig.text}
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
      className="bg-[rgba(3,6,9,0.16)] content-stretch flex flex-col gap-[8px] items-start p-[14px] relative rounded-[12px] w-full shrink-0"
      data-name="KPIWidget"
    >
      <div
        aria-hidden="true"
        className="absolute border border-[rgba(87,177,255,0.24)] border-solid inset-0 pointer-events-none rounded-[12px]"
      />

      {/* Header */}
      <div className="flex items-center justify-between w-full">
        <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[normal] text-[#dadfe3] text-[12px] tracking-[0.4px] uppercase">
          Insights
        </p>
        <span className="text-[10px] text-[#6b7c8a] font-['Inter:Regular',sans-serif] tracking-[0.3px]">
          LAST 24H
        </span>
      </div>

      <Separator />

      {/* What Matters Now */}
      <WhatMattersNow />

      <Separator />

      {/* Hero KPIs row */}
      <HeroStat />

      <Separator />

      {/* Metric rows */}
      <div className="flex flex-col w-full -my-[1px]">
        {standardMetrics.map((m, i) => (
          <MetricRow key={m.label} metric={m} index={i} />
        ))}
      </div>
    </div>
  );
}