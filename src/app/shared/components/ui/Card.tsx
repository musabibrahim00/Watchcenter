import React from "react";
import { colors, radius, shadows } from "../../design-system/tokens";

/**
 * Card — Base container component with consistent styling.
 *
 * Features:
 * - Standard Watch Center dark panel background
 * - Gradient border with customizable color
 * - Optional glow effect
 * - Flexible padding control
 */

export interface CardProps {
  children: React.ReactNode;
  /** Padding size: 'none' | 'sm' | 'md' | 'lg' */
  padding?: "none" | "sm" | "md" | "lg";
  /** Custom className for additional styling */
  className?: string;
  /** Border radius override */
  rounded?: keyof typeof radius;
  /** Enable glow effect */
  glow?: boolean;
  /** Border color (defaults to standard blue border) */
  borderColor?: string;
  /** Background color override */
  background?: string;
  /** Data attribute for Figma instrumentation */
  "data-name"?: string;
}

const paddingMap = {
  none: "",
  sm: "p-[8px]",
  md: "p-[12px]",
  lg: "p-[16px]",
};

export const Card = React.memo(function Card({
  children,
  padding = "md",
  className = "",
  rounded = "2xl",
  glow = false,
  borderColor = colors.border,
  background = colors.bgCard,
  "data-name": dataName,
}: CardProps) {
  const borderRadius = radius[rounded];

  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={{ borderRadius, background }}
      data-name={dataName}
    >
      {/* Content */}
      <div
        className={`relative ${paddingMap[padding]} size-full`}
        style={{ borderRadius: "inherit" }}
      >
        {children}
      </div>

      {/* Border overlay */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{
          borderRadius,
          border: `1px solid ${borderColor}`,
          boxShadow: glow ? "0 0 24px rgba(87,177,255,0.3)" : shadows.card,
        }}
      />
    </div>
  );
});

/**
 * CardHeader — Standard header section with title and optional actions.
 */
export interface CardHeaderProps {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  actions?: React.ReactNode;
  className?: string;
}

export const CardHeader = React.memo(function CardHeader({
  title,
  subtitle,
  eyebrow,
  actions,
  className = "",
}: CardHeaderProps) {
  return (
    <div className={`flex items-start justify-between gap-3 ${className}`}>
      <div className="min-w-0 flex-1">
        {eyebrow && (
          <div
            className="mb-1 uppercase tracking-[0.12em]"
            style={{
              fontSize: "10px",
              color: colors.textDim,
            }}
          >
            {eyebrow}
          </div>
        )}
        <h3
          className="truncate font-semibold tracking-[0.01em]"
          style={{
            fontSize: "12px",
            color: colors.textPrimary,
          }}
        >
          {title}
        </h3>
        {subtitle && (
          <p
            className="mt-1"
            style={{
              fontSize: "10px",
              color: colors.textMuted,
              lineHeight: "1.4",
            }}
          >
            {subtitle}
          </p>
        )}
      </div>
      {actions && <div className="shrink-0">{actions}</div>}
    </div>
  );
});

/**
 * CardContent — Main content area with standard spacing.
 */
export interface CardContentProps {
  children: React.ReactNode;
  className?: string;
}

export const CardContent = React.memo(function CardContent({
  children,
  className = "",
}: CardContentProps) {
  return <div className={`mt-3 ${className}`}>{children}</div>;
});

/**
 * CardFooter — Footer section for actions or metadata.
 */
export interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
  withDivider?: boolean;
}

export const CardFooter = React.memo(function CardFooter({
  children,
  className = "",
  withDivider = false,
}: CardFooterProps) {
  return (
    <div
      className={`mt-4 ${className}`}
      style={{
        borderTop: withDivider ? `1px solid rgba(87,177,255,0.10)` : undefined,
        paddingTop: withDivider ? "12px" : undefined,
      }}
    >
      {children}
    </div>
  );
});

/**
 * PanelCard — Pre-configured card for AI module panels.
 * Uses standard panel styling with blur effect.
 */
export const PanelCard = React.memo(function PanelCard({
  children,
  className = "",
  padding = "none",
  ...props
}: Omit<CardProps, "background" | "rounded">) {
  const padClass = paddingMap[padding] || "";

  return (
    <div
      className={`rounded-[18px] border border-[rgba(87,177,255,0.20)] bg-[rgba(7,20,32,0.92)] text-[#dadfe3] shadow-[0_2px_8px_rgba(0,0,0,0.40),inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-sm overflow-hidden ${padClass} ${className}`}
      data-name={props["data-name"]}
    >
      {children}
    </div>
  );
});