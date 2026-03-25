import {
  useState, useMemo, useEffect, useRef, useCallback,
} from "react";
import { useNavigate } from "react-router";
import { Activity, Shield, X, ExternalLink } from "lucide-react";
import { AssetNodeCard, assetRiskLevel } from "./AssetNodeCard";
import { useAssetRegisterData } from "../hooks/useAssetRegisterData";
import { groupByAccountAndRegion } from "../utils/assetTransforms";
import type { Asset } from "../data/assetTypes";

/* ═══════════════════════════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════════════════════════ */

function computeArn(asset: Asset): string {
  const svc = asset.service.toLowerCase().replace(/\s+/g, "_");
  if (asset.vendor === "AWS")
    return `arn:aws:${svc}:${asset.region}:123456789012:${asset.id}`;
  if (asset.vendor === "Azure")
    return `/subscriptions/a1b2c3/resourceGroups/${asset.account}/providers/Microsoft.${svc}/${asset.id}`;
  return `projects/my-project/regions/${asset.region}/${svc}/${asset.id}`;
}

const SEV_LABEL = ["Low", "Medium", "High", "Critical"] as const;
type SevStyle = { bg: string; color: string; border: string };
const SEV_STYLE: Record<0 | 1 | 2 | 3, SevStyle> = {
  0: { bg: "rgba(52,211,153,0.12)",  color: "#6ee7b7", border: "1px solid rgba(52,211,153,0.25)" },
  1: { bg: "rgba(250,204,21,0.12)",  color: "#fde68a", border: "1px solid rgba(250,204,21,0.25)" },
  2: { bg: "rgba(249,115,22,0.12)",  color: "#fdba74", border: "1px solid rgba(249,115,22,0.25)" },
  3: { bg: "rgba(239,68,68,0.12)",   color: "#fca5a5", border: "1px solid rgba(239,68,68,0.25)"  },
};

/* ═══════════════════════════════════════════════════════════════
   ASSET MODAL
═══════════════════════════════════════════════════════════════ */

function AssetModal({ asset, anchorRect, onClose, onNavigate }: {
  asset: Asset;
  anchorRect: DOMRect;
  onClose: () => void;
  onNavigate: (id: string) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const risk = assetRiskLevel(asset);
  const arn  = computeArn(asset);
  const sevStyle = SEV_STYLE[risk];

  /* Position: prefer right of anchor, flip left if out of bounds */
  const W = 272, H = 340;
  let left = anchorRect.right + 10;
  let top  = anchorRect.top - 8;
  if (left + W > window.innerWidth - 12) left = anchorRect.left - W - 10;
  if (left < 12) left = 12;
  if (top + H > window.innerHeight - 12) top = window.innerHeight - H - 12;
  if (top < 12) top = 12;

  /* Close on outside click */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) onClose();
    };
    const tid = window.setTimeout(() => document.addEventListener("mousedown", handler), 50);
    return () => {
      window.clearTimeout(tid);
      document.removeEventListener("mousedown", handler);
    };
  }, [onClose]);

  const vulnCount     = asset.vulnerabilities.critical + asset.vulnerabilities.high;
  const misconfigCount = asset.misconfig.critical + asset.misconfig.high;

  return (
    <div
      ref={ref}
      style={{
        position: "fixed",
        left, top, width: W,
        zIndex: 200,
        background: "linear-gradient(160deg, #0c1e33 0%, #060f1d 100%)",
        border: "1px solid rgba(87,177,255,0.16)",
        borderRadius: 12,
        boxShadow: "0 24px 60px rgba(0,0,0,0.75), 0 0 0 1px rgba(87,177,255,0.05)",
        padding: 16,
        backdropFilter: "blur(12px)",
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 5 }}>
            <span style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              {asset.type}
            </span>
            <span style={{
              ...sevStyle,
              fontSize: 10, fontWeight: 700,
              padding: "2px 7px", borderRadius: 5,
            }}>
              {SEV_LABEL[risk]}
            </span>
          </div>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {asset.service}
          </div>
        </div>
        <button
          onClick={onClose}
          style={{
            marginLeft: 8, flexShrink: 0,
            width: 24, height: 24,
            borderRadius: 6, border: "none", background: "transparent",
            cursor: "pointer", color: "rgba(255,255,255,0.35)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
          onMouseEnter={e => { (e.currentTarget).style.background = "rgba(255,255,255,0.08)"; (e.currentTarget).style.color = "rgba(255,255,255,0.7)"; }}
          onMouseLeave={e => { (e.currentTarget).style.background = "transparent"; (e.currentTarget).style.color = "rgba(255,255,255,0.35)"; }}
        >
          <X size={13} />
        </button>
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: "rgba(255,255,255,0.06)", marginBottom: 12 }} />

      {/* Fields */}
      {[
        { label: "Name",       value: asset.name,   mono: false },
        { label: "ARN",        value: arn,           mono: true  },
        { label: "Private IP", value: "—",           mono: false },
        { label: "Region",     value: asset.region,  mono: false },
      ].map(({ label, value, mono }) => (
        <div key={label} style={{ marginBottom: 9 }}>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.32)", marginBottom: 2 }}>{label}</div>
          <div
            style={{
              fontSize: mono ? 10 : 11,
              fontFamily: mono ? "'SF Mono','Fira Code',monospace" : undefined,
              color: "rgba(255,255,255,0.75)",
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            }}
            title={value}
          >
            {value}
          </div>
        </div>
      ))}

      {/* Counts row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, margin: "12px 0" }}>
        <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 8, padding: "10px 12px" }}>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", marginBottom: 4 }}>Misconfigurations</div>
          <div style={{ fontSize: 22, fontWeight: 700, lineHeight: 1, color: misconfigCount > 0 ? "#facc15" : "rgba(255,255,255,0.5)" }}>
            {misconfigCount}
          </div>
        </div>
        <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 8, padding: "10px 12px" }}>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", marginBottom: 4 }}>Vulnerabilities</div>
          <div style={{ fontSize: 22, fontWeight: 700, lineHeight: 1, color: vulnCount > 0 ? "#fb923c" : "rgba(255,255,255,0.5)" }}>
            {vulnCount}
          </div>
        </div>
      </div>

      {/* CTA */}
      <button
        onClick={() => onNavigate(asset.id)}
        style={{
          width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
          padding: "8px 12px", borderRadius: 8,
          background: "rgba(87,177,255,0.08)",
          border: "1px solid rgba(87,177,255,0.22)",
          color: "#57b1ff", fontSize: 12, fontWeight: 600,
          cursor: "pointer",
        }}
        onMouseEnter={e => { (e.currentTarget).style.background = "rgba(87,177,255,0.16)"; }}
        onMouseLeave={e => { (e.currentTarget).style.background = "rgba(87,177,255,0.08)"; }}
      >
        <ExternalLink size={11} />
        View Asset Details
      </button>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   TOGGLE SWITCH
═══════════════════════════════════════════════════════════════ */

function ToggleSwitch({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      style={{ position: "relative", width: 28, height: 16, background: "none", border: "none", padding: 0, cursor: "pointer", flexShrink: 0 }}
    >
      <span style={{
        display: "block", width: "100%", height: "100%", borderRadius: 999,
        background: checked ? "rgba(87,177,255,0.65)" : "rgba(255,255,255,0.14)",
        transition: "background 140ms",
      }} />
      <span style={{
        position: "absolute", top: 2,
        left: checked ? 14 : 2,
        width: 12, height: 12, borderRadius: "50%",
        background: checked ? "#fff" : "rgba(255,255,255,0.55)",
        transition: "left 140ms",
        boxShadow: "0 1px 3px rgba(0,0,0,0.45)",
      }} />
    </button>
  );
}

/* ═══════════════════════════════════════════════════════════════
   VENDOR GROUP BUILDER
═══════════════════════════════════════════════════════════════ */

const VENDOR_STYLE: Record<string, { border: string; dot: string; label: string; groupBg: string }> = {
  AWS:   { border: "1px solid rgba(251,146,60,0.22)", dot: "#fb923c", label: "#fb923c", groupBg: "rgba(251,146,60,0.03)" },
  Azure: { border: "1px solid rgba(96,165,250,0.22)", dot: "#60a5fa", label: "#60a5fa", groupBg: "rgba(96,165,250,0.03)"  },
  GCP:   { border: "1px solid rgba(74,222,128,0.22)", dot: "#4ade80", label: "#4ade80", groupBg: "rgba(74,222,128,0.03)"  },
};

type VendorGroup = {
  vendor: string;
  accounts: { name: string; regions: { name: string; assets: Asset[] }[] }[];
};

function buildVendorGroups(groupedDiagram: Record<string, Record<string, Asset[]>>): VendorGroup[] {
  const map: Record<string, VendorGroup> = {};
  Object.entries(groupedDiagram).forEach(([account, regions]) => {
    const vendor = (Object.values(regions)[0] ?? [])[0]?.vendor ?? "AWS";
    if (!map[vendor]) map[vendor] = { vendor, accounts: [] };
    map[vendor].accounts.push({
      name: account,
      regions: Object.entries(regions).map(([name, assets]) => ({ name, assets })),
    });
  });
  return ["AWS", "Azure", "GCP"].filter(v => map[v]).map(v => map[v]);
}

/* ═══════════════════════════════════════════════════════════════
   EDGE BUILDER
   Uses getBoundingClientRect relative to the scrollable container
   to produce (x,y) in the content coordinate space for the SVG.
═══════════════════════════════════════════════════════════════ */

interface Edge { x1: number; y1: number; x2: number; y2: number }

function buildEdges(
  groupedDiagram: Record<string, Record<string, Asset[]>>,
  container: HTMLElement,
): Edge[] {
  const edges: Edge[] = [];
  const ctRect  = container.getBoundingClientRect();
  const scrollTop  = container.scrollTop;
  const scrollLeft = container.scrollLeft;

  const center = (id: string): { x: number; y: number } | null => {
    const el = container.querySelector(`[data-asset-id="${id}"]`);
    if (!el) return null;
    const r = (el as HTMLElement).getBoundingClientRect();
    return {
      x: r.left - ctRect.left + scrollLeft + r.width  / 2,
      y: r.top  - ctRect.top  + scrollTop  + r.height / 2,
    };
  };

  Object.entries(groupedDiagram).forEach(([_acct, regions]) => {
    const regionList = Object.values(regions);

    // Within each region: ring topology, capped at 8 nodes
    regionList.forEach(assets => {
      const nodes = assets.slice(0, 8);
      if (nodes.length < 2) return;
      for (let i = 0; i < nodes.length; i++) {
        const a = center(nodes[i].id);
        const b = center(nodes[(i + 1) % nodes.length].id);
        if (a && b) edges.push({ x1: a.x, y1: a.y, x2: b.x, y2: b.y });
      }
    });

    // Between regions: connect first-node of each region (account backbone)
    const anchors = regionList.map(a => a[0]).filter(Boolean);
    for (let i = 0; i < anchors.length - 1; i++) {
      const a = center(anchors[i].id);
      const b = center(anchors[i + 1].id);
      if (a && b) edges.push({ x1: a.x, y1: a.y, x2: b.x, y2: b.y });
    }
  });

  return edges;
}

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════════ */

export interface SecurityDiagramProps {
  filteredIds?: Set<string>;
}

export function SecurityDiagram({ filteredIds }: SecurityDiagramProps = {}) {
  const navigate = useNavigate();
  const { assets } = useAssetRegisterData();

  const [dataFlow,     setDataFlow]     = useState(false);
  const [riskIndicator, setRiskIndicator] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [selectedRect,  setSelectedRect]  = useState<DOMRect | null>(null);
  const [edges,         setEdges]         = useState<Edge[]>([]);
  const [svgW, setSvgW] = useState(0);
  const [svgH, setSvgH] = useState(0);

  const contentRef = useRef<HTMLDivElement>(null);

  /* ── Filter to page selection ── */
  const displayAssets = useMemo(
    () => filteredIds ? assets.filter(a => filteredIds.has(a.id)) : assets,
    [assets, filteredIds]
  );

  const groupedDiagram = useMemo(
    () => groupByAccountAndRegion(displayAssets),
    [displayAssets]
  );

  const vendorGroups = useMemo(() => buildVendorGroups(groupedDiagram), [groupedDiagram]);

  /* ── Recompute SVG edges ── */
  const recompute = useCallback(() => {
    if (!dataFlow || !contentRef.current) {
      setEdges([]);
      return;
    }
    requestAnimationFrame(() => {
      if (!contentRef.current) return;
      setEdges(buildEdges(groupedDiagram, contentRef.current));
      setSvgW(contentRef.current.scrollWidth);
      setSvgH(contentRef.current.scrollHeight);
    });
  }, [dataFlow, groupedDiagram]);

  useEffect(() => { recompute(); }, [recompute]);

  useEffect(() => {
    const el = contentRef.current;
    if (!el || !dataFlow) return;
    el.addEventListener("scroll", recompute, { passive: true });
    return () => el.removeEventListener("scroll", recompute);
  }, [dataFlow, recompute]);

  useEffect(() => {
    if (!dataFlow) return;
    const obs = new ResizeObserver(recompute);
    if (contentRef.current) obs.observe(contentRef.current);
    return () => obs.disconnect();
  }, [dataFlow, recompute]);

  /* ── Asset selection ── */
  const handleSelect = useCallback((asset: Asset, rect: DOMRect) => {
    setSelectedAsset(prev => prev?.id === asset.id ? null : asset);
    setSelectedRect(rect);
  }, []);

  const handleClose = useCallback(() => {
    setSelectedAsset(null);
    setSelectedRect(null);
  }, []);

  const handleNavigate = useCallback((id: string) => {
    navigate(`/asset/${id}`);
  }, [navigate]);

  const isEmpty = displayAssets.length === 0;

  return (
    <>
      {/* ── Diagram canvas ── */}
      <div
        style={{
          position: "relative",
          borderRadius: 16,
          border: "1px solid rgba(255,255,255,0.07)",
          background: "radial-gradient(ellipse at 40% 0%, rgba(87,177,255,0.05) 0%, #050e1c 65%)",
          minHeight: 420,
          overflow: "hidden",
        }}
      >
        {/* Dot-grid background */}
        <div style={{
          position: "absolute", inset: 0, zIndex: 0, pointerEvents: "none",
          backgroundImage: "radial-gradient(rgba(255,255,255,0.055) 1px, transparent 1px)",
          backgroundSize: "22px 22px",
        }} />

        {/* Scrollable content area */}
        <div
          ref={contentRef}
          style={{
            position: "relative", zIndex: 1,
            overflowY: "auto", overflowX: "hidden",
            padding: 24,
            maxHeight: "calc(100vh - 240px)",
            minHeight: 420,
          }}
        >
          {/* SVG edge overlay */}
          {dataFlow && edges.length > 0 && (
            <svg
              style={{
                position: "absolute", top: 0, left: 0,
                width: svgW || "100%",
                height: svgH || "100%",
                pointerEvents: "none",
                zIndex: 2,
                overflow: "visible",
              }}
            >
              <defs>
                <linearGradient id="sdg-edge" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%"   stopColor="rgba(87,177,255,0)"   />
                  <stop offset="40%"  stopColor="rgba(87,177,255,0.22)" />
                  <stop offset="60%"  stopColor="rgba(87,177,255,0.22)" />
                  <stop offset="100%" stopColor="rgba(87,177,255,0)"   />
                </linearGradient>
              </defs>
              {edges.map((e, i) => (
                <line
                  key={i}
                  x1={e.x1} y1={e.y1} x2={e.x2} y2={e.y2}
                  stroke="url(#sdg-edge)"
                  strokeWidth={1.2}
                  strokeDasharray="5 8"
                  opacity={0.65}
                />
              ))}
            </svg>
          )}

          {/* Content */}
          {isEmpty ? (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 300, color: "rgba(255,255,255,0.28)", fontSize: 13 }}>
              No assets match the current filters.
            </div>
          ) : (
            <div style={{ position: "relative", zIndex: 3, display: "flex", flexDirection: "column", gap: 20 }}>
              {vendorGroups.map(vg => {
                const vs = VENDOR_STYLE[vg.vendor] ?? VENDOR_STYLE.AWS;
                const total = vg.accounts.reduce(
                  (s, a) => s + a.regions.reduce((r, reg) => r + reg.assets.length, 0), 0
                );
                return (
                  <div key={vg.vendor} style={{ border: vs.border, background: vs.groupBg, borderRadius: 14, padding: 18 }}>
                    {/* Vendor header */}
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                      <span style={{ width: 8, height: 8, borderRadius: "50%", background: vs.dot, display: "inline-block", flexShrink: 0 }} />
                      <span style={{ fontSize: 12, fontWeight: 700, color: vs.label, textTransform: "uppercase", letterSpacing: "0.09em" }}>
                        {vg.vendor}
                      </span>
                      <span style={{ fontSize: 11, color: "rgba(255,255,255,0.28)" }}>{total} assets</span>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      {vg.accounts.map(acc => (
                        <div key={acc.name} style={{
                          border: "1px solid rgba(255,255,255,0.055)",
                          background: "rgba(0,0,0,0.22)",
                          borderRadius: 10, padding: 14,
                        }}>
                          <div style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.65)", marginBottom: 11 }}>
                            {acc.name}
                          </div>

                          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 10 }}>
                            {acc.regions.map(reg => (
                              <div key={reg.name} style={{
                                border: "1px solid rgba(255,255,255,0.045)",
                                background: "rgba(9,21,37,0.55)",
                                borderRadius: 9, padding: 12,
                              }}>
                                {/* Region pill */}
                                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                                  <span style={{
                                    fontSize: 10, fontWeight: 500,
                                    color: "rgba(255,255,255,0.48)",
                                    background: "rgba(255,255,255,0.045)",
                                    padding: "2px 8px", borderRadius: 4,
                                    letterSpacing: "0.04em",
                                  }}>
                                    {reg.name}
                                  </span>
                                  <span style={{ fontSize: 10, color: "rgba(255,255,255,0.22)" }}>
                                    {reg.assets.length}
                                  </span>
                                </div>

                                {/* Asset cards */}
                                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                                  {reg.assets.map(asset => (
                                    <AssetNodeCard
                                      key={asset.id}
                                      asset={asset}
                                      riskIndicatorEnabled={riskIndicator}
                                      onSelect={handleSelect}
                                      isSelected={selectedAsset?.id === asset.id}
                                    />
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── Asset modal ── */}
      {selectedAsset && selectedRect && (
        <AssetModal
          asset={selectedAsset}
          anchorRect={selectedRect}
          onClose={handleClose}
          onNavigate={handleNavigate}
        />
      )}

      {/* ── Sticky bottom-right toggle bar ── */}
      <div style={{
        position: "fixed",
        bottom: 16, right: 24,
        zIndex: 100,
        display: "flex", alignItems: "center", gap: 12,
        background: "rgba(4,12,24,0.93)",
        border: "1px solid rgba(87,177,255,0.13)",
        borderRadius: 999,
        padding: "7px 16px 7px 14px",
        backdropFilter: "blur(14px)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.55), 0 0 0 1px rgba(87,177,255,0.05)",
      }}>
        {/* Data flow toggle */}
        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
          <Activity size={12} style={{ color: dataFlow ? "#67e8f9" : "rgba(255,255,255,0.32)", flexShrink: 0 }} />
          <span style={{ fontSize: 11, fontWeight: 500, color: dataFlow ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.38)", whiteSpace: "nowrap" }}>
            Data flow
          </span>
          <ToggleSwitch checked={dataFlow} onChange={setDataFlow} />
        </div>

        <div style={{ width: 1, height: 16, background: "rgba(255,255,255,0.08)", flexShrink: 0 }} />

        {/* Risk indicator toggle */}
        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
          <Shield size={12} style={{ color: riskIndicator ? "#f87171" : "rgba(255,255,255,0.32)", flexShrink: 0 }} />
          <span style={{ fontSize: 11, fontWeight: 500, color: riskIndicator ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.38)", whiteSpace: "nowrap" }}>
            Risk Indicator
          </span>
          <ToggleSwitch checked={riskIndicator} onChange={setRiskIndicator} />
        </div>

        <div style={{ width: 1, height: 16, background: "rgba(255,255,255,0.08)", flexShrink: 0 }} />

        {/* Asset count */}
        <span style={{ fontSize: 10, color: "rgba(255,255,255,0.22)" }}>
          {displayAssets.length}
        </span>
      </div>
    </>
  );
}
