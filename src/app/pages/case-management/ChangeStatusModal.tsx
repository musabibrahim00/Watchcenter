/**
 * Change Status Modal
 * ===================
 * 
 * Modal for changing case status with user assignment and final remarks.
 */

import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import { CASE_OWNERS, type CaseOwner, type CaseStatus } from "./case-data";
import { caseColors } from "./design-tokens";

const colors = caseColors;

interface ChangeStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (status: CaseStatus, user: CaseOwner, remarks: string) => void;
  currentStatus: CaseStatus;
  currentOwner: CaseOwner;
}

export function ChangeStatusModal({
  isOpen,
  onClose,
  onSubmit,
  currentStatus,
  currentOwner,
}: ChangeStatusModalProps) {
  const [selectedStatus, setSelectedStatus] = useState<CaseStatus>(currentStatus);
  const [selectedUser, setSelectedUser] = useState<CaseOwner>(currentOwner);
  const [remarks, setRemarks] = useState("");
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = () => {
    onSubmit(selectedStatus, selectedUser, remarks);
    setRemarks("");
    onClose();
  };

  const statuses: CaseStatus[] = ["Open", "In Progress", "Escalated", "Resolved", "Closed"];

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.7)" }}
      onClick={onClose}
    >
      <div
        className="rounded-[12px] p-[24px] max-w-[520px] w-full"
        style={{
          backgroundColor: colors.bgCard,
          border: `1px solid ${colors.border}`,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3
          className="text-[18px] font-['Inter:SemiBold',sans-serif] font-semibold mb-[20px]"
          style={{ color: colors.textPrimary }}
        >
          Change Status
        </h3>

        {/* Status Field */}
        <div className="mb-[16px]">
          <label
            className="text-[12px] font-['Inter:Medium',sans-serif] font-medium uppercase block mb-[8px]"
            style={{ color: colors.textTertiary }}
          >
            Status
          </label>
          <div className="relative">
            <button
              onClick={() => setStatusDropdownOpen(!statusDropdownOpen)}
              className="w-full appearance-none px-[14px] py-[10px] pr-[36px] rounded-[6px] text-[13px] font-['Inter:Regular',sans-serif] cursor-pointer transition-colors hover:bg-[rgba(255,255,255,0.02)] text-left"
              style={{
                backgroundColor: colors.bgDark,
                border: `1px solid ${colors.border}`,
                color: colors.textPrimary,
              }}
            >
              {selectedStatus}
            </button>
            <ChevronDown
              className="absolute right-[12px] top-1/2 -translate-y-1/2 size-[14px] pointer-events-none"
              style={{ color: colors.textTertiary }}
            />
            {statusDropdownOpen && (
              <div
                className="absolute top-full left-0 right-0 mt-[4px] rounded-[6px] py-[4px] z-10"
                style={{
                  backgroundColor: colors.bgCard,
                  border: `1px solid ${colors.border}`,
                }}
              >
                {statuses.map((status) => (
                  <button
                    key={status}
                    onClick={() => {
                      setSelectedStatus(status);
                      setStatusDropdownOpen(false);
                    }}
                    className="w-full text-left px-[14px] py-[8px] text-[13px] font-['Inter:Regular',sans-serif] transition-colors hover:bg-[rgba(255,255,255,0.05)]"
                    style={{ color: colors.textPrimary }}
                  >
                    {status}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* User Field */}
        <div className="mb-[16px]">
          <label
            className="text-[12px] font-['Inter:Medium',sans-serif] font-medium uppercase block mb-[8px]"
            style={{ color: colors.textTertiary }}
          >
            User
          </label>
          <div className="relative">
            <button
              onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              className="w-full appearance-none px-[14px] py-[10px] pr-[36px] rounded-[6px] text-[13px] font-['Inter:Regular',sans-serif] cursor-pointer transition-colors hover:bg-[rgba(255,255,255,0.02)] text-left flex items-center gap-[8px]"
              style={{
                backgroundColor: colors.bgDark,
                border: `1px solid ${colors.border}`,
                color: colors.textPrimary,
              }}
            >
              <img
                src={selectedUser.avatar}
                alt={selectedUser.name}
                className="size-[20px] rounded-full object-cover"
              />
              {selectedUser.name}
            </button>
            <ChevronDown
              className="absolute right-[12px] top-1/2 -translate-y-1/2 size-[14px] pointer-events-none"
              style={{ color: colors.textTertiary }}
            />
            {userDropdownOpen && (
              <div
                className="absolute top-full left-0 right-0 mt-[4px] rounded-[6px] py-[4px] z-10"
                style={{
                  backgroundColor: colors.bgCard,
                  border: `1px solid ${colors.border}`,
                }}
              >
                {CASE_OWNERS.map((owner) => (
                  <button
                    key={owner.id}
                    onClick={() => {
                      setSelectedUser(owner);
                      setUserDropdownOpen(false);
                    }}
                    className="w-full text-left px-[14px] py-[8px] text-[13px] font-['Inter:Regular',sans-serif] transition-colors hover:bg-[rgba(255,255,255,0.05)] flex items-center gap-[8px]"
                    style={{ color: colors.textPrimary }}
                  >
                    <img
                      src={owner.avatar}
                      alt={owner.name}
                      className="size-[20px] rounded-full object-cover"
                    />
                    {owner.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Final Remarks Field */}
        <div className="mb-[24px]">
          <label
            className="text-[12px] font-['Inter:Medium',sans-serif] font-medium uppercase block mb-[8px]"
            style={{ color: colors.textTertiary }}
          >
            Final Remarks
          </label>
          <textarea
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            placeholder="Add any final remarks or notes..."
            className="w-full px-[14px] py-[10px] rounded-[6px] text-[13px] font-['Inter:Regular',sans-serif] resize-none focus:outline-none focus:ring-1"
            style={{
              backgroundColor: colors.bgDark,
              border: `1px solid ${colors.border}`,
              color: colors.textPrimary,
              focusRingColor: colors.accent,
              minHeight: "100px",
            }}
          />
        </div>

        {/* Buttons */}
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
            onClick={handleSubmit}
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
            Submit
          </button>
        </div>
      </div>
    </div>
  );
}