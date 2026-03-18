import type { ReactNode } from "react";
import { colors, fontSize, fontWeight, radius } from "../../design-system/tokens";

export interface SectionLabelProps {
  /** Leading icon */
  icon?: ReactNode;
  /** Section label text */
  label: string;
  /** Optional inline count badge */
  count?: number;
  /** Optional supporting description */
  description?: string;
  /** Extra class names for the outer wrapper */
  className?: string;
}

/**
 * SectionLabel — Consistent section heading with optional icon, count, and description.
 *
 * Usage:
 *   <SectionLabel
 *     icon={<AlertTriangle size={13} color={colors.critical} />}
 *     label="Critical Gaps"
 *     count={3}
 *     description="Controls failing across monitored assets"
 *   />
 */
export function SectionLabel({ icon, label, count, description, className = "" }: SectionLabelProps) {
  return (
    <div className={className} style={{ marginBottom: "12px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
        {icon && (
          <span style={{ flexShrink: 0, opacity: 0.85, display: "flex", alignItems: "center" }}>
            {icon}
          </span>
        )}
        <span
          style={{
            fontSize: fontSize.sm,
            fontWeight: fontWeight.semibold,
            color: colors.textMuted,
            textTransform: "uppercase",
            letterSpacing: "0.06em",
          }}
        >
          {label}
        </span>
        {count !== undefined && (
          <span
            style={{
              fontSize: "10px",
              fontWeight: fontWeight.semibold,
              color: colors.textDim,
              background: "rgba(255,255,255,0.06)",
              border: `1px solid rgba(255,255,255,0.08)`,
              borderRadius: radius.full,
              padding: "1px 6px",
              lineHeight: 1.5,
            }}
          >
            {count}
          </span>
        )}
      </div>
      {description && (
        <p
          style={{
            fontSize: fontSize.md,
            color: colors.textDim,
            marginTop: "2px",
            marginLeft: icon ? "19px" : "0",
          }}
        >
          {description}
        </p>
      )}
    </div>
  );
}
