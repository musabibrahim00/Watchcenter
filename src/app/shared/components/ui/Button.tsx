import React from "react";
import { colors } from "../../design-system/tokens";

/**
 * Button — Standard action button with consistent styling.
 *
 * Variants:
 * - primary: Blue filled button for main actions
 * - secondary: Subtle hover-only background
 * - ghost: Transparent with hover state
 * - danger: Red filled for destructive actions
 */

export interface ButtonProps {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  fullWidth?: boolean;
}

const sizeClasses = {
  sm: "h-[20px] px-[8px] text-[10px]",
  md: "h-[24px] px-[12px] text-[10px]",
  lg: "h-[32px] px-[16px] text-[11px]",
};

export const Button = React.memo(function Button({
  children,
  variant = "primary",
  size = "md",
  onClick,
  disabled = false,
  className = "",
  fullWidth = false,
}: ButtonProps) {
  const baseClasses =
    "relative rounded-[6px] shrink-0 transition-colors font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[12px] text-center whitespace-nowrap cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed";

  const variantClasses =
    variant === "primary"
      ? "min-w-[84px] bg-[#076498] text-[#f1f3ff] hover:bg-[#0781C2] disabled:hover:bg-[#076498]"
      : variant === "secondary"
      ? "bg-transparent text-[#f1f3ff] hover:bg-[#0C161F] disabled:hover:bg-transparent"
      : variant === "ghost"
      ? "bg-transparent text-[#96a4b2] hover:text-[#dadfe3] hover:bg-[rgba(12,22,31,0.5)] disabled:hover:bg-transparent"
      : variant === "danger"
      ? "min-w-[84px] bg-[#ff4d4f] text-white hover:bg-[#ff7875] disabled:hover:bg-[#ff4d4f]"
      : "";

  const widthClass = fullWidth ? "w-full" : "";

  return (
    <button
      className={`${baseClasses} ${variantClasses} ${sizeClasses[size]} ${widthClass} ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      <div className="flex items-center justify-center h-full gap-[8px]">{children}</div>
    </button>
  );
});

/**
 * ActionButton — Specialized button for AI module actions.
 * Integrates with AiBox action context.
 */
export interface ActionButtonProps {
  label: string;
  variant?: "primary" | "secondary";
  onAction?: (label: string) => void;
  className?: string;
}

export const ActionButton = React.memo(function ActionButton({
  label,
  variant = "primary",
  onAction,
  className = "",
}: ActionButtonProps) {
  const isPrimary = variant === "primary";

  return (
    <div
      className={`h-[24px] relative rounded-[6px] min-w-0 transition-colors cursor-pointer ${
        isPrimary
          ? "min-w-[84px] bg-[#076498] hover:bg-[#0781C2]"
          : "hover:bg-[#0C161F]"
      } ${className}`}
      onClick={onAction ? () => onAction(label) : undefined}
    >
      <div
        className={`bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex h-full items-center justify-center relative ${
          isPrimary ? "gap-[12px] min-w-[inherit] p-[8px]" : "px-[12px] py-[8px]"
        }`}
      >
        <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[12px] not-italic relative shrink-0 text-[#f1f3ff] text-[10px] text-center whitespace-nowrap overflow-hidden text-ellipsis">
          {label}
        </p>
      </div>
    </div>
  );
});

/**
 * IconButton — Small button for icon-only actions.
 */
export interface IconButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  size?: number;
  className?: string;
  title?: string;
}

export const IconButton = React.memo(function IconButton({
  children,
  onClick,
  disabled = false,
  size = 20,
  className = "",
  title,
}: IconButtonProps) {
  return (
    <button
      className={`rounded-[4px] flex items-center justify-center hover:bg-[#0C161F] transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-default ${className}`}
      style={{ width: size, height: size }}
      onClick={onClick}
      disabled={disabled}
      title={title}
    >
      {children}
    </button>
  );
});

/**
 * ButtonGroup — Horizontal group of related buttons.
 */
export interface ButtonGroupProps {
  children: React.ReactNode;
  className?: string;
  spacing?: "sm" | "md";
  justify?: "start" | "end" | "between";
  /** Allow buttons to wrap onto next line (default: false) */
  wrap?: boolean;
}

export const ButtonGroup = React.memo(function ButtonGroup({
  children,
  className = "",
  spacing = "sm",
  justify = "start",
  wrap = false,
}: ButtonGroupProps) {
  const gap = spacing === "sm" ? "gap-[8px]" : "gap-[12px]";
  const justifyClass =
    justify === "between" ? "justify-between" : justify === "end" ? "justify-end" : "";
  const wrapClass = wrap ? "flex-wrap" : "";

  return <div className={`flex items-center ${gap} ${wrapClass} max-w-full overflow-hidden ${justifyClass} ${className}`}>{children}</div>;
});