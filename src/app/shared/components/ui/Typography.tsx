import React from "react";
import { colors, fontSize } from "../../design-system/tokens";

/**
 * Typography — Text components with consistent styling.
 */

export interface TextProps {
  children: React.ReactNode;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  weight?: "normal" | "medium" | "semibold" | "bold";
  color?: keyof typeof colors;
  className?: string;
  as?: "p" | "span" | "div";
}

const fontWeightMap = {
  normal: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
};

export const Text = React.memo(function Text({
  children,
  size = "md",
  weight = "normal",
  color = "textSecondary",
  className = "",
  as = "p",
}: TextProps) {
  const Component = as;

  return (
    <Component
      className={className}
      style={{
        fontSize: fontSize[size],
        fontWeight: fontWeightMap[weight],
        color: colors[color],
      }}
    >
      {children}
    </Component>
  );
});

/**
 * Heading — Semantic heading with size variants.
 */
export interface HeadingProps {
  children: React.ReactNode;
  level?: 1 | 2 | 3 | 4;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const headingSizeMap = {
  sm: fontSize.md,
  md: fontSize.lg,
  lg: fontSize.xl,
  xl: "18px",
};

export const Heading = React.memo(function Heading({
  children,
  level = 2,
  size = "md",
  className = "",
}: HeadingProps) {
  const Tag = `h${level}` as keyof JSX.IntrinsicElements;

  return (
    <Tag
      className={`font-semibold tracking-[0.01em] ${className}`}
      style={{
        fontSize: headingSizeMap[size],
        color: colors.textPrimary,
      }}
    >
      {children}
    </Tag>
  );
});

/**
 * Label — Small descriptive text (eyebrows, captions).
 */
export interface LabelProps {
  children: React.ReactNode;
  uppercase?: boolean;
  className?: string;
}

export const Label = React.memo(function Label({
  children,
  uppercase = true,
  className = "",
}: LabelProps) {
  return (
    <span
      className={`${uppercase ? "uppercase" : ""} ${className}`}
      style={{
        fontSize: "10px",
        color: colors.textDim,
        letterSpacing: uppercase ? "0.12em" : "normal",
        fontWeight: 500,
      }}
    >
      {children}
    </span>
  );
});

/**
 * Code — Inline code or monospace text.
 */
export interface CodeProps {
  children: React.ReactNode;
  className?: string;
}

export const Code = React.memo(function Code({
  children,
  className = "",
}: CodeProps) {
  return (
    <code
      className={`font-mono rounded px-1 py-0.5 ${className}`}
      style={{
        fontSize: "10px",
        backgroundColor: "rgba(87,177,255,0.08)",
        color: colors.textSecondary,
      }}
    >
      {children}
    </code>
  );
});

/**
 * Truncate — Text with ellipsis overflow.
 */
export interface TruncateProps {
  children: React.ReactNode;
  lines?: number;
  className?: string;
}

export const Truncate = React.memo(function Truncate({
  children,
  lines = 1,
  className = "",
}: TruncateProps) {
  if (lines === 1) {
    return (
      <div className={`truncate ${className}`}>
        {children}
      </div>
    );
  }

  return (
    <div
      className={`overflow-hidden ${className}`}
      style={{
        display: "-webkit-box",
        WebkitLineClamp: lines,
        WebkitBoxOrient: "vertical",
      }}
    >
      {children}
    </div>
  );
});
