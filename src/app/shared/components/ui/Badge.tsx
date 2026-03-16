import React from "react";
import { getToneColor, colors } from "../../design-system/tokens";

/**
 * Badge — Status/severity indicator with consistent styling.
 *
 * Used for:
 * - Severity levels (critical, high, medium, low)
 * - Status indicators (active, success, warning, danger)
 * - Module tags
 */

export type BadgeTone =
  | "critical"
  | "high"
  | "medium"
  | "low"
  | "info"
  | "active"
  | "success"
  | "warning"
  | "danger"
  | "neutral";

export interface BadgeProps {
  children: React.ReactNode;
  tone?: BadgeTone;
  variant?: "solid" | "outline" | "subtle";
  size?: "sm" | "md";
  className?: string;
}

export const Badge = React.memo(function Badge({
  children,
  tone = "neutral",
  variant = "subtle",
  size = "sm",
  className = "",
}: BadgeProps) {
  const color = getToneColor(tone);
  const fontSize = size === "sm" ? "10px" : "11px";
  const padding = size === "sm" ? "px-2 py-1" : "px-2.5 py-1.5";

  const styles: React.CSSProperties =
    variant === "solid"
      ? {
          backgroundColor: color,
          color: "#ffffff",
          border: "none",
        }
      : variant === "outline"
      ? {
          backgroundColor: "transparent",
          color,
          border: `1px solid ${color}`,
        }
      : {
          backgroundColor: `${color}14`,
          color,
          border: `1px solid ${color}55`,
        };

  return (
    <span
      className={`inline-flex items-center rounded-full font-medium uppercase tracking-[0.08em] ${padding} ${className}`}
      style={{ ...styles, fontSize }}
    >
      {children}
    </span>
  );
});

/**
 * StatusDot — Small colored dot indicator.
 */
export interface StatusDotProps {
  tone?: BadgeTone;
  size?: number;
  pulsing?: boolean;
  className?: string;
}

export const StatusDot = React.memo(function StatusDot({
  tone = "neutral",
  size = 6,
  pulsing = false,
  className = "",
}: StatusDotProps) {
  const color = getToneColor(tone);

  return (
    <span
      className={`inline-block rounded-full shrink-0 ${pulsing ? "animate-pulse" : ""} ${className}`}
      style={{
        width: size,
        height: size,
        backgroundColor: color,
        boxShadow: `0 0 ${size * 2}px ${color}88`,
      }}
    />
  );
});

/**
 * CountBadge — Numeric badge for counts/notifications.
 */
export interface CountBadgeProps {
  count: number;
  max?: number;
  tone?: BadgeTone;
  className?: string;
}

export const CountBadge = React.memo(function CountBadge({
  count,
  max = 99,
  tone = "danger",
  className = "",
}: CountBadgeProps) {
  const color = getToneColor(tone);
  const displayValue = count > max ? `${max}+` : count.toString();

  return (
    <span
      className={`inline-flex items-center justify-center min-w-[18px] h-[18px] px-1.5 rounded-full text-[10px] font-semibold ${className}`}
      style={{
        backgroundColor: color,
        color: "#ffffff",
      }}
    >
      {displayValue}
    </span>
  );
});
