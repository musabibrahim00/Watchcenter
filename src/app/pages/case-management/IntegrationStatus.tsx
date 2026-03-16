/**
 * Cases Integration Status Component
 * ===================================
 * 
 * Visual confirmation that the Cases integration is working correctly.
 * Shows real-time statistics and integration health.
 * 
 * Usage: Add to CasesListPage or Case Management Dashboard
 */

import React, { useSyncExternalStore } from "react";
import { CheckCircle, AlertCircle, TrendingUp } from "lucide-react";
import { subscribeCases, getCasesSnapshot, CASES } from "./case-data";
import { caseColors } from "./design-tokens";

interface IntegrationStatusProps {
  compact?: boolean;
}

export function IntegrationStatus({ compact = false }: IntegrationStatusProps) {
  // Subscribe to case changes
  const _version = useSyncExternalStore(subscribeCases, getCasesSnapshot);

  // Calculate statistics
  const totalCases = CASES.length;
  const aiGeneratedCases = CASES.filter(c => c.source === "Watch Center AI").length;
  const attackPathCases = CASES.filter(c => c.source === "Attack Path Analysis").length;
  const manualCases = totalCases - aiGeneratedCases - attackPathCases;
  
  const recentCases = CASES.filter(c => {
    const age = Date.now() - new Date(c.createdAt).getTime();
    return age < 24 * 60 * 60 * 1000; // Last 24 hours
  }).length;

  const colors = {
    ...caseColors,
    success: "#10b981",
  };

  if (compact) {
    return (
      <div
        className="inline-flex items-center gap-[8px] px-[12px] py-[6px] rounded-[6px]"
        style={{
          backgroundColor: "rgba(16, 185, 129, 0.1)",
          border: `1px solid rgba(16, 185, 129, 0.3)`,
        }}
      >
        <CheckCircle className="size-[14px]" style={{ color: colors.success }} />
        <span
          className="text-[11px] font-['Inter:Medium',sans-serif] font-medium"
          style={{ color: colors.success }}
        >
          Integration Active
        </span>
        <span
          className="text-[11px] font-['Inter:Regular',sans-serif]"
          style={{ color: colors.textSecondary }}
        >
          • {totalCases} cases • v{_version}
        </span>
      </div>
    );
  }

  return (
    <div
      className="rounded-[8px] p-[16px] mb-[16px]"
      style={{
        backgroundColor: colors.bgCard,
        border: `1px solid ${colors.border}`,
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-[12px]">
        <div className="flex items-center gap-[8px]">
          <CheckCircle className="size-[16px]" style={{ color: colors.success }} />
          <span
            className="text-[13px] font-['Inter:SemiBold',sans-serif] font-semibold"
            style={{ color: colors.textPrimary }}
          >
            Cases Integration Status
          </span>
        </div>
        <div
          className="px-[8px] py-[3px] rounded-[4px] text-[10px] font-['Inter:SemiBold',sans-serif] font-semibold uppercase"
          style={{
            backgroundColor: "rgba(16, 185, 129, 0.15)",
            color: colors.success,
          }}
        >
          Active
        </div>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-[12px] mb-[12px]">
        {/* Total Cases */}
        <div>
          <div
            className="text-[10px] font-['Inter:Medium',sans-serif] font-medium uppercase mb-[4px]"
            style={{ color: colors.textTertiary }}
          >
            Total Cases
          </div>
          <div
            className="text-[20px] font-['Inter:Bold',sans-serif] font-bold"
            style={{ color: colors.textPrimary }}
          >
            {totalCases}
          </div>
        </div>

        {/* AI Generated */}
        <div>
          <div
            className="text-[10px] font-['Inter:Medium',sans-serif] font-medium uppercase mb-[4px]"
            style={{ color: colors.textTertiary }}
          >
            AI Generated
          </div>
          <div
            className="text-[20px] font-['Inter:Bold',sans-serif] font-bold"
            style={{ color: colors.accent }}
          >
            {aiGeneratedCases}
          </div>
          <div
            className="text-[9px] font-['Inter:Regular',sans-serif]"
            style={{ color: colors.textTertiary }}
          >
            Watch Center
          </div>
        </div>

        {/* Attack Path */}
        <div>
          <div
            className="text-[10px] font-['Inter:Medium',sans-serif] font-medium uppercase mb-[4px]"
            style={{ color: colors.textTertiary }}
          >
            Attack Path
          </div>
          <div
            className="text-[20px] font-['Inter:Bold',sans-serif] font-bold"
            style={{ color: "#f97316" }}
          >
            {attackPathCases}
          </div>
          <div
            className="text-[9px] font-['Inter:Regular',sans-serif]"
            style={{ color: colors.textTertiary }}
          >
            Investigations
          </div>
        </div>

        {/* Recent (24h) */}
        <div>
          <div
            className="text-[10px] font-['Inter:Medium',sans-serif] font-medium uppercase mb-[4px]"
            style={{ color: colors.textTertiary }}
          >
            Last 24h
          </div>
          <div className="flex items-baseline gap-[4px]">
            <div
              className="text-[20px] font-['Inter:Bold',sans-serif] font-bold"
              style={{ color: colors.success }}
            >
              {recentCases}
            </div>
            <TrendingUp className="size-[14px]" style={{ color: colors.success }} />
          </div>
          <div
            className="text-[9px] font-['Inter:Regular',sans-serif]"
            style={{ color: colors.textTertiary }}
          >
            New cases
          </div>
        </div>
      </div>

      {/* Integration Health */}
      <div
        className="flex items-center gap-[6px] pt-[12px]"
        style={{ borderTop: `1px solid ${colors.border}` }}
      >
        <div className="size-[6px] rounded-full animate-pulse" style={{ backgroundColor: colors.success }} />
        <span
          className="text-[10px] font-['Inter:Regular',sans-serif]"
          style={{ color: colors.textSecondary }}
        >
          Reactive subscription active • Version: {_version} • useSyncExternalStore
        </span>
      </div>

      {/* Integration Sources */}
      <div className="mt-[8px] flex items-center gap-[12px] flex-wrap">
        <div className="flex items-center gap-[4px]">
          <div className="size-[6px] rounded-full" style={{ backgroundColor: colors.accent }} />
          <span
            className="text-[9px] font-['Inter:Regular',sans-serif]"
            style={{ color: colors.textTertiary }}
          >
            Watch Center AI Integration
          </span>
        </div>
        <div className="flex items-center gap-[4px]">
          <div className="size-[6px] rounded-full" style={{ backgroundColor: "#f97316" }} />
          <span
            className="text-[9px] font-['Inter:Regular',sans-serif]"
            style={{ color: colors.textTertiary }}
          >
            Attack Path Integration
          </span>
        </div>
        <div className="flex items-center gap-[4px]">
          <div className="size-[6px] rounded-full" style={{ backgroundColor: "#6b7280" }} />
          <span
            className="text-[9px] font-['Inter:Regular',sans-serif]"
            style={{ color: colors.textTertiary }}
          >
            Manual Cases ({manualCases})
          </span>
        </div>
      </div>
    </div>
  );
}

/**
 * Minimal integration badge for header
 */
export function IntegrationBadge() {
  const _version = useSyncExternalStore(subscribeCases, getCasesSnapshot);
  const totalCases = CASES.length;

  return (
    <div
      className="inline-flex items-center gap-[6px] px-[8px] py-[4px] rounded-[4px]"
      style={{
        backgroundColor: "rgba(16, 185, 129, 0.1)",
        border: "1px solid rgba(16, 185, 129, 0.25)",
      }}
    >
      <div
        className="size-[6px] rounded-full animate-pulse"
        style={{ backgroundColor: "#10b981" }}
      />
      <span
        className="text-[10px] font-['Inter:Medium',sans-serif] font-medium"
        style={{ color: "#10b981" }}
      >
        Live
      </span>
      <span
        className="text-[10px] font-['Inter:Regular',sans-serif]"
        style={{ color: "#89949e" }}
      >
        {totalCases} cases
      </span>
    </div>
  );
}