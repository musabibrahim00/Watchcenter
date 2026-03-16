/**
 * ChartContainer
 * ==============
 * 
 * Fixed-height container for all charts across the application.
 * Prevents vertical expansion and ensures consistent chart sizing.
 * 
 * Safety Rules:
 * - Fixed height (default: 320px)
 * - No vertical expansion
 * - Hidden overflow
 * - Charts scale to width but never height
 */

import React from "react";

interface ChartContainerProps {
  children: React.ReactNode;
  /** Chart height in pixels (default: 320) */
  height?: number;
}

export function ChartContainer({ children, height = 320 }: ChartContainerProps) {
  return (
    <div
      style={{
        height: `${height}px`,
        minHeight: `${height}px`,
        maxHeight: `${height}px`,
        overflow: "hidden",
      }}
    >
      {children}
    </div>
  );
}
