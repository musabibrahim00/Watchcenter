/**
 * ActionableEvidenceRow
 *
 * Inline-expandable evidence row used in both:
 *   - CompliancePage  (Evidence Tracker section)
 *   - ComplianceFrameworkPage  (Control Detail Panel + Default Sidebar)
 *
 * Compact by default. Clicking opens an inline accordion with:
 *   - Status toggle (Collected / Pending / Overdue)
 *   - Note textarea (auto-saved on blur)
 *   - Owner input / select
 *   - Suggested source
 *   - AI action button
 */

import React, { useRef, useState } from "react";
import {
  CheckCircle2, XCircle, AlertCircle,
  FileText, ChevronDown, ChevronUp,
  Sparkles, Info,
} from "lucide-react";
import { colors } from "../../shared/design-system/tokens";
import { useAiBox } from "../ai-box";
import { type MergedEvidenceItem } from "./evidence-store";
import type { EvidenceStatus } from "../../pages/compliance-data";

/* ── helpers ─────────────────────────────────────────────────── */

const STATUS_COLOR: Record<EvidenceStatus, string> = {
  collected: colors.success,
  pending:   colors.medium,
  overdue:   colors.critical,
};

const STATUS_ICON: Record<EvidenceStatus, React.ReactNode> = {
  collected: <CheckCircle2 size={12} color={colors.success}  />,
  pending:   <AlertCircle  size={12} color={colors.medium}   />,
  overdue:   <XCircle      size={12} color={colors.critical} />,
};

const OWNERS = [
  "Identity Team", "Platform Engineering", "Security Operations",
  "Compliance Team", "Procurement", "Payment Security",
  "CISO Office", "Vulnerability Team", "Configuration Team", "DevOps", "Legal",
];

/* ── Status toggle button ────────────────────────────────────── */

function StatusBtn({
  label, active, color, onClick,
}: {
  label: string; active: boolean; color: string; onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-[5px] px-[9px] py-[5px] rounded-[6px] text-[11px] font-medium cursor-pointer transition-colors"
      style={{
        background: active ? `${color}20` : "rgba(255,255,255,0.04)",
        color:      active ? color         : colors.textDim,
        border:     `1px solid ${active ? color + "40" : "rgba(255,255,255,0.07)"}`,
        fontWeight: active ? 700 : 500,
      }}
      onMouseEnter={(e) => {
        if (!active) (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.07)";
      }}
      onMouseLeave={(e) => {
        if (!active) (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.04)";
      }}
    >
      {STATUS_ICON[label.toLowerCase() as EvidenceStatus]}
      {label}
    </button>
  );
}

/* ── Component ───────────────────────────────────────────────── */

export function ActionableEvidenceRow({
  ev,
  onUpdate,
  compact = false,
}: {
  ev: MergedEvidenceItem;
  onUpdate: (id: string, patch: { status?: EvidenceStatus; collector?: string; note?: string }) => void;
  compact?: boolean; // tighter padding for use inside panels
}) {
  const [open, setOpen]         = useState(false);
  const [note, setNote]         = useState(ev.note);
  const [owner, setOwner]       = useState(ev.collector);
  const noteRef                 = useRef<HTMLTextAreaElement>(null);
  const { openWithContext }      = useAiBox();

  const statusColor = STATUS_COLOR[ev.status];
  const isOverdue   = ev.status === "overdue";

  function handleStatusChange(s: EvidenceStatus) {
    onUpdate(ev.id, { status: s });
  }

  function handleNoteBlur() {
    if (note !== ev.note) onUpdate(ev.id, { note });
  }

  function handleOwnerChange(v: string) {
    setOwner(v);
    onUpdate(ev.id, { collector: v });
  }

  function handleAI() {
    openWithContext({
      type: "general",
      label: ev.name,
      sublabel: `Evidence — ${ev.control}`,
      contextKey: `compliance-evidence-${ev.id}`,
      suggestions: [
        { label: "What exactly should this contain?",   prompt: `What should the "${ev.name}" evidence artifact contain to satisfy ${ev.control} requirements?` },
        { label: "Where do I find this?",               prompt: `Where can I find or generate "${ev.name}" for the ${ev.control} control? Give me exact steps.` },
        { label: "Who should collect this?",            prompt: `Who is best positioned to collect "${ev.name}" for ${ev.control}, and what do I need to ask them for?` },
        { label: "What format do auditors want?",       prompt: `What format and level of detail do auditors expect for "${ev.name}" when reviewing ${ev.control}?` },
      ],
      greeting: `You're working on "${ev.name}" — evidence for control ${ev.control}. It's currently ${ev.status} and due ${ev.dueDate}. ${ev.status === "overdue" ? "This is overdue and needs immediate attention." : "How can I help you collect or validate this?"} `,
    });
  }

  const p = compact ? "px-[12px] py-[9px]" : "px-[12px] py-[10px]";

  return (
    <div
      className="rounded-[8px] overflow-hidden"
      style={{
        background: isOverdue ? `${colors.critical}07` : open ? "rgba(255,255,255,0.025)" : "transparent",
        border: `1px solid ${open ? statusColor + "40" : isOverdue ? colors.critical + "28" : colors.border}`,
        marginBottom: 3,
        transition: "border-color 0.15s ease",
      }}
    >
      {/* ── Collapsed row ── */}
      <button
        onClick={() => setOpen(v => !v)}
        className={`w-full flex items-center gap-[10px] ${p} text-left cursor-pointer`}
        style={{ outline: "none", background: "transparent" }}
      >
        <div className="shrink-0">{STATUS_ICON[ev.status]}</div>

        <div className="flex-1 min-w-0">
          <p style={{ fontSize: 11, fontWeight: 600, color: colors.textPrimary, lineHeight: 1.3 }} className="truncate">
            {ev.name}
          </p>
          <p style={{ fontSize: 10, color: colors.textDim }}>
            {ev.control} · {ev.collector}{ev.note ? " · has note" : ""}
          </p>
        </div>

        <div className="shrink-0 flex items-center gap-[8px]">
          <div className="text-right">
            <span
              className="px-[6px] py-[1px] rounded-[4px] text-[9px] font-semibold capitalize"
              style={{ background: `${statusColor}18`, color: statusColor }}
            >
              {ev.status}
            </span>
            <p style={{ fontSize: 9, color: isOverdue ? colors.critical : colors.textDim, marginTop: 1 }}>
              Due {ev.dueDate}
            </p>
          </div>
          <div style={{ color: colors.textDim }}>
            {open ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </div>
        </div>
      </button>

      {/* ── Expanded detail ── */}
      {open && (
        <div
          className="flex flex-col gap-[12px] px-[12px] pb-[14px]"
          style={{ borderTop: `1px solid rgba(255,255,255,0.06)` }}
        >
          <div className="pt-[12px] flex flex-col gap-[12px]">

            {/* Status toggle */}
            <div>
              <p style={{ fontSize: 10, fontWeight: 600, color: colors.textDim, marginBottom: 6, letterSpacing: "0.06em", textTransform: "uppercase" }}>
                Status
              </p>
              <div className="flex gap-[6px] flex-wrap">
                <StatusBtn label="Collected" active={ev.status === "collected"} color={colors.success}  onClick={() => handleStatusChange("collected")} />
                <StatusBtn label="Pending"   active={ev.status === "pending"}   color={colors.medium}   onClick={() => handleStatusChange("pending")}   />
                <StatusBtn label="Overdue"   active={ev.status === "overdue"}   color={colors.critical} onClick={() => handleStatusChange("overdue")}   />
              </div>
            </div>

            {/* Owner */}
            <div>
              <p style={{ fontSize: 10, fontWeight: 600, color: colors.textDim, marginBottom: 6, letterSpacing: "0.06em", textTransform: "uppercase" }}>
                Owner
              </p>
              <select
                value={owner}
                onChange={(e) => handleOwnerChange(e.target.value)}
                className="w-full rounded-[6px] px-[9px] py-[6px] text-[11px] cursor-pointer"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: `1px solid rgba(255,255,255,0.1)`,
                  color: colors.textPrimary,
                  outline: "none",
                  appearance: "none",
                  WebkitAppearance: "none",
                }}
              >
                {OWNERS.map(o => (
                  <option key={o} value={o} style={{ background: "#0d1117", color: colors.textPrimary }}>{o}</option>
                ))}
              </select>
            </div>

            {/* Suggested source */}
            {ev.suggestedSource && (
              <div
                className="flex items-start gap-[7px] p-[9px] rounded-[7px]"
                style={{ background: `${colors.primary}0a`, border: `1px solid ${colors.primary}1a` }}
              >
                <Info size={11} color={colors.primary} className="mt-[1px] shrink-0" />
                <div>
                  <p style={{ fontSize: 10, fontWeight: 600, color: colors.primary, marginBottom: 2 }}>Where to find this</p>
                  <p style={{ fontSize: 11, color: colors.textMuted, lineHeight: 1.5 }}>{ev.suggestedSource}</p>
                </div>
              </div>
            )}

            {/* Description */}
            {ev.description && (
              <p style={{ fontSize: 11, color: colors.textMuted, lineHeight: 1.5 }}>
                {ev.description}
              </p>
            )}

            {/* Note */}
            <div>
              <p style={{ fontSize: 10, fontWeight: 600, color: colors.textDim, marginBottom: 6, letterSpacing: "0.06em", textTransform: "uppercase" }}>
                Note
              </p>
              <textarea
                ref={noteRef}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                onBlur={handleNoteBlur}
                placeholder="Add a note about this evidence item..."
                rows={2}
                className="w-full rounded-[6px] px-[9px] py-[7px] text-[11px] resize-none"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: `1px solid rgba(255,255,255,0.1)`,
                  color: colors.textPrimary,
                  outline: "none",
                  lineHeight: 1.5,
                }}
                onFocus={(e) => { (e.target as HTMLTextAreaElement).style.borderColor = colors.primary + "55"; }}
                onBlurCapture={(e) => { (e.target as HTMLTextAreaElement).style.borderColor = "rgba(255,255,255,0.1)"; }}
              />
              {note !== ev.note && (
                <button
                  onClick={() => { onUpdate(ev.id, { note }); }}
                  className="mt-[5px] px-[9px] py-[4px] rounded-[5px] text-[10px] font-semibold cursor-pointer"
                  style={{ background: `${colors.primary}18`, color: colors.primary, border: `1px solid ${colors.primary}28` }}
                >
                  Save note
                </button>
              )}
            </div>

            {/* AI action */}
            <button
              onClick={handleAI}
              className="w-full flex items-center justify-center gap-[6px] py-[8px] rounded-[7px] text-[11px] font-semibold cursor-pointer transition-colors"
              style={{ background: `${colors.primary}14`, color: colors.primary, border: `1px solid ${colors.primary}22` }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = `${colors.primary}22`; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = `${colors.primary}14`; }}
            >
              <Sparkles size={11} />
              Suggest what to collect
            </button>

          </div>
        </div>
      )}
    </div>
  );
}
