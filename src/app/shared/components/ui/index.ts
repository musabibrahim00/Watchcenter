/**
 * Shared UI Components — Centralized design system primitives.
 *
 * All base UI components that are reused across the application.
 */

/* ── Layout & Containers ── */
export {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
  PanelCard,
} from "./Card";
export type { CardProps, CardHeaderProps, CardContentProps, CardFooterProps } from "./Card";

/* ── Buttons ── */
export {
  Button,
  ActionButton,
  IconButton,
  ButtonGroup,
} from "./Button";
export type {
  ButtonProps,
  ActionButtonProps,
  IconButtonProps,
  ButtonGroupProps,
} from "./Button";

/* ── Badges & Status ── */
export {
  Badge,
  StatusDot,
  CountBadge,
} from "./Badge";
export type {
  BadgeProps,
  BadgeTone,
  StatusDotProps,
  CountBadgeProps,
} from "./Badge";

/* ── Dividers ── */
export {
  Divider,
  SectionDivider,
} from "./Divider";
export type { DividerProps, SectionDividerProps } from "./Divider";

/* ── Metrics ── */
export {
  MetricTile,
  MetricGrid,
  StatRow,
} from "./MetricTile";
export type {
  MetricTileProps,
  MetricGridProps,
  StatRowProps,
} from "./MetricTile";

/* ── Typography ── */
export {
  Text,
  Heading,
  Label,
  Code,
  Truncate,
} from "./Typography";
export type {
  TextProps,
  HeadingProps,
  LabelProps,
  CodeProps,
  TruncateProps,
} from "./Typography";

/* ── KPI Gauge ── */
export { KPIGaugeCard, SemiCircleGauge, TimeRangeSelector } from "./KPIGaugeCard";
export type { KPIGaugeCardProps, SemiCircleGaugeProps, TimeRangeSelectorProps, TimeRangeOption } from "./KPIGaugeCard";

/* ── Layout Helpers ── */
export { PageHeader } from "./PageHeader";
export type { PageHeaderProps } from "./PageHeader";

export { SectionLabel } from "./SectionLabel";
export type { SectionLabelProps } from "./SectionLabel";

export { EmptyState } from "./EmptyState";
export type { EmptyStateProps } from "./EmptyState";

/* ── Design Tokens ── */
export * from "../../design-system/tokens";