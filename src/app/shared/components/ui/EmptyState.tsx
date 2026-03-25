import type { ReactNode } from "react";
import { colors, fontSize, fontWeight, radius } from "../../design-system/tokens";

export interface EmptyStateProps {
  /** Icon shown at center top */
  icon?: ReactNode;
  /** Primary message */
  title: string;
  /** Supporting description */
  description?: string;
  /** Optional CTA / action */
  action?: ReactNode;
  /** Extra class names */
  className?: string;
}

/**
 * EmptyState — Consistent zero-data fallback across all surfaces.
 *
 * Usage:
 *   <EmptyState
 *     icon={<Shield size={24} color={colors.textDim} />}
 *     title="No assets found"
 *     description="No assets match the current filters."
 *   />
 */
export function EmptyState({ icon, title, description, action, className = "" }: EmptyStateProps) {
  return (
    <div
      className={className}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "48px 24px",
        textAlign: "center",
        borderRadius: radius.lg,
        border: `1px dashed ${colors.border}`,
        background: "rgba(5,11,17,0.4)",
        gap: "8px",
      }}
    >
      {icon && (
        <div style={{ opacity: 0.5, marginBottom: "4px" }}>
          {icon}
        </div>
      )}
      <p
        style={{
          fontSize: fontSize.lg,
          fontWeight: fontWeight.medium,
          color: colors.textMuted,
          margin: 0,
        }}
      >
        {title}
      </p>
      {description && (
        <p
          style={{
            fontSize: fontSize.md,
            color: colors.textDim,
            margin: 0,
            maxWidth: "320px",
          }}
        >
          {description}
        </p>
      )}
      {action && <div style={{ marginTop: "8px" }}>{action}</div>}
    </div>
  );
}
