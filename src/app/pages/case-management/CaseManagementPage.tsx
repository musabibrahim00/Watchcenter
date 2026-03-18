/**
 * Case Management Page
 * =====================
 * 
 * Main page with tab navigation between Dashboard and Cases list.
 */

import React, { useState } from "react";
import { useLocation } from "react-router";
import CaseManagementDashboard from "./CaseManagementDashboard";
import CasesListPage from "./CasesListPage";
import { caseColors } from "./design-tokens";

type TabType = "dashboard" | "cases";

function CaseManagementPage() {
  const location = useLocation();
  const locationState = location.state as { activeTab?: string } | undefined;
  const [activeTab, setActiveTab] = useState<TabType>(
    locationState?.activeTab === "cases" ? "cases" : "dashboard"
  );

  return (
    <div className="h-full flex flex-col" style={{ backgroundColor: caseColors.bgPage }}>
      {/* Page Title */}
      <div className="px-[24px] pt-[24px] pb-[16px]">
        <h1
          className="text-[24px] font-['Inter:Bold',sans-serif] font-bold"
          style={{ color: caseColors.textPrimary }}
        >
          Case Management
        </h1>
      </div>

      {/* Tab Navigation */}
      <div
        className="px-[24px]"
        style={{ borderBottom: `1px solid ${caseColors.border}` }}
      >
        <div className="flex gap-[32px]">
          <button
            onClick={() => setActiveTab("dashboard")}
            className="pb-[16px] relative"
          >
            <span
              className="text-[13px] font-['Inter:Medium',sans-serif] font-medium transition-colors"
              style={{ color: activeTab === "dashboard" ? caseColors.textPrimary : caseColors.textSecondary }}
            >
              Dashboard
            </span>
            {activeTab === "dashboard" && (
              <div
                className="absolute bottom-0 left-0 right-0 h-[2px]"
                style={{ backgroundColor: caseColors.accent }}
              />
            )}
          </button>

          <button
            onClick={() => setActiveTab("cases")}
            className="pb-[16px] relative"
          >
            <span
              className="text-[13px] font-['Inter:Medium',sans-serif] font-medium transition-colors"
              style={{ color: activeTab === "cases" ? caseColors.textPrimary : caseColors.textSecondary }}
            >
              Cases
            </span>
            {activeTab === "cases" && (
              <div
                className="absolute bottom-0 left-0 right-0 h-[2px]"
                style={{ backgroundColor: caseColors.accent }}
              />
            )}
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-auto">
        {activeTab === "dashboard" && <CaseManagementDashboard />}
        {activeTab === "cases" && <CasesListPage />}
      </div>
    </div>
  );
}

export default React.memo(CaseManagementPage);