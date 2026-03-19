import React from "react";

// ── Activity Feed Data ────────────────────────────────────────────────────

interface ActivityEvent {
  id: number;
  timestamp: string;
  analyst: string;
  action: string;
  color: string;
}

const ANALYST_COLORS: Record<string, string> = {
  "Asset Intelligence": "#57b1ff",        // blue  — inventory / discovery
  "Configuration Security": "#7ecfae",    // teal  — policy / hardening
  "Application Security": "#a78bfa",      // violet — code / supply chain
  "Exposure": "#f87171",                  // soft red — attack surface
  "Risk Intelligence": "#f0a040",         // amber — scoring / correlation
  "Governance & Compliance": "#FF5757",   // red   — compliance / remediation
  "Identity Security": "#e8914a",         // orange — IAM / privilege
  "Vulnerability": "#fb923c",             // orange-red — CVE / patch
};

const ACTIVITY_POOL: { analyst: string; action: string }[] = [
  { analyst: "Asset Intelligence", action: "discovered new assets on dmz-segment-04" },
  { analyst: "Configuration Security", action: "detected misconfiguration on web-node-07" },
  { analyst: "Exposure", action: "identified attack path to finance-db-01" },
  { analyst: "Risk Intelligence", action: "updated risk score for finance-segment" },
  { analyst: "Governance & Compliance", action: "initiated remediation workflow" },
  { analyst: "Vulnerability", action: "validated CVE-2026-1847 on prod-db-03" },
  { analyst: "Identity Security", action: "detected anomalous privilege escalation" },
  { analyst: "Application Security", action: "scanned container images for vulnerabilities" },
  { analyst: "Asset Intelligence", action: "mapped asset dependencies in cloud-vpc-02" },
  { analyst: "Risk Intelligence", action: "correlated threat signals across endpoints" },
  { analyst: "Configuration Security", action: "audited security policy on iam-core-01" },
  { analyst: "Exposure", action: "reassessed external attack surface" },
  { analyst: "Vulnerability", action: "synchronized remediation status" },
  { analyst: "Identity Security", action: "enforced MFA policy for admin-group-02" },
  { analyst: "Governance & Compliance", action: "recalculated compliance posture" },
  { analyst: "Application Security", action: "reviewed dependency tree on ui-app-09" },
  { analyst: "Asset Intelligence", action: "indexed cloud resources in aws-prod" },
  { analyst: "Risk Intelligence", action: "aggregated risk posture metrics" },
  { analyst: "Configuration Security", action: "verified hardening rules on corp-endpoint-17" },
  { analyst: "Exposure", action: "simulated breach scenario on api-edge-02" },
  { analyst: "Vulnerability", action: "prioritized patch cycle for critical CVEs" },
  { analyst: "Identity Security", action: "reviewed service account permissions" },
  { analyst: "Governance & Compliance", action: "tracked approval lifecycle for vendor-17" },
  { analyst: "Application Security", action: "enriched phishing evidence for hr-mailbox-02" },
];

function formatTime(date: Date): string {
  return date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });
}

function useActivityFeed(maxVisible = 50) {
  const [events, setEvents] = React.useState<ActivityEvent[]>(() => {
    const now = Date.now();
    const seed: ActivityEvent[] = [];
    for (let i = 4; i >= 0; i--) {
      const entry = ACTIVITY_POOL[i % ACTIVITY_POOL.length];
      seed.push({
        id: i,
        timestamp: formatTime(new Date(now - i * 120_000)),
        analyst: entry.analyst,
        action: entry.action,
        color: ANALYST_COLORS[entry.analyst] || "#DADFE3",
      });
    }
    return seed;
  });

  const nextId = React.useRef(5);
  const poolIndex = React.useRef(5);

  React.useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    const schedule = () => {
      const delay = 8000 + Math.random() * 10000;
      timeout = setTimeout(() => {
        const entry = ACTIVITY_POOL[poolIndex.current % ACTIVITY_POOL.length];
        poolIndex.current++;
        const newEvent: ActivityEvent = {
          id: nextId.current++,
          timestamp: formatTime(new Date()),
          analyst: entry.analyst,
          action: entry.action,
          color: ANALYST_COLORS[entry.analyst] || "#DADFE3",
        };
        setEvents((prev) => {
          const next = [...prev, newEvent];
          return next.length > maxVisible ? next.slice(-maxVisible) : next;
        });
        schedule();
      }, delay);
    };
    schedule();
    return () => clearTimeout(timeout);
  }, [maxVisible]);

  return events;
}

// ── Components ────────────────────────────────────────────────────────────

function EventRow({ event, isNew }: { event: ActivityEvent; isNew: boolean }) {
  return (
    <div
      className="flex gap-[12px] items-baseline w-full"
      style={{
        animation: isNew ? "activitySlideIn 0.5s ease both" : undefined,
      }}
    >
      <span
        className="font-['IBM_Plex_Mono:Regular',sans-serif] text-[10px] shrink-0 tabular-nums"
        style={{ color: "rgba(137,148,158,0.65)", minWidth: 30 }}
      >
        {event.timestamp}
      </span>
      <div className="flex-1 min-w-0 leading-[1.4]">
        <span
          className="font-['IBM_Plex_Mono:Medium',sans-serif] font-medium text-[10px]"
          style={{ color: event.color }}
        >
          {event.analyst}
        </span>
        <span className="font-['IBM_Plex_Mono:Regular',sans-serif] text-[10px] text-[#7e8e9e]">
          {" "}{event.action}
        </span>
      </div>
    </div>
  );
}

export default function ActivityFeed() {
  const events = useActivityFeed();
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const prevCountRef = React.useRef(events.length);

  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: events.length > prevCountRef.current ? "smooth" : "auto",
      });
    }
    prevCountRef.current = events.length;
  }, [events.length]);

  return (
    <div className="relative rounded-[12px] w-full flex-1 min-h-[140px] overflow-hidden" data-name="ActivityFeed">
      <div className="content-stretch flex flex-col items-start overflow-hidden p-px relative rounded-[inherit] size-full bg-[rgba(8,18,30,0.80)]">
        <div className="flex-1 min-h-0 relative w-full">
          <div className="absolute inset-0 flex flex-col gap-[8px] items-start pt-[12px] px-[14px] pb-[6px]">
            {/* Header */}
            <div className="flex gap-[8px] items-center justify-between shrink-0 w-full">
              <div className="flex gap-[8px] items-center">
                <div className="bg-[#00a46e] rounded-full shrink-0 size-[4px] animate-[blink_2s_ease-in-out_infinite]" />
                <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[normal] not-italic shrink-0 text-[#dadfe3] text-[12px] tracking-[0.4px] uppercase whitespace-nowrap">
                  Activity Feed
                </p>
              </div>
              <span className="text-[10px] text-[#4a5f72] font-['Inter:Regular',sans-serif] tabular-nums shrink-0">
                {events.length} events
              </span>
            </div>
            {/* Separator */}
            <div className="h-0 relative shrink-0 w-full">
              <div className="absolute inset-[-0.5px_0]">
                <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 272 1">
                  <path d="M0 0.5H272" stroke="rgba(87,177,255,0.09)" />
                </svg>
              </div>
            </div>
            {/* Scrollable feed */}
            <div
              ref={scrollRef}
              className="flex-1 min-h-0 overflow-y-auto w-full"
              style={{
                maskImage: "linear-gradient(to bottom, transparent 0%, black 8%, black 90%, transparent 100%)",
                WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, black 8%, black 90%, transparent 100%)",
              }}
            >
              <div className="flex flex-col gap-[8px] py-[4px]">
                {events.map((event, i) => (
                  <EventRow
                    key={event.id}
                    event={event}
                    isNew={i === events.length - 1 && events.length > 5}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div
        aria-hidden="true"
        className="absolute border border-[rgba(87,177,255,0.16)] border-solid inset-0 pointer-events-none rounded-[12px]"
      />
    </div>
  );
}