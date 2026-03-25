import React, { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router";
import { X, ExternalLink, Network, Copy, Check, FileText, Shield, AlertTriangle } from "lucide-react";
import { colors } from "../../shared/design-system/tokens";
import { useAiBox } from "../../features/ai-box";
import { getControlsForPath } from "../../shared/entity-graph";
import type { BlastRadiusAsset } from "./types";
import { ATTACK_PATHS, getAssetExposures, severityAccent } from "./data";

const INSIGHTS_W = 360;

function InsightsPanel({ asset, onClose, sourcePathId, sourcePathName }: { asset: BlastRadiusAsset; onClose: () => void; sourcePathId: string; sourcePathName: string }) {
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const closingRef = useRef(false);
  const accent = severityAccent[asset.riskSeverity] || colors.textDim;
  const exposures = getAssetExposures(asset.id);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleCopy = useCallback((value: string, field: string) => {
    navigator.clipboard.writeText(value).then(() => {
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 1600);
    });
  }, []);

  /* Animate in on mount */
  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
  }, []);

  /* Smooth close-out: reverse slide animation, then unmount */
  const initiateClose = useCallback(() => {
    if (closingRef.current) return;
    closingRef.current = true;
    setVisible(false);
    setTimeout(onClose, 220);
  }, [onClose]);

  /* Close on ESC key */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") initiateClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [initiateClose]);

  /* Close on click outside the panel */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        initiateClose();
      }
    };
    const t = setTimeout(() => document.addEventListener("mousedown", handler), 60);
    return () => { clearTimeout(t); document.removeEventListener("mousedown", handler); };
  }, [initiateClose]);

  return (
    <div
      className="fixed inset-0 z-[60]"
      style={{ pointerEvents: "none" }}
      onMouseDown={(e) => e.stopPropagation()}
    >
      {/* Semi-transparent backdrop */}
      <div
        style={{
          position: "absolute", inset: 0, backgroundColor: "rgba(0,0,0,0.40)",
          pointerEvents: "auto", opacity: visible ? 1 : 0,
          transition: "opacity 200ms ease-out",
        }}
        onMouseDown={(e) => { e.stopPropagation(); initiateClose(); }}
      />

      {/* Slide-in panel — fixed to viewport right edge */}
      <div
        ref={panelRef}
        style={{
          position: "fixed", top: 0, right: 0, bottom: 0, width: INSIGHTS_W,
          backgroundColor: "rgba(6,12,20,0.98)", borderLeft: `1px solid ${colors.border}`,
          boxShadow: "-8px 0 30px rgba(0,0,0,0.35)",
          backdropFilter: "blur(14px)", pointerEvents: "auto",
          transform: visible ? "translateX(0)" : "translateX(100%)",
          transition: "transform 200ms cubic-bezier(0.22, 0.61, 0.36, 1)",
          fontFamily: "system-ui, -apple-system, sans-serif",
          display: "flex", flexDirection: "column", overflow: "hidden",
        }}
      >
        {/* ── Header (sticky) ── */}
        <div style={{
          padding: "16px 18px 12px", display: "flex", alignItems: "center", justifyContent: "space-between",
          borderBottom: `1px solid ${colors.border}`, flexShrink: 0,
          backgroundColor: "rgba(6,12,20,0.98)", zIndex: 2,
        }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: colors.textPrimary }}>Insights</span>
          <button
            onClick={initiateClose}
            style={{
              width: 28, height: 28, borderRadius: 7, border: `1px solid ${colors.border}`,
              backgroundColor: "transparent", display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", transition: "background-color 150ms ease",
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = "rgba(255,255,255,0.06)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = "transparent"; }}
          >
            <X size={14} color={colors.textMuted} strokeWidth={2} />
          </button>
        </div>

        {/* ── Scrollable body ── */}
        <div
          className="insights-scroll"
          style={{
            flex: 1, minHeight: 0, overflowY: "auto", overflowX: "hidden",
            scrollbarWidth: "thin",
            scrollbarColor: "rgba(87,177,255,0.18) transparent",
          }}
        >
          <div style={{ padding: "18px 20px 24px", display: "flex", flexDirection: "column", gap: 0 }}>

            {/* ══════════════  SECTION 1: Asset Information  ══════════════ */}

            {/* Section label */}
            <InsightSectionLabel text="Asset Information" />

            {/* Asset ID + severity badge */}
            <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 14 }}>
              <span style={{ fontSize: 9.5, color: colors.textDim, textTransform: "uppercase", letterSpacing: "0.06em" }}>Asset ID</span>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{
                  fontSize: 11.5, fontWeight: 600, color: colors.textPrimary, fontFamily: "monospace",
                  flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                }}>
                  {asset.id}
                </span>
                <InsightCopyBtn
                  value={asset.id}
                  field="id"
                  copiedField={copiedField}
                  onCopy={handleCopy}
                />
                <span style={{
                  fontSize: 9, fontWeight: 700, color: accent, textTransform: "uppercase", letterSpacing: "0.05em",
                  padding: "3px 10px", borderRadius: 5, backgroundColor: `${accent}15`, border: `1px solid ${accent}30`,
                }}>
                  {asset.riskSeverity}
                </span>
              </div>
            </div>

            {/* Asset details card */}
            <div style={{
              padding: "14px 16px", borderRadius: 10, backgroundColor: "rgba(87,177,255,0.03)",
              border: `1px solid ${colors.border}`, display: "flex", flexDirection: "column", gap: 12,
              marginBottom: 6,
            }}>
              <InsightRow label="Asset Name" value={asset.name} />
              <InsightRow
                label="Private IP"
                value={asset.privateIp}
                mono
                copyValue={asset.privateIp}
                copyField="ip"
                copiedField={copiedField}
                onCopy={handleCopy}
              />
              <div style={{ height: 1, backgroundColor: colors.border, margin: "2px 0" }} />
              <InsightRow label="Misconfigurations" value={String(asset.misconfigurations)} accent="#FF740A" />
              <InsightRow label="Vulnerabilities" value={String(asset.vulnerabilities)} accent="#FF5757" />
            </div>

            {/* ══════════════  SECTION 2: Primary Action  ══════════════ */}

            <div style={{ margin: "16px 0" }}>
              <button
                onClick={() => navigate(`/assets/${asset.id}`, {
                  state: {
                    assetName: asset.name,
                    privateIp: asset.privateIp,
                    severity: asset.riskSeverity,
                    vulnerabilityCount: asset.vulnerabilities,
                    misconfigurationCount: asset.misconfigurations,
                    sourceAttackPathId: sourcePathId,
                    sourceAttackPathName: sourcePathName,
                    arn: asset.arn,
                    triggerType: asset.vulnerabilities > 0 ? "vulnerability" : asset.misconfigurations > 0 ? "misconfiguration" : "risk",
                    triggerRecordId: asset.vulnerabilities > 0 ? "v1" : asset.misconfigurations > 0 ? "m1" : "r1",
                  },
                })}
                style={{
                  width: "100%", height: 40, borderRadius: 10, border: "none",
                  background: "linear-gradient(135deg, #57b1ff 0%, #3d8bfd 100%)",
                  color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
                  transition: "opacity 150ms ease, box-shadow 150ms ease, transform 150ms ease",
                  boxShadow: "0 2px 12px rgba(87,177,255,0.20)",
                }}
                onMouseEnter={(e) => { const el = e.currentTarget as HTMLButtonElement; el.style.opacity = "0.90"; el.style.boxShadow = "0 4px 18px rgba(87,177,255,0.30)"; el.style.transform = "translateY(-1px)"; }}
                onMouseLeave={(e) => { const el = e.currentTarget as HTMLButtonElement; el.style.opacity = "1"; el.style.boxShadow = "0 2px 12px rgba(87,177,255,0.20)"; el.style.transform = "translateY(0)"; }}
              >
                <ExternalLink size={13} strokeWidth={2} />
                View Asset Details
              </button>
              
              {/* Create Case Button */}
              <button
                onClick={() => {
                  // Import case integration utilities
                  import("../case-management/case-integration").then(({ createCaseFromAttackPath }) => {
                    import("../case-management/case-data").then(({ addCase, addObservation, addPlaybooks }) => {
                      // Get the attack path data
                      const pathData = ATTACK_PATHS[sourcePathId];
                      if (!pathData) return;
                      
                      // Find the vulnerable node to extract CVE
                      const vulnNode = pathData.nodes.find(n => n.isVulnerable);
                      
                      // Build attack path context
                      const context = {
                        attackPathId: sourcePathId,
                        attackPathName: sourcePathName,
                        attackPathDescription: pathData.description,
                        priority: pathData.priority,
                        assetId: asset.id,
                        assetName: asset.name,
                        assetArn: asset.arn,
                        assetPrivateIp: asset.privateIp,
                        vulnerabilityCount: asset.vulnerabilities,
                        misconfigurationCount: asset.misconfigurations,
                        vulnerabilityId: vulnNode?.cve,
                        riskSeverity: asset.riskSeverity,
                        exposures: asset.exposures,
                        blastRadiusAssets: pathData.blastRadius.totalAssets,
                      };
                      
                      // Create case
                      const { caseData, initialObservation, recommendedPlaybooks } = createCaseFromAttackPath(context);
                      
                      // Add to case data store
                      addCase(caseData);
                      addObservation(caseData.id, initialObservation);
                      addPlaybooks(caseData.id, recommendedPlaybooks);
                      
                      // Navigate to case detail page
                      navigate(`/case-management/${caseData.id}`, {
                        state: {
                          fromAI: true,
                          fromAttackPath: true,
                          attackPathReturnPath: `/attack-paths/${sourcePathId}`,
                          initialTab: "investigation",
                          caseData,
                          initialObservation,
                          recommendedPlaybooks,
                        },
                      });
                    });
                  });
                }}
                style={{
                  width: "100%", height: 38, borderRadius: 10, marginTop: 10,
                  border: "1px solid rgba(240,91,6,0.35)",
                  background: "rgba(240,91,6,0.08)",
                  color: "#F05B06", fontSize: 12, fontWeight: 600, cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
                  transition: "background 150ms ease, border-color 150ms ease, transform 150ms ease",
                }}
                onMouseEnter={(e) => { const el = e.currentTarget as HTMLButtonElement; el.style.background = "rgba(240,91,6,0.14)"; el.style.borderColor = "rgba(240,91,6,0.50)"; el.style.transform = "translateY(-1px)"; }}
                onMouseLeave={(e) => { const el = e.currentTarget as HTMLButtonElement; el.style.background = "rgba(240,91,6,0.08)"; el.style.borderColor = "rgba(240,91,6,0.35)"; el.style.transform = "translateY(0)"; }}
              >
                <FileText size={13} strokeWidth={2} />
                Create Case
              </button>
            </div>

            {/* ══════════════  SECTION 3: Contributing Compliance Gaps  ══════════════ */}

            <div style={{ height: 1, backgroundColor: colors.border, marginBottom: 16 }} />

            <ComplianceGapsSection pathId={sourcePathId} navigate={navigate} />

            {/* ══════════════  SECTION 4: Exposed Via Network  ══════════════ */}

            <div style={{ height: 1, backgroundColor: colors.border, marginBottom: 16 }} />

            <InsightSectionLabel text="Network Exposure" />

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                <div style={{
                  width: 24, height: 24, borderRadius: 6, backgroundColor: "rgba(255,122,26,0.10)",
                  border: "1px solid rgba(255,122,26,0.22)", display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <Network size={12} color="#FF740A" strokeWidth={2} />
                </div>
                <span style={{ fontSize: 11.5, fontWeight: 600, color: colors.textPrimary }}>Exposed Via Network</span>
                <span style={{
                  marginLeft: "auto", fontSize: 8.5, fontWeight: 600, color: "rgba(255,122,26,0.75)",
                  padding: "2px 8px", borderRadius: 8, backgroundColor: "rgba(255,122,26,0.08)",
                  border: "1px solid rgba(255,122,26,0.12)",
                }}>
                  {exposures.length}
                </span>
              </div>

              <div style={{
                display: "flex", flexDirection: "column", gap: 0, borderRadius: 8,
                border: `1px solid ${colors.border}`, overflow: "hidden",
              }}>
                {exposures.map((exp, idx) => (
                  <div
                    key={`exp-${idx}`}
                    style={{
                      display: "flex", gap: 10, padding: "10px 12px",
                      backgroundColor: idx % 2 === 0 ? "rgba(255,122,26,0.015)" : "transparent",
                      borderBottom: idx < exposures.length - 1 ? `1px solid rgba(255,255,255,0.035)` : "none",
                    }}
                  >
                    <span style={{
                      width: 20, height: 20, borderRadius: 5, flexShrink: 0,
                      backgroundColor: "rgba(255,122,26,0.10)", border: "1px solid rgba(255,122,26,0.22)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 9, fontWeight: 700, color: "#FF740A",
                    }}>
                      {idx + 1}
                    </span>
                    <span style={{ fontSize: 10.5, color: colors.textSecondary, lineHeight: "1.55", paddingTop: 1 }}>
                      {exp}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Contributing compliance gaps section (shown inside InsightsPanel) ── */
function ComplianceGapsSection({ pathId, navigate }: { pathId: string; navigate: ReturnType<typeof useNavigate> }) {
  const gaps = getControlsForPath(pathId);
  if (gaps.length === 0) return null;

  return (
    <div style={{ marginBottom: 16 }}>
      <InsightSectionLabel text="Contributing Compliance Gaps" />
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {gaps.map(gap => {
          const sevColor =
            gap.severity === "critical" ? "#ef4444"
            : gap.severity === "high" ? "#f97316"
            : gap.severity === "medium" ? "#f59e0b"
            : "#22c55e";
          return (
            <div
              key={gap.gapId}
              style={{
                padding: "10px 12px",
                borderRadius: 8,
                background: `${sevColor}0d`,
                border: `1px solid ${sevColor}28`,
                display: "flex",
                flexDirection: "column",
                gap: 4,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{
                  fontSize: 9, fontWeight: 700, color: sevColor,
                  textTransform: "uppercase", letterSpacing: "0.05em",
                  padding: "1px 6px", borderRadius: 4,
                  background: `${sevColor}18`, border: `1px solid ${sevColor}30`,
                  flexShrink: 0,
                }}>
                  {gap.severity}
                </span>
                <span style={{ fontSize: 10, fontWeight: 600, color: colors.textPrimary }}>
                  {gap.control}
                </span>
                <span style={{ fontSize: 10, color: colors.textDim }}>· {gap.framework}</span>
              </div>
              <p style={{ margin: 0, fontSize: 10.5, color: colors.textSecondary, lineHeight: "1.45" }}>
                {gap.title}
              </p>
              <p style={{ margin: 0, fontSize: 9.5, color: colors.textDim, lineHeight: "1.4" }}>
                {gap.contribution}
              </p>
              <button
                onClick={() => navigate("/compliance")}
                style={{
                  marginTop: 4, padding: "4px 10px", borderRadius: 6, cursor: "pointer",
                  fontSize: 10, fontWeight: 600, color: sevColor,
                  background: `${sevColor}10`, border: `1px solid ${sevColor}28`,
                  alignSelf: "flex-start", transition: "background 120ms ease",
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = `${sevColor}1e`; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = `${sevColor}10`; }}
              >
                View in Compliance →
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── Small section label ── */
function InsightSectionLabel({ text }: { text: string }) {
  return (
    <span style={{
      fontSize: 8.5, fontWeight: 700, color: colors.textDim, textTransform: "uppercase",
      letterSpacing: "0.1em", marginBottom: 10, display: "block",
    }}>
      {text}
    </span>
  );
}

/* ── Copy button with feedback ── */
function InsightCopyBtn({
  value, field, copiedField, onCopy,
}: {
  value: string; field: string; copiedField: string | null; onCopy: (v: string, f: string) => void;
}) {
  const isCopied = copiedField === field;
  return (
    <button
      onClick={() => onCopy(value, field)}
      title={isCopied ? "Copied!" : "Copy to clipboard"}
      style={{
        width: 22, height: 22, borderRadius: 5, flexShrink: 0,
        border: `1px solid ${isCopied ? "rgba(12,207,146,0.35)" : colors.border}`,
        backgroundColor: isCopied ? "rgba(12,207,146,0.08)" : "transparent",
        display: "flex", alignItems: "center", justifyContent: "center",
        cursor: "pointer", transition: "all 150ms ease",
      }}
      onMouseEnter={(e) => { if (!isCopied) (e.currentTarget as HTMLButtonElement).style.backgroundColor = "rgba(255,255,255,0.06)"; }}
      onMouseLeave={(e) => { if (!isCopied) (e.currentTarget as HTMLButtonElement).style.backgroundColor = "transparent"; }}
    >
      {isCopied
        ? <Check size={11} color="#2FD897" strokeWidth={2.5} />
        : <Copy size={11} color={colors.textDim} strokeWidth={2} />
      }
    </button>
  );
}

function InsightRow({
  label, value, mono, accent, copyValue, copyField, copiedField, onCopy,
}: {
  label: string; value: string; mono?: boolean; accent?: string;
  copyValue?: string; copyField?: string; copiedField?: string | null;
  onCopy?: (v: string, f: string) => void;
}) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
      <span style={{ fontSize: 10, color: colors.textDim, flexShrink: 0 }}>{label}</span>
      <div style={{ display: "flex", alignItems: "center", gap: 5, minWidth: 0 }}>
        <span style={{
          fontSize: 10.5, fontWeight: 600,
          color: accent || colors.textPrimary,
          fontFamily: mono ? "monospace" : "inherit",
          textAlign: "right", minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
        }}>
          {value}
        </span>
        {copyValue && copyField && onCopy && (
          <InsightCopyBtn value={copyValue} field={copyField} copiedField={copiedField ?? null} onCopy={onCopy} />
        )}
      </div>
    </div>
  );
}

export { InsightsPanel };
