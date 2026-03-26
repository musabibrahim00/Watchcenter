/**
 * Case Investigation Tab
 * =======================
 * 
 * Investigation view with case overview, playbooks, and observations.
 * Built to match exact UI from Figma screenshots.
 */

import React, { useState } from "react";
import { useNavigate } from "react-router";
import { ChevronDown, CheckCircle } from "lucide-react";
import type { Case, Observation, Playbook } from "./case-data";
import { updateCase, addObservation, CASE_OWNERS } from "./case-data";
import type { CaseStatus } from "./case-data";
import { extractAssetsFromDescription } from "./case-asset-utils";
import { ChangeStatusModal } from "./ChangeStatusModal";
import { caseColors } from "./design-tokens";

const colors = caseColors;

interface CaseInvestigationTabProps {
  caseData: Case;
  observations: Observation[];
  playbooks: Playbook[];
}

interface SeverityBadgeProps {
  severity: string;
}

function SeverityBadge({ severity }: SeverityBadgeProps) {
  const getBadgeColor = (sev: string) => {
    switch (sev) {
      case "Critical":
        return { bg: "rgba(239, 68, 68, 0.1)", text: "#ef4444", border: "rgba(239, 68, 68, 0.3)" };
      case "High":
        return { bg: "rgba(249, 115, 22, 0.1)", text: "#f97316", border: "rgba(249, 115, 22, 0.3)" };
      case "Medium":
        return { bg: "rgba(245, 158, 11, 0.1)", text: "#f59e0b", border: "rgba(245, 158, 11, 0.3)" };
      case "Low":
        return { bg: "rgba(59, 130, 246, 0.1)", text: "#3b82f6", border: "rgba(59, 130, 246, 0.3)" };
      default:
        return { bg: "rgba(107, 114, 128, 0.1)", text: "#6b7280", border: "rgba(107, 114, 128, 0.3)" };
    }
  };

  const badgeStyle = getBadgeColor(severity);

  return (
    <div
      className="inline-flex items-center px-[10px] py-[4px] rounded-[6px] text-[11px] font-['Inter:SemiBold',sans-serif] font-semibold"
      style={{
        backgroundColor: badgeStyle.bg,
        color: badgeStyle.text,
        border: `1px solid ${badgeStyle.border}`,
      }}
    >
      {severity}
    </div>
  );
}

interface PlaybookCardProps {
  playbook: Playbook;
}

function PlaybookCard({ playbook }: PlaybookCardProps) {
  return (
    <div
      className="rounded-[8px] p-[16px] flex flex-col"
      style={{
        backgroundColor: colors.bgCard,
        border: `1px solid ${colors.border}`,
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-[12px]">
        <h4
          className="text-[14px] font-['Inter:SemiBold',sans-serif] font-semibold"
          style={{ color: colors.textPrimary }}
        >
          {playbook.title}
        </h4>
        <button className="size-[16px] flex items-center justify-center">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="3" r="1" fill={colors.textTertiary} />
            <circle cx="8" cy="8" r="1" fill={colors.textTertiary} />
            <circle cx="8" cy="13" r="1" fill={colors.textTertiary} />
          </svg>
        </button>
      </div>

      {/* Description */}
      <p
        className="text-[12px] font-['Inter:Regular',sans-serif] mb-[12px] leading-[1.5]"
        style={{ color: colors.textSecondary }}
      >
        {playbook.description}
      </p>

      {/* Reason */}
      <div className="mb-[16px]">
        <span
          className="text-[11px] font-['Inter:SemiBold',sans-serif] font-semibold uppercase block mb-[4px]"
          style={{ color: colors.textTertiary }}
        >
          Reason
        </span>
        <p
          className="text-[12px] font-['Inter:Regular',sans-serif] leading-[1.5]"
          style={{ color: colors.textSecondary }}
        >
          {playbook.reason}
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-[8px] mt-auto">
        <button
          className="flex-1 px-[14px] py-[8px] rounded-[6px] text-[12px] font-['Inter:Medium',sans-serif] font-medium transition-colors"
          style={{
            backgroundColor: colors.buttonPrimaryDefault,
            color: "#ffffff",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = colors.buttonPrimaryHover;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = colors.buttonPrimaryDefault;
          }}
        >
          Run Playbook
        </button>
        <button
          className="px-[14px] py-[8px] rounded-[6px] text-[12px] font-['Inter:Medium',sans-serif] font-medium transition-colors hover:bg-[rgba(255,255,255,0.05)]"
          style={{
            border: `1px solid ${colors.border}`,
            color: colors.textSecondary,
          }}
        >
          Manual Instructions
        </button>
      </div>
    </div>
  );
}

export default function CaseInvestigationTab({ caseData, observations, playbooks }: CaseInvestigationTabProps) {
  const navigate = useNavigate();
  const [newObservation, setNewObservation] = useState("");
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(caseData.status);
  const [actionToast, setActionToast] = useState<string | null>(null);
  const [executedActions, setExecutedActions] = useState<Set<string>>(new Set());

  /** Show a brief confirmation banner */
  const showToast = (message: string) => {
    setActionToast(message);
    setTimeout(() => setActionToast(null), 3500);
  };

  /** Resolve a quick-action string to a concrete handler */
  const handleQuickAction = (action: string) => {
    const key = `${caseData.id}::${action}`;

    // Prevent double-execution
    if (executedActions.has(key)) return;
    setExecutedActions((prev) => new Set(prev).add(key));

    const now = new Date().toISOString();

    switch (action) {
      case "Disable User Account": {
        addObservation(caseData.id, {
          id: `obs-${caseData.id}-${Date.now()}`,
          caseId: caseData.id,
          author: CASE_OWNERS[0],
          content: "User account has been disabled per quick-action recommendation. All active sessions revoked.",
          timestamp: now,
        });
        showToast("User account disabled — active sessions revoked");
        break;
      }
      case "Escalate Case to Tier-2 Analyst": {
        updateCase(caseData.id, { status: "Escalated" });
        setSelectedStatus("Escalated");
        addObservation(caseData.id, {
          id: `obs-${caseData.id}-${Date.now()}`,
          caseId: caseData.id,
          author: CASE_OWNERS[0],
          content: "Case escalated to Tier-2 analyst for deeper investigation.",
          timestamp: now,
        });
        showToast("Case escalated to Tier-2 analyst");
        break;
      }
      case "Block Source IP": {
        addObservation(caseData.id, {
          id: `obs-${caseData.id}-${Date.now()}`,
          caseId: caseData.id,
          author: CASE_OWNERS[0],
          content: "Source IP address blocked in firewall rules and added to deny list. Network ACLs updated.",
          timestamp: now,
        });
        showToast("Source IP blocked — firewall rules updated");
        break;
      }
      case "Isolate Host": {
        addObservation(caseData.id, {
          id: `obs-${caseData.id}-${Date.now()}`,
          caseId: caseData.id,
          author: CASE_OWNERS[0],
          content: "Affected host isolated from the network. Forensic image preservation initiated.",
          timestamp: now,
        });
        showToast("Host isolated — forensic preservation initiated");
        break;
      }
      case "Open Asset Detail": {
        const assets = extractAssetsFromDescription(caseData.description);
        if (assets.length > 0) {
          navigate(`/assets/${assets[0].id}`, { state: { fromCase: caseData.id } });
        } else {
          // Fallback: navigate to asset register
          navigate("/assets", { state: { fromCase: caseData.id } });
        }
        return; // No toast — we're navigating away
      }
      default: {
        addObservation(caseData.id, {
          id: `obs-${caseData.id}-${Date.now()}`,
          caseId: caseData.id,
          author: CASE_OWNERS[0], // Default to first analyst
          content: `Quick action executed: ${action}`,
          timestamp: now,
        });
        showToast(`Action executed: ${action}`);
        break;
      }
    }
  };

  const handleSubmitObservation = () => {
    if (newObservation.trim()) {
      const obs: Observation = {
        id: `obs-${caseData.id}-${Date.now()}`,
        caseId: caseData.id,
        author: CASE_OWNERS[0], // Default to first analyst
        content: newObservation.trim(),
        timestamp: new Date().toISOString(),
      };
      addObservation(caseData.id, obs);
      setNewObservation("");
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString("en-US", {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="p-[24px] space-y-[24px]">
      {/* Case Overview Card */}
      <div
        className="rounded-[12px] p-[20px]"
        style={{
          backgroundColor: colors.bgCard,
          border: `1px solid ${colors.border}`,
        }}
      >
        <h3
          className="text-[16px] font-['Inter:SemiBold',sans-serif] font-semibold mb-[20px]"
          style={{ color: colors.textPrimary }}
        >
          Case Overview
        </h3>

        {/* Grid Layout - 4 columns */}
        <div className="grid grid-cols-4 gap-[20px]">
          {/* Case ID */}
          <div>
            <span
              className="text-[11px] font-['Inter:Medium',sans-serif] font-medium uppercase block mb-[6px]"
              style={{ color: colors.textTertiary }}
            >
              Case ID
            </span>
            <span
              className="text-[13px] font-['Inter:SemiBold',sans-serif] font-semibold"
              style={{ color: colors.accent }}
            >
              {caseData.id}
            </span>
          </div>

          {/* Category */}
          <div>
            <span
              className="text-[11px] font-['Inter:Medium',sans-serif] font-medium uppercase block mb-[6px]"
              style={{ color: colors.textTertiary }}
            >
              Category
            </span>
            <span
              className="text-[13px] font-['Inter:Regular',sans-serif]"
              style={{ color: colors.textPrimary }}
            >
              {caseData.category}
            </span>
          </div>

          {/* Severity */}
          <div>
            <span
              className="text-[11px] font-['Inter:Medium',sans-serif] font-medium uppercase block mb-[6px]"
              style={{ color: colors.textTertiary }}
            >
              Severity
            </span>
            <SeverityBadge severity={caseData.severity} />
          </div>

          {/* Owner */}
          <div>
            <span
              className="text-[11px] font-['Inter:Medium',sans-serif] font-medium uppercase block mb-[6px]"
              style={{ color: colors.textTertiary }}
            >
              Owner
            </span>
            <span
              className="text-[13px] font-['Inter:Regular',sans-serif]"
              style={{ color: colors.textPrimary }}
            >
              {caseData.owner.name}
            </span>
          </div>

          {/* Case Age */}
          <div>
            <span
              className="text-[11px] font-['Inter:Medium',sans-serif] font-medium uppercase block mb-[6px]"
              style={{ color: colors.textTertiary }}
            >
              Case Age
            </span>
            <span
              className="text-[13px] font-['Inter:Regular',sans-serif]"
              style={{ color: colors.textPrimary }}
            >
              {caseData.caseAge}
            </span>
          </div>

          {/* Last Update */}
          <div>
            <span
              className="text-[11px] font-['Inter:Medium',sans-serif] font-medium uppercase block mb-[6px]"
              style={{ color: colors.textTertiary }}
            >
              Last Update
            </span>
            <span
              className="text-[13px] font-['Inter:Regular',sans-serif]"
              style={{ color: colors.textPrimary }}
            >
              {formatDate(caseData.updatedAt)}
            </span>
          </div>

          {/* Status */}
          <div>
            <span
              className="text-[11px] font-['Inter:Medium',sans-serif] font-medium uppercase block mb-[6px]"
              style={{ color: colors.textTertiary }}
            >
              Status
            </span>
            <div className="relative inline-block">
              <button
                onClick={() => setStatusDropdownOpen(!statusDropdownOpen)}
                className="appearance-none px-[12px] py-[6px] pr-[32px] rounded-[6px] text-[12px] font-['Inter:Medium',sans-serif] font-medium cursor-pointer transition-colors hover:bg-[rgba(255,255,255,0.05)]"
                style={{
                  backgroundColor: "transparent",
                  border: `1px solid ${colors.border}`,
                  color: colors.textPrimary,
                }}
              >
                {selectedStatus}
              </button>
              <ChevronDown
                className="absolute right-[10px] top-1/2 -translate-y-1/2 size-[14px] pointer-events-none"
                style={{ color: colors.textTertiary }}
              />
              {statusDropdownOpen && (
                <div
                  className="absolute top-full left-0 mt-[4px] rounded-[6px] py-[4px] min-w-[140px] z-10"
                  style={{
                    backgroundColor: colors.bgCard,
                    border: `1px solid ${colors.border}`,
                  }}
                >
                  {["Open", "In Progress", "Escalated", "Resolved", "Closed"].map((status) => (
                    <button
                      key={status}
                      onClick={() => {
                        setSelectedStatus(status as CaseStatus);
                        setStatusDropdownOpen(false);
                        updateCase(caseData.id, { status: status as CaseStatus });
                      }}
                      className="w-full text-left px-[12px] py-[6px] text-[12px] font-['Inter:Regular',sans-serif] hover:bg-[rgba(255,255,255,0.05)] transition-colors"
                      style={{ color: colors.textPrimary }}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Resolution State */}
          <div>
            <span
              className="text-[11px] font-['Inter:Medium',sans-serif] font-medium uppercase block mb-[6px]"
              style={{ color: colors.textTertiary }}
            >
              Resolution State
            </span>
            <span
              className="text-[13px] font-['Inter:Regular',sans-serif]"
              style={{ color: colors.textPrimary }}
            >
              {caseData.resolutionState}
            </span>
          </div>
        </div>
      </div>

      {/* Recommended Playbooks */}
      <div>
        <h3
          className="text-[16px] font-['Inter:SemiBold',sans-serif] font-semibold mb-[16px]"
          style={{ color: colors.textPrimary }}
        >
          Recommended Playbooks
        </h3>

        {playbooks.length > 0 ? (
          <div className="grid grid-cols-3 gap-[16px]">
            {playbooks.map((playbook) => (
              <PlaybookCard key={playbook.id} playbook={playbook} />
            ))}
          </div>
        ) : (
          <div
            className="rounded-[8px] p-[20px] text-center"
            style={{
              backgroundColor: colors.bgCard,
              border: `1px solid ${colors.border}`,
            }}
          >
            <span
              className="text-[13px] font-['Inter:Regular',sans-serif]"
              style={{ color: colors.textSecondary }}
            >
              No playbooks recommended for this case
            </span>
          </div>
        )}
      </div>

      {/* Add Observations */}
      <div>
        <h3
          className="text-[16px] font-['Inter:SemiBold',sans-serif] font-semibold mb-[12px]"
          style={{ color: colors.textPrimary }}
        >
          Add Observations
        </h3>

        <div className="flex gap-[12px]">
          <textarea
            value={newObservation}
            onChange={(e) => setNewObservation(e.target.value)}
            placeholder="Enter your observation..."
            rows={3}
            className="flex-1 px-[14px] py-[10px] rounded-[8px] text-[13px] font-['Inter:Regular',sans-serif] resize-none focus:outline-none focus:ring-2 focus:ring-opacity-50"
            style={{
              backgroundColor: colors.bgCard,
              border: `1px solid ${colors.border}`,
              color: colors.textPrimary,
            }}
          />
        </div>

        <button
          onClick={handleSubmitObservation}
          disabled={!newObservation.trim()}
          className="mt-[12px] px-[16px] py-[8px] rounded-[6px] text-[13px] font-['Inter:Medium',sans-serif] font-medium transition-colors disabled:cursor-not-allowed"
          style={{
            backgroundColor: !newObservation.trim()
              ? colors.buttonPrimaryDisabledBg
              : colors.buttonPrimaryDefault,
            color: !newObservation.trim()
              ? colors.buttonPrimaryDisabledText
              : "#ffffff",
            opacity: !newObservation.trim() ? 0.2 : 1,
          }}
          onMouseEnter={(e) => {
            if (newObservation.trim()) {
              e.currentTarget.style.backgroundColor = colors.buttonPrimaryHover;
            }
          }}
          onMouseLeave={(e) => {
            if (newObservation.trim()) {
              e.currentTarget.style.backgroundColor = colors.buttonPrimaryDefault;
            }
          }}
        >
          Submit
        </button>
      </div>

      {/* Observation Timeline */}
      {observations.length > 0 && (
        <div>
          <div className="space-y-[16px]">
            {observations.map((observation, index) => (
              <div
                key={observation.id}
                className="rounded-[8px] p-[16px] relative"
                style={{
                  backgroundColor: colors.bgCard,
                  border: `1px solid ${colors.border}`,
                }}
              >
                {/* Timeline indicator */}
                {index < observations.length - 1 && (
                  <div
                    className="absolute left-[28px] top-[48px] w-[2px] h-[calc(100%+16px)]"
                    style={{ backgroundColor: colors.border }}
                  />
                )}

                {/* Badge */}
                <div className="flex items-start gap-[12px]">
                  <div
                    className="size-[8px] rounded-full mt-[6px] flex-shrink-0"
                    style={{ backgroundColor: colors.accent }}
                  />
                  <div className="flex-1">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-[8px]">
                      <div className="flex items-center gap-[12px]">
                        <img
                          src={observation.author.avatar}
                          alt={observation.author.name}
                          className="size-[32px] rounded-full object-cover"
                        />
                        <div>
                          <div
                            className="text-[13px] font-['Inter:SemiBold',sans-serif] font-semibold"
                            style={{ color: colors.textPrimary }}
                          >
                            {observation.title || observation.author.name}
                          </div>
                          <div
                            className="text-[11px] font-['Inter:Regular',sans-serif]"
                            style={{ color: colors.textTertiary }}
                          >
                            {observation.author.role}
                          </div>
                        </div>
                      </div>
                      <span
                        className="text-[12px] font-['Inter:Regular',sans-serif]"
                        style={{ color: colors.textTertiary }}
                      >
                        {formatDate(observation.timestamp)}
                      </span>
                    </div>

                    {/* Content */}
                    <p
                      className="text-[13px] font-['Inter:Regular',sans-serif] leading-[1.6]"
                      style={{ color: colors.textSecondary }}
                    >
                      {observation.content}
                    </p>

                    {/* Quick Action Buttons (dynamic from observation data) */}
                    {observation.quickActions && observation.quickActions.length > 0 && (
                      <div className="flex flex-wrap gap-[8px] mt-[12px]">
                        {observation.quickActions.map((action) => {
                          const executed = executedActions.has(`${caseData.id}::${action}`);
                          return (
                            <button
                              key={action}
                              onClick={() => handleQuickAction(action)}
                              disabled={executed}
                              className="px-[12px] py-[6px] rounded-[6px] text-[11px] font-['Inter:Medium',sans-serif] font-medium transition-colors hover:brightness-110 disabled:opacity-50 disabled:cursor-default flex items-center gap-[5px]"
                              style={{
                                backgroundColor: executed
                                  ? "rgba(16, 185, 129, 0.1)"
                                  : "rgba(20, 162, 227, 0.1)",
                                border: `1px solid ${executed ? "rgba(16, 185, 129, 0.3)" : "rgba(20, 162, 227, 0.3)"}`,
                                color: executed ? "#10b981" : colors.accent,
                              }}
                            >
                              {executed && <CheckCircle className="size-[12px]" />}
                              {action}
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {/* Legacy hardcoded actions — wire with same handler */}
                    {!observation.quickActions && index === 1 && (
                      <div className="flex gap-[8px] mt-[12px]">
                        {["Disable User Account", "Escalate Case to Tier-2 Analyst"].map((action) => {
                          const executed = executedActions.has(`${caseData.id}::${action}`);
                          return (
                            <button
                              key={action}
                              onClick={() => handleQuickAction(action)}
                              disabled={executed}
                              className="px-[12px] py-[6px] rounded-[6px] text-[11px] font-['Inter:Medium',sans-serif] font-medium transition-colors hover:brightness-110 disabled:opacity-50 disabled:cursor-default flex items-center gap-[5px]"
                              style={{
                                backgroundColor: executed
                                  ? "rgba(16, 185, 129, 0.1)"
                                  : "rgba(20, 162, 227, 0.1)",
                                border: `1px solid ${executed ? "rgba(16, 185, 129, 0.3)" : "rgba(20, 162, 227, 0.3)"}`,
                                color: executed ? "#10b981" : colors.accent,
                              }}
                            >
                              {executed && <CheckCircle className="size-[12px]" />}
                              {action}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Toast */}
      {actionToast && (
        <div
          className="fixed bottom-[24px] left-1/2 -translate-x-1/2 px-[20px] py-[10px] rounded-[8px] text-[13px] font-['Inter:Medium',sans-serif] font-medium z-50 flex items-center gap-[8px]"
          style={{
            backgroundColor: "#0f2b1e",
            border: "1px solid rgba(16, 185, 129, 0.3)",
            color: "#10b981",
            boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
          }}
        >
          <CheckCircle className="size-[16px]" />
          {actionToast}
        </div>
      )}
    </div>
  );
}