/**
 * KPI Gauge Card — Re-export from shared design system.
 *
 * The canonical implementation lives at:
 *   /src/app/shared/components/ui/KPIGaugeCard.tsx
 *
 * This file exists for backward-compatible imports within
 * the Case Management module.
 */
export {
  KPIGaugeCard,
  SemiCircleGauge,
  TimeRangeSelector,
} from "../../shared/components/ui/KPIGaugeCard";
export type {
  KPIGaugeCardProps,
  SemiCircleGaugeProps,
  TimeRangeSelectorProps,
  TimeRangeOption,
} from "../../shared/components/ui/KPIGaugeCard";
