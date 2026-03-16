/**
 * Design System Tokens — Centralized design values for consistency.
 *
 * Single source of truth for the entire application.
 * All modules must use these tokens — no local color overrides.
 *
 * Modules enforced:
 * Watch Center, Control Center, Asset Register, Employees,
 * Risk Register, Attack Path, Vulnerabilities, Misconfigurations,
 * Case Management, Compliance, Integrations, Workflows,
 * Module Configurations, Settings, Profile
 */

/* ═══════════════════════════════════════════════════════════
   SPACING TOKENS
   ═══════════════════════════════════════════════════════════ */

export const spacing = {
  xs: "4px",
  sm: "8px",
  md: "12px",
  lg: "16px",
  xl: "24px",
  "2xl": "32px",
} as const;

export const spacingClasses = {
  xs: "4",
  sm: "8",
  md: "12",
  lg: "16",
  xl: "24",
  "2xl": "32",
} as const;

/* ═══════════════════════════════════════════════════════════
   COLOR TOKENS
   ═══════════════════════════════════════════════════════════ */

export const colors = {
  // ── Background colors ──
  /** Primary application background */
  bgApp: "#030A10",
  /** Card / panel default background */
  bgCard: "#050B11",
  /** Card / panel hover background */
  bgCardHover: "#071019",
  /** Deep dark background (gauge tracks, progress bar backgrounds) */
  bgDark: "#060c12",
  /** Semi-transparent panel background (Watch Center overlays) */
  bgPanel: "rgba(3,6,9,0.85)",
  bgPanelLight: "rgba(3,6,9,0.16)",
  bgOverlay: "rgba(3,6,9,0.95)",

  // ── Table colors ──
  /** Table header row background */
  tableHeaderBg: "#050B11",
  /** Table data row default background */
  tableRowBg: "#071019",
  /** Table data row hover background */
  tableRowHoverBg: "#0C161F",

  // ── Border & Divider ──
  /** Primary border color */
  border: "#0E1C26",
  /** Hover-state border */
  borderHover: "rgba(14,28,38,0.8)",
  /** Strong / emphasis border */
  borderStrong: "rgba(14,28,38,1)",
  /** Divider lines (lighter than border) */
  divider: "#0C1822",

  // ── Primary button states ──
  buttonPrimary: "#076498",
  buttonPrimaryHover: "#0781C2",
  buttonPrimaryActive: "#14A2E3",
  buttonPrimaryDisabledBg: "#0A2F47",
  buttonPrimaryDisabledText: "#0F496B",

  // ── Semantic severity colors ──
  critical: "#ff4d4f",
  high: "#ff7a1a",
  medium: "#f5b301",
  low: "#2bb7ff",
  info: "#7c8da6",

  // ── Status colors ──
  active: "#0ccf92",
  success: "#0ccf92",
  warning: "#ff9f43",
  danger: "#ff5f56",
  neutral: "#7c8da6",

  // ── Watch Center palette ──
  primary: "#076498",
  primaryHover: "#0781C2",
  primaryLight: "rgba(7,100,152,0.12)",

  // ── Accent ──
  accent: "#14a2e3",
  accentHover: "#0781C2",

  // ── Text colors ──
  textPrimary: "#eef3f8",
  textSecondary: "#dadfe3",
  textMuted: "#96a4b2",
  textDim: "#6e87a1",
  textWhite: "#f1f3ff",

  // ── Interactive states ──
  hoverBg: "#0C161F",
  hoverBgLight: "rgba(12,22,31,0.5)",
  hoverOverlay: "rgba(255,255,255,0.03)",
  hoverOverlayStrong: "rgba(255,255,255,0.05)",
} as const;

/* ═══════════════════════════════════════════════════════════
   BORDER RADIUS TOKENS
   ═══════════════════════════════════════════════════════════ */

export const radius = {
  xs: "4px",
  sm: "6px",
  md: "8px",
  lg: "12px",
  xl: "16px",
  "2xl": "18px",
  full: "9999px",
} as const;

export const radiusClasses = {
  xs: "4",
  sm: "6",
  md: "8",
  lg: "12",
  xl: "16",
  "2xl": "18",
  full: "9999",
} as const;

/* ═══════════════════════════════════════════════════════════
   TYPOGRAPHY TOKENS
   ═══════════════════════════════════════════════════════════ */

export const fontSize = {
  xs: "10px",
  sm: "11px",
  md: "12px",
  lg: "14px",
  xl: "16px",
} as const;

export const fontWeight = {
  normal: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
} as const;

/* ═══════════════════════════════════════════════════════════
   SHADOW TOKENS
   ═══════════════════════════════════════════════════════════ */

export const shadows = {
  sm: "0 0 0 1px rgba(0,0,0,0.08)",
  md: "0 4px 12px rgba(0,0,0,0.12)",
  lg: "0 8px 24px rgba(0,0,0,0.16)",
  glow: "0 0 24px rgba(87,177,255,0.3)",
} as const;

/* ═══════════════════════════════════════════════════════════
   Z-INDEX TOKENS
   ═══════════════════════════════════════════════════════════ */

export const zIndex = {
  base: 1,
  elevated: 10,
  dropdown: 50,
  overlay: 100,
  modal: 200,
  popover: 300,
  tooltip: 400,
} as const;

/* ═══════════════════════════════════════════════════════════
   HELPER FUNCTIONS
   ═══════════════════════════════════════════════════════════ */

/**
 * Get color for a severity/status level.
 */
export function getToneColor(
  tone: "critical" | "high" | "medium" | "low" | "info" | "active" | "success" | "warning" | "danger" | "neutral"
): string {
  return colors[tone] || colors.neutral;
}

/**
 * Apply alpha transparency to a hex color.
 */
export function withAlpha(hexColor: string, alpha: number): string {
  const alphaHex = Math.round(alpha * 255)
    .toString(16)
    .padStart(2, "0");
  return `${hexColor}${alphaHex}`;
}
