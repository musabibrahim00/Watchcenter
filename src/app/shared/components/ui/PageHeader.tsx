import type { ReactNode } from "react";
import { colors, fontSize, fontWeight } from "../../design-system/tokens";

export interface PageHeaderProps {
  /** Page icon (Lucide icon element or any ReactNode) */
  icon?: ReactNode;
  /** Primary page title */
  title: string;
  /** Supporting description shown below the title */
  subtitle?: string;
  /** Action buttons / controls shown at the trailing edge */
  actions?: ReactNode;
  /** Extra class names for the outer wrapper */
  className?: string;
}

/**
 * PageHeader — Consistent top-of-page header across all major surfaces.
 *
 * Usage:
 *   <PageHeader
 *     icon={<Shield size={18} color={colors.accent} />}
 *     title="Asset Register"
 *     subtitle="All monitored infrastructure endpoints"
 *     actions={<Button>Export</Button>}
 *   />
 */
export function PageHeader({ icon, title, subtitle, actions, className = "" }: PageHeaderProps) {
  return (
    <div
      className={className}
      style={{
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: "12px",
        marginBottom: "20px",
      }}
    >
      {/* Left: icon + text */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
        {icon && (
          <div
            style={{
              marginTop: "2px",
              flexShrink: 0,
              opacity: 0.9,
            }}
          >
            {icon}
          </div>
        )}
        <div>
          <h1
            style={{
              fontSize: "20px",
              fontWeight: fontWeight.semibold,
              color: colors.textPrimary,
              letterSpacing: "-0.02em",
              lineHeight: 1.2,
              margin: 0,
            }}
          >
            {title}
          </h1>
          {subtitle && (
            <p
              style={{
                fontSize: fontSize.lg,
                color: colors.textDim,
                marginTop: "3px",
                lineHeight: 1.4,
              }}
            >
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Right: actions */}
      {actions && (
        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
          {actions}
        </div>
      )}
    </div>
  );
}
