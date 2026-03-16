/**
 * DashboardGrid
 * =============
 * 
 * Grid layout wrapper for dashboard cards with layout safety rules.
 * 
 * Safety Rules:
 * - Prevents vertical stretching (align-items: start)
 * - Responsive columns with minimum card width
 * - Consistent gap spacing
 */

import React from "react";

interface DashboardGridProps {
  children: React.ReactNode;
  /** Number of columns (e.g., 2, 3, 4) or 'auto-fit' */
  columns?: number | "auto-fit";
  /** Gap spacing in pixels (default: 16) */
  gap?: number;
  /** Minimum card width for auto-fit (default: 320) */
  minCardWidth?: number;
}

export function DashboardGrid({ 
  children, 
  columns = "auto-fit",
  gap = 16,
  minCardWidth = 320
}: DashboardGridProps) {
  const gridTemplateColumns = columns === "auto-fit" 
    ? `repeat(auto-fit, minmax(${minCardWidth}px, 1fr))`
    : `repeat(${columns}, 1fr)`;

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns,
        gap: `${gap}px`,
        alignItems: "start",
      }}
    >
      {children}
    </div>
  );
}
