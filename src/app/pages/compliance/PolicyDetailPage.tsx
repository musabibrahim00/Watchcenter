import React, { useState } from "react";
import { useParams, useNavigate } from "react-router";
import {
  ArrowLeft, CheckCircle2, XCircle, AlertCircle, Clock,
  FileText, Download, MoreHorizontal, RefreshCw, Shield,
  Calendar, User, ChevronDown, ChevronRight,
} from "lucide-react";
import { colors } from "../../shared/design-system/tokens";
import { FRAMEWORK_POLICIES, FRAMEWORKS, FRAMEWORK_CONTROLS, type PolicyStatus } from "../compliance-data";

/* ── Status helpers ─────────────────────────────────────────────── */

const STATUS_COLOR: Record<PolicyStatus, string> = {
  approved:       colors.success,
  "under-review": colors.medium,
  draft:          colors.textDim,
  expired:        colors.critical,
};

const STATUS_ICON: Record<PolicyStatus, React.ReactNode> = {
  approved:       <CheckCircle2 size={13} color={colors.success}  />,
  "under-review": <AlertCircle  size={13} color={colors.medium}   />,
  draft:          <Clock        size={13} color={colors.textDim}  />,
  expired:        <XCircle      size={13} color={colors.critical} />,
};

const STATUS_LABEL: Record<PolicyStatus, string> = {
  approved:       "Approved",
  "under-review": "Under Review",
  draft:          "Draft",
  expired:        "Expired — Needs Remediation",
};

/* ── Renew cadence derivation ────────────────────────────────────── */
function deriveCadence(nextReview?: string): string {
  if (!nextReview) return "Annual";
  if (nextReview.includes("2027") || nextReview.toLowerCase().includes("jan") || nextReview.toLowerCase().includes("feb")) return "Annual";
  return "Semi-annual";
}

/* ── Section label ───────────────────────────────────────────────── */
const SECTION_LABEL = { fontSize: 10, fontWeight: 700, color: colors.textDim, letterSpacing: "0.07em", textTransform: "uppercase" as const };

/* ================================================================
   POLICY DETAIL PAGE
   ================================================================ */

export default function PolicyDetailPage() {
  const { frameworkId, policyId } = useParams<{ frameworkId: string; policyId: string }>();
  const navigate = useNavigate();

  const framework = FRAMEWORKS.find(f => f.id === frameworkId);
  const policies  = FRAMEWORK_POLICIES[frameworkId ?? ""] ?? [];
  const policy    = policies.find(p => p.id === policyId);

  const [activeTab, setActiveTab] = useState<"versions" | "controls" | "audits" | "comments">("versions");
  const [versionExpanded, setVersionExpanded] = useState(true);
  const [renewExpanded, setRenewExpanded]     = useState(true);

  if (!policy || !framework) {
    return (
      <div className="flex items-center justify-center h-full">
        <p style={{ color: colors.textDim, fontSize: 13 }}>Policy not found.</p>
      </div>
    );
  }

  const statusColor = STATUS_COLOR[policy.status];
  const cadence     = deriveCadence(policy.nextReview);

  // Linked controls
  const linkedControls = (FRAMEWORK_CONTROLS[frameworkId ?? ""] ?? [])
    .filter(c => policy.controlIds?.includes(c.id));

  const tabs = [
    { id: "versions",  label: "Policy versions" },
    { id: "controls",  label: `Controls ${linkedControls.length > 0 ? linkedControls.length : ""}` },
    { id: "audits",    label: "Audits" },
    { id: "comments",  label: "Comments" },
  ];

  return (
    <div className="flex flex-col h-full overflow-hidden" style={{ background: colors.bgApp }}>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto px-[32px] py-[24px]">

        {/* Back nav */}
        <button
          onClick={() => navigate(`/compliance/${frameworkId}?tab=policies`)}
          className="flex items-center gap-[5px] text-[11px] cursor-pointer mb-[20px] transition-colors"
          style={{ color: colors.textDim, background: "none", border: "none", padding: 0 }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = colors.textMuted; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = colors.textDim; }}
        >
          <ArrowLeft size={11} />
          Back to Policies
        </button>

        {/* Header */}
        <div className="flex items-start justify-between gap-[16px] mb-[8px]">
          <div className="flex-1 min-w-0">
            <h1 style={{ fontSize: 22, fontWeight: 700, color: colors.textPrimary, lineHeight: 1.25 }}>
              {policy.name}
            </h1>
            <p style={{ fontSize: 12, color: colors.textMuted, marginTop: 6, lineHeight: 1.6, maxWidth: 640 }}>
              {policy.summary}
            </p>
          </div>
          {/* Actions */}
          <div className="flex items-center gap-[8px] shrink-0 mt-[2px]">
            <button
              className="flex items-center gap-[5px] px-[10px] py-[6px] rounded-[7px] text-[11px] font-medium cursor-pointer transition-colors"
              style={{ background: "rgba(255,255,255,0.05)", color: colors.textMuted, border: `1px solid ${colors.border}` }}
            >
              <MoreHorizontal size={12} />
            </button>
            <button
              className="flex items-center gap-[5px] px-[10px] py-[6px] rounded-[7px] text-[11px] font-medium cursor-pointer transition-colors"
              style={{ background: "rgba(255,255,255,0.05)", color: colors.textMuted, border: `1px solid ${colors.border}` }}
            >
              <User size={11} />
            </button>
            <button
              className="flex items-center gap-[6px] px-[12px] py-[6px] rounded-[7px] text-[11px] font-semibold cursor-pointer transition-colors"
              style={{ background: "rgba(255,255,255,0.06)", color: colors.textMuted, border: `1px solid ${colors.border}` }}
            >
              <FileText size={11} />
              Edit details
            </button>
          </div>
        </div>

        {/* Status + meta chips */}
        <div className="flex items-center gap-[12px] mb-[20px] flex-wrap">
          <span className="flex items-center gap-[5px] px-[8px] py-[3px] rounded-[5px] text-[11px] font-semibold"
            style={{ background: `${statusColor}14`, color: statusColor, border: `1px solid ${statusColor}28` }}>
            {STATUS_ICON[policy.status]}
            {STATUS_LABEL[policy.status]}
          </span>
          <span className="flex items-center gap-[4px] text-[11px]" style={{ color: colors.textDim }}>
            <RefreshCw size={10} />
            Renew {cadence.toLowerCase()}
          </span>
          <span className="flex items-center gap-[4px] text-[11px]" style={{ color: colors.textDim }}>
            <Shield size={10} />
            Frameworks ({1})
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
                className="px-[14px] py-[8px] text-[12px] font-medium cursor-pointer transition-colors"
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

        {/* ── POLICY VERSIONS TAB ── */}
        {activeTab === "versions" && (
          <div className="flex flex-col gap-[12px] max-w-[680px]">

            {/* Renew card */}
            {policy.status !== "approved" && (
              <div
                className="rounded-[10px] overflow-hidden"
                style={{ border: `1px solid ${statusColor}33`, background: `${statusColor}06` }}
              >
                <button
                  className="w-full flex items-center gap-[10px] px-[16px] py-[14px] cursor-pointer"
                  onClick={() => setRenewExpanded(p => !p)}
                  style={{ background: "none", border: "none", textAlign: "left" }}
                >
                  <div
                    className="flex items-center justify-center size-[32px] rounded-[7px] shrink-0"
                    style={{ background: `${statusColor}14` }}
                  >
                    {policy.status === "expired" ? <XCircle size={15} color={statusColor} /> : <RefreshCw size={15} color={statusColor} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p style={{ fontSize: 13, fontWeight: 600, color: colors.textPrimary }}>
                      {policy.status === "expired"
                        ? `Renew before ${policy.nextReview ?? "soon"}`
                        : `Review in progress — due ${policy.nextReview ?? "soon"}`}
                    </p>
                  </div>
                  {renewExpanded ? <ChevronDown size={14} color={colors.textDim} /> : <ChevronRight size={14} color={colors.textDim} />}
                </button>
                {renewExpanded && (
                  <div
                    className="px-[16px] pb-[14px] flex flex-col gap-[8px]"
                    style={{ borderTop: `1px solid ${statusColor}18` }}
                  >
                    <p style={{ fontSize: 11, color: colors.textMuted, lineHeight: 1.55, paddingTop: 10 }}>
                      {policy.status === "expired"
                        ? "This policy has expired and requires renewal before the next audit cycle. Upload a new version or update the existing document and resubmit for approval."
                        : "This policy version is currently under review. Once approved, the status will update automatically."}
                    </p>
                    <button
                      className="flex items-center gap-[6px] px-[12px] py-[7px] rounded-[7px] text-[11px] font-semibold cursor-pointer w-fit mt-[4px]"
                      style={{ background: `${statusColor}18`, color: statusColor, border: `1px solid ${statusColor}28` }}
                    >
                      <Download size={11} />
                      Upload renewed version
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Approved version card */}
            <div
              className="rounded-[10px] overflow-hidden"
              style={{ border: `1px solid ${colors.border}`, background: colors.bgCard }}
            >
              <button
                className="w-full flex items-center gap-[10px] px-[16px] py-[14px] cursor-pointer"
                onClick={() => setVersionExpanded(p => !p)}
                style={{ background: "none", border: "none", textAlign: "left" }}
              >
                <div
                  className="flex items-center justify-center size-[32px] rounded-[7px] shrink-0"
                  style={{ background: `${colors.success}14` }}
                >
                  <CheckCircle2 size={15} color={colors.success} />
                </div>
                <div className="flex-1 min-w-0">
                  <p style={{ fontSize: 13, fontWeight: 600, color: colors.textPrimary }}>
                    {policy.lastReviewed
                      ? `Approved version: ${policy.lastReviewed}`
                      : `Version ${policy.version}`}
                  </p>
                  <p style={{ fontSize: 10, color: colors.textDim, marginTop: 2 }}>
                    Via document upload · {policy.version}
                  </p>
                </div>
                {versionExpanded ? <ChevronDown size={14} color={colors.textDim} /> : <ChevronRight size={14} color={colors.textDim} />}
              </button>

              {versionExpanded && (
                <div style={{ borderTop: `1px solid ${colors.border}` }}>
                  {/* File row */}
                  <div className="flex items-center gap-[10px] px-[16px] py-[12px] mx-[16px] my-[12px] rounded-[8px]"
                    style={{ border: `1px solid ${colors.border}`, background: "rgba(255,255,255,0.02)" }}>
                    <FileText size={14} color={colors.textDim} className="shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p style={{ fontSize: 12, fontWeight: 600, color: colors.textPrimary }}>{policy.name}.pdf</p>
                      <p style={{ fontSize: 10, color: colors.textDim, marginTop: 1 }}>
                        Last edited by {policy.owner}
                      </p>
                    </div>
                    <button
                      className="px-[10px] py-[4px] rounded-[6px] text-[11px] font-medium cursor-pointer"
                      style={{ background: "rgba(255,255,255,0.05)", color: colors.textMuted, border: `1px solid ${colors.border}` }}
                    >
                      View
                    </button>
                  </div>

                  {/* Show approval */}
                  <div className="px-[16px] pb-[14px]">
                    <button
                      className="text-[11px] font-medium cursor-pointer"
                      style={{ color: colors.accent, background: "none", border: "none", padding: 0 }}
                    >
                      Show approval
                    </button>
                  </div>
                </div>
              )}
            </div>

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

        {/* ── CONTROLS TAB ── */}
        {activeTab === "controls" && (
          <div className="flex flex-col gap-[8px] max-w-[680px]">
            <p style={{ fontSize: 11, color: colors.textDim, marginBottom: 4 }}>
              {linkedControls.length} control{linkedControls.length !== 1 ? "s" : ""} mapped to this policy
            </p>
            {linkedControls.length === 0 ? (
              <div className="flex items-center justify-center p-[32px] rounded-[10px]"
                style={{ background: colors.bgCard, border: `1px solid ${colors.border}` }}>
                <p style={{ fontSize: 12, color: colors.textDim }}>No controls linked to this policy.</p>
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
                      <p style={{ fontSize: 10, color: colors.textDim, marginTop: 1 }} className="truncate">{ctrl.category}</p>
                    </div>
                    <span
                      className="px-[6px] py-[1px] rounded-full text-[9px] font-semibold capitalize shrink-0"
                      style={{
                        background: ctrl.status === "passing" ? `${colors.success}14` : ctrl.status === "failing" ? `${colors.critical}14` : `${colors.medium}14`,
                        color: ctrl.status === "passing" ? colors.success : ctrl.status === "failing" ? colors.critical : colors.medium,
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
              <p style={{ fontSize: 12, color: colors.textDim }}>No audit entries for this policy yet.</p>
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
