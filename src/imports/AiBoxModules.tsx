import React from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import attackPathSvg from "./svg-2bhotbjgps";
import {
  PanelCard,
  CardHeader,
  CardContent,
  CardFooter,
  Badge,
  ActionButton as SharedActionButton,
  ButtonGroup,
  MetricGrid,
  StatRow,
  Divider,
  getToneColor,
  colors,
  DeferredChart,
} from "../app/shared/components";

export type Severity = "critical" | "high" | "medium" | "low" | "info";
export type StatusTone = "neutral" | "active" | "success" | "warning" | "danger";

/* ── Action Context ── */
const AiBoxActionContext = React.createContext<((label: string) => void) | null>(null);

export function AiBoxActionProvider({ onAction, children }: { onAction: (label: string) => void; children: React.ReactNode }) {
  const stableAction = React.useCallback(onAction, [onAction]);
  return <AiBoxActionContext.Provider value={stableAction}>{children}</AiBoxActionContext.Provider>;
}

function useAction() {
  return React.useContext(AiBoxActionContext);
}

/* ── Specialized Action Button for AI modules ── */
const ActionButton = React.memo(function ActionButton({
  label,
  tone = "neutral",
  subtle = false,
}: {
  label: string;
  tone?: Severity | StatusTone;
  subtle?: boolean;
}) {
  const onAction = useAction();
  return (
    <SharedActionButton
      label={label}
      variant={subtle ? "secondary" : "primary"}
      onAction={onAction || undefined}
    />
  );
});

export interface InsightCardProps {
  module: string;
  severity: Severity;
  title: string;
  description: string;
  supportingStats?: Array<{ label: string; value: string }>;
  actions?: string[];
}

export const InsightCard = React.memo(function InsightCard({
  module,
  severity,
  title,
  description,
  supportingStats = [],
  actions = [],
}: InsightCardProps) {
  return (
    <PanelCard padding="lg">
      <CardHeader
        title={title}
        eyebrow={module}
        actions={<Badge tone={severity}>{severity}</Badge>}
      />
      <CardContent>
        <p className="text-[10px] leading-[1.45]" style={{ color: colors.textMuted }}>
          {description}
        </p>
      </CardContent>
      {supportingStats.length > 0 && (
        <CardFooter withDivider>
          <MetricGrid columns={2} gap="md">
            {supportingStats.map((stat) => (
              <div key={stat.label}>
                <div className="text-[10px] uppercase tracking-[0.08em]" style={{ color: colors.textDim }}>
                  {stat.label}
                </div>
                <div className="mt-1 text-[12px] font-semibold" style={{ color: colors.textPrimary }}>
                  {stat.value}
                </div>
              </div>
            ))}
          </MetricGrid>
        </CardFooter>
      )}
      {actions.length > 0 && (
        <CardFooter>
          <div className="flex flex-col gap-[16px]">
            {/* Row 1: Primary button(s) */}
            <div className="flex items-center gap-[8px]">
              <ActionButton
                label={actions[0]}
                tone={severity}
              />
              {actions.length > 1 && actions[1] && (
                <ActionButton
                  label={actions[1]}
                  tone="neutral"
                  subtle
                />
              )}
            </div>
            {/* Row 2: Tertiary action link (if present) */}
            {actions.length > 2 && actions[2] && (
              <div className="flex items-center">
                <ActionButton
                  label={actions[2]}
                  tone="neutral"
                  subtle
                />
              </div>
            )}
          </div>
        </CardFooter>
      )}
    </PanelCard>
  );
});

export interface DecisionCardProps {
  title: string;
  module: string;
  severity: Severity;
  whyItMatters: string;
  impact: string;
  primaryAction: string;
  secondaryAction?: string;
  tertiaryAction?: string;
}

export const DecisionCard = React.memo(function DecisionCard({
  title,
  module,
  severity,
  whyItMatters,
  impact,
  primaryAction,
  secondaryAction,
  tertiaryAction,
}: DecisionCardProps) {
  return (
    <PanelCard padding="lg">
      <CardHeader
        title={title}
        eyebrow={module}
        actions={<Badge tone={severity}>{severity}</Badge>}
      />
      <CardContent>
        <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-start">
          <div>
            <div className="text-[10px] uppercase tracking-[0.08em]" style={{ color: colors.textDim }}>
              Why this matters
            </div>
            <p className="mt-1 text-[10px] leading-[1.45]" style={{ color: colors.textMuted }}>
              {whyItMatters}
            </p>
          </div>
          <div
            className="rounded-[14px] border px-3 py-2"
            style={{
              borderColor: "rgba(87,177,255,0.12)",
              backgroundColor: "rgba(255,255,255,0.02)",
            }}
          >
            <div className="text-[10px] uppercase tracking-[0.08em]" style={{ color: colors.textDim }}>
              Impact
            </div>
            <div className="mt-1 text-[12px] font-semibold" style={{ color: colors.textPrimary }}>
              {impact}
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <div className="flex items-center justify-between max-w-full overflow-hidden">
          <div className="flex items-center gap-[8px] min-w-0">
            <ActionButton label={primaryAction} tone={severity} />
          </div>
          {(secondaryAction || tertiaryAction) && (
            <div className="flex items-center gap-[8px] min-w-0">
              {secondaryAction && <ActionButton label={secondaryAction} subtle />}
              {tertiaryAction && <ActionButton label={tertiaryAction} subtle />}
            </div>
          )}
        </div>
      </CardFooter>
    </PanelCard>
  );
});

export interface TimelineStep {
  id: string;
  analyst: string;
  action: string;
  detail?: string;
  tone?: Severity | StatusTone;
}

export interface InvestigationTimelineProps {
  title: string;
  status?: string;
  steps: TimelineStep[];
}

export const InvestigationTimeline = React.memo(function InvestigationTimeline({
  title,
  status = "active",
  steps,
}: InvestigationTimelineProps) {
  return (
    <PanelCard padding="lg">
      <CardHeader
        title={title}
        eyebrow="Investigation Flow"
        actions={
          <Badge tone={status === "complete" ? "success" : "warning"}>
            {status}
          </Badge>
        }
      />
      <CardContent>
        <div className="space-y-3">
          {steps.map((step, index) => {
            const color = getToneColor(step.tone ?? "info");
            const isLast = index === steps.length - 1;
            return (
              <div key={step.id} className="flex gap-3">
                <div className="flex w-5 shrink-0 flex-col items-center">
                  <span
                    className="mt-[3px] h-[10px] w-[10px] rounded-full border"
                    style={{
                      backgroundColor: `${color}22`,
                      borderColor: color,
                      boxShadow: `0 0 12px ${color}40`,
                    }}
                  />
                  {!isLast && (
                    <span
                      className="mt-1 w-px flex-1"
                      style={{ backgroundColor: "rgba(255,255,255,0.08)" }}
                    />
                  )}
                </div>
                <div className="pb-3">
                  <div className="text-[12px] font-semibold" style={{ color: colors.textPrimary }}>
                    {step.analyst}
                  </div>
                  <div className="mt-1 text-[10px]" style={{ color: "#cfd8e3" }}>
                    {step.action}
                  </div>
                  {step.detail && (
                    <div className="mt-1 text-[10px] leading-[1.4]" style={{ color: "#7f93a7" }}>
                      {step.detail}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </PanelCard>
  );
});

export interface MetricsSummaryProps {
  title?: string;
  metrics: Array<{
    label: string;
    value: string;
    delta?: string;
    trend?: "up" | "down" | "neutral";
  }>;
  progressLabel?: string;
  progressValue?: number;
}

export const MetricsSummary = React.memo(function MetricsSummary({
  title = "Insights",
  metrics,
  progressLabel,
  progressValue,
}: MetricsSummaryProps) {
  return (
    <PanelCard padding="lg">
      <CardHeader title={title} eyebrow="Last 24H" />
      <CardContent>
        <div className="space-y-3">
          {metrics.map((metric) => {
            const trendColor =
              metric.trend === "up"
                ? colors.success
                : metric.trend === "down"
                ? colors.danger
                : colors.textMuted;
            return (
              <div
                key={metric.label}
                className="flex items-center justify-between gap-4 text-[10px]"
              >
                <div style={{ color: colors.textMuted }}>{metric.label}</div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold" style={{ color: colors.textPrimary }}>
                    {metric.value}
                  </span>
                  {metric.delta && <span style={{ color: trendColor }}>{metric.delta}</span>}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
      {typeof progressValue === "number" && progressLabel && (
        <CardFooter withDivider>
          <div className="mb-2 flex items-center justify-between text-[10px]" style={{ color: colors.textMuted }}>
            <span>{progressLabel}</span>
            <span className="font-semibold" style={{ color: colors.textPrimary }}>
              {progressValue}%
            </span>
          </div>
          <div className="h-[6px] overflow-hidden rounded-full bg-[rgba(255,255,255,0.06)]">
            <div
              className="h-full rounded-full bg-[linear-gradient(90deg,#0ea5ff_0%,#0ccf92_100%)]"
              style={{ width: `${progressValue}%` }}
            />
          </div>
        </CardFooter>
      )}
    </PanelCard>
  );
});

/* ── TrendChart Component ── */
export interface TrendChartProps {
  title: string;
  data: Array<{ label: string; value: number; baseline?: number }>;
  yLabel?: string;
}

export const TrendChart = React.memo(function TrendChart({ title, data, yLabel }: TrendChartProps) {
  const gradId = React.useId();
  const safeData = data.map((d, idx) => ({ ...d, key: `${d.label}-${idx}` }));
  const hasBaseline = safeData.some((d) => typeof d.baseline === "number");

  return (
    <PanelCard padding="lg">
      <CardHeader title={title} eyebrow="Trend Analysis" />
      <CardContent>
        <div style={{ width: "100%", height: 180 }}>
          <DeferredChart>
            <LineChart data={safeData} key="line-chart">
              <defs key="defs">
                <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1" key={gradId}>
                  <stop offset="0%" stopColor="#0ea5ff" stopOpacity={0.8} key="stop-0" />
                  <stop offset="100%" stopColor="#0ea5ff" stopOpacity={0.1} key="stop-1" />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" key="grid" />
              <XAxis
                dataKey="label"
                stroke={colors.textMuted}
                tick={{ fill: colors.textMuted, fontSize: 10 }}
                key="x-axis"
              />
              <YAxis
                stroke={colors.textMuted}
                tick={{ fill: colors.textMuted, fontSize: 10 }}
                label={yLabel ? { value: yLabel, angle: -90, position: "insideLeft", fill: colors.textDim, fontSize: 10 } : undefined}
                key="y-axis"
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: colors.bgPanel,
                  border: `1px solid ${colors.border}`,
                  borderRadius: "8px",
                  fontSize: "10px",
                }}
                key="tooltip"
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#0ea5ff"
                strokeWidth={2}
                dot={{ fill: "#0ea5ff", r: 3 }}
                key="line-value"
              />
              {hasBaseline && (
                <Line
                  type="monotone"
                  dataKey="baseline"
                  stroke={colors.textDim}
                  strokeWidth={1}
                  strokeDasharray="5 5"
                  dot={false}
                  key="line-baseline"
                />
              )}
            </LineChart>
          </DeferredChart>
        </div>
      </CardContent>
    </PanelCard>
  );
});

/* ── AttackPathGraph Component ── */
export interface AttackPathGraphProps {
  title: string;
  stats: {
    vulnerabilities: { critical: number; high: number; medium: number; low: number };
    misconfiguration: { critical: number; high: number; medium: number; low: number };
  };
  chartData: Array<{ week: string; vuln: number; misconfig: number }>;
}

export const AttackPathGraph = React.memo(function AttackPathGraph({ title, stats, chartData }: AttackPathGraphProps) {
  const { vulnerabilities: v, misconfiguration: m } = stats;
  
  // Generate unique IDs for gradients to avoid conflicts with multiple instances
  const gradientId = React.useId();
  const vulnGradId = `vulnGrad-${gradientId}`;
  const misconfigGradId = `misconfigGrad-${gradientId}`;

  return (
    <PanelCard padding="lg">
      <CardHeader title={title} eyebrow="Attack Surface" />
      <CardContent>
        <div className="relative">
          {/* SVG Chart */}
          <div style={{ width: "100%", height: 140 }}>
            <DeferredChart>
              <AreaChart data={chartData} key={`area-chart-${gradientId}`}>
                <defs key={`defs-${gradientId}`}>
                  <linearGradient id={vulnGradId} x1="0" y1="0" x2="0" y2="1" key={vulnGradId}>
                    <stop offset="0%" stopColor="#ff4d4f" stopOpacity={0.4} key={`${vulnGradId}-stop-0`} />
                    <stop offset="100%" stopColor="#ff4d4f" stopOpacity={0.05} key={`${vulnGradId}-stop-1`} />
                  </linearGradient>
                  <linearGradient id={misconfigGradId} x1="0" y1="0" x2="0" y2="1" key={misconfigGradId}>
                    <stop offset="0%" stopColor="#ff7a1a" stopOpacity={0.4} key={`${misconfigGradId}-stop-0`} />
                    <stop offset="100%" stopColor="#ff7a1a" stopOpacity={0.05} key={`${misconfigGradId}-stop-1`} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" key={`grid-${gradientId}`} />
                <XAxis dataKey="week" stroke={colors.textMuted} tick={{ fill: colors.textMuted, fontSize: 10 }} key={`xaxis-${gradientId}`} />
                <YAxis stroke={colors.textMuted} tick={{ fill: colors.textMuted, fontSize: 10 }} key={`yaxis-${gradientId}`} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: colors.bgPanel,
                    border: `1px solid ${colors.border}`,
                    borderRadius: "8px",
                    fontSize: "10px",
                  }}
                  key={`tooltip-${gradientId}`}
                />
                <Area type="monotone" dataKey="vuln" stroke="#ff4d4f" fill={`url(#${vulnGradId})`} key={`area-vuln-${gradientId}`} />
                <Area type="monotone" dataKey="misconfig" stroke="#ff7a1a" fill={`url(#${misconfigGradId})`} key={`area-misconfig-${gradientId}`} />
              </AreaChart>
            </DeferredChart>
          </div>

          {/* KPI Stats Overlay (hover to reveal) */}
          <div className="absolute inset-0 flex items-start justify-center transition-all duration-300 hover:bg-[rgba(3,6,9,0.92)] group">
            <div className="grid grid-cols-2 gap-4 p-4 max-h-0 opacity-0 overflow-hidden transition-all duration-300 group-hover:max-h-[200px] group-hover:opacity-100">
              {/* Vulnerabilities */}
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider" style={{ fontFamily: "'Roboto Mono', monospace", color: "#ff4d4f" }}>
                  Vulnerabilities
                </div>
                <div className="mt-2 space-y-1">
                  <StatRow label="Critical" value={v.critical.toString()} />
                  <StatRow label="High" value={v.high.toString()} />
                  <StatRow label="Medium" value={v.medium.toString()} />
                  <StatRow label="Low" value={v.low.toString()} />
                </div>
              </div>
              {/* Misconfiguration */}
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider" style={{ fontFamily: "'Roboto Mono', monospace", color: "#ff7a1a" }}>
                  Misconfiguration
                </div>
                <div className="mt-2 space-y-1">
                  <StatRow label="Critical" value={m.critical.toString()} />
                  <StatRow label="High" value={m.high.toString()} />
                  <StatRow label="Medium" value={m.medium.toString()} />
                  <StatRow label="Low" value={m.low.toString()} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </PanelCard>
  );
});

/* ── AttackPathSystemRecommendation — unified graph + insight, no nested cards ── */
export interface AttackPathSystemRecommendationProps {
  graph: AttackPathGraphProps;
  insight: InsightCardProps;
}

export const AttackPathSystemRecommendation = React.memo(function AttackPathSystemRecommendation({
  graph,
  insight,
}: AttackPathSystemRecommendationProps) {
  const { vulnerabilities: v, misconfiguration: m } = graph.stats;
  const gradientId = React.useId();
  const vulnGradId = `vulnGrad-${gradientId}`;
  const misconfigGradId = `misconfigGrad-${gradientId}`;

  return (
    // Flat layout — no nested card. ProactiveCard provides the visual boundary.
    <div className="flex flex-col gap-[12px] px-[2px]">
      {/* Section 1 — Attack Surface */}
      <div className="flex flex-col gap-[6px]">
        <span className="text-[8px] font-normal uppercase tracking-[0.5px]" style={{ color: "rgba(89,120,141,0.7)" }}>
          Attack Surface
        </span>
        <p className="text-[10px] font-medium leading-[1.35]" style={{ color: colors.textSecondary }}>{graph.title}</p>
        <div style={{ width: "100%", height: 120 }}>
          <DeferredChart>
            <AreaChart data={graph.chartData}>
              <defs>
                <linearGradient id={vulnGradId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ff4d4f" stopOpacity={0.28} />
                  <stop offset="100%" stopColor="#ff4d4f" stopOpacity={0.03} />
                </linearGradient>
                <linearGradient id={misconfigGradId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ff7a1a" stopOpacity={0.28} />
                  <stop offset="100%" stopColor="#ff7a1a" stopOpacity={0.03} />
                </linearGradient>
              </defs>
              <Tooltip
                contentStyle={{
                  backgroundColor: colors.bgPanel,
                  border: `1px solid ${colors.border}`,
                  borderRadius: "8px",
                  fontSize: "10px",
                }}
              />
              <Area type="monotone" dataKey="vuln" stroke="#ff4d4f" fill={`url(#${vulnGradId})`} />
              <Area type="monotone" dataKey="misconfig" stroke="#ff7a1a" fill={`url(#${misconfigGradId})`} />
            </AreaChart>
          </DeferredChart>
        </div>
        {/* Inline stat row below chart */}
        <div className="flex items-start gap-[20px]">
          <div>
            <span className="text-[8px] font-normal uppercase tracking-[0.4px]" style={{ color: "rgba(200,77,79,0.65)" }}>Vulns</span>
            <div className="mt-[3px] flex items-center gap-[8px]">
              <StatRow label="Critical" value={v.critical.toString()} />
              <StatRow label="High" value={v.high.toString()} />
            </div>
          </div>
          <div>
            <span className="text-[8px] font-normal uppercase tracking-[0.4px]" style={{ color: "rgba(200,120,26,0.65)" }}>Misconfig</span>
            <div className="mt-[3px] flex items-center gap-[8px]">
              <StatRow label="Critical" value={m.critical.toString()} />
              <StatRow label="High" value={m.high.toString()} />
            </div>
          </div>
        </div>
      </div>

      {/* Thin rule — visual break between the two narrative sections */}
      <div style={{ height: 1, background: "rgba(87,177,255,0.07)", margin: "1px 0" }} />

      {/* Section 2 — Threat Exposure */}
      <div className="flex flex-col gap-[5px]">
        <div className="flex items-center justify-between">
          <span className="text-[8px] font-normal uppercase tracking-[0.5px]" style={{ color: "rgba(89,120,141,0.7)" }}>
            {insight.module}
          </span>
          <Badge tone={insight.severity}>{insight.severity}</Badge>
        </div>
        <p className="text-[10.5px] font-semibold leading-[1.35]" style={{ color: colors.textPrimary }}>{insight.title}</p>
        <p className="text-[10px] leading-[1.5]" style={{ color: colors.textMuted }}>{insight.description}</p>
        {insight.supportingStats && insight.supportingStats.length > 0 && (
          <div className="flex items-start gap-[16px] pt-[2px]">
            {insight.supportingStats.map((stat) => (
              <div key={stat.label}>
                <div className="text-[8px] uppercase tracking-[0.08em]" style={{ color: colors.textDim }}>{stat.label}</div>
                <div className="mt-[2px] text-[11px] font-semibold" style={{ color: colors.textPrimary }}>{stat.value}</div>
              </div>
            ))}
          </div>
        )}
        {insight.actions && insight.actions.length > 0 && (
          <div className="flex items-center gap-[8px] pt-[2px]">
            <ActionButton label={insight.actions[0]} tone={insight.severity} />
            {insight.actions[1] && <ActionButton label={insight.actions[1]} tone="neutral" subtle />}
          </div>
        )}
      </div>
    </div>
  );
});

/* ── AnalystDetailPanel Component ── */
export interface AnalystDetailPanelProps {
  analyst: string;
  role: string;
  discoveries: string[];
  decisions: string[];
  actions: string[];
}

export const AnalystDetailPanel = React.memo(function AnalystDetailPanel({
  analyst,
  role,
  discoveries,
  decisions,
  actions,
}: AnalystDetailPanelProps) {
  const DetailColumn = React.memo(({ title, items }: { title: string; items: string[] }) => (
    <div>
      <div className="text-[10px] uppercase tracking-[0.08em] font-semibold mb-2" style={{ color: colors.textDim }}>
        {title}
      </div>
      <ul className="space-y-2">
        {items.map((item, i) => (
          <li key={i} className="text-[10px] leading-[1.4] flex gap-2" style={{ color: colors.textMuted }}>
            <span style={{ color: colors.primary }}>•</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  ));

  return (
    <PanelCard padding="lg">
      <CardHeader title={analyst} subtitle={role} eyebrow="Analyst Profile" />
      <CardContent>
        <div className="grid gap-4 md:grid-cols-3">
          <DetailColumn title="Discoveries" items={discoveries} />
          <DetailColumn title="Decisions" items={decisions} />
          <DetailColumn title="Actions" items={actions} />
        </div>
      </CardContent>
    </PanelCard>
  );
});

/* ── CaseSummaryCard Component ── */
export interface CaseSummaryCardProps {
  caseId: string;
  title: string;
  severity: Severity;
  status: string;
  assignee: string;
  findings: number;
  lastUpdate: string;
  actions?: string[];
}

export const CaseSummaryCard = React.memo(function CaseSummaryCard({
  caseId,
  title,
  severity,
  status,
  assignee,
  findings,
  lastUpdate,
  actions = [],
}: CaseSummaryCardProps) {
  return (
    <PanelCard padding="lg">
      <CardHeader
        title={title}
        eyebrow={`Case ${caseId}`}
        actions={<Badge tone={severity}>{severity}</Badge>}
      />
      <CardContent>
        <MetricGrid columns={3} gap="md">
          <div>
            <div className="text-[10px] uppercase tracking-[0.08em]" style={{ color: colors.textDim }}>
              Status
            </div>
            <div className="mt-1 text-[10px] font-medium" style={{ color: colors.textSecondary }}>
              {status}
            </div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-[0.08em]" style={{ color: colors.textDim }}>
              Assignee
            </div>
            <div className="mt-1 text-[10px] font-medium" style={{ color: colors.textSecondary }}>
              {assignee}
            </div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-[0.08em]" style={{ color: colors.textDim }}>
              Findings
            </div>
            <div className="mt-1 text-[10px] font-medium" style={{ color: colors.textSecondary }}>
              {findings}
            </div>
          </div>
        </MetricGrid>
        <div className="mt-3 text-[10px]" style={{ color: colors.textMuted }}>
          Last updated: {lastUpdate}
        </div>
      </CardContent>
      {actions.length > 0 && (
        <CardFooter>
          <ButtonGroup>
            {actions.map((action) => (
              <ActionButton key={action} label={action} />
            ))}
          </ButtonGroup>
        </CardFooter>
      )}
    </PanelCard>
  );
});

/* ── LoadingSkeleton Component ── */
export const LoadingSkeleton = React.memo(function LoadingSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <div
          className="size-[32px] rounded-full animate-pulse"
          style={{ background: "linear-gradient(90deg, rgba(87,177,255,0.1) 0%, rgba(87,177,255,0.2) 50%, rgba(87,177,255,0.1) 100%)", backgroundSize: "200% 100%", animation: "analystPulse 2s ease-in-out infinite" }}
        />
        <div className="flex-1">
          <div
            className="h-[10px] w-[120px] rounded animate-pulse mb-2"
            style={{ background: "linear-gradient(90deg, rgba(87,177,255,0.08) 0%, rgba(87,177,255,0.12) 50%, rgba(87,177,255,0.08) 100%)", backgroundSize: "200% 100%", animation: "skeletonShimmer 1.5s ease-in-out infinite" }}
          />
          <div
            className="h-[8px] w-[80px] rounded animate-pulse"
            style={{ background: "linear-gradient(90deg, rgba(87,177,255,0.06) 0%, rgba(87,177,255,0.1) 50%, rgba(87,177,255,0.06) 100%)", backgroundSize: "200% 100%", animation: "skeletonShimmer 1.5s ease-in-out infinite 0.2s" }}
          />
        </div>
      </div>
      <PanelCard padding="lg">
        <div className="space-y-3">
          <div
            className="h-[12px] w-full rounded animate-pulse"
            style={{ background: "linear-gradient(90deg, rgba(87,177,255,0.08) 0%, rgba(87,177,255,0.12) 50%, rgba(87,177,255,0.08) 100%)", backgroundSize: "200% 100%", animation: "skeletonShimmer 1.5s ease-in-out infinite 0.3s" }}
          />
          <div
            className="h-[12px] w-4/5 rounded animate-pulse"
            style={{ background: "linear-gradient(90deg, rgba(87,177,255,0.08) 0%, rgba(87,177,255,0.12) 50%, rgba(87,177,255,0.08) 100%)", backgroundSize: "200% 100%", animation: "skeletonShimmer 1.5s ease-in-out infinite 0.4s" }}
          />
          <div
            className="h-[12px] w-3/5 rounded animate-pulse"
            style={{ background: "linear-gradient(90deg, rgba(87,177,255,0.08) 0%, rgba(87,177,255,0.12) 50%, rgba(87,177,255,0.08) 100%)", backgroundSize: "200% 100%", animation: "skeletonShimmer 1.5s ease-in-out infinite 0.5s" }}
          />
        </div>
      </PanelCard>
    </div>
  );
});

/* ── SuccessConfirmation Component ── */
export interface SuccessConfirmationProps {
  message: string;
  detail?: string;
  metrics?: Array<{ label: string; value: string }>;
}

export const SuccessConfirmation = React.memo(function SuccessConfirmation({
  message,
  detail,
  metrics = [],
}: SuccessConfirmationProps) {
  return (
    <PanelCard padding="lg">
      <div className="flex items-start gap-3">
        <div
          className="size-[24px] rounded-full flex items-center justify-center shrink-0"
          style={{ backgroundColor: `${colors.success}22`, animation: "successGlow 0.6s ease-out" }}
        >
          <svg width="14" height="10" viewBox="0 0 14 10" fill="none" style={{ animation: "successCheckIn 0.4s ease-out 0.2s backwards" }}>
            <path d="M1 5L5 9L13 1" stroke={colors.success} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <div className="flex-1">
          <div className="text-[12px] font-semibold" style={{ color: colors.textPrimary }}>
            {message}
          </div>
          {detail && (
            <div className="mt-1 text-[10px] leading-[1.4]" style={{ color: colors.textMuted }}>
              {detail}
            </div>
          )}
        </div>
      </div>
      {metrics.length > 0 && (
        <div className="mt-4 pt-4 border-t" style={{ borderColor: "rgba(87,177,255,0.10)" }}>
          <MetricGrid columns={2} gap="sm">
            {metrics.map((m) => (
              <StatRow key={m.label} label={m.label} value={m.value} />
            ))}
          </MetricGrid>
        </div>
      )}
    </PanelCard>
  );
});

/* ── FallbackSuggestion Component ── */
export interface FallbackSuggestionProps {
  suggestions: Array<{ label: string; description: string }>;
}

export const FallbackSuggestion = React.memo(function FallbackSuggestion({ suggestions }: FallbackSuggestionProps) {
  return (
    <PanelCard padding="lg">
      <CardHeader title="I can help with" eyebrow="Suggestions" />
      <CardContent>
        <div className="space-y-2">
          {suggestions.map((s, i) => (
            <div
              key={i}
              className="p-3 rounded-lg cursor-pointer transition-colors hover:bg-[rgba(87,177,255,0.08)]"
              style={{ border: `1px solid rgba(87,177,255,0.12)` }}
              data-suggestion={s.label}
            >
              <div className="text-[10px] font-medium" style={{ color: colors.textSecondary }}>
                {s.label}
              </div>
              <div className="mt-1 text-[10px]" style={{ color: colors.textMuted }}>
                {s.description}
              </div>
            </div>
          ))}\n        </div>
      </CardContent>
    </PanelCard>
  );
});

/* ── ResponseContext Component ── */
export const ResponseContext = React.memo(function ResponseContext({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-[6px]">
      <div className="flex items-center gap-[6px] px-[2px]">
        <span className="size-[4px] rounded-full bg-[#57b1ff] opacity-40" />
        <span className="font-['Inter:Regular',sans-serif] text-[9px] leading-[12px] text-[#4a5568] uppercase tracking-wider">
          {label}
        </span>
      </div>
      {children}
    </div>
  );
});