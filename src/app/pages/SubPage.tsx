import { useNavigate } from "react-router";
import { ArrowLeft, Activity, Shield, AlertTriangle, TrendingUp, Clock, CheckCircle2 } from "lucide-react";
import { colors } from "../shared/design-system/tokens";

const stats = [
  { label: "Active Threats", value: "12", change: "+3", icon: AlertTriangle, color: "#EF4444" },
  { label: "Agents Online", value: "5/5", change: "100%", icon: Activity, color: "#00A46E" },
  { label: "Tasks Completed", value: "47", change: "+8", icon: CheckCircle2, color: colors.accent },
  { label: "Avg Response Time", value: "1.2s", change: "-0.3s", icon: Clock, color: "#F59E0B" },
];

const recentEvents = [
  { time: "2 min ago", event: "Agent Alpha completed vulnerability scan on prod-server-01", severity: "info" },
  { time: "5 min ago", event: "Agent Bravo detected anomalous login pattern from 192.168.1.45", severity: "warning" },
  { time: "8 min ago", event: "Agent Charlie blocked brute-force attempt on SSH endpoint", severity: "critical" },
  { time: "12 min ago", event: "Agent Delta updated threat intelligence database (v2.4.1)", severity: "info" },
  { time: "15 min ago", event: "Agent Echo completed compliance check - 3 findings", severity: "warning" },
  { time: "22 min ago", event: "Manager escalated case #1847 to Asset Intelligence Analyst queue", severity: "info" },
];

const severityColors: Record<string, string> = {
  info: colors.accent,
  warning: colors.warning,
  critical: "#EF4444",
};

export default function SubPage() {
  const navigate = useNavigate();

  return (
    <div className="relative flex-1 overflow-auto" style={{ backgroundColor: colors.bgApp }}>
      <div className="max-w-[1200px] mx-auto p-8">
        {/* Back button */}
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 mb-8 transition-colors cursor-pointer"
          style={{ color: colors.accent }}
          onMouseEnter={e => { e.currentTarget.style.color = colors.textSecondary; }}
          onMouseLeave={e => { e.currentTarget.style.color = colors.accent; }}
        >
          <ArrowLeft size={16} />
          <span className="text-[13px]">Back to Watch Center</span>
        </button>

        {/* Page header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 rounded-lg bg-[#14A2E320] border border-[#14A2E330]">
            <TrendingUp size={20} color="#14A2E3" />
          </div>
          <div>
            <h1 style={{ color: colors.textSecondary }} className="tracking-[-0.5px] text-[22px]">Operations Overview</h1>
            <p style={{ color: colors.textDim }} className="text-[13px]">Detailed metrics and recent activity from all agents</p>
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="relative p-5 rounded-xl overflow-hidden"
              >
                <div
                  aria-hidden="true"
                  className="absolute inset-0 pointer-events-none rounded-xl"
                  style={{
                    border: "1px solid transparent",
                    background:
                      "linear-gradient(134.825deg, #030708 0%, #000000 35.132%, #000000 65.097%, #030708 90.93%) padding-box, linear-gradient(134.825deg, #030609 0%, #57B1FF1F 100%) border-box",
                  }}
                />
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-3">
                    <Icon size={18} color={stat.color} />
                    <span className="text-[11px]" style={{ color: colors.active }}>{stat.change}</span>
                  </div>
                  <div style={{ color: colors.textSecondary }} className="text-[24px] mb-1">{stat.value}</div>
                  <div style={{ color: colors.textDim }} className="text-[12px] uppercase tracking-[0.4px]">{stat.label}</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Recent events */}
        <div className="relative rounded-xl overflow-hidden">
          <div
            aria-hidden="true"
            className="absolute inset-0 pointer-events-none rounded-xl"
            style={{
              border: "1px solid transparent",
              background:
                "linear-gradient(134.825deg, #030708 0%, #000000 35.132%, #000000 65.097%, #030708 90.93%) padding-box, linear-gradient(134.825deg, #030609 0%, #57B1FF1F 100%) border-box",
            }}
          />
          <div className="relative z-10 p-5">
            <h2 style={{ color: colors.textMuted }} className="text-[12px] uppercase tracking-[0.4px] mb-4">
              Recent Activity
            </h2>
            <div className="flex flex-col gap-3">
              {recentEvents.map((event, i) => (
                <div key={i} className="flex items-start gap-3 py-2 last:border-0" style={{ borderBottom: `1px solid ${colors.divider}` }}>
                  <div
                    className="w-2 h-2 rounded-full mt-1.5 shrink-0"
                    style={{ background: severityColors[event.severity] }}
                  />
                  <div className="flex-1 min-w-0">
                    <p style={{ color: colors.textSecondary }} className="text-[13px] leading-[1.5]">{event.event}</p>
                  </div>
                  <span style={{ color: colors.textDim }} className="text-[11px] whitespace-nowrap shrink-0">{event.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}