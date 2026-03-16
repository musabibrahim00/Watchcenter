import React from "react";
import { colors } from "../../design-system/tokens";

/**
 * MetricTile — Display metric with label, value, and optional trend.
 */

export interface MetricTileProps {
  label: string;
  value: string | number;
  delta?: string;
  trend?: "up" | "down" | "neutral";
  icon?: React.ReactNode;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export const MetricTile = React.memo(function MetricTile({
  label,
  value,
  delta,
  trend,
  icon,
  size = "md",
  className = "",
}: MetricTileProps) {
  const trendColor =
    trend === "up"
      ? colors.success
      : trend === "down"
      ? colors.danger
      : colors.neutral;

  const valueSize = size === "sm" ? "16px" : size === "md" ? "20px" : "24px";
  const labelSize = size === "sm" ? "9px" : "10px";

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <div className="flex items-center gap-2">
        {icon && <div className="shrink-0">{icon}</div>}
        <span
          className="text-[10px]"
          style={{
            fontSize: labelSize,
            color: colors.textMuted,
            lineHeight: "1.3",
          }}
        >
          {label}
        </span>
      </div>
      <div className="flex items-baseline gap-2">
        <span
          className="font-semibold"
          style={{
            fontSize: valueSize,
            color: colors.textPrimary,
            lineHeight: "1",
          }}
        >
          {value}
        </span>
        {delta && (
          <span
            className="text-[10px] font-medium"
            style={{
              color: trendColor,
            }}
          >
            {delta}
          </span>
        )}
      </div>
    </div>
  );
});

/**
 * MetricGrid — Grid layout for multiple metrics.
 */
export interface MetricGridProps {
  children: React.ReactNode;
  columns?: 2 | 3 | 4;
  gap?: "sm" | "md" | "lg";
  className?: string;
}

const columnClasses = {
  2: "grid-cols-2",
  3: "grid-cols-3",
  4: "grid-cols-4",
};

const gapClasses = {
  sm: "gap-2",
  md: "gap-3",
  lg: "gap-4",
};

export const MetricGrid = React.memo(function MetricGrid({
  children,
  columns = 2,
  gap = "md",
  className = "",
}: MetricGridProps) {
  return (
    <div className={`grid ${columnClasses[columns]} ${gapClasses[gap]} ${className}`}>
      {children}
    </div>
  );
});

/**
 * StatRow — Horizontal stat display (label + value).
 */
export interface StatRowProps {
  label: string;
  value: string | number;
  className?: string;
}

export const StatRow = React.memo(function StatRow({
  label,
  value,
  className = "",
}: StatRowProps) {
  return (
    <div className={`flex items-center justify-between ${className}`}>
      <span className="text-[10px]" style={{ color: colors.textMuted }}>
        {label}
      </span>
      <span
        className="text-[10px] font-medium"
        style={{ color: colors.textSecondary }}
      >
        {value}
      </span>
    </div>
  );
});
