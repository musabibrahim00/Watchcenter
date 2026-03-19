import { useParams, useNavigate } from "react-router";
import { ArrowLeft, Shield, Activity, Bug, Settings2, Briefcase, FolderOpen, ClipboardCheck, ShieldCheck, ChevronLeft, ChevronRight, MessageCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { Check, ChevronDown } from "lucide-react";
import type { AgentId } from "../shared/types/agent-types";
import { colors } from "../shared/design-system/tokens";
import { AGENT_TASKS } from "../../imports/agent-tasks-data";
import {
  MODULE_DATA,
  HIDDEN_MODULES_BY_AGENT,
  MODULE_KEYS,
  type InterventionData,
  type CompletedAction,
  type ModuleConfig,
} from "../../imports/intervention-data-types";

import svgPaths from "../../imports/svg-a1mpxm4s4x";
import watchBgPaths from "../../imports/svg-kxe7qom7bz";
import { useAiBox } from "../features/ai-box";
import { getPersonaDefaultSkills, getPersonaAiBoxSuggestions, renderSkillSuggestion } from "../shared/skills";
import { usePersona } from "../features/persona";
import { TaskInvestigationBridgeProvider, useTaskInvestigation, buildTaskRequest, TASK_ANALYST_MAP } from "../features/investigation";

/* ================================================================
   INSIGHT ACTIVITY DATA — analyst discoveries and detections
   ================================================================ */

interface InsightItem {
  id: string;
  title: string;
  description: string;
  status: "active" | "confirmed" | "resolved" | "monitoring";
  statusColor?: string;
}

function getInsightStatusColor(status: InsightItem["status"]): string {
  switch (status) {
    case "active":     return colors.accent;
    case "confirmed":  return colors.warning;
    case "monitoring": return colors.accent;
    case "resolved":   return colors.success;
    default:           return colors.textDim;
  }
}

const AGENT_INSIGHTS: Record<AgentId, InsightItem[]> = {
  alpha: [
    { id: "ins-a1", title: "Unclassified crown jewel database detected", description: "Discovered untagged finance-db-01 instance exposed to public subnet during asset surface scan", status: "active", statusColor: "#3b82f6" },
    { id: "ins-a2", title: "Shadow IT S3 bucket with PII exposure", description: "Identified unmanaged S3 bucket containing PII dataset via cloud asset enumeration", status: "confirmed", statusColor: "#d97506" },
    { id: "ins-a3", title: "VLAN segmentation gap on engineering subnet", description: "Mapped WKS-0447 to engineering VLAN — flagged blast radius reaching source code repos", status: "monitoring", statusColor: "#1eb2c2" },
    { id: "ins-a4", title: "Orphaned EC2 instances in staging", description: "Detected 3 untagged EC2 instances running outdated AMIs with no owner assignment", status: "active", statusColor: "#3b82f6" },
  ],
  hotel: [
    { id: "ins-h1", title: "Active exploitation of CVE-2024-5821", description: "Validated CVE-2024-5821 exposure on finance-db-01 — confirmed active exploitation in the wild", status: "confirmed", statusColor: "#d97506" },
    { id: "ins-h2", title: "Unauthenticated RCE on CI/CD build server", description: "Detected CVE-2025-1103 unauthenticated RCE vector on internal Jenkins instance", status: "active", statusColor: "#3b82f6" },
    { id: "ins-h3", title: "TLS certificate expiry approaching", description: "Flagged TLS certificate expiry < 72h across 4 production load balancers", status: "confirmed", statusColor: "#d97506" },
    { id: "ins-h4", title: "Log4j variant in legacy service", description: "Detected Log4Shell variant in legacy payment processing microservice dependency", status: "active", statusColor: "#3b82f6" },
  ],
  foxtrot: [
    { id: "ins-f1", title: "3-hop lateral movement to domain admin", description: "Identified lateral movement path — domain admin reachable in 3 hops via misconfigured jump server", status: "confirmed", statusColor: "#d97506" },
    { id: "ins-f2", title: "Blast radius to source code repositories", description: "Simulated blast radius from compromised workstation reaching 12 source code repos", status: "monitoring", statusColor: "#1eb2c2" },
    { id: "ins-f3", title: "Internet-to-database exposure path", description: "Mapped exposure path from internet to finance-db-01 through misconfigured API gateway", status: "active", statusColor: "#3b82f6" },
  ],
  echo: [
    { id: "ins-e1", title: "Credential stuffing correlated with lateral movement", description: "Correlated credential stuffing signals with lateral movement indicators across 3 subnets", status: "confirmed", statusColor: "#d97506" },
    { id: "ins-e2", title: "Composite risk score spike on finance-db-01", description: "Aggregated vulnerability, exposure, and asset signals into elevated composite risk score", status: "active", statusColor: "#3b82f6" },
    { id: "ins-e3", title: "Unprotected admin account risk elevation", description: "Elevated risk score after correlating credential campaign with 12 unprotected admin accounts", status: "active", statusColor: "#3b82f6" },
  ],
  delta: [
    { id: "ins-d1", title: "SLA compliance gap on TLS rotation", description: "Detected remediation SLA approaching breach threshold for production TLS certificate rotation", status: "confirmed", statusColor: "#d97506" },
    { id: "ins-d2", title: "Governance approval backlog detected", description: "Identified 6 pending governance approvals exceeding 48h response window", status: "confirmed", statusColor: "#d97506" },
    { id: "ins-d3", title: "Regulatory breach notification risk", description: "Flagged potential regulatory breach notification requirement from S3 PII exposure", status: "active", statusColor: "#3b82f6" },
  ],
  bravo: [
    { id: "ins-b1", title: "Misconfigured S3 bucket policy", description: "Detected misconfigured S3 bucket policy allowing public read access during CSPM posture scan", status: "active", statusColor: "#3b82f6" },
    { id: "ins-b2", title: "Terraform drift exposing Jenkins", description: "Identified Terraform drift exposing Jenkins instance to unauthenticated access", status: "confirmed", statusColor: "#d97506" },
    { id: "ins-b3", title: "TLS baseline deviation on load balancers", description: "Verified TLS configuration baseline deviation across production load balancer fleet", status: "resolved", statusColor: "#2fd897" },
  ],
  charlie: [
    { id: "ins-c1", title: "RCE vector in CI/CD pipeline", description: "SAST/DAST scan confirmed unauthenticated RCE vector on CI/CD pipeline endpoint", status: "active", statusColor: "#3b82f6" },
    { id: "ins-c2", title: "Over-privileged billing API tokens", description: "SCA audit flagged over-privileged billing API tokens with no rotation policy enforced", status: "confirmed", statusColor: "#d97506" },
    { id: "ins-c3", title: "Supply chain C2 indicators in container image", description: "Container image scan detected supply chain indicators linked to known C2 payload", status: "monitoring", statusColor: "#1eb2c2" },
  ],
  golf: [
    { id: "ins-g1", title: "12 domain admin accounts without MFA", description: "Identified 12 domain admin service accounts lacking MFA enforcement policy", status: "active", statusColor: "#3b82f6" },
    { id: "ins-g2", title: "Stale API tokens with admin scope", description: "Detected 23 stale API tokens with admin scope — 180+ days without rotation", status: "confirmed", statusColor: "#d97506" },
    { id: "ins-g3", title: "Compromised credentials in lateral movement chain", description: "Flagged compromised service account credentials used in observed lateral movement chain", status: "monitoring", statusColor: "#1eb2c2" },
  ],
};

/* ================================================================
   AGENT IMPACT METRICS — per-analyst domain KPIs
   ================================================================ */

interface ImpactMetric {
  label: string;
  value: string;
  delta?: string;
  deltaUp?: boolean;
}

const AGENT_IMPACT: Record<AgentId, ImpactMetric[]> = {
  alpha: [
    { label: "Assets discovered", value: "3,842", delta: "+146 this week", deltaUp: true },
    { label: "Exposed assets detected", value: "89", delta: "+7", deltaUp: false },
    { label: "Shadow IT flagged", value: "23" },
    { label: "CMDB gaps resolved", value: "214", delta: "+31", deltaUp: true },
    { label: "Analyst hours saved", value: "312h" },
  ],
  hotel: [
    { label: "Vulnerabilities analyzed", value: "1,259", delta: "+83 this week", deltaUp: true },
    { label: "CVEs validated", value: "347", delta: "+19", deltaUp: true },
    { label: "Critical patches flagged", value: "42", delta: "+6", deltaUp: false },
    { label: "False positives eliminated", value: "891", delta: "71% reduction", deltaUp: true },
    { label: "Analyst hours saved", value: "287h" },
  ],
  foxtrot: [
    { label: "Attack paths identified", value: "47", delta: "+5 this week", deltaUp: false },
    { label: "Lateral movement risks", value: "18", delta: "+3", deltaUp: false },
    { label: "Blast radius models", value: "132", delta: "+12", deltaUp: true },
    { label: "Exposure score reductions", value: "29" },
    { label: "Analyst hours saved", value: "198h" },
  ],
  echo: [
    { label: "Risk signals processed", value: "12,847", delta: "+1.2k this week", deltaUp: true },
    { label: "Correlated alerts", value: "2,341", delta: "+187", deltaUp: true },
    { label: "Risk score adjustments", value: "156" },
    { label: "Business impact scores", value: "89", delta: "+11", deltaUp: true },
    { label: "Analyst hours saved", value: "274h" },
  ],
  delta: [
    { label: "Approvals triggered", value: "186", delta: "+14 this week", deltaUp: true },
    { label: "Compliance remediations", value: "93", delta: "+8", deltaUp: true },
    { label: "Policy violations flagged", value: "67" },
    { label: "SLA breaches prevented", value: "31", delta: "+4", deltaUp: true },
    { label: "Analyst hours saved", value: "341h" },
  ],
  bravo: [
    { label: "Configs assessed", value: "4,217", delta: "+289 this week", deltaUp: true },
    { label: "Drift detections", value: "312", delta: "+27", deltaUp: false },
    { label: "Baselines enforced", value: "1,893" },
    { label: "Misconfigs auto-resolved", value: "748", delta: "64% auto-rate", deltaUp: true },
    { label: "Analyst hours saved", value: "256h" },
  ],
  charlie: [
    { label: "Apps scanned", value: "891", delta: "+52 this week", deltaUp: true },
    { label: "Code vulns detected", value: "234", delta: "+18", deltaUp: false },
    { label: "Dependencies audited", value: "3,412" },
    { label: "Supply chain risks", value: "14", delta: "+2", deltaUp: false },
    { label: "Analyst hours saved", value: "223h" },
  ],
  golf: [
    { label: "Identities audited", value: "2,156", delta: "+134 this week", deltaUp: true },
    { label: "Privilege escalations blocked", value: "67", delta: "+9", deltaUp: true },
    { label: "Dormant accounts flagged", value: "189" },
    { label: "MFA gaps detected", value: "43", delta: "-12", deltaUp: true },
    { label: "Analyst hours saved", value: "247h" },
  ],
};

/* ================================================================
   AGENT METADATA
   ================================================================ */

const AGENT_META: Record<
  AgentId,
  { label: string; status: "Active" | "Idle"; color: string }
> = {
  alpha: { label: "Alpha", status: "Active", color: "#00A46E" },
  bravo: { label: "Bravo", status: "Idle", color: "#62707D" },
  charlie: { label: "Charlie", status: "Active", color: "#00A46E" },
  delta: { label: "Delta", status: "Active", color: "#F05B06" },
  echo: { label: "Echo", status: "Idle", color: "#62707D" },
  foxtrot: { label: "Foxtrot", status: "Idle", color: "#62707D" },
  golf: { label: "Golf", status: "Idle", color: "#62707D" },
  hotel: { label: "Hotel", status: "Idle", color: "#62707D" },
};

const AGENT_ROLE: Record<AgentId, string> = {
  alpha: "Asset Intelligence Analyst",
  bravo: "Configuration Security Analyst",
  charlie: "Application Security Analyst",
  delta: "Governance & Compliance Analyst",
  echo: "Risk Intelligence Analyst",
  foxtrot: "Exposure Analyst",
  golf: "Identity Security Analyst",
  hotel: "Vulnerability Analyst",
};

const MODULE_ICONS: Record<string, typeof Shield> = {
  "Risk Register": Shield,
  "Attack Paths": Activity,
  Vulnerabilities: Bug,
  Misconfiguration: Settings2,
  "Case Management": Briefcase,
  "Cases": FolderOpen,
  "Compliance": ClipboardCheck,
  "Application Security Management": ShieldCheck,
};

const MODULE_VIEW_ALL_LABELS: Record<string, string> = {
  "Risk Register": "View all risks",
  "Attack Paths": "View all attack paths",
  Vulnerabilities: "View all vulnerabilities",
  Misconfiguration: "View all misconfigurations",
  "Case Management": "View all cases",
  "Cases": "View all cases",
  "Compliance": "View all compliance",
  "Application Security Management": "View all app security",
};
/* ================================================================
   SHARED SUB-COMPONENTS (matching dashboard style)
   ================================================================ */

function PulsingDot({ color = "#1eb2c2" }: { color?: string }) {
  return (
    <motion.div
      className="size-[6px] rounded-full shrink-0"
      style={{ backgroundColor: color }}
      animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
    />
  );
}

function SeverityBadge({ severity }: { severity: string }) {
  const c =
    severity === "Critical"
      ? { bg: `${colors.critical}14`, text: colors.critical, border: `${colors.critical}1f` }
      : severity === "Warning"
        ? { bg: `${colors.warning}14`, text: colors.warning, border: `${colors.warning}1f` }
        : severity === "In Progress"
          ? { bg: `${colors.accent}14`, text: colors.accent, border: `${colors.accent}1f` }
          : severity === "Completed"
            ? { bg: `${colors.success}14`, text: colors.success, border: `${colors.success}1f` }
            : { bg: "rgba(128,128,128,0.08)", text: colors.textDim, border: "rgba(128,128,128,0.12)" };

  return (
    <div
      className="relative content-stretch flex items-center justify-center px-[12px] py-[4px] rounded-[24px] shrink-0"
      style={{ backgroundColor: c.bg }}
    >
      <div aria-hidden="true" className="absolute border border-solid inset-0 pointer-events-none rounded-[24px]" style={{ borderColor: c.border }} />
      <span className="font-['Inter',sans-serif] text-[10px] leading-[12px] whitespace-nowrap" style={{ color: c.text }}>
        {severity}
      </span>
    </div>
  );
}

function VerticalPipelineStatus({
  steps,
  activeStep,
  animating,
}: {
  steps: string[];
  activeStep: number;
  animating?: boolean;
}) {
  return (
    <div className="flex flex-col gap-[4px] ml-[2px]">
      {steps.map((label, i) => {
        const isComplete = i < activeStep;
        const isActive = i === activeStep;
        return (
          <div key={`${label}-${i}`} className="flex items-center gap-[8px]">
            {isComplete ? (
              <div className="size-[14px] rounded-full bg-[rgba(47,216,151,0.10)] flex items-center justify-center shrink-0">
                <Check size={8} className="text-[#2fd897]" />
              </div>
            ) : isActive ? (
              <div className="size-[14px] flex items-center justify-center shrink-0">
                <div
                  className="size-[7px] rounded-full"
                  style={{
                    backgroundColor: animating ? "#3b82f6" : "#1eb2c2",
                    transition: "background-color 0.3s ease",
                  }}
                />
              </div>
            ) : (
              <div className="size-[14px] flex items-center justify-center shrink-0">
                <div className="size-[5px] rounded-full bg-[#1e2a34]" />
              </div>
            )}
            <span
              className="font-['Inter',sans-serif] text-[11px] leading-[14px] transition-colors duration-200"
              style={{
                color: isComplete ? "#89949E" : isActive ? (animating ? "#3b82f6" : "#89949e") : "#89949E",
              }}
            >
              {label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function AgentPipelineLive({ agents, activeStage, layoutPrefix }: { agents: string[]; activeStage: number; layoutPrefix: string }) {
  return (
    <div className="flex items-start gap-[6px] flex-wrap relative">
      {agents.map((agent, i) => {
        const isComplete = i < activeStage;
        const isActive = i === activeStage;
        const dotColor = isComplete ? "#2fd897" : isActive ? "#1eb2c2" : "#1e2a34";
        const textColor = isActive ? "#dadfe3" : isComplete ? "#89949E" : "#89949E";
        return (
          <div key={agent} className="flex flex-col items-center flex-1 min-w-[80px]">
            <div className="flex items-center gap-[5px]">
              <div className="relative size-[6px] shrink-0">
                {isActive && activeStage < agents.length && (
                  <motion.div
                    layoutId={`${layoutPrefix}-token`}
                    className="absolute inset-[-3px] rounded-full"
                    style={{ border: "1px solid rgba(30,178,194,0.3)", backgroundColor: "rgba(30,178,194,0.06)" }}
                    transition={{ duration: 1.2, ease: [0.25, 0.1, 0.25, 1] }}
                  />
                )}
                <div
                  className="size-[6px] rounded-full shrink-0 transition-colors duration-300"
                  style={{ backgroundColor: dotColor }}
                />
              </div>
              <span
                className="font-['Inter',sans-serif] text-[11px] leading-[14px] transition-all duration-500"
                style={{ color: textColor, opacity: isActive ? 1 : isComplete ? 0.7 : 0.4 }}
              >
                {agent}
              </span>
            </div>
            <div
              className="h-[1px] rounded-full mt-[5px] w-full transition-all duration-300"
              style={{
                backgroundColor: isActive ? "rgba(30,178,194,0.4)" : isComplete ? "#141f2a" : "transparent",
              }}
            />
          </div>
        );
      })}
    </div>
  );
}

/* ================================================================
   INTERVENTION CARD
   ================================================================ */

function InterventionCard({
  data,
  onAuthorize,
  onDefer,
  onInvestigate,
}: {
  data: InterventionData;
  onAuthorize: (id: string) => void;
  onDefer: (id: string) => void;
  onInvestigate?: (data: InterventionData) => void;
}) {
  const displaySeverity =
    data.status === "executing" ? "In Progress" : data.status === "completed" ? "Completed" : data.severity;
  const displayStep =
    data.status === "executing" && data.executingStep !== undefined ? data.executingStep : data.activeStep;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.28, ease: [0.25, 0.1, 0.25, 1] }}
      className="relative rounded-[10px] p-[16px] flex flex-col gap-[12px]"
    >
      <div aria-hidden="true" className="absolute inset-0 mix-blend-screen pointer-events-none rounded-[10px]" style={{ backgroundImage: "linear-gradient(112.026deg, rgb(8, 3, 3) 0%, rgb(0, 0, 0) 35.132%, rgb(0, 0, 0) 65.097%, rgb(8, 3, 3) 90.93%)" }} />
      <div aria-hidden="true" className="absolute inset-0 pointer-events-none rounded-[10px] overflow-hidden" style={{ WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)", WebkitMaskComposite: "xor", maskComposite: "exclude", padding: "1px" }}>
        <div className="absolute inset-[-50%] animate-[border-spin_6s_linear_infinite]" style={{ background: "conic-gradient(from 0deg, #030609 0%, #FF575752 25%, #030609 50%, #FF575752 75%, #030609 100%)" }} />
      </div>
      <div className="flex items-start justify-between gap-[12px]">
        <div className="flex items-start gap-[10px] flex-1 min-w-0">
          <div
            className="size-[8px] rounded-full mt-[5px] shrink-0"
            style={{
              backgroundColor:
                data.status === "completed" ? "#2fd897" : data.severity === "Critical" ? "#ff5757" : "#d97506",
            }}
          />
          <div className="flex flex-col gap-[3px] min-w-0">
            <p className="font-['Inter',sans-serif] text-[13px] text-[#dadfe3] leading-[17px]">
              {data.status === "completed" ? `${data.title} — completed` : data.title}
            </p>
            <p className="font-['Inter',sans-serif] text-[11px] text-[#89949E] leading-[14px]">
              {data.status === "completed" ? "Remediation completed successfully." : data.description}
            </p>
            {data.status !== "completed" && data.businessImpact && (
              <p className="font-['Inter',sans-serif] text-[10px] text-[#89949e] leading-[13px] mt-[1px]">
                <span className="text-[#89949E]">Impact: </span>
                {data.businessImpact}
              </p>
            )}
          </div>
        </div>
        <SeverityBadge severity={displaySeverity} />
      </div>

      <div className="ml-[18px]">
        <VerticalPipelineStatus steps={data.pipelineSteps} activeStep={displayStep} animating={data.status === "executing"} />
      </div>

      <div className="flex items-center justify-between flex-wrap gap-[8px] ml-[18px]">
        <div className="flex items-center gap-[4px]">
          <span className="font-['Inter',sans-serif] text-[10px] text-[#89949E] leading-[13px]">
            Confidence:
          </span>
          <span className="font-['Inter',sans-serif] text-[10px] text-[#89949e] leading-[13px]">
            {data.confidence}%
          </span>
        </div>
        <div className="flex items-center gap-[12px]">
          {data.status === "awaiting" && (
            <>
              <button
                onClick={() => onAuthorize(data.id)}
                className="rounded-[6px] px-[12px] py-[5px] font-['Inter',sans-serif] text-[11px] text-white leading-[14px] transition-colors cursor-pointer"
                style={{ backgroundColor: colors.buttonPrimary }}
                onMouseEnter={e => { e.currentTarget.style.backgroundColor = colors.buttonPrimaryHover; }}
                onMouseLeave={e => { e.currentTarget.style.backgroundColor = colors.buttonPrimary; }}
              >
                Authorize
              </button>
              <button
                onClick={() => onDefer(data.id)}
                className="font-['Inter',sans-serif] text-[11px] text-[#62707D] leading-[14px] hover:text-[#89949e] transition-colors cursor-pointer"
              >
                Defer
              </button>
              {onInvestigate && (
                <button
                  onClick={() => onInvestigate(data)}
                  className="font-['Inter',sans-serif] text-[11px] text-[#1eb2c2] leading-[14px] hover:text-[#3dd4e4] transition-colors cursor-pointer"
                >
                  Investigate
                </button>
              )}
            </>
          )}
          {data.status === "executing" && (
            <div className="flex items-center gap-[6px]">
              <motion.div
                className="size-[12px] rounded-full border-2 border-[#3b82f6] border-t-transparent"
                animate={{ rotate: 360 }}
                transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
              />
              <span className="font-['Inter',sans-serif] text-[11px] text-[#3b82f6] leading-[14px]">
                Executing…
              </span>
            </div>
          )}
          {data.status === "completed" && (
            <span className="font-['Inter',sans-serif] text-[10px] text-[#2fd897] leading-[13px]">
              Completed just now
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

/* ================================================================
   PAGINATED INTERVENTIONS — max 5 items per page
   ================================================================ */

const ITEMS_PER_PAGE = 5;

function PaginatedInterventions({
  interventions,
  onAuthorize,
  onDefer,
  onInvestigate,
}: {
  interventions: InterventionData[];
  onAuthorize: (id: string) => void;
  onDefer: (id: string) => void;
  onInvestigate?: (data: InterventionData) => void;
}) {
  const [page, setPage] = useState(0);
  const totalPages = Math.ceil(interventions.length / ITEMS_PER_PAGE);
  const start = page * ITEMS_PER_PAGE;
  const visibleItems = interventions.slice(start, start + ITEMS_PER_PAGE);

  // Reset page if interventions shrink
  useEffect(() => {
    if (page >= totalPages && totalPages > 0) setPage(totalPages - 1);
  }, [totalPages, page]);

  return (
    <div className="flex flex-col gap-[8px] mt-[4px]">
      {/* Section label */}
      <div className="flex items-center gap-[8px]">
        <span className="font-['Inter',sans-serif] text-[12px] text-[#dadfe3] leading-[16px]">
          Required Interventions
        </span>
        <span className="font-['Inter',sans-serif] text-[12px] text-[#4a5568] leading-[12px]">
          ({interventions.length})
        </span>
      </div>

      {/* Intervention items */}
      <AnimatePresence mode="wait">
        <motion.div
          key={page}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="flex flex-col gap-[10px]"
        >
          {visibleItems.map((item) => (
            <InterventionCard key={item.id} data={item} onAuthorize={onAuthorize} onDefer={onDefer} onInvestigate={onInvestigate} />
          ))}
        </motion.div>
      </AnimatePresence>

      {/* Pagination controls — below items */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-[8px] pt-[4px]">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="size-[20px] rounded-[4px] flex items-center justify-center hover:bg-[#1e2a34] transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-default"
          >
            <ChevronLeft size={12} className="text-[#89949e]" />
          </button>
          <span className="font-['Inter',sans-serif] text-[10px] text-[#4a5568] leading-[12px] tabular-nums">
            {page + 1} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
            className="size-[20px] rounded-[4px] flex items-center justify-center hover:bg-[#1e2a34] transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-default"
          >
            <ChevronRight size={12} className="text-[#89949e]" />
          </button>
        </div>
      )}
    </div>
  );
}

/* ================================================================
   MODULE SECTION — one per module, self-contained state
   ================================================================ */

function ModuleSection({ moduleKey, config, onComplete, defaultExpanded = false, onInvestigate }: { moduleKey: string; config: ModuleConfig; onComplete?: (action: CompletedAction) => void; defaultExpanded?: boolean; onInvestigate?: (data: InterventionData) => void }) {
  const IconComp = MODULE_ICONS[moduleKey] || Shield;
  const [expanded, setExpanded] = useState(defaultExpanded);

  /* evaluating rotation */
  const [evalIndex, setEvalIndex] = useState(0);
  useEffect(() => {
    const iv = setInterval(() => setEvalIndex((p) => (p + 1) % config.evaluatingItems.length), 5000);
    return () => clearInterval(iv);
  }, [config]);

  /* processing pipeline */
  const [pipelineStage, setPipelineStage] = useState(0);
  const [taskIndex, setTaskIndex] = useState(0);
  const [procState, setProcState] = useState<"running" | "deciding" | "resolvedMsg" | "idle">("running");
  const [resolvedMsg, setResolvedMsg] = useState("");
  const taskIndexRef = useRef(taskIndex);
  taskIndexRef.current = taskIndex;
  const escCounter = useRef(0);
  const currentTask = config.processingTasks[taskIndex % config.processingTasks.length];

  /* interventions */
  const [interventions, setInterventions] = useState<InterventionData[]>(
    () => config.initialInterventions.map((i) => ({ ...i }))
  );
  const [completed, setCompleted] = useState<CompletedAction[]>([]);

  /* pipeline progression */
  useEffect(() => {
    if (procState !== "running") return;
    const t = setTimeout(() => {
      setPipelineStage((p) => {
        if (p < 3) return p + 1;
        setProcState("deciding");
        return p;
      });
    }, 3500 + Math.random() * 1500);
    return () => clearTimeout(t);
  }, [pipelineStage, procState]);

  useEffect(() => {
    if (procState !== "deciding") return;
    const t = setTimeout(() => {
      const task = config.processingTasks[taskIndexRef.current % config.processingTasks.length];
      if (task.outcome === "resolve") {
        setResolvedMsg(task.task);
        setProcState("resolvedMsg");
      } else if (task.outcome === "escalate" && task.escalation) {
        escCounter.current += 1;
        const uid = `${task.escalation.id}-${escCounter.current}`;
        setInterventions((prev) => {
          if (prev.some((x) => x.id === uid)) return prev;
          return [{ ...task.escalation!, id: uid, status: "awaiting" }, ...prev];
        });
        setProcState("idle");
      }
    }, 2000);
    return () => clearTimeout(t);
  }, [procState, config]);

  useEffect(() => {
    if (procState !== "resolvedMsg") return;
    const t = setTimeout(() => setProcState("idle"), 3000);
    return () => clearTimeout(t);
  }, [procState]);

  useEffect(() => {
    if (procState !== "idle") return;
    const t = setTimeout(() => {
      setTaskIndex((p) => p + 1);
      setPipelineStage(0);
      setProcState("running");
    }, 1500);
    return () => clearTimeout(t);
  }, [procState]);

  /* authorize/defer */
  const timersRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  const handleAuthorize = useCallback(
    (id: string) => {
      setInterventions((prev) =>
        prev.map((it) => (it.id === id ? { ...it, status: "executing" as const, executingStep: it.activeStep } : it))
      );
      const item = interventions.find((i) => i.id === id);
      if (!item) return;
      const remaining = item.pipelineSteps.length - 1 - item.activeStep;
      const stepDur = Math.max(800, 5000 / Math.max(remaining, 1));
      let cur = item.activeStep;
      const advance = () => {
        cur++;
        if (cur < item.pipelineSteps.length) {
          setInterventions((prev) => prev.map((it) => (it.id === id ? { ...it, executingStep: cur } : it)));
          timersRef.current.set(id, setTimeout(advance, stepDur));
        } else {
          setInterventions((prev) =>
            prev.map((it) =>
              it.id === id ? { ...it, status: "completed" as const, executingStep: item.pipelineSteps.length - 1 } : it
            )
          );
          timersRef.current.set(
            id,
            setTimeout(() => {
              setInterventions((prev) => prev.filter((it) => it.id !== id));
              setCompleted((prev) => [
                { id, title: item.title, description: item.description, completedAt: "Completed just now", pipelineSteps: item.pipelineSteps },
                ...prev,
              ]);
              if (onComplete) onComplete({ id, title: item.title, description: item.description, completedAt: "Completed just now", pipelineSteps: item.pipelineSteps });
            }, 2000)
          );
        }
      };
      timersRef.current.set(id, setTimeout(advance, stepDur));
    },
    [interventions, onComplete]
  );

  const handleDefer = useCallback((id: string) => {
    setInterventions((prev) => prev.filter((it) => it.id !== id));
  }, []);

  useEffect(() => {
    return () => {
      timersRef.current.forEach((t) => clearTimeout(t));
    };
  }, []);

  return (
    <div className="relative bg-[rgba(3,6,9,0.85)] rounded-[12px] overflow-hidden">
      <div aria-hidden="true" className="absolute inset-0 pointer-events-none rounded-[12px] p-px" style={{ background: "linear-gradient(135deg, rgba(87,177,255,0.06) 0%, rgba(87,177,255,0.24) 100%)", WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)", WebkitMaskComposite: "xor", maskComposite: "exclude" }} />
      {/* Module header (clickable) */}
      <button
        onClick={() => setExpanded((p) => !p)}
        className="w-full px-[20px] py-[14px] flex items-center justify-between gap-[8px] cursor-pointer hover:bg-[#0a1520]/40 transition-colors"
      >
        <div className="flex items-center gap-[10px] min-w-0 flex-wrap">
          <IconComp size={16} className="text-[#4a5568] shrink-0" />
          <span className="font-['Inter',sans-serif] text-[14px] text-[#dadfe3] leading-[18px]">
            {moduleKey}
          </span>
          {interventions.length > 0 && (
            <span className="font-['Inter',sans-serif] text-[10px] text-[#ff6060] leading-[12px] bg-[rgba(255,70,70,0.08)] border border-[rgba(255,80,80,0.15)] rounded-[4px] px-[5px] py-[1px]">
              {interventions.length} intervention{interventions.length !== 1 ? "s" : ""}
            </span>
          )}
          <div className="flex items-center gap-[5px]">
            <PulsingDot />
            <span className="font-['Inter',sans-serif] text-[10px] text-[#1eb2c2] leading-[12px]">
              {procState === "running" ? "Processing" : procState === "deciding" ? "Deciding" : procState === "resolvedMsg" ? "Resolved" : "Idle"}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-[10px] shrink-0">
          <span
            role="button"
            tabIndex={0}
            onClick={(e) => { e.stopPropagation(); }}
            onKeyDown={(e) => { if (e.key === "Enter") { e.stopPropagation(); } }}
            className="font-['Inter',sans-serif] text-[11px] text-[#076498] leading-[14px] hover:text-[#0992d0] transition-colors cursor-pointer whitespace-nowrap"
          >
            {MODULE_VIEW_ALL_LABELS[moduleKey]}
          </span>
          <motion.div animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronDown size={14} className="text-[#4a5568]" />
          </motion.div>
        </div>
      </button>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <div className="px-[20px] pb-[18px] flex flex-col gap-[14px]">
              {/* Separator */}
              <div className="h-px" style={{ backgroundColor: colors.divider }} />

              {/* Currently evaluating */}
              <div className="flex items-center gap-[8px]">
                <span className="font-['Inter',sans-serif] text-[10px] text-[#4a5568] leading-[12px] uppercase tracking-[0.3px] shrink-0">
                  Evaluating:
                </span>
                <div className="relative h-[14px] overflow-hidden flex-1 min-w-[140px]">
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={evalIndex}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="font-['Inter',sans-serif] text-[11px] text-[#89949e] leading-[14px] absolute left-0 top-0 whitespace-nowrap"
                    >
                      {config.evaluatingItems[evalIndex]}
                    </motion.span>
                  </AnimatePresence>
                </div>
              </div>

              {/* Agent pipeline */}
              <motion.div animate={{ opacity: procState === "idle" ? 0.35 : 1 }} transition={{ duration: 0.3 }}>
                <AgentPipelineLive
                  agents={config.agents}
                  activeStage={
                    procState === "deciding" || procState === "idle" ? config.agents.length : pipelineStage
                  }
                  layoutPrefix={moduleKey}
                />
              </motion.div>

              {/* Processing status */}
              <AnimatePresence mode="wait">
                {procState === "resolvedMsg" ? (
                  <motion.div
                    key="resolved"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-[8px]"
                  >
                    <div className="size-[18px] rounded-full bg-[rgba(47,216,151,0.08)] flex items-center justify-center shrink-0">
                      <Check size={10} className="text-[#2fd897]" />
                    </div>
                    <div className="flex flex-col gap-[1px]">
                      <span className="font-['Inter',sans-serif] text-[11px] text-[#2fd897] leading-[14px]">
                        Resolved automatically
                      </span>
                      <span className="font-['Inter',sans-serif] text-[10px] text-[#4a5568] leading-[13px]">
                        {resolvedMsg}
                      </span>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key={`proc-${taskIndex}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-[8px]"
                  >
                    {procState === "running" && (
                      <motion.div
                        className="size-[6px] rounded-sm bg-[#1eb2c2]"
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                      />
                    )}
                    <span className="font-['Inter',sans-serif] text-[11px] text-[#89949e] leading-[14px]">
                      {currentTask.task}
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Intervention cards — paginated, max 5 visible */}
              {interventions.length > 0 && (
                <PaginatedInterventions
                  interventions={interventions}
                  onAuthorize={handleAuthorize}
                  onDefer={handleDefer}
                  onInvestigate={onInvestigate}
                />
              )}

              {/* Completed */}
              {completed.length > 0 && (
                <div className="flex flex-col gap-[6px]">
                  {completed.map((a) => (
                    <div key={a.id} className="flex items-center gap-[6px]">
                      <Check size={10} className="text-[#2fd897]" />
                      <span className="font-['Inter',sans-serif] text-[11px] text-[#62707D] leading-[14px]">
                        {a.title}
                      </span>
                      <span className="font-['Inter',sans-serif] text-[10px] text-[#4a5568] leading-[13px]">
                        — {a.completedAt}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ================================================================
   DONE TODAY SECTION — Figma-matched styling
   ================================================================ */

interface DoneTodayItem extends CompletedAction {
  source: "manual" | "auto";
  time: string;
}

function CheckCircleIcon({ size = 16 }: { size?: number }) {
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g clipPath="url(#clip-done-check)">
          <path d={svgPaths.p39ee6532} stroke="#00A46E" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16667" />
          <path d={svgPaths.p17134c00} stroke="#00A46E" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16667" />
        </g>
        <defs>
          <clipPath id="clip-done-check">
            <rect fill="white" height="16" width="16" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function SmallCheckCircleIcon() {
  return (
    <div className="relative shrink-0 size-[12px]">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12 12">
        <g clipPath="url(#clip-done-sm)">
          <path d={svgPaths.p3e7757b0} stroke="#00A46E" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16667" />
          <path d="M4.5 6L5.5 7L7.5 5" stroke="#00A46E" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16667" />
        </g>
        <defs>
          <clipPath id="clip-done-sm">
            <rect fill="white" height="12" width="12" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function ExpandChevronIcon({ expanded }: { expanded: boolean }) {
  const path = expanded ? svgPaths.p1fb8e3e0 : svgPaths.p21e06c0;
  return (
    <div className="relative shrink-0 size-[16px]">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <path d={path} stroke="#89949E" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

function DoneTodayItemCard({ item }: { item: DoneTodayItem }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="relative rounded-[10px] shrink-0 w-full overflow-hidden">
      {/* Header row — always visible */}
      <button
        onClick={() => setExpanded((p) => !p)}
        className="opacity-90 relative w-full cursor-pointer"
        style={{
          backgroundColor: colors.bgCardHover,
          borderRadius: expanded ? "10px 10px 0 0" : "10px",
        }}
      >
        <div aria-hidden="true" className="absolute inset-0 pointer-events-none p-px" style={{ borderRadius: expanded ? "10px 10px 0 0" : "10px", background: "linear-gradient(135deg, rgba(87,177,255,0.06) 0%, rgba(87,177,255,0.24) 100%)", WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)", WebkitMaskComposite: "xor", maskComposite: "exclude" }} />
        <div className="content-stretch flex items-start justify-between p-[16px] relative w-full">
          {/* Left: icon + text */}
          <div className="content-stretch flex flex-1 gap-[12px] items-start min-w-0">
            <CheckCircleIcon />
            <div className="content-stretch flex flex-col gap-[2px] items-start min-w-0">
              <p className="font-['Inter',sans-serif] font-medium text-[12px] text-white tracking-[-0.3px] truncate">
                {item.title}
              </p>
              <p className="font-['Inter',sans-serif] text-[#89949e] text-[10px]">
                {item.source === "manual" ? "Approved by you" : "Auto-resolved under policy"}
              </p>
            </div>
          </div>
          {/* Right: time + expand */}
          <div className="content-stretch flex gap-[8px] items-center shrink-0">
            <p className="font-['Inter',sans-serif] text-[#89949e] text-[10px] whitespace-nowrap">
              {item.time}
            </p>
            <ExpandChevronIcon expanded={expanded} />
          </div>
        </div>
      </button>

      {/* Expanded detail */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <div className="opacity-90 relative rounded-b-[10px] w-full" style={{ backgroundColor: colors.bgCardHover }}>
              <div aria-hidden="true" className="absolute inset-0 pointer-events-none rounded-b-[10px] border-t-0 p-px" style={{ background: "linear-gradient(135deg, rgba(87,177,255,0.06) 0%, rgba(87,177,255,0.24) 100%)", WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)", WebkitMaskComposite: "xor", maskComposite: "exclude" }} />
              <div className="content-stretch flex items-start justify-between p-[16px] pt-0 relative w-full">
                <div className="content-stretch flex flex-col gap-[12px] items-start flex-1 min-w-0">
                  <p className="font-['Inter',sans-serif] text-[#89949e] text-[10px]">
                    WHAT WAS DONE
                  </p>
                  {/* Pipeline steps */}
                  <div className="content-stretch flex flex-col gap-[8px] items-start w-full">
                    {item.pipelineSteps.map((step, i) => (
                      <div key={`${item.id}-step-${i}`} className="content-stretch flex gap-[12px] items-start w-full">
                        <SmallCheckCircleIcon />
                        <p className="font-['Inter',sans-serif] text-[#89949e] text-[10px]">
                          {step}
                        </p>
                      </div>
                    ))}
                  </div>
                  {/* Result */}
                  <div className="content-stretch flex gap-[8px] items-start text-[#89949e] text-[10px] w-full">
                    <p className="font-['Inter',sans-serif]">
                      {item.description}
                    </p>
                    <p className="font-['Inter',sans-serif] font-medium uppercase tracking-[0.5px]">
                      Result
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function DoneTodaySection({ items }: { items: DoneTodayItem[] }) {
  const [sectionOpen, setSectionOpen] = useState(true);

  if (items.length === 0) return null;

  const manualCount = items.filter((i) => i.source === "manual").length;
  const autoCount = items.length - manualCount;
  const subtitle = [
    manualCount > 0 ? "Manual approvals" : null,
    autoCount > 0 ? "Auto-resolved" : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="content-stretch flex flex-col items-center relative w-full">
      {/* Section header */}
      <button
        onClick={() => setSectionOpen((p) => !p)}
        className="w-full h-[39.5px] rounded-[10px] flex items-center cursor-pointer"
      >
        <div className="content-stretch flex gap-[12px] items-center w-full p-[0px]">
          <span className="font-['Inter',sans-serif] font-medium text-[13px] text-[#89949e] leading-[19.5px] whitespace-nowrap">
            Done Today ({items.length})
          </span>
          <div className="flex-1 flex items-center justify-end">
            <span className="font-['Inter',sans-serif] font-medium text-[11px] text-[#2c3c47] leading-[16.5px] whitespace-nowrap">
              {subtitle}
            </span>
          </div>
          <div className="flex items-center justify-center shrink-0 size-[14px]">
            <motion.div
              animate={{ rotate: sectionOpen ? 180 : 90 }}
              transition={{ duration: 0.2 }}
              className="flex items-center justify-center"
            >
              <svg className="block size-[14px]" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
                <path d="M17 10L12 15L7 10" stroke="#89949E" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </motion.div>
          </div>
        </div>
      </button>

      {/* Items list */}
      <AnimatePresence initial={false}>
        {sectionOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="overflow-hidden w-full"
          >
            <div className="content-stretch flex flex-col gap-[6px] items-start overflow-clip w-full">
              {items.map((item) => (
                <DoneTodayItemCard key={item.id} item={item} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ================================================================
   AGENT IMPACT PANEL — compact metric tiles
   ================================================================ */

const AgentImpactPanel = React.memo(function AgentImpactPanel({ agentId }: { agentId: AgentId }) {
  const metrics = AGENT_IMPACT[agentId];
  if (!metrics || metrics.length === 0) return null;

  return (
    <div className="relative rounded-[12px] overflow-hidden">
      {/* Background + border — matches module card style but lighter */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none rounded-[12px]"
        style={{ backgroundColor: "rgba(7,16,25,0.50)" }}
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none rounded-[12px] p-px"
        style={{
          background: "linear-gradient(135deg, rgba(87,177,255,0.04) 0%, rgba(87,177,255,0.10) 100%)",
          WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          WebkitMaskComposite: "xor",
          maskComposite: "exclude",
        }}
      />

      <div className="relative px-[20px] py-[16px] flex flex-col gap-[12px]">
        {/* Header */}
        <div className="flex items-center gap-[10px]">
          <span className="font-['Inter',sans-serif] font-medium text-[13px] text-[#89949e] leading-[19.5px]">
            Agent Impact
          </span>
          <span className="font-['Inter',sans-serif] text-[10px] text-[#4a5568] leading-[12px]">
            Last 30 days
          </span>
        </div>

        {/* Metric grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-[1px] rounded-[8px] overflow-hidden" style={{ backgroundColor: colors.divider }}>
          {metrics.map((m) => (
            <div
              key={m.label}
              className="flex flex-col gap-[4px] py-[12px] px-[14px]"
              style={{ backgroundColor: "rgba(3,6,9,0.90)" }}
            >
              <span className="font-['Inter',sans-serif] text-[10px] text-[#4a5568] leading-[13px]">
                {m.label}
              </span>
              <div className="flex items-baseline gap-[6px]">
                <span className="font-['Inter',sans-serif] font-medium text-[16px] text-[#dadfe3] leading-[20px] tracking-[-0.3px]">
                  {m.value}
                </span>
                {m.delta && (
                  <span
                    className="font-['Inter',sans-serif] text-[10px] leading-[12px] whitespace-nowrap"
                    style={{ color: m.deltaUp ? "#2fd897" : "#89949e" }}
                  >
                    {m.delta}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});

/* ================================================================
   INSIGHT ACTIVITY SECTION — analyst discoveries (read-only)
   ================================================================ */

const MAX_VISIBLE_INSIGHTS = 3;

function InsightRow({ insight, agentRole, showUpdatedTag, onAskAI }: {
  insight: InsightItem;
  agentRole: string;
  showUpdatedTag?: boolean;
  onAskAI?: (prompt: string) => void;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="flex items-center gap-[12px] py-[10px] px-[14px] relative"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Subtle bottom border */}
      <div aria-hidden="true" className="absolute bottom-0 left-[14px] right-[14px] h-px" style={{ backgroundColor: colors.divider }} />

      {/* Status dot */}
      <div
        className="size-[6px] rounded-full shrink-0"
        style={{ backgroundColor: getInsightStatusColor(insight.status) }}
      />

      {/* Content */}
      <div className="flex flex-col gap-[2px] flex-1 min-w-0">
        <div className="flex items-center gap-[6px]">
          <p className="font-['Inter',sans-serif] text-[12px] text-[#dadfe3] leading-[16px] truncate">
            {insight.title}
          </p>
          {showUpdatedTag && (
            <span className="ai-updated-tag shrink-0">Updated by AI</span>
          )}
        </div>
        <p className="font-['Inter',sans-serif] text-[10px] text-[#7e8e9e] leading-[13px] truncate">
          {agentRole} — {insight.description}
        </p>
      </div>

      {/* Right side: "Explain this" on hover, status badge at rest */}
      <div className="shrink-0 flex items-center" style={{ minWidth: "56px", justifyContent: "flex-end" }}>
        {hovered && onAskAI ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAskAI(`Explain this finding: "${insight.title}". ${insight.description}`);
            }}
            style={{
              fontSize: "10px",
              padding: "3px 8px",
              borderRadius: "99px",
              border: `1px solid ${colors.accent}33`,
              background: `${colors.accent}12`,
              color: colors.accent,
              cursor: "pointer",
              whiteSpace: "nowrap",
              lineHeight: "1.4",
            }}
          >
            Explain this
          </button>
        ) : (
          <span
            className="font-['Inter',sans-serif] text-[10px] leading-[12px] whitespace-nowrap capitalize"
            style={{ color: getInsightStatusColor(insight.status) }}
          >
            {insight.status}
          </span>
        )}
      </div>
    </div>
  );
}

function InsightActivitySection({ agentId, aiUpdated }: { agentId: AgentId; aiUpdated?: boolean }) {
  const insights = AGENT_INSIGHTS[agentId] || [];
  const [showAll, setShowAll] = useState(false);
  const { isOpen: isAiBoxOpen, open: openAiBox, setPendingEntryQuery } = useAiBox();
  const handleAskAI = useCallback((prompt: string) => {
    if (isAiBoxOpen) {
      window.dispatchEvent(new CustomEvent("globalaibox-inject-query", { detail: { query: prompt } }));
    } else {
      setPendingEntryQuery(prompt);
      openAiBox();
    }
  }, [isAiBoxOpen, openAiBox, setPendingEntryQuery]);

  if (insights.length === 0) return null;

  const visibleItems = showAll ? insights : insights.slice(0, MAX_VISIBLE_INSIGHTS);
  const hasMore = insights.length > MAX_VISIBLE_INSIGHTS;
  const role = AGENT_ROLE[agentId];

  return (
    <div className="content-stretch flex flex-col items-start relative w-full gap-[8px]">
      {/* Section heading */}
      <div className="flex items-center gap-[10px]">
        <span className="font-['Inter',sans-serif] font-medium text-[13px] text-[#dadfe3] leading-[19.5px]">
          Insight Activity
        </span>
        <span className="font-['Inter',sans-serif] text-[11px] text-[#4a5568] leading-[14px]">
          {insights.length} detection{insights.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Compact row list inside a single card — height-capped to stay in viewport */}
      <div className="relative rounded-[10px] w-full max-h-[280px] flex flex-col overflow-hidden">
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none rounded-[10px]"
          style={{ backgroundColor: "rgba(8,18,30,0.55)" }}
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none rounded-[10px] p-px"
          style={{
            background: "linear-gradient(135deg, rgba(87,177,255,0.04) 0%, rgba(87,177,255,0.12) 100%)",
            WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
            WebkitMaskComposite: "xor",
            maskComposite: "exclude",
          }}
        />

        <div className="relative flex flex-col overflow-y-auto flex-1 min-h-0" style={{ scrollbarWidth: "thin", scrollbarColor: "#1e2a34 transparent" }}>
          {visibleItems.map((insight, idx) => (
            <InsightRow
              key={insight.id}
              insight={insight}
              agentRole={role}
              showUpdatedTag={aiUpdated && idx < 2}
              onAskAI={handleAskAI}
            />
          ))}
        </div>

        {/* View all / collapse link */}
        {hasMore && (
          <div className="relative px-[14px] py-[8px] shrink-0">
            <button
              onClick={() => setShowAll((p) => !p)}
              className="font-['Inter',sans-serif] text-[11px] text-[#076498] leading-[14px] hover:text-[#0992d0] transition-colors cursor-pointer"
            >
              {showAll ? "Show fewer" : `View all insights (${insights.length})`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ================================================================
   WATCH CENTER BACKGROUND — mirrored from WatchDst
   ================================================================ */

const WatchCenterBg = React.memo(function WatchCenterBg() {
  return (
    <div className="absolute inset-0 overflow-clip pointer-events-none z-0">
      {/* Bottom (flipped) */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex h-[272px] items-center justify-center w-[1612.801px]">
        <div className="-scale-y-100 flex-none">
          <div className="h-[272px] relative w-[1612.801px]">
            <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 1612.8 371.733">
              <g>
                <g><path d={watchBgPaths.p3397d300} fill="url(#agd_paint0_bot)" style={{ mixBlendMode: "screen" }} /></g>
                <path d={watchBgPaths.p2ae43600} fill="url(#agd_paint1_bot)" />
                <path d={watchBgPaths.p2723d00} fill="url(#agd_paint2_bot)" />
              </g>
              <defs>
                <linearGradient gradientUnits="userSpaceOnUse" id="agd_paint0_bot" x1="1.49939" x2="1610.29" y1="0" y2="0">
                  <stop stopColor="#080303" /><stop offset="0.351792" /><stop offset="0.651569" /><stop offset="0.91" stopColor="#080303" />
                </linearGradient>
                <linearGradient gradientUnits="userSpaceOnUse" id="agd_paint1_bot" x1="805.908" x2="1612.91" y1="549.665" y2="549.665">
                  <stop /><stop offset="0.403846" stopColor="#0F0808" /><stop offset="1" stopColor="#370707" />
                </linearGradient>
                <linearGradient gradientUnits="userSpaceOnUse" id="agd_paint2_bot" x1="-0.499268" x2="806.501" y1="549.665" y2="549.665">
                  <stop stopColor="#370707" /><stop offset="0.596154" stopColor="#0F0808" /><stop offset="1" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>
      </div>
      {/* Top */}
      <div className="-translate-x-1/2 absolute h-[601.715px] left-[calc(50%-0.5px)] top-0 w-[1395px]">
        <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 1395 601.715">
          <g>
            <path d={watchBgPaths.p34fc2d00} fill="url(#agd_paint0_top)" />
            <path d={watchBgPaths.p2ed8a780} fill="url(#agd_paint1_top)" />
            <g><path d={watchBgPaths.pe0fa600} fill="url(#agd_paint2_top)" style={{ mixBlendMode: "screen" }} /></g>
            <path d={watchBgPaths.p2cdefc0} fill="url(#agd_paint3_top)" />
            <path d={watchBgPaths.p32677770} fill="url(#agd_paint4_top)" />
            <g><path d={watchBgPaths.p2b0f4700} fill="url(#agd_paint5_top)" style={{ mixBlendMode: "screen" }} /></g>
            <g><path d={watchBgPaths.p3f781180} fill="url(#agd_paint6_top)" style={{ mixBlendMode: "screen" }} /></g>
          </g>
          <defs>
            <linearGradient gradientUnits="userSpaceOnUse" id="agd_paint0_top" x1="1379" x2="1384.5" y1="0" y2="602">
              <stop stopColor="#071D39" /><stop offset="1" />
            </linearGradient>
            <linearGradient gradientUnits="userSpaceOnUse" id="agd_paint1_top" x1="16" x2="10.5" y1="0" y2="602">
              <stop stopColor="#071D39" /><stop offset="1" />
            </linearGradient>
            <linearGradient gradientUnits="userSpaceOnUse" id="agd_paint2_top" x1="165" x2="1230" y1="0" y2="0">
              <stop stopColor="#030508" /><stop offset="0.15" /><stop offset="0.85" /><stop offset="1" stopColor="#030508" />
            </linearGradient>
            <linearGradient gradientUnits="userSpaceOnUse" id="agd_paint3_top" x1="697.833" x2="1231.56" y1="0" y2="-12.1173">
              <stop /><stop offset="1" stopColor="#071D39" />
            </linearGradient>
            <linearGradient gradientUnits="userSpaceOnUse" id="agd_paint4_top" x1="164" x2="697.725" y1="0" y2="-12.1173">
              <stop stopColor="#071D39" /><stop offset="1" />
            </linearGradient>
            <radialGradient cx="0" cy="0" gradientTransform="matrix(125.928 93.4085 -25.8529 31.3588 249 150)" gradientUnits="userSpaceOnUse" id="agd_paint5_top" r="1">
              <stop stopColor="#00060B" /><stop offset="1" stopOpacity="0" />
            </radialGradient>
            <radialGradient cx="0" cy="0" gradientTransform="matrix(30.0208 27.9927 -125.583 94.8815 1147.65 149.509)" gradientUnits="userSpaceOnUse" id="agd_paint6_top" r="1">
              <stop stopColor="#00060B" /><stop offset="1" stopOpacity="0" />
            </radialGradient>
          </defs>
        </svg>
      </div>
    </div>
  );
});

/* ================================================================
   AGENT DETAIL PAGE — main export
   ================================================================ */

export default function AgentDetailPage() {
  const { agentId } = useParams<{ agentId: string }>();
  const navigate = useNavigate();
  const id = agentId as AgentId;
  const meta = AGENT_META[id];
  const taskData = AGENT_TASKS[id];
  const [doneTodayItems, setDoneTodayItems] = useState<DoneTodayItem[]>([]);

  const handleModuleComplete = useCallback((action: CompletedAction) => {
    const now = new Date();
    const time = now.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
    setDoneTodayItems((prev) => [
      {
        ...action,
        source: "manual" as const,
        time,
      },
      ...prev,
    ]);
  }, []);

  if (!meta || !taskData) {
    return (
      <div className="flex-1 flex items-center justify-center" style={{ backgroundColor: colors.bgApp }}>
        <div className="flex flex-col items-center gap-4 text-center">
          <p style={{ fontSize: 15, fontWeight: 600, color: colors.textPrimary, margin: 0 }}>Agent not found</p>
          <p style={{ fontSize: 12, color: colors.textMuted, margin: 0 }}>
            Agent <code style={{ color: colors.accent, fontFamily: "monospace" }}>{agentId}</code> does not exist.
          </p>
          <button
            onClick={() => navigate("/")}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "8px 16px", borderRadius: 8,
              border: `1px solid ${colors.border}`,
              background: "transparent", color: colors.textMuted,
              fontSize: 12, cursor: "pointer",
            }}
          >
            <ArrowLeft size={12} /> Back to Watch Center
          </button>
        </div>
      </div>
    );
  }

  const isActive = meta.status === "Active";

  const hiddenModules = HIDDEN_MODULES_BY_AGENT[id] || [];
  const visibleModuleKeys = MODULE_KEYS.filter((k) => !hiddenModules.includes(k));

  return (
    <TaskInvestigationBridgeProvider>
    <AgentDetailInner
      id={id}
      meta={meta}
      taskData={taskData}
      isActive={isActive}
      visibleModuleKeys={visibleModuleKeys}
      navigate={navigate}
      handleModuleComplete={handleModuleComplete}
      doneTodayItems={doneTodayItems}
    />
    </TaskInvestigationBridgeProvider>
  );
}

function AgentDetailInner({
  id, meta, taskData, isActive, visibleModuleKeys, navigate, handleModuleComplete, doneTodayItems,
}: {
  id: AgentId;
  meta: { label: string; status: string; color: string };
  taskData: any;
  isActive: boolean;
  visibleModuleKeys: string[];
  navigate: ReturnType<typeof useNavigate>;
  handleModuleComplete: (action: CompletedAction) => void;
  doneTodayItems: DoneTodayItem[];
}) {
  const { investigateTask } = useTaskInvestigation();
  const { isOpen: isAiBoxOpen, open: openAiBox, openWithContext, close: closeAiBox, setPendingEntryQuery } = useAiBox();
  const { persona } = usePersona();
  const agentRole = AGENT_ROLE[id];

  /* ── AI action result: track which sections were updated ── */
  const [aiUpdatedSections, setAiUpdatedSections] = useState<Set<string>>(new Set());

  useEffect(() => {
    const handler = (e: Event) => {
      const { scope } = (e as CustomEvent).detail as { resultType: string; scope: string };
      const sections = new Set<string>();
      if (scope === "agent" || scope === "investigation") {
        sections.add("findings");
        sections.add("impact");
      }
      if (scope === "risk") sections.add("impact");
      if (scope === "asset") { sections.add("findings"); sections.add("impact"); }
      if (sections.size > 0) {
        setAiUpdatedSections(sections);
        const t = setTimeout(() => setAiUpdatedSections(new Set()), 3000);
        return () => clearTimeout(t);
      }
    };
    window.addEventListener("aibox-page-refresh", handler);
    return () => window.removeEventListener("aibox-page-refresh", handler);
  }, []);

  /* ── Push agent context to global AIBox and auto-open ── */
  useEffect(() => {
    const agentRole = AGENT_ROLE[id];
    const insights = AGENT_INSIGHTS[id as AgentId] ?? [];
    const activeInsights = insights.filter(i => i.status === "active" || i.status === "confirmed");
    const topInsight = activeInsights[0];
    const insightLine = topInsight
      ? ` Most recent: **${topInsight.title}**.`
      : "";
    const insightCount = activeInsights.length;
    const countLine = insightCount > 0
      ? ` ${insightCount} active finding${insightCount > 1 ? "s" : ""} in the current cycle.`
      : "";
    openWithContext({
      type: "agent",
      label: agentRole,
      sublabel: "Analyst Context",
      contextKey: `agent:${id}`,
      greeting: `**Agent ${meta.label} — ${agentRole}** is loaded.${countLine}${insightLine} I can surface findings, explain risk impact, recommend remediations, or trigger an action — just ask.`,
      suggestions: getPersonaAiBoxSuggestions("agent", persona, agentRole, id as AgentId),
    });
    return () => { closeAiBox(); };
  }, [id, meta.label, persona, openWithContext, closeAiBox]);

  const handleInvestigateIntervention = useCallback((data: InterventionData) => {
    /* Map intervention to a task-like investigation request */
    const analysts = (TASK_ANALYST_MAP[data.id] || []).map(a => ({
      name: a.name,
      role: a.role,
      contribution: a.contribution,
    }));
    /* If no direct match, build analyst list from agent role */
    if (analysts.length === 0) {
      analysts.push({
        name: AGENT_ROLE[id].split(" ")[0],
        role: AGENT_ROLE[id],
        contribution: data.description,
      });
    }
    investigateTask({
      taskId: data.id,
      title: data.title,
      description: data.description,
      reason: data.businessImpact || data.description,
      actionType: "investigate",
      severity: data.severity,
      analysts,
      source: id,
      timestamp: Date.now(),
    });
  }, [id, investigateTask]);



  return (
    <motion.div
      className="flex-1 overflow-hidden relative"
      style={{ backgroundColor: colors.bgApp }}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      {/* Watch Center background */}
      <WatchCenterBg />

      {/* Scrollable main content */}
      <div className="overflow-y-auto h-full relative z-[1]">
      <div className="w-full max-w-[1237px] mx-auto px-[28px] py-[24px] flex flex-col gap-[20px] pb-[80px]">
        {/* Back button */}
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-[8px] group cursor-pointer w-fit"
        >
          <ArrowLeft size={14} className="text-[#4a5568] group-hover:text-[#89949e] transition-colors" />
          <span className="font-['Inter',sans-serif] text-[13px] text-[#4a5568] leading-[16px] group-hover:text-[#89949e] transition-colors">
            Back to Watch Center
          </span>
        </button>

        {/* Agent Header */}
        <div className="relative rounded-[12px] px-[25px] py-[21px] flex flex-col gap-[24px]">
          <div aria-hidden="true" className="absolute inset-0 mix-blend-screen pointer-events-none rounded-[12px]" style={{ backgroundImage: "linear-gradient(148.694deg, rgb(4, 8, 3) 0%, rgb(0, 0, 0) 35.132%, rgb(0, 0, 0) 65.097%, rgb(4, 8, 3) 90.93%)" }} />
          <div aria-hidden="true" className="absolute inset-0 pointer-events-none rounded-[12px] p-px overflow-hidden" style={{ WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)", WebkitMaskComposite: "xor", maskComposite: "exclude" }}>
            <div className="absolute inset-[-50%] animate-[border-spin_4s_linear_infinite]" style={{ background: "conic-gradient(from 0deg, rgba(3,6,9,1) 0%, rgba(47,216,151,0.24) 25%, rgba(3,6,9,1) 50%, rgba(47,216,151,0.24) 75%, rgba(3,6,9,1) 100%)" }} />
          </div>
          <div className="flex items-center justify-between relative">
            <div className="flex items-center gap-[8px]">
              <div className="flex items-center gap-[6px]">
                {/* Agent dot */}
                <div className="size-[8px] rounded-full" style={{ backgroundColor: meta.color }} />
                <h1 className="font-['Inter',sans-serif] text-white leading-[normal] tracking-[-0.3px] text-[14px]">
                  {taskData.name}
                </h1>
              </div>
              {/* Status badge */}
              <div
                className="rounded-[99px] px-[12px] py-[4px] relative flex items-center justify-center"
                style={{
                  backgroundColor: isActive ? "rgba(0,164,110,0.08)" : "rgba(98,112,125,0.08)",
                }}
              >
                <div
                  aria-hidden="true"
                  className="absolute border border-solid inset-0 pointer-events-none rounded-[99px]"
                  style={{
                    borderColor: isActive ? "rgba(0,164,110,0.2)" : "rgba(98,112,125,0.15)",
                  }}
                />
                <span
                  className="font-['Inter',sans-serif] text-[10px] leading-[12px] uppercase tracking-[0.3px]"
                  style={{ color: isActive ? "#00A46E" : "#62707D" }}
                >
                  {meta.status}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-[10px]">
              {isActive && (
                <div className="flex items-center gap-[6px]">
                  <PulsingDot color="#00A46E" />
                  <span className="font-['Inter',sans-serif] text-[11px] text-[#00A46E] leading-[14px]">
                    Processing signals
                  </span>
                </div>
              )}
              <button
                onClick={() => openWithContext({
                  type: "agent",
                  label: agentRole,
                  sublabel: "Analyst Context",
                  contextKey: `agent:${id}`,
                  greeting: `**Agent ${meta.label} — ${agentRole}** is active. I have your current findings, active tasks, and risk posture loaded. What would you like to explore?`,
                  suggestions: getPersonaAiBoxSuggestions("agent", persona, agentRole, id as AgentId),
                })}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "5px",
                  padding: "5px 10px",
                  borderRadius: "99px",
                  border: `1px solid ${colors.accent}33`,
                  background: `${colors.accent}0e`,
                  color: colors.accent,
                  fontSize: "10px",
                  cursor: "pointer",
                  lineHeight: "1",
                }}
              >
                <MessageCircle size={10} />
                Ask analyst
              </button>
            </div>
          </div>

          {/* Description */}
          <p className="font-['Inter',sans-serif] text-[11px] text-[#89949e] leading-[15.4px] relative">
            {taskData.description.split("\n\n")[0]}
          </p>
        </div>

        {/* Capabilities — primary / secondary hierarchy */}
        <div className="relative rounded-[12px] px-[20px] py-[16px]">
          <div aria-hidden="true" className="absolute inset-0 pointer-events-none rounded-[12px]" style={{ background: "rgba(6,14,26,0.6)", border: "1px solid rgba(40,65,90,0.5)" }} />
          <div className="flex flex-col gap-[12px] relative">
            <div className="flex items-center justify-between">
              <span className="font-['Inter',sans-serif] text-[10px] text-[#7e97b0] leading-[14px] uppercase tracking-[0.5px]">Skills</span>
              <span className="font-['Inter',sans-serif] text-[9px] text-[#4a5f72] leading-[12px]">Click any skill to open a conversation</span>
            </div>

            {/* Primary actions — 2 prominent buttons */}
            {(() => {
              const allSkills = getPersonaDefaultSkills("agent", persona, id as AgentId);
              const primarySkills = allSkills.slice(0, 2).map(s => renderSkillSuggestion(s, agentRole, id));
              const secondarySkills = allSkills.slice(2, 6).map(s => renderSkillSuggestion(s, agentRole, id));
              return (
                <>
                  <div className="flex gap-[8px]">
                    {primarySkills.map(cap => (
                      <button
                        key={cap.label}
                        title={cap.label}
                        onClick={() => {
                          if (isAiBoxOpen) {
                            window.dispatchEvent(new CustomEvent("globalaibox-inject-query", { detail: { query: cap.prompt } }));
                          } else {
                            setPendingEntryQuery(cap.prompt);
                            openAiBox();
                          }
                        }}
                        className="h-[34px] flex-1 relative rounded-[7px] cursor-pointer border-none transition-all"
                        style={{ backgroundColor: "#076498", border: "1px solid rgba(87,177,255,0.18)" }}
                        onMouseEnter={e => {
                          e.currentTarget.style.backgroundColor = "#0879b5";
                          e.currentTarget.style.borderColor = "rgba(87,177,255,0.35)";
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.backgroundColor = "#076498";
                          e.currentTarget.style.borderColor = "rgba(87,177,255,0.18)";
                        }}
                      >
                        <span className="font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[13px] text-[#f1f3ff] text-[11px]">{cap.label}</span>
                      </button>
                    ))}
                  </div>

                  {/* Secondary actions — 4 smaller outline buttons */}
                  <div className="flex flex-wrap gap-[6px]">
                    {secondarySkills.map(cap => (
                      <button
                        key={cap.label}
                        title={cap.label}
                        onClick={() => {
                          if (isAiBoxOpen) {
                            window.dispatchEvent(new CustomEvent("globalaibox-inject-query", { detail: { query: cap.prompt } }));
                          } else {
                            setPendingEntryQuery(cap.prompt);
                            openAiBox();
                          }
                        }}
                        className="h-[28px] px-[10px] relative rounded-[6px] cursor-pointer transition-all"
                        style={{
                          backgroundColor: "rgba(87,177,255,0.04)",
                          border: "1px solid rgba(87,177,255,0.18)",
                          color: "#89949e",
                          whiteSpace: "nowrap",
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.backgroundColor = "rgba(87,177,255,0.09)";
                          e.currentTarget.style.borderColor = "rgba(87,177,255,0.32)";
                          e.currentTarget.style.color = "#b8c8d8";
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.backgroundColor = "rgba(87,177,255,0.04)";
                          e.currentTarget.style.borderColor = "rgba(87,177,255,0.18)";
                          e.currentTarget.style.color = "#89949e";
                        }}
                      >
                        <span className="font-['Inter:Medium',sans-serif] font-medium leading-[12px] text-[10px]">{cap.label}</span>
                      </button>
                    ))}
                  </div>
                </>
              );
            })()}
          </div>
        </div>

        {/* Agent Impact Panel — subtly highlighted when an AI action updates risk/metrics */}
        <div className={aiUpdatedSections.has("impact") ? "ai-updated-section" : ""}>
          <AgentImpactPanel agentId={id} />
        </div>

        {/* Insight Activity — analyst discoveries; highlighted when findings are refreshed */}
        <div className={aiUpdatedSections.has("findings") ? "ai-updated-section" : ""}>
          <InsightActivitySection agentId={id} aiUpdated={aiUpdatedSections.has("findings")} />
        </div>
        <div className="h-px" style={{ backgroundColor: colors.divider }} />

        {/* Modules Overview heading */}
        <div className="flex items-center gap-[10px]">
          <h2 className="font-['Inter',sans-serif] text-[16px] text-[#dadfe3] leading-[20px]">
            Module Operations
          </h2>
          <span className="font-['Inter',sans-serif] text-[11px] text-[#4a5568] leading-[14px]">
            {visibleModuleKeys.length} active modules
          </span>
        </div>

        {/* Module sections */}
        {visibleModuleKeys.map((key, index) => (
          <ModuleSection key={key} moduleKey={key} config={MODULE_DATA[key]} onComplete={handleModuleComplete} defaultExpanded={index === 0} onInvestigate={handleInvestigateIntervention} />
        ))}

        {/* Separator + Done Today */}
        {doneTodayItems.length > 0 && (
          <>
            <div className="h-px" style={{ backgroundColor: colors.divider }} />
            <DoneTodaySection items={doneTodayItems} />
          </>
        )}

      </div>
      </div>
    </motion.div>
  );
}