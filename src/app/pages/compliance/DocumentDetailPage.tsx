import React, { useState } from "react";
import { useParams, useNavigate } from "react-router";
import {
  ArrowLeft, CheckCircle2, XCircle, AlertCircle, Clock,
  FileText, Upload, Link, Download, MoreHorizontal,
  User, Calendar, RefreshCw, Plus, Trash2,
} from "lucide-react";
import { colors } from "../../shared/design-system/tokens";
import { EVIDENCE_ITEMS, FRAMEWORK_CONTROLS, type EvidenceStatus } from "../compliance-data";
import { useEvidenceStore } from "../../features/compliance/evidence-store";

/* ── Status helpers ─────────────────────────────────────────────── */
const EV_STATUS_COLOR: Record<EvidenceStatus, string> = {
  collected: colors.success,
  pending:   colors.medium,
  overdue:   colors.critical,
};

const EV_STATUS_ICON: Record<EvidenceStatus, React.ReactNode> = {
  collected: <CheckCircle2 size={13} color={colors.success}  />,
  pending:   <Clock        size={13} color={colors.medium}   />,
  overdue:   <XCircle      size={13} color={colors.critical} />,
};

/* ================================================================
   DOCUMENT DETAIL PAGE
   ================================================================ */

export default function DocumentDetailPage() {
  const { frameworkId, documentId } = useParams<{ frameworkId: string; documentId: string }>();
  const navigate = useNavigate();
  const { items } = useEvidenceStore();

  const [activeTab, setActiveTab] = useState<"evidence" | "tasks" | "controls" | "audits" | "comments">("evidence");

  // Find document from static EVIDENCE_ITEMS (or store override)
  const staticDoc = EVIDENCE_ITEMS.find(e => e.id === documentId);
  const storeDoc  = items.find(e => e.id === documentId);
  const doc       = storeDoc ?? staticDoc;

  // Linked controls
  const linkedControls = (FRAMEWORK_CONTROLS[frameworkId ?? ""] ?? [])
    .filter(c => c.id === doc?.control);

  const tabs = [
    { id: "evidence",  label: "Evidence" },
    { id: "tasks",     label: "Tasks 0" },
    { id: "controls",  label: `Controls ${linkedControls.length}` },
    { id: "audits",    label: "Audits" },
    { id: "comments",  label: "Comments 0" },
  ];

  if (!doc) {
    return (
      <div className="flex items-center justify-center h-full">
        <p style={{ color: colors.textDim, fontSize: 13 }}>Document not found.</p>
      </div>
    );
  }

  const statusColor = EV_STATUS_COLOR[doc.status];

  return (
    <div className="flex flex-col h-full overflow-hidden" style={{ background: colors.bgApp }}>
      <div className="flex-1 overflow-y-auto px-[32px] py-[24px]">

        {/* Back nav */}
        <button
          onClick={() => navigate(`/compliance/${frameworkId}?tab=documents`)}
          className="flex items-center gap-[5px] text-[11px] cursor-pointer mb-[20px] transition-colors"
          style={{ color: colors.textDim, background: "none", border: "none", padding: 0 }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = colors.textMuted; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = colors.textDim; }}
        >
          <ArrowLeft size={11} />
          Back to Documents
        </button>

        {/* Header */}
        <div className="flex items-start justify-between gap-[16px] mb-[8px]">
          <div className="flex-1 min-w-0">
            <h1 style={{ fontSize: 20, fontWeight: 700, color: colors.textPrimary, lineHeight: 1.3 }}>
              {doc.name}
            </h1>
            <p style={{ fontSize: 12, color: colors.textMuted, marginTop: 6, lineHeight: 1.6, maxWidth: 640 }}>
              {doc.description}
            </p>
          </div>
          {/* Actions */}
          <div className="flex items-center gap-[8px] shrink-0 mt-[2px]">
            <button
              className="flex items-center gap-[5px] px-[10px] py-[6px] rounded-[7px] text-[11px] font-medium cursor-pointer"
              style={{ background: "rgba(255,255,255,0.05)", color: colors.textMuted, border: `1px solid ${colors.border}` }}
            >
              <MoreHorizontal size={12} />
            </button>
            <button
              className="flex items-center gap-[5px] px-[10px] py-[6px] rounded-[7px] text-[11px] font-medium cursor-pointer"
              style={{ background: "rgba(255,255,255,0.05)", color: colors.textMuted, border: `1px solid ${colors.border}` }}
            >
              <User size={11} />
            </button>
            <button
              className="flex items-center gap-[6px] px-[12px] py-[6px] rounded-[7px] text-[11px] font-semibold cursor-pointer"
              style={{ background: "rgba(255,255,255,0.06)", color: colors.textMuted, border: `1px solid ${colors.border}` }}
            >
              <FileText size={11} />
            </button>
          </div>
        </div>

        {/* Meta chips */}
        <div className="flex items-center gap-[12px] mb-[20px] flex-wrap">
          <span className="flex items-center gap-[4px] text-[11px]" style={{ color: colors.textMuted }}>
            <User size={10} />
            {doc.collector}
          </span>
          <span className="flex items-center gap-[4px] text-[11px]" style={{ color: colors.textDim }}>
            <Clock size={10} />
            Upload anytime
          </span>
          <span className="flex items-center gap-[4px] text-[11px]" style={{ color: colors.textDim }}>
            <RefreshCw size={10} />
            Renew annually
          </span>
          <span className="flex items-center gap-[4px] text-[11px]" style={{ color: colors.textDim }}>
            Custom
          </span>
        </div>

        {/* Tabs */}
        <div className="flex gap-0 mb-[20px]" style={{ borderBottom: `1px solid ${colors.border}` }}>
          {tabs.map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className="px-[14px] py-[8px] text-[12px] font-medium cursor-pointer"
                style={{
                  color: isActive ? colors.textPrimary : colors.textDim,
                  background: "none",
                  border: "none",
                  borderBottom: `2px solid ${isActive ? colors.accent : "transparent"}`,
                  marginBottom: -1,
                  paddingBottom: 9,
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* ── EVIDENCE TAB ── */}
        {activeTab === "evidence" && (
          <div className="flex flex-col gap-[12px] max-w-[680px]">

            {/* Current draft / upload area */}
            <div
              className="rounded-[10px] overflow-hidden"
              style={{ border: `1px solid ${statusColor}33`, background: colors.bgCard }}
            >
              {/* Draft header */}
              <div className="flex items-center justify-between gap-[10px] px-[16px] py-[12px]"
                style={{ borderBottom: `1px solid ${colors.border}` }}>
                <div className="flex items-center gap-[9px]">
                  <div className="flex items-center justify-center size-[30px] rounded-[6px]"
                    style={{ background: "rgba(255,255,255,0.05)" }}>
                    {EV_STATUS_ICON[doc.status]}
                  </div>
                  <div>
                    <p style={{ fontSize: 12, fontWeight: 600, color: colors.textPrimary }}>
                      {doc.status === "collected" ? "Submitted version" : "Get started"}
                    </p>
                    <p style={{ fontSize: 10, color: colors.textDim }}>
                      {doc.status === "collected" ? `Collected · due ${doc.dueDate}` : "Add files to start a draft"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-[6px]">
                  <button
                    className="flex items-center gap-[4px] px-[8px] py-[4px] rounded-[6px] text-[10px] font-medium cursor-pointer"
                    style={{ background: "rgba(255,255,255,0.05)", color: colors.textDim, border: `1px solid ${colors.border}` }}
                  >
                    <MoreHorizontal size={11} />
                  </button>
                  <button
                    className="flex items-center gap-[5px] px-[10px] py-[4px] rounded-[6px] text-[11px] font-semibold cursor-pointer"
                    style={{
                      background: doc.status === "collected" ? `${colors.success}14` : "rgba(255,255,255,0.06)",
                      color: doc.status === "collected" ? colors.success : colors.textMuted,
                      border: `1px solid ${doc.status === "collected" ? colors.success + "28" : colors.border}`,
                    }}
                  >
                    {doc.status === "collected" ? <CheckCircle2 size={10} /> : <Upload size={10} />}
                    {doc.status === "collected" ? "Submitted" : "Submit"}
                  </button>
                </div>
              </div>

              {/* Upload actions row */}
              <div className="flex items-center gap-[12px] px-[16px] py-[10px]"
                style={{ borderBottom: `1px solid ${colors.border}` }}>
                <button className="flex items-center gap-[5px] text-[11px] font-medium cursor-pointer"
                  style={{ color: colors.textMuted, background: "none", border: "none", padding: 0 }}>
                  <Upload size={11} />
                  Upload
                </button>
                <button className="flex items-center gap-[5px] text-[11px] font-medium cursor-pointer"
                  style={{ color: colors.textMuted, background: "none", border: "none", padding: 0 }}>
                  <Link size={11} />
                  Add URL
                </button>
                <button className="flex items-center gap-[5px] text-[11px] font-medium cursor-pointer"
                  style={{ color: colors.textMuted, background: "none", border: "none", padding: 0 }}>
                  <Download size={11} />
                  Import
                </button>
              </div>

              {/* Drop zone */}
              <div className="flex flex-col items-center justify-center py-[32px] px-[16px]"
                style={{
                  borderWidth: 2,
                  borderStyle: "dashed",
                  borderColor: "rgba(255,255,255,0.08)",
                  margin: "12px 16px",
                  borderRadius: 8,
                  background: "rgba(255,255,255,0.01)",
                }}>
                {doc.status === "collected" ? (
                  <div className="flex items-center gap-[10px]">
                    <FileText size={14} color={colors.success} />
                    <div>
                      <p style={{ fontSize: 12, fontWeight: 600, color: colors.textPrimary }}>{doc.name}.pdf</p>
                      <p style={{ fontSize: 10, color: colors.textDim }}>Last updated {doc.lastUpdated} · {doc.collector}</p>
                    </div>
                    <button className="ml-[12px]"
                      style={{ background: "none", border: "none", cursor: "pointer", color: colors.textDim }}>
                      <Trash2 size={12} />
                    </button>
                  </div>
                ) : (
                  <>
                    <p style={{ fontSize: 12, fontWeight: 500, color: colors.textMuted }}>
                      Add documents, screenshots, and links as supporting evidence
                    </p>
                    <p style={{ fontSize: 10, color: colors.textDim, marginTop: 4 }}>
                      Tip: You can drag files here to upload. Upload files up to 50 MB of selected file types
                    </p>
                  </>
                )}
              </div>
            </div>

            {/* Suggested source */}
            {doc.suggestedSource && (
              <div className="p-[14px] rounded-[9px]"
                style={{ background: `${colors.primary}0a`, border: `1px solid ${colors.primary}20` }}>
                <p style={{ fontSize: 10, fontWeight: 700, color: colors.textDim, letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: 5 }}>
                  Where to find this
                </p>
                <p style={{ fontSize: 11, color: colors.textMuted, lineHeight: 1.55 }}>
                  {doc.suggestedSource}
                </p>
              </div>
            )}

            {/* No prior versions */}
            <div
              className="flex items-center gap-[10px] p-[16px] rounded-[10px]"
              style={{ border: `1px solid ${colors.border}`, background: colors.bgCard }}
            >
              <div className="flex items-center justify-center size-[32px] rounded-[7px] shrink-0"
                style={{ background: "rgba(255,255,255,0.04)" }}>
                <RefreshCw size={14} color={colors.textDim} />
              </div>
              <div>
                <p style={{ fontSize: 12, fontWeight: 600, color: colors.textMuted }}>No prior versions</p>
                <p style={{ fontSize: 10, color: colors.textDim, marginTop: 1 }}>Previously completed versions will show up here</p>
              </div>
            </div>
          </div>
        )}

        {/* ── TASKS TAB ── */}
        {activeTab === "tasks" && (
          <div className="flex flex-col gap-[12px] max-w-[680px]">
            <button
              className="flex items-center gap-[6px] px-[12px] py-[7px] rounded-[7px] text-[11px] font-semibold cursor-pointer w-fit"
              style={{ background: "rgba(255,255,255,0.05)", color: colors.textMuted, border: `1px solid ${colors.border}` }}
            >
              <Plus size={11} />
              Add task
            </button>
            <div className="flex items-center justify-center p-[48px] rounded-[10px]"
              style={{ background: colors.bgCard, border: `1px solid ${colors.border}` }}>
              <p style={{ fontSize: 12, color: colors.textDim }}>No tasks associated with this document.</p>
            </div>
          </div>
        )}

        {/* ── CONTROLS TAB ── */}
        {activeTab === "controls" && (
          <div className="flex flex-col gap-[8px] max-w-[680px]">
            {linkedControls.length === 0 ? (
              <div className="flex items-center justify-center p-[32px] rounded-[10px]"
                style={{ background: colors.bgCard, border: `1px solid ${colors.border}` }}>
                <p style={{ fontSize: 12, color: colors.textDim }}>No controls linked to this document.</p>
              </div>
            ) : (
              <div className="rounded-[10px] overflow-hidden"
                style={{ border: `1px solid ${colors.border}`, background: colors.bgCard }}>
                {linkedControls.map((ctrl, i) => (
                  <div key={ctrl.id}
                    className="flex items-center gap-[12px] px-[14px] py-[11px]"
                    style={{ borderBottom: i < linkedControls.length - 1 ? `1px solid ${colors.border}` : "none" }}>
                    <span className="text-[11px] font-mono font-semibold shrink-0" style={{ color: colors.accent, width: 64 }}>
                      {ctrl.id}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p style={{ fontSize: 12, fontWeight: 600, color: colors.textPrimary }} className="truncate">{ctrl.name}</p>
                    </div>
                    <span
                      className="px-[6px] py-[1px] rounded-full text-[9px] font-semibold capitalize shrink-0"
                      style={{
                        background: ctrl.status === "passing" ? `${colors.success}14` : `${colors.critical}14`,
                        color: ctrl.status === "passing" ? colors.success : colors.critical,
                      }}
                    >
                      {ctrl.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── AUDITS TAB ── */}
        {activeTab === "audits" && (
          <div className="flex items-center justify-center p-[48px] rounded-[10px] max-w-[680px]"
            style={{ background: colors.bgCard, border: `1px solid ${colors.border}` }}>
            <div className="flex flex-col items-center gap-[6px]">
              <Calendar size={20} color={colors.textDim} />
              <p style={{ fontSize: 12, color: colors.textDim }}>No audit entries for this document yet.</p>
            </div>
          </div>
        )}

        {/* ── COMMENTS TAB ── */}
        {activeTab === "comments" && (
          <div className="flex flex-col gap-[12px] max-w-[680px]">
            <textarea
              placeholder="Add a comment…"
              rows={3}
              className="w-full px-[12px] py-[10px] rounded-[8px] text-[12px] outline-none resize-none"
              style={{ background: colors.bgCard, border: `1px solid ${colors.border}`, color: colors.textPrimary, lineHeight: 1.5 }}
            />
            <div className="flex items-center justify-center p-[32px] rounded-[10px]"
              style={{ background: colors.bgCard, border: `1px solid ${colors.border}` }}>
              <p style={{ fontSize: 12, color: colors.textDim }}>No comments yet.</p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
