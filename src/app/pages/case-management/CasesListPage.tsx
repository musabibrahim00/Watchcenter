/**
 * Cases List Page
 * ================
 * 
 * Table view of all cases with filtering, search, pagination.
 * Reactively subscribes to case data so newly created cases
 * (from Watch Center AI / Attack Path) appear automatically.
 */

import React, { useState, useMemo, useSyncExternalStore } from "react";
import { useNavigate } from "react-router";
import { ChevronDown, ChevronLeft, ChevronRight, ArrowUpDown, Search } from "lucide-react";
import {
  CASES,
  subscribeCases,
  getCasesSnapshot,
  type Case,
  type CaseSeverity,
  type CaseVerdict,
} from "./case-data";
import { PageContainer } from "../../shared/components";
import { EntityLink } from "../../shared/components/EntityLink";
import { caseColors } from "./design-tokens";

const ROWS_PER_PAGE = 10;

interface SeverityBadgeProps {
  severity: CaseSeverity;
}

function SeverityBadge({ severity }: SeverityBadgeProps) {
  const getBadgeColor = (sev: CaseSeverity) => {
    switch (sev) {
      case "Critical":
        return { bg: "rgba(239, 68, 68, 0.1)", text: "#ef4444", border: "rgba(239, 68, 68, 0.3)" };
      case "High":
        return { bg: "rgba(249, 115, 22, 0.1)", text: "#f97316", border: "rgba(249, 115, 22, 0.3)" };
      case "Medium":
        return { bg: "rgba(245, 158, 11, 0.1)", text: "#f59e0b", border: "rgba(245, 158, 11, 0.3)" };
      case "Low":
        return { bg: "rgba(59, 130, 246, 0.1)", text: "#3b82f6", border: "rgba(59, 130, 246, 0.3)" };
    }
  };

  const badgeStyle = getBadgeColor(severity);

  return (
    <div
      className="inline-flex items-center px-[10px] py-[4px] rounded-[6px] text-[11px] font-['Inter:SemiBold',sans-serif] font-semibold uppercase"
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

function ResolutionBadge({ state }: { state: string }) {
  const getBadgeStyle = (st: string) => {
    switch (st) {
      case "Unresolved":
        return { bg: "rgba(245, 158, 11, 0.1)", text: "#f59e0b", border: "rgba(245, 158, 11, 0.3)" };
      case "True Positive":
        return { bg: "rgba(239, 68, 68, 0.1)", text: "#ef4444", border: "rgba(239, 68, 68, 0.3)" };
      case "False Positive":
        return { bg: "rgba(16, 185, 129, 0.1)", text: "#10b981", border: "rgba(16, 185, 129, 0.3)" };
      case "Duplicate":
        return { bg: "rgba(107, 114, 128, 0.1)", text: "#6b7280", border: "rgba(107, 114, 128, 0.3)" };
      case "Case Assigned":
        return { bg: "rgba(20, 162, 227, 0.1)", text: "#14a2e3", border: "rgba(20, 162, 227, 0.3)" };
      default:
        return { bg: "rgba(107, 114, 128, 0.1)", text: "#6b7280", border: "rgba(107, 114, 128, 0.3)" };
    }
  };

  const badgeStyle = getBadgeStyle(state);

  return (
    <div
      className="inline-flex items-center px-[10px] py-[4px] rounded-[6px] text-[11px] font-['Inter:Medium',sans-serif] font-medium"
      style={{
        backgroundColor: badgeStyle.bg,
        color: badgeStyle.text,
        border: `1px solid ${badgeStyle.border}`,
      }}
    >
      {state}
    </div>
  );
}

function VerdictLabel({ verdict }: { verdict: CaseVerdict }) {
  const getColor = (v: CaseVerdict) => {
    switch (v) {
      case "True Positive":
        return caseColors.critical;
      case "Benign True Positive":
        return "#f59e0b";
      case "False Positive":
        return "#10b981";
      case "Under Review":
        return caseColors.textSecondary;
    }
  };

  return (
    <span
      className="text-[11px] font-['Inter:Medium',sans-serif] font-medium"
      style={{ color: getColor(verdict) }}
    >
      {verdict}
    </span>
  );
}

export default function CasesListPage() {
  // Subscribe to reactive case data changes
  const _version = useSyncExternalStore(subscribeCases, getCasesSnapshot);

  const navigate = useNavigate();
  const [severityFilter, setSeverityFilter] = useState<string>("All");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [verdictFilter, setVerdictFilter] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<keyof Case | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);

  // Apply filters + search
  const filteredCases = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return CASES.filter((caseItem) => {
      const matchesSeverity = severityFilter === "All" || caseItem.severity === severityFilter;
      const matchesStatus = statusFilter === "All" || caseItem.status === statusFilter;
      const matchesVerdict = verdictFilter === "All" || caseItem.verdict === verdictFilter;
      const matchesSearch =
        !q ||
        caseItem.id.toLowerCase().includes(q) ||
        caseItem.title.toLowerCase().includes(q) ||
        caseItem.owner.name.toLowerCase().includes(q);
      return matchesSeverity && matchesStatus && matchesVerdict && matchesSearch;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [severityFilter, statusFilter, verdictFilter, searchQuery, _version]);

  // Apply sorting (newest first by default)
  const sortedCases = useMemo(() => {
    if (!sortField) {
      // Default: newest first
      return [...filteredCases].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }

    return [...filteredCases].sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];

      if (aVal === bVal) return 0;

      // For date columns, compare as dates
      if (sortField === "createdAt" || sortField === "updatedAt") {
        const comparison = new Date(aVal as string).getTime() - new Date(bVal as string).getTime();
        return sortDirection === "asc" ? comparison : -comparison;
      }

      const comparison = (aVal as string) > (bVal as string) ? 1 : -1;
      return sortDirection === "asc" ? comparison : -comparison;
    });
  }, [filteredCases, sortField, sortDirection]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(sortedCases.length / ROWS_PER_PAGE));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedCases = sortedCases.slice(
    (safeCurrentPage - 1) * ROWS_PER_PAGE,
    safeCurrentPage * ROWS_PER_PAGE
  );

  // Reset page when filters change
  const handleFilterChange = (setter: React.Dispatch<React.SetStateAction<string>>) => (value: string) => {
    setter(value);
    setCurrentPage(1);
  };

  const handleSort = (field: keyof Case) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const handleRowClick = (caseId: string) => {
    navigate(`/case-management/${caseId}`);
  };

  // Calculate case counts by severity (from filtered set)
  const criticalCount = filteredCases.filter((c) => c.severity === "Critical").length;
  const highCount = filteredCases.filter((c) => c.severity === "High").length;
  const mediumCount = filteredCases.filter((c) => c.severity === "Medium").length;
  const lowCount = filteredCases.filter((c) => c.severity === "Low").length;
  const totalCount = filteredCases.length;

  const criticalPercent = totalCount > 0 ? (criticalCount / totalCount) * 100 : 0;
  const highPercent = totalCount > 0 ? (highCount / totalCount) * 100 : 0;
  const mediumPercent = totalCount > 0 ? (mediumCount / totalCount) * 100 : 0;
  const lowPercent = totalCount > 0 ? (lowCount / totalCount) * 100 : 0;

  // Format date helper
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
    <PageContainer>
      {/* Filter Bar */}
      <div className="flex items-center gap-[12px] mb-[20px] flex-wrap">
        {/* Severity Filter */}
        <div className="relative">
          <select
            value={severityFilter}
            onChange={(e) => handleFilterChange(setSeverityFilter)(e.target.value)}
            className="appearance-none px-[14px] py-[8px] pr-[36px] rounded-[6px] text-[12px] font-['Inter:Medium',sans-serif] font-medium cursor-pointer transition-colors"
            style={{
              backgroundColor: caseColors.bgCard,
              border: `1px solid ${caseColors.border}`,
              color: caseColors.textPrimary,
            }}
          >
            <option value="All">All Severities</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
          <ChevronDown
            className="absolute right-[12px] top-1/2 -translate-y-1/2 size-[14px] pointer-events-none"
            style={{ color: caseColors.textTertiary }}
          />
        </div>

        {/* Status Filter */}
        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => handleFilterChange(setStatusFilter)(e.target.value)}
            className="appearance-none px-[14px] py-[8px] pr-[36px] rounded-[6px] text-[12px] font-['Inter:Medium',sans-serif] font-medium cursor-pointer transition-colors"
            style={{
              backgroundColor: caseColors.bgCard,
              border: `1px solid ${caseColors.border}`,
              color: caseColors.textPrimary,
            }}
          >
            <option value="All">All Statuses</option>
            <option value="Open">Open</option>
            <option value="In Progress">In Progress</option>
            <option value="Escalated">Escalated</option>
            <option value="Resolved">Resolved</option>
            <option value="Closed">Closed</option>
          </select>
          <ChevronDown
            className="absolute right-[12px] top-1/2 -translate-y-1/2 size-[14px] pointer-events-none"
            style={{ color: caseColors.textTertiary }}
          />
        </div>

        {/* Verdict Filter */}
        <div className="relative">
          <select
            value={verdictFilter}
            onChange={(e) => handleFilterChange(setVerdictFilter)(e.target.value)}
            className="appearance-none px-[14px] py-[8px] pr-[36px] rounded-[6px] text-[12px] font-['Inter:Medium',sans-serif] font-medium cursor-pointer transition-colors"
            style={{
              backgroundColor: caseColors.bgCard,
              border: `1px solid ${caseColors.border}`,
              color: caseColors.textPrimary,
            }}
          >
            <option value="All">All Verdicts</option>
            <option value="Benign True Positive">Benign True Positive</option>
            <option value="True Positive">True Positive</option>
            <option value="False Positive">False Positive</option>
            <option value="Under Review">Under Review</option>
          </select>
          <ChevronDown
            className="absolute right-[12px] top-1/2 -translate-y-1/2 size-[14px] pointer-events-none"
            style={{ color: caseColors.textTertiary }}
          />
        </div>
      </div>

      {/* Cases Summary Bar */}
      <div
        className="rounded-[8px] p-[16px] mb-[20px]"
        style={{
          backgroundColor: caseColors.bgCard,
          border: `1px solid ${caseColors.border}`,
        }}
      >
        <div className="flex items-center justify-between mb-[12px]">
          <div>
            <span
              className="text-[12px] font-['Inter:Medium',sans-serif] font-medium mr-[16px]"
              style={{ color: caseColors.textSecondary }}
            >
              Total Cases:
            </span>
            <span
              className="text-[16px] font-['Inter:Bold',sans-serif] font-bold"
              style={{ color: caseColors.textPrimary }}
            >
              {totalCount}
            </span>
          </div>
          <div className="flex items-center gap-[24px]">
            <div className="flex items-center gap-[8px]">
              <div className="size-[10px] rounded-sm" style={{ backgroundColor: caseColors.critical }} />
              <span className="text-[11px] font-['Inter:Regular',sans-serif]" style={{ color: caseColors.textSecondary }}>
                Critical: <span style={{ color: caseColors.textPrimary }}>{criticalCount}</span>
              </span>
            </div>
            <div className="flex items-center gap-[8px]">
              <div className="size-[10px] rounded-sm" style={{ backgroundColor: caseColors.high }} />
              <span className="text-[11px] font-['Inter:Regular',sans-serif]" style={{ color: caseColors.textSecondary }}>
                High Priority: <span style={{ color: caseColors.textPrimary }}>{highCount}</span>
              </span>
            </div>
            <div className="flex items-center gap-[8px]">
              <div className="size-[10px] rounded-sm" style={{ backgroundColor: caseColors.medium }} />
              <span className="text-[11px] font-['Inter:Regular',sans-serif]" style={{ color: caseColors.textSecondary }}>
                Medium Priority: <span style={{ color: caseColors.textPrimary }}>{mediumCount}</span>
              </span>
            </div>
            <div className="flex items-center gap-[8px]">
              <div className="size-[10px] rounded-sm" style={{ backgroundColor: caseColors.low }} />
              <span className="text-[11px] font-['Inter:Regular',sans-serif]" style={{ color: caseColors.textSecondary }}>
                Low Priority: <span style={{ color: caseColors.textPrimary }}>{lowCount}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="h-[8px] w-full rounded-full overflow-hidden flex" style={{ backgroundColor: caseColors.bgDark }}>
          {criticalPercent > 0 && (
            <div
              className="h-full transition-all duration-500"
              style={{ width: `${criticalPercent}%`, backgroundColor: caseColors.critical }}
            />
          )}
          {highPercent > 0 && (
            <div
              className="h-full transition-all duration-500"
              style={{ width: `${highPercent}%`, backgroundColor: caseColors.high }}
            />
          )}
          {mediumPercent > 0 && (
            <div
              className="h-full transition-all duration-500"
              style={{ width: `${mediumPercent}%`, backgroundColor: caseColors.medium }}
            />
          )}
          {lowPercent > 0 && (
            <div
              className="h-full transition-all duration-500"
              style={{ width: `${lowPercent}%`, backgroundColor: caseColors.low }}
            />
          )}
        </div>
      </div>

      {/* Search Bar and Last Synced Row */}
      <div className="flex items-center justify-between mb-[16px]">
        {/* Search Bar */}
        <div className="relative">
          <Search
            className="absolute left-[12px] top-1/2 -translate-y-1/2 size-[14px]"
            style={{ color: caseColors.textTertiary }}
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search cases..."
            className="pl-[34px] pr-[14px] py-[8px] rounded-[6px] text-[12px] font-['Inter:Regular',sans-serif] w-[300px] focus:outline-none focus:ring-1"
            style={{
              backgroundColor: caseColors.bgCard,
              border: `1px solid ${caseColors.border}`,
              color: caseColors.textPrimary,
            }}
          />
        </div>

        {/* Right Side: Last Synced + View Toggle */}
        <div className="flex items-center gap-[16px]">
          <span
            className="text-[11px] font-['Inter:Regular',sans-serif]"
            style={{ color: caseColors.textTertiary }}
          >
            Last Synced: Just now
          </span>
          <button
            className="size-[32px] flex items-center justify-center rounded-[6px] hover:bg-[rgba(255,255,255,0.05)] transition-colors"
            style={{ border: `1px solid ${caseColors.border}` }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="2" y="2" width="5" height="5" rx="1" fill={caseColors.textTertiary} />
              <rect x="9" y="2" width="5" height="5" rx="1" fill={caseColors.textTertiary} />
              <rect x="2" y="9" width="5" height="5" rx="1" fill={caseColors.textTertiary} />
              <rect x="9" y="9" width="5" height="5" rx="1" fill={caseColors.textTertiary} />
            </svg>
          </button>
        </div>
      </div>

      {/* Cases Table */}
      <div
        className="rounded-[8px] overflow-hidden"
        style={{
          backgroundColor: caseColors.bgCard,
          border: `1px solid ${caseColors.border}`,
        }}
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead style={{ backgroundColor: caseColors.tableHeaderBg }}>
              <tr style={{ borderBottom: `1px solid ${caseColors.border}` }}>
                <th
                  className="text-left px-[16px] py-[12px] cursor-pointer hover:bg-[rgba(255,255,255,0.02)] transition-colors"
                  onClick={() => handleSort("id")}
                >
                  <div className="flex items-center gap-[6px]">
                    <span
                      className="text-[11px] font-['Inter:SemiBold',sans-serif] font-semibold uppercase"
                      style={{ color: caseColors.textSecondary }}
                    >
                      Case ID
                    </span>
                    <ArrowUpDown className="size-[12px]" style={{ color: caseColors.textTertiary }} />
                  </div>
                </th>
                <th
                  className="text-left px-[16px] py-[12px] cursor-pointer hover:bg-[rgba(255,255,255,0.02)] transition-colors"
                  onClick={() => handleSort("severity")}
                >
                  <div className="flex items-center gap-[6px]">
                    <span
                      className="text-[11px] font-['Inter:SemiBold',sans-serif] font-semibold uppercase"
                      style={{ color: caseColors.textSecondary }}
                    >
                      Severity
                    </span>
                    <ArrowUpDown className="size-[12px]" style={{ color: caseColors.textTertiary }} />
                  </div>
                </th>
                <th
                  className="text-left px-[16px] py-[12px] cursor-pointer hover:bg-[rgba(255,255,255,0.02)] transition-colors"
                  onClick={() => handleSort("title")}
                >
                  <div className="flex items-center gap-[6px]">
                    <span
                      className="text-[11px] font-['Inter:SemiBold',sans-serif] font-semibold uppercase"
                      style={{ color: caseColors.textSecondary }}
                    >
                      Case Name
                    </span>
                    <ArrowUpDown className="size-[12px]" style={{ color: caseColors.textTertiary }} />
                  </div>
                </th>
                <th
                  className="text-left px-[16px] py-[12px] cursor-pointer hover:bg-[rgba(255,255,255,0.02)] transition-colors"
                  onClick={() => handleSort("resolutionState")}
                >
                  <div className="flex items-center gap-[6px]">
                    <span
                      className="text-[11px] font-['Inter:SemiBold',sans-serif] font-semibold uppercase"
                      style={{ color: caseColors.textSecondary }}
                    >
                      Resolution State
                    </span>
                    <ArrowUpDown className="size-[12px]" style={{ color: caseColors.textTertiary }} />
                  </div>
                </th>
                <th className="text-left px-[16px] py-[12px]">
                  <span
                    className="text-[11px] font-['Inter:SemiBold',sans-serif] font-semibold uppercase"
                    style={{ color: caseColors.textSecondary }}
                  >
                    Owner
                  </span>
                </th>
                <th
                  className="text-left px-[16px] py-[12px] cursor-pointer hover:bg-[rgba(255,255,255,0.02)] transition-colors"
                  onClick={() => handleSort("createdAt")}
                >
                  <div className="flex items-center gap-[6px]">
                    <span
                      className="text-[11px] font-['Inter:SemiBold',sans-serif] font-semibold uppercase"
                      style={{ color: caseColors.textSecondary }}
                    >
                      Created On
                    </span>
                    <ArrowUpDown className="size-[12px]" style={{ color: caseColors.textTertiary }} />
                  </div>
                </th>
                <th
                  className="text-left px-[16px] py-[12px] cursor-pointer hover:bg-[rgba(255,255,255,0.02)] transition-colors"
                  onClick={() => handleSort("updatedAt")}
                >
                  <div className="flex items-center gap-[6px]">
                    <span
                      className="text-[11px] font-['Inter:SemiBold',sans-serif] font-semibold uppercase"
                      style={{ color: caseColors.textSecondary }}
                    >
                      Last Updated
                    </span>
                    <ArrowUpDown className="size-[12px]" style={{ color: caseColors.textTertiary }} />
                  </div>
                </th>
                <th
                  className="text-left px-[16px] py-[12px] cursor-pointer hover:bg-[rgba(255,255,255,0.02)] transition-colors"
                  onClick={() => handleSort("verdict")}
                >
                  <div className="flex items-center gap-[6px]">
                    <span
                      className="text-[11px] font-['Inter:SemiBold',sans-serif] font-semibold uppercase"
                      style={{ color: caseColors.textSecondary }}
                    >
                      Verdict
                    </span>
                    <ArrowUpDown className="size-[12px]" style={{ color: caseColors.textTertiary }} />
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedCases.map((caseItem) => (
                <tr
                  key={caseItem.id}
                  onClick={() => handleRowClick(caseItem.id)}
                  className="cursor-pointer transition-colors"
                  style={{
                    borderBottom: `1px solid ${caseColors.border}`,
                    backgroundColor: caseColors.tableRowDefaultBg,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = caseColors.tableRowHoverBg;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = caseColors.tableRowDefaultBg;
                  }}
                >
                  <td className="px-[16px] py-[14px]">
                    <span onClick={e => e.stopPropagation()}>
                      <EntityLink
                        entityType="case"
                        entityId={caseItem.id}
                        label={caseItem.id}
                        style={{ fontSize: 12, fontWeight: 500, borderBottom: "none" }}
                      />
                    </span>
                  </td>
                  <td className="px-[16px] py-[14px]">
                    <SeverityBadge severity={caseItem.severity} />
                  </td>
                  <td className="px-[16px] py-[14px]">
                    <span
                      className="text-[12px] font-['Inter:Regular',sans-serif] line-clamp-1"
                      style={{ color: caseColors.textPrimary }}
                    >
                      {caseItem.title}
                    </span>
                  </td>
                  <td className="px-[16px] py-[14px]">
                    <ResolutionBadge state={caseItem.resolutionState} />
                  </td>
                  <td className="px-[16px] py-[14px]">
                    <div className="flex items-center gap-[8px]">
                      <img
                        src={caseItem.owner.avatar}
                        alt={caseItem.owner.name}
                        className="size-[24px] rounded-full object-cover"
                      />
                      <span
                        className="text-[12px] font-['Inter:Regular',sans-serif]"
                        style={{ color: caseColors.textPrimary }}
                      >
                        {caseItem.owner.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-[16px] py-[14px]">
                    <span
                      className="text-[12px] font-['Inter:Regular',sans-serif]"
                      style={{ color: caseColors.textSecondary }}
                    >
                      {formatDate(caseItem.createdAt)}
                    </span>
                  </td>
                  <td className="px-[16px] py-[14px]">
                    <span
                      className="text-[12px] font-['Inter:Regular',sans-serif]"
                      style={{ color: caseColors.textSecondary }}
                    >
                      {formatDate(caseItem.updatedAt)}
                    </span>
                  </td>
                  <td className="px-[16px] py-[14px]">
                    <VerdictLabel verdict={caseItem.verdict} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {sortedCases.length === 0 && (
            <div className="text-center py-[40px]">
              <span
                className="text-[13px] font-['Inter:Regular',sans-serif]"
                style={{ color: caseColors.textTertiary }}
              >
                No cases match the current filters
              </span>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div
            className="flex items-center justify-between px-[16px] py-[12px]"
            style={{ borderTop: `1px solid ${caseColors.border}` }}
          >
            <span
              className="text-[12px] font-['Inter:Regular',sans-serif]"
              style={{ color: caseColors.textSecondary }}
            >
              Showing {(safeCurrentPage - 1) * ROWS_PER_PAGE + 1}–
              {Math.min(safeCurrentPage * ROWS_PER_PAGE, sortedCases.length)} of{" "}
              {sortedCases.length} cases
            </span>

            <div className="flex items-center gap-[8px]">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={safeCurrentPage === 1}
                className="p-[6px] rounded-[6px] transition-colors disabled:opacity-30 hover:bg-[rgba(255,255,255,0.05)]"
                style={{ color: caseColors.textSecondary }}
              >
                <ChevronLeft className="size-[16px]" />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className="min-w-[32px] h-[32px] rounded-[6px] text-[12px] font-['Inter:Medium',sans-serif] font-medium transition-colors"
                  style={{
                    backgroundColor: page === safeCurrentPage ? caseColors.accent : "transparent",
                    color: page === safeCurrentPage ? "#ffffff" : caseColors.textSecondary,
                  }}
                >
                  {page}
                </button>
              ))}

              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={safeCurrentPage === totalPages}
                className="p-[6px] rounded-[6px] transition-colors disabled:opacity-30 hover:bg-[rgba(255,255,255,0.05)]"
                style={{ color: caseColors.textSecondary }}
              >
                <ChevronRight className="size-[16px]" />
              </button>
            </div>
          </div>
        )}
      </div>
    </PageContainer>
  );
}