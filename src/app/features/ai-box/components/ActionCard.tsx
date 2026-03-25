/**
 * AI Box — ActionCard component.
 *
 * Self-contained card that drives an action through its full lifecycle:
 * pending → running → complete / failed / cancelled / awaiting-approval.
 *
 * Communicates with GlobalAIBox via:
 *   window.dispatchEvent(new CustomEvent("globalaibox-action-status", { detail: ... }))
 *
 * This is the most stateful component in the AI Box feature —
 * it owns its own execution simulation, approval timer, and edit state.
 */

import React from "react";
import type { ActionCardData, ActionScope } from "../types";

/* ── Private types ── */

type AnalystPhase = "queued" | "running" | "complete";

/* ── Private config ── */

const SCOPE_CONFIG: Record<ActionScope, { label: string; color: string; bg: string }> = {
  asset:         { label: "Asset",         color: "#1eb2c2", bg: "rgba(30,178,194,0.10)" },
  agent:         { label: "Agent",         color: "#00A46E", bg: "rgba(0,164,110,0.10)" },
  workflow:      { label: "Workflow",      color: "#3b82f6", bg: "rgba(59,130,246,0.10)" },
  investigation: { label: "Investigation", color: "#d97706", bg: "rgba(217,119,6,0.10)" },
  risk:          { label: "Risk",          color: "#9738C6", bg: "rgba(151,56,198,0.10)" },
};

/* ── Component ── */

export const ActionCard = React.memo(function ActionCard({
  data: initialData,
  onModify,
  onComplete,
  onFail,
}: {
  data: ActionCardData;
  onModify?: (data: ActionCardData, refinement: string) => void;
  onComplete?: (data: ActionCardData) => void;
  onFail?: (data: ActionCardData) => void;
}) {
  const [data, setData] = React.useState(initialData);
  const [progress, setProgress] = React.useState(0);
  const timerRef = React.useRef<ReturnType<typeof setInterval> | null>(null);

  /* ── Inline modify state ── */
  const [isEditing, setIsEditing] = React.useState(false);
  const [editValues, setEditValues] = React.useState<Record<string, string>>({});
  const [updateMsg, setUpdateMsg] = React.useState<string | null>(null);

  /* ── Per-analyst progress (multi-agent) ── */
  const [analystPhases, setAnalystPhases] = React.useState<Record<string, AnalystPhase>>({});

  const approvalTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(() => {
    setData(initialData);
  }, [initialData]);

  const scopeConfig = SCOPE_CONFIG[data.scope];

  const handleRun = React.useCallback(() => {
    setData(d => ({ ...d, status: "running" }));
    setProgress(0);

    /* Notify GlobalAIBox — shows status indicator */
    window.dispatchEvent(new CustomEvent("globalaibox-action-status", {
      detail: { running: true, title: data.title },
    }));

    /* Initialize per-analyst phases */
    const analysts = data.participatingAnalysts || [];
    if (analysts.length > 0) {
      const init: Record<string, AnalystPhase> = {};
      analysts.forEach((a, i) => { init[a] = i === 0 ? "running" : "queued"; });
      setAnalystPhases(init);
    }

    const duration = 3000 + Math.random() * 2000;
    const steps = 30;
    const stepMs = duration / steps;
    let step = 0;

    timerRef.current = setInterval(() => {
      step++;
      const pct = Math.min(100, Math.round((step / steps) * 100));
      setProgress(pct);

      /* Stagger analyst completions evenly across progress */
      if (analysts.length > 0) {
        setAnalystPhases(() => {
          const next: Record<string, AnalystPhase> = {};
          analysts.forEach((a, i) => {
            const completeAt = Math.round(((i + 1) / analysts.length) * 100);
            const runAt = Math.round((i / analysts.length) * 100);
            if (pct >= completeAt) {
              next[a] = "complete";
            } else if (pct >= runAt) {
              next[a] = "running";
            } else {
              next[a] = "queued";
            }
          });
          return next;
        });
      }

      if (step >= steps) {
        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = null;
        /* ~12% chance of failure to demonstrate failure handling */
        const isFailed = Math.random() < 0.12;
        setData(d => {
          const analystCount = (d.participatingAnalysts || []).length;
          if (isFailed) {
            const failedData = { ...d, status: "failed" as const, progress: 0 };
            onFail?.(failedData);
            window.dispatchEvent(new CustomEvent("globalaibox-action-status", {
              detail: { running: false, title: d.title, completed: false, failed: true, actionData: failedData },
            }));
            return failedData;
          }
          const completed = {
            ...d,
            status: "complete" as const,
            progress: 100,
            result: analystCount > 1
              ? `${d.title} completed across ${analystCount} analysts. All findings and downstream dependencies updated.`
              : `${d.title} completed. All downstream dependencies updated.`,
          };
          onComplete?.(completed);
          window.dispatchEvent(new CustomEvent("globalaibox-action-status", {
            detail: { running: false, title: d.title, completed: true, analystCount, actionData: completed },
          }));
          return completed;
        });
      }
    }, stepMs);
  }, [data.title, data.participatingAnalysts, onComplete, onFail]);

  const handleCancel = React.useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    window.dispatchEvent(new CustomEvent("globalaibox-action-status", {
      detail: { running: false, title: data.title, completed: false },
    }));
    setData(d => ({ ...d, status: "cancelled" }));
  }, [data.title]);

  /* ── Inline modify — no chat messages ── */
  const handleModify = React.useCallback(() => {
    const vals: Record<string, string> = {};
    data.parameters.filter(p => p.editable).forEach(p => { vals[p.label] = p.value; });
    setEditValues(vals);
    setIsEditing(true);
  }, [data.parameters]);

  const handleSaveEdit = React.useCallback(() => {
    const changed = data.parameters
      .filter(p => p.editable && editValues[p.label] !== undefined && editValues[p.label] !== p.value)
      .map(p => `${p.label} → ${editValues[p.label]}`);

    setData(d => ({
      ...d,
      parameters: d.parameters.map(p =>
        p.editable && editValues[p.label] !== undefined ? { ...p, value: editValues[p.label] } : p
      ),
    }));
    setIsEditing(false);

    /* Re-evaluate whether approval is needed if scope/analyst changes dramatically */
    const scopeChanged = data.parameters.some(
      p => p.editable && editValues[p.label] !== undefined && editValues[p.label] !== p.value && /scope|target|production/i.test(p.label)
    );
    if (scopeChanged && data.guardrailLevel === "L2") {
      const newValueStr = Object.values(editValues).join(" ");
      if (/production|all\s+asset|live/i.test(newValueStr)) {
        setData(d => ({ ...d, requiresApproval: true, riskSummary: (d.riskSummary || "") + " Scope updated to include production assets." }));
      }
    }

    if (changed.length > 0) {
      setUpdateMsg(`Updated: ${changed.join(" · ")}`);
      setTimeout(() => setUpdateMsg(null), 2500);
    }
  }, [data.parameters, data.guardrailLevel, editValues]);

  const handleCancelEdit = React.useCallback(() => {
    setIsEditing(false);
    setEditValues({});
  }, []);

  const handleRequestApproval = React.useCallback(() => {
    setData(d => ({ ...d, status: "awaiting-approval" }));

    /* Simulate approval granted after 3s (replace with real approval API) */
    approvalTimerRef.current = setTimeout(() => {
      setData(d => {
        if (d.status !== "awaiting-approval") return d;
        return { ...d, status: "pending", requiresApproval: false };
      });
    }, 3000);
  }, []);

  const handleDenyApproval = React.useCallback(() => {
    if (approvalTimerRef.current) {
      clearTimeout(approvalTimerRef.current);
      approvalTimerRef.current = null;
    }
    setData(d => ({ ...d, status: "approval-denied" }));
  }, []);

  React.useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (approvalTimerRef.current) clearTimeout(approvalTimerRef.current);
    };
  }, []);

  /* ── Accent color for left border stripe ── */
  const accentColor = data.status === "running"
    ? "#3b82f6"
    : data.status === "complete"
      ? "#2fd897"
      : data.status === "cancelled" || data.status === "approval-denied" || data.status === "failed"
        ? "#7e8e9e"
        : data.status === "awaiting-approval"
          ? "#d97706"
          : data.guardrailLevel === "L3"
            ? "#d97706"
            : scopeConfig.color;

  return (
    <div
      className="rounded-[10px] overflow-hidden relative"
      style={{
        backgroundColor: "#040A10",
        border: data.status === "running"
          ? "1px solid rgba(59,130,246,0.28)"
          : data.status === "complete"
            ? "1px solid rgba(47,216,151,0.22)"
            : data.status === "cancelled" || data.status === "failed"
              ? "1px solid rgba(98,112,125,0.18)"
              : data.status === "awaiting-approval"
                ? "1px solid rgba(217,119,6,0.28)"
                : data.status === "approval-denied"
                  ? "1px solid rgba(98,112,125,0.18)"
                  : data.guardrailLevel === "L3"
                    ? "1px solid rgba(217,119,6,0.22)"
                    : `1px solid ${scopeConfig.color}28`,
        transition: "border-color 0.3s ease",
      }}
    >
      {/* Left accent stripe */}
      <div
        className="absolute left-0 top-0 bottom-0 w-[3px] rounded-l-[10px]"
        style={{ backgroundColor: accentColor, opacity: 0.7 }}
      />

      {/* Header */}
      <div
        className="pl-[15px] pr-[12px] py-[8px] flex items-center gap-[8px]"
        style={{ borderBottom: "1px solid rgba(14,28,38,0.8)" }}
      >
        {/* [ACTION] label */}
        <div
          className="flex items-center gap-[3px] px-[5px] py-[2px] rounded-[3px] shrink-0"
          style={{
            backgroundColor: data.status === "complete" ? "rgba(47,216,151,0.08)" : "rgba(59,130,246,0.08)",
            border: `1px solid ${data.status === "complete" ? "rgba(47,216,151,0.18)" : "rgba(59,130,246,0.18)"}`,
          }}
        >
          <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
            {data.status === "complete" ? (
              <path d="M1.5 4L3.2 5.7L6.5 2.3" stroke="#2fd897" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
            ) : data.status === "running" ? (
              <circle cx="4" cy="4" r="2.5" stroke="#3b82f6" strokeWidth="1" />
            ) : (
              <path d="M4 1.5V4L5.5 5.5" stroke="#3b82f6" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
            )}
          </svg>
          <span
            className="font-['Inter:Semi_Bold',sans-serif] font-semibold text-[8px] leading-[10px] uppercase tracking-[0.06em]"
            style={{ color: data.status === "complete" ? "#2fd897" : "#3b82f6" }}
          >
            {data.status === "complete" ? "Done" : data.status === "running" ? "Running" : "Action"}
          </span>
        </div>

        <span className="font-['Inter:Semi_Bold',sans-serif] font-semibold text-[11px] leading-[14px] text-[#c8d0d8] truncate flex-1">
          {data.title}
        </span>

        {/* Scope badge */}
        <div
          className="px-[5px] py-[1px] rounded-[3px] shrink-0"
          style={{ backgroundColor: scopeConfig.bg, border: `1px solid ${scopeConfig.color}20` }}
        >
          <span
            className="font-['Inter:Medium',sans-serif] font-medium text-[8px] leading-[10px] uppercase tracking-[0.04em]"
            style={{ color: scopeConfig.color }}
          >
            {scopeConfig.label}
          </span>
        </div>

        {/* Guardrail level badge */}
        {data.guardrailLevel && data.guardrailLevel !== "L1" && (
          <div
            className="px-[5px] py-[1px] rounded-[3px] shrink-0"
            style={{
              backgroundColor: data.guardrailLevel === "L3" ? "rgba(217,119,6,0.08)" : "rgba(87,177,255,0.06)",
              border: `1px solid ${data.guardrailLevel === "L3" ? "rgba(217,119,6,0.22)" : "rgba(87,177,255,0.12)"}`,
            }}
          >
            <span
              className="font-['Inter:Medium',sans-serif] font-medium text-[8px] leading-[10px] uppercase tracking-[0.04em]"
              style={{ color: data.guardrailLevel === "L3" ? "#d97706" : "#57b1ff" }}
            >
              {data.guardrailLevel === "L3" ? "Requires approval" : "Confirmation required"}
            </span>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="pl-[15px] pr-[12px] py-[10px] flex flex-col gap-[8px]">

        {/* Inline update confirmation */}
        {updateMsg && (
          <div
            className="flex items-center gap-[5px] px-[8px] py-[5px] rounded-[5px]"
            style={{ background: "rgba(47,216,151,0.06)", border: "1px solid rgba(47,216,151,0.15)" }}
          >
            <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
              <path d="M1.5 4L3 5.5L6.5 2" stroke="#2fd897" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="font-['Inter:Medium',sans-serif] font-medium text-[10px] leading-[13px] text-[#2fd897]">
              {updateMsg}
            </span>
          </div>
        )}

        {/* Why this is recommended */}
        {data.why && (data.status === "pending" || data.status === "awaiting-approval") && !isEditing && (
          <div className="flex flex-col gap-[3px]">
            <div className="flex items-center gap-[5px]">
              <svg width="9" height="9" viewBox="0 0 9 9" fill="none" className="shrink-0">
                <path d="M4.5 1.5C2.843 1.5 1.5 2.843 1.5 4.5S2.843 7.5 4.5 7.5 7.5 6.157 7.5 4.5 6.157 1.5 4.5 1.5z" stroke="#57b1ff" strokeWidth="0.7" opacity="0.5"/>
                <path d="M4.5 4v2" stroke="#57b1ff" strokeWidth="0.8" strokeLinecap="round" opacity="0.5"/>
                <circle cx="4.5" cy="3" r="0.4" fill="#57b1ff" opacity="0.5"/>
              </svg>
              <span className="font-['Inter:Medium',sans-serif] font-medium text-[9px] leading-[11px] text-[#4a5f72] uppercase tracking-[0.05em]">
                Why this is recommended
              </span>
              {data.confidence && (
                <span
                  className="ml-auto px-[5px] py-[1px] rounded-[3px] font-['Inter:Medium',sans-serif] font-medium text-[8px] leading-[10px] uppercase tracking-[0.04em] shrink-0"
                  style={{
                    background: data.confidence === "high" ? "rgba(47,216,151,0.08)" : data.confidence === "moderate" ? "rgba(245,158,11,0.08)" : "rgba(98,112,125,0.10)",
                    color: data.confidence === "high" ? "#2fd897" : data.confidence === "moderate" ? "#f59e0b" : "#7e8e9e",
                    border: `1px solid ${data.confidence === "high" ? "rgba(47,216,151,0.18)" : data.confidence === "moderate" ? "rgba(245,158,11,0.18)" : "rgba(98,112,125,0.18)"}`,
                  }}
                >
                  {data.confidence === "high" ? "High confidence" : data.confidence === "moderate" ? "Moderate confidence" : "Needs review"}
                </span>
              )}
            </div>
            <p className="font-['Inter:Regular',sans-serif] font-normal text-[10px] leading-[14px] text-[#5e7285] pl-[14px]">
              {data.why}
            </p>
          </div>
        )}

        {/* Evidence */}
        {data.evidence && data.evidence.length > 0 && (data.status === "pending" || data.status === "awaiting-approval") && !isEditing && (
          <div className="flex flex-col gap-[4px]">
            <span className="font-['Inter:Medium',sans-serif] font-medium text-[9px] leading-[11px] text-[#4a5f72] uppercase tracking-[0.05em]">
              Evidence
            </span>
            {data.evidence.map((e, i) => (
              <div key={i} className="flex items-start gap-[5px] pl-[2px]">
                <svg width="7" height="7" viewBox="0 0 7 7" fill="none" className="shrink-0 mt-[3px]">
                  <circle cx="3.5" cy="3.5" r="1.5" fill="#57b1ff" opacity="0.45"/>
                </svg>
                <span className="font-['Inter:Regular',sans-serif] font-normal text-[10px] leading-[13px] text-[#5e7285]">{e}</span>
              </div>
            ))}
          </div>
        )}

        {/* Risk / impact summary */}
        {data.riskSummary && data.status === "pending" && !isEditing && (
          <div
            className="flex items-start gap-[5px] px-[8px] py-[5px] rounded-[5px]"
            style={{ background: "rgba(87,177,255,0.04)", border: "1px solid rgba(87,177,255,0.08)" }}
          >
            <svg width="9" height="9" viewBox="0 0 9 9" fill="none" className="shrink-0 mt-[2px]">
              <circle cx="4.5" cy="4.5" r="3.5" stroke="#57b1ff" strokeWidth="0.8" opacity="0.5" />
              <path d="M4.5 3v2M4.5 6v.5" stroke="#57b1ff" strokeWidth="0.8" strokeLinecap="round" opacity="0.5" />
            </svg>
            <span className="font-['Inter:Regular',sans-serif] font-normal text-[10px] leading-[14px] text-[#4a5a6a]">
              {data.riskSummary}
            </span>
          </div>
        )}

        {/* Risk summary — shown in awaiting-approval state too */}
        {data.riskSummary && data.status === "awaiting-approval" && (
          <div
            className="flex items-start gap-[5px] px-[8px] py-[5px] rounded-[5px]"
            style={{ background: "rgba(217,119,6,0.04)", border: "1px solid rgba(217,119,6,0.10)" }}
          >
            <svg width="9" height="9" viewBox="0 0 9 9" fill="none" className="shrink-0 mt-[2px]">
              <circle cx="4.5" cy="4.5" r="3.5" stroke="#d97706" strokeWidth="0.8" opacity="0.6" />
              <path d="M4.5 3v2M4.5 6v.5" stroke="#d97706" strokeWidth="0.8" strokeLinecap="round" opacity="0.6" />
            </svg>
            <span className="font-['Inter:Regular',sans-serif] font-normal text-[10px] leading-[14px] text-[#4a5a6a]">
              {data.riskSummary}
            </span>
          </div>
        )}

        {/* Participating analysts (multi-agent) — pending state */}
        {!isEditing && data.status === "pending" && data.participatingAnalysts && data.participatingAnalysts.length > 0 && (
          <div className="flex flex-col gap-[4px]">
            <span className="font-['Inter:Medium',sans-serif] font-medium text-[9px] leading-[11px] text-[#4a5f72] uppercase tracking-[0.05em]">
              Contributing Analysts
            </span>
            {data.participatingAnalysts.map(a => (
              <div key={a} className="flex items-start gap-[5px]">
                <div className="w-[4px] h-[4px] rounded-full shrink-0 mt-[4px]" style={{ backgroundColor: "#57b1ff", opacity: 0.55 }} />
                <div className="flex flex-col gap-[1px]">
                  <span className="font-['Inter:Regular',sans-serif] font-normal text-[10px] leading-[13px] text-[#7e8e9e]">{a}</span>
                  {data.analystContributions?.[a] && (
                    <span className="font-['Inter:Regular',sans-serif] font-normal text-[9px] leading-[12px] text-[#4a5f72]">→ {data.analystContributions[a]}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Parameters — view mode (Key → Value format) */}
        {!isEditing && data.status !== "complete" && data.status !== "cancelled" && (
          <div className="flex flex-col gap-[5px]">
            <span className="font-['Inter:Medium',sans-serif] font-medium text-[9px] leading-[11px] text-[#4a5f72] uppercase tracking-[0.05em]">
              Parameters
            </span>
            {data.parameters.map((p, i) => (
              <div key={i} className="flex items-center gap-[5px]">
                <span className="font-['Inter:Regular',sans-serif] font-normal text-[9px] leading-[12px] text-[#4a5f72]">•</span>
                <span className="font-['Inter:Regular',sans-serif] font-normal text-[10px] leading-[13px] text-[#7e8e9e] shrink-0">
                  {p.label}
                </span>
                <span className="font-['Inter:Regular',sans-serif] text-[10px] text-[#4a5f72] mx-[2px]">→</span>
                <span
                  className="font-['Inter:Medium',sans-serif] font-medium text-[10px] leading-[13px] text-[#9fadb9] truncate"
                  style={p.editable ? { borderBottom: "1px dashed rgba(87,177,255,0.18)" } : undefined}
                >
                  {p.value}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Parameters — edit mode */}
        {isEditing && (
          <div className="flex flex-col gap-[6px]">
            <span className="font-['Inter:Medium',sans-serif] font-medium text-[9px] leading-[11px] text-[#57b1ff] uppercase tracking-[0.05em]">
              Edit Parameters
            </span>
            {data.parameters.filter(p => p.editable).map((p, i) => (
              <div key={i} className="flex flex-col gap-[3px]">
                <span className="font-['Inter:Regular',sans-serif] font-normal text-[9px] leading-[12px] text-[#7e8e9e]">
                  {p.label}
                </span>
                <input
                  type="text"
                  value={editValues[p.label] ?? p.value}
                  onChange={e => setEditValues(v => ({ ...v, [p.label]: e.target.value }))}
                  className="w-full rounded-[4px] px-[8px] py-[4px] font-['Inter:Regular',sans-serif] font-normal text-[10px] leading-[13px] text-[#c8d0d8] outline-none"
                  style={{
                    background: "rgba(87,177,255,0.04)",
                    border: "1px solid rgba(87,177,255,0.18)",
                  }}
                />
              </div>
            ))}
          </div>
        )}

        {/* Expected outcome */}
        {!isEditing && data.status === "pending" && (
          <div className="flex flex-col gap-[3px]">
            <span className="font-['Inter:Medium',sans-serif] font-medium text-[9px] leading-[11px] text-[#4a5f72] uppercase tracking-[0.05em]">
              Expected Outcome
            </span>
            <p className="font-['Inter:Regular',sans-serif] font-normal text-[10px] leading-[14px] text-[#5e7285]">
              {data.expectedOutcome}
            </p>
          </div>
        )}

        {/* Running state */}
        {data.status === "running" && (
          <div className="flex flex-col gap-[6px]">
            <div className="flex items-center justify-between">
              <span className="font-['Inter:Medium',sans-serif] font-medium text-[9px] leading-[11px] text-[#3b82f6] uppercase tracking-[0.05em]">
                {data.participatingAnalysts && data.participatingAnalysts.length > 1 ? "Running multi-agent investigation..." : "Executing"}
              </span>
              <span className="font-['Inter:Regular',sans-serif] font-normal text-[9px] leading-[11px] text-[#4a5f72] tabular-nums">
                {progress}%
              </span>
            </div>
            <div className="h-[3px] rounded-full overflow-hidden" style={{ backgroundColor: "rgba(59,130,246,0.10)" }}>
              <div
                className="h-full rounded-full"
                style={{
                  width: `${progress}%`,
                  backgroundColor: "#3b82f6",
                  boxShadow: "0 0 6px rgba(59,130,246,0.35)",
                  transition: "width 0.15s linear",
                }}
              />
            </div>
            {/* Per-analyst progress (multi-agent) */}
            {data.participatingAnalysts && data.participatingAnalysts.length > 0 && (
              <div className="flex flex-col gap-[3px] mt-[2px]">
                {data.participatingAnalysts.map(a => {
                  const phase = analystPhases[a] || "queued";
                  return (
                    <div key={a} className="flex items-center gap-[6px]">
                      <div
                        className="w-[5px] h-[5px] rounded-full shrink-0"
                        style={{
                          backgroundColor: phase === "complete" ? "#2fd897" : phase === "running" ? "#3b82f6" : "#3a4754",
                          boxShadow: phase === "running" ? "0 0 4px rgba(59,130,246,0.5)" : "none",
                        }}
                      />
                      <span
                        className="font-['Inter:Regular',sans-serif] font-normal text-[9px] leading-[12px]"
                        style={{ color: phase === "complete" ? "#7e8e9e" : phase === "running" ? "#9fadb9" : "#4a5f72" }}
                      >
                        {phase === "complete" ? `${a} complete` : phase === "running" ? a : a}
                      </span>
                      {phase === "complete" && (
                        <svg width="8" height="8" viewBox="0 0 8 8" fill="none" className="shrink-0">
                          <path d="M1.5 4L3 5.5L6.5 2" stroke="#2fd897" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Awaiting approval state */}
        {data.status === "awaiting-approval" && (
          <div className="flex flex-col gap-[6px]">
            <div className="flex items-center gap-[5px]">
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none" className="shrink-0">
                <circle cx="5" cy="5" r="4" stroke="#d97706" strokeWidth="0.8" />
                <path d="M5 3v2.5l1.5 1" stroke="#d97706" strokeWidth="0.8" strokeLinecap="round" />
              </svg>
              <span className="font-['Inter:Medium',sans-serif] font-medium text-[10px] leading-[13px] text-[#d97706]">
                Approval requested
              </span>
            </div>
            {data.approvalContext ? (
              <div className="flex flex-col gap-[5px]">
                <p className="font-['Inter:Regular',sans-serif] font-normal text-[10px] leading-[14px] text-[#4a5568]">
                  {data.approvalContext.whyRequired}
                </p>
                {data.approvalContext.whatIsBlocked && (
                  <div className="flex items-start gap-[5px] px-[7px] py-[5px] rounded-[4px]" style={{ background: "rgba(217,119,6,0.05)", border: "1px solid rgba(217,119,6,0.12)" }}>
                    <svg width="8" height="8" viewBox="0 0 8 8" fill="none" className="shrink-0 mt-[2px]">
                      <path d="M4 1L7 6H1L4 1z" stroke="#d97706" strokeWidth="0.7" opacity="0.7"/>
                    </svg>
                    <span className="font-['Inter:Regular',sans-serif] font-normal text-[9px] leading-[13px] text-[#6e5a30]">{data.approvalContext.whatIsBlocked}</span>
                  </div>
                )}
                <div className="flex flex-col gap-[3px] mt-[2px]">
                  <div className="flex items-start gap-[5px]">
                    <svg width="8" height="8" viewBox="0 0 8 8" fill="none" className="shrink-0 mt-[2px]"><path d="M1.5 4L3 5.5L6.5 2" stroke="#2fd897" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" opacity="0.6"/></svg>
                    <span className="font-['Inter:Regular',sans-serif] font-normal text-[9px] leading-[13px] text-[#4a5568]"><span style={{ color: "#4e6a50" }}>If approved:</span> {data.approvalContext.approveEffect}</span>
                  </div>
                  <div className="flex items-start gap-[5px]">
                    <svg width="8" height="8" viewBox="0 0 8 8" fill="none" className="shrink-0 mt-[2px]"><path d="M2 2L6 6M6 2L2 6" stroke="#ef4444" strokeWidth="0.9" strokeLinecap="round" opacity="0.5"/></svg>
                    <span className="font-['Inter:Regular',sans-serif] font-normal text-[9px] leading-[13px] text-[#4a5568]"><span style={{ color: "#6a4e4e" }}>If rejected:</span> {data.approvalContext.rejectEffect}</span>
                  </div>
                </div>
              </div>
            ) : (
              <p className="font-['Inter:Regular',sans-serif] font-normal text-[10px] leading-[14px] text-[#4a5568]">
                Waiting for a manager or administrator to approve this action. You will be notified when a decision is made.
              </p>
            )}
          </div>
        )}

        {/* Approval denied state */}
        {data.status === "approval-denied" && (
          <div className="flex flex-col gap-[4px]">
            <div className="flex items-center gap-[4px]">
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <circle cx="5" cy="5" r="4" stroke="#62707D" strokeWidth="0.8" />
                <path d="M3.5 3.5L6.5 6.5M6.5 3.5L3.5 6.5" stroke="#62707D" strokeWidth="0.8" strokeLinecap="round" />
              </svg>
              <span className="font-['Inter:Medium',sans-serif] font-medium text-[10px] leading-[13px] text-[#7e8e9e]">
                Approval declined
              </span>
            </div>
            <p className="font-['Inter:Regular',sans-serif] font-normal text-[10px] leading-[14px] text-[#4a5568]">
              This request was not approved. Contact your security manager if you believe this is incorrect.
            </p>
          </div>
        )}

        {/* Failed state */}
        {data.status === "failed" && (
          <div className="flex flex-col gap-[4px]">
            <div className="flex items-center gap-[4px]">
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <circle cx="5" cy="5" r="4" fill="rgba(239,68,68,0.08)" stroke="rgba(239,68,68,0.5)" strokeWidth="0.8" />
                <path d="M3.5 3.5L6.5 6.5M6.5 3.5L3.5 6.5" stroke="rgba(239,68,68,0.7)" strokeWidth="0.8" strokeLinecap="round" />
              </svg>
              <span className="font-['Inter:Medium',sans-serif] font-medium text-[10px] leading-[13px]" style={{ color: "rgba(239,68,68,0.7)" }}>
                Action could not be completed
              </span>
            </div>
            <p className="font-['Inter:Regular',sans-serif] font-normal text-[10px] leading-[14px] text-[#4a5568]">
              Execution failed before completion. Please try again or contact support.
            </p>
          </div>
        )}

        {/* Permission denied */}
        {data.userCanExecute === false && data.status === "pending" && (
          <div
            className="flex items-center gap-[5px] px-[8px] py-[5px] rounded-[5px]"
            style={{ background: "rgba(98,112,125,0.06)", border: "1px solid rgba(98,112,125,0.14)" }}
          >
            <svg width="9" height="9" viewBox="0 0 9 9" fill="none" className="shrink-0">
              <circle cx="4.5" cy="4.5" r="3.5" stroke="#62707D" strokeWidth="0.8" />
              <path d="M3 4.5h3" stroke="#62707D" strokeWidth="0.8" strokeLinecap="round" />
            </svg>
            <span className="font-['Inter:Regular',sans-serif] font-normal text-[10px] leading-[13px] text-[#4a5568]">
              {data.permissionMessage || "You do not have permission to perform this action."}
            </span>
          </div>
        )}

        {/* Read-only mode block */}
        {data.isReadOnly && data.status === "pending" && (
          <div
            className="flex items-center gap-[5px] px-[8px] py-[5px] rounded-[5px]"
            style={{ background: "rgba(98,112,125,0.06)", border: "1px solid rgba(98,112,125,0.14)" }}
          >
            <svg width="9" height="9" viewBox="0 0 9 9" fill="none" className="shrink-0">
              <rect x="2" y="4" width="5" height="3.5" rx="0.5" stroke="#62707D" strokeWidth="0.7" />
              <path d="M3 4V3a1.5 1.5 0 013 0v1" stroke="#62707D" strokeWidth="0.7" />
            </svg>
            <span className="font-['Inter:Regular',sans-serif] font-normal text-[10px] leading-[13px] text-[#4a5568]">
              This action is unavailable in read-only mode.
            </span>
          </div>
        )}

        {/* Complete state */}
        {data.status === "complete" && (
          <div className="flex flex-col gap-[4px]">
            <div className="flex items-center gap-[4px]">
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <circle cx="5" cy="5" r="4" fill="rgba(47,216,151,0.12)" stroke="#2fd897" strokeWidth="0.8" />
                <path d="M3 5L4.5 6.5L7 3.5" stroke="#2fd897" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="font-['Inter:Medium',sans-serif] font-medium text-[10px] leading-[13px] text-[#2fd897]">
                Completed
              </span>
            </div>
            <p className="font-['Inter:Regular',sans-serif] font-normal text-[10px] leading-[14px] text-[#7e8e9e]">
              {data.result || data.expectedOutcome}
            </p>
          </div>
        )}

        {/* Cancelled state */}
        {data.status === "cancelled" && (
          <div className="flex items-center gap-[4px]">
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <circle cx="5" cy="5" r="4" stroke="#62707D" strokeWidth="0.8" />
              <path d="M3.5 3.5L6.5 6.5M6.5 3.5L3.5 6.5" stroke="#62707D" strokeWidth="0.8" strokeLinecap="round" />
            </svg>
            <span className="font-['Inter:Medium',sans-serif] font-medium text-[10px] leading-[13px] text-[#4a5568]">
              Action cancelled
            </span>
          </div>
        )}
      </div>

      {/* Footer buttons — pending (view mode) */}
      {data.status === "pending" && !isEditing && !data.isReadOnly && data.userCanExecute !== false && (
        <div
          className="pl-[15px] pr-[12px] py-[8px] flex items-center gap-[8px]"
          style={{ borderTop: "1px solid rgba(14,28,38,0.8)" }}
        >
          {data.requiresApproval ? (
            <>
              <button
                onClick={handleRequestApproval}
                className="h-[24px] px-[12px] rounded-[5px] font-['Inter:Medium',sans-serif] font-medium text-[10px] leading-[12px] cursor-pointer border-none transition-colors"
                style={{ backgroundColor: "rgba(217,119,6,0.15)", color: "#d97706", border: "1px solid rgba(217,119,6,0.28)" }}
                onMouseEnter={e => { e.currentTarget.style.backgroundColor = "rgba(217,119,6,0.22)"; }}
                onMouseLeave={e => { e.currentTarget.style.backgroundColor = "rgba(217,119,6,0.15)"; }}
              >
                Request Approval
              </button>
              <button
                onClick={handleCancel}
                className="h-[24px] px-[8px] font-['Inter:Regular',sans-serif] font-normal text-[10px] text-[#5e7285] leading-[12px] cursor-pointer border-none bg-transparent transition-colors"
                onMouseEnter={e => { e.currentTarget.style.color = "#7e8e9e"; }}
                onMouseLeave={e => { e.currentTarget.style.color = "#5e7285"; }}
              >
                Cancel
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleRun}
                className="h-[24px] px-[12px] rounded-[5px] font-['Inter:Medium',sans-serif] font-medium text-[10px] text-white leading-[12px] cursor-pointer border-none transition-colors"
                style={{ backgroundColor: "#076498" }}
                onMouseEnter={e => { e.currentTarget.style.backgroundColor = "#0879b5"; }}
                onMouseLeave={e => { e.currentTarget.style.backgroundColor = "#076498"; }}
              >
                Run
              </button>
              <button
                onClick={handleModify}
                className="h-[24px] px-[10px] rounded-[5px] font-['Inter:Medium',sans-serif] font-medium text-[10px] leading-[12px] cursor-pointer border-none transition-colors"
                style={{ backgroundColor: "rgba(87,177,255,0.07)", color: "#57b1ff", border: "1px solid rgba(87,177,255,0.14)" }}
                onMouseEnter={e => { e.currentTarget.style.backgroundColor = "rgba(87,177,255,0.13)"; }}
                onMouseLeave={e => { e.currentTarget.style.backgroundColor = "rgba(87,177,255,0.07)"; }}
              >
                Modify
              </button>
              <button
                onClick={handleCancel}
                className="h-[24px] px-[8px] font-['Inter:Regular',sans-serif] font-normal text-[10px] text-[#5e7285] leading-[12px] cursor-pointer border-none bg-transparent transition-colors"
                onMouseEnter={e => { e.currentTarget.style.color = "#7e8e9e"; }}
                onMouseLeave={e => { e.currentTarget.style.color = "#5e7285"; }}
              >
                Cancel
              </button>
            </>
          )}
        </div>
      )}

      {/* Footer — awaiting approval */}
      {data.status === "awaiting-approval" && (
        <div
          className="pl-[15px] pr-[12px] py-[8px] flex items-center gap-[8px]"
          style={{ borderTop: "1px solid rgba(14,28,38,0.8)" }}
        >
          <button
            onClick={handleDenyApproval}
            className="h-[24px] px-[8px] font-['Inter:Regular',sans-serif] font-normal text-[10px] text-[#5e7285] leading-[12px] cursor-pointer border-none bg-transparent transition-colors"
            onMouseEnter={e => { e.currentTarget.style.color = "#7e8e9e"; }}
            onMouseLeave={e => { e.currentTarget.style.color = "#5e7285"; }}
          >
            Cancel request
          </button>
        </div>
      )}

      {/* Footer — approval denied */}
      {data.status === "approval-denied" && (
        <div
          className="pl-[15px] pr-[12px] py-[8px] flex items-center"
          style={{ borderTop: "1px solid rgba(14,28,38,0.8)" }}
        >
          <button
            onClick={handleCancel}
            className="h-[24px] px-[8px] font-['Inter:Regular',sans-serif] font-normal text-[10px] text-[#5e7285] leading-[12px] cursor-pointer border-none bg-transparent transition-colors"
            onMouseEnter={e => { e.currentTarget.style.color = "#7e8e9e"; }}
            onMouseLeave={e => { e.currentTarget.style.color = "#5e7285"; }}
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Footer buttons — edit mode */}
      {data.status === "pending" && isEditing && (
        <div
          className="pl-[15px] pr-[12px] py-[8px] flex items-center gap-[8px]"
          style={{ borderTop: "1px solid rgba(87,177,255,0.08)" }}
        >
          <button
            onClick={handleSaveEdit}
            className="h-[24px] px-[12px] rounded-[5px] font-['Inter:Medium',sans-serif] font-medium text-[10px] text-white leading-[12px] cursor-pointer border-none transition-colors"
            style={{ backgroundColor: "#076498" }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = "#0879b5"; }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = "#076498"; }}
          >
            Save
          </button>
          <button
            onClick={handleCancelEdit}
            className="h-[24px] px-[8px] font-['Inter:Regular',sans-serif] font-normal text-[10px] text-[#5e7285] leading-[12px] cursor-pointer border-none bg-transparent transition-colors"
            onMouseEnter={e => { e.currentTarget.style.color = "#7e8e9e"; }}
            onMouseLeave={e => { e.currentTarget.style.color = "#5e7285"; }}
          >
            Cancel
          </button>
        </div>
      )}

      {/* Running — show cancel */}
      {data.status === "running" && (
        <div
          className="pl-[15px] pr-[12px] py-[8px] flex items-center"
          style={{ borderTop: "1px solid rgba(14,28,38,0.8)" }}
        >
          <button
            onClick={handleCancel}
            className="h-[24px] px-[8px] font-['Inter:Regular',sans-serif] font-normal text-[10px] text-[#5e7285] leading-[12px] cursor-pointer border-none bg-transparent transition-colors"
            onMouseEnter={e => { e.currentTarget.style.color = "#7e8e9e"; }}
            onMouseLeave={e => { e.currentTarget.style.color = "#5e7285"; }}
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
});
