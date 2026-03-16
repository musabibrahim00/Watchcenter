/**
 * Case Reporting Tab
 * ===================
 * 
 * Report view with case summary, actors, actions, and assets.
 * Built to match exact UI from Figma screenshots.
 */

import React, { useState } from "react";
import { Download } from "lucide-react";
import type { CaseReport } from "./case-data";
import { caseColors } from "./design-tokens";

const colors = caseColors;

interface CaseReportingTabProps {
  report: CaseReport | undefined;
  caseId: string;
}

interface DownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDownload: () => void;
}

function DownloadModal({ isOpen, onClose, onDownload }: DownloadModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.7)" }}
      onClick={onClose}
    >
      <div
        className="rounded-[12px] p-[24px] max-w-[480px] w-full"
        style={{
          backgroundColor: colors.bgCard,
          border: `1px solid ${colors.border}`,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3
          className="text-[18px] font-['Inter:SemiBold',sans-serif] font-semibold mb-[16px]"
          style={{ color: colors.textPrimary }}
        >
          Download Report
        </h3>

        <p
          className="text-[13px] font-['Inter:Regular',sans-serif] mb-[24px] leading-[1.6]"
          style={{ color: colors.textSecondary }}
        >
          Your case report has been successfully generated. A copy of the report will be sent to your registered email address shortly. Please check your inbox (and spam/junk folder if needed) to access and download the report.
        </p>

        <div className="flex items-center gap-[12px] justify-end">
          <button
            onClick={onClose}
            className="px-[16px] py-[8px] rounded-[6px] text-[13px] font-['Inter:Medium',sans-serif] font-medium transition-colors hover:bg-[rgba(255,255,255,0.05)]"
            style={{
              border: `1px solid ${colors.border}`,
              color: colors.textSecondary,
            }}
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onDownload();
              onClose();
            }}
            className="px-[16px] py-[8px] rounded-[6px] text-[13px] font-['Inter:Medium',sans-serif] font-medium transition-colors"
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
            Download
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CaseReportingTab({ report, caseId }: CaseReportingTabProps) {
  const [showDownloadModal, setShowDownloadModal] = useState(false);

  const handleDownload = () => {
    console.log("Downloading report for case:", caseId);
    // Implement download logic here
  };

  if (!report) {
    return (
      <div className="p-[24px]">
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
            No report available for this case
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-[24px]">
      {/* Header with Export Button */}
      <div className="flex items-center justify-between mb-[20px]">
        <h2
          className="text-[20px] font-['Inter:SemiBold',sans-serif] font-semibold"
          style={{ color: colors.textPrimary }}
        >
          Case Report
        </h2>
        <button
          onClick={() => setShowDownloadModal(true)}
          className="flex items-center gap-[8px] px-[16px] py-[8px] rounded-[6px] text-[13px] font-['Inter:Medium',sans-serif] font-medium transition-colors"
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
          <Download className="size-[16px]" />
          Export Report
        </button>
      </div>

      {/* Two Column Grid */}
      <div className="grid grid-cols-2 gap-[20px]">
        {/* Summary */}
        <div
          className="rounded-[12px] p-[20px]"
          style={{
            backgroundColor: colors.bgCard,
            border: `1px solid ${colors.border}`,
          }}
        >
          <h3
            className="text-[14px] font-['Inter:SemiBold',sans-serif] font-semibold mb-[12px]"
            style={{ color: colors.textPrimary }}
          >
            Summary
          </h3>
          <p
            className="text-[13px] font-['Inter:Regular',sans-serif] leading-[1.6]"
            style={{ color: colors.textSecondary }}
          >
            {report.summary}
          </p>
        </div>

        {/* Actors */}
        <div
          className="rounded-[12px] p-[20px]"
          style={{
            backgroundColor: colors.bgCard,
            border: `1px solid ${colors.border}`,
          }}
        >
          <h3
            className="text-[14px] font-['Inter:SemiBold',sans-serif] font-semibold mb-[12px]"
            style={{ color: colors.textPrimary }}
          >
            Actors
          </h3>
          <div className="space-y-[12px]">
            <div>
              <span
                className="text-[11px] font-['Inter:Medium',sans-serif] font-medium uppercase block mb-[4px]"
                style={{ color: colors.textTertiary }}
              >
                Primary Actor
              </span>
              <p
                className="text-[13px] font-['Inter:Regular',sans-serif]"
                style={{ color: colors.textSecondary }}
              >
                {report.actors}
              </p>
            </div>
            <div>
              <span
                className="text-[11px] font-['Inter:Medium',sans-serif] font-medium uppercase block mb-[4px]"
                style={{ color: colors.textTertiary }}
              >
                Threat Actor
              </span>
              <p
                className="text-[13px] font-['Inter:Regular',sans-serif]"
                style={{ color: colors.textSecondary }}
              >
                {report.threatActor}
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div
          className="rounded-[12px] p-[20px]"
          style={{
            backgroundColor: colors.bgCard,
            border: `1px solid ${colors.border}`,
          }}
        >
          <h3
            className="text-[14px] font-['Inter:SemiBold',sans-serif] font-semibold mb-[12px]"
            style={{ color: colors.textPrimary }}
          >
            Actions
          </h3>
          <ul className="space-y-[8px]">
            {report.actions.map((action, index) => (
              <li
                key={index}
                className="flex items-start gap-[8px] text-[13px] font-['Inter:Regular',sans-serif] leading-[1.6]"
                style={{ color: colors.textSecondary }}
              >
                <span
                  className="size-[6px] rounded-full mt-[6px] flex-shrink-0"
                  style={{ backgroundColor: colors.accent }}
                />
                {action}
              </li>
            ))}
          </ul>
        </div>

        {/* Assets Affected */}
        <div
          className="rounded-[12px] p-[20px]"
          style={{
            backgroundColor: colors.bgCard,
            border: `1px solid ${colors.border}`,
          }}
        >
          <h3
            className="text-[14px] font-['Inter:SemiBold',sans-serif] font-semibold mb-[12px]"
            style={{ color: colors.textPrimary }}
          >
            Assets Affected
          </h3>
          <ul className="space-y-[8px]">
            {report.assetsAffected.map((asset, index) => (
              <li
                key={index}
                className="flex items-start gap-[8px] text-[13px] font-['Inter:Regular',sans-serif] leading-[1.6]"
                style={{ color: colors.textSecondary }}
              >
                <span
                  className="size-[6px] rounded-full mt-[6px] flex-shrink-0"
                  style={{ backgroundColor: colors.accent }}
                />
                {asset}
              </li>
            ))}
          </ul>
        </div>

        {/* Attributes Impacted - Full Width */}
        <div
          className="rounded-[12px] p-[20px] col-span-2"
          style={{
            backgroundColor: colors.bgCard,
            border: `1px solid ${colors.border}`,
          }}
        >
          <h3
            className="text-[14px] font-['Inter:SemiBold',sans-serif] font-semibold mb-[12px]"
            style={{ color: colors.textPrimary }}
          >
            Attributes Impacted
          </h3>
          <ul className="space-y-[8px]">
            {report.attributesImpacted.map((attribute, index) => (
              <li
                key={index}
                className="flex items-start gap-[8px] text-[13px] font-['Inter:Regular',sans-serif] leading-[1.6]"
                style={{ color: colors.textSecondary }}
              >
                <span
                  className="size-[6px] rounded-full mt-[6px] flex-shrink-0"
                  style={{ backgroundColor: colors.accent }}
                />
                {attribute}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Download Modal */}
      <DownloadModal
        isOpen={showDownloadModal}
        onClose={() => setShowDownloadModal(false)}
        onDownload={handleDownload}
      />
    </div>
  );
}