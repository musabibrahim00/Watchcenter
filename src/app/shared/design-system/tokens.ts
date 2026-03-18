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
  bgCard: "#071420",
  /** Card / panel hover background */
  bgCardHover: "#0A1C2E",
  /** Deep dark background (gauge tracks, progress bar backgrounds) */
  bgDark: "#050c14",
  /** Semi-transparent panel background (Watch Center overlays) */
  bgPanel: "rgba(7,20,32,0.92)",
  bgPanelLight: "rgba(7,20,32,0.18)",
  bgOverlay: "rgba(3,6,9,0.97)",

  // ── Table colors ──
  /** Table header row background */
  tableHeaderBg: "#071420",
  /** Table data row default background */
  tableRowBg: "#0A1828",
  /** Table data row hover background */
  tableRowHoverBg: "#0F1E2C",

  // ── Border & Divider ──
  /** Primary border color */
  border: "#132638",
  /** Hover-state border */
  borderHover: "rgba(19,38,56,0.8)",
  /** Strong / emphasis border */
  borderStrong: "rgba(19,38,56,1)",
  /** Divider lines (lighter than border) */
  divider: "#0F1E2C",

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
  textMuted: "#a8b6c4",
  textDim: "#7e97b0",
  textWhite: "#f1f3ff",

  // ── Interactive states ──
  hoverBg: "#0F1E2C",
  hoverBgLight: "rgba(15,30,44,0.5)",
  hoverOverlay: "rgba(255,255,255,0.04)",
  hoverOverlayStrong: "rgba(255,255,255,0.06)",
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
  sm: "0 2px 6px rgba(0,0,0,0.36), 0 0 0 1px rgba(255,255,255,0.04)",
  md: "0 4px 16px rgba(0,0,0,0.44)",
  lg: "0 8px 32px rgba(0,0,0,0.52)",
  card: "0 2px 8px rgba(0,0,0,0.40), inset 0 1px 0 rgba(255,255,255,0.04)",
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
