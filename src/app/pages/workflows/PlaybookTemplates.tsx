/**
 * Playbook Templates — AI-generated workflow templates
 *
 * Pre-built SOC automation templates that users can deploy in seconds
 * Each template can be customized via AIBox before creation
 */

import React, { useState } from "react";
import {
  AlertTriangle,
  Shield,
  Lock,
  Bug,
  Database,
  CheckCircle,
  Sparkles,
  FileText,
  MessageSquare,
  User,
  TrendingUp,
  X,
  ChevronRight,
} from "lucide-react";
import { colors } from "../../shared/design-system/tokens";
import { useAiBox } from "../../features/ai-box";
import { buildWorkflowAiContext } from "./workflowAiStates";

/* ================================================================
   TYPES
   ================================================================ */

interface PlaybookTemplate {
  id: string;
  name: string;
  description: string;
  category: "alerts" | "vulnerabilities" | "investigation" | "remediation" | "compliance";
  icon: typeof AlertTriangle;
  steps: string[];
  estimatedTime: string;
  difficulty: "Easy" | "Medium" | "Advanced";
}

interface PlaybookTemplatesProps {
  onCreateWorkflow: (template: PlaybookTemplate, customization?: string) => void;
  onCancel: () => void;
}

/* ================================================================
   TEMPLATE DATA
   ================================================================ */

const TEMPLATES: PlaybookTemplate[] = [
  {
    id: "critical-alert-response",
    name: "Critical Alert Auto-Response",
    description: "Automatically creates a case and notifies the SOC team when a critical alert is detected.",
    category: "alerts",
    icon: AlertTriangle,
    steps: ["Alert Trigger", "Enrich Alert", "Create Case", "Notify Slack"],
    estimatedTime: "2-3 min",
    difficulty: "Easy",
  },
  {
    id: "vulnerability-escalation",
    name: "Vulnerability Escalation",
    description: "Triages critical vulnerabilities, creates remediation tickets, and assigns to DevOps team.",
    category: "vulnerabilities",
    icon: Shield,
    steps: ["Vulnerability Detected", "Check Exploitability", "Create Patch Ticket", "Assign DevOps", "Notify Manager"],
    estimatedTime: "3-4 min",
    difficulty: "Medium",
  },
  {
    id: "suspicious-login",
    name: "Suspicious Login Investigation",
    description: "Investigates suspicious login attempts with threat intelligence and user context enrichment.",
    category: "investigation",
    icon: Lock,
    steps: ["Alert Trigger", "Enrich with Threat Intel", "Check User Context", "Risk Score", "Create Case if High Risk"],
    estimatedTime: "2-3 min",
    difficulty: "Medium",
  },
  {
    id: "malware-containment",
    name: "Malware Containment",
    description: "Automatically quarantines infected assets and disables compromised accounts.",
    category: "remediation",
    icon: Bug,
    steps: ["Malware Alert", "Quarantine Asset", "Disable Account", "Block IP", "Create Incident", "Escalate"],
    estimatedTime: "4-5 min",
    difficulty: "Advanced",
  },
  {
    id: "asset-discovery",
    name: "Asset Discovery Enrichment",
    description: "Enriches newly discovered assets with CMDB data and assigns to asset management team.",
    category: "investigation",
    icon: Database,
    steps: ["Asset Discovered", "Query CMDB", "Check Compliance", "Tag Asset", "Notify Asset Team"],
    estimatedTime: "2 min",
    difficulty: "Easy",
  },
  {
    id: "compliance-check",
    name: "Compliance Check Automation",
    description: "Runs automated compliance checks and generates reports for audit requirements.",
    category: "compliance",
    icon: CheckCircle,
    steps: ["Scheduled Trigger", "Run Compliance Scan", "Generate Report", "Email Compliance Team", "Create Ticket if Failed"],
    estimatedTime: "3 min",
    difficulty: "Medium",
  },
];

const CATEGORY_COLORS: Record<string, string> = {
  alerts: colors.warning,
  vulnerabilities: colors.critical,
  investigation: colors.accent,
  remediation: colors.active,
  compliance: "#6366F1",
};

/* ================================================================
   TEMPLATE CARD COMPONENT
   ================================================================ */

interface TemplateCardProps {
  template: PlaybookTemplate;
  onClick: () => void;
  isSelected: boolean;
}

function TemplateCard({ template, onClick, isSelected }: TemplateCardProps) {
  const TemplateIcon = template.icon;
  const categoryColor = CATEGORY_COLORS[template.category];

  return (
    <button
      onClick={onClick}
      className="w-full text-left rounded-[10px] p-[16px] transition-all"
      style={{
        backgroundColor: isSelected ? `${colors.accent}08` : colors.bgCard,
        border: `1px solid ${isSelected ? colors.accent : colors.border}`,
      }}
      onMouseEnter={(e) => {
        if (!isSelected) {
          e.currentTarget.style.backgroundColor = colors.bgCardHover;
          e.currentTarget.style.borderColor = colors.accent;
        }
      }}
      onMouseLeave={(e) => {
        if (!isSelected) {
          e.currentTarget.style.backgroundColor = colors.bgCard;
          e.currentTarget.style.borderColor = colors.border;
        }
      }}
    >
      {/* Header */}
      <div className="flex items-start gap-[12px] mb-[12px]">
        <div
          className="size-[40px] rounded-[8px] flex items-center justify-center shrink-0"
          style={{
            backgroundColor: `${categoryColor}15`,
            border: `1px solid ${categoryColor}`,
          }}
        >
          <TemplateIcon size={18} color={categoryColor} strokeWidth={2} />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-[13px] mb-[4px]" style={{ color: colors.textPrimary, fontWeight: 600 }}>
            {template.name}
          </h4>
          <div className="flex items-center gap-[8px]">
            <span
              className="text-[9px] px-[6px] py-[2px] rounded-[4px]"
              style={{
                backgroundColor: `${categoryColor}15`,
                color: categoryColor,
                fontWeight: 600,
              }}
            >
              {template.category.toUpperCase()}
            </span>
            <span className="text-[10px]" style={{ color: colors.textDim }}>
              •
            </span>
            <span className="text-[10px]" style={{ color: colors.textMuted }}>
              {template.steps.length} steps
            </span>
            <span className="text-[10px]" style={{ color: colors.textDim }}>
              •
            </span>
            <span className="text-[10px]" style={{ color: colors.textMuted }}>
              {template.estimatedTime}
            </span>
          </div>
        </div>
      </div>

      {/* Description */}
      <p
        className="text-[11px] mb-[12px]"
        style={{ color: colors.textSecondary, lineHeight: 1.5 }}
      >
        {template.description}
      </p>

      {/* Difficulty Badge */}
      <div className="flex items-center justify-between">
        <span className="text-[10px]" style={{ color: colors.textDim, fontWeight: 500 }}>
          {template.difficulty} to configure
        </span>
        <ChevronRight
          size={14}
          color={isSelected ? colors.accent : colors.textDim}
          strokeWidth={2}
        />
      </div>
    </button>
  );
}

/* ================================================================
   TEMPLATE PREVIEW COMPONENT
   ================================================================ */

interface TemplatePreviewProps {
  template: PlaybookTemplate;
  onCreateWorkflow: () => void;
  onCustomize: (customization: string) => void;
}

function TemplatePreview({ template, onCreateWorkflow, onCustomize }: TemplatePreviewProps) {
  const TemplateIcon = template.icon;
  const categoryColor = CATEGORY_COLORS[template.category];

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div
        className="px-[20px] py-[16px] shrink-0"
        style={{ borderBottom: `1px solid ${colors.border}` }}
      >
        <div className="flex items-start gap-[12px]">
          <div
            className="size-[48px] rounded-[10px] flex items-center justify-center shrink-0"
            style={{
              backgroundColor: `${categoryColor}15`,
              border: `1px solid ${categoryColor}`,
            }}
          >
            <TemplateIcon size={22} color={categoryColor} strokeWidth={2} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-[14px] mb-[4px]" style={{ color: colors.textPrimary, fontWeight: 600 }}>
              {template.name}
            </h3>
            <p className="text-[11px]" style={{ color: colors.textMuted, lineHeight: 1.5 }}>
              {template.description}
            </p>
          </div>
        </div>
      </div>

      {/* Workflow Preview */}
      <div className="flex-1 overflow-y-auto px-[20px] py-[16px]">
        <div className="mb-[16px]">
          <div className="text-[10px] mb-[10px]" style={{ color: colors.textDim, fontWeight: 600 }}>
            WORKFLOW PREVIEW
          </div>
          <div className="space-y-[8px]">
            {template.steps.map((step, index) => (
              <div key={index}>
                {/* Step */}
                <div
                  className="flex items-center gap-[10px] px-[12px] py-[10px] rounded-[8px]"
                  style={{
                    backgroundColor: colors.bgCardHover,
                    border: `1px solid ${colors.border}`,
                  }}
                >
                  <div
                    className="size-[6px] rounded-full shrink-0"
                    style={{ backgroundColor: categoryColor }}
                  />
                  <span className="text-[11px]" style={{ color: colors.textPrimary, fontWeight: 500 }}>
                    {step}
                  </span>
                </div>

                {/* Connector */}
                {index < template.steps.length - 1 && (
                  <div className="flex justify-center py-[4px]">
                    <div
                      className="w-[2px] h-[12px]"
                      style={{ backgroundColor: colors.border }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* AI Customization Hint */}
        <div
          className="rounded-[8px] p-[12px]"
          style={{
            backgroundColor: `${colors.accent}08`,
            border: `1px solid ${colors.accent}`,
          }}
        >
          <div className="flex items-start gap-[8px]">
            <Sparkles size={14} color={colors.accent} strokeWidth={2} className="mt-[1px] shrink-0" />
            <div>
              <p className="text-[11px] mb-[6px]" style={{ color: colors.textPrimary, fontWeight: 600 }}>
                Customize with AI
              </p>
              <p className="text-[10px]" style={{ color: colors.textSecondary, lineHeight: 1.5 }}>
                You can modify this template by telling the AI what changes you'd like. Try:
              </p>
              <ul className="text-[10px] mt-[6px] space-y-[2px]" style={{ color: colors.textMuted }}>
                <li>• "Also assign the case to SOC Tier 1"</li>
                <li>• "Add email notification"</li>
                <li>• "Skip the enrichment step"</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div
        className="px-[20px] py-[16px] shrink-0 flex items-center gap-[8px]"
        style={{ borderTop: `1px solid ${colors.border}` }}
      >
        <button
          onClick={onCreateWorkflow}
          className="flex-1 flex items-center justify-center gap-[8px] py-[10px] rounded-[8px] text-[12px] transition-colors"
          style={{
            backgroundColor: colors.buttonPrimary,
            color: "#fff",
            fontWeight: 600,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = colors.buttonPrimaryHover;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = colors.buttonPrimary;
          }}
        >
          <Sparkles size={14} strokeWidth={2} />
          Create Workflow
        </button>
      </div>
    </div>
  );
}

/* ================================================================
   MAIN COMPONENT
   ================================================================ */

export function PlaybookTemplates({ onCreateWorkflow, onCancel }: PlaybookTemplatesProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<PlaybookTemplate | null>(null);
  const [showCustomization, setShowCustomization] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { openWithContext } = useAiBox();

  const filteredTemplates = TEMPLATES.filter((template) =>
    template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    template.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateWorkflow = () => {
    if (selectedTemplate) {
      onCreateWorkflow(selectedTemplate);
    }
  };

  const handleCustomize = (customization: string) => {
    if (selectedTemplate) {
      onCreateWorkflow(selectedTemplate, customization);
    }
  };

  const handleOpenCustomizeAI = () => {
    if (!selectedTemplate) return;
    openWithContext(buildWorkflowAiContext({
      state: "library",
      workflowId: `template:${selectedTemplate.id}`,
      workflowName: selectedTemplate.name,
    }));
    setShowCustomization(false);
  };

  return (
    <div className="flex h-full gap-[16px]">
      {/* Left: Template Library */}
      <div
        className="w-[400px] shrink-0 rounded-[10px] flex flex-col"
        style={{
          backgroundColor: colors.bgCard,
          border: `1px solid ${colors.border}`,
        }}
      >
        {/* Header */}
        <div
          className="px-[16px] py-[12px] shrink-0 flex items-center justify-between"
          style={{ borderBottom: `1px solid ${colors.border}` }}
        >
          <div>
            <h3 className="text-[13px] mb-[2px]" style={{ color: colors.textPrimary, fontWeight: 600 }}>
              Automation Templates
            </h3>
            <p className="text-[10px]" style={{ color: colors.textMuted }}>
              Deploy common SOC automations in seconds
            </p>
          </div>
          <button
            onClick={onCancel}
            className="rounded-[6px] p-[6px] transition-colors"
            style={{ color: colors.textMuted }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = colors.bgCardHover;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
            }}
          >
            <X size={16} strokeWidth={2} />
          </button>
        </div>

        {/* Search */}
        <div className="px-[16px] pt-[12px] pb-[8px] shrink-0">
          <input
            type="text"
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-[12px] py-[8px] rounded-[8px] text-[11px]"
            style={{
              backgroundColor: colors.bgCardHover,
              border: `1px solid ${colors.border}`,
              color: colors.textPrimary,
            }}
          />
        </div>

        {/* Template Cards */}
        <div className="flex-1 overflow-y-auto px-[16px] pb-[16px] space-y-[8px]">
          {filteredTemplates.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              onClick={() => setSelectedTemplate(template)}
              isSelected={selectedTemplate?.id === template.id}
            />
          ))}

          {filteredTemplates.length === 0 && (
            <div className="flex flex-col items-center justify-center py-[40px]">
              <FileText size={32} color={colors.textDim} strokeWidth={2} className="mb-[12px]" />
              <p className="text-[11px]" style={{ color: colors.textMuted }}>
                No templates found
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Right: Preview or AI Customization */}
      {selectedTemplate && (
        <div
          className="flex-1 min-w-0 rounded-[10px] flex flex-col"
          style={{
            backgroundColor: colors.bgCard,
            border: `1px solid ${colors.border}`,
          }}
        >
          {showCustomization ? (
            <div className="h-full flex flex-col items-center justify-center px-[32px]">
              <Sparkles size={48} color={colors.accent} strokeWidth={2} className="mb-[16px]" />
              <h3 className="text-[14px] mb-[6px]" style={{ color: colors.textPrimary, fontWeight: 600 }}>
                Customize with AI
              </h3>
              <p className="text-[11px] text-center mb-[16px]" style={{ color: colors.textMuted, lineHeight: 1.5 }}>
                The AI assistant is open in the right panel. Describe how you'd like to customize <strong style={{ color: colors.textSecondary }}>{selectedTemplate.name}</strong>.
              </p>
              <button
                onClick={() => setShowCustomization(false)}
                className="text-[11px] px-[14px] py-[7px] rounded-[6px] transition-colors cursor-pointer"
                style={{
                  color: colors.textSecondary,
                  backgroundColor: "transparent",
                  border: `1px solid ${colors.border}`,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = colors.bgCardHover;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                }}
              >
                Back to Preview
              </button>
            </div>
          ) : (
            <TemplatePreview
              template={selectedTemplate}
              onCreateWorkflow={handleCreateWorkflow}
              onCustomize={handleCustomize}
            />
          )}
        </div>
      )}

      {/* Empty state when no template selected */}
      {!selectedTemplate && (
        <div
          className="flex-1 min-w-0 rounded-[10px] flex items-center justify-center"
          style={{
            backgroundColor: colors.bgCard,
            border: `1px solid ${colors.border}`,
          }}
        >
          <div className="text-center max-w-[300px]">
            <Sparkles size={48} color={colors.textDim} strokeWidth={2} className="mx-auto mb-[16px]" />
            <h4 className="text-[13px] mb-[8px]" style={{ color: colors.textPrimary, fontWeight: 600 }}>
              Select a Template
            </h4>
            <p className="text-[11px]" style={{ color: colors.textMuted, lineHeight: 1.5 }}>
              Choose an automation template from the library to see a preview and customize it with AI.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}