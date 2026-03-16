import React from "react";
import { colors } from "../../design-system/tokens";

/**
 * Divider — Visual separator between sections.
 */

export interface DividerProps {
  orientation?: "horizontal" | "vertical";
  spacing?: "sm" | "md" | "lg";
  opacity?: number;
  className?: string;
}

const spacingMap = {
  sm: { horizontal: "my-[8px]", vertical: "mx-[8px]" },
  md: { horizontal: "my-[12px]", vertical: "mx-[12px]" },
  lg: { horizontal: "my-[16px]", vertical: "mx-[16px]" },
};

export const Divider = React.memo(function Divider({
  orientation = "horizontal",
  spacing = "md",
  opacity = 0.1,
  className = "",
}: DividerProps) {
  const isHorizontal = orientation === "horizontal";
  const spacingClass = spacingMap[spacing][orientation];

  return (
    <div
      className={`${spacingClass} ${isHorizontal ? "w-full h-px" : "w-px h-full"} ${className}`}
      style={{
        backgroundColor: `rgba(87,177,255,${opacity})`,
      }}
    />
  );
});

/**
 * SectionDivider — Labeled divider for major section breaks.
 */
export interface SectionDividerProps {
  label?: string;
  className?: string;
}

export const SectionDivider = React.memo(function SectionDivider({
  label,
  className = "",
}: SectionDividerProps) {
  if (label) {
    return (
      <div className={`flex items-center gap-3 my-4 ${className}`}>
        <div
          className="flex-1 h-px"
          style={{ backgroundColor: "rgba(87,177,255,0.1)" }}
        />
        <span
          className="text-[10px] uppercase tracking-[0.12em] font-medium"
          style={{ color: colors.textDim }}
        >
          {label}
        </span>
        <div
          className="flex-1 h-px"
          style={{ backgroundColor: "rgba(87,177,255,0.1)" }}
        />
      </div>
    );
  }

  return (
    <div
      className={`w-full h-px my-4 ${className}`}
      style={{ backgroundColor: "rgba(87,177,255,0.1)" }}
    />
  );
});
