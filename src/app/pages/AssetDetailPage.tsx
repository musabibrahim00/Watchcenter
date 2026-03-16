import React, { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate, useLocation } from "react-router";
import {
  ArrowLeft, Shield, Search, ChevronLeft, ChevronRight,
  ArrowUpDown, Download, RefreshCw, ChevronDown,
} from "lucide-react";
import { colors } from "../shared/design-system/tokens";
import { EntityLink } from "../shared/components/EntityLink";
import {
  ASSETS, getVulnerabilities, getRisks, getMisconfigurations, getSoftware,
  type Asset, type Severity,
} from "./asset-register/asset-data";

/* ================================================================
   TYPES
   ================================================================ */

interface AssetLocationState {
  assetName?: string;
  privateIp?: string;
  severity?: Severity;
  vulnerabilityCount?: number;
  misconfigurationCount?: number;
  sourceAttackPathId?: string;
  sourceAttackPathName?: string;
  sourceCaseId?: string;
  sourceCaseTitle?: string;
  arn?: string;
  fromRegister?: boolean;
  triggerType?: "vulnerability" | "misconfiguration" | "risk";
  triggerRecordId?: string;
}

/* ================================================================
   CONSTANTS
   ================================================================ */

const SEV_COLOR: Record<string, string> = {
  critical: "#ff4d4f", high: "#0ccf92", medium: "#ff7a1a", low: "#2bb7ff", informational: "#5b6abf",
};

const TABS = [
  { id: "details", label: "Asset Details" },
  { id: "risks", label: "Risks" },
  { id: "vulnerabilities", label: "Vulnerabilities" },
  { id: "misconfigurations", label: "Misconfigurations" },
  { id: "softwares", label: "Softwares" },
] as const;
type TabId = (typeof TABS)[number]["id"];

/* ================================================================
   ASSET DETAIL PAGE
   ================================================================ */

export default function AssetDetailPage() {
  const { assetId } = useParams<{ assetId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state || {}) as AssetLocationState;

  const triggerType = state.triggerType || null;
  const triggerRecordId = state.triggerRecordId || null;

  /* Compute initial tab based on trigger type */
  const initialTab = useMemo<TabId>(() => {
    if (triggerType === "vulnerability") return "vulnerabilities";
    if (triggerType === "misconfiguration") return "misconfigurations";
    if (triggerType === "risk") return "risks";
    return "details";
  }, [triggerType]);

  const [activeTab, setActiveTab] = useState<TabId>(initialTab);

  const fullAsset = useMemo(() => ASSETS.find(a => a.id === assetId), [assetId]);
  const assetName = fullAsset?.name || state.assetName || assetId || "Unknown";
  const sourcePathId = state.sourceAttackPathId || null;
  const sourcePathName = state.sourceAttackPathName || null;
  const sourceCaseId = state.sourceCaseId || null;
  const sourceCaseTitle = state.sourceCaseTitle || null;
  const hasAttackPathContext = !!sourcePathId;
  const hasCaseContext = !!sourceCaseId;

  return (
    <div className="flex flex-col h-full min-h-screen" style={{ backgroundColor: colors.bgApp }}>
      {/* ── Sticky Header ── */}
      <div className="shrink-0 sticky top-0 z-[50]" style={{ backgroundColor: colors.bgApp }}>
        {/* Title bar with breadcrumb */}
        <div className="flex flex-col gap-2 px-6 py-4" style={{ borderBottom: `1px solid ${colors.border}` }}>
          {/* Breadcrumb row */}
          <nav className="flex items-center gap-1.5">
            <button onClick={() => navigate(-1)}
              className="flex items-center justify-center w-7 h-7 rounded transition-colors hover:bg-[rgba(87,177,255,0.08)] mr-1"
              style={{ background: "none", border: "none", cursor: "pointer", flexShrink: 0 }}>
              <ArrowLeft size={16} color={colors.textMuted} />
            </button>
            {/* Watch Center */}
            <button onClick={() => navigate("/")}
              className="hover:opacity-80 transition-opacity"
              style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}>
              <span style={{ fontSize: 12, color: colors.textDim }}>Watch Center</span>
            </button>
            <ChevronRight size={11} color={colors.textDim} style={{ opacity: 0.4, flexShrink: 0 }} />

            {hasAttackPathContext ? (
              <div className="contents">
                {/* Attack Path link */}
                <button onClick={() => navigate(`/attack-path/${sourcePathId}`)}
                  className="hover:opacity-80 transition-opacity"
                  style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                  <span style={{ fontSize: 12, color: "#ff7a1a" }}>Attack Path</span>
                </button>
                <ChevronRight size={11} color={colors.textDim} style={{ opacity: 0.4, flexShrink: 0 }} />
                {/* Asset Register link */}
                <button onClick={() => navigate("/assets")}
                  className="hover:opacity-80 transition-opacity"
                  style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                  <span style={{ fontSize: 12, color: colors.textDim }}>Asset Register</span>
                </button>
                <ChevronRight size={11} color={colors.textDim} style={{ opacity: 0.4, flexShrink: 0 }} />
              </div>
            ) : (
              <div className="contents">
                {/* Asset Register link */}
                <button onClick={() => navigate("/assets")}
                  className="hover:opacity-80 transition-opacity"
                  style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                  <span style={{ fontSize: 12, color: colors.textDim }}>Asset Register</span>
                </button>
                <ChevronRight size={11} color={colors.textDim} style={{ opacity: 0.4, flexShrink: 0 }} />
              </div>
            )}

            {/* Current asset (active) */}
            <span style={{ fontSize: 12, fontWeight: 500, color: colors.textPrimary, maxWidth: 260, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {assetName}
            </span>
          </nav>

          {/* Asset title */}
          <div className="flex items-center gap-3 ml-9">
            <span style={{ fontSize: 18, fontWeight: 700, color: colors.textPrimary }}>{assetName}</span>
          </div>

          {/* Attack path context sub-line */}
          {hasAttackPathContext && (
            <div className="flex items-center gap-2 ml-9 mt-0.5">
              <div style={{ width: 18, height: 18, borderRadius: 4, backgroundColor: "rgba(255,122,26,0.10)", border: "1px solid rgba(255,122,26,0.22)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Shield size={9} color="#ff7a1a" strokeWidth={2.5} />
              </div>
              <span style={{ fontSize: 11, color: colors.textDim }}>Attack Path:</span>
              <EntityLink
                entityType="attack-path"
                entityId={sourcePathId!}
                label={sourcePathName || sourcePathId!}
                style={{ fontSize: 11, fontWeight: 600 }}
              />
            </div>
          )}

          {/* Case context sub-line */}
          {hasCaseContext && (
            <div className="flex items-center gap-2 ml-9 mt-0.5">
              <div style={{ width: 18, height: 18, borderRadius: 4, backgroundColor: "rgba(20,162,227,0.10)", border: "1px solid rgba(20,162,227,0.22)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Shield size={9} color="#14a2e3" strokeWidth={2.5} />
              </div>
              <span style={{ fontSize: 11, color: colors.textDim }}>Opened from Case:</span>
              <EntityLink
                entityType="case"
                entityId={sourceCaseId!}
                label={sourceCaseId!}
                style={{ fontSize: 11, fontWeight: 600 }}
              />
            </div>
          )}
        </div>

        {/* Tab bar */}
        <div className="flex items-center gap-0 px-6" style={{ borderBottom: `1px solid ${colors.border}` }}>
          {TABS.map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className="px-4 py-3 text-[13px] transition-colors relative"
                style={{
                  color: isActive ? colors.textPrimary : colors.textDim,
                  fontWeight: isActive ? 600 : 400,
                  background: "none", border: "none", cursor: "pointer",
                }}>
                {tab.label}
                {isActive && <div className="absolute bottom-0 left-0 right-0 h-[2px]" style={{ backgroundColor: colors.textPrimary }} />}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Tab Content ── */}
      <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(87,177,255,0.12) transparent" }}>
        {activeTab === "details" && <TabDetails asset={fullAsset || null} />}
        {activeTab === "risks" && <TabRisks asset={fullAsset || null} assetId={assetId || ""} highlightId={triggerType === "risk" ? triggerRecordId : null} />}
        {activeTab === "vulnerabilities" && <TabVulnerabilities assetId={assetId || ""} highlightId={triggerType === "vulnerability" ? triggerRecordId : null} />}
        {activeTab === "misconfigurations" && <TabMisconfigurations assetId={assetId || ""} highlightId={triggerType === "misconfiguration" ? triggerRecordId : null} />}
        {activeTab === "softwares" && <TabSoftwares assetId={assetId || ""} />}
      </div>
    </div>
  );
}

/* ================================================================
   TAB 1: ASSET DETAILS — 3 column layout matching design
   ================================================================ */

function TabDetails({ asset }: { asset: Asset | null }) {
  return (
    <div className="p-6">
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 0 }}>
        {/* Column 1: Asset Identification */}
        <div style={{ padding: "20px 24px", borderRight: `1px solid ${colors.border}` }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: colors.textPrimary, display: "block", marginBottom: 20 }}>Asset Identification</span>
          <div className="flex flex-col gap-4">
            <FieldPair label="Asset Type:" value={asset?.securityPlane || "Infrastructure"} />
            <FieldPair label="Asset Group:" value={asset?.assetGroup || "Cloud"} />
            <FieldPair label="Asset Location:" value={asset?.region || "us-east-1"} />
            <FieldPair label="Asset ARN:" value={asset?.arn || "—"} mono />
            <FieldPair label="Asset ID:" value={asset?.id || "—"} mono />
            <FieldPair label="Asset Name:" value={asset?.name || "—"} bold />
            <FieldPair label="Asset Service:" value={asset?.assetService || asset?.service || "—"} bold />
          </div>
        </div>

        {/* Column 2: Asset Valuation */}
        <div style={{ padding: "20px 24px", borderRight: `1px solid ${colors.border}` }}>
          <div className="flex items-center gap-2 mb-5">
            <span style={{ fontSize: 14, fontWeight: 700, color: colors.textPrimary }}>Asset Valuation</span>
            <RefreshCw size={14} color={colors.buttonPrimary} strokeWidth={2} style={{ cursor: "pointer" }} />
          </div>
          <FieldPair label="CIA Value:" value={asset?.ciaValue || "00"} />
        </div>

        {/* Column 3: Business Impacts */}
        <div style={{ padding: "20px 24px" }}>
          <div className="flex items-center gap-2 mb-5">
            <span style={{ fontSize: 14, fontWeight: 700, color: colors.textPrimary }}>Business Impacts</span>
            <RefreshCw size={14} color={colors.buttonPrimary} strokeWidth={2} style={{ cursor: "pointer" }} />
          </div>
          <div className="flex flex-col gap-0">
            <ImpactRow label="Confidentiality Rating (C):" value={`${asset?.ciaC ?? 0}/3`} />
            <ImpactRow label="Integrity Rating (I):" value={`${asset?.ciaI ?? 0}/3`} />
            <ImpactRow label="Availability Rating (A):" value={`${asset?.ciaA ?? 0}/3`} />
          </div>
        </div>
      </div>
    </div>
  );
}

function FieldPair({ label, value, mono, bold }: { label: string; value: string; mono?: boolean; bold?: boolean }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span style={{ fontSize: 11, color: colors.textDim }}>{label}</span>
      <span style={{
        fontSize: 13, color: colors.textPrimary,
        fontWeight: bold ? 600 : 400,
        fontFamily: mono ? "'SF Mono','Fira Code',monospace" : "inherit",
        wordBreak: "break-all",
      }}>{value}</span>
    </div>
  );
}

function ImpactRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-3" style={{ borderBottom: `1px solid rgba(87,177,255,0.06)` }}>
      <span style={{ fontSize: 13, color: colors.textSecondary }}>{label}</span>
      <span style={{ fontSize: 13, color: colors.textPrimary }}>{value}</span>
    </div>
  );
}

/* ================================================================
   TAB 2: RISKS — matches design screen exactly
   ================================================================ */

function TabRisks({ asset, assetId, highlightId }: { asset: Asset | null; assetId: string; highlightId: string | null }) {
  const risks = useMemo(() => getRisks(assetId), [assetId]);
  const [search, setSearch] = useState("");
  const [page, setPage] = usePageJump(risks, 5, highlightId);
  const PAGE = 5;
  const rowRef = useScrollToHighlight(highlightId);

  const filtered = useMemo(() => {
    if (!search) return risks;
    const s = search.toLowerCase();
    return risks.filter(r => r.message.toLowerCase().includes(s) || r.mainCategory.toLowerCase().includes(s));
  }, [risks, search]);

  const totalPages = Math.ceil(filtered.length / PAGE);
  const paged = filtered.slice(page * PAGE, (page + 1) * PAGE);

  const sev = asset?.severity || "critical";
  const sevColor = SEV_COLOR[sev] || "#ff4d4f";

  return (
    <div className="p-6 flex flex-col gap-5">
      {/* ── Asset Overview ── */}
      <div>
        <span style={{ fontSize: 16, fontWeight: 700, color: colors.textPrimary, display: "block", marginBottom: 16 }}>Asset Overview</span>
        <div className="flex items-start gap-12 flex-wrap">
          <div className="flex flex-col gap-1">
            <span style={{ fontSize: 12, color: colors.textMuted }}>Overall Risk</span>
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold capitalize"
              style={{ backgroundColor: `${sevColor}18`, color: sevColor, border: `1px solid ${sevColor}40` }}>
              {sev}
            </span>
          </div>
          <MetricInline label="Risk Score" value={String(asset?.riskScore ?? 10)} />
          <MetricInline label="Misconfigurations" value={String(asset?.misconfigurationCount ?? 0)} />
          <MetricInline label="Vulnerabilities" value={String(asset?.vulnerabilityCount ?? 0)} />
          <MetricInline label="Last Scanned" value={asset?.lastScanned || "2026-02-04"} />
        </div>
      </div>

      {/* ── Export button ── */}
      <button className="flex items-center gap-2 px-4 py-2 rounded-lg border self-start transition-colors hover:bg-[rgba(87,177,255,0.06)]"
        style={{ borderColor: colors.buttonPrimary, color: colors.accent, fontSize: 13, background: "none", cursor: "pointer" }}>
        <Download size={14} strokeWidth={2} /> Export risks report
      </button>

      {/* ── Associated Risks & Mitigation ── */}
      <div>
        <span style={{ fontSize: 16, fontWeight: 700, color: colors.textPrimary, display: "block", marginBottom: 12 }}>Associated Risks & Mitigation</span>
        <SearchBox value={search} onChange={v => { setSearch(v); setPage(0); }} placeholder="Search" />
      </div>

      <div style={{ overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${colors.border}` }}>
              <ThPlain>Main Category</ThPlain>
              <ThPlain wide>Message</ThPlain>
              <ThPlain>Sub Category</ThPlain>
              <ThPlain>Risk Owner</ThPlain>
              <ThSortable label="Risk Class" />
              <ThPlain>Last Updated</ThPlain>
            </tr>
          </thead>
          <tbody>
            {paged.map(r => {
              const isHL = highlightId === r.id;
              return (
                <tr key={r.id} ref={isHL ? rowRef : undefined}
                  style={{ borderBottom: `1px solid rgba(87,177,255,0.06)`, ...(isHL ? HIGHLIGHT_ROW_STYLE : {}) }}>
                  <TdCell>
                    <span style={{ fontSize: 12, color: colors.textSecondary }}>{r.mainCategory}</span>
                    {isHL && <InvestigationTag />}
                  </TdCell>
                  <TdCell>
                    <span style={{ fontSize: 12, color: colors.textMuted, display: "block", lineHeight: 1.5 }}>{r.message}</span>
                  </TdCell>
                  <TdCell><span style={{ fontSize: 12, color: colors.textSecondary }}>{r.subCategory}</span></TdCell>
                  <TdCell>
                    <div className="flex items-center gap-1 px-2 py-1 rounded" style={{ backgroundColor: "rgba(87,177,255,0.03)", border: `1px solid ${colors.border}`, width: "fit-content" }}>
                      <span style={{ fontSize: 11, color: colors.textDim }}>{r.riskOwner || "Select Owner"}</span>
                      <ChevronDown size={10} color={colors.textDim} />
                    </div>
                  </TdCell>
                  <TdCell><SevBadge severity={r.riskClass} /></TdCell>
                  <TdCell><span style={{ fontSize: 12, color: colors.textSecondary }}>{r.lastUpdated}</span></TdCell>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && <PaginationBar page={page} total={totalPages} onChange={setPage} />}
    </div>
  );
}

function MetricInline({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span style={{ fontSize: 12, color: colors.textMuted }}>{label}</span>
      <span style={{ fontSize: 14, fontWeight: 600, color: colors.textPrimary }}>{value}</span>
    </div>
  );
}

/* ================================================================
   TAB 3: VULNERABILITIES — matches design screen exactly
   ================================================================ */

function TabVulnerabilities({ assetId, highlightId }: { assetId: string; highlightId: string | null }) {
  const all = useMemo(() => getVulnerabilities(assetId), [assetId]);
  const [search, setSearch] = useState("");
  const [page, setPage] = usePageJump(all, 7, highlightId);
  const PAGE = 7;
  const rowRef = useScrollToHighlight(highlightId);

  const filtered = useMemo(() => {
    if (!search) return all;
    const s = search.toLowerCase();
    return all.filter(v => v.name.toLowerCase().includes(s) || v.description.toLowerCase().includes(s));
  }, [all, search]);

  const totalPages = Math.ceil(filtered.length / PAGE);
  const paged = filtered.slice(page * PAGE, (page + 1) * PAGE);

  return (
    <div className="p-6 flex flex-col gap-4">
      <SearchBox value={search} onChange={v => { setSearch(v); setPage(0); }} placeholder="Search" />

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ borderBottom: `1px solid ${colors.border}` }}>
            <ThPlain>Vulnerability</ThPlain>
            <ThPlain wide>Description</ThPlain>
            <ThSortable label="CVSS Score" />
            <ThSortable label="KEV" />
            <ThSortable label="Severity" />
            <ThSortable label="Published" />
            <ThPlain>Source</ThPlain>
            <ThSortable label="First Seen" />
          </tr>
        </thead>
        <tbody>
          {paged.map(v => {
            const isHL = highlightId === v.id;
            return (
              <tr key={v.id} ref={isHL ? rowRef : undefined}
                style={{ borderBottom: `1px solid rgba(87,177,255,0.06)`, ...(isHL ? HIGHLIGHT_ROW_STYLE : {}) }}>
                <TdCell>
                  <span style={{ fontSize: 12, color: colors.textSecondary, fontFamily: "'SF Mono','Fira Code',monospace" }}>{v.name}</span>
                  {isHL && <InvestigationTag />}
                </TdCell>
                <TdCell><span style={{ fontSize: 12, color: colors.textMuted, lineHeight: 1.5 }}>{v.description}</span></TdCell>
                <TdCell><span style={{ fontSize: 12, color: colors.textSecondary }}>{v.cvssScore != null ? v.cvssScore.toFixed(1) : "N/A"}</span></TdCell>
                <TdCell><span style={{ fontSize: 12, color: colors.textSecondary }}>{v.kev ? "true" : "false"}</span></TdCell>
                <TdCell><SevBadge severity={v.severity} /></TdCell>
                <TdCell><span style={{ fontSize: 12, color: colors.textSecondary }}>{v.published}</span></TdCell>
                <TdCell><span style={{ fontSize: 12, color: colors.textSecondary }}>{v.source}</span></TdCell>
                <TdCell><span style={{ fontSize: 11, color: colors.textDim }}>{v.firstSeen}</span></TdCell>
              </tr>
            );
          })}
          {paged.length === 0 && (
            <tr><td colSpan={8} style={{ padding: 40, textAlign: "center", color: colors.textDim, fontSize: 12 }}>No vulnerabilities found</td></tr>
          )}
        </tbody>
      </table>

      {totalPages > 1 && <PaginationBar page={page} total={totalPages} onChange={setPage} />}
    </div>
  );
}

/* ================================================================
   TAB 4: MISCONFIGURATIONS — matches design screen exactly
   ================================================================ */

function TabMisconfigurations({ assetId, highlightId }: { assetId: string; highlightId: string | null }) {
  const all = useMemo(() => getMisconfigurations(assetId), [assetId]);
  const [search, setSearch] = useState("");
  const rowRef = useScrollToHighlight(highlightId);

  const filtered = useMemo(() => {
    if (!search) return all;
    const s = search.toLowerCase();
    return all.filter(m => m.name.toLowerCase().includes(s) || m.compliance.toLowerCase().includes(s));
  }, [all, search]);

  return (
    <div className="p-6 flex flex-col gap-4">
      <SearchBox value={search} onChange={setSearch} placeholder="Search" />

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ borderBottom: `1px solid ${colors.border}` }}>
            <ThPlain>Misconfigurations</ThPlain>
            <ThPlain>Remediation</ThPlain>
            <ThPlain>Compliance</ThPlain>
            <ThSortable label="Severity" />
          </tr>
        </thead>
        <tbody>
          {filtered.map(m => {
            const isHL = highlightId === m.id;
            return (
              <tr key={m.id} ref={isHL ? rowRef : undefined}
                style={{ borderBottom: `1px solid rgba(87,177,255,0.06)`, ...(isHL ? HIGHLIGHT_ROW_STYLE : {}) }}>
                <TdCell>
                  <span style={{ fontSize: 12, color: colors.textSecondary, lineHeight: 1.5 }}>{m.name}</span>
                  {isHL && <InvestigationTag />}
                </TdCell>
                <TdCell><span style={{ fontSize: 12, color: colors.textMuted, lineHeight: 1.5 }}>{m.remediation}</span></TdCell>
                <TdCell><span style={{ fontSize: 12, color: colors.textSecondary }}>{m.compliance}</span></TdCell>
                <TdCell><SevBadge severity={m.severity} /></TdCell>
              </tr>
            );
          })}
          {filtered.length === 0 && (
            <tr><td colSpan={4} style={{ padding: 40, textAlign: "center", color: colors.textDim, fontSize: 12 }}>No misconfigurations found</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

/* ================================================================
   TAB 5: SOFTWARES — matches design screen exactly
   ================================================================ */

function TabSoftwares({ assetId }: { assetId: string }) {
  const all = useMemo(() => getSoftware(assetId), [assetId]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const PAGE = 10;

  const filtered = useMemo(() => {
    if (!search) return all;
    const s = search.toLowerCase();
    return all.filter(sw => sw.name.toLowerCase().includes(s) || sw.vendor.toLowerCase().includes(s));
  }, [all, search]);

  const totalPages = Math.ceil(filtered.length / PAGE);
  const paged = filtered.slice(page * PAGE, (page + 1) * PAGE);

  return (
    <div className="p-6 flex flex-col gap-4">
      <SearchBox value={search} onChange={v => { setSearch(v); setPage(0); }} placeholder="Search" />

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ borderBottom: `1px solid ${colors.border}` }}>
            <ThPlain>Name</ThPlain>
            <ThPlain wide>Description</ThPlain>
            <ThPlain wide>Vendor</ThPlain>
            <ThPlain>Architecture</ThPlain>
            <ThPlain>Size</ThPlain>
            <ThPlain>Version</ThPlain>
          </tr>
        </thead>
        <tbody>
          {paged.map(sw => (
            <tr key={sw.id} style={{ borderBottom: `1px solid rgba(87,177,255,0.06)` }}>
              <TdCell><span style={{ fontSize: 12, fontWeight: 500, color: colors.textPrimary }}>{sw.name}</span></TdCell>
              <TdCell><span style={{ fontSize: 12, color: colors.textMuted }}>{sw.description}</span></TdCell>
              <TdCell><span style={{ fontSize: 12, color: colors.textMuted }}>{sw.vendor}</span></TdCell>
              <TdCell><span style={{ fontSize: 12, color: colors.textSecondary }}>{sw.architecture}</span></TdCell>
              <TdCell><span style={{ fontSize: 12, color: colors.textSecondary }}>{sw.size}</span></TdCell>
              <TdCell><span style={{ fontSize: 12, color: colors.textSecondary }}>{sw.version}</span></TdCell>
            </tr>
          ))}
          {paged.length === 0 && (
            <tr><td colSpan={6} style={{ padding: 40, textAlign: "center", color: colors.textDim, fontSize: 12 }}>No software found</td></tr>
          )}
        </tbody>
      </table>

      {totalPages > 1 && <PaginationBar page={page} total={totalPages} onChange={setPage} />}
    </div>
  );
}

/* ================================================================
   SHARED PRIMITIVES
   ================================================================ */

/* Small tag rendered next to a highlighted record from attack path */
function InvestigationTag() {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded ml-2" style={{
      backgroundColor: "rgba(255,122,26,0.10)",
      border: "1px solid rgba(255,122,26,0.22)",
      fontSize: 10,
      fontWeight: 600,
      color: "#ff7a1a",
      whiteSpace: "nowrap",
      verticalAlign: "middle",
    }}>
      <Shield size={8} color="#ff7a1a" strokeWidth={2.5} />
      From Attack Path Investigation
    </span>
  );
}

/* Hook: scroll to the highlighted row once it's rendered */
function useScrollToHighlight(highlightId: string | null) {
  const rowRef = useRef<HTMLTableRowElement | null>(null);
  const scrolledRef = useRef(false);

  useEffect(() => {
    if (!highlightId) return;
    scrolledRef.current = false;
  }, [highlightId]);

  useEffect(() => {
    if (!highlightId || scrolledRef.current || !rowRef.current) return;
    scrolledRef.current = true;
    const timer = setTimeout(() => {
      rowRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 120);
    return () => clearTimeout(timer);
  });

  return rowRef;
}

/* Compute which page a record lives on and jump there */
function usePageJump<T extends { id: string }>(allItems: T[], pageSize: number, highlightId: string | null): [number, (p: number) => void] {
  const idx = highlightId ? allItems.findIndex(i => i.id === highlightId) : -1;
  const initialPage = idx >= 0 ? Math.floor(idx / pageSize) : 0;
  const [page, setPage] = useState(initialPage);
  return [page, setPage];
}

/* Highlighted row style */
const HIGHLIGHT_ROW_STYLE: React.CSSProperties = {
  backgroundColor: "rgba(255,122,26,0.04)",
  borderLeftWidth: 3,
  borderLeftStyle: "solid",
  borderLeftColor: "#ff7a1a",
};

function SearchBox({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <div className="flex items-center gap-2 px-3 py-[7px] rounded-lg border w-[220px]"
      style={{ borderColor: colors.border, backgroundColor: "transparent" }}>
      <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        className="flex-1 bg-transparent outline-none text-[12px]" style={{ color: colors.textPrimary }} />
      <Search size={14} color={colors.textDim} strokeWidth={2} />
    </div>
  );
}

function ThPlain({ children, wide }: { children: React.ReactNode; wide?: boolean }) {
  return (
    <th style={{
      padding: "12px 16px", textAlign: "left", fontSize: 12, fontWeight: 500,
      color: colors.textMuted, whiteSpace: "nowrap",
      ...(wide ? { minWidth: 200 } : {}),
    }}>{children}</th>
  );
}

function ThSortable({ label }: { label: string }) {
  return (
    <th style={{
      padding: "12px 16px", textAlign: "left", fontSize: 12, fontWeight: 500,
      color: colors.textMuted, whiteSpace: "nowrap", cursor: "pointer",
    }}>
      <div className="flex items-center gap-1">
        {label}
        <ArrowUpDown size={12} style={{ opacity: 0.3 }} />
      </div>
    </th>
  );
}

function TdCell({ children }: { children: React.ReactNode }) {
  return <td style={{ padding: "14px 16px", verticalAlign: "top" }}>{children}</td>;
}

function SevBadge({ severity }: { severity: string }) {
  const c = SEV_COLOR[severity] || colors.textDim;
  return (
    <span className="inline-flex items-center px-2.5 py-1 rounded text-[11px] font-semibold capitalize"
      style={{ backgroundColor: `${c}18`, color: c }}>
      {severity}
    </span>
  );
}

function PaginationBar({ page, total, onChange }: { page: number; total: number; onChange: (p: number) => void }) {
  return (
    <div className="flex items-center justify-center gap-2 mt-2">
      <button onClick={() => onChange(page - 1)} disabled={page === 0}
        style={{ width: 30, height: 30, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", cursor: page === 0 ? "default" : "pointer", border: `1px solid ${colors.border}`, backgroundColor: "transparent", color: page === 0 ? colors.textDim : colors.textSecondary, opacity: page === 0 ? 0.4 : 1 }}>
        <ChevronLeft size={14} />
      </button>
      <span style={{ fontSize: 12, color: colors.textSecondary, minWidth: 70, textAlign: "center" }}>{page + 1}{" "}of {total}</span>
      <button onClick={() => onChange(page + 1)} disabled={page >= total - 1}
        style={{ width: 30, height: 30, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", cursor: page >= total - 1 ? "default" : "pointer", border: `1px solid ${colors.border}`, backgroundColor: "transparent", color: page >= total - 1 ? colors.textDim : colors.textSecondary, opacity: page >= total - 1 ? 0.4 : 1 }}>
        <ChevronRight size={14} />
      </button>
    </div>
  );
}