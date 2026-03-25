import { useRef } from "react";
import {
  Server, Database, Archive, Network, Shield, Zap,
  Layers, Monitor, Globe, Bell, Scale, Cloud,
} from "lucide-react";
import type { Asset } from "../data/assetTypes";

/* ── Service icon config ── */
type IconCfg = { Icon: React.ComponentType<{ size?: number; style?: React.CSSProperties }>; bg: string; color: string };

function getServiceIcon(service: string, type: Asset["type"]): IconCfg {
  const s = service.toLowerCase();

  if (s.includes("ec2") || s.includes("vm instance") || s.includes("virtual machine") || s.includes("compute engine") || s.includes("lightsail") || s.includes("beanstalk") || s.includes("gke node") || s.includes("app engine") || s.includes("vm scale"))
    return { Icon: Server, bg: "rgba(59,130,246,0.18)", color: "#93c5fd" };

  if (s.includes("s3") || s.includes("blob") || s.includes("cloud storage") || s.includes("artifact"))
    return { Icon: Archive, bg: "rgba(14,165,233,0.18)", color: "#7dd3fc" };

  if (s.includes("rds") || s.includes("dynamo") || s.includes("cosmos") || s.includes("postgres") || s.includes("mysql") || s.includes("redis") || s.includes("sql") || s.includes("firestore") || s.includes("bigquery") || s.includes("redshift") || s.includes("spanner") || s.includes("elasticache") || s.includes("aurora"))
    return { Icon: Database, bg: "rgba(139,92,246,0.18)", color: "#c4b5fd" };

  if (s.includes("vpc") || s.includes("vnet") || s.includes("subnet") || s.includes("security group") || s.includes("nsg") || s.includes("transit") || s.includes("route 53") || s.includes("cloud dns") || s.includes("dns") || s.includes("vnet gateway"))
    return { Icon: Network, bg: "rgba(34,197,94,0.18)", color: "#86efac" };

  if (s.includes("load balancer") || s.includes("balancer"))
    return { Icon: Scale, bg: "rgba(34,197,94,0.15)", color: "#6ee7b7" };

  if (s.includes("eks") || s.includes("aks") || s.includes("gke") || s.includes("cluster") || s.includes("fargate") || s.includes("ecs") || s.includes("kubernetes"))
    return { Icon: Layers, bg: "rgba(6,182,212,0.18)", color: "#67e8f9" };

  if (s.includes("lambda") || s.includes("function") || s.includes("cloud run") || s.includes("app service"))
    return { Icon: Zap, bg: "rgba(234,179,8,0.18)", color: "#fde68a" };

  if (s.includes("cloudtrail") || s.includes("iam") || s.includes("sso") || s.includes("entra") || s.includes("key vault") || s.includes("service account"))
    return { Icon: Shield, bg: "rgba(245,158,11,0.18)", color: "#fcd34d" };

  if (s.includes("endpoint") || s.includes("jump host") || s.includes("corp") || s.includes("macbook") || s.includes("laptop") || s.includes("cloudwatch"))
    return { Icon: Monitor, bg: "rgba(249,115,22,0.18)", color: "#fdba74" };

  if (s.includes("api gateway") || s.includes("cloudfront") || s.includes("cdn"))
    return { Icon: Globe, bg: "rgba(99,102,241,0.18)", color: "#a5b4fc" };

  if (s.includes("sns") || s.includes("sqs") || s.includes("pub/sub") || s.includes("pubsub"))
    return { Icon: Bell, bg: "rgba(236,72,153,0.18)", color: "#f9a8d4" };

  /* fallback by type */
  switch (type) {
    case "Server":          return { Icon: Server,  bg: "rgba(59,130,246,0.18)",  color: "#93c5fd" };
    case "Database":        return { Icon: Database, bg: "rgba(139,92,246,0.18)", color: "#c4b5fd" };
    case "Cloud Resource":  return { Icon: Cloud,   bg: "rgba(14,165,233,0.18)",  color: "#7dd3fc" };
    case "Endpoint":        return { Icon: Monitor, bg: "rgba(249,115,22,0.18)",  color: "#fdba74" };
    case "Network":         return { Icon: Network, bg: "rgba(34,197,94,0.18)",   color: "#86efac" };
    default:                return { Icon: Cloud,   bg: "rgba(255,255,255,0.08)", color: "#94a3b8" };
  }
}

/* ── Risk level ── */
export type RiskLevel = 0 | 1 | 2 | 3;

export function assetRiskLevel(asset: Asset): RiskLevel {
  const crit = asset.vulnerabilities.critical + asset.misconfig.critical;
  const high = asset.vulnerabilities.high + asset.misconfig.high;
  if (crit >= 2) return 3;
  if (crit >= 1) return 2;
  if (high >= 3) return 1;
  return 0;
}

const RISK_BORDER: Record<RiskLevel, string> = {
  0: "rgba(255,255,255,0.08)",
  1: "rgba(250,204,21,0.45)",
  2: "rgba(249,115,22,0.55)",
  3: "rgba(239,68,68,0.65)",
};

const RISK_GLOW: Record<RiskLevel, string> = {
  0: "none",
  1: "0 0 8px 1px rgba(250,204,21,0.28)",
  2: "0 0 10px 2px rgba(249,115,22,0.38)",
  3: "0 0 14px 3px rgba(239,68,68,0.45)",
};

const RISK_BADGE_STYLE: Record<RiskLevel, React.CSSProperties> = {
  0: { background: "rgba(52,211,153,0.12)", color: "#6ee7b7", border: "1px solid rgba(52,211,153,0.2)" },
  1: { background: "rgba(250,204,21,0.12)", color: "#fde68a", border: "1px solid rgba(250,204,21,0.2)" },
  2: { background: "rgba(249,115,22,0.12)", color: "#fdba74", border: "1px solid rgba(249,115,22,0.2)" },
  3: { background: "rgba(239,68,68,0.12)",  color: "#fca5a5", border: "1px solid rgba(239,68,68,0.2)"  },
};

const RISK_LABEL: Record<RiskLevel, string> = { 0: "Safe", 1: "Low", 2: "High", 3: "Critical" };

/* ── Component ── */
export type AssetNodeCardProps = {
  asset: Asset;
  riskIndicatorEnabled: boolean;
  onSelect: (asset: Asset, rect: DOMRect) => void;
  isSelected?: boolean;
};

export function AssetNodeCard({ asset, riskIndicatorEnabled, onSelect, isSelected }: AssetNodeCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const vulnCount    = asset.vulnerabilities.critical + asset.vulnerabilities.high;
  const misconfigCount = asset.misconfig.critical + asset.misconfig.high;
  const risk = assetRiskLevel(asset);
  const { Icon, bg, color } = getServiceIcon(asset.service, asset.type);

  const borderColor = riskIndicatorEnabled ? RISK_BORDER[risk] : "rgba(255,255,255,0.07)";
  const boxShadow   = riskIndicatorEnabled ? RISK_GLOW[risk] : "none";

  return (
    <div
      ref={ref}
      data-asset-id={asset.id}
      onClick={() => ref.current && onSelect(asset, ref.current.getBoundingClientRect())}
      style={{
        minWidth: 116, maxWidth: 156,
        background: "#07111f",
        border: `1px solid ${isSelected ? "rgba(87,177,255,0.55)" : borderColor}`,
        boxShadow: isSelected ? "0 0 0 2px rgba(87,177,255,0.25)" : boxShadow,
        borderRadius: 10,
        padding: "10px 11px",
        cursor: "pointer",
        transition: "border-color 150ms, box-shadow 150ms",
        position: "relative",
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLDivElement).style.background = "#0d1e35";
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLDivElement).style.background = "#07111f";
      }}
    >
      {/* Icon row */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 7 }}>
        <div style={{ width: 26, height: 26, borderRadius: 7, background: bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Icon size={13} style={{ color }} />
        </div>
        {riskIndicatorEnabled && risk > 0 && (
          <span style={{ ...RISK_BADGE_STYLE[risk], fontSize: 9, fontWeight: 700, padding: "1px 5px", borderRadius: 4 }}>
            {RISK_LABEL[risk]}
          </span>
        )}
      </div>

      {/* Service name */}
      <div style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.88)", marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={asset.service}>
        {asset.service}
      </div>

      {/* ID subtitle */}
      <div style={{ fontSize: 9, color: "rgba(255,255,255,0.32)", marginBottom: 8, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
        {asset.id}
      </div>

      {/* Counts */}
      <div style={{ display: "flex", gap: 8, fontSize: 10 }}>
        <span style={{ color: vulnCount > 0 ? "#fb923c" : "rgba(255,255,255,0.25)" }}>
          ▲ {vulnCount}
        </span>
        <span style={{ color: misconfigCount > 0 ? "#facc15" : "rgba(255,255,255,0.25)" }}>
          ◆ {misconfigCount}
        </span>
      </div>
    </div>
  );
}
