/**
 * Case Management Design Tokens
 * ===============================
 * 
 * Centralized color system matching Figma screenshots exactly.
 * Inherits from the global design system and adds module-specific tokens.
 * 
 * All values must align with the global tokens in
 * /src/app/shared/design-system/tokens.ts
 */

import { colors as globalColors } from "../../shared/design-system/tokens";

export const caseColors = {
  // ── Table Colors ──
  tableHeaderBg: globalColors.tableHeaderBg,
  tableRowDefaultBg: globalColors.tableRowBg,
  tableRowHoverBg: globalColors.tableRowHoverBg,
  
  // ── Card Colors ──
  cardDefaultBg: globalColors.bgCard,
  cardHoverBg: globalColors.bgCardHover,
  bgHover: globalColors.bgCardHover,
  
  // ── Primary Button States ──
  buttonPrimaryDefault: globalColors.buttonPrimary,
  buttonPrimaryHover: globalColors.buttonPrimaryHover,
  buttonPrimaryActive: globalColors.buttonPrimaryActive,
  buttonPrimaryDisabledBg: globalColors.buttonPrimaryDisabledBg,
  buttonPrimaryDisabledText: globalColors.buttonPrimaryDisabledText,
  
  // ── Borders & Dividers ──
  border: globalColors.border,
  borderSubtle: `${globalColors.border}80`,
  divider: globalColors.divider,
  
  // ── Text Colors ──
  textPrimary: "#dadfe3",
  textSecondary: "#89949e",
  textTertiary: "#62707d",
  
  // ── Gauge/Metric Colors ──
  optimal: "#34d399",
  caution: "#fb923c",
  critical: "#f87171",
  
  // ── Gauge track ──
  gaugeTrack: "rgba(71, 85, 105, 0.25)",
  
  // ── Severity Colors ──
  severityCritical: "#ef4444",
  severityHigh: "#f97316",
  severityMedium: "#f59e0b",
  severityLow: "#3b82f6",
  high: "#f97316",
  medium: "#f59e0b",
  low: "#3b82f6",
  
  // ── Background Colors ──
  bgDark: globalColors.bgDark,
  bgPage: globalColors.bgApp,
  bgApp: globalColors.bgApp,
  bgCard: globalColors.bgCard,
  
  // ── Accent ──
  accent: globalColors.accent,
  accentHover: globalColors.accentHover,
  
  // ── Hover States ──
  hoverOverlay: globalColors.hoverOverlay,
  hoverOverlayStrong: globalColors.hoverOverlayStrong,
} as const;

/**
 * Button style utilities
 */
export const buttonStyles = {
  primary: {
    default: {
      backgroundColor: caseColors.buttonPrimaryDefault,
      color: caseColors.textPrimary,
    },
    hover: {
      backgroundColor: caseColors.buttonPrimaryHover,
    },
    active: {
      backgroundColor: caseColors.buttonPrimaryActive,
    },
    disabled: {
      backgroundColor: caseColors.buttonPrimaryDisabledBg,
      color: caseColors.buttonPrimaryDisabledText,
      opacity: 0.2,
    },
  },
} as const;

/**
 * Card style utilities
 */
export const cardStyles = {
  default: {
    backgroundColor: caseColors.cardDefaultBg,
    border: `1px solid ${caseColors.border}`,
  },
  hover: {
    backgroundColor: caseColors.cardHoverBg,
  },
} as const;

/**
 * Table style utilities
 */
export const tableStyles = {
  header: {
    backgroundColor: caseColors.tableHeaderBg,
  },
  row: {
    default: {
      backgroundColor: caseColors.tableRowDefaultBg,
    },
    hover: {
      backgroundColor: caseColors.tableRowHoverBg,
    },
  },
} as const;
