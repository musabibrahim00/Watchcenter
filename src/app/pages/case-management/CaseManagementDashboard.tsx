/**
 * Case Management Dashboard
 * ==========================
 * 
 * Main dashboard view with KPI cards and trend charts.
 * Built to match exact UI from Figma screenshots.
 * 
 * Functional day-range selector controls data scope for all KPI cards + charts.
 */

import React, { useState, useMemo, useCallback } from "react";
import { AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { ChevronDown } from "lucide-react";
import { PageContainer, DashboardGrid } from "../../shared/components";
import { KPIGaugeCard } from "./KPIGaugeCard";
import { caseColors } from "./design-tokens";
import { DeferredChart } from "../../shared/components/DeferredChart";

// ============================
// Time-range aware data generation
// ============================

type TimeRange = "7 Days" | "14 Days" | "30 Days" | "90 Days";
const TIME_RANGE_OPTIONS: TimeRange[] = ["7 Days", "14 Days", "30 Days", "90 Days"];

function getDayCount(range: TimeRange): number {
  switch (range) {
    case "7 Days": return 7;
    case "14 Days": return 14;
    case "30 Days": return 31;
    case "90 Days": return 90;
  }
}

/** Seeded random for deterministic data per range */
function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function generateTrendData(range: TimeRange) {
  const days = getDayCount(range);
  const rng = seededRandom(days * 7 + 42);
  const data = [];
  for (let i = 1; i <= days; i++) {
    data.push({
      id: `day-${i}`,
      day: i.toString().padStart(2, "0"),
      l0h: rng() * 4 + 1,
      l1h: rng() * 6 + 2,
      l2h: rng() * 8 + 3,
      l3h: rng() * 10 + 4,
    });
  }
  return data;
}

function generateMTTRData(range: TimeRange) {
  const days = getDayCount(range);
  const rng = seededRandom(days * 13 + 99);
  const data = [];
  for (let i = 1; i <= days; i++) {
    data.push({
      id: `day-${i}`,
      day: i.toString().padStart(2, "0"),
      mttr: rng() * 8 + 2,
      abnormal: rng() * 10 + 3,
    });
  }
  return data;
}

/** Generate KPI metric values based on the selected time range */
function getMetricsForRange(range: TimeRange) {
  const rng = seededRandom(getDayCount(range) * 3 + 17);
  const jitter = (base: number, variance: number) =>
    Math.round((base + (rng() - 0.5) * variance) * 10) / 10;

  return {
    mtto: {
      gaugeValue: jitter(4.3, 2.0),
      gaugeMax: 10,
      slaPercent: Math.round(jitter(78, 12)),
      progressLabel: "Source → SIEM visibility",
    },
    mtta: {
      gaugeValue: jitter(8.7, 4.0),
      gaugeMax: 15,
      slaPercent: Math.round(jitter(76, 14)),
      progressLabel: "Ingestion → Initial classification",
    },
    mttd: {
      gaugeValue: jitter(12.5, 5.0),
      gaugeMax: 20,
      slaPercent: Math.round(jitter(66, 16)),
      progressLabel: "Alert → confirmed incident",
    },
    mttr: {
      gaugeValue: jitter(45.2, 15.0),
      gaugeMax: 90,
      slaPercent: Math.round(jitter(52, 18)),
      progressLabel: "Incident confirmation → closure",
    },
    mttc: {
      gaugeValue: jitter(2.8, 1.2),
      gaugeMax: 5,
      slaPercent: Math.round(jitter(64, 14)),
      progressLabel: "Alert generation → case closure",
    },
    fpr: {
      gaugeValue: Math.round(jitter(12, 8)),
      gaugeMax: 100,
      slaPercent: Math.round(jitter(64, 18)),
      progressLabel: "Automated classification accuracy",
    },
  };
}

// ============================
// Time Range Dropdown (reusable)
// ============================

function TimeRangeDropdown({
  value,
  onChange,
  label,
}: {
  value: TimeRange;
  onChange: (v: TimeRange) => void;
  label?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        className="flex items-center gap-[4px] px-[10px] py-[4px] rounded-[6px] transition-colors"
        style={{
          color: caseColors.textSecondary,
          border: `1px solid ${caseColors.border}`,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = caseColors.hoverOverlayStrong;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = "transparent";
        }}
        onClick={() => setOpen((o) => !o)}
      >
        <span className="text-[11px]" style={{ fontWeight: 500 }}>
          {label ? `${label}: ` : ""}{value}
        </span>
        <ChevronDown className="size-[14px]" />
      </button>

      {open && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          {/* Dropdown menu */}
          <div
            className="absolute right-0 top-full mt-[4px] z-50 rounded-[8px] py-[4px] min-w-[120px]"
            style={{
              backgroundColor: caseColors.cardDefaultBg,
              border: `1px solid ${caseColors.border}`,
              boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
            }}
          >
            {TIME_RANGE_OPTIONS.map((option) => (
              <button
                key={option}
                className="w-full text-left px-[12px] py-[8px] text-[11px] transition-colors"
                style={{
                  color: option === value ? caseColors.accent : caseColors.textSecondary,
                  backgroundColor: option === value ? "rgba(20,162,227,0.08)" : "transparent",
                  fontWeight: option === value ? 600 : 400,
                }}
                onMouseEnter={(e) => {
                  if (option !== value) e.currentTarget.style.backgroundColor = caseColors.hoverOverlayStrong;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = option === value ? "rgba(20,162,227,0.08)" : "transparent";
                }}
                onClick={() => {
                  onChange(option);
                  setOpen(false);
                }}
              >
                {option}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ============================
// Trend Chart Components
// ============================

function MTTDTrendChart({ timeRange, onTimeRangeChange }: { timeRange: TimeRange; onTimeRangeChange: (v: TimeRange) => void }) {
  const data = useMemo(() => generateTrendData(timeRange), [timeRange]);
  const chartId = useMemo(() => `mttd-${Math.random().toString(36).substr(2, 9)}`, []);

  return (
    <div
      className="rounded-[12px] p-[20px]"
      style={{
        backgroundColor: caseColors.cardDefaultBg,
        border: `1px solid ${caseColors.border}`,
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-[20px]">
        <h3
          className="text-[14px]"
          style={{ color: caseColors.textPrimary, fontWeight: 600 }}
        >
          MTTD Trend
        </h3>
        <TimeRangeDropdown value={timeRange} onChange={onTimeRangeChange} label="Duration" />
      </div>

      {/* Chart */}
      <div style={{ height: 320, width: "100%", minWidth: 0 }}>
        <DeferredChart>
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs key="mttd-defs">
              <linearGradient id={`colorL0-${chartId}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id={`colorL1-${chartId}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
              <linearGradient id={`colorL2-${chartId}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
              </linearGradient>
              <linearGradient id={`colorL3-${chartId}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid key="mttd-grid" strokeDasharray="3 3" stroke={caseColors.border} vertical={false} />
            <XAxis
              key="mttd-xaxis"
              dataKey="day"
              stroke={caseColors.textTertiary}
              tick={{ fill: caseColors.textTertiary, fontSize: 10 }}
              tickLine={false}
              axisLine={{ stroke: caseColors.border }}
            />
            <YAxis
              key="mttd-yaxis"
              stroke={caseColors.textTertiary}
              tick={{ fill: caseColors.textTertiary, fontSize: 10 }}
              tickLine={false}
              axisLine={{ stroke: caseColors.border }}
              label={{
                value: "10 hrs",
                angle: -90,
                position: "insideLeft",
                style: { fill: caseColors.textSecondary, fontSize: 10 },
              }}
            />
            <Tooltip
              key="mttd-tooltip"
              contentStyle={{
                backgroundColor: caseColors.bgCard,
                border: `1px solid ${caseColors.border}`,
                borderRadius: "8px",
                fontSize: "11px",
              }}
              labelStyle={{ color: caseColors.textSecondary }}
            />
            <Area key="mttd-l0h" type="monotone" dataKey="l0h" stackId="1" stroke="#3b82f6" fill={`url(#colorL0-${chartId})`} strokeWidth={1.5} isAnimationActive={false} />
            <Area key="mttd-l1h" type="monotone" dataKey="l1h" stackId="1" stroke="#10b981" fill={`url(#colorL1-${chartId})`} strokeWidth={1.5} isAnimationActive={false} />
            <Area key="mttd-l2h" type="monotone" dataKey="l2h" stackId="1" stroke="#f59e0b" fill={`url(#colorL2-${chartId})`} strokeWidth={1.5} isAnimationActive={false} />
            <Area key="mttd-l3h" type="monotone" dataKey="l3h" stackId="1" stroke="#ef4444" fill={`url(#colorL3-${chartId})`} strokeWidth={1.5} isAnimationActive={false} />
          </AreaChart>
        </DeferredChart>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-[16px] mt-[16px] justify-center">
        <div className="flex items-center gap-[6px]">
          <div className="size-[10px] rounded-sm" style={{ backgroundColor: "#3b82f6" }} />
          <span className="text-[10px]" style={{ color: caseColors.textTertiary }}>L0h</span>
        </div>
        <div className="flex items-center gap-[6px]">
          <div className="size-[10px] rounded-sm" style={{ backgroundColor: "#10b981" }} />
          <span className="text-[10px]" style={{ color: caseColors.textTertiary }}>L1h</span>
        </div>
        <div className="flex items-center gap-[6px]">
          <div className="size-[10px] rounded-sm" style={{ backgroundColor: "#f59e0b" }} />
          <span className="text-[10px]" style={{ color: caseColors.textTertiary }}>L2h</span>
        </div>
        <div className="flex items-center gap-[6px]">
          <div className="size-[10px] rounded-sm" style={{ backgroundColor: "#ef4444" }} />
          <span className="text-[10px]" style={{ color: caseColors.textTertiary }}>L3h</span>
        </div>
      </div>
    </div>
  );
}

function MTTRTrendChart({ timeRange, onTimeRangeChange }: { timeRange: TimeRange; onTimeRangeChange: (v: TimeRange) => void }) {
  const data = useMemo(() => generateMTTRData(timeRange), [timeRange]);
  const chartId = useMemo(() => `mttr-${Math.random().toString(36).substr(2, 9)}`, []);

  return (
    <div
      className="rounded-[12px] p-[20px]"
      style={{
        backgroundColor: caseColors.cardDefaultBg,
        border: `1px solid ${caseColors.border}`,
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-[20px]">
        <h3
          className="text-[14px]"
          style={{ color: caseColors.textPrimary, fontWeight: 600 }}
        >
          MTTR Trend
        </h3>
        <TimeRangeDropdown value={timeRange} onChange={onTimeRangeChange} label="Duration" />
      </div>

      {/* Chart */}
      <div style={{ height: 320, width: "100%", minWidth: 0 }}>
        <DeferredChart>
          <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid key="mttr-grid" strokeDasharray="3 3" stroke={caseColors.border} vertical={false} />
            <XAxis
              key="mttr-xaxis"
              dataKey="day"
              stroke={caseColors.textTertiary}
              tick={{ fill: caseColors.textTertiary, fontSize: 10 }}
              tickLine={false}
              axisLine={{ stroke: caseColors.border }}
            />
            <YAxis
              key="mttr-yaxis"
              stroke={caseColors.textTertiary}
              tick={{ fill: caseColors.textTertiary, fontSize: 10 }}
              tickLine={false}
              axisLine={{ stroke: caseColors.border }}
              label={{
                value: "10 hrs",
                angle: -90,
                position: "insideLeft",
                style: { fill: caseColors.textSecondary, fontSize: 10 },
              }}
            />
            <Tooltip
              key="mttr-tooltip"
              contentStyle={{
                backgroundColor: caseColors.bgCard,
                border: `1px solid ${caseColors.border}`,
                borderRadius: "8px",
                fontSize: "11px",
              }}
              labelStyle={{ color: caseColors.textSecondary }}
            />
            <Line key="mttr-line" type="monotone" dataKey="mttr" stroke="#3b82f6" strokeWidth={2} dot={false} isAnimationActive={false} />
            <Line key="mttr-abnormal" type="monotone" dataKey="abnormal" stroke="#ef4444" strokeWidth={2} dot={false} isAnimationActive={false} />
          </LineChart>
        </DeferredChart>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-[16px] mt-[16px] justify-center">
        <div className="flex items-center gap-[6px]">
          <div className="size-[10px] rounded-sm" style={{ backgroundColor: "#3b82f6" }} />
          <span className="text-[10px]" style={{ color: caseColors.textTertiary }}>MTTR</span>
        </div>
        <div className="flex items-center gap-[6px]">
          <div className="size-[10px] rounded-sm" style={{ backgroundColor: "#ef4444" }} />
          <span className="text-[10px]" style={{ color: caseColors.textTertiary }}>Abnormal Incident</span>
        </div>
      </div>
    </div>
  );
}

// ============================
// Main Dashboard
// ============================

export default function CaseManagementDashboard() {
  const [timeRange, setTimeRange] = useState<TimeRange>("30 Days");

  const metrics = useMemo(() => getMetricsForRange(timeRange), [timeRange]);

  const handleTimeRangeChange = useCallback((range: TimeRange) => {
    setTimeRange(range);
  }, []);

  /** Handle time range selection from KPI card full-width selector */
  const handleKpiTimeRangeClick = useCallback((selectedRange: string) => {
    const validRanges: TimeRange[] = ["7 Days", "14 Days", "30 Days", "90 Days"];
    if (validRanges.includes(selectedRange as TimeRange)) {
      setTimeRange(selectedRange as TimeRange);
    }
  }, []);

  return (
    <PageContainer>
      {/* KPI Cards Grid - 3 columns, 2 rows */}
      <DashboardGrid columns={3} gap={16}>
        <KPIGaugeCard
          title="Mean Time to Observe (MTTO)"
          description="Average time from security event occurrence at source systems to when it is observed in the central platform."
          sourceLabel="SIEM visibility"
          ownerLabel="SOC Team"
          slaProgressLabel={metrics.mtto.progressLabel}
          slaProgressPercent={metrics.mtto.slaPercent}
          gaugeValue={metrics.mtto.gaugeValue}
          gaugeMax={metrics.mtto.gaugeMax}
          gaugeUnit="mins"
          gaugeCenterLabel="Current MTTO"
          timeRange={timeRange}
          onTimeRangeChange={handleKpiTimeRangeClick}
        />
        <KPIGaugeCard
          title="Mean Time to Triage (MTTA)"
          description="Average time from submitted security event collection to when a security analyst begins initial analysis and categorization."
          sourceLabel="Alert Queue"
          ownerLabel="SOC Team"
          slaProgressLabel={metrics.mtta.progressLabel}
          slaProgressPercent={metrics.mtta.slaPercent}
          gaugeValue={metrics.mtta.gaugeValue}
          gaugeMax={metrics.mtta.gaugeMax}
          gaugeUnit="mins"
          gaugeCenterLabel="Current MTTA"
          timeRange={timeRange}
          onTimeRangeChange={handleKpiTimeRangeClick}
        />
        <KPIGaugeCard
          title="Mean Time to Detect (MTTD)"
          description="Average time taken to analyze security events and confirm breach or malicious activity has occurred."
          sourceLabel="Detection Platform"
          ownerLabel="SOC Team"
          slaProgressLabel={metrics.mttd.progressLabel}
          slaProgressPercent={metrics.mttd.slaPercent}
          gaugeValue={metrics.mttd.gaugeValue}
          gaugeMax={metrics.mttd.gaugeMax}
          gaugeUnit="mins"
          gaugeCenterLabel="Current MTTD"
          timeRange={timeRange}
          onTimeRangeChange={handleKpiTimeRangeClick}
        />
        <KPIGaugeCard
          title="Mean Time to Respond (MTTR)"
          description="Average time taken to respond, remediate, and close a confirmed incident after an authorized incident."
          sourceLabel="Response Platform"
          ownerLabel="IR Team"
          slaProgressLabel={metrics.mttr.progressLabel}
          slaProgressPercent={metrics.mttr.slaPercent}
          gaugeValue={metrics.mttr.gaugeValue}
          gaugeMax={metrics.mttr.gaugeMax}
          gaugeUnit="mins"
          gaugeCenterLabel="Current MTTR"
          timeRange={timeRange}
          onTimeRangeChange={handleKpiTimeRangeClick}
        />
        <KPIGaugeCard
          title="Mean Time to Conclude (MTTC)"
          description="Average time from initial alert generation through analysis, response, and case closure."
          sourceLabel="Case Management"
          ownerLabel="SOC Team"
          slaProgressLabel={metrics.mttc.progressLabel}
          slaProgressPercent={metrics.mttc.slaPercent}
          gaugeValue={metrics.mttc.gaugeValue}
          gaugeMax={metrics.mttc.gaugeMax}
          gaugeUnit="hrs"
          gaugeCenterLabel="Current MTTC"
          timeRange={timeRange}
          onTimeRangeChange={handleKpiTimeRangeClick}
        />
        <KPIGaugeCard
          title="False Positive Rate (Automated Classification)"
          description="Percentage of alerts automatically classified as false positives by the security orchestration platform."
          sourceLabel="ML Classification"
          ownerLabel="Auto Team"
          slaProgressLabel={metrics.fpr.progressLabel}
          slaProgressPercent={metrics.fpr.slaPercent}
          gaugeValue={metrics.fpr.gaugeValue}
          gaugeMax={metrics.fpr.gaugeMax}
          gaugeUnit="%"
          gaugeCenterLabel="Current FPR"
          timeRange={timeRange}
          onTimeRangeChange={handleKpiTimeRangeClick}
        />
      </DashboardGrid>

      {/* Spacing */}
      <div style={{ height: 24 }} />

      {/* Trend Charts - 2 columns */}
      <DashboardGrid columns={2} gap={16}>
        <div key="mttd-chart-wrapper" style={{ minWidth: 0 }}>
          <MTTDTrendChart timeRange={timeRange} onTimeRangeChange={handleTimeRangeChange} />
        </div>
        <div key="mttr-chart-wrapper" style={{ minWidth: 0 }}>
          <MTTRTrendChart timeRange={timeRange} onTimeRangeChange={handleTimeRangeChange} />
        </div>
      </DashboardGrid>
    </PageContainer>
  );
}