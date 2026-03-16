/**
 * Run Timeline — Chronological event log produced during workflow execution
 *
 * Renders the immutable `timelineEvents[]` array stored on each WorkflowRun.
 * Events are recorded by the PlaybookEngine in real time as execution proceeds
 * (run started, step completed, step failed, approval, integration blocked, etc.).
 *
 * Each event includes:
 *   - timestamp   (ISO-8601)
 *   - stepName    (if step-level)
 *   - status      (step or run status at that moment)
 *   - description (human-readable detail)
 */

import React, { useRef, useEffect } from "react";
import {
  Clock,
  CheckCircle2,
  XCircle,
  PlayCircle,
  AlertCircle,
  PauseCircle,
  Plug,
  MinusCircle,
  Ban,
  ShieldCheck,
  ShieldX,
  Link2,
  SkipForward,
  Loader2,
} from "lucide-react";
import { colors } from "../../../shared/design-system/tokens";
import type { WorkflowRun, TimelineEvent, TimelineEventKind } from "../types";

/* ================================================================
   HELPERS
   ================================================================ */

function formatTimeOnly(isoString: string): string {
  const date = new Date(isoString);
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");
  return `${hours}:${minutes}:${seconds}`;
}

/* ================================================================
   VISUAL CONFIGS PER EVENT KIND
   ================================================================ */

interface EventVisual {
  icon: React.ReactNode;
  dotColor: string;    // border + glow colour for the timeline dot
  labelColor: string;  // text accent colour
}

function getEventVisual(kind: TimelineEventKind): EventVisual {
  switch (kind) {
    case "run_started":
      return {
        icon: <PlayCircle size={10} />,
        dotColor: colors.accent,
        labelColor: colors.accent,
      };
    case "run_completed":
      return {
        icon: <CheckCircle2 size={10} />,
        dotColor: colors.active,
        labelColor: colors.active,
      };
    case "run_failed":
      return {
        icon: <XCircle size={10} />,
        dotColor: colors.critical,
        labelColor: colors.critical,
      };
    case "run_cancelled":
      return {
        icon: <Ban size={10} />,
        dotColor: "#7c8da6",
        labelColor: "#7c8da6",
      };
    case "run_paused":
      return {
        icon: <PauseCircle size={10} />,
        dotColor: "#ff9f43",
        labelColor: "#ff9f43",
      };
    case "step_started":
      return {
        icon: <Loader2 size={10} className="animate-spin" />,
        dotColor: "#2bb7ff",
        labelColor: "#2bb7ff",
      };
    case "step_completed":
      return {
        icon: <CheckCircle2 size={10} />,
        dotColor: colors.active,
        labelColor: colors.active,
      };
    case "step_failed":
      return {
        icon: <XCircle size={10} />,
        dotColor: colors.critical,
        labelColor: colors.critical,
      };
    case "step_skipped":
      return {
        icon: <MinusCircle size={10} />,
        dotColor: "#5a6a7a",
        labelColor: "#5a6a7a",
      };
    case "step_blocked":
      return {
        icon: <AlertCircle size={10} />,
        dotColor: "#ff9f43",
        labelColor: "#ff9f43",
      };
    case "step_approval_required":
      return {
        icon: <PauseCircle size={10} />,
        dotColor: "#ff9f43",
        labelColor: "#ff9f43",
      };
    case "step_approved":
      return {
        icon: <ShieldCheck size={10} />,
        dotColor: colors.active,
        labelColor: colors.active,
      };
    case "step_rejected":
      return {
        icon: <ShieldX size={10} />,
        dotColor: colors.critical,
        labelColor: colors.critical,
      };
    case "integration_connected":
      return {
        icon: <Link2 size={10} />,
        dotColor: colors.active,
        labelColor: colors.active,
      };
    case "integration_skipped":
      return {
        icon: <SkipForward size={10} />,
        dotColor: "#5a6a7a",
        labelColor: "#5a6a7a",
      };
    default:
      return {
        icon: <Clock size={10} />,
        dotColor: "#5a6a7a",
        labelColor: "#5a6a7a",
      };
  }
}

/** True for run-level "bookend" events (started / completed / failed / cancelled / paused) */
function isRunLevelEvent(kind: TimelineEventKind): boolean {
  return kind.startsWith("run_");
}

/* ================================================================
   COMPONENT
   ================================================================ */

interface RunTimelineProps {
  run: WorkflowRun;
}

export function RunTimeline({ run }: RunTimelineProps) {
  const events = run.timelineEvents || [];
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to latest event when the list grows (live execution)
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [events.length]);

  return (
    <div
      style={{
        padding: "20px",
        borderRadius: "12px",
        border: `1px solid ${colors.border}`,
        background: colors.bgCard,
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "16px",
        }}
      >
        <div>
          <h3
            style={{
              fontSize: "14px",
              fontWeight: 600,
              color: colors.textPrimary,
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <Clock size={16} />
            Execution Timeline
          </h3>
          <p
            style={{
              fontSize: "12px",
              color: colors.textMuted,
              marginTop: "4px",
            }}
          >
            Real-time event log recorded during workflow execution
          </p>
        </div>

        {/* Event count badge */}
        <span
          style={{
            padding: "4px 10px",
            borderRadius: "12px",
            fontSize: "11px",
            fontWeight: 600,
            background: `${colors.accent}15`,
            color: colors.accent,
            border: `1px solid ${colors.accent}30`,
          }}
        >
          {events.length} event{events.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Timeline */}
      {events.length > 0 ? (
        <div
          style={{
            position: "relative",
            maxHeight: "420px",
            overflowY: "auto",
            paddingRight: "4px",
          }}
        >
          {events.map((event, index) => {
            const isLast = index === events.length - 1;
            const visual = getEventVisual(event.kind);
            const isRunLevel = isRunLevelEvent(event.kind);

            return (
              <div
                key={`${event.timestamp}-${index}`}
                style={{
                  display: "flex",
                  gap: "12px",
                  position: "relative",
                }}
              >
                {/* Timeline dot + connector line */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    width: "20px",
                    flexShrink: 0,
                  }}
                >
                  {/* Dot */}
                  <span
                    style={{
                      marginTop: "3px",
                      width: isRunLevel ? "14px" : "10px",
                      height: isRunLevel ? "14px" : "10px",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: `${visual.dotColor}22`,
                      border: `2px solid ${visual.dotColor}`,
                      boxShadow: `0 0 12px ${visual.dotColor}40`,
                      color: visual.dotColor,
                      flexShrink: 0,
                    }}
                  >
                    {event.kind === "step_started" ? null : null}
                  </span>

                  {/* Connector */}
                  {!isLast && (
                    <span
                      style={{
                        marginTop: "4px",
                        width: "1px",
                        flex: 1,
                        minHeight: "20px",
                        backgroundColor: "rgba(255,255,255,0.06)",
                      }}
                    />
                  )}
                </div>

                {/* Event content */}
                <div
                  style={{
                    flex: 1,
                    paddingBottom: isLast ? "0" : "14px",
                    minWidth: 0,
                  }}
                >
                  {/* Row 1: timestamp + step name + integration badge */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      flexWrap: "wrap",
                      marginBottom: "2px",
                    }}
                  >
                    {/* Timestamp */}
                    <span
                      style={{
                        fontSize: "11px",
                        fontFamily: "monospace",
                        color: colors.textDim,
                        flexShrink: 0,
                      }}
                    >
                      {formatTimeOnly(event.timestamp)}
                    </span>

                    {/* Step name chip (step-level events only) */}
                    {event.stepName && (
                      <span
                        style={{
                          fontSize: "11px",
                          fontWeight: 600,
                          color: visual.labelColor,
                          padding: "1px 8px",
                          borderRadius: "6px",
                          background: `${visual.dotColor}12`,
                          border: `1px solid ${visual.dotColor}25`,
                        }}
                      >
                        {event.stepName}
                      </span>
                    )}

                    {/* Integration badge */}
                    {event.integrationUsed && (
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px",
                          padding: "1px 7px",
                          borderRadius: "8px",
                          fontSize: "10px",
                          fontWeight: 500,
                          background: "rgba(7, 100, 152, 0.12)",
                          color: colors.low,
                          border: "1px solid rgba(7, 100, 152, 0.2)",
                        }}
                      >
                        <Plug size={8} />
                        {event.integrationUsed}
                      </span>
                    )}

                    {/* Duration badge */}
                    {event.duration && (
                      <span
                        style={{
                          fontSize: "10px",
                          color: colors.textDim,
                          fontFamily: "monospace",
                        }}
                      >
                        {event.duration}
                      </span>
                    )}
                  </div>

                  {/* Row 2: description */}
                  <div
                    style={{
                      fontSize: isRunLevel ? "13px" : "12px",
                      fontWeight: isRunLevel ? 600 : 400,
                      color: isRunLevel ? colors.textPrimary : colors.textSecondary,
                      lineHeight: 1.5,
                    }}
                  >
                    {event.description}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>
      ) : (
        /* Empty state */
        <div
          style={{
            padding: "24px",
            textAlign: "center",
            color: colors.textMuted,
          }}
        >
          <Clock size={32} style={{ margin: "0 auto 12px", opacity: 0.3 }} />
          <p style={{ fontSize: "13px" }}>No timeline events recorded yet</p>
        </div>
      )}
    </div>
  );
}
