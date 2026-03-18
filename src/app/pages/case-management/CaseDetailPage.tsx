/**
 * Case Detail Page
 * =================
 * 
 * Detailed view of a single case with Investigation and Reporting tabs.
 * Built to match exact UI from Figma screenshots.
 */

import React, { useState, useEffect, useSyncExternalStore } from "react";
import { useParams, useNavigate, useLocation } from "react-router";
import { ArrowLeft, Download } from "lucide-react";
import {
  getCaseById,
  getObservations,
  getRecommendedPlaybooks,
  getCaseReport,
  subscribeCases,
  getCasesSnapshot,
} from "./case-data";
import CaseInvestigationTab from "./CaseInvestigationTab";
import CaseReportingTab from "./CaseReportingTab";
import type { CaseDetailLocationState } from "./case-integration";
import { caseColors } from "./design-tokens";
import { debug } from "../../shared/utils/debug";

type TabType = "investigation" | "reporting";

interface DownloadReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  caseId: string;
}

function DownloadReportModal({ isOpen, onClose, caseId }: DownloadReportModalProps) {
  if (!isOpen) return null;

  const handleDownload = () => {
    debug.log("Downloading report for case:", caseId);
    // Implement download logic here
    onClose();
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.7)" }}
      onClick={onClose}
    >
      <div
        className="rounded-[12px] p-[24px] max-w-[480px] w-full"
        style={{
          backgroundColor: caseColors.bgCard,
          border: `1px solid ${caseColors.border}`,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3
          className="text-[18px] font-['Inter:SemiBold',sans-serif] font-semibold mb-[16px]"
          style={{ color: caseColors.textPrimary }}
        >
          Download Report
        </h3>

        <p
          className="text-[13px] font-['Inter:Regular',sans-serif] mb-[24px] leading-[1.6]"
          style={{ color: caseColors.textSecondary }}
        >
          Your case report has been successfully generated. A copy of the report will be sent to your registered email address shortly. Please check your inbox (and spam/junk folder if needed) to access and download the report.
        </p>

        <div className="flex items-center gap-[12px] justify-end">
          <button
            onClick={onClose}
            className="px-[16px] py-[8px] rounded-[6px] text-[13px] font-['Inter:Medium',sans-serif] font-medium transition-colors hover:bg-[rgba(255,255,255,0.05)]"
            style={{
              border: `1px solid ${caseColors.border}`,
              color: caseColors.textSecondary,
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleDownload}
            className="px-[16px] py-[8px] rounded-[6px] text-[13px] font-['Inter:Medium',sans-serif] font-medium transition-colors"
            style={{
              backgroundColor: caseColors.buttonPrimaryDefault,
              color: "#ffffff",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = caseColors.buttonPrimaryHover;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = caseColors.buttonPrimaryDefault;
            }}
          >
            Download
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CaseDetailPage() {
  const { caseId } = useParams<{ caseId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const locationState = location.state as CaseDetailLocationState | undefined;

  // Subscribe to reactive case data so we always have the latest
  const _version = useSyncExternalStore(subscribeCases, getCasesSnapshot);
  
  // Initialize with either the location state's initial tab or default to investigation
  const [activeTab, setActiveTab] = useState<TabType>(
    locationState?.initialTab || "investigation"
  );

  const [showDownloadModal, setShowDownloadModal] = useState(false);

  // Track where we came from for back navigation
  const [returnPath, setReturnPath] = useState<string>("/case-management");

  useEffect(() => {
    // If we came from Attack Path, return to that specific path
    if (locationState?.fromAttackPath && locationState?.attackPathReturnPath) {
      setReturnPath(locationState.attackPathReturnPath);
    } else if (locationState?.fromAI) {
      // From Watch Center AI, return to main dashboard
      setReturnPath("/");
    }
  }, [locationState]);

  const caseData = caseId ? getCaseById(caseId) : undefined;

  if (!caseData) {
    return (
      <div className="p-[24px]">
        <div className="text-center" style={{ color: caseColors.textSecondary }}>
          Case not found
        </div>
      </div>
    );
  }

  const observations = getObservations(caseId!);
  const playbooks = getRecommendedPlaybooks(caseId!);
  const report = getCaseReport(caseId!);

  return (
    <div className="h-full flex flex-col" style={{ backgroundColor: caseColors.bgApp }}>
      {/* Header */}
      <div
        className="px-[24px] py-[16px]"
        style={{ borderBottom: `1px solid ${caseColors.border}` }}
      >
        <div className="flex items-center justify-between mb-[16px]">
          <div className="flex items-center gap-[16px]">
            <button
              onClick={() => navigate(returnPath)}
              className="hover:bg-[rgba(255,255,255,0.05)] rounded-[6px] p-[6px] transition-colors"
            >
              <ArrowLeft className="size-[20px]" style={{ color: caseColors.textSecondary }} />
            </button>
            <h1
              className="text-[20px] font-['Inter:SemiBold',sans-serif] font-semibold"
              style={{ color: caseColors.textPrimary }}
            >
              {caseData.title}
            </h1>
          </div>

          {/* Export Report Button */}
          <button
            onClick={() => setShowDownloadModal(true)}
            className="flex items-center gap-[8px] px-[14px] py-[8px] rounded-[6px] text-[13px] font-['Inter:Medium',sans-serif] font-medium transition-colors"
            style={{
              backgroundColor: caseColors.buttonPrimaryDefault,
              color: "#ffffff",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = caseColors.buttonPrimaryHover;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = caseColors.buttonPrimaryDefault;
            }}
          >
            <Download className="size-[16px]" />
            Export Report
          </button>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-[24px]">
          <button
            onClick={() => setActiveTab("investigation")}
            className="relative px-[4px] py-[8px] text-[13px] font-['Inter:Medium',sans-serif] font-medium transition-colors"
            style={{
              color: activeTab === "investigation" ? caseColors.textPrimary : caseColors.textSecondary,
            }}
          >
            Case Investigation
            {activeTab === "investigation" && (
              <div
                className="absolute bottom-0 left-0 right-0 h-[2px] rounded-full"
                style={{ backgroundColor: caseColors.accent }}
              />
            )}
          </button>
          <button
            onClick={() => setActiveTab("reporting")}
            className="relative px-[4px] py-[8px] text-[13px] font-['Inter:Medium',sans-serif] font-medium transition-colors"
            style={{
              color: activeTab === "reporting" ? caseColors.textPrimary : caseColors.textSecondary,
            }}
          >
            Case Reporting
            {activeTab === "reporting" && (
              <div
                className="absolute bottom-0 left-0 right-0 h-[2px] rounded-full"
                style={{ backgroundColor: caseColors.accent }}
              />
            )}
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === "investigation" ? (
          <CaseInvestigationTab
            caseData={caseData}
            observations={observations}
            playbooks={playbooks}
          />
        ) : (
          <CaseReportingTab report={report} caseId={caseId!} />
        )}
      </div>

      {/* Download Report Modal */}
      <DownloadReportModal
        isOpen={showDownloadModal}
        onClose={() => setShowDownloadModal(false)}
        caseId={caseId!}
      />
    </div>
  );
}