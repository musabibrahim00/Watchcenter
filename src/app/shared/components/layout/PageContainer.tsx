/**
 * PageContainer
 * =============
 * 
 * Global page container wrapper that enforces layout safety rules
 * across all application pages.
 * 
 * Safety Rules:
 * - Prevents horizontal overflow
 * - Enforces flex column layout
 * - Provides consistent padding
 * - Ensures content scrolls within viewport
 */

import React from "react";

interface PageContainerProps {
  children: React.ReactNode;
  /** Optional padding override (default: 24px) */
  padding?: string;
  /** Optional max-width constraint */
  maxWidth?: string;
}

export function PageContainer({ 
  children, 
  padding = "24px",
  maxWidth = "100%"
}: PageContainerProps) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        maxWidth,
        width: "100%",
        overflowX: "hidden",
        padding,
      }}
    >
      {children}
    </div>
  );
}
