/**
 * Variable Mapping Components — Visual data mapping for workflow steps
 *
 * Provides drag-and-drop and click-to-insert variable mapping
 * with token-based input fields and data preview
 */

import React, { useState, useRef, useEffect } from "react";
import { Database, ChevronDown, ChevronRight, Sparkles, X, Plus } from "lucide-react";
import { colors } from "../../shared/design-system/tokens";

/* ================================================================
   WORKFLOW DATA STRUCTURE
   ================================================================ */

export interface WorkflowVariable {
  key: string;
  label: string;
  category: "alert" | "case" | "asset" | "enrichment" | "user";
  type: string;
  example: string;
  description?: string;
}

export const WORKFLOW_VARIABLES: WorkflowVariable[] = [
  // Alert variables
  { key: "alert.title", label: "Title", category: "alert", type: "string", example: "Suspicious PowerShell Execution", description: "Alert title from detection" },
  { key: "alert.severity", label: "Severity", category: "alert", type: "string", example: "Critical", description: "Alert severity level" },
  { key: "alert.source", label: "Source", category: "alert", type: "string", example: "CrowdStrike", description: "Alert source system" },
  { key: "alert.asset", label: "Asset", category: "alert", type: "string", example: "workstation-23", description: "Affected asset identifier" },
  { key: "alert.timestamp", label: "Timestamp", category: "alert", type: "datetime", example: "2026-03-14 14:23:00", description: "Alert creation time" },
  { key: "alert.description", label: "Description", category: "alert", type: "string", example: "PowerShell executed with suspicious parameters", description: "Full alert description" },
  
  // Case variables
  { key: "case.id", label: "Case ID", category: "case", type: "string", example: "CASE-2024-0317", description: "Investigation case identifier" },
  { key: "case.link", label: "Case Link", category: "case", type: "url", example: "https://watchcenter.com/cases/317", description: "Direct link to case" },
  { key: "case.assignee", label: "Assigned Analyst", category: "case", type: "string", example: "SOC Analyst", description: "Analyst assigned to case" },
  { key: "case.status", label: "Status", category: "case", type: "string", example: "Open", description: "Current case status" },
  
  // Asset variables
  { key: "asset.hostname", label: "Hostname", category: "asset", type: "string", example: "workstation-23", description: "Asset hostname" },
  { key: "asset.owner", label: "Owner", category: "asset", type: "string", example: "john.doe@company.com", description: "Asset owner email" },
  { key: "asset.type", label: "Type", category: "asset", type: "string", example: "Endpoint", description: "Asset type classification" },
  { key: "asset.ip", label: "IP Address", category: "asset", type: "string", example: "10.0.1.45", description: "Asset IP address" },
  { key: "asset.location", label: "Location", category: "asset", type: "string", example: "US-EAST", description: "Physical asset location" },
  
  // Enrichment variables
  { key: "enrichment.risk_score", label: "Risk Score", category: "enrichment", type: "number", example: "8.5", description: "AI-calculated risk score" },
  { key: "enrichment.threat_intel", label: "Threat Intel", category: "enrichment", type: "string", example: "Known malicious IP", description: "Threat intelligence findings" },
  { key: "enrichment.mitre_tactics", label: "MITRE Tactics", category: "enrichment", type: "array", example: "Execution, Persistence", description: "MITRE ATT&CK tactics" },
  
  // User variables
  { key: "user.name", label: "Current User", category: "user", type: "string", example: "Jane Smith", description: "User running the playbook" },
  { key: "user.email", label: "User Email", category: "user", type: "string", example: "jane.smith@company.com", description: "User email address" },
];

const CATEGORY_LABELS: Record<string, { label: string; icon: typeof Database }> = {
  alert: { label: "Alert", icon: Database },
  case: { label: "Case", icon: Database },
  asset: { label: "Asset", icon: Database },
  enrichment: { label: "Enrichment", icon: Sparkles },
  user: { label: "User", icon: Database },
};

/* ================================================================
   WORKFLOW DATA PANEL
   ================================================================ */

interface WorkflowDataPanelProps {
  onVariableSelect?: (variable: WorkflowVariable) => void;
}

export function WorkflowDataPanel({ onVariableSelect }: WorkflowDataPanelProps) {
  const [expanded, setExpanded] = useState(true);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(["alert", "case", "asset"])
  );

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  };

  const categories = Object.keys(CATEGORY_LABELS);

  return (
    <div
      className="rounded-[8px] overflow-hidden"
      style={{
        backgroundColor: `${colors.accent}05`,
        border: `1px solid ${colors.accent}30`,
      }}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-[12px] py-[10px] transition-colors"
        style={{
          backgroundColor: `${colors.accent}08`,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = `${colors.accent}12`;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = `${colors.accent}08`;
        }}
      >
        <div className="flex items-center gap-[8px]">
          <Database size={12} color={colors.accent} strokeWidth={2} />
          <span className="text-[11px]" style={{ color: colors.textPrimary, fontWeight: 600 }}>
            Workflow Data
          </span>
        </div>
        <ChevronDown
          size={14}
          color={colors.textMuted}
          strokeWidth={2}
          className={`transition-transform ${expanded ? "rotate-180" : ""}`}
        />
      </button>

      {expanded && (
        <div className="px-[12px] py-[10px] space-y-[8px]">
          {categories.map(category => {
            const config = CATEGORY_LABELS[category];
            const isExpanded = expandedCategories.has(category);
            const categoryVars = WORKFLOW_VARIABLES.filter(v => v.category === category);
            
            if (categoryVars.length === 0) return null;

            return (
              <div key={category}>
                <button
                  onClick={() => toggleCategory(category)}
                  className="w-full flex items-center gap-[6px] px-[6px] py-[4px] rounded-[4px] transition-colors"
                  style={{
                    backgroundColor: isExpanded ? colors.bgCardHover : "transparent",
                  }}
                  onMouseEnter={(e) => {
                    if (!isExpanded) e.currentTarget.style.backgroundColor = colors.bgCardHover;
                  }}
                  onMouseLeave={(e) => {
                    if (!isExpanded) e.currentTarget.style.backgroundColor = "transparent";
                  }}
                >
                  {isExpanded ? (
                    <ChevronDown size={12} color={colors.textMuted} strokeWidth={2} />
                  ) : (
                    <ChevronRight size={12} color={colors.textMuted} strokeWidth={2} />
                  )}
                  <span className="text-[10px] uppercase tracking-wide" style={{ color: colors.textMuted, fontWeight: 600 }}>
                    {config.label}
                  </span>
                </button>

                {isExpanded && (
                  <div className="mt-[4px] ml-[12px] space-y-[2px]">
                    {categoryVars.map(variable => (
                      <button
                        key={variable.key}
                        onClick={() => onVariableSelect?.(variable)}
                        draggable
                        onDragStart={(e) => {
                          e.dataTransfer.setData("variable", JSON.stringify(variable));
                          e.dataTransfer.effectAllowed = "copy";
                        }}
                        className="w-full flex items-center justify-between px-[8px] py-[6px] rounded-[4px] cursor-pointer transition-colors group"
                        style={{
                          backgroundColor: "transparent",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = colors.bgCard;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = "transparent";
                        }}
                      >
                        <div className="flex-1 text-left">
                          <div className="text-[10px]" style={{ color: colors.textSecondary, fontWeight: 500 }}>
                            {variable.label}
                          </div>
                          <div className="text-[9px] font-mono" style={{ color: colors.textDim }}>
                            {variable.example}
                          </div>
                        </div>
                        <Plus size={10} color={colors.accent} strokeWidth={2} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ================================================================
   SAMPLE DATA PREVIEW
   ================================================================ */

export function SampleDataPreview() {
  const [expanded, setExpanded] = useState(false);

  const sampleData = [
    { label: "Alert Title", value: "Suspicious PowerShell Execution", color: colors.textPrimary },
    { label: "Severity", value: "Critical", color: colors.critical },
    { label: "Asset", value: "workstation-23", color: colors.textSecondary },
    { label: "Source", value: "CrowdStrike", color: colors.textSecondary },
    { label: "Risk Score", value: "8.5", color: colors.medium },
  ];

  return (
    <div
      className="rounded-[8px] overflow-hidden"
      style={{
        backgroundColor: `${colors.textDim}05`,
        border: `1px solid ${colors.border}`,
      }}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-[12px] py-[10px] transition-colors"
        style={{
          backgroundColor: colors.bgCardHover,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = colors.bgCard;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = colors.bgCardHover;
        }}
      >
        <div className="flex items-center gap-[8px]">
          <Sparkles size={12} color={colors.accent} strokeWidth={2} />
          <span className="text-[11px]" style={{ color: colors.textPrimary, fontWeight: 600 }}>
            Sample Data Preview
          </span>
        </div>
        <ChevronDown
          size={14}
          color={colors.textMuted}
          strokeWidth={2}
          className={`transition-transform ${expanded ? "rotate-180" : ""}`}
        />
      </button>

      {expanded && (
        <div className="px-[12px] py-[10px] space-y-[8px]">
          {sampleData.map((item, idx) => (
            <div key={idx}>
              <div className="text-[10px] mb-[4px]" style={{ color: colors.textDim, fontWeight: 500 }}>
                {item.label}
              </div>
              <div className="text-[11px]" style={{ color: item.color, fontWeight: item.label === "Severity" ? 600 : 400 }}>
                {item.value}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ================================================================
   TOKEN INPUT FIELD
   ================================================================ */

interface Token {
  id: string;
  variable: WorkflowVariable;
}

interface TokenInputProps {
  value?: string;
  placeholder?: string;
  onChange?: (value: string, tokens: Token[]) => void;
  onFocus?: () => void;
  multiline?: boolean;
  rows?: number;
}

export function TokenInput({ value = "", placeholder, onChange, onFocus, multiline = false, rows = 3 }: TokenInputProps) {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [text, setText] = useState(value);
  const [showVariableSelector, setShowVariableSelector] = useState(false);
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const variableData = e.dataTransfer.getData("variable");
    if (variableData) {
      const variable = JSON.parse(variableData) as WorkflowVariable;
      insertVariable(variable);
    }
  };

  const insertVariable = (variable: WorkflowVariable) => {
    const token: Token = {
      id: `token-${Date.now()}`,
      variable,
    };
    
    const newTokens = [...tokens, token];
    setTokens(newTokens);
    
    // Insert variable placeholder into text
    const variablePlaceholder = `{{${variable.key}}}`;
    const newText = text ? `${text} ${variablePlaceholder}` : variablePlaceholder;
    setText(newText);
    onChange?.(newText, newTokens);
    setShowVariableSelector(false);
  };

  const removeToken = (tokenId: string) => {
    const newTokens = tokens.filter(t => t.id !== tokenId);
    setTokens(newTokens);
    
    // Remove variable from text
    const tokenToRemove = tokens.find(t => t.id === tokenId);
    if (tokenToRemove) {
      const variablePlaceholder = `{{${tokenToRemove.variable.key}}}`;
      const newText = text.replace(variablePlaceholder, "").trim();
      setText(newText);
      onChange?.(newText, newTokens);
    }
  };

  const handleFocus = () => {
    setFocused(true);
    onFocus?.();
  };

  const handleBlur = () => {
    // Delay to allow clicking variable selector
    setTimeout(() => setFocused(false), 200);
  };

  return (
    <div ref={containerRef} className="relative">
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className="relative"
      >
        {multiline ? (
          <textarea
            ref={inputRef as React.RefObject<HTMLTextAreaElement>}
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              onChange?.(e.target.value, tokens);
            }}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder={placeholder}
            rows={rows}
            className="w-full px-[12px] py-[8px] rounded-[6px] text-[11px] resize-none"
            style={{
              backgroundColor: colors.bgCardHover,
              border: `1px solid ${focused ? colors.accent : colors.border}`,
              color: colors.textPrimary,
              transition: "border-color 0.15s",
            }}
          />
        ) : (
          <input
            ref={inputRef as React.RefObject<HTMLInputElement>}
            type="text"
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              onChange?.(e.target.value, tokens);
            }}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder={placeholder}
            className="w-full px-[12px] py-[8px] rounded-[6px] text-[12px]"
            style={{
              backgroundColor: colors.bgCardHover,
              border: `1px solid ${focused ? colors.accent : colors.border}`,
              color: colors.textPrimary,
              transition: "border-color 0.15s",
            }}
          />
        )}

        {/* Field Assist Tooltip */}
        {focused && (
          <button
            onClick={() => setShowVariableSelector(!showVariableSelector)}
            className="absolute right-[8px] top-[8px] flex items-center gap-[4px] px-[6px] py-[3px] rounded-[4px] text-[9px] transition-colors"
            style={{
              backgroundColor: `${colors.accent}15`,
              color: colors.accent,
              fontWeight: 600,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = `${colors.accent}25`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = `${colors.accent}15`;
            }}
          >
            <Plus size={9} strokeWidth={2} />
            Insert Variable
          </button>
        )}
      </div>

      {/* Token Pills */}
      {tokens.length > 0 && (
        <div className="mt-[6px] flex flex-wrap gap-[4px]">
          {tokens.map((token) => (
            <div
              key={token.id}
              className="inline-flex items-center gap-[4px] px-[8px] py-[4px] rounded-full text-[10px]"
              style={{
                backgroundColor: `${colors.accent}15`,
                border: `1px solid ${colors.accent}`,
                color: colors.accent,
                fontWeight: 600,
              }}
            >
              <span className="font-mono">{token.variable.label}</span>
              <button
                onClick={() => removeToken(token.id)}
                className="rounded-full p-[1px] transition-colors"
                style={{
                  backgroundColor: "transparent",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = `${colors.critical}30`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                }}
              >
                <X size={10} color={colors.accent} strokeWidth={2} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Variable Selector Dropdown */}
      {showVariableSelector && (
        <div
          className="absolute top-full left-0 right-0 mt-[4px] rounded-[8px] shadow-lg z-10 max-h-[200px] overflow-y-auto"
          style={{
            backgroundColor: colors.bgCard,
            border: `1px solid ${colors.border}`,
          }}
        >
          <div className="p-[8px] space-y-[6px]">
            {Object.keys(CATEGORY_LABELS).map(category => {
              const categoryVars = WORKFLOW_VARIABLES.filter(v => v.category === category);
              if (categoryVars.length === 0) return null;

              return (
                <div key={category}>
                  <div className="text-[9px] px-[8px] py-[4px] uppercase tracking-wide" style={{ color: colors.textDim, fontWeight: 600 }}>
                    {CATEGORY_LABELS[category].label}
                  </div>
                  {categoryVars.map(variable => (
                    <button
                      key={variable.key}
                      onClick={() => insertVariable(variable)}
                      className="w-full flex items-center justify-between px-[8px] py-[6px] rounded-[4px] transition-colors"
                      style={{
                        backgroundColor: "transparent",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = colors.bgCardHover;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "transparent";
                      }}
                    >
                      <div className="text-left">
                        <div className="text-[10px]" style={{ color: colors.textPrimary, fontWeight: 500 }}>
                          {variable.label}
                        </div>
                        <div className="text-[9px] font-mono" style={{ color: colors.textDim }}>
                          {variable.example}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
