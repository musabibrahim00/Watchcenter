/**
 * KPI Filled Band Gauge Card
 * ===========================
 *
 * SHARED reusable component for all KPI gauge metrics:
 *   - Mean Time to Observe (MTTO)
 *   - Mean Time to Triage (MTTA)
 *   - Mean Time to Detect (MTTD)
 *   - Mean Time to Respond (MTTR)
 *   - Mean Time to Conclude (MTTC)
 *   - False Positive Rate (FPR)
 *
 * PROTECTION RULE — This MUST remain a custom SVG filled-band gauge.
 *   DO NOT replace with:
 *     - donut charts         - radial charts
 *     - pie charts           - circular rings
 *     - chart-library gauges - full-circle meters
 *     - stroke-only arcs for the active band
 *
 * SVG STRUCTURE (ordered back-to-front):
 *   1. Outer guide arc  — thin subtle stroke at outer band edge
 *   2. Inner guide arc  — thin subtle stroke at inner band edge
 *   3. Background band  — full 180° filled path (outer R=108, inner R=74)
 *   4. Active band      — filled path segment from left → value angle
 *   5. Marker line      — diagonal line anchored at band endpoint
 *   6. Center label     — SVG <text> "Current MTTO"
 *   7. Center value     — SVG <text> "4.3 mins"
 *
 * GEOMETRY:
 *   viewBox:      320 x 220
 *   Center:       (160, 156)  — arc baseline
 *   Outer radius: 108
 *   Inner radius: 74
 *   Band width:   34px (108 - 74), filled shape, NOT stroked
 *   Start angle:  180° (9 o'clock / left)
 *   End angle:    0°   (3 o'clock / right)
 *
 * CARD LAYOUT (top to bottom — do not reorder):
 *   1. KPI title + info icon
 *   2. Description text
 *   3. Source row + Owner badge
 *   4. SLA progress bar
 *   5. SVG filled-band gauge
 *   6. Legend row (Optimal / Caution / Critical)
 *   7. Full-width time range selector (56px height)
 */

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Info } from "lucide-react";
import { colors } from "../../design-system/tokens";

/* ═══════════════════════════════════════════════════════════
   COLOR TOKENS — matching the reference design exactly
   ═══════════════════════════════════════════════════════════ */

const gaugeColors = {
  /* ── Band status colors (SLA threshold-based) ── */
  optimal: "#57C292",
  caution: "#F2A23A",
  critical: "#F26B6B",

  /* ── Gauge structure ── */
  neutralBand: "#0E1B29",   // background track fill
  guideArc: "#1A2A39",      // subtle guide stroke

  /* ── Text ── */
  valueText: "#E8EEF5",     // large center value
  labelText: "#7E8C9B",     // muted center label + legend

  /* ── Card chrome (from global tokens) ── */
  textPrimary: colors.textPrimary ?? "#E2E8F0",
  textSecondary: "#89949e",
  textTertiary: "#62707d",
  accent: colors.accent,
  border: colors.border,
  cardBg: colors.bgCard,
} as const;

/* ═══════════════════════════════════════════════════════════
   GAUGE GEOMETRY CONSTANTS
   ═══════════════════════════════════════════════════════════

   viewBox:      320 x 220
   Outer radius: 108
   Inner radius: 74
   Band width:   34px (filled shape between two radii)
   Center:       (160, 156) — arc baseline sits at y=156
*/

const SVG_W = 320;
const SVG_H = 220;
const CX = 160;
const CY = 156;
const R_OUTER = 108;
const R_INNER = 74;

/* ═══════════════════════════════════════════════════════════
   SVG PATH HELPERS
   ═══════════════════════════════════════════════════════════ */

/** Point on a circle centered at (CX, CY).
 *  0° = right (3 o'clock), 90° = top (12 o'clock), 180° = left (9 o'clock). */
function gaugePt(r: number, deg: number) {
  const rad = (deg * Math.PI) / 180;
  return { x: CX + r * Math.cos(rad), y: CY - r * Math.sin(rad) };
}

/**
 * Filled band path — closed shape between outer and inner radii.
 *
 *   M outerStart
 *   A outer arc (clockwise) → outerEnd
 *   L innerEnd              (straight line — no rounded cap)
 *   A inner arc (counter-clockwise) → innerStart
 *   Z
 *
 * This produces the thick filled band matching the reference.
 * Band edges are straight, not rounded.
 */
function filledBandPath(startDeg: number, endDeg: number): string {
  const oS = gaugePt(R_OUTER, startDeg);
  const oE = gaugePt(R_OUTER, endDeg);
  const iS = gaugePt(R_INNER, startDeg);
  const iE = gaugePt(R_INNER, endDeg);
  const span = startDeg - endDeg;
  const lg = span > 180 ? 1 : 0;

  return [
    `M ${oS.x} ${oS.y}`,
    `A ${R_OUTER} ${R_OUTER} 0 ${lg} 1 ${oE.x} ${oE.y}`,  // outer arc clockwise
    `L ${iE.x} ${iE.y}`,                                     // straight line to inner
    `A ${R_INNER} ${R_INNER} 0 ${lg} 0 ${iS.x} ${iS.y}`,   // inner arc counter-clockwise
    "Z",
  ].join(" ");
}

/** Guide arc — simple semicircular stroke path at a given radius. */
function guideArcPath(r: number): string {
  const left = gaugePt(r, 180);
  const right = gaugePt(r, 0);
  return `M ${left.x} ${left.y} A ${r} ${r} 0 0 1 ${right.x} ${right.y}`;
}

/* ── Pre-computed static paths ── */
const BG_BAND_PATH = filledBandPath(180, 0);
const GUIDE_OUTER_PATH = guideArcPath(R_OUTER);
const GUIDE_INNER_PATH = guideArcPath(R_INNER);

/* ═══════════════════════════════════════════════════════════
   RANGE SELECTOR — shared options
   ═══════════════════════════════════════════════════════════ */

const TIME_RANGE_OPTIONS = ["7 Days", "14 Days", "30 Days", "90 Days"] as const;
export type TimeRangeOption = (typeof TIME_RANGE_OPTIONS)[number];

/* ═══════════════════════════════════════════════════════════
   HELPER — SLA threshold color
   ═══════════════════════════════════════════════════════════

   Thresholds (lower value = better performance):
     0–70%  of SLA → Optimal  (#57C292)
     70–90% of SLA → Caution  (#F2A23A)
     90%+   of SLA → Critical (#F26B6B)
*/

function slaThresholdColor(value: number, max: number): string {
  if (max <= 0) return gaugeColors.critical;
  const ratio = value / max;
  if (ratio < 0.7) return gaugeColors.optimal;
  if (ratio < 0.9) return gaugeColors.caution;
  return gaugeColors.critical;
}

/** SLA progress bar helper (higher % = better) */
function statusColor(pct: number): string {
  if (pct >= 70) return gaugeColors.optimal;
  if (pct >= 40) return gaugeColors.caution;
  return gaugeColors.critical;
}

/** Format a numeric value for display: 1 decimal if fractional, integer otherwise */
function formatValue(v: number): string {
  return Number.isInteger(v) ? String(v) : v.toFixed(1);
}

/* ═══════════════════════════════════════════════════════════
   SEMI-CIRCLE FILLED BAND GAUGE — SVG Component
   ══════════════════════════════════════���════════════════════

   Standalone SVG. No chart libraries. No HTML overlays for text.
   All text rendered as SVG <text> elements for precise positioning.

   Layer order (back to front):
     1. Outer guide arc (subtle stroke at R_OUTER)
     2. Inner guide arc (subtle stroke at R_INNER)
     3. Background band (full 180° filled shape, neutral color)
     4. Active band     (filled shape from left to value angle)
     5. Marker line     (diagonal across band at value endpoint)
     6. Center label    (SVG text — "Current MTTO")
     7. Center value    (SVG text — "4.3 mins")
*/

export interface SemiCircleGaugeProps {
  value: number;
  max: number;
  unit: string;
  centerLabel: string;
}

export function SemiCircleGauge({
  value,
  max,
  unit,
  centerLabel,
}: SemiCircleGaugeProps) {
  /* ── percentage clamped 0–100 ── */
  const pct = Math.min(Math.max((value / max) * 100, 0), 100);
  const bandColor = slaThresholdColor(value, max);

  /* ── active band end angle: 180° = 0%, 0° = 100% ── */
  const endDeg = 180 - (pct / 100) * 180;

  /* ── active band filled path ── */
  const activePath = pct > 0.5 ? filledBandPath(180, endDeg) : null;

  /* ── marker geometry ──
     Diagonal line from slightly outside outer edge to slightly inside inner edge
     at the value angle. Stroke-width 5, rounded caps. */
  const MARKER_EXT = 3; // extend beyond band edges
  const mOuter = gaugePt(R_OUTER + MARKER_EXT, endDeg);
  const mInner = gaugePt(R_INNER - MARKER_EXT, endDeg);

  /* ── display value ── */
  const displayVal = formatValue(value);

  return (
    <svg
      viewBox={`0 0 ${SVG_W} ${SVG_H}`}
      width="100%"
      height={SVG_H}
      aria-hidden="true"
      style={{ display: "block" }}
    >
      {/* Layer 1 — Outer guide arc (subtle stroke at band outer edge) */}
      <path
        d={GUIDE_OUTER_PATH}
        fill="none"
        stroke={gaugeColors.guideArc}
        strokeWidth={2}
        opacity={0.9}
      />

      {/* Layer 2 — Inner guide arc (subtle stroke at band inner edge) */}
      <path
        d={GUIDE_INNER_PATH}
        fill="none"
        stroke={gaugeColors.guideArc}
        strokeWidth={2}
        opacity={0.9}
      />

      {/* Layer 3 — Background band (full 180° filled shape, neutral) */}
      <path d={BG_BAND_PATH} fill={gaugeColors.neutralBand} />

      {/* Layer 4 — Active filled band (colored segment) */}
      {activePath && <path d={activePath} fill={bandColor} />}

      {/* Layer 5 — Marker line (diagonal across band at value endpoint) */}
      {pct > 0.5 && (
        <line
          x1={mOuter.x}
          y1={mOuter.y}
          x2={mInner.x}
          y2={mInner.y}
          stroke={bandColor}
          strokeWidth={5}
          strokeLinecap="round"
        />
      )}

      {/* Layer 6 — Center label (small muted text) */}
      <text
        x={CX}
        y={120}
        textAnchor="middle"
        fill={gaugeColors.labelText}
        fontSize={14}
        fontWeight={500}
      >
        {centerLabel}
      </text>

      {/* Layer 7 — Center value + unit */}
      <text
        x={CX}
        y={154}
        textAnchor="middle"
        fill={gaugeColors.valueText}
        fontSize={34}
        fontWeight={700}
      >
        {displayVal}
        <tspan
          fontSize={15}
          fontWeight={400}
          fill={gaugeColors.labelText}
          dx={4}
        >
          {unit}
        </tspan>
      </text>
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════════
   FULL-WIDTH TIME RANGE SELECTOR
   ═══════════════════════════════════════════════════════════

   Specs:
     Height:  56px
     Width:   100% of parent content
     Shape:   rounded (12px border-radius)
     Content: left-aligned value, chevron on the right
     Options: 7 / 14 / 30 / 90 Days  (default: 30 Days)
*/

export interface TimeRangeSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export function TimeRangeSelector({
  value,
  onChange,
}: TimeRangeSelectorProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  /* Close on outside click */
  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  return (
    <div ref={containerRef} className="relative w-full">
      {/* ── Trigger — full width, 56px tall ── */}
      <button
        type="button"
        className="w-full flex items-center justify-between rounded-[12px] transition-colors"
        style={{
          height: 56,
          padding: "0 20px",
          backgroundColor: "rgba(255,255,255,0.03)",
          border: `1px solid ${gaugeColors.border}`,
          color: gaugeColors.textSecondary,
          cursor: "pointer",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.06)";
          e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.03)";
          e.currentTarget.style.borderColor = gaugeColors.border;
        }}
        onClick={() => setOpen((o) => !o)}
      >
        <span className="text-[13px]" style={{ fontWeight: 500 }}>
          {value}
        </span>
        <ChevronDown
          className="size-[16px] transition-transform"
          style={{
            color: gaugeColors.textTertiary,
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
          }}
        />
      </button>

      {/* ── Dropdown menu ── */}
      {open && (
        <div
          className="absolute left-0 right-0 z-50 rounded-[10px] py-[4px] mt-[4px]"
          style={{
            backgroundColor: gaugeColors.cardBg,
            border: `1px solid ${gaugeColors.border}`,
            boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
          }}
        >
          {TIME_RANGE_OPTIONS.map((option) => {
            const isActive = option === value;
            return (
              <button
                key={option}
                type="button"
                className="w-full text-left px-[16px] py-[10px] text-[13px] transition-colors"
                style={{
                  color: isActive
                    ? gaugeColors.accent
                    : gaugeColors.textSecondary,
                  backgroundColor: isActive
                    ? "rgba(20,162,227,0.08)"
                    : "transparent",
                  fontWeight: isActive ? 600 : 400,
                }}
                onMouseEnter={(e) => {
                  if (!isActive)
                    e.currentTarget.style.backgroundColor =
                      "rgba(255,255,255,0.05)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = isActive
                    ? "rgba(20,162,227,0.08)"
                    : "transparent";
                }}
                onClick={() => {
                  onChange(option);
                  setOpen(false);
                }}
              >
                {option}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   KPI GAUGE CARD PROPS
   ═══════════════════════════════════════════════════════════ */

export interface KPIGaugeCardProps {
  title: string;
  description: string;
  sourceLabel: string;
  ownerLabel: string;
  slaProgressLabel: string;
  slaProgressPercent: number;
  gaugeValue: number;
  gaugeMax: number;
  gaugeUnit: string;
  gaugeCenterLabel: string;
  timeRange?: string;
  onTimeRangeChange?: (range: string) => void;
}

/* ═══════════════════════════════════════════════════════════
   KPI GAUGE CARD — Main exported component
   ═══════════════════════════════════════════════════════════

   Reused across all 6 KPI metrics (MTTO, MTTA, MTTD, MTTR, MTTC, FPR).

   Card layout is fixed — do not reorder sections:
     Title → Description → Source/Owner → SLA bar →
     SVG Gauge → Legend → Full-width time range selector
*/

export function KPIGaugeCard({
  title,
  description,
  sourceLabel,
  ownerLabel,
  slaProgressLabel,
  slaProgressPercent,
  gaugeValue,
  gaugeMax,
  gaugeUnit,
  gaugeCenterLabel,
  timeRange = "30 Days",
  onTimeRangeChange,
}: KPIGaugeCardProps) {
  const slaColor = statusColor(
    slaProgressPercent >= 70 ? 70 : slaProgressPercent >= 50 ? 40 : 0
  );

  return (
    <div
      className="rounded-[12px] p-[20px] flex flex-col"
      style={{
        backgroundColor: gaugeColors.cardBg,
        border: `1px solid ${gaugeColors.border}`,
      }}
    >
      {/* ── 1. HEADER — Title + info icon ── */}
      <div className="flex items-center gap-[6px] mb-[8px]">
        <h3
          className="text-[14px]"
          style={{ color: gaugeColors.textPrimary, fontWeight: 600 }}
        >
          {title}
        </h3>
        <Info
          className="size-[14px]"
          style={{ color: gaugeColors.textTertiary }}
        />
      </div>

      {/* ── 2. DESCRIPTION ── */}
      <p
        className="text-[11px] leading-[1.5] mb-[10px]"
        style={{ color: gaugeColors.textSecondary }}
      >
        {description}
      </p>

      {/* ── 3. SOURCE ROW + OWNER BADGE ── */}
      <div className="flex items-center justify-between mb-[12px]">
        <div className="flex items-center gap-[6px]">
          <span
            className="text-[10px]"
            style={{ color: gaugeColors.textTertiary, fontWeight: 500 }}
          >
            Source &rarr;
          </span>
          <span
            className="text-[10px]"
            style={{ color: gaugeColors.textSecondary }}
          >
            {sourceLabel}
          </span>
        </div>
        <div
          className="px-[8px] py-[3px] rounded-[4px] text-[10px]"
          style={{
            backgroundColor: "rgba(20, 162, 227, 0.1)",
            color: gaugeColors.accent,
            border: "1px solid rgba(20, 162, 227, 0.25)",
            fontWeight: 500,
          }}
        >
          {ownerLabel}
        </div>
      </div>

      {/* ── 4. SLA PROGRESS BAR ── */}
      <div className="mb-[24px]">
        <div className="flex items-center justify-between mb-[6px]">
          <span
            className="text-[10px]"
            style={{ color: gaugeColors.textTertiary }}
          >
            {slaProgressLabel}
          </span>
          <span
            className="text-[10px]"
            style={{ color: slaColor, fontWeight: 500 }}
          >
            {slaProgressPercent}% within SLA
          </span>
        </div>
        <div
          className="h-[5px] w-full rounded-full overflow-hidden"
          style={{ backgroundColor: gaugeColors.neutralBand }}
        >
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${Math.min(slaProgressPercent, 100)}%`,
              backgroundColor: slaColor,
            }}
          />
        </div>
      </div>

      {/* ── 5. FILLED BAND SVG GAUGE ── */}
      <div className="mb-[16px]">
        <SemiCircleGauge
          value={gaugeValue}
          max={gaugeMax}
          unit={gaugeUnit}
          centerLabel={gaugeCenterLabel}
        />
      </div>

      {/* ── 6. LEGEND — Optimal / Caution / Critical ── */}
      <div className="flex items-center justify-center gap-[16px] mb-[20px]">
        {(
          [
            ["Optimal", gaugeColors.optimal],
            ["Caution", gaugeColors.caution],
            ["Critical", gaugeColors.critical],
          ] as const
        ).map(([label, color]) => (
          <div key={label} className="flex items-center gap-[5px]">
            <div
              className="size-[7px] rounded-full"
              style={{ backgroundColor: color }}
            />
            <span
              className="text-[10px]"
              style={{ color: gaugeColors.labelText }}
            >
              {label}
            </span>
          </div>
        ))}
      </div>

      {/* ── 7. FULL-WIDTH TIME RANGE SELECTOR (56px, rounded, dropdown) ── */}
      <TimeRangeSelector
        value={timeRange}
        onChange={(v) => onTimeRangeChange?.(v)}
      />
    </div>
  );
}